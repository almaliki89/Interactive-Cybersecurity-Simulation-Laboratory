import React, { useState } from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { Eye, Shield, Users, Tag, AlertTriangle, CheckCircle2, ChevronRight, Activity, Globe } from 'lucide-react';
import { ThreatIntelIndicator } from '../logic/types';

interface ThreatIntelPanelProps {
  language: 'ar' | 'en';
}

export const ThreatIntelPanel: React.FC<ThreatIntelPanelProps> = ({ language }) => {
  const intelIndicators = useThreatHuntingStore((s) => s.intelIndicators);
  const threatActors = useThreatHuntingStore((s) => s.threatActors);
  const selectEvent = useThreatHuntingStore((s) => s.selectEvent);
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'INDICATORS' | 'ACTORS'>('INDICATORS');
  const [selectedIndicator, setSelectedIndicator] = useState<ThreatIntelIndicator | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 select-none overflow-hidden">
      {/* Header & Sub-nav */}
      <div className="p-3 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('INDICATORS')}
            data-testid="tab-intel-indicators"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'INDICATORS' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isAr ? 'مؤشرات التهديد (IOC / IOA)' : 'Indicators (IOC / IOA)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('ACTORS')}
            data-testid="tab-intel-actors"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'ACTORS' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isAr ? 'ملفات مجموعات التهديد' : 'Threat Actor Profiles'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-cyan-500" />
          <span>{isAr ? 'قاعدة استخبارات المحاكاة الأمنية' : 'Simulation Threat Intelligence Layer'}</span>
        </div>
      </div>

      {/* Main Intel Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'INDICATORS' ? (
          <div className="max-w-4xl mx-auto space-y-3">
            {intelIndicators.map((indicator) => {
              const matchCount = indicator.matchedEventIds?.length || 0;
              const isSelected = selectedIndicator?.id === indicator.id;

              return (
                <div
                  key={indicator.id}
                  onClick={() => setSelectedIndicator(isSelected ? null : indicator)}
                  data-testid={`intel-card-${indicator.id}`}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800" dir="ltr">
                        {indicator.type}
                      </span>
                      <h4 className="text-xs font-bold text-white tracking-tight">
                        {isAr ? indicator.titleAr : indicator.titleEn}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 tabular-nums" dir="ltr">
                        {matchCount} {isAr ? 'مطابقات سجلات' : 'telemetry matches'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          indicator.confidence === 'HIGH'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {indicator.confidence}
                      </span>
                    </div>
                  </div>

                  {/* Indicator Value */}
                  <div className="font-mono text-xs text-amber-300 bg-black/60 p-2 rounded border border-slate-800 break-all" dir="ltr">
                    {indicator.value}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? indicator.descriptionAr : indicator.descriptionEn}
                  </p>

                  {/* MITRE ATT&CK & Tags */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800/60 text-[11px]">
                    {indicator.mitreTechniques.map((ttp, idx) => (
                      <span key={idx} className="font-mono text-slate-400" dir="ltr">
                        {ttp}
                      </span>
                    ))}
                    {indicator.actorName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-cyan-400 font-semibold">{indicator.actorName}</span>
                      </>
                    )}
                  </div>

                  {/* Matched Events Preview */}
                  {isSelected && matchCount > 0 && (
                    <div className="mt-2 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <h5 className="text-[11px] font-semibold text-slate-400">
                        {isAr ? 'الأحداث المطابقة لهذا المؤشر في السجلات:' : 'Matched Telemetry Events:'}
                      </h5>
                      <div className="space-y-1">
                        {indicator.matchedEventIds?.map((evtId) => (
                          <button
                            key={evtId}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectEvent(evtId);
                            }}
                            className="w-full text-left rtl:text-right p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-xs font-mono text-slate-300 flex items-center justify-between"
                          >
                            <span dir="ltr">{evtId}</span>
                            <span className="text-[10px] text-cyan-400 font-sans">{isAr ? 'معاينة الحدث' : 'Inspect'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Threat Actors Dossiers */
          <div className="max-w-4xl mx-auto space-y-4">
            {threatActors.map((actor) => (
              <div
                key={actor.id}
                className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight" dir="ltr">
                        {actor.name}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {isAr ? 'الأسماء المستعارة:' : 'Aliases:'} {actor.aliases.join(', ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {actor.activeCampaign}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">{isAr ? 'الدوافع والأهداف:' : 'Motivation & Targets:'}</strong>
                  {isAr ? actor.motivationAr : actor.motivationEn}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {isAr ? 'التقنيات والتكتيكات المتبعة (MITRE ATT&CK):' : 'Observed TTPs:'}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {actor.ttps.map((ttp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300"
                        dir="ltr"
                      >
                        {ttp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
