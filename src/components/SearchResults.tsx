// components/SearchResults.tsx
import { ExternalLink, Calendar, User, Building } from 'lucide-react'
import { SearchResult } from '@/types/search'

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
}

export function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4 p-4 border border-gray-200/50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No Results Found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Try adjusting your search terms or filters. You can also try more general keywords or check the spelling.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 max-h-[calc(100vh-300px)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Search Results
            </h2>
            <p className="text-gray-600 mt-1">
              Found {results.length} relevant sources
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Sorted by relevance</span>
          </div>
        </div>
      </div>
      
      {/* Scrollable Results List */}
      <div className="flex-1 overflow-auto divide-y divide-gray-200/50">
        {results.map((result, index) => (
          <div key={result.id} className="p-6 hover:bg-white/50 transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                {/* Ranking Badge */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm
                    ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg' : 
                      index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                      'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
                    #{index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {result.title}
                    </h3>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span className="font-medium">{result.source}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <span>Relevance: {(result.score * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-gray-700 leading-relaxed line-clamp-3 mb-4">
                    {result.highlight || result.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {result.relevance_score && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Quality Score: {result.relevance_score}/10</span>
                        </div>
                      )}
                      
                      {result.isStored && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                          <span>Saved in Database</span>
                        </div>
                      )}
                    </div>

                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg group/link"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-medium">Visit Source</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}