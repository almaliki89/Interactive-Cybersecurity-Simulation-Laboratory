/**
 * OMEGA V13 — Cloud Security World
 * CloudPolicyLab.tsx
 *
 * Interactive Cloud Policy Evaluation Engine Lab.
 * Demonstrates the deterministic evaluation flow:
 * Explicit Deny > Allow > Implicit Deny, wildcards (*), and conditions.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { evaluateCloudAuthorization, CloudAuthRequest } from './logic/authorization';
import {
  ALL_PRESET_POLICIES,
  LEAST_PRIVILEGE_FINANCE_READER_POLICY,
  STORAGE_FULL_ACCESS_POLICY,
  ADMIN_ACCESS_POLICY,
} from './logic/policies';
import { Shield, Play, CheckCircle2, AlertTriangle, Lock, Eye, Terminal, ArrowRight } from 'lucide-react';

export const CloudPolicyLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [requestedAction, setRequestedAction] = useState<string>('storage:GetObject');
  const [requestedResource, setRequestedResource] = useState<string>('finance-reports/Q3.pdf');
  const [secureTransport, setSecureTransport] = useState<boolean>(true);
  const [mfaActive, setMfaActive] = useState<boolean>(true);
  const [sourceIp, setSourceIp] = useState<string>('10.100.1.50');

  const [selectedPolicyType, setSelectedPolicyType] = useState<'LEAST_PRIV' | 'WILDCARD' | 'ADMIN'>('LEAST_PRIV');

  const policies =
    selectedPolicyType === 'LEAST_PRIV'
      ? [LEAST_PRIVILEGE_FINANCE_READER_POLICY]
      : selectedPolicyType === 'WILDCARD'
      ? [STORAGE_FULL_ACCESS_POLICY]
      : [ADMIN_ACCESS_POLICY];

  const request: CloudAuthRequest = {
    principalArn: 'ncrn:nexora:iam::acc-prod-003:user/sara',
    action: requestedAction,
    resource: requestedResource,
    context: {
      secureTransport,
      mfaActive,
      sourceIp,
      currentTimeVirtual: 300,
    },
  };

  const decision = evaluateCloudAuthorization(request, policies);

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <Shield className="w-4 h-4" />
            <span>CLOUD IAM POLICY EVALUATION ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر تقييم سياسات التفويض والحظر الصريح' : 'Authorization Policy Evaluation & Explicit Deny Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'كيف تتخذ السحابة قرار السماح أو الحظر؟ تعلم القاعدة الجوهرية: الحظر الصريح (Explicit Deny) يتفوق دائمًا على السماح، والافتراضي حظر ضمني.'
              : 'How does the cloud decide authorization? Learn the core algorithm: Explicit Deny overrides Allow, and default is Implicit Deny.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Policy & Request Configurator */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Policy Preset Selector */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-slate-300 block mb-3">
              {isAr ? 'اختر السياسة السحابية للاختبار:' : 'Select Target IAM Policy:'}
            </span>

            <div className="flex flex-col gap-2">
              {[
                {
                  id: 'LEAST_PRIV' as const,
                  nameEn: 'Least Privilege Finance Reader',
                  nameAr: 'سياسة الامتياز الأدنى لتقارير المالية',
                  descEn: 'Allows GetObject on finance-reports/* requiring TLS; explicit deny for plain HTTP.',
                  descAr: 'تسمح بقراءة تقارير المالية مع فرض TLS وحظر صريح لـ HTTP.',
                },
                {
                  id: 'WILDCARD' as const,
                  nameEn: 'Overly Permissive Storage Wildcard',
                  nameAr: 'سياسة تخزين مفرطة الصلاحيات (*)',
                  descEn: 'Allows storage:* across all buckets with no conditions.',
                  descAr: 'تسمح بجميع أفعال التخزين (*:*) لجميع الحاويات.',
                },
                {
                  id: 'ADMIN' as const,
                  nameEn: 'AdministratorAccess (*:*)',
                  nameAr: 'صلاحيات المدير الكاملة (*:*)',
                  descEn: 'Unrestricted full access across the cloud account.',
                  descAr: 'صلاحية سيطرة كاملة دون أي قيود.',
                },
              ].map((p) => {
                const isSelected = selectedPolicyType === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPolicyType(p.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{isAr ? p.nameAr : p.nameEn}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">{isAr ? p.descAr : p.descEn}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Context Toggles */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-slate-300 block mb-3 font-mono">
              REQUEST CONTEXT CONDITIONS
            </span>

            <div className="flex flex-col gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">nexora:SecureTransport (TLS)</span>
                  <span className={secureTransport ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {secureTransport ? 'HTTPS (Encrypted)' : 'Insecure HTTP (Unencrypted)'}
                  </span>
                </div>
                <button
                  onClick={() => setSecureTransport(!secureTransport)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-[10px] text-slate-200 font-bold"
                >
                  Toggle
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">nexora:MFAActive</span>
                  <span className={mfaActive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {mfaActive ? 'MFA Session Active' : 'No MFA Session'}
                  </span>
                </div>
                <button
                  onClick={() => setMfaActive(!mfaActive)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-[10px] text-slate-200 font-bold"
                >
                  Toggle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right: Live Authorization Decision & Step-by-Step Path */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Action & Resource Inputs */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-slate-200 block mb-3">
              {isAr ? 'الطلب المراد تفويضه (Authorization Request):' : 'Requested Action & Resource:'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] mb-1">REQUESTED ACTION</span>
                <input
                  type="text"
                  value={requestedAction}
                  onChange={(e) => setRequestedAction(e.target.value)}
                  className="w-full bg-transparent text-cyan-300 font-bold focus:outline-none"
                  placeholder="e.g. storage:GetObject"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] mb-1">REQUESTED RESOURCE</span>
                <input
                  type="text"
                  value={requestedResource}
                  onChange={(e) => setRequestedResource(e.target.value)}
                  className="w-full bg-transparent text-purple-300 font-bold focus:outline-none"
                  placeholder="e.g. finance-reports/Q3.pdf"
                />
              </div>
            </div>
          </div>

          {/* Decision Outcome Card */}
          <div
            className={`p-5 rounded-2xl border flex items-start gap-4 shadow-xl ${
              decision.decision === 'ALLOW'
                ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                : decision.decision === 'EXPLICIT_DENY'
                ? 'bg-rose-950/40 border-rose-600 text-rose-200'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            {decision.decision === 'ALLOW' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0 mt-0.5" />
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-black font-mono tracking-wide">
                  DECISION: {decision.decision}
                </span>
                {decision.decision === 'EXPLICIT_DENY' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900 text-white font-bold">
                    DENY OVERRIDES ALLOW
                  </span>
                )}
              </div>

              <p className="text-xs leading-relaxed opacity-95">
                {isAr ? decision.reasons.ar : decision.reasons.en}
              </p>

              <div className="text-[11px] font-mono opacity-80 mt-2">
                Why: {decision.decisionWhy}
              </div>
            </div>
          </div>

          {/* Step-by-Step Evaluation Trace */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex-1 flex flex-col font-mono text-xs">
            <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'مسار تقييم السياسة خطوة بخطوة' : 'Policy Evaluation Path & Statement Inspection'}</span>
            </h4>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[250px]">
              {decision.evaluationSteps.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          step.effect === 'ALLOW' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {step.effect}
                      </span>
                      <span className="font-bold text-white">Statement: {step.statementId}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-3">
                      <span>Action: {step.actionMatch ? '✓ Match' : '✗ No Match'}</span>
                      <span>Resource: {step.resourceMatch ? '✓ Match' : '✗ No Match'}</span>
                      <span>Condition: {step.conditionMatch ? '✓ Match' : '✗ Failed'}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                      step.isTriggered
                        ? step.effect === 'DENY'
                          ? 'bg-rose-900 text-rose-200'
                          : 'bg-emerald-900 text-emerald-200'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {step.isTriggered ? 'TRIGGERED' : 'SKIPPED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
