import React, { useEffect } from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { HuntNavigator } from './HuntNavigator';
import { HypothesisPanel } from './HypothesisPanel';
import { TelemetryExplorer } from './TelemetryExplorer';
import { HuntQueryEditor } from './HuntQueryEditor';
import { CorrelationWorkspace } from './CorrelationWorkspace';
import { ThreatIntelPanel } from './ThreatIntelPanel';
import { FindingsPanel } from './FindingsPanel';
import { DetectionBuilder } from './DetectionBuilder';
import { MasterChallengeView } from './MasterChallengeView';
import { HuntInspector } from './HuntInspector';
import { HuntBottomDrawer } from './HuntBottomDrawer';
import {
  Crosshair,
  Lightbulb,
  Database,
  Search,
  GitCommit,
  Eye,
  FileCheck,
  Sliders,
  Award,
  Menu,
  SlidersHorizontal,
  ChevronUp,
  Box,
} from 'lucide-react';
import { Threat3DMatrixStage } from './Threat3DMatrixStage';

interface ThreatHuntingWorkspaceProps {
  language: 'ar' | 'en';
}

export const ThreatHuntingWorkspace: React.FC<ThreatHuntingWorkspaceProps> = ({ language }) => {
  const activeTab = useThreatHuntingStore((s) => s.activeTab);
  const setActiveTab = useThreatHuntingStore((s) => s.setActiveTab);
  const isMobileNavOpen = useThreatHuntingStore((s) => s.isMobileNavOpen);
  const isMobileInspectorOpen = useThreatHuntingStore((s) => s.isMobileInspectorOpen);
  const toggleMobileNav = useThreatHuntingStore((s) => s.toggleMobileNav);
  const toggleMobileInspector = useThreatHuntingStore((s) => s.toggleMobileInspector);
  const closeMobileDrawers = useThreatHuntingStore((s) => s.closeMobileDrawers);
  const isBottomDrawerOpen = useThreatHuntingStore((s) => s.isBottomDrawerOpen);
  const setBottomDrawer = useThreatHuntingStore((s) => s.setBottomDrawer);

  const isAr = language === 'ar';

  // Handle Escape key to close mobile drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileDrawers();
        setBottomDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMobileDrawers, setBottomDrawer]);

  const tabs = [
    { id: 'HYPOTHESIS' as const, labelEn: 'Hypothesis', labelAr: 'الفرضية', icon: Lightbulb },
    { id: 'TELEMETRY' as const, labelEn: 'Telemetry', labelAr: 'السجلات', icon: Database },
    { id: 'QUERY' as const, labelEn: 'Query Engine', labelAr: 'الاستعلامات', icon: Search },
    { id: 'CORRELATION' as const, labelEn: 'Correlation', labelAr: 'الترابط السلوكي', icon: GitCommit },
    { id: 'THREAT_INTEL' as const, labelEn: 'Threat Intel', labelAr: 'الاستخبارات', icon: Eye },
    { id: 'FINDINGS' as const, labelEn: 'Findings', labelAr: 'النتائج', icon: FileCheck },
    { id: 'DETECTION' as const, labelEn: 'Detection Rules', labelAr: 'قواعد الكشف', icon: Sliders },
    { id: 'MATRIX_3D' as const, labelEn: '3D Attack Graph', labelAr: 'مصفوفة الهجوم 3D', icon: Box },
    { id: 'MASTER' as const, labelEn: 'Master Hunt', labelAr: 'التحدي الشامل', icon: Award },
  ];

  return (
    <div
      data-testid="threat-hunting-workspace"
      className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none"
    >
      {/* Mobile Action Toolbar */}
      <div
        data-testid="hunt-mobile-toolbar"
        className="h-12 border-b border-slate-900 bg-slate-950 px-3 flex items-center justify-between shrink-0 z-20 overflow-x-auto no-scrollbar lg:hidden"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMobileNav}
            data-testid="hunt-mobile-nav-btn"
            className="p-2 min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title={isAr ? 'قائمة السيناريوهات' : 'Scenarios Menu'}
            aria-label={isAr ? 'قائمة السيناريوهات' : 'Scenarios Menu'}
          >
            <Menu className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-white tracking-tight truncate max-w-[150px]">
            {isAr ? 'صيد التهديدات V16' : 'Threat Hunting V16'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setBottomDrawer(!isBottomDrawerOpen)}
            data-testid="hunt-mobile-bottom-btn"
            className="p-2 min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title={isAr ? 'اللوحة السفلية' : 'Bottom Drawer'}
            aria-label={isAr ? 'اللوحة السفلية' : 'Bottom Drawer'}
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            onClick={toggleMobileInspector}
            data-testid="hunt-mobile-inspector-btn"
            className="p-2 min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 text-cyan-400 hover:text-white flex items-center justify-center transition-colors"
            title={isAr ? 'معاين السياق' : 'Context Inspector'}
            aria-label={isAr ? 'معاين السياق' : 'Context Inspector'}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Desktop Grid & Center Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Desktop Hunt Navigator */}
        <div data-testid="hunt-left-navigator" className="w-72 shrink-0 hidden lg:block h-full">
          <HuntNavigator language={language} />
        </div>

        {/* Mobile Left Drawer Sheet */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div
              data-testid="hunt-mobile-nav-drawer"
              className="w-72 max-w-[85vw] h-full bg-slate-950 border-r rtl:border-r-0 rtl:border-l border-slate-800 shadow-2xl relative"
            >
              <HuntNavigator language={language} />
            </div>
            <div className="flex-1" onClick={closeMobileDrawers} />
          </div>
        )}

        {/* Center Stage: Workspace & Tab Engine */}
        <div className="flex-1 min-w-0 flex flex-col bg-slate-950 overflow-hidden">
          {/* Main Stage Tab Navigation Bar */}
          <div className="h-12 border-b border-slate-900 bg-slate-900/30 px-3 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`tab-${tab.id.toLowerCase()}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Viewport */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'HYPOTHESIS' && <HypothesisPanel language={language} />}
            {activeTab === 'TELEMETRY' && <TelemetryExplorer language={language} />}
            {activeTab === 'QUERY' && <HuntQueryEditor language={language} />}
            {activeTab === 'CORRELATION' && <CorrelationWorkspace language={language} />}
            {activeTab === 'THREAT_INTEL' && <ThreatIntelPanel language={language} />}
            {activeTab === 'FINDINGS' && <FindingsPanel language={language} />}
            {activeTab === 'DETECTION' && <DetectionBuilder language={language} />}
            {activeTab === 'MATRIX_3D' && <Threat3DMatrixStage />}
            {activeTab === 'MASTER' && <MasterChallengeView language={language} />}
          </div>

          {/* Bottom Expandable Drawer */}
          <HuntBottomDrawer language={language} />
        </div>

        {/* Right Pane: Desktop Context Inspector */}
        <div data-testid="hunt-right-inspector" className="w-80 shrink-0 hidden xl:block h-full">
          <HuntInspector language={language} />
        </div>

        {/* Mobile Right Drawer Sheet */}
        {isMobileInspectorOpen && (
          <div className="fixed inset-0 z-40 flex justify-end xl:hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="flex-1" onClick={closeMobileDrawers} />
            <div
              data-testid="hunt-mobile-inspector-drawer"
              className="w-80 max-w-[85vw] h-full bg-slate-950 border-l rtl:border-l-0 rtl:border-r border-slate-800 shadow-2xl relative"
            >
              <HuntInspector language={language} onClose={closeMobileDrawers} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
