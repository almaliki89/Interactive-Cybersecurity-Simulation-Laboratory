import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Users,
  Shield,
  Key,
  FolderTree,
  Cpu,
  Server,
  Flame,
  Terminal,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Workflow,
  Sparkles,
  Info,
} from 'lucide-react';

interface WindowsWorldMapProps {
  onSelectLab: (labId: string) => void;
}

export const WindowsWorldMap: React.FC<WindowsWorldMapProps> = ({ onSelectLab }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const clusters = [
    {
      id: 'accounts',
      titleEn: 'Accounts & Local Groups',
      titleAr: 'الحسابات والمجموعات المحلية',
      categoryEn: 'Identity Tier',
      categoryAr: 'طبقة الهوية',
      icon: Users,
      color: 'from-blue-600 to-indigo-700',
      border: 'border-blue-500/40',
      badge: 'SAM / SIDs',
      descEn: 'User accounts, Security Identifiers (SIDs), local groups (Administrators, Users, RDP), and logon rights.',
      descAr: 'حسابات المستخدمين، معرفات الأمان (SIDs)، المجموعات المحلية (المسؤولون، RDP)، وحقوق تسجيل الدخول.',
      connectionsEn: ['Generates Token on Logon', 'Assigned to Group SIDs'],
      connectionsAr: ['تولد الرمز عند تسجيل الدخول', 'تُسند إلى معرفات المجموعات'],
    },
    {
      id: 'token',
      titleEn: 'Access Token Visualizer',
      titleAr: 'محلل رمز الوصول (Access Token)',
      categoryEn: 'Authorization Tier',
      categoryAr: 'طبقة التفويض',
      icon: Key,
      color: 'from-amber-600 to-yellow-700',
      border: 'border-amber-500/40',
      badge: 'UAC / MIC',
      descEn: 'Authentication vs Authorization: User SID, Group SIDs, Privileges (SeDebugPrivilege), and Integrity Levels.',
      descAr: 'المصادقة مقابل التفويض: معرف المستخدم، معرفات المجموعات، الامتيازات (SeDebug)، ومستويات التكامل.',
      connectionsEn: ['Evaluated against NTFS DACL', 'Injected into Processes'],
      connectionsAr: ['تُقيَّم مقابل قوائم NTFS DACL', 'تُحقن داخل العمليات'],
    },
    {
      id: 'ntfs',
      titleEn: 'NTFS Permissions Lab',
      titleAr: 'مختبر أذونات ملفات NTFS',
      categoryEn: 'Access Control',
      categoryAr: 'التحكم بالوصول',
      icon: FolderTree,
      color: 'from-emerald-600 to-teal-700',
      border: 'border-emerald-500/40',
      badge: 'DACL / Inheritance',
      descEn: 'Discretionary ACLs, Explicit vs Inherited ACEs, Allow vs Deny precedence, and effective rights calculation.',
      descAr: 'قوائم DACL، القواعد الصريحة مقابل الموروثة، أولوية المنع على السماح، وحساب الصلاحيات الفعلية.',
      connectionsEn: ['Governs File Access', 'Tested by User Tokens'],
      connectionsAr: ['تحكم الوصول للملفات', 'تُختبر برموز المستخدمين'],
    },
    {
      id: 'processes',
      titleEn: 'Windows Process Tree & MIC',
      titleAr: 'شجرة العمليات ومستويات التكامل (MIC)',
      categoryEn: 'Execution Tier',
      categoryAr: 'طبقة التنفيذ',
      icon: Cpu,
      color: 'from-purple-600 to-indigo-700',
      border: 'border-purple-500/40',
      badge: 'PIDs / Sessions',
      descEn: 'Mandatory Integrity Control (MIC), Process isolation, Session 0 vs 1, and protected system processes (lsass.exe).',
      descAr: 'التحكم الإلزامي بالتكامل (MIC)، عزل العمليات، الجلسة 0 مقابل 1، وحماية العمليات الحساسة (lsass).',
      connectionsEn: ['Hosts Services', 'Generates Event 4688'],
      connectionsAr: ['تستضيف الخدمات', 'تولد حدث الأمان 4688'],
    },
    {
      id: 'services',
      titleEn: 'Windows Services Manager',
      titleAr: 'مدير خدمات ويندوز',
      categoryEn: 'Service Control',
      categoryAr: 'إدارة الخدمات',
      icon: Server,
      color: 'from-cyan-600 to-blue-700',
      border: 'border-cyan-500/40',
      badge: 'SCM / Services',
      descEn: 'Service accounts (LocalSystem, NetworkService), startup types, listening ports, and Unquoted Service Paths.',
      descAr: 'حسابات الخدمات (SYSTEM)، أنواع البدء، منافذ الاستماع الشبكي، وثغرة المسارات غير المقتبسة.',
      connectionsEn: ['Listens on Network Ports', 'Bound by Firewall Rules'],
      connectionsAr: ['تستمع لمنافذ الشبكة', 'تخضع لقواعد جدار الحماية'],
    },
    {
      id: 'firewall',
      titleEn: 'Windows Defender Firewall',
      titleAr: 'جدار حماية ويندوز المتقدم',
      categoryEn: 'Network Perimeter',
      categoryAr: 'محيط الشبكة',
      icon: Flame,
      color: 'from-rose-600 to-red-700',
      border: 'border-rose-500/40',
      badge: 'Profiles / ACL',
      descEn: 'Domain, Private, and Public profiles, Inbound/Outbound inspection, and blocking dangerous ports (SMB 445, Telnet 23).',
      descAr: 'ملفات النطاق والخاص والعام، ترشيح الوارد والصادر، وحظر المنافذ الخطرة (SMB 445 و Telnet 23).',
      connectionsEn: ['Filters Inbound Traffic', 'Protects Listening Services'],
      connectionsAr: ['يرشح حركة المرور الواردة', 'يحمي الخدمات المستمعة'],
    },
    {
      id: 'eventlog',
      titleEn: 'Windows Event Viewer Lab',
      titleAr: 'مختبر سجل الأحداث (Event Viewer)',
      categoryEn: 'Telemetry & Audit',
      categoryAr: 'المراقبة والتدقيق',
      icon: Terminal,
      color: 'from-orange-600 to-amber-700',
      border: 'border-orange-500/40',
      badge: 'Security / System',
      descEn: 'Analyze critical Windows Security Event IDs: 4624 (Logon), 4625 (Failed Logon), 4672 (Admin), 4688 (Process Creation).',
      descAr: 'تحليل معرفات أحداث الأمان الحيوية: 4624 (دخول ناجح)، 4625 (فشل الدخول)، 4672 (امتيازات)، 4688 (عملية جديدة).',
      connectionsEn: ['Records Authentication Events', 'Audits Privilege Escalation'],
      connectionsAr: ['تسجل محاولات المصادقة', 'تدقق تصعيد الصلاحيات'],
    },
    {
      id: 'challenge',
      titleEn: 'Workstation Hardening Challenge',
      titleAr: 'تحدي تحصين محطة عمل ويندوز',
      categoryEn: 'Master Challenge',
      categoryAr: 'التحدي الرئيسي',
      icon: ShieldAlert,
      color: 'from-emerald-600 to-green-700',
      border: 'border-emerald-500/40',
      badge: '100 pts Audit',
      descEn: 'Remediate a vulnerable Windows Server: disable Guest, enforce least privilege on Bob, patch unquoted paths, and harden firewall.',
      descAr: 'حصن محطة عمل معرضة للخطر: عطل حساب الضيف، ازل صلاحيات Bob المفرطة، اصلح مسار الخدمة، وحصن الجدار الناري.',
      connectionsEn: ['Evaluates All Domains', 'Generates Compliance Score'],
      connectionsAr: ['تقيم جميع المكونات', 'تحسب درجة الامتثال الأمني'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 select-none space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-600/40 text-indigo-400 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'عمارة أمن أنظمة ويندوز والهوية (OMEGA V8)' : 'Windows Security Architecture & Identity (OMEGA V8)'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isAr ? 'خارطة منظومة ويندوز الأمنية التفاعلية' : 'Interactive Windows Security Map Hub'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isAr
                ? 'استكشف العلاقات الحية بين الهوية، رموز الأمان (Access Tokens)، صلاحيات NTFS، مستويات التكامل (MIC)، جدار الحماية، وسجلات التدقيق.'
                : 'Explore the living relationships between Identity, Access Tokens, NTFS ACLs, Mandatory Integrity Control (MIC), Firewall rules, and Security Event Logs.'}
            </p>
          </div>

          <button
            onClick={() => onSelectLab('challenge')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isAr ? 'خوض تحدي التحصين الرئيسي' : 'Launch Master Hardening Challenge'}</span>
            <Arrow className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conceptual Relationship Pipeline */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 mb-3">
          <Workflow className="w-4 h-4" />
          <span>{isAr ? 'مسار اتخاذ القرارات الأمنية في ويندوز (Windows Security Decision Flow)' : 'Windows Security Decision Flow'}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-950 border border-blue-900/40">
            <span className="text-[10px] font-mono text-blue-400 uppercase block mb-1">1. Authentication</span>
            <div className="text-xs font-bold text-slate-200">{isAr ? 'المستخدم وكلمة المرور' : 'User Credential'}</div>
            <div className="text-[11px] text-slate-400 mt-1">LSA / SAM / Kerberos</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/40">
            <span className="text-[10px] font-mono text-amber-400 uppercase block mb-1">2. Token Generation</span>
            <div className="text-xs font-bold text-slate-200">{isAr ? 'رمز الأمان (Token)' : 'Security Token'}</div>
            <div className="text-[11px] text-slate-400 mt-1">User SID + Groups + Privileges</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/40">
            <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">3. Authorization</span>
            <div className="text-xs font-bold text-slate-200">{isAr ? 'فحص قائمة DACL' : 'DACL Evaluation'}</div>
            <div className="text-[11px] text-slate-400 mt-1">Explicit Deny &gt; Allow</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-orange-900/40">
            <span className="text-[10px] font-mono text-orange-400 uppercase block mb-1">4. Audit &amp; Event</span>
            <div className="text-xs font-bold text-slate-200">{isAr ? 'سجل الأحداث' : 'Event Logging'}</div>
            <div className="text-[11px] text-slate-400 mt-1">Event IDs: 4624 / 4688 / 7045</div>
          </div>
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {clusters.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              onClick={() => onSelectLab(c.id)}
              className="group relative rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-950/30"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                    {c.badge}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  {isAr ? c.categoryAr : c.categoryEn}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                  {isAr ? c.titleAr : c.titleEn}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {isAr ? c.descAr : c.descEn}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                <span className="text-[11px] font-mono text-slate-400">
                  {isAr ? 'فتح المختبر' : 'Enter Lab'}
                </span>
                <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-colors text-slate-300 group-hover:text-white">
                  <Arrow className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
