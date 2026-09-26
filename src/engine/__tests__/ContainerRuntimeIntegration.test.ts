/**
 * OMEGA V14 — Container Runtime & Telemetry Integration Tests
 * Validates event normalization and integration with SOC Event Bridge.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeContainerEvent } from '../../simulations/containers/runtime/normalizeContainerEvent';
import { containerEventBridge } from '../../simulations/containers/runtime/ContainerEventBridge';
import { globalSocEventBridge } from '../../simulations/soc/runtime/SocEventBridge';
import { CLUSTER_ATTACK_SCENARIO } from '../../simulations/containers/runtime/ContainerAttackScenario';

describe('OMEGA V14 — Container Runtime & Telemetry Integration', () => {
  beforeEach(() => {
    containerEventBridge.reset();
  });

  it('normalizes container security events with sourceWorld CONTAINERS', () => {
    const raw = {
      id: 'k8s-exec-001',
      eventType: 'POD_EXEC' as const,
      virtualTime: 450,
      podName: 'frontend-service-67b8-x1',
      namespace: 'production',
      containerId: 'container-9821af',
      process: 'bash',
      severity: 'threat' as const,
      outcome: 'DENIED' as const,
      attributes: {
        user: 'attacker-subverting-rce',
        syscall: 'execve',
      },
    };

    const normalized = normalizeContainerEvent(raw);
    expect(normalized.sourceWorld).toBe('CONTAINERS');
    expect(normalized.eventType).toBe('POD_EXEC');
    expect(normalized.virtualTime).toBe(450);
    expect(normalized.host).toBe('k8s-pod:production/frontend-service-67b8-x1');
    expect(normalized.user).toBe('attacker-subverting-rce');
    expect(normalized.severity).toBe('threat');
    expect(normalized.outcome).toBe('DENIED');
  });

  it('emits events through containerEventBridge to runtime and records telemetry', () => {
    containerEventBridge.emitEvent({
      id: 'k8s-quarantine-99',
      eventType: 'POD_QUARANTINED',
      virtualTime: 1200,
      podName: 'vulnerable-web-pod',
      namespace: 'production',
      severity: 'warn',
      outcome: 'SUCCESS',
      attributes: {
        reason: 'Automated Falco Rule Quarantine',
      },
    });

    const ingested = containerEventBridge.getIngestedEvents();
    expect(ingested.length).toBeGreaterThan(0);
    const last = ingested[ingested.length - 1];
    expect(last.sourceWorld).toBe('CONTAINERS');
    expect(last.eventType).toBe('POD_QUARANTINED');
  });

  it('verifies all 4 cluster attack stages in the scenario have valid definitions', () => {
    expect(CLUSTER_ATTACK_SCENARIO.length).toBe(4);
    for (const stage of CLUSTER_ATTACK_SCENARIO) {
      expect(stage.stageId).toBeGreaterThan(0);
      expect(stage.technique).toBeDefined();
      expect(stage.attackerCommand).toBeDefined();
      expect(stage.mitigationRequiredAr).toBeDefined();
      expect(stage.mitigationRequiredEn).toBeDefined();
    }
  });
});
