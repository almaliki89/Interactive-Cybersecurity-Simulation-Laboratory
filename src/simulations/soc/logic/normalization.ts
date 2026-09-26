/**
 * OMEGA V11 — Cross-World Telemetry Normalization Engine
 * Normalizes disparate source events from Windows, Linux, AD, Network, and AppSec into unified schema.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityTelemetryEvent, TELEMETRY_CATEGORIES } from './telemetry';

export interface RawSimulationEvent {
  id?: string;
  type: string;
  source?: string;
  target?: string;
  category?: string;
  severity?: string;
  virtualTime?: number;
  description?: string;
  payload?: Record<string, unknown>;
}

/**
 * Normalizes a Windows Security Event (e.g. 4624, 4625, 4728, 4688, 7045, 1102)
 */
export function normalizeWindowsEvent(event: RawSimulationEvent): SecurityTelemetryEvent {
  const vTime = event.virtualTime ?? 0;
  const payload = event.payload || {};
  const eventId = String(payload.eventId || event.type);
  const user = String(payload.user || payload.targetUser || event.source || 'SYSTEM');
  const host = String(payload.host || 'WIN-CORP-01');

  let category: string = TELEMETRY_CATEGORIES.AUTHENTICATION;
  let outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO' = 'SUCCESS';
  let severity: 'info' | 'warn' | 'threat' | 'critical' = 'info';

  if (eventId === '4625' || event.type.includes('LOGON_FAIL') || event.type.includes('LOGIN_FAILED')) {
    category = TELEMETRY_CATEGORIES.AUTHENTICATION;
    outcome = 'FAILURE';
    severity = 'warn';
  } else if (eventId === '4624' || event.type.includes('LOGON_SUCCESS')) {
    category = TELEMETRY_CATEGORIES.AUTHENTICATION;
    outcome = 'SUCCESS';
    severity = 'info';
  } else if (eventId === '4728' || eventId === '4732' || event.type.includes('MEMBER_ADDED')) {
    category = TELEMETRY_CATEGORIES.GROUP_MANAGEMENT;
    outcome = 'SUCCESS';
    severity = 'warn';
  } else if (eventId === '4688' || event.type.includes('PROCESS_CREATION')) {
    category = TELEMETRY_CATEGORIES.PROCESS_EXECUTION;
    outcome = 'SUCCESS';
    severity = payload.suspicious ? 'threat' : 'info';
  } else if (eventId === '7045' || event.type.includes('SERVICE_INSTALLED')) {
    category = TELEMETRY_CATEGORIES.SERVICE_MODIFICATION;
    outcome = 'SUCCESS';
    severity = 'warn';
  } else if (eventId === '1102' || event.type.includes('LOG_CLEARED')) {
    category = TELEMETRY_CATEGORIES.SECURITY_CONFIGURATION;
    outcome = 'ANOMALY';
    severity = 'critical';
  }

  return {
    id: `norm-win-${event.id || vTime}`,
    sourceWorld: 'WINDOWS',
    eventType: event.type.startsWith('WIN_') ? event.type : `WIN_${eventId}`,
    virtualTime: vTime,
    host,
    user,
    sourceIp: payload.sourceIp ? String(payload.sourceIp) : undefined,
    process: payload.process ? String(payload.process) : undefined,
    parentProcess: payload.parentProcess ? String(payload.parentProcess) : undefined,
    service: payload.service ? String(payload.service) : undefined,
    resource: payload.resource ? String(payload.resource) : undefined,
    severity,
    category,
    outcome,
    rawEventId: event.id,
    attributes: {
      ...payload,
      originalType: event.type,
      description: event.description,
    },
  };
}

/**
 * Normalizes a Linux Security Event (e.g. PAM auth, sudo, systemd, process exec)
 */
export function normalizeLinuxEvent(event: RawSimulationEvent): SecurityTelemetryEvent {
  const vTime = event.virtualTime ?? 0;
  const payload = event.payload || {};
  const user = String(payload.user || 'root');
  const host = String(payload.host || 'LINUX-SRV-01');

  let category: string = TELEMETRY_CATEGORIES.AUTHENTICATION;
  let outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO' = 'SUCCESS';
  let severity: 'info' | 'warn' | 'threat' | 'critical' = 'info';

  if (event.type.includes('AUTH_FAIL') || event.type.includes('SSH_LOGIN_FAILED')) {
    category = TELEMETRY_CATEGORIES.AUTHENTICATION;
    outcome = 'FAILURE';
    severity = 'warn';
  } else if (event.type.includes('SUDO_EXEC') || event.type.includes('PRIV_ESC')) {
    category = TELEMETRY_CATEGORIES.ACCESS_CONTROL;
    outcome = payload.allowed === false ? 'DENIED' : 'SUCCESS';
    severity = payload.allowed === false ? 'threat' : 'warn';
  } else if (event.type.includes('PROCESS_SPAWNED')) {
    category = TELEMETRY_CATEGORIES.PROCESS_EXECUTION;
    outcome = 'SUCCESS';
    severity = 'info';
  } else if (event.type.includes('SYSTEMD_UNIT_CHANGED')) {
    category = TELEMETRY_CATEGORIES.SERVICE_MODIFICATION;
    outcome = 'SUCCESS';
    severity = 'warn';
  }

  return {
    id: `norm-linux-${event.id || vTime}`,
    sourceWorld: 'LINUX',
    eventType: event.type,
    virtualTime: vTime,
    host,
    user,
    process: payload.process ? String(payload.process) : undefined,
    parentProcess: payload.parentProcess ? String(payload.parentProcess) : undefined,
    service: payload.service ? String(payload.service) : undefined,
    severity,
    category,
    outcome,
    rawEventId: event.id,
    attributes: { ...payload, description: event.description },
  };
}

/**
 * Normalizes an Active Directory / Kerberos Event (AS-REQ, TGS-REQ, Group Change, GPO)
 */
export function normalizeIdentityEvent(event: RawSimulationEvent): SecurityTelemetryEvent {
  const vTime = event.virtualTime ?? 0;
  const payload = event.payload || {};
  const user = String(payload.username || payload.user || payload.clientPrincipal || 'unknown');
  const host = String(payload.workstation || payload.realm || 'corp.nexora.local');

  let category: string = TELEMETRY_CATEGORIES.AUTHENTICATION;
  let outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO' = 'SUCCESS';
  let severity: 'info' | 'warn' | 'threat' | 'critical' = 'info';

  if (event.type.includes('KERBEROS_AUTH_FAILED') || event.type.includes('AS_REQ_FAILED') || event.type.includes('PREAUTH_FAILED')) {
    category = TELEMETRY_CATEGORIES.AUTHENTICATION;
    outcome = 'FAILURE';
    severity = 'warn';
  } else if (event.type.includes('KERBEROS_AUTH_SUCCESS') || event.type.includes('TGS_REQ_SUCCESS')) {
    category = TELEMETRY_CATEGORIES.AUTHENTICATION;
    outcome = 'SUCCESS';
    severity = 'info';
  } else if (event.type.includes('PRIVILEGED_GROUP_CHANGED') || event.type.includes('MEMBER_ADDED_DOMAIN_ADMINS')) {
    category = TELEMETRY_CATEGORIES.GROUP_MANAGEMENT;
    outcome = 'SUCCESS';
    severity = 'threat';
  } else if (event.type.includes('GPO_MODIFIED')) {
    category = TELEMETRY_CATEGORIES.SECURITY_CONFIGURATION;
    outcome = 'SUCCESS';
    severity = 'warn';
  } else if (event.type.includes('SENSITIVE_RESOURCE_ACCESS')) {
    category = TELEMETRY_CATEGORIES.ACCESS_CONTROL;
    outcome = payload.allowed === false ? 'DENIED' : 'SUCCESS';
    severity = payload.allowed === false ? 'threat' : 'info';
  }

  return {
    id: `norm-id-${event.id || vTime}`,
    sourceWorld: 'IDENTITY',
    eventType: event.type,
    virtualTime: vTime,
    host,
    user,
    service: payload.servicePrincipal ? String(payload.servicePrincipal) : undefined,
    resource: payload.resource ? String(payload.resource) : undefined,
    severity,
    category,
    outcome,
    rawEventId: event.id,
    attributes: { ...payload, description: event.description },
  };
}

/**
 * Normalizes an Application Security Event (BOLA, SQLi, CSRF, Rate Limit, Auth fail)
 */
export function normalizeAppSecEvent(event: RawSimulationEvent): SecurityTelemetryEvent {
  const vTime = event.virtualTime ?? 0;
  const payload = event.payload || {};
  const user = String(payload.username || payload.userId || 'anonymous');
  const host = String(payload.host || 'APP-SRV-01');

  let category: string = TELEMETRY_CATEGORIES.APPLICATION_DEFENSE;
  let outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO' = 'SUCCESS';
  let severity: 'info' | 'warn' | 'threat' | 'critical' = 'info';

  if (event.type.includes('AUTH_FAILED') || payload.statusCode === 401) {
    category = TELEMETRY_CATEGORIES.AUTHENTICATION;
    outcome = 'FAILURE';
    severity = 'warn';
  } else if (event.type.includes('ACCESS_DENIED') || event.type.includes('BOLA') || payload.statusCode === 403) {
    category = TELEMETRY_CATEGORIES.ACCESS_CONTROL;
    outcome = 'DENIED';
    severity = 'threat';
  } else if (event.type.includes('RATE_LIMIT') || payload.statusCode === 429) {
    category = TELEMETRY_CATEGORIES.APPLICATION_DEFENSE;
    outcome = 'DENIED';
    severity = 'warn';
  } else if (event.type.includes('SQL_INJECTION') || event.type.includes('XSS_DETECTED')) {
    category = TELEMETRY_CATEGORIES.APPLICATION_DEFENSE;
    outcome = 'ANOMALY';
    severity = 'threat';
  }

  return {
    id: `norm-app-${event.id || vTime}`,
    sourceWorld: 'APPSEC',
    eventType: event.type,
    virtualTime: vTime,
    host,
    user,
    sourceIp: payload.sourceIp ? String(payload.sourceIp) : undefined,
    resource: payload.endpoint ? String(payload.endpoint) : undefined,
    severity,
    category,
    outcome,
    rawEventId: event.id,
    attributes: { ...payload, description: event.description },
  };
}

/**
 * Normalizes a Network Telemetry Event (Packet blocked, connection denied, DNS, TLS)
 */
export function normalizeNetworkEvent(event: RawSimulationEvent): SecurityTelemetryEvent {
  const vTime = event.virtualTime ?? 0;
  const payload = event.payload || {};

  let outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO' = 'SUCCESS';
  let severity: 'info' | 'warn' | 'threat' | 'critical' = 'info';

  if (event.type.includes('BLOCKED') || event.type.includes('DROPPED') || event.type.includes('DENIED')) {
    outcome = 'DENIED';
    severity = 'warn';
  } else if (event.type.includes('PORT_SCAN') || event.type.includes('SYN_FLOOD')) {
    outcome = 'ANOMALY';
    severity = 'threat';
  }

  return {
    id: `norm-net-${event.id || vTime}`,
    sourceWorld: 'NETWORK',
    eventType: event.type,
    virtualTime: vTime,
    sourceIp: payload.sourceIp ? String(payload.sourceIp) : event.source,
    destinationIp: payload.destinationIp ? String(payload.destinationIp) : event.target,
    destinationPort: payload.destinationPort ? Number(payload.destinationPort) : undefined,
    severity,
    category: TELEMETRY_CATEGORIES.NETWORK_CONNECTION,
    outcome,
    rawEventId: event.id,
    attributes: { ...payload, description: event.description },
  };
}

import { normalizeCloudEvent } from '../../cloud/runtime/normalizeCloudEvent';
import { normalizeDevSecOpsEvent } from '../../devsecops/runtime/normalizeDevSecOpsEvent';

/**
 * Universal Event Normalizer routing into appropriate source pipeline
 */
export function normalizeRuntimeEvent(event: RawSimulationEvent): SecurityTelemetryEvent {
  const type = event.type.toUpperCase();
  const category = (event.category || '').toUpperCase();

  if (category === 'DEVSECOPS' || type.startsWith('DEVSECOPS_')) {
    return normalizeDevSecOpsEvent({
      id: event.id || `devsec-${event.virtualTime || 0}`,
      eventType: event.type,
      virtualTime: event.virtualTime ?? 0,
      repository: event.source,
      severity: event.severity === 'threat' || event.severity === 'critical' ? 'threat' : event.severity === 'warn' ? 'warn' : 'info',
      outcome: (event.payload?.outcome as any) || 'SUCCESS',
      attributes: event.payload,
    });
  }

  if (category === 'CLOUD' || type.startsWith('CLOUD_')) {
    return normalizeCloudEvent(event);
  }
  if (category === 'APPSEC' || type.startsWith('HTTP_') || type.startsWith('APP_')) {
    return normalizeAppSecEvent(event);
  }
  if (category === 'IDENTITY' || type.startsWith('KERBEROS_') || type.startsWith('AD_') || type.startsWith('LDAP_')) {
    return normalizeIdentityEvent(event);
  }
  if (category === 'WINDOWS' || type.startsWith('WIN_') || type.startsWith('EVENT_46') || type.startsWith('EVENT_47')) {
    return normalizeWindowsEvent(event);
  }
  if (category === 'LINUX' || type.startsWith('LINUX_') || type.startsWith('PAM_') || type.startsWith('SUDO_')) {
    return normalizeLinuxEvent(event);
  }
  return normalizeNetworkEvent(event);
}
