/**
 * OMEGA V14 — Containers & Kubernetes Security World
 * Core Type Definitions & Data Structures
 * Deterministic, comprehensive model of Container & K8s Security.
 */

export type LinuxNamespaceType = 'pid' | 'net' | 'mnt' | 'ipc' | 'uts' | 'user' | 'cgroup';

export interface LinuxNamespaceConfig {
  type: LinuxNamespaceType;
  isolated: boolean;
  hostValue: string;
  containerValue: string;
  riskDescriptionAr: string;
  riskDescriptionEn: string;
}

export interface CgroupsLimits {
  cpuLimitCores: number; // e.g., 0.5 cores
  memoryLimitMb: number; // e.g., 256 MB
  pidsMax: number; // e.g., 64 processes
  enforceOomKiller: boolean;
  throttleCpu: boolean;
}

export type LinuxCapability =
  | 'CAP_CHOWN'
  | 'CAP_DAC_OVERRIDE'
  | 'CAP_FOWNER'
  | 'CAP_FSETID'
  | 'CAP_KILL'
  | 'CAP_SETGID'
  | 'CAP_SETUID'
  | 'CAP_SETPCAP'
  | 'CAP_NET_BIND_SERVICE'
  | 'CAP_NET_RAW'
  | 'CAP_NET_ADMIN'
  | 'CAP_SYS_PTRACE'
  | 'CAP_SYS_ADMIN'
  | 'CAP_SYS_MODULE'
  | 'CAP_SYS_RAWIO'
  | 'CAP_SYS_BOOT'
  | 'CAP_AUDIT_WRITE';

export interface ImageVulnerability {
  cveId: string;
  package: string;
  installedVersion: string;
  fixedVersion: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvss: number;
  descriptionAr: string;
  descriptionEn: string;
  exploitableInContainer: boolean;
}

export interface ContainerImageLayer {
  id: string;
  instruction: string;
  sizeMb: number;
  hasSecretLeak: boolean;
  leakedSecretType?: string;
  vulnerabilities: ImageVulnerability[];
}

export interface ContainerImage {
  id: string;
  repository: string;
  tag: string;
  digest: string;
  baseImage: 'ubuntu:latest' | 'debian:slim' | 'alpine:3.19' | 'gcr.io/distroless/static';
  isSignedCosign: boolean;
  signerIdentity?: string;
  layers: ContainerImageLayer[];
  runsAsUser: string; // e.g. "root" (0) or "appuser" (10001)
  hasMultiStageBuild: boolean;
}

export interface ContainerSecurityContext {
  privileged: boolean;
  runAsNonRoot: boolean;
  runAsUser: number;
  readOnlyRootFilesystem: boolean;
  allowPrivilegeEscalation: boolean;
  capabilitiesDrop: LinuxCapability[];
  capabilitiesAdd: LinuxCapability[];
  seccompProfile: 'Unconfined' | 'RuntimeDefault' | 'CustomRestricted';
  appArmorProfile: 'unconfined' | 'docker-default' | 'k8s-restricted-app';
}

export interface ContainerVolumeMount {
  name: string;
  mountPath: string;
  hostPath?: string;
  isReadOnly: boolean;
  isSensitiveHostMount: boolean; // e.g., /var/run/docker.sock, /proc, /etc
}

export interface KubernetesPod {
  id: string;
  name: string;
  namespace: string;
  labels: Record<string, string>;
  ip: string;
  nodeName: string;
  serviceAccountName: string;
  automountServiceAccountToken: boolean;
  securityContext: ContainerSecurityContext;
  volumeMounts: ContainerVolumeMount[];
  image: ContainerImage;
  status: 'Running' | 'Pending' | 'Terminated' | 'Quarantined' | 'CrashLoopBackOff';
  isCompromised: boolean;
}

export interface NetworkPolicyPort {
  protocol: 'TCP' | 'UDP';
  port: number;
}

export interface NetworkPolicyPeer {
  podSelector?: Record<string, string>;
  namespaceSelector?: Record<string, string>;
  ipBlock?: {
    cidr: string;
    except?: string[];
  };
}

export interface KubernetesNetworkPolicy {
  id: string;
  name: string;
  namespace: string;
  podSelector: Record<string, string>; // Empty {} means applies to all pods in namespace
  policyTypes: ('Ingress' | 'Egress')[];
  ingressRules: {
    from: NetworkPolicyPeer[];
    ports: NetworkPolicyPort[];
  }[];
  egressRules: {
    to: NetworkPolicyPeer[];
    ports: NetworkPolicyPort[];
  }[];
  enabled: boolean;
}

export type RbacVerb = 'get' | 'list' | 'watch' | 'create' | 'update' | 'patch' | 'delete' | 'exec' | 'impersonate' | 'escalate' | '*';

export interface RbacPolicyRule {
  apiGroups: string[];
  resources: string[];
  verbs: RbacVerb[];
}

export interface KubernetesRole {
  id: string;
  name: string;
  namespace: string; // empty string if ClusterRole
  isClusterRole: boolean;
  rules: RbacPolicyRule[];
}

export interface KubernetesRoleBinding {
  id: string;
  name: string;
  namespace: string;
  isClusterRoleBinding: boolean;
  roleRefName: string;
  subjects: {
    kind: 'User' | 'Group' | 'ServiceAccount';
    name: string;
    namespace?: string;
  }[];
}

export interface KubernetesSecret {
  id: string;
  name: string;
  namespace: string;
  secretType: 'Opaque' | 'kubernetes.io/tls' | 'kubernetes.io/service-account-token';
  encryptedAtRest: boolean;
  encryptionProvider?: 'aesgcm' | 'kms-envelope' | 'none';
  managedByExternalVault: boolean;
  keys: { key: string; valueMasked: string; sensitive: boolean }[];
}

export interface ControlPlaneConfig {
  anonymousAuthDisabled: boolean;
  insecurePortDisabled: boolean;
  etcdTlsClientAuthEnabled: boolean;
  etcdEncryptionConfigEnabled: boolean;
  auditLoggingEnabled: boolean;
  kubeletNodeRestrictionEnabled: boolean;
  kubeletAlwaysPullImagesEnabled: boolean;
  cisBenchmarkScore: number; // 0 - 100
}

export interface FalcoRule {
  id: string;
  name: string;
  descriptionAr: string;
  descriptionEn: string;
  condition: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'NOTICE' | 'INFO';
  outputTemplate: string;
  enabled: boolean;
  autoQuarantineOnMatch: boolean;
}

export interface RuntimeSecurityEvent {
  id: string;
  virtualTime: number;
  ruleId: string;
  ruleName: string;
  podName: string;
  namespace: string;
  containerId: string;
  syscall: string;
  process: string;
  parentProcess: string;
  arguments: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'NOTICE' | 'INFO';
  blocked: boolean;
  descriptionAr: string;
  descriptionEn: string;
}

export interface ContainerAntiCheatFlags {
  imageSecuredWithNonRootAndDistroless: boolean;
  dangerousCapabilitiesDropped: boolean;
  hostSockAndPrivilegedDisabled: boolean;
  rbacWildcardsAndExecEliminated: boolean;
  defaultDenyNetworkPolicyEnforced: boolean;
  etcdKmsEncryptionEnabled: boolean;
  falcoRuntimeRulesActiveAndQuarantineVerified: boolean;
}
