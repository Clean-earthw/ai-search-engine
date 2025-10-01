// components/SearchBox.tsx
import { useState } from 'react'
import { Search, Loader2, X } from 'lucide-react'

interface SearchBoxProps {
  onSearch: (query: string) => void
  isLoading: boolean
  error: string | null
  onClearError: () => void
}

export function SearchBox({ onSearch, isLoading, error, onClearError }: SearchBoxProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(query)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything..."
            className={`w-full px-6 py-4 text-lg border rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16 ${
              error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-2 flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
            <button
              onClick={onClearError}
              className="text-red-500 hover:text-red-700 transition-colors"
              aria-label="Clear error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  )
}