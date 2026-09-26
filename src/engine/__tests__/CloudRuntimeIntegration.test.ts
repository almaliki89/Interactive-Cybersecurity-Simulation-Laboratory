/**
 * OMEGA V13 — Cloud Security World Runtime Integration Tests
 * CloudRuntimeIntegration.test.ts
 *
 * Validates deterministic integration between SimulationRuntime, CloudEventBridge,
 * and CloudAttackScenario:
 * - Deterministic event stream replay
 * - Speed adjustments (0.5x, 1x, 2x)
 * - Virtual time boundaries (early vs final incident time)
 * - Same-runtime reset determinism
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { CloudEventBridge } from '../../simulations/cloud/runtime/CloudEventBridge';
import { loadCloudAttackScenario } from '../../simulations/cloud/runtime/CloudAttackScenario';

describe('Cloud Runtime Integration & Deterministic Replay', () => {
  let runtime: SimulationRuntime;
  let bridge: CloudEventBridge;

  beforeEach(() => {
    runtime = new SimulationRuntime();
    bridge = new CloudEventBridge(runtime);
  });

  afterEach(() => {
    bridge.destroy();
    runtime.reset();
  });

  it('loads cloud attack scenario into runtime and triggers audit events', () => {
    loadCloudAttackScenario(runtime, { startVirtualTime: 0 });

    runtime.step(500); // Step to T=500

    const logs = bridge.getAuditLogs();
    const detections = bridge.getDetections();

    expect(logs.length).toBeGreaterThan(0);
    // At T=450, IMDSv1 credential theft occurs
    expect(logs.some((l) => l.eventName === 'GetSecurityCredentials')).toBe(true);
    expect(detections.some((d) => d.ruleId === 'CLOUD-DET-01')).toBe(true);
  });

  it('guarantees identical audit logs and detections across separate runtime instances', () => {
    // Run 1
    const runtime1 = new SimulationRuntime();
    const bridge1 = new CloudEventBridge(runtime1);
    loadCloudAttackScenario(runtime1, { startVirtualTime: 0 });
    runtime1.step(1500);
    const logs1 = bridge1.getAuditLogs();
    const det1 = bridge1.getDetections();

    // Run 2
    const runtime2 = new SimulationRuntime();
    const bridge2 = new CloudEventBridge(runtime2);
    loadCloudAttackScenario(runtime2, { startVirtualTime: 0 });
    runtime2.step(1500);
    const logs2 = bridge2.getAuditLogs();
    const det2 = bridge2.getDetections();

    expect(logs1.length).toBe(logs2.length);
    expect(logs1.map((l) => l.eventName)).toEqual(logs2.map((l) => l.eventName));
    expect(det1.map((d) => d.ruleId)).toEqual(det2.map((d) => d.ruleId));

    bridge1.destroy();
    bridge2.destroy();
  });

  it('maintains strict determinism across speed variations (0.5x, 1x, 2x)', () => {
    const speeds = [0.5, 1.0, 2.0];
    const results: string[][] = [];

    for (const speed of speeds) {
      const rt = new SimulationRuntime();
      const br = new CloudEventBridge(rt);
      rt.setSpeed(speed);
      loadCloudAttackScenario(rt, { startVirtualTime: 0 });

      // Step to virtual time T=1300
      rt.step(1300);
      results.push(br.getAuditLogs().map((l) => l.eventName));

      br.destroy();
    }

    expect(results[0]).toEqual(results[1]);
    expect(results[1]).toEqual(results[2]);
  });

  it('enforces replay virtual time boundaries (early T=200 has no exfil; final T=1800 has full breach)', () => {
    loadCloudAttackScenario(runtime, { startVirtualTime: 0 });

    // Early boundary at T=200
    runtime.step(200);
    const earlyLogs = bridge.getAuditLogs();
    const earlyEvents = runtime.getState().events;

    // At T=200, IMDS theft (T=450), exfiltration (T=1200), and StopLogging (T=1700) must NOT exist yet
    expect(earlyLogs.some((l) => l.eventName === 'GetObject')).toBe(false);
    expect(earlyLogs.some((l) => l.eventName === 'StopLogging')).toBe(false);
    expect(earlyEvents.some((e) => e.type === 'CLOUD_DATA_EXFILTRATION')).toBe(false);

    // Advance to final incident time T=1800
    runtime.step(1600); // 200 + 1600 = 1800
    const finalLogs = bridge.getAuditLogs();
    const finalEvents = runtime.getState().events;

    // Verify all attack events are now present
    expect(finalEvents.some((e) => e.type === 'CLOUD_IMDS_CREDENTIAL_THEFT')).toBe(true);
    expect(finalEvents.some((e) => e.type === 'CLOUD_DATA_EXFILTRATION')).toBe(true);
    expect(finalLogs.some((l) => l.eventName === 'GetObject')).toBe(true);
    expect(finalLogs.some((l) => l.eventName === 'StopLogging')).toBe(true);
  });

  it('preserves exact event and log determinism across same-runtime reset', () => {
    // Pass 1
    loadCloudAttackScenario(runtime, { startVirtualTime: 0 });
    runtime.step(1500);
    const pass1Logs = bridge.getAuditLogs().map((l) => l.id);
    const pass1Detections = bridge.getDetections().map((d) => d.id);

    // Reset same runtime
    runtime.reset();
    expect(bridge.getAuditLogs().length).toBe(0);
    expect(bridge.getDetections().length).toBe(0);

    // Pass 2 on the SAME runtime instance
    loadCloudAttackScenario(runtime, { startVirtualTime: 0 });
    runtime.step(1500);
    const pass2Logs = bridge.getAuditLogs().map((l) => l.id);
    const pass2Detections = bridge.getDetections().map((d) => d.id);

    expect(pass1Logs).toEqual(pass2Logs);
    expect(pass1Detections).toEqual(pass2Detections);
  });
});
