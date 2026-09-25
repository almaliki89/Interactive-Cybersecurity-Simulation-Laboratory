import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  AppSecLogEntry,
  INITIAL_APPSEC_LOGS,
  filterAppSecLogs,
  AppSecLogFilterOptions,
} from './logic/logging';
import { projectRuntimeEventsToAppSecLogs } from './runtime/AppEventBridge';
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
  Layers,
} from 'lucide-react';

interface AppLoggingLabProps {
  onBackToMap?: () => void;
  onNavigateToArchitecture?: () => void;
}

export const AppLoggingLab: React.FC<AppLoggingLabProps> = ({
  onBackToMap,
  onNavigateToArchitecture,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const runtimeEvents = useSimulationStore((s) => s.events);

  const projectedLogs = projectRuntimeEventsToAppSecLogs(runtimeEvents);
  const allLogs = [...INITIAL_APPSEC_LOGS, ...projectedLogs].sort(
    (a, b) => b.virtualTime - a.virtualTime || b.id.localeCompare(a.id)
  );

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AppSecLogEntry | null>(allLogs[0] || null);

  const filterOpts: AppSecLogFilterOptions = {
    type: typeFilter !== 'ALL' ? typeFilter : undefined,
    severity: severityFilter !== 'ALL' ? severityFilter : undefined,
    searchQuery,
  };

  const filteredLogs = filterAppSecLogs(allLogs, filterOpts);

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
              <Server className="w-6 h-6 text-blue-400" />
              <span>{isAr ? 'سجل أحداث أمان التطبيقات والمراقبة (AppSec SIEM Logs)' : 'Application Security Audit & SIEM Telemetry'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'مراقبة سجلات التدقيق الجنائي: أحداث المصادقة، انتهاكات BOLA، إحباط هجمات الحقن، وتفعيل قيود المعدل'
                : 'Forensic telemetry: audit login attempts, BOLA access denials, injection blocks, and SIEM feeds.'}
            </p>
          </div>
        </div>

        {onNavigateToArchitecture && (
          <button
            onClick={onNavigateToArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'مصمم البنية الآمنة' : 'Architecture Lab'}</span>
          </button>
        )}
      </div>

      {/* Filter Deck */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Event Type Filter:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option value="ALL">All Event Types</option>
              <option value="APP_AUTH_SUCCESS">APP_AUTH_SUCCESS</option>
              <option value="APP_AUTH_FAIL">APP_AUTH_FAIL</option>
              <option value="APP_ACCESS_DENIED">APP_ACCESS_DENIED (BOLA / IDOR)</option>
              <option value="APP_VALIDATION_FAIL">APP_VALIDATION_FAIL (Injection Blocked)</option>
              <option value="APP_RATE_LIMIT">APP_RATE_LIMIT (429 Triggered)</option>
              <option value="APP_ADMIN_ACTION">APP_ADMIN_ACTION</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Severity Filter:</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ALERT">ALERT</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Search Keywords:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, endpoint, IP, message..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Log Stream & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredLogs.map((log) => {
            const isSelected = selectedLog?.id === log.id;
            return (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-850 border-cyan-500 shadow-md shadow-cyan-950/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.severity === 'CRITICAL' || log.severity === 'ALERT'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : log.severity === 'WARN'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {log.severity}
                    </span>
                    <span className="font-bold text-slate-200">{log.type}</span>
                    <span className="text-slate-500 text-[10px]">T+{log.virtualTime}ms</span>
                  </div>
                  <div className="text-slate-400 truncate">{log.messageEn}</div>
                </div>

                <span className="text-[11px] text-cyan-400 font-bold whitespace-nowrap">
                  {log.httpMethod} {log.statusCode}
                </span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">SIEM Record Detail Inspector</span>
            <span className="text-slate-500">{selectedLog?.id}</span>
          </div>

          {selectedLog ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <div>• Type: <span className="text-cyan-400 font-bold">{selectedLog.type}</span></div>
                <div>• Endpoint: <span className="text-amber-400">{selectedLog.endpoint}</span></div>
                <div>• Source IP: <span className="text-purple-400">{selectedLog.sourceIp}</span></div>
                <div>• User: <span className="text-emerald-400">{selectedLog.username || 'Unauthenticated'}</span></div>
                <div>• Status Code: <span className="text-slate-200">{selectedLog.statusCode}</span></div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500 block mb-1">Message:</span>
                {isAr ? selectedLog.messageAr : selectedLog.messageEn}
              </div>

              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs overflow-x-auto">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">Select a log entry to inspect forensic metadata.</div>
          )}
        </div>
      </div>
    </div>
  );
};
