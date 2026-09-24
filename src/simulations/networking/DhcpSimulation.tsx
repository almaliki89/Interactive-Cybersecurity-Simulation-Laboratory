import React, { useState } from 'react';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { useSimulationStore } from '../../stores/simulationStore';
import { Server, Cpu, Send, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DhcpSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [doraStep, setDoraStep] = useState<number>(0);
  const [assignedIp, setAssignedIp] = useState<string>('0.0.0.0');
  const [gatewayIp, setGatewayIp] = useState<string>('192.168.1.1');
  const [dnsIp, setDnsIp] = useState<string>('192.168.1.2');
  const [poolSize, setPoolSize] = useState<number>(10);
  const [activeLeases, setActiveLeases] = useState<number>(2);

  const handleStartDora = () => {
    if (activeLeases >= poolSize) {
      globalSimulationRuntime.dispatch({
        type: 'PACKET_BLOCKED',
        source: 'DHCP_Server',
        description: 'DHCP Pool Exhausted! Cannot issue lease.',
      });
      alert(isAr ? 'نفذت العناوين في نطاق DHCP!' : 'DHCP Pool Exhausted!');
      return;
    }

    setDoraStep(1); // Discover
    setAssignedIp('0.0.0.0');

    globalSimulationRuntime.dispatch({
      type: 'PACKET_SENT',
      source: 'Client_PC',
      target: '255.255.255.255:67',
      description: 'DHCP Discover Broadcast issued by Client PC',
    });

    setTimeout(() => {
      setDoraStep(2); // Offer
      globalSimulationRuntime.dispatch({
        type: 'PACKET_RECEIVED',
        source: 'DHCP_Server',
        target: 'Client_PC',
        description: `DHCP Offer: Offering IP 192.168.1.${10 + activeLeases}, GW ${gatewayIp}`,
      });
    }, 1200);

    setTimeout(() => {
      setDoraStep(3); // Request
      globalSimulationRuntime.dispatch({
        type: 'PACKET_SENT',
        source: 'Client_PC',
        target: 'DHCP_Server',
        description: `DHCP Request: Accepting offered IP 192.168.1.${10 + activeLeases}`,
      });
    }, 2400);

    setTimeout(() => {
      setDoraStep(4); // ACK
      const newIp = `192.168.1.${10 + activeLeases}`;
      setAssignedIp(newIp);
      setActiveLeases((prev) => prev + 1);

      globalSimulationRuntime.dispatch({
        type: 'PACKET_DELIVERED',
        source: 'DHCP_Server',
        target: 'Client_PC',
        description: `DHCP ACK: Lease confirmed for ${newIp}`,
      });
    }, 3600);
  };

  const handleReset = () => {
    setDoraStep(0);
    setAssignedIp('0.0.0.0');
    globalSimulationRuntime.reset();
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Server className="w-4 h-4" />
          <span>{isAr ? 'بروتوكول التهيأة الديناميكية للمضيفين (DHCP)' : 'Dynamic Host Configuration Protocol (DHCP) DORA'}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAr ? 'محاكي دورة DORA وتأجير العناوين الديناميكية' : 'Interactive DHCP DORA Protocol & Lease Engine'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAr
            ? 'تتبع مراحل DORA الأربع (Discover -> Offer -> Request -> ACK) للحصول على عنوان IP والمنفذ الافتراضي وخادم DNS.'
            : 'Step through Discover, Offer, Request, and ACK. Manage IP address pool capacity, gateway assignments, and lease exhaustion.'}
        </p>
      </div>

      {/* DHCP Server Settings & Pool Management */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'المنفذ الافتراضي (Gateway)' : 'Default Gateway'}</label>
          <input
            type="text"
            value={gatewayIp}
            onChange={(e) => setGatewayIp(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-sm focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'خادم DNS' : 'Primary DNS Server'}</label>
          <input
            type="text"
            value={dnsIp}
            onChange={(e) => setDnsIp(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-mono text-sm focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'حجم نطاق العناوين (Pool Capacity)' : 'IP Pool Capacity'}</label>
          <input
            type="number"
            min="1"
            max="100"
            value={poolSize}
            onChange={(e) => setPoolSize(Number(e.target.value) || 10)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-indigo-300 font-mono text-sm focus:outline-none"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleStartDora}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg shadow transition"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'بدء طلب DORA' : 'Trigger DORA'}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DORA Stage Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { stage: 1, title: '1. Discover', descAr: 'بث طلب البحث عن خادم DHCP', descEn: 'Client Broadcast Discover' },
          { stage: 2, title: '2. Offer', descAr: 'خادم DHCP يعرض عنوان IP', descEn: 'Server Unicast Offer' },
          { stage: 3, title: '3. Request', descAr: 'العميل يطلب اعتماد العنوان', descEn: 'Client Requests Lease' },
          { stage: 4, title: '4. ACK', descAr: 'تأكيد العقد وتأجير العنوان', descEn: 'Server ACKs Lease' },
        ].map((s) => (
          <div
            key={s.stage}
            className={`p-4 rounded-xl border text-center transition-all ${
              doraStep === s.stage
                ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold shadow-lg shadow-cyan-950/50 scale-105'
                : doraStep > s.stage
                ? 'bg-slate-900 border-slate-700 text-emerald-400'
                : 'bg-slate-950 border-slate-900 text-slate-600'
            }`}
          >
            <div className="text-sm font-mono font-bold mb-1">{s.title}</div>
            <div className="text-xs text-slate-400">{isAr ? s.descAr : s.descEn}</div>
          </div>
        ))}
      </div>

      {/* Client Assigned State Box */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-semibold block mb-1">{isAr ? 'عنوان IP المعين للعميل' : 'Client Currently Assigned IP'}</span>
          <span className="text-2xl font-bold font-mono text-cyan-300">{assignedIp}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block mb-1">{isAr ? 'نسبة استهلاك النطاق' : 'DHCP Pool Lease Usage'}</span>
          <span className="text-sm font-bold font-mono text-amber-300">
            {activeLeases} / {poolSize} {isAr ? 'مستأجر' : 'Active Leases'}
          </span>
        </div>
      </div>
    </div>
  );
};
