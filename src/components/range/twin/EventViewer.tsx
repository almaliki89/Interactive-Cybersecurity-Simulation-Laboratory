/**
 * OMEGA ULTRA REALITY V1.5 — Windows Event Viewer (eventvwr.msc)
 * High-fidelity Windows Event Viewer showing authentic Windows Security (Audit),
 * System, and Application logs directly synchronized with reality state.
 */

import React, { useState } from 'react';
import {
  FileText,
  Shield,
  AlertTriangle,
  Info,
  XCircle,
  FolderTree,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { WindowsMachine } from '../../../engine/reality/windows/WindowsMachine';

interface EventViewerProps {
  machine: WindowsMachine;
}

export const EventViewer: React.FC<EventViewerProps> = ({ machine }) => {
  const [selectedChannel, setSelectedChannel] = useState<'Security' | 'System' | 'Application'>('Security');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isTreeExpanded, setIsTreeExpanded] = useState<boolean>(true);

  // Retrieve raw logs from machine
  const allLogs = machine.getEventLogs();

  // Synthetic baseline enterprise events if raw logs are few
  const defaultAuditLogs = [
    {
      id: `evt-sec-4624-${machine.id}`,
      channel: 'Security' as const,
      eventId: 4624,
      virtualTime: 120,
      provider: 'Microsoft-Windows-Security-Auditing',
      level: 'Information' as const,
      task: 'Logon',
      computer: `${machine.hostname}.${machine.domain}`,
      user: machine.id.includes('FIN') ? 'NEXORA\\sara.finance' : machine.id.includes('HR') ? 'NEXORA\\omar.hr' : 'NEXORA\\ali.it',
      data: {
        message: 'An account was successfully logged on.',
        logonType: '2 (Interactive)',
        authPackage: 'Kerberos',
        workstation: machine.hostname,
        sourceNetworkAddress: machine.ipAddress,
      },
    },
    {
      id: `evt-sec-4672-${machine.id}`,
      channel: 'Security' as const,
      eventId: 4672,
      virtualTime: 120,
      provider: 'Microsoft-Windows-Security-Auditing',
      level: 'Information' as const,
      task: 'Special Logon',
      computer: `${machine.hostname}.${machine.domain}`,
      user: 'NEXORA\\Administrator',
      data: {
        message: 'Special privileges assigned to new logon.',
        privileges: 'SeSecurityPrivilege, SeBackupPrivilege, SeRestorePrivilege, SeTakeOwnershipPrivilege',
      },
    },
    {
      id: `evt-sys-7036-${machine.id}`,
      channel: 'System' as const,
      eventId: 7036,
      virtualTime: 80,
      provider: 'Service Control Manager',
      level: 'Information' as const,
      task: 'Service State Change',
      computer: `${machine.hostname}.${machine.domain}`,
      user: 'NT AUTHORITY\\SYSTEM',
      data: {
        message: 'The LanmanWorkstation service entered the running state.',
      },
    },
    {
      id: `evt-sys-10000-${machine.id}`,
      channel: 'System' as const,
      eventId: 10000,
      virtualTime: 95,
      provider: 'e1dexpress (Intel Gigabit)',
      level: 'Information' as const,
      task: 'Network Link',
      computer: `${machine.hostname}.${machine.domain}`,
      user: 'NT AUTHORITY\\SYSTEM',
      data: {
        message: 'Intel(R) Gigabit Network Connection: Network link is up at 1000Mbps Full Duplex.',
      },
    },
    {
      id: `evt-app-1001-${machine.id}`,
      channel: 'Application' as const,
      eventId: 1001,
      virtualTime: 110,
      provider: 'GroupPolicy',
      level: 'Information' as const,
      task: 'Policy Application',
      computer: `${machine.hostname}.${machine.domain}`,
      user: 'NT AUTHORITY\\SYSTEM',
      data: {
        message: 'Group Policy processing completed successfully. Applied GPOs: Default Domain Policy, Workstation Baseline.',
      },
    },
  ];

  // Merge real and baseline logs
  const combinedLogs = [...allLogs, ...defaultAuditLogs.filter((d) => !allLogs.some((l) => l.eventId === d.eventId && l.channel === d.channel))];

  // Filter logs for selected channel
  const channelLogs = combinedLogs.filter((l) => l.channel === selectedChannel);
  const filteredLogs = channelLogs.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.eventId.toString().includes(term) ||
      l.provider.toLowerCase().includes(term) ||
      (l.task && l.task.toLowerCase().includes(term)) ||
      (l.data?.message && l.data.message.toLowerCase().includes(term))
    );
  });

  const selectedEvent = filteredLogs.find((l) => l.id === selectedEventId) || filteredLogs[0];

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'audit failure':
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div data-testid="event-viewer" className="flex flex-col h-full bg-slate-900 text-slate-200 font-sans select-none text-xs">
      {/* Top Menu / Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">Event Viewer (Local) — {machine.hostname}</span>
        </div>

        {/* Filter input */}
        <div className="flex items-center bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300 w-48">
          <Search className="w-3 h-3 text-slate-500 mr-1.5 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter Event ID, text..."
            className="w-full bg-transparent outline-none text-[11px]"
          />
        </div>
      </div>

      {/* Main Split: Navigation Tree & Event View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tree Pane */}
        <div className="w-56 bg-slate-950 border-r border-slate-800 p-2 space-y-1 overflow-y-auto shrink-0 font-mono text-[11px]">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Console Root</div>

          <div className="space-y-0.5">
            <button
              onClick={() => setIsTreeExpanded(!isTreeExpanded)}
              className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800/80 text-left text-slate-300 font-semibold"
            >
              {isTreeExpanded ? <ChevronDown className="w-3 h-3 text-cyan-400" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              <FolderTree className="w-3.5 h-3.5 text-amber-400" />
              <span>Windows Logs</span>
            </button>

            {isTreeExpanded && (
              <div className="pl-5 space-y-0.5">
                {(['Security', 'System', 'Application'] as const).map((channel) => (
                  <button
                    key={channel}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setSelectedEventId(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                      selectedChannel === channel
                        ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {channel === 'Security' ? (
                        <Shield className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <FileText className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{channel}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">
                      {combinedLogs.filter((l) => l.channel === channel).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Logs Table & General Details */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {/* Events Table */}
          <div className="flex-1 overflow-y-auto border-b border-slate-800">
            <table className="w-full text-left text-[11px] border-collapse font-mono">
              <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="py-1.5 px-2.5 w-16">Level</th>
                  <th className="py-1.5 px-2.5 w-24">Event ID</th>
                  <th className="py-1.5 px-2.5 w-44">Source</th>
                  <th className="py-1.5 px-2.5 w-32">Task Category</th>
                  <th className="py-1.5 px-2.5">Summary Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => {
                  const isSelected = selectedEvent?.id === log.id;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedEventId(log.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/60 text-cyan-200'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <td className="py-1 px-2.5">
                        <div className="flex items-center gap-1.5">
                          {getLevelIcon(log.level)}
                          <span className="text-[10px]">{log.level}</span>
                        </div>
                      </td>
                      <td className="py-1 px-2.5 font-bold text-white">{log.eventId}</td>
                      <td className="py-1 px-2.5 truncate max-w-[170px]" title={log.provider}>
                        {log.provider}
                      </td>
                      <td className="py-1 px-2.5 text-slate-400 truncate">{log.task || 'None'}</td>
                      <td className="py-1 px-2.5 truncate text-slate-300 max-w-[280px]">
                        {log.data?.message || 'Event emitted by system subsystem.'}
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                      No event logs found matching current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Details Box */}
          <div className="h-44 bg-slate-950 p-3 overflow-y-auto border-t border-slate-800 font-sans text-xs">
            {selectedEvent ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Event {selectedEvent.eventId}, {selectedEvent.provider}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {selectedEvent.channel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Computer: {selectedEvent.computer}
                  </div>
                </div>

                <div className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800 whitespace-pre-wrap">
                  {selectedEvent.data?.message || 'The operating system recorded this diagnostic telemetry event.'}
                </div>

                {/* Additional Event Properties */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
                  <div>User: <strong className="text-slate-200">{selectedEvent.user || 'SYSTEM'}</strong></div>
                  <div>Virtual Time: <strong className="text-cyan-400">T+{selectedEvent.virtualTime}s</strong></div>
                  <div>Task: <strong className="text-slate-200">{selectedEvent.task || 'General'}</strong></div>
                  <div>Level: <strong className="text-slate-200">{selectedEvent.level}</strong></div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-6 font-mono text-xs">
                Select an event from the list above to view details and telemetry properties.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
