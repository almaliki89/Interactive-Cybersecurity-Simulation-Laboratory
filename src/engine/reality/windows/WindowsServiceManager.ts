/**
 * OMEGA ULTRA REALITY V1.4 — Windows Service Manager
 * Stateful Windows Services controller managing service states, startup types, dependencies,
 * and operational consequences across simulated workstations and servers.
 * Emits Windows Event Logs 7036 / 7040 and telemetry.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { WindowsService, ServiceStatus, ServiceStartupType } from './types';
import { globalSimulationRuntime } from '../../runtime/SimulationRuntime';

export class WindowsServiceManager {
  private machineId: string;
  private services: Map<string, WindowsService> = new Map();

  constructor(machineId: string) {
    this.machineId = machineId;
    this.initDefaultServices();
  }

  public initDefaultServices(): void {
    this.services.clear();

    const isDC = this.machineId.toUpperCase().includes('DC');
    const isFileServer = this.machineId.toUpperCase().includes('FILE');

    // Baseline Core Windows Services
    this.registerService({
      name: 'EventLog',
      displayName: 'Windows Event Log',
      status: 'RUNNING',
      startupType: 'AUTO',
      serviceAccount: 'LocalSystem',
      pid: 680,
      dependencies: [],
      description: 'Manages events and event logs. It supports logging events, querying events, subscribing to events, archiving event logs, and managing event metadata.',
      binaryPath: 'C:\\Windows\\System32\\svchost.exe -k LocalServiceNetworkRestricted',
      canPause: false,
      lastStateChangeVirtualTime: 0,
    });

    this.registerService({
      name: 'RpcSs',
      displayName: 'Remote Procedure Call (RPC)',
      status: 'RUNNING',
      startupType: 'AUTO',
      serviceAccount: 'NT AUTHORITY\\NetworkService',
      pid: 712,
      dependencies: [],
      description: 'The RPCSS service is the Service Control Manager for COM and DCOM servers. It performs object activations requests, object exporter resolutions and distributed garbage collection for COM and DCOM servers.',
      binaryPath: 'C:\\Windows\\system32\\svchost.exe -k RPCSS',
      canPause: false,
      lastStateChangeVirtualTime: 0,
    });

    this.registerService({
      name: 'Dnscache',
      displayName: 'DNS Client',
      status: 'RUNNING',
      startupType: 'AUTO',
      serviceAccount: 'NT AUTHORITY\\NetworkService',
      pid: 820,
      dependencies: ['RpcSs'],
      description: 'The DNS Client service (dnscache) caches Domain Name System (DNS) names and registers the full computer name for this computer.',
      binaryPath: 'C:\\Windows\\system32\\svchost.exe -k NetworkService',
      canPause: false,
      lastStateChangeVirtualTime: 0,
    });

    this.registerService({
      name: 'LanmanWorkstation',
      displayName: 'Workstation',
      status: 'RUNNING',
      startupType: 'AUTO',
      serviceAccount: 'NT AUTHORITY\\NetworkService',
      pid: 890,
      dependencies: ['RpcSs'],
      description: 'Creates and maintains client network connections to remote servers using the SMB protocol. If this service is stopped, these connections will be unavailable.',
      binaryPath: 'C:\\Windows\\System32\\svchost.exe -k NetworkService',
      canPause: true,
      lastStateChangeVirtualTime: 0,
    });

    this.registerService({
      name: 'LanmanServer',
      displayName: 'Server',
      status: 'RUNNING',
      startupType: 'AUTO',
      serviceAccount: 'LocalSystem',
      pid: 920,
      dependencies: ['RpcSs'],
      description: 'Supports file, print, and named-pipe sharing over the network for this computer. If this service is stopped, these functions will be unavailable.',
      binaryPath: 'C:\\Windows\\system32\\svchost.exe -k netsvcs',
      canPause: true,
      lastStateChangeVirtualTime: 0,
    });

    this.registerService({
      name: 'Winmgmt',
      displayName: 'Windows Management Instrumentation',
      status: 'RUNNING',
      startupType: 'AUTO',
      serviceAccount: 'LocalSystem',
      pid: 1040,
      dependencies: ['RpcSs'],
      description: 'Provides a common interface and object model to access management information about operating system, devices, applications and services.',
      binaryPath: 'C:\\Windows\\system32\\svchost.exe -k netsvcs',
      canPause: true,
      lastStateChangeVirtualTime: 0,
    });

    this.registerService({
      name: 'Spooler',
      displayName: 'Print Spooler',
      status: 'RUNNING',
      startupType: 'AUTO',
      serviceAccount: 'LocalSystem',
      pid: 1110,
      dependencies: ['RpcSs'],
      description: 'The service spools print jobs and handles interaction with the printer. If you turn off this service, you will not be able to print or see your printers.',
      binaryPath: 'C:\\Windows\\System32\\spoolsv.exe',
      canPause: true,
      lastStateChangeVirtualTime: 0,
    });

    this.registerService({
      name: 'Schedule',
      displayName: 'Task Scheduler',
      status: 'RUNNING',
      startupType: 'AUTO',
      serviceAccount: 'LocalSystem',
      pid: 1150,
      dependencies: ['RpcSs'],
      description: 'Enables a user to configure and schedule automated tasks on this computer. The service also hosts multiple Windows system-critical tasks.',
      binaryPath: 'C:\\Windows\\system32\\svchost.exe -k netsvcs',
      canPause: false,
      lastStateChangeVirtualTime: 0,
    });

    this.registerService({
      name: 'W32Time',
      displayName: 'Windows Time',
      status: 'RUNNING',
      startupType: 'AUTO',
      serviceAccount: 'NT AUTHORITY\\LocalService',
      pid: 1200,
      dependencies: [],
      description: 'Maintains date and time synchronization on all clients and servers in the network. If this service is stopped, date and time synchronization will be unavailable.',
      binaryPath: 'C:\\Windows\\system32\\svchost.exe -k LocalService',
      canPause: false,
      lastStateChangeVirtualTime: 0,
    });

    // Domain Controller Specific Services
    if (isDC) {
      this.registerService({
        name: 'NTDS',
        displayName: 'Active Directory Domain Services',
        status: 'RUNNING',
        startupType: 'AUTO',
        serviceAccount: 'LocalSystem',
        pid: 1300,
        dependencies: ['RpcSs'],
        description: 'Provides directory services for identity management and domain authentication across the enterprise.',
        binaryPath: 'C:\\Windows\\System32\\ntds.dll',
        canPause: false,
        lastStateChangeVirtualTime: 0,
      });

      this.registerService({
        name: 'KDC',
        displayName: 'Kerberos Key Distribution Center',
        status: 'RUNNING',
        startupType: 'AUTO',
        serviceAccount: 'LocalSystem',
        pid: 1350,
        dependencies: ['NTDS', 'RpcSs'],
        description: 'Enables users to log on to the network using the Kerberos v5 authentication protocol and issues TGT and TGS tickets.',
        binaryPath: 'C:\\Windows\\System32\\kdcsvc.dll',
        canPause: false,
        lastStateChangeVirtualTime: 0,
      });

      this.registerService({
        name: 'DNS',
        displayName: 'DNS Server',
        status: 'RUNNING',
        startupType: 'AUTO',
        serviceAccount: 'LocalSystem',
        pid: 1400,
        dependencies: ['RpcSs'],
        description: 'Provides DNS name resolution for Active Directory domain members and infrastructure.',
        binaryPath: 'C:\\Windows\\System32\\dns.exe',
        canPause: false,
        lastStateChangeVirtualTime: 0,
      });

      this.registerService({
        name: 'Netlogon',
        displayName: 'Netlogon',
        status: 'RUNNING',
        startupType: 'AUTO',
        serviceAccount: 'LocalSystem',
        pid: 1450,
        dependencies: ['LanmanWorkstation'],
        description: 'Maintains a secure channel between this computer and the domain controller for authenticating users and services.',
        binaryPath: 'C:\\Windows\\system32\\lsass.exe',
        canPause: false,
        lastStateChangeVirtualTime: 0,
      });
    }
  }

  public registerService(service: WindowsService): void {
    this.services.set(service.name, { ...service });
  }

  public getService(name: string): WindowsService | undefined {
    const exact = this.services.get(name);
    if (exact) return exact;
    const lower = name.toLowerCase();
    for (const [k, v] of this.services.entries()) {
      if (k.toLowerCase() === lower) return v;
    }
    return undefined;
  }

  public getAllServices(): WindowsService[] {
    return Array.from(this.services.values()).map((s) => ({ ...s }));
  }

  public isServiceRunning(name: string): boolean {
    const s = this.getService(name);
    return s?.status === 'RUNNING';
  }

  /**
   * Starts a service, checking dependencies.
   */
  public startService(name: string, vTime?: number): { success: boolean; error?: string } {
    const s = this.getService(name);
    if (!s) {
      return { success: false, error: `Service '${name}' does not exist on machine '${this.machineId}'.` };
    }
    if (s.status === 'RUNNING') {
      return { success: true };
    }
    if (s.startupType === 'DISABLED') {
      return { success: false, error: `Cannot start service '${name}' because it is DISABLED.` };
    }

    // Check dependencies
    for (const dep of s.dependencies) {
      const depS = this.getService(dep);
      if (!depS || depS.status !== 'RUNNING') {
        return {
          success: false,
          error: `Dependency service '${dep}' is not running (status: ${depS?.status || 'UNKNOWN'}).`,
        };
      }
    }

    const vt = vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    s.status = 'RUNNING';
    s.lastStateChangeVirtualTime = vt;
    if (!s.pid) {
      s.pid = 1500 + Math.abs(name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 8000);
    }

    // Emit System Event Log 7036 to Runtime & Machine
    globalSimulationRuntime.dispatch({
      type: 'WINDOWS_SERVICE_STATE_CHANGED',
      category: 'SYSTEM',
      source: this.machineId,
      severity: 'info',
      description: `Event 7036: The ${s.displayName} service entered the RUNNING state.`,
      payload: {
        machineId: this.machineId,
        eventId: 7036,
        logName: 'System',
        serviceName: s.name,
        displayName: s.displayName,
        status: 'RUNNING',
        virtualTime: vt,
      },
    });

    try {
      const regMachine = (globalThis as any).globalRealityEngine?.registry?.getMachine?.(this.machineId);
      if (regMachine) {
        regMachine.addEventLog({
          channel: 'System',
          eventId: 7036,
          virtualTime: vt,
          provider: 'Service Control Manager',
          level: 'Information',
          task: 'Service State Change',
          computer: regMachine.hostname,
          user: 'NT AUTHORITY\\SYSTEM',
          data: {
            serviceName: s.name,
            displayName: s.displayName,
            status: 'RUNNING',
            virtualTime: vt,
          },
        });
      }
    } catch (_) {}

    return { success: true };
  }

  /**
   * Stops a service.
   */
  public stopService(name: string, vTime?: number): { success: boolean; error?: string } {
    const s = this.getService(name);
    if (!s) {
      return { success: false, error: `Service '${name}' does not exist on machine '${this.machineId}'.` };
    }
    if (s.status === 'STOPPED') {
      return { success: true };
    }

    const vt = vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    s.status = 'STOPPED';
    s.lastStateChangeVirtualTime = vt;
    s.pid = null;

    // Emit System Event Log 7036 to Runtime & Machine
    globalSimulationRuntime.dispatch({
      type: 'WINDOWS_SERVICE_STATE_CHANGED',
      category: 'SYSTEM',
      source: this.machineId,
      severity: 'warn',
      description: `Event 7036: The ${s.displayName} service entered the STOPPED state.`,
      payload: {
        machineId: this.machineId,
        eventId: 7036,
        logName: 'System',
        serviceName: s.name,
        displayName: s.displayName,
        status: 'STOPPED',
        virtualTime: vt,
      },
    });

    try {
      const regMachine = (globalThis as any).globalRealityEngine?.registry?.getMachine?.(this.machineId);
      if (regMachine) {
        regMachine.addEventLog({
          channel: 'System',
          eventId: 7036,
          virtualTime: vt,
          provider: 'Service Control Manager',
          level: 'Warning',
          task: 'Service State Change',
          computer: regMachine.hostname,
          user: 'NT AUTHORITY\\SYSTEM',
          data: {
            serviceName: s.name,
            displayName: s.displayName,
            status: 'STOPPED',
            virtualTime: vt,
          },
        });
      }
    } catch (_) {}

    return { success: true };
  }

  /**
   * Restarts a service.
   */
  public restartService(name: string, vTime?: number): { success: boolean; error?: string } {
    const stopRes = this.stopService(name, vTime);
    if (!stopRes.success) return stopRes;
    return this.startService(name, (vTime ?? globalSimulationRuntime.clock.getVirtualTime()) + 1);
  }

  /**
   * Sets the startup type for a service.
   */
  public setStartupType(name: string, startupType: ServiceStartupType, vTime?: number): { success: boolean; error?: string } {
    const s = this.getService(name);
    if (!s) {
      return { success: false, error: `Service '${name}' not found.` };
    }

    const vt = vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    const oldType = s.startupType;
    s.startupType = startupType;

    // Emit System Event Log 7040
    globalSimulationRuntime.dispatch({
      type: 'WINDOWS_SERVICE_CONFIG_CHANGED',
      category: 'SYSTEM',
      source: this.machineId,
      severity: 'info',
      description: `Event 7040: The start type of the ${s.displayName} service was changed from ${oldType} to ${startupType}.`,
      payload: {
        machineId: this.machineId,
        eventId: 7040,
        logName: 'System',
        serviceName: s.name,
        displayName: s.displayName,
        oldStartupType: oldType,
        newStartupType: startupType,
        virtualTime: vt,
      },
    });

    try {
      const regMachine = (globalThis as any).globalRealityEngine?.registry?.getMachine?.(this.machineId);
      if (regMachine) {
        regMachine.addEventLog({
          channel: 'System',
          eventId: 7040,
          virtualTime: vt,
          provider: 'Service Control Manager',
          level: 'Information',
          task: 'Service Config Change',
          computer: regMachine.hostname,
          user: 'NT AUTHORITY\\SYSTEM',
          data: {
            serviceName: s.name,
            displayName: s.displayName,
            oldStartupType: oldType,
            newStartupType: startupType,
            virtualTime: vt,
          },
        });
      }
    } catch (_) {}

    return { success: true };
  }

  public exportSnapshot(): Record<string, WindowsService> {
    const res: Record<string, WindowsService> = {};
    for (const [k, v] of this.services.entries()) {
      res[k] = { ...v, dependencies: [...v.dependencies] };
    }
    return res;
  }

  public restoreSnapshot(data: Record<string, WindowsService>): void {
    this.services.clear();
    for (const [k, v] of Object.entries(data)) {
      this.services.set(k, { ...v, dependencies: [...v.dependencies] });
    }
  }
}
