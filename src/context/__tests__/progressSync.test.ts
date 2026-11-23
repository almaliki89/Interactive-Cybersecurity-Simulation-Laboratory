import { describe, expect, it } from 'vitest';
import { sanitizeCloudProgress } from '../progressSync';

describe('sanitizeCloudProgress', () => {
  it('drops unknown challenge IDs and requires both guided onboarding activities', () => {
    const withoutOnboarding = sanitizeCloudProgress({
      completedChallenges: ['cia-balance-challenge', 'not-a-real-challenge', 'orientation-guided-challenge'],
    });

    expect(withoutOnboarding.completedChallenges).toEqual(['cia-balance-challenge']);

    const withOnboarding = sanitizeCloudProgress({
      completedChallenges: ['orientation-guided-challenge'],
      onboardingProgress: { firewallInspected: true, policyAltered: true },
    });

    expect(withOnboarding.completedChallenges).toEqual(['orientation-guided-challenge']);
  });

  it('does not trust a completed lesson without explicit quiz and task pass flags', () => {
    const result = sanitizeCloudProgress({
      completedLessons: ['lesson-01-cia-triad'],
      lessonProgress: {
        'lesson-01-cia-triad': {
          currentStage: 6,
          furthestUnlockedStage: 6,
          isQuizPassed: true,
          isTaskPassed: false,
        },
      },
    });

    expect(result.completedLessons).toEqual([]);
    expect(result.lessonProgress['lesson-01-cia-triad'].isTaskPassed).toBe(false);
  });

  it('keeps valid sequential completion and rejects malformed or unknown records', () => {
    const result = sanitizeCloudProgress({
      completedLessons: ['lesson-01-cia-triad', 'invalid-lesson'],
      lessonProgress: {
        'lesson-01-cia-triad': {
          currentStage: 6,
          furthestUnlockedStage: 6,
          isQuizPassed: true,
          isTaskPassed: true,
        },
        'invalid-lesson': { isQuizPassed: true, isTaskPassed: true },
      },
      activeLessonId: 'not-a-real-lesson',
      onboardingProgress: { firewallInspected: 'yes', policyAltered: true },
    });

    expect(result.completedLessons).toEqual(['lesson-01-cia-triad']);
    expect(result.lessonProgress['invalid-lesson']).toBeUndefined();
    expect(result.activeLessonId).toBe('lesson-01-cia-triad');
    expect(result.onboardingProgress).toEqual({
      firewallInspected: false,
      policyAltered: false,
    });
  });
});
