import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, BookOpen, Target, Zap, GitBranch, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useEffect } from 'react';

const lessons = [
  {
    id: 'intro',
    title: 'Introduction to STRIPS',
    description: 'Learn what STRIPS is and why it matters in AI planning',
    icon: BookOpen,
    color: 'blue',
    duration: '5 min',
    topics: ['What is planning?', 'The STRIPS formalism', 'Closed world assumption'],
  },
  {
    id: 'predicates',
    title: 'Predicates & States',
    description: 'Understand how to represent the world using predicates',
    icon: Target,
    color: 'green',
    duration: '8 min',
    topics: ['Atomic facts', 'State representation', 'Typed objects'],
  },
  {
    id: 'actions',
    title: 'Actions & Operators',
    description: 'Learn how actions change the state of the world',
    icon: Zap,
    color: 'yellow',
    duration: '10 min',
    topics: ['Preconditions', 'Add & delete effects', 'Parameterization'],
  },
  {
    id: 'bfs',
    title: 'Breadth-First Search',
    description: 'Explore the simplest search algorithm for planning',
    icon: GitBranch,
    color: 'purple',
    duration: '12 min',
    topics: ['Level-by-level exploration', 'Completeness', 'Optimality'],
  },
  {
    id: 'astar',
    title: 'A* Search',
    description: 'Master the most popular informed search algorithm',
    icon: Zap,
    color: 'orange',
    duration: '15 min',
    topics: ['Heuristic functions', 'f = g + h', 'Admissibility'],
  },
  {
    id: 'heuristics',
    title: 'Heuristic Functions',
    description: 'Learn how to estimate distance to the goal',
    icon: Target,
    color: 'pink',
    duration: '12 min',
    topics: ['Goal count', 'h_add & h_max', 'Relaxed planning'],
  },
];

export function LearnPage() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { lessonProgress, updateLessonProgress, fetchLessonProgress } = useProgress(token);
  
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchLessonProgress();
    }
  }, [isAuthenticated, token, fetchLessonProgress]);
  
  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some(l => l.lesson_id === lessonId && l.completed);
  };
  
  const handleStartLesson = async (lessonId: string) => {
    if (isAuthenticated) {
      await updateLessonProgress(lessonId, true, 0);
    }
    // Could navigate to specific lesson page here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white">PlanLab</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-white/80 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-6 py-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Learn Classical Planning
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Master the foundations of AI planning through interactive lessons. 
            From STRIPS basics to advanced search algorithms.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <StatCard number="6" label="Lessons" icon={BookOpen} />
          <StatCard number="3" label="Algorithms" icon={Zap} />
          <StatCard number="∞" label="Possibilities" icon={Target} />
        </div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              isCompleted={isLessonCompleted(lesson.id)}
              onStart={() => handleStartLesson(lesson.id)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Ready to practice what you've learned?</p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 rounded-xl font-bold text-white transition-all shadow-lg shadow-primary-500/25"
          >
            Start Practicing Now
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ number, label, icon: Icon }: { number: string; label: string; icon: any }) {
  return (
    <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-center">
      <Icon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
      <div className="text-3xl font-bold text-white mb-1">{number}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

function LessonCard({ 
  lesson, 
  isCompleted, 
  onStart 
}: { 
  lesson: typeof lessons[0]; 
  isCompleted?: boolean;
  onStart?: () => void;
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400',
  };

  const Icon = lesson.icon;

  return (
    <div className={`p-6 bg-gradient-to-br ${colorClasses[lesson.color as keyof typeof colorClasses]} backdrop-blur-sm border rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-400" />}
          <span className="text-xs font-medium opacity-75">{lesson.duration}</span>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2">{lesson.title}</h3>
      <p className="text-sm text-gray-300 mb-4">{lesson.description}</p>
      
      <div className="space-y-1 mb-4">
        {lesson.topics.map((topic, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-1 h-1 rounded-full bg-current" />
            {topic}
          </div>
        ))}
      </div>

      <button 
        onClick={onStart}
        className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
          isCompleted 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
            : 'bg-white/10 hover:bg-white/20'
        }`}
      >
        {isCompleted ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Completed
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Start Lesson
          </>
        )}
      </button>
    </div>
  );
}
