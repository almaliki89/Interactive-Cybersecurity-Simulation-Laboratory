/**
 * OMEGA V13.1 — Cloud to SOC Telemetry Normalizer
 * normalizeCloudEvent.ts
 *
 * Normalizes Cloud Security and Audit events into the unified SOC SecurityTelemetryEvent model.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityTelemetryEvent, TELEMETRY_CATEGORIES, TelemetrySeverity } from '../../soc/logic/telemetry';

export interface CloudRawEvent {
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

export function normalizeCloudEvent(event: CloudRawEvent): SecurityTelemetryEvent {
  const vTime = event.virtualTime ?? 0;
  const payload = event.payload || {};
  const type = event.type.toUpperCase();

  let category: string = TELEMETRY_CATEGORIES.AUDIT_LOG;
  let outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ANOMALY' | 'INFO' = 'SUCCESS';
  let severity: TelemetrySeverity = 'info';

  const user = String(payload.user || payload.userName || payload.principalArn || payload.userId || event.source || 'cloud-service');
  const resource = String(payload.resource || payload.bucketName || payload.roleArn || payload.secretName || event.target || 'cloud-resource');
  const sourceIp = payload.sourceIPAddress ? String(payload.sourceIPAddress) : payload.sourceIp ? String(payload.sourceIp) : event.source;

  if (type === 'CLOUD_DATA_EXFILTRATION' || (type.includes('EXFILTRATION') && payload.bytesDownloaded)) {
    category = TELEMETRY_CATEGORIES.FILE_INTEGRITY;
    outcome = 'ANOMALY';
    severity = 'critical';
  } else if (type === 'CLOUD_IMDS_CREDENTIAL_THEFT') {
    category = TELEMETRY_CATEGORIES.CREDENTIAL_ACCESS;
    outcome = 'ANOMALY';
    severity = 'threat';
  } else if (type === 'CLOUD_SSRF_EXPLOIT') {
    category = TELEMETRY_CATEGORIES.NETWORK_CONNECTION;
    outcome = 'ANOMALY';
    severity = 'threat';
  } else if (type === 'CLOUD_AUTH_FAILURE' || type.includes('AUTH_FAIL') || payload.errorCode === 'AccessDenied') {
    category = TELEMETRY_CATEGORIES.AUTHENTICATION;
    outcome = 'FAILURE';
    severity = 'warn';
  } else if (type === 'CLOUD_AUTH_SUCCESS') {
    category = TELEMETRY_CATEGORIES.AUTHENTICATION;
    outcome = 'SUCCESS';
    severity = 'info';
  } else if (type === 'CLOUD_ROLE_ASSUMED' || type.includes('ASSUME_ROLE') || payload.eventName === 'AssumeRole') {
    category = TELEMETRY_CATEGORIES.PRIVILEGE_ESCALATION;
    outcome = 'SUCCESS';
    severity = payload.suspicious || sourceIp?.startsWith('203.') ? 'threat' : 'info';
  } else if (type === 'CLOUD_SECURITY_GROUP_CHANGED' || type.includes('SECURITY_GROUP')) {
    category = TELEMETRY_CATEGORIES.SECURITY_CONFIGURATION;
    outcome = 'SUCCESS';
    severity = 'warn';
  } else if (type === 'CLOUD_STORAGE_ACCESS' || payload.eventName === 'GetObject' || payload.eventName === 'ListObjectsV2') {
    category = TELEMETRY_CATEGORIES.FILE_INTEGRITY;
    outcome = payload.errorCode ? 'DENIED' : 'SUCCESS';
    severity = payload.errorCode ? 'warn' : 'info';
  } else if (type === 'CLOUD_SECRET_ACCESS' || type.includes('SECRET')) {
    category = TELEMETRY_CATEGORIES.CREDENTIAL_ACCESS;
    outcome = 'SUCCESS';
    severity = payload.unauthorized ? 'threat' : 'info';
  } else if (type === 'CLOUD_AUDIT_DISABLED' || payload.eventName === 'StopLogging' || payload.eventName === 'DeleteTrail') {
    category = TELEMETRY_CATEGORIES.SECURITY_CONFIGURATION;
    outcome = 'ANOMALY';
    severity = 'critical';
  } else if (type === 'CLOUD_CROSS_RESOURCE_ACCESS') {
    category = TELEMETRY_CATEGORIES.NETWORK_CONNECTION;
    outcome = 'ANOMALY';
    severity = 'threat';
  }

  return {
    id: `norm-cloud-${event.id || vTime}-${type}`,
    sourceWorld: 'CLOUD',
    eventType: type,
    virtualTime: vTime,
    user,
    host: payload.host ? String(payload.host) : payload.instanceId ? String(payload.instanceId) : undefined,
    sourceIp,
    destinationIp: payload.destinationIp ? String(payload.destinationIp) : undefined,
    destinationPort: payload.targetPort ? Number(payload.targetPort) : payload.destinationPort ? Number(payload.destinationPort) : undefined,
    service: payload.eventSource ? String(payload.eventSource) : 'cloud.nexora.com',
    resource,
    severity,
    category,
    outcome,
    rawEventId: event.id,
    attributes: {
      ...payload,
      description: event.description,
      eventName: payload.eventName || type,
      cloudProvider: 'NEXORA_CLOUD',
    },
  };
}
