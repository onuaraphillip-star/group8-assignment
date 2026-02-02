import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Film, ChevronRight } from 'lucide-react';
import { BlocksWorldVisualizer } from '../Visualizer/BlocksWorldVisualizer';
import { GripperVisualizer } from '../Visualizer/GripperVisualizer';
import { HanoiVisualizer } from '../Visualizer/HanoiVisualizer';
import { TyreWorldVisualizer } from '../Visualizer/TyreWorldVisualizer';
import { usePlannerStore, useEditorStore } from '../../store';

interface PlanStep {
  action: string;
  state: string[];
}

export function AnimatedPlanPlayer() {
  const { result } = usePlannerStore();
  const { domainPddl, problemPddl } = useEditorStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [steps, setSteps] = useState<PlanStep[]>([]);

  // Parse initial state from problem
  const getInitialState = useCallback(() => {
    if (!problemPddl) return [];
    
    // Find :init section - more robust parsing
    const initSectionMatch = problemPddl.match(/\(:init\s+([\s\S]*?)(?:\(:goal|\)\s*\))/);
    if (!initSectionMatch) {
      
      return [];
    }
    
    let initContent = initSectionMatch[1].trim();
    
    // Remove (and ...) wrapper if present
    if (initContent.startsWith('(and')) {
      initContent = initContent.slice(4).trim();
      if (initContent.endsWith(')')) {
        initContent = initContent.slice(0, -1).trim();
      }
    }
    
    const predicates: string[] = [];
    
    // Match all predicates - support multiple domains
    const predRegex = /\([\w\s-]+\)/g;
    let match;
    while ((match = predRegex.exec(initContent)) !== null) {
      const pred = match[0].trim();
      // Include all valid predicates for different domains
      if (pred.startsWith('(on') || pred.startsWith('(ontable') || 
          pred.startsWith('(clear') || pred.startsWith('(holding') ||
          pred.startsWith('(handempty') ||  // Blocksworld
          pred.startsWith('(at') || pred.startsWith('(in') || 
          pred.startsWith('(at-robby') || pred.startsWith('(free') ||
          pred.startsWith('(carry') ||  // Gripper & Logistics
          pred.startsWith('(smaller')) {  // Hanoi
        predicates.push(pred);
      }
    }
    
    return predicates;
  }, [problemPddl]);

  // Build steps from plan
  useEffect(() => {
    if (!result?.plan) {
      setSteps([]);
      return;
    }

    const initialState = getInitialState();
    const planSteps: PlanStep[] = [{ action: 'Initial State', state: initialState }];
    
    let currentState = [...initialState];
    
    for (const action of result.plan) {
      // Apply action effects to state
      currentState = applyAction(currentState, action.action, domainPddl);
      planSteps.push({
        action: action.action,
        state: [...currentState]
      });
    }
    
    setSteps(planSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [result, getInitialState, domainPddl]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) {
        setIsPlaying(false);
      }
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed]);

  const handlePlayPause = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Check domain type
  const isBlocksWorld = domainPddl?.toLowerCase().includes('block') || 
                        problemPddl?.toLowerCase().includes('block') ||
                        (problemPddl?.includes('(:objects') && problemPddl?.includes('- block'));
  
  const isGripper = domainPddl?.toLowerCase().includes('gripper') ||
                    problemPddl?.toLowerCase().includes('gripper') ||
                    problemPddl?.includes('at-robby');
  
  const isHanoi = domainPddl?.toLowerCase().includes('hanoi') ||
                  problemPddl?.toLowerCase().includes('hanoi') ||
                  problemPddl?.includes('peg1') ||
                  problemPddl?.includes('smaller d1');
  
  const isTyreWorld = domainPddl?.toLowerCase().includes('tyre') ||
                      problemPddl?.toLowerCase().includes('tyre') ||
                      problemPddl?.includes('wheel') ||
                      problemPddl?.includes('wrench') ||
                      problemPddl?.includes('jack');
  


  // Format action for display
  const formatAction = (action: string) => {
    if (action === 'Initial State') return 'Initial State';
    return action
      .replace(/-/g, ' ')
      .replace(/\(([^)]+)\)/, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!result?.success || steps.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
        <Film className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">No Plan to Animate</p>
        <p className="text-sm text-gray-400 mt-2">Solve a problem first to see the animated playback</p>
      </div>
    );
  }

  const currentState = steps[currentStep]?.state || [];
  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  const currentAction = steps[currentStep]?.action || 'Start';

  return (
    <div className="h-full flex flex-col bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Plan Animation</h2>
          <p className="text-sm text-gray-500">Watch the plan execute step by step</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
            {steps.length - 1} actions
          </span>
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full border border-primary-200 text-sm font-medium">
            Step {currentStep} of {steps.length - 1}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Visualization Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Current Action Banner */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-white shadow-lg">
            <p className="text-xs font-medium text-primary-100 uppercase tracking-wider mb-1">Current Action</p>
            <p className="text-2xl font-bold">{formatAction(currentAction)}</p>
          </div>

          {/* Visualization */}
          <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            {isBlocksWorld ? (
              <BlocksWorldVisualizer 
                state={currentState} 
                currentAction={currentAction}
                width={500} 
                height={350} 
              />
            ) : isGripper ? (
              <GripperVisualizer 
                state={currentState} 
                currentAction={currentAction}
                width={500} 
                height={350} 
              />
            ) : isHanoi ? (
              <HanoiVisualizer 
                state={currentState} 
                currentAction={currentAction}
                width={500} 
                height={350} 
              />
            ) : isTyreWorld ? (
              <TyreWorldVisualizer 
                state={currentState} 
                currentAction={currentAction}
                width={500} 
                height={350} 
              />
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">State Visualization</p>
                <p className="text-sm text-gray-400 mt-2">{currentState.length} predicates</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-md text-left text-xs font-mono overflow-auto max-h-64">
                  {currentState.slice(0, 15).map((pred, i) => (
                    <div key={i} className="text-gray-600 py-0.5">{pred}</div>
                  ))}
                  {currentState.length > 15 && (
                    <div className="text-gray-400 py-1">... and {currentState.length - 15} more</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Progress</span>
              <span className="text-primary-600 font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          {/* Playback Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Playback Controls</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleReset}
                className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Reset to beginning"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                title="Previous step"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep >= steps.length - 1}
                className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                title="Next step"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-xs text-gray-500">Speed:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[0.5, 1, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                      playbackSpeed === speed
                        ? 'bg-white text-primary-600 font-medium shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step List */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-0 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Steps</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      index === currentStep
                        ? 'bg-primary-50 text-primary-700 font-medium border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${
                      index === currentStep
                        ? 'bg-primary-600 text-white'
                        : index < currentStep
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index < currentStep ? '✓' : index}
                    </span>
                    <span className="flex-1 truncate">{formatAction(step.action)}</span>
                    {index === currentStep && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to apply an action to a state - supports multiple domains
function applyAction(state: string[], action: string, domainPddl?: string): string[] {
  const newState = new Set(state);
  
  // Parse action name and parameters
  const match = action.match(/(\w+)[-\s]?\(([^)]*)\)/);
  if (!match) return state;
  
  const [_, actionName, paramsStr] = match;
  const params = paramsStr.split(',').map(p => p.trim());
  
  // Determine domain type
  const isLogistics = domainPddl?.toLowerCase().includes('logistics') || actionName === 'drive' || actionName === 'fly' || actionName === 'load-truck';
  const isGripper = domainPddl?.toLowerCase().includes('gripper') || actionName === 'pick' || actionName === 'drop';
  const isHanoi = domainPddl?.toLowerCase().includes('hanoi') || actionName === 'move' && params.length === 3;
  
  // Apply effects based on action type
  if (isLogistics) {
    // Logistics domain
    switch (actionName) {
      case 'drive': {
        const [truck, from, to] = params;
        newState.delete(`(at ${truck} ${from})`);
        newState.add(`(at ${truck} ${to})`);
        break;
      }
      case 'fly': {
        const [plane, from, to] = params;
        newState.delete(`(at ${plane} ${from})`);
        newState.add(`(at ${plane} ${to})`);
        break;
      }
      case 'load-truck': {
        const [pkg, truck, loc] = params;
        newState.delete(`(at ${pkg} ${loc})`);
        newState.add(`(in ${pkg} ${truck})`);
        break;
      }
      case 'load-airplane': {
        const [pkg, plane, loc] = params;
        newState.delete(`(at ${pkg} ${loc})`);
        newState.add(`(in ${pkg} ${plane})`);
        break;
      }
      case 'unload-truck': {
        const [pkg, truck, loc] = params;
        newState.delete(`(in ${pkg} ${truck})`);
        newState.add(`(at ${pkg} ${loc})`);
        break;
      }
      case 'unload-airplane': {
        const [pkg, plane, loc] = params;
        newState.delete(`(in ${pkg} ${plane})`);
        newState.add(`(at ${pkg} ${loc})`);
        break;
      }
    }
  } else if (isGripper) {
    // Gripper domain
    switch (actionName) {
      case 'move': {
        const [from, to] = params;
        newState.delete(`(at-robby ${from})`);
        newState.add(`(at-robby ${to})`);
        break;
      }
      case 'pick': {
        const [ball, room, gripper] = params;
        newState.delete(`(at ${ball} ${room})`);
        newState.delete(`(free ${gripper})`);
        newState.add(`(carry ${ball} ${gripper})`);
        break;
      }
      case 'drop': {
        const [ball, room, gripper] = params;
        newState.delete(`(carry ${ball} ${gripper})`);
        newState.add(`(at ${ball} ${room})`);
        newState.add(`(free ${gripper})`);
        break;
      }
    }
  } else if (isHanoi) {
    // Hanoi domain
    if (actionName === 'move') {
      const [disk, from, to] = params;
      newState.delete(`(on ${disk} ${from})`);
      newState.add(`(on ${disk} ${to})`);
      newState.add(`(clear ${from})`);
      newState.delete(`(clear ${to})`);
    }
  } else {
    // Blocksworld domain (default)
    switch (actionName) {
      case 'pick-up': {
        const [block] = params;
        newState.delete(`(ontable ${block})`);
        newState.delete(`(clear ${block})`);
        newState.delete('(handempty)');
        newState.add(`(holding ${block})`);
        break;
      }
      case 'put-down': {
        const [block] = params;
        newState.delete(`(holding ${block})`);
        newState.add(`(ontable ${block})`);
        newState.add(`(clear ${block})`);
        newState.add('(handempty)');
        break;
      }
      case 'stack': {
        const [block1, block2] = params;
        newState.delete(`(holding ${block1})`);
        newState.delete(`(clear ${block2})`);
        newState.add(`(on ${block1} ${block2})`);
        newState.add(`(clear ${block1})`);
        newState.add('(handempty)');
        break;
      }
      case 'unstack': {
        const [block1, block2] = params;
        newState.delete(`(on ${block1} ${block2})`);
        newState.delete(`(clear ${block1})`);
        newState.delete('(handempty)');
        newState.add(`(holding ${block1})`);
        newState.add(`(clear ${block2})`);
        break;
      }
    }
  }
  
  return Array.from(newState);
}
