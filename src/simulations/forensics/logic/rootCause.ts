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

export interface RootCauseEvaluation {
  valid: boolean;
  supportedByEvidence: boolean;
  missingEvidenceCount: number;
  reasonsEn: string[];
  reasonsAr: string[];
}

/**
 * Validates whether a root cause finding is backed by collected evidence
 */
export function evaluateRootCauseFinding(
  finding: RootCauseFinding,
  collectedEvidenceIds: string[]
): RootCauseEvaluation {
  const missing = finding.evidenceIds.filter((id) => !collectedEvidenceIds.includes(id));
  const supportedByEvidence = missing.length === 0 && finding.evidenceIds.length >= 3;

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
    reasonsEn.push('Initial access vector must be explicitly identified.');
    reasonsAr.push('يجب تحديد متجه الدخول الأولي بشكل صريح.');
  }

  const valid = supportedByEvidence && finding.initialAccessVector.length > 0;

  return {
    valid,
    supportedByEvidence,
    missingEvidenceCount: missing.length,
    reasonsEn,
    reasonsAr,
  };
}
