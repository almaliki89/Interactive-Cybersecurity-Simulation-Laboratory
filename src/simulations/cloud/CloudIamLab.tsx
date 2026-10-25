/**
 * OMEGA V13 — Cloud Security World
 * CloudIamLab.tsx
 *
 * Teaches Cloud Principals (Users, Groups, Service Identities, Workload Identities),
 * Policy Attachments, and the Least Privilege blast radius reduction.
 * Integrates live deterministic technical validator for iam-hardening-challenge.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import {
  createDefaultCloudIdentities,
  getPrincipalEffectivePolicies,
  auditCloudIamConfiguration,
  CloudPrincipal,
} from './logic/identity';
import { ALL_PRESET_POLICIES } from './logic/policies';
import {
  Users,
  KeyRound,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const CloudIamLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';

  const [data, setData] = useState(() => createDefaultCloudIdentities());
  const dataRef = useRef(data);
  dataRef.current = data;

  const updateDataAndSyncRef = (nextData: typeof data) => {
    dataRef.current = nextData;
    setData(nextData);
  };

  const [selectedPrincipalId, setSelectedPrincipalId] = useState<string>(data.principals[0].id);

  const selectedPrincipal = data.principals.find((p) => p.id === selectedPrincipalId) || data.principals[0];
  const effectivePolicies = getPrincipalEffectivePolicies(selectedPrincipal, data.groups, ALL_PRESET_POLICIES);

  const audit = auditCloudIamConfiguration(data.principals, data.groups, ALL_PRESET_POLICIES);

  const hasWildcardPolicy = effectivePolicies.some(
    (p) => p.isWildcardAdmin || p.statements.some((s) => s.actions.includes('*') || s.actions.includes('storage:*'))
  );

  // Register live challenge validator bound strictly to current state via dataRef
  useEffect(() => {
    registerChallengeValidator('iam-hardening-challenge', () => {
      const currentData = dataRef.current;
      const liveAudit = auditCloudIamConfiguration(currentData.principals, currentData.groups, ALL_PRESET_POLICIES);
      return {
        success: liveAudit.isCompliant && liveAudit.securityScore >= 100,
        score: liveAudit.securityScore,
        message: liveAudit.isCompliant ? liveAudit.messageEn : liveAudit.messageEn,
      };
    });

    return () => {
      unregisterChallengeValidator('iam-hardening-challenge');
    };
  }, []);

  const sanitizeAndHarden = () => {
    const currentData = dataRef.current;
    const updatedPrincipals: CloudPrincipal[] = currentData.principals.map((p) => {
      if (p.id === 'wkl-frontend-app') {
        // Replace overly permissive storage:* wildcard policy with scoped least-privilege finance reader
        return {
          ...p,
          attachedPolicyIds: ['pol-finance-reader-least-priv'],
        };
      }
      return p;
    });

    const nextData = { ...currentData, principals: updatedPrincipals };
    updateDataAndSyncRef(nextData);

    const postAudit = auditCloudIamConfiguration(updatedPrincipals, nextData.groups, ALL_PRESET_POLICIES);
    if (postAudit.isCompliant) {
      completeChallenge('iam-hardening-challenge', {
        success: true,
        score: postAudit.securityScore,
        message: postAudit.messageEn,
      });
    }
  };

  const resetToVulnerable = () => {
    updateDataAndSyncRef(createDefaultCloudIdentities());
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <Users className="w-4 h-4" />
            <span>CLOUD IDENTITY & ACCESS MANAGEMENT (IAM)</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر إدارة الهويات والامتياز الأدنى (Least Privilege)' : 'IAM Principals & Least Privilege Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'تحليل هويات المستخدمين، المجموعات، وأعباء العمل، وفحص السياسات الفعالة لمنع انتشار الصلاحيات المفرطة (*:*).'
              : 'Inspect Cloud Principals, Groups, and effective policies to ensure least-privilege scoping and detect wildcard admin vulnerabilities.'}
          </p>
        </div>

        {/* Action Controls & Audit Score */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">{isAr ? 'نقاط أمان IAM' : 'IAM Security Score'}</div>
            <div
              className={`text-2xl font-black ${
                audit.securityScore >= 100
                  ? 'text-emerald-400'
                  : audit.securityScore >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {audit.securityScore}%
            </div>
          </div>

          <button
            onClick={sanitizeAndHarden}
            data-testid="btn-harden-iam"
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-950"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'تطبيق مبدأ أقل الصلاحيات (Least Privilege)' : 'Enforce Least Privilege'}</span>
          </button>

          <button
            onClick={resetToVulnerable}
            data-testid="btn-reset-iam"
            title={isAr ? 'إعادة التعيين للحالة الأولية' : 'Reset to Vulnerable State'}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dangerous Findings Panel */}
      {audit.findings.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>{isAr ? 'الثغرات والصلاحيات المفرطة المكتشفة:' : 'Dangerous IAM Over-Privilege Findings:'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {audit.findings.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-300">{f.principalName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {f.severity}
                  </span>
                </div>

                <div className="text-slate-300 leading-relaxed">{isAr ? f.reasonAr : f.reasonEn}</div>

                <div className="p-2 rounded bg-slate-950 text-[11px] text-amber-300 font-mono">
                  <span className="text-slate-500">Escalation: </span>
                  <span>{isAr ? f.escalationVectorAr : f.escalationVectorEn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Principals List */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{isAr ? 'الهويات السحابية (Principals)' : 'Cloud Principals'}</span>
            <span className="text-[10px] text-indigo-400 font-mono">{data.principals.length} IDENTITIES</span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
            {data.principals.map((principal) => {
              const isSelected = principal.id === selectedPrincipalId;
              return (
                <div
                  key={principal.id}
                  onClick={() => setSelectedPrincipalId(principal.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{principal.name}</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      {principal.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                    <span>MFA: {principal.mfaActive ? 'ACTIVE' : 'DISABLED'}</span>
                    <span className={principal.mfaActive ? 'text-emerald-400' : 'text-rose-400'}>
                      {principal.mfaActive ? 'Protected' : 'No MFA'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Selected Principal Inspector & Effective Policies */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Principal Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedPrincipal.name}</h3>
                  <span className="text-xs text-slate-400 font-mono break-all">{selectedPrincipal.arn}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                    selectedPrincipal.mfaActive
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>{selectedPrincipal.mfaActive ? 'MFA Enforced' : 'MFA Missing'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'النوع' : 'PRINCIPAL TYPE'}</span>
                <span className="font-bold text-white">{selectedPrincipal.type}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'المجموعات' : 'GROUP MEMBERSHIP'}</span>
                <span className="font-bold text-white">
                  {selectedPrincipal.groups.length > 0 ? selectedPrincipal.groups.join(', ') : 'None'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'مفاتيح الوصول' : 'ACCESS KEYS'}</span>
                <span className="font-bold text-white">{selectedPrincipal.accessKeys.length} Active Key(s)</span>
              </div>
            </div>
          </div>

          {/* Effective Permissions & Least Privilege Comparison */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'السياسات الفعالة المطبقة' : 'Effective Attached Policies'}</span>
              </div>

              {hasWildcardPolicy ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{isAr ? 'صلاحيات نجوم واسعة (*)' : 'Wildcard Over-Privileged'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isAr ? 'امتياز أدنى محصور' : 'Least-Privilege Scoped'}</span>
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px]">
              {effectivePolicies.map((policy) => (
                <div key={policy.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{policy.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                      {policy.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    {isAr ? policy.descriptionAr : policy.descriptionEn}
                  </p>

                  {/* Statement Inspector */}
                  <div className="flex flex-col gap-2 font-mono text-[10px]">
                    {policy.statements.map((stmt) => (
                      <div key={stmt.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              stmt.effect === 'ALLOW' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                            }`}
                          >
                            {stmt.effect}
                          </span>
                          <span className="text-slate-400">ID: {stmt.id}</span>
                        </div>
                        <div className="text-cyan-300">
                          <span className="text-slate-500">Actions: </span>
                          {stmt.actions.join(', ')}
                        </div>
                        <div className="text-indigo-300 truncate">
                          <span className="text-slate-500">Resources: </span>
                          {stmt.resources.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Least Privilege Guidance Banner */}
            <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-800/40 text-[11px] text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-bold text-cyan-400 block mb-0.5">
                  {isAr ? 'مقارنة مبدأ الامتياز الأدنى:' : 'Least Privilege Comparison:'}
                </span>
                <span className="text-rose-300 line-through mr-2 font-mono">storage:* on *</span>
                <span className="text-slate-400">➔</span>
                <span className="text-emerald-300 ml-2 font-mono">storage:GetObject on finance-reports/*</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudIamLab;
