import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  validateCsrfProtection,
  CsrfRequestScenario,
} from './logic/csrf';
import { SameSitePolicy } from './logic/sessions';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Globe,
  Lock,
  Key,
  CheckCircle2,
  XCircle,
  Radio,
} from 'lucide-react';

interface CsrfLabProps {
  onBackToMap?: () => void;
  onNavigateToApi?: () => void;
}

export const CsrfLab: React.FC<CsrfLabProps> = ({
  onBackToMap,
  onNavigateToApi,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [requestOrigin, setRequestOrigin] = useState<string>('https://evil-thirdparty.net');
  const [method, setMethod] = useState<'GET' | 'POST'>('POST');
  const [sameSitePolicy, setSameSitePolicy] = useState<SameSitePolicy>('None');
  const [includeCsrfToken, setIncludeCsrfToken] = useState<boolean>(false);

  const scenario: CsrfRequestScenario = {
    requestOrigin,
    targetOrigin: 'https://portal.corp.nexora.local',
    method,
    isStateChanging: method === 'POST',
    sameSitePolicy,
    cookieSentByBrowser: false,
    providedCsrfToken: includeCsrfToken ? 'csrf_valid_token_12345' : undefined,
    expectedCsrfToken: 'csrf_valid_token_12345',
  };

  const evalResult = validateCsrfProtection(scenario);

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
              <ShieldCheck className="w-6 h-6 text-teal-400" />
              <span>{isAr ? 'مختبر الحماية ضد تزوير الطلبات عبر المواقع (CSRF)' : 'CSRF & SameSite Cookie Defenses Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فهم آلية إرسال المتصفح للكوكيز تلقائياً عبر النطاقات، وكيف تحمي سياسات SameSite ورموز Anti-CSRF العمليات الحساسة'
                : 'Understand ambient browser cookie attachment on cross-origin requests and dual defense (SameSite + Anti-CSRF Token).'}
            </p>
          </div>
        </div>

        {onNavigateToApi && (
          <button
            onClick={onNavigateToApi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isAr ? 'أمن بوابات API' : 'API Security Lab'}</span>
          </button>
        )}
      </div>

      {/* Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <label className="text-slate-300 font-bold block mb-1">1. Initiating Request Origin:</label>
          <select
            value={requestOrigin}
            onChange={(e) => setRequestOrigin(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="https://evil-thirdparty.net">https://evil-thirdparty.net (Cross-Origin)</option>
            <option value="https://portal.corp.nexora.local">https://portal.corp.nexora.local (Same-Origin)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">2. HTTP Method:</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="POST">POST (State-Changing / Transfer)</option>
            <option value="GET">GET (Safe Read-Only)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">3. Cookie SameSite Policy:</label>
          <select
            value={sameSitePolicy}
            onChange={(e) => setSameSitePolicy(e.target.value as SameSitePolicy)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="Strict">Strict (Never sent cross-origin)</option>
            <option value="Lax">Lax (Blocked on cross-origin POST)</option>
            <option value="None">None (Sent automatically - Flaw!)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">4. Anti-CSRF Token Header:</label>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={includeCsrfToken}
              onChange={(e) => setIncludeCsrfToken(e.target.checked)}
              className="rounded border-slate-700 text-teal-500"
            />
            <span className="font-bold">Attach X-CSRF-Token</span>
          </label>
        </div>
      </div>

      {/* Cross-Origin Visualizer & Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Cross-Origin Request Flow</span>
            <Globe className="w-4 h-4 text-teal-400" />
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>• Origin: <span className="text-cyan-400">{requestOrigin}</span></div>
            <div>• Target: <span className="text-cyan-400">https://portal.corp.nexora.local/api/v1/transfer</span></div>
            <div>• Method: <span className="text-yellow-300">{method}</span></div>
            <div>• Cookies Attached by Browser: {evalResult.cookiesIncluded ? (
              <span className="text-red-400 font-bold">YES (Ambient inclusion active)</span>
            ) : (
              <span className="text-emerald-400 font-bold">NO (Blocked by SameSite)</span>
            )}</div>
            <div>• Anti-CSRF Token: {includeCsrfToken ? (
              <span className="text-emerald-400 font-bold">Valid Token Included</span>
            ) : (
              <span className="text-slate-500">Missing</span>
            )}</div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border space-y-4 ${
          evalResult.allowed
            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
            : 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/20'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold uppercase tracking-wider text-slate-400">CSRF Defense Verdict</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
              evalResult.allowed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              HTTP {evalResult.statusCode}
            </span>
          </div>

          <div className={`p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed ${
            evalResult.allowed ? 'text-emerald-300' : 'text-red-300'
          }`}>
            {isAr ? evalResult.decisionReasonAr : evalResult.decisionReasonEn}
          </div>
        </div>
      </div>
    </div>
  );
};
