import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useSocStore } from '../../../stores/socStore';
import { SecurityAlert } from '../logic/detection';
import { SeverityBadge, StatusBadge } from './SocBadges';
import { ShieldAlert, User, Server, Globe, ChevronRight, ChevronLeft } from 'lucide-react';

interface SocAlertQueueProps {
  alerts: SecurityAlert[];
}

export const SocAlertQueue: React.FC<SocAlertQueueProps> = ({ alerts }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const selectedAlertId = useSocStore((s) => s.selectedAlertId);
  const setSelectedAlertId = useSocStore((s) => s.setSelectedAlertId);
  const alertStatuses = useSocStore((s) => s.alertStatuses);
  
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      <div className="p-4 border-b border-slate-900 bg-slate-900/20 flex items-center justify-between">
        <h2 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.2em]">
          {isAr ? 'قائمة التنبيهات' : 'ALERT_QUEUE'}
        </h2>
        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-cyan-500">
          {alerts.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {alerts.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5 text-slate-700" />
            </div>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest leading-relaxed">
              {isAr ? 'لا توجد تنبيهات نشطة' : 'No Active Alerts'}
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isSelected = selectedAlertId === alert.id;
            const status = alertStatuses[alert.id] || alert.status;
            
            return (
              <button
                key={alert.id}
                onClick={() => setSelectedAlertId(alert.id)}
                className={`w-full text-left rtl:text-right p-3 rounded-xl border transition-all relative group overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 border-slate-700 shadow-lg shadow-black/40 ring-1 ring-cyan-500/20'
                    : 'bg-transparent border-transparent hover:bg-slate-900/40 hover:border-slate-800'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 bottom-0 w-1 bg-cyan-400" />
                )}
                
                <div className="flex items-center justify-between mb-2">
                  <SeverityBadge severity={alert.severity} showLabel={false} />
                  <span className="text-[10px] font-mono text-slate-400" dir="ltr">
                    T+{alert.createdAtVirtualTime}ms
                  </span>
                </div>

                <div className={`text-[12px] font-bold mb-2 tracking-tight line-clamp-2 transition-colors ${
                  isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                }`}>
                  {isAr ? alert.ruleNameAr : alert.ruleNameEn}
                </div>

                <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 opacity-80">
                   <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-mono">
                     <User className="w-3 h-3 text-slate-500" />
                     <span className="truncate max-w-[80px]" dir="ltr">{alert.entities.users[0] || 'SYSTEM'}</span>
                   </div>
                   <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-mono">
                     <Globe className="w-3 h-3 text-slate-500" />
                     <span className="truncate max-w-[80px]" dir="ltr">{alert.entities.ips[0] || 'LOCAL'}</span>
                   </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                   <StatusBadge status={status} />
                   <Chevron className={`w-3 h-3 text-slate-700 group-hover:text-cyan-500/50 transition-colors ${isSelected ? 'text-cyan-500' : ''}`} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
