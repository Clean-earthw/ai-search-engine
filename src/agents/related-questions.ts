// lib/agents/related-questions.ts
import { generateObject } from 'ai';
import { relatedSchema } from '@/lib/schema/related';
import { getModel } from '../utils/registry';

export async function generateRelatedQuestions(
  query: string,
  searchContext: string,
  model: string = 'gemini-2.5-flash'
) {
  try {
    const result = await generateObject({
      model: getModel(model),
      system: `As a professional web researcher, generate three follow-up queries that explore the subject matter more deeply. Build upon the initial query and search results to create queries that delve into specific aspects, implications, or adjacent topics. Match the language of the original query.`,
      prompt: `Original query: "${query}"
      
Search results context: ${searchContext}

Generate three related questions that would help explore this topic further:`,
      schema: relatedSchema
    });

    return result;
  } catch (error) {
    console.error('Error generating related questions:', error);
    // Return fallback questions
    return {
      object: {
        questions: [
          "What are the main aspects of this topic?",
          "How does this relate to current developments?",
          "What should I consider when exploring this further?"
        ]
      }
    };
  }
}