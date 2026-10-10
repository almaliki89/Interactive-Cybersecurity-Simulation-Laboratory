/**
 * OMEGA ULTRA REALITY V1.5 — Enterprise Virtual Machine Remote Console (RDP)
 * Photorealistic VMware / Proxmox / Microsoft Remote Desktop client interface.
 * Connects directly to real Windows machines (DC01, FILE01, FIN-WS01, HR-WS01, IT-WS01)
 * with authentic resolution, interactive multi-window management, audio feedback, and scenario guides.
 */

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Maximize2,
  Minimize2,
  Power,
  Volume2,
  VolumeX,
  Shield,
  Layers,
  ArrowRightLeft,
  Activity,
  Terminal,
  Folder,
  Server,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Sparkles,
  RefreshCw,
  X,
  ChevronDown,
} from 'lucide-react';
import { useDigitalTwinStore } from '../../../engine/reality/digitalTwinStore';
import { globalRealityEngine } from '../../../engine/reality/RealityEngine';
import { WindowsDesktop } from './WindowsDesktop';
import { globalSoundRealityEngine } from '../../../engine/reality/SoundRealityEngine';

interface VirtualMachineConsoleProps {
  language: 'ar' | 'en';
}

export const VirtualMachineConsole: React.FC<VirtualMachineConsoleProps> = ({ language }) => {
  const selectedDeviceId = useDigitalTwinStore((s) => s.selectedDeviceId);
  const selectDevice = useDigitalTwinStore((s) => s.selectDevice);
  const setRenderMode = useDigitalTwinStore((s) => s.setRenderMode);
  const devices = useDigitalTwinStore((s) => s.devices);
  const ambientNoiseMuted = useDigitalTwinStore((s) => s.ambientNoiseMuted);
  const setAmbientNoiseMuted = useDigitalTwinStore((s) => s.setAmbientNoiseMuted);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScenarioDrawer, setShowScenarioDrawer] = useState(false);
  const [rebooting, setRebooting] = useState(false);

  // Default to FIN-WS01 if selected device is not a Windows machine
  const activeMachineId =
    selectedDeviceId && globalRealityEngine.registry.getMachine(selectedDeviceId)
      ? selectedDeviceId
      : 'FIN-WS01';

  const machine = globalRealityEngine.registry.getMachine(activeMachineId);
  const twinDevice = devices[activeMachineId];

  const isAr = language === 'ar';

  // Handle reboot
  const handleReboot = () => {
    setRebooting(true);
    globalSoundRealityEngine.playPostBeep();
    setTimeout(() => {
      if (machine) {
        machine.shutdown(0);
        machine.boot(0);
        globalSoundRealityEngine.playLogonChime();
      }
      setRebooting(false);
    }, 1200);
  };

  // Enterprise Machines list
  const availableMachines = [
    {
      id: 'FIN-WS01',
      nameEn: 'FIN-WS01 (Sara / Finance Lead)',
      nameAr: 'FIN-WS01 (سارة / الإدارة المالية)',
      ip: '10.10.30.15',
      roleEn: 'Windows 11 Enterprise Workstation',
      roleAr: 'محطة عمل ويندوز 11 للمالية',
      icon: Laptop,
    },
    {
      id: 'HR-WS01',
      nameEn: 'HR-WS01 (Omar / HR Personnel)',
      nameAr: 'HR-WS01 (عمر / الموارد البشرية)',
      ip: '10.10.30.20',
      roleEn: 'Windows 11 Enterprise Workstation',
      roleAr: 'محطة عمل ويندوز 11 للموارد البشرية',
      icon: Laptop,
    },
    {
      id: 'IT-WS01',
      nameEn: 'IT-WS01 (Ali / Systems Admin)',
      nameAr: 'IT-WS01 (علي / مسؤول الأنظمة)',
      ip: '10.10.30.25',
      roleEn: 'Windows 11 Admin Workstation',
      roleAr: 'محطة إدارة البنية التحتية والأنظمة',
      icon: Laptop,
    },
    {
      id: 'DC01',
      nameEn: 'DC01 (Domain Controller & AD)',
      nameAr: 'DC01 (متحكم النطاق وخادم AD)',
      ip: '10.10.10.10',
      roleEn: 'Windows Server 2022 Core DC',
      roleAr: 'خادم ويندوز سيرفر 2022 لإدارة النطاق',
      icon: Server,
    },
    {
      id: 'FILE01',
      nameEn: 'FILE01 (Storage & SMB Shares)',
      nameAr: 'FILE01 (خادم تخزين الملفات والمشاركات)',
      ip: '10.10.20.10',
      roleEn: 'Windows Server 2022 File Server',
      roleAr: 'خادم مشاركة ملفات SMB وأقراص الشبكة',
      icon: Server,
    },
  ];

  if (!machine) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-400">
        <Server className="w-12 h-12 mb-3 text-cyan-500 animate-pulse" />
        <div className="text-sm font-bold text-white mb-1">
          {isAr ? 'جاري تهيئة وحدة التحكم الافتراضية...' : 'Initializing Virtual Machine Console...'}
        </div>
        <p className="text-xs text-slate-500 max-w-sm text-center">
          {isAr
            ? 'جاري ربط جلسة Remote Desktop مع نظام التشغيل المستهدف...'
            : 'Establishing Remote Desktop Protocol connection with simulated OS...'}
        </p>
      </div>
    );
  }

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col'
    : 'flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden select-none';

  return (
    <div className={containerClasses} data-testid="vm-console-container">
      {/* ================= Remote Desktop Top Connection Bar (mstsc.exe style) ================= */}
      <div className="h-10 bg-slate-900/95 border-b border-slate-800 px-3 flex items-center justify-between text-xs select-none backdrop-blur z-30 shrink-0">
        {/* Left: Host Identity & Machine Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-white truncate">
              <span className="text-cyan-400">[RDP]</span>
              <span>{machine.hostname}.{machine.domain}</span>
              <span className="text-slate-500 hidden sm:inline">({machine.ipAddress})</span>
            </div>
          </div>

          {/* Quick Machine Switcher Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            {availableMachines.map((m) => {
              const isCurrent = m.id === activeMachineId;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => selectDevice(m.id)}
                  title={isAr ? m.nameAr : m.nameEn}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium flex items-center gap-1 transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3 h-3 text-cyan-400" />
                  <span>{m.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center / Right: Network Latency, Audio, Fullscreen, Switch Views */}
        <div className="flex items-center gap-2">
          {/* Machine dropdown for smaller screens */}
          <div className="lg:hidden">
            <select
              value={activeMachineId}
              onChange={(e) => selectDevice(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] font-mono text-cyan-300 outline-none"
            >
              {availableMachines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.ip}
                </option>
              ))}
            </select>
          </div>

          {/* Network Latency Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400" dir="ltr">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-bold">1ms</span>
            <span className="text-slate-500">| TLS 1.3</span>
          </div>

          {/* Scenarios Helper Button */}
          <button
            onClick={() => setShowScenarioDrawer(!showScenarioDrawer)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors border ${
              showScenarioDrawer
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
            title={isAr ? 'سيناريوهات المحاكاة الواقعية' : 'Realistic Scenarios Guide'}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isAr ? 'سيناريوهات الواقع' : 'Reality Scenarios'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setAmbientNoiseMuted(!ambientNoiseMuted)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={ambientNoiseMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {ambientNoiseMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Reboot VM Button */}
          <button
            onClick={handleReboot}
            disabled={rebooting}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
            title={isAr ? 'إعادة تشغيل النظام' : 'Restart Virtual Machine'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rebooting ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Console'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Return to 3D Server Room */}
          <button
            onClick={() => setRenderMode('3d-webgl')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 text-[10px] font-mono font-medium flex items-center gap-1 border border-slate-700 transition-colors"
            title={isAr ? 'العودة لغرفة الخوادم ثلاثية الأبعاد' : 'Back to 3D Server Rack'}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">{isAr ? 'مشهد 3D' : '3D View'}</span>
          </button>
        </div>
      </div>

      {/* ================= Main Desktop Operational Viewport ================= */}
      <div className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col">
        {rebooting ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-black text-slate-200 select-none">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
            <div className="text-sm font-mono tracking-widest text-cyan-400 uppercase">
              {isAr ? 'جاري إعادة تشغيل ويندوز...' : 'Restarting Windows...'}
            </div>
            <div className="text-xs font-mono text-slate-500 mt-1">
              BIOS POST 0x00 • UEFI Secure Boot Enabled
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <WindowsDesktop key={machine.id} machine={machine} />
          </div>
        )}

        {/* ================= Interactive Scenarios Drawer (Popup) ================= */}
        {showScenarioDrawer && (
          <div
            className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-96 max-w-[90vw] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl p-4 z-50 text-xs text-slate-300 space-y-3 font-sans animate-in fade-in slide-in-from-top-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">
                  {isAr ? 'سيناريوهات واقعية تفاعلية' : 'Hands-On Reality Scenarios'}
                </span>
              </div>
              <button
                onClick={() => setShowScenarioDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'تم تصميم هذا المختبر ليحاكي بيئة الشركات الحقيقية بدقة متناهية (Active Directory، صلاحيات NTFS، سياسات GPO، ومشاركة الملفات SMB).'
                : 'This simulator strictly mirrors authentic enterprise IT infrastructure (Active Directory, NTFS permissions, GPO enforcement, and SMB network shares).'}
            </p>

            <div className="space-y-2">
              {/* Scenario 1 */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center gap-2 font-semibold text-cyan-300 mb-1">
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? '1. قرص المالية المشترك (Mapped Drive F:)' : '1. Finance Mapped Drive (F:)'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'في جهاز سارة (FIN-WS01)، افتح File Explorer وادخل على القرص (F:) المرتبط بالخادم \\\\FILE01\\Finance عبر بروتوكول SMB الحقيقي.'
                    : 'On FIN-WS01, open File Explorer and access drive (F:) mapped to \\\\FILE01\\Finance via authentic SMB protocol.'}
                </p>
              </div>

              {/* Scenario 2 */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1">
                  <Terminal className="w-3.5 h-3.5 text-slate-200" />
                  <span>{isAr ? '2. أوامر الفحص والسياسات (CLI)' : '2. Diagnostic Commands (cmd.exe)'}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono text-[10px]">
                  • whoami /all (عرض المجموعات والصلاحيات)<br />
                  • ipconfig /all & ping 10.10.10.10<br />
                  • gpupdate /force (تحديث سياسات المجموعة)<br />
                  • klist (فحص تذاكر Kerberos TGT & TGS)
                </p>
              </div>

              {/* Scenario 3 */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center gap-2 font-semibold text-purple-300 mb-1">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isAr ? '3. إدارة النطاق (Active Directory & GPO)' : '3. Domain & Group Policy MMC'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'افتح قائمة Start وشغل Active Directory أو Group Policy Management لرؤية المستخدمين والسياسات والتذاكر مباشرة.'
                    : 'Open Start Menu and launch Active Directory or Group Policy Management to inspect domain users, OUs, and security links.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
