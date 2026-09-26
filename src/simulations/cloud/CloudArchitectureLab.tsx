/**
 * OMEGA V13 — Cloud Security World
 * CloudArchitectureLab.tsx
 *
 * Interactive Cloud Security Architecture & Well-Architected Framework Lab.
 * Explores Hub-and-Spoke Transit Networks, Zero Trust Identity Perimeters,
 * and Multi-Layer Defense-in-Depth.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { createDefaultCloudArchitectures, CloudBlueprint } from './logic/architecture';
import { Layers, Shield, CheckCircle2, Network, ArrowRight, Check } from 'lucide-react';

export const CloudArchitectureLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [blueprints] = useState<CloudBlueprint[]>(createDefaultCloudArchitectures());
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(blueprints[0].id);

  const selectedBlueprint = blueprints.find((b) => b.id === selectedBlueprintId) || blueprints[0];

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <Layers className="w-4 h-4" />
            <span>CLOUD WELL-ARCHITECTED SECURITY PILLAR</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر المعمارية السحابية المحصنة (Reference Architectures)' : 'Cloud Security Architecture Blueprints Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'دراسة المعماريات المرجعية لحماية المؤسسات السحابية: شبكات Hub & Spoke مع Transit Gateway، ومحيط انعدام الثقة القائم على الهوية.'
              : 'Explore battle-tested reference cloud architectures: Hub-and-Spoke VPC inspection, Transit Gateways, and Identity-First Zero Trust.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Blueprints Selector */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-300">
            {isAr ? 'المخططات المعمارية المرجعية' : 'Architectural Blueprints'}
          </span>

          <div className="flex flex-col gap-2">
            {blueprints.map((bp) => {
              const isSelected = bp.id === selectedBlueprintId;
              return (
                <div
                  key={bp.id}
                  onClick={() => setSelectedBlueprintId(bp.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-1">
                    {isAr ? bp.nameAr : bp.nameEn}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {isAr ? bp.descriptionAr : bp.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Architecture Diagram & Control Layers */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* ASCII Diagram Viewer */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-cyan-400">
                {isAr ? selectedBlueprint.nameAr : selectedBlueprint.nameEn}
              </h3>
              <span className="text-[10px] font-mono text-slate-500">{selectedBlueprint.category}</span>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-tight">
              {selectedBlueprint.diagramAscii}
            </pre>
          </div>

          {/* Key Architectural Benefits */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'المزايا الأمنية للنموذج' : 'Key Security Benefits'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(isAr ? selectedBlueprint.keyBenefitsAr : selectedBlueprint.keyBenefitsEn).map((benefit, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold block mb-1">Benefit #{i + 1}</span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Defense-in-Depth Layers */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex-1 flex flex-col">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'طبقات الدفاع المتعمق (Defense-in-Depth Layers)' : 'Defense-in-Depth Control Layers'}</span>
            </h4>

            <div className="flex flex-col gap-3">
              {selectedBlueprint.layers.map((layer) => (
                <div key={layer.layerId} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-cyan-400 font-bold">
                      Layer {layer.layerId}: {isAr ? layer.nameAr : layer.nameEn}
                    </span>
                    <span className="text-[10px] text-slate-500">{layer.focusArea}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {layer.controls.map((ctrl, cIdx) => (
                      <div key={cIdx} className="flex items-center justify-between text-[11px]">
                        <span className="text-white font-bold">{isAr ? ctrl.nameAr : ctrl.nameEn}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {ctrl.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
