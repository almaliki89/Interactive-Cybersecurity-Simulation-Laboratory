import { WindowsUser, WindowsGroup, WELL_KNOWN_SIDS } from './identity';
import { NtfsResource } from './ntfs';
import { WindowsService, isPathUnquotedWithSpaces } from './services';
import { WindowsFirewallState } from './firewall';

export interface WindowsHardeningState {
  users: WindowsUser[];
  groups: WindowsGroup[];
  ntfsResources: NtfsResource[];
  services: WindowsService[];
  firewallState: WindowsFirewallState;
  auditPolicies: {
    auditLogonEvents: boolean;
    auditProcessCreation: boolean;
    auditPrivilegeUse: boolean;
  };
}

export interface WindowsHardeningCheckDetail {
  id: string;
  nameEn: string;
  nameAr: string;
  passed: boolean;
  score: number;
  maxScore: number;
  messageEn: string;
  messageAr: string;
}

export interface WindowsHardeningValidationResult {
  success: boolean;
  score: number;
  passedChecks: string[];
  failedChecks: string[];
  checkDetails: WindowsHardeningCheckDetail[];
}

/**
 * Validates the complete Windows security posture against CIS Benchmark
 * and Windows Security Hardening best practices.
 */
export function validateWindowsHardeningState(
  state: WindowsHardeningState
): WindowsHardeningValidationResult {
  const checkDetails: WindowsHardeningCheckDetail[] = [];
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  let totalScore = 0;

  // 1. Check Guest Account status: must be disabled
  const guestUser = state.users.find((u) => u.username.toLowerCase() === 'guest');
  const isGuestDisabled = guestUser ? !guestUser.enabled : true;
  const guestMaxScore = 15;
  if (isGuestDisabled) {
    passedChecks.push('guest_account_disabled');
    totalScore += guestMaxScore;
    checkDetails.push({
      id: 'guest_account_disabled',
      nameEn: 'Disable Built-in Guest Account',
      nameAr: 'تعطيل حساب الضيف المدمج (Guest)',
      passed: true,
      score: guestMaxScore,
      maxScore: guestMaxScore,
      messageEn: 'The built-in Guest account is securely disabled, preventing anonymous console access.',
      messageAr: 'حساب الضيف المدمج معطل بأمان، مما يمنع الدخول المجهول لمحطة العمل.',
    });
  } else {
    failedChecks.push('guest_account_disabled');
    checkDetails.push({
      id: 'guest_account_disabled',
      nameEn: 'Disable Built-in Guest Account',
      nameAr: 'تعطيل حساب الضيف المدمج (Guest)',
      passed: false,
      score: 0,
      maxScore: guestMaxScore,
      messageEn: 'High Risk: Built-in Guest account is currently ENABLED. Disable it in Accounts & Groups.',
      messageAr: 'خطر مرتفع: حساب الضيف مفعل حالياً. يجب تعطيله في تبويب المستخدمين والمجموعات.',
    });
  }

  // 2. Check Bob's excessive privilege: must NOT be in Administrators group
  const bobUser = state.users.find((u) => u.username.toLowerCase() === 'bob');
  const adminGroup = state.groups.find((g) => g.sid === WELL_KNOWN_SIDS.ADMINISTRATORS);
  const isBobInAdmin = Boolean(
    (bobUser && bobUser.groupSids.includes(WELL_KNOWN_SIDS.ADMINISTRATORS)) ||
    (adminGroup && bobUser && adminGroup.memberSids.includes(bobUser.sid))
  );
  const bobMaxScore = 15;
  if (!isBobInAdmin) {
    passedChecks.push('bob_least_privilege');
    totalScore += bobMaxScore;
    checkDetails.push({
      id: 'bob_least_privilege',
      nameEn: 'Enforce Least Privilege for Bob',
      nameAr: 'فرض مبدأ الحد الأدنى من الصلاحيات للحساب Bob',
      passed: true,
      score: bobMaxScore,
      maxScore: bobMaxScore,
      messageEn: 'Bob has been removed from Administrators and operates as a standard unprivileged user.',
      messageAr: 'تمت إزالة الحساب Bob من مجموعة المسؤولين ويعمل الآن بحساب مستخدم قياسي محدود الصلاحيات.',
    });
  } else {
    failedChecks.push('bob_least_privilege');
    checkDetails.push({
      id: 'bob_least_privilege',
      nameEn: 'Enforce Least Privilege for Bob',
      nameAr: 'فرض مبدأ الحد الأدنى من الصلاحيات للحساب Bob',
      passed: false,
      score: 0,
      maxScore: bobMaxScore,
      messageEn: 'Excessive Privilege: Bob still possesses local Administrator membership. Revoke it.',
      messageAr: 'صلاحيات مفرطة: الحساب Bob لا يزال عضواً في مجموعة المسؤولين المحلية Administrators.',
    });
  }

  // 3. Dangerous Legacy Telnet Service: must be stopped and disabled
  const telnetSvc = state.services.find(
    (s) => s.serviceName === 'TlntSvr' || s.displayName.toLowerCase().includes('telnet')
  );
  const isTelnetSecure = telnetSvc
    ? telnetSvc.status === 'Stopped' && telnetSvc.startupType === 'Disabled'
    : true;
  const telnetMaxScore = 15;
  if (isTelnetSecure) {
    passedChecks.push('telnet_service_disabled');
    totalScore += telnetMaxScore;
    checkDetails.push({
      id: 'telnet_service_disabled',
      nameEn: 'Disable Insecure Telnet Service',
      nameAr: 'إيقاف وتعطيل خدمة Telnet غير الآمنة',
      passed: true,
      score: telnetMaxScore,
      maxScore: telnetMaxScore,
      messageEn: 'Insecure plaintext Telnet service is stopped and set to Disabled startup.',
      messageAr: 'تم إيقاف خدمة Telnet غير المشفرة وضبط بدء تشغيلها على وضع التعطيل (Disabled).',
    });
  } else {
    failedChecks.push('telnet_service_disabled');
    checkDetails.push({
      id: 'telnet_service_disabled',
      nameEn: 'Disable Insecure Telnet Service',
      nameAr: 'إيقاف وتعطيل خدمة Telnet غير الآمنة',
      passed: false,
      score: 0,
      maxScore: telnetMaxScore,
      messageEn: `Vulnerability: Telnet service is ${telnetSvc?.status} with ${telnetSvc?.startupType} startup. Stop and disable it.`,
      messageAr: `ثغرة أمنية: خدمة Telnet حالتها ${telnetSvc?.status} ونوع بدئها ${telnetSvc?.startupType}. يجب إيقافها وتعطيلها.`,
    });
  }

  // 4. Unquoted Service Path Vulnerability
  const unquotedSvcs = state.services.filter(
    (s) => s.isVulnerableUnquotedPath || isPathUnquotedWithSpaces(s.binaryPath)
  );
  const unquotedMaxScore = 15;
  if (unquotedSvcs.length === 0) {
    passedChecks.push('unquoted_service_path_fixed');
    totalScore += unquotedMaxScore;
    checkDetails.push({
      id: 'unquoted_service_path_fixed',
      nameEn: 'Fix Unquoted Service Paths',
      nameAr: 'معالجة ثغرة مسارات الخدمات غير المقتبسة (Unquoted Paths)',
      passed: true,
      score: unquotedMaxScore,
      maxScore: unquotedMaxScore,
      messageEn: 'All service executable binary paths are securely wrapped in double quotes.',
      messageAr: 'كافة مسارات الملفات التنفيذية للخدمات محاطة باقتباسات مزدوجة لمنع حقن وتنفيذ البرمجيات.',
    });
  } else {
    failedChecks.push('unquoted_service_path_fixed');
    checkDetails.push({
      id: 'unquoted_service_path_fixed',
      nameEn: 'Fix Unquoted Service Paths',
      nameAr: 'معالجة ثغرة مسارات الخدمات غير المقتبسة (Unquoted Paths)',
      passed: false,
      score: 0,
      maxScore: unquotedMaxScore,
      messageEn: `Privilege Escalation Risk: Service "${unquotedSvcs[0].displayName}" has an unquoted path containing spaces.`,
      messageAr: `خطر تصعيد الصلاحيات: الخدمة "${unquotedSvcs[0].displayName}" تحتوي على مسار غير محاط باقتباسات وبداخله مسافات.`,
    });
  }

  // 5. C:\Confidential NTFS DACL Permissions: Everyone should NOT have Write or FullControl
  const confDir = state.ntfsResources.find((r) => r.path === 'C:\\Confidential');
  let isConfidentialSecure = false;
  if (confDir) {
    const everyoneAce = confDir.dacl.find((ace) => ace.trusteeSid === WELL_KNOWN_SIDS.EVERYONE);
    if (!everyoneAce) {
      isConfidentialSecure = true; // Everyone ACE removed completely
    } else {
      // If Everyone ACE exists, it must not allow FullControl, Modify, or Write
      const hasDangerousPerm = everyoneAce.permissions.some(
        (p) => p === 'FullControl' || p === 'Modify' || p === 'Write'
      );
      isConfidentialSecure = !hasDangerousPerm && everyoneAce.type === 'Allow';
    }
  }
  const ntfsMaxScore = 15;
  if (isConfidentialSecure) {
    passedChecks.push('ntfs_confidential_hardened');
    totalScore += ntfsMaxScore;
    checkDetails.push({
      id: 'ntfs_confidential_hardened',
      nameEn: 'Harden C:\\Confidential NTFS Permissions',
      nameAr: 'تحصين أذونات NTFS لمجلد C:\\Confidential',
      passed: true,
      score: ntfsMaxScore,
      maxScore: ntfsMaxScore,
      messageEn: 'Dangerous "Everyone" FullControl/Write permission removed from confidential folder DACL.',
      messageAr: 'تمت إزالة أذونات التحكم الكامل والكتابة الممنوحة لمجموعة Everyone من المجلد الحساس.',
    });
  } else {
    failedChecks.push('ntfs_confidential_hardened');
    checkDetails.push({
      id: 'ntfs_confidential_hardened',
      nameEn: 'Harden C:\\Confidential NTFS Permissions',
      nameAr: 'تحصين أذونات NTFS لمجلد C:\\Confidential',
      passed: false,
      score: 0,
      maxScore: ntfsMaxScore,
      messageEn: 'Information Leakage Risk: "Everyone" group still has write or full control on C:\\Confidential.',
      messageAr: 'خطر تسريب وتعديل البيانات: مجموعة Everyone لا تزال تمتلك أذونات كتابة أو تحكم كامل على C:\\Confidential.',
    });
  }

  // 6. Windows Firewall: All profiles enabled and insecure Inbound SMB/Telnet blocked on Public
  const allProfilesActive =
    state.firewallState.profilesEnabled.Domain &&
    state.firewallState.profilesEnabled.Private &&
    state.firewallState.profilesEnabled.Public;

  // Check that SMB port 445 is not open unconditionally to 'Any' on Public profile
  const smbInbound = state.firewallState.rules.find(
    (r) => r.enabled && r.direction === 'Inbound' && r.action === 'Allow' && r.localPort === 445 && r.profiles.includes('Public')
  );
  // Check that Telnet rule is disabled or removed
  const telnetFwRule = state.firewallState.rules.find(
    (r) => r.enabled && r.direction === 'Inbound' && r.action === 'Allow' && r.localPort === 23
  );

  const isFirewallHardened = allProfilesActive && !smbInbound && !telnetFwRule;
  const fwMaxScore = 15;
  if (isFirewallHardened) {
    passedChecks.push('firewall_perimeter_hardened');
    totalScore += fwMaxScore;
    checkDetails.push({
      id: 'firewall_perimeter_hardened',
      nameEn: 'Hardened Windows Firewall Profiles & Rules',
      nameAr: 'تحصين ملفات وقواعد جدار حماية ويندوز',
      passed: true,
      score: fwMaxScore,
      maxScore: fwMaxScore,
      messageEn: 'All firewall profiles are enabled and high-risk ports (SMB 445 & Telnet 23) are blocked on Public.',
      messageAr: 'كافة ملفات جدار الحماية مفعلة، والمنافذ عالية الخطورة (SMB 445 و Telnet 23) محظورة على الشبكة العامة.',
    });
  } else {
    failedChecks.push('firewall_perimeter_hardened');
    let fwReason = '';
    if (!allProfilesActive) fwReason = 'One or more firewall profiles (Domain/Private/Public) are disabled.';
    else if (smbInbound) fwReason = 'Inbound SMB (Port 445) is exposed to Public profile.';
    else if (telnetFwRule) fwReason = 'Inbound Telnet rule (Port 23) is still active.';

    checkDetails.push({
      id: 'firewall_perimeter_hardened',
      nameEn: 'Hardened Windows Firewall Profiles & Rules',
      nameAr: 'تحصين ملفات وقواعد جدار حماية ويندوز',
      passed: false,
      score: 0,
      maxScore: fwMaxScore,
      messageEn: `Firewall Exposure: ${fwReason}`,
      messageAr: `ثغرة في جدار الحماية: ${fwReason}`,
    });
  }

  // 7. Audit Policy: Process Creation Auditing (Event 4688) must be enabled
  const isAuditingEnabled = state.auditPolicies.auditProcessCreation && state.auditPolicies.auditLogonEvents;
  const auditMaxScore = 10;
  if (isAuditingEnabled) {
    passedChecks.push('process_auditing_enabled');
    totalScore += auditMaxScore;
    checkDetails.push({
      id: 'process_auditing_enabled',
      nameEn: 'Enable Process Creation & Logon Auditing',
      nameAr: 'تفعيل تدقيق إنشاء العمليات (Event 4688) وتسجيل الدخول',
      passed: true,
      score: auditMaxScore,
      maxScore: auditMaxScore,
      messageEn: 'Advanced audit logging is active for Process Creation (Event 4688) and Logon Events (Event 4624/4625).',
      messageAr: 'سجلات التدقيق المتقدمة نشطة لتتبع إنشاء العمليات (4688) وأحداث تسجيل الدخول (4624/4625).',
    });
  } else {
    failedChecks.push('process_auditing_enabled');
    checkDetails.push({
      id: 'process_auditing_enabled',
      nameEn: 'Enable Process Creation & Logon Auditing',
      nameAr: 'تفعيل تدقيق إنشاء العمليات (Event 4688) وتسجيل الدخول',
      passed: false,
      score: 0,
      maxScore: auditMaxScore,
      messageEn: 'Blind Spot: Process Creation Auditing or Logon Auditing is disabled.',
      messageAr: 'نقطة عمياء: تدقيق إنشاء العمليات أو تدقيق تسجيل الدخول معطل حالياً.',
    });
  }

  const success = failedChecks.length === 0 && totalScore === 100;

  return {
    success,
    score: totalScore,
    passedChecks,
    failedChecks,
    checkDetails,
  };
}
