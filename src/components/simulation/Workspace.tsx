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

  const t = translations[language];

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

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
    <div className="flex-1 flex flex-col h-[calc(100vh-3rem)] overflow-hidden bg-slate-950 select-none font-sans">
      {/* 1. OMEGA V4 Technical Workspace Sub-header */}
      <div className="h-10 border-b border-slate-900 bg-slate-950 px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Breadcrumbs & Lab Name */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSimulation('explorer')}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors uppercase font-bold flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الكون السيبراني' : 'Cyber Universe'}</span>
          </button>
          <span className="text-slate-800 font-mono text-xs">/</span>
          {domainName && (
            <>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline truncate max-w-[140px]">
                {domainName}
              </span>
              <span className="text-slate-800 font-mono text-xs hidden sm:inline">/</span>
            </>
          )}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <h1 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase font-mono truncate max-w-[180px] sm:max-w-[280px]">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: System Layer Mode Switcher */}
        <div className="hidden lg:flex items-center bg-slate-900/60 border border-slate-850 rounded-lg p-0.5">
          {layers.map((l) => {
            const isSelected = activeWorkspaceLayer === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setActiveWorkspaceLayer(l.id)}
                className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {language === 'ar' ? l.nameAr : l.nameEn}
              </button>
            );
          })}
        </div>

        {/* Right: Panel toggle controls */}
        <div className="flex items-center gap-1">
          {challenge && (
            <button
              onClick={() => setLeftOpen((prev) => !prev)}
              className={`p-1 px-2 rounded-lg text-xs flex items-center gap-1 border transition-colors ${
                leftOpen
                  ? 'bg-slate-900 border-slate-800 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300'
              }`}
              title={t.workspace.objectives}
            >
              <PanelLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-mono">{t.workspace.objectives}</span>
            </button>
          )}

          <button
            onClick={() => setRightOpen((prev) => !prev)}
            className={`p-1 px-2 rounded-lg text-xs flex items-center gap-1 border transition-colors ${
              rightOpen
                ? 'bg-slate-900 border-slate-800 text-cyan-300 font-bold'
                : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300'
            }`}
            title={t.workspace.inspector}
          >
            <PanelRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px] font-mono">{t.workspace.inspector}</span>
          </button>
        </div>
      </div>

      {/* Contextual Status Strip */}
      <div className="h-7 border-b border-slate-900 bg-slate-950/60 px-4 flex items-center justify-between text-[10px] text-slate-500 font-mono select-none shrink-0 overflow-x-auto">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div>
            <span className="text-slate-600 uppercase font-bold">{language === 'ar' ? 'السيناريو:' : 'SCENARIO:'}</span>{' '}
            <span className="text-slate-300">{subtitle || title}</span>
          </div>
          <div className="h-2 w-px bg-slate-800" />
          {challenge && (
            <div>
              <span className="text-slate-600 uppercase font-bold">{language === 'ar' ? 'الهدف:' : 'OBJECTIVE:'}</span>{' '}
              <span className="text-slate-400 truncate max-w-[150px] sm:max-w-[300px]">
                {challenge.mission}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 whitespace-nowrap ms-4">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400 uppercase font-bold">{language === 'ar' ? 'الحالة السيبرانية:' : 'SECURE STATE:'}</span>{' '}
            <span className="text-slate-300 font-bold uppercase">{selectedEntity ? 'INSPECTING' : 'MONITORED'}</span>
          </div>
          {selectedEntity && (
            <>
              <div className="h-2 w-px bg-slate-800" />
              <div>
                <span className="text-cyan-400 font-bold">
                  {language === 'ar' ? 'تحديد النشاط:' : 'ACTIVE TRACE:'}{' '}
                  {selectedEntity.type.toUpperCase()}({selectedEntity.id})
                </span>
              </div>
            </>
          )}
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
          <div className="absolute lg:relative z-20 h-full bg-slate-950/95 lg:bg-transparent border-r rtl:border-r-0 rtl:border-l border-slate-900 shadow-2xl lg:shadow-none w-80 shrink-0 animate-in slide-in-from-left duration-150">
            <div className="flex items-center justify-between p-2.5 border-b border-slate-900 lg:hidden bg-slate-950">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {language === 'ar' ? 'الأهداف والمتطلبات' : 'Challenge Objectives'}
              </span>
              <button
                onClick={() => setLeftOpen(false)}
                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ChallengePanel
              challenge={challenge}
              onValidate={onValidateChallenge}
            />
          </div>
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
          <div className="absolute right-0 rtl:right-auto rtl:left-0 lg:relative z-20 h-full bg-slate-950/95 lg:bg-transparent border-l rtl:border-l-0 rtl:border-r border-slate-900 shadow-2xl lg:shadow-none w-80 shrink-0 animate-in slide-in-from-right duration-150">
            <div className="flex items-center justify-between p-2.5 border-b border-slate-900 lg:hidden bg-slate-950">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {language === 'ar' ? 'فاحص المكونات' : 'Object Inspector'}
              </span>
              <button
                onClick={() => setRightOpen(false)}
                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Inspector />
          </div>
        )}
      </div>

      {/* 4. Bottom Timeline & Virtual Simulation Clock */}
      <Timeline onRestart={onRestart} onStep={onStep} />
    </div>
  );
};
