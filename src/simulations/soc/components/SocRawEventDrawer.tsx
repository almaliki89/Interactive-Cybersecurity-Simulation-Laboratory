import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useSocStore } from '../../../stores/socStore';
import { EnrichedTelemetryEvent } from '../logic/enrichment';
import { X, Copy, Check, FileJson, Terminal, Info } from 'lucide-react';

interface SocRawEventDrawerProps {
  selectedEvent: EnrichedTelemetryEvent | null;
}

export const SocRawEventDrawer: React.FC<SocRawEventDrawerProps> = ({ selectedEvent }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const isRawDrawerOpen = useSocStore((s) => s.isRawDrawerOpen);
  const setRawDrawerOpen = useSocStore((s) => s.setRawDrawerOpen);
  
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (selectedEvent) {
      navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isRawDrawerOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 h-[40vh] bg-slate-950 border-t border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="h-10 border-b border-slate-900 bg-slate-900/40 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
           <FileJson className="w-4 h-4 text-cyan-500" />
           <h3 className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest">
              {isAr ? 'بيانات السجل الخام (RAW_TELEMETRY)' : 'RAW_TELEMETRY_VIEWER'}
           </h3>
           {selectedEvent && (
             <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-500 uppercase ml-2">
                ID: {selectedEvent.id}
             </span>
           )}
        </div>
        <div className="flex items-center gap-2">
           {selectedEvent && (
             <button 
               onClick={handleCopy}
               className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 text-[9px] font-mono uppercase"
             >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy JSON'}
             </button>
           )}
           <div className="w-px h-4 bg-slate-800 mx-2" />
           <button 
             onClick={() => setRawDrawerOpen(false)}
             className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
           >
              <X className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar with common fields summary */}
         <div className="w-64 border-r border-slate-900 bg-slate-950/50 p-4 overflow-y-auto hidden md:block">
            <h4 className="text-[9px] font-mono text-slate-600 uppercase font-bold mb-4 tracking-widest">Normalized Fields</h4>
            {selectedEvent ? (
              <div className="space-y-4">
                 <FieldGroup label="Metadata" items={[
                   { k: 'Time', v: `T+${selectedEvent.virtualTime}ms` },
                   { k: 'World', v: selectedEvent.sourceWorld },
                   { k: 'Type', v: selectedEvent.eventType }
                 ]} />
                 <FieldGroup label="Entity" items={[
                   { k: 'User', v: selectedEvent.user || 'None' },
                   { k: 'Host', v: selectedEvent.host || 'None' },
                   { k: 'IP', v: selectedEvent.sourceIp || 'None' }
                 ]} />
                 <FieldGroup label="Result" items={[
                   { k: 'Outcome', v: selectedEvent.outcome || 'N/A' },
                   { k: 'Severity', v: selectedEvent.severity }
                 ]} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20">
                 <Terminal className="w-8 h-8 mb-2" />
                 <span className="text-[8px] font-mono uppercase">Waiting for select</span>
              </div>
            )}
         </div>

         {/* Main JSON view */}
         <div className="flex-1 bg-slate-950 p-4 overflow-hidden flex flex-col">
            {selectedEvent ? (
               <pre className="flex-1 overflow-auto custom-scrollbar text-[11px] font-mono text-cyan-300 leading-relaxed bg-black/30 p-4 rounded-xl border border-slate-900 selection:bg-cyan-500/30">
                  {JSON.stringify(selectedEvent, null, 2)}
               </pre>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
                  <Info className="w-10 h-10 mb-4" />
                  <p className="text-xs font-mono uppercase tracking-widest">Select an event in the workspace to view raw normalized telemetry.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

const FieldGroup: React.FC<{ label: string, items: { k: string, v: string }[] }> = ({ label, items }) => (
  <div className="space-y-1.5">
    <div className="text-[8px] font-mono text-slate-700 uppercase">{label}</div>
    {items.map(i => (
      <div key={i.k} className="flex flex-col">
        <span className="text-[8px] text-slate-600 uppercase font-mono">{i.k}</span>
        <span className="text-[10px] text-slate-400 font-mono truncate">{i.v}</span>
      </div>
    ))}
  </div>
);
