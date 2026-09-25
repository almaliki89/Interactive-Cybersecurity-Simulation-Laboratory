import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  UserSession,
  createSession,
  rotateSession,
  expireSession,
  validateSession,
  SameSitePolicy,
} from './logic/sessions';
import {
  Key,
  Lock,
  Unlock,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  RefreshCw,
  LogOut,
  Info,
} from 'lucide-react';

interface SessionSecurityLabProps {
  onBackToMap?: () => void;
  onNavigateToAuthz?: () => void;
}

export const SessionSecurityLab: React.FC<SessionSecurityLabProps> = ({
  onBackToMap,
  onNavigateToAuthz,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  // Cookie attribute toggles
  const [httpOnly, setHttpOnly] = useState<boolean>(true);
  const [secure, setSecure] = useState<boolean>(true);
  const [sameSite, setSameSite] = useState<SameSitePolicy>('Lax');
  const [ttlSeconds, setTtlSeconds] = useState<number>(3600);

  // Active session
  const [session, setSession] = useState<UserSession>(() =>
    createSession({
      userId: 'usr-alice',
      username: 'alice',
      role: 'Customer',
      virtualTime: 0,
      ttlSeconds: 3600,
      cookieAttributes: { httpOnly: true, secure: true, sameSite: 'Lax' },
    })
  );

  const [simulatedTimeOffset, setSimulatedTimeOffset] = useState<number>(0);
  const currentVirtualTime = virtualTime + simulatedTimeOffset;

  const validation = validateSession(session, currentVirtualTime);

  const handleCreateNew = () => {
    const newSess = createSession({
      userId: 'usr-alice',
      username: 'alice',
      role: 'Customer',
      virtualTime: currentVirtualTime,
      ttlSeconds,
      cookieAttributes: { httpOnly, secure, sameSite },
      sequence: 2,
    });
    setSession(newSess);
  };

  const handleRotate = () => {
    const { newSession } = rotateSession(session, currentVirtualTime, 3);
    setSession(newSession);
  };

  const handleLogout = () => {
    setSession(expireSession(session));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-mono">
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
              <Key className="w-6 h-6 text-indigo-400" />
              <span>{isAr ? 'مختبر أمن الجلسات والكوكيز (Session Security)' : 'Session & Cookie Security Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فهم دورة حياة الجلسة، سمات الكوكيز الصارمة (HttpOnly, Secure, SameSite)، التدوير لمنع Session Fixation، والإبطال الآمن'
                : 'Master session lifecycles, cookie flags (HttpOnly, Secure, SameSite), session fixation defense via rotation, and revocation'}
            </p>
          </div>
        </div>

        {onNavigateToAuthz && (
          <button
            onClick={onNavigateToAuthz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isAr ? 'التحكم بالوصول وحماية IDOR' : 'Access Control Lab'}</span>
          </button>
        )}
      </div>

      {/* Control & Hardening Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
        {/* Cookie Flags */}
        <div className="space-y-3">
          <label className="text-slate-300 font-bold block">1. Cookie Defensive Attributes:</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={httpOnly}
                onChange={(e) => setHttpOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-500"
              />
              <span>HttpOnly (Blocks JavaScript document.cookie XSS read)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={secure}
                onChange={(e) => setSecure(e.target.checked)}
                className="rounded border-slate-700 text-indigo-500"
              />
              <span>Secure (HTTPS only transmission)</span>
            </label>

            <div className="pt-1">
              <span className="text-slate-400 block mb-1">SameSite Policy:</span>
              <div className="grid grid-cols-3 gap-1">
                {(['Strict', 'Lax', 'None'] as SameSitePolicy[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSameSite(p)}
                    className={`py-1 rounded text-[11px] font-bold ${
                      sameSite === p ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lifecycle Actions */}
        <div className="space-y-3">
          <label className="text-slate-300 font-bold block">2. Session Lifecycle Operations:</label>
          <div className="space-y-2">
            <button
              onClick={handleCreateNew}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-700 text-slate-200 flex items-center justify-between"
            >
              <span>Issue New Session</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            <button
              onClick={handleRotate}
              className="w-full py-2 px-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 flex items-center justify-between"
            >
              <span>Rotate Session ID (Fixation Defense)</span>
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-200 flex items-center justify-between"
            >
              <span>Invalidate / Logout Session</span>
              <LogOut className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Time Simulator */}
        <div className="space-y-3">
          <label className="text-slate-300 font-bold block">3. Virtual Time Simulation:</label>
          <div className="space-y-2">
            <span className="text-slate-400 block">Advance virtual clock:</span>
            <div className="grid grid-cols-3 gap-1">
              {[0, 1800, 3601].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSimulatedTimeOffset(sec)}
                  className={`py-1.5 rounded text-[11px] font-bold ${
                    simulatedTimeOffset === sec ? 'bg-cyan-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'
                  }`}
                >
                  +{sec}s
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Current Time: <span className="text-cyan-400">T+{currentVirtualTime}s</span> | Expires: <span className="text-amber-400">T+{session.expiresAtVirtualTime}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session State Visualizer & Cookie Header Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Inspector */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase">Active Session Record</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              validation.valid
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {validation.valid ? 'VALID & ACTIVE' : validation.failureReason}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div>Session ID: <span className="text-indigo-400 font-bold">{session.sessionId}</span></div>
            <div>User: <span className="text-cyan-400">{session.username}</span> ({session.userId})</div>
            <div>Role: <span className="text-emerald-400">{session.role}</span></div>
            <div>CSRF Token: <span className="text-amber-400">{session.csrfToken}</span></div>
            <div>Created: T+{session.createdAtVirtualTime}s | Expires: T+{session.expiresAtVirtualTime}s</div>
          </div>

          <div className={`p-3 rounded-xl border text-xs ${
            validation.valid ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-red-950/30 border-red-500/40 text-red-300'
          }`}>
            {isAr ? validation.reasonAr : validation.reasonEn}
          </div>
        </div>

        {/* Set-Cookie Header Inspector */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase">HTTP Set-Cookie Header Preview</span>
            <span className="text-xs text-slate-400">RFC 6265bis</span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs overflow-x-auto whitespace-pre-wrap break-all">
{`Set-Cookie: nexora_session=${session.sessionId}; Path=/; Max-Age=${ttlSeconds}${session.cookieAttributes.httpOnly ? '; HttpOnly' : ''}${session.cookieAttributes.secure ? '; Secure' : ''}; SameSite=${session.cookieAttributes.sameSite}`}
          </pre>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div>• <span className="text-indigo-300">HttpOnly:</span> {session.cookieAttributes.httpOnly ? 'Enabled (XSS protected)' : 'DISABLED (Vulnerable to token theft via XSS)'}</div>
            <div>• <span className="text-indigo-300">Secure:</span> {session.cookieAttributes.secure ? 'Enabled (Encrypted transit)' : 'DISABLED (Plaintext leakage risk)'}</div>
            <div>• <span className="text-indigo-300">SameSite:</span> {session.cookieAttributes.sameSite} ({session.cookieAttributes.sameSite === 'Strict' ? 'Maximum CSRF protection' : session.cookieAttributes.sameSite === 'Lax' ? 'Balanced top-level navigation' : 'No cross-site defense'})</div>
          </div>
        </div>
      </div>
    </div>
  );
};
