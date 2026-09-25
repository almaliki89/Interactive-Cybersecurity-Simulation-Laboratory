/**
 * OMEGA V11 — SIEM Detection Rule Engine & Production Detection Catalog
 * Evaluates Threshold, Sequence, Single-Event, and State rules deterministically over telemetry.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityTelemetryEvent } from './telemetry';

export type DetectionRuleType = 'THRESHOLD' | 'SEQUENCE' | 'SINGLE_EVENT' | 'CORRELATION';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'TRIAGED' | 'INVESTIGATING' | 'CLOSED';

export interface DetectionRule {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  enabled: boolean;
  severity: AlertSeverity;
  sourceCategories: string[];
  ruleType: DetectionRuleType;
  windowMs?: number;
  threshold?: number;
  sequenceSteps?: {
    category: string;
    outcome?: string;
    fieldMatch?: string;
    description?: string;
  }[];
  conditions: {
    category?: string;
    outcome?: string;
    sourceWorld?: string;
    customMatcher?: string;
  };
  threatTechnique: string;
}

export interface SecurityAlert {
  id: string;
  ruleId: string;
  ruleNameEn: string;
  ruleNameAr: string;
  severity: AlertSeverity;
  createdAtVirtualTime: number;
  status: AlertStatus;
  evidenceEventIds: string[];
  entities: {
    users: string[];
    hosts: string[];
    ips: string[];
    resources: string[];
  };
  reasonEn: string;
  reasonAr: string;
  threatTechnique: string;
}

/**
 * Standard Production SIEM Detection Rules
 */
export const STANDARD_DETECTION_RULES: DetectionRule[] = [
  // 1. Repeated Failed Logins (Threshold)
  {
    id: 'rule-auth-bruteforce',
    nameEn: 'Repeated Authentication Failures (Brute Force)',
    nameAr: 'تكرار محاولات تسجيل الدخول الفاشلة (هجوم تخمين)',
    descriptionEn: 'Triggers when 5 or more authentication failures occur for a user/host within a 60,000ms window.',
    descriptionAr: 'يتم إطلاقه عند رصد 5 محاولات دخول فاشلة لنفس المستخدم أو الجهاز خلال نافذة 60 ثانية.',
    enabled: true,
    severity: 'HIGH',
    sourceCategories: ['AUTHENTICATION'],
    ruleType: 'THRESHOLD',
    threshold: 5,
    windowMs: 60000,
    conditions: {
      category: 'AUTHENTICATION',
      outcome: 'FAILURE',
    },
    threatTechnique: 'T1110 - Brute Force',
  },

  // 2. Successful Login After Repeated Failures (Sequence)
  {
    id: 'rule-auth-success-after-fail',
    nameEn: 'Successful Authentication Following Multiple Failures',
    nameAr: 'تسجيل دخول ناجح يعقب إخفاقات دخول متعددة',
    descriptionEn: 'Detects potential credential compromise where 3+ failed logins are immediately followed by a successful login.',
    descriptionAr: 'اكتشاف اختراق محتمل لكلمات المرور عند نجاح تسجيل الدخول بعد 3 إخفاقات متتالية.',
    enabled: true,
    severity: 'HIGH',
    sourceCategories: ['AUTHENTICATION'],
    ruleType: 'SEQUENCE',
    windowMs: 120000,
    sequenceSteps: [
      { category: 'AUTHENTICATION', outcome: 'FAILURE', description: 'Initial failed login sequence' },
      { category: 'AUTHENTICATION', outcome: 'SUCCESS', description: 'Subsequent login success' },
    ],
    conditions: { category: 'AUTHENTICATION' },
    threatTechnique: 'T1110.001 - Password Guessing / Compromise',
  },

  // 3. User Added to Privileged Group (Single Event)
  {
    id: 'rule-priv-group-modification',
    nameEn: 'Account Added to Privileged Security Group',
    nameAr: 'إضافة حساب مستخدم إلى مجموعة أمنية مميزة الصلاحيات',
    descriptionEn: 'Alerts immediately when any account is added to Domain Admins or Enterprise Admins.',
    descriptionAr: 'تنبيه فوري عند إضافة أي مستخدم إلى مجموعة مسؤولي النطاق (Domain Admins).',
    enabled: true,
    severity: 'CRITICAL',
    sourceCategories: ['GROUP_MANAGEMENT'],
    ruleType: 'SINGLE_EVENT',
    conditions: {
      category: 'GROUP_MANAGEMENT',
      outcome: 'SUCCESS',
    },
    threatTechnique: 'T1098 - Account Manipulation',
  },

  // 4. Suspicious Endpoint Process Execution
  {
    id: 'rule-suspicious-process',
    nameEn: 'Anomalous Child Process Execution',
    nameAr: 'تنفيذ أوامر فرعية مشبوهة على أنظمة التشغيل',
    descriptionEn: 'Identifies unexpected shell or scripting processes spawned by system or web server services.',
    descriptionAr: 'رصد تشغيل موجه الأوامر أو نصوص تنفيذية من قبل خادم الويب أو خدمات النظام.',
    enabled: true,
    severity: 'HIGH',
    sourceCategories: ['PROCESS_EXECUTION'],
    ruleType: 'SINGLE_EVENT',
    conditions: {
      category: 'PROCESS_EXECUTION',
    },
    threatTechnique: 'T1059 - Command and Scripting Interpreter',
  },

  // 5. Repeated Denied Network Connections
  {
    id: 'rule-network-scan-denied',
    nameEn: 'Repeated Blocked Network Connections (Port Probe)',
    nameAr: 'اتصالات شبكية محظورة متكررة (فحص المنافذ)',
    descriptionEn: 'Triggers when 3 or more connections are dropped by firewall ACLs within a short interval.',
    descriptionAr: 'يتم إطلاقه عند حظر 3 محاولات اتصال متتالية بواسطة جدار الحماية.',
    enabled: true,
    severity: 'MEDIUM',
    sourceCategories: ['NETWORK_CONNECTION'],
    ruleType: 'THRESHOLD',
    threshold: 3,
    windowMs: 30000,
    conditions: {
      category: 'NETWORK_CONNECTION',
      outcome: 'DENIED',
    },
    threatTechnique: 'T1046 - Network Service Discovery',
  },

  // 6. Sensitive Resource / Share Access
  {
    id: 'rule-sensitive-resource-access',
    nameEn: 'Access to Confidential Financial Share / Ledger',
    nameAr: 'الوصول إلى مجلدات وسجلات الإدارة المالية الحساسة',
    descriptionEn: 'Monitors high-value resource access on the network share or database.',
    descriptionAr: 'مراقبة الوصول إلى ملفات المشاركة وقواعد البيانات المالية الحساسة.',
    enabled: true,
    severity: 'HIGH',
    sourceCategories: ['ACCESS_CONTROL'],
    ruleType: 'SINGLE_EVENT',
    conditions: {
      category: 'ACCESS_CONTROL',
    },
    threatTechnique: 'T1083 - File and Directory Discovery',
  },

  // 7. Application Security Authorization Anomaly (BOLA / IDOR)
  {
    id: 'rule-app-bola-anomaly',
    nameEn: 'Application Authorization BOLA / IDOR Violation',
    nameAr: 'انتهاك تفويض التطبيقات BOLA / IDOR على مستوى الكائنات',
    descriptionEn: 'Alerts on HTTP 403 authorization denials attempting to read unauthorized customer objects.',
    descriptionAr: 'تنبيه عند حظر طلبات تطبيق الويب التي تحاول قراءة بيانات عملاء آخرين.',
    enabled: true,
    severity: 'HIGH',
    sourceCategories: ['APPLICATION_DEFENSE', 'ACCESS_CONTROL'],
    ruleType: 'SINGLE_EVENT',
    conditions: {
      sourceWorld: 'APPSEC',
      outcome: 'DENIED',
    },
    threatTechnique: 'T1595.002 - Vulnerability Scanning',
  },

  // 8. Security Logging Configuration Modification
  {
    id: 'rule-security-log-tamper',
    nameEn: 'Security Event Log Cleared or Service Stopped',
    nameAr: 'مسح سجلات الأمان أو إيقاف خدمة التدقيق',
    descriptionEn: 'Critical alert when Windows Event Log (1102) or Linux syslog service is tampered with.',
    descriptionAr: 'تنبيه عالي الأهمية عند مسح سجل الأحداث أو التلاعب بخدمات التدقيق الأمني.',
    enabled: true,
    severity: 'CRITICAL',
    sourceCategories: ['SECURITY_CONFIGURATION'],
    ruleType: 'SINGLE_EVENT',
    conditions: {
      category: 'SECURITY_CONFIGURATION',
    },
    threatTechnique: 'T1070 - Indicator Removal on Host',
  },
];

/**
 * Evaluates all enabled detection rules against telemetry events deterministically
 */
export function evaluateDetectionRules(
  events: SecurityTelemetryEvent[],
  rules: DetectionRule[] = STANDARD_DETECTION_RULES
): SecurityAlert[] {
  const alerts: SecurityAlert[] = [];
  const sortedEvents = [...events].sort((a, b) => a.virtualTime - b.virtualTime);

  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (rule.ruleType === 'SINGLE_EVENT') {
      evaluateSingleEventRule(sortedEvents, rule, alerts);
    } else if (rule.ruleType === 'THRESHOLD') {
      evaluateThresholdRule(sortedEvents, rule, alerts);
    } else if (rule.ruleType === 'SEQUENCE') {
      evaluateSequenceRule(sortedEvents, rule, alerts);
    }
  }

  // Deterministically sort generated alerts by virtual time
  return alerts.sort((a, b) => a.createdAtVirtualTime - b.createdAtVirtualTime);
}

function evaluateSingleEventRule(
  events: SecurityTelemetryEvent[],
  rule: DetectionRule,
  alerts: SecurityAlert[]
) {
  for (const evt of events) {
    if (rule.conditions.category && evt.category !== rule.conditions.category) continue;
    if (rule.conditions.outcome && evt.outcome !== rule.conditions.outcome) continue;
    if (rule.conditions.sourceWorld && evt.sourceWorld !== rule.conditions.sourceWorld) continue;

    // Specific event checks
    if (rule.id === 'rule-priv-group-modification') {
      if (evt.category !== 'GROUP_MANAGEMENT' && !evt.eventType.includes('MEMBER_ADDED')) continue;
    }
    if (rule.id === 'rule-suspicious-process') {
      const isSuspicious =
        (evt.process && (evt.process.includes('cmd.exe') || evt.process.includes('powershell') || evt.process.includes('/bin/sh'))) ||
        evt.severity === 'threat';
      if (!isSuspicious) continue;
    }
    if (rule.id === 'rule-sensitive-resource-access') {
      const isSensitive =
        (evt.resource && (evt.resource.includes('Finance') || evt.resource.includes('Report') || evt.resource.includes('ledger'))) ||
        evt.category === 'ACCESS_CONTROL';
      if (!isSensitive) continue;
    }
    if (rule.id === 'rule-security-log-tamper') {
      if (evt.category !== 'SECURITY_CONFIGURATION' && !evt.eventType.includes('LOG_CLEARED') && !evt.eventType.includes('1102')) {
        continue;
      }
    }

    const alertId = `alt-${rule.id}-${evt.id}`;
    if (!alerts.some((a) => a.id === alertId)) {
      alerts.push({
        id: alertId,
        ruleId: rule.id,
        ruleNameEn: rule.nameEn,
        ruleNameAr: rule.nameAr,
        severity: rule.severity,
        createdAtVirtualTime: evt.virtualTime,
        status: 'NEW',
        evidenceEventIds: [evt.id],
        entities: {
          users: evt.user ? [evt.user] : [],
          hosts: evt.host ? [evt.host] : [],
          ips: evt.sourceIp ? [evt.sourceIp] : [],
          resources: evt.resource ? [evt.resource] : [],
        },
        reasonEn: `Single event match: [${evt.eventType}] by user '${evt.user || 'SYSTEM'}' on '${evt.host || evt.sourceWorld}' (Outcome: ${evt.outcome}).`,
        reasonAr: `مطابقة حدث فردي: [${evt.eventType}] بواسطة المستخدم '${evt.user || 'SYSTEM'}' على '${evt.host || evt.sourceWorld}' (النتيجة: ${evt.outcome}).`,
        threatTechnique: rule.threatTechnique,
      });
    }
  }
}

function evaluateThresholdRule(
  events: SecurityTelemetryEvent[],
  rule: DetectionRule,
  alerts: SecurityAlert[]
) {
  const threshold = rule.threshold || 5;
  const windowMs = rule.windowMs || 60000;

  // Filter relevant events
  const matchingEvents = events.filter((e) => {
    if (rule.conditions.category && e.category !== rule.conditions.category) return false;
    if (rule.conditions.outcome && e.outcome !== rule.conditions.outcome) return false;
    if (rule.conditions.sourceWorld && e.sourceWorld !== rule.conditions.sourceWorld) return false;
    return true;
  });

  // Group events by entity (user or host or sourceIp)
  const entityGroups = new Map<string, SecurityTelemetryEvent[]>();
  for (const e of matchingEvents) {
    const key = e.user || e.host || e.sourceIp || 'global';
    if (!entityGroups.has(key)) {
      entityGroups.set(key, []);
    }
    entityGroups.get(key)!.push(e);
  }

  entityGroups.forEach((groupEvents, key) => {
    // Sliding window check
    for (let i = 0; i < groupEvents.length; i++) {
      const windowStart = groupEvents[i].virtualTime;
      const windowEnd = windowStart + windowMs;
      const windowMatches = groupEvents.filter(
        (e) => e.virtualTime >= windowStart && e.virtualTime <= windowEnd
      );

      if (windowMatches.length >= threshold) {
        const firstEvt = windowMatches[0];
        const lastEvt = windowMatches[windowMatches.length - 1];
        const alertId = `alt-${rule.id}-${key}-${firstEvt.virtualTime}`;

        if (!alerts.some((a) => a.id === alertId)) {
          alerts.push({
            id: alertId,
            ruleId: rule.id,
            ruleNameEn: rule.nameEn,
            ruleNameAr: rule.nameAr,
            severity: rule.severity,
            createdAtVirtualTime: lastEvt.virtualTime,
            status: 'NEW',
            evidenceEventIds: windowMatches.map((m) => m.id),
            entities: {
              users: Array.from(new Set(windowMatches.map((m) => m.user).filter(Boolean) as string[])),
              hosts: Array.from(new Set(windowMatches.map((m) => m.host).filter(Boolean) as string[])),
              ips: Array.from(new Set(windowMatches.map((m) => m.sourceIp).filter(Boolean) as string[])),
              resources: Array.from(new Set(windowMatches.map((m) => m.resource).filter(Boolean) as string[])),
            },
            reasonEn: `Threshold breached: ${windowMatches.length} matching events (threshold: ${threshold}) for entity '${key}' within ${windowMs}ms window.`,
            reasonAr: `تجاوز الحد المسموح: تم رصد ${windowMatches.length} حدثاً (الحد: ${threshold}) للكيان '${key}' خلال نافذة ${windowMs / 1000} ثانية.`,
            threatTechnique: rule.threatTechnique,
          });
        }
      }
    }
  });
}

function evaluateSequenceRule(
  events: SecurityTelemetryEvent[],
  rule: DetectionRule,
  alerts: SecurityAlert[]
) {
  const windowMs = rule.windowMs || 120000;

  // Track sequence per user
  const userEvents = new Map<string, SecurityTelemetryEvent[]>();
  for (const e of events) {
    if (!e.user) continue;
    if (!userEvents.has(e.user)) {
      userEvents.set(e.user, []);
    }
    userEvents.get(e.user)!.push(e);
  }

  userEvents.forEach((uEvents, user) => {
    // Look for >= 3 failures followed by a success within windowMs
    for (let i = 0; i < uEvents.length; i++) {
      const current = uEvents[i];
      if (current.outcome === 'SUCCESS' && current.category === 'AUTHENTICATION') {
        const windowStart = Math.max(0, current.virtualTime - windowMs);
        const priorFailures = uEvents.filter(
          (e) =>
            e.virtualTime >= windowStart &&
            e.virtualTime < current.virtualTime &&
            e.category === 'AUTHENTICATION' &&
            e.outcome === 'FAILURE'
        );

        if (priorFailures.length >= 3) {
          const alertId = `alt-${rule.id}-${user}-${current.virtualTime}`;
          if (!alerts.some((a) => a.id === alertId)) {
            alerts.push({
              id: alertId,
              ruleId: rule.id,
              ruleNameEn: rule.nameEn,
              ruleNameAr: rule.nameAr,
              severity: rule.severity,
              createdAtVirtualTime: current.virtualTime,
              status: 'NEW',
              evidenceEventIds: [...priorFailures.map((f) => f.id), current.id],
              entities: {
                users: [user],
                hosts: Array.from(new Set([current.host, ...priorFailures.map((f) => f.host)].filter(Boolean) as string[])),
                ips: Array.from(new Set([current.sourceIp, ...priorFailures.map((f) => f.sourceIp)].filter(Boolean) as string[])),
                resources: [],
              },
              reasonEn: `Sequence detected: User '${user}' experienced ${priorFailures.length} consecutive authentication failures followed by a successful authentication at T+${current.virtualTime}ms.`,
              reasonAr: `تم رصد تسلسل مريب: واجه المستخدم '${user}' عدد ${priorFailures.length} محاولات دخول فاشلة تلاها تسجيل دخول ناجح عند T+${current.virtualTime}ms.`,
              threatTechnique: rule.threatTechnique,
            });
          }
        }
      }
    }
  });
}
