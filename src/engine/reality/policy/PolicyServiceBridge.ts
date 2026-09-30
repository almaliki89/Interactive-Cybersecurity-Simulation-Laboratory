/**
 * OMEGA ULTRA REALITY V1.5 — Policy Service Bridge
 * Configures service startup types and operational states directly in WindowsServiceManager.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { ComputerPolicySettings } from './types';
import type { WindowsMachine } from '../windows/WindowsMachine';

export class PolicyServiceBridge {
  public applyServicePolicies(
    machine: WindowsMachine,
    compSettings: ComputerPolicySettings,
    vTime = 0
  ): void {
    if (!compSettings.serviceStartup) return;

    const svcManager = machine.desktop.services;

    for (const [serviceName, startupType] of Object.entries(compSettings.serviceStartup)) {
      const svc = svcManager.getService(serviceName);
      if (!svc) continue;

      // Update startup type
      if (svc.startupType !== startupType) {
        svcManager.setStartupType(serviceName, startupType, vTime);
      }

      // Consequence: If DISABLED and currently RUNNING, stop service!
      if (startupType === 'DISABLED' && svc.status === 'RUNNING') {
        svcManager.stopService(serviceName, vTime);
      } else if ((startupType === 'AUTO') && svc.status === 'STOPPED') {
        // If configured as AUTO and previously stopped by policy, restart if dependencies permit
        svcManager.startService(serviceName, vTime);
      }
    }
  }
}

export const globalPolicyServiceBridge = new PolicyServiceBridge();
