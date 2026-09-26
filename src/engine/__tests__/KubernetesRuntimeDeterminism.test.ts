/**
 * OMEGA V14.3 — Kubernetes Runtime Determinism Test Suite
 * Validates SimulationRuntime Pause, Resume, Step, Speed, Replay, and Same-Runtime Reset determinism
 * using strictly public APIs and loaded Kubernetes attack scenario.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { containerEventBridge } from '../../simulations/containers/runtime/ContainerEventBridge';
import {
  DETERMINISTIC_K8S_ATTACK_TIMELINE,
  loadKubernetesAttackScenario,
} from '../../simulations/containers/runtime/ContainerAttackScenario';

describe('Kubernetes Runtime Determinism Suite', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();
    containerEventBridge.reset();
  });

  it('PAUSE TEST: Pause stops virtualTime advancement and event emissions', () => {
    loadKubernetesAttackScenario(runtime);

    // Step to T+400
    runtime.step(400);
    const timeAt400 = runtime.clock.getVirtualTime();
    expect(timeAt400).toBe(400);

    const eventsAt400 = runtime.events.getHistory().length;
    expect(eventsAt400).toBeGreaterThan(0);

    // Pause runtime
    runtime.pause();
    expect(runtime.clock.getStatus()).toBe('paused');

    // Attempting background clock status check while paused
    const timeAfterPause = runtime.clock.getVirtualTime();
    expect(timeAfterPause).toBe(400);
    expect(runtime.events.getHistory().length).toBe(eventsAt400);
  });

  it('RESUME TEST: Resume resumes clock advancement and emits next event at exact virtualTime', () => {
    loadKubernetesAttackScenario(runtime);

    runtime.step(400); // At T+400
    runtime.pause();
    expect(runtime.clock.getStatus()).toBe('paused');

    // Resume
    runtime.resume();
    expect(runtime.clock.getStatus()).toBe('running');

    // Step forward 200 to T+600
    runtime.step(200);
    expect(runtime.clock.getVirtualTime()).toBe(600);

    const history = runtime.events.getHistory();
    const event600 = history.find((e) => e.virtualTime === 600);
    expect(event600).toBeDefined();
    expect(event600?.type).toBe('K8S_API_ENUMERATION');
  });

  it('STEP TEST: Exact stepping between timeline boundaries without manual event injection', () => {
    loadKubernetesAttackScenario(runtime);

    // Step to T+799 (just before T+800 boundary)
    runtime.step(799);
    let secretEvents = runtime.events.getHistory().filter((e) => e.type === 'K8S_SECRET_READ');
    expect(secretEvents.length).toBe(0);

    // Step 1ms further to T+800 boundary
    runtime.step(1);
    expect(runtime.clock.getVirtualTime()).toBe(800);

    secretEvents = runtime.events.getHistory().filter((e) => e.type === 'K8S_SECRET_READ');
    expect(secretEvents.length).toBe(1);
    expect(secretEvents[0].virtualTime).toBe(800);
  });

  it('SPEED TEST: Identical event ordering and IDs across 0.5x, 1x, and 2x speeds', () => {
    const runAtSpeed = (speed: number) => {
      const run = new SimulationRuntime();
      run.setSpeed(speed);
      loadKubernetesAttackScenario(run);
      run.step(1600);

      return run.events.getHistory().map((e) => ({
        id: e.id,
        type: e.type,
        virtualTime: e.virtualTime,
      }));
    };

    const seqHalf = runAtSpeed(0.5);
    const seqNormal = runAtSpeed(1.0);
    const seqDouble = runAtSpeed(2.0);

    expect(seqHalf).toEqual(seqNormal);
    expect(seqNormal).toEqual(seqDouble);
    expect(seqNormal.length).toBe(DETERMINISTIC_K8S_ATTACK_TIMELINE.length);
  });

  it('REPLAY TEST: Captured timeline prefix and full sequence replayed deterministically via replayTo', () => {
    loadKubernetesAttackScenario(runtime);
    runtime.step(1600);

    const canonicalFull = runtime.events.getHistory().map((e) => ({
      id: e.id,
      type: e.type,
      virtualTime: e.virtualTime,
    }));
    expect(canonicalFull.length).toBe(DETERMINISTIC_K8S_ATTACK_TIMELINE.length);

    // Replay to T+800
    runtime.replayTo(800);
    const eventsAt800 = runtime.events.getHistory().map((e) => ({
      id: e.id,
      type: e.type,
      virtualTime: e.virtualTime,
    }));

    const prefixAt800 = canonicalFull.filter((e) => e.virtualTime <= 800);
    expect(eventsAt800).toEqual(prefixAt800);
    expect(eventsAt800[eventsAt800.length - 1].type).toBe('K8S_SECRET_READ');

    // Replay to T+1600
    runtime.replayTo(1600);
    const replayedFull = runtime.events.getHistory().map((e) => ({
      id: e.id,
      type: e.type,
      virtualTime: e.virtualTime,
    }));
    expect(replayedFull).toEqual(canonicalFull);
  });

  it('SAME-RUNTIME RESET: Resetting and re-running yields identical event IDs and ordering on same runtime instance', () => {
    loadKubernetesAttackScenario(runtime);
    runtime.step(1600);

    const run1 = runtime.events.getHistory().map((e) => ({
      id: e.id,
      type: e.type,
      virtualTime: e.virtualTime,
    }));

    // Reset same runtime instance
    runtime.reset();
    expect(runtime.events.getHistory().length).toBe(0);
    expect(runtime.clock.getVirtualTime()).toBe(0);

    // Reload and rerun on SAME instance
    loadKubernetesAttackScenario(runtime);
    runtime.step(1600);

    const run2 = runtime.events.getHistory().map((e) => ({
      id: e.id,
      type: e.type,
      virtualTime: e.virtualTime,
    }));

    expect(run1).toEqual(run2);
  });
});
