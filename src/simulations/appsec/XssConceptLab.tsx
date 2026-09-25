import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  XssContext,
  validateRenderedContext,
} from './logic/xss';
import {
  FileCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  Code,
} from 'lucide-react';

interface XssConceptLabProps {
  onBackToMap?: () => void;
  onNavigateToCsrf?: () => void;
}

export const XssConceptLab: React.FC<XssConceptLabProps> = ({
  onBackToMap,
  onNavigateToCsrf,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [inputStr, setInputStr] = useState<string>('<script>alert("XSS")</script>');
  const [context, setContext] = useState<XssContext>('HTML_BODY');
  const [applyEncoding, setApplyEncoding] = useState<boolean>(true);

  const result = validateRenderedContext(inputStr, context, applyEncoding);

  const contextPresets = [
    { label: 'HTML Body Script Tag', ctx: 'HTML_BODY' as XssContext, val: '<script>alert(1)</script>' },
    { label: 'HTML Body Image OnError', ctx: 'HTML_BODY' as XssContext, val: '<img src=x onerror=alert(1)>' },
    { label: 'Attribute Escape Quote', ctx: 'HTML_ATTRIBUTE' as XssContext, val: '" onfocus="alert(1)' },
    { label: 'JavaScript String Breakout', ctx: 'JAVASCRIPT_STRING' as XssContext, val: '"; alert(1); let x="' },
    { label: 'Dangerous URL Protocol', ctx: 'URL_HREF' as XssContext, val: 'javascript:alert(1)' },
  ];

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
              <FileCode className="w-6 h-6 text-purple-400" />
              <span>{isAr ? 'مختبر الدفاع ضد XSS وسياقات ترميز المخرجات' : 'Context-Aware XSS & Output Encoding Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فهم سياقات عرض النصوص في المتصفح: الترميز المناسب لكل سياق يمنع المتصفح من تفسير البيانات كأكواد'
                : 'Master browser rendering contexts: HTML Body, Attributes, JS Strings, and URL schemes with context-safe encoding.'}
            </p>
          </div>
        </div>

        {onNavigateToCsrf && (
          <button
            onClick={onNavigateToCsrf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'الحماية ضد CSRF' : 'CSRF Defense Lab'}</span>
          </button>
        )}
      </div>

      {/* Interactive Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="md:col-span-6 space-y-2">
          <label className="text-slate-300 font-bold block">1. Untrusted User Input:</label>
          <input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {contextPresets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setContext(p.ctx);
                  setInputStr(p.val);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-purple-400 hover:text-white"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-2">
          <label className="text-slate-300 font-bold block">2. Rendering Context:</label>
          <select
            value={context}
            onChange={(e) => setContext(e.target.value as XssContext)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="HTML_BODY">HTML Body Text Context</option>
            <option value="HTML_ATTRIBUTE">HTML Attribute Context</option>
            <option value="JAVASCRIPT_STRING">JavaScript String Literal</option>
            <option value="URL_HREF">URL / Hyperlink (href)</option>
          </select>
        </div>

        <div className="md:col-span-3 space-y-2">
          <label className="text-slate-300 font-bold block">3. Context-Safe Encoding:</label>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={applyEncoding}
              onChange={(e) => setApplyEncoding(e.target.checked)}
              className="rounded border-slate-700 text-purple-500"
            />
            <span className="font-bold">Apply Context-Aware Encoding</span>
          </label>
        </div>
      </div>

      {/* Code Snippet & DOM Interpretation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Rendered HTML Output Code</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              result.sanitizedSafe
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {result.sanitizedSafe ? 'DEFENDED / ENCODED' : 'VULNERABLE (UNENCODED)'}
            </span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs overflow-x-auto whitespace-pre-wrap">
            {result.renderedHtmlSnippet}
          </pre>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
            result.sanitizedSafe
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/30 border-red-500/40 text-red-300'
          }`}>
            {isAr ? result.domInterpretationAr : result.domInterpretationEn}
          </div>
        </div>

        {/* DOM Parser Visualizer */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Browser DOM Tree Representation</span>
            <Eye className="w-4 h-4 text-slate-500" />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-slate-400">Context: <span className="text-purple-400">{context}</span></div>
            <div className="text-slate-400">Encoded Value: <span className="text-yellow-300 break-all">{result.encodedOutput}</span></div>
            <div className="text-slate-400">Browser Execution Verdict: {result.rawWouldExecute && !applyEncoding ? (
              <span className="text-red-400 font-bold flex items-center gap-1 mt-1"><XCircle className="w-3.5 h-3.5" /> Script Execution Triggered!</span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1 mt-1"><CheckCircle2 className="w-3.5 h-3.5" /> Rendered Safely as Pure Text Node</span>
            )}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
