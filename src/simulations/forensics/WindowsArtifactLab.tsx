import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { collectWindowsArtifacts, findLogTamperingEvidence, WindowsArtifact } from './logic/windowsArtifacts';
import { Activity, ShieldAlert, Eye, Terminal, Search, Zap } from 'lucide-react';

export const WindowsArtifactLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [artifacts] = useState<WindowsArtifact[]>(collectWindowsArtifacts());
  const [selectedId, setSelectedId] = useState<string>('WIN-ART-006');
  const [filterTamperingOnly, setFilterTamperingOnly] = useState<boolean>(false);

  const displayedList = filterTamperingOnly ? findLogTamperingEvidence(artifacts) : artifacts;
  const selectedArtifact = artifacts.find((a) => a.id === selectedId);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>{isAr ? 'معمل أدلة وسجلات نظام ويندوز (Windows Artifacts)' : 'Windows Forensic Artifacts Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'تحليل سجلات الأحداث والأدلة المسجلة' : 'WINDOWS_EVENT_LOG_ANALYSIS'}
          </h1>
        </div>

        <button
          onClick={() => setFilterTamperingOnly(!filterTamperingOnly)}
          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${
            filterTamperingOnly
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{filterTamperingOnly ? (isAr ? 'عرض الكل' : 'SHOW_ALL') : (isAr ? 'اكتشاف التلاعب' : 'DETECT_TAMPERING')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            {isAr ? 'سجل أحداث نظام ويندوز' : 'WINDOWS_EVENT_STREAM'}
          </h2>

          <div className="space-y-2">
            {displayedList.map((a) => {
              const isSelected = a.id === selectedId;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-lg'
                      : a.isSuspicious
                      ? 'bg-rose-500/5 border-rose-900/40 text-slate-300 hover:border-rose-700'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 text-[10px] font-mono text-slate-500 tabular-nums">T+{a.virtualTime}ms</div>
                    <div className="flex items-center gap-3">
                      {a.eventId && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-[9px] font-black border border-slate-700">{a.eventId}</span>}
                      <span className="text-[11px] font-bold uppercase tracking-tight">{isAr ? a.descriptionAr : a.descriptionEn}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                     {a.isSuspicious && <Zap className="w-3.5 h-3.5 text-rose-500" />}
                     <Search className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-cyan-400' : 'text-slate-800 group-hover:text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
          <h2 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{isAr ? 'معاين خصائص الحدث' : 'EVENT_PROPERTY_INSPECTOR'}</span>
          </h2>

          {selectedArtifact ? (
            <div className="space-y-4">
               <div className="grid grid-cols-1 gap-2">
                  <PropertyRow label="HOST" value={selectedArtifact.host} />
                  <PropertyRow label="USER" value={selectedArtifact.user} />
                  <PropertyRow label="TYPE" value={selectedArtifact.artifactType} />
               </div>

               <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest block mb-3 border-b border-slate-900 pb-1">{isAr ? 'البيانات التقنية' : 'TECHNICAL_ATTRIBUTES'}</span>
                  <pre className="text-[10px] font-mono text-cyan-400/80 leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(selectedArtifact.metadata, null, 2)}
                  </pre>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 opacity-20">
               <Search className="w-10 h-10 text-slate-600" />
               <p className="text-[10px] font-mono uppercase">{isAr ? 'حدد حدثاً للمعاينة' : 'No event selected'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PropertyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-0.5">
     <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">{label}</span>
     <span className="text-[10px] font-black text-slate-300 uppercase truncate">{value}</span>
  </div>
);
