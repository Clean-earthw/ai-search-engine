// lib/utils/registry.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Safe initialization that won't crash the app
let googleInstance: ReturnType<typeof createGoogleGenerativeAI> | null = null;

export function getGoogleAI() {
  if (!googleInstance) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Please add it to your environment variables.');
      // Return a mock that will throw meaningful errors when used
      googleInstance = createGoogleGenerativeAI({ 
        apiKey: 'dummy-key-for-initialization' 
      });
    } else {
      googleInstance = createGoogleGenerativeAI({ apiKey });
    }
  }
  return googleInstance;
}

export function getModel(model: string = 'gemini-2.5-flash') {
  const google = getGoogleAI();
  return google(model);
}