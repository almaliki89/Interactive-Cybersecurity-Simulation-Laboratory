import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { SYNTHETIC_NETWORK_CONNECTIONS, extractConnectionTimeline, identifyDeniedConnectionBursts, NetworkForensicConnection } from './logic/network';
import { Activity, ShieldAlert, Wifi } from 'lucide-react';

export const NetworkEvidenceLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [connections] = useState<NetworkForensicConnection[]>(extractConnectionTimeline(SYNTHETIC_NETWORK_CONNECTIONS));
  const [filterDeniedOnly, setFilterDeniedOnly] = useState<boolean>(false);

  const displayedConns = filterDeniedOnly ? identifyDeniedConnectionBursts(connections) : connections;

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>{isAr ? 'معمل الأدلة الشبكية وحركات المرور (Network Evidence)' : 'Network Forensics & Netflow Evidence Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'تحليل تدفقات Netflow، حظر جدار الحماية، ومسح المنافذ Port Scan' : 'Netflow Connection Extraction & Firewall Port Scan Analysis'}
          </h1>
        </div>

        <button
          onClick={() => setFilterDeniedOnly(!filterDeniedOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${
            filterDeniedOnly
              ? 'bg-rose-950 border-rose-800 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{filterDeniedOnly ? (isAr ? 'عرض كافة الاتصالات' : 'Show All Flows') : (isAr ? 'تصفية المحظورة فقط' : 'Show Denied Probes Only')}</span>
        </button>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          <span>{isAr ? 'سجل الاتصالات والمسح الشبكي المستخرج' : 'Extracted Netflow & Firewall ACL Log'}</span>
        </h2>

        <div className="flex flex-col gap-2 font-mono text-xs">
          {displayedConns.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-xl border flex items-center justify-between ${
                c.action === 'DENY' || c.action === 'DROP'
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-16 text-slate-500 font-bold">T+{c.virtualTime}ms</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold text-[10px]">{c.protocol}</span>
                <span className="font-bold text-white">{c.sourceIp} &rarr; {c.destinationIp}:{c.destinationPort}</span>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className={`px-2 py-0.5 rounded font-bold ${
                  c.action === 'DENY' ? 'bg-rose-900 text-rose-200' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {c.action}
                </span>
                <span className="text-slate-500">{c.host}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
