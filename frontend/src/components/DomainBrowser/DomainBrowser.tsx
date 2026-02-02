import { useEffect, useState } from 'react';
import { 
  Folder, File, ChevronRight, ChevronDown, Loader2, 
  BookOpen, FolderOpen, Sparkles
} from 'lucide-react';
import { useBenchmarks } from '../../hooks/usePlanner';
import { useEditorStore, useUIStore } from '../../store';
import { FileManager } from '../FileManager/FileManager';

interface BenchmarkGroup {
  domain: string;
  problems: { name: string; description: string }[];
}

export function DomainBrowser() {
  const { benchmarks, isLoading, fetchBenchmarks, loadBenchmark } = useBenchmarks();
  const { setDomainPddl, setProblemPddl } = useEditorStore();
  const { setSelectedBenchmark, setActiveTab } = useUIStore();
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(['blocksworld']));
  const [loadingBenchmark, setLoadingBenchmark] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'benchmarks' | 'files'>('benchmarks');

  useEffect(() => {
    fetchBenchmarks();
  }, [fetchBenchmarks]);

  const groupedBenchmarks: BenchmarkGroup[] = benchmarks.reduce((acc, b) => {
    const existing = acc.find(g => g.domain === b.domain);
    if (existing) {
      existing.problems.push({ name: b.name, description: b.description });
    } else {
      acc.push({ domain: b.domain, problems: [{ name: b.name, description: b.description }] });
    }
    return acc;
  }, [] as BenchmarkGroup[]);

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const handleSelectBenchmark = async (domain: string, name: string) => {
    setLoadingBenchmark(`${domain}/${name}`);
    const data = await loadBenchmark(domain, name);
    if (data) {
      setDomainPddl(data.domain);
      setProblemPddl(data.problem);
      setSelectedBenchmark(`${domain}/${name}`);
      setActiveTab('editor');
    }
    setLoadingBenchmark(null);
  };

  const getDomainIcon = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'blocksworld': return '🧱';
      case 'gripper': return '🤖';
      case 'logistics': return '🚚';
      default: return '📦';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">PlanLab</h1>
            <p className="text-xs text-gray-500">Planning Workbench</p>
          </div>
        </div>
      </div>

      {/* Panel Switcher */}
      <div className="flex border-b border-gray-100">
        {[
          { id: 'benchmarks', icon: FolderOpen, label: 'Examples' },
          { id: 'files', icon: Folder, label: 'My Files' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-all ${
              activePanel === id
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'benchmarks' && (
          <div className="h-full overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Benchmark Problems
              </h2>
              <span className="text-xs text-gray-400">{benchmarks.length} problems</span>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              </div>
            ) : (
              <div className="space-y-1">
                {groupedBenchmarks.map(group => (
                  <div key={group.domain} className="rounded-xl overflow-hidden border border-gray-100">
                    <button
                      onClick={() => toggleDomain(group.domain)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                    >
                      {expandedDomains.has(group.domain) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-lg">{getDomainIcon(group.domain)}</span>
                      <span className="flex-1 text-sm font-medium text-gray-700 text-left capitalize">
                        {group.domain}
                      </span>
                      <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">
                        {group.problems.length}
                      </span>
                    </button>
                    
                    {expandedDomains.has(group.domain) && (
                      <div className="py-1">
                        {group.problems.map(problem => (
                          <button
                            key={problem.name}
                            onClick={() => handleSelectBenchmark(group.domain, problem.name)}
                            disabled={loadingBenchmark === `${group.domain}/${problem.name}`}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors disabled:opacity-50"
                          >
                            {loadingBenchmark === `${group.domain}/${problem.name}` ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                            ) : (
                              <File className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="flex-1 text-left truncate">{problem.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Tips */}
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Getting Started</span>
              </div>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  <span>Start with <strong>Blocks World</strong> for beginners</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  <span>Try <strong>Sussman Anomaly</strong> for a challenge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  <span>Use <strong>My Files</strong> to create custom problems</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activePanel === 'files' && <FileManager />}
      </div>
    </div>
  );
}
