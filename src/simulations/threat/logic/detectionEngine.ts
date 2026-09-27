/**
 * OMEGA V16 — Detection Engineering & Rule Tuning Engine
 * Validates, benchmarks, and tunes detection logic against multi-world telemetry.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import { DetectionRule, DetectionValidationResult } from './types';

export class DetectionEngine {
  /**
   * Evaluates a detection rule against telemetry events and computes precision/recall
   */
  public static validateRule(
    rule: DetectionRule,
    events: SecurityTelemetryEvent[],
    previousResult?: DetectionValidationResult
  ): DetectionValidationResult {
    const matchedEvents: SecurityTelemetryEvent[] = [];
    const benignMatches: string[] = [];
    const maliciousMatches: string[] = [];

    // Filter by dataSources
    const candidateEvents = events.filter((e) => {
      if (rule.dataSources && rule.dataSources.length > 0) {
        return rule.dataSources.includes(e.sourceWorld);
      }
      return true;
    });

    // Check exclusions
    const excludedHosts = (rule.exclusions?.hosts || []).map((h) => h.toLowerCase());
    const excludedUsers = (rule.exclusions?.users || []).map((u) => u.toLowerCase());
    const excludedProcesses = (rule.exclusions?.processes || []).map((p) => p.toLowerCase());

    const filteredEvents = candidateEvents.filter((e) => {
      if (e.host && excludedHosts.includes(e.host.toLowerCase())) return false;
      if (e.user && excludedUsers.includes(e.user.toLowerCase())) return false;
      if (e.process && excludedProcesses.includes(e.process.toLowerCase())) return false;
      return true;
    });

    // Evaluate conditions for single event matches
    const singleMatches = filteredEvents.filter((event) => {
      return rule.conditions.every((cond) => {
        let eventVal: any;
        const lower = cond.field.toLowerCase();

        if (lower === 'sourceworld' || lower === 'world') eventVal = event.sourceWorld;
        else if (lower === 'eventtype' || lower === 'type') eventVal = event.eventType;
        else if (lower === 'user' || lower === 'username') eventVal = event.user;
        else if (lower === 'host' || lower === 'hostname') eventVal = event.host;
        else if (lower === 'sourceip' || lower === 'ip') eventVal = event.sourceIp;
        else if (lower === 'process') eventVal = event.process;
        else if (lower === 'parentprocess') eventVal = event.parentProcess;
        else if (lower === 'resource') eventVal = event.resource;
        else if (lower === 'severity') eventVal = event.severity;
        else if (lower === 'category') eventVal = event.category;
        else if (lower === 'outcome') eventVal = event.outcome;
        else {
          eventVal = event.attributes ? event.attributes[cond.field] || event.attributes[lower] : undefined;
        }

        if (eventVal === undefined || eventVal === null) return false;

        const strVal = String(eventVal).toLowerCase();

        switch (cond.operator) {
          case 'EQUALS':
            return strVal === String(cond.value).toLowerCase();
          case 'NOT_EQUALS':
            return strVal !== String(cond.value).toLowerCase();
          case 'CONTAINS':
            return strVal.includes(String(cond.value).toLowerCase());
          case 'IN': {
            if (Array.isArray(cond.value)) {
              return cond.value.map((v) => String(v).toLowerCase()).includes(strVal);
            }
            return false;
          }
          case 'GREATER_THAN':
            return Number(eventVal) > Number(cond.value);
          default:
            return false;
        }
      });
    });

    if (rule.ruleType === 'THRESHOLD' && rule.threshold && rule.threshold > 1) {
      // Group by entity (user or host) within virtual window
      const windowSec = rule.windowVirtualSeconds || 120;
      const userGroups = new Map<string, SecurityTelemetryEvent[]>();

      singleMatches.forEach((e) => {
        const key = e.user || e.host || 'unknown';
        if (!userGroups.has(key)) userGroups.set(key, []);
        userGroups.get(key)!.push(e);
      });

      userGroups.forEach((group) => {
        if (group.length >= rule.threshold!) {
          // Check time window
          const sorted = [...group].sort((a, b) => a.virtualTime - b.virtualTime);
          const span = sorted[sorted.length - 1].virtualTime - sorted[0].virtualTime;
          if (span <= windowSec) {
            matchedEvents.push(...sorted);
          }
        }
      });
    } else {
      matchedEvents.push(...singleMatches);
    }

    // Classify into benign (noise/testing) vs true malicious
    matchedEvents.forEach((e) => {
      const isBenign =
        e.user?.toLowerCase().includes('it_admin') ||
        e.user?.toLowerCase().includes('test_runner') ||
        e.host?.toLowerCase().includes('qa-runner') ||
        e.attributes?.isBenignTest === true ||
        (e.sourceIp === '10.0.99.99' && e.attributes?.purpose === 'healthcheck');

      if (isBenign) {
        benignMatches.push(e.id);
      } else {
        maliciousMatches.push(e.id);
      }
    });

    const totalEvaluated = events.length;
    const truePositives = maliciousMatches.length;
    const falsePositives = benignMatches.length;
    const matchedCount = matchedEvents.length;

    const precision = matchedCount > 0 ? Number((truePositives / matchedCount).toFixed(2)) : 1.0;
    // Assuming expected attacks in scenario are identified by threat/critical severity in malicious set
    const totalExpectedThreats = events.filter(
      (e) => (e.severity === 'threat' || e.severity === 'critical') && !e.user?.includes('test')
    ).length;

    const recall = totalExpectedThreats > 0 ? Number((Math.min(truePositives, totalExpectedThreats) / totalExpectedThreats).toFixed(2)) : 1.0;

    const isValid = truePositives >= 1 && falsePositives === 0;

    // Tuning advice
    let tuningAdviceEn = 'Rule matches threat pattern cleanly with zero false positive noise.';
    let tuningAdviceAr = 'تطابق القاعدة نمط التهديد بدقة متناهية دون تسجيل أي إيجابيات كاذبة.';

    if (falsePositives > 0) {
      tuningAdviceEn = `Alert is noisy (${falsePositives} false positives detected). Add host/user exclusions or increase threshold count.`;
      tuningAdviceAr = `القاعدة تصدر تنبيهات مزعجة (${falsePositives} إنذار كاذب). أضف استثناءات للأجهزة/المستخدمين أو ارفع حد التكرار.`;
    } else if (truePositives === 0) {
      tuningAdviceEn = 'Rule is too restrictive or condition does not match any malicious activity in telemetry.';
      tuningAdviceAr = 'القاعدة مقيدة للغاية أو أن شروط الفحص لا تطابق أي نشاط خبيث في السجلات.';
    }

    // Delta explanation
    let deltaExplanationEn: string | undefined;
    let deltaExplanationAr: string | undefined;

    if (previousResult) {
      const fpDelta = previousResult.falsePositives - falsePositives;
      const tpDelta = truePositives - previousResult.truePositives;

      deltaExplanationEn = `Before: ${previousResult.matchedEventIds.length} matches (${previousResult.falsePositives} false positives). After tuning: ${matchedCount} matches (${falsePositives} false positives). FP Noise reduced by ${fpDelta}.`;
      deltaExplanationAr = `سابقاً: ${previousResult.matchedEventIds.length} تطابق (${previousResult.falsePositives} إنذار كاذب). بعد الضبط: ${matchedCount} تطابق (${falsePositives} إنذار كاذب). تم تقليص الضوضاء بمقدار ${fpDelta}.`;
    }

    return {
      ruleId: rule.id,
      totalEvaluated,
      matchedEventIds: matchedEvents.map((e) => e.id),
      truePositives,
      falsePositives,
      benignMatches,
      maliciousMatches,
      precision,
      recall,
      isValid,
      tuningAdviceEn,
      tuningAdviceAr,
      deltaExplanationEn,
      deltaExplanationAr,
    };
  }
}
