/**
 * OMEGA V15 — Software Bill of Materials (SBOM) CycloneDX Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getSampleSbomComponents } from './logic/sbom';
import { SbomComponent } from './logic/types';
import { Layers, Download, CheckCircle2 } from 'lucide-react';

export const SbomInventoryLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [components] = useState<SbomComponent[]>(getSampleSbomComponents());

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs mb-1">
              <Layers className="w-4 h-4" />
              <span>{isAr ? 'مختبر جرد مكونات البرمجيات (CycloneDX SBOM)' : 'Software Bill of Materials (SBOM) Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'توليد وتصدير قائمة SBOM الموحدة للبيئات التجارية' : 'CycloneDX / SPDX SBOM Component Inventory Graph'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'استعرض جرد المكونات البرمجية والترخيص والتوقيعات بصيغة CycloneDX المعتمدة.'
                : 'Inspect complete software dependency trees, PURLs, hashes, and licenses for regulatory compliance.'}
            </p>
          </div>

          <button className="px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير CycloneDX JSON' : 'Export CycloneDX SBOM'}</span>
          </button>
        </div>

        {/* Components Table */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-12 text-slate-400 font-bold border-b border-slate-800 pb-2">
            <div className="col-span-4">Package PURL</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">License</div>
            <div className="col-span-4">Supplier</div>
          </div>

          {components.map((c) => (
            <div key={c.id} className="grid grid-cols-12 text-slate-200 border-b border-slate-800/60 py-2">
              <div className="col-span-4 text-violet-300 font-bold truncate">{c.purl}</div>
              <div className="col-span-2">{c.type}</div>
              <div className="col-span-2 text-emerald-400 font-bold">{c.license}</div>
              <div className="col-span-4 text-slate-400">{c.supplier}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
