import React, { useState } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { GLOSSARY_TERMS } from '../../data/glossaryData';
import { WORLDS_REGISTRY } from '../../data/universeData';
import {
  BookOpen,
  Search,
  ArrowRight,
  Play,
  Shield,
  Filter,
} from 'lucide-react';

export const GlossaryView: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const setSelectedWorldId = useSimulationStore((s) => s.setSelectedWorldId);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(GLOSSARY_TERMS.map((t) => t.category)))];

  const filtered = GLOSSARY_TERMS.filter((t) => {
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch =
      !search ||
      t.termAr.toLowerCase().includes(search.toLowerCase()) ||
      t.termEn.toLowerCase().includes(search.toLowerCase()) ||
      t.definitionAr.toLowerCase().includes(search.toLowerCase()) ||
      t.definitionEn.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenWorld = (worldId: number) => {
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
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 flex flex-col items-center">
      <div className="max-w-5xl w-full mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>{language === 'ar' ? 'المعجم التقني المعتمد للأمن السيبراني' : 'Standard Cybersecurity Technical Glossary'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {language === 'ar' ? 'قاموس المفاهيم والمصطلحات السيبرانية' : 'Interactive Cybersecurity Glossary'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ar'
                ? 'تعريفات دقيقة ومعيارية بالعربية والإنجليزية مع أمثلة عملية وروابط مباشرة لمختبرات المحاكاة التفاعلية.'
                : 'Rigorous bilingual definitions with practical examples and direct jump links to corresponding interactive labs.'}
            </p>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث في المصطلحات والتعريفات...' : 'Search terms and definitions...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl ps-9 pe-4 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Glossary Cards Grid */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const relatedWorld = WORLDS_REGISTRY[item.relatedWorldId];
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">
                    {language === 'ar' ? item.termAr : item.termEn}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                    {item.category}
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400 block mb-2">
                  {language === 'ar' ? item.termEn : item.termAr}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {language === 'ar' ? item.definitionAr : item.definitionEn}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-slate-500 block mb-0.5">{language === 'ar' ? 'مثال عملي:' : 'Practical Example:'}</span>
                  {language === 'ar' ? item.exampleAr : item.exampleEn}
                </div>
              </div>

              {relatedWorld && (
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    World #{relatedWorld.id.toString().padStart(2, '0')}: {language === 'ar' ? relatedWorld.titleAr : relatedWorld.titleEn}
                  </span>
                  <button
                    onClick={() => handleOpenWorld(relatedWorld.id)}
                    className="py-1 px-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{language === 'ar' ? 'المختبر' : 'Lab'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
