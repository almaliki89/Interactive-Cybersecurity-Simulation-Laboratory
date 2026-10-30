import React, { useState, useEffect, useRef } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { MACRO_DOMAINS } from '../../data/universeData';
import {
  Shield,
  Server,
  Globe,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  Lock,
  Compass,
  FolderGit2,
  Database,
  Cloud,
  Search,
  BookOpen,
  Eye,
  CheckCircle2,
  Cpu,
  Workflow,
  Key,
  Laptop,
  Target,
  Flag,
  Award,
  AlertCircle,
} from 'lucide-react';
import { CURRICULUM_LESSONS, CURRICULUM_MILESTONES } from '../../data/curriculumData';

interface EnterprisePacket {
  id: string;
  source: string;
  destination: string;
  port: number;
  protocol: string;
  progress: number;
  state: 'moving' | 'blocked' | 'delivered';
  isMalicious: boolean;
  whyReason?: string;
}

export const InteractiveEnterpriseHero: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const setSelectedMacroDomainId = useSimulationStore((s) => s.setSelectedMacroDomainId);
  const setSelectedWorldId = useSimulationStore((s) => s.setSelectedWorldId);
  const setIsSearchOpen = useSimulationStore((s) => s.setIsSearchOpen);
  const completedChallenges = useSimulationStore((s) => s.completedChallenges);
  const recordOnboardingAction = useSimulationStore((s) => s.recordOnboardingAction);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const landingFirewallMode = useSimulationStore((s) => s.landingFirewallMode);
  const setLandingFirewallMode = useSimulationStore((s) => s.setLandingFirewallMode);
  const selectedEntity = useSimulationStore((s) => s.selectedEntity);
  const selectEntity = useSimulationStore((s) => s.selectEntity);
  const clearSelection = useSimulationStore((s) => s.clearSelection);
  const onboardingStep = useSimulationStore((s) => s.onboardingStep);
  const activeLessonId = useSimulationStore((s) => s.activeLessonId) || 'lesson-01-cia-triad';
  const completedLessons = useSimulationStore((s) => s.completedLessons) || [];
  const lessonProgress = useSimulationStore((s) => s.lessonProgress) || {};

  const isAr = language === 'ar';
  const activeLesson = CURRICULUM_LESSONS[activeLessonId] || CURRICULUM_LESSONS['lesson-01-cia-triad'];
  const activeMilestone = CURRICULUM_MILESTONES.find((m) => m.id === activeLesson?.milestoneId) || CURRICULUM_MILESTONES[0];
  const nextLessonId = activeLesson?.nextStep?.nextLessonId;
  const nextLesson = nextLessonId ? CURRICULUM_LESSONS[nextLessonId] : null;

  const totalLessonsCount = Object.keys(CURRICULUM_LESSONS).length;
  const progressPercent = Math.min(100, Math.round((completedLessons.length / (totalLessonsCount || 1)) * 100));

  const isCurrentLessonDone = completedLessons.includes(activeLessonId);
  const currentProg = lessonProgress[activeLessonId];
  const isCurrentLessonStarted = currentProg && (currentProg.currentStage > 0 || Object.keys(currentProg.checkedTaskSteps || {}).length > 0);

  const activeLessonStatus: 'not_started' | 'in_progress' | 'needs_review' | 'completed_verified' =
    isCurrentLessonDone
      ? 'completed_verified'
      : isCurrentLessonStarted
        ? (currentProg?.isQuizPassed && !currentProg?.isTaskPassed ? 'needs_review' : 'in_progress')
        : 'not_started';

  const [isPaused, setIsPaused] = useState(false);
  const [packets, setPackets] = useState<EnterprisePacket[]>([]);
  const [followedPacketId, setFollowedPacketId] = useState<string | null>(null);
  const [whatChangedDiff, setWhatChangedDiff] = useState<{ before: string; after: string; reason: string } | null>(null);
  const [activityStream, setActivityStream] = useState<Array<{ id: string; time: string; tag: string; messageAr: string; messageEn: string; level: 'info' | 'warn' | 'threat' | 'success' }>>([]);

  const nextPktId = useRef(1);



  // Activity Stream Generator
  useEffect(() => {
    const events = [
      { tag: 'DNS', messageAr: 'حل اسم النطاق api.internal.nexora عبر الخادم 10.0.0.53', messageEn: 'DNS recursive query resolved api.internal.nexora -> 10.0.0.53', level: 'info' },
      { tag: 'TLS 1.3', messageAr: 'تأسيس قناة مشفرة بمفتاح ECDHE وشهادة Root CA موثوقة', messageEn: 'TLS 1.3 channel established with ECDHE & trusted X.509 cert', level: 'success' },
      { tag: 'FIREWALL', messageAr: 'إسقاط حزمة واردة على المنفذ 445 (SMB) قادمة من WAN', messageEn: 'Firewall dropped ingress WAN probe targeting Port 445 SMB', level: 'warn' },
      { tag: 'KERBEROS', messageAr: 'إصدار تذكرة الخدمة TGS للمستخدم Sarah.Dev للوصول لخادم DB', messageEn: 'Kerberos TGS ticket granted for Sarah.Dev to DB service', level: 'info' },
      { tag: 'SIEM', messageAr: 'ربط 5 محاولات دخول فاشلة من IP 203.0.113.88 -> إنذار هجوم تخمين', messageEn: 'Correlated 5 failed logons from 203.0.113.88 -> Brute-Force Alert', level: 'threat' },
      { tag: 'APPSEC', messageAr: 'تنقية مدخلات SQL عبر استعلام معلمي (Prepared Statement)', messageEn: 'SQL query parameterized safely; zero injection risk', level: 'success' },
      { tag: 'EDR', messageAr: 'مراقبة إنشاء عملية PowerShell بدون توقيع مشبوه -> فحص النواة', messageEn: 'EDR audited unsigned PowerShell child process spawned by agent', level: 'info' },
    ] as const;

    const interval = setInterval(() => {
      if (isPaused) return;
      const randomEvt = events[Math.floor(Math.random() * events.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setActivityStream((prev) => [
        { id: `act-${Date.now()}`, time: timeStr, ...randomEvt },
        ...prev.slice(0, 5),
      ]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Spawning packets in the digital enterprise
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const isMalicious = Math.random() < 0.45;
      const portChoices = isMalicious ? [23, 445, 80, 22] : [443, 53, 443, 88];
      const port = portChoices[Math.floor(Math.random() * portChoices.length)];

      const newPkt: EnterprisePacket = {
        id: `pkt-${nextPktId.current++}`,
        source: isMalicious ? '203.0.113.88' : '198.51.100.14',
        destination: '10.0.0.50',
        port,
        protocol: port === 53 ? 'DNS' : port === 443 ? 'HTTPS' : port === 88 ? 'Kerberos' : port === 23 ? 'TELNET' : port === 445 ? 'SMB' : 'HTTP',
        progress: 0,
        state: 'moving',
        isMalicious,
        whyReason: isMalicious ? 'قادم من نطاق خارجي مجهول يستهدف منفذاً غير مشفر' : 'طلب شرعي مشفر عبر HTTPS/DNS',
      };

      setPackets((prev) => [...prev.slice(-10), newPkt]);
    }, 900);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Packet animation loop
  const packetsRef = useRef<EnterprisePacket[]>([]);
  packetsRef.current = packets;

  useEffect(() => {
    let animId: number;
    const update = () => {
      if (isPaused) {
        animId = requestAnimationFrame(update);
        return;
      }

      const current = packetsRef.current;
      const next: EnterprisePacket[] = [];

      for (const p of current) {
        if (p.state === 'delivered' || p.state === 'blocked') {
          next.push({ ...p, progress: p.progress + 0.6 });
          continue;
        }

        const nextProg = p.progress + 1.1;

        // Firewall encounter at 48%
        if (nextProg >= 48 && p.progress < 48) {
          const shouldBlock =
            landingFirewallMode === 'block_all' ||
            (landingFirewallMode === 'strict' && p.port !== 443 && p.port !== 53) ||
            p.port === 23 ||
            p.port === 445;

          if (shouldBlock) {
            next.push({
              ...p,
              progress: 48,
              state: 'blocked',
              whyReason:
                landingFirewallMode === 'block_all'
                  ? 'سياسة الحظر الشامل الافتراضية مفعلة'
                  : `جدار الحماية أسقط المنفذ ${p.port} (${p.protocol}) لمنع التهديدات غير المشفرة`,
            });
            continue;
          }
        }

        if (nextProg >= 100) {
          next.push({ ...p, progress: 100, state: 'delivered' });
          continue;
        }

        next.push({ ...p, progress: nextProg });
      }

      setPackets(next.filter((p) => p.progress <= 112));
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [landingFirewallMode, isPaused]);

  const handleModeChange = (mode: 'strict' | 'permissive' | 'block_all') => {
    const beforeStr =
      landingFirewallMode === 'strict' ? 'صارم (HTTPS/DNS)' : landingFirewallMode === 'block_all' ? 'حظر شامل' : 'سماح واسع';
    const afterStr = mode === 'strict' ? 'صارم (HTTPS/DNS)' : mode === 'block_all' ? 'حظر شامل' : 'سماح واسع';
    
    setLandingFirewallMode(mode);
    
    setWhatChangedDiff({
      before: `الوضع السابق: ${beforeStr}`,
      after: `الوضع الجديد: ${afterStr}`,
      reason:
        mode === 'block_all'
          ? 'تم إيقاف كافة المنافذ لمنع أي اتصال طارئ'
          : mode === 'strict'
          ? 'تم حصر المرور على المنافذ المشفرة فقط 443 و 53'
          : 'تم فتح المنافذ للاختبار غير المقيد',
    });

    if (onboardingStep === 2 && mode !== 'strict') {
      recordOnboardingAction('alter_policy');
      completeChallenge('orientation-guided-challenge', { success: true });
    }
  };

  const followedPacket = packets.find((p) => p.id === followedPacketId);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-8 flex flex-col items-center select-none transition-colors duration-200">
      {/* 1. Technical Wordmark & Purpose Banner */}
      <div className="max-w-5xl w-full text-center mt-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-cyan-400 mb-4 shadow-sm backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono uppercase tracking-widest text-[11px] font-bold">
            {language === 'ar' ? 'منصة ZORG السيبرانية الوطنية' : 'ZORG CYBER DEFENSE PLATFORM'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 text-[11px]">
            {language === 'ar' ? '60 عالماً وميدان عمليات حي' : '60 Living Simulation Worlds'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] text-balance">
          {language === 'ar'
            ? 'احترف الأمن السيبراني عبر الممارسة الحية ومحاكاة المعارك الواقعية.'
            : 'Master Cybersecurity Through Live Real-World Simulation.'}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-3 text-balance leading-relaxed">
          {language === 'ar'
            ? 'تتبع تدفق الحزم في الزمن الحقيقي، تصدَّ للهجمات، وتحكم بجدران الحماية ومصادقة Kerberos في بيئة عملياتية حية تتفاعل لحظياً مع كل قرار أمني تتخذه.'
            : 'Inspect live network packet streams, neutralize cyber attacks, and command next-gen firewalls in a living digital twin responding to your every action.'}
        </p>

        {/* Global Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6">
          <button
            onClick={() => setActiveSimulation('lesson')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{language === 'ar' ? 'ابدأ التعلّم من الصفر (المسار العملي)' : 'Start Hands-On Learning Track'}</span>
          </button>

          <button
            onClick={() => setActiveSimulation('range')}
            className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/60 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all hover:bg-slate-800/80 shadow-sm"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>{language === 'ar' ? 'دخول الميدان السيبراني الشامل (World 60)' : 'Enter Enterprise Cyber Range'}</span>
          </button>

          <button
            onClick={() => setActiveSimulation('explorer')}
            className="px-5 py-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span>{language === 'ar' ? 'استكشاف العوالم الـ 60' : 'Explore 60 Worlds'}</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-slate-400 hover:text-white text-xs flex items-center gap-2 font-mono hover:border-slate-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>⌘K</span>
          </button>
        </div>

        {/* Beginner Journey Command Center (4 Questions Hub) */}
        <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl text-left rtl:text-right max-w-5xl mx-auto backdrop-blur-md">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-tight">
                    {isAr ? 'مركز رحلة الطالب وتوجيه المبتدئ' : 'Student Mission & Beginner Journey Hub'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                    {isAr ? 'رحلة خطوة بخطوة' : 'Step-by-Step Flow'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'إجابات فورية توجه خطواتك التعليمية من الصفر إلى إثبات الاحتراف العملي'
                    : 'Clear guidance answering the 4 foundational questions from zero to verified mastery'}
                </p>
              </div>
            </div>

            {/* Resume / Next Action Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSimulation('paths')}
                data-testid="hero-career-tracks-btn"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Workflow className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? 'المسارات التخصصية' : 'Career Tracks'}</span>
              </button>
              <button
                onClick={() => setActiveSimulation('lesson')}
                data-testid="hero-resume-learning-btn"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 transition-transform active:scale-95"
              >
                <span>
                  {isCurrentLessonDone
                    ? isAr ? 'استئناف المنهج' : 'Resume Curriculum'
                    : isCurrentLessonStarted
                      ? isAr ? 'متابعة الدرس قيد الدراسة' : 'Continue Current Lesson'
                      : isAr ? 'بدء أول درس عملي' : 'Start First Practical Lesson'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* 4 Questions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Q1: أين أنا في المنهج؟ */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
                  <div className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{isAr ? '1. أين أنا في المنهج؟' : '1. Where am I?'}</span>
                  </div>
                  <span className="font-mono text-slate-400">{progressPercent}%</span>
                </div>
                <div className="text-xs font-bold text-white line-clamp-1 mb-1">
                  {isAr ? activeMilestone.titleAr : activeMilestone.titleEn}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  {isAr ? activeLesson.titleAr : activeLesson.titleEn}
                </div>
              </div>
              <div className="mt-3">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(6, progressPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Q2: ماذا تعلمت حتى الآن؟ */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>{isAr ? '2. ماذا تعلمت حتى الآن؟' : '2. What have I learned?'}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-lg font-mono font-extrabold text-white">
                    {completedLessons.length}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isAr ? `من أصل ${totalLessonsCount} درساً` : `of ${totalLessonsCount} lessons`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    {completedChallenges.length} {isAr ? 'تحديات مثبتة' : 'Verified Labs'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                    {isAr ? 'تحقق تقني حقيقي' : 'Real Tech Proof'}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-2">
                {isAr ? 'التقييم مبني على حالة المحاكاة' : 'Validated by real sim engine'}
              </div>
            </div>

            {/* Q3: ما المهمة العملية التي يجب أن أنفذها؟ */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                  <div className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>{isAr ? '3. المهمة العملية المطلوبة' : '3. Practical Task'}</span>
                  </div>
                  {/* Status Badge */}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                      activeLessonStatus === 'completed_verified'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : activeLessonStatus === 'in_progress'
                          ? 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse'
                          : activeLessonStatus === 'needs_review'
                            ? 'bg-rose-950 text-rose-300 border-rose-600'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {activeLessonStatus === 'completed_verified' && (isAr ? 'مكتمل وموثّق ✓' : 'Verified ✓')}
                    {activeLessonStatus === 'in_progress' && (isAr ? 'قيد التطبيق ⏳' : 'In Progress ⏳')}
                    {activeLessonStatus === 'needs_review' && (isAr ? 'يحتاج مراجعة ⚠️' : 'Review ⚠️')}
                    {activeLessonStatus === 'not_started' && (isAr ? 'لم يبدأ ⚪' : 'Not Started ⚪')}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 line-clamp-2 mb-1">
                  {isAr ? activeLesson.guidedTask.taskTitleAr : activeLesson.guidedTask.taskTitleEn}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                <span className="font-mono text-cyan-300">
                  {activeLesson.simulationId}
                </span>
                <span className="text-emerald-400 font-medium">
                  {isAr ? 'المتطلبات مستوفاة ✓' : 'Prerequisites Met ✓'}
                </span>
              </div>
            </div>

            {/* Q4: ماذا أدرس بعد إكمالها؟ */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
                  <Flag className="w-3.5 h-3.5" />
                  <span>{isAr ? '4. ماذا أدرس بعد إكمالها؟' : '4. What to study next?'}</span>
                </div>
                {nextLesson ? (
                  <>
                    <div className="text-xs font-bold text-white line-clamp-2 mb-1">
                      {isAr ? nextLesson.titleAr : nextLesson.titleEn}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {isAr ? nextLesson.whyItMattersAr : nextLesson.whyItMattersEn}
                    </div>
                  </>
                ) : (
                  <div className="text-xs font-bold text-emerald-400">
                    {isAr ? 'تهانينا! أكملت المنهج بالكامل.' : 'Congratulations! All milestones completed.'}
                  </div>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{isAr ? 'المستوى اللاحق' : 'Next Tier'}</span>
                <span className="text-purple-300 font-bold">
                  {nextLesson ? `Milestone #${nextLesson.milestoneId}` : 'Cyber Range Master'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive 3-Step Guided Onboarding Strip */}
      <div className="max-w-6xl w-full mb-4 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
            {onboardingStep}
          </span>
          <div>
            <span className="text-xs font-bold text-white block">
              {onboardingStep === 1 && (language === 'ar' ? 'خطوة 1: انقر على جدار الحماية (Firewall) أدناه لمعاينته' : 'Step 1: Click the Edge Firewall below to inspect')}
              {onboardingStep === 2 && (language === 'ar' ? 'خطوة 2: غير سياسة الجدار إلى "حظر شامل" أو "صارم"' : 'Step 2: Change policy to "Block All" or "Strict"')}
              {onboardingStep === 3 && (language === 'ar' ? 'رائع! لقد غيرت سلوك الدفاع المحيطي وشاهدت إسقاط الحزم فوراً' : 'Great! You altered perimeter defense and witnessed instant packet drops')}
            </span>
            <span className="text-[11px] text-cyan-300/80">
              {language === 'ar' ? 'التطبيق يعلمك بالمعاينة والممارسة الحية المباشرة' : 'The UI teaches by making invisible security processes visible'}
            </span>
          </div>
        </div>

        {onboardingStep === 3 && (
          <button
            onClick={() => setActiveSimulation('explorer')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'ابدأ رحلة التعلم في العوالم' : 'Enter Universe'}</span>
          </button>
        )}
      </div>

      {/* 3. The Living Digital Enterprise Stage */}
      <div className="max-w-6xl w-full bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md mb-6">
        {/* Stage Top Command Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {language === 'ar' ? 'المؤسسة الرقمية الحية (Live Digital Mesh)' : 'Living Digital Enterprise'}
              </span>
            </div>

            {/* Freeze / Pause World Button */}
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-colors ${
                isPaused
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Pause/Play Simulation (Spacebar)"
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              <span>{isPaused ? (language === 'ar' ? 'استئناف التدفق' : 'Resume Mesh') : (language === 'ar' ? 'تجميد العالم للفحص' : 'Freeze World')}</span>
            </button>
          </div>

          {/* Firewall Policy Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono font-semibold">
              {language === 'ar' ? 'سياسة الجدار المحيطي:' : 'Perimeter ACL:'}
            </span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => handleModeChange('strict')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  landingFirewallMode === 'strict' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'صارم (443/53)' : 'Strict (443/53)'}
              </button>
              <button
                onClick={() => handleModeChange('block_all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  landingFirewallMode === 'block_all' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'حظر شامل' : 'Block All'}
              </button>
              <button
                onClick={() => handleModeChange('permissive')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  landingFirewallMode === 'permissive' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'سماح واسع' : 'Permissive'}
              </button>
            </div>
          </div>
        </div>

        {/* Live "WHAT CHANGED?" Difference Bar */}
        {whatChangedDiff && (
          <div className="px-5 py-2 bg-slate-950/95 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                {language === 'ar' ? 'ماذا تغير؟' : 'WHAT CHANGED?'}
              </span>
              <span className="text-slate-300 font-medium">{whatChangedDiff.after}</span>
              <span className="text-slate-500">({whatChangedDiff.reason})</span>
            </div>
            <button
              onClick={() => setWhatChangedDiff(null)}
              className="text-[11px] text-slate-500 hover:text-slate-300 font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* The Visual Enterprise Canvas with Interactive Nodes */}
        <div className="relative h-72 sm:h-80 w-full bg-slate-950/95 overflow-hidden flex items-center justify-between px-6 sm:px-12">
          {/* Subtle Grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="enterprise-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#enterprise-grid)" />
          </svg>

          {/* Highway Link Lines */}
          <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0">
            <div className="absolute inset-0 border-t border-dashed border-slate-700" />
          </div>

          {/* Node 1: External Internet WAN (World 03) */}
          <div
            tabIndex={0}
            role="button"
            aria-label={language === 'ar' ? 'الإنترنت العام (WAN Gateway) - World 03' : 'Public Internet (WAN) - World 03'}
            onClick={() => {
              selectEntity('node', 'wan', {
                name: language === 'ar' ? 'الإنترنت العام (WAN Gateway)' : 'Public Internet (WAN)',
                details: language === 'ar' ? 'مصدر تدفق الحزم الواردة والطلبات الشرعية ومحاولات الاستطلاع الخبيثة.' : 'Source of ingress traffic, legitimate user requests, and port scans.',
              });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectEntity('node', 'wan', {
                  name: language === 'ar' ? 'الإنترنت العام (WAN Gateway)' : 'Public Internet (WAN)',
                  details: language === 'ar' ? 'مصدر تدفق الحزم الواردة والطلبات الشرعية ومحاولات الاستطلاع الخبيثة.' : 'Source of ingress traffic, legitimate user requests, and port scans.',
                });
              }
            }}
            className="relative z-10 flex flex-col items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-cyan-950/90 border-2 border-cyan-500/80 flex items-center justify-center shadow-lg shadow-cyan-950/50 group-hover:scale-105 transition-transform">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
            </div>
            <span className="text-xs font-bold text-white mt-2 group-hover:text-cyan-300">
              {language === 'ar' ? 'الإنترنت WAN' : 'Internet WAN'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">World #03</span>
          </div>

          {/* Node 2: Perimeter Firewall (World 04) */}
          <div
            data-testid="hero-node-firewall"
            tabIndex={0}
            role="button"
            aria-label={language === 'ar' ? 'جدار الحماية المحيطي (Edge Firewall) - World 04' : 'Perimeter Firewall - World 04'}
            onClick={() => {
              selectEntity('node', 'fw-01', {
                name: language === 'ar' ? 'جدار الحماية المحيطي (Edge Firewall)' : 'Perimeter Firewall',
                details: language === 'ar' ? 'يفحص الحزم تسلسلياً (First-Match) ويطبق قواعد ACL لعزل المنافذ غير المشفرة.' : 'Inspects packets sequentially, enforcing strict stateful ACL policies.',
              });
              if (onboardingStep === 1) {
                recordOnboardingAction('inspect_firewall');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectEntity('node', 'fw-01', {
                  name: language === 'ar' ? 'جدار الحماية المحيطي (Edge Firewall)' : 'Perimeter Firewall',
                  details: language === 'ar' ? 'يفحص الحزم تسلسلياً (First-Match) ويطبق قواعد ACL لعزل المنافذ غير المشفرة.' : 'Inspects packets sequentially, enforcing strict stateful ACL policies.',
                });
                if (onboardingStep === 1) {
                  recordOnboardingAction('inspect_firewall');
                }
              }
            }}
            className="relative z-10 flex flex-col items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl"
          >
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 shadow-xl group-hover:scale-105 transition-all ${
                landingFirewallMode === 'strict'
                  ? 'bg-emerald-950/90 border-emerald-500 shadow-emerald-950/50'
                  : landingFirewallMode === 'block_all'
                  ? 'bg-rose-950/90 border-rose-500 shadow-rose-950/50 ring-4 ring-rose-500/20'
                  : 'bg-amber-950/90 border-amber-500 shadow-amber-950/50'
              }`}
            >
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="text-xs font-bold text-white mt-2 group-hover:text-cyan-300">
              {language === 'ar' ? 'جدار الحماية' : 'Firewall'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">World #04</span>
          </div>

          {/* Node 3: Web Server & AppSec (World 08/09) */}
          <div
            tabIndex={0}
            role="button"
            aria-label={language === 'ar' ? 'خادم التطبيقات والويب Nginx - World 08 / #09' : 'Web & App Server - World 08 / #09'}
            onClick={() => {
              selectEntity('node', 'web-01', {
                name: language === 'ar' ? 'خادم التطبيقات والويب Nginx' : 'Web & App Server',
                details: language === 'ar' ? 'يستقبل طلبات HTTP/HTTPS ويتحقق من مدخلات المستخدمين لمنع ثغرات الحقن SQLi/XSS.' : 'Handles HTTP lifecycles, terminates TLS, and enforces input sanitization.',
              });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectEntity('node', 'web-01', {
                  name: language === 'ar' ? 'خادم التطبيقات والويب Nginx' : 'Web & App Server',
                  details: language === 'ar' ? 'يستقبل طلبات HTTP/HTTPS ويتحقق من مدخلات المستخدمين لمنع ثغرات الحقن SQLi/XSS.' : 'Handles HTTP lifecycles, terminates TLS, and enforces input sanitization.',
                });
              }
            }}
            className="relative z-10 flex flex-col items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-indigo-950/90 border-2 border-indigo-500/80 flex items-center justify-center shadow-lg shadow-indigo-950/50 group-hover:scale-105 transition-transform">
              <Server className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-white mt-2 group-hover:text-indigo-300">
              {language === 'ar' ? 'خادم التطبيقات' : 'App Server'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">World #08 / #09</span>
          </div>

          {/* Node 4: Database & IAM/Kerberos (World 07/16) */}
          <div
            tabIndex={0}
            role="button"
            aria-label={language === 'ar' ? 'قاعدة البيانات وActive Directory - World 07 / #16' : 'Database & Directory - World 07 / #16'}
            onClick={() => {
              selectEntity('node', 'db-cluster', {
                name: language === 'ar' ? 'قاعدة البيانات وActive Directory' : 'Database & Directory',
                details: language === 'ar' ? 'تخزين مشفر مع مصادقة Kerberos وصلاحيات وصول قائمة على الأدوار RBAC.' : 'Encrypted PostgreSQL storage protected by Kerberos authentication & RBAC.',
              });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectEntity('node', 'db-cluster', {
                  name: language === 'ar' ? 'قاعدة البيانات وActive Directory' : 'Database & Directory',
                  details: language === 'ar' ? 'تخزين مشفر مع مصادقة Kerberos وصلاحيات وصول قائمة على الأدوار RBAC.' : 'Encrypted PostgreSQL storage protected by Kerberos authentication & RBAC.',
                });
              }
            }}
            className="relative z-10 flex flex-col items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-purple-950/90 border-2 border-purple-500/80 flex items-center justify-center shadow-lg shadow-purple-950/50 group-hover:scale-105 transition-transform">
              <Database className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
            </div>
            <span className="text-xs font-bold text-white mt-2 group-hover:text-purple-300">
              {language === 'ar' ? 'قواعد البيانات' : 'Database'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">World #07 / #16</span>
          </div>

          {/* Node 5: SOC & SIEM Correlation (World 24) */}
          <div
            tabIndex={0}
            role="button"
            aria-label={language === 'ar' ? 'مركز العمليات SOC وربط SIEM - World 24' : 'SOC & SIEM Correlation - World 24'}
            onClick={() => {
              selectEntity('node', 'siem-engine', {
                name: language === 'ar' ? 'مركز العمليات SOC وربط SIEM' : 'SOC & SIEM Correlation',
                details: language === 'ar' ? 'يحلل تدفق السجلات الحية ويكتشف الهجمات المعقدة عبر نوافذ الارتباط الزمني.' : 'Ingests telemetry stream, evaluates correlation rules, and triggers containment.',
              });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectEntity('node', 'siem-engine', {
                  name: language === 'ar' ? 'مركز العمليات SOC وربط SIEM' : 'SOC & SIEM Correlation',
                  details: language === 'ar' ? 'يحلل تدفق السجلات الحية ويكتشف الهجمات المعقدة عبر نوافذ الارتباط الزمني.' : 'Ingests telemetry stream, evaluates correlation rules, and triggers containment.',
                });
              }
            }}
            className="relative z-10 flex flex-col items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-rose-950/90 border-2 border-rose-500/80 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400" />
            </div>
            <span className="text-xs font-bold text-white mt-2 group-hover:text-rose-300">
              {language === 'ar' ? 'مركز SOC' : 'SOC Center'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">World #24</span>
          </div>

          {/* Real-Time Moving Packets with Motion */}
          {packets.map((pkt) => {
            const leftPct = 8 + (pkt.progress / 100) * 84;
            const isBlocked = pkt.state === 'blocked';
            const isFollowed = pkt.id === followedPacketId;

            return (
              <div
                key={pkt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setFollowedPacketId(isFollowed ? null : pkt.id);
                  selectEntity('packet', pkt.id, {
                    name: `${pkt.protocol} Packet :${pkt.port}`,
                    details: `المصدر: ${pkt.source} ➔ الوجهة: ${pkt.destination} (${pkt.whyReason || 'حزمة بيانات'})`,
                  });
                }}
                style={{
                  left: `${leftPct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-20 cursor-pointer flex flex-col items-center transition-opacity ${
                  isBlocked ? 'animate-pulse' : ''
                } ${isFollowed ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 rounded' : ''}`}
              >
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shadow-md flex items-center gap-1 transition-transform hover:scale-110 ${
                    isBlocked
                      ? 'bg-rose-600 border-rose-400 text-white'
                      : pkt.isMalicious
                      ? 'bg-amber-600 border-amber-300 text-white'
                      : 'bg-cyan-600 border-cyan-300 text-white'
                  }`}
                >
                  <span>{pkt.protocol}</span>
                  <span className="text-[9px] opacity-80">:{pkt.port}</span>
                </div>
                {isBlocked && (
                  <span className="text-[8px] font-mono bg-rose-950 text-rose-300 px-1 rounded mt-0.5 border border-rose-800">
                    BLOCKED
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Entity Live Inspector Strip */}
        {selectedEntity && (
          <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                {selectedEntity.type}
              </span>
              <span className="font-bold text-white">{selectedEntity.data?.name}</span>
              <span className="text-slate-400 hidden sm:inline">— {selectedEntity.data?.details}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const type = selectedEntity.data?.name || '';
                  if (type.includes('Firewall')) setActiveSimulation('firewall');
                  else if (type.includes('Server')) setActiveSimulation('http');
                  else if (type.includes('Database')) setActiveSimulation('active_directory');
                  else if (type.includes('SOC')) setActiveSimulation('siem');
                  else setActiveSimulation('subnet_routing');
                }}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>{language === 'ar' ? 'فتح المحاكي المخصص' : 'Launch Full Lab'}</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </button>
              <button
                onClick={() => {
                  clearSelection();
                  setFollowedPacketId(null);
                }}
                className="text-slate-400 hover:text-white p-1 font-mono"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Live Cyber Activity Stream */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono font-bold text-slate-400 uppercase">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'ar' ? 'تدفق النشاط الحي:' : 'Live Stream:'}</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {activityStream.map((item) => (
              <div
                key={item.id}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono whitespace-nowrap flex items-center gap-1.5 shrink-0 animate-in fade-in slide-in-from-right duration-200 ${
                  item.level === 'threat'
                    ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                    : item.level === 'warn'
                    ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                    : item.level === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-[10px] opacity-70">{item.time}</span>
                <span className="font-bold text-cyan-400">[{item.tag}]</span>
                <span>{language === 'ar' ? item.messageAr : item.messageEn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Live Miniature 10 Macro-Domains Universe Map Preview */}
      <div className="max-w-6xl w-full mt-2 mb-8">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>{language === 'ar' ? 'نطاقات الكون السيبراني الشامل (10 Macro Domains)' : '10 Macro Cybersecurity Domains'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'ar' ? 'انقر على أي نطاق للدخول المباشر إلى عوالمه ومفاهيمه التفاعلية' : 'Explore interconnected worlds across the full security spectrum'}
            </p>
          </div>
          <button
            onClick={() => setActiveSimulation('explorer')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>{language === 'ar' ? 'عرض كافة العوالم الـ 60' : 'View All 60 Worlds'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MACRO_DOMAINS.map((domain) => {
            return (
              <div
                key={domain.id}
                onClick={() => {
                  setSelectedMacroDomainId(domain.id);
                  setActiveSimulation('explorer');
                }}
                className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/80 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                      Domain {domain.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {domain.worldIds.length} {language === 'ar' ? 'عوالم' : 'Worlds'}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {language === 'ar' ? domain.nameAr : domain.nameEn}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {language === 'ar' ? domain.subtitleAr : domain.subtitleEn}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                  <span>{language === 'ar' ? 'استكشاف النطاق' : 'Explore Domain'}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
