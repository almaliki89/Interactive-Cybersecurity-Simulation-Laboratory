import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { SYNTHETIC_LOG_ENTRIES, mergeLogSources, detectLogTampering, ForensicLogEntry } from './logic/logs';
import { Search, ShieldAlert, Filter, Layers } from 'lucide-react';

export const LogForensicsLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [logs] = useState<ForensicLogEntry[]>(mergeLogSources([SYNTHETIC_LOG_ENTRIES]));
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [filterTamperedOnly, setFilterTamperedOnly] = useState<boolean>(false);

  let displayedLogs = filterTamperedOnly ? detectLogTampering(logs) : logs;
  if (selectedSource !== 'ALL') {
    displayedLogs = displayedLogs.filter((l) => l.source === selectedSource);
  }

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Search className="w-4 h-4" />
            <span>{isAr ? 'معمل التحقيق في السجلات المتقاطعة (Log Forensics)' : 'Cross-Source Log Forensics Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'محاذاة ودمج سجلات ويندوز، لينكس، الدليل النشط، وجدار الحماية' : 'Cross-World Log Alignment & SIEM Event Correlation'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTamperedOnly(!filterTamperedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${
              filterTamperedOnly
                ? 'bg-rose-950 border-rose-800 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{filterTamperedOnly ? (isAr ? 'عرض الكل' : 'Show All') : (isAr ? 'اكتشاف مسح السجلات' : 'Detect Log Tampering')}</span>
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'السجلات الموحدة عبر جميع الأنظمة' : 'Unified Multi-Source Forensic Log Stream'}</span>
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">{isAr ? 'جميع المصادر' : 'All Sources'}</option>
              <option value="WINDOWS">WINDOWS</option>
              <option value="LINUX">LINUX</option>
              <option value="IDENTITY">IDENTITY</option>
              <option value="APPSEC">APPSEC</option>
              <option value="NETWORK">NETWORK</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs">
          {displayedLogs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-xl border flex items-center justify-between ${
                log.severity === 'critical'
                  ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                  : log.severity === 'threat'
                  ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-16 text-slate-500 font-bold">T+{log.virtualTime}ms</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold text-[10px]">{log.source}</span>
                <span className="font-bold">{isAr ? log.descriptionAr : log.descriptionEn}</span>
              </div>

              <span className="text-slate-500 text-[10px]">{log.host} ({log.user})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
