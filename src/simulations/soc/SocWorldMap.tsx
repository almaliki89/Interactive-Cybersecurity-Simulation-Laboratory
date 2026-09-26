import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Activity,
  Search,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Layers,
  Compass,
  Server,
  Key,
  Radio,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Terminal,
  Database,
  Lock,
} from 'lucide-react';

interface SocWorldMapProps {
  onSelectLab: (labId: string) => void;
}

export const SocWorldMap: React.FC<SocWorldMapProps> = ({ onSelectLab }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const labClusters = [
    {
      clusterNameEn: 'Security Operations Workstation',
      clusterNameAr: 'منصة إدارة العمليات الأمنية والتحقيق',
      descriptionEn: 'Integrated analyst workstation for alert triage, investigation, and incident response.',
      descriptionAr: 'منصة العمل الموحدة للمحللين لفرز التنبيهات والتحقيق والاحتواء.',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
      labs: [
        {
          id: 'workstation',
          titleEn: 'SOC Investigation Workstation',
          titleAr: 'منصة التحقيق في العمليات الأمنية',
          subtitleEn: 'Unified analyst console for triage, timeline, and forensics correlation',
          subtitleAr: 'واجهة المحلل الموحدة لفرز التنبيهات والخط الزمني للأدلة',
          icon: ShieldAlert,
          badge: 'Operations Hub',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        },
      ],
    },
    {
      clusterNameEn: 'Telemetry Ingestion & SIEM Core',
      clusterNameAr: 'طبقة تدفق السجلات ومحرك SIEM المركزي',
      descriptionEn: 'Unified cross-world telemetry normalization, enrichment, and safe querying.',
      descriptionAr: 'استيعاب السجلات وتطبيعها وإثراؤها والبحث الآمن في قاعدة SIEM.',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
      labs: [
        {
          id: 'ingestion',
          titleEn: '1. Telemetry Ingestion & Normalization',
          titleAr: '1. استيعاب وتطبيع سجلات الأنظمة',
          subtitleEn: 'Windows, Linux, AD, Network & AppSec -> Unified Common Schema',
          subtitleAr: 'تحويل السجلات المتنوعة إلى هيكل بيانات أمني موحد',
          icon: Activity,
          badge: 'Ingestion Pipeline',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        },
        {
          id: 'explorer',
          titleEn: '2. SIEM Telemetry Explorer',
          titleAr: '2. مستكشف سجلات SIEM والبحث المتقدم',
          subtitleEn: 'Safe structured query syntax: field = val AND field2 > val',
          subtitleAr: 'البحث والاستعلام السريع وتصفية السجلات عبر النطاقات',
          icon: Search,
          badge: 'Query Engine',
          badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        },
      ],
    },
    {
      clusterNameEn: 'Detection Engineering & Triage',
      clusterNameAr: 'هندسة الكشف وفرز التنبيهات الأمنية',
      descriptionEn: 'Deterministic threshold, sequence, and single-event rule evaluation.',
      descriptionAr: 'قواعد الاكتشاف الحتمية ومصفوفة فرز وتصنيف التنبيهات.',
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30',
      labs: [
        {
          id: 'detection_rules',
          titleEn: '3. Detection Rules & Alert Generation',
          titleAr: '3. قواعد الاكتشاف وتوليد التنبيهات',
          subtitleEn: 'Thresholds, sliding time windows & sequence evaluation',
          subtitleAr: 'ضبط عتبات التكرار والنوافذ الزمنية ومطابقة التسلسل',
          icon: ShieldAlert,
          badge: 'Detection Engine',
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        },
        {
          id: 'alert_triage',
          titleEn: '4. Alert Triage & Prioritization',
          titleAr: '4. فرز وتصنيف أولويات التنبيهات',
          subtitleEn: 'Deterministic scoring: Tier-0 Assets & Privileged Accounts',
          subtitleAr: 'تقييم خطورة التنبيه بناءً على أصول وحسابات المؤسسة',
          icon: ShieldCheck,
          badge: 'Triage Queue',
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        },
        {
          id: 'correlation',
          titleEn: '5. Multi-Stage Attack Correlation',
          titleAr: '5. ربط التنبيهات وسلاسل الهجوم',
          subtitleEn: 'Connect isolated alerts across identity, endpoint & apps',
          subtitleAr: 'ربط التنبيهات المنفصلة في مسار اختراق متكامل',
          icon: Layers,
          badge: 'Attack Graph',
          badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        },
      ],
    },
    {
      clusterNameEn: 'Domain-Specific Telemetry Streams',
      clusterNameAr: 'سجلات النطاقات التخصصية والأنظمة',
      descriptionEn: 'Deep-dive forensic observability into endpoints, network wire, identity, and applications.',
      descriptionAr: 'التحقيق المعمق في سجلات الأجهزة وجدار الحماية ودليل النشاط والتطبيقات.',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      labs: [
        {
          id: 'endpoint_telemetry',
          titleEn: '6. Endpoint EDR & Process Forensics',
          titleAr: '6. سجلات الأجهزة ونقاط النهاية EDR',
          subtitleEn: 'Windows Event 4688, Linux Syslog, and parent-child process trees',
          subtitleAr: 'تتبع شجرة العمليات وتنفيذ الأوامر المشبوهة على الخوادم',
          icon: Server,
          badge: 'Host Telemetry',
          badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        },
        {
          id: 'network_telemetry',
          titleEn: '7. Network & Perimeter Telemetry',
          titleAr: '7. سجلات الشبكة والجدار الناري',
          subtitleEn: 'Firewall ACL drops, port probes, and IP tuple tracking',
          subtitleAr: 'رصد حزم الاتصال الممنوعة وفحص المنافذ في جدار الحماية',
          icon: Shield,
          badge: 'Wire Telemetry',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          id: 'identity_telemetry',
          titleEn: '8. Identity & Active Directory Telemetry',
          titleAr: '8. سجلات الهوية و Active Directory',
          subtitleEn: 'Kerberos AS/TGS requests, Domain Admins group changes',
          subtitleAr: 'مراقبة تذاكر Kerberos وتعديلات المجموعات الإدارية',
          icon: Key,
          badge: 'Identity Logs',
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        },
        {
          id: 'app_telemetry',
          titleEn: '9. Application & API Telemetry',
          titleAr: '9. سجلات أمن التطبيقات وبوابات API',
          subtitleEn: 'BOLA/IDOR denials, rate limits, and SQLi telemetry',
          subtitleAr: 'سجلات انتهاك تفويض الكائنات وتقييد المعدل في تطبيقات الويب',
          icon: Radio,
          badge: 'AppSec Logs',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        },
      ],
    },
    {
      clusterNameEn: 'Investigation, Containment & Tuning',
      clusterNameAr: 'التحقيق الجنائي والاحتواء وهندسة الكشف',
      descriptionEn: 'Threat hunting, chronological timelines, proportional containment, and metric tuning.',
      descriptionAr: 'صيد التهديدات الاستباقي وبناء الخط الزمني وقرارات العزل المتناسبة.',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      labs: [
        {
          id: 'threat_hunting',
          titleEn: '10. Proactive Threat Hunting',
          titleAr: '10. صيد التهديدات الاستباقي',
          subtitleEn: 'Hypothesis formulation and safe structured query execution',
          subtitleAr: 'صياغة فرضيات التهديد والاستعلام الاستباقي عن السلوكيات المشبوهة',
          icon: Compass,
          badge: 'Hunting Deck',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
          id: 'timeline',
          titleEn: '11. Chronological Incident Timeline',
          titleAr: '11. الخط الزمني للحادثة الأمنية',
          subtitleEn: 'Reconstruct end-to-end multi-stage attack chronologies',
          subtitleAr: 'إعادة بناء تسلسل أحداث الهجوم زمنياً بدقة متناهية',
          icon: Clock,
          badge: 'Timeline Engine',
          badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        },
        {
          id: 'containment',
          titleEn: '12. Containment Decisions & Business Impact',
          titleAr: '12. قرارات الاحتواء والتأثير التشغيلي',
          subtitleEn: 'Proportional defense: Stop threat without business outage',
          subtitleAr: 'إجراءات العزل المتناسبة: إيقاف التهديد مع الحفاظ على خدمات الشركة',
          icon: ShieldCheck,
          badge: 'IR Playbook',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          id: 'detection_engineering',
          titleEn: '13. Detection Engineering & Tuning',
          titleAr: '13. هندسة الكشف وضبط الدقة والاستدعاء',
          subtitleEn: 'Measure Precision, Recall, True Positives & suppress noise',
          subtitleAr: 'قياس نسب الدقة والاستدعاء والإنذارات الكاذبة للقواعد',
          icon: Sparkles,
          badge: 'Rule Tuning',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        },
      ],
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none font-mono text-xs">
      {/* Hero Command Center Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/40 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isAr ? 'العالم 24 — مركز العمليات الأمنية وهندسة الكشف (SOC & SIEM)' : 'World 24 — Defensive Operations Command Center'}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              {isAr ? 'منظومة الدفاع السيبراني الشاملة وهندسة الكشف' : 'SOC, SIEM & Detection Engineering Command Center'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {isAr
                ? 'استوعب ملايين السجلات من الشبكة وويندوز ولينكس ودليل النشاط وتطبيقات الويب، واضبط قواعد الاكتشاف الحتمية، وحقق في الهجمات المعقدة مع الحفاظ التام على استمرارية الأعمال.'
                : 'The unified defensive nerve center: Ingest cross-world telemetry -> Normalize into common schema -> Correlate multi-stage attacks -> Execute proportional containment -> Tune detection precision & recall.'}
            </p>
          </div>

          <button
            onClick={() => onSelectLab('challenge')}
            className="group px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-rose-600 hover:from-indigo-400 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-indigo-950/50 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <ShieldAlert className="w-5 h-5 text-yellow-300" />
            <span>{isAr ? 'بدء التحدي الشامل (Nexora Incident)' : 'Launch SOC Master Challenge'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Global Defensive Telemetry Pipeline Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            {isAr ? 'مسار العمليات الدفاعية الموحد (Defensive Operations Pipeline)' : 'Defensive Telemetry to Containment Lifecycle'}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-2 text-xs">
            {[
              { name: 'Raw Telemetry', color: 'bg-blue-900/60 text-blue-300 border-blue-700/50' },
              { name: 'Normalization', color: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50' },
              { name: 'Enrichment', color: 'bg-teal-900/60 text-teal-300 border-teal-700/50' },
              { name: 'SIEM Index', color: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50' },
              { name: 'Detection Rules', color: 'bg-purple-900/60 text-purple-300 border-purple-700/50' },
              { name: 'Alerts', color: 'bg-rose-900/60 text-rose-300 border-rose-700/50' },
              { name: 'Correlation', color: 'bg-amber-900/60 text-amber-300 border-amber-700/50' },
              { name: 'Investigation', color: 'bg-blue-950 text-blue-200 border-blue-800' },
              { name: 'Timeline', color: 'bg-violet-900/60 text-violet-300 border-violet-700/50' },
              { name: 'Containment', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50' },
              { name: 'Detection Tuning', color: 'bg-cyan-950 text-cyan-200 border-cyan-800' },
            ].map((node, i, arr) => (
              <React.Fragment key={node.name}>
                <span className={`px-3 py-1.5 rounded-xl border font-bold whitespace-nowrap shadow-sm ${node.color}`}>
                  {node.name}
                </span>
                {i < arr.length - 1 && <span className="text-slate-600 font-bold">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Lab Clusters Grid */}
      <div className="space-y-8">
        {labClusters.map((cluster) => (
          <div key={cluster.clusterNameEn} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span>{isAr ? cluster.clusterNameAr : cluster.clusterNameEn}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? cluster.descriptionAr : cluster.descriptionEn}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cluster.labs.map((lab) => {
                const Icon = lab.icon;
                return (
                  <button
                    key={lab.id}
                    onClick={() => onSelectLab(lab.id)}
                    className="group text-left p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg hover:shadow-indigo-950/20 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-3 w-full">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 group-hover:text-indigo-300 group-hover:border-indigo-500/40 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${lab.badgeColor}`}>
                        {lab.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {isAr ? lab.titleAr : lab.titleEn}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {isAr ? lab.subtitleAr : lab.subtitleEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-indigo-400">
                      <span>{isAr ? 'فتح المختبر' : 'Launch Lab'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
