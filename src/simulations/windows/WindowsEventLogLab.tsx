import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  WindowsEvent,
  WindowsEventChannel,
  WindowsEventSeverity,
  INITIAL_WINDOWS_EVENTS,
  filterWindowsEvents,
  createWindowsEvent,
} from './logic/eventlog';
import {
  Terminal,
  Filter,
  Search,
  ArrowLeft,
  ArrowRight,
  Shield,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface WindowsEventLogLabProps {
  onBackToMap?: () => void;
}

export const WindowsEventLogLab: React.FC<WindowsEventLogLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);

  const [events, setEvents] = useState<WindowsEvent[]>(INITIAL_WINDOWS_EVENTS);
  const [selectedChannel, setSelectedChannel] = useState<WindowsEventChannel | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<WindowsEventSeverity | 'ALL'>('ALL');
  const [selectedEventId, setSelectedEventId] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<WindowsEvent | null>(INITIAL_WINDOWS_EVENTS[0]);

  // Deterministic virtual time formatting
  const formatVirtualTimestamp = (ms: number): string => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(3);
    return `T+${minutes.toString().padStart(2, '0')}:${seconds.padStart(6, '0')}`;
  };

  const filteredEvents = filterWindowsEvents(events, {
    channel: selectedChannel,
    severity: selectedSeverity,
    eventId: selectedEventId,
    query: searchQuery,
  });

  const handleSimulateBruteForce = () => {
    const nextVirtual = virtualTime + 1500;
    const updated = createWindowsEvent(events, {
      channel: 'Security',
      eventId: 4625,
      taskCategory: 'Logon',
      severity: 'Warning',
      virtualTimestamp: nextVirtual,
      computer: 'WIN-SRV-2025.corp.local',
      provider: 'Microsoft-Windows-Security-Auditing',
      subjectUser: 'ANONYMOUS LOGON',
      targetUser: 'Administrator',
      details: {
        LogonType: 3,
        FailureReason: '%%2313 (Unknown user name or bad password)',
        WorkstationName: 'ATTACKER-BOX',
        SourceNetworkAddress: '192.168.1.105',
      },
      descriptionEn: 'An account failed to log on: Injected Brute-Force probe event.',
      descriptionAr: 'فشل تسجيل الدخول: رصد محاولة تخمين مريبة محقونة في السجل.',
    });

    setEvents(updated);
    addLog({
      level: 'WARN',
      source: 'SECURITY_AUDIT',
      category: 'SECURITY',
      message: 'Event 4625 generated: Failed Logon attempt against Administrator from 192.168.1.105',
      timestamp: nextVirtual,
    });
  };

  const getSeverityBadge = (sev: WindowsEventSeverity) => {
    switch (sev) {
      case 'Critical':
      case 'Error':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'Warning':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-blue-950 text-blue-300 border-blue-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 select-none space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isAr ? 'العودة للخارطة' : 'Back to Map'}
            >
              <BackArrow className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-orange-400" />
              <span>{isAr ? 'مختبر سجل أحداث ويندوز (Windows Event Viewer Lab)' : 'Windows Event Viewer Lab'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'فحص سجلات الأمان (Security) ومعرفات الأحداث 4624 و 4625 و 4672 و 4688 و 7045'
                : 'Analyze Windows Security Event IDs: 4624, 4625, 4672, 4688, 4720, and 7045.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateBruteForce}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold font-mono transition-colors shadow-md"
        >
          <Activity className="w-4 h-4" />
          <span>{isAr ? 'حقن حدث محاولة اختراق 4625' : 'Inject Event 4625 (Brute Force)'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Channel selector */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Channels</option>
            <option value="Security">Security Log</option>
            <option value="System">System Log</option>
            <option value="Application">Application Log</option>
          </select>

          {/* Event ID filter */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Event IDs</option>
            <option value="4624">Event 4624 (Logon Success)</option>
            <option value="4625">Event 4625 (Logon Failure)</option>
            <option value="4672">Event 4672 (Admin Privileges)</option>
            <option value="4688">Event 4688 (Process Creation)</option>
            <option value="4720">Event 4720 (User Created)</option>
            <option value="7045">Event 7045 (Service Installed)</option>
          </select>

          {/* Severity selector */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Severities</option>
            <option value="Information">Information</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
          </select>
        </div>

        {/* Search Query Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في السجلات والمعرفات...' : 'Search Event Logs...'}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Main Grid: Events List + Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Events Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {isAr ? 'الأحداث المسجلة (Recorded Events)' : 'Recorded Windows Events'}
              </span>
              <span className="text-[11px] font-mono text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-800/40">
                {filteredEvents.length} events
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredEvents.map((evt) => {
                const isSelected = selectedEvent && selectedEvent.id === evt.id;

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                      isSelected
                        ? 'bg-orange-950/40 border-orange-500 shadow-md shadow-orange-950/30'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">Event {evt.eventId}</span>
                        <span className="text-[10px] font-mono text-slate-400">({evt.taskCategory})</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${getSeverityBadge(evt.severity)}`}>
                          {evt.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 truncate mt-1">
                        {isAr ? evt.descriptionAr : evt.descriptionEn}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                        User: {evt.subjectUser}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-mono text-cyan-400">
                        {formatVirtualTimestamp(evt.virtualTimestamp)}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 mt-1">{evt.channel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Event Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedEvent ? (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div>
                <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest block">
                  {isAr ? 'تفاصيل سجل الحدث' : 'Event Properties & XML Telemetry'}
                </span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">
                  Event ID {selectedEvent.eventId} - {selectedEvent.taskCategory}
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{selectedEvent.provider}</div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">Description:</span>
                  <p className="text-slate-200 leading-relaxed">
                    {isAr ? selectedEvent.descriptionAr : selectedEvent.descriptionEn}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Virtual Time:</span>
                    <span className="text-cyan-400">{formatVirtualTimestamp(selectedEvent.virtualTimestamp)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Record ID:</span>
                    <span className="text-slate-300">#{selectedEvent.eventRecordId}</span>
                  </div>
                </div>

                {/* Event Data Attributes */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Event Data Payload:
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {Object.entries(selectedEvent.details).map(([key, val]) => (
                      <div key={key} className="flex items-start justify-between gap-2 border-b border-slate-900 pb-1">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-amber-300 text-right select-all break-all">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
