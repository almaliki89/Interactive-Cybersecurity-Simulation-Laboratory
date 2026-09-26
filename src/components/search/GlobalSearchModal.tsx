import React, { useEffect, useRef, useState } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
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
  const selectEntity = useSimulationStore((s) => s.selectEntity);

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
  });

  // Filter Glossary Terms
  const matchingTerms = GLOSSARY_TERMS.filter((t) => {
    if (!query) return false;
    return (
      t.termAr.toLowerCase().includes(query) ||
      t.termEn.toLowerCase().includes(query) ||
      t.definitionAr.toLowerCase().includes(query) ||
      t.definitionEn.toLowerCase().includes(query)
    );
  });

  const commandsList = [
    {
      id: 'open_range',
      icon: Compass,
      labelAr: 'فتح الميدان الشامل (Cyber Range)',
      labelEn: 'Open Cyber Range',
      action: () => setActiveSimulation('range'),
    },
    {
      id: 'open_soc',
      icon: Activity,
      labelAr: 'فتح مركز مراقبة العمليات SOC',
      labelEn: 'Open SOC Workstation',
      action: () => setActiveSimulation('siem'),
    },
    {
      id: 'open_forensics',
      icon: Shield,
      labelAr: 'فتح معمل التحقيق الجنائي الرقمي',
      labelEn: 'Open Forensics Lab',
      action: () => setActiveSimulation('threat_hunting'),
    },
    {
      id: 'reset_sim',
      icon: RotateCcw,
      labelAr: 'إعادة ضبط المحاكاة الحالية',
      labelEn: 'Reset Simulation Runtime',
      action: () => globalSimulationRuntime.reset(),
    },
    {
      id: 'pause_sim',
      icon: Pause,
      labelAr: 'إيقاف المحاكاة مؤقتاً',
      labelEn: 'Pause Simulation',
      action: () => globalSimulationRuntime.pause(),
    },
    {
      id: 'resume_sim',
      icon: Play,
      labelAr: 'استئناف تشغيل المحاكاة',
      labelEn: 'Resume Simulation',
      action: () => globalSimulationRuntime.resume(),
    },
    {
      id: 'step_sim',
      icon: StepForward,
      labelAr: 'تنفيذ خطوة زمنية في المحاكاة',
      labelEn: 'Step Simulation Forward',
      action: () => globalSimulationRuntime.step(150),
    },
    {
      id: 'toggle_lang',
      icon: Languages,
      labelAr: 'تبديل اللغة (English / العربية)',
      labelEn: 'Toggle Language (English / Arabic)',
      action: () => setLanguage(language === 'ar' ? 'en' : 'ar'),
    },
    {
      id: 'toggle_mode',
      icon: Sliders,
      labelAr: 'تبديل الوضع (موجّه / استكشاف حر)',
      labelEn: 'Toggle Mode (Guided / Sandbox)',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'اكتب أمراً أو ابحث عن مفهوم سيبراني (مثلاً: DNS, SIEM, pause, reset)...'
                : 'Type a command or search concepts (e.g. DNS, SIEM, pause, reset)...'
            }
            className="w-full bg-transparent border-0 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Shortcuts / Commands Section */}
          {matchingCommands.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {language === 'ar' ? 'الأوامر والعمليات الفورية' : 'System Commands'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {matchingCommands.map((cmd) => {
                  const CmdIcon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsSearchOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/60 hover:bg-slate-800/40 flex items-center gap-3 text-left rtl:text-right transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-950/50 border border-cyan-900 text-cyan-400 flex items-center justify-center shrink-0">
                        <CmdIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-200 block group-hover:text-cyan-300 truncate">
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
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {language === 'ar' ? `المختبرات والعوالم (${matchingWorlds.length})` : `Worlds & Labs (${matchingWorlds.length})`}
              </span>
              <div className="space-y-1.5">
                {matchingWorlds.map((world) => (
                  <button
                    key={world.id}
                    onClick={() => handleSelectWorld(world.id)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/40 flex items-center justify-between text-left rtl:text-right transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                        W{world.id.toString().padStart(2, '0')}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-cyan-300">
                          {language === 'ar' ? world.titleAr : world.titleEn}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-md block">
                          {language === 'ar' ? world.subtitleAr : world.subtitleEn}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                      {world.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Glossary Terms */}
          {matchingTerms.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {language === 'ar' ? `المصطلحات المعجمية (${matchingTerms.length})` : `Glossary Terms (${matchingTerms.length})`}
              </span>
              <div className="space-y-1.5">
                {matchingTerms.map((term) => (
                  <div
                    key={term.id}
                    onClick={() => handleSelectWorld(term.relatedWorldId)}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-purple-300">
                        {language === 'ar' ? term.termAr : term.termEn} ({language === 'ar' ? term.termEn : term.termAr})
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800">
                        {term.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {language === 'ar' ? term.definitionAr : term.definitionEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query && matchingWorlds.length === 0 && matchingTerms.length === 0 && matchingCommands.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">
                {language === 'ar'
                  ? `لم يتم العثور على نتائج تطابق "${searchQuery}"`
                  : `No cybersecurity items found matching "${searchQuery}"`}
              </p>
              <p className="text-xs mt-1">
                {language === 'ar'
                  ? 'جرب البحث عن كلمات مثل: TCP, Firewall, pause, reset'
                  : 'Try searching for keywords like: TCP, Firewall, pause, reset'}
              </p>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Helper Panel inside command palette */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono">
          <div><kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700">Space</kbd> Play / Pause</div>
          <div><kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700">R</kbd> Reset</div>
          <div><kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700">→</kbd> Step</div>
          <div><kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700">Ctrl+K</kbd> Open Palette</div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{language === 'ar' ? 'انقر على أي عنصر للانتقال الفوري أو لتنفيذ الأمر' : 'Click any result to trigger immediately'}</span>
          <span className="font-mono text-cyan-400">60 Worlds Connected</span>
        </div>
      </div>
    </div>
  );
};
