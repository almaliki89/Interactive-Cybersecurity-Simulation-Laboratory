/**
 * Active Directory Master Challenge State & Production Hardening Validator
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import {
  AdObject,
  AdUser,
  AdGroup,
  AdOrganizationalUnit,
  INITIAL_DIRECTORY_OBJECTS,
} from './directory';
import { getEffectiveGroups } from './groups';
import {
  DirectoryResource,
  INITIAL_DIRECTORY_RESOURCES,
  evaluateDirectoryResourceAccess,
} from './authorization';
import { AdGpo, INITIAL_GPOS, resolveEffectivePolicies } from './gpo';
import {
  advanceKerberosProtocol,
  KerberosState,
} from './kerberos';

export interface ActiveDirectoryChallengeState {
  objects: AdObject[];
  resources: DirectoryResource[];
  gpos: AdGpo[];
}

export interface HardeningCheckDetail {
  id: string;
  titleEn: string;
  titleAr: string;
  passed: boolean;
  messageEn: string;
  messageAr: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface HardeningValidationResult {
  success: boolean;
  score: number; // 0 to 100
  passedChecks: string[];
  failedChecks: string[];
  checkDetails: HardeningCheckDetail[];
}

/**
 * Creates the initial intentionally flawed state for the Master Challenge.
 */
export function getInitialChallengeState(): ActiveDirectoryChallengeState {
  // Deep clone to ensure isolated mutations
  return {
    objects: JSON.parse(JSON.stringify(INITIAL_DIRECTORY_OBJECTS)),
    resources: JSON.parse(JSON.stringify(INITIAL_DIRECTORY_RESOURCES)),
    gpos: JSON.parse(JSON.stringify(INITIAL_GPOS)),
  };
}

/**
 * Validates the Active Directory enterprise state for Sara's HR-to-Finance migration
 * and corporate domain hardening.
 */
export function validateActiveDirectoryState(
  state: ActiveDirectoryChallengeState
): HardeningValidationResult {
  const checkDetails: HardeningCheckDetail[] = [];
  const { objects, resources, gpos } = state;

  const users = objects.filter((o): o is AdUser => o.type === 'user');
  const groups = objects.filter((o): o is AdGroup => o.type === 'group');
  const ous = objects.filter((o): o is AdOrganizationalUnit => o.type === 'ou');

  const sara = users.find((u) => u.samAccountName === 'sara');
  const tempAuditor = users.find((u) => u.samAccountName === 'temp-auditor');
  const svcBackup = users.find((u) => u.samAccountName === 'svc-sql-backup');
  const finShare = resources.find((r) => r.id === 'res-finance-share');
  const hrPayroll = resources.find((r) => r.id === 'res-hr-payroll');

  // Check 1: Sara moved to Finance OU
  const checkOuPassed = Boolean(sara && sara.ou === 'OU=Finance,DC=corp,DC=nexora,DC=local');
  checkDetails.push({
    id: 'chk-sara-ou',
    titleEn: 'Sara Moved to Finance OU',
    titleAr: 'نقل سارة إلى الوحدة التنظيمية لإدارة المالية (Finance OU)',
    passed: checkOuPassed,
    severity: 'HIGH',
    messageEn: checkOuPassed
      ? "Sara's user object is correctly situated in 'OU=Finance,DC=corp,DC=nexora,DC=local'."
      : "Sara is still situated in the old HR OU or an incorrect location.",
    messageAr: checkOuPassed
      ? "تم نقل كائن المستخدم سارة بنجاح إلى وحدة إدارة المالية."
      : "المستخدم سارة لا تزال موجودة في وحدة الموارد البشرية السابقة أو مسار غير صحيح.",
  });

  // Check 2: Sara belongs to Finance baseline groups (Finance-Users or Finance-Reporting)
  const saraEffective = sara ? getEffectiveGroups(objects, sara.sid) : [];
  const hasFinanceGroup = saraEffective.some(
    (g) => g.name === 'Finance-Users' || g.name === 'Finance-Reporting'
  );
  checkDetails.push({
    id: 'chk-sara-finance-group',
    titleEn: 'Finance Department Group Membership',
    titleAr: 'إسناد عضوية مجموعة المالية لسارة',
    passed: hasFinanceGroup,
    severity: 'CRITICAL',
    messageEn: hasFinanceGroup
      ? "Sara has effective membership in Finance department security groups."
      : "Sara lacks required membership in 'Finance-Users' or 'Finance-Reporting'.",
    messageAr: hasFinanceGroup
      ? "تمتلك سارة عضوية فعالة في مجموعات الأمان التابعة لإدارة المالية."
      : "تفتقر سارة إلى العضوية المطلوبة في 'Finance-Users' أو 'Finance-Reporting'.",
  });

  // Check 3: Sara removed from HR privileged groups (HR-Admins, HR-Managers)
  const hasHrPrivilege = saraEffective.some(
    (g) => g.name === 'HR-Admins' || g.name === 'HR-Managers'
  );
  const checkHrRemoved = !hasHrPrivilege;
  checkDetails.push({
    id: 'chk-sara-hr-revoked',
    titleEn: 'Revoke Historical HR Privileges',
    titleAr: 'سحب الصلاحيات الإدارية السابقة في الموارد البشرية',
    passed: checkHrRemoved,
    severity: 'CRITICAL',
    messageEn: checkHrRemoved
      ? "Sara's privileged access to HR administrative groups has been cleanly revoked."
      : "Vulnerability: Sara still retains privileged access to 'HR-Admins'.",
    messageAr: checkHrRemoved
      ? "تم تجريد سارة بنجاح من صلاحيات مجموعة HR-Admins الحساسة."
      : "ثغرة أمنية: لا تزال سارة تحتفظ بصلاحيات حساسة في مجموعة HR-Admins.",
  });

  // Check 4: Sara retains baseline Domain Users
  const hasDomainUsers = Boolean(sara && sara.groups.includes('Domain Users'));
  checkDetails.push({
    id: 'chk-sara-domain-users',
    titleEn: 'Baseline Domain Users Maintained',
    titleAr: 'الحفاظ على عضوية مستخدمي النطاق الأساسية',
    passed: hasDomainUsers,
    severity: 'MEDIUM',
    messageEn: hasDomainUsers
      ? "Baseline 'Domain Users' group membership is preserved."
      : "Sara was mistakenly removed from the default 'Domain Users' primary group.",
    messageAr: hasDomainUsers
      ? "تم الحفاظ على عضوية المجموعة الأساسية Domain Users."
      : "تم حذف سارة بالخطأ من مجموعة المستخدمين الافتراضية Domain Users.",
  });

  // Check 5: LEAST PRIVILEGE PRESERVED (Anti-Cheat: Sara MUST NOT be in Domain Admins / Enterprise Admins)
  const hasExcessiveAdmin = saraEffective.some(
    (g) =>
      g.name === 'Domain Admins' ||
      g.name === 'Enterprise Admins' ||
      g.name === 'Schema Admins' ||
      g.name === 'Administrators'
  );
  const checkLeastPrivilege = !hasExcessiveAdmin;
  checkDetails.push({
    id: 'chk-least-privilege',
    titleEn: 'Principle of Least Privilege Enforced',
    titleAr: 'تطبيق مبدأ الحد الأدنى من الصلاحيات (عدم منح صلاحيات مسؤول النطاق)',
    passed: checkLeastPrivilege,
    severity: 'CRITICAL',
    messageEn: checkLeastPrivilege
      ? "Sara was not over-privileged with Domain Admin or Enterprise Admin rights."
      : "CRITICAL FAILURE: Over-privilege detected! Sara was added to Domain Admins instead of precise role-based access.",
    messageAr: checkLeastPrivilege
      ? "تم الالتزام بمبدأ الحد الأدنى من الامتيازات ولم يتم منح سارة صلاحيات مدير نطاق."
      : "فشل أمني حرج: تم منح سارة صلاحيات مدير النطاق Domain Admins بشكل مفرط!",
  });

  // Check 6: Contractors removed from Finance-Share ACL
  const contractorHasFinAccess = Boolean(
    finShare &&
      finShare.dacl.some(
        (ace) =>
          ace.principalName === 'Contractors-Ext' ||
          ace.principalSid === 'S-1-5-21-392841-1401'
      )
  );
  const checkContractorRemoved = !contractorHasFinAccess;
  checkDetails.push({
    id: 'chk-contractor-fin-share',
    titleEn: 'Revoke Contractor Access to Finance Share',
    titleAr: 'حظر وصول المتعاقدين لمجلد البيانات المالية الحساسة',
    passed: checkContractorRemoved,
    severity: 'HIGH',
    messageEn: checkContractorRemoved
      ? "External Contractors group was removed from the Finance-Share DACL."
      : "Confidentiality Risk: 'Contractors-Ext' still possesses access permissions on Finance-Share.",
    messageAr: checkContractorRemoved
      ? "تم حذف مجموعة المتعاقدين الخارجيين من أذونات مجلد البيانات المالية بنجاح."
      : "مخاطرة سرية: لا تزال مجموعة المتعاقدين تمتلك إذن وصول لمجلد المالية.",
  });

  // Check 7: Stale account temp-auditor disabled
  const checkStaleDisabled = Boolean(tempAuditor && !tempAuditor.enabled);
  checkDetails.push({
    id: 'chk-stale-disabled',
    titleEn: 'Disable Stale Auditor Account',
    titleAr: 'تعطيل حساب المدقق الخارجي المهجور (temp-auditor)',
    passed: checkStaleDisabled,
    severity: 'HIGH',
    messageEn: checkStaleDisabled
      ? "Stale account 'temp-auditor' is safely disabled."
      : "Persistence Risk: Inactive account 'temp-auditor' is still active and enabled in the directory.",
    messageAr: checkStaleDisabled
      ? "تم تعطيل الحساب المهجور temp-auditor بنجاح لمنع استغلاله."
      : "مخاطرة استمرار: الحساب المهجور temp-auditor لا يزال مفعلاً في الدليل.",
  });

  // Check 8: Service account restricted (No interactive logon, removed from RDP)
  const svcHasInteractive = Boolean(svcBackup && svcBackup.allowInteractiveLogon);
  const svcHasRdp = Boolean(
    svcBackup &&
      (svcBackup.groups.includes('Remote Desktop Users') ||
        groups.find((g) => g.name === 'Remote Desktop Users')?.members.includes(svcBackup.sid))
  );
  const checkSvcHardened = !svcHasInteractive && !svcHasRdp;
  checkDetails.push({
    id: 'chk-service-account-hardened',
    titleEn: 'Harden Service Account (No Interactive / RDP)',
    titleAr: 'تحصين حساب الخدمة (حظر تسجيل الدخول التفاعلي وحذف RDP)',
    passed: checkSvcHardened,
    severity: 'CRITICAL',
    messageEn: checkSvcHardened
      ? "Service account 'svc-sql-backup' cannot log on interactively and has no RDP privileges."
      : "Credential Theft Risk: Service account allows interactive logon or retains Remote Desktop rights.",
    messageAr: checkSvcHardened
      ? "حساب الخدمة محصن تماماً: تم إلغاء تسجيل الدخول التفاعلي وسحب صلاحية RDP."
      : "مخاطرة سرقة بيانات الاعتماد: حساب الخدمة يسمح بتسجيل الدخول التفاعلي أو يمتلك صلاحيات RDP.",
  });

  // Check 9: Finance Workstations receive compliant GPO settings
  const gpoRes = resolveEffectivePolicies(
    gpos,
    ous,
    'OU=Workstations,OU=Finance,DC=corp,DC=nexora,DC=local'
  );
  const gpoCompliant = Boolean(
    gpoRes.effectiveSettings.screenLockTimeoutMinutes &&
      gpoRes.effectiveSettings.screenLockTimeoutMinutes <= 15 &&
      gpoRes.effectiveSettings.firewallEnabled === true &&
      gpoRes.effectiveSettings.usbRemovableStorageBlocked === true
  );
  checkDetails.push({
    id: 'chk-workstation-gpo',
    titleEn: 'Finance Workstation GPO Policy Compliance',
    titleAr: 'تطبيق سياسات GPO الأمنية على محطات عمل المالية',
    passed: gpoCompliant,
    severity: 'MEDIUM',
    messageEn: gpoCompliant
      ? "Effective GPO enforces screen lock <= 15m, firewall enabled, and USB storage blocked."
      : "GPO policy gap: Finance workstations lack required screen lock, firewall, or USB storage restrictions.",
    messageAr: gpoCompliant
      ? "سياسات GPO الفعالة تفرض قفل الشاشة والجدار الناري وحظر وحدات USB."
      : "فجوة في السياسات: محطات عمل المالية تفتقر إلى القيود المطلوبة في سياسات GPO.",
  });

  // Check 10: Kerberos Authentication & Finance Resource Access works for Sara
  let kerberosAuthAndAccessPassed = false;
  if (sara && finShare && hasFinanceGroup && !hasExcessiveAdmin) {
    // 1. Test Kerberos AS-REQ -> TGT
    const asRes = advanceKerberosProtocol('IDLE', {
      clientPrincipal: sara.userPrincipalName,
      targetSpn: 'cifs/fin-srv01.corp.nexora.local',
      clientVirtualTime: 100,
      kdcVirtualTime: 100,
      accountEnabled: sara.enabled,
      passwordValid: true,
      userKnown: true,
      spnKnown: true,
      kdcAvailable: true,
      pacGroups: saraEffective.map((g) => g.sid),
      encryptionType: 'AES-256',
      ticketLifetime: 600,
      maxClockSkew: 300,
      seq: 1,
    });

    if (asRes.nextState === 'AS_REQ_SENT') {
      const tgtRes = advanceKerberosProtocol(asRes.nextState, {
        clientPrincipal: sara.userPrincipalName,
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        clientVirtualTime: 100,
        kdcVirtualTime: 100,
        accountEnabled: sara.enabled,
        passwordValid: true,
        userKnown: true,
        spnKnown: true,
        kdcAvailable: true,
        pacGroups: saraEffective.map((g) => g.sid),
        encryptionType: 'AES-256',
        ticketLifetime: 600,
        maxClockSkew: 300,
        seq: 1,
      });

      // 2. Evaluate Resource Authorization with Sara's effective groups
      const accessRes = evaluateDirectoryResourceAccess(sara, saraEffective, finShare, 'Read');
      kerberosAuthAndAccessPassed = Boolean(tgtRes.ticketIssued && accessRes.allowed);
    }
  }

  checkDetails.push({
    id: 'chk-kerberos-and-authz',
    titleEn: 'End-to-End Kerberos & Finance Authorization',
    titleAr: 'اكتمال مصادقة Kerberos والتفويض لمجلد المالية بنجاح',
    passed: kerberosAuthAndAccessPassed,
    severity: 'CRITICAL',
    messageEn: kerberosAuthAndAccessPassed
      ? "Sara successfully acquired Kerberos TGT and is authorized for Read/Write on Finance-Share."
      : "End-to-end access test failed: Kerberos ticket exchange or Finance-Share authorization did not succeed.",
    messageAr: kerberosAuthAndAccessPassed
      ? "حصلت سارة بنجاح على تذكرة Kerberos وتم تفويضها للوصول إلى مجلد Finance-Share."
      : "فشل اختبار الوصول الشامل: إما تعذر تبادل تذاكر Kerberos أو تم رفض تفويض مجلد المالية.",
  });

  const passedChecks = checkDetails.filter((c) => c.passed).map((c) => c.id);
  const failedChecks = checkDetails.filter((c) => !c.passed).map((c) => c.id);
  const score = Math.round((passedChecks.length / checkDetails.length) * 100);
  const success = failedChecks.length === 0;

  return {
    success,
    score,
    passedChecks,
    failedChecks,
    checkDetails,
  };
}
