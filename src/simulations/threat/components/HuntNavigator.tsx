import React from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { HUNT_SCENARIOS } from '../logic/scenarios';
import { Target, Shield, Crosshair, ChevronRight, Activity } from 'lucide-react';

interface HuntNavigatorProps {
  language: 'ar' | 'en';
}

export const HuntNavigator: React.FC<HuntNavigatorProps> = ({ language }) => {
  const activeHuntId = useThreatHuntingStore((s) => s.activeHuntId);
  const setActiveHunt = useThreatHuntingStore((s) => s.setActiveHunt);
  const hypotheses = useThreatHuntingStore((s) => s.hypotheses);
  const isAr = language === 'ar';

  const scenarios = Object.values(HUNT_SCENARIOS);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r rtl:border-r-0 rtl:border-l border-slate-900 select-none overflow-y-auto">
      {/* Navigator Header */}
      <div className="p-4 border-b border-slate-900 shrink-0">
        <div className="flex items-center gap-2 text-cyan-400">
          <Crosshair className="w-5 h-5" />
          <h2 className="text-sm font-semibold tracking-tight text-white">
            {isAr ? 'سيناريوهات صيد التهديدات' : 'Threat Hunt Scenarios'}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {isAr
            ? 'حدد مسار التحقيق لصياغة الفرضيات وتحليل السجلات واستخراج الأدلة'
            : 'Select an operational scenario to formulate hypotheses and hunt anomalies'}
        </p>
      </div>

      {/* Scenario List */}
      <div className="p-2 space-y-1.5 flex-1">
        {scenarios.map((scenario) => {
          const hunt = scenario.hunt;
          const isSelected = hunt.id === activeHuntId;
          const hyp = hypotheses[hunt.hypothesisId];
          const isMaster = hunt.id === 'HUNT-MASTER';

          return (
            <button
              key={hunt.id}
              onClick={() => setActiveHunt(hunt.id)}
              data-testid={`hunt-nav-${hunt.id}`}
              className={`w-full text-left rtl:text-right p-3 rounded-lg border transition-all relative flex flex-col gap-2 ${
                isSelected
                  ? isMaster
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200 shadow-sm'
                    : 'bg-cyan-950/30 border-cyan-500/50 text-cyan-100 shadow-sm'
                  : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:border-slate-800 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isMaster ? (
                    <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Target className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold tracking-tight truncate">
                    {isAr ? hunt.titleAr : hunt.titleEn}
                  </span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 rtl:rotate-180 transition-transform ${
                    isSelected ? 'text-cyan-400' : 'text-slate-600'
                  }`}
                />
              </div>

              {/* Metadata row */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-mono text-slate-500 uppercase tracking-wider" dir="ltr">
                  {hunt.id}
                </span>
                <span aria-hidden="true">·</span>
                <span className={isMaster ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                  {hunt.difficulty}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">
                  {hunt.dataSources.length} {isAr ? 'مصادر' : 'sources'}
                </span>
              </div>

              {/* Status banner */}
              {hyp && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hyp.status === 'SUPPORTED'
                        ? 'bg-emerald-400'
                        : hyp.status === 'REJECTED'
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-slate-400">
                    {isAr
                      ? hyp.status === 'SUPPORTED'
                        ? 'الفرضية مؤكدة'
                        : hyp.status === 'REJECTED'
                        ? 'الفرضية مرفوضة'
                        : 'الفرضية قيد الاختبار'
                      : `Hypothesis: ${hyp.status}`}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-500" />
          <span>{isAr ? 'محاكي صيد التهديدات V16' : 'Threat Hunter Engine V16'}</span>
        </div>
      </div>
    </div>
  );
};
