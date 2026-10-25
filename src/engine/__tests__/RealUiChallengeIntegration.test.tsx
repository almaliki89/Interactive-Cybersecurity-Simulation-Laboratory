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
});
