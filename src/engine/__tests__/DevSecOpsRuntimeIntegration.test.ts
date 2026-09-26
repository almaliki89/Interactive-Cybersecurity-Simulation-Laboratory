/**
 * OMEGA V15 — DevSecOps Runtime & Telemetry Integration Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeDevSecOpsEvent } from '../../simulations/devsecops/runtime/normalizeDevSecOpsEvent';
import { devSecOpsEventBridge } from '../../simulations/devsecops/runtime/DevSecOpsEventBridge';
import { SUPPLY_CHAIN_ATTACK_SCENARIO, loadDevSecOpsAttackScenario, CANONICAL_DEVSECOPS_TIMELINE } from '../../simulations/devsecops/runtime/DevSecOpsAttackScenario';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { ForensicsEventBridge } from '../../simulations/forensics/runtime/ForensicsEventBridge';

describe('OMEGA V15 — DevSecOps Runtime & Telemetry Integration', () => {
  beforeEach(() => {
    devSecOpsEventBridge.reset();
  });

  it('normalizes DevSecOps security events with sourceWorld DEVSECOPS', () => {
    const raw = {
      id: 'dso-sast-001',
      eventType: 'SAST_FINDING' as const,
      virtualTime: 500,
      filePath: 'src/api/users.ts',
      ruleId: 'JS-SQL-INJECTION',
      repository: 'github.com/nexora/enterprise-platform',
      severity: 'threat' as const,
      outcome: 'DENIED' as const,
      attributes: {
        committer: 'dev-user-01',
      },
    };

    const normalized = normalizeDevSecOpsEvent(raw);
    expect(normalized.sourceWorld).toBe('DEVSECOPS');
    expect(normalized.eventType).toBe('SAST_FINDING');
    expect(normalized.virtualTime).toBe(500);
    expect(normalized.host).toBe('github.com/nexora/enterprise-platform');
    expect(normalized.user).toBe('dev-user-01');
    expect(normalized.outcome).toBe('DENIED');
  });

  it('emits events through devSecOpsEventBridge and records telemetry', () => {
    devSecOpsEventBridge.emitEvent({
      id: 'dso-gate-001',
      eventType: 'PIPELINE_GATE_TRIGGERED',
      virtualTime: 800,
      repository: 'github.com/nexora/enterprise-platform',
      severity: 'warn',
      outcome: 'SUCCESS',
      attributes: {
        status: 'PASSED',
      },
    });

    const ingested = devSecOpsEventBridge.getIngestedEvents();
    expect(ingested.length).toBeGreaterThan(0);
    const last = ingested[ingested.length - 1];
    expect(last.sourceWorld).toBe('DEVSECOPS');
    expect(last.eventType).toBe('PIPELINE_GATE_TRIGGERED');
  });

  it('verifies all 3 supply chain attack stages have valid definitions', () => {
    expect(SUPPLY_CHAIN_ATTACK_SCENARIO.length).toBe(3);
    for (const stage of SUPPLY_CHAIN_ATTACK_SCENARIO) {
      expect(stage.stageId).toBeGreaterThan(0);
      expect(stage.technique).toBeDefined();
      expect(stage.attackerAction).toBeDefined();
      expect(stage.mitigationRequiredAr).toBeDefined();
      expect(stage.mitigationRequiredEn).toBeDefined();
    }
  });

  describe('SOC & Forensics Integration for DevSecOps Events', () => {
    it('integrates DevSecOps events into Forensics Event Bridge to produce valid supply chain evidence', () => {
      const runtime = new SimulationRuntime();
      const forensicBridge = new ForensicsEventBridge(runtime);
      
      // Schedule DevSecOps event and step to trigger it and notify listeners
      runtime.schedule({
        at: 650,
        type: 'DEVSECOPS_PIPELINE_BLOCKED',
        source: 'github.com/nexora/enterprise-platform',
        target: 'pipeline',
        category: 'DEVSECOPS' as any,
        severity: 'threat',
        description: 'DevSecOps Quality Gate violation',
        payload: {
          repository: 'github.com/nexora/enterprise-platform',
          commitSha: '7f9a28b61a3d90fcb3b811883b276709',
          artifact: 'nexora-enterprise-service',
          artifactDigest: 'sha256:d57e1234567890abcdef',
          actor: 'ci-cd-runner',
          outcome: 'DENIED'
        }
      });

      runtime.step(700);

      const evidence = forensicBridge.getAcquiredEvidence();
      expect(evidence.length).toBeGreaterThan(0);
      const dsoEvidence = evidence.find(e => e.id === 'EVD-DEVSECOPS_PIPELINE_BLOCKED');
      expect(dsoEvidence).toBeDefined();
      expect(dsoEvidence?.sourceHost).toBe('github.com/nexora/enterprise-platform');
      expect(dsoEvidence?.sourceUser).toBe('ci-cd-runner');
      expect(dsoEvidence?.metadata.commitSha).toBe('7f9a28b61a3d90fcb3b811883b276709');
      expect(dsoEvidence?.metadata.artifactDigest).toBe('sha256:d57e1234567890abcdef');
      
      forensicBridge.destroy();
    });
  });

  describe('Runtime Determinism Closure for DevSecOps Timeline', () => {
    it('PAUSE TEST: Pause stops virtualTime advancement and event emissions', () => {
      const runtime = new SimulationRuntime();
      loadDevSecOpsAttackScenario(runtime);

      runtime.step(400);
      const timeAt400 = runtime.clock.getVirtualTime();
      expect(timeAt400).toBe(400);

      const eventsAt400 = runtime.events.getHistory().length;
      expect(eventsAt400).toBeGreaterThan(0);

      runtime.pause();
      expect(runtime.clock.getStatus()).toBe('paused');

      const timeAfterPause = runtime.clock.getVirtualTime();
      expect(timeAfterPause).toBe(400);
      expect(runtime.events.getHistory().length).toBe(eventsAt400);
    });

    it('RESUME TEST: Resume resumes clock advancement and emits next event', () => {
      const runtime = new SimulationRuntime();
      loadDevSecOpsAttackScenario(runtime);

      runtime.step(400);
      runtime.pause();
      expect(runtime.clock.getStatus()).toBe('paused');

      runtime.resume();
      expect(runtime.clock.getStatus()).toBe('running');

      runtime.step(200);
      expect(runtime.clock.getVirtualTime()).toBe(600);

      const history = runtime.events.getHistory();
      const event600 = history.find((e) => e.virtualTime === 600);
      expect(event600).toBeDefined();
      expect(event600?.type).toBe('DEVSECOPS_IAC_MISCONFIGURATION');
    });

    it('STEP TEST: Exact stepping between timeline boundaries', () => {
      const runtime = new SimulationRuntime();
      loadDevSecOpsAttackScenario(runtime);

      // Just before T=100
      runtime.step(99);
      let secretEvents = runtime.events.getHistory().filter((e) => e.type === 'DEVSECOPS_SECRET_DETECTED');
      expect(secretEvents.length).toBe(0);

      // Exactly at T=100
      runtime.step(1);
      expect(runtime.clock.getVirtualTime()).toBe(100);

      secretEvents = runtime.events.getHistory().filter((e) => e.type === 'DEVSECOPS_SECRET_DETECTED');
      expect(secretEvents.length).toBe(1);
      expect(secretEvents[0].virtualTime).toBe(100);
    });

    it('SPEED TEST: Identical event ordering and IDs across speeds (0.5x, 1x, 2x)', () => {
      const runAtSpeed = (speed: number) => {
        const run = new SimulationRuntime();
        run.setSpeed(speed);
        loadDevSecOpsAttackScenario(run);
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
      expect(seqNormal.length).toBe(CANONICAL_DEVSECOPS_TIMELINE.length);
    });

    it('REPLAY TEST: Captured prefix and full sequence replayed deterministically via replayTo', () => {
      const runtime = new SimulationRuntime();
      loadDevSecOpsAttackScenario(runtime);
      runtime.step(1600);

      const canonicalFull = runtime.events.getHistory().map((e) => ({
        id: e.id,
        type: e.type,
        virtualTime: e.virtualTime,
      }));
      expect(canonicalFull.length).toBe(CANONICAL_DEVSECOPS_TIMELINE.length);

      // Replay to T+400
      runtime.replayTo(400);
      const eventsAt400 = runtime.events.getHistory().map((e) => ({
        id: e.id,
        type: e.type,
        virtualTime: e.virtualTime,
      }));

      const prefixAt400 = canonicalFull.filter((e) => e.virtualTime <= 400);
      expect(eventsAt400).toEqual(prefixAt400);

      // Replay back to T+1600
      runtime.replayTo(1600);
      const replayedFull = runtime.events.getHistory().map((e) => ({
        id: e.id,
        type: e.type,
        virtualTime: e.virtualTime,
      }));
      expect(replayedFull).toEqual(canonicalFull);
    });

    it('SAME-RUNTIME RESET: Resetting and re-running yields identical events', () => {
      const runtime = new SimulationRuntime();
      loadDevSecOpsAttackScenario(runtime);
      runtime.step(1600);

      const run1 = runtime.events.getHistory().map((e) => ({
        id: e.id,
        type: e.type,
        virtualTime: e.virtualTime,
      }));

      runtime.reset();
      expect(runtime.events.getHistory().length).toBe(0);
      expect(runtime.clock.getVirtualTime()).toBe(0);

      loadDevSecOpsAttackScenario(runtime);
      runtime.step(1600);

      const run2 = runtime.events.getHistory().map((e) => ({
        id: e.id,
        type: e.type,
        virtualTime: e.virtualTime,
      }));

      expect(run1).toEqual(run2);
    });
  });
});
