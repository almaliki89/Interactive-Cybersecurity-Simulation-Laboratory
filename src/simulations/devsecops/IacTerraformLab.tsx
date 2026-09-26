/**
 * OMEGA V15 — Infrastructure as Code (IaC) & Terraform Security Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { scanTerraformCode } from './logic/iacTerraform';
import { TerraformResource } from './logic/types';
import { Workflow, ShieldCheck, AlertTriangle, RefreshCw, Sparkles, FileCode } from 'lucide-react';

export const IacTerraformLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const resources = useDevSecOpsStore((s) => s.masterState.terraformResources);
  const setMasterState = useDevSecOpsStore((s) => s.setMasterState);

  const [selectedResourceId, setSelectedResourceId] = useState<string>('tf-sg-public-ssh');

  const scan = scanTerraformCode(resources);
  const selectedResource = resources.find((r) => r.id === selectedResourceId) || resources[0];

  const remediateResource = (id: string) => {
    setMasterState((state) => {
      state.terraformResources = state.terraformResources.map((r) =>
        r.id === id ? { ...r, remediated: true, hasMisconfiguration: false } : r
      );
    });
  };

  const remediateAll = () => {
    setMasterState((state) => {
      state.terraformResources = state.terraformResources.map((r) => ({ ...r, remediated: true, hasMisconfiguration: false }));
    });
  };

  const resetLab = () => {
    setMasterState((state) => {
      state.terraformResources = state.terraformResources.map((r) => ({ ...r, remediated: false, hasMisconfiguration: true }));
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
              <Workflow className="w-4 h-4" />
              <span>{isAr ? 'مختبر أمن البنية التحتية ككود (Terraform IaC)' : 'IaC Security & Terraform Scanning Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'فحص قوالب HCL واكتشاف المنافذ والتخزين المكشوف' : 'Policy-as-Code Terraform Static Template Audit'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'استخدم قواعد Checkov / OPA لفحص أكواد Terraform وإغلاق منافذ SSH 0.0.0.0/0 وتفعيل تشفير S3 KMS.'
                : 'Audit Terraform HCL code for public security groups, unencrypted storage, and permissive IAM before deployment.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? 'أمان IaC' : 'IaC Score'}</div>
              <div
                className={`text-2xl font-black ${
                  scan.iacScore >= 80
                    ? 'text-emerald-400'
                    : scan.iacScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {scan.iacScore}%
              </div>
            </div>

            <button
              onClick={remediateAll}
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصحيح أخطاء Terraform' : 'Harden Terraform Code'}</span>
            </button>

            <button
              onClick={resetLab}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resources Grid & Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {isAr ? 'قوالب البنية التحتية المفحوصة:' : 'Terraform Resources:'}
            </div>

            {resources.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedResourceId(r.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedResourceId === r.id
                    ? 'bg-amber-950/30 border-amber-500 text-white shadow-md'
                    : r.remediated
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-400">{r.resourceType}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                      r.remediated
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {r.remediated ? 'HARDENED' : r.severity}
                  </span>
                </div>
                <div className="font-bold text-xs">{r.resourceName}</div>
              </div>
            ))}
          </div>

          <div className="md:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                  {selectedResource.ruleName}
                </span>
                <h2 className="text-sm font-bold text-white mt-1">{selectedResource.resourceName}</h2>
              </div>

              {!selectedResource.remediated && (
                <button
                  onClick={() => remediateResource(selectedResource.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'تطبيق تحصين HCL' : 'Apply HCL Patch'}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr ? selectedResource.descriptionAr : selectedResource.descriptionEn}
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-[10px] text-rose-400 font-bold uppercase mb-1">
                  {isAr ? 'كود Terraform الحالي (المكشوف):' : 'Current Terraform Template:'}
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-rose-900/40 text-rose-300 overflow-x-auto">
                  {selectedResource.hclCode}
                </pre>
              </div>

              <div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">
                  {isAr ? 'كود Terraform المحصن:' : 'Hardened Terraform Template:'}
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-emerald-900/40 text-emerald-300 overflow-x-auto">
                  {selectedResource.hardenedHclCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
