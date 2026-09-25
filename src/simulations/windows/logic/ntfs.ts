import { WindowsAccessToken } from './token';
import { WELL_KNOWN_SIDS } from './identity';

export type NtfsPermission = 'Read' | 'Write' | 'Modify' | 'FullControl';
export type AceType = 'Allow' | 'Deny';

export interface NtfsAce {
  id: string;
  trusteeSid: string;
  trusteeName: string;
  type: AceType;
  permissions: NtfsPermission[];
  isInherited: boolean;
}

export interface NtfsResource {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'folder';
  ownerSid: string;
  ownerName: string;
  inheritanceEnabled: boolean;
  parentPath?: string;
  dacl: NtfsAce[];
  securityRelevanceEn: string;
  securityRelevanceAr: string;
}

export const INITIAL_NTFS_RESOURCES: NtfsResource[] = [
  {
    id: 'res-confidential',
    path: 'C:\\Confidential',
    name: 'Confidential',
    type: 'folder',
    ownerSid: WELL_KNOWN_SIDS.ADMINISTRATORS,
    ownerName: 'Administrators',
    inheritanceEnabled: false,
    // Vulnerable initial state: Everyone has FullControl or Write! (Hardening finding)
    dacl: [
      {
        id: 'ace-conf-1',
        trusteeSid: WELL_KNOWN_SIDS.ADMINISTRATORS,
        trusteeName: 'Administrators',
        type: 'Allow',
        permissions: ['FullControl', 'Modify', 'Write', 'Read'],
        isInherited: false,
      },
      {
        id: 'ace-conf-2',
        trusteeSid: WELL_KNOWN_SIDS.FINANCE,
        trusteeName: 'Finance',
        type: 'Allow',
        permissions: ['Modify', 'Write', 'Read'],
        isInherited: false,
      },
      {
        id: 'ace-conf-3',
        trusteeSid: WELL_KNOWN_SIDS.EVERYONE,
        trusteeName: 'Everyone',
        type: 'Allow',
        permissions: ['FullControl', 'Modify', 'Write', 'Read'],
        isInherited: false,
      },
    ],
    securityRelevanceEn: 'Sensitive corporate directory. Currently vulnerable to unauthorized modification by Everyone.',
    securityRelevanceAr: 'مجلد مؤسسي حساس. حالياً معرض للتعديل غير المصرح به من قبل الجميع.',
  },
  {
    id: 'res-salaries',
    path: 'C:\\Confidential\\salaries.xlsx',
    name: 'salaries.xlsx',
    type: 'file',
    ownerSid: 'S-1-5-21-1003', // finance-admin
    ownerName: 'finance-admin',
    inheritanceEnabled: true,
    parentPath: 'C:\\Confidential',
    dacl: [
      {
        id: 'ace-sal-1',
        trusteeSid: WELL_KNOWN_SIDS.FINANCE,
        trusteeName: 'Finance',
        type: 'Allow',
        permissions: ['Modify', 'Write', 'Read'],
        isInherited: false,
      },
    ],
    securityRelevanceEn: 'Payroll ledger spreadsheet. Should only be accessible to Finance and Administrators.',
    securityRelevanceAr: 'جدول بيانات الرواتب. يجب أن يكون متاحاً فقط لفرق المالية والمسؤولين.',
  },
  {
    id: 'res-system32',
    path: 'C:\\Windows\\System32',
    name: 'System32',
    type: 'folder',
    ownerSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
    ownerName: 'TrustedInstaller',
    inheritanceEnabled: false,
    dacl: [
      {
        id: 'ace-sys-1',
        trusteeSid: WELL_KNOWN_SIDS.LOCAL_SYSTEM,
        trusteeName: 'SYSTEM',
        type: 'Allow',
        permissions: ['FullControl', 'Modify', 'Write', 'Read'],
        isInherited: false,
      },
      {
        id: 'ace-sys-2',
        trusteeSid: WELL_KNOWN_SIDS.ADMINISTRATORS,
        trusteeName: 'Administrators',
        type: 'Allow',
        permissions: ['FullControl', 'Modify', 'Write', 'Read'],
        isInherited: false,
      },
      {
        id: 'ace-sys-3',
        trusteeSid: WELL_KNOWN_SIDS.USERS,
        trusteeName: 'Users',
        type: 'Allow',
        permissions: ['Read'],
        isInherited: false,
      },
    ],
    securityRelevanceEn: 'Core operating system binaries and DLL libraries. Requires strict write protection.',
    securityRelevanceAr: 'ملفات النواة والمكتبات الحيوية لنظام التشغيل. تتطلب حماية صارمة لمنع الكتابة والتعديل.',
  },
  {
    id: 'res-public-share',
    path: 'C:\\Shares\\Public',
    name: 'Public',
    type: 'folder',
    ownerSid: WELL_KNOWN_SIDS.ADMINISTRATORS,
    ownerName: 'Administrators',
    inheritanceEnabled: false,
    dacl: [
      {
        id: 'ace-pub-1',
        trusteeSid: WELL_KNOWN_SIDS.USERS,
        trusteeName: 'Users',
        type: 'Allow',
        permissions: ['Read', 'Write'],
        isInherited: false,
      },
      {
        id: 'ace-pub-2',
        trusteeSid: WELL_KNOWN_SIDS.GUESTS,
        trusteeName: 'Guests',
        type: 'Deny',
        permissions: ['Write', 'Modify', 'FullControl'],
        isInherited: false,
      },
    ],
    securityRelevanceEn: 'General file sharing space with explicit Deny for Guests.',
    securityRelevanceAr: 'مساحة مشاركة ملفات عامة مع منع صريح لحسابات الضيوف من الكتابة.',
  },
];

/**
 * Evaluates NTFS access for a given security token and requested permission.
 *
 * Windows Security Reference Monitor evaluation rule:
 * 1. If user is Local System or has SeBackupPrivilege (for Read) -> ALLOW
 * 2. Explicit Deny ACE matching user SID or any group SID -> DENIED immediately
 * 3. Explicit Allow ACEs accumulate permissions
 * 4. Inherited Deny ACE matching user or group -> DENIED
 * 5. Inherited Allow ACEs accumulate permissions
 * 6. If requested permission is satisfied in accumulated permissions -> ALLOW
 * 7. Default: DENY (Implicit deny)
 */
export function evaluateNtfsAccess(
  resource: NtfsResource,
  token: WindowsAccessToken,
  requestedPermission: NtfsPermission
): { allowed: boolean; reasonEn: string; reasonAr: string; matchedAce?: NtfsAce } {
  // Check System bypass
  if (token.userSid === WELL_KNOWN_SIDS.LOCAL_SYSTEM) {
    return {
      allowed: true,
      reasonEn: 'Local SYSTEM account has full kernel access authority',
      reasonAr: 'حساب SYSTEM المحلي يمتلك سلطة وصول كاملة من النواة',
    };
  }

  // Check Backup Operator privilege bypass for Read
  if (requestedPermission === 'Read' && token.privileges.some((p) => p.name === 'SeBackupPrivilege' && p.enabled)) {
    return {
      allowed: true,
      reasonEn: 'SeBackupPrivilege bypasses discretionary read access controls',
      reasonAr: 'امتياز SeBackupPrivilege يتجاوز قيود القراءة التقديرية للأمان',
    };
  }

  const userSids = new Set<string>([token.userSid, ...token.groupSids]);

  // Permission hierarchy: FullControl grants Modify, Write, Read. Modify grants Write, Read.
  const permissionImplies = (perm: NtfsPermission, target: NtfsPermission): boolean => {
    if (perm === 'FullControl') return true;
    if (perm === 'Modify' && (target === 'Modify' || target === 'Write' || target === 'Read')) return true;
    if (perm === 'Write' && (target === 'Write' || target === 'Read')) return true;
    return perm === target;
  };

  // 1. Check Explicit Deny
  const explicitDeny = resource.dacl.find(
    (ace) => !ace.isInherited && ace.type === 'Deny' && userSids.has(ace.trusteeSid) && ace.permissions.some((p) => permissionImplies(p, requestedPermission))
  );
  if (explicitDeny) {
    return {
      allowed: false,
      reasonEn: `Explicit DENY ACE encountered for ${explicitDeny.trusteeName}`,
      reasonAr: `تم العثور على قاعدة منع صريحة (Explicit Deny) لـ ${explicitDeny.trusteeName}`,
      matchedAce: explicitDeny,
    };
  }

  // 2. Check Explicit Allow
  const explicitAllow = resource.dacl.find(
    (ace) => !ace.isInherited && ace.type === 'Allow' && userSids.has(ace.trusteeSid) && ace.permissions.some((p) => permissionImplies(p, requestedPermission))
  );
  if (explicitAllow) {
    return {
      allowed: true,
      reasonEn: `Explicit ALLOW ACE granted by ${explicitAllow.trusteeName}`,
      reasonAr: `تم منح الإذن بقاعدة سماح صريحة (Explicit Allow) لـ ${explicitAllow.trusteeName}`,
      matchedAce: explicitAllow,
    };
  }

  // 3. Check Inherited Deny
  const inheritedDeny = resource.dacl.find(
    (ace) => ace.isInherited && ace.type === 'Deny' && userSids.has(ace.trusteeSid) && ace.permissions.some((p) => permissionImplies(p, requestedPermission))
  );
  if (inheritedDeny) {
    return {
      allowed: false,
      reasonEn: `Inherited DENY ACE encountered from parent container for ${inheritedDeny.trusteeName}`,
      reasonAr: `تم العثور على قاعدة منع موروثة (Inherited Deny) من المجلد الأب لـ ${inheritedDeny.trusteeName}`,
      matchedAce: inheritedDeny,
    };
  }

  // 4. Check Inherited Allow
  const inheritedAllow = resource.dacl.find(
    (ace) => ace.isInherited && ace.type === 'Allow' && userSids.has(ace.trusteeSid) && ace.permissions.some((p) => permissionImplies(p, requestedPermission))
  );
  if (inheritedAllow) {
    return {
      allowed: true,
      reasonEn: `Inherited ALLOW ACE granted from parent container for ${inheritedAllow.trusteeName}`,
      reasonAr: `تم منح الإذن بقاعدة سماح موروثة (Inherited Allow) لـ ${inheritedAllow.trusteeName}`,
      matchedAce: inheritedAllow,
    };
  }

  // 5. Default: Implicit Deny
  return {
    allowed: false,
    reasonEn: 'Implicit DENY: No matching Allow ACE found in DACL for user token',
    reasonAr: 'رفض ضمني (Implicit Deny): لم يتم العثور على قاعدة سماح مطابقة في قائمة التحكم بالوصول',
  };
}

/**
 * Calculates effective NTFS permissions summary for a token on a resource.
 */
export function getEffectiveNtfsPermissions(
  resource: NtfsResource,
  token: WindowsAccessToken
): { Read: boolean; Write: boolean; Modify: boolean; FullControl: boolean } {
  return {
    Read: evaluateNtfsAccess(resource, token, 'Read').allowed,
    Write: evaluateNtfsAccess(resource, token, 'Write').allowed,
    Modify: evaluateNtfsAccess(resource, token, 'Modify').allowed,
    FullControl: evaluateNtfsAccess(resource, token, 'FullControl').allowed,
  };
}

/**
 * Toggles inheritance for a resource.
 */
export function toggleInheritance(resource: NtfsResource, parentDacl?: NtfsAce[]): NtfsResource {
  const nextInheritance = !resource.inheritanceEnabled;
  let newDacl: NtfsAce[];

  if (nextInheritance && parentDacl) {
    // Enable inheritance: import parent ACEs marked as inherited
    const inheritedAces = parentDacl.map((ace, idx) => ({
      ...ace,
      id: `ace-inh-${resource.id}-${idx}`,
      isInherited: true,
    }));
    newDacl = [...resource.dacl.filter((a) => !a.isInherited), ...inheritedAces];
  } else {
    // Disable inheritance: convert inherited ACEs into explicit or remove
    newDacl = resource.dacl.map((ace) => ({
      ...ace,
      isInherited: false,
    }));
  }

  return {
    ...resource,
    inheritanceEnabled: nextInheritance,
    dacl: newDacl,
  };
}

/**
 * Adds an ACE to resource DACL.
 */
export function addAceToResource(
  resource: NtfsResource,
  ace: Omit<NtfsAce, 'id'>
): NtfsResource {
  const newAce: NtfsAce = {
    ...ace,
    id: `ace-${resource.id}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
  };
  return {
    ...resource,
    dacl: [...resource.dacl, newAce],
  };
}

/**
 * Removes an ACE from resource DACL.
 */
export function removeAceFromResource(resource: NtfsResource, aceId: string): NtfsResource {
  return {
    ...resource,
    dacl: resource.dacl.filter((a) => a.id !== aceId),
  };
}
