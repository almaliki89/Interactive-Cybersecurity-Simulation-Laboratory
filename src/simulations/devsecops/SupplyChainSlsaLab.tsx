/**
 * OMEGA V15.1 — SLSA Provenance & Supply Chain Attestation Lab
 * High-fidelity interactive laboratory simulating SLSA Level 3 build provenance audits and material checks.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { validateBuildProvenance } from './logic/masterState';
import { ShieldCheck, Lock, RefreshCw, Key, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Award } from 'lucide-react';

export const SupplyChainSlsaLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const masterState = useDevSecOpsStore((s) => s.masterState);
  const setMasterState = useDevSecOpsStore((s) => s.setMasterState);

  const attestation = masterState.slsaAttestation;
  const artifact = masterState.artifactState;

  const [auditing, setAuditing] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Validate build provenance
  const provResult = validateBuildProvenance(attestation, artifact);

  const appendLog = (msg: string) => setLogs((prev) => [...prev, `[slsa-audit] ${msg}`]);

  const hardenProvenanceAndMaterials = () => {
    setLogs([]);
    appendLog('Harden and lock build pipeline environments...');
    appendLog('Assigned trusted runner instance: https://github.com/actions/runner');
    appendLog('Setting source materials to canonical repo origin...');
    appendLog('Binding build trigger commit: sha256:7f9a28b61a3d90fcb3b811883b276709...');
    appendLog('Enrolling workflow recipe: https://slsa.dev/provenance/v1');
    appendLog('Generating SLSA Level 3 cryptographic attestation signature...');
    appendLog('Enrolled attestation certificate chain to Sigstore Rekor transparency log...');

    setMasterState((state) => {
      state.slsaAttestation = {
        slsaLevel: 3,
        builderId: 'https://github.com/actions/runner',
        buildType: 'https://slsa.dev/provenance/v1',
        materials: [
          { uri: 'git+https://github.com/nexora/enterprise-platform', digest: 'sha256:7f9a28b61a3d90fcb3b811883b276709...' }
        ],
        isSignedRekorLog: true,
        verified: true
      };
    });
  };

  const executeProvenanceAudit = () => {
    setAuditing(true);
    setLogs([]);
    appendLog('Querying SLSA build provenance json payload...');
    
    setTimeout(() => {
      appendLog(`Checking Builder Host Identity: ${attestation.builderId}`);
      appendLog(`Checking Source Repository URI: ${attestation.materials[0]?.uri || 'N/A'}`);
      appendLog(`Checking SLSA compliance Level: Level ${attestation.slsaLevel}`);
      appendLog(`Verifying digital signature of attestation: ${attestation.verified ? 'PASSED' : 'FAILED'}`);
      appendLog(`Verifying ledger entry proof: ${attestation.isSignedRekorLog ? 'FOUND' : 'MISSING'}`);

      setMasterState((state) => {
        state.testedProvenancePassed = provResult.verified;
      });
      setAuditing(false);
    }, 800);
  };

  const resetProvenance = () => {
    setMasterState((state) => {
      state.slsaAttestation = {
        slsaLevel: 1,
        builderId: 'https://github.com/untrusted/builder',
        buildType: 'https://slsa.dev/provenance/v0.1',
        materials: [
          { uri: 'git+https://github.com/hacker/fake-platform', digest: 'sha256:000000...' }
        ],
        isSignedRekorLog: false,
        verified: false
      };
      state.testedProvenancePassed = false;
    });
    setLogs([]);
  };

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
                ? 'تحقق من صحة توثيق أصل المخرجات البرمجية وتعديل شهادة المنشأ لمنع هجمات حقن الأكواد الخبيثة.'
                : 'Validate cryptographic build material hashes, isolated runner identities, and Rekor transparency logs.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!provResult.verified && (
              <button
                onClick={hardenProvenanceAndMaterials}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isAr ? 'ترقية وحماية شهادة المنشأ' : 'Harden to SLSA Level 3'}</span>
              </button>
            )}

            <button
              onClick={resetProvenance}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Provenance Audit Status Banner */}
        <div
          className={`p-4.5 rounded-xl border flex items-center justify-between ${
            provResult.verified
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {provResult.verified ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-white">
                {provResult.verified
                  ? isAr
                    ? 'شهادة منشأ برمجية معتمدة وموثوقة (SLSA VERIFIED)'
                    : 'SLSA Level 3 Provenance Verified'
                  : isAr
                  ? 'شهادة المنشأ مفقودة أو غير متطابقة (PROVENANCE MISMATCH)'
                  : 'Build Provenance Verification Failed: Untrusted environment details detected!'}
              </div>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                {isAr ? provResult.reasonAr : provResult.reasonEn}
              </p>
            </div>
          </div>
        </div>

        {/* Audit Details Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Metadata Ledger */}
          <div className="md:col-span-5 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'سجل شهادة المنشأ الحالية (SLSA Attestation):' : 'SLSA Attestation Payload:'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${attestation.slsaLevel >= 3 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                SLSA Level {attestation.slsaLevel}
              </span>
            </div>

            <div className="space-y-3 font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-900 leading-relaxed">
              <div>
                <span className="text-slate-500">_type:</span> <span className="text-white">"https://in-toto.io/Statement/v1"</span>
              </div>
              <div>
                <span className="text-slate-500">subject.digest:</span> <span className="text-white">"{artifact.digest || 'N/A'}"</span>
              </div>
              <div>
                <span className="text-slate-500">builder.id:</span> <span className={provResult.builderTrusted ? 'text-emerald-400' : 'text-rose-400'}>"{attestation.builderId}"</span>
              </div>
              <div>
                <span className="text-slate-500">recipe.type:</span> <span className="text-purple-400">"{attestation.buildType}"</span>
              </div>
              <div>
                <span className="text-slate-500">materials[0].uri:</span> <span className={provResult.repositoryMatched ? 'text-emerald-400' : 'text-rose-400'}>"{attestation.materials[0]?.uri || 'N/A'}"</span>
              </div>
              <div>
                <span className="text-slate-500">signature.verified:</span> <span className={attestation.verified ? 'text-emerald-400' : 'text-rose-400'}>{attestation.verified ? 'true' : 'false'}</span>
              </div>
              <div>
                <span className="text-slate-500">rekorLog.signed:</span> <span className={attestation.isSignedRekorLog ? 'text-emerald-400' : 'text-rose-400'}>{attestation.isSignedRekorLog ? 'true' : 'false'}</span>
              </div>
            </div>

            <button
              onClick={executeProvenanceAudit}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{auditing ? (isAr ? 'جاري التحقق...' : 'Auditing...') : (isAr ? 'تشغيل تدقيق المنشأ' : 'Audit Provenance Payload')}</span>
            </button>
          </div>

          {/* Verification Diagnostics */}
          <div className="md:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'تشخيصات أخطاء المنشأ (Mismatches detected):' : 'Provenance Field Check Diagnostics:'}</span>
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              {[
                {
                  labelAr: 'التحقق من هوية الباني (Isolated Build Host)',
                  labelEn: 'Trusted Builder ID (GHA Runner)',
                  val: provResult.builderTrusted,
                  desc: 'Ensures the compilation host was not an untrusted or compromised server.'
                },
                {
                  labelAr: 'مطابقة مستودع الكود المصدر (Source Repository)',
                  labelEn: 'Source Repository URI matches origin',
                  val: provResult.repositoryMatched,
                  desc: 'Detects code injections compiled from third-party attacker forks.'
                },
                {
                  labelAr: 'التحقق من بصمة التجميع SHA (Commit Match)',
                  labelEn: 'Commit SHA binds with materials',
                  val: provResult.commitMatched,
                  desc: 'Ensures that what is inside the release artifact matches the Git revision.'
                },
                {
                  labelAr: 'مطابقة بصمة المخرج مع شهادة المنشأ (Digest Match)',
                  labelEn: 'Artifact Digest binds with attestation',
                  val: provResult.digestMatched,
                  desc: 'Validates that the final compiled binary hash matches the provenance Statement.'
                },
                {
                  labelAr: 'إمضاء شهادة المنشأ التشفيري (Cosign Signed)',
                  labelEn: 'Provenance Attestation Signature Verified',
                  val: provResult.signatureValid,
                  desc: 'Ensures the attestation is cryptographically signed by the pipeline CA.'
                },
                {
                  labelAr: 'توفر مستوى حماية SLSA Level 3 المعتمد',
                  labelEn: 'SLSA Safety Level is sufficient (>= 3)',
                  val: provResult.slsaLevelSufficient,
                  desc: 'Requires multi-factor build orchestration, isolated VM runner environments, and zero manual interventions.'
                }
              ].map((diag, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-300">{isAr ? diag.labelAr : diag.labelEn}</div>
                    <p className="text-[10px] text-slate-500 font-sans leading-relaxed">{diag.desc}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 text-center ${diag.val ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                    {diag.val ? 'TRUSTED' : 'MISMATCH'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
