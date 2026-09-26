/**
 * OMEGA V11 — SOC & SIEM Unified Telemetry Data Model
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type TelemetrySourceWorld = 'NETWORK' | 'LINUX' | 'WINDOWS' | 'IDENTITY' | 'APPSEC' | 'CLOUD' | 'CONTAINERS' | 'KUBERNETES';

export type TelemetrySeverity = 'info' | 'warn' | 'threat' | 'critical';

export interface SecurityTelemetryEvent {
  id: string;
  sourceWorld: TelemetrySourceWorld;
  eventType: string;
  virtualTime: number;

  host?: string;
  user?: string;
  sourceIp?: string;
  destinationIp?: string;
  destinationPort?: number;
  process?: string;
  parentProcess?: string;
  service?: string;
  resource?: string;

  severity: TelemetrySeverity;
  category: string;
  outcome?: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO';

  rawEventId?: string;
  attributes: Record<string, unknown>;
}

export interface TelemetryFilter {
  sourceWorld?: TelemetrySourceWorld;
  category?: string;
  outcome?: string;
  user?: string;
  host?: string;
  sourceIp?: string;
  destinationIp?: string;
  destinationPort?: number;
  process?: string;
  severity?: TelemetrySeverity;
  minVirtualTime?: number;
  maxVirtualTime?: number;
  freeText?: string;
}

/**
 * Creates a deterministic telemetry event
 */
export function createTelemetryEvent(params: {
  id: string;
  sourceWorld: TelemetrySourceWorld;
  eventType: string;
  virtualTime: number;
  host?: string;
  user?: string;
  sourceIp?: string;
  destinationIp?: string;
  destinationPort?: number;
  process?: string;
  parentProcess?: string;
  service?: string;
  resource?: string;
  severity?: TelemetrySeverity;
  category: string;
  outcome?: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO';
  rawEventId?: string;
  attributes?: Record<string, unknown>;
}): SecurityTelemetryEvent {
  return {
    id: params.id,
    sourceWorld: params.sourceWorld,
    eventType: params.eventType,
    virtualTime: params.virtualTime,
    host: params.host,
    user: params.user,
    sourceIp: params.sourceIp,
    destinationIp: params.destinationIp,
    destinationPort: params.destinationPort,
    process: params.process,
    parentProcess: params.parentProcess,
    service: params.service,
    resource: params.resource,
    severity: params.severity ?? 'info',
    category: params.category,
    outcome: params.outcome ?? 'SUCCESS',
    rawEventId: params.rawEventId,
    attributes: params.attributes ?? {},
  };
}

/**
 * Standard Telemetry Categories
 */
export const TELEMETRY_CATEGORIES = {
  AUTHENTICATION: 'AUTHENTICATION',
  ACCESS_CONTROL: 'ACCESS_CONTROL',
  PROCESS_EXECUTION: 'PROCESS_EXECUTION',
  NETWORK_CONNECTION: 'NETWORK_CONNECTION',
  SERVICE_MODIFICATION: 'SERVICE_MODIFICATION',
  GROUP_MANAGEMENT: 'GROUP_MANAGEMENT',
  APPLICATION_DEFENSE: 'APPLICATION_DEFENSE',
  SECURITY_CONFIGURATION: 'SECURITY_CONFIGURATION',
  DATABASE_QUERY: 'DATABASE_QUERY',
  PRIVILEGE_ESCALATION: 'PRIVILEGE_ESCALATION',
  FILE_INTEGRITY: 'FILE_INTEGRITY',
  CREDENTIAL_ACCESS: 'CREDENTIAL_ACCESS',
  AUDIT_LOG: 'AUDIT_LOG',
} as const;
