/**
 * OMEGA V14 — Container & Kubernetes Event Normalization
 * Deterministic mapping of K8s audit events, Falco alerts, and container state changes.
 */

import { SecurityTelemetryEvent, TelemetrySeverity } from '../../soc/logic/telemetry';

export interface RawContainerEvent {
  id: string;
  eventType: 'POD_EXEC' | 'POD_QUARANTINED' | 'CONTAINER_BREAKOUT_ATTEMPT' | 'IMAGE_VULN_BLOCKED' | 'RBAC_ESCALATION_DETECTED' | 'NETWORK_POLICY_DROP' | 'ETCD_ENCRYPTION_TOGGLED';
  virtualTime: number;
  podName?: string;
  namespace?: string;
  containerId?: string;
  process?: string;
  sourceIp?: string;
  destinationIp?: string;
  destinationPort?: number;
  severity: TelemetrySeverity;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO';
  attributes: Record<string, unknown>;
}

export function normalizeContainerEvent(raw: RawContainerEvent): SecurityTelemetryEvent {
  return {
    id: `telemetry-k8s-${raw.id}`,
    sourceWorld: 'CONTAINERS',
    eventType: raw.eventType,
    virtualTime: raw.virtualTime,
    host: raw.podName ? `k8s-pod:${raw.namespace || 'default'}/${raw.podName}` : 'k8s-control-plane',
    user: (raw.attributes.user as string) || (raw.attributes.serviceAccount as string) || 'system:serviceaccount',
    sourceIp: raw.sourceIp || '10.244.0.1',
    destinationIp: raw.destinationIp,
    destinationPort: raw.destinationPort,
    process: raw.process,
    resource: raw.podName,
    severity: raw.severity,
    category: 'CONTAINER_K8S_SECURITY',
    outcome: raw.outcome,
    rawEventId: raw.id,
    attributes: {
      ...raw.attributes,
      namespace: raw.namespace,
      containerId: raw.containerId,
    },
  };
}
