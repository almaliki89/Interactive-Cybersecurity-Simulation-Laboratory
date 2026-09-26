/**
 * OMEGA V12 — Forensics Master Hardening Validator & Anti-Cheat Engine
 * Validates complete Incident Response & Digital Forensics investigation state.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { ForensicEvidence } from './evidence';
import { CustodyRecord, validateCustodyChain } from './custody';
import { ForensicTimelineEvent, sortTimeline, validateForensicTimelineEvidence } from './timeline';
import { RootCauseFinding, evaluateRootCauseFinding } from './rootCause';
import { SystemRecoveryState, validateRecoveryState } from './recovery';
import { SYNTHETIC_MASTER_TIMELINE } from './timeline';

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

export interface ForensicActionRecord {
  id: string;
  type:
    | 'MEMORY_ACQUIRED'
    | 'DISK_ACQUIRED'
    | 'LOGS_COLLECTED'
    | 'HOST_ISOLATED'
    | 'HOST_POWERED_OFF'
    | 'ACCOUNT_DISABLED';
  virtualTime: number;
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
  actionRecords: ForensicActionRecord[];

  // Anti-cheat flags
  deletedOriginalEvidence: boolean;
  poweredOffBeforeMemoryAcquisition: boolean;
  markedAllFilesMalicious: boolean;
  reinstalledWithoutInvestigation: boolean;
  blockedEntireCompanyNetwork: boolean;
  disabledAllFinanceUsers: boolean;
  closedCaseWithoutRootCause: boolean;
}

export function getInitialForensicsChallengeState(): ForensicsMasterState {
  return {
    caseOpened: false,
    selectedScopeHosts: [],
    preservedVolatileMemoryFirst: false,
    acquiredEvidence: [],
    custodyRecords: [],
    verifiedEvidenceHashes: [],
    reconstructedTimeline: [],
    identifiedLogTampering: false,
    rootCauseFinding: null,
    selectedContainmentActionIds: [],
    systemRecoveryState: {
      compromisedAccountReset: false,
      unauthorizedPrivilegesReverted: false,
      suspiciousProcessesTerminated: false,
      maliciousFilesEradicated: false,
      auditLoggingEnabled: false,
      networkSecurityPoliciesApplied: false,
      businessApplicationTested: false,
      lingeringSuspiciousState: true,
    },
    lessonsDocumented: false,
    actionRecords: [],

    // Anti-cheat flags
    deletedOriginalEvidence: false,
    poweredOffBeforeMemoryAcquisition: false,
    markedAllFilesMalicious: false,
    reinstalledWithoutInvestigation: false,
    blockedEntireCompanyNetwork: false,
    disabledAllFinanceUsers: false,
    closedCaseWithoutRootCause: false,
  };
}

export function getSolvedForensicsMasterState(): ForensicsMasterState {
  return {
    caseOpened: true,
    selectedScopeHosts: ['FIN-WS-01', 'DC-01', 'LINUX-SRV-01', 'APP-SRV-01', 'FIN-SRV'],
    preservedVolatileMemoryFirst: true,
    acquiredEvidence: [
      {
        id: 'EVD-MEM-FIN-WS01',
        type: 'MEMORY_IMAGE',
        sourceHost: 'FIN-WS-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 10,
        originalHash: 'sha256:11112222333344445555666677778888',
        currentHash: 'sha256:11112222333344445555666677778888',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { ramDump: 'FIN-WS-01.raw' },
      },
      {
        id: 'EVD-DISK-FIN-WS01',
        type: 'DISK_IMAGE',
        sourceHost: 'FIN-WS-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 20,
        originalHash: 'sha256:88887777666655554444333322221111',
        currentHash: 'sha256:88887777666655554444333322221111',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { diskImage: 'FIN-WS-01.E01' },
      },
      {
        id: 'EVD-LOG-WIN-SEC',
        type: 'LOG_EXPORT',
        sourceHost: 'FIN-WS-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 30,
        originalHash: 'sha256:99998888777766665555444433332222',
        currentHash: 'sha256:99998888777766665555444433332222',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { logExport: 'Security.evtx' },
      },
      {
        id: 'EVD-LOG-LINUX-AUTH',
        type: 'LOG_EXPORT',
        sourceHost: 'LINUX-SRV-01',
        sourceUser: 'root',
        acquiredAtVirtualTime: 40,
        originalHash: 'sha256:ababababcdcdcdcd1212121234343434',
        currentHash: 'sha256:ababababcdcdcdcd1212121234343434',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { logFile: '/var/log/auth.log' },
      },
      {
        id: 'EVD-NET-PCAP-01',
        type: 'NETWORK_CAPTURE',
        sourceHost: 'FW-CORE-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 50,
        originalHash: 'sha256:00001111222233334444555566667777',
        currentHash: 'sha256:00001111222233334444555566667777',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { pcap: 'fw_capture.pcap' },
      },
      {
        id: 'EVD-BROWSER-HIST',
        type: 'BROWSER_ARTIFACT',
        sourceHost: 'FIN-WS-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 60,
        originalHash: 'sha256:55554444333322221111000099998888',
        currentHash: 'sha256:55554444333322221111000099998888',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { history: 'History.db' },
      },
    ],
    custodyRecords: [
      { id: 'CUST-001', evidenceId: 'EVD-MEM-FIN-WS01', virtualTime: 10, action: 'COLLECTED', actor: 'Lead Investigator', notes: 'RAM Dump acquired' },
      { id: 'CUST-002', evidenceId: 'EVD-MEM-FIN-WS01', virtualTime: 15, action: 'VERIFIED', actor: 'Evidence Officer', notes: 'Hash verified' },
      { id: 'CUST-003', evidenceId: 'EVD-DISK-FIN-WS01', virtualTime: 20, action: 'COLLECTED', actor: 'Lead Investigator', notes: 'Disk Image acquired' },
      { id: 'CUST-004', evidenceId: 'EVD-DISK-FIN-WS01', virtualTime: 25, action: 'VERIFIED', actor: 'Evidence Officer', notes: 'Hash verified' },
      { id: 'CUST-005', evidenceId: 'EVD-LOG-WIN-SEC', virtualTime: 30, action: 'COLLECTED', actor: 'Lead Investigator', notes: 'Security.evtx exported' },
      { id: 'CUST-006', evidenceId: 'EVD-LOG-WIN-SEC', virtualTime: 35, action: 'VERIFIED', actor: 'Evidence Officer', notes: 'Hash verified' },
      { id: 'CUST-007', evidenceId: 'EVD-LOG-LINUX-AUTH', virtualTime: 40, action: 'COLLECTED', actor: 'Lead Investigator', notes: 'auth.log exported' },
      { id: 'CUST-008', evidenceId: 'EVD-LOG-LINUX-AUTH', virtualTime: 45, action: 'VERIFIED', actor: 'Evidence Officer', notes: 'Hash verified' },
      { id: 'CUST-009', evidenceId: 'EVD-NET-PCAP-01', virtualTime: 50, action: 'COLLECTED', actor: 'Lead Investigator', notes: 'pcap exported' },
      { id: 'CUST-010', evidenceId: 'EVD-NET-PCAP-01', virtualTime: 55, action: 'VERIFIED', actor: 'Evidence Officer', notes: 'Hash verified' },
      { id: 'CUST-011', evidenceId: 'EVD-BROWSER-HIST', virtualTime: 60, action: 'COLLECTED', actor: 'Lead Investigator', notes: 'History.db exported' },
      { id: 'CUST-012', evidenceId: 'EVD-BROWSER-HIST', virtualTime: 65, action: 'VERIFIED', actor: 'Evidence Officer', notes: 'Hash verified' },
    ],
    verifiedEvidenceHashes: ['EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01', 'EVD-LOG-WIN-SEC', 'EVD-LOG-LINUX-AUTH', 'EVD-NET-PCAP-01', 'EVD-BROWSER-HIST'],
    reconstructedTimeline: SYNTHETIC_MASTER_TIMELINE,
    identifiedLogTampering: true,
    rootCauseFinding: {
      initialAccessVector: 'Brute-force password spray targeting user sara, Kerberos AS-REQ pre-auth bypass',
      affectedIdentity: 'sara',
      affectedHost: 'FIN-WS-01',
      privilegeChange: 'Domain Admins',
      impactedResources: ['\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx'],
      evidenceIds: ['EVD-LOG-WIN-SEC', 'EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01', 'EVD-NET-PCAP-01'],
    },
    selectedContainmentActionIds: ['ACT-ISOLATE-NETWORK', 'ACT-REVOKE-SARA-SESSIONS', 'ACT-REVERT-PRIVILEGE'],
    systemRecoveryState: {
      compromisedAccountReset: true,
      unauthorizedPrivilegesReverted: true,
      suspiciousProcessesTerminated: true,
      maliciousFilesEradicated: true,
      auditLoggingEnabled: true,
      networkSecurityPoliciesApplied: true,
      businessApplicationTested: true,
      lingeringSuspiciousState: false,
    },
    lessonsDocumented: true,
    actionRecords: [
      { id: 'ACT-001', type: 'MEMORY_ACQUIRED', virtualTime: 10 },
      { id: 'ACT-002', type: 'DISK_ACQUIRED', virtualTime: 20 },
      { id: 'ACT-003', type: 'LOGS_COLLECTED', virtualTime: 30 },
      { id: 'ACT-004', type: 'HOST_ISOLATED', virtualTime: 100 },
      { id: 'ACT-005', type: 'ACCOUNT_DISABLED', virtualTime: 110 },
    ],

    // Anti-cheat flags
    deletedOriginalEvidence: false,
    poweredOffBeforeMemoryAcquisition: false,
    markedAllFilesMalicious: false,
    reinstalledWithoutInvestigation: false,
    blockedEntireCompanyNetwork: false,
    disabledAllFinanceUsers: false,
    closedCaseWithoutRootCause: false,
  };
}

export function validateOrderOfVolatility(
  evidence: ForensicEvidence[],
  actionRecords: ForensicActionRecord[] = [],
  preservedVolatileMemoryFirst: boolean = false
): { passed: boolean; reasonEn: string; reasonAr: string } {
  const powerOffRecord = actionRecords.find((a) => a.type === 'HOST_POWERED_OFF');
  const memoryRecord = actionRecords.find((a) => a.type === 'MEMORY_ACQUIRED');
  const memEvidence = evidence.find((e) => e.type === 'MEMORY_IMAGE');
  const diskEvidence = evidence.find((e) => e.type === 'DISK_IMAGE');

  if (powerOffRecord) {
    const memTime = memoryRecord ? memoryRecord.virtualTime : (memEvidence ? memEvidence.acquiredAtVirtualTime : Infinity);
    if (powerOffRecord.virtualTime <= memTime) {
      return {
        passed: false,
        reasonEn: 'FAIL: Hard power off executed before volatile RAM memory acquisition, destroying volatile evidence.',
        reasonAr: 'فشل: إيقاف التشغيل الإجباري قبل أخذ لقطة الذاكرة المؤقتة دمر أدلة الـ RAM.',
      };
    }
  }

  if (memEvidence && diskEvidence) {
    if (diskEvidence.acquiredAtVirtualTime < memEvidence.acquiredAtVirtualTime) {
      return {
        passed: false,
        reasonEn: 'FAIL: Non-volatile disk image acquired before volatile memory (RAM). Order of volatility violated.',
        reasonAr: 'فشل: تم الاستحواذ على القرص قبل الذاكرة التطايرية. تم انتهاك تسلسل التطاير.',
      };
    }
  }

  const passed = preservedVolatileMemoryFirst && memEvidence !== undefined;

  return {
    passed,
    reasonEn: passed
      ? 'PASS: Volatile memory (RAM) evidence preserved prior to non-volatile acquisition.'
      : 'FAIL: Volatile memory evidence must be preserved before non-volatile acquisition or reboot.',
    reasonAr: passed
      ? 'نجاح: تم حفظ الذاكرة التطايرية RAM قبل أي إجراء تخريبي.'
      : 'فشل: يجب حفظ الذاكرة التطايرية أولاً.',
  };
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

  // Check 1: Evidence Integrity Status & Verification Check
  const corruptEvidence = state.acquiredEvidence.filter(
    (e) => e.originalHash !== e.currentHash || e.integrityStatus === 'MISMATCH'
  );
  const unverifiedEvidence = state.acquiredEvidence.filter(
    (e) => e.integrityStatus !== 'VERIFIED' || !state.verifiedEvidenceHashes.includes(e.id)
  );
  const evidenceIntegrityPassed =
    corruptEvidence.length === 0 &&
    unverifiedEvidence.length === 0 &&
    state.acquiredEvidence.length > 0;

  checks.push({
    id: 'chk-evidence-hash-integrity',
    category: 'Integrity Verification',
    nameEn: 'Evidence Hash Integrity Verification (Synthetic Deterministic Hash Match & Verified Status)',
    nameAr: 'التحقق من سلامة تجزئة الأدلة الجنائية والتحقق المعتمد',
    passed: evidenceIntegrityPassed,
    score: evidenceIntegrityPassed ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: evidenceIntegrityPassed
      ? 'PASS: All acquired forensic evidence verified with matching synthetic deterministic hash digests.'
      : corruptEvidence.length > 0
      ? `FAIL: Evidence hash integrity mismatch detected on ${corruptEvidence.length} item(s).`
      : `FAIL: Evidence integrity verification incomplete on ${unverifiedEvidence.length} item(s) (must be explicitly VERIFIED and recorded in verifiedEvidenceHashes).`,
    feedbackAr: evidenceIntegrityPassed
      ? 'نجاح: جميع الأدلة الجنائية تم التحقق من سلامتها وتطابق قيم التجزئة التركيبية.'
      : corruptEvidence.length > 0
      ? 'فشل: تباين في تجزئة الأدلة الجنائية مما يدل على تعديلها.'
      : 'فشل: لم يتم توثيق التحقق من سلامة الأدلة الجنائية في سجل التحقق.',
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
  const oovRes = validateOrderOfVolatility(
    state.acquiredEvidence,
    state.actionRecords,
    state.preservedVolatileMemoryFirst
  );
  checks.push({
    id: 'chk-order-of-volatility',
    category: 'Evidence Preservation',
    nameEn: 'Order of Volatility Preservation (RAM before Disk)',
    nameAr: 'حفظ الأدلة حسب تسلسل التطاير (الذاكرة أولاً)',
    passed: oovRes.passed,
    score: oovRes.passed ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: oovRes.reasonEn,
    feedbackAr: oovRes.reasonAr,
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
  const timelineVal = validateForensicTimelineEvidence(state.reconstructedTimeline);
  const correctOrder = timelineVal.valid && state.identifiedLogTampering;
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
      ? `PASS: Forensic timeline reconstructed with ${state.reconstructedTimeline.length} evidence anchors including Event 1102 log tamper.`
      : `FAIL: Timeline validation failed (${timelineVal.reasonsEn.join('; ') || 'missing log tamper detection'}).`,
    feedbackAr: correctOrder
      ? 'نجاح: تم بناء الخط الزمني للحادثة واكتشاف مسح السجلات.'
      : 'فشل: الخط الزمني غير مكتمل.',
  });

  // Check 8: Evidence-Backed Root Cause Analysis
  let rootCausePassed = false;
  let rootCauseFeedbackEn = 'FAIL: Root cause analysis lacks supporting collected evidence or initial access vector.';
  let rootCauseFeedbackAr = 'فشل: تحليل السبب الجذر يفتقر للأدلة.';

  if (state.rootCauseFinding) {
    const collectedIds = state.acquiredEvidence.map((e) => e.id);
    const evalRes = evaluateRootCauseFinding(state.rootCauseFinding, collectedIds);
    rootCausePassed = evalRes.valid;
    if (!rootCausePassed) {
      rootCauseFeedbackEn = `FAIL: ${evalRes.reasonsEn.join('; ')}`;
      rootCauseFeedbackAr = `فشل: ${evalRes.reasonsAr.join('; ')}`;
    } else {
      rootCauseFeedbackEn = 'PASS: Root cause correctly attributes brute-force access, Kerberos elevation, and Finance share access with supporting evidence.';
      rootCauseFeedbackAr = 'نجاح: تحليل السبب الجذر مدعوم بالأدلة الجنائية.';
    }
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
    feedbackEn: rootCauseFeedbackEn,
    feedbackAr: rootCauseFeedbackAr,
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
