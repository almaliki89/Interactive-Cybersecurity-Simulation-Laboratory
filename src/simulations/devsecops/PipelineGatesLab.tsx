/**
 * OMEGA V15 — CI/CD Automated Security Quality Gates Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialPipelineConfig, evaluatePipelineJobs } from './logic/pipelineGates';
import { scanCodeForSastVulnerabilities, getInitialSastFindings } from './logic/sast';
import { scanScaDependencies, getInitialDependencies } from './logic/sca';
import { scanRepositorySecrets, getInitialSecretMatches } from './logic/secretsScan';
import { scanTerraformCode, getInitialTerraformResources } from './logic/iacTerraform';
import { CiCdPipelineConfig } from './logic/types';
import { CheckCircle2, XCircle, ShieldCheck, RefreshCw, Workflow } from 'lucide-react';

export const PipelineGatesLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [config, setConfig] = useState<CiCdPipelineConfig>(getInitialPipelineConfig());

  const sastRes = scanCodeForSastVulnerabilities(getInitialSastFindings());
  const scaRes = scanScaDependencies(getInitialDependencies());
  const secretsRes = scanRepositorySecrets(getInitialSecretMatches());
  const iacRes = scanTerraformCode(getInitialTerraformResources());

  const jobs = evaluatePipelineJobs(config, {
    sastCriticals: sastRes.criticalCount,
    scaCriticals: scaRes.criticalCount,
    secretsLeaked: secretsRes.totalLeakedSecrets,
    iacCriticals: iacRes.criticalCount,
  });

  const toggleGate = (key: keyof CiCdPipelineConfig) => {
    if (typeof config[key] === 'boolean') {
      setConfig({ ...config, [key]: !config[key] });
    }
  };

  const hasFailedJob = jobs.some((j) => j.status === 'FAILED');

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
              <Workflow className="w-4 h-4" />
              <span>{isAr ? 'مختبر بوابات الأمان الجودة في CI/CD' : 'CI/CD Automated Security Quality Gates Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'منع دمج ونشر البرمجيات غير المصرح بها' : 'Automated CI/CD Quality Gates & Build Interception'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'تحكم في إعدادات بوابات الفحص الإلزامية لخط البناء (GitHub Actions) واختبر اعتراض البناء الفاشل.'
                : 'Configure pull-request merge blocking quality gates for SAST, SCA, Secrets, and IaC.'}
            </p>
          </div>

          <button
            onClick={() => setConfig(getInitialPipelineConfig())}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Pipeline Overall Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            hasFailedJob
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {hasFailedJob ? <XCircle className="w-6 h-6 text-rose-400" /> : <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            <div>
              <div className="font-bold text-sm text-white">
                {hasFailedJob
                  ? isAr
                    ? 'تم اعتراض خط الإنتاج وإيقاف البناء (BUILD INTERCEPTED & BLOCKED)'
                    : 'CI/CD Build Pipeline Failed Quality Gates'
                  : isAr
                  ? 'تم اجتياز كافة بوابات الأمان بنجاح (BUILD PASSED)'
                  : 'CI/CD Build Pipeline Passed Cleanly'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">
                Repository: {config.repository} ({config.branch})
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Jobs Flow Visualizer */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isAr ? 'مراحل خط الإنتاج البرمجي (Pipeline Stage Jobs):' : 'Pipeline Execution Stages:'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jobs.map((j) => (
              <div
                key={j.id}
                className={`p-4 rounded-xl border space-y-2 ${
                  j.status === 'FAILED'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{j.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      j.status === 'FAILED'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {j.status}
                  </span>
                </div>

                <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {isAr ? j.logsAr : j.logsEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
