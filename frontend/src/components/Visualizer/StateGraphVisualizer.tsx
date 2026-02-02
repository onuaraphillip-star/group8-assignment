import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

interface StateGraphVisualizerProps {
  states: string[][];  // Array of states (each state is array of predicates)
  transitions: { from: number; to: number; action: string }[];
  currentStep: number;
}

export function StateGraphVisualizer({ states, transitions, currentStep }: StateGraphVisualizerProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = states.map((state, idx) => ({
      id: `state-${idx}`,
      position: { 
        x: (idx % 5) * 200, 
        y: Math.floor(idx / 5) * 150 
      },
      data: { 
        label: `S${idx}`,
        state: state,
        isCurrent: idx === currentStep,
        isVisited: idx <= currentStep
      },
      style: {
        background: idx === currentStep ? '#dbeafe' : idx < currentStep ? '#dcfce7' : '#f3f4f6',
        border: idx === currentStep ? '2px solid #3b82f6' : '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '10px',
        width: 150,
      },
    }));

    const edges: Edge[] = transitions.map((t, idx) => ({
      id: `edge-${idx}`,
      source: `state-${t.from}`,
      target: `state-${t.to}`,
      label: t.action,
      animated: t.to === currentStep,
      style: { 
        stroke: t.to <= currentStep ? '#22c55e' : '#9ca3af',
        strokeWidth: t.to === currentStep ? 3 : 1 
      },
    }));

    return { nodes, edges };
  }, [states, transitions, currentStep]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  );
}
