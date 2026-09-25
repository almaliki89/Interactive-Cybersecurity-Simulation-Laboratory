/**
 * Web & Application Security: Security Audit & SIEM Logging Model
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type AppSecEventType =
  | 'APP_AUTH_SUCCESS'
  | 'APP_AUTH_FAIL'
  | 'APP_ACCESS_DENIED'
  | 'APP_VALIDATION_FAIL'
  | 'APP_RATE_LIMIT'
  | 'APP_ADMIN_ACTION'
  | 'APP_SESSION_REVOKED'
  | 'APP_SENSITIVE_ACCESS'
  | 'APP_UPLOAD_REJECTED';

export type AppSecSeverity = 'INFO' | 'WARN' | 'ALERT' | 'CRITICAL';

export interface AppSecLogEntry {
  id: string; // Deterministic e.g. `app-log-${seq}-${virtualTime}`
  type: AppSecEventType;
  severity: AppSecSeverity;
  virtualTime: number;
  sourceIp: string;
  userId?: string;
  username?: string;
  endpoint: string;
  httpMethod: string;
  statusCode: number;
  messageEn: string;
  messageAr: string;
  metadata: Record<string, unknown>;
}

export interface AppSecLogFilterOptions {
  type?: string;
  severity?: string;
  userId?: string;
  searchQuery?: string;
}

export const INITIAL_APPSEC_LOGS: AppSecLogEntry[] = [
  {
    id: 'app-log-001-0',
    type: 'APP_AUTH_SUCCESS',
    severity: 'INFO',
    virtualTime: 0,
    sourceIp: '192.168.1.50',
    userId: 'usr-alice',
    username: 'alice',
    endpoint: '/api/v1/auth/login',
    httpMethod: 'POST',
    statusCode: 200,
    messageEn: "User 'alice' authenticated successfully via password + MFA.",
    messageAr: "تم توثيق المستخدم 'alice' بنجاح باستخدام كلمة المرور و MFA.",
    metadata: { authMethod: 'MFA_TOTP', userAgent: 'NexoraBrowser/1.0' },
  },
  {
    id: 'app-log-002-150',
    type: 'APP_ACCESS_DENIED',
    severity: 'WARN',
    virtualTime: 150,
    sourceIp: '192.168.1.55',
    userId: 'usr-bob',
    username: 'bob',
    endpoint: '/api/v1/orders/1001',
    httpMethod: 'GET',
    statusCode: 403,
    messageEn: "BOLA Violation: User 'bob' attempted unauthorized read of Alice's order #1001.",
    messageAr: "انتهاك تفويض: حاول المستخدم 'bob' الوصول غير المصرح به لطلب Alice #1001.",
    metadata: { targetOwnerId: 'usr-alice', requestedResource: 'ord-1001' },
  },
  {
    id: 'app-log-003-300',
    type: 'APP_VALIDATION_FAIL',
    severity: 'ALERT',
    virtualTime: 300,
    sourceIp: '10.0.99.12',
    endpoint: '/api/v1/search',
    httpMethod: 'GET',
    statusCode: 400,
    messageEn: "Input Validation Blocked: Injected SQL tautology in parameter 'q'.",
    messageAr: "تم حظر المدخلات: تم رصد محاولة حقن SQL في المعلمة 'q'.",
    metadata: { param: 'q', rawValue: "' OR 1=1 --" },
  },
  {
    id: 'app-log-004-450',
    type: 'APP_RATE_LIMIT',
    severity: 'WARN',
    virtualTime: 450,
    sourceIp: '192.168.1.88',
    endpoint: '/api/v1/auth/login',
    httpMethod: 'POST',
    statusCode: 429,
    messageEn: 'Rate limit triggered on login endpoint (10 failed requests/minute).',
    messageAr: 'تم تفعيل حظر المعدل على مسار تسجيل الدخول (10 طلبات فاشلة / دقيقة).',
    metadata: { limit: 10, window: '60s' },
  },
];

/**
 * Creates a deterministic AppSec log entry
 */
export function createAppSecLog(params: {
  type: AppSecEventType;
  severity: AppSecSeverity;
  virtualTime: number;
  sourceIp?: string;
  userId?: string;
  username?: string;
  endpoint: string;
  httpMethod: string;
  statusCode: number;
  messageEn: string;
  messageAr: string;
  metadata?: Record<string, unknown>;
  sequence?: number;
}): AppSecLogEntry {
  const seq = params.sequence ?? 1;
  return {
    id: `app-log-${seq}-${params.virtualTime}`,
    type: params.type,
    severity: params.severity,
    virtualTime: params.virtualTime,
    sourceIp: params.sourceIp ?? '192.168.1.50',
    userId: params.userId,
    username: params.username,
    endpoint: params.endpoint,
    httpMethod: params.httpMethod,
    statusCode: params.statusCode,
    messageEn: params.messageEn,
    messageAr: params.messageAr,
    metadata: params.metadata || {},
  };
}

/**
 * Filters AppSec logs based on user search and filters
 */
export function filterAppSecLogs(
  logs: AppSecLogEntry[],
  opts: AppSecLogFilterOptions
): AppSecLogEntry[] {
  return logs.filter((l) => {
    if (opts.type && opts.type !== 'ALL' && l.type !== opts.type) return false;
    if (opts.severity && opts.severity !== 'ALL' && l.severity !== opts.severity) return false;
    if (opts.userId && l.userId !== opts.userId) return false;

    if (opts.searchQuery && opts.searchQuery.trim() !== '') {
      const q = opts.searchQuery.toLowerCase();
      const matchMsg = l.messageEn.toLowerCase().includes(q) || l.messageAr.toLowerCase().includes(q);
      const matchEndpoint = l.endpoint.toLowerCase().includes(q);
      const matchUser = l.username?.toLowerCase().includes(q);
      const matchIp = l.sourceIp.includes(q);
      if (!matchMsg && !matchEndpoint && !matchUser && !matchIp) return false;
    }

    return true;
  });
}
