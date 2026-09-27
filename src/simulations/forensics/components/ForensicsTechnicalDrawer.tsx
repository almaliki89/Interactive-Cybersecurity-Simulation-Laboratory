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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div data-testid="technical-drawer" className="absolute inset-0 z-50 flex flex-col pointer-events-none">
      <div 
        className="flex-1 bg-black/60 pointer-events-auto transition-opacity" 
        onClick={onClose} 
      />
      <div className="mt-auto h-[45vh] min-h-[300px] max-h-[500px] bg-slate-950 border-t border-slate-800 shadow-2xl pointer-events-auto flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="h-10 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-cyan-400">
                <History className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isAr ? 'سجل الحضانة والبيانات التقنية' : 'CUSTODY_LEDGER_&_TECHNICAL_DATA'}
                </span>
             </div>
             {selectedEvidenceId && (
               <span className="text-[9px] font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase" dir="ltr">
                 {selectedEvidenceId}
               </span>
             )}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close Technical Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Custody Ledger */}
          <div className="flex-1 border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l border-slate-900 p-4 overflow-y-auto custom-scrollbar">
             <div className="space-y-3">
                {custodyEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-30">
                     <History className="w-8 h-8 text-slate-500 mb-2" />
                     <p className="text-[10px] font-mono uppercase text-slate-400">{isAr ? 'لا يوجد سجل متاح لهذا الدليل' : 'No custody records for this evidence'}</p>
                  </div>
                ) : (
                  custodyEntries.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-900/60">
                       <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-[9px] font-mono text-cyan-400 font-bold tabular-nums" dir="ltr">T+{entry.virtualTime}ms</span>
                          <div className="w-px h-4 bg-slate-800" />
                          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center">
                             <User className="w-3 h-3 text-slate-400" />
                          </div>
                       </div>
                       <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black text-slate-200 uppercase">{entry.action}</span>
                             <span className="text-[9px] font-mono text-slate-400 uppercase">{entry.actor}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono" dir="ltr">
                             <span className="truncate">{entry.id}</span>
                          </div>
                          {entry.notes && (
                            <p className="text-[10px] text-slate-300 italic mt-1 border-t border-slate-800/50 pt-1">
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
          <div className="w-full md:w-96 p-4 bg-black/40 overflow-y-auto custom-scrollbar shrink-0">
             <div className="flex items-center gap-2 mb-3 text-slate-400">
                <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[9px] font-mono font-black uppercase tracking-widest">{isAr ? 'البيانات الوصفية الخام' : 'RAW_METADATA_JSON'}</span>
             </div>
             {selectedEvidence ? (
               <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap select-all bg-black/50 p-3 rounded-lg border border-slate-900" dir="ltr">
                 {JSON.stringify(selectedEvidence.metadata, null, 2)}
               </pre>
             ) : (
               <p className="text-[10px] font-mono text-slate-500 italic">{isAr ? 'لا توجد بيانات متاحة' : 'No metadata available'}</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
