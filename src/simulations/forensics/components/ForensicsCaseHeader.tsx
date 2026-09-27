import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useForensicsStore } from '../../../stores/forensicsStore';
import { createDefaultForensicsCase } from '../logic/evidence';
import { 
  FileSearch, 
  ShieldAlert, 
  Clock, 
  Database, 
  ShieldCheck, 
  Link as LinkIcon 
} from 'lucide-react';

export const ForensicsCaseHeader: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const deepLink = useForensicsStore((s) => s.deepLinkContext);
  const evidence = useForensicsStore((s) => s.evidence);
  const forensicsCase = useForensicsStore((s) => s.caseDetails);

  const hasIntegrityMismatch = evidence.some(ev => ev.integrityStatus === 'MISMATCH');
  const allVerified = evidence.length > 0 && evidence.every(ev => ev.integrityStatus === 'VERIFIED');

  return (
    <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <FileSearch className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white leading-tight uppercase tracking-wider">
              {forensicsCase.id}
            </span>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              {isAr ? 'قضية جنائية نشطة' : 'ACTIVE_FORENSIC_CASE'}
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-800 mx-2 hidden sm:block" />

        <div className="hidden md:flex items-center gap-4">
          <HeaderStat 
            label={isAr ? 'الحالة' : 'STATUS'} 
            value={forensicsCase.status} 
            color="text-amber-400" 
          />
          <HeaderStat 
            label={isAr ? 'المصدر' : 'SOURCE'} 
            value={forensicsCase.sourceIncidentId} 
          />
          <HeaderStat 
            label={isAr ? 'الأدلة' : 'EVIDENCE'} 
            value={evidence.length.toString()} 
          />
          <HeaderStat 
            label={isAr ? 'السلامة' : 'INTEGRITY'} 
            value={hasIntegrityMismatch ? (isAr ? 'تباين' : 'MISMATCH') : allVerified ? (isAr ? 'سليم' : 'VERIFIED') : (isAr ? 'معلق' : 'PENDING')} 
            color={hasIntegrityMismatch ? 'text-rose-400' : allVerified ? 'text-emerald-400' : 'text-amber-400'}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {deepLink && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <LinkIcon className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              {isAr ? 'ارتباط SOC نشط' : 'SOC_LINKED'}
            </span>
            <span className="text-[9px] font-mono opacity-60" dir="ltr">[{deepLink.alertId}]</span>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-500" />
          <span className="uppercase tracking-widest hidden sm:inline">{isAr ? 'وقت المحاكاة:' : 'VIRTUAL_TIME:'}</span>
          <span className="text-white font-bold tabular-nums" dir="ltr">{(virtualTime / 1000).toFixed(2)}s</span>
        </div>
      </div>
    </div>
  );
};

const HeaderStat: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'text-slate-300' }) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">{label}</span>
    <span className={`text-[10px] font-bold uppercase ${color}`}>{value}</span>
  </div>
);
