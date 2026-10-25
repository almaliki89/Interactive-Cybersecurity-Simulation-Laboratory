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

    // 3. Verify Validated Finding using full candidate eligibility evaluation
    const validatedFinding = state.findings.find((f) => {
      if (f.huntId !== huntId) return false;
      if (f.status !== 'VALIDATED') return false;

      // Must contain at least two distinct non-blank event IDs
      const distinctEventIds = Array.from(
        new Set((f.eventIds || []).filter((id) => typeof id === 'string' && id.trim().length > 0))
      );
      if (distinctEventIds.length < 2) return false;

      // Event IDs must exist in active hunt telemetry
      const allEventsExist = distinctEventIds.every((id) =>
        state.telemetryEvents.some((e) => e.id === id)
      );
      if (!allEventsExist) return false;

      // Raw event IDs preserved
      if (!f.rawEventIds || f.rawEventIds.length === 0) return false;

      return true;
    });

    if (!validatedFinding) {
      missingEn.push('Must create and validate a finding containing at least 2 supporting events.');
      missingAr.push('يجب إنشاء وتأكيد نتيجة تحقيق تحتوي على حدثين داعمين على الأقل.');
    } else {
      completedObjs.push('obj-finding');
    }

    // 4. Verify Detection Rule belongs to active hunt with trustworthy ownership
    const validDetection = state.detections.find((d) => {
      // Explicit huntId must match target huntId
      if (d.huntId) {
        if (d.huntId !== huntId) return false;
      } else {
        // Legacy ownership inference ONLY if huntId is absent and ID follows canonical format
        const isCanonicalFormat =
          d.id.startsWith(`DET-${huntId}-`) || d.id.includes(`-${huntId}-`);
        if (!isCanonicalFormat) return false;
      }

      // Result keyed to rule ID and result.ruleId === d.id
      const result = state.detectionResults[d.id];
      if (!result || result.ruleId !== d.id) return false;

      // isValid === true, truePositives >= 1, falsePositives === 0
      if (!result.isValid || result.truePositives < 1 || result.falsePositives !== 0) return false;

      // Validate event references in result against active telemetry
      const matchedEvents = result.matchedEventIds || [];
      if (matchedEvents.length === 0) return false;
      const validEventRefs = matchedEvents.every((id) =>
        state.telemetryEvents.some((e) => e.id === id)
      );
      if (!validEventRefs) return false;

      return true;
    });

    if (!validDetection) {
      missingEn.push('Must author and tune a detection rule for the active hunt with 0 false positives.');
      missingAr.push('يجب تصميم وضبط قاعدة كشف للتحقيق النشط تحقق 0 إنذارات كاذبة.');
    } else {
      completedObjs.push('obj-detection');
    }

    // 5. Verify SOC Handoff for active hunt with valid telemetry events and qualifying dispatch state
    const validHandoff = state.socHandoffs.find((h) => {
      if (h.huntId !== huntId) return false;
      if (h.status !== 'DISPATCHED' && h.status !== 'INGESTED') return false;

      // Telemetry events check
      const validEventIds = (h.eventIds || []).filter(
        (id) => typeof id === 'string' && id.trim().length > 0
      );
      if (validEventIds.length < 1) return false;
      const eventsExist = validEventIds.every((id) =>
        state.telemetryEvents.some((e) => e.id === id)
      );
      if (!eventsExist) return false;

      // Reference a real finding belonging to the SAME hunt
      if (!h.findingId) return false;
      const linkedFinding = state.findings.find(
        (f) => f.id === h.findingId && f.huntId === huntId
      );
      if (!linkedFinding) return false;

      // Evidence consistency: handoff eventIds must be supported by linked finding's eventIds
      const findingEventSet = new Set(linkedFinding.eventIds);
      const isConsistentWithFinding = validEventIds.some((id) => findingEventSet.has(id));
      if (!isConsistentWithFinding) return false;

      // If ruleId is present, must reference eligible detection rule for same hunt
      if (h.ruleId) {
        const linkedRule = state.detections.find((d) => d.id === h.ruleId);
        if (!linkedRule) return false;

        if (linkedRule.huntId && linkedRule.huntId !== huntId) return false;
        if (!linkedRule.huntId) {
          const isCanonical =
            linkedRule.id.startsWith(`DET-${huntId}-`) || linkedRule.id.includes(`-${huntId}-`);
          if (!isCanonical) return false;
        }

        const ruleResult = state.detectionResults[linkedRule.id];
        if (
          !ruleResult ||
          ruleResult.ruleId !== linkedRule.id ||
          !ruleResult.isValid ||
          ruleResult.truePositives < 1 ||
          ruleResult.falsePositives !== 0
        ) {
          return false;
        }
      }

      return true;
    });

    if (!validHandoff) {
      missingEn.push('Must complete and dispatch SOC Handoff with valid telemetry events for the active hunt.');
      missingAr.push('يجب إتمام وإرسال إحالة النتيجة المؤكدة مع أحداث سجلات صالحة إلى مركز العمليات SOC.');
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
  /**
   * Validates the Master Investigation (Multi-world full-chain attack)
   */
  public static validateMasterChallenge(state: ValidationState): ValidationOutcome {
    const missingEn: string[] = [];
    const missingAr: string[] = [];
    const completedObjs: string[] = [];

    // 1. Hypothesis Supported for Master Investigation
    if (!state.hypothesis || state.hypothesis.huntId !== 'HUNT-MASTER' || state.hypothesis.status !== 'SUPPORTED') {
      missingEn.push('Master Campaign Hypothesis must belong to HUNT-MASTER and be supported with cross-world evidence.');
      missingAr.push('يجب أن تنتمي الفرضية للتحقيق الشامل HUNT-MASTER وتكون مؤكدة بأدلة عابرة للعوالم.');
    } else {
      completedObjs.push('master-obj-hypothesis');
    }

    // 2. Minimum 2 Queries executed
    if (!state.executedQueries || state.executedQueries.length < 2) {
      missingEn.push('Must execute multi-source telemetry queries across domains.');
      missingAr.push('يجب تنفيذ استعلامات متعددة المصادر عبر نطاقات السجلات.');
    } else {
      completedObjs.push('master-obj-queries');
    }

    // 3. Multi-world correlated findings with >= 4 distinct events belonging strictly to Master Campaign
    const masterFindings = state.findings.filter((f) => {
      if (f.status !== 'VALIDATED') return false;
      // Strict ownership: If huntId is provided, it MUST be 'HUNT-MASTER'.
      if (f.huntId) {
        if (f.huntId !== 'HUNT-MASTER') return false;
      } else {
        // Legacy fallback only if huntId is absent and ID follows exact canonical format
        if (!f.id.startsWith('FIND-HUNT-MASTER-')) return false;
      }
      return true;
    });

    const masterEventIdsSet = new Set<string>();
    for (const f of masterFindings) {
      for (const id of f.eventIds || []) {
        if (typeof id === 'string' && id.trim().length > 0) {
          masterEventIdsSet.add(id.trim());
        }
      }
    }
    const totalEventsLinked = masterEventIdsSet.size;

    if (masterFindings.length < 1 || totalEventsLinked < 4) {
      missingEn.push('Must create validated findings for the master campaign linking at least 4 correlated attack events.');
      missingAr.push('يجب تأكيد نتائج تحقيق للتحقيق الشامل تربط على الأقل 4 أحداث هجومية مترابطة.');
    } else {
      // Verify rawEventId integrity and telemetry existence
      const hasValidEvents = masterFindings.every(
        (f) =>
          f.rawEventIds &&
          f.rawEventIds.length > 0 &&
          f.eventIds.every((id) => state.telemetryEvents.some((e) => e.id === id))
      );
      if (!hasValidEvents) {
        missingEn.push('Master findings contain invalid or unverified telemetry references.');
        missingAr.push('تحتوي نتائج التحقيق الشامل على مراجع أحداث غير موجودة في سجلات المحاكاة.');
      } else {
        completedObjs.push('master-obj-findings');
      }
    }

    // 4. Validated Detection Rule for Master Campaign
    const masterDetection = state.detections.find((d) => {
      // Strict ownership check:
      if (d.huntId) {
        if (d.huntId !== 'HUNT-MASTER') return false;
      } else {
        // Legacy ownership inference ONLY if huntId is absent and ID follows canonical format
        if (!d.id.startsWith('DET-HUNT-MASTER-')) return false;
      }

      const result = state.detectionResults[d.id];
      if (!result || result.ruleId !== d.id) return false;
      if (!result.isValid || result.truePositives < 1 || result.falsePositives !== 0) return false;

      const matchedEvents = result.matchedEventIds || [];
      if (matchedEvents.length === 0) return false;

      return matchedEvents.every((id) => state.telemetryEvents.some((e) => e.id === id));
    });

    if (!masterDetection) {
      missingEn.push('Must author and tune a validated detection rule for the master campaign with 0 false positives.');
      missingAr.push('يجب تصميم وضبط قاعدة كشف محكمة للتحقيق الشامل خالية من الإيجابيات الكاذبة.');
    } else {
      completedObjs.push('master-obj-detection');
    }

    // 5. SOC Handoff Dispatched for Master Campaign
    const masterSocHandoff = state.socHandoffs.find((h) => {
      // Strict ownership check:
      if (h.huntId) {
        if (h.huntId !== 'HUNT-MASTER') return false;
      } else {
        if (!h.handoffId.startsWith('SOC-HANDOFF-HUNT-MASTER-') && !h.handoffId.startsWith('HANDOFF-HUNT-MASTER-')) {
          return false;
        }
      }

      if (h.status !== 'DISPATCHED' && h.status !== 'INGESTED') return false;
      if (!h.findingId) return false;

      const linkedFinding = masterFindings.find((f) => f.id === h.findingId);
      if (!linkedFinding) return false;

      const validEventIds = (h.eventIds || []).filter((id) => typeof id === 'string' && id.trim().length > 0);
      if (validEventIds.length < 2) return false;

      const eventsExist = validEventIds.every((id) => state.telemetryEvents.some((e) => e.id === id));
      if (!eventsExist) return false;

      // Handoff events must be consistent with linked finding's eventIds
      const findingEventSet = new Set(linkedFinding.eventIds);
      const isConsistentWithFinding = validEventIds.some((id) => findingEventSet.has(id));
      if (!isConsistentWithFinding) return false;

      // If ruleId is present, must reference eligible detection rule for HUNT-MASTER
      if (h.ruleId) {
        const linkedRule = state.detections.find((d) => d.id === h.ruleId);
        if (!linkedRule) return false;

        if (linkedRule.huntId) {
          if (linkedRule.huntId !== 'HUNT-MASTER') return false;
        } else {
          if (!linkedRule.id.startsWith('DET-HUNT-MASTER-')) return false;
        }

        const ruleResult = state.detectionResults[linkedRule.id];
        if (
          !ruleResult ||
          ruleResult.ruleId !== linkedRule.id ||
          !ruleResult.isValid ||
          ruleResult.truePositives < 1 ||
          ruleResult.falsePositives !== 0
        ) {
          return false;
        }
      }

      return true;
    });

    if (!masterSocHandoff) {
      missingEn.push('Must dispatch validated campaign findings to SOC Incident Queue with valid telemetry events.');
      missingAr.push('يجب إرسال النتائج المؤكدة للتحقيق الشامل إلى قائمة حوادث مركز العمليات SOC.');
    } else {
      completedObjs.push('master-obj-soc');
    }

    // 6. Forensics Canonical Evidence Handoff for Master Campaign
    const masterForensicsHandoff = state.forensicsHandoffs.find((h) => {
      // Strict ownership check:
      if (h.huntId) {
        if (h.huntId !== 'HUNT-MASTER') return false;
      } else {
        if (!h.handoffId.startsWith('FOR-HANDOFF-HUNT-MASTER-') && !h.handoffId.startsWith('FORENSICS-HUNT-MASTER-')) {
          return false;
        }
      }

      // Linkage to a valid master finding
      if (!h.findingId) return false;
      const linkedFinding = masterFindings.find((f) => f.id === h.findingId);
      if (!linkedFinding) return false;

      if (!h.evidenceList || h.evidenceList.length < 2) return false;

      // Canonical evidence format, preserved, verified integrity
      const validEvidence = h.evidenceList.every(
        (e) => e.id.startsWith('EVD-') && e.preserved && e.integrityStatus === 'VERIFIED'
      );
      if (!validEvidence) return false;

      // Verify raw event / telemetry linkage in evidence
      if (h.rawEventIds && h.rawEventIds.length > 0) {
        const hasValidTelemetryRefs = h.rawEventIds.some((rid) =>
          state.telemetryEvents.some((e) => e.rawEventId === rid || e.id === rid) ||
          linkedFinding.rawEventIds.includes(rid)
        );
        if (!hasValidTelemetryRefs) return false;
      }

      return true;
    });

    if (!masterForensicsHandoff) {
      missingEn.push('Must complete Forensics Handoff for master campaign generating canonical preserved evidence items (EVD-...).');
      missingAr.push('يجب إتمام إحالة الأدلة الجنائية للتحقيق الشامل وتوليد عناصر أدلة محفوظة رسمية (EVD-...).');
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
