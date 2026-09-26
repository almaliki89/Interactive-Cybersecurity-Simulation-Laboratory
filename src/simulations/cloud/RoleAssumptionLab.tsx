/**
 * OMEGA V13 — Cloud Security World
 * RoleAssumptionLab.tsx
 *
 * Interactive Cloud IAM Role Assumption & Trust Policy Lab.
 * Demonstrates STS AssumeRole, Session Tokens, MFA conditions, and Trust Policy Evaluation.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { createDefaultRoles, evaluateRoleAssumption, CloudRole } from './logic/roles';
import { createDefaultCloudIdentities } from './logic/identity';
import { KeyRound, Shield, CheckCircle2, AlertTriangle, Play, Lock, UserCheck, Clock } from 'lucide-react';

export const RoleAssumptionLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [roles] = useState(createDefaultRoles());
  const [identities] = useState(createDefaultCloudIdentities());

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0].id);
  const [selectedPrincipalId, setSelectedPrincipalId] = useState<string>(identities.principals[0].id);
  const [simulateMfa, setSimulateMfa] = useState<boolean>(true);
  const [virtualTime] = useState<number>(300);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];
  const selectedPrincipal = identities.principals.find((p) => p.id === selectedPrincipalId) || identities.principals[0];

  const assumptionResult = evaluateRoleAssumption(selectedPrincipal, selectedRole, virtualTime, {
    isMfaActive: simulateMfa,
    isComputeService: selectedPrincipal.type === 'SERVICE_IDENTITY' || selectedPrincipal.type === 'WORKLOAD_IDENTITY',
  });

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono mb-1">
            <KeyRound className="w-4 h-4" />
            <span>STS ASSUME ROLE & TRUST POLICY WORKFLOW</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر تقمص الأدوار السحابية (Role Assumption & Trust)' : 'Role Assumption & Trust Policy Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'الأدوار السحابية (Roles) لا تمتلك كلمات مرور دائمة، بل يتم تقمصها عبر سياسات الثقة للحصول على رموز وصول مؤقتة مشروطة.'
              : 'Cloud Roles eliminate static credentials. Identities assume roles via trust policies, receiving short-lived STS credentials.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Role Selection & Trust Policy Inspector */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{isAr ? 'الأدوار السحابية المتاحة' : 'Available Cloud Roles'}</span>
            <span className="text-[10px] text-purple-400 font-mono">{roles.length} ROLES</span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[450px]">
            {roles.map((role) => {
              const isSelected = role.id === selectedRoleId;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{role.name}</span>
                    {role.isCrossAccount && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        Cross-Account
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {isAr ? role.descriptionAr : role.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Trust Policy & Interactive Simulator */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Trust Policy Viewer */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>{isAr ? 'وثيقة سياسة الثقة (AssumeRole Trust Policy)' : 'Role Trust Policy Document'}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Max Session: {selectedRole.maxSessionDurationSeconds / 3600}h</span>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300 overflow-x-auto">
              {JSON.stringify(selectedRole.assumeRolePolicy, null, 2)}
            </pre>
          </div>

          {/* Interactive AssumeRole Execution Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-cyan-300 mb-3 flex items-center gap-2">
                <Play className="w-4 h-4" />
                <span>{isAr ? 'محاكاة طلب تقمص الدور (STS:AssumeRole)' : 'Execute AssumeRole Request'}</span>
              </h3>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">
                    {isAr ? 'الهوية الطالبة (Requesting Principal):' : 'Requesting Principal:'}
                  </span>
                  <select
                    value={selectedPrincipalId}
                    onChange={(e) => setSelectedPrincipalId(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                  >
                    {identities.principals.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.name} ({p.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block mb-0.5">
                      {isAr ? 'حالة المصادقة الثنائية (MFA):' : 'MFA Context Active:'}
                    </span>
                    <span className={`text-xs font-bold ${simulateMfa ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simulateMfa ? 'MFA Token Provided' : 'No MFA Token'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSimulateMfa(!simulateMfa)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                  >
                    {simulateMfa ? 'Toggle Off' : 'Toggle On'}
                  </button>
                </div>
              </div>

              {/* Evaluation Output */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  assumptionResult.isSuccess
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                }`}
              >
                {assumptionResult.isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="text-xs font-bold mb-1">
                    {assumptionResult.isSuccess
                      ? isAr
                        ? 'تم تفويض تقمص الدور وإصدار بيانات الاعتماد المؤقتة!'
                        : 'Role Assumption Authorized: Temporary Credentials Generated'
                      : isAr
                      ? 'تم رفض تقمص الدور!'
                      : 'Role Assumption Denied'}
                  </div>
                  <div className="text-[11px] leading-relaxed opacity-90">
                    {assumptionResult.isSuccess
                      ? isAr
                        ? 'تطابقت الهوية الطالبة والشروط المطلوبة مع وثيقة الثقة.'
                        : 'The requesting principal and context matched the trust policy statement.'
                      : isAr
                      ? assumptionResult.denialReasonAr
                      : assumptionResult.denialReasonEn}
                  </div>

                  {/* Temporary Credentials Box */}
                  {assumptionResult.credentials && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300">
                      <div className="flex items-center justify-between text-cyan-400 mb-1 font-bold">
                        <span>TEMPORARY STS CREDENTIALS</span>
                        <span className="flex items-center gap-1 text-[9px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>Expires at T+{assumptionResult.credentials.expirationVirtualTime}</span>
                        </span>
                      </div>
                      <div>AccessKeyId: {assumptionResult.credentials.accessKeyId}</div>
                      <div>SecretAccessKey: {assumptionResult.credentials.secretAccessKeyMasked}</div>
                      <div className="truncate">SessionToken: {assumptionResult.credentials.sessionToken}</div>
                      <div className="text-purple-300 truncate">AssumedArn: {assumptionResult.credentials.assumedRoleArn}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              {isAr
                ? 'ملاحظة أمنية: الأدوار المفرطة التي تمنح ثقة (*:*) تعرض الحساب لخطر الاختراق الشامل عبر أي مستخدم موثق.'
                : 'Security Warning: Roles with wildcard trust principals (*) permit any authenticated entity in the organization to assume them.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
