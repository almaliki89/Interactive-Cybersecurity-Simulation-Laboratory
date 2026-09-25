import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  FolderTree,
  Users,
  Shield,
  Lock,
  Cpu,
  Server,
  Terminal,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Compass,
  FileCode,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface ClusterNode {
  id: string;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  bgGlow: string;
  conceptsEn: string[];
  conceptsAr: string[];
  connectedTo: string[];
}

interface LinuxWorldMapProps {
  onSelectLab: (labId: string) => void;
}

export const LinuxWorldMap: React.FC<LinuxWorldMapProps> = ({ onSelectLab }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const clusters: ClusterNode[] = [
    {
      id: 'users',
      nameEn: 'Users & Groups',
      nameAr: 'المستخدمون والمجموعات',
      taglineEn: 'Identity propagation, primary vs supplementary groups, and UID/GID boundaries',
      taglineAr: 'هيكلية الهوية، المجموعات الأساسية والتكميلية، وحدود UID/GID',
      icon: Users,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      bgGlow: 'bg-cyan-950/30',
      conceptsEn: ['UID 0 (root)', 'Primary GID', 'Supplementary Groups', 'Effective Groups'],
      conceptsAr: ['المستخدم الجذر UID 0', 'المجموعة الأساسية', 'المجموعات التكميلية', 'المجموعات الفعلية'],
      connectedTo: ['permissions', 'sudo'],
    },
    {
      id: 'fs',
      nameEn: 'Filesystem Explorer',
      nameAr: 'مستكشف نظام الملفات',
      taglineEn: 'Linux directory standard (FHS), inode metadata, and sensitive system assets',
      taglineAr: 'معيار التسلسل الهرمي (FHS)، بيانات Inode، ومسارات النظام الحساسة',
      icon: FolderTree,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      bgGlow: 'bg-amber-950/30',
      conceptsEn: ['/etc (Config)', '/var/log (Logs)', '/proc (Kernel VFS)', '/home (User Data)'],
      conceptsAr: ['/etc (الإعدادات)', '/var/log (السجلات)', '/proc (نواة النظام)', '/home (بيانات المستخدمين)'],
      connectedTo: ['permissions'],
    },
    {
      id: 'permissions',
      nameEn: 'POSIX Permissions Lab',
      nameAr: 'مختبر أذونات POSIX (DAC)',
      taglineEn: 'Discretionary Access Control: Owner, Group, Other with octal & symbolic chmod',
      taglineAr: 'التحكم بالوصول التقديري: المالك، المجموعة، الآخرون والصيغ الثمانية والرمزية',
      icon: Shield,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      bgGlow: 'bg-emerald-950/30',
      conceptsEn: ['rwx (4-2-1)', 'chmod 600 vs 644', 'EACCES Denial', 'CAP_DAC_OVERRIDE'],
      conceptsAr: ['صيغة rwx (4-2-1)', 'أوضاع chmod 600 و 644', 'إنفاذ رفض الوصول EACCES', 'تجاوز الجذر CAP_DAC_OVERRIDE'],
      connectedTo: ['challenge'],
    },
    {
      id: 'sudo',
      nameEn: 'Sudo Policy Lab',
      nameAr: 'مختبر سياسات Sudo',
      taglineEn: 'Administrative privilege escalation, /etc/sudoers rules, and defensive policy audit',
      taglineAr: 'تصعيد الصلاحيات الإدارية، قواعد /etc/sudoers، وتدقيق السياسات الدفاعية',
      icon: Lock,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      bgGlow: 'bg-rose-950/30',
      conceptsEn: ['%wheel Group', 'NOPASSWD Risk', 'Command Whitelisting', 'Least Privilege'],
      conceptsAr: ['مجموعة الإدارة %wheel', 'مخاطر NOPASSWD', 'القوائم البيضاء للأوامر', 'الحد الأدنى من الصلاحيات'],
      connectedTo: ['processes', 'challenge'],
    },
    {
      id: 'processes',
      nameEn: 'Process Tree Lab',
      nameAr: 'شجرة العمليات ونظام التشغيل',
      taglineEn: 'PID/PPID hierarchy, init (systemd), child reaping, and execution states',
      taglineAr: 'تسلسل PID/PPID الهرمي، نظام البدء systemd، والتحكم بالعمليات التابعة',
      icon: Cpu,
      color: 'text-violet-400',
      borderColor: 'border-violet-500/40 hover:border-violet-400',
      bgGlow: 'bg-violet-950/30',
      conceptsEn: ['systemd (PID 1)', 'Parent/Child Linkage', 'kill & SIGTERM', 'Resource Owner'],
      conceptsAr: ['نظام systemd (PID 1)', 'ارتباط الأب والابن', 'إشارات الإيقاف kill', 'مالك العملية'],
      connectedTo: ['services'],
    },
    {
      id: 'services',
      nameEn: 'Service Exposure Lab',
      nameAr: 'كشف الخدمات ومنافذ الشبكة',
      taglineEn: 'Service daemons binding to sockets: Service -> Process -> Port -> Firewall',
      taglineAr: 'ارتباط الخدمات بالمنافذ: الخدمة -> العملية -> المنفذ -> جدار الحماية',
      icon: Server,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      bgGlow: 'bg-blue-950/30',
      conceptsEn: ['Port Binding', 'Attack Surface', 'Firewall Ingress', 'Daemon Lifecycle'],
      conceptsAr: ['ربط المنافذ (Socket Binding)', 'تقليص سطح الهجوم', 'جدار الحماية والترشيح', 'دورة حياة الخدمات'],
      connectedTo: ['logs', 'challenge'],
    },
    {
      id: 'logs',
      nameEn: 'Linux Log Lab',
      nameAr: 'مختبر سجلات النظام والأمان',
      taglineEn: 'Security telemetry, auditd events, kernel audit records, and causal event trails',
      taglineAr: 'المراقبة الأمنية، سجلات التدقيق auditd، وأثر الأحداث السببية',
      icon: Terminal,
      color: 'text-teal-400',
      borderColor: 'border-teal-500/40 hover:border-teal-400',
      bgGlow: 'bg-teal-950/30',
      conceptsEn: ['Deterministic Virtual Time', 'Audit Trails', 'Kernel VFS Logs', 'Authentication Events'],
      conceptsAr: ['الزمن الافتراضي الحتمي', 'سجلات التدقيق', 'سجلات VFS للنواة', 'أحداث المصادقة'],
      connectedTo: ['challenge'],
    },
    {
      id: 'challenge',
      nameEn: 'Hardening Master Challenge',
      nameAr: 'التحدي الرئيسي: تحصين الخادم',
      taglineEn: 'Real-state compliance audit of WEB-SRV-01: evaluate multi-vector defensive controls',
      taglineAr: 'تدقيق أمني حي لحالة الخادم WEB-SRV-01 وتقييم الضوابط الدفاعية متعددة المحاور',
      icon: ShieldAlert,
      color: 'text-yellow-400',
      borderColor: 'border-yellow-500/40 hover:border-yellow-400',
      bgGlow: 'bg-yellow-950/30',
      conceptsEn: ['Shadow Hardening', 'Sudo Least Privilege', 'Port 5432 Shutdown', 'Home Isolation'],
      conceptsAr: ['تحصين ملف Shadow', 'تقييد Sudo', 'إغلاق منفذ 5432', 'عزل المجلدات الشخصية'],
      connectedTo: [],
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono tracking-wider uppercase">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>{isAr ? 'عالم أمن لينكس والهوية (World 5)' : 'Linux Security & Identity Universe (World 5)'}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isAr ? 'خارطة المنظومة الأمنية لنظام لينكس' : 'Linux Operating System Architecture Map'}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'استكشف العلاقات الحيوية بين المستخدمين، الأذونات، العمليات، الخدمات، وسجلات التدقيق. انقر على أي مختبر لبدء المحاكاة التفاعلية.'
                : 'Explore living causal links: Users -> Groups -> Permissions -> Files, Processes -> Services -> Ports, and Events -> Security Audit Logs.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectLab('challenge')}
              className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 flex items-center gap-2 transition transform hover:scale-105"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isAr ? 'تحدي تحصين الخادم' : 'Launch Master Challenge'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Relational Flow Visualizer */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex items-center justify-center gap-3 text-xs font-mono text-slate-400 overflow-x-auto">
        <span className="text-cyan-400 font-bold">{isAr ? 'المستخدم' : 'User'}</span>
        <ArrowIcon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-cyan-400 font-bold">{isAr ? 'المجموعات' : 'Groups'}</span>
        <ArrowIcon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-emerald-400 font-bold">{isAr ? 'الصلاحيات' : 'POSIX DAC'}</span>
        <ArrowIcon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-amber-400 font-bold">{isAr ? 'الملفات' : 'Filesystem'}</span>
        <span className="text-slate-600 px-2">|</span>
        <span className="text-violet-400 font-bold">{isAr ? 'العمليات' : 'Process'}</span>
        <ArrowIcon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-blue-400 font-bold">{isAr ? 'الخدمة' : 'Service'}</span>
        <ArrowIcon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-blue-400 font-bold">{isAr ? 'المنفذ' : 'Port'}</span>
        <span className="text-slate-600 px-2">|</span>
        <span className="text-teal-400 font-bold">{isAr ? 'الأحداث' : 'Events'}</span>
        <ArrowIcon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-teal-400 font-bold">{isAr ? 'سجل المراقبة' : 'Audit Logs'}</span>
      </div>

      {/* Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {clusters.map((cluster) => {
          const Icon = cluster.icon;
          return (
            <div
              key={cluster.id}
              onClick={() => onSelectLab(cluster.id)}
              className={`bg-slate-900/60 border ${cluster.borderColor} rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] relative overflow-hidden group`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${cluster.bgGlow} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform`} />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 ${cluster.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                    {cluster.id.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  {isAr ? cluster.nameAr : cluster.nameEn}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {isAr ? cluster.taglineAr : cluster.taglineEn}
                </p>

                {/* Concepts Tags */}
                <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3">
                  {(isAr ? cluster.conceptsAr : cluster.conceptsEn).map((concept, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
                      <span className="w-1 h-1 rounded-full bg-slate-500" />
                      <span>{concept}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">
                <span>{isAr ? 'دخول المختبر' : 'Launch Interactive Lab'}</span>
                <ArrowIcon className="w-4 h-4 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
