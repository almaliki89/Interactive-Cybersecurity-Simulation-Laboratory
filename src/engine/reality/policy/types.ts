/**
 * OMEGA ULTRA REALITY V1.5 — Group Policy Architecture Types
 * Purely deterministic, simulated Group Policy Object (GPO) model.
 */

export interface GroupPolicyObject {
  id: string;
  guid: string;
  displayName: string;
  versionUser: number;
  versionComputer: number;
  enabledUser: boolean;
  enabledComputer: boolean;
  enforced: boolean;
  blockInheritanceAware: boolean;
  securityFilterSids: string[]; // SIDs/Group SIDs allowed to apply this GPO
  wmiFilterId?: string; // Optional WMI Filter ID
  userSettings: UserPolicySettings;
  computerSettings: ComputerPolicySettings;
  createdVirtualTime: number;
  modifiedVirtualTime: number;
}

export interface PasswordPolicy {
  minLength?: number;
  complexity?: boolean;
  historyCount?: number;
}

export interface AccountLockoutPolicy {
  threshold?: number; // Failed attempts before lockout
  durationMinutes?: number;
  resetMinutes?: number;
}

export interface AuditPolicy {
  logonEvents?: 'success_failure' | 'success' | 'failure' | 'none';
  processCreation?: 'enabled' | 'disabled';
  includeCmdLine?: boolean;
  objectAccess?: 'enabled' | 'disabled';
  directoryServiceAccess?: 'enabled' | 'disabled';
}

export interface FirewallProfilePolicy {
  enabled?: boolean;
  blockInboundSmb?: boolean;
  defaultInboundAction?: 'allow' | 'block';
}

export interface RegistryPolicySetting {
  hive: 'HKLM' | 'HKCU';
  key: string;
  valueName: string;
  value: string | number;
  type?: 'REG_DWORD' | 'REG_SZ' | 'REG_MULTI_SZ' | 'REG_EXPAND_SZ';
}

export interface DesktopRestrictionsPolicy {
  screenLockTimeout?: number; // seconds
  disableRemovableStorage?: boolean;
}

export interface ComputerPolicySettings {
  passwordPolicy?: PasswordPolicy;
  accountLockout?: AccountLockoutPolicy;
  auditPolicy?: AuditPolicy;
  firewallProfile?: FirewallProfilePolicy;
  serviceStartup?: Record<string, 'AUTO' | 'MANUAL' | 'DISABLED'>; // e.g. LanmanServer: 'DISABLED'
  registrySettings?: RegistryPolicySetting[];
  desktopRestrictions?: DesktopRestrictionsPolicy;
  windowsUpdateMode?: 'auto' | 'manual' | 'disabled';
}

export interface MappedDriveSetting {
  driveLetter: string; // e.g. 'F:'
  remotePath: string;  // e.g. '\\\\FILE01\\Finance'
  label?: string;
  persistent?: boolean;
}

export interface UserPolicySettings {
  controlPanelAccess?: 'enabled' | 'disabled';
  cmdAccess?: 'enabled' | 'disabled';
  registryToolsAccess?: 'enabled' | 'disabled';
  mappedDrives?: MappedDriveSetting[];
  desktopRestrictions?: DesktopRestrictionsPolicy;
  desktopWallpaper?: { path?: string; style?: string };
  startMenuRestrictions?: { hideRun?: boolean; hidePowerOptions?: boolean };
  explorerRestrictions?: { hideDrives?: boolean; preventFolderOptions?: boolean };
  environmentVariables?: Record<string, string>;
}

export interface GpoLink {
  id: string;
  containerPath: string; // 'DC=NEXORA,DC=LOCAL', 'OU=Workstations,DC=NEXORA,DC=LOCAL', etc.
  gpoId: string;
  linkOrder: number; // 1 is highest priority within container
  enabled: boolean;
  enforced: boolean; // No Override
}

export interface SecurityFilterResult {
  eligible: boolean;
  reason: string;
  matchedSid?: string;
}

export interface WmiFilterResult {
  passed: boolean;
  reason: string;
}

export interface GpoEvaluationDetails {
  gpoId: string;
  gpoName: string;
  applied: boolean;
  scope: 'Computer' | 'User';
  containerPath: string;
  enforced: boolean;
  filterResult: SecurityFilterResult;
  wmiResult: WmiFilterResult;
  denialReason?: string;
}

export interface RsopSettingSource {
  key: string;
  effectiveValue: any;
  winningGpoId: string;
  winningGpoName: string;
  precedence: number;
  containerPath: string;
  enforced: boolean;
  scope: 'Computer' | 'User';
  reason?: string;
}

export interface RsopResult {
  targetMachineId: string;
  targetUserSid?: string;
  targetUserName?: string;
  lastRefreshVirtualTime: number;
  appliedComputerGpos: GpoEvaluationDetails[];
  deniedComputerGpos: GpoEvaluationDetails[];
  appliedUserGpos: GpoEvaluationDetails[];
  deniedUserGpos: GpoEvaluationDetails[];
  effectiveComputerSettings: ComputerPolicySettings;
  effectiveUserSettings: UserPolicySettings;
  settingSources: Record<string, RsopSettingSource>;
  userGroups?: string[];
}

export interface GroupPolicySnapshot {
  gpos: Record<string, GroupPolicyObject>;
  links: GpoLink[];
  ouBlockInheritance: Record<string, boolean>; // ouPath -> blockInheritance
  lastRefreshTime: Record<string, number>; // machineId -> vTime
  appliedSettingsCache: Record<string, { computer: ComputerPolicySettings; user?: Record<string, UserPolicySettings> }>;
}
