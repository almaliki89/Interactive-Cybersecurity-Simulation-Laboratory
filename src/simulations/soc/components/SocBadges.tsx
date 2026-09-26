import React from 'react';
import { ShieldAlert, AlertTriangle, Info, Shield, ShieldCheck, Activity, Search, Clock } from 'lucide-react';
import { useSimulationStore } from '../../../stores/simulationStore';

export const SeverityBadge: React.FC<{ severity: string; showLabel?: boolean }> = ({ severity, showLabel = true }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const config: Record<string, { color: string; bg: string; border: string; icon: any; labelEn: string; labelAr: string }> = {
    CRITICAL: { 
      color: 'text-rose-400', 
      bg: 'bg-rose-950/40', 
      border: 'border-rose-500/30', 
      icon: ShieldAlert,
      labelEn: 'CRITICAL',
      labelAr: 'حرج جداً'
    },
    HIGH: { 
      color: 'text-orange-400', 
      bg: 'bg-orange-950/40', 
      border: 'border-orange-500/30', 
      icon: AlertTriangle,
      labelEn: 'HIGH',
      labelAr: 'عالي'
    },
    MEDIUM: { 
      color: 'text-amber-400', 
      bg: 'bg-amber-950/40', 
      border: 'border-amber-500/30', 
      icon: AlertTriangle,
      labelEn: 'MEDIUM',
      labelAr: 'متوسط'
    },
    LOW: { 
      color: 'text-blue-400', 
      bg: 'bg-blue-950/40', 
      border: 'border-blue-500/30', 
      icon: Info,
      labelEn: 'LOW',
      labelAr: 'منخفض'
    },
    INFO: { 
      color: 'text-slate-400', 
      bg: 'bg-slate-900', 
      border: 'border-slate-800', 
      icon: Info,
      labelEn: 'INFO',
      labelAr: 'معلومات'
    },
    threat: { // For TelemetrySeverity
        color: 'text-orange-400', 
        bg: 'bg-orange-950/40', 
        border: 'border-orange-500/30', 
        icon: AlertTriangle,
        labelEn: 'THREAT',
        labelAr: 'تهديد'
    },
    critical: { // For TelemetrySeverity
        color: 'text-rose-400', 
        bg: 'bg-rose-950/40', 
        border: 'border-rose-500/30', 
        icon: ShieldAlert,
        labelEn: 'CRITICAL',
        labelAr: 'حرج'
    },
    warn: { // For TelemetrySeverity
        color: 'text-amber-400', 
        bg: 'bg-amber-950/40', 
        border: 'border-amber-500/30', 
        icon: AlertTriangle,
        labelEn: 'WARN',
        labelAr: 'تحذير'
    },
    info: { // For TelemetrySeverity
        color: 'text-slate-400', 
        bg: 'bg-slate-900', 
        border: 'border-slate-800', 
        icon: Info,
        labelEn: 'INFO',
        labelAr: 'معلومات'
    }
  };

  const item = config[severity] || config.INFO;
  const Icon = item.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${item.bg} ${item.border} ${item.color} font-bold text-[10px] uppercase tracking-wider`}>
      <Icon className="w-3 h-3" />
      {showLabel && <span>{isAr ? item.labelAr : item.labelEn}</span>}
    </div>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const config: Record<string, { color: string; bg: string; icon: any; labelEn: string; labelAr: string }> = {
    NEW: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock, labelEn: 'NEW', labelAr: 'جديد' },
    TRIAGED: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Search, labelEn: 'TRIAGED', labelAr: 'تم الفرز' },
    INVESTIGATING: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Activity, labelEn: 'INVESTIGATING', labelAr: 'تحت التحقيق' },
    ESCALATED: { color: 'text-rose-400', bg: 'bg-rose-500/10', icon: ShieldAlert, labelEn: 'ESCALATED', labelAr: 'تم التصعيد' },
    CONTAINED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck, labelEn: 'CONTAINED', labelAr: 'تم الاحتواء' },
    CLOSED: { color: 'text-slate-400', bg: 'bg-slate-500/10', icon: Shield, labelEn: 'CLOSED', labelAr: 'مغلق' },
    OPEN: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock, labelEn: 'OPEN', labelAr: 'مفتوح' },
  };

  const item = config[status] || config.NEW;
  const Icon = item.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${item.bg} ${item.color} font-mono font-bold text-[9px] uppercase tracking-tight`}>
      <Icon className="w-2.5 h-2.5" />
      <span>{isAr ? item.labelAr : item.labelEn}</span>
    </div>
  );
};
