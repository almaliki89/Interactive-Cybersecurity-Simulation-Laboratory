import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { ThreatHuntQueryEngine } from '../logic/queryEngine';

describe('OMEGA V16.1 — Threat Hunting SimulationRuntime Integration Suite', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();
    useThreatHuntingStore.getState().setActiveHunt('HUNT-01');
    useThreatHuntingStore.getState().resetFilters();
  });

  it('connects to SimulationRuntime and ingests normalized runtime events in real time', () => {
    const disconnect = useThreatHuntingStore.getState().connectRuntime(runtime);

    const initialCount = useThreatHuntingStore.getState().telemetryEvents.length;

    // Dispatch a raw Windows logon failure event through SimulationRuntime
    runtime.dispatch({
      type: 'WIN_4625',
      category: 'WINDOWS',
      source: 'FIN-WS-99',
      target: 'DC-01',
      severity: 'warn',
      description: 'Anomalous logon attempt',
      payload: {
        eventId: '4625',
        user: 'attacker_test',
        host: 'FIN-WS-99',
        sourceIp: '198.51.100.123',
        failureReason: 'BadPassword',
      },
    });

    const newCount = useThreatHuntingStore.getState().telemetryEvents.length;
    expect(newCount).toBeGreaterThan(initialCount);

    const ingestedEvt = useThreatHuntingStore
      .getState()
      .telemetryEvents.find((e) => e.user === 'attacker_test');

    expect(ingestedEvt).toBeDefined();
    expect(ingestedEvt?.sourceWorld).toBe('WINDOWS');
    expect(ingestedEvt?.outcome).toBe('FAILURE');

    disconnect();
  });

  it('executes NOT operator queries on ingested normalized telemetry', () => {
    // Sync runtime events
    useThreatHuntingStore.getState().syncWithSimulationRuntime(runtime);

    const events = useThreatHuntingStore.getState().telemetryEvents;

    // Query 1: Prefix NOT
    const notWinResult = ThreatHuntQueryEngine.execute('NOT sourceWorld = WINDOWS', events);
    expect(notWinResult.error).toBeUndefined();
    expect(notWinResult.events.every((e) => e.sourceWorld !== 'WINDOWS')).toBe(true);

    // Query 2: Prefix NOT with parentheses
    const notGroupResult = ThreatHuntQueryEngine.execute(
      'NOT (severity = threat OR severity = critical)',
      events
    );
    expect(notGroupResult.error).toBeUndefined();
    expect(
      notGroupResult.events.every((e) => e.severity !== 'threat' && e.severity !== 'critical')
    ).toBe(true);

    // Query 3: Infix NOT CONTAINS
    const notContainsResult = ThreatHuntQueryEngine.execute('user NOT CONTAINS "admin"', events);
    expect(notContainsResult.error).toBeUndefined();
    expect(
      notContainsResult.events.every(
        (e) => !e.user || !e.user.toLowerCase().includes('admin')
      )
    ).toBe(true);

    // Query 4: Infix NOT IN
    const notInResult = ThreatHuntQueryEngine.execute(
      'sourceWorld NOT IN (WINDOWS, IDENTITY)',
      events
    );
    expect(notInResult.error).toBeUndefined();
    expect(
      notInResult.events.every(
        (e) => e.sourceWorld !== 'WINDOWS' && e.sourceWorld !== 'IDENTITY'
      )
    ).toBe(true);
  });

  it('verifies multi-world runtime telemetry normalization pipeline', () => {
    useThreatHuntingStore.getState().connectRuntime(runtime);

    // Dispatch Cloud event
    runtime.dispatch({
      type: 'CLOUD_STS_ASSUME_ROLE',
      category: 'CLOUD',
      source: 'AWS-GLOBAL',
      target: 'arn:aws:iam::123:role/Admin',
      severity: 'threat',
      payload: {
        user: 'cloud_intruder',
        sourceIp: '203.0.113.88',
      },
    });

    // Dispatch DevSecOps event
    runtime.dispatch({
      type: 'DEVSECOPS_COMMIT_UNVERIFIED',
      category: 'DEVSECOPS',
      source: 'repo/payment-service',
      severity: 'warn',
      payload: {
        repository: 'payment-service',
        commitId: 'e4f2a1',
        gpgSigned: false,
      },
    });

    const telemetry = useThreatHuntingStore.getState().telemetryEvents;
    const cloudEvt = telemetry.find((e) => e.user === 'cloud_intruder');
    const devsecEvt = telemetry.find((e) => e.eventType === 'DEVSECOPS_COMMIT_UNVERIFIED');

    expect(cloudEvt).toBeDefined();
    expect(cloudEvt?.sourceWorld).toBe('CLOUD');

    expect(devsecEvt).toBeDefined();
    expect(devsecEvt?.sourceWorld).toBe('DEVSECOPS');
  });
});
