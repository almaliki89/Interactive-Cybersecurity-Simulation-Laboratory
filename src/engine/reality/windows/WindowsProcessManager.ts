/**
 * OMEGA ULTRA REALITY V1.4 — Windows Process Manager
 * Manages processes, parent-child trees, process tokens, sessions, and integrity levels.
 * Emits Windows Security Event Logs 4688 (Process Creation) and 4689 (Process Termination).
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { WindowsProcess, ProcessIntegrityLevel } from './types';
import { globalSimulationRuntime } from '../../runtime/SimulationRuntime';

export class WindowsProcessManager {
  private machineId: string;
  private processes: Map<number, WindowsProcess> = new Map();
  private nextPid: number = 2000;

  constructor(machineId: string) {
    this.machineId = machineId;
    this.initDefaultProcesses();
  }

  public initDefaultProcesses(): void {
    this.processes.clear();

    // Session 0 System Baseline
    this.registerProcess({
      pid: 4,
      name: 'System',
      executablePath: 'C:\\Windows\\System32\\ntoskrnl.exe',
      commandLine: 'ntoskrnl.exe',
      userSid: 'S-1-5-18',
      userName: 'NT AUTHORITY\\SYSTEM',
      parentPid: 0,
      sessionId: 0,
      integrityLevel: 'System',
      cpuPercentSimulated: 0.8,
      memoryMbSimulated: 24.5,
      status: 'RUNNING',
      startVirtualTime: 0,
      threadsCount: 180,
      handlesCount: 3200,
    });

    this.registerProcess({
      pid: 340,
      name: 'smss.exe',
      executablePath: 'C:\\Windows\\System32\\smss.exe',
      commandLine: '\\SystemRoot\\System32\\smss.exe',
      userSid: 'S-1-5-18',
      userName: 'NT AUTHORITY\\SYSTEM',
      parentPid: 4,
      sessionId: 0,
      integrityLevel: 'System',
      cpuPercentSimulated: 0.1,
      memoryMbSimulated: 4.2,
      status: 'RUNNING',
      startVirtualTime: 0,
      threadsCount: 4,
      handlesCount: 65,
    });

    this.registerProcess({
      pid: 420,
      name: 'csrss.exe',
      executablePath: 'C:\\Windows\\System32\\csrss.exe',
      commandLine: 'C:\\Windows\\system32\\csrss.exe ObjectDirectory=\\Windows SharedSection=1024,20480,768',
      userSid: 'S-1-5-18',
      userName: 'NT AUTHORITY\\SYSTEM',
      parentPid: 340,
      sessionId: 0,
      integrityLevel: 'System',
      cpuPercentSimulated: 0.3,
      memoryMbSimulated: 8.4,
      status: 'RUNNING',
      startVirtualTime: 0,
      threadsCount: 16,
      handlesCount: 450,
    });

    this.registerProcess({
      pid: 480,
      name: 'wininit.exe',
      executablePath: 'C:\\Windows\\System32\\wininit.exe',
      commandLine: 'wininit.exe',
      userSid: 'S-1-5-18',
      userName: 'NT AUTHORITY\\SYSTEM',
      parentPid: 340,
      sessionId: 0,
      integrityLevel: 'System',
      cpuPercentSimulated: 0.1,
      memoryMbSimulated: 6.1,
      status: 'RUNNING',
      startVirtualTime: 0,
      threadsCount: 8,
      handlesCount: 180,
    });

    this.registerProcess({
      pid: 540,
      name: 'services.exe',
      executablePath: 'C:\\Windows\\System32\\services.exe',
      commandLine: 'C:\\Windows\\system32\\services.exe',
      userSid: 'S-1-5-18',
      userName: 'NT AUTHORITY\\SYSTEM',
      parentPid: 480,
      sessionId: 0,
      integrityLevel: 'System',
      cpuPercentSimulated: 0.5,
      memoryMbSimulated: 18.2,
      status: 'RUNNING',
      startVirtualTime: 0,
      threadsCount: 22,
      handlesCount: 640,
    });

    this.registerProcess({
      pid: 600,
      name: 'lsass.exe',
      executablePath: 'C:\\Windows\\System32\\lsass.exe',
      commandLine: 'C:\\Windows\\system32\\lsass.exe',
      userSid: 'S-1-5-18',
      userName: 'NT AUTHORITY\\SYSTEM',
      parentPid: 480,
      sessionId: 0,
      integrityLevel: 'System',
      cpuPercentSimulated: 0.7,
      memoryMbSimulated: 32.0,
      status: 'RUNNING',
      startVirtualTime: 0,
      threadsCount: 30,
      handlesCount: 1100,
    });

    this.registerProcess({
      pid: 750,
      name: 'svchost.exe',
      executablePath: 'C:\\Windows\\System32\\svchost.exe',
      commandLine: 'C:\\Windows\\system32\\svchost.exe -k DcomLaunch -p',
      userSid: 'S-1-5-18',
      userName: 'NT AUTHORITY\\SYSTEM',
      parentPid: 540,
      sessionId: 0,
      integrityLevel: 'System',
      cpuPercentSimulated: 0.4,
      memoryMbSimulated: 28.5,
      status: 'RUNNING',
      startVirtualTime: 0,
      threadsCount: 40,
      handlesCount: 950,
    });
  }

  public registerProcess(proc: WindowsProcess): void {
    this.processes.set(proc.pid, { ...proc });
  }

  public getProcess(pid: number): WindowsProcess | undefined {
    return this.processes.get(pid);
  }

  public getAllProcesses(): WindowsProcess[] {
    return Array.from(this.processes.values()).map((p) => ({ ...p }));
  }

  public getProcessesBySession(sessionId: number): WindowsProcess[] {
    return Array.from(this.processes.values())
      .filter((p) => p.sessionId === sessionId && p.status === 'RUNNING')
      .map((p) => ({ ...p }));
  }

  /**
   * Spawns standard user desktop processes when interactive logon occurs.
   */
  public spawnUserSessionProcesses(params: {
    sessionId: number;
    userSid: string;
    userName: string;
    vTime: number;
  }): WindowsProcess[] {
    const created: WindowsProcess[] = [];

    // 1. userinit.exe
    const pUserinit = this.createProcess({
      name: 'userinit.exe',
      executablePath: 'C:\\Windows\\System32\\userinit.exe',
      commandLine: 'C:\\Windows\\system32\\userinit.exe',
      userSid: params.userSid,
      userName: params.userName,
      parentPid: 480, // wininit / winlogon
      sessionId: params.sessionId,
      integrityLevel: 'Medium',
      cpuPercent: 0.2,
      memoryMb: 8.5,
      vTime: params.vTime,
    });
    created.push(pUserinit);

    // 2. explorer.exe (Desktop Shell)
    const pExplorer = this.createProcess({
      name: 'explorer.exe',
      executablePath: 'C:\\Windows\\explorer.exe',
      commandLine: 'C:\\Windows\\Explorer.EXE',
      userSid: params.userSid,
      userName: params.userName,
      parentPid: pUserinit.pid,
      sessionId: params.sessionId,
      integrityLevel: 'Medium',
      cpuPercent: 1.2,
      memoryMb: 68.0,
      vTime: params.vTime,
    });
    created.push(pExplorer);

    // 3. ctfmon.exe (Language / Input Framework)
    const pCtfmon = this.createProcess({
      name: 'ctfmon.exe',
      executablePath: 'C:\\Windows\\System32\\ctfmon.exe',
      commandLine: '"C:\\Windows\\system32\\ctfmon.exe"',
      userSid: params.userSid,
      userName: params.userName,
      parentPid: pExplorer.pid,
      sessionId: params.sessionId,
      integrityLevel: 'Medium',
      cpuPercent: 0.1,
      memoryMb: 12.0,
      vTime: params.vTime,
    });
    created.push(pCtfmon);

    return created;
  }

  /**
   * Creates a new simulated process. Emits Windows Security Event 4688.
   */
  public createProcess(params: {
    name: string;
    executablePath: string;
    commandLine: string;
    userSid: string;
    userName: string;
    parentPid: number;
    sessionId: number;
    integrityLevel: ProcessIntegrityLevel;
    cpuPercent?: number;
    memoryMb?: number;
    vTime?: number;
  }): WindowsProcess {
    this.nextPid += 4;
    const pid = this.nextPid;
    const vt = params.vTime ?? globalSimulationRuntime.clock.getVirtualTime();

    const proc: WindowsProcess = {
      pid,
      name: params.name,
      executablePath: params.executablePath,
      commandLine: params.commandLine,
      userSid: params.userSid,
      userName: params.userName,
      parentPid: params.parentPid,
      sessionId: params.sessionId,
      integrityLevel: params.integrityLevel,
      cpuPercentSimulated: params.cpuPercent ?? 0.5,
      memoryMbSimulated: params.memoryMb ?? 16.0,
      status: 'RUNNING',
      startVirtualTime: vt,
      threadsCount: 4,
      handlesCount: 80,
    };

    this.processes.set(pid, proc);

    // Emit Windows Security Event 4688
    globalSimulationRuntime.dispatch({
      type: 'WINDOWS_PROCESS_CREATED',
      category: 'SYSTEM',
      source: this.machineId,
      severity: 'info',
      description: `Event 4688: A new process has been created (${proc.name}, PID: ${proc.pid}, Parent PID: ${proc.parentPid}).`,
      payload: {
        machineId: this.machineId,
        eventId: 4688,
        logName: 'Security',
        newProcessId: `0x${proc.pid.toString(16)}`,
        newProcessName: proc.executablePath,
        parentProcessId: `0x${proc.parentPid.toString(16)}`,
        commandLine: proc.commandLine,
        subjectUserSid: proc.userSid,
        subjectUserName: proc.userName,
        mandatoryLabel: `Mandatory Label\\${proc.integrityLevel} Mandatory Level`,
        virtualTime: vt,
      },
    });

    return proc;
  }

  /**
   * Terminates a process. Emits Windows Security Event 4689.
   */
  public terminateProcess(pid: number, exitCode: number = 0, vTime?: number): boolean {
    const proc = this.processes.get(pid);
    if (!proc || proc.status === 'TERMINATED') return false;

    const vt = vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    proc.status = 'TERMINATED';

    // Emit Windows Security Event 4689
    globalSimulationRuntime.dispatch({
      type: 'WINDOWS_PROCESS_TERMINATED',
      category: 'SYSTEM',
      source: this.machineId,
      severity: 'info',
      description: `Event 4689: A process has exited (${proc.name}, PID: ${proc.pid}, Exit Status: 0x${exitCode.toString(16)}).`,
      payload: {
        machineId: this.machineId,
        eventId: 4689,
        logName: 'Security',
        processId: `0x${proc.pid.toString(16)}`,
        processName: proc.executablePath,
        exitStatus: `0x${exitCode.toString(16)}`,
        subjectUserSid: proc.userSid,
        subjectUserName: proc.userName,
        virtualTime: vt,
      },
    });

    return true;
  }

  public terminateSessionProcesses(sessionId: number, vTime?: number): void {
    const list = Array.from(this.processes.values()).filter(
      (p) => p.sessionId === sessionId && p.status === 'RUNNING'
    );
    for (const p of list) {
      this.terminateProcess(p.pid, 0, vTime);
    }
  }

  public exportSnapshot(): Record<number, WindowsProcess> {
    const res: Record<number, WindowsProcess> = {};
    for (const [k, v] of this.processes.entries()) {
      res[k] = { ...v };
    }
    return res;
  }

  public restoreSnapshot(data: Record<number, WindowsProcess>): void {
    this.processes.clear();
    for (const [k, v] of Object.entries(data)) {
      this.processes.set(Number(k), { ...v });
    }
  }
}
