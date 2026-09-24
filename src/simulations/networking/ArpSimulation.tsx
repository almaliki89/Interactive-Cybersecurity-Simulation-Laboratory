import React, { useState, useEffect } from 'react';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { useSimulationStore } from '../../stores/simulationStore';
import { Play, Pause, RotateCcw, Send, Trash2, CheckCircle2, ShieldAlert, Cpu, Network, ArrowRight } from 'lucide-react';
import { checkArpCache, updateArpCache, ArpEntry } from './logic/arp';

export const ArpSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [targetIp, setTargetIp] = useState<string>('192.168.1.20');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [arpCacheHostA, setArpCacheHostA] = useState<ArpEntry[]>([]);
  const [animatingPacket, setAnimatingPacket] = useState<string | null>(null);

  const nodes = [
    { id: 'hostA', name: 'Host A', ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:10', role: 'sender' },
    { id: 'switch', name: 'L2 Switch', ip: '-', mac: '-', role: 'switch' },
    { id: 'hostB', name: 'Host B', ip: '192.168.1.20', mac: '00:1A:2B:3C:4D:20', role: 'receiver' },
    { id: 'hostC', name: 'Host C', ip: '192.168.1.30', mac: '00:1A:2B:3C:4D:30', role: 'receiver' },
    { id: 'router', name: 'Gateway Router', ip: '192.168.1.1', mac: '00:1A:2B:3C:4D:01', role: 'gateway' },
  ];

  // Reactively derive UI step & ARP cache from Runtime event history on every tick/step
  useEffect(() => {
    const unsubscribe = globalSimulationRuntime.subscribe((state) => {
      const history = state.events;
      let step = 0;
      let packetState: string | null = null;
      const newCache: ArpEntry[] = [];

      history.forEach((evt) => {
        if (evt.type === 'ARP_CACHE_CHECK') {
          step = 1;
          packetState = 'Checking Local ARP Cache...';
        } else if (evt.type === 'ARP_CACHE_HIT') {
          step = 5;
          packetState = `Cache Hit! Target MAC: ${evt.payload?.mac}`;
        } else if (evt.type === 'ARP_CACHE_MISS') {
          step = 1;
          packetState = `Cache Miss for ${evt.description}`;
        } else if (evt.type === 'ARP_REQUEST') {
          step = 2;
          packetState = 'ARP Request Broadcast [ff:ff:ff:ff:ff:ff]';
        } else if (evt.type === 'SWITCH_FRAME_FLOODED') {
          step = 3;
          packetState = 'Switch Flooding Frame to All Ports';
        } else if (evt.type === 'ARP_REPLY') {
          step = 4;
          const payload = evt.payload;
          if (payload) {
            packetState = `ARP Reply Unicast [${payload.mac} -> Host A]`;
            if (!newCache.some((e) => e.ip === payload.ip)) {
              newCache.push({ ip: payload.ip, mac: payload.mac, type: 'dynamic', ttl: 300 });
            }
          }
        } else if (evt.type === 'PACKET_DELIVERED') {
          step = 5;
          packetState = 'IP Frame Delivered over Ethernet';
        }
      });

      setActiveStep(step);
      setAnimatingPacket(packetState);
      if (newCache.length > 0) {
        setArpCacheHostA(newCache);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleReset = () => {
    globalSimulationRuntime.reset();
    setArpCacheHostA([]);
    setActiveStep(0);
    setAnimatingPacket(null);
  };

  const handleStartArpResolution = () => {
    handleReset();

    const targetNode = nodes.find((n) => n.ip === targetIp);
    const targetMac = targetNode ? targetNode.mac : '00:1A:2B:3C:4D:99';

    // Check if target IP is already in Host A ARP cache
    const existing = arpCacheHostA.find((e) => e.ip === targetIp);

    if (existing) {
      globalSimulationRuntime.schedule({ at: 0, type: 'ARP_CACHE_CHECK' });
      globalSimulationRuntime.schedule({
        at: 100,
        type: 'ARP_CACHE_HIT',
        payload: { ip: targetIp, mac: existing.mac },
        description: `Direct ICMP Echo Request to ${targetIp} using cached MAC ${existing.mac}`,
      });
      globalSimulationRuntime.schedule({
        at: 200,
        type: 'PACKET_DELIVERED',
        source: 'hostA',
        target: targetIp,
        description: `Direct Unicast Frame delivered to ${targetIp}`,
      });
    } else {
      globalSimulationRuntime.schedule({ at: 0, type: 'ARP_CACHE_CHECK' });
      globalSimulationRuntime.schedule({
        at: 100,
        type: 'ARP_CACHE_MISS',
        source: '192.168.1.10',
        description: targetIp,
      });
      globalSimulationRuntime.schedule({
        at: 300,
        type: 'ARP_REQUEST',
        source: 'hostA',
        target: 'switch',
        description: `Broadcast ARP Request: Who has ${targetIp}? Tell 192.168.1.10`,
      });
      globalSimulationRuntime.schedule({
        at: 600,
        type: 'SWITCH_FRAME_FLOODED',
        source: 'switch',
        target: 'all_ports',
        description: 'Switch floods broadcast ARP Request frame to all active ports',
      });
      globalSimulationRuntime.schedule({
        at: 900,
        type: 'ARP_REPLY',
        source: targetIp,
        target: 'hostA',
        payload: { ip: targetIp, mac: targetMac },
        description: `ARP Reply: ${targetIp} is at MAC ${targetMac}`,
      });
      globalSimulationRuntime.schedule({
        at: 1200,
        type: 'PACKET_DELIVERED',
        source: 'hostA',
        target: targetIp,
        description: `Frame successfully transmitted to ${targetIp}`,
      });
    }

    // Auto start clock progression
    globalSimulationRuntime.start();
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
            <Network className="w-4 h-4" />
            <span>{isAr ? 'بروتوكول تحويل العناوين (ARP)' : 'Address Resolution Protocol (ARP)'}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isAr ? 'محاكاة بروتوكول ربط العناوين ARP (Runtime Scheduled)' : 'Interactive ARP Resolution & Switch Flooding Lab'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isAr
              ? 'تتبع كيف يتعرف الحاسوب على العنوان الفيزيائي (MAC) المقابل لعنوان (IP) عبر البث العام وجداول التخزين المؤقت.'
              : 'Visualize IP-to-MAC resolution: cache checks, L2 Ethernet broadcasts, switch flooding, and unicast ARP replies.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartArpResolution}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-900/30 transition"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'إرسال طلب ARP' : 'Trigger ARP Resolution'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Control Panel & Target Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isAr ? 'اختر العنوان الهدف' : 'Select Target Destination IP'}
          </label>
          <select
            value={targetIp}
            onChange={(e) => setTargetIp(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="192.168.1.20">Host B (192.168.1.20)</option>
            <option value="192.168.1.30">Host C (192.168.1.30)</option>
            <option value="192.168.1.1">Gateway Router (192.168.1.1)</option>
          </select>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-semibold mb-1">
            {isAr ? 'حالة التذاكر والرزمة الحالية' : 'Current Animation Frame State'}
          </span>
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{animatingPacket || (isAr ? 'في انتظار الإرسال...' : 'Idle / Ready')}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">{isAr ? 'ذاكرة ARP المؤقتة (Host A)' : 'Host A ARP Cache'}</span>
            <span className="text-lg font-bold text-slate-200">{arpCacheHostA.length} {isAr ? 'إدخالات' : 'Entries'}</span>
          </div>
          <button
            onClick={() => setArpCacheHostA([])}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/50 hover:bg-rose-900/50 border border-rose-800/50 px-2.5 py-1.5 rounded-md transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسح الذاكرة' : 'Flush Cache'}</span>
          </button>
        </div>
      </div>

      {/* Visual Network Topology */}
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl relative overflow-hidden min-h-[320px] flex flex-col justify-between">
        <div className="absolute top-3 left-3 text-xs text-slate-500 font-mono">
          LAN Segment: 192.168.1.0/24 | Subnet Switch Topology
        </div>

        {/* Central Switch & Connected Hosts */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mt-6">
          {nodes.map((node) => {
            const isTarget = node.ip === targetIp;
            const isSender = node.id === 'hostA';
            const isSwitch = node.id === 'switch';

            return (
              <div
                key={node.id}
                className={`p-4 rounded-xl border text-center transition-all ${
                  isSwitch
                    ? 'bg-indigo-950/60 border-indigo-700/80 shadow-lg shadow-indigo-950/50 col-span-1'
                    : isSender
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-lg shadow-cyan-950/50'
                    : isTarget
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-950 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex justify-center mb-2">
                  {isSwitch ? (
                    <Network className="w-8 h-8 text-indigo-400 animate-pulse" />
                  ) : (
                    <Cpu className={`w-7 h-7 ${isSender ? 'text-cyan-400' : isTarget ? 'text-emerald-400' : 'text-slate-400'}`} />
                  )}
                </div>
                <div className="font-bold text-sm text-slate-100">{node.name}</div>
                <div className="text-xs font-mono text-cyan-300 mt-1">{node.ip}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{node.mac}</div>
              </div>
            );
          })}
        </div>

        {/* Step Flow Tracker */}
        <div className="mt-8 bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            {isAr ? 'مراحل تنفيذ بروتوكول ARP' : 'ARP Protocol Execution Steps'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            {[
              { step: 1, labelAr: '1. فحص الكاش المحلي', labelEn: '1. Local Cache Check' },
              { step: 2, labelAr: '2. بث طلب ARP Request', labelEn: '2. Broadcast ARP Request' },
              { step: 3, labelAr: '3. إغراق السويتش (Flooding)', labelEn: '3. Switch Flooding' },
              { step: 4, labelAr: '4. رد أحادي ARP Reply', labelEn: '4. Unicast ARP Reply' },
              { step: 5, labelAr: '5. إرسال إطار البيانات', labelEn: '5. Unicast Frame Sent' },
            ].map((s) => (
              <div
                key={s.step}
                className={`p-2 rounded border text-center transition-all ${
                  activeStep === s.step
                    ? 'bg-cyan-900/50 border-cyan-400 text-cyan-200 font-bold shadow'
                    : activeStep > s.step
                    ? 'bg-slate-900 border-slate-700 text-emerald-400'
                    : 'bg-slate-950 border-slate-900 text-slate-600'
                }`}
              >
                {isAr ? s.labelAr : s.labelEn}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Host A ARP Cache Table Inspection */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>{isAr ? 'جدول ARP الخاص بـ Host A (ARP Table Inspect)' : 'Host A Live ARP Table'}</span>
        </h3>

        {arpCacheHostA.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded border border-slate-800/60">
            {isAr ? 'جدول ARP فارغ حالياً. اضغط "إرسال طلب ARP" للتعرف على العناوين.' : 'ARP Cache is currently empty. Trigger ARP resolution above to populate entries.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="p-2">{isAr ? 'عنوان IP' : 'Internet Address (IP)'}</th>
                  <th className="p-2">{isAr ? 'العنوان الفيزيائي MAC' : 'Physical Address (MAC)'}</th>
                  <th className="p-2">{isAr ? 'النوع' : 'Type'}</th>
                  <th className="p-2">{isAr ? 'مدة الصلاحية TTL' : 'TTL (s)'}</th>
                </tr>
              </thead>
              <tbody>
                {arpCacheHostA.map((entry, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-2 text-cyan-300 font-bold">{entry.ip}</td>
                    <td className="p-2 text-emerald-300">{entry.mac}</td>
                    <td className="p-2 capitalize text-slate-400">{entry.type}</td>
                    <td className="p-2 text-amber-300">{entry.ttl}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
