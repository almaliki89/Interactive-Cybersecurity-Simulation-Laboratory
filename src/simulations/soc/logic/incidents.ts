/**
 * OMEGA V11 — Security Incident & Timeline Data Model
 * Manages incident records, associated alerts, affected entities, and chronologically ordered timelines.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityAlert } from './detection';
import { SecurityTelemetryEvent } from './telemetry';

export interface IncidentTimelineEntry {
  id: string;
  virtualTime: number;
  sourceWorld: string;
  category: string;
  eventType: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  user?: string;
  host?: string;
  isKeyEvidence: boolean;
  alertId?: string;
}

export interface SecurityIncident {
  id: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';
  createdAtVirtualTime: number;
  alertIds: string[];
  evidenceEventIds: string[];
  affectedUsers: string[];
  affectedHosts: string[];
  affectedResources: string[];
  timeline: IncidentTimelineEntry[];
  assignedAnalyst?: string;
}

/**
 * Builds a chronological incident timeline from evidence events and alerts
 */
export function buildIncidentTimeline(
  events: SecurityTelemetryEvent[],
  alerts: SecurityAlert[]
): IncidentTimelineEntry[] {
  const timeline: IncidentTimelineEntry[] = [];
  const alertEvidenceMap = new Map<string, string>();

  alerts.forEach((alert) => {
    alert.evidenceEventIds.forEach((evtId) => {
      alertEvidenceMap.set(evtId, alert.id);
    });
  });

  for (const evt of events) {
    const alertId = alertEvidenceMap.get(evt.id);
    const isKeyEvidence = Boolean(alertId);

    let titleEn = `[${evt.sourceWorld}] ${evt.eventType}`;
    let titleAr = `[${evt.sourceWorld}] ${evt.eventType}`;

    if (evt.category === 'AUTHENTICATION') {
      titleEn = `Authentication Attempt (${evt.outcome || 'EVENT'})`;
      titleAr = `محاولة مصادقة وتسجيل دخول (${evt.outcome || 'حدث'})`;
    } else if (evt.category === 'GROUP_MANAGEMENT') {
      titleEn = 'Security Group Membership Modification';
      titleAr = 'تعديل عضوية مجموعة أمنية';
    } else if (evt.category === 'ACCESS_CONTROL') {
      titleEn = `Resource Access Evaluation (${evt.outcome || 'EVENT'})`;
      titleAr = `تقييم الوصول للموارد (${evt.outcome || 'حدث'})`;
    } else if (evt.category === 'PROCESS_EXECUTION') {
      titleEn = `Process Spawned: ${evt.process || 'N/A'}`;
      titleAr = `تشغيل عملية: ${evt.process || 'غير محدد'}`;
    } else if (evt.category === 'APPLICATION_DEFENSE') {
      titleEn = `AppSec Defense Event (${evt.outcome || 'FLAG'})`;
      titleAr = `حدث حماية التطبيقات (${evt.outcome || 'تنبيه'})`;
    }

    timeline.push({
      id: `tml-${evt.id}`,
      virtualTime: evt.virtualTime,
      sourceWorld: evt.sourceWorld,
      category: evt.category,
      eventType: evt.eventType,
      titleEn,
      titleAr,
      descriptionEn: `User '${evt.user || 'N/A'}' on host '${evt.host || 'N/A'}' targeting '${evt.resource || evt.destinationIp || 'N/A'}'. Outcome: ${evt.outcome}.`,
      descriptionAr: `المستخدم '${evt.user || 'غير محدد'}' على الجهاز '${evt.host || 'غير محدد'}' والمستهدف '${evt.resource || evt.destinationIp || 'غير محدد'}'. النتيجة: ${evt.outcome}.`,
      user: evt.user,
      host: evt.host,
      isKeyEvidence,
      alertId,
    });
  }

  return timeline.sort((a, b) => a.virtualTime - b.virtualTime);
}

/**
 * Creates a structured security incident from alerts and events
 */
export function createSecurityIncident(params: {
  id: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  alerts: SecurityAlert[];
  evidenceEvents: SecurityTelemetryEvent[];
  virtualTime: number;
}): SecurityIncident {
  const allUsers = Array.from(new Set(params.alerts.flatMap((a) => a.entities.users)));
  const allHosts = Array.from(new Set(params.alerts.flatMap((a) => a.entities.hosts)));
  const allResources = Array.from(new Set(params.alerts.flatMap((a) => a.entities.resources)));

  return {
    id: params.id,
    titleEn: params.titleEn,
    titleAr: params.titleAr,
    summaryEn: params.summaryEn,
    summaryAr: params.summaryAr,
    severity: params.severity,
    status: 'OPEN',
    createdAtVirtualTime: params.virtualTime,
    alertIds: params.alerts.map((a) => a.id),
    evidenceEventIds: params.evidenceEvents.map((e) => e.id),
    affectedUsers: allUsers,
    affectedHosts: allHosts,
    affectedResources: allResources,
    timeline: buildIncidentTimeline(params.evidenceEvents, params.alerts),
  };
}
