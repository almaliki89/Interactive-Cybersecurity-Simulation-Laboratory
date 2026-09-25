import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  evaluateSecurityHeaders,
  RECOMMENDED_SECURITY_HEADERS,
  SecurityHeadersReport,
} from './logic/headers';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Activity,
} from 'lucide-react';

interface SecurityHeadersLabProps {
  onBackToMap?: () => void;
  onNavigateToRateLimiting?: () => void;
}

export const SecurityHeadersLab: React.FC<SecurityHeadersLabProps> = ({
  onBackToMap,
  onNavigateToRateLimiting,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  // Header toggles
  const [hasCsp, setHasCsp] = useState<boolean>(true);
  const [cspMode, setCspMode] = useState<'STRICT' | 'WEAK'>('STRICT');
  const [hasHsts, setHasHsts] = useState<boolean>(true);
  const [hasNosniff, setHasNosniff] = useState<boolean>(true);
  const [hasXfo, setHasXfo] = useState<boolean>(true);
  const [hasReferrer, setHasReferrer] = useState<boolean>(true);
  const [hasPermissions, setHasPermissions] = useState<boolean>(true);

  const currentHeaders: Record<string, string> = {};
  if (hasCsp) {
    currentHeaders['Content-Security-Policy'] =
      cspMode === 'STRICT'
        ? RECOMMENDED_SECURITY_HEADERS['Content-Security-Policy']
        : "default-src 'self' 'unsafe-inline';";
  }
  if (hasHsts) currentHeaders['Strict-Transport-Security'] = RECOMMENDED_SECURITY_HEADERS['Strict-Transport-Security'];
  if (hasNosniff) currentHeaders['X-Content-Type-Options'] = 'nosniff';
  if (hasXfo) currentHeaders['X-Frame-Options'] = 'DENY';
  if (hasReferrer) currentHeaders['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  if (hasPermissions) currentHeaders['Permissions-Policy'] = RECOMMENDED_SECURITY_HEADERS['Permissions-Policy'];

  const report: SecurityHeadersReport = evaluateSecurityHeaders(currentHeaders);

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
              <Shield className="w-6 h-6 text-emerald-400" />
              <span>{isAr ? 'مختبر الترويسات الأمنية الدفاعية (HTTP Security Headers)' : 'HTTP Security Headers & Posture Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص ترويسات CSP و HSTS و nosniff و X-Frame-Options وتقييم درجة الحماية الشاملة للمتصفح'
                : 'Evaluate CSP, HSTS, X-Content-Type-Options, Referrer-Policy, and live security grading.'}
            </p>
          </div>
        </div>

        {onNavigateToRateLimiting && (
          <button
            onClick={onNavigateToRateLimiting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isAr ? 'تقييد معدل الطلبات' : 'Rate Limiting Lab'}</span>
          </button>
        )}
      </div>

      {/* Header Controls & Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Controls */}
        <div className="md:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <span className="font-bold text-slate-300 uppercase block pb-2 border-b border-slate-800">
            Response Security Headers Toggles
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" checked={hasCsp} onChange={(e) => setHasCsp(e.target.checked)} className="rounded border-slate-700 text-emerald-500" />
              <span>Content-Security-Policy (CSP)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" checked={hasHsts} onChange={(e) => setHasHsts(e.target.checked)} className="rounded border-slate-700 text-emerald-500" />
              <span>Strict-Transport-Security (HSTS)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" checked={hasNosniff} onChange={(e) => setHasNosniff(e.target.checked)} className="rounded border-slate-700 text-emerald-500" />
              <span>X-Content-Type-Options (nosniff)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" checked={hasXfo} onChange={(e) => setHasXfo(e.target.checked)} className="rounded border-slate-700 text-emerald-500" />
              <span>X-Frame-Options (Clickjacking Shield)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" checked={hasReferrer} onChange={(e) => setHasReferrer(e.target.checked)} className="rounded border-slate-700 text-emerald-500" />
              <span>Referrer-Policy (Metadata Protection)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" checked={hasPermissions} onChange={(e) => setHasPermissions(e.target.checked)} className="rounded border-slate-700 text-emerald-500" />
              <span>Permissions-Policy (Hardware APIs)</span>
            </label>
          </div>
        </div>

        {/* Score & Grade */}
        <div className="md:col-span-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between items-center text-center space-y-2">
          <span className="font-bold text-slate-400 uppercase">Security Posture Grade</span>
          <div className={`text-5xl font-black ${
            report.grade.startsWith('A') ? 'text-emerald-400' : report.grade === 'B' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {report.grade}
          </div>
          <div className="text-sm font-bold text-slate-300">{report.score} / 100 Points</div>
        </div>
      </div>

      {/* Findings Breakdown Table */}
      <div className="space-y-3">
        {report.findings.map((finding) => (
          <div
            key={finding.headerName}
            className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              finding.status === 'STRONG'
                ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300'
                : finding.status === 'WEAK'
                ? 'bg-yellow-950/30 border-yellow-500/40 text-yellow-200'
                : 'bg-red-950/30 border-red-500/40 text-red-200'
            }`}
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="text-white">{finding.headerName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  finding.status === 'STRONG' ? 'bg-emerald-500/20 text-emerald-400' : finding.status === 'WEAK' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {finding.status}
                </span>
              </div>
              <div className="text-slate-400">{isAr ? finding.purposeAr : finding.purposeEn}</div>
              {finding.status !== 'STRONG' && (
                <div className="text-red-400 text-[11px]">Risk: {isAr ? finding.riskIfMissingAr : finding.riskIfMissingEn}</div>
              )}
            </div>

            <div className="text-right text-[11px] text-slate-500 font-mono">
              Recommended: <span className="text-cyan-400">{finding.recommendedValue.slice(0, 40)}...</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
