"""h_add heuristic using delete relaxation."""
from .base import HeuristicFunction
from ...representations.state import State


class HAddHeuristic(HeuristicFunction):
    """
    Additive heuristic using delete relaxation.
    h_add(s) = sum of costs to achieve each goal in relaxed problem.
    Admissible for positive interactions.
    """
    
    def __init__(self, task):
        super().__init__(task)
        self.cache = {}
        self._precomputed = False
        self._action_preconditions = {}  # Precompute action preconditions
        self._action_effects = {}        # Precompute action effects
        
    def _precompute(self):
        """Precompute action data for faster heuristic calculation."""
        if self._precomputed:
            return
            
        for action in self.task.actions:
            self._action_preconditions[action] = frozenset(action.preconditions)
            self._action_effects[action] = frozenset(action.add_effects)
        
        self._precomputed = True
    
    def calculate(self, state: State) -> float:
        """Calculate h_add heuristic."""
        self._precompute()
        
        state_hash = hash(state)
        if state_hash in self.cache:
            return self.cache[state_hash]
        
        # Build relaxed planning graph
        costs = self._compute_relaxed_costs(state)
        
        # Sum costs for all goal predicates
        total = 0.0
        for goal_pred in self.goal:
            if goal_pred in costs:
                total += costs[goal_pred]
            else:
                # Goal unreachable in relaxed problem
                total = float('inf')
                break
        
        self.cache[state_hash] = total
        return total
    
    def _compute_relaxed_costs(self, state: State) -> dict:
        """
        Compute costs to achieve each predicate in relaxed problem.
        Uses optimized Dijkstra-like propagation.
        """
        # Initialize costs with state predicates
        costs = {pred: 0.0 for pred in state.predicates}
        
        # Worklist: predicates whose cost changed
        changed = set(state.predicates)
        
        # Pre-filter actions by checking if any effect is relevant
        relevant_actions = []
        for action in self.task.actions:
            effects = self._action_effects[action]
            # Only include actions that produce something useful
            relevant_actions.append((action, self._action_preconditions[action], effects))
        
        max_iterations = 1000
        iteration = 0
        
        while changed and iteration < max_iterations:
            iteration += 1
            new_changed = set()
            
            for action, preconditions, effects in relevant_actions:
                # Check if all preconditions are satisfied
                pre_costs = []
                applicable = True
                
                for pre in preconditions:
                    if pre in costs:
                        pre_costs.append(costs[pre])
                    else:
                        applicable = False
                        break
                
                if not applicable:
                    continue
                
                # Action cost = 1 + max precondition cost
                action_cost = 1.0
                if pre_costs:
                    action_cost += max(pre_costs)
                
                # Update costs for add effects
                for add in effects:
                    if add not in costs or costs[add] > action_cost:
                        costs[add] = action_cost
                        new_changed.add(add)
            
            changed = new_changed
        
        return costs
