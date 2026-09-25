import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Cpu,
  Trash2,
  Plus,
  Play,
  ArrowLeft,
  ArrowRight,
  Terminal,
  Server,
  Layers,
  Activity,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  LinuxProcess,
  initProcessTree,
  killProcess,
  startProcess,
} from './logic/processes';

interface ProcessTreeLabProps {
  onBackToMap?: () => void;
}

export const ProcessTreeLab: React.FC<ProcessTreeLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);

  const [processes, setProcesses] = useState<LinuxProcess[]>(initProcessTree());
  const [selectedPid, setSelectedPid] = useState<number>(1);

  // New Process Form State
  const [newParentPid, setNewParentPid] = useState<number>(1);
  const [newProcName, setNewProcName] = useState('worker');
  const [newProcUser, setNewProcUser] = useState('www-data');
  const [newProcExe, setNewProcExe] = useState('/usr/bin/worker');
  const [newProcPort, setNewProcPort] = useState<string>('');

  const selectedProcess = processes.find((p) => p.pid === selectedPid) || processes[0];

  const handleKill = (pid: number) => {
    if (pid === 1) {
      addLog({
        level: 'ERROR',
        source: 'KERNEL',
        message: `Attempted to kill systemd (PID 1) - Protected kernel init process! at t=${virtualTime}ms`,
        category: 'SYSTEM',
      });
      return;
    }

    const target = processes.find((p) => p.pid === pid);
    const updated = killProcess(processes, pid);
    const killedCount = processes.length - updated.length;
    setProcesses(updated);
    if (selectedPid === pid) {
      setSelectedPid(1);
    }

    addLog({
      level: 'WARN',
      source: 'SIGKILL',
      message: `SIGKILL sent to PID ${pid} (${target?.name}). Reaped ${killedCount} process(es) at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: 'PROCESS_STOPPED',
      description: `Process ${target?.name} (PID ${pid}) killed`,
    });
  };

  const handleSpawn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcName.trim()) return;

    const portNum = newProcPort.trim() ? parseInt(newProcPort, 10) : undefined;
    const updated = startProcess(
      processes,
      newParentPid,
      newProcUser,
      newProcName.trim(),
      newProcExe.trim(),
      portNum
    );
    setProcesses(updated);

    const newest = updated[updated.length - 1];
    setSelectedPid(newest.pid);
    setNewProcName('');
    setNewProcPort('');

    addLog({
      level: 'INFO',
      source: 'FORK_EXEC',
      message: `fork()/exec() spawned PID ${newest.pid} (${newest.name}) PPID=${newParentPid} User=${newProcUser} at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: 'PROCESS_STARTED',
      description: `Spawned process ${newest.name} (PID ${newest.pid})`,
    });
  };

  // Build recursive process tree nodes
  const buildTree = (parentPid: number): React.ReactNode => {
    const children = processes.filter((p) => p.ppid === parentPid);
    if (children.length === 0) return null;

    return (
      <div className="space-y-1.5 pl-4 border-l border-slate-800 ml-2 mt-1">
        {children.map((proc) => {
          const isSelected = selectedPid === proc.pid;
          return (
            <div key={proc.pid} className="space-y-1">
              <div
                onClick={() => setSelectedPid(proc.pid)}
                className={`p-2 rounded-xl flex items-center justify-between text-xs font-mono cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-violet-950/60 border border-violet-500/80 text-violet-200'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-500 text-[10px] w-12 shrink-0">PID {proc.pid}</span>
                  <span className="font-bold text-slate-200 truncate">{proc.name}</span>
                  <span className="text-[10px] text-slate-500">({proc.user})</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {proc.port && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 text-[10px] font-bold">
                      :{proc.port}
                    </span>
                  )}
                  {proc.pid !== 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKill(proc.pid);
                      }}
                      className="p-1 hover:text-rose-400 hover:bg-slate-900 rounded text-slate-500 transition-colors"
                      title="Kill Process"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {buildTree(proc.pid)}
            </div>
          );
        })}
      </div>
    );
  };

  const rootProcess = processes.find((p) => p.pid === 1) || processes[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-400 font-mono uppercase">
            <Cpu className="w-4 h-4" />
            <span>{isAr ? 'مختبر شجرة العمليات وإدارة النواة (Process Tree Lab)' : 'Process Hierarchy, PID/PPID Tree & Process Lifecycle'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'التسلسل الهرمي للعمليات، التبعية الأبوية، وإشارات الإيقاف' : 'Process Tree Hierarchy, Fork/Exec Lifecycle & Signal Management'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setProcesses(initProcessTree())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة تعيين' : 'Reset Tree'}</span>
          </button>

          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <BackArrow className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة للخارطة' : 'Back to World Map'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Process Tree Hierarchy View */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'شجرة العمليات (pstree)' : 'Process Hierarchy Tree (pstree)'}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{processes.length} Processes</span>
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-1">
            {/* Systemd Root Node */}
            <div
              onClick={() => setSelectedPid(1)}
              className={`p-2.5 rounded-xl flex items-center justify-between text-xs font-mono cursor-pointer transition-all ${
                selectedPid === 1
                  ? 'bg-violet-950/60 border border-violet-500/80 text-violet-200'
                  : 'bg-slate-950 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px] w-12 font-bold">PID 1</span>
                <span className="font-bold text-emerald-400">{rootProcess?.name}</span>
                <span className="text-[10px] text-slate-500">({rootProcess?.user})</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">INIT (ROOT)</span>
            </div>

            {/* Recursive Tree from PID 1 */}
            {buildTree(1)}
          </div>
        </div>

        {/* Right Column: Process Inspector & Spawn Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Selected Process Inspector */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-violet-400" />
                <span>{isAr ? 'بيانات العملية المحددة' : 'Process Metadata'}</span>
              </span>
              <span className="text-amber-400 font-bold">PID {selectedProcess.pid}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase block">{isAr ? 'الاسم' : 'NAME'}</span>
                <span className="text-slate-200 font-bold">{selectedProcess.name}</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase block">{isAr ? 'المالك' : 'USER'}</span>
                <span className="text-cyan-400 font-bold">{selectedProcess.user}</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase block">{isAr ? 'الأب (PPID)' : 'PPID'}</span>
                <span className="text-slate-200">{selectedProcess.ppid}</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase block">{isAr ? 'المنفذ المستمع' : 'LISTENING PORT'}</span>
                <span className="text-amber-400">{selectedProcess.port || 'None'}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">{isAr ? 'مسار التنفيذ' : 'EXECUTABLE'}</span>
              <span className="text-slate-300 text-[10px] break-all">{selectedProcess.executable}</span>
            </div>

            {selectedProcess.pid !== 1 ? (
              <button
                onClick={() => handleKill(selectedProcess.pid)}
                className="w-full py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>kill -9 {selectedProcess.pid} (SIGKILL)</span>
              </button>
            ) : (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-500 text-[10px]">
                {isAr ? 'محمي: لا يمكن إيقاف نظام البدء (PID 1)' : 'Protected: systemd PID 1 cannot be killed'}
              </div>
            )}
          </div>

          {/* Spawn Child Process Desk */}
          <form onSubmit={handleSpawn} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">{isAr ? 'تشغيل عملية فرعية جديدة' : 'Fork & Exec Process'}</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">{isAr ? 'العملية الأب (Parent PID):' : 'PARENT (PPID):'}</label>
                <select
                  value={newParentPid}
                  onChange={(e) => setNewParentPid(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
                >
                  {processes.map((p) => (
                    <option key={p.pid} value={p.pid}>
                      PID {p.pid} - {p.name} ({p.user})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1">{isAr ? 'اسم العملية:' : 'NAME:'}</label>
                  <input
                    type="text"
                    value={newProcName}
                    onChange={(e) => setNewProcName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-cyan-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1">{isAr ? 'المستخدم:' : 'USER:'}</label>
                  <input
                    type="text"
                    value={newProcUser}
                    onChange={(e) => setNewProcUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">{isAr ? 'منفذ شبكة (اختياري):' : 'PORT (OPTIONAL):'}</label>
                <input
                  type="text"
                  placeholder="e.g. 8080"
                  value={newProcPort}
                  onChange={(e) => setNewProcPort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAr ? 'إطلاق العملية (fork/exec)' : 'Spawn Process'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
