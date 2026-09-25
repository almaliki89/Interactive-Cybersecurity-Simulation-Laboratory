import { WindowsUser, WindowsGroup, getEffectiveWindowsGroups, WELL_KNOWN_SIDS } from './identity';

export type IntegrityLevel = 'Untrusted' | 'Low' | 'Medium' | 'High' | 'System';

export interface WindowsPrivilege {
  name: string;
  descriptionEn: string;
  descriptionAr: string;
  enabled: boolean;
  defaultForAdmin: boolean;
}

export interface WindowsAccessToken {
  tokenId: string;
  userSid: string;
  username: string;
  fullName: string;
  groupSids: string[];
  privileges: WindowsPrivilege[];
  integrityLevel: IntegrityLevel;
  tokenType: 'Primary' | 'Impersonation';
  elevationType: 'Full' | 'Limited' | 'Default';
  sessionId: number;
  authTime: number; // Virtual clock time in ms
}

export const ALL_WINDOWS_PRIVILEGES: WindowsPrivilege[] = [
  {
    name: 'SeChangeNotifyPrivilege',
    descriptionEn: 'Bypass directory traverse checking',
    descriptionAr: 'تخطي فحص اجتياز المجلدات أثناء التصفح',
    enabled: true,
    defaultForAdmin: false,
  },
  {
    name: 'SeSecurityPrivilege',
    descriptionEn: 'Manage auditing and security log',
    descriptionAr: 'إدارة سياسات التدقيق وفحص سجل الأمان',
    enabled: false,
    defaultForAdmin: true,
  },
  {
    name: 'SeBackupPrivilege',
    descriptionEn: 'Back up files and directories (bypass read ACL)',
    descriptionAr: 'النسخ الاحتياطي للملفات وتجاوز قيود قراءة ACL',
    enabled: false,
    defaultForAdmin: true,
  },
  {
    name: 'SeRestorePrivilege',
    descriptionEn: 'Restore files and directories (bypass write ACL)',
    descriptionAr: 'استعادة الملفات والمجلدات وتجاوز قيود الكتابة',
    enabled: false,
    defaultForAdmin: true,
  },
  {
    name: 'SeShutdownPrivilege',
    descriptionEn: 'Shut down the operating system',
    descriptionAr: 'إيقاف تشغيل نظام التشغيل وإعادة التشغيل',
    enabled: true,
    defaultForAdmin: false,
  },
  {
    name: 'SeDebugPrivilege',
    descriptionEn: 'Debug programs and inspect arbitrary process memory (lsass.exe)',
    descriptionAr: 'تصحيح وفحص برامج النظام والاطلاع على ذاكرة العمليات الحساسة',
    enabled: false,
    defaultForAdmin: true,
  },
  {
    name: 'SeImpersonatePrivilege',
    descriptionEn: 'Impersonate a client after authentication (token stealing)',
    descriptionAr: 'انتحال هوية العميل بعد المصادقة واستغلال الرموز',
    enabled: false,
    defaultForAdmin: true,
  },
  {
    name: 'SeLoadDriverPrivilege',
    descriptionEn: 'Load and unload device drivers into kernel space',
    descriptionAr: 'تحميل وإلغاء تعريفات الأجهزة في مساحة النواة',
    enabled: false,
    defaultForAdmin: true,
  },
];

/**
 * Builds an authentic Windows Access Token based on user identity, effective groups,
 * privileges, and UAC elevation state.
 */
export function buildAccessToken(
  user: WindowsUser,
  allGroups: WindowsGroup[],
  customPrivilegeNames?: string[],
  forcedIntegrity?: IntegrityLevel,
  virtualTime: number = 0
): WindowsAccessToken {
  const effectiveGroups = getEffectiveWindowsGroups(user, allGroups);
  const groupSids = effectiveGroups.map((g) => g.sid);

  const isAdmin = groupSids.includes(WELL_KNOWN_SIDS.ADMINISTRATORS);
  const isSystem = user.sid === WELL_KNOWN_SIDS.LOCAL_SYSTEM;

  let integrityLevel: IntegrityLevel = 'Medium';
  let elevationType: 'Full' | 'Limited' | 'Default' = 'Default';

  if (isSystem) {
    integrityLevel = 'System';
    elevationType = 'Full';
  } else if (isAdmin) {
    // If admin is elevated
    integrityLevel = forcedIntegrity ?? 'High';
    elevationType = integrityLevel === 'High' ? 'Full' : 'Limited';
  } else if (user.username === 'Guest') {
    integrityLevel = 'Low';
    elevationType = 'Default';
  } else {
    integrityLevel = forcedIntegrity ?? 'Medium';
    elevationType = 'Default';
  }

  // Construct privileges list
  const privileges: WindowsPrivilege[] = ALL_WINDOWS_PRIVILEGES.map((p) => {
    let enabled = false;
    if (customPrivilegeNames) {
      enabled = customPrivilegeNames.includes(p.name);
    } else if (isSystem) {
      enabled = true;
    } else if (isAdmin && integrityLevel === 'High') {
      enabled = p.defaultForAdmin || p.name === 'SeChangeNotifyPrivilege' || p.name === 'SeShutdownPrivilege';
    } else {
      enabled = p.name === 'SeChangeNotifyPrivilege';
    }

    return {
      ...p,
      enabled,
    };
  });

  return {
    tokenId: `tok-${user.username}-${Math.floor(virtualTime / 1000)}`,
    userSid: user.sid,
    username: user.username,
    fullName: user.fullName,
    groupSids,
    privileges,
    integrityLevel,
    tokenType: 'Primary',
    elevationType,
    sessionId: user.canInteractiveLogon ? 1 : 0,
    authTime: virtualTime,
  };
}

/**
 * Checks whether the access token possesses a specific group SID.
 */
export function tokenHasGroup(token: WindowsAccessToken, groupSid: string): boolean {
  return token.groupSids.includes(groupSid);
}

/**
 * Checks whether the access token possesses and has enabled a specific Windows privilege.
 */
export function tokenHasPrivilege(token: WindowsAccessToken, privilegeName: string): boolean {
  const priv = token.privileges.find((p) => p.name === privilegeName);
  return Boolean(priv && priv.enabled);
}

/**
 * Checks whether a token belongs to an administrator that can be elevated via UAC.
 */
export function canElevate(token: WindowsAccessToken): boolean {
  const hasAdminSid = token.groupSids.includes(WELL_KNOWN_SIDS.ADMINISTRATORS);
  return hasAdminSid && token.integrityLevel !== 'High' && token.integrityLevel !== 'System';
}
