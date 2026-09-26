/**
 * OMEGA V13 — Cloud Security World
 * runtime/CloudEventBridge.ts
 *
 * Subscribes to SimulationRuntime and bridges runtime telemetry events into
 * Cloud Audit Logs (CloudTrail) and Detection Engine alerts.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SimulationRuntime, globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { CloudAuditLogEntry } from '../logic/logging';
import { CloudDetectionAlert, evaluateCloudDetections } from '../logic/detection';

export class CloudEventBridge {
  private runtime: SimulationRuntime;
  private auditLogs: CloudAuditLogEntry[] = [];
  private detections: CloudDetectionAlert[] = [];
  private listeners: Set<(logs: CloudAuditLogEntry[], alerts: CloudDetectionAlert[]) => void> = new Set();
  private unsubscribeRuntime: (() => void) | null = null;

  constructor(runtime: SimulationRuntime = globalSimulationRuntime) {
    this.runtime = runtime;
    this.initRuntimeSubscription();
  }

  private initRuntimeSubscription() {
    this.unsubscribeRuntime = this.runtime.subscribe((state) => {
      this.syncFromRuntimeEvents(state.events);
    });
  }

  public reset() {
    this.auditLogs = [];
    this.detections = [];
    this.notifyListeners();
  }

  public syncFromRuntimeEvents(events: unknown[]) {
    if (!events || events.length === 0) {
      if (this.auditLogs.length > 0 || this.detections.length > 0) {
        this.auditLogs = [];
        this.detections = [];
        this.notifyListeners();
      }
      return;
    }

    const newLogs: CloudAuditLogEntry[] = [];

    events.forEach((rawEvt: any, idx) => {
      const vTime = rawEvt.virtualTime ?? rawEvt.at ?? 0;
      const type = String(rawEvt.type || '');
      const source = String(rawEvt.source || '203.0.113.88');
      const payload = rawEvt.payload || {};

      if (type === 'CLOUD_IMDS_CREDENTIAL_THEFT') {
        newLogs.push({
          id: `log-imds-${vTime}-${idx}`,
          eventTimeVirtual: vTime,
          eventVersion: '1.08',
          userIdentity: {
            type: 'AWSService',
            principalId: 'IMDS-V1',
            arn: 'ncrn:nexora:iam::acc-prod-003:role/NexoraAppWorkloadInstanceProfileRole',
            accountId: 'acc-prod-003',
          },
          eventSource: 'iam.nexora.com',
          eventName: 'GetSecurityCredentials',
          awsRegion: 'nx-east-1',
          sourceIPAddress: source,
          userAgent: 'curl/7.88.1 (imds-v1-query)',
          requestParameters: { roleName: payload.roleName || 'NexoraAppWorkloadInstanceProfileRole' },
          readOnly: true,
          recipientAccountId: 'acc-prod-003',
          eventCategory: 'Management',
        });
      } else if (type === 'CLOUD_AUDIT_API_CALL') {
        newLogs.push({
          id: `log-api-${vTime}-${idx}`,
          eventTimeVirtual: vTime,
          eventVersion: '1.08',
          userIdentity: {
            type: 'AssumedRole',
            principalId: 'AROA-ATTACKER-SESSION',
            arn: payload.principalArn || 'ncrn:nexora:iam::acc-prod-003:assumed-role/NexoraAppWorkloadInstanceProfileRole',
            accountId: 'acc-prod-003',
          },
          eventSource: payload.eventSource || 'cloud.nexora.com',
          eventName: payload.eventName || 'DescribeInstances',
          awsRegion: 'nx-east-1',
          sourceIPAddress: payload.sourceIPAddress || source,
          userAgent: 'nexora-cli/2.14.0',
          requestParameters: payload,
          readOnly: payload.eventName?.startsWith('Get') || payload.eventName?.startsWith('List'),
          recipientAccountId: 'acc-prod-003',
          eventCategory: 'Management',
        });
      } else if (type === 'CLOUD_DATA_EXFILTRATION') {
        newLogs.push({
          id: `log-exfil-${vTime}-${idx}`,
          eventTimeVirtual: vTime,
          eventVersion: '1.08',
          userIdentity: {
            type: 'AssumedRole',
            principalId: 'AROA-ATTACKER-SESSION',
            arn: 'ncrn:nexora:iam::acc-prod-003:assumed-role/NexoraAppWorkloadInstanceProfileRole',
            accountId: 'acc-prod-003',
          },
          eventSource: 'storage.nexora.com',
          eventName: 'GetObject',
          awsRegion: 'nx-east-1',
          sourceIPAddress: payload.sourceIPAddress || source,
          userAgent: 'python-requests/2.31.0',
          requestParameters: { bucketName: payload.bucketName, key: payload.key },
          readOnly: true,
          recipientAccountId: 'acc-prod-003',
          eventCategory: 'Data',
        });
      }
    });

    this.auditLogs = newLogs;
    this.detections = evaluateCloudDetections(newLogs);
    this.notifyListeners();
  }

  public getAuditLogs(): CloudAuditLogEntry[] {
    return [...this.auditLogs];
  }

  public getDetections(): CloudDetectionAlert[] {
    return [...this.detections];
  }

  public subscribe(listener: (logs: CloudAuditLogEntry[], alerts: CloudDetectionAlert[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.auditLogs, this.detections);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.auditLogs, this.detections));
  }

  public destroy() {
    if (this.unsubscribeRuntime) {
      this.unsubscribeRuntime();
      this.unsubscribeRuntime = null;
    }
    this.listeners.clear();
    this.auditLogs = [];
    this.detections = [];
  }
}
