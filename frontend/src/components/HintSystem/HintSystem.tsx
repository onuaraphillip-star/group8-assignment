import { useState, useCallback } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEditorStore, usePlannerStore } from '../../store';

interface Hint {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'tip';
}

export function HintSystem() {
  const { domainPddl, problemPddl } = useEditorStore();
  const { result } = usePlannerStore();
  const [isOpen, setIsOpen] = useState(true);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());

  const generateHints = useCallback((): Hint[] => {
    const hints: Hint[] = [];

    // Check if domain is empty
    if (!domainPddl || domainPddl.trim().length < 50) {
      hints.push({
        id: 'empty-domain',
        title: 'Domain is empty',
        content: 'Start by defining your domain. Load a benchmark from the sidebar or write your own PDDL.',
        type: 'warning'
      });
    }

    // Check if problem is empty
    if (!problemPddl || problemPddl.trim().length < 50) {
      hints.push({
        id: 'empty-problem',
        title: 'Problem is empty',
        content: 'Define a problem with objects, initial state, and goal.',
        type: 'warning'
      });
    }

    // Check for common PDDL syntax issues
    if (domainPddl && !domainPddl.includes('(:action')) {
      hints.push({
        id: 'no-actions',
        title: 'No actions defined',
        content: 'Your domain needs at least one action with :parameters, :precondition, and :effect.',
        type: 'warning'
      });
    }

    // Check for goal in problem
    if (problemPddl && !problemPddl.includes('(:goal')) {
      hints.push({
        id: 'no-goal',
        title: 'No goal defined',
        content: 'Your problem needs a (:goal ...) section defining what to achieve.',
        type: 'warning'
      });
    }

    // Algorithm tips based on result
    if (result && !result.success && result.error_message) {
      if (result.error_message.includes('timeout')) {
        hints.push({
          id: 'timeout',
          title: 'Search timed out',
          content: 'Try using Greedy or A* with a heuristic instead of BFS. Increase the timeout in settings.',
          type: 'tip'
        });
      }
    }

    // General tips
    if (hints.length === 0) {
      hints.push({
        id: 'ready',
        title: 'Ready to solve',
        content: 'Your domain and problem look good! Click "Solve" to find a plan.',
        type: 'info'
      });

      hints.push({
        id: 'tip-algorithms',
        title: 'Algorithm Tips',
        content: 'BFS finds optimal plans but is slow. Greedy is fast but plans may be longer. A* balances speed and quality.',
        type: 'tip'
      });
    }

    return hints.filter(h => !dismissedHints.has(h.id));
  }, [domainPddl, problemPddl, result, dismissedHints]);

  const hints = generateHints();

  if (hints.length === 0) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between text-sm text-blue-800 hover:bg-blue-100"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          <span className="font-medium">Hints ({hints.length})</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-3 space-y-2">
          {hints.map((hint) => (
            <div
              key={hint.id}
              className={`p-3 rounded-lg text-sm relative ${
                hint.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                hint.type === 'tip' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              <button
                onClick={() => {
                  setDismissedHints(prev => new Set([...prev, hint.id]));
                }}
                className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="font-medium mb-1 pr-6">{hint.title}</div>
              <div className="text-xs opacity-90">{hint.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
