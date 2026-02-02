import { useState, useCallback } from 'react';
import { Zap, Trophy, Play, Loader2 } from 'lucide-react';
import { useEditorStore, usePlannerStore } from '../../store';
import { usePlanner } from '../../hooks/usePlanner';
import type { Algorithm, Heuristic } from '../../types/planning';

interface OptimizationConfig {
  algorithm: Algorithm;
  heuristic: Heuristic;
  label: string;
}

const CONFIGS: OptimizationConfig[] = [
  { algorithm: 'greedy', heuristic: 'goal_count', label: 'Greedy (Fast)' },
  { algorithm: 'astar', heuristic: 'goal_count', label: 'A* + Goal Count' },
  { algorithm: 'astar', heuristic: 'h_add', label: 'A* + h_add' },
  { algorithm: 'astar', heuristic: 'h_max', label: 'A* + h_max' },
  { algorithm: 'bfs', heuristic: 'goal_count', label: 'BFS (Optimal)' },
];

interface OptimizationResult {
  config: OptimizationConfig;
  planLength: number;
  nodesExpanded: number;
  searchTimeMs: number;
  success: boolean;
}

export function PlanOptimizer() {
  const { domainPddl, problemPddl } = useEditorStore();
  const { setResult, setLoading } = usePlannerStore();
  const { plan } = usePlanner();
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [progress, setProgress] = useState(0);

  const runOptimization = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    setLoading(true);

    const newResults: OptimizationResult[] = [];

    for (let i = 0; i < CONFIGS.length; i++) {
      const config = CONFIGS[i];
      setProgress(Math.round((i / CONFIGS.length) * 100));

      const startTime = Date.now();
      const result = await plan(
        domainPddl,
        problemPddl,
        config.algorithm,
        config.heuristic,
        10
      );
      const searchTime = Date.now() - startTime;

      newResults.push({
        config,
        planLength: result?.metrics?.plan_length || 0,
        nodesExpanded: result?.metrics?.nodes_expanded || 0,
        searchTimeMs: searchTime,
        success: result?.success || false,
      });

      setResults([...newResults]);
    }

    // Pick best result and set it
    const successful = newResults.filter(r => r.success);
    if (successful.length > 0) {
      const best = successful.reduce((a, b) => 
        a.planLength < b.planLength ? a : b
      );
      
      // Re-run the best config to get full result
      const bestResult = await plan(
        domainPddl,
        problemPddl,
        best.config.algorithm,
        best.config.heuristic,
        30
      );
      
      if (bestResult) {
        setResult(bestResult);
      }
    }

    setProgress(100);
    setIsRunning(false);
    setLoading(false);
  }, [domainPddl, problemPddl, plan, setResult, setLoading]);

  const bestResult = results.filter(r => r.success).sort((a, b) => a.planLength - b.planLength)[0];

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-500" />
        Plan Optimizer
      </h3>

      <p className="text-xs text-gray-500 mb-3">
        Try multiple algorithms and heuristics to find the shortest plan.
      </p>

      <button
        onClick={runOptimization}
        disabled={isRunning}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 mb-4"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Optimizing... {progress}%
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Run Optimization
          </>
        )}
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Results</h4>
          
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg text-xs ${
                result.success 
                  ? result === bestResult
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50'
                  : 'bg-red-50 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.config.label}</span>
                {result.success && result === bestResult && (
                  <Trophy className="w-3 h-3 text-green-600" />
                )}
              </div>
              
              {result.success ? (
                <div className="grid grid-cols-3 gap-2 mt-1 text-gray-500">
                  <span>{result.planLength} steps</span>
                  <span>{result.nodesExpanded.toLocaleString()} nodes</span>
                  <span>{(result.searchTimeMs / 1000).toFixed(2)}s</span>
                </div>
              ) : (
                <span className="text-red-500">Failed</span>
              )}
            </div>
          ))}
        </div>
      )}

      {bestResult && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-xs text-green-700">
            <strong>Best:</strong> {bestResult.config.label} with {bestResult.planLength} steps
          </div>
        </div>
      )}
    </div>
  );
}
