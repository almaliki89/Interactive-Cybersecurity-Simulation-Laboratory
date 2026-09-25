import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { INITIAL_DIRECTORY_OBJECTS } from './logic/directory';
import { evaluateIdentityRisks, IdentityRiskFinding } from './logic/groups';
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Info,
  Server,
  Users,
} from 'lucide-react';

interface IdentitySecurityLabProps {
  onBackToMap?: () => void;
  onNavigateToChallenge?: () => void;
}

export const IdentitySecurityLab: React.FC<IdentitySecurityLabProps> = ({
  onBackToMap,
  onNavigateToChallenge,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const risks: IdentityRiskFinding[] = evaluateIdentityRisks(INITIAL_DIRECTORY_OBJECTS);

  const getSeverityStyle = (severity: IdentityRiskFinding['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/60 border-red-700 text-red-300';
      case 'HIGH':
        return 'bg-amber-950/60 border-amber-700 text-amber-300';
      case 'MEDIUM':
        return 'bg-yellow-950/60 border-yellow-700 text-yellow-300';
      case 'LOW':
        return 'bg-blue-950/60 border-blue-700 text-blue-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
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
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'مختبر فحص مخاطر الهوية والصلاحيات المؤسسية' : 'Enterprise Identity Risk & Hygiene Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'رصد الحسابات المهجورة، تراكم الصلاحيات الإدارية، وتسجيل الدخول التفاعلي غير الآمن لحسابات الخدمات'
                : 'Defensive posture auditing: identify dormant credentials, privilege accumulation, and risky service account rights'}
            </p>
          </div>
        </div>

        {onNavigateToChallenge && (
          <button
            onClick={onNavigateToChallenge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold"
          >
            <span>{isAr ? 'بدء التحدي الشامل' : 'Start Master Challenge'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-slate-400">Total Risks Flagged:</span>
          <span className="text-2xl font-black text-white block">{risks.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-slate-400">Critical Severity:</span>
          <span className="text-2xl font-black text-red-400 block">
            {risks.filter((r) => r.severity === 'CRITICAL').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-slate-400">High Severity:</span>
          <span className="text-2xl font-black text-amber-400 block">
            {risks.filter((r) => r.severity === 'HIGH').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-slate-400">Posture Tier:</span>
          <span className="text-2xl font-black text-amber-300 block">ELEVATED RISK</span>
        </div>
      </div>

      {/* Risk Findings List */}
      <div className="space-y-4 font-mono text-xs">
        {risks.map((finding) => (
          <div
            key={finding.id}
            className={`p-6 rounded-2xl border space-y-3 ${getSeverityStyle(finding.severity)}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                  [{finding.category}] • AFFECTED: {finding.affectedEntity}
                </span>
                <h3 className="text-base font-bold text-white">
                  {isAr ? finding.titleAr : finding.titleEn}
                </h3>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-slate-950">
                {finding.severity} RISK
              </span>
            </div>

            <p className="text-slate-200 text-xs leading-relaxed">
              {isAr ? finding.explanationAr : finding.explanationEn}
            </p>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
              <strong className="text-cyan-400 block">
                {isAr ? 'الإجراء التصحيحي الموصى به (Remediation):' : 'Recommended Hardening Action:'}
              </strong>
              <span className="text-slate-300">
                {isAr ? finding.remediationAr : finding.remediationEn}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
