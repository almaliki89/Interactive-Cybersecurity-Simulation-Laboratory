/**
 * OMEGA V11 — SOC Master Challenge Production Investigation Validator
 * Scenario: NEXORA SOC MULTI-STAGE SECURITY INCIDENT
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityAlert } from './detection';
import { SecurityIncident } from './incidents';
import { ContainmentActionType } from './containment';
import { calculateDetectionMetrics, EventClassification } from './metrics';

export interface TimelineValidationDetails {
  passed: boolean;
  missingStages: string[];
  outOfOrderStages: string[];
  reasonEn: string;
  reasonAr: string;
}

export function validateTimelineOrderAndEvidence(attachedTimelineEventIds: string[]): TimelineValidationDetails {
  const CORE_STAGES = [
    'AUTH_FAILURE',
    'AUTH_SUCCESS',
    'PRIVILEGED_GROUP_CHANGE',
    'ENDPOINT_PROCESS_ANOMALY',
    'NETWORK_PROBE',
    'SENSITIVE_RESOURCE_ACCESS',
    'APPSEC_ANOMALY',
    'LOG_TAMPER',
  ] as const;

  type CoreStage = typeof CORE_STAGES[number];

  const mapItemToStage = (idOrType: string): CoreStage | null => {
    const s = idOrType.toUpperCase().replace(/-/g, '_');
    if (s.includes('LOG_CLEARED') || s.includes('WIN_LOG_CLEARED') || s.includes('1102') || s.includes('LOG_TAMPER') || s.includes('TAMPER')) {
      return 'LOG_TAMPER';
    }
    if (s.includes('APPSEC') || s.includes('BOLA') || s.includes('APP_ACCESS_DENIED') || s.includes('403') || s.includes('IDOR')) {
      return 'APPSEC_ANOMALY';
    }
    if (s.includes('SENSITIVE') || s.includes('RESOURCE_ACCESS') || s.includes('FINANCE') || s.includes('SHARE')) {
      return 'SENSITIVE_RESOURCE_ACCESS';
    }
    if (s.includes('PACKET_BLOCKED') || s.includes('NETWORK') || s.includes('SCAN') || s.includes('PROBE') || s.includes('FIREWALL')) {
      return 'NETWORK_PROBE';
    }
    if (s.includes('PROCESS') || s.includes('4688') || s.includes('SPAWN') || s.includes('CMD') || s.includes('ENDPOINT')) {
      return 'ENDPOINT_PROCESS_ANOMALY';
    }
    if (s.includes('PRIVILEGED_GROUP') || s.includes('PRIV_GROUP') || s.includes('GROUP_CHANGE') || s.includes('GROUP_MOD') || s.includes('4728') || s.includes('DOMAIN_ADMIN')) {
      return 'PRIVILEGED_GROUP_CHANGE';
    }
    if (s.includes('AUTH_SUCCESS') || s.includes('LOGON_SUCCESS') || s.includes('KERBEROS_AUTH_SUCCESS') || s.includes('4624')) {
      return 'AUTH_SUCCESS';
    }
    if (s.includes('AUTH_FAIL') || s.includes('LOGIN_FAILED') || s.includes('4625') || s.includes('BRUTE')) {
      return 'AUTH_FAILURE';
    }
    return null;
  };

  const stageIndicesInInput: Record<CoreStage, number[]> = {
    AUTH_FAILURE: [],
    AUTH_SUCCESS: [],
    PRIVILEGED_GROUP_CHANGE: [],
    ENDPOINT_PROCESS_ANOMALY: [],
    NETWORK_PROBE: [],
    SENSITIVE_RESOURCE_ACCESS: [],
    APPSEC_ANOMALY: [],
    LOG_TAMPER: [],
  };

  attachedTimelineEventIds.forEach((item, index) => {
    const stage = mapItemToStage(item);
    if (stage) {
      stageIndicesInInput[stage].push(index);
    }
  });

  const missingStages: string[] = [];
  CORE_STAGES.forEach((stage) => {
    if (stageIndicesInInput[stage].length === 0) {
      missingStages.push(stage);
    }
  });

  const outOfOrderStages: string[] = [];
  if (missingStages.length === 0) {
    let lastIndex = -1;
    CORE_STAGES.forEach((stage) => {
      const firstIdx = stageIndicesInInput[stage][0];
      if (firstIdx < lastIndex) {
        outOfOrderStages.push(stage);
      } else {
        lastIndex = firstIdx;
      }
    });
  }

  const passed = missingStages.length === 0 && outOfOrderStages.length === 0;

  let reasonEn = 'PASS: Timeline contains all 8 core attack evidence stages in exact chronological order.';
  let reasonAr = 'نجاح: يحتوي الخط الزمني على كافة المراحل الثمانية للأدلة الجوهرية بتسلسل زمني دقيق.';

  if (missingStages.length > 0) {
    reasonEn = `FAIL: Timeline missing critical core evidence stage(s): ${missingStages.join(', ')}.`;
    reasonAr = `فشل: الخط الزمني يفتقر لمراحل أساسية: ${missingStages.join(', ')}.`;
  } else if (outOfOrderStages.length > 0) {
    reasonEn = `FAIL: Timeline sequence incorrectly ordered. Stage(s) out of order: ${outOfOrderStages.join(', ')}. Expected order: AUTH_FAILURE < AUTH_SUCCESS < PRIVILEGED_GROUP_CHANGE < ENDPOINT_PROCESS_ANOMALY < NETWORK_PROBE < SENSITIVE_RESOURCE_ACCESS < APPSEC_ANOMALY < LOG_TAMPER.`;
    reasonAr = `فشل: التسلسل الزمني غير صحيح للمراحل: ${outOfOrderStages.join(', ')}.`;
  }

  return {
    passed,
    missingStages,
    outOfOrderStages,
    reasonEn,
    reasonAr,
  };
}

export interface SocChallengeState {
  // 1. Detection Rule Configuration
  enabledRuleIds: string[];
  tunedRuleThresholds: Record<string, number>;

  // 2. Alert Triage Decisions
  triagedAlertIds: string[];
  escalatedAlertIds: string[];
  dismissedAlertIds: string[];

  // 3. Correlation & Incident Investigation
  openedIncidents: SecurityIncident[];
  selectedPrimaryUser: string;
  selectedPrimaryHost: string;
  selectedTargetResource: string;

  // 4. Incident Timeline
  attachedTimelineEventIds: string[];

  // 5. Containment Actions Selected
  selectedContainmentActions: ContainmentActionType[];

  // 6. Anti-Cheat / Business Continuity Flags
  markAllEventsAsMalicious: boolean;
  blockAllInboundTraffic: boolean;
  shutdownEntireCoreServer: boolean;
  disableAllFinanceUsers: boolean;
  suppressAllAlerts: boolean;
}

export interface SocCheckResult {
  id: string;
  category: string;
  nameEn: string;
  nameAr: string;
  passed: boolean;
  score: number;
  weight: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  feedbackEn: string;
  feedbackAr: string;
}

export interface SocMasterValidationResult {
  success: boolean;
  score: number;
  passedChecks: string[];
  failedChecks: string[];
  checkDetails: SocCheckResult[];
  businessContinuityPassed: boolean;
  summaryEn: string;
  summaryAr: string;
}

/**
 * Returns initial flawed/uninvestigated state for Nexora SOC Master Challenge
 */
export function getInitialSocChallengeState(): SocChallengeState {
  return {
    enabledRuleIds: ['rule-auth-bruteforce'], // Only 1 rule enabled initially
    tunedRuleThresholds: {
      'rule-auth-bruteforce': 10, // Too loose (needs tuning to 5)
    },
    triagedAlertIds: [],
    escalatedAlertIds: [],
    dismissedAlertIds: [],
    openedIncidents: [],
    selectedPrimaryUser: '',
    selectedPrimaryHost: '',
    selectedTargetResource: '',
    attachedTimelineEventIds: [],
    selectedContainmentActions: [],
    markAllEventsAsMalicious: false,
    blockAllInboundTraffic: false,
    shutdownEntireCoreServer: false,
    disableAllFinanceUsers: false,
    suppressAllAlerts: false,
  };
}

/**
 * Validates the learner's investigation, correlation, incident creation, and containment decisions
 */
export function validateSocInvestigationState(state: SocChallengeState): SocMasterValidationResult {
  // Anti-Cheat Checks
  if (state.suppressAllAlerts) {
    return {
      success: false,
      score: 0,
      passedChecks: [],
      failedChecks: ['chk-alert-suppression'],
      checkDetails: [{
        id: 'chk-alert-suppression',
        category: 'Detection Engineering',
        nameEn: 'Alert Visibility & Suppression Anti-Cheat',
        nameAr: 'حظر حجب التنبيهات والرؤية الأمنية',
        passed: false,
        score: 0,
        weight: 100,
        severity: 'CRITICAL',
        feedbackEn: 'FAIL: Suppressing all alerts destroys SOC visibility and is not valid tuning.',
        feedbackAr: 'فشل: إخفاء وتعطيل التنبيهات بالكامل يعمي مركز العمليات الأمنية ويخالف أصول الضبط.',
      }],
      businessContinuityPassed: false,
      summaryEn: 'Anti-cheat trigger: Global alert suppression destroys SIEM visibility.',
      summaryAr: 'إحباط محاولة تحايل: حجب جميع التنبيهات يعطل عمل نظام SIEM.',
    };
  }

  if (state.shutdownEntireCoreServer) {
    return {
      success: false,
      score: 0,
      passedChecks: [],
      failedChecks: ['chk-business-continuity'],
      checkDetails: [{
        id: 'chk-business-continuity',
        category: 'Business Continuity',
        nameEn: 'Core Business Availability',
        nameAr: 'استمرارية الخدمات الحيوية',
        passed: false,
        score: 0,
        weight: 100,
        severity: 'CRITICAL',
        feedbackEn: 'FAIL: You shut down the entire production application server. Security containment must not destroy business operations.',
        feedbackAr: 'فشل: قمت بإيقاف تشغيل خادم الإنتاج بالكامل. يجب أن لا يؤدي الاحتواء الأمني إلى تدمير أعمال المؤسسة.',
      }],
      businessContinuityPassed: false,
      summaryEn: 'Anti-cheat trigger: Server power down broke company operations.',
      summaryAr: 'إحباط محاولة تحايل: إيقاف الخادم شل أعمال الشركة.',
    };
  }

  if (state.disableAllFinanceUsers) {
    return {
      success: false,
      score: 0,
      passedChecks: [],
      failedChecks: ['chk-business-continuity'],
      checkDetails: [{
        id: 'chk-business-continuity',
        category: 'Business Continuity',
        nameEn: 'User Workforce Continuity',
        nameAr: 'استمرارية عمل موظفي الإدارة',
        passed: false,
        score: 0,
        weight: 100,
        severity: 'CRITICAL',
        feedbackEn: 'FAIL: You locked out all Finance employees. Containment must be targeted to the compromised identity.',
        feedbackAr: 'فشل: قمت بقفل حسابات كافة موظفي المالية. يجب أن يكون الاحتواء موجهاً بدقة للحساب المخترق فقط.',
      }],
      businessContinuityPassed: false,
      summaryEn: 'Anti-cheat trigger: Disabling all department users is an unproportional response.',
      summaryAr: 'إحباط محاولة تحايل: قفل حسابات القسم بالكامل إجراء غير متناسب.',
    };
  }

  if (state.blockAllInboundTraffic) {
    return {
      success: false,
      score: 0,
      passedChecks: [],
      failedChecks: ['chk-business-continuity'],
      checkDetails: [{
        id: 'chk-business-continuity',
        category: 'Business Continuity',
        nameEn: 'Perimeter Connectivity Integrity',
        nameAr: 'سلامة الاتصال الخارجي المشروع',
        passed: false,
        score: 0,
        weight: 100,
        severity: 'CRITICAL',
        feedbackEn: 'FAIL: You severed all inbound network traffic, taking the company completely offline.',
        feedbackAr: 'فشل: قمت بحظر جميع الاتصالات الواردة مما عزل المؤسسة عن الإنترنت كلياً.',
      }],
      businessContinuityPassed: false,
      summaryEn: 'Anti-cheat trigger: Blanket perimeter block broke external customer access.',
      summaryAr: 'إحباط محاولة تحايل: الحظر الشامل قطع الاتصال عن كافة العملاء.',
    };
  }

  if (state.markAllEventsAsMalicious) {
    return {
      success: false,
      score: 0,
      passedChecks: [],
      failedChecks: ['chk-alert-fidelity'],
      checkDetails: [{
        id: 'chk-alert-fidelity',
        category: 'Detection Fidelity',
        nameEn: 'Evidence Discrimination',
        nameAr: 'التمييز الدقيق للأدلة الأمنية',
        passed: false,
        score: 0,
        weight: 100,
        severity: 'CRITICAL',
        feedbackEn: 'FAIL: Marking every single event as malicious is unanalytical and causes alert flooding.',
        feedbackAr: 'فشل: تصنيف كافة الأحداث كتهديدات دون تمييز يسبب شللاً لفرق المراقبة.',
      }],
      businessContinuityPassed: false,
      summaryEn: 'Anti-cheat trigger: Blanket malicious tagging violates detection engineering standards.',
      summaryAr: 'إحباط محاولة تحايل: تصنيف كل شيء كتهديد يخالف أصول هندسة الكشف.',
    };
  }

  const checks: SocCheckResult[] = [];

  // Check 1: Repeated Authentication Failures Detected
  const authBruteDetected =
    state.enabledRuleIds.includes('rule-auth-bruteforce') &&
    (state.tunedRuleThresholds['rule-auth-bruteforce'] || 5) <= 5;
  checks.push({
    id: 'chk-auth-brute-detected',
    category: 'Detection',
    nameEn: 'Brute-Force Authentication Rule Enabled & Tuned',
    nameAr: 'تفعيل وضبط قاعدة اكتشاف محاولات الدخول المتكررة',
    passed: authBruteDetected,
    score: authBruteDetected ? 8 : 0,
    weight: 8,
    severity: 'HIGH',
    feedbackEn: authBruteDetected
      ? 'PASS: Rule tuned to threshold 5 catches brute-force attack without noise.'
      : 'FAIL: Rule disabled or threshold set too loose to detect the 5 failed logins.',
    feedbackAr: authBruteDetected
      ? 'نجاح: تم ضبط القاعدة على 5 محاولات لاكتشاف الهجوم بدقة.'
      : 'فشل: القاعدة معطلة أو حد التنبيه مرتفع جداً.',
  });

  // Check 2: Success-After-Failure Sequence Identified
  const successAfterFailDetected = state.enabledRuleIds.includes('rule-auth-success-after-fail');
  checks.push({
    id: 'chk-success-after-fail-detected',
    category: 'Detection',
    nameEn: 'Success-After-Failure Sequence Rule Active',
    nameAr: 'تفعيل قاعدة تسلسل تسجيل الدخول الناجح بعد الإخفاقات',
    passed: successAfterFailDetected,
    score: successAfterFailDetected ? 8 : 0,
    weight: 8,
    severity: 'HIGH',
    feedbackEn: successAfterFailDetected
      ? 'PASS: Sequence rule alerted on credential compromise (failed logins followed by success).'
      : 'FAIL: Sequence rule missing; failed to flag successful access after multiple failures.',
    feedbackAr: successAfterFailDetected
      ? 'نجاح: قاعدة التسلسل رصدت اختراق كلمة المرور بنجاح.'
      : 'فشل: قاعدة التسلسل غير مفعلة لاكتشاف الدخول بعد الإخفاق.',
  });

  // Check 3: Privileged Group Membership Modification Identified
  const privGroupDetected = state.enabledRuleIds.includes('rule-priv-group-modification');
  checks.push({
    id: 'chk-priv-group-detected',
    category: 'Identity Security',
    nameEn: 'Domain Admins Group Escalation Alert Active',
    nameAr: 'تنبيه رفع الصلاحيات وإضافة الحساب لمسؤولي النطاق',
    passed: privGroupDetected,
    score: privGroupDetected ? 8 : 0,
    weight: 8,
    severity: 'CRITICAL',
    feedbackEn: privGroupDetected
      ? 'PASS: Group management rule caught unauthorized addition to Domain Admins.'
      : 'FAIL: Privileged group modification went unnoticed in Active Directory.',
    feedbackAr: privGroupDetected
      ? 'نجاح: تم اكتشاف إضافة الحساب لمجموعة مسؤولي النطاق فوراً.'
      : 'فشل: تعديل الصلاحيات في Active Directory مر دون رصد.',
  });

  // Check 4: Endpoint Process Anomaly Correlated
  const processAnomalyDetected = state.enabledRuleIds.includes('rule-suspicious-process');
  checks.push({
    id: 'chk-process-anomaly-detected',
    category: 'Endpoint Telemetry',
    nameEn: 'Anomalous Child Process Execution Correlated',
    nameAr: 'ربط واكتشاف الأوامر والعمليات الفرعية المشبوهة',
    passed: processAnomalyDetected,
    score: processAnomalyDetected ? 8 : 0,
    weight: 8,
    severity: 'HIGH',
    feedbackEn: processAnomalyDetected
      ? 'PASS: EDR telemetry correlated cmd.exe execution spawned on FIN-WS-01.'
      : 'FAIL: Endpoint process execution anomaly was omitted from detection.',
    feedbackAr: processAnomalyDetected
      ? 'نجاح: سجلات EDR ربطت تشغيل موجه الأوامر على جهاز FIN-WS-01.'
      : 'فشل: لم يتم رصد العملية المشبوهة على نظام التشغيل.',
  });

  // Check 5: Suspicious Network Probe Correlated
  const networkProbeDetected = state.enabledRuleIds.includes('rule-network-scan-denied');
  checks.push({
    id: 'chk-network-probe-detected',
    category: 'Network Telemetry',
    nameEn: 'Firewall Denied Packets & Port Probe Identified',
    nameAr: 'رصد حزم الاتصال المحظورة وفحص المنافذ',
    passed: networkProbeDetected,
    score: networkProbeDetected ? 7 : 0,
    weight: 7,
    severity: 'MEDIUM',
    feedbackEn: networkProbeDetected
      ? 'PASS: Repeated denied connections from FIN-WS-01 to DB server alerted.'
      : 'FAIL: Firewall denied connection anomalies were not correlated.',
    feedbackAr: networkProbeDetected
      ? 'نجاح: تم رصد الاتصالات المحظورة المتكررة نحو خادم البيانات.'
      : 'فشل: لم يتم ربط حزم الاتصال الممنوعة في جدار الحماية.',
  });

  // Check 6: Sensitive Financial Share Access Flagged
  const sensitiveAccessDetected = state.enabledRuleIds.includes('rule-sensitive-resource-access');
  checks.push({
    id: 'chk-sensitive-access-detected',
    category: 'Access Control',
    nameEn: 'Confidential Finance Share Access Alert Active',
    nameAr: 'تنبيه الوصول للمجلدات والتقارير المالية السرية',
    passed: sensitiveAccessDetected,
    score: sensitiveAccessDetected ? 8 : 0,
    weight: 8,
    severity: 'CRITICAL',
    feedbackEn: sensitiveAccessDetected
      ? 'PASS: Access to \\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx was tracked and alerted.'
      : 'FAIL: Attacker unauthorized read of confidential financial ledger was missed.',
    feedbackAr: sensitiveAccessDetected
      ? 'نجاح: تم رصد وتنبيه الوصول لملف التقارير المالية السرية.'
      : 'فشل: غياب التنبيه عند وصول المهاجم لسجلات المالية.',
  });

  // Check 7: AppSec BOLA / IDOR Violation Linked
  const appSecBolaDetected = state.enabledRuleIds.includes('rule-app-bola-anomaly');
  checks.push({
    id: 'chk-appsec-bola-detected',
    category: 'Application Telemetry',
    nameEn: 'AppSec Portal BOLA / IDOR Authorization Denial Linked',
    nameAr: 'ربط محاولات اختراق تفويض التطبيقات BOLA / IDOR',
    passed: appSecBolaDetected,
    score: appSecBolaDetected ? 8 : 0,
    weight: 8,
    severity: 'HIGH',
    feedbackEn: appSecBolaDetected
      ? 'PASS: Application layer 403 BOLA probe on customer portal correlated into incident.'
      : 'FAIL: AppSec web telemetry was disconnected from SOC incident analysis.',
    feedbackAr: appSecBolaDetected
      ? 'نجاح: تم ربط تنبيهات BOLA لتطبيق الويب ضمن سياق الحادثة.'
      : 'فشل: سجلات تطبيق الويب غير مرتبطة بالتحقيق الأمني.',
  });

  // Check 8: Correct Incident Entity Attribution
  const userSaraMatched = state.selectedPrimaryUser.toLowerCase() === 'sara';
  const hostMatched = state.selectedPrimaryHost.toUpperCase() === 'FIN-WS-01';
  const resourceMatched = state.selectedTargetResource.includes('Finance') || state.selectedTargetResource.includes('Share');
  const entityAttributionPassed = userSaraMatched && hostMatched && resourceMatched;
  checks.push({
    id: 'chk-incident-entity-attribution',
    category: 'Incident Investigation',
    nameEn: 'Accurate Incident Entity Attribution (User, Host, Resource)',
    nameAr: 'تحديد الكيانات المتأثرة بدقة (المستخدم، الجهاز، المورد المستهدف)',
    passed: entityAttributionPassed,
    score: entityAttributionPassed ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: entityAttributionPassed
      ? "PASS: Correctly attributed attack path: User 'sara', Host 'FIN-WS-01', Target 'FinanceShare'."
      : `FAIL: Incomplete entity attribution. Current: User=${state.selectedPrimaryUser || 'None'}, Host=${state.selectedPrimaryHost || 'None'}, Resource=${state.selectedTargetResource || 'None'}.`,
    feedbackAr: entityAttributionPassed
      ? "نجاح: تم تحديد مسار الهجوم بدقة: المستخدم 'sara' والجهاز 'FIN-WS-01' والمورد 'FinanceShare'."
      : 'فشل: تحديد الكيانات غير مكتمل أو غير دقيق.',
  });

  // Check 9: Incident Timeline Chronology & Evidence Verification
  const timelineValidation = validateTimelineOrderAndEvidence(state.attachedTimelineEventIds);
  checks.push({
    id: 'chk-incident-timeline-reconstruction',
    category: 'Incident Timeline',
    nameEn: 'Multi-Stage Chronological Incident Timeline Built',
    nameAr: 'بناء خط زمني متسلسل لجميع مراحل الحادثة الأمنية',
    passed: timelineValidation.passed,
    score: timelineValidation.passed ? 8 : 0,
    weight: 8,
    severity: 'HIGH',
    feedbackEn: timelineValidation.reasonEn,
    feedbackAr: timelineValidation.reasonAr,
  });

  // Check 10: Proportional Containment Actions Executed
  const hasRevoke = state.selectedContainmentActions.includes('REVOKE_ACTIVE_SESSIONS');
  const hasRevert = state.selectedContainmentActions.includes('REVERT_PRIVILEGED_GROUP');
  const hasIsolate = state.selectedContainmentActions.includes('ISOLATE_HOST_NETWORK');
  const proportionalContainmentPassed = hasRevoke && hasRevert && hasIsolate;
  checks.push({
    id: 'chk-proportional-containment',
    category: 'Containment Decision',
    nameEn: 'Proportional Defensive Containment Actions Executed',
    nameAr: 'تنفيذ إجراءات العزل والاحتواء الدفاعية المتناسبة',
    passed: proportionalContainmentPassed,
    score: proportionalContainmentPassed ? 10 : 0,
    weight: 10,
    severity: 'CRITICAL',
    feedbackEn: proportionalContainmentPassed
      ? 'PASS: Active sessions revoked, Domain Admins membership reverted, and host isolated cleanly.'
      : 'FAIL: Missing essential containment steps (Revoke sessions, Revert group, or Isolate host).',
    feedbackAr: proportionalContainmentPassed
      ? 'نجاح: تم إلغاء الجلسات المشبوهة، واسترجاع الصلاحيات، وعزل الجهاز بنجاح.'
      : 'فشل: إجراءات الاحتواء الأساسية غير مكتملة.',
  });

  // Check 11: Security Audit Logging Hardened
  const auditHardened =
    state.selectedContainmentActions.includes('ENABLE_DEBUG_AUDIT_LOGGING') ||
    state.enabledRuleIds.includes('rule-security-log-tamper');
  checks.push({
    id: 'chk-audit-visibility-hardened',
    category: 'Detection Engineering',
    nameEn: 'Forensic Audit Telemetry & Log Tamper Shield Active',
    nameAr: 'تعزيز الرؤية الجنائية وحماية سجلات الأحداث من التلاعب',
    passed: auditHardened,
    score: auditHardened ? 7 : 0,
    weight: 7,
    severity: 'MEDIUM',
    feedbackEn: auditHardened
      ? 'PASS: Forensic audit logging reinforced to monitor post-containment recovery.'
      : 'FAIL: Audit logging was not hardened against tampering or future blind spots.',
    feedbackAr: auditHardened
      ? 'نجاح: تعزيز سجلات التدقيق الجنائي وتأمينها لمراقبة مرحلة التعافي.'
      : 'فشل: لم يتم تفعيل الرقابة المشددة على سجلات الأمان.',
  });

  // Check 12: Detection Rule Tuning & False Positive Suppression
  const authBruteThreshold = state.tunedRuleThresholds['rule-auth-bruteforce'] ?? 10;
  
  // Synthetic ground truth evaluation
  const syntheticGroundTruth: EventClassification[] = [
    { eventId: 'attack-bf-burst', isMaliciousGroundTruth: true },
    { eventId: 'benign-user-mistake-1', isMaliciousGroundTruth: false },
    { eventId: 'benign-user-mistake-2', isMaliciousGroundTruth: false },
  ];

  const alertedIds: string[] = [];
  if (state.enabledRuleIds.includes('rule-auth-bruteforce')) {
    if (authBruteThreshold <= 3) {
      alertedIds.push('attack-bf-burst', 'benign-user-mistake-2'); // FP = 1
    } else if (authBruteThreshold <= 5) {
      alertedIds.push('attack-bf-burst'); // TP = 1, FP = 0, FN = 0
    }
  }

  const detectionMetrics = calculateDetectionMetrics(syntheticGroundTruth, alertedIds);
  const detectionTuningPassed =
    detectionMetrics.precision === 100 &&
    detectionMetrics.recall === 100 &&
    detectionMetrics.falsePositives === 0 &&
    detectionMetrics.falseNegatives === 0 &&
    state.enabledRuleIds.length >= 6;

  checks.push({
    id: 'chk-detection-engineering-tuning',
    category: 'Detection Engineering',
    nameEn: 'Detection Engineering Tuning (Balanced Precision & Recall)',
    nameAr: 'هندسة وضبط قواعد الكشف (توازن الدقة والاستدعاء)',
    passed: detectionTuningPassed,
    score: detectionTuningPassed ? 7 : 0,
    weight: 7,
    severity: 'HIGH',
    feedbackEn: detectionTuningPassed
      ? 'PASS: Multi-world detection rule set comprehensively tuned with optimal signal-to-noise ratio (Precision: 100%, Recall: 100%).'
      : `FAIL: Detection catalog tuning error: ${detectionMetrics.summaryEn}`,
    feedbackAr: detectionTuningPassed
      ? 'نجاح: منظومة قواعد الكشف متكاملة ومضبوطة بأعلى درجات الدقة دون ضوضاء (100% دقة واستدعاء).'
      : `فشل: خطأ في ضبط قواعد الكشف: ${detectionMetrics.summaryAr}`,
  });

  // Check 13: Core Business Continuity Requirement
  const continuityPassed =
    !state.shutdownEntireCoreServer &&
    !state.disableAllFinanceUsers &&
    !state.blockAllInboundTraffic &&
    !state.markAllEventsAsMalicious &&
    !state.suppressAllAlerts;
  checks.push({
    id: 'chk-business-continuity-preserved',
    category: 'Business Continuity',
    nameEn: 'Enterprise Operations & Business Continuity Preserved',
    nameAr: 'الحفاظ على استمرارية العمليات وخدمات المؤسسة المشروعة',
    passed: continuityPassed,
    score: continuityPassed ? 3 : 0,
    weight: 3,
    severity: 'HIGH',
    feedbackEn: 'PASS: Normal business operations, customer portal, and legitimate finance workflows remain uninterrupted.',
    feedbackAr: 'نجاح: بقاء الخدمات والعمليات المشروعة للعملاء والموظفين تعمل دون انقطاع.',
  });

  const passedChecks = checks.filter((c) => c.passed).map((c) => c.id);
  const failedChecks = checks.filter((c) => !c.passed).map((c) => c.id);
  const totalScore = checks.reduce((acc, c) => acc + c.score, 0);
  const isSuccess = failedChecks.length === 0 && totalScore === 100;

  return {
    success: isSuccess,
    score: totalScore,
    passedChecks,
    failedChecks,
    checkDetails: checks,
    businessContinuityPassed: continuityPassed,
    summaryEn: isSuccess
      ? 'NEXORA SOC HARDENED: All 12 security controls + 1 business continuity requirement verified. Incident triaged, investigated, and contained with 100% precision!'
      : `SOC INVESTIGATION INCOMPLETE: Score ${totalScore}/100. ${failedChecks.length} control(s) require remediation.`,
    summaryAr: isSuccess
      ? 'تم تأمين مركز العمليات السيبراني لـ Nexora بنجاح: تم اجتياز جميع الضوابط الأمنية الـ 12 + متطلب استمرارية الأعمال بنسبة 100%!'
      : `التحقيق غير مكتمل: النتيجة ${totalScore}/100. هناك ${failedChecks.length} متطلب بحاجة لإكمال.`,
  };
}
