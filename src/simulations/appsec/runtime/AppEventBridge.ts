/**
 * Web & Application Security: App Event Bridge & SIEM Ingestion
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { AppSecLogEntry, AppSecEventType, AppSecSeverity } from '../logic/logging';

/**
 * Dispatches an enterprise AppSec event into the global SimulationRuntime
 */
export function dispatchAppSecEvent(params: {
  type: AppSecEventType;
  severity?: AppSecSeverity;
  sourceIp?: string;
  userId?: string;
  username?: string;
  endpoint: string;
  httpMethod: string;
  statusCode: number;
  messageEn: string;
  messageAr: string;
  metadata?: Record<string, unknown>;
  virtualTime?: number;
}): AppSecLogEntry {
  const vTime = params.virtualTime ?? globalSimulationRuntime.clock.getVirtualTime();
  const sev = params.severity ?? 'INFO';
  const ip = params.sourceIp ?? '192.168.1.50';

  const logEntry: AppSecLogEntry = {
    id: `app-log-${params.type.toLowerCase()}-${vTime}`,
    type: params.type,
    severity: sev,
    virtualTime: vTime,
    sourceIp: ip,
    userId: params.userId,
    username: params.username,
    endpoint: params.endpoint,
    httpMethod: params.httpMethod,
    statusCode: params.statusCode,
    messageEn: params.messageEn,
    messageAr: params.messageAr,
    metadata: params.metadata || {},
  };

  // Dispatch into global simulation runtime
  globalSimulationRuntime.dispatch({
    id: logEntry.id,
    type: params.type,
    source: ip,
    target: params.endpoint,
    category: 'APPSEC',
    severity: sev === 'ALERT' || sev === 'CRITICAL' ? 'threat' : sev === 'WARN' ? 'warn' : 'info',
    description: params.messageEn,
    payload: logEntry,
  });

  return logEntry;
}

/**
 * Projects runtime SimulationEvents into structured AppSecLogEntry records
 */
export function projectRuntimeEventsToAppSecLogs(
  runtimeEvents: Array<{
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
  }>
): AppSecLogEntry[] {
  const records: AppSecLogEntry[] = [];

  for (const evt of runtimeEvents) {
    const vTime = evt.virtualTime ?? 0;

    if (evt.payload && 'type' in evt.payload && 'statusCode' in evt.payload && 'endpoint' in evt.payload) {
      records.push(evt.payload as AppSecLogEntry);
    } else if (evt.type.startsWith('HTTP_') || evt.type.startsWith('APP_')) {
      records.push({
        id: `app-proj-${vTime}-${evt.id}`,
        type: (evt.type as AppSecEventType) || 'APP_AUTH_SUCCESS',
        severity: evt.severity === 'threat' ? 'ALERT' : evt.severity === 'warn' ? 'WARN' : 'INFO',
        virtualTime: vTime,
        sourceIp: evt.source || '192.168.1.50',
        endpoint: evt.target || '/api/v1/resource',
        httpMethod: 'GET',
        statusCode: evt.severity === 'threat' ? 403 : 200,
        messageEn: evt.description || 'Application event processed',
        messageAr: 'تم تسجيل حدث في طبقة التطبيقات',
        metadata: evt.payload || {},
      });
    }
  }

  return records;
}
