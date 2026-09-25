import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent } from './logic/enrichment';
import {
  Server,
  Terminal,
  ArrowRight,
  ArrowLeft,
  Shield,
  Clock,
  Layers,
  Activity,
  FileCode,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface EndpointTelemetryLabProps {
  onBackToMap?: () => void;
  onNavigateToNetwork?: () => void;
}

export const EndpointTelemetryLab: React.FC<EndpointTelemetryLabProps> = ({
  onBackToMap,
  onNavigateToNetwork,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const runtimeEvents = useSimulationStore((s) => s.events);

  const endpointEvents = runtimeEvents
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
    .filter((e) => e.sourceWorld === 'WINDOWS' || e.sourceWorld === 'LINUX' || e.category === 'PROCESS_EXECUTION');

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const activeEvent = endpointEvents.find((e) => e.id === selectedEventId) || endpointEvents[0] || null;

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
              <Server className="w-6 h-6 text-blue-400" />
              <span>{isAr ? 'مختبر سجلات الأجهزة ونقاط النهاية (Endpoint EDR Telemetry)' : 'Endpoint EDR & Process Telemetry Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص شجرة العمليات والخدمات وسجلات ويندوز ولينكس لاكتشاف تنفيذ الأوامر المشبوهة'
                : 'Windows Event 4688 / Syslog: Trace process hierarchy, parent-child relations, and privilege escalations.'}
            </p>
          </div>
        </div>

        {onNavigateToNetwork && (
          <button
            onClick={onNavigateToNetwork}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجلات الشبكة' : 'Network Telemetry Lab'}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Endpoint Feed + Process Hierarchy Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Endpoint Event Stream */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider pb-1">
            <span>Endpoint Events ({endpointEvents.length})</span>
            <span className="text-blue-400">Windows & Linux</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {endpointEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
                No endpoint events recorded yet. Run the attack scenario to populate.
              </div>
            ) : (
              endpointEvents.map((evt) => {
                const isSelected = activeEvent?.id === evt.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-slate-850 border-blue-500/60 shadow-lg shadow-blue-950/30'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{evt.eventType}</span>
                      <span className="text-[10px] text-slate-500">T+{evt.virtualTime}ms</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Host: <strong className="text-slate-200">{evt.host || 'N/A'}</strong></span>
                      <span>User: <strong className="text-slate-200">{evt.user || 'SYSTEM'}</strong></span>
                      {evt.process && <span>Proc: <strong className="text-amber-400">{evt.process}</strong></span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Process & Host Forensic Context */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Endpoint Forensics & Execution Context
          </div>

          {!activeEvent ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              Select an endpoint event to inspect host forensics.
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{activeEvent.eventType}</h3>
                  <div className="text-[10px] text-slate-500">Host: {activeEvent.host || 'N/A'}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800 text-xs font-bold">
                  {activeEvent.sourceWorld}
                </span>
              </div>

              {/* Process Tree Visualization */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-slate-400 font-bold text-xs uppercase">Process Execution Lineage</div>
                <div className="space-y-2 pl-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                    <span>Parent: <strong className="text-slate-300">{activeEvent.parentProcess || 'services.exe (PID 620)'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 pl-4 border-l border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Spawned Process: <strong className="text-white">{activeEvent.process || 'whoami.exe (PID 4892)'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Host & User Context */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>Target Host: <strong className="text-white">{activeEvent.host || 'N/A'}</strong></div>
                <div>Host Criticality: <strong className={activeEvent.assetCriticality === 'CRITICAL' ? 'text-rose-400' : 'text-slate-300'}>{activeEvent.assetCriticality || 'Standard'}</strong></div>
                <div>Executing User: <strong className="text-cyan-400">{activeEvent.user || 'SYSTEM'}</strong></div>
                <div>Privilege Level: <strong className={activeEvent.userIsPrivileged ? 'text-amber-400' : 'text-slate-400'}>{activeEvent.userIsPrivileged ? 'ADMIN' : 'Standard'}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
