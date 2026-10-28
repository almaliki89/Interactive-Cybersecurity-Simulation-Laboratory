import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Layers,
  Lock,
  Unlock,
  RefreshCw,
  Play,
  Code,
  Box,
  FileCode,
  AlertTriangle,
} from 'lucide-react';

interface EbpfRuntimeLabProps {
  language?: 'ar' | 'en';
}

interface KernelEventScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'CONTAINER_ESCAPE' | 'REVERSE_SHELL' | 'ROOTKIT_LOAD';
  probeType: string;
  syscall: string;
  pid: number;
  comm: string;
  cgroupPath: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const KERNEL_SCENARIOS: KernelEventScenario[] = [
  {
    id: 'EBPF-01',
    nameEn: 'Container Escape via Unshare Syscall',
    nameAr: 'الهروب من الحاوية عبر أمر unshare بالنواة',
    category: 'CONTAINER_ESCAPE',
    probeType: 'tracepoint/sys_enter_unshare',
    syscall: 'sys_unshare(CLONE_NEWNS | CLONE_NEWPID)',
    pid: 4092,
    comm: 'nsenter_breakout',
    cgroupPath: '/docker/a8f192b00192/kube-system',
    descriptionEn: 'Process attempts to break out of Docker PID & mount namespaces using unshare syscall with mounted /host/proc.',
    descriptionAr: 'تحاول العملية الخروج من معازل Docker للنواة باستخدام أمر unshare بمسار /host/proc المربوط.',
    isThreat: true,
  },
  {
    id: 'EBPF-02',
    nameEn: 'Out-of-Bounds Network Socket Connect',
    nameAr: 'الاتصال بشبكة خارجية عبر مقبس النواة',
    category: 'REVERSE_SHELL',
    probeType: 'kprobe/tcp_v4_connect',
    syscall: 'sys_connect(af_inet, 185.220.101.4:4444)',
    pid: 5120,
    comm: 'sh',
    cgroupPath: '/docker/c9812739102/prod-api',
    descriptionEn: 'Reverse shell payload spawned inside web container initiating raw TCP socket connection to external C2 node.',
    descriptionAr: 'قذيفة عكسية تم تشغيلها داخل حاوية الويب لإنشاء اتصال TCP مباشر مع خادم التحكم الخارجي.',
    isThreat: true,
  },
  {
    id: 'EBPF-03',
    nameEn: 'Unsigned Kernel Module Insertion',
    nameAr: 'تحميل وحدة نواة غير موثوقة (Rootkit)',
    category: 'ROOTKIT_LOAD',
    probeType: 'kprobe/sys_finit_module',
    syscall: 'sys_finit_module(fd=4, param="steal_credentials=1")',
    pid: 1044,
    comm: 'insmod',
    cgroupPath: '/host/system.slice',
    descriptionEn: 'Unauthorized user attempts to load malicious LKM rootkit to intercept system call table inside host kernel.',
    descriptionAr: 'محاولة مستخدم غير مصرح به تحميل وحدة LKM لتعقّب والالتفاف على جدول استدعاءات النواة.',
    isThreat: true,
  },
];

export const EbpfRuntimeLab: React.FC<EbpfRuntimeLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('EBPF-01');
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [traceLog, setTraceLog] = useState<{
    status: 'BLOCKED_BY_EBPF' | 'KERNEL_EXPLOITED' | 'NORMAL';
    kprobeDetails: string;
    actionTaken: string;
    kernelReturnCode: number;
    activeRulesTriggered: string[];
  } | null>(null);

  // eBPF Tetragon Enforcement Policies
  const [enforceNamespaceLock, setEnforceNamespaceLock] = useState<boolean>(false);
  const [enforceEgressIpFilter, setEnforceEgressIpFilter] = useState<boolean>(false);
  const [enforceKernelModuleSignatures, setEnforceKernelModuleSignatures] = useState<boolean>(false);

  const scenario = useMemo(
    () => KERNEL_SCENARIOS.find((s) => s.id === selectedScenarioId) || KERNEL_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunTrace = () => {
    setIsTracing(true);
    setTraceLog(null);

    setTimeout(() => {
      const activeRules: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'CONTAINER_ESCAPE' && enforceNamespaceLock) {
        activeRules.push('Tetragon Policy: Block Unshare / Namespace Mutate Syscalls');
        isBlocked = true;
      } else if (scenario.category === 'REVERSE_SHELL' && enforceEgressIpFilter) {
        activeRules.push('Cilium Policy: Kernel Socket Egress Filter (Deny Port 4444)');
        isBlocked = true;
      } else if (scenario.category === 'ROOTKIT_LOAD' && enforceKernelModuleSignatures) {
        activeRules.push('eBPF LSM Policy: Reject Unsigned LKM Module Load (-EPERM)');
        isBlocked = true;
      }

      if (isBlocked) {
        setTraceLog({
          status: 'BLOCKED_BY_EBPF',
          kprobeDetails: `eBPF Probe Intercepted ${scenario.syscall} for PID ${scenario.pid} (${scenario.comm}). Override returned -EPERM (Operation not permitted). Process terminated via SIGKILL.`,
          actionTaken: isAr ? 'تم إحباط محاولة الخرق بالنواة عبر eBPF LSM قبل التنفيذ.' : 'Kernel probe intervened at ring buffer level. Execution halted safely.',
          kernelReturnCode: -1, // -EPERM
          activeRulesTriggered: activeRules,
        });
      } else {
        setTraceLog({
          status: 'KERNEL_EXPLOITED',
          kprobeDetails: `Syscall ${scenario.syscall} executed with privilege level RING 0. Cgroup boundary breached!`,
          actionTaken: isAr ? 'تحذير: تم تنفيذ أمر النواة وحصول اختراق للحاوية لغياب سياسات eBPF!' : 'ALERT: Privilege escalation / escape payload executed directly in kernel memory space.',
          kernelReturnCode: 0, // Success
          activeRulesTriggered: [],
        });
      }

      setIsTracing(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان النواة المتقدم وتتبع eBPF / Tetragon' : 'eBPF Kernel Tracing & Runtime Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 rounded-full font-mono">
                Linux Kernel 6.x / eBPF LSM
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'تتبع أحداث النواة، واكتشاف محاولات الخروج من الحاويات، وتطبيق سياسات Tetragon بدون إجهاد النظام.'
                : 'Interactive kernel tracepoint analysis, container breakout detection, and zero-overhead eBPF security policies.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة مسبار النواة:' : 'eBPF Sensor State:'}</span>
          <span className="px-2 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded font-bold">
            ATTACHED (kprobe / tracepoint)
          </span>
        </div>
      </div>

      {/* Main Grid: Kernel Event Scenarios + eBPF Bytecode & Tetragon Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Scenarios & Tetragon Rules */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات استدعاءات النواة (Syscalls)' : 'Kernel Syscall Traces'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {KERNEL_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 text-slate-100 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{sc.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {sc.probeType}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? sc.nameAr : sc.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? sc.descriptionAr : sc.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* eBPF / Tetragon Defense Rules */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'سياسات حماية eBPF / Tetragon' : 'Tetragon eBPF Security Policies'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'حظر تعديل معازل النواة (Unshare)' : 'Block Unshare / Namespace Escapes'}</span>
                <input
                  type="checkbox"
                  checked={enforceNamespaceLock}
                  onChange={(e) => setEnforceNamespaceLock(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'فلترة المقابض والخروج (Egress Socket Filter)' : 'Kernel Socket Egress Port Guard'}</span>
                <input
                  type="checkbox"
                  checked={enforceEgressIpFilter}
                  onChange={(e) => setEnforceEgressIpFilter(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'رفض تحميل برامج LKM غير الموقعة' : 'eBPF LSM Module Signature Enforcer'}</span>
                <input
                  type="checkbox"
                  checked={enforceKernelModuleSignatures}
                  onChange={(e) => setEnforceKernelModuleSignatures(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: eBPF Bytecode & Kernel Telemetry Log */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              {isAr ? 'تفاصيل حدث النواة وبث التتبع' : 'Kernel Event Telemetry Stream'}
            </h3>
            <button
              onClick={handleRunTrace}
              disabled={isTracing}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-cyan-400/30 disabled:opacity-50"
            >
              {isTracing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'تنفيذ التتبع بالنواة' : 'Trigger Kernel Trace'}
            </button>
          </div>

          {/* Syscall Metadata Box */}
          <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800 pb-1">
              <span>Probe: <strong className="text-cyan-300">{scenario.probeType}</strong></span>
              <span>PID: <strong className="text-amber-300">{scenario.pid}</strong> ({scenario.comm})</span>
            </div>
            <div className="text-slate-300">
              <span>Syscall Payload: </span>
              <span className="text-emerald-400 font-bold">{scenario.syscall}</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              <span>Cgroup Namespace Path: </span>
              <span>{scenario.cgroupPath}</span>
            </div>
          </div>

          {/* eBPF Sensor Log Display */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل أحداث حلقة eBPF Ring Buffer' : 'eBPF Ring Buffer Event Telemetry'}</span>
              {traceLog && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    traceLog.status === 'BLOCKED_BY_EBPF'
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950 border border-rose-800 text-rose-300'
                  }`}
                >
                  Return Code: {traceLog.kernelReturnCode}
                </span>
              )}
            </div>

            {traceLog ? (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded border text-xs font-mono ${
                    traceLog.status === 'BLOCKED_BY_EBPF'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {traceLog.status === 'BLOCKED_BY_EBPF' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم حظر العملية بالنواة ببراعة (-EPERM)' : 'INTERCEPTED BY eBPF PROBE (-EPERM)'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم تنفيذ العملية الخاطئة بدون حجب!' : 'KERNEL SYSCALL EXPLOITED WITHOUT GUARD'}</span>
                      </>
                    )}
                  </div>
                  {traceLog.kprobeDetails}
                </div>

                {traceLog.activeRulesTriggered.length > 0 && (
                  <div className="text-xs bg-slate-900 border border-slate-800 rounded p-2">
                    <span className="text-slate-400 font-bold block mb-1">{isAr ? 'قواعد Tetragon المطبقة:' : 'Triggered Tetragon Rules:'}</span>
                    {traceLog.activeRulesTriggered.map((rule, idx) => (
                      <span key={idx} className="text-emerald-300 font-mono block">✓ {rule}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Activity className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'انقر على "تنفيذ التتبع بالنواة" لمعاينة التقاط أحداث eBPF واختبار حماية Tetragon.'
                    : 'Click "Trigger Kernel Trace" to simulate syscall execution and test eBPF ring buffer response.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
