/**
 * OMEGA ULTRA REALITY — Device Live Inspector
 * Deep hardware inspection and real-time synchronization with RealityEngine state.
 */

import React, { useState } from 'react';
import { useDigitalTwinStore } from '../../../engine/reality/digitalTwinStore';
import { globalRealityEngine } from '../../../engine/reality/RealityEngine';
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
} from 'lucide-react';

interface DeviceInspectorProps {
  language: 'ar' | 'en';
}

export const DeviceInspector: React.FC<DeviceInspectorProps> = ({ language }) => {
  const selectedDeviceId = useDigitalTwinStore((s) => s.selectedDeviceId);
  const devices = useDigitalTwinStore((s) => s.devices);
  const toggleDevicePower = useDigitalTwinStore((s) => s.toggleDevicePower);
  const isInspectingPort = useDigitalTwinStore((s) => s.isInspectingPort);
  const selectPort = useDigitalTwinStore((s) => s.selectPort);

  const [activeTab, setActiveTab] = useState<'system' | 'processes' | 'sessions' | 'ports' | 'logs'>('system');

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
    <div className="w-96 h-full bg-slate-950 border-l rtl:border-l-0 rtl:border-r border-slate-900 flex flex-col select-none overflow-hidden">
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
          onClick={() => setActiveTab('system')}
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

        {device.ports && (
          <button
            onClick={() => setActiveTab('ports')}
            className={`flex-1 py-2 px-2 text-center whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'ports'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {language === 'ar' ? 'المنافذ (48)' : 'Ports (48)'}
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar text-xs">
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
          <div className="space-y-2 font-mono">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              ACTIVE AUTHENTICATED SESSIONS
            </div>
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-slate-600 text-xs">
                {language === 'ar' ? 'لا توجد جلسات نشطة' : 'No active sessions'}
              </div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.sessionId}
                  className="p-2.5 rounded bg-slate-900/40 border border-slate-900 space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-300">{sess.userName}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                      {sess.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Logon: {sess.logonType}</span>
                    <span>Package: {sess.authPackage}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">Source: {sess.sourceIp || '127.0.0.1'}</div>
                </div>
              ))
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
