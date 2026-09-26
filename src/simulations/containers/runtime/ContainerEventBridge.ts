/**
 * OMEGA V14 — Container & Kubernetes Event Bridge
 * Dispatches normalized security telemetry to SOC Event Bridge deterministically.
 */

import { globalSimulationRuntime, SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import { globalSocEventBridge } from '../../soc/runtime/SocEventBridge';
import { globalForensicsEventBridge } from '../../forensics/runtime/ForensicsEventBridge';
import { normalizeContainerEvent, RawContainerEvent } from './normalizeContainerEvent';

export class ContainerEventBridge {
  private static instance: ContainerEventBridge;
  private runtime: SimulationRuntime;
  private ingestedEvents: SecurityTelemetryEvent[] = [];

  private constructor(runtime: SimulationRuntime = globalSimulationRuntime) {
    this.runtime = runtime;
    this.initRuntimeSubscription();
  }

  private initRuntimeSubscription() {
    this.runtime.events.on('*', (evt) => {
      if (evt.category === 'KUBERNETES' || evt.type.startsWith('K8S_')) {
        const existing = this.ingestedEvents.some((e) => e.rawEventId === evt.id);
        if (!existing) {
          const rawPayload = (evt.payload as Record<string, unknown>) || {};
          const raw: RawContainerEvent = {
            id: evt.id,
            eventType: evt.type,
            virtualTime: evt.virtualTime,
            podName: (rawPayload.podName as string) || evt.source,
            namespace: (rawPayload.namespace as string) || (evt.target as string),
            serviceAccount: rawPayload.serviceAccount as string,
            sourceIp: rawPayload.sourceIp as string,
            resource: (rawPayload.resource as string) || evt.source,
            severity: evt.severity === 'threat' ? 'critical' : evt.severity === 'warn' ? 'warn' : 'info',
            attributes: rawPayload,
          };
          const normalized = normalizeContainerEvent(raw);
          this.ingestedEvents.push(normalized);
          globalSocEventBridge.ingestEvent(normalized);
          globalForensicsEventBridge.syncEvidenceFromEvents([
            {
              id: normalized.rawEventId || normalized.id,
              type: normalized.eventType,
              virtualTime: normalized.virtualTime,
              source: normalized.resource || normalized.host,
              target: normalized.attributes.namespace,
              category: normalized.category,
              severity: normalized.severity,
              payload: {
                ...normalized.attributes,
                sourceWorld: normalized.sourceWorld,
                serviceAccount: normalized.attributes.serviceAccount || normalized.user,
                pod: normalized.attributes.pod || normalized.resource,
                sourceIp: normalized.sourceIp,
                resource: normalized.resource,
              },
            },
          ]);
        }
      }
    });
  }

  public static getInstance(): ContainerEventBridge {
    if (!ContainerEventBridge.instance) {
      ContainerEventBridge.instance = new ContainerEventBridge();
    }
    return ContainerEventBridge.instance;
  }

  public emitEvent(raw: RawContainerEvent): SecurityTelemetryEvent {
    const normalized = normalizeContainerEvent(raw);
    this.ingestedEvents.push(normalized);

    // Ingest into SOC SIEM pipeline
    globalSocEventBridge.ingestEvent(normalized);

    // Ingest into Forensics evidence stream
    globalForensicsEventBridge.syncEvidenceFromEvents([
      {
        id: normalized.rawEventId || normalized.id,
        type: normalized.eventType,
        virtualTime: normalized.virtualTime,
        source: normalized.resource || normalized.host,
        target: normalized.attributes.namespace,
        category: normalized.category,
        severity: normalized.severity,
        payload: {
          ...normalized.attributes,
          sourceWorld: normalized.sourceWorld,
          serviceAccount: normalized.attributes.serviceAccount || normalized.user,
          pod: normalized.attributes.pod || normalized.resource,
          sourceIp: normalized.sourceIp,
          resource: normalized.resource,
        },
      },
    ]);

    this.runtime.events.dispatch({
      id: raw.id,
      type: raw.eventType as any,
      source: raw.podName || 'k8s-control-plane',
      target: raw.namespace || 'production',
      category: 'KUBERNETES' as any,
      severity: raw.severity === 'threat' || raw.severity === 'critical' ? 'threat' : raw.severity === 'warn' ? 'warn' : 'info',
      virtualTime: raw.virtualTime,
      description: `[K8s Event]: ${raw.eventType} on ${raw.podName || 'cluster'}`,
      payload: raw.attributes,
    });

    return normalized;
  }

  public getIngestedEvents(): SecurityTelemetryEvent[] {
    return [...this.ingestedEvents];
  }

  public reset(): void {
    this.ingestedEvents = [];
  }
}

export const containerEventBridge = ContainerEventBridge.getInstance();
