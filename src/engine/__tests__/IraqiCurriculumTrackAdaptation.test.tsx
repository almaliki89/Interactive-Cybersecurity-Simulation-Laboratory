// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CURRICULUM_LEVELS, CURRICULUM_MILESTONES, CURRICULUM_LESSONS } from '../../data/curriculumData';
import { simulationRegistry } from '../../simulations/registry';
import { LessonView } from '../../components/curriculum/LessonView';
import { useSimulationStore } from '../../stores/simulationStore';

describe('OMEGA MAX Iraqi Common-Curriculum & Tiered Track Adaptation', () => {
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

  describe('Curriculum Levels & Iraqi Educational Context Mapping', () => {
    it('verifies all 11 Levels contain authentic Iraqi subject names and educational contexts', () => {
      expect(CURRICULUM_LEVELS).toHaveLength(11);
      CURRICULUM_LEVELS.forEach((level) => {
        expect(level.iraqiSubjectNameAr, `Missing iraqiSubjectNameAr in level ${level.id}`).toBeTruthy();
        expect(level.iraqiSubjectNameEn, `Missing iraqiSubjectNameEn in level ${level.id}`).toBeTruthy();
        expect(level.trackAdaptation, `Missing trackAdaptation in level ${level.id}`).toBeDefined();

        const ctx = level.trackAdaptation!.iraqiCurriculumContext;
        expect(ctx.academicTierAr, `Missing academicTierAr in level ${level.id}`).toBeTruthy();
        expect(ctx.academicTierEn, `Missing academicTierEn in level ${level.id}`).toBeTruthy();
        expect(ctx.vocationalTierAr, `Missing vocationalTierAr in level ${level.id}`).toBeTruthy();
        expect(ctx.vocationalTierEn, `Missing vocationalTierEn in level ${level.id}`).toBeTruthy();
        expect(ctx.subjectMappingAr, `Missing subjectMappingAr in level ${level.id}`).toBeTruthy();
        expect(ctx.subjectMappingEn, `Missing subjectMappingEn in level ${level.id}`).toBeTruthy();
        expect(ctx.suggestedPrerequisitesAr.length, `Missing suggestedPrerequisitesAr in level ${level.id}`).toBeGreaterThan(0);
      });
    });

    it('verifies CURRICULUM_MILESTONES inherits all trackAdaptation and Iraqi subject metadata', () => {
      expect(CURRICULUM_MILESTONES).toHaveLength(11);
      CURRICULUM_MILESTONES.forEach((m) => {
        expect(m.iraqiSubjectNameAr).toBeTruthy();
        expect(m.iraqiSubjectNameEn).toBeTruthy();
        expect(m.trackAdaptation).toBeDefined();
        expect(m.trackAdaptation?.vocationalFocus).toBeDefined();
        expect(m.trackAdaptation?.academicDepth).toBeDefined();
      });
    });

    it('verifies all 10 core cybersecurity subject domains are explicitly covered in curriculum levels', () => {
      const subjectTitles = CURRICULUM_LEVELS.map((l) => l.iraqiSubjectNameAr).join(' ');
      // 1. Fundamentals, Risk & Ethics
      expect(subjectTitles).toContain('أساسيات الحاسوب وتقنية المعلومات والأمن الرقمي');
      // 2. OS Internals, Processes & Memory
      expect(subjectTitles).toContain('أنظمة التشغيل وحماية العمليات والذاكرة');
      // 3. Networking, IP, CIDR & Routing
      expect(subjectTitles).toContain('شبكات الحاسوب وبروتوكولات الإنترنت');
      // 4. Firewalls, Inspection & Segmentation
      expect(subjectTitles).toContain('أمن الشبكات وجدران الحماية وعزل النطاقات');
      // 5. Applied Cryptography & PKI
      expect(subjectTitles).toContain('التشفير وأمن المعلومات والبنية التحتية للمفاتيح العامة');
      // 6. Identity, Active Directory & Access Control
      expect(subjectTitles).toContain('إدارة الهويات والأدلة المؤسسية والتحكم في الوصول');
      // 7. SOC, SIEM & Threat Detection
      expect(subjectTitles).toContain('مراكز العمليات الأمنية ورصد الأحداث وتحليل التهديدات');
      // 8. Incident Response & Digital Forensics
      expect(subjectTitles).toContain('التحقيق الجنائي الرقمي والاستجابة للحوادث السيبرانية');
      // 9. Web AppSec & DevSecOps
      expect(subjectTitles).toContain('أمن البرمجيات وتطبيقات الويب وخطوط التطوير الآمنة');
      // 10. Cloud Infrastructure, Containers & Threat Hunting
      expect(subjectTitles).toContain('أمن البنى السحابية والحاويات واصطياد التهديدات');
      // Capstone
      expect(subjectTitles).toContain('المشروع التطبيقي الشامل والميدان السيبراني');
    });
  });

  describe('Track Adaptation Data Contract', () => {
    it('verifies Vocational track depth contains practical skills, troubleshooting runbooks, and lab tooling', () => {
      CURRICULUM_LEVELS.forEach((level) => {
        const voc = level.trackAdaptation!.vocationalFocus;
        expect(voc.titleAr, `Missing vocational titleAr in ${level.id}`).toBeTruthy();
        expect(voc.titleEn, `Missing vocational titleEn in ${level.id}`).toBeTruthy();
        expect(voc.practicalSkillsAr.length, `Missing practicalSkillsAr in ${level.id}`).toBeGreaterThanOrEqual(2);
        expect(voc.practicalSkillsEn.length, `Missing practicalSkillsEn in ${level.id}`).toBeGreaterThanOrEqual(2);
        expect(voc.troubleshootingRunbookAr.length, `Missing troubleshootingRunbookAr in ${level.id}`).toBeGreaterThanOrEqual(2);
        expect(voc.troubleshootingRunbookEn.length, `Missing troubleshootingRunbookEn in ${level.id}`).toBeGreaterThanOrEqual(2);
        expect(voc.labToolingAr.length, `Missing labToolingAr in ${level.id}`).toBeGreaterThanOrEqual(2);
      });
    });

    it('verifies Academic university track depth contains theoretical models, algorithmic analysis, and research aspects', () => {
      CURRICULUM_LEVELS.forEach((level) => {
        const acad = level.trackAdaptation!.academicDepth;
        expect(acad.titleAr, `Missing academic titleAr in ${level.id}`).toBeTruthy();
        expect(acad.titleEn, `Missing academic titleEn in ${level.id}`).toBeTruthy();
        expect(acad.theoreticalConceptsAr.length, `Missing theoreticalConceptsAr in ${level.id}`).toBeGreaterThanOrEqual(2);
        expect(acad.theoreticalConceptsEn.length, `Missing theoreticalConceptsEn in ${level.id}`).toBeGreaterThanOrEqual(2);
        expect(acad.algorithmicAnalysisAr, `Missing algorithmicAnalysisAr in ${level.id}`).toBeTruthy();
        expect(acad.algorithmicAnalysisEn, `Missing algorithmicAnalysisEn in ${level.id}`).toBeTruthy();
        expect(acad.researchAndDesignAspectsAr.length, `Missing researchAndDesignAspectsAr in ${level.id}`).toBeGreaterThanOrEqual(2);
      });
    });

    it('verifies all relatedSimulationIds mapped to lessons point to valid registered simulations', () => {
      Object.values(CURRICULUM_LESSONS).forEach((lesson) => {
        if (lesson.relatedSimulationIds && lesson.relatedSimulationIds.length > 0) {
          lesson.relatedSimulationIds.forEach((simId) => {
            expect(simulationRegistry[simId], `Simulation ID ${simId} in lesson ${lesson.id} is not registered`).toBeDefined();
            expect(simulationRegistry[simId].id).toBe(simId);
          });
        }
      });
    });
  });

  describe('UI Track Selection & Interaction in LessonView', () => {
    it('renders the Iraqi common curriculum bar and track switcher pills', () => {
      render(<LessonView />);

      // Curriculum banner
      expect(screen.getAllByText(/المنهج المشترك للجامعات والمعاهد العراقية/i).length).toBeGreaterThanOrEqual(1);

      // Track switch buttons
      expect(screen.getByRole('button', { name: /الأساس المشترك/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /المسار المهني/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /المسار الجامعي/i })).toBeDefined();
    });

    it('displays vocational troubleshooting runbook when vocational track is toggled', () => {
      render(<LessonView />);

      const vocationalBtn = screen.getByRole('button', { name: /المسار المهني/i });
      fireEvent.click(vocationalBtn);

      // Verify vocational components
      expect(screen.getAllByText(/مهارات إعداد وتشخيص/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/المهارات الميدانية المستهدفة:/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/دليل استكشاف الأخطاء والتشخيص/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/الأدوات التطبيقية:/i).length).toBeGreaterThanOrEqual(1);
    });

    it('displays academic algorithmic analysis and theoretical models when university track is toggled', () => {
      render(<LessonView />);

      const academicBtn = screen.getByRole('button', { name: /المسار الجامعي/i });
      fireEvent.click(academicBtn);

      // Verify academic components
      expect(screen.getAllByText(/عمق نظري وخوارزميات/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/المفاهيم والنماذج النظرية الأساسية:/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/التحليل الخوارزمي والرياضي:/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/دراسات التصميم والأبحاث المعمارية:/i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders related simulation buttons and allows direct launch', () => {
      render(<LessonView />);

      expect(screen.getAllByText(/محاكيات ومختبرات تفاعلية ذات صلة بهذا المستوى:/i).length).toBeGreaterThanOrEqual(1);

      // Lesson 1 (CIA Triad) has relatedSimulationIds: ['cia_triad', 'firewall', 'crypto']
      const firewallLabBtn = screen.getByRole('button', { name: /جدار الحماية وقواعد ACL/i });
      expect(firewallLabBtn).toBeDefined();

      fireEvent.click(firewallLabBtn);
      expect(useSimulationStore.getState().activeSimulationId).toBe('firewall');
    });
  });
});
