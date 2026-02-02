import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, CheckCircle, XCircle, BookOpen, 
  ExternalLink, Play, Lock, Trophy, ArrowRight,
  RotateCcw
} from 'lucide-react';
import { SEO } from '../components/SEO/SEO';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LessonContent {
  id: string;
  title: string;
  duration: string;
  sections: {
    title: string;
    content: string;
    links?: { title: string; url: string; description: string }[];
  }[];
  questions: Question[];
}

const lessonsData: Record<string, LessonContent> = {
  intro: {
    id: 'intro',
    title: 'Introduction to Planning',
    duration: '5 min',
    sections: [
      {
        title: 'What is AI Planning?',
        content: `Artificial Intelligence Planning is the task of finding a sequence of actions that transforms an initial state into a goal state. It's one of the fundamental problems in AI, with applications in robotics, logistics, scheduling, and more.

Imagine you have a robot in a room that needs to pick up objects and deliver them to specific locations. Planning helps the robot figure out the exact sequence of moves to accomplish this task efficiently.

The key insight is that planning separates the "what" (the goal) from the "how" (the sequence of actions). This makes it incredibly powerful for solving complex real-world problems.`,
        links: [
          { 
            title: 'AI Planning Overview - JAIR', 
            url: 'https://www.jair.org/index.php/jair/article/view/10265',
            description: 'Comprehensive survey on AI planning fundamentals'
          },
          { 
            title: 'Planning in AI - GeeksforGeeks', 
            url: 'https://www.geeksforgeeks.org/artificial-intelligence/what-is-the-role-of-planning-in-artificial-intelligence/',
            description: 'Beginner-friendly introduction with examples'
          },
        ]
      },
      {
        title: 'Classical Planning',
        content: `Classical planning makes several simplifying assumptions:
• Fully observable environment (we know the complete state)
• Deterministic actions (actions have predictable outcomes)
• Static environment (only the agent changes the world)
• Discrete time (actions happen one at a time)
• Single agent (no other agents to consider)

While these assumptions seem restrictive, classical planning provides the foundation for more complex planning paradigms. Understanding classical planning is essential before moving to probabilistic, temporal, or multi-agent planning.`,
        links: [
          { 
            title: 'Classical Planning - AIMA', 
            url: 'https://aima.cs.berkeley.edu/2nd-ed/newchap11.pdf',
            description: 'Chapter on classical planning from AI: A Modern Approach'
          },
          { 
            title: 'PDDL Wiki', 
            url: 'https://en.wikipedia.org/wiki/Planning_Domain_Definition_Language',
            description: 'Wikipedia article on PDDL with examples'
          },
        ]
      },
      {
        title: 'The Planning Problem',
        content: `A planning problem consists of three components:

1. Initial State: The starting configuration of the world
2. Goal State: The desired configuration we want to achieve
3. Actions: The available operations that can change the state

The planner's job is to search through the space of possible states, finding a path from the initial state to the goal state. This is essentially a graph search problem, where nodes are states and edges are actions.

The challenge is that the state space can be enormous. Even simple problems can have billions of possible states, making efficient search algorithms crucial.`,
        links: [
          { 
            title: 'State Space Search', 
            url: 'https://www.geeksforgeeks.org/search-algorithms-in-ai/',
            description: 'Explanation of state space search in AI'
          },
          { 
            title: 'Planning Problem Formulation', 
            url: 'https://www.cs.cmu.edu/~avrim/451f11/lectures/lect1025.pdf',
            description: 'CMU lecture on planning problem formulation'
          },
        ]
      },
    ],
    questions: [
      {
        id: 1,
        question: 'What are the key assumptions of classical planning?',
        options: [
          'Partially observable, stochastic, dynamic environment',
          'Fully observable, deterministic, static environment',
          'Multi-agent, continuous time, probabilistic',
          'Unknown initial state, learning required'
        ],
        correctAnswer: 1,
        explanation: 'Classical planning assumes fully observable, deterministic actions in a static environment with discrete time and a single agent.'
      },
      {
        id: 2,
        question: 'What does a planning problem consist of?',
        options: [
          'Only the goal state',
          'Initial state, goal state, and available actions',
          'Just a sequence of actions',
          'A neural network and training data'
        ],
        correctAnswer: 1,
        explanation: 'A planning problem requires an initial state, a goal state, and the set of actions that can transform one state into another.'
      },
      {
        id: 3,
        question: 'Why is planning considered a search problem?',
        options: [
          'Because it uses Google Search',
          'Because it searches through state space to find a path to the goal',
          'Because it searches the internet for solutions',
          'Because it searches for the best neural network'
        ],
        correctAnswer: 1,
        explanation: 'Planning is a search problem because it explores the state space (nodes as states, edges as actions) to find a valid path from initial to goal state.'
      },
    ]
  },
  pddl: {
    id: 'pddl',
    title: 'PDDL Basics',
    duration: '10 min',
    sections: [
      {
        title: 'What is PDDL?',
        content: `PDDL (Planning Domain Definition Language) is the standard language for describing planning problems. It was developed in 1998 to provide a common format for the International Planning Competition.

PDDL separates the problem description into two files:
• Domain file: Defines the types, predicates, and actions available
• Problem file: Specifies the initial state and goal state

This separation allows the same domain to be used with different problems, and vice versa. It's similar to how programming languages separate classes from instances.`,
        links: [
          { 
            title: 'PDDL Specification', 
            url: 'https://planning.wiki/ref/pddl',
            description: 'The Planning Wiki PDDL reference'
          },
          { 
            title: 'PDDL Tutorial', 
            url: 'https://www.youtube.com/watch?v=1Y9r0rP1_1U',
            description: 'Video tutorial on PDDL syntax'
          },
        ]
      },
      {
        title: 'Domain Structure',
        content: `A PDDL domain file contains:

1. Requirements: (:requirements :strips :typing)
2. Types: (:types block robot)
3. Predicates: (:predicates (on ?x ?y) (clear ?x))
4. Actions: (:action pick-up :parameters (?x) ...)

Actions define how the world changes. Each action has:
• Parameters: Variables that represent objects
• Precondition: What must be true to execute
• Effect: What changes after execution

The STRIPS subset (Stanford Research Institute Problem Solver) is the most common, using simple add/delete lists for effects.`,
        links: [
          { 
            title: 'PDDL Examples', 
            url: 'https://github.com/potassco/pddl-instances',
            description: 'Collection of example PDDL domain files'
          },
          { 
            title: 'STRIPS Planning', 
            url: 'https://en.wikipedia.org/wiki/Stanford_Research_Institute_Problem_Solver',
            description: 'Wikipedia article on STRIPS and its history'
          },
        ]
      },
      {
        title: 'Problem Structure',
        content: `A PDDL problem file references a domain and specifies:

1. Objects: (:objects block1 block2 block3 - block)
2. Initial State: (:init (on-table block1) (clear block1))
3. Goal State: (:goal (and (on block1 block2) (on block2 block3)))

The initial state lists all true predicates. Everything not listed is assumed false (closed-world assumption).

Goals can be conjunctions (and...), disjunctions (or...), or negations (not...). Complex goals enable sophisticated planning scenarios.`,
        links: [
          { 
            title: 'PDDL Examples', 
            url: 'https://planning.wiki/ref/pddl21/domain',
            description: 'Example domains from the Planning Wiki'
          },
          { 
            title: 'Planning.Domains', 
            url: 'http://www.planning.domains/',
            description: 'Repository of planning domains and problems'
          },
        ]
      },
    ],
    questions: [
      {
        id: 1,
        question: 'What does PDDL stand for?',
        options: [
          'Program Design and Development Language',
          'Planning Domain Definition Language',
          'Problem Domain Description Logic',
          'Process Design Definition Layer'
        ],
        correctAnswer: 1,
        explanation: 'PDDL stands for Planning Domain Definition Language, the standard language for describing planning problems.'
      },
      {
        id: 2,
        question: 'What are the two main files in PDDL?',
        options: [
          'Input file and Output file',
          'Domain file and Problem file',
          'Code file and Data file',
          'Header file and Source file'
        ],
        correctAnswer: 1,
        explanation: 'PDDL uses a domain file (defining types, predicates, actions) and a problem file (defining initial state and goal).'
      },
      {
        id: 3,
        question: 'What is the closed-world assumption in PDDL?',
        options: [
          'All predicates are true by default',
          'Everything not listed in :init is false',
          'The world never changes',
          'Only one action can be executed'
        ],
        correctAnswer: 1,
        explanation: 'The closed-world assumption means any predicate not explicitly stated in the :init section is considered false.'
      },
    ]
  },
  bfs: {
    id: 'bfs',
    title: 'Breadth-First Search',
    duration: '8 min',
    sections: [
      {
        title: 'Understanding BFS',
        content: `Breadth-First Search (BFS) is a fundamental graph search algorithm that explores all nodes at the present depth before moving on to nodes at the next depth level.

In planning, BFS explores all states reachable with 1 action, then all states reachable with 2 actions, and so on. This guarantees that the first solution found uses the minimum number of actions.

BFS is complete (will find a solution if one exists) and optimal for unweighted graphs (finds the shortest path). However, it requires significant memory to store all explored states.`,
        links: [
          { 
            title: 'BFS Visualization', 
            url: 'https://visualgo.net/en/dfsbfs',
            description: 'Interactive visualization of BFS algorithm'
          },
          { 
            title: 'BFS Algorithm', 
            url: 'https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/',
            description: 'Implementation guide with code examples'
          },
        ]
      },
      {
        title: 'BFS for Planning',
        content: `When applied to planning:

1. Start with the initial state in a queue
2. Dequeue a state and generate all successor states
3. Check if any successor is the goal
4. Enqueue all new states
5. Repeat until goal found or queue empty

The algorithm naturally finds the shortest plan (fewest actions) because it explores in order of plan length.

The main limitation is the exponential growth of states. For complex domains, BFS quickly runs out of memory.`,
        links: [
          { 
            title: 'Search in Planning', 
            url: 'https://www.cs.cmu.edu/~avrim/451f11/lectures/lect1025.pdf',
            description: 'CMU lecture notes on search in planning'
          },
          { 
            title: 'Pathfinding Algorithms', 
            url: 'https://www.redblobgames.com/pathfinding/a-star/introduction.html',
            description: 'Excellent explanation with interactive demos'
          },
        ]
      },
      {
        title: 'When to Use BFS',
        content: `Use BFS when:
• You need the shortest possible plan
• The state space is relatively small
• Memory is not a constraint
• All actions have equal cost

Avoid BFS when:
• The state space is very large
• You need a solution quickly (not necessarily optimal)
• Actions have different costs
• Memory is limited

In practice, BFS serves as a baseline. More sophisticated algorithms like A* are typically preferred for real planning problems.`,
        links: [
          { 
            title: 'BFS Analysis', 
            url: 'https://www.geeksforgeeks.org/analysis-of-breadth-first-search/',
            description: 'Analysis of BFS time and space complexity'
          },
          { 
            title: 'Uninformed Search', 
            url: 'https://www.tpointtech.com/ai-uninformed-search-algorithms',
            description: 'Comparison of uninformed search methods'
          },
        ]
      },
    ],
    questions: [
      {
        id: 1,
        question: 'What is the main advantage of BFS in planning?',
        options: [
          'It uses very little memory',
          'It guarantees finding the shortest plan',
          'It works well with large state spaces',
          'It is faster than all other algorithms'
        ],
        correctAnswer: 1,
        explanation: 'BFS explores states in order of depth, so the first solution found is guaranteed to have the minimum number of actions.'
      },
      {
        id: 2,
        question: 'What is the main limitation of BFS?',
        options: [
          'It never finds a solution',
          'It requires exponential memory',
          'It only works with one action type',
          'It cannot handle goal states'
        ],
        correctAnswer: 1,
        explanation: 'BFS stores all explored states, requiring memory exponential in the search depth, which limits its applicability.'
      },
      {
        id: 3,
        question: 'When should you use BFS over other algorithms?',
        options: [
          'When memory is very limited',
          'When you need the shortest plan and have enough memory',
          'When actions have different costs',
          'When you do not care about solution quality'
        ],
        correctAnswer: 1,
        explanation: 'BFS is ideal when finding the shortest plan is important and you have sufficient memory for the search.'
      },
    ]
  },
  astar: {
    id: 'astar',
    title: 'A* Search',
    duration: '12 min',
    sections: [
      {
        title: 'Introduction to A*',
        content: `A* (A-star) is the most popular informed search algorithm. It combines the actual cost from the start (g) with an estimate of cost to the goal (h) to guide the search efficiently.

The key formula is: f(n) = g(n) + h(n)

Where:
• g(n) = actual cost from start to node n
• h(n) = heuristic estimate from n to goal
• f(n) = estimated total cost through n

With an admissible heuristic (never overestimates), A* is both complete and optimal while exploring far fewer states than BFS.`,
        links: [
          { 
            title: 'A* Pathfinding', 
            url: 'https://www.redblobgames.com/pathfinding/a-star/introduction.html',
            description: 'Best visual explanation of A* algorithm'
          },
          { 
            title: 'A* Algorithm', 
            url: 'https://www.geeksforgeeks.org/a-search-algorithm/',
            description: 'Step-by-step tutorial with examples'
          },
        ]
      },
      {
        title: 'Heuristics in A*',
        content: `The heuristic function h(n) estimates the cost to reach the goal from state n. A good heuristic dramatically improves search efficiency.

Properties of heuristics:
• Admissible: h(n) ≤ true cost (guarantees optimality)
• Consistent: h(n) ≤ c(n,a,n') + h(n') (ensures efficiency)
• Informative: closer to true cost = better pruning

Common planning heuristics:
• h_add: Sum of individual goal costs (additive)
• h_max: Maximum individual goal cost (max)
• h_ff: FastForward heuristic (relaxed plan length)

Better heuristics mean exploring fewer states while still finding optimal solutions.`,
        links: [
          { 
            title: 'Planning Heuristics', 
            url: 'https://www.jair.org/index.php/jair/article/view/10265',
            description: 'Survey on planning heuristics'
          },
          { 
            title: 'Admissible Heuristics', 
            url: 'https://www.geeksforgeeks.org/dsa/a-is-admissible/',
            description: 'Explanation of admissible heuristics'
          },
        ]
      },
      {
        title: 'A* Implementation',
        content: `A* uses a priority queue ordered by f(n):

1. Initialize queue with start state (f = h(start))
2. Pop state with lowest f value
3. If goal, return path
4. Generate successors, compute f = g + h
5. Add to queue if not visited or better path found
6. Repeat until goal found or queue empty

The open list contains states to explore, ordered by f.
The closed list tracks visited states to avoid cycles.

A* with a good heuristic can solve problems that are intractable for BFS, often exploring thousands instead of billions of states.`,
        links: [
          { 
            title: 'A* Implementation', 
            url: 'https://www.youtube.com/watch?v=ySN5Wnu88nE',
            description: 'Video tutorial on implementing A*'
          },
          { 
            title: 'A* Heuristics', 
            url: 'http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html',
            description: 'Advanced techniques for A* heuristics'
          },
        ]
      },
    ],
    questions: [
      {
        id: 1,
        question: 'What is the A* evaluation function?',
        options: [
          'f(n) = g(n) - h(n)',
          'f(n) = g(n) + h(n)',
          'f(n) = g(n) × h(n)',
          'f(n) = h(n) only'
        ],
        correctAnswer: 1,
        explanation: 'A* uses f(n) = g(n) + h(n), combining actual cost from start (g) with heuristic estimate to goal (h).'
      },
      {
        id: 2,
        question: 'What does it mean for a heuristic to be admissible?',
        options: [
          'It always overestimates the cost',
          'It never overestimates the true cost',
          'It equals the true cost exactly',
          'It is randomly generated'
        ],
        correctAnswer: 1,
        explanation: 'An admissible heuristic never overestimates the true cost to reach the goal, ensuring A* finds optimal solutions.'
      },
      {
        id: 3,
        question: 'Why is A* generally preferred over BFS for planning?',
        options: [
          'A* uses less memory than BFS',
          'A* uses heuristics to explore fewer states while remaining optimal',
          'A* is simpler to implement',
          'A* does not need a goal state'
        ],
        correctAnswer: 1,
        explanation: 'A* uses heuristics to focus the search toward the goal, exploring significantly fewer states than BFS while still guaranteeing optimality.'
      },
    ]
  },
  heuristics: {
    id: 'heuristics',
    title: 'Understanding Heuristics',
    duration: '10 min',
    sections: [
      {
        title: 'What are Heuristics?',
        content: `Heuristics are problem-specific estimates that guide search algorithms toward the goal. In planning, they estimate the cost (number of actions) needed to achieve the goal from a given state.

A heuristic is derived from relaxing the original problem - removing constraints to make it easier to solve. The solution to this relaxed problem gives us an estimate.

For example, ignoring negative effects (delete lists) gives us the delete-relaxation heuristic. This makes planning easier because actions only add facts, never remove them.`,
        links: [
          { 
            title: 'Planning Heuristics', 
            url: 'https://www.jair.org/index.php/jair/article/view/10265',
            description: 'Survey on planning heuristics'
          },
          { 
            title: 'Delete Relaxation', 
            url: 'https://en.wikipedia.org/wiki/Relaxed_planning_graph',
            description: 'Explanation of relaxed planning and heuristics'
          },
        ]
      },
      {
        title: 'h_add and h_max',
        content: `h_add (Additive Heuristic):
• Sum the costs of achieving each goal independently
• Assumes goals do not interact (optimistic)
• Fast to compute but may underestimate significantly

h_max (Max Heuristic):
• Take the maximum cost among all goals
• More conservative than h_add
• Still admissible but less informative

Example: If goal is (on A B) and (on B C), and each costs 2 actions:
• h_add = 2 + 2 = 4
• h_max = max(2, 2) = 2

h_add is better when goals are independent; h_max is safer when goals interact.`,
        links: [
          { 
            title: 'Additive Heuristics', 
            url: 'https://www.geeksforgeeks.org/dsa/a-search-algorithm/',
            description: 'A* search and heuristic explanation'
          },
          { 
            title: 'h_add Heuristic', 
            url: 'https://en.wikipedia.org/wiki/Heuristic_(computer_science)',
            description: 'Wikipedia on heuristics in computer science'
          },
        ]
      },
      {
        title: 'Goal Counting',
        content: `The simplest heuristic is goal counting: count how many goal facts are not yet true.

Advantages:
• Extremely fast to compute
• No complex calculations needed
• Works for any domain

Disadvantages:
• Ignores how hard each goal is to achieve
• Not admissible (can overestimate)
• Poor quality for complex problems

Despite its limitations, goal counting can be useful when:
• You need a heuristic very quickly
• The domain has uniform action costs
• Other heuristics are too expensive to compute

Modern planners often use more sophisticated heuristics like h_ff (FastForward) or landmark heuristics.`,
        links: [
          { 
            title: 'Fast Downward', 
            url: 'http://www.fast-downward.org/',
            description: 'Homepage of the Fast Downward planning system'
          },
          { 
            title: 'Landmark Heuristics', 
            url: 'https://www.jair.org/index.php/jair/article/view/10376',
            description: 'Paper on landmark-based heuristics'
          },
        ]
      },
    ],
    questions: [
      {
        id: 1,
        question: 'How is h_add calculated?',
        options: [
          'Maximum cost among all goals',
          'Sum of costs for each goal independently',
          'Average cost of all goals',
          'Count of unsatisfied goals'
        ],
        correctAnswer: 1,
        explanation: 'h_add sums the individual costs of achieving each goal, assuming goals do not interact with each other.'
      },
      {
        id: 2,
        question: 'What is the main advantage of goal counting?',
        options: [
          'It is always admissible',
          'It is very fast to compute',
          'It provides the most accurate estimate',
          'It works only for Blocksworld'
        ],
        correctAnswer: 1,
        explanation: 'Goal counting is extremely fast to compute since it just counts unsatisfied goals, making it useful when speed is critical.'
      },
      {
        id: 3,
        question: 'Why are heuristics based on relaxed problems?',
        options: [
          'Relaxed problems are harder to solve',
          'Relaxed problems are easier to solve and provide estimates',
          'Relaxed problems give exact solutions',
          'Relaxed problems do not need heuristics'
        ],
        correctAnswer: 1,
        explanation: 'Relaxed problems (e.g., ignoring delete effects) are easier to solve, and their solutions provide admissible estimates for the original problem.'
      },
    ]
  },
  practice: {
    id: 'practice',
    title: 'Practice Problems',
    duration: '15 min',
    sections: [
      {
        title: 'Blocksworld Challenge',
        content: `Blocksworld is the classic planning domain. You have blocks on a table and need to stack them in a specific configuration.

Actions:
• pick-up(x): Pick up block x from the table
• put-down(x): Put block x on the table
• stack(x, y): Put block x on top of block y
• unstack(x, y): Remove block x from block y

Predicates:
• (on x y): Block x is on block y
• (on-table x): Block x is on the table
• (clear x): Nothing is on top of block x
• (hand-empty): The robot hand is empty
• (holding x): The robot is holding block x

Try writing a PDDL domain and solving problems with different algorithms!`,
        links: [
          { 
            title: 'Blocksworld Domain', 
            url: 'https://github.com/potassco/pddl-instances',
            description: 'PDDL instances including Blocksworld'
          },
          { 
            title: 'Blocksworld Demo', 
            url: 'https://www.youtube.com/watch?v=U10xht36-5U',
            description: 'Video demonstration of Blocksworld solving'
          },
        ]
      },
      {
        title: 'Gripper Domain',
        content: `The Gripper domain involves a robot with two grippers moving balls between rooms.

This domain tests:
• Handling multiple objects
• Using both arms efficiently
• Planning concurrent actions

Challenge: Move 4 balls from room A to room B using a robot with 2 grippers. The optimal plan requires careful coordination - picking up balls with both grippers, moving, and dropping them.

Compare BFS vs A* performance. How many states does each explore?`,
        links: [
          { 
            title: 'Gripper Domain', 
            url: 'https://github.com/potassco/pddl-instances',
            description: 'PDDL instances including Gripper'
          },
          { 
            title: 'Gripper Explained', 
            url: 'https://www.geeksforgeeks.org/gripper-domain-in-ai/',
            description: 'Explanation of the Gripper domain'
          },
        ]
      },
      {
        title: 'Towers of Hanoi',
        content: `The classic puzzle is also a planning problem! Move disks from one peg to another, following the rules:
• Only one disk can be moved at a time
• Only the top disk can be moved
• No disk may be placed on top of a smaller disk

With n disks, the optimal solution requires 2^n - 1 moves.

This is a great test case because:
• The optimal solution length is known
• It requires deep search
• Heuristics make a huge difference

Try solving with 3, 4, and 5 disks. Compare how BFS and A* handle the increasing complexity.`,
        links: [
          { 
            title: 'Hanoi Domain', 
            url: 'https://github.com/potassco/pddl-instances',
            description: 'PDDL instances including Towers of Hanoi'
          },
          { 
            title: 'Tower of Hanoi', 
            url: 'https://www.geeksforgeeks.org/c-program-for-tower-of-hanoi/',
            description: 'Explanation of the recursive solution'
          },
        ]
      },
    ],
    questions: [
      {
        id: 1,
        question: 'In Blocksworld, what does (clear x) mean?',
        options: [
          'Block x is on the table',
          'Nothing is on top of block x',
          'The robot is holding block x',
          'Block x is the goal'
        ],
        correctAnswer: 1,
        explanation: '(clear x) means nothing is on top of block x, so it can be picked up or have something stacked on it.'
      },
      {
        id: 2,
        question: 'How many moves are needed to solve Towers of Hanoi with n disks optimally?',
        options: [
          'n moves',
          'n² moves',
          '2^n - 1 moves',
          'n! moves'
        ],
        correctAnswer: 2,
        explanation: 'The optimal solution for Towers of Hanoi requires exactly 2^n - 1 moves, growing exponentially with the number of disks.'
      },
      {
        id: 3,
        question: 'What makes the Gripper domain interesting for planning?',
        options: [
          'It only has one action',
          'It requires coordinating multiple objects and arms',
          'It has no goal state',
          'It cannot be solved by A*'
        ],
        correctAnswer: 1,
        explanation: 'The Gripper domain is interesting because it involves coordinating multiple balls and efficiently using both robot arms, testing the planner\'s ability to handle concurrency.'
      },
    ]
  },
};

export function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const lesson = lessonId ? lessonsData[lessonId] : null;
  
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [, setScore] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Lesson not found</h1>
          <button
            onClick={() => navigate('/learn')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Learn
          </button>
        </div>
      </div>
    );
  }

  const toggleSection = (index: number) => {
    setExpandedSections(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < lesson.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    
    let correct = 0;
    lesson.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    
    setScore(correct);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleContinue = () => {
    // Save completion to localStorage
    const saved = localStorage.getItem('planlab_completed_lessons');
    const completed = saved ? JSON.parse(saved) : [];
    if (!completed.includes(lesson.id)) {
      completed.push(lesson.id);
      localStorage.setItem('planlab_completed_lessons', JSON.stringify(completed));
    }
    
    const lessonIds = Object.keys(lessonsData);
    const currentIndex = lessonIds.indexOf(lesson.id);
    const nextLessonId = lessonIds[currentIndex + 1];
    
    if (nextLessonId) {
      navigate(`/learn/${nextLessonId}`);
      setExpandedSections([]);
      setShowQuiz(false);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
    } else {
      navigate('/learn');
    }
  };

  const allSectionsExpanded = expandedSections.length === lesson.sections.length;
  const correctAnswers = lesson.questions.filter(q => answers[q.id] === q.correctAnswer).length;
  const passed = correctAnswers >= 2;

  return (
    <>
      <SEO title={lesson.title} description={lesson.sections[0]?.content.slice(0, 150) + '...'} pathname={`/learn/${lesson.id}`} />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/learn')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="PlanLab" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">{lesson.title}</h1>
                <p className="text-sm text-gray-500">{lesson.duration}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Open App
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Lesson Progress</span>
            <span className="text-sm text-gray-500">
              {expandedSections.length} of {lesson.sections.length} sections
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${(expandedSections.length / lesson.sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 mb-8">
          {lesson.sections.map((section, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    expandedSections.includes(index) 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {expandedSections.includes(index) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800">{section.title}</h3>
                </div>
                <span className="text-sm text-primary-600">
                  {expandedSections.includes(index) ? 'Collapse' : 'Read more'}
                </span>
              </button>
              
              {expandedSections.includes(index) && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="pt-4 prose prose-gray max-w-none">
                    {section.content.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  {section.links && section.links.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Learn More
                      </h4>
                      <div className="space-y-2">
                        {section.links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-800 group-hover:text-primary-700">
                                {link.title}
                              </p>
                              <p className="text-sm text-gray-500">{link.description}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Start Quiz Button */}
        {!showQuiz && allSectionsExpanded && (
          <div className="text-center mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
              <Trophy className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Ready to test your knowledge?
              </h3>
              <p className="text-green-600 mb-4">
                Complete the quiz to unlock the next lesson. You need at least 2 out of 3 correct answers to pass.
              </p>
              <button
                onClick={() => setShowQuiz(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Quiz
              </button>
            </div>
          </div>
        )}

        {/* Quiz */}
        {showQuiz && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-500" />
                Knowledge Check
              </h3>
              <span className="text-sm text-gray-500">
                Need 2/3 correct to pass
              </span>
            </div>

            <div className="space-y-6">
              {lesson.questions.map((question, qIndex) => (
                <div key={question.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <p className="font-medium text-gray-800 mb-4">
                    {qIndex + 1}. {question.question}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => {
                      const isSelected = answers[question.id] === oIndex;
                      const isCorrect = oIndex === question.correctAnswer;
                      const showCorrectness = submitted;
                      
                      let buttonClass = 'w-full text-left p-3 rounded-lg border transition-all ';
                      if (showCorrectness) {
                        if (isCorrect) {
                          buttonClass += 'bg-green-50 border-green-500 text-green-800';
                        } else if (isSelected && !isCorrect) {
                          buttonClass += 'bg-red-50 border-red-500 text-red-800';
                        } else {
                          buttonClass += 'bg-gray-50 border-gray-200 text-gray-600';
                        }
                      } else {
                        buttonClass += isSelected 
                          ? 'bg-primary-50 border-primary-500 text-primary-800' 
                          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-gray-50';
                      }
                      
                      return (
                        <button
                          key={oIndex}
                          onClick={() => handleAnswer(question.id, oIndex)}
                          disabled={submitted}
                          className={buttonClass}
                        >
                          <div className="flex items-center gap-3">
                            {showCorrectness && isCorrect && (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            )}
                            {showCorrectness && isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                            <span>{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {submitted && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      answers[question.id] === question.correctAnswer 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      <p className="text-sm">
                        <strong>{answers[question.id] === question.correctAnswer ? 'Correct!' : 'Incorrect.'}</strong>{' '}
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quiz Actions */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < lesson.questions.length}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answers
                </button>
              ) : (
                <div className="text-center">
                  {passed ? (
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold mb-3">
                        <Trophy className="w-5 h-5" />
                        You passed! {correctAnswers}/3 correct
                      </div>
                      <p className="text-gray-600">
                        Great job! You are ready to move to the next lesson.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full font-semibold mb-3">
                        <XCircle className="w-5 h-5" />
                        Try again {correctAnswers}/3 correct
                      </div>
                      <p className="text-gray-600">
                        You need at least 2 correct answers to pass. Review the material and try again.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 justify-center">
                    {!passed && (
                      <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Retry Quiz
                      </button>
                    )}
                    {passed && (
                      <button
                        onClick={handleContinue}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                      >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Locked Message */}
        {!allSectionsExpanded && !showQuiz && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <Lock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              Read all sections to unlock the quiz
            </p>
          </div>
        )}
      </main>
    </div>
  </>
  );
}
