/**
 * OMEGA V15 — DevSecOps & Software Supply Chain World Map Hub
 * Interactive CI/CD pipeline visualizer and hub for all 16 specialized labs.
 */

import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Workflow,
  Shield,
  FileCode,
  Box,
  Key,
  Terminal,
  Activity,
  CheckCircle2,
  Lock,
  Boxes,
  Layers,
  Sparkles,
  GitBranch,
} from 'lucide-react';

interface DevSecOpsWorldMapProps {
  onSelectLab: (labId: string) => void;
}

export const DevSecOpsWorldMap: React.FC<DevSecOpsWorldMapProps> = ({ onSelectLab }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const labs = [
    {
      id: 'sast',
      titleAr: 'فحص الكود المصدري الثابت (SAST Scanner)',
      titleEn: 'SAST Code Analysis (Semgrep)',
      descAr: 'فحص ثغرات SQL Injection و Stored XSS وذودات الكود المصدرية وتصحيحها فورياً.',
      descEn: 'Scan source code for SQLi, XSS, and unhandled logic flaws at author time.',
      icon: FileCode,
      category: 'Shift Left',
      level: 'Beginner',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      id: 'sca',
      titleAr: 'فحص التبعيات والترخيص (SCA Audit)',
      titleEn: 'SCA Dependency & License Audit',
      descAr: 'رصد ثغرات المكتبات مفتوحة المصدر والحزم الخبيثة وترخيص AGPL الوراثي.',
      descEn: 'Audit third-party package CVEs, typosquatting malware, and license risks.',
      icon: Box,
      category: 'Software Supply Chain',
      level: 'Intermediate',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 'secrets',
      titleAr: 'فحص الأسرار العالية العشوائية (Git Secret Scanner)',
      titleEn: 'Git Secret & Entropy Scanner',
      descAr: 'كشف مفاتيح AWS و Stripe و Tokens المكشوفة وتطهير تاريخ الالتزامات Git.',
      descEn: 'Detect high-entropy keys, AWS tokens, and scrub Git commit history.',
      icon: Key,
      category: 'Source Code Security',
      level: 'Intermediate',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'iac',
      titleAr: 'فحص قوالب البنية التحتية (IaC Terraform)',
      titleEn: 'Terraform IaC Security (Checkov/OPA)',
      descAr: 'فحص قوالب HCL/Terraform وإغلاق منافذ SSH المكشوفة وتشفير S3 KMS.',
      descEn: 'Audit Terraform templates using Policy-as-Code to prevent bad cloud deploys.',
      icon: Workflow,
      category: 'Infrastructure as Code',
      level: 'Intermediate',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'slsa',
      titleAr: 'شهادات إثبات الأصل والتوثيق (SLSA Attestation)',
      titleEn: 'SLSA Provenance & Cosign Attestation',
      descAr: 'التحقق من توثيق SLSA Level 3 وتوقيع البناء عبر Sigstore / Rekor Log.',
      descEn: 'Verify SLSA Level 3 build provenance and Cosign cryptographic signatures.',
      icon: Shield,
      category: 'Supply Chain Assurance',
      level: 'Advanced',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'gates',
      titleAr: 'بوابات الأمان في خطوط CI/CD (Security Gates)',
      titleEn: 'CI/CD Automated Security Quality Gates',
      descAr: 'ضبط بوابات الجودة لمنع المدمج والتمرير عند وجود ثغرات حاسمة.',
      descEn: 'Configure mandatory GitHub Actions / GitLab CI merge-blocking gates.',
      icon: CheckCircle2,
      category: 'CI/CD Pipeline',
      level: 'Advanced',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
    {
      id: 'drift',
      titleAr: 'رصد انحراف البنية التحتية (Drift Detection)',
      titleEn: 'Infrastructure Drift Detection',
      descAr: 'مقارنة التغييرات اليدوية الحية على السحابة مع حالة Terraform وتحديثها تلقائياً.',
      descEn: 'Detect manual AWS console drift vs Terraform state and auto-remediate.',
      icon: GitBranch,
      category: 'Cloud Operations',
      level: 'Advanced',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      id: 'serverless',
      titleAr: 'أمن الدوال عديمة الخوادم (Serverless Security)',
      titleEn: 'Serverless Lambda IAM Micro-Isolation',
      descAr: 'تقييد صلاحيات AWS Lambda وعزل المتغيرات البيئية والأسرار.',
      descEn: 'Enforce per-function micro-IAM scopes and encrypt Lambda env vars.',
      icon: Boxes,
      category: 'Cloud Native',
      level: 'Intermediate',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
    {
      id: 'sbom',
      titleAr: 'جرد مكونات البرمجيات (CycloneDX SBOM)',
      titleEn: 'Software Bill of Materials (SBOM Graph)',
      descAr: 'توليد قائمة SBOM الموحدة وتصديرها بصيغ SPDX / CycloneDX.',
      descEn: 'Export CycloneDX / SPDX SBOM dependency inventories for regulatory audit.',
      icon: Layers,
      category: 'Governance & Audit',
      level: 'Intermediate',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    {
      id: 'containerci',
      titleAr: 'فحص الحاويات أثناء البناء (CI Container Scan)',
      titleEn: 'CI Container Build Scanner (Trivy)',
      descAr: 'دمج فحص Trivy في خط البناء وإيقاف الصور المليئة بالثغرات.',
      descEn: 'Embed container image CVE scanning into CI build pipelines.',
      icon: Lock,
      category: 'Build Pipeline',
      level: 'Intermediate',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'signing',
      titleAr: 'التوقيع الرقمي للمخرجات (Artifact Signing)',
      titleEn: 'Artifact Signing & Rekor Transparency Log',
      descAr: 'توقيع المخرجات البرمجية وحفظها في سجل التوثيق الشفاف Rekor.',
      descEn: 'Cryptographically sign build binaries and publish to Rekor transparency log.',
      icon: Key,
      category: 'Supply Chain Assurance',
      level: 'Advanced',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      id: 'compliance',
      titleAr: 'الامتثال التلقائي في CI/CD (Compliance as Code)',
      titleEn: 'Automated Compliance as Code (SOC2/PCI)',
      descAr: 'فحص متطلبات SOC2 و ISO27001 و PCI-DSS تلقائياً في خط الإنتاج.',
      descEn: 'Validate SOC2, ISO27001, and PCI-DSS controls across every git push.',
      icon: Shield,
      category: 'Compliance',
      level: 'Advanced',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'incident',
      titleAr: 'الاستجابة لاختراق سلاسل التوريد (Pipeline Incident)',
      titleEn: 'Supply Chain Incident Response & Rollback',
      descAr: 'التعامل مع اختراق حزم التبعيات وإلغاء الإصدارات المسمومة فورياً.',
      descEn: 'Triage poisoned dependency attacks and execute automated rollback.',
      icon: Activity,
      category: 'Incident Response',
      level: 'Expert',
      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    {
      id: 'architecture',
      titleAr: 'معمارية منصة DevSecOps الآمنة (Platform Design)',
      titleEn: 'Zero-Trust DevSecOps Architecture',
      descAr: 'مراجعة المعمارية الشاملة لخطوط البناء وسلاسل التوريد الآمنة.',
      descEn: 'Review end-to-end zero-trust CI/CD platform topology.',
      icon: Workflow,
      category: 'Architecture',
      level: 'Advanced',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'master',
      titleAr: 'التحدي الشامل: تحصين خط إنتاج Nexora DevSecOps',
      titleEn: 'Nexora DevSecOps Master Pipeline Challenge',
      descAr: 'تحدي دفاعي متكامل: طبق بوابات الأمان، وفحوصات SAST/SCA/IaC، واحمِ خط البناء!',
      descEn: 'The flagship challenge: harden SAST, SCA, secrets, IaC, SBOM, and SLSA provenance.',
      icon: Terminal,
      category: 'Master Challenge',
      level: 'Expert',
      badgeColor: 'bg-purple-500 text-slate-950 font-bold border-purple-400',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {isAr ? 'العالم 22 • النطاق E (CLOUD_DEVOPS)' : 'World 22 • Macro Domain E (CLOUD_DEVOPS)'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OMEGA V15
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {isAr ? 'عالم أمن سلاسل التوريد وDevSecOps (DevSecOps & Supply Chain World)' : 'DevSecOps & Software Supply Chain World'}
              </h1>
              <p className="text-slate-400 text-xs mt-1 max-w-3xl">
                {isAr
                  ? 'بيئة تفاعلية شاملة لبناء خطوط إنتاج برمجية آمنة (CI/CD)، وتطبيق فحوصات SAST و SCA والبحث عن الأسرار وتشفير IaC وتوليد جرد SBOM الموحد وفق أطر SLSA.'
                  : 'Deep interactive simulation engine for secure CI/CD pipelines, automated SAST/SCA quality gates, secrets scrubbing, IaC security, SBOM generation, and SLSA attestations.'}
              </p>
            </div>

            <button
              onClick={() => onSelectLab('master')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>{isAr ? 'خوض التحدي الشامل' : 'Launch Master Challenge'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Specialized Labs */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-purple-400" />
          <span>{isAr ? 'المختبرات التخصصية (15 مختبراً تفاعلياً)' : 'Specialized DevSecOps Modules (15 Labs)'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {labs.map((lab) => {
            const Icon = lab.icon;
            const isMaster = lab.id === 'master';

            return (
              <div
                key={lab.id}
                onClick={() => onSelectLab(lab.id)}
                className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isMaster
                    ? 'bg-gradient-to-b from-purple-950/40 to-slate-900 border-purple-500/40 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isMaster ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-purple-400 group-hover:bg-purple-500/20'
                      } transition-colors`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${lab.badgeColor}`}>
                      {lab.level}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-purple-300 transition-colors">
                    {isAr ? lab.titleAr : lab.titleEn}
                  </h3>

                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {isAr ? lab.descAr : lab.descEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{lab.category}</span>
                  <span className="text-purple-400 group-hover:underline font-bold">
                    {isAr ? 'بدء المختبر ←' : 'Start Lab →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
