/**
 * OMEGA V14 — Admission Controllers (OPA Gatekeeper & Kyverno) Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialAdmissionPolicies, validatePodAdmission, AdmissionPolicyRule } from './logic/admission';
import { getInitialClusterPods } from './logic/networkPolicies';
import { KubernetesPod } from './logic/types';
import { CheckCircle2, XCircle, ShieldAlert, RefreshCw, FileCheck } from 'lucide-react';

export const AdmissionControllerLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [policies, setPolicies] = useState<AdmissionPolicyRule[]>(getInitialAdmissionPolicies());
  const [pods] = useState<KubernetesPod[]>(getInitialClusterPods());
  const [selectedPodId, setSelectedPodId] = useState<string>('pod-frontend-web');

  const selectedPod = pods.find((p) => p.id === selectedPodId) || pods[0];
  const admissionResult = validatePodAdmission(selectedPod, policies);

  const togglePolicyAction = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policyId
          ? { ...p, enforceAction: p.enforceAction === 'DENY' ? 'DISABLED' : 'DENY' }
          : p
      )
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
              <FileCheck className="w-4 h-4" />
              <span>{isAr ? 'مختبر بوابات القبول والسياسات البرمجية' : 'Validating Webhooks & Admission Controllers Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'فرض السياسات الأمنية البرمجية (OPA Gatekeeper & Kyverno)' : 'Policy as Code Admission Gates'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'اعتراض طلبات إنشاء الـ Pods والتحقق من مطابقتها للمعايير الأمنية قبل جدولتها في الكلاستر.'
                : 'Intercept API server admission requests and reject insecure workloads with OPA & Kyverno.'}
            </p>
          </div>

          <button
            onClick={() => setPolicies(getInitialAdmissionPolicies())}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Pod Test Picker */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isAr ? 'اختر الحزمة لاختبار بوابة القبول (Select Pod to Test Admission):' : 'Select Pod to Test Admission:'}
          </div>

          <div className="flex flex-wrap gap-2">
            {pods.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPodId(p.id)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedPodId === p.id
                    ? 'bg-blue-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Result */}
          <div
            className={`p-4 rounded-xl border mt-3 flex items-start gap-3 ${
              admissionResult.admitted
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}
          >
            {admissionResult.admitted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm text-white">
                {admissionResult.admitted
                  ? isAr
                    ? 'تم قبول الـ Pod ونشره بنجاح (ADMITTED)'
                    : 'Pod Successfully Admitted'
                  : isAr
                  ? 'تم رفض نشر الـ Pod من قبل الـ Webhook (REJECTED)'
                  : 'Admission Webhook Rejected Pod'}
              </div>
              <div className="text-xs mt-1 font-mono">
                {isAr ? admissionResult.reasonAr : admissionResult.reasonEn}
              </div>
            </div>
          </div>
        </div>

        {/* Admission Policies List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((pol) => (
            <div key={pol.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  {pol.engine}
                </span>

                <button
                  onClick={() => togglePolicyAction(pol.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    pol.enforceAction === 'DENY'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {pol.enforceAction === 'DENY' ? (isAr ? 'مفعل (DENY)' : 'Active (DENY)') : (isAr ? 'معطل' : 'Disabled')}
                </button>
              </div>

              <h3 className="font-bold text-xs text-white">{pol.name}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isAr ? pol.descriptionAr : pol.descriptionEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
