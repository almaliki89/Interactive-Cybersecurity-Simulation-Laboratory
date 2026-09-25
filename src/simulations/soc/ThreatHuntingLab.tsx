import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  STANDARD_HUNTING_HYPOTHESES,
  HuntingHypothesis,
  queryTelemetry,
} from './logic/hunting';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent, EnrichedTelemetryEvent } from './logic/enrichment';
import {
  Search,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Shield,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface ThreatHuntingLabProps {
  onBackToMap?: () => void;
  onNavigateToEndpoint?: () => void;
}

export const ThreatHuntingLab: React.FC<ThreatHuntingLabProps> = ({
  onBackToMap,
  onNavigateToEndpoint,
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

  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string>(
    STANDARD_HUNTING_HYPOTHESES[0].id
  );
  const [activeQuery, setActiveQuery] = useState<string>(
    STANDARD_HUNTING_HYPOTHESES[0].suggestedQuery
  );

  const activeHypothesis =
    STANDARD_HUNTING_HYPOTHESES.find((h) => h.id === selectedHypothesisId) ||
    STANDARD_HUNTING_HYPOTHESES[0];

  const results = queryTelemetry(enrichedTelemetry, activeQuery);
  const isHypothesisValidated = results.length >= activeHypothesis.expectedMinMatches;

  const handleSelectHypothesis = (h: HuntingHypothesis) => {
    setSelectedHypothesisId(h.id);
    setActiveQuery(h.suggestedQuery);
  };

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
              <Compass className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'مختبر صيد التهديدات الاستباقي (Threat Hunting)' : 'Proactive Threat Hunting Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'صياغة فرضيات التحقيق الأمني والاستعلام الاستباقي للبحث عن الأنشطة المشبوهة الخفية'
                : 'Formulate threat hypotheses -> Construct safe telemetry queries -> Validate findings against synthetic logs.'}
            </p>
          </div>
        </div>

        {onNavigateToEndpoint && (
          <button
            onClick={onNavigateToEndpoint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجلات الأجهزة ونقاط النهاية' : 'Endpoint Telemetry Lab'}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Hypothesis Catalog + Safe Query & Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hypotheses Cards */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Hunting Hypotheses ({STANDARD_HUNTING_HYPOTHESES.length})
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {STANDARD_HUNTING_HYPOTHESES.map((h) => {
              const isSelected = selectedHypothesisId === h.id;
              const matches = queryTelemetry(enrichedTelemetry, h.suggestedQuery);
              const isValid = matches.length >= h.expectedMinMatches;

              return (
                <div
                  key={h.id}
                  onClick={() => handleSelectHypothesis(h)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-slate-850 border-amber-500/60 shadow-lg shadow-amber-950/30'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {h.threatTechnique}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isValid ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}>
                      {isValid ? 'CONFIRMED' : 'UNCONFIRMED'}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-xs">{isAr ? h.titleAr : h.titleEn}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {isAr ? h.descriptionAr : h.descriptionEn}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Category: {h.targetCategory}</span>
                    <span>Matched: {matches.length} events</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Query & Evidence Findings Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Hypothesis Query & Validation
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">{isAr ? activeHypothesis.titleAr : activeHypothesis.titleEn}</h3>
                <div className="text-[10px] text-slate-400">{activeHypothesis.threatTechnique}</div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                isHypothesisValidated
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
              }`}>
                {isHypothesisValidated ? 'HYPOTHESIS VALIDATED' : 'SEARCHING...'}
              </span>
            </div>

            {/* Query Editor */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold block text-xs">Hunting Query Syntax:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeQuery}
                  onChange={(e) => setActiveQuery(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs"
                />
                <button
                  onClick={() => setActiveQuery(activeHypothesis.suggestedQuery)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Discovered Evidence ({results.length} Events)</span>
                <span className="text-[10px] text-slate-500">Min Required: {activeHypothesis.expectedMinMatches}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">User</th>
                      <th className="p-2.5">Host</th>
                      <th className="p-2.5">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">
                          No matching telemetry events for this query.
                        </td>
                      </tr>
                    ) : (
                      results.map((evt) => (
                        <tr key={evt.id} className="hover:bg-slate-900 text-slate-300">
                          <td className="p-2.5 text-slate-500">T+{evt.virtualTime}ms</td>
                          <td className="p-2.5 font-mono font-bold text-cyan-400">{evt.eventType}</td>
                          <td className="p-2.5 text-white">{evt.user || 'SYSTEM'}</td>
                          <td className="p-2.5 text-slate-400">{evt.host || 'N/A'}</td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              evt.outcome === 'SUCCESS' ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                            }`}>
                              {evt.outcome}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
