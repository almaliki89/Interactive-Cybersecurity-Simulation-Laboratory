/**
 * Kerberos Protocol State Machine & Ticket Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type KerberosState =
  | 'IDLE'
  | 'AS_REQ_SENT'
  | 'TGT_ISSUED'
  | 'TGS_REQ_SENT'
  | 'SERVICE_TICKET_ISSUED'
  | 'AP_REQ_SENT'
  | 'AUTHENTICATED'
  | 'FAILED';

export type TicketType = 'TGT' | 'SERVICE';
export type TicketStatus = 'VALID' | 'EXPIRED' | 'REVOKED';
export type EncryptionType = 'AES-256' | 'RC4';

export interface KerberosTicket {
  id: string;
  type: TicketType;
  clientPrincipal: string; // e.g. "sara@corp.nexora.local"
  servicePrincipal: string; // e.g. "krbtgt/corp.nexora.local" or "cifs/fin-srv01.corp.nexora.local"
  realm: string;
  issuedAtVirtualTime: number;
  expiresAtVirtualTime: number;
  renewableUntil?: number;
  status: TicketStatus;
  pacGroups: string[];
  encryptionType: EncryptionType;
  sessionKey: string;
}

export type KerberosFailureReason =
  | 'NONE'
  | 'WRONG_PASSWORD'
  | 'ACCOUNT_DISABLED'
  | 'USER_UNKNOWN'
  | 'SPN_UNKNOWN'
  | 'TGT_EXPIRED'
  | 'SERVICE_TICKET_EXPIRED'
  | 'CLOCK_SKEW'
  | 'KDC_UNAVAILABLE'
  | 'AUTHORIZATION_DENIED';

export interface KerberosExchangeContext {
  clientPrincipal: string;
  targetSpn: string;
  clientVirtualTime: number;
  kdcVirtualTime: number;
  accountEnabled: boolean;
  passwordValid: boolean;
  userKnown: boolean;
  spnKnown: boolean;
  kdcAvailable: boolean;
  pacGroups: string[];
  encryptionType: EncryptionType;
  ticketLifetime: number; // e.g. 600 virtual seconds
  maxClockSkew: number; // e.g. 300 virtual seconds
  forcedFailure?: KerberosFailureReason;
  seq?: number;
}

export interface KerberosStepResult {
  nextState: KerberosState;
  ticketIssued?: KerberosTicket;
  failureReason: KerberosFailureReason;
  messageEn: string;
  messageAr: string;
  virtualTimestamp: number;
}

/**
 * Builds a deterministic ticket ID.
 */
export function buildDeterministicTicketId(
  type: TicketType,
  clientPrincipal: string,
  virtualTime: number,
  seq: number = 1
): string {
  const cleanName = clientPrincipal.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  return `${type.toLowerCase()}-${cleanName}-${virtualTime}-${seq}`;
}

/**
 * Validates clock skew between client and KDC virtual time.
 */
export function checkClockSkew(
  clientVirtualTime: number,
  kdcVirtualTime: number,
  maxSkewSeconds: number = 300
): boolean {
  return Math.abs(clientVirtualTime - kdcVirtualTime) <= maxSkewSeconds;
}

/**
 * Advances the Kerberos protocol state machine by one deterministic step.
 */
export function advanceKerberosProtocol(
  currentState: KerberosState,
  ctx: KerberosExchangeContext,
  currentTgt?: KerberosTicket,
  currentServiceTicket?: KerberosTicket
): KerberosStepResult {
  const seq = ctx.seq || 1;

  switch (currentState) {
    case 'IDLE': {
      // Step 1: Client sends AS-REQ to KDC Authentication Service
      if (!ctx.kdcAvailable || ctx.forcedFailure === 'KDC_UNAVAILABLE') {
        return {
          nextState: 'FAILED',
          failureReason: 'KDC_UNAVAILABLE',
          messageEn: 'AS-REQ Failed: Domain Controller / KDC is unreachable.',
          messageAr: 'فشل طلب AS-REQ: تعذر الوصول إلى خادم النطاق / KDC.',
          virtualTimestamp: ctx.clientVirtualTime,
        };
      }

      if (!checkClockSkew(ctx.clientVirtualTime, ctx.kdcVirtualTime, ctx.maxClockSkew) || ctx.forcedFailure === 'CLOCK_SKEW') {
        return {
          nextState: 'FAILED',
          failureReason: 'CLOCK_SKEW',
          messageEn: `AS-REQ Pre-Auth Failed: Clock skew (${Math.abs(ctx.clientVirtualTime - ctx.kdcVirtualTime)}s) exceeds maximum allowed limit (${ctx.maxClockSkew}s).`,
          messageAr: `فشل التحقق المسبق: فارق توقيت الساعة (${Math.abs(ctx.clientVirtualTime - ctx.kdcVirtualTime)}ث) يتجاوز الحد المسموح به (${ctx.maxClockSkew}ث).`,
          virtualTimestamp: ctx.clientVirtualTime,
        };
      }

      if (!ctx.userKnown || ctx.forcedFailure === 'USER_UNKNOWN') {
        return {
          nextState: 'FAILED',
          failureReason: 'USER_UNKNOWN',
          messageEn: `AS-REQ Failed: Principal '${ctx.clientPrincipal}' does not exist in domain directory.`,
          messageAr: `فشل طلب AS-REQ: المستخدم '${ctx.clientPrincipal}' غير مسجل في دليل النطاق.`,
          virtualTimestamp: ctx.clientVirtualTime,
        };
      }

      if (!ctx.accountEnabled || ctx.forcedFailure === 'ACCOUNT_DISABLED') {
        return {
          nextState: 'FAILED',
          failureReason: 'ACCOUNT_DISABLED',
          messageEn: `AS-REQ Failed: Account '${ctx.clientPrincipal}' is disabled.`,
          messageAr: `فشل طلب AS-REQ: الحساب '${ctx.clientPrincipal}' معطل حالياً.`,
          virtualTimestamp: ctx.clientVirtualTime,
        };
      }

      if (!ctx.passwordValid || ctx.forcedFailure === 'WRONG_PASSWORD') {
        return {
          nextState: 'FAILED',
          failureReason: 'WRONG_PASSWORD',
          messageEn: 'AS-REQ Pre-Auth Failed: Client timestamp decryption failed (Bad Password).',
          messageAr: 'فشل التحقق المسبق في AS-REQ: فشل فك تشفير الطابع الزمني (كلمة مرور غير صحيحة).',
          virtualTimestamp: ctx.clientVirtualTime,
        };
      }

      return {
        nextState: 'AS_REQ_SENT',
        failureReason: 'NONE',
        messageEn: `AS-REQ dispatched from '${ctx.clientPrincipal}' to KDC Authentication Service.`,
        messageAr: `تم إرسال طلب AS-REQ من '${ctx.clientPrincipal}' إلى خدمة المصادقة في KDC.`,
        virtualTimestamp: ctx.clientVirtualTime + 1,
      };
    }

    case 'AS_REQ_SENT': {
      // Step 2: KDC verifies credentials and issues AS-REP with TGT
      const ticket: KerberosTicket = {
        id: buildDeterministicTicketId('TGT', ctx.clientPrincipal, ctx.kdcVirtualTime, seq),
        type: 'TGT',
        clientPrincipal: ctx.clientPrincipal,
        servicePrincipal: `krbtgt/${DOMAIN_NAME_LOWER(ctx.clientPrincipal)}`,
        realm: DOMAIN_NAME_UPPER(ctx.clientPrincipal),
        issuedAtVirtualTime: ctx.kdcVirtualTime,
        expiresAtVirtualTime: ctx.kdcVirtualTime + ctx.ticketLifetime,
        renewableUntil: ctx.kdcVirtualTime + ctx.ticketLifetime * 7,
        status: 'VALID',
        pacGroups: ctx.pacGroups,
        encryptionType: ctx.encryptionType,
        sessionKey: `key-as-${ctx.kdcVirtualTime}-${seq}`,
      };

      return {
        nextState: 'TGT_ISSUED',
        ticketIssued: ticket,
        failureReason: 'NONE',
        messageEn: `AS-REP Success: KDC granted TGT for '${ctx.clientPrincipal}' encrypted with krbtgt key (${ctx.encryptionType}).`,
        messageAr: `نجاح AS-REP: أصدر KDC تذكرة TGT للمستخدم مشفرة بمفتاح krbtgt وخوارزمية (${ctx.encryptionType}).`,
        virtualTimestamp: ctx.kdcVirtualTime + 1,
      };
    }

    case 'TGT_ISSUED': {
      // Step 3: Client uses TGT to request Service Ticket (TGS-REQ)
      if (!currentTgt || currentTgt.status !== 'VALID' || currentTgt.expiresAtVirtualTime <= ctx.clientVirtualTime || ctx.forcedFailure === 'TGT_EXPIRED') {
        return {
          nextState: 'FAILED',
          failureReason: 'TGT_EXPIRED',
          messageEn: 'TGS-REQ Failed: Presented Ticket Granting Ticket (TGT) has expired or is invalid.',
          messageAr: 'فشل طلب TGS-REQ: تذكرة منح التذاكر (TGT) المقدمة منتهية الصلاحية أو غير صالحة.',
          virtualTimestamp: ctx.clientVirtualTime,
        };
      }

      if (!ctx.spnKnown || ctx.forcedFailure === 'SPN_UNKNOWN') {
        return {
          nextState: 'FAILED',
          failureReason: 'SPN_UNKNOWN',
          messageEn: `TGS-REQ Failed: Service Principal Name (SPN) '${ctx.targetSpn}' is not registered on any domain account.`,
          messageAr: `فشل طلب TGS-REQ: اسم الخدمة الأساسي (SPN) '${ctx.targetSpn}' غير مسجل على أي حساب في النطاق.`,
          virtualTimestamp: ctx.clientVirtualTime,
        };
      }

      return {
        nextState: 'TGS_REQ_SENT',
        failureReason: 'NONE',
        messageEn: `TGS-REQ sent to KDC requesting service ticket for SPN '${ctx.targetSpn}'.`,
        messageAr: `تم إرسال طلب TGS-REQ إلى KDC للحصول على تذكرة خدمة لـ SPN '${ctx.targetSpn}'.`,
        virtualTimestamp: ctx.clientVirtualTime + 2,
      };
    }

    case 'TGS_REQ_SENT': {
      // Step 4: KDC validates TGT and issues Service Ticket (TGS-REP)
      const serviceTicket: KerberosTicket = {
        id: buildDeterministicTicketId('SERVICE', ctx.clientPrincipal, ctx.kdcVirtualTime, seq + 1),
        type: 'SERVICE',
        clientPrincipal: ctx.clientPrincipal,
        servicePrincipal: ctx.targetSpn,
        realm: DOMAIN_NAME_UPPER(ctx.clientPrincipal),
        issuedAtVirtualTime: ctx.kdcVirtualTime,
        expiresAtVirtualTime: ctx.kdcVirtualTime + ctx.ticketLifetime,
        status: 'VALID',
        pacGroups: ctx.pacGroups,
        encryptionType: ctx.encryptionType,
        sessionKey: `key-tgs-${ctx.kdcVirtualTime}-${seq}`,
      };

      return {
        nextState: 'SERVICE_TICKET_ISSUED',
        ticketIssued: serviceTicket,
        failureReason: 'NONE',
        messageEn: `TGS-REP Success: Issued Service Ticket for '${ctx.targetSpn}' with PAC containing ${ctx.pacGroups.length} group SIDs.`,
        messageAr: `نجاح TGS-REP: تم إصدار تذكرة الخدمة لـ '${ctx.targetSpn}' متضمنة حزمة PAC تحوي ${ctx.pacGroups.length} معرف مجموعة.`,
        virtualTimestamp: ctx.kdcVirtualTime + 2,
      };
    }

    case 'SERVICE_TICKET_ISSUED': {
      // Step 5: Client presents Service Ticket to Target Application Server (AP-REQ)
      if (!currentServiceTicket || currentServiceTicket.status !== 'VALID' || currentServiceTicket.expiresAtVirtualTime <= ctx.clientVirtualTime || ctx.forcedFailure === 'SERVICE_TICKET_EXPIRED') {
        return {
          nextState: 'FAILED',
          failureReason: 'SERVICE_TICKET_EXPIRED',
          messageEn: 'AP-REQ Failed: Service Ticket presented to application server has expired.',
          messageAr: 'فشل طلب AP-REQ: تذكرة الخدمة المقدمة لخادم التطبيق منتهية الصلاحية.',
          virtualTimestamp: ctx.clientVirtualTime,
        };
      }

      return {
        nextState: 'AP_REQ_SENT',
        failureReason: 'NONE',
        messageEn: `AP-REQ presented to application server host hosting '${ctx.targetSpn}'.`,
        messageAr: `تم تقديم طلب AP-REQ إلى الخادم المستضيف للخدمة '${ctx.targetSpn}'.`,
        virtualTimestamp: ctx.clientVirtualTime + 3,
      };
    }

    case 'AP_REQ_SENT': {
      // Step 6: Application Server decrypts Service Ticket with its own secret key, validates authenticator, establishes session
      return {
        nextState: 'AUTHENTICATED',
        failureReason: 'NONE',
        messageEn: `Kerberos Mutual Authentication Complete! Secure session opened with '${ctx.targetSpn}'.`,
        messageAr: `اكتملت المصادقة المتبادلة لـ Kerberos بنجاح! تم إنشاء جلسة اتصال مشفرة مع '${ctx.targetSpn}'.`,
        virtualTimestamp: ctx.clientVirtualTime + 4,
      };
    }

    case 'AUTHENTICATED':
    case 'FAILED':
    default:
      return {
        nextState: 'IDLE',
        failureReason: 'NONE',
        messageEn: 'Kerberos exchange reset to IDLE.',
        messageAr: 'تمت إعادة تهيئة تبادل Kerberos إلى وضع الاستعداد.',
        virtualTimestamp: ctx.clientVirtualTime,
      };
  }
}

function DOMAIN_NAME_LOWER(principal: string): string {
  const parts = principal.split('@');
  return parts.length > 1 ? parts[1].toLowerCase() : 'corp.nexora.local';
}

function DOMAIN_NAME_UPPER(principal: string): string {
  const parts = principal.split('@');
  return parts.length > 1 ? parts[1].toUpperCase() : 'CORP.NEXORA.LOCAL';
}
