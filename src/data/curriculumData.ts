import { CurriculumMilestone, CurriculumLesson } from '../types/curriculum';

export const CURRICULUM_MILESTONES: CurriculumMilestone[] = [
  {
    id: 1,
    slug: 'foundations-cia',
    titleAr: '1. التعرف إلى الأمن السيبراني وثالوث الحماية الأساسي',
    titleEn: '1. Introduction to Cybersecurity & The CIA Triad',
    subtitleAr: 'المفاهيم الأولى: السرية والسلامة والتوافر',
    subtitleEn: 'Core Fundamentals: Confidentiality, Integrity, Availability',
    descriptionAr: 'ابدأ من نقطة الصفر: ما هو الأمن السيبراني ولماذا نحتاجه؟ وكيف ترتكز كل أنظمة الحماية على أركان ثالوث CIA الثلاثة.',
    descriptionEn: 'Start from absolute scratch: What is cybersecurity and why does it matter? Master the three pillars of the CIA Triad.',
    estimatedMinutes: 12,
    iconName: 'Shield',
    primarySimulationId: 'cia_triad',
    lessonIds: ['lesson-01-cia-triad'],
  },
  {
    id: 2,
    slug: 'systems-internals',
    titleAr: '2. فهم الحاسوب والأنظمة وصلاحيات الوصول',
    titleEn: '2. Understanding Computers, Operating Systems & Access Rights',
    subtitleAr: 'كيف تعمل الذاكرة والمعالج وكيف يتم عزل الصلاحيات',
    subtitleEn: 'How CPU, Memory and OS Privilege Isolation Work',
    descriptionAr: 'افهم الفارق بين وضع المستخدم ووضع النواة، وكيف يمنع نظام التشغيل البرامج الضارة من قراءة بيانات المستخدمين الآخرين.',
    descriptionEn: 'Learn how user mode and kernel mode separate privileges and how OS prevents malicious processes from stealing data.',
    estimatedMinutes: 15,
    iconName: 'Cpu',
    primarySimulationId: 'system_internals',
    lessonIds: ['lesson-02-system-internals'],
  },
  {
    id: 3,
    slug: 'networking-basics',
    titleAr: '3. فهم الشبكات وكيف تنتقل البيانات',
    titleEn: '3. Network Foundations & How Data Travels',
    subtitleAr: 'عناوين IP، حزم البيانات، المبدلات والموجهات',
    subtitleEn: 'IP Addresses, Data Packets, Switches and Routers',
    descriptionAr: 'تعرف على عنوان IP مثل العنوان البريدي لمنزلك، واكتشف كيف تقسم الشبكات وتوجه الحزم بأمان إلى وجهتها.',
    descriptionEn: 'Discover how IP addresses work like home addresses, and how networks segment and route packets reliably.',
    estimatedMinutes: 15,
    iconName: 'Network',
    primarySimulationId: 'subnet_routing',
    lessonIds: ['lesson-03-subnet-routing'],
  },
  {
    id: 4,
    slug: 'protocols-firewalls',
    titleAr: '4. البروتوكولات وجدران الحماية الرقمية',
    titleEn: '4. Network Protocols & Firewalls',
    subtitleAr: 'المنافذ الشائعة وقواعد جدار الحماية وعزل الشبكات',
    subtitleEn: 'Common Ports, Firewall Rules and DMZ Isolation',
    descriptionAr: 'تعلم كيف يفحص جدار الحماية حركة المرور، ولماذا نغلق المنافذ غير المستخدمة لمنع المهاجمين من التسلل.',
    descriptionEn: 'See how firewalls filter incoming and outgoing traffic and why closing unused ports stops intruders.',
    estimatedMinutes: 15,
    iconName: 'ShieldCheck',
    primarySimulationId: 'firewall',
    lessonIds: ['lesson-04-firewall-rules'],
  },
  {
    id: 5,
    slug: 'cryptography-web',
    titleAr: '5. مقدمة إلى التشفير وأمن الويب',
    titleEn: '5. Cryptography & Web Security Foundations',
    subtitleAr: 'دوال التجزئة SHA-256، التشفير وقنوات الاتصال الآمنة',
    subtitleEn: 'Cryptographic Hashing SHA-256 and Secure Web Channels',
    descriptionAr: 'اكتشف الفرق بين التشفير والتجزئة، وشاهد كيف يغير حرف واحد البصمة الرقمية بالكامل (تأثير الانهيار الجليدي).',
    descriptionEn: 'Master hashing vs encryption and watch how changing a single byte flips the entire digital fingerprint.',
    estimatedMinutes: 15,
    iconName: 'Key',
    primarySimulationId: 'crypto',
    lessonIds: ['lesson-05-cryptography'],
  },
  {
    id: 6,
    slug: 'identity-access',
    titleAr: '6. الهوية والمصادقة والتحكم بالوصول',
    titleEn: '6. Identity, Authentication & Access Control',
    subtitleAr: 'اسم المستخدم، كلمة المرور، Active Directory وتذاكر Kerberos',
    subtitleEn: 'User Accounts, Active Directory Domain Services & Kerberos Tickets',
    descriptionAr: 'افهم الفرق بين من أنت (المصادقة) وما يسمح لك بفعله (التفويض)، وكيف تعمل التذاكر الرقمية في بيئة المؤسسات.',
    descriptionEn: 'Understand Authentication vs Authorization and how enterprise domains issue tickets for trusted access.',
    estimatedMinutes: 15,
    iconName: 'Lock',
    primarySimulationId: 'active_directory',
    lessonIds: ['lesson-06-active-directory'],
  },
  {
    id: 7,
    slug: 'logs-soc',
    titleAr: '7. قراءة السجلات واكتشاف الأحداث الأمنية',
    titleEn: '7. Security Logs & SOC Monitoring',
    subtitleAr: 'سجلات الأحداث، مركز العمليات SOC وربط الإنذارات',
    subtitleEn: 'Event Logs, Security Operations Center (SOC) and Correlation',
    descriptionAr: 'تعلم كيف يراقب محلل الأمان النشاط المشبوه ويفكك محاولات الدخول الفاشلة المتكررة لاكتشاف هجمات التخمين.',
    descriptionEn: 'Learn how security analysts monitor alerts, correlate logs, and spot brute-force attacks in real time.',
    estimatedMinutes: 18,
    iconName: 'Activity',
    primarySimulationId: 'soc',
    lessonIds: ['lesson-07-soc-monitoring'],
  },
  {
    id: 8,
    slug: 'investigation-forensics',
    titleAr: '8. مقدمة إلى التحقيق الجنائي الرقمي',
    titleEn: '8. Digital Forensics & Incident Investigation',
    subtitleAr: 'جمع الأدلة، تتبع الآثار واستعادة ما حدث',
    subtitleEn: 'Evidence Collection, Artifact Analysis and Timeline Reconstruction',
    descriptionAr: 'كيف تكتشف ما حدث بعد وقوع الحادث الأمني؟ حلل بقايا البرمجيات الخبيثة وسجلات النظام بدقة جنائية.',
    descriptionEn: 'Learn how forensic investigators reconstruct past breaches and collect indisputable digital evidence.',
    estimatedMinutes: 18,
    iconName: 'FileSearch',
    primarySimulationId: 'forensics',
    lessonIds: ['lesson-08-forensics'],
  },
  {
    id: 9,
    slug: 'cloud-devsecops',
    titleAr: '9. أمن السحابة والحاويات وDevSecOps',
    titleEn: '9. Cloud, Containers & DevSecOps Security',
    subtitleAr: 'تأمين التطبيقات الحديثة وخطوط البناء الآلية',
    subtitleEn: 'Securing Modern Cloud Workloads and CI/CD Pipelines',
    descriptionAr: 'تعرف على فحص الكود الآلي (SAST)، واكتشاف المفاتيح المسربة في Git، وعزل الحاويات البرمجية.',
    descriptionEn: 'Discover automated source code scanning, leaked secrets detection, and secure container boundaries.',
    estimatedMinutes: 20,
    iconName: 'Cloud',
    primarySimulationId: 'devsecops',
    lessonIds: ['lesson-09-devsecops'],
  },
  {
    id: 10,
    slug: 'enterprise-cyber-range',
    titleAr: '10. التدريب الشامل في الميدان السيبراني',
    titleEn: '10. The Unified Enterprise Cyber Range',
    subtitleAr: 'المؤسسة المتكاملة: أجهزة العمل، الخوادم والشبكة التفاعلية',
    subtitleEn: 'Complete Enterprise Environment: Workstations, Servers & Real Switching',
    descriptionAr: 'اجمع كل ما تعلمته في بيئة مؤسسية تفاعلية حقيقية تضم المتحكم بالنطاق DC01 وخادم الملفات وأجهزة المستخدمين.',
    descriptionEn: 'Synthesize everything you have learned in a live enterprise twin running domain controllers, file shares, and user PCs.',
    estimatedMinutes: 25,
    iconName: 'Building',
    primarySimulationId: 'range',
    lessonIds: ['lesson-10-cyber-range'],
  },
];

export const CURRICULUM_LESSONS: Record<string, CurriculumLesson> = {
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
    worldId: 1,
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
    milestoneId: 2,
    order: 2,
    titleAr: 'الدرس الثاني: كيف يحمي نظام التشغيل نفسه وبرامجه؟',
    titleEn: 'Lesson 2: OS Privilege Isolation & System Internals',
    whyItMattersAr: 'إذا استطاع أي برنامج عادي تعديل ذاكرة النظام الأساسية، فسيتمكن المخترق من السيطرة الكاملة على جهازك.',
    whyItMattersEn: 'If any regular program could rewrite core OS memory, an attacker could seize total administrative control over the machine.',
    estimatedMinutes: 15,
    simulationId: 'system_internals',
    worldId: 2,
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
      nextLessonId: 'lesson-03-subnet-routing',
      takeawayAr: 'ممتاز! فهمت الآن كيف يحمي الحاسوب نفسه داخليًا. حان الوقت لنتعلم كيف تتواصل الحواسيب عبر الشبكات في الدرس الثالث.',
      takeawayEn: 'Great job! Now you understand internal host security. Next, discover how machines communicate securely over networks.',
    },
  },

  'lesson-03-subnet-routing': {
    id: 'lesson-03-subnet-routing',
    milestoneId: 3,
    order: 3,
    titleAr: 'الدرس الثالث: فهم الشبكات وعناوين IP والتوجيه',
    titleEn: 'Lesson 3: Network Fundamentals & IP Routing',
    whyItMattersAr: 'لا يوجد أمن سيبراني بدون شبكات؛ فكل هجوم وكل دفاع يعبر من خلال حزم البيانات وعناوين الشبكة.',
    whyItMattersEn: 'Cybersecurity revolves around networks; virtually every cyber attack and defensive response flows through packets and IP routes.',
    estimatedMinutes: 15,
    simulationId: 'subnet_routing',
    worldId: 3,
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
    milestoneId: 4,
    order: 4,
    titleAr: 'الدرس الرابع: جدران الحماية الرقمية وقواعد الفحص (Firewall ACL)',
    titleEn: 'Lesson 4: Digital Firewalls & Access Control Rules',
    whyItMattersAr: 'جدار الحماية هو الحارس الواقف على باب قلعتك الرقمية؛ يحدد من يدخل ومن يُطرد فورًا.',
    whyItMattersEn: 'The firewall is the vigilant guard at the gate of your digital fortress, deciding who enters and who gets turned away.',
    estimatedMinutes: 15,
    simulationId: 'firewall',
    worldId: 4,
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
    milestoneId: 5,
    order: 5,
    titleAr: 'الدرس الخامس: مقدمة إلى التشفير ودوال التجزئة (SHA-256)',
    titleEn: 'Lesson 5: Cryptography & Cryptographic Hash Functions',
    whyItMattersAr: 'التشفير هو الدرع الرياضي الذي يجعل التجارة الإلكترونية والمصارف والتواصل الآمن ممكنة عبر الإنترنت.',
    whyItMattersEn: 'Cryptography is the mathematical shield that makes e-commerce, banking, and private communication possible online.',
    estimatedMinutes: 15,
    simulationId: 'crypto',
    worldId: 5,
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
    milestoneId: 6,
    order: 6,
    titleAr: 'الدرس السادس: إدارة الهويات والمصادقة في المؤسسات (Active Directory & Kerberos)',
    titleEn: 'Lesson 6: Enterprise Identity, Active Directory & Kerberos',
    whyItMattersAr: 'في الشركات الكبرى، لا ننشئ حسابًا يدويًا في كل جهاز؛ بل تدير الهوية المركزية آلاف الموظفين وتحدد صلاحياتهم بدقة.',
    whyItMattersEn: 'In large enterprises, you do not configure individual user accounts on each PC; central identity governs thousands of employees with least privilege.',
    estimatedMinutes: 15,
    simulationId: 'active_directory',
    worldId: 6,
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
      checkType: 'interactive_simulation',
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
    milestoneId: 7,
    order: 7,
    titleAr: 'الدرس السابع: مركز العمليات الأمنية (SOC) وقراءة السجلات',
    titleEn: 'Lesson 7: SOC Operations & Security Log Monitoring',
    whyItMattersAr: 'الأنظمة تسجل كل شيء؛ ومهمة محلل الأمان هي العثور على الإبرة في كومة القش لاكتشاف الاختراق قبل فوات الأوان.',
    whyItMattersEn: 'Every digital event generates a log; a SOC analyst’s job is finding the needle in the haystack before an intrusion turns catastrophic.',
    estimatedMinutes: 18,
    simulationId: 'soc',
    worldId: 7,
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
      checkType: 'interactive_simulation',
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
    milestoneId: 8,
    order: 8,
    titleAr: 'الدرس الثامن: التحقيق الجنائي الرقمي وجمع الأدلة (Digital Forensics)',
    titleEn: 'Lesson 8: Digital Forensics & Evidence Investigation',
    whyItMattersAr: 'عند وقوع جريمة سيبرانية، لا يكفي إصلاح الضرر؛ يجب تقديم أدلة قطعية لا يمكن دحضها تثبت كيف وقع الحادث ومن المسؤول.',
    whyItMattersEn: 'When a cyber incident occurs, fixing the damage is only half the battle; investigators must preserve indisputable evidence proving what happened.',
    estimatedMinutes: 18,
    simulationId: 'forensics',
    worldId: 8,
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
      checkType: 'interactive_simulation',
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
    milestoneId: 9,
    order: 9,
    titleAr: 'الدرس التاسع: أمن التطبيقات السحابية والحاويات وDevSecOps',
    titleEn: 'Lesson 9: Cloud, Containers & DevSecOps Security',
    whyItMattersAr: 'إصلاح الثغرة وهي في مرحلة كتابة الكود أرخص 100 مرة من إصلاحها بعد اختراق خوادم الإنتاج السحابية.',
    whyItMattersEn: 'Patching a security flaw during code development is 100x cheaper than remediating a breach on live cloud servers.',
    estimatedMinutes: 20,
    simulationId: 'devsecops',
    worldId: 9,
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
      checkType: 'interactive_simulation',
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
      nextLessonId: 'lesson-10-cyber-range',
      takeawayAr: 'رائع لأبعد حد! لقد أكملت 9 محطات تأسيسية متكاملة. الآن حان موعد التتويج: الدخول إلى الميدان السيبراني الشامل (Cyber Range) لتطبيق كل ما تعلمته في بيئة مؤسسية تفاعلية كاملة!',
      takeawayEn: 'Phenomenal progress! You have conquered 9 foundational milestones. Now enter the culmination: The Enterprise Cyber Range (Lesson 10)!',
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
      checkType: 'interactive_simulation',
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
