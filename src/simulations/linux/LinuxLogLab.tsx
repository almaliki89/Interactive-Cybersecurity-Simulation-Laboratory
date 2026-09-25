import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Terminal,
  Filter,
  Search,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Activity,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { LogEntry } from '../../types/simulation';

interface LinuxLogLabProps {
  onBackToMap?: () => void;
}

export const LinuxLogLab: React.FC<LinuxLogLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const logs = useSimulationStore((s) => s.logs);
  const clearLogs = useSimulationStore((s) => s.clearLogs);
  const addLog = useSimulationStore((s) => s.addLog);

  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatVirtualTimestamp = (ms: number): string => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(3);
    return `T+${minutes.toString().padStart(2, '0')}:${seconds.padStart(6, '0')}`;
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedSeverity !== 'ALL' && log.level !== selectedSeverity) return false;
    if (selectedSource !== 'ALL' && log.source !== selectedSource) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const availableSources = Array.from(new Set(logs.map((l) => l.source)));

  const handleInjectSampleAudit = () => {
    addLog({
      level: 'WARN',
      source: 'AUDITD',
      message: `type=SYSCALL arch=c000003e syscall=257 success=no exit=-13 a0=ffffff9c a1=7ffd6ee25850 a2=0 a3=0 items=1 ppid=120 pid=122 auid=1000 uid=1000 gid=1000 euid=1000 comm="cat" exe="/usr/bin/cat" key="shadow_tamper"`,
      category: 'SYSTEM',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 font-mono uppercase">
            <Terminal className="w-4 h-4" />
            <span>{isAr ? 'مختبر سجلات النظام والتدقيق الأمني (auditd & journalctl)' : 'Linux Security Telemetry & Audit Logs Lab'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'تتبع الأحداث الأمنية، سجلات النواة، وتدفق السجلات الحتمي' : 'Audit Trail Investigation, Deterministic Virtual Time & Forensics'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleInjectSampleAudit}
            className="px-3.5 py-1.5 rounded-xl bg-teal-950/80 border border-teal-700/80 hover:bg-teal-900 text-xs font-bold text-teal-200 transition-colors"
          >
            + {isAr ? 'حقن سجل تدقيق auditd' : 'Inject auditd Record'}
          </button>

          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <BackArrow className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة للخارطة' : 'Back to World Map'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={isAr ? 'بحث في السجلات...' : 'Filter log entries...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-1.5 text-slate-200 focus:outline-none w-52"
            />
          </div>

          {/* Severity filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">Severity: ALL</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>

          {/* Source filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">Source: ALL</option>
            {availableSources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-[11px]">
            {filteredLogs.length} / {logs.length} {isAr ? 'سجلات' : 'entries'}
          </span>
          <button
            onClick={clearLogs}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-950 rounded-lg transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Terminal Log Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-x-auto min-h-[450px] max-h-[550px] space-y-1.5">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => {
            const timeStr = formatVirtualTimestamp(log.timestamp || 0);

            return (
              <div
                key={log.id || index}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-900/60 border border-transparent hover:border-slate-800 transition-colors"
              >
                <span className="text-slate-500 text-[10px] w-24 shrink-0 font-bold">
                  {timeStr}
                </span>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                    log.level === 'ERROR'
                      ? 'bg-rose-950 border border-rose-800 text-rose-300'
                      : log.level === 'WARN'
                      ? 'bg-amber-950 border border-amber-800 text-amber-300'
                      : 'bg-cyan-950 border border-cyan-800 text-cyan-300'
                  }`}
                >
                  {log.level}
                </span>

                <span className="text-slate-400 font-bold shrink-0 w-28 truncate">
                  [{log.source}]
                </span>

                <span className="text-slate-200 leading-relaxed break-all flex-1">
                  {log.message}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-slate-600 space-y-2">
            <Terminal className="w-8 h-8 opacity-40" />
            <p className="text-xs">
              {isAr ? 'لا توجد سجلات مطابقة للشروط الحالية' : 'No security log entries match current filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
