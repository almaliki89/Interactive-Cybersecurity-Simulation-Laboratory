/**
 * OMEGA V13 — Cloud Security World
 * CloudAccountLab.tsx
 *
 * Demonstrates Cloud Organization, Multi-Account Hierarchy, Blast Radius,
 * and Account Isolation boundaries.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  createDefaultNexoraOrganization,
  evaluateAccountIsolation,
  NexoraCloudAccount,
} from './logic/accounts';
import { Cloud, Shield, AlertTriangle, Layers, CheckCircle2, Lock, ArrowRight, Info } from 'lucide-react';

export const CloudAccountLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [org] = useState(createDefaultNexoraOrganization());
  const [selectedAccountId, setSelectedAccountId] = useState<string>(org.accounts[0].id);
  const [pivotTargetAccountId, setPivotTargetAccountId] = useState<string>(org.accounts[1].id);

  const selectedAccount = org.accounts.find((a) => a.id === selectedAccountId) || org.accounts[0];
  const targetAccount = org.accounts.find((a) => a.id === pivotTargetAccountId) || org.accounts[1];

  const isolationResult = evaluateAccountIsolation(selectedAccount.id, targetAccount.id, org);

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono mb-1">
            <Cloud className="w-4 h-4" />
            <span>NEXORA CLOUD ORGANIZATION HIERARCHY</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر تعدد الحسابات وعزل نطاق الأثر (Blast Radius)' : 'Cloud Accounts & Blast Radius Isolation Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'تعتمد السحابة الحديثة على فصل البيئات في حسابات مستقلة (Dev / Prod / Security) للحد من انتشار الهجمات ومنع القفز الجانبي.'
              : 'Enterprise cloud security relies on multi-account architecture (Dev, Prod, Security, Shared Services) to constrain the blast radius of compromised credentials.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Organization Accounts Directory */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{isAr ? 'حسابات المؤسسة السحابية' : 'Organization Cloud Accounts'}</span>
            <span className="text-[10px] text-sky-400 font-mono">{org.accounts.length} ACCOUNTS</span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
            {org.accounts.map((acc) => {
              const isSelected = acc.id === selectedAccountId;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{acc.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold ${
                        acc.environment === 'PROD'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          : acc.environment === 'SECURITY'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {acc.environment}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                    <span>ID: {acc.id}</span>
                    <span className={acc.blastRadius === 'CRITICAL' ? 'text-rose-400' : 'text-slate-400'}>
                      Blast Radius: {acc.blastRadius}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Selected Account Inspector & Pivot Test */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Selected Account Details Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedAccount.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">Account #: {selectedAccount.accountNumber}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedAccount.isDedicatedSecurityAccount && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>{isAr ? 'حساب أمان مخصص' : 'Dedicated SecOps Account'}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'البيئة' : 'ENVIRONMENT'}</span>
                <span className="font-bold text-white">{selectedAccount.environment}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'نطاق الأثر' : 'BLAST RADIUS'}</span>
                <span
                  className={`font-bold ${
                    selectedAccount.blastRadius === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {selectedAccount.blastRadius}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'المناطق المفعلة' : 'REGIONS'}</span>
                <span className="font-bold text-white">{selectedAccount.regions.join(', ')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'سقف الميزانية' : 'BUDGET LIMIT'}</span>
                <span className="font-bold text-white">${selectedAccount.budgetLimitUsd.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Interactive Blast Radius & Pivot Isolation Tester */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>{isAr ? 'محاكاة القفز الجانبي وعزل نطاق الأثر' : 'Lateral Movement & Blast Radius Simulation'}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {isAr
                  ? 'اختبر ما إذا كان اختراق الحساب المصدر يمكنه الوصول إلى الحساب الهدف دون تفويض صريح عبر حسابات أخرى.'
                  : 'Test whether credentials compromised in the source account can unilaterally access resources in the target account.'}
              </p>

              {/* Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
                <div className="flex-1 w-full p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">
                    {isAr ? 'الحساب المصدر (المخترق):' : 'Source (Compromised Account):'}
                  </span>
                  <span className="text-xs font-bold text-white">{selectedAccount.name}</span>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-500 shrink-0 rtl:rotate-180" />

                <div className="flex-1 w-full p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">
                    {isAr ? 'الحساب الهدف المراد اختراقه:' : 'Target (Destination Account):'}
                  </span>
                  <select
                    value={pivotTargetAccountId}
                    onChange={(e) => setPivotTargetAccountId(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-sky-400 focus:outline-none"
                  >
                    {org.accounts.map((a) => (
                      <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                        {a.name} ({a.environment})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result Badge */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isolationResult.isIsolated
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                }`}
              >
                {isolationResult.isIsolated ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold mb-1">
                    {isolationResult.isIsolated
                      ? isAr
                        ? `حاجز العزل فعال (${isolationResult.isolationBoundary})`
                        : `Isolation Boundary Active (${isolationResult.isolationBoundary})`
                      : isAr
                      ? 'لا يوجد عزل: الحسابان متطابقان!'
                      : 'Unconstrained Blast Radius: Same Account!'}
                  </div>
                  <div className="text-[11px] leading-relaxed opacity-90">
                    {isAr ? isolationResult.descriptionAr : isolationResult.descriptionEn}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {isAr
                  ? 'القاعدة الذهبية: لا تخلط أبدًا بين أحمال العمل التشغيلية (Prod) وسجلات التدقيق أو بيئات الاختبار في نفس الحساب.'
                  : 'Key Architecture Rule: Never co-locate production workloads, audit trails, and development sandboxes inside the same cloud account.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
