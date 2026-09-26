/**
 * OMEGA V14 — Container Breakout & Escape Vectors Interactive Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { ESCAPE_SCENARIOS, testEscapeVulnerability } from './logic/escape';
import { AlertTriangle, ShieldCheck, Terminal, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export const ContainerEscapeLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('docker_socket_mount');
  const [hasHostSockMounted, setHasHostSockMounted] = useState<boolean>(true);
  const [isPrivileged, setIsPrivileged] = useState<boolean>(true);
  const [hasCapSysAdmin, setHasCapSysAdmin] = useState<boolean>(true);
  const [hasReadOnlyRootFs, setHasReadOnlyRootFs] = useState<boolean>(false);
  const [isRootlessContainer, setIsRootlessContainer] = useState<boolean>(false);
  const [seccompEnabled, setSeccompEnabled] = useState<boolean>(false);

  const [testResult, setTestResult] = useState<any>(null);

  const activeScenario = ESCAPE_SCENARIOS.find((s) => s.id === selectedScenarioId) || ESCAPE_SCENARIOS[0];

  const runEscapeTest = () => {
    const result = testEscapeVulnerability({
      scenarioId: selectedScenarioId,
      hasHostSockMounted,
      isPrivileged,
      hasCapSysAdmin,
      hasReadOnlyRootFs,
      isRootlessContainer,
      seccompEnabled,
    });
    setTestResult(result);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{isAr ? 'مختبر كسر عزل الحاويات والهروب للمضيف' : 'Container Breakout & Escape Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'محاكاة كسر عزل الحاوية واستغلال النواة (Container Breakout)' : 'Container Escape Vectors & Rootless Hardening'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'اختبر سيناريوهات الهروب عبر /var/run/docker.sock و --privileged و cgroup release_agent وتحقق من فاعلية Rootless.'
                : 'Simulate container breakouts via mounted Docker sockets, privileged flags, and cgroups hooks.'}
            </p>
          </div>

          <button
            onClick={() => {
              setHasHostSockMounted(true);
              setIsPrivileged(true);
              setHasCapSysAdmin(true);
              setHasReadOnlyRootFs(false);
              setIsRootlessContainer(false);
              setSeccompEnabled(false);
              setTestResult(null);
            }}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Scenario Selector & Container Posture Config */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left: Scenarios */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {isAr ? 'سيناريوهات كسر العزل (Attack Vectors):' : 'Breakout Scenarios:'}
            </div>

            {ESCAPE_SCENARIOS.map((sc) => (
              <div
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  setTestResult(null);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedScenarioId === sc.id
                    ? 'bg-rose-950/30 border-rose-500 text-white shadow-md'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs">{isAr ? sc.nameAr : sc.nameEn}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {isAr ? sc.descriptionAr : sc.descriptionEn}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Security Switches & Exploit Runner */}
          <div className="md:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isAr ? 'إعدادات الحماية والأمان الحالية للحاوية:' : 'Current Container Security Controls:'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHostSockMounted}
                  onChange={(e) => setHasHostSockMounted(e.target.checked)}
                  className="accent-rose-500"
                />
                <span className={hasHostSockMounted ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {isAr ? 'مقبس docker.sock ممرر' : 'Mount /var/run/docker.sock'}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivileged}
                  onChange={(e) => setIsPrivileged(e.target.checked)}
                  className="accent-rose-500"
                />
                <span className={isPrivileged ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {isAr ? 'الوضع المميز (privileged: true)' : 'Privileged: true'}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCapSysAdmin}
                  onChange={(e) => setHasCapSysAdmin(e.target.checked)}
                  className="accent-rose-500"
                />
                <span className={hasCapSysAdmin ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {isAr ? 'صلاحية CAP_SYS_ADMIN' : 'CAP_SYS_ADMIN Retained'}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReadOnlyRootFs}
                  onChange={(e) => setHasReadOnlyRootFs(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span className={hasReadOnlyRootFs ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {isAr ? 'نظام ملفات للقراءة فقط' : 'readOnlyRootFilesystem'}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={isRootlessContainer}
                  onChange={(e) => setIsRootlessContainer(e.target.checked)}
                  className="accent-cyan-500"
                />
                <span className={isRootlessContainer ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                  {isAr ? 'تشغيل الحاوية بوضع Rootless (UserNS Remapping)' : 'Rootless Mode (UserNS Remap)'}
                </span>
              </label>
            </div>

            {/* Attack Payload View */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
              <div className="text-slate-500 font-bold mb-1 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-rose-400" />
                <span>Exploit Payload:</span>
              </div>
              <div className="text-rose-300 truncate">{activeScenario.exploitPayload}</div>
            </div>

            {/* Run Button */}
            <button
              onClick={runEscapeTest}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-rose-950"
            >
              {isAr ? 'تنفيذ محاكاة كسر العزل (Execute Breakout Test)' : 'Execute Breakout Simulation'}
            </button>

            {/* Output */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  testResult.escaped
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : 'bg-emerald-950/30 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {testResult.escaped ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  )}
                  <span className="font-bold text-sm text-white">
                    {testResult.escaped
                      ? isAr
                        ? 'تم كسر العزل والسيطرة على الخادم!'
                        : 'Breakout Succeeded — Host Node Compromised!'
                      : isAr
                      ? 'تم إحباط محاولة الهروب بنجاح!'
                      : 'Breakout Neutralized — Host Protected!'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {isAr ? testResult.logOutputAr : testResult.logOutputEn}
                </p>

                <div className="text-[11px] text-cyan-300 pt-2 border-t border-slate-800/60">
                  <span className="font-bold">{isAr ? 'التوصية الدفاعية: ' : 'Defensive Remedy: '}</span>
                  <span>{isAr ? testResult.remediationStepAr : testResult.remediationStepEn}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
