import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useForensicsStore } from '../../../stores/forensicsStore';
import { ForensicEvidence } from '../logic/evidence';
import { 
  Database, 
  Cpu, 
  HardDrive, 
  FileText, 
  Activity, 
  Globe, 
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const ForensicsEvidenceBoard: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const evidence = useForensicsStore((s) => s.evidence);
  const selectedEvidenceId = useForensicsStore((s) => s.selectedEvidenceId);
  const setSelectedEvidenceId = useForensicsStore((s) => s.setSelectedEvidenceId);

  return (
    <div className="h-full flex flex-col bg-slate-900/30 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <h2 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.2em]">
          {isAr ? 'لوحة الأدلة الرقمية' : 'EVIDENCE_BOARD'}
        </h2>
        <span className="text-[9px] font-mono text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded uppercase">
          {evidence.length} {isAr ? 'قطعة' : 'ITEMS'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {evidence.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 opacity-30">
            <Database className="w-8 h-8 text-slate-600" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              {isAr ? 'لا توجد أدلة مكتسبة بعد' : 'No acquired evidence'}
            </p>
          </div>
        ) : (
          evidence.map((ev) => (
            <EvidenceCard 
              key={ev.id} 
              evidence={ev} 
              isSelected={selectedEvidenceId === ev.id}
              onClick={() => setSelectedEvidenceId(ev.id)}
              isAr={isAr}
            />
          ))
        )}
      </div>
    </div>
  );
};

const EvidenceCard: React.FC<{ 
  evidence: ForensicEvidence; 
  isSelected: boolean; 
  onClick: () => void;
  isAr: boolean;
}> = ({ evidence, isSelected, onClick, isAr }) => {
  const Icon = getEvidenceIcon(evidence.type);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all relative group overflow-hidden ${
        isSelected
          ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/20'
          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
      }`}
    >
      {/* Selection Glow */}
      {isSelected && (
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
      )}

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 transition-colors ${
          isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-500'
        }`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-white font-mono uppercase tracking-tight truncate">
              {evidence.id}
            </span>
            <IntegrityMiniBadge status={evidence.integrityStatus} />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-bold">
              <span className="opacity-50">{isAr ? 'النوع:' : 'TYPE:'}</span>
              <span className="text-slate-400">{evidence.type.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-bold">
              <span className="opacity-50">{isAr ? 'المستخدم:' : 'USR:'}</span>
              <span className="text-slate-400 truncate max-w-[60px]">{evidence.sourceUser || 'system'}</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-bold">
              <span className="opacity-50">{isAr ? 'الوقت:' : 'TIME:'}</span>
              <span className="text-cyan-500/70 tabular-nums">T+{evidence.acquiredAtVirtualTime}ms</span>
            </div>
            {evidence.preserved && (
              <div className="flex items-center gap-1 text-[8px] text-emerald-500/80 font-black uppercase tracking-tighter">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>{isAr ? 'محفوظ' : 'PRESERVED'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

const IntegrityMiniBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'VERIFIED':
      return <ShieldCheck className="w-3 h-3 text-emerald-500" />;
    case 'MISMATCH':
      return <ShieldAlert className="w-3 h-3 text-rose-500" />;
    default:
      return <AlertTriangle className="w-3 h-3 text-amber-500" />;
  }
};

const getEvidenceIcon = (type: string) => {
  switch (type) {
    case 'DISK_IMAGE': return HardDrive;
    case 'MEMORY_IMAGE': return Cpu;
    case 'LOG_EXPORT': return FileText;
    case 'NETWORK_CAPTURE': return Activity;
    case 'BROWSER_ARTIFACT': return Globe;
    case 'PROCESS_SNAPSHOT': return Activity;
    default: return Database;
  }
};
