/**
 * OMEGA V11 — Safe Telemetry Query Language & Threat Hunting Engine
 * Evaluates structured safe query strings against normalized telemetry without eval or code execution.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityTelemetryEvent, TelemetryFilter } from './telemetry';
import { EnrichedTelemetryEvent } from './enrichment';

export interface HuntingHypothesis {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  suggestedQuery: string;
  targetCategory: string;
  threatTechnique: string;
  expectedMinMatches: number;
}

/**
 * Standard Threat Hunting Hypotheses
 */
export const STANDARD_HUNTING_HYPOTHESES: HuntingHypothesis[] = [
  {
    id: 'hunt-auth-bruteforce',
    titleEn: 'Authentication Brute-Force & Credential Guessing',
    titleAr: 'تخمين كلمات المرور ومحاولات تسجيل الدخول المتكررة',
    descriptionEn: 'Hunt for accounts experiencing multiple failed logins across Windows, AD, or Application endpoints.',
    descriptionAr: 'البحث عن الحسابات التي واجهت محاولات دخول فاشلة متعددة عبر ويندوز أو التطبيقات.',
    suggestedQuery: 'category = AUTHENTICATION AND outcome = FAILURE',
    targetCategory: 'AUTHENTICATION',
    threatTechnique: 'T1110 - Brute Force',
    expectedMinMatches: 3,
  },
  {
    id: 'hunt-priv-group-change',
    titleEn: 'Suspicious Domain Administrator Group Modifications',
    titleAr: 'تعديلات مشبوهة على مجموعات مديري النطاق',
    descriptionEn: 'Detect user accounts added to privileged security groups like Domain Admins outside standard change windows.',
    descriptionAr: 'اكتشاف إضافة مستخدمين لمجموعات عالية الصلاحية مثل Domain Admins.',
    suggestedQuery: 'category = GROUP_MANAGEMENT AND outcome = SUCCESS',
    targetCategory: 'GROUP_MANAGEMENT',
    threatTechnique: 'T1098 - Account Manipulation',
    expectedMinMatches: 1,
  },
  {
    id: 'hunt-sensitive-resource',
    titleEn: 'Unauthorized Access to Finance & Ledger Assets',
    titleAr: 'محاولات الوصول غير المصرح لبيانات المالية الحساسة',
    descriptionEn: 'Inspect file share or API accesses targeting high-value financial assets.',
    descriptionAr: 'فحص محاولات الوصول لمجلدات وملفات المالية الحساسة.',
    suggestedQuery: 'category = ACCESS_CONTROL AND outcome = SUCCESS',
    targetCategory: 'ACCESS_CONTROL',
    threatTechnique: 'T1083 - File and Directory Discovery',
    expectedMinMatches: 1,
  },
  {
    id: 'hunt-network-scans',
    titleEn: 'Network Port Scanning & Unauthorized Probes',
    titleAr: 'عمليات مسح المنافذ وحزم الاتصال الممنوعة',
    descriptionEn: 'Identify hosts generating repeated blocked packets or unusual destination connections.',
    descriptionAr: 'رصد الأجهزة التي ترسل حزم اتصال محظورة أو تحاول مسح المنافذ.',
    suggestedQuery: 'sourceWorld = NETWORK AND outcome = DENIED',
    targetCategory: 'NETWORK_CONNECTION',
    threatTechnique: 'T1046 - Network Service Discovery',
    expectedMinMatches: 1,
  },
  {
    id: 'hunt-app-bola',
    titleEn: 'Application Authorization BOLA / IDOR Probing',
    titleAr: 'محاولات اختراق تفويض التطبيقات BOLA / IDOR',
    descriptionEn: 'Uncover horizontal privilege violations where users query foreign customer records.',
    descriptionAr: 'كشف محاولات المستخدمين للوصول إلى طلبات وبيانات مستخدمين آخرين.',
    suggestedQuery: 'sourceWorld = APPSEC AND outcome = DENIED',
    targetCategory: 'ACCESS_CONTROL',
    threatTechnique: 'T1595.002 - Vulnerability Scanning',
    expectedMinMatches: 1,
  },
];

/**
 * Parses and matches safe query clauses
 * Syntax: `field = value AND field2 > value2 AND field3 CONTAINS text`
 */
export function queryTelemetry<T extends SecurityTelemetryEvent>(
  events: T[],
  queryString: string
): T[] {
  if (!queryString || !queryString.trim()) {
    return [...events];
  }

  const clauses = queryString
    .split(/\s+AND\s+/i)
    .map((c) => c.trim())
    .filter(Boolean);

  return events.filter((evt) => {
    for (const clause of clauses) {
      if (!matchClause(evt, clause)) {
        return false;
      }
    }
    return true;
  });
}

function matchClause(event: SecurityTelemetryEvent | EnrichedTelemetryEvent, clause: string): boolean {
  // Support operators: !=, >=, <=, =, >, <, CONTAINS
  let op: string | null = null;
  let field = '';
  let val = '';

  if (clause.includes('!=')) {
    op = '!=';
    [field, val] = clause.split('!=').map((s) => s.trim());
  } else if (clause.includes('>=')) {
    op = '>=';
    [field, val] = clause.split('>=').map((s) => s.trim());
  } else if (clause.includes('<=')) {
    op = '<=';
    [field, val] = clause.split('<=').map((s) => s.trim());
  } else if (clause.includes('=')) {
    op = '=';
    [field, val] = clause.split('=').map((s) => s.trim());
  } else if (clause.includes('>')) {
    op = '>';
    [field, val] = clause.split('>').map((s) => s.trim());
  } else if (clause.includes('<')) {
    op = '<';
    [field, val] = clause.split('<').map((s) => s.trim());
  } else if (/CONTAINS/i.test(clause)) {
    op = 'CONTAINS';
    const parts = clause.split(/CONTAINS/i).map((s) => s.trim());
    field = parts[0];
    val = parts[1];
  } else {
    // Free text search
    const text = clause.toLowerCase();
    return (
      event.eventType.toLowerCase().includes(text) ||
      (event.user && event.user.toLowerCase().includes(text)) ||
      (event.host && event.host.toLowerCase().includes(text)) ||
      (event.resource && event.resource.toLowerCase().includes(text)) ||
      (event.process && event.process.toLowerCase().includes(text)) ||
      event.category.toLowerCase().includes(text)
    );
  }

  // Remove quotes around value if present
  val = val.replace(/^['"](.*)['"]$/, '$1');

  // Extract actual field value from event
  const actualVal = getEventFieldValue(event, field);

  if (actualVal === undefined || actualVal === null) {
    return op === '!=';
  }

  if (typeof actualVal === 'number') {
    const numVal = Number(val);
    if (isNaN(numVal)) return false;
    if (op === '=') return actualVal === numVal;
    if (op === '!=') return actualVal !== numVal;
    if (op === '>') return actualVal > numVal;
    if (op === '<') return actualVal < numVal;
    if (op === '>=') return actualVal >= numVal;
    if (op === '<=') return actualVal <= numVal;
  }

  const strActual = String(actualVal).toLowerCase();
  const strVal = val.toLowerCase();

  if (op === '=') return strActual === strVal;
  if (op === '!=') return strActual !== strVal;
  if (op === 'CONTAINS') return strActual.includes(strVal);

  return false;
}

function getEventFieldValue(event: any, fieldName: string): unknown {
  const norm = fieldName.trim().toLowerCase();
  if (norm === 'sourceworld' || norm === 'source_world') return event.sourceWorld;
  if (norm === 'eventtype' || norm === 'type') return event.eventType;
  if (norm === 'virtualtime' || norm === 'time') return event.virtualTime;
  if (norm === 'category') return event.category;
  if (norm === 'outcome') return event.outcome;
  if (norm === 'severity') return event.severity;
  if (norm === 'user' || norm === 'username') return event.user;
  if (norm === 'host' || norm === 'hostname') return event.host;
  if (norm === 'sourceip' || norm === 'src_ip') return event.sourceIp;
  if (norm === 'destinationip' || norm === 'dst_ip') return event.destinationIp;
  if (norm === 'destinationport' || norm === 'dst_port' || norm === 'port') return event.destinationPort;
  if (norm === 'process') return event.process;
  if (norm === 'parentprocess') return event.parentProcess;
  if (norm === 'service') return event.service;
  if (norm === 'resource') return event.resource;
  if (norm === 'department' || norm === 'userdepartment') return event.userDepartment;
  if (norm === 'isprivileged' || norm === 'privileged') return event.userIsPrivileged;
  if (norm === 'criticality' || norm === 'assetcriticality') return event.assetCriticality;
  if (norm === 'zone' || norm === 'networkzone') return event.networkZone;

  if (event.attributes && event.attributes[fieldName] !== undefined) {
    return event.attributes[fieldName];
  }
  return undefined;
}

/**
 * Evaluates filter object against an event
 */
export function matchTelemetryFilter(
  event: SecurityTelemetryEvent | EnrichedTelemetryEvent,
  filter: TelemetryFilter
): boolean {
  if (filter.sourceWorld && event.sourceWorld !== filter.sourceWorld) return false;
  if (filter.category && event.category !== filter.category) return false;
  if (filter.outcome && event.outcome !== filter.outcome) return false;
  if (filter.severity && event.severity !== filter.severity) return false;
  if (filter.user && (!event.user || !event.user.toLowerCase().includes(filter.user.toLowerCase()))) return false;
  if (filter.host && (!event.host || !event.host.toLowerCase().includes(filter.host.toLowerCase()))) return false;
  if (filter.sourceIp && (!event.sourceIp || !event.sourceIp.includes(filter.sourceIp))) return false;
  if (filter.destinationIp && (!event.destinationIp || !event.destinationIp.includes(filter.destinationIp))) return false;
  if (filter.destinationPort !== undefined && event.destinationPort !== filter.destinationPort) return false;
  if (filter.process && (!event.process || !event.process.toLowerCase().includes(filter.process.toLowerCase()))) return false;
  if (filter.minVirtualTime !== undefined && event.virtualTime < filter.minVirtualTime) return false;
  if (filter.maxVirtualTime !== undefined && event.virtualTime > filter.maxVirtualTime) return false;

  if (filter.freeText && filter.freeText.trim()) {
    const text = filter.freeText.toLowerCase();
    const hasMatch =
      event.eventType.toLowerCase().includes(text) ||
      (event.user && event.user.toLowerCase().includes(text)) ||
      (event.host && event.host.toLowerCase().includes(text)) ||
      (event.resource && event.resource.toLowerCase().includes(text)) ||
      (event.process && event.process.toLowerCase().includes(text)) ||
      event.category.toLowerCase().includes(text);
    if (!hasMatch) return false;
  }

  return true;
}
