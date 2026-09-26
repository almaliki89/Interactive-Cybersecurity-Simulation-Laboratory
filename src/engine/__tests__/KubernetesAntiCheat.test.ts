/**
 * OMEGA V14.2 — Independent Kubernetes Anti-Cheat Test Suite
 * Tests all 11 explicit and derived anti-cheat defects against a valid hardened baseline.
 */

import { describe, it, expect } from 'vitest';
import { createHardenedKubernetesMasterState, validateKubernetesMasterChallenge } from '../../simulations/containers/logic/masterState';

describe('Kubernetes Anti-Cheat Validation Suite', () => {
  it('Verifies valid hardened baseline passes challenge completely', () => {
    const valid = createHardenedKubernetesMasterState();
    const res = validateKubernetesMasterChallenge(valid);

    expect(res.isPassed).toBe(true);
    expect(res.failedChecks.length).toBe(0);
    expect(res.antiCheatViolations.length).toBe(0);
  });

  it('Rejects deleteProductionWorkloads defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, deleteProductionWorkloads: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Security remediation cannot delete required production workloads.');
  });

  it('Rejects scaleAllDeploymentsToZero defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, scaleAllDeploymentsToZero: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Hardening cannot make the production application unavailable.');
  });

  it('Rejects blockAllIngress defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, blockAllIngress: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Public customer entry point must remain reachable.');
  });

  it('Rejects blockAllEgress defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, blockAllEgress: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Required backend and service dependencies must remain reachable.');
  });

  it('Rejects deleteAllSecrets defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, deleteAllSecrets: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Required application secrets must remain available to authorized workloads.');
  });

  it('Rejects grantEveryoneClusterAdmin defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, grantEveryoneClusterAdmin: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Universal cluster-admin violates least privilege.');
  });

  it('Rejects disableAllServiceAccounts defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, disableAllServiceAccounts: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Legitimate workload identity must remain functional.');
  });

  it('Rejects deleteAllNetworkPoliciesToAvoidConflicts defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, deleteAllNetworkPoliciesToAvoidConflicts: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Removing segmentation controls is not valid remediation.');
  });

  it('Rejects disableAuditToHideAlerts defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, disableAuditToHideAlerts: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Audit visibility must remain enabled.');
  });

  it('Rejects markImagesTrustedWithoutSignature defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, markImagesTrustedWithoutSignature: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Image trust cannot be asserted without cryptographic evidence.');
  });

  it('Rejects bypassAdmissionValidation defect', () => {
    const state = createHardenedKubernetesMasterState();
    state.antiCheatFlags = { ...state.antiCheatFlags, bypassAdmissionValidation: true };

    const res = validateKubernetesMasterChallenge(state);
    expect(res.isPassed).toBe(false);
    expect(res.antiCheatViolations).toContain('Admission controls cannot be bypassed.');
  });
});
