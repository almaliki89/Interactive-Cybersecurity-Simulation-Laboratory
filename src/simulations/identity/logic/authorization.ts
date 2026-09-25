/**
 * Active Directory Authentication vs Authorization Decision Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { AdUser, AdGroup } from './directory';

export type ResourcePermission = 'Read' | 'Write' | 'Modify' | 'FullControl';

export interface ResourceAce {
  id: string;
  principalSid: string;
  principalName: string;
  type: 'Allow' | 'Deny';
  permissions: ResourcePermission[];
  inherited: boolean;
}

export interface DirectoryResource {
  id: string;
  name: string;
  path: string;
  department: string;
  descriptionEn: string;
  descriptionAr: string;
  dacl: ResourceAce[];
}

export interface AccessEvaluationResult {
  allowed: boolean;
  authenticated: boolean;
  effectiveGroups: string[];
  matchedRule?: ResourceAce;
  reasonEn: string;
  reasonAr: string;
  stepExplanationEn: string[];
  stepExplanationAr: string[];
}

export const INITIAL_DIRECTORY_RESOURCES: DirectoryResource[] = [
  {
    id: 'res-finance-share',
    name: 'Finance General Share',
    path: '\\\\corp.nexora.local\\Finance-Share\\Ledgers',
    department: 'Finance',
    descriptionEn: 'Confidential corporate balance sheets, invoices, and accounting journals',
    descriptionAr: 'الميزانيات العمومية السرية للمؤسسة، الفواتير، وسجلات المحاسبة',
    dacl: [
      {
        id: 'ace-fin-01',
        principalSid: 'S-1-5-21-392841-1102', // Finance-Reporting
        principalName: 'Finance-Reporting',
        type: 'Allow',
        permissions: ['Read'],
        inherited: false,
      },
      {
        id: 'ace-fin-02',
        principalSid: 'S-1-5-21-392841-1101', // Finance-Users
        principalName: 'Finance-Users',
        type: 'Allow',
        permissions: ['Read', 'Write'],
        inherited: false,
      },
      {
        id: 'ace-fin-03',
        principalSid: 'S-1-5-21-392841-1401', // Contractors-Ext (Flawed state in challenge)
        principalName: 'Contractors-Ext',
        type: 'Allow',
        permissions: ['Read', 'Write'],
        inherited: false,
      },
    ],
  },
  {
    id: 'res-hr-payroll',
    name: 'HR Confidential Payroll',
    path: '\\\\corp.nexora.local\\HR-Share\\Payroll-Executive',
    department: 'HR',
    descriptionEn: 'Executive salary compensation, equity grants, and private personnel records',
    descriptionAr: 'تعويضات ورواتب الإدارة العليا، حوافز الأسهم، وسجلات الموظفين السرية',
    dacl: [
      {
        id: 'ace-hr-01',
        principalSid: 'S-1-5-21-392841-1202', // HR-Admins
        principalName: 'HR-Admins',
        type: 'Allow',
        permissions: ['Read', 'Write', 'Modify', 'FullControl'],
        inherited: false,
      },
      {
        id: 'ace-hr-02',
        principalSid: 'S-1-5-21-392841-1201', // HR-Users
        principalName: 'HR-Users',
        type: 'Allow',
        permissions: ['Read'],
        inherited: false,
      },
      {
        id: 'ace-hr-03',
        principalSid: 'S-1-5-21-392841-1401', // Contractors-Ext
        principalName: 'Contractors-Ext',
        type: 'Deny',
        permissions: ['Read', 'Write', 'Modify', 'FullControl'],
        inherited: false,
      },
    ],
  },
  {
    id: 'res-it-tools',
    name: 'IT Infrastructure Tools',
    path: '\\\\corp.nexora.local\\IT-Share\\Deployments',
    department: 'IT',
    descriptionEn: 'Domain controller deployment scripts, GPO backup packages, and management binaries',
    descriptionAr: 'سكربتات نشر خوادم النطاق، حزم النسخ الاحتياطي لـ GPO، وأدوات الإدارة',
    dacl: [
      {
        id: 'ace-it-01',
        principalSid: 'S-1-5-21-392841-512', // Domain Admins
        principalName: 'Domain Admins',
        type: 'Allow',
        permissions: ['Read', 'Write', 'Modify', 'FullControl'],
        inherited: false,
      },
      {
        id: 'ace-it-02',
        principalSid: 'S-1-5-21-392841-1301', // IT-Operations
        principalName: 'IT-Operations',
        type: 'Allow',
        permissions: ['Read', 'Write'],
        inherited: false,
      },
    ],
  },
];

/**
 * Evaluates whether an authenticated user is authorized to access a Directory Resource.
 * Explicitly separates Authentication from Authorization.
 */
export function evaluateDirectoryResourceAccess(
  user: AdUser,
  effectiveGroups: AdGroup[],
  resource: DirectoryResource,
  requestedPermission: ResourcePermission = 'Read'
): AccessEvaluationResult {
  const stepsEn: string[] = [];
  const stepsAr: string[] = [];

  // 1. Authentication Phase
  stepsEn.push(`Step 1 (Authentication): Verifying user identity '${user.samAccountName}' (${user.displayName}).`);
  stepsAr.push(`الخطوة 1 (المصادقة): التحقق من هوية المستخدم '${user.samAccountName}' (${user.displayName}).`);

  if (!user.enabled) {
    stepsEn.push(`Authentication FAILED: Account '${user.samAccountName}' is disabled in Active Directory.`);
    stepsAr.push(`فشلت المصادقة: الحساب '${user.samAccountName}' معطل في Active Directory.`);
    return {
      allowed: false,
      authenticated: false,
      effectiveGroups: [],
      reasonEn: `Authentication Failed: User account '${user.samAccountName}' is disabled.`,
      reasonAr: `فشلت المصادقة: حساب المستخدم '${user.samAccountName}' معطل في الدليل.`,
      stepExplanationEn: stepsEn,
      stepExplanationAr: stepsAr,
    };
  }

  stepsEn.push(`Authentication SUCCESS: User '${user.samAccountName}' is valid and enabled.`);
  stepsAr.push(`نجحت المصادقة: المستخدم '${user.samAccountName}' صالح ومفعل في النظام.`);

  // 2. Token / Effective Groups Phase
  const effectiveSids = new Set<string>([user.sid]);
  const effectiveGroupNames: string[] = [];

  for (const group of effectiveGroups) {
    effectiveSids.add(group.sid);
    effectiveGroupNames.push(group.name);
  }

  stepsEn.push(`Step 2 (Token Claims): Resolved ${effectiveGroupNames.length} effective groups: [${effectiveGroupNames.join(', ')}].`);
  stepsAr.push(`الخطوة 2 (بيانات الرمز): تم حصر ${effectiveGroupNames.length} مجموعة فعالة: [${effectiveGroupNames.join(', ')}].`);

  // 3. Authorization Phase (DACL Evaluation)
  stepsEn.push(`Step 3 (Authorization): Evaluating Access Control List (DACL) on '${resource.name}'.`);
  stepsAr.push(`الخطوة 3 (التفويض): تقييم قائمة التحكم بالوصول (DACL) على المورد '${resource.name}'.`);

  // A. Check for Explicit DENY rules matching user or any effective group
  for (const ace of resource.dacl) {
    if (ace.type === 'Deny' && effectiveSids.has(ace.principalSid)) {
      if (ace.permissions.includes(requestedPermission) || ace.permissions.includes('FullControl')) {
        stepsEn.push(`Access DENIED: Matched explicit DENY rule for principal '${ace.principalName}'.`);
        stepsAr.push(`تم رفض الوصول: تطابق مع قيد منع صريح (DENY) للطرف '${ace.principalName}'.`);
        return {
          allowed: false,
          authenticated: true,
          effectiveGroups: effectiveGroupNames,
          matchedRule: ace,
          reasonEn: `Access Denied: Explicit DENY for '${ace.principalName}' blocks '${requestedPermission}' access.`,
          reasonAr: `تم رفض الوصول: قيد منع صريح (DENY) للمجموعة/المستخدم '${ace.principalName}' يحظر إذن '${requestedPermission}'.`,
          stepExplanationEn: stepsEn,
          stepExplanationAr: stepsAr,
        };
      }
    }
  }

  // B. Check for Explicit ALLOW rules matching user or any effective group
  for (const ace of resource.dacl) {
    if (ace.type === 'Allow' && effectiveSids.has(ace.principalSid)) {
      if (ace.permissions.includes(requestedPermission) || ace.permissions.includes('FullControl')) {
        stepsEn.push(`Access ALLOWED: Matched explicit ALLOW rule for principal '${ace.principalName}'.`);
        stepsAr.push(`تم السماح بالوصول: تطابق مع قيد سماح صريح (ALLOW) للطرف '${ace.principalName}'.`);
        return {
          allowed: true,
          authenticated: true,
          effectiveGroups: effectiveGroupNames,
          matchedRule: ace,
          reasonEn: `Access Granted: '${ace.principalName}' has explicit '${requestedPermission}' permission.`,
          reasonAr: `تم منح الوصول: يمتلك الطرف '${ace.principalName}' إذن '${requestedPermission}' صريح.`,
          stepExplanationEn: stepsEn,
          stepExplanationAr: stepsAr,
        };
      }
    }
  }

  // C. Implicit Deny if no Allow rule matched
  stepsEn.push(`Access DENIED: Implicit Deny - no matching ALLOW ACE found for user or member groups.`);
  stepsAr.push(`تم رفض الوصول: منع ضمني (Implicit Deny) - لم يتم العثور على أي قيد سماح يطابق المستخدم أو مجموعاته.`);

  return {
    allowed: false,
    authenticated: true, // Crucial: Authentication succeeded, but Authorization failed!
    effectiveGroups: effectiveGroupNames,
    reasonEn: `Access Denied: User is authenticated, but lacks '${requestedPermission}' permission on '${resource.name}'.`,
    reasonAr: `تم رفض الوصول: المستخدم موثوق بنجاح، لكنه يفتقر إلى صلاحية '${requestedPermission}' على المورد '${resource.name}'.`,
    stepExplanationEn: stepsEn,
    stepExplanationAr: stepsAr,
  };
}
