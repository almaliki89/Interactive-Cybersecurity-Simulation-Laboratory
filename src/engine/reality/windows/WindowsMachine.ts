/**
 * OMEGA REALITY ENGINE V1.1 — Windows Machine System Model
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
  RealityUserModel,
  RealityAccessToken,
} from '../types';
import { IntegrityLevel } from '../../../simulations/windows/logic/token';
import { WELL_KNOWN_SIDS } from '../../../simulations/windows/logic/identity';

export interface WindowsMachineConfig {
  id: string;
  hostname: string;
  domain?: string;
  ipAddress: string;
  isDomainJoined?: boolean;
}

export function parseUserPrincipal(input: string): { domain: string; username: string } {
  let domain = 'NEXORA';
  let username = input;

  if (input.includes('\\')) {
    const parts = input.split('\\');
    domain = parts[0];
    username = parts[1];
  } else if (input.includes('@')) {
    const parts = input.split('@');
    username = parts[0];
    const domPart = parts[1].split('.')[0].toUpperCase();
    domain = domPart;
  }
  return { domain: domain.toUpperCase(), username: username.toLowerCase() };
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
  private tokens: Map<string, RealityAccessToken> = new Map();
  private users: Map<string, RealityUserModel> = new Map();
  private lastUpdatedVirtualTime: number = 0;

  constructor(config: WindowsMachineConfig) {
    this.id = config.id;
    this.hostname = config.hostname;
    this.domain = config.domain || 'NEXORA.LOCAL';
    this.ipAddress = config.ipAddress;
    this.isDomainJoined = config.isDomainJoined ?? true;

    this.initDefaultUsers();
    this.initDefaultServices();
    this.initDefaultFilesystem();
  }

  /**
   * Initializes baseline users in memory
   */
  private initDefaultUsers(): void {
    this.users.clear();
    const defaultUsers: RealityUserModel[] = [
      {
        id: 'usr-sara.finance',
        username: 'sara.finance',
        domain: 'NEXORA',
        sid: 'S-1-5-21-99887766-2001',
        displayName: 'Sara Finance',
        enabled: true,
        passwordState: 'Valid',
        type: 'domain',
        primaryGroup: 'Domain Users',
        groupSids: ['S-1-5-21-99887766-513', 'S-1-5-21-99887766-101'],
        privileges: ['SeChangeNotifyPrivilege'],
        defaultIntegrityLevel: 'Medium',
      },
      {
        id: 'usr-omar.hr',
        username: 'omar.hr',
        domain: 'NEXORA',
        sid: 'S-1-5-21-99887766-2002',
        displayName: 'Omar HR',
        enabled: true,
        passwordState: 'Valid',
        type: 'domain',
        primaryGroup: 'Domain Users',
        groupSids: ['S-1-5-21-99887766-513', 'S-1-5-21-99887766-103'],
        privileges: ['SeChangeNotifyPrivilege'],
        defaultIntegrityLevel: 'Medium',
      },
      {
        id: 'usr-ali.it',
        username: 'ali.it',
        domain: 'NEXORA',
        sid: 'S-1-5-21-99887766-2003',
        displayName: 'Ali IT',
        enabled: true,
        passwordState: 'Valid',
        type: 'domain',
        primaryGroup: 'Domain Users',
        groupSids: ['S-1-5-21-99887766-513', 'S-1-5-21-99887766-105'],
        privileges: ['SeChangeNotifyPrivilege'],
        defaultIntegrityLevel: 'Medium',
      },
      {
        id: 'usr-administrator',
        username: 'administrator',
        domain: 'NEXORA',
        sid: 'S-1-5-21-99887766-500',
        displayName: 'Administrator',
        enabled: true,
        passwordState: 'Valid',
        type: 'domain',
        primaryGroup: 'Domain Admins',
        groupSids: ['S-1-5-21-99887766-512', 'S-1-5-32-544'],
        privileges: ['SeBackupPrivilege', 'SeRestorePrivilege', 'SeDebugPrivilege', 'SeChangeNotifyPrivilege'],
        defaultIntegrityLevel: 'High',
      },
      {
        id: 'usr-svc_backup',
        username: 'svc_backup',
        domain: 'NEXORA',
        sid: 'S-1-5-21-99887766-2004',
        displayName: 'Backup Service Account',
        enabled: true,
        passwordState: 'Valid',
        type: 'domain',
        primaryGroup: 'Domain Users',
        groupSids: ['S-1-5-21-99887766-513', 'S-1-5-32-551'],
        privileges: ['SeBackupPrivilege', 'SeRestorePrivilege', 'SeChangeNotifyPrivilege'],
        defaultIntegrityLevel: 'Medium',
      },
    ];

    defaultUsers.forEach((u) => this.users.set(u.sid, u));
  }

  /**
   * Initializes SYSTEM access token
   */
  private initSystemToken(): void {
    const sysToken: RealityAccessToken = {
      tokenId: 'tok-system',
      userSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
      username: 'NT AUTHORITY\\SYSTEM',
      groupSids: [WELL_KNOWN_SIDS.LOCAL_SYSTEM, WELL_KNOWN_SIDS.ADMINISTRATORS],
      privileges: ['SeBackupPrivilege', 'SeRestorePrivilege', 'SeDebugPrivilege', 'SeChangeNotifyPrivilege'],
      integrityLevel: 'System',
      elevated: true,
      sessionId: 0,
      issuedAtVirtualTime: 0,
    };
    this.tokens.set('tok-system', sysToken);
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
    this.initSystemToken();

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
        tokenId: 'tok-system',
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
        tokenId: 'tok-system',
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
        tokenId: 'tok-system',
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
        tokenId: 'tok-system',
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
        tokenId: 'tok-system',
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
        tokenId: 'tok-system',
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
    userName?: string;
    userSid?: string;
    integrityLevel?: IntegrityLevel;
    sessionId?: number;
    tokenId?: string;
    virtualTime: number;
  }): RealityProcessState {
    this.lastUpdatedVirtualTime = params.virtualTime;

    let resolvedTokenId = params.tokenId;
    let resolvedSessionId = params.sessionId;
    let resolvedUserSid = params.userSid;
    let resolvedUserName = params.userName;
    let resolvedIntegrity: IntegrityLevel = params.integrityLevel || 'Medium';

    if (resolvedTokenId) {
      const token = this.tokens.get(resolvedTokenId);
      if (!token) {
        throw new Error(`Token '${resolvedTokenId}' not found in WindowsMachine tokens`);
      }
      // Check identity mismatch
      if (resolvedUserSid && resolvedUserSid !== token.userSid) {
        throw new Error(`Identity mismatch: process userSid '${resolvedUserSid}' does not match token userSid '${token.userSid}'`);
      }
      if (resolvedUserName) {
        const parsedInput = parseUserPrincipal(resolvedUserName);
        const parsedToken = parseUserPrincipal(token.username);
        if (parsedInput.username !== parsedToken.username) {
          throw new Error(`Identity mismatch: process userName '${resolvedUserName}' does not match token username '${token.username}'`);
        }
      }
      resolvedSessionId = token.sessionId;
      resolvedUserSid = token.userSid;
      resolvedUserName = params.userName || token.username;
      resolvedIntegrity = token.integrityLevel as IntegrityLevel;
    } else if (params.userName || params.userSid) {
      // Find active session matching requested username or userSid
      let session: RealitySessionState | undefined;
      if (params.userName) {
        const parsedInput = parseUserPrincipal(params.userName);
        session = Array.from(this.sessions.values()).find(
          (s) => s.status === 'ACTIVE' && parseUserPrincipal(s.userName).username === parsedInput.username
        );
      }
      if (!session && params.userSid) {
        session = Array.from(this.sessions.values()).find(
          (s) => s.status === 'ACTIVE' && s.userSid === params.userSid
        );
      }

      if (session) {
        resolvedTokenId = session.tokenId;
        resolvedSessionId = session.sessionId;
        resolvedUserSid = session.userSid;
        resolvedUserName = params.userName || session.userName;
        const token = this.tokens.get(session.tokenId);
        if (token) {
          resolvedIntegrity = token.integrityLevel as IntegrityLevel;
        }
      } else {
        // Resolve from registered users database
        const lookupName = params.userName ? params.userName : '';
        const user = this.getUserByName(lookupName) || (params.userSid ? this.getUser(params.userSid) : undefined);
        if (user) {
          const generatedTokenId = `tok-gen-${user.username}-${params.virtualTime}`;
          if (!this.tokens.has(generatedTokenId)) {
            const elevated = user.defaultIntegrityLevel === 'High' || user.groupSids.includes('S-1-5-21-99887766-512') || user.groupSids.includes('S-1-5-32-544');
            const integrity = elevated ? 'High' : (user.defaultIntegrityLevel || 'Medium');
            const token: RealityAccessToken = {
              tokenId: generatedTokenId,
              userSid: user.sid,
              username: user.username,
              groupSids: [...user.groupSids],
              privileges: [...user.privileges],
              integrityLevel: integrity,
              elevated,
              sessionId: 1,
              issuedAtVirtualTime: params.virtualTime,
            };
            this.tokens.set(generatedTokenId, token);
          }
          resolvedTokenId = generatedTokenId;
          resolvedSessionId = 1;
          resolvedUserSid = user.sid;
          resolvedUserName = params.userName || user.username;
          resolvedIntegrity = user.defaultIntegrityLevel || 'Medium';
        } else {
          // Synthetic token on-the-fly
          const cleanName = params.userName ? parseUserPrincipal(params.userName).username : 'unknown';
          const cleanSid = params.userSid || `S-1-5-21-generated-${cleanName}`;
          const generatedTokenId = `tok-synth-${cleanName}-${params.virtualTime}`;
          if (!this.tokens.has(generatedTokenId)) {
            const token: RealityAccessToken = {
              tokenId: generatedTokenId,
              userSid: cleanSid,
              username: cleanName,
              groupSids: ['S-1-5-32-545'],
              privileges: ['SeChangeNotifyPrivilege'],
              integrityLevel: resolvedIntegrity,
              elevated: resolvedIntegrity === 'High' || resolvedIntegrity === 'System',
              sessionId: 1,
              issuedAtVirtualTime: params.virtualTime,
            };
            this.tokens.set(generatedTokenId, token);
          }
          resolvedTokenId = generatedTokenId;
          resolvedSessionId = 1;
          resolvedUserSid = cleanSid;
          resolvedUserName = params.userName || cleanName;
        }
      }
    } else {
      // Inherit from parent
      const parent = this.processes.get(params.parentPid);
      if (parent && parent.status === 'Running') {
        resolvedTokenId = parent.tokenId;
        resolvedSessionId = parent.sessionId;
        resolvedUserSid = parent.userSid;
        resolvedUserName = parent.userName;
        resolvedIntegrity = parent.integrityLevel;
      } else {
        // Fall back to local SYSTEM
        resolvedTokenId = 'tok-system';
        resolvedSessionId = 0;
        resolvedUserSid = WELL_KNOWN_SIDS.LOCAL_SYSTEM;
        resolvedUserName = 'NT AUTHORITY\\SYSTEM';
        resolvedIntegrity = 'System';
      }
    }

    if (!resolvedTokenId) {
      throw new Error(`Cannot spawn process: failed to resolve a security token for process '${params.name}'`);
    }

    // Allocate next deterministic PID
    const currentMax = Array.from(this.processes.keys()).reduce((max, pid) => Math.max(max, pid), 2000);
    const newPid = currentMax + 4;

    const parent = this.processes.get(params.parentPid) || this.processes.get(4) || {
      pid: 4,
      name: 'System',
    };

    const newProc: RealityProcessState = {
      pid: newPid,
      ppid: parent.pid,
      name: params.name,
      binaryPath: params.binaryPath || `C:\\Windows\\System32\\${params.name}`,
      commandLine: params.commandLine,
      userSid: resolvedUserSid || WELL_KNOWN_SIDS.LOCAL_SYSTEM,
      userName: resolvedUserName || 'NT AUTHORITY\\SYSTEM',
      integrityLevel: resolvedIntegrity,
      sessionId: resolvedSessionId ?? 1,
      cpuPercent: 0.1,
      memoryMb: 30,
      status: 'Running',
      securityCritical: false,
      startVirtualTime: params.virtualTime,
      tokenId: resolvedTokenId,
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
      user: newProc.userName,
      data: {
        newProcessId: newPid,
        newProcessName: newProc.binaryPath,
        parentProcessId: parent.pid,
        commandLine: params.commandLine,
        userSid: newProc.userSid,
        integrityLevel: newProc.integrityLevel,
        tokenId: resolvedTokenId,
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
   * Resolves user by username and/or domain case-insensitively
   */
  public getUserByName(usernameAndDomain: string): RealityUserModel | undefined {
    const parsed = parseUserPrincipal(usernameAndDomain);
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === parsed.username.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * Resolves user by SID
   */
  public getUser(sid: string): RealityUserModel | undefined {
    return this.users.get(sid);
  }

  /**
   * Register a user
   */
  public addUser(user: RealityUserModel): void {
    this.users.set(user.sid, user);
  }

  /**
   * Retrieve all users
   */
  public getUsers(): RealityUserModel[] {
    return Array.from(this.users.values());
  }

  /**
   * Retrieve all tokens
   */
  public getTokens(): RealityAccessToken[] {
    return Array.from(this.tokens.values());
  }

  /**
   * Retrieve token by ID
   */
  public getToken(tokenId: string): RealityAccessToken | undefined {
    return this.tokens.get(tokenId);
  }

  /**
   * Retrieve token for a specific session ID
   */
  public getTokenForSession(sessionId: number): RealityAccessToken | undefined {
    return Array.from(this.tokens.values()).find((t) => t.sessionId === sessionId);
  }

  /**
   * Creates an interactive or network logon session
   */
  public createSession(params: {
    userName: string;
    userSid?: string;
    logonType: SessionLogonType;
    authPackage?: 'Kerberos' | 'NTLM' | 'Negotiate' | 'Local';
    sourceIp?: string;
    virtualTime: number;
    success: boolean;
    failureReason?: string;
  }): RealitySessionState | null {
    this.lastUpdatedVirtualTime = params.virtualTime;

    // Resolve user from state
    const user = this.getUserByName(params.userName) || (params.userSid ? this.getUser(params.userSid) : undefined);

    let actualSuccess = params.success;
    let actualFailureReason = params.failureReason || 'BadPassword';

    if (actualSuccess) {
      if (!user) {
        actualSuccess = false;
        actualFailureReason = 'UserNotFound';
      } else if (!user.enabled) {
        actualSuccess = false;
        actualFailureReason = 'UserDisabled';
      }
    }

    if (!actualSuccess) {
      // Event 4625: Logon Failure
      const reportName = user ? user.username : params.userName;
      this.addEventLog({
        channel: 'Security',
        eventId: 4625,
        virtualTime: params.virtualTime,
        provider: 'Microsoft-Windows-Security-Auditing',
        level: 'Warning',
        task: 'Logon',
        computer: this.hostname,
        user: reportName,
        data: {
          targetUserName: reportName,
          targetDomainName: this.domain,
          logonType: params.logonType,
          workstationName: this.hostname,
          sourceNetworkAddress: params.sourceIp || '127.0.0.1',
          failureReason: actualFailureReason,
        },
      });
      return null;
    }

    // Since we verified actualSuccess is true, user is defined and enabled
    const resolvedUser = user!;
    const nextSessionId = this.sessions.size + 1;
    const tokenId = `tok-${resolvedUser.username}-${params.virtualTime}`;

    // Build the security token first!
    const elevated = resolvedUser.defaultIntegrityLevel === 'High' || resolvedUser.groupSids.includes('S-1-5-21-99887766-512') || resolvedUser.groupSids.includes('S-1-5-32-544');
    const integrity: IntegrityLevel = elevated ? 'High' : (resolvedUser.defaultIntegrityLevel || 'Medium');

    const token: RealityAccessToken = {
      tokenId,
      userSid: resolvedUser.sid,
      username: resolvedUser.username,
      groupSids: [...resolvedUser.groupSids],
      privileges: [...resolvedUser.privileges],
      integrityLevel: integrity,
      elevated,
      sessionId: nextSessionId,
      issuedAtVirtualTime: params.virtualTime,
    };

    // Save token to WindowsMachine tokens collection before session is active!
    this.tokens.set(tokenId, token);

    const newSession: RealitySessionState = {
      sessionId: nextSessionId,
      userName: resolvedUser.username,
      userSid: resolvedUser.sid,
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
      user: resolvedUser.username,
      data: {
        targetUserName: resolvedUser.username,
        targetDomainName: this.domain,
        targetLogonId: `0x${nextSessionId.toString(16)}`,
        logonType: params.logonType,
        workstationName: this.hostname,
        sourceNetworkAddress: params.sourceIp || '127.0.0.1',
        logonGuid: `{${this.id}-${nextSessionId}}`,
        tokenId,
      },
    });

    // Interactive logon spawns a user shell explorer.exe!
    if (params.logonType === 'Interactive' || params.logonType === 'RemoteInteractive') {
      this.spawnProcess({
        parentPid: 680, // wininit.exe / userinit-like parent
        name: 'explorer.exe',
        binaryPath: 'C:\\Windows\\explorer.exe',
        commandLine: 'C:\\Windows\\explorer.exe',
        userName: resolvedUser.username,
        userSid: resolvedUser.sid,
        sessionId: nextSessionId,
        tokenId,
        virtualTime: params.virtualTime,
      });
    }

    return newSession;
  }

  /**
   * Logoff a session, terminate all its processes, and emit Event 4634
   */
  public logoffSession(sessionId: number, virtualTime: number = this.lastUpdatedVirtualTime): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === 'LOGGED_OFF') return false;

    this.lastUpdatedVirtualTime = virtualTime;
    session.status = 'LOGGED_OFF';

    // Terminate all user processes associated with this sessionId
    this.processes.forEach((p) => {
      if (p.sessionId === sessionId && p.status === 'Running') {
        p.status = 'Terminated';
      }
    });

    // Event 4634: An account was logged off
    this.addEventLog({
      channel: 'Security',
      eventId: 4634,
      virtualTime,
      provider: 'Microsoft-Windows-Security-Auditing',
      level: 'Information',
      task: 'Logoff',
      computer: this.hostname,
      user: session.userName,
      data: {
        targetUserName: session.userName,
        targetDomainName: this.domain,
        targetLogonId: `0x${sessionId.toString(16)}`,
        logonType: session.logonType,
      },
    });

    return true;
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
      users: Array.from(this.users.values()).map((u) => ({ ...u })),
      tokens: Array.from(this.tokens.values()).map((t) => ({ ...t })),
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

    this.users.clear();
    if (snapshot.users) {
      snapshot.users.forEach((u) => this.users.set(u.sid, { ...u }));
    } else {
      this.initDefaultUsers();
    }

    this.tokens.clear();
    if (snapshot.tokens) {
      snapshot.tokens.forEach((t) => this.tokens.set(t.tokenId, { ...t }));
    } else {
      this.initSystemToken();
    }
  }
}
