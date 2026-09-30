/**
 * OMEGA ULTRA REALITY V1.5 — GPO Store & Repository
 * Central repository for Group Policy Objects, Container Links, and OU Inheritance rules.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { GroupPolicyObject, GpoLink } from './types';
import { WELL_KNOWN_AD_SIDS } from '../identity/DirectoryStore';

export class GpoStore {
  private gpos: Map<string, GroupPolicyObject> = new Map();
  private links: GpoLink[] = [];
  private ouBlockInheritance: Map<string, boolean> = new Map();

  constructor() {
    this.initDefaultGpos();
  }

  public initDefaultGpos(): void {
    this.gpos.clear();
    this.links = [];
    this.ouBlockInheritance.clear();

    // 1. Domain Security Baseline GPO
    const domainBaseline: GroupPolicyObject = {
      id: 'gpo-domain-baseline',
      guid: '{31B2F340-016D-11D2-945F-00C04FB984F9}',
      displayName: 'NEXORA - Domain Security Baseline',
      versionUser: 1,
      versionComputer: 1,
      enabledUser: true,
      enabledComputer: true,
      enforced: false,
      blockInheritanceAware: true,
      securityFilterSids: ['S-1-5-11'], // Authenticated Users
      computerSettings: {
        passwordPolicy: { minLength: 12, complexity: true, historyCount: 24 },
        accountLockout: { threshold: 5, durationMinutes: 30, resetMinutes: 30 },
        auditPolicy: { logonEvents: 'success_failure', objectAccess: 'enabled', directoryServiceAccess: 'enabled' },
        firewallProfile: { enabled: true, defaultInboundAction: 'block' },
        desktopRestrictions: { screenLockTimeout: 900 },
        windowsUpdateMode: 'auto',
        registrySettings: [
          { hive: 'HKLM', key: 'Software\\Policies\\Microsoft\\Windows\\System', valueName: 'EnableSmartScreen', value: 1, type: 'REG_DWORD' },
        ],
      },
      userSettings: {
        desktopRestrictions: { screenLockTimeout: 900 },
      },
      createdVirtualTime: 0,
      modifiedVirtualTime: 0,
    };

    // 2. Workstation Baseline GPO
    const workstationBaseline: GroupPolicyObject = {
      id: 'gpo-workstation-baseline',
      guid: '{4A67B121-023E-11D2-946F-00C04FB985A1}',
      displayName: 'NEXORA - Workstation Baseline',
      versionUser: 1,
      versionComputer: 1,
      enabledUser: true,
      enabledComputer: true,
      enforced: false,
      blockInheritanceAware: true,
      securityFilterSids: ['S-1-5-11'], // Authenticated Users
      wmiFilterId: 'wmi-workstation-only',
      computerSettings: {
        auditPolicy: { processCreation: 'enabled', includeCmdLine: true },
        desktopRestrictions: { disableRemovableStorage: true, screenLockTimeout: 900 },
        firewallProfile: { enabled: true },
        serviceStartup: { Spooler: 'MANUAL' },
        registrySettings: [
          { hive: 'HKLM', key: 'Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', valueName: 'ConsentPromptBehaviorAdmin', value: 2, type: 'REG_DWORD' },
        ],
      },
      userSettings: {
        startMenuRestrictions: { hideRun: false },
      },
      createdVirtualTime: 0,
      modifiedVirtualTime: 0,
    };

    // 3. Finance Policy GPO
    const financePolicy: GroupPolicyObject = {
      id: 'gpo-finance-policy',
      guid: '{5B78C232-034F-11D2-947F-00C04FB986B2}',
      displayName: 'NEXORA - Finance Policy',
      versionUser: 1,
      versionComputer: 1,
      enabledUser: true,
      enabledComputer: true,
      enforced: false,
      blockInheritanceAware: true,
      securityFilterSids: [WELL_KNOWN_AD_SIDS.FINANCE_USERS, 'S-1-5-21-99887766-2001'], // Finance Users or sara.finance
      computerSettings: {
        auditPolicy: { objectAccess: 'enabled' },
      },
      userSettings: {
        mappedDrives: [
          { driveLetter: 'F:', remotePath: '\\\\FILE01\\Finance', label: 'Finance Share', persistent: true },
        ],
        controlPanelAccess: 'disabled',
        desktopRestrictions: { screenLockTimeout: 600 },
        environmentVariables: { DEPARTMENT: 'Finance' },
      },
      createdVirtualTime: 0,
      modifiedVirtualTime: 0,
    };

    // 4. HR Policy GPO
    const hrPolicy: GroupPolicyObject = {
      id: 'gpo-hr-policy',
      guid: '{6C89D343-0450-11D2-948F-00C04FB987C3}',
      displayName: 'NEXORA - HR Policy',
      versionUser: 1,
      versionComputer: 1,
      enabledUser: true,
      enabledComputer: true,
      enforced: false,
      blockInheritanceAware: true,
      securityFilterSids: [WELL_KNOWN_AD_SIDS.HR_USERS, 'S-1-5-21-99887766-2002'], // HR Users or omar.hr
      computerSettings: {},
      userSettings: {
        mappedDrives: [
          { driveLetter: 'H:', remotePath: '\\\\FILE01\\HR', label: 'HR Share', persistent: true },
        ],
        desktopRestrictions: { screenLockTimeout: 600 },
        environmentVariables: { DEPARTMENT: 'HR' },
      },
      createdVirtualTime: 0,
      modifiedVirtualTime: 0,
    };

    // 5. IT Admin Policy GPO
    const itPolicy: GroupPolicyObject = {
      id: 'gpo-it-policy',
      guid: '{7D90E454-0561-11D2-949F-00C04FB988D4}',
      displayName: 'NEXORA - IT Admin Policy',
      versionUser: 1,
      versionComputer: 1,
      enabledUser: true,
      enabledComputer: true,
      enforced: false,
      blockInheritanceAware: true,
      securityFilterSids: [WELL_KNOWN_AD_SIDS.IT_ADMINS, 'S-1-5-21-99887766-2003'], // IT Admins or ali.it
      computerSettings: {},
      userSettings: {
        mappedDrives: [
          { driveLetter: 'I:', remotePath: '\\\\FILE01\\IT', label: 'IT Share', persistent: true },
        ],
        controlPanelAccess: 'enabled',
        cmdAccess: 'enabled',
        registryToolsAccess: 'enabled',
        environmentVariables: { DEPARTMENT: 'IT' },
      },
      createdVirtualTime: 0,
      modifiedVirtualTime: 0,
    };

    // 6. Default Domain Controllers Policy GPO
    const dcPolicy: GroupPolicyObject = {
      id: 'gpo-dc-policy',
      guid: '{6AC1786C-016F-11D2-945F-00C04FB984F9}',
      displayName: 'Default Domain Controllers Policy',
      versionUser: 1,
      versionComputer: 1,
      enabledUser: true,
      enabledComputer: true,
      enforced: false,
      blockInheritanceAware: true,
      securityFilterSids: ['S-1-5-11'], // Authenticated Users
      wmiFilterId: 'wmi-dc-only',
      computerSettings: {
        auditPolicy: { directoryServiceAccess: 'enabled', logonEvents: 'success_failure' },
        serviceStartup: { NTDS: 'AUTO', KDC: 'AUTO', DNS: 'AUTO' },
      },
      userSettings: {},
      createdVirtualTime: 0,
      modifiedVirtualTime: 0,
    };

    this.gpos.set(domainBaseline.id, domainBaseline);
    this.gpos.set(workstationBaseline.id, workstationBaseline);
    this.gpos.set(financePolicy.id, financePolicy);
    this.gpos.set(hrPolicy.id, hrPolicy);
    this.gpos.set(itPolicy.id, itPolicy);
    this.gpos.set(dcPolicy.id, dcPolicy);

    // Default Container Links
    this.links = [
      {
        id: 'link-domain-baseline',
        containerPath: 'DC=NEXORA,DC=LOCAL',
        gpoId: 'gpo-domain-baseline',
        linkOrder: 1,
        enabled: true,
        enforced: false,
      },
      {
        id: 'link-ws-baseline',
        containerPath: 'OU=Workstations,DC=NEXORA,DC=LOCAL',
        gpoId: 'gpo-workstation-baseline',
        linkOrder: 1,
        enabled: true,
        enforced: false,
      },
      {
        id: 'link-ws-finance',
        containerPath: 'OU=Workstations,DC=NEXORA,DC=LOCAL',
        gpoId: 'gpo-finance-policy',
        linkOrder: 2,
        enabled: true,
        enforced: false,
      },
      {
        id: 'link-ou-finance',
        containerPath: 'OU=Finance,OU=Workstations,DC=NEXORA,DC=LOCAL',
        gpoId: 'gpo-finance-policy',
        linkOrder: 1,
        enabled: true,
        enforced: false,
      },
      {
        id: 'link-ws-hr',
        containerPath: 'OU=Workstations,DC=NEXORA,DC=LOCAL',
        gpoId: 'gpo-hr-policy',
        linkOrder: 3,
        enabled: true,
        enforced: false,
      },
      {
        id: 'link-ou-hr',
        containerPath: 'OU=HR,OU=Workstations,DC=NEXORA,DC=LOCAL',
        gpoId: 'gpo-hr-policy',
        linkOrder: 1,
        enabled: true,
        enforced: false,
      },
      {
        id: 'link-ws-it',
        containerPath: 'OU=Workstations,DC=NEXORA,DC=LOCAL',
        gpoId: 'gpo-it-policy',
        linkOrder: 4,
        enabled: true,
        enforced: false,
      },
      {
        id: 'link-ou-it',
        containerPath: 'OU=IT,OU=Workstations,DC=NEXORA,DC=LOCAL',
        gpoId: 'gpo-it-policy',
        linkOrder: 1,
        enabled: true,
        enforced: false,
      },
      {
        id: 'link-dc-policy',
        containerPath: 'OU=Domain Controllers,DC=NEXORA,DC=LOCAL',
        gpoId: 'gpo-dc-policy',
        linkOrder: 1,
        enabled: true,
        enforced: false,
      },
    ];
  }

  // --- GPO Operations ---

  public getGpo(id: string): GroupPolicyObject | undefined {
    return this.gpos.get(id);
  }

  public getAllGpos(): GroupPolicyObject[] {
    return Array.from(this.gpos.values());
  }

  public saveGpo(gpo: GroupPolicyObject): void {
    this.gpos.set(gpo.id, { ...gpo });
  }

  public createGpo(gpo: Omit<GroupPolicyObject, 'id' | 'guid' | 'createdVirtualTime' | 'modifiedVirtualTime'>, vTime = 0): GroupPolicyObject {
    const nextIdx = this.gpos.size + 1;
    const id = `gpo-custom-${nextIdx}`;
    const guid = `{${Math.abs(nextIdx * 12345678).toString(16).padStart(8, '0').toUpperCase()}-0000-11D2-945F-00C04FB984F9}`;
    const newGpo: GroupPolicyObject = {
      ...gpo,
      id,
      guid,
      createdVirtualTime: vTime,
      modifiedVirtualTime: vTime,
    };
    this.gpos.set(id, newGpo);
    return newGpo;
  }

  // --- Links Operations ---

  public getLinksForContainer(containerPath: string): GpoLink[] {
    const norm = containerPath.toUpperCase();
    return this.links
      .filter((l) => l.containerPath.toUpperCase() === norm && l.enabled)
      .sort((a, b) => a.linkOrder - b.linkOrder);
  }

  public getAllLinks(): GpoLink[] {
    return [...this.links];
  }

  public linkGpo(containerPath: string, gpoId: string, enforced = false): GpoLink {
    const existing = this.links.filter((l) => l.containerPath.toUpperCase() === containerPath.toUpperCase());
    const nextOrder = existing.length + 1;
    const link: GpoLink = {
      id: `link-${containerPath.replace(/[^a-zA-Z0-9]/g, '-')}-${gpoId}`,
      containerPath,
      gpoId,
      linkOrder: nextOrder,
      enabled: true,
      enforced,
    };
    this.links.push(link);
    return link;
  }

  public unlinkGpo(containerPath: string, gpoId: string): boolean {
    const idx = this.links.findIndex(
      (l) => l.containerPath.toUpperCase() === containerPath.toUpperCase() && l.gpoId === gpoId
    );
    if (idx !== -1) {
      this.links.splice(idx, 1);
      return true;
    }
    return false;
  }

  public setLinkEnabled(linkId: string, enabled: boolean): void {
    const link = this.links.find((l) => l.id === linkId);
    if (link) {
      link.enabled = enabled;
    }
  }

  public setLinkEnforced(linkId: string, enforced: boolean): void {
    const link = this.links.find((l) => l.id === linkId);
    if (link) {
      // Enforcement is a link property. Changing one link must not mutate the
      // GPO object or implicitly enforce every other link to the same GPO.
      link.enforced = enforced;
    }
  }

  // --- OU Inheritance Operations ---

  public isOuBlockingInheritance(ouPath: string): boolean {
    return this.ouBlockInheritance.get(ouPath.toUpperCase()) ?? false;
  }

  public setOuBlockInheritance(ouPath: string, block: boolean): void {
    this.ouBlockInheritance.set(ouPath.toUpperCase(), block);
  }

  public getOuBlockInheritanceMap(): Record<string, boolean> {
    const res: Record<string, boolean> = {};
    for (const [k, v] of this.ouBlockInheritance.entries()) {
      res[k] = v;
    }
    return res;
  }

  // --- Snapshot & Restore ---

  public exportSnapshot(): {
    gpos: Record<string, GroupPolicyObject>;
    links: GpoLink[];
    ouBlockInheritance: Record<string, boolean>;
  } {
    const gposObj: Record<string, GroupPolicyObject> = {};
    for (const [k, v] of this.gpos.entries()) {
      gposObj[k] = JSON.parse(JSON.stringify(v));
    }
    return {
      gpos: gposObj,
      links: JSON.parse(JSON.stringify(this.links)),
      ouBlockInheritance: this.getOuBlockInheritanceMap(),
    };
  }

  public restoreSnapshot(snap: {
    gpos: Record<string, GroupPolicyObject>;
    links: GpoLink[];
    ouBlockInheritance: Record<string, boolean>;
  }): void {
    this.gpos.clear();
    for (const [k, v] of Object.entries(snap.gpos)) {
      this.gpos.set(k, JSON.parse(JSON.stringify(v)));
    }
    this.links = JSON.parse(JSON.stringify(snap.links));
    this.ouBlockInheritance.clear();
    for (const [k, v] of Object.entries(snap.ouBlockInheritance || {})) {
      this.ouBlockInheritance.set(k.toUpperCase(), v);
    }
  }
}

export const globalGpoStore = new GpoStore();
