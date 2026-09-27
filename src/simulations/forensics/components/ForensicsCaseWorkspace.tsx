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
  
  // Desktop sidebar states
  const [isEvidenceBoardVisible, setEvidenceBoardVisible] = useState(true);
  const [isInspectorVisible, setInspectorVisible] = useState(true);
  
  // Separate Mobile Drawer States (Default Closed, mutual exclusion to prevent stacking)
  const [isMobileNavigatorOpen, setMobileNavigatorOpen] = useState(false);
  const [isMobileEvidenceOpen, setMobileEvidenceOpen] = useState(false);
  const [isMobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [isMobileTechOpen, setMobileTechOpen] = useState(false);
  
  const selectedEvidenceId = useForensicsStore((s) => s.selectedEvidenceId);

  // Auto-show inspector when evidence is selected
  useEffect(() => {
    if (selectedEvidenceId) {
      setInspectorVisible(true);
      setMobileInspectorOpen(true);
      setMobileNavigatorOpen(false);
      setMobileEvidenceOpen(false);
      setMobileTechOpen(false);
    }
  }, [selectedEvidenceId]);

  // Accessibility: Escape key dismisses open mobile drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavigatorOpen(false);
        setMobileEvidenceOpen(false);
        setMobileInspectorOpen(false);
        setMobileTechOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMobileNavigator = () => {
    setMobileNavigatorOpen(!isMobileNavigatorOpen);
    setMobileEvidenceOpen(false);
    setMobileInspectorOpen(false);
    setMobileTechOpen(false);
  };

  const toggleMobileEvidence = () => {
    setMobileEvidenceOpen(!isMobileEvidenceOpen);
    setMobileNavigatorOpen(false);
    setMobileInspectorOpen(false);
    setMobileTechOpen(false);
  };

  const toggleMobileInspector = () => {
    setMobileInspectorOpen(!isMobileInspectorOpen);
    setMobileNavigatorOpen(false);
    setMobileEvidenceOpen(false);
    setMobileTechOpen(false);
  };

  const toggleMobileTech = () => {
    setMobileTechOpen(!isMobileTechOpen);
    setMobileNavigatorOpen(false);
    setMobileEvidenceOpen(false);
    setMobileInspectorOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none">
      {/* 1. Header */}
      <ForensicsCaseHeader />

      {/* 2. Top Toolbar (Controls for Panels & Drawers) */}
      <div className="h-10 border-b border-slate-900 bg-slate-950 px-4 flex items-center justify-between shrink-0 z-10">
         <div className="flex items-center gap-2">
            <button 
              onClick={toggleMobileNavigator}
              data-testid="toggle-navigator-btn"
              className={`sm:hidden p-2 rounded-lg transition-colors ${isMobileNavigatorOpen ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
              title={isAr ? 'قائمة المراحل' : 'Toggle Phases'}
              aria-label={isAr ? 'قائمة المراحل' : 'Toggle Phases'}
            >
               <Menu className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={toggleMobileEvidence}
              data-testid="toggle-evidence-btn"
              className={`p-2 rounded-lg transition-colors ${isMobileEvidenceOpen || isEvidenceBoardVisible ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
              title={isAr ? 'تبديل لوحة الأدلة' : 'Toggle Evidence Board'}
              aria-label={isAr ? 'تبديل لوحة الأدلة' : 'Toggle Evidence Board'}
            >
               <Database className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={toggleMobileInspector}
              data-testid="toggle-inspector-btn"
              className={`p-2 rounded-lg transition-colors ${isMobileInspectorOpen || isInspectorVisible ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
              title={isAr ? 'تبديل المعاين' : 'Toggle Inspector'}
              aria-label={isAr ? 'تبديل المعاين' : 'Toggle Inspector'}
            >
               <Search className="w-3.5 h-3.5" />
            </button>
         </div>

         <div className="flex items-center gap-2">
            <button 
              onClick={toggleMobileTech}
              data-testid="toggle-tech-btn"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${isMobileTechOpen ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
              aria-label={isAr ? 'البيانات التقنية' : 'TECH_DATA'}
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
        {isMobileNavigatorOpen && (
          <div data-testid="mobile-navigator-drawer" className="absolute inset-0 z-40 bg-black/80 flex sm:hidden">
            <div className="w-64 max-w-[calc(100vw-3rem)] bg-slate-950 h-full border-r rtl:border-r-0 rtl:border-l border-slate-800 flex flex-col relative animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
              <button 
                onClick={() => setMobileNavigatorOpen(false)}
                className="absolute top-3 right-3 rtl:right-auto rtl:left-3 p-1.5 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close Navigator"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 overflow-y-auto pt-6">
                <ForensicsPhaseNavigator />
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileNavigatorOpen(false)} />
          </div>
        )}

        {/* Left-ish: Evidence Board (Collapsible Desktop / Drawer Mobile) */}
        {isEvidenceBoardVisible && (
          <div className="w-72 shrink-0 border-r rtl:border-r-0 rtl:border-l border-slate-900 transition-all hidden md:block">
             <ForensicsEvidenceBoard />
          </div>
        )}

        {/* Mobile Evidence Drawer Overlay */}
        {isMobileEvidenceOpen && (
          <div data-testid="mobile-evidence-drawer" className="absolute inset-0 z-40 bg-black/80 flex md:hidden">
            <div className="w-72 max-w-[calc(100vw-3rem)] bg-slate-950 h-full border-r rtl:border-r-0 rtl:border-l border-slate-800 flex flex-col relative animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
              <button 
                onClick={() => setMobileEvidenceOpen(false)}
                className="absolute top-3 right-3 rtl:right-auto rtl:left-3 p-1.5 rounded-lg text-slate-400 hover:text-white z-10"
                aria-label="Close Evidence Board"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 overflow-y-auto pt-6">
                <ForensicsEvidenceBoard />
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileEvidenceOpen(false)} />
          </div>
        )}

        {/* Center: Content Workspace */}
        <div className="flex-1 min-w-0 flex flex-col bg-slate-950 overflow-hidden relative">
           {children}
        </div>

        {/* Right: Inspector (Collapsible Desktop) */}
        {isInspectorVisible && (
          <div className="w-80 shrink-0 hidden lg:block border-l rtl:border-l-0 rtl:border-r border-slate-900">
             <ForensicsEvidenceInspector />
          </div>
        )}

        {/* Mobile/Tablet Inspector Drawer Overlay */}
        {isMobileInspectorOpen && (
          <div data-testid="mobile-inspector-drawer" className="absolute inset-0 z-40 bg-black/80 flex lg:hidden justify-end rtl:justify-start">
            <div className="flex-1" onClick={() => setMobileInspectorOpen(false)} />
            <div className="w-80 max-w-[calc(100vw-3rem)] bg-slate-950 h-full border-l rtl:border-l-0 rtl:border-r border-slate-800 flex flex-col relative animate-in slide-in-from-right rtl:slide-in-from-left duration-200">
              <button 
                onClick={() => setMobileInspectorOpen(false)}
                className="absolute top-3 left-3 rtl:left-auto rtl:right-3 p-1.5 rounded-lg text-slate-400 hover:text-white z-10"
                aria-label="Close Inspector"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 overflow-y-auto pt-6">
                <ForensicsEvidenceInspector />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Technical Drawer Overlay */}
        <ForensicsTechnicalDrawer isOpen={isMobileTechOpen} onClose={() => setMobileTechOpen(false)} />
      </div>
    </div>
  );
};
