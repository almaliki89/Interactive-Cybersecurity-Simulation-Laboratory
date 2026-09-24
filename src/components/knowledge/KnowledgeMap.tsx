import React from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  Shield,
  Network,
  Globe,
  Lock,
  Terminal,
  Activity,
  Key,
  Layers,
  ArrowRight,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface ConceptNode {
  id: string;
  simulationId: SimulationId;
  titleKey: string;
  defaultTitle: string;
  category: string;
  defaultDesc: string;
  dependencies: string[];
  x: number;
  y: number;
  icon: any;
}

const CONCEPTS: ConceptNode[] = [
  {
    id: 'networking_basics',
    simulationId: 'landing',
    titleKey: 'networking_basics',
    defaultTitle: 'Network Packet Flow',
    category: 'Fundamentals',
    defaultDesc: 'Packets, routing, ports, and stateful perimeter enforcement.',
    dependencies: [],
    x: 18,
    y: 45,
    icon: Network,
  },
  {
    id: 'tcp_handshake',
    simulationId: 'tcp',
    titleKey: 'tcp_handshake',
    defaultTitle: 'TCP 3-Way Handshake',
    category: 'Networking',
    defaultDesc: 'SYN, SYN-ACK, ACK sequence numbers, packet loss, and retransmissions.',
    dependencies: ['networking_basics'],
    x: 40,
    y: 25,
    icon: ArrowRight,
  },
  {
    id: 'dns_resolution',
    simulationId: 'dns',
    titleKey: 'dns_resolution',
    defaultTitle: 'DNS Hierarchical Resolution',
    category: 'Networking',
    defaultDesc: 'Root servers, TLDs, Authoritative servers, caching & TTLs.',
    dependencies: ['networking_basics'],
    x: 40,
    y: 65,
    icon: Globe,
  },
  {
    id: 'firewall_rules',
    simulationId: 'firewall',
    titleKey: 'firewall_rules',
    defaultTitle: 'Firewall Rule Engine',
    category: 'Perimeter Defense',
    defaultDesc: 'Ordered ACL evaluation, stateful inspection, ALLOW/DENY/DROP policies.',
    dependencies: ['networking_basics'],
    x: 40,
    y: 85,
    icon: Shield,
  },
  {
    id: 'http_flow',
    simulationId: 'http',
    titleKey: 'http_flow',
    defaultTitle: 'HTTP Full Request Lifecycle',
    category: 'Web Security',
    defaultDesc: 'Browser -> Web Server -> Worker App -> Database query pipeline.',
    dependencies: ['tcp_handshake', 'dns_resolution'],
    x: 65,
    y: 25,
    icon: Globe,
  },
  {
    id: 'tls_handshake',
    simulationId: 'tls',
    titleKey: 'tls_handshake',
    defaultTitle: 'TLS 1.3 Cryptographic Handshake',
    category: 'Cryptography & Web',
    defaultDesc: 'Certificates, CA validation, Diffie-Hellman keys, and encrypted streams.',
    dependencies: ['http_flow'],
    x: 85,
    y: 25,
    icon: Lock,
  },
  {
    id: 'crypto_lab',
    simulationId: 'crypto',
    titleKey: 'crypto_lab',
    defaultTitle: 'Hashing & Avalanche Effect',
    category: 'Cryptography',
    defaultDesc: 'Cryptographic hash functions, bit change diffusion, and collisions.',
    dependencies: ['networking_basics'],
    x: 65,
    y: 65,
    icon: Key,
  },
  {
    id: 'linux_perms',
    simulationId: 'linux',
    titleKey: 'linux_perms',
    defaultTitle: 'Linux Permissions & DAC',
    category: 'System Hardening',
    defaultDesc: 'User, group, other permissions (rwx), octal notation, and access checks.',
    dependencies: ['networking_basics'],
    x: 65,
    y: 85,
    icon: Terminal,
  },
  {
    id: 'siem_correlation',
    simulationId: 'siem',
    titleKey: 'siem_analysis',
    defaultTitle: 'SIEM Event Correlation',
    category: 'SOC & Blue Team',
    defaultDesc: 'Log ingestion, sliding window correlation rules, and brute-force detection.',
    dependencies: ['firewall_rules', 'linux_perms'],
    x: 85,
    y: 75,
    icon: Activity,
  },
];

export const KnowledgeMap: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const completedChallenges = useSimulationStore((s) => s.completedChallenges);

  return (
    <div className="flex-1 h-full bg-slate-950 flex flex-col p-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full mb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4" />
          <span>{t.knowledgeMap.subtitle}</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {t.knowledgeMap.title}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t.knowledgeMap.desc}
        </p>
      </div>

      {/* Visual Graph Viewport */}
      <div className="max-w-5xl mx-auto w-full flex-1 min-h-[560px] relative bg-slate-900/40 border border-slate-800 rounded-2xl p-4 overflow-hidden">
        {/* SVG Dependency Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(56, 189, 248, 0.5)" />
            </marker>
          </defs>

          {CONCEPTS.flatMap((target) =>
            target.dependencies.map((sourceId) => {
              const source = CONCEPTS.find((c) => c.id === sourceId);
              if (!source) return null;

              return (
                <line
                  key={`${source.id}->${target.id}`}
                  x1={`${source.x}%`}
                  y1={`${source.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke="rgba(56, 189, 248, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  markerEnd="url(#arrow)"
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {CONCEPTS.map((concept) => {
          const Icon = concept.icon;
          const isDone = completedChallenges.includes(concept.id);

          const nodeData = (t.knowledgeMap.nodes as any)?.[concept.titleKey];
          const nodeTitle = nodeData?.title || concept.defaultTitle;
          const nodeCategory = nodeData?.category || concept.category;
          const nodeDesc = nodeData?.desc || concept.defaultDesc;

          return (
            <div
              key={concept.id}
              style={{ left: `${concept.x}%`, top: `${concept.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div
                onClick={() => setActiveSimulation(concept.simulationId)}
                className="w-56 p-3.5 rounded-xl bg-slate-950/95 border border-slate-800 hover:border-cyan-400 cursor-pointer shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    {nodeCategory}
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 group-hover:text-cyan-300 transition-colors">
                      {t.knowledgeMap.launchLab} →
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-cyan-400 group-hover:border-cyan-500/50">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                      {nodeTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {nodeDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
