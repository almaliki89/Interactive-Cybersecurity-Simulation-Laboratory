import { IntegrityLevel } from './token';
import { WELL_KNOWN_SIDS } from './identity';

export interface WindowsProcess {
  pid: number;
  ppid: number;
  name: string;
  userSid: string;
  userName: string;
  integrityLevel: IntegrityLevel;
  session: number;
  cpuPercent: number;
  memoryMb: number;
  binaryPath: string;
  commandLine: string;
  status: 'Running' | 'Suspended' | 'Terminated';
  securityCritical: boolean;
  descriptionEn: string;
  descriptionAr: string;
}

export const INITIAL_WINDOWS_PROCESSES: WindowsProcess[] = [
  {
    pid: 4,
    ppid: 0,
    name: 'System',
    userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
    userName: 'NT AUTHORITY\\SYSTEM',
    integrityLevel: 'System',
    session: 0,
    cpuPercent: 1.2,
    memoryMb: 85,
    binaryPath: 'ntoskrnl.exe',
    commandLine: 'ntoskrnl.exe',
    status: 'Running',
    securityCritical: true,
    descriptionEn: 'Core Windows NT kernel executive process',
    descriptionAr: 'عملية نواة ويندوز التنفيذية المركزية (Kernel)',
  },
  {
    pid: 492,
    ppid: 4,
    name: 'smss.exe',
    userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
    userName: 'NT AUTHORITY\\SYSTEM',
    integrityLevel: 'System',
    session: 0,
    cpuPercent: 0.1,
    memoryMb: 12,
    binaryPath: 'C:\\Windows\\System32\\smss.exe',
    commandLine: '\\SystemRoot\\System32\\smss.exe',
    status: 'Running',
    securityCritical: true,
    descriptionEn: 'Session Manager Subsystem: launches user sessions and wininit',
    descriptionAr: 'نظام إدارة الجلسات المسؤول عن تهيئة جلسات المستخدمين',
  },
  {
    pid: 612,
    ppid: 492,
    name: 'csrss.exe',
    userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
    userName: 'NT AUTHORITY\\SYSTEM',
    integrityLevel: 'System',
    session: 0,
    cpuPercent: 0.8,
    memoryMb: 34,
    binaryPath: 'C:\\Windows\\System32\\csrss.exe',
    commandLine: '%SystemRoot%\\system32\\csrss.exe ObjectDirectory=\\Windows SharedSection=1024,20480,768',
    status: 'Running',
    securityCritical: true,
    descriptionEn: 'Client Server Runtime Subsystem: handles GUI windows and process creation',
    descriptionAr: 'النظام الفرعي لوقت تشغيل العميل والخادم لإدارة النوافذ والعمليات',
  },
  {
    pid: 680,
    ppid: 492,
    name: 'wininit.exe',
    userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
    userName: 'NT AUTHORITY\\SYSTEM',
    integrityLevel: 'System',
    session: 0,
    cpuPercent: 0.2,
    memoryMb: 18,
    binaryPath: 'C:\\Windows\\System32\\wininit.exe',
    commandLine: 'wininit.exe',
    status: 'Running',
    securityCritical: true,
    descriptionEn: 'Windows Initialization: starts services.exe and lsass.exe',
    descriptionAr: 'عملية تهيئة ويندوز التي تبدأ مدير الخدمات ومسؤول الأمان lsass',
  },
  {
    pid: 740,
    ppid: 680,
    name: 'services.exe',
    userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
    userName: 'NT AUTHORITY\\SYSTEM',
    integrityLevel: 'System',
    session: 0,
    cpuPercent: 0.5,
    memoryMb: 45,
    binaryPath: 'C:\\Windows\\System32\\services.exe',
    commandLine: 'C:\\Windows\\system32\\services.exe',
    status: 'Running',
    securityCritical: true,
    descriptionEn: 'Service Control Manager: launches and monitors Windows services',
    descriptionAr: 'مدير التحكم بالخدمات المسؤول عن تشغيل ومراقبة خدمات النظام',
  },
  {
    pid: 752,
    ppid: 680,
    name: 'lsass.exe',
    userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
    userName: 'NT AUTHORITY\\SYSTEM',
    integrityLevel: 'System',
    session: 0,
    cpuPercent: 1.1,
    memoryMb: 68,
    binaryPath: 'C:\\Windows\\System32\\lsass.exe',
    commandLine: 'C:\\Windows\\system32\\lsass.exe',
    status: 'Running',
    securityCritical: true,
    descriptionEn: 'Local Security Authority Subsystem Service: enforces security policies and caches credentials (targeted by Mimikatz)',
    descriptionAr: 'خدمة هيئة الأمان المحلية للتحقق من كلمات المرور وتخزين التذاكر (هدف رئيسي للمهاجمين)',
  },
  {
    pid: 1024,
    ppid: 740,
    name: 'svchost.exe',
    userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
    userName: 'NT AUTHORITY\\SYSTEM',
    integrityLevel: 'System',
    session: 0,
    cpuPercent: 1.8,
    memoryMb: 110,
    binaryPath: 'C:\\Windows\\System32\\svchost.exe',
    commandLine: 'C:\\Windows\\system32\\svchost.exe -k netsvcs -p -s DnsCache',
    status: 'Running',
    securityCritical: false,
    descriptionEn: 'Generic host process for Windows services running from DLLs',
    descriptionAr: 'المضيف العام لتشغيل خدمات ويندوز المعتمدة على مكتبات DLL',
  },
  {
    pid: 1820,
    ppid: 740,
    name: 'spoolsv.exe',
    userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
    userName: 'NT AUTHORITY\\SYSTEM',
    integrityLevel: 'System',
    session: 0,
    cpuPercent: 0.3,
    memoryMb: 42,
    binaryPath: 'C:\\Windows\\System32\\spoolsv.exe',
    commandLine: 'C:\\Windows\\System32\\spoolsv.exe',
    status: 'Running',
    securityCritical: false,
    descriptionEn: 'Print Spooler Service: manages printing jobs (PrintNightmare vulnerability)',
    descriptionAr: 'خدمة التخزين المؤقت للطباعة (عرضة لثغرات تصعيد الصلاحيات PrintNightmare)',
  },
  {
    pid: 3410,
    ppid: 0,
    name: 'explorer.exe',
    userSid: 'S-1-5-21-1001',
    userName: 'WORKSTATION\\alice',
    integrityLevel: 'Medium',
    session: 1,
    cpuPercent: 2.5,
    memoryMb: 180,
    binaryPath: 'C:\\Windows\\explorer.exe',
    commandLine: 'C:\\Windows\\Explorer.EXE',
    status: 'Running',
    securityCritical: false,
    descriptionEn: 'Windows Graphical Shell and Desktop manager for interactive user session',
    descriptionAr: 'واجهة سطح المكتب الرسومية ومستكشف الملفات للمستخدم المتصل',
  },
  {
    pid: 4890,
    ppid: 3410,
    name: 'powershell.exe',
    userSid: 'S-1-5-21-1001',
    userName: 'WORKSTATION\\alice',
    integrityLevel: 'Medium',
    session: 1,
    cpuPercent: 0.9,
    memoryMb: 95,
    binaryPath: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
    commandLine: 'powershell.exe -NoProfile -ExecutionPolicy Bypass',
    status: 'Running',
    securityCritical: false,
    descriptionEn: 'PowerShell Automation Engine running at Medium Integrity',
    descriptionAr: 'بيئة PowerShell لتنفيذ المهام البرمجية بمستوى تكامل متوسط',
  },
];

/**
 * Initializes the initial standard Windows process tree.
 */
export function initWindowsProcessTree(): WindowsProcess[] {
  return [...INITIAL_WINDOWS_PROCESSES];
}

const INTEGRITY_RANK: Record<IntegrityLevel, number> = {
  Untrusted: 0,
  Low: 1,
  Medium: 2,
  High: 3,
  System: 4,
};

/**
 * Evaluates Windows Mandatory Integrity Control (MIC) and process access rights.
 *
 * Windows MIC rule:
 * - A process with lower integrity cannot obtain write access (WriteProcessMemory, Terminate)
 *   to a target process with higher integrity (No-Write-Up).
 * - Read access (ReadProcessMemory) is permitted across same or lower, but reading System processes
 *   (like lsass.exe) requires SeDebugPrivilege.
 */
export function canProcessAccessTarget(
  sourceProcess: WindowsProcess,
  targetProcess: WindowsProcess,
  accessRight: 'ReadMemory' | 'WriteMemory' | 'Terminate',
  callerHasDebugPrivilege: boolean = false
): { allowed: boolean; reasonEn: string; reasonAr: string } {
  const sourceRank = INTEGRITY_RANK[sourceProcess.integrityLevel];
  const targetRank = INTEGRITY_RANK[targetProcess.integrityLevel];

  // Self access is always allowed
  if (sourceProcess.pid === targetProcess.pid) {
    return {
      allowed: true,
      reasonEn: 'Process has inherent access to its own address space',
      reasonAr: 'العملية تمتلك وصولاً ذاتياً طبيعياً لمساحة عناوينها',
    };
  }

  // System level processes or callers with SeDebugPrivilege bypass standard MIC checks
  if (sourceProcess.integrityLevel === 'System' || callerHasDebugPrivilege) {
    return {
      allowed: true,
      reasonEn: 'Elevated System integrity or SeDebugPrivilege grants full access to target process',
      reasonAr: 'مستوى تكامل System أو امتياز SeDebugPrivilege يمنح وصولاً شاملاً للعملية الهدف',
    };
  }

  // Mandatory Integrity Control: No-Write-Up
  if (accessRight === 'WriteMemory' || accessRight === 'Terminate') {
    if (sourceRank < targetRank) {
      return {
        allowed: false,
        reasonEn: `Access Denied (MIC Violation): Source (${sourceProcess.integrityLevel}) cannot modify higher integrity target (${targetProcess.integrityLevel})`,
        reasonAr: `تم رفض الوصول (انتهاك MIC): لا يمكن لمستوى تكامل (${sourceProcess.integrityLevel}) تعديل أو إنهاء هدف أعلى (${targetProcess.integrityLevel})`,
      };
    }

    // Different users at same integrity: must be same user
    if (sourceProcess.userSid !== targetProcess.userSid && sourceRank <= INTEGRITY_RANK['Medium']) {
      return {
        allowed: false,
        reasonEn: 'Access Denied: Standard user cannot terminate processes owned by other users',
        reasonAr: 'تم رفض الوصول: المستخدم القياسي لا يستطيع إنهاء عمليات يملكها مستخدم آخر',
      };
    }

    return {
      allowed: true,
      reasonEn: 'Operation permitted within compatible integrity and user boundaries',
      reasonAr: 'العملية مسموحة ضمن حدود التكامل والتفويض المتوافقة',
    };
  }

  // Read access
  if (accessRight === 'ReadMemory') {
    if (targetProcess.securityCritical && targetProcess.name === 'lsass.exe') {
      return {
        allowed: false,
        reasonEn: 'Protected Process Light (PPL) / Access Denied: Reading lsass.exe requires SeDebugPrivilege',
        reasonAr: 'حماية العمليات المتقدمة (PPL): قراءة ذاكرة lsass.exe تتطلب امتياز SeDebugPrivilege صريح',
      };
    }

    if (sourceRank < targetRank && targetProcess.integrityLevel === 'System') {
      return {
        allowed: false,
        reasonEn: 'Access Denied: Standard integrity cannot read kernel/System process memory',
        reasonAr: 'تم رفض الوصول: المستوى المتوسط لا يمكنه قراءة ذاكرة عمليات النظام System',
      };
    }

    return {
      allowed: true,
      reasonEn: 'Read access permitted to target process virtual memory',
      reasonAr: 'القراءة مصرح بها لذاكرة العملية الافتراضية',
    };
  }

  return {
    allowed: false,
    reasonEn: 'Unknown access right requested',
    reasonAr: 'نوع الصلاحية المطلوبة غير معروف',
  };
}

/**
 * Spawns a new process in the simulated Windows process table.
 */
export function spawnWindowsProcess(
  processTree: WindowsProcess[],
  name: string,
  userName: string,
  userSid: string,
  integrityLevel: IntegrityLevel,
  commandLine: string
): WindowsProcess[] {
  // Deterministic PID allocation aligned to 4-byte boundaries (Windows PID convention)
  const currentMax = Math.max(...processTree.map((p) => p.pid), 5000);
  const nextPid = currentMax + 4;
  const parent = processTree.find((p) => p.name === 'explorer.exe') || processTree[0];

  const newProc: WindowsProcess = {
    pid: nextPid,
    ppid: parent.pid,
    name,
    userSid,
    userName,
    integrityLevel,
    session: 1,
    cpuPercent: 0.1,
    memoryMb: 35,
    binaryPath: `C:\\Windows\\System32\\${name}`,
    commandLine,
    status: 'Running',
    securityCritical: false,
    descriptionEn: `User spawned process ${name}`,
    descriptionAr: `عملية تم إنشاؤها من قبل المستخدم ${name}`,
  };

  return [...processTree, newProc];
}

/**
 * Terminates a process in the tree if permitted.
 */
export function terminateWindowsProcess(processTree: WindowsProcess[], pid: number): WindowsProcess[] {
  return processTree.filter((p) => p.pid !== pid);
}
