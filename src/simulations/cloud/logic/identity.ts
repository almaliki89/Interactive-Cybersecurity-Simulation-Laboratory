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
