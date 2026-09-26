/**
 * OMEGA V14 — Linux Capabilities & Least Privilege Interactive Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { ALL_CAPABILITIES_MAP, evaluateContainerCapabilities } from './logic/capabilities';
import { LinuxCapability } from './logic/types';
import { Lock, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export const CapabilitiesLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const defaultRetained: LinuxCapability[] = [
    'CAP_SYS_ADMIN',
    'CAP_NET_RAW',
    'CAP_NET_ADMIN',
    'CAP_SYS_PTRACE',
    'CAP_CHOWN',
    'CAP_DAC_OVERRIDE',
    'CAP_FOWNER',
    'CAP_SETUID',
  ];

  const [retainedCaps, setRetainedCaps] = useState<LinuxCapability[]>(defaultRetained);
  const [hasDropAll, setHasDropAll] = useState<boolean>(false);

  const toggleCap = (cap: LinuxCapability) => {
    if (hasDropAll) setHasDropAll(false);
    setRetainedCaps((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const handleDropAllToggle = () => {
    setHasDropAll(!hasDropAll);
    if (!hasDropAll) {
      setRetainedCaps(['CAP_NET_BIND_SERVICE']); // only keep necessary port binding
    } else {
      setRetainedCaps(defaultRetained);
    }
  };

  const evaluation = evaluateContainerCapabilities(retainedCaps, hasDropAll);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
              <Lock className="w-4 h-4" />
              <span>{isAr ? 'مختبر صلاحيات لينكس' : 'Linux Capabilities Matrix Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'إسقاط الصلاحيات الخطرة وتطبيق مبدأ أقل الامتيازات' : 'Least-Privilege Capabilities & Drop ALL Policy'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'قم بفحص صلاحيات النواة، وتخلص من CAP_SYS_ADMIN و CAP_NET_ADMIN، وافرض سياسة drop: ["ALL"].'
                : 'Audit container capability bounding sets, eliminate dangerous privileges, and enforce drop: ["ALL"].'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? 'مستوى الأمان' : 'Security Score'}</div>
              <div
                className={`text-2xl font-black ${
                  evaluation.score >= 85
                    ? 'text-emerald-400'
                    : evaluation.score >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {evaluation.score}%
              </div>
            </div>

            <button
              onClick={() => {
                setHasDropAll(false);
                setRetainedCaps(defaultRetained);
              }}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drop ALL Quick Action Banner */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white">
                {isAr ? 'تطبيق سياسة الإسقاط الشامل (capabilities.drop: ["ALL"])' : 'Enforce Drop ALL Policy (capabilities.drop: ["ALL"])'}
              </div>
              <div className="text-xs text-slate-400">
                {isAr
                  ? 'أفضل الممارسات الأمنية الموصى بها في CIS Benchmark و Kubernetes PSS Restricted'
                  : 'Gold standard container hardening posture recommended by CIS Benchmarks and K8s PSS'}
              </div>
            </div>
          </div>

          <button
            onClick={handleDropAllToggle}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              hasDropAll
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
            }`}
          >
            {hasDropAll ? (isAr ? 'مفعلة (DROP ALL)' : 'Active (DROP ALL)') : (isAr ? 'تفعيل DROP ALL' : 'Enforce DROP ALL')}
          </button>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(ALL_CAPABILITIES_MAP).map((cap) => {
            const isRetained = hasDropAll ? retainedCaps.includes(cap.name) : retainedCaps.includes(cap.name);

            return (
              <div
                key={cap.name}
                onClick={() => toggleCap(cap.name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isRetained
                    ? cap.isDangerous
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                      : 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-100 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {isRetained ? (
                      cap.isDangerous ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className="font-mono font-bold text-xs text-white truncate">{cap.name}</span>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      cap.isDangerous
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cap.isDangerous ? 'Dangerous' : 'Standard'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {isAr ? cap.descriptionAr : cap.descriptionEn}
                </p>

                {isRetained && cap.isDangerous && (
                  <div className="mt-2 pt-2 border-t border-rose-900/30 text-[10px] text-rose-400">
                    <span className="font-bold">خطر الاستغلال: </span>
                    <span>{isAr ? cap.exploitVectorAr : cap.exploitVectorEn}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
