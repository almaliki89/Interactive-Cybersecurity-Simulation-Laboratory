/**
 * OMEGA V14.1 — Kubernetes NetworkPolicy Engine Unit Test Suite
 * Validates NetworkPolicy reachability matrix across namespaces and ingress/egress boundaries.
 */

import { describe, it, expect } from 'vitest';
import { evaluatePodNetworkReachability } from '../../simulations/containers/logic/networkPolicies';
import { KubernetesNetworkPolicy } from '../../simulations/containers/logic/types';

describe('Kubernetes NetworkPolicy Reachability Matrix Engine', () => {
  const hardeningPolicies: KubernetesNetworkPolicy[] = [
    {
      id: 'default-deny-finance-ingress',
      name: 'finance-default-deny-ingress',
      namespace: 'finance',
      podSelector: {},
      policyTypes: ['Ingress', 'Egress'],
      ingressRules: [
        {
          from: [
            {
              namespaceSelector: { name: 'backend' },
              podSelector: { app: 'backend' },
            },
          ],
          ports: [{ protocol: 'TCP', port: 8080 }],
        },
      ],
      egressRules: [
        {
          to: [{ namespaceSelector: { name: 'monitoring' } }],
          ports: [{ protocol: 'TCP', port: 9090 }],
        },
      ],
      enabled: true,
    },
    {
      id: 'default-deny-backend-ingress',
      name: 'backend-default-deny-ingress',
      namespace: 'backend',
      podSelector: {},
      policyTypes: ['Ingress', 'Egress'],
      ingressRules: [
        {
          from: [
            {
              namespaceSelector: { name: 'frontend' },
              podSelector: { app: 'frontend' },
            },
          ],
          ports: [{ protocol: 'TCP', port: 443 }],
        },
      ],
      egressRules: [
        {
          to: [
            {
              namespaceSelector: { name: 'finance' },
              podSelector: { app: 'finance-api' },
            },
          ],
          ports: [{ protocol: 'TCP', port: 8080 }],
        },
      ],
      enabled: true,
    },
  ];

  it('ALLOWS Internet -> frontend ingress', () => {
    const res = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'internet-client', namespace: 'external', labels: {} },
        dstPod: { name: 'frontend-pod', namespace: 'frontend', labels: { app: 'frontend' } },
        dstPort: 443,
        isExternal: true,
      },
      hardeningPolicies
    );

    expect(res.reachable).toBe(true);
  });

  it('ALLOWS frontend -> backend (port 443)', () => {
    const res = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'frontend-pod', namespace: 'frontend', labels: { app: 'frontend' } },
        dstPod: { name: 'backend-pod', namespace: 'backend', labels: { app: 'backend' } },
        dstPort: 443,
      },
      hardeningPolicies
    );

    expect(res.reachable).toBe(true);
  });

  it('ALLOWS backend -> finance-api (required app port 8080)', () => {
    const res = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'backend-pod', namespace: 'backend', labels: { app: 'backend' } },
        dstPod: { name: 'finance-api-pod', namespace: 'finance', labels: { app: 'finance-api' } },
        dstPort: 8080,
      },
      hardeningPolicies
    );

    expect(res.reachable).toBe(true);
  });

  it('DENIES Internet -> finance pods', () => {
    const res = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'internet-client', namespace: 'external', labels: {} },
        dstPod: { name: 'finance-api-pod', namespace: 'finance', labels: { app: 'finance-api' } },
        dstPort: 8080,
        isExternal: true,
      },
      hardeningPolicies
    );

    expect(res.reachable).toBe(false);
  });

  it('DENIES frontend -> finance-db (unauthorized direct access)', () => {
    const res = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'frontend-pod', namespace: 'frontend', labels: { app: 'frontend' } },
        dstPod: { name: 'finance-db-pod', namespace: 'finance', labels: { app: 'finance-db' } },
        dstPort: 5432,
      },
      hardeningPolicies
    );

    expect(res.reachable).toBe(false);
  });

  it('DENIES random namespace -> finance pods', () => {
    const res = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'guest-pod', namespace: 'guest-space', labels: { app: 'guest' } },
        dstPod: { name: 'finance-api-pod', namespace: 'finance', labels: { app: 'finance-api' } },
        dstPort: 8080,
      },
      hardeningPolicies
    );

    expect(res.reachable).toBe(false);
  });

  it('DENIES finance-db -> Internet egress', () => {
    const res = evaluatePodNetworkReachability(
      {
        srcPod: { name: 'finance-db-pod', namespace: 'finance', labels: { app: 'finance-db' } },
        dstPod: { name: 'external-server', namespace: 'external', labels: {} },
        dstPort: 443,
        isExternal: true,
      },
      hardeningPolicies
    );

    expect(res.reachable).toBe(false);
  });
});
