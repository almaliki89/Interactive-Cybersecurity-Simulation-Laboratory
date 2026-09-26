import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useForensicsStore } from '../../../stores/forensicsStore';
import { ForensicsCaseHeader } from './ForensicsCaseHeader';
import { ForensicsPhaseNavigator } from './ForensicsPhaseNavigator';
import { ForensicsEvidenceBoard } from './ForensicsEvidenceBoard';
import { ForensicsEvidenceInspector } from './ForensicsEvidenceInspector';
import { ForensicsTechnicalDrawer } from './ForensicsTechnicalDrawer';
import { PanelBottom, Database, Search, Menu, X } from 'lucide-react';

export const ForensicsCaseWorkspace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const [isEvidenceBoardVisible, setEvidenceBoardVisible] = useState(true);
  const [isInspectorVisible, setInspectorVisible] = useState(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isNavigatorDrawerOpen, setNavigatorDrawerOpen] = useState(false);
  
  const selectedEvidenceId = useForensicsStore((s) => s.selectedEvidenceId);

  // Auto-show inspector when evidence is selected
  useEffect(() => {
    if (selectedEvidenceId) setInspectorVisible(true);
  }, [selectedEvidenceId]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none">
      {/* 1. Header */}
      <ForensicsCaseHeader />

      {/* 2. Top Toolbar (Controls for Panels & Drawers) */}
      <div className="h-10 border-b border-slate-900 bg-slate-950 px-4 flex items-center justify-between shrink-0 z-10">
         <div className="flex items-center gap-2">
            <button 
              onClick={() => setNavigatorDrawerOpen(!isNavigatorDrawerOpen)}
              className="sm:hidden p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
              title={isAr ? 'قائمة المراحل' : 'Toggle Phases'}
            >
               <Menu className="w-3.5 h-3.5" />
            </button>
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
        {/* Left: Navigator (Desktop) */}
        <div className="hidden sm:block">
          <ForensicsPhaseNavigator />
        </div>

        {/* Mobile Navigator Drawer Overlay */}
        {isNavigatorDrawerOpen && (
          <div className="absolute inset-0 z-40 bg-black/80 flex sm:hidden">
            <div className="w-64 bg-slate-950 h-full border-r border-slate-800 flex flex-col relative">
              <button 
                onClick={() => setNavigatorDrawerOpen(false)}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 overflow-y-auto pt-6">
                <ForensicsPhaseNavigator />
              </div>
            </div>
            <div className="flex-1" onClick={() => setNavigatorDrawerOpen(false)} />
          </div>
        )}

        {/* Left-ish: Evidence Board (Collapsible Desktop / Drawer Mobile) */}
        {isEvidenceBoardVisible && (
          <>
            {/* Desktop Sidebar */}
            <div className="w-72 shrink-0 border-r border-slate-900 transition-all hidden md:block">
               <ForensicsEvidenceBoard />
            </div>

            {/* Mobile/Tablet Drawer Overlay */}
            <div className="absolute inset-0 z-40 bg-black/80 flex md:hidden">
              <div className="w-72 bg-slate-950 h-full border-r border-slate-800 flex flex-col relative">
                <button 
                  onClick={() => setEvidenceBoardVisible(false)}
                  className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex-1 overflow-y-auto pt-6">
                  <ForensicsEvidenceBoard />
                </div>
              </div>
              <div className="flex-1" onClick={() => setEvidenceBoardVisible(false)} />
            </div>
          </>
        )}

        {/* Center: Content Workspace */}
        <div className="flex-1 min-w-0 flex flex-col bg-slate-950 overflow-hidden relative">
           {children}
        </div>

        {/* Right: Inspector (Collapsible Desktop / Drawer Mobile/Tablet) */}
        {isInspectorVisible && (
          <>
            {/* Desktop Sidebar */}
            <div className="w-80 shrink-0 hidden lg:block border-l border-slate-900">
               <ForensicsEvidenceInspector />
            </div>

            {/* Mobile/Tablet Drawer Overlay */}
            <div className="absolute inset-0 z-40 bg-black/80 flex lg:hidden justify-end">
              <div className="flex-1" onClick={() => setInspectorVisible(false)} />
              <div className="w-80 bg-slate-950 h-full border-l border-slate-800 flex flex-col relative">
                <button 
                  onClick={() => setInspectorVisible(false)}
                  className="absolute top-3 left-3 p-1 text-slate-400 hover:text-white z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex-1 overflow-y-auto pt-6">
                  <ForensicsEvidenceInspector />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bottom Drawer Overlay */}
        <ForensicsTechnicalDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
};
