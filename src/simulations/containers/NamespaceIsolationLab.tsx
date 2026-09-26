/**
 * OMEGA V14 — Linux Namespaces Isolation Interactive Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialNamespaceConfigs, evaluateNamespaceSecurity } from './logic/namespaces';
import { LinuxNamespaceConfig } from './logic/types';
import { Layers, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle, Info } from 'lucide-react';

export const NamespaceIsolationLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [namespaces, setNamespaces] = useState<LinuxNamespaceConfig[]>(getInitialNamespaceConfigs());

  const toggleIsolation = (type: string) => {
    setNamespaces((prev) =>
      prev.map((ns) => (ns.type === type ? { ...ns, isolated: !ns.isolated } : ns))
    );
  };

  const resetConfigs = () => {
    setNamespaces(getInitialNamespaceConfigs());
  };

  const evaluation = evaluateNamespaceSecurity(namespaces);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
              <Layers className="w-4 h-4" />
              <span>{isAr ? 'مختبر عزل مساحات الأسماء' : 'Linux Namespaces Isolation Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'عزل العمليات والشبكة ونظام الملفات (Namespaces Inspection)' : 'Linux Namespaces Boundary Audit'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'تحكم في عزل مساحات أسماء النواة (PID, NET, MNT, IPC, UTS, USER, CGROUP) ولاحظ الفارق بين رؤية المضيف ورؤية الحاوية.'
                : 'Toggle Linux kernel namespace isolation boundaries and inspect host vs container visibility.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? 'نقاط العزل' : 'Isolation Score'}</div>
              <div
                className={`text-2xl font-black ${
                  evaluation.securityScore >= 80
                    ? 'text-emerald-400'
                    : evaluation.securityScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {evaluation.securityScore}%
              </div>
            </div>
            <button
              onClick={resetConfigs}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isAr ? 'إعادة ضبط' : 'Reset'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Verdict Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            evaluation.unisolatedCount === 0
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : evaluation.unisolatedCount <= 2
              ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}
        >
          {evaluation.unisolatedCount === 0 ? (
            <ShieldCheck className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <div className="text-xs font-semibold">
            <span>{isAr ? evaluation.verdictAr : evaluation.verdictEn}</span>
          </div>
        </div>

        {/* Namespaces Interactive Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {namespaces.map((ns) => {
            return (
              <div
                key={ns.type}
                className={`p-4 rounded-xl border transition-all ${
                  ns.isolated
                    ? 'bg-slate-900/70 border-slate-800'
                    : 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700 uppercase">
                      {ns.type}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {ns.isolated ? (isAr ? 'معزول (Isolated)' : 'Isolated') : (isAr ? 'مشارك مع المضيف (Shared)' : 'Shared with Host')}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleIsolation(ns.type)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      ns.isolated
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                        : 'bg-rose-500 text-slate-950 hover:bg-rose-400 font-black'
                    }`}
                  >
                    {ns.isolated
                      ? isAr
                        ? 'تعطيل العزل'
                        : 'Disable Isolation'
                      : isAr
                      ? 'تفعيل العزل'
                      : 'Enforce Isolation'}
                  </button>
                </div>

                <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 flex items-start gap-1">
                    <span className="text-slate-500 font-bold">Host View:</span>
                    <span className="text-slate-300 truncate">{ns.hostValue}</span>
                  </div>
                  <div className="text-cyan-400 flex items-start gap-1">
                    <span className="text-cyan-600 font-bold">Container:</span>
                    <span className={ns.isolated ? 'text-emerald-400' : 'text-rose-400'}>
                      {ns.isolated ? ns.containerValue : ns.hostValue}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{isAr ? ns.riskDescriptionAr : ns.riskDescriptionEn}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
