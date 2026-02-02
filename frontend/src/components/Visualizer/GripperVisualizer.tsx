import { useMemo } from 'react';

interface GripperVisualizerProps {
  state: string[];
  currentAction?: string;
  width?: number;
  height?: number;
}

export function GripperVisualizer({
  state,
  currentAction,
  width = 500,
  height = 350
}: GripperVisualizerProps) {
  // Parse state to get robot position and balls
  const { robotRoom, balls, grippers } = useMemo(() => {
    const ballsInRoom: Record<string, string[]> = { rooma: [], roomb: [] };
    const grippersState: Record<string, { free: boolean; carrying: string | null }> = {
      left: { free: true, carrying: null },
      right: { free: true, carrying: null }
    };
    let robotAt: string = 'rooma';

    for (const pred of state) {
      const trimmed = pred.trim();
      const atRobbyMatch = trimmed.match(/\(at-robby\s+(\w+)\)/);
      if (atRobbyMatch) robotAt = atRobbyMatch[1];
      const atBallMatch = trimmed.match(/\(at\s+(\w+)\s+(\w+)\)/);
      if (atBallMatch) {
        const [, ball, room] = atBallMatch;
        if (!ballsInRoom[room]) ballsInRoom[room] = [];
        ballsInRoom[room].push(ball);
      }
      const freeMatch = trimmed.match(/\(free\s+(\w+)\)/);
      if (freeMatch) grippersState[freeMatch[1]] = { free: true, carrying: null };
      const carryMatch = trimmed.match(/\(carry\s+(\w+)\s+(\w+)\)/);
      if (carryMatch) {
        const [, ball, gripper] = carryMatch;
        grippersState[gripper] = { free: false, carrying: ball };
      }
    }
    return { robotRoom: robotAt, balls: ballsInRoom, grippers: grippersState };
  }, [state]);

  // Room positions
  const roomAPos = { x: 80, y: height / 2 };
  const roomBPos = { x: width - 80, y: height / 2 };
  const roomWidth = 120;
  const roomHeight = 200;

  // Parse current action
  const { isMoving, fromRoom, toRoom, actionType, actionGripper, actionBall } = useMemo(() => {
    if (!currentAction || currentAction === 'Initial State') {
      return { isMoving: false, fromRoom: null, toRoom: null, actionType: 'idle', actionGripper: null, actionBall: null };
    }
    
    // Check for move action: move(rooma,roomb)
    if (currentAction.startsWith('move(')) {
      const match = currentAction.match(/move\((\w+),(\w+)\)/);
      if (match) {
        return { isMoving: true, fromRoom: match[1], toRoom: match[2], actionType: 'move', actionGripper: null, actionBall: null };
      }
    }
    
    // Check for pick action: pick(ball1,rooma,left)
    if (currentAction.startsWith('pick(')) {
      const match = currentAction.match(/pick\((\w+),(\w+),(\w+)\)/);
      if (match) {
        return { isMoving: false, fromRoom: null, toRoom: null, actionType: 'pick', actionGripper: match[3], actionBall: match[1] };
      }
    }
    
    // Check for drop action: drop(ball1,roomb,left)
    if (currentAction.startsWith('drop(')) {
      const match = currentAction.match(/drop\((\w+),(\w+),(\w+)\)/);
      if (match) {
        return { isMoving: false, fromRoom: null, toRoom: null, actionType: 'drop', actionGripper: match[3], actionBall: match[1] };
      }
    }
    
    return { isMoving: false, fromRoom: null, toRoom: null, actionType: 'idle', actionGripper: null, actionBall: null };
  }, [currentAction]);

  // Calculate robot visual position
  const robotVisualPos = useMemo(() => {
    // If moving, show robot in corridor between rooms
    if (isMoving && fromRoom && toRoom) {
      return {
        x: (roomAPos.x + roomBPos.x) / 2,
        y: height / 2,
        inCorridor: true
      };
    }
    // Otherwise show in current room
    if (robotRoom === 'rooma') {
      return { x: roomAPos.x, y: roomAPos.y, inCorridor: false };
    }
    return { x: roomBPos.x, y: roomBPos.y, inCorridor: false };
  }, [isMoving, fromRoom, toRoom, robotRoom, roomAPos, roomBPos, height]);

  const getBallColor = (ball: string) => {
    const colors: Record<string, string> = {
      'ball1': '#dc2626', 'ball2': '#2563eb', 'ball3': '#16a34a',
      'ball4': '#d97706', 'ball5': '#9333ea', 'ball6': '#0891b2',
    };
    return colors[ball] || '#4b5563';
  };

  const ballRadius = 18;

  return (
    <svg width={width} height={height} className="rounded-lg">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
        <linearGradient id="roomA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id="roomB" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dcfce7" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <linearGradient id="robot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4b5563" />
          <stop offset="50%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="#f8fafc" rx={8} />

      {/* Corridor */}
      <rect
        x={roomAPos.x + roomWidth / 2}
        y={height / 2 - 25}
        width={roomBPos.x - roomAPos.x - roomWidth}
        height={50}
        fill="#e5e7eb"
        rx={25}
      />
      <text x={width / 2} y={height / 2 - 35} textAnchor="middle" fill="#6b7280" fontSize={12} fontWeight="500">
        Corridor
      </text>

      {/* Room A */}
      <g>
        <rect
          x={roomAPos.x - roomWidth / 2}
          y={roomAPos.y - roomHeight / 2}
          width={roomWidth}
          height={roomHeight}
          fill="url(#roomA)"
          stroke={robotRoom === 'rooma' && !isMoving ? '#2563eb' : '#93c5fd'}
          strokeWidth={robotRoom === 'rooma' && !isMoving ? 4 : 2}
          rx={12}
          filter="url(#shadow)"
        />
        <text x={roomAPos.x} y={roomAPos.y - roomHeight / 2 + 28} textAnchor="middle" fill="#1e3a8a" fontSize={18} fontWeight="bold">
          Room A
        </text>
        {robotRoom === 'rooma' && !isMoving && (
          <text x={roomAPos.x} y={roomAPos.y - roomHeight / 2 + 45} textAnchor="middle" fill="#2563eb" fontSize={11} fontWeight="500">
            Robot here
          </text>
        )}
      </g>

      {/* Room B */}
      <g>
        <rect
          x={roomBPos.x - roomWidth / 2}
          y={roomBPos.y - roomHeight / 2}
          width={roomWidth}
          height={roomHeight}
          fill="url(#roomB)"
          stroke={robotRoom === 'roomb' && !isMoving ? '#16a34a' : '#86efac'}
          strokeWidth={robotRoom === 'roomb' && !isMoving ? 4 : 2}
          rx={12}
          filter="url(#shadow)"
        />
        <text x={roomBPos.x} y={roomBPos.y - roomHeight / 2 + 28} textAnchor="middle" fill="#14532d" fontSize={18} fontWeight="bold">
          Room B
        </text>
        {robotRoom === 'roomb' && !isMoving && (
          <text x={roomBPos.x} y={roomBPos.y - roomHeight / 2 + 45} textAnchor="middle" fill="#16a34a" fontSize={11} fontWeight="500">
            Robot here
          </text>
        )}
      </g>

      {/* Balls in Room A */}
      {balls.rooma?.map((ball, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const bx = roomAPos.x - 25 + col * 50;
        const by = roomAPos.y + 10 + row * 45;
        const isBeingPicked = actionType === 'pick' && actionBall === ball && robotRoom === 'rooma';
        return (
          <g key={ball}>
            <circle cx={bx} cy={by} r={ballRadius} fill={getBallColor(ball)} filter="url(#shadow)" opacity={isBeingPicked ? 0.4 : 1} />
            <text x={bx} y={by + 5} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {ball.replace('ball', '')}
            </text>
            {isBeingPicked && (
              <g>
                <circle cx={bx} cy={by} r={ballRadius + 6} fill="none" stroke="#f59e0b" strokeWidth={4} />
                <text x={bx} y={by - ballRadius - 12} textAnchor="middle" fill="#d97706" fontSize={11} fontWeight="bold">PICKING</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Balls in Room B */}
      {balls.roomb?.map((ball, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const bx = roomBPos.x - 25 + col * 50;
        const by = roomBPos.y + 10 + row * 45;
        const isBeingDropped = actionType === 'drop' && actionBall === ball && robotRoom === 'roomb';
        return (
          <g key={ball}>
            <circle cx={bx} cy={by} r={ballRadius} fill={getBallColor(ball)} filter="url(#shadow)" opacity={isBeingDropped ? 0.4 : 1} />
            <text x={bx} y={by + 5} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {ball.replace('ball', '')}
            </text>
            {isBeingDropped && (
              <g>
                <circle cx={bx} cy={by} r={ballRadius + 6} fill="none" stroke="#22c55e" strokeWidth={4} strokeDasharray="5,3" />
                <text x={bx} y={by - ballRadius - 12} textAnchor="middle" fill="#16a34a" fontSize={11} fontWeight="bold">DROPPING</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Robot */}
      <g transform={`translate(${robotVisualPos.x}, ${robotVisualPos.y - 30})`}>
        {/* Moving indicator */}
        {isMoving && (
          <g>
            <circle cx={0} cy={-20} r={55} fill="#f59e0b" opacity={0.15} />
            <text x={0} y={-75} textAnchor="middle" fill="#d97706" fontSize={18} fontWeight="bold" style={{ textShadow: '0 1px 3px rgba(255,255,255,1)' }}>
              MOVING {fromRoom} → {toRoom}
            </text>
            {/* Direction arrow */}
            <path
              d={toRoom === 'roomb' ? 'M-15 45 L0 60 L15 45' : 'M-15 60 L0 45 L15 60'}
              fill="#f59e0b"
              stroke="#d97706"
              strokeWidth={2}
            />
          </g>
        )}

        {/* Robot body */}
        <rect x={-40} y={-45} width={80} height={90} fill="url(#robot)" rx={16} filter="url(#shadow)" />
        
        {/* Robot face */}
        <rect x={-30} y={-35} width={60} height={35} fill="#111827" rx={8} />
        <circle cx={-12} cy={-17} r={6} fill="#22c55e" />
        <circle cx={12} cy={-17} r={6} fill="#22c55e" />

        {/* Robot label */}
        <text x={0} y={5} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">GRIPPER</text>
        <text x={0} y={18} textAnchor="middle" fill="#9ca3af" fontSize={9}>BOT</text>

        {/* Left Gripper */}
        <g transform="translate(-50, 5)">
          <rect x={-10} y={-20} width={20} height={50} fill="#374151" rx={5} />
          {grippers.left.carrying ? (
            <g>
              <circle cx={0} cy={40} r={16} fill={getBallColor(grippers.left.carrying)} filter="url(#shadow)" />
              <text x={0} y={44} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {grippers.left.carrying.replace('ball', '')}
              </text>
              {actionGripper === 'left' && actionType === 'drop' && (
                <text x={0} y={-30} textAnchor="middle" fill="#22c55e" fontSize={12} fontWeight="bold" style={{ textShadow: '0 1px 2px white' }}>
                  DROP
                </text>
              )}
            </g>
          ) : (
            <g>
              <path d="M-8 35 L-12 52 L-4 48 Z" fill="#4b5563" />
              <path d="M8 35 L12 52 L4 48 Z" fill="#4b5563" />
              {actionGripper === 'left' && actionType === 'pick' && (
                <text x={0} y={-30} textAnchor="middle" fill="#f59e0b" fontSize={12} fontWeight="bold" style={{ textShadow: '0 1px 2px white' }}>
                  PICK
                </text>
              )}
            </g>
          )}
          <text x={0} y={70} textAnchor="middle" fill="#374151" fontSize={10} fontWeight="bold">LEFT</text>
        </g>

        {/* Right Gripper */}
        <g transform="translate(50, 5)">
          <rect x={-10} y={-20} width={20} height={50} fill="#374151" rx={5} />
          {grippers.right.carrying ? (
            <g>
              <circle cx={0} cy={40} r={16} fill={getBallColor(grippers.right.carrying)} filter="url(#shadow)" />
              <text x={0} y={44} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {grippers.right.carrying.replace('ball', '')}
              </text>
              {actionGripper === 'right' && actionType === 'drop' && (
                <text x={0} y={-30} textAnchor="middle" fill="#22c55e" fontSize={12} fontWeight="bold" style={{ textShadow: '0 1px 2px white' }}>
                  DROP
                </text>
              )}
            </g>
          ) : (
            <g>
              <path d="M-8 35 L-12 52 L-4 48 Z" fill="#4b5563" />
              <path d="M8 35 L12 52 L4 48 Z" fill="#4b5563" />
              {actionGripper === 'right' && actionType === 'pick' && (
                <text x={0} y={-30} textAnchor="middle" fill="#f59e0b" fontSize={12} fontWeight="bold" style={{ textShadow: '0 1px 2px white' }}>
                  PICK
                </text>
              )}
            </g>
          )}
          <text x={0} y={70} textAnchor="middle" fill="#374151" fontSize={10} fontWeight="bold">RIGHT</text>
        </g>
      </g>

      {/* Legend */}
      <text x={15} y={height - 15} fill="#374151" fontSize={11} fontWeight="500">
        Balls: {Object.values(balls).flat().length} | Carrying: {(grippers.left.carrying ? 1 : 0) + (grippers.right.carrying ? 1 : 0)}
      </text>
    </svg>
  );
}
