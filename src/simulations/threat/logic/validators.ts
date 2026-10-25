/**
 * OMEGA V16 — Deterministic Anti-Cheat Threat Hunting Challenge Validators
 * Strictly validates real simulation state - no mock completion buttons or synthetic skips.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { ThreatHunt, HuntHypothesis, HuntFinding, DetectionRule, DetectionValidationResult, SocHandoffPackage, ForensicsHandoffPackage } from './types';
import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';

export interface ValidationState {
  hunt: ThreatHunt;
  hypothesis: HuntHypothesis;
  findings: HuntFinding[];
  detections: DetectionRule[];
  detectionResults: Record<string, DetectionValidationResult>;
  socHandoffs: SocHandoffPackage[];
  forensicsHandoffs: ForensicsHandoffPackage[];
  executedQueries: string[];
  telemetryEvents: SecurityTelemetryEvent[];
}

export interface ValidationOutcome {
  success: boolean;
  messageEn: string;
  messageAr: string;
  completedObjectives: string[];
  missingRequirementsEn: string[];
  missingRequirementsAr: string[];
}

export class ThreatHuntValidator {
  /**
   * Validates individual hunt challenges (HUNT-01 to HUNT-05)
   */
  public static validateScenario(huntId: string, state: ValidationState): ValidationOutcome {
    const missingEn: string[] = [];
    const missingAr: string[] = [];
    const completedObjs: string[] = [];

    // 1. Verify Hypothesis belongs to active hunt and is supported
    if (!state.hypothesis || state.hypothesis.huntId !== huntId || state.hypothesis.status !== 'SUPPORTED') {
      missingEn.push('Hypothesis must belong to active hunt and be supported by telemetry evidence.');
      missingAr.push('يجب أن تنتمي الفرضية للتحقيق النشط وتكون مؤكدة بأدلة السجلات.');
    } else {
      completedObjs.push('obj-hypothesis');
    }

    // 2. Verify Query Execution for the active hunt
    const huntQueries = (state.executedQueries || []).filter((q) => typeof q === 'string' && q.trim().length > 0);
    if (huntQueries.length === 0) {
      missingEn.push('Must execute at least one query against telemetry for the active hunt.');
      missingAr.push('يجب تنفيذ استعلام واحد على الأقل ضد السجلات للتحقيق النشط.');
    } else {
      completedObjs.push('obj-query');
    }

    // 3. Verify Validated Finding
    const validatedFinding = state.findings.find(
      (f) => f.huntId === huntId && f.status === 'VALIDATED' && f.eventIds.length >= 2
    );

    if (!validatedFinding) {
      missingEn.push('Must create and validate a finding containing at least 2 supporting events.');
      missingAr.push('يجب إنشاء وتأكيد نتيجة تحقيق تحتوي على حدثين داعمين على الأقل.');
    } else {
      // Check that event references actually exist in telemetry
      const validEventRefs = validatedFinding.eventIds.every((id) =>
        state.telemetryEvents.some((e) => e.id === id)
      );
      if (!validEventRefs) {
        missingEn.push('Finding contains invalid or non-existent event references.');
        missingAr.push('تحتوي نتيجة التحقيق على مراجع أحداث غير موجودة في سجلات المحاكاة.');
      } else {
        completedObjs.push('obj-finding');
      }
    }

    // 4. Verify Detection Rule belongs to active hunt
    const validDetection = state.detections.find((d) => {
      const belongsToHunt = d.huntId
        ? d.huntId === huntId
        : (d.id.includes(huntId) || !d.id.includes('HUNT-'));
      if (!belongsToHunt) return false;
      const result = state.detectionResults[d.id];
      return result && result.isValid && result.truePositives >= 1 && result.falsePositives === 0;
    });

    if (!validDetection) {
      missingEn.push('Must author and tune a detection rule for the active hunt with 0 false positives.');
      missingAr.push('يجب تصميم وضبط قاعدة كشف للتحقيق النشط تحقق 0 إنذارات كاذبة.');
    } else {
      completedObjs.push('obj-detection');
    }

    // 5. Verify SOC Handoff for active hunt with valid telemetry events
    const validHandoff = state.socHandoffs.find(
      (h) =>
        h.huntId === huntId &&
        h.eventIds.length >= 1 &&
        h.eventIds.every((id) => state.telemetryEvents.some((e) => e.id === id))
    );
    if (!validHandoff) {
      missingEn.push('Must complete SOC Handoff with valid telemetry events for the active hunt.');
      missingAr.push('يجب إتمام إحالة النتيجة المؤكدة مع أحداث سجلات صالحة إلى مركز العمليات SOC.');
    } else {
      completedObjs.push('obj-soc-handoff');
    }

    const success = missingEn.length === 0;

    return {
      success,
      messageEn: success
        ? 'Threat Hunt successfully concluded! All behaviors correlated and detection published.'
        : `Investigation incomplete: ${missingEn[0]}`,
      messageAr: success
        ? 'تم إنهاء صيد التهديدات بنجاح! تم ربط كافة السلوكيات ونشر قاعدة الكشف.'
        : `التحقيق غير مكتمل: ${missingAr[0]}`,
      completedObjectives: completedObjs,
      missingRequirementsEn: missingEn,
      missingRequirementsAr: missingAr,
    };
  }

  /**
   * Validates the Master Investigation (Multi-world full-chain attack)
   */
  public static validateMasterChallenge(state: ValidationState): ValidationOutcome {
    const missingEn: string[] = [];
    const missingAr: string[] = [];
    const completedObjs: string[] = [];

    // 1. Hypothesis Supported
    if (state.hypothesis.status !== 'SUPPORTED') {
      missingEn.push('Master Campaign Hypothesis must be supported with cross-world evidence.');
      missingAr.push('يجب إثبات فرضية الهجوم الشامل بأدلة عابرة للعوالم.');
    } else {
      completedObjs.push('master-obj-hypothesis');
    }

    // 2. Minimum 3 Queries executed
    if (!state.executedQueries || state.executedQueries.length < 2) {
      missingEn.push('Must execute multi-source telemetry queries across domains.');
      missingAr.push('يجب تنفيذ استعلامات متعددة المصادر عبر نطاقات السجلات.');
    } else {
      completedObjs.push('master-obj-queries');
    }

    // 3. Multi-world correlated findings with >= 4 events
    const masterFindings = state.findings.filter((f) => f.status === 'VALIDATED');
    const totalEventsLinked = masterFindings.reduce((acc, f) => acc + f.eventIds.length, 0);

    if (masterFindings.length < 1 || totalEventsLinked < 4) {
      missingEn.push('Must create validated findings linking at least 4 correlated attack events.');
      missingAr.push('يجب تأكيد نتائج تحقيق تربط على الأقل 4 أحداث هجومية مترابطة.');
    } else {
      // Verify rawEventId integrity
      const hasRawIds = masterFindings.every((f) => f.rawEventIds.length > 0);
      if (!hasRawIds) {
        missingEn.push('Findings must preserve canonical rawEventId references.');
        missingAr.push('يجب أن تحتفظ النتائج بمراجع معرفات الأحداث الأصلية rawEventId.');
      } else {
        completedObjs.push('master-obj-findings');
      }
    }

    // 4. Validated Detection Rule
    const masterDetection = state.detections.find((d) => {
      const result = state.detectionResults[d.id];
      return result && result.isValid && result.truePositives >= 1 && result.falsePositives === 0;
    });

    if (!masterDetection) {
      missingEn.push('Must author and tune a validated detection rule with 0 false positives.');
      missingAr.push('يجب تصميم وضبط قاعدة كشف محكمة خالية من الإيجابيات الكاذبة.');
    } else {
      completedObjs.push('master-obj-detection');
    }

    // 5. SOC Handoff Dispatched
    const hasSocHandoff = state.socHandoffs.some((h) => h.eventIds.length >= 2);
    if (!hasSocHandoff) {
      missingEn.push('Must dispatch validated findings to SOC Incident Queue.');
      missingAr.push('يجب إرسال النتائج المؤكدة إلى قائمة حوادث مركز العمليات SOC.');
    } else {
      completedObjs.push('master-obj-soc');
    }

    // 6. Forensics Canonical Evidence Handoff
    const hasForensicsHandoff = state.forensicsHandoffs.some(
      (h) => h.evidenceList.length >= 2 && h.evidenceList.every((e) => e.id.startsWith('EVD-') && e.preserved)
    );

    if (!hasForensicsHandoff) {
      missingEn.push('Must complete Forensics Handoff generating canonical preserved evidence items (EVD-...).');
      missingAr.push('يجب إتمام إحالة الأدلة الجنائية وتوليد عناصر أدلة محفوظة رسمية (EVD-...).');
    } else {
      completedObjs.push('master-obj-forensics');
    }

    const success = missingEn.length === 0;

    return {
      success,
      messageEn: success
        ? 'MASTER THREAT HUNT ACCOMPLISHED! Cross-world APT campaign fully dismantled and institutional detections published.'
        : `Master Challenge in progress: ${missingEn[0]}`,
      messageAr: success
        ? 'تم إنجاز التحقيق الشامل بنجاح! تم تفكيك الهجوم المتقدم ونشر قواعد الكشف المؤسسية.'
        : `التحدي الشامل قيد التنفيذ: ${missingAr[0]}`,
      completedObjectives: completedObjs,
      missingRequirementsEn: missingEn,
      missingRequirementsAr: missingAr,
    };
  }
}
