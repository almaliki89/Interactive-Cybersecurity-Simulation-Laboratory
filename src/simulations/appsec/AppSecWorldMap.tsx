import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Globe,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  FileCode,
  Lock,
  Database,
  Layers,
  Sparkles,
  Server,
  ArrowRight,
  ArrowLeft,
  Activity,
  Cpu,
  Radio,
  FileCheck,
  Send,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface AppSecWorldMapProps {
  onSelectLab: (labId: string) => void;
}

export const AppSecWorldMap: React.FC<AppSecWorldMapProps> = ({ onSelectLab }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const labClusters = [
    {
      clusterNameEn: 'Core Protocol & Session Tier',
      clusterNameAr: 'طبقة البروتوكول والجلسات الأساسية',
      descriptionEn: 'The transport and session foundation governing browser-to-server request security.',
      descriptionAr: 'الأساس التأسيسي لنقل البيانات وإدارة جلسات المستخدم بين المتصفح والخادم.',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
      labs: [
        {
          id: 'http_lifecycle',
          titleEn: '1. HTTP Full Lifecycle',
          titleAr: '1. دورة حياة طلب HTTP الكاملة',
          subtitleEn: 'Browser -> DNS -> TCP -> TLS -> Proxy -> App -> DB -> Response',
          subtitleAr: 'المتصفح -> DNS -> TCP -> TLS -> البروكسي -> التطبيق -> قاعدة البيانات',
          icon: Globe,
          badge: 'Flagship Pipeline',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        },
        {
          id: 'sessions',
          titleEn: '2. Session & Cookie Security',
          titleAr: '2. أمن الجلسات والكوكيز',
          subtitleEn: 'Session IDs, HttpOnly, Secure, SameSite, Expiration & Rotation',
          subtitleAr: 'معرفات الجلسة، وسمات HttpOnly و Secure و SameSite والتدوير الدوري',
          icon: Key,
          badge: 'Identity State',
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        },
        {
          id: 'access_control',
          titleEn: '3. Access Control & IDOR',
          titleAr: '3. التحكم بالوصول وحماية IDOR',
          subtitleEn: 'RBAC Roles vs Object-Level Ownership (Alice vs Bob Orders)',
          subtitleAr: 'أدوار RBAC مقابل ملكية الكائنات ومنع الوصول غير المصرح به',
          icon: Lock,
          badge: 'Authorization',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
      ],
    },
    {
      clusterNameEn: 'Input Validation & Injection Defenses',
      clusterNameAr: 'التحقق من المدخلات والدفاع ضد هجمات الحقن',
      descriptionEn: 'Neutralizing malicious data from crossing into execution contexts.',
      descriptionAr: 'منع تحول البيانات غير الموثوقة إلى أوامر تنفيذية في المتصفح وقاعدة البيانات.',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      labs: [
        {
          id: 'validation',
          titleEn: '4. Input Validation & Schema',
          titleAr: '4. التحقق من المدخلات ومطابقة البنية',
          subtitleEn: 'Normalization, canonicalization, length, range, and type defense',
          subtitleAr: 'توحيد الصيغة وتدقيق الأطوال والنطاقات والأنواع المسموحة',
          icon: Sliders,
          badge: 'Sanitization',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
          id: 'sqli',
          titleEn: '5. SQL Injection Defense',
          titleAr: '5. الدفاع ضد حقن SQL',
          subtitleEn: 'Unsafe String Concatenation vs Parameterized Prepared Statements',
          subtitleAr: 'الدمج غير الآمن مقابل الاستعلامات المعلمية المجهزة في قاعدة البيانات',
          icon: Database,
          badge: 'Injection Shield',
          badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
        },
        {
          id: 'xss',
          titleEn: '6. Context-Aware XSS Defense',
          titleAr: '6. الدفاع ضد ثغرات XSS وسياقات العرض',
          subtitleEn: 'HTML Body, Attribute, JavaScript String, and URL Encoding',
          subtitleAr: 'ترميز المخرجات بحسب السياق (HTML, Attributes, JavaScript, URLs)',
          icon: FileCode,
          badge: 'DOM Security',
          badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        },
      ],
    },
    {
      clusterNameEn: 'Cross-Origin & Token Security',
      clusterNameAr: 'الأمن بين النطاقات وحماية الرموز المشفرة',
      descriptionEn: 'Governing browser cross-origin boundaries, API tokens, and requests.',
      descriptionAr: 'ضبط حدود المتصفح بين المواقع المختلفة والتحقق الصارم من رموز API.',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      labs: [
        {
          id: 'csrf',
          titleEn: '7. CSRF & SameSite Defenses',
          titleAr: '7. الحماية ضد CSRF وسياسات SameSite',
          subtitleEn: 'Ambient cookie inclusion, SameSite Lax/Strict & Anti-CSRF tokens',
          subtitleAr: 'إرسال الكوكيز التلقائي، سياسات SameSite Lax/Strict ورموز CSRF',
          icon: ShieldCheck,
          badge: 'Origin Guard',
          badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        },
        {
          id: 'api_security',
          titleEn: '8. API Gateway & BOLA Security',
          titleAr: '8. أمن بوابات API وتفويض الكائنات',
          subtitleEn: 'Scopes, BOLA/BFLA prevention, schema rules, and versioning',
          subtitleAr: 'صلاحيات Scopes، حماية BOLA/BFLA، وتدقيق مخططات البيانات',
          icon: Radio,
          badge: 'REST / GraphQL',
          badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        },
        {
          id: 'jwt',
          titleEn: '9. JWT Token Claims Inspector',
          titleAr: '9. فحص رموز JWT والادعاءات الأمنية',
          subtitleEn: 'Header, Payload, Signature, iss, aud, exp, and alg=none rejection',
          subtitleAr: 'فحص الترويسة والحمولة والتوقيع، والتحقق من iss و aud و exp',
          icon: Key,
          badge: 'Token Crypto',
          badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        },
        {
          id: 'cors',
          titleEn: '10. CORS Policy Visualizer',
          titleAr: '10. محاكي سياسات CORS والمجالات المشتركة',
          subtitleEn: 'Preflight (OPTIONS), allowed origins, headers & credential safety',
          subtitleAr: 'الطلبات التمهيدية، النطاقات المصرح بها، وترويسات الأمان',
          icon: Globe,
          badge: 'Browser Policy',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        },
      ],
    },
    {
      clusterNameEn: 'Defensive Controls & Infrastructure',
      clusterNameAr: 'الضوابط الدفاعية والبنية التحتية المحمية',
      descriptionEn: 'Edge, host, header, rate limiting, and forensic observability.',
      descriptionAr: 'حماية الطرفيات، الترويسات، تقييد المعدل، والسجلات الأمنية لـ SOC.',
      color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30',
      labs: [
        {
          id: 'file_upload',
          titleEn: '11. File Upload Defense',
          titleAr: '11. تأمين رفع الملفات وتجريد التنفيذ',
          subtitleEn: 'Extensions, magic bytes, isolated storage outside webroot',
          subtitleAr: 'فحص الامتدادات، البايتات السحرية، وعزل مسار التخزين خارج webroot',
          icon: FileCheck,
          badge: 'Host Defense',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
          id: 'headers',
          titleEn: '12. HTTP Security Headers',
          titleAr: '12. الترويسات الأمنية الدفاعية',
          subtitleEn: 'CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy',
          subtitleAr: 'ضبط CSP و HSTS و nosniff وسياسات الإحالة والصلاحيات',
          icon: Shield,
          badge: 'Response Hardening',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          id: 'rate_limiting',
          titleEn: '13. Rate Limiting (Token Bucket)',
          titleAr: '13. تقييد المعدل (Token Bucket & Fixed Window)',
          subtitleEn: 'Burst traffic management, 429 Retry-After, and brute-force mitigation',
          subtitleAr: 'إدارة تدفق الطلبات المفاجئ، رمز 429 ومنع التخمين الشامل',
          icon: Activity,
          badge: 'Traffic Guard',
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        },
        {
          id: 'app_logging',
          titleEn: '14. AppSec Telemetry & SIEM',
          titleAr: '14. سجلات الأمان والربط مع SIEM',
          subtitleEn: 'Centralized forensic audit logs for auth failures, BOLA & injections',
          subtitleAr: 'سجلات تدقيق مركزية ترصد محاولات الاختراق وتغذي مركز العمليات SOC',
          icon: Server,
          badge: 'SIEM / SOC',
          badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        },
        {
          id: 'architecture',
          titleEn: '15. Secure Architecture Designer',
          titleAr: '15. مصمم البنية متعددة الطبقات',
          subtitleEn: 'Edge CDN -> WAF -> Reverse Proxy -> Web App -> API -> DB -> IdP',
          subtitleAr: 'توزيع الضوابط الأمنية على الطبقات المعمارية المناسبة في العمق',
          icon: Layers,
          badge: 'Defense in Depth',
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        },
      ],
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'العالم 9 — هندسة وأمن تطبيقات الويب' : 'World 9 — Web & Application Security World'}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              {isAr ? 'منظومة أمان تطبيقات الويب والدفاع المتكامل' : 'Full-Stack Application Security & Request Lifecycle'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'استكشف رحلة طلب HTTP من المتصفح عبر حل DNS ومصافحة TLS والبروكسي العكسي وحتى معالجة الجلسات والتحقق من الصلاحيات واستعلامات قواعد البيانات، مع 15 مختبراً تفاعلياً وتحدي الإنتاج الشامل.'
                : 'Master the end-to-end HTTP request lifecycle: DNS -> TLS -> Reverse Proxy -> Sessions -> RBAC & Ownership -> Parameterized DB -> Security Headers. 15 specialized labs and master challenge.'}
            </p>
          </div>

          <button
            onClick={() => onSelectLab('challenge')}
            className="group px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-sm shadow-xl shadow-cyan-950/50 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <ShieldAlert className="w-5 h-5 text-yellow-300" />
            <span>{isAr ? 'بدء التحدي الشامل (Nexora Portal)' : 'Launch Master Challenge'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Global Request Pipeline Concept Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            {isAr ? 'مسار معالجة الطلبات الآمن (Request Lifecycle Pipeline)' : 'Secure Request Lifecycle Flow'}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-2 text-xs font-mono">
            {[
              { name: 'Browser', color: 'bg-blue-900/60 text-blue-300 border-blue-700/50' },
              { name: 'DNS Lookup', color: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50' },
              { name: 'TLS 1.3', color: 'bg-purple-900/60 text-purple-300 border-purple-700/50' },
              { name: 'Reverse Proxy', color: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50' },
              { name: 'Session Guard', color: 'bg-amber-900/60 text-amber-300 border-amber-700/50' },
              { name: 'AuthZ (RBAC/IDOR)', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50' },
              { name: 'Input Validation', color: 'bg-teal-900/60 text-teal-300 border-teal-700/50' },
              { name: 'Parameterized DB', color: 'bg-rose-900/60 text-rose-300 border-rose-700/50' },
              { name: 'Secure Response', color: 'bg-green-900/60 text-green-300 border-green-700/50' },
              { name: 'SIEM Logging', color: 'bg-slate-800 text-slate-300 border-slate-700' },
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
                <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
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
                    className="group text-left p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg hover:shadow-cyan-950/20 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-3 w-full">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-500/40 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${lab.badgeColor}`}>
                        {lab.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors font-mono">
                        {isAr ? lab.titleAr : lab.titleEn}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {isAr ? lab.subtitleAr : lab.subtitleEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-cyan-400">
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
