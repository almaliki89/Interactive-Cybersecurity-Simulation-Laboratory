/**
 * OMEGA V14 — Container & Kubernetes Security Master Challenge
 * Flagship interactive enterprise defense challenge with strict Anti-Cheat validation.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialContainerAntiCheatFlags, evaluateContainerMasterChallenge } from './logic/antiCheat';
import { ContainerAntiCheatFlags } from './logic/types';
import { containerEventBridge } from './runtime/ContainerEventBridge';
import { Terminal, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContainerMasterChallenge: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const isAr = language === 'ar';

  const [flags, setFlags] = useState<ContainerAntiCheatFlags>(getInitialContainerAntiCheatFlags());
  const [tested, setTested] = useState<boolean>(false);

  const toggleFlag = (key: keyof ContainerAntiCheatFlags) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
  };

  const evaluation = evaluateContainerMasterChallenge(flags);

  const runChallengeVerification = () => {
    setTested(true);

    if (evaluation.isMastered) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      containerEventBridge.emitEvent({
        id: `k8s-master-challenge-completed-${virtualTime}`,
        eventType: 'POD_QUARANTINED',
        virtualTime,
        podName: 'nexora-cluster-root',
        namespace: 'all',
        severity: 'info',
        outcome: 'SUCCESS',
        attributes: {
          status: 'MASTER_CHALLENGE_SOLVED',
          score: 100,
        },
      });
    }
  };

  const completeAllDefenses = () => {
    setFlags({
      imageSecuredWithNonRootAndDistroless: true,
      dangerousCapabilitiesDropped: true,
      hostSockAndPrivilegedDisabled: true,
      rbacWildcardsAndExecEliminated: true,
      defaultDenyNetworkPolicyEnforced: true,
      etcdKmsEncryptionEnabled: true,
      falcoRuntimeRulesActiveAndQuarantineVerified: true,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Challenge Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500 text-slate-950">
                  {isAr ? 'التحدي النهائي الشامل' : 'Flagship Master Challenge'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  World 20
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">
                {isAr ? 'تحدي تحصين البنية التحتية لكوبرنيتيس (Nexora K8s Master Defense)' : 'Nexora K8s Cluster Master Defense Challenge'}
              </h1>
              <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                {isAr
                  ? 'قم بتنفيذ وتطبيق كافة الضوابط الدفاعية السبعة لتحصين كلاستر الإنتاج بالكامل ضد محاولات الاختراق وسرقة التوكن وكسر العزل.'
                  : 'Enforce all 7 core cloud-native defensive controls to harden the production Kubernetes cluster against breach and escape.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">{isAr ? 'الإنجاز الدفاعي' : 'Defense Score'}</div>
                <div
                  className={`text-3xl font-black ${
                    evaluation.score === 100
                      ? 'text-emerald-400'
                      : evaluation.score >= 60
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  }`}
                >
                  {evaluation.score}%
                </div>
              </div>

              <button
                onClick={() => {
                  setFlags(getInitialContainerAntiCheatFlags());
                  setTested(false);
                }}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Master Challenge Tasks Checklist */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'المهام الدفاعية السبعة المطلوبة:' : 'The 7 Mandatory Defensive Criteria:'}
            </h2>

            <button
              onClick={completeAllDefenses}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {isAr ? 'تطبيق كافة التحصينات دفعة واحدة' : 'Apply All Hardening Toggles'}
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                key: 'imageSecuredWithNonRootAndDistroless',
                titleAr: '1. تحصين صور الحاويات (Distroless + Non-Root User 10001 + فحص CVEs)',
                titleEn: '1. Container Image Hardening (Distroless, UID 10001 Non-Root, Zero CVEs)',
                val: flags.imageSecuredWithNonRootAndDistroless,
              },
              {
                key: 'dangerousCapabilitiesDropped',
                titleAr: '2. إسقاط صلاحيات لينكس الخطرة (capabilities.drop: ["ALL"])',
                titleEn: '2. Drop Dangerous Linux Capabilities (capabilities.drop: ["ALL"])',
                val: flags.dangerousCapabilitiesDropped,
              },
              {
                key: 'hostSockAndPrivilegedDisabled',
                titleAr: '3. حظر تمرير docker.sock وتعطيل وضع privileged: true لمنع كسر العزل',
                titleEn: '3. Remove docker.sock Mount & Disable privileged: true Breakout Vectors',
                val: flags.hostSockAndPrivilegedDisabled,
              },
              {
                key: 'rbacWildcardsAndExecEliminated',
                titleAr: '4. تطهير أدوار RBAC من علامات النجمة (*) وصلاحيات pods/exec غير المقيدة',
                titleEn: '4. Sanitize RBAC Roles: Eliminate Wildcard Grants (*) and pods/exec Abuse',
                val: flags.rbacWildcardsAndExecEliminated,
              },
              {
                key: 'defaultDenyNetworkPolicyEnforced',
                titleAr: '5. فرض سياسة Default Deny NetworkPolicy وحظر استعلام الميتاداتا 169.254.169.254',
                titleEn: '5. Enforce Default Deny NetworkPolicy & Block Cloud Metadata 169.254.169.254 Egress',
                val: flags.defaultDenyNetworkPolicyEnforced,
              },
              {
                key: 'etcdKmsEncryptionEnabled',
                titleAr: '6. تفعيل تشفير أسرار Kubernetes في etcd عبر KMS Envelope Encryption',
                titleEn: '6. Enable Kubernetes Secrets Encryption at Rest in etcd with KMS Provider',
                val: flags.etcdKmsEncryptionEnabled,
              },
              {
                key: 'falcoRuntimeRulesActiveAndQuarantineVerified',
                titleAr: '7. تفعيل مستشعرات Falco eBPF المباشرة والعزل التلقائي للحاويات المخترقة',
                titleEn: '7. Activate Falco eBPF Runtime Threat Rules with Automated Pod Quarantine',
                val: flags.falcoRuntimeRulesActiveAndQuarantineVerified,
              },
            ].map((task) => (
              <div
                key={task.key}
                onClick={() => toggleFlag(task.key as keyof ContainerAntiCheatFlags)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                  task.val
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      task.val
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {task.val && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold">{isAr ? task.titleAr : task.titleEn}</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    task.val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {task.val ? (isAr ? 'مطبق ومحصن' : 'Hardened') : (isAr ? 'غير مطبق' : 'Missing')}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={runChallengeVerification}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Trophy className="w-5 h-5" />
            <span>{isAr ? 'التحقق من حل التحدي واعتماد النتيجة' : 'Verify & Submit Master Defense Challenge'}</span>
          </button>
        </div>

        {/* Evaluation Banner */}
        {tested && (
          <div
            className={`p-6 rounded-2xl border ${
              evaluation.isMastered
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {evaluation.isMastered ? (
                <Trophy className="w-7 h-7 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-rose-400" />
              )}
              <h3 className="text-lg font-black text-white">
                {evaluation.isMastered
                  ? isAr
                    ? 'تهانينا! لقد حققت السيطرة الدفاعية الكاملة على كلاستر Nexora Kubernetes!'
                    : 'Congratulations! You have achieved Total Defense Mastery over Nexora K8s Cluster!'
                  : isAr
                  ? `التحدي غير مكتمل بعد (${evaluation.completedTasks} من ${evaluation.totalTasks})`
                  : `Challenge Incomplete (${evaluation.completedTasks} of ${evaluation.totalTasks} tasks fulfilled)`}
              </h3>
            </div>

            {evaluation.isMastered ? (
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {isAr
                  ? 'تم تطبيق معايير الدفاع في العمق، وعزل مساحات الأسماء، وتأمين سلاسل التوريد، وتشفير etcd، وتفعيل مستشعرات Falco بنجاح تام.'
                  : 'Full defense-in-depth enforced: supply chain verified, PSS Restricted active, RBAC sanitized, and eBPF Falco monitoring operational.'}
              </p>
            ) : (
              <div className="mt-3 space-y-1">
                <div className="text-xs font-bold text-slate-300">{isAr ? 'المهام المتبقية:' : 'Remaining tasks:'}</div>
                {evaluation.remainingTasksAr.map((t, idx) => (
                  <div key={idx} className="text-xs text-rose-300 font-mono">
                    • {isAr ? t : evaluation.remainingTasksEn[idx]}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
