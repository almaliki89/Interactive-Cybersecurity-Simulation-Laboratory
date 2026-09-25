/**
 * Active Directory & Enterprise Security Event Log Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface ActiveDirectoryEvent {
  id: string; // Deterministic: e.g. `ad-evt-${seq}-${virtualTime}`
  eventId: number;
  channel: 'Security' | 'Directory Service' | 'System';
  provider: string;
  virtualTime: number;
  severity: 'Information' | 'Warning' | 'Error';
  subjectUser: string;
  targetUserOrObject?: string;
  computer: string;
  actionEn: string;
  actionAr: string;
  detailsEn: string;
  detailsAr: string;
  category:
    | 'Account Management'
    | 'Logon/Logoff'
    | 'Privilege Use'
    | 'Policy Change'
    | 'Directory Service Access';
}

export interface AdEventFilterOptions {
  eventId?: number;
  channel?: string;
  severity?: string;
  category?: string;
  userQuery?: string;
  searchQuery?: string;
}

export const INITIAL_AD_EVENTS: ActiveDirectoryEvent[] = [
  {
    id: 'ad-evt-001-10',
    eventId: 4720,
    channel: 'Security',
    provider: 'Microsoft-Windows-Security-Auditing',
    virtualTime: 10,
    severity: 'Information',
    subjectUser: 'bob (Domain Admin)',
    targetUserOrObject: 'temp-auditor',
    computer: 'DC01-NEXORA',
    actionEn: 'A user account was created',
    actionAr: 'تم إنشاء حساب مستخدم جديد',
    detailsEn: 'User account temp-auditor was provisioned in OU=Contractors for external compliance audit.',
    detailsAr: 'تم إنشاء حساب المستخدم temp-auditor في OU=Contractors لتدقيق الامتثال الخارجي.',
    category: 'Account Management',
  },
  {
    id: 'ad-evt-002-30',
    eventId: 4728,
    channel: 'Security',
    provider: 'Microsoft-Windows-Security-Auditing',
    virtualTime: 30,
    severity: 'Information',
    subjectUser: 'bob (Domain Admin)',
    targetUserOrObject: 'HR-Admins',
    computer: 'DC01-NEXORA',
    actionEn: 'A member was added to a security-enabled global group',
    actionAr: 'تمت إضافة عضو إلى مجموعة أمان',
    detailsEn: 'User sara added to HR-Admins privileged group.',
    detailsAr: 'تمت إضافة المستخدم sara إلى مجموعة HR-Admins ذات الصلاحيات.',
    category: 'Account Management',
  },
  {
    id: 'ad-evt-003-50',
    eventId: 4768,
    channel: 'Security',
    provider: 'Microsoft-Windows-Security-Auditing',
    virtualTime: 50,
    severity: 'Information',
    subjectUser: 'sara',
    targetUserOrObject: 'krbtgt/corp.nexora.local',
    computer: 'DC01-NEXORA',
    actionEn: 'A Kerberos authentication ticket (TGT) was requested',
    actionAr: 'تم طلب تذكرة مصادقة Kerberos (TGT)',
    detailsEn: 'Pre-authentication succeeded with AES-256. Ticket Granting Ticket issued for sara@corp.nexora.local.',
    detailsAr: 'نجحت المصادقة المسبقة بتشفير AES-256. تم إصدار تذكرة TGT للمستخدم.',
    category: 'Logon/Logoff',
  },
  {
    id: 'ad-evt-004-70',
    eventId: 4769,
    channel: 'Security',
    provider: 'Microsoft-Windows-Security-Auditing',
    virtualTime: 70,
    severity: 'Information',
    subjectUser: 'alice',
    targetUserOrObject: 'cifs/fin-srv01.corp.nexora.local',
    computer: 'DC01-NEXORA',
    actionEn: 'A Kerberos service ticket was requested',
    actionAr: 'تم طلب تذكرة خدمة Kerberos',
    detailsEn: 'Service ticket requested for file server CIFS SPN by alice. PAC embedded with Finance-Users group SID.',
    detailsAr: 'تم طلب تذكرة خدمة لـ CIFS SPN لخادم الملفات. تم تضمين معرفات مجموعة Finance-Users داخل PAC.',
    category: 'Logon/Logoff',
  },
  {
    id: 'ad-evt-005-90',
    eventId: 4771,
    channel: 'Security',
    provider: 'Microsoft-Windows-Security-Auditing',
    virtualTime: 90,
    severity: 'Warning',
    subjectUser: 'attacker-recon',
    targetUserOrObject: 'krbtgt/corp.nexora.local',
    computer: 'DC01-NEXORA',
    actionEn: 'Kerberos pre-authentication failed',
    actionAr: 'فشلت المصادقة المسبقة لـ Kerberos',
    detailsEn: 'Pre-auth failed: Client presented incorrect encryption key / password mismatch (Error 0x18).',
    detailsAr: 'فشلت المصادقة المسبقة: قدم العميل مفتاح تشفير غير صحيح أو كلمة مرور خاطئة (رمز 0x18).',
    category: 'Logon/Logoff',
  },
  {
    id: 'ad-evt-006-110',
    eventId: 5136,
    channel: 'Directory Service',
    provider: 'Microsoft-Windows-ActiveDirectory_DomainService',
    virtualTime: 110,
    severity: 'Information',
    subjectUser: 'bob (Domain Admin)',
    targetUserOrObject: 'OU=Finance,DC=corp,DC=nexora,DC=local',
    computer: 'DC01-NEXORA',
    actionEn: 'A directory service object was modified',
    actionAr: 'تم تعديل كائن في خدمة الدليل',
    detailsEn: 'Attribute gPLink on OU=Finance updated with GPO {gpo-finance-security}.',
    detailsAr: 'تم تحديث خاصية gPLink على OU=Finance بربط السياسة {gpo-finance-security}.',
    category: 'Directory Service Access',
  },
];

/**
 * Creates a deterministic Active Directory Event record.
 */
export function createAdEvent(
  eventId: number,
  channel: 'Security' | 'Directory Service' | 'System',
  severity: 'Information' | 'Warning' | 'Error',
  subjectUser: string,
  computer: string,
  actionEn: string,
  actionAr: string,
  detailsEn: string,
  detailsAr: string,
  category: ActiveDirectoryEvent['category'],
  virtualTime: number,
  seq: number = 1,
  targetUserOrObject?: string
): ActiveDirectoryEvent {
  return {
    id: `ad-evt-${String(seq).padStart(3, '0')}-${virtualTime}`,
    eventId,
    channel,
    provider:
      channel === 'Directory Service'
        ? 'Microsoft-Windows-ActiveDirectory_DomainService'
        : 'Microsoft-Windows-Security-Auditing',
    virtualTime,
    severity,
    subjectUser,
    targetUserOrObject,
    computer,
    actionEn,
    actionAr,
    detailsEn,
    detailsAr,
    category,
  };
}

/**
 * Filters Active Directory events based on user-selected criteria.
 */
export function filterAdEvents(
  events: ActiveDirectoryEvent[],
  opts: AdEventFilterOptions
): ActiveDirectoryEvent[] {
  return events.filter((evt) => {
    if (opts.eventId && evt.eventId !== opts.eventId) {
      return false;
    }
    if (opts.channel && opts.channel !== 'ALL' && evt.channel !== opts.channel) {
      return false;
    }
    if (opts.severity && opts.severity !== 'ALL' && evt.severity !== opts.severity) {
      return false;
    }
    if (opts.category && opts.category !== 'ALL' && evt.category !== opts.category) {
      return false;
    }
    if (opts.userQuery && opts.userQuery.trim()) {
      const q = opts.userQuery.trim().toLowerCase();
      const matchSub = evt.subjectUser.toLowerCase().includes(q);
      const matchTar = evt.targetUserOrObject?.toLowerCase().includes(q);
      if (!matchSub && !matchTar) return false;
    }
    if (opts.searchQuery && opts.searchQuery.trim()) {
      const q = opts.searchQuery.trim().toLowerCase();
      const inAction = evt.actionEn.toLowerCase().includes(q) || evt.actionAr.toLowerCase().includes(q);
      const inDetails = evt.detailsEn.toLowerCase().includes(q) || evt.detailsAr.toLowerCase().includes(q);
      const inComputer = evt.computer.toLowerCase().includes(q);
      if (!inAction && !inDetails && !inComputer && String(evt.eventId) !== q) {
        return false;
      }
    }
    return true;
  });
}
