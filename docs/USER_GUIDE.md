# PlanLab User Guide

Complete guide for using the PlanLab Classical Planning Workbench.

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Learning Path](#the-learning-path)
3. [Using the PDDL Editor](#using-the-pddl-editor)
4. [Running Planning Algorithms](#running-planning-algorithms)
5. [Visualizing Search](#visualizing-search)
6. [Animating Plans](#animating-plans)
7. [Comparing Algorithms](#comparing-algorithms)
8. [Managing Your Account](#managing-your-account)

---

## Getting Started

### Creating an Account

1. Visit http://localhost:5173
2. Click "Get Started" or "Sign Up"
3. Enter your username, email, and password
4. Click "Create Account"

### Logging In

1. Click "Sign In" on the landing page
2. Enter your username and password
3. Click "Sign In"

### Navigating the Interface

The main application has three panels:
- **Left Sidebar**: Domain browser and file explorer
- **Center Panel**: Editor, visualization, and animation tabs
- **Right Panel**: Statistics and configuration

---

## The Learning Path

PlanLab includes a structured educational module with 6 lessons:

### Lesson 1: Introduction to Planning
Learn what AI planning is, classical planning assumptions, and the planning problem structure.

### Lesson 2: PDDL Basics
Understand the Planning Domain Definition Language, domain files, and problem files.

### Lesson 3: Breadth-First Search
Explore uninformed search and how BFS guarantees optimal solutions.

### Lesson 4: A* Search
Learn about informed search and how heuristics guide the search process.

### Lesson 5: Understanding Heuristics
Deep dive into h_add, h_max, and goal counting heuristics.

### Lesson 6: Practice Problems
Apply your knowledge with Blocksworld, Gripper, and Towers of Hanoi problems.

### Taking Lessons

1. Click "Learn" in the header
2. Select a lesson from the list
3. Read through each section (click "Read more" to expand)
4. Explore the educational links
5. Take the quiz at the end
6. Need 2/3 correct answers to pass and unlock the next lesson

---

## Using the PDDL Editor

### Writing a Domain

1. Select "Editor" tab
2. In the Domain panel, define your domain:

```lisp
(define (domain my-domain)
  (:requirements :strips :typing)
  (:types object-type)
  (:predicates (predicate-name ?x - object-type))
  
  (:action action-name
    :parameters (?x - object-type)
    :precondition (and (pred1 ?x) (pred2 ?x))
    :effect (and (add-pred ?x) (not (del-pred ?x)))
  )
)
```

### Writing a Problem

In the Problem panel:

```lisp
(define (problem my-problem)
  (:domain my-domain)
  (:objects obj1 obj2 - object-type)
  (:init (pred1 obj1) (pred2 obj2))
  (:goal (and (goal-pred obj1) (goal-pred obj2)))
)
```

### Editor Features

- **Syntax Highlighting**: Keywords, types, and predicates are color-coded
- **Error Detection**: Invalid syntax is highlighted
- **Auto-save**: Your work is automatically saved to localStorage
- **Undo/Redo**: Use Ctrl+Z and Ctrl+Y

### Loading Benchmarks

1. Open the Domain Browser (left sidebar)
2. Select a domain (Blocksworld, Gripper, Hanoi, TyreWorld)
3. Select a problem instance
4. Click "Load" to populate the editor

---

## Running Planning Algorithms

### Selecting an Algorithm

1. Write or load your domain and problem
2. Select algorithm from dropdown:
   - **BFS**: Breadth-First Search (optimal, slow)
   - **DFS**: Depth-First Search (fast, not optimal)
   - **A***: A-Star Search (optimal with good heuristic)
   - **Greedy**: Greedy Best-First (fast, not optimal)

### Selecting a Heuristic

For A* and Greedy:
- **h_add**: Additive heuristic (sum of individual goal costs)
- **h_max**: Max heuristic (maximum goal cost)
- **h_ff**: FastForward heuristic (relaxed plan length)
- **goal_count**: Simple goal counting

### Running the Planner

1. Click "Solve" button
2. View results in right panel:
   - Success/Failure status
   - Plan (sequence of actions)
   - Nodes expanded
   - Search time
   - Plan length

---

## Visualizing Search

### Understanding the Visualization

The Visualization tab shows how the search algorithm explored the state space:

- **Nodes**: Represent world states
- **Edges**: Represent actions
- **Green node**: Initial state
- **Red node**: Goal state
- **Blue nodes**: Explored states
- **Yellow node**: Current state being expanded

### Navigation

- **Zoom**: Mouse wheel or pinch gesture
- **Pan**: Click and drag
- **Select node**: Click to see state details

### Playback Controls

- **Play**: Animate the search process
- **Pause**: Stop animation
- **Step**: Advance one step
- **Reset**: Return to initial state

---

## Animating Plans

### Running an Animation

1. Generate a plan first
2. Click "Animation" tab
3. Select domain visualization:
   - Blocksworld: Blocks on table
   - Gripper: Robot moving balls
   - Hanoi: Towers of Hanoi
   - TyreWorld: Vehicle maintenance

### Animation Controls

- **Play/Pause**: Start or stop animation
- **Speed**: Adjust playback speed (0.5x - 3x)
- **Step Forward/Back**: Move one action at a time
- **Reset**: Return to initial state

### Understanding the Animation

Each action in the plan is visualized:
- **Blocksworld**: Robot arm picks up, moves, and stacks blocks
- **Gripper**: Robot travels between rooms carrying balls
- **Hanoi**: Disks move between pegs following the rules
- **TyreWorld**: Mechanic performs maintenance tasks

---

## Comparing Algorithms

### Setting Up Comparison

1. Click "Comparison" tab
2. Select two different algorithms
3. Choose heuristics (for informed search)
4. Click "Compare"

### Understanding Results

The comparison shows:
- **Plan Length**: Number of actions in solution
- **Nodes Expanded**: Search effort
- **Search Time**: Computation time
- **Optimality**: Whether solution is optimal

### Interpreting Results

- **BFS vs A***: A* should expand fewer nodes with good heuristic
- **A* vs Greedy**: Greedy is faster but may find longer plans
- **Effect of Heuristic**: Better heuristics reduce search effort

---

## Managing Your Account

### Viewing Profile

1. Click your username in the header
2. View statistics:
   - Total plans generated
   - Problems solved
   - Favorite algorithm
   - Lessons completed

### Changing Password

1. Go to Profile page
2. Click "Change Password"
3. Enter current and new password
4. Click "Update"

### Tracking Progress

The Learn page shows:
- Overall progress bar
- Completed lessons (green checkmark)
- Current lesson
- Quiz scores

---

## Tips and Best Practices

### Writing Good PDDL

1. **Use meaningful names**: `block-a` not `b1`
2. **Add comments**: Use `;` for comments
3. **Check preconditions**: Ensure actions are applicable
4. **Test incrementally**: Start with simple problems

### Choosing Algorithms

- Use **BFS** for small problems where optimality matters
- Use **A*** with **h_add** or **h_ff** for larger problems
- Use **Greedy** when speed is more important than optimality

### Debugging Failed Plans

1. Check PDDL syntax
2. Verify initial state includes all necessary predicates
3. Ensure goal is achievable
4. Check action preconditions are satisfiable
5. Increase timeout for complex problems

---

## Troubleshooting

### Backend not starting
- Check port 8001 is not in use
- Verify Python dependencies are installed
- Check `src/main.py` exists

### Frontend not loading
- Check port 5173 is not in use
- Run `npm install` in frontend directory
- Check for TypeScript errors

### Plan not found
- Increase timeout
- Check PDDL syntax
- Simplify problem
- Try different algorithm

---

## Getting Help

- **Documentation**: http://localhost:5173/docs
- **API Docs**: http://localhost:8001/docs
- **Issues**: Open an issue on GitHub

---

**Happy Learning! 🎓**
