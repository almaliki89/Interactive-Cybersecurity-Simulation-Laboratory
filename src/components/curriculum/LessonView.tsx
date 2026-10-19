import React, { useState, useMemo } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { CURRICULUM_MILESTONES, CURRICULUM_LESSONS } from '../../data/curriculumData';
import { CurriculumLesson, CurriculumMilestone } from '../../types/curriculum';
import {
  Shield,
  Cpu,
  Network,
  ShieldCheck,
  Key,
  Lock,
  Activity,
  Flame,
  Workflow,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Play,
  Lightbulb,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Check,
  RotateCcw,
  Compass,
  Layers,
} from 'lucide-react';

export const LessonView: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const activeLessonId = useSimulationStore((s) => s.activeLessonId) || 'lesson-01-cia-triad';
  const setActiveLessonId = useSimulationStore((s) => s.setActiveLessonId);
  const completedLessons = useSimulationStore((s) => s.completedLessons) || [];
  const completeLesson = useSimulationStore((s) => s.completeLesson);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const setSelectedWorldId = useSimulationStore((s) => s.setSelectedWorldId);

  // Active Stage tab (0: Overview & Objectives, 1: Concept & Analogy, 2: Demonstration, 3: Guided Task, 4: Result & Significance, 5: Quiz, 6: Next Step)
  const [activeStage, setActiveStage] = useState<number>(0);

  // Quiz state: questionId -> selectedOptionId
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Guided task checklist checked items
  const [checkedTaskSteps, setCheckedTaskSteps] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Current lesson data
  const currentLesson: CurriculumLesson = useMemo(() => {
    return CURRICULUM_LESSONS[activeLessonId] || CURRICULUM_LESSONS['lesson-01-cia-triad'];
  }, [activeLessonId]);

  // Current milestone data
  const currentMilestone: CurriculumMilestone = useMemo(() => {
    return (
      CURRICULUM_MILESTONES.find((m) => m.id === currentLesson.milestoneId) ||
      CURRICULUM_MILESTONES[0]
    );
  }, [currentLesson.milestoneId]);

  // Milestone icon helper
  const getMilestoneIcon = (name: string) => {
    switch (name) {
      case 'Shield':
        return Shield;
      case 'Cpu':
        return Cpu;
      case 'Network':
        return Network;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Key':
        return Key;
      case 'Lock':
        return Lock;
      case 'Activity':
        return Activity;
      case 'Flame':
        return Flame;
      case 'Workflow':
        return Workflow;
      default:
        return Sparkles;
    }
  };

  const MilestoneIcon = getMilestoneIcon(currentMilestone.iconName);

  // Overall progress calculation
  const totalLessonsCount = Object.keys(CURRICULUM_LESSONS).length;
  const completedCount = completedLessons.length;
  const progressPercent = Math.round((completedCount / (totalLessonsCount || 1)) * 100);

  // Is current lesson already completed
  const isLessonCompleted = completedLessons.includes(currentLesson.id);

  // Handle Quiz Option Selection
  const handleSelectOption = (questionId: string, optionId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setQuizSubmitted((prev) => ({ ...prev, [questionId]: true }));
  };

  // Launch the corresponding interactive simulation
  const handleLaunchSimulation = () => {
    if (currentLesson.worldId) {
      setSelectedWorldId(currentLesson.worldId);
    }
    setActiveSimulation(currentLesson.simulationId);
  };

  // Mark current lesson complete and optionally advance
  const handleCompleteAndNext = () => {
    completeLesson(currentLesson.id);
    if (currentLesson.nextStep.nextLessonId && CURRICULUM_LESSONS[currentLesson.nextStep.nextLessonId]) {
      setActiveLessonId(currentLesson.nextStep.nextLessonId);
      setActiveStage(0);
      setQuizAnswers({});
      setQuizSubmitted({});
      setCheckedTaskSteps({});
      setShowHints(false);
    }
  };

  // Handle changing lesson
  const handleChangeLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveStage(0);
    setQuizAnswers({});
    setQuizSubmitted({});
    setCheckedTaskSteps({});
    setShowHints(false);
    setIsSidebarOpen(false);
  };

  const stagesList = [
    { id: 0, labelAr: '1. الأهداف والمدخل', labelEn: '1. Objectives & Overview' },
    { id: 1, labelAr: '2. المفهوم والتشبيه', labelEn: '2. Concept & Analogy' },
    { id: 2, labelAr: '3. المعاينة الحية', labelEn: '3. Live Demonstration' },
    { id: 3, labelAr: '4. المهمة العملية', labelEn: '4. Hands-on Task' },
    { id: 4, labelAr: '5. الأثر الأمني', labelEn: '5. Security Impact' },
    { id: 5, labelAr: '6. فحص المعرفة', labelEn: '6. Knowledge Check' },
    { id: 6, labelAr: '7. الخطوة التالية', labelEn: '7. Next Steps' },
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: All 10 Milestones & Progression Map */}
      <aside
        className={`fixed lg:static top-12 bottom-0 left-0 rtl:left-auto rtl:right-0 z-50 w-80 lg:w-84 bg-slate-900/95 border-r rtl:border-r-0 rtl:border-l border-slate-800 flex flex-col transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 rtl:translate-x-full rtl:lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                {language === 'ar' ? 'مسار المبتدئين خطوة بخطوة' : 'Beginner Learning Track'}
              </h2>
              <span className="text-[10px] text-cyan-400 font-mono">
                {language === 'ar' ? '10 محطات تأسيسية متسلسلة' : '10 Step-by-Step Milestones'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
            aria-label="Close menu"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>

        {/* Overall Curriculum Progress Bar */}
        <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/60">
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
            <span className="text-slate-400">
              {language === 'ar' ? 'نسبة التقدم الكلي' : 'Total Progress'}
            </span>
            <span className="font-bold text-cyan-400">
              {progressPercent}% ({completedCount}/{totalLessonsCount})
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Milestone List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {CURRICULUM_MILESTONES.map((milestone) => {
            const IconComp = getMilestoneIcon(milestone.iconName);
            const isMilestoneActive = milestone.id === currentMilestone.id;
            const isMilestoneDone = milestone.lessonIds.every((lid) => completedLessons.includes(lid));
            const primaryLessonId = milestone.lessonIds[0];

            return (
              <button
                key={milestone.id}
                onClick={() => handleChangeLesson(primaryLessonId)}
                className={`w-full p-3 rounded-xl border text-left rtl:text-right transition-all flex items-start gap-3 group ${
                  isMilestoneActive
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-950/40'
                    : isMilestoneDone
                    ? 'bg-slate-950/40 border-emerald-900/40 hover:border-emerald-700/60 text-slate-300'
                    : 'bg-slate-950/20 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isMilestoneActive
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : isMilestoneDone
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                      : 'bg-slate-900 border border-slate-800 text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {isMilestoneDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <IconComp className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isMilestoneActive ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                    >
                      {language === 'ar' ? `المحطة ${milestone.id}` : `Milestone ${milestone.id}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ~{milestone.estimatedMinutes}m
                    </span>
                  </div>
                  <h3
                    className={`text-xs font-bold leading-snug line-clamp-2 ${
                      isMilestoneActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {language === 'ar' ? milestone.titleAr : milestone.titleEn}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                    {language === 'ar' ? milestone.subtitleAr : milestone.subtitleEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Sticky Header */}
        <div className="p-4 sm:p-5 bg-slate-900/60 border-b border-slate-800 backdrop-blur-md sticky top-0 z-20">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                aria-label="Open milestones drawer"
              >
                <Layers className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
                <MilestoneIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {language === 'ar'
                      ? `المحطة ${currentMilestone.id} من 10`
                      : `Milestone ${currentMilestone.id} of 10`}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ~{currentLesson.estimatedMinutes} {language === 'ar' ? 'دقيقة' : 'mins'}
                  </span>
                  {isLessonCompleted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                      <Check className="w-3 h-3" />
                      <span>{language === 'ar' ? 'مكتمل' : 'Completed'}</span>
                    </span>
                  )}
                </div>
                <h1 className="text-base sm:text-xl font-extrabold text-white leading-tight">
                  {language === 'ar' ? currentLesson.titleAr : currentLesson.titleEn}
                </h1>
              </div>
            </div>

            {/* Quick Action: Launch Connected Simulation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLaunchSimulation}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {language === 'ar'
                    ? 'فتح المحاكي التفاعلي للدرس'
                    : 'Open Live Interactive Lab'}
                </span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>
            </div>
          </div>

          {/* 7-Stage Horizontal Navigation Tabs */}
          <div className="max-w-4xl mx-auto mt-4 overflow-x-auto pb-1 custom-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max border-b border-slate-800/80 pb-1">
              {stagesList.map((stage) => {
                const isActive = activeStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStage(stage.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{language === 'ar' ? stage.labelAr : stage.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stage Content Container */}
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* STAGE 0: Objectives & Why It Matters */}
          {activeStage === 0 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Why It Matters Callout */}
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 backdrop-blur-xs">
                <div className="flex items-center gap-2.5 text-cyan-400 mb-2">
                  <Lightbulb className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
                    {language === 'ar' ? 'لماذا يعد هذا المفهوم حاسماً؟' : 'Why This Concept Matters'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === 'ar' ? currentLesson.whyItMattersAr : currentLesson.whyItMattersEn}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{language === 'ar' ? 'الأهداف التعليمية للمحطة' : 'Learning Objectives'}</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {currentLesson.objectives.map((obj, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-slate-300 leading-snug">
                        {language === 'ar' ? obj.textAr : obj.textEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Big Picture Description */}
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {language === 'ar' ? 'الصورة الكلية للمحطة' : 'Milestone Context'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'ar' ? currentMilestone.descriptionAr : currentMilestone.descriptionEn}
                </p>
              </div>

              {/* Action Button: Next Stage */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStage(1)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{language === 'ar' ? 'المرحلة 2: المفهوم والتشبيه الحياتي' : 'Stage 2: Concept & Analogy'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 1: Concept & Real-World Analogy */}
          {activeStage === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Core Concept Explanation */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'ar' ? 'الشرح العلمي المبسط' : 'Core Concept Explained'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === 'ar' ? currentLesson.concept.textAr : currentLesson.concept.textEn}
                </p>
              </div>

              {/* Real World Analogy Box */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40">
                <div className="flex items-center gap-2.5 text-amber-400 mb-2">
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
                    {language === 'ar' ? 'تشبيه من الحياة اليومية' : 'Real-World Everyday Analogy'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === 'ar' ? currentLesson.concept.analogyAr : currentLesson.concept.analogyEn}
                </p>
              </div>

              {/* Bilingual Key Terms Dictionary */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>
                    {language === 'ar'
                      ? 'المصطلحات والمفاهيم الجوهرية (ثنائي اللغة)'
                      : 'Essential Key Terms (Bilingual)'}
                  </span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {currentLesson.concept.keyTerms.map((term, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">
                          {language === 'ar' ? term.termAr : term.termEn}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {language === 'ar' ? term.termEn : term.termAr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {language === 'ar' ? term.definitionAr : term.definitionEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(0)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{language === 'ar' ? 'السابق: الأهداف' : 'Back: Objectives'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(2)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{language === 'ar' ? 'المرحلة 3: المعاينة الحية' : 'Stage 3: Live Demonstration'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: Demonstration & Initial State */}
          {activeStage === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400 fill-current" />
                  <span>
                    {language === 'ar'
                      ? currentLesson.demonstration.titleAr
                      : currentLesson.demonstration.titleEn}
                  </span>
                </h3>
              </div>

              {/* What to look for */}
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40">
                <div className="flex items-center gap-2.5 text-cyan-400 mb-2">
                  <HelpCircle className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
                    {language === 'ar' ? 'ما الذي يجب أن تلاحظه؟' : 'What To Look For'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? currentLesson.demonstration.whatToLookForAr
                    : currentLesson.demonstration.whatToLookForEn}
                </p>
              </div>

              {/* Initial State Description */}
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {language === 'ar' ? 'حالة النظام الافتراضية الأولية' : 'Initial System State'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? currentLesson.demonstration.initialStateAr
                    : currentLesson.demonstration.initialStateEn}
                </p>
              </div>

              {/* Direct Simulator CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-800/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    {language === 'ar' ? 'هل أنت مستعد لمعاينة النظام حياً؟' : 'Ready to inspect the live system?'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {language === 'ar'
                      ? 'يمكنك فتح المحاكي والتنقل بين الأنظمة ثم العودة لاستكمال المهام'
                      : 'You can launch the live simulation, manipulate parameters, and return here.'}
                  </p>
                </div>
                <button
                  onClick={handleLaunchSimulation}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'ar' ? 'فتح المحاكي الآن' : 'Launch Simulation'}</span>
                </button>
              </div>

              {/* Stage Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{language === 'ar' ? 'السابق: المفهوم' : 'Back: Concept'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(3)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{language === 'ar' ? 'المرحلة 4: المهمة العملية' : 'Stage 4: Guided Task'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: Guided Hands-On Task */}
          {activeStage === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Task Title & Rationale */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {language === 'ar' ? 'مهمة عملية موجهة' : 'Hands-on Challenge'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ar'
                    ? currentLesson.guidedTask.taskTitleAr
                    : currentLesson.guidedTask.taskTitleEn}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-semibold">
                    {language === 'ar' ? 'السبب التقني: ' : 'Technical Purpose: '}
                  </strong>
                  {language === 'ar'
                    ? currentLesson.guidedTask.whyWeDoThisAr
                    : currentLesson.guidedTask.whyWeDoThisEn}
                </p>
              </div>

              {/* Step-by-Step Interactive Checklist */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-2">
                  {language === 'ar' ? 'الخطوات التنفيذية المطلوبة' : 'Execution Steps'}
                </h4>
                <div className="space-y-2.5">
                  {(language === 'ar'
                    ? currentLesson.guidedTask.instructionsAr
                    : currentLesson.guidedTask.instructionsEn
                  ).map((stepText, idx) => {
                    const stepKey = `task-${currentLesson.id}-step-${idx}`;
                    const isChecked = !!checkedTaskSteps[stepKey];
                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          setCheckedTaskSteps((prev) => ({ ...prev, [stepKey]: !isChecked }))
                        }
                        className={`w-full p-3.5 rounded-xl border text-left rtl:text-right flex items-start gap-3 transition-colors ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'bg-slate-900 border-slate-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className={`text-xs leading-relaxed ${isChecked ? 'line-through text-slate-400' : ''}`}>
                          {stepText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Launch Simulation Directly from Task */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40">
                <div className="text-xs text-cyan-300">
                  {language === 'ar'
                    ? 'نفذ هذه الخطوات داخل بيئة المحاكاة التفاعلية:'
                    : 'Execute these steps inside the live simulation environment:'}
                </div>
                <button
                  onClick={handleLaunchSimulation}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'ar' ? 'الانتقال إلى المحاكي والتطبيق' : 'Open Lab to Practice'}</span>
                </button>
              </div>

              {/* Hints Drawer */}
              <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                <button
                  onClick={() => setShowHints((prev) => !prev)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>
                      {showHints
                        ? language === 'ar'
                          ? 'إخفاء التلميحات والمساعدة'
                          : 'Hide Hints'
                        : language === 'ar'
                        ? 'هل تواجه صعوبة؟ اعرض التلميحات الإرشادية'
                        : 'Stuck? Reveal Helpful Hints'}
                    </span>
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showHints ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {showHints && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                    {(language === 'ar'
                      ? currentLesson.guidedTask.hintsAr
                      : currentLesson.guidedTask.hintsEn
                    ).map((hint, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200/90 flex items-start gap-2"
                      >
                        <span className="font-mono text-amber-400 shrink-0">#{idx + 1}</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Validation Criterion */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="text-white block mb-0.5">
                    {language === 'ar' ? 'معيار التحقق والنجاح:' : 'Validation Criterion:'}
                  </strong>
                  {language === 'ar'
                    ? currentLesson.guidedTask.validationCriterionAr
                    : currentLesson.guidedTask.validationCriterionEn}
                </div>
              </div>

              {/* Stage Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(2)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{language === 'ar' ? 'السابق: المعاينة' : 'Back: Demo'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(4)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{language === 'ar' ? 'المرحلة 5: شرح النتيجة' : 'Stage 5: Result & Impact'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: Result Explanation & Security Significance */}
          {activeStage === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* What Happened Technically */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'ar' ? 'ماذا حدث تقنياً خلف الكواليس؟' : 'What Happened Behind the Scenes'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? currentLesson.resultExplanation.whatHappenedAr
                    : currentLesson.resultExplanation.whatHappenedEn}
                </p>
              </div>

              {/* Security Significance in Enterprise Defence */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
                <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
                    {language === 'ar' ? 'الأهمية في الدفاع السيبراني للمؤسسات' : 'Enterprise Defence Significance'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? currentLesson.resultExplanation.securitySignificanceAr
                    : currentLesson.resultExplanation.securitySignificanceEn}
                </p>
              </div>

              {/* Stage Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(3)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{language === 'ar' ? 'السابق: المهمة العملية' : 'Back: Task'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(5)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{language === 'ar' ? 'المرحلة 6: فحص المعرفة' : 'Stage 6: Knowledge Check'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: Interactive Knowledge Check (Quiz) */}
          {activeStage === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Award className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                    {language === 'ar' ? 'الفحص المعرفي التفاعلي السريع' : 'Instant Knowledge Validation'}
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  {language === 'ar'
                    ? 'أجب عن الأسئلة التالية لتثبيت المفاهيم وتأكيد استيعابك للمحطة قبل الانتقال.'
                    : 'Answer the questions below to solidify your understanding before advancing.'}
                </p>
              </div>

              {/* Quiz Questions */}
              <div className="space-y-6">
                {currentLesson.knowledgeCheck.map((question, qIdx) => {
                  const selectedOptId = quizAnswers[question.id];
                  const isSubmitted = !!quizSubmitted[question.id];

                  return (
                    <div
                      key={question.id}
                      className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          Q{qIdx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-snug">
                          {language === 'ar' ? question.questionAr : question.questionEn}
                        </h4>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {question.options.map((option) => {
                          const isSelected = selectedOptId === option.id;
                          const showCorrectness = isSubmitted;
                          const isOptionCorrect = option.isCorrect;

                          let optionStyle =
                            'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300';
                          if (showCorrectness) {
                            if (isOptionCorrect) {
                              optionStyle = 'bg-emerald-950/30 border-emerald-600/80 text-emerald-200';
                            } else if (isSelected && !isOptionCorrect) {
                              optionStyle = 'bg-rose-950/30 border-rose-600/80 text-rose-200';
                            }
                          } else if (isSelected) {
                            optionStyle = 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200';
                          }

                          return (
                            <button
                              key={option.id}
                              onClick={() => handleSelectOption(question.id, option.id)}
                              className={`w-full p-3.5 rounded-xl border text-left rtl:text-right transition-all flex items-start gap-3 ${optionStyle}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                                  isSelected
                                    ? isOptionCorrect && showCorrectness
                                      ? 'border-emerald-400 bg-emerald-500'
                                      : !isOptionCorrect && showCorrectness
                                      ? 'border-rose-400 bg-rose-500'
                                      : 'border-cyan-400 bg-cyan-500'
                                    : 'border-slate-700 bg-slate-900'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                                )}
                              </div>
                              <span className="text-xs leading-relaxed flex-1">
                                {language === 'ar' ? option.textAr : option.textEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Feedback Box */}
                      {isSubmitted && selectedOptId && (
                        <div
                          className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-150 ${
                            question.options.find((o) => o.id === selectedOptId)?.isCorrect
                              ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                              : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                          }`}
                        >
                          <strong className="block mb-1 font-bold">
                            {question.options.find((o) => o.id === selectedOptId)?.isCorrect
                              ? language === 'ar'
                                ? '✓ إجابة صحيحة ومتقنة!'
                                : '✓ Excellent! Correct Answer.'
                              : language === 'ar'
                              ? '✕ إجابة غير دقيقة:'
                              : '✕ Incorrect:'}
                          </strong>
                          <span>
                            {language === 'ar'
                              ? question.options.find((o) => o.id === selectedOptId)?.explanationAr
                              : question.options.find((o) => o.id === selectedOptId)?.explanationEn}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stage Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(4)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{language === 'ar' ? 'السابق: شرح النتيجة' : 'Back: Result'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(6)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{language === 'ar' ? 'المرحلة 7: الخطوة التالية والانتقال' : 'Stage 7: Next Step'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: Next Step & Lesson Completion */}
          {activeStage === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Key Takeaway */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Award className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider">
                    {language === 'ar' ? 'الخلاصة والرسالة الذهبية للمحطة' : 'Golden Takeaway'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                  "{language === 'ar' ? currentLesson.nextStep.takeawayAr : currentLesson.nextStep.takeawayEn}"
                </p>
              </div>

              {/* Celebration / Completion Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-emerald-950/30 border border-cyan-800/50 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 mx-auto flex items-center justify-center shadow-xl shadow-cyan-950/60">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {language === 'ar'
                      ? `تهانينا! لقد أتممت ${currentLesson.titleAr}`
                      : `Great job! You have completed ${currentLesson.titleEn}`}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                    {language === 'ar'
                      ? 'لقد بنيت أساساً صلباً في هذا المفهوم. اضغط على الزر أدناه لتثبيت تقدمك والانتقال تلقائياً إلى المحطة التالية.'
                      : 'You have built solid foundational intuition. Confirm your progress below and advance to the next milestone.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleCompleteAndNext}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-950/50 transition-transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>
                      {currentLesson.nextStep.nextLessonId
                        ? language === 'ar'
                          ? 'إكمال والانتقال إلى المحطة التالية'
                          : 'Complete & Advance to Next Milestone'
                        : language === 'ar'
                        ? 'إكمال المسار التأسيسي بنجاح!'
                        : 'Finish Beginner Foundations!'}
                    </span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>

              {/* Stage Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(5)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{language === 'ar' ? 'السابق: فحص المعرفة' : 'Back: Quiz'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
