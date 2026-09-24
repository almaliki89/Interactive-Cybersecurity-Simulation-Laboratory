import React, { useState } from 'react';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { useSimulationStore } from '../../stores/simulationStore';
import { ArrowRight, Route, Send, Plus, Trash2, Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RouteEntry {
  id: string;
  destPrefix: string;
  nextHop: string;
  interfaceName: string;
  metric: number;
}

export const RoutingLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [destIp, setDestIp] = useState<string>('10.2.0.50');
  const [initialTtl, setInitialTtl] = useState<number>(64);
  const [routes, setRoutes] = useState<RouteEntry[]>([
    { id: 'r1', destPrefix: '10.2.0.0/24', nextHop: '172.16.12.2', interfaceName: 'eth1', metric: 10 },
    { id: 'r2', destPrefix: '10.0.0.0/8', nextHop: '172.16.13.3', interfaceName: 'eth2', metric: 20 },
    { id: 'r3', destPrefix: '0.0.0.0/0', nextHop: '192.168.1.1', interfaceName: 'wan0', metric: 100 },
  ]);

  const [lpmMatch, setLpmMatch] = useState<RouteEntry | null>(null);
  const [routingLog, setRoutingLog] = useState<string[]>([]);

  // Longest Prefix Match Logic
  const evalLpm = (ipStr: string) => {
    // Sort routes by prefix length descending
    const sorted = [...routes].sort((a, b) => {
      const pA = parseInt(a.destPrefix.split('/')[1] || '0', 10);
      const pB = parseInt(b.destPrefix.split('/')[1] || '0', 10);
      return pB - pA;
    });

    let matched: RouteEntry | null = null;
    for (const r of sorted) {
      if (r.destPrefix === '0.0.0.0/0') {
        if (!matched) matched = r;
        continue;
      }
      if (ipStr.startsWith(r.destPrefix.split('.')[0])) {
        matched = r;
        break;
      }
    }

    setLpmMatch(matched);
    return matched;
  };

  const handleSimulateRoute = () => {
    setRoutingLog([]);
    const match = evalLpm(destIp);

    globalSimulationRuntime.dispatch({
      type: 'PACKET_SENT',
      source: 'LAN_A_Host (10.1.0.10)',
      target: destIp,
      description: `Ingress Packet to ${destIp} with TTL=${initialTtl}`,
    });

    setRoutingLog((prev) => [
      ...prev,
      `[t=0ms] Ingress Packet: Dest=${destIp}, TTL=${initialTtl}`,
      `[t=20ms] Evaluating Router 1 Routing Table via Longest Prefix Match (LPM)...`,
    ]);

    if (match) {
      setTimeout(() => {
        setRoutingLog((prev) => [
          ...prev,
          `[t=100ms] LPM Match Found: Route "${match.destPrefix}" via Next-Hop ${match.nextHop} on ${match.interfaceName}`,
          `[t=200ms] Decrementing TTL: ${initialTtl} -> ${initialTtl - 1}`,
        ]);

        if (initialTtl - 1 <= 0) {
          setRoutingLog((prev) => [
            ...prev,
            `[ERROR] TTL Exceeded in Transit! Router 1 dropping packet and returning ICMP Type 11 (Time Exceeded).`,
          ]);
          globalSimulationRuntime.dispatch({
            type: 'PACKET_DROPPED',
            source: 'Router 1',
            description: `ICMP TTL Exceeded for ${destIp}`,
          });
        } else {
          setRoutingLog((prev) => [
            ...prev,
            `[t=300ms] Forwarded to Next-Hop ${match.nextHop}. Destination ${destIp} REACHABLE!`,
          ]);
          globalSimulationRuntime.dispatch({
            type: 'PACKET_DELIVERED',
            source: 'Router 1',
            target: destIp,
            description: `Packet successfully routed to ${destIp} via ${match.nextHop}`,
          });
        }
      }, 500);
    } else {
      setRoutingLog((prev) => [...prev, `[ERROR] No matching route found! Router dropping packet (ICMP Destination Unreachable).`]);
    }
  };

  const handleAddRoute = () => {
    const newRoute: RouteEntry = {
      id: `r-${routes.length + 1}`,
      destPrefix: '10.3.0.0/24',
      nextHop: '172.16.14.4',
      interfaceName: 'eth3',
      metric: 15,
    };
    setRoutes([...routes, newRoute]);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Route className="w-4 h-4" />
          <span>{isAr ? 'مختبر توجيه الحزم والجداول' : 'IP Routing Tables & Longest Prefix Match (LPM)'}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAr ? 'محاكي توجيه البيانات وقرارات الموجه (Routers)' : 'Interactive Router Table & LPM Forwarding Engine'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAr
            ? 'اختبر خوارزمية التطابق الأطول للبادئة (Longest Prefix Match) في جداول التوجيه وانخفاض زمني TTL.'
            : 'Inspect how routers select next-hop interfaces using LPM algorithms, metric priorities, and ICMP TTL decrements.'}
        </p>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isAr ? 'العنوان الهدف (Destination IP)' : 'Target Destination IP'}
          </label>
          <input
            type="text"
            value={destIp}
            onChange={(e) => setDestIp(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isAr ? 'قيمة العمر الرأسي (TTL)' : 'Initial Packet TTL'}
          </label>
          <input
            type="number"
            min="1"
            max="255"
            value={initialTtl}
            onChange={(e) => setInitialTtl(Number(e.target.value) || 64)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-mono text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-end md:col-span-2">
          <button
            onClick={handleSimulateRoute}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-900/30 transition"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'اختبار التوجيه (Route Lookup)' : 'Dispatch Test Packet & Lookup Route'}</span>
          </button>
        </div>
      </div>

      {/* Routing Table Inspection & Management */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Route className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'جدول توجيه الموجه (Router 1 Forwarding Table)' : 'Router 1 Routing Table (FIB)'}</span>
          </h3>
          <button
            onClick={handleAddRoute}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 rounded-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة مسار' : 'Add Route Entry'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="p-2.5">{isAr ? 'البادئة الموجهة (Destination Prefix)' : 'Destination Prefix'}</th>
                <th className="p-2.5">{isAr ? 'القفزة التالية (Next Hop)' : 'Next Hop IP'}</th>
                <th className="p-2.5">{isAr ? 'الواجهة (Interface)' : 'Out Interface'}</th>
                <th className="p-2.5">{isAr ? 'المقياس (Metric)' : 'Metric'}</th>
                <th className="p-2.5">{isAr ? 'حالة التطابق LPM' : 'LPM Match'}</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const isMatched = lpmMatch?.id === r.id;
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-800/50 transition ${
                      isMatched ? 'bg-cyan-950/80 border-cyan-500 font-bold' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-2.5 text-cyan-300">{r.destPrefix}</td>
                    <td className="p-2.5 text-slate-200">{r.nextHop}</td>
                    <td className="p-2.5 text-indigo-300">{r.interfaceName}</td>
                    <td className="p-2.5 text-amber-300">{r.metric}</td>
                    <td className="p-2.5">
                      {isMatched ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>BEST LPM MATCH</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Log */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {isAr ? 'سجل اتخاذ قرار التوجيه' : 'Router Execution & Hop Tracing Log'}
        </span>
        <div className="bg-slate-900 p-3 rounded border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1 min-h-[100px]">
          {routingLog.length === 0 ? (
            <span className="text-slate-600 italic">{isAr ? 'في انتظار الإرسال...' : 'Awaiting route evaluation test...'}</span>
          ) : (
            routingLog.map((log, idx) => (
              <div key={idx} className={log.includes('ERROR') ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
