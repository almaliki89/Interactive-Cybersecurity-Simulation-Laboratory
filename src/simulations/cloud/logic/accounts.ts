/**
 * OMEGA V13 — Cloud Security World
 * logic/accounts.ts
 *
 * Deterministic multi-tenant cloud account & organization model.
 * Models Nexora Cloud Organization, Tenants, Accounts, Subscriptions, Regions,
 * and Blast Radius isolation boundaries.
 * Zero non-deterministic functions (no Date.now, Math.random, etc.).
 */

export type CloudEnvironmentType = 'PROD' | 'DEV' | 'STAGING' | 'SECURITY' | 'SHARED_SERVICES';
export type BlastRadiusRating = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface NexoraCloudAccount {
  id: string; // e.g. 'acc-nexora-prod-01'
  accountNumber: string; // 12-digit string e.g. '112233445566'
  name: string;
  environment: CloudEnvironmentType;
  tenantId: string;
  parentOuId: string;
  rootEmail: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ISOLATED';
  blastRadius: BlastRadiusRating;
  isDedicatedSecurityAccount: boolean;
  regions: string[];
  tags: Record<string, string>;
  budgetLimitUsd: number;
}

export interface NexoraOrganizationalUnit {
  id: string;
  name: string;
  parentId: string; // Root Org ID or parent OU ID
  accountIds: string[];
  serviceControlPolicyIds: string[];
}

export interface NexoraOrganization {
  id: string;
  name: string;
  masterAccountId: string;
  securityAccountId: string;
  auditAccountId: string;
  organizationalUnits: NexoraOrganizationalUnit[];
  accounts: NexoraCloudAccount[];
  availableRegions: {
    id: string;
    name: string;
    description: string;
    isPrimary: boolean;
  }[];
}

export const NEXORA_REGIONS = [
  { id: 'nx-east-1', name: 'Nexora East (Primary)', description: 'Primary enterprise workload and data tier', isPrimary: true },
  { id: 'nx-west-1', name: 'Nexora West (Disaster Recovery)', description: 'Secondary failover and replication region', isPrimary: false },
  { id: 'nx-central-1', name: 'Nexora Central (Compliance)', description: 'Isolated region for strictly regulated workloads', isPrimary: false },
];

export function createDefaultNexoraOrganization(): NexoraOrganization {
  const masterAccountId = 'acc-org-root-000';
  const securityAccountId = 'acc-secops-001';
  const auditAccountId = 'acc-audit-002';
  const prodAccountId = 'acc-prod-003';
  const devAccountId = 'acc-dev-004';
  const sharedServicesAccountId = 'acc-shared-005';

  const accounts: NexoraCloudAccount[] = [
    {
      id: masterAccountId,
      accountNumber: '100000000001',
      name: 'Nexora Root Payer Account',
      environment: 'SHARED_SERVICES',
      tenantId: 'tenant-nexora-corp',
      parentOuId: 'ou-root',
      rootEmail: 'cloud-root@nexora.internal',
      status: 'ACTIVE',
      blastRadius: 'CRITICAL',
      isDedicatedSecurityAccount: false,
      regions: ['nx-east-1', 'nx-west-1'],
      tags: { Environment: 'Root', ManagedBy: 'CloudOps' },
      budgetLimitUsd: 100000,
    },
    {
      id: securityAccountId,
      accountNumber: '200000000002',
      name: 'Nexora Central Security & SIEM',
      environment: 'SECURITY',
      tenantId: 'tenant-nexora-corp',
      parentOuId: 'ou-security',
      rootEmail: 'security-cloud@nexora.internal',
      status: 'ACTIVE',
      blastRadius: 'HIGH',
      isDedicatedSecurityAccount: true,
      regions: ['nx-east-1', 'nx-west-1', 'nx-central-1'],
      tags: { Environment: 'Security', ManagedBy: 'SecOps' },
      budgetLimitUsd: 40000,
    },
    {
      id: auditAccountId,
      accountNumber: '200000000003',
      name: 'Nexora Immutable Audit & Logs',
      environment: 'SECURITY',
      tenantId: 'tenant-nexora-corp',
      parentOuId: 'ou-security',
      rootEmail: 'cloud-audit@nexora.internal',
      status: 'ACTIVE',
      blastRadius: 'HIGH',
      isDedicatedSecurityAccount: true,
      regions: ['nx-east-1', 'nx-west-1'],
      tags: { Environment: 'Audit', ManagedBy: 'Compliance' },
      budgetLimitUsd: 25000,
    },
    {
      id: prodAccountId,
      accountNumber: '300000000004',
      name: 'Nexora Production Workloads',
      environment: 'PROD',
      tenantId: 'tenant-nexora-corp',
      parentOuId: 'ou-workloads-prod',
      rootEmail: 'prod-admin@nexora.internal',
      status: 'ACTIVE',
      blastRadius: 'CRITICAL',
      isDedicatedSecurityAccount: false,
      regions: ['nx-east-1', 'nx-west-1'],
      tags: { Environment: 'Production', Tier: 'AppTier' },
      budgetLimitUsd: 75000,
    },
    {
      id: devAccountId,
      accountNumber: '400000000005',
      name: 'Nexora Development & Sandbox',
      environment: 'DEV',
      tenantId: 'tenant-nexora-corp',
      parentOuId: 'ou-workloads-dev',
      rootEmail: 'dev-leads@nexora.internal',
      status: 'ACTIVE',
      blastRadius: 'LOW',
      isDedicatedSecurityAccount: false,
      regions: ['nx-east-1'],
      tags: { Environment: 'Development', Tier: 'Sandbox' },
      budgetLimitUsd: 15000,
    },
    {
      id: sharedServicesAccountId,
      accountNumber: '500000000006',
      name: 'Nexora Shared Services & Hub Network',
      environment: 'SHARED_SERVICES',
      tenantId: 'tenant-nexora-corp',
      parentOuId: 'ou-core-infra',
      rootEmail: 'infra-shared@nexora.internal',
      status: 'ACTIVE',
      blastRadius: 'HIGH',
      isDedicatedSecurityAccount: false,
      regions: ['nx-east-1', 'nx-west-1'],
      tags: { Environment: 'SharedServices', Role: 'TransitHub' },
      budgetLimitUsd: 30000,
    },
  ];

  const organizationalUnits: NexoraOrganizationalUnit[] = [
    {
      id: 'ou-root',
      name: 'Root Management OU',
      parentId: 'org-nexora-global',
      accountIds: [masterAccountId],
      serviceControlPolicyIds: ['scp-deny-leave-org', 'scp-require-mfa'],
    },
    {
      id: 'ou-security',
      name: 'Core Security Enclave OU',
      parentId: 'org-nexora-global',
      accountIds: [securityAccountId, auditAccountId],
      serviceControlPolicyIds: ['scp-protect-log-buckets', 'scp-deny-disable-trail'],
    },
    {
      id: 'ou-workloads-prod',
      name: 'Production Workloads OU',
      parentId: 'org-nexora-global',
      accountIds: [prodAccountId],
      serviceControlPolicyIds: ['scp-restrict-regions-east-west', 'scp-deny-public-storage'],
    },
    {
      id: 'ou-workloads-dev',
      name: 'Non-Production Sandbox OU',
      parentId: 'org-nexora-global',
      accountIds: [devAccountId],
      serviceControlPolicyIds: ['scp-restrict-expensive-instances'],
    },
    {
      id: 'ou-core-infra',
      name: 'Shared Infrastructure OU',
      parentId: 'org-nexora-global',
      accountIds: [sharedServicesAccountId],
      serviceControlPolicyIds: ['scp-deny-internet-direct-routing'],
    },
  ];

  return {
    id: 'org-nexora-global',
    name: 'Nexora Global Enterprise Cloud',
    masterAccountId,
    securityAccountId,
    auditAccountId,
    organizationalUnits,
    accounts,
    availableRegions: NEXORA_REGIONS,
  };
}

/**
 * Evaluates blast radius containment between two cloud accounts.
 * Multi-account separation ensures breach in DEV or Workloads does not compromise Security or Master.
 */
export function evaluateAccountIsolation(
  sourceAccountId: string,
  targetAccountId: string,
  org: NexoraOrganization
): {
  isIsolated: boolean;
  isolationBoundary: 'STRONG' | 'PARTIAL' | 'SAME_ACCOUNT';
  descriptionEn: string;
  descriptionAr: string;
} {
  if (sourceAccountId === targetAccountId) {
    return {
      isIsolated: false,
      isolationBoundary: 'SAME_ACCOUNT',
      descriptionEn: 'Source and target reside within the same cloud account. Blast radius is unconstrained without IAM boundaries.',
      descriptionAr: 'المصدر والهدف داخل نفس الحساب السحابي. نطاق الأثر غير معزول دون قيود IAM.',
    };
  }

  const sourceAcc = org.accounts.find((a) => a.id === sourceAccountId);
  const targetAcc = org.accounts.find((a) => a.id === targetAccountId);

  if (!sourceAcc || !targetAcc) {
    return {
      isIsolated: true,
      isolationBoundary: 'STRONG',
      descriptionEn: 'One or both accounts not found in organization directory.',
      descriptionAr: 'أحد الحسابين أو كلاهما غير موجود في دليل المؤسسة.',
    };
  }

  // Cross-environment isolation
  if (sourceAcc.environment === 'DEV' && targetAcc.environment === 'PROD') {
    return {
      isIsolated: true,
      isolationBoundary: 'STRONG',
      descriptionEn: 'Strong boundary: Development account credentials cannot pivot into Production account resources without explicit cross-account role trust.',
      descriptionAr: 'عزل قوي: بيانات اعتماد حساب التطوير لا يمكنها القفز إلى حساب الإنتاج دون ثقة صريحة بالأدوار المشتركة.',
    };
  }

  if (targetAcc.isDedicatedSecurityAccount && sourceAcc.environment !== 'SECURITY') {
    return {
      isIsolated: true,
      isolationBoundary: 'STRONG',
      descriptionEn: 'Dedicated Security account boundary protects audit logs and SIEM telemetry from workload account compromise.',
      descriptionAr: 'عزل حساب الأمان المخصص يحمي سجلات التدقيق وبيانات SIEM من اختراق حسابات تشغيل التطبيقات.',
    };
  }

  return {
    isIsolated: true,
    isolationBoundary: 'PARTIAL',
    descriptionEn: `Cross-account separation active between ${sourceAcc.name} and ${targetAcc.name}.`,
    descriptionAr: `عزل الحسابات مفعل بين ${sourceAcc.name} و ${targetAcc.name}.`,
  };
}
