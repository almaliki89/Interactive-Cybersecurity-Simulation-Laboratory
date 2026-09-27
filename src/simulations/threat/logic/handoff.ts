/**
 * OMEGA V16 — SOC & Forensics Integration & Handoff Pipeline
 * Connects Threat Hunt findings to SOC Incident Queue and Forensics Case Workspace.
 * Preserves canonical evidence IDs, rawEventIds, and correlation metadata.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import { createForensicEvidenceFromTelemetry, ForensicEvidence } from '../../forensics/logic/evidence';
import { HuntFinding, SocHandoffPackage, ForensicsHandoffPackage } from './types';

export class ThreatHandoffBridge {
  /**
   * Generates a formal SOC Handoff Package from a Threat Hunting Finding
   */
  public static createSocHandoff(
    finding: HuntFinding,
    ruleId?: string,
    virtualTime: number = 0
  ): SocHandoffPackage {
    let priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW' = 'P3_MEDIUM';
    if (finding.severity === 'critical') priority = 'P1_CRITICAL';
    else if (finding.severity === 'threat') priority = 'P2_HIGH';
    else if (finding.severity === 'warn') priority = 'P3_MEDIUM';
    else priority = 'P4_LOW';

    return {
      handoffId: `SOC-HANDOFF-${finding.huntId}-${finding.id}`,
      huntId: finding.huntId,
      findingId: finding.id,
      ruleId,
      rawEventIds: finding.rawEventIds,
      eventIds: finding.eventIds,
      summaryEn: `[Threat Hunt Handoff] ${finding.titleEn}: ${finding.summaryEn}`,
      summaryAr: `[إحالة صيد التهديدات] ${finding.titleAr}: ${finding.summaryAr}`,
      priority,
      timestampVirtual: virtualTime,
      status: 'DISPATCHED',
    };
  }

  /**
   * Generates a canonical Forensics Handoff Package using the established evidence pipeline
   */
  public static createForensicsHandoff(
    finding: HuntFinding,
    events: SecurityTelemetryEvent[],
    caseId: string = 'CASE-NEXORA-FIN-001',
    virtualTime: number = 0
  ): ForensicsHandoffPackage {
    // Filter events supporting this finding
    const supportingEvents = events.filter(
      (e) => finding.eventIds.includes(e.id) || (e.rawEventId && finding.rawEventIds.includes(e.rawEventId))
    );

    // Canonical evidence conversion
    const evidenceList: ForensicEvidence[] = supportingEvents.map((evt) =>
      createForensicEvidenceFromTelemetry(evt)
    );

    return {
      handoffId: `FOR-HANDOFF-${finding.huntId}-${finding.id}`,
      huntId: finding.huntId,
      findingId: finding.id,
      caseId,
      evidenceList,
      rawEventIds: finding.rawEventIds,
      acquiredAtVirtualTime: virtualTime,
    };
  }
}
