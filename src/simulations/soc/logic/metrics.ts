/**
 * OMEGA V11 — Detection Engineering Quality Metrics Engine
 * Calculates True Positives, False Positives, False Negatives, Precision, and Recall deterministically.
 * Fully deterministic - no Date.now, Math.random, or opaque AI estimates.
 */

export interface EventClassification {
  eventId: string;
  isMaliciousGroundTruth: boolean;
}

export interface DetectionMetricsResult {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
  precision: number; // 0.0 to 1.0 (or percentage 0 to 100)
  recall: number; // 0.0 to 1.0 (or percentage 0 to 100)
  f1Score: number;
  summaryEn: string;
  summaryAr: string;
}

/**
 * Calculates deterministic detection engineering metrics
 */
export function calculateDetectionMetrics(
  groundTruth: EventClassification[],
  alertedEventIds: string[]
): DetectionMetricsResult {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;

  const alertedSet = new Set(alertedEventIds);

  for (const item of groundTruth) {
    const isAlerted = alertedSet.has(item.eventId);
    if (item.isMaliciousGroundTruth) {
      if (isAlerted) {
        tp++;
      } else {
        fn++;
      }
    } else {
      if (isAlerted) {
        fp++;
      } else {
        tn++;
      }
    }
  }

  const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 100;
  const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 100;
  const f1 =
    precision + recall > 0
      ? (2 * (precision * recall)) / (precision + recall)
      : 0;

  let summaryEn = '';
  let summaryAr = '';

  if (fp === 0 && fn === 0 && tp > 0) {
    summaryEn = `Optimal Detection Fidelity: 100% Precision, 100% Recall. Zero false alarms and zero missed threats.`;
    summaryAr = `دقة كشف مثالية: 100% دقة و 100% استدعاء. صفر إنذارات خاطئة وصفر تهديدات فائتة.`;
  } else if (fp > 0 && fn === 0) {
    summaryEn = `High Recall (${recall.toFixed(1)}%) but Low Precision (${precision.toFixed(1)}%): Rule is too noisy, generating ${fp} false positive alerts on benign activity.`;
    summaryAr = `استدعاء عالي (${recall.toFixed(1)}%) ولكن دقة منخفضة (${precision.toFixed(1)}%): القاعدة حساسة جداً وتولد ${fp} إنذاراً كاذباً.`;
  } else if (fn > 0 && fp === 0) {
    summaryEn = `High Precision (${precision.toFixed(1)}%) but Low Recall (${recall.toFixed(1)}%): Rule is overly strict, missing ${fn} true malicious attack steps.`;
    summaryAr = `دقة عالية (${precision.toFixed(1)}%) ولكن استدعاء منخفض (${recall.toFixed(1)}%): القاعدة مقيدة جداً وتغفل ${fn} خطوات هجومية حقيقية.`;
  } else {
    summaryEn = `Mixed Fidelity: Precision ${precision.toFixed(1)}%, Recall ${recall.toFixed(1)}% (TP: ${tp}, FP: ${fp}, FN: ${fn}).`;
    summaryAr = `أداء متوسط: الدقة ${precision.toFixed(1)}%، الاستدعاء ${recall.toFixed(1)}% (صحيح: ${tp}، كاذب: ${fp}، فائت: ${fn}).`;
  }

  return {
    truePositives: tp,
    falsePositives: fp,
    falseNegatives: fn,
    trueNegatives: tn,
    precision: Math.round(precision * 10) / 10,
    recall: Math.round(recall * 10) / 10,
    f1Score: Math.round(f1 * 10) / 10,
    summaryEn,
    summaryAr,
  };
}
