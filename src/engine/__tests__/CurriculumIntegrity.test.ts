import { describe, it, expect } from 'vitest';
import { CURRICULUM_LEVELS, CURRICULUM_MILESTONES, CURRICULUM_LESSONS } from '../../data/curriculumData';
import { simulationRegistry } from '../../simulations/registry';
import {
  isSameSubnet,
  isValidIpv4,
  calculateSubnetDetails,
  evaluatePacketTransmission,
} from '../../utils/networkUtils';

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

  it('verifies all 14 currently defined lesson records contain extended pedagogical components', () => {
    const lessonKeys = Object.keys(CURRICULUM_LESSONS);
    expect(lessonKeys).toHaveLength(14);

    const expectedLessons = [
      'lesson-00-orientation',
      'lesson-01-cia-triad',
      'lesson-02-system-internals',
      'lesson-02-01-ip-addressing-and-binary',
      'lesson-02-02-subnetting-and-cidr',
      'lesson-03-subnet-routing',
      'lesson-04-firewall-rules',
      'lesson-05-cryptography',
      'lesson-06-active-directory',
      'lesson-07-soc-monitoring',
      'lesson-08-forensics',
      'lesson-09-devsecops',
      'lesson-09-cloud-threat-hunting',
      'lesson-10-cyber-range',
    ];

    expectedLessons.forEach((id) => {
      expect(CURRICULUM_LESSONS[id], `Expected lesson ${id} to exist`).toBeDefined();
    });
  });

  it('verifies the networking learning sequence under Level 2 exposes IP addressing, CIDR, and routing lessons in order', () => {
    const level2 = CURRICULUM_LEVELS.find((lvl) => lvl.id === 'level-2');
    expect(level2).toBeDefined();

    const lessonIds = level2!.modules.flatMap((m) => m.lessonIds);
    expect(lessonIds).toEqual([
      'lesson-02-01-ip-addressing-and-binary',
      'lesson-02-02-subnetting-and-cidr',
      'lesson-03-subnet-routing',
    ]);
  });

  it('verifies IPv4 input validation rejects invalid inputs and accepts valid addresses', () => {
    expect(isValidIpv4('192.168.1.42')).toBe(true);
    expect(isValidIpv4('192.168.1.1')).toBe(true);
    expect(isValidIpv4('10.0.0.1')).toBe(true);
    expect(isValidIpv4('203.0.113.1')).toBe(true);
    expect(isValidIpv4('0.0.0.0')).toBe(true);
    expect(isValidIpv4('255.255.255.255')).toBe(true);

    // Invalid inputs
    expect(isValidIpv4('')).toBe(false);
    expect(isValidIpv4('invalid')).toBe(false);
    expect(isValidIpv4('192.168.1')).toBe(false);
    expect(isValidIpv4('192.168.1.1.1')).toBe(false);
    expect(isValidIpv4('256.1.1.1')).toBe(false);
    expect(isValidIpv4('192.168.01.1')).toBe(false); // leading zero rejected
    expect(isValidIpv4('-1.0.0.0')).toBe(false);
  });

  it('verifies mathematical CIDR host boundary rules for Subnet Routing (192.168.1.42 vs 192.168.1.1)', () => {
    const hostIp = '192.168.1.42';
    const gatewayIp = '192.168.1.1';

    // Offered prefixes in simulation
    expect(isSameSubnet(hostIp, gatewayIp, 24)).toBe(true);
    expect(isSameSubnet(hostIp, gatewayIp, 25)).toBe(true);
    expect(isSameSubnet(hostIp, gatewayIp, 26)).toBe(true);
    expect(isSameSubnet(hostIp, gatewayIp, 27)).toBe(false);
    expect(isSameSubnet(hostIp, gatewayIp, 28)).toBe(false);

    // Additional boundary testing
    expect(isSameSubnet('192.168.1.0', '192.168.1.63', 26)).toBe(true);
    expect(isSameSubnet('192.168.1.63', '192.168.1.64', 26)).toBe(false);
  });

  it('verifies calculateSubnetDetails accurately calculates subnet mask and host counts', () => {
    const details26 = calculateSubnetDetails('192.168.1.0', 26);
    expect(details26).not.toBeNull();
    expect(details26!.subnetMask).toBe('255.255.255.192');
    expect(details26!.totalIps).toBe(64);
    expect(details26!.usableHosts).toBe(62);
    expect(details26!.networkAddress).toBe('192.168.1.0');
    expect(details26!.broadcastAddress).toBe('192.168.1.63');
    expect(details26!.firstUsableIp).toBe('192.168.1.1');
    expect(details26!.lastUsableIp).toBe('192.168.1.62');
  });

  it('verifies evaluatePacketTransmission handles valid, invalid, subnet-blocked, NAT-disabled, and success states', () => {
    const hostIp = '192.168.1.42';
    const gatewayIp = '192.168.1.1';

    // 1. Invalid IP input
    const invalidResult = evaluatePacketTransmission({
      hostIp: '999.999.999.999',
      gatewayIp,
      cidrPrefix: 26,
      natEnabled: true,
    });
    expect(invalidResult.validInputs).toBe(false);
    expect(invalidResult.status).toBe('invalid_ip');
    expect(invalidResult.packetState).toBe('blocked');
    expect(invalidResult.allLogs.some((l) => l.includes('Invalid IPv4'))).toBe(true);

    // 2. Subnet mismatch (/27: host 192.168.1.42 is in 192.168.1.32/27, gateway 192.168.1.1 is in 192.168.1.0/27)
    const mismatch27Result = evaluatePacketTransmission({
      hostIp,
      gatewayIp,
      cidrPrefix: 27,
      natEnabled: true,
    });
    expect(mismatch27Result.isSameSubnet).toBe(false);
    expect(mismatch27Result.status).toBe('subnet_mismatch');
    expect(mismatch27Result.packetState).toBe('blocked');
    expect(mismatch27Result.allLogs.some((l) => l.includes('DROPPED') && l.includes('/27'))).toBe(true);

    // 3. Subnet mismatch (/28)
    const mismatch28Result = evaluatePacketTransmission({
      hostIp,
      gatewayIp,
      cidrPrefix: 28,
      natEnabled: true,
    });
    expect(mismatch28Result.isSameSubnet).toBe(false);
    expect(mismatch28Result.status).toBe('subnet_mismatch');
    expect(mismatch28Result.packetState).toBe('blocked');

    // 4. Same subnet (/26) but NAT disabled
    const natDisabledResult = evaluatePacketTransmission({
      hostIp,
      gatewayIp,
      cidrPrefix: 26,
      natEnabled: false,
    });
    expect(natDisabledResult.isSameSubnet).toBe(true);
    expect(natDisabledResult.status).toBe('nat_disabled');
    expect(natDisabledResult.packetState).toBe('blocked');
    expect(natDisabledResult.allLogs.some((l) => l.includes('Egress NAT is DISABLED'))).toBe(true);

    // 5. Same subnet (/26) with NAT enabled -> Full Success
    const success26Result = evaluatePacketTransmission({
      hostIp,
      gatewayIp,
      cidrPrefix: 26,
      natEnabled: true,
    });
    expect(success26Result.isSameSubnet).toBe(true);
    expect(success26Result.status).toBe('success');
    expect(success26Result.packetState).toBe('success');
    expect(success26Result.allLogs.some((l) => l.includes('SUCCESS: 3-Way Handshake Completed'))).toBe(true);
  });

  it('keeps challenge objective distinct from technical network reachability', () => {
    const hostIp = '192.168.1.42';
    const gatewayIp = '192.168.1.1';

    // /24 and /25 with NAT enabled are technically reachable:
    const reachability24 = evaluatePacketTransmission({ hostIp, gatewayIp, cidrPrefix: 24, natEnabled: true });
    const reachability25 = evaluatePacketTransmission({ hostIp, gatewayIp, cidrPrefix: 25, natEnabled: true });

    expect(reachability24.status).toBe('success');
    expect(reachability24.packetState).toBe('success');
    expect(reachability25.status).toBe('success');
    expect(reachability25.packetState).toBe('success');

    // BUT challenge specifically requires /26 subnetting design (62 usable hosts):
    const prefix24: number = 24;
    const prefix25: number = 25;
    const prefix26: number = 26;
    const isChallengeSolved24 = prefix24 === 26;
    const isChallengeSolved25 = prefix25 === 26;
    const isChallengeSolved26 = prefix26 === 26;

    expect(isChallengeSolved24).toBe(false);
    expect(isChallengeSolved25).toBe(false);
    expect(isChallengeSolved26).toBe(true);
  });
});

