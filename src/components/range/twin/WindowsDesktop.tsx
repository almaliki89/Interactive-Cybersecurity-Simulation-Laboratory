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
  Volume2,
  Shield,
  User,
  LogOut,
  Power,
  ChevronUp,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { WindowsMachine } from '../../../engine/reality/windows/WindowsMachine';
import { OpenWindow, DesktopIcon } from '../../../engine/reality/windows/types';
import { FileExplorer } from './FileExplorer';
import { ServicesConsole } from './ServicesConsole';
import { TaskManager } from './TaskManager';
import { CommandPrompt } from './CommandPrompt';
import { globalRealityEngine } from '../../../engine/reality/RealityEngine';
import { globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';

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
      refreshDesktop();
    } else {
      setLoginState('failed');
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
                top: win.isMaximized ? 0 : `${win.position.y}px`,
                left: win.isMaximized ? 0 : `${win.position.x}px`,
                width: win.isMaximized ? '100%' : `${win.size.width}px`,
                height: win.isMaximized ? 'calc(100% - 40px)' : `${win.size.height}px`,
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
                {win.appType === 'NOTEPAD' && (
                  <div className="p-3 bg-slate-950 text-slate-200 font-mono text-xs h-full overflow-y-auto">
                    {win.initialPath ? (
                      <div className="whitespace-pre-wrap">
                        {desktop.fileSystem.getFile(win.initialPath)?.contentPreview || 'Empty file'}
                      </div>
                    ) : (
                      <textarea
                        className="w-full h-full bg-transparent outline-none resize-none"
                        placeholder="Type notes here..."
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Start Menu Popup */}
        {isStartMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-12 left-2 w-80 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md p-3 z-50 flex flex-col gap-3"
          >
            {/* Search in Start */}
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Type here to search..."
                className="w-full bg-transparent outline-none text-xs"
              />
            </div>

            {/* Pinned Applications */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-500 uppercase px-2">Pinned</div>
              <button
                onClick={() => handleOpenApp('FILE_EXPLORER', 'C:\\')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 text-left"
              >
                <Folder className="w-4 h-4 text-amber-400" />
                File Explorer
              </button>
              <button
                onClick={() => handleOpenApp('SERVICES')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 text-left"
              >
                <Cog className="w-4 h-4 text-cyan-400" />
                Services
              </button>
              <button
                onClick={() => handleOpenApp('TASK_MANAGER')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 text-left"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                Task Manager
              </button>
              <button
                onClick={() => handleOpenApp('CMD')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 text-left"
              >
                <Terminal className="w-4 h-4 text-slate-100" />
                Command Prompt
              </button>
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
                className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Taskbar */}
      <div
        data-testid="taskbar"
        className="h-10 bg-slate-950/90 border-t border-slate-800/80 px-2 flex items-center justify-between z-40 backdrop-blur-md"
      >
        {/* Left: Start Button & App Launchers */}
        <div className="flex items-center gap-1.5">
          <button
            data-testid="start-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStartMenuOpen(!isStartMenuOpen);
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
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium max-w-[140px] truncate border transition-all ${isActive ? 'bg-slate-800 border-cyan-500/60 text-cyan-200' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850'}`}
                >
                  {win.appType === 'FILE_EXPLORER' && <Folder className="w-3.5 h-3.5 text-amber-400" />}
                  {win.appType === 'SERVICES' && <Cog className="w-3.5 h-3.5 text-cyan-400" />}
                  {win.appType === 'TASK_MANAGER' && <Activity className="w-3.5 h-3.5 text-emerald-400" />}
                  {win.appType === 'CMD' && <Terminal className="w-3.5 h-3.5 text-slate-300" />}
                  <span className="truncate text-[11px]">{win.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: System Tray */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-400">ENG</span>
          </div>

          <div
            data-testid="system-tray-clock"
            className="flex flex-col items-end text-right px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-default"
          >
            <span className="text-[11px] font-medium text-slate-200">{formatVirtualClock(virtualTime)}</span>
            <span className="text-[9px] text-slate-400 font-mono">09/28/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
