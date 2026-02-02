import { useMemo } from 'react';

interface LogisticsVisualizerProps {
  state: string[];
  currentAction?: string;
  width?: number;
  height?: number;
}

export function LogisticsVisualizer({ state, currentAction, width = 500, height = 350 }: LogisticsVisualizerProps) {
  // Parse state to extract objects and their locations
  const data = useMemo(() => {
    const packages: Record<string, { at?: string; in?: string }> = {};
    const trucks: Record<string, string> = {};
    const planes: Record<string, string> = {};
    const locations = new Set<string>();

    for (const pred of state) {
      const s = pred.trim();

      // (at package1 loc-a) or at(package1,loc-a)
      let m = s.match(/\(at\s+(package\w*)\s+(\w+)\)/) || s.match(/at\(package(\w*),(\w+)\)/);
      if (m) {
        const name = m[1].startsWith('package') ? m[1] : 'package' + m[1];
        packages[name] = { at: m[2] };
        locations.add(m[2]);
      }

      // (in package1 truck-a) or in(package1,truck-a)
      m = s.match(/\(in\s+(package\w*)\s+(\w+)\)/) || s.match(/in\(package(\w*),(\w+)\)/);
      if (m) {
        const name = m[1].startsWith('package') ? m[1] : 'package' + m[1];
        packages[name] = { in: m[2] };
      }

      // (at truck-a loc-a) or at(truck-a,loc-a)
      m = s.match(/\(at\s+(truck-\w*)\s+(\w+)\)/) || s.match(/at\((truck-\w*),(\w+)\)/);
      if (m) {
        trucks[m[1]] = m[2];
        locations.add(m[2]);
      }

      // (at plane-a airport-a) or at(plane-a,airport-a)
      m = s.match(/\(at\s+(plane-\w*)\s+(\w+)\)/) || s.match(/at\((plane-\w*),(\w+)\)/);
      if (m) {
        planes[m[1]] = m[2];
        locations.add(m[2]);
      }
    }

    return { packages, trucks, planes, locations: Array.from(locations) };
  }, [state]);

  // Parse action
  const action = useMemo(() => {
    if (!currentAction || currentAction === 'Initial State') return null;
    
    // drive(truck-a,loc-a,loc-b,city-a)
    let m = currentAction.match(/drive\((truck-\w*),(\w+),(\w+),/);
    if (m) return { type: 'drive', vehicle: m[1], from: m[2], to: m[3] };
    
    // fly(plane-a,airport-a,airport-b)
    m = currentAction.match(/fly\((plane-\w*),(\w+),(\w+)\)/);
    if (m) return { type: 'fly', vehicle: m[1], from: m[2], to: m[3] };
    
    // load-truck(package1,truck-a,loc-a)
    m = currentAction.match(/load-truck\((package\w*),(truck-\w*),(\w+)\)/);
    if (m) return { type: 'load-truck', pkg: m[1], vehicle: m[2], loc: m[3] };
    
    // load-airplane(package1,plane-a,airport-a)
    m = currentAction.match(/load-airplane\((package\w*),(plane-\w*),(\w+)\)/);
    if (m) return { type: 'load-airplane', pkg: m[1], vehicle: m[2], loc: m[3] };
    
    // unload-truck(package1,truck-a,loc-b)
    m = currentAction.match(/unload-truck\((package\w*),(truck-\w*),(\w+)\)/);
    if (m) return { type: 'unload-truck', pkg: m[1], vehicle: m[2], loc: m[3] };
    
    // unload-airplane(package1,plane-a,airport-b)
    m = currentAction.match(/unload-airplane\((package\w*),(plane-\w*),(\w+)\)/);
    if (m) return { type: 'unload-airplane', pkg: m[1], vehicle: m[2], loc: m[3] };
    
    return null;
  }, [currentAction]);

  // Position locations
  const locPos = useMemo(() => {
    const airports = data.locations.filter(l => l.includes('airport'));
    const others = data.locations.filter(l => !l.includes('airport'));
    const pos: Record<string, { x: number; y: number; type: 'airport' | 'loc' }> = {};
    
    others.forEach((loc, i) => {
      pos[loc] = { x: 80 + i * 140, y: height - 80, type: 'loc' };
    });
    
    airports.forEach((loc, i) => {
      pos[loc] = { x: width - 80 - i * 140, y: 80, type: 'airport' };
    });
    
    return pos;
  }, [data.locations, width, height]);

  // Get vehicle position
  const getVehiclePos = (_name: string, loc: string, isMoving: boolean) => {
    if (isMoving && action?.from && action?.to) {
      const from = locPos[action.from];
      const to = locPos[action.to];
      if (from && to) {
        return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
      }
    }
    const p = locPos[loc];
    return p ? { x: p.x, y: p.y - 35 } : { x: 50, y: 50 };
  };

  const pkgColor = (p: string) => {
    const colors: Record<string, string> = {
      package1: '#ef4444', package2: '#3b82f6', package3: '#22c55e',
      package4: '#f59e0b', package5: '#a855f7'
    };
    return colors[p] || '#6b7280';
  };

  // Check if we have any data
  const hasData = Object.keys(data.packages).length > 0 || Object.keys(data.trucks).length > 0 || Object.keys(data.planes).length > 0;

  if (!hasData) {
    return (
      <svg width={width} height={height} className="rounded-lg bg-gray-50">
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="#6b7280" fontSize={14}>
          No logistics data
        </text>
        <text x={width / 2} y={height / 2 + 20} textAnchor="middle" fill="#9ca3af" fontSize={10}>
          State items: {state.length}
        </text>
      </svg>
    );
  }

  return (
    <svg width={width} height={height} className="rounded-lg">
      {/* Background */}
      <rect width={width} height={height} fill="#f0fdf4" rx={8} />
      
      {/* Sky area for airports */}
      <rect x={0} y={0} width={width} height={130} fill="#dbeafe" rx={8} />
      
      {/* Ground area for locations */}
      <rect x={0} y={130} width={width} height={height - 130} fill="#dcfce7" rx={8} />

      {/* Locations */}
      {Object.entries(locPos).map(([name, pos]) => (
        <g key={name}>
          <circle cx={pos.x} cy={pos.y} r={28} fill="white" stroke={pos.type === 'airport' ? '#f59e0b' : '#22c55e'} strokeWidth={3} />
          <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize={16}>{pos.type === 'airport' ? '✈' : '📍'}</text>
          <text x={pos.x} y={pos.y + 45} textAnchor="middle" fontSize={9} fill="#374151">{name.toUpperCase()}</text>
          
          {/* Packages at this location */}
          {Object.entries(data.packages)
            .filter(([_, info]) => info.at === name)
            .map(([pkg], i) => (
              <rect key={pkg} x={pos.x - 20 + i * 14} y={pos.y - 50} width={12} height={12} fill={pkgColor(pkg)} rx={2} stroke="white" strokeWidth={1} />
            ))}
        </g>
      ))}

      {/* Trucks */}
      {Object.entries(data.trucks).map(([name, loc]) => {
        const isMoving = action?.type === 'drive' && action.vehicle === name;
        const pos = getVehiclePos(name, loc, isMoving);
        return (
          <g key={name} transform={`translate(${pos.x},${pos.y})`}>
            {isMoving && <text y={-25} textAnchor="middle" fontSize={9} fill="#d97706">DRIVING</text>}
            <rect x={-20} y={-15} width={40} height={25} fill="#3b82f6" rx={4} />
            <text y={4} textAnchor="middle" fontSize={12}>🚛</text>
            <text y={28} textAnchor="middle" fontSize={8} fill="#1e40af">{name.toUpperCase()}</text>
            {/* Packages in truck */}
            {Object.entries(data.packages).filter(([_, info]) => info.in === name).map(([pkg], i) => (
              <rect key={pkg} x={-15 + i * 10} y={-28} width={8} height={8} fill={pkgColor(pkg)} rx={1} />
            ))}
          </g>
        );
      })}

      {/* Planes */}
      {Object.entries(data.planes).map(([name, loc]) => {
        const isFlying = action?.type === 'fly' && action.vehicle === name;
        const pos = getVehiclePos(name, loc, isFlying);
        return (
          <g key={name} transform={`translate(${pos.x},${pos.y})`}>
            {isFlying && <text y={-25} textAnchor="middle" fontSize={9} fill="#0891b2">FLYING</text>}
            <ellipse cx={0} cy={0} rx={22} ry={14} fill="#06b6d4" />
            <text y={4} textAnchor="middle" fontSize={12}>✈</text>
            <text y={26} textAnchor="middle" fontSize={8} fill="#0e7490">{name.toUpperCase()}</text>
            {/* Packages in plane */}
            {Object.entries(data.packages).filter(([_, info]) => info.in === name).map(([pkg], i) => (
              <rect key={pkg} x={-15 + i * 10} y={-24} width={8} height={8} fill={pkgColor(pkg)} rx={1} />
            ))}
          </g>
        );
      })}

      {/* Action text */}
      {action && (
        <g>
          <rect x={width / 2 - 130} y={10} width={260} height={26} fill="white" rx={13} opacity={0.9} />
          <text x={width / 2} y={27} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#374151">
            {action.type === 'drive' && `🚛 ${action.vehicle} → ${action.to}`}
            {action.type === 'fly' && `✈ ${action.vehicle} → ${action.to}`}
            {action.type === 'load-truck' && `📦 ${action.pkg} → ${action.vehicle}`}
            {action.type === 'load-airplane' && `📦 ${action.pkg} → ${action.vehicle}`}
            {action.type === 'unload-truck' && `📦 ${action.pkg} ↓ ${action.loc}`}
            {action.type === 'unload-airplane' && `📦 ${action.pkg} ↓ ${action.loc}`}
          </text>
        </g>
      )}

      {/* Stats */}
      <text x={10} y={height - 10} fontSize={10} fill="#6b7280">
        📦{Object.keys(data.packages).length} 🚛{Object.keys(data.trucks).length} ✈{Object.keys(data.planes).length}
      </text>
    </svg>
  );
}
