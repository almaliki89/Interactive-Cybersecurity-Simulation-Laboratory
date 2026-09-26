/**
 * OMEGA V14 — Kubernetes Incident Response & Forensics Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { CLUSTER_ATTACK_SCENARIO, ClusterAttackStage } from './runtime/ContainerAttackScenario';
import { containerEventBridge } from './runtime/ContainerEventBridge';
import { Activity, ShieldAlert, CheckCircle2, ArrowRight, RefreshCw, Terminal, ShieldCheck } from 'lucide-react';

export const K8sIncidentLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const isAr = language === 'ar';

  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [mitigatedStages, setMitigatedStages] = useState<number[]>([]);

  const currentStage = CLUSTER_ATTACK_SCENARIO[activeStageIndex];

  const applyMitigationForCurrentStage = () => {
    if (!mitigatedStages.includes(currentStage.stageId)) {
      setMitigatedStages([...mitigatedStages, currentStage.stageId]);

      // Emit event to SOC Event Bridge
      containerEventBridge.emitEvent({
        id: `inc-mitigation-${currentStage.stageId}-${virtualTime}`,
        eventType: 'POD_QUARANTINED',
        virtualTime,
        podName: currentStage.targetResource,
        namespace: 'production',
        severity: 'info',
        outcome: 'SUCCESS',
        attributes: {
          mitigatedStageId: currentStage.stageId,
          remedy: currentStage.mitigationRequiredEn,
        },
      });
    }
  };

  const isCurrentMitigated = mitigatedStages.includes(currentStage.stageId);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs mb-1">
              <Activity className="w-4 h-4" />
              <span>{isAr ? 'مختبر الاستجابة لحوادث اختراق الكلاستر' : 'K8s Cluster Incident Response Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'تتبع مراحل الاختراق متعددة الطبقات والاحتواء الفوري' : 'Multi-Stage Pod Compromise Triage & Containment'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'تتبع الهجوم من ثغرة الويب، إلى سرقة التوكن، والتحرك الجانبي، وكسر العزل، ونفذ تدابير الاحتواء.'
                : 'Follow realistic kill-chain progression from initial web RCE to token theft, lateral pod hop, and breakout.'}
            </p>
          </div>

          <button
            onClick={() => {
              setActiveStageIndex(0);
              setMitigatedStages([]);
            }}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stage Navigation Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CLUSTER_ATTACK_SCENARIO.map((st, idx) => {
            const isDone = mitigatedStages.includes(st.stageId);
            const isCurrent = activeStageIndex === idx;

            return (
              <div
                key={st.stageId}
                onClick={() => setActiveStageIndex(idx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-950/30 border-orange-500 text-white shadow-md'
                    : isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold">Stage 0{st.stageId}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="font-bold text-xs truncate">{isAr ? st.nameAr : st.nameEn}</div>
              </div>
            );
          })}
        </div>

        {/* Stage Details */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-orange-300 border border-slate-700">
                {currentStage.technique}
              </span>
              <h2 className="text-base font-bold text-white mt-1">
                {isAr ? currentStage.nameAr : currentStage.nameEn}
              </h2>
            </div>

            <button
              onClick={applyMitigationForCurrentStage}
              disabled={isCurrentMitigated}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                isCurrentMitigated
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-md'
              }`}
            >
              {isCurrentMitigated ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'تم تطبيق الاحتواء' : 'Contained'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'تنفيذ إجراء الاحتواء والإصلاح' : 'Execute Containment'}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
            <div className="text-slate-500 font-bold flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              <span>Attacker Command Execution:</span>
            </div>
            <div className="text-rose-300 break-all">{currentStage.attackerCommand}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="font-bold text-slate-400 mb-1">{isAr ? 'الأثر المرصود في الكلاستر:' : 'Observed Impact:'}</div>
              <p className="text-slate-200 leading-relaxed">
                {isAr ? currentStage.observedImpactAr : currentStage.observedImpactEn}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="font-bold text-cyan-400 mb-1">{isAr ? 'الإجراء الدفاعي المطلوب:' : 'Required Mitigation:'}</div>
              <p className="text-slate-200 leading-relaxed">
                {isAr ? currentStage.mitigationRequiredAr : currentStage.mitigationRequiredEn}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
