import React, { useState, useEffect } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import {
  AppSecChallengeState,
  getInitialChallengeState,
  validateAppSecurityState,
  MasterValidationResult,
} from './logic/hardening';
import { RECOMMENDED_SECURITY_HEADERS } from './logic/headers';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Lock,
  Key,
  Database,
  Sliders,
  FileCheck,
  Globe,
  Radio,
  Server,
  Activity,
  Award,
} from 'lucide-react';

interface AppSecMasterChallengeProps {
  onBackToMap?: () => void;
  onNavigateToLab?: (labId: string) => void;
}

export const AppSecMasterChallenge: React.FC<AppSecMasterChallengeProps> = ({
  onBackToMap,
  onNavigateToLab,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const addEvent = useSimulationStore((s) => s.addEvent);
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  const [state, setState] = useState<AppSecChallengeState>(getInitialChallengeState);

  useEffect(() => {
    registerChallengeValidator('appsec_master', () => {
      const res = validateAppSecurityState(state);
      return { success: res.success && res.score === 100, score: res.score, details: res };
    });
    return () => {
      unregisterChallengeValidator('appsec_master');
    };
  }, [state]);

  const validation: MasterValidationResult = validateAppSecurityState(state);

  const handleRunAudit = () => {
    const result = validateAppSecurityState(state);
    if (result.success && result.score === 100) {
      if (completeChallenge) {
        completeChallenge('appsec_master', {
          success: true,
          score: result.score,
          details: result,
        });
      }

      if (addEvent) {
        addEvent({
          id: `evt-appsec-master-complete-${virtualTime}`,
          type: 'MASTER_CHALLENGE_COMPLETED',
          virtualTime,
          timestamp: virtualTime,
          category: 'APPSEC',
          severity: 'success',
          description: 'Nexora Customer Portal production hardening challenge completed at 100% score (12 security controls + 1 business continuity requirement verified)!',
        });
      }
    }
  };

  const handleReset = () => {
    setState(getInitialChallengeState());
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
              <ShieldAlert className="w-6 h-6 text-yellow-400" />
              <span>{isAr ? 'التحدي الشامل: تأمين بوابة عملاء Nexora' : 'Master Challenge: Nexora Customer Portal Hardening'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تطبيق إنتاجي متكامل يتطلب تأمين 12 ضابطاً أمنياً + متطلب استمرارية الأعمال. أصلح كافة المشاكل دون كسر استمرارية عمل التطبيق!'
                : 'Production customer portal requiring 12 security controls + 1 business continuity requirement. Remediate all vulnerabilities while preserving business functionality.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAudit}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold shadow-lg transition-all ${
              validation.success
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>{isAr ? 'تشغيل التدقيق الأمني' : 'Run Security Audit'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scoreboard Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        validation.success
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border-emerald-500/60 shadow-xl shadow-emerald-950/30'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-yellow-950/40 border-slate-800 shadow-xl'
      }`}>
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              validation.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {validation.success ? 'ENTERPRISE POSTURE HARDENED' : 'VULNERABILITIES DETECTED'}
            </span>
            <span className="text-slate-500">Nexora Portal Production Gate</span>
          </div>
          <div className="text-sm font-bold text-slate-200">
            {isAr ? validation.summaryAr : validation.summaryEn}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-slate-500 text-[10px] uppercase">Passed Checks</div>
            <div className="text-xl font-bold text-emerald-400">{validation.passedChecks.length} / {validation.checkDetails.length}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-[10px] uppercase">Security Score</div>
            <div className={`text-4xl font-black ${validation.score === 100 ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {validation.score}%
            </div>
          </div>
        </div>
      </div>

      {/* Remediation Deck: 12 Interactive Defense Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Cookies */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">1. Session Cookie</span>
            <Key className="w-4 h-4 text-indigo-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={state.cookieSettings.httpOnly && state.cookieSettings.secure && state.cookieSettings.sameSite === 'Lax'}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  cookieSettings: {
                    ...s.cookieSettings,
                    httpOnly: e.target.checked,
                    secure: e.target.checked,
                    sameSite: e.target.checked ? 'Lax' : 'None',
                  },
                }))
              }
              className="rounded border-slate-700 text-indigo-500"
            />
            <span>Enable HttpOnly, Secure & SameSite=Lax</span>
          </label>
        </div>

        {/* 2. Object Ownership (BOLA) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">2. Object Ownership (IDOR)</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={state.enforceObjectOwnership}
              onChange={(e) => setState((s) => ({ ...s, enforceObjectOwnership: e.target.checked }))}
              className="rounded border-slate-700 text-emerald-500"
            />
            <span>Enforce Resource Owner Verification</span>
          </label>
        </div>

        {/* 3. Finance RBAC */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">3. Finance Route RBAC</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <select
            value={state.financeRouteRequiredRole}
            onChange={(e) => setState((s) => ({ ...s, financeRouteRequiredRole: e.target.value as any }))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
          >
            <option value="Finance">Restrict to 'Finance' Role (Secure)</option>
            <option value="None">None (Exposed to all - Flaw!)</option>
          </select>
        </div>

        {/* 4. SQL Injection */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">4. Database Query Mode</span>
            <Database className="w-4 h-4 text-red-400" />
          </div>
          <select
            value={state.databaseQueryMode}
            onChange={(e) => setState((s) => ({ ...s, databaseQueryMode: e.target.value as any }))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
          >
            <option value="PARAMETERIZED_PREPARED_STATEMENT">Prepared Statements (Secure)</option>
            <option value="UNSAFE_CONCATENATION">String Concatenation (Vulnerable!)</option>
          </select>
        </div>

        {/* 5. Output Encoding (XSS) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">5. Output Encoding (XSS)</span>
            <Sliders className="w-4 h-4 text-purple-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={state.enableContextAwareOutputEncoding}
              onChange={(e) => setState((s) => ({ ...s, enableContextAwareOutputEncoding: e.target.checked }))}
              className="rounded border-slate-700 text-purple-500"
            />
            <span>Enable Context-Safe Output Encoding</span>
          </label>
        </div>

        {/* 6. CSRF Tokens */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">6. CSRF Protection</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={state.enableCsrfTokensOnStateChangingRequests}
              onChange={(e) => setState((s) => ({ ...s, enableCsrfTokensOnStateChangingRequests: e.target.checked }))}
              className="rounded border-slate-700 text-teal-500"
            />
            <span>Enforce Synchronizer CSRF Tokens</span>
          </label>
        </div>

        {/* 7. JWT Claims */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">7. JWT Verification</span>
            <Key className="w-4 h-4 text-yellow-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={state.jwtValidateAudience && state.jwtValidateIssuer}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  jwtValidateAudience: e.target.checked,
                  jwtValidateIssuer: e.target.checked,
                  jwtValidateExpiry: true,
                }))
              }
              className="rounded border-slate-700 text-yellow-500"
            />
            <span>Validate Issuer (iss) & Audience (aud)</span>
          </label>
        </div>

        {/* 8. CORS */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">8. CORS Origin Policy</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={!state.corsConfig.allowedOrigins.includes('*')}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  corsConfig: {
                    ...s.corsConfig,
                    allowedOrigins: e.target.checked
                      ? ['https://portal.corp.nexora.local', 'https://app.corp.nexora.local']
                      : ['*'],
                  },
                }))
              }
              className="rounded border-slate-700 text-cyan-500"
            />
            <span>Strict Trusted Origins Allowlist</span>
          </label>
        </div>

        {/* 9. Uploads */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">9. File Upload Hardening</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={!state.uploadPolicy.allowedExtensions.includes('.php') && state.uploadPolicy.isolateStorageOutsideWebroot}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  uploadPolicy: {
                    ...s.uploadPolicy,
                    allowedExtensions: e.target.checked ? ['.pdf', '.png', '.jpg', '.jpeg', '.docx'] : ['.pdf', '.php', '.exe'],
                    isolateStorageOutsideWebroot: e.target.checked,
                    renameToUuidOrHash: e.target.checked,
                    enforceMagicBytesMatch: e.target.checked,
                  },
                }))
              }
              className="rounded border-slate-700 text-amber-500"
            />
            <span>Block Executables & Isolate Storage</span>
          </label>
        </div>

        {/* 10. Rate Limiting */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">10. Login Rate Limiting</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={state.enableLoginRateLimiting}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  enableLoginRateLimiting: e.target.checked,
                  loginMaxAttemptsPerMinute: e.target.checked ? 5 : 1000,
                }))
              }
              className="rounded border-slate-700 text-rose-500"
            />
            <span>Limit Login Attempts (5/min)</span>
          </label>
        </div>

        {/* 11. Security Headers */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">11. Security Headers</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={Boolean(state.responseHeaders['Content-Security-Policy'])}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  responseHeaders: e.target.checked
                    ? ({
                        'Content-Security-Policy': RECOMMENDED_SECURITY_HEADERS['Content-Security-Policy'],
                        'Strict-Transport-Security': RECOMMENDED_SECURITY_HEADERS['Strict-Transport-Security'],
                        'X-Content-Type-Options': 'nosniff',
                      } as Record<string, string>)
                    : ({} as Record<string, string>),
                }))
              }
              className="rounded border-slate-700 text-emerald-500"
            />
            <span>Attach Strict CSP, HSTS, nosniff</span>
          </label>
        </div>

        {/* 12. Logging */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">12. Security Audit Logging</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={state.enableSecurityAuditLogging}
              onChange={(e) => setState((s) => ({ ...s, enableSecurityAuditLogging: e.target.checked }))}
              className="rounded border-slate-700 text-blue-500"
            />
            <span>Forward Telemetry to SOC SIEM</span>
          </label>
        </div>
      </div>

      {/* Master Checklist Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <span className="font-bold text-slate-300 uppercase block pb-2 border-b border-slate-800">
          {isAr
            ? `قائمة التحقق من الامتثال الأمني: 12 ضابطاً أمنياً + متطلب استمرارية الأعمال (${validation.passedChecks.length} / ${validation.checkDetails.length})`
            : `Enterprise Security Compliance Checklist: 12 Security Controls + 1 Business Continuity Requirement (${validation.passedChecks.length} / ${validation.checkDetails.length})`}
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {validation.checkDetails.map((chk) => (
            <div
              key={chk.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                chk.passed
                  ? 'bg-slate-950/60 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold truncate">
                {chk.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                <span className="truncate">{isAr ? chk.nameAr : chk.nameEn}</span>
              </div>
              <span className="text-[10px] font-mono shrink-0 text-slate-500">+{chk.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
