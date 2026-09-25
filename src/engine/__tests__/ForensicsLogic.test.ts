import { describe, it, expect } from 'vitest';
import { calculateEvidenceHash, verifyEvidenceIntegrity } from '../../simulations/forensics/logic/hashing';
import { addCustodyRecord, validateCustodyChain, CustodyRecord } from '../../simulations/forensics/logic/custody';
import { listFiles, findFilesByExtension, findRecentlyModifiedFiles, findDeletedArtifacts, inspectFileMetadata } from '../../simulations/forensics/logic/disk';
import { listMemoryProcesses, findSuspiciousProcessRelationships, listActiveConnections, findOrphanProcesses } from '../../simulations/forensics/logic/memory';
import { buildForensicTimeline, sortTimeline, validateTimelineContinuity, findTimelineGaps } from '../../simulations/forensics/logic/timeline';
import { evaluateRootCauseFinding, RootCauseFinding } from '../../simulations/forensics/logic/rootCause';
import { validateRecoveryState, SystemRecoveryState } from '../../simulations/forensics/logic/recovery';
import { validateForensicInvestigationState, ForensicsMasterState } from '../../simulations/forensics/logic/hardening';

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

  describe('Timeline Reconstruction', () => {
    it('builds and validates continuous attack timeline sequence', () => {
      const tl = buildForensicTimeline();
      expect(tl.length).toBeGreaterThanOrEqual(8);

      const val = validateTimelineContinuity(tl);
      expect(val.continuous).toBe(true);
    });
  });

  describe('Evidence-Backed Root Cause Analysis', () => {
    it('passes when root cause is supported by collected evidence', () => {
      const finding: RootCauseFinding = {
        initialAccessVector: 'Brute-force Kerberos spray',
        impactedResources: ['\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx'],
        evidenceIds: ['EVD-1', 'EVD-2', 'EVD-3'],
      };
      const collected = ['EVD-1', 'EVD-2', 'EVD-3', 'EVD-4'];
      const res = evaluateRootCauseFinding(finding, collected);
      expect(res.valid).toBe(true);
    });

    it('fails when root cause claims missing evidence', () => {
      const finding: RootCauseFinding = {
        initialAccessVector: 'Brute-force Kerberos spray',
        impactedResources: ['\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx'],
        evidenceIds: ['EVD-MISSING-1', 'EVD-MISSING-2'],
      };
      const res = evaluateRootCauseFinding(finding, ['EVD-1']);
      expect(res.valid).toBe(false);
      expect(res.missingEvidenceCount).toBe(2);
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
