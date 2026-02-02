import { BookOpen, Lightbulb, Target, Zap } from 'lucide-react';

export function LearnPanel() {
  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Learn Planning</h1>
          </div>
          <p className="text-primary-100 text-lg">
            Master classical planning algorithms step by step
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Interactive lessons and tutorials are being developed. 
            Check back soon to start your learning journey!
          </p>
        </div>

        {/* Preview of topics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Search Algorithms</h3>
            <p className="text-sm text-gray-600">Learn BFS, A*, and Greedy search</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Heuristics</h3>
            <p className="text-sm text-gray-600">Understand h_add, h_max, and more</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">PDDL Language</h3>
            <p className="text-sm text-gray-600">Write planning domains</p>
          </div>
        </div>

        {/* Quick tip */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Quick Tip</h4>
              <p className="text-blue-800 text-sm">
                While you wait, try the Editor tab to experiment with different planning domains 
                and see how algorithms work in real-time!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
