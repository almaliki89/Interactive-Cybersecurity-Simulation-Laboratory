/**
 * OMEGA V15 — Infrastructure Drift Detection Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { InfrastructureDriftFinding } from './logic/types';
import { GitBranch, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';

export const DriftDetectionLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const drifts = useDevSecOpsStore((s) => s.masterState.driftFindings);
  const setMasterState = useDevSecOpsStore((s) => s.setMasterState);

  const remediateDrift = (id: string) => {
    setMasterState((state) => {
      state.driftFindings = state.driftFindings.map((d) =>
        d.resourceId === id ? { ...d, autoRemediated: true } : d
      );
    });
  };

  const resetLab = () => {
    setMasterState((state) => {
      state.driftFindings = state.driftFindings.map((d) => ({ ...d, autoRemediated: false }));
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
              <GitBranch className="w-4 h-4" />
              <span>{isAr ? 'مختبر رصد انحراف البنية التحتية (Drift Detection)' : 'Infrastructure Drift Detection Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'كشف التغييرات اليدوية وإعادة المزامن مع Terraform' : 'Cloud Console Drift Detection & Auto-Remediation'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'قارن بين الحالة الحية للسحابة وبين حالة Terraform المصرح بها وأعد التكييف تلقائياً.'
                : 'Detect out-of-band AWS console modifications bypassing GitOps and auto-remediate.'}
            </p>
          </div>

          <button
            onClick={resetLab}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Drift Items */}
        <div className="space-y-3">
          {drifts.map((d) => (
            <div
              key={d.resourceId}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                d.autoRemediated
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white">{d.resourceId}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.autoRemediated
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {d.autoRemediated ? 'REMEDIATED' : d.driftType}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] font-bold mb-1">Terraform Expected State:</div>
                  <div className="text-emerald-400">{d.expectedTerraformState}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] font-bold mb-1">Live Cloud Console State:</div>
                  <div className="text-rose-400">{d.actualCloudLiveState}</div>
                </div>
              </div>

              {!d.autoRemediated && (
                <button
                  onClick={() => remediateDrift(d.resourceId)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'إعادة المزامنة وإلغاء التعديل اليدوي' : 'Re-sync & Overwrite Manual Drift'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
