/**
 * OMEGA V14.3 — Container & Kubernetes Security Master Challenge
 * Flagship interactive enterprise defense challenge with strict Anti-Cheat validation & Master State wiring.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialContainerAntiCheatFlags } from './logic/antiCheat';
import {
  createDefaultKubernetesMasterState,
  createHardenedKubernetesMasterState,
  validateKubernetesMasterChallenge,
} from './logic/masterState';
import { ContainerAntiCheatFlags, KubernetesMasterState } from './logic/types';
import { containerEventBridge } from './runtime/ContainerEventBridge';
import { evaluateKubernetesAuthorization } from './logic/rbac';
import { evaluatePodNetworkReachability } from './logic/networkPolicies';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Trophy, Play, Zap, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContainerMasterChallenge: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const isAr = language === 'ar';

  const [flags, setFlags] = useState<ContainerAntiCheatFlags>(getInitialContainerAntiCheatFlags());
  const [masterState, setMasterState] = useState<KubernetesMasterState>(createDefaultKubernetesMasterState());
  const [tested, setTested] = useState<boolean>(false);
  const [authTestLogs, setAuthTestLogs] = useState<string[]>([]);
  const [netTestLogs, setNetTestLogs] = useState<string[]>([]);

  const applyVulnerableState = () => {
    const vuln = createDefaultKubernetesMasterState();
    setMasterState(vuln);
    setFlags(getInitialContainerAntiCheatFlags());
    setTested(false);
  };

  const toggleFlag = (key: keyof ContainerAntiCheatFlags) => {
    const newVal = !flags[key];
    const newFlags = { ...flags, [key]: newVal };
    setFlags(newFlags);

    // Sync KubernetesMasterState with flag toggle
    setMasterState((prev) => {
      const next = { ...prev, antiCheatFlags: { ...prev.antiCheatFlags, [key]: newVal } };

      if (key === 'imageSecuredWithNonRootAndDistroless') {
        next.images = next.images.map((img) => ({ ...img, isSignedCosign: newVal, runsAsUser: newVal ? 'nonroot' : 'root' }));
        next.pods = next.pods.map((p) => ({
          ...p,
          image: { ...p.image, isSignedCosign: newVal, runsAsUser: newVal ? 'nonroot' : 'root' },
        }));
      } else if (key === 'dangerousCapabilitiesDropped') {
        next.pods = next.pods.map((p) => ({
          ...p,
          securityContext: {
            ...p.securityContext,
            capabilitiesAdd: newVal ? [] : ['CAP_SYS_ADMIN'],
            capabilitiesDrop: newVal ? ['CAP_SYS_ADMIN'] : [],
          },
        }));
      } else if (key === 'hostSockAndPrivilegedDisabled') {
        next.pods = next.pods.map((p) => ({
          ...p,
          securityContext: { ...p.securityContext, privileged: !newVal },
          volumeMounts: newVal
            ? []
            : [{ name: 'dockersock', mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock', isReadOnly: false, isSensitiveHostMount: true }],
        }));
      } else if (key === 'rbacWildcardsAndExecEliminated') {
        if (newVal) {
          next.roles = [
            { id: 'r-1', name: 'frontend-reader', namespace: 'frontend', isClusterRole: false, rules: [{ apiGroups: [''], resources: ['pods'], verbs: ['get', 'list'] }] },
          ];
          next.bindings = [
            { id: 'b-1', name: 'frontend-reader-binding', namespace: 'frontend', isClusterRoleBinding: false, roleRefName: 'frontend-reader', subjects: [{ kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' }] },
          ];
        } else {
          next.roles = [
            { id: 'role-wildcard', name: 'frontend-wildcard-role', namespace: 'frontend', isClusterRole: false, rules: [{ apiGroups: ['*'], resources: ['*'], verbs: ['*'] }] },
          ];
          next.bindings = [
            { id: 'binding-wildcard', name: 'frontend-sa-wildcard-binding', namespace: 'frontend', isClusterRoleBinding: false, roleRefName: 'frontend-wildcard-role', subjects: [{ kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' }] },
          ];
        }
      } else if (key === 'defaultDenyNetworkPolicyEnforced') {
        if (newVal) {
          next.networkPolicies = [
            {
              id: 'pol-deny-fin',
              name: 'default-deny-finance',
              namespace: 'finance',
              podSelector: {},
              policyTypes: ['Ingress', 'Egress'],
              ingressRules: [{ from: [{ podSelector: { app: 'backend' } }], ports: [{ protocol: 'TCP', port: 8080 }] }],
              egressRules: [],
              enabled: true,
            },
            {
              id: 'pol-allow-fb',
              name: 'allow-frontend-backend',
              namespace: 'backend',
              podSelector: { app: 'backend' },
              policyTypes: ['Ingress'],
              ingressRules: [{ from: [{ podSelector: { app: 'frontend' } }], ports: [{ protocol: 'TCP', port: 443 }] }],
              egressRules: [],
              enabled: true,
            },
          ];
        } else {
          next.networkPolicies = [];
        }
      } else if (key === 'etcdKmsEncryptionEnabled') {
        next.secrets = next.secrets.map((s) => ({ ...s, encryptedAtRest: newVal }));
      } else if (key === 'falcoRuntimeRulesActiveAndQuarantineVerified') {
        next.auditConfig = { ...next.auditConfig, enabled: newVal, policyLevel: newVal ? 'RequestResponse' : 'None' };
      }

      return next;
    });
  };

  const runAuthorizationTests = () => {
    const logs: string[] = [];
    logs.push('[Test 1] frontend-sa -> get pods in frontend...');
    const test1 = evaluateKubernetesAuthorization({
      subject: { kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' },
      verb: 'get',
      resource: 'pods',
      namespace: 'frontend',
      roles: masterState.roles,
      bindings: masterState.bindings,
    });
    logs.push(`Result: ${test1.decision} - ${test1.reasonEn}`);

    logs.push('[Test 2] frontend-sa -> get secrets in finance...');
    const test2 = evaluateKubernetesAuthorization({
      subject: { kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' },
      verb: 'get',
      resource: 'secrets',
      namespace: 'finance',
      roles: masterState.roles,
      bindings: masterState.bindings,
    });
    logs.push(`Result: ${test2.decision} - ${test2.reasonEn}`);

    logs.push('[Test 3] backend-sa -> get configmaps in backend...');
    const test3 = evaluateKubernetesAuthorization({
      subject: { kind: 'ServiceAccount', name: 'backend-sa', namespace: 'backend' },
      verb: 'get',
      resource: 'configmaps',
      namespace: 'backend',
      roles: masterState.roles,
      bindings: masterState.bindings,
    });
    logs.push(`Result: ${test3.decision} - ${test3.reasonEn}`);

    logs.push('[Test 4] random-sa -> delete deployments in finance...');
    const test4 = evaluateKubernetesAuthorization({
      subject: { kind: 'ServiceAccount', name: 'random-sa', namespace: 'random' },
      verb: 'delete',
      resource: 'deployments',
      namespace: 'finance',
      roles: masterState.roles,
      bindings: masterState.bindings,
    });
    logs.push(`Result: ${test4.decision} - ${test4.reasonEn}`);

    const allPassed = test1.allowed && !test2.allowed && test3.allowed && !test4.allowed;
    logs.push(allPassed ? '✅ All RBAC Authorization tests PASSED!' : '❌ RBAC Authorization tests FAILED!');

    setAuthTestLogs(logs);
    if (allPassed) {
      setMasterState((prev) => ({ ...prev, testedAuthorizationsPassed: true }));
    }
  };

  const runNetworkPathTests = () => {
    const logs: string[] = [];
    logs.push('[Path 1] Internet -> frontend (port 443)...');
    const p1 = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'internet', namespace: 'external', labels: {} },
        dstPod: { name: 'frontend', namespace: 'frontend', labels: { app: 'frontend' } },
        dstPort: 443,
        isExternal: true,
      },
      masterState.networkPolicies
    );
    logs.push(`Result: ${p1.reachable ? 'ALLOWED' : 'DENIED'}`);

    logs.push('[Path 2] frontend -> backend (port 443)...');
    const p2 = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'frontend', namespace: 'frontend', labels: { app: 'frontend' } },
        dstPod: { name: 'backend', namespace: 'backend', labels: { app: 'backend' } },
        dstPort: 443,
      },
      masterState.networkPolicies
    );
    logs.push(`Result: ${p2.reachable ? 'ALLOWED' : 'DENIED'}`);

    logs.push('[Path 3] frontend -> finance-db (port 5432)...');
    const p3 = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'frontend', namespace: 'frontend', labels: { app: 'frontend' } },
        dstPod: { name: 'finance-db', namespace: 'finance', labels: { app: 'finance-db' } },
        dstPort: 5432,
      },
      masterState.networkPolicies
    );
    logs.push(`Result: ${p3.reachable ? 'ALLOWED' : 'BLOCKED'}`);

    const pathsPassed = p1.reachable && p2.reachable && !p3.reachable;
    logs.push(pathsPassed ? '✅ All Network Reachability tests PASSED!' : '❌ Network Path tests FAILED!');

    setNetTestLogs(logs);
    if (pathsPassed) {
      setMasterState((prev) => ({ ...prev, testedNetworkPathsPassed: true }));
    }
  };

  const masterVal = validateKubernetesMasterChallenge(masterState);
  const totalViolations = masterVal.failedChecks.length + masterVal.antiCheatViolations.length;
  const computedScore = masterVal.isPassed ? 100 : Math.max(0, 100 - totalViolations * 10);

  const runChallengeVerification = () => {
    setTested(true);

    if (masterVal.isPassed) {
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
                  ? 'قم بتنفيذ وتطبيق كافة الضوابط الدفاعية السبعة واختبار المصادقة والتوجيه الشبكي لتحصين كلاستر الإنتاج بالكامل ضد محاولات الاختراق.'
                  : 'Enforce all 7 core cloud-native defensive controls and pass interactive RBAC & Network suites to harden production cluster.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">{isAr ? 'الإنجاز الدفاعي' : 'Defense Score'}</div>
                <div
                  className={`text-3xl font-black ${
                    masterVal.isPassed
                      ? 'text-emerald-400'
                      : computedScore >= 60
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  }`}
                >
                  {computedScore}%
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={applyVulnerableState}
                  title={isAr ? 'إعادة للوضع الافتراضي المشبع بالثغرات' : 'Reset to Default Vulnerable State'}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Master Challenge Tasks Checklist */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'المهام الدفاعية السبعة المطلوبة:' : 'The 7 Mandatory Defensive Criteria:'}
            </h2>
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

        {/* Interactive Engine Test Suites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'حزمة اختبارات المحرك لمصادقة RBAC' : 'RBAC Authorization Engine Suite'}</span>
                {masterState.testedAuthorizationsPassed && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    PASSED
                  </span>
                )}
              </h3>
              <button
                onClick={runAuthorizationTests}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isAr ? 'تشغيل الاختبارات' : 'Run RBAC Suite'}</span>
              </button>
            </div>
            {authTestLogs.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300 max-h-40 overflow-y-auto">
                {authTestLogs.map((log, i) => (
                  <div key={i} className={log.includes('PASSED') ? 'text-emerald-400' : log.includes('FAILED') ? 'text-rose-400' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'حزمة اختبارات مسارات سياسات الشبكة' : 'NetworkPolicy Reachability Matrix Suite'}</span>
                {masterState.testedNetworkPathsPassed && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    PASSED
                  </span>
                )}
              </h3>
              <button
                onClick={runNetworkPathTests}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isAr ? 'تشغيل الاختبارات' : 'Run Network Suite'}</span>
              </button>
            </div>
            {netTestLogs.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300 max-h-40 overflow-y-auto">
                {netTestLogs.map((log, i) => (
                  <div key={i} className={log.includes('PASSED') ? 'text-emerald-400' : log.includes('FAILED') ? 'text-rose-400' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Banner */}
        {tested && (
          <div
            className={`p-6 rounded-2xl border ${
              masterVal.isPassed
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {masterVal.isPassed ? (
                <Trophy className="w-7 h-7 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-7 h-7 text-rose-400" />
              )}
              <h3 className="text-lg font-black text-white">
                {masterVal.isPassed
                  ? isAr
                    ? 'تهانينا! لقد حققت السيطرة الدفاعية الكاملة ونجحت في كافه بوابات Kubernetes Master State!'
                    : 'Congratulations! You achieved Total Defense Mastery & passed all Kubernetes Master State gates!'
                  : isAr
                  ? 'التحدي غير مكتمل بعد — توجد ملاحظات على تحصين الكلاستر أو بوابات الاختبار:'
                  : 'Challenge Incomplete — Master validation failed on state gates or anti-cheat policies:'}
              </h3>
            </div>

            {masterVal.isPassed ? (
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {isAr
                  ? 'تم تطبيق معايير الدفاع في العمق، وعزل مساحات الأسماء، وتأمين سلاسل التوريد، وتشفير etcd، وتفعيل مستشعرات Falco بنجاح تام.'
                  : 'Full defense-in-depth enforced: supply chain verified, PSS Restricted active, RBAC sanitized, and eBPF Falco monitoring operational.'}
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {masterVal.failedChecks.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-amber-400">{isAr ? 'البوابات غير المكتملة:' : 'Incomplete Gates:'}</div>
                    {masterVal.failedChecks.map((check, idx) => (
                      <div key={idx} className="text-xs text-amber-300 font-mono">
                        • {check}
                      </div>
                    ))}
                  </div>
                )}
                {masterVal.antiCheatViolations.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-rose-400">{isAr ? 'مخالفات سياسة تحصين الكلاستر (Anti-Cheat):' : 'Anti-Cheat / Security Remediation Violations:'}</div>
                    {masterVal.antiCheatViolations.map((v, idx) => (
                      <div key={idx} className="text-xs text-rose-300 font-mono">
                        • {v}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
