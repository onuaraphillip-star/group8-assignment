import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

export interface Project {
  id: number;
  project_name: string;
  project_type: 'domain' | 'problem';
  folder_path: string;
  content: string;
  is_shared: boolean;
  share_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  project_name: string;
  project_type: 'domain' | 'problem';
  folder_path: string;
  content: string;
}

export function useProjects(token: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  // Fetch all projects
  const fetchProjects = useCallback(async (folderPath: string = '') => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/projects/?folder_path=${encodeURIComponent(folderPath)}`,
        { headers: getAuthHeaders() }
      );
      setProjects(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Create a new project
  const createProject = useCallback(async (project: ProjectCreate): Promise<Project | null> => {
    if (!token) return null;
    
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects/`,
        project,
        { headers: getAuthHeaders() }
      );
      await fetchProjects(project.folder_path);
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchProjects]);

  // Update a project
  const updateProject = useCallback(async (
    projectId: number, 
    content: string, 
    projectName?: string
  ): Promise<boolean> => {
    if (!token) return false;
    
    setIsLoading(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/projects/${projectId}`,
        { content, project_name: projectName },
        { headers: getAuthHeaders() }
      );
      await fetchProjects();
      setError(null);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update project');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchProjects]);

  // Delete a project
  const deleteProject = useCallback(async (projectId: number): Promise<boolean> => {
    if (!token) return false;
    
    setIsLoading(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/api/v1/projects/${projectId}`,
        { headers: getAuthHeaders() }
      );
      await fetchProjects();
      setError(null);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete project');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchProjects]);

  // Get a single project
  const getProject = useCallback(async (projectId: number): Promise<Project | null> => {
    if (!token) return null;
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/projects/${projectId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch project');
      return null;
    }
  }, [token]);

  // Share a project
  const shareProject = useCallback(async (projectId: number): Promise<string | null> => {
    if (!token) return null;
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects/${projectId}/share`,
        {},
        { headers: getAuthHeaders() }
      );
      await fetchProjects();
      return response.data.share_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to share project');
      return null;
    }
  }, [token, fetchProjects]);

  // Get shared project (public)
  const getSharedProject = useCallback(async (shareId: string): Promise<Project | null> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/projects/shared/${shareId}`
      );
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch shared project');
      return null;
    }
  }, []);

  // Load projects on mount
  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token, fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    shareProject,
    getSharedProject,
  };
}
