import React, { useEffect, useRef, useState } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { MACRO_DOMAINS, WORLDS_REGISTRY, LEARNING_PATHS } from '../../data/universeData';
import { GLOSSARY_TERMS } from '../../data/glossaryData';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import {
  Search,
  X,
  Shield,
  Network,
  Cpu,
  Globe,
  Lock,
  Terminal,
  Activity,
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FolderGit2,
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Languages,
  Sliders,
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const isSearchOpen = useSimulationStore((s) => s.isSearchOpen);
  const setIsSearchOpen = useSimulationStore((s) => s.setIsSearchOpen);
  const searchQuery = useSimulationStore((s) => s.searchQuery);
  const setSearchQuery = useSimulationStore((s) => s.setSearchQuery);
  const language = useSimulationStore((s) => s.language);
  const setLanguage = useSimulationStore((s) => s.setLanguage);
  const mode = useSimulationStore((s) => s.mode);
  const setMode = useSimulationStore((s) => s.setMode);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const setSelectedWorldId = useSimulationStore((s) => s.setSelectedWorldId);
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const query = searchQuery.toLowerCase().trim();

  // Filter Worlds
  const matchingWorlds = Object.values(WORLDS_REGISTRY).filter((w) => {
    if (!query) return true;
    return (
      w.titleAr.toLowerCase().includes(query) ||
      w.titleEn.toLowerCase().includes(query) ||
      w.descriptionAr.toLowerCase().includes(query) ||
      w.descriptionEn.toLowerCase().includes(query) ||
      w.concepts.some(
         (c) =>
          c.nameAr.toLowerCase().includes(query) ||
          c.nameEn.toLowerCase().includes(query)
      )
    );
  }).slice(0, 5); // Limit to top 5 for speed

  // Filter Glossary Terms
  const matchingTerms = GLOSSARY_TERMS.filter((t) => {
    if (!query) return false;
    return (
      t.termAr.toLowerCase().includes(query) ||
      t.termEn.toLowerCase().includes(query) ||
      t.definitionAr.toLowerCase().includes(query) ||
      t.definitionEn.toLowerCase().includes(query)
    );
  }).slice(0, 3);

  const commandsList = [
    {
      id: 'open_range',
      icon: Compass,
      labelAr: 'فتح الميدان الشامل (Cyber Range)',
      labelEn: 'Enter Cyber Range [World 60]',
      action: () => setActiveSimulation('range'),
    },
    {
      id: 'open_soc',
      icon: Activity,
      labelAr: 'فتح مركز مراقبة العمليات SOC',
      labelEn: 'Switch to SOC Station',
      action: () => setActiveSimulation('siem'),
    },
    {
      id: 'open_forensics',
      icon: Shield,
      labelAr: 'فتح معمل التحقيق الجنائي الرقمي',
      labelEn: 'Enter Forensics Lab',
      action: () => setActiveSimulation('forensics'),
    },
    {
      id: 'open_devsecops_master',
      icon: Sparkles,
      labelAr: 'التحدي الشامل لـ DevSecOps',
      labelEn: 'Launch DevSecOps Master Challenge',
      action: () => {
        setActiveSimulation('devsecops');
        useDevSecOpsStore.getState().setActiveTab('master');
      },
    },
    {
      id: 'reset_sim',
      icon: RotateCcw,
      labelAr: 'إعادة ضبط المحاكاة الحالية',
      labelEn: 'Hot Reset Runtime',
      action: () => globalSimulationRuntime.reset(),
    },
    {
      id: 'pause_sim',
      icon: Pause,
      labelAr: 'إيقاف المحاكاة مؤقتاً',
      labelEn: 'Pause Execution Flow',
      action: () => globalSimulationRuntime.pause(),
    },
    {
      id: 'resume_sim',
      icon: Play,
      labelAr: 'استئناف تشغيل المحاكاة',
      labelEn: 'Resume Execution Flow',
      action: () => globalSimulationRuntime.resume(),
    },
    {
      id: 'step_sim',
      icon: StepForward,
      labelAr: 'تقدم خطوة واحدة',
      labelEn: 'Step Forward [150ms]',
      action: () => globalSimulationRuntime.step(150),
    },
    {
      id: 'toggle_lang',
      icon: Languages,
      labelAr: 'تبديل اللغة (English / العربية)',
      labelEn: 'Toggle Interface Language',
      action: () => setLanguage(language === 'ar' ? 'en' : 'ar'),
    },
    {
      id: 'toggle_mode',
      icon: Sliders,
      labelAr: 'تبديل الوضع (موجّه / استكشاف حر)',
      labelEn: 'Toggle Operation Mode',
      action: () => setMode(mode === 'guided' ? 'sandbox' : 'guided'),
    },
  ];

  const matchingCommands = commandsList.filter((cmd) => {
    if (!query) return true;
    return (
      cmd.labelEn.toLowerCase().includes(query) ||
      cmd.labelAr.toLowerCase().includes(query)
    );
  });

  const handleSelectWorld = (worldId: number) => {
    setSelectedWorldId(worldId);
    const world = WORLDS_REGISTRY[worldId];
    if (world) {
      const simType = world.simulationType;
      if (simType === 'range' || simType === 'cyber_range' || worldId === 60) {
        setActiveSimulation('range');
      } else if (simType === 'crypto_pki') {
        setActiveSimulation('crypto');
      } else if (simType === 'windows_security') {
        setActiveSimulation('threat_hunting');
      } else if (simType === 'iam_auth') {
        setActiveSimulation('active_directory');
      } else if (simType) {
        setActiveSimulation(simType as SimulationId);
      } else {
        setActiveSimulation('explorer');
      }
    } else {
      setActiveSimulation('explorer');
    }
    setIsSearchOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl cyber-panel border-slate-800/80 rounded-2xl overflow-hidden flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-900 flex items-center gap-4 bg-slate-900/40">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'اكتب أمراً أو ابحث عن مفهوم سيبراني...'
                : 'Execute command or search intelligence...'
            }
            className="w-full bg-transparent border-0 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-0 font-mono uppercase tracking-tight"
          />
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:flex h-5 px-1.5 items-center rounded bg-slate-800 border border-slate-700 text-[9px] font-mono text-slate-500 uppercase">ESC</kbd>
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {/* Quick Shortcuts / Commands Section */}
          {matchingCommands.length > 0 && (
            <div className="mb-4">
              <span className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] block">
                {language === 'ar' ? 'الأوامر والعمليات الفورية' : 'SYSTEM_COMMANDS'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-1">
                {matchingCommands.map((cmd) => {
                  const CmdIcon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsSearchOpen(false);
                      }}
                      className="p-2.5 rounded-lg border border-transparent hover:border-cyan-500/30 hover:bg-cyan-500/5 flex items-center gap-3 text-left rtl:text-right transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-cyan-500/50 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center shrink-0 transition-colors">
                        <CmdIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-300 block group-hover:text-white truncate uppercase tracking-tight">
                          {language === 'ar' ? cmd.labelAr : cmd.labelEn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching Worlds */}
          {matchingWorlds.length > 0 && (
            <div className="mb-4">
              <span className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] block">
                {language === 'ar' ? `المختبرات والعوالم (${matchingWorlds.length})` : `LABS_AND_WORLDS (${matchingWorlds.length})`}
              </span>
              <div className="space-y-1 px-1">
                {matchingWorlds.map((world) => (
                  <button
                    key={world.id}
                    onClick={() => handleSelectWorld(world.id)}
                    className="w-full p-2.5 rounded-lg border border-transparent hover:border-cyan-500/30 hover:bg-cyan-500/5 flex items-center justify-between text-left rtl:text-right transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-500/70 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                        W{world.id.toString().padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-200 block group-hover:text-white uppercase tracking-tight truncate">
                          {language === 'ar' ? world.titleAr : world.titleEn}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter truncate block mt-0.5">
                          {language === 'ar' ? world.subtitleAr : world.subtitleEn}
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] uppercase font-mono px-2 py-0.5 rounded border border-slate-800 text-slate-600 group-hover:text-slate-400 shrink-0">
                      {world.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Glossary Terms */}
          {matchingTerms.length > 0 && (
            <div>
              <span className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] block">
                {language === 'ar' ? `المصطلحات المعجمية (${matchingTerms.length})` : `CYBER_INTELLIGENCE (${matchingTerms.length})`}
              </span>
              <div className="space-y-1 px-1">
                {matchingTerms.map((term) => (
                  <div
                    key={term.id}
                    onClick={() => handleSelectWorld(term.relatedWorldId)}
                    className="p-3 rounded-lg border border-transparent hover:border-purple-500/30 hover:bg-purple-500/5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-purple-400 uppercase tracking-tight">
                        {language === 'ar' ? term.termAr : term.termEn}
                      </span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-purple-900/50 text-purple-400/70 uppercase">
                        {term.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 font-sans italic">
                      {language === 'ar' ? term.definitionAr : term.definitionEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              60 Worlds Active
            </span>
            <span className="text-slate-800">/</span>
            <span>OS: OMEGA_V15.3</span>
          </div>
          <span className="text-cyan-500/50">READY_FOR_INPUT</span>
        </div>
      </div>
    </div>
  );
};
