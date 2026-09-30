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

    // 4. Removable storage and Windows Update policy
    if (compSettings.desktopRestrictions?.disableRemovableStorage !== undefined) {
      reg.setValue(
        'HKLM',
        'SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices',
        'Deny_All',
        'REG_DWORD',
        compSettings.desktopRestrictions.disableRemovableStorage ? 1 : 0
      );
    }

    if (compSettings.windowsUpdateMode !== undefined) {
      const noAutoUpdate = compSettings.windowsUpdateMode === 'disabled' ? 1 : 0;
      const auOptions = compSettings.windowsUpdateMode === 'auto' ? 4 : 2;
      reg.setValue('HKLM', 'SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU', 'NoAutoUpdate', 'REG_DWORD', noAutoUpdate);
      reg.setValue('HKLM', 'SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU', 'AUOptions', 'REG_DWORD', auOptions);
    }

    // 5. Custom Registry Settings
    if (compSettings.registrySettings) {
      for (const setting of compSettings.registrySettings) {
        reg.setValue(setting.hive, setting.key, setting.valueName, setting.type || 'REG_DWORD', setting.value);
      }
    }

    // 6. User Restrictions
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

      if (userSettings.desktopWallpaper?.path !== undefined) {
        reg.setValue('HKCU', 'Control Panel\\Desktop', 'Wallpaper', 'REG_SZ', userSettings.desktopWallpaper.path || '');
      }
      if (userSettings.desktopWallpaper?.style !== undefined) {
        reg.setValue('HKCU', 'Control Panel\\Desktop', 'WallpaperStyle', 'REG_SZ', userSettings.desktopWallpaper.style || '');
      }

      if (userSettings.startMenuRestrictions?.hideRun !== undefined) {
        reg.setValue(
          'HKCU',
          'Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
          'NoRun',
          'REG_DWORD',
          userSettings.startMenuRestrictions.hideRun ? 1 : 0
        );
      }
      if (userSettings.startMenuRestrictions?.hidePowerOptions !== undefined) {
        reg.setValue(
          'HKCU',
          'Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
          'NoClose',
          'REG_DWORD',
          userSettings.startMenuRestrictions.hidePowerOptions ? 1 : 0
        );
      }

      if (userSettings.explorerRestrictions?.hideDrives !== undefined) {
        reg.setValue(
          'HKCU',
          'Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
          'NoDrives',
          'REG_DWORD',
          userSettings.explorerRestrictions.hideDrives ? 1 : 0
        );
      }
      if (userSettings.explorerRestrictions?.preventFolderOptions !== undefined) {
        reg.setValue(
          'HKCU',
          'Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
          'NoFolderOptions',
          'REG_DWORD',
          userSettings.explorerRestrictions.preventFolderOptions ? 1 : 0
        );
      }

      if (userSettings.environmentVariables) {
        for (const [name, value] of Object.entries(userSettings.environmentVariables)) {
          reg.setValue('HKCU', 'Environment', name, 'REG_SZ', value);
        }
      }
    }
  }
}

export const globalPolicyRegistryBridge = new PolicyRegistryBridge();
