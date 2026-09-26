/**
 * OMEGA V15 — DevSecOps Event Bridge
 * Dispatches normalized security telemetry to Simulation Runtime and SOC deterministically.
 */

import { globalSimulationRuntime, SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import { normalizeDevSecOpsEvent, RawDevSecOpsEvent } from './normalizeDevSecOpsEvent';

export class DevSecOpsEventBridge {
  private static instance: DevSecOpsEventBridge;
  private runtime: SimulationRuntime;
  private ingestedEvents: SecurityTelemetryEvent[] = [];

  private constructor(runtime: SimulationRuntime = globalSimulationRuntime) {
    this.runtime = runtime;
  }

  public static getInstance(): DevSecOpsEventBridge {
    if (!DevSecOpsEventBridge.instance) {
      DevSecOpsEventBridge.instance = new DevSecOpsEventBridge();
    }
    return DevSecOpsEventBridge.instance;
  }

  public emitEvent(raw: RawDevSecOpsEvent): SecurityTelemetryEvent {
    const normalized = normalizeDevSecOpsEvent(raw);
    this.ingestedEvents.push(normalized);

    this.runtime.events.dispatch({
      id: raw.id,
      type: raw.eventType as any,
      source: raw.repository || 'ci-runner',
      target: raw.filePath || 'pipeline',
      category: 'DEVSECOPS' as any,
      severity: raw.severity === 'threat' || raw.severity === 'critical' ? 'threat' : raw.severity === 'warn' ? 'warn' : 'info',
      virtualTime: raw.virtualTime,
      description: `[DevSecOps Event]: ${raw.eventType}`,
      payload: {
        ...raw.attributes,
        repository: raw.repository,
        commitSha: raw.commitSha,
        workflow: raw.workflow,
        artifact: raw.artifact,
        artifactDigest: raw.artifactDigest,
        actor: raw.actor,
        outcome: raw.outcome,
      },
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

export const devSecOpsEventBridge = DevSecOpsEventBridge.getInstance();
