/**
 * OMEGA ULTRA REALITY — Device Live Inspector
 * Deep hardware inspection and real-time synchronization with RealityEngine state.
 */

import React, { useState } from 'react';
import { useDigitalTwinStore } from '../../../engine/reality/digitalTwinStore';
import { globalRealityEngine } from '../../../engine/reality/RealityEngine';
import { globalNetworkEngine } from '../../../engine/reality/network/NetworkEngine';
import { KerberosInspector } from './KerberosInspector';
import { ActiveDirectoryConsole } from './ActiveDirectoryConsole';
import { Dc01Inspector } from './Dc01Inspector';
import {
  Power,
  Cpu,
  Layers,
  Activity,
  Terminal,
  FileText,
  Shield,
  Network,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Server,
  X,
  Play,
  Share2,
  FolderLock,
  Globe,
  Users,
} from 'lucide-react';

type InspectorTab =
  | 'system'
  | 'sessions'
  | 'processes'
  | 'network'
  | 'ports'
  | 'logs'
  | 'kerberos'
  | 'ad'
  | 'dc01';

interface DeviceInspectorProps {
  language: 'ar' | 'en';
}

export const DeviceInspector: React.FC<DeviceInspectorProps> = ({ language }) => {
  const selectedDeviceId = useDigitalTwinStore((s) => s.selectedDeviceId);
  const selectedCableId = useDigitalTwinStore((s) => s.selectedCableId);
  const devices = useDigitalTwinStore((s) => s.devices);
  const cables = useDigitalTwinStore((s) => s.cables);
  const toggleDevicePower = useDigitalTwinStore((s) => s.toggleDevicePower);
  const disconnectCable = useDigitalTwinStore((s) => s.disconnectCable);
  const connectCable = useDigitalTwinStore((s) => s.connectCable);
  const selectCable = useDigitalTwinStore((s) => s.selectCable);
  const selectDevice = useDigitalTwinStore((s) => s.selectDevice);
  const isInspectingPort = useDigitalTwinStore((s) => s.isInspectingPort);
  const selectPort = useDigitalTwinStore((s) => s.selectPort);

  const [activeTab, setActiveTab] = useState<InspectorTab>('network');
  const [cliInput, setCliInput] = useState<string>('nslookup FILE01');
  const [cliOutput, setCliOutput] = useState<string>('');
  const [smbShareTestResult, setSmbShareTestResult] = useState<string | null>(null);

  const [logonUsername, setLogonUsername] = useState<string>('sara.finance');
  const [logonPassword, setLogonPassword] = useState<string>('P@ssword123!');
  const [logonError, setLogonResultError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleWorkstationLogon = (user: string, pass: string) => {
    setLogonResultError(null);
    const res = globalRealityEngine.attemptLogon({
      targetHost: selectedDeviceId!,
      userName: user,
      password: pass,
      logonType: 'Interactive',
    });
    if (!res.success) {
      setLogonResultError(res.failureReason || 'BAD_PASSWORD');
    } else {
      setLogonResultError(null);
    }
    setRefreshKey((prev) => prev + 1);
  };

  const handleWorkstationLogoff = (sessId: number) => {
    globalRealityEngine.logoffSession(selectedDeviceId!, sessId);
    setLogonResultError(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleRunCommand = (cmdToRun?: string) => {
    const cmd = cmdToRun || cliInput;
    if (!cmd.trim() || !selectedDeviceId) return;
    const out = globalNetworkEngine.executeCommand(selectedDeviceId, cmd);
    setCliOutput(out);
  };

  const handleTestSmbShare = (shareName: string, user: string = 'sara.finance') => {
    if (!selectedDeviceId) return;
    const res = globalNetworkEngine.accessSmbShare({
      sourceDeviceId: selectedDeviceId,
      serverHostname: 'FILE01',
      shareName,
      userName: user,
    });
    if (res.success) {
      setSmbShareTestResult(`✅ Connected to \\\\FILE01\\${shareName} as ${user} (${res.latencyMs}ms)`);
    } else {
      setSmbShareTestResult(`❌ Failed to connect to \\\\FILE01\\${shareName}: ${res.error} (${res.errorDetails})`);
    }
  };

  // If a cable is specifically selected
  if (selectedCableId && !selectedDeviceId) {
    const cable = cables[selectedCableId];
    if (cable) {
      const isConnected = cable.status === 'CONNECTED';
      return (
        <div className="w-96 h-full bg-slate-950 border-l rtl:border-l-0 rtl:border-r border-slate-900 flex flex-col select-none overflow-hidden" data-testid="cable-inspector">
          <div className="p-3.5 border-b border-slate-900 bg-slate-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span className="text-xs font-bold font-mono text-white">{cable.id}</span>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/50">
                {cable.type}
              </span>
            </div>
            <button onClick={() => selectCable(null)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Physical Cable Properties</div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Source:</span>
                <span className="text-white font-bold">{cable.sourcePort}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Destination:</span>
                <span className="text-white font-bold">{cable.targetPort}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Length:</span>
                <span>{cable.lengthMeters} m</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Link Speed:</span>
                <span className="text-emerald-400">{cable.linkSpeedMbps.toLocaleString()} Mbps</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Status:</span>
                <span className={`font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {cable.status}
                </span>
              </div>
            </div>

            {/* Interactive Physical Unplug / Plug Control */}
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cable Interaction</div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {language === 'ar'
                  ? 'فصل الكابل يقطع الاتصال الفيزيائي فوراً ويسقط إشارة المنفذ في المبدل والواجهة.'
                  : 'Disconnecting the physical cable drops the link layer state down immediately across both device endpoints.'}
              </p>
              <button
                data-testid={isConnected ? "cable-disconnect-btn" : "cable-reconnect-btn"}
                onClick={() => isConnected ? disconnectCable(cable.id) : connectCable(cable.id)}
                className={`w-full py-2 px-3 rounded text-xs font-bold transition-all shadow-sm ${
                  isConnected
                    ? 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                }`}
              >
                {isConnected
                  ? (language === 'ar' ? 'فصل الكابل فيزيائياً (Disconnect Cable)' : 'Disconnect Cable')
                  : (language === 'ar' ? 'إعادة توصيل الكابل (Plug In Cable)' : 'Connect Cable')}
              </button>
            </div>

            {/* Quick jump to endpoints */}
            <div className="space-y-1.5 pt-2 border-t border-slate-900">
              <div className="text-[10px] text-slate-500 uppercase">Endpoints</div>
              <div className="flex gap-2">
                <button
                  onClick={() => selectDevice(cable.sourceDeviceId)}
                  className="flex-1 p-2 rounded bg-slate-900 hover:bg-slate-800 text-[11px] text-left text-cyan-400 border border-slate-800"
                >
                  Inspect {cable.sourceDeviceId}
                </button>
                <button
                  onClick={() => selectDevice(cable.targetDeviceId)}
                  className="flex-1 p-2 rounded bg-slate-900 hover:bg-slate-800 text-[11px] text-left text-cyan-400 border border-slate-800"
                >
                  Inspect {cable.targetDeviceId}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  if (!selectedDeviceId) {
    return (
      <div className="w-96 h-full bg-slate-950 border-l rtl:border-l-0 rtl:border-r border-slate-900 p-6 flex flex-col items-center justify-center text-center select-none text-slate-500">
        <Server className="w-10 h-10 mb-3 text-slate-800" />
        <div className="text-sm font-semibold text-slate-400">
          {language === 'ar' ? 'لم يتم تحديد أي جهاز' : 'No Device Selected'}
        </div>
        <p className="text-xs text-slate-600 mt-1 max-w-xs">
          {language === 'ar'
            ? 'انقر على أي خادم أو مبدل أو جدار حماية أو محطة عمل في المشهد ثلاثي الأبعاد أو شجرة الأجهزة لمعاينته.'
            : 'Click on any server, switch, firewall, or workstation in the 3D scene or device tree to inspect.'}
        </p>
      </div>
    );
  }

  const device = devices[selectedDeviceId];
  if (!device) return null;

  const isOnline = device.powerStatus === 'ONLINE';

  // Read synchronized RealityEngine state if machine exists
  const realityMachine = device.realityMachineId
    ? globalRealityEngine.registry.getMachine(device.realityMachineId)
    : undefined;

  const processes = realityMachine ? realityMachine.getProcesses() : [];
  const sessions = realityMachine ? realityMachine.getSessions() : [];
  const sockets = realityMachine ? realityMachine.getSockets() : [];
  const eventLogs = realityMachine ? realityMachine.getEventLogs() : [];

  return (
    <div className="w-96 h-full bg-slate-950 border-l rtl:border-l-0 rtl:border-r border-slate-900 flex flex-col select-none overflow-hidden" data-testid={`device-inspector-${selectedDeviceId}`}>
      {/* Device Header */}
      <div className="p-3.5 border-b border-slate-900 bg-slate-900/30 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-bold font-mono tracking-tight text-white uppercase truncate">
                {device.id}
              </span>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {device.category.toUpperCase()}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">{device.name}</div>
          </div>

          {/* Power Button */}
          <button
            onClick={() => toggleDevicePower(device.id)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isOnline
                ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
                : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 animate-pulse'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{isOnline ? (language === 'ar' ? 'إيقاف التشغيل' : 'POWER OFF') : (language === 'ar' ? 'تشغيل الجهاز' : 'BOOT')}</span>
          </button>
        </div>

        {/* Quick Specs Pills */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono">
          <div className="bg-slate-900/60 border border-slate-800/60 p-1.5 rounded text-center">
            <div className="text-slate-500 text-[8px] uppercase">STATUS</div>
            <div className={isOnline ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/60 p-1.5 rounded text-center">
            <div className="text-slate-500 text-[8px] uppercase">TEMP</div>
            <div className="text-cyan-400 font-bold">{device.temperatureCelsius.toFixed(1)} °C</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/60 p-1.5 rounded text-center">
            <div className="text-slate-500 text-[8px] uppercase">DRAW</div>
            <div className="text-amber-400 font-bold">{device.powerWatts} W</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 bg-slate-900/20 text-[10px] font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab('network')}
          data-testid="tab-network-inspector"
          className={`flex-1 py-2 px-2 text-center whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'network'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          {language === 'ar' ? 'الشبكة والتشخيص' : 'Network & CLI'}
        </button>

        <button
          onClick={() => setActiveTab('system')}
          data-testid="tab-system-inspector"
          className={`flex-1 py-2 px-2 text-center whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'system'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          {language === 'ar' ? 'النظام والعتاد' : 'System & HW'}
        </button>

        {realityMachine && (
          <>
            <button
              onClick={() => setActiveTab('processes')}
              data-testid="tab-processes-inspector"
              className={`flex-1 py-2 px-2 text-center whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'processes'
                  ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {language === 'ar' ? `العمليات (${processes.length})` : `Proc (${processes.length})`}
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              data-testid="tab-sessions-inspector"
              className={`flex-1 py-2 px-2 text-center whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'sessions'
                  ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {language === 'ar' ? `الجلسات (${sessions.length})` : `Sess (${sessions.length})`}
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              data-testid="tab-logs-inspector"
              className={`flex-1 py-2 px-2 text-center whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {language === 'ar' ? 'السجلات' : 'Logs'}
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('kerberos')}
          className={`flex-1 py-2 px-2 text-center whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'kerberos'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
          data-testid="tab-kerberos-inspector"
        >
          Kerberos
        </button>

        <button
          onClick={() => setActiveTab('ad')}
          className={`flex-1 py-2 px-2 text-center whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'ad'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
          data-testid="tab-ad-console"
        >
          AD Console
        </button>

        {device.id === 'DC01' && (
          <button
            onClick={() => setActiveTab('dc01')}
            className={`flex-1 py-2 px-2 text-center whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'dc01'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
            data-testid="tab-dc01-inspector"
          >
            DC01 Health
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar text-xs">
        {/* ================= TAB: TRUE NETWORK & DIAGNOSTICS ================= */}
        {activeTab === 'network' && (
          <div className="space-y-3 font-mono">
            {/* Live Interface Card */}
            {(() => {
              const iface = globalNetworkEngine.getInterface(device.id);
              const state = globalNetworkEngine.evaluateInterfaceState(device.id);
              const isIfaceUp = state.operState === 'UP' && isOnline;

              return (
                <div className="space-y-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-900">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">
                      ACTIVE NETWORK INTERFACE
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isIfaceUp
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {isIfaceUp ? 'OPERATIONAL (UP)' : `DOWN (${state.reason || 'DISCONNECTED'})`}
                    </span>
                  </div>

                  {iface && (
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Adapter Name:</span>
                        <span className="text-white font-bold">{iface.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IPv4 Address:</span>
                        <span className="text-cyan-300 font-bold">{iface.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Subnet Mask:</span>
                        <span>{iface.subnetMask}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Default Gateway:</span>
                        <span>{iface.gateway}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">DNS Server:</span>
                        <span>{iface.dnsServers.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Physical MAC:</span>
                        <span className="text-purple-300">{iface.macAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">VLAN Segment:</span>
                        <span className="text-amber-400">VLAN {iface.vlanId}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>TX: {iface.data.txPackets} pkts ({iface.data.txBytes.toLocaleString()} B)</span>
                        <span>RX: {iface.data.rxPackets} pkts ({iface.data.rxBytes.toLocaleString()} B)</span>
                      </div>

                      {iface.connectedCableId && cables[iface.connectedCableId] && (() => {
                        const cb = cables[iface.connectedCableId!];
                        const isCbConnected = cb.status === 'CONNECTED';
                        return (
                          <div
                            data-testid={`cable-${cb.id}`}
                            className="p-2 rounded bg-slate-950/80 border border-slate-800/80 mt-2 space-y-1.5"
                          >
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400 font-bold">PHYSICAL CABLE: {cb.id}</span>
                              <span className={`font-bold ${isCbConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isCbConnected ? 'CONNECTED' : 'DISCONNECTED'}
                              </span>
                            </div>
                            <button
                              data-testid={isCbConnected ? "cable-disconnect-btn" : "cable-reconnect-btn"}
                              onClick={() => isCbConnected ? disconnectCable(cb.id) : connectCable(cb.id)}
                              className={`w-full py-1 px-2 rounded text-[10px] font-bold transition-all ${
                                isCbConnected
                                  ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
                                  : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                              }`}
                            >
                              {isCbConnected ? 'Disconnect Cable' : 'Reconnect Cable'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Interactive Network Diagnostic CLI */}
            <div className="space-y-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800" data-testid="network-cli-container">
              <div className="flex justify-between items-center text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>SIMULATED NETWORK DIAGNOSTIC CLI</span>
                </div>
              </div>

              {/* Quick action preset buttons */}
              <div className="flex flex-wrap gap-1">
                <button
                  data-testid="btn-cli-nslookup"
                  onClick={() => { setCliInput('nslookup FILE01'); handleRunCommand('nslookup FILE01'); }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] border border-slate-700"
                >
                  nslookup FILE01
                </button>
                <button
                  data-testid="btn-cli-ping"
                  onClick={() => { setCliInput('ping DC01'); handleRunCommand('ping DC01'); }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] border border-slate-700"
                >
                  ping DC01
                </button>
                <button
                  data-testid="btn-cli-testnet"
                  onClick={() => { setCliInput('Test-NetConnection FILE01 -Port 445'); handleRunCommand('Test-NetConnection FILE01 -Port 445'); }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[10px] border border-slate-700"
                >
                  Test SMB (445)
                </button>
                <button
                  onClick={() => { setCliInput('ipconfig /all'); handleRunCommand('ipconfig /all'); }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                >
                  ipconfig /all
                </button>
                <button
                  onClick={() => { setCliInput('arp -a'); handleRunCommand('arp -a'); }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                >
                  arp -a
                </button>
                <button
                  onClick={() => { setCliInput('route print'); handleRunCommand('route print'); }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                >
                  route print
                </button>
              </div>

              {/* Input box */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  data-testid="cli-command-input"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
                  placeholder="e.g. nslookup FILE01, ping 10.10.10.10"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  data-testid="btn-run-cli-command"
                  onClick={() => handleRunCommand()}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>RUN</span>
                </button>
              </div>

              {/* Output Display */}
              {cliOutput && (
                <pre
                  data-testid="cli-command-output"
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-200 overflow-x-auto whitespace-pre font-mono leading-relaxed"
                >
                  {cliOutput}
                </pre>
              )}
            </div>

            {/* If CORE-SW01: Show Switch MAC Address Table */}
            {device.id === 'CORE-SW01' && (
              <div className="space-y-1.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-900" data-testid="switch-mac-table-card">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase text-purple-400 font-bold tracking-wider">
                    L2 MAC ADDRESS TABLE (SWITCHING FABRIC)
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {globalNetworkEngine.switching.getMacTable().length} ENTRIES
                  </span>
                </div>
                <div className="space-y-1 text-[10px]">
                  {globalNetworkEngine.switching.getMacTable().map((macEntry, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-1.5 rounded bg-slate-950/60 border border-slate-900"
                    >
                      <span className="font-bold text-slate-300">{macEntry.macAddress}</span>
                      <span className="text-cyan-400">Port Gi1/0/{macEntry.portNumber}</span>
                      <span className="text-purple-400">VLAN {macEntry.vlanId}</span>
                      <span className="text-slate-500">{macEntry.static ? 'STATIC' : 'DYNAMIC'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If FILE01: Show SMB Shares */}
            {device.id === 'FILE01' && (
              <div className="space-y-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-900" data-testid="smb-shares-card">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                    SMB SHARES (LANMANSERVER)
                  </span>
                  <span className="text-[9px] text-slate-500">PORT 445</span>
                </div>
                <div className="space-y-1.5">
                  {globalNetworkEngine.smb.getShares().map((sh, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-900 space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>\\\\FILE01\\{sh.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-500">{sh.readOnly ? 'READ-ONLY' : 'READ/WRITE'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{sh.description}</div>
                      <div className="flex gap-1.5 pt-1">
                        <button
                          data-testid={`smb-${sh.name.toLowerCase()}-connect-sara`}
                          onClick={() => handleTestSmbShare(sh.name, 'sara.finance')}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[9px] text-cyan-300 border border-slate-800"
                        >
                          Connect as Sara
                        </button>
                        <button
                          data-testid={`smb-${sh.name.toLowerCase()}-connect-omar`}
                          onClick={() => handleTestSmbShare(sh.name, 'omar.hr')}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[9px] text-purple-300 border border-slate-800"
                        >
                          Connect as Omar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {smbShareTestResult && (
                  <div 
                    data-testid="smb-access-result"
                    data-result={smbShareTestResult.includes('✅') ? 'success' : 'access-denied'}
                    className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300"
                  >
                    {smbShareTestResult}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* ================= TAB 1: SYSTEM SPECIFICATIONS ================= */}
        {activeTab === 'system' && (
          <div className="space-y-3 font-mono">
            {/* Offline Alert */}
            {!isOnline && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'الجهاز متوقف عن العمل حالياً. العمليات ومنافذ الشبكة معطلة.'
                    : 'System is currently powered off. Kernel halted and NIC interfaces offline.'}
                </span>
              </div>
            )}

            {/* Hardware Information Table */}
            <div className="space-y-1.5 bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
              <div className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider mb-1">
                {language === 'ar' ? 'مواصفات العتاد الفيزيائي' : 'PHYSICAL HARDWARE SPECS'}
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Model:</span>
                <span className="text-slate-200 text-right">{device.model}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Serial #:</span>
                <span className="text-slate-300">{device.serialNumber}</span>
              </div>
              {device.rackId && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Rack Location:</span>
                  <span className="text-slate-300">
                    {device.rackId} (RU {device.rackUnitStart} — {device.rackUnitStart! + device.rackUnitHeight! - 1})
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Fan Speed:</span>
                <span className="text-slate-300">{device.fanRpm} RPM</span>
              </div>
            </div>

            {/* Network Interfaces */}
            {device.interfaces && (
              <div className="space-y-1.5 bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
                <div className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider mb-1">
                  {language === 'ar' ? 'بطاقات واجهات الشبكة (NIC)' : 'NETWORK INTERFACES'}
                </div>
                {device.interfaces.map((nic, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-950/60 border border-slate-900 space-y-0.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-200">{nic.name}</span>
                      <span
                        className={`text-[9px] px-1 rounded ${
                          nic.status === 'UP' && isOnline
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {isOnline ? nic.status : 'DOWN'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>IP: {nic.ip}</span>
                      <span>MAC: {nic.mac}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Firewall Metrics if FW-01 */}
            {device.firewallState && (
              <div className="space-y-2 bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
                <div className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">
                  {language === 'ar' ? 'حالة جدار الحماية (NGFW)' : 'FIREWALL SECURITY ZONES'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                    <div className="text-slate-500">ACTIVE SESSIONS</div>
                    <div className="text-cyan-400 font-bold text-sm">
                      {isOnline ? device.firewallState.activeSessions : 0}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                    <div className="text-slate-500">INSPECTION RATE</div>
                    <div className="text-emerald-400 font-bold text-sm">
                      {isOnline ? `${device.firewallState.inspectionThroughputMbps} Mbps` : '0 Mbps'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {device.firewallState.zones.map((zone, zIdx) => (
                    <div key={zIdx} className="flex justify-between items-center text-[10px] p-1 rounded bg-slate-950/40">
                      <span className="font-semibold text-slate-300">{zone.name}</span>
                      <span className="text-slate-500">{zone.interfaces.join(', ')}</span>
                      <span className={`px-1 rounded ${zone.defaultAction === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {zone.defaultAction}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: ACTIVE PROCESSES ================= */}
        {activeTab === 'processes' && realityMachine && (
          <div className="space-y-1.5 font-mono">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
              <span>REAL PROCESS TREE</span>
              <span>COUNT: {processes.length}</span>
            </div>
            {processes.length === 0 ? (
              <div className="p-4 text-center text-slate-600 text-xs">
                {language === 'ar' ? 'لا توجد عمليات قيد التشغيل (الجهاز متوقف)' : 'No processes running (Machine is offline)'}
              </div>
            ) : (
              processes.map((proc) => (
                <div
                  key={proc.pid}
                  className="p-2 rounded bg-slate-900/40 border border-slate-900 space-y-0.5 hover:border-slate-800 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{proc.name}</span>
                    <span className="text-[9px] text-cyan-400 bg-cyan-950/50 px-1 rounded">
                      PID {proc.pid}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[180px]">User: {proc.userName}</span>
                    <span className="text-slate-500">Mem: {proc.memoryMb} MB</span>
                  </div>
                  <div className="text-[9px] text-slate-600 truncate">{proc.commandLine}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= TAB 3: USER SESSIONS ================= */}
        {activeTab === 'sessions' && realityMachine && (
          <div className="space-y-3 font-mono" data-testid="sessions-panel">
            {sessions.length === 0 ? (
              device.category === 'workstation' ? (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-sans text-xs" data-testid="domain-login-status" data-state={logonError ? "failed" : "none"}>
                  <div className="flex flex-col items-center justify-center py-2 space-y-1">
                    <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="text-white font-bold text-center">
                      {language === 'ar' ? 'سجل الدخول إلى مجال NEXORA' : 'NEXORA Domain Sign In'}
                    </div>
                    <div className="text-[10px] text-slate-500 text-center">
                      {language === 'ar' ? 'سجل الدخول باستخدام بيانات اعتماد المجال الخاصة بك' : 'Sign in to your domain-joined workstation'}
                    </div>
                  </div>

                  {logonError && (
                    <div data-testid="domain-login-error" className="p-2.5 rounded bg-rose-950/40 border border-rose-900 text-rose-300 text-[10px] font-mono flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{language === 'ar' ? `فشل تسجيل الدخول: ${logonError}` : `Logon Failed: ${logonError}`}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        {language === 'ar' ? 'اسم المستخدم / UPN' : 'Username / UPN'}
                      </label>
                      <input
                        type="text"
                        data-testid="domain-username-input"
                        value={logonUsername}
                        onChange={(e) => setLogonUsername(e.target.value)}
                        placeholder="sara.finance or omar.hr"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        {language === 'ar' ? 'كلمة المرور' : 'Password'}
                      </label>
                      <input
                        type="password"
                        data-testid="domain-password-input"
                        value={logonPassword}
                        onChange={(e) => setLogonPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Preset Fast Selection Links */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      <button
                        data-testid="preset-sara"
                        onClick={() => { setLogonUsername('sara.finance'); setLogonPassword('P@ssword123!'); }}
                        className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-[9px] text-cyan-400 border border-slate-800"
                      >
                        Sara (Finance)
                      </button>
                      <button
                        data-testid="preset-omar"
                        onClick={() => { setLogonUsername('omar.hr'); setLogonPassword('P@ssword123!'); }}
                        className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-[9px] text-purple-400 border border-slate-800"
                      >
                        Omar (HR)
                      </button>
                      <button
                        data-testid="preset-administrator"
                        onClick={() => { setLogonUsername('administrator'); setLogonPassword('P@ssword123!'); }}
                        className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-[9px] text-amber-400 border border-slate-800"
                      >
                        Administrator
                      </button>
                    </div>

                    <button
                      onClick={() => handleWorkstationLogon(logonUsername, logonPassword)}
                      data-testid="domain-login-btn"
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md mt-2 font-mono"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تسجيل الدخول' : 'SIGN IN'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-600 text-xs">
                  {language === 'ar' ? 'لا توجد جلسات نشطة' : 'No active sessions'}
                </div>
              )
            ) : (
              <div className="space-y-2" data-testid="domain-login-status" data-state="authenticated">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex justify-between items-center">
                  <span>ACTIVE AUTHENTICATED SESSIONS</span>
                  <span data-testid="logged-in-user" className="text-cyan-400 font-bold font-mono">
                    {sessions[0].userName}
                  </span>
                </div>
                {sessions.map((sess) => (
                  <div
                    key={sess.sessionId}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-xs">{sess.userName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold uppercase">
                        {sess.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400">
                      <div>
                        <span className="text-slate-500">Logon: </span>
                        <span className="text-slate-200">{sess.logonType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Package: </span>
                        <span className="text-slate-200">{sess.authPackage}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">IP Source: </span>
                        <span className="text-slate-200">{sess.sourceIp || '127.0.0.1'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Token ID: </span>
                        <span className="text-slate-300 text-[9px] truncate">{sess.tokenId}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                      <button
                        onClick={() => handleWorkstationLogoff(sess.sessionId)}
                        data-testid="domain-logoff-btn"
                        className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-[10px] font-bold"
                      >
                        {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out / Logoff'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: SWITCH PORTS (CORE-SW01) ================= */}
        {activeTab === 'ports' && device.ports && (
          <div className="space-y-3 font-mono">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              48-PORT GIGABIT ETHERNET MATRIX
            </div>

            {/* Visual 48-port Grid */}
            <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-900/40 rounded-lg border border-slate-900">
              {device.ports.map((port) => {
                const isSelected = isInspectingPort === port.portNumber;
                const isPortUp = port.linkState === 'UP' && isOnline;
                return (
                  <button
                    key={port.portNumber}
                    onClick={() => selectPort(port.portNumber)}
                    className={`h-7 rounded flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                        : isPortUp
                        ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:border-emerald-500'
                        : 'bg-slate-950 border border-slate-800/60 text-slate-600 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full mb-0.5 ${isPortUp ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                    <span className="text-[8px] font-bold">{port.portNumber}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Port Inspector Box */}
            {isInspectingPort && (
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-cyan-800/40 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-cyan-300 font-bold">
                  <span>Port {isInspectingPort} Details</span>
                  <button onClick={() => selectPort(null)} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {(() => {
                  const p = device.ports?.find((item) => item.portNumber === isInspectingPort);
                  if (!p) return null;
                  return (
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Label:</span>
                        <span>{p.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Link State:</span>
                        <span className={p.linkState === 'UP' && isOnline ? 'text-emerald-400' : 'text-slate-500'}>
                          {isOnline ? p.linkState : 'DOWN'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">VLAN:</span>
                        <span className="text-purple-400">VLAN {p.vlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Speed:</span>
                        <span>{p.speed}</span>
                      </div>
                      {p.connectedDevice && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Target Device:</span>
                          <span className="text-cyan-400 font-bold">{p.connectedDevice}</span>
                        </div>
                      )}
                      {p.macLearned && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Learned MAC:</span>
                          <span>{p.macLearned}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                        <span>TX: {p.txPackets.toLocaleString()}</span>
                        <span>RX: {p.rxPackets.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: KERBEROS TICKETS ================= */}
        {activeTab === 'kerberos' && (
          <KerberosInspector workstationHost={device.id} language={language} />
        )}

        {/* ================= TAB: ACTIVE DIRECTORY CONSOLE ================= */}
        {activeTab === 'ad' && (
          <div className="h-[450px]">
            <ActiveDirectoryConsole language={language} />
          </div>
        )}

        {/* ================= TAB: DC01 HEALTH ================= */}
        {activeTab === 'dc01' && device.id === 'DC01' && (
          <Dc01Inspector language={language} />
        )}

        {/* ================= TAB 5: EVENT LOGS ================= */}
        {activeTab === 'logs' && realityMachine && (
          <div className="space-y-1.5 font-mono">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              SYSTEM EVENT LOG FEED
            </div>
            {eventLogs.length === 0 ? (
              <div className="p-4 text-center text-slate-600 text-xs">
                {language === 'ar' ? 'لا توجد سجلات مسجلة' : 'No event log entries found'}
              </div>
            ) : (
              eventLogs.slice(0, 10).map((evt) => (
                <div
                  key={evt.id}
                  className="p-2 rounded bg-slate-900/40 border border-slate-900 space-y-0.5 text-[10px]"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-400">Event ID {evt.eventId}</span>
                    <span className="text-slate-500">T+{evt.virtualTime}ms</span>
                  </div>
                  <div className="text-slate-300 font-semibold">{evt.task}</div>
                  <div className="text-slate-500 text-[9px]">
                    User: {evt.user} | Computer: {evt.computer}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
