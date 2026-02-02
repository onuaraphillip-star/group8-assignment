export interface ActionResult {
  action: string;
  preconditions: string[];
  effects_add: string[];
  effects_del: string[];
}

export interface SearchMetrics {
  nodes_expanded: number;
  nodes_generated: number;
  plan_length: number;
  search_time_ms: number;
  heuristic_calls: number;
  initial_h: number;
  final_h: number;
}

export interface SearchTreeNode {
  id: string;
  state_hash: number;
  heuristic: number;
  depth: number;
  g_cost: number;
  is_goal: boolean;
  is_expanded: boolean;
}

export interface SearchTreeEdge {
  source: string;
  target: string;
  action: string | null;
}

export interface SearchTree {
  nodes: SearchTreeNode[];
  edges: SearchTreeEdge[];
}

export interface PlanResponse {
  success: boolean;
  plan: ActionResult[];
  metrics: SearchMetrics | null;
  search_tree: SearchTree | null;
  error_message: string | null;
}

export interface ValidationStep {
  step: number;
  state: string[];
  action: string | null;
  action_applicable: boolean | null;
}

export interface ValidationResponse {
  valid: boolean;
  error_step: number | null;
  error_message: string | null;
  final_state: string[] | null;
  execution_trace: ValidationStep[];
}

export interface BenchmarkInfo {
  name: string;
  domain: string;
  description: string;
}

export type Algorithm = 'bfs' | 'astar' | 'greedy';
export type Heuristic = 'goal_count' | 'h_add' | 'h_max';
