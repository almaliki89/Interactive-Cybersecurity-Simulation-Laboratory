/**
 * OMEGA V13 — Cloud Security World
 * logic/roles.ts
 *
 * Deterministic Cloud IAM Role Assumption & Trust Policy Engine.
 * Implements STS-style AssumeRole, session tokens, and trust validation.
 * Zero non-deterministic functions.
 */

import { CloudPrincipal } from './identity';
import { CloudPolicy, CloudCondition, ALL_PRESET_POLICIES } from './policies';

export interface AssumeRoleStatement {
  id: string;
  effect: 'ALLOW' | 'DENY';
  principals: {
    type: 'AWS_ACCOUNT' | 'USER' | 'SERVICE' | 'FEDERATED';
    identifiers: string[]; // e.g. ['ncrn:nexora:iam::300000000004:user/sara', 'compute.nexora.internal', '*']
  }[];
  actions: string[]; // e.g. ['sts:AssumeRole', 'sts:AssumeRoleWithWebIdentity']
  conditions?: CloudCondition[];
}

export interface AssumeRoleTrustPolicy {
  version: string;
  statements: AssumeRoleStatement[];
}

export interface CloudRole {
  id: string;
  name: string;
  accountId: string;
  arn: string; // ncrn:nexora:iam::<account>:role/FinanceReaderRole
  descriptionEn: string;
  descriptionAr: string;
  assumeRolePolicy: AssumeRoleTrustPolicy;
  attachedPolicyIds: string[];
  maxSessionDurationSeconds: number; // default 3600
  isCrossAccount: boolean;
}

export interface TemporaryCredentials {
  accessKeyId: string;
  secretAccessKeyMasked: string;
  sessionToken: string;
  expirationVirtualTime: number;
  assumedRoleArn: string;
  assumedPrincipalId: string;
}

export interface RoleAssumptionResult {
  isSuccess: boolean;
  credentials?: TemporaryCredentials;
  denialReasonEn?: string;
  denialReasonAr?: string;
  matchedTrustStatementId?: string;
}

export function createDefaultRoles(prodAccountId = 'acc-prod-003', secAccountId = 'acc-secops-001'): CloudRole[] {
  return [
    {
      id: 'rol-finance-reader',
      name: 'FinanceReaderRole',
      accountId: prodAccountId,
      arn: `ncrn:nexora:iam::${prodAccountId}:role/FinanceReaderRole`,
      descriptionEn: 'Allows finance analysts to assume temporary reader privileges with MFA requirement.',
      descriptionAr: 'يسمح لمحللي المالية بتقمص صلاحيات قراءة مؤقتة مع اشتراط المصادقة متعددة العوامل MFA.',
      maxSessionDurationSeconds: 3600,
      isCrossAccount: false,
      assumeRolePolicy: {
        version: '2026-01-01',
        statements: [
          {
            id: 'Trust-Finance-Users-MFA',
            effect: 'ALLOW',
            principals: [
              {
                type: 'USER',
                identifiers: [`ncrn:nexora:iam::${prodAccountId}:user/sara`],
              },
            ],
            actions: ['sts:AssumeRole'],
            conditions: [
              {
                operator: 'Bool',
                key: 'nexora:MFAActive',
                value: true,
              },
            ],
          },
        ],
      },
      attachedPolicyIds: ['pol-finance-reader-least-priv'],
    },
    {
      id: 'rol-compute-app-workload',
      name: 'NexoraAppWorkloadInstanceProfileRole',
      accountId: prodAccountId,
      arn: `ncrn:nexora:iam::${prodAccountId}:role/NexoraAppWorkloadInstanceProfileRole`,
      descriptionEn: 'Assumed by virtual machines & container nodes via Instance Metadata Service (IMDS).',
      descriptionAr: 'يتقمصه الخوادم الافتراضية وحاويات التطبيقات عبر خدمة بيانات تعريف النسخة IMDS.',
      maxSessionDurationSeconds: 21600,
      isCrossAccount: false,
      assumeRolePolicy: {
        version: '2026-01-01',
        statements: [
          {
            id: 'Trust-Compute-Service',
            effect: 'ALLOW',
            principals: [
              {
                type: 'SERVICE',
                identifiers: ['compute.nexora.internal'],
              },
            ],
            actions: ['sts:AssumeRole'],
          },
        ],
      },
      attachedPolicyIds: ['pol-storage-wildcard'], // Flaw: overly permissive attached policy
    },
    {
      id: 'rol-cross-account-sec-auditor',
      name: 'CrossAccountSecurityAuditRole',
      accountId: prodAccountId,
      arn: `ncrn:nexora:iam::${prodAccountId}:role/CrossAccountSecurityAuditRole`,
      descriptionEn: 'Allows central SecOps account to perform compliance audits in Prod account.',
      descriptionAr: 'يسمح لحساب العمليات الأمنية المركزي بإجراء تدقيق الامتثال داخل حساب الإنتاج.',
      maxSessionDurationSeconds: 7200,
      isCrossAccount: true,
      assumeRolePolicy: {
        version: '2026-01-01',
        statements: [
          {
            id: 'Trust-Central-SecOps-Account',
            effect: 'ALLOW',
            principals: [
              {
                type: 'AWS_ACCOUNT',
                identifiers: [`ncrn:nexora:iam::${secAccountId}:root`],
              },
            ],
            actions: ['sts:AssumeRole'],
          },
        ],
      },
      attachedPolicyIds: ['pol-sec-audit', 'pol-readonly-all'],
    },
    {
      id: 'rol-overly-permissive-admin-pivot',
      name: 'ElevatedDevOpsRole',
      accountId: prodAccountId,
      arn: `ncrn:nexora:iam::${prodAccountId}:role/ElevatedDevOpsRole`,
      descriptionEn: 'VULNERABLE: Overly broad trust policy allows any authenticated user in org to assume Admin privileges.',
      descriptionAr: 'ثغرة: سياسة ثقة واسعة تتيح لأي مستخدم موثق في المؤسسة تقمص صلاحيات المدير الكاملة.',
      maxSessionDurationSeconds: 43200,
      isCrossAccount: false,
      assumeRolePolicy: {
        version: '2026-01-01',
        statements: [
          {
            id: 'Vulnerable-Wildcard-Trust',
            effect: 'ALLOW',
            principals: [
              {
                type: 'AWS_ACCOUNT',
                identifiers: ['*'], // Wildcard trust!
              },
            ],
            actions: ['sts:AssumeRole'],
          },
        ],
      },
      attachedPolicyIds: ['pol-admin-full'],
    },
  ];
}

/**
 * Evaluates whether a principal can assume a given role deterministically.
 */
export function evaluateRoleAssumption(
  principal: CloudPrincipal,
  role: CloudRole,
  currentVirtualTime: number,
  requestContext?: {
    isMfaActive?: boolean;
    externalId?: string;
    sourceIp?: string;
    isComputeService?: boolean;
  }
): RoleAssumptionResult {
  const mfa = requestContext?.isMfaActive ?? principal.mfaActive;

  for (const stmt of role.assumeRolePolicy.statements) {
    if (stmt.effect === 'DENY') {
      // Explicit deny in trust policy
      return {
        isSuccess: false,
        denialReasonEn: `Explicit DENY triggered in trust statement ${stmt.id}.`,
        denialReasonAr: `تم تفعيل حظر صريح في بند الثقة ${stmt.id}.`,
      };
    }

    if (stmt.effect === 'ALLOW') {
      let principalMatches = false;

      for (const p of stmt.principals) {
        if (p.identifiers.includes('*')) {
          principalMatches = true;
          break;
        }

        if (p.type === 'USER' && (p.identifiers.includes(principal.arn) || p.identifiers.includes(principal.name))) {
          principalMatches = true;
          break;
        }

        if (p.type === 'AWS_ACCOUNT') {
          const expectedAccountRoot = `ncrn:nexora:iam::${principal.accountId}:root`;
          if (p.identifiers.includes(expectedAccountRoot) || p.identifiers.includes(principal.accountId)) {
            principalMatches = true;
            break;
          }
        }

        if (p.type === 'SERVICE' && requestContext?.isComputeService) {
          if (p.identifiers.includes('compute.nexora.internal')) {
            principalMatches = true;
            break;
          }
        }
      }

      if (!principalMatches) {
        continue;
      }

      // Check conditions
      if (stmt.conditions && stmt.conditions.length > 0) {
        for (const cond of stmt.conditions) {
          if (cond.key === 'nexora:MFAActive' && cond.operator === 'Bool') {
            if (cond.value === true && !mfa) {
              return {
                isSuccess: false,
                denialReasonEn: 'Role assumption denied: Multi-Factor Authentication (MFA) is required by trust policy.',
                denialReasonAr: 'تم رفض تقمص الدور: التحقق بخطوتين (MFA) إلزامي بموجب سياسة الثقة.',
              };
            }
          }
        }
      }

      // Role assumption granted! Generate deterministic temporary credentials.
      const hashSeed = `${principal.id}:${role.id}:${currentVirtualTime}`;
      let pseudoNumeric = 0;
      for (let i = 0; i < hashSeed.length; i++) {
        pseudoNumeric = (pseudoNumeric * 31 + hashSeed.charCodeAt(i)) >>> 0;
      }

      const tempKeyId = `NXASIA${pseudoNumeric.toString(16).toUpperCase().padStart(12, '0')}`;
      const sessionToken = `tok_${pseudoNumeric}_${currentVirtualTime}_exp`;

      return {
        isSuccess: true,
        matchedTrustStatementId: stmt.id,
        credentials: {
          accessKeyId: tempKeyId,
          secretAccessKeyMasked: '****************************TEMP',
          sessionToken,
          expirationVirtualTime: currentVirtualTime + role.maxSessionDurationSeconds,
          assumedRoleArn: `${role.arn}/${principal.name}`,
          assumedPrincipalId: `${role.id}:${principal.name}`,
        },
      };
    }
  }

  return {
    isSuccess: false,
    denialReasonEn: `Implicit DENY: Principal '${principal.name}' is not authorized to assume role '${role.name}'.`,
    denialReasonAr: `رفض ضمني: المستخدم '${principal.name}' غير مصرح له بتقمص الدور '${role.name}'.`,
  };
}
