/**
 * OMEGA V12 — Linux Defensive Artifacts Analysis Engine
 * Analyzes auth.log, sudo executions, systemd units, bash history, and process snapshots.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface LinuxArtifact {
  id: string;
  artifactType:
    | 'AUTH_LOG'
    | 'SUDO_EXEC'
    | 'SYSTEMD_SERVICE'
    | 'PROCESS_SNAPSHOT'
    | 'SHELL_HISTORY'
    | 'CRON_JOB';
  virtualTime: number;
  host: string;
  user: string;
  descriptionEn: string;
  descriptionAr: string;
  process?: string;
  service?: string;
  isSuspicious: boolean;
  metadata: Record<string, unknown>;
}

export const SYNTHETIC_LINUX_ARTIFACTS: LinuxArtifact[] = [
  {
    id: 'LNX-ART-001',
    artifactType: 'AUTH_LOG',
    virtualTime: 200,
    host: 'LINUX-SRV-01',
    user: 'root',
    descriptionEn: 'Failed SSH login attempt from 203.0.113.55 (PAM Auth Failure)',
    descriptionAr: 'محاولة تسجيل دخول SSH فاشلة عبر PAM',
    isSuspicious: true,
    metadata: { sourceIp: '203.0.113.55', port: 22, pamService: 'sshd' },
  },
  {
    id: 'LNX-ART-002',
    artifactType: 'PROCESS_SNAPSHOT',
    virtualTime: 820,
    host: 'LINUX-SRV-01',
    user: 'root',
    descriptionEn: 'Anomalous process spawned: /usr/bin/python3 -m http.server 8080',
    descriptionAr: 'تشغيل عملية غير مألوفة: خادم بايثون على المنفذ 8080',
    process: '/usr/bin/python3',
    isSuspicious: true,
    metadata: { pid: 4102, ppid: 1201, commandLine: '/usr/bin/python3 -m http.server 8080' },
  },
  {
    id: 'LNX-ART-003',
    artifactType: 'SUDO_EXEC',
    virtualTime: 825,
    host: 'LINUX-SRV-01',
    user: 'deploy',
    descriptionEn: 'Sudo privilege escalation executed: sudo systemctl restart nginx',
    descriptionAr: 'تنفيذ أمر بصلاحية sudo لإعادة تشغيل خادم النسيج',
    isSuspicious: false,
    metadata: { command: '/bin/systemctl restart nginx', allowed: true },
  },
  {
    id: 'LNX-ART-004',
    artifactType: 'SHELL_HISTORY',
    virtualTime: 830,
    host: 'LINUX-SRV-01',
    user: 'root',
    descriptionEn: 'Bash history entry: ncat -lvp 4444 -e /bin/bash',
    descriptionAr: 'سجل أوامر الباش يحتوى على أمر الاستماع للربط العكسي',
    isSuspicious: true,
    metadata: { historyFile: '/root/.bash_history', lineNum: 1042 },
  },
];

export function collectLinuxArtifacts(
  artifacts = SYNTHETIC_LINUX_ARTIFACTS
): LinuxArtifact[] {
  return [...artifacts];
}

export function findLinuxAuthFailures(
  artifacts = SYNTHETIC_LINUX_ARTIFACTS
): LinuxArtifact[] {
  return artifacts.filter((a) => a.artifactType === 'AUTH_LOG' && a.isSuspicious);
}

export function findLinuxSudoExecutions(
  artifacts = SYNTHETIC_LINUX_ARTIFACTS
): LinuxArtifact[] {
  return artifacts.filter((a) => a.artifactType === 'SUDO_EXEC');
}

export function findLinuxProcessTree(
  host: string,
  artifacts = SYNTHETIC_LINUX_ARTIFACTS
): LinuxArtifact[] {
  return artifacts.filter((a) => a.host === host && a.artifactType === 'PROCESS_SNAPSHOT');
}
