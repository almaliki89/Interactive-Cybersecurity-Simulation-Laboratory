/**
 * OMEGA V11 — SOC Event Bridge & Ingestion Pipeline
 * Connects the shared SimulationRuntime event bus directly to the SOC SIEM normalization and enrichment pipeline.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SimulationRuntime, globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { SimulationEvent } from '../../../types/simulation';
import { SecurityTelemetryEvent } from '../logic/telemetry';
import { normalizeRuntimeEvent } from '../logic/normalization';
import { enrichTelemetryEvent, EnrichedTelemetryEvent } from '../logic/enrichment';

export class SocEventBridge {
  private runtime: SimulationRuntime;
  private normalizedEvents: EnrichedTelemetryEvent[] = [];
  private listeners: Set<(events: EnrichedTelemetryEvent[]) => void> = new Set();
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

  public syncFromRuntimeEvents(events: SimulationEvent[]) {
    const enrichedList = events.map((rawEvt) => {
      const normalized = normalizeRuntimeEvent({
        id: rawEvt.id,
        type: rawEvt.type,
        source: rawEvt.source,
        target: rawEvt.target,
        category: rawEvt.category,
        severity: rawEvt.severity,
        virtualTime: rawEvt.virtualTime,
        description: rawEvt.description,
        payload: (rawEvt.payload as Record<string, unknown>) || {},
      });
      return enrichTelemetryEvent(normalized);
    });

    this.normalizedEvents = enrichedList;
    this.notifyListeners();
  }

  public getTelemetry(): EnrichedTelemetryEvent[] {
    return [...this.normalizedEvents];
  }

  public subscribe(listener: (events: EnrichedTelemetryEvent[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getTelemetry());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const list = this.getTelemetry();
    this.listeners.forEach((listener) => {
      try {
        listener(list);
      } catch (err) {
        console.error('SocEventBridge listener error:', err);
      }
    });
  }

  public destroy() {
    if (this.unsubscribeRuntime) {
      this.unsubscribeRuntime();
      this.unsubscribeRuntime = null;
    }
    this.listeners.clear();
  }
}

export const globalSocEventBridge = new SocEventBridge(globalSimulationRuntime);
