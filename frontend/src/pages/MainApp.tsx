import { useEffect } from 'react';
// Main App Component
import { Layout } from '../components/Layout/Layout';
import { Editor } from '../components/Editor/Editor';
import { Visualizer } from '../components/Visualizer/Visualizer';
import { PlanValidator } from '../components/Validation/PlanValidator';
import { AnimatedPlanPlayer } from '../components/PlanPlayer/AnimatedPlanPlayer';
import { PlanComparison } from '../components/PlanComparison/PlanComparison';
import { StatsPanel } from '../components/StatsPanel/StatsPanel';
import { DomainBrowser } from '../components/DomainBrowser/DomainBrowser';

import { useUIStore } from '../store';
import { useBenchmarks } from '../hooks/usePlanner';
import { Play, GitCompare } from 'lucide-react';

export function MainApp() {
  const { activeTab, setBenchmarks } = useUIStore();
  const { benchmarks, fetchBenchmarks } = useBenchmarks();
  useEffect(() => {
    fetchBenchmarks();
  }, [fetchBenchmarks]);

  useEffect(() => {
    setBenchmarks(benchmarks);
  }, [benchmarks, setBenchmarks]);

  return (
    <Layout
      sidebar={<DomainBrowser />}
      main={
        <div className="h-full flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <TabButton 
              active={activeTab === 'editor'} 
              onClick={() => useUIStore.getState().setActiveTab('editor')}
              label="Editor"
            />
            <TabButton 
              active={activeTab === 'visualization'} 
              onClick={() => useUIStore.getState().setActiveTab('visualization')}
              label="Visualization"
            />
            <TabButton 
              active={activeTab === 'validation'} 
              onClick={() => useUIStore.getState().setActiveTab('validation')}
              label="Validation"
            />
            <TabButton 
              active={activeTab === 'animation'} 
              onClick={() => useUIStore.getState().setActiveTab('animation')}
              label="Animation"
              icon={<Play className="w-3.5 h-3.5" />}
            />
            <TabButton 
              active={activeTab === 'comparison'} 
              onClick={() => useUIStore.getState().setActiveTab('comparison')}
              label="Comparison"
              icon={<GitCompare className="w-3.5 h-3.5" />}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'editor' && <Editor />}
            {activeTab === 'visualization' && <Visualizer />}
            {activeTab === 'validation' && <PlanValidator />}
            {activeTab === 'animation' && <AnimatedPlanPlayer />}
            {activeTab === 'comparison' && <PlanComparison />}
            
          </div>
        </div>
      }
      rightPanel={
        <div className="h-full">
          <StatsPanel />
        </div>
      }
    />
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 font-medium text-sm transition-colors relative flex items-center gap-1.5 ${
        active
          ? 'text-primary-600'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {icon}
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
      )}
    </button>
  );
}
