/**
 * OMEGA V14.1 — Kubernetes SOC & Forensics Integration Test Suite
 * Validates telemetry normalization with sourceWorld: KUBERNETES, Forensics evidence creation, and deterministic attack timeline.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeContainerEvent } from '../../simulations/containers/runtime/normalizeContainerEvent';
import { containerEventBridge } from '../../simulations/containers/runtime/ContainerEventBridge';
import { globalForensicsEventBridge } from '../../simulations/forensics/runtime/ForensicsEventBridge';
import { runKubernetesAttackScenario, DETERMINISTIC_K8S_ATTACK_TIMELINE } from '../../simulations/containers/runtime/ContainerAttackScenario';

describe('Kubernetes SOC & Forensics Integration Suite', () => {
  beforeEach(() => {
    containerEventBridge.reset();
    globalForensicsEventBridge.reset();
  });

  it('Normalizes K8s control plane and workload events with sourceWorld: KUBERNETES', () => {
    const raw = {
      id: 'k8s-sec-read-001',
      eventType: 'K8S_SECRET_READ',
      virtualTime: 800,
      podName: 'frontend-service-67b8-x1',
      namespace: 'finance',
      serviceAccount: 'frontend-sa',
      sourceIp: '10.244.1.12',
      resource: 'secret/finance-db-credentials',
      severity: 'critical' as const,
      attributes: {
        keysRead: ['db-password'],
      },
    };

    const normalized = normalizeContainerEvent(raw);
    expect(normalized.sourceWorld).toBe('KUBERNETES');
    expect(normalized.eventType).toBe('K8S_SECRET_READ');
    expect(normalized.virtualTime).toBe(800);
    expect(normalized.attributes.namespace).toBe('finance');
    expect(normalized.attributes.pod).toBe('frontend-service-67b8-x1');
    expect(normalized.attributes.serviceAccount).toBe('frontend-sa');
    expect(normalized.sourceIp).toBe('10.244.1.12');
    expect(normalized.rawEventId).toBe('k8s-sec-read-001');
  });

  it('Flows K8S_SECRET_READ from ContainerEventBridge into Forensics evidence deterministically', () => {
    containerEventBridge.emitEvent({
      id: 'k8s-sec-read-999',
      eventType: 'K8S_SECRET_READ',
      virtualTime: 800,
      podName: 'frontend-service-67b8-x1',
      namespace: 'finance',
      serviceAccount: 'frontend-sa',
      sourceIp: '10.244.1.12',
      resource: 'secret/finance-db-credentials',
      severity: 'critical',
      outcome: 'ANOMALY',
      attributes: {
        namespace: 'finance',
        pod: 'frontend-service-67b8-x1',
        serviceAccount: 'frontend-sa',
      },
    });

    const acquired = globalForensicsEventBridge.getAcquiredEvidence();
    const k8sEvidence = acquired.find((e) => e.metadata.eventType === 'K8S_SECRET_READ');

    expect(k8sEvidence).toBeDefined();
    expect(k8sEvidence?.metadata.sourceWorld).toBe('KUBERNETES');
    expect(k8sEvidence?.acquiredAtVirtualTime).toBe(800);
    expect(k8sEvidence?.metadata.namespace).toBe('finance');
    expect(k8sEvidence?.metadata.pod).toBe('frontend-service-67b8-x1');
    expect(k8sEvidence?.metadata.serviceAccount).toBe('frontend-sa');
    expect(k8sEvidence?.metadata.sourceIp).toBe('10.244.1.12');
    expect(k8sEvidence?.metadata.rawEventId).toBe('k8s-sec-read-999');
    expect(k8sEvidence?.integrityStatus).toBe('VERIFIED');
    expect(k8sEvidence?.originalHash).toBe(k8sEvidence?.currentHash);
  });

  it('Executes full deterministic Kubernetes attack scenario with virtualTime steps T+100 to T+1600', () => {
    runKubernetesAttackScenario();

    const ingested = containerEventBridge.getIngestedEvents();
    expect(ingested.length).toEqual(DETERMINISTIC_K8S_ATTACK_TIMELINE.length);

    expect(ingested[0].eventType).toBe('K8S_UNSIGNED_IMAGE_DEPLOYED');
    expect(ingested[0].virtualTime).toBe(100);

    const secretReadEvt = ingested.find((e) => e.eventType === 'K8S_SECRET_READ');
    expect(secretReadEvt?.virtualTime).toBe(800);

    const auditEvt = ingested.find((e) => e.eventType === 'K8S_AUDIT_POLICY_CHANGED');
    expect(auditEvt?.virtualTime).toBe(1600);
  });

  it('Resetting ContainerEventBridge and ForensicsEventBridge clears state', () => {
    runKubernetesAttackScenario();
    expect(containerEventBridge.getIngestedEvents().length).toBeGreaterThan(0);

    containerEventBridge.reset();
    globalForensicsEventBridge.reset();

    expect(containerEventBridge.getIngestedEvents().length).toBe(0);
    expect(globalForensicsEventBridge.getAcquiredEvidence().length).toBe(0);
  });
});
