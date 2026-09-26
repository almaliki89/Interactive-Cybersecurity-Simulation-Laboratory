/**
 * OMEGA V15 — DevSecOps Event Normalization Engine
 * Normalizes SAST findings, Git secret leaks, and CI build quality gate events.
 */

import { SecurityTelemetryEvent, TelemetrySeverity } from '../../soc/logic/telemetry';

export interface RawDevSecOpsEvent {
  id: string;
  eventType: 'SAST_FINDING' | 'SCA_MALWARE_BLOCKED' | 'SECRET_LEAK_PREVENTED' | 'IAC_MISCONFIG_BLOCKED' | 'PIPELINE_GATE_TRIGGERED' | 'DRIFT_REMEDIATED';
  virtualTime: number;
  filePath?: string;
  ruleId?: string;
  repository?: string;
  severity: TelemetrySeverity;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO';
  attributes: Record<string, unknown>;
}

export function normalizeDevSecOpsEvent(raw: RawDevSecOpsEvent): SecurityTelemetryEvent {
  return {
    id: `telemetry-devsecops-${raw.id}`,
    sourceWorld: 'APPSEC',
    eventType: raw.eventType,
    virtualTime: raw.virtualTime,
    host: raw.repository || 'github.com/nexora/enterprise-platform',
    user: (raw.attributes.user as string) || (raw.attributes.committer as string) || 'ci-cd-runner',
    resource: raw.filePath,
    severity: raw.severity,
    category: 'DEVSECOPS_SUPPLY_CHAIN',
    outcome: raw.outcome,
    rawEventId: raw.id,
    attributes: {
      ...raw.attributes,
      ruleId: raw.ruleId,
    },
  };
}
