export interface LinuxProcess {
  pid: number;
  ppid: number;
  user: string;
  name: string;
  state: 'running' | 'sleeping' | 'stopped' | 'zombie';
  cpu: number;
  port?: number;
  executable: string;
}

export function initProcessTree(): LinuxProcess[] {
  return [
    { pid: 1, ppid: 0, user: 'root', name: 'systemd', state: 'running', cpu: 0.1, executable: '/sbin/init' },
    { pid: 120, ppid: 1, user: 'root', name: 'sshd', state: 'sleeping', cpu: 0.0, port: 22, executable: '/usr/sbin/sshd' },
    { pid: 121, ppid: 120, user: 'root', name: 'sshd-session', state: 'sleeping', cpu: 0.0, executable: '/usr/sbin/sshd (session)' },
    { pid: 122, ppid: 121, user: 'alice', name: 'bash', state: 'running', cpu: 0.2, executable: '/bin/bash' },
    { pid: 140, ppid: 1, user: 'root', name: 'nginx-master', state: 'sleeping', cpu: 0.0, port: 80, executable: '/usr/sbin/nginx' },
    { pid: 141, ppid: 140, user: 'www-data', name: 'nginx-worker', state: 'running', cpu: 1.5, executable: '/usr/sbin/nginx (worker)' },
    { pid: 142, ppid: 140, user: 'www-data', name: 'nginx-worker', state: 'running', cpu: 1.2, executable: '/usr/sbin/nginx (worker)' },
    { pid: 200, ppid: 1, user: 'postgres', name: 'postgres', state: 'sleeping', cpu: 0.5, port: 5432, executable: '/usr/lib/postgresql/bin/postgres' },
    { pid: 250, ppid: 1, user: 'root', name: 'rsyslogd', state: 'sleeping', cpu: 0.1, executable: '/usr/sbin/rsyslogd' },
  ];
}

export function killProcess(processes: LinuxProcess[], pid: number): LinuxProcess[] {
  if (pid === 1) return processes; // Can't kill systemd (kernel panic!)

  // Find all child process PIDs recursively
  const getChildPids = (parentPid: number): number[] => {
    const children = processes.filter((p) => p.ppid === parentPid);
    return children.flatMap((c) => [c.pid, ...getChildPids(c.pid)]);
  };

  const pidsToRemove = new Set<number>([pid, ...getChildPids(pid)]);

  return processes.filter((p) => !pidsToRemove.has(p.pid));
}

export function startProcess(
  processes: LinuxProcess[],
  ppid: number,
  user: string,
  name: string,
  executable: string,
  port?: number
): LinuxProcess[] {
  const maxPid = processes.reduce((max, p) => (p.pid > max ? p.pid : max), 0);
  const newPid = maxPid + 1;

  const newProc: LinuxProcess = {
    pid: newPid,
    ppid,
    user,
    name,
    state: 'running',
    cpu: 0.5,
    port,
    executable,
  };

  return [...processes, newProc];
}
