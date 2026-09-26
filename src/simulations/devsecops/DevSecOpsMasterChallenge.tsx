/**
 * OMEGA V15 — DevSecOps & Software Supply Chain Master Challenge
 * Flagship interactive enterprise CI/CD pipeline defense challenge with strict Anti-Cheat validation.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialDevSecOpsAntiCheatFlags, evaluateDevSecOpsMasterChallenge } from './logic/antiCheat';
import { DevSecOpsAntiCheatFlags } from './logic/types';
import { devSecOpsEventBridge } from './runtime/DevSecOpsEventBridge';
import { Terminal, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DevSecOpsMasterChallenge: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const isAr = language === 'ar';

  const [flags, setFlags] = useState<DevSecOpsAntiCheatFlags>(getInitialDevSecOpsAntiCheatFlags());
  const [tested, setTested] = useState<boolean>(false);

  const toggleFlag = (key: keyof DevSecOpsAntiCheatFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const evaluation = evaluateDevSecOpsMasterChallenge(flags);

  const runChallengeVerification = () => {
    setTested(true);

    if (evaluation.isMastered) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      devSecOpsEventBridge.emitEvent({
        id: `devsecops-master-challenge-completed-${virtualTime}`,
        eventType: 'PIPELINE_GATE_TRIGGERED',
        virtualTime,
        repository: 'github.com/nexora/enterprise-platform',
        severity: 'info',
        outcome: 'SUCCESS',
        attributes: {
          status: 'MASTER_CHALLENGE_SOLVED',
          score: 100,
        },
      });
    }
  };

  const completeAllDefenses = () => {
    setFlags({
      sastVulnerabilitiesFixed: true,
      scaPackagesUpdatedAndLicensesVerified: true,
      hardcodedSecretsScrubbedFromGitHistory: true,
      terraformTemplatesHardenedAndOpenPortsClosed: true,
      ciSecurityGatesEnforcedWithZeroBypass: true,
      sbomGeneratedAndSlsaAttested: true,
      infrastructureDriftRemediated: true,
    });
  };

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
                  ? 'قم بتنفيذ وتطبيق كافة الضوابط الدفاعية السبعة لتحصين خطوط البناء وسلاسل التوريد ضد هجمات تسريب الأسرار والبرمجيات الخبيثة.'
                  : 'Enforce all 7 core DevSecOps defensive controls to harden CI/CD pipelines against supply chain attacks.'}
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
                  setFlags(getInitialDevSecOpsAntiCheatFlags());
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
              {isAr ? 'المهام الدفاعية السبعة المطلوبة:' : 'The 7 Mandatory DevSecOps Criteria:'}
            </h2>

            <button
              onClick={completeAllDefenses}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              {isAr ? 'تطبيق كافة التحصينات دفعة واحدة' : 'Apply All DevSecOps Toggles'}
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                key: 'sastVulnerabilitiesFixed',
                titleAr: '1. إصلاح ثغرات الكود المصدري (SQLi & XSS) والتحقق عبر Semgrep SAST',
                titleEn: '1. Remediate SAST Source Code Vulnerabilities (SQLi & Stored XSS)',
                val: flags.sastVulnerabilitiesFixed,
              },
              {
                key: 'scaPackagesUpdatedAndLicensesVerified',
                titleAr: '2. تحديث التبعيات البرمجية وإزالة الحزم الخبيثة وترخيص AGPL الوراثي',
                titleEn: '2. Update Vulnerable SCA Packages, Remove Typosquatting Malware & Copyleft Licenses',
                val: flags.scaPackagesUpdatedAndLicensesVerified,
              },
              {
                key: 'hardcodedSecretsScrubbedFromGitHistory',
                titleAr: '3. تطهير أسرار ومفاتيح API من سجلات Git وتدوير المفاتيح المسربة',
                titleEn: '3. Scrub Hardcoded Credentials from Git Commit History & Rotate Leaked Tokens',
                val: flags.hardcodedSecretsScrubbedFromGitHistory,
              },
              {
                key: 'terraformTemplatesHardenedAndOpenPortsClosed',
                titleAr: '4. إغلاق منافذ SSH المكشوفة (0.0.0.0/0) وتفعيل تشفير S3 KMS في قوالب Terraform',
                titleEn: '4. Harden Terraform IaC: Close 0.0.0.0/0 SSH Ingress & Enforce S3 SSE-KMS',
                val: flags.terraformTemplatesHardenedAndOpenPortsClosed,
              },
              {
                key: 'ciSecurityGatesEnforcedWithZeroBypass',
                titleAr: '5. تفعيل بوابات الفحص الإلزامية في خط CI/CD وحظر التجاوز عند الفشل',
                titleEn: '5. Enforce Mandatory CI/CD Security Quality Gates with Zero Bypass',
                val: flags.ciSecurityGatesEnforcedWithZeroBypass,
              },
              {
                key: 'sbomGeneratedAndSlsaAttested',
                titleAr: '6. توليد جرد SBOM بصيغة CycloneDX والتحقق من شهادة SLSA Level 3 Provenance',
                titleEn: '6. Generate CycloneDX SBOM Inventory & Verify SLSA Level 3 Provenance',
                val: flags.sbomGeneratedAndSlsaAttested,
              },
              {
                key: 'infrastructureDriftRemediated',
                titleAr: '7. اكتشاف وإعادة مزامنة انحراف البنية التحتية (Infrastructure Drift)',
                titleEn: '7. Auto-Remediate Out-of-Band Cloud Infrastructure Drift vs Terraform State',
                val: flags.infrastructureDriftRemediated,
              },
            ].map((task) => (
              <div
                key={task.key}
                onClick={() => toggleFlag(task.key as keyof DevSecOpsAntiCheatFlags)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                  task.val
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
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
                  <span className="text-xs font-bold">{isAr ? task.titleAr : task.titleEn}</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    task.val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {task.val ? (isAr ? 'مطبق ومحصن' : 'Hardened') : (isAr ? 'غير مطبق' : 'Missing')}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={runChallengeVerification}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Trophy className="w-5 h-5" />
            <span>{isAr ? 'التحقق من حل التحدي واعتماد النتيجة' : 'Verify & Submit Master DevSecOps Challenge'}</span>
          </button>
        </div>

        {/* Evaluation Banner */}
        {tested && (
          <div
            className={`p-6 rounded-2xl border ${
              evaluation.isMastered
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {evaluation.isMastered ? (
                <Trophy className="w-7 h-7 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-rose-400" />
              )}
              <h3 className="text-lg font-black text-white">
                {evaluation.isMastered
                  ? isAr
                    ? 'تهانينا! لقد حققت السيطرة الكاملة وتحصين خطوط DevSecOps وسلاسل التوريد!'
                    : 'Congratulations! You achieved Total Mastery over DevSecOps & Supply Chain Defense!'
                  : isAr
                  ? `التحدي غير مكتمل بعد (${evaluation.completedTasks} من ${evaluation.totalTasks})`
                  : `Challenge Incomplete (${evaluation.completedTasks} of ${evaluation.totalTasks} tasks fulfilled)`}
              </h3>
            </div>

            {evaluation.isMastered ? (
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {isAr
                  ? 'تم تطبيق مبادئ Shift-Left، وتطهير الأسرار، وتأمين قوالب IaC، وتوليد قائمة SBOM الموحدة بنجاح تام.'
                  : 'Full Shift-Left security enforced: SAST clean, SCA updated, secrets scrubbed, IaC hardened, and SLSA provenance verified.'}
              </p>
            ) : (
              <div className="mt-3 space-y-1">
                <div className="text-xs font-bold text-slate-300">{isAr ? 'المهام المتبقية:' : 'Remaining tasks:'}</div>
                {evaluation.remainingTasksAr.map((t, idx) => (
                  <div key={idx} className="text-xs text-rose-300 font-mono">
                    • {isAr ? t : evaluation.remainingTasksEn[idx]}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
