/**
 * OMEGA V14 — Kubernetes Master State & Master Challenge Engine
 * Manages deterministic initial unsolved state, weakness injection, anti-cheat validation, and closure gates.
 */

import {
  KubernetesMasterState,
  KubernetesPod,
  KubernetesRole,
  KubernetesRoleBinding,
  KubernetesNetworkPolicy,
  KubernetesSecret,
  KubernetesNamespace,
  KubernetesServiceAccount,
  AuditConfig,
  ContainerImage,
} from './types';
import { getInitialAdmissionPolicies } from './admission';
import { evaluateKubernetesAuthorization } from './rbac';
import { evaluatePodNetworkReachability } from './networkPolicies';
import { validateKubernetesArchitecture } from './architecture';

export function createDefaultKubernetesMasterState(): KubernetesMasterState {
  const images: ContainerImage[] = [
    {
      id: 'img-frontend-v1',
      repository: 'registry.nexora.internal/frontend',
      tag: 'v1.4-unsecured',
      digest: 'sha256:front111',
      baseImage: 'ubuntu:latest',
      isSignedCosign: false, // WEAKNESS: Unsigned image
      runsAsUser: 'root', // WEAKNESS: Root user
      hasMultiStageBuild: false,
      layers: [
        {
          id: 'layer-01',
          instruction: 'ENV DB_PASSWORD="SyntheticHardcodedSecretValue123!"',
          sizeMb: 120,
          hasSecretLeak: true, // WEAKNESS: Embedded secret
          leakedSecretType: 'Hardcoded Password',
          vulnerabilities: [
            {
              cveId: 'CVE-2024-9999',
              package: 'openssl-legacy',
              installedVersion: '1.0.1',
              fixedVersion: '1.0.2',
              severity: 'CRITICAL', // WEAKNESS: Critical CVE
              cvss: 9.8,
              descriptionAr: 'ثغرة حرج تنفذ أوامر بعيدة داخل الحاوية.',
              descriptionEn: 'Critical RCE vulnerability in web container.',
              exploitableInContainer: true,
            },
          ],
        },
      ],
    },
    {
      id: 'img-backend-v1',
      repository: 'registry.nexora.internal/backend',
      tag: 'v2.1',
      digest: 'sha256:back222',
      baseImage: 'debian:slim',
      isSignedCosign: true,
      runsAsUser: 'appuser',
      hasMultiStageBuild: true,
      layers: [],
    },
    {
      id: 'img-finance-v1',
      repository: 'registry.nexora.internal/finance-api',
      tag: 'v1.0',
      digest: 'sha256:fin333',
      baseImage: 'gcr.io/distroless/static',
      isSignedCosign: true,
      runsAsUser: 'nonroot',
      hasMultiStageBuild: true,
      layers: [],
    },
  ];

  const pods: KubernetesPod[] = [
    {
      id: 'pod-frontend',
      name: 'frontend-service-67b8-x1',
      namespace: 'frontend',
      labels: { app: 'frontend', tier: 'public' },
      ip: '10.244.1.12',
      nodeName: 'worker-node-1',
      serviceAccountName: 'frontend-sa',
      automountServiceAccountToken: true, // WEAKNESS: Automount enabled
      status: 'Running',
      isCompromised: false,
      securityContext: {
        privileged: true, // WEAKNESS: Privileged container
        runAsNonRoot: false, // WEAKNESS: Root
        runAsUser: 0, // WEAKNESS: UID 0
        readOnlyRootFilesystem: false, // WEAKNESS: Writable rootfs
        allowPrivilegeEscalation: true, // WEAKNESS: Privilege escalation enabled
        capabilitiesDrop: [],
        capabilitiesAdd: ['CAP_NET_RAW', 'CAP_SYS_ADMIN'], // WEAKNESS: Dangerous capabilities
        seccompProfile: 'Unconfined',
        appArmorProfile: 'unconfined',
      },
      volumeMounts: [
        {
          name: 'dockersock',
          mountPath: '/var/run/docker.sock',
          hostPath: '/var/run/docker.sock',
          isReadOnly: false,
          isSensitiveHostMount: true, // WEAKNESS: Host socket mount
        },
      ],
      image: images[0],
    },
    {
      id: 'pod-backend',
      name: 'backend-api-98c4-z2',
      namespace: 'backend',
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
      image: images[1],
    },
    {
      id: 'pod-finance',
      name: 'finance-api-01',
      namespace: 'finance',
      labels: { app: 'finance-api', tier: 'financial' },
      ip: '10.244.3.88',
      nodeName: 'worker-node-2',
      serviceAccountName: 'finance-sa',
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
      image: images[2],
    },
  ];

  const namespaces: KubernetesNamespace[] = [
    { name: 'frontend', labels: { environment: 'production' }, status: 'Active' },
    { name: 'backend', labels: { environment: 'production' }, status: 'Active' },
    { name: 'finance', labels: { environment: 'production', tier: 'pci-dss' }, status: 'Active' },
    { name: 'monitoring', labels: { environment: 'ops' }, status: 'Active' },
    { name: 'security', labels: { environment: 'ops' }, status: 'Active' },
  ];

  const serviceAccounts: KubernetesServiceAccount[] = [
    { name: 'frontend-sa', namespace: 'frontend', automountServiceAccountToken: true },
    { name: 'backend-sa', namespace: 'backend', automountServiceAccountToken: false },
    { name: 'finance-sa', namespace: 'finance', automountServiceAccountToken: false },
  ];

  const roles: KubernetesRole[] = [
    {
      id: 'role-overprivileged-frontend',
      name: 'frontend-wildcard-role',
      namespace: 'frontend',
      isClusterRole: false,
      rules: [
        {
          apiGroups: ['*'],
          resources: ['*'],
          verbs: ['*'], // WEAKNESS: Overprivileged RBAC wildcard
        },
      ],
    },
    {
      id: 'role-cluster-admin-shadow',
      name: 'ci-runner-cluster-admin',
      namespace: '',
      isClusterRole: true,
      rules: [
        {
          apiGroups: ['*'],
          resources: ['*'],
          verbs: ['*'], // WEAKNESS: Cluster admin shadow binding
        },
      ],
    },
  ];

  const bindings: KubernetesRoleBinding[] = [
    {
      id: 'binding-frontend-sa',
      name: 'frontend-sa-wildcard-binding',
      namespace: 'frontend',
      isClusterRoleBinding: false,
      roleRefName: 'frontend-wildcard-role',
      subjects: [{ kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' }],
    },
    {
      id: 'binding-ci-runner',
      name: 'ci-runner-cluster-binding',
      namespace: '',
      isClusterRoleBinding: true,
      roleRefName: 'ci-runner-cluster-admin',
      subjects: [{ kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' }],
    },
  ];

  const networkPolicies: KubernetesNetworkPolicy[] = [
    // WEAKNESS: Empty network policies -> Open flat network
  ];

  const secrets: KubernetesSecret[] = [
    {
      id: 'sec-finance-db',
      name: 'finance-db-credentials',
      namespace: 'finance',
      secretType: 'Opaque',
      encryptedAtRest: false, // WEAKNESS: Unencrypted in etcd
      managedByExternalVault: false,
      keys: [{ key: 'db-password', valueMasked: '********', sensitive: true }],
    },
  ];

  const auditConfig: AuditConfig = {
    enabled: false, // WEAKNESS: Audit logging disabled
    policyLevel: 'None',
    logPath: '/var/log/kube-audit.log',
  };

  return {
    images,
    pods,
    namespaces,
    serviceAccounts,
    roles,
    bindings,
    networkPolicies,
    secrets,
    admissionPolicies: getInitialAdmissionPolicies(),
    auditConfig,
    testedAuthorizationsPassed: false, // Start UNSOLVED
    testedNetworkPathsPassed: false, // Start UNSOLVED
    antiCheatFlags: {
      imageSecuredWithNonRootAndDistroless: false,
      dangerousCapabilitiesDropped: false,
      hostSockAndPrivilegedDisabled: false,
      rbacWildcardsAndExecEliminated: false,
      defaultDenyNetworkPolicyEnforced: false,
      etcdKmsEncryptionEnabled: false,
      falcoRuntimeRulesActiveAndQuarantineVerified: false,
      noStateTampering: true,
    },
  };
}

export interface MasterValidationResult {
  isPassed: boolean;
  failedChecks: string[];
  antiCheatViolations: string[];
  businessContinuityPassed: boolean;
}

export function validateKubernetesMasterChallenge(state: KubernetesMasterState): MasterValidationResult {
  const failedChecks: string[] = [];
  const antiCheatViolations: string[] = [];

  // Check 1: Tested Authorizations Gate
  if (!state.testedAuthorizationsPassed) {
    failedChecks.push('testedAuthorizationsPassed gate incomplete');
  }

  // Check 2: Tested Network Paths Gate
  if (!state.testedNetworkPathsPassed) {
    failedChecks.push('testedNetworkPathsPassed gate incomplete');
  }

  // Explicit & Derived Anti-Cheat Checks (Requirement 2 & 3)
  const flags = state.antiCheatFlags || {};

  // 1. deleteProductionWorkloads
  const prodPodsRunning = state.pods.filter(
    (p) => ['frontend', 'backend', 'finance'].includes(p.namespace) && p.status === 'Running'
  );
  if (flags.deleteProductionWorkloads || prodPodsRunning.length === 0) {
    antiCheatViolations.push('Security remediation cannot delete required production workloads.');
  }

  // 2. scaleAllDeploymentsToZero
  const allPodsZero = state.pods.length === 0 || state.pods.every((p) => p.status === 'Terminated');
  if (flags.scaleAllDeploymentsToZero || allPodsZero) {
    antiCheatViolations.push('Hardening cannot make the production application unavailable.');
  }

  // 3. blockAllIngress
  const ingressReach = evaluatePodNetworkReachability(
    {
      srcPod: { name: 'internet-client', namespace: 'external', labels: {} },
      dstPod: { name: 'frontend-service', namespace: 'frontend', labels: { app: 'frontend' } },
      dstPort: 443,
      isExternal: true,
    },
    state.networkPolicies
  );
  if (flags.blockAllIngress || !ingressReach.reachable) {
    antiCheatViolations.push('Public customer entry point must remain reachable.');
  }

  // 4. blockAllEgress
  const backendFinanceReach = evaluatePodNetworkReachability(
    {
      srcPod: { name: 'backend-service', namespace: 'backend', labels: { app: 'backend' } },
      dstPod: { name: 'finance-api', namespace: 'finance', labels: { app: 'finance-api' } },
      dstPort: 8080,
    },
    state.networkPolicies
  );
  if (flags.blockAllEgress || !backendFinanceReach.reachable) {
    antiCheatViolations.push('Required backend and service dependencies must remain reachable.');
  }

  // 5. deleteAllSecrets
  if (flags.deleteAllSecrets || state.secrets.length === 0) {
    antiCheatViolations.push('Required application secrets must remain available to authorized workloads.');
  }

  // 6. grantEveryoneClusterAdmin
  const hasAppClusterAdmin = state.bindings.some(
    (b) =>
      b.roleRefName === 'cluster-admin' &&
      b.subjects.some((s) => ['frontend-sa', 'backend-sa', 'finance-sa'].includes(s.name))
  );
  if (flags.grantEveryoneClusterAdmin || hasAppClusterAdmin) {
    antiCheatViolations.push('Universal cluster-admin violates least privilege.');
  }

  // 7. disableAllServiceAccounts
  if (flags.disableAllServiceAccounts || state.serviceAccounts.length === 0) {
    antiCheatViolations.push('Legitimate workload identity must remain functional.');
  }

  // 8. deleteAllNetworkPoliciesToAvoidConflicts
  if (flags.deleteAllNetworkPoliciesToAvoidConflicts || state.networkPolicies.length === 0) {
    antiCheatViolations.push('Removing segmentation controls is not valid remediation.');
  }

  // 9. disableAuditToHideAlerts
  if (flags.disableAuditToHideAlerts || !state.auditConfig.enabled || state.auditConfig.policyLevel === 'None') {
    antiCheatViolations.push('Audit visibility must remain enabled.');
  }

  // 10. markImagesTrustedWithoutSignature
  const hasUnsignedImages =
    state.images.some((i) => !i.isSignedCosign) || state.pods.some((p) => !p.image.isSignedCosign);
  if (flags.markImagesTrustedWithoutSignature || hasUnsignedImages) {
    antiCheatViolations.push('Image trust cannot be asserted without cryptographic evidence.');
  }

  // 11. bypassAdmissionValidation
  const admissionDisabled =
    state.admissionPolicies.length === 0 || state.admissionPolicies.every((a) => a.enforceAction === 'DISABLED');
  if (flags.bypassAdmissionValidation || admissionDisabled) {
    antiCheatViolations.push('Admission controls cannot be bypassed.');
  }

  if (flags.noStateTampering === false) {
    antiCheatViolations.push('Direct state tampering or unauthorized bypass detected.');
  }

  // Architecture Validation
  const archEval = validateKubernetesArchitecture(state);
  if (!archEval.passed) {
    failedChecks.push(...archEval.failedChecks);
  }

  // RBAC Specific Evaluation
  const frontendFinanceSecretCheck = evaluateKubernetesAuthorization({
    subject: { kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' },
    verb: 'get',
    resource: 'secrets',
    namespace: 'finance',
    roles: state.roles,
    bindings: state.bindings,
  });

  if (frontendFinanceSecretCheck.allowed) {
    failedChecks.push('RBAC security failure: frontend-sa can read secrets in finance namespace');
  }

  const isPassed = failedChecks.length === 0 && antiCheatViolations.length === 0 && archEval.businessContinuityPassed;

  return {
    isPassed,
    failedChecks,
    antiCheatViolations,
    businessContinuityPassed: archEval.businessContinuityPassed,
  };
}

export function createHardenedKubernetesMasterState(): KubernetesMasterState {
  const base = createDefaultKubernetesMasterState();
  return {
    ...base,
    testedAuthorizationsPassed: true,
    testedNetworkPathsPassed: true,
    auditConfig: { enabled: true, policyLevel: 'RequestResponse', logPath: '/var/log/kube-audit.log' },
    secrets: [
      {
        id: 'sec-fin-1',
        name: 'finance-db-credentials',
        namespace: 'finance',
        secretType: 'Opaque',
        encryptedAtRest: true,
        managedByExternalVault: true,
        keys: [{ key: 'db-password', valueMasked: '********', sensitive: true }],
      },
    ],
    images: base.images.map((img) => ({
      ...img,
      isSignedCosign: true,
      runsAsUser: 'nonroot',
      layers: [],
    })),
    pods: base.pods.map((p) => ({
      ...p,
      image: {
        ...p.image,
        isSignedCosign: true,
        runsAsUser: 'nonroot',
        layers: [],
      },
      securityContext: {
        ...p.securityContext,
        privileged: false,
        runAsNonRoot: true,
        runAsUser: 10001,
        readOnlyRootFilesystem: true,
        allowPrivilegeEscalation: false,
        capabilitiesAdd: [],
        capabilitiesDrop: ['CAP_SYS_ADMIN', 'CAP_NET_ADMIN', 'CAP_NET_RAW'],
      },
      volumeMounts: [],
    })),
    roles: [
      {
        id: 'r-frontend',
        name: 'frontend-reader',
        namespace: 'frontend',
        isClusterRole: false,
        rules: [{ apiGroups: [''], resources: ['pods'], verbs: ['get', 'list'] }],
      },
    ],
    bindings: [
      {
        id: 'b-frontend',
        name: 'frontend-reader-binding',
        namespace: 'frontend',
        isClusterRoleBinding: false,
        roleRefName: 'frontend-reader',
        subjects: [{ kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' }],
      },
    ],
    networkPolicies: [
      {
        id: 'pol-deny-fin',
        name: 'default-deny-finance',
        namespace: 'finance',
        podSelector: {},
        policyTypes: ['Ingress', 'Egress'],
        ingressRules: [
          {
            from: [{ podSelector: { app: 'backend' } }],
            ports: [{ protocol: 'TCP', port: 8080 }],
          },
        ],
        egressRules: [],
        enabled: true,
      },
      {
        id: 'pol-allow-fb',
        name: 'allow-frontend-backend',
        namespace: 'backend',
        podSelector: { app: 'backend' },
        policyTypes: ['Ingress'],
        ingressRules: [
          {
            from: [{ podSelector: { app: 'frontend' } }],
            ports: [{ protocol: 'TCP', port: 443 }],
          },
        ],
        egressRules: [],
        enabled: true,
      },
    ],
    admissionPolicies: base.admissionPolicies.map((a) => ({ ...a, enforceAction: 'DENY' as const })),
    antiCheatFlags: {
      imageSecuredWithNonRootAndDistroless: true,
      dangerousCapabilitiesDropped: true,
      hostSockAndPrivilegedDisabled: true,
      rbacWildcardsAndExecEliminated: true,
      defaultDenyNetworkPolicyEnforced: true,
      etcdKmsEncryptionEnabled: true,
      falcoRuntimeRulesActiveAndQuarantineVerified: true,
      noStateTampering: true,
    },
  };
}
