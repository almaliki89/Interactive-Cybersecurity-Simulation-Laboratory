/**
 * OMEGA V14 — Kubernetes Control Plane Security & CIS Benchmark Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialControlPlaneConfig, evaluateCisKubernetesBenchmark } from './logic/controlPlane';
import { ControlPlaneConfig } from './logic/types';
import { Server, CheckCircle2, XCircle, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export const ControlPlaneAuditLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [config, setConfig] = useState<ControlPlaneConfig>(getInitialControlPlaneConfig());

  const audit = evaluateCisKubernetesBenchmark(config);

  const toggleFlag = (flag: keyof ControlPlaneConfig) => {
    if (typeof config[flag] === 'boolean') {
      setConfig({ ...config, [flag]: !config[flag] });
    }
  };

  const applyAllHardenings = () => {
    setConfig({
      anonymousAuthDisabled: true,
      insecurePortDisabled: true,
      etcdTlsClientAuthEnabled: true,
      etcdEncryptionConfigEnabled: true,
      auditLoggingEnabled: true,
      kubeletNodeRestrictionEnabled: true,
      kubeletAlwaysPullImagesEnabled: true,
      cisBenchmarkScore: 100,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
              <Server className="w-4 h-4" />
              <span>{isAr ? 'مختبر أمن خوادم التحكم وتدقيق CIS' : 'K8s Control Plane & CIS Benchmark Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'تحصين kube-apiserver وتشفير قاعدة بيانات etcd' : 'Control Plane Hardening & etcd Encryption at Rest'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'اضبط رايات خادم التحكم وعطل الوصول المجهول والمنافذ المفتوحة وطبق معايير CIS Benchmark.'
                : 'Configure API server flags, enforce etcd KMS envelope encryption, and audit CIS compliance.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? 'مطابقة معايير CIS' : 'CIS Benchmark Score'}</div>
              <div
                className={`text-2xl font-black ${
                  audit.score >= 90
                    ? 'text-emerald-400'
                    : audit.score >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {audit.score}%
              </div>
            </div>

            <button
              onClick={applyAllHardenings}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {isAr ? 'تطبيق تحصين CIS الكامل' : 'Apply Full CIS Hardening'}
            </button>

            <button
              onClick={() => setConfig(getInitialControlPlaneConfig())}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CIS Benchmark Audit Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {audit.checks.map((check) => {
            return (
              <div
                key={check.id}
                className={`p-4 rounded-xl border transition-all ${
                  check.passed
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                      {check.id}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{check.section}</span>
                  </div>

                  <button
                    onClick={() => toggleFlag(check.flagName as keyof ControlPlaneConfig)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      check.passed
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                        : 'bg-rose-500 text-slate-950 hover:bg-rose-400 font-black'
                    }`}
                  >
                    {check.passed
                      ? isAr
                        ? 'مطبق (Compliant)'
                        : 'Compliant'
                      : isAr
                      ? 'إصلاح وتطبيق'
                      : 'Remediate'}
                  </button>
                </div>

                <h3 className="font-bold text-xs text-white mt-1">{isAr ? check.nameAr : check.nameEn}</h3>

                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {isAr ? check.recommendationAr : check.recommendationEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
