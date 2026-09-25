export interface WindowsUser {
  id: string;
  username: string;
  fullName: string;
  sid: string;
  enabled: boolean;
  isBuiltIn: boolean;
  passwordNeverExpires: boolean;
  primaryGroupSid: string;
  groupSids: string[];
  canInteractiveLogon: boolean;
  descriptionEn: string;
  descriptionAr: string;
}

export interface WindowsGroup {
  id: string;
  name: string;
  sid: string;
  descriptionEn: string;
  descriptionAr: string;
  isBuiltIn: boolean;
  memberSids: string[];
}

// Well-Known Windows SIDs
export const WELL_KNOWN_SIDS = {
  EVERYONE: 'S-1-1-0',
  AUTHENTICATED_USERS: 'S-1-5-11',
  LOCAL_SYSTEM: 'S-1-5-18',
  LOCAL_SERVICE: 'S-1-5-19',
  NETWORK_SERVICE: 'S-1-5-20',
  ADMINISTRATORS: 'S-1-5-32-544',
  USERS: 'S-1-5-32-545',
  GUESTS: 'S-1-5-32-546',
  BACKUP_OPERATORS: 'S-1-5-32-551',
  REMOTE_DESKTOP_USERS: 'S-1-5-32-555',
  FINANCE: 'S-1-5-21-99887766-101',
  HELPDESK: 'S-1-5-21-99887766-102',
} as const;

export const INITIAL_WINDOWS_GROUPS: WindowsGroup[] = [
  {
    id: 'grp-admins',
    name: 'Administrators',
    sid: WELL_KNOWN_SIDS.ADMINISTRATORS,
    descriptionEn: 'Built-in administrators group with full control over the local computer',
    descriptionAr: 'مجموعة المسؤولين المدمجة ذات التحكم الكامل في الحاسوب المحلي',
    isBuiltIn: true,
    memberSids: ['S-1-5-21-1001', 'S-1-5-21-1002'],
  },
  {
    id: 'grp-users',
    name: 'Users',
    sid: WELL_KNOWN_SIDS.USERS,
    descriptionEn: 'Standard unprivileged users who cannot make system-wide changes',
    descriptionAr: 'المستخدمون القياسيون العاديون الذين لا يمكنهم إجراء تغييرات على النظام',
    isBuiltIn: true,
    memberSids: ['S-1-5-21-1001', 'S-1-5-21-1002', 'S-1-5-21-1003', 'S-1-5-21-1005'],
  },
  {
    id: 'grp-rdp',
    name: 'Remote Desktop Users',
    sid: WELL_KNOWN_SIDS.REMOTE_DESKTOP_USERS,
    descriptionEn: 'Members are granted the right to log on remotely via RDP (Port 3389)',
    descriptionAr: 'أعضاء يُمنحون حق تسجيل الدخول عن بعد عبر سطح المكتب البعيد RDP',
    isBuiltIn: true,
    memberSids: ['S-1-5-21-1001', 'S-1-5-21-1005'],
  },
  {
    id: 'grp-finance',
    name: 'Finance',
    sid: WELL_KNOWN_SIDS.FINANCE,
    descriptionEn: 'Departmental group with access to payroll and confidential ledger files',
    descriptionAr: 'مجموعة قسم المالية المخولة بالوصول إلى مسيرات الرواتب والسجلات السرية',
    isBuiltIn: false,
    memberSids: ['S-1-5-21-1003'],
  },
  {
    id: 'grp-helpdesk',
    name: 'Helpdesk',
    sid: WELL_KNOWN_SIDS.HELPDESK,
    descriptionEn: 'Support specialists with limited troubleshooting privileges',
    descriptionAr: 'أخصائيو الدعم الفني ذوو صلاحيات محدودة لحل المشكلات',
    isBuiltIn: false,
    memberSids: ['S-1-5-21-1005'],
  },
  {
    id: 'grp-backup',
    name: 'Backup Operators',
    sid: WELL_KNOWN_SIDS.BACKUP_OPERATORS,
    descriptionEn: 'Can override read and write permissions to backup and restore files',
    descriptionAr: 'مشغلو النسخ الاحتياطي القادرون على تجاوز قيود القراءة للملفات',
    isBuiltIn: true,
    memberSids: [],
  },
  {
    id: 'grp-guests',
    name: 'Guests',
    sid: WELL_KNOWN_SIDS.GUESTS,
    descriptionEn: 'Temporary guest users with minimal transient access rights',
    descriptionAr: 'حسابات الضيوف المؤقتة بأدنى حد من صلاحيات الوصول العابرة',
    isBuiltIn: true,
    memberSids: ['S-1-5-21-1004'],
  },
];

export const INITIAL_WINDOWS_USERS: WindowsUser[] = [
  {
    id: 'usr-alice',
    username: 'alice',
    fullName: 'Alice Morgan (DevSecOps Lead)',
    sid: 'S-1-5-21-1001',
    enabled: true,
    isBuiltIn: false,
    passwordNeverExpires: false,
    primaryGroupSid: WELL_KNOWN_SIDS.USERS,
    groupSids: [WELL_KNOWN_SIDS.USERS, WELL_KNOWN_SIDS.ADMINISTRATORS, WELL_KNOWN_SIDS.REMOTE_DESKTOP_USERS],
    canInteractiveLogon: true,
    descriptionEn: 'Local system administrator and developer',
    descriptionAr: 'مسؤولة النظام ومطورة البرمجيات المحلية',
  },
  {
    id: 'usr-bob',
    username: 'bob',
    fullName: 'Bob Davis (Junior Intern)',
    sid: 'S-1-5-21-1002',
    enabled: true,
    isBuiltIn: false,
    passwordNeverExpires: true,
    primaryGroupSid: WELL_KNOWN_SIDS.USERS,
    // Note: Initially bob might be mistakenly in Administrators (a hardening challenge finding!)
    groupSids: [WELL_KNOWN_SIDS.USERS, WELL_KNOWN_SIDS.ADMINISTRATORS],
    canInteractiveLogon: true,
    descriptionEn: 'Junior technician with excessive administrator permissions',
    descriptionAr: 'متدرب صاعد يمتلك صلاحيات إدارة مفرطة بالخطأ',
  },
  {
    id: 'usr-finance',
    username: 'finance-admin',
    fullName: 'Clara Chen (Finance Controller)',
    sid: 'S-1-5-21-1003',
    enabled: true,
    isBuiltIn: false,
    passwordNeverExpires: false,
    primaryGroupSid: WELL_KNOWN_SIDS.USERS,
    groupSids: [WELL_KNOWN_SIDS.USERS, WELL_KNOWN_SIDS.FINANCE],
    canInteractiveLogon: true,
    descriptionEn: 'Manages ledger and confidential corporate budgets',
    descriptionAr: 'تدير السجلات والميزانيات السرية للشركة',
  },
  {
    id: 'usr-guest',
    username: 'Guest',
    fullName: 'Built-in Guest Account',
    sid: 'S-1-5-21-1004',
    enabled: true, // Vulnerable configuration: Guest should be disabled!
    isBuiltIn: true,
    passwordNeverExpires: true,
    primaryGroupSid: WELL_KNOWN_SIDS.GUESTS,
    groupSids: [WELL_KNOWN_SIDS.GUESTS],
    canInteractiveLogon: false,
    descriptionEn: 'Built-in account for guest access to the workstation',
    descriptionAr: 'حساب مدمج لوصول الضيوف إلى محطة العمل',
  },
  {
    id: 'usr-helpdesk',
    username: 'helpdesk',
    fullName: 'Tariq Al-Mansoor (IT Support)',
    sid: 'S-1-5-21-1005',
    enabled: true,
    isBuiltIn: false,
    passwordNeverExpires: false,
    primaryGroupSid: WELL_KNOWN_SIDS.USERS,
    groupSids: [WELL_KNOWN_SIDS.USERS, WELL_KNOWN_SIDS.HELPDESK, WELL_KNOWN_SIDS.REMOTE_DESKTOP_USERS],
    canInteractiveLogon: true,
    descriptionEn: 'First line IT helpdesk with Remote Desktop privileges',
    descriptionAr: 'الدعم الفني للخط الأول مع صلاحيات الدخول عن بعد RDP',
  },
  {
    id: 'usr-svc-web',
    username: 'service-web',
    fullName: 'IIS Web Worker Identity',
    sid: 'S-1-5-21-1006',
    enabled: true,
    isBuiltIn: false,
    passwordNeverExpires: true,
    primaryGroupSid: WELL_KNOWN_SIDS.USERS,
    groupSids: [WELL_KNOWN_SIDS.USERS],
    canInteractiveLogon: false,
    descriptionEn: 'Service account used to run internal web portal services',
    descriptionAr: 'حساب خدمة لتشغيل تطبيقات وبوابة الويب الداخلية',
  },
];

/**
 * Returns all effective groups for a Windows user,
 * including primary group and implicit well-known groups (e.g. Everyone, Authenticated Users).
 */
export function getEffectiveWindowsGroups(user: WindowsUser, allGroups: WindowsGroup[]): WindowsGroup[] {
  const activeSids = new Set<string>();

  // Add user explicit groups
  user.groupSids.forEach((sid) => activeSids.add(sid));
  if (user.primaryGroupSid) {
    activeSids.add(user.primaryGroupSid);
  }

  // Implicit groups assigned by the LSA / Security subsystem upon authentication
  activeSids.add(WELL_KNOWN_SIDS.EVERYONE);
  if (user.enabled && user.username !== 'Guest') {
    activeSids.add(WELL_KNOWN_SIDS.AUTHENTICATED_USERS);
  }

  const result: WindowsGroup[] = [];

  // Match existing known groups
  for (const group of allGroups) {
    if (activeSids.has(group.sid)) {
      result.push(group);
    }
  }

  // Add synthetic Everyone group if not in list
  if (!result.some((g) => g.sid === WELL_KNOWN_SIDS.EVERYONE)) {
    result.push({
      id: 'grp-everyone',
      name: 'Everyone',
      sid: WELL_KNOWN_SIDS.EVERYONE,
      descriptionEn: 'All users including anonymous and guests',
      descriptionAr: 'كافة المستخدمين بما فيهم المجهولين والضيوف',
      isBuiltIn: true,
      memberSids: [],
    });
  }

  // Add synthetic Authenticated Users if applicable
  if (activeSids.has(WELL_KNOWN_SIDS.AUTHENTICATED_USERS) && !result.some((g) => g.sid === WELL_KNOWN_SIDS.AUTHENTICATED_USERS)) {
    result.push({
      id: 'grp-auth-users',
      name: 'Authenticated Users',
      sid: WELL_KNOWN_SIDS.AUTHENTICATED_USERS,
      descriptionEn: 'All users whose identity has been verified by Windows',
      descriptionAr: 'جميع المستخدمين الذين تم التحقق من هويتهم بواسطة نظام ويندوز',
      isBuiltIn: true,
      memberSids: [],
    });
  }

  return result;
}

/**
 * Checks whether a user is an effective Local Administrator.
 */
export function isLocalAdministrator(user: WindowsUser, allGroups: WindowsGroup[]): boolean {
  if (!user.enabled) return false;
  const effective = getEffectiveWindowsGroups(user, allGroups);
  return effective.some((g) => g.sid === WELL_KNOWN_SIDS.ADMINISTRATORS);
}

/**
 * Checks if a user is permitted to perform an interactive logon (console or RDP).
 */
export function canLogOnInteractively(user: WindowsUser, allGroups: WindowsGroup[]): boolean {
  if (!user.enabled) return false;
  if (!user.canInteractiveLogon) return false;

  const effective = getEffectiveWindowsGroups(user, allGroups);
  const isMemberOfAdmins = effective.some((g) => g.sid === WELL_KNOWN_SIDS.ADMINISTRATORS);
  const isMemberOfUsers = effective.some((g) => g.sid === WELL_KNOWN_SIDS.USERS);

  return isMemberOfAdmins || isMemberOfUsers;
}

/**
 * Creates a new Windows user safely with a unique SID.
 */
export function createWindowsUser(
  users: WindowsUser[],
  username: string,
  options: Partial<WindowsUser> = {}
): WindowsUser[] {
  const trimmed = username.trim().toLowerCase();
  if (!trimmed || users.some((u) => u.username.toLowerCase() === trimmed)) {
    return users;
  }

  const nextId = users.length + 1001;
  const newSid = `S-1-5-21-99887766-${nextId}`;

  const newUser: WindowsUser = {
    id: `usr-${trimmed}`,
    username: trimmed,
    fullName: options.fullName || trimmed,
    sid: newSid,
    enabled: options.enabled ?? true,
    isBuiltIn: false,
    passwordNeverExpires: options.passwordNeverExpires ?? false,
    primaryGroupSid: options.primaryGroupSid || WELL_KNOWN_SIDS.USERS,
    groupSids: options.groupSids || [WELL_KNOWN_SIDS.USERS],
    canInteractiveLogon: options.canInteractiveLogon ?? true,
    descriptionEn: options.descriptionEn || `Local user account for ${trimmed}`,
    descriptionAr: options.descriptionAr || `حساب مستخدم محلي للمستخدم ${trimmed}`,
  };

  return [...users, newUser];
}
