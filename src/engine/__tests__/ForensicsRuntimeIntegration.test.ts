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
