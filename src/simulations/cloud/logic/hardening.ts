/**
 * OMEGA V13 — Cloud Security World
 * logic/hardening.ts
 *
 * Deterministic Cloud Security Posture Management (CSPM) Benchmark
 * and Master Challenge Validation Engine.
 * Evaluates CIS Cloud Benchmark compliance (0-100%) across 6 security pillars.
 * Zero non-deterministic functions.
 */

import { CloudInfrastructureState, scanCloudMisconfigurations } from './misconfigurations';
import { CloudIncidentCase, evaluateIncidentProgress } from './incidents';
import { evaluateCloudReachability } from './network';
import { validateCloudArchitecture } from './architecture';
import { CloudSecret } from './secrets';
import { CloudRole } from './roles';

export interface SecurityPillarScore {
  pillarNameEn: string;
  pillarNameAr: string;
  weightPercentage: number;
  scorePercentage: number;
  passedChecks: number;
  totalChecks: number;
  criticalDefects: string[];
}

export interface CspmBenchmarkResult {
  overallScorePercentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  pillarScores: SecurityPillarScore[];
  totalMisconfigurationsCount: number;
  criticalFindingsCount: number;
  isCompliant: boolean;
  summaryEn: string;
  summaryAr: string;
}

export interface CloudAntiCheatFlags {
  trivialMutationDetected?: boolean;
  incidentStageSkipped?: boolean;
  reachabilityBypassed?: boolean;
  postureScoreFalsified?: boolean;
  loggingTamperedToHideAlerts?: boolean;
  architectureValidatorBypassed?: boolean;
}

export interface CloudMasterChallengeState {
  infraState: CloudInfrastructureState;
  incidentCase: CloudIncidentCase;
  appliedRemediations: Set<string>;
  testedAuthorizationsPassed: boolean;
  secretsState?: CloudSecret[];
  rolesState?: CloudRole[];
  antiCheatFlags?: CloudAntiCheatFlags;
  reachabilityVerified?: boolean;
  businessContinuityVerified?: boolean;
}

export interface CloudMasterValidationResult {
  isPassed: boolean;
  scorePercentage: number;
  failedChecks: string[];
  antiCheatViolations: string[];
  businessContinuityPassed: boolean;
  feedbackEn: string;
  feedbackAr: string;
  cspmBenchmark: CspmBenchmarkResult;
}

/**
 * Calculates deterministic CSPM benchmark score for a given cloud infrastructure state.
 */
export function calculateCspmBenchmark(state: CloudInfrastructureState): CspmBenchmarkResult {
  const misconfigs = scanCloudMisconfigurations(state);
  const criticalFindings = misconfigs.filter((m) => m.severity === 'CRITICAL');

  // 1. Storage Pillar (20% weight)
  const totalBuckets = state.buckets.length;
  let secureBuckets = 0;
  const storageDefects: string[] = [];
  state.buckets.forEach((b) => {
    const isBpa = b.publicAccessBlock.blockPublicPolicy && b.publicAccessBlock.blockPublicAcls;
    const isEncrypted = b.encryption.enabled;
    if (isBpa && isEncrypted) {
      secureBuckets++;
    } else {
      if (!isBpa) storageDefects.push(`Bucket '${b.name}' has Block Public Access disabled.`);
      if (!isEncrypted) storageDefects.push(`Bucket '${b.name}' missing default KMS encryption.`);
    }
  });
  const storageScore = totalBuckets > 0 ? Math.round((secureBuckets / totalBuckets) * 100) : 100;

  // 2. Network Pillar (20% weight)
  let networkScore = 100;
  const networkDefects: string[] = [];
  state.securityGroups.forEach((sg) => {
    sg.ingressRules.forEach((r) => {
      if (r.sourceOrDestination === '0.0.0.0/0' && r.portRange !== 'ALL') {
        const [start, end] = r.portRange;
        if ((start <= 22 && end >= 22) || (start <= 3389 && end >= 3389)) {
          networkScore = Math.max(0, networkScore - 40);
          networkDefects.push(`Security Group '${sg.name}' exposes port ${start} to 0.0.0.0/0.`);
        }
      }
    });
  });

  // 3. Compute Pillar (20% weight)
  const totalCompute = state.computeInstances.length;
  let secureCompute = 0;
  const computeDefects: string[] = [];
  state.computeInstances.forEach((inst) => {
    const isImdsV2 = inst.imdsConfig.version === 'v2' && inst.imdsConfig.httpTokens === 'required';
    const isIsolatedOrPatched = inst.vulnerabilities.every((v) => v.isPatched) || inst.status === 'ISOLATED';
    if (isImdsV2 && isIsolatedOrPatched) {
      secureCompute++;
    } else {
      if (!isImdsV2) computeDefects.push(`Instance '${inst.name}' allows IMDSv1 token-less requests.`);
      if (!isIsolatedOrPatched) computeDefects.push(`Instance '${inst.name}' has unpatched SSRF vulnerability.`);
    }
  });
  const computeScore = totalCompute > 0 ? Math.round((secureCompute / totalCompute) * 100) : 100;

  // 4. IAM & Identity Pillar (20% weight)
  let iamScore = 100;
  const iamDefects: string[] = [];
  if (state.rootHasActiveAccessKey) {
    iamScore -= 40;
    iamDefects.push('Root account has active long-lived programmatic access keys.');
  }
  const wildcardPolicies = state.policies.filter((p) => p.isWildcardAdmin);
  if (wildcardPolicies.length > 0) {
    iamScore -= 30;
    iamDefects.push(`Found ${wildcardPolicies.length} overly permissive wildcard admin policies.`);
  }
  iamScore = Math.max(0, iamScore);

  // 5. Logging Pillar (20% weight)
  let loggingScore = 100;
  const loggingDefects: string[] = [];
  if (!state.trailConfig.isLogging) {
    loggingScore = 0;
    loggingDefects.push('Central CloudTrail logging is completely disabled.');
  } else {
    if (!state.trailConfig.enableLogFileValidation) {
      loggingScore -= 30;
      loggingDefects.push('Log file integrity digest validation is disabled.');
    }
    if (!state.trailConfig.isMultiRegionTrail) {
      loggingScore -= 20;
      loggingDefects.push('Trail does not cover all regions.');
    }
  }

  const overallScorePercentage = Math.round(
    storageScore * 0.2 +
      networkScore * 0.2 +
      computeScore * 0.2 +
      iamScore * 0.2 +
      loggingScore * 0.2
  );

  let grade: CspmBenchmarkResult['grade'] = 'F';
  if (overallScorePercentage >= 90) grade = 'A';
  else if (overallScorePercentage >= 80) grade = 'B';
  else if (overallScorePercentage >= 70) grade = 'C';
  else if (overallScorePercentage >= 60) grade = 'D';

  const pillarScores: SecurityPillarScore[] = [
    {
      pillarNameEn: 'Data & Storage Protection',
      pillarNameAr: 'حماية البيانات والتخزين',
      weightPercentage: 20,
      scorePercentage: storageScore,
      passedChecks: secureBuckets,
      totalChecks: totalBuckets,
      criticalDefects: storageDefects,
    },
    {
      pillarNameEn: 'Network Boundary & Security Groups',
      pillarNameAr: 'الحدود الشبكية ومجموعات الأمان',
      weightPercentage: 20,
      scorePercentage: networkScore,
      passedChecks: networkDefects.length === 0 ? 1 : 0,
      totalChecks: 1,
      criticalDefects: networkDefects,
    },
    {
      pillarNameEn: 'Workload & Compute Hardening',
      pillarNameAr: 'تحصين الخوادم وأعباء العمل',
      weightPercentage: 20,
      scorePercentage: computeScore,
      passedChecks: secureCompute,
      totalChecks: totalCompute,
      criticalDefects: computeDefects,
    },
    {
      pillarNameEn: 'IAM & Least Privilege',
      pillarNameAr: 'إدارة الهويات والامتياز الأدنى',
      weightPercentage: 20,
      scorePercentage: iamScore,
      passedChecks: iamDefects.length === 0 ? 1 : 0,
      totalChecks: 1,
      criticalDefects: iamDefects,
    },
    {
      pillarNameEn: 'Audit Logging & Monitoring',
      pillarNameAr: 'سجلات التدقيق والمراقبة المستمرة',
      weightPercentage: 20,
      scorePercentage: loggingScore,
      passedChecks: loggingDefects.length === 0 ? 1 : 0,
      totalChecks: 1,
      criticalDefects: loggingDefects,
    },
  ];

  return {
    overallScorePercentage,
    grade,
    pillarScores,
    totalMisconfigurationsCount: misconfigs.length,
    criticalFindingsCount: criticalFindings.length,
    isCompliant: overallScorePercentage >= 85 && criticalFindings.length === 0,
    summaryEn: `CIS Cloud Benchmark Compliance: ${overallScorePercentage}% (Grade ${grade}). ${criticalFindings.length} critical findings active.`,
    summaryAr: `امتثال معيار أمان السحابة CIS: ${overallScorePercentage}% (التقدير ${grade}). توجد ${criticalFindings.length} ثغرات حرجة نشطة.`,
  };
}

/**
 * Validates completion of the Cloud Master Challenge.
 * Explicitly verifies all 14 core requirements, enforces anti-cheat rules,
 * and asserts business continuity guarantees.
 */
export function validateCloudMasterChallenge(challengeState: CloudMasterChallengeState): CloudMasterValidationResult {
  const failedChecks: string[] = [];
  const antiCheatViolations: string[] = [];
  const cspm = calculateCspmBenchmark(challengeState.infraState);
  const incidentProgress = evaluateIncidentProgress(challengeState.incidentCase);
  const flags = challengeState.antiCheatFlags || {};

  // ==========================================
  // ANTI-CHEAT DETECTION
  // ==========================================
  // 1. Explicit anti-cheat flags passed in state
  if (flags.trivialMutationDetected) {
    antiCheatViolations.push('Anti-Cheat: Trivial status mutation detected without prerequisite remediation actions.');
  }
  if (flags.incidentStageSkipped) {
    antiCheatViolations.push('Anti-Cheat: Incident response stages skipped without executing containment and eradication playbooks.');
  }
  if (flags.reachabilityBypassed) {
    antiCheatViolations.push('Anti-Cheat: Network reachability boundary verification was bypassed.');
  }
  if (flags.postureScoreFalsified) {
    antiCheatViolations.push('Anti-Cheat: Falsified CSPM posture benchmark score detected.');
  }
  if (flags.loggingTamperedToHideAlerts) {
    antiCheatViolations.push('Anti-Cheat: Audit logging was stopped or tampered to conceal threat detection alerts.');
  }
  if (flags.architectureValidatorBypassed) {
    antiCheatViolations.push('Anti-Cheat: Architecture security validator was bypassed or suppressed.');
  }

  // 2. Behavioral Anti-Cheat: Trivial S3 mutation
  // If bucket is marked !isPubliclyExposed but BPA blockPublicPolicy and blockPublicAcls are false
  const rawBucket = challengeState.infraState.buckets.find((b) => b.name === 'nexora-analytics-raw-bucket');
  if (rawBucket && !rawBucket.isPubliclyExposed && (!rawBucket.publicAccessBlock.blockPublicPolicy || !rawBucket.publicAccessBlock.blockPublicAcls)) {
    antiCheatViolations.push('Anti-Cheat: Storage bucket marked non-public without activating Block Public Access (BPA).');
  }

  // 3. Behavioral Anti-Cheat: Skipping incident containment/eradication
  const containmentPlaybook = challengeState.incidentCase.playbookActions.filter((a) => a.requiredForStage === 'CONTAINMENT');
  const eradicationPlaybook = challengeState.incidentCase.playbookActions.filter((a) => a.requiredForStage === 'ERADICATION');
  const hasExecutedContainment = containmentPlaybook.length > 0 && containmentPlaybook.every((a) => a.isExecuted);
  const hasExecutedEradication = eradicationPlaybook.length > 0 && eradicationPlaybook.every((a) => a.isExecuted);

  if ((challengeState.incidentCase.currentStage === 'RESOLVED' || challengeState.incidentCase.currentStage === 'RECOVERY') && (!hasExecutedContainment || !hasExecutedEradication)) {
    antiCheatViolations.push('Anti-Cheat: Incident marked resolved/recovered without actually executing containment and eradication steps.');
  }

  // 4. Behavioral Anti-Cheat: Disabling logging to hide alerts
  if (!challengeState.infraState.trailConfig.isLogging) {
    antiCheatViolations.push('Anti-Cheat: Central audit logging is disabled (blind spot anti-pattern).');
  }

  // ==========================================
  // 14 MANDATORY MASTER COMPLETION CHECKS
  // ==========================================

  // Check 1: Finance storage is private
  const financeBucket = challengeState.infraState.buckets.find((b) => b.name === 'nexora-finance-vault-prod');
  const isFinancePrivate = Boolean(
    financeBucket &&
      !financeBucket.isPubliclyExposed &&
      financeBucket.publicAccessBlock.blockPublicPolicy &&
      financeBucket.publicAccessBlock.blockPublicAcls &&
      financeBucket.publicAccessBlock.restrictPublicBuckets &&
      financeBucket.publicAccessBlock.ignorePublicAcls
  );
  const isRawRemediated = Boolean(
    rawBucket &&
      !rawBucket.isPubliclyExposed &&
      rawBucket.publicAccessBlock.blockPublicPolicy &&
      rawBucket.publicAccessBlock.blockPublicAcls
  );
  if (!isFinancePrivate || !isRawRemediated) {
    failedChecks.push('1. Storage: Finance vault or analytics storage is publicly exposed or missing full Block Public Access.');
  }

  // Check 2: Sensitive storage encryption enabled
  const sensitiveBuckets = challengeState.infraState.buckets.filter(
    (b) => b.tags?.Classification === 'Restricted' || b.name.includes('finance') || b.name.includes('raw')
  );
  const isSensitiveStorageEncrypted =
    sensitiveBuckets.length > 0 && sensitiveBuckets.every((b) => b.encryption.enabled);
  if (!isSensitiveStorageEncrypted) {
    failedChecks.push('2. Storage: Sensitive storage buckets missing default KMS encryption at rest.');
  }

  // Check 3: Sensitive storage access logging enabled
  const isSensitiveAccessLoggingEnabled = Boolean(
    financeBucket && financeBucket.accessLogging && financeBucket.accessLogging.enabled
  );
  if (!isSensitiveAccessLoggingEnabled) {
    failedChecks.push('3. Storage: S3 Server Access Logging is disabled on sensitive finance storage vault.');
  }

  // Check 4: SSH not exposed to 0.0.0.0/0
  const hasOpenSsh = challengeState.infraState.securityGroups.some((sg) =>
    sg.ingressRules.some(
      (r) =>
        r.sourceOrDestination === '0.0.0.0/0' &&
        r.portRange !== 'ALL' &&
        ((r.portRange[0] <= 22 && r.portRange[1] >= 22) || (r.portRange[0] <= 3389 && r.portRange[1] >= 3389))
    )
  );
  if (hasOpenSsh) {
    failedChecks.push('4. Network: Administrative management port (SSH 22 / RDP 3389) is exposed to 0.0.0.0/0.');
  }

  // Check 5: Database not reachable from Internet
  const internetToDb = evaluateCloudReachability({
    source: { ip: '203.0.113.199', isInternet: true },
    destination: { ip: '10.100.20.15', workloadType: 'DATABASE' },
    protocol: 'TCP',
    port: 5432,
  });
  if (internetToDb.reachable) {
    failedChecks.push('5. Network: Database tier is directly reachable from public internet (Critical Violation).');
  }

  // Check 6: Application Tier can reach Database (Business Continuity)
  const appToDb = evaluateCloudReachability({
    source: { ip: '10.100.10.45', subnetId: 'sub-private-app-1a', securityGroupIds: ['sg-prod-app-workload'] },
    destination: { ip: '10.100.20.15', workloadType: 'DATABASE' },
    protocol: 'TCP',
    port: 5432,
    securityGroups: challengeState.infraState.securityGroups,
  });
  if (!appToDb.reachable) {
    failedChecks.push('6. Business Continuity: Application Tier cannot reach isolated database on port 5432.');
  }

  // Check 7: Customer Portal can reach Application Tier / Load Balancer (Business Continuity)
  const internetToAlb = evaluateCloudReachability({
    source: { ip: '203.0.113.50', isInternet: true },
    destination: { ip: '10.100.1.10', workloadType: 'PUBLIC_ALB' },
    protocol: 'TCP',
    port: 443,
    securityGroups: challengeState.infraState.securityGroups,
  });
  if (!internetToAlb.reachable) {
    failedChecks.push('7. Business Continuity: Customer Portal is unreachable from public internet on HTTPS.');
  }

  // Check 8: No static admin access key remains active
  if (challengeState.infraState.rootHasActiveAccessKey) {
    failedChecks.push('8. IAM: Root or administrative account static programmatic access key is active.');
  }

  // Check 9: IMDSv2 enforced with token required and hop-limit <= 1
  const imdsv2Enforced = challengeState.infraState.computeInstances.every(
    (i) =>
      i.imdsConfig.version === 'v2' &&
      i.imdsConfig.httpTokens === 'required' &&
      (i.imdsConfig.httpPutResponseHopLimit ?? 1) <= 1
  );
  if (!imdsv2Enforced) {
    failedChecks.push('9. Compute: IMDSv2 is not strictly enforced with httpTokens=required and hop-limit<=1.');
  }

  // Check 10: Incident containment completed
  if (!hasExecutedContainment) {
    failedChecks.push('10. Incident: Containment playbook actions not completed.');
  }

  // Check 11: Incident eradication completed
  if (!hasExecutedEradication) {
    failedChecks.push('11. Incident: Eradication playbook actions not completed.');
  }

  // Check 12: Audit logging enabled
  if (!challengeState.infraState.trailConfig.isLogging) {
    failedChecks.push('12. Logging: Multi-region CloudTrail audit logging is disabled.');
  }

  // Check 13: Centralized log tamper protection enabled
  if (!challengeState.infraState.trailConfig.enableLogFileValidation) {
    failedChecks.push('13. Logging: Central CloudTrail log file cryptographic digest validation is disabled.');
  }

  // Check 14: Anti-cheat flags clean
  if (antiCheatViolations.length > 0) {
    failedChecks.push(`14. Anti-Cheat: ${antiCheatViolations.length} anti-cheat violation(s) detected.`);
  }

  // Check 15: Validate Architecture & Business Continuity
  const archResult = validateCloudArchitecture(challengeState.infraState);
  if (!archResult.passed) {
    archResult.failedChecks.forEach((f) => {
      if (!failedChecks.some((c) => c.includes(f))) {
        failedChecks.push(`Architecture: ${f}`);
      }
    });
  }

  // Check 16: Authorized role assumption succeeds (Business Continuity)
  if (challengeState.testedAuthorizationsPassed === false) {
    failedChecks.push('Business Continuity: Authorized legitimate role assumption operations failed.');
  }

  const businessContinuityPassed =
    internetToAlb.reachable &&
    appToDb.reachable &&
    archResult.businessContinuityPassed &&
    challengeState.testedAuthorizationsPassed !== false;

  const isPassed =
    failedChecks.length === 0 &&
    antiCheatViolations.length === 0 &&
    businessContinuityPassed &&
    cspm.overallScorePercentage >= 85;

  return {
    isPassed,
    scorePercentage: cspm.overallScorePercentage,
    failedChecks,
    antiCheatViolations,
    businessContinuityPassed,
    feedbackEn: isPassed
      ? 'Congratulations! The Cloud Security Master Challenge has been conquered. Your hardened Nexora Cloud infrastructure meets the CIS Benchmark, maintains business continuity, and successfully contained and eradicated the breach.'
      : `Challenge Incomplete: ${failedChecks.length} requirements remaining. Review the failed checks below.`,
    feedbackAr: isPassed
      ? 'تهانينا! لقد أتممت التحدي الشامل لأمن السحابة بنجاح. البنية التحتية لسحابة Nexora محصنة وفق معايير CIS مع ضمان استمرارية الأعمال واحتواء واستئصال الهجوم بالكامل.'
      : `التحدي غير مكتمل: يتبقى ${failedChecks.length} متطلبات. راجع بنود الفحص المتبقية أدناه.`,
    cspmBenchmark: cspm,
  };
}
