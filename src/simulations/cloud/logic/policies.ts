/**
 * OMEGA V13 — Cloud Security World
 * logic/policies.ts
 *
 * Deterministic Cloud IAM Policy model & standard preset policies.
 * Supports statements, effects (ALLOW/DENY), actions, resources, and conditions.
 * Zero non-deterministic functions.
 */

export interface CloudCondition {
  operator: 'StringEquals' | 'StringNotEquals' | 'IpAddress' | 'NotIpAddress' | 'Bool' | 'ArnEquals';
  key: string; // e.g. 'nexora:SourceIp', 'nexora:PrincipalTag', 'nexora:SecureTransport', 'nexora:MFAActive'
  value: string | string[] | boolean;
}

export interface CloudPolicyStatement {
  id: string;
  effect: 'ALLOW' | 'DENY';
  actions: string[]; // e.g. ['storage:GetObject', 'iam:PassRole'] or ['*']
  resources: string[]; // e.g. ['ncrn:nexora:storage:::finance-vault/*'] or ['*']
  conditions?: CloudCondition[];
}

export interface CloudPolicy {
  id: string;
  name: string;
  type: 'MANAGED' | 'INLINE' | 'CUSTOMER_MANAGED';
  descriptionEn: string;
  descriptionAr: string;
  version: string;
  statements: CloudPolicyStatement[];
  isWildcardAdmin?: boolean;
}

export const ADMIN_ACCESS_POLICY: CloudPolicy = {
  id: 'pol-admin-full',
  name: 'AdministratorAccess',
  type: 'MANAGED',
  descriptionEn: 'Provides full administrative access to all cloud services and resources (*:*). High risk if assigned broadly.',
  descriptionAr: 'يمنح صلاحية إدارة كاملة لجميع الخدمات والموارد السحابية (*:*). عالي الخطورة عند إسناده بشكل عام.',
  version: '2026-01-01',
  isWildcardAdmin: true,
  statements: [
    {
      id: 'Stmt-Admin-All',
      effect: 'ALLOW',
      actions: ['*'],
      resources: ['*'],
    },
  ],
};

export const READ_ONLY_ACCESS_POLICY: CloudPolicy = {
  id: 'pol-readonly-all',
  name: 'ReadOnlyAccess',
  type: 'MANAGED',
  descriptionEn: 'Provides read-only inspection access across compute, network, and storage metadata.',
  descriptionAr: 'يمنح صلاحية قراءة واستعراض لجميع الموارد دون السماح بأي تعديل أو حذف.',
  version: '2026-01-01',
  statements: [
    {
      id: 'Stmt-ReadOnly-GetDescribe',
      effect: 'ALLOW',
      actions: [
        'compute:Describe*',
        'compute:Get*',
        'network:Describe*',
        'network:Get*',
        'storage:List*',
        'storage:GetBucketLocation',
        'iam:Get*',
        'iam:List*',
      ],
      resources: ['*'],
    },
  ],
};

export const STORAGE_FULL_ACCESS_POLICY: CloudPolicy = {
  id: 'pol-storage-wildcard',
  name: 'StorageFullWildcardAccess',
  type: 'CUSTOMER_MANAGED',
  descriptionEn: 'Overly permissive storage policy granting storage:* across all buckets.',
  descriptionAr: 'سياسة تخزين مفرطة الصلاحيات تمنح storage:* لجميع حاويات التخزين دون قيود.',
  version: '2026-01-01',
  isWildcardAdmin: false,
  statements: [
    {
      id: 'Stmt-Storage-Wildcard',
      effect: 'ALLOW',
      actions: ['storage:*'],
      resources: ['*'],
    },
  ],
};

export const LEAST_PRIVILEGE_FINANCE_READER_POLICY: CloudPolicy = {
  id: 'pol-finance-reader-least-priv',
  name: 'FinanceReportsReaderLeastPrivilege',
  type: 'CUSTOMER_MANAGED',
  descriptionEn: 'Least-privilege policy strictly scoped to GetObject on finance-reports/* bucket requiring TLS.',
  descriptionAr: 'سياسة الامتياز الأدنى محصورة بدقة لقراءة مستندات تقارير المالية مع فرض تشفير النقل TLS.',
  version: '2026-01-01',
  statements: [
    {
      id: 'Stmt-Allow-Finance-Get',
      effect: 'ALLOW',
      actions: ['storage:GetObject'],
      resources: [
        'ncrn:nexora:storage:::finance-reports/*',
        'finance-reports/*',
      ],
      conditions: [
        {
          operator: 'Bool',
          key: 'nexora:SecureTransport',
          value: true,
        },
      ],
    },
    {
      id: 'Stmt-Deny-Insecure-Http',
      effect: 'DENY',
      actions: ['storage:*'],
      resources: ['ncrn:nexora:storage:::finance-reports/*', 'finance-reports/*'],
      conditions: [
        {
          operator: 'Bool',
          key: 'nexora:SecureTransport',
          value: false,
        },
      ],
    },
  ],
};

export const SECURITY_AUDIT_POLICY: CloudPolicy = {
  id: 'pol-sec-audit',
  name: 'SecurityAuditObserver',
  type: 'MANAGED',
  descriptionEn: 'Allows security team to query audit logs, flow logs, and posture configurations.',
  descriptionAr: 'يسمح لفريق الأمان بالاستعلام عن سجلات التدقيق وسجلات التدفق وإعدادات وضع الحماية.',
  version: '2026-01-01',
  statements: [
    {
      id: 'Stmt-SecAudit',
      effect: 'ALLOW',
      actions: [
        'audit:GetTrailStatus',
        'audit:LookupEvents',
        'network:DescribeFlowLogs',
        'security:GetPostureReport',
      ],
      resources: ['*'],
    },
  ],
};

export const COMPUTE_OPERATOR_POLICY: CloudPolicy = {
  id: 'pol-compute-op',
  name: 'ComputeInstanceOperator',
  type: 'CUSTOMER_MANAGED',
  descriptionEn: 'Allows start/stop/reboot on compute instances in development subnet.',
  descriptionAr: 'يسمح بتشغيل وإيقاف وإعادة تشغيل الخوادم السحابية ضمن شبكة التطوير الفرعية.',
  version: '2026-01-01',
  statements: [
    {
      id: 'Stmt-Compute-Ops',
      effect: 'ALLOW',
      actions: [
        'compute:StartInstances',
        'compute:StopInstances',
        'compute:RebootInstances',
        'compute:DescribeInstances',
      ],
      resources: ['ncrn:nexora:compute:nx-east-1:*:instance/inst-dev-*'],
    },
  ],
};

export const DENY_ROOT_KEY_CREATION_POLICY: CloudPolicy = {
  id: 'pol-deny-root-keys',
  name: 'DenyRootAccessKeyCreation',
  type: 'MANAGED',
  descriptionEn: 'Explicitly denies creating access keys for root credentials.',
  descriptionAr: 'حظر صريح لإنشاء مفاتيح وصول دائمة لحساب الجذر (Root).',
  version: '2026-01-01',
  statements: [
    {
      id: 'Stmt-Deny-Root-Keys',
      effect: 'DENY',
      actions: ['iam:CreateAccessKey'],
      resources: ['ncrn:nexora:iam:::root'],
    },
  ],
};

export const ALL_PRESET_POLICIES: CloudPolicy[] = [
  ADMIN_ACCESS_POLICY,
  READ_ONLY_ACCESS_POLICY,
  STORAGE_FULL_ACCESS_POLICY,
  LEAST_PRIVILEGE_FINANCE_READER_POLICY,
  SECURITY_AUDIT_POLICY,
  COMPUTE_OPERATOR_POLICY,
  DENY_ROOT_KEY_CREATION_POLICY,
];

/**
 * Validates a policy for wildcard risk & anti-patterns.
 */
export function validatePolicySyntax(policy: CloudPolicy): {
  isValid: boolean;
  hasWildcardAction: boolean;
  hasWildcardResource: boolean;
  hasOverlyPermissiveAdmin: boolean;
  findings: string[];
} {
  const findings: string[] = [];
  let hasWildcardAction = false;
  let hasWildcardResource = false;
  let hasOverlyPermissiveAdmin = false;

  policy.statements.forEach((stmt) => {
    if (stmt.effect === 'ALLOW') {
      if (stmt.actions.includes('*')) {
        hasWildcardAction = true;
        findings.push(`Statement ${stmt.id} uses wildcard action '*'.`);
      }
      if (stmt.resources.includes('*')) {
        hasWildcardResource = true;
        findings.push(`Statement ${stmt.id} applies to all resources '*'.`);
      }
      if (stmt.actions.includes('*') && stmt.resources.includes('*')) {
        hasOverlyPermissiveAdmin = true;
        findings.push(`CRITICAL: Statement ${stmt.id} grants full admin rights (*:*) with no scoping.`);
      }
    }
  });

  return {
    isValid: policy.statements.length > 0,
    hasWildcardAction,
    hasWildcardResource,
    hasOverlyPermissiveAdmin,
    findings,
  };
}
