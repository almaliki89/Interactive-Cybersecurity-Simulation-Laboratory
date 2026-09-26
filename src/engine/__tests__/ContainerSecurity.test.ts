/**
 * OMEGA V14 — Container & Kubernetes Security Logic Tests
 * Fully deterministic unit & logic test suite.
 */

import { describe, it, expect } from 'vitest';
import { getInitialNamespaceConfigs, evaluateNamespaceSecurity } from '../../simulations/containers/logic/namespaces';
import { getInitialCgroupsLimits, simulateResourceStress } from '../../simulations/containers/logic/cgroups';
import { ALL_CAPABILITIES_MAP, evaluateContainerCapabilities } from '../../simulations/containers/logic/capabilities';
import {
  getSampleVulnerableImage,
  getHardenedDistrolessImage,
  scanImageSecurity,
} from '../../simulations/containers/logic/images';
import { ESCAPE_SCENARIOS, testEscapeVulnerability } from '../../simulations/containers/logic/escape';
import { getInitialControlPlaneConfig, evaluateCisKubernetesBenchmark } from '../../simulations/containers/logic/controlPlane';
import { getInitialClusterRoles, auditKubernetesRbac } from '../../simulations/containers/logic/rbac';
import { evaluatePodSecurityStandard } from '../../simulations/containers/logic/podSecurity';
import {
  getInitialClusterPods,
  getInitialNetworkPolicies,
  evaluatePacketFlow,
} from '../../simulations/containers/logic/networkPolicies';
import { getInitialClusterSecrets, auditSecretsSecurity } from '../../simulations/containers/logic/secrets';
import { getInitialFalcoRules, evaluateSyscallEvent } from '../../simulations/containers/logic/runtimeSecurity';
import { getInitialAdmissionPolicies, validatePodAdmission } from '../../simulations/containers/logic/admission';
import { getInitialContainerAntiCheatFlags, evaluateContainerMasterChallenge } from '../../simulations/containers/logic/antiCheat';

describe('OMEGA V14 — Container & Kubernetes Security World', () => {
  describe('Linux Namespaces Isolation Engine', () => {
    it('evaluates initial namespaces with unisolated User namespace', () => {
      const configs = getInitialNamespaceConfigs();
      const evalResult = evaluateNamespaceSecurity(configs);
      expect(evalResult.unisolatedCount).toBe(1); // UserNS is initially false
      expect(evalResult.userNamespaceActive).toBe(false);
      expect(evalResult.securityScore).toBeLessThanOrEqual(85);
    });

    it('achieves 100% score when all namespaces including UserNS are isolated', () => {
      const configs = getInitialNamespaceConfigs().map((ns) => ({ ...ns, isolated: true }));
      const evalResult = evaluateNamespaceSecurity(configs);
      expect(evalResult.unisolatedCount).toBe(0);
      expect(evalResult.userNamespaceActive).toBe(true);
      expect(evalResult.securityScore).toBe(100);
    });
  });

  describe('Cgroups Limits & Resource Starvation Defense', () => {
    it('simulates host crash when fork bomb is executed with unlimited pids', () => {
      const limits = getInitialCgroupsLimits(); // pidsMax = 0 (unlimited)
      const res = simulateResourceStress(limits, 'fork_bomb');
      expect(res.outcome).toBe('HOST_CRASH');
      expect(res.mitigated).toBe(false);
    });

    it('contains fork bomb when pids.max is strictly constrained', () => {
      const limits = { ...getInitialCgroupsLimits(), pidsMax: 64 };
      const res = simulateResourceStress(limits, 'fork_bomb');
      expect(res.outcome).toBe('CONTAINED');
      expect(res.mitigated).toBe(true);
      expect(res.processCount).toBe(64);
    });

    it('triggers container-scoped OOM killer when memory limit is enforced', () => {
      const limits = { ...getInitialCgroupsLimits(), memoryLimitMb: 256 };
      const res = simulateResourceStress(limits, 'memory_exhaustion');
      expect(res.outcome).toBe('PROCESS_KILLED');
      expect(res.mitigated).toBe(true);
    });
  });

  describe('Linux Capabilities Matrix & Least Privilege', () => {
    it('identifies dangerous capabilities (CAP_SYS_ADMIN, CAP_SYS_PTRACE, CAP_NET_ADMIN)', () => {
      expect(ALL_CAPABILITIES_MAP.CAP_SYS_ADMIN.isDangerous).toBe(true);
      expect(ALL_CAPABILITIES_MAP.CAP_SYS_PTRACE.isDangerous).toBe(true);
      expect(ALL_CAPABILITIES_MAP.CAP_NET_ADMIN.isDangerous).toBe(true);
      expect(ALL_CAPABILITIES_MAP.CAP_NET_BIND_SERVICE.isDangerous).toBe(false);
    });

    it('rewards drop-all capabilities policy with high security score', () => {
      const evalResult = evaluateContainerCapabilities(['CAP_NET_BIND_SERVICE'], true);
      expect(evalResult.isHardened).toBe(true);
      expect(evalResult.dangerousCount).toBe(0);
      expect(evalResult.score).toBe(100);
    });
  });

  describe('Container Image Security & Supply Chain', () => {
    it('scans vulnerable image and detects critical CVEs and secret leaks', () => {
      const img = getSampleVulnerableImage();
      const scan = scanImageSecurity(img);
      expect(scan.criticalCount).toBeGreaterThan(0);
      expect(scan.secretLeaksCount).toBeGreaterThan(0);
      expect(scan.isCosignVerified).toBe(false);
      expect(scan.securityScore).toBeLessThan(50);
    });

    it('validates distroless multi-stage image with Cosign verification', () => {
      const img = getHardenedDistrolessImage();
      const scan = scanImageSecurity(img);
      expect(scan.criticalCount).toBe(0);
      expect(scan.secretLeaksCount).toBe(0);
      expect(scan.isCosignVerified).toBe(true);
      expect(scan.securityScore).toBe(100);
    });
  });

  describe('Container Breakout & Escape Vectors', () => {
    it('detects breakout when docker.sock is mounted into container', () => {
      const res = testEscapeVulnerability({
        scenarioId: 'docker_socket_mount',
        hasHostSockMounted: true,
        isPrivileged: false,
        hasCapSysAdmin: false,
        hasReadOnlyRootFs: false,
        isRootlessContainer: false,
        seccompEnabled: true,
      });
      expect(res.escaped).toBe(true);
      expect(res.severity).toBe('CRITICAL');
    });

    it('blocks escape completely when rootless container mode is active', () => {
      const res = testEscapeVulnerability({
        scenarioId: 'docker_socket_mount',
        hasHostSockMounted: true,
        isPrivileged: true,
        hasCapSysAdmin: true,
        hasReadOnlyRootFs: false,
        isRootlessContainer: true,
        seccompEnabled: true,
      });
      expect(res.escaped).toBe(false);
      expect(res.severity).toBe('SAFE');
    });
  });

  describe('Kubernetes Control Plane & CIS Benchmark', () => {
    it('audits default insecure control plane config with failing score', () => {
      const cfg = getInitialControlPlaneConfig();
      const audit = evaluateCisKubernetesBenchmark(cfg);
      expect(audit.score).toBeLessThan(50);
      expect(audit.grade).toBe('CRITICAL_FAIL');
    });

    it('achieves CIS Compliant grade when hardened flags are set', () => {
      const cfg = {
        anonymousAuthDisabled: true,
        insecurePortDisabled: true,
        etcdTlsClientAuthEnabled: true,
        etcdEncryptionConfigEnabled: true,
        auditLoggingEnabled: true,
        kubeletNodeRestrictionEnabled: true,
        kubeletAlwaysPullImagesEnabled: true,
        cisBenchmarkScore: 100,
      };
      const audit = evaluateCisKubernetesBenchmark(cfg);
      expect(audit.score).toBe(100);
      expect(audit.grade).toBe('CIS_COMPLIANT');
    });
  });

  describe('Kubernetes RBAC Privilege Escalation', () => {
    it('flags wildcard (*) rules and pods/exec capabilities as critical findings', () => {
      const { roles } = getInitialClusterRoles();
      const audit = auditKubernetesRbac(roles);
      expect(audit.wildcardRolesCount).toBeGreaterThan(0);
      expect(audit.podExecRolesCount).toBeGreaterThan(0);
      expect(audit.isCompliant).toBe(false);
    });
  });

  describe('Pod Security Standards & Context', () => {
    it('evaluates default web pod as Privileged / Non-compliant with Restricted', () => {
      const pods = getInitialClusterPods();
      const webPod = pods[0];
      const pss = evaluatePodSecurityStandard(webPod);
      expect(pss.meetsRestricted).toBe(false);
    });
  });

  describe('Kubernetes NetworkPolicy Engine', () => {
    it('allows open lateral traversal between pods when no NetworkPolicy is applied', () => {
      const pods = getInitialClusterPods();
      const policies = getInitialNetworkPolicies(); // empty
      const res = evaluatePacketFlow(
        {
          srcPodId: 'pod-frontend-web',
          dstPodId: 'pod-postgres-db',
          dstPort: 5432,
          protocol: 'TCP',
        },
        pods,
        policies
      );
      expect(res.allowed).toBe(true);
      expect(res.isLateralAttackAttempt).toBe(true);
    });

    it('blocks frontend access to database when default-deny ingress policy is present', () => {
      const pods = getInitialClusterPods();
      const policies = [
        {
          id: 'np-db-deny',
          name: 'db-default-deny',
          namespace: 'database',
          podSelector: {},
          policyTypes: ['Ingress' as const],
          ingressRules: [
            {
              from: [{ podSelector: { app: 'backend' } }],
              ports: [{ protocol: 'TCP' as const, port: 5432 }],
            },
          ],
          egressRules: [],
          enabled: true,
        },
      ];

      const res = evaluatePacketFlow(
        {
          srcPodId: 'pod-frontend-web',
          dstPodId: 'pod-postgres-db',
          dstPort: 5432,
          protocol: 'TCP',
        },
        pods,
        policies
      );
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe('BLOCKED_BY_DEFAULT_DENY');
    });
  });

  describe('Kubernetes Secrets Security', () => {
    it('audits plaintext Base64 secrets in etcd and scores accordingly', () => {
      const secrets = getInitialClusterSecrets();
      const audit = auditSecretsSecurity(secrets, false);
      expect(audit.unencryptedCount).toBeGreaterThan(0);
      expect(audit.securityScore).toBeLessThanOrEqual(50);
    });
  });

  describe('Falco & eBPF Runtime Detection', () => {
    it('intercepts interactive shell spawning in container and triggers alert', () => {
      const rules = getInitialFalcoRules();
      const { matchedRule, runtimeEvent, triggeredQuarantine } = evaluateSyscallEvent(
        {
          podName: 'frontend-pod',
          namespace: 'production',
          containerId: 'cnt-1',
          syscall: 'execve',
          process: 'bash',
          parentProcess: 'python3',
          arguments: '/bin/bash',
          virtualTime: 100,
        },
        rules
      );

      expect(matchedRule).not.toBeNull();
      expect(matchedRule?.id).toBe('rule-spawn-shell-in-container');
      expect(runtimeEvent).not.toBeNull();
      expect(triggeredQuarantine).toBe(true);
    });
  });

  describe('Admission Controllers (OPA & Kyverno)', () => {
    it('blocks admission of privileged container', () => {
      const pods = getInitialClusterPods();
      const privPod = {
        ...pods[0],
        securityContext: { ...pods[0].securityContext, privileged: true },
      };
      const policies = getInitialAdmissionPolicies();
      const res = validatePodAdmission(privPod, policies);
      expect(res.admitted).toBe(false);
      expect(res.blockedPolicyRules.some((r) => r.id === 'k8s-disallow-privileged')).toBe(true);
    });
  });

  describe('Container Anti-Cheat Engine', () => {
    it('starts with 0% score and unfulfilled criteria', () => {
      const flags = getInitialContainerAntiCheatFlags();
      const evalResult = evaluateContainerMasterChallenge(flags);
      expect(evalResult.isMastered).toBe(false);
      expect(evalResult.score).toBe(0);
      expect(evalResult.completedTasks).toBe(0);
    });

    it('achieves mastery when all 7 defensive criteria are strictly met', () => {
      const flags = {
        imageSecuredWithNonRootAndDistroless: true,
        dangerousCapabilitiesDropped: true,
        hostSockAndPrivilegedDisabled: true,
        rbacWildcardsAndExecEliminated: true,
        defaultDenyNetworkPolicyEnforced: true,
        etcdKmsEncryptionEnabled: true,
        falcoRuntimeRulesActiveAndQuarantineVerified: true,
      };
      const evalResult = evaluateContainerMasterChallenge(flags);
      expect(evalResult.isMastered).toBe(true);
      expect(evalResult.score).toBe(100);
      expect(evalResult.completedTasks).toBe(7);
      expect(evalResult.remainingTasksAr.length).toBe(0);
    });
  });
});
