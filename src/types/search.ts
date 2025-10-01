// types/search.ts
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  content: string;
  highlight: string;
  score: number;
  source: string;
  relevance_score?: number;
  isStored?: boolean;
  prompt_context?: string;
  citations?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  labSources: Array<{ id: number; text: string; checked: boolean }>;
  total: number;
  relatedQuestions?: string[];
  llmResponse?: string;
  enhancedQuery?: string;
  sources?: {
    web: number;
    stored: number;
    total: number;
  };
}

export interface LLMResponse {
  response: string;
  sources: string[];
  used_knowledge: boolean;
  processing_time: number;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  llmResponse: string;
  relatedQuestions: string[];
  isSearching: boolean;
  isGenerating: boolean;
  selectedSources: string[];
  useLLMKnowledge: boolean;
  numSources: number;
  expandedPanel: boolean;
  labSources: Array<{ id: number; text: string; checked: boolean }>;
  useChunk: boolean;
}

export interface AggregationBucket {
  key: string;
  doc_count: number;
}