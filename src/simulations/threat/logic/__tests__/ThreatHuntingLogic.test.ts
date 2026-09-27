import { describe, it, expect, beforeEach } from 'vitest';
import { ThreatHuntQueryEngine } from '../queryEngine';
import { ThreatCorrelationEngine } from '../correlationEngine';
import { ThreatIntelMatcher, SIMULATION_THREAT_INDICATORS } from '../threatIntel';
import { DetectionEngine } from '../detectionEngine';
import { ThreatHandoffBridge } from '../handoff';
import { ThreatHuntValidator, ValidationState } from '../validators';
import { HUNT_SCENARIOS } from '../scenarios';
import { SecurityTelemetryEvent } from '../../../soc/logic/telemetry';
import { DetectionRule, HuntFinding } from '../types';

describe('OMEGA V16 — Threat Hunting Logic Suite', () => {
  const scenario1 = HUNT_SCENARIOS['HUNT-01'];
  const testEvents = scenario1.events;

  describe('1. Safe Query Engine', () => {
    it('executes equality query accurately', () => {
      const result = ThreatHuntQueryEngine.execute('sourceWorld = WINDOWS', testEvents);
      expect(result.error).toBeUndefined();
      expect(result.matchedCount).toBeGreaterThan(0);
      expect(result.events.every((e) => e.sourceWorld === 'WINDOWS')).toBe(true);
    });

    it('handles IN operator with multiple values', () => {
      const result = ThreatHuntQueryEngine.execute('eventType IN (WIN_4625, KERBEROS_AS_REQ_FAILED)', testEvents);
      expect(result.error).toBeUndefined();
      expect(result.matchedCount).toBeGreaterThan(0);
      expect(
        result.events.every((e) => ['WIN_4625', 'KERBEROS_AS_REQ_FAILED'].includes(e.eventType))
      ).toBe(true);
    });

    it('handles CONTAINS operator', () => {
      const result = ThreatHuntQueryEngine.execute('host CONTAINS "FIN"', testEvents);
      expect(result.error).toBeUndefined();
      expect(result.matchedCount).toBeGreaterThan(0);
      expect(result.events.every((e) => e.host?.includes('FIN'))).toBe(true);
    });

    it('handles BETWEEN numeric range operator', () => {
      const result = ThreatHuntQueryEngine.execute('virtualTime BETWEEN 50 AND 120', testEvents);
      expect(result.error).toBeUndefined();
      expect(result.matchedCount).toBeGreaterThan(0);
      expect(result.events.every((e) => e.virtualTime >= 50 && e.virtualTime <= 120)).toBe(true);
    });

    it('handles compound logical AND and OR operators with parentheses', () => {
      const result = ThreatHuntQueryEngine.execute(
        '(sourceWorld = WINDOWS AND outcome = FAILURE) OR (sourceWorld = IDENTITY AND outcome = SUCCESS)',
        testEvents
      );
      expect(result.error).toBeUndefined();
      expect(result.matchedCount).toBeGreaterThan(0);
    });

    it('returns structured syntax error for malformed queries without crashing', () => {
      const result = ThreatHuntQueryEngine.execute('sourceWorld = "unclosed quote', testEvents);
      expect(result.error).toBeDefined();
      expect(result.matchedCount).toBe(0);
    });
  });

  describe('2. Behavioral Correlation Engine & Entity Pivoting', () => {
    it('clusters sequential events by shared user and time proximity', () => {
      const clusters = ThreatCorrelationEngine.correlateEvents(testEvents, 300);
      expect(clusters.length).toBeGreaterThan(0);

      const saraCluster = clusters.find((c) => c.commonEntities.user === 'sara');
      expect(saraCluster).toBeDefined();
      expect(saraCluster?.eventIds.length).toBeGreaterThanOrEqual(4);
      expect(saraCluster?.sourceWorlds).toContain('WINDOWS');
      expect(saraCluster?.sourceWorlds).toContain('IDENTITY');
    });

    it('pivots entity across multiple source worlds', () => {
      const summary = ThreatCorrelationEngine.pivotEntity(
        { type: 'USER', value: 'sara' },
        testEvents
      );

      expect(summary.totalEvents).toBeGreaterThanOrEqual(5);
      expect(summary.sourceWorlds).toContain('WINDOWS');
      expect(summary.sourceWorlds).toContain('IDENTITY');
      expect(summary.associatedEntities.some((e) => e.type === 'HOST' && e.value === 'FIN-WS-01')).toBe(true);
      expect(summary.associatedEntities.some((e) => e.type === 'IP' && e.value === '203.0.113.55')).toBe(true);
    });

    it('builds entity relationship graph nodes and edges', () => {
      const graph = ThreatCorrelationEngine.buildEntityGraph(testEvents);
      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges.length).toBeGreaterThan(0);

      const userNode = graph.nodes.find((n) => n.label === 'sara');
      expect(userNode).toBeDefined();
      expect(userNode?.type).toBe('USER');

      const authEdge = graph.edges.find((e) => e.relationship === 'AUTHENTICATED_TO');
      expect(authEdge).toBeDefined();
    });
  });

  describe('3. Threat Intelligence Knowledge Layer', () => {
    it('matches known IP IOCs against normalized telemetry', () => {
      const matched = ThreatIntelMatcher.matchTelemetry(SIMULATION_THREAT_INDICATORS, testEvents);
      const ipIndicator = matched.find((i) => i.id === 'INTEL-IOC-001');

      expect(ipIndicator).toBeDefined();
      expect(ipIndicator?.matchedEventIds?.length).toBeGreaterThan(0);
      expect(ipIndicator?.actorName).toBe('SILVER_JACKAL (APT-NEX-01)');
    });

    it('matches behavioral IOA patterns', () => {
      const matched = ThreatIntelMatcher.matchTelemetry(SIMULATION_THREAT_INDICATORS, testEvents);
      const ioaIndicator = matched.find((i) => i.id === 'INTEL-IOA-005');

      expect(ioaIndicator).toBeDefined();
      expect(ioaIndicator?.matchedEventIds?.length).toBeGreaterThan(0);
    });
  });

  describe('4. Detection Engineering & Tuning', () => {
    const draftRule: DetectionRule = {
      id: 'DET-TEST-01',
      nameEn: 'Auth Failure Rule',
      nameAr: 'قاعدة إخفاقات الدخول',
      descriptionEn: 'Detects repetitive login failures',
      descriptionAr: 'رصد إخفاقات الدخول',
      severity: 'HIGH',
      dataSources: ['WINDOWS', 'IDENTITY'],
      conditions: [
        { field: 'category', operator: 'EQUALS', value: 'AUTHENTICATION' },
        { field: 'outcome', operator: 'EQUALS', value: 'FAILURE' },
      ],
      mitreTechniques: ['T1110'],
      status: 'TESTING',
      ruleType: 'THRESHOLD',
      threshold: 3,
      windowVirtualSeconds: 120,
      createdAtVirtualTime: 0,
    };

    it('evaluates rule and identifies benign false positive noise', () => {
      const result = DetectionEngine.validateRule(draftRule, testEvents);
      // Untuned rule catches both IT admin and attack traffic
      expect(result.totalEvaluated).toBe(testEvents.length);
      expect(result.truePositives).toBeGreaterThan(0);
      expect(result.falsePositives).toBeGreaterThan(0);
      expect(result.isValid).toBe(false); // Fails because of false positives
    });

    it('tunes rule with exclusions and eliminates noise completely', () => {
      const tunedRule: DetectionRule = {
        ...draftRule,
        threshold: 5,
        exclusions: {
          hosts: ['IT-MGMT-01'],
          users: ['it_admin_rob'],
        },
      };

      const result = DetectionEngine.validateRule(tunedRule, testEvents);
      expect(result.truePositives).toBeGreaterThanOrEqual(5);
      expect(result.falsePositives).toBe(0);
      expect(result.isValid).toBe(true);
      expect(result.precision).toBe(1.0);
    });
  });

  describe('5. SOC & Forensics Handoff Pipeline', () => {
    const sampleFinding: HuntFinding = {
      id: 'FIND-TEST-01',
      huntId: 'HUNT-01',
      titleEn: 'Credential Compromise',
      titleAr: 'اختراق بيانات الاعتماد',
      summaryEn: 'Attacker compromised sara after brute force',
      summaryAr: 'المهاجم اخترق حساب sara',
      severity: 'threat',
      eventIds: [testEvents[2].id, testEvents[testEvents.length - 1].id],
      rawEventIds: [testEvents[2].rawEventId || 'raw-2', testEvents[testEvents.length - 1].rawEventId || 'raw-last'],
      entityRefs: [{ type: 'USER', value: 'sara' }],
      confidence: 'HIGH',
      confidenceScore: 90,
      confidenceBreakdown: { signalCountScore: 30, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 15 },
      status: 'VALIDATED',
      whyEn: 'Multiple signals correlate with high confidence.',
      whyAr: 'إشارات متعددة تؤكد النتيجة.',
      createdAtVirtualTime: 100,
    };

    it('creates SOC Handoff with intact rawEventIds and priority', () => {
      const socPkg = ThreatHandoffBridge.createSocHandoff(sampleFinding, 'DET-01', 150);
      expect(socPkg.handoffId).toContain('SOC-HANDOFF');
      expect(socPkg.rawEventIds).toEqual(sampleFinding.rawEventIds);
      expect(socPkg.priority).toBe('P2_HIGH');
      expect(socPkg.status).toBe('DISPATCHED');
    });

    it('creates Forensics Handoff generating canonical EVD-... evidence with preserved hashes', () => {
      const forPkg = ThreatHandoffBridge.createForensicsHandoff(sampleFinding, testEvents, 'CASE-NEXORA-FIN-001', 160);
      expect(forPkg.handoffId).toContain('FOR-HANDOFF');
      expect(forPkg.evidenceList.length).toBeGreaterThan(0);
      expect(forPkg.evidenceList.every((e) => e.id.startsWith('EVD-'))).toBe(true);
      expect(forPkg.evidenceList.every((e) => e.preserved && e.integrityStatus === 'VERIFIED')).toBe(true);
    });
  });

  describe('6. Anti-Cheat Scenario & Master Challenge Validation', () => {
    it('fails scenario validation when prerequisites are missing', () => {
      const incompleteState: ValidationState = {
        hunt: scenario1.hunt,
        hypothesis: { ...scenario1.hypothesis, status: 'DRAFT' },
        findings: [],
        detections: [],
        detectionResults: {},
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: [],
        telemetryEvents: testEvents,
      };

      const outcome = ThreatHuntValidator.validateScenario('HUNT-01', incompleteState);
      expect(outcome.success).toBe(false);
      expect(outcome.missingRequirementsEn.length).toBeGreaterThan(0);
    });

    it('passes scenario validation when all real steps are executed', () => {
      const validFinding: HuntFinding = {
        id: 'FIND-HUNT-01-1',
        huntId: 'HUNT-01',
        titleEn: 'Validated Finding',
        titleAr: 'نتيجة مؤكدة',
        summaryEn: 'Summary',
        summaryAr: 'ملخص',
        severity: 'threat',
        eventIds: [testEvents[2].id, testEvents[3].id],
        rawEventIds: [testEvents[2].rawEventId || 'raw-2', testEvents[3].rawEventId || 'raw-3'],
        entityRefs: [],
        confidence: 'HIGH',
        confidenceScore: 85,
        confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
        status: 'VALIDATED',
        whyEn: 'Valid',
        whyAr: 'صحيح',
        createdAtVirtualTime: 100,
      };

      const validState: ValidationState = {
        hunt: scenario1.hunt,
        hypothesis: { ...scenario1.hypothesis, status: 'SUPPORTED' },
        findings: [validFinding],
        detections: [
          {
            id: 'DET-01',
            nameEn: 'Rule',
            nameAr: 'قاعدة',
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
          'DET-01': {
            ruleId: 'DET-01',
            totalEvaluated: 10,
            matchedEventIds: ['norm-win-01'],
            truePositives: 1,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: ['norm-win-01'],
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
            findingId: 'FIND-HUNT-01-1',
            rawEventIds: ['raw-2'],
            eventIds: [testEvents[2].id],
            summaryEn: '',
            summaryAr: '',
            priority: 'P2_HIGH',
            timestampVirtual: 100,
            status: 'DISPATCHED',
          },
        ],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: testEvents,
      };

      const outcome = ThreatHuntValidator.validateScenario('HUNT-01', validState);
      expect(outcome.success).toBe(true);
      expect(outcome.completedObjectives.length).toBe(5);
    });
  });
});
