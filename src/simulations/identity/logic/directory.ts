/**
 * Active Directory Object Model & Production Logic
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type AdObjectType = 'user' | 'computer' | 'group' | 'ou' | 'gpo';

export interface AdUser {
  id: string;
  type: 'user';
  sid: string;
  samAccountName: string;
  displayName: string;
  ou: string; // Distinguished name of parent OU
  department: string;
  enabled: boolean;
  groups: string[]; // Group names or SIDs
  privileged: boolean;
  isServiceAccount: boolean;
  userPrincipalName: string;
  adminCount?: number;
  lastLogonVirtualTime?: number;
  allowInteractiveLogon: boolean;
}

export interface AdComputer {
  id: string;
  type: 'computer';
  sid: string;
  hostname: string;
  ou: string;
  operatingSystem: string;
  enabled: boolean;
  ipAddress?: string;
}

export interface AdGroup {
  id: string;
  type: 'group';
  sid: string;
  name: string;
  scope: 'DomainLocal' | 'Global' | 'Universal';
  groupType: 'Security' | 'Distribution';
  members: string[]; // User SIDs, Computer SIDs, or nested Group SIDs
  ou: string;
  descriptionEn: string;
  descriptionAr: string;
  privileged: boolean;
}

export interface AdOrganizationalUnit {
  id: string;
  type: 'ou';
  name: string;
  distinguishedName: string;
  parentOu: string | null;
  children: string[];
  linkedGpos: string[];
  blockInheritance?: boolean;
  descriptionEn: string;
  descriptionAr: string;
}

export type AdObject = AdUser | AdComputer | AdGroup | AdOrganizationalUnit;

export const DOMAIN_DN = 'DC=corp,DC=nexora,DC=local';
export const DOMAIN_NAME = 'corp.nexora.local';
export const FOREST_NAME = 'nexora.local';

export const INITIAL_OUS: AdOrganizationalUnit[] = [
  {
    id: 'ou-finance',
    type: 'ou',
    name: 'Finance',
    distinguishedName: 'OU=Finance,DC=corp,DC=nexora,DC=local',
    parentOu: null,
    children: ['OU=Workstations,OU=Finance,DC=corp,DC=nexora,DC=local'],
    linkedGpos: ['gpo-finance-security'],
    blockInheritance: false,
    descriptionEn: 'Finance Department accounts, billing records, and audit systems',
    descriptionAr: 'حسابات إدارة المالية، سجلات الفواتير، وأنظمة التدقيق المالي',
  },
  {
    id: 'ou-finance-ws',
    type: 'ou',
    name: 'Workstations',
    distinguishedName: 'OU=Workstations,OU=Finance,DC=corp,DC=nexora,DC=local',
    parentOu: 'OU=Finance,DC=corp,DC=nexora,DC=local',
    children: [],
    linkedGpos: ['gpo-workstation-baseline'],
    blockInheritance: false,
    descriptionEn: 'Finance department workstation computers',
    descriptionAr: 'محطات عمل أجهزة موظفي الإدارة المالية',
  },
  {
    id: 'ou-hr',
    type: 'ou',
    name: 'HR',
    distinguishedName: 'OU=HR,DC=corp,DC=nexora,DC=local',
    parentOu: null,
    children: [],
    linkedGpos: ['gpo-hr-policy'],
    blockInheritance: false,
    descriptionEn: 'Human Resources personnel and sensitive payroll records',
    descriptionAr: 'شؤون الموظفين والموارد البشرية وسجلات الرواتب الحساسة',
  },
  {
    id: 'ou-it',
    type: 'ou',
    name: 'IT',
    distinguishedName: 'OU=IT,DC=corp,DC=nexora,DC=local',
    parentOu: null,
    children: [],
    linkedGpos: ['gpo-admin-strict'],
    blockInheritance: false,
    descriptionEn: 'Information Technology engineers and systems administrators',
    descriptionAr: 'مهندسو تقنية المعلومات ومديرو الأنظمة والشبكات',
  },
  {
    id: 'ou-servers',
    type: 'ou',
    name: 'Servers',
    distinguishedName: 'OU=Servers,DC=corp,DC=nexora,DC=local',
    parentOu: null,
    children: [],
    linkedGpos: ['gpo-tier0-dc', 'gpo-server-hardening'],
    blockInheritance: false,
    descriptionEn: 'Enterprise servers, Domain Controllers, and SQL clusters',
    descriptionAr: 'خوادم المؤسسة ومتحكمات المجال وقواعد بيانات SQL',
  },
  {
    id: 'ou-contractors',
    type: 'ou',
    name: 'Contractors',
    distinguishedName: 'OU=Contractors,DC=corp,DC=nexora,DC=local',
    parentOu: null,
    children: [],
    linkedGpos: ['gpo-contractor-restricted'],
    blockInheritance: false,
    descriptionEn: 'External vendors, temporary auditors, and third-party contractors',
    descriptionAr: 'المتعاقدون الخارجيون، المدققون المؤقتون، والموردون',
  },
  {
    id: 'ou-groups',
    type: 'ou',
    name: 'Groups',
    distinguishedName: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    parentOu: null,
    children: [],
    linkedGpos: [],
    blockInheritance: false,
    descriptionEn: 'Central enterprise security and distribution groups',
    descriptionAr: 'مجموعات الأمان والتوزيع المركزية في نطاق المؤسسة',
  },
];

export const INITIAL_USERS: AdUser[] = [
  {
    id: 'usr-sara',
    type: 'user',
    sid: 'S-1-5-21-392841-1001',
    samAccountName: 'sara',
    displayName: 'Sara Connor',
    ou: 'OU=HR,DC=corp,DC=nexora,DC=local', // Initially in HR before challenge migration
    department: 'Finance', // Transferring to Finance
    enabled: true,
    groups: ['Domain Users', 'HR-Users', 'HR-Admins'], // Erroneously retains HR-Admins
    privileged: true, // Erroneously true due to HR-Admins
    isServiceAccount: false,
    userPrincipalName: 'sara@corp.nexora.local',
    adminCount: 1,
    lastLogonVirtualTime: 120,
    allowInteractiveLogon: true,
  },
  {
    id: 'usr-alice',
    type: 'user',
    sid: 'S-1-5-21-392841-1002',
    samAccountName: 'alice',
    displayName: 'Alice Walker',
    ou: 'OU=Finance,DC=corp,DC=nexora,DC=local',
    department: 'Finance',
    enabled: true,
    groups: ['Domain Users', 'Finance-Users', 'Finance-Reporting'],
    privileged: false,
    isServiceAccount: false,
    userPrincipalName: 'alice@corp.nexora.local',
    lastLogonVirtualTime: 85,
    allowInteractiveLogon: true,
  },
  {
    id: 'usr-bob',
    type: 'user',
    sid: 'S-1-5-21-392841-1003',
    samAccountName: 'bob',
    displayName: 'Bob Smith',
    ou: 'OU=IT,DC=corp,DC=nexora,DC=local',
    department: 'IT',
    enabled: true,
    groups: ['Domain Users', 'IT-Operations', 'Domain Admins'],
    privileged: true,
    isServiceAccount: false,
    userPrincipalName: 'bob@corp.nexora.local',
    adminCount: 1,
    lastLogonVirtualTime: 140,
    allowInteractiveLogon: true,
  },
  {
    id: 'usr-temp-auditor',
    type: 'user',
    sid: 'S-1-5-21-392841-1004',
    samAccountName: 'temp-auditor',
    displayName: 'External Auditor (Stale)',
    ou: 'OU=Contractors,DC=corp,DC=nexora,DC=local',
    department: 'Contractors',
    enabled: true, // Erroneously still enabled!
    groups: ['Domain Users', 'Contractors-Ext'],
    privileged: false,
    isServiceAccount: false,
    userPrincipalName: 'temp-auditor@corp.nexora.local',
    lastLogonVirtualTime: 10,
    allowInteractiveLogon: true,
  },
  {
    id: 'usr-svc-backup',
    type: 'user',
    sid: 'S-1-5-21-392841-1005',
    samAccountName: 'svc-sql-backup',
    displayName: 'SQL Database Backup Service',
    ou: 'OU=Servers,DC=corp,DC=nexora,DC=local',
    department: 'IT',
    enabled: true,
    groups: ['Domain Users', 'Remote Desktop Users', 'Backup Operators'], // Risky RDP membership
    privileged: false,
    isServiceAccount: true,
    userPrincipalName: 'svc-sql-backup@corp.nexora.local',
    lastLogonVirtualTime: 200,
    allowInteractiveLogon: true, // Vulnerable: service accounts shouldn't have interactive logon
  },
];

export const INITIAL_COMPUTERS: AdComputer[] = [
  {
    id: 'cmp-dc01',
    type: 'computer',
    sid: 'S-1-5-21-392841-2001',
    hostname: 'DC01-NEXORA',
    ou: 'OU=Servers,DC=corp,DC=nexora,DC=local',
    operatingSystem: 'Windows Server 2022 Datacenter',
    enabled: true,
    ipAddress: '10.0.1.10',
  },
  {
    id: 'cmp-fin-ws01',
    type: 'computer',
    sid: 'S-1-5-21-392841-2002',
    hostname: 'FIN-WS-01',
    ou: 'OU=Workstations,OU=Finance,DC=corp,DC=nexora,DC=local',
    operatingSystem: 'Windows 11 Enterprise',
    enabled: true,
    ipAddress: '10.0.2.45',
  },
  {
    id: 'cmp-hr-ws01',
    type: 'computer',
    sid: 'S-1-5-21-392841-2003',
    hostname: 'HR-WS-01',
    ou: 'OU=HR,DC=corp,DC=nexora,DC=local',
    operatingSystem: 'Windows 11 Enterprise',
    enabled: true,
    ipAddress: '10.0.3.22',
  },
  {
    id: 'cmp-srv-sql',
    type: 'computer',
    sid: 'S-1-5-21-392841-2004',
    hostname: 'SRV-SQL-01',
    ou: 'OU=Servers,DC=corp,DC=nexora,DC=local',
    operatingSystem: 'Windows Server 2022 Standard',
    enabled: true,
    ipAddress: '10.0.1.20',
  },
];

export const INITIAL_GROUPS: AdGroup[] = [
  {
    id: 'grp-domain-users',
    type: 'group',
    sid: 'S-1-5-21-392841-513',
    name: 'Domain Users',
    scope: 'Global',
    groupType: 'Security',
    members: [
      'S-1-5-21-392841-1001', // sara
      'S-1-5-21-392841-1002', // alice
      'S-1-5-21-392841-1003', // bob
      'S-1-5-21-392841-1004', // temp-auditor
      'S-1-5-21-392841-1005', // svc-sql-backup
    ],
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'All authenticated domain users baseline membership',
    descriptionAr: 'عضوية الأساس لجميع مستخدمي النطاق الموثقين',
    privileged: false,
  },
  {
    id: 'grp-domain-admins',
    type: 'group',
    sid: 'S-1-5-21-392841-512',
    name: 'Domain Admins',
    scope: 'Global',
    groupType: 'Security',
    members: ['S-1-5-21-392841-1003'], // bob
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'Designated administrators of the domain with full authority',
    descriptionAr: 'مسؤولو النطاق المعينون بكامل الصلاحيات الإدارية المطلقة',
    privileged: true,
  },
  {
    id: 'grp-finance-users',
    type: 'group',
    sid: 'S-1-5-21-392841-1101',
    name: 'Finance-Users',
    scope: 'Global',
    groupType: 'Security',
    members: ['S-1-5-21-392841-1002'], // alice
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'General personnel in Finance department',
    descriptionAr: 'الموظفون العاملون في إدارة المالية',
    privileged: false,
  },
  {
    id: 'grp-finance-reporting',
    type: 'group',
    sid: 'S-1-5-21-392841-1102',
    name: 'Finance-Reporting',
    scope: 'DomainLocal',
    groupType: 'Security',
    members: ['S-1-5-21-392841-1101'], // Finance-Users is nested into Finance-Reporting
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'Grants read access to financial statements and general ledgers',
    descriptionAr: 'يمنح صلاحية قراءة القوائم المالية ودفاتر الحسابات العامة',
    privileged: false,
  },
  {
    id: 'grp-hr-users',
    type: 'group',
    sid: 'S-1-5-21-392841-1201',
    name: 'HR-Users',
    scope: 'Global',
    groupType: 'Security',
    members: ['S-1-5-21-392841-1001'], // sara (initial)
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'Human resources personnel',
    descriptionAr: 'موظفو إدارة الموارد البشرية',
    privileged: false,
  },
  {
    id: 'grp-hr-admins',
    type: 'group',
    sid: 'S-1-5-21-392841-1202',
    name: 'HR-Admins',
    scope: 'DomainLocal',
    groupType: 'Security',
    members: ['S-1-5-21-392841-1001'], // sara (should be removed in challenge)
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'Privileged HR managers with access to executive salaries and termination records',
    descriptionAr: 'مديرو الموارد البشرية ذوو الصلاحيات الحساسة لرواتب التنفيذيين وإنهاء الخدمات',
    privileged: true,
  },
  {
    id: 'grp-it-ops',
    type: 'group',
    sid: 'S-1-5-21-392841-1301',
    name: 'IT-Operations',
    scope: 'Global',
    groupType: 'Security',
    members: ['S-1-5-21-392841-1003'], // bob
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'IT infrastructure and helpdesk operations team',
    descriptionAr: 'فريق عمليات البنية التحتية والدعم الفني لتقنية المعلومات',
    privileged: true,
  },
  {
    id: 'grp-contractors',
    type: 'group',
    sid: 'S-1-5-21-392841-1401',
    name: 'Contractors-Ext',
    scope: 'Global',
    groupType: 'Security',
    members: ['S-1-5-21-392841-1004'], // temp-auditor
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'External contract staff and third-party vendors',
    descriptionAr: 'الموظفون المتعاقدون والجهات الخارجية المؤقتة',
    privileged: false,
  },
  {
    id: 'grp-rdp-users',
    type: 'group',
    sid: 'S-1-5-32-555',
    name: 'Remote Desktop Users',
    scope: 'DomainLocal',
    groupType: 'Security',
    members: ['S-1-5-21-392841-1005'], // svc-sql-backup (vulnerable)
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'Members granted interactive Remote Desktop logon rights',
    descriptionAr: 'الأعضاء الممنوحون حق تسجيل الدخول عبر سطح المكتب البعيد RDP',
    privileged: true,
  },
  {
    id: 'grp-backup-ops',
    type: 'group',
    sid: 'S-1-5-32-551',
    name: 'Backup Operators',
    scope: 'DomainLocal',
    groupType: 'Security',
    members: ['S-1-5-21-392841-1005'], // svc-sql-backup
    ou: 'OU=Groups,DC=corp,DC=nexora,DC=local',
    descriptionEn: 'Can back up and restore files regardless of file permissions',
    descriptionAr: 'إمكانية أخذ نسخ احتياطية واستعادتها متجاوزين أذونات الملفات',
    privileged: true,
  },
];

export const INITIAL_DIRECTORY_OBJECTS: AdObject[] = [
  ...INITIAL_OUS,
  ...INITIAL_USERS,
  ...INITIAL_COMPUTERS,
  ...INITIAL_GROUPS,
];

/**
 * Moves an object (User or Computer) to a target OU deterministically.
 */
export function moveObjectToOu(
  objects: AdObject[],
  objectId: string,
  targetOuDn: string
): AdObject[] {
  const targetOu = objects.find(
    (o) => o.type === 'ou' && (o as AdOrganizationalUnit).distinguishedName === targetOuDn
  );
  if (!targetOu) {
    return objects;
  }

  return objects.map((obj) => {
    if (obj.id === objectId) {
      if (obj.type === 'user' || obj.type === 'computer') {
        return {
          ...obj,
          ou: targetOuDn,
        };
      }
    }
    return obj;
  });
}

/**
 * Enables a directory user or computer object.
 */
export function enableDirectoryObject(
  objects: AdObject[],
  objectId: string
): AdObject[] {
  return objects.map((obj) => {
    if (obj.id === objectId && (obj.type === 'user' || obj.type === 'computer')) {
      return {
        ...obj,
        enabled: true,
      };
    }
    return obj;
  });
}

/**
 * Disables a directory user or computer object.
 */
export function disableDirectoryObject(
  objects: AdObject[],
  objectId: string
): AdObject[] {
  return objects.map((obj) => {
    if (obj.id === objectId && (obj.type === 'user' || obj.type === 'computer')) {
      return {
        ...obj,
        enabled: false,
      };
    }
    return obj;
  });
}

/**
 * Finds a directory object by its SID.
 */
export function findObjectBySid(
  objects: AdObject[],
  sid: string
): AdObject | undefined {
  return objects.find((obj) => {
    if ('sid' in obj) {
      return (obj as any).sid === sid;
    }
    return false;
  });
}

/**
 * Finds a directory object by its ID.
 */
export function findObjectById(
  objects: AdObject[],
  id: string
): AdObject | undefined {
  return objects.find((obj) => obj.id === id);
}

/**
 * Finds a user object by samAccountName.
 */
export function findUserBySamAccountName(
  objects: AdObject[],
  samAccountName: string
): AdUser | undefined {
  return objects.find(
    (obj) => obj.type === 'user' && (obj as AdUser).samAccountName.toLowerCase() === samAccountName.toLowerCase()
  ) as AdUser | undefined;
}

/**
 * Gets all child objects belonging directly to a specified OU distinguishedName.
 */
export function getChildrenOfOu(
  objects: AdObject[],
  ouDn: string
): AdObject[] {
  return objects.filter((obj) => {
    if (obj.type === 'user' || obj.type === 'computer') {
      return obj.ou === ouDn;
    }
    if (obj.type === 'ou') {
      return obj.parentOu === ouDn;
    }
    if (obj.type === 'group') {
      return obj.ou === ouDn;
    }
    return false;
  });
}
