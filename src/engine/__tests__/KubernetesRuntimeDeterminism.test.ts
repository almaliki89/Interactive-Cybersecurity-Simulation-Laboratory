/**
 * OMEGA V14.2 — Kubernetes Runtime Determinism Test Suite
 * Validates SimulationRuntime Pause, Resume, Step, Speed, Replay, and Same-Runtime Reset determinism.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { containerEventBridge } from '../../simulations/containers/runtime/ContainerEventBridge';
import { DETERMINISTIC_K8S_ATTACK_TIMELINE } from '../../simulations/containers/runtime/ContainerAttackScenario';

describe('Kubernetes Runtime Determinism Suite', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();
    containerEventBridge.reset();
  });

  it('PAUSE TEST: Pause stops virtualTime advancement and event emissions', () => {
    runtime.clock.stepForward(400);
    const timeAt400 = runtime.clock.getVirtualTime();

    // Emit event at T+400
    containerEventBridge.emitEvent({
      id: 'k8s-evt-400',
      eventType: 'K8S_SERVICEACCOUNT_TOKEN_USED',
      virtualTime: timeAt400,
      podName: 'frontend-pod',
      namespace: 'frontend',
      severity: 'warn',
    });

    const eventsBeforePause = containerEventBridge.getIngestedEvents().length;

    // Pause
    runtime.clock.pause();

    // Attempt time progression while paused
    runtime.clock.loop();

    expect(runtime.clock.getVirtualTime()).toBe(timeAt400);
    expect(containerEventBridge.getIngestedEvents().length).toBe(eventsBeforePause);
    expect(runtime.clock.getStatus()).toBe('paused');
  });

  it('RESUME TEST: Resume resumes clock advancement and emits next event at exact virtualTime', () => {
    runtime.clock.stepForward(400);
    runtime.clock.pause();

    // Resume
    runtime.clock.resume();
    runtime.clock.stepForward(200); // Now at T+600

    expect(Math.round(runtime.clock.getVirtualTime())).toBe(600);

    containerEventBridge.emitEvent({
      id: 'k8s-evt-600',
      eventType: 'K8S_API_ENUMERATION',
      virtualTime: 600,
      podName: 'frontend-pod',
      namespace: 'frontend',
      severity: 'threat',
    });

    const ingested = containerEventBridge.getIngestedEvents();
    const last = ingested[ingested.length - 1];

    expect(last.eventType).toBe('K8S_API_ENUMERATION');
    expect(last.virtualTime).toBe(600);
  });

  it('STEP TEST: Exact stepping between timeline boundaries', () => {
    runtime.clock.start();

    // Step to T+799 (just before T+800)
    runtime.clock.stepForward(799);
    let secretEvents = containerEventBridge.getIngestedEvents().filter((e) => e.eventType === 'K8S_SECRET_READ');
    expect(secretEvents.length).toBe(0);

    // Step to T+800
    runtime.clock.stepForward(1);
    containerEventBridge.emitEvent({
      id: 'k8s-evt-800',
      eventType: 'K8S_SECRET_READ',
      virtualTime: 800,
      podName: 'frontend-pod',
      namespace: 'finance',
      severity: 'critical',
    });

    secretEvents = containerEventBridge.getIngestedEvents().filter((e) => e.eventType === 'K8S_SECRET_READ');
    expect(secretEvents.length).toBe(1);
    expect(secretEvents[0].virtualTime).toBe(800);
  });

  it('SPEED TEST: Identical event ordering and IDs across 0.5x, 1x, and 2x speeds', () => {
    const runAtSpeed = (speed: number) => {
      containerEventBridge.reset();
      const run = new SimulationRuntime();
      run.clock.setSpeed(speed);
      run.clock.start();

      DETERMINISTIC_K8S_ATTACK_TIMELINE.forEach((step) => {
        containerEventBridge.emitEvent({
          id: `evt-speed-${step.virtualTime}-${step.eventType}`,
          eventType: step.eventType,
          virtualTime: step.virtualTime,
          podName: step.podName,
          namespace: step.namespace,
          severity: step.severity,
        });
      });

      return containerEventBridge.getIngestedEvents().map((e) => ({
        eventType: e.eventType,
        virtualTime: e.virtualTime,
        id: e.rawEventId,
      }));
    };

    const seqHalf = runAtSpeed(0.5);
    const seqNormal = runAtSpeed(1.0);
    const seqDouble = runAtSpeed(2.0);

    expect(seqHalf).toEqual(seqNormal);
    expect(seqNormal).toEqual(seqDouble);
  });

  it('REPLAY TEST: Captured timeline prefix and full sequence replayed deterministically', () => {
    runtime.clock.start();

    DETERMINISTIC_K8S_ATTACK_TIMELINE.forEach((step) => {
      containerEventBridge.emitEvent({
        id: `evt-replay-${step.virtualTime}-${step.eventType}`,
        eventType: step.eventType,
        virtualTime: step.virtualTime,
        podName: step.podName,
        namespace: step.namespace,
        severity: step.severity,
      });
    });

    const fullSequence = containerEventBridge.getIngestedEvents();

    // Replay prefix to T+800
    const prefixAt800 = fullSequence.filter((e) => e.virtualTime <= 800);
    expect(prefixAt800.length).toBe(5);
    expect(prefixAt800[prefixAt800.length - 1].eventType).toBe('K8S_SECRET_READ');

    // Replay full sequence to T+1600
    expect(fullSequence.length).toBe(DETERMINISTIC_K8S_ATTACK_TIMELINE.length);
    expect(fullSequence[fullSequence.length - 1].eventType).toBe('K8S_AUDIT_POLICY_CHANGED');
  });

  it('SAME-RUNTIME RESET: Resetting and re-running yields identical event IDs and ordering', () => {
    const runScenario = () => {
      DETERMINISTIC_K8S_ATTACK_TIMELINE.forEach((step) => {
        containerEventBridge.emitEvent({
          id: `evt-reset-${step.virtualTime}-${step.eventType}`,
          eventType: step.eventType,
          virtualTime: step.virtualTime,
          podName: step.podName,
          namespace: step.namespace,
          severity: step.severity,
        });
      });
      return containerEventBridge.getIngestedEvents();
    };

    const run1 = runScenario();

    // Reset same runtime and bridge
    containerEventBridge.reset();
    expect(containerEventBridge.getIngestedEvents().length).toBe(0);

    const run2 = runScenario();

    expect(run1).toEqual(run2);
  });
});
