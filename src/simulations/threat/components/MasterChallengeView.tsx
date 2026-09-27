import React, { useMemo } from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { ThreatHuntValidator } from '../logic/validators';
import { ShieldCheck, Target, CheckCircle2, XCircle, AlertCircle, Award, ArrowRight, Play } from 'lucide-react';

interface MasterChallengeViewProps {
  language: 'ar' | 'en';
}

export const MasterChallengeView: React.FC<MasterChallengeViewProps> = ({ language }) => {
  const activeHuntId = useThreatHuntingStore((s) => s.activeHuntId);
  const hunts = useThreatHuntingStore((s) => s.hunts);
  const hypotheses = useThreatHuntingStore((s) => s.hypotheses);
  const findings = useThreatHuntingStore((s) => s.findings);
  const detections = useThreatHuntingStore((s) => s.detections);
  const detectionResults = useThreatHuntingStore((s) => s.detectionResults);
  const socHandoffs = useThreatHuntingStore((s) => s.socHandoffs);
  const forensicsHandoffs = useThreatHuntingStore((s) => s.forensicsHandoffs);
  const executedQueryStrings = useThreatHuntingStore((s) => s.executedQueryStrings);
  const telemetryEvents = useThreatHuntingStore((s) => s.telemetryEvents);
  const setActiveTab = useThreatHuntingStore((s) => s.setActiveTab);

  const isAr = language === 'ar';
  const masterHunt = hunts['HUNT-MASTER'] || hunts[activeHuntId];
  const masterHyp = hypotheses[masterHunt?.hypothesisId || 'HYP-MASTER'] || hypotheses['HYP-MASTER'];

  const validationState = useMemo(() => {
    return {
      hunt: masterHunt,
      hypothesis: masterHyp,
      findings,
      detections,
      detectionResults,
      socHandoffs,
      forensicsHandoffs,
      executedQueries: executedQueryStrings,
      telemetryEvents,
    };
  }, [masterHunt, masterHyp, findings, detections, detectionResults, socHandoffs, forensicsHandoffs, executedQueryStrings, telemetryEvents]);

  const outcome = useMemo(() => {
    return ThreatHuntValidator.validateMasterChallenge(validationState);
  }, [validationState]);

  const objectives = [
    {
      id: 'master-obj-hypothesis',
      titleEn: 'Formulate & Support APT Campaign Hypothesis',
      titleAr: 'صياغة وإثبات فرضية الهجوم المتقدم (APT)',
      descEn: 'Validate multi-stage hypothesis connecting identity, endpoint, cloud, and CI/CD.',
      descAr: 'التحقق من الفرضية متعددة المراحل الرابطة بين الهوية والأجهزة والسحابة وسلاسل التوريد.',
      isDone: outcome.completedObjectives.includes('master-obj-hypothesis'),
      targetTab: 'HYPOTHESIS' as const,
    },
    {
      id: 'master-obj-queries',
      titleEn: 'Execute Multi-World Telemetry Queries',
      titleAr: 'تنفيذ استعلامات السجلات عبر العوالم المختلفة',
      descEn: 'Execute hunting queries across Windows, Network, Cloud, and DevSecOps domains.',
      descAr: 'تشغيل استعلامات صيد التهديدات عبر سجلات ويندوز والشبكة والسحابة وهندسة الأمان.',
      isDone: outcome.completedObjectives.includes('master-obj-queries'),
      targetTab: 'QUERY' as const,
    },
    {
      id: 'master-obj-findings',
      titleEn: 'Document Correlated Findings (>= 4 Events)',
      titleAr: 'توثيق النتائج المترابطة (4 أحداث أو أكثر مع حفظ rawEventId)',
      descEn: 'Record verified findings preserving canonical rawEventIds and entity references.',
      descAr: 'تسجيل نتائج تحقيق مؤكدة مع الاحتفاظ بمعرفات الأحداث الأصلية ومراجع الكيانات.',
      isDone: outcome.completedObjectives.includes('master-obj-findings'),
      targetTab: 'FINDINGS' as const,
    },
    {
      id: 'master-obj-detection',
      titleEn: 'Author & Tune Production Detection Rule',
      titleAr: 'تصميم وضبط قاعدة كشف خالية من الإنذارات الكاذبة',
      descEn: 'Test detection logic against live telemetry achieving 0 false positives.',
      descAr: 'اختبار منطق الكشف ضد السجلات المباشرة للوصول إلى دقة تامة بدون إنذارات كاذبة.',
      isDone: outcome.completedObjectives.includes('master-obj-detection'),
      targetTab: 'DETECTION' as const,
    },
    {
      id: 'master-obj-soc',
      titleEn: 'Dispatch Incident to SOC Queue',
      titleAr: 'إحالة الحادثة إلى قائمة حوادث مركز العمليات SOC',
      descEn: 'Complete formal SOC handoff preserving alert context and priority.',
      descAr: 'إتمام الإحالة الرسمية لـ SOC مع الحفاظ على سياق التنبيه ومستوى الأولوية.',
      isDone: outcome.completedObjectives.includes('master-obj-soc'),
      targetTab: 'FINDINGS' as const,
    },
    {
      id: 'master-obj-forensics',
      titleEn: 'Forensics Evidence Preservation (Canonical EVD-...)',
      titleAr: 'حفظ الأدلة الجنائية الرقمية الرسمية (EVD-...)',
      descEn: 'Map supporting events into preserved forensic evidence items with SHA-256 integrity.',
      descAr: 'تحويل الأحداث الداعمة إلى أدلة جنائية محفوظة ببصمات تجزئة SHA-256 موثوقة.',
      isDone: outcome.completedObjectives.includes('master-obj-forensics'),
      targetTab: 'FINDINGS' as const,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 select-none overflow-y-auto p-6 max-w-4xl mx-auto w-full gap-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 text-amber-400">
          <Award className="w-6 h-6" />
          <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
            {isAr ? 'التحدي الأمني الشامل V16' : 'MASTER THREAT HUNT INVESTIGATION'}
          </span>
        </div>

        <h1 className="text-lg font-bold text-white tracking-tight">
          {isAr ? masterHunt.titleAr : masterHunt.titleEn}
        </h1>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isAr ? masterHunt.summaryAr : masterHunt.summaryEn}
        </p>

        {/* Status Pill */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                outcome.success ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-bold text-white">
              {outcome.success
                ? isAr
                  ? 'تم إنجاز التحدي الشامل بنجاح كامل!'
                  : 'Master Investigation Fully Accomplished!'
                : isAr
                ? 'التحقيق جارٍ (يتطلب استيفاء جميع المتطلبات الحقيقية)'
                : 'Investigation In Progress'}
            </span>
          </div>

          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {outcome.completedObjectives.length} / {objectives.length} {isAr ? 'أهداف مكتملة' : 'objectives verified'}
          </span>
        </div>
      </div>

      {/* Checklist of Real Verifications */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {isAr ? 'معايير الإنجاز والتحقق الصارم (Anti-Cheat Criteria):' : 'Investigation Objectives & Real State Gates:'}
        </h2>

        <div className="space-y-2">
          {objectives.map((obj) => (
            <div
              key={obj.id}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                obj.isDone
                  ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {obj.isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div className="flex flex-col">
                  <h4 className="text-xs font-bold text-white">
                    {isAr ? obj.titleAr : obj.titleEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr ? obj.descAr : obj.descEn}
                  </p>
                </div>
              </div>

              {!obj.isDone && (
                <button
                  onClick={() => setActiveTab(obj.targetTab as any)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-cyan-400 hover:text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                >
                  <span>{isAr ? 'الانتقال للقسم' : 'Go to Stage'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Debrief & Next Steps */}
      {outcome.success ? (
        <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-700/60 text-xs text-emerald-200 flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
            <ShieldCheck className="w-5 h-5" />
            <span>{isAr ? 'تقرير الإنجاز النهائي للمحقق الأمني:' : 'Final Threat Hunter Accomplishment Report:'}</span>
          </div>
          <p className="leading-relaxed">{isAr ? outcome.messageAr : outcome.messageEn}</p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isAr
              ? `المتطلب التالي لإكمال التحدي: ${outcome.missingRequirementsAr[0] || 'استمر في التحقيق'}`
              : `Next requirement: ${outcome.missingRequirementsEn[0] || 'Continue hunting'}`}
          </p>
        </div>
      )}
    </div>
  );
};
