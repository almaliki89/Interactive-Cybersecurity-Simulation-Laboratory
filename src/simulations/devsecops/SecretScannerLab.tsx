/**
 * OMEGA V15 — Git Pre-Commit & CI Secret Scanner Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialSecretMatches, scanRepositorySecrets } from './logic/secretsScan';
import { GitSecretMatch } from './logic/types';
import { Key, ShieldCheck, AlertTriangle, RefreshCw, Sparkles, Trash2 } from 'lucide-react';

export const SecretScannerLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [matches, setMatches] = useState<GitSecretMatch[]>(getInitialSecretMatches());

  const scan = scanRepositorySecrets(matches);

  const remediateSecret = (id: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, remediated: true, inCommitHistory: false } : m))
    );
  };

  const scrubAll = () => {
    setMatches((prev) => prev.map((m) => ({ ...m, remediated: true, inCommitHistory: false })));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
              <Key className="w-4 h-4" />
              <span>{isAr ? 'مختبر كشف وتطهير أسرار Git' : 'Git Pre-Commit & CI Secret Scanner Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'كشف الأسرار العالية العشوائية وتطهير سجل الالتزامات' : 'High-Entropy Secret Detection & Git History Scrubbing'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'استخدم ماسح الأسرار لكشف مفاتيح AWS و Stripe المسربة في الشفرة المصدرية وتطهير تاريخ Git عبر git-filter-repo.'
                : 'Detect high-entropy credentials in commits and scrub historical Git references before public exposure.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? 'درجة نظافة الأسرار' : 'Secrets Score'}</div>
              <div
                className={`text-2xl font-black ${
                  scan.secretsScore >= 80
                    ? 'text-emerald-400'
                    : scan.secretsScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {scan.secretsScore}%
              </div>
            </div>

            <button
              onClick={scrubAll}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تطهير السجل التاريخي بالكامل' : 'Scrub Git History'}</span>
            </button>

            <button
              onClick={() => setMatches(getInitialSecretMatches())}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Leaked Secrets List */}
        <div className="space-y-3">
          {matches.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border transition-all space-y-2 ${
                m.remediated
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">{m.filePath}:{m.line}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-rose-300 border border-slate-700">
                    {m.secretType}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-amber-400">Entropy Score: {m.entropyScore}</span>
              </div>

              <div className="font-mono text-xs text-rose-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {m.remediated ? '• SECRET ROTATED & SCRUBBED FROM GIT HISTORY •' : m.maskedSecret}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-300">
                  {isAr ? m.remediationActionAr : m.remediationActionEn}
                </div>

                {!m.remediated && (
                  <button
                    onClick={() => remediateSecret(m.id)}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    {isAr ? 'تدوير المفتاح وتطهير Git' : 'Rotate & Scrub'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
