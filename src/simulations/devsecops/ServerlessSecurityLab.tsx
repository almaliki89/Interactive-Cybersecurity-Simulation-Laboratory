/**
 * OMEGA V15 — Serverless Security & Micro-IAM Isolation Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialServerlessFunctions, ServerlessFunctionPolicy } from './logic/serverless';
import { Boxes, ShieldCheck, RefreshCw } from 'lucide-react';

export const ServerlessSecurityLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [funcs, setFuncs] = useState<ServerlessFunctionPolicy[]>(getInitialServerlessFunctions());

  const hardenFunction = (id: string) => {
    setFuncs((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              assignedRole: 'LeastPrivilegeDynamoDbOnly',
              hasSecretManagerIntegration: true,
              environmentVariablesEncrypted: true,
              isHardened: true,
            }
          : f
      )
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-1">
              <Boxes className="w-4 h-4" />
              <span>{isAr ? 'مختبر أمن الدوال عديمة الخوادم (Serverless)' : 'Serverless & Micro-IAM Security Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'تقييد صلاحيات AWS Lambda وتشفير المتغيرات البيئية' : 'Lambda Execution Scopes & Environment Encryption'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'استبدل الأدوار الفضفاضة بأدوار دقيقة واجلب الأسرار من Secrets Manager.'
                : 'Replace broad AdministratorAccess roles with discrete micro-IAM policies per Lambda.'}
            </p>
          </div>

          <button
            onClick={() => setFuncs(getInitialServerlessFunctions())}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Serverless Funcs Grid */}
        <div className="space-y-3">
          {funcs.map((f) => (
            <div key={f.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white font-mono">{f.functionName} ({f.runtime})</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    f.isHardened
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {f.assignedRole}
                </span>
              </div>

              {!f.isHardened && (
                <button
                  onClick={() => hardenFunction(f.id)}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'تقييد الصلاحيات وربط AWS Secrets Manager' : 'Enforce Micro-IAM & Secrets Manager'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
