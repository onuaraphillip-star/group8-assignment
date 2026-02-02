import { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Info } from 'lucide-react';
import { usePlannerStore } from '../../store';

interface TreeNodeData {
  label: string;
  depth: number;
  heuristic: number;
  gCost: number;
  fCost: number;
  isGoal: boolean;
  isExpanded: boolean;
  isOnSolutionPath: boolean;
}

export function SearchTreeVisualizer() {
  const { result, isLoading } = usePlannerStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Reset when new result comes in
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setSelectedNode(null);
  }, [result]);

  // Build tree data
  const { nodes, edges, maxStep } = useMemo(() => {
    if (!result?.search_tree || result.search_tree.nodes.length === 0) {
      return { nodes: [], edges: [], maxStep: 0 };
    }

    const treeNodes = result.search_tree.nodes;
    const treeEdges = result.search_tree.edges;

    // Build parent map
    const parentMap = new Map<string, string>();
    treeEdges.forEach(e => parentMap.set(e.target, e.source));

    // Find solution path
    const solutionNodeIds = new Set<string>();
    if (result.plan && result.plan.length > 0) {
      const goalNodes = treeNodes.filter(n => n.is_goal);
      goalNodes.forEach(g => {
        let current = g.id;
        while (current) {
          solutionNodeIds.add(current);
          current = parentMap.get(current)!;
        }
      });
    }

    // Group by depth for layout
    const depthGroups = new Map<number, string[]>();
    treeNodes.forEach(n => {
      if (!depthGroups.has(n.depth)) depthGroups.set(n.depth, []);
      depthGroups.get(n.depth)!.push(n.id);
    });

    // Calculate positions
    const positions = new Map<string, { x: number; y: number }>();
    depthGroups.forEach((nodeIds, depth) => {
      const xSpacing = 150;
      const ySpacing = 100;
      const totalWidth = (nodeIds.length - 1) * xSpacing;
      nodeIds.forEach((id, idx) => {
        positions.set(id, {
          x: idx * xSpacing - totalWidth / 2,
          y: depth * ySpacing
        });
      });
    });

    // Create flow nodes
    const flowNodes: Node<TreeNodeData>[] = treeNodes.map((node) => {
      const isOnPath = solutionNodeIds.has(node.id);
      // Format heuristic value - show ∞ for infinity (999999.0 is our stand-in for inf)
      const hDisplay = node.heuristic >= 999999 ? '∞' : node.heuristic.toFixed(1);
      const gDisplay = node.g_cost >= 999999 ? '∞' : node.g_cost.toFixed(0);
      return {
        id: node.id,
        position: positions.get(node.id) || { x: 0, y: node.depth * 100 },
        data: {
          label: `h=${hDisplay}\ng=${gDisplay}`,
          depth: node.depth,
          heuristic: node.heuristic,
          gCost: node.g_cost,
          fCost: node.g_cost + node.heuristic,
          isGoal: node.is_goal,
          isExpanded: node.is_expanded,
          isOnSolutionPath: isOnPath,
        },
        style: {
          background: node.is_goal 
            ? '#dcfce7' 
            : isOnPath 
              ? '#fef3c7'
              : node.is_expanded 
                ? '#f3f4f6' 
                : '#dbeafe',
          border: `2px solid ${
            node.id === selectedNode
              ? '#f59e0b'
              : node.is_goal 
                ? '#22c55e' 
                : isOnPath 
                  ? '#f59e0b'
                  : node.is_expanded 
                    ? '#9ca3af' 
                    : '#3b82f6'
          }`,
          borderRadius: node.is_goal ? '50%' : '8px',
          padding: '10px',
          fontSize: '11px',
          fontWeight: 'bold',
          width: node.is_goal ? 70 : 80,
          height: node.is_goal ? 70 : 'auto',
          textAlign: 'center',
        },
      };
    });

    // Create flow edges
    const flowEdges: Edge[] = treeEdges.map((edge, idx) => {
      const sourceNode = treeNodes.find(n => n.id === edge.source);
      const isOnPath = sourceNode && solutionNodeIds.has(edge.source);
      
      return {
        id: `e${idx}`,
        source: edge.source,
        target: edge.target,
        label: edge.action || '',
        labelStyle: { fontSize: 9, fill: '#666' },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
        },
        style: { 
          stroke: isOnPath ? '#f59e0b' : '#6b7280', 
          strokeWidth: isOnPath ? 2 : 1,
        },
        animated: isOnPath,
      };
    });

    return { nodes: flowNodes, edges: flowEdges, maxStep: flowNodes.length };
  }, [result, selectedNode]);

  // Animation
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= maxStep) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isPlaying, maxStep]);

  // Filter visible nodes based on current step
  const visibleNodes = useMemo(() => {
    return nodes.map((node, idx) => ({
      ...node,
      hidden: idx > currentStep,
    }));
  }, [nodes, currentStep]);

  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.filter(n => !n.hidden).map(n => n.id));
    return edges.map(edge => ({
      ...edge,
      hidden: !visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target),
    }));
  }, [edges, visibleNodes]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setSelectedNode(null);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Searching...</p>
          <p className="text-sm text-gray-500">The algorithm is exploring the state space</p>
        </div>
      </div>
    );
  }

  if (!result?.search_tree || nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Search Tree Visualization</p>
          <p className="text-sm">Run a search to see how the algorithm explores the state space</p>
        </div>
      </div>
    );
  }

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode)?.data : null;

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-30"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setCurrentStep(Math.min(maxStep, currentStep + 1))}
            disabled={currentStep >= maxStep}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-30"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 ml-2">
            Step {currentStep} of {maxStep}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-primary-600 transition-all" style={{ width: `${(currentStep / maxStep) * 100}%` }} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        <div className="flex-1">
          <ReactFlow
            nodes={visibleNodes}
            edges={visibleEdges}
            onNodeClick={handleNodeClick}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#e5e7eb" gap={16} />
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            
            <Panel position="top-left" className="bg-white p-3 rounded shadow border">
              <h4 className="text-xs font-semibold mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-100 border border-blue-500" />
                  <span>Frontier</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-100 border border-gray-400" />
                  <span>Expanded</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-100 border border-green-500" />
                  <span>Goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-500" />
                  <span>Solution Path</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Details panel */}
        <div className="w-64 bg-white border-l p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Node Details
          </h3>
          
          {selectedNodeData ? (
            <div className="space-y-3">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Heuristic (h)</div>
                <div className="text-lg font-semibold text-primary-600">
                  {selectedNodeData.heuristic >= 999999 ? '∞' : selectedNodeData.heuristic.toFixed(2)}
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Path Cost (g)</div>
                <div className="text-lg font-semibold">
                  {selectedNodeData.gCost >= 999999 ? '∞' : selectedNodeData.gCost.toFixed(0)}
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Total (f = g + h)</div>
                <div className="text-lg font-semibold text-green-600">
                  {selectedNodeData.fCost >= 999999 ? '∞' : selectedNodeData.fCost.toFixed(2)}
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Depth</div>
                <div className="text-lg font-semibold">{selectedNodeData.depth}</div>
              </div>
              {selectedNodeData.isGoal && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  🎯 Goal State!
                </div>
              )}
              {selectedNodeData.isOnSolutionPath && !selectedNodeData.isGoal && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  ⭐ On Solution Path
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Click a node to see details</p>
          )}

          <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
            <strong>💡 Tip:</strong> The algorithm expands nodes with lowest f-cost first.
          </div>
        </div>
      </div>
    </div>
  );
}
