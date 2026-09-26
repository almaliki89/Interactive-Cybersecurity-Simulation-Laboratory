/**
 * OMEGA V14 — Service Mesh mTLS & Cryptographic Workload Identity Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { Share2, Lock, ShieldCheck, RefreshCw, Key } from 'lucide-react';

export const ServiceMeshMtlsLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [mTLSEnabled, setMTLSEnabled] = useState<boolean>(true);
  const [spiffeAuthActive, setSpiffeAuthActive] = useState<boolean>(true);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-1">
              <Share2 className="w-4 h-4" />
              <span>{isAr ? 'مختبر شبكة الخدمات والتشفير المتبادل' : 'Service Mesh mTLS & Identity Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'التشفير المتبادل mTLS وهوية أعباء العمل (SPIFFE / Istio)' : 'Mutual TLS & SPIFFE Workload Cryptographic Identity'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'استكشف التشفير المتبادل التلقائي بين الخدمات، وتدقيق شهادات X.509 SVID الصادرة عن SPIRE.'
                : 'Inspect automatic pod-to-pod mTLS encryption and SPIFFE X.509 SVID certificate validation.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setMTLSEnabled(true);
                setSpiffeAuthActive(true);
              }}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mesh Topology Visualizer */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isAr ? 'حالة التشفير والهوية بين الخدمات:' : 'Service Mesh Link Security Status:'}
            </div>
            <button
              onClick={() => setMTLSEnabled(!mTLSEnabled)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mTLSEnabled
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-rose-500 text-slate-950 hover:bg-rose-400'
              }`}
            >
              {mTLSEnabled ? (isAr ? 'mTLS: مشفر (Strict)' : 'mTLS: Strict (Active)') : (isAr ? 'mTLS: معطل (Plaintext)' : 'mTLS: Permissive (Plaintext)')}
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-cyan-400 font-bold">frontend-service</span>
              <span className={mTLSEnabled ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {mTLSEnabled ? '⟵ TLS 1.3 AES-256-GCM (mTLS) ⟶' : '⟵ Unencrypted HTTP (Plaintext) ⟶'}
              </span>
              <span className="text-blue-400 font-bold">backend-api</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>
                <span className="text-slate-500">SPIFFE ID: </span>
                <span className="text-sky-300">spiffe://cluster.nexora.internal/ns/production/sa/frontend-sa</span>
              </div>
              <div>
                <span className="text-slate-500">Cert Authority: </span>
                <span className="text-purple-300">Istio Citadel / SPIRE Root CA (Auto-rotated every 12h)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
