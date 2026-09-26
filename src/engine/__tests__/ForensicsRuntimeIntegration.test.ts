import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { ForensicsEventBridge } from '../../simulations/forensics/runtime/ForensicsEventBridge';
import { loadIncidentForensicsScenario } from '../../simulations/forensics/runtime/IncidentForensicsScenario';

describe('Forensics Runtime Integration & Replay Determinism', () => {
  let runtime: SimulationRuntime;
  let bridge: ForensicsEventBridge;

  beforeEach(() => {
    runtime = new SimulationRuntime();
    bridge = new ForensicsEventBridge(runtime);
  });

  afterEach(() => {
    bridge.destroy();
    runtime.reset();
  });

  it('loads incident forensics scenario and creates default case', () => {
    const forensicsCase = loadIncidentForensicsScenario(runtime, 0);
    expect(forensicsCase).toBeDefined();
    expect(forensicsCase.id).toBe('CASE-NEXORA-FIN-001');
    expect(forensicsCase.affectedHosts).toContain('FIN-WS-01');
  });

  it('streams runtime events into evidence bridge deterministically', () => {
    loadIncidentForensicsScenario(runtime, 0);

    runtime.step(500); // virtualTime = 500

    const evidence = bridge.getAcquiredEvidence();
    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence.some((e) => e.id === 'EVD-LOG-WIN-SEC')).toBe(true);
  });

  it('guarantees identical evidence IDs and hashes across identical runs', () => {
    // Run 1
    const runtime1 = new SimulationRuntime();
    const bridge1 = new ForensicsEventBridge(runtime1);
    loadIncidentForensicsScenario(runtime1, 0);
    runtime1.step(1200);
    const ev1 = bridge1.getAcquiredEvidence();

    // Run 2
    const runtime2 = new SimulationRuntime();
    const bridge2 = new ForensicsEventBridge(runtime2);
    loadIncidentForensicsScenario(runtime2, 0);
    runtime2.step(1200);
    const ev2 = bridge2.getAcquiredEvidence();

    expect(ev1.length).toBe(ev2.length);
    expect(ev1.map((e) => e.id)).toEqual(ev2.map((e) => e.id));
    expect(ev1.map((e) => e.originalHash)).toEqual(ev2.map((e) => e.originalHash));

    bridge1.destroy();
    bridge2.destroy();
  });

  it('respects replay virtual time boundaries (no future evidence available at T+700)', () => {
    loadIncidentForensicsScenario(runtime, 0);

    runtime.step(700); // virtualTime = 700

    const evidence = bridge.getAcquiredEvidence();
    // At T+700, sensitive resource access (T+1150) or BOLA (T+1350) or Log tamper (T+1550) should NOT exist yet
    expect(evidence.some((e) => e.id === 'EVD-BROWSER-HIST')).toBe(false);
  });

  it('enforces strict replay boundaries: future artifacts unavailable early and all present at conclusion', () => {
    loadIncidentForensicsScenario(runtime, 0);

    // At T=500: early stage only
    runtime.step(500);
    const earlyEvidence = bridge.getAcquiredEvidence();
    const earlyEvents = runtime.getState().events;

    // Verify future evidence is unavailable
    expect(earlyEvidence.some((e) => e.id === 'EVD-DISK-FIN-WS01')).toBe(false);
    expect(earlyEvidence.some((e) => e.id === 'EVD-BROWSER-HIST')).toBe(false);
    expect(earlyEvents.some((e) => e.type === 'WIN_LOG_CLEARED')).toBe(false);

    // Advance to final incident time T=1600
    runtime.step(1100); // 500 + 1100 = 1600
    const finalEvidence = bridge.getAcquiredEvidence();
    const finalEvents = runtime.getState().events;

    // Verify all required evidence is available
    const requiredEvidenceIds = [
      'EVD-LOG-WIN-SEC',
      'EVD-MEM-FIN-WS01',
      'EVD-LOG-LINUX-AUTH',
      'EVD-NET-PCAP-01',
      'EVD-DISK-FIN-WS01',
      'EVD-BROWSER-HIST',
    ];
    requiredEvidenceIds.forEach((id) => {
      expect(finalEvidence.some((e) => e.id === id)).toBe(true);
    });

    // Future log tamper artifact has occurred
    expect(finalEvents.some((e) => e.type === 'WIN_LOG_CLEARED')).toBe(true);
  });

  it('preserves determinism across playback speeds (0.5x, 1x, 2x)', () => {
    const speeds = [0.5, 1.0, 2.0];
    const results = speeds.map((speed) => {
      const rt = new SimulationRuntime();
      const br = new ForensicsEventBridge(rt);
      rt.setSpeed(speed);
      loadIncidentForensicsScenario(rt, 0);
      rt.step(1600);
      const ev = br.getAcquiredEvidence();
      const events = rt.getState().events;
      br.destroy();
      return {
        evidenceIds: ev.map((e) => e.id),
        evidenceHashes: ev.map((e) => e.originalHash),
        eventTypes: events.map((e) => e.type),
        eventVirtualTimes: events.map((e) => e.virtualTime),
      };
    });

    // Evidence order remains identical across speeds
    expect(results[0].evidenceIds).toEqual(results[1].evidenceIds);
    expect(results[1].evidenceIds).toEqual(results[2].evidenceIds);

    // IDs and synthetic hashes remain deterministic across speeds
    expect(results[0].evidenceHashes).toEqual(results[1].evidenceHashes);
    expect(results[1].evidenceHashes).toEqual(results[2].evidenceHashes);

    // Virtual event ordering remains identical across speeds
    expect(results[0].eventTypes).toEqual(results[1].eventTypes);
    expect(results[1].eventTypes).toEqual(results[2].eventTypes);
    expect(results[0].eventVirtualTimes).toEqual(results[1].eventVirtualTimes);
    expect(results[1].eventVirtualTimes).toEqual(results[2].eventVirtualTimes);
  });

  it('guarantees identical evidence IDs, event order, and hashes across reset-and-rerun on SAME runtime instance', () => {
    // Run 1 on runtime instance
    loadIncidentForensicsScenario(runtime, 0);
    runtime.step(1600);
    const ev1 = bridge.getAcquiredEvidence();
    const events1 = runtime.getState().events;

    const ids1 = ev1.map((e) => e.id);
    const hashes1 = ev1.map((e) => e.originalHash);
    const eventTypes1 = events1.map((e) => e.type);

    // Reset the SAME runtime instance
    runtime.reset();
    expect(runtime.getState().virtualTime).toBe(0);
    expect(runtime.getState().events).toHaveLength(0);
    expect(bridge.getAcquiredEvidence()).toHaveLength(0);

    // Run 2 on the SAME runtime instance
    loadIncidentForensicsScenario(runtime, 0);
    runtime.step(1600);
    const ev2 = bridge.getAcquiredEvidence();
    const events2 = runtime.getState().events;

    const ids2 = ev2.map((e) => e.id);
    const hashes2 = ev2.map((e) => e.originalHash);
    const eventTypes2 = events2.map((e) => e.type);

    expect(ids1).toEqual(ids2);
    expect(hashes1).toEqual(hashes2);
    expect(eventTypes1).toEqual(eventTypes2);
  });

  it('supports runtime pause, resume, step, and deterministic reset', () => {
    loadIncidentForensicsScenario(runtime, 0);

    runtime.pause();
    expect(runtime.getState().clockStatus).toBe('paused');

    runtime.step(100);
    expect(runtime.getState().virtualTime).toBe(100);

    runtime.reset();
    expect(runtime.getState().virtualTime).toBe(0);
    expect(runtime.getState().events.length).toBe(0);
  });
});
