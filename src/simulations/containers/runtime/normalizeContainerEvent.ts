/**
 * OMEGA V14 — Container & Kubernetes Event Normalization
 * Deterministic mapping of K8s audit events, Falco alerts, and container state changes.
 */

import { SecurityTelemetryEvent, TelemetrySeverity } from '../../soc/logic/telemetry';

export type K8sEventType =
  | 'K8S_AUTH_FAILURE'
  | 'K8S_RBAC_DENIED'
  | 'K8S_SECRET_READ'
  | 'K8S_PRIVILEGED_POD_CREATED'
  | 'K8S_CLUSTERROLEBINDING_CREATED'
  | 'K8S_NETWORK_POLICY_CHANGED'
  | 'K8S_UNSIGNED_IMAGE_DEPLOYED'
  | 'K8S_EXEC_INTO_POD'
  | 'K8S_SERVICEACCOUNT_TOKEN_USED'
  | 'K8S_AUDIT_POLICY_CHANGED'
  | 'K8S_API_ENUMERATION'
  | 'K8S_SENSITIVE_SERVICE_ACCESS'
  | 'POD_EXEC'
  | 'POD_QUARANTINED'
  | 'CONTAINER_BREAKOUT_ATTEMPT'
  | 'IMAGE_VULN_BLOCKED'
  | 'RBAC_ESCALATION_DETECTED'
  | 'NETWORK_POLICY_DROP'
  | 'ETCD_ENCRYPTION_TOGGLED';

export interface RawContainerEvent {
  id: string;
  eventType: K8sEventType | string;
  virtualTime: number;
  podName?: string;
  namespace?: string;
  containerId?: string;
  process?: string;
  sourceIp?: string;
  destinationIp?: string;
  destinationPort?: number;
  serviceAccount?: string;
  resource?: string;
  severity: TelemetrySeverity;
  outcome?: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO';
  attributes?: Record<string, unknown>;
}

export function normalizeContainerEvent(raw: RawContainerEvent): SecurityTelemetryEvent {
  const isK8sEvent =
    raw.eventType.startsWith('K8S_') ||
    ['RBAC_ESCALATION_DETECTED', 'ETCD_ENCRYPTION_TOGGLED'].includes(raw.eventType);

  const sourceWorld = isK8sEvent ? 'KUBERNETES' : 'CONTAINERS';
  const serviceAccount = raw.serviceAccount || (raw.attributes?.serviceAccount as string) || 'system:serviceaccount';
  const user = (raw.attributes?.user as string) || serviceAccount;
  const resource = raw.resource || raw.podName || (raw.attributes?.resource as string) || 'k8s-resource';
  const namespace = raw.namespace || (raw.attributes?.namespace as string) || 'default';
  const pod = raw.podName || (raw.attributes?.pod as string) || resource;

  return {
    id: `telemetry-k8s-${raw.id}`,
    sourceWorld,
    eventType: raw.eventType,
    virtualTime: raw.virtualTime,
    host: pod ? `k8s-pod:${namespace}/${pod}` : 'k8s-control-plane',
    user,
    sourceIp: raw.sourceIp || '10.244.0.1',
    destinationIp: raw.destinationIp,
    destinationPort: raw.destinationPort,
    process: raw.process,
    resource,
    severity: raw.severity,
    category: isK8sEvent ? 'KUBERNETES' : 'CONTAINERS',
    outcome: raw.outcome || 'INFO',
    rawEventId: raw.id,
    attributes: {
      ...raw.attributes,
      namespace,
      pod,
      serviceAccount,
      resource,
      containerId: raw.containerId,
    },
  };
}
