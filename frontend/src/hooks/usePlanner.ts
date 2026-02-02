import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { PlanResponse, ValidationResponse, Algorithm, Heuristic } from '../types/planning';

const API_BASE_URL = 'http://localhost:8001';  // API server URL

interface PlanRequest {
  domain_pddl: string;
  problem_pddl: string;
  algorithm: Algorithm;
  heuristic: Heuristic;
  timeout: number;
}

interface ValidationRequest {
  domain_pddl: string;
  problem_pddl: string;
  plan: string[];
}

export function usePlanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = useCallback(async (
    domainPddl: string,
    problemPddl: string,
    algorithm: Algorithm,
    heuristic: Heuristic,
    timeout: number = 30
  ): Promise<PlanResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      
      const response = await axios.post<PlanResponse>(
        `${API_BASE_URL}/api/v1/plan`,
        {
          domain_pddl: domainPddl,
          problem_pddl: problemPddl,
          algorithm,
          heuristic,
          timeout,
        } as PlanRequest
      );
      
      return response.data;
    } catch (err) {
      
      const message = axios.isAxiosError(err) 
        ? err.response?.data?.detail || err.message
        : 'Unknown error occurred';
      setError(message);
      toast.error(`Planning failed: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validate = useCallback(async (
    domainPddl: string,
    problemPddl: string,
    plan: string[]
  ): Promise<ValidationResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<ValidationResponse>(
        `${API_BASE_URL}/api/v1/validate`,
        {
          domain_pddl: domainPddl,
          problem_pddl: problemPddl,
          plan,
        } as ValidationRequest
      );
      return response.data;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : 'Unknown error occurred';
      setError(message);
      toast.error(`Validation failed: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { plan, validate, isLoading, error };
}

export function useBenchmarks() {
  const [benchmarks, setBenchmarks] = useState<{ name: string; domain: string; description: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBenchmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/benchmarks`);
      setBenchmarks(response.data.benchmarks);
    } catch (err) {
      toast.error('Failed to load benchmarks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadBenchmark = useCallback(async (domain: string, name: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/benchmarks/${domain}/${name}`
      );
      return response.data;
    } catch (err) {
      toast.error('Failed to load benchmark');
      return null;
    }
  }, []);

  return { benchmarks, isLoading, fetchBenchmarks, loadBenchmark };
}
