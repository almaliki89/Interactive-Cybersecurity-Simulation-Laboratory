/**
 * OMEGA ULTRA REALITY V1.4 — Windows Desktop Engine
 * Unified orchestrator for desktop session lifecycle, open application windows,
 * dynamic desktop icons, File Explorer state, and shell interactions.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import {
  OpenWindow,
  DesktopIcon,
  UserProfile,
  WindowsMachineRealitySnapshot,
} from './types';
import { FileSystemEngine } from './FileSystemEngine';
import { NtfsAclEngine } from './NtfsAclEngine';
import { WindowsServiceManager } from './WindowsServiceManager';
import { WindowsProcessManager } from './WindowsProcessManager';
import { UserProfileEngine } from './UserProfileEngine';
import { WindowsRegistryEngine } from './WindowsRegistryEngine';
import { RecycleBinEngine } from './RecycleBinEngine';
import { WindowsShellEngine } from './WindowsShellEngine';
import { globalSimulationRuntime } from '../../runtime/SimulationRuntime';

export class WindowsDesktopEngine {
  public readonly machineId: string;
  public readonly hostname: string;
  public readonly domain: string;

  public readonly aclEngine: NtfsAclEngine;
  public readonly recycleBin: RecycleBinEngine;
  public readonly fileSystem: FileSystemEngine;
  public readonly services: WindowsServiceManager;
  public readonly processes: WindowsProcessManager;
  public readonly profiles: UserProfileEngine;
  public readonly registry: WindowsRegistryEngine;
  public readonly shell: WindowsShellEngine;

  private activeSessionId: number | null = null;
  private activeUserSid: string | null = null;
  private activeUserName: string | null = null;
  private mappedDrives: Array<{ driveLetter: string; remotePath: string; label?: string; persistent?: boolean }> = [];
  private openWindows: Map<string, OpenWindow> = new Map();

  public setMappedDrives(drives: Array<{ driveLetter: string; remotePath: string; label?: string; persistent?: boolean }>): void {
    this.mappedDrives = [...drives];
  }

  public getMappedDrives(): Array<{ driveLetter: string; remotePath: string; label?: string; persistent?: boolean }> {
    return [...this.mappedDrives];
  }
  private activeWindowId: string | null = null;
  private windowZIndexCounter: number = 10;
  private windowIdCounter: number = 100;

  constructor(params: {
    machineId: string;
    hostname: string;
    domain?: string;
  }) {
    this.machineId = params.machineId;
    this.hostname = params.hostname;
    this.domain = params.domain || 'CORP.OMEGA.LOCAL';

    this.aclEngine = new NtfsAclEngine();
    this.recycleBin = new RecycleBinEngine();
    this.fileSystem = new FileSystemEngine(this.machineId, this.aclEngine, this.recycleBin);
    this.services = new WindowsServiceManager(this.machineId);
    this.processes = new WindowsProcessManager(this.machineId);
    this.profiles = new UserProfileEngine(this.machineId);
    this.registry = new WindowsRegistryEngine();
    this.shell = new WindowsShellEngine();
  }

  public getActiveSession(): { sessionId: number | null; userSid: string | null; userName: string | null } {
    return {
      sessionId: this.activeSessionId,
      userSid: this.activeUserSid,
      userName: this.activeUserName,
    };
  }

  /**
   * Called on successful interactive user logon.
   */
  public handleLogon(params: {
    sessionId: number;
    userSid: string;
    userName: string;
    domain?: string;
    vTime?: number;
  }): UserProfile {
    const vt = params.vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    this.activeSessionId = params.sessionId;
    this.activeUserSid = params.userSid;
    this.activeUserName = params.userName;

    // 1. Load / Create Profile
    const profile = this.profiles.loadOrCreateProfile({
      samAccountName: params.userName,
      domain: params.domain || this.domain,
      userSid: params.userSid,
      sessionId: params.sessionId,
      vTime: vt,
    });

    // 2. Ensure User Profile directories exist in FileSystem
    this.fileSystem.initUserProfileFolders(
      params.userName,
      params.userSid,
      params.userName,
      params.userName.includes('finance') ? 'Finance' : params.userName.includes('hr') ? 'HR' : 'IT'
    );

    // 3. Spawn Session Processes (userinit, explorer.exe, ctfmon.exe)
    this.processes.spawnUserSessionProcesses({
      sessionId: params.sessionId,
      userSid: params.userSid,
      userName: params.userName,
      vTime: vt,
    });

    // 4. Apply User & Computer Group Policy
    try {
      const regMachine = (globalThis as any).globalRealityEngine?.registry?.getMachine?.(this.machineId);
      const gpoEng = (globalThis as any).globalGroupPolicyEngine;
      if (regMachine && gpoEng) {
        gpoEng.applyPolicy(regMachine, params.userName, params.userSid, vt);
      }
    } catch (_) {}

    return profile;
  }

  /**
   * Called on user logoff.
   */
  public handleLogoff(vTime?: number): void {
    const vt = vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    if (this.activeSessionId !== null) {
      this.processes.terminateSessionProcesses(this.activeSessionId, vt);
    }
    if (this.activeUserName) {
      this.profiles.unloadProfile(this.activeUserName);
    }
    this.activeSessionId = null;
    this.activeUserSid = null;
    this.activeUserName = null;
    this.mappedDrives = [];
    this.openWindows.clear();
    this.activeWindowId = null;
  }

  /**
   * Returns desktop icons dynamically derived from default system shortcuts and user desktop directory.
   */
  public getDesktopIcons(): DesktopIcon[] {
    const icons: DesktopIcon[] = [
      {
        id: 'icon-this-pc',
        title: 'This PC',
        iconType: 'THIS_PC',
        position: { x: 20, y: 20 },
      },
      {
        id: 'icon-recycle-bin',
        title: 'Recycle Bin',
        iconType: 'RECYCLE_BIN',
        position: { x: 20, y: 110 },
      },
      {
        id: 'icon-file-explorer',
        title: 'File Explorer',
        iconType: 'FILE_EXPLORER',
        position: { x: 20, y: 200 },
      },
      {
        id: 'icon-services',
        title: 'Services',
        iconType: 'SERVICES',
        position: { x: 20, y: 290 },
      },
      {
        id: 'icon-task-manager',
        title: 'Task Manager',
        iconType: 'TASK_MANAGER',
        position: { x: 20, y: 380 },
      },
      {
        id: 'icon-cmd',
        title: 'Command Prompt',
        iconType: 'CMD',
        position: { x: 20, y: 470 },
      },
    ];

    // Read user desktop folder if logged in
    if (this.activeUserName) {
      const desktopDir = `C:\\Users\\${this.activeUserName.toLowerCase()}\\Desktop`;
      const files = this.fileSystem.listDirectory(desktopDir);
      let yOffset = 20;
      for (const f of files) {
        icons.push({
          id: `icon-desktop-file-${f.id}`,
          title: f.name,
          iconType: f.type === 'DIRECTORY' ? 'FOLDER' : 'FILE',
          targetPath: f.fullPath,
          fileId: f.id,
          position: { x: 120, y: yOffset },
        });
        yOffset += 90;
      }
    }

    return icons;
  }

  /**
   * Opens an application window on the desktop.
   */
  public openWindow(params: {
    appType: OpenWindow['appType'];
    title?: string;
    initialPath?: string;
  }): OpenWindow {
    this.windowIdCounter += 1;
    this.windowZIndexCounter += 1;
    const id = `win-${params.appType.toLowerCase()}-${this.windowIdCounter}`;

    let defaultTitle = 'Application';
    switch (params.appType) {
      case 'FILE_EXPLORER':
        defaultTitle = params.initialPath ? `File Explorer - ${params.initialPath}` : 'File Explorer';
        break;
      case 'TASK_MANAGER':
        defaultTitle = 'Task Manager';
        break;
      case 'SERVICES':
        defaultTitle = 'Services (Local)';
        break;
      case 'CMD':
        defaultTitle = 'Command Prompt';
        break;
      case 'EVENT_VIEWER':
        defaultTitle = 'Event Viewer';
        break;
      case 'NOTEPAD':
        defaultTitle = params.initialPath ? `Notepad - ${params.initialPath.split('\\').pop()}` : 'Notepad';
        break;
      case 'ACTIVE_DIRECTORY':
        defaultTitle = 'Active Directory Users and Computers (dsa.msc)';
        break;
      case 'GROUP_POLICY':
        defaultTitle = 'Group Policy Management (gpmc.msc)';
        break;
    }

    // Offset cascading window position
    const count = this.openWindows.size;
    const xPos = 60 + (count % 6) * 30;
    const yPos = 40 + (count % 6) * 25;

    const win: OpenWindow = {
      id,
      title: params.title || defaultTitle,
      appType: params.appType,
      initialPath: params.initialPath,
      isMinimized: false,
      isMaximized: false,
      zIndex: this.windowZIndexCounter,
      position: { x: xPos, y: yPos },
      size: { width: 780, height: 500 },
    };

    this.openWindows.set(id, win);
    this.activeWindowId = id;
    return win;
  }

  public closeWindow(windowId: string): boolean {
    const res = this.openWindows.delete(windowId);
    if (this.activeWindowId === windowId) {
      const remaining = Array.from(this.openWindows.values()).sort((a, b) => b.zIndex - a.zIndex);
      this.activeWindowId = remaining.length > 0 ? remaining[0].id : null;
    }
    return res;
  }

  public focusWindow(windowId: string): void {
    const win = this.openWindows.get(windowId);
    if (!win) return;
    this.windowZIndexCounter += 1;
    win.zIndex = this.windowZIndexCounter;
    win.isMinimized = false;
    this.activeWindowId = windowId;
  }

  public minimizeWindow(windowId: string): void {
    const win = this.openWindows.get(windowId);
    if (!win) return;
    win.isMinimized = true;
    if (this.activeWindowId === windowId) {
      const remaining = Array.from(this.openWindows.values())
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex);
      this.activeWindowId = remaining.length > 0 ? remaining[0].id : null;
    }
  }

  public toggleMaximizeWindow(windowId: string): void {
    const win = this.openWindows.get(windowId);
    if (!win) return;
    win.isMaximized = !win.isMaximized;
  }

  public getOpenWindows(): OpenWindow[] {
    return Array.from(this.openWindows.values());
  }

  public getActiveWindowId(): string | null {
    return this.activeWindowId;
  }

  public exportSnapshot(): WindowsMachineRealitySnapshot {
    const fsSnap = this.fileSystem.exportSnapshot();
    return {
      machineId: this.machineId,
      drives: fsSnap.drives,
      files: fsSnap.files,
      acls: fsSnap.acls,
      services: this.services.exportSnapshot(),
      processes: this.processes.exportSnapshot(),
      recycleBin: fsSnap.recycleBin,
      userProfiles: this.profiles.exportSnapshot(),
      registryHives: this.registry.exportSnapshot(),
      desktopState: {
        activeSessionId: this.activeSessionId,
        activeUserSid: this.activeUserSid,
        activeUserName: this.activeUserName,
        openWindows: this.getOpenWindows(),
        activeWindowId: this.activeWindowId,
      },
    };
  }

  public restoreSnapshot(data: WindowsMachineRealitySnapshot): void {
    this.fileSystem.restoreSnapshot({
      drives: data.drives,
      files: data.files,
      acls: data.acls,
      recycleBin: data.recycleBin,
    });
    this.services.restoreSnapshot(data.services);
    this.processes.restoreSnapshot(data.processes);
    this.profiles.restoreSnapshot(data.userProfiles);
    this.registry.restoreSnapshot(data.registryHives);

    this.activeSessionId = data.desktopState.activeSessionId;
    this.activeUserSid = data.desktopState.activeUserSid;
    this.activeUserName = (data.desktopState as any).activeUserName || null;
    this.activeWindowId = data.desktopState.activeWindowId;

    this.openWindows.clear();
    for (const w of data.desktopState.openWindows) {
      this.openWindows.set(w.id, { ...w });
    }
  }
}
