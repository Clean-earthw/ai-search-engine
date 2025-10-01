// components/RelatedQuestionsPanel.tsx
import { MessageSquare, ArrowRight } from 'lucide-react'

interface RelatedQuestionsPanelProps {
  questions: string[]
  onQuestionClick: (question: string) => void
  isLoading?: boolean
}

export function RelatedQuestionsPanel({ 
  questions, 
  onQuestionClick, 
  isLoading = false 
}: RelatedQuestionsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Related Questions</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return null
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Explore Further
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Related questions to deepen your understanding
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="w-full text-left p-4 bg-gradient-to-r from-white to-gray-50 border border-gray-200/70 rounded-xl hover:border-purple-300 hover:from-purple-50/30 hover:to-pink-50/30 transition-all duration-200 group hover:shadow-md"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-colors flex-shrink-0">
                <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 group-hover:text-purple-700 transition-colors text-left leading-relaxed">
                  {question}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200/50">
        <p className="text-xs text-gray-500 text-center">
          Click any question to explore further
        </p>
      </div>
    </div>
  )
}