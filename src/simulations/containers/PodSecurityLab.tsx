/**
 * OMEGA V14 — Pod Security Standards (PSS) & SecurityContext Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { evaluatePodSecurityStandard } from './logic/podSecurity';
import { getInitialClusterPods } from './logic/networkPolicies';
import { KubernetesPod } from './logic/types';
import { Shield, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

export const PodSecurityLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [pods, setPods] = useState<KubernetesPod[]>(getInitialClusterPods());
  const [selectedPodId, setSelectedPodId] = useState<string>('pod-frontend-web');

  const selectedPod = pods.find((p) => p.id === selectedPodId) || pods[0];
  const pssEval = evaluatePodSecurityStandard(selectedPod);

  const updateSelectedPodSecurityContext = (patch: Partial<typeof selectedPod.securityContext>) => {
    setPods((prev) =>
      prev.map((p) =>
        p.id === selectedPod.id
          ? { ...p, securityContext: { ...p.securityContext, ...patch } }
          : p
      )
    );
  };

  const applyRestrictedProfile = () => {
    updateSelectedPodSecurityContext({
      privileged: false,
      runAsNonRoot: true,
      runAsUser: 10001,
      readOnlyRootFilesystem: true,
      allowPrivilegeEscalation: false,
      capabilitiesDrop: ['CAP_SYS_ADMIN', 'CAP_NET_RAW', 'CAP_NET_ADMIN'],
      capabilitiesAdd: [],
      seccompProfile: 'RuntimeDefault',
      appArmorProfile: 'docker-default',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <Shield className="w-4 h-4" />
              <span>{isAr ? 'مختبر معايير أمان الحزم (Pod Security Standards)' : 'Pod Security Standards & Context Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'تطبيق مستوى PSS Restricted وإلغاء صلاحيات Root' : 'Enforce Restricted PSS Profile & SecurityContext'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'قيم مستوى الحزمة (Privileged vs Baseline vs Restricted) وافرض runAsNonRoot و readOnlyRootFilesystem.'
                : 'Audit Pod Security Standards compliance and harden container SecurityContext settings.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={applyRestrictedProfile}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'فرض مستوى Restricted' : 'Apply Restricted Profile'}</span>
            </button>

            <button
              onClick={() => setPods(getInitialClusterPods())}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pod Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {pods.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPodId(p.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                selectedPodId === p.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Current Pod Evaluation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Controls Toggle Panel */}
          <div className="md:col-span-6 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isAr ? 'إعدادات SecurityContext للحزمة:' : 'Pod SecurityContext Configuration:'}
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="font-mono text-slate-200">runAsNonRoot:</span>
                <input
                  type="checkbox"
                  checked={selectedPod.securityContext.runAsNonRoot}
                  onChange={(e) => updateSelectedPodSecurityContext({ runAsNonRoot: e.target.checked, runAsUser: e.target.checked ? 10001 : 0 })}
                  className="accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="font-mono text-slate-200">readOnlyRootFilesystem:</span>
                <input
                  type="checkbox"
                  checked={selectedPod.securityContext.readOnlyRootFilesystem}
                  onChange={(e) => updateSelectedPodSecurityContext({ readOnlyRootFilesystem: e.target.checked })}
                  className="accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="font-mono text-slate-200">allowPrivilegeEscalation:</span>
                <input
                  type="checkbox"
                  checked={selectedPod.securityContext.allowPrivilegeEscalation}
                  onChange={(e) => updateSelectedPodSecurityContext({ allowPrivilegeEscalation: e.target.checked })}
                  className="accent-rose-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="font-mono text-slate-200">privileged:</span>
                <input
                  type="checkbox"
                  checked={selectedPod.securityContext.privileged}
                  onChange={(e) => updateSelectedPodSecurityContext({ privileged: e.target.checked })}
                  className="accent-rose-500"
                />
              </label>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-mono text-slate-200">seccompProfile:</span>
                <select
                  value={selectedPod.securityContext.seccompProfile}
                  onChange={(e) => updateSelectedPodSecurityContext({ seccompProfile: e.target.value as any })}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="Unconfined">Unconfined</option>
                  <option value="RuntimeDefault">RuntimeDefault</option>
                  <option value="CustomRestricted">CustomRestricted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Standards Status & Recommendations */}
          <div className="md:col-span-6 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'مستوى الامتثال المحقق:' : 'Current Compliance Level:'}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                  pssEval.level === 'Restricted'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : pssEval.level === 'Baseline'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                PSS: {pssEval.level}
              </span>
            </div>

            {pssEval.violationsAr.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isAr ? 'المخالفات الأمنية لـ Restricted:' : 'Violations preventing Restricted profile:'}</span>
                </div>
                {pssEval.violationsAr.map((v, i) => (
                  <div key={i} className="p-2.5 rounded bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
                    {isAr ? v : pssEval.violationsEn[i]}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  {isAr
                    ? 'تهانينا! الحزمة مطابقة بالكامل لمعايير Pod Security Standards Restricted.'
                    : 'Success! Pod is fully compliant with Pod Security Standards (Restricted profile).'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
