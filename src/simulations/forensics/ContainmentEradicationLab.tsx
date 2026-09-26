import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { CONTAINMENT_OPTIONS_CATALOG, ForensicContainmentOption } from './logic/containment';
import { ShieldCheck, AlertTriangle, Cpu, Activity, CheckCircle2, Zap, LayoutGrid } from 'lucide-react';

export const ContainmentEradicationLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([
    'ACT-ISOLATE-NETWORK',
    'ACT-REVOKE-SARA-SESSIONS',
    'ACT-REVERT-PRIVILEGE',
  ]);

  const toggleAction = (id: string) => {
    if (selectedActionIds.includes(id)) {
      setSelectedActionIds(selectedActionIds.filter((a) => a !== id));
    } else {
      setSelectedActionIds([...selectedActionIds, id]);
    }
  };

  const hasDestructiveAction = selectedActionIds.includes('ACT-POWER-OFF');

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'معمل الاحتواء المتناسب واستئصال التهديد' : 'Containment & Eradication Tradeoffs Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'المفاضلة بين الأثر الأمني والحفاظ على الأدلة' : 'PROPORTIONAL_RESPONSE_&_CONTAINMENT'}
          </h1>
        </div>

        {hasDestructiveAction && (
          <div className="px-4 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span>{isAr ? 'تحذير: تدمير الأدلة التطايرية!' : 'EVIDENTIARY_DESTRUCTION_WARNING'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              {isAr ? 'كتالوج إجراءات الاستجابة' : 'RESPONSE_ACTION_CATALOG'}
            </h2>
            <span className="text-[9px] font-mono text-slate-600 uppercase">
              {selectedActionIds.length} {isAr ? 'إجراءات مختارة' : 'ACTIVE_ACTIONS'}
            </span>
          </div>

          <div className="space-y-3">
            {CONTAINMENT_OPTIONS_CATALOG.map((opt: ForensicContainmentOption) => {
              const isSelected = selectedActionIds.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleAction(opt.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 group relative overflow-hidden ${
                    isSelected
                      ? opt.destroysVolatileMemory
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                        : 'bg-cyan-500/10 border-cyan-500/50 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-black uppercase tracking-tight">
                    <span className="text-xs">{isAr ? opt.actionAr : opt.actionEn}</span>
                    {isSelected && <CheckCircle2 className={`w-4 h-4 ${opt.destroysVolatileMemory ? 'text-rose-400' : 'text-cyan-400'} shrink-0`} />}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <ImpactField 
                      label="SECURITY" 
                      value={isAr ? opt.securityEffectAr : opt.securityEffectEn} 
                      color={isSelected ? (opt.destroysVolatileMemory ? 'text-rose-300' : 'text-cyan-300') : 'text-slate-500'} 
                    />
                    <ImpactField 
                      label="BUSINESS" 
                      value={isAr ? opt.businessImpactAr : opt.businessImpactEn} 
                      color="text-amber-400/80" 
                    />
                    <ImpactField 
                      label="FORENSIC" 
                      value={isAr ? opt.forensicImpactAr : opt.forensicImpactEn} 
                      color="text-purple-400/80" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'تقييم خطة الاحتواء' : 'CONTAINMENT_PLAN_EVALUATION'}</span>
            </h2>

            <div className="space-y-4">
               <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{isAr ? 'وضعية سلامة الذاكرة' : 'FORENSIC_MEMORY_STATUS'}</span>
                    {hasDestructiveAction ? (
                      <div className="flex items-center gap-2 text-rose-400 font-black text-[10px] uppercase">
                        <AlertTriangle className="w-4 h-4" />
                        {isAr ? 'تحذير: تم تدمير الأدلة التطايرية' : 'CRITICAL: VOLATILE_EVIDENCE_DESTROYED'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase">
                        <ShieldCheck className="w-4 h-4" />
                        {isAr ? 'آمن: الأدلة محفوظة' : 'SAFE: VOLATILE_INTEGRITY_MAINTAINED'}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-900">
                     <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-2">{isAr ? 'التغطية الأمنية' : 'SECURITY_COVERAGE'}</span>
                     <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                          style={{ width: `${Math.min(100, selectedActionIds.length * 33)}%` }} 
                        />
                     </div>
                  </div>
               </div>

               <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-[10px] text-slate-500 italic leading-relaxed">
                  {isAr 
                    ? 'الهدف من الاحتواء هو عزل المهاجم بأقل قدر ممكن من التعطيل للأعمال، مع الحفاظ على الأصول الرقمية للتحقيق.'
                    : 'The goal of containment is to isolate the threat with minimum business disruption while preserving digital assets for deep investigation.'}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImpactField: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col gap-1">
     <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">{label}</span>
     <span className={`text-[9px] font-bold leading-tight ${color} uppercase`}>{value}</span>
  </div>
);
