import React from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Cloud,
  Compass,
  Cpu,
  Fingerprint,
  KeyRound,
  Layers3,
  Network,
  Search,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { CURRICULUM_LESSONS, CURRICULUM_MILESTONES } from '../../data/curriculumData';
import { MACRO_DOMAINS } from '../../data/universeData';

type Workspace = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  simulation: SimulationId;
  labelAr: string;
  labelEn: string;
  icon: LucideIcon;
  tone: string;
};

const workspaces: Workspace[] = [
  {
    id: 'foundations',
    titleAr: 'الأساسيات والأنظمة',
    titleEn: 'Foundations & Systems',
    descriptionAr: 'افهم مبادئ أمن المعلومات، بنية الحاسوب، وأنظمة التشغيل من خلال تجارب واضحة.',
    descriptionEn: 'Build a strong base in information security, computer architecture, and operating systems.',
    simulation: 'cia_triad',
    labelAr: 'ابدأ من الأساس',
    labelEn: 'Start with the basics',
    icon: ShieldCheck,
    tone: 'mint',
  },
  {
    id: 'networking',
    titleAr: 'الشبكات والبنية التحتية',
    titleEn: 'Networks & Infrastructure',
    descriptionAr: 'استكشف حركة البيانات، البروتوكولات، التوجيه، وتقنيات الحماية الشبكية.',
    descriptionEn: 'Explore traffic flow, protocols, routing, and network protection.',
    simulation: 'subnet_routing',
    labelAr: 'مختبر الشبكات',
    labelEn: 'Network laboratory',
    icon: Network,
    tone: 'blue',
  },
  {
    id: 'identity',
    titleAr: 'الأنظمة والهوية الرقمية',
    titleEn: 'Systems & Digital Identity',
    descriptionAr: 'تعرّف على Linux وWindows وإدارة الهوية والصلاحيات المؤسسية.',
    descriptionEn: 'Work with Linux, Windows, identity, and enterprise access management.',
    simulation: 'active_directory',
    labelAr: 'مختبر الهوية',
    labelEn: 'Identity laboratory',
    icon: Fingerprint,
    tone: 'violet',
  },
  {
    id: 'appsec',
    titleAr: 'أمن التطبيقات والويب',
    titleEn: 'Application & Web Security',
    descriptionAr: 'تعلّم كيف تُبنى التطبيقات الآمنة وكيف تُختبر ضوابط الويب وواجهات API.',
    descriptionEn: 'Learn secure application design and test web and API security controls.',
    simulation: 'appsec_api',
    labelAr: 'مختبر التطبيقات',
    labelEn: 'Application laboratory',
    icon: KeyRound,
    tone: 'amber',
  },
  {
    id: 'cloud',
    titleAr: 'السحابة والحاويات',
    titleEn: 'Cloud & Containers',
    descriptionAr: 'افهم بيئات السحابة والحاويات وكوبرنيتيس وسياسات الوصول والعزل.',
    descriptionEn: 'Explore cloud platforms, containers, Kubernetes, access policies, and isolation.',
    simulation: 'cloud',
    labelAr: 'مختبر السحابة',
    labelEn: 'Cloud laboratory',
    icon: Cloud,
    tone: 'cyan',
  },
  {
    id: 'operations',
    titleAr: 'مركز العمليات والتحقيق',
    titleEn: 'Security Operations & Forensics',
    descriptionAr: 'حلّل التنبيهات والسجلات، وابنِ تصوراً واضحاً للاستجابة للحوادث الرقمية.',
    descriptionEn: 'Analyze alerts and logs, and learn structured digital incident response.',
    simulation: 'soc',
    labelAr: 'محطة العمليات',
    labelEn: 'Operations workstation',
    icon: Activity,
    tone: 'rose',
  },
];

const quickLinks = [
  { id: 'explorer' as SimulationId, ar: 'استكشف العوالم الستين', en: 'Explore 60 worlds', icon: Compass },
  { id: 'range' as SimulationId, ar: 'ادخل الميدان السيبراني', en: 'Enter the Cyber Range', icon: Layers3 },
  { id: 'paths' as SimulationId, ar: 'اختر مسارك المهني', en: 'Choose a career path', icon: Workflow },
  { id: 'glossary' as SimulationId, ar: 'ارجع إلى المعجم التقني', en: 'Open the technical glossary', icon: BookOpen },
];

export const ZorgDashboard: React.FC = () => {
  const language = useSimulationStore((state) => state.language);
  const isAr = language === 'ar';
  const setActiveSimulation = useSimulationStore((state) => state.setActiveSimulation);
  const setIsSearchOpen = useSimulationStore((state) => state.setIsSearchOpen);
  const activeLessonId = useSimulationStore((state) => state.activeLessonId);
  const completedLessons = useSimulationStore((state) => state.completedLessons);
  const lessonProgress = useSimulationStore((state) => state.lessonProgress);

  const activeLesson = CURRICULUM_LESSONS[activeLessonId] || CURRICULUM_LESSONS['lesson-01-cia-triad'];
  const activeMilestone = CURRICULUM_MILESTONES.find((item) => item.id === activeLesson?.milestoneId);
  const totalLessons = Object.keys(CURRICULUM_LESSONS).length;
  const progress = Math.min(100, Math.round((completedLessons.length / Math.max(totalLessons, 1)) * 100));
  const lessonState = lessonProgress[activeLessonId];
  const lessonStarted = Boolean(lessonState && (lessonState.currentStage > 0 || Object.keys(lessonState.checkedTaskSteps || {}).length > 0));
  const domainCount = MACRO_DOMAINS.length;
  const worldCount = MACRO_DOMAINS.reduce((total, domain) => total + domain.worldIds.length, 0);

  const text = (ar: string, en: string) => (isAr ? ar : en);

  return (
    <div className="zorg-page flex-1 overflow-y-auto">
      <div className="zorg-container">
        <section className="zorg-hero">
          <div className="zorg-hero-copy">
            <div className="zorg-eyebrow">
              <span className="zorg-live-dot" />
              <span>{text('منصة التدريب السيبراني التفاعلي', 'INTERACTIVE CYBERSECURITY LEARNING')}</span>
              <span className="zorg-eyebrow-divider" />
              <span className="zorg-eyebrow-subtle">ZORG</span>
            </div>

            <h1>
              {text('تعلّم الأمن السيبراني', 'Learn cybersecurity')}
              <span>{text('بالتجربة، لا بالمشاهدة فقط.', 'by doing, not just observing.')}</span>
            </h1>
            <p className="zorg-hero-description">
              {text(
                'مساحة تدريب تجمع المنهج والمختبرات والمحاكاة في تجربة واحدة واضحة. اختر نقطة البداية، نفّذ التجربة، وافهم أثر كل قرار.',
                'A focused training space that brings lessons, laboratories, and simulations together. Choose where to begin, run an exercise, and understand every decision.'
              )}
            </p>

            <div className="zorg-hero-actions">
              <button
                type="button"
                className="zorg-button-primary"
                onClick={() => setActiveSimulation('lesson')}
              >
                <BookOpen size={18} />
                <span>{text('ابدأ التعلّم', 'Start learning')}</span>
                <ArrowUpRight size={17} className={isAr ? 'zorg-arrow-rtl' : ''} />
              </button>
              <button
                type="button"
                className="zorg-button-secondary"
                onClick={() => setActiveSimulation('explorer')}
              >
                <Compass size={17} />
                <span>{text('استكشف المختبرات', 'Explore laboratories')}</span>
              </button>
            </div>

            <div className="zorg-hero-footnote">
              <span>{text('مناسب للمبتدئ والمتقدم', 'For beginners and advanced learners')}</span>
              <span className="zorg-footnote-separator" />
              <span>{text('واجهة عربية وإنجليزية', 'Arabic and English interface')}</span>
            </div>
          </div>

          <div className="zorg-hero-visual" aria-label={text('تصور بصري لشبكة المختبرات', 'Visual overview of the lab network')}>
            <div className="zorg-visual-topline">
              <span>{text('بيئة المحاكاة', 'SIMULATION ENVIRONMENT')}</span>
              <span className="zorg-visual-status"><i /> {text('جاهزة', 'READY')}</span>
            </div>
            <div className="zorg-orbit-stage">
              <div className="zorg-orbit-ring zorg-orbit-ring-one" />
              <div className="zorg-orbit-ring zorg-orbit-ring-two" />
              <div className="zorg-orbit-ring zorg-orbit-ring-three" />
              <div className="zorg-orbit-center">
                <ShieldCheck size={34} strokeWidth={1.5} />
                <strong>ZORG</strong>
                <small>{text('مختبر تفاعلي', 'INTERACTIVE LAB')}</small>
              </div>
              <div className="zorg-orbit-node zorg-node-one"><Network size={17} /></div>
              <div className="zorg-orbit-node zorg-node-two"><Cloud size={17} /></div>
              <div className="zorg-orbit-node zorg-node-three"><Cpu size={17} /></div>
              <div className="zorg-orbit-node zorg-node-four"><Activity size={17} /></div>
            </div>
            <div className="zorg-visual-stats">
              <div>
                <strong>{domainCount}</strong>
                <span>{text('مجالات رئيسية', 'CORE DOMAINS')}</span>
              </div>
              <div>
                <strong>{worldCount}</strong>
                <span>{text('عوالم تدريبية', 'LEARNING WORLDS')}</span>
              </div>
              <div>
                <strong>{totalLessons}</strong>
                <span>{text('دروس منظمة', 'STRUCTURED LESSONS')}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="zorg-resume-section">
          <div className="zorg-section-heading">
            <div>
              <span className="zorg-section-kicker">{text('مسارك الحالي', 'YOUR LEARNING PATH')}</span>
              <h2>{text('تابع من حيث توقفت', 'Pick up where you left off')}</h2>
            </div>
            <button type="button" className="zorg-text-link" onClick={() => setActiveSimulation('lesson')}>
              {text('عرض المنهج', 'View curriculum')} <ArrowLeft size={16} className={!isAr ? 'zorg-arrow-ltr' : ''} />
            </button>
          </div>

          <div className="zorg-resume-card">
            <div className="zorg-resume-icon"><BookOpen size={22} /></div>
            <div className="zorg-resume-copy">
              <span>{activeMilestone ? (isAr ? activeMilestone.titleAr : activeMilestone.titleEn) : text('المسار التأسيسي', 'Foundation track')}</span>
              <strong>{isAr ? activeLesson.titleAr : activeLesson.titleEn}</strong>
              <small>{isAr ? activeLesson.whyItMattersAr : activeLesson.whyItMattersEn}</small>
            </div>
            <div className="zorg-resume-progress">
              <div className="zorg-progress-label">
                <span>{text('إنجاز المنهج', 'CURRICULUM PROGRESS')}</span>
                <strong>{progress}%</strong>
              </div>
              <div className="zorg-progress-track"><i style={{ width: progress + '%' }} /></div>
              <small>{completedLessons.length} / {totalLessons} {text('درساً مكتملًا', 'lessons completed')}</small>
            </div>
            <button
              type="button"
              className="zorg-resume-button"
              data-testid="zorg-resume-learning-btn"
              onClick={() => setActiveSimulation('lesson')}
            >
              {text(lessonStarted ? 'متابعة الدرس' : 'ابدأ الدرس', lessonStarted ? 'Continue lesson' : 'Start lesson')}
              <ArrowUpRight size={17} className={isAr ? 'zorg-arrow-rtl' : ''} />
            </button>
          </div>
        </section>

        <section className="zorg-workspaces-section">
          <div className="zorg-section-heading">
            <div>
              <span className="zorg-section-kicker">{text('مساحات العمل', 'WORKSPACES')}</span>
              <h2>{text('اختر المجال الذي تريد استكشافه', 'Choose a field to explore')}</h2>
              <p>{text('كل مساحة تقودك إلى مختبرات وتجارب مترابطة ضمن موضوع واحد.', 'Each workspace brings together related laboratories and hands-on exercises.')}</p>
            </div>
            <button type="button" className="zorg-button-tertiary" onClick={() => setActiveSimulation('explorer')}>
              {text('جميع العوالم', 'All worlds')} <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="zorg-workspace-grid">
            {workspaces.map((workspace) => {
              const Icon = workspace.icon;
              return (
                <button
                  type="button"
                  key={workspace.id}
                  className={'zorg-workspace-card zorg-workspace-' + workspace.tone}
                  onClick={() => setActiveSimulation(workspace.simulation)}
                >
                  <div className="zorg-workspace-card-top">
                    <span className="zorg-workspace-icon"><Icon size={21} strokeWidth={1.8} /></span>
                    <ArrowUpRight size={17} className="zorg-workspace-open" />
                  </div>
                  <span className="zorg-workspace-label">{text(workspace.labelAr, workspace.labelEn)}</span>
                  <strong>{text(workspace.titleAr, workspace.titleEn)}</strong>
                  <p>{text(workspace.descriptionAr, workspace.descriptionEn)}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="zorg-quick-section">
          <div className="zorg-section-heading">
            <div>
              <span className="zorg-section-kicker">{text('وصول سريع', 'QUICK ACCESS')}</span>
              <h2>{text('أدواتك ومساراتك', 'Tools and pathways')}</h2>
            </div>
          </div>
          <div className="zorg-quick-grid">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button type="button" className="zorg-quick-link" key={link.id} onClick={() => setActiveSimulation(link.id)}>
                  <span><Icon size={18} /></span>
                  <strong>{text(link.ar, link.en)}</strong>
                  <ArrowUpRight size={16} />
                </button>
              );
            })}
          </div>
        </section>

        <footer className="zorg-dashboard-footer">
          <span>ZORG · {text('منصة المحاكاة والتدريب السيبراني', 'CYBERSECURITY SIMULATION & TRAINING')}</span>
          <button type="button" onClick={() => setIsSearchOpen(true)}>
            <Search size={14} /> {text('ابحث عن مختبر أو مفهوم', 'Search labs and concepts')}
          </button>
        </footer>
      </div>
    </div>
  );
};
