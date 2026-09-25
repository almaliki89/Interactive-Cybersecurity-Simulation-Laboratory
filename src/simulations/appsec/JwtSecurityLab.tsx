import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  createSyntheticJwt,
  validateJwtClaims,
  JwtClaims,
  JwtHeader,
} from './logic/jwt';
import {
  Key,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Globe,
} from 'lucide-react';

interface JwtSecurityLabProps {
  onBackToMap?: () => void;
  onNavigateToCors?: () => void;
}

export const JwtSecurityLab: React.FC<JwtSecurityLabProps> = ({
  onBackToMap,
  onNavigateToCors,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  // JWT Parameter Toggles
  const [alg, setAlg] = useState<'RS256' | 'HS256' | 'none'>('RS256');
  const [issuer, setIssuer] = useState<string>('https://auth.corp.nexora.local');
  const [audience, setAudience] = useState<string>('https://portal.corp.nexora.local/api');
  const [subject, setSubject] = useState<string>('usr-alice');
  const [timeOffset, setTimeOffset] = useState<number>(0);

  const currentVTime = virtualTime + timeOffset;
  const expTime = 3600;

  const header: JwtHeader = { alg, typ: 'JWT', kid: 'nexora-key-01' };
  const claims: JwtClaims = {
    sub: subject,
    iss: issuer,
    aud: audience,
    exp: expTime,
    iat: 0,
    roles: ['Customer'],
    scopes: ['read:profile', 'read:orders'],
    email: 'alice@nexora.local',
  };

  const token = createSyntheticJwt(claims, header);
  const validation = validateJwtClaims(token, currentVTime);

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
              <Key className="w-6 h-6 text-yellow-400" />
              <span>{isAr ? 'مختبر فحص وتحليل رموز JSON Web Tokens (JWT)' : 'JSON Web Token (JWT) Claims & Verification Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص أجزاء الرمز الثلاثة (Header, Payload, Signature) والتحقق الصارم من المصدر (iss) والجمهور (aud) وتاريخ الصلاحية (exp) ورفض alg=none'
                : 'Inspect Header, Payload, Signature claims and verify iss, aud, exp, and critical alg=none rejection.'}
            </p>
          </div>
        </div>

        {onNavigateToCors && (
          <button
            onClick={onNavigateToCors}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isAr ? 'محاكي CORS' : 'CORS Policy Lab'}</span>
          </button>
        )}
      </div>

      {/* Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <label className="text-slate-300 font-bold block mb-1">1. Signing Algorithm (alg):</label>
          <select
            value={alg}
            onChange={(e) => setAlg(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="RS256">RS256 (Asymmetric RSA-SHA256 - Secure)</option>
            <option value="HS256">HS256 (Symmetric HMAC-SHA256)</option>
            <option value="none">none (Unsigned / Insecure - Critical Flaw!)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">2. Token Issuer (iss):</label>
          <select
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="https://auth.corp.nexora.local">https://auth.corp.nexora.local (Trusted)</option>
            <option value="https://attacker-idp.com">https://attacker-idp.com (Untrusted)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">3. Intended Audience (aud):</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="https://portal.corp.nexora.local/api">https://portal.corp.nexora.local/api (Target Service)</option>
            <option value="https://other-microservice.internal">https://other-microservice.internal (Wrong Aud)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">4. Virtual Time Clock:</label>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => setTimeOffset(0)}
              className={`py-1.5 rounded-lg text-center ${timeOffset === 0 ? 'bg-cyan-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'}`}
            >
              T+0 (Active)
            </button>
            <button
              onClick={() => setTimeOffset(4000)}
              className={`py-1.5 rounded-lg text-center ${timeOffset === 4000 ? 'bg-red-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'}`}
            >
              T+4000 (Expired)
            </button>
          </div>
        </div>
      </div>

      {/* 3-Part JWT Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Header */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-red-500/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-red-500/20 text-red-400 font-bold uppercase">
            <span>1. Header (Red)</span>
            <span className="text-[10px]">{header.alg}</span>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-red-300 text-xs overflow-x-auto">
            {JSON.stringify(header, null, 2)}
          </pre>
        </div>

        {/* Payload */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 text-purple-400 font-bold uppercase">
            <span>2. Payload / Claims (Purple)</span>
            <span className="text-[10px]">{claims.sub}</span>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 text-xs overflow-x-auto">
            {JSON.stringify(claims, null, 2)}
          </pre>
        </div>

        {/* Signature */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-cyan-400 font-bold uppercase">
            <span>3. Signature (Cyan)</span>
            <span className="text-[10px]">RSA-SHA256</span>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs overflow-x-auto break-all whitespace-pre-wrap">
            {token.signature}
          </pre>
        </div>
      </div>

      {/* Verification Verdict */}
      <div className={`p-6 rounded-2xl border space-y-3 ${
        validation.valid
          ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-950/20'
          : 'bg-red-950/30 border-red-500/60 text-red-300 shadow-lg shadow-red-950/20'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-bold uppercase tracking-wider">JWT Server Verification Decision</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold ${validation.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {validation.valid ? 'VERIFIED (HTTP 200)' : `REJECTED (${validation.failureReason})`}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          {isAr ? validation.reasonAr : validation.reasonEn}
        </div>
      </div>
    </div>
  );
};
