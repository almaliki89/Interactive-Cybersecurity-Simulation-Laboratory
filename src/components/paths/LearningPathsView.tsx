import React, { useState } from 'react';
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
  Award,
  Target,
  BookOpen,
  AlertTriangle,
  Layers,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';

interface VerifiedSkillDef {
  id: string;
  nameAr: string;
  nameEn: string;
  trackId: string;
  challengeId: string;
  simulationId: SimulationId;
  worldId: number;
  whyItMattersAr: string;
  whyItMattersEn: string;
}

const TRACK_VERIFIED_SKILLS: VerifiedSkillDef[] = [
  {
    id: 'skill-soc-1',
    nameAr: 'فرز وتحليل تنبيهات هجمات التخمين (Brute-Force Triage)',
    nameEn: 'Brute-Force Attack Triage & Analysis',
    trackId: 'soc-analyst',
    challengeId: 'brute-force-triage-challenge',
    simulationId: 'soc',
    worldId: 24,
    whyItMattersAr: 'القدرة على فرز 5+ محاولات فاشلة وتحديد المهاجم وعزل الحساب المصاب.',
    whyItMattersEn: 'Ability to triage failed authentication bursts and isolate compromised accounts.',
  },
  {
    id: 'skill-soc-2',
    nameAr: 'صيد التهديدات المتقدم وتفكيك حملات APT الشاملة',
    nameEn: 'Master APT Campaign Hunting & Detection',
    trackId: 'soc-analyst',
    challengeId: 'master-threat-hunt-challenge',
    simulationId: 'threat_hunting',
    worldId: 33,
    whyItMattersAr: 'ربط أحداث عبر 4 نطاقات وتصميم قواعد كشف دقيقة بنسبة صفر إيجابيات كاذبة.',
    whyItMattersEn: 'Correlating cross-domain events and authoring zero-false-positive detection rules.',
  },
  {
    id: 'skill-dfir-1',
    nameAr: 'سلسلة تحريز الأدلة والتحقق من تجزئة SHA-256',
    nameEn: 'Evidence Chain of Custody & SHA-256 Validation',
    trackId: 'digital-forensics',
    challengeId: 'forensics-custody-challenge',
    simulationId: 'forensics',
    worldId: 30,
    whyItMattersAr: 'تأكيد سلامة الأدلة الجنائية إلكترونياً ومنع التلاعب بالسجلات.',
    whyItMattersEn: 'Cryptographically validating digital evidence hashes against source telemetry.',
  },
  {
    id: 'skill-dfir-2',
    nameAr: 'تحليل تفريغ الذاكرة العشوائية واستخراج العمليات الخبيثة',
    nameEn: 'Volatile RAM Analysis & Memory Artifacts',
    trackId: 'digital-forensics',
    challengeId: 'memory-volatility-challenge',
    simulationId: 'forensics',
    worldId: 31,
    whyItMattersAr: 'استخراج حقن العمليات غير الموقعة في الذاكرة وتحديد عنوان البداية.',
    whyItMattersEn: 'Carving malicious thread injections and unbacked executable regions in RAM.',
  },
  {
    id: 'skill-net-1',
    nameAr: 'تصميم جدار الحماية وقواعد ACL وعزل DMZ',
    nameEn: 'Firewall Policy Architecture & DMZ Ingress',
    trackId: 'network-defender',
    challengeId: 'firewall-dmz-challenge',
    simulationId: 'firewall',
    worldId: 5,
    whyItMattersAr: 'إسقاط المنافذ الخطرة وحماية الخوادم الخلفية من الاختراق المباشر.',
    whyItMattersEn: 'Dropping perimeter probes targeting SMB/RDP and segmenting DMZ traffic.',
  },
  {
    id: 'skill-net-2',
    nameAr: 'تقسيم الشبكات الفرعية وحساب أقنعة التوجيه CIDR',
    nameEn: 'Subnetting & Variable-Length CIDR Routing',
    trackId: 'network-defender',
    challengeId: 'subnet-routing-challenge',
    simulationId: 'subnet_routing',
    worldId: 3,
    whyItMattersAr: 'توزيع عناوين IP بكفاءة وعزل شبكات الإدارة عن أجهزة المستخدمين.',
    whyItMattersEn: 'Subdividing enterprise subnets and establishing non-overlapping routing tables.',
  },
  {
    id: 'skill-appsec-1',
    nameAr: 'تحصين استعلامات SQL عبر المتغيرات المعلمية (Prepared Statements)',
    nameEn: 'SQL Injection Remediation via Prepared Statements',
    trackId: 'appsec-engineer',
    challengeId: 'sqli-prevention-challenge',
    simulationId: 'appsec_api',
    worldId: 9,
    whyItMattersAr: 'منع هجمات سرقة قواعد البيانات عبر فصل البيانات عن كود الاستعلام.',
    whyItMattersEn: 'Neutralizing SQL injection vulnerabilities by separating data from query logic.',
  },
  {
    id: 'skill-appsec-2',
    nameAr: 'تأمين واجهات البرمجة وفرض تحديد المعدل (API Rate Limiting)',
    nameEn: 'API Security & Token Bucket Rate Limiting',
    trackId: 'appsec-engineer',
    challengeId: 'api-ratelimit-challenge',
    simulationId: 'appsec_api',
    worldId: 10,
    whyItMattersAr: 'حماية بوابات الخدمات من هجمات الحرمان من الخدمة واستنزاف الموارد.',
    whyItMattersEn: 'Throttling malicious request floods with deterministic token-bucket algorithms.',
  },
  {
    id: 'skill-devsecops-1',
    nameAr: 'فحص الكود المصدري وإصلاح ثغرات SAST في خط الإنتاج',
    nameEn: 'Static Application Security Testing (SAST) Remediation',
    trackId: 'devsecops',
    challengeId: 'sast-remediation-challenge',
    simulationId: 'devsecops',
    worldId: 22,
    whyItMattersAr: 'اكتشاف وتصحيح العيوب الأمنية قبل طرح التطبيقات للإنتاج.',
    whyItMattersEn: 'Detecting insecure constructs and remediating them before merging to production.',
  },
  {
    id: 'skill-devsecops-2',
    nameAr: 'تقييد صلاحيات كوبرنيتيس وعزل الحاويات (Least Privilege RBAC)',
    nameEn: 'Kubernetes RBAC Hardening & Container Isolation',
    trackId: 'devsecops',
    challengeId: 'k8s-hardening-challenge',
    simulationId: 'containers',
    worldId: 21,
    whyItMattersAr: 'منع الحاويات المخترقة من السيطرة على العقدة الأم أو كشف أسرار العنقود.',
    whyItMattersEn: 'Enforcing minimal RBAC roles and blocking root container privilege escalation.',
  },
];

export const LearningPathsView: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const setSelectedWorldId = useSimulationStore((s) => s.setSelectedWorldId);
  const completedChallenges = useSimulationStore((s) => s.completedChallenges) || [];

  const [activeTab, setActiveTab] = useState<'tracks' | 'skills_report' | 'modes_guide'>('tracks');

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
      <div className="max-w-5xl w-full mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <Workflow className="w-4 h-4" />
              <span>{isAr ? 'المسارات التخصصية والمهنية وتقييم المهارات' : 'Cybersecurity Specialization Tracks & Skills Audit'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isAr ? 'مسارات التعلم والتدرج المهني والتقييم المثبت' : 'Interactive Cybersecurity Learning & Verified Mastery'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {isAr
                ? 'فصل منهجي واضح بين مراحل التعلّم والتدريب والمنافسة، مع تقرير تدقيق يثبت مهاراتك التقنية عملياً داخل المحاكي.'
                : 'Clear architectural separation between Learning, Training, and Competition, with technical skills verified inside live simulators.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('tracks')}
              data-testid="tab-tracks-btn"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'tracks'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>{isAr ? 'المسارات المهنية' : 'Career Tracks'}</span>
            </button>
            <button
              onClick={() => setActiveTab('skills_report')}
              data-testid="tab-skills-report-btn"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'skills_report'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isAr ? 'تقرير المهارات المثبتة' : 'Skills Report'}</span>
            </button>
            <button
              onClick={() => setActiveTab('modes_guide')}
              data-testid="tab-modes-guide-btn"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'modes_guide'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'التعلم vs التدريب vs المنافسة' : 'Learn vs Train vs Compete'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CAREER TRACKS VIEW */}
      {activeTab === 'tracks' && (
        <>
          {/* Featured Beginner Track Callout */}
          <div className="max-w-5xl w-full mb-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30 border border-emerald-800/60 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 mb-1">
                  {isAr ? 'المسار الإلزامي الأول للمبتدئين' : 'Recommended Starting Point for Beginners'}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {isAr ? 'مسار التأسيس خطوة بخطوة (11 محطة تعليمية)' : 'Foundations Step-by-Step Curriculum (11 Milestones)'}
                </h2>
                <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                  {isAr
                    ? 'لا تمتلك خبرة سابقة؟ ابدأ من هنا. مسار مصمم بعناية يقودك من ثالوث الحماية الأساسي وشبكات الحاسوب حتى الميدان السيبراني.'
                    : 'No prior experience? Start here. Carefully crafted sequence guiding you from CIA Triad and networking to cyber range operations.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSimulation('lesson')}
              data-testid="start-beginner-track-btn"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-transform active:scale-95"
            >
              <span>{isAr ? 'بدء مسار المبتدئين الآن' : 'Start Beginner Track Now'}</span>
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
        </>
      )}

      {/* TAB 2: VERIFIED SKILLS AUDIT REPORT */}
      {activeTab === 'skills_report' && (
        <div className="max-w-5xl w-full space-y-6">
          {/* Audit Metrics Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base sm:text-lg font-bold text-white">
                    {isAr ? 'تقرير تدقيق المهارات السيبرانية المثبتة' : 'Verified Cybersecurity Technical Competency Report'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
                    {isAr ? 'مُثبت بمحرك المحاكاة' : 'Sim-Engine Validated'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                  {isAr
                    ? 'يتم تقييم كل مهارة بناءً على حالة الأنظمة والشبكات والسجلات الفعلية داخل المحاكي، لا بالضغط على أزرار إكمال شكلية.'
                    : 'Each competency is proven through verified live simulation state, rejecting synthetic skips or unverified UI clicks.'}
                </p>
              </div>
            </div>

            {/* Live Progress Metric */}
            <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-right rtl:text-left">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  {isAr ? 'نسبة الإتقان المثبت' : 'Verified Mastery'}
                </div>
                <div className="text-xl font-mono font-extrabold text-cyan-400">
                  {Math.round(
                    (TRACK_VERIFIED_SKILLS.filter((s) => completedChallenges.includes(s.challengeId)).length /
                      TRACK_VERIFIED_SKILLS.length) *
                      100
                  )}
                  %
                </div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-left rtl:text-right">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  {isAr ? 'المهارات المنجزة' : 'Skills Verified'}
                </div>
                <div className="text-sm font-mono font-bold text-emerald-400">
                  {TRACK_VERIFIED_SKILLS.filter((s) => completedChallenges.includes(s.challengeId)).length} /{' '}
                  {TRACK_VERIFIED_SKILLS.length}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Skills List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'مصفوفة الكفاءات التخصصية عبر المسارات الـ 5' : 'Competency Matrix Across 5 Career Tracks'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRACK_VERIFIED_SKILLS.map((skill) => {
                const isVerified = completedChallenges.includes(skill.challengeId);
                return (
                  <div
                    key={skill.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isVerified
                        ? 'bg-emerald-950/20 border-emerald-800/60'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {skill.trackId.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border flex items-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                              : 'bg-amber-950 text-amber-300 border-amber-600'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{isAr ? 'مكتمل وموثّق تقنياً ✓' : 'Verified Complete ✓'}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{isAr ? 'قيد التدريب والتطبيق ⏳' : 'Needs Practice ⏳'}</span>
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                        {isAr ? skill.nameAr : skill.nameEn}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        {isAr ? skill.whyItMattersAr : skill.whyItMattersEn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                      <span className="text-slate-500">
                        {skill.challengeId}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedWorldId(skill.worldId);
                          setActiveSimulation(skill.simulationId);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                          isVerified
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs'
                        }`}
                      >
                        <span>{isVerified ? (isAr ? 'إعادة الفحص' : 'Re-test') : isAr ? 'تدرب الآن' : 'Train Now'}</span>
                        <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MODES SEPARATION GUIDE (LEARN vs TRAIN vs COMPETE) */}
      {activeTab === 'modes_guide' && (
        <div className="max-w-5xl w-full space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
              {isAr ? 'الفصل المعماري بين التعلم والتدريب والمنافسة' : 'Architectural Separation: Learn, Train & Compete'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {isAr
                ? 'استلهاماً من أفضل الممارسات المنهجية، توفر منصة ZORG ثلاث بيئات عمل متمايزة تضمن انتقال الطالب بثقة من المفهوم النظري إلى الاحتراف الفعلي.'
                : 'ZORG enforces distinct pedagogical stages ensuring students transition seamlessly from mental models to competitive rigor.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Mode 1: Learn */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-800/60 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-800 text-cyan-300 mb-2">
                  {isAr ? 'المرحلة 1: بناء النموذج الذهني' : 'Stage 1: Mental Models'}
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {isAr ? 'وضع التعلّم والشرح' : 'Learning Mode'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {isAr
                    ? 'شرح المفاهيم المعقدة بتشبيهات بصرية واقعية، تتبع حركة الحزم خطوة بخطوة، مع إزالة أي ضغط زمني أو قيود تقييم.'
                    : 'Deconstruct complex protocols using physical analogies and packet tracing, free from time pressure or test gates.'}
                </p>

                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{isAr ? 'تشبيهات ومفاهيم مبسطة' : 'Intuitive physical analogies'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{isAr ? 'معاينة حية وتتبع المسار' : 'Live packet step-by-step tracing'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{isAr ? 'أمثلة عملية محلولة بالكامل' : 'End-to-end worked examples'}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setActiveSimulation('lesson')}
                className="mt-6 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-colors"
              >
                {isAr ? 'دخول دروس المنهج' : 'Open Curriculum Lessons'}
              </button>
            </div>

            {/* Mode 2: Train */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-800/60 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 border border-amber-800 text-amber-300 mb-2">
                  {isAr ? 'المرحلة 2: التدريب الموجه' : 'Stage 2: Guided Practice'}
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {isAr ? 'وضع التدريب والممارسة' : 'Guided Training Mode'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {isAr
                    ? 'مهام عملية تدريجية مع تلميحات ذكية وشرح تعليمي لأسباب الخطأ، لتدريبك على عزل المشاكل واكتشاف التهديدات.'
                    : 'Hands-on guided labs with progressive hints, diagnostic telemetry runbooks, and educational error explanations.'}
                </p>

                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isAr ? 'قوائم مهام عملية قابلة للتتبع' : 'Trackable hands-on step checklist'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isAr ? 'تلميحات تدريجية عند التعثر' : 'Progressive hints upon errors'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isAr ? 'دليل إصلاح الأخطاء (Runbooks)' : 'Troubleshooting diagnostic runbooks'}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setActiveSimulation('explorer')}
                className="mt-6 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-colors"
              >
                {isAr ? 'استكشاف المختبرات الحية' : 'Explore Interactive Labs'}
              </button>
            </div>

            {/* Mode 3: Compete */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-800/60 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 mb-2">
                  {isAr ? 'المرحلة 3: التحقق الصارم' : 'Stage 3: Independent Proof'}
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {isAr ? 'وضع المنافسة والاختبار (CTF)' : 'Competition & Exam Mode'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {isAr
                    ? 'تحديات مستقلة خالية من التلميحات، يتم التحقق منها عبر محرك المحاكاة الفعلي وتجزئة SHA-256 لمنع التلاعب.'
                    : 'Zero-hint independent challenges verified directly by the live simulation engine and SHA-256 evidence hashing.'}
                </p>

                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isAr ? 'تحقق حقيقي من حالة المحاكاة' : 'Real simulation state verification'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isAr ? 'حساب تجزئة الأدلة SHA-256' : 'SHA-256 cryptographic proof'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isAr ? 'منع التجاوزات الشكلية تماماً' : 'Zero synthetic bypass mechanisms'}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setActiveSimulation('range')}
                className="mt-6 w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold transition-transform active:scale-95"
              >
                {isAr ? 'دخول الميدان السيبراني (World 60)' : 'Enter Cyber Range (World 60)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
