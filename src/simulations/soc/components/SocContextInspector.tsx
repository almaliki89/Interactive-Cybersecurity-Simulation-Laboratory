import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useSocStore } from '../../../stores/socStore';
import { EnrichedTelemetryEvent } from '../logic/enrichment';
import { SeverityBadge } from './SocBadges';
import { 
  Info, 
  Server, 
  User, 
  Globe, 
  Terminal, 
  Tag, 
  Shield, 
  Database, 
  FileCode,
  Network,
  Lock,
  X
} from 'lucide-react';

interface SocContextInspectorProps {
  selectedEvent: EnrichedTelemetryEvent | null;
}

export const SocContextInspector: React.FC<SocContextInspectorProps> = ({ selectedEvent }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const setSelectedEventId = useSocStore((s) => s.setSelectedEventId);

  if (!selectedEvent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-950 border-l border-slate-900">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <Info className="w-6 h-6 text-slate-700" />
        </div>
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest leading-relaxed">
          {isAr ? 'اختر حدثاً للمعاينة' : 'Select event for context'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-900 overflow-hidden">
      <div className="p-4 border-b border-slate-900 bg-slate-900/20 flex items-center justify-between shrink-0">
        <h2 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.2em]">
          {isAr ? 'فاحص السياق' : 'CONTEXT_INSPECTOR'}
        </h2>
        <button 
          onClick={() => setSelectedEventId(null)}
          className="p-1 rounded hover:bg-slate-900 text-slate-600 hover:text-slate-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Basic Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
             <SeverityBadge severity={selectedEvent.severity} />
             <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                selectedEvent.outcome === 'SUCCESS' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' : 'bg-rose-950/40 text-rose-400 border-rose-900/50'
             }`}>
                {selectedEvent.outcome}
             </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-mono uppercase tracking-tight break-words">
               {selectedEvent.eventType}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">
               ID: {selectedEvent.id}
            </p>
          </div>
        </div>

        {/* Core Dimensions */}
        <section className="space-y-2">
           <h4 className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">{isAr ? 'الأبعاد الأساسية' : 'CORE_DIMENSIONS'}</h4>
           <div className="space-y-1.5">
              <DimensionItem icon={Globe} label="World" value={selectedEvent.sourceWorld} color="text-cyan-400" />
              <DimensionItem icon={Tag} label="Category" value={selectedEvent.category} color="text-indigo-400" />
              <DimensionItem icon={User} label="Subject" value={selectedEvent.user || 'SYSTEM'} />
              <DimensionItem icon={Server} label="Asset" value={selectedEvent.host || 'INTERNAL_RUNTIME'} />
              <DimensionItem icon={Network} label="Source IP" value={selectedEvent.sourceIp || 'N/A'} />
              <DimensionItem icon={Database} label="Target Obj" value={selectedEvent.resource || 'N/A'} color="text-rose-400" />
           </div>
        </section>

        {/* Enrichment Context */}
        <section className="space-y-2">
           <h4 className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">{isAr ? 'سياق التهديد المعزز' : 'ENRICHED_THREAT_CONTEXT'}</h4>
           <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <EnrichmentRow label="Asset Criticality" value={selectedEvent.assetCriticality || 'LOW'} highlight={selectedEvent.assetCriticality === 'CRITICAL'} />
              <EnrichmentRow label="Identity Privilege" value={selectedEvent.userIsPrivileged ? 'PRIVILEGED' : 'STANDARD'} highlight={selectedEvent.userIsPrivileged} />
              <EnrichmentRow label="Department" value={selectedEvent.userDepartment || 'N/A'} />
              <EnrichmentRow label="Host Role" value={selectedEvent.hostRole || 'GENERIC'} />
           </div>
        </section>

        {/* Technical Data */}
        {(selectedEvent.process || selectedEvent.destinationPort) && (
          <section className="space-y-2">
            <h4 className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">{isAr ? 'بيانات فنية' : 'TECHNICAL_METADATA'}</h4>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-2 font-mono text-[10px]">
               {selectedEvent.process && (
                 <div className="flex flex-col gap-1">
                   <span className="text-slate-500 uppercase flex items-center gap-1">
                     <Terminal className="w-3 h-3" />
                     Process
                   </span>
                   <span className="text-amber-400 break-all bg-slate-900 p-1.5 rounded border border-slate-800">{selectedEvent.process}</span>
                 </div>
               )}
               {selectedEvent.destinationPort && (
                 <div className="flex items-center justify-between">
                    <span className="text-slate-500 uppercase">Port</span>
                    <span className="text-white font-bold">{selectedEvent.destinationPort}</span>
                 </div>
               )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const DimensionItem: React.FC<{ icon: any, label: string, value: string, color?: string }> = ({ icon: Icon, label, value, color = 'text-slate-300' }) => (
  <div className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-mono">
       <Icon className="w-3 h-3" />
       <span>{label}</span>
    </div>
    <span className={`text-[10px] font-bold font-mono uppercase truncate max-w-[120px] ${color}`}>{value}</span>
  </div>
);

const EnrichmentRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[10px] text-slate-500 font-mono uppercase truncate">{label}</span>
    <span className={`text-[10px] font-black uppercase font-mono ${highlight ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
      {value}
    </span>
  </div>
);
