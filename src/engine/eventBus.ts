import { SimulationEvent, EventType } from '../types/simulation';

export type EventCallback = (event: SimulationEvent) => void;

export class SimulationEventBus {
  private listeners: Map<EventType | '*', Set<EventCallback>> = new Map();
  private eventHistory: SimulationEvent[] = [];
  private maxHistorySize: number = 200;

  public subscribe(eventType: EventType | '*', callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  public emit(event: Omit<SimulationEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): SimulationEvent {
    const fullEvent: SimulationEvent = {
      id: event.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: event.timestamp ?? Date.now(),
      ...event,
    };

    this.eventHistory.push(fullEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Call specific listeners
    const specificSet = this.listeners.get(fullEvent.type);
    if (specificSet) {
      specificSet.forEach((cb) => {
        try {
          cb(fullEvent);
        } catch (e) {
          console.error(`Error in event callback for ${fullEvent.type}:`, e);
        }
      });
    }

    // Call wildcard listeners
    const wildcardSet = this.listeners.get('*');
    if (wildcardSet) {
      wildcardSet.forEach((cb) => {
        try {
          cb(fullEvent);
        } catch (e) {
          console.error('Error in wildcard event callback:', e);
        }
      });
    }

    return fullEvent;
  }

  public getHistory(): SimulationEvent[] {
    return [...this.eventHistory];
  }

  public clear() {
    this.eventHistory = [];
  }
}

export const globalEventBus = new SimulationEventBus();
