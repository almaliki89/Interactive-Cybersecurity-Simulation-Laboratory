import { describe, it, expect, beforeEach } from 'vitest';
import { PacketEngine } from '../packets/PacketEngine';

describe('PacketEngine', () => {
  let packetEngine: PacketEngine;

  beforeEach(() => {
    packetEngine = new PacketEngine();
  });

  it('creates packet with deterministic IDs and start/end virtual time', () => {
    const pkt = packetEngine.createPacket({
      source: 'client',
      destination: 'server',
      protocol: 'TCP',
      startVirtualTime: 100,
      durationMs: 500,
    });

    expect(pkt.id).toContain('pkt-');
    expect(pkt.startVirtualTime).toBe(100);
    expect(pkt.endVirtualTime).toBe(600);
    expect(pkt.state).toBe('queued');
  });

  it('updates packet state and progress based on virtualTime', () => {
    const pkt = packetEngine.createPacket({
      source: 'client',
      destination: 'server',
      protocol: 'TCP',
      startVirtualTime: 100,
      durationMs: 400,
    });

    // Before start time
    packetEngine.updateAtVirtualTime(50);
    expect(pkt.state).toBe('queued');
    expect(pkt.progress).toBe(0);

    // In flight
    packetEngine.updateAtVirtualTime(300);
    expect(pkt.state).toBe('moving');
    expect(pkt.progress).toBe(0.5);

    // Delivered
    const res = packetEngine.updateAtVirtualTime(500);
    expect(pkt.state).toBe('delivered');
    expect(pkt.progress).toBe(1.0);
    expect(res.arrived).toContain(pkt);
  });

  it('handles blocked and dropped packets correctly', () => {
    const pkt = packetEngine.createPacket({
      source: 'client',
      destination: 'server',
      protocol: 'HTTP',
      startVirtualTime: 0,
      durationMs: 1000,
    });

    packetEngine.blockPacket(pkt.id, 'Blocked by ACL Rule 2', 'rule-2', 'firewall');
    expect(pkt.state).toBe('blocked');
    expect(pkt.blockedReason).toBe('Blocked by ACL Rule 2');
  });

  it('restores packets state accurately', () => {
    const pkt = packetEngine.createPacket({
      source: 'src',
      destination: 'dst',
      protocol: 'DNS',
      startVirtualTime: 0,
    });

    const packets = packetEngine.getAllPackets();
    const newEngine = new PacketEngine();
    newEngine.restoreState(packets);

    expect(newEngine.getAllPackets()).toEqual(packets);
  });
});
