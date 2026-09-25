import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent } from './logic/enrichment';
import {
  evaluateDetectionRules,
  STANDARD_DETECTION_RULES,
} from './logic/detection';
import { buildIncidentTimeline, IncidentTimelineEntry } from './logic/incidents';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  User,
  Server,
  Key,
  Shield,
  Radio,
  FileCode,
  Eye,
} from 'lucide-react';

interface IncidentTimelineLabProps {
  onBackToMap?: () => void;
  onNavigateToContainment?: () => void;
}

export const IncidentTimelineLab: React.FC<IncidentTimelineLabProps> = ({
  onBackToMap,
  onNavigateToContainment,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const runtimeEvents = useSimulationStore((s) => s.events);

  const enrichedTelemetry = runtimeEvents.map((rawEvt) => {
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

  const alerts = evaluateDetectionRules(enrichedTelemetry, STANDARD_DETECTION_RULES);
  const timeline: IncidentTimelineEntry[] = buildIncidentTimeline(enrichedTelemetry, alerts);

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const activeEntry = timeline.find((t) => t.id === selectedEntryId) || timeline[0] || null;

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
              <Clock className="w-6 h-6 text-indigo-400" />
              <span>{isAr ? 'مختبر الخط الزمني للحادثة الأمنية (Incident Timeline)' : 'Chronological Incident Timeline Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'إعادة بناء التسلسل الزمني الكامل للهجوم من التخمين وحتى استهداف التقارير المالية ومسح السجلات'
                : 'Reconstruct multi-stage attack sequence ordered by deterministic virtual time stamps (T+0 to T+1550ms).'}
            </p>
          </div>
        </div>

        {onNavigateToContainment && (
          <button
            onClick={onNavigateToContainment}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isAr ? 'قرارات الاحتواء والعزل' : 'Containment Lab'}</span>
          </button>
        )}
      </div>

      {/* Main Layout: Interactive Timeline Stream & Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Timeline Vertical Stream */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider pb-1">
            <span>Incident Chronology ({timeline.length} Events)</span>
            <span className="text-indigo-400 text-[11px]">Strict Virtual Time Order</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2 relative pl-6 border-l-2 border-slate-800">
            {timeline.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                No timeline events recorded yet. Run the attack scenario to populate.
              </div>
            ) : (
              timeline.map((entry) => {
                const isSelected = activeEntry?.id === entry.id;
                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntryId(entry.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative space-y-2 ${
                      isSelected
                        ? 'bg-slate-850 border-indigo-500/60 shadow-lg shadow-indigo-950/30'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    {/* Node Dot on Timeline */}
                    <span
                      className={`absolute -left-[31px] top-5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                        entry.isKeyEvidence ? 'bg-rose-500 ring-4 ring-rose-950/50' : 'bg-slate-600'
                      }`}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          entry.sourceWorld === 'WINDOWS'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : entry.sourceWorld === 'IDENTITY'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : entry.sourceWorld === 'APPSEC'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {entry.sourceWorld}
                        </span>
                        <strong className="text-white text-xs">{isAr ? entry.titleAr : entry.titleEn}</strong>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">T+{entry.virtualTime}ms</span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isAr ? entry.descriptionAr : entry.descriptionEn}
                    </p>

                    {entry.isKeyEvidence && (
                      <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold pt-1 border-t border-slate-800/80">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Key Correlated Evidence Anchor</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Evidence Detail */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Timeline Evidence Inspector
          </div>

          {!activeEntry ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              Select an entry from the timeline to inspect evidence attributes.
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{isAr ? activeEntry.titleAr : activeEntry.titleEn}</h3>
                  <div className="text-[10px] text-slate-500">Virtual Timestamp: T+{activeEntry.virtualTime}ms</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeEntry.isKeyEvidence ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}>
                  {activeEntry.isKeyEvidence ? 'EVIDENCE' : 'TELEMETRY'}
                </span>
              </div>

              {/* Event Attributes */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>Source World: <strong className="text-cyan-400">{activeEntry.sourceWorld}</strong></div>
                <div>Category: <strong className="text-indigo-400">{activeEntry.category}</strong></div>
                <div>Target Host: <strong className="text-white">{activeEntry.host || 'N/A'}</strong></div>
                <div>Actor User: <strong className="text-white">{activeEntry.user || 'SYSTEM'}</strong></div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs text-slate-300 leading-relaxed">
                {isAr ? activeEntry.descriptionAr : activeEntry.descriptionEn}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
