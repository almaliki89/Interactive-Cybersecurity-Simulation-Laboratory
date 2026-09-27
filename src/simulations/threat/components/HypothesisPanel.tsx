import React from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { Lightbulb, CheckCircle2, XCircle, AlertCircle, ArrowRight, Layers, Radio } from 'lucide-react';

interface HypothesisPanelProps {
  language: 'ar' | 'en';
}

export const HypothesisPanel: React.FC<HypothesisPanelProps> = ({ language }) => {
  const activeHuntId = useThreatHuntingStore((s) => s.activeHuntId);
  const hunts = useThreatHuntingStore((s) => s.hunts);
  const hypotheses = useThreatHuntingStore((s) => s.hypotheses);
  const updateHypothesisStatus = useThreatHuntingStore((s) => s.updateHypothesisStatus);
  const setActiveTab = useThreatHuntingStore((s) => s.setActiveTab);

  const isAr = language === 'ar';
  const hunt = hunts[activeHuntId];
  const hypothesis = hunt ? hypotheses[hunt.hypothesisId] : null;

  if (!hunt || !hypothesis) {
    return (
      <div className="p-8 text-center text-slate-500">
        {isAr ? 'لم يتم تحديد فرضية نشطة' : 'No active hypothesis selected'}
      </div>
    );
  }

  const handleSupport = () => {
    updateHypothesisStatus(
      'SUPPORTED',
      'Telemetry exploration revealed anomalous signals matching the behavioral pattern.',
      'أظهر استكشاف السجلات إشارات شاذة تطابق النمط السلوكي المفترض.'
    );
  };

  const handleReject = () => {
    updateHypothesisStatus(
      'REJECTED',
      'Telemetry disproves the hypothesis; observed activity is benign baseline traffic.',
      'تدحض السجلات الفرضية؛ حيث تبين أن النشاط المرصود يمثل حركة مرور قياسية وسليمة.'
    );
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-4xl mx-auto w-full gap-6">
      {/* Title section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-cyan-400">
          <Lightbulb className="w-5 h-5" />
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400" dir="ltr">
            {hypothesis.id}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-xs text-slate-400">{isAr ? 'صياغة وتقييم الفرضية' : 'Hypothesis Formulation'}</span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          {isAr ? hypothesis.titleAr : hypothesis.titleEn}
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          {isAr ? hypothesis.descriptionAr : hypothesis.descriptionEn}
        </p>
      </div>

      {/* Behavioral Scope Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Behavior */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'السلوك المشبوه المستهدف' : 'Targeted Suspicious Behavior'}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAr ? hypothesis.behaviorAr : hypothesis.behaviorEn}
          </p>
        </div>

        {/* Scope */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'نطاق التحقيق والأنظمة' : 'Investigation Scope & Systems'}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAr ? hypothesis.scopeAr : hypothesis.scopeEn}
          </p>
        </div>
      </div>

      {/* Expected Telemetry Signals */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-slate-200">
          {isAr ? 'الإشارات والمؤشرات المتوقعة في السجلات' : 'Expected Telemetry Signals'}
        </h3>
        <ul className="space-y-2">
          {(isAr ? hypothesis.expectedSignalsAr : hypothesis.expectedSignalsEn).map((signal, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Required Data Sources */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400">{isAr ? 'مصادر البيانات المطلوبة:' : 'Required Data Sources:'}</span>
        {hypothesis.requiredSources.map((source) => (
          <span
            key={source}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400"
            dir="ltr"
          >
            {source}
          </span>
        ))}
      </div>

      {/* Evaluation & Status Action Area */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              {isAr ? 'حالة تقييم الفرضية:' : 'Hypothesis Status:'}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                hypothesis.status === 'SUPPORTED'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : hypothesis.status === 'REJECTED'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {isAr
                ? hypothesis.status === 'SUPPORTED'
                  ? 'مؤكدة بالأدلة'
                  : hypothesis.status === 'REJECTED'
                  ? 'مرفوضة'
                  : 'قيد التحقيق والبحث'
                : hypothesis.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSupport}
              data-testid="btn-support-hypothesis"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تأكيد الفرضية' : 'Support Hypothesis'}</span>
            </button>
            <button
              onClick={handleReject}
              data-testid="btn-reject-hypothesis"
              className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{isAr ? 'رفض الفرضية' : 'Reject Hypothesis'}</span>
            </button>
          </div>
        </div>

        {hypothesis.validationReasonEn && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>{isAr ? hypothesis.validationReasonAr : hypothesis.validationReasonEn}</p>
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('TELEMETRY')}
            data-testid="btn-goto-telemetry"
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <span>{isAr ? 'الانتقال لاستكشاف السجلات' : 'Proceed to Telemetry Explorer'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
