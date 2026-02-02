import { Clock, GitBranch, Target, Zap, Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePlannerStore } from '../../store';
import { PlanComparison } from '../PlanComparison/PlanComparison';

export function StatsPanel() {
  const { result, isLoading, algorithm, heuristic } = usePlannerStore();

  const getAlgorithmIcon = () => {
    switch (algorithm) {
      case 'bfs': return <Target className="w-5 h-5 text-blue-500" />;
      case 'astar': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'greedy': return <Clock className="w-5 h-5 text-green-500" />;
      default: return <Zap className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getAlgorithmColor = () => {
    switch (algorithm) {
      case 'bfs': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'astar': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'greedy': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary-500" />
          Search Statistics
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Algorithm Badge */}
        <div className={`p-3 rounded-xl border ${getAlgorithmColor()}`}>
          <div className="flex items-center gap-3">
            {getAlgorithmIcon()}
            <div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-75">Algorithm</div>
              <div className="text-lg font-bold">{algorithm.toUpperCase()}</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-current border-opacity-20">
            <div className="text-xs opacity-75">Heuristic</div>
            <div className="font-medium">{heuristic}</div>
          </div>
        </div>

        {/* Stats Grid */}
        {result ? (
          <>
            {/* Success/Error Status */}
            {result.success ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Solution Found!</span>
              </div>
            ) : result.error_message ? (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">{result.error_message}</span>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Clock className="w-4 h-4" />}
                label="Time"
                value={result.metrics ? `${(result.metrics.search_time_ms / 1000).toFixed(2)}s` : '-'}
                color="blue"
              />
              <StatCard
                icon={<GitBranch className="w-4 h-4" />}
                label="Expanded"
                value={result.metrics?.nodes_expanded.toLocaleString() || '-'}
                color="purple"
              />
              <StatCard
                icon={<Target className="w-4 h-4" />}
                label="Plan Length"
                value={result.metrics?.plan_length.toString() || '-'}
                color="green"
              />
              <StatCard
                icon={<Zap className="w-4 h-4" />}
                label="Generated"
                value={result.metrics?.nodes_generated.toLocaleString() || '-'}
                color="yellow"
              />
            </div>

            {/* Plan Steps */}
            {result.success && result.plan.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Plan Steps
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {result.plan.map((action, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-green-900 flex-1">
                        {action.action}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Export Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => exportPlan(result.plan, 'txt')}
                    className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Export as TXT
                  </button>
                  <button
                    onClick={() => exportPlan(result.plan, 'json')}
                    className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
                </div>
                <p className="text-sm font-medium text-gray-600">Searching...</p>
                <p className="text-xs text-gray-400">Exploring state space</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Target className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm">Run a search to see statistics</p>
              </div>
            )}
          </div>
        )}
        
        {/* Plan Comparison */}
        <PlanComparison />
      </div>
    </div>
  );
}

// Export plan to file
function exportPlan(plan: { action: string }[], format: 'txt' | 'json') {
  if (format === 'txt') {
    const content = plan.map((p, i) => `${i + 1}. ${p.action}`).join('\n');
    downloadFile(content, 'plan.txt', 'text/plain');
  } else {
    const content = JSON.stringify({ plan: plan.map(p => p.action) }, null, 2);
    downloadFile(content, 'plan.json', 'application/json');
  }
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  purple: 'bg-purple-50 border-purple-200 text-purple-900',
  red: 'bg-red-50 border-red-200 text-red-900',
};

const iconColors = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  purple: 'text-purple-500',
  red: 'text-red-500',
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={`p-3 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-sm`}>
      <div className={`flex items-center gap-1.5 mb-1 ${iconColors[color]}`}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider opacity-75">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
