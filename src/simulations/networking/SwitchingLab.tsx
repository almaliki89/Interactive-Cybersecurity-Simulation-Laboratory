import React, { useState } from 'react';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { useSimulationStore } from '../../stores/simulationStore';
import { Network, Cpu, Trash2, Send, CheckCircle2, ArrowRight } from 'lucide-react';

interface CamEntry {
  port: number;
  mac: string;
  vlan: number;
  type: 'dynamic' | 'static';
}

export const SwitchingLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [camTable, setCamTable] = useState<CamEntry[]>([
    { port: 1, mac: '00:11:22:33:44:A1', vlan: 1, type: 'dynamic' },
    { port: 2, mac: '00:11:22:33:44:B2', vlan: 1, type: 'dynamic' },
  ]);

  const [srcHost, setSrcHost] = useState<string>('hostA');
  const [dstHost, setDstHost] = useState<string>('hostC');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const hosts = [
    { id: 'hostA', name: 'Host A', port: 1, mac: '00:11:22:33:44:A1', ip: '10.0.0.10' },
    { id: 'hostB', name: 'Host B', port: 2, mac: '00:11:22:33:44:B2', ip: '10.0.0.20' },
    { id: 'hostC', name: 'Host C', port: 3, mac: '00:11:22:33:44:C3', ip: '10.0.0.30' },
    { id: 'hostD', name: 'Host D', port: 4, mac: '00:11:22:33:44:D4', ip: '10.0.0.40' },
  ];

  const handleSendFrame = () => {
    const srcNode = hosts.find((h) => h.id === srcHost)!;
    const dstNode = hosts.find((h) => h.id === dstHost)!;

    // 1. Learn source MAC on ingress port
    setCamTable((prev) => {
      const filtered = prev.filter((entry) => entry.port !== srcNode.port);
      return [...filtered, { port: srcNode.port, mac: srcNode.mac, vlan: 1, type: 'dynamic' }];
    });

    // 2. Lookup destination MAC in CAM Table
    const dstInCam = camTable.find((e) => e.mac === dstNode.mac);

    if (dstInCam) {
      setLastAction(`UNICAST FORWARDING: Target MAC ${dstNode.mac} found on Port ${dstInCam.port}. Frame forwarded directly!`);
      globalSimulationRuntime.dispatch({
        type: 'PACKET_DELIVERED',
        source: srcNode.name,
        target: dstNode.name,
        description: `Unicast L2 Frame forwarded on Port ${dstInCam.port}`,
      });
    } else {
      setLastAction(`UNKNOWN UNICAST FLOODING: Target MAC ${dstNode.mac} missing from CAM Table. Frame flooded to all ports except Port ${srcNode.port}!`);
      globalSimulationRuntime.dispatch({
        type: 'PACKET_SENT',
        source: srcNode.name,
        target: 'all_ports',
        description: `Unknown Unicast Flooded to all ports except Port ${srcNode.port}`,
      });
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Network className="w-4 h-4" />
          <span>{isAr ? 'مبدلات الطبقة الثانية (Layer 2 Switching)' : 'Layer 2 Switching & CAM Table Learning'}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAr ? 'محاكي جدول العناوين الفيزيائية (CAM / MAC Table)' : 'Interactive Switch CAM Table & Flooding Simulator'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAr
            ? 'شاهد كيف يتعلم السويتش عناوين MAC من المنافذ الواردة، ويُسير الحزم الموجهة أو يُغرق المنافذ عند غياب العنوان.'
            : 'Observe how L2 switches dynamically populate CAM tables upon frame ingress and execute unicast or flooding decisions.'}
        </p>
      </div>

      {/* Frame Dispatch Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'المصدر (Sender)' : 'Source Host'}</label>
          <select
            value={srcHost}
            onChange={(e) => setSrcHost(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-sm focus:outline-none"
          >
            {hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} (Port {h.port} - {h.mac})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'الهدف (Destination)' : 'Destination Host'}</label>
          <select
            value={dstHost}
            onChange={(e) => setDstHost(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-mono text-sm focus:outline-none"
          >
            {hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} (Port {h.port} - {h.mac})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSendFrame}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-900/30 transition"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'إرسال إطار Ethernet' : 'Transmit L2 Ethernet Frame'}</span>
          </button>
        </div>
      </div>

      {/* Switch Topology Visualizer */}
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl relative">
        <div className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider">
          {isAr ? 'البنية التحتية للسويتش والمنافذ' : 'Switch Port Topology'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {hosts.map((h) => {
            const hasCamEntry = camTable.some((e) => e.mac === h.mac);
            return (
              <div
                key={h.id}
                className={`p-4 rounded-xl border text-center transition-all ${
                  hasCamEntry ? 'bg-cyan-950/60 border-cyan-500' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <Cpu className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                <div className="font-bold text-sm text-slate-100">{h.name}</div>
                <div className="text-xs font-mono text-indigo-300 mt-1">Port {h.port}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{h.mac}</div>
              </div>
            );
          })}
        </div>

        {lastAction && (
          <div className="mt-4 p-3 bg-cyan-950/80 border border-cyan-700/80 rounded-lg text-xs font-mono text-cyan-200">
            {lastAction}
          </div>
        )}
      </div>

      {/* Live CAM Table */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'جدول العناوين CAM Table الحقيقي' : 'Switch Live CAM / MAC Address Table'}</span>
          </h3>
          <button
            onClick={() => setCamTable([])}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-semibold text-rose-300 rounded-md transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'تفريغ الجدول' : 'Clear CAM Table'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="p-2.5">{isAr ? 'المواجهة / المنفذ (Port)' : 'Switch Port'}</th>
                <th className="p-2.5">{isAr ? 'العنوان الفيزيائي (MAC Address)' : 'MAC Address'}</th>
                <th className="p-2.5">VLAN ID</th>
                <th className="p-2.5">{isAr ? 'النوع' : 'Entry Type'}</th>
              </tr>
            </thead>
            <tbody>
              {camTable.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-600 italic">
                    {isAr ? 'الجدول فارغ حالياً. أرسل إطار بيانات لتعلم العناوين.' : 'CAM table is empty. Transmit a frame to populate entries.'}
                  </td>
                </tr>
              ) : (
                camTable.map((entry, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-cyan-300">Port {entry.port}</td>
                    <td className="p-2.5 text-emerald-300">{entry.mac}</td>
                    <td className="p-2.5 text-indigo-300">VLAN {entry.vlan}</td>
                    <td className="p-2.5 capitalize text-slate-400">{entry.type}</td>
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
