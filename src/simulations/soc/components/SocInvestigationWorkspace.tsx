import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useSocStore } from '../../../stores/socStore';
import { SecurityAlert } from '../logic/detection';
import { TriagedAlertResult } from '../logic/triage';
import { SecurityTelemetryEvent } from '../logic/telemetry';
import { SeverityBadge, StatusBadge } from './SocBadges';
import { useForensicsStore } from '../../../stores/forensicsStore';
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  Search, 
  Layers, 
  Send, 
  CheckCircle2, 
  XCircle, 
  FileJson,
  ShieldCheck,
  Zap,
  Target,
  ExternalLink
} from 'lucide-react';

interface SocInvestigationWorkspaceProps {
  activeAlert: SecurityAlert | null;
  activeTriage: TriagedAlertResult | null;
  relatedEvents: SecurityTelemetryEvent[];
}

export const SocInvestigationWorkspace: React.FC<SocInvestigationWorkspaceProps> = ({
  activeAlert,
  activeTriage,
  relatedEvents
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const alertStatuses = useSocStore((s) => s.alertStatuses);
  const updateAlertStatus = useSocStore((s) => s.updateAlertStatus);
  const setRawDrawerOpen = useSocStore((s) => s.setRawDrawerOpen);
  const setSelectedEventId = useSocStore((s) => s.setSelectedEventId);

  const setForensicsTab = useForensicsStore((s) => s.setActiveTab);
  const setForensicsContext = useForensicsStore((s) => s.setDeepLinkContext);

  if (!activeAlert) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-slate-950/50">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
          <Search className="w-8 h-8 text-slate-700" />
        </div>
        <div className="max-w-xs space-y-2">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
            {isAr ? 'بدء التحقيق' : 'BEGIN_INVESTIGATION'}
          </h3>
          <p className="text-[10px] text-slate-600 font-mono leading-relaxed uppercase">
            {isAr ? 'اختر تنبيهاً من قائمة الانتظار لبدء عملية الفرز والتحليل والربط' : 'Select an alert from the queue to start triaging, analysis, and correlation.'}
          </p>
        </div>
      </div>
    );
  }

  const currentStatus = alertStatuses[activeAlert.id] || activeAlert.status;

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Investigation Header */}
      <div className="p-6 border-b border-slate-900 bg-slate-900/10 shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={activeAlert.severity} />
              <StatusBadge status={currentStatus} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight leading-tight">
              {isAr ? activeAlert.ruleNameAr : activeAlert.ruleNameEn}
            </h1>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                T+{activeAlert.createdAtVirtualTime}ms
              </span>
              <span>/</span>
              <span className="text-cyan-500/70">{activeAlert.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <button 
               onClick={() => updateAlertStatus(activeAlert.id, 'INVESTIGATING')}
               className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-rose-950/20"
             >
                <Send className="w-3.5 h-3.5" />
                {isAr ? 'تصعيد للتحقيق' : 'Escalate'}
             </button>
             <button 
               onClick={() => updateAlertStatus(activeAlert.id, 'CLOSED')}
               className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-[11px] uppercase tracking-wider transition-colors"
             >
                {isAr ? 'إغلاق القضية' : 'Close'}
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {/* A. Rationale & Triage Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <section className="space-y-2">
              <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Search className="w-3 h-3 text-cyan-500" />
                {isAr ? 'ملخص التنبيه' : 'DETECTION_SUMMARY'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/30 p-4 rounded-2xl border border-slate-900/50 italic">
                {isAr ? activeAlert.reasonAr : activeAlert.reasonEn}
              </p>
            </section>

            {activeTriage && (
              <section className="space-y-2">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  {isAr ? 'تحليل الأولوية' : 'PRIORITY_ANALYSIS'}
                </h3>
                <div className="bg-slate-900/20 rounded-2xl border border-slate-900 p-4 space-y-3">
                   <div className="text-[11px] text-slate-300 space-y-2">
                      <div className="font-bold text-cyan-400/80 mb-1">{isAr ? 'عوامل التقييم:' : 'Risk Factors:'}</div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                        {(isAr ? activeTriage.factorsAr : activeTriage.factorsEn).map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                            <span className="text-[10px] text-slate-400 uppercase leading-tight font-mono">{f}</span>
                          </li>
                        ))}
                      </ul>
                   </div>
                   <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider shrink-0">
                         {isAr ? 'توصية المحلل:' : 'RECOMMENDATION:'}
                      </div>
                      <div className="text-[10px] text-slate-400 italic">
                         {isAr ? activeTriage.recommendedActionAr : activeTriage.recommendedActionEn}
                      </div>
                   </div>
                </div>
              </section>
            )}
          </div>

          <div className="space-y-4">
             <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-900 flex flex-col items-center justify-center text-center py-6">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Risk Score</div>
                <div className={`text-4xl font-black ${activeTriage && activeTriage.triageScore > 70 ? 'text-rose-500' : 'text-cyan-400'}`}>
                   {activeTriage?.triageScore || '??'}
                </div>
                <div className="text-[10px] font-mono text-slate-600 mt-2 uppercase tracking-tighter">Scale 0 - 100</div>
             </div>

             <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-3">
                <h4 className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]">{isAr ? 'الكيانات المتأثرة' : 'AFFECTED_ENTITIES'}</h4>
                <div className="space-y-2">
                   {activeAlert.entities.users.map(u => (
                     <div key={u} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        <Activity className="w-3 h-3 text-indigo-400" />
                        <span className="uppercase">{u}</span>
                     </div>
                   ))}
                   {activeAlert.entities.hosts.map(h => (
                     <div key={h} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        <Target className="w-3 h-3 text-rose-400" />
                        <span className="uppercase">{h}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* B. Correlated Evidence Timeline */}
        <section className="space-y-4 pt-4 border-t border-slate-900">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-purple-500" />
                {isAr ? 'التسلسل الزمني للأدلة' : 'EVIDENCE_TIMELINE'}
              </h3>
              <button 
                onClick={() => setRawDrawerOpen(true)}
                className="text-[9px] font-mono text-cyan-500 hover:text-cyan-400 flex items-center gap-1 underline underline-offset-4 decoration-cyan-500/30"
              >
                <FileJson className="w-3 h-3" />
                {isAr ? 'عرض السجلات الخام' : 'View Raw Telemetry'}
              </button>
           </div>

           <div className="space-y-1">
              {relatedEvents.map((evt, idx) => {
                const isDetection = activeAlert.evidenceEventIds.includes(evt.id);
                return (
                  <div 
                    key={evt.id} 
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group ${
                      isDetection 
                        ? 'bg-rose-500/5 border-rose-500/20' 
                        : 'bg-slate-900/20 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="w-16 text-[10px] font-mono text-slate-500 shrink-0 tabular-nums">
                      T+{evt.virtualTime}ms
                    </div>
                    <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${isDetection ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-slate-700'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-0.5">
                         <span className="text-[10px] font-black text-white font-mono uppercase tracking-tight truncate">{evt.eventType}</span>
                         <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[8px] font-mono text-slate-500 uppercase">
                           {evt.sourceWorld}
                         </span>
                         {isDetection && (
                           <span className="text-[8px] font-bold text-rose-400 uppercase tracking-tighter flex items-center gap-1">
                             <Zap className="w-2.5 h-2.5" />
                             {isAr ? 'حدث تم رصده' : 'MATCHED_EVENT'}
                           </span>
                         )}
                       </div>
                       <p className="text-[10px] text-slate-500 truncate italic">
                         User: {evt.user || 'SYSTEM'} • Target: {evt.resource || evt.host || 'LOCAL'} • Outcome: {evt.outcome}
                       </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-800 group-hover:text-slate-600 rtl:rotate-180" />
                  </div>
                );
              })}
           </div>
        </section>

        {/* C. Forensics Handoff if evidence exists */}
        {activeAlert.evidenceEventIds.length > 0 && (
           <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-indigo-950/50 border border-indigo-800 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                 </div>
                 <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white uppercase">{isAr ? 'الأدلة الجنائية المتاحة' : 'Digital Evidence Available'}</h4>
                    <p className="text-[10px] text-slate-400 italic">
                       {isAr ? 'تم رصد أدلة مرتبطة في مختبر التحقيق الجنائي الرقمي لهذه الأحداث' : 'Linked artifacts detected in the Forensics Lab for these events.'}
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => {
                  setForensicsContext({
                    alertId: activeAlert.id,
                    type: activeAlert.ruleNameEn
                  });
                  setForensicsTab('intake'); // Default to intake for context
                  useSimulationStore.getState().setActiveSimulation('forensics');
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                 <ExternalLink className="w-3 h-3" />
                 {isAr ? 'فحص الأدلة' : 'Inspect Evidence'}
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

const ChevronRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
