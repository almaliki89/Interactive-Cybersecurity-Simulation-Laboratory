/**
 * OMEGA V12 — Windows Defensive Artifacts Analysis Engine
 * Analyzes Event Logs (4624, 4625, 4688, 4728, 7045, 1102), Registry, Prefetch, and Tasks.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface WindowsArtifact {
  id: string;
  artifactType:
    | 'EVENT_LOG'
    | 'PROCESS_EXECUTION'
    | 'SERVICE'
    | 'REGISTRY'
    | 'PREFETCH'
    | 'USER_PROFILE';
  virtualTime: number;
  host: string;
  user: string;
  descriptionEn: string;
  descriptionAr: string;
  eventId?: string;
  processName?: string;
  parentProcess?: string;
  serviceName?: string;
  isSuspicious: boolean;
  metadata: Record<string, unknown>;
}

export const SYNTHETIC_WINDOWS_ARTIFACTS: WindowsArtifact[] = [
  {
    id: 'WIN-ART-001',
    artifactType: 'EVENT_LOG',
    virtualTime: 0,
    host: 'FIN-WS-01',
    user: 'sara',
    descriptionEn: 'Failed Logon Attempt 1 (Event 4625)',
    descriptionAr: 'محاولة تسجيل دخول فاشلة 1 (حدث 4625)',
    eventId: '4625',
    isSuspicious: true,
    metadata: { sourceIp: '203.0.113.55', logonType: 3, failureReason: 'BadPassword' },
  },
  {
    id: 'WIN-ART-002',
    artifactType: 'EVENT_LOG',
    virtualTime: 350,
    host: 'FIN-WS-01',
    user: 'sara',
    descriptionEn: 'Kerberos Logon Success (Event 4624 / AS-REP)',
    descriptionAr: 'نجاح تسجيل دخول كيربيروس (حدث 4624)',
    eventId: '4624',
    isSuspicious: false,
    metadata: { sourceIp: '203.0.113.55', logonType: 3 },
  },
  {
    id: 'WIN-ART-003',
    artifactType: 'EVENT_LOG',
    virtualTime: 550,
    host: 'DC-01',
    user: 'sara',
    descriptionEn: 'Member Added to Privileged Group Domain Admins (Event 4728)',
    descriptionAr: 'إضافة مستخدم لمجموعة Domain Admins ذات الصلاحيات العالية (حدث 4728)',
    eventId: '4728',
    isSuspicious: true,
    metadata: { targetGroup: 'Domain Admins', targetUser: 'sara' },
  },
  {
    id: 'WIN-ART-004',
    artifactType: 'PROCESS_EXECUTION',
    virtualTime: 750,
    host: 'FIN-WS-01',
    user: 'sara',
    descriptionEn: 'Anomalous Process Created: cmd.exe /c whoami /priv (Event 4688)',
    descriptionAr: 'إنشاء عملية مشبوهة: cmd.exe /c whoami /priv (حدث 4688)',
    eventId: '4688',
    processName: 'cmd.exe',
    parentProcess: 'svchost.exe',
    isSuspicious: true,
    metadata: { commandLine: 'cmd.exe /c whoami /priv', parentImage: 'C:\\Windows\\System32\\svchost.exe' },
  },
  {
    id: 'WIN-ART-005',
    artifactType: 'PREFETCH',
    virtualTime: 752,
    host: 'FIN-WS-01',
    user: 'sara',
    descriptionEn: 'Prefetch File Created for CMD.EXE-3A2190B4.pf',
    descriptionAr: 'إنشاء ملف Prefetch للعملية CMD.EXE',
    processName: 'CMD.EXE',
    isSuspicious: false,
    metadata: { runCount: 1, lastRunVirtualTime: 752 },
  },
  {
    id: 'WIN-ART-006',
    artifactType: 'EVENT_LOG',
    virtualTime: 1550,
    host: 'FIN-WS-01',
    user: 'sara',
    descriptionEn: 'Security Event Log Cleared on FIN-WS-01 (Event 1102)',
    descriptionAr: 'مسح سجل الأحداث الأمنية على الجهاز FIN-WS-01 (حدث 1102)',
    eventId: '1102',
    isSuspicious: true,
    metadata: { logName: 'Security', clearedByUser: 'sara' },
  },
];

export function collectWindowsArtifacts(
  artifacts = SYNTHETIC_WINDOWS_ARTIFACTS
): WindowsArtifact[] {
  return [...artifacts];
}

export function findProcessExecutionArtifacts(
  artifacts = SYNTHETIC_WINDOWS_ARTIFACTS
): WindowsArtifact[] {
  return artifacts.filter((a) => a.artifactType === 'PROCESS_EXECUTION' || a.eventId === '4688');
}

export function findServiceChanges(
  artifacts = SYNTHETIC_WINDOWS_ARTIFACTS
): WindowsArtifact[] {
  return artifacts.filter((a) => a.artifactType === 'SERVICE' || a.eventId === '7045');
}

export function findLogTamperingEvidence(
  artifacts = SYNTHETIC_WINDOWS_ARTIFACTS
): WindowsArtifact[] {
  return artifacts.filter((a) => a.eventId === '1102' || a.descriptionEn.toLowerCase().includes('cleared'));
}
