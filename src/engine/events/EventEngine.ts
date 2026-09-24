export type SimulationEventType =
  | 'PACKET_CREATED'
  | 'PACKET_SENT'
  | 'PACKET_RECEIVED'
  | 'PACKET_BLOCKED'
  | 'PACKET_DROPPED'
  | 'PACKET_DELIVERED'
  | 'CONNECTION_OPENED'
  | 'CONNECTION_CLOSED'
  | 'DNS_QUERY'
  | 'DNS_RESPONSE'
  | 'TCP_SYN'
  | 'TCP_SYN_ACK'
  | 'TCP_ACK'
  | 'TCP_TIMEOUT'
  | 'TCP_RETRANSMIT'
  | 'HTTP_REQUEST'
  | 'HTTP_RESPONSE'
  | 'TLS_CLIENT_HELLO'
  | 'TLS_SERVER_HELLO'
  | 'TLS_CERTIFICATE'
  | 'TLS_ESTABLISHED'
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'FIREWALL_RULE_MATCHED'
  | 'LOG_GENERATED'
  | 'SIEM_EVENT_INGESTED'
  | 'SIEM_CORRELATION_MATCHED'
  | 'ALERT_CREATED'
  | 'NODE_STATE_CHANGED'
  | 'USER_ACTION'
  | 'ARP_CACHE_CHECK'
  | 'ARP_CACHE_HIT'
  | 'ARP_CACHE_MISS'
  | 'ARP_REQUEST'
  | 'ARP_REPLY'
  | 'DHCP_DISCOVER'
  | 'DHCP_OFFER'
  | 'DHCP_REQUEST'
  | 'DHCP_ACK'
  | 'LEASE_CREATED'
  | 'ROUTE_LOOKUP'
  | 'ROUTE_MATCHED'
  | 'NEXT_HOP_SELECTED'
  | 'SWITCH_MAC_LEARNED'
  | 'SWITCH_FRAME_FORWARDED'
  | 'SWITCH_FRAME_FLOODED'
  | 'VLAN_FRAME_ALLOWED'
  | 'VLAN_FRAME_BLOCKED'
  | 'NAT_TRANSLATION_CREATED'
  | 'NAT_TRANSLATION_REMOVED'
  | 'UDP_DATAGRAM_SENT'
  | 'UDP_DATAGRAM_DELIVERED'
  | 'UDP_DATAGRAM_DROPPED'
  | string;

export interface SimulationEvent {
  id: string;
  type: SimulationEventType;
  virtualTime: number;
  timestamp: number;
  source?: string;
  target?: string;
  severity?: 'info' | 'warn' | 'threat' | 'success';
  category?: string;
  description?: string;
  causedByEventId?: string;
  relatedEntities?: string[];
  payload?: any;
}

export interface ScheduledEvent {
  at: number; // target virtualTime in ms
  type: SimulationEventType;
  source?: string;
  target?: string;
  severity?: 'info' | 'warn' | 'threat' | 'success';
  category?: string;
  description?: string;
  causedByEventId?: string;
  relatedEntities?: string[];
  payload?: any;
}

export type EventHandler = (event: SimulationEvent) => void;

export class EventEngine {
  private queue: ScheduledEvent[] = [];
  private eventHistory: SimulationEvent[] = [];
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private globalListeners: Set<EventHandler> = new Set();
  private eventIdCounter = 1;

  public schedule(event: ScheduledEvent): void {
    this.queue.push(event);
    this.queue.sort((a, b) => a.at - b.at);
  }

  public scheduleBatch(events: ScheduledEvent[]): void {
    this.queue.push(...events);
    this.queue.sort((a, b) => a.at - b.at);
  }

  public dispatch(event: Omit<SimulationEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): SimulationEvent {
    const fullEvent: SimulationEvent = {
      id: event.id || `evt-${this.eventIdCounter++}-${event.virtualTime ?? 0}`,
      timestamp: event.timestamp ?? event.virtualTime ?? 0,
      ...event,
    };

    this.eventHistory.push(fullEvent);

    // Notify specific type listeners
    const typeHandlers = this.listeners.get(fullEvent.type);
    if (typeHandlers) {
      typeHandlers.forEach((handler) => {
        try {
          handler(fullEvent);
        } catch (e) {
          console.error('EventEngine handler error:', e);
        }
      });
    }

    // Notify global listeners
    this.globalListeners.forEach((handler) => {
      try {
        handler(fullEvent);
      } catch (e) {
        console.error('EventEngine global listener error:', e);
      }
    });

    return fullEvent;
  }

  public processUntil(virtualTime: number): SimulationEvent[] {
    const executed: SimulationEvent[] = [];

    while (this.queue.length > 0 && this.queue[0].at <= virtualTime) {
      const nextScheduled = this.queue.shift()!;
      const evt = this.dispatch({
        ...nextScheduled,
        virtualTime: nextScheduled.at,
      });
      executed.push(evt);
    }

    return executed;
  }

  public on(type: SimulationEventType | '*', handler: EventHandler): () => void {
    if (type === '*') {
      this.globalListeners.add(handler);
      return () => this.globalListeners.delete(handler);
    }

    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    const handlers = this.listeners.get(type)!;
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  public getHistory(): SimulationEvent[] {
    return [...this.eventHistory];
  }

  public getQueue(): ScheduledEvent[] {
    return [...this.queue];
  }

  public traceCausalChain(eventId: string): SimulationEvent[] {
    const chain: SimulationEvent[] = [];
    let current = this.eventHistory.find((e) => e.id === eventId);

    while (current) {
      chain.unshift(current);
      if (current.causedByEventId) {
        current = this.eventHistory.find((e) => e.id === current?.causedByEventId);
      } else {
        break;
      }
    }

    return chain;
  }

  public restoreState(history: SimulationEvent[], queue: ScheduledEvent[] = []): void {
    this.eventHistory = JSON.parse(JSON.stringify(history));
    this.queue = JSON.parse(JSON.stringify(queue));
  }

  public clear(): void {
    this.queue = [];
    this.eventHistory = [];
  }
}
