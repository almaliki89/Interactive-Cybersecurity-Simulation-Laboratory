/**
 * OMEGA V12 — Root Cause Analysis & Evidence Attribution Engine
 * Validates that root cause conclusions are strictly grounded in collected evidence.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface RootCauseFinding {
  initialAccessVector: string;
  affectedIdentity?: string;
  affectedHost?: string;
  privilegeChange?: string;
  impactedResources: string[];
  containmentGap?: string;
  detectionGap?: string;

  evidenceIds: string[];
}

export interface RootCauseEvidenceRequirements {
  initialAccess: string[];
  privilegeChange: string[];
  endpointActivity: string[];
  impactedResource: string[];
}

export const DEFAULT_NEXORA_ROOT_CAUSE_REQUIREMENTS: RootCauseEvidenceRequirements = {
  initialAccess: ['EVD-LOG-WIN-SEC', 'EVD-NET-PCAP-01'],
  privilegeChange: ['EVD-LOG-WIN-SEC', 'EVD-DISK-FIN-WS01'],
  endpointActivity: ['EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01'],
  impactedResource: ['EVD-DISK-FIN-WS01'],
};

export interface RootCauseEvaluation {
  valid: boolean;
  supportedByEvidence: boolean;
  missingEvidenceCount: number;
  unsupportedClaims: string[];
  reasonsEn: string[];
  reasonsAr: string[];
}

/**
 * Validates whether a root cause finding is backed by collected evidence and meets semantic requirements
 */
export function evaluateRootCauseFinding(
  finding: RootCauseFinding,
  collectedEvidenceIds: string[],
  requirements: RootCauseEvidenceRequirements = DEFAULT_NEXORA_ROOT_CAUSE_REQUIREMENTS
): RootCauseEvaluation {
  const missing = finding.evidenceIds.filter((id) => !collectedEvidenceIds.includes(id));
  const unsupportedClaims: string[] = [];

  const reasonsEn: string[] = [];
  const reasonsAr: string[] = [];

  if (finding.evidenceIds.length < 3) {
    reasonsEn.push('Root cause hypothesis lacks sufficient supporting evidence items (at least 3 required).');
    reasonsAr.push('فرضية السبب الجذر تفتقر إلى الحد الأدنى للأدلة المرفقة (يلزم 3 أدلة على الأقل).');
  }

  if (missing.length > 0) {
    reasonsEn.push(`Missing collected evidence for root cause claim: ${missing.join(', ')}.`);
    reasonsAr.push(`أدلة مفقودة في ملف التحقيق لدعم الادعاء: ${missing.join(', ')}.`);
  }

  if (!finding.initialAccessVector || finding.initialAccessVector.trim() === '') {
    unsupportedClaims.push('initialAccessVector');
    reasonsEn.push('Initial access vector must be explicitly identified.');
    reasonsAr.push('يجب تحديد متجه الدخول الأولي بشكل صريح.');
  }

  // Check initial access evidence backing
  const hasInitialAccessEv = finding.evidenceIds.some((id) => requirements.initialAccess.includes(id));
  if (!hasInitialAccessEv) {
    unsupportedClaims.push('initialAccess');
    reasonsEn.push('Initial access claim unsupported by authentication or network capture evidence.');
    reasonsAr.push('ادعاء الوصول الأولي غير مدعوم ببدائل أدلة المصادقة أو حزم الشبكة.');
  }

  // Check privilege escalation evidence backing
  const hasPrivChangeEv = finding.evidenceIds.some((id) => requirements.privilegeChange.includes(id));
  if (!hasPrivChangeEv) {
    unsupportedClaims.push('privilegeChange');
    reasonsEn.push('Privilege escalation claim unsupported by security log or registry artifacts.');
    reasonsAr.push('ادعاء رفع الصلاحيات غير مدعوم بسجلات الأمان أو سجل النظام.');
  }

  // Check endpoint activity evidence backing
  const hasEndpointEv = finding.evidenceIds.some((id) => requirements.endpointActivity.includes(id));
  if (!hasEndpointEv) {
    unsupportedClaims.push('endpointActivity');
    reasonsEn.push('Endpoint anomaly claim unsupported by RAM memory or disk image evidence.');
    reasonsAr.push('ادعاء النشاط في الجهاز غير مدعوم بصورة الذاكرة أو القرص.');
  }

  // Check Finance resource impact evidence backing
  const hasResourceEv = finding.evidenceIds.some((id) => requirements.impactedResource.includes(id));
  if (!hasResourceEv) {
    unsupportedClaims.push('impactedResource');
    reasonsEn.push('Finance resource impact claim unsupported by disk filesystem artifacts.');
    reasonsAr.push('ادعاء تأثير الموارد المالية غير مدعوم بأدلة ملفات القرص.');
  }

  // Semantic value validation for Nexora case:
  // 1. affectedIdentity must be 'sara'
  if (finding.affectedIdentity !== undefined && finding.affectedIdentity.trim() !== '') {
    if (finding.affectedIdentity.toLowerCase().trim() !== 'sara') {
      unsupportedClaims.push('affectedIdentity');
      reasonsEn.push(`Affected identity claim '${finding.affectedIdentity}' is invalid; expected 'sara'.`);
      reasonsAr.push(`ادعاء الهوية المتأثرة '${finding.affectedIdentity}' غير صحيح؛ المتوقع 'sara'.`);
    }
  }

  // 2. affectedHost must be 'FIN-WS-01'
  if (finding.affectedHost !== undefined && finding.affectedHost.trim() !== '') {
    if (finding.affectedHost.toUpperCase().trim() !== 'FIN-WS-01') {
      unsupportedClaims.push('affectedHost');
      reasonsEn.push(`Affected host claim '${finding.affectedHost}' is invalid; expected 'FIN-WS-01'.`);
      reasonsAr.push(`ادعاء الجهاز المتأثر '${finding.affectedHost}' غير صحيح؛ المتوقع 'FIN-WS-01'.`);
    }
  }

  // 3. privilegeChange must include 'Domain Admins'
  if (finding.privilegeChange !== undefined && finding.privilegeChange.trim() !== '') {
    if (!finding.privilegeChange.toLowerCase().includes('domain admin')) {
      unsupportedClaims.push('privilegeChange');
      reasonsEn.push(`Privilege escalation claim '${finding.privilegeChange}' is invalid; expected 'Domain Admins'.`);
      reasonsAr.push(`ادعاء تصعيد الصلاحيات '${finding.privilegeChange}' غير صحيح؛ المتوقع 'Domain Admins'.`);
    }
  }

  // 4. impactedResources must include 'FinanceShare' or 'Q3_Report'
  const hasExpectedResource =
    finding.impactedResources &&
    finding.impactedResources.length > 0 &&
    finding.impactedResources.some(
      (r) =>
        r.toLowerCase().includes('financeshare') ||
        r.toLowerCase().includes('q3_report')
    );
  if (!hasExpectedResource) {
    unsupportedClaims.push('impactedResources');
    reasonsEn.push("Impacted resource claim is invalid; must include 'FinanceShare' or 'Q3_Report' file repository.");
    reasonsAr.push("ادعاء المورد المتأثر غير صحيح؛ يجب أن يتضمن مستودع 'FinanceShare' أو 'Q3_Report'.");
  }

  const supportedByEvidence = missing.length === 0 && unsupportedClaims.length === 0 && finding.evidenceIds.length >= 3;
  const valid = supportedByEvidence && finding.initialAccessVector.length > 0;

  return {
    valid,
    supportedByEvidence,
    missingEvidenceCount: missing.length,
    unsupportedClaims,
    reasonsEn,
    reasonsAr,
  };
}
