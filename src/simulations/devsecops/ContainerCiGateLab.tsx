/**
 * OMEGA V15.1 — CI Container Build Scanner (Trivy) Lab
 * High-fidelity interactive container image auditor simulating build-time CVE scanning and secure tag/digest pinning.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { Lock, ShieldCheck, AlertTriangle, RefreshCw, Cpu, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';

export const ContainerCiGateLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const masterState = useDevSecOpsStore((s) => s.masterState);
  const setMasterState = useDevSecOpsStore((s) => s.setMasterState);

  const container = masterState.containerImages[0];
  const sbomComplete = masterState.sbomComponents.length >= 3;

  const [scanning, setScanning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Check if container image has unresolved weaknesses
  const hasLatestTag = container.tag === 'latest';
  const hasUnpinnedDigest = !container.digest;
  const hasActiveVulns = container.vulnerabilitiesCount > 0;
  const hasUntrustedRegistry = !container.trustedRegistry;
  const hasEmbeddedSecrets = container.embeddedSecretsCount > 0;
  const missingSbom = !container.sbomVerified;

  const passesCiGate = !hasLatestTag && !hasUnpinnedDigest && !hasActiveVulns && !hasUntrustedRegistry && !hasEmbeddedSecrets && !missingSbom;

  const appendLog = (msg: string) => setLogs((prev) => [...prev, `[trivy] ${msg}`]);

  const hardenContainerImage = () => {
    setLogs([]);
    appendLog('Locking Dockerfile configuration baseline...');
    appendLog('Assigning trusted registry prefix: gcr.io/nexora-corp/...');
    appendLog('Setting production tag: v1.4.2 (Non-latest tag verified)');
    appendLog('Pinning container registry digest: sha256:d57e1234567890abcdef...');
    appendLog('Removing embedded .env files from Docker layers...');
    appendLog('Switching base image to minimal distroless-debian12...');
    appendLog('Running container OS security scan...');

    setMasterState((state) => {
      state.containerImages[0] = {
        imageName: 'nexora-enterprise-service',
        tag: 'v1.4.2',
        digest: 'sha256:d57e1234567890abcdef',
        vulnerabilitiesCount: 0,
        signed: state.signatures[0].signed,
        trustedRegistry: true,
        embeddedSecretsCount: 0,
        sbomVerified: sbomComplete,
        hasCriticalVulns: false
      };
    });
  };

  const executeTrivyScan = () => {
    setScanning(true);
    setLogs([]);
    appendLog('Scanning container filesystem and docker layers with Trivy...');

    setTimeout(() => {
      appendLog(`Image: gcr.io/nexora-corp/nexora-enterprise-service:${container.tag}`);
      appendLog(`Resolved Pinned Digest: ${container.digest || 'UNPINNED (latest tags vulnerable to drift!)'}`);
      appendLog(`Registry validation: ${container.trustedRegistry ? 'TRUSTED REGISTRY (gcr.io)' : 'UNTRUSTED PUBLIC HOBBY HOST'}`);
      appendLog(`Embedded Secrets matched: ${container.embeddedSecretsCount}`);
      appendLog(`Vulnerabilities (CVEs) found: ${container.vulnerabilitiesCount} (0 Critical, 0 High)`);
      appendLog(`SBOM verification status: ${container.sbomVerified ? 'VERIFIED' : 'MISSING (CycloneDX graph incomplete)'}`);
      appendLog(`Scan result: ${passesCiGate ? 'PASSED (Exit Code: 0)' : 'FAILED (Exit Code: 1 on critical security findings)'}`);

      setScanning(false);
    }, 850);
  };

  const resetContainer = () => {
    setMasterState((state) => {
      state.containerImages[0] = {
        imageName: 'nexora-enterprise-service',
        tag: 'latest',
        digest: '',
        vulnerabilitiesCount: 14,
        signed: false,
        trustedRegistry: false,
        embeddedSecretsCount: 1,
        sbomVerified: false,
        hasCriticalVulns: true
      };
    });
    setLogs([]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
              <Lock className="w-4 h-4" />
              <span>{isAr ? 'مختبر فحص الحاويات أثناء البناء' : 'CI Container Build Scanner (Trivy) Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'دمج فحص Trivy في خطوط CI/CD وحظر الصور الضارة' : 'Build-Time Container CVE Gates & Immutable Tags'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'افحص صور الحاويات أثناء مرحلة البناء وامنع رفع الأجزاء التي تحتوي ثغرات حرجة أو تستخدم علامات غير موثوقة.'
                : 'Enforce Trivy build-time vulnerability scanners before pushing OCI image tags to production registries.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!passesCiGate && (
              <button
                onClick={hardenContainerImage}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحصين وضبط علامات الحاوية' : 'Harden Container Config'}</span>
              </button>
            )}

            <button
              onClick={resetContainer}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Container CI Gate Audit Status Banner */}
        <div
          className={`p-4.5 rounded-xl border flex items-center justify-between ${
            passesCiGate
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {passesCiGate ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-white">
                {passesCiGate
                  ? isAr
                    ? 'بوابة الحاويات آمنة وجاهزة للنشر (CONTAINER CI GATE PASSED)'
                    : 'Trivy Build-Time Container Scan Verified'
                  : isAr
                  ? 'تم حظر حاوية البناء لوجود ثغرات أو إعدادات غير آمنة (CI GATE BLOCKED)'
                  : 'Container CI Gate Blocked: Container image violates security requirements'}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {passesCiGate
                  ? (isAr ? 'تم استبدال علامة latest، وتثبيت البصمات، وإصلاح ثغرات Trivy بنجاح.' : 'Minimal distroless base scanned clean. Zero critical CVEs or hardcoded secrets found.')
                  : (isAr ? 'يجب إصلاح الثغرات، وتجنب استخدام latest، وتجنب رفع حزم غير موقعة أو غير معتمدة.' : 'Action required: Fix active CVE vulnerabilities, remove embedded secrets, pin registry digest, and use non-latest tag.')}
              </p>
            </div>
          </div>
        </div>

        {/* Scan Details split view */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Metadata ledger */}
          <div className="md:col-span-5 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-rose-400" />
              <span>{isAr ? 'مواصفات صورة الحاوية الحالية:' : 'Container Image Specification:'}</span>
            </h3>

            <div className="space-y-3 font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-900 leading-relaxed">
              <div>
                <span className="text-slate-500">Image Name:</span> <span className="text-white">"{container.imageName}"</span>
              </div>
              <div>
                <span className="text-slate-500">Image Tag:</span> <span className={hasLatestTag ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>"{container.tag}"</span>
              </div>
              <div>
                <span className="text-slate-500">Registry Digest:</span> <span className={hasUnpinnedDigest ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>"{container.digest || 'UNPINNED'}"</span>
              </div>
              <div>
                <span className="text-slate-500">Registry Host:</span> <span className={hasUntrustedRegistry ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>"{container.trustedRegistry ? 'gcr.io/nexora-corp' : 'untrusted-public-repo'}"</span>
              </div>
              <div>
                <span className="text-slate-500">Vulnerabilities:</span> <span className={hasActiveVulns ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{container.vulnerabilitiesCount} CVEs active</span>
              </div>
              <div>
                <span className="text-slate-500">Embedded Secrets:</span> <span className={hasEmbeddedSecrets ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{container.embeddedSecretsCount} leaks detected</span>
              </div>
              <div>
                <span className="text-slate-500">SBOM verified:</span> <span className={missingSbom ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{container.sbomVerified ? 'true' : 'false'}</span>
              </div>
            </div>

            <button
              onClick={executeTrivyScan}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Lock className="w-4 h-4" />
              <span>{scanning ? (isAr ? 'جاري الفحص...' : 'Scanning...') : (isAr ? 'تشغيل فحص Trivy' : 'Run Trivy Build Scan')}</span>
            </button>
          </div>

          {/* Verification Diagnostics */}
          <div className="md:col-span-7 space-y-4">
            {/* Terminal logs */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>{isAr ? 'مخرجات أداة Trivy CLI Sandbox:' : 'Trivy CI Scan Sandbox Output:'}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-950 text-[10px] text-rose-300 h-32 overflow-y-auto space-y-1">
                {logs.length === 0 && <span className="text-slate-500">// Run "Run Trivy Build Scan" to inspect container build sandbox</span>}
                {logs.map((lg, idx) => (
                  <div key={idx}>{lg}</div>
                ))}
              </div>
            </div>

            {/* Diagnostic checklist */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 font-mono text-xs">
              {[
                {
                  labelAr: 'تثبيت بصمة إصدار السجل (Pin registry digest)',
                  labelEn: 'Docker Image Registry Digest Pinned',
                  val: !hasUnpinnedDigest
                },
                {
                  labelAr: 'تجنب استخدام أحدث علامة (Avoid latest tag)',
                  labelEn: 'Vulnerability tags are pinned (non-latest)',
                  val: !hasLatestTag
                },
                {
                  labelAr: 'التكامل والتسجيل في قائمة SBOM المستخرجة',
                  labelEn: 'Container SBOM matches cycloneDX manifest',
                  val: !missingSbom
                },
                {
                  labelAr: 'التحقق من خلو الطبقات من الأسرار والملفات الحساسة',
                  labelEn: 'Docker secret scanner: 0 embedded leaks found',
                  val: !hasEmbeddedSecrets
                },
                {
                  labelAr: 'موثوقية السجل المستضيف للحزمة',
                  labelEn: 'Repository matches enterprise trusted domain',
                  val: !hasUntrustedRegistry
                }
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
  );
};
