// components/ResponsePanel.tsx
import { ChevronDown, ChevronUp, Brain, Loader2, MessageSquare, Sparkles, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ResponsePanelProps {
  response: string
  relatedQuestions: string[]
  isGenerating: boolean
  expanded: boolean
  onToggle: () => void
  sources: string[]
  usedKnowledge: boolean
  onRelatedQuestionClick: (question: string) => void
}

export function ResponsePanel({
  response,
  relatedQuestions,
  isGenerating,
  expanded,
  onToggle,
  sources,
  usedKnowledge,
  onRelatedQuestionClick
}: ResponsePanelProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const formatResponse = (text: string) => {
    // Remove markdown headers and bullet points, clean up the text
    const cleanText = text
      .replace(/###\s+/g, '') // Remove ### headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\* /g, '• ') // Convert * to • for better visual
      .replace(/\[Source (\d+)\]/g, 'Source $1:') // Clean source references
      .split('\n')
      .filter(line => line.trim().length > 0) // Remove empty lines

    return cleanText.map((line, index) => {
      if (line.trim().startsWith('•')) {
        return (
          <div key={index} className="flex items-start space-x-3 py-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-gray-700 flex-1">{line.replace(/^•\s*/, '')}</span>
          </div>
        )
      }
      
      // Check if this looks like a section header (short line, ends with colon, or is all caps)
      const isSectionHeader = line.length < 60 && (line.endsWith(':') || /^[A-Z\s]+$/.test(line))
      
      if (isSectionHeader) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0 border-b border-gray-200 pb-2">
            {line.replace(':', '')}
          </h3>
        )
      }

      return (
        <p key={index} className="py-2 text-gray-700 leading-relaxed">
          {line}
        </p>
      )
    })
  }

  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 transition-all duration-300 ${
      expanded ? 'flex-1' : 'max-h-96'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Insights
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Intelligent analysis based on search results
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {response && !isGenerating && (
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            )}
            
            {usedKnowledge && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full">
                <Brain className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Enhanced with Web Search</span>
              </div>
            )}
            
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors group"
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className={`p-6 overflow-auto ${expanded ? 'max-h-[calc(100vh-300px)]' : 'max-h-64'}`}>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Results</h3>
            <p className="text-gray-600 text-center max-w-sm">
              Searching through sources and generating intelligent insights...
            </p>
          </div>
        ) : response ? (
          <div className="space-y-6">
            {/* Main Response */}
            <div className="max-w-none">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6">
                <div className="text-gray-700 leading-relaxed">
                  {formatResponse(response)}
                </div>
              </div>
            </div>
            
            {/* Sources */}
            {sources.length > 0 && (
              <div className="border-t border-gray-200/50 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Based on Sources</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {sources.map((source, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white border border-gray-200/50 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 text-sm">{source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Search</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter a search query above to get AI-powered insights and comprehensive results from authoritative sources.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}