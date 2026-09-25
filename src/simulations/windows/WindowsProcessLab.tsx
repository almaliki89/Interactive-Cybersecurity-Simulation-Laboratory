import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  WindowsProcess,
  INITIAL_WINDOWS_PROCESSES,
  canProcessAccessTarget,
  spawnWindowsProcess,
  terminateWindowsProcess,
} from './logic/processes';
import { IntegrityLevel } from './logic/token';
import {
  Cpu,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Activity,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface WindowsProcessLabProps {
  onBackToMap?: () => void;
}

export const WindowsProcessLab: React.FC<WindowsProcessLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);

  const [processes, setProcesses] = useState<WindowsProcess[]>(INITIAL_WINDOWS_PROCESSES);
  const [selectedPid, setSelectedPid] = useState<number>(752); // lsass.exe by default

  // MIC Access Tester States
  const [sourcePid, setSourcePid] = useState<number>(4890); // powershell.exe (Medium)
  const [targetPid, setTargetPid] = useState<number>(752); // lsass.exe (System)
  const [requestedRight, setRequestedRight] = useState<'ReadMemory' | 'WriteMemory' | 'Terminate'>('WriteMemory');
  const [enableDebugPrivilege, setEnableDebugPrivilege] = useState<boolean>(false);

  // New process creation states
  const [newProcName, setNewProcName] = useState<string>('notepad.exe');
  const [newProcIntegrity, setNewProcIntegrity] = useState<IntegrityLevel>('Medium');

  const selectedProcess = processes.find((p) => p.pid === selectedPid) || processes[0];
  const sourceProcess = processes.find((p) => p.pid === sourcePid);
  const targetProcess = processes.find((p) => p.pid === targetPid);

  // Evaluate access right
  const accessEvaluation = sourceProcess && targetProcess
    ? canProcessAccessTarget(sourceProcess, targetProcess, requestedRight, enableDebugPrivilege)
    : { allowed: false, reasonEn: 'Invalid process selection', reasonAr: 'تحديد غير صحيح للعملية' };

  const handleTerminate = (pid: number) => {
    const target = processes.find((p) => p.pid === pid);
    if (!target) return;

    if (target.securityCritical) {
      addLog({
        level: 'ERROR',
        source: 'KERNEL',
        category: 'SYSTEM',
        message: `BSOD Protection: Attempted to terminate critical process "${target.name}" (PID ${pid}) rejected!`,
        timestamp: virtualTime,
      });
      return;
    }

    setProcesses((prev) => terminateWindowsProcess(prev, pid));
    addLog({
      level: 'INFO',
      source: 'PROCESS',
      category: 'SYSTEM',
      message: `Terminated process "${target.name}" (PID ${pid})`,
      timestamp: virtualTime,
    });
  };

  const handleSpawn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcName.trim()) return;

    const updated = spawnWindowsProcess(
      processes,
      newProcName.trim(),
      'WORKSTATION\\alice',
      'S-1-5-21-1001',
      newProcIntegrity,
      `${newProcName.trim()}`
    );

    setProcesses(updated);
    addLog({
      level: 'INFO',
      source: 'PROCESS',
      category: 'SECURITY',
      message: `Event 4688: Process Creation: "${newProcName}" started with ${newProcIntegrity} Integrity`,
      timestamp: virtualTime,
    });
  };

  const getIntegrityBadge = (lvl: IntegrityLevel) => {
    switch (lvl) {
      case 'System':
        return 'bg-purple-950 text-purple-300 border-purple-700/60';
      case 'High':
        return 'bg-rose-950 text-rose-300 border-rose-700/60';
      case 'Medium':
        return 'bg-blue-950 text-blue-300 border-blue-700/60';
      case 'Low':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 select-none space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isAr ? 'العودة للخارطة' : 'Back to Map'}
            >
              <BackArrow className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>{isAr ? 'مختبر شجرة العمليات والتحكم الإلزامي بالتكامل (Process Tree & MIC)' : 'Windows Process Tree & MIC Lab'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'استكشف عزل العمليات وقاعدة عدم الكتابة للأعلى (No-Write-Up) وحماية عمليات النظام (lsass.exe)'
                : 'Explore process isolation, Mandatory Integrity Control (MIC No-Write-Up), and protected processes.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Process Tree Explorer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {isAr ? 'قائمة العمليات النشطة (Running Processes)' : 'Active Windows Processes'}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                {processes.length} {isAr ? 'عملية' : 'processes'}
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {processes.map((proc) => {
                const isSelected = selectedProcess && selectedProcess.pid === proc.pid;

                return (
                  <div
                    key={proc.pid}
                    onClick={() => setSelectedPid(proc.pid)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-500 shadow-md shadow-purple-950/40'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{proc.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">PID {proc.pid}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${getIntegrityBadge(proc.integrityLevel)}`}>
                          {proc.integrityLevel}
                        </span>
                        {proc.securityCritical && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800/60">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{proc.userName}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{proc.commandLine}</div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right text-[10px] font-mono text-slate-400">
                        <div>CPU: {proc.cpuPercent}%</div>
                        <div>RAM: {proc.memoryMb}MB</div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTerminate(proc.pid);
                        }}
                        disabled={proc.securityCritical}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          proc.securityCritical
                            ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
                            : 'bg-rose-950/40 border-rose-800 text-rose-400 hover:bg-rose-900'
                        }`}
                        title={proc.securityCritical ? (isAr ? 'محمي من الإنهاء' : 'Protected Critical Process') : (isAr ? 'إنهاء العملية' : 'Terminate Process')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spawn Process Form */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-3">
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'تشغيل عملية جديدة (Spawn Process)' : 'Spawn Process'}</span>
            </div>

            <form onSubmit={handleSpawn} className="flex flex-wrap items-center gap-3 text-xs">
              <input
                type="text"
                value={newProcName}
                onChange={(e) => setNewProcName(e.target.value)}
                placeholder="e.g. mimikatz.exe or cmd.exe"
                className="flex-1 min-w-[160px] px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />

              <select
                value={newProcIntegrity}
                onChange={(e) => setNewProcIntegrity(e.target.value as IntegrityLevel)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Low">Low Integrity</option>
                <option value="Medium">Medium Integrity</option>
                <option value="High">High Integrity (Admin)</option>
              </select>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono text-xs shadow-md transition-colors"
              >
                {isAr ? 'بدء العملية' : 'Start Process'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Mandatory Integrity Control (MIC) Violation Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">
                {isAr ? 'محاكي التحكم الإلزامي بالتكامل' : 'Mandatory Integrity Control (MIC)'}
              </span>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {isAr ? 'فحص عزل الذاكرة وقاعدة No-Write-Up' : 'Process Isolation & Memory Injection Check'}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  {isAr ? 'العملية المصدر (Attacker / Caller Process):' : 'Source Process (Caller):'}
                </label>
                <select
                  value={sourcePid}
                  onChange={(e) => setSourcePid(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                >
                  {processes.map((p) => (
                    <option key={p.pid} value={p.pid}>
                      {p.name} (PID {p.pid} - {p.integrityLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  {isAr ? 'العملية الهدف (Target Process):' : 'Target Process:'}
                </label>
                <select
                  value={targetPid}
                  onChange={(e) => setTargetPid(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                >
                  {processes.map((p) => (
                    <option key={p.pid} value={p.pid}>
                      {p.name} (PID {p.pid} - {p.integrityLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  {isAr ? 'الإجراء المطلوب على العملية الهدف:' : 'Attempted Operation:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ReadMemory', 'WriteMemory', 'Terminate'] as const).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setRequestedRight(op)}
                      className={`p-2 rounded-xl text-[11px] font-mono font-semibold border transition-all ${
                        requestedRight === op
                          ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-300">
                  {isAr ? 'تفعيل امتياز SeDebugPrivilege:' : 'Enable SeDebugPrivilege:'}
                </span>
                <input
                  type="checkbox"
                  checked={enableDebugPrivilege}
                  onChange={(e) => setEnableDebugPrivilege(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0 focus:outline-none"
                />
              </div>

              {/* Evaluation Output */}
              <div
                className={`p-4 rounded-xl border space-y-1.5 ${
                  accessEvaluation.allowed
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-600 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase">
                  {accessEvaluation.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{accessEvaluation.allowed ? (isAr ? 'مسموح (ALLOWED)' : 'ALLOWED') : (isAr ? 'مرفوض ومحظور (BLOCKED)' : 'BLOCKED')}</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {isAr ? accessEvaluation.reasonAr : accessEvaluation.reasonEn}
                </p>
              </div>
            </div>
          </div>

          {/* Process Inspector Card */}
          {selectedProcess && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>INSPECTING: {selectedProcess.name}</span>
                <span>Session: {selectedProcess.session}</span>
              </div>
              <p className="text-slate-300">
                {isAr ? selectedProcess.descriptionAr : selectedProcess.descriptionEn}
              </p>
              <div className="text-[10px] font-mono text-slate-500 break-all">
                Path: {selectedProcess.binaryPath}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
