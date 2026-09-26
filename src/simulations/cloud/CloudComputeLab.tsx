/**
 * OMEGA V13 — Cloud Security World
 * CloudComputeLab.tsx
 *
 * Interactive Cloud Compute & Workload Security Lab.
 * Demonstrates Instance Profiles, SSRF vulnerability patching,
 * IMDS hardening, and Network Quarantine Isolation.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  createDefaultComputeInstances,
  isolateComputeInstance,
  enforceImdsv2OnInstance,
  CloudComputeInstance,
} from './logic/compute';
import { Server, Shield, AlertTriangle, CheckCircle2, Lock, Cpu, RefreshCw, Scissors } from 'lucide-react';

export const CloudComputeLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [instances, setInstances] = useState<CloudComputeInstance[]>(createDefaultComputeInstances());
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>(instances[0].id);

  const selectedInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];

  const handleIsolate = (instanceId: string) => {
    setInstances((prev) =>
      prev.map((inst) => (inst.id === instanceId ? isolateComputeInstance(inst) : inst))
    );
  };

  const handleEnforceImds = (instanceId: string) => {
    setInstances((prev) =>
      prev.map((inst) => (inst.id === instanceId ? enforceImdsv2OnInstance(inst) : inst))
    );
  };

  const handlePatchSsrf = (instanceId: string, vulnId: string) => {
    setInstances((prev) =>
      prev.map((inst) => {
        if (inst.id !== instanceId) return inst;
        return {
          ...inst,
          vulnerabilities: inst.vulnerabilities.map((v) => (v.id === vulnId ? { ...v, isPatched: true } : v)),
        };
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono mb-1">
            <Server className="w-4 h-4" />
            <span>CLOUD WORKLOADS & COMPUTE ISOLATION</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر الخوادم السحابية وتحصين أعباء العمل' : 'Cloud Compute & Workload Hardening Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'إدارة الخوادم الافتراضية والحاويات، وترقيع ثغرات SSRF، وتطبيق العزل الفوري (Quarantine) عند الاشتباه بالاختراق.'
              : 'Inspect VM and container workloads, patch application SSRF vulnerabilities, enforce IMDSv2, and execute quarantine isolation.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Instances List */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{isAr ? 'الخوادم السحابية النشطة' : 'Compute Workloads'}</span>
            <span className="text-[10px] text-blue-400 font-mono">{instances.length} INSTANCES</span>
          </div>

          <div className="flex flex-col gap-2">
            {instances.map((inst) => {
              const isSelected = inst.id === selectedInstanceId;
              const hasUnpatchedVuln = inst.vulnerabilities.some((v) => !v.isPatched);
              return (
                <div
                  key={inst.id}
                  onClick={() => setSelectedInstanceId(inst.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">{inst.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        inst.status === 'ISOLATED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : hasUnpatchedVuln
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {inst.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                    <span>IP: {inst.privateIp}</span>
                    <span>IMDS: {inst.imdsConfig.version.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Instance Configuration & Hardening Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Instance Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedInstance.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">ID: {selectedInstance.id} • {selectedInstance.instanceType}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border font-mono ${
                    selectedInstance.status === 'ISOLATED'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  STATUS: {selectedInstance.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PRIVATE IP</span>
                <span className="font-bold text-white">{selectedInstance.privateIp}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PUBLIC IP</span>
                <span className="font-bold text-white">{selectedInstance.publicIp || 'None (Private)'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">IMDS TOKENS</span>
                <span
                  className={`font-bold ${
                    selectedInstance.imdsConfig.httpTokens === 'required' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedInstance.imdsConfig.httpTokens.toUpperCase()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ATTACHED SGS</span>
                <span className="font-bold text-white">{selectedInstance.securityGroupIds.length}</span>
              </div>
            </div>
          </div>

          {/* Hardening & Remediation Operations */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>{isAr ? 'إجراءات التحصين والاستجابة للحوادث' : 'Remediation & Incident Response Actions'}</span>
              </h3>

              <div className="flex flex-col gap-3">
                {/* Vulnerability Patching */}
                {selectedInstance.vulnerabilities.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block mb-1">
                      {isAr ? 'الثغرات الأمنية المكتشفة على التطبيق:' : 'Detected Application Vulnerabilities:'}
                    </span>
                    {selectedInstance.vulnerabilities.map((v) => (
                      <div key={v.id} className="flex items-center justify-between mt-1 text-xs">
                        <div>
                          <span className={`font-bold ${v.isPatched ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {v.type}: {v.endpointPath}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {isAr ? v.descriptionAr : v.descriptionEn}
                          </span>
                        </div>
                        {v.isPatched ? (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            PATCHED
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePatchSsrf(selectedInstance.id, v.id)}
                            className="px-3 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs shadow-md"
                          >
                            {isAr ? 'ترقيع الثغرة' : 'Patch SSRF Flaw'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* IMDSv2 Enforcement */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isAr ? 'فرض بروتوكول IMDSv2' : 'Enforce IMDSv2 Tokens'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {selectedInstance.imdsConfig.version === 'v2' && selectedInstance.imdsConfig.httpTokens === 'required'
                        ? isAr
                          ? 'IMDSv2 مفعل ومحصن ضد قفزات الوكلاء.'
                          : 'IMDSv2 is enforced; token required with hop limit 1.'
                        : isAr
                        ? 'الخادم يقبل IMDSv1 دون رمز، مما يجعله عرضة للاختراق.'
                        : 'Vulnerable: Instance accepts token-less IMDSv1 metadata requests.'}
                    </span>
                  </div>
                  {selectedInstance.imdsConfig.version === 'v2' && selectedInstance.imdsConfig.httpTokens === 'required' ? (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      HARDENED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEnforceImds(selectedInstance.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md"
                    >
                      {isAr ? 'تطبيق IMDSv2' : 'Enforce IMDSv2'}
                    </button>
                  )}
                </div>

                {/* Quarantine Network Isolation */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isAr ? 'عزل الخادم شبكيًا (Network Quarantine)' : 'Quarantine Instance (Isolate SGs)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {selectedInstance.status === 'ISOLATED'
                        ? isAr
                          ? 'تم حظر جميع الحركات الواردة والخارجة في مجموعة أمان العزل.'
                          : 'Instance is isolated in quarantine security group with zero ingress/egress.'
                        : isAr
                        ? 'افصل الخادم فورًا لمنع التحرك الجانبي وسحب البيانات.'
                        : 'Disconnect instance from app and database tiers to prevent lateral spread.'}
                    </span>
                  </div>
                  {selectedInstance.status === 'ISOLATED' ? (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      ISOLATED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleIsolate(selectedInstance.id)}
                      className="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-md"
                    >
                      {isAr ? 'عزل الخادم فورًا' : 'Isolate Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              {isAr
                ? 'نصيحة أمنية: في البيئات السحابية غير الثابتة (Ephemeral)، الأفضل هو أخذ نسخة احتياطية للتحقيق الجنائي ثم إنهاء الخادم واستبداله بنسخة جديدة.'
                : 'Cloud Architecture Tip: In immutable infrastructure, isolate for digital forensics, then terminate and rotate.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
