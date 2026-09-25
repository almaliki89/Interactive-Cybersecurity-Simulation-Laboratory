/**
 * Active Directory Enterprise Event Bridge
 * Dispatches AD audit events into the global SimulationRuntime / EventEngine
 * and maps runtime events to ActiveDirectoryEvent records for forensics & SIEM.
 */

import { globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { SimulationEvent } from '../../../engine/events/EventEngine';
import { ActiveDirectoryEvent } from '../logic/eventlog';

export const AD_EVENT_TYPES = {
  USER_MOVED: 'AD_USER_MOVED',
  USER_ENABLED: 'AD_USER_ENABLED',
  USER_DISABLED: 'AD_USER_DISABLED',
  GROUP_MEMBERSHIP_CHANGED: 'AD_GROUP_MEMBERSHIP_CHANGED',
  GPO_APPLIED: 'AD_GPO_APPLIED',
  LDAP_QUERY_EXECUTED: 'AD_LDAP_QUERY_EXECUTED',
  RESOURCE_ACCESS_ALLOWED: 'AD_RESOURCE_ACCESS_ALLOWED',
  RESOURCE_ACCESS_DENIED: 'AD_RESOURCE_ACCESS_DENIED',
} as const;

/**
 * Dispatches an enterprise Active Directory event into the global SimulationRuntime.
 */
export function dispatchEnterpriseAdEvent(
  params: {
    eventId: number;
    channel: 'Security' | 'Directory Service' | 'System';
    severity?: 'Information' | 'Warning' | 'Error';
    subjectUser: string;
    targetUserOrObject?: string;
    computer?: string;
    actionEn: string;
    actionAr: string;
    detailsEn: string;
    detailsAr: string;
    category: ActiveDirectoryEvent['category'];
    virtualTime?: number;
    runtimeEventType?: string;
  }
): ActiveDirectoryEvent {
  const vTime = params.virtualTime ?? globalSimulationRuntime.clock.getVirtualTime();
  const computer = params.computer ?? 'DC01-NEXORA';
  const severity = params.severity ?? 'Information';

  const adRecord: ActiveDirectoryEvent = {
    id: `ad-evt-${params.eventId}-${vTime}`,
    eventId: params.eventId,
    channel: params.channel,
    provider:
      params.channel === 'Directory Service'
        ? 'Microsoft-Windows-ActiveDirectory_DomainService'
        : 'Microsoft-Windows-Security-Auditing',
    virtualTime: vTime,
    severity,
    subjectUser: params.subjectUser,
    targetUserOrObject: params.targetUserOrObject,
    computer,
    actionEn: params.actionEn,
    actionAr: params.actionAr,
    detailsEn: params.detailsEn,
    detailsAr: params.detailsAr,
    category: params.category,
  };

  // Dispatch into global simulation runtime
  globalSimulationRuntime.dispatch({
    id: adRecord.id,
    type: params.runtimeEventType || `AD_EVENT_${params.eventId}`,
    source: params.subjectUser,
    target: params.targetUserOrObject || computer,
    category: 'IDENTITY',
    severity: severity === 'Warning' ? 'warn' : severity === 'Error' ? 'threat' : 'info',
    description: params.actionEn,
    payload: adRecord,
  });

  return adRecord;
}

/**
 * Projects runtime SimulationEvents into formatted ActiveDirectoryEvent records.
 */
export function projectRuntimeEventsToAdRecords(
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
): ActiveDirectoryEvent[] {
  const records: ActiveDirectoryEvent[] = [];

  for (const evt of runtimeEvents) {
    const vTime = evt.virtualTime ?? 0;
    if (evt.payload && 'eventId' in evt.payload && 'channel' in evt.payload) {
      records.push(evt.payload as ActiveDirectoryEvent);
    } else if (evt.type.startsWith('KERBEROS_')) {
      let eventId = 4768;
      let actionEn = 'Kerberos Authentication Ticket (TGT) Requested';
      let actionAr = 'طلب تذكرة مصادقة Kerberos (TGT)';
      let severity: ActiveDirectoryEvent['severity'] = 'Information';

      if (evt.type === 'KERBEROS_SERVICE_TICKET_ISSUED' || evt.type === 'KERBEROS_TGS_REQ') {
        eventId = 4769;
        actionEn = 'Kerberos Service Ticket Requested';
        actionAr = 'طلب تذكرة خدمة Kerberos';
      } else if (evt.type.includes('FAIL') || evt.type.includes('SKEW') || evt.type.includes('DISABLED')) {
        eventId = 4771;
        actionEn = 'Kerberos Pre-Authentication Failed';
        actionAr = 'فشلت المصادقة المسبقة لـ Kerberos';
        severity = 'Warning';
      } else if (evt.type === 'KERBEROS_AUTH_SUCCESS') {
        eventId = 4624;
        actionEn = 'Account Successfully Logged On';
        actionAr = 'تم تسجيل الدخول بنجاح';
      }

      records.push({
        id: `ad-evt-krb-${vTime}-${evt.id}`,
        eventId,
        channel: 'Security',
        provider: 'Microsoft-Windows-Security-Auditing',
        virtualTime: vTime,
        severity,
        subjectUser: evt.source || evt.payload?.clientPrincipal || 'sara',
        targetUserOrObject: evt.target || evt.payload?.targetSpn,
        computer: 'DC01-NEXORA',
        actionEn,
        actionAr,
        detailsEn: evt.description || actionEn,
        detailsAr: actionAr,
        category: 'Logon/Logoff',
      });
    }
  }

  return records;
}
