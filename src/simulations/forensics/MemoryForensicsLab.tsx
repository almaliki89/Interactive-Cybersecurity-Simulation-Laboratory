import React, { useState, useEffect } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import { listMemoryProcesses, findSuspiciousProcessRelationships, MemoryProcess } from './logic/memory';
import { Cpu, Network, ShieldAlert, Eye, Terminal } from 'lucide-react';

export const MemoryForensicsLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';

  const [processes] = useState<MemoryProcess[]>(listMemoryProcesses());
  const [selectedPid, setSelectedPid] = useState<number>(4912);
  const [filterSuspiciousOnly, setFilterSuspiciousOnly] = useState<boolean>(false);

  const displayedProcs = filterSuspiciousOnly ? findSuspiciousProcessRelationships(processes) : processes;
  const selectedProc = processes.find((p) => p.pid === selectedPid);

  useEffect(() => {
    registerChallengeValidator('memory-analysis-challenge', () => {
      const isAnomalousSelected = selectedProc?.isSuspicious === true;
      if (isAnomalousSelected || filterSuspiciousOnly) {
        return { success: true, score: 100, message: 'Suspicious memory process identified and isolated.' };
      }
      return { success: false, score: 0, message: 'Identify the suspicious process in memory dump.' };
    });
    return () => {
      unregisterChallengeValidator('memory-analysis-challenge');
    };
  }, [selectedProc, filterSuspiciousOnly]);

  const handleSelectPid = (pid: number) => {
    setSelectedPid(pid);
    const proc = processes.find((p) => p.pid === pid);
    if (proc?.isSuspicious) {
      completeChallenge('memory-analysis-challenge', {
        success: true,
        score: 100,
        message: 'Suspicious memory process identified and isolated.',
      });
    }
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>{isAr ? 'معمل تحليل الذاكرة العشوائية RAM (Memory Forensics)' : 'Volatile Memory Forensics Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'فحص العمليات النشطة والعلاقات الأبوية والشبكات في RAM' : 'Active Process Execution, Parent-Child Tree & Socket Handles'}
          </h1>
        </div>

        <button
          onClick={() => setFilterSuspiciousOnly(!filterSuspiciousOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${
            filterSuspiciousOnly
              ? 'bg-rose-950 border-rose-800 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{filterSuspiciousOnly ? (isAr ? 'عرض كافة العمليات' : 'Show All Processes') : (isAr ? 'عرض الشاذة فقط' : 'Show Anomalous Only')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>{isAr ? 'قائمة العمليات المسحوبة من لقطة الذاكرة' : 'Memory Dump Running Process List'}</span>
          </h2>

          <div className="flex flex-col gap-2 font-mono text-xs">
            {displayedProcs.map((p) => {
              const isSelected = p.pid === selectedPid;
              return (
                <div
                  key={p.pid}
                  onClick={() => handleSelectPid(p.pid)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg'
                      : p.isSuspicious
                      ? 'bg-rose-950/40 border-rose-900/60 text-slate-200 hover:border-rose-700'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 w-12">PID {p.pid}</span>
                    <span className="font-bold text-cyan-300 w-28 truncate">{p.name}</span>
                    <span className="text-slate-400 text-[11px] truncate hidden sm:inline">{p.commandLine}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500 text-[10px]">PPID {p.ppid}</span>
                    {p.isSuspicious && (
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px]">
                        ANOMALOUS
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{isAr ? 'تفاصيل العملية والمقبض بالذاكرة' : 'Process Memory Inspector'}</span>
          </h2>

          {selectedProc ? (
            <div className="flex flex-col gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">{isAr ? 'سطر الأوامر الكامل' : 'Command Line'}</span>
                <span className="text-cyan-300 font-bold break-all">{selectedProc.commandLine || selectedProc.name}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">{isAr ? 'مسار الصورة والمالك' : 'Image Path & Owner'}</span>
                <span className="text-slate-200 block truncate">{selectedProc.imagePath}</span>
                <span className="text-amber-300 block font-bold mt-1">{selectedProc.owner}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isAr ? 'المقابس والاتصالات الشبكية الحية' : 'Active Network Sockets'}</span>
                </span>
                {selectedProc.networkConnections.length > 0 ? (
                  selectedProc.networkConnections.map((c, idx) => (
                    <div key={idx} className="text-[11px] text-emerald-300">
                      {c.protocol} {c.remoteIp}:{c.remotePort} [{c.state}]
                    </div>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500 italic">{isAr ? 'لا توجد اتصالات شبكية' : 'No active network sockets'}</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1">{isAr ? 'المكتبات والمحملات بالذاكرة (Loaded Modules)' : 'Loaded DLL / Shared Libraries'}</span>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {selectedProc.loadedModules.map((m) => (
                    <span key={m} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic text-center py-8">
              {isAr ? 'حدد عملية من القائمة لمعاينة الذاكرة' : 'Select a process to inspect RAM memory state'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
