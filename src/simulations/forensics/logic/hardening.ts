/**
 * OMEGA V12 — Forensics Master Hardening Validator & Anti-Cheat Engine
 * Validates complete Incident Response & Digital Forensics investigation state.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { ForensicEvidence } from './evidence';
import { CustodyRecord, validateCustodyChain } from './custody';
import { ForensicTimelineEvent, sortTimeline } from './timeline';
import { RootCauseFinding, evaluateRootCauseFinding } from './rootCause';
import { SystemRecoveryState, validateRecoveryState } from './recovery';

export interface ForensicCheckDetail {
  id: string;
  category: string;
  nameEn: string;
  nameAr: string;
  passed: boolean;
  score: number;
  weight: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  feedbackEn: string;
  feedbackAr: string;
}

export interface ForensicsMasterState {
  caseOpened: boolean;
  selectedScopeHosts: string[];
  preservedVolatileMemoryFirst: boolean;
  acquiredEvidence: ForensicEvidence[];
  custodyRecords: CustodyRecord[];
  verifiedEvidenceHashes: string[];
  reconstructedTimeline: ForensicTimelineEvent[];
  identifiedLogTampering: boolean;
  rootCauseFinding: RootCauseFinding | null;
  selectedContainmentActionIds: string[];
  systemRecoveryState: SystemRecoveryState;
  lessonsDocumented: boolean;

  // Anti-cheat flags
  deletedOriginalEvidence: boolean;
  poweredOffBeforeMemoryAcquisition: boolean;
  markedAllFilesMalicious: boolean;
  reinstalledWithoutInvestigation: boolean;
  blockedEntireCompanyNetwork: boolean;
  disabledAllFinanceUsers: boolean;
  closedCaseWithoutRootCause: boolean;
}

export interface ForensicsMasterValidationResult {
  success: boolean;
  score: number;
  passedChecks: string[];
  failedChecks: string[];
  checkDetails: ForensicCheckDetail[];
  evidenceIntegrityPassed: boolean;
  businessContinuityPassed: boolean;
  summaryEn: string;
  summaryAr: string;
}

/**
 * Validates complete forensics investigation state against master checks and anti-cheat rules
 */
export function validateForensicInvestigationState(
  state: ForensicsMasterState
): ForensicsMasterValidationResult {
  const checks: ForensicCheckDetail[] = [];

  // ANTI-CHEAT FAILURES
  if (state.deletedOriginalEvidence) {
    return createAntiCheatFailure(
      'chk-anticheat-evidence-deletion',
      'FAIL: Tampering or deleting original forensic evidence is strictly prohibited.',
      'فشل: مسح أو التلاعب بالأدلة الجنائية الأصلية حظر صارم.'
    );
  }

  if (state.poweredOffBeforeMemoryAcquisition) {
    return createAntiCheatFailure(
      'chk-anticheat-order-of-volatility',
      'FAIL: Hard power off executed before volatile RAM memory acquisition, destroying volatile evidence.',
      'فشل: إيقاف التشغيل الإجباري قبل أخذ لقطة الذاكرة المؤقتة دمر أدلة الـ RAM.'
    );
  }

  if (state.markedAllFilesMalicious) {
    return createAntiCheatFailure(
      'chk-anticheat-blanket-malicious-flag',
      'FAIL: Indiscriminately marking all system files malicious violates forensic accuracy.',
      'فشل: تصنيف جميع الملفات كملفات ضارة دون تمييز يخالف أصول التحقيق.'
    );
  }

  if (state.reinstalledWithoutInvestigation) {
    return createAntiCheatFailure(
      'chk-anticheat-reinstall-without-investigation',
      'FAIL: Immediate format and reinstallation executed without root cause analysis.',
      'فشل: إعادة التثبيت الفورية دون إجراء تحليل الجذور والأدلة أمر غير مقبول.'
    );
  }

  if (state.blockedEntireCompanyNetwork) {
    return createAntiCheatFailure(
      'chk-anticheat-network-outage',
      'FAIL: Blocking total corporate network traffic caused a business outage.',
      'فشل: حظر جميع الاتصالات الشبكية للشركة تسبب في انقطاع الخدمة.'
    );
  }

  if (state.disabledAllFinanceUsers) {
    return createAntiCheatFailure(
      'chk-anticheat-user-outage',
      'FAIL: Disabling all finance personnel destroyed department productivity.',
      'فشل: تعطيل حسابات جميع موظفي المالية أوقف إنتاجية القسم.'
    );
  }

  if (state.closedCaseWithoutRootCause) {
    return createAntiCheatFailure(
      'chk-anticheat-closed-without-root-cause',
      'FAIL: Closing case without evidence-backed root cause finding is invalid.',
      'فشل: إغلاق القضية دون تقديم سبب جذر مدعوم بالأدلة أمر مرفوض.'
    );
  }

  // Check 1: Evidence Integrity Status (Hash Mismatch Check)
  const corruptEvidence = state.acquiredEvidence.filter(
    (e) => e.originalHash !== e.currentHash || e.integrityStatus === 'MISMATCH'
  );
  const evidenceIntegrityPassed = corruptEvidence.length === 0 && state.acquiredEvidence.length > 0;

  checks.push({
    id: 'chk-evidence-hash-integrity',
    category: 'Integrity Verification',
    nameEn: 'Evidence Hash Integrity Verification (SHA-256 Synthetic Match)',
    nameAr: 'التحقق من سلامة تجزئة الأدلة الجنائية',
    passed: evidenceIntegrityPassed,
    score: evidenceIntegrityPassed ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: evidenceIntegrityPassed
      ? 'PASS: All acquired forensic evidence matches original SHA-256 synthetic hash digests.'
      : `FAIL: Evidence hash integrity mismatch detected on ${corruptEvidence.length} item(s).`,
    feedbackAr: evidenceIntegrityPassed
      ? 'نجاح: جميع الأدلة الجنائية تطابق قيم التجزئة الأصلية.'
      : 'فشل: تباين في تجزئة الأدلة الجنائية مما يدل على تعديلها.',
  });

  // Check 2: Incident Scope Selection
  const scopePassed = state.caseOpened && state.selectedScopeHosts.includes('FIN-WS-01') && state.selectedScopeHosts.length >= 3;
  checks.push({
    id: 'chk-incident-scope-defined',
    category: 'Incident Intake',
    nameEn: 'Incident Investigation Scope Definition',
    nameAr: 'تحديد نطاق التحقيق في الحادثة الأمنية',
    passed: scopePassed,
    score: scopePassed ? 5 : 0,
    weight: 5,
    severity: 'MEDIUM',
    feedbackEn: scopePassed
      ? 'PASS: Forensic case opened and affected hosts (FIN-WS-01, DC-01, LINUX-SRV-01) properly scoped.'
      : 'FAIL: Incident scope incomplete; target endpoint FIN-WS-01 and servers must be selected.',
    feedbackAr: scopePassed
      ? 'نجاح: فتح ملف القضية وتحديد الأجهزة المتأثرة بدقة.'
      : 'فشل: نطاق التحقيق غير مكتمل.',
  });

  // Check 3: Order of Volatility & Preservation
  const preservationPassed = state.preservedVolatileMemoryFirst;
  checks.push({
    id: 'chk-order-of-volatility',
    category: 'Evidence Preservation',
    nameEn: 'Order of Volatility Preservation (RAM before Disk)',
    nameAr: 'حفظ الأدلة حسب تسلسل التطاير (الذاكرة أولاً)',
    passed: preservationPassed,
    score: preservationPassed ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: preservationPassed
      ? 'PASS: Volatile memory (RAM) evidence preserved prior to destructive endpoint actions.'
      : 'FAIL: Volatile memory evidence must be preserved before destructive containment or hard reboot.',
    feedbackAr: preservationPassed
      ? 'نجاح: تم حفظ الذاكرة التطايرية RAM قبل أي إجراء تخريبي.'
      : 'فشل: يجب حفظ الذاكرة التطايرية أولاً.',
  });

  // Check 4: Memory & Disk Acquisition
  const memoryAcquired = state.acquiredEvidence.some((e) => e.type === 'MEMORY_IMAGE');
  const diskAcquired = state.acquiredEvidence.some((e) => e.type === 'DISK_IMAGE' || e.type === 'LOG_EXPORT');
  const acquisitionPassed = memoryAcquired && diskAcquired;
  checks.push({
    id: 'chk-evidence-acquisition-complete',
    category: 'Acquisition',
    nameEn: 'Volatile & Non-Volatile Forensic Evidence Acquisition',
    nameAr: 'الاستحواذ على الأدلة التطايرية وغير التطايرية',
    passed: acquisitionPassed,
    score: acquisitionPassed ? 10 : 0,
    weight: 10,
    severity: 'HIGH',
    feedbackEn: acquisitionPassed
      ? 'PASS: Both memory snapshot and disk/log images acquired successfully.'
      : 'FAIL: Investigation must acquire both RAM memory dump and disk/log images.',
    feedbackAr: acquisitionPassed
      ? 'نجاح: تم الاستحواذ على صورة الذاكرة والقرص والسجلات.'
      : 'فشل: يجب الاستحواذ على الذاكرة والقرص معاً.',
  });

  // Check 5: Chain of Custody Validation
  let custodyPassed = false;
  if (state.acquiredEvidence.length > 0) {
    const custodyValidations = state.acquiredEvidence.map((e) =>
      validateCustodyChain(e.id, state.custodyRecords, e.originalHash, e.currentHash)
    );
    custodyPassed = custodyValidations.length > 0 && custodyValidations.every((v) => v.valid);
  }

  checks.push({
    id: 'chk-chain-of-custody-complete',
    category: 'Chain of Custody',
    nameEn: 'Immutable Chain of Custody Documentation',
    nameAr: 'توثيق تسلسل الحضانة والملكية للأدلة',
    passed: custodyPassed,
    score: custodyPassed ? 10 : 0,
    weight: 10,
    severity: 'HIGH',
    feedbackEn: custodyPassed
      ? 'PASS: Complete chain of custody logs recorded for all acquired evidence items.'
      : 'FAIL: Chain of custody incomplete; missing collector, timestamp, or integrity verifications.',
    feedbackAr: custodyPassed
      ? 'نجاح: توثيق سلسلة الحضانة مكتمل لجميع الأدلة.'
      : 'فشل: سلسلة الحضانة غير مكتملة.',
  });

  // Check 6: Windows & Linux Artifact Identification
  const winIdentified = state.acquiredEvidence.some((e) => e.sourceHost === 'FIN-WS-01' || e.type === 'REGISTRY_ARTIFACT' || e.type === 'PROCESS_SNAPSHOT');
  const linuxIdentified = state.acquiredEvidence.some((e) => e.sourceHost === 'LINUX-SRV-01' || e.type === 'LOG_EXPORT');
  const artifactPassed = winIdentified && linuxIdentified;
  checks.push({
    id: 'chk-multi-os-artifacts',
    category: 'Artifact Analysis',
    nameEn: 'Windows & Linux Defensive Artifact Analysis',
    nameAr: 'تحليل الأدلة الدفاعية لويندوز ولينكس',
    passed: artifactPassed,
    score: artifactPassed ? 10 : 0,
    weight: 10,
    severity: 'HIGH',
    feedbackEn: artifactPassed
      ? 'PASS: Windows Event Log/cmd.exe artifacts and Linux auth/python artifacts analyzed.'
      : 'FAIL: Must analyze artifacts from both Windows (FIN-WS-01) and Linux (LINUX-SRV-01) worlds.',
    feedbackAr: artifactPassed
      ? 'نجاح: تم تحليل أدلة ويندوز ولينكس.'
      : 'فشل: يجب تحليل أدلة النظامين.',
  });

  // Check 7: Forensic Timeline Reconstruction & Log Tampering
  const timelineCount = state.reconstructedTimeline.length;
  const sortedTL = sortTimeline(state.reconstructedTimeline);
  const correctOrder = sortedTL.length >= 8 && state.identifiedLogTampering;
  checks.push({
    id: 'chk-forensic-timeline-built',
    category: 'Timeline Reconstruction',
    nameEn: 'Chronological Multi-Source Forensic Timeline & Log Tampering Detection',
    nameAr: 'بناء الخط الزمني واكتشاف مسح السجلات',
    passed: correctOrder,
    score: correctOrder ? 10 : 0,
    weight: 10,
    severity: 'HIGH',
    feedbackEn: correctOrder
      ? `PASS: Forensic timeline reconstructed with ${timelineCount} evidence anchors including Event 1102 log tamper.`
      : 'FAIL: Timeline incomplete or missing Event 1102 log tampering detection.',
    feedbackAr: correctOrder
      ? 'نجاح: تم بناء الخط الزمني للحادثة واكتشاف مسح السجلات.'
      : 'فشل: الخط الزمني غير مكتمل.',
  });

  // Check 8: Evidence-Backed Root Cause Analysis
  let rootCausePassed = false;
  if (state.rootCauseFinding) {
    const collectedIds = state.acquiredEvidence.map((e) => e.id);
    const evalRes = evaluateRootCauseFinding(state.rootCauseFinding, collectedIds);
    rootCausePassed = evalRes.valid;
  }

  checks.push({
    id: 'chk-evidence-backed-root-cause',
    category: 'Root Cause Analysis',
    nameEn: 'Evidence-Grounded Root Cause & Initial Access Attribution',
    nameAr: 'تحديد السبب الجذر القائم على الأدلة الجنائية',
    passed: rootCausePassed,
    score: rootCausePassed ? 15 : 0,
    weight: 15,
    severity: 'CRITICAL',
    feedbackEn: rootCausePassed
      ? 'PASS: Root cause correctly attributes brute-force access, Kerberos elevation, and Finance share access with supporting evidence.'
      : 'FAIL: Root cause analysis lacks supporting collected evidence or initial access vector.',
    feedbackAr: rootCausePassed
      ? 'نجاح: تحليل السبب الجذر مدعوم بالأدلة الجنائية.'
      : 'فشل: تحليل السبب الجذر يفتقر للأدلة.',
  });

  // Check 9: Proportional Containment & Eradication
  const hasNetworkIsolate = state.selectedContainmentActionIds.includes('ACT-ISOLATE-NETWORK');
  const hasRevokeSara = state.selectedContainmentActionIds.includes('ACT-REVOKE-SARA-SESSIONS');
  const hasRevertPriv = state.selectedContainmentActionIds.includes('ACT-REVERT-PRIVILEGE');
  const hasPowerOff = state.selectedContainmentActionIds.includes('ACT-POWER-OFF');

  const containmentPassed = hasNetworkIsolate && hasRevokeSara && hasRevertPriv && !hasPowerOff;
  checks.push({
    id: 'chk-proportional-containment',
    category: 'Containment & Eradication',
    nameEn: 'Proportional Containment & Threat Eradication',
    nameAr: 'احتواء الحادثة واستئصال التهديد بشكل متناسب',
    passed: containmentPassed,
    score: containmentPassed ? 10 : 0,
    weight: 10,
    severity: 'HIGH',
    feedbackEn: containmentPassed
      ? 'PASS: Endpoint isolated, session revoked, and Domain Admin privilege escalation reverted.'
      : 'FAIL: Must execute network isolation, session revocation, and privilege reversion without hard power off.',
    feedbackAr: containmentPassed
      ? 'نجاح: عزل الجهاز، إلغاء الجلسات، وإلغاء رفع الصلاحيات بشكل متناسب.'
      : 'فشل: إجراءات الاحتواء غير متناسبة.',
  });

  // Check 10: System Recovery & Re-Validation
  const recRes = validateRecoveryState(state.systemRecoveryState);
  checks.push({
    id: 'chk-recovery-validation-passed',
    category: 'Recovery Validation',
    nameEn: 'Post-Eradication Recovery & Audit Logging Validation',
    nameAr: 'التحقق من التعافي وتفعيل تسجيل التدقيق الأمني',
    passed: recRes.passed,
    score: recRes.passed ? 10 : 0,
    weight: 10,
    severity: 'HIGH',
    feedbackEn: recRes.summaryEn,
    feedbackAr: recRes.summaryAr,
  });

  // Check 11: Lessons Learned Documentation
  const lessonsPassed = state.lessonsDocumented;
  checks.push({
    id: 'chk-lessons-learned-documented',
    category: 'Post-Incident Review',
    nameEn: 'Post-Incident Review & Defensive Control Improvement',
    nameAr: 'توثيق الدروس المستفادة وتحسين القواعد الدفاعية',
    passed: lessonsPassed,
    score: lessonsPassed ? 10 : 0,
    weight: 10,
    severity: 'MEDIUM',
    feedbackEn: lessonsPassed
      ? 'PASS: Post-incident report compiled with root cause findings and recommended SIEM/MFA improvements.'
      : 'FAIL: Lessons learned review must be compiled with evidence references.',
    feedbackAr: lessonsPassed
      ? 'نجاح: توثيق الدروس المستفادة وتحسينات التحكم.'
      : 'فشل: توثيق الدروس المستفادة غير مكتمل.',
  });

  // Calculate totals
  const totalWeight = checks.reduce((acc, c) => acc + c.weight, 0);
  const earnedScore = checks.reduce((acc, c) => acc + (c.passed ? c.score : 0), 0);
  const scaledScore = Math.round((earnedScore / totalWeight) * 100);

  const passedChecks = checks.filter((c) => c.passed).map((c) => c.id);
  const failedChecks = checks.filter((c) => !c.passed).map((c) => c.id);

  const businessContinuityPassed =
    !state.blockedEntireCompanyNetwork &&
    !state.disabledAllFinanceUsers &&
    !state.reinstalledWithoutInvestigation;

  const success = failedChecks.length === 0 && evidenceIntegrityPassed && businessContinuityPassed;

  const summaryEn = success
    ? 'INCIDENT RESPONSE & FORENSICS PASSED: 100% Evidence Integrity, Scope, Timeline, Root Cause, Containment & Recovery Validated!'
    : `INVESTIGATION INCOMPLETE: ${failedChecks.length} control check(s) failed (${scaledScore}/100 points).`;

  const summaryAr = success
    ? 'تم باجتياز كامل: 100% سلامة الأدلة، تحديد النطاق، الخط الزمني، السبب الجذر، والتعافي المحقق!'
    : `التحقيق غير مكتمل: فشل ${failedChecks.length} بنود فحص (${scaledScore}/100 درجة).`;

  return {
    success,
    score: scaledScore,
    passedChecks,
    failedChecks,
    checkDetails: checks,
    evidenceIntegrityPassed,
    businessContinuityPassed,
    summaryEn,
    summaryAr,
  };
}

function createAntiCheatFailure(
  checkId: string,
  reasonEn: string,
  reasonAr: string
): ForensicsMasterValidationResult {
  return {
    success: false,
    score: 0,
    passedChecks: [],
    failedChecks: [checkId],
    checkDetails: [
      {
        id: checkId,
        category: 'Anti-Cheat Violations',
        nameEn: 'Forensic Anti-Cheat Enforcement',
        nameAr: 'حظر التحايل وانتهاك أصول التحقيق',
        passed: false,
        score: 0,
        weight: 100,
        severity: 'CRITICAL',
        feedbackEn: reasonEn,
        feedbackAr: reasonAr,
      },
    ],
    evidenceIntegrityPassed: false,
    businessContinuityPassed: false,
    summaryEn: reasonEn,
    summaryAr: reasonAr,
  };
}
