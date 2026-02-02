import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Code, Play, Target, 
  Zap, GitBranch, Layers, HelpCircle, FileCode,
  CheckCircle, AlertCircle, Lightbulb, BookOpen
} from 'lucide-react';
import { SEO } from '../components/SEO/SEO';

export function Documentation() {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="Documentation" description="Complete documentation for PlanLab - PDDL syntax, algorithms, heuristics, and API reference." pathname="/docs" />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="PlanLab" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold text-gray-800">Documentation</h1>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Open App
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4">Contents</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#getting-started" className="text-gray-600 hover:text-primary-600">Getting Started</a></li>
                <li><a href="#pddl-basics" className="text-gray-600 hover:text-primary-600">PDDL Basics</a></li>
                <li><a href="#algorithms" className="text-gray-600 hover:text-primary-600">Search Algorithms</a></li>
                <li><a href="#domains" className="text-gray-600 hover:text-primary-600">Example Domains</a></li>
                <li><a href="#tips" className="text-gray-600 hover:text-primary-600">Tips & Tricks</a></li>
              </ul>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Getting Started */}
            <section id="getting-started" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Getting Started</h2>
              </div>
              <p className="text-gray-600 mb-4">
                PlanLab is a classical planning workbench that helps you understand and experiment 
                with AI planning algorithms. You can write PDDL (Planning Domain Definition Language) 
                domains and problems, then solve them using various search algorithms.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Quick Start</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Select an example domain from the sidebar or create your own</li>
                  <li>Edit the domain and problem PDDL files</li>
                  <li>Choose a search algorithm (BFS, A*, or Greedy)</li>
                  <li>Click "Solve" to generate a plan</li>
                  <li>Watch the animation to see the plan execute</li>
                </ol>
              </div>
            </section>

            {/* PDDL Basics */}
            <section id="pddl-basics" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Code className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">PDDL Basics</h2>
              </div>
              <p className="text-gray-600 mb-4">
                PDDL is the standard language for describing planning problems. A PDDL problem consists 
                of two parts: the <strong>domain</strong> (actions and predicates) and the <strong>problem</strong> (objects, initial state, and goal).
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <p className="text-sm text-gray-400 mb-2">Domain Structure:</p>
                  <pre className="text-sm text-green-400">
{`(define (domain example)
  (:predicates
    (at ?obj ?loc)
    (holding ?obj))
  
  (:action pick
    :parameters (?obj)
    :precondition (and (at ?obj ?loc))
    :effect (and (holding ?obj)
                 (not (at ?obj ?loc)))))`}
                  </pre>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <p className="text-sm text-gray-400 mb-2">Problem Structure:</p>
                  <pre className="text-sm text-blue-400">
{`(define (problem example-prob)
  (:domain example)
  (:objects obj1 obj2)
  (:init (at obj1 loc-a))
  (:goal (at obj1 loc-b)))`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Search Algorithms */}
            <section id="algorithms" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GitBranch className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Search Algorithms</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">BFS</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Breadth-First Search explores all possibilities level by level. 
                    Guarantees the shortest plan but uses more memory.
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-800">A*</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Uses heuristics to guide search. Balances speed and optimality 
                    with intelligent exploration.
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-800">Greedy</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Always picks the state that looks closest to goal. 
                    Fastest but may find longer plans.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Heuristics</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><strong>Goal Count:</strong> Simple count of unsatisfied goals</li>
                  <li><strong>h_add:</strong> Admissible, sums relaxed costs</li>
                  <li><strong>h_max:</strong> Admissible, conservative estimate</li>
                </ul>
              </div>
            </section>

            {/* Example Domains */}
            <section id="domains" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Layers className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Example Domains</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🧱</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Blocks World</h3>
                    <p className="text-sm text-gray-600">Stack blocks on a table. Classic planning domain with pick-up, put-down, stack, and unstack actions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Gripper</h3>
                    <p className="text-sm text-gray-600">Robot with two grippers moves between rooms and transports balls.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Tower of Hanoi</h3>
                    <p className="text-sm text-gray-600">Move disks between pegs following the rules. Classic recursive puzzle.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🚛</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Logistics</h3>
                    <p className="text-sm text-gray-600">Transport packages between cities using trucks and airplanes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🔧</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Tyre World</h3>
                    <p className="text-sm text-gray-600">Change a flat tyre using tools from the boot. Loosen nuts, jack up, remove and mount wheels.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tips */}
            <section id="tips" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Tips & Tricks</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <p className="text-gray-600">Start with <strong>Blocks World</strong> if you're new to planning. It's the simplest domain to understand.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <p className="text-gray-600">Use <strong>A* with h_add</strong> for most problems. It balances speed and solution quality.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <p className="text-gray-600">Watch the <strong>Animation</strong> tab to visualize how the plan executes step by step.</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <p className="text-gray-600">If search is taking too long, try <strong>Greedy</strong> algorithm or increase the timeout.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <p className="text-gray-600">Use <strong>Comparison</strong> tab to see how different algorithms perform on the same problem.</p>
                </div>
              </div>
            </section>

            {/* Help */}
            <section className="bg-primary-50 rounded-xl border border-primary-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-800">Need Help?</h2>
              </div>
              <p className="text-gray-600 mb-4">
                If you're stuck or have questions, try these resources:
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/app')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Try the App
                </button>
                <a
                  href="https://en.wikipedia.org/wiki/Planning_Domain_Definition_Language"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileCode className="w-4 h-4" />
                  PDDL Wiki
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </>
  );
}
