import {
  DEFAULT_LESSON_ID,
  safeParseActiveLessonId,
  safeParseCompletedChallenges,
  safeParseCompletedLessons,
  safeParseLessonProgress,
  sanitizeCompletedLessonsSequence,
  safeParseOnboardingProgress,
  VALID_CHALLENGE_IDS,
  VALID_CURRICULUM_LESSON_IDS,
} from '../stores/simulationStore';

export interface SyncedProgress {
  completedLessons: string[];
  completedChallenges: string[];
  lessonProgress: ReturnType<typeof safeParseLessonProgress>;
  onboardingProgress: {
    firewallInspected: boolean;
    policyAltered: boolean;
  };
  activeLessonId: string;
}

/**
 * Firestore documents may have been written by older client versions.
 * Treat their contents as untrusted input and reuse the same allowlists and
 * progression checks used when restoring browser storage.
 *
 * This sanitization protects UI state; it is not server-side proof of achievement.
 */
export const sanitizeCloudProgress = (data: Record<string, unknown>): SyncedProgress => {
  const rawChallenges = Array.isArray(data.completedChallenges)
    ? JSON.stringify(data.completedChallenges)
    : '[]';
  const allowedChallenges = safeParseCompletedChallenges(rawChallenges, VALID_CHALLENGE_IDS);

  const rawOnboarding = data.onboardingProgress &&
    typeof data.onboardingProgress === 'object' &&
    !Array.isArray(data.onboardingProgress)
    ? JSON.stringify(data.onboardingProgress)
    : '{}';
  const parsedOnboarding = safeParseOnboardingProgress(rawOnboarding);
  const onboardingProgress = {
    firewallInspected: parsedOnboarding.firewallInspected,
    policyAltered: parsedOnboarding.firewallInspected && parsedOnboarding.policyAltered,
  };

  const rawLessons = Array.isArray(data.completedLessons)
    ? JSON.stringify(data.completedLessons)
    : '[]';
  const candidateLessons = safeParseCompletedLessons(rawLessons, VALID_CURRICULUM_LESSON_IDS);
  const sequentialLessons = sanitizeCompletedLessonsSequence(candidateLessons);

  const rawLessonProgress = data.lessonProgress &&
    typeof data.lessonProgress === 'object' &&
    !Array.isArray(data.lessonProgress)
    ? JSON.stringify(data.lessonProgress)
    : '{}';
  const lessonProgress = safeParseLessonProgress(rawLessonProgress, sequentialLessons);

  const completedLessons = sanitizeCompletedLessonsSequence(
    sequentialLessons.filter((lessonId) => {
      const progress = lessonProgress[lessonId];
      return progress?.isQuizPassed === true && progress?.isTaskPassed === true;
    })
  );

  const completedChallenges = allowedChallenges.filter((challengeId) => {
    if (challengeId === 'orientation-guided-challenge') {
      return onboardingProgress.firewallInspected && onboardingProgress.policyAltered;
    }
    return true;
  });

  return {
    completedLessons,
    completedChallenges,
    lessonProgress,
    onboardingProgress,
    activeLessonId: safeParseActiveLessonId(
      typeof data.activeLessonId === 'string' ? data.activeLessonId : DEFAULT_LESSON_ID
    ),
  };
};
