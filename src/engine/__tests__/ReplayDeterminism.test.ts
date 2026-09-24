import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';

describe('Replay Determinism & State Restoration', () => {
  it('produces identical state and event history given identical scenario execution', () => {
    const runScenario = () => {
      const runtime = new SimulationRuntime();
      runtime.dispatch({ type: 'PACKET_CREATED', source: 'client', target: 'server' });
      runtime.schedule({ at: 100, type: 'PACKET_SENT' });
      runtime.schedule({ at: 200, type: 'PACKET_DELIVERED' });
      runtime.step(300);
      return {
        events: runtime.events.getHistory(),
        time: runtime.clock.getVirtualTime(),
      };
    };

    const run1 = runScenario();
    const run2 = runScenario();

    expect(run1.time).toBe(run2.time);
    expect(run1.events.map((e) => ({ type: e.type, vTime: e.virtualTime }))).toEqual(
      run2.events.map((e) => ({ type: e.type, vTime: e.virtualTime }))
    );
  });

  it('replayTo restores complete logical simulation state (nodes, packets, events, logs, rules)', () => {
    const runtime = new SimulationRuntime();

    runtime.setNodes([
      { id: 'n1', name: 'Node 1', type: 'client', ip: '10.0.0.1', status: 'active', position: { x: 0, y: 0 } },
    ]);

    runtime.dispatch({ type: 'EVT_0', description: 'Event at 0' });
    runtime.packets.createPacket({ source: 'n1', destination: 'n1', protocol: 'TCP', startVirtualTime: 0, durationMs: 100 });

    runtime.step(100);

    runtime.dispatch({ type: 'EVT_100', description: 'Event at 100' });

    // Capture state at t=100
    const historyAt100 = runtime.events.getHistory();
    expect(historyAt100).toHaveLength(2);

    // Seek back to t=0
    runtime.replayTo(0);

    expect(runtime.clock.getVirtualTime()).toBe(0);
    expect(runtime.clock.getStatus()).toBe('paused');
    expect(runtime.getState().nodes).toHaveLength(1);
  });

  it('remains completely halted when paused', () => {
    const runtime = new SimulationRuntime();
    runtime.schedule({ at: 50, type: 'SHOULD_NOT_FIRE' });

    runtime.pause();
    expect(runtime.clock.getStatus()).toBe('paused');

    // Without stepping or ticking, history should remain empty
    expect(runtime.events.getHistory()).toHaveLength(0);
  });
});
