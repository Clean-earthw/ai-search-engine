// hooks/useSearch.ts
import { useState, useCallback } from 'react';
import { SearchState, SearchResult } from '@/types/search';

export function useSearch() {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    llmResponse: '',
    relatedQuestions: [],
    isSearching: false,
    isGenerating: false,
    selectedSources: [],
    useLLMKnowledge: true,
    numSources: 10, // Default to 10 sources
    expandedPanel: false,
    labSources: [],
    useChunk: true
  });

  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setError(null);
    setState(prev => ({ 
      ...prev, 
      isSearching: true, 
      query,
      relatedQuestions: [],
      llmResponse: ''
    }));

    try {
      const apiKey = process.env.NEXT_PUBLIC_ELASTICSEARCH_API_KEY;
      const apiUrl = process.env.NEXT_PUBLIC_ELASTICSEARCH_URL;

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          apiKey,
          apiUrl,
          selectedSources: state.selectedSources,
          numSources: state.numSources,
          useSemantic: state.useChunk
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || `Search failed with status ${response.status}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setState(prev => ({
        ...prev,
        results: data.results || [],
        labSources: data.labSources || [],
        relatedQuestions: data.relatedQuestions || [],
        llmResponse: data.llmResponse || '',
        isSearching: false
      }));

    } catch (error) {
      console.error('❌ Search error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      setState(prev => ({ 
        ...prev, 
        isSearching: false,
        results: [],
        llmResponse: `Search error: ${errorMessage}. Please try again.`
      }));
    }
  }, [state.selectedSources, state.numSources, state.useChunk]);

  const updateSources = useCallback((sources: string[]) => {
    setState(prev => ({ ...prev, selectedSources: sources }));
  }, []);

  const updateNumSources = useCallback((num: number) => {
    setState(prev => ({ ...prev, numSources: Math.max(5, Math.min(20, num)) })); // 5-20 range
  }, []);

  const toggleLLMKnowledge = useCallback(() => {
    setState(prev => ({ ...prev, useLLMKnowledge: !prev.useLLMKnowledge }));
  }, []);

  const togglePanel = useCallback(() => {
    setState(prev => ({ ...prev, expandedPanel: !prev.expandedPanel }));
  }, []);

  const toggleChunk = useCallback(() => {
    setState(prev => ({ ...prev, useChunk: !prev.useChunk }));
  }, []);

  const searchRelatedQuestion = useCallback((question: string) => {
    search(question);
  }, [search]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ...state,
    error,
    clearError,
    search,
    updateSources,
    updateNumSources,
    toggleLLMKnowledge,
    togglePanel,
    toggleChunk,
    searchRelatedQuestion
  };
}