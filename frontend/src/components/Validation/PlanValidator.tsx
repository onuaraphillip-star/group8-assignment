import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Play, RotateCcw, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useEditorStore } from '../../store';
import { usePlanner } from '../../hooks/usePlanner';
import { ValidationStep } from '../../types/planning';

export function PlanValidator() {
  const { domainPddl, problemPddl } = useEditorStore();
  const { validate, isLoading } = usePlanner();
  const [planText, setPlanText] = useState('');
  const [result, setResult] = useState<{
    valid: boolean;
    errorStep: number | null;
    errorMessage: string | null;
    executionTrace: ValidationStep[];
  } | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'input' | 'result' | 'learn'>('input');

  const handleValidate = useCallback(async () => {
    if (!planText.trim()) return;
    
    // Parse plan text into action names
    const actions = planText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith(';'));
    
    const validationResult = await validate(domainPddl, problemPddl, actions);
    if (validationResult) {
      setResult({
        valid: validationResult.valid,
        errorStep: validationResult.error_step,
        errorMessage: validationResult.error_message,
        executionTrace: validationResult.execution_trace,
      });
      setActiveTab('result');
    }
  }, [planText, domainPddl, problemPddl, validate]);

  const toggleStep = (step: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  const getStepStatus = (stepIndex: number) => {
    if (!result) return 'pending';
    if (result.valid) return 'success';
    if (result.errorStep === stepIndex) return 'error';
    if (stepIndex < (result.errorStep ?? Infinity)) return 'success';
    return 'pending';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'input'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Input Plan
        </button>
        <button
          onClick={() => setActiveTab('result')}
          disabled={!result}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'result'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-800 disabled:opacity-50'
          }`}
        >
          Validation Result
        </button>
        <button
          onClick={() => setActiveTab('learn')}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'learn'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-1" />
          Learn
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'input' && (
          <div className="h-full flex flex-col p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Validate Your Plan</h3>
              <p className="text-sm text-gray-600">
                Enter a sequence of actions to validate against the current domain and problem.
                Each action should be on a separate line.
              </p>
            </div>

            <textarea
              value={planText}
              onChange={(e) => setPlanText(e.target.value)}
              placeholder="; Enter your plan here, one action per line&#10;pick-up(a)&#10;stack(a,b)&#10;..."
              className="flex-1 p-4 font-mono text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Tip: Use semicolons (;) for comments
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlanText('')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </button>
                <button
                  onClick={handleValidate}
                  disabled={isLoading || !planText.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Validate Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'result' && result && (
          <div className="h-full overflow-y-auto p-4">
            {/* Overall result */}
            <div className={`p-4 rounded-lg mb-6 ${
              result.valid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {result.valid ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <h3 className={`font-semibold ${
                    result.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.valid ? 'Plan is Valid!' : 'Plan Validation Failed'}
                  </h3>
                  <p className={`text-sm ${
                    result.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.valid 
                      ? 'This plan successfully achieves the goal.' 
                      : result.errorMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Execution trace */}
            <h4 className="font-semibold text-gray-800 mb-3">Execution Trace</h4>
            <div className="space-y-2">
              {result.executionTrace.map((step, idx) => {
                const status = getStepStatus(idx);
                const isExpanded = expandedSteps.has(idx);

                return (
                  <div
                    key={idx}
                    className={`border rounded-lg overflow-hidden ${
                      status === 'error' 
                        ? 'border-red-300 bg-red-50' 
                        : status === 'success'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleStep(idx)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          status === 'error'
                            ? 'bg-red-500 text-white'
                            : status === 'success'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                        }`}>
                          {idx}
                        </div>
                        <span className="font-medium text-gray-800">
                          {step.action || 'Initial State'}
                        </span>
                        {status === 'error' && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200/50">
                        <div className="mt-3">
                          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            State Predicates
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {step.state.map((pred, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono"
                              >
                                {pred}
                              </span>
                            ))}
                          </div>
                        </div>

                        {status === 'error' && result.errorMessage && (
                          <div className="mt-3 p-3 bg-red-100 rounded">
                            <h5 className="text-xs font-semibold text-red-700 uppercase mb-1">
                              Error
                            </h5>
                            <p className="text-sm text-red-700">{result.errorMessage}</p>
                          </div>
                        )}

                        {step.action && status !== 'error' && (
                          <div className="mt-3 p-3 bg-blue-50 rounded">
                            <h5 className="text-xs font-semibold text-blue-700 uppercase mb-1">
                              ✓ Action Applicable
                            </h5>
                            <p className="text-sm text-blue-600">
                              All preconditions were satisfied in this state.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Educational feedback */}
            {!result.valid && result.errorStep !== null && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">💡 How to Fix</h4>
                <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                  <li>Check that the action name matches exactly (case-sensitive)</li>
                  <li>Verify the parameters are valid objects in the problem</li>
                  <li>Make sure preconditions are satisfied before applying the action</li>
                  <li>Consider the order of actions - some actions must come before others</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="h-full overflow-y-auto p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Center</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">What is Plan Validation?</h4>
                <p className="text-sm text-gray-600">
                  Plan validation checks if a sequence of actions correctly transforms the initial state 
                  into a state that satisfies the goal. It simulates each action step-by-step to ensure:
                </p>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Each action is applicable (preconditions are met)</li>
                  <li>Effects are correctly applied</li>
                  <li>The final state satisfies all goal conditions</li>
                </ul>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Common Plan Errors</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-xs">1</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-800">Precondition Not Met</h5>
                      <p className="text-xs text-gray-600">
                        Trying to pick up a block that's not clear, or stacking without holding a block.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-xs">2</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-800">Invalid Action Name</h5>
                      <p className="text-xs text-gray-600">
                        Typo in action name or using an action that doesn't exist in the domain.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-xs">3</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-800">Goal Not Reached</h5>
                      <p className="text-xs text-gray-600">
                        The plan ends but some goal conditions are still not satisfied.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Plan Format</h4>
                <pre className="p-3 bg-gray-50 rounded text-xs font-mono">
{`; Comments start with semicolons
pick-up(a)           ; Action with one parameter
stack(a,b)           ; Action with two parameters
unstack(c,d)         ; Each action on its own line
put-down(c)          ; Order matters!`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
