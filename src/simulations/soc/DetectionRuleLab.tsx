import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  DetectionRule,
  STANDARD_DETECTION_RULES,
  evaluateDetectionRules,
  SecurityAlert,
} from './logic/detection';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent } from './logic/enrichment';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
  Radio,
} from 'lucide-react';

interface DetectionRuleLabProps {
  onBackToMap?: () => void;
  onNavigateToAlertTriage?: () => void;
}

export const DetectionRuleLab: React.FC<DetectionRuleLabProps> = ({
  onBackToMap,
  onNavigateToAlertTriage,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const runtimeEvents = useSimulationStore((s) => s.events);

  // Editable rules state
  const [rules, setRules] = useState<DetectionRule[]>(() =>
    STANDARD_DETECTION_RULES.map((r) => ({ ...r }))
  );
  const [selectedRuleId, setSelectedRuleId] = useState<string>('rule-auth-bruteforce');

  // Ingested normalized events
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

  const generatedAlerts: SecurityAlert[] = evaluateDetectionRules(enrichedTelemetry, rules);

  const activeRule = rules.find((r) => r.id === selectedRuleId) || rules[0];
  const ruleAlerts = generatedAlerts.filter((a) => a.ruleId === activeRule.id);

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updateThreshold = (ruleId: string, delta: number) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId && r.threshold) {
          const newThreshold = Math.max(1, Math.min(20, r.threshold + delta));
          return { ...r, threshold: newThreshold };
        }
        return r;
      })
    );
  };

  const updateWindow = (ruleId: string, windowMs: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, windowMs } : r))
    );
  };

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
              <ShieldAlert className="w-6 h-6 text-indigo-400" />
              <span>{isAr ? 'مختبر قواعد الاكتشاف وتوليد التنبيهات' : 'SIEM Detection Rules & Alert Generator Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص وضبط قواعد الاكتشاف الحتمية (Thresholds, Sequences, Single Events) ورؤية أثر التعديل على التنبيهات'
                : 'Configure production detection logic: Thresholds, Sequences, and State Rules. Observe real-time alert triggers.'}
            </p>
          </div>
        </div>

        {onNavigateToAlertTriage && (
          <button
            onClick={onNavigateToAlertTriage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'فرز وتصنيف التنبيهات' : 'Alert Triage Lab'}</span>
          </button>
        )}
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Active Rules</div>
            <div className="text-xl font-bold text-indigo-400">
              {rules.filter((r) => r.enabled).length} / {rules.length}
            </div>
          </div>
          <Shield className="w-8 h-8 text-indigo-400/40" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Alerts Fired</div>
            <div className="text-xl font-bold text-rose-400">
              {generatedAlerts.length} Fired
            </div>
          </div>
          <ShieldAlert className="w-8 h-8 text-rose-400/40" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Ingested Telemetry Events</div>
            <div className="text-xl font-bold text-cyan-400">
              {enrichedTelemetry.length} Processed
            </div>
          </div>
          <Layers className="w-8 h-8 text-cyan-400/40" />
        </div>
      </div>

      {/* Main Grid: Rule List + Rule Tuner & Alert Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rule Catalog */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Detection Catalog ({rules.length} Rules)
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {rules.map((rule) => {
              const isSelected = selectedRuleId === rule.id;
              const matchesCount = generatedAlerts.filter((a) => a.ruleId === rule.id).length;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-850 border-indigo-500/60 shadow-lg shadow-indigo-950/30'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rule.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : rule.severity === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {rule.severity}
                        </span>
                        <span className="font-bold text-white text-xs">{isAr ? rule.nameAr : rule.nameEn}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{rule.ruleType} • {rule.threatTechnique}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRule(rule.id);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          rule.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        {rule.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Matches: <strong className={matchesCount > 0 ? 'text-rose-400' : 'text-slate-400'}>{matchesCount} alerts</strong></span>
                    {rule.threshold && <span className="text-indigo-300">Threshold: {rule.threshold}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Rule Tuner & Alert Evidence Matches */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Rule Tuning & Evidence Inspector
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">{isAr ? activeRule.nameAr : activeRule.nameEn}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{isAr ? activeRule.descriptionAr : activeRule.descriptionEn}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                activeRule.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-950 text-slate-500 border border-slate-800'
              }`}>
                {activeRule.enabled ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>

            {/* Tuning Controls */}
            {activeRule.ruleType === 'THRESHOLD' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">Event Threshold Sensitivity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateThreshold(activeRule.id, -1)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-cyan-400 px-2">{activeRule.threshold} events</span>
                    <button
                      onClick={() => updateThreshold(activeRule.id, 1)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">Sliding Time Window:</span>
                  <div className="flex items-center gap-2">
                    {[30000, 60000, 120000].map((ms) => (
                      <button
                        key={ms}
                        onClick={() => updateWindow(activeRule.id, ms)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                          activeRule.windowMs === ms ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {ms / 1000}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generated Alerts For This Rule */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Triggered Alerts ({ruleAlerts.length})</span>
                <span className="text-slate-500 text-[10px]">Deterministic Evaluation</span>
              </div>

              {ruleAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  No alerts triggered by this rule under current scenario telemetry.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {ruleAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-300 text-[11px]">{alert.id}</span>
                        <span className="text-[10px] text-slate-500">T+{alert.createdAtVirtualTime}ms</span>
                      </div>
                      <div className="text-[11px] text-slate-300">{isAr ? alert.reasonAr : alert.reasonEn}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-800">
                        <span>Evidence Event IDs: [{alert.evidenceEventIds.join(', ')}]</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
