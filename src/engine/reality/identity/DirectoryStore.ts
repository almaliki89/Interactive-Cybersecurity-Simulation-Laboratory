/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory DirectoryStore
 * Central repository for Directory Objects, OUs, Groups, Users, and Computers.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import {
  DirectoryUser,
  DirectoryComputer,
  DirectoryGroup,
  DirectoryOU,
  DirectoryServiceAccount,
} from './types';

export const DOMAIN_BASE_SID = 'S-1-5-21-99887766';

export const WELL_KNOWN_AD_SIDS = {
  DOMAIN_ADMINS: `${DOMAIN_BASE_SID}-512`,
  DOMAIN_USERS: `${DOMAIN_BASE_SID}-513`,
  DOMAIN_COMPUTERS: `${DOMAIN_BASE_SID}-515`,
  ADMINISTRATORS: 'S-1-5-32-544',
  REMOTE_DESKTOP_USERS: 'S-1-5-32-555',
  BACKUP_OPERATORS: 'S-1-5-32-551',
  FINANCE_USERS: `${DOMAIN_BASE_SID}-1101`,
  HR_USERS: `${DOMAIN_BASE_SID}-1102`,
  IT_ADMINS: `${DOMAIN_BASE_SID}-1103`,
};

export const BASELINE_OUS: DirectoryOU[] = [
  { dn: 'DC=NEXORA,DC=LOCAL', name: 'NEXORA.LOCAL', parentDn: null, description: 'Domain Root' },
  { dn: 'OU=Users,DC=NEXORA,DC=LOCAL', name: 'Users', parentDn: 'DC=NEXORA,DC=LOCAL', description: 'Standard Domain Users' },
  { dn: 'OU=Workstations,DC=NEXORA,DC=LOCAL', name: 'Workstations', parentDn: 'DC=NEXORA,DC=LOCAL', description: 'Domain Workstations' },
  { dn: 'OU=Servers,DC=NEXORA,DC=LOCAL', name: 'Servers', parentDn: 'DC=NEXORA,DC=LOCAL', description: 'Enterprise Member Servers' },
  { dn: 'OU=Service Accounts,DC=NEXORA,DC=LOCAL', name: 'Service Accounts', parentDn: 'DC=NEXORA,DC=LOCAL', description: 'Managed Service Accounts' },
  { dn: 'OU=Groups,DC=NEXORA,DC=LOCAL', name: 'Groups', parentDn: 'DC=NEXORA,DC=LOCAL', description: 'Security Groups' },
  { dn: 'OU=Finance,DC=NEXORA,DC=LOCAL', name: 'Finance', parentDn: 'DC=NEXORA,DC=LOCAL', description: 'Finance Department' },
  { dn: 'OU=HR,DC=NEXORA,DC=LOCAL', name: 'HR', parentDn: 'DC=NEXORA,DC=LOCAL', description: 'Human Resources Department' },
  { dn: 'OU=IT,DC=NEXORA,DC=LOCAL', name: 'IT', parentDn: 'DC=NEXORA,DC=LOCAL', description: 'Information Technology' },
  { dn: 'OU=Domain Controllers,DC=NEXORA,DC=LOCAL', name: 'Domain Controllers', parentDn: 'DC=NEXORA,DC=LOCAL', description: 'Domain Controllers' },
];

export const BASELINE_GROUPS: DirectoryGroup[] = [
  {
    id: 'grp-domain-users',
    sid: WELL_KNOWN_AD_SIDS.DOMAIN_USERS,
    name: 'Domain Users',
    type: 'Security',
    scope: 'Global',
    members: ['sara.finance', 'omar.hr', 'ali.it', 'administrator', 'svc_backup'],
    ou: 'OU=Groups,DC=NEXORA,DC=LOCAL',
    description: 'All domain users',
  },
  {
    id: 'grp-domain-admins',
    sid: WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS,
    name: 'Domain Admins',
    type: 'Security',
    scope: 'Global',
    members: ['administrator'],
    ou: 'OU=Groups,DC=NEXORA,DC=LOCAL',
    description: 'Designated administrators of the domain',
  },
  {
    id: 'grp-administrators',
    sid: WELL_KNOWN_AD_SIDS.ADMINISTRATORS,
    name: 'Administrators',
    type: 'Security',
    scope: 'DomainLocal',
    members: [WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS, 'administrator'],
    ou: 'OU=Groups,DC=NEXORA,DC=LOCAL',
    description: 'Built-in administrators group',
  },
  {
    id: 'grp-domain-computers',
    sid: WELL_KNOWN_AD_SIDS.DOMAIN_COMPUTERS,
    name: 'Domain Computers',
    type: 'Security',
    scope: 'Global',
    members: ['FIN-WS01$', 'HR-WS01$', 'IT-WS01$', 'FILE01$', 'APP01$'],
    ou: 'OU=Groups,DC=NEXORA,DC=LOCAL',
    description: 'All workstations and servers joined to the domain',
  },
  {
    id: 'grp-remote-desktop',
    sid: WELL_KNOWN_AD_SIDS.REMOTE_DESKTOP_USERS,
    name: 'Remote Desktop Users',
    type: 'Security',
    scope: 'DomainLocal',
    members: ['ali.it', 'administrator'],
    ou: 'OU=Groups,DC=NEXORA,DC=LOCAL',
    description: 'Members are granted the right to log on remotely',
  },
  {
    id: 'grp-backup-operators',
    sid: WELL_KNOWN_AD_SIDS.BACKUP_OPERATORS,
    name: 'Backup Operators',
    type: 'Security',
    scope: 'Builtin',
    members: ['svc_backup'],
    ou: 'OU=Groups,DC=NEXORA,DC=LOCAL',
    description: 'Backup operators',
  },
  {
    id: 'grp-finance-users',
    sid: WELL_KNOWN_AD_SIDS.FINANCE_USERS,
    name: 'Finance Users',
    type: 'Security',
    scope: 'Global',
    members: ['sara.finance'],
    ou: 'OU=Finance,DC=NEXORA,DC=LOCAL',
    description: 'Finance department staff',
  },
  {
    id: 'grp-hr-users',
    sid: WELL_KNOWN_AD_SIDS.HR_USERS,
    name: 'HR Users',
    type: 'Security',
    scope: 'Global',
    members: ['omar.hr'],
    ou: 'OU=HR,DC=NEXORA,DC=LOCAL',
    description: 'Human resources staff',
  },
  {
    id: 'grp-it-admins',
    sid: WELL_KNOWN_AD_SIDS.IT_ADMINS,
    name: 'IT Admins',
    type: 'Security',
    scope: 'Global',
    members: ['ali.it'],
    ou: 'OU=IT,DC=NEXORA,DC=LOCAL',
    description: 'IT Systems administrators',
  },
];

export const BASELINE_USERS: DirectoryUser[] = [
  {
    id: 'usr-sara.finance',
    sid: `${DOMAIN_BASE_SID}-2001`,
    samAccountName: 'sara.finance',
    upn: 'sara.finance@NEXORA.LOCAL',
    displayName: 'Sara Finance',
    enabled: true,
    passwordState: 'Valid',
    passwordLastSetVirtualTime: 0,
    groups: [WELL_KNOWN_AD_SIDS.DOMAIN_USERS, WELL_KNOWN_AD_SIDS.FINANCE_USERS],
    primaryGroup: WELL_KNOWN_AD_SIDS.DOMAIN_USERS,
    userAccountControl: 512,
    lastLogonVirtualTime: 0,
    ou: 'OU=Finance,DC=NEXORA,DC=LOCAL',
    credentialVerifierHash: 'hash-sara-secret-2026',
    defaultIntegrityLevel: 'Medium',
    privileges: ['SeChangeNotifyPrivilege'],
  },
  {
    id: 'usr-omar.hr',
    sid: `${DOMAIN_BASE_SID}-2002`,
    samAccountName: 'omar.hr',
    upn: 'omar.hr@NEXORA.LOCAL',
    displayName: 'Omar HR',
    enabled: true,
    passwordState: 'Valid',
    passwordLastSetVirtualTime: 0,
    groups: [WELL_KNOWN_AD_SIDS.DOMAIN_USERS, WELL_KNOWN_AD_SIDS.HR_USERS],
    primaryGroup: WELL_KNOWN_AD_SIDS.DOMAIN_USERS,
    userAccountControl: 512,
    lastLogonVirtualTime: 0,
    ou: 'OU=HR,DC=NEXORA,DC=LOCAL',
    credentialVerifierHash: 'hash-omar-secret-2026',
    defaultIntegrityLevel: 'Medium',
    privileges: ['SeChangeNotifyPrivilege'],
  },
  {
    id: 'usr-ali.it',
    sid: `${DOMAIN_BASE_SID}-2003`,
    samAccountName: 'ali.it',
    upn: 'ali.it@NEXORA.LOCAL',
    displayName: 'Ali IT',
    enabled: true,
    passwordState: 'Valid',
    passwordLastSetVirtualTime: 0,
    groups: [WELL_KNOWN_AD_SIDS.DOMAIN_USERS, WELL_KNOWN_AD_SIDS.IT_ADMINS, WELL_KNOWN_AD_SIDS.REMOTE_DESKTOP_USERS],
    primaryGroup: WELL_KNOWN_AD_SIDS.DOMAIN_USERS,
    userAccountControl: 512,
    lastLogonVirtualTime: 0,
    ou: 'OU=IT,DC=NEXORA,DC=LOCAL',
    credentialVerifierHash: 'hash-ali-secret-2026',
    defaultIntegrityLevel: 'Medium',
    privileges: ['SeChangeNotifyPrivilege'],
  },
  {
    id: 'usr-administrator',
    sid: `${DOMAIN_BASE_SID}-500`,
    samAccountName: 'administrator',
    upn: 'administrator@NEXORA.LOCAL',
    displayName: 'Administrator',
    enabled: true,
    passwordState: 'Valid',
    passwordLastSetVirtualTime: 0,
    groups: [WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS, WELL_KNOWN_AD_SIDS.ADMINISTRATORS, WELL_KNOWN_AD_SIDS.DOMAIN_USERS],
    primaryGroup: WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS,
    userAccountControl: 512,
    lastLogonVirtualTime: 0,
    ou: 'OU=Users,DC=NEXORA,DC=LOCAL',
    credentialVerifierHash: 'hash-admin-secret-2026',
    defaultIntegrityLevel: 'High',
    privileges: ['SeBackupPrivilege', 'SeRestorePrivilege', 'SeDebugPrivilege', 'SeChangeNotifyPrivilege'],
  },
  {
    id: 'usr-svc_backup',
    sid: `${DOMAIN_BASE_SID}-2004`,
    samAccountName: 'svc_backup',
    upn: 'svc_backup@NEXORA.LOCAL',
    displayName: 'Backup Service Account',
    enabled: true,
    passwordState: 'Valid',
    passwordLastSetVirtualTime: 0,
    groups: [WELL_KNOWN_AD_SIDS.DOMAIN_USERS, WELL_KNOWN_AD_SIDS.BACKUP_OPERATORS],
    primaryGroup: WELL_KNOWN_AD_SIDS.DOMAIN_USERS,
    userAccountControl: 512,
    lastLogonVirtualTime: 0,
    ou: 'OU=Service Accounts,DC=NEXORA,DC=LOCAL',
    credentialVerifierHash: 'hash-backup-secret-2026',
    defaultIntegrityLevel: 'Medium',
    privileges: ['SeBackupPrivilege', 'SeRestorePrivilege', 'SeChangeNotifyPrivilege'],
  },
];

export const BASELINE_COMPUTERS: DirectoryComputer[] = [
  {
    id: 'cmp-dc01',
    sid: `${DOMAIN_BASE_SID}-1001`,
    hostname: 'DC01',
    domain: 'NEXORA.LOCAL',
    enabled: true,
    machineAccountName: 'DC01$',
    osType: 'Windows Server 2022 Datacenter',
    joinedAtVirtualTime: 0,
    ou: 'OU=Domain Controllers,DC=NEXORA,DC=LOCAL',
    secureChannelState: 'HEALTHY',
    ipAddress: '10.10.10.10',
  },
  {
    id: 'cmp-file01',
    sid: `${DOMAIN_BASE_SID}-1002`,
    hostname: 'FILE01',
    domain: 'NEXORA.LOCAL',
    enabled: true,
    machineAccountName: 'FILE01$',
    osType: 'Windows Server 2022 Standard',
    joinedAtVirtualTime: 0,
    ou: 'OU=Servers,DC=NEXORA,DC=LOCAL',
    secureChannelState: 'HEALTHY',
    ipAddress: '10.10.20.10',
  },
  {
    id: 'cmp-fin-ws01',
    sid: `${DOMAIN_BASE_SID}-1003`,
    hostname: 'FIN-WS01',
    domain: 'NEXORA.LOCAL',
    enabled: true,
    machineAccountName: 'FIN-WS01$',
    osType: 'Windows 11 Enterprise',
    joinedAtVirtualTime: 0,
    ou: 'OU=Finance,DC=NEXORA,DC=LOCAL',
    secureChannelState: 'HEALTHY',
    ipAddress: '10.10.30.15',
  },
  {
    id: 'cmp-hr-ws01',
    sid: `${DOMAIN_BASE_SID}-1004`,
    hostname: 'HR-WS01',
    domain: 'NEXORA.LOCAL',
    enabled: true,
    machineAccountName: 'HR-WS01$',
    osType: 'Windows 11 Enterprise',
    joinedAtVirtualTime: 0,
    ou: 'OU=HR,DC=NEXORA,DC=LOCAL',
    secureChannelState: 'HEALTHY',
    ipAddress: '10.10.30.20',
  },
  {
    id: 'cmp-it-ws01',
    sid: `${DOMAIN_BASE_SID}-1005`,
    hostname: 'IT-WS01',
    domain: 'NEXORA.LOCAL',
    enabled: true,
    machineAccountName: 'IT-WS01$',
    osType: 'Windows 11 Enterprise',
    joinedAtVirtualTime: 0,
    ou: 'OU=IT,DC=NEXORA,DC=LOCAL',
    secureChannelState: 'HEALTHY',
    ipAddress: '10.10.30.25',
  },
  {
    id: 'cmp-app01',
    sid: `${DOMAIN_BASE_SID}-1006`,
    hostname: 'APP01',
    domain: 'NEXORA.LOCAL',
    enabled: true,
    machineAccountName: 'APP01$',
    osType: 'Windows Server 2022 Standard',
    joinedAtVirtualTime: 0,
    ou: 'OU=Servers,DC=NEXORA,DC=LOCAL',
    secureChannelState: 'HEALTHY',
    ipAddress: '10.10.20.20',
  },
];

export class DirectoryStore {
  private ous: Map<string, DirectoryOU> = new Map();
  private users: Map<string, DirectoryUser> = new Map(); // Keyed by SID and samAccountName
  private groups: Map<string, DirectoryGroup> = new Map(); // Keyed by SID and Name
  private computers: Map<string, DirectoryComputer> = new Map(); // Keyed by SID and Hostname
  private serviceAccounts: Map<string, DirectoryServiceAccount> = new Map();

  constructor() {
    this.resetToBaseline();
  }

  public resetToBaseline(): void {
    this.ous.clear();
    this.users.clear();
    this.groups.clear();
    this.computers.clear();
    this.serviceAccounts.clear();

    BASELINE_OUS.forEach((ou) => this.ous.set(ou.dn.toUpperCase(), { ...ou }));
    BASELINE_GROUPS.forEach((grp) => {
      const copy = { ...grp, members: [...grp.members] };
      this.groups.set(copy.sid, copy);
      this.groups.set(copy.name.toUpperCase(), copy);
    });
    BASELINE_USERS.forEach((usr) => {
      const copy = { ...usr, groups: [...usr.groups], privileges: [...usr.privileges] };
      this.users.set(copy.sid, copy);
      this.users.set(copy.samAccountName.toLowerCase(), copy);
      this.users.set(copy.upn.toLowerCase(), copy);
    });
    BASELINE_COMPUTERS.forEach((cmp) => {
      const copy = { ...cmp };
      this.computers.set(copy.sid, copy);
      this.computers.set(copy.hostname.toUpperCase(), copy);
    });
  }

  // --- QUERY METHODS ---

  public findUser(usernameOrSid: string): DirectoryUser | undefined {
    if (!usernameOrSid) return undefined;
    const clean = usernameOrSid.trim().toLowerCase();
    let user = this.users.get(clean) || this.users.get(usernameOrSid);
    if (!user && clean.includes('\\')) {
      const parts = clean.split('\\');
      user = this.users.get(parts[1]);
    }
    if (!user && clean.includes('@')) {
      const parts = clean.split('@');
      user = this.users.get(parts[0]);
    }
    return user;
  }

  public findGroup(nameOrSid: string): DirectoryGroup | undefined {
    if (!nameOrSid) return undefined;
    const clean = nameOrSid.trim().toUpperCase();
    return this.groups.get(nameOrSid) || this.groups.get(clean);
  }

  public findComputer(hostnameOrSid: string): DirectoryComputer | undefined {
    if (!hostnameOrSid) return undefined;
    const clean = hostnameOrSid.trim().toUpperCase();
    return this.computers.get(hostnameOrSid) || this.computers.get(clean);
  }

  public getAllUsers(): DirectoryUser[] {
    const set = new Set<DirectoryUser>();
    this.users.forEach((u) => set.add(u));
    return Array.from(set);
  }

  public getAllGroups(): DirectoryGroup[] {
    const set = new Set<DirectoryGroup>();
    this.groups.forEach((g) => set.add(g));
    return Array.from(set);
  }

  public getAllComputers(): DirectoryComputer[] {
    const set = new Set<DirectoryComputer>();
    this.computers.forEach((c) => set.add(c));
    return Array.from(set);
  }

  public getAllOUs(): DirectoryOU[] {
    return Array.from(this.ous.values());
  }

  public addUser(user: DirectoryUser): void {
    this.users.set(user.sid, user);
    this.users.set(user.samAccountName.toLowerCase(), user);
    this.users.set(user.upn.toLowerCase(), user);
  }

  public updateUser(user: DirectoryUser): void {
    this.addUser(user);
  }

  public updateComputer(computer: DirectoryComputer): void {
    this.computers.set(computer.sid, computer);
    this.computers.set(computer.hostname.toUpperCase(), computer);
  }

  // --- SNAPSHOT & RESTORE ---

  public getStateSnapshot(): {
    ous: DirectoryOU[];
    users: DirectoryUser[];
    groups: DirectoryGroup[];
    computers: DirectoryComputer[];
    serviceAccounts: DirectoryServiceAccount[];
  } {
    return {
      ous: JSON.parse(JSON.stringify(this.getAllOUs())),
      users: JSON.parse(JSON.stringify(this.getAllUsers())),
      groups: JSON.parse(JSON.stringify(this.getAllGroups())),
      computers: JSON.parse(JSON.stringify(this.getAllComputers())),
      serviceAccounts: JSON.parse(JSON.stringify(Array.from(this.serviceAccounts.values()))),
    };
  }

  public restoreStateSnapshot(snapshot: {
    ous: DirectoryOU[];
    users: DirectoryUser[];
    groups: DirectoryGroup[];
    computers: DirectoryComputer[];
    serviceAccounts?: DirectoryServiceAccount[];
  }): void {
    this.ous.clear();
    this.users.clear();
    this.groups.clear();
    this.computers.clear();
    this.serviceAccounts.clear();

    snapshot.ous.forEach((ou) => this.ous.set(ou.dn.toUpperCase(), ou));
    snapshot.groups.forEach((grp) => {
      this.groups.set(grp.sid, grp);
      this.groups.set(grp.name.toUpperCase(), grp);
    });
    snapshot.users.forEach((usr) => this.addUser(usr));
    snapshot.computers.forEach((cmp) => this.updateComputer(cmp));
    if (snapshot.serviceAccounts) {
      snapshot.serviceAccounts.forEach((sa) => this.serviceAccounts.set(sa.sid, sa));
    }
  }
}
