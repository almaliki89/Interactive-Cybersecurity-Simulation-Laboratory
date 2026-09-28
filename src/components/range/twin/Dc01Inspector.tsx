/**
 * OMEGA ULTRA REALITY V1.3 — DC01 Domain Controller Inspector UI
 * Active Directory health, KDC statistics, ticket counters, and authentication metrics.
 */

import React from 'react';
import { globalActiveDirectoryEngine } from '../../../engine/reality/identity/ActiveDirectoryEngine';
import { useDigitalTwinStore } from '../../../engine/reality/digitalTwinStore';
import { Building, Shield, Activity, Users, Key, AlertTriangle, CheckCircle2, Database, Server } from 'lucide-react';

interface Dc01InspectorProps {
  language?: 'en' | 'ar';
}

export const Dc01Inspector: React.FC<Dc01InspectorProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';
  const stats = globalActiveDirectoryEngine.dc.getStats();
  const users = globalActiveDirectoryEngine.store.getAllUsers();
  const groups = globalActiveDirectoryEngine.store.getAllGroups();
  const computers = globalActiveDirectoryEngine.store.getAllComputers();
  const spns = globalActiveDirectoryEngine.spnRegistry.getAllSpns();

  const dcDevice = useDigitalTwinStore((s) => s.devices['DC01']);
  const isDcOnline = dcDevice ? dcDevice.powerStatus === 'ONLINE' : false;

  return (
    <div data-testid="dc01-inspector" className="p-3 bg-slate-950 text-slate-200 font-sans text-xs space-y-3 font-mono border-t border-slate-900">
      {/* Banner */}
      <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>DC01.NEXORA.LOCAL</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                PDC EMULATOR
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Active Directory Domain Services | Kerberos KDC | Primary DNS
            </div>
          </div>
        </div>

        <div className="text-right text-[10px]">
          {isDcOnline ? (
            <div className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'نشط' : 'AD DS ONLINE'}</span>
            </div>
          ) : (
            <div className="text-rose-400 font-bold flex items-center gap-1 justify-end">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isAr ? 'غير متصل' : 'AD DS OFFLINE'}</span>
            </div>
          )}
          <div className="text-slate-500">Domain Functional Level 2022</div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 space-y-0.5">
          <div className="text-slate-500 uppercase flex items-center gap-1">
            <Users className="w-3 h-3 text-cyan-400" />
            <span>Identity Directory</span>
          </div>
          <div className="text-white font-bold text-sm">
            {users.length} <span className="text-[10px] font-normal text-slate-400">Users</span> | {groups.length} <span className="text-[10px] font-normal text-slate-400">Groups</span>
          </div>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 space-y-0.5">
          <div className="text-slate-500 uppercase flex items-center gap-1">
            <Server className="w-3 h-3 text-emerald-400" />
            <span>Domain Computers</span>
          </div>
          <div className="text-white font-bold text-sm">
            {computers.length} <span className="text-[10px] font-normal text-slate-400">Joined Machines</span>
          </div>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 space-y-0.5">
          <div className="text-slate-500 uppercase flex items-center gap-1">
            <Key className="w-3 h-3 text-amber-400" />
            <span>Active Tickets (KDC)</span>
          </div>
          <div className="text-amber-300 font-bold text-sm">{stats.activeTicketCount} Issued</div>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 space-y-0.5">
          <div className="text-slate-500 uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-rose-400" />
            <span>Failed Auth Attempts</span>
          </div>
          <div className={stats.failedAuthCount > 0 ? 'text-rose-400 font-bold text-sm' : 'text-slate-400 font-bold text-sm'}>
            {stats.failedAuthCount} Failed
          </div>
        </div>
      </div>

      {/* Roles & Registered SPNs */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Registered Service Principal Names (SPNs)</div>
        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
          {spns.map((s) => (
            <div key={s.spn} className="p-1.5 rounded bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-cyan-300 font-bold">{s.spn}</span>
              <span className="text-slate-400">{s.targetAccountName} ({s.hostname})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
