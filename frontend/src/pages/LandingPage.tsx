import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, Zap, GitBranch, CheckCircle, GraduationCap } from 'lucide-react';
import { SEO } from '../components/SEO/SEO';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PlanLab" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-gray-900">PlanLab</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/learn')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Learn
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Master AI Planning Algorithms
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-gray-900">
              Learn Classical Planning with{' '}
              <span className="text-primary-600">STRIPS</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Understand how AI systems solve complex planning problems. 
              Visualize search algorithms, experiment with heuristics, and 
              master the foundations of automated planning.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-lg transition-all flex items-center gap-2"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/app')}
                className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-lg transition-all"
              >
                Try Demo
              </button>
            </div>
          </div>
          
          {/* Visual Demo */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-blue-100 rounded-3xl blur-3xl" />
            <div className="relative bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-gray-800">Goal: Stack blocks A→B→C</span>
                  </div>
                  <div className="text-sm text-gray-500">Initial: A,B,C on table</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-primary-300 to-blue-300" />
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-primary-300" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center text-sm text-gray-700">pick-up(A)</div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center text-sm text-gray-700">stack(A,B)</div>
                  <div className="p-3 bg-green-50 rounded-lg text-center text-sm text-green-700 font-medium">✓ Goal!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">What You'll Learn</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Master the fundamental algorithms that power modern AI planning systems
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<GitBranch className="w-8 h-8" />}
              title="Search Algorithms"
              description="Understand BFS, A*, and Greedy search with interactive visualizations"
            />
            <FeatureCard 
              icon={<Target className="w-8 h-8" />}
              title="Heuristic Functions"
              description="Learn how h_add, h_max, and goal count guide the search process"
            />
            <FeatureCard 
              icon={<CheckCircle className="w-8 h-8" />}
              title="PDDL Language"
              description="Write planning domains and problems using the standard PDDL syntax"
            />
          </div>
        </div>
      </section>

      {/* Algorithms Preview */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Explore Search Algorithms</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <AlgorithmCard 
              name="BFS"
              fullName="Breadth-First Search"
              color="blue"
              description="Explores all possibilities level by level. Guarantees the shortest plan but uses more memory."
              pros={["Optimal solution", "Complete"]} 
              cons={["Memory intensive", "Slower for deep problems"]}
            />
            <AlgorithmCard 
              name="A*"
              fullName="A-Star Search"
              color="yellow"
              description="Uses heuristics to guide search. Balances speed and optimality with intelligent exploration."
              pros={["Fast with good heuristics", "Optimal if admissible"]} 
              cons={["Depends on heuristic quality"]}
            />
            <AlgorithmCard 
              name="Greedy"
              fullName="Greedy Best-First"
              color="green"
              description="Always picks the state that looks closest to goal. Fast but may find longer plans."
              pros={["Very fast", "Simple"]} 
              cons={["Not optimal", "Can get stuck"]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Master AI Planning?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students learning classical planning algorithms. 
            Start with interactive lessons, visualize search trees, and build your own planning domains.
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xl transition-all shadow-lg"
          >
            Create Free Account
          </button>
          <p className="mt-4 text-gray-500 text-sm">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="PlanLab" className="w-5 h-5 rounded" />
            <span className="font-semibold text-gray-900">PlanLab</span>
          </div>
          <p className="text-gray-500 text-sm">
            Learn classical planning algorithms interactively
          </p>
        </div>
      </footer>
    </div>
  </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function AlgorithmCard({ 
  name, 
  fullName, 
  color, 
  description, 
  pros, 
  cons 
}: { 
  name: string;
  fullName: string;
  color: 'blue' | 'yellow' | 'green';
  description: string;
  pros: string[];
  cons: string[];
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    green: 'bg-green-50 border-green-200 text-green-900',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-bold">{name}</span>
        <span className="text-sm opacity-75">{fullName}</span>
      </div>
      <p className="text-sm mb-4 opacity-90">{description}</p>
      
      <div className="space-y-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Pros</span>
          <ul className="mt-1 space-y-1">
            {pros.map((pro, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <span className="text-green-600">+</span> {pro}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Cons</span>
          <ul className="mt-1 space-y-1">
            {cons.map((con, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <span className="text-red-500">−</span> {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
