/**
 * OMEGA ULTRA REALITY V1.5 — Group Policy Management Console (gpmc.msc)
 * Enterprise UI for Active Directory Sites, Domains, OUs, GPO Links, Security Filtering, and Enforcement.
 */

import React, { useState } from 'react';
import { globalGroupPolicyEngine } from '../../../engine/reality/policy/GroupPolicyEngine';
import { GroupPolicyObject, GpoLink } from '../../../engine/reality/policy/types';
import { BASELINE_OUS } from '../../../engine/reality/identity/DirectoryStore';
import { globalNetworkEngine } from '../../../engine/reality/network/NetworkEngine';
import { globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import type { WindowsMachine } from '../../../engine/reality/windows/WindowsMachine';
import {
  FolderTree,
  Shield,
  Link,
  Lock,
  CheckCircle2,
  XCircle,
  Layers,
  Sliders,
  RotateCcw,
  FileText,
  Building,
  Computer,
  UserCheck,
} from 'lucide-react';

type RealityGlobal = typeof globalThis & {
  globalRealityEngine?: {
    registry: {
      getMachine: (id: string) => WindowsMachine | undefined;
    };
  };
};

interface GroupPolicyConsoleProps {
  activeMachineId?: string;
  onRefresh?: () => void;
}

export const GroupPolicyConsole: React.FC<GroupPolicyConsoleProps> = ({ activeMachineId, onRefresh }) => {
  const store = globalGroupPolicyEngine.store;
  const [selectedOu, setSelectedOu] = useState<string>('OU=Workstations,DC=NEXORA,DC=LOCAL');
  const [selectedGpoId, setSelectedGpoId] = useState<string>('gpo-workstation-baseline');
  const [activeTab, setActiveTab] = useState<'scope' | 'computer' | 'user' | 'delegation'>('scope');
  const [, setRevision] = useState(0);
  const [applyState, setApplyState] = useState<'idle' | 'success' | 'failure'>('idle');
  const [applyMessage, setApplyMessage] = useState('');

  const gpos = store.getAllGpos();
  const selectedGpo = store.getGpo(selectedGpoId);
  const links = store.getAllLinks();
  const isBlockInheritance = store.isOuBlockingInheritance(selectedOu);
  const activeMachine = activeMachineId
    ? (globalThis as RealityGlobal).globalRealityEngine?.registry.getMachine(activeMachineId)
    : undefined;
  const lanmanRuntimeState = activeMachine?.getService('LanmanServer')?.status ?? 'UNKNOWN';
  const smbFirewallRuntimeState = globalNetworkEngine.firewall.isPortBlocked('TCP', 445) ? 'BLOCKED' : 'ALLOWED';

  const mutateSelectedGpo = (mutator: (gpo: GroupPolicyObject) => GroupPolicyObject) => {
    if (!selectedGpo) return;
    const updated = mutator(selectedGpo);
    store.saveGpo({
      ...updated,
      versionComputer: updated.versionComputer + 1,
      modifiedVirtualTime: globalSimulationRuntime.clock.getVirtualTime(),
    });
    setRevision((v) => v + 1);
    setApplyState('idle');
    setApplyMessage('');
  };

  const handleLanmanPolicyChange = (disabled: boolean) => {
    mutateSelectedGpo((gpo) => ({
      ...gpo,
      computerSettings: {
        ...gpo.computerSettings,
        serviceStartup: {
          ...(gpo.computerSettings.serviceStartup || {}),
          LanmanServer: disabled ? 'DISABLED' : 'AUTO',
        },
      },
    }));
  };

  const handleFirewallPolicyChange = (blocked: boolean) => {
    mutateSelectedGpo((gpo) => ({
      ...gpo,
      computerSettings: {
        ...gpo.computerSettings,
        firewallProfile: {
          ...(gpo.computerSettings.firewallProfile || {}),
          enabled: true,
          blockInboundSmb: blocked,
        },
      },
    }));
  };

  const handleApplyToActiveMachine = () => {
    if (!activeMachine) {
      setApplyState('failure');
      setApplyMessage('Active machine is unavailable.');
      return;
    }

    const session = activeMachine.getActiveSessions()[0];
    const result = globalGroupPolicyEngine.gpupdate(
      activeMachine,
      session?.userName,
      session?.userSid,
      true,
      globalSimulationRuntime.clock.getVirtualTime()
    );

    setApplyState(result.success ? 'success' : 'failure');
    setApplyMessage(result.output);
    setRevision((v) => v + 1);
    if (onRefresh) onRefresh();
  };

  const handleToggleEnforced = (link: GpoLink) => {
    store.setLinkEnforced(link.id, !link.enforced);
    if (onRefresh) onRefresh();
  };

  const handleToggleBlockInheritance = () => {
    store.setOuBlockInheritance(selectedOu, !isBlockInheritance);
    if (onRefresh) onRefresh();
  };

  const handleToggleLinkEnabled = (link: GpoLink) => {
    store.setLinkEnabled(link.id, !link.enabled);
    if (onRefresh) onRefresh();
  };

  return (
    <div data-testid="group-policy-console" className="flex flex-col h-full bg-slate-950 text-slate-200 select-none font-sans text-xs">
      {/* Top Console Bar */}
      <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 tracking-wide">Group Policy Management Console (GPMC)</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
            NEXORA.LOCAL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onRefresh) onRefresh();
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 transition-colors text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Forest & OU Navigation Tree */}
        <div data-testid="gpo-tree" className="w-64 bg-slate-950 border-r border-slate-800 p-3 overflow-y-auto space-y-3 shrink-0 custom-scrollbar">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Forest: NEXORA.LOCAL
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-slate-300 px-2 py-1 flex items-center gap-2 rounded bg-slate-900/60 border border-slate-800">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Domain: NEXORA.LOCAL</span>
            </div>

            <div className="pl-3 space-y-1 pt-1">
              {BASELINE_OUS.filter((ou) => ou.parentDn).map((ou) => (
                <button
                  key={ou.dn}
                  onClick={() => setSelectedOu(ou.dn)}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${selectedOu === ou.dn ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderTree className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{ou.name}</span>
                  </div>
                  {store.isOuBlockingInheritance(ou.dn) && (
                    <span title="Block Inheritance Enabled">
                      <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Group Policy Objects ({gpos.length})
          </div>

          <div className="space-y-1">
            {gpos.map((gpo) => (
              <button
                key={gpo.id}
                data-testid={`gpo-item-${gpo.id}`}
                onClick={() => setSelectedGpoId(gpo.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${selectedGpoId === gpo.id ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{gpo.displayName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected OU & GPO Details */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950">
          {/* Selected OU Banner & Inheritance Toggle */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Organizational Unit (OU) Scope
              </div>
              <div className="text-sm font-bold text-slate-100">{selectedOu}</div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                <input
                  type="checkbox"
                  data-testid={`ou-block-inheritance-${selectedOu.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  checked={isBlockInheritance}
                  onChange={handleToggleBlockInheritance}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Block Inheritance</span>
              </label>
            </div>
          </div>

          {/* GPO Links in Selected OU */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Link className="w-4 h-4 text-cyan-400" />
              <span>GPO Links in {selectedOu.split(',')[0]}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                    <th className="py-1.5 px-2">Link Order</th>
                    <th className="py-1.5 px-2">GPO Name</th>
                    <th className="py-1.5 px-2">Enabled</th>
                    <th className="py-1.5 px-2">Enforced (No Override)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {links
                    .filter((l) => l.containerPath.toUpperCase() === selectedOu.toUpperCase())
                    .map((link) => {
                      const linkedGpo = store.getGpo(link.gpoId);
                      return (
                        <tr key={link.id} data-testid={`gpo-link-${link.gpoId}`} className="hover:bg-slate-900/60">
                          <td className="py-2 px-2 font-mono text-cyan-400 font-bold">{link.linkOrder}</td>
                          <td className="py-2 px-2 font-semibold text-slate-200">{linkedGpo?.displayName || link.gpoId}</td>
                          <td className="py-2 px-2">
                            <button
                              onClick={() => handleToggleLinkEnabled(link)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${link.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'}`}
                            >
                              {link.enabled ? 'YES' : 'NO'}
                            </button>
                          </td>
                          <td className="py-2 px-2">
                            <button
                              data-testid={`gpo-enforced-${link.gpoId}`}
                              onClick={() => handleToggleEnforced(link)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${link.enforced ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-500'}`}
                            >
                              <Lock className="w-3 h-3" />
                              {link.enforced ? 'ENFORCED' : 'NOT ENFORCED'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {links.filter((l) => l.containerPath.toUpperCase() === selectedOu.toUpperCase()).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 px-2 text-center text-slate-500 italic">
                        No direct GPO links configured on this OU.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected GPO Detailed View */}
          {selectedGpo && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
              {/* Header Tabs */}
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-100 text-sm">{selectedGpo.displayName}</span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedGpo.guid}</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                  <button
                    onClick={() => setActiveTab('scope')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${activeTab === 'scope' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Security Scope
                  </button>
                  <button
                    data-testid="gpo-tab-computer-config"
                    onClick={() => setActiveTab('computer')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${activeTab === 'computer' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Computer Config
                  </button>
                  <button
                    data-testid="gpo-tab-user-config"
                    onClick={() => setActiveTab('user')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${activeTab === 'user' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    User Config
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3 bg-slate-950">
                {activeTab === 'scope' && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-300">Security Filtering (Applies To):</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedGpo.securityFilterSids.map((sid) => (
                        <span key={sid} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[11px] flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{sid === 'S-1-5-11' ? 'Authenticated Users (S-1-5-11)' : sid}</span>
                        </span>
                      ))}
                    </div>

                    {selectedGpo.wmiFilterId && (
                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-300">WMI Filter Attached:</div>
                        <div className="mt-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-mono text-xs inline-block">
                          {selectedGpo.wmiFilterId}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'computer' && (
                  <div className="space-y-3 font-mono text-[11px]">
                    <pre className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 overflow-x-auto custom-scrollbar">
                      {JSON.stringify(selectedGpo.computerSettings, null, 2)}
                    </pre>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 font-sans" data-testid="gpo-policy-lab-controls">
                      <label className="flex items-center justify-between gap-3 rounded border border-slate-800 bg-slate-900 p-3">
                        <div>
                          <div className="font-semibold text-slate-200">Disable LanmanServer</div>
                          <div className="text-[10px] text-slate-500">Service startup policy consequence</div>
                        </div>
                        <input
                          type="checkbox"
                          data-testid="policy-lanman-disabled"
                          checked={selectedGpo.computerSettings.serviceStartup?.LanmanServer === 'DISABLED'}
                          onChange={(e) => handleLanmanPolicyChange(e.target.checked)}
                        />
                      </label>

                      <label className="flex items-center justify-between gap-3 rounded border border-slate-800 bg-slate-900 p-3">
                        <div>
                          <div className="font-semibold text-slate-200">Block SMB TCP/445</div>
                          <div className="text-[10px] text-slate-500">Firewall policy consequence</div>
                        </div>
                        <input
                          type="checkbox"
                          data-testid="policy-smb-firewall-blocked"
                          checked={selectedGpo.computerSettings.firewallProfile?.blockInboundSmb === true}
                          onChange={(e) => handleFirewallPolicyChange(e.target.checked)}
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-sans">
                      <button
                        type="button"
                        data-testid="gpo-apply-active-machine"
                        onClick={handleApplyToActiveMachine}
                        className="rounded border border-cyan-700 bg-cyan-950 px-3 py-1.5 text-[11px] font-bold text-cyan-300 hover:bg-cyan-900"
                      >
                        Apply / gpupdate {activeMachineId || ''}
                      </button>
                      <span data-testid="gpo-runtime-lanman" data-state={lanmanRuntimeState} className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[10px]">
                        LanmanServer: {lanmanRuntimeState}
                      </span>
                      <span data-testid="gpo-runtime-smb-firewall" data-state={smbFirewallRuntimeState} className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[10px]">
                        SMB Firewall: {smbFirewallRuntimeState}
                      </span>
                    </div>

                    <div
                      data-testid="gpo-apply-result"
                      data-state={applyState}
                      className="min-h-6 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] text-slate-300 whitespace-pre-wrap"
                    >
                      {applyMessage}
                    </div>
                  </div>
                )}

                {activeTab === 'user' && (
                  <div className="space-y-3 font-mono text-[11px]">
                    <pre className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 overflow-x-auto custom-scrollbar">
                      {JSON.stringify(selectedGpo.userSettings, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
