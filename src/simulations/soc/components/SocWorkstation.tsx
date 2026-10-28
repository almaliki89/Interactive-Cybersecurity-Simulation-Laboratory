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
import { Soc3DWarRoom } from './Soc3DWarRoom';
import { SoarPlaybookStudio } from './SoarPlaybookStudio';

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
  Maximize2,
  X,
  Box,
  Workflow
} from 'lucide-react';

export const SocWorkstation: React.FC<{ onBackToMap?: () => void }> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const runtimeEvents = useSimulationStore((s) => s.events);
  
  const activeTab = useSocStore((s) => s.activeTab);
  const setActiveTab = useSocStore((s) => s.setActiveTab);
  const selectedAlertId = useSocStore((s) => s.selectedAlertId);
  const setSelectedAlertId = useSocStore((s) => s.setSelectedAlertId);
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
      // 1. Severity Filter
      if (filters.severity.length > 0 && !filters.severity.includes(a.severity)) return false;
      
      // 2. User Filter (check if any entity user matches)
      if (filters.user.length > 0 && !a.entities.users.some(u => filters.user.includes(u))) return false;

      // 3. World / Category / Outcome Filters (check if underlying evidence events match)
      if (filters.sourceWorld.length > 0 || filters.category.length > 0 || filters.outcome.length > 0) {
        const evidenceEvents = enrichedTelemetry.filter(e => a.evidenceEventIds.includes(e.id));
        
        if (filters.sourceWorld.length > 0 && !evidenceEvents.some(e => filters.sourceWorld.includes(e.sourceWorld))) return false;
        if (filters.category.length > 0 && !evidenceEvents.some(e => filters.category.includes(e.category))) return false;
        if (filters.outcome.length > 0 && !evidenceEvents.some(e => filters.outcome.includes(e.outcome || ''))) return false;
      }
      
      return true;
    });
  }, [alerts, filters, enrichedTelemetry]);

  const filteredEvents = React.useMemo(() => {
    return enrichedTelemetry.filter(e => {
       if (filters.sourceWorld.length > 0 && !filters.sourceWorld.includes(e.sourceWorld)) return false;
       if (filters.category.length > 0 && !filters.category.includes(e.category)) return false;
       if (filters.outcome.length > 0 && !filters.outcome.includes(e.outcome || '')) return false;
       if (filters.user.length > 0 && !filters.user.includes(e.user || '')) return false;
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

  // Desktop sidebar states
  const [isQueueVisible, setQueueVisible] = React.useState(true);
  const [isInspectorVisible, setInspectorVisible] = React.useState(true);

  // Mobile drawer states (mutual exclusion)
  const [isMobileQueueOpen, setMobileQueueOpen] = React.useState(false);
  const [isMobileInspectorOpen, setMobileInspectorOpen] = React.useState(false);

  // Auto-show inspector when event is selected
  React.useEffect(() => {
    if (selectedEventId) {
      setInspectorVisible(true);
      setMobileInspectorOpen(true);
      setMobileQueueOpen(false);
    }
  }, [selectedEventId]);

  // When an alert is selected on mobile, auto-close mobile queue
  React.useEffect(() => {
    if (selectedAlertId) {
      setMobileQueueOpen(false);
    }
  }, [selectedAlertId]);

  // Accessibility: Escape key dismisses mobile drawers
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileQueueOpen(false);
        setMobileInspectorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleQueue = () => {
    setQueueVisible((prev) => !prev);
    setMobileQueueOpen((prev) => !prev);
    setMobileInspectorOpen(false);
  };

  const toggleInspector = () => {
    setInspectorVisible((prev) => !prev);
    setMobileInspectorOpen((prev) => !prev);
    setMobileQueueOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none">
      {/* Analyst Toolbar */}
      <div data-testid="soc-mobile-toolbar" className="h-12 border-b border-slate-900 bg-slate-950 px-4 flex items-center justify-between shrink-0 z-20 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 sm:gap-6">
           <div className="flex items-center gap-2 pr-3 sm:pr-4 border-r rtl:border-r-0 rtl:border-l border-slate-900 shrink-0">
              {onBackToMap && (
                <button 
                  onClick={onBackToMap}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white mr-1 sm:mr-2 rtl:mr-0 rtl:ml-1 sm:rtl:ml-2 transition-colors"
                  title={isAr ? 'العودة للخريطة' : 'Back to Map'}
                  aria-label={isAr ? 'العودة للخريطة' : 'Back to Map'}
                >
                  <Globe className="w-4 h-4" />
                </button>
              )}
              <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white leading-tight uppercase tracking-wider">OMEGA_SOC</span>
                 <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">Workstation V2.0</span>
              </div>
           </div>

           <div className="flex items-center gap-1.5 sm:gap-2 pr-3 sm:pr-4 border-r rtl:border-r-0 rtl:border-l border-slate-900 shrink-0">
              <button 
                onClick={toggleQueue}
                data-testid="soc-toggle-queue-btn"
                className={`p-2 min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center transition-colors ${
                  isMobileQueueOpen || isQueueVisible ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title={isAr ? 'تبديل القائمة' : 'Toggle Queue'}
                aria-label={isAr ? 'تبديل القائمة' : 'Toggle Queue'}
              >
                 <PanelLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={toggleInspector}
                data-testid="soc-toggle-inspector-btn"
                className={`p-2 min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center transition-colors ${
                  isMobileInspectorOpen || isInspectorVisible ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title={isAr ? 'تبديل المعاين' : 'Toggle Inspector'}
                aria-label={isAr ? 'تبديل المعاين' : 'Toggle Inspector'}
              >
                 <PanelRight className="w-4 h-4" />
              </button>
           </div>

           <nav className="flex items-center gap-1 shrink-0">
              <NavButton 
                active={activeTab === 'QUEUE'} 
                onClick={() => setActiveTab('QUEUE')}
                icon={Layers}
                label={isAr ? 'التنبيهات' : 'Alert Queue'}
                count={filteredAlerts.length}
              />
              <NavButton 
                active={activeTab === 'INVESTIGATION'} 
                onClick={() => setActiveTab('INVESTIGATION')}
                icon={Search}
                label={isAr ? 'التحقيق' : 'Investigation'}
                disabled={!selectedAlertId}
              />
              <NavButton 
                active={activeTab === 'EXPLORER'} 
                onClick={() => setActiveTab('EXPLORER')}
                icon={Terminal}
                label={isAr ? 'المستكشف' : 'Explorer'}
              />
              <NavButton 
                active={activeTab === 'WAR_ROOM_3D'} 
                onClick={() => setActiveTab('WAR_ROOM_3D')}
                icon={Box}
                label={isAr ? 'غرفة العمليات 3D' : '3D War Room'}
              />
              <NavButton 
                active={activeTab === 'PLAYBOOK_STUDIO'} 
                onClick={() => setActiveTab('PLAYBOOK_STUDIO')}
                icon={Workflow}
                label={isAr ? 'أتمتة SOAR' : 'SOAR Studio'}
              />
           </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
           <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span className="uppercase tracking-widest hidden sm:inline">{isAr ? 'وقت المحاكاة:' : 'VIRTUAL_TIME:'}</span>
              <span className="text-white font-bold tabular-nums" dir="ltr">{(useSimulationStore.getState().virtualTime / 1000).toFixed(2)}s</span>
           </div>
        </div>
      </div>

      {/* Filter Strip */}
      <SocFilterBar />

      {/* Main Workstation Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Desktop Alert Queue */}
        {isQueueVisible && (
          <div data-testid="soc-alert-queue" className="w-80 shrink-0 border-r rtl:border-r-0 rtl:border-l border-slate-900 transition-all hidden lg:block">
             <SocAlertQueue alerts={filteredAlerts} />
          </div>
        )}

        {/* Mobile Alert Queue Drawer Overlay */}
        {isMobileQueueOpen && (
          <div data-testid="soc-mobile-queue-drawer" className="absolute inset-0 z-40 bg-black/80 flex lg:hidden">
            <div className="w-80 max-w-[calc(100vw-3rem)] bg-slate-950 h-full border-r rtl:border-r-0 rtl:border-l border-slate-800 flex flex-col relative animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
              <button 
                onClick={() => setMobileQueueOpen(false)}
                className="absolute top-3 right-3 rtl:right-auto rtl:left-3 p-1.5 rounded-lg text-slate-400 hover:text-white z-10"
                aria-label="Close Alert Queue"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 overflow-y-auto pt-4">
                <SocAlertQueue alerts={filteredAlerts} />
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileQueueOpen(false)} />
          </div>
        )}

        {/* Center Pane: Dynamic Workspace */}
        <div data-testid="soc-investigation-pane" className="flex-1 min-w-0 flex flex-col bg-slate-950 border-r rtl:border-r-0 rtl:border-l border-slate-900">
           {/* Mobile view when QUEUE tab is active and no alert selected */}
           {activeTab === 'QUEUE' && !selectedAlertId && (
             <div className="flex-1 flex flex-col overflow-hidden lg:hidden">
               <SocAlertQueue alerts={filteredAlerts} />
             </div>
           )}

           {/* Desktop view when QUEUE tab is active and no alert selected */}
           {activeTab === 'QUEUE' && !selectedAlertId && (
             <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-8 sm:p-12 text-center bg-slate-950/80">
                <PanelLeft className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  {isAr ? 'اختر تنبيهاً من القائمة لبدء التحقيق' : 'Select an alert from the queue to investigate'}
                </p>
             </div>
           )}

           {!selectedAlertId && activeTab === 'INVESTIGATION' && (
             <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-slate-950/80">
                <PanelLeft className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{isAr ? 'اختر تنبيهاً من القائمة لبدء التحقيق' : 'Select an alert from the queue to investigate'}</p>
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

           {activeTab === 'WAR_ROOM_3D' && (
             <div className="flex-1 w-full h-full">
               <Soc3DWarRoom 
                 alerts={filteredAlerts}
                 triagedAlerts={triagedAlerts}
                 onSelectAlert={(alertId) => setSelectedAlertId(alertId)}
               />
             </div>
           )}

           {activeTab === 'PLAYBOOK_STUDIO' && (
             <SoarPlaybookStudio />
           )}
        </div>

        {/* Right Pane: Desktop Context Inspector */}
        {isInspectorVisible && (
          <div data-testid="soc-inspector" className="w-80 shrink-0 border-l rtl:border-l-0 rtl:border-r border-slate-900 transition-all hidden lg:block">
             <SocContextInspector selectedEvent={selectedEvent} />
          </div>
        )}

        {/* Mobile Context Inspector Drawer Overlay */}
        {isMobileInspectorOpen && (
          <div data-testid="soc-mobile-inspector-drawer" className="absolute inset-0 z-40 bg-black/80 flex lg:hidden justify-end rtl:justify-start">
            <div className="flex-1" onClick={() => setMobileInspectorOpen(false)} />
            <div className="w-80 max-w-[calc(100vw-3rem)] bg-slate-950 h-full border-l rtl:border-l-0 rtl:border-r border-slate-800 flex flex-col relative animate-in slide-in-from-right rtl:slide-in-from-left duration-200">
              <button 
                onClick={() => setMobileInspectorOpen(false)}
                className="absolute top-3 left-3 rtl:left-auto rtl:right-3 p-1.5 rounded-lg text-slate-400 hover:text-white z-10"
                aria-label="Close Context Inspector"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 overflow-y-auto pt-4">
                <SocContextInspector selectedEvent={selectedEvent} />
              </div>
            </div>
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
