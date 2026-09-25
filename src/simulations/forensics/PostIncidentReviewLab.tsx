import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { generateLessonsLearnedReport } from './logic/lessons';
import { BookOpen, ShieldCheck, FileText, Target } from 'lucide-react';

export const PostIncidentReviewLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const report = generateLessonsLearnedReport('INC-NEXORA-2026-0812', [
    'EVD-LOG-WIN-SEC',
    'EVD-MEM-FIN-WS01',
    'EVD-DISK-FIN-WS01',
    'EVD-LOG-LINUX-AUTH',
    'EVD-NET-PCAP-01',
    'EVD-BROWSER-HIST',
  ]);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>{isAr ? 'معمل مراجعة ما بعد الحادثة والدروس المستفادة' : 'Post-Incident Review & Lessons Learned Lab'}</span>
        </div>
        <h1 className="text-xl font-black text-white mt-1">
          {isAr ? 'توثيق التقرير النهائي وتحسين الضوابط الوقائية وقواعد الكشف' : 'Post-Incident Review, Root Control Improvements & SIEM Tuning'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>{isAr ? 'ملخص تحليل السبب الجذر والمسار الهجومي' : 'Root Cause & Incident Summary'}</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
            {isAr ? report.rootCauseSummaryAr : report.rootCauseSummaryEn}
          </div>

          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide mt-2">
            {isAr ? 'التحسينات الموصى بها لقواعد الكشف (SIEM Rules)' : 'Recommended Detection Engineering Improvements'}
          </h3>

          <div className="flex flex-col gap-2 text-xs font-mono">
            {(isAr ? report.detectionImprovementsAr : report.detectionImprovementsEn).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 flex items-start gap-2">
                <span className="font-bold text-cyan-500">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'الضوابط الوقائية والهيكلية المستقبليّة' : 'Preventative Architecture & Hardening Controls'}</span>
          </h2>

          <div className="flex flex-col gap-2 text-xs font-mono">
            {(isAr ? report.preventativeControlsAr : report.preventativeControlsEn).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 flex items-start gap-2">
                <span className="font-bold text-emerald-500">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mt-2">
            <span className="text-slate-500 text-xs block mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'مرجع الأدلة الجنائية المعتمدة في التقرير' : 'Referenced Forensic Evidence Items'}</span>
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              {report.evidenceReferences.map((ref) => (
                <span key={ref} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
