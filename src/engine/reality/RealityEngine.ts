/**
 * OMEGA REALITY ENGINE V1.1 — Core Orchestrator
 * System-first state transitions and realistic cyber range execution.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { MachineRegistry } from './MachineRegistry';
import { WindowsMachine } from './windows/WindowsMachine';
import { RealityEngineSnapshot } from './types';
import { SimulationRuntime, globalSimulationRuntime } from '../runtime/SimulationRuntime';
import { globalNetworkEngine } from './network/NetworkEngine';
import { globalActiveDirectoryEngine } from './identity/ActiveDirectoryEngine';

export class RealityEngine {
  public readonly registry: MachineRegistry;
  private runtime: SimulationRuntime;
  private unsubscribeClock: (() => void) | null = null;
  private currentVirtualTime: number = 0;

  constructor(runtime: SimulationRuntime = globalSimulationRuntime) {
    this.registry = new MachineRegistry();
    this.runtime = runtime;

    this.initClockBinding();
    this.initEnterpriseEnvironment();
  }

  private initClockBinding(): void {
    this.unsubscribeClock = this.runtime.clock.subscribe((_deltaTimeMs, virtualTime) => {
      this.tick(virtualTime);
    });
  }

  /**
   * Initializes the NEXORA Enterprise Cyber Range baseline machines
   */
  public initEnterpriseEnvironment(): void {
    this.registry.clear();

    // Domain Controllers
    const dc01 = this.registry.createWindowsMachine({
      id: 'DC01',
      hostname: 'DC01',
      domain: 'NEXORA.LOCAL',
      ipAddress: '10.10.10.10',
      isDomainJoined: true,
    });

    // Enterprise File Server
    const file01 = this.registry.createWindowsMachine({
      id: 'FILE01',
      hostname: 'FILE01',
      domain: 'NEXORA.LOCAL',
      ipAddress: '10.10.20.10',
      isDomainJoined: true,
    });

    // Domain Workstations
    const finWs01 = this.registry.createWindowsMachine({
      id: 'FIN-WS01',
      hostname: 'FIN-WS01',
      domain: 'NEXORA.LOCAL',
      ipAddress: '10.10.30.15',
      isDomainJoined: true,
    });

    const hrWs01 = this.registry.createWindowsMachine({
      id: 'HR-WS01',
      hostname: 'HR-WS01',
      domain: 'NEXORA.LOCAL',
      ipAddress: '10.10.30.20',
      isDomainJoined: true,
    });

    const itWs01 = this.registry.createWindowsMachine({
      id: 'IT-WS01',
      hostname: 'IT-WS01',
      domain: 'NEXORA.LOCAL',
      ipAddress: '10.10.30.25',
      isDomainJoined: true,
    });

    // Boot baseline machines at virtualTime 0
    [dc01, file01, finWs01, hrWs01, itWs01].forEach((m) => m.boot(0));
  }

  /**
   * Deterministic clock tick callback
   */
  public tick(virtualTime: number): void {
    this.currentVirtualTime = virtualTime;
  }

  /**
   * Performs an authentic user logon attempt on a target machine.
   * State transition occurs FIRST, and telemetry is emitted as a CONSEQUENCE.
   */
  public attemptLogon(params: {
    targetHost: string;
    userName: string;
    userSid?: string;
    passwordCorrect: boolean;
    logonType?: 'Interactive' | 'Network' | 'RemoteInteractive';
    sourceIp?: string;
  }): { success: boolean; machine: WindowsMachine; session: any } {
    const machine = this.registry.getMachine(params.targetHost);
    if (!machine) {
      throw new Error(`Target machine '${params.targetHost}' not found in Reality Engine registry`);
    }

    const vTime = this.currentVirtualTime;

    let success = params.passwordCorrect;
    let failureReason = 'BadPassword';
    let userSid = params.userSid;

    // Check if machine is domain joined or user is domain user
    const hasDc = this.registry.getMachine('DC01') !== undefined;
    const isExplicitDomainUser = params.userName.includes('@') || params.userName.includes('\\');

    let session = null;
    if (isExplicitDomainUser || (machine.isDomainJoined && hasDc)) {
      const adResult = globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: params.targetHost,
        userName: params.userName,
        passwordProvided: params.passwordCorrect,
        vTime,
        registry: this.registry,
      });

      success = adResult.success;
      if (!success) {
        failureReason = adResult.failureReason === 'BAD_PASSWORD' ? 'BadPassword' : 'UserDisabled';
      } else {
        userSid = adResult.userSid;
      }

      // Retrieve the session created by performDomainLogon
      const sessions = machine.getSessions();
      if (sessions.length > 0) {
        session = sessions[sessions.length - 1];
      }
    } else {
      // Fallback for local non-domain users
      const user = machine.getUserByName(params.userName) || (params.userSid ? machine.getUser(params.userSid) : undefined);
      if (success) {
        if (!user) {
          success = false;
          failureReason = 'UserNotFound';
        } else if (!user.enabled) {
          success = false;
          failureReason = 'UserDisabled';
        } else {
          userSid = user.sid;
        }
      }

      session = machine.createSession({
        userName: params.userName,
        userSid,
        logonType: params.logonType || 'Interactive',
        sourceIp: params.sourceIp || '127.0.0.1',
        virtualTime: vTime,
        success,
        failureReason,
      });
    }

    const cleanUser = params.userName.split('\\').pop() || params.userName;
    const reportName = cleanUser.split('@')[0];

    if (success && session) {
      this.runtime.dispatch({
        type: 'WIN_4624',
        category: 'WINDOWS',
        source: machine.hostname,
        target: reportName,
        severity: 'info',
        description: `Successful logon on ${machine.hostname} for user ${reportName}`,
        payload: {
          eventId: '4624',
          user: reportName,
          host: machine.hostname,
          sourceIp: params.sourceIp || '127.0.0.1',
          logonType: params.logonType || 'Interactive',
          sessionId: session.sessionId,
          tokenId: session.tokenId,
        },
      });
    } else {
      this.runtime.dispatch({
        type: 'WIN_4625',
        category: 'WINDOWS',
        source: machine.hostname,
        target: reportName,
        severity: 'warn',
        description: `Failed logon attempt on ${machine.hostname} for user ${reportName}`,
        payload: {
          eventId: '4625',
          user: reportName,
          host: machine.hostname,
          sourceIp: params.sourceIp || '127.0.0.1',
          logonType: params.logonType || 'Interactive',
          failureReason,
        },
      });
    }

    return {
      success,
      machine,
      session,
    };
  }

  /**
   * Spawns a process on a machine after validating system constraints.
   * State transition occurs FIRST, emitting event 4688 as a consequence.
   */
  public executeProcess(params: {
    host: string;
    parentPid: number;
    name: string;
    commandLine: string;
    userName?: string;
    userSid?: string;
    integrityLevel?: 'Low' | 'Medium' | 'High' | 'System';
    tokenId?: string;
  }): { process: any; machine: WindowsMachine } {
    const machine = this.registry.getMachine(params.host);
    if (!machine) {
      throw new Error(`Host '${params.host}' not found in Reality Engine`);
    }

    const vTime = this.currentVirtualTime;

    const proc = machine.spawnProcess({
      parentPid: params.parentPid,
      name: params.name,
      commandLine: params.commandLine,
      userName: params.userName,
      userSid: params.userSid,
      integrityLevel: params.integrityLevel,
      tokenId: params.tokenId,
      virtualTime: vTime,
    });

    // Emit consequence telemetry
    this.runtime.dispatch({
      type: 'WIN_4688',
      category: 'WINDOWS',
      source: machine.hostname,
      target: params.name,
      severity: params.commandLine.includes('-enc') || params.commandLine.includes('bypass') ? 'threat' : 'info',
      description: `Process created: ${params.name} (PID: ${proc.pid})`,
      payload: {
        eventId: '4688',
        user: proc.userName,
        host: machine.hostname,
        process: params.name,
        pid: proc.pid,
        parentPid: params.parentPid,
        commandLine: params.commandLine,
        tokenId: proc.tokenId,
      },
    });

    return { process: proc, machine };
  }

  /**
   * Performs an authentic logoff session on a target machine.
   */
  public logoffSession(targetHost: string, sessionId: number): boolean {
    const machine = this.registry.getMachine(targetHost);
    if (!machine) return false;

    const vTime = this.currentVirtualTime;
    const session = machine.getSessions().find((s) => s.sessionId === sessionId);
    if (!session || session.status === 'LOGGED_OFF') return false;

    const username = session.userName;
    const success = machine.logoffSession(sessionId, vTime);

    if (success) {
      this.runtime.dispatch({
        type: 'WIN_4634',
        category: 'WINDOWS',
        source: machine.hostname,
        target: username,
        severity: 'info',
        description: `Successful logoff on ${machine.hostname} for user ${username}`,
        payload: {
          eventId: '4634',
          user: username,
          host: machine.hostname,
          sessionId,
        },
      });
    }

    return success;
  }

  // --- SNAPSHOT & REPLAY DETERMINISM ---

  public getStateSnapshot(): RealityEngineSnapshot {
    return {
      virtualTime: this.currentVirtualTime,
      machines: this.registry.getStateSnapshot(),
      network: globalNetworkEngine.snapshot(),
      identity: globalActiveDirectoryEngine.getStateSnapshot(),
    };
  }

  public restoreStateSnapshot(snapshot: RealityEngineSnapshot): void {
    this.currentVirtualTime = snapshot.virtualTime;
    this.registry.restoreStateSnapshot(snapshot.machines);
    if (snapshot.network) {
      globalNetworkEngine.restore(snapshot.network);
    }
    if (snapshot.identity) {
      globalActiveDirectoryEngine.restoreStateSnapshot(snapshot.identity);
    }
  }

  public destroy(): void {
    if (this.unsubscribeClock) {
      this.unsubscribeClock();
    }
  }
}

// Global Reality Engine singleton instance
export const globalRealityEngine = new RealityEngine();
