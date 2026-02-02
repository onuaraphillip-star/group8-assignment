import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ChevronLeft, Play, Target, Zap, 
  GitBranch, CheckCircle, ArrowRight,
  Lightbulb, Code, Puzzle, Trophy
} from 'lucide-react';
import { SEO } from '../components/SEO/SEO';

export function Learn() {
  const navigate = useNavigate();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('planlab_completed_lessons');
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, []);

  const isCompleted = (id: string) => completedLessons.includes(id);
  const completedCount = completedLessons.length;

  const lessons = [
    {
      id: 'intro',
      title: 'Introduction to Planning',
      description: 'What is AI planning and why does it matter?',
      icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
      duration: '5 min',
      
    },
    {
      id: 'pddl',
      title: 'PDDL Basics',
      description: 'Learn the language of planning domains',
      icon: <Code className="w-6 h-6 text-blue-500" />,
      duration: '10 min',
      
    },
    {
      id: 'bfs',
      title: 'Breadth-First Search',
      description: 'Explore all possibilities level by level',
      icon: <GitBranch className="w-6 h-6 text-green-500" />,
      duration: '8 min',
      
    },
    {
      id: 'astar',
      title: 'A* Search',
      description: 'Use heuristics to search smarter',
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      duration: '12 min',
      
    },
    {
      id: 'heuristics',
      title: 'Understanding Heuristics',
      description: 'h_add, h_max, and goal counting',
      icon: <Target className="w-6 h-6 text-red-500" />,
      duration: '10 min',
      
    },
    {
      id: 'practice',
      title: 'Practice Problems',
      description: 'Apply what you learned',
      icon: <Puzzle className="w-6 h-6 text-orange-500" />,
      duration: '15 min',
      
    },
  ];

  return (
    <>
      <SEO title="Learn" description="Master AI planning with interactive lessons on search algorithms, heuristics, and PDDL." pathname="/learn" />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
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
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="PlanLab" className="w-10 h-10 rounded-lg" />
              <h1 className="text-2xl font-bold text-gray-800">Learn</h1>
            </div>
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
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-3">Master Classical Planning</h2>
          <p className="text-primary-100 text-lg max-w-2xl">
            Learn the fundamentals of AI planning through interactive lessons. 
            Start from the basics and work your way up to advanced algorithms.
          </p>
          <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span>6 Lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              <span>~1 Hour</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Your Progress</h3>
            <span className="text-sm text-gray-500">{completedCount} of 6 completed</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${(completedCount / 6) * 100}%` }} />
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg">Lessons</h3>
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => navigate(`/learn/${lesson.id}`)}
              className={`bg-white rounded-xl p-6 shadow-sm border transition-all cursor-pointer ${
                  isCompleted(lesson.id) 
                    ? 'border-green-300 hover:border-green-400' 
                    : 'border-gray-200 hover:shadow-md hover:border-primary-300'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  {lesson.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-medium">{index + 1}</span>
                    <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                    {isCompleted(lesson.id) && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{lesson.duration}</span>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Start CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/learn/intro')}
            className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
          >
            Start Learning
          </button>
        </div>
      </main>
    </div>
  </>
  );
}
