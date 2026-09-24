import React, { useState, useEffect, useRef } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  Shield,
  Server,
  Globe,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  Lock,
} from 'lucide-react';

interface MiniPacket {
  id: string;
  source: string;
  destination: string;
  port: number;
  protocol: string;
  progress: number; // 0 to 100
  state: 'moving' | 'blocked' | 'delivered';
  isMalicious: boolean;
}

export const InteractiveHero: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const selectEntity = useSimulationStore((s) => s.selectEntity);

  // Firewall policy modes
  const [firewallMode, setFirewallMode] = useState<'strict' | 'permissive' | 'block_all'>('strict');
  const [trafficRate, setTrafficRate] = useState<'normal' | 'high'>('normal');

  // Mini simulation state
  const [packets, setPackets] = useState<MiniPacket[]>([]);
  const [stats, setStats] = useState({
    evaluated: 0,
    allowed: 0,
    blocked: 0,
  });

  const nextPacketIdRef = useRef(1);

  // Spawn packets continuously
  useEffect(() => {
    const intervalTime = trafficRate === 'normal' ? 800 : 350;
    const interval = setInterval(() => {
      const isMalicious = Math.random() < 0.45;
      const portChoices = isMalicious ? [80, 23, 22, 445] : [443, 443, 80, 53];
      const port = portChoices[Math.floor(Math.random() * portChoices.length)];

      const newPacket: MiniPacket = {
        id: `pkt-${nextPacketIdRef.current++}`,
        source: isMalicious ? '203.0.113.88' : '198.51.100.14',
        destination: '10.0.0.50',
        port,
        protocol: port === 53 ? 'DNS' : port === 443 ? 'HTTPS' : 'TCP',
        progress: 0,
        state: 'moving',
        isMalicious,
      };

      setPackets((prev) => [...prev.slice(-15), newPacket]);
      setStats((s) => ({ ...s, evaluated: s.evaluated + 1 }));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [trafficRate]);

  const packetsRef = useRef<MiniPacket[]>([]);
  packetsRef.current = packets;

  // Motion animation loop
  useEffect(() => {
    let animId: number;
    const update = () => {
      const currentPackets = packetsRef.current;
      let blockedDelta = 0;
      let allowedDelta = 0;

      const nextPackets: MiniPacket[] = [];

      for (const pkt of currentPackets) {
        if (pkt.state === 'delivered' || pkt.state === 'blocked') {
          nextPackets.push({ ...pkt, progress: pkt.progress + 0.8 });
          continue;
        }

        const nextProgress = pkt.progress + 1.2;

        // At progress 50%, packet meets the firewall!
        if (nextProgress >= 50 && pkt.progress < 50) {
          let shouldBlock = false;
          if (firewallMode === 'block_all') {
            shouldBlock = true;
          } else if (firewallMode === 'strict') {
            shouldBlock = pkt.port !== 443 && pkt.port !== 53;
          } else {
            shouldBlock = pkt.port === 23 || pkt.port === 445;
          }

          if (shouldBlock) {
            blockedDelta++;
            nextPackets.push({ ...pkt, progress: 50, state: 'blocked' });
            continue;
          } else {
            nextPackets.push({ ...pkt, progress: nextProgress });
            continue;
          }
        }

        if (nextProgress >= 100) {
          allowedDelta++;
          nextPackets.push({ ...pkt, progress: 100, state: 'delivered' });
          continue;
        }

        nextPackets.push({ ...pkt, progress: nextProgress });
      }

      setPackets(nextPackets.filter((pkt) => pkt.progress <= 115));

      if (blockedDelta > 0 || allowedDelta > 0) {
        setStats((s) => ({
          ...s,
          blocked: s.blocked + blockedDelta,
          allowed: s.allowed + allowedDelta,
        }));
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [firewallMode]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 flex flex-col items-center">
      {/* Hero Headline Section */}
      <div className="max-w-4xl w-full text-center mt-4 mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>{t.hero.badge}</span>
          <span aria-hidden="true">·</span>
          <span>{t.hero.sub1}</span>
          <span aria-hidden="true">·</span>
          <span>{t.hero.sub3}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance">
          {t.hero.headline}
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto mt-3 text-balance leading-relaxed">
          {t.hero.description}
        </p>
      </div>

      {/* Interactive Live Mini-Simulation Card */}
      <div className="max-w-4xl w-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md mb-8">
        {/* Top Control Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {t.hero.stageTitle}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {t.hero.stageDesc}
            </span>
          </div>

          {/* Interactive Policy Selectors */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{t.hero.policy}</span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setFirewallMode('strict')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  firewallMode === 'strict'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.hero.strict}
              </button>
              <button
                onClick={() => setFirewallMode('permissive')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  firewallMode === 'permissive'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.hero.permissive}
              </button>
              <button
                onClick={() => setFirewallMode('block_all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  firewallMode === 'block_all'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.hero.blockAll}
              </button>
            </div>
          </div>
        </div>

        {/* The Mini Simulation Canvas */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-950/90 overflow-hidden flex items-center justify-between px-8 sm:px-16">
          {/* Subtle Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15">
            <defs>
              <pattern id="hero-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>

          {/* Connection Highway Line */}
          <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0">
            <div className="absolute inset-0 border-t border-dashed border-slate-600" />
          </div>

          {/* Node 1: Internet Client */}
          <div
            onClick={() =>
              selectEntity('node', 'hero-internet', {
                name: t.hero.internet,
                ip: 'WAN / 0.0.0.0/0',
                type: 'internet',
                status: 'online',
              })
            }
            className="relative z-10 flex flex-col items-center cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border-2 border-cyan-500/80 flex items-center justify-center shadow-lg shadow-cyan-950/50 group-hover:scale-105 transition-transform">
              <Globe className="w-8 h-8 text-cyan-400" />
            </div>
            <span className="text-xs font-bold text-white mt-2">{t.hero.internet}</span>
            <span className="text-[10px] font-mono text-slate-400">{t.hero.wanTraffic}</span>
          </div>

          {/* Node 2: Firewall Barrier */}
          <div
            onClick={() =>
              selectEntity('node', 'hero-firewall', {
                name: t.hero.edgeFirewall,
                ip: '10.0.0.1',
                type: 'firewall',
                status: firewallMode === 'block_all' ? 'blocked' : 'protected',
                policy: firewallMode,
              })
            }
            className="relative z-10 flex flex-col items-center cursor-pointer group"
          >
            <div
              className={`w-18 h-18 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl ${
                firewallMode === 'strict'
                  ? 'bg-emerald-950/60 border-emerald-500/80 shadow-emerald-950/50'
                  : firewallMode === 'permissive'
                  ? 'bg-amber-950/60 border-amber-500/80 shadow-amber-950/50'
                  : 'bg-rose-950/60 border-rose-500/80 shadow-rose-950/50'
              } group-hover:scale-105`}
            >
              <Shield className="w-9 h-9 text-white" />
            </div>
            <span className="text-xs font-bold text-white mt-2">{t.hero.edgeFirewall}</span>
            <span className="text-[10px] font-mono text-slate-300 uppercase">
              {firewallMode} {t.hero.firewallMode}
            </span>
          </div>

          {/* Node 3: Target Server */}
          <div
            onClick={() =>
              selectEntity('node', 'hero-server', {
                name: t.hero.appServer,
                ip: '10.0.0.50',
                type: 'server',
                status: 'online',
                services: [
                  { name: 'HTTPS', port: 443, protocol: 'TCP' },
                  { name: 'HTTP', port: 80, protocol: 'TCP' },
                ],
              })
            }
            className="relative z-10 flex flex-col items-center cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border-2 border-indigo-500/80 flex items-center justify-center shadow-lg shadow-indigo-950/50 group-hover:scale-105 transition-transform">
              <Server className="w-8 h-8 text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-white mt-2">{t.hero.appServer}</span>
            <span className="text-[10px] font-mono text-slate-400">10.0.0.50</span>
          </div>

          {/* Moving Packets */}
          {packets.map((pkt) => {
            const leftPct = 12 + (pkt.progress / 100) * 76;
            const isBlocked = pkt.state === 'blocked';

            return (
              <div
                key={pkt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectEntity('packet', pkt.id, pkt);
                }}
                style={{
                  left: `${leftPct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-20 cursor-pointer flex flex-col items-center transition-opacity ${
                  isBlocked ? 'animate-pulse' : ''
                }`}
              >
                <div
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border shadow-md flex items-center gap-1 ${
                    isBlocked
                      ? 'bg-rose-600 border-rose-400 text-white'
                      : pkt.isMalicious
                      ? 'bg-amber-600 border-amber-300 text-white'
                      : 'bg-cyan-600 border-cyan-300 text-white'
                  }`}
                >
                  <span>{pkt.protocol}</span>
                  <span className="text-[9px] opacity-80">:{pkt.port}</span>
                </div>
                {isBlocked && (
                  <span className="text-[8px] font-mono bg-rose-950 text-rose-300 px-1 rounded mt-0.5 border border-rose-800">
                    BLOCKED
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Counters Bottom Ribbon */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 grid grid-cols-3 divide-x divide-slate-800 text-center">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">
              {t.hero.evaluatedPackets}
            </span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {stats.evaluated}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase block">
              {t.hero.permittedPackets}
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {stats.allowed}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-rose-400 uppercase block">
              {t.hero.filteredPackets}
            </span>
            <span className="text-lg font-bold font-mono text-rose-400 tabular-nums">
              {stats.blocked}
            </span>
          </div>
        </div>
      </div>

      {/* Simulators Showcase Grid */}
      <div className="max-w-4xl w-full mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.hero.labsTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.hero.labsDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: TCP Handshake */}
          <div
            onClick={() => setActiveSimulation('tcp')}
            className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/80 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                {t.hero.cards.tcp.tag}
              </span>
              <span className="text-xs font-mono text-slate-500 group-hover:text-cyan-300 flex items-center gap-1">
                {t.hero.launchLab} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {t.hero.cards.tcp.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.hero.cards.tcp.desc}
            </p>
          </div>

          {/* Card 2: DNS Resolution */}
          <div
            onClick={() => setActiveSimulation('dns')}
            className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/80 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-violet-400 uppercase font-semibold">
                {t.hero.cards.dns.tag}
              </span>
              <span className="text-xs font-mono text-slate-500 group-hover:text-violet-300 flex items-center gap-1">
                {t.hero.launchLab} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
              {t.hero.cards.dns.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.hero.cards.dns.desc}
            </p>
          </div>

          {/* Card 3: Firewall Rules */}
          <div
            onClick={() => setActiveSimulation('firewall')}
            className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/80 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">
                {t.hero.cards.firewall.tag}
              </span>
              <span className="text-xs font-mono text-slate-500 group-hover:text-indigo-300 flex items-center gap-1">
                {t.hero.launchLab} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              {t.hero.cards.firewall.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.hero.cards.firewall.desc}
            </p>
          </div>

          {/* Card 4: HTTP Lifecycle */}
          <div
            onClick={() => setActiveSimulation('http')}
            className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/80 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                {t.hero.cards.http.tag}
              </span>
              <span className="text-xs font-mono text-slate-500 group-hover:text-emerald-300 flex items-center gap-1">
                {t.hero.launchLab} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              {t.hero.cards.http.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.hero.cards.http.desc}
            </p>
          </div>

          {/* Card 5: TLS Handshake */}
          <div
            onClick={() => setActiveSimulation('tls')}
            className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/80 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                {t.hero.cards.tls.tag}
              </span>
              <span className="text-xs font-mono text-slate-500 group-hover:text-cyan-300 flex items-center gap-1">
                {t.hero.launchLab} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {t.hero.cards.tls.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.hero.cards.tls.desc}
            </p>
          </div>

          {/* Card 6: Linux Permissions */}
          <div
            onClick={() => setActiveSimulation('linux')}
            className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/80 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                {t.hero.cards.linux.tag}
              </span>
              <span className="text-xs font-mono text-slate-500 group-hover:text-amber-300 flex items-center gap-1">
                {t.hero.launchLab} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              {t.hero.cards.linux.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.hero.cards.linux.desc}
            </p>
          </div>

          {/* Card 7: Crypto & Avalanche */}
          <div
            onClick={() => setActiveSimulation('crypto')}
            className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/80 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold">
                {t.hero.cards.crypto.tag}
              </span>
              <span className="text-xs font-mono text-slate-500 group-hover:text-teal-300 flex items-center gap-1">
                {t.hero.launchLab} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
              {t.hero.cards.crypto.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.hero.cards.crypto.desc}
            </p>
          </div>

          {/* Card 8: SIEM Log Correlation */}
          <div
            onClick={() => setActiveSimulation('siem')}
            className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-rose-500/80 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">
                {t.hero.cards.siem.tag}
              </span>
              <span className="text-xs font-mono text-slate-500 group-hover:text-rose-300 flex items-center gap-1">
                {t.hero.launchLab} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              {t.hero.cards.siem.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.hero.cards.siem.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

