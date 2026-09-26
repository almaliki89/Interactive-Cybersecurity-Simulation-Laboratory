import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useSocStore } from '../../../stores/socStore';
import { normalizeRuntimeEvent } from '../logic/normalization';
import { enrichTelemetryEvent } from '../logic/enrichment';
import { evaluateDetectionRules, STANDARD_DETECTION_RULES } from '../logic/detection';
import { triageAlert } from '../logic/triage';

// Components
import { SocAlertQueue } from './SocAlertQueue';
import { SocInvestigationWorkspace } from './SocInvestigationWorkspace';
import { SocContextInspector } from './SocContextInspector';
import { SocFilterBar } from './SocFilterBar';
import { SocRawEventDrawer } from './SocRawEventDrawer';
import { SocExplorer } from './SocExplorer';

import { 
  Activity, 
  Search, 
  ShieldAlert, 
  Layers, 
  Clock, 
  Settings, 
  Globe, 
  Terminal,
  PanelLeft,
  PanelRight,
  Maximize2
} from 'lucide-react';

export const SocWorkstation: React.FC<{ onBackToMap?: () => void }> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const runtimeEvents = useSimulationStore((s) => s.events);
  
  const activeTab = useSocStore((s) => s.activeTab);
  const setActiveTab = useSocStore((s) => s.setActiveTab);
  const selectedAlertId = useSocStore((s) => s.selectedAlertId);
  const selectedEventId = useSocStore((s) => s.selectedEventId);
  const filters = useSocStore((s) => s.filters);

  // 1. Ingest, Normalize and Enrich
  const enrichedTelemetry = React.useMemo(() => {
    return runtimeEvents.map((rawEvt) => {
      const norm = normalizeRuntimeEvent({
        id: rawEvt.id,
        type: rawEvt.type,
        source: rawEvt.source,
        target: rawEvt.target,
        category: rawEvt.category,
        severity: rawEvt.severity,
        virtualTime: rawEvt.virtualTime,
        description: rawEvt.description,
        payload: (rawEvt.payload as Record<string, unknown>) || {},
      });
      return enrichTelemetryEvent(norm);
    });
  }, [runtimeEvents]);

  // 2. Detection & Triage
  const alerts = React.useMemo(() => {
    const rawAlerts = evaluateDetectionRules(enrichedTelemetry, STANDARD_DETECTION_RULES);
    // Sort by priority (score) and time
    return rawAlerts.sort((a, b) => b.createdAtVirtualTime - a.createdAtVirtualTime);
  }, [enrichedTelemetry]);

  const triagedAlerts = React.useMemo(() => {
    return alerts.map((a) => triageAlert(a, enrichedTelemetry));
  }, [alerts, enrichedTelemetry]);

  // 3. Filtering
  const filteredAlerts = React.useMemo(() => {
    return alerts.filter(a => {
      if (filters.severity.length > 0 && !filters.severity.includes(a.severity)) return false;
      return true;
    });
  }, [alerts, filters.severity]);

  const filteredEvents = React.useMemo(() => {
    return enrichedTelemetry.filter(e => {
       if (filters.sourceWorld.length > 0 && !filters.sourceWorld.includes(e.sourceWorld)) return false;
       if (filters.category.length > 0 && !filters.category.includes(e.category)) return false;
       return true;
    });
  }, [enrichedTelemetry, filters]);

  // 4. Derived State
  const activeAlert = alerts.find(a => a.id === selectedAlertId) || null;
  const activeTriage = triagedAlerts.find(t => t.alert.id === selectedAlertId) || null;
  const selectedEvent = enrichedTelemetry.find(e => e.id === selectedEventId) || null;
  
  // Related events for investigation (events from the same entities as the alert)
  const relatedEvents = React.useMemo(() => {
    if (!activeAlert) return [];
    return enrichedTelemetry.filter(e => 
      activeAlert.entities.users.some(u => e.user === u) ||
      activeAlert.entities.hosts.some(h => e.host === h) ||
      activeAlert.entities.ips.some(ip => e.sourceIp === ip || e.destinationIp === ip) ||
      activeAlert.evidenceEventIds.includes(e.id)
    ).sort((a, b) => a.virtualTime - b.virtualTime);
  }, [activeAlert, enrichedTelemetry]);

  const [isQueueVisible, setQueueVisible] = React.useState(true);
  const [isInspectorVisible, setInspectorVisible] = React.useState(true);

  // Auto-show inspector when event is selected
  React.useEffect(() => {
    if (selectedEventId) setInspectorVisible(true);
  }, [selectedEventId]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none">
      {/* Analyst Toolbar */}
      <div className="h-12 border-b border-slate-900 bg-slate-950 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 pr-4 border-r border-slate-900">
              {onBackToMap && (
                <button 
                  onClick={onBackToMap}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white mr-2 transition-colors"
                  title={isAr ? 'العودة للخريطة' : 'Back to Map'}
                >
                  <Globe className="w-4 h-4" />
                </button>
              )}
              <ShieldAlert className="w-5 h-5 text-cyan-500" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white leading-tight uppercase tracking-wider">OMEGA_SOC</span>
                 <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Workstation V2.0</span>
              </div>
           </div>

           <div className="flex items-center gap-2 pr-4 border-r border-slate-900">
              <button 
                onClick={() => setQueueVisible(!isQueueVisible)}
                className={`p-2 rounded-lg transition-colors ${isQueueVisible ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}
                title={isAr ? 'تبديل القائمة' : 'Toggle Queue'}
              >
                 <PanelLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setInspectorVisible(!isInspectorVisible)}
                className={`p-2 rounded-lg transition-colors ${isInspectorVisible ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}
                title={isAr ? 'تبديل المعاين' : 'Toggle Inspector'}
              >
                 <PanelRight className="w-4 h-4" />
              </button>
           </div>

           <nav className="flex items-center gap-1">
              <NavButton 
                active={activeTab === 'QUEUE'} 
                onClick={() => setActiveTab('QUEUE')}
                icon={Layers}
                label={isAr ? 'قائمة التنبيهات' : 'Alert Queue'}
                count={filteredAlerts.length}
              />
              <NavButton 
                active={activeTab === 'INVESTIGATION'} 
                onClick={() => setActiveTab('INVESTIGATION')}
                icon={Search}
                label={isAr ? 'التحقيق النشط' : 'Investigation'}
                disabled={!selectedAlertId}
              />
              <NavButton 
                active={activeTab === 'EXPLORER'} 
                onClick={() => setActiveTab('EXPLORER')}
                icon={Terminal}
                label={isAr ? 'مستكشف السجلات' : 'Siem Explorer'}
              />
           </nav>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-cyan-500" />
              <span className="uppercase tracking-widest">{isAr ? 'وقت المحاكاة:' : 'VIRTUAL_TIME:'}</span>
              <span className="text-white font-bold tabular-nums">{(useSimulationStore.getState().virtualTime / 1000).toFixed(2)}s</span>
           </div>
        </div>
      </div>

      {/* Filter Strip */}
      <SocFilterBar />

      {/* Main Workstation Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Alert Queue (Always accessible or collapsible) */}
        {isQueueVisible && (
          <div className="w-80 shrink-0 border-r border-slate-900 transition-all">
             <SocAlertQueue alerts={filteredAlerts} />
          </div>
        )}

        {/* Center Pane: Dynamic Workspace */}
        <div className="flex-1 min-w-0 flex flex-col bg-slate-950 border-r border-slate-900">
           {!selectedAlertId && activeTab === 'INVESTIGATION' && (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-950/80">
                <PanelLeft className="w-12 h-12 text-slate-800 mb-4" />
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Select an alert from the queue to investigate</p>
             </div>
           )}
           
           {(activeTab === 'INVESTIGATION' || activeTab === 'QUEUE') && selectedAlertId && (
             <SocInvestigationWorkspace 
               activeAlert={activeAlert} 
               activeTriage={activeTriage}
               relatedEvents={relatedEvents}
             />
           )}

           {activeTab === 'EXPLORER' && (
             <SocExplorer events={enrichedTelemetry} />
           )}
        </div>

        {/* Right Pane: Context Inspector */}
        {isInspectorVisible && (
          <div className="w-80 shrink-0">
             <SocContextInspector selectedEvent={selectedEvent} />
          </div>
        )}
      </div>

      {/* Raw Data Drawer */}
      <SocRawEventDrawer selectedEvent={selectedEvent} />
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  count?: number;
  disabled?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon: Icon, label, count, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all group ${
      active 
        ? 'bg-cyan-500/10 text-cyan-400' 
        : disabled 
          ? 'opacity-30 cursor-not-allowed text-slate-600' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
    }`}
  >
    <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'group-hover:text-slate-400'}`} />
    <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`px-1 rounded-sm text-[8px] font-mono ${active ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
        {count}
      </span>
    )}
  </button>
);
