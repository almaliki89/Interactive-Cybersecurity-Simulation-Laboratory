// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import {
  useSimulationStore,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import { useThreatHuntingStore } from '../../simulations/threat/runtime/threatHuntingStore';
import { ThreatHuntingSimulation } from '../../simulations/threat/ThreatHuntingSimulation';
import { CloudIamLab } from '../../simulations/cloud/CloudIamLab';
import { K8sRbacLab } from '../../simulations/containers/K8sRbacLab';
import { AlertTriageLab } from '../../simulations/soc/AlertTriageLab';
import { ThreatHuntValidator } from '../../simulations/threat/logic/validators';
import { DetectionRule } from '../../simulations/threat/logic/types';
import { HUNT_SCENARIOS } from '../../simulations/threat/logic/scenarios';

describe('OMEGA MAX — Real UI Component Integration & Challenge Lifecycle Suite', () => {
  beforeEach(() => {
    cleanup();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Reset Simulation Store
    useSimulationStore.setState({
      language: 'en',
      activeSimulationId: 'landing',
      completedChallenges: [],
      events: [],
    });

    // Reset Threat Hunting Store to clean HUNT-01 defaults
    useThreatHuntingStore.getState().setActiveHunt('HUNT-01');
    useThreatHuntingStore.setState({
      findings: [],
      detections: [],
      detectionResults: {},
      socHandoffs: [],
      forensicsHandoffs: [],
      executedQueryStrings: [],
      executedQueriesByHunt: {},
      selectedEventId: null,
      selectedEntity: null,
      currentQueryResult: null,
    });

    // Unregister challenge validators to ensure clean test state
    unregisterChallengeValidator('threat-hunting-hypothesis-challenge');
    unregisterChallengeValidator('iam-hardening-challenge');
    unregisterChallengeValidator('k8s-hardening-challenge');
    unregisterChallengeValidator('brute-force-triage-challenge');
  });

  afterEach(() => {
    cleanup();
  });

  /* -------------------------------------------------------------------------
   * 1. Threat Hunting Real Component & Validator Lifecycle Integration Tests
   * ------------------------------------------------------------------------- */
  describe('1. Threat Hunting Real Component Lifecycle', () => {
    it('Case 1: non-empty query alone does NOT complete the challenge', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain(
        'threat-hunting-hypothesis-challenge'
      );
      expect(screen.getByTestId('threat-hunt-challenge-status').textContent).toContain(
        'Investigation incomplete'
      );
    });

    it('Case 2: supported hypothesis without a qualifying finding does NOT complete it', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
        useThreatHuntingStore.getState().updateHypothesisStatus('SUPPORTED');
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain(
        'threat-hunting-hypothesis-challenge'
      );
    });

    it('Case 3: finding with single event (< 2 events) does NOT meet requirement', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      const events = useThreatHuntingStore.getState().telemetryEvents;

      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
        useThreatHuntingStore.getState().updateHypothesisStatus('SUPPORTED');
        useThreatHuntingStore.getState().addFinding({
          huntId: 'HUNT-01',
          titleEn: 'Partial Finding',
          titleAr: 'نتيجة جزئية',
          summaryEn: 'Only one event',
          summaryAr: 'حدث واحد فقط',
          severity: 'threat',
          eventIds: [events[0].id], // Only 1 event!
          rawEventIds: [events[0].rawEventId || 'raw-0'],
          entityRefs: [],
          confidence: 'MEDIUM',
          status: 'VALIDATED',
          whyEn: 'Partial',
          whyAr: 'جزئي',
        });
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain(
        'threat-hunting-hypothesis-challenge'
      );
    });

    it('Case 4: finding containing non-existent event IDs is rejected', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
        useThreatHuntingStore.getState().updateHypothesisStatus('SUPPORTED');
        useThreatHuntingStore.getState().addFinding({
          huntId: 'HUNT-01',
          titleEn: 'Forged Finding',
          titleAr: 'نتيجة مزيفة',
          summaryEn: 'Fake event IDs',
          summaryAr: 'أحداث غير موجودة',
          severity: 'threat',
          eventIds: ['nonexistent-evt-999', 'nonexistent-evt-888'],
          rawEventIds: ['fake-1', 'fake-2'],
          entityRefs: [],
          confidence: 'HIGH',
          status: 'VALIDATED',
          whyEn: 'Forged',
          whyAr: 'مزيف',
        });
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain(
        'threat-hunting-hypothesis-challenge'
      );
    });

    it('Case 5: finding belonging to another hunt cannot satisfy the active hunt', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      const events = useThreatHuntingStore.getState().telemetryEvents;

      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
        useThreatHuntingStore.getState().updateHypothesisStatus('SUPPORTED');
        // Add finding belonging to HUNT-02 while active hunt is HUNT-01
        useThreatHuntingStore.getState().addFinding({
          huntId: 'HUNT-02',
          titleEn: 'HUNT-02 Finding',
          titleAr: 'نتيجة سيناريو 2',
          summaryEn: 'Belongs to hunt 2',
          summaryAr: 'تتبع سيناريو آخر',
          severity: 'threat',
          eventIds: [events[0].id, events[1].id],
          rawEventIds: ['r1', 'r2'],
          entityRefs: [],
          confidence: 'HIGH',
          status: 'VALIDATED',
          whyEn: 'Cross-hunt attempt',
          whyAr: 'محاولة استخدام دليل من سيناريو آخر',
        });
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain(
        'threat-hunting-hypothesis-challenge'
      );
    });

    it('Case 6: validated finding alone does NOT bypass detection rule requirement', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      const events = useThreatHuntingStore.getState().telemetryEvents;

      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
        useThreatHuntingStore.getState().updateHypothesisStatus('SUPPORTED');
        useThreatHuntingStore.getState().addFinding({
          huntId: 'HUNT-01',
          titleEn: 'Valid Finding',
          titleAr: 'نتيجة مؤكدة',
          summaryEn: 'Has 2 real events',
          summaryAr: 'حدثان حقيقيان',
          severity: 'threat',
          eventIds: [events[0].id, events[1].id],
          rawEventIds: [events[0].rawEventId || 'r0', events[1].rawEventId || 'r1'],
          entityRefs: [],
          confidence: 'HIGH',
          status: 'VALIDATED',
          whyEn: 'Evidence confirmed',
          whyAr: 'تم تأكيد الأدلة',
        });
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain(
        'threat-hunting-hypothesis-challenge'
      );
    });

    it('Case 7: detection rule with false positives (> 0) fails validation', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      const events = useThreatHuntingStore.getState().telemetryEvents;

      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
        useThreatHuntingStore.getState().updateHypothesisStatus('SUPPORTED');
        useThreatHuntingStore.getState().addFinding({
          huntId: 'HUNT-01',
          titleEn: 'Valid Finding',
          titleAr: 'نتيجة مؤكدة',
          summaryEn: 'Valid',
          summaryAr: 'صحيح',
          severity: 'threat',
          eventIds: [events[0].id, events[1].id],
          rawEventIds: ['r0', 'r1'],
          entityRefs: [],
          confidence: 'HIGH',
          status: 'VALIDATED',
          whyEn: 'Valid',
          whyAr: 'صحيح',
        });

        // Add detection rule with false positives
        const ruleId = useThreatHuntingStore.getState().addDetectionRule({
          nameEn: 'Noisy Rule',
          nameAr: 'قاعدة غير مضبوطة',
          descriptionEn: 'Noisy',
          descriptionAr: 'مزعجة',
          severity: 'HIGH',
          dataSources: ['WINDOWS'],
          conditions: [],
          mitreTechniques: [],
          status: 'TESTING',
          ruleType: 'SINGLE_EVENT',
        });

        useThreatHuntingStore.setState((s) => ({
          detectionResults: {
            ...s.detectionResults,
            [ruleId]: {
              ruleId,
              totalEvaluated: 10,
              matchedEventIds: ['evt-1', 'evt-2'],
              truePositives: 1,
              falsePositives: 2, // Fails 0 false positive requirement!
              benignMatches: ['evt-2'],
              maliciousMatches: ['evt-1'],
              precision: 0.33,
              recall: 1.0,
              isValid: false,
              tuningAdviceEn: 'Filter benign noise',
              tuningAdviceAr: 'قم بضبط الاستثناءات',
            },
          },
        }));
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain(
        'threat-hunting-hypothesis-challenge'
      );
    });

    it('Case 8: missing or unrelated SOC handoff fails validation', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      const events = useThreatHuntingStore.getState().telemetryEvents;

      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
        useThreatHuntingStore.getState().updateHypothesisStatus('SUPPORTED');
        useThreatHuntingStore.getState().addFinding({
          huntId: 'HUNT-01',
          titleEn: 'Valid Finding',
          titleAr: 'نتيجة مؤكدة',
          summaryEn: 'Valid',
          summaryAr: 'صحيح',
          severity: 'threat',
          eventIds: [events[0].id, events[1].id],
          rawEventIds: ['r0', 'r1'],
          entityRefs: [],
          confidence: 'HIGH',
          status: 'VALIDATED',
          whyEn: 'Valid',
          whyAr: 'صحيح',
        });

        const ruleId = useThreatHuntingStore.getState().addDetectionRule({
          nameEn: 'Tuned Rule',
          nameAr: 'قاعدة مضبوطة',
          descriptionEn: 'Clean',
          descriptionAr: 'نظيفة',
          severity: 'HIGH',
          dataSources: ['WINDOWS'],
          conditions: [],
          mitreTechniques: [],
          status: 'VALIDATED',
          ruleType: 'SINGLE_EVENT',
        });

        useThreatHuntingStore.setState((s) => ({
          detectionResults: {
            ...s.detectionResults,
            [ruleId]: {
              ruleId,
              totalEvaluated: 10,
              matchedEventIds: [events[0].id],
              truePositives: 1,
              falsePositives: 0,
              benignMatches: [],
              maliciousMatches: [events[0].id],
              precision: 1.0,
              recall: 1.0,
              isValid: true,
              tuningAdviceEn: 'Optimal',
              tuningAdviceAr: 'مثالية',
            },
          },
          // Handoff is for HUNT-02, not HUNT-01!
          socHandoffs: [
            {
              handoffId: 'SOC-HUNT-02-1',
              huntId: 'HUNT-02',
              findingId: 'FIND-HUNT-02-1',
              rawEventIds: ['r0'],
              eventIds: [events[0].id],
              summaryEn: 'Handoff for hunt 2',
              summaryAr: 'إحالة سيناريو آخر',
              priority: 'P2_HIGH',
              timestampVirtual: 100,
              status: 'DISPATCHED',
            },
          ],
        }));
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain(
        'threat-hunting-hypothesis-challenge'
      );
    });

    it('Case 9: fully satisfying scenario requirements allows successful completion', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      const events = useThreatHuntingStore.getState().telemetryEvents;

      act(() => {
        // 1. Query execution for HUNT-01
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');

        // 2. Hypothesis supported
        useThreatHuntingStore.getState().updateHypothesisStatus('SUPPORTED');

        // 3. Validated finding with >= 2 verified telemetry events
        useThreatHuntingStore.getState().addFinding({
          huntId: 'HUNT-01',
          titleEn: 'Active Directory Kerberoasting Attack',
          titleAr: 'هجوم طلب تذاكر كيربيروس المشبوهة',
          summaryEn: 'Validated attack chain against financial servers',
          summaryAr: 'سلسلة هجوم مؤكدة ضد خوادم الإدارة المالية',
          severity: 'threat',
          eventIds: [events[0].id, events[1].id],
          rawEventIds: [events[0].rawEventId || 'r0', events[1].rawEventId || 'r1'],
          entityRefs: [],
          confidence: 'HIGH',
          status: 'VALIDATED',
          whyEn: 'Observed repeated failed logons and Kerberos requests',
          whyAr: 'رصد تكرار فشل تسجيل الدخول وطلبات كيربيروس شاذة',
        });

        // 4. Validated detection rule for HUNT-01 with 0 false positives
        const ruleId = useThreatHuntingStore.getState().addDetectionRule({
          nameEn: 'Kerberos Anomalous TGS Request Detection',
          nameAr: 'كشف طلبات كيربيروس الشاذة',
          descriptionEn: 'Detects high rate of TGS requests',
          descriptionAr: 'رصد المعدل العالي لطلبات التذاكر',
          severity: 'HIGH',
          dataSources: ['WINDOWS', 'IDENTITY'],
          conditions: [],
          mitreTechniques: ['T1558.003'],
          status: 'VALIDATED',
          ruleType: 'SINGLE_EVENT',
        });

        useThreatHuntingStore.setState((s) => ({
          detectionResults: {
            ...s.detectionResults,
            [ruleId]: {
              ruleId,
              totalEvaluated: 15,
              matchedEventIds: [events[0].id],
              truePositives: 1,
              falsePositives: 0,
              benignMatches: [],
              maliciousMatches: [events[0].id],
              precision: 1.0,
              recall: 1.0,
              isValid: true,
              tuningAdviceEn: 'Tuned with zero false positives',
              tuningAdviceAr: 'مضبوطة بنجاح دون إنذارات كاذبة',
            },
          },
          // 5. Valid SOC handoff for HUNT-01
          socHandoffs: [
            {
              handoffId: 'SOC-HUNT-01-1',
              huntId: 'HUNT-01',
              findingId: s.findings[0]?.id || 'FIND-HUNT-01-1',
              rawEventIds: [events[0].rawEventId || 'r0'],
              eventIds: [events[0].id],
              summaryEn: 'Dispatched to SOC',
              summaryAr: 'تمت الإحالة لمركز العمليات',
              priority: 'P1_CRITICAL',
              timestampVirtual: 120,
              status: 'DISPATCHED',
            },
          ],
        }));
      });

      // Verify challenge successfully completed
      expect(useSimulationStore.getState().completedChallenges).toContain(
        'threat-hunting-hypothesis-challenge'
      );
      expect(screen.getByTestId('threat-hunt-challenge-status').textContent).toContain('5/5');
    });

    it('Case 10: switching hunts does NOT reuse historical evidence for the new hunt', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      // Satisfy HUNT-01 first
      const eventsHunt01 = useThreatHuntingStore.getState().telemetryEvents;
      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
        useThreatHuntingStore.getState().updateHypothesisStatus('SUPPORTED');
        useThreatHuntingStore.getState().addFinding({
          huntId: 'HUNT-01',
          titleEn: 'HUNT 01 Finding',
          titleAr: 'نتيجة 1',
          summaryEn: 'HUNT 01 Summary',
          summaryAr: 'ملخص 1',
          severity: 'threat',
          eventIds: [eventsHunt01[0].id, eventsHunt01[1].id],
          rawEventIds: ['r0', 'r1'],
          entityRefs: [],
          confidence: 'HIGH',
          status: 'VALIDATED',
          whyEn: 'Confirmed',
          whyAr: 'مؤكد',
        });
      });

      // Switch to HUNT-02
      act(() => {
        useThreatHuntingStore.getState().setActiveHunt('HUNT-02');
      });

      // Assert queries for HUNT-02 are empty and hypothesis is not supported for HUNT-02
      const hunt02Queries = useThreatHuntingStore.getState().executedQueriesByHunt['HUNT-02'] || [];
      expect(hunt02Queries.length).toBe(0);

      const hunt02Validation = ThreatHuntValidator.validateScenario(
        'HUNT-02',
        {
          hunt: useThreatHuntingStore.getState().hunts['HUNT-02'],
          hypothesis: useThreatHuntingStore.getState().hypotheses['HYP-02'],
          findings: useThreatHuntingStore.getState().findings,
          detections: useThreatHuntingStore.getState().detections,
          detectionResults: useThreatHuntingStore.getState().detectionResults,
          socHandoffs: useThreatHuntingStore.getState().socHandoffs,
          forensicsHandoffs: useThreatHuntingStore.getState().forensicsHandoffs,
          executedQueries: hunt02Queries,
          telemetryEvents: useThreatHuntingStore.getState().telemetryEvents,
        }
      );

      expect(hunt02Validation.success).toBe(false);
      expect(hunt02Validation.missingRequirementsEn).toContain(
        'Hypothesis must belong to active hunt and be supported by telemetry evidence.'
      );
    });
  });

  /* -------------------------------------------------------------------------
   * 2. Cloud IAM Real UI Integration Tests
   * ------------------------------------------------------------------------- */
  describe('2. Cloud IAM Real Component Integration', () => {
    it('exercises real hardening button, updates live state, completes challenge, and rejects after reset', () => {
      useSimulationStore.setState({ activeSimulationId: 'cloud_iam', completedChallenges: [] });
      render(<CloudIamLab />);

      // Initial state: Vulnerable (wildcard policy attached to workload identity)
      expect(screen.getByText('40%')).toBeDefined();
      expect(useSimulationStore.getState().completedChallenges).not.toContain('iam-hardening-challenge');

      // Click the real hardening button
      const hardenBtn = screen.getByTestId('btn-harden-iam');
      act(() => {
        fireEvent.click(hardenBtn);
      });

      // Assert score becomes 100% and challenge is completed in store
      expect(screen.getByText('100%')).toBeDefined();
      expect(useSimulationStore.getState().completedChallenges).toContain('iam-hardening-challenge');

      // Clear completed challenges to verify post-reset validation
      useSimulationStore.setState({ completedChallenges: [] });

      // Click real reset button
      const resetBtn = screen.getByTestId('btn-reset-iam');
      act(() => {
        fireEvent.click(resetBtn);
      });

      // Assert score dropped back to vulnerable level
      expect(screen.getByText('40%')).toBeDefined();

      // Attempt completion on reset state -> must be rejected by registered live validator
      act(() => {
        useSimulationStore.getState().completeChallenge('iam-hardening-challenge', {
          success: true,
          score: 100,
          message: 'Bypass after reset attempt',
        });
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain('iam-hardening-challenge');
    });
  });

  /* -------------------------------------------------------------------------
   * 3. Kubernetes RBAC Real UI Integration Tests
   * ------------------------------------------------------------------------- */
  describe('3. Kubernetes RBAC Real Component Integration', () => {
    it('exercises real sanitize RBAC button, updates live state, completes challenge, and rejects after reset', () => {
      useSimulationStore.setState({ activeSimulationId: 'kubernetes', completedChallenges: [] });
      render(<K8sRbacLab />);

      // Initial state: Vulnerable roles with wildcards & pods/exec backdoors (audit score 5%)
      expect(screen.getByText('5%')).toBeDefined();
      expect(useSimulationStore.getState().completedChallenges).not.toContain('k8s-hardening-challenge');

      // Click real sanitize RBAC button
      const hardenBtn = screen.getByTestId('btn-harden-k8s');
      act(() => {
        fireEvent.click(hardenBtn);
      });

      // Assert score reaches 100% and challenge completes in store
      expect(screen.getByText('100%')).toBeDefined();
      expect(useSimulationStore.getState().completedChallenges).toContain('k8s-hardening-challenge');

      // Clear completed challenges to verify post-reset validation
      useSimulationStore.setState({ completedChallenges: [] });

      // Click real reset button
      const resetBtn = screen.getByTestId('btn-reset-k8s');
      act(() => {
        fireEvent.click(resetBtn);
      });

      // Score drops back to vulnerable 5%
      expect(screen.getByText('5%')).toBeDefined();

      // Attempt completion on reset state -> rejected by live validator
      act(() => {
        useSimulationStore.getState().completeChallenge('k8s-hardening-challenge', {
          success: true,
          score: 100,
          message: 'Post reset attempt',
        });
      });

      expect(useSimulationStore.getState().completedChallenges).not.toContain('k8s-hardening-challenge');
    });
  });

  /* -------------------------------------------------------------------------
   * 4. SOC Alert Triage Real UI Integration Tests
   * ------------------------------------------------------------------------- */
  describe('4. SOC Alert Triage Real Component Integration', () => {
    const rawEvents = [
      {
        id: 'raw-1',
        type: 'WIN_4625',
        source: 'FIN-WS-01',
        target: 'DC-01',
        category: 'AUTHENTICATION',
        severity: 'warn' as const,
        timestamp: 100,
        virtualTime: 100,
        description: 'Failed password attempt for admin_sara',
        payload: { eventId: '4625', user: 'admin_sara', sourceIp: '192.168.1.100', host: 'FIN-WS-01' },
      },
      {
        id: 'raw-2',
        type: 'WIN_4625',
        source: 'FIN-WS-01',
        target: 'DC-01',
        category: 'AUTHENTICATION',
        severity: 'warn' as const,
        timestamp: 105,
        virtualTime: 105,
        description: 'Failed password attempt for admin_sara',
        payload: { eventId: '4625', user: 'admin_sara', sourceIp: '192.168.1.100', host: 'FIN-WS-01' },
      },
      {
        id: 'raw-3',
        type: 'WIN_4625',
        source: 'FIN-WS-01',
        target: 'DC-01',
        category: 'AUTHENTICATION',
        severity: 'warn' as const,
        timestamp: 110,
        virtualTime: 110,
        description: 'Failed password attempt for admin_sara',
        payload: { eventId: '4625', user: 'admin_sara', sourceIp: '192.168.1.100', host: 'FIN-WS-01' },
      },
      {
        id: 'raw-4',
        type: 'WIN_4625',
        source: 'FIN-WS-01',
        target: 'DC-01',
        category: 'AUTHENTICATION',
        severity: 'warn' as const,
        timestamp: 115,
        virtualTime: 115,
        description: 'Failed password attempt for admin_sara',
        payload: { eventId: '4625', user: 'admin_sara', sourceIp: '192.168.1.100', host: 'FIN-WS-01' },
      },
      {
        id: 'raw-5',
        type: 'WIN_4625',
        source: 'FIN-WS-01',
        target: 'DC-01',
        category: 'AUTHENTICATION',
        severity: 'threat' as const,
        timestamp: 120,
        virtualTime: 120,
        description: 'Brute force threshold reached for admin_sara',
        payload: { eventId: '4625', user: 'admin_sara', sourceIp: '192.168.1.100', host: 'FIN-WS-01' },
      },
    ];

    it('rejects completion with empty queue, preserves integrity on un-triaged queue, and completes on real action', () => {
      // 1. Empty queue test
      useSimulationStore.setState({ activeSimulationId: 'soc', events: [], completedChallenges: [] });
      const { unmount } = render(<AlertTriageLab />);

      expect(screen.getByText('No active alerts in queue.')).toBeDefined();

      act(() => {
        useSimulationStore.getState().completeChallenge('brute-force-triage-challenge', {
          success: true,
          score: 100,
          message: 'Empty queue bypass',
        });
      });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('brute-force-triage-challenge');
      unmount();

      // 2. Active alerts present in queue (5 failed authentication events triggering brute force threshold rule)
      useSimulationStore.setState({ activeSimulationId: 'soc', events: rawEvents, completedChallenges: [] });
      render(<AlertTriageLab />);

      // Verify alert queue rendered with flexible text matcher
      expect(screen.getByText((content) => content.includes('Alert Queue') && content.includes('1'))).toBeDefined();
      expect(useSimulationStore.getState().completedChallenges).not.toContain('brute-force-triage-challenge');

      // Clicking triage action button
      const escalateBtn = screen.getByTestId('btn-triage-investigate');
      act(() => {
        fireEvent.click(escalateBtn);
      });

      // Challenge is now completed
      expect(useSimulationStore.getState().completedChallenges).toContain('brute-force-triage-challenge');

      // Click reset triage button
      useSimulationStore.setState({ completedChallenges: [] });
      const resetBtn = screen.getByTestId('btn-reset-triage');
      act(() => {
        fireEvent.click(resetBtn);
      });

      // Live validator must reject now that statuses are reset
      act(() => {
        useSimulationStore.getState().completeChallenge('brute-force-triage-challenge', {
          success: true,
          score: 100,
          message: 'Post reset attempt',
        });
      });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('brute-force-triage-challenge');
    });
  });

  /* -------------------------------------------------------------------------
   * 5. Mandatory Ownership & Transition Sequence Regression Suite (Section 5)
   * ------------------------------------------------------------------------- */
  describe('5. Mandatory Ownership & Transition Sequence Regression Suite', () => {
    it('5.1 Strict Query Ownership: Query executed in HUNT-02 does NOT qualify for HUNT-01 when HUNT-01 query list is empty', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      // Execute query while active hunt is HUNT-02
      act(() => {
        useThreatHuntingStore.getState().setActiveHunt('HUNT-02');
        useThreatHuntingStore.getState().executeQuery('eventType = KERNEL_EXPLOIT');
        useThreatHuntingStore.getState().setActiveHunt('HUNT-01');
      });

      // HUNT-01 executed queries must remain empty
      const hunt01Queries = useThreatHuntingStore.getState().executedQueriesByHunt['HUNT-01'] || [];
      expect(hunt01Queries.length).toBe(0);

      // Validation for HUNT-01 must fail query execution requirement
      const events = useThreatHuntingStore.getState().telemetryEvents;
      const validation = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [
          {
            id: 'F1',
            huntId: 'HUNT-01',
            titleEn: 'F1',
            titleAr: 'F1',
            summaryEn: 'S1',
            summaryAr: 'S1',
            severity: 'threat',
            eventIds: [events[0].id, events[1].id],
            rawEventIds: ['r0', 'r1'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 85,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [],
        detectionResults: {},
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: hunt01Queries,
        telemetryEvents: events,
      });

      expect(validation.success).toBe(false);
      expect(validation.missingRequirementsEn).toContain(
        'Must execute at least one query against telemetry for the active hunt.'
      );
    });

    it('5.2 Strict Detection Ownership: Detection rule without huntId or canonical prefix fails validation for HUNT-01', () => {
      const events = useThreatHuntingStore.getState().telemetryEvents;
      const genericDetectionRule: DetectionRule = {
        id: 'DET-GENERIC-999', // Missing huntId and missing DET-HUNT-01- prefix!
        nameEn: 'Generic Rule',
        nameAr: 'قاعدة عامة',
        descriptionEn: 'Generic',
        descriptionAr: 'عامة',
        severity: 'HIGH',
        dataSources: ['WINDOWS'],
        conditions: [],
        mitreTechniques: [],
        status: 'VALIDATED',
        ruleType: 'SINGLE_EVENT',
        createdAtVirtualTime: 0,
      };

      const validation = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-01-1',
            huntId: 'HUNT-01',
            titleEn: 'F1',
            titleAr: 'F1',
            summaryEn: 'S1',
            summaryAr: 'S1',
            severity: 'threat',
            eventIds: [events[0].id, events[1].id],
            rawEventIds: ['r0', 'r1'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 85,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [genericDetectionRule],
        detectionResults: {
          'DET-GENERIC-999': {
            ruleId: 'DET-GENERIC-999',
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
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      expect(validation.success).toBe(false);
      expect(validation.missingRequirementsEn).toContain(
        'Must author and tune a detection rule for the active hunt with 0 false positives.'
      );
    });

    it('5.3 Strict Finding & Handoff Ownership: Finding or Handoff belonging to HUNT-02 fails validation for HUNT-01', () => {
      const events = useThreatHuntingStore.getState().telemetryEvents;

      // Finding belonging to HUNT-02
      const validationFinding = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-02-1',
            huntId: 'HUNT-02', // Belongs to HUNT-02!
            titleEn: 'Cross hunt finding',
            titleAr: 'نتيجة من سيناريو آخر',
            summaryEn: 'Summary',
            summaryAr: 'ملخص',
            severity: 'threat',
            eventIds: [events[0].id, events[1].id],
            rawEventIds: ['r0', 'r1'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 85,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [],
        detectionResults: {},
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      expect(validationFinding.success).toBe(false);
      expect(validationFinding.missingRequirementsEn).toContain(
        'Must create and validate a finding containing at least 2 supporting events.'
      );

      // Handoff belonging to HUNT-02
      const validationHandoff = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-01-1',
            huntId: 'HUNT-01',
            titleEn: 'HUNT-01 finding',
            titleAr: 'نتيجة سيناريو 1',
            summaryEn: 'Summary',
            summaryAr: 'ملخص',
            severity: 'threat',
            eventIds: [events[0].id, events[1].id],
            rawEventIds: ['r0', 'r1'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 85,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [
          {
            id: 'DET-HUNT-01-1',
            huntId: 'HUNT-01',
            nameEn: 'Detection',
            nameAr: 'كشف',
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
          'DET-HUNT-01-1': {
            ruleId: 'DET-HUNT-01-1',
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
            handoffId: 'SOC-HUNT-02-1',
            huntId: 'HUNT-02', // Belongs to HUNT-02!
            findingId: 'FIND-HUNT-02-1',
            rawEventIds: ['r0'],
            eventIds: [events[0].id],
            summaryEn: 'Handoff 2',
            summaryAr: 'إحالة 2',
            priority: 'P2_HIGH',
            timestampVirtual: 100,
            status: 'DISPATCHED',
          },
        ],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      expect(validationHandoff.success).toBe(false);
      expect(validationHandoff.missingRequirementsEn).toContain(
        'Must complete and dispatch SOC Handoff with valid telemetry events for the active hunt.'
      );
    });

    it('5.4 Multi-Hunt Transition Sequence: Completing HUNT-01, switching to HUNT-02, executing queries, ensuring queries are strictly partitioned', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      // Step 1: Execute query in HUNT-01
      act(() => {
        useThreatHuntingStore.getState().setActiveHunt('HUNT-01');
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
      });

      expect(useThreatHuntingStore.getState().executedQueriesByHunt['HUNT-01']).toEqual([
        'sourceWorld = WINDOWS',
      ]);
      expect(useThreatHuntingStore.getState().executedQueriesByHunt['HUNT-02'] || []).toEqual([]);

      // Step 2: Switch to HUNT-02 and execute query
      act(() => {
        useThreatHuntingStore.getState().setActiveHunt('HUNT-02');
        useThreatHuntingStore.getState().executeQuery('sourceWorld = LINUX');
      });

      expect(useThreatHuntingStore.getState().executedQueriesByHunt['HUNT-01']).toEqual([
        'sourceWorld = WINDOWS',
      ]);
      expect(useThreatHuntingStore.getState().executedQueriesByHunt['HUNT-02']).toEqual([
        'sourceWorld = LINUX',
      ]);

      // Step 3: Ensure query executed in HUNT-01 is NOT listed in HUNT-02
      expect(useThreatHuntingStore.getState().executedQueriesByHunt['HUNT-02']).not.toContain(
        'sourceWorld = WINDOWS'
      );
    });
  });

  /* -------------------------------------------------------------------------
   * 6. Detailed OMEGA MAX Section 1-5 Edge Cases & Master Investigation Suite
   * ------------------------------------------------------------------------- */
  describe('6. Detailed OMEGA MAX Section 1-5 Edge Cases & Master Investigation Suite', () => {
    it('6.1 Detection Rule Store & Validator Integrity (Section 1)', () => {
      // 1. Store addDetectionRule ignores caller-provided huntId override
      useThreatHuntingStore.getState().setActiveHunt('HUNT-01');
      const addedRuleId = useThreatHuntingStore.getState().addDetectionRule({
        huntId: 'HUNT-02' as any, // Caller attempt to override huntId!
        nameEn: 'Override Attempt',
        nameAr: 'محاولة تجاوز',
        descriptionEn: 'Test',
        descriptionAr: 'تجربة',
        severity: 'HIGH',
        dataSources: ['WINDOWS'],
        conditions: [],
        mitreTechniques: [],
        status: 'VALIDATED',
        ruleType: 'SINGLE_EVENT',
      });

      const addedRule = useThreatHuntingStore.getState().detections.find((d) => d.id === addedRuleId);
      expect(addedRule?.huntId).toBe('HUNT-01'); // Must be authoritatively set to activeHuntId!

      // 2. Rule with huntId: HUNT-02 but ID beginning with DET-HUNT-01- fails validation for HUNT-01
      const events = useThreatHuntingStore.getState().telemetryEvents;
      const conflictingRule: DetectionRule = {
        id: 'DET-HUNT-01-1',
        huntId: 'HUNT-02', // Explicit conflicting huntId!
        nameEn: 'Conflicting Rule',
        nameAr: 'قاعدة متضاربة',
        descriptionEn: 'Test',
        descriptionAr: 'تجربة',
        severity: 'HIGH',
        dataSources: ['WINDOWS'],
        conditions: [],
        mitreTechniques: [],
        status: 'VALIDATED',
        ruleType: 'SINGLE_EVENT',
        createdAtVirtualTime: 0,
      };

      const valConflicting = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-01-1',
            huntId: 'HUNT-01',
            titleEn: 'Valid Finding',
            titleAr: 'نتيجة مؤكدة',
            summaryEn: 'S',
            summaryAr: 'S',
            severity: 'threat',
            eventIds: [events[0].id, events[1].id],
            rawEventIds: ['r0', 'r1'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 85,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: 'Valid',
            whyAr: 'صحيح',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [conflictingRule],
        detectionResults: {
          'DET-HUNT-01-1': {
            ruleId: 'DET-HUNT-01-1',
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
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      expect(valConflicting.success).toBe(false);
      expect(valConflicting.missingRequirementsEn).toContain(
        'Must author and tune a detection rule for the active hunt with 0 false positives.'
      );

      // 3. Mismatched result.ruleId fails validation
      const validRule: DetectionRule = {
        id: 'DET-HUNT-01-99',
        huntId: 'HUNT-01',
        nameEn: 'Valid Rule',
        nameAr: 'قاعدة',
        descriptionEn: 'D',
        descriptionAr: 'D',
        severity: 'HIGH',
        dataSources: ['WINDOWS'],
        conditions: [],
        mitreTechniques: [],
        status: 'VALIDATED',
        ruleType: 'SINGLE_EVENT',
        createdAtVirtualTime: 0,
      };

      const valMismatchedResult = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [],
        detections: [validRule],
        detectionResults: {
          'DET-HUNT-01-99': {
            ruleId: 'MISMATCHED-RULE-ID', // Mismatched ruleId!
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
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      expect(valMismatchedResult.success).toBe(false);

      // 4. Fabricated telemetry reference in result fails validation
      const valFabricatedTelemetry = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [],
        detections: [validRule],
        detectionResults: {
          'DET-HUNT-01-99': {
            ruleId: 'DET-HUNT-01-99',
            totalEvaluated: 10,
            matchedEventIds: ['fake-fabricated-event-id-999'], // Non-existent telemetry ID!
            truePositives: 1,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: ['fake-fabricated-event-id-999'],
            precision: 1.0,
            recall: 1.0,
            isValid: true,
            tuningAdviceEn: '',
            tuningAdviceAr: '',
          },
        },
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      expect(valFabricatedTelemetry.success).toBe(false);
    });

    it('6.2 Candidate Evaluation & Finding Validation (Section 2)', () => {
      const events = useThreatHuntingStore.getState().telemetryEvents;

      // 1. Candidate evaluation: invalid first finding candidate followed by valid second candidate
      const valCandidateEvaluation = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [
          // Candidate #1: invalid non-existent event IDs
          {
            id: 'FIND-HUNT-01-BAD',
            huntId: 'HUNT-01',
            titleEn: 'Bad Candidate',
            titleAr: 'مرشح سيء',
            summaryEn: 'Fake events',
            summaryAr: 'أحداث مزيفة',
            severity: 'threat',
            eventIds: ['fake-evt-1', 'fake-evt-2'],
            rawEventIds: ['raw1', 'raw2'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 80,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 20, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
          // Candidate #2: valid real events
          {
            id: 'FIND-HUNT-01-GOOD',
            huntId: 'HUNT-01',
            titleEn: 'Good Candidate',
            titleAr: 'مرشح ممتاز',
            summaryEn: 'Real events',
            summaryAr: 'أحداث حقيقية',
            severity: 'threat',
            eventIds: [events[0].id, events[1].id],
            rawEventIds: ['raw-win-01', 'raw-win-02'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 85,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [],
        detectionResults: {},
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      // Valid candidate #2 is correctly evaluated and accepted for finding objective!
      expect(valCandidateEvaluation.completedObjectives).toContain('obj-finding');

      // 2. Duplicate event IDs fail finding validation
      const valDuplicateEvents = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-01-DUP',
            huntId: 'HUNT-01',
            titleEn: 'Duplicate Events',
            titleAr: 'أحداث مكررة',
            summaryEn: 'Dup',
            summaryAr: 'مكرر',
            severity: 'threat',
            eventIds: [events[0].id, events[0].id], // Same ID twice!
            rawEventIds: ['raw-1'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 80,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 20, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [],
        detectionResults: {},
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      expect(valDuplicateEvents.completedObjectives).not.toContain('obj-finding');
    });

    it('6.3 SOC Handoff Evidence Chain & Dispatch Integrity (Section 3)', () => {
      const events = useThreatHuntingStore.getState().telemetryEvents;

      // 1. Handoff with matching huntId but findingId from HUNT-02 fails
      const valWrongFindingHandoff = ThreatHuntValidator.validateScenario('HUNT-01', {
        hunt: useThreatHuntingStore.getState().hunts['HUNT-01'],
        hypothesis: { ...useThreatHuntingStore.getState().hypotheses['HYP-01'], status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-01-1',
            huntId: 'HUNT-01',
            titleEn: 'HUNT-01 Finding',
            titleAr: 'نتيجة سيناريو 1',
            summaryEn: 'S',
            summaryAr: 'S',
            severity: 'threat',
            eventIds: [events[0].id, events[1].id],
            rawEventIds: ['r0', 'r1'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 85,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [],
        detectionResults: {},
        socHandoffs: [
          {
            handoffId: 'SOC-1',
            huntId: 'HUNT-01',
            findingId: 'FIND-HUNT-02-1', // Belongs to HUNT-02!
            rawEventIds: ['r0'],
            eventIds: [events[0].id],
            summaryEn: 'Handoff',
            summaryAr: 'إحالة',
            priority: 'P2_HIGH',
            timestampVirtual: 100,
            status: 'DISPATCHED',
          },
        ],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS'],
        telemetryEvents: events,
      });

      expect(valWrongFindingHandoff.completedObjectives).not.toContain('obj-soc-handoff');

      // 2. Real dispatch workflow execution
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      act(() => {
        useThreatHuntingStore.getState().setActiveHunt('HUNT-01');
        useThreatHuntingStore.getState().addFinding({
          huntId: 'HUNT-01',
          titleEn: 'Real Workflow Finding',
          titleAr: 'نتيجة المسار الفعلي',
          summaryEn: 'Real',
          summaryAr: 'فعلي',
          severity: 'threat',
          eventIds: [events[0].id, events[1].id],
          rawEventIds: ['r0', 'r1'],
          entityRefs: [],
          confidence: 'HIGH',
          status: 'VALIDATED',
          whyEn: '',
          whyAr: '',
        });

        const findingId = useThreatHuntingStore.getState().findings[0].id;
        useThreatHuntingStore.getState().dispatchSocHandoff(findingId);
      });

      const createdHandoff = useThreatHuntingStore.getState().socHandoffs[0];
      expect(createdHandoff).toBeDefined();
      expect(createdHandoff.huntId).toBe('HUNT-01');
      expect(createdHandoff.status).toBe('DISPATCHED');
    });

    it('6.4 Master Investigation Validation & Artifact Isolation (Section 4)', () => {
      const masterScenario = HUNT_SCENARIOS['HUNT-MASTER'];
      const masterEvents = masterScenario.events;

      // 1. Ordinary hunt artifacts (HUNT-01) CANNOT satisfy Master Investigation
      const valMasterWithOrdinaryArtifacts = ThreatHuntValidator.validateMasterChallenge({
        hunt: masterScenario.hunt,
        hypothesis: { ...HUNT_SCENARIOS['HUNT-01'].hypothesis, status: 'SUPPORTED' }, // HYP-01 from HUNT-01!
        findings: [
          {
            id: 'FIND-HUNT-01-1',
            huntId: 'HUNT-01', // Belongs to HUNT-01!
            titleEn: 'Ordinary Finding',
            titleAr: 'نتيجة فردية',
            summaryEn: 'S',
            summaryAr: 'S',
            severity: 'threat',
            eventIds: [masterEvents[0].id, masterEvents[1].id, masterEvents[2].id, masterEvents[3].id],
            rawEventIds: ['r0', 'r1', 'r2', 'r3'],
            entityRefs: [],
            confidence: 'HIGH',
            confidenceScore: 85,
            confidenceBreakdown: { signalCountScore: 20, correlationStrengthScore: 25, intelMatchesScore: 20, sourceDiversityScore: 20 },
            status: 'VALIDATED',
            whyEn: '',
            whyAr: '',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [],
        detectionResults: {},
        socHandoffs: [],
        forensicsHandoffs: [],
        executedQueries: ['sourceWorld = WINDOWS', 'sourceWorld = CLOUD'],
        telemetryEvents: masterEvents,
      });

      expect(valMasterWithOrdinaryArtifacts.success).toBe(false);
      expect(valMasterWithOrdinaryArtifacts.missingRequirementsEn).toContain(
        'Master Campaign Hypothesis must belong to HUNT-MASTER and be supported with cross-world evidence.'
      );

      // 2. Full Master Campaign scenario completes successfully
      const valMasterComplete = ThreatHuntValidator.validateMasterChallenge({
        hunt: masterScenario.hunt,
        hypothesis: { ...masterScenario.hypothesis, status: 'SUPPORTED' },
        findings: [
          {
            id: 'FIND-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            titleEn: 'Cross-World Operation Nexus Breach Chain',
            titleAr: 'سلسلة اختراق عملية نيكسورا عابرة العوالم',
            summaryEn: 'Full cross-domain attack chain correlated',
            summaryAr: 'ربط كامل لسلسلة الهجوم العابرة للنطاقات',
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
            confidenceScore: 95,
            confidenceBreakdown: { signalCountScore: 30, correlationStrengthScore: 25, intelMatchesScore: 25, sourceDiversityScore: 15 },
            status: 'VALIDATED',
            whyEn: 'Correlated across Windows, Network, Cloud, and CI',
            whyAr: 'ربط عبر الويندوز والشبكة والسحابة والبناء',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [
          {
            id: 'DET-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            nameEn: 'Master APT Correlation Rule',
            nameAr: 'قاعدة كشف الهجوم الشامل',
            descriptionEn: 'Detects cross-domain APT chain',
            descriptionAr: 'رصد هجوم متقدم عابر للنطاقات',
            severity: 'HIGH',
            dataSources: ['WINDOWS', 'CLOUD'],
            conditions: [],
            mitreTechniques: ['T1110', 'T1530'],
            status: 'VALIDATED',
            ruleType: 'SINGLE_EVENT',
            createdAtVirtualTime: 0,
          },
        ],
        detectionResults: {
          'DET-HUNT-MASTER-1': {
            ruleId: 'DET-HUNT-MASTER-1',
            totalEvaluated: 50,
            matchedEventIds: [masterEvents[0].id],
            truePositives: 1,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: [masterEvents[0].id],
            precision: 1.0,
            recall: 1.0,
            isValid: true,
            tuningAdviceEn: 'Tuned',
            tuningAdviceAr: 'مضبوطة',
          },
        },
        socHandoffs: [
          {
            handoffId: 'SOC-MASTER-1',
            huntId: 'HUNT-MASTER',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            eventIds: [masterEvents[0].id, masterEvents[1].id],
            summaryEn: 'Dispatched Master Campaign Incident',
            summaryAr: 'إحالة حادثة التحقيق الشامل',
            priority: 'P1_CRITICAL',
            timestampVirtual: 120,
            status: 'DISPATCHED',
          },
        ],
        forensicsHandoffs: [
          {
            handoffId: 'FOR-MASTER-1',
            huntId: 'HUNT-MASTER',
            caseId: 'CASE-NEXORA-MASTER-001',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            acquiredAtVirtualTime: 130,
            evidenceList: [
              {
                id: 'EVD-01',
                type: 'LOG_EXPORT',
                sourceHost: 'FIN-WS-01',
                sourceUser: 'sara',
                acquiredAtVirtualTime: 100,
                originalHash: 'hash1',
                currentHash: 'hash1',
                preserved: true,
                integrityStatus: 'VERIFIED',
                metadata: {},
              },
              {
                id: 'EVD-02',
                type: 'LOG_EXPORT',
                sourceHost: 'DC-01',
                sourceUser: 'admin',
                acquiredAtVirtualTime: 110,
                originalHash: 'hash2',
                currentHash: 'hash2',
                preserved: true,
                integrityStatus: 'VERIFIED',
                metadata: {},
              },
            ],
          },
        ],
        executedQueries: ['sourceWorld = WINDOWS', 'sourceWorld = CLOUD'],
        telemetryEvents: masterEvents,
      });

      expect(valMasterComplete.success).toBe(true);
      expect(valMasterComplete.completedObjectives.length).toBe(6);
    });

    it('6.5 Hunt Switching & Query Integrity Edge Cases (Section 5)', () => {
      useSimulationStore.setState({ activeSimulationId: 'threat_hunting' });
      render(<ThreatHuntingSimulation />);

      // 1. setActiveHunt with unknown hunt ID defaults safely
      act(() => {
        useThreatHuntingStore.getState().setActiveHunt('UNKNOWN-HUNT-999');
      });

      // activeHuntId must be safely normalized to HUNT-01
      expect(useThreatHuntingStore.getState().activeHuntId).toBe('HUNT-01');

      // 2. Failed query is NOT recorded as a successful query execution
      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = "unclosed quote');
      });

      const hunt01Queries = useThreatHuntingStore.getState().executedQueriesByHunt['HUNT-01'] || [];
      expect(hunt01Queries).not.toContain('sourceWorld = "unclosed quote');

      // 3. Valid query executed after failed query is properly recorded
      act(() => {
        useThreatHuntingStore.getState().executeQuery('sourceWorld = WINDOWS');
      });

      expect(useThreatHuntingStore.getState().executedQueriesByHunt['HUNT-01']).toContain('sourceWorld = WINDOWS');
    });

    it('6.6 OMEGA MAX Master Investigation Integrity & Evidence Hardening Regression Tests', () => {
      const masterScenario = HUNT_SCENARIOS['HUNT-MASTER'];
      const masterEvents = masterScenario.events;

      const baseValidMasterState = {
        hunt: masterScenario.hunt,
        hypothesis: { ...masterScenario.hypothesis, status: 'SUPPORTED' as const },
        findings: [
          {
            id: 'FIND-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            titleEn: 'Cross-World Operation Nexus Breach Chain',
            titleAr: 'سلسلة اختراق عملية نيكسورا عابرة العوالم',
            summaryEn: 'Full cross-domain attack chain correlated',
            summaryAr: 'ربط كامل لسلسلة الهجوم العابرة للنطاقات',
            severity: 'critical' as const,
            eventIds: [masterEvents[0].id, masterEvents[1].id, masterEvents[2].id, masterEvents[3].id],
            rawEventIds: [
              masterEvents[0].rawEventId || masterEvents[0].id,
              masterEvents[1].rawEventId || masterEvents[1].id,
              masterEvents[2].rawEventId || masterEvents[2].id,
              masterEvents[3].rawEventId || masterEvents[3].id,
            ],
            entityRefs: [],
            confidence: 'HIGH' as const,
            confidenceScore: 95,
            confidenceBreakdown: { signalCountScore: 30, correlationStrengthScore: 25, intelMatchesScore: 25, sourceDiversityScore: 15 },
            status: 'VALIDATED' as const,
            whyEn: 'Correlated across domains',
            whyAr: 'ربط عبر النطاقات',
            createdAtVirtualTime: 100,
          },
        ],
        detections: [
          {
            id: 'DET-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            nameEn: 'Master Rule',
            nameAr: 'قاعدة شاملة',
            descriptionEn: 'Detects APT',
            descriptionAr: 'كشف الهجوم',
            severity: 'HIGH' as const,
            dataSources: ['WINDOWS', 'CLOUD'] as any,
            conditions: [],
            mitreTechniques: ['T1110'],
            status: 'VALIDATED' as const,
            ruleType: 'SINGLE_EVENT' as const,
            createdAtVirtualTime: 0,
          },
        ],
        detectionResults: {
          'DET-HUNT-MASTER-1': {
            ruleId: 'DET-HUNT-MASTER-1',
            totalEvaluated: 50,
            matchedEventIds: [masterEvents[0].id],
            truePositives: 1,
            falsePositives: 0,
            benignMatches: [],
            maliciousMatches: [masterEvents[0].id],
            precision: 1.0,
            recall: 1.0,
            isValid: true,
            tuningAdviceEn: 'Tuned',
            tuningAdviceAr: 'مضبوطة',
          },
        },
        socHandoffs: [
          {
            handoffId: 'SOC-HANDOFF-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            eventIds: [masterEvents[0].id, masterEvents[1].id],
            summaryEn: 'Dispatched Master Campaign Incident',
            summaryAr: 'إحالة حادثة التحقيق الشامل',
            priority: 'P1_CRITICAL' as const,
            timestampVirtual: 120,
            status: 'DISPATCHED' as const,
          },
        ],
        forensicsHandoffs: [
          {
            handoffId: 'FOR-HANDOFF-HUNT-MASTER-1',
            huntId: 'HUNT-MASTER',
            caseId: 'CASE-NEXORA-MASTER-001',
            findingId: 'FIND-HUNT-MASTER-1',
            rawEventIds: [masterEvents[0].rawEventId || masterEvents[0].id, masterEvents[1].rawEventId || masterEvents[1].id],
            acquiredAtVirtualTime: 130,
            evidenceList: [
              {
                id: 'EVD-01',
                type: 'LOG_EXPORT' as const,
                sourceHost: 'FIN-WS-01',
                sourceUser: 'sara',
                acquiredAtVirtualTime: 100,
                originalHash: 'hash1',
                currentHash: 'hash1',
                preserved: true,
                integrityStatus: 'VERIFIED' as const,
                metadata: {},
              },
              {
                id: 'EVD-02',
                type: 'LOG_EXPORT' as const,
                sourceHost: 'DC-01',
                sourceUser: 'admin',
                acquiredAtVirtualTime: 110,
                originalHash: 'hash2',
                currentHash: 'hash2',
                preserved: true,
                integrityStatus: 'VERIFIED' as const,
                metadata: {},
              },
            ],
          },
        ],
        executedQueries: ['sourceWorld = WINDOWS', 'sourceWorld = CLOUD'],
        telemetryEvents: masterEvents,
      };

      // Sanity check: valid state passes
      expect(ThreatHuntValidator.validateMasterChallenge(baseValidMasterState).success).toBe(true);

      // Case 1: Conflicting explicit huntId on finding (huntId: 'HUNT-01', id: 'FIND-HUNT-MASTER-1')
      const invalidFindingOwnership = {
        ...baseValidMasterState,
        findings: [
          {
            ...baseValidMasterState.findings[0],
            huntId: 'HUNT-01', // Conflicting explicit huntId!
          },
        ],
      };
      expect(ThreatHuntValidator.validateMasterChallenge(invalidFindingOwnership).success).toBe(false);

      // Case 2: Duplicate event IDs resulting in < 4 distinct events
      const duplicateEventsState = {
        ...baseValidMasterState,
        findings: [
          {
            ...baseValidMasterState.findings[0],
            eventIds: [masterEvents[0].id, masterEvents[1].id, masterEvents[0].id, masterEvents[1].id], // Only 2 distinct events!
          },
        ],
      };
      expect(ThreatHuntValidator.validateMasterChallenge(duplicateEventsState).success).toBe(false);

      // Case 3: Conflicting explicit huntId on detection rule
      const invalidRuleOwnership = {
        ...baseValidMasterState,
        detections: [
          {
            ...baseValidMasterState.detections[0],
            huntId: 'HUNT-01', // Conflicting explicit huntId!
          },
        ],
      };
      expect(ThreatHuntValidator.validateMasterChallenge(invalidRuleOwnership).success).toBe(false);

      // Case 4: Conflicting explicit huntId on SOC handoff
      const invalidSocOwnership = {
        ...baseValidMasterState,
        socHandoffs: [
          {
            ...baseValidMasterState.socHandoffs[0],
            huntId: 'HUNT-02', // Conflicting explicit huntId!
          },
        ],
      };
      expect(ThreatHuntValidator.validateMasterChallenge(invalidSocOwnership).success).toBe(false);

      // Case 5: Conflicting explicit huntId on Forensics handoff
      const invalidForOwnership = {
        ...baseValidMasterState,
        forensicsHandoffs: [
          {
            ...baseValidMasterState.forensicsHandoffs[0],
            huntId: 'HUNT-03', // Conflicting explicit huntId!
          },
        ],
      };
      expect(ThreatHuntValidator.validateMasterChallenge(invalidForOwnership).success).toBe(false);

      // Case 6: Forensics evidence with unverified integrity status
      const unverifiedEvidenceState = {
        ...baseValidMasterState,
        forensicsHandoffs: [
          {
            ...baseValidMasterState.forensicsHandoffs[0],
            evidenceList: [
              baseValidMasterState.forensicsHandoffs[0].evidenceList[0],
              {
                ...baseValidMasterState.forensicsHandoffs[0].evidenceList[1],
                integrityStatus: 'MISMATCH' as const, // TAMPERED EVIDENCE!
              },
            ],
          },
        ],
      };
      expect(ThreatHuntValidator.validateMasterChallenge(unverifiedEvidenceState).success).toBe(false);
    });
  });
});
