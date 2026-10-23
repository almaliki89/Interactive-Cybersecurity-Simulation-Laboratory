import { CurriculumMilestone, CurriculumLesson, CurriculumLevel } from '../types/curriculum';

export const CURRICULUM_LEVELS: CurriculumLevel[] = [
  {
    id: 'level-0',
    levelNumber: 0,
    slug: 'orientation-digital-literacy',
    titleAr: 'المستوى 0: التوجيه، محو الأمية الرقمية والأمان المبدئي',
    titleEn: 'Level 0: Orientation, Digital Literacy & Fundamental Safety',
    subtitleAr: 'الخطوة الأولى من الصفر المطلق: التعرف على البيئة والتأمين المبدئي',
    subtitleEn: 'Absolute Beginner Orientation, System Navigation & Threat Awareness',
    descriptionAr: 'تعلم كيف تتنقل في المختبر التفاعلي، وافهم المبادئ الأولى للحفاظ على أمان أجهزتك وحساباتك من المخاطر الرقمية الشائعة.',
    descriptionEn: 'Learn how to navigate the interactive laboratory, understand basic threat vectors, and protect personal devices.',
    estimatedMinutes: 10,
    iconName: 'Compass',
    primarySimulationId: 'cia_triad',
    modules: [
      {
        id: 'mod-0-1',
        titleAr: 'المدخل والأمان الرقمي',
        titleEn: 'Digital Safety Foundations',
        lessonIds: ['lesson-00-orientation'],
      },
    ],
  },
  {
    id: 'level-1',
    levelNumber: 1,
    slug: 'operating-systems-internals',
    titleAr: 'المستوى 1: أنظمة التشغيل وحماية العمليات والذاكرة',
    titleEn: 'Level 1: Operating System Internals & Process Security',
    subtitleAr: 'فهم النواة والمستخدم وصلاحيات الأجهزة',
    subtitleEn: 'User Mode, Kernel Mode & Memory Privilege Isolation',
    descriptionAr: 'افهم كيف تدير أنظمة التشغيل الذاكرة والمعالج وكيف تعزل صلاحيات الوصول لمنع البرمجيات الخبيثة من السيطرة.',
    descriptionEn: 'Explore CPU ring levels, kernel-mode isolation, process isolation, and token-based privilege validation.',
    estimatedMinutes: 25,
    iconName: 'Cpu',
    primarySimulationId: 'system_internals',
    modules: [
      {
        id: 'mod-1-1',
        titleAr: 'ثالوث الحماية وثقافة الأمان',
        titleEn: 'CIA Triad & Security Principles',
        lessonIds: ['lesson-01-cia-triad'],
      },
      {
        id: 'mod-1-2',
        titleAr: 'عزل المعالج والعمليات',
        titleEn: 'Process & Privilege Isolation',
        lessonIds: ['lesson-02-system-internals'],
      },
    ],
  },
  {
    id: 'level-2',
    levelNumber: 2,
    slug: 'networking-first-principles',
    titleAr: 'المستوى 2: أساسيات الشبكات، عناوين IP وتوجيه الحزم',
    titleEn: 'Level 2: Networking First Principles & Packet Routing',
    subtitleAr: 'عناوين IP، الثنائي، التقسيم الفرعي CIDR، والتوجيه عبر القفزات',
    subtitleEn: 'IP Addressing, Binary Octets, Subnetting, MAC/ARP & NAT Hop Routing',
    descriptionAr: 'تتبع حركة البيانات بدقة من البتات والثنائي، إلى تصميم شبكات CIDR، وتوجيه الحزم وتأمين قنوات الاتصال.',
    descriptionEn: 'Master networking from first principles: IPv4 binary logic, subnets, packet encapsulation, and NAT translation.',
    estimatedMinutes: 35,
    iconName: 'Network',
    primarySimulationId: 'subnet_routing',
    modules: [
      {
        id: 'mod-2-1',
        titleAr: 'عناوين IP والمنطق الثنائي',
        titleEn: 'IP Addressing & Binary Fundamentals',
        lessonIds: ['lesson-02-01-ip-addressing-and-binary'],
      },
      {
        id: 'mod-2-2',
        titleAr: 'التقسيم الفرعي وقناع CIDR',
        titleEn: 'Subnetting & CIDR Calculations',
        lessonIds: ['lesson-02-02-subnetting-and-cidr'],
      },
      {
        id: 'mod-2-3',
        titleAr: 'توجيه الحزم وبوابة NAT',
        titleEn: 'Packet Routing & NAT Gateways',
        lessonIds: ['lesson-03-subnet-routing'],
      },
    ],
  },
  {
    id: 'level-3',
    levelNumber: 3,
    slug: 'firewalls-perimeter',
    titleAr: 'المستوى 3: جدران الحماية وقواعد الفحص وجداول Access Control',
    titleEn: 'Level 3: Firewalls, Inspection Rules & Perimeter ACLs',
    subtitleAr: 'تصفية المنافذ، حالة الاتصال وعزل المناطق DMZ',
    subtitleEn: 'Stateful Filtering, Port Isolation & DMZ Segmentation',
    descriptionAr: 'تعلم كيف يفحص جدار الحماية الحزم الواردة والصادرة، ويغلق المنافذ غير المستخدمة لمنع الاختراق.',
    descriptionEn: 'Configure stateful packet inspection, block unauthorized ports, and isolate DMZ assets.',
    estimatedMinutes: 20,
    iconName: 'ShieldCheck',
    primarySimulationId: 'firewall',
    modules: [
      {
        id: 'mod-3-1',
        titleAr: 'جدران الحماية التفاعلية',
        titleEn: 'Stateful Firewall Rules',
        lessonIds: ['lesson-04-firewall-rules'],
      },
    ],
  },
  {
    id: 'level-4',
    levelNumber: 4,
    slug: 'cryptography-pki',
    titleAr: 'المستوى 4: التشفير التطبيقي ودوال التجزئة والبنية التحتية PKI',
    titleEn: 'Level 4: Applied Cryptography, Hashing & TLS PKI',
    subtitleAr: 'AES، SHA-256، التوقيع الرقمي وشهادات TLS الآمنة',
    subtitleEn: 'Symmetric/Asymmetric Encryption, SHA-256 Hashes & TLS Certificates',
    descriptionAr: 'افهم الفرق بين التشفير المتماثل وغير المتماثل وتجزئة البيانات، واكتشف كيف تؤمن قنوات الاتصال بروتوكول TLS.',
    descriptionEn: 'Understand collision resistance, digital signatures, certificate authority validation, and encrypted channels.',
    estimatedMinutes: 20,
    iconName: 'Key',
    primarySimulationId: 'crypto',
    modules: [
      {
        id: 'mod-4-1',
        titleAr: 'التشفير والتجزئة',
        titleEn: 'Cryptography & Hashes',
        lessonIds: ['lesson-05-cryptography'],
      },
    ],
  },
  {
    id: 'level-5',
    levelNumber: 5,
    slug: 'identity-active-directory',
    titleAr: 'المستوى 5: الهوية والمصادقة ودليل المؤسسات Active Directory',
    titleEn: 'Level 5: Identity, Active Directory & Enterprise Domain Services',
    subtitleAr: 'المصادقة، التفويض، تذاكر Kerberos وسياسات المجموعة GPO',
    subtitleEn: 'Authentication, Kerberos Tickets & Active Directory Domain Controller',
    descriptionAr: 'استكشف إدارة الهويات الرقمية في النطاقات المؤسسية وتتبع صدور تذاكر TGT للوصول الآمن للخدمات.',
    descriptionEn: 'Master Active Directory architecture, Kerberos authentication tickets, domain controllers, and authorization.',
    estimatedMinutes: 25,
    iconName: 'Lock',
    primarySimulationId: 'active_directory',
    modules: [
      {
        id: 'mod-5-1',
        titleAr: 'نطاقات Active Directory',
        titleEn: 'Active Directory Infrastructure',
        lessonIds: ['lesson-06-active-directory'],
      },
    ],
  },
  {
    id: 'level-6',
    levelNumber: 6,
    slug: 'soc-siem-monitoring',
    titleAr: 'المستوى 6: مركز العمليات SOC ورصد السجلات وتحليل الإنذارات',
    titleEn: 'Level 6: SOC Monitoring, SIEM Telemetry & Incident Alerting',
    subtitleAr: 'سجلات الأحداث، تحليل السلوك واكتشاف هجمات التخمين',
    subtitleEn: 'Event Log Correlation, Brute-force Detection & Alert Triaging',
    descriptionAr: 'تولّ دور محلل الأمان في مركز SOC، وربط أحداث السجلات المتفرقة لاكتشاف الاختراقات الحية.',
    descriptionEn: 'Monitor live event streams, analyze Windows Event IDs, and correlate telemetry to catch intrusions.',
    estimatedMinutes: 25,
    iconName: 'Activity',
    primarySimulationId: 'soc',
    modules: [
      {
        id: 'mod-6-1',
        titleAr: 'مراقبة السجلات في SOC',
        titleEn: 'SOC Event Monitoring',
        lessonIds: ['lesson-07-soc-monitoring'],
      },
    ],
  },
  {
    id: 'level-7',
    levelNumber: 7,
    slug: 'digital-forensics-dfir',
    titleAr: 'المستوى 7: التحقيق الجنائي الرقمي والاستجابة للحوادث DFIR',
    titleEn: 'Level 7: Digital Forensics & Incident Response (DFIR)',
    subtitleAr: 'جمع الأدلة، تحليل الذاكرة واستعادة السجل الزمني للهجوم',
    subtitleEn: 'Evidence Preservation, Volatile Memory & Malware Artifact Analysis',
    descriptionAr: 'اجمع أدلة الجريمة الرقمية من الذاكرة العشوائية وسجلات النظام لإعادة بناء سيناريو الهجوم.',
    descriptionEn: 'Perform forensic memory extractions, analyze registry artifacts, and establish an unbroken timeline of compromise.',
    estimatedMinutes: 25,
    iconName: 'FileSearch',
    primarySimulationId: 'forensics',
    modules: [
      {
        id: 'mod-7-1',
        titleAr: 'التحقيق الرقمي والأدلة',
        titleEn: 'DFIR Investigation Workstation',
        lessonIds: ['lesson-08-forensics'],
      },
    ],
  },
  {
    id: 'level-8',
    levelNumber: 8,
    slug: 'appsec-devsecops',
    titleAr: 'المستوى 8: أمن تطبيقات الويب وخطوط التطوير الآمنة DevSecOps',
    titleEn: 'Level 8: Web Application Security, API & DevSecOps CI/CD',
    subtitleAr: 'ثغرات OWASP Top 10، فحص SAST الآلي وتأمين الأسرار',
    subtitleEn: 'OWASP Top 10 Mitigation, SAST Scanning & Pipeline Gate Keeping',
    descriptionAr: 'فحص الكود المصدري كودياً وتأمين خطوط البناء الآلية لمنع الثغرات وتسريب المفاتيح السرية.',
    descriptionEn: 'Audit applications against OWASP Top 10 vulnerabilities, enforce SAST automated security gates, and catch leaked secrets.',
    estimatedMinutes: 25,
    iconName: 'Workflow',
    primarySimulationId: 'devsecops',
    modules: [
      {
        id: 'mod-8-1',
        titleAr: 'تأمين خطوط DevSecOps',
        titleEn: 'DevSecOps Pipeline Security',
        lessonIds: ['lesson-09-devsecops'],
      },
    ],
  },
  {
    id: 'level-9',
    levelNumber: 9,
    slug: 'cloud-threat-hunting',
    titleAr: 'المستوى 9: أمن السحابة والحاويات واصطياد التهديدات المتقدمة',
    titleEn: 'Level 9: Cloud Infrastructure, Container Defense & Threat Hunting',
    subtitleAr: 'صلاحيات IAM، سياسات Kubernetes وتتبع فرضيات الهجوم',
    subtitleEn: 'Cloud IAM Security, Kubernetes RBAC & Threat Hunting Hypotheses',
    descriptionAr: 'اصطد التهديدات المختبئة في البيئات السحابية والتطبيقات الموزعة على الحاويات بفرص استباقية.',
    descriptionEn: 'Formulate threat hypotheses, trace CloudTrail audit streams, and secure Kubernetes container perimeters.',
    estimatedMinutes: 30,
    iconName: 'Cloud',
    primarySimulationId: 'threat_hunting',
    modules: [
      {
        id: 'mod-9-1',
        titleAr: 'اصطياد التهديدات السحابية',
        titleEn: 'Cloud Threat Hunting',
        lessonIds: ['lesson-09-cloud-threat-hunting'],
      },
    ],
  },
  {
    id: 'level-10',
    levelNumber: 10,
    slug: 'enterprise-cyber-range',
    titleAr: 'المستوى 10: الميدان السيبراني المؤسسي الشامل والتحديات المتقدمة',
    titleEn: 'Level 10: Unified Enterprise Cyber Range Capstone',
    subtitleAr: 'المؤسسة الكاملة: الخوادم، الشبكة، الدفاع والهجوم المزدوج',
    subtitleEn: 'Full Enterprise Twin, Multi-Node Command Center & Full-Spectrum Defense',
    descriptionAr: 'تطبيق شامل في بيئة مؤسسية حقيقية تتصدى لهجمات معقدة متعددة المراحل عبر شاشات القيادة والسيطرة.',
    descriptionEn: 'Synthesize every skill in an interactive enterprise twin running domain controllers, routers, and active threat neutralization.',
    estimatedMinutes: 35,
    iconName: 'Building',
    primarySimulationId: 'range',
    modules: [
      {
        id: 'mod-10-1',
        titleAr: 'التحدي المؤسسي الشامل',
        titleEn: 'Enterprise Cyber Range Capstone',
        lessonIds: ['lesson-10-cyber-range'],
      },
    ],
  },
];

export const CURRICULUM_MILESTONES: CurriculumMilestone[] = CURRICULUM_LEVELS.map((lvl) => ({
  id: lvl.levelNumber,
  slug: lvl.slug,
  titleAr: lvl.titleAr,
  titleEn: lvl.titleEn,
  subtitleAr: lvl.subtitleAr,
  subtitleEn: lvl.subtitleEn,
  descriptionAr: lvl.descriptionAr,
  descriptionEn: lvl.descriptionEn,
  estimatedMinutes: lvl.estimatedMinutes,
  iconName: lvl.iconName,
  primarySimulationId: lvl.primarySimulationId,
  lessonIds: lvl.modules.flatMap((m) => m.lessonIds),
}));

export const CURRICULUM_LESSONS: Record<string, CurriculumLesson> = {
  'lesson-00-orientation': {
    id: 'lesson-00-orientation',
    milestoneId: 0,
    order: 1,
    titleAr: 'الدرس 0: التوجيه، محو الأمية الرقمية وأمان الأجهزة',
    titleEn: 'Lesson 0: Orientation, Digital Literacy & Endpoint Protection',
    whyItMattersAr: 'البداية الصحيحة تضمن لك التنقل بثقة في المختبر وتأمين أجهزتك من المخاطر الرقمية اليومية.',
    whyItMattersEn: 'Building initial security hygiene safeguards your personal endpoints and enables confident lab navigation.',
    estimatedMinutes: 10,
    simulationId: 'cia_triad',
    challengeId: 'cia-balance-challenge',
    prerequisites: [
      {
        textAr: 'قدرة أساسية على استخدام المتصفح والفأرة.',
        textEn: 'Basic familiarity with operating web browsers and mouse interactions.',
      },
    ],
    workedExample: {
      titleAr: 'مثال توضيحي: التعرف على مؤشرات الأمان الرقمي',
      titleEn: 'Worked Example: Recognizing Endpoint Security Status',
      scenarioAr: 'تقييم جهاز كمبيوتر جديد قبل ربطه بشبكة العمل:',
      scenarioEn: 'Evaluating a new workstation before connecting it to an enterprise network:',
      stepsAr: [
        'الخطوة 1: الفحص المبدئي لوجود جدار حماية مفعل وبرنامج مكافحة الفيروسات.',
        'الخطوة 2: التحقق من تشفير القرص المكتبي (BitLocker / FileVault).',
        'الخطوة 3: التأكد من تحديث نظام التشغيل إلى أحدث إصدار أمني.',
      ],
      stepsEn: [
        'Step 1: Inspect whether endpoint firewall and real-time antivirus are active.',
        'Step 2: Confirm volume encryption is enabled (e.g. BitLocker or FileVault).',
        'Step 3: Verify OS kernel security patches are fully up to date.',
      ],
      takeawayAr: 'الجهاز الآمن يقلل خطر الاختراق المبدئي بنسبة تزيد عن 90%.',
      takeawayEn: 'A hardened endpoint neutralizes over 90% of commodity initial attack vectors.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: فحص وتأمين البيئة المبدئية',
      titleEn: 'Independent Challenge: Initial Environment Hardening',
      scenarioAr: 'قم بضبط عناصر الأمان المبدئية والتحقق من سلامة الاتصال بالمختبر:',
      scenarioEn: 'Configure initial security controls and confirm healthy lab connectivity:',
      targetOutcomeAr: 'تفعيل خيارات التشفير والحماية لتقليل مؤشر الخطر.',
      targetOutcomeEn: 'Enable encryption and protection controls to lower baseline risk.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن برامج مكافحة الفيروسات وحدها تكفي لمنع جميع الهجمات.',
      commonMisconceptionEn: 'Believing antivirus software alone stops all modern cyber attacks.',
      guidanceAr: 'الحماية تتطلب جدار حماية، وتحديثات مستمرة، ووعياً أمنياً لمنع هجمات الهندسة الاجتماعية.',
      guidanceEn: 'Endpoint defense requires stateful firewalls, prompt OS patching, and user security awareness against social engineering.',
    },
    keyTakeaways: [
      {
        textAr: 'الأمن السيبراني يبدأ من الانضباط اليومي والنظافة الرقمية للأجهزة.',
        textEn: 'Cybersecurity starts with daily digital hygiene and endpoint discipline.',
      },
    ],
    objectives: [
      {
        textAr: 'التعرف على مكونات المختبر التفاعلي.',
        textEn: 'Navigate the interactive laboratory interfaces.',
      },
      {
        textAr: 'فهم المفاهيم الأساسية للأمان الرقمي.',
        textEn: 'Understand core digital safety principles.',
      },
    ],
    concept: {
      textAr: 'مرحباً بك في المختبر التفاعلي للأمن السيبراني! هذه البيئة تتيح لك التجربة العملية الآمنة.',
      textEn: 'Welcome to the Interactive Cybersecurity Simulation Laboratory! This environment allows safe, hands-on experimentation.',
      analogyAr: 'مثل أداء تدريبات الطيران في جهاز محاكاة طيران مغلق وآمن قبل قيادة طائرة حقيقية.',
      analogyEn: 'Like practicing flight maneuvers in a flight simulator before piloting a real aircraft.',
      keyTerms: [
        {
          termAr: 'الأمان الرقمي (Digital Safety)',
          termEn: 'Digital Safety',
          definitionAr: 'حماية الأجهزة الشخصية والبيانات من المخاطر الرقمية.',
          definitionEn: 'Safeguarding personal devices and assets from cyber threats.',
        },
      ],
    },
    demonstration: {
      titleAr: 'المعاينة التفاعلية للمحيط الرقمي',
      titleEn: 'Interactive Environment Overview',
      whatToLookForAr: 'لاحظ أشرطة التنقل والمحاكيات التفاعلية.',
      whatToLookForEn: 'Observe navigation toolbars and simulation controls.',
      initialStateAr: 'جميع المحاكيات جاهزة للتفاعل.',
      initialStateEn: 'All simulation engines are ready for interaction.',
    },
    guidedTask: {
      taskTitleAr: 'تأكيد الجاهزية الرقمية',
      taskTitleEn: 'Digital Readiness Confirmation',
      instructionsAr: ['تصفح الخريطة التفاعلية للمختبر.', 'افتح المحاكي التفاعلي كخطوة تجريبية.'],
      instructionsEn: ['Explore the interactive laboratory map.', 'Launch a sample simulator as a dry run.'],
      whyWeDoThisAr: 'لضمان قدرتك على التنقل السلس عبر المراحل.',
      whyWeDoThisEn: 'To ensure seamless navigation across curriculum milestones.',
      hintsAr: ['استخدم الشريط العلوي للتنقل.'],
      hintsEn: ['Use top header to navigate.'],
      validationCriterionAr: 'تصفح مكونات الواجهة وتأكيد الجاهزية.',
      validationCriterionEn: 'UI navigation and readiness confirmation.',
      checkType: 'guided_confirmation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم التعرف على الواجهة وتهيئة بيئة التعلم.',
      whatHappenedEn: 'Interface orientation complete and environment initialized.',
      securitySignificanceAr: 'فهم البيئة يحميك من الأخطاء العشوائية أثناء التطبيق العملي.',
      securitySignificanceEn: 'Environment familiarity prevents procedural errors during hands-on exercises.',
    },
    knowledgeCheck: [
      {
        id: 'q0-1',
        questionAr: 'ما الفائدة الرئيسية من استخدام بيئة المحاكاة التفاعلية للتعلم؟',
        questionEn: 'What is the primary benefit of using an interactive simulation laboratory?',
        options: [
          {
            id: 'o1',
            textAr: 'التجريب والخطأ بأمان دون التأثير على أنظمة حقيقية',
            textEn: 'Safe trial and error without impacting live production systems',
            isCorrect: true,
            explanationAr: 'صحيح! المحاكي يمنحك بيئة آمنة للتطبيق.',
            explanationEn: 'Correct! Simulation provides a safe sandbox.',
          },
          {
            id: 'o2',
            textAr: 'اختراق مواقع الإنترنت العشوائية',
            textEn: 'Attacking random public websites',
            isCorrect: false,
            explanationAr: 'غير صحيح. المحاكاة مغلقة وآمنة تعليمياً.',
            explanationEn: 'Incorrect. Simulations are safely isolated for learning.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-01-cia-triad',
      takeawayAr: 'أنت الآن جاهز لبدء رحلة الأمان السيبراني الحقيقية!',
      takeawayEn: 'You are now ready to begin your cybersecurity journey!',
    },
  },
  'lesson-02-01-ip-addressing-and-binary': {
    id: 'lesson-02-01-ip-addressing-and-binary',
    milestoneId: 2,
    order: 1,
    titleAr: 'الدرس 1: عناوين IPv4 والمنطق الثنائي',
    titleEn: 'Lesson 1: IPv4 Addressing & Binary Octet Fundamentals',
    whyItMattersAr: 'كل جهاز على الشبكة يحتاج عنوان IP فريد، وأجهزة التوجيه تفهم هذا العنوان في صورته الثنائية (0 و 1) لتوجيه البيانات.',
    whyItMattersEn: 'Every network endpoint requires a unique IP address, which hardware switches and routers process as 32 binary bits.',
    estimatedMinutes: 15,
    simulationId: 'subnet_routing',
    challengeId: 'subnet-routing-challenge',
    prerequisites: [
      {
        textAr: 'القدرة على إجراء العمليات الحسابية البسيطة (الجمع والضرب).',
        textEn: 'Basic arithmetic skills (addition and multiplication).',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: تحويل عنوان IP عشري إلى ثنائي',
      titleEn: 'Worked Example: Decimal IP to Binary Conversion',
      scenarioAr: 'تحويل العنوان 192.168.1.1 إلى 32 بت ثنائي:',
      scenarioEn: 'Converting 192.168.1.1 into 32 binary bits:',
      stepsAr: [
        'الرباعية الأولى (192) = 128 + 64 + 0 + 0 + 0 + 0 + 0 + 0 = 11000000',
        'الرباعية الثانية (168) = 128 + 0 + 32 + 0 + 8 + 0 + 0 + 0 = 10101000',
        'الرباعية الثالثة (1) = 00000001 | الرباعية الرابعة (1) = 00000001',
        'العنوان كاملاً بالثنائي = 11000000.10101000.00000001.00000001',
      ],
      stepsEn: [
        '1st Octet (192) = 128 + 64 + 0 + 0 + 0 + 0 + 0 + 0 = 11000000',
        '2nd Octet (168) = 128 + 0 + 32 + 0 + 8 + 0 + 0 + 0 = 10101000',
        '3rd Octet (1) = 00000001 | 4th Octet (1) = 00000001',
        'Complete 32-bit binary = 11000000.10101000.00000001.00000001',
      ],
      takeawayAr: 'العنوان العشري المنقط ما هو إلا واجهة مقروءة للشبكة الثنائية.',
      takeawayEn: 'Dotted decimal notation is simply a human-readable format for 32 binary bits.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: تحديد أجزاء الشبكة والمضيف',
      titleEn: 'Independent Challenge: Network vs Host Bit Boundary',
      scenarioAr: 'احسب جزء الشبكة وجزء المضيف للعنوان 192.168.1.50 بحسب قناع البادئة:',
      scenarioEn: 'Identify network and host portions for 192.168.1.50 using prefix masks:',
      targetOutcomeAr: 'فهم حد البادئة وتأثيره على توجيه الحزم.',
      targetOutcomeEn: 'Master prefix boundary limits and packet routing implications.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن القيم الثنائية في الثمانيات تتغير عشوائياً.',
      commonMisconceptionEn: 'Thinking binary octet values change randomly.',
      guidanceAr: 'كل بت له قيمة مضاعفة ثابتة (128, 64, 32, 16, 8, 4, 2, 1) وجمع البتات المفعلة يعطي الرقم العشري.',
      guidanceEn: 'Bit positions hold fixed powers of 2 (128, 64, 32, 16, 8, 4, 2, 1); summing active bits produces the decimal value.',
    },
    keyTakeaways: [
      {
        textAr: 'عنوان IPv4 يتكون من 32 بت مقسمة على 4 ثمانيات (Octets).',
        textEn: 'An IPv4 address consists of 32 bits divided into 4 octets.',
      },
      {
        textAr: 'التحويل بين الثنائي والعشري أساس فهم تقسيم الشبكات.',
        textEn: 'Binary-to-decimal conversion is essential for subnetting.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم الهيكل الثنائي لعنوان IPv4 (32 بت).',
        textEn: 'Understand the 32-bit binary structure of IPv4 addresses.',
      },
      {
        textAr: 'التحويل بين الأرقام العشرية والثنائية للثمانيات.',
        textEn: 'Convert octets between decimal and binary representations.',
      },
    ],
    concept: {
      textAr: 'عنوان IP هو رقم فريد يتكون من 32 بت مقسم إلى 4 أجزاء تسمى الثمانيات (Octets)، مثل 192.168.1.1.',
      textEn: 'An IP address is a 32-bit identifier split into 4 octets separated by dots, such as 192.168.1.1.',
      analogyAr: 'مثل رقم الهاتف المكون من رمز الدولة (جزء الشبكة) والفرعي (جزء المضيف).',
      analogyEn: 'Like a telephone number with a area code (network portion) and subscriber line (host portion).',
      keyTerms: [
        {
          termAr: 'الثمانية (Octet)',
          termEn: 'Octet',
          definitionAr: 'مجموعة من 8 بتات ثنائية تمثل جزءاً من عنوان IP.',
          definitionEn: 'A group of 8 binary bits forming one segment of an IP address.',
        },
      ],
    },
    demonstration: {
      titleAr: 'معاينة التحويل الثنائي في المحاكي',
      titleEn: 'Binary Conversion Demonstration',
      whatToLookForAr: 'لاحظ كيف تتغير القيم الثنائية عند تعديل العنوان العشري.',
      whatToLookForEn: 'Watch binary bits update dynamically as decimal IP changes.',
      initialStateAr: 'العنوان الافتراضي: 192.168.1.0/24.',
      initialStateEn: 'Default Base IP: 192.168.1.0/24.',
    },
    guidedTask: {
      taskTitleAr: 'تطبيق حساب العناوين',
      taskTitleEn: 'Address Calculation Practice',
      instructionsAr: ['افتح محاكي الشبكات.', 'غير بادئة الشبكة ولاحظ تغير قيم البتات.'],
      instructionsEn: ['Open network simulator.', 'Adjust network prefix and observe bit boundaries.'],
      whyWeDoThisAr: 'لتطوير حس برمجى سريع في تحليل عناوين IP.',
      whyWeDoThisEn: 'To build rapid intuition for binary address boundaries.',
      hintsAr: ['كل ثمانية تتراوح قيمتها من 0 إلى 255.'],
      hintsEn: ['Each octet ranges from 0 to 255.'],
      validationCriterionAr: 'تعديل المعاملات وملاحظة القيم الحسابية.',
      validationCriterionEn: 'Adjust parameters and inspect calculated values.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم تحويل العنوان العشري إلى بتات ثنائية وتحديد جزء الشبكة.',
      whatHappenedEn: 'Converted decimal IP to binary bits and highlighted network boundaries.',
      securitySignificanceAr: 'فهم الثنائي يتيح لمحلل الأمان اكتشاف ثغرات التداخل وقواعد الجدار الناري.',
      securitySignificanceEn: 'Binary fluency enables security analysts to identify subnet overlap and firewall bypasses.',
    },
    knowledgeCheck: [
      {
        id: 'q2-1-1',
        questionAr: 'كم عدد البتات الإجمالي في عنوان IPv4؟',
        questionEn: 'How many total bits are in an IPv4 address?',
        options: [
          {
            id: 'a1',
            textAr: '32 بت',
            textEn: '32 bits',
            isCorrect: true,
            explanationAr: 'ممتاز! يتكون عنوان IPv4 من 32 بت مقسمة على 4 ثمانيات.',
            explanationEn: 'Correct! IPv4 consists of 32 bits split into 4 octets.',
          },
          {
            id: 'a2',
            textAr: '64 بت',
            textEn: '64 bits',
            isCorrect: false,
            explanationAr: 'غير صحيح. 64 بت ليس معيار IPv4.',
            explanationEn: 'Incorrect. IPv4 is strictly 32 bits.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-02-02-subnetting-and-cidr',
      takeawayAr: 'انتقل الآن لتعلم التقسيم الفرعي وحساب أقنعة CIDR!',
      takeawayEn: 'Advance now to master subnetting and CIDR prefix masks!',
    },
  },
  'lesson-02-02-subnetting-and-cidr': {
    id: 'lesson-02-02-subnetting-and-cidr',
    milestoneId: 2,
    order: 2,
    titleAr: 'الدرس 2: التقسيم الفرعي وقناع البادئة CIDR',
    titleEn: 'Lesson 2: Subnet Masks, CIDR Notation & Host Ranges',
    whyItMattersAr: 'تقسيم الشبكات إلى قطاعات فرعية يمنع ازدحام البث ويضمن عزل الأقسام الحساسة عن شبكة الضيوف.',
    whyItMattersEn: 'Subnetting partitions flat networks to eliminate broadcast storms and isolate high-value zones from guest networks.',
    estimatedMinutes: 18,
    simulationId: 'subnet_routing',
    challengeId: 'subnet-routing-challenge',
    prerequisites: [
      {
        textAr: 'إكمال الدرس الأول: عناوين IPv4 والمنطق الثنائي.',
        textEn: 'Completion of Lesson 1: IPv4 Addressing & Binary Octet Fundamentals.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: حساب شبكة فرعية CIDR /26',
      titleEn: 'Worked Example: Calculating a /26 CIDR Subnet',
      scenarioAr: 'تقسيم النطاق 192.168.1.0/24 ببادئة /26:',
      scenarioEn: 'Subnetting 192.168.1.0/24 into /26 segments:',
      stepsAr: [
        'قناع الشبكة /26 = 255.255.255.192 (أول 26 بت هي 1).',
        'عدد العناوين الإجمالي في كل شبكة فرعية = 2^(32-26) = 2^6 = 64 عنوان.',
        'عدد الأجهزة الصالحة للاستخدام = 64 - 2 (عنوان الشبكة وعنوان البث) = 62 جهاز.',
        'الشبكات الفرعية الأربع: [192.168.1.0-63]، [192.168.1.64-127]، [192.168.1.128-191]، [192.168.1.192-255].',
      ],
      stepsEn: [
        'Subnet mask for /26 = 255.255.255.192 (first 26 bits set to 1).',
        'Total IP addresses per subnet = 2^(32-26) = 2^6 = 64 addresses.',
        'Usable host IPs = 64 - 2 (Network IP & Broadcast IP) = 62 hosts.',
        '4 resulting subnets: [.0-63], [.64-127], [.128-191], [.192-255].',
      ],
      takeawayAr: 'البادئة /26 تقسم الشبكة إلى 4 قطاعات متساوية يتسع كل منها لـ 62 جهازاً.',
      takeawayEn: '/26 CIDR splits a /24 into 4 equal segments of 62 usable hosts each.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: ضبط قناع CIDR وتأكيد بوابة NAT',
      titleEn: 'Independent Challenge: Set CIDR /26 & Enable NAT',
      scenarioAr: 'قم بضبط قناع CIDR في المحاكي إلى /26 وتأكد من تفعيل بوابة NAT الخارجية:',
      scenarioEn: 'Set the CIDR mask in the simulator to /26 and enable egress NAT gateway:',
      targetOutcomeAr: 'تأكيد توفير 62 جهاز لكل شبكة فرعية وتفعيل ترجمة العناوين.',
      targetOutcomeEn: 'Verify 62 usable hosts per subnet and active NAT egress translation.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأنه يمكن استخدام عنوان الشبكة أو عنوان البث لأجهزة الموظفين.',
      commonMisconceptionEn: 'Thinking network IP or broadcast IP can be assigned to workstations.',
      guidanceAr: 'عنوان الشبكة (القيم الصفراء الأولى) وعنوان البث (القيم الأخيرة) محجوزان بالنظام ولا يمكن تعيينهما لمضيف.',
      guidanceEn: 'Network IP (first IP) and Broadcast IP (last IP) are reserved and cannot be assigned to endpoints.',
    },
    keyTakeaways: [
      {
        textAr: 'قناع CIDR يحدد البتات المخصصة للشبكة والبتات المخصصة للمضيفين.',
        textEn: 'CIDR masks explicitly split bits between network routing and host addressing.',
      },
      {
        textAr: 'خصم عنوانين دائماً (الشبكة والبث) لحساب المضيفين الصالحين.',
        textEn: 'Always subtract 2 (Network & Broadcast) to derive usable host counts.',
      },
    ],
    objectives: [
      {
        textAr: 'حساب أقنعة الشبكات CIDR وعدد الأجهزة الصالحة.',
        textEn: 'Calculate CIDR subnet masks and usable host counts.',
      },
      {
        textAr: 'تطبيق التقسيم الفرعي في المحاكي التفاعلي.',
        textEn: 'Apply subnetting configuration in the interactive lab.',
      },
    ],
    concept: {
      textAr: 'التقسيم الفرعي (Subnetting) هو عملية تقسيم شبكة IP كبيرة إلى شبكات أصغر باستخدام تدوين CIDR (مثل /24 أو /26).',
      textEn: 'Subnetting divides a large IP network into smaller subnetworks using CIDR notation (e.g. /24, /26).',
      analogyAr: 'مثل تقسيم مبنى كبير إلى مكاتب مستقلة لكل قسم بدلاً من قاعة واحدة مفتوحة.',
      analogyEn: 'Like partitioning a floor of a building into individual office suites for security.',
      keyTerms: [
        {
          termAr: 'تدوين CIDR (Classless Inter-Domain Routing)',
          termEn: 'CIDR Notation',
          definitionAr: 'طريقة كتابة قناع الشبكة برقم مسبوق بشرطة مائلة يمثل عدد بتات الشبكة.',
          definitionEn: 'A shorthand method for specifying subnet masks via a slash followed by network bit count.',
        },
      ],
    },
    demonstration: {
      titleAr: 'معاينة التقسيم التفاعلي وبوابة NAT',
      titleEn: 'Subnet & NAT Interactive Demonstration',
      whatToLookForAr: 'شاهد كيف يتغير عدد الأجهزة الصالحة عند اختيار /26 وتفعيل NAT.',
      whatToLookForEn: 'Observe usable hosts count change when selecting /26 and enabling NAT.',
      initialStateAr: 'الوضع الافتراضي /24 مع تعطيل NAT.',
      initialStateEn: 'Default state /24 with NAT disabled.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة تصميم الشبكة الفرعية',
      taskTitleEn: 'Subnet Design Task',
      instructionsAr: [
        'افتح المحاكي التفاعلي.',
        'اختر البادئة /26 من القائمة المنسدلة.',
        'فعل خيار بوابة NAT.',
        'اضغط على زر التحقق لتأكيد النتيجة.',
      ],
      instructionsEn: [
        'Open the interactive simulator.',
        'Select CIDR mask /26 from the dropdown.',
        'Enable the NAT Gateway toggle.',
        'Click Validate Challenge to confirm.',
      ],
      whyWeDoThisAr: 'لتأكيد فهمك العملي للتقسيم وتأمين الخروج للإنترنت.',
      whyWeDoThisEn: 'To verify practical mastery of subnet segmentation and internet egress.',
      hintsAr: ['البادئة /26 توفر 62 جهازاً لكل شبكة.'],
      hintsEn: ['Prefix /26 provides 62 usable hosts per subnet.'],
      validationCriterionAr: 'تثبيت /26 وتفعيل NAT مع ناتج خطر منخفض.',
      validationCriterionEn: 'CIDR set to /26 and NAT enabled.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم تقسيم الشبكة بنجاح وعزل الأجهزة وتأمين الخروج عبر بوابة NAT.',
      whatHappenedEn: 'Successfully segmented network and enabled egress NAT translation.',
      securitySignificanceAr: 'التقسيم الفرعي يمنع الانتشار العرضي للبرمجيات الخبيثة داخل الشبكة.',
      securitySignificanceEn: 'Subnet isolation prevents lateral movement of malware across enterprise segments.',
    },
    knowledgeCheck: [
      {
        id: 'q2-2-1',
        questionAr: 'كم عدد الأجهزة الصالحة للاستخدام في شبكة فرعية ببادئة /26؟',
        questionEn: 'How many usable host IP addresses exist in a /26 subnet?',
        options: [
          {
            id: 'b1',
            textAr: '62 جهازاً (64 - 2)',
            textEn: '62 hosts (64 - 2)',
            isCorrect: true,
            explanationAr: 'إجابة صحيحة! إجمالي 64 مطروحاً منه عنوان الشبكة وعنوان البث.',
            explanationEn: 'Correct! Total 64 minus 2 reserved addresses (Network & Broadcast).',
          },
          {
            id: 'b2',
            textAr: '254 جهازاً',
            textEn: '254 hosts',
            isCorrect: false,
            explanationAr: 'غير صحيح. 254 هو عدد الأجهزة في /24 وليس /26.',
            explanationEn: 'Incorrect. 254 usable hosts belongs to a /24 subnet.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-03-subnet-routing',
      takeawayAr: 'انتقل الآن إلى درس توجيه الحزم وبوابة NAT لتتبع القفزات حياً!',
      takeawayEn: 'Advance to Packet Routing & NAT Gateways to trace live hops!',
    },
  },
  'lesson-01-cia-triad': {
    id: 'lesson-01-cia-triad',
    milestoneId: 1,
    order: 1,
    titleAr: 'الدرس الأول: مدخل إلى ثالوث الحماية الأساسي (CIA Triad)',
    titleEn: 'Lesson 1: The Core Security CIA Triad',
    whyItMattersAr: 'كل إجراء أمني في العالم، من كلمة مرور هاتفك إلى تأمين المنشآت الحيوية، صُمم لحماية أحد هذه المحاور الثلاثة.',
    whyItMattersEn: 'Every security control in the world, from your phone PIN to protecting critical infrastructure, is built on these three pillars.',
    estimatedMinutes: 12,
    simulationId: 'cia_triad',
    challengeId: 'cia-balance-challenge',
    prerequisites: [
      {
        textAr: 'معرفة أساسية بأساسيات الحاسوب واستخدام المتصفح.',
        textEn: 'Basic familiarity with computer operations and web browser navigation.',
      },
      {
        textAr: 'لا يتطلب هذا الدرس أي خبرة برمجية مسبقة.',
        textEn: 'No prior programming or cybersecurity experience required.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي توضيحي: تأمين نظام التحويل المالي',
      titleEn: 'Worked Example: Securing a Wire Transfer System',
      scenarioAr: 'تخيّل بنكًا يتعامل مع طلبات تحويل الأموال الإلكترونية بقيمة ملايين الريالات يوميًا:',
      scenarioEn: 'Imagine a bank processing electronic funds transfer requests worth millions daily:',
      stepsAr: [
        'الخطوة 1 (السرية): يقوم البنك بتشفير بيانات العميل ببروتوكول TLS 1.3 لمنع المشغلين في أجهزة الموجهات من رؤية رقم الحساب.',
        'الخطوة 2 (السلامة): يتم توليد بصمة حسابية (HMAC-SHA256) لكل طلب تحويل؛ إن حاول أحد تعديل قيمة المبلغ من 1000 إلى 100,000، تفشل عملية التحقق فورًا.',
        'الخطوة 3 (التوافر): يتوزع نظام البنك على مركزَي بيانات مستقلين مع موازن أحمال (Load Balancer)، فإذا تعطل خادم يستلم خادم آخر الخدمة خلال 100 ميلي ثانية.',
      ],
      stepsEn: [
        'Step 1 (Confidentiality): The bank encrypts customer payload using TLS 1.3 so routers along the way cannot inspect account numbers.',
        'Step 2 (Integrity): An HMAC-SHA256 cryptographic digest is computed for the transfer payload; changing $1,000 to $100,000 breaks the digest check instantly.',
        'Step 3 (Availability): Bank servers replicate active states across dual redundant data centers with automated load balancing to survive hardware failure in <100ms.',
      ],
      takeawayAr: 'أي ثغرة في أحد هذه الجوانب الثلاثة تؤدي لكسر الحماية البنكية بالكامل.',
      takeawayEn: 'A failure in any single pillar compromises the security of the entire financial application.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: موازنة الحماية والمخاطر',
      titleEn: 'Independent Challenge: Balancing Protection & Risk',
      scenarioAr: 'أنت الآن المستشار الأمني لمنشأة حيوية تعرضت لإنذارات أمنية متكررة:',
      scenarioEn: 'You are acting as the Chief Information Security Officer (CISO) for a critical utility provider:',
      targetOutcomeAr: 'شغّل جميع ضوابط الحماية الثلاثة (التشفير، التوقيع الرقمي، التكرار) لتخفيض الخطر الكلي إلى أقل من 20%.',
      targetOutcomeEn: 'Activate all three control vectors (Encryption, Digital Signatures, Redundancy) to reduce overall risk below 20%.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن تفعيل التشفير وحده يكفي لحماية النظام بالكامل.',
      commonMisconceptionEn: 'Mistakenly believing that encryption alone secures the entire application.',
      guidanceAr: 'التشفير يحمي السرية فقط، لكنه لا يمنع المهاجم من تعطيل الخادم (التوافر) أو حشو بيانات مزورة إذا لم توجد آليات للسلامة.',
      guidanceEn: 'Encryption secures confidentiality only. It cannot prevent Denial-of-Service or data tampering unless paired with Integrity signatures and High-Availability infrastructure.',
    },
    keyTakeaways: [
      {
        textAr: 'ثالوث CIA هو الأساس النظري والعملي لمعايير الأمن السيبراني العالمية (NIST / ISO 27001).',
        textEn: 'The CIA Triad forms the foundational baseline for global cybersecurity standards (NIST / ISO 27001).',
      },
      {
        textAr: 'الحماية المتكاملة تتطلب الدفاع بالعمق (Defense-in-Depth) بجميع المحاور دون إهمال أي جزء.',
        textEn: 'Comprehensive protection demands a defense-in-depth posture across all three core vectors.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم الأركان الثلاثة: السرية (Confidentiality)، السلامة (Integrity)، والتوافر (Availability).',
        textEn: 'Understand the three pillars: Confidentiality, Integrity, and Availability.',
      },
      {
        textAr: 'التمييز بين التهديد (Threat) ونقطة الضعف (Vulnerability) وإجراء الحماية (Security Control).',
        textEn: 'Distinguish between Threat, Vulnerability, and Security Control.',
      },
    ],
    concept: {
      textAr: `الأمن السيبراني ليس مجرد شاشات سوداء وأوامر معقدة؛ هو في جوهره حماية الأشياء الرقمية التي نثق بها.
لتنظيم هذه الحماية، اتفق خبراء العالم على نموذج مبسط يسمى «ثالوث CIA»:
1. السرية (Confidentiality): المعلومات لا يراها إلا من يملك الإذن بذلك.
2. السلامة (Integrity): المعلومات تظل صحيحة كما هي ولم يُعدل عليها خلسة.
3. التوافر (Availability): الأنظمة تعمل ومتاحة عندما يحتاجها أصحابها الشرعيون.`,
      textEn: `Cybersecurity is not about mysterious black terminals; it is fundamentally about protecting the digital things we rely on.
To organize security defenses, professionals use the CIA Triad:
1. Confidentiality: Only authorized people can read the data.
2. Integrity: Data remains accurate and has not been secretly tampered with.
3. Availability: Systems and files are accessible whenever authorized users need them.`,
      analogyAr: `تخيّل حسابك البنكي:
• السرية: جارك لا يستطيع الاطلاع على رصيدك (مثل الرسالة داخل مظروف مغلق ومختوم).
• السلامة: لا أحد يستطيع تغيير رقم التحويل من 100 ريال إلى 10,000 ريال دون كشفه (مثل الشيك الموقع الذي لا يمكن تزويره).
• التوافر: تستطيع سحب نقود من الصراف الآلي متى ما احتجت دون أن تجد النظام معطلاً (مثل وجود مولد كهرباء احتياطي).`,
      analogyEn: `Imagine your bank account:
• Confidentiality: Your neighbor cannot read your account balance (like a letter sealed inside an envelope).
• Integrity: Nobody can secretly modify a transfer amount from $100 to $10,000 (like a signature that proves authenticity).
• Availability: You can withdraw money from the ATM whenever you need it (like having backup power generators).`,
      keyTerms: [
        {
          termAr: 'ثالوث CIA (CIA Triad)',
          termEn: 'CIA Triad',
          definitionAr: 'اختصار للسرية (Confidentiality) والسلامة (Integrity) والتوافر (Availability)؛ الركائز الثلاث لأي نظام أمني.',
          definitionEn: 'Acronym for Confidentiality, Integrity, and Availability; the universal three-pillar security model.',
        },
        {
          termAr: 'التشفير (Encryption)',
          termEn: 'Encryption',
          definitionAr: 'تحويل النص المقروء إلى نص غير مفهوم بواسطة مفتاح حسابي، لحماية السرية.',
          definitionEn: 'Transforming human-readable plaintext into unreadable ciphertext to enforce confidentiality.',
        },
        {
          termAr: 'التوقيع الرقمي (Digital Signature)',
          termEn: 'Digital Signature',
          definitionAr: 'بصمة حسابية تثبت أن البيانات لم تتغير وصادرة من المرسل الحقيقي، لحماية السلامة.',
          definitionEn: 'A cryptographic hash value proving that data was not altered and originated from a trusted sender.',
        },
        {
          termAr: 'التكرار والاحتياط (Redundancy)',
          termEn: 'Redundancy',
          definitionAr: 'توفير خوادم ومسارات بديلة تعمل فور تعطل المكون الأساسي، لضمان التوافر.',
          definitionEn: 'Deploying duplicate backup servers and links to ensure uninterrupted system uptime.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستشاهده في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'ستلاحظ ثلاثة مفاتيح تشغيل تمثل ضوابط الحماية (التشفير، التوقيع الرقمي، التكرار). بجانبها مؤشر نسبة الخطر العام للمؤسسة.',
      whatToLookForEn: 'You will see three toggle switches representing controls (Encryption, Digital Signatures, Redundancy) alongside an Enterprise Risk meter.',
      initialStateAr: 'عند تعطيل أي ضابط أمني، يرتفع مؤشر الخطر مباشرة ويكون النظام عرضة للهجمات الموضحة.',
      initialStateEn: 'Disabling any control immediately causes the Risk meter to spike, leaving the system exposed to attack.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح المحاكي التفاعلي أدناه.',
        'قم بتفعيل مفتاح "تشفير البيانات" لحماية السرية من هجمات التنصت.',
        'قم بتفعيل مفتاح "التوقيع الرقمي" لحماية سلامة الملفات من التلاعب.',
        'قم بتفعيل مفتاح "تكرار الخوادم" لضمان التوافر وصد هجمات حجب الخدمة (DoS).',
        'راقب انخفاض نسبة الخطر الكلي إلى أقل من 20% لتأكيد الحماية.',
      ],
      instructionsEn: [
        'Open the interactive simulator below.',
        'Enable Data Encryption to guard Confidentiality against eavesdropping.',
        'Enable Digital Signatures to protect Integrity against unauthorized modifications.',
        'Enable Server Redundancy to safeguard Availability against Denial-of-Service attacks.',
        'Observe the overall enterprise risk dropping below 20% to confirm resilience.',
      ],
      whyWeDoThisAr: 'تطبيق دفاع متكامل؛ إذا أهملت التوافر ستتوقف أعمال الشركة، وإذا أهملت السرية ستتسرب الأسرار.',
      whyWeDoThisEn: 'Defense-in-depth: Neglecting availability halts business, while neglecting confidentiality leaks proprietary data.',
      hintsAr: [
        'المفاتيح الخضراء الثلاثة يجب أن تكون في وضع التشغيل (Active).',
        'يمكنك تجربة إطلاق هجوم تنصت لرؤية كيف يصده التشفير.',
      ],
      hintsEn: [
        'Ensure all three green control switches are active.',
        'You can test triggering an attack to see how encryption repels eavesdropping.',
      ],
      validationCriterionAr: 'تفعيل عناصر الحماية الثلاثة وانخفاض مؤشر الخطر إلى أقل من 20%.',
      validationCriterionEn: 'All three protection controls enabled with calculated risk under 20%.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'عندما فعّلت الضوابط الثلاثة، تم تحصين قناة الاتصال، ففشلت محاولات المهاجم في قراءة البيانات أو تعديلها أو إسقاط الخادم.',
      whatHappenedEn: 'Enabling all three controls secured the communication channel, neutralizing the attacker attempts to read, tamper with, or take down servers.',
      securitySignificanceAr: 'الأمن ليس إجراءً واحدًا؛ هو توازن ذكي بين السرية والسلامة والتوافر حتى تظل المؤسسة آمنة ومنتجة في الوقت ذاته.',
      securitySignificanceEn: 'Security is not a single tool; it is a deliberate balance between Confidentiality, Integrity, and Availability ensuring organizations stay protected and productive.',
    },
    knowledgeCheck: [
      {
        id: 'q1-cia-pillar',
        questionAr: 'تعرض موقع شركة تجارية لانقطاع تام في الخدمة لعدة ساعات بسبب هجوم حجب خدمة (DoS). أي ركن من ثالوث CIA تم انتهاكه؟',
        questionEn: 'An e-commerce website suffered an outage for several hours due to a Denial of Service (DoS) attack. Which CIA pillar was violated?',
        options: [
          {
            id: 'opt-a',
            textAr: 'السرية (Confidentiality)',
            textEn: 'Confidentiality',
            isCorrect: false,
            explanationAr: 'غير صحيح. السرية تُنتهك عند تسريب البيانات الخاصة، أما انقطاع الموقع فهو خلل في التوافر.',
            explanationEn: 'Incorrect. Confidentiality is violated when private data leaks; downtime is an availability failure.',
          },
          {
            id: 'opt-b',
            textAr: 'السلامة (Integrity)',
            textEn: 'Integrity',
            isCorrect: false,
            explanationAr: 'غير صحيح. السلامة تتعلق بتعديل وتزوير البيانات دون إذن.',
            explanationEn: 'Incorrect. Integrity relates to unauthorized data alterations or forgery.',
          },
          {
            id: 'opt-c',
            textAr: 'التوافر (Availability)',
            textEn: 'Availability',
            isCorrect: true,
            explanationAr: 'إجابة صحيحة وممتازة! التوافر يعني أن تكون الخدمة متاحة لمن يطلبها. هجوم DoS يهدف لمنع الوصول للخدمة.',
            explanationEn: 'Correct! Availability means systems remain accessible when authorized users need them. DoS aims to deny that access.',
          },
        ],
      },
      {
        id: 'q2-encryption-purpose',
        questionAr: 'ما الهدف الأساسي من استخدام خوارزميات التشفير (Encryption) عند إرسال رسالة عبر الإنترنت؟',
        questionEn: 'What is the primary objective of using encryption when transmitting a message over the Internet?',
        options: [
          {
            id: 'opt-2a',
            textAr: 'تسريع وصول الرسالة عبر أسلاك الشبكة',
            textEn: 'Speeding up message transmission across network cables',
            isCorrect: false,
            explanationAr: 'غير صحيح. التشفير يضيف عمليات حسابية طفيفة ولا يُسرع الشبكة.',
            explanationEn: 'Incorrect. Encryption adds cryptographic computations and does not accelerate network throughput.',
          },
          {
            id: 'opt-2b',
            textAr: 'ضمان السرية حتى لا يستطيع المتنصتون قراءة محتوى الرسالة',
            textEn: 'Guarding confidentiality so eavesdroppers cannot read the message contents',
            isCorrect: true,
            explanationAr: 'إجابة صحيحة! التشفير يحول البيانات إلى نصوص غير مفهومة لمن لا يملك مفتاح فك التشفير.',
            explanationEn: 'Correct! Encryption scrambles data so that only authorized keyholders can decipher and read it.',
          },
          {
            id: 'opt-2c',
            textAr: 'حذف الرسالة تلقائيًا بعد دقيقة واحدة',
            textEn: 'Automatically deleting the message after one minute',
            isCorrect: false,
            explanationAr: 'غير صحيح. الحذف التلقائي ميزة في بعض التطبيقات وليس تعريف التشفير.',
            explanationEn: 'Incorrect. Self-destructing messages are an application feature, not the core definition of encryption.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-02-system-internals',
      takeawayAr: 'رائع! لقد أتقنت أول مفهوم في عالم الأمن السيبراني. الخطوة التالية هي فهم كيف يعالج الحاسوب هذه البيانات في الذاكرة والمعالج.',
      takeawayEn: 'Outstanding! You have mastered the foundational principle of cybersecurity. Next, explore how computers handle data in memory and CPU.',
    },
  },

  'lesson-02-system-internals': {
    id: 'lesson-02-system-internals',
    milestoneId: 1,
    order: 2,
    titleAr: 'الدرس الثاني: كيف يحمي نظام التشغيل نفسه وبرامجه؟',
    titleEn: 'Lesson 2: OS Privilege Isolation & System Internals',
    whyItMattersAr: 'إذا استطاع أي برنامج عادي تعديل ذاكرة النظام الأساسية، فسيتمكن المخترق من السيطرة الكاملة على جهازك.',
    whyItMattersEn: 'If any regular program could rewrite core OS memory, an attacker could seize total administrative control over the machine.',
    estimatedMinutes: 15,
    simulationId: 'system_internals',
    worldId: 2,
    challengeId: 'internals-memory-challenge',
    prerequisites: [
      {
        textAr: 'إكمال الدرس الأول: ثالوث الحماية الأساسي (CIA Triad).',
        textEn: 'Completion of Lesson 1: CIA Triad & Core Security Principles.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: تتبع محاولة الوصول غير المصرح لذاكرة النواة',
      titleEn: 'Worked Example: Intercepting Unauthorized Kernel Memory Access',
      scenarioAr: 'برنامج عادي يحاول القراءة المباشرة من مساحة ذاكرة النواة (Ring 0):',
      scenarioEn: 'A user-mode process attempts direct memory read from Kernel space (Ring 0):',
      stepsAr: [
        'الخطوة 1: يرسل البرنامج تعليمة قراءة لعنوان في مساحة النواة (Kernel Space).',
        'الخطوة 2: يكتشف العتاد (CPU) أن مستوى الصلاحية الحالي هو Ring 3 (وضع المستخدم).',
        'الخطوة 3: يطلق المعالج اعتراض عتادي (Trap) ويحول التحكم للنواة.',
        'الخطوة 4: تنهي النواة العملية فوراً لمنع تسريب الذاكرة وتصدر خطأ Segmentation Fault.',
      ],
      stepsEn: [
        'Step 1: User process emits read instruction for address in Kernel space.',
        'Step 2: CPU checks current privilege ring level (Ring 3 vs Ring 0).',
        'Step 3: CPU triggers hardware exception trap, passing execution to kernel handler.',
        'Step 4: Kernel immediately kills the process with Segmentation Fault to safeguard RAM.',
      ],
      takeawayAr: 'العتاد يمنع التطبيقات العادية من الوصول للذاكرة السيادية للنظام.',
      takeawayEn: 'Hardware CPU rings strictly isolate kernel RAM from user-space processes.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: محاكاة استدعاء النظام الآمن (Syscall)',
      titleEn: 'Independent Challenge: Safe System Call Execution',
      scenarioAr: 'اطلب خدمة فتح ملف من النواة باستخدام التجسير المسموح عبر Syscall دون انتهاك الذاكرة:',
      scenarioEn: 'Request disk file read service using controlled syscall interface without breaching memory rules:',
      targetOutcomeAr: 'تنفيذ استدعاء النظام ونجاح قراءة الملف عبر قنوات النواة المصرحة.',
      targetOutcomeEn: 'Execute legitimate syscall and complete file read via validated kernel channels.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن وضع النواة متاح لأي برنامج بسرعة عند الحاجة.',
      commonMisconceptionEn: 'Thinking user apps can switch to kernel mode at will.',
      guidanceAr: 'الانتقال لوضع النواة يتم بضبط محكم للغاية عبر بوابات استدعاء النظام فقط.',
      guidanceEn: 'Privilege escalation to Ring 0 is gated strictly by hardware syscall boundaries.',
    },
    keyTakeaways: [
      {
        textAr: 'العزل بين وضع المستخدم ووضع النواة يمنع انهيار النظام عند تعطل التطبيقات.',
        textEn: 'User/Kernel isolation prevents total system crashes when user applications fail.',
      },
      {
        textAr: 'استدعاء النظام (Syscall) هو البوابة المشروعة الوحيدة لطلب خدمات العتاد.',
        textEn: 'System calls are the sole authorized gateway for requesting hardware services.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم الفصل بين وضع المستخدم (User Mode) ووضع النواة (Kernel Mode).',
        textEn: 'Understand the hardware separation between User Mode and Kernel Mode.',
      },
      {
        textAr: 'معرفة كيف تمنع حماية الذاكرة (Memory Isolation) البرامج الضارة من قراءة بيانات برامج أخرى.',
        textEn: 'Learn how memory isolation prevents malicious software from snooping on other processes.',
      },
    ],
    concept: {
      textAr: `الحاسوب يحتوي على معالج (CPU) وذاكرة عشوائية (RAM). لو سُمح لأي تطبيق قراءة كل الذاكرة، لتمكنت لعبة بسيطة من قراءة كلمات مرورك من المتصفح!
لحمايتك، تضع المعالجات الحديثة جدارًا صارمًا:
• وضع المستخدم (User Mode - Ring 3): تعمل فيه برامجك اليومية (المتصفح، الآلة الحاسبة، الألعاب) بصلاحيات مقيدة.
• وضع النواة (Kernel Mode - Ring 0): يعمل فيه عقل نظام التشغيل فقط، وله حق الوصول المباشر للعتاد والذاكرة.`,
      textEn: `A computer relies on a CPU and RAM. If any application could inspect all physical memory, a simple video game could harvest your browser passwords!
To prevent this, CPUs enforce strict rings of protection:
• User Mode (Ring 3): Where regular apps run (browsers, editors, calculators) with constrained permissions.
• Kernel Mode (Ring 0): The core OS brain with direct access to hardware instructions and physical RAM.`,
      analogyAr: `تخيل طائرة ركاب:
• وضع المستخدم هو مقصورة الركاب: يمكنك استخدام الشاشة والطلب من المضيف، لكنك لا تستطيع لمس مقبض القيادة.
• وضع النواة هو قمرة القيادة: لا يدخلها إلا الطيار المرخص، لأن أي خطأ هناك يُسقط الطائرة بالكامل.`,
      analogyEn: `Think of a commercial airplane:
• User Mode is the passenger cabin: You can watch movies and request snacks, but you cannot touch the flight controls.
• Kernel Mode is the locked cockpit: Only certified pilots can enter, because an error there crashes the plane.`,
      keyTerms: [
        {
          termAr: 'نواة النظام (Kernel)',
          termEn: 'Operating System Kernel',
          definitionAr: 'الجزء الأساسي والحيوي في نظام التشغيل الذي يدير الذاكرة والمعالج والأجهزة.',
          definitionEn: 'The central core of the operating system managing hardware, CPU scheduling, and memory.',
        },
        {
          termAr: 'استدعاء النظام (System Call)',
          termEn: 'System Call (syscall)',
          definitionAr: 'طلب رسمي يرسله البرنامج العادي إلى النواة عندما يريد فتح ملف أو الاتصال بالشبكة.',
          definitionEn: 'A controlled request made by a user-mode program to the kernel to perform privileged actions like disk or network I/O.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'شاهد خريطة الذاكرة المقسمة بين مساحة النواة (Kernel Space) ومساحات التطبيقات المستقلة.',
      whatToLookForEn: 'Observe the memory layout cleanly partitioned between Kernel Space and isolated application spaces.',
      initialStateAr: 'محاولة برنامج عادي الوصول المباشر لعنوان ذاكرة محمي يؤدي لاعتراض العتاد وإصدار خطأ انتهاك وصول (Segmentation Fault).',
      initialStateEn: 'An ordinary process attempting direct access to protected memory triggers a hardware trap (Segmentation Fault).',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'انتقل إلى محاكي عمارة الحاسوب وحماية الذاكرة.',
        'شاهد كيفية تخصيص مساحة ذاكرة افتراضية معزولة لكل عملية.',
        'جرّب حقن طلب وصول غير مصرح من عملية عادية إلى ذاكرة النواة.',
        'لاحظ كيف تعترض النواة العملية فورًا وتمنع تسريب البيانات.',
      ],
      instructionsEn: [
        'Open the System Internals and Memory simulator.',
        'View how each process receives its own isolated virtual memory space.',
        'Simulate an unauthorized memory read attempt into kernel space.',
        'Observe how the hardware trap immediately terminates the offending process to safeguard memory.',
      ],
      whyWeDoThisAr: 'فهم كيف يمنع العتاد ونظام التشغيل البرمجيات الخبيثة من السيطرة على الجهاز.',
      whyWeDoThisEn: 'Understanding how OS memory protection acts as the first line of defense against malware takeovers.',
      hintsAr: [
        'راقب زر استدعاء النظام (System Call) لرؤية الطريقة المشروعة الوحيدة لطلب خدمة من النواة.',
      ],
      hintsEn: [
        'Inspect the System Call button to see the only legitimate doorway into kernel operations.',
      ],
      validationCriterionAr: 'فحص عزل الذاكرة واكتشاف اعتراض الوصول غير المصرح به.',
      validationCriterionEn: 'Memory isolation inspected and unauthorized access trap verified.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'رفض المعالج السماح للبرنامج بقراءة ذاكرة النواة لأن تعليمة القراءة جاءت بمستوى صلاحيات منخفض (Ring 3).',
      whatHappenedEn: 'The CPU blocked the process from accessing kernel RAM because the instruction was executed at an unprivileged level (Ring 3).',
      securitySignificanceAr: 'هذا العزل هو أساس أمان الهواتف والحواسيب؛ بدونه لا يمكن لأي برنامج مصرفي أو محفظة تشفير أن تكون آمنة.',
      securitySignificanceEn: 'This hardware isolation is the bedrock of modern computing; without it, banking apps and password managers could never exist safely.',
    },
    knowledgeCheck: [
      {
        id: 'q1-kernel-vs-user',
        questionAr: 'لماذا لا تعمل المتصفحات وبرامج تحرير النصوص في وضع النواة (Kernel Mode)؟',
        questionEn: 'Why don’t web browsers and text editors run directly in Kernel Mode?',
        options: [
          {
            id: 'opt-k1',
            textAr: 'لأن تشغيلها في وضع النواة يعطيها صلاحية كاملة غير مقيدة؛ وأي خطأ أو ثغرة فيها قد يسقط النظام بالكامل',
            textEn: 'Because running in kernel mode grants unrestricted hardware access; any crash or exploit compromises the entire operating system',
            isCorrect: true,
            explanationAr: 'صحيح تمامًا! حصر البرامج في وضع المستخدم يحمي النظام من الانهيار ويمنع المخترقين من السيطرة الكاملة على الجهاز.',
            explanationEn: 'Exactly right! Confining apps to user mode limits blast radius and stops vulnerabilities from seizing full system control.',
          },
          {
            id: 'opt-k2',
            textAr: 'لأن وضع النواة يجعل البرامج بطيئة جدًا في استهلاك الإنترنت',
            textEn: 'Because kernel mode slows down internet bandwidth',
            isCorrect: false,
            explanationAr: 'غير صحيح. وضع النواة هو الأسرع والأقرب للعتاد، لكن السبب هو الأمان والاستقرار.',
            explanationEn: 'Incorrect. Kernel mode has zero execution overhead, but apps are kept out for security and system stability.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-02-01-ip-addressing-and-binary',
      takeawayAr: 'ممتاز! فهمت الآن كيف يحمي الحاسوب نفسه داخليًا. حان الوقت لنتعلم كيف تتواصل الحواسيب عبر الشبكات في الدرس الثالث.',
      takeawayEn: 'Great job! Now you understand internal host security. Next, discover how machines communicate securely over networks.',
    },
  },

  'lesson-03-subnet-routing': {
    id: 'lesson-03-subnet-routing',
    milestoneId: 2,
    order: 3,
    titleAr: 'الدرس الثالث: فهم الشبكات وعناوين IP والتوجيه',
    titleEn: 'Lesson 3: Network Fundamentals & IP Routing',
    whyItMattersAr: 'لا يوجد أمن سيبراني بدون شبكات؛ فكل هجوم وكل دفاع يعبر من خلال حزم البيانات وعناوين الشبكة.',
    whyItMattersEn: 'Cybersecurity revolves around networks; virtually every cyber attack and defensive response flows through packets and IP routes.',
    estimatedMinutes: 15,
    simulationId: 'subnet_routing',
    worldId: 3,
    challengeId: 'subnet-routing-challenge',
    prerequisites: [
      {
        textAr: 'إكمال الدرس 2: التقسيم الفرعي وقناع البادئة CIDR.',
        textEn: 'Completion of Lesson 2: Subnet Masks & CIDR Notation.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: تتبع مسار حزمة عبر راوتر (Hop-by-Hop)',
      titleEn: 'Worked Example: Tracing a Packet via Router Hops',
      scenarioAr: 'إرسال حزمة من شبكة 192.168.1.0/24 إلى خادم في شبكة 10.0.0.0/8:',
      scenarioEn: 'Sending a packet from 192.168.1.0/24 to a server in 10.0.0.0/8:',
      stepsAr: [
        'الخطوة 1: يكتشف المضيف أن الوجهة خارج شبكته المحلية فيرسلها للبوابة الافتراضية (Default Gateway).',
        'الخطوة 2: يفحص الراوتر جدول التوجيه (Routing Table) للعثور على أفضل مطابقة للبادئة (Longest Prefix Match).',
        'الخطوة 3: يغير الراوتر عنوان MAC للوجهة (Layer 2) مع الحفاظ على عناوين IP الأصلية (Layer 3).',
        'الخطوة 4: تصل الحزمة للواجهة الصحيحة في الشبكة المستهدفة.',
      ],
      stepsEn: [
        'Step 1: Host determines destination is non-local and forwards frame to Default Gateway.',
        'Step 2: Router consults its Routing Table for the Longest Prefix Match (LPM).',
        'Step 3: Router rewrites Layer 2 MAC addresses while preserving Layer 3 IP headers.',
        'Step 4: Packet is egressed out the correct interface toward the destination network.',
      ],
      takeawayAr: 'الراوتر هو صلة الوصل التي تربط الجزر الشبكية المعزولة ببعضها.',
      takeawayEn: 'Routers bridge isolated network islands by making intelligent forwarding decisions.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: تشخيص مسار فاشل وتعديل الجدول',
      titleEn: 'Independent Challenge: Troubleshooting Failed Routes',
      scenarioAr: 'حزمة لا تصل لوجهتها بسبب غياب مسار العودة (Return Route). قم بتشخيص الجدول وإصلاحه:',
      scenarioEn: 'A packet fails to reach its destination due to a missing return route. Audit and fix the table:',
      targetOutcomeAr: 'تأمين وصول الحزمة واستلام الرد (Echo Reply) بنجاح.',
      targetOutcomeEn: 'Ensure bidirectional packet flow and successful Echo Reply reception.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن الحزم تتحرك عشوائياً في الإنترنت.',
      commonMisconceptionEn: 'Thinking packets roam randomly through the internet.',
      guidanceAr: 'كل قفزة (Hop) محكومة بقرار منطقي دقيق داخل جدول التوجيه بناءً على عنوان الوجهة.',
      guidanceEn: 'Every hop is governed by a deterministic logic lookup in the local routing table.',
    },
    keyTakeaways: [
      {
        textAr: 'التوجيه يعتمد على عناوين IP (الطبقة الثالثة) وجداول التوجيه.',
        textEn: 'Routing operates at Layer 3 using IP addresses and routing tables.',
      },
      {
        textAr: 'البوابة الافتراضية هي المخرج الوحيد للبيانات المتوجهة لشبكات غريبة.',
        textEn: 'The Default Gateway is the sole exit for traffic destined for external networks.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم عنوان IP وبنية حزمة البيانات (Packet).',
        textEn: 'Understand IP addresses and network packet structures.',
      },
      {
        textAr: 'معرفة كيف يوجه الراوتر الحزم بين الشبكات الفرعية (Subnets).',
        textEn: 'Learn how routers forward packets between distinct subnets.',
      },
    ],
    concept: {
      textAr: `عندما ترسل صورة لصديقك، لا تنتقل الصورة ككتلة واحدة في السلك، بل تُقسم إلى قطع صغيرة تسمى «حزم البيانات» (Packets).
تحتوي كل حزمة على:
• عنوان المصدر (من أين جاءت؟).
• عنوان الوجهة (إلى أين تذهب؟).
• البيانات الفعلية (جزء من الصورة).
عنوان IP مثل رقم الشارع والمبنى، يحدد موقع كل جهاز في الشبكة بدقة (مثل 192.168.1.10).`,
      textEn: `When you send a photo to a friend, it does not travel as a single chunk. Instead, it gets broken down into small units called packets.
Every packet contains:
• Source IP (Where did it come from?)
• Destination IP (Where is it going?)
• Payload (The actual slice of data)
An IP address functions like a postal street address, identifying each device on a network uniquely (e.g. 192.168.1.10).`,
      analogyAr: `مثل إرسال طرد بريدي:
الكرتون هو الحزمة (Packet)، المكتوب في خانة المرسل هو عنوان IP المصدر، والملصق في خانة المستلم هو عنوان IP الوجهة، وعامل البريد الذي يقرأ العنوان ويوجهه للمدينة الصحيحة هو الموجه (Router).`,
      analogyEn: `Like sending a parcel:
The shipping box is the packet, the sender address is the source IP, the recipient label is the destination IP, and the postal sorting hub redirecting the box is the router.`,
      keyTerms: [
        {
          termAr: 'حزمة البيانات (Packet)',
          termEn: 'Data Packet',
          definitionAr: 'وحدة نقل البيانات الأساسية عبر شبكات الإنترنت، تحتوي على ترويسة بالعناوين والبيانات المحمولة.',
          definitionEn: 'The formatted unit of data carried across IP networks containing header addresses and payload.',
        },
        {
          termAr: 'الموجه (Router)',
          termEn: 'Router',
          definitionAr: 'جهاز شبكي يربط بين شبكات مختلفة ويوجه كل حزمة إلى المسار الصحيح للوصول لوجهتها.',
          definitionEn: 'A network device that forwards data packets between different IP subnets toward their destinations.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'راقب حزم البيانات وهي تتحرك بين أجهزة الحاسوب عبر الموجه، وتفقد جدول التوجيه (Routing Table).',
      whatToLookForEn: 'Watch packets move between workstations across routers, and inspect the routing table entries.',
      initialStateAr: 'عند إرسال طلب، يحدد الراوتر هل الوجهة محلية في نفس الشبكة الفرعية أم تتطلب التمرير عبر البوابة الافتراضية (Default Gateway).',
      initialStateEn: 'When sending traffic, the router determines whether the destination is local or requires forwarding via default gateway.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح محاكي تقسيم الشبكات والتوجيه.',
        'أرسل حزمة اختبارية (Ping) من الجهاز 10.0.1.5 إلى الخادم 10.0.2.10.',
        'تتبع مسار الحزمة وهي تمر بالموجه المركزي.',
        'لاحظ كيف تترجم العناوين وتصل الحزمة لوجهتها الصحيحة.',
      ],
      instructionsEn: [
        'Open the Subnetting & Routing Table simulator.',
        'Transmit a test ping packet from client 10.0.1.5 to server 10.0.2.10.',
        'Trace the packet journey as it traverses the central router.',
        'Observe how the router consults its routing table to deliver the packet cleanly.',
      ],
      whyWeDoThisAr: 'فهم مسارات الشبكة يعلمك أين يضع مهندس الأمن جدران الحماية وأنظمة التفتيش.',
      whyWeDoThisEn: 'Understanding traffic paths teaches you where defenders strategically position firewalls and sensors.',
      hintsAr: [
        'إذا تعطل مسار التوجيه، ستظهر رسالة "Destination Host Unreachable".',
      ],
      hintsEn: [
        'If a routing path is missing, the network drops the packet with Destination Host Unreachable.',
      ],
      validationCriterionAr: 'إرسال حزمة بنجاح عبر مسار التوجيه بين شبكتين مختلفتين.',
      validationCriterionEn: 'Successful packet transit verified across routed subnets.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'قرأ الموجه عنوان IP الوجهة، وطابق العنوان مع جدول التوجيه، ومرر الحزمة عبر المنفذ الصحيح نحو الخادم.',
      whatHappenedEn: 'The router read the destination IP, matched it against its routing table, and dispatched the packet out the proper interface.',
      securitySignificanceAr: 'فصل الشبكات إلى مناطق فرعية (Segmentation) هو الأساس لمنع المهاجم من التنقل الحر إذا اخترق جهازًا واحدًا.',
      securitySignificanceEn: 'Network segmentation is the foundational technique preventing attackers from moving laterally across internal networks.',
    },
    knowledgeCheck: [
      {
        id: 'q1-subnet-segregation',
        questionAr: 'لماذا تعزل الشركات خوادم قواعد البيانات في شبكة فرعية منفصلة عن أجهزة الموظفين؟',
        questionEn: 'Why do organizations isolate database servers into a separate subnet from employee laptops?',
        options: [
          {
            id: 'opt-sub1',
            textAr: 'حتى إذا تعرض جهاز موظف للاختراق بواسطة بريد تصيد، لا يستطيع المهاجم الوصول المباشر لقاعدة البيانات',
            textEn: 'So that if an employee laptop gets infected via phishing, the attacker cannot reach the database directly',
            isCorrect: true,
            explanationAr: 'رائع وصحيح! هذا هو مبدأ عزل الشبكات (Network Segmentation) لحصر الضرر ومنع الانتشار الجانبي.',
            explanationEn: 'Superb and correct! This is the essence of network segmentation: containing breaches and preventing lateral movement.',
          },
          {
            id: 'opt-sub2',
            textAr: 'لتوفير ثمن كابلات الشبكة',
            textEn: 'To save money on physical network cables',
            isCorrect: false,
            explanationAr: 'غير صحيح. العزل قد يتطلب أجهزة شبكة إضافية لكنه ضروري للأمان.',
            explanationEn: 'Incorrect. Segmentation actually requires additional network infrastructure but is critical for defense.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-04-firewall-rules',
      takeawayAr: 'رائع جدًا! بعد أن عرفت كيف تنتقل البيانات، سنتعلم في الدرس الرابع كيف يراقب جدار الحماية هذه الحزم ويمنع غير المصرح منها.',
      takeawayEn: 'Excellent! Now that you know how data flows, learn how firewalls inspect packets and block threats in Lesson 4.',
    },
  },

  'lesson-04-firewall-rules': {
    id: 'lesson-04-firewall-rules',
    milestoneId: 3,
    order: 4,
    titleAr: 'الدرس الرابع: جدران الحماية الرقمية وقواعد الفحص (Firewall ACL)',
    titleEn: 'Lesson 4: Digital Firewalls & Access Control Rules',
    whyItMattersAr: 'جدار الحماية هو الحارس الواقف على باب قلعتك الرقمية؛ يحدد من يدخل ومن يُطرد فورًا.',
    whyItMattersEn: 'The firewall is the vigilant guard at the gate of your digital fortress, deciding who enters and who gets turned away.',
    estimatedMinutes: 15,
    simulationId: 'firewall',
    worldId: 4,
    challengeId: 'firewall-rule-mastery',
    prerequisites: [
      {
        textAr: 'إكمال الدرس 3: الشبكات وتوجيه الحزم.',
        textEn: 'Completion of Lesson 3: Network Fundamentals & Packet Routing.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: تأمين خادم ويب (Web Server Hardening)',
      titleEn: 'Worked Example: Securing a Public Web Server',
      scenarioAr: 'خادم ويب يحتاج لاستقبال زوار الإنترنت بأمان مع حجب محاولات الاختراق:',
      scenarioEn: 'A web server must serve public visitors safely while blocking brute-force attempts:',
      stepsAr: [
        'الخطوة 1: السماح (Allow) للمنفذ 443 (HTTPS) من أي مصدر للوصول للخدمات المشفرة.',
        'الخطوة 2: السماح (Allow) للمنفذ 22 (SSH) فقط من عنوان IP الإدارة الخاص بالشركة.',
        'الخطوة 3: المنع الافتراضي (Deny All) لأي حركة مرور أخرى لم تُذكر صراحة.',
        'الخطوة 4: تفعيل تفتيش الحزم (Stateful Inspection) لضمان أن الردود تطابق الطلبات المشروعة.',
      ],
      stepsEn: [
        'Step 1: Permit (Allow) port 443 (HTTPS) from any source for encrypted web traffic.',
        'Step 2: Permit (Allow) port 22 (SSH) strictly from the secure Corporate Management IP.',
        'Step 3: Implement "Default Deny" for any traffic not explicitly authorized above.',
        'Step 4: Enable Stateful Packet Inspection to correlate inbound replies with legitimate outbound requests.',
      ],
      takeawayAr: 'فتح الأبواب الضرورية فقط يقلص مساحة الهجوم بشكل جذري.',
      takeawayEn: 'Opening only essential ports drastically reduces the available attack surface.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: عزل منطقة DMZ ومنع التسلل',
      titleEn: 'Independent Challenge: DMZ Isolation & Infiltration Defense',
      scenarioAr: 'قم بضبط قواعد الجدار الناري لعزل منطقة الخوادم العامة (DMZ) عن الشبكة الداخلية الحساسة:',
      scenarioEn: 'Configure firewall rules to isolate the public-facing DMZ from the sensitive internal corporate network:',
      targetOutcomeAr: 'نجاح عمل الموقع مع منع أي اتصال مباشر من خادم الويب إلى قاعدة بيانات الشركة الداخلية.',
      targetOutcomeEn: 'Web services remain functional while direct connectivity from the DMZ to the internal database is blocked.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن وجود جدار حماية يعني أن النظام أصبح منيعاً تماماً.',
      commonMisconceptionEn: 'Thinking that having a firewall makes a system invincible.',
      guidanceAr: 'جدار الحماية يحمي المنافذ، لكنه لا يمنع الثغرات البرمجية في التطبيقات المسموح لها بالمرور (مثل ثغرات الويب).',
      guidanceEn: 'Firewalls guard ports but cannot stop logic exploits within permitted application traffic (e.g. SQL injection via HTTPS).',
    },
    keyTakeaways: [
      {
        textAr: 'جدار الحماية هو خط الدفاع الأول بين الشبكات الموثوقة وغير الموثوقة.',
        textEn: 'The firewall is the primary boundary between trusted and untrusted network zones.',
      },
      {
        textAr: 'المنع الافتراضي (Default Deny) هو أفضل ممارسة أمنية لإدارة القواعد.',
        textEn: 'Default Deny is the security gold standard for firewall policy management.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم مفهوم أرقام المنافذ (Ports) مثل منفذ 80 و443 و22.',
        textEn: 'Understand network port numbers like port 80 (HTTP), 443 (HTTPS), and 22 (SSH).',
      },
      {
        textAr: 'تعلم كتابة وتطبيق قواعد السماح والمنع (Allow & Block ACL Rules).',
        textEn: 'Learn how to configure packet filtering Access Control List (ACL) rules.',
      },
    ],
    concept: {
      textAr: `إذا كان عنوان IP هو عنوان المبنى، فإن رقم المنفذ (Port Number) هو رقم الغرفة المحددة داخل ذلك المبنى!
مثال:
• المنفذ 80: غرفة تصفح الويب غير المشفر (HTTP).
• المنفذ 443: غرفة تصفح الويب المشفر (HTTPS).
• المنفذ 22: غرفة الإدارة عن بعد (SSH).
جدار الحماية (Firewall) يفحص كل حزمة قادمة ويسأل: من أي IP؟ وإلى أي منفذ؟ وهل توجد قاعدة تسمح لها بالدخول؟`,
      textEn: `If an IP address is a building street address, the port number is the specific room or apartment number!
For example:
• Port 80: Unencrypted web browsing (HTTP).
• Port 443: Encrypted web browsing (HTTPS).
• Port 22: Remote command-line administration (SSH).
A firewall inspects every incoming packet: Which IP sent it? Which port is it targeting? Is there an approved rule?`,
      analogyAr: `مثل موظف الأمن في المطار:
يفحص تذكرتك وجوازك؛ إذا كنت تملك تذكرة رحلة مصرحة يسمح لك بالمرور، وإذا حاولت الدخول لمنطقة الصيانة المحظورة (مثل منفذ غير مصرح به) يمنعك فورًا.`,
      analogyEn: `Like airport security:
The officer inspects your ticket and boarding pass; if you have a valid pass you proceed, but if you try entering a restricted maintenance bay (an unapproved port) you are stopped on the spot.`,
      keyTerms: [
        {
          termAr: 'رقم المنفذ (Port Number)',
          termEn: 'Port Number',
          definitionAr: 'رقم بين 0 و65535 يحدد الخدمة أو التطبيق المستهدف داخل الجهاز.',
          definitionEn: 'A 16-bit number (0-65535) identifying a specific service or application protocol on a host.',
        },
        {
          termAr: 'قائمة التحكم بالوصول (ACL)',
          termEn: 'Access Control List (ACL)',
          definitionAr: 'جدول قواعد مرتب في جدار الحماية، يحدد الحزم المسموح بها والمحظورة.',
          definitionEn: 'An ordered list of firewall rules specifying match criteria and actions (Permit or Deny).',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'شاهد قائمة القواعد المرتبة، ومؤشر مرور الحزم الشرعية مقابل حزم الاختراق المحظورة.',
      whatToLookForEn: 'Observe the ordered ruleset and see legitimate web packets passing through while malicious probes get dropped.',
      initialStateAr: 'عند تفعيل قاعدة المنع الافتراضي (Default Deny)، تُسقط أي حزمة لا تنطبق عليها قاعدة سماح صريحة.',
      initialStateEn: 'Under Default Deny, any packet without an explicit allow rule is immediately dropped.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح محاكي جدار الحماية وقواعد ACL.',
        'أنشئ قاعدة تسمح بمرور حركة المرور على المنفذ 443 (HTTPS) لخادم الويب.',
        'أضف قاعدة تمنع محاولات الاتصال بمنفذ إدارة الشبكة القديم Telnet (منفذ 23).',
        'شاهد الحزم وهي تفحص لحظيًا، وتأكد من إسقاط حزم التهديد الخارجية.',
      ],
      instructionsEn: [
        'Open the Firewall ACL & DMZ simulation.',
        'Create a rule permitting inbound traffic on port 443 (HTTPS) for the web server.',
        'Add a deny rule blocking unencrypted legacy Telnet probes (port 23).',
        'Observe live packet inspection and verify threat probes are dropped.',
      ],
      whyWeDoThisAr: 'تطبيق مبدأ تقليص مساحة الهجوم؛ نفتح فقط الأبواب الضرورية للعمل ونغلق كل ما عداها.',
      whyWeDoThisEn: 'Attack surface reduction: We open only essential business ports and close everything else.',
      hintsAr: [
        'القواعد تطبق من الأعلى إلى الأسفل؛ القاعدة الأولى المطابقة هي التي تنفذ.',
      ],
      hintsEn: [
        'Firewall rules evaluate from top to bottom; the first matching rule triggers.',
      ],
      validationCriterionAr: 'السماح بمرور HTTPS وحظر المنافذ غير المشفرة بنجاح.',
      validationCriterionEn: 'HTTPS permitted and unencrypted ports successfully blocked.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'سمح جدار الحماية للمستخدمين الشرعيين بتصفح الموقع عبر 443، وتصدى لمحاولات فحص المنافذ المشبوهة على منفذ 23.',
      whatHappenedEn: 'The firewall permitted legitimate web traffic via port 443 while dropping reconnaissance scans targeting port 23.',
      securitySignificanceAr: 'إغلاق المنافذ الزائدة هو أحد أقوى إجراءات الدفاع الأساسية لمنع استغلال الثغرات غير المعروفة.',
      securitySignificanceEn: 'Closing unused ports is one of the most effective baseline defenses, preemptively blunting unknown vulnerability exploits.',
    },
    knowledgeCheck: [
      {
        id: 'q1-default-deny',
        questionAr: 'ماذا يعني مصطلح "المنع الافتراضي" (Default Deny) في جدران الحماية؟',
        questionEn: 'What does "Default Deny" signify in firewall security policy?',
        options: [
          {
            id: 'opt-dd1',
            textAr: 'منع كل حركة مرور بالكامل ما لم تكن هناك قاعدة صريحة ومحددة تسمح بها',
            textEn: 'Block all incoming and outgoing traffic unless an explicit rule explicitly permits it',
            isCorrect: true,
            explanationAr: 'إجابة صحيحة ومحترفة! هذا هو المبدأ الأمني الذهبي: لا تثق بأحد افتراضيًا، وافتح فقط ما تم التصريح به.',
            explanationEn: 'Correct and professional! The golden security principle: trust nothing by default and permit only verified exceptions.',
          },
          {
            id: 'opt-dd2',
            textAr: 'السماح للجميع بالدخول ثم حذف الملفات لاحقًا',
            textEn: 'Permit everyone in and delete files later',
            isCorrect: false,
            explanationAr: 'غير صحيح؛ هذا يعرض النظام للاختراق الفوري.',
            explanationEn: 'Incorrect; permitting unrestricted access invites instant system compromise.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-05-cryptography',
      takeawayAr: 'ممتاز! عرفت كيف نحمي أبواب الشبكة. لكن ماذا عن البيانات نفسها عندما تعبر الإنترنت؟ سنتعلم التشفير في الدرس الخامس.',
      takeawayEn: 'Awesome! You learned how to guard network gates. Now learn how cryptography protects data in transit in Lesson 5.',
    },
  },

  'lesson-05-cryptography': {
    id: 'lesson-05-cryptography',
    milestoneId: 4,
    order: 5,
    titleAr: 'الدرس الخامس: مقدمة إلى التشفير ودوال التجزئة (SHA-256)',
    titleEn: 'Lesson 5: Cryptography & Cryptographic Hash Functions',
    whyItMattersAr: 'التشفير هو الدرع الرياضي الذي يجعل التجارة الإلكترونية والمصارف والتواصل الآمن ممكنة عبر الإنترنت.',
    whyItMattersEn: 'Cryptography is the mathematical shield that makes e-commerce, banking, and private communication possible online.',
    estimatedMinutes: 15,
    simulationId: 'crypto',
    worldId: 5,
    challengeId: 'crypto-avalanche-challenge',
    prerequisites: [
      {
        textAr: 'إكمال الدرس 4: جدران الحماية وقواعد الفحص.',
        textEn: 'Completion of Lesson 4: Digital Firewalls & Access Control Rules.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: التحقق من سلامة تحميل البرمجيات (Software Integrity)',
      titleEn: 'Worked Example: Validating Software Download Integrity',
      scenarioAr: 'تحميل ملف تحديث أمني لنظام التشغيل والتأكد من أنه لم يُعدل من قبل مخترق أثناء النقل:',
      scenarioEn: 'Downloading a critical security patch and verifying it was not tampered with during transit:',
      stepsAr: [
        'الخطوة 1: تنشر الشركة المصنعة بصمة SHA-256 الرسمية للملف على موقعها الآمن.',
        'الخطوة 2: يقوم المستخدم بتحميل الملف على جهازه الخاص.',
        'الخطوة 3: يشغل المستخدم أداة تجزئة (Hasher) على الملف المحمل لتوليد بصمة محلية.',
        'الخطوة 4: إذا تطابقت البصمة المحلية مع البصمة الرسمية حرفاً بحرف، يكون الملف سليماً 100%.',
      ],
      stepsEn: [
        'Step 1: The vendor publishes the official SHA-256 checksum for the update file on their secure site.',
        'Step 2: The user downloads the update file to their local workstation.',
        'Step 3: The user runs a local hashing utility on the downloaded file to compute a digest.',
        'Step 4: If the local hash matches the official vendor hash exactly, file integrity is guaranteed.',
      ],
      takeawayAr: 'دوال التجزئة هي "شمع الختم" الرقمي الذي يضمن سلامة البيانات.',
      takeawayEn: 'Hashing functions act as the digital "wax seal" for data integrity verification.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: اكتشاف التعديل الخفي في السجلات',
      titleEn: 'Independent Challenge: Detecting Stealthy Log Tampering',
      scenarioAr: 'مخترق قام بتعديل سطر واحد في ملف سجلات الأمان لإخفاء أثره. استخدم البصمات السابقة للكشف عن التعديل:',
      scenarioEn: 'An intruder modified a single line in a security log to hide their tracks. Use checksum history to detect the fraud:',
      targetOutcomeAr: 'تحديد السطر المعدل بدقة وإثبات فشل البصمة (Checksum Failure).',
      targetOutcomeEn: 'Precisely identify the tampered line and validate the checksum mismatch.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن دالة التجزئة (Hash) يمكن فكها لاسترجاع النص الأصلي.',
      commonMisconceptionEn: 'Thinking a hash can be "decrypted" to recover the original plaintext.',
      guidanceAr: 'التجزئة عملية اتجاه واحد رياضياً؛ لا يوجد "مفتاح" لفك الخلاط واسترجاع الفاكهة الأصلية.',
      guidanceEn: 'Hashing is mathematically a one-way process; there is no "key" to reverse the digest back into input data.',
    },
    keyTakeaways: [
      {
        textAr: 'التشفير يحمي السرية (Confidentiality)، بينما التجزئة تحمي السلامة (Integrity).',
        textEn: 'Encryption secures Confidentiality, while Hashing secures Integrity.',
      },
      {
        textAr: 'تأثير الانهيار الجليدي يضمن أن أي تغيير طفيف في البيانات يتم اكتشافه فوراً.',
        textEn: 'The Avalanche Effect ensures that even a tiny data modification is immediately detectable.',
      },
    ],
    objectives: [
      {
        textAr: 'التمييز الجوهري بين التشفير (ذو اتجاهين بمفتاح) والتجزئة (اتجاه واحد بدون استرجاع).',
        textEn: 'Distinguish between encryption (two-way with key) and cryptographic hashing (one-way digest).',
      },
      {
        textAr: 'فهم وتجربة تأثير الانهيار الجليدي (Avalanche Effect) في دالة SHA-256.',
        textEn: 'Understand and experience the Avalanche Effect in SHA-256 hashing.',
      },
    ],
    concept: {
      textAr: `في الأمن السيبراني نستخدم آليتين رياضيتين مختلفتين:
1. التشفير (Encryption): مثل القفل والمفتاح؛ تقفل الرسالة وترسلها، ويستخدم المستلم المفتاح لفتحها وقراءتها.
2. التجزئة (Hashing): مثل خلاط العصير؛ تضع فيه ملفًا فيخرج لك "بصمة رقمية" ثابتة الطول (مثل 64 حرفًا في SHA-256). يستحيل إعادة العصير إلى فاكهة!
من ميزات التجزئة أن تغيير حرف واحد في النص الأصلي يغير البصمة بالكامل؛ وهذا ما يسمى "تأثير الانهيار الجليدي".`,
      textEn: `Cybersecurity relies on two distinct mathematical tools:
1. Encryption: Like a lock and key; you lock a message, send it, and the recipient uses their key to unlock and read it.
2. Hashing: Like a blender; you feed in a document and it computes a fixed-length digital fingerprint (e.g. 64 characters in SHA-256). You can never unblend the smoothie back into fruit!
A key property is the Avalanche Effect: changing a single letter scrambles the resulting hash completely.`,
      analogyAr: `بصمة الإصبع:
بصمة إصبعك تدل على هويتك بدقة، لكن لا أحد يستطيع أخذ رسمة البصمة وصناعة إنسان كامل منها. وبالمثل، بصمة SHA-256 تثبت سلامة الملف دون أن تكشف محتواه.`,
      analogyEn: `A human fingerprint:
Your fingerprint uniquely proves your identity, but nobody can take a fingerprint printout and reconstruct a living human body. Similarly, a SHA-256 hash proves file integrity without revealing raw contents.`,
      keyTerms: [
        {
          termAr: 'دالة التجزئة (Hash Function)',
          termEn: 'Cryptographic Hash Function',
          definitionAr: 'خوارزمية تحول أي حجم من البيانات إلى بصمة رقمية بطول ثابت في اتجاه واحد لا يمكن عكسه.',
          definitionEn: 'An algorithm converting arbitrary-length input into a unique fixed-length digest in a strictly one-way direction.',
        },
        {
          termAr: 'تأثير الانهيار الجليدي (Avalanche Effect)',
          termEn: 'Avalanche Effect',
          definitionAr: 'خاصية تشفيرية تعني أن أي تغيير طفيف في المدخلات يغير أكثر من نصف البصمة الناتجة جذريًا.',
          definitionEn: 'The property where a single-bit flip in plaintext radically scrambles over 50% of the output hash digest.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'اكتب نصًا في صندوق الإدخال وراقب كيف تولد دالة SHA-256 بصمة فورية بطول 256 بت.',
      whatToLookForEn: 'Type text into the input box and observe SHA-256 calculating a 256-bit hexadecimal digest instantly.',
      initialStateAr: 'غيّر حرفًا واحدًا فقط (مثل تحويل علامة النقطة إلى علامة تعجب) وشاهد كيف تتبدل الحروف الـ 64 تمامًا.',
      initialStateEn: 'Modify a single character (e.g. change a dot to an exclamation point) and watch all 64 hex characters transform.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح محاكي دوال التجزئة والتشفير.',
        'اكتب عبارة "SecretPassword" في حقل النص.',
        'سجل أول 6 رموز من البصمة الناتجة.',
        'غيّر الحرف الأخير إلى رقم "1" لتصبح "SecretPassword1".',
        'لاحظ كيف تغيرت البصمة بالكامل وتأكد من عمل تأثير الانهيار الجليدي.',
      ],
      instructionsEn: [
        'Open the Hashing & Avalanche simulation.',
        'Type "SecretPassword" in the input field.',
        'Note the first 6 characters of the resulting hash.',
        'Change the last character to a digit "1" ("SecretPassword1").',
        'Observe how the entire digest transforms completely, confirming the Avalanche Effect.',
      ],
      whyWeDoThisAr: 'فهم كيف تخزن المواقع كلمات المرور كبصمات مجزأة حتى لا تُكشف حتى لو سُرقت قاعدة البيانات.',
      whyWeDoThisEn: 'Understanding why websites store password hashes instead of raw passwords to protect accounts during database leaks.',
      hintsAr: [
        'جرب مقارنة نصين طويلين لمعرفة كيف تكشف التجزئة أي تعديل مخفي.',
      ],
      hintsEn: [
        'Compare two long texts to see how hashes expose even microscopic edits.',
      ],
      validationCriterionAr: 'تجربة تأثير الانهيار الجليدي وملاحظة التغير الجذري للبصمة.',
      validationCriterionEn: 'Avalanche effect triggered and verified in the simulation.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تغيير حرف واحد أدى لخلخلة جميع مراحل الخوارزمية الرياضية، فنتجت بصمة جديدة يستحيل تخمين النص الأصلي منها.',
      whatHappenedEn: 'Flipping a single character propagated through all internal mathematical rounds, producing an unpredictable new digest.',
      securitySignificanceAr: 'هذا ما يمنحنا الثقة في تنزيل البرامج؛ فإذا تطابقت بصمة الملف المحمل مع بصمة الموقع الرسمي، نتأكد أن الملف سليم ولم يلوثه برمجية خبيثة.',
      securitySignificanceEn: 'This gives us confidence when downloading software: if the downloaded hash matches the vendor hash, the binary is untampered.',
    },
    knowledgeCheck: [
      {
        id: 'q1-hash-reverse',
        questionAr: 'إذا حصل مهاجم على بصمة SHA-256 لكلمة مرور، هل يستطيع تطبيق معادلة رياضية عكسية لاستخراج كلمة المرور الأصلية مباشرة؟',
        questionEn: 'If an attacker obtains a SHA-256 hash of a password, can they mathematically reverse it directly into the original text?',
        options: [
          {
            id: 'opt-rev1',
            textAr: 'لا، دوال التجزئة أحادية الاتجاه (One-Way) رياضياً ولا يمكن عكسها',
            textEn: 'No, cryptographic hash functions are mathematically one-way and cannot be reversed',
            isCorrect: true,
            explanationAr: 'صحيح تمامًا! التجزئة مصممة هندسيًا لتكون في اتجاه واحد فقط؛ الطريقة الوحيدة لتخمينها هي تجربة كلمات مرور ومقارنة بصماتها.',
            explanationEn: 'Exactly right! Hashing is mathematically one-way; attackers can only attempt brute-force dictionary matching.',
          },
          {
            id: 'opt-rev2',
            textAr: 'نعم، بزر فك التجزئة في أي متصفح',
            textEn: 'Yes, using an unhash button in any browser',
            isCorrect: false,
            explanationAr: 'غير صحيح. لا يوجد زر أو دالة رياضية لفك التجزئة.',
            explanationEn: 'Incorrect. There is no mathematical inverse operation for secure hashing.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-06-active-directory',
      takeawayAr: 'رائع جدًا! الآن فهمت التشفير والبصمات الرقمية. في الدرس السادس، سنتعلم كيف تُستخدم هذه المفاهيم في مصادقة المستخدمين في Active Directory.',
      takeawayEn: 'Outstanding! You now understand cryptographic foundations. In Lesson 6, discover how enterprise identity uses them in Active Directory.',
    },
  },

  'lesson-06-active-directory': {
    id: 'lesson-06-active-directory',
    milestoneId: 5,
    order: 6,
    titleAr: 'الدرس السادس: إدارة الهويات والمصادقة في المؤسسات (Active Directory & Kerberos)',
    titleEn: 'Lesson 6: Enterprise Identity, Active Directory & Kerberos',
    whyItMattersAr: 'في الشركات الكبرى، لا ننشئ حسابًا يدويًا في كل جهاز؛ بل تدير الهوية المركزية آلاف الموظفين وتحدد صلاحياتهم بدقة.',
    whyItMattersEn: 'In large enterprises, you do not configure individual user accounts on each PC; central identity governs thousands of employees with least privilege.',
    estimatedMinutes: 15,
    simulationId: 'active_directory',
    worldId: 6,
    challengeId: 'kerberos-ticket-challenge',
    prerequisites: [
      {
        textAr: 'إكمال الدرس 5: مقدمة إلى التشفير ودوال التجزئة.',
        textEn: 'Completion of Lesson 5: Cryptography & Hash Functions.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: تتبع مصادقة المستخدم عبر Kerberos',
      titleEn: 'Worked Example: Tracing a Kerberos Authentication Flow',
      scenarioAr: 'موظف في قسم المالية يحاول الوصول لمجلد الرواتب المحمي على خادم الملفات:',
      scenarioEn: 'A finance employee attempts to access the restricted payroll share on a file server:',
      stepsAr: [
        'الخطوة 1: يطلب الموظف تذكرة دخول (AS_REQ) من خادم النطاق (DC).',
        'الخطوة 2: يرسل الخادم تذكرة TGT مشفرة (AS_REP) بعد التحقق من الهوية.',
        'الخطوة 3: يطلب الموظف تذكرة خدمة (TGS_REQ) للوصول لخادم الملفات FILE01.',
        'الخطوة 4: يقدم الموظف تذكرة الخدمة لـ FILE01، فيفتح الخادم المجلد فوراً دون طلب كلمة مرور جديدة.',
      ],
      stepsEn: [
        'Step 1: User requests an Authentication Ticket (AS_REQ) from the Domain Controller.',
        'Step 2: DC verifies identity and issues an encrypted TGT (AS_REP).',
        'Step 3: User presents TGT to request a Service Ticket (TGS_REQ) for FILE01.',
        'Step 4: User presents Service Ticket to FILE01; the server grants access instantly without re-prompting for credentials.',
      ],
      takeawayAr: 'كيربيروس يتيح الدخول الموحد (SSO) ويحمي كلمات المرور من التنصت.',
      takeawayEn: 'Kerberos enables Single Sign-On (SSO) while preventing password transmission over the network.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: كشف محاولة انتحال الهوية (Pass-the-Ticket)',
      titleEn: 'Independent Challenge: Detecting Pass-the-Ticket (PtT) Attacks',
      scenarioAr: 'مهاجم حصل على تذكرة TGT لمستخدم آخر. حاول استخدام التذكرة للوصول لمجلدات حساسة دون معرفة كلمة المرور:',
      scenarioEn: 'An adversary hijacked a TGT from another user. Attempt to use that ticket to access sensitive shares without knowing the password:',
      targetOutcomeAr: 'اكتشاف التناقض في بصمة التذكرة وحظر الوصول غير المصرح به.',
      targetOutcomeEn: 'Detect ticket signature anomalies and block the unauthorized session.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن Active Directory هو مجرد قائمة بأسماء الموظفين.',
      commonMisconceptionEn: 'Thinking Active Directory is just a static staff directory.',
      guidanceAr: 'AD هو محرك أمان حي يدير السياسات (Group Policy) والمصادقة والترخيص لكل كائن في الشبكة.',
      guidanceEn: 'AD is a dynamic security engine governing Group Policies, authentication, and authorization for every network object.',
    },
    keyTakeaways: [
      {
        textAr: 'متحكم النطاق هو "مصدر الثقة" (Source of Truth) في الشبكات المؤسسية.',
        textEn: 'The Domain Controller is the centralized "Source of Truth" for corporate networks.',
      },
      {
        textAr: 'تذاكر كيربيروس لها عمر زمني محدد (Time-to-Live) لمنع إعادة استخدامها للأبد.',
        textEn: 'Kerberos tickets have a finite TTL to prevent indefinite session hijacking.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم دور خادم النطاق (Domain Controller) في إدارة هويات الموظفين.',
        textEn: 'Understand the role of Domain Controllers (DC) in enterprise identity.',
      },
      {
        textAr: 'معرفة كيف تعمل تذاكر Kerberos للوصول إلى الملفات دون إرسال كلمة المرور عبر الشبكة.',
        textEn: 'Learn how Kerberos tickets grant resource access without sending cleartext passwords over the wire.',
      },
    ],
    concept: {
      textAr: `في بيئة الشركات (Enterprise)، يعمل نظام Active Directory كدليل مركزي لكل الحسابات والأجهزة.
عندما يسجل الموظف دخوله إلى جهازه:
1. يتواصل الجهاز مع خادم النطاق (Domain Controller - DC01).
2. يتحقق الخادم من كلمة المرور دون حفظها كنص مكشوف.
3. يصدر بروتوكول Kerberos تذكرة رقمية تسمى (TGT).
4. عندما يريد الموظف فتح مجلد مشترك (مثل \\FILE01\\Finance)، يقدم التذكرة ليحصل على تصريح وصول مشفر.`,
      textEn: `In corporate environments, Active Directory serves as the central directory for all users, computers, and permissions.
When an employee logs in:
1. The PC communicates with the Domain Controller (DC01).
2. The DC verifies credentials securely without storing or sending plaintext passwords.
3. Kerberos issues a digital Ticket Granting Ticket (TGT).
4. When the user accesses an internal file share (\\FILE01\\Finance), they present the ticket for service-specific authorization.`,
      analogyAr: `تذكرة الملاهي الترفيهية:
تشتري تذكرة الدخول العامة عند البوابة الرئيسية (هذه هي TGT)، ثم كلما أردت ركوب لعبة محددة، تري المشرف تذكرتك ليطبع لك تصريح الركوب لتلك اللعبة (تذكرة الخدمة TGS)، دون أن تسدد ماله من جديد عند كل لعبة!`,
      analogyEn: `An amusement park ticket:
You purchase a master wristband at the front gate (your TGT). Then, whenever you want to ride a specific roller coaster, you show your wristband to receive an individual ride pass (TGS ticket) without paying from scratch each time!`,
      keyTerms: [
        {
          termAr: 'متحكم النطاق (Domain Controller - DC)',
          termEn: 'Domain Controller (DC)',
          definitionAr: 'الخادم المركزي الذي يدير قاعدة بيانات هويات المستخدمين وصلاحياتهم في المؤسسة.',
          definitionEn: 'The central server managing the Active Directory database, authentication, and group policies.',
        },
        {
          termAr: 'بروتوكول كيربيروس (Kerberos)',
          termEn: 'Kerberos Protocol',
          definitionAr: 'بروتوكول المصادقة الافتراضي المعتمد على التذاكر الرقمية المشفرة بدلاً من إرسال كلمات المرور.',
          definitionEn: 'The industry-standard ticket-based authentication protocol designed to verify identity securely across open networks.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'شاهد المستخدمين والمجموعات في شجرة النطاق (Finance Users, HR Users, Admins).',
      whatToLookForEn: 'Explore the domain organizational units (OUs), user accounts, and Kerberos ticket cache.',
      initialStateAr: 'عند تسجيل الدخول باسم Sara، يصدر لها تذكرة TGT صالحة تمكنها من فتح مجلد المالية المشترك.',
      initialStateEn: 'Logging in as Sara issues a valid TGT enabling her to access authorized finance network shares.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح محاكي Active Directory وKerberos.',
        'سجل الدخول بحساب المستخدم Sara من قسم المالية.',
        'راقب إصدار تذكرة كيربيروس TGT في لوحة فحص التذاكر.',
        'اطلب الوصول إلى مشاركة الملفات المشتركة \\FILE01\\Finance.',
        'لاحظ كيف يتم التحقق من عضويتها في مجموعة المالية ويُمنح الوصول بنجاح.',
      ],
      instructionsEn: [
        'Open the Active Directory & Kerberos simulation.',
        'Authenticate as domain user Sara (Finance Department).',
        'Observe the issuance of the Kerberos TGT in the ticket inspector.',
        'Attempt to connect to the network file share \\FILE01\\Finance.',
        'Watch NTFS DACL permissions verify her group membership and grant authorized access.',
      ],
      whyWeDoThisAr: 'تطبيق مبدأ الصلاحيات الأقل (Least Privilege)؛ فكل موظف يصل فقط للملفات الضرورية لعمله.',
      whyWeDoThisEn: 'Enforcing the Principle of Least Privilege: ensuring users only access shares required for their official duties.',
      hintsAr: [
        'جرب لاحقًا الدخول بحساب موظف من قسم الموارد البشرية وشاهد كيف يُرفض وصوله لمجلد المالية (Access Denied).',
      ],
      hintsEn: [
        'Try logging in with an HR account to confirm access to finance data is denied.',
      ],
      validationCriterionAr: 'إصدار تذكرة Kerberos والوصول بنجاح للمجلد المصرح به.',
      validationCriterionEn: 'Kerberos ticket issued and authorized file share accessed.',
      checkType: 'guided_confirmation',
    },
    resultExplanation: {
      whatHappenedAr: 'تأكد خادم النطاق من هوية سارة وأصدر تذكرة خدمة مشفرة، فسمح لها خادم الملفات بالقراءة والتعديل وفق صلاحياتها.',
      whatHappenedEn: 'The DC verified Sara’s identity and granted a service ticket; the file server inspected the token and permitted authorized read/write access.',
      securitySignificanceAr: 'إدارة الهوية المركزية تتيح للشركات إيقاف حساب أي موظف فور استقالته بضغطة زر واحدة لمنع أي تسريب مستقبلي.',
      securitySignificanceEn: 'Centralized identity allows organizations to instantly revoke departing employee access across the enterprise with a single action.',
    },
    knowledgeCheck: [
      {
        id: 'q1-least-privilege',
        questionAr: 'ماذا يسمى المبدأ الأمني الذي يقضي بمنح المستخدم فقط أقل قدر من الصلاحيات يحتاجه لإتمام عمله؟',
        questionEn: 'Which security principle dictates granting users only the minimum access necessary to perform their jobs?',
        options: [
          {
            id: 'opt-lp1',
            textAr: 'مبدأ الصلاحيات الأقل (Principle of Least Privilege)',
            textEn: 'Principle of Least Privilege (PoLP)',
            isCorrect: true,
            explanationAr: 'إجابة صحيحة 100%! منح الجميع صلاحيات مدير (Admin) هو أكبر أسباب الكوارث الأمنية في المؤسسات.',
            explanationEn: '100% correct! Granting excessive administrator rights is one of the leading causes of enterprise breaches.',
          },
          {
            id: 'opt-lp2',
            textAr: 'مبدأ الثقة المفرطة',
            textEn: 'Over-trust Principle',
            isCorrect: false,
            explanationAr: 'غير صحيح. الثقة المفرطة تناقض كل مفاهيم الأمن السيبراني.',
            explanationEn: 'Incorrect. Blind trust is the antithesis of modern cybersecurity architecture.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-07-soc-monitoring',
      takeawayAr: 'رائع! تعرفت على إدارة الهويات. والآن، كيف نراقب ما يفعله المستخدمون وما يطرأ على الشبكة من أحداث؟ الدرس السابع سيأخذك لمركز العمليات SOC.',
      takeawayEn: 'Superb! You now understand enterprise identity. Next, explore how defenders monitor system logs and alerts in a Security Operations Center (SOC).',
    },
  },

  'lesson-07-soc-monitoring': {
    id: 'lesson-07-soc-monitoring',
    milestoneId: 6,
    order: 7,
    titleAr: 'الدرس السابع: مركز العمليات الأمنية (SOC) وقراءة السجلات',
    titleEn: 'Lesson 7: SOC Operations & Security Log Monitoring',
    whyItMattersAr: 'الأنظمة تسجل كل شيء؛ ومهمة محلل الأمان هي العثور على الإبرة في كومة القش لاكتشاف الاختراق قبل فوات الأوان.',
    whyItMattersEn: 'Every digital event generates a log; a SOC analyst’s job is finding the needle in the haystack before an intrusion turns catastrophic.',
    estimatedMinutes: 18,
    simulationId: 'soc',
    worldId: 7,
    challengeId: 'brute-force-triage-challenge',
    prerequisites: [
      {
        textAr: 'إكمال الدرس 6: إدارة الهويات وActive Directory.',
        textEn: 'Completion of Lesson 6: Enterprise Identity & Active Directory.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: تحليل سجلات تسجيل دخول فاشلة (Brute-Force)',
      titleEn: 'Worked Example: Triage of Brute-Force Authentication Logs',
      scenarioAr: 'ملاحظة 50 محاولة تسجيل دخول فاشلة للمستخدم Admin خلال دقيقة واحدة من عنوان IP خارجي:',
      scenarioEn: 'Observing 50 failed login attempts for user "Admin" within 60 seconds from an unknown external IP:',
      stepsAr: [
        'الخطوة 1: يطلق نظام SIEM تنبيهاً عالي الخطورة لتكرار الفشل.',
        'الخطوة 2: يقوم محلل SOC بفحص تفاصيل السجلات وتحديد عنوان IP المصدر.',
        'الخطوة 3: التحقق مما إذا كان هناك نجاح لاحق (Success after Failure) مما يشير لاختراق محتمل.',
        'الخطوة 4: حظر عنوان IP المهاجم في جدار الحماية فوراً وتصفير كلمة مرور الحساب المستهدف.',
      ],
      stepsEn: [
        'Step 1: SIEM platform triggers a high-severity alert for "Multiple Login Failures".',
        'Step 2: SOC Analyst inspects event log details to isolate the offending Source IP.',
        'Step 3: Analyst checks for a subsequent successful login, which would indicate a confirmed breach.',
        'Step 4: Block the Source IP at the perimeter firewall and force a password reset for the target account.',
      ],
      takeawayAr: 'المراقبة المستمرة تحول دون نجاح الهجمات حتى لو عرف المهاجم اسم المستخدم.',
      takeawayEn: 'Continuous monitoring prevents attack success even when the adversary has valid usernames.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: مراقبة محاولات تصعيد الصلاحيات',
      titleEn: 'Independent Challenge: Monitoring Privilege Escalation Attempts',
      scenarioAr: 'مستخدم عادي يحاول تنفيذ أوامر إدارية (Sudo/Admin) بشكل متكرر. حلل السجلات وكافح التهديد:',
      scenarioEn: 'A regular user account is repeatedly attempting to execute administrative commands. Analyze logs and neutralize:',
      targetOutcomeAr: 'تحديد الحساب المشبوه، وإثبات محاولة التصعيد، وإصدار أمر تعليق الحساب.',
      targetOutcomeEn: 'Identify the suspicious account, validate the escalation attempt, and issue a suspension order.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن وجود السجلات (Logs) يكفي دون الحاجة لنظام تنبيه (SIEM).',
      commonMisconceptionEn: 'Thinking that simply having logs is enough without an active alerting system (SIEM).',
      guidanceAr: 'السجلات صامتة بطبعها؛ نحتاج لـ SIEM لربط الأحداث (Correlation) وإطلاق جرس الإنذار عند وقوع خطر.',
      guidanceEn: 'Raw logs are silent; SIEM is required to correlate disparate events and sound the alarm when patterns emerge.',
    },
    keyTakeaways: [
      {
        textAr: 'مركز العمليات SOC هو "برج المراقبة" الذي لا ينام في المؤسسة.',
        textEn: 'The SOC acts as the 24/7 "Watchtower" for the enterprise infrastructure.',
      },
      {
        textAr: 'ربط الأحداث (Correlation) هو ما يميز محلل SOC المحترف عن مراقب السجلات العادي.',
        textEn: 'Event correlation distinguishes a professional SOC analyst from a basic log viewer.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم السجلات الأمنية (Security Event Logs) وكيف تُجمع في نظام SIEM.',
        textEn: 'Understand Security Event Logs and how they are aggregated into a SIEM platform.',
      },
      {
        textAr: 'تحليل إنذار هجوم تخمين كلمات المرور (Brute-Force Detection) واتخاذ قرار الاحتواء.',
        textEn: 'Analyze a brute-force alert and execute appropriate defensive containment.',
      },
    ],
    concept: {
      textAr: `مركز العمليات الأمنية (SOC) هو غرفة المراقبة والتحكم في المؤسسة.
تعمل على مدار الساعة فرق من المحللين لرصد الإنذارات وتحليل سجلات النظام (Logs).
نظام إدارة الأحداث والمعلومات الأمنية (SIEM) يجمع ملايين السجلات من كل الحواسيب وجدران الحماية، ويبحث عن أنماط مشبوهة:
مثال: إذا سجل حاسوب واحد 20 محاولة دخول فاشلة في دقيقة واحدة، يطلق نظام SIEM إنذارًا فوريًا (Brute-Force Alert).`,
      textEn: `The Security Operations Center (SOC) is the 24/7 command center defending the digital enterprise.
Security analysts monitor real-time event logs generated across servers, workstations, and network devices.
A SIEM platform correlates millions of raw logs into actionable incident alerts:
For example: If a host logs 20 failed authentication attempts in one minute, the SIEM triggers an instant Brute-Force Alert.`,
      analogyAr: `كاميرات المراقبة وغرفة الحراسة في مبنى ضخم:
الكاميرات تسجل باستمرار (مثل ملفات السجلات)، وشاشات الحراسة الذكية تطلق صفارة إنذار إذا قفز شخص فوق السور ليلاً (مثل قواعد ربط SIEM).`,
      analogyEn: `CCTV cameras in a secure facility:
Cameras record 24/7 (like raw system logs), and smart alarms ping the guard room if motion is detected near a restricted perimeter fence after hours (like SIEM correlation rules).`,
      keyTerms: [
        {
          termAr: 'مركز العمليات الأمنية (SOC)',
          termEn: 'Security Operations Center (SOC)',
          definitionAr: 'الفريق والمنشأة المسؤولة عن المراقبة المستمرة واكتشاف التهديدات والاستجابة للحوادث.',
          definitionEn: 'The centralized operational unit tasked with monitoring, detecting, and responding to security incidents.',
        },
        {
          termAr: 'نظام إدارة الأحداث والمعلومات (SIEM)',
          termEn: 'SIEM System',
          definitionAr: 'برمجية مركزية تجمع السجلات من جميع الأنظمة وتحللها وتربط بينها لاكتشاف الهجمات.',
          definitionEn: 'Security Information and Event Management software aggregating, normalizing, and correlating security logs.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'طابور الحوادث الأمنية المصنفة حسب الخطورة (منخفضة، متوسطة، حرجة)، وتفاصيل السجلات الخام لكل إنذار.',
      whatToLookForEn: 'The incident queue categorized by severity (Low, Medium, Critical) with correlated raw log telemetry.',
      initialStateAr: 'عند اختيار حادث هجوم تخمين، يظهر تتابع محاولات الدخول الخاطئة متبوعة بمحاولة ناجحة، مما يستدعي عزل الحساب فورًا.',
      initialStateEn: 'Selecting a brute-force incident reveals consecutive failed logons followed by a compromised success, necessitating rapid containment.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح محاكي مركز العمليات الأمنية (SOC).',
        'اختر الحادثة المعنونة "Brute-Force Authentication Attempt".',
        'افحص السجلات المرتبطة وتأكد من مصدر الهجوم وعنوان IP المشبوه.',
        'اتخذ إجراء الاحتواء بعزل الجهاز المصاب وتغيير كلمة مرور الحساب المخترق.',
      ],
      instructionsEn: [
        'Open the SOC Operations & Detection Engineering lab.',
        'Select the incident titled "Brute-Force Authentication Attempt".',
        'Inspect associated event logs to identify the attacker source IP address.',
        'Execute containment: isolate the endpoint and trigger immediate credential revocation.',
      ],
      whyWeDoThisAr: 'التدرب على الإجراءات الواقعية التي يتخذها محللو SOC من المستوى الأول لحماية الشركات يوميًا.',
      whyWeDoThisEn: 'Hands-on practice with the exact triage and containment workflows Tier 1/2 SOC analysts perform daily.',
      hintsAr: [
        'انتبه لفرق التوقيت بين المحاولات المتكررة؛ الفواصل القصيرة جدًا تدل على استخدام أداة آلية (Bot).',
      ],
      hintsEn: [
        'Notice microsecond timestamps between failed attempts; rapid intervals indicate automated bot tooling.',
      ],
      validationCriterionAr: 'تحليل الحادثة وتطبيق إجراء الاحتواء الصحيح بنجاح.',
      validationCriterionEn: 'Incident investigated and containment action verified.',
      checkType: 'guided_confirmation',
    },
    resultExplanation: {
      whatHappenedAr: 'أكد تحليلك وجود نشاط خبيث، ونجح إجراء العزل في منع المهاجم من التسلل أعمق داخل شبكة الشركة.',
      whatHappenedEn: 'Your analysis confirmed malicious intent, and isolation prevented the adversary from penetrating deeper into internal networks.',
      securitySignificanceAr: 'سرعة الاستجابة (Mean Time to Respond) هي الفارق بين حادثة صغيرة تُحل في دقائق، وبين اختراق مدمر يتصدر الأخبار.',
      securitySignificanceEn: 'Mean Time to Respond (MTTR) is the difference between an isolated minor probe and a catastrophic front-page corporate breach.',
    },
    knowledgeCheck: [
      {
        id: 'q1-siem-benefit',
        questionAr: 'ما الفائدة الكبرى من استخدام نظام SIEM بدلاً من فحص سجلات كل حاسوب وخادم بشكل يدوي ومنفصل؟',
        questionEn: 'What is the primary advantage of a SIEM over manually checking log files on individual servers?',
        options: [
          {
            id: 'opt-siem1',
            textAr: 'الربط الآلي بين الأحداث المشتتة عبر آلاف الأجهزة ورصد الهجمات المعقدة في شاشة موحدة',
            textEn: 'Automated correlation of events across thousands of machines to uncover distributed threats in a unified pane',
            isCorrect: true,
            explanationAr: 'إجابة ممتازة! المهاجم قد ينفذ خطوة في جدار الحماية وخطوة في جهاز المستخدم؛ وSIEM هو من يربط الخيوط معًا.',
            explanationEn: 'Spot-on! Attackers leave footprints across multiple components; SIEM connects the dots into a single story.',
          },
          {
            id: 'opt-siem2',
            textAr: 'إيقاف عمل الحواسيب ليلاً لتوفير الطاقة',
            textEn: 'Shutting down computers at night to conserve electricity',
            isCorrect: false,
            explanationAr: 'غير صحيح؛ لا علاقة لـ SIEM بإدارة الطاقة.',
            explanationEn: 'Incorrect; SIEM is purely dedicated to security monitoring and compliance.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-08-forensics',
      takeawayAr: 'عمل مبهر! أصبحت تعرف كيف يكتشف SOC الهجمات الحية. في الدرس الثامن، سنتقدم خطوة ونقوم بالتحقيق الجنائي الرقمي للبحث عن الآثار المخفية.',
      takeawayEn: 'Outstanding work! You know how SOC analysts detect live attacks. Next, step into digital forensics to investigate deep evidence in Lesson 8.',
    },
  },

  'lesson-08-forensics': {
    id: 'lesson-08-forensics',
    milestoneId: 7,
    order: 8,
    titleAr: 'الدرس الثامن: التحقيق الجنائي الرقمي وجمع الأدلة (Digital Forensics)',
    titleEn: 'Lesson 8: Digital Forensics & Evidence Investigation',
    whyItMattersAr: 'عند وقوع جريمة سيبرانية، لا يكفي إصلاح الضرر؛ يجب تقديم أدلة قطعية لا يمكن دحضها تثبت كيف وقع الحادث ومن المسؤول.',
    whyItMattersEn: 'When a cyber incident occurs, fixing the damage is only half the battle; investigators must preserve indisputable evidence proving what happened.',
    estimatedMinutes: 18,
    simulationId: 'forensics',
    worldId: 8,
    challengeId: 'forensics-root-cause-challenge',
    prerequisites: [
      {
        textAr: 'إكمال الدرس 7: مركز العمليات الأمنية SOC.',
        textEn: 'Completion of Lesson 7: SOC Operations & Monitoring.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: التحقيق في ملف مخترق (File System Forensics)',
      titleEn: 'Worked Example: Investigating a Compromised File',
      scenarioAr: 'اكتشاف ملف مشبوه باسم "backdoor.sh" في مجلد النظام. المطلوب إثبات وقت إنشائه وكيفية وصوله:',
      scenarioEn: 'A suspicious file named "backdoor.sh" is found in a system directory. Prove creation time and ingress vector:',
      stepsAr: [
        'الخطوة 1: استخراج البصمة الزمنية (Timestamps) للملف: وقت الإنشاء، التعديل، وآخر وصول (MAC times).',
        'الخطوة 2: فحص سجلات المتصفح (Browser History) لمعرفة ما إذا كان الملف حُمل من موقع ويب مشبوه.',
        'الخطوة 3: تحليل الذاكرة العشوائية (Memory Forensics) للبحث عن أي عملية نشطة تستخدم هذا الملف.',
        'الخطوة 4: توثيق سلسلة الحضانة (Chain of Custody) لضمان قبول الأدلة في المحكمة.',
      ],
      stepsEn: [
        'Step 1: Extract file timestamps: Modified, Accessed, and Created (MAC times).',
        'Step 2: Cross-reference Browser History to determine if the file was downloaded from a known malicious URL.',
        'Step 3: Perform Memory Analysis to find active processes interacting with the suspect script.',
        'Step 4: Document the Chain of Custody to ensure evidence remains admissible in legal proceedings.',
      ],
      takeawayAr: 'الأدلة الرقمية لا تكذب إذا استُخرجت وحُفظت بطريقة علمية صحيحة.',
      takeawayEn: 'Digital evidence is indisputable when extracted and preserved using scientifically sound methodologies.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: استعادة السجلات المحذوفة واكتشاف الجاني',
      titleEn: 'Independent Challenge: Recovering Deleted Logs & Culprit Discovery',
      scenarioAr: 'مخترق حاول مسح سجلات الدخول لإخفاء أثره. استخدم أدوات التحقيق لاستعادة البيانات:',
      scenarioEn: 'An intruder attempted to clear login logs to hide their tracks. Use forensic tools to recover the slack space data:',
      targetOutcomeAr: 'استعادة السجلات، تحديد عنوان IP المهاجم، وإصدار تقرير التحقيق النهائي.',
      targetOutcomeEn: 'Successful log recovery, attacker IP identification, and final forensic report generation.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن حذف ملف يعني اختفاءه نهائياً من القرص الصلب.',
      commonMisconceptionEn: 'Thinking that deleting a file makes it permanently vanish from the storage media.',
      guidanceAr: 'الملفات المحذوفة غالباً ما تترك أثراً في المساحات غير المستخدمة (Slack Space) حتى يتم استبدالها ببيانات جديدة.',
      guidanceEn: 'Deleted files often persists in unallocated storage sectors (Slack Space) until physically overwritten by new data.',
    },
    keyTakeaways: [
      {
        textAr: 'التحقيق الجنائي الرقمي يركز على الإجابة على: "ماذا حدث؟ متى؟ ومن فعل ذلك؟".',
        textEn: 'Digital Forensics focuses on answering: "What happened? When? And who did it?".',
      },
      {
        textAr: 'سلسلة الحضانة (Chain of Custody) هي أهم إجراء قانوني لحماية سلامة الأدلة.',
        textEn: 'Chain of Custody is the most critical procedural safeguard for evidence integrity.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم سلسلة حفظ الأدلة (Chain of Custody) وسلامة القرص الصلب.',
        textEn: 'Understand Chain of Custody and cryptographic evidence integrity.',
      },
      {
        textAr: 'استخراج آثار النظام (System Artifacts) وتتبع تسلسل الأحداث الزمني (Timeline Reconstruction).',
        textEn: 'Extract digital artifacts (Registry, Prefetch, Event Logs) to reconstruct the incident timeline.',
      },
    ],
    concept: {
      textAr: `المحقق الجنائي الرقمي هو بمثابة المحقق في مسرح الجريمة، لكن مسرح جريمته هو الأقراص الصلبة والذاكرة الرقمية.
القاعدة الذهبية في التحقيق الجنائي:
• لا تفحص الجهاز الأصلي مباشرة؛ خذ نسخة مطابقة بتًا ببت (Forensic Bitstream Image).
• احسب بصمة التجزئة (Hash) للصورة للتأكد من عدم تعديل أي بايت أثناء الفحص.
• ابحث عن الآثار الخفية: ملفات Prefetch (التي تثبت تشغيل برنامج ما)، ومفاتيح سجل النظام (Registry)، وتواريخ تعديل الملفات.`,
      textEn: `A digital forensics examiner is the cyber detective at the crime scene, inspecting storage disks, memory dumps, and forensic artifacts.
The golden rule of digital forensics:
• Never analyze live production drives directly; capture a bit-for-bit forensic bitstream image.
• Compute cryptographic hashes to verify that not a single byte was altered during analysis.
• Uncover hidden artifacts: Prefetch files (proving program execution), Registry keys, and file timestamps.`,
      analogyAr: `تطويق مسرح الجريمة بالشريط الأصفر:
المحقق يرتدي قفازات حتى لا يترك بصماته على الأدلة، ويصور كل شيء بدقة قبل تحريكه لتقديمه للقاضي في المحكمة دون أدنى شك.`,
      analogyEn: `Securing a physical crime scene with yellow tape:
Investigators wear gloves to avoid contaminating evidence and photograph everything before touching it so the evidence stands up in court.`,
      keyTerms: [
        {
          termAr: 'سلسلة حفظ الأدلة (Chain of Custody)',
          termEn: 'Chain of Custody',
          definitionAr: 'سجل موثق يثبت من جمع الدليل الرقمي ومن استلمه وأين تم تخزينه لضمان قانونيته.',
          definitionEn: 'A chronological audit log tracking the acquisition, custody, transfer, and analysis of digital evidence.',
        },
        {
          termAr: 'ملفات Prefetch',
          termEn: 'Prefetch Files',
          definitionAr: 'ملفات ينشئها ويندوز لتسريع البرامج، وتعد دليلاً قاطعاً على تشغيل برنامج معين ووقت تشغيله بدقة.',
          definitionEn: 'Windows optimization files recording application execution history, timestamps, and loaded DLLs.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'استعراض الأدلة الرقمية المسجلة: صورة الذاكرة، سجلات ويندوز، وتحليل الملفات المشبوهة.',
      whatToLookForEn: 'Examine disk image artifacts, memory captures, and forensic timelines.',
      initialStateAr: 'تتبع آثار ملف خبيث قام بتغيير اسمه للتخفي، وكشف وقت تنفيذه عبر ملفات Prefetch وسجلات النظام.',
      initialStateEn: 'Trace a disguised malicious executable and uncover its true launch timestamp via Prefetch artifacts.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح محاكي التحقيق الجنائي الرقمي.',
        'افحص شجرة الأدلة واختر ملف التحقيق المرتبط بالاختراق.',
        'استخرج الجدول الزمني للأحداث (Timeline).',
        'حدد الملف الخبيث المستتر وأثبت توقيت تنفيذه بدقة.',
      ],
      instructionsEn: [
        'Open the Digital Forensics laboratory.',
        'Inspect the evidence repository and select the compromised host image.',
        'Reconstruct the chronological event timeline.',
        'Identify the masquerading malicious binary and confirm its exact execution timestamp.',
      ],
      whyWeDoThisAr: 'إتقان منهجية التحقيق العلمي المعتمد في كبرى الشركات وجهات إنفاذ القانون الدولية.',
      whyWeDoThisEn: 'Mastering the rigorous evidence methodology employed by top incident response firms and law enforcement.',
      hintsAr: [
        'المهاجمون يغيرون أسماء الملفات الخبيثة (مثل svchost.exe مزيف) لكن مسار الملف وسجلات النظام تفضحهم.',
      ],
      hintsEn: [
        'Adversaries rename malware to legitimate system names; check execution paths and hashes to unmask them.',
      ],
      validationCriterionAr: 'استخراج الدليل وتحديد الملف الخبيث وتوقيت تنفيذه.',
      validationCriterionEn: 'Malicious artifact identified and execution timestamp confirmed.',
      checkType: 'guided_confirmation',
    },
    resultExplanation: {
      whatHappenedAr: 'كشفت الأدلة الرقمية أن البرنامج الخبيث تم تنزيله من مرفق بريد احتيالي وفُتح في تمام الساعة 14:32:10.',
      whatHappenedEn: 'Digital artifacts proved the malicious binary was spawned from a phishing attachment and launched at exactly 14:32:10 UTC.',
      securitySignificanceAr: 'بدون التحقيق الجنائي، قد تغلق الشركة الثغرة مؤقتًا بينما لا يزال المهاجم يملك بابًا خلفيًا مخفيًا في النظام.',
      securitySignificanceEn: 'Without forensics, defenders might patch an obvious hole while missing backdoors implanted elsewhere by the intruder.',
    },
    knowledgeCheck: [
      {
        id: 'q1-forensic-hash',
        questionAr: 'لماذا يحسب المحقق الجنائي بصمة SHA-256 لصورة القرص الصلب فور أخذها؟',
        questionEn: 'Why does a forensic investigator compute a SHA-256 hash of a disk image immediately upon acquisition?',
        options: [
          {
            id: 'opt-for1',
            textAr: 'لإثبات أن الصورة لم تُعدل بأي شكل منذ لحظة استخراجها وحتى تقديمها للمحكمة',
            textEn: 'To prove that the forensic copy has remained completely pristine and unaltered since acquisition',
            isCorrect: true,
            explanationAr: 'صحيح تمامًا! أي تغيير في بايت واحد يغير البصمة، وتطابق البصمة يضمن نزاهة الدليل القضائي.',
            explanationEn: 'Precisely! Any alteration modifies the hash digest; matching hashes verify absolute evidentiary integrity.',
          },
          {
            id: 'opt-for2',
            textAr: 'لتسريع نقل الصورة عبر الفلاش ميموري',
            textEn: 'To accelerate USB transfer speeds',
            isCorrect: false,
            explanationAr: 'غير صحيح؛ البصمة وظيفتها التحقق من السلامة وليست تسريع النقل.',
            explanationEn: 'Incorrect; hashes verify integrity, not hardware bus speed.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-09-devsecops',
      takeawayAr: 'رائع جدًا! لقد تعلمت التحقيق الجنائي. والآن، كيف نمنع هذه الثغرات من الوصول للإنتاج أصلاً أثناء كتابة البرمجيات؟ الدرس التاسع يشرح DevSecOps.',
      takeawayEn: 'Impressive! You mastered forensics. Next, learn how to stop vulnerabilities from ever reaching production in DevSecOps (Lesson 9).',
    },
  },

  'lesson-09-devsecops': {
    id: 'lesson-09-devsecops',
    milestoneId: 8,
    order: 9,
    titleAr: 'الدرس التاسع: أمن التطبيقات السحابية والحاويات وDevSecOps',
    titleEn: 'Lesson 9: Cloud, Containers & DevSecOps Security',
    whyItMattersAr: 'إصلاح الثغرة وهي في مرحلة كتابة الكود أرخص 100 مرة من إصلاحها بعد اختراق خوادم الإنتاج السحابية.',
    whyItMattersEn: 'Patching a security flaw during code development is 100x cheaper than remediating a breach on live cloud servers.',
    estimatedMinutes: 20,
    simulationId: 'devsecops',
    worldId: 9,
    challengeId: 'secure-pipeline-challenge',
    prerequisites: [
      {
        textAr: 'إكمال الدرس 8: التحقيق الجنائي الرقمي.',
        textEn: 'Completion of Lesson 8: Digital Forensics & Evidence Investigation.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: كشف تسريب الأسرار في Git (Secret Scanning)',
      titleEn: 'Worked Example: Detecting Secrets Leakage in Git',
      scenarioAr: 'مطور قام برفع كود يحتوي على مفتاح AWS Access Key عن طريق الخطأ:',
      scenarioEn: 'A developer accidentally committed code containing a plaintext AWS Access Key:',
      stepsAr: [
        'الخطوة 1: يكتشف فاحص الأسرار (Secret Scanner) وجود نمط يطابق مفاتيح AWS.',
        'الخطوة 2: توقف بوابة الأمان (Security Gate) عملية البناء فوراً.',
        'الخطوة 3: يتم إرسال تنبيه لفريق الأمان لإلغاء المفتاح (Revoke) في منصة السحابة.',
        'الخطوة 4: يتم تطهير سجل Git وحذف المفتاح من تاريخ الالتزامات (Commits).',
      ],
      stepsEn: [
        'Step 1: The Secret Scanner identifies a high-entropy string matching AWS credential patterns.',
        'Step 2: The Security Gate immediately halts the CI/CD pipeline building process.',
        'Step 3: An automated alert triggers for the security team to revoke the leaked key in the cloud console.',
        'Step 4: The Git history is purged to remove the sensitive credential from all historical commits.',
      ],
      takeawayAr: 'الأتمتة هي الطريقة الوحيدة لمنع تسريب الأسرار في بيئات التطوير السريعة.',
      takeawayEn: 'Automated scanning is the only scalable way to prevent credential leakage in high-velocity development.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: إصلاح ثغرة SAST وتجاوز البوابة',
      titleEn: 'Independent Challenge: Remediating SAST Flaws & Gate Bypass',
      scenarioAr: 'فحص الكود الآلي (SAST) يكتشف ثغرة SQL Injection في طلب جديد. قم بإصلاح الكود لتجاوز الفحص:',
      scenarioEn: 'A SAST scan detects a SQL Injection vulnerability in a Pull Request. Refactor the code to secure the application:',
      targetOutcomeAr: 'تحويل الاستعلام إلى Prepared Statement ونجاح اجتياز بوابة الأمان.',
      targetOutcomeEn: 'Implement parameterized queries and achieve a green security gate status.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن حذف المفتاح في التزام (Commit) جديد يكفي لتأمينه.',
      commonMisconceptionEn: 'Thinking that deleting a leaked key in a subsequent commit makes it safe.',
      guidanceAr: 'المفاتيح المسربة تظل في تاريخ Git؛ يجب إلغاء المفتاح فوراً وتطهير تاريخ المستودع بالكامل.',
      guidanceEn: 'Leaked credentials persist in Git history; you must revoke the key on the service side and purge the repository history.',
    },
    keyTakeaways: [
      {
        textAr: 'نهج DevSecOps يدمج الأمان كجزء أصيل من دورة حياة البرنامج وليس كمرحلة أخيرة.',
        textEn: 'DevSecOps integrates security as a continuous part of the lifecycle, not a final gate.',
      },
      {
        textAr: 'التحول لليسار (Shift Left) يعني اكتشاف الثغرات في وقت مبكر لتوفير الجهد والتكلفة.',
        textEn: 'Shift Left means catching vulnerabilities early to minimize remediation cost and risk.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم خطوط إنتاج البرمجيات الآمنة (Secure CI/CD Pipeline).',
        textEn: 'Understand secure CI/CD pipelines and shifting security left.',
      },
      {
        textAr: 'كشف الأسرار المسربة (Secrets Leak) وحظر الثغرات في فحص الكود الآلي (SAST).',
        textEn: 'Detect leaked cloud API keys and block vulnerable code via automated SAST gates.',
      },
    ],
    concept: {
      textAr: `في التطوير السحابي الحديث، تُبنى التطبيقات وتُنشر آليًا في ثوانٍ عبر ما يسمى "خط الأنابيب" (CI/CD Pipeline).
نهج DevSecOps يدمج الأمان في كل خطوة:
1. فحص الكود المصدري (SAST): هل كتب المطور استعلام SQL غير آمن؟
2. فحص التبعيات (SCA): هل تستخدم مكتبة مفتوحة المصدر تحتوي على ثغرة معروفة (CVE)؟
3. فحص الأسرار (Secrets Detection): هل نسي أحد مفتاح AWS السري داخل كود Git؟
إذا فشل أي فحص، ترفض بوابة الأمان (Security Gate) البناء فورًا وتحمي السحابة.`,
      textEn: `Modern cloud applications are built and shipped automatically through CI/CD deployment pipelines.
DevSecOps embeds security testing into every stage:
1. Static Application Security Testing (SAST): Did a developer write an unsafe SQL query?
2. Software Composition Analysis (SCA): Are third-party npm packages harboring known CVE vulnerabilities?
3. Secret Scanning: Did someone accidentally commit an AWS access key into a public Git repo?
If a test fails, the security gate halts the build immediately, protecting the cloud.`,
      analogyAr: `فحص جودة السيارات في المصنع:
بدلاً من انتظار قيادة السيارة في الشارع لاكتشاف أن الفرامل معطلة، تفحص الروبوتات كل قطعة وتختبرها على خط التجميع قبل تجميع السيارة بالكامل.`,
      analogyEn: `Automobile factory inspection:
Rather than waiting for a car to crash on the highway to notice bad brakes, automated sensors test every bolt on the assembly line before shipping.`,
      keyTerms: [
        {
          termAr: 'التحول للأمام / اليسار (Shift Left)',
          termEn: 'Shift Left',
          definitionAr: 'تقديم إجراءات الفحص الأمني إلى المراحل المبكرة من دورة تطوير البرمجيات لتفادي الثغرات مبكرًا.',
          definitionEn: 'Moving security testing earlier in the software development lifecycle to fix bugs when they are cheap and easy.',
        },
        {
          termAr: 'بوابات الأمان (Security Gates)',
          termEn: 'Security Gates',
          definitionAr: 'شروط برمجية صارمة توقف نشر التطبيق تلقائيًا إذا احتوى على ثغرات حرجة أو مفاتيح مسربة.',
          definitionEn: 'Automated policy thresholds that block CI/CD pipeline progression if critical vulnerabilities are discovered.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'شاهد مراحل خط البناء: الكود، فحص التبعيات، فحص الأسرار، وبوابة القرار النهائي.',
      whatToLookForEn: 'Observe the pipeline stages: Source code, dependency scanning, secret audits, and policy gates.',
      initialStateAr: 'عند وجود مفتاح سحابي مسرب في ملف الإعدادات، يكتشف الفاحص وجوده ويوقف الخط ويمنع النشر.',
      initialStateEn: 'When a leaked AWS secret key is present in configuration files, the secret scanner flags it and blocks deployment.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح محاكي DevSecOps وبوابات الأمان.',
        'شغّل فحص الأسرار (Secrets Scan) للكشف عن المفاتيح المسربة.',
        'لاحظ كشف مفتاح سحابي مسرب عالي العشوائية (High Entropy Key).',
        'طبّق إجراء المعالجة بسحب المفتاح واستخدام مدير الأسرار الآمن.',
        'أعد تشغيل خط الإنتاج وتأكد من نجاح بوابة الأمان واجتياز النشر.',
      ],
      instructionsEn: [
        'Open the DevSecOps & Pipeline Gates simulation.',
        'Trigger the Secrets Scan to detect exposed credentials.',
        'Identify the high-entropy AWS access key leaked in code.',
        'Remediate: revoke the exposed key and integrate AWS Secrets Manager.',
        'Rerun the pipeline and watch the security gate turn green to permit release.',
      ],
      whyWeDoThisAr: 'تسريب مفاتيح السحابة في Git هو أحد أكثر أسباب اختراق الشركات الناشئة شيوعًا وتكلفة في العالم.',
      whyWeDoThisEn: 'Leaking cloud keys in Git commits is one of the most common and costly attack vectors targeting modern enterprises.',
      hintsAr: [
        'المفاتيح المسربة في سجلات Git التاريخية يجب تطهيرها وإلغاؤها فورًا في لوحة تحكم السحابة.',
      ],
      hintsEn: [
        'Merely deleting a key in a new commit is insufficient; historical commits must be purged and credentials rotated.',
      ],
      validationCriterionAr: 'معالجة السر المسرب ونجاح اجتياز بوابات الأمان في خط الإنتاج.',
      validationCriterionEn: 'Leaked secret remediated and pipeline security gate verified.',
      checkType: 'guided_confirmation',
    },
    resultExplanation: {
      whatHappenedAr: 'منعت بوابة الأمان خروج الكود المعيب، وتم تأمين السر السحابي دون أن يتعرض لخطر النشر العام.',
      whatHappenedEn: 'The automated gate blocked compromised code from leaving the build environment, keeping cloud assets secure.',
      securitySignificanceAr: 'الأتمتة هي الضمان الوحيد للأمان مع وتيرة التحديثات البرمجية السريعة في العصر الحالي.',
      securitySignificanceEn: 'Automated policy enforcement is the only scalable way to maintain high security standards at modern software velocity.',
    },
    knowledgeCheck: [
      {
        id: 'q1-shift-left',
        questionAr: 'ماذا يقصد خبراء الأمن السيبراني بمصطلح "Shift-Left" في هندسة البرمجيات؟',
        questionEn: 'What do security engineers mean by "Shift Left" in software development?',
        options: [
          {
            id: 'opt-sl1',
            textAr: 'إدراج الفحوصات الأمنية مبكرًا في مرحلة كتابة الكود والبناء بدلاً من انتظار الإنتاج',
            textEn: 'Integrating security checks early during coding and build stages rather than waiting for production deployment',
            isCorrect: true,
            explanationAr: 'ممتاز! كلما اكتشفت المشكلة في اليسار (مرحلة الكود)، كان حلها أسهل وأرخص وأقل خطرًا.',
            explanationEn: 'Spot on! The earlier (further left) a vulnerability is discovered, the simpler, cheaper, and safer it is to fix.',
          },
          {
            id: 'opt-sl2',
            textAr: 'الكتابة باليد اليسرى على لوحة المفاتيح',
            textEn: 'Typing with the left hand on the keyboard',
            isCorrect: false,
            explanationAr: 'غير صحيح على الإطلاق؛ المصطلح مجازي يشير للخط الزمني لمشروع البرمجيات.',
            explanationEn: 'Incorrect; the term is a timeline metaphor for early-stage software lifecycle integration.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-09-cloud-threat-hunting',
      takeawayAr: 'رائع لأبعد حد! لقد أتقنت خطوط التطوير الآمنة. الآن انتقل إلى اصطياد التهديدات السحابية والصيد الاستباقي قبل الانتقال للميدان الشامل!',
      takeawayEn: 'Phenomenal progress! You have mastered secure build pipelines. Now advance to cloud threat hunting before entering the capstone range!',
    },
  },

  'lesson-09-cloud-threat-hunting': {
    id: 'lesson-09-cloud-threat-hunting',
    milestoneId: 9,
    order: 1,
    titleAr: 'الدرس التاسع: اصطياد التهديدات السحابية وصياغة الفرضيات',
    titleEn: 'Lesson 9: Cloud Threat Hunting & Attack Hypothesis Formulation',
    whyItMattersAr: 'الهجمات السحابية لا تلفت الانتباه؛ بل تتخفى كأعمال صيانة مشروعة باستخدام أدوار IAM المسروقة، واصطياد التهديدات الاستباقي هو السلاح الوحيد لربط الأحداث المستترة.',
    whyItMattersEn: 'Cloud attackers blend in using stolen IAM identities; proactive threat hunting leverages structured hypotheses to unveil subtle API anomalies before data exfiltration occurs.',
    estimatedMinutes: 30,
    simulationId: 'threat_hunting',
    worldId: 28,
    challengeId: 'cloud-threat-hunting-challenge',
    prerequisites: [
      {
        textAr: 'إكمال الدرس 8: أمن التطبيقات وخطوط DevSecOps.',
        textEn: 'Completion of Lesson 8: Application Security & DevSecOps Pipelines.',
      },
      {
        textAr: 'فهم أساسيات سجلات التدقيق CloudTrail ورموز الوصول IAM.',
        textEn: 'Foundational grasp of CloudTrail audit streams and IAM credentials.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: تتبع فرضية تصعيد الصلاحيات السحابية',
      titleEn: 'Worked Example: Tracing a Cloud IAM Privilege Escalation Hypothesis',
      scenarioAr: 'ملاحظة نمط شاذ من طلبات GetCallerIdentity تليها استدعاءات AttachUserPolicy في CloudTrail من عنوان IP غير معروف:',
      scenarioEn: 'Detecting an unusual burst of GetCallerIdentity calls followed by AttachUserPolicy in CloudTrail logs from an unapproved IP range:',
      stepsAr: [
        'صياغة الفرضية: قيام مهاجم باستخدام مفتاح access_key مسرب لربط سياسة AdministratorAccess بحسابه.',
        'الاستعلام في سجلات CloudTrail عن الحدث AttachUserPolicy ومقارنته بالرقم التعريفي لمنفذ العملية.',
        'تتبع التسلسل الزمني لطلبات API والتثبت من أن الهوية المخترقة أنشأت دور سحابي مساند لتأمين التواجد المستمر.',
        'إلغاء المفتاح المخترق فوراً، وحذف السياسة المرفقة غير المصرح بها، وتفعيل تنبيه SIEM تلقائي لمراقبة تعديلات IAM.',
      ],
      stepsEn: [
        'Formulate Hypothesis: An adversary is leveraging a leaked access key to bind AdministratorAccess to an unprivileged entity.',
        'Filter CloudTrail logs for AttachUserPolicy events, correlating userARN with sourceIPAddress.',
        'Trace the API sequence to confirm if the compromise attempted backdoor role creation for persistence.',
        'Remediate by revoking compromised access keys, detaching unauthorized policies, and establishing automated SIEM alerts.',
      ],
      takeawayAr: 'اصطياد التهديدات يتطلب صياغة فرضيات فرضية من منهجية MITRE ATT&CK بدلاً من الانتظار السلبي للتنبيهات.',
      takeawayEn: 'Threat hunting relies on proactive MITRE ATT&CK hypothesis testing rather than purely passive alert triage.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: كشف تسريب بيانات الحاويات واصطياد التهديد',
      titleEn: 'Independent Challenge: Uncovering Container Exfiltration & Threat Hypothesis Testing',
      scenarioAr: 'حلل سجلات الأحداث في بيئة الحاويات المستضافة لتحديد شذوذ نقل البيانات واكتشاف نقطة الاختراق المبدئية:',
      scenarioEn: 'Analyze container runtime audit logs to isolate abnormal egress traffic and trace the initial compromise entry vector:',
      targetOutcomeAr: 'عزل الحاوية المصابة، إلغاء صلاحيات IAM المخترقة، وإثبات اكتمال اصطياد التهديد.',
      targetOutcomeEn: 'Isolate compromised pods, revoke escalated IAM privileges, and validate complete threat neutralization.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن الاعتماد على أدوات الكشف التلقائي كافٍ دون الحاجة للبحث الاستباقي عن التهديدات.',
      commonMisconceptionEn: 'Believing legacy automated signatures alone catch sophisticated identity-driven cloud intrusions.',
      guidanceAr: 'المهاجمون الأذكياء يستغلون الصلاحيات المشروعة؛ واصطياد التهديدات يفحص الأنماط السلوكية والشاذة حتى دون وجود تنبيه برمجيات خبيثة تقليدي.',
      guidanceEn: 'Sophisticated attackers use valid credentials; hunting inspects behavior baselines and API execution anomalies even without malware signatures.',
    },
    keyTakeaways: [
      {
        textAr: 'سجلات CloudTrail وKubernetes Audit Stream هي مصدر الحقيقة الأول لاصطياد الهجمات السحابية.',
        textEn: 'CloudTrail and K8s Audit streams serve as the primary ground truth for cloud threat hunting.',
      },
      {
        textAr: 'صياغة الفرضيات المستندة لمصفوفة MITRE ATT&CK تضمن تحليلاً شاملاً دون إغفال التهديدات المتقدمة.',
        textEn: 'Hypothesis-driven testing anchored in MITRE ATT&CK matrix ensures systematic threat discovery.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم منهجية اصطياد التهديدات السحابية واستخدام فرضيات الهجوم.',
        textEn: 'Master hypothesis-driven cloud threat hunting methodologies.',
      },
      {
        textAr: 'تحليل سجلات الأحداث السحابية واستعلامات IAM وKubernetes لتحديد الأنشطة المشبوهة.',
        textEn: 'Analyze CloudTrail and container logs to detect IAM escalation and lateral movement.',
      },
    ],
    concept: {
      textAr: `اصطياد التهديدات (Threat Hunting) هو عملية استباقية ومنظمة للبحث في الشبكات والأنظمة السحابية عن المهاجمين المستترين الذين تمكنوا من تجاوز وسائل الدفاع التلقائية.
في البيئات السحابية، يركز الصيد على:
• شذوذ طلبات API في CloudTrail (مثل الوصول من بلدان غير معتادة أو في أوقات غير طبيعية).
• تصعيد الصلاحيات الهادئ عبر تعديل سياسات IAM.
• الحركة الجانبية بين الحاويات ومجموعات Kubernetes.`,
      textEn: `Threat Hunting is a proactive, hypothesis-led search through cloud environments to locate stealthy adversaries who bypassed automated security controls.
In cloud infrastructure, hunting focuses on:
• CloudTrail API anomalies (unusual geographic locations or off-hours credential usage).
• Stealthy privilege escalation via IAM policy manipulations.
• Container-to-host lateral movement across Kubernetes clusters.`,
      analogyAr: `حارس الغابة الخبير:
مثل حارس الغابة الذي لا ينتظر سماع أجهزة الإنذار بل يقرأ آثار الأقدام المكسورة والغريبة على الأرض؛ كذلك مصطاد التهديدات يقرأ السجلات الدقيقة لاكتشاف أثر المهاجم قبل وقوع الضرر.`,
      analogyEn: `The Expert Tracker:
Like a wilderness ranger who doesn't wait for alarm sirens but actively searches for unusual footprints and broken twigs; a threat hunter reads audit logs to discover stealth adversaries before damage occurs.`,
      keyTerms: [
        {
          termAr: 'اصطياد التهديدات (Threat Hunting)',
          termEn: 'Threat Hunting',
          definitionAr: 'النهج الاستباقي المنهجي للبحث عن التهديدات المتقدمة وتحديد الهجمات النشطة غير المكتشفة.',
          definitionEn: 'The proactive, hypothesis-led search for advanced persistent threats hidden inside networks and cloud environments.',
        },
        {
          termAr: 'فرضية الهجوم (Attack Hypothesis)',
          termEn: 'Attack Hypothesis',
          definitionAr: 'افتراض علمي ومدروس حول طريقة محتملة يستخدمها المهاجم بناءً على إطار MITRE ATT&CK.',
          definitionEn: 'A structured proposition regarding potential adversary behavior based on threat intelligence and MITRE ATT&CK techniques.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في محاكي اصطياد التهديدات؟',
      titleEn: 'What will you observe in the Threat Hunting simulator?',
      whatToLookForAr: 'افحص خط الأحداث السحابية وراقب شذوذ طلبات IAM وسجلات CloudTrail في بيئة Nexora Cloud.',
      whatToLookForEn: 'Observe CloudTrail API event flows and inspect anomalous IAM calls in the Nexora Cloud console.',
      initialStateAr: 'ظهور مؤشرات استعلامات IAM متزايدة من عنوان IP غير معروف مع تغيير في تكوين المجموعات السحابية.',
      initialStateEn: 'Initial baseline shows heightened IAM query volume from an unlisted IP along with cloud bucket ACL modifications.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح محاكي اصطياد التهديدات السحابية (Threat Hunting Simulator).',
        'افحص سجلات CloudTrail وحدد طلبات API الشاذة المنفذة باستعمال مفتاح IAM المسرب.',
        'صغ فرضية الهجوم بناءً على تقنيات MITRE ATT&CK المستهدفة.',
        'قم بإلغاء الصلاحية المسربة، وعزل الحاوية المتضررة، واطلب تقرير تأكيد التطهير.',
      ],
      instructionsEn: [
        'Launch the Cloud Threat Hunting Simulator.',
        'Query CloudTrail logs to identify anomalous API calls originating from compromised IAM access keys.',
        'Formulate an attack hypothesis based on MITRE ATT&CK technique IDs.',
        'Revoke compromised IAM tokens, isolate the affected workload, and trigger verification confirmation.',
      ],
      whyWeDoThisAr: 'إتقان القدرة الاستباقية على شل حركة المهاجمين واكتشاف اختراق المفاتيح قبل إتمام سرقة البيانات.',
      whyWeDoThisEn: 'To master proactive threat neutralization and stop compromised keys before exfiltration occurs.',
      hintsAr: [
        'ابحث عن أحدث طلبات AttachUserPolicy وCreateAccessKey في شاشة السجلات.',
      ],
      hintsEn: [
        'Inspect the audit log view for recent AttachUserPolicy and CreateAccessKey calls.',
      ],
      validationCriterionAr: 'تحديد الحدث الشاذ وتطبيق الاستجابة الصحيحة وإكمال اصطياد التهديد.',
      validationCriterionEn: 'Anomalous event isolated, threat hypothesis verified, and remediation executed.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم تعقب النشاط الشاذ في سجلات السحابة، والتحقق من صحة فرضية الاختراق، ثم إلغاء صلاحيات المهاجم واجتياز التحدي.',
      whatHappenedEn: 'Anomalous API events were correlated, attack hypothesis verified against CloudTrail, and attacker access keys revoked.',
      securitySignificanceAr: 'اصطياد التهديدات يقلل وقت بقاء المهاجم (Dwell Time) داخل السحابة من أسابيع إلى دقائق معدودة.',
      securitySignificanceEn: 'Proactive threat hunting reduces adversary dwell time in cloud environments from weeks to minutes.',
    },
    knowledgeCheck: [
      {
        id: 'q1-threat-hunting-hypothesis',
        questionAr: 'ما الفرق الرئيسي بين الاستجابة التقليدية للحوادث (Incident Response) واصطياد التهديدات (Threat Hunting)؟',
        questionEn: 'What is the primary difference between Incident Response and Threat Hunting?',
        options: [
          {
            id: 'opt-th1',
            textAr: 'الاستجابة للحوادث تبدأ بعد صدور تنبيه أمني، بينما اصطياد التهديدات يبدأ استباقياً بالبحث عن التهديدات المستترة بدون تنبيه مبدئي',
            textEn: 'Incident Response triggers after an alert, whereas Threat Hunting proactively seeks hidden threats without waiting for an automated alert',
            isCorrect: true,
            explanationAr: 'ممتاز! اصطياد التهديدات هو نهج استباقي يقوده العنصر البشري وصياغة الفرضيات.',
            explanationEn: 'Spot on! Threat hunting is a proactive, analyst-driven discipline powered by hypothesis formulation.',
          },
          {
            id: 'opt-th2',
            textAr: 'لا يوجد أي فرق بينهما',
            textEn: 'There is no difference between them',
            isCorrect: false,
            explanationAr: 'غير صحيح على الإطلاق.',
            explanationEn: 'Incorrect.',
          },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-10-cyber-range',
      takeawayAr: 'أحسنت صنعاً! لقد أكملت اصطياد التهديدات السحابية بمؤشرات عالية. الآن حان موعد التحدي الأكبر: الميدان السيبراني المؤسسي الشامل (Lesson 10)!',
      takeawayEn: 'Outstanding! You have mastered cloud threat hunting principles. Now proceed to the ultimate capstone: The Unified Enterprise Cyber Range (Lesson 10)!',
    },
  },

  'lesson-10-cyber-range': {
    id: 'lesson-10-cyber-range',
    milestoneId: 10,
    order: 10,
    titleAr: 'الدرس العاشر: الميدان السيبراني الشامل والتطبيق العملي المتكامل',
    titleEn: 'Lesson 10: The Unified Enterprise Cyber Range',
    whyItMattersAr: 'هنا تلتقي كل العلوم: من الكابل الفيزيائي والمبدل إلى خادم النطاق وسطح مكتب المستخدم وجدار الحماية.',
    whyItMattersEn: 'Where all cybersecurity disciplines converge: from physical cables and switches to domain controllers, user desktops, and firewalls.',
    estimatedMinutes: 25,
    simulationId: 'range',
    worldId: 60,
    prerequisites: [
      {
        textAr: 'إكمال كافة الدروس السابقة من 0 إلى 9.',
        textEn: 'Completion of all preceding lessons from 0 to 9.',
      },
    ],
    workedExample: {
      titleAr: 'مثال عملي: تتبع دورة الحياة الكاملة لاتصال مستخدم بخادم',
      titleEn: 'Worked Example: Full Lifecycle of a User-to-Server Session',
      scenarioAr: 'مستخدم في قسم المالية يحاول الوصول لسجل الرواتب في بيئة Nexora الحية:',
      scenarioEn: 'A Finance user attempts to access the payroll ledger in the live Nexora environment:',
      stepsAr: [
        'الخطوة 1: الموظف يسجل دخوله لمحطة العمل (OS Internals & Active Directory).',
        'الخطوة 2: يطلب الموظف الوصول للخادم عبر الشبكة (Subnetting & Routing).',
        'الخطوة 3: يمر الطلب عبر الجدار الناري للتأكد من القواعد (Firewall ACLs).',
        'الخطوة 4: يتم التحقق من تذكرة Kerberos وتشفير الاتصال (Identity & Crypto).',
        'الخطوة 5: يظهر الحدث في لوحة تحكم SOC للتحقق من سلامة النشاط (SOC Monitoring).',
      ],
      stepsEn: [
        'Step 1: User authenticates to the workstation (OS Internals & Active Directory).',
        'Step 2: Request traverses internal routers to locate the server (Subnetting & Routing).',
        'Step 3: Perimeter/Internal firewalls validate the traffic flow (Firewall ACLs).',
        'Step 4: Kerberos verifies the identity and TLS encrypts the payload (Identity & Crypto).',
        'Step 5: The successful access event is logged and analyzed in the SOC console (SOC Monitoring).',
      ],
      takeawayAr: 'الميدان السيبراني يجسد تكامل كافة الدفاعات السيبرانية في نظام واحد.',
      takeawayEn: 'The Cyber Range demonstrates the total orchestration of all defensive layers working in unison.',
    },
    independentChallengeDetail: {
      titleAr: 'التحدي المستقل: الدفاع عن المؤسسة ضد هجوم شامل',
      titleEn: 'Independent Challenge: Defending the Enterprise Against Full-Spectrum Attack',
      scenarioAr: 'مهاجم يحاول التسلل من الإنترنت للوصول لمتحكم النطاق. استخدم كافة الأدوات المتاحة لصد الهجوم:',
      scenarioEn: 'An adversary is attempting to pivot from the internet to the Domain Controller. Deploy every skill to block and hunt the threat:',
      targetOutcomeAr: 'حظر المهاجم، عزل الأنظمة المتضررة، وتأكيد سلامة البنية التحتية بالكامل.',
      targetOutcomeEn: 'Attacker blocked, affected nodes isolated, and infrastructure integrity fully restored.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن تأمين جزء واحد (مثل الجدار الناري فقط) يكفي لحماية الشركة.',
      commonMisconceptionEn: 'Thinking that a single point of defense (e.g. just a firewall) secures the entire enterprise.',
      guidanceAr: 'الأمان هو "دفاع بالعمق" (Defense-in-Depth)؛ فإذا سقط خط دفاع، يجب أن يتصدى الخط التالي للمهاجم.',
      guidanceEn: 'Security relies on "Defense-in-Depth"; if one layer is breached, the next must contain and neutralize the threat.',
    },
    keyTakeaways: [
      {
        textAr: 'الأمن السيبراني هو عملية مستمرة وشاملة تبدأ من الكابل وتنتهي بالتطبيق.',
        textEn: 'Cybersecurity is a continuous, holistic process from Layer 1 to Layer 7.',
      },
      {
        textAr: 'التوأم الرقمي (Digital Twin) يتيح اختبار الدفاعات وتدريب الكوادر دون خطر على الإنتاج.',
        textEn: 'Digital Twins enable risk-free defense testing and high-fidelity personnel training.',
      },
    ],
    objectives: [
      {
        textAr: 'فهم معمارية المؤسسة المتكاملة (Enterprise Digital Twin).',
        textEn: 'Understand the end-to-end architecture of an enterprise digital twin.',
      },
      {
        textAr: 'التفاعل مع مكونات الشبكة الحقيقية: فصل وإعادة الكابلات، فحص جدول المبدل MAC، وحل أسماء DNS.',
        textEn: 'Interact with real physical and logical network components: cable disconnects, switch MAC tables, and DNS resolution.',
      },
    ],
    concept: {
      textAr: `الميدان السيبراني في OMEGA ليس مجرد رسم شكلي؛ هو محاكاة حقيقية لمؤسسة كاملة تسمى Nexora Financial.
تضم المؤسسة:
• خادم النطاق (DC01): يدير Active Directory وحل أسماء DNS.
• خادم الملفات (FILE01): يقدم مشاركات SMB المحمية بصلاحيات NTFS.
• محطات العمل (FIN-WS01 للمالية، HR-WS01 للموارد البشرية): أجهزة ويندوز كاملة بسطح مكتب ونظام ملفات.
• المبدل المركزي (CORE-SW01): ينقل الإطارات عبر جدول عناوين MAC.
• الكابلات الفيزيائية: أي انقطاع في كابل خادم يقطع الاتصال به مباشرة كما يحدث في العالم الحقيقي!`,
      textEn: `The OMEGA Cyber Range is a living digital twin of an enterprise named Nexora Financial.
It features:
• Domain Controller (DC01): Managing Active Directory authentication and DNS resolution.
• File Server (FILE01): Providing SMB network shares protected by NTFS DACLs.
• User Workstations (FIN-WS01 for Finance, HR-WS01 for HR): Full Windows desktops with active filesystems.
• Core Switch (CORE-SW01): Switching frames based on its live dynamic MAC address table.
• Physical Cabling: Disconnecting a server cable severs real network connectivity exactly as in physical reality!`,
      analogyAr: `المدينة المصغرة:
مثلما تحتوي المدينة على محطة كهرباء، ومركز شرطة، وشبكة طرق، ومنازل سكان؛ كذلك المؤسسة السيبرانية تحتوي على خوادم، وأجهزة أمنية، ومبدلات، ومحطات عمل موظفين مترابطة معًا.`,
      analogyEn: `A miniature smart city:
Just as a city has power plants, police stations, roads, and houses; an enterprise infrastructure connects servers, security sensors, switches, and workstations into an integrated ecosystem.`,
      keyTerms: [
        {
          termAr: 'التوأم الرقمي (Digital Twin)',
          termEn: 'Enterprise Digital Twin',
          definitionAr: 'نسخة برمجية حية ودقيقة تحاكي السلوك الفيزيائي والمنطقي للبنية التحتية للمؤسسة.',
          definitionEn: 'A high-fidelity software model replicating the exact physical and logical behavior of real-world infrastructure.',
        },
        {
          termAr: 'جدول عناوين المبدل (Switch MAC Table)',
          termEn: 'Switch MAC Table (CAM Table)',
          definitionAr: 'جدول في المبدل يربط كل منفذ فيزيائي بعنوان MAC الخاص بالجهاز الموصول به لتوجيه الإطارات بدقة.',
          definitionEn: 'The dynamic lookup table mapping physical switch ports to device hardware MAC addresses for frame forwarding.',
        },
      ],
    },
    demonstration: {
      titleAr: 'ما الذي ستلاحظه في المحاكي؟',
      titleEn: 'What will you observe in the simulation?',
      whatToLookForAr: 'ابدأ بمشاهدة "المخطط ثنائي الأبعاد (2D Schematic)" لرؤية كافة الأجهزة بوضوح مريح، ثم تفقد سطح مكتب محطة العمل FIN-WS01.',
      whatToLookForEn: 'Start by viewing the 2D Schematic for clean layout clarity, then inspect the Windows desktop on FIN-WS01.',
      initialStateAr: 'الأجهزة متصلة بالشبكة، وتستطيع محطة FIN-WS01 الوصول لخادم الملفات FILE01 ومتحكم النطاق DC01.',
      initialStateEn: 'All nodes are online; workstation FIN-WS01 can resolve DC01 and connect to FILE01 shares.',
    },
    guidedTask: {
      taskTitleAr: 'مهمتك العملية في المحاكي',
      taskTitleEn: 'Your Guided Task in the Simulator',
      instructionsAr: [
        'افتح الميدان السيبراني واختر المخطط ثنائي الأبعاد (Schematic View).',
        'حدد محطة العمل FIN-WS01 وتفقد فاحص الشبكة (Network Inspector).',
        'افتح سطر الأوامر ونفّذ أمر: nslookup FILE01 وشاهد نجاح حل عنوان IP.',
        'اختر كابل خادم النطاق CAB-SRV-DC01 وافصله، ثم نفّذ ipconfig /flushdns وكرر الأمر لتشهد فشل الاتصال الحقيقي.',
        'أعد توصيل الكابل واشهد استعادة الشبكة فورًا.',
      ],
      instructionsEn: [
        'Open the Cyber Range and switch to the 2D Schematic view for clarity.',
        'Select workstation FIN-WS01 and inspect its network status.',
        'Run nslookup FILE01 in the command terminal to confirm successful DNS resolution.',
        'Select cable CAB-SRV-DC01, disconnect it, flush DNS cache, and verify true communication failure.',
        'Reconnect the cable and watch network health restore instantaneously.',
      ],
      whyWeDoThisAr: 'إدراك أن الأمن السيبراني يبدأ من الطبقة الفيزيائية (Physical Layer 1) وحتى أعلى طبقات البرمجيات.',
      whyWeDoThisEn: 'Understanding that cybersecurity encompasses the physical cable layer (Layer 1) all the way up to application layers.',
      hintsAr: [
        'يمكنك دائمًا التنقل بين المخطط ثنائي الأبعاد (2D) والمشهد ثلاثي الأبعاد (3D) من شريط الأدوات العلوي.',
      ],
      hintsEn: [
        'Toggle between 2D Schematic and 3D Twin anytime using the top controls.',
      ],
      validationCriterionAr: 'إجراء فحص الشبكة وتجربة فصل وتوصيل الكابل ورؤية الأثر الواقعي.',
      validationCriterionEn: 'Network inspection performed and physical cable disconnect/reconnect verified.',
      checkType: 'guided_confirmation',
    },
    resultExplanation: {
      whatHappenedAr: 'عند فصل كابل خادم النطاق DC01، انقطعت خدمة DNS، فعجزت المحطة عن العثور على الخادم. وعند إعادة التوصيل، استعاد المبدل الاتصال فورًا.',
      whatHappenedEn: 'Severing the DC01 cable broke the DNS resolution path, leaving the workstation unable to locate servers until physical reconnection restored link state.',
      securitySignificanceAr: 'الأمان المادي (Physical Security) وحماية الأسلاك وغرف الخوادم هو الأساس؛ فمن يملك حق الوصول الفيزيائي للكابل يستطيع قطع أو اعتراض الخدمة.',
      securitySignificanceEn: 'Physical security is paramount: an adversary with physical wire access can sever services or tap communications at will.',
    },
    knowledgeCheck: [
      {
        id: 'q1-range-synthesis',
        questionAr: 'ماذا يثبت لك نجاح التواصل بين محطة FIN-WS01 وخادم الملفات FILE01 في الميدان السيبراني؟',
        questionEn: 'What does successful communication between FIN-WS01 and FILE01 demonstrate in the cyber range?',
        options: [
          {
            id: 'opt-syn1',
            textAr: 'تكامل كامل للطبقات: الكابل الفيزيائي سليم، المبدل يمرر الإطارات، DNS يحل الاسم، وخادم النطاق يصادق الحساب',
            textEn: 'Full stack integration: physical cables are intact, switch forwards frames, DNS resolves IPs, and the DC authenticates credentials',
            isCorrect: true,
            explanationAr: 'إجابة عبقرية وخاتمة مثالية للمسار! الأمن السيبراني هو سيمفونية متكاملة تعمل فيها كل هذه العناصر بانسجام.',
            explanationEn: 'Brilliant conclusion! Cybersecurity is an orchestration where hardware, protocol stacks, and identity work in unison.',
          },
          {
            id: 'opt-syn2',
            textAr: 'أن الإنترنت يعمل بدون كهرباء',
            textEn: 'That the internet runs without power',
            isCorrect: false,
            explanationAr: 'غير صحيح بالطبع.',
            explanationEn: 'Incorrect.',
          },
        ],
      },
    ],
    nextStep: {
      takeawayAr: 'تهانينا الحارة! 🎉 لقد أكملت مسار التأسيس السيبراني الشامل من الصفر حتى الميدان المتكامل. أنت الآن تملك الأساس الصلب لاستكشاف كل عوالم ومختبرات OMEGA المتقدمة بثقة واقتدار!',
      takeawayEn: 'Heartfelt congratulations! 🎉 You have completed the comprehensive beginner cybersecurity journey from scratch to the enterprise cyber range. You are now equipped to explore all advanced OMEGA labs with total confidence!',
    },
  },
};
