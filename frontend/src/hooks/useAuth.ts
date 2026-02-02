import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8001';

interface User {
  username: string;
  email: string;
  full_name?: string;
  disabled: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setState({
            user: response.data,
            token,
            isAuthenticated: true,
          });
        } catch (err) {
          localStorage.removeItem('token');
          setState({ user: null, token: null, isAuthenticated: false });
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // Fetch user info
      const userResponse = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      
      setState({
        user: userResponse.data,
        token: access_token,
        isAuthenticated: true,
      });
      toast.success('Welcome back!');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    username: string,
    email: string,
    password: string,
    fullName?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Register the user
      await axios.post(`${API_BASE_URL}/api/v1/auth/register`, {
        username,
        email,
        password,
        full_name: fullName,
      });

      // Auto login after registration
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = loginResponse.data;
      localStorage.setItem('token', access_token);

      // Fetch user info
      const userResponse = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      
      setState({
        user: userResponse.data,
        token: access_token,
        isAuthenticated: true,
      });
      toast.success('Account created successfully!');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.token) {
        await axios.post(`${API_BASE_URL}/api/v1/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
      }
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      setState({ user: null, token: null, isAuthenticated: false });
      toast.success('Logged out successfully');
    }
  }, [state.token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    token: state.token,
    login,
    register,
    logout,
    clearError,
    isLoading,
    error,
  };
}
