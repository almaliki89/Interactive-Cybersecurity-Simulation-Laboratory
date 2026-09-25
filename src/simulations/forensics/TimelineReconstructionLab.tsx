import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { SYNTHETIC_MASTER_TIMELINE, buildForensicTimeline, validateTimelineContinuity, ForensicTimelineEvent } from './logic/timeline';
import { History, ShieldCheck, AlertTriangle, Layers } from 'lucide-react';

export const TimelineReconstructionLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [timelineEvents] = useState<ForensicTimelineEvent[]>(buildForensicTimeline(SYNTHETIC_MASTER_TIMELINE));
  const continuity = validateTimelineContinuity(timelineEvents);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>{isAr ? 'معمل إعادة بناء الخط الزمني للحادثة (Flagship Lab)' : 'Master Incident Timeline Reconstruction Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'دمج ومحاذاة كافة أدلة ويندوز، لينكس، كيربيروس، والشبكة بتسلسل زمني موحد' : 'Cross-World Master Forensic Timeline Alignment'}
          </h1>
        </div>

        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
          continuity.continuous
            ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
            : 'bg-rose-950 border-rose-800 text-rose-300'
        }`}>
          {continuity.continuous ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{continuity.continuous ? (isAr ? 'الخط الزمني متسلسل ومكتمل' : 'Timeline Complete & Continuous') : (isAr ? 'مراحل مفقودة' : 'Incomplete Timeline')}</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>{isAr ? 'التسلسل الزمني الدقيق لمراحل الهجوم' : 'Chronological Master Attack Narrative'}</span>
        </h2>

        <div className="relative border-r-2 border-cyan-800/60 pr-6 mr-3 flex flex-col gap-4">
          {timelineEvents.map((evt) => (
            <div
              key={evt.id}
              className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5 text-xs font-mono"
            >
              <div className="absolute -right-[31px] top-4 w-3.5 h-3.5 rounded-full bg-cyan-500 border-2 border-slate-900 shadow-md shadow-cyan-500/50" />

              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold text-sm">T+{evt.virtualTime}ms</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{evt.category}</span>
              </div>

              <div className="text-slate-200 font-bold text-xs mt-0.5">
                {isAr ? evt.descriptionAr : evt.descriptionEn}
              </div>

              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-slate-500 text-[10px]">{isAr ? 'الأدلة المرفقة:' : 'Evidence Anchors:'}</span>
                {evt.evidenceIds.map((id) => (
                  <span key={id} className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px]">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
