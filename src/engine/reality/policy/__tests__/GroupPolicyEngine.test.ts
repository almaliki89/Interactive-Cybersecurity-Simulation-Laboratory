/**
 * OMEGA ULTRA REALITY V1.5 — Group Policy Engine Unit & Integration Test Suite
 * Comprehensive tests covering LSDOU processing, Security/WMI Filtering, Enforced, Block Inheritance,
 * RSOP, Registry Bridge, Service Bridge, Audit Engine, Firewall, Mapped Drives, and Snapshot/Restore.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GroupPolicyEngine, globalGroupPolicyEngine } from '../GroupPolicyEngine';
import { GpoStore } from '../GpoStore';
import { GpoLinkResolver } from '../GpoLinkResolver';
import { PolicyProcessor } from '../PolicyProcessor';
import { SecurityFilterEngine, globalSecurityFilterEngine } from '../SecurityFilterEngine';
import { WmiFilterEngine, globalWmiFilterEngine } from '../WmiFilterEngine';
import { RealityEngine } from '../../RealityEngine';
import { globalNetworkEngine } from '../../network/NetworkEngine';
import { globalActiveDirectoryEngine } from '../../identity/ActiveDirectoryEngine';

describe('GroupPolicyEngine Unit & Integration Suite', () => {
  let gpoStore: GpoStore;
  let linkResolver: GpoLinkResolver;
  let securityFilter: SecurityFilterEngine;
  let wmiFilter: WmiFilterEngine;
  let processor: PolicyProcessor;
  let gpoEngine: GroupPolicyEngine;
  let realityEngine: RealityEngine;

  beforeEach(() => {
    gpoStore = globalGroupPolicyEngine.store;
    linkResolver = globalGroupPolicyEngine.linkResolver;
    securityFilter = globalSecurityFilterEngine;
    wmiFilter = globalWmiFilterEngine;
    processor = globalGroupPolicyEngine.processor;
    gpoEngine = globalGroupPolicyEngine;

    gpoStore.initDefaultGpos();

    // Align globalRealityEngine
    realityEngine = (globalThis as any).globalRealityEngine || new RealityEngine();
    (globalThis as any).globalRealityEngine = realityEngine;

    // Force AD store reset to pick up new baseline from file
    globalActiveDirectoryEngine.store.resetToBaseline();
  });

  it('1. Initializes baseline GPOs correctly in GpoStore', () => {
    const gpos = gpoStore.getAllGpos();
    expect(gpos.length).toBeGreaterThanOrEqual(6);

    const domainBaseline = gpoStore.getGpo('gpo-domain-baseline');
    expect(domainBaseline).toBeDefined();
    expect(domainBaseline?.displayName).toBe('NEXORA - Domain Security Baseline');

    const financePolicy = gpoStore.getGpo('gpo-finance-policy');
    expect(financePolicy).toBeDefined();
    expect(financePolicy?.userSettings.mappedDrives).toContainEqual({
      driveLetter: 'F:',
      remotePath: '\\\\FILE01\\Finance',
      label: 'Finance Share',
      persistent: true,
    });
  });

  it('2. Evaluates LSDOU container resolution', () => {
    const scopes = linkResolver.resolveContainerScopes('OU=Workstations,DC=NEXORA,DC=LOCAL');
    expect(scopes.length).toBe(2);
    expect(scopes[0].level).toBe('Domain');
    expect(scopes[1].level).toBe('ChildOU');
  });

  it('3. Security Filtering grants access to allowed SIDs and denies others', () => {
    const filterSids = ['S-1-5-21-99887766-1101']; // Finance Users only

    // Test sara.finance
    const saraRes = securityFilter.evaluate(filterSids, {
      targetSid: 'S-1-5-21-99887766-2001',
      targetName: 'sara.finance',
      targetType: 'User',
      groupSids: ['S-1-5-21-99887766-1101', 'S-1-5-11'],
    });
    expect(saraRes.eligible).toBe(true);

    // Test omar.hr
    const omarRes = securityFilter.evaluate(filterSids, {
      targetSid: 'S-1-5-21-99887766-2002',
      targetName: 'omar.hr',
      targetType: 'User',
      groupSids: ['S-1-5-21-99887766-1102', 'S-1-5-11'],
    });
    expect(omarRes.eligible).toBe(false);
  });

  it('4. WMI Filtering evaluates machine roles accurately', () => {
    const wsCtx = {
      machineId: 'FIN-WS01',
      hostname: 'FIN-WS01',
      domain: 'NEXORA.LOCAL',
      isDomainJoined: true,
      machineRole: 'WORKSTATION' as const,
      osVersion: 'Windows 11 Enterprise',
      isServer: false,
      isWorkstation: true,
    };

    const dcCtx = {
      machineId: 'DC01',
      hostname: 'DC01',
      domain: 'NEXORA.LOCAL',
      isDomainJoined: true,
      machineRole: 'DOMAIN_CONTROLLER' as const,
      osVersion: 'Windows Server 2022',
      isServer: true,
      isWorkstation: false,
    };

    expect(wmiFilter.evaluate('wmi-workstation-only', wsCtx).passed).toBe(true);
    expect(wmiFilter.evaluate('wmi-workstation-only', dcCtx).passed).toBe(false);

    expect(wmiFilter.evaluate('wmi-dc-only', dcCtx).passed).toBe(true);
    expect(wmiFilter.evaluate('wmi-dc-only', wsCtx).passed).toBe(false);
  });

  it('5. Computes RSOP for sara.finance on FIN-WS01', () => {
    const finWs01 = realityEngine.registry.getMachine('FIN-WS01')!;
    const mCtx = gpoEngine.getMachineContext(finWs01);
    const uCtx = gpoEngine.getUserContext('sara.finance');

    const rsop = processor.processPolicy(mCtx, uCtx);

    // Sara should receive Finance GPO
    const appliedUserNames = rsop.appliedUserGpos.map((g) => g.gpoName);
    expect(appliedUserNames).toContain('NEXORA - Finance Policy');

    // F: mapped drive should be present in effective user settings
    expect(rsop.effectiveUserSettings.mappedDrives).toContainEqual({
      driveLetter: 'F:',
      remotePath: '\\\\FILE01\\Finance',
      label: 'Finance Share',
      persistent: true,
    });

    // Control Panel restriction should be disabled
    expect(rsop.effectiveUserSettings.controlPanelAccess).toBe('disabled');
  });

  it('6. Computes RSOP for omar.hr on HR-WS01 (Must NOT receive Finance GPO)', () => {
    const hrWs01 = realityEngine.registry.getMachine('HR-WS01')!;
    const mCtx = gpoEngine.getMachineContext(hrWs01);
    const uCtx = gpoEngine.getUserContext('omar.hr');

    const rsop = processor.processPolicy(mCtx, uCtx);

    const appliedUserNames = rsop.appliedUserGpos.map((g) => g.gpoName);
    expect(appliedUserNames).toContain('NEXORA - HR Policy');
    expect(appliedUserNames).not.toContain('NEXORA - Finance Policy');

    // H: drive mapped, F: drive NOT mapped
    expect(rsop.effectiveUserSettings.mappedDrives).toContainEqual({
      driveLetter: 'H:',
      remotePath: '\\\\FILE01\\HR',
      label: 'HR Share',
      persistent: true,
    });
    expect(rsop.effectiveUserSettings.mappedDrives?.some((d) => d.driveLetter === 'F:')).toBe(false);
  });

  it('7. Enforced GPO overrides child OU non-enforced GPO settings', () => {
    // Enforce Domain Baseline GPO
    const domainBaselineLink = gpoStore.getAllLinks().find((l) => l.gpoId === 'gpo-domain-baseline')!;
    gpoStore.setLinkEnforced(domainBaselineLink.id, true);

    const finWs01 = realityEngine.registry.getMachine('FIN-WS01')!;
    const mCtx = gpoEngine.getMachineContext(finWs01);
    const uCtx = gpoEngine.getUserContext('sara.finance');

    const rsop = processor.processPolicy(mCtx, uCtx);

    // Winning source for screen lock
    const screenLockSource = rsop.settingSources['computer.desktopRestrictions.screenLockTimeout'];
    expect(screenLockSource).toBeDefined();
    expect(screenLockSource.winningGpoId).toBe('gpo-domain-baseline');
  });

  it('7b. Enforced state is link-specific for a GPO with multiple links', () => {
    const financeLinks = gpoStore.getAllLinks().filter((l) => l.gpoId === 'gpo-finance-policy');
    expect(financeLinks.length).toBeGreaterThan(1);

    const first = financeLinks[0];
    const second = financeLinks[1];

    gpoStore.setLinkEnforced(first.id, true);

    const refreshed = gpoStore.getAllLinks().filter((l) => l.gpoId === 'gpo-finance-policy');
    expect(refreshed.find((l) => l.id === first.id)?.enforced).toBe(true);
    expect(refreshed.find((l) => l.id === second.id)?.enforced).toBe(false);
    expect(gpoStore.getGpo('gpo-finance-policy')?.enforced).toBe(false);
  });

  it('8. Block Inheritance on an OU skips non-enforced inherited GPOs', () => {
    // Set Block Inheritance on Workstations OU
    gpoStore.setOuBlockInheritance('OU=Workstations,DC=NEXORA,DC=LOCAL', true);

    const finWs01 = realityEngine.registry.getMachine('FIN-WS01')!;
    const mCtx = gpoEngine.getMachineContext(finWs01);

    const candidates = linkResolver.resolveCandidateGpos(mCtx.ouPath);

    // Non-enforced Domain Baseline should be skipped due to Block Inheritance
    const domainGpoCandidate = candidates.orderedGpos.find((c) => c.gpo.id === 'gpo-domain-baseline');
    expect(domainGpoCandidate).toBeUndefined();
  });

  it('9. Policy Service Bridge disables and stops services when configured', () => {
    const file01 = realityEngine.registry.getMachine('FILE01')!;
    expect(file01.desktop.services.isServiceRunning('LanmanServer')).toBe(true);

    // Apply policy setting LanmanServer to DISABLED
    const compSettings = {
      serviceStartup: { LanmanServer: 'DISABLED' as const },
    };

    gpoEngine.serviceBridge.applyServicePolicies(file01, compSettings, 10);

    expect(file01.desktop.services.getService('LanmanServer')?.startupType).toBe('DISABLED');
    expect(file01.desktop.services.isServiceRunning('LanmanServer')).toBe(false);
  });

  it('10. Policy Firewall Bridge blocks and unblocks port 445 on FirewallEngine', () => {
    const finWs01 = realityEngine.registry.getMachine('FIN-WS01')!;
    const gpo = gpoStore.getGpo('gpo-workstation-baseline')!;
    
    // Block SMB via Firewall Policy
    gpo.computerSettings.firewallProfile = { blockInboundSmb: true };
    gpoEngine.applyPolicy(finWs01, 'sara.finance', undefined, 100);

    expect(globalNetworkEngine.firewall.isPortBlocked('TCP', 445)).toBe(true);

    // Unblock SMB via Firewall Policy
    gpo.computerSettings.firewallProfile = { blockInboundSmb: false };

    gpoEngine.applyPolicy(finWs01, 'sara.finance', undefined, 200);
    expect(globalNetworkEngine.firewall.isPortBlocked('TCP', 445)).toBe(false);
  });

  it('11. gpupdate command via shell updates policy and returns output', () => {
    const finWs01 = realityEngine.registry.getMachine('FIN-WS01')!;
    const res = finWs01.desktop.shell.execute('gpupdate /force', {
      machineId: 'FIN-WS01',
      hostname: 'FIN-WS01',
      domain: 'NEXORA.LOCAL',
      userName: 'sara.finance',
      userSid: 'S-1-5-21-99887766-2001',
      userGroups: [{ name: 'Finance Users', sid: 'S-1-5-21-99887766-1101', type: 'Security' }],
      currentDirectory: 'C:\\Users\\sara.finance',
      fileSystem: finWs01.desktop.fileSystem,
      processManager: finWs01.desktop.processes,
      serviceManager: finWs01.desktop.services,
    });

    expect(res.exitCode).toBe(0);
    expect(res.output).toContain('Computer Policy update has completed successfully');
    expect(res.output).toContain('User Policy update has completed successfully');
  });

  it('12. gpresult command via shell prints RSOP summary', () => {
    const finWs01 = realityEngine.registry.getMachine('FIN-WS01')!;
    const res = finWs01.desktop.shell.execute('gpresult /r', {
      machineId: 'FIN-WS01',
      hostname: 'FIN-WS01',
      domain: 'NEXORA.LOCAL',
      userName: 'sara.finance',
      userSid: 'S-1-5-21-99887766-2001',
      userGroups: [{ name: 'Finance Users', sid: 'S-1-5-21-99887766-1101', type: 'Security' }],
      currentDirectory: 'C:\\Users\\sara.finance',
      fileSystem: finWs01.desktop.fileSystem,
      processManager: finWs01.desktop.processes,
      serviceManager: finWs01.desktop.services,
    });

    expect(res.exitCode).toBe(0);
    expect(res.output).toContain('Applied Group Policy Objects');
    expect(res.output).toContain('COMPUTER SETTINGS');
    expect(res.output).toContain('USER SETTINGS');
  });

  it('13. Fails policy refresh when gpsvc (Group Policy Client service) is stopped', () => {
    const finWs01 = realityEngine.registry.getMachine('FIN-WS01')!;
    finWs01.desktop.services.stopService('gpsvc', 10);

    const res = gpoEngine.applyPolicy(finWs01, 'sara.finance', undefined, 20);
    expect(res.success).toBe(false);
    expect(res.error).toBe('GROUP_POLICY_SERVICE_UNAVAILABLE');
  });

  it('14. Exports and Restores snapshot deterministically, including RSOP cache', () => {
    gpoStore.setOuBlockInheritance('OU=Workstations,DC=NEXORA,DC=LOCAL', true);

    const finWs01 = realityEngine.registry.getMachine('FIN-WS01')!;
    const applied = gpoEngine.applyPolicy(
      finWs01,
      'sara.finance',
      'S-1-5-21-99887766-2001',
      321
    );
    expect(applied.success).toBe(true);

    const snap = gpoEngine.exportSnapshot();
    expect(snap.lastRefreshTime['FIN-WS01']).toBe(321);
    expect(snap.appliedSettingsCache['FIN-WS01']).toBeDefined();
    expect(snap.rsopCache?.['FIN-WS01']?.targetUserName).toBe('sara.finance');

    const newEngine = new GroupPolicyEngine(new GpoStore(), new GpoLinkResolver(), new PolicyProcessor());
    newEngine.restoreSnapshot(snap);

    expect(newEngine.store.isOuBlockingInheritance('OU=Workstations,DC=NEXORA,DC=LOCAL')).toBe(true);
    expect(newEngine.getCachedRsop('FIN-WS01')?.lastRefreshVirtualTime).toBe(321);
    expect(newEngine.getCachedRsop('FIN-WS01')?.targetUserName).toBe('sara.finance');
  });
});
