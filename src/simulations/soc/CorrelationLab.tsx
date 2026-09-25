import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  evaluateDetectionRules,
  STANDARD_DETECTION_RULES,
} from './logic/detection';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent } from './logic/enrichment';
import { correlateAlerts, CorrelationGroup } from './logic/correlation';
import {
  Layers,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  User,
  Server,
  Lock,
  Database,
  Radio,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface CorrelationLabProps {
  onBackToMap?: () => void;
  onNavigateToTimeline?: () => void;
}

export const CorrelationLab: React.FC<CorrelationLabProps> = ({
  onBackToMap,
  onNavigateToTimeline,
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
  const correlationGroups: CorrelationGroup[] = correlateAlerts(alerts, enrichedTelemetry);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const activeGroup =
    correlationGroups.find((g) => g.id === selectedGroupId) || correlationGroups[0] || null;

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
              <Layers className="w-6 h-6 text-purple-400" />
              <span>{isAr ? 'مختبر ربط الأحداث وسلاسل الهجوم (Correlation Graph)' : 'Multi-Stage Alert Correlation Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'ربط التنبيهات المنفصلة في سلسلة هجوم واحدة موحدة تكشف مسار الاختراق الكامل'
                : 'Correlate isolated alerts into end-to-end multi-tier attack progressions across identity, endpoint, network, and apps.'}
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

      {/* Main Layout: Correlation Groups & Visual Attack Progression Graph */}
      <div className="space-y-6">
        {!activeGroup ? (
          <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-900 border border-slate-800">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
            <p>{isAr ? 'لم يتم رصد سلسلة هجوم مرتبطة بعد. تأكد من تشغيل السيناريو في مختبر الاستيعاب.' : 'No correlated attack chain formed yet. Run the attack scenario to observe cross-world correlation.'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Incident Summary Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      CORRELATION CONFIDENCE: {activeGroup.confidence}
                    </span>
                    <span className="text-slate-500">ID: {activeGroup.id}</span>
                  </div>
                  <h2 className="text-base font-bold text-white font-mono">{isAr ? activeGroup.titleAr : activeGroup.titleEn}</h2>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Linked Alerts</div>
                    <div className="text-lg font-bold text-rose-400">{activeGroup.alertIds.length} Alerts</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Target User</div>
                    <div className="text-lg font-bold text-cyan-400">{activeGroup.entities.primaryUser || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="text-purple-400 font-bold pb-1 border-b border-slate-800">Why These Alerts Are Linked:</div>
                <ul className="space-y-1 list-disc list-inside">
                  {(isAr ? activeGroup.reasonsAr : activeGroup.reasonsEn).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Visual Multi-Stage Attack Flow Graph */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="uppercase tracking-wider">Multi-Stage Attack Progression Graph</span>
                <span className="text-purple-400 text-[11px]">{activeGroup.attackStages.length} Stages Linked</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeGroup.attackStages.map((stage, idx) => (
                  <div
                    key={stage.alertId}
                    className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 relative flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-900/60 text-purple-200 border border-purple-700/50">
                        STAGE {idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-500">T+{stage.time}ms</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-xs">{isAr ? stage.stageNameAr : stage.stageNameEn}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {isAr ? stage.descriptionAr : stage.descriptionEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                      Alert ID: {stage.alertId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
