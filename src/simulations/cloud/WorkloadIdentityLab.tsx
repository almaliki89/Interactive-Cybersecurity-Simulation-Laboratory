/**
 * OMEGA V13 — Cloud Security World
 * WorkloadIdentityLab.tsx
 *
 * Interactive Workload Identity & Instance Metadata Service (IMDS) Lab.
 * Teaches IMDSv1 (SSRF-vulnerable) vs IMDSv2 (Session Tokens + Hop Limit 1).
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { ImdsEngine, ImdsConfig, ImdsRequest } from './logic/workloadIdentity';
import { Cpu, Shield, AlertTriangle, CheckCircle2, Play, Terminal, ArrowRight, Lock } from 'lucide-react';

export const WorkloadIdentityLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [engine] = useState(new ImdsEngine());

  const [imdsConfig, setImdsConfig] = useState<ImdsConfig>({
    version: 'v1',
    httpTokens: 'optional', // Vulnerable by default
    httpPutResponseHopLimit: 2,
    httpEndpoint: 'enabled',
  });

  const [simulatedHopCount, setSimulatedHopCount] = useState<number>(2); // 2 = via reverse proxy SSRF
  const [useTokenHeader, setUseTokenHeader] = useState<boolean>(false);
  const [virtualTime] = useState<number>(450);

  // If useTokenHeader is requested, obtain token first
  let tokenHeaderVal = '';
  if (useTokenHeader) {
    const tokenResp = engine.evaluateRequest(imdsConfig, {
      method: 'PUT',
      path: '/latest/api/token',
      headers: { 'x-nexora-ec2-metadata-token-ttl-seconds': '21600' },
      hopCount: 1,
      virtualTime,
    });
    tokenHeaderVal = String(tokenResp.body);
  }

  const req: ImdsRequest = {
    method: 'GET',
    path: '/latest/meta-data/iam/security-credentials/NexoraAppWorkloadInstanceProfileRole',
    headers: tokenHeaderVal ? { 'x-nexora-ec2-metadata-token': tokenHeaderVal } : {},
    hopCount: simulatedHopCount,
    virtualTime,
  };

  const response = engine.evaluateRequest(imdsConfig, req);

  const toggleImdsv2Enforcement = () => {
    setImdsConfig((prev) => ({
      ...prev,
      version: prev.version === 'v1' ? 'v2' : 'v1',
      httpTokens: prev.httpTokens === 'optional' ? 'required' : 'optional',
      httpPutResponseHopLimit: prev.version === 'v1' ? 1 : 2,
    }));
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono mb-1">
            <Cpu className="w-4 h-4" />
            <span>INSTANCE METADATA SERVICE (IMDS) & SSRF DEFENSE</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر هوية أعباء العمل وحماية IMDS من هجمات SSRF' : 'Workload Identity & IMDSv2 SSRF Defense Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'تتيح خدمة بيانات التعريف (169.254.169.254) للخوادم الحصول على صلاحيات مؤقتة، لكن IMDSv1 عرضة لسرقة بيانات الاعتماد عبر ثغرات SSRF.'
              : 'Workload identity provides temporary credentials via 169.254.169.254. Learn how IMDSv1 enables credential theft and how IMDSv2 prevents SSRF.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Configuration & Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300">
                {isAr ? 'إعدادات IMDS على الخادم' : 'Instance IMDS Options'}
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                  imdsConfig.version === 'v2' && imdsConfig.httpTokens === 'required'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {imdsConfig.version.toUpperCase()} ({imdsConfig.httpTokens.toUpperCase()})
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={toggleImdsv2Enforcement}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  imdsConfig.version === 'v2' && imdsConfig.httpTokens === 'required'
                    ? 'bg-emerald-800 hover:bg-emerald-700 text-white'
                    : 'bg-rose-700 hover:bg-rose-600 text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>
                  {imdsConfig.version === 'v2' && imdsConfig.httpTokens === 'required'
                    ? isAr
                      ? 'إلغاء فرض IMDSv2 (الرجوع إلى v1)'
                      : 'Revert to IMDSv1 (Vulnerable)'
                    : isAr
                    ? 'فرض IMDSv2 والرموز الإلزامية'
                    : 'Enforce IMDSv2 (Tokens Required)'}
                </span>
              </button>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <span className="text-slate-500 block text-[10px] mb-1">HOP LIMIT (PUT RESPONSE)</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{imdsConfig.httpPutResponseHopLimit} Hop(s)</span>
                  <button
                    onClick={() =>
                      setImdsConfig((prev) => ({
                        ...prev,
                        httpPutResponseHopLimit: prev.httpPutResponseHopLimit === 1 ? 2 : 1,
                      }))
                    }
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Change to {imdsConfig.httpPutResponseHopLimit === 1 ? '2 (Allows Proxies)' : '1 (Strict Host Only)'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Attacker Simulator Parameters */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-rose-400 block mb-3">
              {isAr ? 'محاكاة هجوم SSRF' : 'Attacker SSRF Request Context'}
            </span>

            <div className="flex flex-col gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] mb-1">REQUEST HOP COUNT</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{simulatedHopCount} (Traversed SSRF Proxy)</span>
                  <button
                    onClick={() => setSimulatedHopCount(simulatedHopCount === 1 ? 2 : 1)}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Toggle to {simulatedHopCount === 1 ? '2 (Proxy/Container)' : '1 (Local)'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">X-NEXORA-EC2-METADATA-TOKEN</span>
                  <span className={useTokenHeader ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {useTokenHeader ? 'Token Header Included' : 'Missing (Standard SSRF)'}
                  </span>
                </div>
                <button
                  onClick={() => setUseTokenHeader(!useTokenHeader)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-200"
                >
                  Toggle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right: Terminal / HTTP Response Inspector */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Status Verdict */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
              response.isSsrfExploitable
                ? 'bg-rose-950/40 border-rose-700 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {response.isSsrfExploitable ? (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              )}
              <div>
                <h3 className="text-xs font-bold">
                  {response.isSsrfExploitable
                    ? isAr
                      ? 'ثغرة حرجة: تسريب بيانات اعتماد الدور السحابي عبر هجوم SSRF!'
                      : 'CRITICAL: SSRF Vulnerability Leaked Temporary Role Credentials!'
                    : isAr
                    ? 'الحماية فعالة: تم إحباط محاولة سرقة بيانات الاعتماد'
                    : 'Protected: SSRF Credential Theft Successfully Mitigated'}
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {isAr ? response.securityAssessment.ar : response.securityAssessment.en}
                </p>
              </div>
            </div>
          </div>

          {/* Simulated HTTP Request & Response Console */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex-1 flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>HTTP METADATA TRANSACTION</span>
              </span>
              <span className={response.statusCode === 200 ? 'text-emerald-400' : 'text-rose-400'}>
                STATUS: {response.statusCode} {response.statusText}
              </span>
            </div>

            {/* Request */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 mb-3">
              <div className="text-purple-300 font-bold">
                {req.method} {req.path} HTTP/1.1
              </div>
              <div className="text-slate-500">Host: 169.254.169.254</div>
              {Object.entries(req.headers).map(([k, v]) => (
                <div key={k} className="text-teal-400">
                  {k}: {v}
                </div>
              ))}
            </div>

            {/* Response Body */}
            <div className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto">
              <span className="text-[10px] text-slate-500 block mb-1">RESPONSE BODY:</span>
              <pre className="text-[11px] text-amber-300 whitespace-pre-wrap">
                {typeof response.body === 'object' ? JSON.stringify(response.body, null, 2) : response.body}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
