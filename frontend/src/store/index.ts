import { create } from 'zustand';
import { PlanResponse, ValidationResponse, Algorithm, Heuristic, BenchmarkInfo } from '../types/planning';

interface EditorHistory {
  domainPddl: string;
  problemPddl: string;
  timestamp: number;
}

interface EditorState {
  domainPddl: string;
  problemPddl: string;
  history: EditorHistory[];
  historyIndex: number;
  setDomainPddl: (content: string) => void;
  setProblemPddl: (content: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

interface PlannerState {
  algorithm: Algorithm;
  heuristic: Heuristic;
  timeout: number;
  isLoading: boolean;
  result: PlanResponse | null;
  setAlgorithm: (algo: Algorithm) => void;
  setHeuristic: (heuristic: Heuristic) => void;
  setSearchTimeout: (timeout: number) => void;
  setLoading: (loading: boolean) => void;
  setResult: (result: PlanResponse | null) => void;
}

interface ValidationState {
  planText: string;
  validationResult: ValidationResponse | null;
  setPlanText: (text: string) => void;
  setValidationResult: (result: ValidationResponse | null) => void;
}

interface UIState {
  activeTab: 'editor' | 'visualization' | 'validation' | 'animation' | 'comparison';
  selectedBenchmark: string | null;
  benchmarks: BenchmarkInfo[];
  setActiveTab: (tab: 'editor' | 'visualization' | 'validation' | 'animation' | 'comparison') => void;
  setSelectedBenchmark: (benchmark: string | null) => void;
  setBenchmarks: (benchmarks: BenchmarkInfo[]) => void;
}

interface PlanPlayerState {
  currentStep: number;
  isPlaying: boolean;
  playbackSpeed: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorState>((set, get) => ({
  domainPddl: '',
  problemPddl: '',
  history: [],
  historyIndex: -1,
  
  setDomainPddl: (content) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      domainPddl: content,
      problemPddl: state.problemPddl,
      timestamp: Date.now()
    });
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    set({ 
      domainPddl: content,
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
    // Auto-save to localStorage
    localStorage.setItem('strips_ng_domain', content);
  },
  
  setProblemPddl: (content) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      domainPddl: state.domainPddl,
      problemPddl: content,
      timestamp: Date.now()
    });
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    set({ 
      problemPddl: content,
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
    // Auto-save to localStorage
    localStorage.setItem('strips_ng_problem', content);
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const entry = state.history[newIndex];
      set({
        domainPddl: entry.domainPddl,
        problemPddl: entry.problemPddl,
        historyIndex: newIndex
      });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const entry = state.history[newIndex];
      set({
        domainPddl: entry.domainPddl,
        problemPddl: entry.problemPddl,
        historyIndex: newIndex
      });
    }
  },
  
  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  }
}));

export const usePlannerStore = create<PlannerState>((set) => ({
  algorithm: 'astar',
  heuristic: 'h_add',
  timeout: 30,
  isLoading: false,
  result: null,
  setAlgorithm: (algo) => set({ algorithm: algo }),
  setHeuristic: (heuristic) => set({ heuristic }),
  setSearchTimeout: (timeout) => set({ timeout }),
  setLoading: (loading) => set({ isLoading: loading }),
  setResult: (result) => set({ result }),
}));

export const useValidationStore = create<ValidationState>((set) => ({
  planText: '',
  validationResult: null,
  setPlanText: (text) => set({ planText: text }),
  setValidationResult: (result) => set({ validationResult: result }),
}));

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'editor',
  selectedBenchmark: null,
  benchmarks: [],
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedBenchmark: (benchmark) => set({ selectedBenchmark: benchmark }),
  setBenchmarks: (benchmarks) => set({ benchmarks }),
}));

export const usePlanPlayerStore = create<PlanPlayerState>((set) => ({
  currentStep: 0,
  isPlaying: false,
  playbackSpeed: 1,
  setCurrentStep: (step: number | ((prev: number) => number)) => set((state) => ({ 
    currentStep: typeof step === 'function' ? (step as (prev: number) => number)(state.currentStep) : step 
  })),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  reset: () => set({ currentStep: 0, isPlaying: false, playbackSpeed: 1 }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
}));

// Auth State
interface AuthState {
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  setRegisterModalOpen: (open: boolean) => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),
  setRegisterModalOpen: (open) => set({ isRegisterModalOpen: open }),
  switchToRegister: () => set({ isLoginModalOpen: false, isRegisterModalOpen: true }),
  switchToLogin: () => set({ isLoginModalOpen: true, isRegisterModalOpen: false }),
}));
