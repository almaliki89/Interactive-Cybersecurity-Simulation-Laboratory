import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import { Timeline } from './Timeline';
import { Inspector } from './Inspector';
import { ChallengePanel } from '../challenges/ChallengePanel';
import { Challenge } from '../../types/simulation';
import {
  PanelLeft,
  PanelRight,
  Layers,
  Sliders,
  Compass,
  ArrowRight,
  ArrowLeft,
  Eye,
  Activity,
  HelpCircle,
  Sparkles,
  Zap,
  RotateCcw,
  Play,
  Pause,
  StepForward,
  Shield,
  Search,
  X,
} from 'lucide-react';

interface WorkspaceProps {
  title: string;
  subtitle?: string;
  domainName?: string;
  challenge?: Challenge;
  onValidateChallenge?: () => { success: boolean; message: string };
  onRestart?: () => void;
  onBackToHub?: () => void;
  onStep?: () => void;
  controlDeck?: React.ReactNode;
  children: React.ReactNode; // The simulation canvas / interactive stage
}

export const Workspace: React.FC<WorkspaceProps> = ({
  title,
  subtitle,
  domainName,
  challenge,
  onValidateChallenge,
  onRestart,
  onBackToHub,
  onStep,
  controlDeck,
  children,
}) => {
  const language = useSimulationStore((s) => s.language);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const activeWorkspaceLayer = useSimulationStore((s) => s.activeWorkspaceLayer);
  const setActiveWorkspaceLayer = useSimulationStore((s) => s.setActiveWorkspaceLayer);
  const followedPacketId = useSimulationStore((s) => s.followedPacketId);
  const setFollowedPacketId = useSimulationStore((s) => s.setFollowedPacketId);
  const tracedEventId = useSimulationStore((s) => s.tracedEventId);
  const setTracedEventId = useSimulationStore((s) => s.setTracedEventId);
  const explanationState = useSimulationStore((s) => s.explanationState);
  const setExplanation = useSimulationStore((s) => s.setExplanation);
  const whatChanged = useSimulationStore((s) => s.whatChanged);
  const setWhatChanged = useSimulationStore((s) => s.setWhatChanged);
  const selectedEntity = useSimulationStore((s) => s.selectedEntity);
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  const t = translations[language];

  const [leftOpen, setLeftOpen] = useState(!!challenge);
  const [rightOpen, setRightOpen] = useState(!!selectedEntity);

  // Smart Panel Logic: Auto-open inspector on selection
  React.useEffect(() => {
    if (selectedEntity) {
      setRightOpen(true);
    }
  }, [selectedEntity]);

  // Sync left panel with challenge availability
  React.useEffect(() => {
    if (challenge) {
      setLeftOpen(true);
    }
  }, [challenge]);

  // Accessibility: Escape key dismisses open mobile panels
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLeftOpen(false);
        setRightOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const layers: Array<{
    id: 'network' | 'application' | 'identity' | 'security' | 'logs' | 'infrastructure';
    nameAr: string;
    nameEn: string;
  }> = [
    { id: 'network', nameAr: 'الشبكة', nameEn: 'Network' },
    { id: 'application', nameAr: 'التطبيقات', nameEn: 'Application' },
    { id: 'identity', nameAr: 'الهوية', nameEn: 'Identity' },
    { id: 'security', nameAr: 'الأمان', nameEn: 'Security' },
    { id: 'logs', nameAr: 'السجلات', nameEn: 'Logs' },
    { id: 'infrastructure', nameAr: 'البنية', nameEn: 'Infra' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 select-none font-sans">
      {/* 1. Technical Toolbar (Consolidated) */}
      <div className="h-9 border-b border-slate-900 bg-slate-900/20 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 overflow-x-auto no-scrollbar">
        {/* Left: Domain Context Indicator & Optional Navigation */}
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <>
              <button
                onClick={onBackToHub}
                className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest group shrink-0"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform rtl:rotate-180" />
                <span>{language === 'ar' ? 'العودة للمركز' : 'Hub'}</span>
              </button>
              <div className="h-3 w-px bg-slate-800" />
            </>
          )}
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-widest shrink-0">
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">{language === 'ar' ? 'نمط العمل:' : 'MODE:'}</span>
            <span className="text-slate-200 font-bold">{domainName || 'GENERAL'}</span>
          </div>
          
          <div className="h-3 w-px bg-slate-800" />

          {/* Layer Switcher - Compact Segmented Control */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-md border border-slate-800/60 shrink-0">
            {layers.map((l) => {
              const isSelected = activeWorkspaceLayer === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveWorkspaceLayer(l.id)}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded transition-all uppercase ${
                    isSelected
                      ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ar' ? l.nameAr : l.nameEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Smart Panel Toggles */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2 rtl:ml-0 rtl:mr-2">
          {challenge && (
            <button
              onClick={() => setLeftOpen((prev) => !prev)}
              className={`h-6 px-2.5 rounded border transition-all flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-tighter ${
                leftOpen
                  ? 'bg-slate-800 border-slate-700 text-cyan-400 font-bold'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PanelLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Objectives</span>
            </button>
          )}

          <button
            onClick={() => setRightOpen((prev) => !prev)}
            className={`h-6 px-2.5 rounded border transition-all flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-tighter ${
              rightOpen
                ? 'bg-slate-800 border-slate-700 text-cyan-400 font-bold'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PanelRight className="w-3 h-3" />
            <span className="hidden sm:inline">Inspector</span>
          </button>
        </div>
      </div>

      {/* 2. Passive Awareness Strip (High Precision) */}
      <div className="h-6 border-b border-slate-900 bg-slate-950/40 px-4 flex items-center justify-between text-[9px] text-slate-500 font-mono select-none shrink-0 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 border border-emerald-500" />
            <span className="text-slate-600 uppercase font-bold">STATE:</span>
            <span className="text-emerald-500 uppercase font-bold">MONITORED</span>
          </div>
          <div className="w-px h-2 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 uppercase font-bold">TARGET:</span>
            <span className="text-slate-300 font-bold uppercase truncate max-w-[200px]">
              {selectedEntity ? `${selectedEntity.type}#${selectedEntity.id}` : 'NULL_POINTER'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-purple-500" />
            <span className="text-slate-600 font-bold">EVENT_BUS:</span>
            <span className="text-purple-400 font-bold">LISTENING</span>
          </div>
          <div className="w-px h-2 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">SESSION:</span>
            <span className="text-slate-400 font-bold">{(virtualTime / 1000).toFixed(2)}s</span>
          </div>
        </div>
      </div>

      {/* 2. Signature Active Banners (Follow Packet / Traced Event / Why? / What Changed?) */}
      {(followedPacketId || tracedEventId || (explanationState && explanationState.visible) || (whatChanged && whatChanged.visible)) && (
        <div className="bg-slate-950 border-b border-slate-900 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs z-10 animate-in fade-in duration-100 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {followedPacketId && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-[10px]">
                <Eye className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>{language === 'ar' ? `تتبع مسار الحزمة [${followedPacketId}]` : `Following Packet [${followedPacketId}]`}</span>
                <button
                  onClick={() => setFollowedPacketId(null)}
                  className="text-cyan-400 hover:text-white font-bold ms-1"
                >
                  ✕
                </button>
              </div>
            )}

            {tracedEventId && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono text-[10px]">
                <Activity className="w-3 h-3 text-purple-400" />
                <span>{language === 'ar' ? `تتبع السلسلة السببية للحدث [${tracedEventId}]` : `Tracing Event Cause [${tracedEventId}]`}</span>
                <button
                  onClick={() => setTracedEventId(null)}
                  className="text-purple-400 hover:text-white font-bold ms-1"
                >
                  ✕
                </button>
              </div>
            )}

            {explanationState && explanationState.visible && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-200 text-[10px]">
                <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="font-bold font-mono">[{explanationState.title}]:</span>
                <span>{explanationState.reason}</span>
                <button
                  onClick={() => setExplanation(null)}
                  className="text-amber-400 hover:text-white font-bold ms-1"
                >
                  ✕
                </button>
              </div>
            )}

            {whatChanged && whatChanged.visible && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 text-[10px]">
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="font-bold text-cyan-400">{language === 'ar' ? 'ماذا تغير؟' : 'WHAT CHANGED:'}</span>
                <span>{whatChanged.after}</span>
                <button
                  onClick={() => setWhatChanged(null)}
                  className="text-slate-400 hover:text-white font-bold ms-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Body (Split 3 panes with responsive layout rules) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Challenge Objectives / Scenario (Becomes drawer/sheet on small screens) */}
        {challenge && leftOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/60 z-10 lg:hidden" 
              onClick={() => setLeftOpen(false)} 
            />
            <div className="absolute left-0 rtl:left-auto rtl:right-0 lg:relative z-20 h-full bg-slate-950 lg:bg-transparent border-r rtl:border-r-0 rtl:border-l border-slate-900 shadow-2xl lg:shadow-none w-80 max-w-[calc(100vw-3rem)] shrink-0 animate-in slide-in-from-left rtl:slide-in-from-right duration-150">
              <div className="flex items-center justify-between p-2.5 border-b border-slate-900 lg:hidden bg-slate-950">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'ar' ? 'الأهداف والمتطلبات' : 'Challenge Objectives'}
                </span>
                <button
                  onClick={() => setLeftOpen(false)}
                  className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
                  aria-label="Close Objectives"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ChallengePanel
                challenge={challenge}
                onValidate={onValidateChallenge}
              />
            </div>
          </>
        )}

        {/* Center Pane: Interactive Simulation Stage & Control Deck */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-slate-950">
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {children}
          </div>

          {controlDeck && (
            <div className="border-t border-slate-900 bg-slate-950 p-2.5 shrink-0">
              {controlDeck}
            </div>
          )}
        </div>

        {/* Right Pane: Object Inspector (Becomes slide-over drawer/sheet on mobile) */}
        {rightOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/60 z-10 lg:hidden" 
              onClick={() => setRightOpen(false)} 
            />
            <div className="absolute right-0 rtl:right-auto rtl:left-0 lg:relative z-20 h-full bg-slate-950 lg:bg-transparent border-l rtl:border-l-0 rtl:border-r border-slate-900 shadow-2xl lg:shadow-none w-80 max-w-[calc(100vw-3rem)] shrink-0 animate-in slide-in-from-right rtl:slide-in-from-left duration-150">
              <div className="flex items-center justify-between p-2.5 border-b border-slate-900 lg:hidden bg-slate-950">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'ar' ? 'فاحص المكونات' : 'Object Inspector'}
                </span>
                <button
                  onClick={() => setRightOpen(false)}
                  className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
                  aria-label="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Inspector />
            </div>
          </>
        )}
      </div>

      {/* 4. Bottom Timeline & Virtual Simulation Clock */}
      <Timeline onRestart={onRestart} onStep={onStep} />
    </div>
  );
};
