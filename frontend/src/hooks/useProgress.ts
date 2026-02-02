import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

export interface UserStats {
  username: string;
  total_plans_generated: number;
  total_problems_solved: number;
  total_nodes_expanded: number;
  favorite_algorithm: string | null;
  completed_lessons: number;
}

export interface AlgorithmUsage {
  id?: number;
  algorithm: string;
  heuristic?: string;
  problem_name?: string;
  nodes_expanded: number;
  plan_length: number;
  search_time_ms: number;
  used_at?: string;
}

export interface LessonProgress {
  id?: number;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  time_spent_seconds: number;
}

export function useProgress(token: string | null) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [algorithmHistory, setAlgorithmHistory] = useState<AlgorithmUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  // Fetch user statistics
  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/progress/stats`, {
        headers: getAuthHeaders(),
      });
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch lesson progress
  const fetchLessonProgress = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/progress/lessons`, {
        headers: getAuthHeaders(),
      });
      setLessonProgress(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch lesson progress');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Update lesson progress
  const updateLessonProgress = useCallback(async (
    lessonId: string, 
    completed: boolean = true, 
    timeSpent: number = 0
  ) => {
    if (!token) return false;
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/progress/lessons/${lessonId}`,
        { completed, time_spent_seconds: timeSpent },
        { headers: getAuthHeaders() }
      );
      await fetchLessonProgress();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update progress');
      return false;
    }
  }, [token, fetchLessonProgress]);

  // Track plan generated
  const trackPlanGenerated = useCallback(async () => {
    if (!token) return;
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/progress/plan-generated`,
        {},
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      // Silently fail - analytics shouldn't break the app
    }
  }, [token]);

  // Track problem solved
  const trackProblemSolved = useCallback(async (nodesExpanded: number = 0) => {
    if (!token) return;
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/progress/problem-solved?nodes_expanded=${nodesExpanded}`,
        {},
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      // Silently fail
    }
  }, [token]);

  // Track algorithm usage
  const trackAlgorithmUsage = useCallback(async (usage: AlgorithmUsage) => {
    if (!token) return;
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/progress/algorithm-used`,
        usage,
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      // Silently fail
    }
  }, [token]);

  // Fetch algorithm history
  const fetchAlgorithmHistory = useCallback(async (limit: number = 10) => {
    if (!token) return;
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/progress/algorithm-history?limit=${limit}`,
        { headers: getAuthHeaders() }
      );
      setAlgorithmHistory(response.data);
    } catch (err) {
      // Silently fail
    }
  }, [token]);

  // Load data on mount
  useEffect(() => {
    if (token) {
      fetchStats();
      fetchLessonProgress();
      fetchAlgorithmHistory();
    }
  }, [token, fetchStats, fetchLessonProgress, fetchAlgorithmHistory]);

  return {
    stats,
    lessonProgress,
    algorithmHistory,
    isLoading,
    error,
    fetchStats,
    fetchLessonProgress,
    updateLessonProgress,
    trackPlanGenerated,
    trackProblemSolved,
    trackAlgorithmUsage,
    fetchAlgorithmHistory,
  };
}
