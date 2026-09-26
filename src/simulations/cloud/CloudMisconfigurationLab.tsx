/**
 * OMEGA V13 — Cloud Security World
 * CloudMisconfigurationLab.tsx
 *
 * Interactive Cloud Security Posture Management (CSPM) Scanner & Remediation Lab.
 * Detects common cloud flaws (open management SGs, public S3 buckets, IMDSv1,
 * wildcard policies, disabled logging) and provides one-click remediation.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  scanCloudMisconfigurations,
  CloudInfrastructureState,
  CloudMisconfiguration,
} from './logic/misconfigurations';
import { createDefaultStorageBuckets } from './logic/storage';
import { createDefaultSecurityGroups } from './logic/securityGroups';
import { createDefaultCloudIdentities } from './logic/identity';
import { ALL_PRESET_POLICIES } from './logic/policies';
import { createDefaultComputeInstances } from './logic/compute';
import { createDefaultTrailConfig } from './logic/logging';
import { AlertTriangle, ShieldCheck, CheckCircle2, Wrench, RefreshCw, Layers } from 'lucide-react';

export const CloudMisconfigurationLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const defaultSgs = createDefaultSecurityGroups();

  const [infraState, setInfraState] = useState<CloudInfrastructureState>({
    buckets: createDefaultStorageBuckets(),
    securityGroups: [defaultSgs.webAlbSg, defaultSgs.appWorkloadSg, defaultSgs.dbTierSg, defaultSgs.vulnerableOpenSshSg],
    principals: createDefaultCloudIdentities().principals,
    policies: ALL_PRESET_POLICIES,
    computeInstances: createDefaultComputeInstances(),
    trailConfig: { ...createDefaultTrailConfig(), isLogging: false }, // Simulating disabled trail flaw
    rootHasActiveAccessKey: true, // Simulating root access key flaw
  });

  const misconfigs = scanCloudMisconfigurations(infraState);
  const criticalCount = misconfigs.filter((m) => m.severity === 'CRITICAL').length;

  const remediateItem = (item: CloudMisconfiguration) => {
    if (item.category === 'STORAGE') {
      setInfraState((prev) => ({
        ...prev,
        buckets: prev.buckets.map((b) =>
          b.name === item.resourceId
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
              }
            : b
        ),
      }));
    } else if (item.category === 'NETWORK') {
      setInfraState((prev) => ({
        ...prev,
        securityGroups: prev.securityGroups.map((sg) =>
          sg.name === item.resourceId
            ? {
                ...sg,
                ingressRules: sg.ingressRules.filter((r) => r.sourceOrDestination !== '0.0.0.0/0'),
              }
            : sg
        ),
      }));
    } else if (item.category === 'COMPUTE') {
      setInfraState((prev) => ({
        ...prev,
        computeInstances: prev.computeInstances.map((inst) =>
          inst.name === item.resourceId
            ? {
                ...inst,
                imdsConfig: { version: 'v2', httpTokens: 'required', httpPutResponseHopLimit: 1, httpEndpoint: 'enabled' },
              }
            : inst
        ),
      }));
    } else if (item.category === 'LOGGING') {
      setInfraState((prev) => ({
        ...prev,
        trailConfig: { ...prev.trailConfig, isLogging: true, enableLogFileValidation: true },
      }));
    } else if (item.category === 'SECRETS') {
      setInfraState((prev) => ({
        ...prev,
        rootHasActiveAccessKey: false,
      }));
    } else if (item.category === 'IAM') {
      setInfraState((prev) => ({
        ...prev,
        policies: prev.policies.filter((p) => p.name !== item.resourceId),
      }));
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-mono mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>CLOUD SECURITY POSTURE MANAGEMENT (CSPM)</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر فحص الأخطاء الإعدادية والترقيع الآلي' : 'Cloud Misconfiguration Scanner & Remediation Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'أغلب حوادث اختراق السحابة تنجم عن أخطاء إعداد بسيطة مثل فتح المنافذ لـ 0.0.0.0/0 أو ترك الحاويات عامة. افحص ورقع العيوب فورًا.'
              : 'Over 80% of cloud security incidents stem from misconfigurations. Continuously scan posture and execute targeted automated remediations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className="text-right rtl:text-left">
              <span className="text-[10px] text-slate-500 font-mono block">ACTIVE DEFECTS</span>
              <span className={`text-sm font-bold font-mono ${criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {misconfigs.length} Findings ({criticalCount} Critical)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scanner Results */}
      <div className="flex-1 flex flex-col gap-4">
        {misconfigs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-emerald-950/20 border border-emerald-800/60 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-600 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {isAr ? 'جميع إعدادات السحابة محصنة بالكامل!' : 'Zero Active Cloud Misconfigurations Detected!'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              {isAr
                ? 'تم ترقيع جميع الحاويات العامة ومجموعات الأمان المفتوحة وفرض IMDSv2 وتفعيل سجلات التدقيق.'
                : 'All public buckets, exposed security groups, weak IMDS configurations, and disabled audit trails are remediated.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misconfigs.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        m.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : m.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {m.severity} • {m.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                      {m.resourceId}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1">
                    {isAr ? m.titleAr : m.titleEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                    {isAr ? m.descriptionAr : m.descriptionEn}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px] text-amber-300/90 font-mono mb-3">
                    <span className="text-slate-500 block text-[9px]">REMEDIATION PLAN:</span>
                    {isAr ? m.remediationStepsAr : m.remediationStepsEn}
                  </div>
                </div>

                <button
                  onClick={() => remediateItem(m)}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{isAr ? 'ترقيع الخلل آليًا الآن' : 'Remediate Finding'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
