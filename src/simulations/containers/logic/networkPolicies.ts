/**
 * OMEGA V14 — Kubernetes NetworkPolicy Engine
 * Evaluates declarative CNI network policies, default deny-all, lateral movement blocking, and metadata protection.
 */

import { KubernetesNetworkPolicy, KubernetesPod } from './types';

export interface PacketFlowTestRequest {
  srcPodId: string;
  dstPodId: string;
  dstPort: number;
  protocol: 'TCP' | 'UDP';
  isExternalIp?: boolean;
  externalIpTarget?: string;
}

export interface PacketFlowEvaluationResult {
  allowed: boolean;
  verdict: 'ALLOWED_BY_POLICY' | 'BLOCKED_BY_DEFAULT_DENY' | 'BLOCKED_BY_EGRESS_POLICY' | 'ALLOWED_OPEN_CLUSTER_DEFAULT';
  matchingPolicyNames: string[];
  reasonAr: string;
  reasonEn: string;
  isLateralAttackAttempt: boolean;
}

export function getInitialClusterPods(): KubernetesPod[] {
  return [
    {
      id: 'pod-frontend-web',
      name: 'frontend-service-67b8-x1',
      namespace: 'production',
      labels: { app: 'frontend', tier: 'public' },
      ip: '10.244.1.12',
      nodeName: 'worker-node-1',
      serviceAccountName: 'frontend-sa',
      automountServiceAccountToken: true,
      status: 'Running',
      isCompromised: false,
      securityContext: {
        privileged: false,
        runAsNonRoot: false,
        runAsUser: 0,
        readOnlyRootFilesystem: false,
        allowPrivilegeEscalation: true,
        capabilitiesDrop: [],
        capabilitiesAdd: ['CAP_NET_RAW'],
        seccompProfile: 'Unconfined',
        appArmorProfile: 'unconfined',
      },
      volumeMounts: [],
      image: {
        id: 'img-frontend',
        repository: 'registry.nexora.internal/frontend',
        tag: 'v1.4',
        digest: 'sha256:abc1',
        baseImage: 'ubuntu:latest',
        isSignedCosign: false,
        runsAsUser: 'root',
        hasMultiStageBuild: false,
        layers: [],
      },
    },
    {
      id: 'pod-backend-api',
      name: 'backend-api-98c4-z2',
      namespace: 'production',
      labels: { app: 'backend', tier: 'internal' },
      ip: '10.244.2.45',
      nodeName: 'worker-node-2',
      serviceAccountName: 'backend-sa',
      automountServiceAccountToken: false,
      status: 'Running',
      isCompromised: false,
      securityContext: {
        privileged: false,
        runAsNonRoot: true,
        runAsUser: 10001,
        readOnlyRootFilesystem: true,
        allowPrivilegeEscalation: false,
        capabilitiesDrop: ['CAP_SYS_ADMIN'],
        capabilitiesAdd: [],
        seccompProfile: 'RuntimeDefault',
        appArmorProfile: 'docker-default',
      },
      volumeMounts: [],
      image: {
        id: 'img-backend',
        repository: 'registry.nexora.internal/backend',
        tag: 'v2.1',
        digest: 'sha256:def2',
        baseImage: 'debian:slim',
        isSignedCosign: true,
        runsAsUser: 'appuser',
        hasMultiStageBuild: true,
        layers: [],
      },
    },
    {
      id: 'pod-postgres-db',
      name: 'postgres-database-01',
      namespace: 'database',
      labels: { app: 'postgres', role: 'database' },
      ip: '10.244.3.88',
      nodeName: 'worker-node-2',
      serviceAccountName: 'db-sa',
      automountServiceAccountToken: false,
      status: 'Running',
      isCompromised: false,
      securityContext: {
        privileged: false,
        runAsNonRoot: true,
        runAsUser: 999,
        readOnlyRootFilesystem: false,
        allowPrivilegeEscalation: false,
        capabilitiesDrop: ['CAP_SYS_ADMIN'],
        capabilitiesAdd: [],
        seccompProfile: 'RuntimeDefault',
        appArmorProfile: 'docker-default',
      },
      volumeMounts: [],
      image: {
        id: 'img-postgres',
        repository: 'postgres',
        tag: '16-alpine',
        digest: 'sha256:pg16',
        baseImage: 'alpine:3.19',
        isSignedCosign: true,
        runsAsUser: 'postgres',
        hasMultiStageBuild: false,
        layers: [],
      },
    },
    {
      id: 'pod-payment-vault',
      name: 'payment-vault-service-0',
      namespace: 'payments-secure',
      labels: { app: 'vault', tier: 'financial-pci' },
      ip: '10.244.4.19',
      nodeName: 'worker-node-1',
      serviceAccountName: 'vault-sa',
      automountServiceAccountToken: false,
      status: 'Running',
      isCompromised: false,
      securityContext: {
        privileged: false,
        runAsNonRoot: true,
        runAsUser: 10001,
        readOnlyRootFilesystem: true,
        allowPrivilegeEscalation: false,
        capabilitiesDrop: ['CAP_SYS_ADMIN'],
        capabilitiesAdd: [],
        seccompProfile: 'RuntimeDefault',
        appArmorProfile: 'k8s-restricted-app',
      },
      volumeMounts: [],
      image: {
        id: 'img-vault',
        repository: 'registry.nexora.internal/vault',
        tag: 'v1.0-secure',
        digest: 'sha256:vault1',
        baseImage: 'gcr.io/distroless/static',
        isSignedCosign: true,
        runsAsUser: 'nonroot',
        hasMultiStageBuild: true,
        layers: [],
      },
    },
  ];
}

export function getInitialNetworkPolicies(): KubernetesNetworkPolicy[] {
  return [
    // Initially empty / open cluster (default k8s behavior before hardening)
  ];
}

export function evaluatePacketFlow(
  request: PacketFlowTestRequest,
  pods: KubernetesPod[],
  policies: KubernetesNetworkPolicy[]
): PacketFlowEvaluationResult {
  const srcPod = pods.find((p) => p.id === request.srcPodId);
  const dstPod = pods.find((p) => p.id === request.dstPodId);

  // Check External Cloud Metadata Egress attempt (169.254.169.254)
  if (request.isExternalIp && request.externalIpTarget === '169.254.169.254') {
    const activeEgressPolicies = policies.filter(
      (p) => p.enabled && p.namespace === srcPod?.namespace && p.policyTypes.includes('Egress')
    );

    if (activeEgressPolicies.length > 0) {
      // Check if policy specifically blocks 169.254.169.254
      const blocksMetadata = activeEgressPolicies.some((p) =>
        p.egressRules.some((r) =>
          r.to.some((peer) => peer.ipBlock?.except?.includes('169.254.169.254/32') || peer.ipBlock?.cidr === '10.0.0.0/8')
        )
      );

      if (blocksMetadata) {
        return {
          allowed: false,
          verdict: 'BLOCKED_BY_EGRESS_POLICY',
          matchingPolicyNames: activeEgressPolicies.map((p) => p.name),
          reasonAr: 'تم حظر طلب استعلام عنوان الميتاداتا السحابي (169.254.169.254) بنجاح بواسطة سياسة الخروج Egress NetworkPolicy.',
          reasonEn: 'Cloud Metadata (169.254.169.254) query successfully blocked by Egress NetworkPolicy.',
          isLateralAttackAttempt: false,
        };
      }
    }

    return {
      allowed: true,
      verdict: 'ALLOWED_OPEN_CLUSTER_DEFAULT',
      matchingPolicyNames: [],
      reasonAr: 'خطر حرج: تمكنت الحاوية من استعلام عنوان الميتاداتا السحابي 169.254.169.254 وسرقة مفاتيح IAM المؤقتة بسبب غياب سياسات Egress!',
      reasonEn: 'Critical Risk: Pod reached Cloud Metadata endpoint (169.254.169.254) and harvested IAM tokens due to missing Egress NetworkPolicy!',
      isLateralAttackAttempt: false,
    };
  }

  if (!srcPod || !dstPod) {
    return {
      allowed: false,
      verdict: 'BLOCKED_BY_DEFAULT_DENY',
      matchingPolicyNames: [],
      reasonAr: 'الحزمة موجهة لـ Pod غير موجود.',
      reasonEn: 'Packet directed to non-existent Pod.',
      isLateralAttackAttempt: false,
    };
  }

  const isDirectFrontendToDbOrVault =
    srcPod.labels.app === 'frontend' && (dstPod.labels.app === 'postgres' || dstPod.labels.app === 'vault');

  // Check Ingress policies on destination pod's namespace
  const activeIngressPolicies = policies.filter(
    (p) => p.enabled && p.namespace === dstPod.namespace && p.policyTypes.includes('Ingress')
  );

  if (activeIngressPolicies.length === 0) {
    // Open default K8s cluster
    return {
      allowed: true,
      verdict: 'ALLOWED_OPEN_CLUSTER_DEFAULT',
      matchingPolicyNames: [],
      reasonAr: isDirectFrontendToDbOrVault
        ? 'تسرب جانبي حرج: خادم الويب العام (frontend) يتصل مباشرة بقاعدة البيانات الحساسة بدون أي عزل شبكي!'
        : 'الاتصال مسموح تلقائياً (الوضع الافتراضي لكوبرنيتيس بدون سياسات شبكة).',
      reasonEn: isDirectFrontendToDbOrVault
        ? 'Dangerous Lateral Path: Public frontend is connecting directly to sensitive DB/Vault with zero network segmentation!'
        : 'Connection permitted by default open Kubernetes flat network.',
      isLateralAttackAttempt: isDirectFrontendToDbOrVault,
    };
  }

  // Evaluate Ingress rules
  let matchedIngress = false;
  const matchedPolicies: string[] = [];

  for (const pol of activeIngressPolicies) {
    for (const rule of pol.ingressRules) {
      // Check from peer
      const peerMatched = rule.from.some((peer) => {
        if (peer.podSelector) {
          return Object.entries(peer.podSelector).every(([k, v]) => srcPod.labels[k] === v);
        }
        if (peer.namespaceSelector) {
          return peer.namespaceSelector.name === srcPod.namespace;
        }
        return false;
      });

      // Check port
      const portMatched =
        rule.ports.length === 0 || rule.ports.some((p) => p.port === request.dstPort && p.protocol === request.protocol);

      if (peerMatched && portMatched) {
        matchedIngress = true;
        matchedPolicies.push(pol.name);
      }
    }
  }

  if (matchedIngress) {
    return {
      allowed: true,
      verdict: 'ALLOWED_BY_POLICY',
      matchingPolicyNames: matchedPolicies,
      reasonAr: `الاتصال مصرح به وفق السياسة المعتمدة (${matchedPolicies.join(', ')}).`,
      reasonEn: `Connection explicitly authorized by NetworkPolicy (${matchedPolicies.join(', ')}).`,
      isLateralAttackAttempt: false,
    };
  } else {
    return {
      allowed: false,
      verdict: 'BLOCKED_BY_DEFAULT_DENY',
      matchingPolicyNames: activeIngressPolicies.map((p) => p.name),
      reasonAr: `تم حظر الاتصال بنجاح بواسطة سياسة العزل الافتراضية (Default Deny Ingress) لحماية الـ Pod (${dstPod.name}).`,
      reasonEn: `Packet rejected by Default Deny Ingress NetworkPolicy protecting Pod (${dstPod.name}).`,
      isLateralAttackAttempt: isDirectFrontendToDbOrVault,
    };
  }
}

export interface PodNetworkTarget {
  name: string;
  namespace: string;
  labels: Record<string, string>;
  ip?: string;
}

export interface PodNetworkReachabilityParams {
  srcPod: PodNetworkTarget;
  dstPod: PodNetworkTarget;
  dstPort: number;
  protocol?: 'TCP' | 'UDP';
  isExternal?: boolean;
}

export interface PodNetworkReachabilityResult {
  reachable: boolean;
  matchedIngressPolicy?: KubernetesNetworkPolicy;
  matchedEgressPolicy?: KubernetesNetworkPolicy;
  reasonEn: string;
  reasonAr: string;
}

export function evaluatePodNetworkReachability(
  params: PodNetworkReachabilityParams,
  policies: KubernetesNetworkPolicy[]
): PodNetworkReachabilityResult {
  const { srcPod, dstPod, dstPort, protocol = 'TCP', isExternal = false } = params;

  // Handle external reachability (Internet / External IP)
  if (isExternal || srcPod.namespace === 'external' || dstPod.namespace === 'external') {
    if (srcPod.namespace === 'external') {
      if (dstPod.namespace === 'frontend') {
        return {
          reachable: true,
          reasonEn: 'Internet traffic to public frontend ingress is ALLOWED.',
          reasonAr: 'حركة المرور العامة من الإنترنت لمشغل العرض frontend مسموحة.',
        };
      }
      if (dstPod.namespace === 'finance' || dstPod.namespace === 'database' || dstPod.namespace === 'backend') {
        return {
          reachable: false,
          reasonEn: `Internet traffic directly to sensitive namespace "${dstPod.namespace}" is DENIED.`,
          reasonAr: `حظر حركة مرور الإنترنت المباشرة لنطاق الأسماء الحساس "${dstPod.namespace}".`,
        };
      }
    }

    if (dstPod.namespace === 'external') {
      if (srcPod.namespace === 'finance' || srcPod.namespace === 'database') {
        const activeEgress = policies.filter(
          (p) => p.enabled && p.namespace === srcPod.namespace && p.policyTypes.includes('Egress')
        );
        if (activeEgress.length > 0) {
          return {
            reachable: false,
            reasonEn: `Egress from sensitive namespace "${srcPod.namespace}" to Internet is DENIED by NetworkPolicy.`,
            reasonAr: `تم حظر الخروج من نطاق الأسماء الحساس "${srcPod.namespace}" إلى الإنترنت بواسطة سياسة الشبكة.`,
          };
        }
      }
    }
  }

  // Evaluate Ingress Policies on dstPod's namespace
  const activeIngressPolicies = policies.filter(
    (p) => p.enabled && p.namespace === dstPod.namespace && p.policyTypes.includes('Ingress')
  );

  let ingressAllowed = activeIngressPolicies.length === 0;
  let matchedIngressPol: KubernetesNetworkPolicy | undefined = undefined;

  if (activeIngressPolicies.length > 0) {
    ingressAllowed = false;
    for (const pol of activeIngressPolicies) {
      const matchesDstPod =
        Object.keys(pol.podSelector).length === 0 ||
        Object.entries(pol.podSelector).every(([k, v]) => dstPod.labels[k] === v);

      if (!matchesDstPod) continue;

      for (const rule of pol.ingressRules) {
        const fromMatched =
          rule.from.length === 0 ||
          rule.from.some((peer) => {
            if (peer.podSelector && Object.keys(peer.podSelector).length > 0) {
              const podOk = Object.entries(peer.podSelector).every(([k, v]) => srcPod.labels[k] === v);
              if (!podOk) return false;
            }
            if (peer.namespaceSelector && Object.keys(peer.namespaceSelector).length > 0) {
              const nsOk = peer.namespaceSelector.name === srcPod.namespace;
              if (!nsOk) return false;
            }
            return true;
          });

        const portMatched =
          rule.ports.length === 0 || rule.ports.some((p) => p.port === dstPort && p.protocol === protocol);

        if (fromMatched && portMatched) {
          ingressAllowed = true;
          matchedIngressPol = pol;
          break;
        }
      }
      if (ingressAllowed) break;
    }
  }

  // Evaluate Egress Policies on srcPod's namespace
  const activeEgressPolicies = policies.filter(
    (p) => p.enabled && p.namespace === srcPod.namespace && p.policyTypes.includes('Egress')
  );

  let egressAllowed = activeEgressPolicies.length === 0;
  let matchedEgressPol: KubernetesNetworkPolicy | undefined = undefined;

  if (activeEgressPolicies.length > 0) {
    egressAllowed = false;
    for (const pol of activeEgressPolicies) {
      const matchesSrcPod =
        Object.keys(pol.podSelector).length === 0 ||
        Object.entries(pol.podSelector).every(([k, v]) => srcPod.labels[k] === v);

      if (!matchesSrcPod) continue;

      for (const rule of pol.egressRules) {
        const toMatched =
          rule.to.length === 0 ||
          rule.to.some((peer) => {
            if (peer.podSelector && Object.keys(peer.podSelector).length > 0) {
              const podOk = Object.entries(peer.podSelector).every(([k, v]) => dstPod.labels[k] === v);
              if (!podOk) return false;
            }
            if (peer.namespaceSelector && Object.keys(peer.namespaceSelector).length > 0) {
              const nsName = peer.namespaceSelector.name || peer.namespaceSelector['name'];
              const nsOk = nsName ? nsName === dstPod.namespace : Object.entries(peer.namespaceSelector).every(([k, v]) => dstPod.namespace === v);
              if (!nsOk) return false;
            }
            return true;
          });

        const portMatched =
          rule.ports.length === 0 || rule.ports.some((p) => p.port === dstPort && p.protocol === protocol);

        if (toMatched && portMatched) {
          egressAllowed = true;
          matchedEgressPol = pol;
          break;
        }
      }
      if (egressAllowed) break;
    }
  }

  const reachable = ingressAllowed && egressAllowed;

  if (reachable) {
    return {
      reachable: true,
      matchedIngressPolicy: matchedIngressPol,
      matchedEgressPolicy: matchedEgressPol,
      reasonEn: `Reachability allowed between ${srcPod.namespace}/${srcPod.name} -> ${dstPod.namespace}/${dstPod.name}:${dstPort}.`,
      reasonAr: `الاتصال الشبكي متاح بين ${srcPod.namespace}/${srcPod.name} -> ${dstPod.namespace}/${dstPod.name}:${dstPort}.`,
    };
  }

  const reasonEn = !ingressAllowed
    ? `Traffic blocked by Ingress NetworkPolicy in namespace "${dstPod.namespace}".`
    : `Traffic blocked by Egress NetworkPolicy in namespace "${srcPod.namespace}".`;

  const reasonAr = !ingressAllowed
    ? `تم حظر الحركة بواسطة سياسة الدخول Ingress NetworkPolicy في النطاق "${dstPod.namespace}".`
    : `تم حظر الحركة بواسطة سياسة الخروج Egress NetworkPolicy في النطاق "${srcPod.namespace}".`;

  return {
    reachable: false,
    matchedIngressPolicy: matchedIngressPol,
    matchedEgressPolicy: matchedEgressPol,
    reasonEn,
    reasonAr,
  };
}
