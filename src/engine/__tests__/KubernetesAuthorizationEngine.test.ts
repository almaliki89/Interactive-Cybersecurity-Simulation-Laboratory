/**
 * OMEGA V14.1 — Kubernetes Authorization Engine Unit Test Suite
 * Validates RBAC evaluation, least-privilege enforcement, and namespace boundaries.
 */

import { describe, it, expect } from 'vitest';
import { evaluateKubernetesAuthorization, auditKubernetesRbac } from '../../simulations/containers/logic/rbac';
import { KubernetesRole, KubernetesRoleBinding } from '../../simulations/containers/logic/types';

describe('Kubernetes Authorization Engine (RBAC)', () => {
  const sampleRoles: KubernetesRole[] = [
    {
      id: 'role-frontend-reader',
      name: 'frontend-pod-reader',
      namespace: 'frontend',
      isClusterRole: false,
      rules: [
        {
          apiGroups: [''],
          resources: ['pods'],
          verbs: ['get', 'list', 'watch'],
        },
      ],
    },
    {
      id: 'role-backend-config-reader',
      name: 'backend-configmap-reader',
      namespace: 'backend',
      isClusterRole: false,
      rules: [
        {
          apiGroups: [''],
          resources: ['configmaps'],
          verbs: ['get', 'list'],
        },
      ],
    },
    {
      id: 'role-wildcard-admin',
      name: 'cluster-admin-shadow',
      namespace: '',
      isClusterRole: true,
      rules: [
        {
          apiGroups: ['*'],
          resources: ['*'],
          verbs: ['*'],
        },
      ],
    },
  ];

  const sampleBindings: KubernetesRoleBinding[] = [
    {
      id: 'bind-frontend',
      name: 'frontend-sa-binding',
      namespace: 'frontend',
      isClusterRoleBinding: false,
      roleRefName: 'frontend-pod-reader',
      subjects: [{ kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' }],
    },
    {
      id: 'bind-backend',
      name: 'backend-sa-binding',
      namespace: 'backend',
      isClusterRoleBinding: false,
      roleRefName: 'backend-configmap-reader',
      subjects: [{ kind: 'ServiceAccount', name: 'backend-sa', namespace: 'backend' }],
    },
  ];

  it('ALLOWS frontend-sa to get pods in frontend namespace', () => {
    const res = evaluateKubernetesAuthorization({
      subject: { kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' },
      verb: 'get',
      resource: 'pods',
      namespace: 'frontend',
      roles: sampleRoles,
      bindings: sampleBindings,
    });

    expect(res.allowed).toBe(true);
    expect(res.decision).toBe('ALLOW');
    expect(res.matchedRole?.name).toBe('frontend-pod-reader');
  });

  it('DENIES frontend-sa to get secrets in finance namespace', () => {
    const res = evaluateKubernetesAuthorization({
      subject: { kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' },
      verb: 'get',
      resource: 'secrets',
      namespace: 'finance',
      roles: sampleRoles,
      bindings: sampleBindings,
    });

    expect(res.allowed).toBe(false);
    expect(res.decision).toBe('DENY');
  });

  it('ALLOWS backend-sa to get configmaps in backend namespace', () => {
    const res = evaluateKubernetesAuthorization({
      subject: { kind: 'ServiceAccount', name: 'backend-sa', namespace: 'backend' },
      verb: 'get',
      resource: 'configmaps',
      namespace: 'backend',
      roles: sampleRoles,
      bindings: sampleBindings,
    });

    expect(res.allowed).toBe(true);
    expect(res.decision).toBe('ALLOW');
  });

  it('DENIES random-sa to delete deployments in finance namespace', () => {
    const res = evaluateKubernetesAuthorization({
      subject: { kind: 'ServiceAccount', name: 'random-sa', namespace: 'random' },
      verb: 'delete',
      resource: 'deployments',
      namespace: 'finance',
      roles: sampleRoles,
      bindings: sampleBindings,
    });

    expect(res.allowed).toBe(false);
    expect(res.decision).toBe('DENY');
  });

  it('Detects cluster-admin style wildcard role as security failure in audit', () => {
    const audit = auditKubernetesRbac(sampleRoles);
    expect(audit.isCompliant).toBe(false);
    expect(audit.wildcardRolesCount).toBeGreaterThan(0);
    expect(audit.findings.some((f) => f.roleName === 'cluster-admin-shadow')).toBe(true);
  });

  it('Ensures namespace Role does NOT grant access to another namespace', () => {
    const res = evaluateKubernetesAuthorization({
      subject: { kind: 'ServiceAccount', name: 'frontend-sa', namespace: 'frontend' },
      verb: 'get',
      resource: 'pods',
      namespace: 'backend', // Different namespace!
      roles: sampleRoles,
      bindings: sampleBindings,
    });

    expect(res.allowed).toBe(false);
    expect(res.decision).toBe('DENY');
  });
});
