/**
 * OMEGA ULTRA REALITY V1.4 — Windows Command Prompt UI (cmd.exe)
 * High-fidelity Windows Command Prompt terminal emulator executing against simulation state.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { WindowsDesktopEngine } from '../../../engine/reality/windows/WindowsDesktopEngine';
import { ShellContext } from '../../../engine/reality/windows/WindowsShellEngine';
import { globalActiveDirectoryEngine } from '../../../engine/reality/identity/ActiveDirectoryEngine';

interface CommandPromptProps {
  desktop: WindowsDesktopEngine;
}

export const CommandPrompt: React.FC<CommandPromptProps> = ({ desktop }) => {
  const activeSession = desktop.getActiveSession();
  const defaultDir = activeSession.userName
    ? `C:\\Users\\${activeSession.userName.toLowerCase()}`
    : 'C:\\Windows\\System32';

  const [currentDirectory, setCurrentDirectory] = useState<string>(defaultDir);
  const [history, setHistory] = useState<Array<{ command: string; output: string }>>([
    {
      command: '',
      output: 'Microsoft Windows [Version 10.0.26100.1]\n(c) Microsoft Corporation. All rights reserved.\n',
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState<number>(-1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = inputVal;
      setInputVal('');
      if (!cmd.trim()) {
        setHistory((prev) => [...prev, { command: '', output: '' }]);
        return;
      }

      setCmdHistory((prev) => [...prev, cmd]);
      setCmdHistoryIdx(-1);

      // Build context
      const userSid = activeSession.userSid || "S-1-5-21-99887766-2001";
      const user = globalActiveDirectoryEngine.store.findUser(userSid);
      const groups = (user?.groups || []).map((gSid: string) => {
        const g = globalActiveDirectoryEngine.store.findGroup(gSid);
        return {
          name: g?.name || gSid,
          sid: gSid,
          type: "Group",
        };
      });

      const ctx: ShellContext = {
        machineId: desktop.machineId,
        hostname: desktop.hostname,
        domain: desktop.domain,
        userName: activeSession.userName || 'sara.finance',
        userSid,
        userGroups: groups,
        currentDirectory,
        fileSystem: desktop.fileSystem,
        processManager: desktop.processes,
        serviceManager: desktop.services,
        getKerberosTickets: () => {
          const cache = globalActiveDirectoryEngine.getTicketCache(desktop.machineId);
          return cache.listTickets().map((t) => ({
            ticketType: t.ticketType,
            clientPrincipal: t.clientPrincipal,
            servicePrincipal: t.servicePrincipal,
            expiresAtVirtualTime: t.expiresAtVirtualTime,
            flags: t.flags,
          }));
        },
      };

      const result = desktop.shell.execute(cmd, ctx);

      if (result.output === '__CLEAR__') {
        setHistory([]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            command: `${currentDirectory}> ${cmd}`,
            output: result.output,
          },
        ]);
      }

      if (result.currentDirectory) {
        setCurrentDirectory(result.currentDirectory);
      }
    } else if (e.key === 'ArrowUp') {
      if (cmdHistory.length > 0) {
        const nextIdx = cmdHistoryIdx === -1 ? cmdHistory.length - 1 : Math.max(0, cmdHistoryIdx - 1);
        setCmdHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (cmdHistoryIdx !== -1) {
        const nextIdx = cmdHistoryIdx + 1;
        if (nextIdx >= cmdHistory.length) {
          setCmdHistoryIdx(-1);
          setInputVal('');
        } else {
          setCmdHistoryIdx(nextIdx);
          setInputVal(cmdHistory[nextIdx]);
        }
      }
    }
  };

  return (
    <div
      data-testid="command-prompt"
      onClick={() => inputRef.current?.focus()}
      className="flex flex-col h-full bg-black text-slate-100 font-mono text-xs p-3 select-text overflow-y-auto cursor-text"
    >
      <div className="space-y-1">
        {history.map((h, i) => (
          <div key={i}>
            {h.command && <div className="text-slate-300 font-medium">{h.command}</div>}
            {h.output && <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">{h.output}</div>}
          </div>
        ))}
      </div>

      {/* Active input line */}
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-slate-300 shrink-0">{currentDirectory}&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-slate-100 outline-none border-none p-0 font-mono text-xs"
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
