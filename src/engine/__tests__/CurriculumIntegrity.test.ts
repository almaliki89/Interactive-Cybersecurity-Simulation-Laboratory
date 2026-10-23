import { describe, it, expect } from 'vitest';
import { CURRICULUM_LEVELS, CURRICULUM_MILESTONES, CURRICULUM_LESSONS } from '../../data/curriculumData';
import { simulationRegistry } from '../../simulations/registry';

describe('OMEGA MAX Curriculum Referential & Framework Integrity', () => {
  it('verifies all 11 Levels (0-10) exist sequentially in CURRICULUM_LEVELS', () => {
    expect(CURRICULUM_LEVELS).toHaveLength(11);
    CURRICULUM_LEVELS.forEach((level, idx) => {
      expect(level.levelNumber).toBe(idx);
      expect(level.id).toBe(`level-${idx}`);
      expect(level.slug).toBeTruthy();
      expect(level.titleAr).toBeTruthy();
      expect(level.titleEn).toBeTruthy();
      expect(level.subtitleAr).toBeTruthy();
      expect(level.subtitleEn).toBeTruthy();
      expect(level.descriptionAr).toBeTruthy();
      expect(level.descriptionEn).toBeTruthy();
      expect(level.modules.length).toBeGreaterThan(0);
      expect(level.primarySimulationId).toBeTruthy();
    });
  });

  it('verifies every primarySimulationId maps to a valid simulation in simulationRegistry', () => {
    CURRICULUM_LEVELS.forEach((level) => {
      expect(simulationRegistry[level.primarySimulationId]).toBeDefined();
      expect(simulationRegistry[level.primarySimulationId].id).toBe(level.primarySimulationId);
    });

    CURRICULUM_MILESTONES.forEach((milestone) => {
      expect(simulationRegistry[milestone.primarySimulationId]).toBeDefined();
    });
  });

  it('verifies every lesson ID declared in CURRICULUM_LEVELS exists in CURRICULUM_LESSONS', () => {
    const allDeclaredLessonIds = CURRICULUM_LEVELS.flatMap((level) =>
      level.modules.flatMap((module) => module.lessonIds)
    );

    expect(allDeclaredLessonIds.length).toBeGreaterThan(0);

    allDeclaredLessonIds.forEach((lessonId) => {
      expect(CURRICULUM_LESSONS[lessonId]).toBeDefined();
      expect(CURRICULUM_LESSONS[lessonId].id).toBe(lessonId);
    });
  });

  it('verifies referential integrity of nextStep.nextLessonId progression chain', () => {
    Object.values(CURRICULUM_LESSONS).forEach((lesson) => {
      const nextId = lesson.nextStep?.nextLessonId;
      if (nextId) {
        expect(CURRICULUM_LESSONS[nextId]).toBeDefined();
        expect(CURRICULUM_LESSONS[nextId].id).toBe(nextId);
      }
    });

    // Explicit chain check from Level 0 to Level 10
    expect(CURRICULUM_LESSONS['lesson-00-orientation'].nextStep.nextLessonId).toBe('lesson-01-cia-triad');
    expect(CURRICULUM_LESSONS['lesson-01-cia-triad'].nextStep.nextLessonId).toBe('lesson-02-system-internals');
    expect(CURRICULUM_LESSONS['lesson-02-system-internals'].nextStep.nextLessonId).toBe('lesson-02-01-ip-addressing-and-binary');
    expect(CURRICULUM_LESSONS['lesson-02-01-ip-addressing-and-binary'].nextStep.nextLessonId).toBe('lesson-02-02-subnetting-and-cidr');
    expect(CURRICULUM_LESSONS['lesson-02-02-subnetting-and-cidr'].nextStep.nextLessonId).toBe('lesson-03-subnet-routing');
    expect(CURRICULUM_LESSONS['lesson-03-subnet-routing'].nextStep.nextLessonId).toBe('lesson-04-firewall-rules');
    expect(CURRICULUM_LESSONS['lesson-04-firewall-rules'].nextStep.nextLessonId).toBe('lesson-05-cryptography');
    expect(CURRICULUM_LESSONS['lesson-05-cryptography'].nextStep.nextLessonId).toBe('lesson-06-active-directory');
    expect(CURRICULUM_LESSONS['lesson-06-active-directory'].nextStep.nextLessonId).toBe('lesson-07-soc-monitoring');
    expect(CURRICULUM_LESSONS['lesson-07-soc-monitoring'].nextStep.nextLessonId).toBe('lesson-08-forensics');
    expect(CURRICULUM_LESSONS['lesson-08-forensics'].nextStep.nextLessonId).toBe('lesson-09-devsecops');
    expect(CURRICULUM_LESSONS['lesson-09-devsecops'].nextStep.nextLessonId).toBe('lesson-09-cloud-threat-hunting');
    expect(CURRICULUM_LESSONS['lesson-09-cloud-threat-hunting'].nextStep.nextLessonId).toBe('lesson-10-cyber-range');
  });

  it('verifies milestoneId on each lesson aligns with parent CURRICULUM_LEVEL levelNumber', () => {
    CURRICULUM_LEVELS.forEach((level) => {
      const levelLessonIds = level.modules.flatMap((m) => m.lessonIds);
      levelLessonIds.forEach((lessonId) => {
        const lesson = CURRICULUM_LESSONS[lessonId];
        expect(lesson).toBeDefined();
        expect(lesson.milestoneId).toBe(level.levelNumber);
      });
    });
  });

  it('verifies complete 13-part framework data contract across all lessons', () => {
    Object.values(CURRICULUM_LESSONS).forEach((lesson) => {
      // Core 7 Stages
      expect(lesson.objectives.length, `Missing objectives in ${lesson.id}`).toBeGreaterThan(0);
      expect(lesson.concept.textAr, `Missing concept in ${lesson.id}`).toBeTruthy();
      expect(lesson.concept.textEn, `Missing concept in ${lesson.id}`).toBeTruthy();
      expect(lesson.demonstration.titleAr, `Missing demo in ${lesson.id}`).toBeTruthy();
      expect(lesson.guidedTask.instructionsAr.length, `Missing guidedTask in ${lesson.id}`).toBeGreaterThan(0);
      expect(lesson.resultExplanation.whatHappenedAr, `Missing resultExplanation in ${lesson.id}`).toBeTruthy();
      expect(lesson.knowledgeCheck.length, `Missing knowledgeCheck in ${lesson.id}`).toBeGreaterThan(0);
      expect(lesson.nextStep.takeawayAr, `Missing nextStep in ${lesson.id}`).toBeTruthy();

      // Extended 13-part components
      expect(lesson.prerequisites, `Missing prerequisites in ${lesson.id}`).toBeDefined();
      expect(lesson.prerequisites!.length).toBeGreaterThan(0);

      expect(lesson.workedExample, `Missing workedExample in ${lesson.id}`).toBeDefined();
      expect(lesson.workedExample!.titleAr).toBeTruthy();
      expect(lesson.workedExample!.stepsAr.length).toBeGreaterThan(0);

      expect(lesson.independentChallengeDetail, `Missing independentChallengeDetail in ${lesson.id}`).toBeDefined();
      expect(lesson.independentChallengeDetail!.titleAr).toBeTruthy();

      expect(lesson.remediationGuidance, `Missing remediationGuidance in ${lesson.id}`).toBeDefined();
      expect(lesson.remediationGuidance!.commonMisconceptionAr).toBeTruthy();

      expect(lesson.keyTakeaways, `Missing keyTakeaways in ${lesson.id}`).toBeDefined();
      expect(lesson.keyTakeaways!.length).toBeGreaterThan(0);
    });
  });

  it('verifies mathematical CIDR host boundary rules for Subnet Routing (192.168.1.42 vs 192.168.1.1)', () => {
    const isSameSubnet = (hostIp: string, gatewayIp: string, cidr: number) => {
      const ipToLong = (ip: string) =>
        ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
      const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
      return (ipToLong(hostIp) & mask) === (ipToLong(gatewayIp) & mask);
    };

    const hostIp = '192.168.1.42';
    const gatewayIp = '192.168.1.1';

    expect(isSameSubnet(hostIp, gatewayIp, 24)).toBe(true);
    expect(isSameSubnet(hostIp, gatewayIp, 25)).toBe(true);
    expect(isSameSubnet(hostIp, gatewayIp, 26)).toBe(true);
    expect(isSameSubnet(hostIp, gatewayIp, 27)).toBe(false);
    expect(isSameSubnet(hostIp, gatewayIp, 28)).toBe(false);
  });
});
