/**
 * Web & Application Security: Session Management & Cookie Security
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type SameSitePolicy = 'Strict' | 'Lax' | 'None';

export interface SessionCookieAttributes {
  httpOnly: boolean;
  secure: boolean;
  sameSite: SameSitePolicy;
  path: string;
  domain?: string;
  maxAgeSeconds?: number;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  username: string;
  role: 'Customer' | 'Finance' | 'Manager' | 'Administrator';
  createdAtVirtualTime: number;
  lastActiveVirtualTime: number;
  expiresAtVirtualTime: number;
  isValid: boolean;
  ipAddress: string;
  userAgent: string;
  csrfToken: string;
  cookieAttributes: SessionCookieAttributes;
}

export interface SessionValidationResult {
  valid: boolean;
  session?: UserSession;
  failureReason?: 'SESSION_NOT_FOUND' | 'SESSION_EXPIRED' | 'SESSION_REVOKED' | 'IP_MISMATCH' | 'INSECURE_COOKIE_REJECTED';
  reasonEn: string;
  reasonAr: string;
}

/**
 * Creates a new deterministic user session
 */
export function createSession(params: {
  userId: string;
  username: string;
  role: UserSession['role'];
  virtualTime: number;
  ttlSeconds?: number;
  ipAddress?: string;
  userAgent?: string;
  cookieAttributes?: Partial<SessionCookieAttributes>;
  sequence?: number;
}): UserSession {
  const ttl = params.ttlSeconds ?? 3600;
  const seq = params.sequence ?? 1;
  const sessionId = `sess_${params.userId}_${params.virtualTime}_${seq}`;
  const csrfToken = `csrf_${params.userId}_${params.virtualTime}_${seq}`;

  const defaultCookie: SessionCookieAttributes = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAgeSeconds: ttl,
  };

  return {
    sessionId,
    userId: params.userId,
    username: params.username,
    role: params.role,
    createdAtVirtualTime: params.virtualTime,
    lastActiveVirtualTime: params.virtualTime,
    expiresAtVirtualTime: params.virtualTime + ttl,
    isValid: true,
    ipAddress: params.ipAddress ?? '192.168.1.50',
    userAgent: params.userAgent ?? 'Mozilla/5.0 NexoraBrowser',
    csrfToken,
    cookieAttributes: {
      ...defaultCookie,
      ...(params.cookieAttributes || {}),
    },
  };
}

/**
 * Validates a session against current virtual time and policy
 */
export function validateSession(
  session: UserSession | undefined,
  currentVirtualTime: number,
  clientIp?: string
): SessionValidationResult {
  if (!session) {
    return {
      valid: false,
      failureReason: 'SESSION_NOT_FOUND',
      reasonEn: 'Session ID was not found in active session store.',
      reasonAr: 'معرف الجلسة غير موجود في مخزن الجلسات النشطة.',
    };
  }

  if (!session.isValid) {
    return {
      valid: false,
      failureReason: 'SESSION_REVOKED',
      reasonEn: 'Session has been invalidated or logged out.',
      reasonAr: 'تم إبطال الجلسة أو تسجيل الخروج منها.',
    };
  }

  if (currentVirtualTime > session.expiresAtVirtualTime) {
    return {
      valid: false,
      failureReason: 'SESSION_EXPIRED',
      reasonEn: `Session expired at virtual time T+${session.expiresAtVirtualTime} (current: T+${currentVirtualTime}).`,
      reasonAr: `انتهت صلاحية الجلسة عند الوقت الافتراضي T+${session.expiresAtVirtualTime}.`,
    };
  }

  if (clientIp && session.ipAddress !== clientIp) {
    return {
      valid: false,
      failureReason: 'IP_MISMATCH',
      reasonEn: `Session IP mismatch: expected ${session.ipAddress}, received from ${clientIp}.`,
      reasonAr: `عدم تطابق عنوان IP للجلسة: المتوقع ${session.ipAddress}، والوارد ${clientIp}.`,
    };
  }

  return {
    valid: true,
    session,
    reasonEn: 'Session is active, valid, and authenticated.',
    reasonAr: 'الجلسة نشطة وصالحة وموثقة بنجاح.',
  };
}

/**
 * Rotates a session (Session Fixation Defense) upon authentication/privilege change
 */
export function rotateSession(
  oldSession: UserSession,
  virtualTime: number,
  sequence: number = 2
): { oldSession: UserSession; newSession: UserSession } {
  // Invalidate old session
  const revokedOld: UserSession = {
    ...oldSession,
    isValid: false,
  };

  // Create rotated new session
  const newSession: UserSession = {
    ...oldSession,
    sessionId: `sess_${oldSession.userId}_${virtualTime}_${sequence}`,
    createdAtVirtualTime: virtualTime,
    lastActiveVirtualTime: virtualTime,
    expiresAtVirtualTime: virtualTime + (oldSession.cookieAttributes.maxAgeSeconds ?? 3600),
    isValid: true,
    csrfToken: `csrf_${oldSession.userId}_${virtualTime}_${sequence}`,
  };

  return { oldSession: revokedOld, newSession };
}

/**
 * Explicitly revokes / expires a session upon user logout
 */
export function expireSession(session: UserSession): UserSession {
  return {
    ...session,
    isValid: false,
  };
}
