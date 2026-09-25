/**
 * OMEGA V12 — Master Forensic Timeline Reconstruction & Validation Engine
 * Unifies cross-world evidence into a single chronological attack narrative.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface ForensicTimelineEvent {
  id: string;
  virtualTime: number;
  source: string;
  category: string;
  descriptionEn: string;
  descriptionAr: string;
  evidenceIds: string[];
}

export const SYNTHETIC_MASTER_TIMELINE: ForensicTimelineEvent[] = [
  {
    id: 'TL-01-AUTH-FAIL',
    virtualTime: 0,
    source: 'WINDOWS_LOGIN_FAILED',
    category: 'AUTHENTICATION',
    descriptionEn: 'Initial brute force login attempts against FIN-WS-01 (Event 4625)',
    descriptionAr: 'محاولات دخول بالقوة القاطعة على FIN-WS-01 (حدث 4625)',
    evidenceIds: ['EVD-LOG-WIN-SEC', 'EVD-NET-PCAP-01'],
  },
  {
    id: 'TL-02-AUTH-SUCCESS',
    virtualTime: 350,
    source: 'KERBEROS_AUTH_SUCCESS',
    category: 'AUTHENTICATION',
    descriptionEn: 'Successful Kerberos login after credentials compromised for user sara',
    descriptionAr: 'تسجيل دخول ناجح عبر كيربيروس بعد تسريب بيانات الاعتماد للمستخدمة سارة',
    evidenceIds: ['EVD-LOG-WIN-SEC', 'EVD-MEM-FIN-WS01'],
  },
  {
    id: 'TL-03-PRIV-CHANGE',
    virtualTime: 550,
    source: 'PRIVILEGED_GROUP_CHANGED',
    category: 'GROUP_MANAGEMENT',
    descriptionEn: 'User sara added to Domain Admins group (AD Event 4728)',
    descriptionAr: 'إضافة سارة لمجموعة Domain Admins في الدليل النشط',
    evidenceIds: ['EVD-LOG-WIN-SEC', 'EVD-DISK-FIN-WS01'],
  },
  {
    id: 'TL-04-PROCESS-EXEC',
    virtualTime: 750,
    source: 'PROCESS_CREATION',
    category: 'PROCESS_EXECUTION',
    descriptionEn: 'Anomalous child process cmd.exe spawned by svchost.exe',
    descriptionAr: 'إنشاء عملية cmd.exe مشبوهة فرعية من svchost.exe',
    evidenceIds: ['EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01'],
  },
  {
    id: 'TL-05-LINUX-ANOMALY',
    virtualTime: 820,
    source: 'LINUX_PROCESS_SPAWNED',
    category: 'PROCESS_EXECUTION',
    descriptionEn: 'Anomalous Linux process /usr/bin/python3 spawned on LINUX-SRV-01',
    descriptionAr: 'تشغيل عملية بايثون مشبوهة على سيرفر لينكس',
    evidenceIds: ['EVD-LOG-LINUX-AUTH'],
  },
  {
    id: 'TL-06-NET-PROBE',
    virtualTime: 900,
    source: 'PACKET_BLOCKED',
    category: 'NETWORK',
    descriptionEn: 'Firewall ACL blocked network port scan from FIN-WS-01 to DB Server',
    descriptionAr: 'جدار الحماية يمنع فحص المنافذ القادم من FIN-WS-01 إلى خادم قواعد البيانات',
    evidenceIds: ['EVD-NET-PCAP-01'],
  },
  {
    id: 'TL-07-SENSITIVE-RESOURCE',
    virtualTime: 1150,
    source: 'SENSITIVE_RESOURCE_ACCESS',
    category: 'ACCESS_CONTROL',
    descriptionEn: 'User sara accessed confidential financial report Q3_Report.xlsx',
    descriptionAr: 'وصول المستخدمة سارة للتقرير المالي المكتوم Q3_Report.xlsx',
    evidenceIds: ['EVD-DISK-FIN-WS01'],
  },
  {
    id: 'TL-08-APPSEC-DENIAL',
    virtualTime: 1350,
    source: 'APP_ACCESS_DENIED',
    category: 'APPLICATION_DEFENSE',
    descriptionEn: 'AppSec 403 BOLA Violation on API endpoint /api/v1/finance/reports',
    descriptionAr: 'انتهاك صلاحيات التطبيق 403 BOLA على واجهة برمجية التقرير المالي',
    evidenceIds: ['EVD-BROWSER-HIST'],
  },
  {
    id: 'TL-09-LOG-TAMPER',
    virtualTime: 1550,
    source: 'WIN_LOG_CLEARED',
    category: 'SECURITY_CONFIGURATION',
    descriptionEn: 'Security Event Log cleared on FIN-WS-01 (Event 1102)',
    descriptionAr: 'تفريغ مسح سجل الأحداث الأمنية على FIN-WS-01 (حدث 1102)',
    evidenceIds: ['EVD-LOG-WIN-SEC', 'EVD-DISK-FIN-WS01'],
  },
];

export function buildForensicTimeline(
  events = SYNTHETIC_MASTER_TIMELINE
): ForensicTimelineEvent[] {
  return [...events].sort((a, b) => a.virtualTime - b.virtualTime);
}

export function sortTimeline(
  events: ForensicTimelineEvent[]
): ForensicTimelineEvent[] {
  return [...events].sort((a, b) => a.virtualTime - b.virtualTime);
}

export function validateTimelineContinuity(
  events: ForensicTimelineEvent[]
): { continuous: boolean; missingStageCount: number; reasonsEn: string[]; reasonsAr: string[] } {
  const categories = new Set(events.map((e) => e.category));
  const requiredCategories = ['AUTHENTICATION', 'GROUP_MANAGEMENT', 'PROCESS_EXECUTION', 'NETWORK', 'ACCESS_CONTROL'];

  const missing = requiredCategories.filter((cat) => !categories.has(cat));
  const continuous = missing.length === 0;

  return {
    continuous,
    missingStageCount: missing.length,
    reasonsEn: missing.map((m) => `Missing attack stage evidence for category: ${m}`),
    reasonsAr: missing.map((m) => `غياب الأدلة للمرحلة الهجومية الخاصة بـ: ${m}`),
  };
}

export function findTimelineGaps(
  events: ForensicTimelineEvent[],
  thresholdVirtualTime = 400
): { gapStart: number; gapEnd: number; gapDuration: number }[] {
  const sorted = sortTimeline(events);
  const gaps: { gapStart: number; gapEnd: number; gapDuration: number }[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = sorted[i + 1].virtualTime - sorted[i].virtualTime;
    if (diff > thresholdVirtualTime) {
      gaps.push({
        gapStart: sorted[i].virtualTime,
        gapEnd: sorted[i + 1].virtualTime,
        gapDuration: diff,
      });
    }
  }

  return gaps;
}
