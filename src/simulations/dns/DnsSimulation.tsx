import React, { useState, useEffect, useRef } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { StageCanvas } from '../../components/simulation/StageCanvas';
import {
  SimulationNode,
  Packet,
  ConnectionLink,
  Challenge,
} from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  Globe,
  Search,
  RotateCcw,
  CheckCircle2,
  Zap,
  Server,
  Database,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const DnsSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);

  // User input & options
  const [domain, setDomain] = useState('example.com');
  const [browserCacheEnabled, setBrowserCacheEnabled] = useState(true);
  const [osCacheEnabled, setOsCacheEnabled] = useState(true);
  const [ttl, setTtl] = useState(300);

  // Cached state records
  const [browserCache, setBrowserCache] = useState<Record<string, { ip: string; ttl: number }>>({});
  const [osCache, setOsCache] = useState<Record<string, { ip: string; ttl: number }>>({});

  // Active lookup tracking
  const [isResolving, setIsResolving] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [resolvedIp, setResolvedIp] = useState<string | null>(null);
  const [lookupType, setLookupType] = useState<'COLD' | 'BROWSER_CACHE_HIT' | 'OS_CACHE_HIT'>('COLD');

  const [packets, setPackets] = useState<Packet[]>([]);

  // Nodes for DNS Hierarchy
  const nodes: SimulationNode[] = [
    {
      id: 'browser',
      name: language === 'ar' ? 'متصفح العميل' : 'Web Browser',
      type: 'client',
      ip: '192.168.1.45',
      status: 'online',
      position: { x: 12, y: 30 },
      metadata: { cacheCount: Object.keys(browserCache).length },
    },
    {
      id: 'os_resolver',
      name: language === 'ar' ? 'مستعلم نظام التشغيل (Stub)' : 'OS Stub Resolver',
      type: 'client',
      ip: '127.0.0.53',
      status: 'online',
      position: { x: 12, y: 70 },
      metadata: { cacheCount: Object.keys(osCache).length },
    },
    {
      id: 'recursive_dns',
      name: language === 'ar' ? 'المستعلم التكراري (8.8.8.8)' : 'Recursive Resolver',
      type: 'dns',
      ip: '8.8.8.8',
      status: 'online',
      position: { x: 42, y: 50 },
      services: [{ name: 'DNS Recursor', port: 53, protocol: 'UDP', status: 'running' }],
    },
    {
      id: 'root_dns',
      name: language === 'ar' ? 'خادم الجذر Root (.)' : 'Root Server (.)',
      type: 'server',
      ip: '198.41.0.4',
      status: 'online',
      position: { x: 80, y: 20 },
      metadata: { zone: 'Root Zone (.)', referral: 'TLD Nameservers' },
    },
    {
      id: 'tld_dns',
      name: language === 'ar' ? 'خادم النطاق الأعلى TLD (.com)' : 'TLD Server (.com)',
      type: 'server',
      ip: '192.5.6.30',
      status: 'online',
      position: { x: 80, y: 50 },
      metadata: { zone: '.com TLD', referral: 'Authoritative Nameservers' },
    },
    {
      id: 'authoritative_dns',
      name: language === 'ar' ? 'خادم الأسماء المعتمد (NS)' : 'Authoritative NS',
      type: 'dns',
      ip: '93.184.216.34',
      status: 'online',
      position: { x: 80, y: 80 },
      metadata: { zone: 'example.com', authoritative: true },
    },
  ];

  const connections: ConnectionLink[] = [
    { id: 'c-b-os', source: 'browser', target: 'os_resolver', label: language === 'ar' ? 'ذاكرة النظام' : 'Local IPC / Cache' },
    { id: 'c-os-rec', source: 'os_resolver', target: 'recursive_dns', label: 'UDP 53' },
    { id: 'c-rec-root', source: 'recursive_dns', target: 'root_dns', label: language === 'ar' ? 'استعلام الجذور' : 'Root Query' },
    { id: 'c-rec-tld', source: 'recursive_dns', target: 'tld_dns', label: language === 'ar' ? 'استعلام TLD' : 'TLD Query' },
    { id: 'c-rec-auth', source: 'recursive_dns', target: 'authoritative_dns', label: language === 'ar' ? 'استعلام الخادم المعتمد' : 'Authoritative Query' },
  ];

  const dnsChallenge: Challenge = {
    id: 'dns-resolution-challenge',
    simulationId: 'dns',
    title: t.dns.missionTitle,
    difficulty: 'Beginner',
    category: t.dns.missionCategory,
    mission: t.dns.missionDesc,
    initialExplanation:
      language === 'ar'
        ? 'يقوم نظام DNS بتحويل أسماء النطاقات المفهومة للإنسان إلى عناوين IP رقمية. يتم الاستعلام بالتسلسل من الذاكرة المؤقتة إلى خوادم الجذور ثم النطاقات العليا ثم الخوادم المعتمدة.'
        : 'DNS resolves human-friendly hostnames into IP addresses. Resolution proceeds from local caches up to Root (.), TLD (.com), and domain Authoritative servers.',
    objectives: [
      {
        id: 'obj-cold-lookup',
        title: t.dns.objColdQuery,
        description: t.dns.objColdQueryDesc,
        isCompleted: resolvedIp !== null && lookupType === 'COLD',
        validationKey: 'cold_done',
      },
      {
        id: 'obj-cache-hit',
        title: t.dns.objCacheHit,
        description: t.dns.objCacheHitDesc,
        isCompleted: resolvedIp !== null && lookupType !== 'COLD',
        validationKey: 'cached_done',
      },
    ],
    hints: [t.dns.hint1, t.dns.hint2],
  };

  // Clear caches
  const handleClearCache = () => {
    setBrowserCache({});
    setOsCache({});
    setResolvedIp(null);
    setPackets([]);
    addLog({
      level: 'INFO',
      source: 'DNS_CLIENT',
      message: 'Flushed browser cache and system OS resolver cache (dscacheutil / ipconfig /flushdns).',
      category: 'SYSTEM',
    });
  };

  // Perform resolution
  const startResolution = () => {
    setPackets([]);
    setResolvedIp(null);
    setIsResolving(true);

    addLog({
      level: 'INFO',
      source: 'BROWSER',
      message: `Initiating DNS resolution for host: '${domain}'`,
      category: 'NETWORK',
    });

    // 1. Check Browser Cache
    if (browserCacheEnabled && browserCache[domain]) {
      setLookupType('BROWSER_CACHE_HIT');
      setResolvedIp(browserCache[domain].ip);
      setIsResolving(false);
      addLog({
        level: 'INFO',
        source: 'BROWSER_CACHE',
        message: `CACHE HIT: '${domain}' found in browser memory cache. IP: ${browserCache[domain].ip} (TTL: ${browserCache[domain].ttl}s)`,
        category: 'NETWORK',
      });
      addEvent({
        type: 'CACHE_HIT',
        description: `Browser cache hit for ${domain}`,
      });
      return;
    }

    // 2. Check OS Cache
    if (osCacheEnabled && osCache[domain]) {
      setLookupType('OS_CACHE_HIT');
      setResolvedIp(osCache[domain].ip);
      setIsResolving(false);
      addLog({
        level: 'INFO',
        source: 'OS_RESOLVER',
        message: `CACHE HIT: '${domain}' found in OS DNS cache. IP: ${osCache[domain].ip}`,
        category: 'NETWORK',
      });
      addEvent({
        type: 'CACHE_HIT',
        description: `OS DNS cache hit for ${domain}`,
      });
      // Store in browser cache
      if (browserCacheEnabled) {
        setBrowserCache((prev) => ({ ...prev, [domain]: { ip: osCache[domain].ip, ttl } }));
      }
      return;
    }

    // 3. Cold Recursive Resolution: Steps
    setLookupType('COLD');
    executeHierarchicalResolution();
  };

  const executeHierarchicalResolution = () => {
    const steps = [
      { src: 'browser', dst: 'os_resolver', label: 'Query OS', delay: 100 },
      { src: 'os_resolver', dst: 'recursive_dns', label: 'Forward to 8.8.8.8', delay: 800 },
      { src: 'recursive_dns', dst: 'root_dns', label: 'Query Root (.)', delay: 1600 },
      { src: 'root_dns', dst: 'recursive_dns', label: 'Referral .com', delay: 2400 },
      { src: 'recursive_dns', dst: 'tld_dns', label: 'Query .com TLD', delay: 3200 },
      { src: 'tld_dns', dst: 'recursive_dns', label: 'Referral ns1.example.com', delay: 4000 },
      { src: 'recursive_dns', dst: 'authoritative_dns', label: 'Query Authoritative', delay: 4800 },
      { src: 'authoritative_dns', dst: 'recursive_dns', label: 'A Record: 93.184.216.34', delay: 5600 },
      { src: 'recursive_dns', dst: 'os_resolver', label: 'Answer to OS', delay: 6400 },
      { src: 'os_resolver', dst: 'browser', label: 'Answer to Browser', delay: 7200 },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStepIndex(index);
        const pkt: Packet = {
          id: `dns-${Date.now()}-${index}`,
          source: step.src,
          destination: step.dst,
          protocol: 'DNS',
          sourcePort: 53,
          destinationPort: 53,
          label: step.label,
          state: 'moving',
          progress: 0,
          timestamp: Date.now(),
        };

        setPackets([pkt]);

        addLog({
          level: 'INFO',
          source: step.src.toUpperCase(),
          message: `DNS Flow: ${step.label} (${step.src} → ${step.dst})`,
          category: 'NETWORK',
        });

        // Final arrival
        if (index === steps.length - 1) {
          const finalIp = '93.184.216.34';
          setResolvedIp(finalIp);
          setIsResolving(false);
          if (browserCacheEnabled) {
            setBrowserCache((prev) => ({ ...prev, [domain]: { ip: finalIp, ttl } }));
          }
          if (osCacheEnabled) {
            setOsCache((prev) => ({ ...prev, [domain]: { ip: finalIp, ttl } }));
          }
          addEvent({
            type: 'PACKET_RECEIVED',
            description: `DNS A record resolved: ${domain} -> ${finalIp}`,
          });
        }
      }, step.delay / clockSpeed);
    });
  };

  // Animate single packet progress
  useEffect(() => {
    if (packets.length === 0) return;
    const interval = setInterval(() => {
      setPackets((prev) =>
        prev.map((p) => {
          if (p.progress >= 1.0) return { ...p, state: 'delivered' };
          return { ...p, progress: p.progress + 0.08 * clockSpeed };
        })
      );
    }, 30);
    return () => clearInterval(interval);
  }, [packets, clockSpeed]);

  const validateChallenge = () => {
    if (resolvedIp && lookupType === 'COLD') {
      return {
        success: true,
        message: t.dns.valSuccess,
      };
    }
    if (resolvedIp && lookupType !== 'COLD') {
      return {
        success: true,
        message: t.dns.valSuccess,
      };
    }
    return {
      success: false,
      message: t.dns.valColdNeeded,
    };
  };

  return (
    <Workspace
      title={t.dns.title}
      subtitle={t.dns.subtitle}
      challenge={dnsChallenge}
      onValidateChallenge={validateChallenge}
      onRestart={handleClearCache}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Domain Input Form */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. example.com"
                className="w-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-400"
              />
            </div>
            <button
              onClick={startResolution}
              disabled={isResolving}
              className="py-1.5 px-3.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.dns.resolveBtn}</span>
            </button>
            <button
              onClick={handleClearCache}
              className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              {t.dns.flushCache}
            </button>
          </div>

          {/* Cache toggles and TTL */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={browserCacheEnabled}
                onChange={(e) => setBrowserCacheEnabled(e.target.checked)}
                className="rounded border-slate-700 text-violet-500 focus:ring-violet-500"
              />
              <span>{t.dns.browserCache}</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={osCacheEnabled}
                onChange={(e) => setOsCacheEnabled(e.target.checked)}
                className="rounded border-slate-700 text-violet-500 focus:ring-violet-500"
              />
              <span>{t.dns.osCache}</span>
            </label>

            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1 rounded border border-slate-800">
              <span className="text-[11px] text-slate-400">{t.dns.recordTtl}</span>
              <span className="text-xs font-mono text-cyan-300 font-bold">{ttl}s</span>
            </div>
          </div>
        </div>
      }
    >
      {/* Resolution Outcome Banner */}
      {resolvedIp && (
        <div className="absolute top-4 left-6 right-6 z-20 flex justify-center pointer-events-none">
          <div className="bg-slate-950/95 border border-emerald-500/70 p-3 rounded-xl shadow-xl flex items-center gap-3 pointer-events-auto">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">{domain}</span>
                <span className="text-[10px] text-slate-400 font-mono">→</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{resolvedIp}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                {t.dns.resolvedBanner}{' '}
                <span className="text-cyan-300 font-semibold">{lookupType}</span> (
                {lookupType === 'COLD'
                  ? language === 'ar' ? '4 استعلامات عبر الشبكة' : '4 network roundtrips'
                  : language === 'ar' ? 'استجابة فورية من الذاكرة 0ms' : '0ms local cache hit'})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <StageCanvas
        nodes={nodes}
        connections={connections}
        packets={packets}
      />
    </Workspace>
  );
};
