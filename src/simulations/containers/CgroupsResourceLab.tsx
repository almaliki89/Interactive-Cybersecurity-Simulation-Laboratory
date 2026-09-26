/**
 * OMEGA V14 — Linux Cgroups v1/v2 Resource Constraints Interactive Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getInitialCgroupsLimits, simulateResourceStress } from './logic/cgroups';
import { CgroupsLimits } from './logic/types';
import { Cpu, Zap, AlertTriangle, ShieldCheck, RefreshCw, Flame } from 'lucide-react';

export const CgroupsResourceLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [limits, setLimits] = useState<CgroupsLimits>(getInitialCgroupsLimits());
  const [stressResult, setStressResult] = useState<any>(null);

  const triggerStress = (type: 'fork_bomb' | 'memory_exhaustion' | 'cpu_spike') => {
    const res = simulateResourceStress(limits, type);
    setStressResult(res);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'مختبر مجموعات التحكم Cgroups' : 'Cgroups & Resource Limits Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'كبح المعالج وإحباط قنابل التفريع (DoS Prevention)' : 'Cgroups v2 Resource Throttling & DoS Defense'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'اضبط حدود cpu.max و memory.limit_in_bytes و pids.max واختبر إطلاق هجمات حجب الخدمة واستهلاك الموارد.'
                : 'Configure CPU quotas, memory limits, and pids.max to protect the host against DoS attacks.'}
            </p>
          </div>

          <button
            onClick={() => {
              setLimits(getInitialCgroupsLimits());
              setStressResult(null);
            }}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold text-slate-300 mb-1">
              {isAr ? 'حد العمليات (pids.max)' : 'Process Limit (pids.max)'}
            </div>
            <div className="text-[11px] text-slate-400 mb-3">
              {isAr ? 'حماية من قنبلة التفريع Fork-Bomb' : 'Defends against Fork-Bombs'}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="256"
                step="32"
                value={limits.pidsMax}
                onChange={(e) => setLimits({ ...limits, pidsMax: Number(e.target.value) })}
                className="flex-1 accent-cyan-500"
              />
              <span className="text-xs font-mono font-bold w-16 text-right">
                {limits.pidsMax === 0 ? 'Max (∞)' : `${limits.pidsMax} PIDs`}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold text-slate-300 mb-1">
              {isAr ? 'حد الذاكرة (memory.max)' : 'Memory Limit (memory.max)'}
            </div>
            <div className="text-[11px] text-slate-400 mb-3">
              {isAr ? 'تفعيل OOM Killer داخل الحاوية' : 'Enforces scoped OOM-Killer'}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1024"
                step="128"
                value={limits.memoryLimitMb}
                onChange={(e) => setLimits({ ...limits, memoryLimitMb: Number(e.target.value) })}
                className="flex-1 accent-blue-500"
              />
              <span className="text-xs font-mono font-bold w-16 text-right">
                {limits.memoryLimitMb === 0 ? 'Max (∞)' : `${limits.memoryLimitMb} MB`}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold text-slate-300 mb-1">
              {isAr ? 'كبح المعالج (cpu.max)' : 'CPU Quota (cpu.max)'}
            </div>
            <div className="text-[11px] text-slate-400 mb-3">
              {isAr ? 'منع ظاهرة الجار المزعج (Noisy Neighbor)' : 'Prevents CPU starvation'}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="4"
                step="0.5"
                value={limits.cpuLimitCores}
                onChange={(e) => setLimits({ ...limits, cpuLimitCores: Number(e.target.value) })}
                className="flex-1 accent-indigo-500"
              />
              <span className="text-xs font-mono font-bold w-16 text-right">
                {limits.cpuLimitCores === 0 ? 'Max (∞)' : `${limits.cpuLimitCores} Core`}
              </span>
            </div>
          </div>
        </div>

        {/* Stress Testing Action Panel */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            {isAr ? 'إجراء اختبارات الضغط والهجوم (Stress & Attack Simulators)' : 'Stress & Denial-of-Service Tests'}
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => triggerStress('fork_bomb')}
              className="px-4 py-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>{isAr ? 'إطلاق قنبلة تفريع (:(){ :|:& };:)' : 'Launch Fork-Bomb (:(){ :|:& };:)'}</span>
            </button>

            <button
              onClick={() => triggerStress('memory_exhaustion')}
              className="px-4 py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'استنزاف الذاكرة (Memory Leak Spike)' : 'Memory Exhaustion Attack'}</span>
            </button>

            <button
              onClick={() => triggerStress('cpu_spike')}
              className="px-4 py-2.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'استهلاك 100% من المعالج (CPU Starvation)' : 'CPU Starvation Stress'}</span>
            </button>
          </div>

          {/* Results Display */}
          {stressResult && (
            <div
              className={`mt-5 p-4 rounded-xl border ${
                stressResult.mitigated
                  ? 'bg-emerald-950/30 border-emerald-500/30'
                  : 'bg-rose-950/40 border-rose-500/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {stressResult.mitigated ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
                <span className="font-bold text-sm text-white">
                  {isAr ? 'نتيجة المحاكاة والتأثير:' : 'Simulation Impact:'}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {isAr ? stressResult.messageAr : stressResult.messageEn}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/60 text-xs font-mono">
                <div>
                  <span className="text-slate-500">CPU Usage: </span>
                  <span className="text-cyan-400 font-bold">{stressResult.cpuUsagePct}%</span>
                </div>
                <div>
                  <span className="text-slate-500">RAM: </span>
                  <span className="text-blue-400 font-bold">{stressResult.memoryUsageMb} MB</span>
                </div>
                <div>
                  <span className="text-slate-500">Active PIDs: </span>
                  <span className="text-purple-400 font-bold">{stressResult.processCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
