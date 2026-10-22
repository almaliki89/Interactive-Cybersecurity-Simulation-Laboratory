// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useSimulationStore, LESSON_SEQUENCE, VALID_CHALLENGE_IDS } from '../simulationStore';

describe('SimulationStore Integrity & Gating (OMEGA MAX)', () => {
  beforeEach(() => {
    cleanup();
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

  describe('Challenge Completion Integrity', () => {
    it('REJECTS completion of an arbitrary/unknown challenge ID', () => {
      const store = useSimulationStore.getState();
      store.completeChallenge('hacker-exploit-999');
      expect(useSimulationStore.getState().completedChallenges).not.toContain('hacker-exploit-999');
      expect(useSimulationStore.getState().completedChallenges).toHaveLength(0);
    });

    it('REJECTS completion of a valid challenge if the simulation context is WRONG', () => {
      const store = useSimulationStore.getState();
      // 'cia-balance-challenge' requires 'cia_triad' simulation
      useSimulationStore.setState({ activeSimulationId: 'firewall' });
      
      store.completeChallenge('cia-balance-challenge');
      expect(useSimulationStore.getState().completedChallenges).not.toContain('cia-balance-challenge');
    });

    it('ACCEPTS completion of a valid challenge if the simulation context is CORRECT', () => {
      const store = useSimulationStore.getState();
      useSimulationStore.setState({ activeSimulationId: 'cia_triad' });
      
      store.completeChallenge('cia-balance-challenge');
      expect(useSimulationStore.getState().completedChallenges).toContain('cia-balance-challenge');
    });
  });

  describe('Curriculum Sequence Integrity', () => {
    it('REJECTS completing Lesson 2 if Lesson 1 is not completed', () => {
      const store = useSimulationStore.getState();
      store.completeLesson('lesson-02-system-internals');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-02-system-internals');
    });

    it('ACCEPTS completing Lesson 1 then Lesson 2 in order', () => {
      const store = useSimulationStore.getState();
      
      // Complete Lesson 1
      store.updateLessonProgressState('lesson-01-cia-triad', { isQuizPassed: true, isTaskPassed: true });
      store.completeLesson('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).toContain('lesson-01-cia-triad');

      // Now Lesson 2 should work
      store.updateLessonProgressState('lesson-02-system-internals', { isQuizPassed: true, isTaskPassed: true });
      store.completeLesson('lesson-02-system-internals');
      expect(useSimulationStore.getState().completedLessons).toContain('lesson-02-system-internals');
    });

    it('REJECTS advancing to Stage 1 of Lesson 2 if Lesson 1 is not completed', () => {
      const store = useSimulationStore.getState();
      
      // Lesson 1 is NOT completed
      store.setLessonStage('lesson-02-system-internals', 1);
      
      const progress = useSimulationStore.getState().lessonProgress['lesson-02-system-internals'];
      // Should remain at 0
      expect(progress?.currentStage ?? 0).toBe(0);
    });

    it('ACCEPTS Stage 0 (Review/Intro) of Lesson 2 even if Lesson 1 is not completed', () => {
      const store = useSimulationStore.getState();
      store.setLessonStage('lesson-02-system-internals', 0);
      const progress = useSimulationStore.getState().lessonProgress['lesson-02-system-internals'];
      expect(progress?.currentStage).toBe(0);
    });
  });

  describe('Storage Restoration Sanitization', () => {
    it('SANUTIZES a jumped lesson sequence during reloadFromStorage', () => {
      // Manually tamper with localStorage
      localStorage.setItem('omega_completed_lessons', JSON.stringify([
        'lesson-01-cia-triad',
        'lesson-03-subnet-routing' // Jumped over Lesson 2
      ]));

      const store = useSimulationStore.getState();
      store.reloadFromStorage();

      // Should only contain lesson-01
      expect(useSimulationStore.getState().completedLessons).toContain('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-03-subnet-routing');
      expect(useSimulationStore.getState().completedLessons).toHaveLength(1);
    });
  });
});
