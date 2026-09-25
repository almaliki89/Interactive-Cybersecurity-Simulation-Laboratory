/**
 * OMEGA V11 — Multi-Stage Alert & Incident Correlation Engine
 * Connects isolated alerts sharing entities and attack progression into comprehensive incidents.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityAlert } from './detection';
import { SecurityTelemetryEvent } from './telemetry';

export interface CorrelationGroup {
  id: string;
  titleEn: string;
  titleAr: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  alertIds: string[];
  evidenceEventIds: string[];
  entities: {
    primaryUser?: string;
    primaryHost?: string;
    targetResources: string[];
    ips: string[];
  };
  attackStages: {
    stageNameEn: string;
    stageNameAr: string;
    alertId: string;
    time: number;
    descriptionEn: string;
    descriptionAr: string;
  }[];
  reasonsEn: string[];
  reasonsAr: string[];
}

/**
 * Correlates isolated alerts into multi-stage attack scenarios
 */
export function correlateAlerts(
  alerts: SecurityAlert[],
  events: SecurityTelemetryEvent[]
): CorrelationGroup[] {
  if (alerts.length === 0) return [];

  const groups: CorrelationGroup[] = [];
  const sortedAlerts = [...alerts].sort((a, b) => a.createdAtVirtualTime - b.createdAtVirtualTime);

  // Group alerts sharing user or host
  const userMap = new Map<string, SecurityAlert[]>();
  const hostMap = new Map<string, SecurityAlert[]>();

  for (const alert of sortedAlerts) {
    for (const u of alert.entities.users) {
      if (!userMap.has(u)) userMap.set(u, []);
      userMap.get(u)!.push(alert);
    }
    for (const h of alert.entities.hosts) {
      if (!hostMap.has(h)) hostMap.set(h, []);
      hostMap.get(h)!.push(alert);
    }
  }

  // Correlate user-centric attack chains
  userMap.forEach((userAlerts, user) => {
    if (userAlerts.length >= 2) {
      const distinctRules = new Set(userAlerts.map((a) => a.ruleId));
      const allEvidenceIds = Array.from(new Set(userAlerts.flatMap((a) => a.evidenceEventIds)));
      const allHosts = Array.from(new Set(userAlerts.flatMap((a) => a.entities.hosts)));
      const allResources = Array.from(new Set(userAlerts.flatMap((a) => a.entities.resources)));
      const allIps = Array.from(new Set(userAlerts.flatMap((a) => a.entities.ips)));

      const stages = userAlerts.map((a) => ({
        stageNameEn: a.ruleNameEn,
        stageNameAr: a.ruleNameAr,
        alertId: a.id,
        time: a.createdAtVirtualTime,
        descriptionEn: a.reasonEn,
        descriptionAr: a.reasonAr,
      }));

      const confidence: 'LOW' | 'MEDIUM' | 'HIGH' =
        distinctRules.size >= 3 ? 'HIGH' : distinctRules.size >= 2 ? 'MEDIUM' : 'LOW';

      const reasonsEn = [
        `Correlated ${userAlerts.length} distinct security alerts for user account '${user}'`,
        `Cross-stage progression observed across ${distinctRules.size} different detection rules`,
        `Spans activity on hosts: [${allHosts.join(', ') || 'N/A'}] and resources: [${allResources.join(', ') || 'N/A'}]`,
      ];

      const reasonsAr = [
        `تم ربط ${userAlerts.length} تنبيهات أمنية لحساب المستخدم '${user}'`,
        `رصد تدرج هجومي متعدد المراحل عبر ${distinctRules.size} قواعد اكتشاف مختلفة`,
        `تشمل الأنشطة الأجهزة: [${allHosts.join(', ') || 'غير محدد'}] والموارد: [${allResources.join(', ') || 'غير محدد'}]`,
      ];

      groups.push({
        id: `corr-group-${user}`,
        titleEn: `Multi-Stage Compromise Chain Targeting User '${user}'`,
        titleAr: `سلسلة هجوم متعددة المراحل تستهدف المستخدم '${user}'`,
        confidence,
        alertIds: userAlerts.map((a) => a.id),
        evidenceEventIds: allEvidenceIds,
        entities: {
          primaryUser: user,
          primaryHost: allHosts[0],
          targetResources: allResources,
          ips: allIps,
        },
        attackStages: stages,
        reasonsEn,
        reasonsAr,
      });
    }
  });

  return groups;
}
