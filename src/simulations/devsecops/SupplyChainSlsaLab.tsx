/**
 * OMEGA V15 — SLSA Provenance & Supply Chain Attestation Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialSlsaAttestation } from './logic/sbom';
import { SlsaAttestation } from './logic/types';
import { ShieldCheck, Lock, RefreshCw, Key, CheckCircle2 } from 'lucide-react';

export const SupplyChainSlsaLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [attestation, setAttestation] = useState<SlsaAttestation>(getInitialSlsaAttestation());

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'مختبر إثبات أصل المخرجات وتوثيق SLSA' : 'SLSA Build Provenance & Attestation Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'التوثيق الرقمي لسلسلة التوريد (SLSA Level 3 & Cosign)' : 'SLSA Level 3 Build Provenance & Rekor Log Validation'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'تحقق من صحة توثيق أصل المخرجات البرمجية لمنع هجمات حقن الشفرات أثناء عملية البناء.'
                : 'Validate cryptographic build material hashes, isolated runners, and Rekor transparency logs.'}
            </p>
          </div>

          <button
            onClick={() => setAttestation(getInitialSlsaAttestation())}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* SLSA Level Badge & Details */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'حالة توثيق أصل المخرجات (Provenance Attestation):' : 'Build Attestation Provenance Status:'}
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SLSA Level {attestation.slsaLevel} Certified
            </span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Builder Identity:</span>
              <span className="text-cyan-400 font-bold">{attestation.builderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Provenance Type:</span>
              <span className="text-purple-300">{attestation.buildType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Rekor Transparency Log:</span>
              <span className="text-emerald-400 font-bold">
                {attestation.isSignedRekorLog ? 'Signed & Logged' : 'Unsigned'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
