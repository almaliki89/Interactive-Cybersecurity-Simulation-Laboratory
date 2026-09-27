import React, { useState } from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { Play, Code, Sliders, AlertCircle, CheckCircle, Terminal, HelpCircle } from 'lucide-react';

interface HuntQueryEditorProps {
  language: 'ar' | 'en';
}

export const HuntQueryEditor: React.FC<HuntQueryEditorProps> = ({ language }) => {
  const rawQueryString = useThreatHuntingStore((s) => s.rawQueryString);
  const setRawQueryString = useThreatHuntingStore((s) => s.setRawQueryString);
  const executeQuery = useThreatHuntingStore((s) => s.executeQuery);
  const currentQueryResult = useThreatHuntingStore((s) => s.currentQueryResult);
  const selectEvent = useThreatHuntingStore((s) => s.selectEvent);
  const selectedEventId = useThreatHuntingStore((s) => s.selectedEventId);

  const isAr = language === 'ar';
  const [editorMode, setEditorMode] = useState<'ADVANCED' | 'GUIDED'>('ADVANCED');

  // Guided builder state
  const [guidedField, setGuidedField] = useState<string>('sourceWorld');
  const [guidedOperator, setGuidedOperator] = useState<string>('=');
  const [guidedValue, setGuidedValue] = useState<string>('WINDOWS');

  const handleRunQuery = () => {
    executeQuery();
  };

  const applyGuidedCondition = () => {
    const formattedVal = isNaN(Number(guidedValue)) ? `"${guidedValue}"` : guidedValue;
    const newCond = `${guidedField} ${guidedOperator} ${formattedVal}`;
    const newQuery = rawQueryString ? `${rawQueryString} AND ${newCond}` : newCond;
    setRawQueryString(newQuery);
    executeQuery(newQuery);
  };

  const sampleQueries = [
    { labelEn: 'Failed Logons (Windows)', labelAr: 'إخفاقات تسجيل الدخول (ويندوز)', query: 'sourceWorld = WINDOWS AND outcome = FAILURE' },
    { labelEn: 'PowerShell Processes', labelAr: 'عمليات PowerShell', query: 'process = "powershell.exe"' },
    { labelEn: 'Threat Severity Events', labelAr: 'الأحداث ذات الخطورة العالية', query: 'severity IN (threat, critical)' },
    { labelEn: 'C2 IP Connections', labelAr: 'الاتصالات بعنوان C2', query: 'sourceIp = "203.0.113.55" OR destinationIp = "198.51.100.99"' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 select-none overflow-hidden">
      {/* Mode Switcher & Execution Bar */}
      <div className="p-3 border-b border-slate-900 bg-slate-900/50 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setEditorMode('ADVANCED')}
            data-testid="tab-query-advanced"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              editorMode === 'ADVANCED' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{isAr ? 'محرر الاستعلام المتقدم' : 'Advanced Query Editor'}</span>
          </button>
          <button
            onClick={() => setEditorMode('GUIDED')}
            data-testid="tab-query-guided"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              editorMode === 'GUIDED' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? 'منشئ الشروط الموجه' : 'Guided Builder'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunQuery}
            data-testid="btn-run-query"
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAr ? 'تنفيذ الاستعلام' : 'Execute Query'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="p-4 border-b border-slate-900 bg-slate-950 shrink-0 flex flex-col gap-3">
        {editorMode === 'ADVANCED' ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">{isAr ? 'استعلام OMEGA HQL الآمن:' : 'Safe Threat Hunting Query (HQL):'}</span>
              <span className="text-slate-500 font-mono text-[10px]">
                {isAr ? 'يدعم: = , != , CONTAINS , IN , BETWEEN , AND , OR' : 'Supports: =, !=, CONTAINS, IN, BETWEEN, AND, OR'}
              </span>
            </div>
            <textarea
              value={rawQueryString}
              onChange={(e) => setRawQueryString(e.target.value)}
              placeholder="e.g. sourceWorld = WINDOWS AND outcome = FAILURE AND user = 'sara'"
              rows={3}
              dir="ltr"
              data-testid="threat-query-textarea"
              className="w-full p-3 font-mono text-xs bg-black border border-slate-800 rounded-lg text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
            {/* Field */}
            <select
              value={guidedField}
              onChange={(e) => setGuidedField(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
              dir="ltr"
            >
              <option value="sourceWorld">sourceWorld</option>
              <option value="eventType">eventType</option>
              <option value="user">user</option>
              <option value="host">host</option>
              <option value="sourceIp">sourceIp</option>
              <option value="destinationIp">destinationIp</option>
              <option value="process">process</option>
              <option value="resource">resource</option>
              <option value="severity">severity</option>
              <option value="outcome">outcome</option>
            </select>

            {/* Operator */}
            <select
              value={guidedOperator}
              onChange={(e) => setGuidedOperator(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
              dir="ltr"
            >
              <option value="=">=</option>
              <option value="!=">!=</option>
              <option value="CONTAINS">CONTAINS</option>
            </select>

            {/* Value */}
            <input
              type="text"
              value={guidedValue}
              onChange={(e) => setGuidedValue(e.target.value)}
              placeholder="value"
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono w-40"
              dir="ltr"
            />

            <button
              onClick={applyGuidedCondition}
              data-testid="btn-apply-guided-filter"
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition-colors"
            >
              {isAr ? 'إضافة للشرط وتنفيذ' : 'Add Condition & Run'}
            </button>
          </div>
        )}

        {/* Quick Sample Queries */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 shrink-0">{isAr ? 'قوالب سريعة:' : 'Quick Presets:'}</span>
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setRawQueryString(sample.query);
                executeQuery(sample.query);
              }}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-cyan-300 hover:border-cyan-800/50 text-[10px] transition-colors"
            >
              {isAr ? sample.labelAr : sample.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Query Diagnostics Banner */}
      {currentQueryResult && (
        <div className="px-4 py-2 bg-slate-900/30 border-b border-slate-900 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          {currentQueryResult.error ? (
            <div className="flex items-center gap-1.5 text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{currentQueryResult.error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isAr ? 'مطابقات الاستعلام:' : 'Matched Events:'}{' '}
                  <strong className="font-mono tabular-nums text-white">{currentQueryResult.matchedCount}</strong>
                </span>
              </div>
              <span>·</span>
              <span className="text-slate-500 font-mono" dir="ltr">
                Virtual Execution: {currentQueryResult.executionTimeVirtualMs}ms
              </span>
              <span>·</span>
              <span className="text-slate-500">
                {isAr ? 'الحقول المستعلم عنها:' : 'Fields:'}{' '}
                <strong className="font-mono text-slate-400" dir="ltr">
                  {currentQueryResult.fieldsUsed.join(', ') || 'ALL'}
                </strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Query Results Stream */}
      <div className="flex-1 overflow-y-auto p-3">
        {!currentQueryResult ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs gap-2">
            <Terminal className="w-8 h-8 text-slate-700" />
            <p>{isAr ? 'أدخل الاستعلام واضغط على "تنفيذ الاستعلام" لعرض النتائج' : 'Enter a query and click Execute Query to inspect results'}</p>
          </div>
        ) : currentQueryResult.events.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-sans">
            {isAr ? 'لم تسفر عملية البحث عن أي أحداث مطابقة' : 'No telemetry events matched the query conditions'}
          </div>
        ) : (
          <div className="space-y-1.5 font-mono text-xs">
            {currentQueryResult.events.map((event) => {
              const isSelected = event.id === selectedEventId;
              return (
                <div
                  key={event.id}
                  onClick={() => selectEvent(event.id)}
                  data-testid={`query-result-card-${event.id}`}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-100 shadow-sm'
                      : 'bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400" dir="ltr">
                        {event.sourceWorld}
                      </span>
                      <span className="text-slate-500" dir="ltr">
                        +{event.virtualTime}s
                      </span>
                      <span className="text-white font-bold" dir="ltr">
                        {event.eventType}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-sans font-bold px-1.5 py-0.5 rounded ${
                        event.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300'
                          : event.severity === 'threat'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {event.severity}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap" dir="ltr">
                    {event.user && <span>user: <strong className="text-slate-300">{event.user}</strong></span>}
                    {event.host && <span>host: <strong className="text-slate-300">{event.host}</strong></span>}
                    {event.sourceIp && <span>srcIp: <strong className="text-slate-300">{event.sourceIp}</strong></span>}
                    {event.process && <span>proc: <strong className="text-slate-300">{event.process}</strong></span>}
                    {event.resource && <span>res: <strong className="text-slate-300">{event.resource}</strong></span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
