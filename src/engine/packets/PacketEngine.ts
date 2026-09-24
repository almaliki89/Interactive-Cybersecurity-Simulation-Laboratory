import { Packet, ProtocolType } from '../../types/simulation';

export interface RouteHop {
  nodeId: string;
  arriveAtVirtualTime?: number;
  leaveAtVirtualTime?: number;
}

export interface EnginePacket extends Packet {
  route?: string[]; // Array of node IDs e.g. ['client', 'router', 'firewall', 'server']
  currentHopIndex?: number;
  startVirtualTime: number;
  endVirtualTime: number;
  decisionReason?: string;
  decisionRuleId?: string;
  blockedAtNodeId?: string;
}

export class PacketEngine {
  private packets: Map<string, EnginePacket> = new Map();
  private packetIdCounter = 1;

  public createPacket(params: {
    source: string;
    destination: string;
    protocol: ProtocolType;
    sourcePort?: number;
    destinationPort?: number;
    flags?: string[];
    payload?: any;
    route?: string[];
    startVirtualTime: number;
    durationMs?: number;
  }): EnginePacket {
    const duration = params.durationMs ?? 1000;
    const id = `pkt-${this.packetIdCounter++}-${params.startVirtualTime}`;
    const route = params.route && params.route.length >= 2 ? params.route : [params.source, params.destination];

    const pkt: EnginePacket = {
      id,
      source: params.source,
      destination: params.destination,
      protocol: params.protocol,
      sourcePort: params.sourcePort ?? 49152,
      destinationPort: params.destinationPort ?? 80,
      flags: params.flags ?? [],
      payload: params.payload ?? null,
      state: 'queued',
      progress: 0,
      timestamp: params.startVirtualTime,
      route,
      currentHopIndex: 0,
      startVirtualTime: params.startVirtualTime,
      endVirtualTime: params.startVirtualTime + duration,
    };

    this.packets.set(id, pkt);
    return pkt;
  }

  public restoreState(packets: EnginePacket[]): void {
    this.packets.clear();
    packets.forEach((p) => {
      this.packets.set(p.id, JSON.parse(JSON.stringify(p)));
    });
  }

  public addPacket(packet: EnginePacket): void {
    this.packets.set(packet.id, packet);
  }

  public getPacket(id: string): EnginePacket | undefined {
    return this.packets.get(id);
  }

  public getAllPackets(): EnginePacket[] {
    return Array.from(this.packets.values());
  }

  public blockPacket(id: string, reason: string, ruleId?: string, atNodeId?: string): void {
    const pkt = this.packets.get(id);
    if (pkt) {
      pkt.state = 'blocked';
      pkt.blockedReason = reason;
      pkt.decisionReason = reason;
      pkt.decisionRuleId = ruleId;
      pkt.blockedAtNodeId = atNodeId;
    }
  }

  public dropPacket(id: string, reason: string): void {
    const pkt = this.packets.get(id);
    if (pkt) {
      pkt.state = 'dropped';
      pkt.blockedReason = reason;
      pkt.decisionReason = reason;
    }
  }

  public deliverPacket(id: string): void {
    const pkt = this.packets.get(id);
    if (pkt) {
      pkt.state = 'delivered';
      pkt.progress = 1.0;
    }
  }

  /**
   * Evaluates packet positions and states deterministically based on virtualTime.
   */
  public updateAtVirtualTime(currentVirtualTime: number): {
    active: EnginePacket[];
    arrived: EnginePacket[];
    blocked: EnginePacket[];
  } {
    const active: EnginePacket[] = [];
    const arrived: EnginePacket[] = [];
    const blocked: EnginePacket[] = [];

    this.packets.forEach((pkt) => {
      // If packet has not started yet
      if (currentVirtualTime < pkt.startVirtualTime) {
        pkt.state = 'queued';
        pkt.progress = 0;
        active.push(pkt);
        return;
      }

      // If packet was explicitly blocked or dropped
      if (pkt.state === 'blocked') {
        blocked.push(pkt);
        active.push(pkt);
        return;
      }
      if (pkt.state === 'dropped') {
        return;
      }

      const totalDuration = Math.max(1, pkt.endVirtualTime - pkt.startVirtualTime);
      const elapsed = currentVirtualTime - pkt.startVirtualTime;
      const progress = Math.min(1.0, Math.max(0.0, elapsed / totalDuration));

      pkt.progress = progress;

      if (progress >= 1.0) {
        if (pkt.state !== 'delivered') {
          pkt.state = 'delivered';
          arrived.push(pkt);
        }
      } else {
        pkt.state = 'moving';
        active.push(pkt);
      }
    });

    return { active, arrived, blocked };
  }

  public clear(): void {
    this.packets.clear();
  }
}
