/**
 * OMEGA V15.1 — DevSecOps & Software Supply Chain Master Challenge
 * Flagship interactive enterprise CI/CD pipeline defense challenge driven entirely by the unified Master State.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { validateDevSecOpsMasterChallenge, evaluateDevSecOpsPipeline, validateSbom, validateBuildProvenance, verifyArtifactIntegrity } from './logic/masterState';
import { devSecOpsEventBridge } from './runtime/DevSecOpsEventBridge';
import { Terminal, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Trophy, Sparkles, AlertCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DevSecOpsMasterChallenge: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const isAr = language === 'ar';

  const masterState = useDevSecOpsStore((s) => s.masterState);
  const setMasterState = useDevSecOpsStore((s) => s.setMasterState);
  const resetMasterState = useDevSecOpsStore((s) => s.resetMasterState);

  const [tested, setTested] = useState<boolean>(false);

  // Run comprehensive master validation directly on live state
  const evaluation = validateDevSecOpsMasterChallenge(masterState);

  const runChallengeVerification = () => {
    setTested(true);

    if (evaluation.isPassed) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });

      // Emit OMEGA DevSecOps Deployment Approved & Pipeline Passed events
      devSecOpsEventBridge.emitEvent({
        id: `devsecops-master-pipeline-passed-${virtualTime}`,
        eventType: 'DEVSECOPS_DEPLOYMENT_APPROVED',
        virtualTime,
        repository: 'github.com/nexora/enterprise-platform',
        severity: 'info',
        outcome: 'SUCCESS',
        attributes: {
          status: 'MASTER_CHALLENGE_SOLVED',
          score: 100,
          actor: 'ci-cd-runner'
        },
      });
    } else {
      // Emit blocked telemetry event
      devSecOpsEventBridge.emitEvent({
        id: `devsecops-master-pipeline-blocked-${virtualTime}`,
        eventType: 'DEVSECOPS_PIPELINE_BLOCKED',
        virtualTime,
        repository: 'github.com/nexora/enterprise-platform',
        severity: 'critical',
        outcome: 'DENIED',
        attributes: {
          blockedReasons: evaluation.failedChecks,
          actor: 'ci-cd-runner'
        },
      });
    }
  };

  // Diagnostic flags derived from current state to render checklist colors dynamically
  const sastRemediated = masterState.sastFindings.filter(f => !f.remediated && (f.severity === 'CRITICAL' || f.severity === 'HIGH')).length === 0;
  const scaRemediated = masterState.dependencies.filter(d => !d.remediated && (d.severity === 'CRITICAL' || d.severity === 'HIGH' || d.isTyposquatting || !d.licenseCompliant)).length === 0;
  const secretsRemediated = masterState.secretMatches.filter(s => !s.remediated).length === 0;
  const tfRemediated = masterState.terraformResources.filter(r => !r.remediated && r.hasMisconfiguration).length === 0;
  
  const config = masterState.pipelineConfig;
  const gatesEnforced = !!(config.requireSastGate && config.requireScaGate && config.requireSecretScanGate && config.requireIacScanGate && config.requireContainerScanGate && config.requireCosignSignatureGate && !config.allowBypassOnFailure);
  
  const sbomResult = validateSbom(masterState.sbomComponents, masterState.artifactState);
  const provResult = validateBuildProvenance(masterState.slsaAttestation, masterState.artifactState);
  
  const container = masterState.containerImages[0];
  const containerValid = !!(container &&
    container.vulnerabilitiesCount === 0 &&
    container.signed &&
    container.trustedRegistry &&
    container.embeddedSecretsCount === 0 &&
    container.tag !== 'latest' &&
    container.digest !== '' &&
    container.sbomVerified);

  const sbomPassed = sbomResult.valid;
  const slsaPassed = provResult.verified;

  const signatureState = masterState.signatures[0];
  const integrityResult = verifyArtifactIntegrity(masterState.artifactState, signatureState, masterState.slsaAttestation);
  const signingPassed = integrityResult.verified;

  const driftRemediated = masterState.driftFindings.filter(d => !d.autoRemediated).length === 0;

  const compliancePassed = masterState.complianceState.failedControls.length === 0 &&
    masterState.complianceState.pciDssCompliant &&
    masterState.complianceState.soc2Compliant;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Challenge Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-slate-950">
                  {isAr ? 'التحدي النهائي الشامل' : 'Flagship Master Challenge'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  World 22
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">
                {isAr ? 'تحدي تحصين خطوط الإنتاج البرمجي وDevSecOps (Nexora CI/CD Master)' : 'Nexora DevSecOps Pipeline & Supply Chain Master Defense'}
              </h1>
              <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                {isAr
                  ? 'قم بحل الثغرات وتطبيق التحصينات في مختبراتها المخصصة لإتمام تدقيق خط الإنتاج واعتماده أمنياً بنسبة ١٠٠٪.'
                  : 'Enforce all 11 core DevSecOps requirements across laboratories to pass secure release audits.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">{isAr ? 'الإنجاز الدفاعي' : 'Defense Score'}</div>
                <div
                  className={`text-3xl font-black ${
                    evaluation.score === 100
                      ? 'text-emerald-400'
                      : evaluation.score >= 60
                      ? 'text-purple-400'
                      : 'text-amber-400'
                  }`}
                >
                  {evaluation.score}%
                </div>
              </div>

              <button
                onClick={() => {
                  resetMasterState();
                  setTested(false);
                }}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Master Challenge Tasks Checklist */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'التحصينات والضوابط الأحد عشر للتحدي الشامل:' : 'Required Hardening Criteria Checklist (11 Gates):'}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              {
                titleAr: '1. إصلاح ثغرات الكود المصدري (SQLi & XSS) والتحقق عبر Semgrep SAST',
                titleEn: '1. Remediate SAST Source Code Vulnerabilities (SQLi & Stored XSS)',
                val: sastRemediated,
                lab: 'sast'
              },
              {
                titleAr: '2. تحديث التبعيات البرمجية وإزالة الحزم الخبيثة وترخيص AGPL الوراثي',
                titleEn: '2. Update Vulnerable SCA Packages, Remove Typosquatting Malware & Copyleft Licenses',
                val: scaRemediated,
                lab: 'sca'
              },
              {
                titleAr: '3. تطهير أسرار ومفاتيح API من سجلات Git وتدوير المفاتيح المسربة',
                titleEn: '3. Scrub Hardcoded Credentials from Git Commit History & Rotate Leaked Tokens',
                val: secretsRemediated,
                lab: 'secrets'
              },
              {
                titleAr: '4. إغلاق منافذ SSH المكشوفة (0.0.0.0/0) وتفعيل تشفير S3 KMS في قوالب Terraform',
                titleEn: '4. Harden Terraform IaC: Close 0.0.0.0/0 SSH Ingress & Enforce S3 SSE-KMS',
                val: tfRemediated,
                lab: 'iac'
              },
              {
                titleAr: '5. تحصين وتوقيع صورة الحاوية: إزالة الثغرات وتثبيت البصمة الرقمية للمستودع',
                titleEn: '5. Secure and Sign Container Image: Remove Vulnerabilities & Pin Registry Digest',
                val: containerValid,
                lab: 'containerci'
              },
              {
                titleAr: '6. توليد جرد SBOM مكتمل ومطابق لمواصفات CycloneDX',
                titleEn: '6. Generate Complete & Valid CycloneDX SBOM Declarations',
                val: sbomPassed,
                lab: 'sbom'
              },
              {
                titleAr: '7. التحقق من شهادة المنشأ البرمجي بمستوى SLSA Level 3',
                titleEn: '7. Verify SLSA Level 3 Build Provenance Attestation',
                val: slsaPassed,
                lab: 'slsa'
              },
              {
                titleAr: '8. التحقق من النزاهة الرقمية للأداة وإثبات سجل الشفافية Rekor',
                titleEn: '8. Verify Cryptographic Integrity & Rekor Ledger Transparency Proof',
                val: signingPassed,
                lab: 'signing'
              },
              {
                titleAr: '9. كشف وإعادة مزامنة انحراف البنية التحتية يدوي الصنع تلقائيًا',
                titleEn: '9. Detect & Remediate Cloud Live Infrastructure Configuration Drift',
                val: driftRemediated,
                lab: 'drift'
              },
              {
                titleAr: '10. تدقيق ومطابقة عناصر الامتثال لمعايير PCI-DSS v4.0 و SOC2',
                titleEn: '10. Audit & Align PCI-DSS v4.0 and SOC2 Compliance Controls',
                val: compliancePassed,
                lab: 'compliance'
              },
              {
                titleAr: '11. تفعيل كافة بوابات الفحص الإلزامية في خط CI/CD وحظر التجاوز (Zero Bypass)',
                titleEn: '11. Enforce All Mandatory CI/CD Quality Gates & Set Bypass=False',
                val: gatesEnforced,
                lab: 'gates'
              },
            ].map((task, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  task.val
                    ? 'bg-emerald-950/10 border-emerald-500/30 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      task.val
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {task.val && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold font-sans">{isAr ? task.titleAr : task.titleEn}</span>
                </div>

                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                    task.val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {task.val ? (isAr ? 'سليم' : 'HARDENED') : (isAr ? 'معلق' : 'MISSING')}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={runChallengeVerification}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Trophy className="w-5 h-5" />
            <span>{isAr ? 'التحقق من حل التحدي واعتماد النتيجة تنظيمياً' : 'Verify & Submit Master DevSecOps Challenge'}</span>
          </button>
        </div>

        {/* Evaluation Banner */}
        {tested && (
          <div
            className={`p-6 rounded-2xl border ${
              evaluation.isPassed
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-start gap-3.5 mb-2">
              {evaluation.isPassed ? (
                <Trophy className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-7 h-7 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-lg font-black text-white">
                  {evaluation.isPassed
                    ? isAr
                      ? 'تهانينا! لقد حققت السيطرة الكاملة وحصلت على اعتماد OMEGA لخطوط التجميع وسلاسل التوريد!'
                      : 'Congratulations! You achieved Total Mastery over DevSecOps & Supply Chain Defense!'
                    : isAr
                    ? 'التحدي غير مكتمل! خط البناء لا يزال محظوراً أو تفتقد لمتطلبات النزاهة.'
                    : 'Challenge Blocked: Unresolved build weaknesses or disabled quality gates detected.'}
                </h3>
                
                {evaluation.isPassed ? (
                  <p className="text-xs text-slate-300 leading-relaxed font-mono mt-1">
                    {isAr
                      ? 'تم تفعيل مبادئ Shift-Left بالكامل، وتطهير سجل Git التاريخي، والتحقق التشفيري ومطابقة الـ SLSA.'
                      : 'Zero-trust software delivery achieved: application layer scan, SBOM compliance, keyless signatures, and tamper audits are 100% verified.'}
                  </p>
                ) : (
                  <div className="mt-3 space-y-1.5 border-t border-rose-500/20 pt-2.5">
                    <div className="text-xs font-bold text-slate-200">{isAr ? 'الضوابط الأمنية المعلقة المطلوبة:' : 'Outstanding Security Failures Blocked:'}</div>
                    {evaluation.failedChecks.map((t, idx) => (
                      <div key={idx} className="text-xs text-rose-300 font-mono flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
