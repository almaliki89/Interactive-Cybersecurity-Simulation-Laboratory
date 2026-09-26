/**
 * OMEGA V14 — Container & Kubernetes Event Bridge
 * Dispatches normalized security telemetry to SOC Event Bridge deterministically.
 */

import { globalSimulationRuntime, SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import { normalizeContainerEvent, RawContainerEvent } from './normalizeContainerEvent';

export class ContainerEventBridge {
  private static instance: ContainerEventBridge;
  private runtime: SimulationRuntime;
  private ingestedEvents: SecurityTelemetryEvent[] = [];

  private constructor(runtime: SimulationRuntime = globalSimulationRuntime) {
    this.runtime = runtime;
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
