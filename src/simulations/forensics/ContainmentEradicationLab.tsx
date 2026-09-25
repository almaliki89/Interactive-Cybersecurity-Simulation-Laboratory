import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { CONTAINMENT_OPTIONS_CATALOG, ForensicContainmentOption } from './logic/containment';
import { ShieldCheck, AlertTriangle, Cpu, Activity, CheckCircle2 } from 'lucide-react';

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
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'معمل الاحتواء المتناسب واستئصال التهديد' : 'Containment & Eradication Tradeoffs Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'المفاضلة بين الأثر الأمني، استمرارية الأعمال، والحفاظ على الأدلة' : 'Proportional Containment: Security, Business & Forensic Tradeoffs'}
          </h1>
        </div>

        {hasDestructiveAction && (
          <div className="px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{isAr ? 'تم اختيار إجراء يدمر الذاكرة العشوائية RAM!' : 'Destructive RAM Power Off Action Selected!'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>{isAr ? 'خيارات الاحتواء والاستئصال المتاحة' : 'Defensive Containment Options Catalog'}</span>
          </h2>

          <div className="flex flex-col gap-3">
            {CONTAINMENT_OPTIONS_CATALOG.map((opt: ForensicContainmentOption) => {
              const isSelected = selectedActionIds.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleAction(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 text-xs ${
                    isSelected
                      ? opt.destroysVolatileMemory
                        ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                        : 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>{isAr ? opt.actionAr : opt.actionEn}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] mt-1 font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-cyan-400 block font-bold mb-0.5">Security Effect</span>
                      <span className="text-slate-300">{isAr ? opt.securityEffectAr : opt.securityEffectEn}</span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-amber-400 block font-bold mb-0.5">Business Impact</span>
                      <span className="text-slate-300">{isAr ? opt.businessImpactAr : opt.businessImpactEn}</span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-purple-400 block font-bold mb-0.5">Forensic Impact</span>
                      <span className="text-slate-300">{isAr ? opt.forensicImpactAr : opt.forensicImpactEn}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>{isAr ? 'تقييم خطة الاحتواء الحالية' : 'Current Containment Plan Evaluation'}</span>
          </h2>

          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">{isAr ? 'عدد الإجراءات المختارة' : 'Selected Actions Count'}</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">{selectedActionIds.length} Actions</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">{isAr ? 'تأثير حفظ الأدلة الجنائية' : 'Forensic Memory Preservation Status'}</span>
              {hasDestructiveAction ? (
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  {isAr ? 'حرج: تم تدمير ذاكرة الـ RAM بسبب الإيقاف الإجباري' : 'CRITICAL: RAM Memory destroyed by hard power off!'}
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {isAr ? 'آمن: الأدلة التطايرية محفوظة بالكامل' : 'SAFE: Volatile memory preserved cleanly.'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
