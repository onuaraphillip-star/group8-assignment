import { useState, useEffect } from 'react';
import { BarChart3, Trophy, GitCompare, Clock, Layers, Zap } from 'lucide-react';
import { usePlannerStore } from '../../store';

interface PlanRun {
  id: string;
  algorithm: string;
  heuristic: string;
  planLength: number;
  nodesExpanded: number;
  nodesGenerated: number;
  searchTimeMs: number;
}

export function PlanComparison() {
  const { result, algorithm, heuristic } = usePlannerStore();
  const [history, setHistory] = useState<PlanRun[]>([]);

  // Add current result to history when it changes
  useEffect(() => {
    if (result?.success && result.metrics) {
      const newRun: PlanRun = {
        id: Date.now().toString(),
        algorithm,
        heuristic,
        planLength: result.metrics.plan_length,
        nodesExpanded: result.metrics.nodes_expanded,
        nodesGenerated: result.metrics.nodes_generated,
        searchTimeMs: result.metrics.search_time_ms,
      };
      
      setHistory(prev => {
        // Only add if different from last run
        const last = prev[prev.length - 1];
        if (last && 
            last.algorithm === newRun.algorithm && 
            last.heuristic === newRun.heuristic &&
            last.planLength === newRun.planLength) {
          return prev;
        }
        return [...prev.slice(-9), newRun]; // Keep last 10 runs
      });
    }
  }, [result, algorithm, heuristic]);

  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
        <GitCompare className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">No Comparisons Yet</p>
        <p className="text-sm text-gray-400 mt-2">Run multiple algorithms to compare their performance</p>
      </div>
    );
  }

  const bestPlanLength = Math.min(...history.map(h => h.planLength));
  const bestTime = Math.min(...history.map(h => h.searchTimeMs));
  const bestNodes = Math.min(...history.map(h => h.nodesExpanded));

  // Calculate averages
  const avgPlanLength = history.reduce((sum, h) => sum + h.planLength, 0) / history.length;
  const avgTime = history.reduce((sum, h) => sum + h.searchTimeMs, 0) / history.length;
  const avgNodes = history.reduce((sum, h) => sum + h.nodesExpanded, 0) / history.length;

  return (
    <div className="h-full flex flex-col bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Plan Comparison</h2>
          <p className="text-sm text-gray-500">Compare performance across different algorithms</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
            {history.length} runs
          </span>
          <button
            onClick={() => setHistory([])}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-full border border-red-200 transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Layers className="w-4 h-4" />
            <span className="text-sm">Best Plan Length</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{bestPlanLength}</div>
          <div className="text-xs text-gray-400 mt-1">Avg: {avgPlanLength.toFixed(1)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Best Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{(bestTime / 1000).toFixed(2)}s</div>
          <div className="text-xs text-gray-400 mt-1">Avg: {(avgTime / 1000).toFixed(2)}s</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Best Nodes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{bestNodes.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">Avg: {Math.round(avgNodes).toLocaleString()}</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-0">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Run History
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Algorithm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heuristic</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Length</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nodes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...history].reverse().map((run, idx) => (
                <tr 
                  key={run.id}
                  className={idx === 0 ? 'bg-primary-50/50' : 'hover:bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{run.algorithm.toUpperCase()}</span>
                      {run.planLength === bestPlanLength && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                          <Trophy className="w-3 h-3" />
                          Best
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {run.heuristic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`font-semibold ${run.planLength === bestPlanLength ? 'text-green-600' : 'text-gray-900'}`}>
                      {run.planLength}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`font-semibold ${run.searchTimeMs === bestTime ? 'text-green-600' : 'text-gray-900'}`}>
                      {(run.searchTimeMs / 1000).toFixed(2)}s
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`font-semibold ${run.nodesExpanded === bestNodes ? 'text-green-600' : 'text-gray-900'}`}>
                      {run.nodesExpanded.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
