import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  validateForensicInvestigationState,
  ForensicsMasterState,
  getInitialForensicsChallengeState,
} from './logic/hardening';
import { createDefaultForensicsCase } from './logic/evidence';
import { Award, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, RotateCcw, ClipboardCheck, LayoutDashboard } from 'lucide-react';

export const ForensicsMasterChallenge: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const defaultCase = createDefaultForensicsCase(0);

  const [state, setState] = useState<ForensicsMasterState>(getInitialForensicsChallengeState());

  const valResult = validateForensicInvestigationState(state);

  const resetState = () => {
    setState(getInitialForensicsChallengeState());
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'لوحة جاهزية إغلاق القضية' : 'Case Readiness & Closure Dashboard'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? `ضوابط جودة التحقيق الجنائي (${defaultCase.id})` : `INVESTIGATION_QUALITY_CONTROLS: ${defaultCase.id}`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetState}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className={`px-4 py-2 rounded-2xl border text-sm font-black flex items-center gap-2 transition-all ${
            valResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
          }`}>
            {valResult.success ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{valResult.score}/100 PTS</span>
            <span className="opacity-40 font-mono mx-1">|</span>
            <span>{valResult.success ? (isAr ? 'جاهز للإغلاق' : 'CASE_READY_FOR_CLOSURE') : (isAr ? 'قيد التحقيق' : 'INVESTIGATION_PENDING')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
               <ClipboardCheck className="w-4 h-4" />
               {isAr ? 'تدقيق ضوابط التحقيق' : 'INVESTIGATION_CONTROL_AUDIT'}
             </h2>
             <span className="text-[9px] font-mono text-slate-600 uppercase">
               {valResult.passedChecks.length} / {valResult.checkDetails.length} {isAr ? 'ضوابط مكتملة' : 'CONTROLS_MET'}
             </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {valResult.checkDetails.map((chk) => (
              <div
                key={chk.id}
                className={`p-4 rounded-2xl border transition-all ${
                  chk.passed
                    ? 'bg-slate-900/40 border-slate-800 text-slate-200'
                    : 'bg-rose-500/5 border-rose-500/10 text-rose-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${chk.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                       {chk.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight">{isAr ? chk.nameAr : chk.nameEn}</span>
                  </div>
                  <span className={`font-mono text-[10px] font-black ${chk.passed ? 'text-emerald-500' : 'text-rose-500/60'}`}>
                    +{chk.score} PTS
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pl-10 italic">
                  {isAr ? chk.feedbackAr : chk.feedbackEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
           <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                {isAr ? 'ملخص جاهزية الملف' : 'CASE_HEALTH_SUMMARY'}
              </h2>
              
              <div className="space-y-4">
                 <HealthIndicator label={isAr ? 'سلامة الأدلة' : 'EVIDENCE_INTEGRITY'} value={valResult.score > 20 ? 100 : 0} />
                 <HealthIndicator label={isAr ? 'توثيق الحضانة' : 'CHAIN_OF_CUSTODY'} value={valResult.score > 40 ? 100 : 0} />
                 <HealthIndicator label={isAr ? 'محاذاة الخط الزمني' : 'TIMELINE_ALIGNMENT'} value={valResult.score > 60 ? 100 : 0} />
                 <HealthIndicator label={isAr ? 'إسناد السبب الجذر' : 'ROOT_CAUSE_ATTRIBUTION'} value={valResult.score > 80 ? 100 : 0} />
              </div>

              <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 italic leading-relaxed">
                 {isAr 
                   ? 'يجب استيفاء كافة الضوابط الفنية لضمان قبول الأدلة قانونياً وإغلاق القضية بشكل نهائي.'
                   : 'All technical controls must be satisfied to ensure evidentiary admissibility and final case closure.'}
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                 <Award className="w-6 h-6 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
              </div>
              <div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">{isAr ? 'شهادة خبير جنائي' : 'FORENSIC_EXPERT_ACCREDITATION'}</h3>
                 <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">Complete the investigation to unlock</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const HealthIndicator: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="space-y-1.5">
     <div className="flex items-center justify-between text-[9px] font-mono font-black text-slate-500 uppercase tracking-tighter">
        <span>{label}</span>
        <span className={value === 100 ? 'text-emerald-500' : 'text-slate-700'}>{value}%</span>
     </div>
     <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900/50">
        <div 
          className={`h-full transition-all duration-1000 ${value === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800'}`} 
          style={{ width: `${value}%` }} 
        />
     </div>
  </div>
);
