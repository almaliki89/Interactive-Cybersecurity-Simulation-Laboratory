import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { MemoryExploitRopLab } from './MemoryExploitRopLab';
import { HardwareRowhammerLab } from './HardwareRowhammerLab';
import {
  Cpu,
  Layers,
  Terminal,
  Activity,
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  HardDrive,
  Flame,
  Binary,
  Grid3X3,
} from 'lucide-react';

export const SystemInternalsSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const [activeTab, setActiveTab] = useState<'layout' | 'rop_lab' | 'hardware_hacks'>('layout');
  const [activeSegment, setActiveSegment] = useState<'stack' | 'heap' | 'code' | 'data'>('stack');
  const [aslrEnabled, setAslrEnabled] = useState(true);
  const [depEnabled, setDepEnabled] = useState(true);
  const [spawnedProcess, setSpawnedProcess] = useState(false);

  const challenge: Challenge = {
    id: 'internals-memory-challenge',
    simulationId: 'system_internals',
    title: language === 'ar' ? 'تحدي تحصين مساحة الذاكرة والنواة' : 'Memory Layout & Kernel Hardening Challenge',
    difficulty: 'Beginner',
    category: language === 'ar' ? 'عمارة الأنظمة والذاكرة' : 'System Internals',
    mission:
      language === 'ar'
        ? 'افحص تقسيم الذاكرة وفعل آليات الحماية مثل عشوائية فضاء العناوين (ASLR) ومنع التنفيذ في المكدس (DEP/NX).'
        : 'Inspect process memory layout and enable ASLR and DEP/NX memory protections.',
    initialExplanation:
      language === 'ar'
        ? 'المكدس Stack مخصص لإطارات الدوال، والكومة Heap للذاكرة الديناميكية. تقنيات ASLR و DEP تمنع هجمات حقن الأكواد.'
        : 'Stack stores local frames and return addresses; Heap manages dynamic malloc buffers. ASLR & DEP prevent code injection exploits.',
    objectives: [
      {
        id: 'obj-aslr',
        title: language === 'ar' ? 'تفعيل حماية ASLR' : 'Enable ASLR Protection',
        description: language === 'ar' ? 'تغيير عشوائي لعناوين الذاكرة عند كل تشغيل' : 'Randomize stack and heap base addresses',
        isCompleted: aslrEnabled,
        validationKey: 'aslr_ok',
      },
      {
        id: 'obj-dep',
        title: language === 'ar' ? 'تفعيل بت منع التنفيذ (DEP / NX)' : 'Enable DEP / NX Bit',
        description: language === 'ar' ? 'منع تشغيل الأكواد البرمجية من مساحة المكدس' : 'Mark stack pages as non-executable',
        isCompleted: depEnabled,
        validationKey: 'dep_ok',
      },
    ],
    hints: [
      language === 'ar' ? 'تأكد من تفعيل خيارات ASLR و DEP في شريط التحكم.' : 'Ensure ASLR and DEP toggles are active.',
    ],
  };

  const validateChallenge = () => {
    if (aslrEnabled && depEnabled) {
      return {
        success: true,
        message:
          language === 'ar'
            ? 'تم تحصين تخطيط الذاكرة بنجاح ضد ثغرات طفحان المخزن المؤقت!'
            : 'Memory layout hardened against memory corruption exploits!',
      };
    }
    return {
      success: false,
      message: language === 'ar' ? 'قم بتفعيل حمايات الذاكرة المطلوبة.' : 'Enable memory protections.',
    };
  };

  return (
    <Workspace
      title={language === 'ar' ? 'محاكي عمارة الحاسوب وتخطيط الذاكرة واستدعاءات النظام' : 'Computer Internals & Memory Layout Simulator'}
      subtitle={language === 'ar' ? 'المكدس Stack، الكومة Heap، مساحة النواة، وحمايات الذاكرة' : 'Stack, Heap, Syscalls & Kernel Space Protection'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab('layout')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'layout'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'فضاء الذاكرة والنواة' : 'Memory & Kernel Layout'}</span>
              </button>
              <button
                onClick={() => setActiveTab('rop_lab')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'rop_lab'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'هجمات الذاكرة وسلاسل ROP' : 'ROP & Memory Exploits'}</span>
              </button>
              <button
                onClick={() => setActiveTab('hardware_hacks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'hardware_hacks'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'اختراق العتاد (Rowhammer)' : 'Hardware Hacks'}</span>
              </button>
            </div>

            {activeTab === 'layout' && (
              <button
                onClick={() => setSpawnedProcess(true)}
                className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'ar' ? 'تشغيل عملية جديدة (Spawn Process)' : 'Spawn Process'}</span>
              </button>
            )}
          </div>

          {activeTab === 'layout' && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                <input
                  type="checkbox"
                  checked={aslrEnabled}
                  onChange={(e) => setAslrEnabled(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500"
                />
                <span>{language === 'ar' ? 'عشوائية الذاكرة (ASLR)' : 'ASLR Enabled'}</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                <input
                  type="checkbox"
                  checked={depEnabled}
                  onChange={(e) => setDepEnabled(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500"
                />
                <span>{language === 'ar' ? 'منع التنفيذ (DEP / NX)' : 'DEP / NX Bit'}</span>
              </label>
            </div>
          )}
        </div>
      }
    >
      {activeTab === 'rop_lab' ? (
        <div className="flex-1 overflow-y-auto">
          <MemoryExploitRopLab language={language} />
        </div>
      ) : activeTab === 'hardware_hacks' ? (
        <div className="flex-1 overflow-y-auto">
          <HardwareRowhammerLab language={language} />
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        {/* Memory Architecture Visualizer */}
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Virtual Process Memory Map */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase block mb-1">
              {language === 'ar' ? 'خريطة فضاء الذاكرة الافتراضية (0x0000 -> 0xFFFF)' : 'Process Virtual Memory Map'}
            </span>

            <div className="space-y-1.5 font-mono text-xs">
              <div
                onClick={() => setActiveSegment('stack')}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeSegment === 'stack'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">0x7FFF... [STACK - المكدس]</span>
                  <span className="text-[10px]">{aslrEnabled ? 'ASLR: Randomized' : 'Fixed Base'}</span>
                </div>
                <span className="text-[11px] block mt-0.5 opacity-80">
                  {language === 'ar' ? 'المتغيرات المحلية وإطارات الدوال وعناوين العودة' : 'Local variables, stack frames & return addresses'}
                </span>
              </div>

              <div className="py-2 text-center text-slate-600 text-[10px]">
                ↓ {language === 'ar' ? 'نمو المكدس للأسفل' : 'Stack grows down'} · {language === 'ar' ? 'نمو الكومة للأعلى' : 'Heap grows up'} ↑
              </div>

              <div
                onClick={() => setActiveSegment('heap')}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeSegment === 'heap'
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">0x0055... [HEAP - الكومة]</span>
                  <span className="text-[10px]">{language === 'ar' ? 'تخصيص ديناميكي' : 'Dynamic malloc'}</span>
                </div>
                <span className="text-[11px] block mt-0.5 opacity-80">
                  {language === 'ar' ? 'الذاكرة الديناميكية المخصصة أثناء التشغيل' : 'Dynamically allocated objects at runtime'}
                </span>
              </div>

              <div
                onClick={() => setActiveSegment('code')}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeSegment === 'code'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-bold block">0x0040... [TEXT / CODE - الكود البرمجي]</span>
                <span className="text-[11px] block mt-0.5 opacity-80">
                  {language === 'ar' ? 'تعليمات لغة الآلة التنفيذية (Read-Only)' : 'Compiled machine instructions (Read-Only)'}
                </span>
              </div>
            </div>
          </div>

          {/* Syscalls & Execution Inspector */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase block mb-1">
              {language === 'ar' ? 'استدعاءات النظام ونواة التشغيل (Syscalls)' : 'Kernel Syscall Execution'}
            </span>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Ring 3 (Userland)</span>
                <span>→ Syscall Trap →</span>
                <span>Ring 0 (Kernel)</span>
              </div>
              <div className="text-emerald-400 text-[11px] space-y-1">
                <p>sys_execve("/usr/bin/app", ...)</p>
                <p>sys_mmap(0x0, 4096, PROT_READ|PROT_WRITE, ...)</p>
                <p>sys_read(fd=3, buf=0x7fff..., count=1024)</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-white block mb-1">
                {language === 'ar' ? 'الأثر الأمني لحمايات الذاكرة:' : 'Security Impact of Active Protections:'}
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {aslrEnabled && depEnabled
                  ? (language === 'ar'
                      ? 'النظام محصن بالكامل: العناوين غير قابلة للتنبؤ (ASLR) وصفحات المكدس غير قابلة للتنفيذ (DEP) مما يحبط هجمات حقن Shellcode.'
                      : 'Robust protection active: ASLR randomizes pointer targets and DEP prevents shellcode execution on stack buffers.')
                  : (language === 'ar'
                      ? 'تحذير: غياب ASLR أو DEP يجعل النظام عرضة لهجمات Buffer Overflow وحقن الأكواد المباشرة.'
                      : 'Warning: Disabled memory defenses expose binaries to buffer overflow exploits.')}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </Workspace>
  );
};
