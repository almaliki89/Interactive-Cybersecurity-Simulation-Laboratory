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
    iraqiSubjectNameAr: 'أساسيات الحاسوب وتقنية المعلومات والأمن الرقمي',
    iraqiSubjectNameEn: 'Fundamentals of IT, Computer Literacy & Digital Safety',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني والتقني: فحص الأجهزة ونظافة الأمن المكتبي',
        titleEn: 'Vocational Track: Endpoint Checkups & Workplace Hygiene',
        practicalSkillsAr: [
          'فحص تفعيل جدار حماية ويندوز وتحديثات النظام الدورية.',
          'تفعيل تشفير الأقراص بواسطة BitLocker وتخزين مفتاح الاسترداد.',
          'التعرف على رسائل البريد التصيدي وتجنب الروابط المشبوهة.',
        ],
        practicalSkillsEn: [
          'Verify Windows Firewall activation and schedule regular OS updates.',
          'Enable BitLocker volume encryption and securely store recovery keys.',
          'Identify phishing email indicators and avoid untrusted attachments.',
        ],
        troubleshootingRunbookAr: [
          'في حال بطء الجهاز المفاجئ: فحص العمليات النشطة في Task Manager والبحث عن استهلاك غير مبرر للمعالج.',
          'في حال ظهور إشعارات أمنية متكررة: عزل كابل الشبكة وإجراء فحص كامل بمضاد الفيروسات.',
        ],
        troubleshootingRunbookEn: [
          'If system slows abruptly: Check Task Manager processes for abnormal CPU usage.',
          'If persistent security warnings appear: Disconnect network cable and execute full offline scan.',
        ],
        labToolingAr: ['Windows Security Settings', 'Task Manager', 'Control Panel / Security & Maintenance'],
        labToolingEn: ['Windows Security Settings', 'Task Manager', 'Control Panel / Security & Maintenance'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: نماذج أمن المعلومات ونظرية التهديدات',
        titleEn: 'University Track: Information Security Models & Threat Theory',
        theoreticalConceptsAr: [
          'نموذج تصنيف التهديدات STRIDE وتحليل سطوح الهجوم (Attack Surfaces).',
          'مفهوم الدفاع المتعمق (Defense in Depth) ومبدأ الامتياز الأدنى (Least Privilege).',
          'الأخلاقيات الرقمية والإطار التشريعي لجرائم المعلوماتية في البيئة العراقية.',
        ],
        theoreticalConceptsEn: [
          'STRIDE threat classification framework and attack surface minimization.',
          'Defense-in-depth architectural layering and principle of least privilege.',
          'Cyber ethics and legal frameworks in contemporary digital jurisdictions.',
        ],
        algorithmicAnalysisAr: 'حساب مصفوفة المخاطر الكمية: المخاطرة = الاحتمالية × التأثير (Risk = Likelihood × Impact).',
        algorithmicAnalysisEn: 'Quantitative Risk Calculation: Risk Score = Likelihood × Business Impact Matrix.',
        researchAndDesignAspectsAr: [
          'دراسة أثر سياسات الأمان المؤسسية على إنتاجية الموظفين والتوازن بين الأمن وسهولة الاستخدام.',
          'تحليل متطلبات الامتثال للمعايير الدولية (ISO/IEC 27001 و NIST Cybersecurity Framework).',
        ],
        researchAndDesignAspectsEn: [
          'Trade-off analysis between strict endpoint security controls and organizational usability.',
          'Compliance mapping against international standards (ISO/IEC 27001 and NIST CSF).',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'متطلب جامعي مشترك لكليات الهندسة وعلوم الحاسوب (المرحلة الأولى)',
        academicTierEn: 'Core University Requirement for Engineering & Computer Science (Year 1)',
        vocationalTierAr: 'مادة أساسيات الحاسوب والتقنية في الإعداديات المهنية والمعاهد التقنية',
        vocationalTierEn: 'Computer Fundamentals in Vocational High Schools & Technical Institutes',
        subjectMappingAr: 'مقدمة في تكنولوجيا المعلومات / أساسيات الأمن السيبراني',
        subjectMappingEn: 'Introduction to IT / Cybersecurity Fundamentals',
        suggestedPrerequisitesAr: ['مهارات استخدام الحاسوب العامة ونظام التشغيل'],
        suggestedPrerequisitesEn: ['General computer literacy and basic operating system usage'],
      },
    },
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
    iraqiSubjectNameAr: 'أنظمة التشغيل وحماية العمليات والذاكرة',
    iraqiSubjectNameEn: 'Operating Systems & Process Security',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: إدارة مستخدمي وصلاحيات أنظمة Linux و Windows',
        titleEn: 'Vocational Track: Linux & Windows User & Access Management',
        practicalSkillsAr: [
          'ضبط صلاحيات ملفات لينكس بالأرقام والرموز (chmod 755 / 644) وتغيير المالك (chown).',
          'إدارة المستخدمين والمجموعات في سطر الأوامر (useradd, usermod, passwd).',
          'فحص أذونات NTFS وقوائم التحكم بالوصول DACL في خوادم ويندوز.',
        ],
        practicalSkillsEn: [
          'Set Linux file permissions using octal/symbolic modes (chmod 755/644) and ownership (chown).',
          'Manage local users and security groups via CLI (useradd, usermod, passwd).',
          'Inspect NTFS discretionary access control lists (DACLs) on Windows Server.',
        ],
        troubleshootingRunbookAr: [
          'خطأ "Permission Denied": فحص المالك والمجموعة ونمط الصلاحيات عبر ls -la ومطابقتها مع هوية المستخدم الحالي.',
          'الاشتباه ببرمجية خبيثة: فحص العمليات التي تعمل بصلاحيات root/SYSTEM ومنافذ الشبكة المفتوحة بواسطة netstat / ss.',
        ],
        troubleshootingRunbookEn: [
          'Permission Denied triage: Check file owner and permissions with ls -la and compare against whoami.',
          'Suspicious process triage: Audit root/SYSTEM processes and listen sockets using netstat / ss.',
        ],
        labToolingAr: ['Bash CLI (chmod, chown, id)', 'PowerShell (Get-Acl, icacls)', 'Process Explorer'],
        labToolingEn: ['Bash CLI (chmod, chown, id)', 'PowerShell (Get-Acl, icacls)', 'Process Explorer'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: عمارة أنظمة التشغيل ونماذج العزل الصارم',
        titleEn: 'University Track: OS Architecture & Formal Isolation Models',
        theoreticalConceptsAr: [
          'حلقات حماية المعالج x86/ARM (Ring 0 Kernel Mode مقابل Ring 3 User Mode) وعمليات مقاطعة النظام (Syscalls).',
          'تنظيم الذاكرة الافتراضية، جداول الصفحات (Page Tables)، وآليات الحماية ASLR و DEP/NX.',
          'نماذج التحكم بالوصول الصارم: نموذج بيبي (Biba) للسلامة ونموذج بيل-لابادولا (Bell-LaPadula) للسرية.',
        ],
        theoreticalConceptsEn: [
          'CPU privilege rings (Ring 0 Kernel vs Ring 3 User Mode) and system call gates.',
          'Virtual memory segmentation, page tables, Address Space Layout Randomization (ASLR), and DEP/NX.',
          'Formal access control models: Biba Integrity Model and Bell-LaPadula Confidentiality Model.',
        ],
        algorithmicAnalysisAr: 'خوارزمية التحقق من الرموز المميزة (Token Privilege Validation): فحص تقاطع رموز SID مع DACL ACEs.',
        algorithmicAnalysisEn: 'Access Token Validation Algorithm: Evaluating subject SIDs against DACL Access Control Entries.',
        researchAndDesignAspectsAr: [
          'تحليل ثغرات فيض المخزن المؤقت (Buffer Overflow) وكيف تمنع تقنيات ASLR و Canaries استغلالها.',
          'مقارنة كفاءة النواة المصغرة (Microkernel) مع النواة المتجانسة (Monolithic Kernel) في مقاومة الاختراق.',
        ],
        researchAndDesignAspectsEn: [
          'Buffer overflow mechanics and defensive exploit mitigation via compiler stack canaries and ASLR entropy.',
          'Security posture comparison between monolithic kernels and capability-based microkernels.',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'مادة أساسية لطلبة علوم الحاسوب وهندسة البرمجيات (المرحلة الثانية والثالثة)',
        academicTierEn: 'Core Subject for Computer Science & Software Engineering (Year 2/3)',
        vocationalTierAr: 'مادة إدارة وتثبيت أنظمة التشغيل في المعاهد التقنية',
        vocationalTierEn: 'OS Installation & Administration in Technical Colleges',
        subjectMappingAr: 'أنظمة التشغيل / أمن النظم وتراكيب الحاسوب',
        subjectMappingEn: 'Operating Systems / Systems Security & Computer Architecture',
        suggestedPrerequisitesAr: ['معرفة أساسية بتركيب الحاسوب ووحدة المعالجة المركزية'],
        suggestedPrerequisitesEn: ['Basic understanding of computer architecture and CPU concepts'],
      },
    },
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
    iraqiSubjectNameAr: 'شبكات الحاسوب وبروتوكولات الإنترنت (Computer Networks & Protocols)',
    iraqiSubjectNameEn: 'Computer Networks & Internet Protocols',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: توصيل وإعداد عناوين الشبكات وتشخيص الاتصال',
        titleEn: 'Vocational Track: Network Cabling, IP Configuration & Diagnostic Triage',
        practicalSkillsAr: [
          'إعداد عنوان IP الثابت وقناع الشبكة وبوابة العبور الافتراضية على بطاقة الشبكة.',
          'استخدام أدوات التشخيص الميداني: ping لفحص الاستجابة، traceroute لتتبع مسار القفزات، و ipconfig / ifconfig.',
          'إعداد خادم DHCP لتوزيع العناوين التلقائية، وحجز العناوين الثابتة (DHCP Reservation).',
        ],
        practicalSkillsEn: [
          'Configure static IP, subnet mask, and default gateway on network interface cards.',
          'Execute frontline diagnostics: ping connectivity tests, traceroute hop analysis, and ipconfig/ifconfig.',
          'Deploy DHCP pools for dynamic host addressing and configure static DHCP reservations.',
        ],
        troubleshootingRunbookAr: [
          'فشل الوصول إلى الإنترنت: 1) ping 127.0.0.1 (بطاقة الشبكة)، 2) ping Gateway (الموجه المحلي)، 3) ping 8.8.8.8 (الخارج)، 4) nslookup (خادم DNS).',
          'تعارض العناوين (IP Conflict): تشغيل arp -a لتحديد عنوان MAC المكرر وتعديل إعدادات الجهاز المخالف.',
        ],
        troubleshootingRunbookEn: [
          'No internet triage: 1) ping 127.0.0.1, 2) ping Default Gateway, 3) ping 8.8.8.8, 4) nslookup hostname.',
          'IP Conflict resolution: Run arp -a to identify duplicate MAC binding and reassign host lease.',
        ],
        labToolingAr: ['Wireshark', 'Packet Tracer / GNS3', 'ip / route / arp / traceroute CLI'],
        labToolingEn: ['Wireshark', 'Packet Tracer / GNS3', 'ip / route / arp / traceroute CLI'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: نظرية الاتصالات، بروتوكولات التوجيه ونموذج OSI',
        titleEn: 'University Track: Communication Theory, Routing Protocols & OSI Model',
        theoreticalConceptsAr: [
          'طبقات نموذج OSI السبع ومقارنتها بنموذج TCP/IP رباعي الطبقات، مع تفصيل عملية التغليف (Encapsulation/Decapsulation).',
          'الرياضيات الثنائية لتقسيم الشبكات المتغير VLSM وحساب عناوين الشبكة والبث (Network & Broadcast Addresses).',
          'خوارزميات التوجيه: خوارزمية ديكسترا للحالة المرتبطة (Dijkstra Link-State / OSPF) وخوارزمية بلمان-فورد لشعاع المسافة (Bellman-Ford / RIP).',
        ],
        theoreticalConceptsEn: [
          'Seven-layer OSI reference model vs 4-layer TCP/IP stack with detailed encapsulation header flow.',
          'Binary mathematics of Variable Length Subnet Masking (VLSM) and bitwise network/broadcast partitioning.',
          'Routing algorithms: Dijkstra shortest path first (Link-State/OSPF) and Bellman-Ford (Distance Vector/RIP).',
        ],
        algorithmicAnalysisAr: 'خوارزمية التوجيه وفق أطول قناع متطابق (Longest Prefix Match - LPM) في جداول التوجيه السريعة (TCAM).',
        algorithmicAnalysisEn: 'Longest Prefix Match (LPM) Trie algorithm for packet forwarding in TCAM hardware.',
        researchAndDesignAspectsAr: [
          'دراسة استنزاف عناوين IPv4 والتحول إلى IPv6، وآليات التوافق (Dual Stack و Tunneling).',
          'تحليل أداء بروتوكول TCP في التدفق والتحكم بالازدحام (Congestion Control / Tahoe & Reno).',
        ],
        researchAndDesignAspectsEn: [
          'IPv4 address exhaustion dynamics and transition architectures to IPv6 (Dual-stack and 6to4 tunneling).',
          'Mathematical modeling of TCP congestion control windows (AIMD algorithm, Slow Start, Fast Recovery).',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'المقرر الإلزامي الأساسي لشبكات الحاسوب في كليات الهندسة وعلوم الحاسوب (المرحلة الثالثة)',
        academicTierEn: 'Core Computer Networks Course for Engineering & Computer Science (Year 3)',
        vocationalTierAr: 'مادة شبكات الحاسوب وصيانتها في المعاهد التكنولوجية وإعداديات الصناعة',
        vocationalTierEn: 'Computer Networks & Maintenance in Technological Institutes',
        subjectMappingAr: 'شبكات الحاسوب 1 / بروتوكولات الاتصال ونقل البيانات',
        subjectMappingEn: 'Computer Networks I / Data Communications & Protocols',
        suggestedPrerequisitesAr: ['أساسيات النظام الثنائي وتراكيب الحاسوب'],
        suggestedPrerequisitesEn: ['Binary number system and computer organization fundamentals'],
      },
    },
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
    iraqiSubjectNameAr: 'أمن الشبكات وجدران الحماية وعزل النطاقات (Network Security & Firewalls)',
    iraqiSubjectNameEn: 'Network Security, Firewalls & Segmentation',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: كتابة قواعد جدران الحماية وتأمين منافذ الخوادم',
        titleEn: 'Vocational Track: Firewall ACL Rule Crafting & Port Hardening',
        practicalSkillsAr: [
          'كتابة قواعد iptables / UFW في خوادم لينكس لحظر المنافذ غير الضرورية (مثل Telnet 23 و SMB 445).',
          'إعداد سياسة المنع الافتراضي (Default Drop Policy) مع السماح بالاتصالات المنشأة مسبقاً (ESTABLISHED, RELATED).',
          'إنشاء شبكات محلية افتراضية VLAN لعزل شبكة الإدارة عن شبكة الضيوف وشبكة الإنتاج.',
        ],
        practicalSkillsEn: [
          'Write iptables/UFW rules on Linux servers to block hazardous ports (e.g. Telnet 23, SMB 445).',
          'Enforce strict Default Drop perimeter stance while permitting ESTABLISHED, RELATED connection states.',
          'Create 802.1Q VLANs to isolate management subnets from guest WiFi and corporate production segments.',
        ],
        troubleshootingRunbookAr: [
          'توقف خدمة معينة بعد تشغيل الجدار: فحص ترتيب القواعد (Rule Order) عبر iptables -L -v -n والتأكد من عدم وجود قاعدة DROP سابقة تطابق الحزمة.',
          'فحص الحزم المحظورة: مراقبة سجلات /var/log/ufw.log أو Windows Firewall Log لتحديد المصدر والمنفذ الممنوع.',
        ],
        troubleshootingRunbookEn: [
          'Service unreachable post-firewall: Inspect rule ordering via iptables -L -v -n for premature DROP matches.',
          'Blocked traffic audit: Tail /var/log/ufw.log or Windows Firewall pfirewall.log for dropped SYN packets.',
        ],
        labToolingAr: ['iptables / nftables', 'UFW / pfSense', 'Cisco IOS Access-Lists'],
        labToolingEn: ['iptables / nftables', 'UFW / pfSense', 'Cisco IOS Access-Lists'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: هندسة جدران الحماية التفاعلية ونماذج تتبع الحالة',
        titleEn: 'University Track: Stateful Inspection Engines & Connection Tracking',
        theoreticalConceptsAr: [
          'مقارنة معمارية الفحص: فحص الحزم عديم الحالة (Stateless Packet Filtering) مقابل فحص تتبع الحالة (Stateful Inspection) وبوابات طبقة التطبيق (Proxy/ALGs).',
          'بنية جدول تتبع الاتصالات (CONNTRACK Table) ومتابعة الحالات: NEW, ESTABLISHED, RELATED, INVALID.',
          'تصميم المناطق الأمنية وعزل المنطقة منزوعة السلاح (DMZ Architecture) ونظرية الدفاع في العمق.',
        ],
        theoreticalConceptsEn: [
          'Architectural trade-offs: Stateless filtering vs Stateful inspection vs Application Layer Gateways (ALGs).',
          'State table mechanics (Netfilter CONNTRACK) and transition states: NEW, ESTABLISHED, RELATED, INVALID.',
          'De-Militarized Zone (DMZ) perimeter topology, bastion hosts, and layered defence theory.',
        ],
        algorithmicAnalysisAr: 'خوارزمية مطابقة قواعد جدار الحماية: مصفوفة القرار المتسلسلة (First-Match-Wins Decision Tree).',
        algorithmicAnalysisEn: 'Sequential rule evaluation algorithm: First-Match-Wins with early exit optimization.',
        researchAndDesignAspectsAr: [
          'دراسة هجمات تجاوز جدران الحماية: تفتيت الحزم (IP Fragmentation Attacks) ونفق البروتوكولات (DNS/ICMP Tunneling).',
          'تحليل أداء جدران الحماية من الجيل القادم (NGFW) وفحص الحزم العميق (Deep Packet Inspection - DPI).',
        ],
        researchAndDesignAspectsEn: [
          'Firewall evasion techniques: IP packet fragmentation overlap and covert protocol tunneling.',
          'Next-Generation Firewall (NGFW) performance benchmarking under Deep Packet Inspection (DPI) loads.',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'مادة أمن الشبكات والإنترنت لطلبة الهندسة والعلوم (المرحلة الثالثة والرابعة)',
        academicTierEn: 'Network & Internet Security Course for Engineering & Science (Year 3/4)',
        vocationalTierAr: 'مادة أمن وحماية الشبكات في المعاهد التقنية',
        vocationalTierEn: 'Network Security & Protection in Technical Institutes',
        subjectMappingAr: 'أمن الشبكات وجدران الحماية / حماية النظم المعلوماتية',
        subjectMappingEn: 'Network Security & Firewalls / Information Systems Defense',
        suggestedPrerequisitesAr: ['أساسيات شبكات الحاسوب، نموذج TCP/IP، وأرقام المنافذ'],
        suggestedPrerequisitesEn: ['Computer networking foundations, TCP/IP stack, and port assignments'],
      },
    },
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
    iraqiSubjectNameAr: 'التشفير وأمن المعلومات والبنية التحتية للمفاتيح العامة (Cryptography & PKI)',
    iraqiSubjectNameEn: 'Applied Cryptography & Public Key Infrastructure',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: إنشاء وتثبيت شهادات SSL/TLS والتحقق من سلامة الملفات',
        titleEn: 'Vocational Track: Certificate Generation, Web Server SSL & File Integrity Verification',
        practicalSkillsAr: [
          'إنشاء أزواج المفاتيح وطلبات توقيع الشهادات CSR باستخدام أداة OpenSSL.',
          'تثبيت شهادات HTTPS على خوادم الويب (Nginx / Apache) وإيقاف إصدارات SSL/TLS القديمة الضعيفة.',
          'التحقق من سلامة الملفات المحملة عبر حساب ومقارنة بصمة SHA-256 باستخدام certutil أو sha256sum.',
        ],
        practicalSkillsEn: [
          'Generate cryptographic key pairs and Certificate Signing Requests (CSR) using OpenSSL CLI.',
          'Install HTTPS certificates on Nginx/Apache web servers and disable obsolete SSL/TLS ciphers.',
          'Verify downloaded software integrity by calculating and comparing SHA-256 checksums with sha256sum.',
        ],
        troubleshootingRunbookAr: [
          'خطأ "Certificate Not Trusted": التحقق من سلسلة الشهادات (Certificate Chain) وتثبيت الشهادة المتوسطة (Intermediate CA).',
          'فشل تطابق بصمة التجزئة: حذف الملف فوراً لإمكانية تعرضه للتلاعب أثناء التحميل أو تلوثه ببرمجية خبيثة.',
        ],
        troubleshootingRunbookEn: [
          'Certificate Not Trusted error: Verify full certificate chain bundle and install missing intermediate CA.',
          'Hash mismatch error: Discard downloaded file immediately due to corruption or tampering.',
        ],
        labToolingAr: ['OpenSSL CLI', 'GnuPG', 'certutil / sha256sum'],
        labToolingEn: ['OpenSSL CLI', 'GnuPG', 'certutil / sha256sum'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: نظرية التشفير، الحساب النمطي، وخواص دوال التجزئة',
        titleEn: 'University Track: Cryptographic Theory, Modular Arithmetic & Hash Properties',
        theoreticalConceptsAr: [
          'الحساب النمطي (Modular Arithmetic)، مبرهنة أويلر ومسألة تحليل الأعداد الأولية كأساس لخوارزمية RSA.',
          'تبادل المفاتيح الآمن عبر بروتوكول ديفي-هيلمان (Diffie-Hellman) ومنحنيات التشفير الإهليلجية (ECDH).',
          'خواص دوال التجزئة الرياضية الآمنة: مقاومة الصورة السابقة الأولى والثانية ومقاومة التصادم (Collision Resistance).',
        ],
        theoreticalConceptsEn: [
          'Modular arithmetic, Euler totient theorem, and prime factorization hardness underlying RSA.',
          'Key exchange cryptography: Diffie-Hellman discrete logarithm problem and Elliptic Curve Diffie-Hellman (ECDHE).',
          'Cryptographic hash function axioms: Preimage resistance, second preimage resistance, and collision resistance.',
        ],
        algorithmicAnalysisAr: 'خاصية الانهيار الجليدي (Avalanche Effect): تغيير بت واحد في المدخل يغير 50% من بتات التجزئة في SHA-256.',
        algorithmicAnalysisEn: 'Avalanche Effect Criterion: Single input bit flip propagates to >= 50% output bit flips in SHA-256.',
        researchAndDesignAspectsAr: [
          'تحليل أمان بروتوكول TLS 1.3 وإلغاء خوارزميات التشفير القديمة وتقليص زمن المصافحة (0-RTT).',
          'تحديات التشفير ما بعد الحوسبة الكمومية (Post-Quantum Cryptography - PQC / Kyber & Dilithium).',
        ],
        researchAndDesignAspectsEn: [
          'TLS 1.3 protocol security analysis: Deprecation of static RSA/CBC and 0-RTT replay attack mitigations.',
          'Post-Quantum Cryptography (PQC) paradigms: Lattice-based cryptography (CRYSTALS-Kyber and Dilithium).',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'مادة التشفير ونظرية المعلومات الإلزامية في كليات علوم الحاسوب والرياضيات التطبيقية (المرحلة الثالثة)',
        academicTierEn: 'Core Cryptography & Information Theory in CS & Applied Mathematics (Year 3)',
        vocationalTierAr: 'مادة أمن البيانات والتشفير التطبيقي في المعاهد التقنية',
        vocationalTierEn: 'Data Security & Applied Cryptography in Technical Institutes',
        subjectMappingAr: 'التشفير وأمن المعلومات / أمن البيانات الرقمية',
        subjectMappingEn: 'Cryptography & Information Security / Digital Data Protection',
        suggestedPrerequisitesAr: ['الجبر الخطي، الحساب النمطي، ونظرية الاحتمالات'],
        suggestedPrerequisitesEn: ['Linear algebra, modular arithmetic, and probability theory'],
      },
    },
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
    iraqiSubjectNameAr: 'إدارة الهويات والأدلة المؤسسية والتحكم في الوصول (Identity & Access Management)',
    iraqiSubjectNameEn: 'Identity & Access Management (Active Directory)',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: إدارة نطاق ويندوز Active Directory وتطبيق سياسات GPO',
        titleEn: 'Vocational Track: Domain Controller Administration & Group Policy Hardening',
        practicalSkillsAr: [
          'إنشاء وإدارة حسابات المستخدمين والمجموعات الأمنية في Active Directory Users and Computers (ADUC).',
          'ربط محطات العمل الجديدة بنطاق الدومين وتعيين سياسات كلمات المرور والقفل التلقائي.',
          'إنشاء كائنات سياسات المجموعة (GPO) لتعطيل وحدات USB وفرض قفل الشاشة وتوزيع البرامج.',
        ],
        practicalSkillsEn: [
          'Create and maintain user objects and security groups via Active Directory Users and Computers (ADUC).',
          'Join enterprise workstations to the Active Directory domain and configure account lockout thresholds.',
          'Deploy Group Policy Objects (GPOs) to disable removable USB storage and enforce screen lock timeouts.',
        ],
        troubleshootingRunbookAr: [
          'فشل تسجيل دخول المستخدم: فحص قفل الحساب (Account Locked) في ADUC ومزامنة وقت الجهاز مع Domain Controller (فارق الوقت > 5 دقائق يفشل Kerberos).',
          'عدم تطبيق سياسة GPO: تشغيل أمر gpupdate /force وفحص النتيجة عبر gpresult /r.',
        ],
        troubleshootingRunbookEn: [
          'Domain login failure: Check account lockout in ADUC and verify NTP time sync with DC (clock skew > 5 min breaks Kerberos).',
          'GPO policy not applying: Execute gpupdate /force and diagnose applied policies with gpresult /r.',
        ],
        labToolingAr: ['Active Directory Admin Center', 'Group Policy Management Console (GPMC)', 'PowerShell ActiveDirectory module'],
        labToolingEn: ['Active Directory Admin Center', 'Group Policy Management Console (GPMC)', 'PowerShell ActiveDirectory module'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: بروتوكول كيربيروس، خوادم المصادقة ونماذج التفويض',
        titleEn: 'University Track: Kerberos Authentication Protocol & Formal Authorization Models',
        theoreticalConceptsAr: [
          'دورة حياة مصادقة كيربيروس (RFC 4120): تبادل طلبات AS-REQ / AS-REP وتذكرة TGT، ثم TGS-REQ / TGS-REP وتذكرة الخدمة.',
          'بنية دليل المؤسسة الموزع (LDAP / X.500) وعلاقات الثقة بين النطاقات (Domain Trusts & Forest Architecture).',
          'مقارنة نماذج التحكم في الوصول: التحكم المعتمد على الأدوار (RBAC) مقابل التحكم المعتمد على السمات (ABAC).',
        ],
        theoreticalConceptsEn: [
          'Kerberos authentication lifecycle (RFC 4120): AS-REQ/AS-REP ticket-granting flow and TGS service ticket granting.',
          'Distributed directory architectures (LDAP/X.500) and enterprise cross-forest trust relationships.',
          'Authorization paradigms: Role-Based Access Control (RBAC) vs Attribute-Based Access Control (ABAC).',
        ],
        algorithmicAnalysisAr: 'خوارزمية تشفير تذاكر Kerberos: تشفير تذكرة TGT بمفتاح krbtgt لمنع التلاعب وتزوير التذاكر (Golden Ticket).',
        algorithmicAnalysisEn: 'Kerberos ticket encapsulation algorithm: Symmetric encryption of TGT via krbtgt NTLM/AES master key.',
        researchAndDesignAspectsAr: [
          'دراسة هجمات الهوية المتقدمة: هجوم التذاكر الذهبية (Golden Ticket)، وتمرير التجزئة (Pass-the-Hash)، وحقن التذاكر (Pass-the-Ticket).',
          'الانتقال من المصادقة المحلية في Active Directory إلى الهوية السحابية والهوية الهجينة (Azure AD / Entra ID).',
        ],
        researchAndDesignAspectsEn: [
          'Credential dumping threat vectors: Pass-the-Hash, Pass-the-Ticket, and Golden Ticket persistence analysis.',
          'Hybrid identity architectures: Directory synchronization (DirSync) and cloud federation protocols (SAML 2.0 / OIDC).',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'مادة إدارة الشبكات والأنظمة المؤسسية لطلبة هندسة تقنيات الحاسوب (المرحلة الرابعة)',
        academicTierEn: 'Enterprise Systems & Network Administration for Computer Engineering (Year 4)',
        vocationalTierAr: 'مادة إدارة خوادم ويندوز في المعاهد التقنية',
        vocationalTierEn: 'Windows Server Administration in Technical Colleges',
        subjectMappingAr: 'إدارة خوادم الشبكات / أمن البنى التحتية المؤسسية',
        subjectMappingEn: 'Network Server Administration / Enterprise Infrastructure Security',
        suggestedPrerequisitesAr: ['أساسيات أنظمة التشغيل وشبكات الحاسوب المحلية LAN'],
        suggestedPrerequisitesEn: ['Operating system fundamentals and Local Area Networking (LAN) concepts'],
      },
    },
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
    iraqiSubjectNameAr: 'مراكز العمليات الأمنية ورصد الأحداث وتحليل التهديدات (SOC & SIEM)',
    iraqiSubjectNameEn: 'Security Operations Center & SIEM Monitoring',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: رصد تنبيهات SIEM وتصنيف الحوادث في مركز SOC',
        titleEn: 'Vocational Track: Tier-1 SOC Alert Triaging & Event Log Analysis',
        practicalSkillsAr: [
          'قراءة وتحليل معرفات أحداث ويندوز الأساسية (Event ID 4624 للدخول الناجح، 4625 للفاشل، 7045 لإنشاء خدمة جديدة).',
          'تتبع محاولات التخمين على كلمات المرور (Brute Force) وتحديد عنوان IP المهاجم والحساب المستهدف.',
          'كتابة تقرير أولي للحادثة الأمنية وتصعيد التذاكر للدرجة الثانية (Tier-2 Incident Escalation).',
        ],
        practicalSkillsEn: [
          'Analyze key Windows Security Event IDs (4624 successful logon, 4625 failed logon, 7045 new service installation).',
          'Detect and correlate brute-force authentication spikes, extracting adversary IP and target account details.',
          'Document initial triage findings and escalate verified anomalies to Tier-2 incident responders.',
        ],
        troubleshootingRunbookAr: [
          'ارتفاع مفاجئ في تنبيهات تسجيل الدخول الفاشلة: فحص مصدر الطلبات (Workstation Name / Source IP) وحظر العنوان المشبوه على الجدار الناري.',
          'تنبيه إيجابي كاذب (False Positive): التحقق مما إذا كان الحدث ناتجاً عن مهمة مجدولة مشروعة (Scheduled Task) وتعديل قاعدة الكشف.',
        ],
        troubleshootingRunbookEn: [
          'Sudden spike in failed logons: Extract Source IP/Workstation Name and apply temporary perimeter block.',
          'False positive triage: Cross-reference administrative scheduled tasks and tune SIEM correlation threshold.',
        ],
        labToolingAr: ['Splunk / Elastic SIEM', 'Wazuh EDR', 'Windows Event Viewer / Sysmon'],
        labToolingEn: ['Splunk / Elastic SIEM', 'Wazuh EDR', 'Windows Event Viewer / Sysmon'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: هندسة الكشف، خوارزميات الترابط الإحصائي واستخبارات التهديدات',
        titleEn: 'University Track: Detection Engineering, Statistical Correlation & Threat Intel',
        theoreticalConceptsAr: [
          'خوارزميات الترابط الزمني والمكاني (Temporal & Spatial Correlation) في معالجة تدفقات السجلات الضخمة.',
          'تصميم قواعد الكشف المفتوحة المعيارية باستخدام صيغ سيغما (Sigma Rules) ومطابقة مؤشرات الاختراق (IOCs).',
          'تطبيق مصفوفة ميتري للأطر الهجومية (MITRE ATT&CK Framework) لتصنيف تكتيكات وتقنيات المهاجمين.',
        ],
        theoreticalConceptsEn: [
          'Temporal and spatial event correlation algorithms in high-throughput distributed log streaming.',
          'Detection-as-Code engineering utilizing Sigma rule specifications and Indicators of Compromise (IOC) matching.',
          'Tactics, Techniques, and Procedures (TTP) taxonomy mapping via the MITRE ATT&CK enterprise matrix.',
        ],
        algorithmicAnalysisAr: 'خوارزمية الكشف عبر النافذة الزمنية المنزلقة (Sliding Window Thresholding): حساب معدل الأحداث عبر فترة زمنية محددة.',
        algorithmicAnalysisEn: 'Sliding window event frequency algorithm: Detecting anomalies when count(EventID) in window W exceeds threshold T.',
        researchAndDesignAspectsAr: [
          'تحليل تطبيق خوارزميات التعلم الآلي للكشف عن السلوك الشاذ للمستخدمين والكيانات (UEBA).',
          'استخبارات التهديدات السيبرانية (Cyber Threat Intelligence - CTI) وبروتوكولات تبادل البيانات (STIX/TAXII).',
        ],
        researchAndDesignAspectsEn: [
          'User and Entity Behavior Analytics (UEBA) utilizing unsupervised clustering for anomaly detection.',
          'Cyber Threat Intelligence (CTI) integration models using standardized STIX 2.1 and TAXII server feeds.',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'مادة إدارة ومراقبة الأمن السيبراني لطلبة البكالوريوس والدراسات العليا (المرحلة الرابعة)',
        academicTierEn: 'Cybersecurity Operations & Monitoring in Senior Undergraduate & Graduate syllabi',
        vocationalTierAr: 'مادة إدارة مراكز العمليات وتحليل البيانات الأمنية في المعاهد التقنية',
        vocationalTierEn: 'Security Operations & Log Analysis in Technical Institutes',
        subjectMappingAr: 'مراكز العمليات الأمنية SOC / التحليل الأمني والإنذار المبكر',
        subjectMappingEn: 'Security Operations Centers (SOC) / Security Analytics & Early Warning',
        suggestedPrerequisitesAr: ['أنظمة التشغيل، شبكات الحاسوب، وبروتوكولات السجلات Syslog'],
        suggestedPrerequisitesEn: ['Operating systems, computer networks, and Syslog logging architecture'],
      },
    },
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
    iraqiSubjectNameAr: 'التحقيق الجنائي الرقمي والاستجابة للحوادث السيبرانية (DFIR)',
    iraqiSubjectNameEn: 'Digital Forensics & Incident Response',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: جمع الأدلة الرقمية وسلسلة الحيازة وتحليل الصور الجنائية',
        titleEn: 'Vocational Track: Evidence Acquisition, Chain of Custody & Artifact Triage',
        practicalSkillsAr: [
          'أخذ نسخة جنائية من الذاكرة العشوائية (RAM Dump) باستخدام أدوات متخصصة دون تلويث الأدلة.',
          'حساب بصمة التجزئة (MD5 / SHA-256) الفورية للصورة الجنائية وتوثيقها في استمارة سلسلة الحيازة (Chain of Custody).',
          'استخراج وفحص ملفات Prefetch ومفتاح تسجيل Run في ويندوز لمعرفة البرامج المنفذة حديثاً.',
        ],
        practicalSkillsEn: [
          'Perform live RAM memory acquisition using trusted forensic tools without contaminating volatile data.',
          'Compute immediate cryptographic verification hashes (MD5/SHA-256) and record chain-of-custody documentation.',
          'Extract and parse Windows Prefetch artifacts and Registry Run keys to identify recently executed malware.',
        ],
        troubleshootingRunbookAr: [
          'خطر فقدان البيانات المتطايرة: تطبيق ترتيب التطاير (Order of Volatility)؛ سحب الذاكرة RAM والاتصالات الشبكية أولاً قبل إيقاف تشغيل الجهاز.',
          'عدم تطابق بصمة النسخة الجنائية: رفض الدليل الجنائي رقمياً وإعادة عملية التصوير الجنائي باستخدام جهاز كتابة محمي (Write Blocker).',
        ],
        troubleshootingRunbookEn: [
          'Volatile data loss mitigation: Adhere strictly to Order of Volatility (capture RAM/network states before powering off).',
          'Image verification failure: Invalidate compromised evidence image and re-acquire using hardware write-blockers.',
        ],
        labToolingAr: ['FTK Imager', 'Autopsy Forensic Browser', 'Volatility Framework', 'WinPmem'],
        labToolingEn: ['FTK Imager', 'Autopsy Forensic Browser', 'Volatility Framework', 'WinPmem'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: تحليل الذاكرة العشوائية، هياكل أنظمة الملفات، والقبول القضائي',
        titleEn: 'University Track: Memory Forensics, File System Internals & Legal Admissibility',
        theoreticalConceptsAr: [
          'بنية نظام الملفات NTFS وجداول الملفات الرئيسية (Master File Table - MFT) وسجلات المعاملات ($LogFile و $UsnJrnl).',
          'تحليل الذاكرة المتقدم عبر أطر العمل البرمجية لاستخراج تراكيب النواة (EPROCESS Blocks و VAD Trees).',
          'المعايير الدولية للأدلة الرقمية (ISO/IEC 27037) وشروط القبول القضائي للأدلة الرقمية في القضاء العراقي والدولي.',
        ],
        theoreticalConceptsEn: [
          'NTFS file system architecture, Master File Table (MFT) record parsing, and journal analysis ($LogFile, $UsnJrnl).',
          'Advanced memory forensics: Reconstructing kernel structures (EPROCESS blocks and Virtual Address Descriptor trees).',
          'Digital evidence standards (ISO/IEC 27037) and legal admissibility criteria in judicial jurisprudence.',
        ],
        algorithmicAnalysisAr: 'خوارزمية إعادة بناء الخط الزمني للحادثة (Timeline Reconstruction Algorithm): دمج طوابع MACB الزمنية.',
        algorithmicAnalysisEn: 'Timeline Reconstruction Algorithm: Merging and normalizing Modified-Accessed-Created-Born (MACB) timestamps.',
        researchAndDesignAspectsAr: [
          'تقنيات مكافحة التحقيق الجنائي (Anti-Forensics) وكيفية كشف إخفاء البيانات (Steganography) ومسح السجلات (Timestomping).',
          'التحقيق الجنائي في البيئات السحابية والحاويات الافتراضية سريعة الزوال (Ephemeral Container Forensics).',
        ],
        researchAndDesignAspectsEn: [
          'Anti-forensics detection methodologies: Uncovering timestamp manipulation (timestomping) and log wiping artifacts.',
          'Forensic challenges in ephemeral cloud microservices and serverless execution environments.',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'مادة الأدلة الجنائية الرقمية في كليات علوم الحاسوب وتكنولوجيا المعلومات (المرحلة الرابعة)',
        academicTierEn: 'Digital Forensics Course in Computer Science & IT Colleges (Year 4)',
        vocationalTierAr: 'مادة الاستجابة للحوادث والأمن الجنائي في المعاهد التخصصية',
        vocationalTierEn: 'Incident Response & Cybersecurity Forensics in Specialized Institutes',
        subjectMappingAr: 'التحقيق الجنائي الرقمي / الأدلة الإلكترونية والاستجابة للحوادث',
        subjectMappingEn: 'Digital Forensics / Electronic Evidence & Incident Handling',
        suggestedPrerequisitesAr: ['أنظمة التشغيل، تراكيب الملفات، وأمن المعلومات المتقدم'],
        suggestedPrerequisitesEn: ['Operating systems, file system structures, and advanced information security'],
      },
    },
    modules: [
      {
        id: 'mod-7-1',
        titleAr: 'التحقيق الرقمي والأدلة',
        titleEn: 'Digital Forensics & Evidence Preservation',
        lessonIds: ['lesson-07-01-forensics-foundations', 'lesson-07-02-memory-artifacts', 'lesson-07-03-incident-response'],
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
    iraqiSubjectNameAr: 'أمن البرمجيات وتطبيقات الويب وخطوط التطوير الآمنة (AppSec & DevSecOps)',
    iraqiSubjectNameEn: 'Web Application Security & DevSecOps',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: فحص ثغرات الويب وإدماج أدوات الفحص في خطوط النشر',
        titleEn: 'Vocational Track: Web Vulnerability Assessment & Automated CI/CD Gates',
        practicalSkillsAr: [
          'فحص واجهات الويب واكتشاف ثغرات حقن SQL (SQLi) وهجمات XSS باستخدام استعلامات آمنة ومُعاملة (Parameterized Queries).',
          'تأمين مفاتيح API وبيانات الاعتماد ومنع تخزينها كودياً داخل مستودعات Git (Secrets Scanning).',
          'دمج أدوات الفحص الساكن (SAST) وفحص التبعيات (SCA) داخل خطوط التطوير والبناء الآلي (GitLab CI / GitHub Actions).',
        ],
        practicalSkillsEn: [
          'Test web endpoints for SQL Injection (SQLi) and XSS flaws, mitigating them with parameterized prepared statements.',
          'Secure API keys and credentials, preventing hardcoded secret leakage in Git repositories via automated hooks.',
          'Integrate Static Application Security Testing (SAST) and Software Composition Analysis (SCA) into CI/CD pipelines.',
        ],
        troubleshootingRunbookAr: [
          'فشل البناء في CI/CD بسبب ثغرة عالية الخطورة: فحص تقرير الفاحص الأمني وتحديث المكتبة المصابة أو تطبيق حل ترقيعي فوري.',
          'اكتشاف مفتاح سري مسرب في Git: إلغاء وتدوير المفتاح فوراً (Rotate Secret) ومسح السجل عبر git-filter-repo.',
        ],
        troubleshootingRunbookEn: [
          'Pipeline build break due to critical vulnerability: Triage SAST report and patch/upgrade dependencies.',
          'Leaked secret in git history: Immediately revoke/rotate credentials and sanitize commit history via git-filter-repo.',
        ],
        labToolingAr: ['OWASP ZAP / Burp Suite Community', 'Semgrep / SonarQube', 'TruffleHog / GitGuardian'],
        labToolingEn: ['OWASP ZAP / Burp Suite Community', 'Semgrep / SonarQube', 'TruffleHog / GitGuardian'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: هندسة البرمجيات الآمنة، نمذجة التهديدات، وتحليل الشفرة البرمجية',
        titleEn: 'University Track: Secure Software Engineering, Threat Modeling & Code Analysis',
        theoreticalConceptsAr: [
          'دورة حياة تطوير البرمجيات الآمنة (Secure SDLC) وتطبيق نموذج STRIDE لنمذجة التهديدات في مرحلة التصميم.',
          'التحليل الساكن لتدفق البيانات (Taint Analysis & Abstract Syntax Trees - AST) لتتبع المدخلات غير الموثوقة.',
          'تصنيف ثغرات OWASP Top 10 ومعايير CWE (Common Weakness Enumeration) وأمان واجهات البرمجة REST/GraphQL.',
        ],
        theoreticalConceptsEn: [
          'Secure Software Development Lifecycle (SSDLC) governance and architectural threat modeling via STRIDE.',
          'Static taint analysis and Abstract Syntax Tree (AST) evaluation for untrusted input tracing to sinks.',
          'OWASP Top 10 vulnerability classification, Common Weakness Enumeration (CWE), and API security specifications.',
        ],
        algorithmicAnalysisAr: 'خوارزمية تحليل التلوث البرمجي (Taint Flow Propagation): التحقق من مرور كل مدخل خارجي عبر دالة تعقيم آمنة قبل الوصول لمصرف البيانات.',
        algorithmicAnalysisEn: 'Taint Analysis Dataflow Algorithm: Proving all source-to-sink paths traverse sanitization sanitizers.',
        researchAndDesignAspectsAr: [
          'تحليل أمان سلاسل توريد البرمجيات (Software Supply Chain Security) والتوقيع الرقمي للحزم (Sigstore / Cosign).',
          'بنية قائمة مكونات البرمجيات (Software Bill of Materials - SBOM / CycloneDX) وإدارة مخاطر المصادر المفتوحة.',
        ],
        researchAndDesignAspectsEn: [
          'Software supply chain integrity assurance: Cryptographic artifact signing with Sigstore and Cosign.',
          'Software Bill of Materials (SBOM) generation standards (CycloneDX / SPDX) and third-party risk governance.',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'مادة أمن البرمجيات وتطبيقات الويب لطلبة هندسة البرمجيات وتكنولوجيا المعلومات (المرحلة الثالثة والرابعة)',
        academicTierEn: 'Software Security & Web AppSec for Software Engineering & IT (Year 3/4)',
        vocationalTierAr: 'مادة تصميم وبرمجة وتأمين مواقع الويب في المعاهد التقنية',
        vocationalTierEn: 'Web Development & Security in Technical Institutes',
        subjectMappingAr: 'أمن البرمجيات / أمن تطبيقات الويب وقواعد البيانات',
        subjectMappingEn: 'Software Security / Web Application & Database Defense',
        suggestedPrerequisitesAr: ['برمجة الويب (HTML, JS, Backend) وقواعد البيانات SQL'],
        suggestedPrerequisitesEn: ['Web development fundamentals (HTML, JS, Backend) and SQL relational databases'],
      },
    },
    modules: [
      {
        id: 'mod-8-1',
        titleAr: 'تطبيقات الويب وخطوط DevSecOps',
        titleEn: 'Web AppSec & DevSecOps Pipelines',
        lessonIds: ['lesson-08-01-web-owasp', 'lesson-08-02-devsecops-pipeline', 'lesson-08-03-supply-chain'],
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
    iraqiSubjectNameAr: 'أمن البنى السحابية والحاويات واصطياد التهديدات (Cloud, Containers & Threat Hunting)',
    iraqiSubjectNameEn: 'Cloud Infrastructure, Containers & Threat Hunting',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: تأمين حاويات Docker وسياسات عزل Kubernetes وإدارة IAM',
        titleEn: 'Vocational Track: Docker Hardening, Kubernetes NetworkPolicy & Cloud IAM',
        practicalSkillsAr: [
          'بناء صور حاويات آمنة تعمل بدون امتيازات الجذر (Non-root user) وفحص الثغرات باستخدام Trivy.',
          'تطبيق سياسات شبكة Kubernetes (NetworkPolicy) لعزل الاتصال بين كبسولات التطبيق وقواعد البيانات.',
          'مراجعة وتطبيق الامتياز الأدنى على حسابات الخدمة السحابية (IAM Roles & Service Accounts) لمنع الوصول غير المصرح.',
        ],
        practicalSkillsEn: [
          'Build hardened, minimal container images executing as non-root users, scanned via Trivy for CVEs.',
          'Deploy Kubernetes NetworkPolicy manifests to isolate inter-pod communication and protect database backends.',
          'Audit and enforce least-privilege IAM policies on cloud service accounts to prevent privilege escalation.',
        ],
        troubleshootingRunbookAr: [
          'توقف اتصال الحاويات ببعضها بعد تطبيق NetworkPolicy: فحص مطابقة محددات التسمية (podSelector / matchLabels) ومنافذ الخدمة المسموحة.',
          'الاشتباه في اختراق الحاوية: فحص سجلات تدقيق Kubernetes ومقارنة تجزئة العمليات العاملة بالصورة الأصلية.',
        ],
        troubleshootingRunbookEn: [
          'Pod communication failure post-NetworkPolicy: Verify podSelector labels and ingress/egress port allowances.',
          'Suspected container compromise: Inspect Kubernetes audit logs and diff running processes against pristine image.',
        ],
        labToolingAr: ['Docker CLI / Podman', 'Kubectl & Minikube', 'Trivy Container Scanner', 'AWS CLI / CloudTrail'],
        labToolingEn: ['Docker CLI / Podman', 'Kubectl & Minikube', 'Trivy Container Scanner', 'AWS CLI / CloudTrail'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: عزل أنوية لينكس، أمن الأنظمة الموزعة وصيد التهديدات الاستباقي',
        titleEn: 'University Track: Kernel Namespaces, Distributed Cloud Security & Threat Hunting',
        theoreticalConceptsAr: [
          'آليات عزل أنوية لينكس للحاويات: مساحات الأسماء (Namespaces: PID, NET, MNT, IPC, UTS) ومجموعات التحكم (cgroups).',
          'معمارية التحكم في الوصول القائمة على الأدوار (RBAC) في كوبرنيتيس ونموذج انعدام الثقة (Zero Trust Architecture - NIST SP 800-207).',
          'منهجية صيد التهديدات الاستباقية (Threat Hunting Methodology): صياغة الفرضيات، جمع القرائن، وتأكيد أو نفي الاختراق.',
        ],
        theoreticalConceptsEn: [
          'Linux kernel containerization primitives: Namespaces (PID, NET, MNT, IPC, UTS) and Control Groups (cgroups).',
          'Kubernetes API Server security architecture, RBAC authorization, and Zero Trust Architecture (NIST SP 800-207).',
          'Proactive threat hunting methodology: Hypothesis formulation, telemetry baseline deviation, and adversary attribution.',
        ],
        algorithmicAnalysisAr: 'خوارزمية تقييم سياسات الوصول السحابية (IAM Policy Evaluation Engine): المنع الصريح يسبق أي سماح (Explicit Deny Overrides Allow).',
        algorithmicAnalysisEn: 'IAM Policy Evaluation Logic: Deterministic evaluation tree where explicit DENY supersedes any permissive ALLOW.',
        researchAndDesignAspectsAr: [
          'تحليل تقنيات الهروب من الحاويات (Container Breakout Primitives) واستغلال ثغرات قدرات النواة (Linux Capabilities).',
          'بناء منصات صيد التهديدات في البيئات السحابية الهجينة والتعامل مع السجلات الموزعة الضخمة.',
        ],
        researchAndDesignAspectsEn: [
          'Container breakout primitives analysis: Exploiting excess Linux capabilities (CAP_SYS_ADMIN) and dirty COW vectors.',
          'Threat hunting at cloud scale: High-volume telemetry stream ingestion and behavioral anomaly clustering.',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'مادة الحوسبة السحابية وأمن النظم الموزعة لطلبة السنة الأخيرة والدراسات العليا',
        academicTierEn: 'Cloud Computing & Distributed Systems Security in Senior & Graduate programs',
        vocationalTierAr: 'مادة الحوسبة السحابية الافتراضية وإدارة الخوادم في المعاهد التقنية',
        vocationalTierEn: 'Virtualization & Cloud Computing Administration in Technical Institutes',
        subjectMappingAr: 'أمن الحوسبة السحابية / النظم الموزعة وصيد التهديدات المتقدمة',
        subjectMappingEn: 'Cloud Security / Distributed Systems & Advanced Threat Hunting',
        suggestedPrerequisitesAr: ['أنظمة تشغيل متقدمة، أمن الشبكات، وأساسيات إدارة الخوادم الافتراضية'],
        suggestedPrerequisitesEn: ['Advanced operating systems, network security, and virtualization fundamentals'],
      },
    },
    modules: [
      {
        id: 'mod-9-1',
        titleAr: 'أمن السحابة واصطياد التهديدات',
        titleEn: 'Cloud Security & Threat Hunting',
        lessonIds: ['lesson-09-01-cloud-identity', 'lesson-09-02-kubernetes-defense', 'lesson-09-03-threat-hunting'],
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
    iraqiSubjectNameAr: 'المشروع التطبيقي الشامل والميدان السيبراني (Cyber Range Capstone)',
    iraqiSubjectNameEn: 'Enterprise Cyber Range & Capstone Defense',
    trackAdaptation: {
      vocationalFocus: {
        titleAr: 'المسار المهني: الاستجابة الميدانية السريعة وعزل الهجمات وإعادة تشغيل الخدمات',
        titleEn: 'Vocational Track: Rapid Incident Containment & Critical Infrastructure Recovery',
        practicalSkillsAr: [
          'تنفيذ بروتوكول عزل الأجهزة المصابة عن الشبكة المؤسسية دون إيقاف تشغيلها للحفاظ على الأدلة.',
          'تحديث قواعد جدار الحماية فورياً لحظر خوادم القيادة والسيطرة (C2 Servers) للمهاجم.',
          'استعادة الخدمات الحيوية من النسخ الاحتياطية النظيفة والتحقق من سلامة قواعد البيانات.',
        ],
        practicalSkillsEn: [
          'Execute immediate network isolation protocols for compromised nodes while maintaining volatile forensic state.',
          'Deploy hot firewall rules to block adversarial Command and Control (C2) communication channels.',
          'Restore critical business services from authenticated offline backups and verify database consistency.',
        ],
        troubleshootingRunbookAr: [
          'هجوم فدية نشط (Active Ransomware): عزل مقاطع الشبكة المتأثرة فوراً عبر تعطيل منافذ المبدل (Switch Port Shutdown) وإيقاف خوادم التخزين المشترك SMB.',
          'اختراق حساب مسؤول النطاق (Compromised Domain Admin): تدوير مفتاح krbtgt مرتين وإعادة تعيين كلمات مرور الحسابات الإدارية وتفعيل المصادقة متعددة العوامل MFA.',
        ],
        troubleshootingRunbookEn: [
          'Active ransomware containment: Sever network VLANs immediately via switch port shutdown and disable SMB file shares.',
          'Compromised Domain Admin triage: Reset krbtgt password twice, force administrative credential rotation, and mandate MFA.',
        ],
        labToolingAr: ['Enterprise Cyber Range Interface', 'Full Telemetry Dashboards', 'Firewall / Switch CLI', 'AD Administration'],
        labToolingEn: ['Enterprise Cyber Range Interface', 'Full Telemetry Dashboards', 'Firewall / Switch CLI', 'AD Administration'],
      },
      academicDepth: {
        titleAr: 'المسار الجامعي: تقييم المناعة السيبرانية، تحليل سلاسل الهجوم، والتصميم المعماري الصامد',
        titleEn: 'University Track: Cyber Resilience Metrics, Attack Graph Analysis & Resilient Architecture',
        theoreticalConceptsAr: [
          'نمذجة سلاسل القتل السيبراني (Cyber Kill Chain) ومصفوفة ميتري لإعادة بناء تسلسل الهجوم متعدد المراحل.',
          'حساب مقاييس الصمود السيبراني (Mean Time to Detect - MTTD و Mean Time to Respond - MTTR).',
          'تصميم البنى التحتية الحرجة المقاومة للكوارث (Cyber Resilient Architecture) والتعافي من الهجمات المعقدة.',
        ],
        theoreticalConceptsEn: [
          'Multi-stage intrusion modeling synthesizing Lockheed Martin Cyber Kill Chain and MITRE ATT&CK kill-chains.',
          'Quantitative cyber resilience telemetry: Mean Time to Detect (MTTD), Mean Time to Remediate (MTTR), and blast-radius metrics.',
          'Critical national infrastructure survivability design and formal cyber-resilient architectural synthesis.',
        ],
        algorithmicAnalysisAr: 'خوارزمية مسارات الهجوم في الرسوم البيانية (Attack Graph Reachability Algorithm): حساب أقصر مسار يمكن للمهاجم استغلاله للوصول للمحطة الحيوية.',
        algorithmicAnalysisEn: 'Attack Graph Reachability Algorithm: Finding shortest topological paths from perimeter breach to crown jewels.',
        researchAndDesignAspectsAr: [
          'دراسة وتصميم أنظمة الخداع السيبراني التفاعلية (Cyber Deception & Honeypots) للإيقاع بالمهاجمين المتقدمين.',
          'تقييم أثر الهجمات السيبرانية على الأمن القومي والبنى التحتية الوطنية الحيوية (الطاقة، الاتصالات، والخدمات المصرفية).',
        ],
        researchAndDesignAspectsEn: [
          'Next-generation active cyber deception architectures and distributed honeypot instrumentation.',
          'National cyber defense strategy synthesis: Protecting critical national infrastructure (energy, banking, healthcare).',
        ],
      },
      iraqiCurriculumContext: {
        academicTierAr: 'مشروع التخرج العملي والميدان السيبراني التكاملي لطلبة السنة الرابعة في كليات الهندسة وتقنية المعلومات',
        academicTierEn: 'Senior Capstone Graduation Project & Comprehensive Cyber Range in Engineering & IT Colleges (Year 4)',
        vocationalTierAr: 'مشروع التخرج التطبيقي والتدريب الميداني لطلبة المعاهد التقنية',
        vocationalTierEn: 'Applied Capstone Project & Practicum in Technical Institutes',
        subjectMappingAr: 'مشروع التخرج السيبراني / الميدان والمختبر التطبيقي المتقدم',
        subjectMappingEn: 'Cybersecurity Capstone / Advanced Simulation Range',
        suggestedPrerequisitesAr: ['اجتياز جميع المستويات السابقة من 0 إلى 9 بنجاح'],
        suggestedPrerequisitesEn: ['Successful completion of all prerequisite levels (Level 0 through Level 9)'],
      },
    },
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
  iraqiSubjectNameAr: lvl.iraqiSubjectNameAr,
  iraqiSubjectNameEn: lvl.iraqiSubjectNameEn,
  trackAdaptation: lvl.trackAdaptation,
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
    track: 'common',
    relatedSimulationIds: ['landing', 'cia_triad'],
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
    track: 'common',
    relatedSimulationIds: ['ipv4', 'subnetting', 'arp', 'subnet_routing'],
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
    track: 'common',
    relatedSimulationIds: ['subnetting', 'ipv4', 'subnet_routing'],
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
    track: 'common',
    relatedSimulationIds: ['cia_triad', 'firewall', 'crypto'],
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
    track: 'common',
    relatedSimulationIds: ['system_internals', 'linux', 'windows'],
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
    track: 'common',
    relatedSimulationIds: ['subnet_routing', 'routing', 'switching', 'tcp', 'udp', 'dhcp', 'dns', 'ports_services'],
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
    track: 'common',
    relatedSimulationIds: ['firewall', 'vlan', 'nat', 'ports_services'],
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
    track: 'common',
    relatedSimulationIds: ['crypto', 'tls'],
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
    track: 'common',
    relatedSimulationIds: ['active_directory', 'windows', 'zero_trust'],
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
    track: 'common',
    relatedSimulationIds: ['soc', 'siem', 'threat_hunting'],
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

  'lesson-07-01-forensics-foundations': {
    id: 'lesson-07-01-forensics-foundations',
    milestoneId: 7,
    order: 1,
    titleAr: 'الدرس 7.1: أساسيات التحقيق وحفظ الأدلة',
    titleEn: 'Lesson 7.1: Forensic Foundations & Evidence Preservation',
    whyItMattersAr: 'الدليل الرقمي هش للغاية؛ أي خطأ بسيط قد يجعله غير مقبول في المحكمة.',
    whyItMattersEn: 'Digital evidence is volatile; any procedural misstep can render it inadmissible in legal proceedings.',
    estimatedMinutes: 15,
    simulationId: 'forensics',
    challengeId: 'evidence-preservation-challenge',
    track: 'common',
    relatedSimulationIds: ['forensics', 'chain_of_custody'],
    prerequisites: [{ textAr: 'إكمال المستوى 6: مراقبة SOC.', textEn: 'Completion of Level 6: SOC Monitoring.' }],
    workedExample: {
      titleAr: 'مثال: توثيق سلسلة الحيازة (Chain of Custody)',
      titleEn: 'Example: Documenting Chain of Custody',
      scenarioAr: 'ضبط قرص صلب من جهاز مشبوه وتوثيق حركته:',
      scenarioEn: 'Seizing a hard drive from a suspect workstation and tracking its custody:',
      stepsAr: [
        'الخطوة 1: تصوير الدليل وحساب بصمة SHA-256 فوراً.',
        'الخطوة 2: وضع القرص في حقيبة Faraday لمنع التلاعب عن بعد.',
        'الخطوة 3: تسجيل اسم المحقق والوقت والمكان في استمارة رسمية.',
      ],
      stepsEn: [
        'Step 1: Image the drive and compute SHA-256 hash immediately.',
        'Step 2: Place media in a Faraday bag to prevent remote tampering.',
        'Step 3: Record investigator name, time, and location in an official log.',
      ],
      takeawayAr: 'سلسلة الحيازة هي العمود الفقري للتحقيق الجنائي.',
      takeawayEn: 'Chain of custody is the backbone of forensic integrity.',
    },
    independentChallengeDetail: {
      titleAr: 'تحدي الحفظ: تأمين مسرح الجريمة الرقمي',
      titleEn: 'Preservation Challenge: Securing the Digital Crime Scene',
      scenarioAr: 'جهاز خادم تعرض للاختراق. قم بتأمين الأدلة وحساب البصمات قبل التحليل:',
      scenarioEn: 'A server has been compromised. Secure the evidence and calculate hashes before analysis:',
      targetOutcomeAr: 'نجاح حفظ الأدلة وتوثيقها بصورة قانونية.',
      targetOutcomeEn: 'Successful evidence preservation and legal documentation.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن التحليل يبدأ مباشرة على الجهاز الأصلي.',
      commonMisconceptionEn: 'Thinking that analysis starts directly on the original device.',
      guidanceAr: 'دائماً اعمل على نسخة جنائية (Forensic Copy) واستخدم مانع الكتابة (Write Blocker).',
      guidanceEn: 'Always work on a forensic copy using a hardware write blocker.',
    },
    keyTakeaways: [
      { textAr: 'قاعدة الاستمرارية: لا تكسر سلسلة الحيازة أبداً.', textEn: 'Continuity rule: Never break the chain of custody.' },
      { textAr: 'ترتيب التطاير: اجمع البيانات الأسرع زوالاً أولاً.', textEn: 'Order of Volatility: Collect the most fleeting data first.' },
    ],
    objectives: [
      { textAr: 'فهم مبادئ حفظ الأدلة الرقمية.', textEn: 'Understand digital evidence preservation principles.' },
      { textAr: 'تعلم كيفية حساب بصمات السلامة (Hashing).', textEn: 'Learn how to calculate integrity hashes.' },
    ],
    concept: {
      textAr: 'التحقيق الجنائي الرقمي يبدأ بالحفاظ على الحالة الراهنة للدليل الرقمي دون تغيير بايت واحد.',
      textEn: 'Digital forensics begins with preserving the current state of digital evidence without altering a single byte.',
      analogyAr: 'مثل قفل باب الغرفة ومنع أي شخص من الدخول حتى ينتهي المحقق من رفع البصمات.',
      analogyEn: 'Like locking a room and barring entry until the investigator finishes lifting physical fingerprints.',
      keyTerms: [
        { termAr: 'سلسلة الحيازة', termEn: 'Chain of Custody', definitionAr: 'التوثيق المستمر لحركة الدليل.', definitionEn: 'The continuous documentation of evidence handling.' },
      ],
    },
    demonstration: {
      titleAr: 'معاينة أدوات التصوير الجنائي',
      titleEn: 'Forensic Imaging Tool Preview',
      whatToLookForAr: 'شاهد عملية حساب الهاش أثناء أخذ النسخة الجنائية.',
      whatToLookForEn: 'Observe live hashing during forensic image acquisition.',
      initialStateAr: 'القرص الأصلي محمي ضد الكتابة.',
      initialStateEn: 'Original disk is write-protected.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة الحفظ الجنائي',
      taskTitleEn: 'Forensic Preservation Task',
      instructionsAr: ['افتح محاكي الأدلة.', 'اختر أداة التصوير الجنائي.', 'وثق البصمة الناتجة.'],
      instructionsEn: ['Open evidence lab.', 'Select forensic imaging tool.', 'Document the resulting hash.'],
      whyWeDoThisAr: 'لضمان عدم التشكيك في سلامة الدليل.',
      whyWeDoThisEn: 'To ensure evidence integrity cannot be challenged.',
      hintsAr: ['البصمة يجب أن تتطابق مع الأصل دائماً.'],
      hintsEn: ['The hash must always match the original.'],
      validationCriterionAr: 'حساب البصمة وتوثيقها بنجاح.',
      validationCriterionEn: 'Successful hash calculation and documentation.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم تأمين الدليل بنجاح واجتياز الفحص الجنائي المبدئي.',
      whatHappenedEn: 'Evidence successfully secured, passing initial forensic audit.',
      securitySignificanceAr: 'هذا يضمن قبول الدليل في المحكمة.',
      securitySignificanceEn: 'This ensures legal admissibility in court.',
    },
    knowledgeCheck: [
      {
        id: 'q7-1-1',
        questionAr: 'ما هو أول شيء يجب فعله عند ضبط جهاز مشبوه؟',
        questionEn: 'What is the first action when seizing a suspect device?',
        options: [
          { id: 'a1', textAr: 'تصوير الدليل وحساب الهاش', textEn: 'Image the evidence and compute hash', isCorrect: true, explanationAr: 'صحيح لضمان السلامة.', explanationEn: 'Correct to ensure integrity.' },
          { id: 'a2', textAr: 'تشغيل الجهاز والبحث عن الملفات', textEn: 'Turn it on and browse files', isCorrect: false, explanationAr: 'خطأ! هذا يلوث الدليل.', explanationEn: 'Incorrect! This contaminates evidence.' },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-07-02-memory-artifacts',
      takeawayAr: 'الآن بعد حفظ الدليل، لنتعلم كيف نحلل الذاكرة العشوائية.',
      takeawayEn: 'Now that evidence is preserved, let\'s analyze volatile RAM.',
    },
  },

  'lesson-07-02-memory-artifacts': {
    id: 'lesson-07-02-memory-artifacts',
    milestoneId: 7,
    order: 2,
    titleAr: 'الدرس 7.2: تحليل الذاكرة العشوائية والآثار الرقمية',
    titleEn: 'Lesson 7.2: Volatile Memory & System Artifact Analysis',
    whyItMattersAr: 'العديد من الهجمات الحديثة لا تترك أثراً على القرص الصلب، بل تختبئ في الذاكرة العشوائية فقط.',
    whyItMattersEn: 'Many modern attacks leave no disk footprint, existing exclusively within volatile RAM.',
    estimatedMinutes: 20,
    simulationId: 'forensics',
    challengeId: 'memory-analysis-challenge',
    track: 'common',
    relatedSimulationIds: ['forensics', 'volatility', 'registry'],
    prerequisites: [{ textAr: 'إكمال درس أساسيات التحقيق.', textEn: 'Completion of Forensic Foundations.' }],
    workedExample: {
      titleAr: 'مثال: كشف عملية مشبوهة في الذاكرة',
      titleEn: 'Example: Detecting Malicious Processes in RAM',
      scenarioAr: 'فحص نسخة من الذاكرة (RAM Dump) بحثاً عن برمجيات خبيثة:',
      scenarioEn: 'Analyzing a RAM dump for hidden malware:',
      stepsAr: [
        'الخطوة 1: سرد جميع العمليات النشطة (pslist).',
        'الخطوة 2: البحث عن عمليات مخفية أو بدون والد (Parent-less processes).',
        'الخطوة 3: استخراج روابط الشبكة النشطة من الذاكرة.',
      ],
      stepsEn: [
        'Step 1: List all active processes (pslist).',
        'Step 2: Scan for hidden or orphaned processes.',
        'Step 3: Extract active network connections from memory.',
      ],
      takeawayAr: 'الذاكرة تكشف ما يحاول المهاجم إخفاءه عن القرص.',
      takeawayEn: 'Memory reveals what attackers try to hide from the file system.',
    },
    independentChallengeDetail: {
      titleAr: 'تحدي تحليل الذاكرة: اصطياد الجرذ المخفي',
      titleEn: 'Memory Challenge: Hunting the Hidden RAT',
      scenarioAr: 'برمجية خبيثة تعمل في الخلفية. استخرج مسار تنفيذها واتصالها الشبكي من الذاكرة:',
      scenarioEn: 'A malware is running in the background. Extract its execution path and network IP from RAM:',
      targetOutcomeAr: 'تحديد العملية الخبيثة وعنوان IP المهاجم.',
      targetOutcomeEn: 'Identify malicious process and attacker C2 IP.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن إيقاف التشغيل لا يضر بالتحقيق.',
      commonMisconceptionEn: 'Thinking that powering off doesn\'t harm the investigation.',
      guidanceAr: 'إيقاف التشغيل يمسح الذاكرة العشوائية؛ اسحب الذاكرة دائماً والجهاز يعمل.',
      guidanceEn: 'Powering off wipes RAM; always perform memory acquisition while the system is live.',
    },
    keyTakeaways: [
      { textAr: 'الذاكرة العشوائية هي منجم ذهب للمحقق.', textEn: 'RAM is a goldmine for forensic investigators.' },
      { textAr: 'ملفات Registry و Prefetch توفر سياقاً تاريخياً ممتازاً.', textEn: 'Registry and Prefetch files provide critical historical context.' },
    ],
    objectives: [
      { textAr: 'تحليل سجلات العمليات في الذاكرة.', textEn: 'Analyze process logs in volatile memory.' },
      { textAr: 'استخدام أدوات تحليل الآثار الرقمية (Artifacts).', textEn: 'Utilize digital artifact analysis tools.' },
    ],
    concept: {
      textAr: 'تحليل الذاكرة (Memory Forensics) يتضمن فحص محتويات RAM لاسترجاع كلمات المرور، العمليات الجارية، واتصالات الشبكة.',
      textEn: 'Memory forensics involves inspecting RAM contents to recover passwords, running processes, and network sockets.',
      analogyAr: 'مثل سؤال شاهد عيان رأى الجريمة للتو قبل أن ينسى التفاصيل.',
      analogyEn: 'Like interviewing an eyewitness immediately after a crime before their memory fades.',
      keyTerms: [
        { termAr: 'تفريغ الذاكرة', termEn: 'Memory Dump', definitionAr: 'نسخة كاملة من محتويات RAM.', definitionEn: 'A complete copy of RAM contents.' },
      ],
    },
    demonstration: {
      titleAr: 'معاينة أوامر Volatility',
      titleEn: 'Volatility Command Preview',
      whatToLookForAr: 'شاهد استخراج قائمة العمليات من نسخة الذاكرة.',
      whatToLookForEn: 'Observe process list extraction from a memory dump.',
      initialStateAr: 'نسخة الذاكرة جاهزة للتحليل.',
      initialStateEn: 'Memory image loaded and ready.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة تحليل الآثار',
      taskTitleEn: 'Artifact Analysis Task',
      instructionsAr: ['حلل نسخة الذاكرة.', 'ابحث عن عملية غير معروفة.', 'حدد عنوان IP الوجهة.'],
      instructionsEn: ['Analyze memory image.', 'Find unlisted process.', 'Identify destination IP.'],
      whyWeDoThisAr: 'لاكتشاف الهجمات التي لا تترك ملفات (Fileless Attacks).',
      whyWeDoThisEn: 'To discover fileless malware attacks.',
      hintsAr: ['العمليات المشبوهة غالباً ما تملك أسماء شبيهة بعمليات النظام.'],
      hintsEn: ['Malicious processes often mimic system service names.'],
      validationCriterionAr: 'تحديد العملية الخبيثة بنجاح.',
      validationCriterionEn: 'Successful identification of malicious process.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم كشف البرنامج الخبيث وتحديد مصدر الهجوم.',
      whatHappenedEn: 'Malware exposed and attack source identified.',
      securitySignificanceAr: 'هذا يتيح عزل التهديد فوراً.',
      securitySignificanceEn: 'This enables immediate threat containment.',
    },
    knowledgeCheck: [
      {
        id: 'q7-2-1',
        questionAr: 'ماذا يحدث لمحتويات RAM عند إيقاف تشغيل الحاسوب؟',
        questionEn: 'What happens to RAM contents when a computer is powered off?',
        options: [
          { id: 'b1', textAr: 'تختفي نهائياً', textEn: 'They vanish permanently', isCorrect: true, explanationAr: 'صحيح، لأن الذاكرة متطايرة.', explanationEn: 'Correct, RAM is volatile.' },
          { id: 'b2', textAr: 'تنتقل للقرص الصلب تلقائياً', textEn: 'They move to disk automatically', isCorrect: false, explanationAr: 'غير صحيح.', explanationEn: 'Incorrect.' },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-07-03-incident-response',
      takeawayAr: 'رائع! الآن لنجمع كل هذه الأدلة لإعادة بناء الخط الزمني.',
      takeawayEn: 'Great! Now let\'s synthesize this evidence to reconstruct the timeline.',
    },
  },

  'lesson-07-03-incident-response': {
    id: 'lesson-07-03-incident-response',
    milestoneId: 7,
    order: 3,
    titleAr: 'الدرس 7.3: الاستجابة للحوادث وإعادة بناء الخط الزمني',
    titleEn: 'Lesson 7.3: Incident Response & Timeline Reconstruction',
    whyItMattersAr: 'معرفة "ماذا حدث" غير كافية؛ يجب معرفة "متى" و"كيف" لمنع تكرار الحادثة.',
    whyItMattersEn: 'Knowing "what happened" is insufficient; you must know "when" and "how" to prevent recurrence.',
    estimatedMinutes: 20,
    simulationId: 'forensics',
    challengeId: 'timeline-mastery-challenge',
    track: 'common',
    relatedSimulationIds: ['forensics', 'incident_response', 'reporting'],
    prerequisites: [{ textAr: 'إكمال درس تحليل الذاكرة.', textEn: 'Completion of Memory Analysis.' }],
    workedExample: {
      titleAr: 'مثال: تتبع سلسلة الأحداث',
      titleEn: 'Example: Event Sequence Tracking',
      scenarioAr: 'دمج سجلات الجدار الناري وسجلات النظام والآثار الجنائية في خط زمني واحد:',
      scenarioEn: 'Merging firewall logs, system logs, and forensic artifacts into a unified timeline:',
      stepsAr: [
        '14:00 - وصول بريد تصيدي.',
        '14:05 - المستخدم ينقر على الرابط.',
        '14:10 - تحميل ملف backdoor.exe.',
        '14:15 - المهاجم يحصل على سطر أوامر تفاعلي.',
      ],
      stepsEn: [
        '14:00 - Phishing email arrives.',
        '14:05 - User clicks the link.',
        '14:10 - Backdoor.exe downloaded.',
        '14:15 - Attacker gains interactive shell.',
      ],
      takeawayAr: 'الخط الزمني يوضح الفجوات في الدفاعات.',
      takeawayEn: 'The timeline highlights defensive gaps.',
    },
    independentChallengeDetail: {
      titleAr: 'تحدي الاستجابة: تحديد نقطة الصفر (Patient Zero)',
      titleEn: 'Response Challenge: Identifying Patient Zero',
      scenarioAr: 'تعرضت الشبكة لهجوم شامل. ابحث عن أول جهاز تم اختراقه وكيف تم ذلك:',
      scenarioEn: 'A network-wide attack occurred. Find the first compromised host (Patient Zero) and the vector:',
      targetOutcomeAr: 'تحديد نقطة الدخول الأولى وصياغة توصيات المعالجة.',
      targetOutcomeEn: 'Identify initial entry vector and draft remediation plan.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن تنظيف الجهاز المصاب هو نهاية المهمة.',
      commonMisconceptionEn: 'Thinking that cleaning the infected host is the end of the job.',
      guidanceAr: 'المعالجة تتطلب سد الثغرة الأصلية ومسح الشبكة بالكامل للتأكد من عدم وجود أبواب خلفية أخرى.',
      guidanceEn: 'Remediation requires patching the original flaw and sweeping the network for hidden backdoors.',
    },
    keyTakeaways: [
      { textAr: 'الاستجابة للحوادث عملية دورية (نظام NIST).', textEn: 'Incident response is a cyclic process (NIST framework).' },
      { textAr: 'الدروس المستفادة (Post-Mortem) تمنع تكرار الفشل.', textEn: 'Lessons Learned (Post-Mortem) prevent recurring failures.' },
    ],
    objectives: [
      { textAr: 'إعادة بناء الخط الزمني للحادثة.', textEn: 'Reconstruct incident timelines.' },
      { textAr: 'صياغة تقارير التحقيق الفنية.', textEn: 'Draft technical forensic reports.' },
    ],
    concept: {
      textAr: 'الاستجابة للحوادث (IR) هي المنهجية المنظمة للتعامل مع الاختراقات، من الكشف إلى التعافي.',
      textEn: 'Incident Response (IR) is the structured methodology for handling breaches, from detection to recovery.',
      analogyAr: 'مثل فريق الطوارئ في المستشفى الذي يسعف المريض ثم يحقق في سبب الإصابة لمنع انتشار العدوى.',
      analogyEn: 'Like a hospital ER team treating a patient, then investigating the cause to stop an outbreak.',
      keyTerms: [
        { termAr: 'نقطة الصفر', termEn: 'Patient Zero', definitionAr: 'أول جهاز أو مستخدم تم اختراقه.', definitionEn: 'The first infected host or user.' },
      ],
    },
    demonstration: {
      titleAr: 'معاينة لوحة تحكم الاستجابة',
      titleEn: 'IR Dashboard Preview',
      whatToLookForAr: 'شاهد تتابع الأحداث عبر الأنظمة المختلفة.',
      whatToLookForEn: 'Observe event correlation across disparate systems.',
      initialStateAr: 'البيانات مجمعة من عدة مصادر.',
      initialStateEn: 'Data aggregated from multiple sources.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة بناء الخط الزمني',
      taskTitleEn: 'Timeline Construction Task',
      instructionsAr: ['رتب الأحداث زمنياً.', 'حدد وسيلة الدخول.', 'اقترح حلولاً وقائية.'],
      instructionsEn: ['Order events chronologically.', 'Identify entry vector.', 'Propose preventive controls.'],
      whyWeDoThisAr: 'لفهم استراتيجية المهاجم بالكامل.',
      whyWeDoThisEn: 'To fully understand the adversary strategy.',
      hintsAr: ['ابحث عن أحداث تسجيل الدخول قبل بدء النشاط المشبوه.'],
      hintsEn: ['Look for logon events preceding suspicious activity.'],
      validationCriterionAr: 'بناء خط زمني دقيق وصحيح.',
      validationCriterionEn: 'Accurate timeline reconstruction verified.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'اكتمل التحقيق وتم تحديد الفجوات الأمنية.',
      whatHappenedEn: 'Investigation complete; security gaps identified.',
      securitySignificanceAr: 'هذا يحسن المناعة السيبرانية للمؤسسة مستقبلاً.',
      securitySignificanceEn: 'This improves future organizational cyber resilience.',
    },
    knowledgeCheck: [
      {
        id: 'q7-3-1',
        questionAr: 'ما هي أهمية مرحلة "الدروس المستفادة"؟',
        questionEn: 'What is the importance of the "Lessons Learned" phase?',
        options: [
          { id: 'c1', textAr: 'تحسين الدفاعات لمنع تكرار الهجوم', textEn: 'Improving defenses to prevent recurrence', isCorrect: true, explanationAr: 'ممتاز، هذا هو الهدف التطويري.', explanationEn: 'Excellent, this is the developmental goal.' },
          { id: 'c2', textAr: 'معاقبة الموظفين', textEn: 'Punishing employees', isCorrect: false, explanationAr: 'غير صحيح، الهدف تقني وأمني.', explanationEn: 'Incorrect, the goal is technical/security-focused.' },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-08-01-web-owasp',
      takeawayAr: 'تهانينا! أكملت مسار التحقيق الجنائي. الآن لنتجه لتأمين تطبيقات الويب.',
      takeawayEn: 'Congratulations! You finished the forensics track. Now let\'s secure web applications.',
    },
  },

  'lesson-08-01-web-owasp': {
    id: 'lesson-08-01-web-owasp',
    milestoneId: 8,
    order: 1,
    titleAr: 'الدرس 8.1: أمن الويب وثغرات OWASP Top 10',
    titleEn: 'Lesson 8.1: Web Security & OWASP Top 10',
    whyItMattersAr: 'تطبيقات الويب هي الواجهة الأكثر تعرضاً للهجمات في العالم الحديث.',
    whyItMattersEn: 'Web applications are the most exposed attack surface in the modern world.',
    estimatedMinutes: 20,
    simulationId: 'devsecops',
    challengeId: 'web-vulnerability-challenge',
    track: 'common',
    relatedSimulationIds: ['http', 'sql_injection', 'xss'],
    prerequisites: [{ textAr: 'إكمال المستوى 7: التحقيق الجنائي.', textEn: 'Completion of Level 7: DFIR.' }],
    workedExample: {
      titleAr: 'مثال: ثغرة حقن SQL (SQL Injection)',
      titleEn: 'Example: SQL Injection (SQLi)',
      scenarioAr: 'مهاجم يحاول تجاوز نموذج تسجيل الدخول باستخدام استعلام خبيث:',
      scenarioEn: 'An attacker attempts to bypass a login form using a malicious query:',
      stepsAr: [
        'الخطوة 1: إدخال (\' OR 1=1 --) في خانة اسم المستخدم.',
        'الخطوة 2: التطبيق يدمج النص في الاستعلام دون تعقيم.',
        'الخطوة 3: قاعدة البيانات تنفذ الشرط (دائماً صحيح) وتسمح بالدخول.',
      ],
      stepsEn: [
        'Step 1: Inject (\' OR 1=1 --) into the username field.',
        'Step 2: The app concatenates input into the query without sanitization.',
        'Step 3: Database evaluates condition (always true) and grants access.',
      ],
      takeawayAr: 'لا تثق أبداً بمدخلات المستخدم؛ استخدم الاستعلامات المُعاملة (Prepared Statements).',
      takeawayEn: 'Never trust user input; always use parameterized queries.',
    },
    independentChallengeDetail: {
      titleAr: 'تحدي الويب: كشف ثغرة XSS وترقيعها',
      titleEn: 'Web Challenge: Detecting & Patching XSS',
      scenarioAr: 'موقع ويب يسمح بكتابة تعليقات غير معقمة. قم بحقن نص برمجي ثم أصلح الكود لمنعه:',
      scenarioEn: 'A website permits unsanitized comments. Inject a script, then fix the code to block it:',
      targetOutcomeAr: 'تنفيذ حقن ناجح ثم تطبيق التعقيم (Encoding) لغلق الثغرة.',
      targetOutcomeEn: 'Execute successful injection, then apply output encoding to secure the site.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن جدار الحماية (WAF) يغني عن كتابة كود آمن.',
      commonMisconceptionEn: 'Thinking that a WAF replaces the need for secure coding.',
      guidanceAr: 'جدران الحماية طبقة إضافية، لكن الحل الجذري هو في منطق البرمجة نفسه.',
      guidanceEn: 'Firewalls are an extra layer; the root fix lies in the application logic itself.',
    },
    keyTakeaways: [
      { textAr: 'قائمة OWASP هي المعيار العالمي لأمن الويب.', textEn: 'OWASP Top 10 is the global standard for web security.' },
      { textAr: 'تعقيم المدخلات وتشفير المخرجات هما أساس الدفاع.', textEn: 'Input sanitization and output encoding are core defenses.' },
    ],
    objectives: [
      { textAr: 'التعرف على أشهر ثغرات الويب.', textEn: 'Identify common web vulnerabilities.' },
      { textAr: 'فهم كيفية عمل هجمات Injection و XSS.', textEn: 'Understand how Injection and XSS attacks function.' },
    ],
    concept: {
      textAr: 'أمن تطبيقات الويب يركز على حماية المواقع من التلاعب بالمدخلات لسرقة البيانات أو السيطرة على المتصفحات.',
      textEn: 'Web application security focuses on protecting sites from input manipulation intended to steal data or hijack browsers.',
      analogyAr: 'مثل فحص حقائب الزوار قبل دخولهم لمبنى حكومي للتأكد من عدم حملهم لأدوات محظورة.',
      analogyEn: 'Like inspecting visitor bags before entering a government building to ensure no prohibited items are brought in.',
      keyTerms: [
        { termAr: 'حقن SQL', termEn: 'SQL Injection', definitionAr: 'التلاعب باستعلامات قاعدة البيانات.', definitionEn: 'Manipulating database queries via input.' },
      ],
    },
    demonstration: {
      titleAr: 'معاينة هجوم XSS',
      titleEn: 'XSS Attack Preview',
      whatToLookForAr: 'شاهد كيف يظهر تنبيه (alert) في المتصفح عند حقن كود JS.',
      whatToLookForEn: 'Observe a browser alert appearing when JS code is injected.',
      initialStateAr: 'صفحة الويب غير محمية.',
      initialStateEn: 'Web page is vulnerable.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة اكتشاف الثغرات',
      taskTitleEn: 'Vulnerability Discovery Task',
      instructionsAr: ['ابحث عن حقول الإدخال.', 'جرب حقن نصوص اختبارية.', 'حدد الحقول المصابة.'],
      instructionsEn: ['Locate input fields.', 'Try test injection strings.', 'Identify vulnerable fields.'],
      whyWeDoThisAr: 'لفهم كيفية تفكير المهاجم.',
      whyWeDoThisEn: 'To understand the adversary mindset.',
      hintsAr: ['استخدم علامة الاقتباس الفردية (\') لاختبار SQLi.'],
      hintsEn: ['Use a single quote (\') to test for SQLi sensitivity.'],
      validationCriterionAr: 'اكتشاف الثغرة بنجاح في المحاكي.',
      validationCriterionEn: 'Successful vulnerability discovery verified.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم اكتشاف الثغرة وفهم آلية استغلالها.',
      whatHappenedEn: 'Vulnerability discovered and exploit mechanics understood.',
      securitySignificanceAr: 'هذا يحمي بيانات المستخدمين الحساسة.',
      securitySignificanceEn: 'This protects sensitive user data.',
    },
    knowledgeCheck: [
      {
        id: 'q8-1-1',
        questionAr: 'ما هو الحل الأفضل لمنع ثغرات SQL Injection؟',
        questionEn: 'What is the best fix for SQL Injection?',
        options: [
          { id: 'd1', textAr: 'استخدام Prepared Statements', textEn: 'Using Prepared Statements', isCorrect: true, explanationAr: 'صحيح، لأنها تفصل الكود عن البيانات.', explanationEn: 'Correct, as they separate code from data.' },
          { id: 'd2', textAr: 'حذف قاعدة البيانات', textEn: 'Deleting the database', isCorrect: false, explanationAr: 'حل غير منطقي.', explanationEn: 'Nonsensical solution.' },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-08-02-devsecops-pipeline',
      takeawayAr: 'ممتاز! الآن لنتعلم كيف نكتشف هذه الثغرات آلياً في خطوط التطوير.',
      takeawayEn: 'Excellent! Now let\'s learn how to detect these flaws automatically in pipelines.',
    },
  },

  'lesson-08-02-devsecops-pipeline': {
    id: 'lesson-08-02-devsecops-pipeline',
    milestoneId: 8,
    order: 2,
    titleAr: 'الدرس 8.2: خطوط التطوير الآمنة وبوابات الأمان',
    titleEn: 'Lesson 8.2: Secure Pipelines & Security Gates',
    whyItMattersAr: 'الأتمتة هي السبيل الوحيد لضمان الأمان في بيئات النشر السريع.',
    whyItMattersEn: 'Automation is the only way to ensure security in high-velocity deployment environments.',
    estimatedMinutes: 20,
    simulationId: 'devsecops',
    challengeId: 'pipeline-gate-challenge',
    track: 'common',
    relatedSimulationIds: ['devsecops', 'sast', 'secrets_scan'],
    prerequisites: [{ textAr: 'إكمال درس أمن الويب.', textEn: 'Completion of Web Security.' }],
    workedExample: {
      titleAr: 'مثال: فحص الأسرار (Secret Scanning)',
      titleEn: 'Example: Secret Scanning',
      scenarioAr: 'مطور يرفع كوداً يحتوي على API Key حقيقي بالخطأ:',
      scenarioEn: 'A developer accidentally commits a live API key:',
      stepsAr: [
        'الخطوة 1: الفحص الآلي يكتشف نمطاً يطابق مفاتيح AWS.',
        'الخطوة 2: "بوابة الأمان" توقف عملية البناء (Build) فوراً.',
        'الخطوة 3: يرفض النظام دمج الكود حتى يتم حذف السر وتدويره.',
      ],
      stepsEn: [
        'Step 1: Automated scan detects a pattern matching AWS keys.',
        'Step 2: "Security Gate" halts the build process immediately.',
        'Step 3: System rejects PR until the secret is removed and rotated.',
      ],
      takeawayAr: 'بوابات الأمان تمنع وصول الأخطاء القاتلة للإنتاج.',
      takeawayEn: 'Security gates prevent fatal errors from reaching production.',
    },
    independentChallengeDetail: {
      titleAr: 'تحدي خط الإنتاج: تجاوز البوابة الحمراء',
      titleEn: 'Pipeline Challenge: Clearing the Red Gate',
      scenarioAr: 'خط البناء متوقف بسبب ثغرة SAST. أصلح الكود لجعله يتحول للأخضر ويسمح بالنشر:',
      scenarioEn: 'The build is failing due to a SAST flaw. Refactor the code to turn the gate green and allow release:',
      targetOutcomeAr: 'إصلاح الكود المصدري ونجاح عملية النشر الآلي.',
      targetOutcomeEn: 'Source code remediation and successful automated deployment.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن الفحص اليدوي كافٍ لمئات التحديثات يومياً.',
      commonMisconceptionEn: 'Thinking that manual review is enough for hundreds of daily updates.',
      guidanceAr: 'البشر يسهون، لكن أدوات SAST و Secrets Scan لا تنام.',
      guidanceEn: 'Humans make mistakes; SAST and Secret Scanning tools are relentless.',
    },
    keyTakeaways: [
      { textAr: 'Shift Left: ابدأ الأمان من لوحة المفاتيح.', textEn: 'Shift Left: Security starts at the keyboard.' },
      { textAr: 'بوابات الأمان (Security Gates) هي صمام الأمان للنشر.', textEn: 'Security gates are the release safety valves.' },
    ],
    objectives: [
      { textAr: 'فهم مراحل خط أنابيب DevSecOps.', textEn: 'Understand DevSecOps pipeline stages.' },
      { textAr: 'التعرف على أدوات SAST و Secret Scanning.', textEn: 'Identify SAST and Secret Scanning tools.' },
    ],
    concept: {
      textAr: 'خطوط التطوير الآمنة تدمج أدوات فحص الكود والأسرار بشكل آلي داخل عملية بناء البرنامج.',
      textEn: 'Secure pipelines integrate code and secret scanning tools automatically within the build process.',
      analogyAr: 'مثل فحص جودة القطع في خط تجميع السيارات؛ أي قطعة معيبة توقف المصنع فوراً.',
      analogyEn: 'Like quality control on a car assembly line; a defective part halts production immediately.',
      keyTerms: [
        { termAr: 'بوابات الأمان', termEn: 'Security Gates', definitionAr: 'شروط برمجية تمنع النشر عند وجود ثغرات.', definitionEn: 'Automated thresholds blocking deployment on flaws.' },
      ],
    },
    demonstration: {
      titleAr: 'معاينة خط إنتاج CI/CD',
      titleEn: 'CI/CD Pipeline Preview',
       whatToLookForAr: 'شاهد مراحل: Build -> Test -> Security Scan -> Deploy.',
      whatToLookForEn: 'Observe stages: Build -> Test -> Security Scan -> Deploy.',
      initialStateAr: 'خط الإنتاج قيد التشغيل.',
      initialStateEn: 'Pipeline is active.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة إدارة بوابات الأمان',
      taskTitleEn: 'Security Gate Management Task',
      instructionsAr: ['شغل خط البناء.', 'حلل سبب فشل الفحص الأمني.', 'صحح الكود وأعد المحاولة.'],
      instructionsEn: ['Trigger build.', 'Analyze security scan failure.', 'Refactor and retry.'],
      whyWeDoThisAr: 'لتعلم كيفية التعامل مع أدوات الأتمتة الحديثة.',
      whyWeDoThisEn: 'To learn interaction with modern automation tools.',
      hintsAr: ['تحقق من سجلات فحص SAST لمعرفة رقم السطر المصاب.'],
      hintsEn: ['Check SAST scan logs for the specific line number.'],
      validationCriterionAr: 'نجاح عملية النشر بعد الإصلاح.',
      validationCriterionEn: 'Successful deployment verified post-fix.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم منع الكود الضعيف من الوصول للخادم السحابي.',
      whatHappenedEn: 'Vulnerable code was blocked from reaching the cloud server.',
      securitySignificanceAr: 'هذا يقلل من مخاطر الاختراقات الناجمة عن أخطاء برمجية.',
      securitySignificanceEn: 'This minimizes breach risks stemming from coding errors.',
    },
    knowledgeCheck: [
      {
        id: 'q8-2-1',
        questionAr: 'ماذا تفعل "بوابة الأمان" عند اكتشاف ثغرة حرجة؟',
        questionEn: 'What does a "Security Gate" do upon discovering a critical flaw?',
        options: [
          { id: 'e1', textAr: 'توقف عملية النشر فوراً', textEn: 'Halts deployment immediately', isCorrect: true, explanationAr: 'صحيح، لحماية البيئة.', explanationEn: 'Correct, to protect the environment.' },
          { id: 'e2', textAr: 'تتجاهل الخطأ وتنشر الكود', textEn: 'Ignores it and deploys', isCorrect: false, explanationAr: 'خطأ فادح!', explanationEn: 'Fatal error!' },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-08-03-supply-chain',
      takeawayAr: 'عمل رائع! الآن لنتحدث عن أمن سلاسل التوريد والتبعيات.',
      takeawayEn: 'Great work! Now let\'s talk about supply chain security and dependencies.',
    },
  },

  'lesson-08-03-supply-chain': {
    id: 'lesson-08-03-supply-chain',
    milestoneId: 8,
    order: 3,
    titleAr: 'الدرس 8.3: أمن سلاسل التوريد والتبعيات (SCA/SBOM)',
    titleEn: 'Lesson 8.3: Supply Chain Security & Dependencies (SCA/SBOM)',
    whyItMattersAr: 'أغلب الكود في تطبيقاتك كتبه أشخاص آخرون؛ هل تثق بهم؟',
    whyItMattersEn: 'Most of your application code was written by someone else; do you trust them?',
    estimatedMinutes: 15,
    simulationId: 'devsecops',
    challengeId: 'supply-chain-challenge',
    track: 'common',
    relatedSimulationIds: ['devsecops', 'sca', 'sbom'],
    prerequisites: [{ textAr: 'إكمال درس خطوط التطوير.', textEn: 'Completion of Secure Pipelines.' }],
    workedExample: {
      titleAr: 'مثال: اكتشاف مكتبة مصابة (Log4j)',
      titleEn: 'Example: Discovering a Vulnerable Library (Log4j)',
      scenarioAr: 'تطبيقك يستخدم مكتبة خارجية اكتُشف فيها ثغرة حرجة عالمياً:',
      scenarioEn: 'Your app uses a 3rd-party library with a global zero-day flaw:',
      stepsAr: [
        'الخطوة 1: فحص التبعيات (SCA) يطابق إصدار المكتبة مع قاعدة بيانات CVE.',
        'الخطوة 2: إنشاء قائمة مكونات البرمجيات (SBOM) لمعرفة مكان الاستخدام.',
        'الخطوة 3: تحديث المكتبة للإصدار المرقع ونشر التطبيق.',
      ],
      stepsEn: [
        'Step 1: SCA scan matches library version against CVE databases.',
        'Step 2: Generate SBOM to identify usage locations.',
        'Step 3: Upgrade to patched version and redeploy.',
      ],
      takeawayAr: 'أنت مسؤول عن أمان كل سطر كود تستخدمه، حتى لو لم تكتبه.',
      takeawayEn: 'You are responsible for the security of every line you use, even if you didn\'t write it.',
    },
    independentChallengeDetail: {
      titleAr: 'تحدي SBOM: جرد المكونات الخطرة',
      titleEn: 'SBOM Challenge: Inventorying Dangerous Components',
      scenarioAr: 'قم بتوليد تقرير SBOM وتحديد جميع المكتبات التي تحمل تصنيف خطر عالي (High CVSS):',
      scenarioEn: 'Generate an SBOM report and identify all libraries with a High CVSS rating:',
      targetOutcomeAr: 'تحديد كافة التبعيات المصابة واقتراح خطة تحديث.',
      targetOutcomeEn: 'Identification of all vulnerable dependencies and update plan.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن المكتبات مفتوحة المصدر آمنة دائماً لأن الجميع يراها.',
      commonMisconceptionEn: 'Thinking open-source libraries are always safe because everyone can see them.',
      guidanceAr: 'وجود الكود متاحاً لا يعني أن أحداً قد فحصه أمنياً؛ استخدم أدوات SCA دائماً.',
      guidanceEn: 'Visibility does not equal audit; always use SCA tools to verify security status.',
    },
    keyTakeaways: [
      { textAr: 'SBOM هو "قائمة المكونات" لتطبيقك.', textEn: 'SBOM is the "ingredients list" of your application.' },
      { textAr: 'SCA يحميك من ثغرات الطرف الثالث.', textEn: 'SCA protects you from 3rd-party vulnerabilities.' },
    ],
    objectives: [
      { textAr: 'فهم مخاطر سلاسل التوريد البرمجية.', textEn: 'Understand software supply chain risks.' },
      { textAr: 'تعلم استخدام أدوات SCA و SBOM.', textEn: 'Learn to use SCA and SBOM tools.' },
    ],
    concept: {
      textAr: 'أمن سلاسل التوريد يضمن أن المكونات البرمجية التي تستوردها آمنة وموثقة ولم يتم التلاعب بها.',
      textEn: 'Supply chain security ensures that imported software components are safe, documented, and untampered.',
      analogyAr: 'مثل مطعم يتأكد من جودة الخضروات واللحوم التي يشتريها من الموردين قبل طبخها للزبائن.',
      analogyEn: 'Like a restaurant verifying the quality of ingredients from suppliers before serving customers.',
      keyTerms: [
        { termAr: 'SCA', termEn: 'Software Composition Analysis', definitionAr: 'تحليل مكونات البرمجيات.', definitionEn: 'Analyzing software components.' },
      ],
    },
    demonstration: {
      titleAr: 'معاينة تقرير SBOM',
      titleEn: 'SBOM Report Preview',
      whatToLookForAr: 'شاهد قائمة المكتبات وإصداراتها وتراخيصها.',
      whatToLookForEn: 'Observe the list of libraries, versions, and licenses.',
      initialStateAr: 'التقرير متاح بصيغة JSON/CyclonDX.',
      initialStateEn: 'Report available in JSON/CyclonDX format.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة فحص التبعيات',
      taskTitleEn: 'Dependency Scanning Task',
      instructionsAr: ['افتح فاحص SCA.', 'حدد المكتبات المصابة.', 'حدث المكتبة للإصدار الآمن.'],
      instructionsEn: ['Open SCA scanner.', 'Identify vulnerable libs.', 'Upgrade to secure versions.'],
      whyWeDoThisAr: 'لمنع اختراقات سلاسل التوريد (مثل هجوم SolarWinds).',
      whyWeDoThisEn: 'To prevent supply chain breaches (e.g. SolarWinds).',
      hintsAr: ['ركز على المكتبات التي تملك CVSS أعلى من 7.0.'],
      hintsEn: ['Prioritize libraries with CVSS scores above 7.0.'],
      validationCriterionAr: 'تطهير التطبيق من المكتبات المصابة.',
      validationCriterionEn: 'Application cleared of vulnerable libraries.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم تأمين سلاسل التوريد الخاصة بتطبيقك.',
      whatHappenedEn: 'Your application supply chain is now secured.',
      securitySignificanceAr: 'هذا يمنع المهاجم من استغلال نقاط الضعف في الكود الخارجي.',
      securitySignificanceEn: 'This prevents attackers from exploiting 3rd-party code flaws.',
    },
    knowledgeCheck: [
      {
        id: 'q8-3-1',
        questionAr: 'ماذا يمثل مصطلح SBOM؟',
        questionEn: 'What does SBOM stand for?',
        options: [
          { id: 'f1', textAr: 'Software Bill of Materials', textEn: 'Software Bill of Materials', isCorrect: true, explanationAr: 'صحيح، وهي قائمة مكونات البرنامج.', explanationEn: 'Correct, it\'s the ingredients list.' },
          { id: 'f2', textAr: 'Secret Backup of Memory', textEn: 'Secret Backup of Memory', isCorrect: false, explanationAr: 'غير صحيح.', explanationEn: 'Incorrect.' },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-09-01-cloud-identity',
      takeawayAr: 'ممتاز! انتهيت من مسار أمن التطبيقات. الآن لنتوسع إلى السحابة.',
      takeawayEn: 'Excellent! You finished the AppSec track. Now let\'s scale to the cloud.',
    },
  },

  'lesson-09-01-cloud-identity': {
    id: 'lesson-09-01-cloud-identity',
    milestoneId: 9,
    order: 1,
    titleAr: 'الدرس 9.1: الهوية السحابية وإدارة الوصول (IAM)',
    titleEn: 'Lesson 9.1: Cloud Identity & Access Management (IAM)',
    whyItMattersAr: 'في السحابة، الهوية هي جدار الحماية الجديد؛ فمن يملك المفتاح يملك السحابة.',
    whyItMattersEn: 'In the cloud, identity is the new perimeter; whoever holds the key, holds the cloud.',
    estimatedMinutes: 25,
    simulationId: 'threat_hunting',
    challengeId: 'iam-hardening-challenge',
    track: 'common',
    relatedSimulationIds: ['threat_hunting', 'cloud_iam', 'zero_trust'],
    prerequisites: [{ textAr: 'إكمال المستوى 8: أمن التطبيقات.', textEn: 'Completion of Level 8: AppSec.' }],
    workedExample: {
      titleAr: 'مثال: تطبيق الامتياز الأدنى (Least Privilege)',
      titleEn: 'Example: Applying Least Privilege',
      scenarioAr: 'خادم يحتاج فقط للقراءة من مخزن ملفات (S3 Bucket). لا تعطه صلاحية مدير:',
      scenarioEn: 'A server only needs read access to an S3 bucket. Don\'t grant admin rights:',
      stepsAr: [
        'الخطوة 1: إنشاء دور (Role) جديد محدود الصلاحيات.',
        'الخطوة 2: إضافة سياسة تسمح بـ (s3:Get*) فقط.',
        'الخطوة 3: ربط الدور بالمحرك السحابي (EC2) بدلاً من استخدام مفاتيح ثابتة.',
      ],
      stepsEn: [
        'Step 1: Create a scoped-down Role.',
        'Step 2: Add policy permitting only (s3:Get*).',
        'Step 3: Attach role to compute resource instead of using static keys.',
      ],
      takeawayAr: 'الصلاحيات المفرطة هي أكبر خطر سحابي.',
      takeawayEn: 'Over-privileged identities are the top cloud risk.',
    },
    independentChallengeDetail: {
      titleAr: 'تحدي IAM: تدقيق الصلاحيات السائبة',
      titleEn: 'IAM Challenge: Auditing Loose Permissions',
      scenarioAr: 'قم بمراجعة حسابات الخدمة السحابية وحدد الحسابات التي تملك صلاحيات "AdministratorAccess" غير ضرورية:',
      scenarioEn: 'Review cloud service accounts and identify those with unnecessary "AdministratorAccess":',
      targetOutcomeAr: 'تقليص الصلاحيات وتحقيق نموذج انعدام الثقة (Zero Trust).',
      targetOutcomeEn: 'Privilege reduction and Zero Trust model alignment.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن استخدام مفاتيح الوصول الثابتة (Access Keys) داخل التطبيق آمن.',
      commonMisconceptionEn: 'Thinking that using static Access Keys inside applications is safe.',
      guidanceAr: 'استخدم دائماً الأدوار المؤقتة (Temporary Roles) وتجنب الأسرار الثابتة.',
      guidanceEn: 'Always use temporary roles and avoid long-lived static secrets.',
    },
    keyTakeaways: [
      { textAr: 'الهوية (Identity) هي الركيزة الأولى لأمن السحابة.', textEn: 'Identity is the first pillar of cloud security.' },
      { textAr: 'الامتياز الأدنى (Least Privilege) ليس خياراً، بل ضرورة.', textEn: 'Least Privilege is a necessity, not an option.' },
    ],
    objectives: [
      { textAr: 'فهم معمارية IAM السحابية.', textEn: 'Understand cloud IAM architecture.' },
      { textAr: 'تعلم كيفية كتابة سياسات الوصول (Policies).', textEn: 'Learn to write access policies.' },
    ],
    concept: {
      textAr: 'إدارة الهوية والوصول (IAM) تتيح لك تحديد "من" يمكنه القيام بـ "ماذا" على "أي" مورد سحابي.',
      textEn: 'Identity and Access Management (IAM) lets you define "who" can do "what" on "which" cloud resource.',
      analogyAr: 'مثل مفتاح الفندق الذي يفتح باب غرفتك والمصعد فقط، ولا يفتح غرف الضيوف الآخرين أو مكتب المدير.',
      analogyEn: 'Like a hotel keycard that only opens your room and the elevator, not other guest rooms or the manager\'s office.',
      keyTerms: [
        { termAr: 'IAM Policy', termEn: 'IAM Policy', definitionAr: 'وثيقة JSON تحدد الصلاحيات.', definitionEn: 'JSON document defining permissions.' },
      ],
    },
    demonstration: {
      titleAr: 'معاينة لوحة تحكم IAM',
      titleEn: 'IAM Console Preview',
      whatToLookForAr: 'شاهد الفرق بين الحسابات البشرية وحسابات الخدمة (Service Accounts).',
      whatToLookForEn: 'Observe difference between human users and service accounts.',
      initialStateAr: 'قائمة المستخدمين جاهزة للمراجعة.',
      initialStateEn: 'User list ready for audit.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة تقليص الصلاحيات',
      taskTitleEn: 'Privilege Reduction Task',
      instructionsAr: ['حلل سياسة الوصول الحالية.', 'احذف صلاحيات الإدارة الزائدة.', 'تأكد من بقاء الخدمة تعمل.'],
      instructionsEn: ['Analyze current policy.', 'Remove excess admin rights.', 'Verify service functionality.'],
      whyWeDoThisAr: 'لتقليل أثر الاختراق في حال تسرب المفاتيح.',
      whyWeDoThisEn: 'To minimize blast radius if keys leak.',
      hintsAr: ['ابحث عن الإجراءات النجمية (*) التي تعني "الكل".'],
      hintsEn: ['Look for wildcard (*) actions meaning "all".'],
      validationCriterionAr: 'تطبيق سياسة الامتياز الأدنى بنجاح.',
      validationCriterionEn: 'Least privilege policy applied successfully.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم تأمين الهوية السحابية بنجاح.',
      whatHappenedEn: 'Cloud identity successfully secured.',
      securitySignificanceAr: 'هذا يمنع المهاجم من السيطرة الكاملة على السحابة عند اختراق حساب واحد.',
      securitySignificanceEn: 'This prevents total cloud takeover upon single account breach.',
    },
    knowledgeCheck: [
      {
        id: 'q9-1-1',
        questionAr: 'ماذا يفضل استخدامه بدلاً من مفاتيح الوصول الثابتة؟',
        questionEn: 'What is preferred over static Access Keys?',
        options: [
          { id: 'g1', textAr: 'الأدوار المؤقتة (Roles)', textEn: 'Temporary Roles', isCorrect: true, explanationAr: 'صحيح، لأنها تنتهي صلاحيتها آلياً.', explanationEn: 'Correct, they expire automatically.' },
          { id: 'g2', textAr: 'كتابة المفتاح على ورقة', textEn: 'Writing key on paper', isCorrect: false, explanationAr: 'خطر جداً.', explanationEn: 'Highly dangerous.' },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-09-02-containers',
      takeawayAr: 'رائع! الآن لنتعلم كيف نحمي الحاويات ومجموعات كوبرنيتيس.',
      takeawayEn: 'Great! Now let\'s learn to protect containers and K8s clusters.',
    },
  },

  'lesson-09-02-containers': {
    id: 'lesson-09-02-containers',
    milestoneId: 9,
    order: 2,
    titleAr: 'الدرس 9.2: دفاع الحاويات وأمن كوبرنيتيس (K8s)',
    titleEn: 'Lesson 9.2: Container Defense & Kubernetes Security',
    whyItMattersAr: 'الحاويات سريعة الزوال، لكن التهديدات بداخلها حقيقية ومستمرة.',
    whyItMattersEn: 'Containers are ephemeral, but threats within them are real and persistent.',
    estimatedMinutes: 20,
    simulationId: 'threat_hunting',
    challengeId: 'k8s-hardening-challenge',
    track: 'common',
    relatedSimulationIds: ['threat_hunting', 'kubernetes', 'containers'],
    prerequisites: [{ textAr: 'إكمال درس الهوية السحابية.', textEn: 'Completion of Cloud Identity.' }],
    workedExample: {
      titleAr: 'مثال: تطبيق سياسة الشبكة (NetworkPolicy)',
      titleEn: 'Example: Deploying NetworkPolicy',
      scenarioAr: 'عزل كبسولة (Pod) قاعدة البيانات بحيث لا تستقبل اتصالاً إلا من كبسولة التطبيق:',
      scenarioEn: 'Isolating a DB pod so it only accepts connections from the App pod:',
      stepsAr: [
        'الخطوة 1: تعريف NetworkPolicy لنطاق قاعدة البيانات.',
        'الخطوة 2: السماح بالدخول (Ingress) فقط من محدد التسمية app=frontend.',
        'الخطوة 3: منع أي اتصال آخر من داخل المجموعة (Default Deny).',
      ],
      stepsEn: [
        'Step 1: Define NetworkPolicy for database namespace.',
        'Step 2: Allow Ingress only from pod label app=frontend.',
        'Step 3: Block all other intra-cluster traffic (Default Deny).',
      ],
      takeawayAr: 'الشبكات الافتراضية داخل K8s تحتاج لضبط دقيق كما في الشبكات الفيزيائية.',
      takeawayEn: 'Virtual networking in K8s needs precise tuning like physical networks.',
    },
    independentChallengeDetail: {
      titleAr: 'تحدي الحاويات: كشف الهروب (Container Escape)',
      titleEn: 'Container Challenge: Detecting Breakouts',
      scenarioAr: 'حاوية تعمل بامتيازات عالية (Privileged). اكتشف محاولة المهاجم للوصول لنظام المضيف وأوقفها:',
      scenarioEn: 'A privileged container is active. Detect attacker attempts to access host system and block:',
      targetOutcomeAr: 'عزل الحاوية ومنع الهروب لنظام التشغيل المضيف.',
      targetOutcomeEn: 'Isolate container and prevent breakout to host OS.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن الحاويات معزولة أمنياً بطبيعتها مثل الأنظمة الوهمية (VMs).',
      commonMisconceptionEn: 'Thinking containers are inherently secure and isolated like VMs.',
      guidanceAr: 'الحاويات تتشارك النواة مع المضيف؛ استخدم سياسات الأمان (PSP/Admission Controllers) لتقييدها.',
      guidanceEn: 'Containers share the host kernel; use security policies to restrict them.',
    },
    keyTakeaways: [
      { textAr: 'الحد من الصلاحيات (Capabilities) يمنع الهروب.', textEn: 'Dropping capabilities prevents breakout.' },
      { textAr: 'سياسات الشبكة هي خط الدفاع الأول داخل المجموعة.', textEn: 'NetworkPolicies are the first line of defense in-cluster.' },
    ],
    objectives: [
      { textAr: 'فهم معمارية كوبرنيتيس الأمنية.', textEn: 'Understand Kubernetes security architecture.' },
      { textAr: 'تطبيق سياسات العزل بين الحاويات.', textEn: 'Apply container isolation policies.' },
    ],
    concept: {
      textAr: 'أمن الحاويات يتضمن تأمين صورة الحاوية، والتحكم في وقت التشغيل، وعزل الشبكات داخل مجموعات كوبرنيتيس.',
      textEn: 'Container security involves securing images, runtime control, and network isolation within K8s clusters.',
      analogyAr: 'مثل الشحن بالحاويات في السفن؛ إذا تسربت مادة كيميائية في حاوية واحدة، يجب ألا تلوث بقية الحاويات أو السفينة.',
      analogyEn: 'Like shipping containers on a vessel; if a leak occurs in one, it must not contaminate others or the ship.',
      keyTerms: [
        { termAr: 'Pod', termEn: 'Pod', definitionAr: 'أصغر وحدة تشغيل في كوبرنيتيس.', definitionEn: 'Smallest deployable unit in K8s.' },
      ],
    },
    demonstration: {
      titleAr: 'معاينة أوامر Kubectl',
      titleEn: 'Kubectl Command Preview',
      whatToLookForAr: 'شاهد فحص حالة الكبسولات والسياسات المطبقة.',
      whatToLookForEn: 'Observe pod status and active policies.',
      initialStateAr: 'مجموعة K8s نشطة.',
      initialStateEn: 'K8s cluster is live.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة عزل الشبكة',
      taskTitleEn: 'Network Isolation Task',
      instructionsAr: ['أنشئ NetworkPolicy.', 'طبقها على قاعدة البيانات.', 'اختبر الاتصال من كبسولة غير مصرحة.'],
      instructionsEn: ['Create NetworkPolicy.', 'Apply to DB.', 'Test connectivity from unauth pod.'],
      whyWeDoThisAr: 'لمنع الحركة الجانبية (Lateral Movement) للمهاجم.',
      whyWeDoThisEn: 'To prevent attacker lateral movement.',
      hintsAr: ['استخدم labels لتعريف المجموعات المسموحة.'],
      hintsEn: ['Use labels to define permitted groups.'],
      validationCriterionAr: 'فشل الاتصال غير المصرح بنجاح.',
      validationCriterionEn: 'Unauthorized connectivity failure verified.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'تم عزل قاعدة البيانات وتأمين المجموعة.',
      whatHappenedEn: 'Database isolated and cluster secured.',
      securitySignificanceAr: 'هذا يقلل من مساحة الهجوم الداخلية.',
      securitySignificanceEn: 'This reduces internal attack surface.',
    },
    knowledgeCheck: [
      {
        id: 'q9-2-1',
        questionAr: 'ما هي الطريقة الأفضل لعزل حركة المرور في كوبرنيتيس؟',
        questionEn: 'What is the best way to isolate traffic in Kubernetes?',
        options: [
          { id: 'h1', textAr: 'Network Policies', textEn: 'Network Policies', isCorrect: true, explanationAr: 'صحيح، للتحكم في ingress و egress.', explanationEn: 'Correct for ingress/egress control.' },
          { id: 'h2', textAr: 'فصل كابل الكهرباء', textEn: 'Unplugging power', isCorrect: false, explanationAr: 'غير منطقي للسحابة.', explanationEn: 'Nonsensical for cloud.' },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-09-03-threat-hunting',
      takeawayAr: 'رائع! الآن أنت جاهز لأكثر المهام إثارة: اصطياد التهديدات.',
      takeawayEn: 'Great! Now you are ready for the most exciting task: Threat Hunting.',
    },
  },

  'lesson-09-03-threat-hunting': {
    id: 'lesson-09-03-threat-hunting',
    milestoneId: 9,
    order: 3,
    titleAr: 'الدرس 9.3: اصطياد التهديدات ومنهجية الفرضيات',
    titleEn: 'Lesson 9.3: Threat Hunting & Hypothesis Methodology',
    whyItMattersAr: 'الدفاع السلبي (الانتظار) لم يعد يكفي ضد المهاجمين المتقدمين؛ يجب أن تذهب إليهم.',
    whyItMattersEn: 'Passive defense is no longer enough against advanced adversaries; you must go to them.',
    estimatedMinutes: 25,
    simulationId: 'threat_hunting',
    challengeId: 'threat-hunting-hypothesis-challenge',
    track: 'common',
    relatedSimulationIds: ['threat_hunting', 'mitre_attack', 'cloud_trail'],
    prerequisites: [{ textAr: 'إكمال دروس السحابة والحاويات.', textEn: 'Completion of Cloud/Container lessons.' }],
    workedExample: {
      titleAr: 'مثال: صياغة فرضية هجوم',
      titleEn: 'Example: Formulating an Attack Hypothesis',
      scenarioAr: 'فرضية: مهاجم يستخدم حساباً مسرباً للبحث عن ملفات حساسة (S3 Enumeration):',
      scenarioEn: 'Hypothesis: Attacker uses leaked account for S3 enumeration:',
      stepsAr: [
        'الخطوة 1: صياغة الفرضية بناءً على تقنية T1530 من MITRE.',
        'الخطوة 2: البحث في سجلات CloudTrail عن أخطاء 403 (Access Denied) متكررة.',
        'الخطوة 3: تحديد عنوان IP المصدر وعزل المفتاح المسرب.',
      ],
      stepsEn: [
        'Step 1: Formulate hypothesis based on MITRE T1530.',
        'Step 2: Query CloudTrail for recurring 403 (Access Denied) errors.',
        'Step 3: Identify source IP and revoke leaked keys.',
      ],
      takeawayAr: 'الصيد الاستباقي يقلل زمن بقاء المهاجم (Dwell Time).',
      takeawayEn: 'Proactive hunting reduces adversary dwell time.',
    },
    independentChallengeDetail: {
      titleAr: 'تحدي الصيد: كشف التسلل الصامت',
      titleEn: 'Hunting Challenge: Detecting Silent Infiltration',
      scenarioAr: 'يوجد مهاجم "نائم" داخل السحابة. استخدم سجلات API لكشف نشاطه قبل أن يبدأ في سحب البيانات:',
      scenarioEn: 'A sleeper agent is in the cloud. Use API logs to reveal their activity before exfiltration starts:',
      targetOutcomeAr: 'إثبات الفرضية، كشف المهاجم، وإصدار تقرير التطهير.',
      targetOutcomeEn: 'Verify hypothesis, expose attacker, and issue purge report.',
    },
    remediationGuidance: {
      commonMisconceptionAr: 'الاعتقاد بأن اصطياد التهديدات يتطلب أدوات غالية الثمن فقط.',
      commonMisconceptionEn: 'Thinking threat hunting only requires expensive tools.',
      guidanceAr: 'العنصر الأهم هو "عقلية المحلل" والقدرة على صياغة أسئلة ذكية للسجلات.',
      guidanceEn: 'The most critical element is the "Analyst Mindset" and asking smart questions of logs.',
    },
    keyTakeaways: [
      { textAr: 'مصفوفة MITRE ATT&CK هي خارطة طريق الصيد.', textEn: 'MITRE ATT&CK is the hunting roadmap.' },
      { textAr: 'ابدأ بفرضية، لا تبحث عشوائياً.', textEn: 'Start with a hypothesis, don\'t hunt randomly.' },
    ],
    objectives: [
      { textAr: 'تعلم منهجية اصطياد التهديدات.', textEn: 'Learn threat hunting methodology.' },
      { textAr: 'استخدام سجلات السحابة لكشف الأنماط الشاذة.', textEn: 'Use cloud logs to detect anomalies.' },
    ],
    concept: {
      textAr: 'اصطياد التهديدات هو عملية استباقية للبحث في الشبكات والأنظمة عن المهاجمين الذين تجاوزوا الدفاعات التلقائية.',
      textEn: 'Threat hunting is the proactive process of searching networks and systems for adversaries who bypassed automated defenses.',
      analogyAr: 'مثل محقق جنائي خبير يبحث عن خيوط خفية في مسرح جريمة قديمة لم تكتشفها الشرطة العادية.',
      analogyEn: 'Like an expert detective searching for subtle clues in an old crime scene that regular police missed.',
      keyTerms: [
        { termAr: 'Dwell Time', termEn: 'Dwell Time', definitionAr: 'الوقت الذي يقضيه المهاجم داخل النظام قبل اكتشافه.', definitionEn: 'Time spent by attacker in system before detection.' },
      ],
    },
    demonstration: {
      titleAr: 'معاينة سجلات CloudTrail',
      titleEn: 'CloudTrail Log Preview',
      whatToLookForAr: 'شاهد تفاصيل كل طلب API: من؟ متى؟ وأين؟',
      whatToLookForEn: 'Observe API request details: Who? When? Where?',
      initialStateAr: 'السجلات تتدفق لحظياً.',
      initialStateEn: 'Logs streaming in real-time.',
    },
    guidedTask: {
      taskTitleAr: 'مهمة الصيد المنهجي',
      taskTitleEn: 'Systematic Hunting Task',
      instructionsAr: ['اختر فرضية من المصفوفة.', 'ابحث عن القرائن في السجلات.', 'أكد وجود الاختراق.'],
      instructionsEn: ['Select hypothesis from matrix.', 'Search for clues in logs.', 'Confirm compromise.'],
      whyWeDoThisAr: 'لتطوير مهارات التحليل المتقدمة.',
      whyWeDoThisEn: 'To build advanced analytical skills.',
      hintsAr: ['الارتفاع المفاجئ في طلبات ReadLevel قد يشير لاستطلاع.'],
      hintsEn: ['Spikes in ReadLevel requests may indicate reconnaissance.'],
      validationCriterionAr: 'إثبات أو نفي الفرضية بقرائن صلبة.',
      validationCriterionEn: 'Hypothesis verified or refuted with hard evidence.',
      checkType: 'interactive_simulation',
    },
    resultExplanation: {
      whatHappenedAr: 'نجح الصيد وتم طرد المتسلل.',
      whatHappenedEn: 'Hunting successful; intruder expelled.',
      securitySignificanceAr: 'هذا يمنع وقوع الكوارث الكبرى قبل حدوثها.',
      securitySignificanceEn: 'This prevents major disasters before they strike.',
    },
    knowledgeCheck: [
      {
        id: 'q9-3-1',
        questionAr: 'ما هو الهدف من استخدام إطار MITRE ATT&CK في الصيد؟',
        questionEn: 'What is the goal of using MITRE ATT&CK in hunting?',
        options: [
          { id: 'i1', textAr: 'تصنيف وفهم تكتيكات وتقنيات المهاجمين', textEn: 'Categorizing and understanding attacker TTPs', isCorrect: true, explanationAr: 'صحيح، لضمان تغطية شاملة.', explanationEn: 'Correct for comprehensive coverage.' },
          { id: 'i2', textAr: 'تغيير خلفية الشاشة', textEn: 'Changing desktop wallpaper', isCorrect: false, explanationAr: 'غير صحيح.', explanationEn: 'Incorrect.' },
        ],
      },
    ],
    nextStep: {
      nextLessonId: 'lesson-10-cyber-range',
      takeawayAr: 'رائع لأبعد حد! لقد أتممت كافة المستويات التعليمية. الآن إلى التحدي الأكبر: الميدان السيبراني الشامل.',
      takeawayEn: 'Phenomenal! You completed all learning levels. Now to the ultimate challenge: The Unified Cyber Range.',
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
    challengeId: 'nexora_master',
    track: 'common',
    relatedSimulationIds: ['range', 'nexora_master', 'soc', 'active_directory', 'firewall'],
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
