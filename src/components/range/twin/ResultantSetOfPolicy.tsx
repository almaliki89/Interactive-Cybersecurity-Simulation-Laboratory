/**
 * OMEGA ULTRA REALITY V1.5 — Resultant Set of Policy (RSOP.msc)
 * Inspects calculated effective policies, winning source GPOs, precedence, and filtering reasons.
 */

import React, { useState } from 'react';
import { globalGroupPolicyEngine } from '../../../engine/reality/policy/GroupPolicyEngine';
import { RsopResult } from '../../../engine/reality/policy/types';
import { globalRealityEngine } from '../../../engine/reality/RealityEngine';
import {
  Layers,
  Shield,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Computer,
  User,
  Sliders,
  Info,
} from 'lucide-react';

interface ResultantSetOfPolicyProps {
  activeMachineId?: string;
  onRefresh?: () => void;
}

export const ResultantSetOfPolicy: React.FC<ResultantSetOfPolicyProps> = ({
  activeMachineId = 'FIN-WS01',
  onRefresh,
}) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>(activeMachineId);
  const [selectedUserName, setSelectedUserName] = useState<string>('sara.finance');

  const machine = globalRealityEngine.registry.getMachine(selectedMachineId);
  const mCtx = machine
    ? globalGroupPolicyEngine.getMachineContext(machine)
    : {
        machineId: selectedMachineId,
        hostname: selectedMachineId,
        domain: 'NEXORA.LOCAL',
        isDomainJoined: true,
        ouPath: 'OU=Workstations,DC=NEXORA,DC=LOCAL',
        machineRole: 'WORKSTATION' as const,
        computerSid: `S-1-5-21-99887766-${selectedMachineId}`,
        computerGroupSids: ['S-1-5-21-99887766-515', 'S-1-5-11'],
      };

  const uCtx = globalGroupPolicyEngine.getUserContext(selectedUserName);

  const rsop: RsopResult = globalGroupPolicyEngine.processor.processPolicy(mCtx, uCtx);

  return (
    <div data-testid="rsop-panel" className="flex flex-col h-full bg-slate-950 text-slate-200 select-none font-sans text-xs">
      {/* Top RSOP Toolbar */}
      <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-slate-100 tracking-wide">Resultant Set of Policy (RSOP.msc)</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Target Machine Selector */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <Computer className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs font-semibold focus:ring-cyan-500"
            >
              <option value="FIN-WS01">FIN-WS01 (Workstation)</option>
              <option value="HR-WS01">HR-WS01 (Workstation)</option>
              <option value="IT-WS01">IT-WS01 (Workstation)</option>
              <option value="FILE01">FILE01 (Server)</option>
              <option value="DC01">DC01 (Domain Controller)</option>
            </select>
          </div>

          {/* Target User Selector */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedUserName}
              onChange={(e) => setSelectedUserName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs font-semibold focus:ring-cyan-500"
            >
              <option value="sara.finance">sara.finance (Finance)</option>
              <option value="omar.hr">omar.hr (HR)</option>
              <option value="ali.it">ali.it (IT Admin)</option>
              <option value="administrator">administrator (Domain Admin)</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (onRefresh) onRefresh();
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 transition-colors text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh RSOP
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-4 gap-4 bg-slate-950 custom-scrollbar overflow-y-auto">
        {/* Left Column: Applied vs Denied GPOs */}
        <div className="w-80 space-y-4 shrink-0 flex flex-col">
          {/* Applied Computer GPOs */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Applied Computer GPOs</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                {rsop.appliedComputerGpos.length}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {rsop.appliedComputerGpos.map((g) => (
                <div key={g.gpoId} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate">{g.gpoName}</span>
                  {g.enforced && <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-800 font-bold">ENFORCED</span>}
                </div>
              ))}
              {rsop.appliedComputerGpos.length === 0 && (
                <div className="p-2 text-slate-500 italic text-center">No computer GPOs applied.</div>
              )}
            </div>
          </div>

          {/* Applied User GPOs */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Applied User GPOs</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                {rsop.appliedUserGpos.length}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {rsop.appliedUserGpos.map((g) => (
                <div key={g.gpoId} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate">{g.gpoName}</span>
                  {g.enforced && <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-800 font-bold">ENFORCED</span>}
                </div>
              ))}
              {rsop.appliedUserGpos.length === 0 && (
                <div className="p-2 text-slate-500 italic text-center">No user GPOs applied.</div>
              )}
            </div>
          </div>

          {/* Denied GPOs */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Denied / Inapplicable GPOs</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                {rsop.deniedComputerGpos.length + rsop.deniedUserGpos.length}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {[...rsop.deniedComputerGpos, ...rsop.deniedUserGpos].map((g) => (
                <div key={g.gpoId} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="font-semibold text-slate-300 truncate">{g.gpoName}</div>
                  <div className="text-[10px] text-rose-400/90 leading-tight">{g.denialReason}</div>
                </div>
              ))}
              {rsop.deniedComputerGpos.length + rsop.deniedUserGpos.length === 0 && (
                <div className="p-2 text-slate-500 italic text-center">No denied GPOs.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Precedence & Winning Setting Sources */}
        <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-lg p-4 flex flex-col overflow-hidden space-y-3">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Effective Policy Precedence & Winning Sources</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                  <th className="py-1.5 px-2">Setting Key</th>
                  <th className="py-1.5 px-2">Effective Value</th>
                  <th className="py-1.5 px-2">Winning Source GPO</th>
                  <th className="py-1.5 px-2">Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.entries(rsop.settingSources).map(([key, source]) => (
                  <tr key={key} data-testid={`rsop-setting-${key.replace(/[^a-zA-Z0-9]/g, '-')}`} className="hover:bg-slate-900/60 font-mono">
                    <td className="py-2 px-2 text-cyan-300 font-semibold">{key}</td>
                    <td className="py-2 px-2 text-slate-100 font-mono truncate max-w-[200px]">
                      {typeof source.effectiveValue === 'object' ? JSON.stringify(source.effectiveValue) : String(source.effectiveValue)}
                    </td>
                    <td className="py-2 px-2 text-amber-300 font-semibold truncate max-w-[200px]">
                      {source.winningGpoName}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${source.scope === 'Computer' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-purple-950 text-purple-300 border border-purple-800'}`}>
                        {source.scope}
                      </span>
                    </td>
                  </tr>
                ))}
                {Object.keys(rsop.settingSources).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500 italic">
                      No policy settings applied.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
