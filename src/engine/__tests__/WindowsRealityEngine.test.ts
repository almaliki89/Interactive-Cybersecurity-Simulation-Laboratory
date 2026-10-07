import { describe, it, expect, beforeEach } from 'vitest';
import { WindowsDesktopEngine } from '../reality/windows/WindowsDesktopEngine';
import { FileSystemEngine } from '../reality/windows/FileSystemEngine';
import { NtfsAclEngine } from '../reality/windows/NtfsAclEngine';
import { WindowsServiceManager } from '../reality/windows/WindowsServiceManager';
import { WindowsProcessManager } from '../reality/windows/WindowsProcessManager';
import { UserProfileEngine } from '../reality/windows/UserProfileEngine';
import { WindowsRegistryEngine } from '../reality/windows/WindowsRegistryEngine';
import { RecycleBinEngine } from '../reality/windows/RecycleBinEngine';
import { WindowsShellEngine, ShellContext } from '../reality/windows/WindowsShellEngine';
import '../reality/network/NetworkEngine';
import '../reality/identity/ActiveDirectoryEngine';

describe('OMEGA ULTRA REALITY V1.4 — Windows Reality Engine Unit Tests', () => {
  let desktopEngine: WindowsDesktopEngine;

  beforeEach(() => {
    desktopEngine = new WindowsDesktopEngine({
      machineId: 'FIN-WS01',
      hostname: 'FIN-WS01',
      domain: 'CORP.OMEGA.LOCAL',
    });
  });

  describe('1. File System & File Operations', () => {
    it('initializes baseline directory structure and system folders', () => {
      const fs = desktopEngine.fileSystem;
      expect(fs.getFile('C:\\Windows')).toBeDefined();
      expect(fs.getFile('C:\\Windows\\System32')).toBeDefined();
      expect(fs.getFile('C:\\Program Files')).toBeDefined();
      expect(fs.getFile('C:\\Users')).toBeDefined();
    });

    it('creates files and directories with correct metadata', () => {
      const fs = desktopEngine.fileSystem;
      const resDir = fs.createDirectory({
        parentDirectoryPath: 'C:\\Users\\sara.finance\\Documents',
        folderName: 'Projects',
        userSid: 'S-1-5-21-3849201948-1001',
        userName: 'sara.finance',
      });
      expect(resDir.success).toBe(true);
      expect(resDir.folder?.fullPath).toBe('C:\\Users\\sara.finance\\Documents\\Projects');

      const resFile = fs.createFile({
        parentDirectoryPath: 'C:\\Users\\sara.finance\\Documents\\Projects',
        fileName: 'Project_Alpha.txt',
        content: 'Confidential project notes',
        userSid: 'S-1-5-21-3849201948-1001',
        userName: 'sara.finance',
      });
      expect(resFile.success).toBe(true);
      expect(resFile.file?.contentPreview).toBe('Confidential project notes');
      expect(resFile.file?.sizeBytes).toBe('Confidential project notes'.length);
    });

    it('renames files correctly while preserving ACL and content', () => {
      const fs = desktopEngine.fileSystem;
      const res = fs.createFile({
        parentDirectoryPath: 'C:\\Users\\sara.finance\\Documents',
        fileName: 'OldName.txt',
        content: 'Original content',
        userSid: 'S-1-5-21-3849201948-1001',
        userName: 'sara.finance',
      });
      expect(res.success).toBe(true);

      const renameRes = fs.rename('C:\\Users\\sara.finance\\Documents\\OldName.txt', 'NewName.txt');
      expect(renameRes.success).toBe(true);
      expect(fs.getFile('C:\\Users\\sara.finance\\Documents\\OldName.txt')).toBeUndefined();

      const newFile = fs.getFile('C:\\Users\\sara.finance\\Documents\\NewName.txt');
      expect(newFile).toBeDefined();
      expect(newFile?.contentPreview).toBe('Original content');
    });

    it('deletes local file moving to Recycle Bin and restores it accurately', () => {
      const fs = desktopEngine.fileSystem;
      const targetPath = 'C:\\Users\\sara.finance\\Documents\\TempNotes.txt';
      fs.createFile({
        parentDirectoryPath: 'C:\\Users\\sara.finance\\Documents',
        fileName: 'TempNotes.txt',
        content: 'Temporary notes to delete',
        userSid: 'S-1-5-21-3849201948-1001',
        userName: 'sara.finance',
      });

      expect(fs.getFile(targetPath)).toBeDefined();

      // Delete file
      const delRes = fs.deleteFile({
        filePath: targetPath,
        userSid: 'S-1-5-21-3849201948-1001',
        userName: 'sara.finance',
      });
      expect(delRes.success).toBe(true);
      expect(fs.getFile(targetPath)).toBeUndefined();

      // Verify in Recycle Bin
      const binItems = desktopEngine.recycleBin.getItems('S-1-5-21-3849201948-1001');
      expect(binItems.length).toBeGreaterThan(0);
      const binItem = binItems.find((i) => i.originalName === 'TempNotes.txt');
      expect(binItem).toBeDefined();

      // Restore file
      const restoreRes = fs.restoreFromRecycleBin(binItem!.id);
      expect(restoreRes.success).toBe(true);

      const restoredFile = fs.getFile(targetPath);
      expect(restoredFile).toBeDefined();
      expect(restoredFile?.contentPreview).toBe('Temporary notes to delete');
    });
  });

  describe('2. NTFS Access Control List (ACL) Engine', () => {
    it('grants access when explicit ALLOW ACE matches user SID', () => {
      const aclEngine = new NtfsAclEngine();
      const acl = aclEngine.createAcl({
        ownerSid: 'S-1-5-32-544',
        ownerName: 'BUILTIN\\Administrators',
        aces: [
          {
            id: 'ace-1',
            principalSid: 'S-1-5-21-1001',
            principalName: 'sara.finance',
            permissionType: 'ALLOW',
            rights: ['READ', 'WRITE'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
        ],
      });

      const res = aclEngine.evaluateAccess({
        aclId: acl.id,
        userSid: 'S-1-5-21-1001',
        userName: 'sara.finance',
        groupSids: [],
        requestedRight: 'READ',
      });
      expect(res.granted).toBe(true);
      expect(res.denied).toBe(false);
    });

    it('denies access when explicit DENY ACE matches user SID even if group has ALLOW', () => {
      const aclEngine = new NtfsAclEngine();
      const acl = aclEngine.createAcl({
        ownerSid: 'S-1-5-32-544',
        ownerName: 'BUILTIN\\Administrators',
        aces: [
          {
            id: 'ace-group-allow',
            principalSid: 'S-1-5-21-1100', // Domain Users Group
            principalName: 'CORP\\Domain Users',
            permissionType: 'ALLOW',
            rights: ['READ'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
          {
            id: 'ace-user-deny',
            principalSid: 'S-1-5-21-1002', // omar.hr
            principalName: 'CORP\\omar.hr',
            permissionType: 'DENY',
            rights: ['READ'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
        ],
      });

      const res = aclEngine.evaluateAccess({
        aclId: acl.id,
        userSid: 'S-1-5-21-1002',
        userName: 'omar.hr',
        groupSids: ['S-1-5-21-1100'],
        requestedRight: 'READ',
      });
      expect(res.granted).toBe(false);
      expect(res.denied).toBe(true);
      expect(res.deniedByExplicit).toBe(true);
    });

    it('evaluates effective access intersection (Share ACL ∩ NTFS ACL)', () => {
      const aclEngine = new NtfsAclEngine();
      const acl = aclEngine.createAcl({
        ownerSid: 'S-1-5-32-544',
        ownerName: 'BUILTIN\\Administrators',
        aces: [
          {
            id: 'ace-read',
            principalSid: 'S-1-5-21-1001',
            principalName: 'sara.finance',
            permissionType: 'ALLOW',
            rights: ['READ'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
        ],
      });

      // Share grants FULL_CONTROL, NTFS grants READ -> Effective = READ
      const res = aclEngine.evaluateEffectiveAccess({
        shareGranted: true,
        shareRights: ['FULL_CONTROL'],
        ntfsAclId: acl.id,
        userSid: 'S-1-5-21-1001',
        userName: 'sara.finance',
        groupSids: [],
        requestedRight: 'READ',
      });
      expect(res.effectiveAllowed).toBe(true);

      // Requesting WRITE when NTFS only grants READ -> Effective = false
      const resWrite = aclEngine.evaluateEffectiveAccess({
        shareGranted: true,
        shareRights: ['FULL_CONTROL'],
        ntfsAclId: acl.id,
        userSid: 'S-1-5-21-1001',
        userName: 'sara.finance',
        groupSids: [],
        requestedRight: 'WRITE',
      });
      expect(resWrite.effectiveAllowed).toBe(false);
    });
  });

  describe('3. Windows Services Manager', () => {
    it('manages service lifecycle (start, stop, restart)', () => {
      const sm = desktopEngine.services;
      expect(sm.isServiceRunning('LanmanServer')).toBe(true);

      // Stop service
      const stopRes = sm.stopService('LanmanServer');
      expect(stopRes.success).toBe(true);
      expect(sm.isServiceRunning('LanmanServer')).toBe(false);

      // Start service
      const startRes = sm.startService('LanmanServer');
      expect(startRes.success).toBe(true);
      expect(sm.isServiceRunning('LanmanServer')).toBe(true);
    });

    it('enforces service dependencies', () => {
      const sm = desktopEngine.services;
      // Stop dependency RpcSs
      sm.stopService('RpcSs');

      // Attempt starting a service that depends on RpcSs
      sm.stopService('LanmanWorkstation');
      const startRes = sm.startService('LanmanWorkstation');
      expect(startRes.success).toBe(false);
      expect(startRes.error).toContain("Dependency service 'RpcSs' is not running");
    });
  });

  describe('4. Windows Process Manager', () => {
    it('maintains system processes and creates user session processes on logon', () => {
      const pm = desktopEngine.processes;
      expect(pm.getProcess(4)).toBeDefined(); // System
      expect(pm.getProcess(4)?.name).toBe('System');

      const userProcs = pm.spawnUserSessionProcesses({
        sessionId: 1,
        userSid: 'S-1-5-21-3849201948-1001',
        userName: 'sara.finance',
        vTime: 100,
      });

      expect(userProcs.length).toBe(3);
      expect(userProcs.some((p) => p.name === 'explorer.exe')).toBe(true);
      expect(userProcs.some((p) => p.name === 'userinit.exe')).toBe(true);
      expect(userProcs.some((p) => p.name === 'ctfmon.exe')).toBe(true);
    });

    it('terminates all processes belonging to a session on logoff', () => {
      const pm = desktopEngine.processes;
      pm.spawnUserSessionProcesses({
        sessionId: 2,
        userSid: 'S-1-5-21-3849201948-1002',
        userName: 'omar.hr',
        vTime: 100,
      });

      const sessionProcs = pm.getProcessesBySession(2);
      expect(sessionProcs.length).toBe(3);

      pm.terminateSessionProcesses(2, 200);
      const remainingProcs = pm.getProcessesBySession(2);
      expect(remainingProcs.length).toBe(0);
    });
  });

  describe('5. Windows Shell Engine (cmd.exe)', () => {
    it('executes whoami, hostname, and dir commands purely against engine state', () => {
      const shell = desktopEngine.shell;
      const ctx: ShellContext = {
        machineId: 'FIN-WS01',
        hostname: 'FIN-WS01',
        domain: 'CORP.OMEGA.LOCAL',
        userName: 'sara.finance',
        userSid: 'S-1-5-21-3849201948-1001',
        userGroups: [{ name: 'Finance-ReadWrite', sid: 'S-1-5-21-3849201948-1101', type: 'Group' }],
        currentDirectory: 'C:\\Users\\sara.finance',
        fileSystem: desktopEngine.fileSystem,
        processManager: desktopEngine.processes,
        serviceManager: desktopEngine.services,
      };

      const whoamiRes = shell.execute('whoami', ctx);
      expect(whoamiRes.exitCode).toBe(0);
      expect(whoamiRes.output).toContain('corp.omega.local\\sara.finance');

      const hostnameRes = shell.execute('hostname', ctx);
      expect(hostnameRes.exitCode).toBe(0);
      expect(hostnameRes.output).toBe('FIN-WS01');

      const dirRes = shell.execute('dir', ctx);
      expect(dirRes.exitCode).toBe(0);
      expect(dirRes.output).toContain('Documents');
      expect(dirRes.output).toContain('Desktop');
    });

    it('executes tasklist and sc query commands', () => {
      const shell = desktopEngine.shell;
      const ctx: ShellContext = {
        machineId: 'FIN-WS01',
        hostname: 'FIN-WS01',
        domain: 'CORP.OMEGA.LOCAL',
        userName: 'sara.finance',
        userSid: 'S-1-5-21-3849201948-1001',
        userGroups: [],
        currentDirectory: 'C:\\Windows',
        fileSystem: desktopEngine.fileSystem,
        processManager: desktopEngine.processes,
        serviceManager: desktopEngine.services,
      };

      const tasklistRes = shell.execute('tasklist', ctx);
      expect(tasklistRes.exitCode).toBe(0);
      expect(tasklistRes.output).toContain('System');
      expect(tasklistRes.output).toContain('lsass.exe');

      const scRes = shell.execute('sc query LanmanServer', ctx);
      expect(scRes.exitCode).toBe(0);
      expect(scRes.output).toContain('LanmanServer');
      expect(scRes.output).toContain('4  RUNNING');
    });

    it('executes realistic networking and enterprise commands: ipconfig, ping, nslookup, net user, net share, netstat, systeminfo, help', () => {
      const shell = desktopEngine.shell;
      const ctx: ShellContext = {
        machineId: 'FIN-WS01',
        hostname: 'FIN-WS01',
        domain: 'CORP.OMEGA.LOCAL',
        userName: 'sara.finance',
        userSid: 'S-1-5-21-3849201948-1001',
        userGroups: [{ name: 'Finance-ReadWrite', sid: 'S-1-5-21-3849201948-1101', type: 'Group' }],
        currentDirectory: 'C:\\Users\\sara.finance',
        fileSystem: desktopEngine.fileSystem,
        processManager: desktopEngine.processes,
        serviceManager: desktopEngine.services,
      };

      // 1. IPCONFIG
      const ipRes = shell.execute('ipconfig /all', ctx);
      expect(ipRes.exitCode).toBe(0);
      expect(ipRes.output).toContain('Windows IP Configuration');
      expect(ipRes.output).toContain('IPv4 Address');
      expect(ipRes.output).toContain('Subnet Mask');

      // 2. PING
      const pingRes = shell.execute('ping 10.10.10.10', ctx);
      expect(pingRes.exitCode).toBe(0);
      expect(pingRes.output).toContain('Pinging 10.10.10.10');
      expect(pingRes.output).toContain('bytes=32');

      // 3. NSLOOKUP
      const nsRes = shell.execute('nslookup dc01', ctx);
      expect(nsRes.exitCode).toBe(0);
      expect(nsRes.output).toContain('dc01');

      // 4. NET USER
      const netUserRes = shell.execute('net user', ctx);
      expect(netUserRes.exitCode).toBe(0);
      expect(netUserRes.output).toContain('User accounts for \\\\FIN-WS01');

      // 5. NET USER SARA.FINANCE
      const userDetailRes = shell.execute('net user sara.finance', ctx);
      expect(userDetailRes.exitCode).toBe(0);
      expect(userDetailRes.output).toContain('sara.finance');
      expect(userDetailRes.output).toContain('Account active');

      // 6. NET SHARE
      const netShareRes = shell.execute('net share', ctx);
      expect(netShareRes.exitCode).toBe(0);
      expect(netShareRes.output).toContain('C$');
      expect(netShareRes.output).toContain('ADMIN$');

      // 7. NETSTAT
      const netstatRes = shell.execute('netstat', ctx);
      expect(netstatRes.exitCode).toBe(0);
      expect(netstatRes.output).toContain('Active Connections');
      expect(netstatRes.output).toContain('Proto');

      // 8. SYSTEMINFO
      const sysinfoRes = shell.execute('systeminfo', ctx);
      expect(sysinfoRes.exitCode).toBe(0);
      expect(sysinfoRes.output).toContain('Host Name:');
      expect(sysinfoRes.output).toContain('Microsoft Windows 10 Enterprise');

      // 9. HELP
      const helpRes = shell.execute('help', ctx);
      expect(helpRes.exitCode).toBe(0);
      expect(helpRes.output).toContain('IPCONFIG');
      expect(helpRes.output).toContain('PING');
      expect(helpRes.output).toContain('WHOAMI');
    });
  });

  describe('6. Desktop Engine & Snapshot Determinism', () => {
    it('manages interactive logon, desktop icons, and window state', () => {
      desktopEngine.handleLogon({
        sessionId: 1,
        userSid: 'S-1-5-21-3849201948-1001',
        userName: 'sara.finance',
        vTime: 100,
      });

      const session = desktopEngine.getActiveSession();
      expect(session.userName).toBe('sara.finance');
      expect(session.sessionId).toBe(1);

      const icons = desktopEngine.getDesktopIcons();
      expect(icons.some((i) => i.title === 'This PC')).toBe(true);
      expect(icons.some((i) => i.title === 'File Explorer')).toBe(true);

      const win = desktopEngine.openWindow({ appType: 'FILE_EXPLORER', initialPath: 'C:\\' });
      expect(desktopEngine.getOpenWindows().length).toBe(1);
      expect(desktopEngine.getActiveWindowId()).toBe(win.id);

      desktopEngine.closeWindow(win.id);
      expect(desktopEngine.getOpenWindows().length).toBe(0);
    });

    it('exports and restores snapshot identically', () => {
      desktopEngine.handleLogon({
        sessionId: 1,
        userSid: 'S-1-5-21-3849201948-1001',
        userName: 'sara.finance',
        vTime: 100,
      });

      desktopEngine.fileSystem.createFile({
        parentDirectoryPath: 'C:\\Users\\sara.finance\\Documents',
        fileName: 'SnapshotTest.txt',
        content: 'Preserved across snapshot restore',
        userSid: 'S-1-5-21-3849201948-1001',
        userName: 'sara.finance',
      });

      const snapshot = desktopEngine.exportSnapshot();

      // Create new engine and restore
      const restoredEngine = new WindowsDesktopEngine({
        machineId: 'FIN-WS01',
        hostname: 'FIN-WS01',
      });

      restoredEngine.restoreSnapshot(snapshot);

      const restoredFile = restoredEngine.fileSystem.getFile('C:\\Users\\sara.finance\\Documents\\SnapshotTest.txt');
      expect(restoredFile).toBeDefined();
      expect(restoredFile?.contentPreview).toBe('Preserved across snapshot restore');
      expect(restoredEngine.getActiveSession().userName).toBe('sara.finance');
    });
  });
});
