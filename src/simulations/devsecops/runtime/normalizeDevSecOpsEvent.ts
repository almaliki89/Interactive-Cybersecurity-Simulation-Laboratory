/**
 * OMEGA V15.1 — DevSecOps Event Normalization Engine
 * Normalizes all DevSecOps and supply chain events to the canonical telemetry schema.
 * Ensures DevSecOps events normalize with sourceWorld: 'DEVSECOPS'.
 */

import { SecurityTelemetryEvent, TelemetrySeverity } from '../../soc/logic/telemetry';

export interface RawDevSecOpsEvent {
  id: string;
  eventType: string; // Supports all 14+ DevSecOps event types
  virtualTime: number;
  repository?: string;
  commitSha?: string;
  workflow?: string;
  artifact?: string;
  artifactDigest?: string;
  actor?: string;
  filePath?: string;
  ruleId?: string;
  severity: TelemetrySeverity;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO';
  attributes?: Record<string, unknown>;
}

export function normalizeDevSecOpsEvent(raw: RawDevSecOpsEvent): SecurityTelemetryEvent {
  const attrs = raw.attributes || {};
  const repository = raw.repository || (attrs.repository as string) || 'github.com/nexora/enterprise-platform';
  const commitSha = raw.commitSha || (attrs.commitSha as string) || 'a1b2c3d4e5f6';
  const workflow = raw.workflow || (attrs.workflow as string) || 'ci-cd-pipeline.yml';
  const artifact = raw.artifact || (attrs.artifact as string) || 'nexora-enterprise-service';
  const artifactDigest = raw.artifactDigest || (attrs.artifactDigest as string) || 'sha256:d57e1234567890abcdef';
  const actor = raw.actor || (attrs.actor as string) || (attrs.committer as string) || 'ci-cd-runner';

  return {
    id: `telemetry-devsecops-${raw.id}`,
    sourceWorld: 'DEVSECOPS',
    eventType: raw.eventType,
    virtualTime: raw.virtualTime,
    host: repository,
    user: actor,
    resource: artifact || workflow,
    severity: raw.severity,
    category: 'DEVSECOPS_SUPPLY_CHAIN',
    outcome: raw.outcome,
    rawEventId: raw.id,
    attributes: {
      ...attrs,
      repository,
      commitSha,
      workflow,
      artifact,
      artifactDigest,
      actor,
      virtualTime: raw.virtualTime,
      sourceWorld: 'DEVSECOPS',
      rawEventId: raw.id,
      eventType: raw.eventType,
      severity: raw.severity,
      outcome: raw.outcome,
    },
  };
}
