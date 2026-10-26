import { describe, it, expect, beforeEach } from 'vitest';
import { useThreatHuntingStore } from '../../simulations/threat/runtime/threatHuntingStore';
import { HUNT_SCENARIOS } from '../../simulations/threat/logic/scenarios';
import {
  validateCustodyChain,
  getCustodyHistory,
  calculateCustodyLedgerHash,
  verifyCustodyLedgerTamperResistance,
  CustodyRecord,
} from '../../simulations/forensics/logic/custody';
import { calculateEvidenceHash, canonicalSerialize, sha256Bytes } from '../../simulations/forensics/logic/hashing';

describe('OMEGA MAX — Deep Security Audit & Integrity Guardrails', () => {
  beforeEach(() => {
    // Reset threat hunting store to default scenario (HUNT-01)
    const store = useThreatHuntingStore.getState();
    store.setActiveHunt('HUNT-01');
    useThreatHuntingStore.setState({
      findings: [],
      detections: [],
      detectionResults: {},
      socHandoffs: [],
      forensicsHandoffs: [],
    });
  });

  describe('1. Threat Hunting: Finding Validation Strict Prerequisites', () => {
    it('rejects validateFinding when finding contains fewer than 2 supporting events', () => {
      const store = useThreatHuntingStore.getState();
      const validEvent = store.telemetryEvents[0];

      // Add finding with only 1 valid event
      store.addFinding({
        titleEn: 'Single Signal Finding',
        titleAr: 'نتيجة بإشارة واحدة',
        summaryEn: 'Summary',
        summaryAr: 'ملخص',
        severity: 'warn',
        eventIds: [validEvent.id],
        rawEventIds: [validEvent.rawEventId || validEvent.id],
        entityRefs: [],
        status: 'OPEN',
        whyEn: 'Why',
        whyAr: 'سبب',
      });

      const findingId = useThreatHuntingStore.getState().findings[0].id;
      const validationPassed = useThreatHuntingStore.getState().validateFinding(findingId);

      expect(validationPassed).toBe(false);
      expect(useThreatHuntingStore.getState().findings[0].status).toBe('OPEN');
    });

    it('rejects validateFinding when finding references events outside active telemetry', () => {
      const store = useThreatHuntingStore.getState();
      const validEvent = store.telemetryEvents[0];

      // Add finding with 1 valid and 1 foreign/unverified event
      store.addFinding({
        titleEn: 'Foreign Event Finding',
        titleAr: 'نتيجة بحدث خارجي',
        summaryEn: 'Summary',
        summaryAr: 'ملخص',
        severity: 'threat',
        eventIds: [validEvent.id, 'FOREIGN-EVENT-NON-EXISTENT'],
        rawEventIds: [validEvent.rawEventId || validEvent.id],
        entityRefs: [],
        status: 'OPEN',
        whyEn: 'Why',
        whyAr: 'سبب',
      });

      const findingId = useThreatHuntingStore.getState().findings[0].id;
      const validationPassed = useThreatHuntingStore.getState().validateFinding(findingId);

      expect(validationPassed).toBe(false);
      expect(useThreatHuntingStore.getState().findings[0].status).toBe('OPEN');
    });

    it('rejects validateFinding when finding belongs to a different hunt than active hunt', () => {
      const store = useThreatHuntingStore.getState();
      const validEvents = store.telemetryEvents.slice(0, 2);

      // Force create a finding belonging to HUNT-02 while active is HUNT-01
      useThreatHuntingStore.setState({
        findings: [
          {
            id: 'FIND-HUNT-02-SPOOF',
            huntId: 'HUNT-02',
            titleEn: 'HUNT 02 Finding',
            titleAr: 'نتيجة تحقيق 02',
            summaryEn: 'S',
            summaryAr: 'S',
            severity: 'threat',
            eventIds: [validEvents[0].id, validEvents[1].id],
            rawEventIds: [validEvents[0].rawEventId || validEvents[0].id, validEvents[1].rawEventId || validEvents[1].id],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 80,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 15 },
            status: 'OPEN',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 10,
          },
        ],
      });

      const validationPassed = useThreatHuntingStore.getState().validateFinding('FIND-HUNT-02-SPOOF');
      expect(validationPassed).toBe(false);
      expect(useThreatHuntingStore.getState().findings[0].status).toBe('OPEN');
    });

    it('approves validateFinding when finding meets all telemetry, diversity, and hunt ownership requirements', () => {
      const store = useThreatHuntingStore.getState();
      const validEvents = store.telemetryEvents.slice(0, 2);

      store.addFinding({
        titleEn: 'Valid Correlated Finding',
        titleAr: 'نتيجة مترابطة سليمة',
        summaryEn: 'Summary',
        summaryAr: 'ملخص',
        severity: 'threat',
        eventIds: [validEvents[0].id, validEvents[1].id],
        rawEventIds: [validEvents[0].rawEventId || validEvents[0].id, validEvents[1].rawEventId || validEvents[1].id],
        entityRefs: [],
        status: 'OPEN',
        whyEn: 'Why',
        whyAr: 'سبب',
      });

      const findingId = useThreatHuntingStore.getState().findings[0].id;
      const validationPassed = useThreatHuntingStore.getState().validateFinding(findingId);

      expect(validationPassed).toBe(true);
      expect(useThreatHuntingStore.getState().findings[0].status).toBe('VALIDATED');
    });

    it('does not retain invalid event IDs as fallback in addFinding when events are absent', () => {
      const store = useThreatHuntingStore.getState();

      store.addFinding({
        titleEn: 'Bogus Events Only',
        titleAr: 'أحداث غير موجودة فقط',
        summaryEn: 'Summary',
        summaryAr: 'ملخص',
        severity: 'warn',
        eventIds: ['BOGUS-EVT-1', 'BOGUS-EVT-2'],
        rawEventIds: ['bogus-raw-1'],
        entityRefs: [],
        status: 'OPEN',
        whyEn: 'Why',
        whyAr: 'سبب',
      });

      const recordedFinding = useThreatHuntingStore.getState().findings[0];
      // Invalid IDs must NOT be preserved as fallback
      expect(recordedFinding.eventIds).toHaveLength(0);
      expect(recordedFinding.rawEventIds).toHaveLength(0);
      expect(recordedFinding.confidenceBreakdown.signalCountScore).toBe(0);
    });
  });

  describe('2. Detection Engineering: SOC Publishing Guardrails', () => {
    it('throws error when attempting to publish an unvalidated detection rule to SOC', () => {
      const store = useThreatHuntingStore.getState();
      const ruleId = store.addDetectionRule({
        nameEn: 'Untested Rule',
        nameAr: 'قاعدة غير مختبرة',
        descriptionEn: '',
        descriptionAr: '',
        severity: 'HIGH',
        dataSources: ['WINDOWS'],
        conditions: [],
        mitreTechniques: [],
        status: 'DRAFT',
        ruleType: 'SINGLE_EVENT',
      });

      expect(() => {
        useThreatHuntingStore.getState().publishDetectionRuleToSoc(ruleId);
      }).toThrow(/has not been tested or validated/);
    });

    it('throws error when attempting to publish a rule with false positives to SOC', () => {
      const store = useThreatHuntingStore.getState();
      const ruleId = store.addDetectionRule({
        nameEn: 'Noisy Rule',
        nameAr: 'قاعدة بها إنذارات كاذبة',
        descriptionEn: '',
        descriptionAr: '',
        severity: 'HIGH',
        dataSources: ['WINDOWS'],
        conditions: [],
        mitreTechniques: [],
        status: 'TESTING',
        ruleType: 'SINGLE_EVENT',
      });

      // Inject validation result with false positives > 0
      useThreatHuntingStore.setState({
        detectionResults: {
          [ruleId]: {
            ruleId,
            totalEvaluated: 10,
            matchedEventIds: [store.telemetryEvents[0].id],
            truePositives: 2,
            falsePositives: 1, // Has false positive!
            benignMatches: ['benign-1'],
            maliciousMatches: [store.telemetryEvents[0].id],
            precision: 0.67,
            recall: 1.0,
            isValid: false,
            tuningAdviceEn: 'Filter benign activity',
            tuningAdviceAr: 'قم بفلترة النشاط الحميد',
          },
        },
      });

      expect(() => {
        useThreatHuntingStore.getState().publishDetectionRuleToSoc(ruleId);
      }).toThrow(/failed required validation criteria/);
    });

    it('throws error when attempting to publish a rule belonging to another hunt', () => {
      const ruleId = 'DET-HUNT-02-RULE';
      useThreatHuntingStore.setState({
        detections: [
          {
            id: ruleId,
            huntId: 'HUNT-02', // Foreign hunt!
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
          [ruleId]: {
            ruleId,
            totalEvaluated: 5,
            matchedEventIds: ['ev-1'],
            truePositives: 1,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: ['ev-1'],
            precision: 1.0,
            recall: 1.0,
            isValid: true,
            tuningAdviceEn: '',
            tuningAdviceAr: '',
          },
        },
      });

      expect(() => {
        useThreatHuntingStore.getState().publishDetectionRuleToSoc(ruleId);
      }).toThrow(/belongs to HUNT-02, not active hunt HUNT-01/);
    });

    it('successfully publishes a verified rule with 0 false positives belonging to the active hunt', () => {
      const store = useThreatHuntingStore.getState();
      const validEvent = store.telemetryEvents[0];
      const ruleId = store.addDetectionRule({
        nameEn: 'Perfect Rule',
        nameAr: 'قاعدة مثالية',
        descriptionEn: '',
        descriptionAr: '',
        severity: 'HIGH',
        dataSources: ['WINDOWS'],
        conditions: [],
        mitreTechniques: [],
        status: 'VALIDATED',
        ruleType: 'SINGLE_EVENT',
      });

      useThreatHuntingStore.setState({
        detectionResults: {
          [ruleId]: {
            ruleId,
            totalEvaluated: 10,
            matchedEventIds: [validEvent.id],
            truePositives: 2,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: [validEvent.id],
            precision: 1.0,
            recall: 1.0,
            isValid: true,
            tuningAdviceEn: '',
            tuningAdviceAr: '',
          },
        },
      });

      useThreatHuntingStore.getState().publishDetectionRuleToSoc(ruleId);

      const published = useThreatHuntingStore.getState().detections.find((d) => d.id === ruleId);
      expect(published?.status).toBe('PUBLISHED');
      expect(published?.publishedToSocAtVirtualTime).toBe(200);
    });
  });

  describe('3. SOC & Forensics Handoff Integrity', () => {
    it('throws error when dispatching unvalidated finding to SOC', () => {
      const store = useThreatHuntingStore.getState();
      const validEvents = store.telemetryEvents.slice(0, 2);

      store.addFinding({
        titleEn: 'Draft Finding',
        titleAr: 'مسودة نتيجة',
        summaryEn: 'S',
        summaryAr: 'S',
        severity: 'threat',
        eventIds: [validEvents[0].id, validEvents[1].id],
        rawEventIds: [validEvents[0].rawEventId || validEvents[0].id, validEvents[1].rawEventId || validEvents[1].id],
        entityRefs: [],
        status: 'OPEN', // Not validated!
        whyEn: '',
        whyAr: '',
      });

      const findingId = useThreatHuntingStore.getState().findings[0].id;
      expect(() => {
        useThreatHuntingStore.getState().dispatchSocHandoff(findingId);
      }).toThrow(/Cannot dispatch unvalidated finding/);
    });

    it('throws error when dispatching unvalidated finding to Forensics', () => {
      const store = useThreatHuntingStore.getState();
      const validEvents = store.telemetryEvents.slice(0, 2);

      store.addFinding({
        titleEn: 'Draft Finding',
        titleAr: 'مسودة نتيجة',
        summaryEn: 'S',
        summaryAr: 'S',
        severity: 'threat',
        eventIds: [validEvents[0].id, validEvents[1].id],
        rawEventIds: [validEvents[0].rawEventId || validEvents[0].id, validEvents[1].rawEventId || validEvents[1].id],
        entityRefs: [],
        status: 'OPEN',
        whyEn: '',
        whyAr: '',
      });

      const findingId = useThreatHuntingStore.getState().findings[0].id;
      expect(() => {
        useThreatHuntingStore.getState().dispatchForensicsHandoff(findingId);
      }).toThrow(/Cannot dispatch unvalidated finding/);
    });

    it('successfully dispatches SOC and Forensics handoffs when finding is validated', () => {
      const store = useThreatHuntingStore.getState();
      const validEvents = store.telemetryEvents.slice(0, 2);

      store.addFinding({
        titleEn: 'Validated Finding',
        titleAr: 'نتيجة معتمدة',
        summaryEn: 'S',
        summaryAr: 'S',
        severity: 'threat',
        eventIds: [validEvents[0].id, validEvents[1].id],
        rawEventIds: [validEvents[0].rawEventId || validEvents[0].id, validEvents[1].rawEventId || validEvents[1].id],
        entityRefs: [],
        status: 'OPEN',
        whyEn: '',
        whyAr: '',
      });

      const findingId = useThreatHuntingStore.getState().findings[0].id;
      useThreatHuntingStore.getState().validateFinding(findingId);

      const socHandoff = useThreatHuntingStore.getState().dispatchSocHandoff(findingId);
      expect(socHandoff.status).toBe('DISPATCHED');
      expect(socHandoff.findingId).toBe(findingId);

      const forHandoff = useThreatHuntingStore.getState().dispatchForensicsHandoff(findingId);
      expect(forHandoff.findingId).toBe(findingId);
      expect(forHandoff.evidenceList.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Chain of Custody Real Retrieval & Authorization', () => {
    it('returns actual matching records from getCustodyHistory instead of empty array', () => {
      const customLedger: CustodyRecord[] = [
        {
          id: 'CUST-EVD-01-1',
          evidenceId: 'EVD-DISK-SAMPLE',
          virtualTime: 10,
          action: 'COLLECTED',
          actor: 'Investigator Sara',
          notes: 'Acquired',
        },
        {
          id: 'CUST-EVD-01-2',
          evidenceId: 'EVD-DISK-SAMPLE',
          virtualTime: 20,
          action: 'VERIFIED',
          actor: 'Evidence Officer Ahmed',
          notes: 'Verified',
        },
        {
          id: 'CUST-EVD-02-1',
          evidenceId: 'EVD-OTHER-ITEM',
          virtualTime: 15,
          action: 'COLLECTED',
          actor: 'Investigator Sara',
          notes: 'Other item',
        },
      ];

      const history = getCustodyHistory('EVD-DISK-SAMPLE', customLedger);
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('CUST-EVD-01-1');
      expect(history[1].id).toBe('CUST-EVD-01-2');
    });

    it('returns empty array when querying an unknown evidence ID in getCustodyHistory', () => {
      const history = getCustodyHistory('EVD-NON-EXISTENT-XYZ');
      expect(history).toHaveLength(0);
    });

    it('rejects custody chain when actor is unauthorized or anonymous (unknown, attacker, anonymous)', () => {
      const badRecords: CustodyRecord[] = [
        {
          id: 'CUST-1',
          evidenceId: 'EVD-01',
          virtualTime: 10,
          action: 'COLLECTED',
          actor: 'Investigator Sara',
          notes: 'Acquired',
        },
        {
          id: 'CUST-2',
          evidenceId: 'EVD-01',
          virtualTime: 20,
          action: 'TRANSFERRED',
          actor: 'anonymous', // Explicit anonymous actor
          notes: 'Transferred anonymously',
        },
      ];

      const res = validateCustodyChain('EVD-01', badRecords, 'hash', 'hash');
      expect(res.valid).toBe(false);
      expect(res.reasonsEn.some((r) => r.includes('Unauthorized or unauthenticated actor'))).toBe(true);
    });

    it('rejects custody chain when initial action is not COLLECTED', () => {
      const illegalStartRecords: CustodyRecord[] = [
        {
          id: 'CUST-1',
          evidenceId: 'EVD-02',
          virtualTime: 10,
          action: 'ANALYZED', // Began with ANALYZED without prior collection!
          actor: 'Examiner Reem',
          notes: 'Premature analysis',
        },
      ];

      const res = validateCustodyChain('EVD-02', illegalStartRecords, 'hash', 'hash');
      expect(res.valid).toBe(false);
      expect(res.reasonsEn.some((r) => r.includes('must be COLLECTED'))).toBe(true);
    });
  });

  describe('5. Cryptographic Custody Ledger Immutability & Tamper Resistance', () => {
    it('computes deterministic SHA-256 style hash for custody ledger and detects record tampering', () => {
      const ledger: CustodyRecord[] = [
        {
          id: 'CUST-1',
          evidenceId: 'EVD-TEST-VAULT',
          virtualTime: 10,
          action: 'COLLECTED',
          actor: 'Investigator Sara',
          notes: 'Vault acquisition',
        },
        {
          id: 'CUST-2',
          evidenceId: 'EVD-TEST-VAULT',
          virtualTime: 25,
          action: 'VERIFIED',
          actor: 'Officer Ahmed',
          notes: 'Hash check',
        },
      ];

      const originalLedgerHash = calculateCustodyLedgerHash(ledger);
      expect(originalLedgerHash).toMatch(/^sha256:[a-f0-9]{32,64}$/);

      // Verify legitimate proof
      const proof = verifyCustodyLedgerTamperResistance('EVD-TEST-VAULT', ledger, originalLedgerHash);
      expect(proof.isTamperEvident).toBe(true);
      expect(proof.recordCount).toBe(2);

      // Attacker tampers with the notes or timestamp of a custody record
      const tamperedLedger = ledger.map((r, idx) =>
        idx === 1 ? { ...r, notes: 'Tampered notes: altered evidence chain' } : r
      );

      const tamperedProof = verifyCustodyLedgerTamperResistance('EVD-TEST-VAULT', tamperedLedger, originalLedgerHash);
      expect(tamperedProof.isTamperEvident).toBe(false);
      expect(tamperedProof.reasonEn).toContain('Custody ledger alteration detected');
    });

    it('clarifies distinction between evidence content hash and custody ledger chain hash', () => {
      const evidenceMetadata = { sourceWorld: 'WINDOWS', rawEventId: 'raw-100', host: 'FIN-WS-01' };
      const contentHash = calculateEvidenceHash(evidenceMetadata);

      const custodyRecords: CustodyRecord[] = [
        {
          id: 'CUST-1',
          evidenceId: 'EVD-FIN-100',
          virtualTime: 10,
          action: 'COLLECTED',
          actor: 'Sara',
          notes: 'Initial',
        },
      ];
      const ledgerHash = calculateCustodyLedgerHash(custodyRecords);

      // Both are valid SHA-256 deterministic hashes but protect distinct aspects:
      // contentHash protects artifact content / metadata
      // ledgerHash protects the custody transfer ledger sequence
      expect(contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(ledgerHash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(contentHash).not.toBe(ledgerHash);
    });

    it('verifies standard NIST SHA-256 test vectors, Arabic UTF-8, and block boundaries', () => {
      // Test raw byte SHA-256 function against NIST vectors
      const rawEmptyHash = sha256Bytes(new Uint8Array(0));
      expect(rawEmptyHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

      const rawAbcHash = sha256Bytes(new TextEncoder().encode('abc'));
      expect(rawAbcHash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

      // Test calculateEvidenceHash for tagged canonical strings
      const emptyHash = calculateEvidenceHash('');
      expect(emptyHash).toMatch(/^sha256:[a-f0-9]{64}$/);

      const abcHash = calculateEvidenceHash('abc');
      expect(abcHash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(abcHash).not.toBe(emptyHash);

      // Arabic Unicode string UTF-8 encoding verification
      const arabicText = 'دليل جنائي رقمي - محاكاة نكسورا الأمنية';
      const arabicHash = calculateEvidenceHash(arabicText);
      expect(arabicHash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(calculateEvidenceHash(arabicText)).toBe(arabicHash);

      // Block boundary sizes: 55 bytes, 56 bytes, 64 bytes, 65 bytes
      const b55 = 'A'.repeat(55);
      const b56 = 'A'.repeat(56);
      const b64 = 'A'.repeat(64);
      const b65 = 'A'.repeat(65);
      expect(calculateEvidenceHash(b55)).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(calculateEvidenceHash(b56)).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(calculateEvidenceHash(b64)).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(calculateEvidenceHash(b65)).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it('canonicalSerialize produces distinct representations for null, undefined, NaN, and Infinity', () => {
      expect(canonicalSerialize(null)).toBe('{"$t":"null"}');
      expect(canonicalSerialize(undefined)).toBe('{"$t":"undefined"}');
      expect(canonicalSerialize(NaN)).toBe('{"$t":"NaN"}');
      expect(canonicalSerialize(Infinity)).toBe('{"$t":"+Inf"}');
      expect(canonicalSerialize(-Infinity)).toBe('{"$t":"-Inf"}');

      // Ensure objects with null vs undefined vs NaN produce distinct serialized representations
      const objNull = { val: null };
      const objUndefined = { val: undefined };
      const objNaN = { val: NaN };
      const objStrNull = { val: 'null' };
      const objStrUndefined = { val: 'undefined' };

      expect(canonicalSerialize(objNull)).not.toBe(canonicalSerialize(objUndefined));
      expect(canonicalSerialize(objNull)).not.toBe(canonicalSerialize(objNaN));
      expect(canonicalSerialize(objUndefined)).not.toBe(canonicalSerialize(objNaN));
      expect(canonicalSerialize(objNull)).not.toBe(canonicalSerialize(objStrNull));
      expect(canonicalSerialize(objUndefined)).not.toBe(canonicalSerialize(objStrUndefined));
    });

    it('rejects tamper verification when expected baseline hash is missing or ledger is empty', () => {
      const ledger: CustodyRecord[] = [
        {
          id: 'CUST-1',
          evidenceId: 'EVD-100',
          virtualTime: 10,
          action: 'COLLECTED',
          actor: 'Investigator Sara',
          notes: 'Initial',
        },
      ];

      // Missing baseline hash MUST NOT evaluate to true
      const noBaselineRes = verifyCustodyLedgerTamperResistance('EVD-100', ledger, undefined);
      expect(noBaselineRes.isTamperEvident).toBe(false);
      expect(noBaselineRes.hasVerifiedBaseline).toBe(false);
      expect(noBaselineRes.reasonEn).toContain('Missing expected baseline hash');

      // Empty ledger MUST NOT evaluate to true
      const emptyRes = verifyCustodyLedgerTamperResistance('EVD-NON-EXISTENT', [], 'sha256:abc');
      expect(emptyRes.isTamperEvident).toBe(false);
      expect(emptyRes.hasVerifiedBaseline).toBe(false);
      expect(emptyRes.reasonEn).toContain('No custody records found');
    });
  });
});
