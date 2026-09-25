import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  CorsConfig,
  evaluatePreflight,
  evaluateCorsRequest,
} from './logic/cors';
import {
  Globe,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileCheck,
} from 'lucide-react';

interface CorsLabProps {
  onBackToMap?: () => void;
  onNavigateToFileUpload?: () => void;
}

export const CorsLab: React.FC<CorsLabProps> = ({
  onBackToMap,
  onNavigateToFileUpload,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [requestOrigin, setRequestOrigin] = useState<string>('https://app.corp.nexora.local');
  const [requestMethod, setRequestMethod] = useState<string>('DELETE');
  const [allowedOriginsMode, setAllowedOriginsMode] = useState<'EXPLICIT' | 'WILDCARD'>('EXPLICIT');
  const [allowCredentials, setAllowCredentials] = useState<boolean>(true);

  const corsConfig: CorsConfig = {
    allowedOrigins: allowedOriginsMode === 'WILDCARD' ? ['*'] : ['https://portal.corp.nexora.local', 'https://app.corp.nexora.local'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    allowCredentials,
  };

  const preflight = evaluatePreflight(
    { origin: requestOrigin, requestMethod, requestHeaders: ['Authorization'] },
    corsConfig
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
              <Globe className="w-6 h-6 text-cyan-400" />
              <span>{isAr ? 'مختبر سياسات مشاركة الموارد بين النطاقات (CORS)' : 'Cross-Origin Resource Sharing (CORS) Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فهم آلية فحص المتصفح للطلبات التمهيدية (Preflight OPTIONS) والترويسات المصرح بها وحظر استخدام النجمة مع الكوكيز'
                : 'Master browser CORS enforcement, preflight OPTIONS handshake, and credential safety rules.'}
            </p>
          </div>
        </div>

        {onNavigateToFileUpload && (
          <button
            onClick={onNavigateToFileUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'تأمين رفع الملفات' : 'File Upload Lab'}</span>
          </button>
        )}
      </div>

      {/* Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <label className="text-slate-300 font-bold block mb-1">1. Requesting Origin:</label>
          <select
            value={requestOrigin}
            onChange={(e) => setRequestOrigin(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="https://app.corp.nexora.local">https://app.corp.nexora.local (Trusted)</option>
            <option value="https://untrusted-external.net">https://untrusted-external.net (Foreign)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">2. HTTP Method:</label>
          <select
            value={requestMethod}
            onChange={(e) => setRequestMethod(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="GET">GET (Simple Request)</option>
            <option value="POST">POST (Standard)</option>
            <option value="DELETE">DELETE (Requires Preflight)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">3. Server Allowed Origins:</label>
          <div className="grid grid-cols-2 gap-1 pt-1">
            <button
              onClick={() => setAllowedOriginsMode('EXPLICIT')}
              className={`py-1.5 rounded-lg font-bold text-center ${allowedOriginsMode === 'EXPLICIT' ? 'bg-cyan-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'}`}
            >
              Explicit List
            </button>
            <button
              onClick={() => setAllowedOriginsMode('WILDCARD')}
              className={`py-1.5 rounded-lg font-bold text-center ${allowedOriginsMode === 'WILDCARD' ? 'bg-yellow-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'}`}
            >
              Wildcard (*)
            </button>
          </div>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">4. Allow Credentials:</label>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={allowCredentials}
              onChange={(e) => setAllowCredentials(e.target.checked)}
              className="rounded border-slate-700 text-cyan-500"
            />
            <span className="font-bold">Access-Control-Allow-Credentials</span>
          </label>
        </div>
      </div>

      {/* Preflight & Response Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Preflight (OPTIONS) Response Headers</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold ${preflight.allowedByBrowser ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {preflight.policyStatus}
            </span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs overflow-x-auto whitespace-pre-wrap">
            {Object.keys(preflight.responseHeaders).length > 0
              ? Object.entries(preflight.responseHeaders).map(([k, v]) => `${k}: ${v}`).join('\n')
              : '// No CORS headers returned (Blocked by server)'}
          </pre>
        </div>

        <div className={`p-6 rounded-2xl border space-y-4 ${
          preflight.allowedByBrowser
            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20 text-emerald-300'
            : 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/20 text-red-300'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold uppercase tracking-wider">Browser Enforcement Decision</span>
            <span className="font-bold">{preflight.allowedByBrowser ? 'PERMITTED' : 'BLOCKED'}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed text-slate-200">
            {isAr ? preflight.explanationAr : preflight.explanationEn}
          </div>
        </div>
      </div>
    </div>
  );
};
