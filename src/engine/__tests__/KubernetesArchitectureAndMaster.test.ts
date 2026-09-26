/**
 * OMEGA V14.1 — Kubernetes Architecture Validator & Master Challenge Test Suite
 * Validates architecture check rules, initial unsolved state, and non-bypassable completion gates.
 */

import { describe, it, expect } from 'vitest';
import { createDefaultKubernetesMasterState, validateKubernetesMasterChallenge } from '../../simulations/containers/logic/masterState';
import { validateKubernetesArchitecture } from '../../simulations/containers/logic/architecture';

describe('Kubernetes Architecture Validator & Master State Gates', () => {
  it('Starts in UNSOLVED initial state with weaknesses', () => {
    const initialState = createDefaultKubernetesMasterState();

    expect(initialState.testedAuthorizationsPassed).toBe(false);
    expect(initialState.testedNetworkPathsPassed).toBe(false);

    const validation = validateKubernetesMasterChallenge(initialState);
    expect(validation.isPassed).toBe(false);
    expect(validation.failedChecks.length).toBeGreaterThan(0);
  });

  it('Validates business continuity matrix and flags architectural weaknesses', () => {
    const state = createDefaultKubernetesMasterState();
    const arch = validateKubernetesArchitecture(state);

    expect(arch.passed).toBe(false);
    expect(arch.checks.some((c) => c.id === 'namespace-segmentation' && c.passed)).toBe(true);
    expect(arch.checks.some((c) => c.id === 'pod-security-standards' && !c.passed)).toBe(true);
    expect(arch.checks.some((c) => c.id === 'rbac-least-privilege' && !c.passed)).toBe(true);
  });

  it('Allows Master Challenge completion ONLY when all gates and anti-cheat checks pass', () => {
    const state = createDefaultKubernetesMasterState();

    // Fix state completely
    state.testedAuthorizationsPassed = true;
    state.testedNetworkPathsPassed = true;
    state.auditConfig = { enabled: true, policyLevel: 'RequestResponse', logPath: '/var/log/audit.log' };
    state.secrets = state.secrets.map((s) => ({ ...s, encryptedAtRest: true }));
    state.images = state.images.map((img) => ({
      ...img,
      isSignedCosign: true,
      runsAsUser: 'appuser',
      layers: img.layers.map((l) => ({ ...l, vulnerabilities: [] })),
    }));
    state.pods = state.pods.map((p) => ({
      ...p,
      image: {
        ...p.image,
        isSignedCosign: true,
        runsAsUser: 'appuser',
        layers: [],
      },
      securityContext: {
        ...p.securityContext,
        privileged: false,
        runAsNonRoot: true,
        runAsUser: 10001,
        allowPrivilegeEscalation: false,
        capabilitiesAdd: [],
      },
      volumeMounts: [],
    }));
    state.roles = [
      {
        id: 'r1',
        name: 'frontend-reader',
        namespace: 'frontend',
        isClusterRole: false,
        rules: [{ apiGroups: [''], resources: ['pods'], verbs: ['get', 'list'] }],
      },
    ];
    state.bindings = [
      {
        id: 'b1',
        name: 'frontend-reader-binding',
        namespace: 'frontend',
        isClusterRoleBinding: false,
        roleRefName: 'frontend-reader',
        subjects: [{ kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' }],
      },
    ];
    state.networkPolicies = [
      {
        id: 'pol-deny',
        name: 'default-deny',
        namespace: 'finance',
        podSelector: {},
        policyTypes: ['Ingress', 'Egress'],
        ingressRules: [
          {
            from: [{ podSelector: { app: 'backend' } }],
            ports: [{ protocol: 'TCP', port: 8080 }],
          },
        ],
        egressRules: [],
        enabled: true,
      },
      {
        id: 'pol-allow-fb',
        name: 'allow-frontend-backend',
        namespace: 'backend',
        podSelector: { app: 'backend' },
        policyTypes: ['Ingress'],
        ingressRules: [
          {
            from: [{ podSelector: { app: 'frontend' } }],
            ports: [{ protocol: 'TCP', port: 443 }],
          },
        ],
        egressRules: [],
        enabled: true,
      },
    ];

    const validation = validateKubernetesMasterChallenge(state);
    expect(validation.isPassed).toBe(true);
    expect(validation.failedChecks.length).toEqual(0);
    expect(validation.antiCheatViolations.length).toEqual(0);
  });
});
