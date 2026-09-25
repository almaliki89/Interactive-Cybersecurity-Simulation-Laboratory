import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  INITIAL_DOMAIN_TRUSTS,
  DomainTrust,
  canAuthenticateAcrossTrust,
  TrustAuthDecision,
} from './logic/trusts';
import {
  Network,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Key,
  Layers,
  Sparkles,
  Info,
  Server,
  ArrowLeftRight,
} from 'lucide-react';

interface TrustRelationshipsLabProps {
  onBackToMap?: () => void;
}

export const TrustRelationshipsLab: React.FC<TrustRelationshipsLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [trusts, setTrusts] = useState<DomainTrust[]>(INITIAL_DOMAIN_TRUSTS);
  const [userDomain, setUserDomain] = useState<string>('partner-alliance.net');
  const [resourceDomain, setResourceDomain] = useState<string>('corp.nexora.local');

  const domainList = [
    'corp.nexora.local',
    'emea.corp.nexora.local',
    'partner-alliance.net',
    'legacy-datacenter.internal',
    'untrusted-external.org',
  ];

  const decision: TrustAuthDecision = canAuthenticateAcrossTrust(trusts, userDomain, resourceDomain);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
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
              <Network className="w-6 h-6 text-rose-400" />
              <span>{isAr ? 'مختبر علاقات ثقة النطاقات (Domain Trust Relationships)' : 'Active Directory Domain Trusts Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'استكشاف مسارات المصادقة العابرة للنطاقات، ثقة الغابات، وتذاكر إحالة Kerberos (Cross-Realm Referrals)'
                : 'Understand cross-domain authentication trust paths, forest boundaries, and Kerberos referral ticket routing'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-rose-400">
            Trusts Configured: {trusts.length}
          </span>
        </div>
      </div>

      {/* Trust Simulator Deck */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs">
        <span className="font-bold text-slate-300 block uppercase tracking-wider">
          {isAr ? 'اختبار مسار المصادقة العابر للنطاقات:' : 'Test Cross-Realm Authentication Path:'}
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-400 block">{isAr ? 'نطاق حساب المستخدم (User Domain):' : 'Source User Domain:'}</label>
            <select
              value={userDomain}
              onChange={(e) => setUserDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
            >
              {domainList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 block">{isAr ? 'نطاق المورد الهدف (Resource Domain):' : 'Target Resource Domain:'}</label>
            <select
              value={resourceDomain}
              onChange={(e) => setResourceDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
            >
              {domainList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Decision Card */}
      <div
        className={`p-6 rounded-2xl border transition-all font-mono text-xs space-y-3 ${
          decision.canAuthenticate
            ? 'bg-emerald-950/30 border-emerald-500/80 shadow-lg shadow-emerald-950/20'
            : 'bg-rose-950/30 border-rose-500/80 shadow-lg shadow-rose-950/20'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="font-bold text-white uppercase tracking-wider">
            {decision.canAuthenticate ? 'Authentication Path: ESTABLISHED' : 'Authentication Path: BLOCKED'}
          </span>
          {decision.canAuthenticate ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>KERBEROS REFERRAL GRANTED</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>NO TRUST PATH EXISTS</span>
            </span>
          )}
        </div>

        <p className="text-slate-200 text-sm leading-relaxed">
          {isAr ? decision.reasonAr : decision.reasonEn}
        </p>

        {decision.canAuthenticate && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-[11px] space-y-1">
            <span className="font-bold block text-white">Trust Chain:</span>
            <span>{decision.trustPath.join(' ──[TRUSTS]──► ')}</span>
            <p className="text-amber-300 text-[10px] mt-1 pt-1 border-t border-slate-900">
              ⚠ {isAr ? decision.authSuccessWarningAr : decision.authSuccessWarningEn}
            </p>
          </div>
        )}
      </div>

      {/* Configured Enterprise Trusts List */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs">
        <span className="font-bold text-white uppercase tracking-wider block">
          {isAr ? 'علاقات الثقة الموثقة في الغابة:' : 'Active Domain Trust Inventory:'}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trusts.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400">{t.trustType}</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {t.direction}
                </span>
              </div>
              <div className="text-white font-bold">
                {t.sourceDomain} ↔ {t.targetDomain}
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                {isAr ? t.descriptionAr : t.descriptionEn}
              </p>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-900 text-[10px]">
                <span>Transitive: {t.transitive ? 'Yes' : 'No'}</span>
                <span>SID Filtering: {t.sidFilteringEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
