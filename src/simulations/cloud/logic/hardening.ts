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

export interface CloudMasterChallengeState {
  infraState: CloudInfrastructureState;
  incidentCase: CloudIncidentCase;
  appliedRemediations: Set<string>;
  testedAuthorizationsPassed: boolean;
}

export interface CloudMasterValidationResult {
  isPassed: boolean;
  scorePercentage: number;
  failedChecks: string[];
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
 */
export function validateCloudMasterChallenge(challengeState: CloudMasterChallengeState): CloudMasterValidationResult {
  const failedChecks: string[] = [];
  const cspm = calculateCspmBenchmark(challengeState.infraState);
  const incidentProgress = evaluateIncidentProgress(challengeState.incidentCase);

  // Check 1: S3 Public Access Remediated
  const rawBucket = challengeState.infraState.buckets.find((b) => b.name === 'nexora-analytics-raw-bucket');
  if (rawBucket && (!rawBucket.publicAccessBlock.blockPublicPolicy || rawBucket.isPubliclyExposed)) {
    failedChecks.push('Storage: nexora-analytics-raw-bucket is still publicly exposed. Enforce Block Public Access.');
  }

  // Check 2: Open SSH/RDP Security Groups closed
  const openMgmtSg = challengeState.infraState.securityGroups.find((sg) => sg.id === 'sg-vulnerable-dev-open');
  if (openMgmtSg && openMgmtSg.ingressRules.some((r) => r.sourceOrDestination === '0.0.0.0/0')) {
    failedChecks.push('Network: Open management port (22/3389) rules from 0.0.0.0/0 have not been removed.');
  }

  // Check 3: IMDSv2 enforced on compute instance
  const webCompute = challengeState.infraState.computeInstances.find((i) => i.id === 'inst-web-prod-01');
  if (webCompute && (webCompute.imdsConfig.version === 'v1' || webCompute.imdsConfig.httpTokens === 'optional')) {
    failedChecks.push('Compute: IMDSv2 is not strictly enforced on web frontend (token requirement still optional).');
  }

  // Check 4: CloudTrail enabled with log validation
  if (!challengeState.infraState.trailConfig.isLogging) {
    failedChecks.push('Logging: CloudTrail logging is stopped.');
  }
  if (!challengeState.infraState.trailConfig.enableLogFileValidation) {
    failedChecks.push('Logging: CloudTrail log file digest validation is disabled.');
  }

  // Check 5: Incident Playbook completed
  if (!incidentProgress.isComplete) {
    failedChecks.push(`Incident: Incident response playbook not finished (current stage: ${challengeState.incidentCase.currentStage}).`);
  }

  // Check 6: Root Access Key deleted
  if (challengeState.infraState.rootHasActiveAccessKey) {
    failedChecks.push('IAM: Root account static access key is still active.');
  }

  const isPassed = failedChecks.length === 0 && cspm.overallScorePercentage >= 85;

  return {
    isPassed,
    scorePercentage: cspm.overallScorePercentage,
    failedChecks,
    feedbackEn: isPassed
      ? 'Congratulations! The Cloud Security Master Challenge has been conquered. Your hardened Nexora Cloud infrastructure meets the CIS Benchmark and successfully contained the breach.'
      : `Challenge Incomplete: ${failedChecks.length} requirements remaining. Review the failed checks below.`,
    feedbackAr: isPassed
      ? 'تهانينا! لقد أتممت التحدي الشامل لأمن السحابة بنجاح. البنية التحتية لسحابة Nexora محصنة وفق معايير CIS وتم احتواء الهجوم بالكامل.'
      : `التحدي غير مكتمل: يتبقى ${failedChecks.length} متطلبات. راجع بنود الفحص المتبقية أدناه.`,
    cspmBenchmark: cspm,
  };
}
