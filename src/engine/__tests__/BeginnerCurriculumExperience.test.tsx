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

      // Switch to Quiz stage via tab
      const quizTab = screen.getByText(/6\. فحص المعرفة/i);
      fireEvent.click(quizTab);

      expect(screen.getByText(/الفحص المعرفي التفاعلي السريع/i)).toBeDefined();

      // Answer correct option for DoS question: Availability (التوافر)
      const options = screen.getAllByRole('button');
      const correctOptionBtn = options.find((btn) => btn.textContent?.includes('التوافر (Availability)'));
      expect(correctOptionBtn).toBeDefined();

      if (correctOptionBtn) {
        fireEvent.click(correctOptionBtn);
        // Instant feedback should appear
        expect(screen.getByText(/إجابة صحيحة ومتقنة!/i)).toBeDefined();
      }
    });

    it('prevents completing lesson when conditions are not met (strict gating)', () => {
      render(<LessonView />);

      // Jump to Next Step stage via tab to inspect completion criteria
      const nextStepTab = screen.getByText(/7\. الخطوة التالية/i);
      fireEvent.click(nextStepTab);

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
        store.completeChallenge('cia-balance-challenge');
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
  });

  describe('Lesson State Persistence, Reload & Safety', () => {
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
