import React, { useState } from 'react';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { useSimulationStore } from '../../stores/simulationStore';
import { Network, Globe, Cpu, ArrowRight, Trash2, Send } from 'lucide-react';

interface NatEntry {
  id: string;
  privateIp: string;
  privatePort: number;
  publicIp: string;
  publicPort: number;
  destIp: string;
  destPort: number;
  protocol: 'TCP' | 'UDP';
}

export const NatSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [natTable, setNatTable] = useState<NatEntry[]>([
    {
      id: 'n1',
      privateIp: '10.0.0.10',
      privatePort: 49152,
      publicIp: '203.0.113.1',
      publicPort: 50001,
      destIp: '93.184.216.34',
      destPort: 80,
      protocol: 'TCP',
    },
  ]);

  const [selectedHostIp, setSelectedHostIp] = useState<string>('10.0.0.11');

  const handleCreateConnection = () => {
    const newPort = 50000 + natTable.length + 1;
    const newSrcPort = 49150 + Math.floor(Math.random() * 100);

    const entry: NatEntry = {
      id: `n-${Date.now()}`,
      privateIp: selectedHostIp,
      privatePort: newSrcPort,
      publicIp: '203.0.113.1',
      publicPort: newPort,
      destIp: '93.184.216.34',
      destPort: 443,
      protocol: 'TCP',
    };

    setNatTable((prev) => [...prev, entry]);

    globalSimulationRuntime.dispatch({
      type: 'PACKET_SENT',
      source: `${selectedHostIp}:${newSrcPort}`,
      target: `203.0.113.1:${newPort}`,
      description: `NAT Translation created: ${selectedHostIp}:${newSrcPort} -> 203.0.113.1:${newPort}`,
    });
  };

  const handleClearNat = () => {
    setNatTable([]);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Globe className="w-4 h-4" />
          <span>{isAr ? 'ترجمة عناوين الشبكة (NAT / PAT)' : 'Network Address Translation (NAT / Port Overload)'}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAr ? 'محاكي جدول الجلسات وترجمة العناوين (NAT Table Simulator)' : 'Interactive NAT Gateway & Port Overload (PAT) Engine'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAr
            ? 'شاهد كيف يترجم موجه NAT العناوين والمنافذ الخاصة (Private IP) إلى عنوان عام (Public IP) لحماية البنية الداخلية.'
            : 'Observe stateful PAT session mapping. Translate private intranet sockets into external egress public sockets.'}
        </p>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'اختر الجهاز الداخلي' : 'Internal Host'}</label>
          <select
            value={selectedHostIp}
            onChange={(e) => setSelectedHostIp(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-sm focus:outline-none"
          >
            <option value="10.0.0.10">Host 1 (10.0.0.10)</option>
            <option value="10.0.0.11">Host 2 (10.0.0.11)</option>
            <option value="10.0.0.12">Host 3 (10.0.0.12)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleCreateConnection}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-900/30 transition"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'إنشاء اتصال خارجي جديد' : 'Initiate WAN Outbound Session'}</span>
          </button>
        </div>

        <div className="flex items-end justify-end">
          <button
            onClick={handleClearNat}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-semibold text-rose-300 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isAr ? 'مسح جدول NAT' : 'Clear NAT Table'}</span>
          </button>
        </div>
      </div>

      {/* NAT Translation Table */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'جدول جلسات NAT الحية (NAT State Table)' : 'Stateful NAT Session Mapping Table'}</span>
          </h3>
          <span className="text-xs font-mono text-amber-300">{natTable.length} Active Sessions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="p-2.5">{isAr ? 'البروتوكول' : 'Protocol'}</th>
                <th className="p-2.5">{isAr ? 'المصدر الداخلي (Inside Local)' : 'Inside Local (Private)'}</th>
                <th className="p-2.5">{isAr ? 'المصدر المترجم (Inside Global)' : 'Inside Global (Public PAT)'}</th>
                <th className="p-2.5">{isAr ? 'الهدف الخارجي (Outside Global)' : 'Outside Global (WAN Target)'}</th>
              </tr>
            </thead>
            <tbody>
              {natTable.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-600 italic">
                    {isAr ? 'لا توجد جلسات نَشطة حالياً.' : 'No active NAT translation sessions.'}
                  </td>
                </tr>
              ) : (
                natTable.map((e) => (
                  <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-indigo-300">{e.protocol}</td>
                    <td className="p-2.5 text-cyan-300">{e.privateIp}:{e.privatePort}</td>
                    <td className="p-2.5 text-emerald-300">{e.publicIp}:{e.publicPort}</td>
                    <td className="p-2.5 text-amber-300">{e.destIp}:{e.destPort}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
