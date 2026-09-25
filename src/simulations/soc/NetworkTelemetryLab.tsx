import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent } from './logic/enrichment';
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Activity,
  Radio,
  Server,
  Key,
  Database,
  Lock,
} from 'lucide-react';

interface NetworkTelemetryLabProps {
  onBackToMap?: () => void;
  onNavigateToIdentity?: () => void;
}

export const NetworkTelemetryLab: React.FC<NetworkTelemetryLabProps> = ({
  onBackToMap,
  onNavigateToIdentity,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const runtimeEvents = useSimulationStore((s) => s.events);

  const netEvents = runtimeEvents
    .map((rawEvt) => {
      const norm = normalizeRuntimeEvent({
        id: rawEvt.id,
        type: rawEvt.type,
        source: rawEvt.source,
        target: rawEvt.target,
        category: rawEvt.category,
        severity: rawEvt.severity,
        virtualTime: rawEvt.virtualTime,
        description: rawEvt.description,
        payload: (rawEvt.payload as Record<string, unknown>) || {},
      });
      return enrichTelemetryEvent(norm);
    })
    .filter((e) => e.sourceWorld === 'NETWORK' || e.category === 'NETWORK_CONNECTION');

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const activeEvent = netEvents.find((e) => e.id === selectedEventId) || netEvents[0] || null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <BackArrow className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span>{isAr ? 'مختبر سجلات الشبكة وحزم الجدار الناري (Network Telemetry)' : 'Network & Perimeter Telemetry Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص حزم الاتصال عبر جدار الحماية ومسح المنافذ ورصد الاتصالات المشبوهة'
                : 'Firewall ACL Telemetry: Source/Destination IP pairs, Port Scans, and Network Connection Anomalies.'}
            </p>
          </div>
        </div>

        {onNavigateToIdentity && (
          <button
            onClick={onNavigateToIdentity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجلات الهوية AD' : 'Identity Telemetry Lab'}</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feed */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider pb-1">
            <span>Network Wire Events ({netEvents.length})</span>
            <span className="text-emerald-400">Firewall & Wire</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {netEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
                No network events recorded yet. Run the attack scenario to populate.
              </div>
            ) : (
              netEvents.map((evt) => {
                const isSelected = activeEvent?.id === evt.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-slate-850 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{evt.eventType}</span>
                      <span className="text-[10px] text-slate-500">T+{evt.virtualTime}ms</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Src: <strong className="text-slate-200">{evt.sourceIp || 'N/A'}</strong></span>
                      <span>Dst: <strong className="text-slate-200">{evt.destinationIp || 'N/A'}:{evt.destinationPort || ''}</strong></span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        evt.outcome === 'DENIED' ? 'text-rose-400 bg-rose-950/40' : 'text-emerald-400 bg-emerald-950/40'
                      }`}>
                        {evt.outcome}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Network Connection Inspector */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Network Packet & Flow Details
          </div>

          {!activeEvent ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              Select a network event to inspect packet headers and firewall decisions.
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{activeEvent.eventType}</h3>
                  <div className="text-[10px] text-slate-500">Outcome: {activeEvent.outcome}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
                  {activeEvent.category}
                </span>
              </div>

              {/* IP Flow Tuple */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold text-xs uppercase">5-Tuple IP Flow</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Source IP: <strong className="text-cyan-400">{activeEvent.sourceIp || 'N/A'}</strong></div>
                  <div>Dest IP: <strong className="text-rose-400">{activeEvent.destinationIp || 'N/A'}</strong></div>
                  <div>Dest Port: <strong className="text-amber-400">{activeEvent.destinationPort || 'N/A'}</strong></div>
                  <div>Protocol: <strong className="text-white">TCP (Layer 4)</strong></div>
                </div>
              </div>

              {/* Rule Match Details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1 text-[11px]">
                <div className="text-emerald-400 font-bold">Firewall Policy Decision:</div>
                <div className="text-slate-300">
                  Evaluated on edge ACL engine. Action: <strong className={activeEvent.outcome === 'DENIED' ? 'text-rose-400' : 'text-emerald-400'}>{activeEvent.outcome}</strong>.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
