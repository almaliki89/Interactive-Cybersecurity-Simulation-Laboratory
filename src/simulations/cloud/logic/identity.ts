/**
 * OMEGA V13 — Cloud Security World
 * logic/identity.ts
 *
 * Deterministic Cloud IAM Principals (Users, Groups, Service Identities, Workload Identities).
 * Zero non-deterministic functions.
 */

import { CloudPolicy, ALL_PRESET_POLICIES } from './policies';

export type PrincipalType = 'USER' | 'ROLE' | 'SERVICE_IDENTITY' | 'WORKLOAD_IDENTITY';

export interface CloudAccessKey {
  keyId: string; // e.g. 'NXAKIAIOSFODNN7EXAMPLE'
  secretKeyMasked: string; // e.g. 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
  status: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
  createdVirtualTime: number;
  lastUsedVirtualTime?: number;
}

export interface CloudPrincipal {
  id: string;
  type: PrincipalType;
  name: string;
  tenantId: string;
  accountId: string;
  arn: string; // ncrn:nexora:iam::<account>:user/sara
  attachedPolicyIds: string[];
  groups: string[];
  mfaActive: boolean;
  accessKeys: CloudAccessKey[];
  lastLoginVirtualTime: number;
  tags: Record<string, string>;
  isServiceLinked?: boolean;
}

export interface CloudGroup {
  id: string;
  name: string;
  accountId: string;
  arn: string;
  memberPrincipalIds: string[];
  attachedPolicyIds: string[];
  descriptionEn: string;
  descriptionAr: string;
}

export function createDefaultCloudIdentities(accountId = 'acc-prod-003'): {
  principals: CloudPrincipal[];
  groups: CloudGroup[];
} {
  const principals: CloudPrincipal[] = [
    {
      id: 'usr-sara',
      type: 'USER',
      name: 'sara',
      tenantId: 'tenant-nexora-corp',
      accountId,
      arn: `ncrn:nexora:iam::${accountId}:user/sara`,
      attachedPolicyIds: ['pol-finance-reader-least-priv'],
      groups: ['grp-finance-analysts'],
      mfaActive: true,
      accessKeys: [
        {
          keyId: 'NXAKIAIOSFODNN7SARA1',
          secretKeyMasked: '****************************SARA',
          status: 'ACTIVE',
          createdVirtualTime: 100,
          lastUsedVirtualTime: 400,
        },
      ],
      lastLoginVirtualTime: 450,
      tags: { Department: 'Finance', Role: 'Analyst' },
    },
    {
      id: 'usr-dev-alex',
      type: 'USER',
      name: 'alex',
      tenantId: 'tenant-nexora-corp',
      accountId,
      arn: `ncrn:nexora:iam::${accountId}:user/alex`,
      attachedPolicyIds: ['pol-compute-op'],
      groups: ['grp-developers'],
      mfaActive: false, // Security finding: missing MFA on developer user
      accessKeys: [
        {
          keyId: 'NXAKIAIOSFODNN7ALEX9',
          secretKeyMasked: '****************************ALEX',
          status: 'ACTIVE',
          createdVirtualTime: 50,
          lastUsedVirtualTime: 500,
        },
      ],
      lastLoginVirtualTime: 520,
      tags: { Department: 'Engineering', Role: 'Backend' },
    },
    {
      id: 'usr-admin-root',
      type: 'USER',
      name: 'cloud-root',
      tenantId: 'tenant-nexora-corp',
      accountId: 'acc-org-root-000',
      arn: 'ncrn:nexora:iam::acc-org-root-000:root',
      attachedPolicyIds: ['pol-admin-full'],
      groups: [],
      mfaActive: true,
      accessKeys: [], // Best Practice: Root account has no active access keys
      lastLoginVirtualTime: 200,
      tags: { Tier: 'BreakGlass', SecurityLevel: 'Maximum' },
    },
    {
      id: 'svc-backup-pipeline',
      type: 'SERVICE_IDENTITY',
      name: 'nexora-backup-runner',
      tenantId: 'tenant-nexora-corp',
      accountId,
      arn: `ncrn:nexora:iam::${accountId}:service/nexora-backup-runner`,
      attachedPolicyIds: ['pol-readonly-all'],
      groups: [],
      mfaActive: false,
      accessKeys: [
        {
          keyId: 'NXAKIAIOSFODNN7SVCBKP',
          secretKeyMasked: '****************************BKUP',
          status: 'ACTIVE',
          createdVirtualTime: 20,
        },
      ],
      lastLoginVirtualTime: 300,
      tags: { Automation: 'BackupEngine' },
      isServiceLinked: true,
    },
    {
      id: 'wkl-frontend-app',
      type: 'WORKLOAD_IDENTITY',
      name: 'nexora-web-workload',
      tenantId: 'tenant-nexora-corp',
      accountId,
      arn: `ncrn:nexora:iam::${accountId}:workload/nexora-web-workload`,
      attachedPolicyIds: ['pol-storage-wildcard'], // Misconfiguration: overly broad storage:*
      groups: [],
      mfaActive: false,
      accessKeys: [], // Uses instance profile metadata rather than static keys
      lastLoginVirtualTime: 0,
      tags: { Tier: 'WebWorkload', Cluster: 'ProdVPC' },
    },
  ];

  const groups: CloudGroup[] = [
    {
      id: 'grp-finance-analysts',
      name: 'FinanceAnalysts',
      accountId,
      arn: `ncrn:nexora:iam::${accountId}:group/FinanceAnalysts`,
      memberPrincipalIds: ['usr-sara'],
      attachedPolicyIds: ['pol-finance-reader-least-priv'],
      descriptionEn: 'Members can read approved financial reports in secure vault with TLS.',
      descriptionAr: 'يستطيع الأعضاء قراءة تقارير المالية المعتمدة في الخزينة المحمية مع TLS.',
    },
    {
      id: 'grp-developers',
      name: 'ApplicationDevelopers',
      accountId,
      arn: `ncrn:nexora:iam::${accountId}:group/ApplicationDevelopers`,
      memberPrincipalIds: ['usr-dev-alex'],
      attachedPolicyIds: ['pol-compute-op'],
      descriptionEn: 'Allows developers to manage dev instances.',
      descriptionAr: 'يسمح للمطورين بإدارة الخوادم الخاصة بالتطوير.',
    },
    {
      id: 'grp-secops',
      name: 'SecOpsAuditors',
      accountId,
      arn: `ncrn:nexora:iam::${accountId}:group/SecOpsAuditors`,
      memberPrincipalIds: [],
      attachedPolicyIds: ['pol-sec-audit'],
      descriptionEn: 'Security operations team with read access to audit logs and posture.',
      descriptionAr: 'فريق عمليات الأمان مع صلاحية قراءة سجلات التدقيق وإعدادات الحماية.',
    },
  ];

  return { principals, groups };
}

/**
 * Returns all policies attached directly or via group memberships for a principal.
 */
export function getPrincipalEffectivePolicies(
  principal: CloudPrincipal,
  groups: CloudGroup[],
  allPolicies: CloudPolicy[] = ALL_PRESET_POLICIES
): CloudPolicy[] {
  const policyIds = new Set<string>(principal.attachedPolicyIds);

  // Add group policies
  groups.forEach((g) => {
    if (g.memberPrincipalIds.includes(principal.id) || principal.groups.includes(g.id)) {
      g.attachedPolicyIds.forEach((pid) => policyIds.add(pid));
    }
  });

  return allPolicies.filter((p) => policyIds.has(p.id));
}

export interface CloudIamAuditFinding {
  principalId: string;
  principalName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reasonEn: string;
  reasonAr: string;
  escalationVectorEn: string;
  escalationVectorAr: string;
}

export interface CloudIamAuditResult {
  findings: CloudIamAuditFinding[];
  wildcardPoliciesCount: number;
  unscopedWorkloadsCount: number;
  securityScore: number;
  isCompliant: boolean;
  messageEn: string;
  messageAr: string;
}

/**
 * Technical validator for Cloud IAM Least Privilege hardening.
 * Audits principals, groups, and attached policies to detect wildcard permissions
 * and unconstrained workload identities.
 */
export function auditCloudIamConfiguration(
  principals: CloudPrincipal[],
  groups: CloudGroup[],
  allPolicies: CloudPolicy[] = ALL_PRESET_POLICIES
): CloudIamAuditResult {
  const findings: CloudIamAuditFinding[] = [];
  let wildcardPoliciesCount = 0;
  let unscopedWorkloadsCount = 0;

  for (const principal of principals) {
    const effective = getPrincipalEffectivePolicies(principal, groups, allPolicies);

    // Root account is break-glass and expected to have full admin
    if (principal.id === 'usr-admin-root') {
      continue;
    }

    // 1. Check for wildcard admin policies (*:*)
    const wildcardAdmin = effective.find(
      (p) => p.isWildcardAdmin || p.statements.some((s) => s.effect === 'ALLOW' && s.actions.includes('*') && s.resources.includes('*'))
    );
    if (wildcardAdmin) {
      wildcardPoliciesCount++;
      findings.push({
        principalId: principal.id,
        principalName: principal.name,
        severity: 'CRITICAL',
        reasonEn: `Principal "${principal.name}" has full wildcard admin privileges (${wildcardAdmin.name}).`,
        reasonAr: `الهوية "${principal.name}" تمتلك صلاحيات مسؤول كاملة مطلقة (${wildcardAdmin.name}).`,
        escalationVectorEn: 'Complete cloud tenant takeover and resource exfiltration.',
        escalationVectorAr: 'السيطرة الكاملة على المستأجر السحابي واستخراج الموارد الحساسة.',
      });
    }

    // 2. Check for broad service-level wildcards (e.g. storage:* on *)
    const wildcardService = effective.find(
      (p) => !p.isWildcardAdmin && p.statements.some((s) => s.effect === 'ALLOW' && s.actions.some((a) => a.endsWith(':*') || a === '*') && s.resources.includes('*'))
    );
    if (wildcardService) {
      wildcardPoliciesCount++;
      findings.push({
        principalId: principal.id,
        principalName: principal.name,
        severity: 'CRITICAL',
        reasonEn: `Principal "${principal.name}" has unconstrained wildcard service access (${wildcardService.name}).`,
        reasonAr: `الهوية "${principal.name}" تمتلك صلاحية واسعة غير مقيدة (${wildcardService.name}).`,
        escalationVectorEn: 'Unrestricted read/write across all cloud buckets/resources without scoping.',
        escalationVectorAr: 'قراءة وكتابة غير مقيدة لكافة حاويات التخزين السحابية دون حصر النطاق.',
      });
    }

    // 3. Specifically verify workload identities (e.g. wkl-frontend-app)
    if (principal.type === 'WORKLOAD_IDENTITY') {
      const hasLeastPrivilege = effective.some(
        (p) => p.id === 'pol-finance-reader-least-priv' || p.id === 'pol-readonly-all'
      );
      const hasWildcard = effective.some(
        (p) => p.isWildcardAdmin || p.id === 'pol-storage-wildcard' || p.statements.some((s) => s.effect === 'ALLOW' && (s.actions.includes('*') || s.actions.includes('storage:*')))
      );

      if (hasWildcard || !hasLeastPrivilege) {
        unscopedWorkloadsCount++;
        if (!wildcardService && !wildcardAdmin) {
          findings.push({
            principalId: principal.id,
            principalName: principal.name,
            severity: 'HIGH',
            reasonEn: `Workload "${principal.name}" lacks scoped least-privilege policy.`,
            reasonAr: `عبء العمل "${principal.name}" يفتقر إلى سياسة امتياز أدنى محددة النطاق.`,
            escalationVectorEn: 'Lateral access or pivot from compromised workload.',
            escalationVectorAr: 'الوصول الجانبي أو التحول عبر عبء العمل المخترق.',
          });
        }
      }
    }
  }

  let securityScore = 100;
  securityScore -= wildcardPoliciesCount * 35;
  securityScore -= unscopedWorkloadsCount * 25;
  securityScore = Math.max(0, Math.min(100, securityScore));

  const isCompliant = findings.length === 0 && securityScore === 100;

  return {
    findings,
    wildcardPoliciesCount,
    unscopedWorkloadsCount,
    securityScore,
    isCompliant,
    messageEn: isCompliant
      ? 'Cloud IAM least privilege configuration verified. Zero dangerous wildcards.'
      : `IAM Hardening Required: ${findings[0]?.reasonEn || 'Unresolved IAM over-privilege findings'}`,
    messageAr: isCompliant
      ? 'تم التحقق من تطبيق مبدأ الامتياز الأدنى في IAM السحابي بنجاح. لا توجد صلاحيات نجوم خطرة.'
      : `مطلوب تحصين IAM: ${findings[0]?.reasonAr || 'توجد ملاحظات صلاحيات مفرطة غير معالجة'}`,
  };
}
