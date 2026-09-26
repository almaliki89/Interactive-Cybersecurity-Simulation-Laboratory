import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useForensicsStore } from '../../../stores/forensicsStore';
import { ForensicEvidence } from '../logic/evidence';
import { 
  Database, 
  Info, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  User, 
  Server,
  Hash,
  Box
} from 'lucide-react';

export const ForensicsEvidenceInspector: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const evidence = useForensicsStore((s) => s.evidence);
  const selectedEvidenceId = useForensicsStore((s) => s.selectedEvidenceId);

  const selectedEvidence = evidence.find(ev => ev.id === selectedEvidenceId);

  if (!selectedEvidence) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-slate-900/20">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
          <Database className="w-8 h-8 text-slate-700" />
        </div>
        <div className="max-w-xs space-y-2">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
            {isAr ? 'لم يتم اختيار دليل' : 'NO_EVIDENCE_SELECTED'}
          </h3>
          <p className="text-[10px] text-slate-600 font-mono leading-relaxed uppercase">
            {isAr ? 'اختر قطعة من لوحة الأدلة لمعاينة الخصائص وحالة السلامة' : 'Select an evidence item from the board to inspect properties and integrity status.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden border-l border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              {isAr ? 'معاينة الدليل' : 'EVIDENCE_INSPECTOR'}
            </h2>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
              {selectedEvidence.id}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Integrity Status */}
        <section className="space-y-3">
           <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">
             {isAr ? 'حالة سلامة الدليل' : 'INTEGRITY_STATUS'}
           </h3>
           <IntegrityStatusCard status={selectedEvidence.integrityStatus} isAr={isAr} />
        </section>

        {/* Primary Metadata */}
        <section className="space-y-3">
           <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">
             {isAr ? 'بيانات المصدر' : 'SOURCE_METADATA'}
           </h3>
           <div className="grid grid-cols-1 gap-2">
              <MetadataRow label={isAr ? 'النوع' : 'TYPE'} value={selectedEvidence.type} icon={Box} />
              <MetadataRow label={isAr ? 'المستضيف' : 'HOST'} value={selectedEvidence.sourceHost || 'UNKNOWN'} icon={Server} />
              <MetadataRow label={isAr ? 'المستخدم' : 'USER'} value={selectedEvidence.sourceUser || 'UNKNOWN'} icon={User} />
              <MetadataRow label={isAr ? 'وقت الاستحواذ' : 'ACQUIRED'} value={`T+${selectedEvidence.acquiredAtVirtualTime}ms`} icon={Clock} />
           </div>
        </section>

        {/* Hashes */}
        <section className="space-y-3">
           <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">
             {isAr ? 'البصمات الرقمية (Hashes)' : 'CRYPTOGRAPHIC_HASHES'}
           </h3>
           <div className="space-y-2">
              <HashField label="ORIGINAL" value={selectedEvidence.originalHash} />
              <HashField label="CURRENT" value={selectedEvidence.currentHash} />
           </div>
        </section>

        {/* Extended Metadata */}
        {Object.keys(selectedEvidence.metadata).length > 0 && (
          <section className="space-y-3">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">
              {isAr ? 'بيانات وصفية إضافية' : 'EXTENDED_METADATA'}
            </h3>
            <div className="bg-slate-900/30 rounded-xl border border-slate-800 p-3 space-y-2">
               {Object.entries(selectedEvidence.metadata).map(([key, val]) => (
                 <div key={key} className="flex flex-col">
                    <span className="text-[8px] font-mono text-slate-600 uppercase">{key}</span>
                    <span className="text-[10px] font-mono text-slate-300 break-all">{String(val)}</span>
                 </div>
               ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const IntegrityStatusCard: React.FC<{ status: string; isAr: boolean }> = ({ status, isAr }) => {
  const configs: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    VERIFIED: {
      label: isAr ? 'تم التحقق من السلامة' : 'INTEGRITY_VERIFIED',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    },
    MISMATCH: {
      label: isAr ? 'فشل التحقق - بصمة غير مطابقة' : 'HASH_MISMATCH_DETECTED',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30'
    },
    NOT_VERIFIED: {
      label: isAr ? 'لم يتم التحقق بعد' : 'NOT_YET_VERIFIED',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30'
    }
  };

  const config = configs[status] || configs.NOT_VERIFIED;
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-xl border ${config.bg} ${config.border} flex items-center gap-3`}>
      <Icon className={`w-5 h-5 ${config.color}`} />
      <span className={`text-[10px] font-black uppercase tracking-wider ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

const MetadataRow: React.FC<{ label: string; value: string; icon: any }> = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
    <Icon className="w-3.5 h-3.5 text-slate-500" />
    <div className="flex flex-col">
       <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tight">{label}</span>
       <span className="text-[10px] font-bold text-slate-300 uppercase truncate max-w-[140px]">{value}</span>
    </div>
  </div>
);

const HashField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-2 rounded-lg bg-slate-950 border border-slate-900 flex flex-col gap-1">
    <div className="flex items-center gap-1.5">
      <Hash className="w-2.5 h-2.5 text-slate-700" />
      <span className="text-[8px] font-mono text-slate-600 uppercase">{label}</span>
    </div>
    <span className="text-[9px] font-mono text-slate-500 break-all leading-tight">{value}</span>
  </div>
);
