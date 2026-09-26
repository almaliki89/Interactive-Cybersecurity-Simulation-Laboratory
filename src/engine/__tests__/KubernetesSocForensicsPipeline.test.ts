/**
 * OMEGA V14.2 — Explicit Kubernetes -> SOC -> Forensics Pipeline Test Suite
 * Validates direct telemetry ingestion into SOC SIEM and automatic forensic evidence generation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { globalSimulationRuntime } from '../runtime/SimulationRuntime';
import { containerEventBridge } from '../../simulations/containers/runtime/ContainerEventBridge';
import { globalSocEventBridge } from '../../simulations/soc/runtime/SocEventBridge';
import { globalForensicsEventBridge } from '../../simulations/forensics/runtime/ForensicsEventBridge';

describe('Explicit Kubernetes -> SOC -> Forensics Pipeline Suite', () => {
  beforeEach(() => {
    containerEventBridge.reset();
    globalForensicsEventBridge.reset();
  });

  it('Pipeline Step 1: K8S_RBAC_DENIED event ingests directly into SocEventBridge', () => {
    const raw = {
      id: 'k8s-rbac-denied-101',
      eventType: 'K8S_RBAC_DENIED',
      virtualTime: 300,
      podName: 'frontend-service-67b8-x1',
      namespace: 'finance',
      serviceAccount: 'frontend-sa',
      sourceIp: '10.244.1.12',
      resource: 'secrets',
      severity: 'threat' as const,
      attributes: {
        verb: 'get',
        resource: 'secrets',
      },
    };

    const normalized = containerEventBridge.emitEvent(raw);

    // Verify Container Bridge output
    expect(normalized.sourceWorld).toBe('KUBERNETES');
    expect(normalized.eventType).toBe('K8S_RBAC_DENIED');
    expect(normalized.virtualTime).toBe(300);
    expect(normalized.attributes.namespace).toBe('finance');
    expect(normalized.attributes.serviceAccount).toBe('frontend-sa');
    expect(normalized.sourceIp).toBe('10.244.1.12');
    expect(normalized.rawEventId).toBe('k8s-rbac-denied-101');

    // Verify SOC SIEM ingestion
    const socTelemetry = globalSocEventBridge.getTelemetry();
    const socMatch = socTelemetry.find((t) => t.rawEventId === 'k8s-rbac-denied-101');

    expect(socMatch).toBeDefined();
    expect(socMatch?.sourceWorld).toBe('KUBERNETES');
    expect(socMatch?.eventType).toBe('K8S_RBAC_DENIED');
    expect(socMatch?.virtualTime).toBe(300);
    expect(socMatch?.attributes.namespace).toBe('finance');
    expect(socMatch?.attributes.serviceAccount).toBe('frontend-sa');
    expect(socMatch?.sourceIp).toBe('10.244.1.12');
  });

  it('Pipeline Step 2: K8S_SECRET_READ flows Runtime -> K8s -> SOC -> Forensics Evidence', () => {
    const raw = {
      id: 'k8s-secret-read-505',
      eventType: 'K8S_SECRET_READ',
      virtualTime: 800,
      podName: 'frontend-service-67b8-x1',
      namespace: 'finance',
      serviceAccount: 'frontend-sa',
      sourceIp: '10.244.1.12',
      resource: 'secret/finance-db-credentials',
      severity: 'critical' as const,
      attributes: {
        namespace: 'finance',
        pod: 'frontend-service-67b8-x1',
        serviceAccount: 'frontend-sa',
        sourceIp: '10.244.1.12',
        keysRead: ['db-password'],
      },
    };

    containerEventBridge.emitEvent(raw);

    // Verify Forensics evidence generation
    const acquiredEvidence = globalForensicsEventBridge.getAcquiredEvidence();
    const evidenceMatch = acquiredEvidence.find((e) => e.metadata.eventType === 'K8S_SECRET_READ');

    expect(evidenceMatch).toBeDefined();
    expect(evidenceMatch?.metadata.sourceWorld).toBe('KUBERNETES');
    expect(evidenceMatch?.metadata.eventType).toBe('K8S_SECRET_READ');
    expect(evidenceMatch?.acquiredAtVirtualTime).toBe(800);
    expect(evidenceMatch?.metadata.namespace).toBe('finance');
    expect(evidenceMatch?.metadata.pod).toBe('frontend-service-67b8-x1');
    expect(evidenceMatch?.metadata.serviceAccount).toBe('frontend-sa');
    expect(evidenceMatch?.metadata.sourceIp).toBe('10.244.1.12');
    expect(evidenceMatch?.metadata.rawEventId).toBe('k8s-secret-read-505');

    // Verify Evidence Integrity
    expect(evidenceMatch?.integrityStatus).toBe('VERIFIED');
    expect(evidenceMatch?.originalHash).toBe(evidenceMatch?.currentHash);
  });

  it('Pipeline Reset: Container Bridge and Forensics evidence reset completely without stale state', () => {
    containerEventBridge.emitEvent({
      id: 'stale-k8s-evt',
      eventType: 'K8S_SECRET_READ',
      virtualTime: 100,
      podName: 'pod-stale',
      namespace: 'finance',
      severity: 'critical',
    });

    expect(containerEventBridge.getIngestedEvents().length).toBeGreaterThan(0);
    expect(globalForensicsEventBridge.getAcquiredEvidence().length).toBeGreaterThan(0);

    // Reset bridges
    containerEventBridge.reset();
    globalForensicsEventBridge.reset();

    expect(containerEventBridge.getIngestedEvents().length).toBe(0);
    expect(globalForensicsEventBridge.getAcquiredEvidence().length).toBe(0);
  });
});
