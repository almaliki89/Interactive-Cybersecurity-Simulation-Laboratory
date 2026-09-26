/**
 * OMEGA V15 — Artifact Signing & Rekor Transparency Log Lab
 */

import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { Key, ShieldCheck } from 'lucide-react';

export const SoftwareSigningLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
            <Key className="w-4 h-4" />
            <span>{isAr ? 'مختبر التوقيع الرقمي للمخرجات وسجل Rekor' : 'Artifact Signing & Rekor Transparency Log Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white">
            {isAr ? 'توقيع المخرجات البرمجية بدون مفاتيح ثابتة عبر Keyless Cosign' : 'Keyless Cosign & Sigstore Immutable Transparency Audit'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {isAr
              ? 'وقع الحزم والمخرجات باستخدام OIDC Tokens ووثق البصمة في سجل Rekor الموحد.'
              : 'Sign container artifacts using OIDC identity tokens and publish immutable hashes to Rekor.'}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300">
          Rekor Transparency Entry ID: 24296fb24d10123... (OIDC Verified: builder@nexora.internal)
        </div>
      </div>
    </div>
  );
};
