import { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { usePlannerStore, usePlanPlayerStore } from '../../store';

export function PlanPlayer() {
  const { result } = usePlannerStore();
  const { 
    currentStep, 
    isPlaying, 
    playbackSpeed, 
    setCurrentStep, 
    setIsPlaying, 
    setPlaybackSpeed,
    reset 
  } = usePlanPlayerStore();

  const planLength = result?.plan?.length || 0;
  const maxSteps = planLength;

  // Reset when result changes
  useEffect(() => {
    reset();
  }, [result, reset]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= maxSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, maxSteps, playbackSpeed, setCurrentStep, setIsPlaying]);

  const handlePlayPause = () => {
    if (currentStep >= maxSteps) {
      reset();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    reset();
  };

  // Get current state description
  const getCurrentState = () => {
    if (!result?.plan || result.plan.length === 0) {
      return "No plan available";
    }

    if (currentStep === 0) {
      return "Initial state";
    }

    const action = result.plan[currentStep - 1];
    return `After: ${action.action}`;
  };

  if (!result?.success) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p className="text-sm">Solve a problem to see plan playback</p>
      </div>
    );
  }

  return (
    <div className="h-full p-4 flex flex-col">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
        Plan Player
      </h2>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {maxSteps}</span>
          <span>{Math.round((currentStep / maxSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${(currentStep / maxSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Current State */}
      <div className="flex-1 p-3 bg-gray-50 rounded-lg mb-4 overflow-y-auto">
        <p className="text-sm text-gray-600">{getCurrentState()}</p>
        {currentStep > 0 && result.plan[currentStep - 1] && (
          <div className="mt-2 text-xs text-gray-500">
            <div className="font-medium mb-1">Effects:</div>
            <div className="space-y-1">
              {result.plan[currentStep - 1].effects_add.map((eff, i) => (
                <div key={i} className="text-green-600">+ {eff}</div>
              ))}
              {result.plan[currentStep - 1].effects_del.map((eff, i) => (
                <div key={i} className="text-red-600">- {eff}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-30"
            title="Previous"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep >= maxSteps}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-30"
            title="Next"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-gray-500">Speed:</span>
          {[0.5, 1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 text-xs rounded ${
                playbackSpeed === speed
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
