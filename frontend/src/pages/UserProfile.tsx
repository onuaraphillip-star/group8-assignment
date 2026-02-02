import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, BookOpen, Target, Zap, Award, 
  BarChart3, ChevronLeft, Loader2, Brain, Code2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';

export function UserProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const { 
    stats, 
    lessonProgress, 
    algorithmHistory, 
    isLoading, 
    fetchStats, 
    fetchLessonProgress,
    fetchAlgorithmHistory 
  } = useProgress(token);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchStats();
      fetchLessonProgress();
      fetchAlgorithmHistory(5);
    }
  }, [isAuthenticated, token, fetchStats, fetchLessonProgress, fetchAlgorithmHistory]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/app')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-medium text-gray-800">{user?.full_name || user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <div className="text-center py-20">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Not Logged In</h2>
            <p className="text-gray-500 mb-4">Please sign in to view your profile</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Plans Generated</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {stats?.total_plans_generated || 0}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Problems Solved</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {stats?.total_problems_solved || 0}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Lessons Completed</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {stats?.completed_lessons || 0}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Brain className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-500">Favorite Algorithm</span>
                </div>
                <p className="text-lg font-bold text-gray-800 truncate">
                  {stats?.favorite_algorithm || 'None yet'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lesson Progress */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-500" />
                    <h2 className="font-semibold text-gray-800">Learning Progress</h2>
                  </div>
                </div>
                <div className="p-6">
                  {lessonProgress.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No lessons completed yet.</p>
                      <button 
                        onClick={() => navigate('/learn')}
                        className="mt-3 text-primary-600 hover:underline"
                      >
                        Start learning →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lessonProgress.slice(0, 5).map((lesson) => (
                        <div 
                          key={lesson.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Award className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 capitalize">
                                {lesson.lesson_id.replace(/-/g, ' ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                Completed {formatDate(lesson.completed_at || '')}
                              </p>
                            </div>
                          </div>
                          {lesson.time_spent_seconds > 0 && (
                            <span className="text-xs text-gray-500">
                              {formatDuration(lesson.time_spent_seconds)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Algorithm Usage History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-500" />
                    <h2 className="font-semibold text-gray-800">Recent Algorithm Usage</h2>
                  </div>
                </div>
                <div className="p-6">
                  {algorithmHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No algorithms used yet.</p>
                      <button 
                        onClick={() => navigate('/app')}
                        className="mt-3 text-primary-600 hover:underline"
                      >
                        Try planning →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {algorithmHistory.map((usage, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Code2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {usage.algorithm}
                                {usage.heuristic && (
                                  <span className="text-gray-500 text-sm"> + {usage.heuristic}</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {usage.nodes_expanded} nodes • Plan length: {usage.plan_length}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {(usage.search_time_ms / 1000).toFixed(2)}s
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            {stats && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-500" />
                    <h2 className="font-semibold text-gray-800">Detailed Statistics</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {stats.total_nodes_expanded.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Total Nodes Expanded</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {lessonProgress.filter(l => l.completed).length}
                      </p>
                      <p className="text-sm text-gray-500">Lessons Finished</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {algorithmHistory.length}
                      </p>
                      <p className="text-sm text-gray-500">Algorithm Runs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {formatDuration(
                          lessonProgress.reduce((acc, l) => acc + (l.time_spent_seconds || 0), 0)
                        )}
                      </p>
                      <p className="text-sm text-gray-500">Time Learning</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
