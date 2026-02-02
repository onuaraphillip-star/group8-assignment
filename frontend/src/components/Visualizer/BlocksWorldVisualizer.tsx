import { useMemo } from 'react';

interface BlocksWorldVisualizerProps {
  state: string[];
  currentAction?: string;
  width?: number;
  height?: number;
}

export function BlocksWorldVisualizer({ 
  state, 
  currentAction,
  width = 500, 
  height = 350 
}: BlocksWorldVisualizerProps) {
  const { stacks, handHolding } = useMemo(() => {
    const blockOn: Record<string, string> = {};
    const onTable = new Set<string>();
    const clearBlocks = new Set<string>();
    let holding: string | null = null;

    for (const pred of state) {
      const trimmed = pred.trim();
      const onMatch = trimmed.match(/\(on\s+(\w+)\s+(\w+)\)/);
      if (onMatch) blockOn[onMatch[1]] = onMatch[2];
      const ontableMatch = trimmed.match(/\(ontable\s+(\w+)\)/);
      if (ontableMatch) onTable.add(ontableMatch[1]);
      const clearMatch = trimmed.match(/\(clear\s+(\w+)\)/);
      if (clearMatch) clearBlocks.add(clearMatch[1]);
      const holdingMatch = trimmed.match(/\(holding\s+(\w+)\)/);
      if (holdingMatch) holding = holdingMatch[1];
    }

    const stacks: string[][] = [];
    const visited = new Set<string>();

    for (const block of onTable) {
      const stack: string[] = [block];
      visited.add(block);
      let current = block;
      while (true) {
        const onTop = Object.entries(blockOn).find(([_, on]) => on === current);
        if (!onTop) break;
        const [topBlock] = onTop;
        if (visited.has(topBlock)) break;
        stack.push(topBlock);
        visited.add(topBlock);
        current = topBlock;
      }
      stacks.push(stack);
    }

    return { 
      stacks,
      handHolding: holding
    };
  }, [state]);

  const blockWidth = 56;
  const blockHeight = 44; // Slightly shorter for better stacking proportions
  const stackSpacing = 90;
  const tableY = height - 50;
  
  // Calculate positions - blocks stack with bottom touching top of block below
  const blockPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; stackIdx: number; blockIdx: number }> = {};
    const totalWidth = stacks.length * stackSpacing;
    const startX = (width - totalWidth) / 2 + stackSpacing / 2 - blockWidth / 2;

    stacks.forEach((stack, stackIdx) => {
      const x = startX + stackIdx * stackSpacing;
      stack.forEach((block, blockIdx) => {
        // Block sits directly on top of the one below
        // Y position is calculated from bottom up
        const y = tableY - (blockIdx + 1) * blockHeight;
        positions[block] = { x, y, stackIdx, blockIdx };
      });
    });

    return positions;
  }, [stacks, width, tableY]);

  // Hand position based on current action
  const handPosition = useMemo(() => {
    if (!currentAction || currentAction === 'Initial State') {
      return { x: width / 2, y: 25, state: 'idle' as const };
    }

    const actionMatch = currentAction.match(/(\w+)-?(\w*)\(([^)]+)\)/);
    if (!actionMatch) return { x: width / 2, y: 25, state: 'idle' as const };

    const [, actionName, , params] = actionMatch;
    const paramList = params.split(',').map(p => p.trim());
    const block = paramList[0];
    const targetBlock = paramList[1];
    const blockPos = blockPositions[block];

    if ((actionName === 'pick' || actionName === 'pick-up') && blockPos) {
      return { 
        x: blockPos.x + blockWidth / 2, 
        y: blockPos.y - 20, 
        state: 'grabbing' as const,
        targetBlock: block
      };
    } else if (actionName === 'put' || actionName === 'put-down') {
      const tableX = blockPos ? blockPos.x + blockWidth / 2 : width / 2;
      return { 
        x: tableX, 
        y: tableY - 20, 
        state: 'placing' as const,
        targetBlock: block
      };
    } else if (actionName === 'stack' && targetBlock) {
      const targetPos = blockPositions[targetBlock];
      if (targetPos) {
        return { 
          x: targetPos.x + blockWidth / 2, 
          y: targetPos.y - blockHeight - 20, 
          state: 'placing' as const,
          targetBlock: block
        };
      }
    } else if (actionName === 'unstack' && blockPos) {
      return { 
        x: blockPos.x + blockWidth / 2, 
        y: blockPos.y - 20, 
        state: 'grabbing' as const,
        targetBlock: block
      };
    }

    return { x: width / 2, y: 25, state: 'idle' as const };
  }, [currentAction, blockPositions, width, tableY]);

  const getBlockColors = (block: string) => {
    const colors: Record<string, { main: string; top: string; side: string }> = {
      'a': { main: '#dc2626', top: '#fca5a5', side: '#991b1b' },
      'b': { main: '#2563eb', top: '#93c5fd', side: '#1e40af' },
      'c': { main: '#16a34a', top: '#86efac', side: '#166534' },
      'd': { main: '#d97706', top: '#fcd34d', side: '#92400e' },
      'e': { main: '#9333ea', top: '#d8b4fe', side: '#6b21a8' },
      'f': { main: '#0891b2', top: '#67e8f9', side: '#155e75' },
    };
    return colors[block] || { main: '#4b5563', top: '#9ca3af', side: '#1f2937' };
  };

  const depth = 8;

  return (
    <svg width={width} height={height} className="rounded-lg">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
        <linearGradient id="tableGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d2691e" />
          <stop offset="100%" stopColor="#8b4513" />
        </linearGradient>
      </defs>
      
      <rect width={width} height={height} fill="#f8fafc" rx={8} />
      
      {/* Table */}
      <rect x={25} y={tableY} width={width - 50} height={12} fill="url(#tableGrad)" rx={3} filter="url(#shadow)" />
      
      {/* Render stacks from bottom to top */}
      {stacks.map((stack, stackIdx) => (
        <g key={stackIdx}>
          {stack.map((block, blockIdx) => {
            const pos = blockPositions[block];
            if (!pos) return null;
            
            const colors = getBlockColors(block);
            const isBeingHeld = handHolding === block;
            const isBeingGrabbed = handPosition.targetBlock === block && handPosition.state === 'grabbing';
            const liftOffset = isBeingGrabbed ? -6 : 0;
            
            // Calculate exact positions for stacking
            const baseY = pos.y + liftOffset;
            const topY = baseY - depth;
            const rightX = pos.x + blockWidth;
            const sideX = rightX + depth;
            
            return (
              <g key={block} opacity={isBeingHeld ? 0.2 : 1}>
                {/* Shadow on the block/table below */}
                {blockIdx === 0 ? (
                  // Shadow on table
                  <ellipse
                    cx={pos.x + blockWidth / 2}
                    cy={tableY - 2}
                    rx={blockWidth / 2 - 2}
                    ry={3}
                    fill="rgba(0,0,0,0.2)"
                  />
                ) : (
                  // Shadow on block below
                  <rect
                    x={pos.x + 2}
                    y={baseY + blockHeight - 2}
                    width={blockWidth - 4}
                    height={4}
                    fill="rgba(0,0,0,0.15)"
                    rx={1}
                  />
                )}
                
                {/* Right side face (3D depth) */}
                <path
                  d={`M${rightX} ${baseY} L${sideX} ${topY} L${sideX} ${topY + blockHeight} L${rightX} ${baseY + blockHeight} Z`}
                  fill={colors.side}
                />
                
                {/* Top face (3D depth) */}
                <path
                  d={`M${pos.x} ${baseY} L${pos.x + depth} ${topY} L${sideX} ${topY} L${rightX} ${baseY} Z`}
                  fill={colors.top}
                />
                
                {/* Main front face */}
                <rect
                  x={pos.x}
                  y={baseY}
                  width={blockWidth}
                  height={blockHeight}
                  fill={colors.main}
                  rx={2}
                  filter="url(#shadow)"
                />
                
                {/* Top edge highlight */}
                <rect
                  x={pos.x}
                  y={baseY}
                  width={blockWidth}
                  height={3}
                  fill="rgba(255,255,255,0.3)"
                  rx={1}
                />
                
                {/* Block letter */}
                <text
                  x={pos.x + blockWidth / 2}
                  y={baseY + blockHeight / 2 + 7}
                  textAnchor="middle"
                  fill="white"
                  fontSize={24}
                  fontWeight="bold"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
                >
                  {block.toUpperCase()}
                </text>
                
                {/* Grab highlight */}
                {isBeingGrabbed && (
                  <rect
                    x={pos.x - 4}
                    y={baseY - 4}
                    width={blockWidth + 8}
                    height={blockHeight + 8}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    rx={4}
                  />
                )}
              </g>
            );
          })}
        </g>
      ))}
      
      {/* Robot Hand */}
      <g transform={`translate(${handPosition.x - 30}, ${handPosition.y})`}>
        {/* Arm */}
        <rect x={25} y={-35} width={10} height={40} fill="#6b7280" rx={2} />
        
        {/* Hand body */}
        <rect x={15} y={0} width={30} height={25} fill="#4b5563" rx={4} filter="url(#shadow)" />
        
        {/* Fingers */}
        {handPosition.state === 'grabbing' ? (
          <>
            <path d="M15 20 L10 32 L18 30 Z" fill="#374151" />
            <path d="M45 20 L50 32 L42 30 Z" fill="#374151" />
          </>
        ) : (
          <>
            <rect x={8} y={18} width={7} height={18} fill="#374151" rx={2} />
            <rect x={45} y={18} width={7} height={18} fill="#374151" rx={2} />
          </>
        )}
        
        {/* Status indicator */}
        <circle
          cx={30}
          cy={-45}
          r={7}
          fill={handPosition.state === 'grabbing' ? '#f59e0b' : handPosition.state === 'placing' ? '#22c55e' : '#6b7280'}
          stroke="white"
          strokeWidth={2}
        />
        
        {/* Block in hand */}
        {handHolding && (
          <g transform="translate(2, 30)">
            <path
              d={`M0 ${blockHeight} L${depth} ${blockHeight - depth} L${depth} ${-depth} L0 0 Z`}
              fill={getBlockColors(handHolding).side}
            />
            <path
              d={`M0 0 L${depth} ${-depth} L${blockWidth + depth} ${-depth} L${blockWidth} 0 Z`}
              fill={getBlockColors(handHolding).top}
            />
            <rect width={blockWidth} height={blockHeight} fill={getBlockColors(handHolding).main} rx={2} filter="url(#shadow)" />
            <text x={blockWidth / 2} y={blockHeight / 2 + 7} textAnchor="middle" fill="white" fontSize={24} fontWeight="bold">
              {handHolding.toUpperCase()}
            </text>
          </g>
        )}
        
        {/* Status text */}
        {handPosition.state === 'grabbing' && (
          <text x={30} y={-58} textAnchor="middle" fill="#f59e0b" fontSize={11} fontWeight="bold">GRABBING</text>
        )}
        {handPosition.state === 'placing' && (
          <text x={30} y={-58} textAnchor="middle" fill="#22c55e" fontSize={11} fontWeight="bold">PLACING</text>
        )}
      </g>
    </svg>
  );
}
