// components/ControlPanel.tsx
import { Settings, Database, Brain, FileText } from 'lucide-react';

interface ControlPanelProps {
  labSources: Array<{ id: number; text: string; checked: boolean }>;
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;
  useLLMKnowledge: boolean;
  onLLMKnowledgeToggle: () => void;
  numSources: number;
  onNumSourcesChange: (num: number) => void;
  useChunk: boolean;
  onToggleChunk: () => void;
}

export function ControlPanel({
  labSources,
  selectedSources,
  onSourcesChange,
  useLLMKnowledge,
  onLLMKnowledgeToggle,
  numSources,
  onNumSourcesChange,
  useChunk,
  onToggleChunk
}: ControlPanelProps) {
  const toggleSource = (sourceText: string) => {
    const newSources = selectedSources.includes(sourceText)
      ? selectedSources.filter(s => s !== sourceText)
      : [...selectedSources, sourceText];
    onSourcesChange(newSources);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Settings className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Search Controls</h3>
      </div>

      {/* Source Filtering */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Database className="w-4 h-4 text-gray-600 mr-2" />
          <h4 className="font-medium text-gray-900">Data Sources</h4>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {labSources.map(source => (
            <label key={source.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSources.includes(source.text)}
                onChange={() => toggleSource(source.text)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 flex-1">
                {source.text}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Chunk Toggle */}
      <div className="mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useChunk}
            onChange={onToggleChunk}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-gray-600 mr-2" />
              <span className="font-medium text-gray-900">Use Semantic Chunks</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use semantic search chunks instead of full documents
            </p>
          </div>
        </label>
      </div>

      {/* LLM Knowledge Toggle */}
      <div className="mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useLLMKnowledge}
            onChange={onLLMKnowledgeToggle}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="flex items-center">
              <Brain className="w-4 h-4 text-gray-600 mr-2" />
              <span className="font-medium text-gray-900">Use Web Search</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enhance answers with Google web search
            </p>
          </div>
        </label>
      </div>

      {/* Number of Sources */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">
          Sources to LLM: {numSources}
        </h4>
        <input
          type="range"
          min="1"
          max="10"
          value={numSources}
          onChange={(e) => onNumSourcesChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Fewer (Faster)</span>
          <span>More (Accurate)</span>
        </div>
      </div>
    </div>
  );
}