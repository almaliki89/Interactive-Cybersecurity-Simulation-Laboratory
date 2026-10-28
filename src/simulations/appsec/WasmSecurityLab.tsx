import React, { useState, useMemo } from 'react';
import {
  Code,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Cpu,
  Play,
  Layers,
  FileCode,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';

interface WasmSecurityLabProps {
  language?: 'ar' | 'en';
}

interface WasmScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'LINEAR_MEM_OOB' | 'WASI_CAPABILITY_BYPASS' | 'WASMJIT_SPECTRE';
  watCodeSnippet: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const WASM_SCENARIOS: WasmScenario[] = [
  {
    id: 'WASM-01',
    nameEn: 'Linear Memory Out-of-Bounds Buffer Read/Write',
    nameAr: 'تجاوز حدود الذاكرة الخطية (OOB) في بيئة Wasm',
    category: 'LINEAR_MEM_OOB',
    watCodeSnippet: `(module
  (memory (export "memory") 1) ;; 1 page = 64KB
  (func (export "read_oob") (param $ptr i32) (result i32)
    local.get $ptr
    i32.load offset=65540 ;; Out-of-bounds offset past 64KB boundary
  )
)`,
    descriptionEn: 'Attacker passes a manipulated pointer index attempting to read linear memory outside the allocated 64KB WebAssembly page buffer.',
    descriptionAr: 'يمرر المهاجم مؤشر ذاكرة متلاعب به لقراءة قيم خارج النطاق المخصص البالغ 64 كيلوبايت لبيئة Wasm.',
    isThreat: true,
  },
  {
    id: 'WASM-02',
    nameEn: 'WASI Host File Descriptor Capability Leak',
    nameAr: 'تسريب صلاحيات الملفات في واجهة WASI بالنظام',
    category: 'WASI_CAPABILITY_BYPASS',
    watCodeSnippet: `(module
  (import "wasi_snapshot_preview1" "path_open" 
    (func $path_open (param i32 i32 i32 i32 i32 i64 i64 i32 i32) (result i32)))
  ;; Attacker attempts path_open for "/etc/shadow" using root FD 3
)`,
    descriptionEn: 'Untrusted Wasm module invokes WASI path_open with root file descriptor 3 to access sensitive host system credentials.',
    descriptionAr: 'وحدة Wasm غير موثوقة تحاول استدعاء WASI لقراءة ملفات النظام الحساسة باستخدام مقبض المجلد الرئيسي.',
    isThreat: true,
  },
  {
    id: 'WASM-03',
    nameEn: 'Wasm JIT Microarchitectural Spectre Side-Channel',
    nameAr: 'هجوم الموقّت القائم على Spectre في محرك JIT لـ Wasm',
    category: 'WASMJIT_SPECTRE',
    watCodeSnippet: `;; High-precision SharedArrayBuffer loop timer
(loop $side_channel
  i32.atomic.load
  i64.extend_i32_u
  ;; Measure cache hit/miss latency for speculative execution leak
)`,
    descriptionEn: 'Attacker leverages high-precision SharedArrayBuffer atomic timers inside Wasm to extract host memory cache line state.',
    descriptionAr: 'استغلال مؤقتات SharedArrayBuffer المرتفعة الدقة لقياس زمن استجابة الذاكرة المخبئية واستخراج بيانات المضيف.',
    isThreat: true,
  },
];

export const WasmSecurityLab: React.FC<WasmSecurityLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('WASM-01');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [wasmLog, setWasmLog] = useState<{
    status: 'BLOCKED_BY_WASMSANDBOX' | 'WASM_EXPLOITED';
    vmResponse: string;
    details: string;
    activeDefenses: string[];
  } | null>(null);

  // Wasm Sandbox Guardrails
  const [defenseMemoryBoundsGuard, setDefenseMemoryBoundsGuard] = useState<boolean>(false);
  const [defenseWasiCapabilityRestrict, setDefenseWasiCapabilityRestrict] = useState<boolean>(false);
  const [defenseSpectreTimerCoarsening, setDefenseSpectreTimerCoarsening] = useState<boolean>(false);

  const scenario = useMemo(
    () => WASM_SCENARIOS.find((w) => w.id === selectedScenarioId) || WASM_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleExecuteWasm = () => {
    setIsExecuting(true);
    setWasmLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'LINEAR_MEM_OOB' && defenseMemoryBoundsGuard) {
        activeDefenses.push('WebAssembly Guard Pages & Hardware Memory Bounds Trap');
        isBlocked = true;
      } else if (scenario.category === 'WASI_CAPABILITY_BYPASS' && defenseWasiCapabilityRestrict) {
        activeDefenses.push('WASI Capability Strict Whitelist (Deny FD Root Access)');
        isBlocked = true;
      } else if (scenario.category === 'WASMJIT_SPECTRE' && defenseSpectreTimerCoarsening) {
        activeDefenses.push('SharedArrayBuffer Timer Resolution Degradation (Coarsened to 100μs)');
        isBlocked = true;
      }

      if (isBlocked) {
        setWasmLog({
          status: 'BLOCKED_BY_WASMSANDBOX',
          vmResponse: isAr
            ? '[تم احتواء الخطر داخل حاوية Wasm] تم إطلاق Trap بالنظام وإيقاف تنفيذ الكود فوراً.'
            : 'Runtime Trap Exception: WebAssembly execution safely halted by active sandbox guardrail.',
          details: isAr ? 'تم منع تجاوز الذاكرة أو تسريب الصلاحيات عتادياً.' : 'Trap / Capability Access Denied. Host filesystem & memory protected.',
          activeDefenses,
        });
      } else {
        setWasmLog({
          status: 'WASM_EXPLOITED',
          vmResponse: isAr
            ? `[تم تجاوز حاوية Wasm!] ${scenario.watCodeSnippet}`
            : `[WASM SANDBOX BREACHED] Code executed without bounds trap: ${scenario.watCodeSnippet}`,
          details: isAr ? 'تحذير: تم قراءة بيانات خارج النطاق أو استغلال الصلاحيات!' : 'CRITICAL WASM VULNERABILITY: Memory leaked or host WASI file opened.',
          activeDefenses: [],
        });
      }

      setIsExecuting(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان الحاوية البرمجية WebAssembly (Wasm Sandbox Security)' : 'WebAssembly Sandbox & WASI Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 rounded-full font-mono">
                W3C Wasm Core 2.0
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لتجاوز حدود الذاكرة الخطية Wasm، وصلاحيات WASI، وهجمات Spectre الجانبية.'
                : 'Interactive Wasm linear memory bounds checking, WASI capability access control, and JIT Spectre mitigations.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة محرك Wasm JIT:' : 'Wasm Engine Status:'}</span>
          <span className="px-2 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded font-bold">
            V8 / Wasmtime JIT (ISOLATED)
          </span>
        </div>
      </div>

      {/* Main Grid: Wasm WAT Code Inspector + Sandbox Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات ثغرات WebAssembly' : 'Wasm Attack Scenarios'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {WASM_SCENARIOS.map((sc) => {
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
                      {sc.category}
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

          {/* Wasm Sandbox Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع حماية محرك Wasm (Sandbox Guardrails)' : 'Wasm Sandbox Defenses'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'صفحات الحماية وتدقيق الذاكرة الخطية' : 'Hardware Memory Guard Pages & Bounds Trap'}</span>
                <input
                  type="checkbox"
                  checked={defenseMemoryBoundsGuard}
                  onChange={(e) => setDefenseMemoryBoundsGuard(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تقييد صلاحيات ملفات WASI الصارمة' : 'WASI Strict Capability Whitelisting'}</span>
                <input
                  type="checkbox"
                  checked={defenseWasiCapabilityRestrict}
                  onChange={(e) => setDefenseWasiCapabilityRestrict(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تقليل دقة المؤقتات ضد هجمات Spectre' : 'SharedArrayBuffer Timer Coarsening (100μs)'}</span>
                <input
                  type="checkbox"
                  checked={defenseSpectreTimerCoarsening}
                  onChange={(e) => setDefenseSpectreTimerCoarsening(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: WAT Bytecode & VM Execution Log */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              {isAr ? 'محرر ومحلل كود Wasm Text Format (WAT)' : 'Wasm WAT Bytecode Inspector'}
            </h3>
            <button
              onClick={handleExecuteWasm}
              disabled={isExecuting}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-cyan-400/30 disabled:opacity-50"
            >
              {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'تشغيل كود Wasm' : 'Execute Wasm Module'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-2">
            <span className="text-slate-400 font-bold block">{isAr ? 'كود Wasm النصي (WAT Source Code):' : 'Wasm WAT Bytecode:'}</span>
            <pre className="p-2.5 bg-slate-900 border border-slate-800 text-cyan-300 rounded text-[11px] overflow-x-auto max-h-[160px]">
              {scenario.watCodeSnippet}
            </pre>
          </div>

          {/* VM Execution Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشغيل Wasm Sandbox VM' : 'Wasm Runtime VM Telemetry'}</span>
            </div>

            {wasmLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    wasmLog.status === 'BLOCKED_BY_WASMSANDBOX'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {wasmLog.status === 'BLOCKED_BY_WASMSANDBOX' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم احتواء الهجوم داخل حاوية Wasm' : 'WASM TRAP CAUGHT - HOST SAFE'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم اختراق حاوية Wasm!' : 'CRITICAL WASM VULNERABILITY EXPLOITED'}</span>
                      </>
                    )}
                  </div>
                  {wasmLog.vmResponse}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {wasmLog.details}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Code className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "تشغيل كود Wasm" لمعاينة استجابة الحاوية.'
                    : 'Select a Wasm scenario and click "Execute Wasm Module".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
