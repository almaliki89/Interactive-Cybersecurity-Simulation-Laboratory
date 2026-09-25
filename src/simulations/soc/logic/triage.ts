/**
 * OMEGA V11 — Alert Triage & Prioritization Engine
 * Calculates priority score and rationale using explicit deterministic factors.
 * Fully deterministic - no Date.now, Math.random, or opaque AI scores.
 */

import { SecurityAlert } from './detection';
import { EnrichedTelemetryEvent, ENTERPRISE_HOSTS, ENTERPRISE_USERS } from './enrichment';

export interface TriagedAlertResult {
  alert: SecurityAlert;
  triagePriority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  triageScore: number;
  factorsEn: string[];
  factorsAr: string[];
  recommendedActionEn: string;
  recommendedActionAr: string;
}

/**
 * Triages an alert against enriched events and directory data
 */
export function triageAlert(
  alert: SecurityAlert,
  enrichedEvents: EnrichedTelemetryEvent[]
): TriagedAlertResult {
  let score = 0;
  const factorsEn: string[] = [];
  const factorsAr: string[] = [];

  // 1. Base Severity Weight
  if (alert.severity === 'CRITICAL') {
    score += 40;
    factorsEn.push('Base rule severity is CRITICAL (+40)');
    factorsAr.push('الخطورة الأساسية للقاعدة حرجة (+40)');
  } else if (alert.severity === 'HIGH') {
    score += 25;
    factorsEn.push('Base rule severity is HIGH (+25)');
    factorsAr.push('الخطورة الأساسية للقاعدة عالية (+25)');
  } else if (alert.severity === 'MEDIUM') {
    score += 15;
    factorsEn.push('Base rule severity is MEDIUM (+15)');
    factorsAr.push('الخطورة الأساسية للقاعدة متوسطة (+15)');
  } else {
    score += 5;
    factorsEn.push('Base rule severity is LOW (+5)');
    factorsAr.push('الخطورة الأساسية للقاعدة منخفضة (+5)');
  }

  // 2. Critical Asset Involvement
  const involvesCriticalAsset = alert.entities.hosts.some((h) => {
    const hostCtx = ENTERPRISE_HOSTS[h.toUpperCase()];
    return hostCtx && (hostCtx.criticality === 'CRITICAL' || hostCtx.criticality === 'HIGH');
  });
  if (involvesCriticalAsset) {
    score += 25;
    factorsEn.push('Involves High/Critical Tier-0 infrastructure (+25)');
    factorsAr.push('يرتبط بأصول وبنية تحتية عالية الأهمية والحساسية (+25)');
  }

  // 3. Privileged User Account
  const involvesPrivilegedUser = alert.entities.users.some((u) => {
    const userCtx = ENTERPRISE_USERS[u.toLowerCase()];
    return userCtx && userCtx.isPrivileged;
  });
  if (involvesPrivilegedUser) {
    score += 20;
    factorsEn.push('Target account holds privileged Administrative rights (+20)');
    factorsAr.push('الحساب المستهدف يمتلك صلاحيات إدارية مميزة (+20)');
  }

  // 4. Evidence Volume & Multi-Source
  if (alert.evidenceEventIds.length >= 5) {
    score += 15;
    factorsEn.push(`High evidence volume (${alert.evidenceEventIds.length} events) (+15)`);
    factorsAr.push(`كثافة عالية للأدلة (${alert.evidenceEventIds.length} أحداث) (+15)`);
  }

  // Find matching evidence events
  const relatedEnriched = enrichedEvents.filter((e) => alert.evidenceEventIds.includes(e.id));
  const distinctWorlds = new Set(relatedEnriched.map((e) => e.sourceWorld));
  if (distinctWorlds.size > 1) {
    score += 10;
    factorsEn.push(`Cross-world corroboration across ${distinctWorlds.size} source domains (+10)`);
    factorsAr.push(`تأكيد متقاطع عبر ${distinctWorlds.size} نطاقات أمنية مختلفة (+10)`);
  }

  // Determine Priority Tier
  let triagePriority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  let recommendedActionEn = '';
  let recommendedActionAr = '';

  if (score >= 65) {
    triagePriority = 'P1_CRITICAL';
    recommendedActionEn = 'Immediate escalation to Incident Response. Initiate host isolation and credential revocation.';
    recommendedActionAr = 'تصعيد فوري لفريق الاستجابة للحوادث. بدء عزل الجهاز وسحب الجلسات النشطة.';
  } else if (score >= 45) {
    triagePriority = 'P2_HIGH';
    recommendedActionEn = 'Escalate to Tier-2 SOC Analyst. Correlate with firewall and Active Directory authentication logs.';
    recommendedActionAr = 'تصعيد لمحلل المستوى الثاني. مطابقة سجلات جدار الحماية مع سجلات الدخول.';
  } else if (score >= 25) {
    triagePriority = 'P3_MEDIUM';
    recommendedActionEn = 'Review user baseline behavior and verify whether activity aligns with scheduled changes.';
    recommendedActionAr = 'مراجعة السلوك المعتاد للمستخدم والتأكد من توافقه مع التغييرات المجدولة.';
  } else {
    triagePriority = 'P4_LOW';
    recommendedActionEn = 'Log for weekly trend review; no immediate containment required.';
    recommendedActionAr = 'التسجيل للمراجعة الدورية؛ لا يتطلب تدخلاً فورياً.';
  }

  return {
    alert,
    triagePriority,
    triageScore: Math.min(100, score),
    factorsEn,
    factorsAr,
    recommendedActionEn,
    recommendedActionAr,
  };
}

export function triageAlertBatch(
  alerts: SecurityAlert[],
  enrichedEvents: EnrichedTelemetryEvent[]
): TriagedAlertResult[] {
  return alerts.map((a) => triageAlert(a, enrichedEvents));
}
