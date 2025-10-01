// lib/agents/response-generator.ts
import { generateText } from 'ai';
import { getModel } from '../utils/registry';
import { SearchResult,LLMResponse } from '@/types/search';

export async function generateResponse(
  query: string,
  context: SearchResult[],
  options: {
    useKnowledge?: boolean;
    maxSources?: number;
  } = {}
): Promise<LLMResponse> {
  const { useKnowledge = false, maxSources = 5 } = options;

  const startTime = Date.now();
  
  try {
    const contextText = context
      .slice(0, maxSources)
      .map((doc, index) => `[Source ${index + 1}] ${doc.title}\nContent: ${doc.highlight}`)
      .join('\n\n');

    const sources = context.slice(0, maxSources).map(doc => doc.title);

    const knowledgeInstruction = useKnowledge 
      ? 'If the search results are insufficient, you may carefully supplement with general knowledge, but clearly indicate this.'
      : 'Strictly use only the provided search results. Do not use any external knowledge.';

    const prompt = `
Answer the following query based on the provided search results.

Query: ${query}

Search Results:
${contextText}

Instructions:
- Provide a comprehensive answer based on the search results
- ${knowledgeInstruction}
- Cite sources using [Source X] notation
- Be concise but thorough
- Acknowledge any conflicting information

Answer:
`.trim();

    const result = await generateText({
      model: getModel('gemini-2.5-flash'),
      prompt
    });

    return {
      response: result.text,
      sources,
      used_knowledge: useKnowledge && !isFullyGrounded(result.text, contextText),
      processing_time: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate AI response');
  }
}

function isFullyGrounded(response: string, context: string): boolean {
  const contextKeywords = context.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  const responseWords = response.toLowerCase().split(/\s+/);
  
  const matchingKeywords = responseWords.filter(word => 
    contextKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))
  );
  
  return matchingKeywords.length / responseWords.length > 0.3;
}