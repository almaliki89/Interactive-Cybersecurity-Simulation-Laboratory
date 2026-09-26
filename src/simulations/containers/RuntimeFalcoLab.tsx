/**
 * OMEGA V14 — Falco & eBPF Runtime Security Detection Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialFalcoRules, evaluateSyscallEvent } from './logic/runtimeSecurity';
import { containerEventBridge } from './runtime/ContainerEventBridge';
import { FalcoRule, RuntimeSecurityEvent } from './logic/types';
import { Flame, ShieldAlert, Terminal, Play, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const RuntimeFalcoLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const isAr = language === 'ar';

  const [rules, setRules] = useState<FalcoRule[]>(getInitialFalcoRules());
  const [events, setEvents] = useState<RuntimeSecurityEvent[]>([]);

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const simulateAttackSyscall = (type: 'shell' | 'shadow' | 'mining' | 'pkg') => {
    let payload = {
      podName: 'frontend-service-67b8-x1',
      namespace: 'production',
      containerId: 'container-9821af',
      syscall: 'execve',
      process: 'bash',
      parentProcess: 'python3',
      arguments: '/bin/bash -i',
      targetPathOrIp: undefined as string | undefined,
      virtualTime,
    };

    if (type === 'shadow') {
      payload = {
        podName: 'payment-vault-service-0',
        namespace: 'payments-secure',
        containerId: 'container-3390fe',
        syscall: 'openat',
        process: 'cat',
        parentProcess: 'bash',
        arguments: '/etc/shadow',
        targetPathOrIp: '/etc/shadow',
        virtualTime,
      };
    } else if (type === 'mining') {
      payload = {
        podName: 'backend-api-98c4-z2',
        namespace: 'production',
        containerId: 'container-4412cc',
        syscall: 'connect',
        process: 'xmrig',
        parentProcess: 'sh',
        arguments: '--url pool.supportxmr.com:3333',
        targetPathOrIp: '198.51.100.99',
        virtualTime,
      };
    } else if (type === 'pkg') {
      payload = {
        podName: 'frontend-service-67b8-x1',
        namespace: 'production',
        containerId: 'container-9821af',
        syscall: 'execve',
        process: 'apt-get',
        parentProcess: 'bash',
        arguments: 'apt-get install -y netcat-traditional',
        targetPathOrIp: undefined,
        virtualTime,
      };
    }

    const { matchedRule, runtimeEvent, triggeredQuarantine } = evaluateSyscallEvent(payload, rules);

    if (runtimeEvent) {
      setEvents((prev) => [runtimeEvent, ...prev]);

      // Emit to SOC Telemetry Bridge
      containerEventBridge.emitEvent({
        id: runtimeEvent.id,
        eventType: 'POD_EXEC',
        virtualTime,
        podName: payload.podName,
        namespace: payload.namespace,
        containerId: payload.containerId,
        process: payload.process,
        severity: runtimeEvent.severity === 'CRITICAL' ? 'threat' : 'warn',
        outcome: triggeredQuarantine ? 'DENIED' : 'ANOMALY',
        attributes: {
          syscall: payload.syscall,
          arguments: payload.arguments,
          ruleName: matchedRule?.name,
          quarantined: triggeredQuarantine,
        },
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-1">
              <Flame className="w-4 h-4" />
              <span>{isAr ? 'مختبر الرصد المباشر Falco & eBPF' : 'Falco eBPF Runtime Detection Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'اعتراض استدعاءات النواة (Syscalls) وعزل التهديدات الحية' : 'Kernel Syscall Interception & Automated Quarantine'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'استخدم تحقيقات eBPF لرصد فتح جلسات الشيل غير المصرح بها، وسرقة التوكن، والاتصال بأحواض التعدين.'
                : 'Monitor real-time Linux kernel syscalls, trigger Falco threat alerts, and isolate compromised pods.'}
            </p>
          </div>

          <button
            onClick={() => setEvents([])}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Attack Injection Trigger Panel */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {isAr ? 'محاكاة استدعاءات نظام مشبوهة (Simulate Suspicious Syscalls):' : 'Trigger Syscall Events:'}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => simulateAttackSyscall('shell')}
              className="px-3.5 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>{isAr ? 'فتح جلسة Interactive Shell داخل Pod' : 'Spawn /bin/bash Shell'}</span>
            </button>

            <button
              onClick={() => simulateAttackSyscall('shadow')}
              className="px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isAr ? 'قراءة ملف الحسابات /etc/shadow' : 'Read /etc/shadow'}</span>
            </button>

            <button
              onClick={() => simulateAttackSyscall('mining')}
              className="px-3.5 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>{isAr ? 'اتصال بحوض تعدين Monero Mining' : 'Crypto Mining Outbound'}</span>
            </button>

            <button
              onClick={() => simulateAttackSyscall('pkg')}
              className="px-3.5 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{isAr ? 'تشغيل apt-get لتنزيل Netcat' : 'Launch apt-get tool'}</span>
            </button>
          </div>
        </div>

        {/* Falco Rules List & Live Event Log */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Rules Configuration */}
          <div className="md:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'قواعد كشف Falco النشطة:' : 'Active Falco eBPF Rules:'}
            </div>

            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{rule.name}</span>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      rule.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="font-mono text-[10px] bg-slate-950 p-2 rounded text-slate-400 border border-slate-800/80 truncate">
                  {rule.condition}
                </div>
              </div>
            ))}
          </div>

          {/* Live Alerts Stream */}
          <div className="md:col-span-7 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'تدفق تنبيهات eBPF الحية:' : 'Live eBPF Alerts Stream:'}
              </div>
              <span className="text-[11px] font-mono text-cyan-400">{events.length} Alerts</span>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                {isAr
                  ? 'لا توجد تنبيهات بعد. اضغط على أزرار المحاكاة أعلاه لتوليد استدعاءات نظام مشبوهة.'
                  : 'No alerts captured yet. Click the buttons above to inject sample syscalls.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-lg bg-slate-950 border border-red-500/30 font-mono text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-red-400 font-bold">{evt.ruleName}</span>
                      <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px] font-bold">
                        {evt.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Pod: <span className="text-cyan-400">{evt.podName}</span> | Syscall:{' '}
                      <span className="text-amber-400 font-bold">{evt.syscall}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Process: <span className="text-emerald-400">{evt.process}</span> ({evt.arguments})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
