import React, { useEffect, useRef } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { MACRO_DOMAINS, WORLDS_REGISTRY, LEARNING_PATHS } from '../../data/universeData';
import { GLOSSARY_TERMS } from '../../data/glossaryData';
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
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const isSearchOpen = useSimulationStore((s) => s.isSearchOpen);
  const setIsSearchOpen = useSimulationStore((s) => s.setIsSearchOpen);
  const searchQuery = useSimulationStore((s) => s.searchQuery);
  const setSearchQuery = useSimulationStore((s) => s.setSearchQuery);
  const language = useSimulationStore((s) => s.language);
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

  // Filter Learning Paths
  const matchingPaths = LEARNING_PATHS.filter((p) => {
    if (!query) return false;
    return (
      p.titleAr.toLowerCase().includes(query) ||
      p.titleEn.toLowerCase().includes(query) ||
      p.roleAr.toLowerCase().includes(query) ||
      p.roleEn.toLowerCase().includes(query)
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
                ? 'ابحث عن أي مفهوم، بروتوكول، ثغرة، مختبر محاكاة، أو مصطلح سيبراني (مثلاً: DNS, Kerberos, SIEM, CIA)...'
                : 'Search concepts, protocols, labs, worlds, or cybersecurity terms (e.g. DNS, Kerberos, SIEM, CIA)...'
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
          {/* Quick Shortcuts if query is empty */}
          {!query && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {language === 'ar' ? 'الوجهات الرئيسية والميادين' : 'Quick Destinations & Labs'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveSimulation('range');
                    setIsSearchOpen(false);
                  }}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/50 flex items-center gap-3 text-left rtl:text-right transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-cyan-300">
                      {language === 'ar' ? 'الميدان السيبراني الشامل (World 60)' : 'Integrated Cyber Range'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {language === 'ar' ? 'محاكاة المنظومة الرقمية كاملة بـ 5 طبقات' : 'Full multi-layer living enterprise simulation'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveSimulation('explorer');
                    setIsSearchOpen(false);
                  }}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/50 flex items-center gap-3 text-left rtl:text-right transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-indigo-300">
                      {language === 'ar' ? 'مستكشف العوالم السيبرانية الـ 60' : '60 Cyber Worlds Universe'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {language === 'ar' ? '10 نطاقات شاملة لجميع تخصصات الأمن' : '10 Macro Domains with progressive discovery'}
                    </span>
                  </div>
                </button>
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
          {query && matchingWorlds.length === 0 && matchingTerms.length === 0 && matchingPaths.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">
                {language === 'ar'
                  ? `لم يتم العثور على نتائج تطابق "${searchQuery}"`
                  : `No cybersecurity items found matching "${searchQuery}"`}
              </p>
              <p className="text-xs mt-1">
                {language === 'ar'
                  ? 'جرب البحث عن كلمات مثل: TCP, Firewall, Kerberos, SIEM, DAC, Zero Trust'
                  : 'Try searching for keywords like: TCP, Firewall, Kerberos, SIEM, DAC, Zero Trust'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{language === 'ar' ? 'انقر على أي عنصر للانتقال الفوري إلى مختبره التفاعلي' : 'Click any result to jump to its interactive simulator'}</span>
          <span className="font-mono text-cyan-400">60 Worlds Connected</span>
        </div>
      </div>
    </div>
  );
};
