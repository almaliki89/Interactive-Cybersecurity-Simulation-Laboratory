import { describe, it, expect } from 'vitest';

// Logic imports
import {
  createTelemetryEvent,
  TELEMETRY_CATEGORIES,
  SecurityTelemetryEvent,
} from '../../simulations/soc/logic/telemetry';

import {
  normalizeRuntimeEvent,
  normalizeWindowsEvent,
  normalizeLinuxEvent,
  normalizeIdentityEvent,
  normalizeAppSecEvent,
  normalizeNetworkEvent,
} from '../../simulations/soc/logic/normalization';

import {
  enrichTelemetryEvent,
  enrichBatchTelemetry,
  ENTERPRISE_USERS,
  ENTERPRISE_HOSTS,
} from '../../simulations/soc/logic/enrichment';

import {
  queryTelemetry,
  matchTelemetryFilter,
  STANDARD_HUNTING_HYPOTHESES,
} from '../../simulations/soc/logic/hunting';

import {
  DetectionRule,
  STANDARD_DETECTION_RULES,
  evaluateDetectionRules,
  SecurityAlert,
} from '../../simulations/soc/logic/detection';

import {
  triageAlert,
  triageAlertBatch,
} from '../../simulations/soc/logic/triage';

import {
  correlateAlerts,
} from '../../simulations/soc/logic/correlation';

import {
  createSecurityIncident,
  buildIncidentTimeline,
} from '../../simulations/soc/logic/incidents';

import {
  evaluateContainmentDecision,
  CONTAINMENT_ACTIONS,
} from '../../simulations/soc/logic/containment';

import {
  calculateDetectionMetrics,
} from '../../simulations/soc/logic/metrics';

import {
  getInitialSocChallengeState,
  validateSocInvestigationState,
} from '../../simulations/soc/logic/hardening';

describe('SOC, SIEM & Detection Engineering Logic Test Suite', () => {
  // ==========================================
  // 1. Cross-World Normalization Tests
  // ==========================================
  describe('Cross-World Telemetry Normalization', () => {
    it('normalizes Windows Event 4625 into standardized AUTHENTICATION failure', () => {
      const norm = normalizeWindowsEvent({
        id: 'raw-win-01',
        type: 'WINDOWS_LOGIN_FAILED',
        virtualTime: 100,
        payload: { eventId: '4625', user: 'sara', host: 'FIN-WS-01', sourceIp: '203.0.113.55' },
      });

      expect(norm.sourceWorld).toBe('WINDOWS');
      expect(norm.category).toBe(TELEMETRY_CATEGORIES.AUTHENTICATION);
      expect(norm.outcome).toBe('FAILURE');
      expect(norm.user).toBe('sara');
      expect(norm.host).toBe('FIN-WS-01');
      expect(norm.virtualTime).toBe(100);
    });

    it('normalizes Active Directory Kerberos and Group Membership events', () => {
      const norm = normalizeIdentityEvent({
        id: 'raw-id-01',
        type: 'PRIVILEGED_GROUP_CHANGED',
        virtualTime: 200,
        payload: { user: 'sara', targetGroup: 'Domain Admins', workstation: 'DC-01' },
      });

      expect(norm.sourceWorld).toBe('IDENTITY');
      expect(norm.category).toBe(TELEMETRY_CATEGORIES.GROUP_MANAGEMENT);
      expect(norm.outcome).toBe('SUCCESS');
      expect(norm.user).toBe('sara');
    });

    it('normalizes AppSec BOLA / IDOR 403 denial into ACCESS_CONTROL schema', () => {
      const norm = normalizeAppSecEvent({
        id: 'raw-app-01',
        type: 'APP_ACCESS_DENIED',
        virtualTime: 300,
        payload: { userId: 'sara', endpoint: '/api/v1/finance/reports', statusCode: 403 },
      });

      expect(norm.sourceWorld).toBe('APPSEC');
      expect(norm.category).toBe(TELEMETRY_CATEGORIES.ACCESS_CONTROL);
      expect(norm.outcome).toBe('DENIED');
      expect(norm.resource).toBe('/api/v1/finance/reports');
    });

    it('normalizes Linux PAM and Sudo execution events', () => {
      const norm = normalizeLinuxEvent({
        id: 'raw-lx-01',
        type: 'SUDO_EXEC',
        virtualTime: 400,
        payload: { user: 'developer', allowed: false, process: '/bin/bash' },
      });

      expect(norm.sourceWorld).toBe('LINUX');
      expect(norm.category).toBe(TELEMETRY_CATEGORIES.ACCESS_CONTROL);
      expect(norm.outcome).toBe('DENIED');
    });

    it('normalizes Network Firewall dropped connection events', () => {
      const norm = normalizeNetworkEvent({
        id: 'raw-net-01',
        type: 'PACKET_BLOCKED',
        virtualTime: 500,
        payload: { sourceIp: '10.0.1.50', destinationIp: '10.0.5.20', destinationPort: 5432 },
      });

      expect(norm.sourceWorld).toBe('NETWORK');
      expect(norm.category).toBe(TELEMETRY_CATEGORIES.NETWORK_CONNECTION);
      expect(norm.outcome).toBe('DENIED');
      expect(norm.destinationPort).toBe(5432);
    });
  });

  // ==========================================
  // 2. Contextual Enrichment Tests
  // ==========================================
  describe('Contextual Asset & User Enrichment', () => {
    it('enriches events with user department and host criticality', () => {
      const raw = createTelemetryEvent({
        id: 'tel-01',
        sourceWorld: 'WINDOWS',
        eventType: 'WIN_4625',
        virtualTime: 100,
        user: 'sara',
        host: 'FIN-WS-01',
        category: TELEMETRY_CATEGORIES.AUTHENTICATION,
        outcome: 'FAILURE',
      });

      const enriched = enrichTelemetryEvent(raw);
      expect(enriched.userDepartment).toBe('Finance');
      expect(enriched.userIsPrivileged).toBe(false);
      expect(enriched.assetCriticality).toBe('HIGH');
      expect(enriched.networkZone).toBe('INTERNAL_TRUSTED');
    });

    it('correctly flags privileged domain administrator accounts', () => {
      const raw = createTelemetryEvent({
        id: 'tel-02',
        sourceWorld: 'IDENTITY',
        eventType: 'KERBEROS_AUTH_SUCCESS',
        virtualTime: 150,
        user: 'admin_alex',
        host: 'DC-01',
        category: TELEMETRY_CATEGORIES.AUTHENTICATION,
        outcome: 'SUCCESS',
      });

      const enriched = enrichTelemetryEvent(raw);
      expect(enriched.userIsPrivileged).toBe(true);
      expect(enriched.assetCriticality).toBe('CRITICAL');
    });
  });

  // ==========================================
  // 3. Safe Query Language & Threat Hunting
  // ==========================================
  describe('Safe Query Language & Threat Hunting', () => {
    const sampleEvents: SecurityTelemetryEvent[] = [
      createTelemetryEvent({ id: 'e1', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 100, user: 'sara', host: 'FIN-WS-01', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
      createTelemetryEvent({ id: 'e2', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 150, user: 'sara', host: 'FIN-WS-01', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
      createTelemetryEvent({ id: 'e3', sourceWorld: 'IDENTITY', eventType: 'KERBEROS_AUTH_SUCCESS', virtualTime: 200, user: 'sara', host: 'FIN-WS-01', category: 'AUTHENTICATION', outcome: 'SUCCESS' }),
      createTelemetryEvent({ id: 'e4', sourceWorld: 'NETWORK', eventType: 'PACKET_BLOCKED', virtualTime: 300, sourceIp: '10.0.1.50', destinationPort: 5432, category: 'NETWORK_CONNECTION', outcome: 'DENIED' }),
    ];

    it('executes structured equality and relational queries safely', () => {
      const res = queryTelemetry(sampleEvents, 'category = AUTHENTICATION AND outcome = FAILURE');
      expect(res.length).toBe(2);
      expect(res.map((e) => e.id)).toEqual(['e1', 'e2']);
    });

    it('filters events by user and timestamp boundaries', () => {
      const res = queryTelemetry(sampleEvents, 'user = sara AND virtualTime >= 150');
      expect(res.length).toBe(2);
      expect(res.map((e) => e.id)).toEqual(['e2', 'e3']);
    });
  });

  // ==========================================
  // 4. Detection Rules Engine Tests
  // ==========================================
  describe('SIEM Detection Rule Engine', () => {
    it('triggers threshold rule when failure count meets limit within window', () => {
      const events: SecurityTelemetryEvent[] = [
        createTelemetryEvent({ id: 'f1', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 100, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
        createTelemetryEvent({ id: 'f2', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 120, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
        createTelemetryEvent({ id: 'f3', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 140, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
        createTelemetryEvent({ id: 'f4', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 160, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
        createTelemetryEvent({ id: 'f5', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 180, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
      ];

      const rule = STANDARD_DETECTION_RULES.find((r) => r.id === 'rule-auth-bruteforce')!;
      const alerts = evaluateDetectionRules(events, [rule]);

      expect(alerts.length).toBe(1);
      expect(alerts[0].ruleId).toBe('rule-auth-bruteforce');
      expect(alerts[0].evidenceEventIds.length).toBe(5);
    });

    it('does not trigger threshold rule when failure count is below limit', () => {
      const events: SecurityTelemetryEvent[] = [
        createTelemetryEvent({ id: 'f1', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 100, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
        createTelemetryEvent({ id: 'f2', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 120, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
      ];

      const rule = STANDARD_DETECTION_RULES.find((r) => r.id === 'rule-auth-bruteforce')!;
      const alerts = evaluateDetectionRules(events, [rule]);
      expect(alerts.length).toBe(0);
    });

    it('triggers sequence rule only when failures precede success within time window', () => {
      const events: SecurityTelemetryEvent[] = [
        createTelemetryEvent({ id: 'f1', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 100, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
        createTelemetryEvent({ id: 'f2', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 120, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
        createTelemetryEvent({ id: 'f3', sourceWorld: 'WINDOWS', eventType: 'WIN_4625', virtualTime: 140, user: 'sara', category: 'AUTHENTICATION', outcome: 'FAILURE' }),
        createTelemetryEvent({ id: 's1', sourceWorld: 'IDENTITY', eventType: 'KERBEROS_AUTH_SUCCESS', virtualTime: 200, user: 'sara', category: 'AUTHENTICATION', outcome: 'SUCCESS' }),
      ];

      const rule = STANDARD_DETECTION_RULES.find((r) => r.id === 'rule-auth-success-after-fail')!;
      const alerts = evaluateDetectionRules(events, [rule]);

      expect(alerts.length).toBe(1);
      expect(alerts[0].ruleId).toBe('rule-auth-success-after-fail');
      expect(alerts[0].entities.users).toContain('sara');
    });

    it('does not trigger disabled detection rules', () => {
      const events: SecurityTelemetryEvent[] = [
        createTelemetryEvent({ id: 'g1', sourceWorld: 'IDENTITY', eventType: 'PRIVILEGED_GROUP_CHANGED', virtualTime: 100, user: 'sara', category: 'GROUP_MANAGEMENT', outcome: 'SUCCESS' }),
      ];

      const rule = { ...STANDARD_DETECTION_RULES.find((r) => r.id === 'rule-priv-group-modification')!, enabled: false };
      const alerts = evaluateDetectionRules(events, [rule]);
      expect(alerts.length).toBe(0);
    });
  });

  // ==========================================
  // 5. Alert Triage & Prioritization Tests
  // ==========================================
  describe('Alert Triage & Prioritization Scoring', () => {
    it('ranks alerts higher when Tier-0 assets or privileged users are involved', () => {
      const alert: SecurityAlert = {
        id: 'alt-01',
        ruleId: 'rule-priv-group-modification',
        ruleNameEn: 'Account Added to Privileged Security Group',
        ruleNameAr: 'إضافة حساب إلى مجموعة مميزة',
        severity: 'CRITICAL',
        createdAtVirtualTime: 500,
        status: 'NEW',
        evidenceEventIds: ['evt-01'],
        entities: { users: ['sara'], hosts: ['DC-01'], ips: [], resources: [] },
        reasonEn: 'Added to Domain Admins',
        reasonAr: 'إضافة لمسؤولي النطاق',
        threatTechnique: 'T1098',
      };

      const enrichedEvents = [
        enrichTelemetryEvent(createTelemetryEvent({
          id: 'evt-01',
          sourceWorld: 'IDENTITY',
          eventType: 'PRIVILEGED_GROUP_CHANGED',
          virtualTime: 500,
          user: 'sara',
          host: 'DC-01',
          category: 'GROUP_MANAGEMENT',
          outcome: 'SUCCESS',
        })),
      ];

      const triageResult = triageAlert(alert, enrichedEvents);
      expect(triageResult.triagePriority).toBe('P1_CRITICAL');
      expect(triageResult.triageScore).toBeGreaterThanOrEqual(65);
      expect(triageResult.factorsEn.some((f) => f.includes('Tier-0'))).toBe(true);
    });
  });

  // ==========================================
  // 6. Multi-Stage Correlation Tests
  // ==========================================
  describe('Multi-Stage Attack Correlation', () => {
    it('correlates related alerts for the same user across attack stages', () => {
      const alerts: SecurityAlert[] = [
        {
          id: 'alt-1',
          ruleId: 'rule-auth-bruteforce',
          ruleNameEn: 'Auth Brute Force',
          ruleNameAr: 'تخمين الدخول',
          severity: 'HIGH',
          createdAtVirtualTime: 200,
          status: 'NEW',
          evidenceEventIds: ['e1'],
          entities: { users: ['sara'], hosts: ['FIN-WS-01'], ips: [], resources: [] },
          reasonEn: 'Brute force detected',
          reasonAr: 'رصد تخمين',
          threatTechnique: 'T1110',
        },
        {
          id: 'alt-2',
          ruleId: 'rule-priv-group-modification',
          ruleNameEn: 'Privileged Group Change',
          ruleNameAr: 'تعديل الصلاحيات',
          severity: 'CRITICAL',
          createdAtVirtualTime: 500,
          status: 'NEW',
          evidenceEventIds: ['e2'],
          entities: { users: ['sara'], hosts: ['DC-01'], ips: [], resources: [] },
          reasonEn: 'Added to Domain Admins',
          reasonAr: 'إضافة للمسؤولين',
          threatTechnique: 'T1098',
        },
      ];

      const groups = correlateAlerts(alerts, []);
      expect(groups.length).toBe(1);
      expect(groups[0].entities.primaryUser).toBe('sara');
      expect(groups[0].attackStages.length).toBe(2);
    });
  });

  // ==========================================
  // 7. Containment Decisions & Proportionality
  // ==========================================
  describe('Containment Decisions & Business Continuity', () => {
    it('validates proportional containment actions without outage', () => {
      const results = evaluateContainmentDecision([
        'REVOKE_ACTIVE_SESSIONS',
        'REVERT_PRIVILEGED_GROUP',
        'ISOLATE_HOST_NETWORK',
      ]);

      expect(results.every((r) => r.businessContinuityPreserved)).toBe(true);
      expect(results.every((r) => r.effectiveForThreat)).toBe(true);
    });

    it('fails when overly destructive actions are selected', () => {
      const results = evaluateContainmentDecision([
        'SHUTDOWN_ENTIRE_SERVER',
      ]);

      expect(results[0].businessContinuityPreserved).toBe(false);
      expect(results[0].proportionalityScore).toBe(0);
    });
  });

  // ==========================================
  // 8. Detection Quality Metrics
  // ==========================================
  describe('Detection Quality Metrics (Precision & Recall)', () => {
    it('calculates 100% precision and recall on optimal detection matches', () => {
      const groundTruth = [
        { eventId: 'e1', isMaliciousGroundTruth: true },
        { eventId: 'e2', isMaliciousGroundTruth: true },
        { eventId: 'e3', isMaliciousGroundTruth: false },
      ];
      const alertedIds = ['e1', 'e2'];

      const metrics = calculateDetectionMetrics(groundTruth, alertedIds);
      expect(metrics.precision).toBe(100);
      expect(metrics.recall).toBe(100);
      expect(metrics.falsePositives).toBe(0);
      expect(metrics.falseNegatives).toBe(0);
    });
  });

  // ==========================================
  // 9. Master Challenge Hardening Validator
  // ==========================================
  describe('Nexora SOC Master Hardening Validator', () => {
    const getHardenedState = () => {
      const state = getInitialSocChallengeState();
      state.enabledRuleIds = [
        'rule-auth-bruteforce',
        'rule-auth-success-after-fail',
        'rule-priv-group-modification',
        'rule-suspicious-process',
        'rule-network-scan-denied',
        'rule-sensitive-resource-access',
        'rule-app-bola-anomaly',
        'rule-security-log-tamper',
      ];
      state.tunedRuleThresholds = {
        'rule-auth-bruteforce': 5,
      };
      state.selectedPrimaryUser = 'sara';
      state.selectedPrimaryHost = 'FIN-WS-01';
      state.selectedTargetResource = '\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx';
      state.attachedTimelineEventIds = [
        'evt-auth-fail-1',
        'evt-auth-success',
        'evt-priv-group-mod',
        'evt-process-spawn',
        'evt-net-probe-1',
        'evt-sensitive-share-access',
        'evt-app-bola-violation',
      ];
      state.selectedContainmentActions = [
        'REVOKE_ACTIVE_SESSIONS',
        'REVERT_PRIVILEGED_GROUP',
        'ISOLATE_HOST_NETWORK',
        'ENABLE_DEBUG_AUDIT_LOGGING',
      ];
      return state;
    };

    it('fails on initial uninvestigated state', () => {
      const initial = getInitialSocChallengeState();
      const res = validateSocInvestigationState(initial);
      expect(res.success).toBe(false);
      expect(res.score).toBeLessThan(50);
      expect(res.failedChecks.length).toBeGreaterThan(0);
    });

    it('passes with 100% score when all 12 controls + business continuity requirement are satisfied', () => {
      const state = getHardenedState();
      const res = validateSocInvestigationState(state);

      expect(res.failedChecks).toEqual([]);
      expect(res.success).toBe(true);
      expect(res.score).toBe(100);
      expect(res.businessContinuityPassed).toBe(true);
    });

    // Single-Defect Failures
    it('missing auth brute detection → fail', () => {
      const state = getHardenedState();
      state.enabledRuleIds = state.enabledRuleIds.filter((id) => id !== 'rule-auth-bruteforce');
      const res = validateSocInvestigationState(state);
      expect(res.success).toBe(false);
      expect(res.failedChecks).toContain('chk-auth-brute-detected');
    });

    it('incorrect user attribution → fail', () => {
      const state = getHardenedState();
      state.selectedPrimaryUser = 'admin_alex';
      const res = validateSocInvestigationState(state);
      expect(res.success).toBe(false);
      expect(res.failedChecks).toContain('chk-incident-entity-attribution');
    });

    it('missing essential containment action → fail', () => {
      const state = getHardenedState();
      state.selectedContainmentActions = ['REVOKE_ACTIVE_SESSIONS']; // missing revert and isolate
      const res = validateSocInvestigationState(state);
      expect(res.success).toBe(false);
      expect(res.failedChecks).toContain('chk-proportional-containment');
    });

    // Anti-Cheat Verifications
    it('anti-cheat: shutdownEntireCoreServer → fail', () => {
      const state = getHardenedState();
      state.shutdownEntireCoreServer = true;
      const res = validateSocInvestigationState(state);
      expect(res.success).toBe(false);
      expect(res.businessContinuityPassed).toBe(false);
    });

    it('anti-cheat: disableAllFinanceUsers → fail', () => {
      const state = getHardenedState();
      state.disableAllFinanceUsers = true;
      const res = validateSocInvestigationState(state);
      expect(res.success).toBe(false);
      expect(res.businessContinuityPassed).toBe(false);
    });

    it('anti-cheat: blockAllInboundTraffic → fail', () => {
      const state = getHardenedState();
      state.blockAllInboundTraffic = true;
      const res = validateSocInvestigationState(state);
      expect(res.success).toBe(false);
      expect(res.businessContinuityPassed).toBe(false);
    });

    it('anti-cheat: markAllEventsAsMalicious → fail', () => {
      const state = getHardenedState();
      state.markAllEventsAsMalicious = true;
      const res = validateSocInvestigationState(state);
      expect(res.success).toBe(false);
      expect(res.businessContinuityPassed).toBe(false);
    });
  });
});
