"""h_max heuristic using delete relaxation."""
from .base import HeuristicFunction
from ...representations.state import State


class HMaxHeuristic(HeuristicFunction):
    """
    Max heuristic using delete relaxation.
    h_max(s) = max cost to achieve any single goal in relaxed problem.
    Admissible (never overestimates).
    """
    
    def __init__(self, task):
        super().__init__(task)
        self.cache = {}
    
    def calculate(self, state: State) -> float:
        """Calculate h_max heuristic."""
        state_hash = hash(state)
        if state_hash in self.cache:
            return self.cache[state_hash]
        
        # Build relaxed planning graph
        costs = self._compute_relaxed_costs(state)
        
        # Max cost among all goal predicates
        max_cost = 0.0
        for goal_pred in self.goal:
            if goal_pred in costs:
                max_cost = max(max_cost, costs[goal_pred])
            else:
                # Goal unreachable in relaxed problem
                max_cost = float('inf')
                break
        
        self.cache[state_hash] = max_cost
        return max_cost
    
    def _compute_relaxed_costs(self, state: State) -> dict:
        """
        Compute costs to achieve each predicate in relaxed problem.
        Same as h_add but we take max for action cost.
        """
        # Initialize costs
        costs = {}
        
        # All predicates in initial state have cost 0
        for pred in state.predicates:
            costs[pred] = 0.0
        
        # Iteratively relax until fixed point
        changed = True
        max_iterations = 1000
        iteration = 0
        
        while changed and iteration < max_iterations:
            changed = False
            iteration += 1
            
            for action in self.task.actions:
                # In relaxed problem, ignore delete effects
                pre_costs = []
                applicable = True
                
                for pre in action.preconditions:
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
                for add in action.add_effects:
                    if add not in costs or costs[add] > action_cost:
                        costs[add] = action_cost
                        changed = True
        
        return costs
