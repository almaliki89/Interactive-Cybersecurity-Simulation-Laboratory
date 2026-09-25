export type WindowsEventChannel = 'Security' | 'System' | 'Application';
export type WindowsEventSeverity = 'Information' | 'Warning' | 'Error' | 'Critical';

export interface WindowsEvent {
  id: string;
  eventRecordId: number;
  channel: WindowsEventChannel;
  eventId: number;
  taskCategory: string;
  severity: WindowsEventSeverity;
  virtualTimestamp: number; // in virtual milliseconds
  computer: string;
  provider: string;
  subjectUser: string;
  targetUser?: string;
  details: Record<string, string | number | boolean>;
  descriptionEn: string;
  descriptionAr: string;
}

export const INITIAL_WINDOWS_EVENTS: WindowsEvent[] = [
  {
    id: 'evt-4624-alice',
    eventRecordId: 10401,
    channel: 'Security',
    eventId: 4624,
    taskCategory: 'Logon',
    severity: 'Information',
    virtualTimestamp: 1000,
    computer: 'WIN-SRV-2025.corp.local',
    provider: 'Microsoft-Windows-Security-Auditing',
    subjectUser: 'WORKSTATION\\alice',
    targetUser: 'alice',
    details: {
      LogonType: 2, // Interactive console
      AuthenticationPackage: 'Negotiate',
      WorkstationName: 'WIN-SRV-2025',
      ProcessName: 'C:\\Windows\\System32\\winlogon.exe',
      ElevatedToken: 'Yes',
    },
    descriptionEn: 'An account was successfully logged on (Interactive console session).',
    descriptionAr: 'تم تسجيل دخول حساب المستخدم بنجاح (جلسة تشغيل تفاعلية).',
  },
  {
    id: 'evt-4672-alice',
    eventRecordId: 10402,
    channel: 'Security',
    eventId: 4672,
    taskCategory: 'Special Logon',
    severity: 'Information',
    virtualTimestamp: 1050,
    computer: 'WIN-SRV-2025.corp.local',
    provider: 'Microsoft-Windows-Security-Auditing',
    subjectUser: 'WORKSTATION\\alice',
    details: {
      Privileges: 'SeSecurityPrivilege, SeBackupPrivilege, SeDebugPrivilege',
      UserSid: 'S-1-5-21-1001',
    },
    descriptionEn: 'Special administrative privileges assigned to new logon session for alice.',
    descriptionAr: 'تم منح امتيازات إدارية خاصة لجلسة تسجيل الدخول الجديدة للمستخدمة alice.',
  },
  {
    id: 'evt-4625-intruder-1',
    eventRecordId: 10403,
    channel: 'Security',
    eventId: 4625,
    taskCategory: 'Logon',
    severity: 'Warning',
    virtualTimestamp: 3500,
    computer: 'WIN-SRV-2025.corp.local',
    provider: 'Microsoft-Windows-Security-Auditing',
    subjectUser: 'ANONYMOUS LOGON',
    targetUser: 'Administrator',
    details: {
      LogonType: 3, // Network logon
      FailureReason: '%%2313 (Unknown user name or bad password)',
      SubStatus: '0xc000006a',
      CallerProcessName: 'C:\\Windows\\System32\\svchost.exe',
      WorkstationName: 'ATTACKER-BOX',
      SourceNetworkAddress: '192.168.1.105',
    },
    descriptionEn: 'An account failed to log on: Bad password attempt against Administrator.',
    descriptionAr: 'فشل تسجيل الدخول: محاولة كلمة مرور خاطئة ضد حساب المسؤول Administrator.',
  },
  {
    id: 'evt-4625-intruder-2',
    eventRecordId: 10404,
    channel: 'Security',
    eventId: 4625,
    taskCategory: 'Logon',
    severity: 'Warning',
    virtualTimestamp: 4200,
    computer: 'WIN-SRV-2025.corp.local',
    provider: 'Microsoft-Windows-Security-Auditing',
    subjectUser: 'ANONYMOUS LOGON',
    targetUser: 'Administrator',
    details: {
      LogonType: 3,
      FailureReason: '%%2313 (Unknown user name or bad password)',
      SubStatus: '0xc000006a',
      SourceNetworkAddress: '192.168.1.105',
    },
    descriptionEn: 'Consecutive brute-force attempt detected from remote IP 192.168.1.105.',
    descriptionAr: 'رصد محاولة تخمين متتالية (Brute-force) من عنوان IP البعيد 192.168.1.105.',
  },
  {
    id: 'evt-4688-ps',
    eventRecordId: 10405,
    channel: 'Security',
    eventId: 4688,
    taskCategory: 'Process Creation',
    severity: 'Information',
    virtualTimestamp: 6000,
    computer: 'WIN-SRV-2025.corp.local',
    provider: 'Microsoft-Windows-Security-Auditing',
    subjectUser: 'WORKSTATION\\alice',
    details: {
      NewProcessName: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      CommandLine: 'powershell.exe -ExecutionPolicy Bypass -File audit.ps1',
      ParentProcessName: 'C:\\Windows\\explorer.exe',
      MandatoryLabel: 'Mandatory Label\\Medium Mandatory Level',
    },
    descriptionEn: 'A new process has been created: PowerShell invoked with ExecutionPolicy Bypass.',
    descriptionAr: 'تم إنشاء عملية جديدة: تشغيل PowerShell مع تجاوز سياسة التنفيذ.',
  },
  {
    id: 'evt-7045-agent',
    eventRecordId: 10406,
    channel: 'System',
    eventId: 7045,
    taskCategory: 'Service Control Manager',
    severity: 'Information',
    virtualTimestamp: 8500,
    computer: 'WIN-SRV-2025.corp.local',
    provider: 'Service Control Manager',
    subjectUser: 'NT AUTHORITY\\SYSTEM',
    details: {
      ServiceName: 'EnterpriseBackupAgent',
      ImagePath: 'C:\\Program Files\\Enterprise Cloud Backup\\agent.exe',
      ServiceType: 'user mode service',
      StartType: 'auto start',
      AccountName: 'LocalSystem',
    },
    descriptionEn: 'A new service was installed in the system: EnterpriseBackupAgent.',
    descriptionAr: 'تم تثبيت خدمة جديدة في النظام: EnterpriseBackupAgent.',
  },
  {
    id: 'evt-4720-user',
    eventRecordId: 10407,
    channel: 'Security',
    eventId: 4720,
    taskCategory: 'User Account Management',
    severity: 'Information',
    virtualTimestamp: 12000,
    computer: 'WIN-SRV-2025.corp.local',
    provider: 'Microsoft-Windows-Security-Auditing',
    subjectUser: 'WORKSTATION\\alice',
    targetUser: 'tariq_intern',
    details: {
      TargetUserName: 'tariq_intern',
      TargetSid: 'S-1-5-21-99887766-1008',
      UserAccountControl: '0x200 (Normal Account)',
    },
    descriptionEn: 'A new local user account was created: tariq_intern.',
    descriptionAr: 'تم إنشاء حساب مستخدم محلي جديد: tariq_intern.',
  },
];

export interface EventFilterOptions {
  channel?: WindowsEventChannel | 'ALL';
  eventId?: number | 'ALL';
  severity?: WindowsEventSeverity | 'ALL';
  query?: string;
}

/**
 * Filters Windows Event logs based on search criteria and channel.
 */
export function filterWindowsEvents(
  events: WindowsEvent[],
  filters: EventFilterOptions
): WindowsEvent[] {
  return events.filter((evt) => {
    if (filters.channel && filters.channel !== 'ALL' && evt.channel !== filters.channel) {
      return false;
    }
    if (filters.eventId && filters.eventId !== 'ALL' && evt.eventId !== filters.eventId) {
      return false;
    }
    if (filters.severity && filters.severity !== 'ALL' && evt.severity !== filters.severity) {
      return false;
    }
    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      const matchInDetails = Object.values(evt.details).some((val) =>
        String(val).toLowerCase().includes(q)
      );
      return (
        evt.descriptionEn.toLowerCase().includes(q) ||
        evt.descriptionAr.toLowerCase().includes(q) ||
        evt.subjectUser.toLowerCase().includes(q) ||
        (evt.targetUser && evt.targetUser.toLowerCase().includes(q)) ||
        evt.computer.toLowerCase().includes(q) ||
        String(evt.eventId).includes(q) ||
        matchInDetails
      );
    }
    return true;
  });
}

/**
 * Creates a new Windows Event with virtual timestamp.
 */
export function createWindowsEvent(
  events: WindowsEvent[],
  evt: Omit<WindowsEvent, 'id' | 'eventRecordId'>
): WindowsEvent[] {
  const nextRecordId = Math.max(...events.map((e) => e.eventRecordId), 10000) + 1;
  const newEvt: WindowsEvent = {
    ...evt,
    id: `evt-${evt.eventId}-${nextRecordId}`,
    eventRecordId: nextRecordId,
  };
  return [newEvt, ...events];
}
