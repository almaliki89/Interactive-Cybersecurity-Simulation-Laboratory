/**
 * OMEGA V13 — Cloud Security World
 * CloudWorldMap.tsx
 *
 * Interactive Cloud Infrastructure Map visualizing the living Nexora Cloud topology:
 * Organization -> Accounts -> IAM -> Network -> Compute -> Storage -> SecOps.
 */

import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Cloud,
  Shield,
  Layers,
  Users,
  KeyRound,
  Server,
  Database,
  Lock,
  Activity,
  AlertTriangle,
  Radio,
  Network,
  Cpu,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CloudWorldMapProps {
  onSelectLab: (labId: string) => void;
}

export const CloudWorldMap: React.FC<CloudWorldMapProps> = ({ onSelectLab }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const domains = [
    {
      id: 'accounts',
      titleEn: 'Organization & Accounts',
      titleAr: 'المؤسسة وتعدد الحسابات',
      icon: Cloud,
      color: 'border-sky-500/50 text-sky-400 bg-sky-950/20',
      badgeEn: 'Multi-Account Blast Radius',
      badgeAr: 'عزل نطاق الأثر للحسابات',
      descriptionEn: 'Learn AWS/Azure/GCP organization hierarchy, OU service control policies, and account isolation boundaries.',
      descriptionAr: 'فهم التسلسل الهرمي للمؤسسة، وسياسات التحكم OU، وحدود عزل الحسابات للحد من أثر الاختراق.',
      labId: 'accounts',
    },
    {
      id: 'iam',
      titleEn: 'IAM & Least Privilege',
      titleAr: 'إدارة الهويات والامتياز الأدنى',
      icon: Users,
      color: 'border-indigo-500/50 text-indigo-400 bg-indigo-950/20',
      badgeEn: 'Principals & Group Policies',
      badgeAr: 'المستخدمون ومجموعات الصلاحيات',
      descriptionEn: 'Master CloudPrincipals, groups, managed vs inline policies, and avoid dangerous wildcard permissions.',
      descriptionAr: 'إتقان هويات المستخدمين، المجموعات، السياسات المدارة، وتجنب منح صلاحيات النجوم الشاملة (*:*).',
      labId: 'iam',
    },
    {
      id: 'roles',
      titleEn: 'Role Assumption & Trust',
      titleAr: 'تقمص الأدوار وسياسات الثقة',
      icon: KeyRound,
      color: 'border-purple-500/50 text-purple-400 bg-purple-950/20',
      badgeEn: 'STS & Temporary Tokens',
      badgeAr: 'رموز الجلسات المؤقتة STS',
      descriptionEn: 'Understand assume-role trust relationships, external IDs, MFA conditions, and credential generation.',
      descriptionAr: 'فهم علاقات الثقة بالأدوار، الشروط السياقية، التحقق بخطوتين MFA، وتوليد الجلسات المؤقتة.',
      labId: 'roles',
    },
    {
      id: 'policies',
      titleEn: 'Cloud Policy Engine',
      titleAr: 'محرك تقييم السياسات السحابية',
      icon: Shield,
      color: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20',
      badgeEn: 'Deny > Allow > Implicit Deny',
      badgeAr: 'تغليب الحظر الصريح على السماح',
      descriptionEn: 'Interactive JSON policy evaluator: test wildcard actions, resource ARNs, and IP/TLS conditions.',
      descriptionAr: 'مختبر تفاعلي لاختبار سياسات JSON: رصد قواعد التفويض، وتغليب الحظر الصريح، وشروط النقل الآمن.',
      labId: 'policies',
    },
    {
      id: 'network',
      titleEn: 'VPC & Cloud Networking',
      titleAr: 'الشبكات السحابية الافتراضية VPC',
      icon: Network,
      color: 'border-teal-500/50 text-teal-400 bg-teal-950/20',
      badgeEn: 'Subnets, IGW & NAT',
      badgeAr: 'الشبكات الفرعية وبوابات الإنترنت',
      descriptionEn: 'Architect Public DMZ, Private App, and Isolated Database subnets with route tables and peering.',
      descriptionAr: 'بناء وتوجيه الشبكات العامة والخاصة والمعزولة بالكامل عبر بوابات الإنترنت و NAT.',
      labId: 'network',
    },
    {
      id: 'secgroups',
      titleEn: 'Security Groups vs NACLs',
      titleAr: 'مجموعات الأمان وقوائم تحكم الشبكة',
      icon: Layers,
      color: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20',
      badgeEn: 'Stateful vs Stateless',
      badgeAr: 'الحالة (Stateful) مقابل غير الحالة',
      descriptionEn: 'Visualize the critical difference between stateful ENI Security Groups and stateless Subnet NACLs.',
      descriptionAr: 'مشاهدة وتجربة الفرق الجوهري بين مجموعات الأمان الحالة وقوائم NACL غير الحالة المرقمة.',
      labId: 'secgroups',
    },
    {
      id: 'storage',
      titleEn: 'Cloud Storage & BPA',
      titleAr: 'أمن التخزين السحابي وحظر الوصول العام',
      icon: Database,
      color: 'border-amber-500/50 text-amber-400 bg-amber-950/20',
      badgeEn: 'S3 Buckets & Encryption',
      badgeAr: 'حاويات التخزين وتشفير KMS',
      descriptionEn: 'Protect object storage against catastrophic leaks with Block Public Access and KMS keys.',
      descriptionAr: 'حماية حاويات التخزين من التسريبات الكارثية عبر ضوابط BPA والتشفير الإلزامي بمفاتيح KMS.',
      labId: 'storage',
    },
    {
      id: 'secrets',
      titleEn: 'Secrets & Key Management',
      titleAr: 'إدارة الأسرار والتشفير KMS',
      icon: Lock,
      color: 'border-orange-500/50 text-orange-400 bg-orange-950/20',
      badgeEn: 'Auto-Rotation & Leak Scan',
      badgeAr: 'التدوير التلقائي وفحص التسريب',
      descriptionEn: 'Eliminate hardcoded API keys in environment variables; automate KMS key rotation and scanning.',
      descriptionAr: 'القضاء على مفاتيح API المشفرة في متغيرات البيئة؛ وأتمتة تدوير الأسرار ومفاتيح التشفير.',
      labId: 'secrets',
    },
    {
      id: 'workload',
      titleEn: 'Workload Identity & IMDS',
      titleAr: 'هوية أعباء العمل وخدمة IMDS',
      icon: Cpu,
      color: 'border-rose-500/50 text-rose-400 bg-rose-950/20',
      badgeEn: 'IMDSv1 vs IMDSv2 Hop Limit',
      badgeAr: 'حماية بيانات التعريف من SSRF',
      descriptionEn: 'Understand why IMDSv1 enables cloud SSRF credential theft and how IMDSv2 session tokens stop it.',
      descriptionAr: 'اكتشف كيف تتيح IMDSv1 سرقة بيانات الاعتماد عبر SSRF وكيف يحميها فرض IMDSv2 وتحديد القفزات.',
      labId: 'workload',
    },
    {
      id: 'compute',
      titleEn: 'Cloud Compute & Workloads',
      titleAr: 'الخوادم السحابية وأعباء التشغيل',
      icon: Server,
      color: 'border-blue-500/50 text-blue-400 bg-blue-950/20',
      badgeEn: 'VMs, Containers & Isolation',
      badgeAr: 'الخوادم الافتراضية والحاويات والعزل',
      descriptionEn: 'Manage instance profile roles, patch SSRF vulnerabilities, and trigger automated quarantine isolation.',
      descriptionAr: 'إدارة أدوار الخوادم، وترقيع ثغرات SSRF، وتفعيل العزل الآلي الفوري للخوادم المخترقة.',
      labId: 'compute',
    },
    {
      id: 'logging',
      titleEn: 'Cloud Logging & Telemetry',
      titleAr: 'سجلات التدقيق السحابية والمراقبة',
      icon: Activity,
      color: 'border-violet-500/50 text-violet-400 bg-violet-950/20',
      badgeEn: 'CloudTrail & Flow Logs',
      badgeAr: 'سجلات العمليات وتدفق الشبكة',
      descriptionEn: 'Investigate audit event logs, inspect VPC Flow Logs, and verify SHA-256 cryptographic digests.',
      descriptionAr: 'التحقيق في سجلات التدقيق CloudTrail، وسجلات التدفق، والتحقق من سلامة البصمات المشفرة.',
      labId: 'logging',
    },
    {
      id: 'misconfigs',
      titleEn: 'Misconfiguration Scanner',
      titleAr: 'فاحص الأخطاء الإعدادية (CSPM)',
      icon: AlertTriangle,
      color: 'border-red-500/50 text-red-400 bg-red-950/20',
      badgeEn: 'Critical Risk Remediation',
      badgeAr: 'رصد الثغرات وترقيعها الفوري',
      descriptionEn: 'Scan the cloud infrastructure for open SSH ports, public buckets, wildcard policies, and weak IMDS.',
      descriptionAr: 'فحص البنية التحتية السحابية آليًا لرصد منافذ الإدارة المكشوفة والحاويات العامة وضعف الإعدادات.',
      labId: 'misconfigs',
    },
    {
      id: 'detection',
      titleEn: 'Threat Detection Engine',
      titleAr: 'محرك رصد التهديدات السحابية',
      icon: Radio,
      color: 'border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-950/20',
      badgeEn: 'MITRE ATT&CK Cloud Matrix',
      badgeAr: 'مصفوفة MITRE لهجمات السحابة',
      descriptionEn: 'Real-time detection rules for credential theft (T1552.005), exfiltration (T1530), and evasion (T1562.001).',
      descriptionAr: 'قواعد رصد فورية لسرقة بيانات الاعتماد، واستنزاف البيانات، ومحاولات تعطيل سجلات التدقيق.',
      labId: 'detection',
    },
    {
      id: 'incident',
      titleEn: 'Cloud Incident Response',
      titleAr: 'الاستجابة للحوادث السحابية',
      icon: Shield,
      color: 'border-pink-500/50 text-pink-400 bg-pink-950/20',
      badgeEn: 'Operation Cloud Storm',
      badgeAr: 'تطبيق دليل الاستجابة السحابي',
      descriptionEn: 'Investigate and respond to a live multi-stage cloud breach from initial SSRF to exfiltration.',
      descriptionAr: 'إدارة وتتبع حادث أمني سحابي متعدد المراحل من ثغرة الويب وصولاً إلى سحب البيانات واحتواء الأثر.',
      labId: 'incident',
    },
    {
      id: 'architecture',
      titleEn: 'Cloud Security Architecture',
      titleAr: 'معمارية أمن السحابة المؤسسية',
      icon: Layers,
      color: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20',
      badgeEn: 'Well-Architected Framework',
      badgeAr: 'ركيزة الأمان في الإطار المعتمد',
      descriptionEn: 'Explore reference secure cloud blueprints: Hub-and-Spoke, Transit Gateways, and Zero Trust.',
      descriptionAr: 'استكشاف المعماريات المرجعية المحصنة: المحور والأطراف، بوابات العبور، ومحيط انعدام الثقة.',
      labId: 'architecture',
    },
    {
      id: 'master',
      titleEn: 'Master Challenge',
      titleAr: 'التحدي السحابي الشامل',
      icon: Sparkles,
      color: 'border-amber-500 text-amber-300 bg-amber-950/30',
      badgeEn: 'CIS Benchmark Hardening',
      badgeAr: 'تحصين المؤسسة واعتماد CIS',
      descriptionEn: 'Culminating challenge: remediate critical cloud flaws, stop ongoing attacks, and achieve CIS Grade A.',
      descriptionAr: 'التحدي النهائي: إصلاح جميع العيوب الحرجة، والتصدي للهجوم النشط، وتحقيق الدرجة A في معيار CIS.',
      labId: 'master',
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Hero Header */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                NEXORA CLOUD PLATFORM
              </span>
              <span className="text-xs text-slate-400 font-mono">WORLD 18 • VENDOR-NEUTRAL ARCHITECTURE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {isAr ? 'عالم أمن الحوسبة السحابية (Cloud Security World)' : 'Enterprise Cloud Security World'}
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {isAr
                ? 'محاكاة حتمية متكاملة لبيئة سحابية مؤسسية تشمل إدارة الهويات (IAM)، شبكات VPC، مجموعات الأمان، تخزين S3، وحماية IMDS من هجمات SSRF واحتواء الحوادث.'
                : 'Deterministic, hands-on simulation covering Multi-Tenant Accounts, IAM Least Privilege, VPC Routing, Stateful Security Groups, S3 Hardening, IMDSv2 SSRF Defense, and Cloud Incident Response.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectLab('master')}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'بدء التحدي الشامل' : 'Start Master Challenge'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Specialized Labs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {domains.map((lab) => {
          const Icon = lab.icon;
          return (
            <div
              key={lab.id}
              onClick={() => onSelectLab(lab.labId)}
              className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-600/60 hover:bg-slate-800/60 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${lab.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                    {isAr ? lab.badgeAr : lab.badgeEn}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {isAr ? lab.titleAr : lab.titleEn}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {isAr ? lab.descriptionAr : lab.descriptionEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-300 font-semibold">
                <span>{isAr ? 'فتح المختبر التفاعلي' : 'Launch Interactive Lab'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
