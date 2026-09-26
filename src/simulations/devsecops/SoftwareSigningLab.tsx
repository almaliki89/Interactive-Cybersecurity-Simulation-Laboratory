/**
 * OMEGA V15.1 — Artifact Signing, Cryptographic Integrity & Rekor Ledger Lab
 * High-fidelity interactive laboratory simulating keyless Cosign signatures and transparency log audits.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { verifyArtifactIntegrity } from './logic/masterState';
import { Key, ShieldCheck, AlertTriangle, RefreshCw, PenTool, ClipboardCheck, Sparkles, Terminal, ShieldAlert, Sliders } from 'lucide-react';

export const SoftwareSigningLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const masterState = useDevSecOpsStore((s) => s.masterState);
  const setMasterState = useDevSecOpsStore((s) => s.setMasterState);

  const signature = masterState.signatures[0];
  const artifact = masterState.artifactState;
  const slsa = masterState.slsaAttestation;

  const [signingInProcess, setSigningInProcess] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Evaluate cryptographic integrity
  const integrityResult = verifyArtifactIntegrity(artifact, signature, slsa);

  const appendLog = (msg: string) => setLogs((prev) => [...prev, `[sigstore] ${msg}`]);

  const triggerRebuild = () => {
    setMasterState((state) => {
      state.artifactState.tampered = false;
      state.artifactState.digest = 'sha256:d57e1234567890abcdef'; // reset to original good digest
    });
    setLogs([]);
    appendLog('Source build initiated. Cleaning workspace...');
    appendLog('Compiled express, react, and dependencies.');
    appendLog('Generated release artifact: nexora-enterprise-service.');
    appendLog('Hash computed: sha256:d57e1234567890abcdef (Tamper flags cleared).');
  };

  const executeCosignSign = () => {
    setSigningInProcess(true);
    setLogs([]);
    appendLog('Executing Cosign keyless signing flow...');
    
    setTimeout(() => {
      appendLog('Retrieving OIDC Identity Token from GitHub Actions provider...');
      appendLog('OIDC Claims verified: repo:nexora/enterprise-platform, ref:refs/heads/main');
      appendLog('Signer: github.com/nexora/enterprise-platform/.github/workflows/ci-cd-pipeline.yml@refs/heads/main');
      appendLog('Requesting Ephemeral Certificate from Fulcio CA...');
      appendLog('Fulcio issued 10-minute code-signing x509 certificate.');
      appendLog('Publishing signature certificate chain to Rekor Transparency Ledger...');
      
      const newRekorEntry = `rekor-uuid-7711-aa99-ffbb-${Math.random().toString(36).substring(2, 7)}`;
      appendLog(`Rekor transparency log registered. Index: 4429671. Entry UUID: ${newRekorEntry}`);
      appendLog('Signatures generated successfully!');

      setMasterState((state) => {
        state.signatures[0] = {
          artifactName: 'nexora-enterprise-service',
          digest: state.artifactState.digest,
          signed: true,
          signature: `sig-prod-fa88193aa77ff01b${Math.random().toString(36).substring(2, 5)}`,
          signerIdentity: 'github.com/nexora/enterprise-platform/.github/workflows/ci-cd-pipeline.yml@refs/heads/main',
          certificateIssuer: 'https://token.actions.githubusercontent.com',
          rekorEntry: newRekorEntry,
          verified: true
        };
        // also pin the container image signing state to match
        state.containerImages[0].signed = true;
      });
      setSigningInProcess(false);
    }, 1200);
  };

  const auditRekorLedger = () => {
    setMasterState((state) => {
      state.testedArtifactIntegrityPassed = integrityResult.verified;
    });
    appendLog('Initiating Rekor Public Cryptographic Ledger verification...');
    appendLog(`Verifying index UUID: ${signature.rekorEntry || 'N/A'}`);
    appendLog(`Signer Cert Subject Alt Name: ${signature.signerIdentity}`);
    appendLog(`Cryptographic Digest validation: ${signature.digest === artifact.digest ? 'MATCHED' : 'FAILED'}`);
    appendLog(`Verification outcome: ${integrityResult.verified ? 'SECURE' : 'BLOCKED'}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
              <Key className="w-4 h-4" />
              <span>{isAr ? 'مختبر التوقيع الرقمي للمخرجات وسجل Rekor' : 'Artifact Signing & Rekor Transparency Log Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'توقيع المخرجات البرمجية بدون مفاتيح ثابتة عبر Keyless Cosign' : 'Keyless Cosign & Sigstore Immutable Transparency Audit'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'وقع الحزم والمخرجات باستخدام OIDC Tokens ووثق البصمة في سجل Rekor الموحد لتفادي سرقة المفاتيح الثابتة.'
                : 'Sign container artifacts using ephemeral OIDC identity tokens and verify signature ledger proofs via Rekor.'}
            </p>
          </div>

          <button
            onClick={() => {
              setMasterState((state) => {
                state.artifactState.tampered = true;
                state.artifactState.digest = 'sha256:tampered8899aabbccddeeff';
                state.signatures[0].signed = false;
                state.signatures[0].signature = '';
                state.signatures[0].signerIdentity = 'malicious-identity';
                state.signatures[0].verified = false;
                state.containerImages[0].signed = false;
                state.testedArtifactIntegrityPassed = false;
              });
              setLogs([]);
            }}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Tamper alert if tampered */}
        {artifact.tampered && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-rose-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div className="font-bold text-xs text-white">
                  {isAr ? 'إنذار حرج: تم اكتشاف تلاعب في حزمة البناء البرمجية (ARTIFACT TAMPERED)' : 'Critical Warning: Release Artifact Tampering Detected!'}
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {isAr
                    ? 'بصمة البناء الحالية لا تطابق البصمة المستخرجة من الكود الأصلي. قد يكون مهاجم قد استبدل ملف الحاوية.'
                    : 'The built binary hash has been replaced with a malicious digest. A supply chain attacker is hijacking the release pipeline.'}
                </p>
              </div>
            </div>

            <button
              onClick={triggerRebuild}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isAr ? 'إعادة بناء نظيفة' : 'Initiate Secure Rebuild'}
            </button>
          </div>
        )}

        {/* Cryptographic Integrity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left panel: Build Artifact Metadata and Signing console */}
          <div className="md:col-span-5 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'توقيع وبناء المخرجات البرمجية:' : 'Artifact & Ephemeral Certificates:'}</span>
            </h2>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-400">Artifact: <span className="text-white font-bold">{artifact.artifactName}</span></div>
                <div className="text-slate-400">Digest: <span className={artifact.tampered ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{artifact.digest}</span></div>
                <div className="text-slate-400">Size: <span className="text-white">{(artifact.sizeBytes / 1024 / 1024).toFixed(2)} MB</span></div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'حالة التوقيع الرقمي (Cosign):' : 'Cosign Status:'}</div>
                <div className="flex items-center justify-between">
                  <span>Signed Keylessly:</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold ${signature.signed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                    {signature.signed ? 'YES' : 'NO'}
                  </span>
                </div>
                {signature.signed && (
                  <div className="space-y-1 pt-1.5 border-t border-slate-900 text-[10px] text-slate-400">
                    <div>Signer OIDC ID: <span className="text-white">{signature.signerIdentity}</span></div>
                    <div>Fulcio Issuer: <span className="text-white">{signature.certificateIssuer}</span></div>
                    <div>Rekor Log UUID: <span className="text-white">{signature.rekorEntry}</span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={artifact.tampered || signature.signed || signingInProcess}
                onClick={executeCosignSign}
                className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{signingInProcess ? (isAr ? 'جاري التوقيع...' : 'Signing...') : (isAr ? 'توقيع المخرجات (Keyless)' : 'Sign Keylessly (Fulcio CA)')}</span>
              </button>

              <button
                disabled={!signature.signed}
                onClick={auditRekorLedger}
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:text-slate-600 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right panel: Terminal logs and cryptographic verification diagnostic checklist */}
          <div className="md:col-span-7 space-y-4">
            {/* Terminal logs */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>{isAr ? 'مخرجات أداة sigstore / Cosign:' : 'Sigstore CLI Sandbox Output:'}</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-900 font-mono text-[10px] h-32 overflow-y-auto space-y-1">
                {logs.length === 0 && <span className="text-slate-500">// Run "Sign Keylessly" or "Verify Signature" to view debug output</span>}
                {logs.map((lg, idx) => (
                  <div key={idx} className="text-cyan-400/90">{lg}</div>
                ))}
              </div>
            </div>

            {/* Diagnostic checklist */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isAr ? 'تدقيق مطابقة بصمة التوقيع والشفافية:' : 'Cryptographic Integrity Verification Checklist:'}
                </h3>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                    integrityResult.verified
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {integrityResult.verified ? (isAr ? 'سليم وموثق' : 'VERIFIED') : (isAr ? 'مرفوض' : 'UNTRUSTED')}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {[
                  {
                    labelAr: 'مطابقة بصمة المخرج مع البصمة الموقعة',
                    labelEn: 'Artifact Cryptographic Digest Matches Signature',
                    val: integrityResult.digestMatched,
                  },
                  {
                    labelAr: 'توقيع Cosign صالح ومثبت تشفيريًا',
                    labelEn: 'Cosign Signature Valid & signed=true',
                    val: integrityResult.signatureValid,
                  },
                  {
                    labelAr: 'هوية باني برمجيات OIDC معتمدة',
                    labelEn: 'Fulcio CA Subject Alt Name matches GitHub Action Issuer',
                    val: integrityResult.signerTrusted,
                  },
                  {
                    labelAr: 'إدراج شهادة المنشأ في سجل الشفافية Rekor',
                    labelEn: 'Rekor Transparency Log Ledger Evidence Verified',
                    val: integrityResult.transparencyVerified,
                  },
                ].map((chk, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/80">
                    <span className="text-slate-300">{isAr ? chk.labelAr : chk.labelEn}</span>
                    <span className={`font-bold ${chk.val ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {chk.val ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
