/**
 * OMEGA ULTRA REALITY V1.5 — Policy Audit Engine
 * Manages effective audit policy state per machine and controls telemetry emission (Event IDs 4688, 4663, 4624, etc.).
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { AuditPolicy, ComputerPolicySettings } from './types';

export class PolicyAuditEngine {
  private activeAuditPolicies: Map<string, AuditPolicy> = new Map();

  public applyAuditPolicy(machineId: string, settings: ComputerPolicySettings): void {
    if (!settings.auditPolicy) return;
    const current = this.activeAuditPolicies.get(machineId) || {};
    this.activeAuditPolicies.set(machineId, {
      ...current,
      ...settings.auditPolicy,
    });
  }

  public getAuditPolicy(machineId: string): AuditPolicy {
    return (
      this.activeAuditPolicies.get(machineId) || {
        logonEvents: 'success_failure',
        processCreation: 'enabled',
        includeCmdLine: true,
        objectAccess: 'enabled',
        directoryServiceAccess: 'enabled',
      }
    );
  }

  public isProcessCreationAuditingEnabled(machineId: string): boolean {
    const policy = this.getAuditPolicy(machineId);
    return policy.processCreation !== 'disabled';
  }

  public isCmdLineLoggingEnabled(machineId: string): boolean {
    const policy = this.getAuditPolicy(machineId);
    return policy.includeCmdLine ?? true;
  }

  public isLogonAuditingEnabled(machineId: string): boolean {
    const policy = this.getAuditPolicy(machineId);
    return policy.logonEvents !== 'none';
  }

  public isObjectAccessAuditingEnabled(machineId: string): boolean {
    const policy = this.getAuditPolicy(machineId);
    return policy.objectAccess !== 'disabled';
  }

  public exportSnapshot(): Record<string, AuditPolicy> {
    const res: Record<string, AuditPolicy> = {};
    for (const [k, v] of this.activeAuditPolicies.entries()) {
      res[k] = { ...v };
    }
    return res;
  }

  public restoreSnapshot(snap: Record<string, AuditPolicy>): void {
    this.activeAuditPolicies.clear();
    for (const [k, v] of Object.entries(snap || {})) {
      this.activeAuditPolicies.set(k, { ...v });
    }
  }
}

export const globalPolicyAuditEngine = new PolicyAuditEngine();
