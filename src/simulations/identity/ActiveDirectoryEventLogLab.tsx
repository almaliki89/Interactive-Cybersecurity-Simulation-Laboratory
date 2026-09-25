import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  ActiveDirectoryEvent,
  INITIAL_AD_EVENTS,
  filterAdEvents,
  AdEventFilterOptions,
} from './logic/eventlog';
import { projectRuntimeEventsToAdRecords } from './runtime/adEventBridge';
import {
  Server,
  Filter,
  Search,
  ArrowRight,
  ArrowLeft,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Key,
  Users,
  FileCode,
  Terminal,
} from 'lucide-react';

interface ActiveDirectoryEventLogLabProps {
  onBackToMap?: () => void;
}

export const ActiveDirectoryEventLogLab: React.FC<ActiveDirectoryEventLogLabProps> = ({
  onBackToMap,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const runtimeEvents = useSimulationStore((s) => s.events);

  // Authoritatively derive AD events from shared SimulationRuntime events!
  const projectedEvents = projectRuntimeEventsToAdRecords(runtimeEvents);
  const allEvents = [...INITIAL_AD_EVENTS, ...projectedEvents].sort(
    (a, b) => b.virtualTime - a.virtualTime || b.id.localeCompare(a.id)
  );

  const [selectedEventIdFilter, setSelectedEventIdFilter] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<ActiveDirectoryEvent | null>(allEvents[0] || null);

  const filterOpts: AdEventFilterOptions = {
    eventId: selectedEventIdFilter !== 'ALL' ? Number(selectedEventIdFilter) : undefined,
    channel: selectedChannel,
    severity: selectedSeverity,
    searchQuery,
  };

  const filtered = filterAdEvents(allEvents, filterOpts);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <BackArrow className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Server className="w-6 h-6 text-blue-400" />
              <span>{isAr ? 'سجل أحداث Active Directory ومراقبة الأمان' : 'Active Directory Security Event Viewer'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تحليل سجلات تدقيق الأمان 4768 (طلب TGT) و 4769 (طلب الخدمة) و 4728 (إضافة مجموعة) و 5136 (تعديل الدليل)'
                : 'Enterprise forensic telemetry: audit Kerberos ticket requests (4768/4769), privilege modifications, and directory changes'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-blue-400">
            Total Records: {allEvents.length}
          </span>
        </div>
      </div>

      {/* Filter Deck */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Event ID Filter */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Event ID:</label>
            <select
              value={selectedEventIdFilter}
              onChange={(e) => setSelectedEventIdFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Event IDs</option>
              <option value="4720">4720 - User Created</option>
              <option value="4722">4722 - User Enabled</option>
              <option value="4725">4725 - User Disabled</option>
              <option value="4728">4728 - Security Group Added</option>
              <option value="4729">4729 - Security Group Removed</option>
              <option value="4768">4768 - Kerberos TGT Requested</option>
              <option value="4769">4769 - Kerberos TGS Requested</option>
              <option value="4771">4771 - Pre-Auth Failed</option>
              <option value="5136">5136 - Directory Object Modified</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Log Channel:</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Channels</option>
              <option value="Security">Security</option>
              <option value="Directory Service">Directory Service</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Information">Information</option>
              <option value="Warning">Warning</option>
              <option value="Error">Error</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Search Message / User:</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, SPN, computer..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pr-8 text-white focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Events Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table View (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span>Filtered: {filtered.length} Events</span>
            <span>Sorted: Virtual Time (Newest First)</span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {isAr ? 'لم يتم العثور على أي أحداث مطابقة' : 'No security events matched the filter criteria.'}
              </div>
            ) : (
              filtered.map((evt) => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                            evt.severity === 'Warning'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : evt.severity === 'Error'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-slate-900 text-cyan-300 border border-slate-800'
                          }`}
                        >
                          {evt.eventId}
                        </span>
                        <span className="font-bold text-white truncate max-w-[200px]">
                          {isAr ? evt.actionAr : evt.actionEn}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">T+{evt.virtualTime}s</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>User: {evt.subjectUser}</span>
                      <span>{evt.channel}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Event Details Inspector</span>
            </span>
            {selectedEvent && (
              <span className="text-[10px] text-cyan-400 font-bold">{selectedEvent.id}</span>
            )}
          </div>

          {selectedEvent ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">Event ID & Action</span>
                <span className="text-white font-bold block text-sm">
                  {selectedEvent.eventId} — {isAr ? selectedEvent.actionAr : selectedEvent.actionEn}
                </span>
                <span className="text-[11px] text-cyan-400 block">{selectedEvent.category}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">Description & Forensic Context</span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {isAr ? selectedEvent.detailsAr : selectedEvent.detailsEn}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Channel:</span>
                  <span className="text-white font-bold">{selectedEvent.channel}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Computer:</span>
                  <span className="text-white font-bold">{selectedEvent.computer}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Subject User:</span>
                  <span className="text-cyan-300 font-bold">{selectedEvent.subjectUser}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Virtual Time:</span>
                  <span className="text-white font-bold">T+{selectedEvent.virtualTime}s</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              {isAr ? 'اختر حدثاً لعرض التفاصيل' : 'Select an event to inspect forensic details.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
