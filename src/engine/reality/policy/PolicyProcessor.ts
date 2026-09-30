/**
 * OMEGA ULTRA REALITY V1.5 — Policy Processor Engine
 * Evaluates GPO security filtering, WMI filtering, precedence, enforced rules,
 * and produces unified effective Computer and User policy settings.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import {
  ComputerPolicySettings,
  UserPolicySettings,
  GpoEvaluationDetails,
  RsopResult,
  RsopSettingSource,
  GroupPolicyObject,
} from './types';
import { GpoStore, globalGpoStore } from './GpoStore';
import { GpoLinkResolver, globalGpoLinkResolver } from './GpoLinkResolver';
import { SecurityFilterEngine, globalSecurityFilterEngine, SecurityFilterContext } from './SecurityFilterEngine';
import { WmiFilterEngine, globalWmiFilterEngine, MachineWmiContext } from './WmiFilterEngine';

export interface MachinePolicyContext {
  machineId: string;
  hostname: string;
  domain: string;
  isDomainJoined: boolean;
  ouPath: string; // e.g. 'OU=Workstations,DC=NEXORA,DC=LOCAL'
  machineRole: 'WORKSTATION' | 'SERVER' | 'DOMAIN_CONTROLLER';
  computerSid: string; // e.g. 'S-1-5-21-99887766-515'
  computerGroupSids: string[];
}

export interface UserPolicyContext {
  userName: string;
  userSid: string;
  userOuPath: string; // e.g. 'OU=Finance,DC=NEXORA,DC=LOCAL'
  userGroupSids: string[];
}

export class PolicyProcessor {
  private gpoStore: GpoStore;
  private linkResolver: GpoLinkResolver;
  private securityFilter: SecurityFilterEngine;
  private wmiFilter: WmiFilterEngine;

  constructor(
    gpoStore: GpoStore = globalGpoStore,
    linkResolver: GpoLinkResolver = globalGpoLinkResolver,
    securityFilter: SecurityFilterEngine = globalSecurityFilterEngine,
    wmiFilter: WmiFilterEngine = globalWmiFilterEngine
  ) {
    this.gpoStore = gpoStore;
    this.linkResolver = linkResolver;
    this.securityFilter = securityFilter;
    this.wmiFilter = wmiFilter;
  }

  public processPolicy(
    machineCtx: MachinePolicyContext,
    userCtx?: UserPolicyContext,
    vTime = 0
  ): RsopResult {
    const appliedComputerGpos: GpoEvaluationDetails[] = [];
    const deniedComputerGpos: GpoEvaluationDetails[] = [];
    const appliedUserGpos: GpoEvaluationDetails[] = [];
    const deniedUserGpos: GpoEvaluationDetails[] = [];

    const effectiveComputerSettings: ComputerPolicySettings = {
      serviceStartup: {},
      registrySettings: [],
    };
    const effectiveUserSettings: UserPolicySettings = {
      mappedDrives: [],
      environmentVariables: {},
    };

    const settingSources: Record<string, RsopSettingSource> = {};

    // -------------------------------------------------------------
    // 1. COMPUTER POLICY PROCESSING
    // -------------------------------------------------------------
    const computerCandidates = this.linkResolver.resolveCandidateGpos(machineCtx.ouPath);

    const wmiCtx: MachineWmiContext = {
      machineId: machineCtx.machineId,
      hostname: machineCtx.hostname,
      domain: machineCtx.domain,
      isDomainJoined: machineCtx.isDomainJoined,
      machineRole: machineCtx.machineRole,
      osVersion: 'Windows 11 Enterprise',
      isServer: machineCtx.machineRole === 'SERVER' || machineCtx.machineRole === 'DOMAIN_CONTROLLER',
      isWorkstation: machineCtx.machineRole === 'WORKSTATION',
    };

    const compSecCtx: SecurityFilterContext = {
      targetSid: machineCtx.computerSid,
      targetName: `${machineCtx.hostname}$`,
      targetType: 'Computer',
      groupSids: machineCtx.computerGroupSids,
    };

    let computerPrecedence = 1;

    for (const { gpo, link, scope } of computerCandidates.orderedGpos) {
      if (!gpo.enabledComputer) {
        deniedComputerGpos.push({
          gpoId: gpo.id,
          gpoName: gpo.displayName,
          applied: false,
          scope: 'Computer',
          containerPath: scope.containerPath,
          enforced: link.enforced || gpo.enforced,
          filterResult: { eligible: true, reason: 'N/A' },
          wmiResult: { passed: true, reason: 'N/A' },
          denialReason: 'Computer configuration disabled on GPO.',
        });
        continue;
      }

      const secRes = this.securityFilter.evaluate(gpo.securityFilterSids, compSecCtx);
      const wmiRes = this.wmiFilter.evaluate(gpo.wmiFilterId, wmiCtx);

      const evaluation: GpoEvaluationDetails = {
        gpoId: gpo.id,
        gpoName: gpo.displayName,
        applied: secRes.eligible && wmiRes.passed,
        scope: 'Computer',
        containerPath: scope.containerPath,
        enforced: link.enforced || gpo.enforced,
        filterResult: secRes,
        wmiResult: wmiRes,
        denialReason: !secRes.eligible ? secRes.reason : !wmiRes.passed ? wmiRes.reason : undefined,
      };

      if (evaluation.applied) {
        appliedComputerGpos.push(evaluation);

        // Merge Computer Settings
        this.mergeComputerSettings(
          effectiveComputerSettings,
          gpo,
          scope.containerPath,
          link.enforced || gpo.enforced,
          computerPrecedence++,
          settingSources
        );
      } else {
        deniedComputerGpos.push(evaluation);
      }
    }

    // -------------------------------------------------------------
    // 2. USER POLICY PROCESSING
    // -------------------------------------------------------------
    if (userCtx) {
      const userContainerPath = userCtx.userOuPath || machineCtx.ouPath;
      const userCandidates = this.linkResolver.resolveCandidateGpos(userContainerPath);

      const userSecCtx: SecurityFilterContext = {
        targetSid: userCtx.userSid,
        targetName: userCtx.userName,
        targetType: 'User',
        groupSids: userCtx.userGroupSids,
      };

      let userPrecedence = 1;

      for (const { gpo, link, scope } of userCandidates.orderedGpos) {
        if (!gpo.enabledUser) {
          deniedUserGpos.push({
            gpoId: gpo.id,
            gpoName: gpo.displayName,
            applied: false,
            scope: 'User',
            containerPath: scope.containerPath,
            enforced: link.enforced || gpo.enforced,
            filterResult: { eligible: true, reason: 'N/A' },
            wmiResult: { passed: true, reason: 'N/A' },
            denialReason: 'User configuration disabled on GPO.',
          });
          continue;
        }

        const secRes = this.securityFilter.evaluate(gpo.securityFilterSids, userSecCtx);
        const wmiRes = this.wmiFilter.evaluate(gpo.wmiFilterId, wmiCtx);

        const evaluation: GpoEvaluationDetails = {
          gpoId: gpo.id,
          gpoName: gpo.displayName,
          applied: secRes.eligible && wmiRes.passed,
          scope: 'User',
          containerPath: scope.containerPath,
          enforced: link.enforced || gpo.enforced,
          filterResult: secRes,
          wmiResult: wmiRes,
          denialReason: !secRes.eligible ? secRes.reason : !wmiRes.passed ? wmiRes.reason : undefined,
        };

        if (evaluation.applied) {
          appliedUserGpos.push(evaluation);

          // Merge User Settings
          this.mergeUserSettings(
            effectiveUserSettings,
            gpo,
            scope.containerPath,
            link.enforced || gpo.enforced,
            userPrecedence++,
            settingSources
          );
        } else {
          deniedUserGpos.push(evaluation);
        }
      }
    }

    return {
      targetMachineId: machineCtx.machineId,
      targetUserSid: userCtx?.userSid,
      targetUserName: userCtx?.userName,
      lastRefreshVirtualTime: vTime,
      appliedComputerGpos,
      deniedComputerGpos,
      appliedUserGpos,
      deniedUserGpos,
      effectiveComputerSettings,
      effectiveUserSettings,
      settingSources,
      userGroups: userCtx?.userGroupSids,
    };
  }

  // --- Helper setting mergers enforcing Enforced rules & Precedence ---

  private shouldSettingOverride(
    existingSource: RsopSettingSource | undefined,
    isEnforced: boolean
  ): boolean {
    if (!existingSource) return true;
    // If existing setting source is enforced and new setting is NOT enforced, do not override!
    if (existingSource.enforced && !isEnforced) return false;
    return true;
  }

  private mergeComputerSettings(
    target: ComputerPolicySettings,
    gpo: GroupPolicyObject,
    containerPath: string,
    enforced: boolean,
    precedence: number,
    sources: Record<string, RsopSettingSource>
  ): void {
    const cs = gpo.computerSettings;
    if (!cs) return;

    // Password Policy
    if (cs.passwordPolicy) {
      if (this.shouldSettingOverride(sources['computer.passwordPolicy'], enforced)) {
        target.passwordPolicy = { ...target.passwordPolicy, ...cs.passwordPolicy };
        sources['computer.passwordPolicy'] = {
          key: 'computer.passwordPolicy',
          effectiveValue: target.passwordPolicy,
          winningGpoId: gpo.id,
          winningGpoName: gpo.displayName,
          precedence,
          containerPath,
          enforced,
          scope: 'Computer',
        };
      }
    }

    // Account Lockout
    if (cs.accountLockout) {
      if (this.shouldSettingOverride(sources['computer.accountLockout'], enforced)) {
        target.accountLockout = { ...target.accountLockout, ...cs.accountLockout };
        sources['computer.accountLockout'] = {
          key: 'computer.accountLockout',
          effectiveValue: target.accountLockout,
          winningGpoId: gpo.id,
          winningGpoName: gpo.displayName,
          precedence,
          containerPath,
          enforced,
          scope: 'Computer',
        };
      }
    }

    // Audit Policy
    if (cs.auditPolicy) {
      if (this.shouldSettingOverride(sources['computer.auditPolicy'], enforced)) {
        target.auditPolicy = { ...target.auditPolicy, ...cs.auditPolicy };
        sources['computer.auditPolicy'] = {
          key: 'computer.auditPolicy',
          effectiveValue: target.auditPolicy,
          winningGpoId: gpo.id,
          winningGpoName: gpo.displayName,
          precedence,
          containerPath,
          enforced,
          scope: 'Computer',
        };
      }
    }

    // Firewall Profile
    if (cs.firewallProfile) {
      if (this.shouldSettingOverride(sources['computer.firewallProfile'], enforced)) {
        target.firewallProfile = { ...target.firewallProfile, ...cs.firewallProfile };
        sources['computer.firewallProfile'] = {
          key: 'computer.firewallProfile',
          effectiveValue: target.firewallProfile,
          winningGpoId: gpo.id,
          winningGpoName: gpo.displayName,
          precedence,
          containerPath,
          enforced,
          scope: 'Computer',
        };
      }
    }

    // Service Startup
    if (cs.serviceStartup) {
      target.serviceStartup = target.serviceStartup || {};
      for (const [svcName, startupType] of Object.entries(cs.serviceStartup)) {
        const key = `computer.serviceStartup.${svcName}`;
        if (this.shouldSettingOverride(sources[key], enforced)) {
          target.serviceStartup[svcName] = startupType;
          sources[key] = {
            key,
            effectiveValue: startupType,
            winningGpoId: gpo.id,
            winningGpoName: gpo.displayName,
            precedence,
            containerPath,
            enforced,
            scope: 'Computer',
          };
        }
      }
    }

    // Registry Settings
    if (cs.registrySettings && cs.registrySettings.length > 0) {
      target.registrySettings = target.registrySettings || [];
      for (const regSetting of cs.registrySettings) {
        const key = `computer.registry.${regSetting.hive}\\${regSetting.key}\\${regSetting.valueName}`;
        if (this.shouldSettingOverride(sources[key], enforced)) {
          // Remove existing value for same key if present
          target.registrySettings = target.registrySettings.filter(
            (r) => !(r.hive === regSetting.hive && r.key === regSetting.key && r.valueName === regSetting.valueName)
          );
          target.registrySettings.push(regSetting);
          sources[key] = {
            key,
            effectiveValue: regSetting.value,
            winningGpoId: gpo.id,
            winningGpoName: gpo.displayName,
            precedence,
            containerPath,
            enforced,
            scope: 'Computer',
          };
        }
      }
    }

    // Desktop Restrictions (Computer)
    if (cs.desktopRestrictions) {
      if (cs.desktopRestrictions.screenLockTimeout !== undefined) {
        const key = 'computer.desktopRestrictions.screenLockTimeout';
        if (this.shouldSettingOverride(sources[key], enforced)) {
          target.desktopRestrictions = target.desktopRestrictions || {};
          target.desktopRestrictions.screenLockTimeout = cs.desktopRestrictions.screenLockTimeout;
          sources[key] = {
            key,
            effectiveValue: cs.desktopRestrictions.screenLockTimeout,
            winningGpoId: gpo.id,
            winningGpoName: gpo.displayName,
            precedence,
            containerPath,
            enforced,
            scope: 'Computer',
          };
        }
      }

      if (cs.desktopRestrictions.disableRemovableStorage !== undefined) {
        const key = 'computer.desktopRestrictions.disableRemovableStorage';
        if (this.shouldSettingOverride(sources[key], enforced)) {
          target.desktopRestrictions = target.desktopRestrictions || {};
          target.desktopRestrictions.disableRemovableStorage = cs.desktopRestrictions.disableRemovableStorage;
          sources[key] = {
            key,
            effectiveValue: cs.desktopRestrictions.disableRemovableStorage,
            winningGpoId: gpo.id,
            winningGpoName: gpo.displayName,
            precedence,
            containerPath,
            enforced,
            scope: 'Computer',
          };
        }
      }
    }
  }

  private mergeUserSettings(
    target: UserPolicySettings,
    gpo: GroupPolicyObject,
    containerPath: string,
    enforced: boolean,
    precedence: number,
    sources: Record<string, RsopSettingSource>
  ): void {
    const us = gpo.userSettings;
    if (!us) return;

    if (us.controlPanelAccess !== undefined) {
      const key = 'user.controlPanelAccess';
      if (this.shouldSettingOverride(sources[key], enforced)) {
        target.controlPanelAccess = us.controlPanelAccess;
        sources[key] = {
          key,
          effectiveValue: us.controlPanelAccess,
          winningGpoId: gpo.id,
          winningGpoName: gpo.displayName,
          precedence,
          containerPath,
          enforced,
          scope: 'User',
        };
      }
    }

    if (us.cmdAccess !== undefined) {
      const key = 'user.cmdAccess';
      if (this.shouldSettingOverride(sources[key], enforced)) {
        target.cmdAccess = us.cmdAccess;
        sources[key] = {
          key,
          effectiveValue: us.cmdAccess,
          winningGpoId: gpo.id,
          winningGpoName: gpo.displayName,
          precedence,
          containerPath,
          enforced,
          scope: 'User',
        };
      }
    }

    if (us.registryToolsAccess !== undefined) {
      const key = 'user.registryToolsAccess';
      if (this.shouldSettingOverride(sources[key], enforced)) {
        target.registryToolsAccess = us.registryToolsAccess;
        sources[key] = {
          key,
          effectiveValue: us.registryToolsAccess,
          winningGpoId: gpo.id,
          winningGpoName: gpo.displayName,
          precedence,
          containerPath,
          enforced,
          scope: 'User',
        };
      }
    }

    if (us.mappedDrives && us.mappedDrives.length > 0) {
      target.mappedDrives = target.mappedDrives || [];
      for (const drive of us.mappedDrives) {
        const key = `user.mappedDrives.${drive.driveLetter}`;
        if (this.shouldSettingOverride(sources[key], enforced)) {
          target.mappedDrives = target.mappedDrives.filter((d) => d.driveLetter !== drive.driveLetter);
          target.mappedDrives.push(drive);
          sources[key] = {
            key,
            effectiveValue: drive.remotePath,
            winningGpoId: gpo.id,
            winningGpoName: gpo.displayName,
            precedence,
            containerPath,
            enforced,
            scope: 'User',
          };
        }
      }
    }

    if (us.desktopRestrictions) {
      if (us.desktopRestrictions.screenLockTimeout !== undefined) {
        const key = 'user.desktopRestrictions.screenLockTimeout';
        if (this.shouldSettingOverride(sources[key], enforced)) {
          target.desktopRestrictions = target.desktopRestrictions || {};
          target.desktopRestrictions.screenLockTimeout = us.desktopRestrictions.screenLockTimeout;
          sources[key] = {
            key,
            effectiveValue: us.desktopRestrictions.screenLockTimeout,
            winningGpoId: gpo.id,
            winningGpoName: gpo.displayName,
            precedence,
            containerPath,
            enforced,
            scope: 'User',
          };
        }
      }
    }

    if (us.environmentVariables) {
      target.environmentVariables = target.environmentVariables || {};
      for (const [k, v] of Object.entries(us.environmentVariables)) {
        const key = `user.env.${k}`;
        if (this.shouldSettingOverride(sources[key], enforced)) {
          target.environmentVariables[k] = v;
          sources[key] = {
            key,
            effectiveValue: v,
            winningGpoId: gpo.id,
            winningGpoName: gpo.displayName,
            precedence,
            containerPath,
            enforced,
            scope: 'User',
          };
        }
      }
    }
  }
}

export const globalPolicyProcessor = new PolicyProcessor();
