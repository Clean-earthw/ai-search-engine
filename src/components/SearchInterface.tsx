// app/page.tsx
'use client'

import { useSearch } from '@/hooks/useSearch'
import { SearchBox } from '@/components/SearchBox'
import { ResponsePanel } from '@/components/ResponsePanel'
import { SearchResults } from '@/components/SearchResults'
import { ControlPanel } from '@/components/ControlPanel'
import { RelatedQuestionsPanel } from '@/components/RelatedQuestionPanel'

export default function SearchInterface() {
  const {
    query,
    results,
    llmResponse,
    relatedQuestions,
    isSearching,
    selectedSources,
    useLLMKnowledge,
    numSources,
    expandedPanel,
    labSources,
    useChunk,
    error,
    clearError,
    search,
    updateSources,
    updateNumSources,
    toggleLLMKnowledge,
    togglePanel,
    toggleChunk,
    searchRelatedQuestion
  } = useSearch()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AI Search Engine
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Intelligent search powered by Gemini AI
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Search Controls */}
      <div className="fixed top-20 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Box */}
            <div className="flex-1 max-w-2xl">
              <SearchBox 
                onSearch={search} 
                isLoading={isSearching} 
                error={error}
                onClearError={clearError}
              />
            </div>
            
            {/* Quick Controls */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 font-medium">Sources:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                  {numSources}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 font-medium">Web Search:</span>
                <button
                  onClick={toggleLLMKnowledge}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useLLMKnowledge ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useLLMKnowledge ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Scrollable Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Fixed Control Panel */}
          <div className="xl:col-span-1">
            <div className="sticky top-32 space-y-6">
              <ControlPanel
                labSources={labSources}
                selectedSources={selectedSources}
                onSourcesChange={updateSources}
                useLLMKnowledge={useLLMKnowledge}
                onLLMKnowledgeToggle={toggleLLMKnowledge}
                numSources={numSources}
                onNumSourcesChange={updateNumSources}
                useChunk={useChunk}
                onToggleChunk={toggleChunk}
              />
              
              {/* Related Questions Side Container */}
              {relatedQuestions.length > 0 && (
                <RelatedQuestionsPanel
                  questions={relatedQuestions}
                  onQuestionClick={searchRelatedQuestion}
                  isLoading={isSearching}
                />
              )}
            </div>
          </div>

          {/* Scrollable Results Area */}
          <div className="xl:col-span-3 space-y-6">
            <ResponsePanel
              response={llmResponse}
              relatedQuestions={[]} // Empty since we moved to side container
              isGenerating={isSearching}
              expanded={expandedPanel}
              onToggle={togglePanel}
              sources={results.slice(0, numSources).map(r => r.title)}
              usedKnowledge={useLLMKnowledge}
              onRelatedQuestionClick={searchRelatedQuestion}
            />
            
            <SearchResults
              results={results}
              isLoading={isSearching}
            />
          </div>
        </div>
      </main>
    </div>
  )
}