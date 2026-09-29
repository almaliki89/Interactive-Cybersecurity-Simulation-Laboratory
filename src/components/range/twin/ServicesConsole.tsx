/**
 * OMEGA ULTRA REALITY V1.4 — Windows Services Console UI (services.msc)
 * High-fidelity Windows Services Management Console.
 * Allows starting, stopping, and restarting services, with live system consequences.
 */

import React, { useState } from 'react';
import {
  Cog,
  Play,
  Square,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Pause,
  Info,
} from 'lucide-react';
import { WindowsDesktopEngine } from '../../../engine/reality/windows/WindowsDesktopEngine';
import { WindowsService } from '../../../engine/reality/windows/types';

interface ServicesConsoleProps {
  desktop: WindowsDesktopEngine;
}

export const ServicesConsole: React.FC<ServicesConsoleProps> = ({ desktop }) => {
  const [services, setServices] = useState<WindowsService[]>(desktop.services.getAllServices());
  const [selectedService, setSelectedService] = useState<WindowsService | null>(
    desktop.services.getService('LanmanServer') || services[0] || null
  );
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const refreshList = () => {
    const updated = desktop.services.getAllServices();
    setServices(updated);
    if (selectedService) {
      const refreshed = desktop.services.getService(selectedService.name);
      if (refreshed) setSelectedService(refreshed);
    }
  };

  const handleStart = (name: string) => {
    desktop.services.startService(name);
    refreshList();
  };

  const handleStop = (name: string) => {
    desktop.services.stopService(name);
    refreshList();
  };

  const handleRestart = (name: string) => {
    desktop.services.restartService(name);
    refreshList();
  };

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.displayName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || s.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div
      data-testid="services-console"
      className="flex flex-col h-full bg-slate-900 text-slate-200 font-sans select-none"
    >
      {/* Top Action Ribbon */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/90 border-b border-slate-700/80 gap-3">
        <div className="flex items-center gap-2">
          {selectedService && (
            <>
              <button
                data-testid={`service-action-start-${selectedService.name}`}
                onClick={() => handleStart(selectedService.name)}
                disabled={selectedService.status === 'RUNNING'}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 text-xs disabled:opacity-30 disabled:pointer-events-none font-medium"
                title="Start Service"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                Start
              </button>
              <button
                data-testid={`service-action-stop-${selectedService.name}`}
                onClick={() => handleStop(selectedService.name)}
                disabled={selectedService.status === 'STOPPED'}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/50 text-rose-200 text-xs disabled:opacity-30 disabled:pointer-events-none font-medium"
                title="Stop Service"
              >
                <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                Stop
              </button>
              <button
                onClick={() => handleRestart(selectedService.name)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-200 text-xs font-medium"
                title="Restart Service"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                Restart
              </button>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950/80 border border-slate-700 rounded px-2.5 py-1 text-xs w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-200 text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="STOPPED">Stopped</option>
          </select>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table list */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
          <div className="grid grid-cols-12 px-3 py-1.5 bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2">Startup Type</div>
            <div className="col-span-2">Log On As</div>
          </div>

          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {filtered.map((s) => {
              const isSelected = selectedService?.name === s.name;
              return (
                <div
                  key={s.name}
                  data-testid={`service-${s.name}`}
                  onClick={() => setSelectedService(s)}
                  className={`grid grid-cols-12 items-center px-3 py-1.5 rounded cursor-pointer text-xs transition-colors ${isSelected ? 'bg-cyan-950/70 border border-cyan-600/60 text-cyan-100' : 'hover:bg-slate-800/60 text-slate-200'}`}
                >
                  <div className="col-span-5 flex items-center gap-2 truncate">
                    <Cog className={`w-4 h-4 ${s.status === 'RUNNING' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate font-medium">{s.displayName}</span>
                  </div>
                  <div
                    className="col-span-3 flex items-center gap-1.5 text-[11px]"
                    data-testid={`service-status-${s.name}`}
                    data-state={s.status}
                  >
                    {s.status === 'RUNNING' ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Running
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Square className="w-2.5 h-2.5" />
                        Stopped
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-slate-400 text-[11px] capitalize">
                    {s.startupType.toLowerCase()}
                  </div>
                  <div className="col-span-2 text-slate-400 text-[11px] truncate">
                    {s.serviceAccount}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Service Details Pane */}
        {selectedService && (
          <div className="w-80 bg-slate-950/80 p-3 flex flex-col text-xs overflow-y-auto">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Cog className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="font-semibold text-slate-200">{selectedService.displayName}</div>
                <div className="text-[10px] text-slate-400 font-mono">Service name: {selectedService.name}</div>
              </div>
            </div>

            <div className="py-2.5 space-y-2 text-xs border-b border-slate-800">
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Status</div>
                <div
                  className="mt-0.5 flex items-center gap-1.5"
                  data-testid={`service-detail-status-${selectedService.name}`}
                  data-state={selectedService.status}
                >
                  {selectedService.status === 'RUNNING' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 font-medium">
                      RUNNING (PID: {selectedService.pid || 'N/A'})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                      STOPPED
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Description</div>
                <div className="mt-0.5 text-slate-300 text-[11px] leading-relaxed">
                  {selectedService.description}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Path to executable</div>
                <div className="mt-0.5 text-[11px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800 break-all">
                  {selectedService.binaryPath}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Dependencies</div>
                <div className="mt-0.5 text-[11px] text-slate-300">
                  {selectedService.dependencies.length > 0 ? (
                    <div className="space-y-1">
                      {selectedService.dependencies.map((dep) => (
                        <div key={dep} className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                          {dep}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">No dependencies</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-500">
              Changes to service state immediately affect network capabilities and generate Windows Security / System Event Logs.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
