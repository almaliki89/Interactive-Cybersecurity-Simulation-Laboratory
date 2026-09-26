/**
 * OMEGA V12 — Forensics Event Bridge & Evidence Ingestion Engine
 * Subscribes to SimulationRuntime event stream and maps SOC telemetry to Forensic Evidence artifacts.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SimulationRuntime, globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { ForensicEvidence } from '../logic/evidence';
import { calculateEvidenceHash } from '../logic/hashing';

export class ForensicsEventBridge {
  private runtime: SimulationRuntime;
  private evidenceMap: Map<string, ForensicEvidence> = new Map();
  private listeners: Set<(evidence: ForensicEvidence[]) => void> = new Set();
  private unsubscribeRuntime: (() => void) | null = null;

  constructor(runtime: SimulationRuntime = globalSimulationRuntime) {
    this.runtime = runtime;
    this.initRuntimeSubscription();
  }

  private initRuntimeSubscription() {
    this.unsubscribeRuntime = this.runtime.subscribe((state) => {
      this.syncEvidenceFromEvents(state.events);
    });
  }

  public reset() {
    this.evidenceMap.clear();
    this.notifyListeners();
  }

  public syncEvidenceFromEvents(events: unknown[]) {
    if (!events || events.length === 0) {
      if (this.evidenceMap.size > 0) {
        this.evidenceMap.clear();
        this.notifyListeners();
      }
      return;
    }

    events.forEach((rawEvt: any) => {
      const vTime = rawEvt.virtualTime ?? 0;
      const type = String(rawEvt.type || '');
      const source = String(rawEvt.source || 'FIN-WS-01');

      if (type === 'WINDOWS_LOGIN_FAILED' || type === 'KERBEROS_AUTH_SUCCESS' || type === 'WIN_LOG_CLEARED') {
        const id = 'EVD-LOG-WIN-SEC';
        if (!this.evidenceMap.has(id)) {
          const payload = { host: source, user: 'sara', logSource: 'Windows Security EventLog' };
          const hash = calculateEvidenceHash(payload);
          this.evidenceMap.set(id, {
            id,
            type: 'LOG_EXPORT',
            sourceHost: 'FIN-WS-01',
            sourceUser: 'sara',
            acquiredAtVirtualTime: vTime,
            originalHash: hash,
            currentHash: hash,
            preserved: true,
            integrityStatus: 'VERIFIED',
            metadata: payload,
          });
        }
      }

      if (type === 'PROCESS_CREATION') {
        const id = 'EVD-MEM-FIN-WS01';
        if (!this.evidenceMap.has(id)) {
          const payload = { process: 'cmd.exe', parent: 'svchost.exe', pid: 4912, user: 'sara' };
          const hash = calculateEvidenceHash(payload);
          this.evidenceMap.set(id, {
            id,
            type: 'MEMORY_IMAGE',
            sourceHost: 'FIN-WS-01',
            sourceUser: 'sara',
            acquiredAtVirtualTime: vTime,
            originalHash: hash,
            currentHash: hash,
            preserved: true,
            integrityStatus: 'VERIFIED',
            metadata: payload,
          });
        }
      }

      if (type === 'LINUX_PROCESS_SPAWNED') {
        const id = 'EVD-LOG-LINUX-AUTH';
        if (!this.evidenceMap.has(id)) {
          const payload = { host: 'LINUX-SRV-01', process: 'python3', user: 'root' };
          const hash = calculateEvidenceHash(payload);
          this.evidenceMap.set(id, {
            id,
            type: 'LOG_EXPORT',
            sourceHost: 'LINUX-SRV-01',
            sourceUser: 'root',
            acquiredAtVirtualTime: vTime,
            originalHash: hash,
            currentHash: hash,
            preserved: true,
            integrityStatus: 'VERIFIED',
            metadata: payload,
          });
        }
      }

      if (type === 'PACKET_BLOCKED') {
        const id = 'EVD-NET-PCAP-01';
        if (!this.evidenceMap.has(id)) {
          const payload = { pcapFile: 'nexora_fw_capture_t900.pcap', packetsCount: 1420 };
          const hash = calculateEvidenceHash(payload);
          this.evidenceMap.set(id, {
            id,
            type: 'NETWORK_CAPTURE',
            sourceHost: 'FW-CORE-01',
            sourceUser: 'sara',
            acquiredAtVirtualTime: vTime,
            originalHash: hash,
            currentHash: hash,
            preserved: true,
            integrityStatus: 'VERIFIED',
            metadata: payload,
          });
        }
      }

      if (type === 'SENSITIVE_RESOURCE_ACCESS') {
        const id = 'EVD-DISK-FIN-WS01';
        if (!this.evidenceMap.has(id)) {
          const payload = { diskImage: 'FIN-WS-01_E01', partition: 'NTFS', fileSystem: 'NTFS' };
          const hash = calculateEvidenceHash(payload);
          this.evidenceMap.set(id, {
            id,
            type: 'DISK_IMAGE',
            sourceHost: 'FIN-WS-01',
            sourceUser: 'sara',
            acquiredAtVirtualTime: vTime,
            originalHash: hash,
            currentHash: hash,
            preserved: true,
            integrityStatus: 'VERIFIED',
            metadata: payload,
          });
        }
      }

      if (type === 'APP_ACCESS_DENIED') {
        const id = 'EVD-BROWSER-HIST';
        if (!this.evidenceMap.has(id)) {
          const payload = { browser: 'Chrome', historyDb: 'History.db', user: 'sara' };
          const hash = calculateEvidenceHash(payload);
          this.evidenceMap.set(id, {
            id,
            type: 'BROWSER_ARTIFACT',
            sourceHost: 'FIN-WS-01',
            sourceUser: 'sara',
            acquiredAtVirtualTime: vTime,
            originalHash: hash,
            currentHash: hash,
            preserved: true,
            integrityStatus: 'VERIFIED',
            metadata: payload,
          });
        }
      }

      if (
        type.startsWith('K8S_') ||
        rawEvt.category === 'KUBERNETES' ||
        rawEvt.sourceWorld === 'KUBERNETES'
      ) {
        const rawId = rawEvt.id || `k8s-${vTime}-${type}`;
        const id = `EVD-${type}`;
        if (!this.evidenceMap.has(id)) {
          const payload = {
            sourceWorld: 'KUBERNETES',
            eventType: type,
            virtualTime: vTime,
            namespace: rawEvt.payload?.namespace || rawEvt.target || 'finance',
            pod: rawEvt.payload?.pod || rawEvt.source || 'frontend-service-67b8-x1',
            serviceAccount: rawEvt.payload?.serviceAccount || rawEvt.user || 'frontend-sa',
            sourceIp: rawEvt.payload?.sourceIp || rawEvt.sourceIp || '10.244.1.12',
            resource: rawEvt.payload?.resource || rawEvt.resource || 'secret/finance-db-credentials',
            rawEventId: rawId,
            ...rawEvt.payload,
          };
          const hash = calculateEvidenceHash(payload);
          this.evidenceMap.set(id, {
            id,
            type: 'LOG_EXPORT',
            sourceHost: `k8s-pod:${payload.namespace}/${payload.pod}`,
            sourceUser: payload.serviceAccount,
            acquiredAtVirtualTime: vTime,
            originalHash: hash,
            currentHash: hash,
            preserved: true,
            integrityStatus: 'VERIFIED',
            metadata: payload,
          });
        }
      }

      if (type === 'CLOUD_DATA_EXFILTRATION' || type === 'CLOUD_IMDS_CREDENTIAL_THEFT' || type === 'CLOUD_STORAGE_ACCESS') {
        const rawId = rawEvt.id || `cloud-${vTime}-${type}`;
        const id = `EVD-${type}`;
        if (!this.evidenceMap.has(id)) {
          const payload = {
            sourceWorld: 'CLOUD',
            eventType: type,
            virtualTime: vTime,
            resource: rawEvt.payload?.resource || rawEvt.payload?.bucketName || rawEvt.target || 'finance storage',
            sourceIp: rawEvt.payload?.sourceIPAddress || rawEvt.payload?.sourceIp || rawEvt.source || '198.51.100.44',
            rawEventId: rawId,
            ...rawEvt.payload,
          };
          const hash = calculateEvidenceHash(payload);
          this.evidenceMap.set(id, {
            id,
            type: 'LOG_EXPORT',
            sourceHost: 'CLOUD-VPC-PROD',
            sourceUser: rawEvt.payload?.user || rawEvt.payload?.userName || 'iam-role-finance-reader',
            acquiredAtVirtualTime: vTime,
            originalHash: hash,
            currentHash: hash,
            preserved: true,
            integrityStatus: 'VERIFIED',
            metadata: payload,
          });
        }
      }
    });

    this.notifyListeners();
  }

  public getAcquiredEvidence(): ForensicEvidence[] {
    return Array.from(this.evidenceMap.values());
  }

  public subscribe(listener: (evidence: ForensicEvidence[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getAcquiredEvidence());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const list = this.getAcquiredEvidence();
    this.listeners.forEach((listener) => {
      try {
        listener(list);
      } catch (err) {
        console.error('ForensicsEventBridge listener error:', err);
      }
    });
  }

  public destroy() {
    if (this.unsubscribeRuntime) {
      this.unsubscribeRuntime();
      this.unsubscribeRuntime = null;
    }
    this.listeners.clear();
    this.evidenceMap.clear();
  }
}

export const globalForensicsEventBridge = new ForensicsEventBridge(globalSimulationRuntime);
