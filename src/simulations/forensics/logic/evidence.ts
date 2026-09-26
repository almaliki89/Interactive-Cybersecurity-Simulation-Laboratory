/**
 * OMEGA V12 — Forensic Evidence & Case Model
 * Defines deterministic structures for Incident Cases and Forensic Evidence.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import { calculateEvidenceHash } from './hashing';

export interface ForensicEvidence {
  id: string;
  type:
    | 'DISK_IMAGE'
    | 'MEMORY_IMAGE'
    | 'LOG_EXPORT'
    | 'NETWORK_CAPTURE'
    | 'FILE'
    | 'REGISTRY_ARTIFACT'
    | 'BROWSER_ARTIFACT'
    | 'PROCESS_SNAPSHOT';

  sourceHost?: string;
  sourceUser?: string;
  acquiredAtVirtualTime: number;

  originalHash: string;
  currentHash: string;

  preserved: boolean;
  integrityStatus: 'VERIFIED' | 'MISMATCH' | 'NOT_VERIFIED';

  metadata: Record<string, unknown>;
}

/**
 * Maps a unified SOC telemetry event into a Forensics-compatible evidence reference.
 * Retains deterministic virtual time, source world, event type, resource, and raw event ID.
 */
export function createForensicEvidenceFromTelemetry(event: SecurityTelemetryEvent): ForensicEvidence {
  const metadata: Record<string, unknown> = {
    sourceWorld: event.sourceWorld,
    eventType: event.eventType,
    virtualTime: event.virtualTime,
    resource: event.resource || 'unknown-resource',
    sourceIp: event.sourceIp || '0.0.0.0',
    rawEventId: event.rawEventId || event.id,
    severity: event.severity,
    category: event.category,
    outcome: event.outcome,
    ...event.attributes,
  };
  const hash = calculateEvidenceHash(metadata);
  return {
    id: `EVD-${event.sourceWorld}-${event.rawEventId || event.id}`,
    type: 'LOG_EXPORT',
    sourceHost: event.host || (event.sourceWorld === 'CLOUD' ? 'CLOUD-VPC-PROD' : 'HOST-01'),
    sourceUser: event.user || 'system',
    acquiredAtVirtualTime: event.virtualTime,
    originalHash: hash,
    currentHash: hash,
    preserved: true,
    integrityStatus: 'VERIFIED',
    metadata,
  };
}

export interface ForensicsCase {
  id: string;
  sourceIncidentId: string;

  titleEn: string;
  titleAr: string;

  openedAtVirtualTime: number;

  affectedHosts: string[];
  affectedUsers: string[];
  affectedResources: string[];

  evidenceIds: string[];

  status:
    | 'OPEN'
    | 'ACQUIRING'
    | 'ANALYZING'
    | 'CONTAINED'
    | 'RECOVERING'
    | 'CLOSED';
}

/**
 * Default Nexora Finance Incident Forensics Case
 */
export function createDefaultForensicsCase(virtualTime: number = 0): ForensicsCase {
  return {
    id: 'CASE-NEXORA-FIN-001',
    sourceIncidentId: 'INC-NEXORA-2026-0812',
    titleEn: 'Nexora Finance Department Multi-Stage Intrusion',
    titleAr: 'اختراق متعدد المراحل لقسم المالية بشركة نيكسورا',
    openedAtVirtualTime: virtualTime,
    affectedHosts: ['FIN-WS-01', 'DC-01', 'LINUX-SRV-01', 'APP-SRV-01', 'FIN-SRV'],
    affectedUsers: ['sara', 'root', 'SYSTEM'],
    affectedResources: ['\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx', '/api/v1/finance/reports'],
    evidenceIds: [
      'EVD-MEM-FIN-WS01',
      'EVD-DISK-FIN-WS01',
      'EVD-LOG-WIN-SEC',
      'EVD-LOG-LINUX-AUTH',
      'EVD-NET-PCAP-01',
      'EVD-BROWSER-HIST',
    ],
    status: 'OPEN',
  };
}
