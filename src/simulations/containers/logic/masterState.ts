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

  // Check 3: Architecture Validation
  const archEval = validateKubernetesArchitecture(state);
  if (!archEval.passed) {
    failedChecks.push(...archEval.failedChecks);
  }

  // Check 4: Anti-Cheat Violations
  if (state.antiCheatFlags?.noStateTampering === false) {
    antiCheatViolations.push('Direct state tampering or unauthorized bypass detected.');
  }

  // Check 5: RBAC Specific Evaluation
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
