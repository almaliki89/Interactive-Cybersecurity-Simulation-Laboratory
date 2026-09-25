import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { loadSocDetectionScenario } from './runtime/DetectionScenario';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent, EnrichedTelemetryEvent } from './logic/enrichment';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Server,
  Database,
  Lock,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Clock,
  Layers,
  Search,
  Filter,
  Eye,
  Radio,
  FileCode,
  Terminal,
} from 'lucide-react';

interface TelemetryIngestionLabProps {
  onBackToMap?: () => void;
  onNavigateToExplorer?: () => void;
}

export const TelemetryIngestionLab: React.FC<TelemetryIngestionLabProps> = ({
  onBackToMap,
  onNavigateToExplorer,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const setClockSpeed = useSimulationStore((s) => s.setClockSpeed);
  const runtimeEvents = useSimulationStore((s) => s.events);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Derive normalized and enriched telemetry
  const enrichedTelemetry: EnrichedTelemetryEvent[] = runtimeEvents.map((rawEvt) => {
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
  });

  const filtered = sourceFilter === 'ALL'
    ? enrichedTelemetry
    : enrichedTelemetry.filter((e) => e.sourceWorld === sourceFilter);

  const activeEvent = enrichedTelemetry.find((e) => e.id === selectedEventId) || filtered[0] || null;

  const handleStart = () => {
    globalSimulationRuntime.reset();
    loadSocDetectionScenario(globalSimulationRuntime, { startVirtualTime: 0 });
    globalSimulationRuntime.start();
  };

  const handleStep = () => {
    if (runtimeEvents.length === 0) {
      loadSocDetectionScenario(globalSimulationRuntime, { startVirtualTime: virtualTime });
    }
    globalSimulationRuntime.step(150);
  };

  const handlePauseResume = () => {
    if (clockStatus === 'running') {
      globalSimulationRuntime.pause();
    } else {
      globalSimulationRuntime.resume();
    }
  };

  const handleReset = () => {
    globalSimulationRuntime.reset();
  };

  const sourceWorlds = [
    { id: 'WINDOWS', name: 'Windows Security', icon: Server, color: 'text-blue-400 bg-blue-950/40 border-blue-500/30' },
    { id: 'IDENTITY', name: 'Active Directory / Kerberos', icon: Key, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30' },
    { id: 'APPSEC', name: 'Application & API Gateway', icon: Radio, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
    { id: 'NETWORK', name: 'Firewall & Network Wire', icon: Shield, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
    { id: 'LINUX', name: 'Linux Syslog / PAM', icon: Terminal, color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
  ];

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
              <Activity className="w-6 h-6 text-cyan-400" />
              <span>{isAr ? 'مختبر تدفق واستيعاب السجلات (Telemetry Ingestion)' : 'Telemetry Ingestion & Normalization Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'استيعاب السجلات من كافة الأنظمة (ويندوز، لينكس، AD، الشبكة، والتطبيقات) وتحويلها إلى بنية قياسية موحدة'
                : 'Ingest raw cross-world telemetry -> Normalize into unified schema -> Contextual enrichment for SIEM indexing.'}
            </p>
          </div>
        </div>

        {onNavigateToExplorer && (
          <button
            onClick={onNavigateToExplorer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isAr ? 'مستكشف SIEM' : 'SIEM Explorer Lab'}</span>
          </button>
        )}
      </div>

      {/* Control Deck */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold mr-1">{isAr ? 'تصفية المصدر:' : 'Source World:'}</span>
          <button
            onClick={() => setSourceFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg border ${
              sourceFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            ALL ({enrichedTelemetry.length})
          </button>
          {sourceWorlds.map((src) => {
            const count = enrichedTelemetry.filter((e) => e.sourceWorld === src.id).length;
            return (
              <button
                key={src.id}
                onClick={() => setSourceFilter(src.id)}
                className={`px-2.5 py-1 rounded-lg border ${
                  sourceFilter === src.id ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {src.id} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Speed */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  globalSimulationRuntime.setSpeed(spd);
                  setClockSpeed(spd);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  clockSpeed === spd ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isAr ? 'تشغيل السيناريو' : 'Run Scenario'}</span>
          </button>

          <button
            onClick={handleStep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{isAr ? 'خطوة' : 'Step'}</span>
          </button>

          <button
            onClick={handlePauseResume}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {clockStatus === 'running' ? <Pause className="w-4 h-4 text-yellow-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="text-[11px] text-slate-400 flex items-center gap-1 ml-2">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>T+{virtualTime}ms</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Stream + Tri-Fold Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ingestion Feed Stream */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider pb-1">
            <span>{isAr ? 'سجل تدفق الأحداث الحية (Ingestion Stream)' : 'Real-Time Ingestion Stream'}</span>
            <span className="text-cyan-400">{filtered.length} Ingested</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-400" />
                <p>{isAr ? 'لا توجد سجلات بعد. انقر فوق "تشغيل السيناريو" لبدء التدفق.' : 'No telemetry ingested yet. Click "Run Scenario" to simulate multi-tier attack telemetry.'}</p>
              </div>
            ) : (
              filtered.map((evt) => {
                const isSelected = selectedEventId === evt.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col space-y-2 ${
                      isSelected
                        ? 'bg-slate-850 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          evt.sourceWorld === 'WINDOWS'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : evt.sourceWorld === 'IDENTITY'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : evt.sourceWorld === 'APPSEC'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : evt.sourceWorld === 'NETWORK'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {evt.sourceWorld}
                        </span>
                        <span className="font-bold text-white text-xs">{evt.eventType}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">T+{evt.virtualTime}ms</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>User: <strong className="text-slate-200">{evt.user || 'N/A'}</strong></span>
                      <span>Host: <strong className="text-slate-200">{evt.host || 'N/A'}</strong></span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        evt.outcome === 'FAILURE' || evt.outcome === 'DENIED' || evt.outcome === 'ANOMALY'
                          ? 'text-rose-400 bg-rose-950/40'
                          : 'text-emerald-400 bg-emerald-950/40'
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

        {/* Right: Tri-Fold Telemetry Pipeline Inspector */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            {isAr ? 'معالج تطبيع وإثراء البيانات (Normalization & Enrichment)' : 'Telemetry Pipeline Inspector'}
          </div>

          {!activeEvent ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              <Eye className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p>{isAr ? 'اختر حدثاً لفحص مراحل معالجته' : 'Select an event from the feed to inspect pipeline transformation.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Step 1: Raw Event */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>1. Raw Ingested Event</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{activeEvent.rawEventId || activeEvent.id}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 font-mono">
                  <div>Type: <strong className="text-cyan-400">{activeEvent.eventType}</strong></div>
                  <div>Source: <span className="text-slate-400">{activeEvent.sourceWorld}</span></div>
                  <div>Timestamp: <span className="text-slate-400">T+{activeEvent.virtualTime}ms</span></div>
                  <div>Raw Attributes: <span className="text-slate-400">{JSON.stringify(activeEvent.attributes)}</span></div>
                </div>
              </div>

              {/* Step 2: Normalized Schema */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>2. Normalized Common Schema</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    {activeEvent.category}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>Category: <strong className="text-white">{activeEvent.category}</strong></div>
                  <div>Outcome: <strong className={activeEvent.outcome === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>{activeEvent.outcome}</strong></div>
                  <div>User Entity: <strong className="text-slate-300">{activeEvent.user || 'None'}</strong></div>
                  <div>Host Entity: <strong className="text-slate-300">{activeEvent.host || 'None'}</strong></div>
                  <div>Resource: <strong className="text-slate-300">{activeEvent.resource || 'N/A'}</strong></div>
                  <div>Process: <strong className="text-slate-300">{activeEvent.process || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Step 3: Contextual Enrichment */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>3. Directory & Asset Enrichment</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">SIEM Context Ready</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>User Dept: <strong className="text-indigo-300">{activeEvent.userDepartment || 'External / Unmapped'}</strong></div>
                  <div>Privilege Level: <strong className={activeEvent.userIsPrivileged ? 'text-amber-400' : 'text-slate-400'}>{activeEvent.userIsPrivileged ? 'PRIVILEGED ADMIN' : 'Standard User'}</strong></div>
                  <div>Host Criticality: <strong className={activeEvent.assetCriticality === 'CRITICAL' ? 'text-rose-400' : 'text-slate-300'}>{activeEvent.assetCriticality || 'Standard'}</strong></div>
                  <div>Network Zone: <strong className="text-cyan-300">{activeEvent.networkZone || 'Unknown'}</strong></div>
                  {activeEvent.resourceSensitivity && (
                    <div className="col-span-2 text-rose-300">
                      Resource Sensitivity: <strong>{activeEvent.resourceSensitivity}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
