/**
 * OMEGA V15 — SAST Static Code Scanner Interactive Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialSastFindings, scanCodeForSastVulnerabilities } from './logic/sast';
import { SastFinding } from './logic/types';
import { FileCode, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, Sparkles, Terminal } from 'lucide-react';

export const SastCodeScannerLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [findings, setFindings] = useState<SastFinding[]>(getInitialSastFindings());
  const [selectedFindingId, setSelectedFindingId] = useState<string>('sast-001');

  const scan = scanCodeForSastVulnerabilities(findings);
  const selectedFinding = findings.find((f) => f.id === selectedFindingId) || findings[0];

  const remediateFinding = (id: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, remediated: true } : f))
    );
  };

  const remediateAll = () => {
    setFindings((prev) => prev.map((f) => ({ ...f, remediated: true })));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
              <FileCode className="w-4 h-4" />
              <span>{isAr ? 'مختبر فحص الشفرة البرمجية الثابت (SAST)' : 'Static Application Security Testing (SAST) Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'اكتشاف وتصحيح ثغرات SQL Injection و XSS قبل المدمج' : 'SAST Static Code Vulnerability Audit & Remediation'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'افحص نتائج ماسح Semgrep المباشر للشفرة المصدرية، واصلح الثغرات من الكود البرمجي لحماية الخادم.'
                : 'Scan source code snippets for OWASP Top 10 vulnerabilities and apply parameterized code fixes.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? 'درجة أمان الكود' : 'SAST Score'}</div>
              <div
                className={`text-2xl font-black ${
                  scan.sastScore >= 80
                    ? 'text-emerald-400'
                    : scan.sastScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {scan.sastScore}%
              </div>
            </div>

            <button
              onClick={remediateAll}
              className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصحيح جميع الثغرات' : 'Remediate All Flaws'}</span>
            </button>

            <button
              onClick={() => setFindings(getInitialSastFindings())}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Findings & Code Fixer Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Findings List */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {isAr ? 'نتائج الفحص البرمجي (SAST Findings):' : 'Scanned Code Flaws:'}
            </div>

            {findings.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedFindingId(f.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedFindingId === f.id
                    ? 'bg-purple-950/30 border-purple-500 text-white shadow-md'
                    : f.remediated
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-400">{f.file}:{f.line}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                      f.remediated
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {f.remediated ? 'FIXED' : f.severity}
                  </span>
                </div>
                <div className="font-bold text-xs">{isAr ? f.titleAr : f.titleEn}</div>
              </div>
            ))}
          </div>

          {/* Remediation Code Inspector */}
          <div className="md:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-purple-300 border border-slate-700">
                  {selectedFinding.cwe}
                </span>
                <h2 className="text-sm font-bold text-white mt-1">
                  {isAr ? selectedFinding.titleAr : selectedFinding.titleEn}
                </h2>
              </div>

              {!selectedFinding.remediated && (
                <button
                  onClick={() => remediateFinding(selectedFinding.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'تطبيق الإصلاح الأمني' : 'Apply Secure Patch'}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr ? selectedFinding.explanationAr : selectedFinding.explanationEn}
            </p>

            {/* Code Snippet Comparison */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-[10px] text-rose-400 font-bold uppercase mb-1">
                  {isAr ? 'الكود الضعيف والمكشوف (Vulnerable Code):' : 'Vulnerable Code Snippet:'}
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-rose-900/40 text-rose-300 overflow-x-auto">
                  {selectedFinding.codeSnippet}
                </pre>
              </div>

              <div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">
                  {isAr ? 'الكود المحصن والآمن (Patched Secure Code):' : 'Remediated Code Snippet:'}
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-emerald-900/40 text-emerald-300 overflow-x-auto">
                  {selectedFinding.remediationSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
