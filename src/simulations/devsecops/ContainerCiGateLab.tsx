/**
 * OMEGA V15 — CI Container Build Scanner (Trivy) Lab
 */

import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { Lock, ShieldCheck } from 'lucide-react';

export const ContainerCiGateLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'مختبر فحص الحاويات أثناء البناء' : 'CI Container Build Scanner (Trivy) Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white">
            {isAr ? 'دمج فحص Trivy في خطوط CI/CD وحظر الصور الضارة' : 'Build-Time Container CVE Gates & Immutable Tags'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {isAr
              ? 'افحص صور الحاويات أثناء مرحلة docker build وامنع رفع الصور التي تحتوي ثغرات حرج لـ Container Registry.'
              : 'Enforce Trivy build-time vulnerability scanners before pushing OCI image tags to production registries.'}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400">
          ✓ Trivy Container Scanner Integrated into GitHub Actions CI Runner (Exit Code 1 on Critical CVEs).
        </div>
      </div>
    </div>
  );
};
