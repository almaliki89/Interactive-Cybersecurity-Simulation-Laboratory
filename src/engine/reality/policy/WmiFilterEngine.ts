/**
 * OMEGA ULTRA REALITY V1.5 — WMI Filter Engine
 * Evaluates target machine characteristics deterministically without live execution.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { WmiFilterResult } from './types';

export interface MachineWmiContext {
  machineId: string;
  hostname: string;
  domain: string;
  isDomainJoined: boolean;
  machineRole: 'WORKSTATION' | 'SERVER' | 'DOMAIN_CONTROLLER';
  osVersion: string;
  isServer: boolean;
  isWorkstation: boolean;
}

export interface WmiFilterDefinition {
  id: string;
  name: string;
  description: string;
  evaluator: (ctx: MachineWmiContext) => WmiFilterResult;
}

export class WmiFilterEngine {
  private filters: Map<string, WmiFilterDefinition> = new Map();

  constructor() {
    this.initDefaultWmiFilters();
  }

  public initDefaultWmiFilters(): void {
    this.filters.clear();

    // 1. Workstations Only
    this.registerFilter({
      id: 'wmi-workstation-only',
      name: 'Workstations Only',
      description: 'Applies GPO only to client workstation machines.',
      evaluator: (ctx) => {
        const passed = ctx.machineRole === 'WORKSTATION' || ctx.isWorkstation;
        return {
          passed,
          reason: passed
            ? 'WMI Filter Passed: Machine role is WORKSTATION.'
            : `WMI Filter Denied: Machine role is ${ctx.machineRole} (expected WORKSTATION).`,
        };
      },
    });

    // 2. Member Servers Only
    this.registerFilter({
      id: 'wmi-server-only',
      name: 'Member Servers Only',
      description: 'Applies GPO only to member servers.',
      evaluator: (ctx) => {
        const passed = ctx.machineRole === 'SERVER' || (ctx.isServer && ctx.machineRole !== 'DOMAIN_CONTROLLER');
        return {
          passed,
          reason: passed
            ? 'WMI Filter Passed: Machine role is SERVER.'
            : `WMI Filter Denied: Machine role is ${ctx.machineRole} (expected SERVER).`,
        };
      },
    });

    // 3. Domain Controllers Only
    this.registerFilter({
      id: 'wmi-dc-only',
      name: 'Domain Controllers Only',
      description: 'Applies GPO only to Active Directory Domain Controllers.',
      evaluator: (ctx) => {
        const passed = ctx.machineRole === 'DOMAIN_CONTROLLER' || ctx.hostname.toUpperCase().includes('DC');
        return {
          passed,
          reason: passed
            ? 'WMI Filter Passed: Machine is a Domain Controller.'
            : `WMI Filter Denied: Machine ${ctx.hostname} is not a Domain Controller.`,
        };
      },
    });

    // 4. Domain Joined Only
    this.registerFilter({
      id: 'wmi-domain-joined',
      name: 'Domain Joined Machines Only',
      description: 'Applies GPO only if machine is domain joined.',
      evaluator: (ctx) => {
        return {
          passed: ctx.isDomainJoined,
          reason: ctx.isDomainJoined
            ? 'WMI Filter Passed: Machine is domain joined.'
            : 'WMI Filter Denied: Machine is not domain joined.',
        };
      },
    });
  }

  public registerFilter(filter: WmiFilterDefinition): void {
    this.filters.set(filter.id, filter);
  }

  public evaluate(filterId: string | undefined, ctx: MachineWmiContext): WmiFilterResult {
    if (!filterId) {
      return { passed: true, reason: 'No WMI Filter attached (Default Pass).' };
    }

    const filter = this.filters.get(filterId);
    if (!filter) {
      return { passed: true, reason: `WMI Filter '${filterId}' not found (Default Pass).` };
    }

    return filter.evaluator(ctx);
  }

  public getFilters(): WmiFilterDefinition[] {
    return Array.from(this.filters.values());
  }
}

export const globalWmiFilterEngine = new WmiFilterEngine();
