/**
 * OMEGA V15.1 — CI/CD Automated Security Quality Gates Lab
 * Interactive control room for configuring, simulating, and auditing CI/CD security pipeline gates.
 */

import React, { useEffect } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { evaluateDevSecOpsPipeline } from './logic/masterState';
import { CiCdPipelineConfig } from './logic/types';
import { CheckCircle2, XCircle, ShieldCheck, RefreshCw, Workflow, Sliders, Play, Settings } from 'lucide-react';

export const PipelineGatesLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';

  const masterState = useDevSecOpsStore((s) => s.masterState);
  const setMasterState = useDevSecOpsStore((s) => s.setMasterState);

  const config = masterState.pipelineConfig;
  const pipelineResult = evaluateDevSecOpsPipeline(masterState);

  useEffect(() => {
    registerChallengeValidator('pipeline-gate-challenge', () => {
      const evaluation = evaluateDevSecOpsPipeline(masterState);
      const gatesConfigured = config.requireSastGate && config.requireSecretScanGate && !config.allowBypassOnFailure;
      if (gatesConfigured || evaluation.allowed || masterState.testedPipelinePassed) {
        return { success: true, score: 100, message: 'CI/CD security quality gates active and blocking unverified merges.' };
      }
      return { success: false, score: 0, message: 'Enforce security quality gates in the pipeline.' };
    });
    return () => {
      unregisterChallengeValidator('pipeline-gate-challenge');
    };
  }, [masterState, config]);

  const toggleGate = (key: keyof CiCdPipelineConfig) => {
    if (typeof config[key] === 'boolean') {
      setMasterState((state) => {
        (state.pipelineConfig[key] as any) = !state.pipelineConfig[key];
        const updatedEval = evaluateDevSecOpsPipeline(state);
        if (state.pipelineConfig.requireSastGate && !state.pipelineConfig.allowBypassOnFailure) {
          completeChallenge('pipeline-gate-challenge', {
            success: true,
            score: 100,
            message: 'CI/CD security quality gates active.',
          });
        }
      });
    }
  };

  const forceTriggerBuild = () => {
    // Deterministically runs pipeline checks and prints state log
    setMasterState((state) => {
      const evaluation = evaluateDevSecOpsPipeline(state);
      state.testedPipelinePassed = evaluation.allowed;
      if (evaluation.allowed) {
        completeChallenge('pipeline-gate-challenge', {
          success: true,
          score: 100,
          message: 'CI/CD security quality gates verified.',
        });
      }
    });
  };

  const enableAllGates = () => {
    setMasterState((state) => {
      state.pipelineConfig.requireSastGate = true;
      state.pipelineConfig.requireScaGate = true;
      state.pipelineConfig.requireSecretScanGate = true;
      state.pipelineConfig.requireIacScanGate = true;
      state.pipelineConfig.requireContainerScanGate = true;
      state.pipelineConfig.requireCosignSignatureGate = true;
      state.pipelineConfig.allowBypassOnFailure = false;
      completeChallenge('pipeline-gate-challenge', {
        success: true,
        score: 100,
        message: 'All CI/CD security quality gates enforced successfully.',
      });
    });
  };

  const resetPipelineConfig = () => {
    setMasterState((state) => {
      state.pipelineConfig = {
        id: 'pipe-production-build',
        name: 'Production DevSecOps Deployment Pipeline',
        repository: 'github.com/nexora/enterprise-platform',
        branch: 'main',
        requireSastGate: false,
        requireScaGate: false,
        requireSecretScanGate: false,
        requireIacScanGate: false,
        requireContainerScanGate: false,
        requireCosignSignatureGate: false,
        allowBypassOnFailure: true,
      };
      state.testedPipelinePassed = false;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
              <Workflow className="w-4 h-4" />
              <span>{isAr ? 'مركز قيادة بوابات الحماية (Quality Gates)' : 'DevSecOps Quality Gates Control Panel'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'منع دمج ونشر البرمجيات غير المصرح بها' : 'CI/CD Automated Security Quality Gates'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'تحكم في إعدادات بوابات الفحص الإلزامية لخط البناء (GitHub Actions) واختبر اعتراض البناء الفاشل.'
                : 'Configure pull-request merge blocking quality gates for SAST, SCA, Secrets, IaC, and Signatures.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={enableAllGates}
              className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-black text-xs transition-colors cursor-pointer"
            >
              {isAr ? 'تفعيل كافة الحمايات' : 'Enforce All Gates'}
            </button>
            <button
              onClick={resetPipelineConfig}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pipeline Decision Status Banner */}
        <div
          className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            pipelineResult.allowed
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {pipelineResult.allowed ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-black text-base text-white">
                {pipelineResult.allowed
                  ? isAr
                    ? 'اجتاز خط البناء - مسموح بالنشر والتثبيت (BUILD PASSED & RELEASE AUTHORIZED)'
                    : 'CI/CD Pipeline Safe: Deployment Authorized'
                  : isAr
                  ? 'تم اعتراض خط التجميع وحظر البناء (BUILD INTERCEPTED & BLOCKED)'
                  : 'CI/CD Build Pipeline Failed Quality Gates'}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl font-mono leading-relaxed">
                {isAr ? pipelineResult.reasonAr : pipelineResult.reasonEn}
              </p>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">
                Repository: {config.repository} • Branch: <span className="text-purple-400 font-bold">{config.branch}</span>
              </div>
            </div>
          </div>

          <button
            onClick={forceTriggerBuild}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all ${
              pipelineResult.allowed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isAr ? 'بدء تشغيل خط البناء' : 'Run Pipeline Check'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Quality Gates Toggles Panel */}
          <div className="md:col-span-5 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Settings className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'إعدادات جودة بوابات الأمن:' : 'Security Gate Configurations:'}
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'requireSastGate',
                  labelAr: 'فرض فحص الكود المصدري (SAST)',
                  labelEn: 'Require Semgrep SAST Gate',
                },
                {
                  key: 'requireScaGate',
                  labelAr: 'فرض فحص حزم التبعيات (SCA)',
                  labelEn: 'Require Snyk SCA Gate',
                },
                {
                  key: 'requireSecretScanGate',
                  labelAr: 'فرض فحص الأسرار والتاريخ (Secret Scan)',
                  labelEn: 'Require Secret Scanner Gate',
                },
                {
                  key: 'requireIacScanGate',
                  labelAr: 'فرض فحص كود البنية التحتية (IaC)',
                  labelEn: 'Require Checkov IaC Gate',
                },
                {
                  key: 'requireContainerScanGate',
                  labelAr: 'فرض فحص حاوية Docker',
                  labelEn: 'Require Container Trivy Gate',
                },
                {
                  key: 'requireCosignSignatureGate',
                  labelAr: 'فرض توقيع Cosign وسجل الشفافية',
                  labelEn: 'Require Cosign Signatures Gate',
                },
              ].map((gate) => (
                <div
                  key={gate.key}
                  onClick={() => toggleGate(gate.key as keyof CiCdPipelineConfig)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between select-none ${
                    config[gate.key as keyof CiCdPipelineConfig]
                      ? 'bg-purple-950/20 border-purple-500/40 text-purple-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs">{isAr ? gate.labelAr : gate.labelEn}</span>
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                      config[gate.key as keyof CiCdPipelineConfig] ? 'bg-purple-500 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </div>
                </div>
              ))}

              <div className="border-t border-slate-800 pt-3">
                <div
                  onClick={() => toggleGate('allowBypassOnFailure')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between select-none ${
                    config.allowBypassOnFailure
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="text-xs">{isAr ? 'السماح بتجاوز الفشل (Bypass)' : 'Allow Bypass On Failure'}</div>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      {isAr ? 'تحذير: يسمح بنشر البرمجيات حتى في حال فشل بوابات الفحص' : 'Warning: Developer can override blocking gates'}
                    </p>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                      config.allowBypassOnFailure ? 'bg-rose-500 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Jobs Execution stages list */}
          <div className="md:col-span-7 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'نتائج خط التجميع وبوابات الحماية الإحدى عشر (11 Pipeline Security Jobs):' : 'All 11 Unified CI/CD Security Quality Gates:'}
            </h2>

            <div className="grid grid-cols-1 gap-2.5">
              {pipelineResult.jobs.map((job) => (
                <div
                  key={job.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    job.status === 'FAILED'
                      ? 'bg-rose-950/10 border-rose-500/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-white">{job.name}</span>
                      {job.gateEnabled ? (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {isAr ? 'بوابة إلزامية' : 'Enforced Gate'}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-slate-800 text-slate-500 border border-slate-700">
                          {isAr ? 'مراقبة فقط' : 'Audit Only'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                      {isAr ? job.logsAr : job.logsEn}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border shrink-0 text-center sm:text-right ${
                      job.status === 'FAILED'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-black'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold'
                    }`}
                  >
                    {job.status}
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
