/**
 * Web & Application Security: Cross-Site Request Forgery (CSRF) & SameSite Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SameSitePolicy } from './sessions';

export interface CsrfRequestScenario {
  requestOrigin: string;
  targetOrigin: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  isStateChanging: boolean;
  sameSitePolicy: SameSitePolicy;
  cookieSentByBrowser: boolean;
  providedCsrfToken?: string;
  expectedCsrfToken?: string;
}

export interface CsrfEvaluationResult {
  allowed: boolean;
  cookiesIncluded: boolean;
  csrfTokenValid: boolean;
  attackBlocked: boolean;
  decisionReasonEn: string;
  decisionReasonAr: string;
  statusCode: 200 | 403;
}

/**
 * Evaluates whether browser sends session cookies on cross-origin requests based on SameSite
 */
export function evaluateSameSiteBehavior(
  requestOrigin: string,
  targetOrigin: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  policy: SameSitePolicy
): boolean {
  const isSameOrigin = requestOrigin === targetOrigin;
  if (isSameOrigin) return true;

  // Cross-origin request
  switch (policy) {
    case 'Strict':
      // Never send on cross-origin requests
      return false;
    case 'Lax':
      // Sent ONLY on top-level safe GET navigations, NOT on cross-origin POST/PUT/DELETE
      return method === 'GET';
    case 'None':
      // Sent automatically on all cross-site requests (Vulnerable without CSRF token)
      return true;
  }
}

/**
 * Evaluates CSRF protection defenses (SameSite + Anti-CSRF Token)
 */
export function validateCsrfProtection(scenario: CsrfRequestScenario): CsrfEvaluationResult {
  const isSameOrigin = scenario.requestOrigin === scenario.targetOrigin;

  // 1. Determine if browser attached cookies
  const cookiesIncluded =
    scenario.cookieSentByBrowser ||
    evaluateSameSiteBehavior(
      scenario.requestOrigin,
      scenario.targetOrigin,
      scenario.method,
      scenario.sameSitePolicy
    );

  // Safe read-only methods don't alter state
  if (!scenario.isStateChanging && scenario.method === 'GET') {
    return {
      allowed: true,
      cookiesIncluded,
      csrfTokenValid: true,
      attackBlocked: false,
      decisionReasonEn: 'Safe read-only request (GET). No state change occurs.',
      decisionReasonAr: 'طلب قراءة آمن (GET) لا يُحدث أي تغييرات في حالة النظام.',
      statusCode: 200,
    };
  }

  // 2. If cross-origin and SameSite blocked cookies, attack fails at browser layer
  if (!isSameOrigin && !cookiesIncluded) {
    return {
      allowed: false,
      cookiesIncluded: false,
      csrfTokenValid: false,
      attackBlocked: true,
      decisionReasonEn: `DEFENDED: SameSite=${scenario.sameSitePolicy} blocked ambient cookie inclusion on cross-origin ${scenario.method}.`,
      decisionReasonAr: `تم التصدي بنجاح: خاصية SameSite=${scenario.sameSitePolicy} منعت المتصفح من إرسال الكوكيز تلقائياً.`,
      statusCode: 403,
    };
  }

  // 3. Check Synchronizer CSRF Token (Defense in depth)
  const tokenValid = Boolean(
    scenario.expectedCsrfToken &&
    scenario.providedCsrfToken &&
    scenario.providedCsrfToken === scenario.expectedCsrfToken
  );

  if (tokenValid) {
    return {
      allowed: true,
      cookiesIncluded,
      csrfTokenValid: true,
      attackBlocked: false,
      decisionReasonEn: 'SECURE: Valid anti-CSRF token verified. Request authorized.',
      decisionReasonAr: 'آمن: تم التحقق من رمز anti-CSRF الصالح. الطلب موثوق.',
      statusCode: 200,
    };
  }

  // If cross-origin, cookies attached, but no valid CSRF token -> CSRF Vulnerability / Attack Succeeded or Denied
  if (!isSameOrigin) {
    return {
      allowed: false,
      cookiesIncluded: true,
      csrfTokenValid: false,
      attackBlocked: true,
      decisionReasonEn:
        'BLOCKED: State-changing cross-origin request lacked valid Anti-CSRF Token header / payload.',
      decisionReasonAr:
        'تم الحظر: الطلب المغير للحالة صادر من نطاق خارجي ويفتقر لرمز حماية CSRF صالح.',
      statusCode: 403,
    };
  }

  // Same-origin state changing request requires token if configured
  return {
    allowed: tokenValid,
    cookiesIncluded: true,
    csrfTokenValid: tokenValid,
    attackBlocked: !tokenValid,
    decisionReasonEn: tokenValid
      ? 'Same-origin request passed with valid CSRF token.'
      : 'Same-origin request rejected: missing required CSRF token.',
    decisionReasonAr: tokenValid
      ? 'تم قبول الطلب من نفس النطاق مع رمز CSRF صالح.'
      : 'تم رفض الطلب لعدم وجود رمز CSRF المطلوب.',
    statusCode: tokenValid ? 200 : 403,
  };
}
