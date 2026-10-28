import React, { useState } from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { Sliders, Play, CheckCircle2, AlertTriangle, ShieldCheck, Send, Sparkles, RefreshCw, XCircle, Code2 } from 'lucide-react';
import { DetectionRule } from '../logic/types';
import { SiemTranspilerModal } from './SiemTranspilerModal';

interface DetectionBuilderProps {
  language: 'ar' | 'en';
}

export const DetectionBuilder: React.FC<DetectionBuilderProps> = ({ language }) => {
  const detections = useThreatHuntingStore((s) => s.detections);
  const detectionResults = useThreatHuntingStore((s) => s.detectionResults);
  const addDetectionRule = useThreatHuntingStore((s) => s.addDetectionRule);
  const updateDetectionRule = useThreatHuntingStore((s) => s.updateDetectionRule);
  const validateDetectionRule = useThreatHuntingStore((s) => s.validateDetectionRule);
  const publishDetectionRuleToSoc = useThreatHuntingStore((s) => s.publishDetectionRuleToSoc);

  const isAr = language === 'ar';

  // Active Rule Editor State
  const [ruleName, setRuleName] = useState('Brute Force & Credential Compromise Detection');
  const [ruleSeverity, setRuleSeverity] = useState<DetectionRule['severity']>('HIGH');
  const [ruleType, setRuleType] = useState<DetectionRule['ruleType']>('THRESHOLD');
  const [threshold, setThreshold] = useState<number>(5);
  const [windowSec, setWindowSec] = useState<number>(120);
  const [excludedHosts, setExcludedHosts] = useState<string>('IT-MGMT-01');
  const [excludedUsers, setExcludedUsers] = useState<string>('it_admin_rob');

  const [activeEditingRuleId, setActiveEditingRuleId] = useState<string | null>(null);
  const [transpilingRule, setTranspilingRule] = useState<DetectionRule | null>(null);

  const handleCreateOrUpdateRule = () => {
    const hostList = excludedHosts.split(',').map((s) => s.trim()).filter(Boolean);
    const userList = excludedUsers.split(',').map((s) => s.trim()).filter(Boolean);

    if (activeEditingRuleId) {
      const existing = detections.find((d) => d.id === activeEditingRuleId);
      if (existing) {
        const updated: DetectionRule = {
          ...existing,
          nameEn: ruleName,
          nameAr: ruleName,
          severity: ruleSeverity,
          ruleType,
          threshold,
          windowVirtualSeconds: windowSec,
          exclusions: { hosts: hostList, users: userList },
        };
        updateDetectionRule(updated);
        validateDetectionRule(updated.id);
      }
    } else {
      const newId = addDetectionRule({
        nameEn: ruleName,
        nameAr: ruleName,
        descriptionEn: 'Detects repetitive authentication failures followed by suspicious activity.',
        descriptionAr: 'رصد تكرار محاولات تسجيل الدخول الفاشلة التي يعقبها نشاط مشبوه.',
        severity: ruleSeverity,
        dataSources: ['WINDOWS', 'IDENTITY'],
        conditions: [
          { field: 'category', operator: 'EQUALS', value: 'AUTHENTICATION' },
          { field: 'outcome', operator: 'EQUALS', value: 'FAILURE' },
        ],
        mitreTechniques: ['T1110 (Brute Force)'],
        status: 'TESTING',
        ruleType,
        threshold,
        windowVirtualSeconds: windowSec,
        exclusions: { hosts: hostList, users: userList },
      });
      setActiveEditingRuleId(newId);
      validateDetectionRule(newId);
    }
  };

  const handleValidate = (id: string) => {
    validateDetectionRule(id);
  };

  const handlePublish = (id: string) => {
    publishDetectionRuleToSoc(id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 select-none overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white tracking-tight">
            {isAr ? 'منصة هندسة وضبط قواعد الكشف' : 'Detection Engineering & Rule Tuning Engine'}
          </h2>
        </div>

        <button
          onClick={handleCreateOrUpdateRule}
          data-testid="btn-test-rule"
          className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{activeEditingRuleId ? (isAr ? 'إعادة تقييم وضبط' : 'Re-Evaluate & Tune') : (isAr ? 'إنشاء واختبار القاعدة' : 'Build & Test Rule')}</span>
        </button>
      </div>

      {/* Editor & Results Split View */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-5">
        {/* Rule Builder Controls */}
        <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {isAr ? 'معايير ومنطق الكشف الأمني:' : 'Detection Logic Parameters:'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">{isAr ? 'اسم القاعدة' : 'Rule Name'}</label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                data-testid="input-rule-name"
                className="p-2 rounded bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">{isAr ? 'مستوى الخطورة' : 'Severity'}</label>
              <select
                value={ruleSeverity}
                onChange={(e) => setRuleSeverity(e.target.value as any)}
                className="p-2 rounded bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Threshold & Time Window Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">{isAr ? 'حد تكرار الحدث (Threshold):' : 'Event Threshold:'}</span>
                <span className="font-mono text-cyan-400 font-bold" dir="ltr">{threshold} events</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                data-testid="slider-threshold"
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">{isAr ? 'نافذة الوقت الافتراضي (Time Window):' : 'Virtual Time Window:'}</span>
                <span className="font-mono text-cyan-400 font-bold" dir="ltr">{windowSec}s</span>
              </div>
              <input
                type="range"
                min={30}
                max={300}
                step={30}
                value={windowSec}
                onChange={(e) => setWindowSec(Number(e.target.value))}
                data-testid="slider-window"
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Exclusions for Noise Tuning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">
                {isAr ? 'استثناء الأجهزة السليمة (Noise Filter)' : 'Exclude Benign Hosts (Noise Filter)'}
              </label>
              <input
                type="text"
                value={excludedHosts}
                onChange={(e) => setExcludedHosts(e.target.value)}
                placeholder="e.g. IT-MGMT-01, QA-RUNNER"
                data-testid="input-exclude-hosts"
                className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">
                {isAr ? 'استثناء الحسابات الموثوقة' : 'Exclude Benign Users'}
              </label>
              <input
                type="text"
                value={excludedUsers}
                onChange={(e) => setExcludedUsers(e.target.value)}
                placeholder="e.g. it_admin_rob, backup_svc"
                data-testid="input-exclude-users"
                className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Validation & Benchmark Results */}
        {detections.map((rule) => {
          const result = detectionResults[rule.id];
          return (
            <div
              key={rule.id}
              data-testid={`detection-card-${rule.id}`}
              className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 font-bold" dir="ltr">
                    {rule.id}
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {isAr ? rule.nameAr : rule.nameEn}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rule.status === 'PUBLISHED'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : rule.status === 'VALIDATED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>
              </div>

              {result && (
                <div className="space-y-3">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block uppercase">{isAr ? 'الإيجابيات الحقيقية' : 'True Positives'}</span>
                      <span className="text-emerald-400 text-sm font-bold tabular-nums" dir="ltr">{result.truePositives}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block uppercase">{isAr ? 'الإنذارات الكاذبة' : 'False Positives'}</span>
                      <span className={`text-sm font-bold tabular-nums ${result.falsePositives > 0 ? 'text-rose-400' : 'text-slate-400'}`} dir="ltr">
                        {result.falsePositives}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block uppercase">{isAr ? 'دقة الكشف Precision' : 'Precision'}</span>
                      <span className="text-cyan-400 text-sm font-bold tabular-nums" dir="ltr">{(result.precision * 100).toFixed(0)}%</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block uppercase">{isAr ? 'الشمولية Recall' : 'Recall'}</span>
                      <span className="text-purple-400 text-sm font-bold tabular-nums" dir="ltr">{(result.recall * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Tuning Advice Banner */}
                  <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    result.isValid
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-800 text-amber-200'
                  }`}>
                    {result.isValid ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />}
                    <p className="leading-relaxed">{isAr ? result.tuningAdviceAr : result.tuningAdviceEn}</p>
                  </div>

                  {/* What Changed Delta Explanation */}
                  {result.deltaExplanationEn && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{isAr ? result.deltaExplanationAr : result.deltaExplanationEn}</p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
                    <button
                      onClick={() => setTranspilingRule(rule)}
                      data-testid={`btn-transpile-siem-${rule.id}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800 text-indigo-300 hover:text-white hover:bg-indigo-900/80 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                      title={isAr ? 'عرض وترجمة القاعدة لصيغ Sigma و SIEM' : 'Transpile rule to Sigma and SIEM queries'}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'قواعد Sigma & SIEM' : 'Sigma & SIEM Code'}</span>
                    </button>

                    <button
                      onClick={() => handleValidate(rule.id)}
                      data-testid={`btn-revalidate-${rule.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إعادة فحص' : 'Re-Run Test'}</span>
                    </button>

                    <button
                      onClick={() => handlePublish(rule.id)}
                      disabled={!result.isValid || rule.status === 'PUBLISHED'}
                      data-testid={`btn-publish-soc-${rule.id}`}
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{rule.status === 'PUBLISHED' ? (isAr ? 'تم النشر في SOC' : 'Published in SOC') : (isAr ? 'نشر القاعدة في SOC SIEM' : 'Publish Rule to SOC')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {transpilingRule && (
        <SiemTranspilerModal
          rule={transpilingRule}
          isOpen={true}
          onClose={() => setTranspilingRule(null)}
          language={language}
        />
      )}
    </div>
  );
};
