import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  CONTAINMENT_ACTIONS,
  ContainmentOption,
  ContainmentActionType,
  evaluateContainmentDecision,
  ContainmentDecisionResult,
} from './logic/containment';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Key,
  Server,
  Radio,
} from 'lucide-react';

interface ContainmentDecisionLabProps {
  onBackToMap?: () => void;
  onNavigateToDetectionEngineering?: () => void;
}

export const ContainmentDecisionLab: React.FC<ContainmentDecisionLabProps> = ({
  onBackToMap,
  onNavigateToDetectionEngineering,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [selectedActions, setSelectedActions] = useState<ContainmentActionType[]>([
    'REVOKE_ACTIVE_SESSIONS',
    'REVERT_PRIVILEGED_GROUP',
    'ISOLATE_HOST_NETWORK',
  ]);

  const evaluation: ContainmentDecisionResult[] = evaluateContainmentDecision(selectedActions);

  const toggleAction = (id: ContainmentActionType) => {
    setSelectedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const hasDestructive = evaluation.some((e) => !e.businessContinuityPreserved);
  const allProportional = selectedActions.length >= 3 && !hasDestructive;

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
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>{isAr ? 'مختبر قرارات الاحتواء والتأثير التشغيلي (Containment Lab)' : 'Containment Decisions & Business Impact Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'اختيار إجراءات الاستجابة الدفاعية المتناسبة دون التسبب في تعطيل خدمات المؤسسة الحيوية'
                : 'Evaluate proportional containment: Stop adversary lateral movement while preserving legitimate enterprise operations.'}
            </p>
          </div>
        </div>

        {onNavigateToDetectionEngineering && (
          <button
            onClick={onNavigateToDetectionEngineering}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'هندسة الكشف والضبط' : 'Detection Engineering Lab'}</span>
          </button>
        )}
      </div>

      {/* Proportionality Banner */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        hasDestructive
          ? 'bg-rose-950/40 border-rose-500/60 shadow-xl shadow-rose-950/30'
          : allProportional
          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-xl shadow-emerald-950/30'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
              hasDestructive ? 'bg-rose-900 text-rose-300' : allProportional ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {hasDestructive ? 'UNPROPORTIONAL / BUSINESS OUTAGE' : allProportional ? 'PROPORTIONAL POSTURE ACHIEVED' : 'SELECTING DEFENSIVE ACTIONS'}
            </span>
            <span className="text-slate-500">Security vs Availability</span>
          </div>
          <div className="text-sm font-bold text-white">
            {hasDestructive
              ? (isAr ? 'تحذير: تم اتخاذ إجراءات مفرطة التدمير أدت لتعطيل خدمات الشركة الحيوية!' : 'Warning: Overly destructive actions selected! Core business operations are broken.')
              : allProportional
              ? (isAr ? 'ممتاز: تم احتواء التهديد بنجاح مع الحفاظ الكامل على استمرارية الأعمال.' : 'Optimal: Threat successfully contained while preserving 100% of business workflows.')
              : (isAr ? 'حدد الإجراءات الدفاعية المناسبة لاحتواء التهديد.' : 'Select targeted defensive actions to neutralize attacker lateral movement.')}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase">Selected Actions</div>
          <div className="text-xl font-bold text-cyan-400">{selectedActions.length} Executed</div>
        </div>
      </div>

      {/* Containment Catalog: Proportional vs Destructive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONTAINMENT_ACTIONS.map((action) => {
          const isSelected = selectedActions.includes(action.id);
          return (
            <div
              key={action.id}
              onClick={() => toggleAction(action.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                isSelected
                  ? action.isOverlyDestructive
                    ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/30'
                    : 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-slate-700"
                    />
                    <span className="font-bold text-white text-xs">{isAr ? action.nameAr : action.nameEn}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                    action.isOverlyDestructive ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  }`}>
                    {action.category}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isAr ? action.descriptionAr : action.descriptionEn}
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                <div className="text-emerald-400">
                  Security Benefit: <span className="text-slate-300">{isAr ? action.securityBenefitAr : action.securityBenefitEn}</span>
                </div>
                <div className={action.isOverlyDestructive ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
                  Business Impact: <span className="text-slate-300">{isAr ? action.businessImpactAr : action.businessImpactEn}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
