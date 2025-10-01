// app/api/search/route.ts
import { NextResponse } from "next/server";
import { Client } from "@elastic/elasticsearch";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, generateObject, streamText } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Schema for web search results
const WebSearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  source: z.string(),
  relevance_score: z.number().min(0).max(10),
});

const WebSearchResponseSchema = z.object({
  results: z.array(WebSearchResultSchema),
  total: z.number(),
  query: z.string(),
});

export async function POST(request: Request) {
  try {
    const { query, apiKey, apiUrl, selectedSources = [], numSources = 10, useSemantic = true } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 }
      );
    }

    console.log("🔍 Starting enhanced search for:", query);

    // Step 1: Use Gemini to search the web and get high-quality results
    let webSearchResults: any[] = [];
    let enhancedQuery = query;

    try {
      console.log("🌐 Performing web search with Gemini...");
      
      // First, enhance the query for better search
      const { text: queryEnhancement } = await generateText({
        model: google("gemini-2.5-flash"),
        system: "You are a search query optimization expert. Enhance search queries for better web search results while maintaining the original intent.",
        prompt: `Enhance this search query for better web search: "${query}"\n\nReturn ONLY the enhanced query.`
      });
      
      enhancedQuery = queryEnhancement.trim() || query;
      console.log("🎯 Enhanced query:", enhancedQuery);

      // Perform web search using Gemini's search tool
      const searchPrompt = `Search the web for comprehensive, credible information about: "${enhancedQuery}"
      
      Focus on finding:
      - Recent and authoritative sources
      - Academic papers and research
      - Industry reports and whitepapers
      - Reputable news articles
      - Official documentation and guides
      
      Return a comprehensive set of high-quality results.`;

      const { text: rawSearchData } = await generateText({
        model: google("gemini-2.5-flash"),
        tools: {
          google_search: google.tools.googleSearch({}),
        },
        prompt: searchPrompt,
      });

      // Structure the web search results
      const { object: structuredWebResults } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: WebSearchResponseSchema,
        prompt: `Transform these web search results into structured data:
        
        Query: "${enhancedQuery}"
        Raw Results: ${rawSearchData}
        
        Extract the most relevant and authoritative sources. Focus on credibility and relevance.`,
      });

      webSearchResults = structuredWebResults.results.slice(0, 15); // Get top 15 results
      console.log(`✅ Found ${webSearchResults.length} web search results`);

    } catch (webSearchError) {
      console.error("⚠️ Web search failed:", webSearchError);
      // Continue with Elasticsearch-only approach
    }

    // Step 2: Store best web results in Elasticsearch (if we have any)
    let storedResults: any[] = [];
    if (webSearchResults.length > 0 && apiKey && apiUrl) {
      try {
        const esClient = new Client({
          node: apiUrl,
          auth: { apiKey },
        });

        // Check if index exists, create if not
        const indexName = "ai-search-results";
        const indexExists = await esClient.indices.exists({ index: indexName });
        
        if (!indexExists) {
          await esClient.indices.create({
            index: indexName,
            body: {
              mappings: {
                properties: {
                  title: { type: "text", fields: { keyword: { type: "keyword" } } },
                  content: { type: "text" },
                  url: { type: "keyword" },
                  source: { type: "keyword" },
                  query: { type: "keyword" },
                  relevance_score: { type: "float" },
                  timestamp: { type: "date" },
                  embeddings: { 
                    type: "dense_vector",
                    dims: 768, // Adjust based on your embedding model
                    index: true,
                    similarity: "cosine"
                  }
                }
              }
            }
          });
        }

        // Store web search results in Elasticsearch
        const operations = webSearchResults.flatMap((result, index) => [
          { index: { _index: indexName } },
          {
            title: result.title,
            content: result.snippet,
            url: result.url,
            source: result.source,
            query: enhancedQuery,
            relevance_score: result.relevance_score,
            timestamp: new Date().toISOString(),
            // In a real implementation, you'd generate embeddings here
            embeddings: Array(768).fill(0).map(() => Math.random()) // Placeholder
          }
        ]);

        await esClient.bulk({ refresh: true, body: operations });
        console.log("💾 Stored web results in Elasticsearch");

        // Search Elasticsearch for combined results
        const esQuery = {
          size: numSources,
          query: {
            bool: {
              should: [
                {
                  multi_match: {
                    query: enhancedQuery,
                    fields: ["title^3", "content^2", "source"],
                    fuzziness: "AUTO"
                  }
                },
                {
                  terms: {
                    query: [enhancedQuery, query]
                  }
                }
              ]
            }
          },
          sort: [
            { relevance_score: { order: "desc" } },
            { _score: { order: "desc" } }
          ]
        };

        const esResponse = await esClient.search({
          index: indexName,
          body: esQuery
        });

        storedResults = esResponse.hits.hits.map((hit: any) => ({
          id: hit._id,
          title: hit._source.title,
          content: hit._source.content,
          url: hit._source.url,
          source: hit._source.source,
          score: hit._score,
          relevance_score: hit._source.relevance_score,
          isStored: true
        }));

        console.log(`📚 Found ${storedResults.length} stored results`);

      } catch (esError) {
        console.error("⚠️ Elasticsearch operation failed:", esError);
      }
    }

    // Step 3: Combine results and generate AI response
    const allResults = [...storedResults, ...webSearchResults.map((r, i) => ({
      id: `web-${i}`,
      title: r.title,
      content: r.snippet,
      url: r.url,
      source: r.source,
      score: r.relevance_score / 10, // Normalize to 0-1
      relevance_score: r.relevance_score,
      isStored: false
    }))];

    // Sort by relevance score
    allResults.sort((a, b) => (b.relevance_score || b.score) - (a.relevance_score || a.score));
    const topResults = allResults.slice(0, numSources);

    // Step 4: Generate comprehensive AI response
    console.log("🤖 Generating AI response...");
    
    const contextText = topResults.map((result, index) => 
      `[Source ${index + 1}] ${result.title}\nURL: ${result.url}\nContent: ${result.content}`
    ).join('\n\n');

    const responsePrompt = `Based on the following search results for "${enhancedQuery}", provide a comprehensive, well-structured answer.

Search Results:
${contextText}

Instructions:
1. Provide a thorough summary of the key information
2. Cite specific sources using [Source X] notation
3. Highlight the most important findings
4. Mention any conflicting information if present
5. Suggest areas for further research if relevant
6. Keep the response informative but concise

Answer:`;

    // Generate streaming response
    const stream = await streamText({
      model: google("gemini-2.5-flash"),
      prompt: responsePrompt,
    });

    // Convert stream to text (for simplicity, in production you might want to stream)
    let llmResponse = "";
    for await (const chunk of stream.textStream) {
      llmResponse += chunk;
    }

    // Step 5: Generate related questions
    console.log("❓ Generating related questions...");
    const RelatedQuestionsSchema = z.object({
      questions: z.array(z.string()).length(3)
    });

    let relatedQuestions: string[] = [];
    try {
      const { object: relatedResult } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: RelatedQuestionsSchema,
        prompt: `Based on the search query "${enhancedQuery}" and the context provided, generate 3 insightful follow-up questions that explore related aspects or deeper implications.`
      });
      relatedQuestions = relatedResult.questions;
    } catch (error) {
      relatedQuestions = [
        "What are the key trends in this area?",
        "How is this technology being applied in practice?",
        "What are the main challenges and opportunities?"
      ];
    }

    // Step 6: Prepare final response
    const finalResults = topResults.map((result, index) => ({
      id: result.id,
      title: result.title,
      url: result.url,
      content: result.content,
      highlight: result.content.substring(0, 200) + "...",
      score: result.score,
      source: result.source,
      relevance_score: result.relevance_score,
      isStored: result.isStored
    }));

    // Extract unique sources for filtering
    const uniqueSources = Array.from(new Set(topResults.map(r => r.source))).map((source, index) => ({
      id: index + 1,
      text: source,
      checked: true
    }));

    console.log(`🎉 Search completed: ${finalResults.length} results, ${llmResponse.length} chars response`);

    return NextResponse.json({
      success: true,
      results: finalResults,
      labSources: uniqueSources,
      relatedQuestions,
      llmResponse,
      enhancedQuery,
      total: finalResults.length,
      sources: {
        web: webSearchResults.length,
        stored: storedResults.length,
        total: finalResults.length
      }
    });

  } catch (error: any) {
    console.error("❌ Search error:", error);
    return NextResponse.json(
      { 
        error: "Search failed", 
        details: error.message,
        suggestion: "Please check your API keys and try again."
      },
      { status: 500 }
    );
  }
}