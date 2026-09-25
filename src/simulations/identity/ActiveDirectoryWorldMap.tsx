import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  FolderGit2,
  Users,
  Key,
  FolderTree,
  ShieldCheck,
  Search,
  FileCode,
  Network,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Server,
  Layers,
  Sparkles,
  Lock,
  Workflow,
  CheckCircle2,
} from 'lucide-react';

interface ActiveDirectoryWorldMapProps {
  onSelectLab: (labId: string) => void;
}

export const ActiveDirectoryWorldMap: React.FC<ActiveDirectoryWorldMapProps> = ({ onSelectLab }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const clusters = [
    {
      id: 'directory',
      titleEn: 'Directory Explorer',
      titleAr: 'مستكشف الدليل والشجرة',
      categoryEn: 'Directory Hierarchy',
      categoryAr: 'هيكلية الدليل',
      icon: FolderTree,
      color: 'from-blue-600 to-cyan-700',
      border: 'border-blue-500/40',
      badge: 'Forest / Domain / OU',
      descEn: 'Hierarchical tree of Forest, Domain (corp.nexora.local), Organizational Units, Users, and Computer objects.',
      descAr: 'الشجرة الهرمية للغابة والمجال والوحدات التنظيمية والحسابات وأجهزة الحاسوب.',
      connectionsEn: ['Inherits GPO Policies', 'Grouped into Security Roles'],
      connectionsAr: ['تورث سياسات GPO', 'تجمع في أدوار أمنية'],
    },
    {
      id: 'users',
      titleEn: 'Users & Computers',
      titleAr: 'المستخدمون ومحطات العمل',
      categoryEn: 'Identity Objects',
      categoryAr: 'كائنات الهوية',
      icon: Users,
      color: 'from-emerald-600 to-teal-700',
      border: 'border-emerald-500/40',
      badge: 'SAM / UPN / SIDs',
      descEn: 'Security Principals with unique SIDs, department assignments, service account properties, and interactive logon flags.',
      descAr: 'الأطراف الأمنية ذات المعرفات الفريدة SIDs، التعيينات الإدارية، وخصائص حسابات الخدمات.',
      connectionsEn: ['Requests Kerberos TGT', 'Assigned to Groups'],
      connectionsAr: ['تطلب تذاكر Kerberos TGT', 'تُسند إلى المجموعات'],
    },
    {
      id: 'groups',
      titleEn: 'Group Membership Graph',
      titleAr: 'مخطط المجموعات والتداخل',
      categoryEn: 'Role Modeling',
      categoryAr: 'نمذجة الأدوار',
      icon: Workflow,
      color: 'from-purple-600 to-indigo-700',
      border: 'border-purple-500/40',
      badge: 'Nested Groups / Scopes',
      descEn: 'Nested security group chains (Global -> Domain Local), cycle prevention, and effective privilege calculation.',
      descAr: 'سلاسل تداخل المجموعات، الحماية من الحلقات التكرارية، وحساب الصلاحيات الفعالة.',
      connectionsEn: ['Embedded in Kerberos PAC', 'Evaluated in Resource ACL'],
      connectionsAr: ['تُضمن في حزمة Kerberos PAC', 'تُقيم في قوائم الموارد'],
    },
    {
      id: 'auth',
      titleEn: 'Auth vs Authorization',
      titleAr: 'المصادقة مقابل التفويض',
      categoryEn: 'Security Boundary',
      categoryAr: 'الحدود الأمنية',
      icon: Lock,
      color: 'from-amber-600 to-orange-700',
      border: 'border-amber-500/40',
      badge: 'Identity ≠ Access',
      descEn: 'Demonstrates why Authentication Success (valid password/ticket) does not guarantee Authorization (Resource DACL evaluation).',
      descAr: 'يوضح الفارق الجوهري: نجاح المصادقة وتأكيد الهوية لا يعني بالضرورة امتلاك إذن الوصول للمورد.',
      connectionsEn: ['Validates User Credentials', 'Checks Resource DACL'],
      connectionsAr: ['التحقق من بيانات الدخول', 'فحص أذونات المجلدات DACL'],
    },
    {
      id: 'kerberos',
      titleEn: 'Kerberos 3-Tier Exchange',
      titleAr: 'محاكي بروتوكول Kerberos',
      categoryEn: 'Flagship Authentication',
      categoryAr: 'المصادقة الرئيسية',
      icon: Key,
      color: 'from-cyan-600 to-blue-700',
      border: 'border-cyan-500/40',
      badge: 'AS-REQ / TGT / TGS-REQ',
      descEn: 'Full 3-tier Kerberos flow: AS exchange (TGT), TGS exchange (Service Ticket), and AP-REQ with PAC validation & clock skew defenses.',
      descAr: 'دورة تبادل تذاكر Kerberos الثلاثية: طلب TGT، طلب تذكرة الخدمة TGS، والاتصال النهائي مع حماية انحراف الساعة.',
      connectionsEn: ['Communicates with KDC', 'Unlocks Application Services'],
      connectionsAr: ['التواصل مع خادم KDC', 'فتح جلسات الخدمات المشفرة'],
    },
    {
      id: 'ldap',
      titleEn: 'LDAP Query Visualizer',
      titleAr: 'مستكشف استعلامات LDAP',
      categoryEn: 'Directory Protocol',
      categoryAr: 'بروتوكول الدليل',
      icon: Search,
      color: 'from-teal-600 to-emerald-700',
      border: 'border-teal-500/40',
      badge: 'RFC 4515 Filters',
      descEn: 'Interactive synthetic LDAP directory search engine supporting complex filters (&, |, !), wildcards, and search scopes.',
      descAr: 'محرك استعلامات LDAP التفاعلي مع دعم الفلاتر المعقدة ونطاقات البحث (Base, OneLevel, Subtree).',
      connectionsEn: ['Queries Directory Schema', 'Discovers SPNs & Accounts'],
      connectionsAr: ['استعلام مخطط الدليل', 'اكتشاف أسماء الخدمات والحسابات'],
    },
    {
      id: 'gpo',
      titleEn: 'Group Policy (GPO) Lab',
      titleAr: 'مختبر سياسات المجموعة GPO',
      categoryEn: 'Configuration Management',
      categoryAr: 'إدارة التهيئة المركزية',
      icon: FileCode,
      color: 'from-indigo-600 to-purple-700',
      border: 'border-indigo-500/40',
      badge: 'LSDOU / Enforced / Block',
      descEn: 'Hierarchical GPO precedence engine: Domain -> OU -> Child OU, link ordering, block inheritance, and enforced overrides.',
      descAr: 'محرك أسبقية سياسات GPO: ترتيب التطبيق، حظر التوريث، وفرض السياسات الإجبارية Enforced.',
      connectionsEn: ['Propagates to Workstations', 'Hardens Endpoints'],
      connectionsAr: ['ينتشر لمحطات العمل', 'يحصن الأجهزة الطرفية'],
    },
    {
      id: 'trusts',
      titleEn: 'Domain Trusts Visualizer',
      titleAr: 'علاقات ثقة النطاقات',
      categoryEn: 'Multi-Forest Architecture',
      categoryAr: 'معمارية الغابات المتعددة',
      icon: Network,
      color: 'from-rose-600 to-red-700',
      border: 'border-rose-500/40',
      badge: 'Forest / External / Transitive',
      descEn: 'Visualizes trust directions (One-Way / Two-Way) and explains cross-domain Kerberos referral ticket authentication.',
      descAr: 'تمثيل اتجاهات الثقة (أحادية / ثنائية) وشرح مصادقة تذاكر الإحالة عبر النطاقات.',
      connectionsEn: ['Enables Cross-Forest Auth', 'Enforces SID Filtering'],
      connectionsAr: ['يتيح المصادقة المشتركة', 'يفرض تصفية معرفات SIDs'],
    },
    {
      id: 'risks',
      titleEn: 'Identity Risk Analyzer',
      titleAr: 'محلل مخاطر الهوية والصلاحيات',
      categoryEn: 'Enterprise Posture',
      categoryAr: 'الوضع الأمني للمؤسسة',
      icon: ShieldCheck,
      color: 'from-amber-600 to-red-700',
      border: 'border-amber-500/40',
      badge: 'Defensive Telemetry',
      descEn: 'Deterministic risk detection: stale contractor accounts, service account interactive logon, and excessive privilege accumulation.',
      descAr: 'كشف المخاطر الحتمي: الحسابات المهجورة، تسجيل دخول حسابات الخدمات التفاعلي، وتراكم الصلاحيات.',
      connectionsEn: ['Audits Directory Health', 'Feeds Security Operations'],
      connectionsAr: ['يدقق صحة الدليل', 'يغذي عمليات المراقبة الأمنية'],
    },
    {
      id: 'eventlog',
      titleEn: 'Directory Event Logs',
      titleAr: 'سجل أحداث الدليل والمجال',
      categoryEn: 'Detection & Forensics',
      categoryAr: 'الرصد والتحقيق الجنائي',
      icon: Server,
      color: 'from-blue-600 to-slate-800',
      border: 'border-blue-500/40',
      badge: 'Event 4720 / 4768 / 4771',
      descEn: 'Real Windows Security & Directory Service audit events triggered by user actions: TGT requests, group modifications, and logon telemetry.',
      descAr: 'سجلات أحداث الأمان الحقيقية الناتجة عن أنشطة الدليل: طلبات تذاكر Kerberos وتعديلات المجموعات.',
      connectionsEn: ['Captures Identity Changes', 'Ingested by SIEM / SOC'],
      connectionsAr: ['يرصد تغيرات الهوية', 'يغذي أنظمة التحليل SIEM'],
    },
    {
      id: 'challenge',
      titleEn: 'Master Challenge: Nexora Migration',
      titleAr: 'التحدي الشامل: هجرة صلاحيات سارة',
      categoryEn: 'Hands-on Hardening',
      categoryAr: 'التحدي العملي الأكبر',
      icon: ShieldAlert,
      color: 'from-red-600 to-rose-700',
      border: 'border-red-500/40',
      badge: 'Interactive Scenario',
      descEn: 'Role migration from HR to Finance: prune historical privileges, fix workstation GPOs, revoke contractor access, and enforce least privilege.',
      descAr: 'إدارة انتقال الموظفة سارة من الموارد البشرية إلى المالية وتجريد الصلاحيات القديمة وتطبيق سياسات الأمان.',
      connectionsEn: ['Tests Entire AD Chain', 'Evaluates Final Security Posture'],
      connectionsAr: ['يختبر سلسلة الهوية بالكامل', 'يقيم الوضع الأمني النهائي'],
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FolderGit2 className="w-96 h-96 text-cyan-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'عالم أمن الهوية والمؤسسات (World 7)' : 'Enterprise Identity & Active Directory World'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {isAr ? 'خارطة منظومة Active Directory ومصادقة Kerberos' : 'Active Directory & Kerberos Architecture Map'}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            {isAr
              ? 'استكشف المعمارية المتكاملة لإدارة الهوية في المؤسسات: من شجرة الغابة ووحدات OU إلى تبادل تذاكر Kerberos وحزم PAC وقوائم التحكم بالوصول DACL وسياسات GPO المركزية.'
              : 'Explore the complete enterprise identity model: from Forest/OU hierarchy and nested groups to Kerberos 3-tier ticket exchanges (AS/TGS), PAC tokens, resource authorization, and Group Policy inheritance.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300">
              Forest: <strong className="text-cyan-400">nexora.local</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300">
              Domain: <strong className="text-cyan-400">corp.nexora.local</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300">
              KDC / DC: <strong className="text-emerald-400">DC01-NEXORA (10.0.1.10)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Conceptual Pipeline Visualization */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          {isAr ? 'سلسلة تدفق الهوية والتفويض في بيئة ويندوز المؤسسية:' : 'Enterprise Identity & Access Chain:'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-mono">
          {[
            { step: '1. Identity', ar: '1. الهوية والمجال', sub: 'corp.nexora.local' },
            { step: '2. Directory OU', ar: '2. شجرة الوحدات OU', sub: 'OU=Finance' },
            { step: '3. Groups', ar: '3. تداخل المجموعات', sub: 'Nested Roles' },
            { step: '4. Authentication', ar: '4. مصادقة Kerberos', sub: 'AS / TGS / PAC' },
            { step: '5. Authorization', ar: '5. التفويض للأذونات', sub: 'Resource DACL' },
            { step: '6. Group Policy', ar: '6. سياسات GPO', sub: 'LSDOU Inheritance' },
            { step: '7. Event Logs', ar: '7. التدقيق الأمني', sub: 'Event 4624/4768' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
            >
              <span className="text-[11px] font-bold text-cyan-400">{isAr ? item.ar : item.step}</span>
              <span className="text-[10px] text-slate-400 mt-1">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clusters.map((cluster) => {
          const Icon = cluster.icon;
          return (
            <div
              key={cluster.id}
              onClick={() => onSelectLab(cluster.id)}
              className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/70 border ${cluster.border} hover:border-cyan-400/80 hover:bg-slate-900/90 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-950/30 hover:-translate-y-0.5`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cluster.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-cyan-400">
                    {cluster.badge}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {isAr ? cluster.categoryAr : cluster.categoryEn}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {isAr ? cluster.titleAr : cluster.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {isAr ? cluster.descAr : cluster.descEn}
                  </p>
                </div>

                {/* Conceptual Connections */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  {(isAr ? cluster.connectionsAr : cluster.connectionsEn).map((conn, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400/70 shrink-0" />
                      <span>{conn}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                <span>{isAr ? 'فتح المختبر التفاعلي' : 'Launch Interactive Lab'}</span>
                <Arrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
