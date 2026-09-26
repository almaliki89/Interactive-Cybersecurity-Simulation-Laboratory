/**
 * OMEGA V14 — Kubernetes Secrets Security & Vault Integration Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialClusterSecrets, auditSecretsSecurity } from './logic/secrets';
import { KubernetesSecret } from './logic/types';
import { Lock, Key, ShieldCheck, RefreshCw, Sparkles, Eye, EyeOff } from 'lucide-react';

export const K8sSecretsLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [secrets, setSecrets] = useState<KubernetesSecret[]>(getInitialClusterSecrets());
  const [isEtcdKmsActive, setIsEtcdKmsActive] = useState<boolean>(false);
  const [showPlaintext, setShowPlaintext] = useState<boolean>(false);

  const audit = auditSecretsSecurity(secrets, isEtcdKmsActive);

  const enableKmsAndVault = () => {
    setIsEtcdKmsActive(true);
    setSecrets((prev) =>
      prev.map((s) => ({
        ...s,
        encryptedAtRest: true,
        encryptionProvider: 'kms-envelope',
        managedByExternalVault: true,
      }))
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs mb-1">
              <Lock className="w-4 h-4" />
              <span>{isAr ? 'مختبر أمان وتشفير أسرار كوبرنيتيس' : 'K8s Secrets & Vault Integration Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'تشفير قاعدة بيانات etcd وحقن الأسرار الديناميكية' : 'etcd Encryption at Rest & Dynamic Vault Injection'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'تجاوز ترميز Base64 البسيط وافرض تشفير KMS Envelope وربط الحاويات مع HashiCorp Vault.'
                : 'Replace plain Base64 encoding with hardware KMS envelope encryption and external Vault synchronizers.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? 'درجة الأمان' : 'Security Score'}</div>
              <div
                className={`text-2xl font-black ${
                  audit.securityScore >= 80
                    ? 'text-emerald-400'
                    : audit.securityScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {audit.securityScore}%
              </div>
            </div>

            <button
              onClick={enableKmsAndVault}
              className="px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'تفعيل تشفير KMS و Vault' : 'Enable KMS & Vault'}</span>
            </button>

            <button
              onClick={() => {
                setIsEtcdKmsActive(false);
                setSecrets(getInitialClusterSecrets());
              }}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secrets Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secrets.map((sec) => (
            <div key={sec.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-white">{sec.name}</div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    sec.encryptedAtRest || isEtcdKmsActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {sec.encryptedAtRest || isEtcdKmsActive ? 'KMS Encrypted' : 'Plaintext Base64'}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                {sec.keys.map((k) => (
                  <div key={k.key} className="flex items-center justify-between">
                    <span className="text-slate-400">{k.key}:</span>
                    <span className={k.sensitive ? 'text-amber-400' : 'text-slate-200'}>
                      {showPlaintext || !k.sensitive ? k.valueMasked : '••••••••••••••••'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400">
                Namespace: <span className="text-cyan-400">{sec.namespace}</span> | Vault Managed:{' '}
                <span className={sec.managedByExternalVault ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {sec.managedByExternalVault ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
