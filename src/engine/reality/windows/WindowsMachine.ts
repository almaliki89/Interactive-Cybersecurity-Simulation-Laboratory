/**
 * OMEGA REALITY ENGINE V1.0 — Windows Machine System Model
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import {
  RealityMachineSnapshot,
  RealityProcessState,
  RealitySessionState,
  RealityServiceState,
  RealityFileState,
  RealityEventLogEntry,
  RealitySocketState,
  MachineStatus,
  SessionLogonType,
} from '../types';
import {
  WindowsProcess,
  canProcessAccessTarget,
} from '../../../simulations/windows/logic/processes';
import {
  buildAccessToken,
  WindowsAccessToken,
  IntegrityLevel,
} from '../../../simulations/windows/logic/token';
import { WELL_KNOWN_SIDS } from '../../../simulations/windows/logic/identity';

export interface WindowsMachineConfig {
  id: string;
  hostname: string;
  domain?: string;
  ipAddress: string;
  isDomainJoined?: boolean;
}

export class WindowsMachine {
  public readonly id: string;
  public hostname: string;
  public domain: string;
  public ipAddress: string;
  public isDomainJoined: boolean;
  public status: MachineStatus = 'OFFLINE';

  private processes: Map<number, RealityProcessState> = new Map();
  private sessions: Map<number, RealitySessionState> = new Map();
  private services: Map<string, RealityServiceState> = new Map();
  private files: Map<string, RealityFileState> = new Map();
  private registry: Map<string, any> = new Map();
  private sockets: Map<string, RealitySocketState> = new Map();
  private eventLogs: RealityEventLogEntry[] = [];
  private tokens: Map<string, WindowsAccessToken> = new Map();
  private lastUpdatedVirtualTime: number = 0;

  constructor(config: WindowsMachineConfig) {
    this.id = config.id;
    this.hostname = config.hostname;
    this.domain = config.domain || 'NEXORA.LOCAL';
    this.ipAddress = config.ipAddress;
    this.isDomainJoined = config.isDomainJoined ?? true;

    this.initDefaultServices();
    this.initDefaultFilesystem();
  }

  /**
   * Boots the machine state, creating core Windows kernel and system process tree
   */
  public boot(virtualTime: number = 0): void {
    if (this.status === 'ONLINE') return;

    this.status = 'ONLINE';
    this.lastUpdatedVirtualTime = virtualTime;

    // Reset process tree on boot
    this.processes.clear();

    const systemProcesses: Omit<RealityProcessState, 'startVirtualTime'>[] = [
      {
        pid: 4,
        ppid: 0,
        name: 'System',
        binaryPath: 'ntoskrnl.exe',
        commandLine: 'ntoskrnl.exe',
        userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
        userName: 'NT AUTHORITY\\SYSTEM',
        integrityLevel: 'System',
        sessionId: 0,
        cpuPercent: 1.0,
        memoryMb: 80,
        status: 'Running',
        securityCritical: true,
      },
      {
        pid: 492,
        ppid: 4,
        name: 'smss.exe',
        binaryPath: 'C:\\Windows\\System32\\smss.exe',
        commandLine: '\\SystemRoot\\System32\\smss.exe',
        userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
        userName: 'NT AUTHORITY\\SYSTEM',
        integrityLevel: 'System',
        sessionId: 0,
        cpuPercent: 0.1,
        memoryMb: 12,
        status: 'Running',
        securityCritical: true,
      },
      {
        pid: 680,
        ppid: 492,
        name: 'wininit.exe',
        binaryPath: 'C:\\Windows\\System32\\wininit.exe',
        commandLine: 'wininit.exe',
        userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
        userName: 'NT AUTHORITY\\SYSTEM',
        integrityLevel: 'System',
        sessionId: 0,
        cpuPercent: 0.2,
        memoryMb: 18,
        status: 'Running',
        securityCritical: true,
      },
      {
        pid: 740,
        ppid: 680,
        name: 'services.exe',
        binaryPath: 'C:\\Windows\\System32\\services.exe',
        commandLine: 'C:\\Windows\\system32\\services.exe',
        userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
        userName: 'NT AUTHORITY\\SYSTEM',
        integrityLevel: 'System',
        sessionId: 0,
        cpuPercent: 0.5,
        memoryMb: 45,
        status: 'Running',
        securityCritical: true,
      },
      {
        pid: 752,
        ppid: 680,
        name: 'lsass.exe',
        binaryPath: 'C:\\Windows\\System32\\lsass.exe',
        commandLine: 'C:\\Windows\\system32\\lsass.exe',
        userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
        userName: 'NT AUTHORITY\\SYSTEM',
        integrityLevel: 'System',
        sessionId: 0,
        cpuPercent: 1.0,
        memoryMb: 65,
        status: 'Running',
        securityCritical: true,
      },
      {
        pid: 1024,
        ppid: 740,
        name: 'svchost.exe',
        binaryPath: 'C:\\Windows\\System32\\svchost.exe',
        commandLine: 'C:\\Windows\\system32\\svchost.exe -k netsvcs -p -s DnsCache',
        userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
        userName: 'NT AUTHORITY\\SYSTEM',
        integrityLevel: 'System',
        sessionId: 0,
        cpuPercent: 1.2,
        memoryMb: 90,
        status: 'Running',
        securityCritical: false,
      },
    ];

    systemProcesses.forEach((p) => {
      this.processes.set(p.pid, { ...p, startVirtualTime: virtualTime });
    });

    this.addEventLog({
      channel: 'System',
      eventId: 6005,
      virtualTime,
      provider: 'EventLog',
      level: 'Information',
      task: 'Boot',
      computer: this.hostname,
      user: 'NT AUTHORITY\\SYSTEM',
      data: { message: `The Event log service was started on ${this.hostname}.` },
    });
  }

  /**
   * Spawns a new process in the machine state table
   */
  public spawnProcess(params: {
    parentPid: number;
    name: string;
    binaryPath?: string;
    commandLine: string;
    userName: string;
    userSid: string;
    integrityLevel: IntegrityLevel;
    sessionId?: number;
    virtualTime: number;
  }): RealityProcessState {
    this.lastUpdatedVirtualTime = params.virtualTime;

    const parent = this.processes.get(params.parentPid) || this.processes.get(4) || {
      pid: 4,
      name: 'System',
    };

    // Allocate next deterministic PID
    const currentMax = Array.from(this.processes.keys()).reduce((max, pid) => Math.max(max, pid), 2000);
    const newPid = currentMax + 4;

    const newProc: RealityProcessState = {
      pid: newPid,
      ppid: parent.pid,
      name: params.name,
      binaryPath: params.binaryPath || `C:\\Windows\\System32\\${params.name}`,
      commandLine: params.commandLine,
      userSid: params.userSid,
      userName: params.userName,
      integrityLevel: params.integrityLevel,
      sessionId: params.sessionId ?? 1,
      cpuPercent: 0.1,
      memoryMb: 30,
      status: 'Running',
      securityCritical: false,
      startVirtualTime: params.virtualTime,
    };

    this.processes.set(newPid, newProc);

    // Event 4688: Process Creation
    this.addEventLog({
      channel: 'Security',
      eventId: 4688,
      virtualTime: params.virtualTime,
      provider: 'Microsoft-Windows-Security-Auditing',
      level: 'Information',
      task: 'Process Creation',
      computer: this.hostname,
      user: params.userName,
      data: {
        newProcessId: newPid,
        newProcessName: newProc.binaryPath,
        parentProcessId: parent.pid,
        commandLine: params.commandLine,
        userSid: params.userSid,
        integrityLevel: params.integrityLevel,
      },
    });

    return newProc;
  }

  /**
   * Terminates a process in state
   */
  public terminateProcess(pid: number, virtualTime: number): boolean {
    const proc = this.processes.get(pid);
    if (!proc || proc.status === 'Terminated') return false;

    this.lastUpdatedVirtualTime = virtualTime;
    proc.status = 'Terminated';
    this.processes.set(pid, proc);

    return true;
  }

  /**
   * Creates an interactive or network logon session
   */
  public createSession(params: {
    userName: string;
    userSid: string;
    logonType: SessionLogonType;
    authPackage?: 'Kerberos' | 'NTLM' | 'Negotiate' | 'Local';
    sourceIp?: string;
    virtualTime: number;
    success: boolean;
    failureReason?: string;
  }): RealitySessionState | null {
    this.lastUpdatedVirtualTime = params.virtualTime;

    if (!params.success) {
      // Event 4625: Logon Failure
      this.addEventLog({
        channel: 'Security',
        eventId: 4625,
        virtualTime: params.virtualTime,
        provider: 'Microsoft-Windows-Security-Auditing',
        level: 'Warning',
        task: 'Logon',
        computer: this.hostname,
        user: params.userName,
        data: {
          targetUserName: params.userName,
          targetDomainName: this.domain,
          logonType: params.logonType,
          workstationName: this.hostname,
          sourceNetworkAddress: params.sourceIp || '127.0.0.1',
          failureReason: params.failureReason || 'BadPassword',
        },
      });
      return null;
    }

    const nextSessionId = this.sessions.size + 1;
    const tokenId = `tok-${params.userName}-${params.virtualTime}`;

    const newSession: RealitySessionState = {
      sessionId: nextSessionId,
      userName: params.userName,
      userSid: params.userSid,
      logonType: params.logonType,
      authPackage: params.authPackage || 'Kerberos',
      startVirtualTime: params.virtualTime,
      tokenId,
      sourceIp: params.sourceIp,
      status: 'ACTIVE',
    };

    this.sessions.set(nextSessionId, newSession);

    // Event 4624: Logon Success
    this.addEventLog({
      channel: 'Security',
      eventId: 4624,
      virtualTime: params.virtualTime,
      provider: 'Microsoft-Windows-Security-Auditing',
      level: 'Information',
      task: 'Logon',
      computer: this.hostname,
      user: params.userName,
      data: {
        targetUserName: params.userName,
        targetDomainName: this.domain,
        targetLogonId: `0x${nextSessionId.toString(16)}`,
        logonType: params.logonType,
        workstationName: this.hostname,
        sourceNetworkAddress: params.sourceIp || '127.0.0.1',
        logonGuid: `{${this.id}-${nextSessionId}}`,
      },
    });

    return newSession;
  }

  /**
   * Adds an event log entry directly to the machine's Security/System/Application channel
   */
  public addEventLog(log: Omit<RealityEventLogEntry, 'id'> & { id?: string }): RealityEventLogEntry {
    const entry: RealityEventLogEntry = {
      id: log.id || `evt-${this.id}-${log.eventId}-${log.virtualTime}-${this.eventLogs.length + 1}`,
      ...log,
    };
    this.eventLogs.push(entry);
    return entry;
  }

  // --- GETTERS & INSPECTORS ---

  public getProcesses(): RealityProcessState[] {
    return Array.from(this.processes.values());
  }

  public getRunningProcesses(): RealityProcessState[] {
    return Array.from(this.processes.values()).filter((p) => p.status === 'Running');
  }

  public getProcess(pid: number): RealityProcessState | undefined {
    return this.processes.get(pid);
  }

  public getSessions(): RealitySessionState[] {
    return Array.from(this.sessions.values());
  }

  public getActiveSessions(): RealitySessionState[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'ACTIVE');
  }

  public getServices(): RealityServiceState[] {
    return Array.from(this.services.values());
  }

  public getFiles(): RealityFileState[] {
    return Array.from(this.files.values());
  }

  public getEventLogs(): RealityEventLogEntry[] {
    return [...this.eventLogs];
  }

  public getSockets(): RealitySocketState[] {
    return Array.from(this.sockets.values());
  }

  // --- INITIALIZERS ---

  private initDefaultServices(): void {
    const defaults: RealityServiceState[] = [
      {
        name: 'DnsCache',
        displayName: 'DNS Client',
        binaryPath: 'C:\\Windows\\System32\\svchost.exe -k netsvcs -p -s DnsCache',
        account: 'NT AUTHORITY\\NetworkService',
        startupType: 'Automatic',
        status: 'Running',
        pid: 1024,
      },
      {
        name: 'EventLog',
        displayName: 'Windows Event Log',
        binaryPath: 'C:\\Windows\\System32\\svchost.exe -k LocalServiceNetworkRestricted -p -s EventLog',
        account: 'NT AUTHORITY\\LocalService',
        startupType: 'Automatic',
        status: 'Running',
        pid: 1024,
      },
      {
        name: 'LanmanServer',
        displayName: 'Server (SMB)',
        binaryPath: 'C:\\Windows\\System32\\svchost.exe -k netsvcs -p -s LanmanServer',
        account: 'NT AUTHORITY\\LocalSystem',
        startupType: 'Automatic',
        status: 'Running',
        pid: 1024,
      },
      {
        name: 'Spooler',
        displayName: 'Print Spooler',
        binaryPath: 'C:\\Windows\\System32\\spoolsv.exe',
        account: 'NT AUTHORITY\\LocalSystem',
        startupType: 'Automatic',
        status: 'Running',
      },
    ];

    defaults.forEach((s) => this.services.set(s.name, s));
  }

  private initDefaultFilesystem(): void {
    const defaultFiles: RealityFileState[] = [
      {
        path: 'C:\\Windows\\System32\\drivers\\etc\\hosts',
        sizeBytes: 824,
        ownerSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
        contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        content: `127.0.0.1 localhost\n::1 localhost\n10.10.10.10 dc01.nexora.local\n10.10.10.11 dc02.nexora.local`,
        createdVirtualTime: 0,
        modifiedVirtualTime: 0,
        sensitivity: 'INTERNAL',
      },
      {
        path: 'C:\\Finance\\Q3_Ledger.xlsx',
        sizeBytes: 452100,
        ownerSid: 'S-1-5-21-2001',
        contentHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        content: '[ENCRYPTED_FINANCIAL_SHEET_DATA]',
        createdVirtualTime: 0,
        modifiedVirtualTime: 0,
        sensitivity: 'RESTRICTED',
      },
    ];

    defaultFiles.forEach((f) => this.files.set(f.path, f));
  }

  // --- SNAPSHOT & REPLAY ---

  public getStateSnapshot(): RealityMachineSnapshot {
    return {
      id: this.id,
      hostname: this.hostname,
      domain: this.domain,
      ipAddress: this.ipAddress,
      status: this.status,
      isDomainJoined: this.isDomainJoined,
      processes: Array.from(this.processes.values()).map((p) => ({ ...p })),
      sessions: Array.from(this.sessions.values()).map((s) => ({ ...s })),
      services: Array.from(this.services.values()).map((s) => ({ ...s })),
      files: Array.from(this.files.values()).map((f) => ({ ...f })),
      registry: Object.fromEntries(this.registry.entries()),
      sockets: Array.from(this.sockets.values()).map((s) => ({ ...s })),
      eventLogs: this.eventLogs.map((e) => ({ ...e, data: { ...e.data } })),
      lastUpdatedVirtualTime: this.lastUpdatedVirtualTime,
    };
  }

  public restoreStateSnapshot(snapshot: RealityMachineSnapshot): void {
    this.hostname = snapshot.hostname;
    this.domain = snapshot.domain;
    this.ipAddress = snapshot.ipAddress;
    this.status = snapshot.status;
    this.isDomainJoined = snapshot.isDomainJoined;
    this.lastUpdatedVirtualTime = snapshot.lastUpdatedVirtualTime;

    this.processes.clear();
    snapshot.processes.forEach((p) => this.processes.set(p.pid, { ...p }));

    this.sessions.clear();
    snapshot.sessions.forEach((s) => this.sessions.set(s.sessionId, { ...s }));

    this.services.clear();
    snapshot.services.forEach((s) => this.services.set(s.name, { ...s }));

    this.files.clear();
    snapshot.files.forEach((f) => this.files.set(f.path, { ...f }));

    this.registry = new Map(Object.entries(snapshot.registry || {}));

    this.sockets.clear();
    snapshot.sockets.forEach((s) => this.sockets.set(s.id, { ...s }));

    this.eventLogs = snapshot.eventLogs.map((e) => ({ ...e, data: { ...e.data } }));
  }
}
