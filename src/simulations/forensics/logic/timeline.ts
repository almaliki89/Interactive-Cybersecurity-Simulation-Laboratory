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

export interface TimelineEvidenceValidation {
  valid: boolean;
  missingStages: string[];
  outOfOrderStages: string[];
  missingEvidenceLinkStages: string[];
  reasonsEn: string[];
  reasonsAr: string[];
}

export const CORE_TIMELINE_STAGES = [
  'AUTH_FAILURE',
  'AUTH_SUCCESS',
  'PRIVILEGED_GROUP_CHANGE',
  'WINDOWS_PROCESS_ANOMALY',
  'LINUX_PROCESS_ANOMALY',
  'NETWORK_PROBE',
  'SENSITIVE_RESOURCE_ACCESS',
  'APPSEC_ANOMALY',
  'LOG_TAMPER',
] as const;

export function identifyTimelineStage(event: ForensicTimelineEvent): string | null {
  const id = event.id.toUpperCase();
  const src = event.source.toUpperCase();
  const desc = event.descriptionEn.toLowerCase();
  const cat = event.category.toUpperCase();

  if (id.includes('LOG-TAMPER') || src.includes('WIN_LOG_CLEARED') || desc.includes('cleared')) {
    return 'LOG_TAMPER';
  }
  if (id.includes('APPSEC') || src.includes('APP_ACCESS_DENIED') || cat === 'APPLICATION_DEFENSE' || desc.includes('bola')) {
    return 'APPSEC_ANOMALY';
  }
  if (id.includes('SENSITIVE') || src.includes('SENSITIVE_RESOURCE') || (cat === 'ACCESS_CONTROL' && desc.includes('q3_report'))) {
    return 'SENSITIVE_RESOURCE_ACCESS';
  }
  if (id.includes('NET-PROBE') || src.includes('PACKET_BLOCKED') || cat === 'NETWORK') {
    return 'NETWORK_PROBE';
  }
  if (id.includes('LINUX') || src.includes('LINUX') || desc.includes('linux')) {
    return 'LINUX_PROCESS_ANOMALY';
  }
  if (id.includes('PROCESS-EXEC') || (cat === 'PROCESS_EXECUTION' && src === 'PROCESS_CREATION')) {
    return 'WINDOWS_PROCESS_ANOMALY';
  }
  if (id.includes('PRIV-CHANGE') || src.includes('PRIVILEGED_GROUP') || cat === 'GROUP_MANAGEMENT') {
    return 'PRIVILEGED_GROUP_CHANGE';
  }
  if (id.includes('AUTH-SUCCESS') || src.includes('KERBEROS_AUTH_SUCCESS') || (cat === 'AUTHENTICATION' && desc.includes('successful'))) {
    return 'AUTH_SUCCESS';
  }
  if (id.includes('AUTH-FAIL') || src.includes('LOGIN_FAILED') || (cat === 'AUTHENTICATION' && (desc.includes('failed') || desc.includes('brute')))) {
    return 'AUTH_FAILURE';
  }

  return null;
}

export function validateForensicTimelineEvidence(
  events: ForensicTimelineEvent[]
): TimelineEvidenceValidation {
  const missingStages: string[] = [];
  const outOfOrderStages: string[] = [];
  const missingEvidenceLinkStages: string[] = [];
  const reasonsEn: string[] = [];
  const reasonsAr: string[] = [];

  const stageEvents: Map<string, ForensicTimelineEvent> = new Map();

  for (const ev of events) {
    const stage = identifyTimelineStage(ev);
    if (stage && !stageEvents.has(stage)) {
      stageEvents.set(stage, ev);
    }
  }

  // 1. Check stage presence and evidence link
  for (const reqStage of CORE_TIMELINE_STAGES) {
    const ev = stageEvents.get(reqStage);
    if (!ev) {
      missingStages.push(reqStage);
      reasonsEn.push(`Missing required timeline attack stage: ${reqStage}`);
      reasonsAr.push(`مرحلة هجومية مفقودة في الخط الزمني: ${reqStage}`);
    } else if (!ev.evidenceIds || ev.evidenceIds.length === 0) {
      missingEvidenceLinkStages.push(reqStage);
      reasonsEn.push(`Stage ${reqStage} lacks supporting forensic evidence linkage.`);
      reasonsAr.push(`المرحلة ${reqStage} تفتقر لربط دليل جنائي مؤيد.`);
    }
  }

  // 2. Check chronological ordering
  let lastTime = -1;
  for (const reqStage of CORE_TIMELINE_STAGES) {
    const ev = stageEvents.get(reqStage);
    if (ev) {
      if (ev.virtualTime < lastTime) {
        outOfOrderStages.push(reqStage);
        reasonsEn.push(`Stage ${reqStage} occurred out of chronological order (T+${ev.virtualTime} < T+${lastTime}).`);
        reasonsAr.push(`المرحلة ${reqStage} جاءت بتسلسل زمني خاطئ.`);
      }
      lastTime = Math.max(lastTime, ev.virtualTime);
    }
  }

  const valid = missingStages.length === 0 && outOfOrderStages.length === 0 && missingEvidenceLinkStages.length === 0;

  return {
    valid,
    missingStages,
    outOfOrderStages,
    missingEvidenceLinkStages,
    reasonsEn,
    reasonsAr,
  };
}

export function validateTimelineContinuity(
  events: ForensicTimelineEvent[]
): { continuous: boolean; missingStageCount: number; reasonsEn: string[]; reasonsAr: string[] } {
  const val = validateForensicTimelineEvidence(events);
  return {
    continuous: val.valid,
    missingStageCount: val.missingStages.length,
    reasonsEn: val.reasonsEn,
    reasonsAr: val.reasonsAr,
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
