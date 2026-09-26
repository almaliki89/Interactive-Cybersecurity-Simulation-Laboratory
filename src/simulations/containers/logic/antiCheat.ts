/**
 * OMEGA V14 — Container & Kubernetes Security Anti-Cheat Engine
 * Validates genuine user state configuration changes and enforces non-bypassable mastery criteria.
 */

import { ContainerAntiCheatFlags } from './types';

export function getInitialContainerAntiCheatFlags(): ContainerAntiCheatFlags {
  return {
    imageSecuredWithNonRootAndDistroless: false,
    dangerousCapabilitiesDropped: false,
    hostSockAndPrivilegedDisabled: false,
    rbacWildcardsAndExecEliminated: false,
    defaultDenyNetworkPolicyEnforced: false,
    etcdKmsEncryptionEnabled: false,
    falcoRuntimeRulesActiveAndQuarantineVerified: false,
  };
}

export function evaluateContainerMasterChallenge(flags: ContainerAntiCheatFlags): {
  isMastered: boolean;
  score: number;
  completedTasks: number;
  totalTasks: number;
  remainingTasksAr: string[];
  remainingTasksEn: string[];
} {
  const criteria = [
    {
      key: 'imageSecuredWithNonRootAndDistroless',
      passed: flags.imageSecuredWithNonRootAndDistroless,
      descAr: 'تحصين صورة الحاوية (التحول لـ Distroless، إلغاء صلاحيات Root، وفحص CVEs)',
      descEn: 'Container Image Hardening (Distroless base, non-root user 10001, zero critical CVEs)',
    },
    {
      key: 'dangerousCapabilitiesDropped',
      passed: flags.dangerousCapabilitiesDropped,
      descAr: 'إسقاط صلاحيات لينكس الخطرة عبر capabilities.drop: ["ALL"]',
      descEn: 'Drop dangerous Linux capabilities using drop: ["ALL"]',
    },
    {
      key: 'hostSockAndPrivilegedDisabled',
      passed: flags.hostSockAndPrivilegedDisabled,
      descAr: 'إزالة مقبس docker.sock وتعطيل privileged: true لمنع هروب الحاويات',
      descEn: 'Remove docker.sock volume mount and disable privileged: true to block breakout',
    },
    {
      key: 'rbacWildcardsAndExecEliminated',
      passed: flags.rbacWildcardsAndExecEliminated,
      descAr: 'تطهير أدوار K8s RBAC من النجوم (*) وصلاحيات pods/exec غير المقيدة',
      descEn: 'Sanitize K8s RBAC roles by removing wildcard grants (*) and unconstrained pods/exec',
    },
    {
      key: 'defaultDenyNetworkPolicyEnforced',
      passed: flags.defaultDenyNetworkPolicyEnforced,
      descAr: 'فرض سياسة عزل شبكية Default Deny وحظر استعلام الميتاداتا 169.254.169.254',
      descEn: 'Enforce Default Deny NetworkPolicy and block Cloud Metadata 169.254.169.254 egress',
    },
    {
      key: 'etcdKmsEncryptionEnabled',
      passed: flags.etcdKmsEncryptionEnabled,
      descAr: 'تفعيل تشفير أسرار Kubernetes أثناء التخزين في etcd (EncryptionConfiguration KMS)',
      descEn: 'Enable Kubernetes Secrets encryption at rest in etcd using KMS provider',
    },
    {
      key: 'falcoRuntimeRulesActiveAndQuarantineVerified',
      passed: flags.falcoRuntimeRulesActiveAndQuarantineVerified,
      descAr: 'تفعيل مستشعرات Falco eBPF وعزل الحاويات المخترقة فورياً',
      descEn: 'Activate Falco eBPF runtime rules with automated compromised pod quarantine',
    },
  ];

  let completedTasks = 0;
  const remainingTasksAr: string[] = [];
  const remainingTasksEn: string[] = [];

  for (const c of criteria) {
    if (c.passed) {
      completedTasks++;
    } else {
      remainingTasksAr.push(c.descAr);
      remainingTasksEn.push(c.descEn);
    }
  }

  const totalTasks = criteria.length;
  const score = Math.round((completedTasks / totalTasks) * 100);
  const isMastered = completedTasks === totalTasks;

  return {
    isMastered,
    score,
    completedTasks,
    totalTasks,
    remainingTasksAr,
    remainingTasksEn,
  };
}
