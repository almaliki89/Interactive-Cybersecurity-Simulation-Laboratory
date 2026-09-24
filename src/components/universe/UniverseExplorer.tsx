import React, { useState } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { MACRO_DOMAINS, WORLDS_REGISTRY } from '../../data/universeData';
import { MacroDomainId } from '../../types/universe';
import {
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  Cpu,
  Network,
  Globe,
  FileCode,
  Key,
  Users,
  Fingerprint,
  Cloud,
  Boxes,
  Workflow,
  Activity,
  Laptop,
  Search,
  ShieldAlert,
  Compass,
  Play,
  HelpCircle,
  X,
  Target,
  Eye,
  GitBranch,
  Check,
} from 'lucide-react';

export const UniverseExplorer: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const selectedMacroDomainId = useSimulationStore((s) => s.selectedMacroDomainId);
  const setSelectedMacroDomainId = useSimulationStore((s) => s.setSelectedMacroDomainId);
  const selectedWorldId = useSimulationStore((s) => s.selectedWorldId);
  const setSelectedWorldId = useSimulationStore((s) => s.setSelectedWorldId);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const completedChallenges = useSimulationStore((s) => s.completedChallenges);

  const [activeTab, setActiveTab] = useState<'all' | 'clusters' | 'tree'>('all');
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(0);
  const [conceptExperimentToggled, setConceptExperimentToggled] = useState<boolean>(false);

  const selectedDomain = MACRO_DOMAINS.find((d) => d.id === selectedMacroDomainId);
  const selectedWorld = selectedWorldId ? WORLDS_REGISTRY[selectedWorldId] : null;

  // Fallback simulator mapping if a specialized world doesn't have a unique ID
  const mapWorldToSimulation = (worldId: number): SimulationId => {
    const world = WORLDS_REGISTRY[worldId];
    if (world && world.simulationType) {
      return world.simulationType as SimulationId;
    }
    // Smart domain fallbacks
    if (worldId === 1 || worldId === 48 || worldId === 50) return 'cia_triad';
    if (worldId === 2) return 'system_internals';
    if (worldId === 3 || worldId === 42) return 'subnet_routing';
    if (worldId === 4) return 'firewall';
    if (worldId === 5) return 'linux';
    if (worldId === 6 || worldId === 28) return 'threat_hunting';
    if (worldId === 7 || worldId === 16 || worldId === 17) return 'active_directory';
    if (worldId === 8) return 'http';
    if (worldId === 9 || worldId === 10 || worldId === 11 || worldId === 12 || worldId === 13 || worldId === 14) return 'appsec_api';
    if (worldId === 15 || worldId === 39 || worldId === 40) return 'crypto';
    if (worldId >= 18 && worldId <= 23) return 'cloud_containers';
    if (worldId >= 24 && worldId <= 27) return 'siem';
    if (worldId >= 29 && worldId <= 34) return 'threat_hunting';
    if (worldId >= 35 && worldId <= 38) return 'zero_trust';
    if (worldId === 60) return 'range';
    return 'range';
  };

  const handleLaunchWorld = (worldId: number) => {
    setSelectedWorldId(worldId);
    const targetSim = mapWorldToSimulation(worldId);
    setActiveSimulation(targetSim);
  };

  const getDomainIcon = (code: string) => {
    switch (code) {
      case 'FOUNDATIONS':
        return Shield;
      case 'INFRASTRUCTURE':
        return Network;
      case 'APPSEC':
        return FileCode;
      case 'CRYPTO_IAM':
        return Key;
      case 'CLOUD_DEVOPS':
        return Cloud;
      case 'SECOPS':
        return Activity;
      case 'INVESTIGATION':
        return Search;
      case 'ENGINEERING':
        return ShieldAlert;
      case 'SPECIALIZED':
        return Cpu;
      case 'GOVERNANCE_RANGE':
        return Compass;
      default:
        return Layers;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 flex flex-col items-center select-none">
      {/* 1. Universe Explorer Header */}
      <div className="max-w-6xl w-full mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{language === 'ar' ? 'معمارية الكون السيبراني الشامل (OMEGA V4)' : 'Complete Cybersecurity Universe Architecture'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {language === 'ar' ? 'مستكشف العوالم والنطاقات الأمنية الـ 60' : '60 Interconnected Cybersecurity Worlds'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'خارطة معرفية تفاعلية شاملة تربط 10 نطاقات أمنية كبرى. كل عالم يمثل منظومة حية تتضمن مفاهيم وتجارب عملية وتحديات دفاعية.'
                : '10 Macro Domains organized into 60 interconnected worlds. Experience hands-on interactive labs for every single layer.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSimulation('range')}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>{language === 'ar' ? 'فتح الميدان الشامل (World 60)' : 'Open Cyber Range'}</span>
            </button>
          </div>
        </div>

        {/* Macro Domain Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar border-b border-slate-800/60">
          <button
            onClick={() => {
              setSelectedMacroDomainId(null);
              setSelectedWorldId(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              !selectedMacroDomainId
                ? 'bg-cyan-500 text-slate-950 shadow-xs font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {language === 'ar' ? 'جميع النطاقات (10)' : 'All Domains (10)'}
          </button>

          {MACRO_DOMAINS.map((domain) => {
            const Icon = getDomainIcon(domain.code);
            const isSelected = selectedMacroDomainId === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => {
                  setSelectedMacroDomainId(domain.id);
                  setSelectedWorldId(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-xs font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>
                  {domain.id}. {language === 'ar' ? domain.nameAr : domain.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Universe View */}
      <div className="max-w-6xl w-full">
        {/* If a Macro Domain is selected */}
        {selectedDomain && (
          <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  {language === 'ar' ? `النطاق الأكبر ${selectedDomain.id}` : `Macro Domain ${selectedDomain.id}`}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {language === 'ar' ? selectedDomain.nameAr : selectedDomain.nameEn}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {language === 'ar' ? selectedDomain.descriptionAr : selectedDomain.descriptionEn}
                </p>
              </div>
              <button
                onClick={() => setSelectedMacroDomainId(null)}
                className="text-xs text-slate-400 hover:text-white font-mono"
              >
                {language === 'ar' ? '← عرض جميع النطاقات' : '← View All Domains'}
              </button>
            </div>
          </div>
        )}

        {/* 60 Worlds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MACRO_DOMAINS.filter((d) => !selectedMacroDomainId || d.id === selectedMacroDomainId).flatMap(
            (domain) =>
              domain.worldIds.map((worldId) => {
                const world = WORLDS_REGISTRY[worldId];
                if (!world) return null;

                const isMastered = completedChallenges.includes(world.challengeTitleEn || `world-${world.id}`);
                const Icon = getDomainIcon(domain.code);

                return (
                  <div
                    key={world.id}
                    onClick={() => {
                      setSelectedWorldId(world.id);
                      setSelectedConceptIndex(0);
                    }}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      selectedWorldId === world.id
                        ? 'bg-slate-900/95 border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    <div>
                      {/* Card Header with Status Indicator */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                            W{world.id.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[10px] uppercase font-mono text-slate-500">
                            {domain.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isMastered ? (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{language === 'ar' ? 'مكتمل' : 'MASTERED'}</span>
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                world.difficulty === 'Beginner'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : world.difficulty === 'Intermediate'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : world.difficulty === 'Advanced'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {world.difficulty}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {language === 'ar' ? world.titleAr : world.titleEn}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {language === 'ar' ? world.subtitleAr : world.subtitleEn}
                      </p>

                      {/* Core Concepts Badges */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {world.concepts.slice(0, 3).map((concept) => (
                          <span
                            key={concept.id}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            {language === 'ar' ? concept.nameAr : concept.nameEn}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {world.concepts.length} {language === 'ar' ? 'مفاهيم تفاعلية' : 'Concepts'}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchWorld(world.id);
                        }}
                        className="py-1 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{language === 'ar' ? 'بدء المختبر' : 'Launch Lab'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* 3. Level 3 World View — Progressive Concept Explorer Modal */}
      {selectedWorld && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                    World #{selectedWorld.id.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedWorld.difficulty}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {language === 'ar' ? selectedWorld.titleAr : selectedWorld.titleEn}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ar' ? selectedWorld.subtitleAr : selectedWorld.subtitleEn}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorldId(null)}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 8-Step Progressive Concept Sequence */}
            <div className="py-4 space-y-4">
              {/* Step 1 & 2: Selected Live Concept & Dynamic Explanation */}
              {selectedWorld.concepts[selectedConceptIndex] && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'المفهوم التفاعلي النشط' : 'Active Concept'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {selectedConceptIndex + 1} / {selectedWorld.concepts.length}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {language === 'ar'
                      ? selectedWorld.concepts[selectedConceptIndex].nameAr
                      : selectedWorld.concepts[selectedConceptIndex].nameEn}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'ar'
                      ? selectedWorld.concepts[selectedConceptIndex].briefAr
                      : selectedWorld.concepts[selectedConceptIndex].briefEn}
                  </p>

                  {/* Security Connection */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-bold text-amber-300 block mb-1">
                      {language === 'ar' ? '🛡️ الارتباط بالأمن السيبراني:' : '🛡️ Cybersecurity Connection:'}
                    </span>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      {language === 'ar'
                        ? selectedWorld.concepts[selectedConceptIndex].securityRelevanceAr
                        : selectedWorld.concepts[selectedConceptIndex].securityRelevanceEn}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Clickable Concepts Carousel */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-slate-400 uppercase block font-semibold">
                  {language === 'ar' ? 'مفاهيم هذا العالم (انقر للاستكشاف):' : 'World Concepts (Click to explore):'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedWorld.concepts.map((concept, idx) => (
                    <button
                      key={concept.id}
                      onClick={() => setSelectedConceptIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                        selectedConceptIndex === idx
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {language === 'ar' ? concept.nameAr : concept.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 7: Practical Challenge & Objectives */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase block">
                  {language === 'ar' ? 'المهمة العملية والمختبر:' : 'Practical Mission & Lab:'}
                </span>
                <span className="text-xs font-bold text-white block">
                  {language === 'ar' ? selectedWorld.challengeTitleAr : selectedWorld.challengeTitleEn}
                </span>
                {selectedWorld.practicalObjectivesAr && selectedWorld.practicalObjectivesAr.length > 0 && (
                  <ul className="space-y-1 mt-2 text-xs text-slate-300">
                    {(language === 'ar' ? selectedWorld.practicalObjectivesAr : selectedWorld.practicalObjectivesEn)?.map((obj, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 mt-auto">
              <button
                onClick={() => setSelectedWorldId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>

              <button
                onClick={() => handleLaunchWorld(selectedWorld.id)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{language === 'ar' ? 'بدء تشغيل المختبر التفاعلي' : 'Launch Interactive Lab'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
