/**
 * OMEGA REALITY ENGINE V1.0 — Machine Registry
 * Stores and indexes all machines in the simulated enterprise environment.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { WindowsMachine, WindowsMachineConfig } from './windows/WindowsMachine';
import { RealityMachineSnapshot } from './types';

export class MachineRegistry {
  private machines: Map<string, WindowsMachine> = new Map();

  public registerMachine(machine: WindowsMachine): void {
    this.machines.set(machine.id.toLowerCase(), machine);
    this.machines.set(machine.hostname.toLowerCase(), machine);
  }

  public createWindowsMachine(config: WindowsMachineConfig): WindowsMachine {
    const machine = new WindowsMachine(config);
    this.registerMachine(machine);
    return machine;
  }

  public getMachine(idOrHostname: string): WindowsMachine | undefined {
    if (!idOrHostname) return undefined;
    return this.machines.get(idOrHostname.toLowerCase());
  }

  public getAllMachines(): WindowsMachine[] {
    const unique = new Set<WindowsMachine>(this.machines.values());
    return Array.from(unique);
  }

  public clear(): void {
    this.machines.clear();
  }

  public getStateSnapshot(): Record<string, RealityMachineSnapshot> {
    const snapshots: Record<string, RealityMachineSnapshot> = {};
    const uniqueMachines = new Set<WindowsMachine>(this.machines.values());
    uniqueMachines.forEach((m) => {
      snapshots[m.id] = m.getStateSnapshot();
    });
    return snapshots;
  }

  public restoreStateSnapshot(snapshots: Record<string, RealityMachineSnapshot>): void {
    Object.entries(snapshots).forEach(([id, snap]) => {
      let machine = this.getMachine(id);
      if (!machine) {
        machine = this.createWindowsMachine({
          id: snap.id,
          hostname: snap.hostname,
          domain: snap.domain,
          ipAddress: snap.ipAddress,
          isDomainJoined: snap.isDomainJoined,
        });
      }
      machine.restoreStateSnapshot(snap);
    });
  }
}
