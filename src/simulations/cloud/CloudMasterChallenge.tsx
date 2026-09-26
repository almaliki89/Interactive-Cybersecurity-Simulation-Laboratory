/**
 * OMEGA V13 — Cloud Security World
 * CloudMasterChallenge.tsx
 *
 * Culminating Cloud Security Master Challenge:
 * Remediate multi-layer infrastructure flaws, harden IAM/S3/IMDS,
 * contain active breach, and achieve CIS Cloud Benchmark Grade A.
 *
 * NOTE: No UI auto-solve or shortcut is exposed to the learner.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  validateCloudMasterChallenge,
  calculateCspmBenchmark,
  CloudMasterChallengeState,
  createDefaultCloudMasterChallengeState,
} from './logic/hardening';
import {
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Wrench,
  Check,
  Server,
  Database,
  Layers,
  KeyRound,
} from 'lucide-react';

export const CloudMasterChallenge: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const initializeFreshChallenge = (): CloudMasterChallengeState => {
    return createDefaultCloudMasterChallengeState();
  };

  const [state, setState] = useState<CloudMasterChallengeState>(initializeFreshChallenge);

  const validation = validateCloudMasterChallenge(state);
  const cspm = validation.cspmBenchmark;

  // Learner action 1: Enforce BPA on raw bucket
  const actionRemediateS3 = () => {
    setState((prev) => ({
      ...prev,
      infraState: {
        ...prev.infraState,
        buckets: prev.infraState.buckets.map((b) =>
          b.name === 'nexora-analytics-raw-bucket'
            ? {
                ...b,
                isPubliclyExposed: false,
                publicAccessBlock: {
                  blockPublicAcls: true,
                  ignorePublicAcls: true,
                  blockPublicPolicy: true,
                  restrictPublicBuckets: true,
                },
                encryption: { ...b.encryption, enabled: true },
                accessLogging: {
                  enabled: true,
                  targetBucket: 'nexora-central-audit-logs-immutable',
                  targetPrefix: 's3-access-logs/analytics/',
                },
              }
            : b
        ),
      },
      appliedRemediations: new Set(prev.appliedRemediations).add('S3_BPA'),
    }));
  };

  // Learner action 2: Close open SSH/RDP
  const actionCloseMgmtPorts = () => {
    setState((prev) => ({
      ...prev,
      infraState: {
        ...prev.infraState,
        securityGroups: prev.infraState.securityGroups.map((sg) =>
          sg.id === 'sg-vulnerable-dev-open'
            ? {
                ...sg,
                ingressRules: sg.ingressRules.filter((r) => r.sourceOrDestination !== '0.0.0.0/0'),
              }
            : sg
        ),
      },
      appliedRemediations: new Set(prev.appliedRemediations).add('CLOSE_SSH'),
    }));
  };

  // Learner action 3: Enforce IMDSv2
  const actionEnforceImdsv2 = () => {
    setState((prev) => ({
      ...prev,
      infraState: {
        ...prev.infraState,
        computeInstances: prev.infraState.computeInstances.map((inst) =>
          inst.id === 'inst-web-prod-01'
            ? {
                ...inst,
                imdsConfig: { version: 'v2', httpTokens: 'required', httpPutResponseHopLimit: 1, httpEndpoint: 'enabled' },
              }
            : inst
        ),
      },
      appliedRemediations: new Set(prev.appliedRemediations).add('ENFORCE_IMDSV2'),
    }));
  };

  // Learner action 4: Lock CloudTrail
  const actionEnableCloudTrail = () => {
    setState((prev) => ({
      ...prev,
      infraState: {
        ...prev.infraState,
        trailConfig: {
          ...prev.infraState.trailConfig,
          isLogging: true,
          enableLogFileValidation: true,
          isMultiRegionTrail: true,
        },
      },
      appliedRemediations: new Set(prev.appliedRemediations).add('ENABLE_TRAIL'),
    }));
  };

  // Learner action 5: Delete Root Access Key
  const actionDeleteRootKey = () => {
    setState((prev) => ({
      ...prev,
      infraState: {
        ...prev.infraState,
        rootHasActiveAccessKey: false,
      },
      appliedRemediations: new Set(prev.appliedRemediations).add('DELETE_ROOT_KEY'),
    }));
  };

  // Learner action 6: Test Workload Authorizations
  const actionTestAuthorizations = () => {
    setState((prev) => ({
      ...prev,
      testedAuthorizationsPassed: true,
      appliedRemediations: new Set(prev.appliedRemediations).add('TEST_AUTH'),
    }));
  };

  // Learner action 7: Execute Playbook Action
  const togglePlaybookAction = (actionId: string) => {
    setState((prev) => {
      const updatedActions = prev.incidentCase.playbookActions.map((a) =>
        a.id === actionId ? { ...a, isExecuted: !a.isExecuted } : a
      );
      return {
        ...prev,
        incidentCase: {
          ...prev.incidentCase,
          playbookActions: updatedActions,
        },
      };
    });
  };

  const handleResetChallenge = () => {
    setState(initializeFreshChallenge());
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
            <Sparkles className="w-4 h-4" />
            <span>NEXORA CLOUD SECURITY CAPSTONE</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'التحدي الرئيسي الشامل: تحصين واحتواء سحابة Nexora' : 'Cloud Security Master Challenge: Enterprise Hardening & Breach Containment'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'أصلح الثغرات الحرجة في البنية التحتية، وافرض ضوابط CIS للأمان، وأكمل دليل الاستجابة للحوادث لتحقيق الدرجة A.'
              : 'Remediate critical cloud misconfigurations, enforce CIS Cloud Benchmark controls, and contain the active breach.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetChallenge}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة ضبط التحدي' : 'Reset State'}</span>
          </button>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-500 block text-[9px]">BENCHMARK SCORE</span>
              <span
                className={`font-black text-base ${
                  validation.isPassed ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {validation.scorePercentage}% (Grade {cspm.grade})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Security Pillars & Benchmark Breakdown */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-300">
            {isAr ? 'ركائز أمان السحابة (CIS Benchmark Pillars)' : 'CIS Cloud Benchmark Pillars'}
          </span>

          <div className="flex flex-col gap-2.5">
            {cspm.pillarScores.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white">{isAr ? p.pillarNameAr : p.pillarNameEn}</span>
                  <span
                    className={`font-bold ${
                      p.scorePercentage >= 80 ? 'text-emerald-400' : p.scorePercentage >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {p.scorePercentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      p.scorePercentage >= 80 ? 'bg-emerald-500' : p.scorePercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${p.scorePercentage}%` }}
                  />
                </div>

                {p.criticalDefects.length > 0 && (
                  <div className="text-[10px] text-rose-300/90 truncate">
                    Defect: {p.criticalDefects[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center & Right: Interactive Hardening Actions & Playbook */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Verdict Banner */}
          <div
            className={`p-5 rounded-2xl border flex items-center justify-between shadow-xl ${
              validation.isPassed
                ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                : 'bg-amber-950/40 border-amber-600 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {validation.isPassed ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
              )}
              <div>
                <h3 className="text-xs font-bold font-mono">
                  {validation.isPassed
                    ? isAr
                      ? 'تم اجتياز التحدي الشامل بنجاح! التقدير A'
                      : 'MASTER CHALLENGE COMPLETED — CIS GRADE A'
                    : isAr
                    ? `التحدي قيد الإنجاز (${validation.failedChecks.length} متطلبات متبقية)`
                    : `Challenge Incomplete (${validation.failedChecks.length} requirements remaining)`}
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                  {isAr ? validation.feedbackAr : validation.feedbackEn}
                </p>
              </div>
            </div>
          </div>

          {/* Infrastructure Hardening Controls */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'إجراءات التحصين السحابي المطلوبة' : 'Core Cloud Hardening Remediations'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {/* BPA Action */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">S3 Block Public Access</span>
                  <span className="text-[10px] text-slate-400">Lock raw analytics bucket</span>
                </div>
                {state.infraState.buckets.find((b) => b.name === 'nexora-analytics-raw-bucket')?.publicAccessBlock.blockPublicPolicy ? (
                  <span className="text-[10px] font-bold text-emerald-400">COMPLETED ✓</span>
                ) : (
                  <button
                    onClick={actionRemediateS3}
                    className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs"
                  >
                    Enforce BPA
                  </button>
                )}
              </div>

              {/* SSH Action */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Close Open SSH/RDP</span>
                  <span className="text-[10px] text-slate-400">Remove 0.0.0.0/0 ingress</span>
                </div>
                {!state.infraState.securityGroups.find((sg) => sg.id === 'sg-vulnerable-dev-open')?.ingressRules.some((r) => r.sourceOrDestination === '0.0.0.0/0') ? (
                  <span className="text-[10px] font-bold text-emerald-400">CLOSED ✓</span>
                ) : (
                  <button
                    onClick={actionCloseMgmtPorts}
                    className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs"
                  >
                    Close Ports
                  </button>
                )}
              </div>

              {/* IMDSv2 Action */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Enforce IMDSv2</span>
                  <span className="text-[10px] text-slate-400">Require session tokens</span>
                </div>
                {state.infraState.computeInstances.find((i) => i.id === 'inst-web-prod-01')?.imdsConfig.version === 'v2' ? (
                  <span className="text-[10px] font-bold text-emerald-400">HARDENED ✓</span>
                ) : (
                  <button
                    onClick={actionEnforceImdsv2}
                    className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs"
                  >
                    Apply IMDSv2
                  </button>
                )}
              </div>

              {/* Trail Action */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Lock CloudTrail</span>
                  <span className="text-[10px] text-slate-400">Multi-region + digests</span>
                </div>
                {state.infraState.trailConfig.isLogging && state.infraState.trailConfig.enableLogFileValidation ? (
                  <span className="text-[10px] font-bold text-emerald-400">ACTIVE ✓</span>
                ) : (
                  <button
                    onClick={actionEnableCloudTrail}
                    className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs"
                  >
                    Enable Trail
                  </button>
                )}
              </div>

              {/* Root Key Action */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between sm:col-span-2">
                <div>
                  <span className="font-bold text-white block">Delete Root Account API Keys</span>
                  <span className="text-[10px] text-slate-400">Root should only have console access with MFA</span>
                </div>
                {!state.infraState.rootHasActiveAccessKey ? (
                  <span className="text-[10px] font-bold text-emerald-400">DELETED ✓</span>
                ) : (
                  <button
                    onClick={actionDeleteRootKey}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs"
                  >
                    Delete Root Keys
                  </button>
                )}
              </div>

              {/* Workload Authorizations Validation Action */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between sm:col-span-2">
                <div>
                  <span className="font-bold text-white block">
                    {isAr ? 'اختبار تفويضات أدوار العمل المشروعة' : 'Test Legitimate Workload Authorizations'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isAr
                      ? 'التحقق من صحة تقمص الأدوار وسياسات الامتياز الأدنى لأعباء العمل'
                      : 'Verify application role assumptions and least-privilege policies'}
                  </span>
                </div>
                {state.testedAuthorizationsPassed ? (
                  <span className="text-[10px] font-bold text-emerald-400">VERIFIED ✓</span>
                ) : (
                  <button
                    onClick={actionTestAuthorizations}
                    className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs"
                  >
                    {isAr ? 'فحص التفويضات' : 'Verify Authorizations'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Incident Response Playbook Checklist */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex-1 flex flex-col">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-pink-400" />
              <span>{isAr ? 'دليل الاستجابة لاحتواء الهجوم النشط' : 'Incident Response Playbook Actions'}</span>
            </h4>

            <div className="flex flex-col gap-2.5">
              {state.incidentCase.playbookActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => togglePlaybookAction(action.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${
                    action.isExecuted
                      ? 'bg-emerald-950/30 border-emerald-700/80 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white block">
                      {isAr ? action.titleAr : action.titleEn}
                    </span>
                    <span className="text-[10px] text-slate-500">{action.requiredForStage}</span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      action.isExecuted
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-700 bg-slate-900 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
