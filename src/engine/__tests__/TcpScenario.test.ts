import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { ScenarioDefinition } from '../scenario/ScenarioEngine';

describe('TCP Scenario Integration', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();

    const scenario: ScenarioDefinition = {
      id: 'tcp-handshake-test',
      titleAr: 'اختبار مصافحة TCP',
      titleEn: 'TCP Handshake Test',
      nodes: [
        { id: 'client', name: 'Client', type: 'client', ip: '192.168.1.100', status: 'active', position: { x: 0, y: 0 } },
        { id: 'server', name: 'Server', type: 'server', ip: '93.184.216.34', status: 'active', position: { x: 100, y: 0 } },
      ],
      connections: [
        { id: 'c1', source: 'client', target: 'server', latencyMs: 200, status: 'active' },
      ],
    };

    runtime.loadScenario(scenario);
  });

  it('executes full 3-way handshake in sequence: SYN -> SYN-ACK -> ACK -> ESTABLISHED', () => {
    // 1. Dispatch SYN at t=0
    runtime.dispatch({
      type: 'TCP_SYN',
      source: 'client',
      target: 'server',
      description: 'TCP SYN sent',
    });

    runtime.packets.createPacket({
      source: 'client',
      destination: 'server',
      protocol: 'TCP',
      flags: ['SYN'],
      startVirtualTime: 0,
      durationMs: 200,
    });

    // Schedule SYN-ACK at t=200
    runtime.schedule({
      at: 200,
      type: 'TCP_SYN_ACK',
      source: 'server',
      target: 'client',
      description: 'TCP SYN-ACK sent',
    });

    // Schedule ACK at t=400
    runtime.schedule({
      at: 400,
      type: 'TCP_ACK',
      source: 'client',
      target: 'server',
      description: 'TCP ACK sent',
    });

    // Schedule CONNECTION_OPENED at t=600
    runtime.schedule({
      at: 600,
      type: 'CONNECTION_OPENED',
      description: 'TCP Connection ESTABLISHED',
    });

    // Step through sequence
    runtime.step(200); // t = 200ms
    const typesAt200 = runtime.events.getHistory().map((e) => e.type);
    expect(typesAt200).toContain('TCP_SYN');
    expect(typesAt200).toContain('TCP_SYN_ACK');

    runtime.step(200); // t = 400ms
    const typesAt400 = runtime.events.getHistory().map((e) => e.type);
    expect(typesAt400).toContain('TCP_ACK');

    runtime.step(200); // t = 600ms
    const typesAt600 = runtime.events.getHistory().map((e) => e.type);
    expect(typesAt600).toContain('CONNECTION_OPENED');
  });
});
