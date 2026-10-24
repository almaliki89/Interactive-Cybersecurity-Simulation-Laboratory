import { describe, it, expect, beforeEach } from 'vitest';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
  CHALLENGE_TO_SIMULATION_MAP,
} from '../../stores/simulationStore';
import {
  createDefaultCloudIdentities,
  auditCloudIamConfiguration,
  CloudPrincipal,
} from '../../simulations/cloud/logic/identity';
import { ALL_PRESET_POLICIES } from '../../simulations/cloud/logic/policies';
import { getInitialClusterRoles, auditKubernetesRbac } from '../../simulations/containers/logic/rbac';
import { KubernetesRole } from '../../simulations/containers/logic/types';

describe('OMEGA MAX — Challenge Integrity & Technical Validators', () => {
  beforeEach(() => {
    // Reset Zustand store state
    useSimulationStore.setState({
      activeSimulationId: 'landing',
      completedChallenges: [],
    });
    // Clean up validators
    unregisterChallengeValidator('iam-hardening-challenge');
    unregisterChallengeValidator('k8s-hardening-challenge');
    unregisterChallengeValidator('threat-hunting-hypothesis-challenge');
  });

  describe('1. Challenge Isolation & Mapping', () => {
    it('maps challenges strictly to their respective valid simulations', () => {
      expect(CHALLENGE_TO_SIMULATION_MAP['iam-hardening-challenge']).toEqual(['cloud_iam', 'cloud']);
      expect(CHALLENGE_TO_SIMULATION_MAP['k8s-hardening-challenge']).toEqual(['kubernetes', 'containers']);
      expect(CHALLENGE_TO_SIMULATION_MAP['threat-hunting-hypothesis-challenge']).toEqual('threat_hunting');
    });

    it('rejects completing iam-hardening-challenge when activeSimulationId is threat_hunting', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });

      registerChallengeValidator('iam-hardening-challenge', () => ({
        success: true,
        score: 100,
        message: 'Mock bypass',
      }));

      useSimulationStore.getState().completeChallenge('iam-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Mock attempt',
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain('iam-hardening-challenge');
    });

    it('rejects completing k8s-hardening-challenge when activeSimulationId is threat_hunting', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });

      registerChallengeValidator('k8s-hardening-challenge', () => ({
        success: true,
        score: 100,
        message: 'Mock bypass',
      }));

      useSimulationStore.getState().completeChallenge('k8s-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Mock attempt',
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain('k8s-hardening-challenge');
    });
  });

  describe('2. Cloud IAM Technical Validator (auditCloudIamConfiguration)', () => {
    it('flags default cloud IAM configuration as non-compliant due to wildcard storage policy', () => {
      const defaultData = createDefaultCloudIdentities();
      const audit = auditCloudIamConfiguration(defaultData.principals, defaultData.groups, ALL_PRESET_POLICIES);

      expect(audit.isCompliant).toBe(false);
      expect(audit.securityScore).toBeLessThan(100);
      expect(audit.findings.length).toBeGreaterThan(0);
      expect(audit.findings.some((f) => f.principalId === 'wkl-frontend-app')).toBe(true);
    });

    it('passes audit and reaches 100% score when workload identity is hardened to least privilege', () => {
      const defaultData = createDefaultCloudIdentities();
      const hardenedPrincipals: CloudPrincipal[] = defaultData.principals.map((p) => {
        if (p.id === 'wkl-frontend-app') {
          return {
            ...p,
            attachedPolicyIds: ['pol-finance-reader-least-priv'],
          };
        }
        return p;
      });

      const audit = auditCloudIamConfiguration(hardenedPrincipals, defaultData.groups, ALL_PRESET_POLICIES);

      expect(audit.isCompliant).toBe(true);
      expect(audit.securityScore).toBe(100);
      expect(audit.findings).toHaveLength(0);
    });

    it('completes iam-hardening-challenge in cloud_iam simulation only when live validator evaluates to compliant', () => {
      useSimulationStore.setState({ activeSimulationId: 'cloud_iam' });

      let currentPrincipals = createDefaultCloudIdentities().principals;
      const groups = createDefaultCloudIdentities().groups;

      registerChallengeValidator('iam-hardening-challenge', () => {
        const live = auditCloudIamConfiguration(currentPrincipals, groups, ALL_PRESET_POLICIES);
        return {
          success: live.isCompliant && live.securityScore >= 100,
          score: live.securityScore,
          message: live.messageEn,
        };
      });

      // Attempt complete on vulnerable state -> rejected
      useSimulationStore.getState().completeChallenge('iam-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Force complete attempt',
      });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('iam-hardening-challenge');

      // Harden state
      currentPrincipals = currentPrincipals.map((p) =>
        p.id === 'wkl-frontend-app' ? { ...p, attachedPolicyIds: ['pol-finance-reader-least-priv'] } : p
      );

      // Complete attempt on hardened state -> succeeds
      useSimulationStore.getState().completeChallenge('iam-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Hardened',
      });
      expect(useSimulationStore.getState().completedChallenges).toContain('iam-hardening-challenge');
    });
  });

  describe('3. Kubernetes RBAC Technical Validator (auditKubernetesRbac)', () => {
    it('flags initial cluster roles as non-compliant due to wildcard and pods/exec rules', () => {
      const initialRoles = getInitialClusterRoles().roles;
      const audit = auditKubernetesRbac(initialRoles);

      expect(audit.isCompliant).toBe(false);
      expect(audit.securityScore).toBeLessThan(100);
      expect(audit.findings.length).toBeGreaterThan(0);
    });

    it('passes audit when sanitized roles eliminate wildcards and pods/exec', () => {
      const sanitizedRoles: KubernetesRole[] = [
        {
          id: 'role-frontend-sa',
          name: 'frontend-service-role',
          namespace: 'production',
          isClusterRole: false,
          rules: [{ apiGroups: [''], resources: ['configmaps'], verbs: ['get', 'list'] }],
        },
        {
          id: 'role-ci-runner',
          name: 'ci-runner-scoped-role',
          namespace: 'ci-cd',
          isClusterRole: false,
          rules: [{ apiGroups: ['apps'], resources: ['deployments'], verbs: ['get', 'update', 'patch'] }],
        },
      ];

      const audit = auditKubernetesRbac(sanitizedRoles);

      expect(audit.isCompliant).toBe(true);
      expect(audit.securityScore).toBe(100);
      expect(audit.findings).toHaveLength(0);
    });

    it('completes k8s-hardening-challenge in kubernetes simulation only when live validator evaluates to compliant', () => {
      useSimulationStore.setState({ activeSimulationId: 'kubernetes' });

      let currentRoles = getInitialClusterRoles().roles;

      registerChallengeValidator('k8s-hardening-challenge', () => {
        const live = auditKubernetesRbac(currentRoles);
        return {
          success: live.isCompliant && live.securityScore >= 100,
          score: live.securityScore,
          message: live.isCompliant ? 'Compliant RBAC' : 'Non-compliant RBAC',
        };
      });

      // Attempt complete on vulnerable roles -> rejected
      useSimulationStore.getState().completeChallenge('k8s-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Force complete attempt',
      });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('k8s-hardening-challenge');

      // Sanitize roles
      currentRoles = [
        {
          id: 'role-scoped',
          name: 'scoped-role',
          namespace: 'prod',
          isClusterRole: false,
          rules: [{ apiGroups: [''], resources: ['configmaps'], verbs: ['get'] }],
        },
      ];

      // Complete attempt on sanitized roles -> succeeds
      useSimulationStore.getState().completeChallenge('k8s-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Sanitized',
      });
      expect(useSimulationStore.getState().completedChallenges).toContain('k8s-hardening-challenge');
    });
  });
});
