/**
 * OMEGA ULTRA REALITY V1.5 — Policy Registry Bridge
 * Writes effective Group Policy registry settings directly into WindowsRegistryEngine.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { ComputerPolicySettings, UserPolicySettings } from './types';
import type { WindowsMachine } from '../windows/WindowsMachine';

export class PolicyRegistryBridge {
  public applyRegistryPolicies(
    machine: WindowsMachine,
    compSettings: ComputerPolicySettings,
    userSettings?: UserPolicySettings
  ): void {
    const reg = machine.desktop.registry;

    // 1. Password Policy Registry
    if (compSettings.passwordPolicy) {
      if (compSettings.passwordPolicy.minLength !== undefined) {
        reg.setValue('HKLM', 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', 'MinPwdLen', 'REG_DWORD', compSettings.passwordPolicy.minLength);
      }
      if (compSettings.passwordPolicy.complexity !== undefined) {
        reg.setValue('HKLM', 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', 'PasswordComplexity', 'REG_DWORD', compSettings.passwordPolicy.complexity ? 1 : 0);
      }
    }

    // 2. Account Lockout Registry
    if (compSettings.accountLockout) {
      if (compSettings.accountLockout.threshold !== undefined) {
        reg.setValue('HKLM', 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', 'LockoutBadCount', 'REG_DWORD', compSettings.accountLockout.threshold);
      }
    }

    // 3. Desktop Restrictions / Screen Lock
    if (compSettings.desktopRestrictions?.screenLockTimeout !== undefined) {
      reg.setValue('HKLM', 'SOFTWARE\\Policies\\Microsoft\\Windows\\Control Panel\\Desktop', 'ScreenSaveTimeOut', 'REG_SZ', compSettings.desktopRestrictions.screenLockTimeout.toString());
    }

    // 4. Custom Registry Settings
    if (compSettings.registrySettings) {
      for (const setting of compSettings.registrySettings) {
        reg.setValue(setting.hive, setting.key, setting.valueName, setting.type || 'REG_DWORD', setting.value);
      }
    }

    // 5. User Restrictions
    if (userSettings) {
      if (userSettings.controlPanelAccess !== undefined) {
        const disabled = userSettings.controlPanelAccess === 'disabled' ? 1 : 0;
        reg.setValue('HKCU', 'Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer', 'NoControlPanel', 'REG_DWORD', disabled);
      }

      if (userSettings.cmdAccess !== undefined) {
        const disabled = userSettings.cmdAccess === 'disabled' ? 2 : 0; // 2 = Disable CMD and script execution
        reg.setValue('HKCU', 'Software\\Policies\\Microsoft\\Windows\\System', 'DisableCMD', 'REG_DWORD', disabled);
      }

      if (userSettings.registryToolsAccess !== undefined) {
        const disabled = userSettings.registryToolsAccess === 'disabled' ? 1 : 0;
        reg.setValue('HKCU', 'Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', 'DisableRegistryTools', 'REG_DWORD', disabled);
      }

      if (userSettings.desktopRestrictions?.screenLockTimeout !== undefined) {
        reg.setValue('HKCU', 'Control Panel\\Desktop', 'ScreenSaveTimeOut', 'REG_SZ', userSettings.desktopRestrictions.screenLockTimeout.toString());
      }
    }
  }
}

export const globalPolicyRegistryBridge = new PolicyRegistryBridge();
