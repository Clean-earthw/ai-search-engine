// lib/agents/query-enhancer.ts
import { generateText } from 'ai';
import { getModel } from '../utils/registry';

export async function enhanceQuery(
  originalQuery: string,
  model: string = 'gemini-2.5-flash'
): Promise<string> {
  try {
    const result = await generateText({
      model: getModel(model),
      system: `You are a search query optimization expert. Enhance search queries for better information retrieval while maintaining the original intent. Return ONLY the enhanced query.`,
      prompt: `Enhance this search query: "${originalQuery}"`
    });

    return result.text.trim() || originalQuery;
  } catch (error) {
    console.error('Error enhancing query:', error);
    return originalQuery;
  }
}