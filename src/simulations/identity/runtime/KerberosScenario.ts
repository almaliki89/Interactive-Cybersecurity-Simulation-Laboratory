/**
 * Kerberos Runtime Scenario & Deterministic Event Orchestration
 * Obeying the global SimulationRuntime virtual time, clock, and EventEngine architecture.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { SimulationEvent, ScheduledEvent } from '../../../engine/events/EventEngine';
import {
  KerberosState,
  KerberosTicket,
  KerberosFailureReason,
  EncryptionType,
  buildDeterministicTicketId,
} from '../logic/kerberos';

export interface KerberosScenarioConfig {
  clientPrincipal: string; // e.g. "sara@corp.nexora.local"
  targetSpn: string; // e.g. "cifs/fin-srv01.corp.nexora.local"
  encryptionType?: EncryptionType;
  failureScenario?: KerberosFailureReason;
  startVirtualTime?: number;
  stepIntervalMs?: number; // interval between protocol steps in virtual milliseconds
}

export interface DerivedKerberosState {
  protocolState: KerberosState;
  tgtTicket?: KerberosTicket;
  serviceTicket?: KerberosTicket;
  failureReason: KerberosFailureReason;
  errorMessageEn?: string;
  errorMessageAr?: string;
  exchangeLogs: {
    state: KerberosState;
    messageEn: string;
    messageAr: string;
    time: number;
    failure?: boolean;
    eventId?: string;
  }[];
  clientPrincipal: string;
  targetSpn: string;
  encryptionType: EncryptionType;
}

export const KERBEROS_EVENT_TYPES = {
  AS_REQ: 'KERBEROS_AS_REQ',
  AS_REP: 'KERBEROS_AS_REP',
  TGT_ISSUED: 'KERBEROS_TGT_ISSUED',
  TGS_REQ: 'KERBEROS_TGS_REQ',
  TGS_REP: 'KERBEROS_TGS_REP',
  SERVICE_TICKET_ISSUED: 'KERBEROS_SERVICE_TICKET_ISSUED',
  AP_REQ: 'KERBEROS_AP_REQ',
  AUTH_SUCCESS: 'KERBEROS_AUTH_SUCCESS',
  AUTH_FAILED: 'KERBEROS_AUTH_FAILED',
  CLOCK_SKEW: 'KERBEROS_CLOCK_SKEW',
  ACCOUNT_DISABLED: 'KERBEROS_ACCOUNT_DISABLED',
  TGT_EXPIRED: 'KERBEROS_TGT_EXPIRED',
  SPN_UNKNOWN: 'KERBEROS_SPN_UNKNOWN',
  KDC_UNAVAILABLE: 'KERBEROS_KDC_UNAVAILABLE',
} as const;

/**
 * Schedules a deterministic Kerberos exchange scenario on the SimulationRuntime.
 */
export function loadKerberosScenario(
  runtime: SimulationRuntime,
  config: KerberosScenarioConfig
): void {
  const startTime = config.startVirtualTime ?? runtime.clock.getVirtualTime();
  const interval = config.stepIntervalMs ?? 500;
  const failure = config.failureScenario ?? 'NONE';
  const enc = config.encryptionType ?? 'AES-256';
  const client = config.clientPrincipal;
  const spn = config.targetSpn;

  // Clear previous scheduled events or scenario state if requested
  const scheduled: ScheduledEvent[] = [];

  // T+0: AS-REQ
  scheduled.push({
    at: startTime,
    type: KERBEROS_EVENT_TYPES.AS_REQ,
    source: client,
    target: 'KDC (Authentication Service)',
    category: 'AUTH',
    severity: 'info',
    description: `AS-REQ dispatched from ${client} to KDC`,
    payload: {
      clientPrincipal: client,
      targetSpn: spn,
      encryptionType: enc,
      virtualTime: startTime,
    },
  });

  // Handle immediate AS-REQ failure scenarios
  if (failure === 'KDC_UNAVAILABLE') {
    scheduled.push({
      at: startTime + interval,
      type: KERBEROS_EVENT_TYPES.AUTH_FAILED,
      source: 'KDC',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: 'AS-REQ Failed: Domain Controller / KDC is unreachable.',
      payload: {
        failureReason: 'KDC_UNAVAILABLE',
        messageEn: 'AS-REQ Failed: Domain Controller / KDC is unreachable.',
        messageAr: 'فشل طلب AS-REQ: تعذر الوصول إلى خادم النطاق / KDC.',
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    scheduled.push({
      at: startTime + interval,
      type: KERBEROS_EVENT_TYPES.KDC_UNAVAILABLE,
      source: 'KDC',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: 'AS-REQ Failed: Domain Controller / KDC is unreachable.',
      payload: {
        failureReason: 'KDC_UNAVAILABLE',
        messageEn: 'AS-REQ Failed: Domain Controller / KDC is unreachable.',
        messageAr: 'فشل طلب AS-REQ: تعذر الوصول إلى خادم النطاق / KDC.',
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  if (failure === 'CLOCK_SKEW') {
    scheduled.push({
      at: startTime + interval,
      type: KERBEROS_EVENT_TYPES.AUTH_FAILED,
      source: 'KDC',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: 'AS-REQ Pre-Auth Failed: Clock skew exceeds maximum allowed limit (300s).',
      payload: {
        failureReason: 'CLOCK_SKEW',
        messageEn: 'AS-REQ Pre-Auth Failed: Clock skew exceeds allowed threshold.',
        messageAr: 'فشل التحقق المسبق في AS-REQ: فارق توقيت الساعة يتجاوز الحد المسموح به.',
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    scheduled.push({
      at: startTime + interval,
      type: KERBEROS_EVENT_TYPES.CLOCK_SKEW,
      source: 'KDC',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: 'AS-REQ Pre-Auth Failed: Clock skew exceeds maximum allowed limit (300s).',
      payload: {
        failureReason: 'CLOCK_SKEW',
        messageEn: 'AS-REQ Pre-Auth Failed: Clock skew exceeds allowed threshold.',
        messageAr: 'فشل التحقق المسبق في AS-REQ: فارق توقيت الساعة يتجاوز الحد المسموح به.',
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  if (failure === 'ACCOUNT_DISABLED') {
    scheduled.push({
      at: startTime + interval,
      type: KERBEROS_EVENT_TYPES.AUTH_FAILED,
      source: 'KDC',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: `AS-REQ Failed: User account ${client} is disabled.`,
      payload: {
        failureReason: 'ACCOUNT_DISABLED',
        messageEn: `AS-REQ Failed: Account '${client}' is disabled.`,
        messageAr: `فشل طلب AS-REQ: الحساب '${client}' معطل حالياً.`,
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    scheduled.push({
      at: startTime + interval,
      type: KERBEROS_EVENT_TYPES.ACCOUNT_DISABLED,
      source: 'KDC',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: `AS-REQ Failed: User account ${client} is disabled.`,
      payload: {
        failureReason: 'ACCOUNT_DISABLED',
        messageEn: `AS-REQ Failed: Account '${client}' is disabled.`,
        messageAr: `فشل طلب AS-REQ: الحساب '${client}' معطل حالياً.`,
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  if (failure === 'WRONG_PASSWORD') {
    scheduled.push({
      at: startTime + interval,
      type: KERBEROS_EVENT_TYPES.AUTH_FAILED,
      source: 'KDC',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: 'AS-REQ Pre-Auth Failed: Client timestamp decryption failed (Bad Password).',
      payload: {
        failureReason: 'WRONG_PASSWORD',
        messageEn: 'AS-REQ Pre-Auth Failed: Bad password provided (Error 0x18).',
        messageAr: 'فشل التحقق المسبق في AS-REQ: كلمة مرور غير صحيحة.',
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  // T+500: AS-REP & TGT_ISSUED
  const tgtIssuedAt = startTime + interval;
  const tgtTicket: KerberosTicket = {
    id: buildDeterministicTicketId('TGT', client, tgtIssuedAt, 1),
    type: 'TGT',
    clientPrincipal: client,
    servicePrincipal: 'krbtgt/corp.nexora.local',
    realm: 'CORP.NEXORA.LOCAL',
    issuedAtVirtualTime: tgtIssuedAt,
    expiresAtVirtualTime: failure === 'TGT_EXPIRED' ? tgtIssuedAt : tgtIssuedAt + 600,
    status: failure === 'TGT_EXPIRED' ? 'EXPIRED' : 'VALID',
    pacGroups: ['S-1-5-21-392841-513', 'S-1-5-21-392841-1101'],
    encryptionType: enc,
    sessionKey: `key-as-${tgtIssuedAt}-1`,
  };

  scheduled.push({
    at: tgtIssuedAt,
    type: KERBEROS_EVENT_TYPES.AS_REP,
    source: 'KDC (Authentication Service)',
    target: client,
    category: 'AUTH',
    severity: 'info',
    description: `AS-REP Success: TGT issued for ${client}`,
    payload: {
      ticket: tgtTicket,
      clientPrincipal: client,
      targetSpn: spn,
    },
  });

  scheduled.push({
    at: tgtIssuedAt,
    type: KERBEROS_EVENT_TYPES.TGT_ISSUED,
    source: 'KDC',
    target: client,
    category: 'AUTH',
    severity: 'success',
    description: `TGT Ticket acquired by ${client}`,
    payload: {
      ticket: tgtTicket,
      clientPrincipal: client,
      targetSpn: spn,
    },
  });

  // T+1000: TGS-REQ
  const tgsReqTime = startTime + interval * 2;
  scheduled.push({
    at: tgsReqTime,
    type: KERBEROS_EVENT_TYPES.TGS_REQ,
    source: client,
    target: 'KDC (Ticket Granting Service)',
    category: 'AUTH',
    severity: 'info',
    description: `TGS-REQ sent with TGT requesting service ticket for ${spn}`,
    payload: {
      tgtId: tgtTicket.id,
      clientPrincipal: client,
      targetSpn: spn,
    },
  });

  // Handle TGS-REQ failure scenarios
  if (failure === 'TGT_EXPIRED') {
    scheduled.push({
      at: tgsReqTime + interval,
      type: KERBEROS_EVENT_TYPES.AUTH_FAILED,
      source: 'KDC (TGS)',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: 'TGS-REQ Denied: Presented TGT has expired.',
      payload: {
        failureReason: 'TGT_EXPIRED',
        messageEn: 'TGS-REQ Denied: Presented TGT has expired.',
        messageAr: 'فشل طلب TGS-REQ: تذكرة TGT المقدمة منتهية الصلاحية.',
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    scheduled.push({
      at: tgsReqTime + interval,
      type: KERBEROS_EVENT_TYPES.TGT_EXPIRED,
      source: 'KDC (TGS)',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: 'TGS-REQ Denied: Presented TGT has expired.',
      payload: {
        failureReason: 'TGT_EXPIRED',
        messageEn: 'TGS-REQ Denied: Presented TGT has expired.',
        messageAr: 'فشل طلب TGS-REQ: تذكرة TGT المقدمة منتهية الصلاحية.',
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  if (failure === 'SPN_UNKNOWN') {
    scheduled.push({
      at: tgsReqTime + interval,
      type: KERBEROS_EVENT_TYPES.AUTH_FAILED,
      source: 'KDC (TGS)',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: `TGS-REQ Failed: Service Principal Name '${spn}' is not registered.`,
      payload: {
        failureReason: 'SPN_UNKNOWN',
        messageEn: `TGS-REQ Failed: SPN '${spn}' unknown.`,
        messageAr: `فشل طلب TGS-REQ: اسم الخدمة '${spn}' غير معروف في النطاق.`,
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    scheduled.push({
      at: tgsReqTime + interval,
      type: KERBEROS_EVENT_TYPES.SPN_UNKNOWN,
      source: 'KDC (TGS)',
      target: client,
      category: 'AUTH',
      severity: 'threat',
      description: `TGS-REQ Failed: Service Principal Name '${spn}' is not registered.`,
      payload: {
        failureReason: 'SPN_UNKNOWN',
        messageEn: `TGS-REQ Failed: SPN '${spn}' unknown.`,
        messageAr: `فشل طلب TGS-REQ: اسم الخدمة '${spn}' غير معروف في النطاق.`,
        clientPrincipal: client,
        targetSpn: spn,
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  // T+1500: TGS-REP & SERVICE_TICKET_ISSUED
  const svcIssuedAt = tgsReqTime + interval;
  const serviceTicket: KerberosTicket = {
    id: buildDeterministicTicketId('SERVICE', client, svcIssuedAt, 2),
    type: 'SERVICE',
    clientPrincipal: client,
    servicePrincipal: spn,
    realm: 'CORP.NEXORA.LOCAL',
    issuedAtVirtualTime: svcIssuedAt,
    expiresAtVirtualTime: svcIssuedAt + 600,
    status: 'VALID',
    pacGroups: ['S-1-5-21-392841-513', 'S-1-5-21-392841-1101'],
    encryptionType: enc,
    sessionKey: `key-tgs-${svcIssuedAt}-2`,
  };

  scheduled.push({
    at: svcIssuedAt,
    type: KERBEROS_EVENT_TYPES.TGS_REP,
    source: 'KDC (Ticket Granting Service)',
    target: client,
    category: 'AUTH',
    severity: 'info',
    description: `TGS-REP Success: Service ticket issued for ${spn}`,
    payload: {
      ticket: serviceTicket,
      clientPrincipal: client,
      targetSpn: spn,
    },
  });

  scheduled.push({
    at: svcIssuedAt,
    type: KERBEROS_EVENT_TYPES.SERVICE_TICKET_ISSUED,
    source: 'KDC',
    target: client,
    category: 'AUTH',
    severity: 'success',
    description: `Service Ticket issued for ${spn}`,
    payload: {
      ticket: serviceTicket,
      clientPrincipal: client,
      targetSpn: spn,
    },
  });

  // T+2000: AP-REQ
  const apReqTime = svcIssuedAt + interval;
  scheduled.push({
    at: apReqTime,
    type: KERBEROS_EVENT_TYPES.AP_REQ,
    source: client,
    target: spn,
    category: 'AUTH',
    severity: 'info',
    description: `AP-REQ presented to target service host ${spn}`,
    payload: {
      serviceTicketId: serviceTicket.id,
      clientPrincipal: client,
      targetSpn: spn,
    },
  });

  // T+2500: AUTH_SUCCESS
  const authSuccessTime = apReqTime + interval;
  scheduled.push({
    at: authSuccessTime,
    type: KERBEROS_EVENT_TYPES.AUTH_SUCCESS,
    source: spn,
    target: client,
    category: 'AUTH',
    severity: 'success',
    description: `Kerberos Mutual Authentication Complete for ${client} on ${spn}`,
    payload: {
      clientPrincipal: client,
      targetSpn: spn,
      sessionKey: serviceTicket.sessionKey,
    },
  });

  runtime.events.scheduleBatch(scheduled);
}

/**
 * Pure deterministic reducer that projects runtime event history
 * into the complete, authoritative Kerberos state.
 * Supports time-travel replay to any virtual timestamp!
 */
export function deriveKerberosStateFromEvents(
  events: Array<{
    id: string;
    type: string;
    virtualTime?: number;
    source?: string;
    target?: string;
    category?: string;
    severity?: string;
    description?: string;
    payload?: any;
    [key: string]: any;
  }>,
  maxVirtualTime?: number
): DerivedKerberosState {
  let relevantEvents = events.filter((e) =>
    e.type.startsWith('KERBEROS_')
  );

  if (maxVirtualTime !== undefined) {
    relevantEvents = relevantEvents.filter((e) => (e.virtualTime ?? 0) <= maxVirtualTime);
  }

  // Sort deterministically by virtualTime then event id
  relevantEvents.sort((a, b) => (a.virtualTime ?? 0) - (b.virtualTime ?? 0) || a.id.localeCompare(b.id));

  let protocolState: KerberosState = 'IDLE';
  let tgtTicket: KerberosTicket | undefined = undefined;
  let serviceTicket: KerberosTicket | undefined = undefined;
  let failureReason: KerberosFailureReason = 'NONE';
  let errorMessageEn: string | undefined = undefined;
  let errorMessageAr: string | undefined = undefined;
  let clientPrincipal = 'sara@corp.nexora.local';
  let targetSpn = 'cifs/fin-srv01.corp.nexora.local';
  let encryptionType: EncryptionType = 'AES-256';

  const exchangeLogs: DerivedKerberosState['exchangeLogs'] = [];

  for (const evt of relevantEvents) {
    const vTime = evt.virtualTime ?? 0;
    if (evt.payload?.clientPrincipal) clientPrincipal = evt.payload.clientPrincipal;
    if (evt.payload?.targetSpn) targetSpn = evt.payload.targetSpn;
    if (evt.payload?.encryptionType) encryptionType = evt.payload.encryptionType;

    switch (evt.type) {
      case KERBEROS_EVENT_TYPES.AS_REQ: {
        protocolState = 'AS_REQ_SENT';
        exchangeLogs.push({
          state: 'AS_REQ_SENT',
          messageEn: `AS-REQ dispatched from '${clientPrincipal}' to KDC Authentication Service.`,
          messageAr: `تم إرسال طلب AS-REQ من '${clientPrincipal}' إلى خدمة المصادقة في KDC.`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }

      case KERBEROS_EVENT_TYPES.TGT_ISSUED:
      case KERBEROS_EVENT_TYPES.AS_REP: {
        protocolState = 'TGT_ISSUED';
        if (evt.payload?.ticket) {
          tgtTicket = evt.payload.ticket;
        }
        // Deduplicate log if both AS_REP and TGT_ISSUED exist at same timestamp
        if (!exchangeLogs.some((l) => l.state === 'TGT_ISSUED' && l.time === vTime)) {
          exchangeLogs.push({
            state: 'TGT_ISSUED',
            messageEn: `AS-REP Success: KDC granted TGT for '${clientPrincipal}' encrypted with krbtgt key (${encryptionType}).`,
            messageAr: `نجاح AS-REP: أصدر KDC تذكرة TGT للمستخدم مشفرة بمفتاح krbtgt (${encryptionType}).`,
            time: vTime,
            eventId: evt.id,
          });
        }
        break;
      }

      case KERBEROS_EVENT_TYPES.TGS_REQ: {
        protocolState = 'TGS_REQ_SENT';
        exchangeLogs.push({
          state: 'TGS_REQ_SENT',
          messageEn: `TGS-REQ sent to KDC requesting service ticket for SPN '${targetSpn}'.`,
          messageAr: `تم إرسال طلب TGS-REQ إلى KDC للحصول على تذكرة خدمة لـ SPN '${targetSpn}'.`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }

      case KERBEROS_EVENT_TYPES.SERVICE_TICKET_ISSUED:
      case KERBEROS_EVENT_TYPES.TGS_REP: {
        protocolState = 'SERVICE_TICKET_ISSUED';
        if (evt.payload?.ticket) {
          serviceTicket = evt.payload.ticket;
        }
        if (!exchangeLogs.some((l) => l.state === 'SERVICE_TICKET_ISSUED' && l.time === vTime)) {
          exchangeLogs.push({
            state: 'SERVICE_TICKET_ISSUED',
            messageEn: `TGS-REP Success: Issued Service Ticket for '${targetSpn}' with PAC credentials.`,
            messageAr: `نجاح TGS-REP: تم إصدار تذكرة الخدمة لـ '${targetSpn}' متضمنة حزمة PAC.`,
            time: vTime,
            eventId: evt.id,
          });
        }
        break;
      }

      case KERBEROS_EVENT_TYPES.AP_REQ: {
        protocolState = 'AP_REQ_SENT';
        exchangeLogs.push({
          state: 'AP_REQ_SENT',
          messageEn: `AP-REQ presented to target service host '${targetSpn}'.`,
          messageAr: `تم تقديم طلب AP-REQ إلى الخادم المستضيف للخدمة '${targetSpn}'.`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }

      case KERBEROS_EVENT_TYPES.AUTH_SUCCESS: {
        protocolState = 'AUTHENTICATED';
        exchangeLogs.push({
          state: 'AUTHENTICATED',
          messageEn: `Kerberos Mutual Authentication Complete! Secure session opened with '${targetSpn}'.`,
          messageAr: `اكتملت المصادقة المتبادلة لـ Kerberos بنجاح! تم إنشاء جلسة اتصال مشفرة مع '${targetSpn}'.`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }

      case KERBEROS_EVENT_TYPES.AUTH_FAILED:
      case KERBEROS_EVENT_TYPES.CLOCK_SKEW:
      case KERBEROS_EVENT_TYPES.ACCOUNT_DISABLED:
      case KERBEROS_EVENT_TYPES.TGT_EXPIRED:
      case KERBEROS_EVENT_TYPES.SPN_UNKNOWN:
      case KERBEROS_EVENT_TYPES.KDC_UNAVAILABLE: {
        protocolState = 'FAILED';
        failureReason = evt.payload?.failureReason || 'WRONG_PASSWORD';
        errorMessageEn = evt.payload?.messageEn || evt.description;
        errorMessageAr = evt.payload?.messageAr || 'فشلت مصادقة Kerberos.';

        exchangeLogs.push({
          state: 'FAILED',
          messageEn: errorMessageEn || 'Kerberos authentication failed.',
          messageAr: errorMessageAr || 'فشلت مصادقة Kerberos.',
          time: vTime,
          failure: true,
          eventId: evt.id,
        });
        break;
      }
    }
  }

  return {
    protocolState,
    tgtTicket,
    serviceTicket,
    failureReason,
    errorMessageEn,
    errorMessageAr,
    exchangeLogs,
    clientPrincipal,
    targetSpn,
    encryptionType,
  };
}
