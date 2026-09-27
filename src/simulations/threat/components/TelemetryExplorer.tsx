import React, { useMemo } from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { Search, Filter, RotateCcw, AlertTriangle, Info, ShieldAlert, Zap } from 'lucide-react';
import { SecurityTelemetryEvent, TelemetrySourceWorld } from '../../soc/logic/telemetry';

interface TelemetryExplorerProps {
  language: 'ar' | 'en';
}

export const TelemetryExplorer: React.FC<TelemetryExplorerProps> = ({ language }) => {
  const telemetryEvents = useThreatHuntingStore((s) => s.telemetryEvents);
  const selectedEventId = useThreatHuntingStore((s) => s.selectedEventId);
  const selectEvent = useThreatHuntingStore((s) => s.selectEvent);

  const searchQuery = useThreatHuntingStore((s) => s.searchQuery);
  const worldFilter = useThreatHuntingStore((s) => s.worldFilter);
  const severityFilter = useThreatHuntingStore((s) => s.severityFilter);
  const userFilter = useThreatHuntingStore((s) => s.userFilter);
  const hostFilter = useThreatHuntingStore((s) => s.hostFilter);

  const setSearchQuery = useThreatHuntingStore((s) => s.setSearchQuery);
  const setWorldFilter = useThreatHuntingStore((s) => s.setWorldFilter);
  const setSeverityFilter = useThreatHuntingStore((s) => s.setSeverityFilter);
  const setUserFilter = useThreatHuntingStore((s) => s.setUserFilter);
  const setHostFilter = useThreatHuntingStore((s) => s.setHostFilter);
  const resetFilters = useThreatHuntingStore((s) => s.resetFilters);

  const isAr = language === 'ar';

  // Dynamic filter options
  const worlds = useMemo(() => {
    return Array.from(new Set(telemetryEvents.map((e) => e.sourceWorld)));
  }, [telemetryEvents]);

  const users = useMemo(() => {
    return Array.from(new Set(telemetryEvents.map((e) => e.user).filter(Boolean))) as string[];
  }, [telemetryEvents]);

  const hosts = useMemo(() => {
    return Array.from(new Set(telemetryEvents.map((e) => e.host).filter(Boolean))) as string[];
  }, [telemetryEvents]);

  // Filtered dataset
  const filteredEvents = useMemo(() => {
    return telemetryEvents.filter((event) => {
      if (worldFilter !== 'ALL' && event.sourceWorld !== worldFilter) return false;
      if (severityFilter !== 'ALL' && event.severity !== severityFilter) return false;
      if (userFilter !== 'ALL' && event.user !== userFilter) return false;
      if (hostFilter !== 'ALL' && event.host !== hostFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesType = event.eventType.toLowerCase().includes(query);
        const matchesUser = event.user?.toLowerCase().includes(query);
        const matchesHost = event.host?.toLowerCase().includes(query);
        const matchesIp = event.sourceIp?.toLowerCase().includes(query);
        const matchesProc = event.process?.toLowerCase().includes(query);
        const matchesRes = event.resource?.toLowerCase().includes(query);
        const matchesDesc = String(event.attributes?.description || '').toLowerCase().includes(query);

        if (!matchesType && !matchesUser && !matchesHost && !matchesIp && !matchesProc && !matchesRes && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [telemetryEvents, worldFilter, severityFilter, userFilter, hostFilter, searchQuery]);

  const renderSeverityIcon = (severity: SecurityTelemetryEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'threat':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'warn':
        return <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 select-none">
      {/* Search & Filter Toolbar */}
      <div className="p-3 border-b border-slate-900 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في الأحداث، العمليات، والمستخدمين...' : 'Search events, processes, users...'}
              data-testid="telemetry-search-input"
              className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* World Filter */}
          <select
            value={worldFilter}
            onChange={(e) => setWorldFilter(e.target.value)}
            data-testid="filter-world-select"
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">{isAr ? 'كافة العوالم' : 'All Worlds'}</option>
            {worlds.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            data-testid="filter-severity-select"
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">{isAr ? 'كافة المستويات' : 'All Severities'}</option>
            <option value="info">INFO</option>
            <option value="warn">WARN</option>
            <option value="threat">THREAT</option>
            <option value="critical">CRITICAL</option>
          </select>

          {/* User Filter */}
          {users.length > 0 && (
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">{isAr ? 'كافة المستخدمين' : 'All Users'}</option>
              {users.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {(worldFilter !== 'ALL' || severityFilter !== 'ALL' || userFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={resetFilters}
              data-testid="btn-reset-filters"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isAr ? 'إعادة تعيين المرشحات' : 'Reset filters'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Counter bar */}
      <div className="px-4 py-2 border-b border-slate-900 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span>{isAr ? 'إجمالي السجلات المعروضة:' : 'Showing events:'}</span>
          <span className="font-mono text-cyan-400 font-bold tabular-nums" dir="ltr">
            {filteredEvents.length} / {telemetryEvents.length}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 hidden sm:inline">
          {isAr ? 'انقر على أي حدث للمعاينة والتفرع للكيانات' : 'Click any event to inspect & pivot'}
        </span>
      </div>

      {/* High-density Events Table */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-900/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
              <th className="py-2.5 px-3">{isAr ? 'الوقت' : 'Time'}</th>
              <th className="py-2.5 px-3">{isAr ? 'المصدر' : 'World'}</th>
              <th className="py-2.5 px-3">{isAr ? 'نوع الحدث' : 'Event Type'}</th>
              <th className="py-2.5 px-3">{isAr ? 'المستخدم' : 'User'}</th>
              <th className="py-2.5 px-3">{isAr ? 'الجهاز / الهدف' : 'Host / Target'}</th>
              <th className="py-2.5 px-3">{isAr ? 'النتيجة' : 'Outcome'}</th>
              <th className="py-2.5 px-3">{isAr ? 'الخطورة' : 'Severity'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 font-mono">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                  {isAr ? 'لا توجد سجلات تطابق شروط التصفية' : 'No telemetry events match current criteria'}
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => {
                const isSelected = event.id === selectedEventId;
                return (
                  <tr
                    key={event.id}
                    onClick={() => selectEvent(event.id)}
                    data-testid={`telemetry-row-${event.id}`}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/40 text-cyan-200 border-l-2 rtl:border-l-0 rtl:border-r-2 border-cyan-500'
                        : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3 whitespace-nowrap text-slate-400 tabular-nums text-[11px]" dir="ltr">
                      +{event.virtualTime}s
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-[11px] font-bold text-slate-300" dir="ltr">
                      {event.sourceWorld}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-200 text-[11px]" dir="ltr">
                      {event.eventType}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-300 text-[11px]" dir="ltr">
                      {event.user || '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-400 text-[11px]" dir="ltr">
                      {event.host || event.sourceIp || '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-[11px]">
                      <span
                        className={
                          event.outcome === 'SUCCESS'
                            ? 'text-emerald-400'
                            : event.outcome === 'FAILURE' || event.outcome === 'DENIED'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }
                      >
                        {event.outcome || 'INFO'}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {renderSeverityIcon(event.severity)}
                        <span className="uppercase text-[10px] text-slate-400 font-sans">{event.severity}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
