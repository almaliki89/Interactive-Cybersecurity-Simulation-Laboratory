import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent, EnrichedTelemetryEvent } from './logic/enrichment';
import { queryTelemetry, matchTelemetryFilter } from './logic/hunting';
import {
  Search,
  Filter,
  Layers,
  Clock,
  Server,
  User,
  Shield,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Key,
  Database,
  Radio,
  FileCode,
  Tag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface SiemExplorerLabProps {
  onBackToMap?: () => void;
  onNavigateToDetectionRules?: () => void;
}

export const SiemExplorerLab: React.FC<SiemExplorerLabProps> = ({
  onBackToMap,
  onNavigateToDetectionRules,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const runtimeEvents = useSimulationStore((s) => s.events);

  // Search & Filter State
  const [queryString, setQueryString] = useState<string>('category = AUTHENTICATION');
  const [selectedWorld, setSelectedWorld] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<string>('ALL');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Ingested enriched events
  const enrichedTelemetry: EnrichedTelemetryEvent[] = runtimeEvents.map((rawEvt) => {
    const norm = normalizeRuntimeEvent({
      id: rawEvt.id,
      type: rawEvt.type,
      source: rawEvt.source,
      target: rawEvt.target,
      category: rawEvt.category,
      severity: rawEvt.severity,
      virtualTime: rawEvt.virtualTime,
      description: rawEvt.description,
      payload: (rawEvt.payload as Record<string, unknown>) || {},
    });
    return enrichTelemetryEvent(norm);
  });

  // Execute query language search
  let results = queryTelemetry(enrichedTelemetry, queryString);

  // Apply quick dropdown filters
  results = results.filter((evt) => {
    if (selectedWorld !== 'ALL' && evt.sourceWorld !== selectedWorld) return false;
    if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) return false;
    if (selectedOutcome !== 'ALL' && evt.outcome !== selectedOutcome) return false;
    if (selectedUser !== 'ALL' && evt.user !== selectedUser) return false;
    return true;
  });

  const activeEvent = results.find((e) => e.id === selectedEventId) || results[0] || null;

  const quickQueries = [
    { label: 'All Auth Failures', query: 'category = AUTHENTICATION AND outcome = FAILURE' },
    { label: 'User Sara Activity', query: 'user = sara' },
    { label: 'Privileged Group Changes', query: 'category = GROUP_MANAGEMENT' },
    { label: 'Network Denials', query: 'sourceWorld = NETWORK AND outcome = DENIED' },
    { label: 'AppSec BOLA Denials', query: 'sourceWorld = APPSEC AND outcome = DENIED' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-mono text-xs">
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
              <Search className="w-6 h-6 text-cyan-400" />
              <span>{isAr ? 'مستكشف سجلات SIEM والبحث المتقدم' : 'SIEM Telemetry Explorer & Query Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'استعلام وفحص ملايين السجلات الموحدة عبر لغة استعلام آمنة وتصفية الكيانات الحية'
                : 'Safe structured query syntax: field = value AND field2 > value. Cross-correlate users, hosts, and timestamps.'}
            </p>
          </div>
        </div>

        {onNavigateToDetectionRules && (
          <button
            onClick={onNavigateToDetectionRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isAr ? 'قواعد الاكتشاف والتنبيهات' : 'Detection Rules Lab'}</span>
          </button>
        )}
      </div>

      {/* Safe Query Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
            <input
              type="text"
              value={queryString}
              onChange={(e) => setQueryString(e.target.value)}
              placeholder="e.g. category = AUTHENTICATION AND outcome = FAILURE"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={() => setQueryString('')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            title="Clear"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-slate-500 font-bold">{isAr ? 'استعلامات سريعة:' : 'Quick Queries:'}</span>
          {quickQueries.map((q) => (
            <button
              key={q.label}
              onClick={() => setQueryString(q.query)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 text-[11px] transition-colors"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Faceted Filters Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <label className="text-slate-400 block mb-1 font-bold">Source Domain:</label>
          <select
            value={selectedWorld}
            onChange={(e) => setSelectedWorld(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
          >
            <option value="ALL">All Sources</option>
            <option value="WINDOWS">WINDOWS</option>
            <option value="IDENTITY">IDENTITY / AD</option>
            <option value="APPSEC">APPSEC</option>
            <option value="NETWORK">NETWORK</option>
            <option value="LINUX">LINUX</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
          >
            <option value="ALL">All Categories</option>
            <option value="AUTHENTICATION">AUTHENTICATION</option>
            <option value="ACCESS_CONTROL">ACCESS_CONTROL</option>
            <option value="GROUP_MANAGEMENT">GROUP_MANAGEMENT</option>
            <option value="PROCESS_EXECUTION">PROCESS_EXECUTION</option>
            <option value="NETWORK_CONNECTION">NETWORK_CONNECTION</option>
            <option value="APPLICATION_DEFENSE">APPLICATION_DEFENSE</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">Outcome:</label>
          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
          >
            <option value="ALL">All Outcomes</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
            <option value="DENIED">DENIED</option>
            <option value="ANOMALY">ANOMALY</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">User Entity:</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
          >
            <option value="ALL">All Users</option>
            <option value="sara">sara (Finance)</option>
            <option value="admin_alex">admin_alex (Domain Admin)</option>
            <option value="bob">bob (External)</option>
          </select>
        </div>
      </div>

      {/* Main Split: Results Table & Event Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Table */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider pb-1">
            <span>Query Results ({results.length} Events)</span>
            <span className="text-cyan-400 text-[11px]">Indexed In SIEM</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="p-3">Time</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No events match current query or filter criteria.
                    </td>
                  </tr>
                ) : (
                  results.map((evt) => {
                    const isSelected = selectedEventId === evt.id;
                    return (
                      <tr
                        key={evt.id}
                        onClick={() => setSelectedEventId(evt.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <td className="p-3 text-[10px] text-slate-500 whitespace-nowrap">T+{evt.virtualTime}ms</td>
                        <td className="p-3 font-bold text-[10px] text-slate-400">{evt.sourceWorld}</td>
                        <td className="p-3 font-mono font-bold truncate max-w-[140px]">{evt.eventType}</td>
                        <td className="p-3 text-slate-300">{evt.user || 'SYSTEM'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            evt.outcome === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
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
        </div>

        {/* Right Detail Inspector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            {isAr ? 'فحص السجل المختار (SIEM Record)' : 'Event Record Details'}
          </div>

          {!activeEvent ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              Select an event to view normalized JSON record and enrichment context.
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white font-mono">{activeEvent.eventType}</div>
                  <div className="text-[10px] text-slate-500">ID: {activeEvent.id}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeEvent.outcome === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {activeEvent.outcome}
                </span>
              </div>

              {/* Key Attributes */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>Source World: <strong className="text-cyan-400">{activeEvent.sourceWorld}</strong></div>
                <div>Category: <strong className="text-indigo-400">{activeEvent.category}</strong></div>
                <div>User Principal: <strong className="text-slate-200">{activeEvent.user || 'None'}</strong></div>
                <div>Target Host: <strong className="text-slate-200">{activeEvent.host || 'None'}</strong></div>
                <div>Source IP: <strong className="text-slate-400">{activeEvent.sourceIp || 'N/A'}</strong></div>
                <div>Destination IP: <strong className="text-slate-400">{activeEvent.destinationIp || 'N/A'}</strong></div>
                {activeEvent.resource && (
                  <div className="col-span-2 text-rose-300 truncate">
                    Resource: <strong>{activeEvent.resource}</strong>
                  </div>
                )}
                {activeEvent.process && (
                  <div className="col-span-2 text-amber-300">
                    Process: <strong>{activeEvent.process}</strong>
                  </div>
                )}
              </div>

              {/* Enrichment Context */}
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1 text-[11px]">
                <div className="text-emerald-400 font-bold pb-1 border-b border-slate-800">Asset & Identity Enrichment</div>
                <div className="text-slate-300">User Department: <strong className="text-white">{activeEvent.userDepartment || 'External / Generic'}</strong></div>
                <div className="text-slate-300">Account Privilege: <strong className={activeEvent.userIsPrivileged ? 'text-amber-400' : 'text-slate-400'}>{activeEvent.userIsPrivileged ? 'PRIVILEGED ADMIN' : 'Standard'}</strong></div>
                <div className="text-slate-300">Host Role: <strong className="text-cyan-300">{activeEvent.hostRole || 'Standard Workstation'}</strong></div>
                <div className="text-slate-300">Criticality: <strong className={activeEvent.assetCriticality === 'CRITICAL' ? 'text-rose-400' : 'text-slate-300'}>{activeEvent.assetCriticality || 'LOW'}</strong></div>
              </div>

              {/* Raw JSON viewer */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Normalized JSON Representation</span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 overflow-x-auto max-h-36">
                  {JSON.stringify(activeEvent, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
