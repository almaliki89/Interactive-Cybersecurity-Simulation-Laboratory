/**
 * OMEGA ULTRA REALITY V1.4 — Windows Desktop Operational Environment
 * Realistic, responsive Windows enterprise desktop interface.
 * Features Window Management, Start Menu, Taskbar, System Tray, Live Clock,
 * and seamless interactive Logon Screen integration with RealityEngine.
 */

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  HardDrive,
  Folder,
  Trash2,
  Cog,
  Activity,
  Terminal,
  FileText,
  X,
  Minus,
  Square,
  Search,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Shield,
  User,
  LogOut,
  Power,
  ChevronUp,
  AlertCircle,
  Lock,
  Building,
  Sliders,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { WindowsMachine } from '../../../engine/reality/windows/WindowsMachine';
import { OpenWindow, DesktopIcon } from '../../../engine/reality/windows/types';
import { FileExplorer } from './FileExplorer';
import { ServicesConsole } from './ServicesConsole';
import { TaskManager } from './TaskManager';
import { CommandPrompt } from './CommandPrompt';
import { ActiveDirectoryConsole } from './ActiveDirectoryConsole';
import { GroupPolicyConsole } from './GroupPolicyConsole';
import { EventViewer } from './EventViewer';
import { globalRealityEngine } from '../../../engine/reality/RealityEngine';
import { globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { globalSoundRealityEngine } from '../../../engine/reality/SoundRealityEngine';

// Lightweight interactive Notepad window
const NotepadWindow: React.FC<{ desktop: any; initialPath?: string }> = ({ desktop, initialPath }) => {
  const [content, setContent] = useState<string>(() => {
    if (initialPath) {
      const file = desktop.fileSystem.getFile(initialPath);
      return file?.contentPreview || '';
    }
    return '';
  });
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleSave = () => {
    if (initialPath) {
      const file = desktop.fileSystem.getFile(initialPath);
      if (file) {
        file.contentPreview = content;
        file.sizeBytes = content.length;
        setIsSaved(true);
        setStatusMsg('Saved');
        globalSoundRealityEngine.playNotification();
        setTimeout(() => setStatusMsg(''), 2000);
      }
    } else {
      const activeSession = desktop.getActiveSession();
      const user = activeSession.userName?.toLowerCase() || 'sara.finance';
      const targetPath = `C:\\Users\\${user}\\Desktop\\Notes.txt`;
      desktop.fileSystem.createFile({
        filePath: targetPath,
        content,
        userSid: activeSession.userSid || 'S-1-5-21-99887766-2001',
        userName: user,
      });
      setIsSaved(true);
      setStatusMsg('Saved to Desktop');
      globalSoundRealityEngine.playNotification();
      setTimeout(() => setStatusMsg(''), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono text-xs select-none">
      <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="hover:text-cyan-300 font-semibold text-cyan-400 flex items-center gap-1"
          >
            <span>File</span> • <span>Save</span>
          </button>
          <span>Edit</span>
          <span>Format</span>
          <span>View</span>
        </div>
        {statusMsg && <span className="text-[10px] text-emerald-400 font-bold">{statusMsg}</span>}
      </div>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsSaved(false);
        }}
        placeholder="Type here..."
        className="flex-1 p-3 bg-transparent text-slate-200 outline-none resize-none font-mono text-xs leading-relaxed"
      />
      <div className="h-5 px-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div>{initialPath || 'Untitled.txt'} {isSaved ? '' : '*'}</div>
        <div className="flex items-center gap-4">
          <span>Ln {content.split('\n').length}, Col {content.length}</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};

interface WindowsDesktopProps {
  machine: WindowsMachine;
}

export const WindowsDesktop: React.FC<WindowsDesktopProps> = ({ machine }) => {
  const desktop = machine.desktop;
  const [session, setSession] = useState(desktop.getActiveSession());
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>(desktop.getOpenWindows());
  const [activeWinId, setActiveWinId] = useState<string | null>(desktop.getActiveWindowId());
  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>(desktop.getDesktopIcons());
  const [isStartMenuOpen, setIsStartMenuOpen] = useState<boolean>(false);
  const [startSearchTerm, setStartSearchTerm] = useState<string>('');
  const [isVolumeFlyoutOpen, setIsVolumeFlyoutOpen] = useState<boolean>(false);
  const [isCalendarFlyoutOpen, setIsCalendarFlyoutOpen] = useState<boolean>(false);
  const [isNetworkFlyoutOpen, setIsNetworkFlyoutOpen] = useState<boolean>(false);
  const [virtualTime, setVirtualTime] = useState<number>(globalSimulationRuntime.clock.getVirtualTime());

  // Logon Screen Form State
  const [loginUsername, setLoginUsername] = useState<string>(
    machine.id.includes('FIN') ? 'sara.finance' : machine.id.includes('HR') ? 'omar.hr' : 'ali.it'
  );
  const [loginPassword, setLoginPassword] = useState<string>('P@ssword123!');
  const [loginState, setLoginState] = useState<'idle' | 'authenticating' | 'authenticated' | 'failed'>('idle');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync virtual clock and desktop state
  useEffect(() => {
    const unsub = globalSimulationRuntime.clock.subscribe((vt) => {
      setVirtualTime(vt);
      setSession(desktop.getActiveSession());
      setOpenWindows(desktop.getOpenWindows());
      setActiveWinId(desktop.getActiveWindowId());
      setDesktopIcons(desktop.getDesktopIcons());
    });
    return () => unsub();
  }, [desktop]);

  const refreshDesktop = () => {
    setSession(desktop.getActiveSession());
    setOpenWindows(desktop.getOpenWindows());
    setActiveWinId(desktop.getActiveWindowId());
    setDesktopIcons(desktop.getDesktopIcons());
  };

  const handleOpenApp = (appType: OpenWindow['appType'], initialPath?: string) => {
    globalSoundRealityEngine.playDiskSeek();
    desktop.openWindow({ appType, initialPath });
    setIsStartMenuOpen(false);
    refreshDesktop();
  };

  const handleCloseWindow = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    desktop.closeWindow(id);
    refreshDesktop();
  };

  const handleMinimizeWindow = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    desktop.minimizeWindow(id);
    refreshDesktop();
  };

  const handleToggleMaximize = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    desktop.toggleMaximizeWindow(id);
    refreshDesktop();
  };

  const handleFocusWindow = (id: string) => {
    desktop.focusWindow(id);
    refreshDesktop();
  };

  const handleDesktopIconDoubleClick = (icon: DesktopIcon) => {
    globalSoundRealityEngine.playDiskSeek();
    switch (icon.iconType) {
      case 'THIS_PC':
      case 'FILE_EXPLORER':
        handleOpenApp('FILE_EXPLORER', 'C:\\');
        break;
      case 'RECYCLE_BIN':
        handleOpenApp('FILE_EXPLORER', 'Recycle Bin');
        break;
      case 'SERVICES':
        handleOpenApp('SERVICES');
        break;
      case 'TASK_MANAGER':
        handleOpenApp('TASK_MANAGER');
        break;
      case 'CMD':
        handleOpenApp('CMD');
        break;
      case 'FILE':
        if (icon.targetPath) {
          handleOpenApp('FILE_EXPLORER', desktop.fileSystem.getParentPath(icon.targetPath) || 'C:\\');
        }
        break;
      case 'FOLDER':
        if (icon.targetPath) {
          handleOpenApp('FILE_EXPLORER', icon.targetPath);
        }
        break;
      default:
        handleOpenApp('FILE_EXPLORER', 'C:\\');
    }
  };

  const handleLogon = () => {
    setLoginState('authenticating');
    setLoginError(null);

    const res = globalRealityEngine.attemptLogon({
      targetHost: machine.id,
      userName: loginUsername,
      password: loginPassword,
      logonType: 'Interactive',
    });

    if (res.success) {
      setLoginState('authenticated');
      globalSoundRealityEngine.playLogonChime();
      refreshDesktop();
    } else {
      setLoginState('failed');
      globalSoundRealityEngine.playErrorDing();
      setLoginError(res.failureReason || 'DOMAIN_CONTROLLER_UNREACHABLE');
    }
  };

  const handleLogoff = () => {
    if (session.sessionId) {
      globalRealityEngine.logoffSession(machine.id, session.sessionId);
      setIsStartMenuOpen(false);
      setLoginState('idle');
      refreshDesktop();
    }
  };

  // Format virtual time as a realistic Windows system clock (HH:MM AM/PM)
  const formatVirtualClock = (vt: number) => {
    const totalMinutes = Math.floor((vt + 8 * 3600) / 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMins = mins.toString().padStart(2, '0');
    return `${displayHours}:${displayMins} ${ampm}`;
  };

  const activeUser = session.userName;

  // Render Login Screen if no active session
  if (!activeUser) {
    return (
      <div
        data-testid={`desktop-${machine.id}`}
        className="relative w-full h-full min-h-[580px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-slate-100 select-none overflow-hidden"
      >
        <div
          data-testid="windows-login-screen"
          className="w-full max-w-sm bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-cyan-500/50 flex items-center justify-center shadow-lg mb-4">
            <User className="w-10 h-10 text-cyan-400" />
          </div>

          <div className="text-lg font-bold text-slate-100 tracking-wide">{machine.hostname}</div>
          <div className="text-xs text-cyan-400 font-mono mb-6">{machine.domain}</div>

          <div
            data-testid="windows-login-status"
            data-state={loginState}
            className="w-full space-y-3"
          >
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Domain Username
              </label>
              <input
                type="text"
                data-testid="domain-username-input"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="username (e.g. sara.finance)"
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded px-3 py-2 text-xs text-slate-100 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                data-testid="domain-password-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogon();
                }}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded px-3 py-2 text-xs text-slate-100 outline-none transition-colors"
              />
            </div>

            {loginError && (
              <div
                data-testid="domain-login-error"
                className="p-2.5 rounded bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Authentication Failed</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{loginError}</div>
                </div>
              </div>
            )}

            <button
              data-testid="domain-login-btn"
              onClick={handleLogon}
              disabled={loginState === 'authenticating'}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded font-medium text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              {loginState === 'authenticating' ? 'Authenticating with DC01...' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6 text-[10px] text-slate-500 text-center">
            Kerberos pre-authentication & AS-REQ evaluation via KDC @ DC01.corp.omega.local
          </div>
        </div>
      </div>
    );
  }

  // Render Operational Windows Desktop
  return (
    <div
      data-testid={`desktop-${machine.id}`}
      dir="ltr"
      onClick={() => {
        if (isStartMenuOpen) setIsStartMenuOpen(false);
      }}
      className="relative w-full h-full min-h-[580px] bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Desktop Canvas & Icons */}
      <div className="relative flex-1 p-4 overflow-hidden">
        {/* Desktop Icons Grid */}
        <div className="grid grid-flow-col grid-rows-6 gap-3 w-max">
          {desktopIcons.map((icon) => (
            <div
              key={icon.id}
              data-testid={icon.id}
              onDoubleClick={() => handleDesktopIconDoubleClick(icon)}
              className="flex flex-col items-center justify-center w-20 h-20 p-1.5 rounded hover:bg-white/10 active:bg-cyan-500/20 border border-transparent hover:border-white/10 cursor-pointer group transition-colors text-center"
            >
              {icon.iconType === 'THIS_PC' && <Monitor className="w-8 h-8 text-cyan-400 group-hover:scale-105 transition-transform" />}
              {icon.iconType === 'RECYCLE_BIN' && <Trash2 className="w-8 h-8 text-rose-400 group-hover:scale-105 transition-transform" />}
              {icon.iconType === 'FILE_EXPLORER' && <Folder className="w-8 h-8 text-amber-400 fill-amber-400/20 group-hover:scale-105 transition-transform" />}
              {icon.iconType === 'SERVICES' && <Cog className="w-8 h-8 text-slate-300 group-hover:scale-105 transition-transform" />}
              {icon.iconType === 'TASK_MANAGER' && <Activity className="w-8 h-8 text-emerald-400 group-hover:scale-105 transition-transform" />}
              {icon.iconType === 'CMD' && <Terminal className="w-8 h-8 text-slate-100 group-hover:scale-105 transition-transform" />}
              {icon.iconType === 'FILE' && <FileText className="w-8 h-8 text-blue-300 group-hover:scale-105 transition-transform" />}
              {icon.iconType === 'FOLDER' && <Folder className="w-8 h-8 text-cyan-300 group-hover:scale-105 transition-transform" />}

              <span className="text-[11px] font-medium text-slate-200 mt-1 truncate max-w-full drop-shadow-md">
                {icon.title}
              </span>
            </div>
          ))}
        </div>

        {/* Open Windows Stack */}
        {openWindows.map((win) => {
          if (win.isMinimized) return null;
          const isActive = activeWinId === win.id;

          return (
            <div
              key={win.id}
              onClick={() => handleFocusWindow(win.id)}
              style={{
                zIndex: win.zIndex,
                top: 0,
                left: 0,
                width: '100%',
                height: 'calc(100% - 40px)',
              }}
              className={`absolute rounded-lg border shadow-2xl flex flex-col overflow-hidden bg-slate-900 transition-shadow ${isActive ? 'border-cyan-500/80 shadow-cyan-950/50 ring-1 ring-cyan-500/30' : 'border-slate-700/70 shadow-black/80'}`}
            >
              {/* Window Titlebar */}
              <div
                className={`flex items-center justify-between px-3 py-1.5 border-b select-none ${isActive ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-slate-850 text-slate-400 border-slate-800'}`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold truncate">
                  {win.appType === 'FILE_EXPLORER' && <Folder className="w-3.5 h-3.5 text-amber-400" />}
                  {win.appType === 'SERVICES' && <Cog className="w-3.5 h-3.5 text-cyan-400" />}
                  {win.appType === 'TASK_MANAGER' && <Activity className="w-3.5 h-3.5 text-emerald-400" />}
                  {win.appType === 'CMD' && <Terminal className="w-3.5 h-3.5 text-slate-300" />}
                  {win.appType === 'ACTIVE_DIRECTORY' && <Building className="w-3.5 h-3.5 text-cyan-400" />}
                  {win.appType === 'GROUP_POLICY' && <Shield className="w-3.5 h-3.5 text-purple-400" />}
                  {win.appType === 'EVENT_VIEWER' && <FileText className="w-3.5 h-3.5 text-amber-400" />}
                  {win.appType === 'NOTEPAD' && <FileText className="w-3.5 h-3.5 text-blue-400" />}
                  <span className="truncate">{win.title}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleMinimizeWindow(win.id, e)}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-100"
                    title="Minimize"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleToggleMaximize(win.id, e)}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-100"
                    title={win.isMaximized ? 'Restore' : 'Maximize'}
                  >
                    <Square className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleCloseWindow(win.id, e)}
                    className="p-1 rounded hover:bg-rose-600 text-slate-400 hover:text-white"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Window Content Body */}
              <div className="flex-1 overflow-hidden">
                {win.appType === 'FILE_EXPLORER' && (
                  <FileExplorer
                    desktop={desktop}
                    initialPath={win.initialPath}
                    onOpenNotepad={(path) => handleOpenApp('NOTEPAD', path)}
                  />
                )}
                {win.appType === 'SERVICES' && <ServicesConsole desktop={desktop} />}
                {win.appType === 'TASK_MANAGER' && <TaskManager desktop={desktop} />}
                {win.appType === 'CMD' && <CommandPrompt desktop={desktop} />}
                {win.appType === 'ACTIVE_DIRECTORY' && <ActiveDirectoryConsole language="en" />}
                {win.appType === 'GROUP_POLICY' && <GroupPolicyConsole activeMachineId={machine.id} />}
                {win.appType === 'EVENT_VIEWER' && <EventViewer machine={machine} />}
                {win.appType === 'NOTEPAD' && (
                  <NotepadWindow desktop={desktop} initialPath={win.initialPath} />
                )}
              </div>
            </div>
          );
        })}

        {/* Start Menu Popup */}
        {isStartMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-12 left-2 w-88 max-w-[95vw] bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl p-3.5 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {/* Search in Start */}
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
              <input
                type="text"
                value={startSearchTerm}
                onChange={(e) => setStartSearchTerm(e.target.value)}
                placeholder="Type here to search apps, settings, tools..."
                className="w-full bg-transparent outline-none text-xs"
                autoFocus
              />
            </div>

            {/* Pinned Applications */}
            <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              <div className="text-[10px] font-semibold text-slate-500 uppercase px-2">
                {startSearchTerm ? 'Search Results' : 'Pinned Enterprise Tools'}
              </div>

              {[
                { type: 'FILE_EXPLORER' as const, path: 'C:\\', label: 'File Explorer', sub: 'Local & Network Drives', icon: Folder, color: 'text-amber-400' },
                { type: 'CMD' as const, label: 'Command Prompt (cmd.exe)', sub: 'Diagnostic CLI & Network Tools', icon: Terminal, color: 'text-slate-100' },
                { type: 'TASK_MANAGER' as const, label: 'Task Manager', sub: 'Processes & Resource Monitor', icon: Activity, color: 'text-emerald-400' },
                { type: 'SERVICES' as const, label: 'Services MMC (services.msc)', sub: 'Local Windows Service Control', icon: Cog, color: 'text-cyan-400' },
                { type: 'ACTIVE_DIRECTORY' as const, label: 'Active Directory (dsa.msc)', sub: 'Domain Users, OUs & SPNs', icon: Building, color: 'text-cyan-400' },
                { type: 'GROUP_POLICY' as const, label: 'Group Policy (gpmc.msc)', sub: 'Security Filters & GPO Links', icon: Shield, color: 'text-purple-400' },
                { type: 'EVENT_VIEWER' as const, label: 'Event Viewer (eventvwr.msc)', sub: 'Security Audits & System Logs', icon: FileText, color: 'text-amber-400' },
                { type: 'NOTEPAD' as const, label: 'Notepad', sub: 'Text Editor & Script Notes', icon: FileText, color: 'text-blue-400' },
              ]
                .filter((app) =>
                  !startSearchTerm ||
                  app.label.toLowerCase().includes(startSearchTerm.toLowerCase()) ||
                  app.sub.toLowerCase().includes(startSearchTerm.toLowerCase())
                )
                .map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.label}
                      onClick={() => handleOpenApp(app.type, app.path)}
                      className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:border-cyan-500/50">
                        <Icon className={`w-4 h-4 ${app.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-200 truncate">{app.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{app.sub}</div>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* User Profile & Sign Out Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 px-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-cyan-900/60 border border-cyan-500/50 flex items-center justify-center text-cyan-300 text-xs font-bold">
                  {session.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">{session.userName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{machine.domain}</div>
                </div>
              </div>

              <button
                onClick={handleLogoff}
                className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-1 text-[11px]"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Settings: Volume & Audio Flyout */}
        {isVolumeFlyoutOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-12 right-12 w-64 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl p-3 z-50 text-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>System Audio & Synthesis</span>
              </div>
              <span className="text-cyan-400 font-mono">100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="100"
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Real-time Sound Engine:</span>
              <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
            </div>
          </div>
        )}

        {/* Quick Settings: Network Flyout */}
        {isNetworkFlyoutOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-12 right-20 w-72 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl p-3 z-50 text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150 font-mono text-[11px]"
          >
            <div className="flex items-center justify-between text-slate-200 font-bold font-sans border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Network Status</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                CONNECTED
              </span>
            </div>
            <div className="space-y-1 text-slate-300 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">IPv4 Address:</span>
                <span className="text-cyan-300 font-bold">{machine.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subnet Mask:</span>
                <span>255.255.255.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Default Gateway:</span>
                <span>10.10.30.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary DNS:</span>
                <span className="text-purple-300">10.10.10.10 (DC01)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Physical Link:</span>
                <span className="text-emerald-400">1000 Mbps Full Duplex</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Settings: Calendar & Live Clock Flyout */}
        {isCalendarFlyoutOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-12 right-2 w-64 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl p-3 z-50 text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="border-b border-slate-800 pb-2">
              <div className="text-lg font-bold text-white tracking-tight">
                {formatVirtualClock(virtualTime)}
              </div>
              <div className="text-xs text-cyan-400 font-mono">
                Monday, September 28, 2026
              </div>
            </div>

            {/* Simulated mini calendar */}
            <div className="text-center font-mono text-[10px] space-y-1 text-slate-400">
              <div className="grid grid-cols-7 font-bold text-slate-500">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                <span className="text-slate-600">27</span><span className="text-slate-600">28</span><span className="text-slate-600">29</span><span className="text-slate-600">30</span>
                <span>1</span><span>2</span><span>3</span>
                <span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
                <span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span>
                <span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span>
                <span>25</span><span>26</span><span>27</span><span className="bg-cyan-500/30 text-cyan-300 font-bold rounded-full">28</span><span>29</span><span>30</span><span>1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Taskbar */}
      <div
        data-testid="taskbar"
        className="h-10 bg-slate-950/95 border-t border-slate-800/80 px-2 flex items-center justify-between z-40 backdrop-blur-md"
      >
        {/* Left: Start Button & App Launchers */}
        <div className="flex items-center gap-1.5">
          <button
            data-testid="start-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStartMenuOpen(!isStartMenuOpen);
              setIsVolumeFlyoutOpen(false);
              setIsCalendarFlyoutOpen(false);
              setIsNetworkFlyoutOpen(false);
            }}
            className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-all ${isStartMenuOpen ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'bg-slate-850 hover:bg-slate-800 text-slate-200'}`}
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Start</span>
          </button>

          {/* Open Windows Buttons */}
          <div className="flex items-center gap-1 ml-2">
            {openWindows.map((win) => {
              const isActive = activeWinId === win.id && !win.isMinimized;
              return (
                <button
                  key={win.id}
                  onClick={() => {
                    if (win.isMinimized) {
                      desktop.focusWindow(win.id);
                    } else if (isActive) {
                      desktop.minimizeWindow(win.id);
                    } else {
                      desktop.focusWindow(win.id);
                    }
                    refreshDesktop();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium max-w-[150px] truncate border transition-all ${isActive ? 'bg-slate-800 border-cyan-500/60 text-cyan-200' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850'}`}
                >
                  {win.appType === 'FILE_EXPLORER' && <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {win.appType === 'SERVICES' && <Cog className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  {win.appType === 'TASK_MANAGER' && <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {win.appType === 'CMD' && <Terminal className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  {win.appType === 'ACTIVE_DIRECTORY' && <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  {win.appType === 'GROUP_POLICY' && <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  {win.appType === 'EVENT_VIEWER' && <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {win.appType === 'NOTEPAD' && <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  <span className="truncate text-[11px]">{win.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: System Tray */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsNetworkFlyoutOpen(!isNetworkFlyoutOpen);
              setIsVolumeFlyoutOpen(false);
              setIsCalendarFlyoutOpen(false);
            }}
            className="p-1 rounded hover:bg-slate-850 text-slate-400 hover:text-white transition-colors"
            title="Network Connection (Click for Details)"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVolumeFlyoutOpen(!isVolumeFlyoutOpen);
              setIsNetworkFlyoutOpen(false);
              setIsCalendarFlyoutOpen(false);
            }}
            className="p-1 rounded hover:bg-slate-850 text-slate-400 hover:text-white transition-colors"
            title="Speakers & Audio Synthesis"
          >
            <Volume2 className="w-3.5 h-3.5 text-slate-300" />
          </button>

          <span className="text-[10px] font-semibold text-slate-400 px-1">ENG</span>

          <button
            data-testid="system-tray-clock"
            onClick={(e) => {
              e.stopPropagation();
              setIsCalendarFlyoutOpen(!isCalendarFlyoutOpen);
              setIsNetworkFlyoutOpen(false);
              setIsVolumeFlyoutOpen(false);
            }}
            className="flex flex-col items-end text-right px-2 py-0.5 rounded hover:bg-slate-850 transition-colors"
            title="Date & Time (Click for Calendar)"
          >
            <span className="text-[11px] font-medium text-slate-200">{formatVirtualClock(virtualTime)}</span>
            <span className="text-[9px] text-slate-400 font-mono">09/28/2026</span>
          </button>
        </div>
      </div>
    </div>
  );
};
