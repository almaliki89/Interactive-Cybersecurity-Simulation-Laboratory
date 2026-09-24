import { MacroDomain, WorldDefinition, LearningPath } from '../types/universe';

export const MACRO_DOMAINS: MacroDomain[] = [
  {
    id: 'A',
    code: 'FOUNDATIONS',
    nameAr: 'أسس ومفاهيم الأمن والأنظمة',
    nameEn: 'Foundations & Core Systems',
    subtitleAr: 'النموذج الذهني للأمن، ثالوث CIA، عمارة الحاسوب والمخاطر',
    subtitleEn: 'Mental Models, CIA Triad, Computer Architecture & Risk',
    descriptionAr: 'بناء الأساس التقني والفكري لفهم كيفية عمل الحواسيب والأنظمة وتحديد المخاطر والثغرات وسطوح الهجوم.',
    descriptionEn: 'Establish the core mental models of assets, threats, hardware internals, and risk calculation.',
    color: 'from-cyan-500 to-blue-600',
    worldIds: [1, 2, 48, 50],
  },
  {
    id: 'B',
    code: 'INFRASTRUCTURE',
    nameAr: 'الشبكات والبنية التحتية والأنظمة',
    nameEn: 'Infrastructure & Operating Systems',
    subtitleAr: 'بروتوكولات TCP/IP، تقسيم الشبكات، لينكس، ويندوز، وActive Directory',
    subtitleEn: 'TCP/IP Protocols, Subnetting, Linux, Windows & Active Directory',
    descriptionAr: 'استكشاف حركة البيانات، توجيه الحزم، جدران الحماية، وإدارة بيئات المؤسسات وأنظمة لينكس وويندوز.',
    descriptionEn: 'Deep interactive mastery over packet flow, routing, OS internals, and enterprise Directory Services.',
    color: 'from-blue-500 to-indigo-600',
    worldIds: [3, 4, 5, 6, 7, 42],
  },
  {
    id: 'C',
    code: 'APPSEC',
    nameAr: 'أمن التطبيقات والويب والبرمجة',
    nameEn: 'Application Security & Web',
    subtitleAr: 'تقنيات الويب، دورة HTTP، أمن واجهات البرمجة API، والبرمجة الآمنة',
    subtitleEn: 'Web Architecture, HTTP Lifecycle, API Security & Secure Coding',
    descriptionAr: 'فهم معمارية الويب، منع الثغرات البرمجية، تأمين بوابات API، وبناء برمجيات مقاومة للاستغلال.',
    descriptionEn: 'Interactive inspection of web pipelines, input validation, token auth, and secure SDLC.',
    color: 'from-indigo-500 to-purple-600',
    worldIds: [8, 9, 10, 11, 12, 13, 14],
  },
  {
    id: 'D',
    code: 'CRYPTO_IAM',
    nameAr: 'علم التشفير وإدارة الهوية والوصول',
    nameEn: 'Cryptography & Identity (IAM)',
    subtitleAr: 'التشفير المتناظر، الشهادات الرقمية PKI، التوقيع الرقمي، المصادقة MFA، وRBAC',
    subtitleEn: 'PKI, Symmetric & Asymmetric Crypto, Digital Signatures, MFA & Access Control',
    descriptionAr: 'حماية سرية وسلامة البيانات، التحقق من سلاسل الثقة، إدارة الصلاحيات وسياسات الوصول المتدرجة.',
    descriptionEn: 'Mathematical foundations of secrecy, certificate chains, OAuth/OIDC, and Zero Trust identity.',
    color: 'from-purple-500 to-pink-600',
    worldIds: [15, 16, 17, 39, 40],
  },
  {
    id: 'E',
    code: 'CLOUD_DEVOPS',
    nameAr: 'الحوسبة السحابية والحاويات وDevSecOps',
    nameEn: 'Cloud, Containers & DevSecOps',
    subtitleAr: 'معمارية السحابة، حاويات Docker، كوبرنيتيس K8s، وسلاسل التوريد البرمجية',
    subtitleEn: 'Cloud Security, Docker, Kubernetes Isolation, CI/CD & Software Supply Chain',
    descriptionAr: 'تأمين البنى السحابية الحديثة، عزل مساحات الحاويات، وسياسات شبكات K8s وتأمين خطوط الإنتاج البرمجي.',
    descriptionEn: 'Secure modern cloud architectures, microsegmentation, container runtimes, and CI/CD pipelines.',
    color: 'from-pink-500 to-rose-600',
    worldIds: [18, 19, 20, 21, 22, 23, 44],
  },
  {
    id: 'F',
    code: 'SECOPS',
    nameAr: 'مركز العمليات الأمنية ورصد التهديدات',
    nameEn: 'Security Operations & Detection',
    subtitleAr: 'عمليات SOC، معالجة السجلات SIEM، هندسة الاكتشاف، أمن النقاط النهائية EDR/XDR',
    subtitleEn: 'SOC Analyst Workflows, SIEM Correlation, Detection Engineering & EDR Telemetry',
    descriptionAr: 'معالجة تدفق السجلات الحية، بناء قواعد الارتباط الذكية، رصد الأنماط المريبة، واحتواء التهديدات.',
    descriptionEn: 'Live multi-sensor event ingestion, threat correlation rules, and behavioral telemetry analysis.',
    color: 'from-rose-500 to-amber-600',
    worldIds: [24, 25, 26, 27, 28, 46, 47],
  },
  {
    id: 'G',
    code: 'INVESTIGATION',
    nameAr: 'التحقيق الجنائي والاستجابة للحوادث',
    nameEn: 'Incident Response & Forensics',
    subtitleAr: 'الاستجابة للحوادث، الأدلة الجنائية الرقمية، صيد التهديدات، وسلوكيات البرمجيات الخبيثة',
    subtitleEn: 'Incident Containment, Digital Forensics Timelines, Threat Hunting & Malware Sandboxing',
    descriptionAr: 'إعادة بناء الخط الزمني للهجمات، تحليل الآثار الرقمية في الذاكرة والأقراص، واحتواء الحوادث المعقدة.',
    descriptionEn: 'Reconstruct multi-stage attack timelines, analyze volatile artifacts, and hunt active adversaries.',
    color: 'from-amber-500 to-emerald-600',
    worldIds: [29, 30, 31, 32, 33, 34],
  },
  {
    id: 'H',
    code: 'ENGINEERING',
    nameAr: 'الهندسة المعمارية وانعدام الثقة',
    nameEn: 'Security Architecture & Zero Trust',
    subtitleAr: 'بناء المعماريات الآمنة، سياسات Zero Trust، إدارة الثغرات، واختبار الأمان',
    subtitleEn: 'Enterprise Architecture, Zero Trust Decisions, Vulnerability Prioritization & Testing',
    descriptionAr: 'تصميم مناطق الثقة، فرض التحقق المستمر، وإدارة دورة حياة الثغرات الأمنية وتقييم المخاطر.',
    descriptionEn: 'Design resilient trust boundaries, enforce least privilege, and orchestrate holistic defense.',
    color: 'from-emerald-500 to-teal-600',
    worldIds: [35, 36, 37, 38],
  },
  {
    id: 'I',
    code: 'SPECIALIZED',
    nameAr: 'المجالات الأمنية المتخصصة والناشئة',
    nameEn: 'Specialized & Emerging Security',
    subtitleAr: 'أمن البريد، الهواتف الذكية، إنترنت الأشياء IoT، الأنظمة الصناعية OT/ICS، وأمن الذكاء الاصطناعي AI',
    subtitleEn: 'Email Security, Mobile, IoT, OT / SCADA Systems, and AI Security Architecture',
    descriptionAr: 'تأمين التقنيات المتخصصة مثل بروتوكولات البريد، شبكات المصانع الحساسة، ونماذج الذكاء الاصطناعي.',
    descriptionEn: 'Protect specialized attack surfaces spanning physical cyber systems, industrial grids, and AI pipelines.',
    color: 'from-teal-500 to-cyan-600',
    worldIds: [41, 43, 45, 55, 56, 57],
  },
  {
    id: 'J',
    code: 'GOVERNANCE_RANGE',
    nameAr: 'الحوكمة والميدان السيبراني المتكامل',
    nameEn: 'Governance, Resilience & Cyber Range',
    subtitleAr: 'الحوكمة والامتثال، استمرارية الأعمال، والميدان السيبراني الشامل (World 60)',
    subtitleEn: 'Governance, Compliance, Business Continuity & The Full Enterprise Cyber Range',
    descriptionAr: 'ربط الاستراتيجية الأمنية بالتطبيق التقني، ومحاكاة عمليات المؤسسة الرقمية الحية في الميدان السيبراني.',
    descriptionEn: 'Bridge governance controls with real-world defensive operations in the unified enterprise range.',
    color: 'from-cyan-600 to-indigo-700',
    worldIds: [49, 51, 52, 53, 54, 58, 59, 60],
  },
];

export const WORLDS_REGISTRY: Record<number, WorldDefinition> = {
  1: {
    id: 1,
    slug: 'foundations-cia',
    macroDomainId: 'A',
    titleAr: 'أسس الأمن السيبراني وثالوث CIA',
    titleEn: 'Cybersecurity Foundations & CIA Triad',
    subtitleAr: 'السرية، السلامة، والتوافر — الأصول والمخاطر وسطح الهجوم',
    subtitleEn: 'Confidentiality, Integrity, Availability, Assets & Attack Surface',
    descriptionAr: 'نموذج محاكاة تفاعلي لمؤسسة رقمية: اختبر كسر وإصلاح محاور السرية والسلامة والتوافر وشاهد أثر الخطر فوراً.',
    descriptionEn: 'Interactive digital organization simulator: manipulate Confidentiality, Integrity, and Availability controls.',
    difficulty: 'Beginner',
    simulationType: 'cia_triad',
    iconName: 'Shield',
    prerequisites: [],
    relatedWorlds: [2, 15, 38, 50],
    concepts: [
      {
        id: 'cia_triad',
        nameAr: 'ثالوث CIA الأمني',
        nameEn: 'CIA Security Triad',
        briefAr: 'الركائز الثلاث للأمن: السرية (منع الوصول غير المصرح)، السلامة (منع التعديل غير المصرح)، والتوافر (ضمان استمرارية الخدمة).',
        briefEn: 'The 3 pillars: Confidentiality (prevent disclosure), Integrity (prevent unauthorized tampering), and Availability (ensure uptime).',
        securityRelevanceAr: 'أي هجوم سيبراني في العالم يستهدف واحدة أو أكثر من هذه الركائز الثلاث.',
        securityRelevanceEn: 'Every cyber attack fundamentally degrades one or more of these three pillars.',
        controlsAr: ['التشفير', 'التجزئة والتوقيع الرقمي', 'تكرار الخوادم والتخزين الاحتياطي'],
        controlsEn: ['Encryption', 'Hashing & Signatures', 'Redundancy & Load Balancing'],
      },
      {
        id: 'risk_formula',
        nameAr: 'معادلة تقييم المخاطر',
        nameEn: 'Risk Calculation Model',
        briefAr: 'الخطر = الأصل × التهديد × الثغرة × الأثر ÷ الضوابط الدفاعية.',
        briefEn: 'Risk = Asset Criticality × Threat Probability × Vulnerability Exposure ÷ Controls.',
        securityRelevanceAr: 'فهم لماذا يتغير مستوى الخطر ديناميكياً عند إضافة ضابط حماية أو ظهور ثغرة جديدة.',
        securityRelevanceEn: 'Visualize why risk level fluctuates when mitigations are applied or new exploits emerge.',
        controlsAr: ['تطبيق ضوابط الحماية', 'تقليل سطح الهجوم', 'نقل الخطر بالتأمين'],
        controlsEn: ['Control Enforcement', 'Attack Surface Reduction', 'Risk Transfer'],
      },
    ],
    practicalObjectivesAr: [
      'تعديل إعدادات التشفير وملاحظة أثرها على السرية',
      'محاكاة تعديل قاعدة البيانات ورصد انهيار السلامة',
      'توليد حمل زائد واختبار آليات التوافر وتكرار الخوادم',
    ],
    practicalObjectivesEn: [
      'Toggle encryption to observe confidentiality exposure',
      'Simulate data tampering and witness integrity alerts',
      'Overload services to test availability redundancy',
    ],
    challengeTitleAr: 'تحدي موازنة ثالوث CIA وتخفيض الخطر المؤسسي',
    challengeTitleEn: 'CIA Triad Balance & Risk Reduction Challenge',
  },
  2: {
    id: 2,
    slug: 'computer-internals',
    macroDomainId: 'A',
    titleAr: 'أساسيات وعمارة الحواسيب والذاكرة',
    titleEn: 'Computer Systems & Memory Architecture',
    subtitleAr: 'العمليات، الخيوط، نواة النظام، ومساحات الذاكرة Stack و Heap',
    subtitleEn: 'Processes, System Calls, Kernel vs User Space & Stack/Heap',
    descriptionAr: 'استكشف ما يدور داخل الحاسوب: كيف تنتقل التطبيقات من كود إلى عمليات في الذاكرة وكيف يتعامل المعالج ونواة النظام مع الموارد.',
    descriptionEn: 'Inspect the living computer: follow execution from process spawning to memory segments and syscalls.',
    difficulty: 'Beginner',
    simulationType: 'system_internals',
    iconName: 'Cpu',
    prerequisites: [1],
    relatedWorlds: [5, 6, 27, 32],
    concepts: [
      {
        id: 'user_kernel_space',
        nameAr: 'الفصل بين مساحة المستخدم ومساحة النواة',
        nameEn: 'User Space vs Kernel Space',
        briefAr: 'تعمل التطبيقات في وضع محدود الصلاحيات، وتطلب خدمات العتاد عبر استدعاءات النظام (System Calls).',
        briefEn: 'User applications run in restricted rings and request hardware access via controlled system calls.',
        securityRelevanceAr: 'عزل مساحة النواة يمنع البرمجيات الخبيثة من السيطرة المباشرة على العتاد والذاكرة.',
        securityRelevanceEn: 'Kernel isolation stops malicious payloads from gaining unrestricted hardware control.',
        controlsAr: ['حلقات الحماية في المعالج (Ring 0 vs Ring 3)', 'تنفيذ البرامج بدون صلاحيات الجذر'],
        controlsEn: ['CPU Protection Rings', 'Non-privileged Execution'],
      },
      {
        id: 'memory_layout',
        nameAr: 'تخطيط الذاكرة (Stack & Heap)',
        nameEn: 'Memory Layout (Stack & Heap)',
        briefAr: 'المكدس (Stack) للمتغيرات المحلية واستدعاء الدوال، والكومة (Heap) للذاكرة الديناميكية.',
        briefEn: 'Stack stores local frames and return pointers; Heap manages dynamic runtime allocations.',
        securityRelevanceAr: 'فهم الثغرات مثل طفحان المخزن المؤقت (Buffer Overflow) واستغلال الذاكرة.',
        securityRelevanceEn: 'Foundation for understanding memory corruption, overflow attacks, and ASLR.',
        controlsAr: ['حماية المكدس (Stack Canaries)', 'عشوائية فضاء العناوين (ASLR)', 'منع التنفيذ (DEP / NX)'],
        controlsEn: ['Stack Canaries', 'ASLR', 'DEP / NX Bit'],
      },
    ],
    practicalObjectivesAr: [
      'تتبع دورة حياة العملية من التشغيل إلى تخصيص الذاكرة',
      'فحص استدعاءات النظام (Syscalls) بين التطبيق ونواة النظام',
      'مراقبة عزل الذاكرة بين العمليات المستقلة',
    ],
    practicalObjectivesEn: [
      'Trace process lifecycle from launch to memory mapping',
      'Inspect system calls between userland and kernel',
      'Observe process memory boundary enforcement',
    ],
    challengeTitleAr: 'مختبر فحص العمليات واستدعاءات النظام',
    challengeTitleEn: 'Process Spawning & Syscall Inspection Lab',
  },
  3: {
    id: 3,
    slug: 'networking-fundamentals',
    macroDomainId: 'B',
    titleAr: 'أساسيات الشبكات وتقسيم Subnetting والتوجيه',
    titleEn: 'Networking, Subnetting & Routing',
    subtitleAr: 'حزم IP، بروتوكولات TCP/UDP، حاسبة CIDR، وجداول التوجيه وNAT',
    subtitleEn: 'IP Packets, TCP/UDP, CIDR Subnets, Routing Tables & NAT Gateway',
    descriptionAr: 'صمم شبكات فرعية، وتتبع مسار الحزم عبر الموجهات (Routers)، وشاهد ترجمة العناوين (NAT) في الوقت الفعلي.',
    descriptionEn: 'Interactive subnet designer, dynamic multi-hop packet routing, and NAT translation visualizer.',
    difficulty: 'Beginner',
    simulationType: 'subnet_routing',
    iconName: 'Network',
    prerequisites: [1],
    relatedWorlds: [4, 8, 18, 38],
    concepts: [
      {
        id: 'subnetting_cidr',
        nameAr: 'تقسيم الشبكات وحسابات CIDR',
        nameEn: 'Subnetting & CIDR Calculation',
        briefAr: 'تقسيم شبكات IP الكبيرة إلى شبكات فرعية أصغر للتحكم بالأداء وتقليل نطاق البث.',
        briefEn: 'Dividing IP blocks into smaller logical segments for security boundaries and routing efficiency.',
        securityRelevanceAr: 'عزل الأجهزة الحساسة في نطاقات فرعية يمنع المهاجم من التحرك الجانبي السهل.',
        securityRelevanceEn: 'Isolating critical servers in dedicated subnets prevents trivial lateral movement.',
        controlsAr: ['تقسيم الشبكات الفرعية', 'قوائم التحكم بالوصول بين النطاقات'],
        controlsEn: ['Subnet Isolation', 'Inter-VLAN ACLs'],
      },
      {
        id: 'nat_gateway',
        nameAr: 'ترجمة عناوين الشبكة (NAT Gateway)',
        nameEn: 'Network Address Translation (NAT)',
        briefAr: 'ترجمة عناوين IP الخاصة (Private IP) إلى عنوان عام (Public IP) للاتصال بالإنترنت.',
        briefEn: 'Mapping private intranet IPs and ports to public egress IPs for Internet communication.',
        securityRelevanceAr: 'إخفاء البنية الداخلية للشبكة عن الفحص الخارجي المباشر من الإنترنت.',
        securityRelevanceEn: 'Hides internal node IP topologies from direct inbound WAN reconnaissance.',
        controlsAr: ['بوابة NAT أحادية الاتجاه', 'حظر المنافذ الواردة غير المترجمة'],
        controlsEn: ['Egress-only NAT Gateways', 'Stateful Ingress Rejection'],
      },
    ],
    practicalObjectivesAr: [
      'تقسيم نطاق /24 إلى شبكات فرعية أصغر وتحديد عناوين الشبكة والبث',
      'تعديل جدول التوجيه لتوجيه حزم البيانات عبر الموجه المناسب',
      'مراقبة جدول جلسات NAT عند خروج الحزم إلى الإنترنت',
    ],
    practicalObjectivesEn: [
      'Split a /24 block into subnets and calculate broadcast boundaries',
      'Modify router tables to route packets through optimal hops',
      'Inspect NAT state table as private hosts communicate with WAN',
    ],
    challengeTitleAr: 'تحدي تصميم الشبكات الفرعية وتوجيه الحزم بأمان',
    challengeTitleEn: 'Secure Subnet Design & Routing Challenge',
  },
  4: {
    id: 4,
    slug: 'network-security-firewall',
    macroDomainId: 'B',
    titleAr: 'أمن محيط الشبكة وجدران الحماية وأنظمة IDS/IPS',
    titleEn: 'Network Security, Firewalls & IDS/IPS',
    subtitleAr: 'قوائم التحكم بالوصول ACL، ترشيح الحزم، وعزل الشبكات ومراقبة التسلل',
    subtitleEn: 'Stateful Firewall ACLs, Network Segmentation, DMZ & IDS/IPS Sensors',
    descriptionAr: 'قم بإعداد قواعد جدار الحماية، وفصل شبكة المستخدمين عن الخوادم في منطقة معزولة (DMZ)، واكتشف هجمات التسلل.',
    descriptionEn: 'Configure sequential firewall ACLs, isolate DMZ architectures, and inspect IDS/IPS deep packet alerts.',
    difficulty: 'Intermediate',
    simulationType: 'firewall',
    iconName: 'ShieldCheck',
    prerequisites: [3],
    relatedWorlds: [3, 24, 25, 37],
    concepts: [
      {
        id: 'firewall_acl',
        nameAr: 'قوائم التحكم في الوصول (ACLs)',
        nameEn: 'Access Control Lists (ACLs)',
        briefAr: 'مجموعة قواعد متسلسلة تفحص عناوين المصدر والوجهة والمنافذ وتنفذ إجراء السماح أو الحظر عند أول تطابق.',
        briefEn: 'Sequential rules evaluating source/dest IPs, ports, and protocols with first-match enforcement.',
        securityRelevanceAr: 'خط الدفاع الأول لمنع حركة المرور الخبيثة أو المنافذ غير المشفرة مثل Telnet و SMB.',
        securityRelevanceEn: 'Primary perimeter barrier rejecting unauthorized ingress protocols and ports.',
        controlsAr: ['سياسة الحظر الافتراضية Default Drop', 'حصر إدارة SSH على الشبكة الداخلية'],
        controlsEn: ['Default Deny All Policy', 'Restricted Management Ports'],
      },
      {
        id: 'ids_vs_ips',
        nameAr: 'نظام كشف التسلل (IDS) ونظام منع التسلل (IPS)',
        nameEn: 'IDS vs IPS Sensors',
        briefAr: 'نظام IDS يراقب ويسجل الإنذارات دون اعتراض، بينما نظام IPS يعترض ويُسقط الحزم الخبيثة في مسار الحركة.',
        briefEn: 'IDS acts as a passive tap issuing alerts; IPS sits in-line actively dropping malicious packets.',
        securityRelevanceAr: 'اكتشاف الهجمات المتقدمة في طبقات التطبيقات وحزم البيانات المشبوهة.',
        securityRelevanceEn: 'Deep packet inspection alerting on exploit signatures and anomalous payloads.',
        controlsAr: ['توقيعات الهجمات المحدثة (Snort / Suricata)', 'الاستجابة التلقائية للتهديدات'],
        controlsEn: ['Signature Rulesets', 'Automated Inline Blocking'],
      },
    ],
    practicalObjectivesAr: [
      'كتابة وترتيب قواعد جدار الحماية وفق سياسة الأسبقية الصحيحة',
      'فصل الخوادم العامة في DMZ لمنع اختراق الشبكة الداخلية',
      'مراقبة كشف هجمات فحص المنافذ والتصدي لها في الوقت الفعلي',
    ],
    practicalObjectivesEn: [
      'Order firewall policies to enforce first-match security logic',
      'Isolate public services in DMZ to protect internal nodes',
      'Observe IDS detection and IPS inline blocking of attacks',
    ],
    challengeTitleAr: 'مهمة تحصين محيط الشبكة ومنع المنافذ غير المصرح بها',
    challengeTitleEn: 'Perimeter Defense & Ingress Hardening Challenge',
  },
  5: {
    id: 5,
    slug: 'linux-security',
    macroDomainId: 'B',
    titleAr: 'أمن أنظمة تشغيل لينكس والتحكم بالوصول (DAC)',
    titleEn: 'Linux OS Security & Access Control',
    subtitleAr: 'شجرة المجلدات، مصفوفة الصلاحيات (rwx)، المستخدمون والخدمات والتصعيد',
    subtitleEn: 'Filesystem Hierarchy, Octal (rwx) Permissions, Services & Hardening',
    descriptionAr: 'مختبر نظام تشغيل لينكس التفاعلي: استكشف هيكل المجلدات الحساسة (/etc/shadow)، واحسب الصلاحيات بالنظام الثُماني واختبر رفض الوصول.',
    descriptionEn: 'Interactive Linux environment: explore core filesystem paths, octal permission calculator, and kernel EACCES enforcement.',
    difficulty: 'Beginner',
    simulationType: 'linux',
    iconName: 'Terminal',
    prerequisites: [2],
    relatedWorlds: [2, 6, 27, 30],
    concepts: [
      {
        id: 'linux_dac',
        nameAr: 'التحكم بالوصول التقديري (DAC)',
        nameEn: 'Discretionary Access Control (DAC)',
        briefAr: 'مصفوفة من 9 بتات مقسمة بين المالك (User) والمجموعة (Group) والآخرين (Others) للتحكم بالقراءة والكتابة والتنفيذ.',
        briefEn: '9-bit permission matrix determining Read, Write, and Execute rights for User, Group, and Others.',
        securityRelevanceAr: 'منح صلاحيات زائدة لفئة Others يؤدي إلى تسريب الملفات الحساسة وسرقة تجزئات كلمات المرور.',
        securityRelevanceEn: 'Permissive world-writable or world-readable bits allow unprivileged credential theft.',
        controlsAr: ['أمر chmod لتحديد الصلاحيات', 'قناع الإنشاء التلقائي umask', 'إلغاء بتات SUID غير الضرورية'],
        controlsEn: ['chmod Restrictive Modes', 'Secure umask (027)', 'Auditing SUID Binaries'],
      },
    ],
    practicalObjectivesAr: [
      'ضبط صلاحيات ملفات النظام الحساسة لمنع وصول فئة الآخرين',
      'استخدام الحاسبة الثُمانية للتحويل بين التمثيل الرمزي والرقمي',
      'اختبار محاولات الوصول بحسابات مستخدمين مختلفة ورصد رفض النواة (EACCES)',
    ],
    practicalObjectivesEn: [
      'Harden sensitive system files against world-readable exposure',
      'Convert between symbolic (rwxr-x---) and octal (750) notations',
      'Test user access checks against kernel permission logic',
    ],
    challengeTitleAr: 'تحدي تحصين ملف /etc/shadow وحماية النظام من التسريب',
    challengeTitleEn: 'Linux File Permissions & Hardening Challenge',
  },
  6: {
    id: 6,
    slug: 'windows-security',
    macroDomainId: 'B',
    titleAr: 'أمن أنظمة ويندوز وسجل الأحداث (Event Viewer)',
    titleEn: 'Windows OS Security & Event Logs',
    subtitleAr: 'معمارية ويندوز، صلاحيات NTFS، سجل النظام، وأحداث الأمان 4624 و 4625',
    subtitleEn: 'Windows Architecture, NTFS ACLs, Registry, and Security Event IDs',
    descriptionAr: 'استكشف عمارة ويندوز الأمنية، وفحص سجلات الأحداث الحقيقية لتتبع تسجيل الدخول الفاشل والناجح وإنشاء العمليات.',
    descriptionEn: 'Interactive Windows security model: explore NTFS permissions, Registry hives, and investigate Windows Event Logs.',
    difficulty: 'Intermediate',
    simulationType: 'threat_hunting',
    iconName: 'AppWindow',
    prerequisites: [2],
    relatedWorlds: [5, 7, 24, 25, 27],
    concepts: [
      {
        id: 'windows_event_ids',
        nameAr: 'معرفات أحداث الأمان في ويندوز',
        nameEn: 'Windows Security Event IDs',
        briefAr: 'أحداث تدقيق حيوية مثل 4624 (تسجيل دخول ناجح)، 4625 (فشل تسجيل الدخول)، 4688 (إنشاء عملية جديدة).',
        briefEn: 'Critical audit events: 4624 (Logon Success), 4625 (Logon Failure), 4688 (Process Creation).',
        securityRelevanceAr: 'المصدر الأساسي للمحللين الأمنيين لاكتشاف هجمات التخمين والاختراق في بيئات ويندوز.',
        securityRelevanceEn: 'Cornerstone of Windows threat detection, brute-force discovery, and forensic audits.',
        controlsAr: ['تفعيل سياسات التدقيق المتقدمة', 'إرسال السجلات إلى نظام SIEM مركزي'],
        controlsEn: ['Advanced Audit Policies', 'Centralized SIEM Forwarding'],
      },
    ],
    practicalObjectivesAr: [
      'تحليل سجلات الأحداث لربط محاولات الدخول الفاشلة المتتالية',
      'التحقق من إنشاء العمليات المريبة مثل PowerShell بأوامر مشفرة',
    ],
    practicalObjectivesEn: [
      'Correlate consecutive Event 4625 failures to detect brute-force',
      'Audit Event 4688 process creation for suspicious CLI arguments',
    ],
    challengeTitleAr: 'مختبر تحليل سجلات أحداث الأمان في ويندوز',
    challengeTitleEn: 'Windows Security Event Log Analysis Lab',
  },
  7: {
    id: 7,
    slug: 'active-directory',
    macroDomainId: 'B',
    titleAr: 'دليل النطاق النشط (Active Directory) وبروتوكول Kerberos',
    titleEn: 'Active Directory & Kerberos Protocol',
    subtitleAr: 'الغابة والمجال، وحدات OU، سياسات GPO، وتذاكر Kerberos (TGT و TGS)',
    subtitleEn: 'Forest/Domain Topology, GPO Policies, and Kerberos Ticket Flow (TGT / TGS)',
    descriptionAr: 'تتبع معمارية المؤسسات: انقر على كائنات المجال، وشاهد تبادل تذاكر مصادقة Kerberos خطوة بخطوة، وافحص تطبيق سياسات GPO.',
    descriptionEn: 'Interactive enterprise graph: visual Kerberos authentication exchange (AS-REQ -> TGT -> TGS -> Service Ticket) and GPO propagation.',
    difficulty: 'Advanced',
    simulationType: 'active_directory',
    iconName: 'FolderGit2',
    prerequisites: [3, 6, 17],
    relatedWorlds: [6, 16, 17, 24, 38],
    concepts: [
      {
        id: 'kerberos_tickets',
        nameAr: 'آلية عمل تذاكر مصادقة Kerberos',
        nameEn: 'Kerberos Ticket Exchange Flow',
        briefAr: 'المصادقة دون إرسال كلمة المرور عبر الشبكة: طلب TGT من خادم AS، ثم طلب تذكرة الخدمة TGS للوصول للخادم الهدف.',
        briefEn: 'Ticket-based auth without transmitting passwords: AS-REQ -> TGT -> TGS-REQ -> Service Ticket.',
        securityRelevanceAr: 'أساس أمان شبكات المؤسسات وحمايتها ضد هجمات سرقة التذاكر (Pass-the-Ticket و Kerberoasting).',
        securityRelevanceEn: 'Core enterprise identity protocol; target of Pass-the-Ticket, Golden Ticket, and Kerberoasting attacks.',
        controlsAr: ['تعقيد كلمات مرور حسابات الخدمات', 'تفعيل التدقيق على طلبات التذاكر المشبوهة', 'حماية خوادم Domain Controllers'],
        controlsEn: ['Strong Service Account Passwords', 'Kerberos Pre-auth Auditing', 'Tier 0 DC Isolation'],
      },
    ],
    practicalObjectivesAr: [
      'تتبع رحلة طلب تذكرة Kerberos من محطة العمل حتى خادم الملفات',
      'فحص كائنات المجال ووحدات OU وتطبيق سياسة GPO لتقييد الصلاحيات',
    ],
    practicalObjectivesEn: [
      'Step through Kerberos ticket generation from Client to DC to Service',
      'Inspect Active Directory OU hierarchy and verify GPO enforcement',
    ],
    challengeTitleAr: 'محاكي مصادقة Kerberos وتأمين بيئة Active Directory',
    challengeTitleEn: 'Active Directory Kerberos & GPO Simulation Lab',
  },
  8: {
    id: 8,
    slug: 'web-fundamentals',
    macroDomainId: 'C',
    titleAr: 'أساسيات تقنيات الويب ودورة طلب واستجابة HTTP',
    titleEn: 'Web Architecture & HTTP Full Lifecycle',
    subtitleAr: 'المتصفح، البروكسي العكسي Nginx، محرك التطبيقات Express، واستعلامات قواعد البيانات',
    subtitleEn: 'Browser Pipeline, Nginx Reverse Proxy, App Worker & Database Queries',
    descriptionAr: 'تتبع رحلة طلب الويب الكاملة: من كتابة الرابط في المتصفح، مروراً بحل DNS، ومصافحة TCP/TLS، وحتى معالجة الخادم وإرجاع كائن JSON برمز 200 OK.',
    descriptionEn: 'Trace the complete web request pipeline: Browser -> DNS -> TCP/TLS -> Reverse Proxy -> App Worker -> Database Query -> JSON Response.',
    difficulty: 'Beginner',
    simulationType: 'http',
    iconName: 'Globe',
    prerequisites: [3],
    relatedWorlds: [3, 9, 10, 15],
    concepts: [
      {
        id: 'http_lifecycle',
        nameAr: 'دورة حياة بروتوكول HTTP',
        nameEn: 'HTTP Request/Response Lifecycle',
        briefAr: 'بروتوكول عديم الحالة (Stateless) في طبقة التطبيقات يتبادل الترويسات ومحتوى البيانات وأكواد الحالة (200, 404, 500).',
        briefEn: 'Stateless application protocol exchanging headers, payloads, and status codes (2xx, 4xx, 5xx).',
        securityRelevanceAr: 'فهم الترويسات الأمنية (Security Headers) وكيفية تمرير البروكسي للبيانات يحمي من هجمات الحقن والتسريب.',
        securityRelevanceEn: 'Crucial for understanding security headers, cookies, and reverse proxy routing.',
        controlsAr: ['استخدام HTTPS حصراً', 'ترويسات الحماية (HSTS, CSP, X-Frame-Options)'],
        controlsEn: ['Strict HTTPS Enforcement', 'Security Headers (HSTS, CSP)'],
      },
    ],
    practicalObjectivesAr: [
      'إرسال طلب HTTP ومراقبة تدفق البيانات عبر الخادم الوكيل وقاعدة البيانات',
      'فحص ترويسات الاستجابة وأكواد الحالة (Status Codes)',
      'محاكاة أخطاء قاعدة البيانات ومراقبة رسائل الأخطاء الآمنة للمستخدم',
    ],
    practicalObjectivesEn: [
      'Dispatch HTTP requests and trace multi-tier proxy execution',
      'Inspect response headers and parameterized query payload',
      'Simulate backend database exceptions and verify safe error handling',
    ],
    challengeTitleAr: 'تحدي تتبع دورة طلب واستجابة HTTP متعددة الطبقات',
    challengeTitleEn: 'Full HTTP Lifecycle & Multi-Tier Architecture Lab',
  },
  9: {
    id: 9,
    slug: 'web-app-security',
    macroDomainId: 'C',
    titleAr: 'أمن تطبيقات الويب وفحص المدخلات (AppSec)',
    titleEn: 'Web Application Security & OWASP Defense',
    subtitleAr: 'التحقق من المدخلات، منع هجمات الحقن (SQLi/XSS)، وأمن الجلسات والكوكيز',
    subtitleEn: 'Input Validation, Output Encoding, SQL Injection Defense, XSS & Session Security',
    descriptionAr: 'مختبر تفاعلي لأمن التطبيقات: جرب تمرير مدخلات خبيثة، وفعل مرشحات التحقق ومعالجة المخرجات وشاهد كيف يتم إحباط الهجوم برمجياً.',
    descriptionEn: 'Interactive AppSec lab: test malicious input payloads, toggle parameterized queries and output sanitizers to neutralize exploits.',
    difficulty: 'Intermediate',
    simulationType: 'appsec_api',
    iconName: 'FileCode',
    prerequisites: [8],
    relatedWorlds: [8, 10, 12, 14],
    concepts: [
      {
        id: 'input_validation_sqli',
        nameAr: 'التحقق من المدخلات والاستعلامات المعلمية',
        nameEn: 'Input Sanitization & Parameterized Queries',
        briefAr: 'فصل البيانات عن كود الاستعلام لمنع المهاجم من التلاعب بمنطق استعلامات قاعدة البيانات.',
        briefEn: 'Separating untrusted user data from SQL command logic via parameterized queries.',
        securityRelevanceAr: 'الحل الجذري والنهائي لمنع ثغرات حقن SQL الخطيرة التي تهدد قواعد البيانات بالكامل.',
        securityRelevanceEn: 'Definitive control eradicating SQL injection vulnerabilities.',
        controlsAr: ['الاستعلامات المعلمية (Prepared Statements)', 'تنقية المدخلات عبر القوائم البيضاء'],
        controlsEn: ['Prepared Statements', 'Strict Whitelist Input Validation'],
      },
      {
        id: 'xss_defense',
        nameAr: 'الدفاع ضد ثغرات البرمجة عبر المواقع (XSS)',
        nameEn: 'Cross-Site Scripting (XSS) Defense',
        briefAr: 'ترميز المخرجات (Output Encoding) بحيث يتعامل المتصفح مع النصوص كبيانات عادية وليس كأكواد تنفيذية.',
        briefEn: 'Context-aware output encoding ensuring user data is rendered safely as text, not script.',
        securityRelevanceAr: 'منع المهاجمين من سرقة كوكيز الجلسة أو تنفيذ أوامر في متصفحات المستخدمين الضحايا.',
        securityRelevanceEn: 'Prevents session token theft, DOM manipulation, and credential harvesting.',
        controlsAr: ['ترميز المخرجات في HTML', 'خاصية HttpOnly في الكوكيز', 'سياسة أمان المحتوى (CSP)'],
        controlsEn: ['Contextual HTML Encoding', 'HttpOnly Cookie Flag', 'Content Security Policy (CSP)'],
      },
    ],
    practicalObjectivesAr: [
      'اختبار مدخلات تحتوي على كود SQLi وملاحظة الفرق بين الدمج المباشر والاستعلام المعلمي',
      'تفعيل ترميز المخرجات لمنع تنفيذ وسوم السكربت في المتصفح',
      'ضبط سمات الأمان في كوكيز الجلسة (HttpOnly, Secure, SameSite)',
    ],
    practicalObjectivesEn: [
      'Test SQLi payload against string concatenation vs prepared statement',
      'Enable context-aware output encoding to neutralize script execution',
      'Harden session cookies with HttpOnly, Secure, and SameSite attributes',
    ],
    challengeTitleAr: 'مختبر إحباط هجمات الحقن وتأمين جلسات الويب',
    challengeTitleEn: 'Injection Defense & Session Hardening Challenge',
  },
  10: {
    id: 10,
    slug: 'api-security',
    macroDomainId: 'C',
    titleAr: 'أمن واجهات البرمجة (API Security) وتحديد المعدل',
    titleEn: 'API Security, Tokens & Rate Limiting',
    subtitleAr: 'بوابات API Gateway، مصادقة JWT، تحديد معدل الطلبات، والتحقق من المخططات',
    subtitleEn: 'API Gateways, JWT Bearer Tokens, Rate Limiting & Schema Validation',
    descriptionAr: 'تحكم في تدفق طلبات واجهات REST API: اختبر بوابات الحماية، وعدل حدود الطلبات (Rate Limiter) لمنع هجمات الإغراق والتخمين.',
    descriptionEn: 'Interactive API gateway: inspect token claims, throttle burst traffic with token-bucket rate limiting, and enforce schema contracts.',
    difficulty: 'Intermediate',
    simulationType: 'appsec_api',
    iconName: 'Braces',
    prerequisites: [8],
    relatedWorlds: [8, 9, 16, 17],
    concepts: [
      {
        id: 'rate_limiting',
        nameAr: 'تحديد معدل الطلبات (Rate Limiting)',
        nameEn: 'Rate Limiting & Throttling',
        briefAr: 'تقييد عدد الطلبات المسموح بها لكل مستخدم أو عنوان IP خلال نافذة زمنية محددة.',
        briefEn: 'Limiting API requests per client/IP within a defined time window using token-bucket or sliding window algorithms.',
        securityRelevanceAr: 'حماية الخوادم من هجمات حجب الخدمة (DoS) ومنع محاولات التخمين الآلي على النهايات الحساسة.',
        securityRelevanceEn: 'Protects backend capacity from exhaustion and mitigates credential stuffing.',
        controlsAr: ['خوارزمية Token Bucket', 'رد الخادم برمز 429 Too Many Requests'],
        controlsEn: ['Token Bucket Algorithm', 'HTTP 429 Throttle Response'],
      },
    ],
    practicalObjectivesAr: [
      'تهيئة محرك تحديد المعدل لمنع تدفق الطلبات الزائد',
      'التحقق من صحة توقيع ترويسة المصادقة Bearer Token',
    ],
    practicalObjectivesEn: [
      'Configure API Gateway rate limit thresholds and observe HTTP 429 rejection',
      'Validate JWT signature claims before forwarding traffic to worker services',
    ],
    challengeTitleAr: 'تحدي تأمين بوابة API ومنع هجمات الاستنزاف الآلي',
    challengeTitleEn: 'API Gateway Protection & Rate Limiting Challenge',
  },
  15: {
    id: 15,
    slug: 'cryptography-pki',
    macroDomainId: 'D',
    titleAr: 'علم التشفير ودوال التجزئة والبنية التحتية للمفاتيح (PKI)',
    titleEn: 'Applied Cryptography, Hashing & PKI',
    subtitleAr: 'دوال SHA-256 وتأثير الانهيار الجليدي، التشفير المتناظر، وتبادل المفاتيح وسلاسل الشهادات',
    subtitleEn: 'SHA-256 Avalanche Effect, Symmetric AES, Ephemeral ECDHE & X.509 PKI Chains',
    descriptionAr: 'مختبر التعمية التفاعلي: شاهد كيف يقلب تغيير حرف واحد نصف مخرجات الهاش، وتحقق من سلاسل شهادات Root CA واكتشف هجمات MITM.',
    descriptionEn: 'Interactive cryptography lab: test bit diffusion avalanche metric on SHA-256, verify X.509 Root CA trust chains, and simulate MITM attacks.',
    difficulty: 'Intermediate',
    simulationType: 'crypto',
    iconName: 'Key',
    prerequisites: [1],
    relatedWorlds: [1, 8, 16, 39],
    concepts: [
      {
        id: 'avalanche_effect',
        nameAr: 'تأثير الانهيار الجليدي في دوال التجزئة',
        nameEn: 'Avalanche Effect in Cryptographic Hashing',
        briefAr: 'تغيير بت واحد في النص الأصلي يؤدي لتغيير شبه عشوائي لما يقارب 50% من بتات بصمة التجزئة الناتجة.',
        briefEn: 'A 1-bit input difference yields ~50% pseudorandom bit changes in the output hash digest.',
        securityRelevanceAr: 'يضمن استحالة استنتاج المدخل الأصلي أو العثور على تصادمات رياضية بسهولة.',
        securityRelevanceEn: 'Fundamental property ensuring pre-image resistance and unpredictability.',
        controlsAr: ['استخدام دوال التجزئة الآمنة (SHA-256 / SHA-3)', 'إضافة التمليح (Salting) لكلمات المرور'],
        controlsEn: ['SHA-256 / SHA-3 Usage', 'Unique Cryptographic Salt'],
      },
      {
        id: 'pki_trust_chain',
        nameAr: 'سلسلة الثقة في البنية التحتية للمفاتيح (PKI)',
        nameEn: 'X.509 Public Key Infrastructure (PKI)',
        briefAr: 'توقيع الشهادات الرقمية رقمياً من هيئة إصدار موثوقة (Root CA) للتحقق من هوية الخوادم وتشفير الاتصال.',
        briefEn: 'Hierarchical chain of trust from Root CA to Intermediate CA to Server Certificate verified via digital signatures.',
        securityRelevanceAr: 'الحماية من هجمات اعتراض الاتصال والتنصت (Man-in-the-Middle - MITM).',
        securityRelevanceEn: 'Guarantees peer authenticity and enables encrypted TLS channel establishment.',
        controlsAr: ['التحقق من صحة سلسلة الشهادة وتاريخ الانتهاء', 'استخدام خوارزميات المفاتيح الحديثة'],
        controlsEn: ['Full Certificate Chain Verification', 'CRL / OCSP Revocation Checks'],
      },
    ],
    practicalObjectivesAr: [
      'إدخال نصوص ومقارنة بصمات SHA-256 وحساب نسبة انتشار البتات المقارنة',
      'إجراء مصافحة TLS 1.3 والتحقق من صحة الشهادة وتبادل مفاتيح ECDHE',
      'محاكاة شهادة منتهية أو مزورة ورصد إلغاء المصافحة لأسباب أمنية',
    ],
    practicalObjectivesEn: [
      'Input plaintext deltas and verify >40% bit diffusion avalanche metric',
      'Perform TLS 1.3 handshake with X.509 validation and symmetric key agreement',
      'Inject untrusted self-signed or expired certs to observe handshake rejection',
    ],
    challengeTitleAr: 'مختبر إثبات الانهيار الجليدي وتأسيس قناة مشفرة آمنة',
    challengeTitleEn: 'Avalanche Effect & Cryptographic Channel Challenge',
  },
  16: {
    id: 16,
    slug: 'iam-access-control',
    macroDomainId: 'D',
    titleAr: 'إدارة الهوية والوصول (IAM) ونموذج الصلاحيات RBAC',
    titleEn: 'Identity & Access Management (IAM) & RBAC',
    subtitleAr: 'المستخدمون، الأدوار، المجموعات، سياسات الصلاحيات، ومبدأ الحد الأدنى من الامتيازات',
    subtitleEn: 'Users, Roles, Groups, Least Privilege Principle & Permission Inheritance Graph',
    descriptionAr: 'ابنِ شجرة صلاحيات مؤسسية: حدد الأدوار (RBAC)، وعين السياسات، وافحص مسار توارث الصلاحيات لضمان تطبيق مبدأ أقل الامتيازات.',
    descriptionEn: 'Interactive IAM graph: visualize user-to-role-to-policy permission inheritance and enforce strict least privilege.',
    difficulty: 'Intermediate',
    simulationType: 'active_directory',
    iconName: 'Users',
    prerequisites: [1, 5],
    relatedWorlds: [7, 17, 19, 38],
    concepts: [
      {
        id: 'rbac_least_privilege',
        nameAr: 'التحكم بالوصول القائم على الأدوار (RBAC)',
        nameEn: 'Role-Based Access Control (RBAC) & Least Privilege',
        briefAr: 'ربط الصلاحيات بالأدوار الوظيفية بدلاً من الأفراد مباشرة، ومنح كل حساب فقط الحد الأدنى من الصلاحيات المطلوبة لأداء مهمته.',
        briefEn: 'Granting permissions to functional roles rather than individuals, enforcing minimum necessary access.',
        securityRelevanceAr: 'يحد من خطر تسريب الحسابات ويمنع المهاجم من السيطرة الشاملة على الموارد عند اختراق حساب مستخدم عادي.',
        securityRelevanceEn: 'Minimizes blast radius of compromised credentials by strictly bounding authorization scope.',
        controlsAr: ['مراجعة الصلاحيات الدورية', 'فصل المهام (Separation of Duties)'],
        controlsEn: ['Periodic Access Reviews', 'Separation of Duties'],
      },
    ],
    practicalObjectivesAr: [
      'ربط المستخدمين بالمجموعات وتعيين أدوار محددة للوصول للموارد',
      'تتبع ورصد الصلاحيات الزائدة وإلغائها لتحقيق مبدأ الحد الأدنى من الصلاحيات',
    ],
    practicalObjectivesEn: [
      'Assign users to least-privilege roles and verify resource accessibility',
      'Detect and prune overly permissive wildcard permissions in IAM policies',
    ],
    challengeTitleAr: 'تحدي ضبط سياسات IAM وتطبيق الحد الأدنى من الصلاحيات',
    challengeTitleEn: 'IAM Role Policy Hardening Challenge',
  },
  17: {
    id: 17,
    slug: 'authentication-mfa',
    macroDomainId: 'D',
    titleAr: 'المصادقة والمصادقة متعددة العوامل (MFA) و OAuth',
    titleEn: 'Authentication, MFA & OAuth Token Flows',
    subtitleAr: 'كلمات المرور وتجزئتها، رموز OTP، مفاتيح الأمان FIDO2، وتدفقات تفويض OAuth 2.0',
    subtitleEn: 'Password Hashing, Time-based OTP (TOTP), FIDO2 Passkeys & OAuth 2.0 Delegation',
    descriptionAr: 'قارن بين المصادقة بكلمة مرور فقط وبين المصادقة متعددة العوامل (MFA)، وشاهد تدفق تفويض OAuth وتوليد الرموز الآمنة.',
    descriptionEn: 'Interactive authentication lab: compare single-factor vs multi-factor security barriers, and trace OAuth 2.0 authorization code flow.',
    difficulty: 'Intermediate',
    simulationType: 'active_directory',
    iconName: 'Fingerprint',
    prerequisites: [1, 15],
    relatedWorlds: [7, 8, 10, 16],
    concepts: [
      {
        id: 'mfa_factors',
        nameAr: 'عوامل المصادقة المتعددة (MFA)',
        nameEn: 'Multi-Factor Authentication (MFA)',
        briefAr: 'المصادقة عبر مزيج من: شيء تعرفه (كلمة المرور) + شيء تملكه (هاتف/رمز OTP/مفتاح أمان) + شيء فيك (بصمة/قياسات حيوية).',
        briefEn: 'Combining two or more distinct factors: Something you know, Something you have, and Something you are.',
        securityRelevanceAr: 'يحمي الحساب حتى لو تم تسريب أو تخمين كلمة المرور بنجاح.',
        securityRelevanceEn: 'Neutralizes >99% of automated credential stuffing and phishing attacks.',
        controlsAr: ['فرض المصادقة الثنائية لجميع الحسابات الحساسة', 'استخدام مفاتيح FIDO2 المقاومة للاصطياد'],
        controlsEn: ['Mandatory MFA for Privileged Accounts', 'Phishing-resistant FIDO2 Keys'],
      },
    ],
    practicalObjectivesAr: [
      'محاكاة تسجيل الدخول بعامل واحد وملاحظة سهولة الاختراق عند تسريب كلمة المرور',
      'تفعيل المصادقة متعددة العوامل والتحقق من صد محاولات التسلل',
    ],
    practicalObjectivesEn: [
      'Simulate single-factor credential compromise vs multi-factor resilience',
      'Verify step-up challenge behavior on anomaly detection',
    ],
    challengeTitleAr: 'مختبر تفعيل المصادقة متعددة العوامل وحماية الحسابات',
    challengeTitleEn: 'Multi-Factor Authentication & Verification Lab',
  },
  18: {
    id: 18,
    slug: 'cloud-security',
    macroDomainId: 'E',
    titleAr: 'أمن الحوسبة السحابية وحماية التخزين (Cloud Security)',
    titleEn: 'Cloud Infrastructure & Misconfiguration Defense',
    subtitleAr: 'نموذج المسؤولية المشتركة، مجموعات الأمان، وتأمين وحدات التخزين (S3 Buckets)',
    subtitleEn: 'Shared Responsibility Model, Cloud Security Groups & S3 Bucket Public Exposure',
    descriptionAr: 'استكشف البنية السحابية: غير صلاحيات وحدات التخزين من خاصة إلى عامة، ولاحظ انكشاف البيانات فوراً، ثم طبق ضوابط الحماية وسياسات التشفير.',
    descriptionEn: 'Interactive cloud explorer: toggle S3 storage bucket policies between private and public exposure, and enforce cloud security groups.',
    difficulty: 'Intermediate',
    simulationType: 'cloud_containers',
    iconName: 'Cloud',
    prerequisites: [3, 16],
    relatedWorlds: [3, 16, 19, 20, 38],
    concepts: [
      {
        id: 'cloud_misconfiguration',
        nameAr: 'أخطاء التكوين السحابي (Cloud Misconfiguration)',
        nameEn: 'Cloud Storage & Ingress Misconfiguration',
        briefAr: 'ترك وحدات التخزين السحابي أو منافذ الإدارة مفتوحة للإنترنت العام عن طريق الخطأ.',
        briefEn: 'Inadvertently exposing cloud storage containers, APIs, or management ports to the public Internet.',
        securityRelevanceAr: 'السبب الأول لتسريب البيانات الضخمة في البيئات السحابية الحديثة.',
        securityRelevanceEn: 'The leading cause of massive enterprise cloud data breaches globally.',
        controlsAr: ['حظر الوصول العام الافتراضي (Block Public Access)', 'التشفير أثناء التخزين SSE'],
        controlsEn: ['Default Block Public Access', 'Server-Side Encryption (SSE-KMS)'],
      },
    ],
    practicalObjectivesAr: [
      'فحص إعدادات التخزين السحابي وحظر الوصول العام غير المصرح به',
      'ضبط مجموعات الأمان (Security Groups) لحصر الوصول على العناوين الموثوقة',
    ],
    practicalObjectivesEn: [
      'Remediate publicly exposed S3 storage bucket permissions',
      'Tighten cloud security group ingress rules to trusted CIDR blocks',
    ],
    challengeTitleAr: 'تحدي اكتشاف وإصلاح أخطاء التكوين السحابي الحساسة',
    challengeTitleEn: 'Cloud Security & Storage Exposure Remediation Challenge',
  },
  20: {
    id: 20,
    slug: 'container-k8s-security',
    macroDomainId: 'E',
    titleAr: 'أمن الحاويات (Docker) وعزل كوبرنيتيس (Kubernetes)',
    titleEn: 'Container Security & Kubernetes Network Isolation',
    subtitleAr: 'مساحات الأسماء، عزل العمليات، حزم K8s Pods، وسياسات عزل الشبكات',
    subtitleEn: 'Docker Namespaces/Cgroups, Kubernetes Pods, RBAC & Network Policies',
    descriptionAr: 'افحص حدود عزل الحاويات: اختبر التواصل بين حزم Pods في بيئة Kubernetes، وطبق سياسات الشبكة (Network Policies) لمنع التحرك الجانبي.',
    descriptionEn: 'Interactive Kubernetes cluster: enforce Pod-to-Pod network isolation policies and inspect container namespace boundaries.',
    difficulty: 'Advanced',
    simulationType: 'cloud_containers',
    iconName: 'Boxes',
    prerequisites: [5, 18],
    relatedWorlds: [5, 18, 21, 22],
    concepts: [
      {
        id: 'k8s_network_policies',
        nameAr: 'سياسات شبكات كوبرنيتيس (K8s Network Policies)',
        nameEn: 'Kubernetes Network Policies & Pod Isolation',
        briefAr: 'افتراضياً تستطيع جميع حزم Pods في الكلاستر التواصل معاً؛ تفرض سياسات الشبكة عزلاً صارماً بين الخدمات.',
        briefEn: 'By default, all pods communicate openly; NetworkPolicies enforce declarative firewall rules per Pod namespace.',
        securityRelevanceAr: 'منع المهاجم من اختراق خادم الويب ثم القفز مباشرة إلى قاعدة بيانات الدفع أو خوادم الإدارة.',
        securityRelevanceEn: 'Prevents lateral pod-to-pod traversal following single microservice compromise.',
        controlsAr: ['سياسة العزل الافتراضية Default Deny All', 'حصر الاتصال بين الخدمات المعتمدة فقط'],
        controlsEn: ['Default Deny Ingress/Egress', 'Explicit Label-Based Service Whitelisting'],
      },
    ],
    practicalObjectivesAr: [
      'تطبيق سياسة عزل على حزم Pods في مساحة أسماء الدفع والبيانات الحساسة',
      'فحص قيود مساحات الأسماء لمنع هروب العمليات خارج الحاوية',
    ],
    practicalObjectivesEn: [
      'Apply Kubernetes NetworkPolicy to isolate sensitive database pods',
      'Verify container namespace and non-root execution constraints',
    ],
    challengeTitleAr: 'مختبر عزل شبكات كوبرنيتيس وتأمين الحاويات',
    challengeTitleEn: 'Kubernetes Network Policy & Container Isolation Lab',
  },
  22: {
    id: 22,
    slug: 'devsecops-pipeline',
    macroDomainId: 'E',
    titleAr: 'أمن سلاسل التوريد وخطوط الإنتاج البرمجي (DevSecOps)',
    titleEn: 'DevSecOps & CI/CD Security Pipeline',
    subtitleAr: 'فحص الكود الثابت SAST، فحص التبعيات SCA، وفحص الأسرار في خطوط CI/CD',
    subtitleEn: 'SAST Code Analysis, Software Composition Analysis (SCA) & Secret Detection Gates',
    descriptionAr: 'تحكم في خط الإنتاج البرمجي CI/CD: فعل بوابات الفحص الأمني التلقائي (Security Gates) لمنع تمرير الأكواد المحتوية على أسرار مكشوفة أو مكتبات ملغومة.',
    descriptionEn: 'Interactive CI/CD pipeline visualizer: toggle automated SAST and secret-detection gates to stop vulnerable builds before production deployment.',
    difficulty: 'Intermediate',
    simulationType: 'cloud_containers',
    iconName: 'Workflow',
    prerequisites: [9, 20],
    relatedWorlds: [9, 12, 13, 20, 23],
    concepts: [
      {
        id: 'security_gates',
        nameAr: 'بوابات الأمان في خطوط CI/CD',
        nameEn: 'Automated CI/CD Security Quality Gates',
        briefAr: 'إيقاف بناء ونشر التطبيق تلقائياً إذا رصدت أدوات الفحص ثغرات عالية الخطورة أو مفاتيح API مكشوفة في الكود.',
        briefEn: 'Automated policy thresholds that fail the build pipeline upon detecting high-severity flaws or hardcoded secrets.',
        securityRelevanceAr: 'اكتشاف الثغرات مبكراً أثناء التطوير (Shift Left) يقلل تكلفة ومخاطر الاختراق بأضعاف.',
        securityRelevanceEn: 'Shift-left security dramatically lowers remediation costs and prevents tainted artifacts.',
        controlsAr: ['فحص الأسرار Git Secrets Scan', 'فحص البرمجيات مفتوحة المصدر SBOM'],
        controlsEn: ['Pre-commit Secret Scanners', 'Automated SBOM & SCA Dependency Audits'],
      },
    ],
    practicalObjectivesAr: [
      'تفعيل بوابات فحص الأسرار والتبعيات في خط النشر',
      'مراقبة إيقاف عملية النشر عند محاولة دمج مفتاح سري مسرب في الكود',
    ],
    practicalObjectivesEn: [
      'Enable SAST and secret-detection gates across the CI/CD timeline',
      'Observe pipeline failure and alert triggering upon hardcoded API key detection',
    ],
    challengeTitleAr: 'تحدي بناء خط إنتاج برمجيات آمن (DevSecOps Pipeline)',
    challengeTitleEn: 'DevSecOps Pipeline & Automated Security Gate Challenge',
  },
  24: {
    id: 24,
    slug: 'soc-siem-operations',
    macroDomainId: 'F',
    titleAr: 'مركز العمليات الأمنية (SOC) ومحرك ربط الأحداث (SIEM)',
    titleEn: 'SOC Operations & SIEM Correlation Engine',
    subtitleAr: 'تدفق السجلات الحية، نوافذ الارتباط الزمني، كشف الهجمات، واحتواء التهديد التلقائي',
    subtitleEn: 'Live Log Ingestion Stream, Sliding-Window Correlation, Brute-Force & Automated SOAR Containment',
    descriptionAr: 'عش دور محلل الأمن السيبراني في SOC: استقبل تدفق السجلات الحية، واضبط قواعد الارتباط لكشف هجمات التخمين، ونفذ إجراء الاحتواء بحظر IP المهاجم فوراً.',
    descriptionEn: 'Step into the SOC: ingest live authentication logs, trigger sliding-window correlation rules, and execute automated firewall containment.',
    difficulty: 'Intermediate',
    simulationType: 'siem',
    iconName: 'Activity',
    prerequisites: [4, 6, 8],
    relatedWorlds: [4, 6, 25, 26, 28, 30],
    concepts: [
      {
        id: 'siem_correlation_rules',
        nameAr: 'قواعد ارتباط الأحداث في SIEM',
        nameEn: 'SIEM Log Correlation Rules',
        briefAr: 'ربط أحداث متعددة عبر نافذة زمنية محددة لاكتشاف الهجمات المعقدة (مثل: 4 محاولات دخول فاشلة يتبعها دخول ناجح ثم تصعيد صلاحيات).',
        briefEn: 'Correlating disparate log events within a sliding time window to identify multi-stage attack patterns.',
        securityRelevanceAr: 'تحويل آلاف السجلات الصامتة إلى إنذارات أمنية دقيقة وواضحة للمحلل الأمني.',
        securityRelevanceEn: 'Converts massive log noise into actionable, high-fidelity security incident alerts.',
        controlsAr: ['تحديد عتبات الإنذار المناسبة', 'التكامل مع منصات الاستجابة التلقائية (SOAR)'],
        controlsEn: ['Tuned Anomaly Thresholds', 'Automated SOAR Playbook Execution'],
      },
    ],
    practicalObjectivesAr: [
      'بدء محاكاة هجوم التخمين ومراقبة تدفق سجلات AUTH_LOGIN في الوقت الفعلي',
      'التحقق من إطلاق الإنذار الأحمر عند تجاوز عتبة المحاولات الفاشلة',
      'تطبيق أمر الاحتواء لحظر عنوان IP المهاجم على جدار الحماية المحيطي',
    ],
    practicalObjectivesEn: [
      'Simulate brute-force stream and observe real-time SIEM log ingestion',
      'Verify alert generation when failure threshold exceeds sliding window',
      'Trigger defensive SOAR containment to block attacker IP at perimeter',
    ],
    challengeTitleAr: 'مهمة رصد هجوم التخمين الشامل واحتواء المهاجم في SOC',
    challengeTitleEn: 'SOC Incident Detection & Threat Containment Challenge',
  },
  28: {
    id: 28,
    slug: 'edr-telemetry',
    macroDomainId: 'F',
    titleAr: 'أمن النقاط النهائية ورصد السلوكيات (EDR / XDR)',
    titleEn: 'Endpoint Detection & Response (EDR / XDR)',
    subtitleAr: 'شجرة العمليات الحية، مراقبة اتصالات الشبكة وتعديلات الملفات ورصد السلوك المريب',
    subtitleEn: 'Process Spawning Trees, File/Registry Telemetry, Network Sockets & Behavioral Anomaly Alerts',
    descriptionAr: 'افحص سلوك النقاط النهائية (Endpoints): تتبع العمليات المشبوهة المتفرعة من ملفات Office أو PowerShell، وافحص اتصالاتها الخارجية وعزل الجهاز المصاب.',
    descriptionEn: 'Inspect living endpoint telemetry: trace suspicious child processes spawned from documents, analyze network callbacks, and isolate infected hosts.',
    difficulty: 'Advanced',
    simulationType: 'threat_hunting',
    iconName: 'Laptop',
    prerequisites: [2, 5, 6, 24],
    relatedWorlds: [2, 6, 24, 27, 30, 31],
    concepts: [
      {
        id: 'edr_process_tree',
        nameAr: 'شجرة العمليات والسلوك الشاذ في EDR',
        nameEn: 'EDR Process Hierarchy & Anomaly Detection',
        briefAr: 'مراقبة تسلسل إنشاء العمليات (مثل Word يفتح cmd.exe الذي يشغل PowerShell لتحميل حمولة خبيثة).',
        briefEn: 'Tracking parent-child process execution lineage to catch weaponized office docs or script-based abuse.',
        securityRelevanceAr: 'رصد الهجمات التي لا تعتمد على ملفات خبيثة تقليدية (Living-off-the-Land Binaries - LOLBAS).',
        securityRelevanceEn: 'Detects fileless in-memory execution and dual-use administrative tool abuse.',
        controlsAr: ['عزل النقطة النهائية عن الشبكة', 'قتل العمليات الخبيثة وشجرتها الفرعية'],
        controlsEn: ['Endpoint Network Isolation', 'Process Tree Termination'],
      },
    ],
    practicalObjectivesAr: [
      'تتبع تفرع العمليات المريبة من معالج النصوص إلى موجه الأوامر',
      'فحص عناوين الاتصال الخارجي للعملية المشبوهة',
      'تطبيق إجراء عزل الجهاز المصاب لمنع الانتشار في الشبكة',
    ],
    practicalObjectivesEn: [
      'Trace suspicious parent-child process lineage on the endpoint timeline',
      'Inspect external socket connections initiated by anomalous workers',
      'Isolate compromised host to prevent lateral enterprise spread',
    ],
    challengeTitleAr: 'مختبر تتبع العمليات المريبة وعزل الأجهزة المصابة',
    challengeTitleEn: 'EDR Process Tree Analysis & Host Isolation Lab',
  },
  31: {
    id: 31,
    slug: 'digital-forensics',
    macroDomainId: 'G',
    titleAr: 'الأدلة الجنائية الرقمية وإعادة بناء الخط الزمني',
    titleEn: 'Digital Forensics & Incident Timeline Reconstruction',
    subtitleAr: 'آثار الملفات، سجلات الذاكرة، آثار التصفح، وتحليل التسلسل الزمني للهجمات',
    subtitleEn: 'Filesystem Artifacts, Memory Dumps, Shimcache, Prefetch & Chronological Sequence',
    descriptionAr: 'اجمع الأدلة الرقمية كخبير جنائي: ادمج سجلات إنشاء الملفات، محاولات الدخول، وتعديلات النظام في خط زمني موحد لكشف طريقة اختراق المهاجم.',
    descriptionEn: 'Interactive forensic investigator: reconstruct unified attack timelines across file creation, network sockets, auth logs, and registry modifications.',
    difficulty: 'Advanced',
    simulationType: 'threat_hunting',
    iconName: 'Search',
    prerequisites: [5, 6, 24],
    relatedWorlds: [5, 6, 24, 28, 30, 32],
    concepts: [
      {
        id: 'forensic_timeline',
        nameAr: 'إعادة بناء الخط الزمني الجنائي',
        nameEn: 'Forensic Timeline Reconstruction',
        briefAr: 'ترتيب كافة الأدلة الرقمية زمنياً بالثانية للكشف عن نقطة الدخول الأولية (Initial Access) ومسار الهجوم بالكامل.',
        briefEn: 'Chronologically synthesizing file metadata (MACB), login events, and network connections to uncover root cause.',
        securityRelevanceAr: 'فهم كيفية حدوث الاختراق، وتحديد حجم الضرر، ومنع تكرار الهجوم مستقبلاً.',
        securityRelevanceEn: 'Essential for root cause determination, regulatory breach reporting, and remediation planning.',
        controlsAr: ['تزامن التوقيت الدقيق (NTP)', 'الحفاظ على سلسلة الحيازة للأدلة (Chain of Custody)'],
        controlsEn: ['Precision NTP Synchronization', 'Strict Evidence Chain of Custody'],
      },
    ],
    practicalObjectivesAr: [
      'ترتيب الأحداث الجنائية زمنياً وتحديد أول عملية خبيثة تم تشغيلها',
      'تحديد نقطة الدخول الأولية للمهاجم والملفات التي تم تسريبها',
    ],
    practicalObjectivesEn: [
      'Reconstruct chronological forensic timeline across disparate evidence logs',
      'Identify the initial compromise vector and exfiltrated file artifacts',
    ],
    challengeTitleAr: 'تحدي التحقيق الجنائي الرقمي وإعادة بناء مسار الاختراق',
    challengeTitleEn: 'Forensic Timeline Reconstruction & Root Cause Challenge',
  },
  38: {
    id: 38,
    slug: 'zero-trust-architecture',
    macroDomainId: 'H',
    titleAr: 'معمارية انعدام الثقة (Zero Trust Architecture)',
    titleEn: 'Zero Trust Architecture & Decision Engine',
    subtitleAr: 'لا تثق بأي طرف وتحقق باستمرار — سياق الجهاز والمستخدم، والتحقق المستمر من المخاطر',
    subtitleEn: 'Never Trust, Always Verify — Device Posture, Location Context & Dynamic Step-Up Auth',
    descriptionAr: 'اختبر محرك قرارات Zero Trust: أرسل طلبات وصول من أجهزة ومواقع مختلفة، وشاهد كيف يقرر النظام ديناميكياً السماح، الحظر، أو فرض مصادقة إضافية.',
    descriptionEn: 'Interactive Zero Trust policy engine: evaluate dynamic access requests based on user identity, device health posture, IP geolocation, and risk signals.',
    difficulty: 'Advanced',
    simulationType: 'zero_trust',
    iconName: 'ShieldAlert',
    prerequisites: [4, 16, 17],
    relatedWorlds: [4, 7, 16, 17, 37],
    concepts: [
      {
        id: 'zero_trust_decision',
        nameAr: 'محرك قرارات انعدام الثقة (Zero Trust Engine)',
        nameEn: 'Continuous Risk-Based Access Decisions',
        briefAr: 'تقييم كل طلب وصول بشكل منفصل بناءً على: هوية المستخدم + صحة الجهاز + الموقع الجغرافي + حساسية البيانات المطلوبة.',
        briefEn: 'Evaluating every single request dynamically based on Identity, Device Posture, Location, and Resource Sensitivity.',
        securityRelevanceAr: 'إلغاء مفهوم "الشبكة الداخلية الموثوقة"، مما يمنع المهاجم من التسلل الحر حتى لو كان متصلاً بشبكة الشركة.',
        securityRelevanceEn: 'Eliminates implicit internal perimeter trust, neutralizing stolen credential misuse.',
        controlsAr: ['فحص حالة الجهاز (Device Posture Check)', 'المصادقة الإضافية المشروطة (Step-Up Auth)'],
        controlsEn: ['Device Health Posture Compliance', 'Context-Aware Conditional Access Policies'],
      },
    ],
    practicalObjectivesAr: [
      'محاكاة طلب وصول من جهاز غير محدث أو من موقع جغرافي مريب وملاحظة قرار الرفض',
      'فرض المصادقة الإضافية (Step-Up) عند محاولة الوصول لبيانات مالية حساسة',
    ],
    practicalObjectivesEn: [
      'Test access request from non-compliant device and observe policy denial',
      'Trigger step-up biometric prompt on high-risk contextual anomaly',
    ],
    challengeTitleAr: 'مختبر تصميم سياسات انعدام الثقة والتحقق المستمر',
    challengeTitleEn: 'Zero Trust Contextual Access Decision Lab',
  },
  60: {
    id: 60,
    slug: 'integrated-cyber-range',
    macroDomainId: 'J',
    titleAr: 'الميدان السيبراني المؤسسي الشامل (Cyber Range)',
    titleEn: 'Advanced Integrated Enterprise Cyber Range',
    subtitleAr: 'المنظومة الرقمية الحية الكاملة: تبديل المنظور بين الشبكة، النقاط النهائية، الهوية، التطبيقات، وSOC',
    subtitleEn: 'The Living Enterprise Universe: Multi-Layer View Switcher (Network, Endpoint, Identity, App, SOC)',
    descriptionAr: 'الميدان الأمني المتكامل النهائي: بيئة مؤسسية رقمية كاملة تحتوي على خوادم الويب، قواعد البيانات، جدران الحماية، أجهزة الموظفين، Active Directory، ونظام SIEM. شاهد كيف يظهر نفس الحادث الأمني عبر 5 طبقات دفاعية مختلفة في وقت واحد!',
    descriptionEn: 'The flagship connected cyber universe: a complete living digital enterprise. Inspect the exact same security incident through Network, Endpoint, Identity, Application, and SOC perspectives simultaneously on the universal cyber timeline.',
    difficulty: 'Expert',
    simulationType: 'range',
    iconName: 'Compass',
    prerequisites: [1, 3, 4, 5, 6, 7, 8, 9, 15, 16, 24, 28, 38],
    relatedWorlds: [1, 3, 4, 7, 8, 15, 16, 24, 28, 31, 38],
    concepts: [
      {
        id: 'multi_layer_security',
        nameAr: 'التكامل والرؤية متعددة الطبقات للحادث الأمني',
        nameEn: 'Multi-Layer Security Visibility',
        briefAr: 'نفس الهجوم يظهر كـ "حزمة بيانات مرفوضة" في الشبكة، و"حدث 4625" في الهوية، و"عملية مشبوهة" في الجهاز، و"إنذار أحمر" في مركز SOC.',
        briefEn: 'The same incident manifests as dropped packets at network layer, event 4625 in identity, spawned process in EDR, and correlated alert in SOC.',
        securityRelevanceAr: 'تمكين المدافع من فهم الصورة الشاملة للاختراق وسد الثغرات عبر كافة خطوط الدفاع بتناغم.',
        securityRelevanceEn: 'Enables defenders to coordinate holistic cross-domain incident triage and remediation.',
        controlsAr: ['الدفاع في العمق (Defense in Depth)', 'التنسيق الآلي بين الطبقات عبر منصات XDR و SOAR'],
        controlsEn: ['Defense in Depth', 'Cross-Domain XDR Telemetry Correlation'],
      },
    ],
    practicalObjectivesAr: [
      'التبديل بين طبقات الشبكة والأجهزة والهوية والتطبيقات وSOC لمراقبة الحادث الأمني',
      'تتبع تدفق الأحداث الحية في الخط الزمني السيبراني العالمي الموحد',
      'تنفيذ استجابة دفاعية منسقة (حظر IP + عزل جهاز + إلغاء جلسة المستخدم)',
    ],
    practicalObjectivesEn: [
      'Switch between Network, Endpoint, Identity, App, and SOC layers during a live incident',
      'Trace cross-layer telemetry in the Universal Cyber Timeline',
      'Execute synchronized defense: block IP, isolate host, and revoke compromised session tokens',
    ],
    challengeTitleAr: 'التحدي الأكبر: إدارة وتأمين المؤسسة الرقمية في الميدان السيبراني',
    challengeTitleEn: 'Enterprise Cyber Range Master Defense Challenge',
  },
  11: {
  id: 11,
  slug: "web-session-management",
  macroDomainId: "C",
  titleAr: "إدارة الجلسات ورموز التوثيق وتأمين الكوكيز",
  titleEn: "Session Management, JWT Tokens & Cookie Security",
  subtitleAr: "الكوكيز الآمنة، HttpOnly و SameSite، وتثبيت وتزوير الجلسات",
  subtitleEn: "Secure Cookies, HttpOnly, SameSite & Session Hijacking Mitigation",
  descriptionAr: "اختبر آليات حفظ وتأمين الجلسات الرقمية: اكتشف ثغرات Session Fixation و CSRF وطبق سمات الحماية للكوكيز ورموز JWT.",
  descriptionEn: "Interactive session security lab: test session hijacking vectors and configure defensive cookie attributes.",
  difficulty: "Intermediate",
  simulationType: "appsec_api",
  iconName: "Key",
  prerequisites: [
    8,
    9
  ],
  relatedWorlds: [
    8,
    9,
    10,
    16
  ],
  concepts: [
    {
      id: "secure_cookies",
      nameAr: "سمات أمان الكوكيز (HttpOnly & Secure & SameSite)",
      nameEn: "Secure Cookie Flags",
      briefAr: "منع سرقة الكوكيز عبر JavaScript وحصر إرسالها على قنوات HTTPS المشفرة.",
      briefEn: "Preventing XSS cookie theft and CSRF abuse via strict browser cookie policies.",
      securityRelevanceAr: "حماية جلسات تسجيل دخول المستخدمين من الاختطاف والسرقة.",
      securityRelevanceEn: "Primary defense against stolen session identifiers and impersonation.",
      controlsAr: [
        "تفعيل HttpOnly",
        "تفعيل Secure",
        "ضبط SameSite=Strict"
      ],
      controlsEn: [
        "HttpOnly Flag",
        "Secure Flag",
        "SameSite=Strict"
      ]
    }
  ],
  practicalObjectivesAr: [
    "فحص ترويسة Set-Cookie وإضافة السمات الأمنية",
    "التحقق من منع هجمات CSRF"
  ],
  practicalObjectivesEn: [
    "Inspect Set-Cookie header and enforce security attributes",
    "Validate CSRF mitigation"
  ],
  challengeTitleAr: "مختبر تحصين جلسات الويب ورموز التوثيق",
  challengeTitleEn: "Session Security & Cookie Hardening Lab"
},
  12: {
  id: 12,
  slug: "secure-coding-sdlc",
  macroDomainId: "C",
  titleAr: "البرمجة الآمنة ودورة حياة تطوير البرمجيات (SSDLC)",
  titleEn: "Secure Coding Principles & Secure SDLC",
  subtitleAr: "نمذجة التهديدات، مبدأ أقل الصلاحيات في الكود، وإدارة الأسرار",
  subtitleEn: "Threat Modeling (STRIDE), Principle of Least Privilege & Secret Hygiene",
  descriptionAr: "طبق مبادئ البرمجة الآمنة في شفرتك المصدرية: أزل كلمات المرور المضمنة، وافحص منطق التحقق من الأخطاء دون تسريب بيانات النظام.",
  descriptionEn: "Embed security into software development: apply STRIDE threat modeling, avoid hardcoded credentials, and handle exceptions safely.",
  difficulty: "Intermediate",
  simulationType: "appsec_api",
  iconName: "FileCode",
  prerequisites: [
    9
  ],
  relatedWorlds: [
    9,
    13,
    22
  ],
  concepts: [
    {
      id: "threat_modeling_stride",
      nameAr: "نمذجة التهديدات وفق إطار STRIDE",
      nameEn: "STRIDE Threat Modeling",
      briefAr: "تصنيف التهديدات إلى: انتحال، تلاعب، إنكار، كشف معلومات، حجب خدمة، وتصعيد صلاحيات.",
      briefEn: "Categorizing threats: Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege.",
      securityRelevanceAr: "تحديد نقاط الضعف في التصميم البرمجي قبل كتابة الكود.",
      securityRelevanceEn: "Identifies architectural security flaws prior to code deployment.",
      controlsAr: [
        "مراجعة معمارية النظام",
        "فحص مصفوفة المخاطر"
      ],
      controlsEn: [
        "Architectural Review",
        "Risk Matrix Analysis"
      ]
    }
  ],
  practicalObjectivesAr: [
    "إجراء نمذجة التهديدات لواجهة التطبيق",
    "تصحيح معالجة الأخطاء البرمجية لمنع التسريب"
  ],
  practicalObjectivesEn: [
    "Execute threat modeling on application interface",
    "Harden error handling against information leakage"
  ],
  challengeTitleAr: "تحدي تطبيق نمذجة التهديدات والبرمجة الآمنة",
  challengeTitleEn: "STRIDE Threat Modeling & Secure Code Challenge"
},
  13: {
  id: 13,
  slug: "ssrf-cors-csrf",
  macroDomainId: "C",
  titleAr: "ثغرات SSRF وسياسات مشاركة الموارد CORS و CSRF",
  titleEn: "Server-Side Request Forgery (SSRF) & CORS/CSRF Defense",
  subtitleAr: "تزوير طلبات جانب الخادم، سياسة الأصل نفسه SOP، وترويسات CORS",
  subtitleEn: "SSRF Attack Vectors, Same-Origin Policy (SOP) & CORS Preflight Inspection",
  descriptionAr: "اكتشف كيف يمكن إجبار خادم الويب على قراءة موارد سحابية داخلية (SSRF)، واضبط قواعد CORS الدقيقة لمنع النطاقات الخبيثة من قراءة بيانات المستخدم.",
  descriptionEn: "Interactive web exploitation & defense: block SSRF metadata probes and configure secure CORS origin headers.",
  difficulty: "Advanced",
  simulationType: "appsec_api",
  iconName: "Globe",
  prerequisites: [
    8,
    9
  ],
  relatedWorlds: [
    8,
    9,
    10,
    18
  ],
  concepts: [
    {
      id: "ssrf_defense",
      nameAr: "الدفاع ضد تزوير طلبات الخادم (SSRF)",
      nameEn: "SSRF Mitigation & Metadata Protection",
      briefAr: "حظر استدعاء العناوين المحلية (127.0.0.1 و 169.254.169.254) من خلال بوابات الويب.",
      briefEn: "Restricting web backend egress to loopback and cloud instance metadata IP ranges.",
      securityRelevanceAr: "منع سرقة مفاتيح IAM السحابية المؤقتة والوصول للخدمات الداخلية غير المحمية.",
      securityRelevanceEn: "Stops cloud token theft from instance metadata services (IMDS).",
      controlsAr: [
        "استخدام IMDSv2",
        "فلترة عناوين IP الواردة عبر قوائم بيضاء"
      ],
      controlsEn: [
        "Enforce IMDSv2",
        "Egress URL Whitelisting"
      ]
    }
  ],
  practicalObjectivesAr: [
    "حظر محاولات استعلام عنوان الميتاداتا 169.254.169.254",
    "ضبط ترويسة Access-Control-Allow-Origin بشكل آمن"
  ],
  practicalObjectivesEn: [
    "Block unauthorized queries to metadata endpoint",
    "Configure strict CORS origin headers"
  ],
  challengeTitleAr: "مختبر إحباط ثغرات SSRF وضبط سياسات CORS",
  challengeTitleEn: "SSRF Neutralization & Secure CORS Policy Lab"
},
  14: {
  id: 14,
  slug: "business-logic-flaws",
  macroDomainId: "C",
  titleAr: "عيوب المنطق البرمجي وثغرات التسلسل والتلاعب بالبيانات",
  titleEn: "Business Logic Flaws & Insecure Deserialization",
  subtitleAr: "التلاعب بأسعار المشتريات، كسر منطق سير العمليات، وثغرات فك التسلسل",
  subtitleEn: "Price Tampering, Workflow State Bypass & Safe Object Deserialization",
  descriptionAr: "اختبر كيف تقع الثغرات خارج نطاق OWASP الكلاسيكي: تلاعب بمنطق السلة والخصومات، وافحص فك تسلسل الكائنات بأمان لمنع تنفيذ الأوامر عن بعد (RCE).",
  descriptionEn: "Probe business logic vulnerabilities: manipulate workflow states, validate server-side pricing, and secure deserialization pipelines.",
  difficulty: "Advanced",
  simulationType: "appsec_api",
  iconName: "FileCode",
  prerequisites: [
    9,
    10
  ],
  relatedWorlds: [
    9,
    10,
    12
  ],
  concepts: [
    {
      id: "logic_flaw_validation",
      nameAr: "التحقق الصارم من المنطق البرمجي",
      nameEn: "Server-Side Business Logic Validation",
      briefAr: "عدم الاعتماد أبداً على الحسابات القادمة من جهة العميل (المتصفح) وإعادة حساب القيم في الخادم.",
      briefEn: "Never trusting client-computed transaction totals or state transition tokens.",
      securityRelevanceAr: "منع الاحتيال المالي والتجاوز غير المصرح به للخطوات الأمنية.",
      securityRelevanceEn: "Prevents financial loss and privilege elevation via state bypass.",
      controlsAr: [
        "التحقق من الحالة في الخادم",
        "استخدام التوقيع الرقمي للبيانات الحساسة"
      ],
      controlsEn: [
        "Server-Side State Machine",
        "Cryptographic HMAC Tokens"
      ]
    }
  ],
  practicalObjectivesAr: [
    "إعادة حساب أسعار المنتجات في جانب الخادم لمنع التلاعب",
    "استبدال مكتبات التسلسل غير الآمنة بـ JSON القياسي"
  ],
  practicalObjectivesEn: [
    "Enforce server-side price re-computation",
    "Replace unsafe binary deserializers with structured JSON"
  ],
  challengeTitleAr: "تحدي كشف وإصلاح عيوب المنطق البرمجي وتأمين البيانات",
  challengeTitleEn: "Business Logic Hardening & Integrity Challenge"
},
  19: {
  id: 19,
  slug: "cloud-iam-least-privilege",
  macroDomainId: "E",
  titleAr: "إدارة الهوية والصلاحيات السحابية (Cloud IAM & Roles)",
  titleEn: "Cloud IAM Policies & Least Privilege Role Assumption",
  subtitleAr: "أدوار IAM المؤقتة، سياسات JSON، ومخاطر الصلاحيات المطلقة (*:*)",
  subtitleEn: "Temporary STS Role Assumption, JSON Policy Scopes & Overprivileged Escalation",
  descriptionAr: "صمم سياسات IAM السحابية الدقيقة: استبدل الرموز الثابتة بأدوار سحابية مؤقتة (STS AssumeRole)، وألغِ الصلاحيات الشاملة لمنع اختراق البنية السحابية.",
  descriptionEn: "Interactive Cloud IAM builder: prune wildcard permissions, attach least-privilege resource policies, and audit privilege escalation paths.",
  difficulty: "Intermediate",
  simulationType: "cloud_containers",
  iconName: "Cloud",
  prerequisites: [
    16,
    18
  ],
  relatedWorlds: [
    16,
    18,
    20
  ],
  concepts: [
    {
      id: "cloud_sts_roles",
      nameAr: "الأدوار المؤقتة في السحابة (STS Roles)",
      nameEn: "Short-Lived Cloud STS Tokens",
      briefAr: "استخدام مفاتيح وصول تنتهي صلاحيتها تلقائياً خلال دقائق بدلاً من المفاتيح الدائمة.",
      briefEn: "Using ephemeral, auto-expiring security credentials instead of long-lived access keys.",
      securityRelevanceAr: "إبطال خطر تسريب مفاتيح الحساب في حال سرقة الرمز المؤقت.",
      securityRelevanceEn: "Minimizes breach impact by ensuring leaked credentials quickly expire.",
      controlsAr: [
        "حظر المفاتيح الدائمة لمستخدمي الجذر",
        "فرض MFA عند انتحال الأدوار"
      ],
      controlsEn: [
        "Eliminate Root Access Keys",
        "Enforce MFA for STS Role Assumption"
      ]
    }
  ],
  practicalObjectivesAr: [
    "حصر صلاحيات IAM Policy على موارد محددة",
    "تفعيل انتحال الأدوار المؤقتة"
  ],
  practicalObjectivesEn: [
    "Restrict IAM Policy JSON to explicit resource ARNs",
    "Enable temporary STS role assumption"
  ],
  challengeTitleAr: "مختبر تحصين سياسات IAM السحابية وتطبيق أقل الامتيازات",
  challengeTitleEn: "Cloud IAM Policy Hardening & Role Challenge"
},
  21: {
  id: 21,
  slug: "iac-security-terraform",
  macroDomainId: "E",
  titleAr: "أمن البنية التحتية ككود (IaC Security & Terraform)",
  titleEn: "Infrastructure as Code (IaC) Security & Drift Detection",
  subtitleAr: "فحص ملفات Terraform/CloudFormation واكتشاف التكوينات الخاطئة قبل النشر",
  subtitleEn: "Static IaC Scanning, Policy-as-Code (OPA/Checkov) & Configuration Drift",
  descriptionAr: "افحص أكواد البنية التحتية البرمجية (Terraform): اكتشف منافذ SSH المفتوحة لجميع العناوين (0.0.0.0/0) ووحدات التخزين غير المشفرة قبل إنشائها في السحابة.",
  descriptionEn: "Audit Terraform templates using Policy-as-Code rules: catch open security groups and unencrypted disks at build time.",
  difficulty: "Intermediate",
  simulationType: "cloud_containers",
  iconName: "Workflow",
  prerequisites: [
    18,
    20
  ],
  relatedWorlds: [
    18,
    20,
    22
  ],
  concepts: [
    {
      id: "policy_as_code",
      nameAr: "الأمان ككود (Policy-as-Code)",
      nameEn: "Policy as Code Frameworks",
      briefAr: "كتابة قواعد الأمان كأكواد برمجية تفحص قوالب IaC وتمنع نشر أي بنية مخالفة.",
      briefEn: "Enforcing security guardrails automatically via declarative policy engines (e.g. Open Policy Agent).",
      securityRelevanceAr: "منع نشر أخطاء التكوين السحابية في بيئة الإنتاج الحقيقية.",
      securityRelevanceEn: "Prevents insecure cloud infrastructure from ever being provisioned.",
      controlsAr: [
        "فحص Checkov / tfsec",
        "بوابات الفحص الإلزامية في CI/CD"
      ],
      controlsEn: [
        "Checkov / tfsec Scanners",
        "Mandatory Merge Blocking Gates"
      ]
    }
  ],
  practicalObjectivesAr: [
    "فحص كود Terraform وإصلاح منافذ الدخول المفتوحة",
    "تفعيل التشفير الإجباري لوحدات التخزين في الكود"
  ],
  practicalObjectivesEn: [
    "Scan Terraform code and restrict 0.0.0.0/0 ingress",
    "Enforce default KMS encryption in IaC templates"
  ],
  challengeTitleAr: "تحدي فحص وتأمين قوالب البنية التحتية ككود (IaC)",
  challengeTitleEn: "IaC Policy-as-Code & Terraform Hardening Challenge"
},
  23: {
  id: 23,
  slug: "serverless-api-gateway",
  macroDomainId: "E",
  titleAr: "أمن البنى عديمة الخوادم (Serverless) والدوال Lambda",
  titleEn: "Serverless Security & Function Isolation",
  subtitleAr: "عزل دوال Lambda، إدارة الأسرار السحابية، والتحكم بزمن التنفيذ",
  subtitleEn: "Lambda Function IAM Scopes, Secret Managers & Cold Start Isolation",
  descriptionAr: "استكشف عمارة Serverless الأمنية: حدد الصلاحيات الفردية لكل دالة برمجية، وتجنب منح صلاحيات واسعة لـ Lambda وافحص مسارات استدعاء الأحداث.",
  descriptionEn: "Interactive Serverless architecture: bind least-privilege IAM roles to discrete Lambda micro-functions and secure event sources.",
  difficulty: "Intermediate",
  simulationType: "cloud_containers",
  iconName: "Boxes",
  prerequisites: [
    10,
    18
  ],
  relatedWorlds: [
    10,
    18,
    20,
    22
  ],
  concepts: [
    {
      id: "serverless_isolation",
      nameAr: "عزل صلاحيات الدوال عديمة الخوادم",
      nameEn: "Per-Function Micro-IAM Isolation",
      briefAr: "منح كل دالة Lambda فقط الصلاحيات اللازمة لجدول قاعدة البيانات أو وحدة التخزين الخاصة بها.",
      briefEn: "Assigning dedicated execution roles per function rather than sharing broad monolithic roles.",
      securityRelevanceAr: "منع استغلال ثغرة في دالة واحدة للوصول لكامل بيانات المؤسسة.",
      securityRelevanceEn: "Isolates function compromise to its minimal assigned resource scope.",
      controlsAr: [
        "أدوار تنفيذ مخصصة لكل دالة",
        "استدعاء الأسرار من Secrets Manager ديناميكياً"
      ],
      controlsEn: [
        "Dedicated Lambda Roles",
        "Dynamic Secrets Manager Retrieval"
      ]
    }
  ],
  practicalObjectivesAr: [
    "فصل أدوار الدوال المشتركة إلى أدوار أحادية",
    "التحقق من تشفير المتغيرات البيئية"
  ],
  practicalObjectivesEn: [
    "Isolate monolithic Lambda roles into dedicated execution scopes",
    "Verify environment variable encryption"
  ],
  challengeTitleAr: "مختبر تأمين التطبيقات عديمة الخوادم وحماية الدوال",
  challengeTitleEn: "Serverless & Lambda Function Security Lab"
},
  25: {
  id: 25,
  slug: "detection-engineering",
  macroDomainId: "F",
  titleAr: "هندسة الاكتشاف وقواعد Sigma وتتبع إطار MITRE ATT&CK",
  titleEn: "Detection Engineering & Sigma Rules (MITRE ATT&CK)",
  subtitleAr: "تحويل تكتيكات المهاجمين إلى قواعد اكتشاف دقيقة ومنخفضة الإنذارات الكاذبة",
  subtitleEn: "Translating Adversary TTPs into Sigma/YARA Detection Signatures",
  descriptionAr: "اكتب واختبر قواعد الاكتشاف الأمني بصيغة Sigma: طابق تقنيات MITRE ATT&CK (مثل التخفي وجمع البيانات) واختبر القاعدة ضد تدفق الأحداث للتأكد من انعدام الإنذارات الكاذبة.",
  descriptionEn: "Interactive detection engineering workbench: author Sigma rules against MITRE ATT&CK techniques and validate against live event telemetry.",
  difficulty: "Advanced",
  simulationType: "siem",
  iconName: "Activity",
  prerequisites: [
    24
  ],
  relatedWorlds: [
    4,
    6,
    24,
    26,
    28
  ],
  concepts: [
    {
      id: "sigma_rule_engine",
      nameAr: "قواعد الاكتشاف القياسية (Sigma Rules)",
      nameEn: "Sigma Generic Detection Format",
      briefAr: "لغة موحدة لكتابة قواعد رصد الهجمات وتصديرها لأي منصة SIEM مثل Splunk و Elastic و QRadar.",
      briefEn: "Generic signature format translatable into proprietary SIEM query dialects.",
      securityRelevanceAr: "مشاركة واختبار قواعد الاكتشاف فور الإعلان عن أساليب هجومية جديدة.",
      securityRelevanceEn: "Enables rapid threat hunting and cross-platform detection portability.",
      controlsAr: [
        "مطابقة مصفوفة MITRE ATT&CK",
        "تقليل نسبة الإنذارات الخاطئة (False Positives)"
      ],
      controlsEn: [
        "MITRE TTP Mapping",
        "False Positive Baseline Tuning"
      ]
    }
  ],
  practicalObjectivesAr: [
    "كتابة قاعدة Sigma لرصد تنفيذ PowerShell المشفر",
    "مطابقة الحدث مع تقنية T1059 في MITRE"
  ],
  practicalObjectivesEn: [
    "Author Sigma rule detecting encoded PowerShell execution",
    "Map telemetry to MITRE ATT&CK T1059"
  ],
  challengeTitleAr: "تحدي هندسة الاكتشاف وكتابة قواعد Sigma الذكية",
  challengeTitleEn: "Sigma Rule Authoring & Detection Engineering Challenge"
},
  26: {
  id: 26,
  slug: "threat-intelligence-soar",
  macroDomainId: "F",
  titleAr: "معلومات التهديدات السيبرانية (CTI) والاستجابة الآلية (SOAR)",
  titleEn: "Cyber Threat Intelligence (CTI) & SOAR Automation",
  subtitleAr: "مؤشرات الاختراق IOCs، خلاصة التهديدات STIX/TAXII، وسيناريوهات الاستجابة الآلية",
  subtitleEn: "IOC Indicators, STIX/TAXII Threat Feeds & Automated SOAR Playbooks",
  descriptionAr: "ادمج معلومات التهديدات الحية مع مركز العمليات: استقبل مؤشرات الاختراق (IOCs) المشبوهة، وطبق سيناريوهات الاستجابة الآلية (SOAR Playbooks) لحظر المهاجمين في ثوانٍ.",
  descriptionEn: "Interactive Threat Intel & SOAR orchestrator: ingest STIX/TAXII threat feeds and execute automated triage playbooks.",
  difficulty: "Advanced",
  simulationType: "siem",
  iconName: "Activity",
  prerequisites: [
    24,
    25
  ],
  relatedWorlds: [
    4,
    24,
    25,
    28
  ],
  concepts: [
    {
      id: "soar_playbooks",
      nameAr: "سيناريوهات الأتمتة والاستجابة (SOAR Playbooks)",
      nameEn: "Automated SOAR Security Playbooks",
      briefAr: "خطوات برمجية متتالية تنفذ تلقائياً عند وقوع حادث: فحص IP + حظره في جدار الحماية + عزل المستخدم + إشعار الفريق.",
      briefEn: "Automated workflows triggered on alerts: enrich IP -> block at firewall -> isolate user -> notify analyst.",
      securityRelevanceAr: "تقليص زمن الاستجابة للهجمات من ساعات إلى أجزاء من الثانية (MTTR).",
      securityRelevanceEn: "Radically accelerates Mean Time to Respond (MTTR) against automated threats.",
      controlsAr: [
        "أتمتة الحظر المشروط",
        "تغذية مؤشرات IOC المحدثة"
      ],
      controlsEn: [
        "Conditional Automated Containment",
        "Live Threat Feed Ingestion"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تغذية عناوين IP خبيثة من خلاصة التهديدات CTI",
    "تشغيل سيناريو SOAR لحظر العناوين على الجدار المحيطي"
  ],
  practicalObjectivesEn: [
    "Ingest malicious IP feeds via CTI connector",
    "Execute automated SOAR playbook to enforce perimeter block"
  ],
  challengeTitleAr: "مختبر أتمتة الاستجابة للتهديدات وتشغيل سيناريوهات SOAR",
  challengeTitleEn: "SOAR Playbook Automation & Threat Intelligence Lab"
},
  27: {
  id: 27,
  slug: "network-traffic-analysis-pcap",
  macroDomainId: "F",
  titleAr: "تحليل حركة مرور الشبكة وفحص الحزم (PCAP / Wireshark)",
  titleEn: "Network Traffic Analysis (NTA) & Packet Capture (PCAP)",
  subtitleAr: "فحص الحزم العميقة، استخراج الملفات، وتحليل قنوات الاتصال بالقيادة C2",
  subtitleEn: "Deep Packet Inspection, Protocol Breakdown, Payload Carving & C2 Beaconing",
  descriptionAr: "حلل ملفات حركة الشبكة PCAP كخبير شبكات: افحص الترويسات الخام، واكتشف إشارات الاتصال الدوري بخوادم المهاجم (C2 Beacons)، واستخرج الحمولات المسربة.",
  descriptionEn: "Interactive Packet Analyzer: dissect raw PCAP frames, calculate beaconing jitter to uncover C2 callbacks, and carve transmitted payloads.",
  difficulty: "Intermediate",
  simulationType: "subnet_routing",
  iconName: "Network",
  prerequisites: [
    3,
    4,
    8
  ],
  relatedWorlds: [
    3,
    4,
    8,
    24,
    30
  ],
  concepts: [
    {
      id: "c2_beaconing_detection",
      nameAr: "رصد إشارات الاتصال بخوادم القيادة والتحكم (C2 Beacons)",
      nameEn: "C2 Command & Control Beaconing Detection",
      briefAr: "اتصالات دورية ثابتة الفاصل الزمني تجريها البرمجيات الخبيثة مع خادم المهاجم لتلقي الأوامر.",
      briefEn: "Periodic network callbacks made by compromised implants to receive instructions from adversary infrastructure.",
      securityRelevanceAr: "اكتشاف الأجهزة المخترقة داخل الشبكة حتى لو كانت البرمجية الخبيثة غير معروفة.",
      securityRelevanceEn: "Exposes active footholds through behavioral network repetition analysis.",
      controlsAr: [
        "مراقبة تدفق NetFlow / Zeek",
        "حظر النطاقات المشبوهة عبر DNS Sinkholing"
      ],
      controlsEn: [
        "NetFlow / Zeek Flow Analysis",
        "Automated DNS Sinkholing"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تحليل الفواصل الزمنية لحزم الشبكة لكشف الاتصال الدوري",
    "تحديد عنوان خادم التحكم C2 وحظره"
  ],
  practicalObjectivesEn: [
    "Analyze packet interval timing to detect periodic C2 beaconing",
    "Identify and blacklist remote C2 controller IP"
  ],
  challengeTitleAr: "تحدي تحليل حزم الشبكة واكتشاف قنوات التحكم C2",
  challengeTitleEn: "PCAP Traffic Analysis & C2 Beaconing Challenge"
},
  29: {
  id: 29,
  slug: "incident-response-lifecycle",
  macroDomainId: "G",
  titleAr: "دورة حياة الاستجابة للحوادث السيبرانية (NIST SP 800-61)",
  titleEn: "Incident Response Lifecycle & Containment Strategy",
  subtitleAr: "التحضير، الكشف والتحليل، الاحتواء والاستئصال، والتعافي واستخلاص الدروس",
  subtitleEn: "Preparation, Detection, Containment, Eradication, Recovery & Lessons Learned",
  descriptionAr: "قُد فريق الاستجابة للحوادث: اتخذ القرارات التكتيكية عند وقوع اختراق، وازن بين عزل الأنظمة أو تركها لجمع الأدلة، ونفذ خطة التعافي السريع.",
  descriptionEn: "Interactive Incident Response orchestrator: lead crisis triage through NIST 800-61 phases, balance containment speed vs evidence preservation.",
  difficulty: "Intermediate",
  simulationType: "threat_hunting",
  iconName: "ShieldAlert",
  prerequisites: [
    24,
    28
  ],
  relatedWorlds: [
    24,
    28,
    30,
    31
  ],
  concepts: [
    {
      id: "nist_ir_lifecycle",
      nameAr: "مراحل الاستجابة للحوادث وفق NIST",
      nameEn: "NIST Incident Response Phases",
      briefAr: "منهجية معيارية تبدأ بالاستعداد المسبق وتنتهي بالتعافي واستخلاص الدروس لمنع تكرار الهجوم.",
      briefEn: "Structured lifecycle: Preparation -> Detection & Analysis -> Containment, Eradication & Recovery -> Post-Incident Activity.",
      securityRelevanceAr: "تقليل الخسائر المالية وحماية سمعة المؤسسة والامتثال للمتطلبات التنظيمية.",
      securityRelevanceEn: "Minimizes operational downtime and regulatory non-compliance exposure.",
      controlsAr: [
        "خطط الاستجابة المعتمدة (IR Playbooks)",
        "سلسلة القيادة والاتصال أثناء الأزمات"
      ],
      controlsEn: [
        "Standardized IR Playbooks",
        "Out-of-Band Crisis Communication Matrix"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تنفيذ خطوات الاحتواء السريع عند اكتشاف تسريب بيانات",
    "إصدار تقرير استخلاص الدروس المستفادة"
  ],
  practicalObjectivesEn: [
    "Execute rapid containment workflow on confirmed breach",
    "Compile post-incident root cause report"
  ],
  challengeTitleAr: "مختبر قيادة الاستجابة للحوادث واحتواء الاختراق المؤسسي",
  challengeTitleEn: "Incident Response Lifecycle & Crisis Containment Lab"
},
  30: {
  id: 30,
  slug: "threat-hunting-hypothesis",
  macroDomainId: "G",
  titleAr: "صيد التهديدات المتقدم وصياغة الفرضيات (Threat Hunting)",
  titleEn: "Proactive Threat Hunting & Hypothesis-Driven Investigation",
  subtitleAr: "البحث الاستباقي عن المهاجمين دون انتظار إنذار، وصيد أدوات LOLBAS",
  subtitleEn: "Hypothesis Generation, Telemetry Baseline Deviation & LOLBAS Hunting",
  descriptionAr: "لا تنتظر وصول إنذار SIEM: ابنِ فرضية أمنية، وابحث في سجلات العمليات والشبكة عن سلوكيات خفية مثل استغلال أوامر النظام المزدوجة (Certutil / Rundll32).",
  descriptionEn: "Interactive Threat Hunting workbench: construct offensive hypotheses, query endpoint telemetry for Living-off-the-Land (LOLBAS) anomalies.",
  difficulty: "Advanced",
  simulationType: "threat_hunting",
  iconName: "Search",
  prerequisites: [
    25,
    28
  ],
  relatedWorlds: [
    5,
    6,
    24,
    28,
    31
  ],
  concepts: [
    {
      id: "lolbas_hunting",
      nameAr: "صيد أدوات النظام المزدوجة الاستخدام (LOLBAS)",
      nameEn: "Living off the Land Binaries (LOLBAS)",
      briefAr: "استخدام المهاجمين لأدوات نظام التشغيل الرسمية (مثل certutil لتنزيل الملفات أو mshta لتشغيل السكربتات) لتفادي مكافحات الفيروسات.",
      briefEn: "Adversaries abusing legitimate built-in operating system binaries to execute payloads without dropping new binaries.",
      securityRelevanceAr: "كشف الهجمات المتقدمة التي لا تترك ملفات خبيثة تقليدية على القرص.",
      securityRelevanceEn: "Detects stealthy, fileless intrusions evading signature-based antivirus.",
      controlsAr: [
        "مراقبة وسائط سطر الأوامر للعمليات",
        "تفعيل سياسات AppLocker / WDAC"
      ],
      controlsEn: [
        "Command-Line Telemetry Auditing",
        "Windows Defender Application Control (WDAC)"
      ]
    }
  ],
  practicalObjectivesAr: [
    "صياغة فرضية صيد حول إساءة استخدام أداة Certutil",
    "اكتشاف وتتبع العملية المخفية في السجلات"
  ],
  practicalObjectivesEn: [
    "Formulate hunting hypothesis for Certutil network egress",
    "Uncover hidden parent-child process execution"
  ],
  challengeTitleAr: "تحدي صيد التهديدات الاستباقي وكشف أدوات LOLBAS",
  challengeTitleEn: "Proactive Threat Hunting & LOLBAS Discovery Challenge"
},
  32: {
  id: 32,
  slug: "memory-forensics-volatility",
  macroDomainId: "G",
  titleAr: "التحقيق الجنائي في الذاكرة الحية (Memory Forensics)",
  titleEn: "Volatile Memory Forensics & Rootkit Inspection",
  subtitleAr: "تحليل تفريغ الذاكرة (RAM Dump)، كشف حقن الأكواد وعمليات Hollowed",
  subtitleEn: "Memory Dump Analysis, Process Injection (Process Hollowing) & Hidden Mutexes",
  descriptionAr: "استكشف ما تخفيه الذاكرة العشوائية: افحص تفريغ RAM، واكتشف تقنيات حقن الأكواد (DLL Injection و Process Hollowing)، واستخرج مفاتيح التشفير الحية.",
  descriptionEn: "Interactive Memory Forensics workbench: inspect memory dumps, detect injected DLLs, unhook kernel tables, and dump volatile crypto keys.",
  difficulty: "Expert",
  simulationType: "threat_hunting",
  iconName: "Search",
  prerequisites: [
    2,
    28,
    31
  ],
  relatedWorlds: [
    2,
    5,
    6,
    28,
    31
  ],
  concepts: [
    {
      id: "process_hollowing",
      nameAr: "تقنية تفريغ وحقن العمليات (Process Hollowing)",
      nameEn: "Process Hollowing & Code Injection",
      briefAr: "تشغيل عملية شرعية في حالة تعليق، واستبدال كود الذاكرة الداخلي الخاص بها بكود خبيث مع الإبقاء على اسمها الرسمي.",
      briefEn: "Spawning a legitimate process in a suspended state, hollowing out its memory, and replacing it with malicious payload.",
      securityRelevanceAr: "خداع برامج المراقبة التي تظن أن العملية الشرعية مثل svchost.exe تعمل بصورة طبيعية.",
      securityRelevanceEn: "Deceives task managers and legacy EDR into treating malicious payload as trusted binary.",
      controlsAr: [
        "فحص أذونات صفحات الذاكرة (PAGE_EXECUTE_READWRITE)",
        "مراقبة استدعاءات NtUnmapViewOfSection"
      ],
      controlsEn: [
        "RWX Memory Page Auditing",
        "API Hooking on Process Injection Primitives"
      ]
    }
  ],
  practicalObjectivesAr: [
    "فحص صفحات الذاكرة ذات صلاحية التنفيذ والكتابة معاً RWX",
    "استخراج كود الحمولة المحقونة في العملية"
  ],
  practicalObjectivesEn: [
    "Inspect memory pages with RWX permissions",
    "Carve and dump injected payload from hollowed process"
  ],
  challengeTitleAr: "مختبر التحقيق الجنائي في الذاكرة وكشف العمليات الملغومة",
  challengeTitleEn: "Memory Forensics & Process Injection Analysis Lab"
},
  33: {
  id: 33,
  slug: "malware-analysis-sandboxing",
  macroDomainId: "G",
  titleAr: "تحليل البرمجيات الخبيثة وسلوكيات البيئات المعزولة (Sandboxing)",
  titleEn: "Dynamic Malware Analysis & Behavioral Sandboxing",
  subtitleAr: "التحليل الثابت والديناميكي، فحص استدعاءات API، ورصد آليات الهروب",
  subtitleEn: "Static PE Dissection, API Call Hooks, Sandbox Evasion & Dynamic Telemetry",
  descriptionAr: "حلل عينة برمجية مشبوهة داخل بيئة معزولة (Sandbox): افحص ترويسات PE، وتتبع اتصالاتها ومحاولاتها للهروب من البيئة الافتراضية واكتشاف معدات المراقبة.",
  descriptionEn: "Interactive Malware Sandbox: detonate suspicious binaries, monitor file drops, registry persistence hooks, and anti-analysis evasion tactics.",
  difficulty: "Advanced",
  simulationType: "threat_hunting",
  iconName: "ShieldAlert",
  prerequisites: [
    2,
    5,
    28
  ],
  relatedWorlds: [
    2,
    6,
    28,
    31,
    32
  ],
  concepts: [
    {
      id: "sandbox_evasion",
      nameAr: "تقنيات الهروب من بيئات التحليل (Anti-Analysis & Evasion)",
      nameEn: "Sandbox Evasion Tactics",
      briefAr: "فحص البرمجية الخبيثة لحجم الذاكرة، عدد المعالجات، أو حركة الفأرة للتأكد أنها لا تعمل داخل بيئة محلل أمني.",
      briefEn: "Malware detecting hypervisor artifacts, low RAM, or lack of mouse movement to remain dormant during sandbox inspection.",
      securityRelevanceAr: "تفادي كشف التهديدات المتقدمة في البوابات التلقائية.",
      securityRelevanceEn: "Bypasses automated perimeter sandboxes by delaying malicious behavior.",
      controlsAr: [
        "محاكاة التفاعل البشري في البيئات المعزولة",
        "تسريع توقيت النظام لاختبار آليات النوم (Sleep Calls)"
      ],
      controlsEn: [
        "Simulated User Interaction",
        "Time-Warping Sleep Fast-Forwarding"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تشغيل العينة ومراقبة مفاتيح السجل التي تم تعديلها للبقاء (Persistence)",
    "كشف محاولات فحص البيئة الافتراضية"
  ],
  practicalObjectivesEn: [
    "Detonate sample and observe registry Run keys modified for persistence",
    "Identify virtual machine fingerprinting attempts"
  ],
  challengeTitleAr: "تحدي تحليل البرمجيات الخبيثة وتتبع سلوكيات التخفي",
  challengeTitleEn: "Malware Behavior Analysis & Sandboxing Challenge"
},
  34: {
  id: 34,
  slug: "root-cause-chain-of-custody",
  macroDomainId: "G",
  titleAr: "تحديد السبب الجذري وسلسلة الحيازة القانونية للأدلة",
  titleEn: "Root Cause Analysis (RCA) & Legal Chain of Custody",
  subtitleAr: "توثيق الأدلة، حساب بصمات SHA-256، وبناء تقرير الحادث القانوني",
  subtitleEn: "Forensic Hashing, Evidence Preservation & Executive Root Cause Reporting",
  descriptionAr: "اختتم التحقيق الجنائي باحترافية: وثق سلسلة حيازة الأدلة الرقمية ببصمات تجزئة لا تقبل الطعن، وحدد السبب الجذري للاختراق واكتب التوصيات التنفيذية.",
  descriptionEn: "Interactive Forensic Report Builder: calculate SHA-256 evidence hashes, enforce legal chain of custody, and author executive root-cause remediations.",
  difficulty: "Intermediate",
  simulationType: "threat_hunting",
  iconName: "BookOpen",
  prerequisites: [
    15,
    29,
    31
  ],
  relatedWorlds: [
    15,
    29,
    31,
    51
  ],
  concepts: [
    {
      id: "chain_of_custody",
      nameAr: "سلسلة حيازة الأدلة الرقمية (Chain of Custody)",
      nameEn: "Forensic Chain of Custody",
      briefAr: "سجل زمني يوثق كل من استلم أو فحص الدليل الرقمي مع بصمة الهاش لضمان عدم التلاعب به أمام المحاكم.",
      briefEn: "Chronological documentation showing custody, control, transfer, and hash integrity of digital evidence.",
      securityRelevanceAr: "قبول الأدلة الرقمية في الملاحقات القانونية والمحاكمات الجنائية.",
      securityRelevanceEn: "Ensures evidence admissibility in legal and regulatory proceedings.",
      controlsAr: [
        "حساب بصمة SHA-256 فور التحريز",
        "حفظ النسخ الأصلية للقراءة فقط"
      ],
      controlsEn: [
        "Immediate Forensic Hashing",
        "Write-Blocked Read-Only Image Archival"
      ]
    }
  ],
  practicalObjectivesAr: [
    "حساب ومقارنة بصمة التجزئة لصورة القرص الجنائي",
    "إعداد تقرير السبب الجذري وخطة سد الثغرات"
  ],
  practicalObjectivesEn: [
    "Compute and verify SHA-256 forensic image digest",
    "Compile root cause remediation action plan"
  ],
  challengeTitleAr: "مختبر توثيق الأدلة الجنائية وتحديد السبب الجذري للاختراق",
  challengeTitleEn: "Digital Evidence Integrity & Root Cause Analysis Lab"
},
  35: {
  id: 35,
  slug: "enterprise-security-architecture",
  macroDomainId: "H",
  titleAr: "الهندسة المعمارية الأمنية للمؤسسات ومناطق الثقة (SABSA)",
  titleEn: "Enterprise Security Architecture & Trust Zones",
  subtitleAr: "تقسيم المناطق، بوابات العبور الآمنة، وعمارة الدفاع في العمق",
  subtitleEn: "Security Zones, Bastion Gateways, DMZ Tiering & Defense-in-Depth",
  descriptionAr: "صمم المعمارية الأمنية لمؤسسة كبرى: قسّم الشبكة إلى مناطق ثقة متدرجة (خارجية، DMZ، خوادم، وقواعد بيانات)، وافرض الرقابة الصارمة بين الحدود.",
  descriptionEn: "Interactive Enterprise Architect: blueprint hierarchical trust zones, position bastion jump hosts, and enforce layered perimeter defenses.",
  difficulty: "Advanced",
  simulationType: "zero_trust",
  iconName: "Shield",
  prerequisites: [
    3,
    4,
    18
  ],
  relatedWorlds: [
    3,
    4,
    18,
    38
  ],
  concepts: [
    {
      id: "defense_in_depth_zones",
      nameAr: "الدفاع في العمق ومناطق الثقة المتدرجة",
      nameEn: "Defense in Depth & Tiered Security Zones",
      briefAr: "وضع طبقات حماية متعددة بحيث لا يؤدي سقوط خط دفاعي واحد إلى انهيار المنظومة بالكامل.",
      briefEn: "Layering distinct defensive controls so the failure of any single component does not compromise security.",
      securityRelevanceAr: "إحباط الهجمات المعقدة ومنع التحرك الجانبي السهل.",
      securityRelevanceEn: "Forces adversaries to defeat multiple dissimilar security hurdles.",
      controlsAr: [
        "عزل الخوادم خلف قفزة إدارية Bastion",
        "فصل شبكات الإدارة عن شبكات المستخدمين"
      ],
      controlsEn: [
        "Bastion Jump Hosts",
        "Out-of-Band Management VLANs"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تصميم حدود العزل بين طبقة الويب وقاعدة البيانات الحساسة",
    "إلغاء الاتصال المباشر بين الإنترنت والمستودع الداخلي"
  ],
  practicalObjectivesEn: [
    "Enforce trust boundary between web tier and database storage",
    "Eliminate direct routing between WAN and internal records"
  ],
  challengeTitleAr: "تحدي تصميم المعمارية الأمنية للمؤسسات ومناطق الثقة",
  challengeTitleEn: "Enterprise Trust Zone & Defense-in-Depth Challenge"
},
  36: {
  id: 36,
  slug: "vulnerability-management-cvss",
  macroDomainId: "H",
  titleAr: "إدارة دورة حياة الثغرات الأمنية ومصفوفة تقييم الخطورة (CVSS)",
  titleEn: "Vulnerability Management Lifecycle & CVSS Scoring",
  subtitleAr: "فحص الثغرات، حساب درجات CVSS v3.1، وترتيب أولويات المعالجة بالاعتماد على EPSS",
  subtitleEn: "Vulnerability Scanning, Base/Temporal CVSS Scores & EPSS Exploit Probability",
  descriptionAr: "أدر مخاطر الثغرات في منظومتك: احسب درجات خطورة CVSS بناءً على سهولة الاستغلال والأثر، ورتب خطة المعالجة وسد الثغرات قبل استغلالها من المهاجمين.",
  descriptionEn: "Interactive Vulnerability Management matrix: calculate CVSS v3.1 vectors, weigh exploit probability (EPSS), and prioritize patch remediation cycles.",
  difficulty: "Intermediate",
  simulationType: "zero_trust",
  iconName: "ShieldAlert",
  prerequisites: [
    1,
    9
  ],
  relatedWorlds: [
    1,
    9,
    35,
    37
  ],
  concepts: [
    {
      id: "cvss_vector_calculation",
      nameAr: "معيار تقييم خطورة الثغرات (CVSS v3.1)",
      nameEn: "Common Vulnerability Scoring System (CVSS)",
      briefAr: "مقياس رقمي من 0 إلى 10 يحدد خطورة الثغرة بناءً على متجه الهجوم، الصلاحيات المطلوبة، وتأثيرها على السرية والسلامة والتوافر.",
      briefEn: "Industry standard metric quantifying vulnerability severity from 0.0 to 10.0 across exploitability and impact dimensions.",
      securityRelevanceAr: "توجيه جهود فرق الأمن لمعالجة الثغرات الأكثر تهديداً للمؤسسة أولاً.",
      securityRelevanceEn: "Drives risk-informed patch prioritization and SLA remediation enforcement.",
      controlsAr: [
        "فحص دوري للثغرات",
        "تطبيق التحديثات وفق اتفاقيات مستوى الخدمة (SLAs)"
      ],
      controlsEn: [
        "Automated Vulnerability Scanning",
        "Risk-Based Patch SLA Windows"
      ]
    }
  ],
  practicalObjectivesAr: [
    "حساب درجة CVSS لثغرة تنفيذ أوامر عن بعد (RCE)",
    "تحديد موعد المعالجة الطارئ وفق اتفاقية SLA"
  ],
  practicalObjectivesEn: [
    "Calculate CVSS v3.1 base score for unauthenticated RCE",
    "Enforce critical patch remediation within 24h SLA"
  ],
  challengeTitleAr: "مختبر تقييم خطورة الثغرات وترتيب أولويات المعالجة",
  challengeTitleEn: "CVSS Scoring & Vulnerability Prioritization Lab"
},
  37: {
  id: 37,
  slug: "penetration-testing-red-teaming",
  macroDomainId: "H",
  titleAr: "اختبار الاختراق والتمارين الهجومية (Red Teaming)",
  titleEn: "Penetration Testing Methodology & Red Teaming Ops",
  subtitleAr: "الاستطلاع، فحص الثغرات، استغلال الهدف، التثبيت، والتحرك الجانبي",
  subtitleEn: "Reconnaissance, Exploitation Chains, Persistence & Lateral Movement Simulation",
  descriptionAr: "فكر كالمهاجم لاختبار دفاعاتك: تتبع مراحل اختبار الاختراق الأخلاقي، افحص أسطح الهجوم المفتوحة، وافهم كيف يربط المهاجمون عدة ثغرات بسيطة لاختراق النظام.",
  descriptionEn: "Interactive Red Team campaign simulator: chain reconnaissance, initial access, privilege escalation, and lateral movement to test defensive posture.",
  difficulty: "Advanced",
  simulationType: "zero_trust",
  iconName: "Target",
  prerequisites: [
    4,
    9,
    16
  ],
  relatedWorlds: [
    4,
    7,
    9,
    16,
    24
  ],
  concepts: [
    {
      id: "kill_chain_exploitation",
      nameAr: "سلسلة الهجوم السيبراني (Cyber Kill Chain)",
      nameEn: "Cyber Kill Chain & Attack Chaining",
      briefAr: "ربط مراحل الهجوم من الاستطلاع المبدئي حتى تحقيق الهدف النهائي وسرقة البيانات.",
      briefEn: "Systematic model identifying what an adversary must complete to achieve their operational objective.",
      securityRelevanceAr: "تمكين المدافعين من قطع مسار الهجوم في أي مرحلة لإفشال العملية بالكامل.",
      securityRelevanceEn: "Allows defenders to deploy early tripwires that break attack chains before data loss.",
      controlsAr: [
        "اختبارات الاختراق الدورية",
        "تمارين الفرق الحمراء والزرقاء (Purple Teaming)"
      ],
      controlsEn: [
        "Periodic Penetration Testing",
        "Collaborative Purple Team Exercises"
      ]
    }
  ],
  practicalObjectivesAr: [
    "محاكاة مسار الهجوم المتسلسل من فحص المنافذ إلى الدخول الأولي",
    "رصد وتفعيل حواجز المقاومة الدفاعية لقطع السلسلة"
  ],
  practicalObjectivesEn: [
    "Simulate kill chain progression from recon to initial foothold",
    "Deploy defensive interlocks to disrupt attack chain"
  ],
  challengeTitleAr: "تحدي محاكاة الهجوم الأخلاقي واختبار صلابة الدفاعات",
  challengeTitleEn: "Penetration Testing & Kill Chain Disruption Challenge"
},
  39: {
  id: 39,
  slug: "symmetric-asymmetric-ciphers",
  macroDomainId: "D",
  titleAr: "التشفير المتناظر وغير المتناظر (AES & RSA/ECC)",
  titleEn: "Symmetric & Asymmetric Encryption Mechanics",
  subtitleAr: "تشفير الكتل AES-GCM، أزواج المفاتيح العامة والخاصة، وتبادل ديفي-هيلمان",
  subtitleEn: "AES-256-GCM Block Modes, RSA Public/Private Math & Diffie-Hellman Key Exchange",
  descriptionAr: "اختبر الرياضيات الكامنة خلف حماية البيانات: شفر نصوصاً باستخدام مفاتيح AES المتناظرة، وجرب التشفير غير المتناظر بالمفتاح العام وفك التشفير بالمفتاح الخاص.",
  descriptionEn: "Interactive cryptography sandbox: compare AES symmetric block cipher throughput with RSA/ECC asymmetric key pairs and Diffie-Hellman negotiation.",
  difficulty: "Intermediate",
  simulationType: "crypto",
  iconName: "Key",
  prerequisites: [
    15
  ],
  relatedWorlds: [
    1,
    15,
    40
  ],
  concepts: [
    {
      id: "symmetric_vs_asymmetric",
      nameAr: "الفرق بين التشفير المتناظر وغير المتناظر",
      nameEn: "Symmetric vs Asymmetric Cryptography",
      briefAr: "التشفير المتناظر يستخدم نفس المفتاح للطرفين (سريع للبيانات الضخمة)، بينما غير المتناظر يستخدم زوج مفاتيح (عام للتشفير وخاص لفك التشفير).",
      briefEn: "Symmetric uses a shared secret for fast bulk encryption; Asymmetric uses key pairs for secure key exchange and signatures.",
      securityRelevanceAr: "الجمع بينهما هو ما يبني بروتوكولات الإنترنت الآمنة مثل HTTPS و SSH.",
      securityRelevanceEn: "Hybrid cryptography enables fast, secure end-to-end transport globally.",
      controlsAr: [
        "مفاتيح تشفير بطول كافٍ (AES-256 / RSA-4096 / ECC-256)",
        "حماية المفاتيح الخاصة في وحدات HSM"
      ],
      controlsEn: [
        "Cryptographically Strong Key Sizes",
        "Hardware Security Modules (HSM)"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تشفير رسالة بمفتاح AES-256 والتحقق من استحالة قراءتها",
    "استخدام المفتاح العام لتشفير جلسة المفتاح المتناظر"
  ],
  practicalObjectivesEn: [
    "Encrypt plaintext with AES-256-GCM and verify ciphertext",
    "Exchange symmetric session key via public key encryption"
  ],
  challengeTitleAr: "مختبر التشفير الهجين وتوليد المفاتيح المتناظرة وغير المتناظرة",
  challengeTitleEn: "Hybrid Encryption & Key Exchange Workshop Lab"
},
  40: {
  id: 40,
  slug: "digital-signatures-certificates",
  macroDomainId: "D",
  titleAr: "التوقيع الرقمي، عدم الإنكار، والشهادات الرقمية X.509",
  titleEn: "Digital Signatures, Non-Repudiation & X.509 Certificate Anatomy",
  subtitleAr: "التوقيع بالمفتاح الخاص، التحقق بالمفتاح العام، وقوائم إبطال الشهادات CRL/OCSP",
  subtitleEn: "ECDSA Signatures, Mathematical Non-Repudiation, ASN.1 & OCSP Revocation Checking",
  descriptionAr: "افحص البصمات الرقمية: وقع مستندات رقمياً بالمفتاح الخاص، وافحص تفاصيل شهادة X.509، واختبر إلغاء الشهادات المسروقة عبر بروتوكول OCSP.",
  descriptionEn: "Interactive Digital Signature studio: sign payload hashes with private keys, verify mathematical integrity, and inspect X.509 certificate revocation status.",
  difficulty: "Intermediate",
  simulationType: "crypto",
  iconName: "Key",
  prerequisites: [
    15,
    39
  ],
  relatedWorlds: [
    15,
    16,
    39
  ],
  concepts: [
    {
      id: "digital_signature_math",
      nameAr: "التوقيع الرقمي وعدم الإنكار",
      nameEn: "Digital Signatures & Non-Repudiation",
      briefAr: "تشفير هاش المستند بالمفتاح الخاص للمرسل؛ يستطيع أي شخص يملك المفتاح العام التحقق من هوية المرسل وسلامة البيانات دون قدرة المرسل على الإنكار.",
      briefEn: "Encrypting a hash with a private key proves sender authenticity, data integrity, and enforces non-repudiation.",
      securityRelevanceAr: "أساس الثقة في البرمجيات الموقعة والتحويلات المالية والعقود الإلكترونية.",
      securityRelevanceEn: "Foundational mechanism for software code signing, firmware updates, and TLS trust.",
      controlsAr: [
        "خوارزميات التوقيع الحديثة (Ed25519 / ECDSA)",
        "التحقق الدوري من الإلغاء عبر OCSP Stapling"
      ],
      controlsEn: [
        "Modern Ed25519 / ECDSA Curves",
        "OCSP Stapling Validation"
      ]
    }
  ],
  practicalObjectivesAr: [
    "توليد توقيع رقمي لمستند وتعديل حرف واحد لملاحظة فشل التحقق",
    "فحص حقول شهادة X.509 والتحقق من تاريخ الصلاحية"
  ],
  practicalObjectivesEn: [
    "Generate digital signature and verify that single-byte tamper fails check",
    "Inspect X.509 SAN and validity fields"
  ],
  challengeTitleAr: "تحدي التوقيع الرقمي والتحقق من سلاسل الشهادات",
  challengeTitleEn: "Digital Signature Integrity & PKI Validation Challenge"
},
  41: {
  id: 41,
  slug: "email-security-spf-dkim-dmarc",
  macroDomainId: "I",
  titleAr: "أمن البريد الإلكتروني ومكافحة الانتحال (SPF, DKIM, DMARC)",
  titleEn: "Email Security, Phishing Defense & SPF / DKIM / DMARC",
  subtitleAr: "سجلات DNS للبريد، توقيع الرسائل، وسياسات رفض البريد المنتحل",
  subtitleEn: "DNS SPF Records, DKIM Cryptographic Headers & DMARC Enforcement (Reject/Quarantine)",
  descriptionAr: "حصن نطاق بريد مؤسستك ضد الانتحال والاصطياد (Phishing): اضبط سجلات SPF في DNS، وفعل توقيع DKIM الرقمي للرسائل، وافرض سياسة DMARC p=reject.",
  descriptionEn: "Interactive Email Security workbench: configure DNS SPF whitelist records, DKIM cryptographic headers, and enforce strict DMARC rejection policies.",
  difficulty: "Intermediate",
  simulationType: "dns",
  iconName: "Globe",
  prerequisites: [
    3,
    15
  ],
  relatedWorlds: [
    3,
    8,
    15,
    43
  ],
  concepts: [
    {
      id: "dmarc_policy",
      nameAr: "سياسة DMARC لمكافحة انتحال النطاقات",
      nameEn: "DMARC Domain Anti-Spoofing Policy",
      briefAr: "إخبار خوادم البريد العالمية بإسقاط أو عزل أي رسالة تدعي أنها صادرة من نطاقك وتفشل في اختبارات SPF أو DKIM.",
      briefEn: "Instructing receiving mail servers to reject or quarantine unauthenticated emails masquerading under your domain name.",
      securityRelevanceAr: "منع المحتالين من إرسال بريد باسم رئيس الشركة أو البنك للاحتيال على العملاء والموظفين.",
      securityRelevanceEn: "Neutralizes Business Email Compromise (BEC) and executive impersonation phishing.",
      controlsAr: [
        "ضبط DMARC p=reject",
        "تفعيل تقارير DMARC RUA لمراقبة المحاولات"
      ],
      controlsEn: [
        "Enforce DMARC p=reject",
        "Aggregate DMARC RUA Reporting"
      ]
    }
  ],
  practicalObjectivesAr: [
    "إضافة سجل SPF في DNS لتحديد خوادم الإرسال المعتمدة",
    "تفعيل سياسة DMARC p=reject لمنع رسائل الاصطياد"
  ],
  practicalObjectivesEn: [
    "Publish SPF TXT record in DNS for authorized mail exchangers",
    "Deploy DMARC policy with p=reject enforcement"
  ],
  challengeTitleAr: "مختبر تحصين البريد الإلكتروني ومنع انتحال النطاقات",
  challengeTitleEn: "Email Anti-Spoofing SPF/DKIM/DMARC Hardening Lab"
},
  42: {
  id: 42,
  slug: "dns-security-dnssec",
  macroDomainId: "B",
  titleAr: "أمن خوادم DNS وامتدادات الحماية المشفرة (DNSSEC)",
  titleEn: "DNS Security, Cache Poisoning Defense & DNSSEC",
  subtitleAr: "تسميم الذاكرة المؤقتة DNS، تزوير الردود، وسلاسل الثقة المشفرة DNSKEY/RRSIG",
  subtitleEn: "DNS Cache Poisoning, Kaminsky Exploit, DNSSEC Signatures & DoH/DoT",
  descriptionAr: "اختبر هجمات تزوير الردود وتسميم كاش خوادم DNS، وفعل امتدادات DNSSEC للتحقق من صحة التوقيع الرقمي لسجلات النطاقات ومنع توجيه المستخدمين لمواقع وهمية.",
  descriptionEn: "Interactive DNS security simulator: launch cache poisoning race conditions and deploy DNSSEC RRSIG cryptographic validation.",
  difficulty: "Intermediate",
  simulationType: "dns",
  iconName: "Globe",
  prerequisites: [
    3,
    15
  ],
  relatedWorlds: [
    3,
    8,
    15
  ],
  concepts: [
    {
      id: "dnssec_validation",
      nameAr: "امتدادات أمان نظام أسماء النطاقات (DNSSEC)",
      nameEn: "Domain Name System Security Extensions (DNSSEC)",
      briefAr: "توقيع سجلات DNS رقمياً لضمان أن العنوان المعاد للمستخدم هو العنوان الحقيقي الصادر من صاحب النطاق.",
      briefEn: "Cryptographically signing DNS records to guarantee origin authenticity and data integrity.",
      securityRelevanceAr: "منع هجمات توجيه المستخدمين إلى خوادم مصرفية أو بوابات تسجيل دخول مزورة.",
      securityRelevanceEn: "Prevents DNS spoofing, man-in-the-middle redirection, and credential harvesting.",
      controlsAr: [
        "تفعيل DNSSEC في مسجل النطاق",
        "استخدام مشافي DNS المشفرة (DoH / DoT)"
      ],
      controlsEn: [
        "DNSSEC Zone Signing",
        "DNS-over-HTTPS (DoH) / DNS-over-TLS (DoT)"
      ]
    }
  ],
  practicalObjectivesAr: [
    "محاكاة هجوم تسميم الكاش وملاحظة خطأ التوجيه",
    "تفعيل التحقق من توقيع RRSIG لإفشال الردود المزورة"
  ],
  practicalObjectivesEn: [
    "Simulate DNS cache poisoning exploit",
    "Enable DNSSEC RRSIG signature validation to reject forged replies"
  ],
  challengeTitleAr: "تحدي حماية خوادم DNS وتفعيل توقيعات DNSSEC المشفرة",
  challengeTitleEn: "DNS Security & DNSSEC Cryptographic Validation Challenge"
},
  43: {
  id: 43,
  slug: "mobile-security-android-ios",
  macroDomainId: "I",
  titleAr: "أمن تطبيقات الهواتف الذكية (iOS & Android AppSec)",
  titleEn: "Mobile App Security, Sandboxing & Runtime Integrity",
  subtitleAr: "عزل التطبيقات، تخزين المفاتيح في KeyStore/Keychain، وتثبيت الشهادات Pinning",
  subtitleEn: "Mobile Sandboxing, Android Keystore, iOS Keychain & SSL Pinning",
  descriptionAr: "افحص أمن تطبيقات الهواتف: اكتشف مخاطر تخزين البيانات في الذاكرة المشتركة، وفعل تخزين المفاتيح المشفر في العتاد (Hardware Keystore)، وطبق تثبيت الشهادات (Certificate Pinning).",
  descriptionEn: "Interactive Mobile Security lab: probe local app sandboxes, utilize hardware KeyStore/Keychain, and enforce TLS Certificate Pinning against MITM.",
  difficulty: "Intermediate",
  simulationType: "tls",
  iconName: "Laptop",
  prerequisites: [
    8,
    15
  ],
  relatedWorlds: [
    8,
    9,
    15,
    17
  ],
  concepts: [
    {
      id: "ssl_pinning",
      nameAr: "تثبيت الشهادات الرقمية في التطبيقات (SSL Pinning)",
      nameEn: "TLS Certificate Pinning",
      briefAr: "برمجة التطبيق ليرفض الاتصال بأي خادم إلا إذا قدم شهادة تطابق بصمة التشفير المثبتة داخل كود التطبيق نفسه.",
      briefEn: "Hardcoding expected server certificate fingerprints in the mobile binary to block proxy interception.",
      securityRelevanceAr: "منع اعتراض وتعديل بيانات التطبيق الحساسة حتى لو قام المستخدم بتثبيت شهادة Root مخصصة على جهازه.",
      securityRelevanceEn: "Thwarts proxy interception tools (Burp Suite / Charles) and rogue enterprise Root CAs.",
      controlsAr: [
        "تضمين بصمات المفاتيح العامة (HPKP/Pinning)",
        "حماية التطبيق من الهندسة العكسية"
      ],
      controlsEn: [
        "Public Key Pinning",
        "Anti-Tamper & Obfuscation"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تفعيل SSL Pinning والتحقق من صد محاولات اعتراض البروكسي",
    "تخزين رموز المصادقة داخل KeyStore العتادي الآمن"
  ],
  practicalObjectivesEn: [
    "Enable SSL Pinning and verify proxy interception failure",
    "Migrate auth tokens to hardware-backed KeyStore"
  ],
  challengeTitleAr: "مختبر تأمين تطبيقات الهواتف وتثبيت الشهادات الرقمية",
  challengeTitleEn: "Mobile Security & TLS Certificate Pinning Lab"
},
  44: {
  id: 44,
  slug: "supply-chain-sbom",
  macroDomainId: "E",
  titleAr: "أمن سلاسل التوريد البرمجية وفاتورة المكونات (SBOM)",
  titleEn: "Software Supply Chain Security & SBOM Auditing",
  subtitleAr: "توقيع الحزم البرمجية، كشف التبعيات الملغومة، والتحقق من إطار SLSA",
  subtitleEn: "Package Tampering, Software Bill of Materials (SBOM) & SLSA Framework",
  descriptionAr: "حصن خطوط توريد البرمجيات: ولد فاتورة مكونات البرمجيات (SBOM بصيغة CycloneDX)، وافحص التبعيات بحثاً عن الحزم الملغومة، وتحقق من التوقيع الرقمي للمكتبات.",
  descriptionEn: "Interactive Supply Chain studio: generate CycloneDX SBOM manifests, scan open-source dependencies for typosquatting, and verify package provenance signatures.",
  difficulty: "Intermediate",
  simulationType: "cloud_containers",
  iconName: "Workflow",
  prerequisites: [
    15,
    22
  ],
  relatedWorlds: [
    15,
    20,
    22
  ],
  concepts: [
    {
      id: "sbom_dependency_audit",
      nameAr: "فاتورة مكونات البرمجيات (SBOM)",
      nameEn: "Software Bill of Materials (SBOM)",
      briefAr: "قائمة جرد كاملة وتفصيلية لجميع المكتبات والتبعيات مفتوحة المصدر المضمنة في التطبيق مع إصداراتها.",
      briefEn: "Formal machine-readable inventory of all third-party components, libraries, and modules in an application.",
      securityRelevanceAr: "المعرفة الفورية بما إذا كانت ثغرة أمنية جديدة (مثل Log4j) تؤثر على أنظمتك أم لا.",
      securityRelevanceEn: "Enables instant triage when new upstream zero-day vulnerabilities emerge.",
      controlsAr: [
        "توليد SBOM تلقائياً في كل بناء",
        "التوقيع الرقمي للحاويات عبر Sigstore/Cosign"
      ],
      controlsEn: [
        "Automated CycloneDX SBOM Generation",
        "Sigstore / Cosign Container Signing"
      ]
    }
  ],
  practicalObjectivesAr: [
    "توليد وفحص ملف SBOM للكشف عن مكتبة تحتوي على ثغرة حرجة",
    "التحقق من التوقيع الرقمي للحزمة قبل السماح بالنشر"
  ],
  practicalObjectivesEn: [
    "Generate and audit SBOM to identify vulnerable upstream library",
    "Verify digital signature of container artifact"
  ],
  challengeTitleAr: "تحدي حماية سلاسل التوريد البرمجية وفحص مكونات SBOM",
  challengeTitleEn: "Software Supply Chain & SBOM Security Challenge"
},
  45: {
  id: 45,
  slug: "iot-hardware-security",
  macroDomainId: "I",
  titleAr: "أمن إنترنت الأشياء والأنظمة المضمنة (IoT & Hardware)",
  titleEn: "IoT & Embedded Hardware Security",
  subtitleAr: "بروتوكولات MQTT الآمنة، تشفير Firmware، ومنافذ UART/JTAG",
  subtitleEn: "MQTT TLS Brokers, Secure Boot Chains, Flash Extraction & JTAG Debug Locking",
  descriptionAr: "استكشف أمن الأجهزة الذكية المتصلة: امنع المنافذ المادية غير المحمية (UART)، وشفر اتصالات بروتوكول MQTT، وطبق الإقلاع الآمن (Secure Boot) للتحقق من البرامج الثابتة.",
  descriptionEn: "Interactive IoT Security workbench: secure MQTT publish/subscribe topics with TLS certificates and enforce Hardware Root of Trust Secure Boot.",
  difficulty: "Advanced",
  simulationType: "system_internals",
  iconName: "Cpu",
  prerequisites: [
    2,
    15
  ],
  relatedWorlds: [
    2,
    3,
    15,
    56
  ],
  concepts: [
    {
      id: "secure_boot_iot",
      nameAr: "الإقلاع الآمن وسلسلة الثقة العتادية (Secure Boot)",
      nameEn: "Hardware Root of Trust & Secure Boot",
      briefAr: "التحقق من التوقيع الرقمي للبرمجية الثابتة (Firmware) بواسطة مفتاح مشفر في العتاد قبل السماح للجهاز بالإقلاع.",
      briefEn: "Cryptographically validating firmware signatures against fuses burned into silicon prior to execution.",
      securityRelevanceAr: "منع المهاجمين من استبدال برمجيات أجهزة IoT بحمولات خبيثة أو برمجيات تجسس.",
      securityRelevanceEn: "Blocks physical and remote persistent firmware rootkits.",
      controlsAr: [
        "قفل منافذ التصحيح JTAG / UART",
        "التحديثات الهوائية الموقعة رقمياً OTA"
      ],
      controlsEn: [
        "Disable Hardware Debug Interfaces",
        "Cryptographically Signed OTA Updates"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تفعيل تشفير اتصالات MQTT عبر قناة TLS",
    "التحقق من رفض تشغيل برمجية غير موقعة في الجهاز"
  ],
  practicalObjectivesEn: [
    "Enforce TLS encryption on IoT MQTT broker channels",
    "Verify secure boot rejection of unsigned firmware image"
  ],
  challengeTitleAr: "مختبر تأمين أجهزة إنترنت الأشياء والإقلاع الآمن",
  challengeTitleEn: "IoT Device Hardening & Hardware Secure Boot Lab"
},
  46: {
  id: 46,
  slug: "deception-honeypots",
  macroDomainId: "F",
  titleAr: "تقنيات الخداع الأمني ومصائد المهاجمين (Honeypots & Canary)",
  titleEn: "Deception Technology, Honeypots & Canary Tokens",
  subtitleAr: "مصائد SSH وقواعد البيانات، المستندات الملغومة كشفياً، وحسابات الطُعم",
  subtitleEn: "High/Low Interaction Honeypots, Decoy AD Accounts & Canary Token Tripwires",
  descriptionAr: "انصب الفخاخ للمهاجمين داخل شبكتك: انشر مصائد Honeypots تحاكي خوادم حساسة، وازرع رموز Canary Tokens لكشف المتسللين فور لمسهم للملفات المفخخة.",
  descriptionEn: "Interactive Deception grid: deploy honeypots, decoy credentials, and canary files that trigger zero-false-positive alerts upon unauthorized access.",
  difficulty: "Intermediate",
  simulationType: "siem",
  iconName: "Activity",
  prerequisites: [
    4,
    24
  ],
  relatedWorlds: [
    4,
    6,
    24,
    28
  ],
  concepts: [
    {
      id: "canary_tokens_deception",
      nameAr: "رموز وحسابات الطُعم (Canary Tokens)",
      nameEn: "Canary Tokens & Decoy Traps",
      briefAr: "ملفات أو مفاتيح وهمية لا يستخدمها أي موظف حقيقي؛ أي محاولة لفتحها أو استخدامها تعني بنسبة 100% وجود نشاط اختراق نشط.",
      briefEn: "Decoy files, AWS keys, or database rows that generate instant high-fidelity alarms when touched by an attacker.",
      securityRelevanceAr: "إنذار مبكر فائق الدقة بدون أي إنذارات كاذبة ترهق المحللين.",
      securityRelevanceEn: "Provides zero-false-positive early warning of unauthorized internal reconnaissance.",
      controlsAr: [
        "زرع ملفات Canary في الخوادم الحساسة",
        "مراقبة حسابات Active Directory الوهمية"
      ],
      controlsEn: [
        "Deploy Canary Artifacts in File Shares",
        "Monitor Lure Service Accounts"
      ]
    }
  ],
  practicalObjectivesAr: [
    "نشر مصيدة SSH ومراقبة التقاط بيانات المهاجمين",
    "تفعيل إنذار فوري عند محاولة فتح ملف Canary"
  ],
  practicalObjectivesEn: [
    "Deploy SSH honeypot and capture attacker command telemetry",
    "Trigger instant SOC alert upon Canary file access"
  ],
  challengeTitleAr: "تحدي نشر المصائد الأمنية واصطياد المتسللين عبر Canary",
  challengeTitleEn: "Honeypot Deployment & Canary Deception Challenge"
},
  47: {
  id: 47,
  slug: "insider-threat-dlp",
  macroDomainId: "F",
  titleAr: "منع تسريب البيانات (DLP) ورصد التهديدات الداخلية",
  titleEn: "Data Loss Prevention (DLP) & Insider Threat Analytics",
  subtitleAr: "تصنيف البيانات، فحص قنوات التسريب USB/البريد، وسلوكيات المستخدمين UBA",
  subtitleEn: "Data Classification, Egress Channel Blocking & User Behavioral Analytics (UEBA)",
  descriptionAr: "احمِ بيانات المؤسسة من التسريب الداخلي: صنف الملفات حسب حساسيتها، واضبط قواعد DLP لمنع نسخ الأرقام السرية أو البطاقات البنكية إلى وسائط خارجية.",
  descriptionEn: "Interactive DLP & UEBA console: enforce data classification labels, block exfiltration across USB and email egress, and detect behavioral anomalies.",
  difficulty: "Intermediate",
  simulationType: "siem",
  iconName: "Activity",
  prerequisites: [
    1,
    24
  ],
  relatedWorlds: [
    1,
    16,
    24,
    28
  ],
  concepts: [
    {
      id: "dlp_content_inspection",
      nameAr: "منع تسريب البيانات الحساسة (DLP)",
      nameEn: "Data Loss Prevention (DLP) Content Filtering",
      briefAr: "فحص محتوى الملفات والرسائل الخارجة من المؤسسة ومطابقتها مع أنماط البيانات الحساسة (مثل أرقام الهوية وبطاقات الائتمان) لمنع خروجها.",
      briefEn: "Real-time inspection and blocking of outbound traffic containing sensitive data patterns (credit cards, PII, intellectual property).",
      securityRelevanceAr: "حماية الأسرار التجارية والامتثال لقوانين حماية البيانات الشخصية.",
      securityRelevanceEn: "Prevents intellectual property theft and regulatory privacy non-compliance.",
      controlsAr: [
        "حظر المنافذ الخارجية USB غير المصرح بها",
        "تشفير البريد الصادر المحتوي على بيانات حساسة"
      ],
      controlsEn: [
        "Endpoint USB Storage Blocking",
        "Automated Outbound Email Encryption"
      ]
    }
  ],
  practicalObjectivesAr: [
    "إعداد قاعدة DLP لرصد أرقام البطاقات البنكية وحظر إرسالها",
    "فحص إنذارات السلوك الشاذ لنقل ملفات ضخمة"
  ],
  practicalObjectivesEn: [
    "Create DLP rule matching credit card regex patterns and block transmission",
    "Investigate UEBA anomaly for mass file exfiltration"
  ],
  challengeTitleAr: "مختبر منع تسريب البيانات ورصد الأنشطة الداخلية المريبة",
  challengeTitleEn: "DLP Content Enforcement & Insider Threat Lab"
},
  48: {
  id: 48,
  slug: "threat-actor-profiling",
  macroDomainId: "A",
  titleAr: "تصنيف المهاجمين والمجموعات المتقدمة (APT & Threat Actor Profiling)",
  titleEn: "Threat Actor Profiling & Advanced Persistent Threats (APT)",
  subtitleAr: "دوافع المهاجمين، الجريمة المنظمة، مجموعات APT، ونموذج Diamond للأمن",
  subtitleEn: "Nation-State APTs, Cybercrime Syndicates & The Diamond Model of Intrusion Analysis",
  descriptionAr: "افهم عقلية ودوافع المهاجمين: حلل حملات المجموعات المتقدمة (APT) باستخدام نموذج Diamond، واربط بين البنية التحتية والضحايا والتقنيات المستخدمة.",
  descriptionEn: "Interactive Threat Profiler: map adversary campaigns using the Diamond Model (Adversary, Capability, Infrastructure, Victim) to understand strategic threats.",
  difficulty: "Beginner",
  simulationType: "cia_triad",
  iconName: "ShieldAlert",
  prerequisites: [
    1
  ],
  relatedWorlds: [
    1,
    24,
    25,
    30
  ],
  concepts: [
    {
      id: "diamond_model",
      nameAr: "نموذج Diamond لتحليل الهجمات",
      nameEn: "The Diamond Model of Intrusion Analysis",
      briefAr: "ربط أركان الهجوم الأربعة: المهاجم (Adversary) + القدرات التقنية (Capability) + البنية التحتية (Infrastructure) + الضحية (Victim).",
      briefEn: "Analytical framework establishing relationships between Adversary, Capability, Infrastructure, and Victim.",
      securityRelevanceAr: "توقع الخطوات القادمة للمهاجم وسد كافة مسارات البنية التحتية الخاصة به.",
      securityRelevanceEn: "Enables high-level attribution and strategic threat mitigation.",
      controlsAr: [
        "مشاركة معلومات التهديدات القطاعية",
        "حظر البنى التحتية للمهاجمين استباقياً"
      ],
      controlsEn: [
        "Sector Threat Sharing ISACs",
        "Proactive Adversary Infrastructure Takedown"
      ]
    }
  ],
  practicalObjectivesAr: [
    "بناء نموذج Diamond لحملة هجومية متقدمة",
    "تحديد البنية التحتية المستهدفة بالحظر"
  ],
  practicalObjectivesEn: [
    "Synthesize Diamond Model for multi-stage adversary campaign",
    "Isolate threat actor command infrastructure"
  ],
  challengeTitleAr: "تحدي تصنيف المهاجمين وتحليل نموذج Diamond للتهديدات",
  challengeTitleEn: "Threat Actor Profiling & Diamond Model Analysis Challenge"
},
  49: {
  id: 49,
  slug: "grc-frameworks-iso27001",
  macroDomainId: "J",
  titleAr: "الحوكمة والمخاطر والامتثال (GRC & ISO 27001 / NIST CSF)",
  titleEn: "Governance, Risk & Compliance (GRC & ISO 27001 / NIST CSF)",
  subtitleAr: "سياسات الأمان، تقييم النضج السيبراني، ومطابقة الضوابط الرقابية",
  subtitleEn: "Security Governance, Maturity Assessment (NIST CSF) & ISO 27001 Annex A Controls",
  descriptionAr: "قُد استراتيجية الأمان المؤسسية: طبق أطر الحوكمة (NIST Cybersecurity Framework)، وافحص مصفوفة الامتثال لمعايير ISO 27001، ووازن بين متطلبات الأعمال وضوابط الحماية.",
  descriptionEn: "Interactive GRC executive dashboard: map ISO 27001 and NIST CSF controls, evaluate organizational maturity, and manage risk registries.",
  difficulty: "Intermediate",
  simulationType: "range",
  iconName: "BookOpen",
  prerequisites: [
    1
  ],
  relatedWorlds: [
    1,
    35,
    38,
    60
  ],
  concepts: [
    {
      id: "nist_csf_functions",
      nameAr: "وظائف إطار الأمن السيبراني (NIST CSF)",
      nameEn: "NIST Cybersecurity Framework Core Functions",
      briefAr: "الأعمدة الخمسة: التحديد (Identify)، الحماية (Protect)، الكشف (Detect)، الاستجابة (Respond)، والتعافي (Recover).",
      briefEn: "Five foundational functions: Identify, Protect, Detect, Respond, and Recover organizing enterprise defense.",
      securityRelevanceAr: "ضمان عدم إهمال أي جانب من جوانب الحماية التقنية أو الإدارية في المؤسسة.",
      securityRelevanceEn: "Provides executive-level cybersecurity posture visibility and maturity measurement.",
      controlsAr: [
        "التدقيق الدوري للامتثال",
        "سجل المخاطر المؤسسي المحدث"
      ],
      controlsEn: [
        "Internal Compliance Audits",
        "Enterprise Risk Register Reviews"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تقييم مستوى نضج وظيفة الحماية في إطار NIST CSF",
    "مطابقة ضوابط ISO 27001 مع الأصول الحيوية للمؤسسة"
  ],
  practicalObjectivesEn: [
    "Assess organizational maturity across NIST CSF Protect function",
    "Map ISO 27001 Annex A controls to critical enterprise assets"
  ],
  challengeTitleAr: "مختبر حوكمة الأمن السيبراني ومطابقة معايير الامتثال",
  challengeTitleEn: "Cybersecurity Governance & Compliance Framework Lab"
},
  50: {
  id: 50,
  slug: "human-layer-social-engineering",
  macroDomainId: "A",
  titleAr: "العنصر البشري والهندسة الاجتماعية (Social Engineering)",
  titleEn: "Human Element & Social Engineering Tactics",
  subtitleAr: "الاصطياد الاحتيالي Phishing، الاصطياد الصوتي Vishing، وانتحال الهويات",
  subtitleEn: "Phishing Psychological Triggers, Pretexting, Executive Vishing & Security Awareness",
  descriptionAr: "اختبر خط الدفاع الأول (المستخدم): حلل المحفزات النفسية في رسائل الاصطياد (الإلحاح، الخوف، الفضول)، وافحص كيف يتم خداع الضحايا لتسريب كلمات المرور.",
  descriptionEn: "Interactive Social Engineering simulator: analyze psychological deception vectors (urgency, authority, fear) and design targeted awareness campaigns.",
  difficulty: "Beginner",
  simulationType: "cia_triad",
  iconName: "ShieldAlert",
  prerequisites: [
    1
  ],
  relatedWorlds: [
    1,
    17,
    41
  ],
  concepts: [
    {
      id: "phishing_indicators",
      nameAr: "مؤشرات كشف رسائل الاصطياد الاحتيالي",
      nameEn: "Phishing Psychological & Technical Indicators",
      briefAr: "الروابط الخادعة، اختلاف عنوان النطاق الفعلي، ونبرة الاستعجال غير الطبيعية لطلب تحويل أموال أو تحديث بيانات الحساب.",
      briefEn: "Deceptive sender addresses, domain typosquatting, and manufactured urgency to prompt reckless credential submission.",
      securityRelevanceAr: "أكثر من 80% من حوادث الاختراق تبدأ برسالة اصطياد تستهدف موظفاً في المؤسسة.",
      securityRelevanceEn: "Primary entry vector for ransomware delivery and initial network access.",
      controlsAr: [
        "تدريب التوعية الأمنية ومحاكاة الاصطياد",
        "زر الإبلاغ الفوري عن الرسائل المشبوهة"
      ],
      controlsEn: [
        "Simulated Phishing Training",
        "One-Click Phishing Report Button"
      ]
    }
  ],
  practicalObjectivesAr: [
    "فحص رسالة بريد إلكتروني وتحديد المؤشرات الخبيثة والروابط المزورة",
    "تنفيذ تدريب التوعية لمحاكاة الاصطياد"
  ],
  practicalObjectivesEn: [
    "Inspect deceptive email headers and identify typosquatted URLs",
    "Deploy simulated awareness campaign to vulnerable groups"
  ],
  challengeTitleAr: "تحدي كشف أساليب الهندسة الاجتماعية ومحاكاة الاصطياد",
  challengeTitleEn: "Social Engineering & Phishing Deception Challenge"
},
  51: {
  id: 51,
  slug: "privacy-gdpr-data-protection",
  macroDomainId: "J",
  titleAr: "الخصوصية وقوانين حماية البيانات الشخصية (GDPR & Privacy)",
  titleEn: "Data Privacy Engineering & GDPR Compliance",
  subtitleAr: "الخصوصية بالتصميم، إخفاء الهوية، تقليل جمع البيانات، وحقوق أصحاب البيانات",
  subtitleEn: "Privacy by Design, Pseudonymization, Data Minimization & Subject Access Requests",
  descriptionAr: "طبق مبادئ الخصوصية كمهندس برمجيات: أزل البيانات المعرفة للشخصية (PII)، طبق تقنيات إخفاء الهوية (Anonymization)، واضمن التوافق مع لائحة GDPR.",
  descriptionEn: "Interactive Privacy workbench: implement Data Minimization filters, apply hashing/pseudonymization to customer PII, and audit consent lifecycles.",
  difficulty: "Intermediate",
  simulationType: "range",
  iconName: "BookOpen",
  prerequisites: [
    1,
    15
  ],
  relatedWorlds: [
    1,
    15,
    47,
    49
  ],
  concepts: [
    {
      id: "privacy_by_design",
      nameAr: "الخصوصية بالتصميم والافتراض (Privacy by Design)",
      nameEn: "Privacy by Design Principles",
      briefAr: "بناء الأنظمة البرمجية بحيث تكون حماية خصوصية المستخدمين مدمجة في صلب المعمارية وليس كإجراء إضافي لاحق.",
      briefEn: "Embedding data protection directly into system architecture from the earliest design stages.",
      securityRelevanceAr: "حماية حقوق الأفراد وتفادي الغرامات المالية الضخمة الناتجة عن مخالفة لوائح حماية البيانات.",
      securityRelevanceEn: "Mitigates legal liability and protects fundamental personal data rights.",
      controlsAr: [
        "إخفاء المعرفات الشخصية (Pseudonymization)",
        "سياسات الحذف التلقائي للبيانات بعد انتهاء الغرض"
      ],
      controlsEn: [
        "PII Pseudonymization / Masking",
        "Automated Data Retention & Purge Policies"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تطبيق قناع إخفاء البيانات الحساسة للمستخدمين",
    "التحقق من تنفيذ سياسة الحذف التلقائي"
  ],
  practicalObjectivesEn: [
    "Apply PII masking on user data records",
    "Verify automated data retention purge execution"
  ],
  challengeTitleAr: "مختبر هندسة الخصوصية وحماية البيانات الشخصية",
  challengeTitleEn: "Privacy Engineering & GDPR Data Masking Lab"
},
  52: {
  id: 52,
  slug: "business-continuity-disaster-recovery",
  macroDomainId: "J",
  titleAr: "استمرارية الأعمال والتعافي من الكوارث (BCP / DR)",
  titleEn: "Business Continuity & Disaster Recovery (BCP / DR)",
  subtitleAr: "أهداف RTO و RPO، تكرار الأنظمة، والنسخ الاحتياطي المعزول عن برمجيات الفدية",
  subtitleEn: "Recovery Time Objective (RTO), Recovery Point Objective (RPO) & Immutable Backups",
  descriptionAr: "صمم خطة صمود المؤسسة أمام الكوارث وهجمات برمجيات الفدية (Ransomware): احسب أهداف RTO و RPO، وافحص النسخ الاحتياطية غير القابلة للتعديل (Immutable Backups).",
  descriptionEn: "Interactive BCP/DR simulator: calculate RTO/RPO metrics, test failover clustering across regions, and verify immutable air-gapped backup restorations.",
  difficulty: "Intermediate",
  simulationType: "range",
  iconName: "Activity",
  prerequisites: [
    1,
    18
  ],
  relatedWorlds: [
    1,
    18,
    35,
    60
  ],
  concepts: [
    {
      id: "immutable_backups",
      nameAr: "النسخ الاحتياطي غير القابل للتعديل (Immutable Backups)",
      nameEn: "Immutable & Air-Gapped Backups",
      briefAr: "نسخ احتياطية تمنع أي شخص (حتى حسابات الإدارة المخترقة) من حذفها أو تشفيرها لفترة زمنية محددة.",
      briefEn: "Write-Once-Read-Many (WORM) storage preventing ransomware operators from encrypting or deleting backups.",
      securityRelevanceAr: "الضمان الوحيد لاستعادة المؤسسة لبياناتها دون دفع الفدية للمهاجمين.",
      securityRelevanceEn: "The definitive defense enabling rapid recovery from destructive ransomware.",
      controlsAr: [
        "تطبيق مبدأ 3-2-1 في النسخ الاحتياطي",
        "اختبار الاستعادة الدورية للأنظمة"
      ],
      controlsEn: [
        "3-2-1 Backup Strategy",
        "Periodic Automated Restoration Drills"
      ]
    }
  ],
  practicalObjectivesAr: [
    "إجراء عملية تحويل مسار خوادم الإنتاج لمنطقة بديلة عند تعطل المنطقة الرئيسية",
    "استعادة البيانات من نسخة احتياطية محصنة WORM"
  ],
  practicalObjectivesEn: [
    "Execute automated regional failover simulation",
    "Restore database from immutable WORM backup snapshot"
  ],
  challengeTitleAr: "تحدي استمرارية الأعمال والتعافي من هجمات الفدية",
  challengeTitleEn: "Disaster Recovery & Immutable Backup Restoration Challenge"
},
  53: {
  id: 53,
  slug: "third-party-vendor-risk",
  macroDomainId: "J",
  titleAr: "إدارة مخاطر الموردين والأطراف الثالثة (TPRM)",
  titleEn: "Third-Party & Vendor Cyber Risk Management (TPRM)",
  subtitleAr: "تقييم أمن الموردين، اتفاقيات سرية البيانات، ومخاطر الوصول عن بعد",
  subtitleEn: "Vendor Due Diligence, SOC 2 Reports, Remote Access Scopes & Supply Chain Risk",
  descriptionAr: "اضبط وصول الموردين والمقاولين الخارجيين: قيد وصولهم إلى موارد محددة فقط، واطلب تقارير SOC 2، وافرض المصادقة الثنائية المشروطة.",
  descriptionEn: "Interactive Vendor Risk console: assess third-party security posture, bound vendor API access scopes, and isolate contractor VPN connections.",
  difficulty: "Intermediate",
  simulationType: "zero_trust",
  iconName: "Shield",
  prerequisites: [
    1,
    16,
    38
  ],
  relatedWorlds: [
    1,
    16,
    38,
    49
  ],
  concepts: [
    {
      id: "vendor_access_isolation",
      nameAr: "عزل وصول الموردين الخارجيين",
      nameEn: "Vendor Privileged Access Isolation",
      briefAr: "حصر وصول المقاولين والموردين على الخوادم التي يقدمون لها الدعم فقط دون إمكانية رؤية باقي أجزاء الشبكة.",
      briefEn: "Providing zero-trust just-in-time access strictly to the single asset a vendor maintains.",
      securityRelevanceAr: "منع تكرار الاختراقات الشهيرة التي تمت عبر استغلال حسابات مقاولي التكييف أو الصيانة الخارجية.",
      securityRelevanceEn: "Eliminates lateral movement from compromised third-party credentials.",
      controlsAr: [
        "الوصول في الوقت المناسب (Just-In-Time JIT)",
        "مراقبة وتسجيل جلسات الموردين كاملة (PAM)"
      ],
      controlsEn: [
        "Just-In-Time (JIT) Ephemeral Access",
        "Privileged Session Recording (PAM)"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تقييد صلاحيات اتصال الموردين على خادم الدعم فقط",
    "تفعيل انتهاء صلاحية الجلسة التلقائي"
  ],
  practicalObjectivesEn: [
    "Restrict third-party contractor access to target host only",
    "Enforce automated session expiration on vendor accounts"
  ],
  challengeTitleAr: "مختبر إدارة مخاطر الموردين وعزل وصول الأطراف الثالثة",
  challengeTitleEn: "Vendor Risk Management & Third-Party Access Lab"
},
  54: {
  id: 54,
  slug: "cyber-insurance-tabletop",
  macroDomainId: "J",
  titleAr: "التأمين السيبراني وتمارين المحاكاة المكتبية (Tabletop)",
  titleEn: "Cyber Insurance & Tabletop Crisis Simulations",
  subtitleAr: "نقل المخاطر، متطلبات شركات التأمين، واختبار القيادة أثناء الأزمات",
  subtitleEn: "Risk Transfer Models, Underwriting Controls & Executive Tabletop Exercises",
  descriptionAr: "قُد تمريناً مكتبياً لأزمة اختراق كبرى (Tabletop Exercise): اختبر قرارات القيادة التنفيذية والقانونية والإعلامية، واستوفِ متطلبات بوالص التأمين السيبراني.",
  descriptionEn: "Interactive Tabletop exercise simulator: step through high-stress breach escalation scenarios, coordinate legal disclosures, and validate insurance prerequisites.",
  difficulty: "Intermediate",
  simulationType: "range",
  iconName: "Compass",
  prerequisites: [
    1,
    29
  ],
  relatedWorlds: [
    1,
    29,
    49,
    60
  ],
  concepts: [
    {
      id: "tabletop_crisis_exercise",
      nameAr: "تمارين المحاكاة المكتبية (Tabletop Exercises)",
      nameEn: "Executive Tabletop Crisis Exercises",
      briefAr: "محاكاة نظرية وعملية تشارك فيها قيادات المؤسسة لاختبار سرعة وجودة اتخاذ القرارات أثناء أزمة اختراق حقيقية.",
      briefEn: "Discussion-based sessions where team members review their roles during an active cyber disaster scenario.",
      securityRelevanceAr: "اكتشاف الثغرات في التنسيق الداخلي قبل وقوع الكارثة الفعلية.",
      securityRelevanceEn: "Validates operational readiness and communications without production disruption.",
      controlsAr: [
        "إجراء تمارين دورية نصف سنوية",
        "تحديث خطة التواصل مع وسائل الإعلام والجهات التنظيمية"
      ],
      controlsEn: [
        "Semi-Annual Tabletop Drills",
        "External Crisis Communications Protocol"
      ]
    }
  ],
  practicalObjectivesAr: [
    "إجراء تمرين محاكاة لهجوم فدية واسع النطاق",
    "اتخاذ القرارات القانونية والتنظيمية للإبلاغ عن الحادث"
  ],
  practicalObjectivesEn: [
    "Facilitate executive tabletop ransomware scenario",
    "Execute regulatory breach notification workflow within required timelines"
  ],
  challengeTitleAr: "تحدي قيادة تمارين الأزمات وإدارة استحقاقات التأمين السيبراني",
  challengeTitleEn: "Tabletop Crisis Simulation & Cyber Insurance Challenge"
},
  55: {
  id: 55,
  slug: "ai-security-llm-owasp",
  macroDomainId: "I",
  titleAr: "أمن الذكاء الاصطناعي وهجمات حقن الأوامر (AI & LLM Security)",
  titleEn: "AI / LLM Security & Prompt Injection Defense (OWASP Top 10 for LLM)",
  subtitleAr: "حقن الأوامر المباشر وغير المباشر، تسريب بيانات التدريب، وسياج الحماية (Guardrails)",
  subtitleEn: "Direct & Indirect Prompt Injection, Training Data Poisoning & AI Guardrails",
  descriptionAr: "حصن نماذج الذكاء الاصطناعي التوليدي: اختبر ثغرات حقن الأوامر (Prompt Injection)، وامنع النماذج من تسريب مفاتيح النظام، وطبق حواجز الحماية (NeMo Guardrails).",
  descriptionEn: "Interactive AI Security testbed: launch direct and indirect prompt injection attacks, bypass naive filters, and implement robust semantic AI Guardrails.",
  difficulty: "Advanced",
  simulationType: "appsec_api",
  iconName: "Cpu",
  prerequisites: [
    9,
    10
  ],
  relatedWorlds: [
    9,
    10,
    12,
    14
  ],
  concepts: [
    {
      id: "prompt_injection_defense",
      nameAr: "الدفاع ضد حقن الأوامر في نماذج الذكاء الاصطناعي",
      nameEn: "Prompt Injection & Semantic Guardrails",
      briefAr: "محاولة المستخدم أو البيانات الخارجية التلاعب بتعليمات النظام الأساسية للنموذج لجعله ينفذ إجراءات غير مصرح بها.",
      briefEn: "Adversarial inputs tricking LLMs into ignoring system prompts or executing malicious secondary instructions.",
      securityRelevanceAr: "حماية التطبيقات المعتمدة على الذكاء الاصطناعي من سرقة البيانات وتنفيذ أوامر خبيثة.",
      securityRelevanceEn: "Critical vulnerability in AI agents with database access and execution tools.",
      controlsAr: [
        "حواجز الأمان الدلالية (Guardrails)",
        "فصل مساحة تعليمات النظام عن مدخلات المستخدمين غير الموثوقة"
      ],
      controlsEn: [
        "Semantic AI Guardrails",
        "Strict Separation of System Context from User Prompts"
      ]
    }
  ],
  practicalObjectivesAr: [
    "اختبار هجوم تجاوز حواجز النموذج (Jailbreak) وملاحظة اعتراض الحارس الأمني",
    "تطبيق فحص المدخلات لمنع تسريب الأسرار عبر الردود"
  ],
  practicalObjectivesEn: [
    "Test prompt injection bypass against semantic guardrail",
    "Enforce output sanitization filter to prevent secret disclosure"
  ],
  challengeTitleAr: "مختبر تأمين نماذج الذكاء الاصطناعي والتصدي لحقن الأوامر",
  challengeTitleEn: "AI / LLM Security & Prompt Injection Defense Lab"
},
  56: {
  id: 56,
  slug: "ot-scada-industrial-security",
  macroDomainId: "I",
  titleAr: "أمن الأنظمة الصناعية وشبكات التحكم (OT / SCADA / ICS)",
  titleEn: "Operational Technology (OT / SCADA) & Industrial Security",
  subtitleAr: "نموذج Purdue، بروتوكولات Modbus/DNP3، وعزل شبكات المصانع والبنية التحتية الحرجة",
  subtitleEn: "Purdue Model Levels, Industrial DMZ, Modbus/DNP3 Integrity & Safety Interlocks",
  descriptionAr: "استكشف أمن البنى التحتية الحيوية ومحطات الطاقة: طبق نموذج Purdue لعزل شبكات التحكم الصناعي (ICS) عن شبكة تقنية المعلومات (IT)، وافحص حزم بروتوكول Modbus.",
  descriptionEn: "Interactive OT/SCADA industrial network: enforce Purdue Model air-gaps between enterprise IT and physical PLCs, and inspect unencrypted Modbus commands.",
  difficulty: "Expert",
  simulationType: "firewall",
  iconName: "Activity",
  prerequisites: [
    3,
    4
  ],
  relatedWorlds: [
    3,
    4,
    35,
    45
  ],
  concepts: [
    {
      id: "purdue_model_isolation",
      nameAr: "نموذج Purdue لعزل شبكات التحكم الصناعي",
      nameEn: "Purdue Enterprise Reference Architecture (PERA)",
      briefAr: "تقسيم هرمي صارم من المستوى 0 (الحساسات والمحركات) حتى المستوى 5 (شبكة الأعمال) مع حظر الاتصال المباشر بينهما.",
      briefEn: "Hierarchical segmentation separating physical industrial process controllers (PLCs) from corporate enterprise networks.",
      securityRelevanceAr: "منع الهجمات الإلكترونية من التسبب في أضرار فيزيائية أو تفجيرات أو انقطاع للكهرباء والمياه.",
      securityRelevanceEn: "Protects critical national infrastructure and human physical safety from cyber sabotage.",
      controlsAr: [
        "منطقة معزولة صناعية (Industrial DMZ)",
        "صمامات البيانات أحادية الاتجاه (Data Diodes)"
      ],
      controlsEn: [
        "Industrial DMZ (IDMZ)",
        "Hardware Unidirectional Data Diodes"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تطبيق منطقة IDMZ لمنع مرور أوامر Modbus من خارج شبكة التحكم",
    "فحص سلامة أوامر التشغيل المرسلة إلى المتحكمات المنطقية PLCs"
  ],
  practicalObjectivesEn: [
    "Deploy Industrial DMZ to block external Modbus commands",
    "Verify PLC command integrity and state bounds"
  ],
  challengeTitleAr: "تحدي تحصين شبكات التحكم الصناعي وتأمين نموذج Purdue",
  challengeTitleEn: "Industrial OT / SCADA Purdue Architecture Challenge"
},
  57: {
  id: 57,
  slug: "quantum-cryptography-pqc",
  macroDomainId: "I",
  titleAr: "التشفير ما بعد الكوانتم والحوسبة الكمومية (Post-Quantum Cryptography)",
  titleEn: "Post-Quantum Cryptography (PQC) & Quantum Threat Defense",
  subtitleAr: "خوارزمية شُور، انهيار خوارزميات RSA/ECC، ومعايير NIST الجديدة (ML-KEM / ML-DSA)",
  subtitleEn: "Shor's Algorithm Threat, Harvest Now Decrypt Later & NIST PQC Standards (Kyber/Dilithium)",
  descriptionAr: "استعد للحقبة الكمومية: افهم كيف ستكسر الحواسيب الكمومية خوارزميات RSA و ECC، واختبر الخوارزميات الشبكية المقاومة للكوانتم (ML-KEM و ML-DSA) لحماية البيانات الحساسة.",
  descriptionEn: "Interactive Post-Quantum Cryptography testbed: compare classical vs lattice-based cryptographic algorithms resilient against quantum computer cryptanalysis.",
  difficulty: "Expert",
  simulationType: "crypto",
  iconName: "Key",
  prerequisites: [
    15,
    39,
    40
  ],
  relatedWorlds: [
    15,
    39,
    40
  ],
  concepts: [
    {
      id: "pqc_lattice_algorithms",
      nameAr: "خوارزميات التشفير ما بعد الكوانتم (NIST PQC)",
      nameEn: "Post-Quantum Lattice-Based Cryptography",
      briefAr: "خوارزميات رياضية جديدة معتمدة على المسائل الشبكية متعددة الأبعاد تستعصي على الحواسيب التقليدية والكمومية معاً.",
      briefEn: "Advanced mathematical structures resistant to both classical and quantum computing cryptanalysis.",
      securityRelevanceAr: "حماية البيانات الاستراتيجية طويلة الأمد من هجمات \"اجمع الآن وفك التشفير لاحقاً\" (Harvest Now, Decrypt Later).",
      securityRelevanceEn: "Future-proofs state secrets and encrypted archives against impending quantum decryption.",
      controlsAr: [
        "التحول للتشفير الهجين (Hybrid Classical + PQC)",
        "جرد الأصول المشفرة في المؤسسة (Cryptographic Agility)"
      ],
      controlsEn: [
        "Hybrid TLS Key Exchange",
        "Cryptographic Agility Auditing"
      ]
    }
  ],
  practicalObjectivesAr: [
    "إجراء تبادل مفاتيح مشفر هجين يجمع بين X25519 وخوارزمية ML-KEM المقاومة للكوانتم",
    "التحقق من سلامة القناة المشفرة"
  ],
  practicalObjectivesEn: [
    "Execute hybrid TLS key exchange combining X25519 with quantum-safe ML-KEM",
    "Verify quantum-resilient channel establishment"
  ],
  challengeTitleAr: "مختبر التشفير ما بعد الكوانتم وتأمين الاتصالات المستقبلية",
  challengeTitleEn: "Post-Quantum Cryptography (PQC) Migration Lab"
},
  58: {
  id: 58,
  slug: "purple-teaming-simulation",
  macroDomainId: "J",
  titleAr: "التمارين المدمجة المشتركة (Purple Teaming & Breach Simulation)",
  titleEn: "Purple Teaming & Automated Breach and Attack Simulation (BAS)",
  subtitleAr: "التنسيق بين الهجوم والدفاع، قياس كفاءة الرصد، وإغلاق الثغرات فوراً",
  subtitleEn: "Attack Simulation, Telemetry Gap Analysis & Real-Time Collaborative Hardening",
  descriptionAr: "ادمج بين خبرات الهجوم والدفاع: نفذ محاكاة هجومية منسقة، وقس زمن الاكتشاف والإنذار لدى الفريق الأزرق، واضبط قواعد الرصد الدفاعي في نفس اللحظة.",
  descriptionEn: "Interactive Purple Team command center: execute emulated atomic attack techniques and verify real-time SIEM/EDR detection coverage in a collaborative loop.",
  difficulty: "Advanced",
  simulationType: "range",
  iconName: "Activity",
  prerequisites: [
    24,
    28,
    37
  ],
  relatedWorlds: [
    24,
    25,
    28,
    37,
    60
  ],
  concepts: [
    {
      id: "purple_team_loop",
      nameAr: "دورة التحسين المستمر في الفريق الأرجواني",
      nameEn: "Continuous Purple Team Feedback Loop",
      briefAr: "تعاون مباشر وشفاف بين المهاجمين الأخلاقيين والمدافعين لضمان رصد كل تقنية هجومية فور تنفيذها.",
      briefEn: "Collaborative feedback loop testing adversary techniques to validate and immediately engineer missing detections.",
      securityRelevanceAr: "تحويل التمارين الهجومية من مجرد تقرير ورقي إلى تحسينات أمنية فورية وملموسة.",
      securityRelevanceEn: "Maximizes security ROI by validating detection coverage against real-world TTPs.",
      controlsAr: [
        "أتمتة محاكاة الاختراق (BAS)",
        "مصفوفة تغطية الاكتشاف (Detection Coverage Matrix)"
      ],
      controlsEn: [
        "Automated Breach & Attack Simulation",
        "MITRE ATT&CK Coverage Heatmaps"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تشغيل محاكاة تقنية هجومية والتحقق من ظهور الإنذار في لوحة SOC",
    "تعديل قاعدة الاكتشاف في حال عدم الرصد"
  ],
  practicalObjectivesEn: [
    "Execute simulated attack technique and verify SOC alert generation",
    "Tune detection rule on missing telemetry trigger"
  ],
  challengeTitleAr: "تحدي الفريق الأرجواني وقياس كفاءة الاكتشاف والاستجابة",
  challengeTitleEn: "Purple Teaming & Detection Coverage Validation Challenge"
},
  59: {
  id: 59,
  slug: "executive-reporting-metrics",
  macroDomainId: "J",
  titleAr: "المقاييس والتقارير التنفيذية ومؤشرات الأداء الأمني (KPIs / KRIs)",
  titleEn: "Executive Cybersecurity Metrics & CISO Reporting (KPIs / KRIs)",
  subtitleAr: "مؤشرات MTTD و MTTR، قياس تكلفة المخاطر، وتقديم تقارير مجلس الإدارة",
  subtitleEn: "Mean Time to Detect (MTTD), Mean Time to Respond (MTTR) & Executive Board Presentations",
  descriptionAr: "تحدث بلغة الأعمال والقيادة التنفيذية (CISO): حول البيانات التقنية المعقدة إلى مؤشرات أداء واضحة (MTTD و MTTR ومستوى التعرض للمخاطر) لاتخاذ القرارات الاستراتيجية.",
  descriptionEn: "Interactive CISO Executive Dashboard: synthesize multi-layer security telemetry into business KPIs/KRIs, ROI metrics, and board-ready risk visualizations.",
  difficulty: "Intermediate",
  simulationType: "range",
  iconName: "Compass",
  prerequisites: [
    1,
    24,
    49
  ],
  relatedWorlds: [
    1,
    24,
    49,
    60
  ],
  concepts: [
    {
      id: "mttd_mttr_metrics",
      nameAr: "مؤشرات زمن الاكتشاف والاستجابة (MTTD & MTTR)",
      nameEn: "Operational Security Metrics (MTTD / MTTR)",
      briefAr: "متوسط زمن اكتشاف الحادث (MTTD) ومتوسط زمن احتواء التهديد والتعافي (MTTR).",
      briefEn: "Key metrics quantifying detection speed and operational containment efficiency across the enterprise.",
      securityRelevanceAr: "كلما قل زمن MTTD و MTTR، كلما انخفضت الخسائر المادية الناتجة عن أي اختراق بشكل جذري.",
      securityRelevanceEn: "Direct correlation between low MTTD/MTTR and reduced total financial breach impact.",
      controlsAr: [
        "لوحات مؤشرات الأداء الحية للقيادة",
        "تحديد أهداف زمنية دقيقة لفرق العمليات"
      ],
      controlsEn: [
        "Executive Real-Time Dashboards",
        "Operational Incident Triage SLAs"
      ]
    }
  ],
  practicalObjectivesAr: [
    "تحليل مؤشرات زمن الاستجابة للحوادث وحساب نسبة انخفاض الخطر",
    "إعداد ملخص تنفيذي موجه لمجلس الإدارة"
  ],
  practicalObjectivesEn: [
    "Analyze MTTD/MTTR metrics trend and calculate risk reduction delta",
    "Compile executive board-level cybersecurity summary"
  ],
  challengeTitleAr: "مختبر التقارير التنفيذية وحساب مؤشرات الأداء الأمني CISO",
  challengeTitleEn: "Executive Security Metrics & CISO Board Reporting Lab"
}
};

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'foundations',
    titleAr: 'مسار أسس ومبادئ الأمن السيبراني',
    titleEn: 'Cybersecurity Foundations Path',
    descriptionAr: 'ابدأ من الصفر: تعلم ثالوث CIA، عمارة الحواسيب، والشبكات وأمن الأنظمة.',
    descriptionEn: 'Start from core fundamentals: CIA Triad, computer internals, subnetting, and OS security.',
    roleAr: 'مبتدئ في الأمن السيبراني',
    roleEn: 'Cybersecurity Beginner / Student',
    iconName: 'Shield',
    color: 'from-cyan-500 to-blue-600',
    targetWorldIds: [1, 2, 3, 5],
  },
  {
    id: 'network-defender',
    titleAr: 'مسار مدافع ومحلل أمن الشبكات',
    titleEn: 'Network Security Defender Path',
    descriptionAr: 'احترف حزم البيانات، تصميم جدران الحماية، عزل الشبكات DMZ، وأنظمة كشف التسلل.',
    descriptionEn: 'Master packet filtering, firewall policy architecture, DMZ segmentation, and IDS/IPS sensors.',
    roleAr: 'مهندس أمن شبكات',
    roleEn: 'Network Security Engineer',
    iconName: 'Network',
    color: 'from-blue-500 to-indigo-600',
    targetWorldIds: [3, 4, 8, 15, 38],
  },
  {
    id: 'soc-analyst',
    titleAr: 'مسار محلل مركز العمليات الأمنية (SOC)',
    titleEn: 'SOC Analyst & Incident Response Path',
    descriptionAr: 'استقبال السجلات، ربط الأحداث في SIEM، تتبع العمليات في EDR، واحتواء التهديدات.',
    descriptionEn: 'Live log ingestion, SIEM correlation rules, EDR telemetry inspection, and incident containment.',
    roleAr: 'محلل مركز العمليات (Tier 1/2 SOC Analyst)',
    roleEn: 'SOC Analyst / Threat Responder',
    iconName: 'Activity',
    color: 'from-rose-500 to-amber-600',
    targetWorldIds: [4, 6, 24, 28, 31, 60],
  },
  {
    id: 'appsec-engineer',
    titleAr: 'مسار أمن التطبيقات والبرمجة الآمنة',
    titleEn: 'Application Security (AppSec) Path',
    descriptionAr: 'معمارية الويب، منع ثغرات SQLi و XSS، أمن بوابات API، وخطوط إنتاج DevSecOps.',
    descriptionEn: 'Web request lifecycles, OWASP injection defenses, API rate limiting, and CI/CD security gates.',
    roleAr: 'مهندس أمن تطبيقات (AppSec Engineer)',
    roleEn: 'Application Security Engineer',
    iconName: 'FileCode',
    color: 'from-indigo-500 to-purple-600',
    targetWorldIds: [8, 9, 10, 15, 22],
  },
  {
    id: 'cloud-security-architect',
    titleAr: 'مسار مهندس أمن السحابة ومعمارية انعدام الثقة',
    titleEn: 'Cloud Security & Zero Trust Architect Path',
    descriptionAr: 'تأمين الحاويات، سياسات كوبرنيتيس، التخزين السحابي، وسياسات التحقق المستمر Zero Trust.',
    descriptionEn: 'S3 bucket hardening, Kubernetes network policies, IAM least privilege, and Zero Trust engines.',
    roleAr: 'مهندس أمن الحوسبة السحابية',
    roleEn: 'Cloud Security Architect',
    iconName: 'Cloud',
    color: 'from-emerald-500 to-cyan-600',
    targetWorldIds: [16, 18, 20, 38, 60],
  },
];
