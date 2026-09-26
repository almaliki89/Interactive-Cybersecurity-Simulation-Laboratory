import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useForensicsStore } from '../../../stores/forensicsStore';
import { 
  History, 
  Database, 
  FileJson, 
  X,
  User,
  ArrowRight
} from 'lucide-react';
import { getCustodyHistory } from '../logic/custody';

export const ForensicsTechnicalDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const selectedEvidenceId = useForensicsStore((s) => s.selectedEvidenceId);
  const evidence = useForensicsStore((s) => s.evidence);
  const allCustodyRecords = useForensicsStore((s) => s.custodyRecords);

  const selectedEvidence = evidence.find(ev => ev.id === selectedEvidenceId);
  
  // Filter custody history from the global store
  const custodyEntries = selectedEvidenceId 
    ? allCustodyRecords.filter(r => r.evidenceId === selectedEvidenceId)
    : [];

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col pointer-events-none">
      <div className="mt-auto h-80 bg-slate-950 border-t border-slate-800 shadow-2xl pointer-events-auto flex flex-col">
        <div className="h-10 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-cyan-400">
                <History className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isAr ? 'سجل الحضانة والبيانات التقنية' : 'CUSTODY_LEDGER_&_TECHNICAL_DATA'}
                </span>
             </div>
             {selectedEvidenceId && (
               <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase">
                 {selectedEvidenceId}
               </span>
             )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Custody Ledger */}
          <div className="flex-1 border-r border-slate-900 p-4 overflow-y-auto custom-scrollbar">
             <div className="space-y-3">
                {custodyEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-20">
                     <History className="w-8 h-8 text-slate-600 mb-2" />
                     <p className="text-[10px] font-mono uppercase">{isAr ? 'لا يوجد سجل متاح' : 'No custody records'}</p>
                  </div>
                ) : (
                  custodyEntries.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-900/60">
                       <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-[9px] font-mono text-cyan-500 font-bold tabular-nums">T+{entry.virtualTime}ms</span>
                          <div className="w-px h-4 bg-slate-800" />
                          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center">
                             <User className="w-3 h-3 text-slate-500" />
                          </div>
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black text-slate-300 uppercase">{entry.action}</span>
                             <span className="text-[8px] font-mono text-slate-500 uppercase">{entry.actor}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                             <span>{entry.id}</span>
                          </div>
                          {entry.notes && (
                            <p className="text-[9px] text-slate-400 italic mt-1 border-t border-slate-800/50 pt-1">
                              {entry.notes}
                            </p>
                          )}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Right: Raw Event JSON */}
          <div className="w-96 p-4 bg-black/40 overflow-y-auto custom-scrollbar">
             <div className="flex items-center gap-2 mb-3 text-slate-500">
                <FileJson className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono font-black uppercase tracking-widest">{isAr ? 'البيانات الوصفية الخام' : 'RAW_METADATA_JSON'}</span>
             </div>
             {selectedEvidence ? (
               <pre className="text-[10px] font-mono text-emerald-500/80 leading-relaxed whitespace-pre-wrap">
                 {JSON.stringify(selectedEvidence.metadata, null, 2)}
               </pre>
             ) : (
               <p className="text-[9px] font-mono text-slate-700 italic">{isAr ? 'لا توجد بيانات متاحة' : 'No metadata available'}</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
