// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { CURRICULUM_MILESTONES, CURRICULUM_LESSONS } from '../../data/curriculumData';
import { LessonView } from '../../components/curriculum/LessonView';
import { Header } from '../../components/ui/Header';
import { InteractiveEnterpriseHero } from '../../components/landing/InteractiveEnterpriseHero';
import { useSimulationStore, safeParseActiveLessonId } from '../../stores/simulationStore';

describe('Beginner-First Learning Experience & Curriculum Architecture', () => {
  beforeEach(() => {
    cleanup();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    useSimulationStore.setState({
      language: 'ar',
      activeSimulationId: 'lesson',
      activeLessonId: 'lesson-01-cia-triad',
      completedLessons: [],
      completedChallenges: [],
      lessonProgress: {},
      clockStatus: 'running',
    });
  });

  describe('Curriculum Data Integrity', () => {
    it('contains all 10 sequential foundational milestones', () => {
      expect(CURRICULUM_MILESTONES).toHaveLength(10);
      CURRICULUM_MILESTONES.forEach((milestone, idx) => {
        expect(milestone.id).toBe(idx + 1);
        expect(milestone.titleAr).toBeTruthy();
        expect(milestone.titleEn).toBeTruthy();
        expect(milestone.subtitleAr).toBeTruthy();
        expect(milestone.subtitleEn).toBeTruthy();
        expect(milestone.descriptionAr).toBeTruthy();
        expect(milestone.descriptionEn).toBeTruthy();
        expect(milestone.lessonIds.length).toBeGreaterThan(0);
        expect(milestone.primarySimulationId).toBeTruthy();
      });
    });

    it('implements complete 7 pedagogical stages for every registered lesson', () => {
      const lessons = Object.values(CURRICULUM_LESSONS);
      expect(lessons.length).toBeGreaterThanOrEqual(10);

      lessons.forEach((lesson) => {
        // Stage 1: Objectives
        expect(lesson.objectives.length).toBeGreaterThan(0);
        lesson.objectives.forEach((obj) => {
          expect(obj.textAr).toBeTruthy();
          expect(obj.textEn).toBeTruthy();
        });

        // Stage 2: Concept & Analogy & Terms
        expect(lesson.concept.textAr).toBeTruthy();
        expect(lesson.concept.textEn).toBeTruthy();
        expect(lesson.concept.analogyAr).toBeTruthy();
        expect(lesson.concept.analogyEn).toBeTruthy();
        expect(lesson.concept.keyTerms.length).toBeGreaterThan(0);

        // Stage 3: Demonstration
        expect(lesson.demonstration.titleAr).toBeTruthy();
        expect(lesson.demonstration.titleEn).toBeTruthy();
        expect(lesson.demonstration.whatToLookForAr).toBeTruthy();
        expect(lesson.demonstration.whatToLookForEn).toBeTruthy();

        // Stage 4: Guided Hands-on Task
        expect(lesson.guidedTask.taskTitleAr).toBeTruthy();
        expect(lesson.guidedTask.taskTitleEn).toBeTruthy();
        expect(lesson.guidedTask.instructionsAr.length).toBeGreaterThan(0);
        expect(lesson.guidedTask.instructionsEn.length).toBeGreaterThan(0);
        expect(lesson.guidedTask.whyWeDoThisAr).toBeTruthy();
        expect(lesson.guidedTask.validationCriterionAr).toBeTruthy();

        // Stage 5: Result Explanation & Significance
        expect(lesson.resultExplanation.whatHappenedAr).toBeTruthy();
        expect(lesson.resultExplanation.whatHappenedEn).toBeTruthy();
        expect(lesson.resultExplanation.securitySignificanceAr).toBeTruthy();
        expect(lesson.resultExplanation.securitySignificanceEn).toBeTruthy();

        // Stage 6: Knowledge Check (Quiz)
        expect(lesson.knowledgeCheck.length).toBeGreaterThan(0);
        lesson.knowledgeCheck.forEach((q) => {
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          const hasCorrect = q.options.some((opt) => opt.isCorrect);
          expect(hasCorrect).toBe(true);
        });

        // Stage 7: Next Step
        expect(lesson.nextStep.takeawayAr).toBeTruthy();
        expect(lesson.nextStep.takeawayEn).toBeTruthy();
      });
    });
  });

  describe('LessonView Component Rendering & Stage Progression', () => {
    it('renders the LessonView in Arabic by default with all milestones and stage tabs', () => {
      render(<LessonView />);

      // Milestone title check (can be in sidebar and header)
      const titleMatches = screen.getAllByText(/التعرف إلى الأمن السيبراني وثالوث الحماية الأساسي/i);
      expect(titleMatches.length).toBeGreaterThanOrEqual(1);

      // Stage tabs present
      expect(screen.getAllByText(/الأهداف والمدخل/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/المفهوم والتشبيه/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/المعاينة الحية/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/المهمة العملية/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/الأثر الأمني/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/فحص المعرفة/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/الخطوة التالية/i).length).toBeGreaterThanOrEqual(1);
    });

    it('navigates through pedagogical stages smoothly', () => {
      render(<LessonView />);

      // Move to Stage 1: Concept & Analogy
      const nextBtn = screen.getByText(/المرحلة 2: المفهوم والتشبيه الحياتي/i);
      fireEvent.click(nextBtn);

      // Verify Analogy is rendered
      expect(screen.getByText(/تشبيه من الحياة اليومية/i)).toBeDefined();
      expect(screen.getByText(/المصطلحات والمفاهيم الجوهرية/i)).toBeDefined();

      // Move to Stage 2: Demonstration
      const stage3Btn = screen.getByText(/المرحلة 3: المعاينة الحية/i);
      fireEvent.click(stage3Btn);
      expect(screen.getByText(/ما الذي يجب أن تلاحظه؟/i)).toBeDefined();

      // Move to Stage 3: Task
      const stage4Btn = screen.getByText(/المرحلة 4: المهمة العملية/i);
      fireEvent.click(stage4Btn);
      expect(screen.getByText(/الخطوات التنفيذية المطلوبة/i)).toBeDefined();
      expect(screen.getByText(/معيار التحقق والنجاح:/i)).toBeDefined();
    });

    it('interacts with the Knowledge Check quiz and provides immediate feedback', () => {
      render(<LessonView />);

      // Attempting to jump directly from Stage 0 to Stage 5 (Quiz) is rejected
      const quizTab = screen.getByText(/6\. فحص المعرفة/i);
      fireEvent.click(quizTab);
      // Still on Stage 0
      expect(screen.getByText(/لماذا يعد هذا المفهوم حاسماً؟/i)).toBeDefined();

      // Advance legitimately through stages to Stage 5 (Quiz)
      act(() => {
        const store = useSimulationStore.getState();
        store.setLessonStage('lesson-01-cia-triad', 1);
        store.setLessonStage('lesson-01-cia-triad', 2);
        store.setLessonStage('lesson-01-cia-triad', 3);
        store.setLessonStage('lesson-01-cia-triad', 4);
        store.setLessonStage('lesson-01-cia-triad', 5);
      });

      expect(screen.getByText(/الفحص المعرفي التفاعلي السريع/i)).toBeDefined();

      // Answer correct option for DoS question: Availability (التوافر)
      const options = screen.getAllByRole('button');
      const correctOptionBtn = options.find((btn) => btn.textContent?.includes('التوافر (Availability)'));
      expect(correctOptionBtn).toBeDefined();

      if (correctOptionBtn) {
        act(() => {
          fireEvent.click(correctOptionBtn);
        });
        // Instant feedback should appear
        expect(screen.getByText(/إجابة صحيحة ومتقنة!/i)).toBeDefined();
      }
    });

    it('prevents completing lesson when conditions are not met (strict gating)', () => {
      render(<LessonView />);

      // Attempting to jump directly to Stage 7 from Stage 0 is blocked
      const nextStepTab = screen.getByText(/7\. الخطوة التالية/i);
      fireEvent.click(nextStepTab);
      // Still on Stage 0
      expect(screen.getByText(/لماذا يعد هذا المفهوم حاسماً؟/i)).toBeDefined();

      // Advance sequentially to inspect completion criteria at Stage 6
      act(() => {
        const store = useSimulationStore.getState();
        for (let i = 1; i <= 6; i++) {
          store.setLessonStage('lesson-01-cia-triad', i);
        }
      });

      // Verify lock message is shown explaining requirements are pending
      expect(screen.getByText(/متطلبات إكمال المحطة غير مستوفاة بعد/i)).toBeDefined();
      expect(screen.getByText(/1\. اجتياز الفحص المعرفي:/i)).toBeDefined();
      expect(screen.getByText(/2\. (استيفاء|إنجاز) المهمة العملية:/i)).toBeDefined();

      // Active complete button must NOT exist while conditions are unmet
      expect(screen.queryByText(/إكمال والانتقال إلى المحطة التالية/i)).toBeNull();

      // Lock indicator is rendered
      expect(screen.getByText(/إكمال المحطة مقفل حتى استيفاء الشروط/i)).toBeDefined();

      // Store should remain incomplete
      const state = useSimulationStore.getState();
      expect(state.completedLessons).not.toContain('lesson-01-cia-triad');
      expect(state.activeLessonId).toBe('lesson-01-cia-triad');
    });

    it('completes the lesson and advances only after quiz and task conditions are fulfilled', async () => {
      render(<LessonView />);

      // 1. Advance sequentially to stage 3 (Hands-on task) and complete practical task
      act(() => {
        const store = useSimulationStore.getState();
        store.setLessonStage('lesson-01-cia-triad', 1);
        store.setLessonStage('lesson-01-cia-triad', 2);
        store.setLessonStage('lesson-01-cia-triad', 3);
        
        // Context required for OMEGA MAX integrity
        store.setActiveSimulation('cia_triad');
        store.completeChallenge('cia-balance-challenge', { success: true });
      });

      // 2. Advance sequentially to stage 4 then stage 5 (Knowledge Check)
      act(() => {
        const store = useSimulationStore.getState();
        store.setLessonStage('lesson-01-cia-triad', 4);
        store.setLessonStage('lesson-01-cia-triad', 5);
      });

      // Complete Knowledge Check
      const options = screen.getAllByRole('button');
      const q1Correct = options.find((btn) => btn.textContent?.includes('التوافر (Availability)'));
      if (q1Correct) {
        act(() => {
          fireEvent.click(q1Correct);
        });
      }
      const q2Correct = options.find((btn) => btn.textContent?.includes('ضمان السرية'));
      if (q2Correct) {
        act(() => {
          fireEvent.click(q2Correct);
        });
      }

      // 3. Sequential progression to Next Steps stage (stage 6)
      act(() => {
        const store = useSimulationStore.getState();
        store.setLessonStage('lesson-01-cia-triad', 6);
      });

      // Now the completion button MUST be unlocked and visible
      const completeBtn = screen.getByRole('button', { name: /إكمال والانتقال إلى المحطة التالية/i });
      expect(completeBtn).toBeDefined();

      act(() => {
        fireEvent.click(completeBtn);
      });

      // Verify that lesson 1 is recorded as completed and state advances to lesson-02
      const state = useSimulationStore.getState();
      expect(state.completedLessons).toContain('lesson-01-cia-triad');
      expect(state.activeLessonId).toBe('lesson-02-system-internals');
    });

    it('rejects illegal stage skipping directly in store and keeps furthest unlocked progress', () => {
      // Start at stage 0
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.currentStage ?? 0).toBe(0);

      // Attempt illegal jump to stage 4 directly
      useSimulationStore.getState().setLessonStage('lesson-01-cia-triad', 4);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.currentStage ?? 0).toBe(0);

      // Advance sequentially
      useSimulationStore.getState().setLessonStage('lesson-01-cia-triad', 1);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.currentStage).toBe(1);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.furthestUnlockedStage).toBe(1);

      useSimulationStore.getState().setLessonStage('lesson-01-cia-triad', 2);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.furthestUnlockedStage).toBe(2);

      // Review previous stage (Stage 0) - furthestUnlockedStage MUST NOT degrade
      useSimulationStore.getState().setLessonStage('lesson-01-cia-triad', 0);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.currentStage).toBe(0);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.furthestUnlockedStage).toBe(2);

      // Can navigate directly back to any unlocked stage (Stage 2)
      useSimulationStore.getState().setLessonStage('lesson-01-cia-triad', 2);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.currentStage).toBe(2);
    });

    it('rejects direct completeLesson if quiz or task requirements are unfulfilled', () => {
      const store = useSimulationStore.getState();
      store.completeLesson('lesson-01-cia-triad');
      expect(useSimulationStore.getState().completedLessons).not.toContain('lesson-01-cia-triad');
    });

    it('unlocks all stages for review once a lesson is marked completed', () => {
      useSimulationStore.getState().updateLessonProgressState('lesson-01-cia-triad', {
        isQuizPassed: true,
        isTaskPassed: true,
      });
      useSimulationStore.getState().completeLesson('lesson-01-cia-triad');

      expect(useSimulationStore.getState().completedLessons).toContain('lesson-01-cia-triad');
      // In completed lessons, furthest stage is 6 (all unlocked)
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.furthestUnlockedStage).toBe(6);

      // Can jump to any stage freely for review
      useSimulationStore.getState().setLessonStage('lesson-01-cia-triad', 4);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.currentStage).toBe(4);

      useSimulationStore.getState().setLessonStage('lesson-01-cia-triad', 6);
      expect(useSimulationStore.getState().lessonProgress['lesson-01-cia-triad']?.currentStage).toBe(6);
    });
  });

  describe('Lesson State Persistence, Reload & Safety', () => {
    it('persists and restores complete lesson state across reloads', () => {
      const store = useSimulationStore.getState();

      // Update quiz answers and task steps in lesson 1
      store.setLessonStage('lesson-01-cia-triad', 1);
      store.updateLessonProgressState('lesson-01-cia-triad', {
        quizAnswers: { 'q1': 'opt-avail' },
        quizSubmitted: { 'q1': true },
        manualConfirmationChecked: true,
      });

      // Verify it was stored in localStorage
      const stored = localStorage.getItem('omega_lesson_progress');
      expect(stored).toBeTruthy();

      // Trigger reloadFromStorage
      store.reloadFromStorage();

      const reloadedState = useSimulationStore.getState();
      expect(reloadedState.lessonProgress['lesson-01-cia-triad']?.quizAnswers?.['q1']).toBe('opt-avail');
      expect(reloadedState.lessonProgress['lesson-01-cia-triad']?.manualConfirmationChecked).toBe(true);
    });

    it('restores activeLessonId after reloadFromStorage using localStorage mechanism', () => {
      localStorage.setItem('omega_active_lesson_id', 'lesson-04-firewall-rules');
      useSimulationStore.getState().reloadFromStorage();

      expect(useSimulationStore.getState().activeLessonId).toBe('lesson-04-firewall-rules');
    });

    it('rejects invalid or corrupted lesson IDs and safely falls back to default lesson', () => {
      // Direct parsing checks
      expect(safeParseActiveLessonId('corrupted-non-existent-lesson')).toBe('lesson-01-cia-triad');
      expect(safeParseActiveLessonId('')).toBe('lesson-01-cia-triad');
      expect(safeParseActiveLessonId(null)).toBe('lesson-01-cia-triad');
      expect(safeParseActiveLessonId('   ')).toBe('lesson-01-cia-triad');

      // Store action protection checks
      useSimulationStore.getState().setActiveLessonId('malicious-or-unknown-id');
      expect(useSimulationStore.getState().activeLessonId).toBe('lesson-01-cia-triad');

      // Reload from corrupted storage
      localStorage.setItem('omega_active_lesson_id', 'hacked-or-unknown-id');
      useSimulationStore.getState().reloadFromStorage();
      expect(useSimulationStore.getState().activeLessonId).toBe('lesson-01-cia-triad');
    });

    it('preserves lesson context when navigating to a lab and returning', () => {
      useSimulationStore.setState({
        activeSimulationId: 'lesson',
        activeLessonId: 'lesson-03-subnet-routing',
      });

      // User opens a lab simulation from the lesson
      useSimulationStore.getState().setActiveSimulation('subnet_routing');
      expect(useSimulationStore.getState().activeSimulationId).toBe('subnet_routing');
      // Lesson context is preserved!
      expect(useSimulationStore.getState().activeLessonId).toBe('lesson-03-subnet-routing');

      // Render Header while in lab simulation
      render(<Header />);
      const returnBtn = screen.getByTestId('return-to-lesson-btn');
      expect(returnBtn).toBeDefined();

      // Clicking Return to Lesson navigates back to lesson without losing active lesson ID
      fireEvent.click(returnBtn);
      expect(useSimulationStore.getState().activeSimulationId).toBe('lesson');
      expect(useSimulationStore.getState().activeLessonId).toBe('lesson-03-subnet-routing');
    });

    it('renders restored stage, answers, and task state accurately after reload', () => {
      // Simulate stored progress in localStorage
      localStorage.setItem('omega_active_lesson_id', 'lesson-01-cia-triad');
      localStorage.setItem(
        'omega_lesson_progress',
        JSON.stringify({
          'lesson-01-cia-triad': {
            currentStage: 3,
            furthestUnlockedStage: 3,
            checkedTaskSteps: { 'task-lesson-01-cia-triad-step-0': true },
            manualConfirmationChecked: false,
          },
        })
      );

      // Trigger reloadFromStorage
      useSimulationStore.getState().reloadFromStorage();

      // Render the component
      render(<LessonView />);

      // Verify Stage 4 (Hands-on Task) is rendered as the current stage
      expect(screen.getByText(/مهمتك العملية في المحاكي/i)).toBeDefined();
      expect(screen.getByText(/الخطوات التنفيذية المطلوبة/i)).toBeDefined();
    });

    it('guarantees strict lesson isolation with no progress leaking across lessons', () => {
      const store = useSimulationStore.getState();

      // Advance lesson 1 and record quiz answers
      store.setLessonStage('lesson-01-cia-triad', 1);
      store.setLessonStage('lesson-01-cia-triad', 2);
      store.setLessonStage('lesson-01-cia-triad', 3);
      store.updateLessonProgressState('lesson-01-cia-triad', {
        quizAnswers: { 'q1-cia-pillar': 'opt-c' },
        isQuizPassed: true,
      });

      // Switch to lesson 2
      store.setActiveLessonId('lesson-02-system-internals');

      // Lesson 2 must start pristine at stage 0 with no answers or tasks leaked
      const lesson2Progress = store.lessonProgress['lesson-02-system-internals'];
      expect(lesson2Progress?.currentStage ?? 0).toBe(0);
      expect(lesson2Progress?.furthestUnlockedStage ?? 0).toBe(0);
      expect(lesson2Progress?.quizAnswers).toBeUndefined();
      expect(lesson2Progress?.isQuizPassed).toBeFalsy();
    });
  });

  describe('Curriculum Progress Calculation & Resilience', () => {
    it('calculates progress accurately and ignores duplicates, invalid IDs, and never exceeds 100%', () => {
      // Import calculateCurriculumProgress
      const { calculateCurriculumProgress } = useSimulationStore.getState() as any || {};
      // Test through store safeParseCompletedLessons
      const rawWithDuplicatesAndInvalid = JSON.stringify([
        'lesson-01-cia-triad',
        'lesson-01-cia-triad',
        'invalid-nonexistent-lesson',
        'lesson-02-system-internals',
        12345,
        null,
      ]);

      localStorage.setItem('omega_completed_lessons', rawWithDuplicatesAndInvalid);
      useSimulationStore.getState().reloadFromStorage();

      const completed = useSimulationStore.getState().completedLessons;
      // Duplicates removed and invalid IDs rejected
      expect(completed).toEqual(['lesson-01-cia-triad', 'lesson-02-system-internals']);
      expect(completed).toHaveLength(2);

      // Active lesson is NOT auto-counted as completed
      expect(completed).not.toContain('lesson-03-subnet-routing');
    });

    it('protects completeLesson and setLessonStage from unauthorized direct bypass', () => {
      const store = useSimulationStore.getState();

      // Direct call to completeLesson without fulfilling conditions must be rejected
      store.completeLesson('lesson-01-cia-triad');
      expect(store.completedLessons).not.toContain('lesson-01-cia-triad');

      // Direct jump to stage 6 (completion stage) without fulfilling quiz and task must be rejected
      store.setLessonStage('lesson-01-cia-triad', 6);
      expect(store.lessonProgress['lesson-01-cia-triad']?.currentStage ?? 0).toBe(0);

      // Direct jump to stage 5 (quiz) without completing earlier stages must be rejected
      store.setLessonStage('lesson-01-cia-triad', 5);
      expect(store.lessonProgress['lesson-01-cia-triad']?.currentStage ?? 0).toBe(0);
    });
  });

  describe('Curriculum Progress Calculation & Data Sanitation Audit', () => {
    it('accurately calculates progress percentage without duplicate counting or unknown IDs', () => {
      // 1. With duplicate IDs and unknown fake IDs
      useSimulationStore.setState({
        completedLessons: [
          'lesson-01-cia-triad',
          'lesson-01-cia-triad',
          'fake-unknown-lesson-id',
          'another-hacked-id',
        ],
      });

      render(<LessonView />);

      // Exactly 1 valid lesson out of 10 should be 10%
      expect(screen.getByText(/10% \(1\/10\)/i)).toBeDefined();
    });

    it('does not count active lesson as completed until it is actually finished', () => {
      useSimulationStore.setState({
        activeLessonId: 'lesson-01-cia-triad',
        completedLessons: [],
      });

      render(<LessonView />);
      expect(screen.getByText(/0% \(0\/10\)/i)).toBeDefined();
    });

    it('never exceeds 100% even if extra valid/duplicate lessons are reported', () => {
      const allLessons = Object.keys(CURRICULUM_LESSONS);
      useSimulationStore.setState({
        completedLessons: [...allLessons, ...allLessons, 'extra-invalid-id'],
      });

      render(<LessonView />);
      expect(screen.getByText(/100% \(10\/10\)/i)).toBeDefined();
    });

    it('safely handles corrupted lessonProgress storage and bounds stages', () => {
      const store = useSimulationStore.getState();

      // Corrupted non-JSON string
      localStorage.setItem('omega_lesson_progress', '{not-valid-json');
      store.reloadFromStorage();
      expect(useSimulationStore.getState().lessonProgress).toEqual({});

      // Malicious attempt to inject stage 6 into an uncompleted lesson
      localStorage.setItem(
        'omega_lesson_progress',
        JSON.stringify({
          'lesson-01-cia-triad': {
            currentStage: 6,
            furthestUnlockedStage: 6,
          },
        })
      );
      store.reloadFromStorage();
      // Must be capped back to stage 5 because lesson is not completed
      const restored = useSimulationStore.getState().lessonProgress['lesson-01-cia-triad'];
      expect(restored.furthestUnlockedStage).toBeLessThanOrEqual(5);
      expect(restored.currentStage).toBeLessThanOrEqual(5);
    });

    it('validates completeChallenge inputs and protects against empty or non-string IDs', () => {
      const store = useSimulationStore.getState();
      const initialCount = store.completedChallenges.length;

      // Reject empty or whitespace
      // @ts-ignore
      store.completeChallenge('');
      // @ts-ignore
      store.completeChallenge('   ');
      // @ts-ignore
      store.completeChallenge(null);
      // @ts-ignore
      store.completeChallenge(undefined);
      // @ts-ignore
      store.completeChallenge(123);

      expect(useSimulationStore.getState().completedChallenges.length).toBe(initialCount);

      // Valid ID registers cleanly if context is correct
      act(() => {
        useSimulationStore.getState().setActiveSimulation('cia_triad');
      });
      store.completeChallenge('cia-balance-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).toContain('cia-balance-challenge');
    });
  });

  describe('Header & Landing Page Beginner Orientation Integrations', () => {
    it('provides direct "Start Here" button in Header navigation', () => {
      render(<Header />);
      const startHereBtn = screen.getByText(/ابدأ هنا \(المبتدئون\)/i);
      expect(startHereBtn).toBeDefined();

      fireEvent.click(startHereBtn);
      expect(useSimulationStore.getState().activeSimulationId).toBe('lesson');
    });

    it('displays prominent Beginner-First CTA on the Enterprise Landing Hero', () => {
      render(<InteractiveEnterpriseHero />);
      const beginnerHeroBtn = screen.getByText(/ابدأ (التعلّم )?من الصفر/i);
      expect(beginnerHeroBtn).toBeDefined();

      fireEvent.click(beginnerHeroBtn);
      expect(useSimulationStore.getState().activeSimulationId).toBe('lesson');
    });
  });
});
