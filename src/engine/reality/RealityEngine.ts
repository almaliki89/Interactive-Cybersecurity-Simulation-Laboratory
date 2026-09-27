/**
 * OMEGA REALITY ENGINE V1.0 — Core Orchestrator
 * System-first state transitions and realistic cyber range execution.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { MachineRegistry } from './MachineRegistry';
import { WindowsMachine } from './windows/WindowsMachine';
import { RealityEngineSnapshot } from './types';
import { SimulationRuntime, globalSimulationRuntime } from '../runtime/SimulationRuntime';

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
    userSid: string;
    passwordCorrect: boolean;
    logonType?: 'Interactive' | 'Network' | 'RemoteInteractive';
    sourceIp?: string;
  }): { success: boolean; machine: WindowsMachine; session: any } {
    const machine = this.registry.getMachine(params.targetHost);
    if (!machine) {
      throw new Error(`Target machine '${params.targetHost}' not found in Reality Engine registry`);
    }

    const vTime = this.currentVirtualTime;

    // Execute state transition on machine
    const session = machine.createSession({
      userName: params.userName,
      userSid: params.userSid,
      logonType: params.logonType || 'Interactive',
      sourceIp: params.sourceIp || '127.0.0.1',
      virtualTime: vTime,
      success: params.passwordCorrect,
      failureReason: params.passwordCorrect ? undefined : 'BadPassword',
    });

    // Emit runtime event as CONSEQUENCE of machine state transition
    if (params.passwordCorrect) {
      this.runtime.dispatch({
        type: 'WIN_4624',
        category: 'WINDOWS',
        source: machine.hostname,
        target: params.userName,
        severity: 'info',
        description: `Successful logon on ${machine.hostname} for user ${params.userName}`,
        payload: {
          eventId: '4624',
          user: params.userName,
          host: machine.hostname,
          sourceIp: params.sourceIp || '127.0.0.1',
          logonType: params.logonType || 'Interactive',
        },
      });
    } else {
      this.runtime.dispatch({
        type: 'WIN_4625',
        category: 'WINDOWS',
        source: machine.hostname,
        target: params.userName,
        severity: 'warn',
        description: `Failed logon attempt on ${machine.hostname} for user ${params.userName}`,
        payload: {
          eventId: '4625',
          user: params.userName,
          host: machine.hostname,
          sourceIp: params.sourceIp || '127.0.0.1',
          failureReason: 'BadPassword',
        },
      });
    }

    return {
      success: params.passwordCorrect,
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
    userName: string;
    userSid: string;
    integrityLevel?: 'Medium' | 'High' | 'System';
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
      integrityLevel: params.integrityLevel || 'Medium',
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
        user: params.userName,
        host: machine.hostname,
        process: params.name,
        pid: proc.pid,
        parentPid: params.parentPid,
        commandLine: params.commandLine,
      },
    });

    return { process: proc, machine };
  }

  // --- SNAPSHOTS & REPLAY DETERMINISM ---

  public getStateSnapshot(): RealityEngineSnapshot {
    return {
      virtualTime: this.currentVirtualTime,
      machines: this.registry.getStateSnapshot(),
    };
  }

  public restoreStateSnapshot(snapshot: RealityEngineSnapshot): void {
    this.currentVirtualTime = snapshot.virtualTime;
    this.registry.restoreStateSnapshot(snapshot.machines);
  }

  public destroy(): void {
    if (this.unsubscribeClock) {
      this.unsubscribeClock();
    }
  }
}

// Global Reality Engine singleton instance
export const globalRealityEngine = new RealityEngine();
