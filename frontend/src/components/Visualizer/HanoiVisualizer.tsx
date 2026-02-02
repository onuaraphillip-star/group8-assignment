import { useMemo } from 'react';

interface HanoiVisualizerProps {
  state: string[];
  currentAction?: string;
  width?: number;
  height?: number;
}

export function HanoiVisualizer({
  state,
  currentAction,
  width = 500,
  height = 350
}: HanoiVisualizerProps) {
  const { pegs, disks } = useMemo(() => {
    const pegStacks: Record<string, string[]> = { peg1: [], peg2: [], peg3: [] };
    const diskOn: Record<string, string> = {};
    const clearDisks = new Set<string>();

    // Parse state
    for (const pred of state) {
      const trimmed = pred.trim();
      
      // (on ?disk ?obj) - disk is on another disk or peg
      const onMatch = trimmed.match(/\(on\s+(d\w+)\s+(\w+)\)/);
      if (onMatch) {
        const [, disk, onObj] = onMatch;
        diskOn[disk] = onObj;
      }
      
      // (clear ?obj) - top of stack is clear
      const clearMatch = trimmed.match(/\(clear\s+(\w+)\)/);
      if (clearMatch) {
        clearDisks.add(clearMatch[1]);
      }
    }

    // Build stacks for each peg
    for (const peg of ['peg1', 'peg2', 'peg3']) {
      const stack: string[] = [];
      // Find the bottom disk (the one directly on the peg)
      const bottomDisk = Object.entries(diskOn).find(([_, on]) => on === peg);
      
      if (bottomDisk) {
        let currentDisk = bottomDisk[0];
        stack.push(currentDisk);
        
        // Find disks on top
        while (true) {
          const diskOnTop = Object.entries(diskOn).find(([_, on]) => on === currentDisk);
          if (!diskOnTop) break;
          currentDisk = diskOnTop[0];
          stack.push(currentDisk);
        }
      }
      
      pegStacks[peg] = stack;
    }

    // Get all disks
    const allDisks = Object.keys(diskOn);

    return { pegs: pegStacks, disks: allDisks };
  }, [state]);

  // Parse current action
  const actionInfo = useMemo(() => {
    if (!currentAction || currentAction === 'Initial State') {
      return { type: 'idle', disk: null, from: null, to: null };
    }
    
    // move(d1,d2,peg2) - move disk d1 from d2 to peg2
    // or move(d1,peg1,peg2) - move disk d1 from peg1 to peg2
    const moveMatch = currentAction.match(/move\((d\w+),(\w+),(\w+)\)/);
    if (moveMatch) {
      return { 
        type: 'move', 
        disk: moveMatch[1], 
        from: moveMatch[2], 
        to: moveMatch[3] 
      };
    }
    
    return { type: 'idle', disk: null, from: null, to: null };
  }, [currentAction]);

  // Peg positions
  const pegPositions = useMemo(() => {
    const spacing = width / 4;
    return {
      peg1: { x: spacing, y: height - 60 },
      peg2: { x: spacing * 2, y: height - 60 },
      peg3: { x: spacing * 3, y: height - 60 }
    };
  }, [width, height]);

  // Disk sizes (d1 is smallest, d3 is largest)
  const getDiskSize = (disk: string) => {
    const sizes: Record<string, number> = {
      'd1': 60,  // smallest
      'd2': 90,  // medium
      'd3': 120, // largest
      'd4': 150,
      'd5': 180,
    };
    return sizes[disk] || 80;
  };

  const getDiskColor = (disk: string) => {
    const colors: Record<string, { main: string; top: string; side: string }> = {
      'd1': { main: '#ef4444', top: '#fca5a5', side: '#b91c1c' },
      'd2': { main: '#3b82f6', top: '#93c5fd', side: '#1d4ed8' },
      'd3': { main: '#22c55e', top: '#86efac', side: '#15803d' },
      'd4': { main: '#f59e0b', top: '#fcd34d', side: '#b45309' },
      'd5': { main: '#a855f7', top: '#d8b4fe', side: '#7c3aed' },
    };
    return colors[disk] || { main: '#6b7280', top: '#9ca3af', side: '#374151' };
  };

  const diskHeight = 24;
  const pegWidth = 12;
  const pegHeight = 140;

  // Calculate disk positions
  const diskPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; peg: string; isMoving?: boolean }> = {};
    
    // Position disks on pegs
    Object.entries(pegs).forEach(([pegName, stack]) => {
      const pegPos = pegPositions[pegName as keyof typeof pegPositions];
      stack.forEach((disk, index) => {
        const diskWidth = getDiskSize(disk);
        positions[disk] = {
          x: pegPos.x - diskWidth / 2,
          y: pegPos.y - (index + 1) * diskHeight,
          peg: pegName
        };
      });
    });

    // If moving, position the moving disk above the target or in transit
    if (actionInfo.type === 'move' && actionInfo.disk) {
      const movingDisk = actionInfo.disk;
      const toPeg = actionInfo.to?.startsWith('peg') ? actionInfo.to : 
                    Object.entries(pegs).find(([_, stack]) => stack.includes(actionInfo.to!))?.[0];
      
      if (toPeg && pegPositions[toPeg as keyof typeof pegPositions]) {
        const targetPegPos = pegPositions[toPeg as keyof typeof pegPositions];
        const targetStack = pegs[toPeg] || [];
        const diskWidth = getDiskSize(movingDisk);
        
        // Position above the target peg
        positions[movingDisk] = {
          x: targetPegPos.x - diskWidth / 2,
          y: targetPegPos.y - (targetStack.length + 1) * diskHeight - 30, // Higher up to show it's moving
          peg: toPeg,
          isMoving: true
        };
      }
    }

    return positions;
  }, [pegs, pegPositions, actionInfo, diskHeight]);

  return (
    <svg width={width} height={height} className="rounded-lg">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
        <linearGradient id="baseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5a2b" />
          <stop offset="100%" stopColor="#654321" />
        </linearGradient>
        <linearGradient id="pegGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a0522d" />
          <stop offset="50%" stopColor="#cd853f" />
          <stop offset="100%" stopColor="#8b4513" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="#f8fafc" rx={8} />

      {/* Base platform */}
      <rect x={20} y={height - 50} width={width - 40} height={20} fill="url(#baseGradient)" rx={4} filter="url(#shadow)" />

      {/* Pegs */}
      {Object.entries(pegPositions).map(([pegName, pos]) => (
        <g key={pegName}>
          {/* Peg pole */}
          <rect 
            x={pos.x - pegWidth / 2} 
            y={pos.y - pegHeight} 
            width={pegWidth} 
            height={pegHeight} 
            fill="url(#pegGradient)" 
            rx={3}
            filter="url(#shadow)"
          />
          {/* Peg label */}
          <text 
            x={pos.x} 
            y={height - 25} 
            textAnchor="middle" 
            fill="#f5f5dc" 
            fontSize={14} 
            fontWeight="bold"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
          >
            {pegName.replace('peg', 'Peg ')}
          </text>
        </g>
      ))}

      {/* Disks */}
      {disks.map((disk) => {
        const pos = diskPositions[disk];
        if (!pos) return null;
        
        const colors = getDiskColor(disk);
        const diskWidth = getDiskSize(disk);
        const isMoving = pos.isMoving || (actionInfo.type === 'move' && actionInfo.disk === disk);
        
        return (
          <g key={disk} filter="url(#shadow)">
            {/* 3D Side */}
            <path
              d={`M${pos.x + diskWidth} ${pos.y} 
                  L${pos.x + diskWidth + 6} ${pos.y - 6} 
                  L${pos.x + diskWidth + 6} ${pos.y + diskHeight - 6} 
                  L${pos.x + diskWidth} ${pos.y + diskHeight} Z`}
              fill={colors.side}
            />
            {/* 3D Top */}
            <path
              d={`M${pos.x} ${pos.y} 
                  L${pos.x + 6} ${pos.y - 6} 
                  L${pos.x + diskWidth + 6} ${pos.y - 6} 
                  L${pos.x + diskWidth} ${pos.y} Z`}
              fill={colors.top}
            />
            {/* Main face */}
            <rect
              x={pos.x}
              y={pos.y}
              width={diskWidth}
              height={diskHeight}
              fill={colors.main}
              rx={4}
            />
            {/* Highlight */}
            <rect
              x={pos.x + 2}
              y={pos.y + 2}
              width={diskWidth - 4}
              height={4}
              fill="rgba(255,255,255,0.3)"
              rx={2}
            />
            {/* Disk label */}
            <text
              x={pos.x + diskWidth / 2}
              y={pos.y + diskHeight / 2 + 5}
              textAnchor="middle"
              fill="white"
              fontSize={14}
              fontWeight="bold"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
            >
              {disk.toUpperCase()}
            </text>
            
            {/* Moving indicator */}
            {isMoving && (
              <g>
                <rect
                  x={pos.x - 4}
                  y={pos.y - 4}
                  width={diskWidth + 8}
                  height={diskHeight + 8}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  rx={6}
                />
                <text
                  x={pos.x + diskWidth / 2}
                  y={pos.y - 10}
                  textAnchor="middle"
                  fill="#d97706"
                  fontSize={11}
                  fontWeight="bold"
                >
                  MOVING
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Action info */}
      {actionInfo.type === 'move' && actionInfo.disk && (
        <text
          x={width / 2}
          y={30}
          textAnchor="middle"
          fill="#374151"
          fontSize={16}
          fontWeight="bold"
        >
          Move {actionInfo.disk.toUpperCase()} from {actionInfo.from?.replace('peg', 'Peg ')} to {actionInfo.to?.replace('peg', 'Peg ')}
        </text>
      )}

      {/* Legend */}
      <text x={15} y={height - 15} fill="#6b7280" fontSize={11}>
        Tower of Hanoi - Move all disks to Peg 3
      </text>
    </svg>
  );
}
