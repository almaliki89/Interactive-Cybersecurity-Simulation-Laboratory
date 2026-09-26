import React, { useState } from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useSocStore } from '../../../stores/socStore';
import { EnrichedTelemetryEvent } from '../logic/enrichment';
import { queryTelemetry } from '../logic/hunting';
import { 
  Search, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Filter,
  Activity,
  Terminal,
  FileJson
} from 'lucide-react';
import { SeverityBadge } from './SocBadges';

interface SocExplorerProps {
  events: EnrichedTelemetryEvent[];
}

export const SocExplorer: React.FC<SocExplorerProps> = ({ events }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const [queryString, setQueryString] = useState<string>('category = AUTHENTICATION');
  const selectedEventId = useSocStore((s) => s.selectedEventId);
  const setSelectedEventId = useSocStore((s) => s.setSelectedEventId);
  
  const results = React.useMemo(() => {
    return queryTelemetry(events, queryString);
  }, [events, queryString]);

  const quickQueries = [
    { label: 'Auth Fails', query: 'category = AUTHENTICATION AND outcome = FAILURE' },
    { label: 'Priv Changes', query: 'category = GROUP_MANAGEMENT' },
    { label: 'Network Deny', query: 'sourceWorld = NETWORK AND outcome = DENIED' },
    { label: 'Admin Activity', query: 'user CONTAINS admin' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Query Bar */}
      <div className="p-4 border-b border-slate-900 bg-slate-900/10 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={queryString}
              onChange={(e) => setQueryString(e.target.value)}
              placeholder="category = AUTHENTICATION AND outcome = FAILURE"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[10px] focus:outline-none focus:border-cyan-500/50 transition-all uppercase tracking-tight"
            />
          </div>
          <button
            onClick={() => setQueryString('')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mr-1">{isAr ? 'اختصارات:' : 'SHORTCUTS:'}</span>
          {quickQueries.map((q) => (
            <button
              key={q.label}
              onClick={() => setQueryString(q.query)}
              className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-300 text-[9px] font-mono uppercase transition-all"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse select-none">
            <thead className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800">
              <tr className="text-[9px] font-mono font-black text-slate-600 uppercase tracking-[0.2em]">
                <th className="p-3 pl-4">Timestamp</th>
                <th className="p-3">Source</th>
                <th className="p-3">Event_Identity</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <Terminal className="w-8 h-8" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em]">NO_MATCHING_TELEMETRY</span>
                    </div>
                  </td>
                </tr>
              ) : (
                results.map((evt) => {
                  const isSelected = selectedEventId === evt.id;
                  return (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEventId(evt.id)}
                      className={`cursor-pointer transition-all border-l-2 ${
                        isSelected 
                          ? 'bg-cyan-500/5 border-cyan-500 text-cyan-100' 
                          : 'border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <td className="p-3 pl-4 text-[10px] font-mono tabular-nums whitespace-nowrap opacity-60">
                        T+{evt.virtualTime}ms
                      </td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-500 uppercase">
                          {evt.sourceWorld}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-black text-[10px] uppercase tracking-tight truncate max-w-[180px]">
                        {evt.eventType}
                      </td>
                      <td className="p-3 text-[10px] font-mono truncate max-w-[100px]">
                        {evt.user || 'SYSTEM'}
                      </td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                           evt.outcome === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                           {evt.outcome}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Stats */}
        <div className="h-6 border-t border-slate-900 bg-slate-950 px-4 flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase tracking-widest">
           <div className="flex items-center gap-4">
              <span>Results: {results.length}</span>
              <span>Total Indexed: {events.length}</span>
           </div>
           <div className="flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-cyan-500 animate-pulse" />
              LIVE_STREAM_ACTIVE
           </div>
        </div>
      </div>
    </div>
  );
};
