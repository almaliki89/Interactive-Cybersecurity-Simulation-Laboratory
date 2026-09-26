import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useForensicsStore } from '../../stores/forensicsStore';
import { generateLessonsLearnedReport } from './logic/lessons';
import { BookOpen, ShieldCheck, FileText, Target, Database } from 'lucide-react';

export const PostIncidentReviewLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const evidence = useForensicsStore((s) => s.evidence);

  const report = generateLessonsLearnedReport('INC-NEXORA-2026-0812', evidence.map(e => e.id));

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>{isAr ? 'معمل مراجعة ما بعد الحادثة والدروس المستفادة' : 'Post-Incident Review & Lessons Learned Lab'}</span>
        </div>
        <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
          {isAr ? 'توثيق التقرير النهائي وتحسين الضوابط' : 'FINAL_CASE_SUMMARY_&_LESSONS_LEARNED'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
          <section className="space-y-3">
            <h2 className="text-sm font-black text-cyan-400 uppercase tracking-wide flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{isAr ? 'ملخص تحليل السبب الجذر والمسار الهجومي' : 'Root Cause & Incident Summary'}</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono italic bg-black/20">
              {isAr ? report.rootCauseSummaryAr : report.rootCauseSummaryEn}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAr ? 'تحسينات هندسة الكشف (Detection Engineering)' : 'DETECTION_ENGINEERING_REFINEMENTS'}
            </h3>
            <div className="space-y-2">
              {(isAr ? report.detectionImprovementsAr : report.detectionImprovementsEn).map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-200/80 flex items-start gap-3 text-[11px] font-mono">
                  <span className="text-cyan-500 mt-0.5">»</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
          <section className="space-y-3">
            <h2 className="text-sm font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'الضوابط الوقائية وتحصين الهيكلية' : 'Security Posture Hardening'}</span>
            </h2>
            <div className="space-y-2">
              {(isAr ? report.preventativeControlsAr : report.preventativeControlsEn).map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-200/80 flex items-start gap-3 text-[11px] font-mono">
                  <span className="text-emerald-500 mt-0.5">»</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              {isAr ? 'الأدلة الجنائية الموثقة بالتقرير' : 'EVIDENTIARY_REFERENCES'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.evidenceReferences.map((ref) => (
                <span key={ref} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[9px] font-black uppercase">
                  {ref}
                </span>
              ))}
              {report.evidenceReferences.length === 0 && (
                <span className="text-[10px] text-slate-600 italic uppercase">{isAr ? 'لا توجد مراجع' : 'No evidentiary links found'}</span>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
