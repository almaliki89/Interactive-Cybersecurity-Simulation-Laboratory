import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent } from './logic/enrichment';
import {
  Radio,
  ArrowRight,
  ArrowLeft,
  FileCode,
  Shield,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AppTelemetryLabProps {
  onBackToMap?: () => void;
  onNavigateToTimeline?: () => void;
}

export const AppTelemetryLab: React.FC<AppTelemetryLabProps> = ({
  onBackToMap,
  onNavigateToTimeline,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const runtimeEvents = useSimulationStore((s) => s.events);

  const appEvents = runtimeEvents
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
    .filter((e) => e.sourceWorld === 'APPSEC' || e.category === 'APPLICATION_DEFENSE');

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const activeEvent = appEvents.find((e) => e.id === selectedEventId) || appEvents[0] || null;

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
              <Radio className="w-6 h-6 text-cyan-400" />
              <span>{isAr ? 'مختبر سجلات وتطبيقات الويب (AppSec Telemetry)' : 'Application Security & API Telemetry Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص سجلات حماية التطبيقات (BOLA/IDOR, Rate Limit, SQLi) والتفويض على مستوى الكائنات'
                : 'Application Layer Telemetry: BOLA / IDOR Probing, Rate Limiting Triggers, and API Endpoint Authorization.'}
            </p>
          </div>
        </div>

        {onNavigateToTimeline && (
          <button
            onClick={onNavigateToTimeline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'الخط الزمني للحادثة' : 'Incident Timeline Lab'}</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feed */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider pb-1">
            <span>AppSec Telemetry Events ({appEvents.length})</span>
            <span className="text-cyan-400">Nexora Portal & API</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {appEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
                No AppSec events recorded yet. Run the attack scenario to populate.
              </div>
            ) : (
              appEvents.map((evt) => {
                const isSelected = activeEvent?.id === evt.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-slate-850 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{evt.eventType}</span>
                      <span className="text-[10px] text-slate-500">T+{evt.virtualTime}ms</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>User: <strong className="text-slate-200">{evt.user || 'anonymous'}</strong></span>
                      <span className="truncate max-w-[180px]">Endpoint: <strong className="text-cyan-300">{evt.resource || '/api/v1/finance/reports'}</strong></span>
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

        {/* Right: Detail */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Application Request & Security Context
          </div>

          {!activeEvent ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              Select an AppSec event to inspect endpoint and authorization response headers.
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{activeEvent.eventType}</h3>
                  <div className="text-[10px] text-slate-500">Target Endpoint: {activeEvent.resource || '/api/v1/finance/reports'}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold">
                  {activeEvent.category}
                </span>
              </div>

              {/* API Context */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>User ID: <strong className="text-white">{activeEvent.user || 'sara'}</strong></div>
                <div>HTTP Status: <strong className="text-rose-400">403 FORBIDDEN</strong></div>
                <div className="col-span-2 text-slate-300">
                  Security Message: <strong>BOLA / IDOR Violation: Unauthorized cross-tenant endpoint query.</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
