import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  DetectionRule,
  STANDARD_DETECTION_RULES,
  evaluateDetectionRules,
} from './logic/detection';
import { calculateDetectionMetrics, DetectionMetricsResult } from './logic/metrics';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent } from './logic/enrichment';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Layers,
  Activity,
  ShieldAlert,
} from 'lucide-react';

interface DetectionEngineeringLabProps {
  onBackToMap?: () => void;
  onNavigateToMasterChallenge?: () => void;
}

export const DetectionEngineeringLab: React.FC<DetectionEngineeringLabProps> = ({
  onBackToMap,
  onNavigateToMasterChallenge,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const runtimeEvents = useSimulationStore((s) => s.events);

  // Tunable Threshold Rule
  const [thresholdVal, setThresholdVal] = useState<number>(5);
  const [windowVal, setWindowVal] = useState<number>(60000);

  const enrichedTelemetry = runtimeEvents.map((rawEvt) => {
    const norm = normalizeRuntimeEvent({
      id: rawEvt.id,
      type: rawEvt.type,
      source: rawEvt.source,
      target: rawEvt.target,
      category: rawEvt.category,
      severity: rawEvt.severity,
      virtualTime: rawEvt.virtualTime,
      description: rawEvt.description,
      payload: (rawEvt.payload as Record<string, unknown>) || {},
    });
    return enrichTelemetryEvent(norm);
  });

  // Custom tested rule
  const customRule: DetectionRule = {
    id: 'custom-auth-rule',
    nameEn: 'Tuned Authentication Brute-Force Rule',
    nameAr: 'قاعدة محاولات الدخول المضبوطة',
    descriptionEn: 'Evaluates brute force threshold sensitivity and time windows.',
    descriptionAr: 'تقييم حساسية عتبة الدخول والنوافذ الزمنية.',
    enabled: true,
    severity: 'HIGH',
    sourceCategories: ['AUTHENTICATION'],
    ruleType: 'THRESHOLD',
    threshold: thresholdVal,
    windowMs: windowVal,
    conditions: {
      category: 'AUTHENTICATION',
      outcome: 'FAILURE',
    },
    threatTechnique: 'T1110 - Brute Force',
  };

  const triggeredAlerts = evaluateDetectionRules(enrichedTelemetry, [customRule]);

  // Ground truth dataset for authentication events
  const groundTruth = enrichedTelemetry
    .filter((e) => e.category === 'AUTHENTICATION')
    .map((e) => ({
      eventId: e.id,
      isMaliciousGroundTruth: e.outcome === 'FAILURE',
    }));

  const metrics: DetectionMetricsResult = calculateDetectionMetrics(
    groundTruth,
    triggeredAlerts.flatMap((a) => a.evidenceEventIds)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <BackArrow className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span>{isAr ? 'مختبر هندسة الكشف وضبط دقة التنبيهات' : 'Detection Engineering & Rule Tuning Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'اختبار القواعد ضد سيناريوهات حية وحساب نسب الدقة (Precision) والاستدعاء (Recall) والإنذارات الكاذبة'
                : 'Tune detection thresholds -> Test against ground-truth attack telemetry -> Measure Precision & Recall.'}
            </p>
          </div>
        </div>

        {onNavigateToMasterChallenge && (
          <button
            onClick={onNavigateToMasterChallenge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
            <span>{isAr ? 'بدء التحدي الشامل' : 'Master Challenge'}</span>
          </button>
        )}
      </div>

      {/* Metrics Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Detection Precision</div>
          <div className={`text-2xl font-black mt-1 ${metrics.precision >= 90 ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {metrics.precision}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">True Positives / (TP + FP)</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Detection Recall</div>
          <div className={`text-2xl font-black mt-1 ${metrics.recall >= 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.recall}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">True Positives / (TP + FN)</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-bold">False Positive Alerts</div>
          <div className={`text-2xl font-black mt-1 ${metrics.falsePositives === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.falsePositives} Alarms
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Noise on Benign Events</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-bold">False Negatives</div>
          <div className={`text-2xl font-black mt-1 ${metrics.falseNegatives === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.falseNegatives} Missed
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Undetected Malicious Steps</div>
        </div>
      </div>

      {/* Rationale & Feedback Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 text-xs text-slate-300">
        <strong className="text-cyan-400 block mb-1">Quality Assessment:</strong>
        <div>{isAr ? metrics.summaryAr : metrics.summaryEn}</div>
      </div>

      {/* Tuning Controls Grid */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="text-slate-300 font-bold text-sm uppercase">Rule Tuning Parameters</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Threshold sensitivity */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">Failed Login Threshold:</span>
              <span className="text-cyan-400 font-bold text-sm">{thresholdVal} events</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={thresholdVal}
              onChange={(e) => setThresholdVal(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 (High Noise / Low Precision)</span>
              <span>5 (Optimal)</span>
              <span>15 (Missed / Low Recall)</span>
            </div>
          </div>

          {/* Time Window */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">Evaluation Window:</span>
              <span className="text-cyan-400 font-bold text-sm">{windowVal / 1000} seconds</span>
            </div>
            <div className="flex items-center gap-2">
              {[15000, 30000, 60000, 120000].map((ms) => (
                <button
                  key={ms}
                  onClick={() => setWindowVal(ms)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    windowVal === ms ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {ms / 1000}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
