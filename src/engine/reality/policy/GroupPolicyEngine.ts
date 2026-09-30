/**
 * OMEGA ULTRA REALITY V1.5 — Main Group Policy Engine Orchestrator
 * Connects Active Directory, LSDOU Links, Security/WMI Filters, Registry, Services, Firewalls, Mapped Drives, and Event Logging.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { GpoStore, globalGpoStore } from './GpoStore';
import { GpoLinkResolver, globalGpoLinkResolver } from './GpoLinkResolver';
import { PolicyProcessor, globalPolicyProcessor, MachinePolicyContext, UserPolicyContext } from './PolicyProcessor';
import { PolicyRegistryBridge, globalPolicyRegistryBridge } from './PolicyRegistryBridge';
import { PolicyServiceBridge, globalPolicyServiceBridge } from './PolicyServiceBridge';
import { PolicyAuditEngine, globalPolicyAuditEngine } from './PolicyAuditEngine';
import { RsopEngine, globalRsopEngine } from './RsopEngine';
import { RsopResult, GroupPolicySnapshot } from './types';
import type { WindowsMachine } from '../windows/WindowsMachine';
import { globalNetworkEngine } from '../network/NetworkEngine';
import { globalSimulationRuntime } from '../../runtime/SimulationRuntime';
import { WELL_KNOWN_AD_SIDS } from '../identity/DirectoryStore';
import { globalActiveDirectoryEngine } from '../identity/ActiveDirectoryEngine';

export class GroupPolicyEngine {
  public readonly store: GpoStore;
  public readonly linkResolver: GpoLinkResolver;
  public readonly processor: PolicyProcessor;
  public readonly registryBridge: PolicyRegistryBridge;
  public readonly serviceBridge: PolicyServiceBridge;
  public readonly auditEngine: PolicyAuditEngine;
  public readonly rsopEngine: RsopEngine;

  private lastRsopCache: Map<string, RsopResult> = new Map();

  constructor(
    store: GpoStore = globalGpoStore,
    linkResolver: GpoLinkResolver = globalGpoLinkResolver,
    processor: PolicyProcessor = globalPolicyProcessor,
    registryBridge: PolicyRegistryBridge = globalPolicyRegistryBridge,
    serviceBridge: PolicyServiceBridge = globalPolicyServiceBridge,
    auditEngine: PolicyAuditEngine = globalPolicyAuditEngine,
    rsopEngine: RsopEngine = globalRsopEngine
  ) {
    this.store = store;
    this.linkResolver = linkResolver;
    this.processor = processor;
    this.registryBridge = registryBridge;
    this.serviceBridge = serviceBridge;
    this.auditEngine = auditEngine;
    this.rsopEngine = rsopEngine;
  }

  /**
   * Helper to derive machine policy context based on machine properties.
   */
  public getMachineContext(machine: WindowsMachine): MachinePolicyContext {
    const isDc = machine.hostname.toUpperCase().includes('DC');
    const isFile = machine.hostname.toUpperCase().includes('FILE');

    let machineRole: 'WORKSTATION' | 'SERVER' | 'DOMAIN_CONTROLLER' = 'WORKSTATION';
    let ouPath = 'OU=Workstations,DC=NEXORA,DC=LOCAL';

    // Try to lookup real OU in AD
    const adComp = globalActiveDirectoryEngine.store.findComputer(machine.hostname);
    if (adComp) {
      ouPath = adComp.ou;
      if (adComp.ou.toUpperCase().includes('DOMAIN CONTROLLERS')) {
        machineRole = 'DOMAIN_CONTROLLER';
      } else if (adComp.ou.toUpperCase().includes('SERVERS')) {
        machineRole = 'SERVER';
      }
    } else {
      // Fallback
      if (isDc) {
        machineRole = 'DOMAIN_CONTROLLER';
        ouPath = 'OU=Domain Controllers,DC=NEXORA,DC=LOCAL';
      } else if (isFile) {
        machineRole = 'SERVER';
        ouPath = 'OU=Servers,DC=NEXORA,DC=LOCAL';
      }
    }

    return {
      machineId: machine.id,
      hostname: machine.hostname,
      domain: machine.domain,
      isDomainJoined: machine.isDomainJoined,
      ouPath,
      machineRole,
      computerSid: adComp?.sid || `S-1-5-21-99887766-${machine.id}`,
      computerGroupSids: [WELL_KNOWN_AD_SIDS.DOMAIN_COMPUTERS, 'S-1-5-11'],
    };
  }

  /**
   * Helper to derive user policy context based on username/sid.
   */
  public getUserContext(userName: string, userSid?: string): UserPolicyContext {
    const cleanUser = userName.includes('\\') ? userName.split('\\')[1] : userName.split('@')[0];
    const lowerUser = cleanUser.toLowerCase();

    // Try to lookup real user in AD
    const adUser = globalActiveDirectoryEngine.store.findUser(userSid || userName);

    let sid = userSid || adUser?.sid || 'S-1-5-21-99887766-2000';
    let ouPath = adUser?.ou || 'OU=Users,DC=NEXORA,DC=LOCAL';
    const groupSids: string[] = adUser?.groups || [WELL_KNOWN_AD_SIDS.DOMAIN_USERS, 'S-1-5-11'];

    if (!adUser) {
      if (lowerUser.includes('sara') || lowerUser.includes('finance')) {
        sid = userSid || 'S-1-5-21-99887766-2001';
        ouPath = 'OU=Finance,OU=Workstations,DC=NEXORA,DC=LOCAL';
        groupSids.push(WELL_KNOWN_AD_SIDS.FINANCE_USERS);
      } else if (lowerUser.includes('omar') || lowerUser.includes('hr')) {
        sid = userSid || 'S-1-5-21-99887766-2002';
        ouPath = 'OU=HR,OU=Workstations,DC=NEXORA,DC=LOCAL';
        groupSids.push(WELL_KNOWN_AD_SIDS.HR_USERS);
      } else if (lowerUser.includes('ali') || lowerUser.includes('it')) {
        sid = userSid || 'S-1-5-21-99887766-2003';
        ouPath = 'OU=IT,OU=Workstations,DC=NEXORA,DC=LOCAL';
        groupSids.push(WELL_KNOWN_AD_SIDS.IT_ADMINS);
      }
    }

    return {
      userName: adUser?.samAccountName || cleanUser,
      userSid: sid,
      userOuPath: ouPath,
      userGroupSids: groupSids,
    };
  }

  /**
   * Applies Group Policy to a target machine for a specific user session.
   */
  public applyPolicy(
    machine: WindowsMachine,
    userName?: string,
    userSid?: string,
    vTime = 0
  ): { success: boolean; rsop: RsopResult; error?: string } {
    // 1. Check gpsvc service status
    const gpsvc = machine.desktop.services.getService('gpsvc');
    if (gpsvc && gpsvc.status !== 'RUNNING') {
      // Emit Operational Event 5005
      this.emitGpoEvent(machine, 5005, 'Warning', 'Group Policy Client service (gpsvc) is unavailable.', vTime);
      return {
        success: false,
        error: 'GROUP_POLICY_SERVICE_UNAVAILABLE',
        rsop: this.rsopEngine.getRsop(this.getMachineContext(machine), undefined, vTime),
      };
    }

    // Emit Operational Event 5001: Policy processing started
    this.emitGpoEvent(machine, 5001, 'Information', `Group Policy processing started for machine ${machine.hostname}.`, vTime);

    const mCtx = this.getMachineContext(machine);
    const uCtx = userName ? this.getUserContext(userName, userSid) : undefined;

    // 2. Compute RSOP
    const rsop = this.processor.processPolicy(mCtx, uCtx, vTime);
    this.lastRsopCache.set(machine.id, rsop);

    // 3. Apply Registry Bridges
    this.registryBridge.applyRegistryPolicies(
      machine,
      rsop.effectiveComputerSettings,
      rsop.effectiveUserSettings
    );

    // 4. Apply Service Bridges
    this.serviceBridge.applyServicePolicies(machine, rsop.effectiveComputerSettings, vTime);

    // 5. Apply Audit Policy
    this.auditEngine.applyAuditPolicy(machine.id, rsop.effectiveComputerSettings);

    // 6. Apply Firewall Policy Consequence
    if (rsop.effectiveComputerSettings.firewallProfile) {
      const fw = rsop.effectiveComputerSettings.firewallProfile;
      if (fw.blockInboundSmb !== undefined) {
        if (fw.blockInboundSmb) {
          globalNetworkEngine.firewall.blockPort('TCP', 445, 'Block SMB via Group Policy');
        } else {
          globalNetworkEngine.firewall.unblockPort('TCP', 445);
        }
      }
    }

    // 7. Apply Mapped Drives Consequence
    if (uCtx && rsop.effectiveUserSettings.mappedDrives) {
      machine.desktop.setMappedDrives(rsop.effectiveUserSettings.mappedDrives);
    }

    // Emit Operational Events for Denied GPOs
    for (const denied of [...rsop.deniedComputerGpos, ...rsop.deniedUserGpos]) {
      const eventId = denied.filterResult && !denied.filterResult.eligible ? 5003 : 5004;
      this.emitGpoEvent(machine, eventId, 'Information', `GPO ${denied.gpoName} denied: ${denied.denialReason}`, vTime);
    }

    // Emit Operational Event 5002: Policy processing completed
    this.emitGpoEvent(machine, 5002, 'Information', `Group Policy processing completed successfully for machine ${machine.hostname}.`, vTime);

    return { success: true, rsop };
  }

  /**
   * Triggers a gpupdate on the target machine.
   */
  public gpupdate(
    machine: WindowsMachine,
    userName?: string,
    userSid?: string,
    _force = false,
    vTime = 0
  ): { success: boolean; output: string; error?: string } {
    const result = this.applyPolicy(machine, userName, userSid, vTime);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        output: `Updating policy...\nFailed to process Group Policy. Error: ${result.error}`,
      };
    }

    let output = `Updating policy...\n`;
    output += `Computer Policy update has completed successfully.\n`;
    if (userName) {
      output += `User Policy update has completed successfully.`;
    }

    return { success: true, output };
  }

  public getCachedRsop(machineId: string): RsopResult | undefined {
    return this.lastRsopCache.get(machineId);
  }

  private emitGpoEvent(
    machine: WindowsMachine,
    eventId: number,
    level: 'Information' | 'Warning' | 'Error',
    description: string,
    vTime: number
  ): void {
    machine.addEventLog({
      channel: 'System',
      eventId,
      virtualTime: vTime,
      provider: 'GroupPolicy',
      level,
      task: 'Group Policy Processing',
      computer: machine.hostname,
      user: 'NT AUTHORITY\\SYSTEM',
      data: { description, virtualTime: vTime },
    });

    globalSimulationRuntime.dispatch({
      type: 'WINDOWS_GPO_EVENT',
      category: 'SYSTEM',
      source: machine.hostname,
      severity: level === 'Error' ? 'threat' : level === 'Warning' ? 'warn' : 'info',
      description: `Event ${eventId} (GroupPolicy): ${description}`,
      payload: { machineId: machine.id, eventId, description, virtualTime: vTime },
    });
  }

  // --- Snapshot & Restore ---

  public exportSnapshot(): GroupPolicySnapshot {
    const storeSnap = this.store.exportSnapshot();
    const rsopCacheObj: Record<string, RsopResult> = {};
    for (const [k, v] of this.lastRsopCache.entries()) {
      rsopCacheObj[k] = JSON.parse(JSON.stringify(v));
    }
    return {
      gpos: storeSnap.gpos,
      links: storeSnap.links,
      ouBlockInheritance: storeSnap.ouBlockInheritance,
      lastRefreshTime: {},
      appliedSettingsCache: {},
    };
  }

  public restoreSnapshot(snap: GroupPolicySnapshot): void {
    if (!snap) return;
    this.store.restoreSnapshot({
      gpos: snap.gpos,
      links: snap.links,
      ouBlockInheritance: snap.ouBlockInheritance,
    });
    this.lastRsopCache.clear();
  }
}

export const globalGroupPolicyEngine = new GroupPolicyEngine();
