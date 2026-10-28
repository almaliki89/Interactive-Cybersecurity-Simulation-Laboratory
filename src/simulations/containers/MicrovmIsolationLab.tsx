import React, { useState, useMemo } from 'react';
import {
  Box,
  Layers,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Cpu,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Server,
  Cloud,
  HardDrive,
} from 'lucide-react';

interface MicrovmIsolationLabProps {
  language?: 'ar' | 'en';
}

interface SandboxScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  isolationTier: 'STANDARD_RUNC' | 'MULTI_TENANT_K8S' | 'SHARED_HOST_KERNEL';
  breakoutVector: string;
  cveId: string;
  descriptionEn: string;
  descriptionAr: string;
  hostCompromiseImpact: string;
  hostCompromiseImpactAr: string;
}

const SANDBOX_SCENARIOS: SandboxScenario[] = [
  {
    id: 'SANDBOX-01',
    nameEn: 'Shared Kernel runc Container Escape via /proc/self/exe Hijack',
    nameAr: 'الهروب من الحاوية المشتركة عبر استبدال ثنائي runc في /proc/self/exe',
    isolationTier: 'STANDARD_RUNC',
    breakoutVector: 'Opening file descriptor to host runc binary during container creation; overwriting host binary with reverse shell payload.',
    cveId: 'CVE-2019-5736 (runc Host Binary Overwrite & Container Breakout)',
    descriptionEn: 'Attacker leverages shared Linux kernel namespace deficiency to overwrite host runc binary with root permissions, escaping container jail.',
    descriptionAr: 'المهاجم يستغل النواة المشتركة لكتابة كود خبيث في ملف runc الأصلي على الخادم المضيف والحصول على شيل بصلاحيات root.',
    hostCompromiseImpact: 'Full Host Node Takeover & Neighboring Pods Pwned',
    hostCompromiseImpactAr: 'استيلاء كامل على الخادم المضيف والوصول لجميع حاويات العملاء الآخرين',
  },
  {
    id: 'SANDBOX-02',
    nameEn: 'Multi-Tenant K8s Container cgroups release_agent Privilege Escalation',
    nameAr: 'تصعيد الصلاحيات عبر آلية cgroups release_agent في Kubernetes',
    isolationTier: 'MULTI_TENANT_K8S',
    breakoutVector: 'Mounting cgroup v1 hierarchy within privileged container; setting release_agent script triggered by host kernel on exit.',
    cveId: 'CVE-2022-0492 (cgroups v1 Kernel Escape via release_agent)',
    descriptionEn: 'Exploiting missing capability checks on release_agent file allows executing arbitrary binaries on host kernel upon container exit.',
    descriptionAr: 'استغلال غياب التحقق من صلاحيات ملف release_agent لتنفيذ أوامر مباشرة على نواة الخادم عند إنهاء الحاوية.',
    hostCompromiseImpact: 'Host Kernel Ring-0 Execution & Host Secrets Stolen',
    hostCompromiseImpactAr: 'تنفيذ أكواد في نواة النظام Ring-0 وسرقة أسرار العقدة السحابية بالكامل',
  },
  {
    id: 'SANDBOX-03',
    nameEn: 'Cloud Virtualization virtio-mem Heap Overflow in Shared VM',
    nameAr: 'طفحان الذاكرة virtio-mem وتجاوز عزل الأجهزة الافتراضية',
    isolationTier: 'SHARED_HOST_KERNEL',
    breakoutVector: 'Triggering integer underflow in virtio memory balloon device model during dynamic memory resizing request.',
    cveId: 'CVE-2021-3748 (QEMU virtio-net / virtio-mem Heap Buffer Overflow)',
    descriptionEn: 'Corrupting device emulation state inside QEMU hypervisor to write arbitrary shellcode into the virtualization management daemon.',
    descriptionAr: 'إفساد حالة محاكاة العتاد داخل برنامج QEMU للكتابة في ذاكرة عملية المضيف والخروج من الآلة الافتراضية.',
    hostCompromiseImpact: 'Cloud Hypervisor Escape to Bare-Metal Infrastructure',
    hostCompromiseImpactAr: 'الهروب من المشرف الافتراضي والوصول إلى العتاد الفيزيائي للبنية السحابية',
  },
];

export const MicrovmIsolationLab: React.FC<MicrovmIsolationLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SANDBOX-01');
  const [isEscaping, setIsEscaping] = useState<boolean>(false);
  const [sandboxLog, setSandboxLog] = useState<{
    status: 'SANDBOX_CONTAINED' | 'HOST_KERNEL_PWNED';
    isolationTelemetry: string;
    hypervisorReport: string;
    activeDefenses: string[];
  } | null>(null);

  // MicroVM & Sandboxing Defenses
  const [defenseKataContainers, setDefenseKataContainers] = useState<boolean>(false);
  const [defenseFirecrackerJailer, setDefenseFirecrackerJailer] = useState<boolean>(false);
  const [defenseGvisorRunsc, setDefenseGvisorRunsc] = useState<boolean>(false);

  const scenario = useMemo(
    () => SANDBOX_SCENARIOS.find((s) => s.id === selectedScenarioId) || SANDBOX_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTriggerContainerBreakout = () => {
    setIsEscaping(true);
    setSandboxLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.id === 'SANDBOX-01') {
        if (defenseKataContainers) {
          activeDefenses.push('Kata Containers (Hardware QEMU/KVM Isolation): Independent guest kernel trapped runc overwrite inside throwaway VM');
          isBlocked = true;
        } else if (defenseGvisorRunsc) {
          activeDefenses.push('gVisor Sentry Sandboxing: /proc/self/exe virtualized entirely in userland, direct host binary access blocked');
          isBlocked = true;
        }
      } else if (scenario.id === 'SANDBOX-02') {
        if (defenseFirecrackerJailer) {
          activeDefenses.push('AWS Firecracker MicroVM Jailer: Dedicated per-function microVM, host cgroups inaccessible to guest kernel');
          isBlocked = true;
        } else if (defenseGvisorRunsc) {
          activeDefenses.push('gVisor Runsc: Synthetic cgroup subsystem intercepted; host kernel release_agent handler never invoked');
          isBlocked = true;
        }
      } else if (scenario.id === 'SANDBOX-03') {
        if (defenseFirecrackerJailer) {
          activeDefenses.push('Minimal Device Emulation (Firecracker Rust VMM): No bloated virtio-mem or legacy device models to corrupt');
          isBlocked = true;
        } else if (defenseKataContainers) {
          activeDefenses.push('Cloud Hypervisor Sandbox: Memory isolation backed by Rust memory-safe virtualization layer');
          isBlocked = true;
        }
      }

      if (isBlocked) {
        setSandboxLog({
          status: 'SANDBOX_CONTAINED',
          isolationTelemetry: isAr
            ? '[تم احتواء محاولة الهروب بنجاح] حواجز MicroVM أو حاويات Kata أو gVisor عزلت الهجوم داخل النواة الافتراضية المستقلة.'
            : '[SANDBOX ESCAPE CONTAINED] MicroVM hardware boundary or gVisor userland kernel trapped the breakout attempt.',
          hypervisorReport: isAr
            ? 'نواة الخادم المضيف آمنة بنسبة 100%. لم يتم تسريب أي صلاحيات أو المساس بحاويات المستأجرين الآخرين.'
            : 'Host OS kernel 100% untampered. Zero multi-tenant cross-contamination.',
          activeDefenses,
        });
      } else {
        setSandboxLog({
          status: 'HOST_KERNEL_PWNED',
          isolationTelemetry: `BREAKOUT SUCCESSFUL: Host filesystem root mounted! Execution hijacked: ${scenario.breakoutVector}`,
          hypervisorReport: isAr
            ? `إنذار أمني حرج: ${scenario.hostCompromiseImpactAr} بسبب الاعتماد على حاويات runc ذات النواة المشتركة!`
            : `CRITICAL HOST BREACH: ${scenario.hostCompromiseImpact} due to weak shared kernel isolation!`,
          activeDefenses: [],
        });
      }

      setIsEscaping(false);
    }, 450);
  };

  const handleResetSandbox = () => {
    setSandboxLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Box className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr
                ? 'مختبر عزل الحاويات والآلات الافتراضية المصغرة (MicroVM & Kata Sandbox Lab)'
                : 'MicroVM & Advanced Container Isolation Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800 rounded-full font-mono">
                Kata / Firecracker / gVisor
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة متقدمة للهروب من حاويات runc المشتركة واختراق النواة، ومقارنتها مع تقنيات العزل العتادي Kata و Firecracker و gVisor.'
                : 'Simulate container escapes, shared kernel breakouts, and enforce hardware-assisted MicroVM tenant isolation.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetSandbox}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط بيئة العزل' : 'Reset Sandbox'}
        </button>
      </div>

      {/* Main Grid: Left Scenario Selector & Defenses, Right Breakout Console & Host Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Sandbox Breakout Scenarios & MicroVM Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            {isAr ? 'سيناريوهات الهروب وتجاوز الحاويات' : 'Container & Hypervisor Escape Vectors'}
          </h3>

          <div className="space-y-2">
            {SANDBOX_SCENARIOS.map((ss) => {
              const isSelected = ss.id === selectedScenarioId;
              return (
                <button
                  key={ss.id}
                  onClick={() => {
                    setSelectedScenarioId(ss.id);
                    setSandboxLog(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400">{ss.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {ss.isolationTier}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? ss.nameAr : ss.nameEn}</span>
                  <div className="text-[10px] text-amber-400 font-mono">{ss.cveId}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? ss.descriptionAr : ss.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* MicroVM & Sandboxing Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع عزل MicroVM والآلات المصغرة' : 'MicroVM & Runtime Hardening Defenses'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'عزل الحاويات بنواة افتراضية مستقلة (Kata Containers KVM)' : 'Kata Containers (Hardware-Assisted KVM per Pod)'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseKataContainers}
                  onChange={(e) => setDefenseKataContainers(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'آلات افتراضية فائقة الصغر (AWS Firecracker MicroVM)' : 'AWS Firecracker MicroVM with Seccomp Jailer'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseFirecrackerJailer}
                  onChange={(e) => setDefenseFirecrackerJailer(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'اعتراض استدعاءات النواة في فضاء المستخدم (gVisor Runsc)' : 'gVisor Sentry Userland Syscall Interception'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseGvisorRunsc}
                  onChange={(e) => setDefenseGvisorRunsc(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Breakout Console & Host OS Telemetry */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              {isAr ? 'شاشة محاكاة استغلال النواة والهروب' : 'Exploit Injection & Host Kernel Telemetry'}
            </h3>
            <button
              onClick={handleTriggerContainerBreakout}
              disabled={isEscaping}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-indigo-400/30 disabled:opacity-50"
            >
              {isEscaping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'إطلاق هجوم الهروب من الحاوية' : 'Trigger Container Breakout Exploit'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'طبقة العزل المستهدفة:' : 'Target Isolation Tier:'}</span>
              <span className="text-indigo-400 font-bold">{scenario.isolationTier}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الأثر الأمني على الخادم المضيف:' : 'Host Node Impact:'}</span>
              <span className="text-amber-400 font-bold">{isAr ? scenario.hostCompromiseImpactAr : scenario.hostCompromiseImpact}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'شفرة استغلال النواة للهروب:' : 'Kernel Breakout Vector Details:'}</span>
            <p className="p-2 bg-slate-900 border border-slate-800 text-indigo-300 rounded text-[11px] leading-relaxed">
              {scenario.breakoutVector}
            </p>
          </div>

          {/* Sandbox Diagnostics Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشخيص المشرف الافتراضي والنواة' : 'Kernel Boundary & Sandbox Diagnostics'}</span>
            </div>

            {sandboxLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    sandboxLog.status === 'SANDBOX_CONTAINED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {sandboxLog.status === 'SANDBOX_CONTAINED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم احتواء الهروب في النواة المستقلة' : 'MICROVM ISOLATION INTACT'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'تم اختراق نواة الخادم المضيف بالكامل!' : 'CRITICAL HOST KERNEL ESCAPE'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{sandboxLog.isolationTelemetry}</p>
                  <p className="text-[11px] mt-1 font-semibold text-amber-300">{sandboxLog.hypervisorReport}</p>
                </div>

                {sandboxLog.activeDefenses.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {isAr ? 'الدفاعات العتادية المفعلة بنجاح:' : 'Active Hardware Sandboxing Countermeasures:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {sandboxLog.activeDefenses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Box className="w-8 h-8 mb-2 opacity-30 text-indigo-400" />
                <p>
                  {isAr
                    ? 'الحاوية قيد التشغيل. اضغط "إطلاق هجوم الهروب من الحاوية" لاختبار صلابة عزل MicroVM أو انكشاف النواة المشتركة.'
                    : 'Container running in namespace. Click "Trigger Container Breakout Exploit" to test host kernel exposure.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
