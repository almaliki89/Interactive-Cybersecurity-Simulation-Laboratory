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
import {
  calculateEvidenceHash,
  verifyEvidenceIntegrity,
  validateEvidenceCryptoProof,
} from '../../simulations/forensics/logic/hashing';
import { createForensicEvidenceFromTelemetry } from '../../simulations/forensics/logic/evidence';
import { ThreatHuntValidator } from '../../simulations/threat/logic/validators';
import { HUNT_SCENARIOS } from '../../simulations/threat/logic/scenarios';
import { validateCustodyChain } from '../../simulations/forensics/logic/custody';
import { useThreatHuntingStore } from '../../simulations/threat/runtime/threatHuntingStore';

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

  describe('4. SOC Alert Triage Validation (brute-force-triage-challenge)', () => {
    it('rejects completing brute-force-triage-challenge when no user triage status has been recorded', () => {
      useSimulationStore.setState({ activeSimulationId: 'soc' });

      const currentAlerts = [{ id: 'alert-1' }];
      const statuses: Record<string, string> = {}; // Empty user triage status
      registerChallengeValidator('brute-force-triage-challenge', () => {
        const currentAlertIds = new Set(currentAlerts.map((a) => a.id));
        const validTriagedCount = Object.entries(statuses).filter(
          ([alertId, status]) =>
            currentAlertIds.has(alertId) &&
            (status === 'TRIAGED' || status === 'CLOSED' || status === 'INVESTIGATING')
        ).length;
        if (validTriagedCount > 0) {
          return { success: true, score: 100, message: 'Triaged' };
        }
        return { success: false, score: 0, message: 'No triage action' };
      });

      useSimulationStore.getState().completeChallenge('brute-force-triage-challenge', {
        success: true,
        score: 100,
        message: 'Bypass attempt',
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain('brute-force-triage-challenge');
    });

    it('rejects completing brute-force-triage-challenge when status contains a stale alert not in active queue', () => {
      useSimulationStore.setState({ activeSimulationId: 'soc' });

      const currentAlerts = [{ id: 'alert-current-real' }];
      // Stale status from an old/disappeared alert
      const statuses: Record<string, string> = { 'stale-alert-disappeared': 'TRIAGED' };

      registerChallengeValidator('brute-force-triage-challenge', () => {
        const currentAlertIds = new Set(currentAlerts.map((a) => a.id));
        const validTriagedCount = Object.entries(statuses).filter(
          ([alertId, status]) =>
            currentAlertIds.has(alertId) &&
            (status === 'TRIAGED' || status === 'CLOSED' || status === 'INVESTIGATING')
        ).length;
        if (validTriagedCount > 0) {
          return { success: true, score: 100, message: 'Triaged' };
        }
        return { success: false, score: 0, message: 'Stale status rejected' };
      });

      useSimulationStore.getState().completeChallenge('brute-force-triage-challenge', {
        success: true,
        score: 100,
        message: 'Attempt with stale status',
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain('brute-force-triage-challenge');
    });

    it('rejects completing brute-force-triage-challenge when active queue is empty', () => {
      useSimulationStore.setState({ activeSimulationId: 'soc' });

      const currentAlerts: { id: string }[] = []; // Empty queue
      const statuses: Record<string, string> = { 'alert-1': 'TRIAGED' };

      registerChallengeValidator('brute-force-triage-challenge', () => {
        if (!currentAlerts || currentAlerts.length === 0) {
          return { success: false, score: 0, message: 'No active alerts in queue' };
        }
        const currentAlertIds = new Set(currentAlerts.map((a) => a.id));
        const validTriagedCount = Object.entries(statuses).filter(
          ([alertId, status]) =>
            currentAlertIds.has(alertId) &&
            (status === 'TRIAGED' || status === 'CLOSED' || status === 'INVESTIGATING')
        ).length;
        if (validTriagedCount > 0) {
          return { success: true, score: 100, message: 'Triaged' };
        }
        return { success: false, score: 0, message: 'No triage action' };
      });

      useSimulationStore.getState().completeChallenge('brute-force-triage-challenge', {
        success: true,
        score: 100,
        message: 'Attempt on empty queue',
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain('brute-force-triage-challenge');
    });

    it('completes brute-force-triage-challenge when user explicitly records triage status on current active alert', () => {
      useSimulationStore.setState({ activeSimulationId: 'soc' });

      const currentAlerts = [{ id: 'alert-1' }];
      const statuses: Record<string, string> = { 'alert-1': 'TRIAGED' };
      registerChallengeValidator('brute-force-triage-challenge', () => {
        const currentAlertIds = new Set(currentAlerts.map((a) => a.id));
        const validTriagedCount = Object.entries(statuses).filter(
          ([alertId, status]) =>
            currentAlertIds.has(alertId) &&
            (status === 'TRIAGED' || status === 'CLOSED' || status === 'INVESTIGATING')
        ).length;
        if (validTriagedCount > 0) {
          return { success: true, score: 100, message: 'Triaged' };
        }
        return { success: false, score: 0, message: 'No triage action' };
      });

      useSimulationStore.getState().completeChallenge('brute-force-triage-challenge', {
        success: true,
        score: 100,
        message: 'Triaged',
      });

      expect(useSimulationStore.getState().completedChallenges).toContain('brute-force-triage-challenge');
    });
  });

  describe('5. Reset State Rejection & Re-evaluation', () => {
    it('rejects completion after environment is reset back to vulnerable state', () => {
      useSimulationStore.setState({ activeSimulationId: 'cloud_iam', completedChallenges: [] });

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

      // Harden principals
      currentPrincipals = currentPrincipals.map((p) =>
        p.id === 'wkl-frontend-app' ? { ...p, attachedPolicyIds: ['pol-finance-reader-least-priv'] } : p
      );

      // Verify pass on hardened state
      useSimulationStore.getState().completeChallenge('iam-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Hardened',
      });
      expect(useSimulationStore.getState().completedChallenges).toContain('iam-hardening-challenge');

      // Reset principals back to default vulnerable state
      currentPrincipals = createDefaultCloudIdentities().principals;

      // Un-complete in store for re-evaluation test
      useSimulationStore.setState({ completedChallenges: [] });

      // Attempt complete after reset -> rejected
      useSimulationStore.getState().completeChallenge('iam-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Post-reset attempt',
      });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('iam-hardening-challenge');
    });
  });

  describe('6. Cryptographic Evidence Integrity & SHA-256 Tamper Resistance', () => {
    it('calculates deterministic SHA-256 style hashes from telemetry metadata', () => {
      const metaA = { sourceWorld: 'WINDOWS', rawEventId: 'raw-1', host: 'FIN-WS-01', user: 'sara' };
      const metaB = { sourceWorld: 'WINDOWS', rawEventId: 'raw-1', host: 'FIN-WS-01', user: 'sara' };
      const metaC = { sourceWorld: 'WINDOWS', rawEventId: 'raw-1', host: 'FIN-WS-01', user: 'attacker' };

      const hashA = calculateEvidenceHash(metaA);
      const hashB = calculateEvidenceHash(metaB);
      const hashC = calculateEvidenceHash(metaC);

      expect(hashA).toMatch(/^sha256:[a-f0-9]{32}$/);
      expect(hashA).toBe(hashB);
      expect(hashA).not.toBe(hashC);
    });

    it('detects mismatched hashes and rejects untrusted integrity status in verifyEvidenceIntegrity', () => {
      const metadata = { eventType: 'POWERSHELL_SUSPICIOUS', pid: 4820, host: 'DC-01' };
      const trueHash = calculateEvidenceHash(metadata);

      // Tampered currentHash
      const tamperedEvidence = {
        id: 'EVD-WIN-01',
        type: 'LOG_EXPORT' as const,
        acquiredAtVirtualTime: 100,
        originalHash: trueHash,
        currentHash: 'sha256:00000000000000000000000000000000',
        preserved: true,
        integrityStatus: 'VERIFIED' as const,
        metadata,
      };

      const verified = verifyEvidenceIntegrity(tamperedEvidence);
      expect(verified.integrityStatus).toBe('MISMATCH');

      const proof = validateEvidenceCryptoProof(tamperedEvidence);
      expect(proof.isValid).toBe(false);
      expect(proof.isTampered).toBe(true);
      expect(proof.reasonEn).toContain('Hash mismatch');
    });

    it('detects metadata alteration even if attacker forged matching originalHash and currentHash', () => {
      const originalMeta = { eventType: 'LOGIN_FAILED', ip: '192.168.1.50' };
      const forgedHash = 'sha256:forgedhash111122223333444455556666';

      // Attacker modified metadata without re-computing the valid hash
      const forgedEvidence = {
        id: 'EVD-WIN-02',
        type: 'LOG_EXPORT' as const,
        acquiredAtVirtualTime: 120,
        originalHash: forgedHash,
        currentHash: forgedHash, // forged identical values
        preserved: true,
        integrityStatus: 'VERIFIED' as const,
        metadata: originalMeta,
      };

      const verified = verifyEvidenceIntegrity(forgedEvidence);
      expect(verified.integrityStatus).toBe('MISMATCH');

      const proof = validateEvidenceCryptoProof(forgedEvidence);
      expect(proof.isValid).toBe(false);
      expect(proof.isTampered).toBe(true);
      expect(proof.reasonEn).toContain('Metadata tampering detected');
    });

    it('rejects master challenge validation if forensics handoff evidence contains tampered metadata', () => {
      const masterScenario = HUNT_SCENARIOS['HUNT-MASTER'];
      const masterEvents = masterScenario.events;

      const meta1 = { sourceWorld: 'WINDOWS', rawEventId: masterEvents[0].rawEventId || masterEvents[0].id };
      const trueHash1 = calculateEvidenceHash(meta1);

      // Create evidence with invalid/tampered hash
      const tamperedEvidenceList = [
        {
          id: 'EVD-01',
          type: 'LOG_EXPORT' as const,
          sourceHost: 'FIN-WS-01',
          sourceUser: 'sara',
          acquiredAtVirtualTime: 100,
          originalHash: trueHash1,
          currentHash: trueHash1,
          preserved: true,
          integrityStatus: 'VERIFIED' as const,
          metadata: meta1,
        },
        {
          id: 'EVD-02',
          type: 'LOG_EXPORT' as const,
          sourceHost: 'DC-01',
          sourceUser: 'admin',
          acquiredAtVirtualTime: 110,
          originalHash: 'sha256:fakehash1234',
          currentHash: 'sha256:fakehash1234',
          preserved: true,
          integrityStatus: 'VERIFIED' as const,
          metadata: { host: 'DC-01', command: 'tampered-cmd' }, // Hash will not match!
        },
      ];

      const val = ThreatHuntValidator.validateMasterChallenge({
        hunt: masterScenario.hunt,
        hypothesis: { ...masterScenario.hypothesis, status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            titleEn: 'Nexus APT Findings',
            titleAr: 'نتائج نيكسورا',
            summaryEn: 'S',
            summaryAr: 'S',
            severity: 'critical',
            eventIds: [masterEvents[0].id, masterEvents[1].id, masterEvents[2].id, masterEvents[3].id],
            rawEventIds: [
              masterEvents[0].rawEventId || masterEvents[0].id,
              masterEvents[1].rawEventId || masterEvents[1].id,
              masterEvents[2].rawEventId || masterEvents[2].id,
              masterEvents[3].rawEventId || masterEvents[3].id,
            ],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 90,
            confidenceBreakdown: { signalCountScore: 25, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [
          {
            id: 'DET-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            nameEn: 'Master Rule',
            nameAr: 'قاعدة شاملة',
            descriptionEn: '',
            descriptionAr: '',
            severity: 'HIGH',
            dataSources: ['WINDOWS'],
            conditions: [],
            mitreTechniques: [],
            status: 'VALIDATED',
            ruleType: 'SINGLE_EVENT',
            createdAtVirtualTime: 0,
          },
        ],
        detectionResults: {
          'DET-HUNT-MASTER-1': {
            ruleId: 'DET-HUNT-MASTER-1',
            totalEvaluated: 10,
            matchedEventIds: [masterEvents[0].id],
            truePositives: 1,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: [masterEvents[0].id],
            precision: 1.0,
            recall: 1.0,
            isValid: true,
            tuningAdviceEn: '',
            tuningAdviceAr: '',
          },
        },
        socHandoffs: [
          {
            handoffId: 'SOC-MASTER-1',
            huntId: 'HUNT-MASTER',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            eventIds: [masterEvents[0].id, masterEvents[1].id],
            summaryEn: 'SOC Dispatched',
            summaryAr: 'تم الإرسال',
            priority: 'P1_CRITICAL',
            timestampVirtual: 120,
            status: 'DISPATCHED',
          },
        ],
        forensicsHandoffs: [
          {
            handoffId: 'FOR-MASTER-1',
            huntId: 'HUNT-MASTER',
            caseId: 'CASE-01',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            acquiredAtVirtualTime: 130,
            evidenceList: tamperedEvidenceList,
          },
        ],
        executedQueries: ['sourceWorld = WINDOWS', 'sourceWorld = CLOUD'],
        telemetryEvents: masterEvents,
      });

      expect(val.success).toBe(false);
      expect(val.missingRequirementsEn).toContain(
        'Must complete Forensics Handoff for master campaign generating canonical preserved evidence items (EVD-...).'
      );
    });

    it('rejects master challenge validation if forensics handoff contains duplicate evidence items', () => {
      const masterScenario = HUNT_SCENARIOS['HUNT-MASTER'];
      const masterEvents = masterScenario.events;

      const meta1 = { sourceWorld: 'WINDOWS', rawEventId: masterEvents[0].rawEventId || masterEvents[0].id };
      const trueHash1 = calculateEvidenceHash(meta1);

      // Duplicate evidence item with same ID 'EVD-01' passed twice to satisfy length >= 2
      const duplicateEvidenceList = [
        {
          id: 'EVD-01',
          type: 'LOG_EXPORT' as const,
          sourceHost: 'FIN-WS-01',
          sourceUser: 'sara',
          acquiredAtVirtualTime: 100,
          originalHash: trueHash1,
          currentHash: trueHash1,
          preserved: true,
          integrityStatus: 'VERIFIED' as const,
          metadata: meta1,
        },
        {
          id: 'EVD-01', // duplicate ID
          type: 'LOG_EXPORT' as const,
          sourceHost: 'FIN-WS-01',
          sourceUser: 'sara',
          acquiredAtVirtualTime: 100,
          originalHash: trueHash1,
          currentHash: trueHash1,
          preserved: true,
          integrityStatus: 'VERIFIED' as const,
          metadata: meta1,
        },
      ];

      const val = ThreatHuntValidator.validateMasterChallenge({
        hunt: masterScenario.hunt,
        hypothesis: { ...masterScenario.hypothesis, status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            titleEn: 'Nexus APT Findings',
            titleAr: 'نتائج نيكسورا',
            summaryEn: 'S',
            summaryAr: 'S',
            severity: 'critical',
            eventIds: [masterEvents[0].id, masterEvents[1].id, masterEvents[2].id, masterEvents[3].id],
            rawEventIds: [
              masterEvents[0].rawEventId || masterEvents[0].id,
              masterEvents[1].rawEventId || masterEvents[1].id,
              masterEvents[2].rawEventId || masterEvents[2].id,
              masterEvents[3].rawEventId || masterEvents[3].id,
            ],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 90,
            confidenceBreakdown: { signalCountScore: 25, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [
          {
            id: 'DET-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            nameEn: 'Master Rule',
            nameAr: 'قاعدة شاملة',
            descriptionEn: '',
            descriptionAr: '',
            severity: 'HIGH',
            dataSources: ['WINDOWS'],
            conditions: [],
            mitreTechniques: [],
            status: 'VALIDATED',
            ruleType: 'SINGLE_EVENT',
            createdAtVirtualTime: 0,
          },
        ],
        detectionResults: {
          'DET-HUNT-MASTER-1': {
            ruleId: 'DET-HUNT-MASTER-1',
            totalEvaluated: 10,
            matchedEventIds: [masterEvents[0].id],
            truePositives: 1,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: [masterEvents[0].id],
            precision: 1.0,
            recall: 1.0,
            isValid: true,
            tuningAdviceEn: '',
            tuningAdviceAr: '',
          },
        },
        socHandoffs: [
          {
            handoffId: 'SOC-MASTER-1',
            huntId: 'HUNT-MASTER',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            eventIds: [masterEvents[0].id, masterEvents[1].id],
            summaryEn: 'SOC Dispatched',
            summaryAr: 'تم الإرسال',
            priority: 'P1_CRITICAL',
            timestampVirtual: 120,
            status: 'DISPATCHED',
          },
        ],
        forensicsHandoffs: [
          {
            handoffId: 'FOR-MASTER-1',
            huntId: 'HUNT-MASTER',
            caseId: 'CASE-01',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            acquiredAtVirtualTime: 130,
            evidenceList: duplicateEvidenceList,
          },
        ],
        executedQueries: ['sourceWorld = WINDOWS', 'sourceWorld = CLOUD'],
        telemetryEvents: masterEvents,
      });

      expect(val.success).toBe(false);
      expect(val.missingRequirementsEn).toContain(
        'Must complete Forensics Handoff for master campaign generating canonical preserved evidence items (EVD-...).'
      );
    });

    it('rejects master challenge validation if SOC handoff contains extraneous events not in the linked finding', () => {
      const masterScenario = HUNT_SCENARIOS['HUNT-MASTER'];
      const masterEvents = masterScenario.events;

      const meta1 = { sourceWorld: 'WINDOWS', rawEventId: masterEvents[0].rawEventId || masterEvents[0].id };
      const meta2 = { sourceWorld: 'WINDOWS', rawEventId: masterEvents[1].rawEventId || masterEvents[1].id };
      const trueHash1 = calculateEvidenceHash(meta1);
      const trueHash2 = calculateEvidenceHash(meta2);

      const validEvidenceList = [
        {
          id: 'EVD-01',
          type: 'LOG_EXPORT' as const,
          sourceHost: 'FIN-WS-01',
          sourceUser: 'sara',
          acquiredAtVirtualTime: 100,
          originalHash: trueHash1,
          currentHash: trueHash1,
          preserved: true,
          integrityStatus: 'VERIFIED' as const,
          metadata: meta1,
        },
        {
          id: 'EVD-02',
          type: 'LOG_EXPORT' as const,
          sourceHost: 'FIN-WS-01',
          sourceUser: 'sara',
          acquiredAtVirtualTime: 105,
          originalHash: trueHash2,
          currentHash: trueHash2,
          preserved: true,
          integrityStatus: 'VERIFIED' as const,
          metadata: meta2,
        },
      ];

      // SOC handoff contains an event ID that is NOT in FIND-HUNT-MASTER-1
      const extraneousEventId = masterEvents[3].id;
      const val = ThreatHuntValidator.validateMasterChallenge({
        hunt: masterScenario.hunt,
        hypothesis: { ...masterScenario.hypothesis, status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            titleEn: 'Nexus APT Findings',
            titleAr: 'نتائج نيكسورا',
            summaryEn: 'S',
            summaryAr: 'S',
            severity: 'critical',
            // Only contains events 0, 1, 2
            eventIds: [masterEvents[0].id, masterEvents[1].id, masterEvents[2].id],
            rawEventIds: [
              masterEvents[0].rawEventId || masterEvents[0].id,
              masterEvents[1].rawEventId || masterEvents[1].id,
              masterEvents[2].rawEventId || masterEvents[2].id,
            ],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 90,
            confidenceBreakdown: { signalCountScore: 25, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [
          {
            id: 'DET-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            nameEn: 'Master Rule',
            nameAr: 'قاعدة شاملة',
            descriptionEn: '',
            descriptionAr: '',
            severity: 'HIGH',
            dataSources: ['WINDOWS'],
            conditions: [],
            mitreTechniques: [],
            status: 'VALIDATED',
            ruleType: 'SINGLE_EVENT',
            createdAtVirtualTime: 0,
          },
        ],
        detectionResults: {
          'DET-HUNT-MASTER-1': {
            ruleId: 'DET-HUNT-MASTER-1',
            totalEvaluated: 10,
            matchedEventIds: [masterEvents[0].id],
            truePositives: 1,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: [masterEvents[0].id],
            precision: 1.0,
            recall: 1.0,
            isValid: true,
            tuningAdviceEn: '',
            tuningAdviceAr: '',
          },
        },
        socHandoffs: [
          {
            handoffId: 'SOC-MASTER-1',
            huntId: 'HUNT-MASTER',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            // Event 3 does NOT exist in finding!
            eventIds: [masterEvents[0].id, extraneousEventId],
            summaryEn: 'SOC Dispatched',
            summaryAr: 'تم الإرسال',
            priority: 'P1_CRITICAL',
            timestampVirtual: 120,
            status: 'DISPATCHED',
          },
        ],
        forensicsHandoffs: [
          {
            handoffId: 'FOR-MASTER-1',
            huntId: 'HUNT-MASTER',
            caseId: 'CASE-01',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            acquiredAtVirtualTime: 130,
            evidenceList: validEvidenceList,
          },
        ],
        executedQueries: ['sourceWorld = WINDOWS', 'sourceWorld = CLOUD'],
        telemetryEvents: masterEvents,
      });

      expect(val.success).toBe(false);
      expect(val.missingRequirementsEn).toContain(
        'Must dispatch validated campaign findings to SOC Incident Queue with valid telemetry events.'
      );
    });

    it('rejects legacy detection rule when rule ID belongs to a different hunt (anti-spoofing)', () => {
      const huntScenario = HUNT_SCENARIOS['HUNT-01'];
      const events = huntScenario.events;

      // Detection rule with ID DET-HUNT-02-RULE attempted in HUNT-01 without huntId property
      const val = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: huntScenario.hunt,
        hypothesis: { ...huntScenario.hypothesis, status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-1',
            huntId: 'HUNT-01',
            titleEn: 'F1',
            titleAr: 'F1',
            summaryEn: 'S1',
            summaryAr: 'S1',
            severity: 'warn',
            eventIds: [events[0].id, events[1].id],
            rawEventIds: [events[0].rawEventId || events[0].id, events[1].rawEventId || events[1].id],
            entityRefs: [],
            confidence: 'MEDIUM',
            confidenceScore: 50,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 20, intelMatchesScore: 0, sourceDiversityScore: 10 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 10,
          },
        ],
        detections: [
          {
            id: 'DET-HUNT-02-INJECTED-RULE', // Belongs to HUNT-02!
            nameEn: 'Foreign Rule',
            nameAr: 'قاعدة أجنبية',
            descriptionEn: '',
            descriptionAr: '',
            severity: 'HIGH',
            dataSources: ['WINDOWS'],
            conditions: [],
            mitreTechniques: [],
            status: 'VALIDATED',
            ruleType: 'SINGLE_EVENT',
            createdAtVirtualTime: 0,
          },
        ],
        detectionResults: {
          'DET-HUNT-02-INJECTED-RULE': {
            ruleId: 'DET-HUNT-02-INJECTED-RULE',
            totalEvaluated: 10,
            matchedEventIds: [events[0].id],
            truePositives: 1,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: [events[0].id],
            precision: 1.0,
            recall: 1.0,
            isValid: true,
            tuningAdviceEn: '',
            tuningAdviceAr: '',
          },
        },
        socHandoffs: [
          {
            handoffId: 'SOC-1',
            huntId: 'HUNT-01',
            findingId: 'FIND-1',
            rawEventIds: [events[0].rawEventId || events[0].id],
            eventIds: [events[0].id],
            summaryEn: 'S',
            summaryAr: 'S',
            priority: 'P3_MEDIUM',
            timestampVirtual: 20,
            status: 'DISPATCHED',
          },
        ],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      expect(val.success).toBe(false);
      expect(val.missingRequirementsEn).toContain(
        'Must author and tune a detection rule for the active hunt with 0 false positives.'
      );
    });
  });

  describe('7. SOC Forensics Chain of Custody Ledger Invariants', () => {
    it('detects inverted chronological sequence between custody transfers', () => {
      const records = [
        {
          id: 'CUST-1',
          evidenceId: 'EVD-DISK-01',
          virtualTime: 10,
          action: 'COLLECTED' as const,
          actor: 'Investigator Sara',
          notes: 'Initial acquisition',
        },
        {
          id: 'CUST-2',
          evidenceId: 'EVD-DISK-01',
          virtualTime: 50,
          action: 'TRANSFERRED' as const,
          actor: 'Courier Ali',
          notes: 'Transfer to evidence locker',
        },
        {
          id: 'CUST-3',
          evidenceId: 'EVD-DISK-01',
          virtualTime: 30, // Inverted: 30 is earlier than 50!
          action: 'TRANSFERRED' as const,
          actor: 'Examiner Reem',
          notes: 'Vault intake',
        },
        {
          id: 'CUST-4',
          evidenceId: 'EVD-DISK-01',
          virtualTime: 60,
          action: 'VERIFIED' as const,
          actor: 'Examiner Reem',
          notes: 'Hash verified',
        },
      ];

      const validation = validateCustodyChain('EVD-DISK-01', records, 'hash123', 'hash123');
      expect(validation.valid).toBe(false);
      expect(validation.invalidChronology).toBe(true);
      expect(validation.outOfOrderActions).toContain('TRANSFERRED');
    });

    it('rejects custody chain when a transfer entry has an empty or missing actor', () => {
      const records = [
        {
          id: 'CUST-1',
          evidenceId: 'EVD-MEM-01',
          virtualTime: 10,
          action: 'COLLECTED' as const,
          actor: 'Investigator Sara',
          notes: 'RAM dump',
        },
        {
          id: 'CUST-2',
          evidenceId: 'EVD-MEM-01',
          virtualTime: 20,
          action: 'TRANSFERRED' as const,
          actor: '   ', // Blank anonymous actor!
          notes: 'Unknown transfer',
        },
        {
          id: 'CUST-3',
          evidenceId: 'EVD-MEM-01',
          virtualTime: 30,
          action: 'VERIFIED' as const,
          actor: 'Examiner Reem',
          notes: 'Hash check',
        },
      ];

      const validation = validateCustodyChain('EVD-MEM-01', records, 'hash123', 'hash123');
      expect(validation.valid).toBe(false);
      expect(validation.reasonsEn.some((r) => r.includes('Missing authorized actor'))).toBe(true);
    });

    it('rejects custody chain when duplicate initial collection records exist', () => {
      const records = [
        {
          id: 'CUST-1',
          evidenceId: 'EVD-PCAP-01',
          virtualTime: 10,
          action: 'COLLECTED' as const,
          actor: 'Analyst 1',
          notes: 'Initial capture',
        },
        {
          id: 'CUST-2',
          evidenceId: 'EVD-PCAP-01',
          virtualTime: 15,
          action: 'COLLECTED' as const, // Duplicate collection!
          actor: 'Analyst 2',
          notes: 'Second collection attempt',
        },
        {
          id: 'CUST-3',
          evidenceId: 'EVD-PCAP-01',
          virtualTime: 25,
          action: 'VERIFIED' as const,
          actor: 'Officer',
          notes: 'Hash check',
        },
      ];

      const validation = validateCustodyChain('EVD-PCAP-01', records, 'hash123', 'hash123');
      expect(validation.valid).toBe(false);
      expect(validation.reasonsEn.some((r) => r.includes('Multiple initial collection'))).toBe(true);
    });
  });

  describe('8. Finding Signal Inflation Resistance in ThreatHuntingStore', () => {
    it('deduplicates event IDs in addFinding and prevents inflating signalCountScore', () => {
      const store = useThreatHuntingStore.getState();
      const validEventId = store.telemetryEvents[0].id;

      // Provide duplicate event IDs in input
      store.addFinding({
        titleEn: 'Sprayed Credentials',
        titleAr: 'تخمين بيانات',
        summaryEn: 'Summary',
        summaryAr: 'ملخص',
        severity: 'threat',
        eventIds: [validEventId, validEventId, validEventId, validEventId], // 4 repetitions of same ID
        rawEventIds: ['raw-1', 'raw-1'],
        entityRefs: [],
        status: 'OPEN',
        whyEn: 'Why',
        whyAr: 'سبب',
      });

      const latestFinding = useThreatHuntingStore.getState().findings[0];
      // Event IDs must be deduplicated
      expect(latestFinding.eventIds).toHaveLength(1);
      // Signal score should be based on 1 unique event (10), not 4 repeated events (30)
      expect(latestFinding.confidenceBreakdown.signalCountScore).toBe(10);
    });
  });
});
