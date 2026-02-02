import { useMemo } from 'react';

interface TyreWorldVisualizerProps {
  state: string[];
  currentAction?: string;
  width?: number;
  height?: number;
}

export function TyreWorldVisualizer({ state, currentAction, width = 500, height = 350 }: TyreWorldVisualizerProps) {
  const data = useMemo(() => {
    const wheels: Record<string, { at?: string; in?: string; holding?: boolean; onVehicle?: boolean; removed?: boolean; flat?: boolean; inflated?: boolean }> = {};
    const nuts: Record<string, { loose?: boolean; tight?: boolean }> = {};
    const tools: Record<string, { have?: boolean; in?: string }> = {};
    const containers: Record<string, { have?: boolean }> = {};
    let jackLocation: string | null = null;
    let agentLocation = 'hub';

    for (const pred of state) {
      const s = pred.trim();
      let m;

      // Wheel locations
      m = s.match(/\(at\s+(wheel\w*)\s+(\w+)\)/) || s.match(/at\((wheel\w*),(\w+)\)/);
      if (m) {
        wheels[m[1]] = { ...(wheels[m[1]] || {}), at: m[2] };
      }

      // Wheel in container
      m = s.match(/\(in\s+(wheel\w*)\s+(\w+)\)/) || s.match(/in\((wheel\w*),(\w+)\)/);
      if (m) {
        wheels[m[1]] = { ...(wheels[m[1]] || {}), in: m[2] };
      }

      // Holding wheel
      if (s.includes('(holding wheel') || s.match(/holding\(wheel/)) {
        m = s.match(/\(holding\s+(wheel\w*)\)/) || s.match(/holding\((wheel\w*)\)/);
        if (m) wheels[m[1]] = { ...(wheels[m[1]] || {}), holding: true };
      }

      // On vehicle
      m = s.match(/\(on-vehicle\s+(wheel\w*)\)/) || s.match(/on-vehicle\((wheel\w*)\)/);
      if (m) wheels[m[1]] = { ...(wheels[m[1]] || {}), onVehicle: true };

      // Removed
      m = s.match(/\(removed\s+(wheel\w*)\)/) || s.match(/removed\((wheel\w*)\)/);
      if (m) wheels[m[1]] = { ...(wheels[m[1]] || {}), removed: true };

      // Flat
      m = s.match(/\(flat\s+(wheel\w*)\)/) || s.match(/flat\((wheel\w*)\)/);
      if (m) wheels[m[1]] = { ...(wheels[m[1]] || {}), flat: true };

      // Inflated
      m = s.match(/\(inflated\s+(wheel\w*)\)/) || s.match(/inflated\((wheel\w*)\)/);
      if (m) wheels[m[1]] = { ...(wheels[m[1]] || {}), inflated: true };

      // Nut loose/tight
      m = s.match(/\(loose\s+(nuts?\w*)\)/) || s.match(/loose\((nuts?\w*)\)/);
      if (m) nuts[m[1]] = { ...(nuts[m[1]] || {}), loose: true };

      m = s.match(/\(tight\s+(nuts?\w*)\)/) || s.match(/tight\((nuts?\w*)\)/);
      if (m) nuts[m[1]] = { ...(nuts[m[1]] || {}), tight: true };

      // Have tool
      m = s.match(/\(have\s+(\w+)\)/) || s.match(/have\((\w+)\)/);
      if (m) {
        const name = m[1];
        if (name.includes('wrench') || name.includes('jack') || name.includes('pump')) {
          tools[name] = { ...(tools[name] || {}), have: true };
        } else if (name.includes('boot') || name.includes('container')) {
          containers[name] = { have: true };
        }
      }

      // Tool in container
      m = s.match(/\(in\s+(\w+)\s+(boot|container)\w*\)/) || s.match(/in\((\w+),(boot|container)\w*\)/);
      if (m && (m[1].includes('wrench') || m[1].includes('jack') || m[1].includes('pump'))) {
        tools[m[1]] = { ...(tools[m[1]] || {}), in: m[2] };
      }

      // Jacked up
      m = s.match(/\(jacked-up\s+(\w+)\)/) || s.match(/jacked-up\((\w+)\)/);
      if (m) jackLocation = m[1];

      // Agent at
      m = s.match(/\(at\s+agent\s+(\w+)\)/) || s.match(/at\(agent,(\w+)\)/);
      if (m) agentLocation = m[1];
    }

    return { wheels, nuts, tools, containers, jackLocation, agentLocation };
  }, [state]);

  const action = useMemo(() => {
    if (!currentAction || currentAction === 'Initial State') return null;
    return { text: currentAction };
  }, [currentAction]);

  const wheelList = Object.entries(data.wheels);
  const hasData = wheelList.length > 0 || Object.keys(data.tools).length > 0;

  if (!hasData) {
    return (
      <svg width={width} height={height} className="rounded-lg bg-gray-50">
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="#6b7280" fontSize={14}>
          No tyre world data
        </text>
      </svg>
    );
  }

  return (
    <svg width={width} height={height} className="rounded-lg">
      {/* Background */}
      <rect width={width} height={height} fill="#f3f4f6" rx={8} />
      
      {/* Ground */}
      <rect x={0} y={height - 80} width={width} height={80} fill="#9ca3af" rx={8} />

      {/* Car/Vehicle */}
      <g transform={`translate(${width / 2}, ${height - 120})`}>
        {/* Car body */}
        <rect x={-80} y={-40} width={160} height={50} fill="#374151" rx={8} />
        <rect x={-60} y={-60} width={120} height={30} fill="#4b5563" rx={5} />
        
        {/* Windows */}
        <rect x={-50} y={-55} width={40} height={20} fill="#93c5fd" rx={3} />
        <rect x={10} y={-55} width={40} height={20} fill="#93c5fd" rx={3} />

        {/* Wheels on vehicle */}
        {wheelList.filter(([_, info]) => info.onVehicle).map(([name], i) => (
          <g key={name} transform={`translate(${i === 0 ? -50 : 50}, 20)`}>
            <circle r={22} fill={name.includes('flat') || data.wheels[name]?.flat ? '#ef4444' : '#1f2937'} stroke="#000" strokeWidth={3} />
            <circle r={12} fill="#6b7280" />
            <text y={4} textAnchor="middle" fontSize={8} fill="white">{name.replace('wheel', 'W')}</text>
            {/* Nut */}
            <circle r={5} fill={data.nuts[`nuts${name.replace('wheel', '')}`]?.loose ? '#f59e0b' : '#22c55e'} />
          </g>
        ))}

        {/* Jack */}
        {data.jackLocation === 'hub' && (
          <g transform="translate(0, -50)">
            <rect x={-5} y={-30} width={10} height={40} fill="#f59e0b" />
            <rect x={-15} y={0} width={30} height={8} fill="#d97706" />
            <text y={-35} textAnchor="middle" fontSize={9} fill="#d97706">JACK</text>
          </g>
        )}
      </g>

      {/* Boot/Container */}
      {Object.entries(data.containers).map(([name], i) => (
        <g key={name} transform={`translate(${80 + i * 100}, ${height - 60})`}>
          <rect x={-30} y={-25} width={60} height={40} fill="#78350f" rx={4} stroke="#451a03" strokeWidth={2} />
          <text y={5} textAnchor="middle" fontSize={10} fill="#fcd34d">📦 BOOT</text>
          
          {/* Tools in boot */}
          {Object.entries(data.tools).filter(([_, info]) => info.in?.includes('boot') || info.in?.includes('container')).map(([tool], j) => (
            <g key={tool} transform={`translate(${-20 + j * 15}, -35)`}>
              <rect width={12} height={12} fill={tool.includes('wrench') ? '#6b7280' : tool.includes('jack') ? '#f59e0b' : '#22c55e'} rx={2} />
            </g>
          ))}
        </g>
      ))}

      {/* Spare wheels */}
      {wheelList.filter(([_, info]) => !info.onVehicle && !info.holding).map(([name, info], i) => (
        <g key={name} transform={`translate(${width - 80 - i * 60}, ${height - 50})`}>
          <circle r={20} fill={info.inflated ? '#22c55e' : info.flat ? '#ef4444' : '#6b7280'} stroke="#374151" strokeWidth={2} />
          <text y={4} textAnchor="middle" fontSize={9} fill="white">{name.replace('wheel', 'W')}</text>
          {info.inflated && <text y={30} textAnchor="middle" fontSize={8} fill="#16a34a">GOOD</text>}
          {info.flat && <text y={30} textAnchor="middle" fontSize={8} fill="#dc2626">FLAT</text>}
        </g>
      ))}

      {/* Agent/Mechanic */}
      <g transform={`translate(${data.agentLocation === 'hub' ? width / 2 : 100}, ${height - 150})`}>
        {/* Person */}
        <circle cy={-30} r={12} fill="#fca5a5" />
        <rect x={-10} y={-15} width={20} height={35} fill="#3b82f6" rx={5} />
        <text y={5} textAnchor="middle" fontSize={12}>👤</text>
        
        {/* Holding wheel */}
        {wheelList.filter(([_, info]) => info.holding).map(([name]) => (
          <g key={name} transform="translate(25, -10)">
            <circle r={15} fill={data.wheels[name]?.flat ? '#ef4444' : '#22c55e'} stroke="#000" strokeWidth={2} />
            <text y={4} textAnchor="middle" fontSize={8} fill="white">{name.replace('wheel', '')}</text>
          </g>
        ))}

        {/* Holding tool */}
        {Object.entries(data.tools).filter(([_, info]) => info.have).map(([tool]) => (
          <g key={tool} transform="translate(-25, -10)">
            <rect x={-8} y={-8} width={16} height={16} fill={tool.includes('wrench') ? '#6b7280' : tool.includes('jack') ? '#f59e0b' : '#22c55e'} rx={2} />
            <text y={20} textAnchor="middle" fontSize={7} fill="#374151">{tool.includes('wrench') ? 'W' : tool.includes('jack') ? 'J' : 'P'}</text>
          </g>
        ))}
      </g>

      {/* Tools legend */}
      <g transform="translate(15, 30)">
        <rect width={120} height={80} fill="white" rx={8} opacity={0.9} />
        <text x={10} y={18} fontSize={10} fontWeight="bold" fill="#374151">TOOLS</text>
        <text x={10} y={35} fontSize={9} fill="#6b7280">🔧 Wrench - loosen/tighten</text>
        <text x={10} y={50} fontSize={9} fill="#6b7280">🔨 Jack - lift car</text>
        <text x={10} y={65} fontSize={9} fill="#6b7280">🎈 Pump - inflate</text>
      </g>

      {/* Action text */}
      {action && (
        <g>
          <rect x={width / 2 - 140} y={10} width={280} height={28} fill="white" rx={14} opacity={0.95} />
          <text x={width / 2} y={28} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#374151">
            {action.text.length > 40 ? action.text.substring(0, 40) + '...' : action.text}
          </text>
        </g>
      )}

      {/* Status */}
      <text x={15} y={height - 15} fontSize={10} fill="#374151">
        Wheels: {wheelList.length} | Nuts: {Object.keys(data.nuts).length} | Tools: {Object.keys(data.tools).length}
      </text>
    </svg>
  );
}
