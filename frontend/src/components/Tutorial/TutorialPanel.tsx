import { useState } from 'react';
import { Book, ChevronRight, ChevronLeft, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  exercise?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}

const tutorials: TutorialStep[] = [
  {
    title: "What is STRIPS?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>STRIPS</strong> (Stanford Research Institute Problem Solver) is a classic 
          automated planning formalism. It describes planning problems using:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>States</strong>: Sets of predicates that are true</li>
          <li><strong>Actions</strong>: Operations with preconditions and effects</li>
          <li><strong>Goals</strong>: Desired states to reach</li>
        </ul>
        <div className="p-3 bg-blue-50 rounded-lg mt-3">
          <p className="text-sm text-blue-800">
            <strong>Key Insight:</strong> STRIPS uses the "closed world assumption" - 
            anything not stated is assumed to be false.
          </p>
        </div>
      </div>
    ),
    exercise: {
      question: "In STRIPS, if a predicate is not mentioned in the state, it is:",
      options: [
        "Unknown",
        "True",
        "False",
        "Depends on the domain"
      ],
      correctAnswer: 2,
      explanation: "STRIPS uses the closed world assumption: anything not stated is false."
    }
  },
  {
    title: "Predicates",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Predicates</strong> are facts about the world. They can be true or false.
        </p>
        <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
          <div className="text-green-600">(on a b)</div>
          <div className="text-gray-500">; Block a is on block b</div>
          <div className="text-green-600 mt-2">(clear c)</div>
          <div className="text-gray-500">; Block c has nothing on top</div>
          <div className="text-green-600 mt-2">(handempty)</div>
          <div className="text-gray-500">; The robot hand is empty</div>
        </div>
        <p className="text-sm">
          Predicates can have parameters (like <code>a</code>, <code>b</code>, <code>c</code>) 
          that represent objects in the world.
        </p>
      </div>
    ),
    exercise: {
      question: "What does (holding x) mean?",
      options: [
        "Object x is on the table",
        "The robot is holding object x",
        "Object x is being stacked",
        "Object x is clear"
      ],
      correctAnswer: 1,
      explanation: "(holding x) means the robot's hand is currently holding object x."
    }
  },
  {
    title: "Actions",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Actions</strong> have three parts:
        </p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>
            <strong>Parameters</strong>: Variables like <code>?x</code>, <code>?y</code>
          </li>
          <li>
            <strong>Preconditions</strong>: What must be true before the action can execute
          </li>
          <li>
            <strong>Effects</strong>: How the state changes after the action
          </li>
        </ol>
        <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm mt-3">
          <div className="text-purple-600">(:action pick-up</div>
          <div className="ml-4 text-blue-600">:parameters (?x)</div>
          <div className="ml-4 text-orange-600">:precondition (and (clear ?x) (ontable ?x))</div>
          <div className="ml-4 text-green-600">:effect (and (holding ?x) (not (ontable ?x)))</div>
          <div className="text-purple-600">)</div>
        </div>
      </div>
    ),
    exercise: {
      question: "Can you pick-up a block that is under another block?",
      options: [
        "Yes, always",
        "No, because it's not clear",
        "Yes, if the hand is empty",
        "Only if it's on the table"
      ],
      correctAnswer: 1,
      explanation: "The pick-up action requires (clear ?x), meaning nothing can be on top of it."
    }
  },
  {
    title: "Search Algorithms",
    content: (
      <div className="space-y-3">
        <p>
          Planning uses <strong>search algorithms</strong> to find a sequence of actions:
        </p>
        <div className="space-y-2">
          <div className="p-2 bg-blue-50 rounded">
            <strong className="text-blue-800">BFS</strong>
            <p className="text-sm text-blue-600">
              Explores all possibilities level by level. Guaranteed to find shortest plan.
            </p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <strong className="text-green-800">A*</strong>
            <p className="text-sm text-green-600">
              Uses a heuristic to guide search. Fast and optimal with good heuristics.
            </p>
          </div>
          <div className="p-2 bg-yellow-50 rounded">
            <strong className="text-yellow-800">Greedy</strong>
            <p className="text-sm text-yellow-600">
              Always picks the node that looks closest to goal. Fast but not always optimal.
            </p>
          </div>
        </div>
      </div>
    ),
    exercise: {
      question: "Which algorithm guarantees the shortest plan?",
      options: [
        "Greedy Best-First",
        "A* with any heuristic",
        "BFS (Breadth-First Search)",
        "All of them"
      ],
      correctAnswer: 2,
      explanation: "BFS explores level by level, so the first solution found has the minimum number of steps."
    }
  },
  {
    title: "Heuristics",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Heuristics</strong> estimate how close a state is to the goal. They help 
          guide the search toward promising directions.
        </p>
        <div className="space-y-2">
          <div className="p-2 bg-gray-50 rounded">
            <strong>Goal Count</strong>: Number of unsatisfied goals
            <p className="text-xs text-gray-500">Simple but can overestimate</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <strong>h_add</strong>: Sum of costs in relaxed problem
            <p className="text-xs text-gray-500">Admissible (never overestimates)</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <strong>h_max</strong>: Maximum cost in relaxed problem
            <p className="text-xs text-gray-500">Also admissible, more conservative</p>
          </div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg mt-3">
          <p className="text-sm text-purple-800">
            <strong>Admissible</strong> means the heuristic never overestimates the true cost. 
            A* with an admissible heuristic finds optimal solutions!
          </p>
        </div>
      </div>
    )
  }
];

export function TutorialPanel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showExercise, setShowExercise] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const step = tutorials[currentStep];
  const hasExercise = !!step.exercise;

  const handleNext = () => {
    if (currentStep < tutorials.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowExercise(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowExercise(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <Book className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-800">Learn STRIPS</h2>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Lesson {currentStep + 1} of {tutorials.length}</span>
          <span>{Math.round(((currentStep + 1) / tutorials.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-primary-600 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / tutorials.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{step.title}</h3>
        <div className="text-gray-700 leading-relaxed">{step.content}</div>

        {/* Exercise */}
        {hasExercise && (
          <div className="mt-6">
            <button
              onClick={() => setShowExercise(!showExercise)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Lightbulb className="w-4 h-4" />
              {showExercise ? 'Hide Exercise' : 'Try an Exercise'}
            </button>

            {showExercise && step.exercise && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">
                  {step.exercise.question}
                </h4>
                <div className="space-y-2">
                  {step.exercise.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={showExplanation}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedAnswer === idx
                          ? idx === step.exercise!.correctAnswer
                            ? 'bg-green-100 border-green-300'
                            : 'bg-red-100 border-red-300'
                          : 'bg-white border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedAnswer === idx && (
                          idx === step.exercise!.correctAnswer ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )
                        )}
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {showExplanation && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    selectedAnswer === step.exercise.correctAnswer
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <strong>{selectedAnswer === step.exercise.correctAnswer ? 'Correct!' : 'Not quite.'}</strong>
                    <p className="mt-1">{step.exercise.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-sm text-gray-500">
          {currentStep + 1} / {tutorials.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentStep === tutorials.length - 1}
          className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
