/**
 * OMEGA V12 — Cross-Source Log Forensics & Timeline Merging Engine
 * Merges log streams from Windows, Linux, AD, Network, AppSec, and Web servers.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface ForensicLogEntry {
  id: string;
  source: 'WINDOWS' | 'LINUX' | 'IDENTITY' | 'APPSEC' | 'NETWORK' | 'WEB_SERVER';
  virtualTime: number;
  host: string;
  user: string;
  eventType: string;
  severity: 'info' | 'warn' | 'threat' | 'critical';
  descriptionEn: string;
  descriptionAr: string;
  rawRecord: Record<string, unknown>;
}

export const SYNTHETIC_LOG_ENTRIES: ForensicLogEntry[] = [
  {
    id: 'LOG-001',
    source: 'WINDOWS',
    virtualTime: 0,
    host: 'FIN-WS-01',
    user: 'sara',
    eventType: 'WIN_LOGIN_FAILED_4625',
    severity: 'warn',
    descriptionEn: 'Windows Security Event 4625: Logon failure for sara from 203.0.113.55',
    descriptionAr: 'حدث أمني 4625: فشل تسجيل دخول للمستخدم سارة من 203.0.113.55',
    rawRecord: { eventId: 4625, ip: '203.0.113.55' },
  },
  {
    id: 'LOG-002',
    source: 'IDENTITY',
    virtualTime: 350,
    host: 'DC-01',
    user: 'sara',
    eventType: 'KERBEROS_AUTH_SUCCESS',
    severity: 'info',
    descriptionEn: 'Kerberos TGT Issued for sara@CORP.NEXORA.LOCAL',
    descriptionAr: 'إصدار تذكرة كيربيروس للمستخدم سارة',
    rawRecord: { realm: 'CORP.NEXORA.LOCAL' },
  },
  {
    id: 'LOG-003',
    source: 'IDENTITY',
    virtualTime: 550,
    host: 'DC-01',
    user: 'sara',
    eventType: 'PRIVILEGED_GROUP_CHANGED',
    severity: 'threat',
    descriptionEn: 'AD Event 4728: User sara added to Domain Admins group',
    descriptionAr: 'حدث دليل نشط 4728: إضافة سارة لمجموعة مديرDomain Admins',
    rawRecord: { targetGroup: 'Domain Admins' },
  },
  {
    id: 'LOG-004',
    source: 'WINDOWS',
    virtualTime: 750,
    host: 'FIN-WS-01',
    user: 'sara',
    eventType: 'PROCESS_CREATION_4688',
    severity: 'threat',
    descriptionEn: 'Windows Event 4688: Process cmd.exe created by svchost.exe',
    descriptionAr: 'حدث 4688: إنشاء عملية cmd.exe بواسطة svchost.exe',
    rawRecord: { process: 'cmd.exe', parent: 'svchost.exe' },
  },
  {
    id: 'LOG-005',
    source: 'LINUX',
    virtualTime: 820,
    host: 'LINUX-SRV-01',
    user: 'root',
    eventType: 'LINUX_PROCESS_SPAWNED',
    severity: 'warn',
    descriptionEn: 'Linux System Log: /usr/bin/python3 http.server executed by root',
    descriptionAr: 'سجل نظام لينكس: تشغيل خادم بايثون بواسطة root',
    rawRecord: { pid: 4102, process: 'python3' },
  },
  {
    id: 'LOG-006',
    source: 'NETWORK',
    virtualTime: 900,
    host: 'FW-CORE-01',
    user: 'sara',
    eventType: 'FIREWALL_PACKET_BLOCKED',
    severity: 'warn',
    descriptionEn: 'Firewall ACL Blocked Connection 10.0.1.50 -> 10.0.5.20:5432',
    descriptionAr: 'جدار الحماية حظر اتصال 10.0.1.50 إلى خادم قواعد البيانات',
    rawRecord: { dstPort: 5432, action: 'DENY' },
  },
  {
    id: 'LOG-007',
    source: 'IDENTITY',
    virtualTime: 1150,
    host: 'FIN-SRV',
    user: 'sara',
    eventType: 'SENSITIVE_RESOURCE_ACCESS',
    severity: 'threat',
    descriptionEn: 'SMB Access Log: sara read \\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx',
    descriptionAr: 'سجل الوصول لمشاركة الملفات: وصول سارة لتقرير المالية Q3',
    rawRecord: { resource: '\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx' },
  },
  {
    id: 'LOG-008',
    source: 'APPSEC',
    virtualTime: 1350,
    host: 'APP-SRV-01',
    user: 'sara',
    eventType: 'APP_ACCESS_DENIED_403',
    severity: 'threat',
    descriptionEn: 'AppSec Log: 403 BOLA Authorization Violation on /api/v1/finance/reports',
    descriptionAr: 'سجل حماية التطبيقات: انتهاك صلاحيات 403 BOLA على واجهة البرمجة',
    rawRecord: { endpoint: '/api/v1/finance/reports', httpStatus: 403 },
  },
  {
    id: 'LOG-009',
    source: 'WINDOWS',
    virtualTime: 1550,
    host: 'FIN-WS-01',
    user: 'sara',
    eventType: 'WIN_LOG_CLEARED_1102',
    severity: 'critical',
    descriptionEn: 'Windows Security Event 1102: Security Audit Log Cleared',
    descriptionAr: 'حدث أمني 1102: تم تفريغ ومسح سجل الأحداث الأمنية',
    rawRecord: { eventId: 1102, logName: 'Security' },
  },
];

export function mergeLogSources(logBatches: ForensicLogEntry[][]): ForensicLogEntry[] {
  const merged = logBatches.flat();
  return merged.sort((a, b) => a.virtualTime - b.virtualTime);
}

export function filterLogs(
  logs: ForensicLogEntry[],
  options: {
    source?: string;
    host?: string;
    user?: string;
    minSeverity?: string;
    startTime?: number;
    endTime?: number;
  }
): ForensicLogEntry[] {
  return logs.filter((log) => {
    if (options.source && log.source !== options.source) return false;
    if (options.host && log.host !== options.host) return false;
    if (options.user && log.user !== options.user) return false;
    if (options.startTime !== undefined && log.virtualTime < options.startTime) return false;
    if (options.endTime !== undefined && log.virtualTime > options.endTime) return false;
    return true;
  });
}

export function findLogGaps(
  logs: ForensicLogEntry[],
  maxAllowedGapVirtualTime = 500
): { gapStart: number; gapEnd: number; duration: number }[] {
  const sorted = [...logs].sort((a, b) => a.virtualTime - b.virtualTime);
  const gaps: { gapStart: number; gapEnd: number; duration: number }[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].virtualTime - sorted[i].virtualTime;
    if (gap > maxAllowedGapVirtualTime) {
      gaps.push({
        gapStart: sorted[i].virtualTime,
        gapEnd: sorted[i + 1].virtualTime,
        duration: gap,
      });
    }
  }
  return gaps;
}

export function detectLogTampering(logs: ForensicLogEntry[]): ForensicLogEntry[] {
  return logs.filter(
    (l) =>
      l.eventType.includes('1102') ||
      l.eventType.includes('LOG_CLEARED') ||
      l.descriptionEn.toLowerCase().includes('cleared')
  );
}
