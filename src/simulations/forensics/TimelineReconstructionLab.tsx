import React, { useState, useEffect } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import { useForensicsStore } from '../../stores/forensicsStore';
import { SYNTHETIC_MASTER_TIMELINE, buildForensicTimeline, validateTimelineContinuity, ForensicTimelineEvent } from './logic/timeline';
import { History, ShieldCheck, AlertTriangle, Layers, Zap, User, Target, Database, CheckCircle2 } from 'lucide-react';

export const TimelineReconstructionLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';
  
  const selectedEvidenceId = useForensicsStore((s) => s.selectedEvidenceId);
  const setSelectedEvidenceId = useForensicsStore((s) => s.setSelectedEvidenceId);

  const [timelineEvents] = useState<ForensicTimelineEvent[]>(buildForensicTimeline(SYNTHETIC_MASTER_TIMELINE));
  const continuity = validateTimelineContinuity(timelineEvents);

  useEffect(() => {
    registerChallengeValidator('timeline-mastery-challenge', () => {
      if (continuity.continuous) {
        return { success: true, score: 100, message: 'Cross-system forensic timeline aligned and verified.' };
      }
      return { success: false, score: 0, message: 'Resolve timeline discontinuity gaps.' };
    });
    return () => {
      unregisterChallengeValidator('timeline-mastery-challenge');
    };
  }, [continuity.continuous]);

  const handleConfirmTimeline = () => {
    if (continuity.continuous) {
      completeChallenge('timeline-mastery-challenge', {
        success: true,
        score: 100,
        message: 'Cross-system forensic timeline aligned and verified.',
      });
    }
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>{isAr ? 'معمل إعادة بناء الخط الزمني للحادثة (Flagship Lab)' : 'Master Incident Timeline Reconstruction Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'دمج ومحاذاة السجلات الجنائية عبر الأنظمة' : 'CROSS_SYSTEM_MASTER_TIMELINE'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleConfirmTimeline}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-950 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isAr ? 'تأكيد التسلسل واعتماد التحدي' : 'Verify & Master Challenge'}</span>
          </button>

          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${
            continuity.continuous
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {continuity.continuous ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{continuity.continuous ? (isAr ? 'التسلسل مستمر' : 'TIMELINE_CONTINUOUS') : (isAr ? 'فجوات زمنية' : 'TIMELINE_INCOMPLETE')}</span>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
             <Layers className="w-4 h-4 text-purple-500" />
             {isAr ? 'الرواية الجنائية لمراحل الهجوم' : 'FORENSIC_ATTACK_NARRATIVE'}
           </h2>
           <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" /> {isAr ? 'حدث مؤكد' : 'CONFIRMED'}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-700" /> {isAr ? 'قيد التحقق' : 'PENDING'}</span>
           </div>
        </div>

        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-[39px] top-4 bottom-4 w-px bg-slate-800 rtl:left-auto rtl:right-[39px]" />

          {timelineEvents.map((evt) => (
            <div
              key={evt.id}
              className="relative flex items-start gap-8 group"
            >
              <div className="w-20 text-[10px] font-mono text-slate-500 pt-3 tabular-nums text-right rtl:text-left">
                T+{evt.virtualTime}ms
              </div>

              <div className="relative z-10 pt-3 shrink-0">
                 <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                 </div>
              </div>

              <div className="flex-1 space-y-3 pb-8">
                 <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between gap-4 mb-2">
                       <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 text-[9px] font-black uppercase tracking-widest">
                            {evt.category}
                          </span>
                       </div>
                       <Zap className="w-3.5 h-3.5 text-slate-700" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-200 mb-2 leading-tight">
                       {isAr ? evt.descriptionAr : evt.descriptionEn}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-mono uppercase mt-3 pt-3 border-t border-slate-900">
                       <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> sara</span>
                       <span className="flex items-center gap-1.5"><Target className="w-3 h-3" /> FIN-WS-01</span>
                    </div>
                 </div>

                 {/* Evidence Links */}
                 <div className="flex flex-wrap items-center gap-2">
                    {evt.evidenceIds.map((id) => {
                      const isSelected = selectedEvidenceId === id;
                      return (
                        <button 
                          key={id} 
                          onClick={() => setSelectedEvidenceId(id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter transition-all ${
                            isSelected 
                              ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <Database className="w-3 h-3" />
                          {id}
                        </button>
                      );
                    })}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
