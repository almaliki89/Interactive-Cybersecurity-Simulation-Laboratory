import React from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { LEARNING_PATHS, WORLDS_REGISTRY } from '../../data/universeData';
import {
  Workflow,
  ArrowRight,
  Shield,
  Network,
  Activity,
  FileCode,
  Cloud,
  Play,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LearningPathsView: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const setSelectedWorldId = useSimulationStore((s) => s.setSelectedWorldId);
  const completedChallenges = useSimulationStore((s) => s.completedChallenges);

  const getPathIcon = (name: string) => {
    switch (name) {
      case 'Shield':
        return Shield;
      case 'Network':
        return Network;
      case 'Activity':
        return Activity;
      case 'FileCode':
        return FileCode;
      case 'Cloud':
        return Cloud;
      default:
        return Workflow;
    }
  };

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
              <Workflow className="w-4 h-4" />
              <span>{language === 'ar' ? 'المسارات التخصصية والمهنية المتكاملة' : 'Cybersecurity Specialization Career Paths'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {language === 'ar' ? 'مسارات التعلم والتدرج المهني التفاعلي' : 'Interactive Cybersecurity Learning Paths'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ar'
                ? 'مسارات موجهة تدمج العوالم والمفاهيم في تسلسل تعليمي منطقي بدون تكرار، من المبتدئ إلى المهندس المحترف.'
                : 'Structured career tracks connecting prerequisite concepts and simulations into cohesive defensive specializations.'}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Beginner Track Callout */}
      <div className="max-w-5xl w-full mb-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30 border border-emerald-800/60 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 sm:w-7 h-6 sm:h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 mb-1">
              {language === 'ar' ? 'المسار الإلزامي الأول للمبتدئين' : 'Recommended Starting Point for Beginners'}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {language === 'ar' ? 'مسار التأسيس خطوة بخطوة (10 محطات تعليمية)' : 'Foundations Step-by-Step Curriculum (10 Milestones)'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              {language === 'ar'
                ? 'لا تمتلك خبرة سابقة؟ ابدأ من هنا. مسار مصمم بعناية يقودك من ثالوث الحماية الأساسي وشبكات الحاسوب حتى الميدان السيبراني.'
                : 'No prior experience? Start here. Carefully crafted sequence guiding you from CIA Triad and networking to cyber range operations.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveSimulation('lesson')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-transform active:scale-95"
        >
          <span>{language === 'ar' ? 'بدء مسار المبتدئين الآن' : 'Start Beginner Track Now'}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>

      {/* Career Paths List */}
      <div className="max-w-5xl w-full space-y-6">
        {LEARNING_PATHS.map((path) => {
          const Icon = getPathIcon(path.iconName);
          return (
            <div
              key={path.id}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {language === 'ar' ? path.titleAr : path.titleEn}
                    </h2>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      {language === 'ar' ? path.roleAr : path.roleEn}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {path.targetWorldIds.length} {language === 'ar' ? 'عوالم مترابطة' : 'Target Worlds'}
                </span>
              </div>

              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                {language === 'ar' ? path.descriptionAr : path.descriptionEn}
              </p>

              {/* Worlds in this Path */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {path.targetWorldIds.map((wId) => {
                  const world = WORLDS_REGISTRY[wId];
                  if (!world) return null;
                  return (
                    <div
                      key={wId}
                      onClick={() => handleOpenWorld(wId)}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/60 cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1">
                          W{world.id.toString().padStart(2, '0')} · {world.difficulty}
                        </span>
                        <span className="text-xs font-bold text-white block group-hover:text-cyan-300">
                          {language === 'ar' ? world.titleAr : world.titleEn}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-2 font-mono flex items-center gap-1">
                        <span>{language === 'ar' ? 'فتح المحاكي' : 'Open Lab'}</span>
                        <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
