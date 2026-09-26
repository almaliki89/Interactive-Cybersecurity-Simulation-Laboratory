/**
 * OMEGA V15 — Software Composition Analysis (SCA) & License Compliance Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialDependencies, scanScaDependencies } from './logic/sca';
import { ScaDependency } from './logic/types';
import { Box, ShieldCheck, AlertTriangle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export const ScaDependencyLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [dependencies, setDependencies] = useState<ScaDependency[]>(getInitialDependencies());

  const scan = scanScaDependencies(dependencies);

  const updatePackage = (id: string) => {
    setDependencies((prev) =>
      prev.map((d) => (d.id === id ? { ...d, remediated: true, licenseCompliant: true } : d))
    );
  };

  const updateAll = () => {
    setDependencies((prev) => prev.map((d) => ({ ...d, remediated: true, licenseCompliant: true })));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
              <Box className="w-4 h-4" />
              <span>{isAr ? 'مختبر فحص التبعيات وتراخيص البرمجيات (SCA)' : 'Software Composition Analysis (SCA) Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'حظر البرمجيات الخبيثة الانتحالية وتحديث المكتبات' : 'Audit Third-Party Dependencies, Typosquatting & Licenses'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'افحص حزم npm المضمنة، واكشف الهجمات الانتحالية (Typosquatting) وترخيص AGPL الوراثي.'
                : 'Audit package manifest dependencies for known CVEs, malicious typosquats, and license compliance.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? 'درجة أمان التبعيات' : 'SCA Score'}</div>
              <div
                className={`text-2xl font-black ${
                  scan.scaScore >= 80
                    ? 'text-emerald-400'
                    : scan.scaScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {scan.scaScore}%
              </div>
            </div>

            <button
              onClick={updateAll}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحديث وتطهير كافة الحزم' : 'Remediate All Packages'}</span>
            </button>

            <button
              onClick={() => setDependencies(getInitialDependencies())}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dependencies.map((dep) => (
            <div
              key={dep.id}
              className={`p-4 rounded-xl border transition-all ${
                dep.remediated
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs text-white">{dep.packageName}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                    dep.remediated
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : dep.isTyposquatting
                      ? 'bg-rose-500 text-slate-950 font-black'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {dep.remediated ? 'SAFE' : dep.severity}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 mb-2">
                Version: <span className="text-rose-400">{dep.currentVersion}</span> → Patch:{' '}
                <span className="text-emerald-400 font-bold">{dep.patchedVersion}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {isAr ? dep.descriptionAr : dep.descriptionEn}
              </p>

              {!dep.remediated && (
                <button
                  onClick={() => updatePackage(dep.id)}
                  className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'استبدال وتحديث الحزمة' : 'Update & Patch Package'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
