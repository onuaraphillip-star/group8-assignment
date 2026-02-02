import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { 
  Play, RotateCcw, Settings, AlertCircle, Lightbulb, 
  FileCode, Target, Zap, CheckCircle2 
} from 'lucide-react';
import { useEditorStore, usePlannerStore } from '../../store';
import { usePlanner } from '../../hooks/usePlanner';
import { useProgress } from '../../hooks/useProgress';
import { useAuth } from '../../hooks/useAuth';
import type { Algorithm, Heuristic } from '../../types/planning';

// Configure Monaco to use local version instead of CDN
loader.config({ monaco });

const DEFAULT_DOMAIN = `(define (domain blocksworld)
  (:requirements :strips :typing)
  (:types block)
  (:predicates 
    (on ?x - block ?y - block)
    (ontable ?x - block)
    (clear ?x - block)
    (handempty)
    (holding ?x - block))
    
  (:action pick-up
    :parameters (?x - block)
    :precondition (and (clear ?x) (ontable ?x) (handempty))
    :effect (and (not (ontable ?x)) (not (clear ?x)) 
                 (not (handempty)) (holding ?x)))
                 
  (:action put-down
    :parameters (?x - block)
    :precondition (holding ?x)
    :effect (and (not (holding ?x)) (clear ?x) 
                 (handempty) (ontable ?x)))
                 
  (:action stack
    :parameters (?x - block ?y - block)
    :precondition (and (holding ?x) (clear ?y))
    :effect (and (not (holding ?x)) (not (clear ?y))
                 (clear ?x) (on ?x ?y) (handempty)))
                 
  (:action unstack
    :parameters (?x - block ?y - block)
    :precondition (and (on ?x ?y) (clear ?x) (handempty))
    :effect (and (holding ?x) (clear ?y)
                 (not (clear ?x)) (not (handempty)) (not (on ?x ?y))))
)`;

const DEFAULT_PROBLEM = `(define (problem example-prob)
  (:domain blocksworld)
  (:objects a b c - block)
  (:init 
    (ontable a)
    (ontable b)
    (ontable c)
    (clear a)
    (clear b)
    (clear c)
    (handempty))
  (:goal (and (on a b) (on b c))))
`;

const algorithmInfo = {
  bfs: { label: 'BFS', desc: 'Shortest plan, slower', icon: <Target className="w-4 h-4" /> },
  astar: { label: 'A*', desc: 'Balanced speed & quality', icon: <Zap className="w-4 h-4" /> },
  greedy: { label: 'Greedy', desc: 'Fastest, may be longer', icon: <Play className="w-4 h-4" /> },
};

const heuristicInfo = {
  goal_count: { label: 'Goal Count', desc: 'Simple count of unsatisfied goals' },
  h_add: { label: 'h_add', desc: 'Admissible, sums relaxed costs' },
  h_max: { label: 'h_max', desc: 'Admissible, conservative' },
};

export function EditorComponent() {
  const { domainPddl, problemPddl, setDomainPddl, setProblemPddl } = useEditorStore();
  const { 
    algorithm, 
    heuristic, 
    timeout, 
    isLoading,
    setAlgorithm, 
    setHeuristic, 
    setSearchTimeout,
    setResult,
    setLoading 
  } = usePlannerStore();
  const { plan, error } = usePlanner();
  const [activeFile, setActiveFile] = useState<'domain' | 'problem'>('domain');
  const [showSettings, setShowSettings] = useState(false);
  const [showHints, setShowHints] = useState(true);

  if (!domainPddl) setDomainPddl(DEFAULT_DOMAIN);
  if (!problemPddl) setProblemPddl(DEFAULT_PROBLEM);

  const { token } = useAuth();
  const { trackPlanGenerated, trackProblemSolved, trackAlgorithmUsage } = useProgress(token);

  const handleSolve = useCallback(async () => {
    // Clear previous result to ensure UI updates properly
    setResult(null);
    setLoading(true);
    
    // Small delay to allow UI to clear
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const startTime = Date.now();
    const result = await plan(domainPddl, problemPddl, algorithm, heuristic, timeout);
    const searchTime = Date.now() - startTime;
    
    // Track progress
    if (result && result.plan) {
      trackPlanGenerated();
      trackAlgorithmUsage({
        algorithm,
        heuristic: heuristic || undefined,
        problem_name: 'custom-problem',
        nodes_expanded: result.metrics?.nodes_expanded || 0,
        plan_length: result.plan.length,
        search_time_ms: searchTime,
      });
      
      if (result.plan.length > 0) {
        trackProblemSolved(result.metrics?.nodes_expanded || 0);
      }
    }
    
    setResult(result);
    setLoading(false);
  }, [domainPddl, problemPddl, algorithm, heuristic, timeout, plan, setResult, setLoading, trackPlanGenerated, trackAlgorithmUsage, trackProblemSolved]);

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Modern Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveFile('domain')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeFile === 'domain'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            domain.pddl
          </button>
          <button
            onClick={() => setActiveFile('problem')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeFile === 'problem'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-4 h-4" />
            problem.pddl
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Algorithm Selector */}
          <div className="relative group">
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              {Object.entries(algorithmInfo).map(([key, info]) => (
                <option key={key} value={key}>{info.label}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {algorithmInfo[algorithm].icon}
            </div>
          </div>

          {/* Heuristic Selector */}
          <select
            value={heuristic}
            onChange={(e) => setHeuristic(e.target.value as Heuristic)}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
          >
            {Object.entries(heuristicInfo).map(([key, info]) => (
              <option key={key} value={key}>{info.label}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setResult(null)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            title="Clear Results"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleSolve}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Solving...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" fill="currentColor" />
                Solve
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 animate-fade-in">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">Timeout:</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={timeout}
                  onChange={(e) => setSearchTimeout(parseInt(e.target.value))}
                  min={5}
                  max={120}
                  step={5}
                  className="w-32 accent-primary-600"
                />
                <span className="text-sm font-medium text-gray-700 w-12">{timeout}s</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Auto-save enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* Hints */}
      {showHints && !error && (
        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm text-blue-800">
            <span className="font-medium">Tip:</span>{' '}
            {activeFile === 'domain' ? (
              <>
                Define <span className="font-medium text-blue-900">predicates</span> to represent facts, then create{' '}
                <span className="font-medium text-blue-900">actions</span> with preconditions and effects.
              </>
            ) : (
              <>
                Specify <span className="font-medium text-blue-900">objects</span> with types, define the{' '}
                <span className="font-medium text-blue-900">initial state</span>, and the <span className="font-medium text-blue-900">goal</span>.
              </>
            )}
          </div>
          <button 
            onClick={() => setShowHints(false)}
            className="text-blue-400 hover:text-blue-600 p-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
            <p className="text-xs text-red-500 mt-2">
              💡 Check your syntax - ensure parentheses are balanced and keywords are spelled correctly.
            </p>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 p-4">
        <div className="h-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <Editor
            height="100%"
            language={activeFile === 'domain' ? 'pddl-domain' : 'pddl-problem'}
            value={activeFile === 'domain' ? domainPddl : problemPddl}
            onChange={(value) => {
              if (activeFile === 'domain') {
                setDomainPddl(value || '');
              } else {
                setProblemPddl(value || '');
              }
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16 },
              folding: true,
              renderWhitespace: 'selection',
            }}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
}

export { EditorComponent as Editor };
