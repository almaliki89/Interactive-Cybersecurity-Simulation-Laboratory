// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CURRICULUM_MILESTONES, CURRICULUM_LESSONS } from '../../data/curriculumData';
import { LessonView } from '../../components/curriculum/LessonView';
import { Header } from '../../components/ui/Header';
import { InteractiveEnterpriseHero } from '../../components/landing/InteractiveEnterpriseHero';
import { useSimulationStore } from '../../stores/simulationStore';

describe('Beginner-First Learning Experience & Curriculum Architecture', () => {
  beforeEach(() => {
    cleanup();
    useSimulationStore.setState({
      language: 'ar',
      activeSimulationId: 'lesson',
      activeLessonId: 'lesson-01-cia-triad',
      completedLessons: [],
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

      // Jump directly to Quiz stage via tab
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

    it('completes the lesson and advances to next milestone', () => {
      render(<LessonView />);

      // Jump to Next Step stage via tab
      const nextStepTab = screen.getByText(/7\. الخطوة التالية/i);
      fireEvent.click(nextStepTab);

      // Verify golden takeaway
      expect(screen.getByText(/الخلاصة والرسالة الذهبية للمحطة/i)).toBeDefined();

      // Complete button
      const completeBtn = screen.getByText(/إكمال والانتقال إلى المحطة التالية/i);
      fireEvent.click(completeBtn);

      // Verify that lesson 1 is recorded as completed
      const state = useSimulationStore.getState();
      expect(state.completedLessons).toContain('lesson-01-cia-triad');
      // And active lesson advanced to lesson-02
      expect(state.activeLessonId).toBe('lesson-02-system-internals');
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
      const beginnerHeroBtn = screen.getByText(/ابدأ من الصفر \(مسار المبتدئين خطوة بخطوة\)/i);
      expect(beginnerHeroBtn).toBeDefined();

      fireEvent.click(beginnerHeroBtn);
      expect(useSimulationStore.getState().activeSimulationId).toBe('lesson');
    });
  });
});
