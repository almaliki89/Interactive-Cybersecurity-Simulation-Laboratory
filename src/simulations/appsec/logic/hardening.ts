/**
 * Web & Application Security: Master Challenge Production Hardening Validator
 * Scenario: NEXORA CUSTOMER PORTAL
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SessionCookieAttributes } from './sessions';
import { CorsConfig } from './cors';
import { UploadSecurityPolicy } from './fileUpload';

export interface AppSecChallengeState {
  // 1. Session & Cookie
  cookieSettings: SessionCookieAttributes;
  sessionTtlMinutes: number;

  // 2. Access Control
  enforceObjectOwnership: boolean;
  financeRouteRequiredRole: 'Finance' | 'Customer' | 'None';

  // 3. Database Security
  databaseQueryMode: 'UNSAFE_CONCATENATION' | 'PARAMETERIZED_PREPARED_STATEMENT';

  // 4. Output Encoding & XSS
  enableContextAwareOutputEncoding: boolean;

  // 5. CSRF Defense
  enableCsrfTokensOnStateChangingRequests: boolean;

  // 6. JWT Security
  jwtValidateAudience: boolean;
  jwtValidateIssuer: boolean;
  jwtValidateExpiry: boolean;

  // 7. CORS
  corsConfig: CorsConfig;

  // 8. File Upload
  uploadPolicy: UploadSecurityPolicy;

  // 9. Rate Limiting
  enableLoginRateLimiting: boolean;
  loginMaxAttemptsPerMinute: number;

  // 10. Audit Logging
  enableSecurityAuditLogging: boolean;

  // 11. Security Headers
  responseHeaders: Record<string, string>;

  // 12. Business Continuity / Anti-Cheat Flags
  disableEntireApplication: boolean;
  grantAllUsersAdminRole: boolean;
  blockAllApiTraffic: boolean;
  disableCustomerFileUploadsEntirely: boolean;
}

export interface HardeningCheckResult {
  id: string;
  category: string;
  nameEn: string;
  nameAr: string;
  passed: boolean;
  score: number;
  weight: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  feedbackEn: string;
  feedbackAr: string;
}

export interface MasterValidationResult {
  success: boolean;
  score: number;
  passedChecks: string[];
  failedChecks: string[];
  checkDetails: HardeningCheckResult[];
  businessContinuityPassed: boolean;
  summaryEn: string;
  summaryAr: string;
}

/**
 * Returns the initial flawed state for Nexora Customer Portal
 */
export function getInitialChallengeState(): AppSecChallengeState {
  return {
    cookieSettings: {
      httpOnly: false, // Flaw: JavaScript can read session cookie
      secure: false, // Flaw: Transmitted over plaintext
      sameSite: 'None', // Flaw: Cross-site requests automatically attach cookie
      path: '/',
      maxAgeSeconds: 86400 * 30, // Flaw: Excessively long session (30 days)
    },
    sessionTtlMinutes: 43200,

    enforceObjectOwnership: false, // Flaw: BOLA / IDOR active
    financeRouteRequiredRole: 'None', // Flaw: Any authenticated customer can view finance reports

    databaseQueryMode: 'UNSAFE_CONCATENATION', // Flaw: SQLi present

    enableContextAwareOutputEncoding: false, // Flaw: Reflected XSS present

    enableCsrfTokensOnStateChangingRequests: false, // Flaw: CSRF active

    jwtValidateAudience: false, // Flaw: Accepts tokens minted for other services
    jwtValidateIssuer: false,
    jwtValidateExpiry: true,

    corsConfig: {
      allowedOrigins: ['*'], // Flaw: Wildcard with credentials
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['*'],
      allowCredentials: true, // Conflict with wildcard
    },

    uploadPolicy: {
      allowedExtensions: ['.pdf', '.png', '.jpg', '.php', '.exe'], // Flaw: Dangerous extensions permitted
      allowedMimeTypes: ['*/*'],
      maxSizeBytes: 50 * 1024 * 1024,
      enforceMagicBytesMatch: false,
      isolateStorageOutsideWebroot: false, // Flaw: Uploads stored in public webroot
      renameToUuidOrHash: false,
      disableExecutablePermissions: false,
    },

    enableLoginRateLimiting: false, // Flaw: Brute-force permitted
    loginMaxAttemptsPerMinute: 1000,

    enableSecurityAuditLogging: false, // Flaw: No forensic logs

    responseHeaders: {
      'server': 'Apache/2.4.41 (Ubuntu)',
      'x-powered-by': 'Express',
    },

    disableEntireApplication: false,
    grantAllUsersAdminRole: false,
    blockAllApiTraffic: false,
    disableCustomerFileUploadsEntirely: false,
  };
}

/**
 * Validates the Nexora Customer Portal security state against the 13 required enterprise checks
 */
export function validateAppSecurityState(state: AppSecChallengeState): MasterValidationResult {
  const checks: HardeningCheckResult[] = [];

  // ==========================================
  // Anti-Cheat & Business Continuity Checks
  // ==========================================
  if (state.disableEntireApplication) {
    return {
      success: false,
      score: 0,
      passedChecks: [],
      failedChecks: ['chk-business-continuity'],
      checkDetails: [{
        id: 'chk-business-continuity',
        category: 'Business Continuity',
        nameEn: 'Application Availability',
        nameAr: 'استمرارية عمل التطبيق',
        passed: false,
        score: 0,
        weight: 100,
        severity: 'CRITICAL',
        feedbackEn: 'FAIL: Application was disabled entirely. Security must preserve legitimate business operations.',
        feedbackAr: 'فشل: تم تعطيل التطبيق بالكامل. يجب أن تحافظ الإجراءات الأمنية على عمل المنظومة.',
      }],
      businessContinuityPassed: false,
      summaryEn: 'Anti-cheat trigger: Disabling application does not count as securing it.',
      summaryAr: 'تم إحباط محاولة التحايل: إيقاف التطبيق بالكامل ليس حلاً أمنياً.',
    };
  }

  if (state.grantAllUsersAdminRole) {
    return {
      success: false,
      score: 0,
      passedChecks: [],
      failedChecks: ['chk-least-privilege'],
      checkDetails: [{
        id: 'chk-least-privilege',
        category: 'Access Control',
        nameEn: 'Least Privilege Enforcement',
        nameAr: 'مبدأ الامتياز الأقل',
        passed: false,
        score: 0,
        weight: 100,
        severity: 'CRITICAL',
        feedbackEn: 'FAIL: Granting Admin role to all users violates least privilege principles.',
        feedbackAr: 'فشل: منح صلاحيات المسؤول لجميع المستخدمين ينتهك مبدأ الامتياز الأقل.',
      }],
      businessContinuityPassed: false,
      summaryEn: 'Anti-cheat trigger: Granting superuser rights to everyone breaks access control.',
      summaryAr: 'تم إحباط محاولة التحايل: منح الصلاحيات الشاملة للجميع يخترق قواعد التحكم بالوصول.',
    };
  }

  if (state.blockAllApiTraffic || state.disableCustomerFileUploadsEntirely) {
    return {
      success: false,
      score: 0,
      passedChecks: [],
      failedChecks: ['chk-business-workflow'],
      checkDetails: [{
        id: 'chk-business-workflow',
        category: 'Business Continuity',
        nameEn: 'Customer Workflow Integrity',
        nameAr: 'سلامة مسارات عمل العملاء',
        passed: false,
        score: 0,
        weight: 100,
        severity: 'CRITICAL',
        feedbackEn: 'FAIL: Required customer business workflows (API / Uploads) were disabled rather than secured.',
        feedbackAr: 'فشل: تم تعطيل مسارات عمل العملاء بدلاً من تأمينها بالشكل الصحيح.',
      }],
      businessContinuityPassed: false,
      summaryEn: 'Customer workflows broken.',
      summaryAr: 'مسارات عمل العملاء تعطلت.',
    };
  }

  // 1. Session Cookie Hardening
  const cookieSecure =
    state.cookieSettings.httpOnly &&
    state.cookieSettings.secure &&
    (state.cookieSettings.sameSite === 'Lax' || state.cookieSettings.sameSite === 'Strict');
  checks.push({
    id: 'chk-session-cookie',
    category: 'Sessions',
    nameEn: 'Session Cookie Attributes (HttpOnly, Secure, SameSite)',
    nameAr: 'سمات أمان كوكيز الجلسة (HttpOnly, Secure, SameSite)',
    passed: cookieSecure,
    score: cookieSecure ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: cookieSecure
      ? 'PASS: Session cookie hardened with HttpOnly, Secure, and SameSite protection.'
      : 'FAIL: Session cookie lacks HttpOnly, Secure, or proper SameSite policy.',
    feedbackAr: cookieSecure
      ? 'نجاح: تم تأمين كوكيز الجلسة بسمات HttpOnly و Secure و SameSite.'
      : 'فشل: كوكيز الجلسة تفتقر لسمات الحماية الصارمة.',
  });

  // 2. Horizontal Resource Ownership (BOLA / IDOR)
  const idorDefended = state.enforceObjectOwnership;
  checks.push({
    id: 'chk-object-ownership',
    category: 'Access Control',
    nameEn: 'Object-Level Authorization & IDOR Defense',
    nameAr: 'التفويض على مستوى الكائنات وحماية IDOR',
    passed: idorDefended,
    score: idorDefended ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: idorDefended
      ? "PASS: Resource ownership checks prevent Bob from viewing Alice's orders."
      : 'FAIL: BOLA vulnerability active: Authenticated users can read arbitrary customer orders.',
    feedbackAr: idorDefended
      ? 'نجاح: التحقق من ملكية الكائنات يمنع الوصول غير المصرح به بين العملاء.'
      : 'فشل: ثغرة BOLA نشطة: يمكن للمستخدمين قراءة طلبات عملاء آخرين.',
  });

  // 3. Finance Role-Based Authorization
  const financeRbac = state.financeRouteRequiredRole === 'Finance';
  checks.push({
    id: 'chk-finance-rbac',
    category: 'Access Control',
    nameEn: 'Role-Based Access Control on Financial Reports',
    nameAr: 'التحكم بالوصول حسب الأدوار للتقارير المالية',
    passed: financeRbac,
    score: financeRbac ? 8 : 0,
    weight: 8,
    severity: 'HIGH',
    feedbackEn: financeRbac
      ? 'PASS: Finance route strictly restricted to Finance role.'
      : 'FAIL: Finance ledger is exposed to generic Customer role without RBAC enforcement.',
    feedbackAr: financeRbac
      ? 'نجاح: مسار التقارير المالية مقيد حصراً بدور المالية (Finance).'
      : 'فشل: سجلات المالية مكشوفة للمستخدمين العاديين دون تدقيق الدور.',
  });

  // 4. Parameterized Database Queries (SQLi Defense)
  const sqliDefended = state.databaseQueryMode === 'PARAMETERIZED_PREPARED_STATEMENT';
  checks.push({
    id: 'chk-sqli-parameterized',
    category: 'Database',
    nameEn: 'Parameterized Prepared Statements (SQLi Defense)',
    nameAr: 'الاستعلامات المعلمية المجهزة ومنع حقن SQL',
    passed: sqliDefended,
    score: sqliDefended ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: sqliDefended
      ? 'PASS: Parameterized query builder eradicates SQL injection vulnerabilities.'
      : 'FAIL: Unsafe string concatenation builder permits SQL command injection.',
    feedbackAr: sqliDefended
      ? 'نجاح: الاستعلامات المعلمية تقضي كلياً على ثغرات حقن SQL.'
      : 'فشل: دمج النصوص غير الآمن يسمح بحقن أوامر SQL خبيثة.',
  });

  // 5. Context-Aware Output Encoding (XSS Defense)
  const xssDefended = state.enableContextAwareOutputEncoding;
  checks.push({
    id: 'chk-xss-encoding',
    category: 'XSS Defense',
    nameEn: 'Context-Aware Output Encoding',
    nameAr: 'ترميز المخرجات المراعي للسياق ومنع XSS',
    passed: xssDefended,
    score: xssDefended ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: xssDefended
      ? 'PASS: Reflected data is entity-encoded before rendering in HTML/DOM.'
      : 'FAIL: Reflected untrusted input renders unescaped in DOM context.',
    feedbackAr: xssDefended
      ? 'نجاح: يتم ترميز البيانات المنعكسة قبل عرضها في المتصفح.'
      : 'فشل: البيانات غير المعالجة يتم حقنها مباشرة في كود الصفحة.',
  });

  // 6. Anti-CSRF Token Enforcement
  const csrfDefended = state.enableCsrfTokensOnStateChangingRequests;
  checks.push({
    id: 'chk-csrf-protection',
    category: 'CSRF Defense',
    nameEn: 'Anti-CSRF Tokens on State-Changing Endpoints',
    nameAr: 'رموز الحماية ضد CSRF على المسارات المحدثة للحالة',
    passed: csrfDefended,
    score: csrfDefended ? 8 : 0,
    weight: 8,
    severity: 'HIGH',
    feedbackEn: csrfDefended
      ? 'PASS: Synchronizer anti-CSRF token validation active on POST/PUT endpoints.'
      : 'FAIL: State-changing operations vulnerable to cross-origin forged requests.',
    feedbackAr: csrfDefended
      ? 'نجاح: التحقق من رموز anti-CSRF مفعل على العمليات الحساسة.'
      : 'فشل: العمليات المحدثة للحالة عرضة لهجمات التزوير عبر المواقع.',
  });

  // 7. JWT Claims Validation (Issuer, Audience, Expiration)
  const jwtHardened = state.jwtValidateAudience && state.jwtValidateIssuer && state.jwtValidateExpiry;
  checks.push({
    id: 'chk-jwt-validation',
    category: 'JWT Security',
    nameEn: 'JWT Audience, Issuer, and Expiration Validation',
    nameAr: 'التحقق من جهة إصدار وجمهور وصلاحية رمز JWT',
    passed: jwtHardened,
    score: jwtHardened ? 8 : 0,
    weight: 8,
    severity: 'HIGH',
    feedbackEn: jwtHardened
      ? 'PASS: JWT validation verifies issuer (iss), audience (aud), and timestamp (exp).'
      : 'FAIL: JWT parser accepts foreign tokens without strict audience/issuer verification.',
    feedbackAr: jwtHardened
      ? 'نجاح: التحقق الصارم من المصدر والجمهور وتاريخ الصلاحية لرمز JWT.'
      : 'فشل: معالج JWT يقبل رموزاً غير مخصصة لهذه الخدمة.',
  });

  // 8. CORS Configuration Hardening
  const corsValid =
    !state.corsConfig.allowedOrigins.includes('*') &&
    state.corsConfig.allowedOrigins.length > 0 &&
    state.corsConfig.allowCredentials;
  checks.push({
    id: 'chk-cors-hardening',
    category: 'CORS',
    nameEn: 'Restricted CORS Origins with Explicit Allowlist',
    nameAr: 'تقييد نطاقات CORS بقائمة بيضاء صريحة',
    passed: corsValid,
    score: corsValid ? 6 : 0,
    weight: 6,
    severity: 'HIGH',
    feedbackEn: corsValid
      ? 'PASS: CORS configured with explicit trusted origins allowlist.'
      : 'FAIL: Overly permissive CORS wildcard (*) origin combined with credentials.',
    feedbackAr: corsValid
      ? 'نجاح: تم ضبط CORS بقائمة بيضاء محددة للنطاقات الموثوقة.'
      : 'فشل: إعدادات CORS متساهلة وتستخدم النجمة (*) مع بيانات الاعتماد.',
  });

  // 9. File Upload Security Hardening
  const dangerousExtAllowed = state.uploadPolicy.allowedExtensions.some((e) =>
    ['.php', '.exe', '.sh', '.jsp', '.asp'].includes(e.toLowerCase())
  );
  const uploadSecure =
    !dangerousExtAllowed &&
    state.uploadPolicy.isolateStorageOutsideWebroot &&
    state.uploadPolicy.renameToUuidOrHash &&
    state.uploadPolicy.enforceMagicBytesMatch;
  checks.push({
    id: 'chk-upload-hardening',
    category: 'File Upload',
    nameEn: 'File Upload Hardening (Extension Whitelist, Magic Bytes, Isolated Storage)',
    nameAr: 'تأمين رفع الملفات (القائمة البيضاء، فحص الترويسة، التخزين المعزول)',
    passed: uploadSecure,
    score: uploadSecure ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: uploadSecure
      ? 'PASS: Executable extensions blocked, magic bytes verified, files isolated outside webroot.'
      : 'FAIL: Insecure upload handling permits dangerous extensions or public webroot execution.',
    feedbackAr: uploadSecure
      ? 'نجاح: حظر الامتدادات الخطيرة وفحص البايتات السحرية وعزل مسار التخزين.'
      : 'فشل: معالجة غير آمنة تسمح برفع نصوص برمجية وتنفيذها داخل webroot.',
  });

  // 10. Rate Limiting on Authentication
  const rateLimitSecure = state.enableLoginRateLimiting && state.loginMaxAttemptsPerMinute <= 10;
  checks.push({
    id: 'chk-rate-limiting',
    category: 'Rate Limiting',
    nameEn: 'Login Rate Limiting (Brute-Force & Credential Stuffing Defense)',
    nameAr: 'تقييد معدل محاولات تسجيل الدخول وحماية التخمين',
    passed: rateLimitSecure,
    score: rateLimitSecure ? 6 : 0,
    weight: 6,
    severity: 'MEDIUM',
    feedbackEn: rateLimitSecure
      ? 'PASS: Login endpoint protected by strict rate limiting policy.'
      : 'FAIL: Authentication endpoint lacks rate limiting, allowing unlimited brute force.',
    feedbackAr: rateLimitSecure
      ? 'نجاح: حماية مسار تسجيل الدخول بتقييد صارم للمعدل.'
      : 'فشل: مسار المصادقة يفتقر لتقييد المعدل مما يتيح التخمين غير المحدود.',
  });

  // 11. Security Headers Configuration
  const headers = state.responseHeaders;
  const hasCsp = Boolean(headers['Content-Security-Policy'] || headers['content-security-policy']);
  const hasHsts = Boolean(headers['Strict-Transport-Security'] || headers['strict-transport-security']);
  const hasNosniff = Boolean(headers['X-Content-Type-Options'] || headers['x-content-type-options']);
  const headersSecure = hasCsp && hasHsts && hasNosniff;
  checks.push({
    id: 'chk-security-headers',
    category: 'Security Headers',
    nameEn: 'HTTP Defensive Security Headers (CSP, HSTS, X-Content-Type-Options)',
    nameAr: 'الترويسات الأمنية الدفاعية (CSP, HSTS, X-Content-Type-Options)',
    passed: headersSecure,
    score: headersSecure ? 6 : 0,
    weight: 6,
    severity: 'HIGH',
    feedbackEn: headersSecure
      ? 'PASS: Strict CSP, HSTS, and X-Content-Type-Options headers active on responses.'
      : 'FAIL: Missing essential security headers (CSP / HSTS / nosniff).',
    feedbackAr: headersSecure
      ? 'نجاح: ترويسات CSP و HSTS و nosniff مفعلة بنجاح.'
      : 'فشل: ترويسات الحماية الأساسية مفقودة.',
  });

  // 12. Security Audit Logging
  const loggingActive = state.enableSecurityAuditLogging;
  checks.push({
    id: 'chk-audit-logging',
    category: 'Audit & SIEM',
    nameEn: 'Centralized Security Audit Logging',
    nameAr: 'سجلات التدقيق الأمني المركزية',
    passed: loggingActive,
    score: loggingActive ? 4 : 0,
    weight: 4,
    severity: 'MEDIUM',
    feedbackEn: loggingActive
      ? 'PASS: Real-time authentication, authorization, and validation events logged for SOC SIEM.'
      : 'FAIL: Application security events are silent with no audit trail.',
    feedbackAr: loggingActive
      ? 'نجاح: تسجيل أحداث المصادقة والتفويض والتحقق في سجلات الأمان.'
      : 'فشل: لا توجد سجلات تدقيق ترصد الأنشطة الأمنية.',
  });

  // 13. Customer Workflow Continuity
  const workflowContinuity =
    !state.disableEntireApplication &&
    !state.grantAllUsersAdminRole &&
    !state.blockAllApiTraffic &&
    !state.disableCustomerFileUploadsEntirely;
  checks.push({
    id: 'chk-customer-workflows',
    category: 'Business Continuity',
    nameEn: 'Customer Portal Core Workflows Integrity',
    nameAr: 'سلامة مسارات عمل بوابة العملاء الأساسية',
    passed: workflowContinuity,
    score: workflowContinuity ? 4 : 0,
    weight: 4,
    severity: 'HIGH',
    feedbackEn: 'PASS: Valid customer operations and business flows remain fully functional.',
    feedbackAr: 'نجاح: عمليات العملاء المشروعة تعمل بكفاءة تامة.',
  });

  const passedChecks = checks.filter((c) => c.passed).map((c) => c.id);
  const failedChecks = checks.filter((c) => !c.passed).map((c) => c.id);
  const totalEarnedScore = checks.reduce((acc, c) => acc + c.score, 0);

  const isSuccess = failedChecks.length === 0 && totalEarnedScore === 100;

  return {
    success: isSuccess,
    score: totalEarnedScore,
    passedChecks,
    failedChecks,
    checkDetails: checks,
    businessContinuityPassed: workflowContinuity,
    summaryEn: isSuccess
      ? 'NEXORA PORTAL HARDENED: All 12 security controls + 1 business continuity requirement verified. Enterprise posture achieved!'
      : `PORTAL SECURITY INCOMPLETE: Score ${totalEarnedScore}/100. ${failedChecks.length} defense control(s) require remediation.`,
    summaryAr: isSuccess
      ? 'تم تأمين بوابة Nexora بالكامل: تم اجتياز جميع الضوابط الأمنية الـ 12 + متطلب استمرارية الأعمال بنجاح!'
      : `الأمان غير مكتمل: النتيجة ${totalEarnedScore}/100. هناك ${failedChecks.length} ضابط أمني بحاجة لإصلاح.`,
  };
}
