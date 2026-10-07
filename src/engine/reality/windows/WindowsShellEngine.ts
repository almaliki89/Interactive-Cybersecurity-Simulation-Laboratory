/**
 * OMEGA ULTRA REALITY V1.4 — Windows Shell Engine
 * Purely simulated deterministic Command Prompt (cmd.exe) executing against the simulation state.
 * Supports whoami, hostname, dir, cd, type, mkdir, del, tasklist, sc, net use, klist, etc.
 * Zero OS execution - purely virtualized.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { ShellCommandResult } from './types';
import { FileSystemEngine } from './FileSystemEngine';
import { WindowsProcessManager } from './WindowsProcessManager';
import { WindowsServiceManager } from './WindowsServiceManager';
import { globalSimulationRuntime } from '../../runtime/SimulationRuntime';
const getGroupPolicyEngine = () => (globalThis as any).globalGroupPolicyEngine;
const getNetworkEngine = () => (globalThis as any).globalNetworkEngine;
const getActiveDirectoryEngine = () => (globalThis as any).globalActiveDirectoryEngine;
import type { WindowsMachine } from './WindowsMachine';

type RealityGlobal = typeof globalThis & {
  globalRealityEngine?: {
    registry: {
      getMachine: (id: string) => WindowsMachine | undefined;
    };
  };
};

export interface ShellContext {
  machineId: string;
  hostname: string;
  domain: string;
  userName: string;
  userSid: string;
  userGroups: { name: string; sid: string; type: string }[];
  currentDirectory: string;
  fileSystem: FileSystemEngine;
  processManager: WindowsProcessManager;
  serviceManager: WindowsServiceManager;
  getKerberosTickets?: () => Array<{
    ticketType: string;
    clientPrincipal: string;
    servicePrincipal: string;
    expiresAtVirtualTime: number;
    flags: string[];
  }>;
  onNetworkShareConnect?: (sharePath: string, driveLetter?: string) => { success: boolean; error?: string };
}

export class WindowsShellEngine {
  public execute(rawCommand: string, ctx: ShellContext): ShellCommandResult {
    const trimmed = rawCommand.trim();
    if (!trimmed) {
      return {
        command: rawCommand,
        exitCode: 0,
        output: '',
        currentDirectory: ctx.currentDirectory,
      };
    }

    const parts = trimmed.split(' ').filter(Boolean);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // 1. WHOAMI
    if (cmd === 'whoami') {
      const flag = args[0]?.toLowerCase();
      if (flag === '/groups') {
        let out = `\nGROUP INFORMATION\n-----------------\n`;
        out += `Group Name                                  Type             SID                                          Attributes\n`;
        out += `=========================================== ================ ============================================ ==================================================\n`;
        out += `Everyone                                    Well-known group S-1-1-0                                      Mandatory group, Enabled by default, Enabled group\n`;
        out += `BUILTIN\\Users                               Alias            S-1-5-32-545                                 Mandatory group, Enabled by default, Enabled group\n`;
        out += `NT AUTHORITY\\INTERACTIVE                    Well-known group S-1-5-4                                      Mandatory group, Enabled by default, Enabled group\n`;
        out += `NT AUTHORITY\\Authenticated Users            Well-known group S-1-5-11                                     Mandatory group, Enabled by default, Enabled group\n`;

        for (const g of ctx.userGroups) {
          const gName = g.name.padEnd(43, ' ');
          const gType = (g.type || 'Group').padEnd(16, ' ');
          const gSid = g.sid.padEnd(44, ' ');
          out += `${gName} ${gType} ${gSid} Mandatory group, Enabled by default, Enabled group\n`;
        }
        return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
      } else if (flag === '/priv') {
        let out = `\nPRIVILEGES INFORMATION\n----------------------\n`;
        out += `Privilege Name                Description                          State\n`;
        out += `============================= ==================================== ========\n`;
        out += `SeChangeNotifyPrivilege       Bypass traverse checking             Enabled\n`;
        out += `SeIncreaseWorkingSetPrivilege Increase a process working set       Disabled\n`;
        out += `SeShutdownPrivilege           Shut down the system                 Disabled\n`;
        return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
      } else {
        return {
          command: rawCommand,
          exitCode: 0,
          output: `${ctx.domain.toLowerCase()}\\${ctx.userName.toLowerCase()}`,
          currentDirectory: ctx.currentDirectory,
        };
      }
    }

    // 2. HOSTNAME
    if (cmd === 'hostname') {
      return { command: rawCommand, exitCode: 0, output: ctx.hostname.toUpperCase(), currentDirectory: ctx.currentDirectory };
    }

    // 3. ECHO
    if (cmd === 'echo') {
      const text = args.join(' ');
      return { command: rawCommand, exitCode: 0, output: text, currentDirectory: ctx.currentDirectory };
    }

    // 4. CD / CHDIR
    if (cmd === 'cd' || cmd === 'chdir') {
      if (args.length === 0) {
        return { command: rawCommand, exitCode: 0, output: ctx.currentDirectory, currentDirectory: ctx.currentDirectory };
      }
      let target = args.join(' ');
      if (target === '..') {
        const parent = ctx.fileSystem.getParentPath(ctx.currentDirectory);
        const newDir = parent || ctx.currentDirectory;
        return { command: rawCommand, exitCode: 0, output: '', currentDirectory: newDir };
      } else if (target === '\\') {
        const drive = ctx.currentDirectory.split(':')[0] || 'C';
        return { command: rawCommand, exitCode: 0, output: '', currentDirectory: `${drive}:\\` };
      }

      let resolved = target;
      if (!target.includes(':') && !target.startsWith('\\\\')) {
        resolved = `${ctx.currentDirectory.endsWith('\\') ? ctx.currentDirectory : ctx.currentDirectory + '\\'}${target}`;
      }
      const norm = ctx.fileSystem.normalizePath(resolved);
      const dirObj = ctx.fileSystem.getFile(norm);
      if (!dirObj || dirObj.type !== 'DIRECTORY') {
        return {
          command: rawCommand,
          exitCode: 1,
          output: `The system cannot find the path specified: ${target}`,
          currentDirectory: ctx.currentDirectory,
        };
      }
      return { command: rawCommand, exitCode: 0, output: '', currentDirectory: norm };
    }

    // 5. DIR
    if (cmd === 'dir') {
      const targetPath = args.length > 0 ? args[0] : ctx.currentDirectory;
      let resolved = targetPath;
      if (!targetPath.includes(':') && !targetPath.startsWith('\\\\')) {
        resolved = `${ctx.currentDirectory.endsWith('\\') ? ctx.currentDirectory : ctx.currentDirectory + '\\'}${targetPath}`;
      }
      const norm = ctx.fileSystem.normalizePath(resolved);
      const items = ctx.fileSystem.listDirectory(norm);

      let out = ` Volume in drive C is Local Disk\n Directory of ${norm}\n\n`;
      out += `09/28/2026  08:00 AM    <DIR>          .\n`;
      out += `09/28/2026  08:00 AM    <DIR>          ..\n`;

      let fileCount = 0;
      let totalBytes = 0;
      let dirCount = 2;

      for (const item of items) {
        if (item.type === 'DIRECTORY') {
          dirCount++;
          out += `09/28/2026  08:00 AM    <DIR>          ${item.name}\n`;
        } else {
          fileCount++;
          totalBytes += item.sizeBytes;
          const sz = item.sizeBytes.toLocaleString().padStart(14, ' ');
          out += `09/28/2026  08:00 AM    ${sz} ${item.name}\n`;
        }
      }

      out += `               ${fileCount} File(s)    ${totalBytes.toLocaleString()} bytes\n`;
      out += `               ${dirCount} Dir(s)   380,000,000,000 bytes free\n`;

      return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
    }

    // 6. TYPE
    if (cmd === 'type') {
      if (args.length === 0) {
        return { command: rawCommand, exitCode: 1, output: 'The syntax of the command is incorrect.', currentDirectory: ctx.currentDirectory };
      }
      const target = args[0];
      let resolved = target;
      if (!target.includes(':') && !target.startsWith('\\\\')) {
        resolved = `${ctx.currentDirectory.endsWith('\\') ? ctx.currentDirectory : ctx.currentDirectory + '\\'}${target}`;
      }
      const norm = ctx.fileSystem.normalizePath(resolved);
      const file = ctx.fileSystem.getFile(norm);
      if (!file || file.type !== 'FILE') {
        return { command: rawCommand, exitCode: 1, output: `The system cannot find the file specified: ${target}`, currentDirectory: ctx.currentDirectory };
      }

      return {
        command: rawCommand,
        exitCode: 0,
        output: file.contentPreview || `[Binary File Content: ${file.sizeBytes} bytes]`,
        currentDirectory: ctx.currentDirectory,
      };
    }

    // 7. MKDIR / MD
    if (cmd === 'mkdir' || cmd === 'md') {
      if (args.length === 0) {
        return { command: rawCommand, exitCode: 1, output: 'The syntax of the command is incorrect.', currentDirectory: ctx.currentDirectory };
      }
      const folderName = args[0];
      const res = ctx.fileSystem.createDirectory({
        parentDirectoryPath: ctx.currentDirectory,
        folderName,
        userSid: ctx.userSid,
        userName: ctx.userName,
      });
      if (!res.success) {
        return { command: rawCommand, exitCode: 1, output: res.error || 'Failed to create directory.', currentDirectory: ctx.currentDirectory };
      }
      return { command: rawCommand, exitCode: 0, output: '', currentDirectory: ctx.currentDirectory };
    }

    // 8. DEL / ERASE
    if (cmd === 'del' || cmd === 'erase') {
      if (args.length === 0) {
        return { command: rawCommand, exitCode: 1, output: 'The syntax of the command is incorrect.', currentDirectory: ctx.currentDirectory };
      }
      const fileName = args[0];
      let resolved = fileName;
      if (!fileName.includes(':') && !fileName.startsWith('\\\\')) {
        resolved = `${ctx.currentDirectory.endsWith('\\') ? ctx.currentDirectory : ctx.currentDirectory + '\\'}${fileName}`;
      }
      const res = ctx.fileSystem.deleteFile({
        filePath: resolved,
        userSid: ctx.userSid,
        userName: ctx.userName,
      });
      if (!res.success) {
        return { command: rawCommand, exitCode: 1, output: `Could Not Find ${fileName}`, currentDirectory: ctx.currentDirectory };
      }
      return { command: rawCommand, exitCode: 0, output: '', currentDirectory: ctx.currentDirectory };
    }

    // 9. TASKLIST
    if (cmd === 'tasklist') {
      const procs = ctx.processManager.getAllProcesses().filter((p) => p.status === 'RUNNING');
      let out = `\nImage Name                     PID Session Name        Session#    Mem Usage\n`;
      out += `========================= ======== ================ =========== ============\n`;
      for (const p of procs) {
        const name = p.name.padEnd(25, ' ');
        const pid = p.pid.toString().padStart(8, ' ');
        const sessName = (p.sessionId === 0 ? 'Services' : 'Console').padEnd(16, ' ');
        const sessNum = p.sessionId.toString().padStart(11, ' ');
        const mem = `${Math.round(p.memoryMbSimulated * 1024).toLocaleString()} K`.padStart(12, ' ');
        out += `${name} ${pid} ${sessName} ${sessNum} ${mem}\n`;
      }
      return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
    }

    // 10. SC (Service Control)
    if (cmd === 'sc') {
      const sub = args[0]?.toLowerCase();
      const svcName = args[1];
      if (sub === 'query') {
        if (!svcName) {
          const list = ctx.serviceManager.getAllServices();
          let out = '';
          for (const s of list) {
            out += `SERVICE_NAME: ${s.name}\n        TYPE               : 20  WIN32_SHARE_PROCESS\n        STATE              : ${s.status === 'RUNNING' ? '4  RUNNING' : '1  STOPPED'}\n        WIN32_EXIT_CODE    : 0  (0x0)\n\n`;
          }
          return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
        } else {
          const s = ctx.serviceManager.getService(svcName);
          if (!s) {
            return { command: rawCommand, exitCode: 1060, output: `[SC] OpenService FAILED 1060: The specified service does not exist as an installed service.`, currentDirectory: ctx.currentDirectory };
          }
          const out = `SERVICE_NAME: ${s.name}\n        TYPE               : 20  WIN32_SHARE_PROCESS\n        STATE              : ${s.status === 'RUNNING' ? '4  RUNNING' : '1  STOPPED'}\n        WIN32_EXIT_CODE    : 0  (0x0)\n        SERVICE_EXIT_CODE  : 0  (0x0)\n        CHECKPOINT         : 0x0\n        WAIT_HINT          : 0x0\n        PID                : ${s.pid || 0}\n        FLAGS              : `;
          return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
        }
      } else if (sub === 'start') {
        if (!svcName) return { command: rawCommand, exitCode: 1, output: 'SC START requires service name.', currentDirectory: ctx.currentDirectory };
        const res = ctx.serviceManager.startService(svcName);
        if (!res.success) return { command: rawCommand, exitCode: 1, output: `[SC] StartService FAILED: ${res.error}`, currentDirectory: ctx.currentDirectory };
        return { command: rawCommand, exitCode: 0, output: `SERVICE_NAME: ${svcName}\n        STATE              : 2  START_PENDING\n        STATE              : 4  RUNNING`, currentDirectory: ctx.currentDirectory };
      } else if (sub === 'stop') {
        if (!svcName) return { command: rawCommand, exitCode: 1, output: 'SC STOP requires service name.', currentDirectory: ctx.currentDirectory };
        const res = ctx.serviceManager.stopService(svcName);
        if (!res.success) return { command: rawCommand, exitCode: 1, output: `[SC] ControlService FAILED: ${res.error}`, currentDirectory: ctx.currentDirectory };
        return { command: rawCommand, exitCode: 0, output: `SERVICE_NAME: ${svcName}\n        STATE              : 3  STOP_PENDING\n        STATE              : 1  STOPPED`, currentDirectory: ctx.currentDirectory };
      }
    }

    // 11. NET USE
    if (cmd === 'net' && args[0]?.toLowerCase() === 'use') {
      if (args.length === 1) {
        let out = `\nNew connections will be remembered.\n\n`;
        out += `Status       Local     Remote                    Network\n`;
        out += `-------------------------------------------------------------------------------\n`;
        out += `OK           F:        \\\\FILE01\\Finance          Microsoft Windows Network\n`;
        out += `The command completed successfully.\n`;
        return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
      } else {
        const driveLetter = args[1]?.includes(':') ? args[1] : undefined;
        const targetShare = driveLetter ? args[2] : args[1];
        if (targetShare && ctx.onNetworkShareConnect) {
          const res = ctx.onNetworkShareConnect(targetShare, driveLetter);
          if (!res.success) {
            return { command: rawCommand, exitCode: 1, output: `System error 5 has occurred.\nAccess is denied: ${res.error || ''}`, currentDirectory: ctx.currentDirectory };
          }
          return { command: rawCommand, exitCode: 0, output: `The command completed successfully.`, currentDirectory: ctx.currentDirectory };
        }
      }
    }

    // 12. KLIST
    if (cmd === 'klist') {
      const tickets = ctx.getKerberosTickets ? ctx.getKerberosTickets() : [];
      let out = `\nCached Tickets: (${tickets.length})\n\n`;
      let idx = 0;
      for (const t of tickets) {
        out += `#${idx}>     Client: ${t.clientPrincipal}\n`;
        out += `        Server: ${t.servicePrincipal}\n`;
        out += `        KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96\n`;
        out += `        Ticket Flags 0x40e10000 -> ${t.flags.join(' ')}\n`;
        out += `        End Time: Virtual Time ${t.expiresAtVirtualTime}s\n\n`;
        idx++;
      }
      if (tickets.length === 0) {
        out += `No cached tickets found in logon session.\n`;
      }
      return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
    }

    // 13. CLS
    if (cmd === 'cls') {
      return { command: rawCommand, exitCode: 0, output: '__CLEAR__', currentDirectory: ctx.currentDirectory };
    }

    // 14. SET (Environment variables)
    if (cmd === 'set') {
      let out = `COMPUTERNAME=${ctx.hostname.toUpperCase()}\n`;
      out += `USERDOMAIN=${ctx.domain.toUpperCase()}\n`;
      out += `USERNAME=${ctx.userName.toLowerCase()}\n`;
      out += `USERPROFILE=C:\\Users\\${ctx.userName.toLowerCase()}\n`;
      out += `HOMEDRIVE=C:\n`;
      out += `HOMEPATH=\\Users\\${ctx.userName.toLowerCase()}\n`;
      out += `OS=Windows_NT\n`;
      out += `SystemDrive=C:\n`;
      out += `SystemRoot=C:\\Windows\n`;
      out += `TEMP=C:\\Users\\${ctx.userName.toLowerCase()}\\AppData\\Local\\Temp\n`;
      return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
    }

    // 15. GPUPDATE
    if (cmd === 'gpupdate') {
      const normalizedArgs = args.map((a) => a.toLowerCase());
      const isForce = normalizedArgs.includes('/force');
      const targetArg = normalizedArgs.find((a) => a.startsWith('/target:'));
      const target: 'computer' | 'user' | 'both' =
        targetArg === '/target:computer'
          ? 'computer'
          : targetArg === '/target:user'
            ? 'user'
            : 'both';

      try {
        const regMachine = (globalThis as RealityGlobal).globalRealityEngine?.registry.getMachine(ctx.machineId);
        const gpoEng = getGroupPolicyEngine();
        if (regMachine && gpoEng) {
          const res = gpoEng.gpupdate(
            regMachine,
            ctx.userName,
            ctx.userSid,
            isForce,
            globalSimulationRuntime.clock.getVirtualTime(),
            target
          );
          return {
            command: rawCommand,
            exitCode: res.success ? 0 : 1,
            output: res.output,
            currentDirectory: ctx.currentDirectory,
          };
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown policy processing error';
        return {
          command: rawCommand,
          exitCode: 1,
          output: `Updating policy...\nFailed to process Group Policy. Error: ${message}`,
          currentDirectory: ctx.currentDirectory,
        };
      }
      return {
        command: rawCommand,
        exitCode: 1,
        output: `Updating policy...\nFailed to process Group Policy. Error: target machine '${ctx.machineId}' is unavailable.`,
        currentDirectory: ctx.currentDirectory,
      };
    }

    // 16. GPRESULT
    if (cmd === 'gpresult') {
      try {
        const regMachine = (globalThis as RealityGlobal).globalRealityEngine?.registry.getMachine(ctx.machineId);
        const gpoEng = getGroupPolicyEngine();
        if (regMachine && gpoEng) {
          const mCtx = gpoEng.getMachineContext(regMachine);
          const uCtx = gpoEng.getUserContext(ctx.userName, ctx.userSid);
          const cachedRsop = gpoEng.getCachedRsop(ctx.machineId);
          const cachedMatchesUser =
            cachedRsop?.targetUserSid === ctx.userSid ||
            cachedRsop?.targetUserName?.toLowerCase() === ctx.userName.toLowerCase();
          const rsop = cachedMatchesUser
            ? cachedRsop
            : gpoEng.processor.processPolicy(
                mCtx,
                uCtx,
                globalSimulationRuntime.clock.getVirtualTime()
              );

          let out = `\nRSOP Results for ${ctx.domain.toUpperCase()}\\${ctx.userName.toLowerCase()} on ${ctx.hostname.toUpperCase()}: Logging Mode\n`;
          out += `------------------------------------------------------------------------------------\n`;
          out += `Last policy refresh virtual time: ${cachedMatchesUser ? rsop.lastRefreshVirtualTime : 'N/A'}\n\n`;

          out += `COMPUTER SETTINGS\n`;
          out += `------------------\n`;
          out += `    DN: CN=${ctx.hostname.toUpperCase()},${mCtx.ouPath}\n`;
          out += `    Site Name: Default-First-Site-Name\n\n`;
          out += `    Applied Group Policy Objects\n`;
          out += `    ----------------------------\n`;
          for (const g of rsop.appliedComputerGpos) {
            out += `        ${g.gpoName}\n`;
          }
          if (rsop.appliedComputerGpos.length === 0) {
            out += `        N/A\n`;
          }

          out += `\n    The following GPOs were not applied because they were filtered out\n`;
          out += `    ------------------------------------------------------------------\n`;
          for (const g of rsop.deniedComputerGpos) {
            out += `        ${g.gpoName} (Reason: ${g.denialReason || 'Filtered'})\n`;
          }
          if (rsop.deniedComputerGpos.length === 0) {
            out += `        N/A\n`;
          }

          out += `\nUSER SETTINGS\n`;
          out += `--------------\n`;
          out += `    DN: CN=${ctx.userName.toLowerCase()},${uCtx.userOuPath}\n\n`;
          out += `    Applied Group Policy Objects\n`;
          out += `    ----------------------------\n`;
          for (const g of rsop.appliedUserGpos) {
            out += `        ${g.gpoName}\n`;
          }
          if (rsop.appliedUserGpos.length === 0) {
            out += `        N/A\n`;
          }

          out += `\n    The following GPOs were not applied because they were filtered out\n`;
          out += `    ------------------------------------------------------------------\n`;
          for (const g of rsop.deniedUserGpos) {
            out += `        ${g.gpoName} (Reason: ${g.denialReason || 'Filtered'})\n`;
          }
          if (rsop.deniedUserGpos.length === 0) {
            out += `        N/A\n`;
          }

          out += `\n    The user is a member of the following security groups\n`;
          out += `    ------------------------------------------------------\n`;
          for (const group of ctx.userGroups) {
            out += `        ${group.name} (${group.sid})\n`;
          }
          if (ctx.userGroups.length === 0) {
            out += `        N/A\n`;
          }

          return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown RSOP processing error';
        return {
          command: rawCommand,
          exitCode: 1,
          output: `ERROR: Unable to generate RSOP data. ${message}`,
          currentDirectory: ctx.currentDirectory,
        };
      }

      return {
        command: rawCommand,
        exitCode: 1,
        output: `ERROR: Unable to generate RSOP data because target machine '${ctx.machineId}' is unavailable.`,
        currentDirectory: ctx.currentDirectory,
      };
    }

    // 17. IPCONFIG, PING, NSLOOKUP, ARP, ROUTE (Network CLI Delegators)
    if (['ipconfig', 'ping', 'nslookup', 'arp', 'route'].includes(cmd)) {
      try {
        const netEng = getNetworkEngine();
        const out = netEng
          ? netEng.executeCommand(ctx.machineId, rawCommand, globalSimulationRuntime.clock.getVirtualTime())
          : 'Network subsystem initializing...';
        return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Network execution failure';
        return { command: rawCommand, exitCode: 1, output: msg, currentDirectory: ctx.currentDirectory };
      }
    }

    // 18. NET USER
    if (cmd === 'net' && args[0]?.toLowerCase() === 'user') {
      const ad = getActiveDirectoryEngine();
      const targetUser = args[1];
      if (!targetUser) {
        const users = ad ? ad.store.getAllUsers() : [];
        let out = `\nUser accounts for \\\\${ctx.hostname.toUpperCase()}\n\n`;
        out += `-------------------------------------------------------------------------------\n`;
        const rawNames = users.map((u: any) => u?.sAMAccountName || u?.name || u?.username).filter(Boolean);
        const names = rawNames.length > 0 ? rawNames : ['Administrator', 'DefaultAccount', 'Guest', ctx.userName.toLowerCase()];
        for (let i = 0; i < names.length; i += 3) {
          const row = names.slice(i, i + 3).map((n: string) => String(n || '').padEnd(25, ' ')).join('');
          out += `${row}\n`;
        }
        out += `The command completed successfully.\n`;
        return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
      } else {
        const allUsers = ad ? ad.store.getAllUsers() : [];
        const u = allUsers.find(
          (user: any) =>
            user.sAMAccountName?.toLowerCase() === targetUser.toLowerCase() ||
            user.name?.toLowerCase() === targetUser.toLowerCase() ||
            user.username?.toLowerCase() === targetUser.toLowerCase() ||
            user.sid?.toLowerCase() === targetUser.toLowerCase()
        ) || (typeof (ad?.store as any)?.findUser === 'function' ? (ad?.store as any).findUser(targetUser) : null);
        if (!u) {
          return {
            command: rawCommand,
            exitCode: 2,
            output: `The user name could not be found.\n\nMore help is available by typing NET HELPMSG 2221.`,
            currentDirectory: ctx.currentDirectory,
          };
        }
        const userGroups = ad ? ad.groupResolver.resolveUserGroupSids(u.sid) : [];
        const groupNames = userGroups.map((sid: string) => {
          const grp = ad?.store.findGroup(sid);
          return grp ? `*${grp.name}` : `*${sid}`;
        });

        const uName = u.sAMAccountName || u.name || u.username || targetUser;
        const uDisplayName = u.displayName || u.fullName || uName;
        let out = `User name                    ${uName}\n`;
        out += `Full Name                    ${uDisplayName}\n`;
        out += `Comment                      ${u.description || 'Enterprise Domain User'}\n`;
        out += `User's comment               \n`;
        out += `Country/region code          000 (System Default)\n`;
        out += `Account active               ${u.accountStatus === 'DISABLED' || u.enabled === false ? 'No' : 'Yes'}\n`;
        out += `Account expires              Never\n\n`;
        out += `Password last set            09/15/2026 08:30:00 AM\n`;
        out += `Password expires             Never\n`;
        out += `Password changeable          Yes\n`;
        out += `Password required            Yes\n`;
        out += `User may change password     Yes\n\n`;
        out += `Workstations allowed         All\n`;
        out += `Logon script                 \n`;
        out += `User profile                 C:\\Users\\${uName.toLowerCase()}\n`;
        out += `Home directory               \n`;
        out += `Last logon                   09/28/2026 08:00:00 AM\n\n`;
        out += `Logon hours allowed          All\n\n`;
        out += `Local Group Memberships      *Users\n`;
        out += `Global Group memberships     ${groupNames.join('  ') || '*Domain Users'}\n`;
        out += `The command completed successfully.\n`;
        return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
      }
    }

    // 19. NET SHARE
    if (cmd === 'net' && args[0]?.toLowerCase() === 'share') {
      let out = `\nShare name   Resource                        Remark\n\n`;
      out += `-------------------------------------------------------------------------------\n`;
      out += `C$           C:\\                             Default share\n`;
      out += `ADMIN$       C:\\Windows                      Remote Admin\n`;
      out += `IPC$                                         Remote IPC\n`;
      if (ctx.machineId === 'FILE01') {
        out += `Finance      D:\\Shares\\Finance               Department Financial Records\n`;
        out += `HR           D:\\Shares\\HR                    Human Resources & Payroll\n`;
        out += `IT           D:\\Shares\\IT                    IT Infrastructure & Scripts\n`;
      }
      out += `The command completed successfully.\n`;
      return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
    }

    // 20. NET START / NET STOP
    if (cmd === 'net' && (args[0]?.toLowerCase() === 'start' || args[0]?.toLowerCase() === 'stop')) {
      const action = args[0].toLowerCase();
      const svcName = args.slice(1).join(' ');
      if (!svcName) {
        if (action === 'start') {
          const running = ctx.serviceManager.getAllServices().filter((s) => s.status === 'RUNNING');
          let out = `These Windows services are started:\n\n`;
          for (const s of running) {
            out += `   ${s.displayName || s.name}\n`;
          }
          out += `\nThe command completed successfully.\n`;
          return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
        }
        return {
          command: rawCommand,
          exitCode: 1,
          output: `The syntax of this command is:\n\nNET STOP service`,
          currentDirectory: ctx.currentDirectory,
        };
      }
      if (action === 'start') {
        const res = ctx.serviceManager.startService(svcName);
        if (!res.success) {
          return {
            command: rawCommand,
            exitCode: 1,
            output: `The service could not be started: ${res.error}`,
            currentDirectory: ctx.currentDirectory,
          };
        }
        return {
          command: rawCommand,
          exitCode: 0,
          output: `The ${svcName} service was started successfully.`,
          currentDirectory: ctx.currentDirectory,
        };
      } else {
        const res = ctx.serviceManager.stopService(svcName);
        if (!res.success) {
          return {
            command: rawCommand,
            exitCode: 1,
            output: `The service could not be stopped: ${res.error}`,
            currentDirectory: ctx.currentDirectory,
          };
        }
        return {
          command: rawCommand,
          exitCode: 0,
          output: `The ${svcName} service was stopped successfully.`,
          currentDirectory: ctx.currentDirectory,
        };
      }
    }

    // 21. NETSTAT
    if (cmd === 'netstat') {
      const netEng = getNetworkEngine();
      const iface = netEng?.getInterface(ctx.machineId);
      const ip = iface?.ipAddress || '127.0.0.1';
      let out = `\nActive Connections\n\n`;
      out += `  Proto  Local Address          Foreign Address        State           PID\n`;
      if (ctx.machineId === 'DC01') {
        out += `  TCP    0.0.0.0:53             0.0.0.0:0              LISTENING       1120\n`;
        out += `  TCP    0.0.0.0:88             0.0.0.0:0              LISTENING       1088\n`;
        out += `  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       924\n`;
        out += `  TCP    0.0.0.0:389            0.0.0.0:0              LISTENING       1040\n`;
        out += `  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4\n`;
      } else if (ctx.machineId === 'FILE01') {
        const isSmbRunning = ctx.serviceManager.getService('LanmanServer')?.status === 'RUNNING';
        out += `  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       892\n`;
        if (isSmbRunning) {
          out += `  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4\n`;
        }
      } else {
        out += `  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       840\n`;
        out += `  TCP    ${ip}:49668       10.10.10.10:88         ESTABLISHED     648\n`;
      }
      const activeConns = netEng
        ? netEng.connections.getConnections().filter((c: any) => c.sourceDevice === ctx.machineId || c.destinationDevice === ctx.machineId)
        : [];
      for (const c of activeConns) {
        out += `  TCP    ${c.sourceIp}:${c.sourcePort}        ${c.destinationIp}:${c.destinationPort}        ${c.state.padEnd(15, ' ')} 4\n`;
      }
      return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
    }

    // 22. SYSTEMINFO
    if (cmd === 'systeminfo') {
      const netEng = getNetworkEngine();
      const iface = netEng?.getInterface(ctx.machineId);
      let out = `\nHost Name:                 ${ctx.hostname.toUpperCase()}\n`;
      out += `OS Name:                   Microsoft Windows 10 Enterprise\n`;
      out += `OS Version:                10.0.19045 N/A Build 19045\n`;
      out += `OS Manufacturer:           Microsoft Corporation\n`;
      out += `OS Configuration:          Member Workstation\n`;
      out += `OS Build Type:             Multiprocessor Free\n`;
      out += `Registered Owner:          ${ctx.userName}\n`;
      out += `Registered Organization:   NEXORA Defense & Security\n`;
      out += `Product ID:                00329-00000-00003-AA684\n`;
      out += `System Boot Time:          09/28/2026, 08:00:00 AM\n`;
      out += `System Manufacturer:       Dell Inc.\n`;
      out += `System Model:              OptiPlex 7090\n`;
      out += `System Type:               x64-based PC\n`;
      out += `Processor(s):              1 Processor(s) Installed.\n`;
      out += `                           [01]: Intel64 Family 6 Model 167 ~3.60GHz\n`;
      out += `Domain:                    ${ctx.domain.toLowerCase()}\n`;
      out += `Logon Server:              \\\\DC01\n`;
      out += `Network Card(s):           1 NIC(s) Installed.\n`;
      out += `                           [01]: ${iface?.name || 'Ethernet0'}\n`;
      out += `                                 Connection Name: Ethernet0\n`;
      out += `                                 DHCP Enabled:    No\n`;
      out += `                                 IP address(es)\n`;
      out += `                                 [01]: ${iface?.ipAddress || '10.10.30.15'}\n`;
      return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
    }

    // 23. HELP / ?
    if (cmd === 'help' || cmd === '?') {
      let out = `For more information on a specific command, type HELP command-name\n\n`;
      out += `ARP            Displays and modifies the IP-to-Physical address translation tables.\n`;
      out += `CD / CHDIR     Displays the name of or changes the current directory.\n`;
      out += `CLS            Clears the screen.\n`;
      out += `DEL / ERASE    Deletes one or more files.\n`;
      out += `DIR            Displays a list of files and subdirectories in a directory.\n`;
      out += `ECHO           Displays messages, or turns command-echoing on or off.\n`;
      out += `GPRESULT       Displays Resultant Set of Policy (RSoP) information for target.\n`;
      out += `GPUPDATE       Updates Group Policy settings.\n`;
      out += `HOSTNAME       Prints the name of the current host.\n`;
      out += `IPCONFIG       Displays all current TCP/IP network configuration values.\n`;
      out += `KLIST          Displays currently cached Kerberos tickets.\n`;
      out += `MKDIR / MD     Creates a directory.\n`;
      out += `NET            Used to manage network resources, users, shares, and services.\n`;
      out += `NETSTAT        Displays protocol statistics and current TCP/IP network connections.\n`;
      out += `NSLOOKUP       Queries Domain Name System (DNS) servers.\n`;
      out += `PING           Verifies IP-level connectivity to another TCP/IP computer.\n`;
      out += `ROUTE          Manipulates network routing tables.\n`;
      out += `SC             Communicates with the Service Controller and installed services.\n`;
      out += `SET            Displays, sets, or removes Windows environment variables.\n`;
      out += `SYSTEMINFO     Displays machine-specific properties and configuration.\n`;
      out += `TASKLIST       Displays all currently running tasks including services.\n`;
      out += `TYPE           Displays the contents of a text file.\n`;
      out += `WHOAMI         Displays user, group and privileges information for current user.\n`;
      return { command: rawCommand, exitCode: 0, output: out, currentDirectory: ctx.currentDirectory };
    }

    return {
      command: rawCommand,
      exitCode: 9009,
      output: `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`,
      currentDirectory: ctx.currentDirectory,
    };
  }
}
