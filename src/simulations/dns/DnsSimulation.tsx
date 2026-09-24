import React, { useState, useEffect } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { StageCanvas } from '../../components/simulation/StageCanvas';
import {
  SimulationNode,
  ConnectionLink,
  Challenge,
} from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { ScenarioDefinition } from '../../engine/scenario/ScenarioEngine';
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

  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const packets = useSimulationStore((s) => s.packets);
  const selectEntity = useSimulationStore((s) => s.selectEntity);

  // User input & options
  const [domain, setDomain] = useState('example.com');
  const [browserCacheEnabled, setBrowserCacheEnabled] = useState(true);
  const [osCacheEnabled, setOsCacheEnabled] = useState(true);
  const [ttl, setTtl] = useState(300);

  // Cached state records
  const [browserCache, setBrowserCache] = useState<Record<string, { ip: string; ttl: number }>>({});
  const [osCache, setOsCache] = useState<Record<string, { ip: string; ttl: number }>>({});

  // Active lookup tracking
  const [resolvedIp, setResolvedIp] = useState<string | null>(null);
  const [lookupType, setLookupType] = useState<'COLD' | 'BROWSER_CACHE_HIT' | 'OS_CACHE_HIT'>('COLD');

  // React to runtime resolution events
  useEffect(() => {
    const history = globalSimulationRuntime.events.getHistory();
    const finalRespEvt = history.find((e) => e.type === 'DNS_RESPONSE' && e.payload?.ip);
    if (finalRespEvt && finalRespEvt.payload) {
      setResolvedIp(finalRespEvt.payload.ip);
    }
  }, [virtualTime]);

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

  const handleClearCache = () => {
    setBrowserCache({});
    setOsCache({});
    setResolvedIp(null);
    globalSimulationRuntime.reset();
    globalSimulationRuntime.logs.log({
      level: 'INFO',
      source: 'DNS_CLIENT',
      message: 'Flushed browser cache and system OS resolver cache (ipconfig /flushdns).',
      category: 'SYSTEM',
    });
  };

  // Perform resolution via Runtime scheduled event sequence
  const startResolution = () => {
    setResolvedIp(null);
    globalSimulationRuntime.reset();

    const scenario: ScenarioDefinition = {
      id: 'dns-scenario-resolution',
      titleAr: 'حل أسماء النطاقات',
      titleEn: 'DNS Resolution',
      nodes,
      connections,
      scheduledEvents: [],
      challenge: dnsChallenge,
    };

    globalSimulationRuntime.loadScenario(scenario);

    // 1. Browser Cache Check
    globalSimulationRuntime.schedule({
      at: 0,
      type: 'BROWSER_CACHE_CHECK',
      source: 'browser',
      description: `Checking local browser memory cache for domain '${domain}'`,
    });

    if (browserCacheEnabled && browserCache[domain]) {
      setLookupType('BROWSER_CACHE_HIT');
      const hitIp = browserCache[domain].ip;

      globalSimulationRuntime.schedule({
        at: 100,
        type: 'CACHE_HIT',
        source: 'browser',
        description: `BROWSER CACHE HIT: ${domain} -> ${hitIp}`,
      });

      globalSimulationRuntime.schedule({
        at: 200,
        type: 'DNS_RESPONSE',
        source: 'browser',
        description: `Resolved ${domain} to ${hitIp} (0ms cache hit)`,
        payload: { ip: hitIp },
      });

      globalSimulationRuntime.start();
      return;
    }

    // 2. OS Cache Check
    globalSimulationRuntime.schedule({
      at: 100,
      type: 'OS_CACHE_CHECK',
      source: 'os_resolver',
      description: `Checking OS stub resolver cache for domain '${domain}'`,
    });

    if (osCacheEnabled && osCache[domain]) {
      setLookupType('OS_CACHE_HIT');
      const hitIp = osCache[domain].ip;

      globalSimulationRuntime.schedule({
        at: 200,
        type: 'CACHE_HIT',
        source: 'os_resolver',
        description: `OS CACHE HIT: ${domain} -> ${hitIp}`,
      });

      globalSimulationRuntime.schedule({
        at: 300,
        type: 'DNS_RESPONSE',
        source: 'os_resolver',
        description: `Resolved ${domain} to ${hitIp} (OS cache hit)`,
        payload: { ip: hitIp },
      });

      if (browserCacheEnabled) {
        setBrowserCache((prev) => ({ ...prev, [domain]: { ip: hitIp, ttl } }));
      }

      globalSimulationRuntime.start();
      return;
    }

    // 3. Cold Hierarchy Resolution
    setLookupType('COLD');
    const finalIp = '93.184.216.34';

    // Query OS (0 -> 400ms)
    globalSimulationRuntime.schedule({
      at: 200,
      type: 'RECURSIVE_QUERY',
      source: 'browser',
      target: 'os_resolver',
      description: `Browser forwarding query '${domain}' to OS stub resolver`,
    });
    globalSimulationRuntime.packets.createPacket({
      source: 'browser',
      destination: 'os_resolver',
      protocol: 'DNS',
      sourcePort: 53,
      destinationPort: 53,
      startVirtualTime: 200,
      durationMs: 400,
    });

    // Query Recursive Resolver (600 -> 1000ms)
    globalSimulationRuntime.schedule({
      at: 600,
      type: 'RECURSIVE_QUERY',
      source: 'os_resolver',
      target: 'recursive_dns',
      description: `OS Resolver sending recursive query to 8.8.8.8:53`,
    });
    globalSimulationRuntime.packets.createPacket({
      source: 'os_resolver',
      destination: 'recursive_dns',
      protocol: 'DNS',
      sourcePort: 53,
      destinationPort: 53,
      startVirtualTime: 600,
      durationMs: 400,
    });

    // Query Root Server (1000 -> 1400ms)
    globalSimulationRuntime.schedule({
      at: 1000,
      type: 'ROOT_QUERY',
      source: 'recursive_dns',
      target: 'root_dns',
      description: `Recursive resolver querying Root (.) for .com NS`,
    });
    globalSimulationRuntime.packets.createPacket({
      source: 'recursive_dns',
      destination: 'root_dns',
      protocol: 'DNS',
      sourcePort: 53,
      destinationPort: 53,
      startVirtualTime: 1000,
      durationMs: 400,
    });

    // Root Referral (1400 -> 1800ms)
    globalSimulationRuntime.schedule({
      at: 1400,
      type: 'ROOT_REFERRAL',
      source: 'root_dns',
      target: 'recursive_dns',
      description: `Root Server (.) referred to .com TLD (192.5.6.30)`,
    });
    globalSimulationRuntime.packets.createPacket({
      source: 'root_dns',
      destination: 'recursive_dns',
      protocol: 'DNS',
      sourcePort: 53,
      destinationPort: 53,
      startVirtualTime: 1400,
      durationMs: 400,
    });

    // Query TLD Server (1800 -> 2200ms)
    globalSimulationRuntime.schedule({
      at: 1800,
      type: 'TLD_QUERY',
      source: 'recursive_dns',
      target: 'tld_dns',
      description: `Recursive resolver querying .com TLD for example.com NS`,
    });
    globalSimulationRuntime.packets.createPacket({
      source: 'recursive_dns',
      destination: 'tld_dns',
      protocol: 'DNS',
      sourcePort: 53,
      destinationPort: 53,
      startVirtualTime: 1800,
      durationMs: 400,
    });

    // TLD Referral (2200 -> 2600ms)
    globalSimulationRuntime.schedule({
      at: 2200,
      type: 'TLD_REFERRAL',
      source: 'tld_dns',
      target: 'recursive_dns',
      description: `TLD Server referred to Authoritative NS (93.184.216.34)`,
    });
    globalSimulationRuntime.packets.createPacket({
      source: 'tld_dns',
      destination: 'recursive_dns',
      protocol: 'DNS',
      sourcePort: 53,
      destinationPort: 53,
      startVirtualTime: 2200,
      durationMs: 400,
    });

    // Query Authoritative Server (2600 -> 3000ms)
    globalSimulationRuntime.schedule({
      at: 2600,
      type: 'AUTHORITATIVE_QUERY',
      source: 'recursive_dns',
      target: 'authoritative_dns',
      description: `Querying Authoritative NS for 'example.com IN A'`,
    });
    globalSimulationRuntime.packets.createPacket({
      source: 'recursive_dns',
      destination: 'authoritative_dns',
      protocol: 'DNS',
      sourcePort: 53,
      destinationPort: 53,
      startVirtualTime: 2600,
      durationMs: 400,
    });

    // Authoritative Response (3000 -> 3400ms)
    globalSimulationRuntime.schedule({
      at: 3000,
      type: 'DNS_RESPONSE',
      source: 'authoritative_dns',
      target: 'recursive_dns',
      description: `Authoritative NS returned A Record: ${domain} -> ${finalIp}`,
      payload: { ip: finalIp },
    });
    globalSimulationRuntime.packets.createPacket({
      source: 'authoritative_dns',
      destination: 'recursive_dns',
      protocol: 'DNS',
      sourcePort: 53,
      destinationPort: 53,
      startVirtualTime: 3000,
      durationMs: 400,
    });

    // Cache Write
    globalSimulationRuntime.schedule({
      at: 3400,
      type: 'CACHE_WRITE',
      source: 'recursive_dns',
      description: `Writing A record ${domain} -> ${finalIp} into local caches (TTL: ${ttl}s)`,
    });

    if (browserCacheEnabled) {
      setBrowserCache((prev) => ({ ...prev, [domain]: { ip: finalIp, ttl } }));
    }
    if (osCacheEnabled) {
      setOsCache((prev) => ({ ...prev, [domain]: { ip: finalIp, ttl } }));
    }

    globalSimulationRuntime.start();
  };

  return (
    <Workspace
      title={t.dns.title}
      subtitle={t.dns.subtitle}
      challenge={dnsChallenge}
      onValidateChallenge={() => {
        const isSuccess = resolvedIp !== null;
        return {
          success: isSuccess,
          message: isSuccess
            ? t.dns.valSuccess
            : t.dns.valColdNeeded,
        };
      }}
      onRestart={handleClearCache}
      onStep={() => globalSimulationRuntime.step(150)}
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
              className="py-1.5 px-3.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
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
        onNodeClick={(node) => selectEntity('node', node.id, node)}
        onPacketClick={(pkt) => selectEntity('packet', pkt.id, pkt)}
      />
    </Workspace>
  );
};
