import { describe, it, expect } from 'vitest';
import { calculateEvidenceHash, verifyEvidenceIntegrity } from '../../simulations/forensics/logic/hashing';
import { addCustodyRecord, validateCustodyChain, CustodyRecord } from '../../simulations/forensics/logic/custody';
import { listFiles, findFilesByExtension, findRecentlyModifiedFiles, findDeletedArtifacts, inspectFileMetadata } from '../../simulations/forensics/logic/disk';
import { listMemoryProcesses, findSuspiciousProcessRelationships, listActiveConnections, findOrphanProcesses } from '../../simulations/forensics/logic/memory';
import { buildForensicTimeline, sortTimeline, validateForensicTimelineEvidence, SYNTHETIC_MASTER_TIMELINE, ForensicTimelineEvent } from '../../simulations/forensics/logic/timeline';
import { evaluateRootCauseFinding, RootCauseFinding, DEFAULT_NEXORA_ROOT_CAUSE_REQUIREMENTS } from '../../simulations/forensics/logic/rootCause';
import { validateRecoveryState, SystemRecoveryState } from '../../simulations/forensics/logic/recovery';
import {
  validateForensicInvestigationState,
  validateOrderOfVolatility,
  getInitialForensicsChallengeState,
  getSolvedForensicsMasterState,
  ForensicsMasterState,
} from '../../simulations/forensics/logic/hardening';
import { ForensicEvidence } from '../../simulations/forensics/logic/evidence';

describe('Digital Forensics & Incident Response Logic Suite', () => {
  describe('Evidence Hashing & Integrity', () => {
    it('generates deterministic SHA-256 style synthetic hashes', () => {
      const h1 = calculateEvidenceHash('test-input-string');
      const h2 = calculateEvidenceHash('test-input-string');
      expect(h1).toBe(h2);
      expect(h1.startsWith('sha256:')).toBe(true);
    });

    it('detects hash mismatch when evidence is modified', () => {
      const evidence = {
        id: 'EVD-TEST-001',
        type: 'DISK_IMAGE' as const,
        acquiredAtVirtualTime: 10,
        originalHash: 'sha256:1111222233334444',
        currentHash: 'sha256:9999888877776666', // modified!
        preserved: true,
        integrityStatus: 'NOT_VERIFIED' as const,
        metadata: {},
      };
      const res = verifyEvidenceIntegrity(evidence);
      expect(res.integrityStatus).toBe('MISMATCH');
    });
  });

  describe('Chain of Custody Ledger', () => {
    it('validates a complete and intact chain of custody', () => {
      const records: CustodyRecord[] = [
        {
          id: 'CUST-01',
          evidenceId: 'EVD-DISK-01',
          virtualTime: 10,
          action: 'COLLECTED',
          actor: 'Investigator Sara',
          notes: 'Disk acquisition',
        },
        {
          id: 'CUST-02',
          evidenceId: 'EVD-DISK-01',
          virtualTime: 20,
          action: 'VERIFIED',
          actor: 'Vault Officer',
          notes: 'Hash match confirmed',
        },
      ];
      const res = validateCustodyChain('EVD-DISK-01', records, 'hash123', 'hash123');
      expect(res.valid).toBe(true);
      expect(res.missingCollector).toBe(false);
      expect(res.missingIntegrityVerification).toBe(false);
    });

    it('fails when collector is missing from custody log', () => {
      const records: CustodyRecord[] = [
        {
          id: 'CUST-01',
          evidenceId: 'EVD-DISK-01',
          virtualTime: 20,
          action: 'VERIFIED',
          actor: 'Vault Officer',
          notes: 'Verified without prior collector',
        },
      ];
      const res = validateCustodyChain('EVD-DISK-01', records, 'hash123', 'hash123');
      expect(res.valid).toBe(false);
      expect(res.missingCollector).toBe(true);
    });
  });

  describe('Disk Forensics & Filesystem Search', () => {
    it('lists files and filters by extension or deletion status', () => {
      const files = listFiles();
      expect(files.length).toBeGreaterThan(0);

      const deleted = findDeletedArtifacts(files);
      expect(deleted.some((f) => f.filename === 'stager_payload.ps1')).toBe(true);

      const ps1Files = findFilesByExtension('ps1', files);
      expect(ps1Files.length).toBeGreaterThan(0);
    });

    it('inspects file metadata cleanly', () => {
      const meta = inspectFileMetadata('DISK-FILE-001');
      expect(meta).toBeDefined();
      expect(meta?.filename).toBe('Q3_Financial_Analysis_Draft.xlsx');
    });
  });

  describe('Volatile Memory Forensics', () => {
    it('lists memory processes and identifies anomalous parent-child execution', () => {
      const procs = listMemoryProcesses();
      expect(procs.length).toBeGreaterThan(0);

      const suspicious = findSuspiciousProcessRelationships(procs);
      expect(suspicious.some((p) => p.name === 'cmd.exe')).toBe(true);
    });

    it('correlates active process network connections', () => {
      const conns = listActiveConnections();
      expect(conns.length).toBeGreaterThan(0);
      expect(conns.some((c) => c.remoteIp === '203.0.113.55')).toBe(true);
    });
  });

  describe('Order of Volatility Validation', () => {
    it('fails if hard power off was executed before memory acquisition', () => {
      const evidence: ForensicEvidence[] = [
        {
          id: 'EVD-DISK-1',
          type: 'DISK_IMAGE',
          acquiredAtVirtualTime: 50,
          originalHash: 'h1',
          currentHash: 'h1',
          preserved: true,
          integrityStatus: 'VERIFIED',
          metadata: {},
        },
      ];
      const actions = [
        { id: 'A1', type: 'HOST_POWERED_OFF' as const, virtualTime: 20 },
        { id: 'A2', type: 'MEMORY_ACQUIRED' as const, virtualTime: 40 },
      ];
      const res = validateOrderOfVolatility(evidence, actions, false);
      expect(res.passed).toBe(false);
      expect(res.reasonEn).toContain('Hard power off');
    });

    it('fails if non-volatile disk acquired before RAM', () => {
      const evidence: ForensicEvidence[] = [
        {
          id: 'EVD-DISK-1',
          type: 'DISK_IMAGE',
          acquiredAtVirtualTime: 10, // earlier!
          originalHash: 'h1',
          currentHash: 'h1',
          preserved: true,
          integrityStatus: 'VERIFIED',
          metadata: {},
        },
        {
          id: 'EVD-MEM-1',
          type: 'MEMORY_IMAGE',
          acquiredAtVirtualTime: 30, // later!
          originalHash: 'h2',
          currentHash: 'h2',
          preserved: true,
          integrityStatus: 'VERIFIED',
          metadata: {},
        },
      ];
      const res = validateOrderOfVolatility(evidence, [], true);
      expect(res.passed).toBe(false);
      expect(res.reasonEn).toContain('disk image acquired before volatile memory');
    });

    it('passes when RAM is preserved first before disk and no power off', () => {
      const evidence: ForensicEvidence[] = [
        {
          id: 'EVD-MEM-1',
          type: 'MEMORY_IMAGE',
          acquiredAtVirtualTime: 10,
          originalHash: 'h1',
          currentHash: 'h1',
          preserved: true,
          integrityStatus: 'VERIFIED',
          metadata: {},
        },
        {
          id: 'EVD-DISK-1',
          type: 'DISK_IMAGE',
          acquiredAtVirtualTime: 20,
          originalHash: 'h2',
          currentHash: 'h2',
          preserved: true,
          integrityStatus: 'VERIFIED',
          metadata: {},
        },
      ];
      const res = validateOrderOfVolatility(evidence, [], true);
      expect(res.passed).toBe(true);
    });
  });

  describe('Timeline Reconstruction & Negative Tests', () => {
    it('correct complete timeline passes validation', () => {
      const val = validateForensicTimelineEvidence(SYNTHETIC_MASTER_TIMELINE);
      expect(val.valid).toBe(true);
      expect(val.missingStages).toHaveLength(0);
      expect(val.outOfOrderStages).toHaveLength(0);
      expect(val.missingEvidenceLinkStages).toHaveLength(0);
    });

    it('8 random events fail validation due to missing required stages', () => {
      const randomEvents: ForensicTimelineEvent[] = Array.from({ length: 8 }, (_, i) => ({
        id: `TL-RANDOM-${i}`,
        virtualTime: i * 100,
        source: 'GENERIC_SOURCE',
        category: 'GENERIC_CAT',
        descriptionEn: `Random event ${i}`,
        descriptionAr: `حدث عشوائي ${i}`,
        evidenceIds: ['EVD-1'],
      }));
      const val = validateForensicTimelineEvidence(randomEvents);
      expect(val.valid).toBe(false);
      expect(val.missingStages.length).toBeGreaterThan(0);
    });

    it('correct events in wrong order fail validation', () => {
      const outOfOrderTL = [...SYNTHETIC_MASTER_TIMELINE];
      // Swap AUTH_SUCCESS (index 1) and AUTH_FAILURE (index 0) times
      outOfOrderTL[0] = { ...SYNTHETIC_MASTER_TIMELINE[1], virtualTime: 0 };
      outOfOrderTL[1] = { ...SYNTHETIC_MASTER_TIMELINE[0], virtualTime: 350 };

      const val = validateForensicTimelineEvidence(outOfOrderTL);
      expect(val.valid).toBe(false);
      expect(val.outOfOrderStages.length).toBeGreaterThan(0);
    });

    it('missing log tamper stage fails validation', () => {
      const noLogTamperTL = SYNTHETIC_MASTER_TIMELINE.filter((e) => e.id !== 'TL-09-LOG-TAMPER');
      const val = validateForensicTimelineEvidence(noLogTamperTL);
      expect(val.valid).toBe(false);
      expect(val.missingStages).toContain('LOG_TAMPER');
    });

    it('missing evidence link on a required stage fails validation', () => {
      const noLinkTL = SYNTHETIC_MASTER_TIMELINE.map((e) =>
        e.id === 'TL-01-AUTH-FAIL' ? { ...e, evidenceIds: [] } : e
      );
      const val = validateForensicTimelineEvidence(noLinkTL);
      expect(val.valid).toBe(false);
      expect(val.missingEvidenceLinkStages).toContain('AUTH_FAILURE');
    });
  });

  describe('Evidence-Backed Root Cause Negative Tests', () => {
    it('complete evidence-backed finding passes validation', () => {
      const finding: RootCauseFinding = {
        initialAccessVector: 'Brute-force Kerberos spray',
        affectedIdentity: 'sara',
        affectedHost: 'FIN-WS-01',
        privilegeChange: 'Domain Admins',
        impactedResources: ['\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx'],
        evidenceIds: ['EVD-LOG-WIN-SEC', 'EVD-NET-PCAP-01', 'EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01'],
      };
      const collected = ['EVD-LOG-WIN-SEC', 'EVD-NET-PCAP-01', 'EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01'];
      const res = evaluateRootCauseFinding(finding, collected);
      expect(res.valid).toBe(true);
      expect(res.unsupportedClaims).toHaveLength(0);
    });

    it('3 unrelated evidence items fail root cause validation', () => {
      const finding: RootCauseFinding = {
        initialAccessVector: 'Brute-force Kerberos spray',
        impactedResources: ['Q3_Report.xlsx'],
        evidenceIds: ['EVD-UNRELATED-1', 'EVD-UNRELATED-2', 'EVD-UNRELATED-3'],
      };
      const collected = ['EVD-UNRELATED-1', 'EVD-UNRELATED-2', 'EVD-UNRELATED-3'];
      const res = evaluateRootCauseFinding(finding, collected);
      expect(res.valid).toBe(false);
      expect(res.unsupportedClaims).toContain('initialAccess');
    });

    it('initial access unsupported fails validation', () => {
      const finding: RootCauseFinding = {
        initialAccessVector: 'Brute-force Kerberos spray',
        impactedResources: ['Q3_Report.xlsx'],
        evidenceIds: ['EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01', 'EVD-BROWSER-HIST'], // missing EVD-LOG-WIN-SEC / EVD-NET-PCAP-01
      };
      const collected = ['EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01', 'EVD-BROWSER-HIST'];
      const res = evaluateRootCauseFinding(finding, collected);
      expect(res.valid).toBe(false);
      expect(res.unsupportedClaims).toContain('initialAccess');
    });

    it('privilege escalation unsupported fails validation', () => {
      const finding: RootCauseFinding = {
        initialAccessVector: 'Brute-force Kerberos spray',
        impactedResources: ['Q3_Report.xlsx'],
        evidenceIds: ['EVD-NET-PCAP-01', 'EVD-MEM-FIN-WS01', 'EVD-BROWSER-HIST'], // missing EVD-LOG-WIN-SEC / EVD-DISK-FIN-WS01
      };
      const collected = ['EVD-NET-PCAP-01', 'EVD-MEM-FIN-WS01', 'EVD-BROWSER-HIST'];
      const res = evaluateRootCauseFinding(finding, collected);
      expect(res.valid).toBe(false);
      expect(res.unsupportedClaims).toContain('privilegeChange');
    });

    it('Finance impact unsupported fails validation', () => {
      const finding: RootCauseFinding = {
        initialAccessVector: 'Brute-force Kerberos spray',
        impactedResources: ['Q3_Report.xlsx'],
        evidenceIds: ['EVD-LOG-WIN-SEC', 'EVD-NET-PCAP-01', 'EVD-MEM-FIN-WS01'], // missing EVD-DISK-FIN-WS01
      };
      const collected = ['EVD-LOG-WIN-SEC', 'EVD-NET-PCAP-01', 'EVD-MEM-FIN-WS01'];
      const res = evaluateRootCauseFinding(finding, collected);
      expect(res.valid).toBe(false);
      expect(res.unsupportedClaims).toContain('impactedResource');
    });
  });

  describe('Master Challenge Initial & Solved State Validation', () => {
    it('initial challenge state starts UNSOLVED (0 points)', () => {
      const initial = getInitialForensicsChallengeState();
      expect(initial.caseOpened).toBe(false);
      expect(initial.acquiredEvidence).toHaveLength(0);

      const val = validateForensicInvestigationState(initial);
      expect(val.success).toBe(false);
      expect(val.score).toBeLessThan(100);
    });

    it('solved master challenge state passes 100% (100 points)', () => {
      const solved = getSolvedForensicsMasterState();
      const val = validateForensicInvestigationState(solved);
      expect(val.success).toBe(true);
      expect(val.score).toBe(100);
      expect(val.failedChecks).toHaveLength(0);
    });
  });

  describe('Recovery Validation', () => {
    it('passes when all security and business recovery checks are satisfied', () => {
      const state: SystemRecoveryState = {
        compromisedAccountReset: true,
        unauthorizedPrivilegesReverted: true,
        suspiciousProcessesTerminated: true,
        maliciousFilesEradicated: true,
        auditLoggingEnabled: true,
        networkSecurityPoliciesApplied: true,
        businessApplicationTested: true,
        lingeringSuspiciousState: false,
      };
      const res = validateRecoveryState(state);
      expect(res.passed).toBe(true);
    });

    it('fails when audit logging is disabled or suspicious state lingers', () => {
      const state: SystemRecoveryState = {
        compromisedAccountReset: true,
        unauthorizedPrivilegesReverted: true,
        suspiciousProcessesTerminated: true,
        maliciousFilesEradicated: true,
        auditLoggingEnabled: false, // disabled!
        networkSecurityPoliciesApplied: true,
        businessApplicationTested: true,
        lingeringSuspiciousState: true, // lingering!
      };
      const res = validateRecoveryState(state);
      expect(res.passed).toBe(false);
      expect(res.failedChecksEn.length).toBeGreaterThanOrEqual(2);
    });
  });
});
