import React, { useRef, useState, useEffect } from 'react';
import {
  SimulationNode,
  Packet,
  ConnectionLink,
  NodeType,
} from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { Stage3DCanvas } from './Stage3DCanvas';
import {
  Server,
  Laptop,
  Shield,
  Database,
  Globe,
  Radio,
  FileCheck,
  AlertTriangle,
  Lock,
  Layers,
  Terminal,
  Activity,
  HardDrive,
  Box,
} from 'lucide-react';

interface StageCanvasProps {
  nodes: SimulationNode[];
  connections: ConnectionLink[];
  packets: Packet[];
  onNodeClick?: (node: SimulationNode) => void;
  onPacketClick?: (packet: Packet) => void;
  height?: string | number;
  interactive?: boolean;
}

export const StageCanvas: React.FC<StageCanvasProps> = ({
  nodes,
  connections,
  packets,
  onNodeClick,
  onPacketClick,
  height = '100%',
  interactive = true,
}) => {
  const selectedEntity = useSimulationStore((s) => s.selectedEntity);
  const selectEntity = useSimulationStore((s) => s.selectEntity);
  const clearSelection = useSimulationStore((s) => s.clearSelection);
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const containerRef = useRef<HTMLDivElement>(null);

  // Check if WebGL is available in this environment
  const [hasWebGL, setHasWebGL] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  });

  // Default to 3D if WebGL is supported, otherwise fallback to 2D
  const [viewMode, setViewMode] = useState<'3d' | '2d'>(() => (hasWebGL ? '3d' : '2d'));

  // Map node type to Icon
  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'client':
        return Laptop;
      case 'server':
        return Server;
      case 'firewall':
        return Shield;
      case 'database':
        return Database;
      case 'dns':
        return Globe;
      case 'router':
      case 'switch':
        return Radio;
      case 'ca':
        return FileCheck;
      case 'attacker':
        return Terminal;
      case 'siem':
        return Activity;
      default:
        return HardDrive;
    }
  };

  const getNodeColor = (node: SimulationNode) => {
    if (node.status === 'blocked' || node.status === 'isolated') {
      return { border: 'border-rose-500/80', bg: 'bg-rose-950/40', text: 'text-rose-400', glow: 'shadow-rose-900/40' };
    }
    if (node.status === 'warning') {
      return { border: 'border-amber-500/80', bg: 'bg-amber-950/40', text: 'text-amber-400', glow: 'shadow-amber-900/40' };
    }
    if (node.type === 'firewall') {
      return { border: 'border-indigo-500/80', bg: 'bg-indigo-950/40', text: 'text-indigo-400', glow: 'shadow-indigo-900/40' };
    }
    if (node.type === 'dns') {
      return { border: 'border-violet-500/80', bg: 'bg-violet-950/40', text: 'text-violet-400', glow: 'shadow-violet-900/40' };
    }
    if (node.type === 'database') {
      return { border: 'border-emerald-500/80', bg: 'bg-emerald-950/40', text: 'text-emerald-400', glow: 'shadow-emerald-900/40' };
    }
    return { border: 'border-cyan-500/80', bg: 'bg-cyan-950/40', text: 'text-cyan-400', glow: 'shadow-cyan-900/40' };
  };

  // Find node by ID
  const nodeMap = new Map<string, SimulationNode>(nodes.map((n) => [n.id, n]));

  // Calculate packet interpolated position
  const getPacketCoord = (packet: Packet): { x: number; y: number } | null => {
    const srcNode = nodeMap.get(packet.source);
    const destNode = nodeMap.get(packet.destination);

    if (!srcNode || !destNode) return null;

    // Direct interpolation between source and destination positions (percentages 0-100)
    const t = Math.max(0, Math.min(1, packet.progress));
    const x = srcNode.position.x + (destNode.position.x - srcNode.position.x) * t;
    const y = srcNode.position.y + (destNode.position.y - srcNode.position.y) * t;
    return { x, y };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] bg-slate-950 overflow-hidden select-none"
      style={{ height }}
      data-testid="stage-canvas-container"
    >
      {/* View Mode Switcher Header Toggle (3D Cyber Range vs 2D Schematic) */}
      <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-lg">
        <button
          onClick={() => setViewMode('3d')}
          disabled={!hasWebGL}
          className={`px-2.5 py-1 text-[10px] font-mono rounded-lg flex items-center gap-1.5 transition-all ${
            viewMode === '3d'
              ? 'bg-cyan-600 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : hasWebGL
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title={isAr ? 'عرض المختبر ثلاثي الأبعاد الواقعي' : '3D Realistic Cyber Range'}
        >
          <Box className="w-3 h-3" />
          <span>{isAr ? 'بيئة 3D واقعية' : '3D Range'}</span>
        </button>

        <button
          onClick={() => setViewMode('2d')}
          className={`px-2.5 py-1 text-[10px] font-mono rounded-lg flex items-center gap-1.5 transition-all ${
            viewMode === '2d'
              ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={isAr ? 'المخطط الشبكي التخطيطي 2D' : '2D Schematic Blueprint'}
        >
          <Layers className="w-3 h-3" />
          <span>{isAr ? 'مخطط 2D' : '2D Blueprint'}</span>
        </button>
      </div>

      {/* Render 3D Cyber Range if active and WebGL available */}
      {viewMode === '3d' && hasWebGL ? (
        <Stage3DCanvas
          nodes={nodes}
          connections={connections}
          packets={packets}
          onNodeClick={onNodeClick}
          onPacketClick={onPacketClick}
          interactive={interactive}
        />
      ) : (
        /* Accessible 2D Blueprint Schematic View */
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && interactive) {
              clearSelection();
            }
          }}
          className="relative w-full h-full min-h-[380px] bg-slate-950 overflow-hidden select-none"
        >
          {/* Background blueprint coordinate grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.5" fill="rgba(148, 163, 184, 0.4)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>

          {/* SVG Connection Links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn) => {
              const src = nodeMap.get(conn.source);
              const tgt = nodeMap.get(conn.target);
              if (!src || !tgt) return null;

              const isSelected =
                selectedEntity?.type === 'connection' && selectedEntity.id === conn.id;

              return (
                <g key={conn.id}>
                  {/* Backing halo line */}
                  <line
                    x1={`${src.position.x}%`}
                    y1={`${src.position.y}%`}
                    x2={`${tgt.position.x}%`}
                    y2={`${tgt.position.y}%`}
                    stroke={isSelected ? 'rgba(6, 182, 212, 0.6)' : 'rgba(51, 65, 85, 0.4)'}
                    strokeWidth={isSelected ? 4 : 2}
                    strokeLinecap="round"
                  />
                  {/* Animated dashed transmission line */}
                  <line
                    x1={`${src.position.x}%`}
                    y1={`${src.position.y}%`}
                    x2={`${tgt.position.x}%`}
                    y2={`${tgt.position.y}%`}
                    stroke={conn.status === 'down' ? '#f43f5e' : 'rgba(148, 163, 184, 0.5)'}
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  {/* Optional connection label */}
                  {conn.label && (
                    <text
                      x={`${(src.position.x + tgt.position.x) / 2}%`}
                      y={`${(src.position.y + tgt.position.y) / 2 - 2}%`}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes layer */}
          {nodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const colors = getNodeColor(node);
            const isSelected = selectedEntity?.type === 'node' && selectedEntity.id === node.id;

            return (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (interactive) {
                    selectEntity('node', node.id, node);
                    onNodeClick?.(node);
                  }
                }}
                style={{
                  left: `${node.position.x}%`,
                  top: `${node.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute flex flex-col items-center group cursor-pointer transition-all duration-200 z-10`}
              >
                {/* Node Box */}
                <div
                  className={`relative flex items-center justify-center w-14 h-14 rounded-xl border-2 backdrop-blur-md transition-all shadow-md ${
                    colors.border
                  } ${colors.bg} ${colors.glow} ${
                    isSelected
                      ? 'ring-2 ring-white scale-110 shadow-lg'
                      : 'hover:scale-105 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-7 h-7 ${colors.text}`} />

                  {/* Status pulse dot */}
                  <div className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        node.status === 'blocked'
                          ? 'bg-rose-400'
                          : node.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 border border-slate-950 ${
                        node.status === 'blocked'
                          ? 'bg-rose-500'
                          : node.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Role badge for firewall / gateway */}
                  {node.type === 'firewall' && (
                    <div className="absolute -bottom-2 bg-indigo-500/90 text-white text-[9px] font-mono px-1.5 py-0.2 rounded border border-indigo-400/50">
                      FW
                    </div>
                  )}
                </div>

                {/* Node Labels */}
                <div className="mt-2 flex flex-col items-center pointer-events-none">
                  <span className="text-xs font-semibold text-slate-200 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800 shadow-xs">
                    {node.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {node.ip}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Moving Packets Layer */}
          {packets.map((packet) => {
            const coord = getPacketCoord(packet);
            if (!coord) return null;

            const isSelected = selectedEntity?.type === 'packet' && selectedEntity.id === packet.id;
            const isBlocked = packet.state === 'blocked' || packet.state === 'dropped';

            // Badge styling based on protocol
            const getProtocolBadge = () => {
              if (isBlocked) {
                return 'bg-rose-600 border-rose-400 text-white ring-2 ring-rose-500/50';
              }
              switch (packet.protocol) {
                case 'TCP':
                  return 'bg-cyan-600 border-cyan-300 text-white';
                case 'DNS':
                  return 'bg-violet-600 border-violet-300 text-white';
                case 'HTTP':
                  return 'bg-amber-600 border-amber-300 text-white';
                case 'HTTPS':
                case 'TLS':
                  return 'bg-emerald-600 border-emerald-300 text-white';
                case 'ICMP':
                  return 'bg-purple-600 border-purple-300 text-white';
                default:
                  return 'bg-blue-600 border-blue-300 text-white';
              }
            };

            return (
              <div
                key={packet.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (interactive) {
                    selectEntity('packet', packet.id, packet);
                    onPacketClick?.(packet);
                  }
                }}
                style={{
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-20 cursor-pointer transition-transform duration-75 flex flex-col items-center ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                {/* Packet visual particle */}
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-mono font-bold shadow-lg backdrop-blur-sm ${getProtocolBadge()} ${
                    isSelected ? 'ring-2 ring-white shadow-cyan-500/50' : ''
                  }`}
                >
                  {isBlocked ? (
                    <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                  ) : packet.flags && packet.flags.length > 0 ? (
                    <span>{packet.flags.join('-')}</span>
                  ) : (
                    <span>{packet.label || packet.protocol}</span>
                  )}
                  <span className="text-[10px] opacity-80">
                    :{packet.destinationPort}
                  </span>
                </div>

                {/* Blocked or dropped banner */}
                {isBlocked && (
                  <span className="text-[9px] font-mono text-rose-300 bg-rose-950/90 border border-rose-800 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap">
                    {packet.blockedReason || 'DROPPED'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
