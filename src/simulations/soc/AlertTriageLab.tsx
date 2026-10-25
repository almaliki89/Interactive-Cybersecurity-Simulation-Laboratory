import React, { useState, useEffect, useRef } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import {
  evaluateDetectionRules,
  SecurityAlert,
  STANDARD_DETECTION_RULES,
} from './logic/detection';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent } from './logic/enrichment';
import { triageAlert, TriagedAlertResult } from './logic/triage';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Clock,
  User,
  Server,
  Layers,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  RotateCcw,
} from 'lucide-react';

interface AlertTriageLabProps {
  onBackToMap?: () => void;
  onNavigateToCorrelation?: () => void;
}

export const AlertTriageLab: React.FC<AlertTriageLabProps> = ({
  onBackToMap,
  onNavigateToCorrelation,
}) => {
  const language = useSimulationStore((s) => s.language);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const runtimeEvents = useSimulationStore((s) => s.events);

  // Ingested normalized and enriched events
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
  const triagedList: TriagedAlertResult[] = alerts.map((a) => triageAlert(a, enrichedTelemetry));

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [alertStatuses, setAlertStatuses] = useState<Record<string, string>>({});
  const alertStatusesRef = useRef(alertStatuses);
  alertStatusesRef.current = alertStatuses;

  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;

  useEffect(() => {
    registerChallengeValidator('brute-force-triage-challenge', () => {
      const currentAlerts = alertsRef.current;
      if (!currentAlerts || currentAlerts.length === 0) {
        return {
          success: false,
          score: 0,
          message: 'No active alerts in queue to triage.',
        };
      }

      const currentAlertIds = new Set(currentAlerts.map((a) => a.id));
      const statuses = alertStatusesRef.current;
      const validTriagedCount = Object.entries(statuses).filter(
        ([alertId, status]) =>
          currentAlertIds.has(alertId) &&
          (status === 'TRIAGED' || status === 'CLOSED' || status === 'INVESTIGATING')
      ).length;

      if (validTriagedCount > 0) {
        return { success: true, score: 100, message: 'SOC alerts prioritized and triaged.' };
      }
      return {
        success: false,
        score: 0,
        message: 'Triage security alerts in the current queue by setting an investigation status.',
      };
    });
    return () => {
      unregisterChallengeValidator('brute-force-triage-challenge');
    };
  }, []);

  const activeTriage =
    triagedList.find((t) => t.alert.id === selectedAlertId) || triagedList[0] || null;

  const handleUpdateStatus = (alertId: string, status: 'TRIAGED' | 'INVESTIGATING' | 'CLOSED') => {
    if (!alertsRef.current.some((a) => a.id === alertId)) {
      console.warn('[Integrity] Attempted to triage alert not present in current queue:', alertId);
      return;
    }

    const nextStatuses = { ...alertStatusesRef.current, [alertId]: status };
    alertStatusesRef.current = nextStatuses;
    setAlertStatuses(nextStatuses);

    completeChallenge('brute-force-triage-challenge', {
      success: true,
      score: 100,
      message: 'SOC alert triaged and prioritized.',
    });
  };

  const handleResetTriage = () => {
    alertStatusesRef.current = {};
    setAlertStatuses({});
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
              <ShieldAlert className="w-6 h-6 text-rose-400" />
              <span>{isAr ? 'مختبر فرز وتصنيف التنبيهات (Alert Triage)' : 'SOC Alert Triage & Prioritization Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تقييم خطورة التنبيهات بناءً على أصول المؤسسة وصلاحيات الحسابات وتصعيد التهديدات الحقيقية'
                : 'Prioritize alert queue using explicit deterministic factors: Tier-0 Assets, Privileged Users, and Cross-World Correlation.'}
            </p>
          </div>
        </div>

        {onNavigateToCorrelation && (
          <button
            onClick={onNavigateToCorrelation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'مختبر ربط الهجمات' : 'Correlation Lab'}</span>
          </button>
        )}
      </div>

      {/* Main Split: Triage Queue + Detailed Triage Decision Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Triage Queue */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider pb-1">
            <span>Alert Queue ({triagedList.length})</span>
            <span className="text-rose-400 text-[11px]">Ranked by Priority</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {triagedList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
                No active alerts in queue.
              </div>
            ) : (
              triagedList.map((item) => {
                const isSelected = activeTriage?.alert.id === item.alert.id;
                const currentStatus = alertStatuses[item.alert.id] || item.alert.status;
                return (
                  <div
                    key={item.alert.id}
                    onClick={() => setSelectedAlertId(item.alert.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-slate-850 border-rose-500/60 shadow-lg shadow-rose-950/30'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                        item.triagePriority === 'P1_CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : item.triagePriority === 'P2_HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}>
                        {item.triagePriority} (Score: {item.triageScore})
                      </span>
                      <span className="text-[10px] text-slate-500">T+{item.alert.createdAtVirtualTime}ms</span>
                    </div>

                    <div className="font-bold text-white text-xs">{isAr ? item.alert.ruleNameAr : item.alert.ruleNameEn}</div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>User: <strong className="text-slate-200">{item.alert.entities.users.join(', ') || 'N/A'}</strong></span>
                      <span>Status: <strong className="text-cyan-300">{currentStatus}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Triage Matrix & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Triage Analysis & Escalation Console
          </div>

          {!activeTriage ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              Select an alert from queue to inspect triage rationale and execute escalation.
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{isAr ? activeTriage.alert.ruleNameAr : activeTriage.alert.ruleNameEn}</h3>
                  <div className="text-[10px] text-slate-500">ID: {activeTriage.alert.id}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Priority Tier</span>
                  <span className="text-sm font-black text-rose-400">{activeTriage.triagePriority}</span>
                </div>
              </div>

              {/* Rationale & Explicit Factors */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Deterministic Scoring Breakdown ({activeTriage.triageScore}/100)</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  {(isAr ? activeTriage.factorsAr : activeTriage.factorsEn).map((factor, idx) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
                <div className="text-cyan-400 font-bold text-xs">SOC Analyst Recommendation:</div>
                <div className="text-slate-200 text-xs leading-relaxed">
                  {isAr ? activeTriage.recommendedActionAr : activeTriage.recommendedActionEn}
                </div>
              </div>

              {/* Evidence & Entities */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>Affected Users: <strong className="text-white">{activeTriage.alert.entities.users.join(', ') || 'N/A'}</strong></div>
                <div>Affected Hosts: <strong className="text-white">{activeTriage.alert.entities.hosts.join(', ') || 'N/A'}</strong></div>
                <div className="col-span-2 text-slate-400">
                  Evidence Events: [{activeTriage.alert.evidenceEventIds.join(', ')}]
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-400 font-bold text-xs">Update Status:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(activeTriage.alert.id, 'INVESTIGATING')}
                    data-testid="btn-triage-investigate"
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تصعيد للتحقيق' : 'Escalate to Incident'}</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeTriage.alert.id, 'TRIAGED')}
                    data-testid="btn-triage-triaged"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    <span>{isAr ? 'تم الفرز' : 'Mark Triaged'}</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeTriage.alert.id, 'CLOSED')}
                    data-testid="btn-triage-close"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs"
                  >
                    <span>{isAr ? 'إغلاق (سليم)' : 'Close Benign'}</span>
                  </button>
                  <button
                    onClick={handleResetTriage}
                    data-testid="btn-reset-triage"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
                    title={isAr ? 'إعادة ضبط فرز التنبيهات' : 'Reset All Triage Statuses'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
