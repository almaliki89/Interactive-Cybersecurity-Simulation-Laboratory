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
  AlertCircle,
  Info,
  LockKeyhole,
} from 'lucide-react';

export const LessonView: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const activeLessonId = useSimulationStore((s) => s.activeLessonId) || 'lesson-01-cia-triad';
  const setActiveLessonId = useSimulationStore((s) => s.setActiveLessonId);
  const completedLessons = useSimulationStore((s) => s.completedLessons) || [];
  const completeLesson = useSimulationStore((s) => s.completeLesson);
  const completedChallenges = useSimulationStore((s) => s.completedChallenges) || [];
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const setSelectedWorldId = useSimulationStore((s) => s.setSelectedWorldId);
  const lessonProgress = useSimulationStore((s) => s.lessonProgress);
  const setLessonStage = useSimulationStore((s) => s.setLessonStage);

  // Active Stage tab (0: Objectives, 1: Concept, 2: Demo, 3: Task, 4: Impact, 5: Quiz, 6: Next Step)
  const activeStage = lessonProgress[activeLessonId]?.currentStage || 0;
  const furthestUnlockedStage = lessonProgress[activeLessonId]?.furthestUnlockedStage || 0;

  const setActiveStage = (stage: number) => {
    setLessonStage(activeLessonId, stage);
  };

  // Quiz state: questionId -> selectedOptionId
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Guided task states
  const [checkedTaskSteps, setCheckedTaskSteps] = useState<Record<string, boolean>>({});
  const [manualConfirmationChecked, setManualConfirmationChecked] = useState<Record<string, boolean>>({});
  const [simStatusFeedback, setSimStatusFeedback] = useState<string | null>(null);
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

  // Is current lesson already completed in store
  const isLessonAlreadyCompleted = completedLessons.includes(currentLesson.id);

  // 1. Task verification evaluation
  const isInteractive = currentLesson.guidedTask.checkType === 'interactive_simulation';
  const hasLinkedChallenge = isInteractive && !!currentLesson.challengeId;
  const isSimulationChallengeDone = hasLinkedChallenge
    ? completedChallenges.includes(currentLesson.challengeId!)
    : false;

  const isManualConfirmed = !!manualConfirmationChecked[currentLesson.id];

  const isTaskPassed = isInteractive
    ? (hasLinkedChallenge ? isSimulationChallengeDone : false)
    : isManualConfirmed;

  // 2. Knowledge check (Quiz) evaluation
  const totalQuizQuestions = currentLesson.knowledgeCheck.length;
  const correctQuizAnswersCount = currentLesson.knowledgeCheck.filter((q) => {
    const selectedOptId = quizAnswers[q.id];
    if (!selectedOptId) return false;
    const opt = q.options.find((o) => o.id === selectedOptId);
    return opt?.isCorrect === true;
  }).length;
  const isQuizPassed = totalQuizQuestions > 0 && correctQuizAnswersCount === totalQuizQuestions;

  // 3. Strict completion gating
  const isLessonReadyToComplete = isQuizPassed && isTaskPassed;

  // Handle Quiz Option Selection
  const handleSelectOption = (questionId: string, optionId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setQuizSubmitted((prev) => ({ ...prev, [questionId]: true }));
  };

  // Launch the corresponding interactive simulation while preserving activeLessonId
  const handleLaunchSimulation = () => {
    if (currentLesson.worldId) {
      setSelectedWorldId(currentLesson.worldId);
    }
    setActiveSimulation(currentLesson.simulationId);
  };

  // Re-check live simulation challenge status
  const handleCheckSimStatus = () => {
    if (!currentLesson.challengeId) return;
    const done = useSimulationStore.getState().completedChallenges.includes(currentLesson.challengeId);
    if (done) {
      setSimStatusFeedback(
        isAr
          ? '✓ تم التحقق بنجاح! التحدي مكتمل داخل المحاكي الفعلي.'
          : '✓ Verified! Challenge successfully solved in the live simulator.'
      );
    } else {
      setSimStatusFeedback(
        isAr
          ? '✕ لم يتم رصد حل التحدي بعد. افتح المحاكي وحقق شروط المهمة ثم أعد الفحص.'
          : '✕ Challenge not yet solved. Open the lab, fulfill mission criteria, and re-check.'
      );
    }
  };

  // Mark current lesson complete and advance
  const handleCompleteAndNext = () => {
    if (!isLessonReadyToComplete && !isLessonAlreadyCompleted) {
      return;
    }
    completeLesson(currentLesson.id);
    if (currentLesson.nextStep.nextLessonId && CURRICULUM_LESSONS[currentLesson.nextStep.nextLessonId]) {
      setActiveLessonId(currentLesson.nextStep.nextLessonId);
      setActiveStage(0);
      setQuizAnswers({});
      setQuizSubmitted({});
      setCheckedTaskSteps({});
      setShowHints(false);
      setSimStatusFeedback(null);
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
    setSimStatusFeedback(null);
    setIsSidebarOpen(false);
  };

  const stagesList = [
    { id: 0, labelAr: '1. الأهداف والمدخل', labelEn: '1. Objectives & Overview', isMet: true },
    { id: 1, labelAr: '2. المفهوم والتشبيه', labelEn: '2. Concept & Analogy', isMet: true },
    { id: 2, labelAr: '3. المعاينة الحية', labelEn: '3. Live Demonstration', isMet: true },
    { id: 3, labelAr: '4. المهمة العملية', labelEn: '4. Hands-on Task', isMet: isTaskPassed },
    { id: 4, labelAr: '5. الأثر الأمني', labelEn: '5. Security Impact', isMet: true },
    { id: 5, labelAr: '6. فحص المعرفة', labelEn: '6. Knowledge Check', isMet: isQuizPassed },
    { id: 6, labelAr: '7. الخطوة التالية', labelEn: '7. Next Steps', isMet: isLessonReadyToComplete || isLessonAlreadyCompleted },
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950 text-slate-100 select-none font-sans">
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
                {isAr ? 'مسار المبتدئين خطوة بخطوة' : 'Beginner Learning Track'}
              </h2>
              <span className="text-[10px] text-cyan-400 font-mono">
                {isAr ? '10 محطات تأسيسية متسلسلة' : '10 Step-by-Step Milestones'}
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
              {isAr ? 'نسبة التقدم الكلي' : 'Total Progress'}
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
                      {isAr ? `المحطة ${milestone.id}` : `Milestone ${milestone.id}`}
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
                    {isAr ? milestone.titleAr : milestone.titleEn}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                    {isAr ? milestone.subtitleAr : milestone.subtitleEn}
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
                    {isAr
                      ? `المحطة ${currentMilestone.id} من 10`
                      : `Milestone ${currentMilestone.id} of 10`}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ~{currentLesson.estimatedMinutes} {isAr ? 'دقيقة' : 'mins'}
                  </span>
                  {isLessonAlreadyCompleted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                      <Check className="w-3 h-3" />
                      <span>{isAr ? 'مكتمل سابقاً' : 'Completed'}</span>
                    </span>
                  )}
                </div>
                <h1 className="text-base sm:text-xl font-extrabold text-white leading-tight">
                  {isAr ? currentLesson.titleAr : currentLesson.titleEn}
                </h1>
              </div>
            </div>

            {/* Quick Action: Launch Connected Simulation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLaunchSimulation}
                data-testid="lesson-launch-sim-btn"
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isAr
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
                    <span>{isAr ? stage.labelAr : stage.labelEn}</span>
                    {stage.isMet && stage.id >= 3 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    )}
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
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 backdrop-blur-xs">
                <div className="flex items-center gap-2.5 text-cyan-400 mb-2">
                  <Lightbulb className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
                    {isAr ? 'لماذا يعد هذا المفهوم حاسماً؟' : 'Why This Concept Matters'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isAr ? currentLesson.whyItMattersAr : currentLesson.whyItMattersEn}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'الأهداف التعليمية للمحطة' : 'Learning Objectives'}</span>
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
                        {isAr ? obj.textAr : obj.textEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Big Picture Description */}
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {isAr ? 'الصورة الكلية للمحطة' : 'Milestone Context'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr ? currentMilestone.descriptionAr : currentMilestone.descriptionEn}
                </p>
              </div>

              {/* Action Button: Next Stage */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStage(1)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{isAr ? 'المرحلة 2: المفهوم والتشبيه الحياتي' : 'Stage 2: Concept & Analogy'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 1: Concept & Real-World Analogy */}
          {activeStage === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'الشرح العلمي المبسط' : 'Core Concept Explained'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isAr ? currentLesson.concept.textAr : currentLesson.concept.textEn}
                </p>
              </div>

              {/* Real World Analogy Box */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40">
                <div className="flex items-center gap-2.5 text-amber-400 mb-2">
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
                    {isAr ? 'تشبيه من الحياة اليومية' : 'Real-World Everyday Analogy'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isAr ? currentLesson.concept.analogyAr : currentLesson.concept.analogyEn}
                </p>
              </div>

              {/* Bilingual Key Terms Dictionary */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>
                    {isAr
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
                          {isAr ? term.termAr : term.termEn}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {isAr ? term.termEn : term.termAr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {isAr ? term.definitionAr : term.definitionEn}
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
                  <span>{isAr ? 'السابق: الأهداف' : 'Back: Objectives'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(2)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{isAr ? 'المرحلة 3: المعاينة الحية' : 'Stage 3: Live Demonstration'}</span>
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
                    {isAr
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
                    {isAr ? 'ما الذي يجب أن تلاحظه؟' : 'What To Look For'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isAr
                    ? currentLesson.demonstration.whatToLookForAr
                    : currentLesson.demonstration.whatToLookForEn}
                </p>
              </div>

              {/* Initial State Description */}
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {isAr ? 'حالة النظام الافتراضية الأولية' : 'Initial System State'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? currentLesson.demonstration.initialStateAr
                    : currentLesson.demonstration.initialStateEn}
                </p>
              </div>

              {/* Direct Simulator CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-800/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    {isAr ? 'هل أنت مستعد لمعاينة النظام حياً؟' : 'Ready to inspect the live system?'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'يمكنك فتح المحاكي والتنقل بين الأنظمة ثم العودة عبر زر "العودة للدرس" في أي وقت.'
                      : 'Launch the live simulation, manipulate parameters, and return anytime via the "Return to Lesson" button.'}
                  </p>
                </div>
                <button
                  onClick={handleLaunchSimulation}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isAr ? 'فتح المحاكي الآن' : 'Launch Simulation'}</span>
                </button>
              </div>

              {/* Stage Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{isAr ? 'السابق: المفهوم' : 'Back: Concept'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(3)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{isAr ? 'المرحلة 4: المهمة العملية' : 'Stage 4: Guided Task'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: Guided Hands-On Task & Truthful Verification */}
          {activeStage === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Task Title & Rationale */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {isAr ? 'مهمة عملية تطبيقية' : 'Hands-on Challenge'}
                  </span>
                  {isInteractive ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {isAr ? 'تحقق برمجى من المحاكي' : 'Live Engine Verification'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {isAr ? 'تأكيد يدوي موجه' : 'Guided Manual Confirmation'}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white">
                  {isAr
                    ? currentLesson.guidedTask.taskTitleAr
                    : currentLesson.guidedTask.taskTitleEn}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-semibold">
                    {isAr ? 'السبب والهدف التقني: ' : 'Technical Purpose: '}
                  </strong>
                  {isAr
                    ? currentLesson.guidedTask.whyWeDoThisAr
                    : currentLesson.guidedTask.whyWeDoThisEn}
                </p>
              </div>

              {/* Step-by-Step Reference Steps (clearly labeled as self-organization, NOT automated proof) */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    {isAr ? 'الخطوات التنفيذية المطلوبة (الاسترشادية)' : 'Required Guided Execution Steps'}
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    {isAr ? '(قائمة لتنظيم خطواتك فقط)' : '(For your reference)'}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {(isAr
                    ? currentLesson.guidedTask.instructionsAr
                    : currentLesson.guidedTask.instructionsEn
                  ).map((stepText, idx) => {
                    const stepKey = `task-${currentLesson.id}-step-${idx}`;
                    const isChecked = !!checkedTaskSteps[stepKey];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setCheckedTaskSteps((prev) => ({ ...prev, [stepKey]: !isChecked }))
                        }
                        className={`w-full p-3.5 rounded-xl border text-left rtl:text-right flex items-start gap-3 transition-colors ${
                          isChecked
                            ? 'bg-slate-900/60 border-slate-700/60 text-slate-400'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                            isChecked
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-slate-900 border-slate-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className={`text-xs leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}`}>
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
                  {isAr
                    ? 'نفذ هذه الخطوات داخل بيئة المحاكاة التفاعلية (يمكنك العودة في أي لحظة عبر شريط العودة):'
                    : 'Execute these steps inside the live simulation environment (return anytime via the header):'}
                </div>
                <button
                  onClick={handleLaunchSimulation}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isAr ? 'الانتقال إلى المحاكي والتطبيق' : 'Open Lab to Practice'}</span>
                </button>
              </div>

              {/* Truthful Task Verification Box */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${isTaskPassed ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {isAr ? 'حالة التحقق من المهمة العملية' : 'Practical Task Verification Status'}
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isTaskPassed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {isTaskPassed
                      ? isAr
                        ? '✓ تم التحقق واستيفاء الشرط'
                        : '✓ Task Verified'
                      : isAr
                      ? '✕ بانتظار استيفاء الشرط'
                      : '✕ Pending Verification'}
                  </span>
                </div>

                {/* Validation Criterion description */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                  <strong className="text-white block mb-0.5">
                    {isAr ? 'معيار التحقق والنجاح: المعيار المطلوب للإنجاز' : 'Required Verification Criterion & Success:'}
                  </strong>
                  {isAr
                    ? currentLesson.guidedTask.validationCriterionAr
                    : currentLesson.guidedTask.validationCriterionEn}
                </div>

                {/* Case 1: Interactive Simulation with linked engine challenge */}
                {isInteractive && hasLinkedChallenge && (
                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-3">
                    <div className="text-xs text-cyan-200 leading-relaxed">
                      {isSimulationChallengeDone ? (
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            {isAr
                              ? `تم تأكيد حل التحدي (${currentLesson.challengeId}) برمجياً من المحرك بنجاح.`
                              : `Engine verified: Challenge (${currentLesson.challengeId}) solved in live simulation.`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-amber-300">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            {isAr
                              ? `هذا الدرس مرتبط بتحدٍ حقيقي في المحاكي (${currentLesson.challengeId}). يكتمل هذا الشرط تلقائياً بمجرد حل التحدي داخل لوحة التحديات في المحاكي.`
                              : `This lesson links to a live simulation challenge (${currentLesson.challengeId}). It completes automatically once verified in the simulator.`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleCheckSimStatus}
                        data-testid="check-sim-status-btn"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{isAr ? 'فحص حالة المحاكي الآن' : 'Check Simulator Status'}</span>
                      </button>
                      {simStatusFeedback && (
                        <span className="text-[11px] font-mono text-cyan-300">
                          {simStatusFeedback}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Case 2: Guided Manual Confirmation (honestly declared as self-check, NOT fake telemetry) */}
                {(!isInteractive || !hasLinkedChallenge) && (
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
                    <div className="flex items-start gap-2 text-xs text-purple-300 leading-relaxed">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
                      <div>
                        <strong className="block text-white mb-0.5">
                          {isAr
                            ? 'إقرار تطبيق يدوي موجه (Guided Self-Confirmation):'
                            : 'Guided Manual Confirmation (Self-Check):'}
                        </strong>
                        <span>
                          {isAr
                            ? 'هذا التمرين استكشافي؛ لا يوجد فحص آلي بديل لوعيك وملاحظتك. يرجى تأكيد تطبيق الخطوات في المحاكي وملاحظة النتيجة بنفسك.'
                            : 'This is an exploratory learning task. Please confirm that you applied the steps in the simulator and inspected the expected behavior.'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setManualConfirmationChecked((prev) => ({
                          ...prev,
                          [currentLesson.id]: !prev[currentLesson.id],
                        }))
                      }
                      data-testid="guided-confirmation-toggle-btn"
                      className={`w-full p-3 rounded-xl border text-left rtl:text-right flex items-center gap-3 transition-all ${
                        isManualConfirmed
                          ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          isManualConfirmed
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'bg-slate-800 border-slate-600 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs">
                        {isAr
                          ? 'أؤكد أنني نفذت الخطوات الموجهة في المحاكي ولاحظت النتيجة الموضحة في المعيار.'
                          : 'I confirm that I performed the guided steps in the simulator and observed the expected outcome.'}
                      </span>
                    </button>
                  </div>
                )}
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
                        ? isAr
                          ? 'إخفاء التلميحات والمساعدة'
                          : 'Hide Hints'
                        : isAr
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
                    {(isAr
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

              {/* Stage Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(2)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{isAr ? 'السابق: المعاينة' : 'Back: Demo'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(4)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{isAr ? 'المرحلة 5: شرح النتيجة' : 'Stage 5: Result & Impact'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: Result Explanation & Security Significance */}
          {activeStage === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'ماذا حدث تقنياً خلف الكواليس؟' : 'What Happened Behind the Scenes'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isAr
                    ? currentLesson.resultExplanation.whatHappenedAr
                    : currentLesson.resultExplanation.whatHappenedEn}
                </p>
              </div>

              {/* Security Significance in Enterprise Defence */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
                <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
                    {isAr ? 'الأهمية في الدفاع السيبراني للمؤسسات' : 'Enterprise Defence Significance'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isAr
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
                  <span>{isAr ? 'السابق: المهمة العملية' : 'Back: Task'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(5)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{isAr ? 'المرحلة 6: فحص المعرفة' : 'Stage 6: Knowledge Check'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: Interactive Knowledge Check (Quiz) */}
          {activeStage === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Award className="w-4 h-4" />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                      {isAr ? 'الفحص المعرفي التفاعلي السريع' : 'Instant Knowledge Validation'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isAr
                      ? 'أجب عن الأسئلة التالية لتثبيت المفاهيم. اجتياز جميع الأسئلة بصورة صحيحة شرط أساسي لإكمال المحطة.'
                      : 'Answer the questions below. Answering all correctly is required to complete this milestone.'}
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center gap-2">
                  <span className="text-slate-400">{isAr ? 'النتيجة:' : 'Score:'}</span>
                  <span
                    className={`font-bold ${
                      isQuizPassed ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {correctQuizAnswersCount} / {totalQuizQuestions}
                  </span>
                  {isQuizPassed && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
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
                          {isAr ? question.questionAr : question.questionEn}
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
                              type="button"
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
                                {isAr ? option.textAr : option.textEn}
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
                              ? isAr
                                ? '✓ إجابة صحيحة ومتقنة!'
                                : '✓ Excellent! Correct Answer.'
                              : isAr
                              ? '✕ إجابة غير دقيقة:'
                              : '✕ Incorrect:'}
                          </strong>
                          <span>
                            {isAr
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
                  <span>{isAr ? 'السابق: شرح النتيجة' : 'Back: Result'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(6)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>{isAr ? 'المرحلة 7: الخطوة التالية والانتقال' : 'Stage 7: Next Step'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: Next Step & Strict Lesson Completion Gating */}
          {activeStage === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Key Takeaway */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Award className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider">
                    {isAr ? 'الخلاصة والرسالة الذهبية للمحطة' : 'Golden Takeaway'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                  "{isAr ? currentLesson.nextStep.takeawayAr : currentLesson.nextStep.takeawayEn}"
                </p>
              </div>

              {/* Strict Completion Checklist Gating */}
              {!isLessonReadyToComplete && !isLessonAlreadyCompleted ? (
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-900/40 text-left rtl:text-right space-y-4">
                  <div className="flex items-center gap-2.5 text-amber-400">
                    <LockKeyhole className="w-5 h-5" />
                    <h3 className="text-base font-bold text-white">
                      {isAr
                        ? 'متطلبات إكمال المحطة غير مستوفاة بعد'
                        : 'Milestone Completion Requirements Pending'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr
                      ? 'لضمان اكتساب المهارة الحقيقية، لا يُسمح بإكمال الدرس بمجرد تصفح المراحل. يجب استيفاء الشرطين التاليين:'
                      : 'To guarantee genuine skill acquisition, advancing requires satisfying both criteria below:'}
                  </p>

                  <div className="space-y-3 pt-1">
                    {/* Condition 1: Knowledge Check */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        isQuizPassed
                          ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isQuizPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs font-semibold">
                          {isAr ? '1. اجتياز الفحص المعرفي:' : '1. Pass Knowledge Check:'}{' '}
                          <span className="font-mono text-slate-400">
                            ({correctQuizAnswersCount}/{totalQuizQuestions})
                          </span>
                        </span>
                      </div>
                      {!isQuizPassed && (
                        <button
                          onClick={() => setActiveStage(5)}
                          className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold shrink-0"
                        >
                          {isAr ? 'حل الاختبار' : 'Take Quiz'}
                        </button>
                      )}
                    </div>

                    {/* Condition 2: Hands-on Task */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        isTaskPassed
                          ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isTaskPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs font-semibold">
                          {isAr ? '2. استيفاء المهمة العملية:' : '2. Complete Hands-on Task:'}{' '}
                          <span className="text-slate-400 font-normal">
                            {isInteractive
                              ? isAr
                                ? '(حل التحدي في المحاكي)'
                                : '(Solve lab challenge)'
                              : isAr
                              ? '(الإقرار اليدوي)'
                              : '(Manual self-check)'}
                          </span>
                        </span>
                      </div>
                      {!isTaskPassed && (
                        <button
                          onClick={() => setActiveStage(3)}
                          className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold shrink-0"
                        >
                          {isAr ? 'الذهاب للمهمة' : 'Go to Task'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Disabled Complete Button with Tooltip */}
                  <div className="pt-2">
                    <button
                      disabled
                      data-testid="complete-lesson-btn"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                    >
                      <LockKeyhole className="w-4 h-4" />
                      <span>
                        {isAr
                          ? 'إكمال المحطة مقفل حتى استيفاء الشروط'
                          : 'Completion Locked Until Requirements Met'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Celebration / Completion Card when Ready */
                <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-emerald-950/30 border border-cyan-800/50 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 mx-auto flex items-center justify-center shadow-xl shadow-cyan-950/60">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      {isAr
                        ? `تهانينا! استوفيت شروط ${currentLesson.titleAr}`
                        : `Great job! You fulfilled requirements for ${currentLesson.titleEn}`}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                      {isAr
                        ? 'لقد بنيت أساساً صلباً واجتزت الفحص المعرفي والمهمة العملية بنجاح. اضغط على الزر أدناه للانتقال للمحطة التالية.'
                        : 'You built genuine intuition and verified both the quiz and practical task. Advance to the next milestone below.'}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleCompleteAndNext}
                      data-testid="complete-lesson-btn"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-950/50 transition-transform active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>
                        {currentLesson.nextStep.nextLessonId
                          ? isAr
                            ? 'إكمال والانتقال إلى المحطة التالية'
                            : 'Complete & Advance to Next Milestone'
                          : isAr
                          ? 'إكمال المسار التأسيسي بنجاح!'
                          : 'Finish Beginner Foundations!'}
                      </span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stage Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStage(5)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{isAr ? 'السابق: فحص المعرفة' : 'Back: Quiz'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
