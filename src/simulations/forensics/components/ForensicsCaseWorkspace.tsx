import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useForensicsStore } from '../../../stores/forensicsStore';
import { ForensicsCaseHeader } from './ForensicsCaseHeader';
import { ForensicsPhaseNavigator } from './ForensicsPhaseNavigator';
import { ForensicsEvidenceBoard } from './ForensicsEvidenceBoard';
import { ForensicsEvidenceInspector } from './ForensicsEvidenceInspector';
import { ForensicsTechnicalDrawer } from './ForensicsTechnicalDrawer';
import { PanelBottom, Database, Search } from 'lucide-react';

export const ForensicsCaseWorkspace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const [isEvidenceBoardVisible, setEvidenceBoardVisible] = React.useState(true);
  const [isInspectorVisible, setInspectorVisible] = React.useState(true);
  const [isDrawerOpen, setDrawerOpen] = React.useState(false);
  
  const selectedEvidenceId = useForensicsStore((s) => s.selectedEvidenceId);

  // Auto-show inspector when evidence is selected
  React.useEffect(() => {
    if (selectedEvidenceId) setInspectorVisible(true);
  }, [selectedEvidenceId]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none">
      {/* 1. Header */}
      <ForensicsCaseHeader />

      {/* 2. Top Toolbar (Controls for Panels) */}
      <div className="h-10 border-b border-slate-900 bg-slate-950 px-4 flex items-center justify-between shrink-0 z-10">
         <div className="flex items-center gap-2">
            <button 
              onClick={() => setEvidenceBoardVisible(!isEvidenceBoardVisible)}
              className={`p-2 rounded-lg transition-colors ${isEvidenceBoardVisible ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}
              title={isAr ? 'تبديل لوحة الأدلة' : 'Toggle Evidence Board'}
            >
               <Database className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setInspectorVisible(!isInspectorVisible)}
              className={`p-2 rounded-lg transition-colors ${isInspectorVisible ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}
              title={isAr ? 'تبديل المعاين' : 'Toggle Inspector'}
            >
               <Search className="w-3.5 h-3.5" />
            </button>
         </div>

         <div className="flex items-center gap-2">
            <button 
              onClick={() => setDrawerOpen(!isDrawerOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${isDrawerOpen ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}
            >
               <PanelBottom className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">{isAr ? 'البيانات التقنية' : 'TECH_DATA'}</span>
            </button>
         </div>
      </div>

      {/* 3. Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Navigator */}
        <div className="hidden sm:block">
          <ForensicsPhaseNavigator />
        </div>

        {/* Left-ish: Evidence Board (Collapsible) */}
        {isEvidenceBoardVisible && (
          <div className="w-72 shrink-0 border-r border-slate-900 transition-all hidden md:block">
             <ForensicsEvidenceBoard />
          </div>
        )}

        {/* Center: Content Workspace */}
        <div className="flex-1 min-w-0 flex flex-col bg-slate-950 overflow-hidden relative">
           {children}
        </div>

        {/* Right: Inspector (Collapsible) */}
        {isInspectorVisible && (
          <div className="w-80 shrink-0 hidden lg:block">
             <ForensicsEvidenceInspector />
          </div>
        )}

        {/* Bottom Drawer Overlay */}
        <ForensicsTechnicalDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
};
