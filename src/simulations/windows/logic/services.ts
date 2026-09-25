import { WindowsProcess } from './processes';
import { WELL_KNOWN_SIDS } from './identity';

export interface WindowsService {
  id: string;
  serviceName: string;
  displayName: string;
  processId?: number;
  startupType: 'Automatic' | 'Manual' | 'Disabled';
  status: 'Running' | 'Stopped';
  serviceAccount: string; // 'LocalSystem' | 'NT AUTHORITY\\NetworkService' | 'NT AUTHORITY\\LocalService' | custom
  binaryPath: string;
  port?: number;
  protocol?: 'TCP' | 'UDP';
  isVulnerableUnquotedPath: boolean;
  descriptionEn: string;
  descriptionAr: string;
}

export const INITIAL_WINDOWS_SERVICES: WindowsService[] = [
  {
    id: 'svc-lanman',
    serviceName: 'LanmanServer',
    displayName: 'Server (SMB File Sharing)',
    processId: 1024,
    startupType: 'Automatic',
    status: 'Running',
    serviceAccount: 'LocalSystem',
    binaryPath: 'C:\\Windows\\System32\\svchost.exe -k netsvcs',
    port: 445,
    protocol: 'TCP',
    isVulnerableUnquotedPath: false,
    descriptionEn: 'Supports file, print, and named-pipe sharing over the network for this computer (SMB Port 445).',
    descriptionAr: 'يدعم مشاركة الملفات والطابعات عبر شبكة الاتصال (بروتوكول SMB المنفذ 445).',
  },
  {
    id: 'svc-termservice',
    serviceName: 'TermService',
    displayName: 'Remote Desktop Services',
    processId: 1024,
    startupType: 'Automatic',
    status: 'Running',
    serviceAccount: 'NT AUTHORITY\\NetworkService',
    binaryPath: 'C:\\Windows\\System32\\svchost.exe -k termsync',
    port: 3389,
    protocol: 'TCP',
    isVulnerableUnquotedPath: false,
    descriptionEn: 'Allows users to connect interactively to a remote computer (RDP Port 3389).',
    descriptionAr: 'يتيح للمستخدمين الاتصال التفاعلي بالحاسوب عن بعد عبر سطح المكتب البعيد RDP.',
  },
  {
    id: 'svc-spooler',
    serviceName: 'Spooler',
    displayName: 'Print Spooler',
    processId: 1820,
    startupType: 'Automatic',
    status: 'Running',
    serviceAccount: 'LocalSystem',
    binaryPath: 'C:\\Windows\\System32\\spoolsv.exe',
    isVulnerableUnquotedPath: false,
    descriptionEn: 'Manages all local and network print queues and controls all printing jobs.',
    descriptionAr: 'يدير مهام الطباعة وقوائم الانتظار المحلية والشبكية.',
  },
  {
    id: 'svc-telnet',
    serviceName: 'TlntSvr',
    displayName: 'Telnet Server Service',
    processId: 3920,
    startupType: 'Automatic', // Vulnerable configuration: Insecure legacy service running!
    status: 'Running',
    serviceAccount: 'LocalSystem',
    binaryPath: 'C:\\Windows\\System32\\tlntsvr.exe',
    port: 23,
    protocol: 'TCP',
    isVulnerableUnquotedPath: false,
    descriptionEn: 'Allows remote users to log on and run console programs over unencrypted plaintext (Port 23).',
    descriptionAr: 'يسمح بتسجيل الدخول عن بعد وتشغيل الأوامر عبر اتصال نصي غير مشفر (المنفذ 23 - ثغرة أمنية).',
  },
  {
    id: 'svc-custom-backup',
    serviceName: 'EnterpriseBackupAgent',
    displayName: 'Enterprise Corporate Backup Agent',
    processId: 4128,
    startupType: 'Automatic',
    status: 'Running',
    serviceAccount: 'LocalSystem',
    // Unquoted service path with spaces: Windows will try C:\Program.exe then C:\Program Files\Enterprise.exe!
    binaryPath: 'C:\\Program Files\\Enterprise Cloud Backup\\agent.exe',
    isVulnerableUnquotedPath: true,
    descriptionEn: 'Automated agent for nightly file replication. Has unquoted path containing spaces.',
    descriptionAr: 'وكيل النسخ الاحتياطي التلقائي. مساره غير محاط باقتباسات ويحتوي على مسافات (ثغرة Unquoted Path).',
  },
  {
    id: 'svc-wuauserv',
    serviceName: 'wuauserv',
    displayName: 'Windows Update',
    processId: 1024,
    startupType: 'Automatic',
    status: 'Running',
    serviceAccount: 'LocalSystem',
    binaryPath: 'C:\\Windows\\System32\\svchost.exe -k netsvcs',
    isVulnerableUnquotedPath: false,
    descriptionEn: 'Enables detection, download, and installation of updates for Windows and other programs.',
    descriptionAr: 'يمكن من اكتشاف وتنزيل وتثبيت تحديثات نظام ويندوز الأمنية.',
  },
  {
    id: 'svc-remoteregistry',
    serviceName: 'RemoteRegistry',
    displayName: 'Remote Registry',
    startupType: 'Disabled',
    status: 'Stopped',
    serviceAccount: 'NT AUTHORITY\\LocalService',
    binaryPath: 'C:\\Windows\\System32\\svchost.exe -k regsvc',
    isVulnerableUnquotedPath: false,
    descriptionEn: 'Enables remote users to modify registry settings on this computer.',
    descriptionAr: 'يتيح للمستخدمين عن بعد تعديل إعدادات سجل النظام (Registry).',
  },
];

/**
 * Checks whether a given service binary path suffers from an Unquoted Service Path vulnerability.
 * A path is vulnerable if it contains spaces and is NOT wrapped in double quotes.
 */
export function isPathUnquotedWithSpaces(binaryPath: string): boolean {
  const trimmed = binaryPath.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return false;
  }
  // Check if executable path part contains spaces before any arguments
  const exePart = trimmed.split('.exe')[0] + '.exe';
  return exePart.includes(' ');
}

/**
 * Fixes an unquoted service path by cleanly wrapping it in double quotes.
 */
export function fixUnquotedServicePath(service: WindowsService): WindowsService {
  let fixedPath = service.binaryPath.trim();
  if (!fixedPath.startsWith('"')) {
    // If it has arguments, quote the .exe part
    if (fixedPath.includes('.exe ')) {
      const parts = fixedPath.split('.exe ');
      fixedPath = `"${parts[0]}.exe" ${parts.slice(1).join('.exe ')}`;
    } else {
      fixedPath = `"${fixedPath}"`;
    }
  }

  return {
    ...service,
    binaryPath: fixedPath,
    isVulnerableUnquotedPath: false,
  };
}

/**
 * Starts a Windows service.
 */
export function startWindowsService(
  service: WindowsService,
  processTree: WindowsProcess[]
): { service: WindowsService; process?: WindowsProcess } {
  if (service.status === 'Running') {
    return { service };
  }

  const newPid = Math.max(...processTree.map((p) => p.pid), 5000) + 12;
  const newProcess: WindowsProcess = {
    pid: newPid,
    ppid: 740, // services.exe is the parent
    name: service.serviceName.toLowerCase() + '.exe',
    userSid: service.serviceAccount === 'LocalSystem' ? WELL_KNOWN_SIDS.LOCAL_SYSTEM : 'S-1-5-21-service',
    userName: service.serviceAccount === 'LocalSystem' ? 'NT AUTHORITY\\SYSTEM' : service.serviceAccount,
    integrityLevel: service.serviceAccount === 'LocalSystem' ? 'System' : 'High',
    session: 0,
    cpuPercent: 0.2,
    memoryMb: 28,
    binaryPath: service.binaryPath,
    commandLine: service.binaryPath,
    status: 'Running',
    securityCritical: false,
    descriptionEn: `Service process for ${service.displayName}`,
    descriptionAr: `عملية الخدمة لـ ${service.displayName}`,
  };

  const updatedService: WindowsService = {
    ...service,
    status: 'Running',
    processId: newPid,
  };

  return { service: updatedService, process: newProcess };
}

/**
 * Stops a Windows service.
 */
export function stopWindowsService(service: WindowsService): WindowsService {
  return {
    ...service,
    status: 'Stopped',
    processId: undefined,
  };
}

/**
 * Changes startup type of a service.
 */
export function changeStartupType(
  service: WindowsService,
  newType: 'Automatic' | 'Manual' | 'Disabled'
): WindowsService {
  return {
    ...service,
    startupType: newType,
  };
}

/**
 * Detects all services having unquoted service path issues.
 */
export function detectUnquotedServicePaths(services: WindowsService[]): WindowsService[] {
  return services.filter((s) => s.isVulnerableUnquotedPath || isPathUnquotedWithSpaces(s.binaryPath));
}

/**
 * Returns list of running services that expose network listening ports.
 */
export function getExposedWindowsServices(services: WindowsService[]): WindowsService[] {
  return services.filter((s) => s.status === 'Running' && s.port !== undefined);
}
