/**
 * OMEGA V13 — Cloud Security World
 * logic/authorization.ts
 *
 * Deterministic Cloud IAM Policy Evaluation Engine.
 * Evaluates authorization requests against IAM policies using the standard
 * Explicit Deny > Allow > Implicit Deny algorithm.
 * Zero non-deterministic functions.
 */

import { CloudPolicy, CloudPolicyStatement, CloudCondition } from './policies';

export interface CloudAuthRequest {
  principalArn: string;
  principalType?: string;
  action: string; // e.g. 'storage:GetObject'
  resource: string; // e.g. 'finance-reports/Q3.pdf' or 'ncrn:nexora:storage:::finance-reports/Q3.pdf'
  context: {
    sourceIp?: string;
    secureTransport?: boolean; // TLS active
    mfaActive?: boolean;
    principalTags?: Record<string, string>;
    resourceTags?: Record<string, string>;
    currentTimeVirtual?: number;
  };
}

export interface EvaluationStep {
  policyId: string;
  policyName: string;
  statementId: string;
  effect: 'ALLOW' | 'DENY';
  actionMatch: boolean;
  resourceMatch: boolean;
  conditionMatch: boolean;
  isTriggered: boolean;
}

export interface CloudAuthDecision {
  decision: 'ALLOW' | 'EXPLICIT_DENY' | 'IMPLICIT_DENY';
  isAllowed: boolean;
  matchedDenyStatementId?: string;
  matchedAllowStatementId?: string;
  matchedPolicyName?: string;
  reasons: {
    en: string;
    ar: string;
  };
  evaluationSteps: EvaluationStep[];
  decisionWhy: string;
}

/**
 * Wildcard string matcher (supports * wildcard anywhere in pattern).
 */
export function matchWildcard(pattern: string, target: string): boolean {
  if (pattern === '*' || target === pattern) return true;
  if (!pattern.includes('*')) return pattern === target;

  const escapeRegex = (s: string) => s.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
  const regexPattern = '^' + pattern.split('*').map(escapeRegex).join('.*') + '$';
  return new RegExp(regexPattern).test(target);
}

/**
 * Evaluates whether an action matches any pattern in statement actions.
 */
export function matchAction(statementActions: string[], requestedAction: string): boolean {
  return statementActions.some((pattern) => matchWildcard(pattern.toLowerCase(), requestedAction.toLowerCase()));
}

/**
 * Evaluates whether a resource matches any pattern in statement resources.
 */
export function matchResource(statementResources: string[], requestedResource: string): boolean {
  // Normalize resource paths
  const normTarget = requestedResource.toLowerCase();
  return statementResources.some((pattern) => {
    const normPattern = pattern.toLowerCase();
    if (normPattern === '*') return true;
    if (matchWildcard(normPattern, normTarget)) return true;

    // Handle ARN prefix matching (e.g. 'ncrn:nexora:storage:::bucket/file' vs 'bucket/file')
    if (normPattern.includes(':::')) {
      const strippedPattern = normPattern.split(':::')[1];
      if (matchWildcard(strippedPattern, normTarget)) return true;
    }
    if (normTarget.includes(':::')) {
      const strippedTarget = normTarget.split(':::')[1];
      if (matchWildcard(normPattern, strippedTarget)) return true;
    }

    return false;
  });
}

/**
 * Evaluates conditions on a statement against the request context.
 */
export function matchConditions(conditions: CloudCondition[] | undefined, context: CloudAuthRequest['context']): boolean {
  if (!conditions || conditions.length === 0) return true;

  for (const cond of conditions) {
    if (cond.key === 'nexora:SecureTransport') {
      const isHttps = context.secureTransport ?? true;
      if (cond.operator === 'Bool') {
        const expected = Boolean(cond.value);
        if (isHttps !== expected) return false;
      }
    } else if (cond.key === 'nexora:MFAActive') {
      const isMfa = context.mfaActive ?? false;
      if (cond.operator === 'Bool') {
        const expected = Boolean(cond.value);
        if (isMfa !== expected) return false;
      }
    } else if (cond.key === 'nexora:SourceIp') {
      const clientIp = context.sourceIp || '0.0.0.0';
      const expectedIp = String(cond.value);
      if (cond.operator === 'IpAddress') {
        if (!clientIp.startsWith(expectedIp.replace('/24', '').replace('/16', '')) && clientIp !== expectedIp) {
          return false;
        }
      } else if (cond.operator === 'NotIpAddress') {
        if (clientIp.startsWith(expectedIp.replace('/24', '').replace('/16', '')) || clientIp === expectedIp) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Core Authorization Decision Algorithm:
 * 1. Default = IMPLICIT_DENY
 * 2. If ANY matching statement has effect DENY -> EXPLICIT_DENY (stops immediately, overrides all allows)
 * 3. If a matching statement has effect ALLOW -> Allowed = true
 * 4. Result: if allowed && !denied -> ALLOW; otherwise IMPLICIT_DENY.
 */
export function evaluateCloudAuthorization(
  request: CloudAuthRequest,
  policies: CloudPolicy[]
): CloudAuthDecision {
  const evaluationSteps: EvaluationStep[] = [];
  let explicitDenyStatement: CloudPolicyStatement | null = null;
  let explicitDenyPolicy: CloudPolicy | null = null;
  let matchingAllowStatement: CloudPolicyStatement | null = null;
  let matchingAllowPolicy: CloudPolicy | null = null;

  for (const policy of policies) {
    for (const stmt of policy.statements) {
      const actionMatch = matchAction(stmt.actions, request.action);
      const resourceMatch = matchResource(stmt.resources, request.resource);
      const conditionMatch = matchConditions(stmt.conditions, request.context);

      const isTriggered = actionMatch && resourceMatch && conditionMatch;

      evaluationSteps.push({
        policyId: policy.id,
        policyName: policy.name,
        statementId: stmt.id,
        effect: stmt.effect,
        actionMatch,
        resourceMatch,
        conditionMatch,
        isTriggered,
      });

      if (isTriggered) {
        if (stmt.effect === 'DENY') {
          explicitDenyStatement = stmt;
          explicitDenyPolicy = policy;
          // Explicit DENY halts and overrides everything
          break;
        } else if (stmt.effect === 'ALLOW' && !matchingAllowStatement) {
          matchingAllowStatement = stmt;
          matchingAllowPolicy = policy;
        }
      }
    }

    if (explicitDenyStatement) {
      break;
    }
  }

  // Final evaluation logic
  if (explicitDenyStatement) {
    return {
      decision: 'EXPLICIT_DENY',
      isAllowed: false,
      matchedDenyStatementId: explicitDenyStatement.id,
      matchedPolicyName: explicitDenyPolicy?.name,
      decisionWhy: `Explicit DENY in policy '${explicitDenyPolicy?.name}' statement '${explicitDenyStatement.id}' overrides all allows.`,
      reasons: {
        en: `Request denied: Matched explicit DENY rule in statement '${explicitDenyStatement.id}' (${explicitDenyPolicy?.name}). Explicit Deny always overrides Allow.`,
        ar: `تم رفض الطلب: تطابق مع قاعدة حظر صريحة (Explicit DENY) في البند '${explicitDenyStatement.id}' (${explicitDenyPolicy?.name}). الحظر الصريح يتجاوز أي سماح دائمًا.`,
      },
      evaluationSteps,
    };
  }

  if (matchingAllowStatement) {
    return {
      decision: 'ALLOW',
      isAllowed: true,
      matchedAllowStatementId: matchingAllowStatement.id,
      matchedPolicyName: matchingAllowPolicy?.name,
      decisionWhy: `Allowed by policy '${matchingAllowPolicy?.name}' statement '${matchingAllowStatement.id}'. No matching explicit deny found.`,
      reasons: {
        en: `Request authorized: Permitted by policy '${matchingAllowPolicy?.name}' statement '${matchingAllowStatement.id}'.`,
        ar: `تم التصريح بالطلب: مسموح به بموجب السياسة '${matchingAllowPolicy?.name}' البند '${matchingAllowStatement.id}'.`,
      },
      evaluationSteps,
    };
  }

  // Default: Implicit Deny
  return {
    decision: 'IMPLICIT_DENY',
    isAllowed: false,
    decisionWhy: 'Implicit DENY: No statement granted explicit permission for this action and resource combination.',
    reasons: {
      en: `Request denied (Implicit Deny): No attached policy explicitly allows action '${request.action}' on resource '${request.resource}'.`,
      ar: `تم رفض الطلب (رفض ضمني): لا توجد أي سياسة تسمح صراحة بالإجراء '${request.action}' على المورد '${request.resource}'.`,
    },
    evaluationSteps,
  };
}
