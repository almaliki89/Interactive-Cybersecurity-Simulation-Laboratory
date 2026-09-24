import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEngine } from '../events/EventEngine';

describe('EventEngine', () => {
  let eventEngine: EventEngine;

  beforeEach(() => {
    eventEngine = new EventEngine();
  });

  it('dispatches events with deterministic IDs and adds to history', () => {
    const evt = eventEngine.dispatch({
      type: 'PACKET_CREATED',
      virtualTime: 100,
      description: 'Packet generated',
    });

    expect(evt.id).toBeDefined();
    expect(evt.virtualTime).toBe(100);
    expect(eventEngine.getHistory()).toHaveLength(1);
    expect(eventEngine.getHistory()[0]).toEqual(evt);
  });

  it('executes scheduled events in order when processUntil is called', () => {
    const log: string[] = [];

    eventEngine.schedule({ at: 200, type: 'EVENT_B' });
    eventEngine.schedule({ at: 100, type: 'EVENT_A' });
    eventEngine.schedule({ at: 300, type: 'EVENT_C' });

    eventEngine.on('*', (evt) => log.push(evt.type));

    const processed1 = eventEngine.processUntil(150);
    expect(processed1).toHaveLength(1);
    expect(log).toEqual(['EVENT_A']);

    const processed2 = eventEngine.processUntil(350);
    expect(processed2).toHaveLength(2);
    expect(log).toEqual(['EVENT_A', 'EVENT_B', 'EVENT_C']);
  });

  it('traces causal chains correctly', () => {
    const e1 = eventEngine.dispatch({ type: 'CAUSE_EVENT', virtualTime: 0 });
    const e2 = eventEngine.dispatch({ type: 'EFFECT_EVENT', virtualTime: 50, causedByEventId: e1.id });
    const e3 = eventEngine.dispatch({ type: 'FINAL_EVENT', virtualTime: 100, causedByEventId: e2.id });

    const chain = eventEngine.traceCausalChain(e3.id);
    expect(chain.map((e) => e.id)).toEqual([e1.id, e2.id, e3.id]);
  });

  it('restores state accurately', () => {
    const e1 = eventEngine.dispatch({ type: 'EVENT_1', virtualTime: 0 });
    const history = eventEngine.getHistory();

    const newEngine = new EventEngine();
    newEngine.restoreState(history);

    expect(newEngine.getHistory()).toEqual(history);
  });
});
