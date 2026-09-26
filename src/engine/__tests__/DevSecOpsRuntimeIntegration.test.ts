/**
 * OMEGA V15 — DevSecOps Runtime & Telemetry Integration Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeDevSecOpsEvent } from '../../simulations/devsecops/runtime/normalizeDevSecOpsEvent';
import { devSecOpsEventBridge } from '../../simulations/devsecops/runtime/DevSecOpsEventBridge';
import { SUPPLY_CHAIN_ATTACK_SCENARIO } from '../../simulations/devsecops/runtime/DevSecOpsAttackScenario';

describe('OMEGA V15 — DevSecOps Runtime & Telemetry Integration', () => {
  beforeEach(() => {
    devSecOpsEventBridge.reset();
  });

  it('normalizes DevSecOps security events with sourceWorld APPSEC', () => {
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
    expect(normalized.sourceWorld).toBe('APPSEC');
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
    expect(last.sourceWorld).toBe('APPSEC');
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
});
