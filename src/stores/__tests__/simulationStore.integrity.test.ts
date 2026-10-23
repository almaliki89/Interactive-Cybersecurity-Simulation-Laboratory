// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import {
  useSimulationStore,
  LESSON_SEQUENCE,
  VALID_CHALLENGE_IDS,
  VALID_CURRICULUM_LESSON_IDS,
  safeParseCompletedChallenges,
  safeParseLessonProgress,
  clearChallengeValidators,
} from '../simulationStore';
import {
  validateCiaControls,
  calculateCiaHealth,
} from '../../simulations/foundations/CiaTriadSimulation';

describe('SimulationStore Integrity & Gating (OMEGA MAX)', () => {
  beforeEach(() => {
    cleanup();
    clearChallengeValidators();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    // Reset state
    useSimulationStore.setState({
      language: 'ar',
      activeSimulationId: 'landing',
      activeLessonId: 'lesson-01-cia-triad',
      completedLessons: [],
      completedChallenges: [],
      lessonProgress: {},
    });
  });

  describe('CIA Triad Simulator Physics & Validation Engine', () => {
    it('NEGATIVE: Fails verification when Encryption is disabled', () => {
      const result = validateCiaControls({
        encryptionEnabled: false,
        signingEnabled: true,
        redundancyEnabled: true,
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('ما زالت هناك ثغرات');
    });

    it('NEGATIVE: Fails verification when Digital Signatures (Integrity) are disabled', () => {
      const result = validateCiaControls({
        encryptionEnabled: true,
        signingEnabled: false,
        redundancyEnabled: true,
      });
      expect(result.success).toBe(false);
    });

    it('NEGATIVE: Fails verification when Redundancy (Availability) is disabled', () => {
      const result = validateCiaControls({
        encryptionEnabled: true,
        signingEnabled: true,
        redundancyEnabled: false,
      });
      expect(result.success).toBe(false);
    });

    it('NEGATIVE: Risk spikes and verification fails under DoS attack without redundancy', () => {
      const health = calculateCiaHealth({
        encryptionEnabled: true,
        signingEnabled: true,
        redundancyEnabled: false,
        dosAttack: true,
      });
      expect(health.availabilityScore).toBe(10);
      expect(health.overallRisk).toBeGreaterThanOrEqual(20);

      const result = validateCiaControls({
        encryptionEnabled: true,
        signingEnabled: true,
        redundancyEnabled: false,
        dosAttack: true,
      });
      expect(result.success).toBe(false);
    });

    it('POSITIVE: Passes verification when all 3 controls are active and risk is minimized', () => {
      const health = calculateCiaHealth({
        encryptionEnabled: true,
        signingEnabled: true,
        redundancyEnabled: true,
      });
      expect(health.confidentialityScore).toBe(100);
      expect(health.integrityScore).toBe(100);
      expect(health.availabilityScore).toBe(100);
      expect(health.overallRisk).toBe(0);

      const result = validateCiaControls(
        {
          encryptionEnabled: true,
          signingEnabled: true,
          redundancyEnabled: true,
        },
        'ar'
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('ممتاز! تم تحصين ثالوث CIA');
    });
  });

  describe('Challenge Completion Integrity', () => {
    it('NEGATIVE: Rejects empty, whitespace, null, or non-string challenge IDs', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'cia_triad' });

      // @ts-ignore
      store.completeChallenge('', { success: true });
      // @ts-ignore
      store.completeChallenge('    ', { success: true });
      // @ts-ignore
      store.completeChallenge(null, { success: true });
      // @ts-ignore
      store.completeChallenge(undefined, { success: true });
      // @ts-ignore
      store.completeChallenge(12345, { success: true });

      expect(useSimulationStore.getState().completedChallenges).toHaveLength(0);
    });

    it('NEGATIVE: Rejects arbitrary/unknown challenge IDs not registered in the project', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'cia_triad' });

      store.completeChallenge('hacker-exploit-999', { success: true });
      store.completeChallenge('random-fake-id', { success: true });

      expect(useSimulationStore.getState().completedChallenges).not.toContain('hacker-exploit-999');
      expect(useSimulationStore.getState().completedChallenges).not.toContain('random-fake-id');
      expect(useSimulationStore.getState().completedChallenges).toHaveLength(0);
    });

    it('NEGATIVE: Rejects completion when verificationResult is completely omitted', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'cia_triad' });

      // Omitted verification outcome must be rejected
      // @ts-ignore
      store.completeChallenge('cia-balance-challenge');
      expect(useSimulationStore.getState().completedChallenges).not.toContain('cia-balance-challenge');
      expect(useSimulationStore.getState().completedChallenges).toHaveLength(0);
    });

    it('NEGATIVE: Rejects completion when verificationResult is null, undefined, or empty object', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'cia_triad' });

      // @ts-ignore
      store.completeChallenge('cia-balance-challenge', null);
      // @ts-ignore
      store.completeChallenge('cia-balance-challenge', undefined);
      // @ts-ignore
      store.completeChallenge('cia-balance-challenge', {});

      expect(useSimulationStore.getState().completedChallenges).toHaveLength(0);
    });

    it('NEGATIVE: Rejects completion when verificationResult.success is not strictly boolean true', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'cia_triad' });

      // Truthy strings, numbers, or non-boolean primitives must not bypass validation
      // @ts-ignore
      store.completeChallenge('cia-balance-challenge', { success: 'true' });
      // @ts-ignore
      store.completeChallenge('cia-balance-challenge', { success: 1 });
      // @ts-ignore
      store.completeChallenge('cia-balance-challenge', { success: 'yes' });

      expect(useSimulationStore.getState().completedChallenges).toHaveLength(0);
    });

    it('NEGATIVE: Rejects completion if verificationResult indicates failure', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'cia_triad' });

      store.completeChallenge('cia-balance-challenge', { success: false });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('cia-balance-challenge');
    });

    it('NEGATIVE: Rejects completion of a valid challenge if simulation context is WRONG', () => {
      const store = useSimulationStore.getState();
      // 'cia-balance-challenge' requires 'cia_triad' simulation
      useSimulationStore.setState({ activeSimulationId: 'firewall' });

      store.completeChallenge('cia-balance-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('cia-balance-challenge');
    });

    it('ANTI-FABRICATION: Rejects fabricated { success: true } when registered live validator fails', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'cia_triad' });

      // Register a live simulation validator that reports unmet controls
      let controlsSatisfied = false;
      store.registerChallengeValidator('cia-balance-challenge', () => ({
        success: controlsSatisfied,
        message: controlsSatisfied ? 'Controls verified' : 'Incomplete controls',
      }));

      // Caller attempts to fabricate success without fulfilling simulation controls
      store.completeChallenge('cia-balance-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('cia-balance-challenge');

      // Now satisfy the simulation controls in live state
      controlsSatisfied = true;
      store.completeChallenge('cia-balance-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).toContain('cia-balance-challenge');
    });

    it('MASTER AUDIT: Rejects master challenge completion if no active validator is registered', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'soc' });

      // No registered validator -> must be rejected
      store.completeChallenge('soc_master', { success: true, score: 100 });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('soc_master');
    });

    it('MASTER AUDIT: Rejects invalid, non-finite, missing, or < 100 scores for master challenges', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'soc' });

      // Register live validator that returns invalid scores
      let testScore: any = 80;
      store.registerChallengeValidator('soc_master', () => ({
        success: true,
        score: testScore,
      }));

      // 1. Below 100 (80)
      store.completeChallenge('soc_master', { success: true, score: 100 });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('soc_master');

      // 2. 99.9 (Below 100)
      testScore = 99.9;
      store.completeChallenge('soc_master', { success: true, score: 100 });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('soc_master');

      // 3. Missing / Undefined score
      testScore = undefined;
      store.completeChallenge('soc_master', { success: true, score: 100 });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('soc_master');

      // 4. NaN score
      testScore = NaN;
      store.completeChallenge('soc_master', { success: true, score: 100 });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('soc_master');

      // 5. Infinity score
      testScore = Infinity;
      store.completeChallenge('soc_master', { success: true, score: 100 });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('soc_master');

      // 6. String score ("100")
      testScore = '100';
      store.completeChallenge('soc_master', { success: true, score: 100 });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('soc_master');

      // 7. Null score
      testScore = null;
      store.completeChallenge('soc_master', { success: true, score: 100 });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('soc_master');
    });

    it('MASTER AUDIT: Authoritative registered validator score overrides untrusted caller-supplied score', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'soc' });

      // Caller claims score: 100, but live validator produces score: 85 -> Must REJECT
      store.registerChallengeValidator('soc_master', () => ({
        success: true,
        score: 85,
      }));
      store.completeChallenge('soc_master', { success: true, score: 100 });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('soc_master');

      // Live validator produces authoritative score: 100 -> Must ACCEPT
      store.registerChallengeValidator('soc_master', () => ({
        success: true,
        score: 100,
      }));
      store.completeChallenge('soc_master', { success: true, score: 50 }); // Caller passed 50, but live validator produced 100
      expect(useSimulationStore.getState().completedChallenges).toContain('soc_master');
    });

    it('MASTER AUDIT: Verifies all 6 master challenges with their respective registered validators and required simulation contexts', () => {
      const masterChallenges = [
        { id: 'linux-hardening', simId: 'linux' },
        { id: 'windows_hardening', simId: 'windows' },
        { id: 'soc_master', simId: 'soc' },
        { id: 'appsec_master', simId: 'appsec_api' },
        { id: 'nexora_master', simId: 'nexora_master' },
        { id: 'ad_nexora_migration_master', simId: 'active_directory' },
      ] as const;

      for (const mc of masterChallenges) {
        useSimulationStore.setState({ activeSimulationId: mc.simId, completedChallenges: [] });
        useSimulationStore.getState().registerChallengeValidator(mc.id, () => ({
          success: true,
          score: 100,
        }));

        useSimulationStore.getState().completeChallenge(mc.id, { success: true, score: 100 });
        expect(useSimulationStore.getState().completedChallenges).toContain(mc.id);
      }
    });

    it('POSITIVE: Accepts completion of valid challenge when simulation context and verification are correct', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'cia_triad' });

      store.completeChallenge('cia-balance-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).toContain('cia-balance-challenge');
    });
  });

  describe('Curriculum Sequence Integrity', () => {
    it('NEGATIVE: Rejects completing Lesson 2 if Lesson 1 is not completed', () => {
      const store = useSimulationStore.getState();
      store.completeLesson('lesson-02-system-internals');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-02-system-internals');
    });

    it('NEGATIVE: Rejects completing Lesson 1 if quiz or task is not passed', () => {
      const store = useSimulationStore.getState();
      // Only quiz passed, task unpassed
      store.updateLessonProgressState('lesson-01-cia-triad', { isQuizPassed: true, isTaskPassed: false });
      store.completeLesson('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-01-cia-triad');

      // Only task passed, quiz unpassed
      store.updateLessonProgressState('lesson-01-cia-triad', { isQuizPassed: false, isTaskPassed: true });
      store.completeLesson('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-01-cia-triad');
    });

    it('POSITIVE: Accepts completing Lesson 1 then Lesson 2 in legitimate sequential order', () => {
      const store = useSimulationStore.getState();

      // Complete Lesson 1
      store.updateLessonProgressState('lesson-01-cia-triad', { isQuizPassed: true, isTaskPassed: true });
      store.completeLesson('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).toContain('lesson-01-cia-triad');

      // Now Lesson 2 should complete successfully
      store.updateLessonProgressState('lesson-02-system-internals', { isQuizPassed: true, isTaskPassed: true });
      store.completeLesson('lesson-02-system-internals');
      expect(useSimulationStore.getState().completedLessons).toContain('lesson-02-system-internals');
    });

    it('NEGATIVE: Rejects jumping to Stage 1 of Lesson 2 if Lesson 1 is not completed', () => {
      const store = useSimulationStore.getState();

      // Lesson 1 is NOT completed
      store.setLessonStage('lesson-02-system-internals', 1);

      const progress = useSimulationStore.getState().lessonProgress['lesson-02-system-internals'];
      // Should remain at 0
      expect(progress?.currentStage ?? 0).toBe(0);
    });

    it('POSITIVE: Allows reviewing Stage 0 of Lesson 2 even before Lesson 1 completion', () => {
      const store = useSimulationStore.getState();
      store.setLessonStage('lesson-02-system-internals', 0);
      const progress = useSimulationStore.getState().lessonProgress['lesson-02-system-internals'];
      expect(progress?.currentStage).toBe(0);
    });

    it('POSITIVE: Allows reviewing previously unlocked stages in a completed or ongoing lesson', () => {
      const store = useSimulationStore.getState();
      // Step to stage 1 then stage 2
      store.setLessonStage('lesson-01-cia-triad', 1);
      store.setLessonStage('lesson-01-cia-triad', 2);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.currentStage).toBe(2);

      // Review stage 0
      store.setLessonStage('lesson-01-cia-triad', 0);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.currentStage).toBe(0);
      // Furthest remains 2
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.furthestUnlockedStage).toBe(2);
    });
  });

  describe('Storage Restoration Sanitization & Tamper Resistance', () => {
    it('NEGATIVE: Sanitizes jumped lesson sequence from localStorage during reloadFromStorage', () => {
      // Manually tamper with localStorage: skip lesson 2
      localStorage.setItem(
        'omega_completed_lessons',
        JSON.stringify(['lesson-01-cia-triad', 'lesson-03-subnet-routing'])
      );

      const store = useSimulationStore.getState();
      store.reloadFromStorage();

      // Should only contain lesson-01
      expect(useSimulationStore.getState().completedLessons).toContain('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-03-subnet-routing');
      expect(useSimulationStore.getState().completedLessons).toHaveLength(1);
    });

    it('NEGATIVE: Filters out fake/unregistered challenge IDs from localStorage', () => {
      localStorage.setItem(
        'omega_completed_challenges',
        JSON.stringify(['cia-balance-challenge', 'injected-fake-challenge', 999])
      );

      const store = useSimulationStore.getState();
      store.reloadFromStorage();

      expect(useSimulationStore.getState().completedChallenges).toEqual(['cia-balance-challenge']);
      expect(useSimulationStore.getState().completedChallenges).not.toContain('injected-fake-challenge');
    });

    it('NEGATIVE: Clamps tampered furthestUnlockedStage to 5 if lesson is not completed', () => {
      const tamperedRaw = JSON.stringify({
        'lesson-01-cia-triad': {
          currentStage: 6,
          furthestUnlockedStage: 6,
        },
      });

      const parsed = safeParseLessonProgress(tamperedRaw, []);
      // Because lesson-01 is not in completedLessons, furthestUnlockedStage cannot be 6
      expect(parsed['lesson-01-cia-triad'].furthestUnlockedStage).toBeLessThanOrEqual(5);
      expect(parsed['lesson-01-cia-triad'].currentStage).toBeLessThanOrEqual(5);
    });

    it('POSITIVE: Correctly preserves quiz answers and guided task steps across reload', () => {
      const validProgressRaw = JSON.stringify({
        'lesson-01-cia-triad': {
          currentStage: 3,
          furthestUnlockedStage: 3,
          quizAnswers: { 'q-cia-1': 'opt-avail' },
          quizSubmitted: { 'q-cia-1': true },
          checkedTaskSteps: { 'step-1': true },
          manualConfirmationChecked: true,
        },
      });

      localStorage.setItem('omega_lesson_progress', validProgressRaw);
      localStorage.setItem('omega_active_lesson_id', 'lesson-01-cia-triad');

      const store = useSimulationStore.getState();
      store.reloadFromStorage();

      const progress = useSimulationStore.getState().lessonProgress['lesson-01-cia-triad'];
      expect(progress.quizAnswers?.['q-cia-1']).toBe('opt-avail');
      expect(progress.quizSubmitted?.['q-cia-1']).toBe(true);
      expect(progress.checkedTaskSteps?.['step-1']).toBe(true);
      expect(progress.manualConfirmationChecked).toBe(true);
    });

    it('NEGATIVE: Filters out fake/unregistered lesson IDs from localStorage', () => {
      localStorage.setItem(
        'omega_completed_lessons',
        JSON.stringify(['fake-lesson-x', 'lesson-01-cia-triad', 'evil-lesson-99'])
      );

      const store = useSimulationStore.getState();
      store.reloadFromStorage();

      // Only valid lesson-01 should be retained; invalid IDs discarded
      expect(useSimulationStore.getState().completedLessons).toEqual(['lesson-01-cia-triad']);
    });

    it('NEGATIVE: Resilient against severely malformed storage entries without crashing', () => {
      localStorage.setItem('omega_completed_challenges', 'not-valid-json{{{');
      localStorage.setItem('omega_completed_lessons', '{"bad": true}');
      localStorage.setItem('omega_lesson_progress', '[1, 2, 3]');
      localStorage.setItem('omega_language', 'invalid_lang');

      const store = useSimulationStore.getState();
      expect(() => store.reloadFromStorage()).not.toThrow();

      expect(useSimulationStore.getState().completedChallenges).toEqual([]);
      expect(useSimulationStore.getState().completedLessons).toEqual([]);
      expect(useSimulationStore.getState().lessonProgress).toEqual({});
      expect(useSimulationStore.getState().language).toBe('ar');
    });

    it('NEGATIVE: Rejects completing a lesson when quiz or task completion state is missing or false', () => {
      const store = useSimulationStore.getState();

      // 1. Neither quiz nor task fulfilled
      store.completeLesson('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-01-cia-triad');

      // 2. Quiz passed but task missing
      store.updateLessonProgressState('lesson-01-cia-triad', { isQuizPassed: true, isTaskPassed: false });
      store.completeLesson('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-01-cia-triad');

      // 3. Task passed but quiz missing
      store.updateLessonProgressState('lesson-01-cia-triad', { isQuizPassed: false, isTaskPassed: true });
      store.completeLesson('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-01-cia-triad');

      // 4. Both passed -> completion succeeds
      store.updateLessonProgressState('lesson-01-cia-triad', { isQuizPassed: true, isTaskPassed: true });
      store.completeLesson('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).toContain('lesson-01-cia-triad');
    });

    it('NEGATIVE: safeParseLessonProgress sanitizes malformed nested types and clamps stages', () => {
      const malformedRaw = JSON.stringify({
        'lesson-01-cia-triad': {
          currentStage: 'invalid-stage-type',
          furthestUnlockedStage: -99,
          quizAnswers: ['not-an-object'],
          quizSubmitted: 'invalid-boolean-map',
          checkedTaskSteps: 12345,
          manualConfirmationChecked: 'not-a-bool',
          isQuizPassed: 'true', // string instead of boolean
          isTaskPassed: 1,      // number instead of boolean
        },
      });

      const parsed = safeParseLessonProgress(malformedRaw, []);
      const item = parsed['lesson-01-cia-triad'];
      expect(item).toBeDefined();
      expect(item.currentStage).toBe(0);
      expect(item.furthestUnlockedStage).toBe(0);
      expect(item.quizAnswers).toBeUndefined();
      expect(item.quizSubmitted).toBeUndefined();
      expect(item.checkedTaskSteps).toBeUndefined();
      expect(item.manualConfirmationChecked).toBeUndefined();
      expect(item.isQuizPassed).toBeUndefined();
      expect(item.isTaskPassed).toBeUndefined();
    });

    it('POSITIVE: Reconstructed completed lessons in safeParseLessonProgress have stage 6 and verified flags', () => {
      // When storage has completed lesson but empty/null lesson progress
      const parsed = safeParseLessonProgress(null, ['lesson-01-cia-triad']);
      expect(parsed['lesson-01-cia-triad']).toBeDefined();
      expect(parsed['lesson-01-cia-triad'].currentStage).toBe(6);
      expect(parsed['lesson-01-cia-triad'].furthestUnlockedStage).toBe(6);
      expect(parsed['lesson-01-cia-triad'].isQuizPassed).toBe(true);
      expect(parsed['lesson-01-cia-triad'].isTaskPassed).toBe(true);
    });
  });
});
