/**
 * OMEGA ULTRA REALITY V1.4 — Task Manager UI (taskmgr.exe)
 * High-fidelity Windows Task Manager showing live simulated processes,
 * user sessions, system services, and resource utilization.
 */

import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Users,
  Shield,
  Square,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { WindowsDesktopEngine } from '../../../engine/reality/windows/WindowsDesktopEngine';
import { WindowsProcess } from '../../../engine/reality/windows/types';

interface TaskManagerProps {
  desktop: WindowsDesktopEngine;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ desktop }) => {
  const [activeTab, setActiveTab] = useState<'PROCESSES' | 'PERFORMANCE' | 'USERS' | 'SERVICES'>('PROCESSES');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [processes, setProcesses] = useState<WindowsProcess[]>(desktop.processes.getAllProcesses());
  const [searchFilter, setSearchFilter] = useState<string>('');

  const refreshProcesses = () => {
    setProcesses(desktop.processes.getAllProcesses());
  };

  const handleEndTask = (pid: number) => {
    desktop.processes.terminateProcess(pid);
    refreshProcesses();
  };

  const runningProcesses = processes.filter((p) => p.status === 'RUNNING');
  const filtered = runningProcesses.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.userName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalCpu = runningProcesses.reduce((acc, p) => acc + p.cpuPercentSimulated, 0).toFixed(1);
  const totalMemMb = runningProcesses.reduce((acc, p) => acc + p.memoryMbSimulated, 0).toFixed(0);

  return (
    <div
      data-testid="task-manager"
      className="flex flex-col h-full bg-slate-900 text-slate-200 font-sans select-none"
    >
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-xs">
        <div className="flex items-center gap-1">
          <button
            data-testid="tab-processes"
            onClick={() => setActiveTab('PROCESSES')}
            className={`px-3 py-1 rounded font-medium transition-colors ${activeTab === 'PROCESSES' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
          >
            Processes
          </button>
          <button
            onClick={() => setActiveTab('PERFORMANCE')}
            className={`px-3 py-1 rounded font-medium transition-colors ${activeTab === 'PERFORMANCE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1 rounded font-medium transition-colors ${activeTab === 'USERS' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
          >
            Users
          </button>
          <button
            data-testid="tab-services"
            onClick={() => setActiveTab('SERVICES')}
            className={`px-3 py-1 rounded font-medium transition-colors ${activeTab === 'SERVICES' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
          >
            Services
          </button>
        </div>

        {/* Global summary chips */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-cyan-300">CPU: {totalCpu}%</span>
          <span className="text-amber-300">Memory: {totalMemMb} MB</span>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'PROCESSES' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 px-3 py-1.5 bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">PID</div>
            <div className="col-span-1 text-right">CPU</div>
            <div className="col-span-2 text-right">Memory</div>
            <div className="col-span-2 text-right">User</div>
          </div>

          {/* Process Rows */}
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {filtered.map((proc) => {
              const isSelected = selectedPid === proc.pid;
              return (
                <div
                  key={proc.pid}
                  data-testid={`process-${proc.name}`}
                  onClick={() => setSelectedPid(proc.pid)}
                  className={`grid grid-cols-12 items-center px-3 py-1 rounded cursor-pointer text-xs transition-colors ${isSelected ? 'bg-cyan-950/70 border border-cyan-600/60 text-cyan-100' : 'hover:bg-slate-800/60 text-slate-200'}`}
                >
                  <div className="col-span-4 flex items-center gap-2 truncate font-medium">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">{proc.name}</span>
                  </div>
                  <div className="col-span-2 text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Running
                  </div>
                  <div className="col-span-1 text-right text-slate-400 font-mono text-[11px]">
                    {proc.pid}
                  </div>
                  <div className="col-span-1 text-right text-cyan-300 font-mono text-[11px]">
                    {proc.cpuPercentSimulated.toFixed(1)}%
                  </div>
                  <div className="col-span-2 text-right text-slate-300 font-mono text-[11px]">
                    {proc.memoryMbSimulated.toFixed(1)} MB
                  </div>
                  <div className="col-span-2 text-right text-slate-400 text-[11px] truncate">
                    {proc.userName.split('\\').pop()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar with End Task */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-t border-slate-800 text-xs">
            <div className="text-slate-400 text-[11px]">
              {runningProcesses.length} processes running
            </div>
            {selectedPid && (
              <button
                onClick={() => handleEndTask(selectedPid)}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-xs font-medium"
              >
                <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                End Task
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'PERFORMANCE' && (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Cpu className="w-4 h-4" /> CPU Utilization
              </span>
              <span className="font-mono">{totalCpu}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${Math.min(100, parseFloat(totalCpu) * 4)}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 text-amber-400">
                <HardDrive className="w-4 h-4" /> Memory Allocation
              </span>
              <span className="font-mono">{totalMemMb} MB / 16,384 MB</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${(parseInt(totalMemMb) / 16384) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 mb-2">Active Logged-On Users</div>
          {(() => {
            const sess = desktop.getActiveSession();
            if (!sess.userName) {
              return <div className="text-xs text-slate-500 italic">No interactive user sessions active.</div>;
            }
            return (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-slate-200">{sess.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Session ID: {sess.sessionId} | SID: {sess.userSid}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-[11px]">
                  Active
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'SERVICES' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {desktop.services.getAllServices().map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs"
            >
              <div className="truncate font-medium text-slate-200">{s.displayName} ({s.name})</div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono ${s.status === 'RUNNING' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}
              >
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
