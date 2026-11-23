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
  Play,
  CheckCircle2,
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
  const onboardingStep = useSimulationStore((state) => state.onboardingStep);
  const landingFirewallMode = useSimulationStore((state) => state.landingFirewallMode);
  const setLandingFirewallMode = useSimulationStore((state) => state.setLandingFirewallMode);
  const recordOnboardingAction = useSimulationStore((state) => state.recordOnboardingAction);
  const completeChallenge = useSimulationStore((state) => state.completeChallenge);
  const selectedEntity = useSimulationStore((state) => state.selectedEntity);
  const selectEntity = useSimulationStore((state) => state.selectEntity);
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

  const handleFirewallModeChange = (mode: 'strict' | 'permissive' | 'block_all') => {
    setLandingFirewallMode(mode);
    if (onboardingStep === 2 && mode !== 'strict') {
      recordOnboardingAction('alter_policy');
      completeChallenge('orientation-guided-challenge', { success: true });
    }
  };

  const inspectFirewall = () => {
    selectEntity('node', 'fw-01', {
      name: text('جدار الحماية المحيطي', 'Perimeter Firewall'),
      details: text(
        'يتحكم في الاتصالات الواردة والصادرة وفق سياسة الشبكة.',
        'Controls inbound and outbound connections according to network policy.'
      ),
    });
    recordOnboardingAction('inspect_firewall');
  };

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
                <span>{text('ابدأ التعلّم من الصفر', 'Start learning from the beginning')}</span>
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

        <section className="zorg-first-steps" aria-labelledby="zorg-first-steps-title">
          <div className="zorg-first-steps-heading">
            <div>
              <span className="zorg-section-kicker">{text('دليل البداية السريع', 'YOUR FIRST STEPS')}</span>
              <h2 id="zorg-first-steps-title">{text('مستخدم جديد؟ اتبع هذه الخطوات الثلاث', 'New here? Follow these three steps')}</h2>
              <p>{text('لا تبدأ بتصفح كل العوالم. تعلّم فكرة واحدة، جرّبها في المختبر، ثم أكمل الدرس.', 'Do not start by browsing every world. Learn one idea, practice it in the lab, then complete the lesson.')}</p>
            </div>
            <button type="button" className="zorg-first-steps-start" data-testid="zorg-first-step-btn" onClick={() => setActiveSimulation('lesson')}>
              <BookOpen size={17} />
              {text('ابدأ الدرس الأول', 'Start the first lesson')}
              <ArrowUpRight size={16} className={isAr ? 'zorg-arrow-rtl' : ''} />
            </button>
          </div>
          <div className="zorg-first-steps-grid">
            <article className="zorg-first-step-card">
              <span className="zorg-first-step-number">01</span>
              <span className="zorg-first-step-icon"><BookOpen size={20} /></span>
              <h3>{text('تعلّم الفكرة', 'Learn the idea')}</h3>
              <p>{text('ابدأ من «ابدأ هنا». اقرأ الأهداف والشرح ولا تحتاج إلى إعداد أي شيء.', 'Open “Start Here”. Read the goals and explanation. No setup is required.')}</p>
            </article>
            <article className="zorg-first-step-card">
              <span className="zorg-first-step-number">02</span>
              <span className="zorg-first-step-icon"><Play size={20} /></span>
              <h3>{text('جرّب بنفسك', 'Try it yourself')}</h3>
              <p>{text('عند ظهور المهمة العملية، افتح المختبر المرتبط بالدرس وجرّب الخطوات داخله.', 'When you reach the practical task, open its linked lab and try the steps there.')}</p>
            </article>
            <article className="zorg-first-step-card">
              <span className="zorg-first-step-number">03</span>
              <span className="zorg-first-step-icon"><CheckCircle2 size={20} /></span>
              <h3>{text('أكمل وانتقل', 'Complete and continue')}</h3>
              <p>{text('ارجع إلى الدرس، أجب عن الأسئلة، ثم أكمل لتُحفظ متابعتك وتنتقل للدرس التالي.', 'Return to the lesson, answer the questions, then complete it to save progress and continue.')}</p>
            </article>
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
              data-testid="hero-resume-learning-btn"
              onClick={() => setActiveSimulation('lesson')}
            >
              {text(lessonStarted ? 'متابعة الدرس' : 'ابدأ الدرس', lessonStarted ? 'Continue lesson' : 'Start lesson')}
              <ArrowUpRight size={17} className={isAr ? 'zorg-arrow-rtl' : ''} />
            </button>
          </div>
        </section>


        <section className="zorg-onboarding-section">
          <div className="zorg-onboarding-copy">
            <span className="zorg-section-kicker">{text('تجربة قصيرة اختيارية للمبتدئين', 'OPTIONAL FIRST EXERCISE')}</span>
            <h2>{text('جرّب كيف يتخذ جدار الحماية قراره', 'See how a firewall makes a decision')}</h2>
            <p>{text('هذه تجربة جانبية للتعرّف على المحاكاة، وليست شرطاً لإكمال المنهج. يمكنك تجاوزها والبدء بالدرس الأول مباشرة.', 'This is an optional tour of the simulator, not a requirement. You can skip it and start the first lesson directly.')}</p>
            <div className="zorg-onboarding-steps">
              <span className={onboardingStep >= 2 ? 'is-complete' : 'is-current'}><i>1</i>{text('افحص الجدار', 'Inspect the firewall')}</span>
              <span className="zorg-step-connector" />
              <span className={onboardingStep >= 3 ? 'is-complete' : onboardingStep === 2 ? 'is-current' : ''}><i>2</i>{text('غيّر السياسة', 'Change the policy')}</span>
            </div>
          </div>
          <div className="zorg-onboarding-card">
            {onboardingStep === 1 && (
              <div className="zorg-onboarding-prompt">
                <span className="zorg-prompt-number">01</span>
                <strong>{text('خطوة 1: انقر على جدار الحماية', 'Step 1: Select the firewall')}</strong>
                <small>{text('ابدأ بفحص عنصر الجدار في البيئة الافتراضية.', 'Start by inspecting the firewall in the virtual environment.')}</small>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="zorg-onboarding-prompt">
                <span className="zorg-prompt-number">02</span>
                <strong>{text('خطوة 2: غير سياسة الجدار', 'Step 2: Change the firewall policy')}</strong>
                <small>{text('اختر سياسة مختلفة ولاحظ كيف يتغير سلوك الاتصال.', 'Choose a different policy and observe how connection behavior changes.')}</small>
              </div>
            )}
            {onboardingStep >= 3 && (
              <div className="zorg-onboarding-prompt is-success">
                <span className="zorg-prompt-number">✓</span>
                <strong>{text('رائع! لقد غيرت سلوك الدفاع المحيطي', 'Excellent! You changed the perimeter defense behavior')}</strong>
                <small>{text('أكملت التجربة التمهيدية. يمكنك الآن متابعة رحلة التعلم.', 'You completed the introductory exercise. Continue your learning journey.')}</small>
              </div>
            )}
            <div className="zorg-firewall-controls">
              <button type="button" data-testid="hero-node-firewall" onClick={inspectFirewall} className={'zorg-firewall-node' + (selectedEntity?.id === 'fw-01' ? ' is-selected' : '')}>
                <ShieldCheck size={19} />
                <span>{text('جدار الحماية المحيطي', 'Perimeter Firewall')}</span>
                <small>{selectedEntity?.id === 'fw-01' ? text('تم الفحص', 'INSPECTED') : text('انقر للفحص', 'SELECT')}</small>
              </button>
              <div className="zorg-policy-options">
                <button type="button" onClick={() => handleFirewallModeChange('strict')} className={landingFirewallMode === 'strict' ? 'is-selected' : ''}>
                  {text('صارم (443/53)', 'Strict (443/53)')}
                </button>
                <button type="button" onClick={() => handleFirewallModeChange('permissive')} className={landingFirewallMode === 'permissive' ? 'is-selected' : ''}>
                  {text('سماح واسع', 'Permissive')}
                </button>
                <button type="button" onClick={() => handleFirewallModeChange('block_all')} className={landingFirewallMode === 'block_all' ? 'is-selected' : ''}>
                  {text('حظر شامل', 'Block all')}
                </button>
              </div>
            </div>
            {selectedEntity?.id === 'fw-01' && (
              <div className="zorg-firewall-inspector">
                <span>{text('العنصر المحدد', 'SELECTED COMPONENT')}</span>
                <strong>{text('جدار الحماية المحيطي', 'Perimeter Firewall')}</strong>
              </div>
            )}
            {onboardingStep >= 3 && (
              <button type="button" className="zorg-onboarding-finish" onClick={() => setActiveSimulation('explorer')}>
                {text('ابدأ رحلة التعلم في العوالم', 'Continue to the learning worlds')}
                <ArrowUpRight size={16} />
              </button>
            )}
          </div>
        </section>

        <section className="zorg-workspaces-section">
          <div className="zorg-section-heading">
            <div>
              <span className="zorg-section-kicker">{text('مساحات العمل', 'WORKSPACES')}</span>
              <h2>{text('استكشف المجالات بعد أن تتعرف على الأساسيات', 'Explore domains after learning the basics')}</h2>
              <p>{text('هذه مداخل للاستكشاف الحر وليست خطوات مطلوبة للبداية. اختر مجالاً، ثم افتح المختبر المناسب.', 'These are optional exploration areas, not required first steps. Choose a domain, then open a related lab.')}</p>
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
