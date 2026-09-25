import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { collectWindowsArtifacts, findLogTamperingEvidence, WindowsArtifact } from './logic/windowsArtifacts';
import { Activity, ShieldAlert, Eye, Terminal } from 'lucide-react';

export const WindowsArtifactLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [artifacts] = useState<WindowsArtifact[]>(collectWindowsArtifacts());
  const [selectedId, setSelectedId] = useState<string>('WIN-ART-006');
  const [filterTamperingOnly, setFilterTamperingOnly] = useState<boolean>(false);

  const displayedList = filterTamperingOnly ? findLogTamperingEvidence(artifacts) : artifacts;
  const selectedArtifact = artifacts.find((a) => a.id === selectedId);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>{isAr ? 'معمل أدلة وسجلات نظام ويندوز (Windows Artifacts)' : 'Windows Forensic Artifacts Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'تحليل سجلات الأحداث (4624, 4625, 4688, 4728, 1102) وPrefetch' : 'Windows Event Log Analysis, Execution Evidence & Audit Tampering'}
          </h1>
        </div>

        <button
          onClick={() => setFilterTamperingOnly(!filterTamperingOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${
            filterTamperingOnly
              ? 'bg-rose-950 border-rose-800 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{filterTamperingOnly ? (isAr ? 'عرض كافة الأدلة' : 'Show All Artifacts') : (isAr ? 'عرض أدلة مسح السجلات فقط' : 'Show Log Tampering Only')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>{isAr ? 'أدلة ويندوز المسجلة بالسجلات والأحداث' : 'Collected Windows Artifact Entries'}</span>
          </h2>

          <div className="flex flex-col gap-2 font-mono text-xs">
            {displayedList.map((a) => {
              const isSelected = a.id === selectedId;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg'
                      : a.isSuspicious
                      ? 'bg-rose-950/40 border-rose-900/60 text-slate-200 hover:border-rose-700'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {a.eventId && <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold text-[10px]">EVT {a.eventId}</span>}
                    <span className="font-bold text-slate-200">{isAr ? a.descriptionAr : a.descriptionEn}</span>
                  </div>

                  <span className="text-slate-500 text-[10px] shrink-0">T+{a.virtualTime}ms</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{isAr ? 'معاينة تفاصيل الدليل الأمني' : 'Artifact Metadata Inspector'}</span>
          </h2>

          {selectedArtifact ? (
            <div className="flex flex-col gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">{isAr ? 'الجهاز والمستخدم' : 'Host & User'}</span>
                <span className="text-cyan-300 font-bold">{selectedArtifact.host} | {selectedArtifact.user}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">{isAr ? 'نوع الدليل والحدث' : 'Artifact Type & Event ID'}</span>
                <span className="text-slate-200">{selectedArtifact.artifactType} {selectedArtifact.eventId ? `(ID: ${selectedArtifact.eventId})` : ''}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1">{isAr ? 'البيانات الوصفية للحدث' : 'Event Payload Attributes'}</span>
                <pre className="text-[10px] text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(selectedArtifact.metadata, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic text-center py-8">
              {isAr ? 'حدد دليلاً من القائمة لمعاينة التفاصيل' : 'Select a Windows artifact to inspect'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
