/**
 * OMEGA V15 — DevSecOps & Software Supply Chain World Map Hub
 * Refactored into a high-fidelity Cyber Range learning journey.
 */

import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
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

  const masterState = useDevSecOpsStore((s) => s.masterState);

  // Dynamic progress stats calculated directly from the live Master State
  const sastCount = masterState.sastFindings.filter(f => f.remediated).length;
  const scaCount = masterState.dependencies.filter(d => d.remediated).length;
  const secretsCount = masterState.secretMatches.filter(s => s.remediated).length;
  const tfCount = masterState.terraformResources.filter(r => r.remediated).length;
  const containerCount = (masterState.containerImages[0]?.vulnerabilitiesCount === 0) ? 1 : 0;
  const sbomCount = masterState.sbomComponents.length >= 3 ? 1 : 0;
  const driftCount = masterState.driftFindings.filter(d => d.autoRemediated).length;

  const totalHardenedPoints = sastCount + scaCount + secretsCount + tfCount + containerCount + sbomCount + driftCount;
  const totalMaxPoints = masterState.sastFindings.length + masterState.dependencies.length + masterState.secretMatches.length + masterState.terraformResources.length + 1 + 1 + masterState.driftFindings.length;
  const progressPercent = Math.round((totalHardenedPoints / totalMaxPoints) * 100);

  const labs = [
    {
      id: 'sast',
      titleAr: 'فحص الكود المصدري الثابت (SAST Scanner)',
      titleEn: 'SAST Code Analysis (Semgrep)',
      descAr: 'فحص ثغرات SQL Injection و Stored XSS وذودات الكود المصدرية وتصحيحها فورياً.',
      descEn: 'Scan source code for SQLi, XSS, and unhandled logic flaws at author time.',
      icon: FileCode,
      phase: 'discover',
      level: 'Beginner',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      id: 'secrets',
      titleAr: 'فحص الأسرار العالية العشوائية (Git Secret Scanner)',
      titleEn: 'Git Secret & Entropy Scanner',
      descAr: 'كشف مفاتيح AWS و Stripe و Tokens المكشوفة وتطهير تاريخ الالتزامات Git.',
      descEn: 'Detect high-entropy keys, AWS tokens, and scrub Git commit history.',
      icon: Key,
      phase: 'discover',
      level: 'Intermediate',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'architecture',
      titleAr: 'معمارية منصة DevSecOps الآمنة (Platform Design)',
      titleEn: 'Zero-Trust DevSecOps Architecture',
      descAr: 'مراجعة المعمارية الشاملة لخطوط البناء وسلاسل التوريد الآمنة.',
      descEn: 'Review end-to-end zero-trust CI/CD platform topology.',
      icon: Workflow,
      phase: 'discover',
      level: 'Advanced',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'sca',
      titleAr: 'فحص التبعيات والترخيص (SCA Audit)',
      titleEn: 'SCA Dependency & License Audit',
      descAr: 'رصد ثغرات المكتبات مفتوحة المصدر والحزم الخبيثة وترخيص AGPL الوراثي.',
      descEn: 'Audit third-party package CVEs, typosquatting malware, and license risks.',
      icon: Box,
      phase: 'build',
      level: 'Intermediate',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 'containerci',
      titleAr: 'فحص الحاويات أثناء البناء (CI Container Scan)',
      titleEn: 'CI Container Build Scanner (Trivy)',
      descAr: 'دمج فحص Trivy في خط البناء وإيقاف الصور المليئة بالثغرات.',
      descEn: 'Embed container image CVE scanning into CI build pipelines.',
      icon: Lock,
      phase: 'build',
      level: 'Intermediate',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'sbom',
      titleAr: 'جرد مكونات البرمجيات (CycloneDX SBOM)',
      titleEn: 'Software Bill of Materials (SBOM Graph)',
      descAr: 'توليد قائمة SBOM الموحدة وتصديرها بصيغ SPDX / CycloneDX.',
      descEn: 'Export CycloneDX / SPDX SBOM dependency inventories for regulatory audit.',
      icon: Layers,
      phase: 'build',
      level: 'Intermediate',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    {
      id: 'iac',
      titleAr: 'فحص قوالب البنية التحتية (IaC Terraform)',
      titleEn: 'Terraform IaC Security (Checkov/OPA)',
      descAr: 'فحص قوالب HCL/Terraform وإغلاق منافذ SSH المكشوفة وتشفير S3 KMS.',
      descEn: 'Audit Terraform templates using Policy-as-Code to prevent bad cloud deploys.',
      icon: Workflow,
      phase: 'validate',
      level: 'Intermediate',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'signing',
      titleAr: 'التوقيع الرقمي للمخرجات (Artifact Signing)',
      titleEn: 'Artifact Signing & Rekor Transparency Log',
      descAr: 'توقيع المخرجات البرمجية وحفظها في سجل التوثيق الشفاف Rekor.',
      descEn: 'Cryptographically sign build binaries and publish to Rekor transparency log.',
      icon: Key,
      phase: 'validate',
      level: 'Advanced',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      id: 'slsa',
      titleAr: 'شهادات إثبات الأصل والتوثيق (SLSA Attestation)',
      titleEn: 'SLSA Provenance & Cosign Attestation',
      descAr: 'التحقق من توثيق SLSA Level 3 وتوقيع البناء عبر Sigstore / Rekor Log.',
      descEn: 'Verify SLSA Level 3 build provenance and Cosign cryptographic signatures.',
      icon: Shield,
      phase: 'validate',
      level: 'Advanced',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'compliance',
      titleAr: 'الامتثال التلقائي في CI/CD (Compliance as Code)',
      titleEn: 'Automated Compliance as Code (SOC2/PCI)',
      descAr: 'فحص متطلبات SOC2 و ISO27001 و PCI-DSS تلقائياً في خط الإنتاج.',
      descEn: 'Validate SOC2, ISO27001, and PCI-DSS controls across every git push.',
      icon: Shield,
      phase: 'validate',
      level: 'Advanced',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'gates',
      titleAr: 'بوابات الأمان في خطوط CI/CD (Security Gates)',
      titleEn: 'CI/CD Automated Security Quality Gates',
      descAr: 'ضبط بوابات الجودة لمنع المدمج والتمرير عند وجود ثغرات حاسمة.',
      descEn: 'Configure mandatory GitHub Actions / GitLab CI merge-blocking gates.',
      icon: CheckCircle2,
      phase: 'validate',
      level: 'Advanced',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
    {
      id: 'serverless',
      titleAr: 'أمن الدوال عديمة الخوادم (Serverless Security)',
      titleEn: 'Serverless Lambda IAM Micro-Isolation',
      descAr: 'تقييد صلاحيات AWS Lambda وعزل المتغيرات البيئية والأسرار.',
      descEn: 'Enforce per-function micro-IAM scopes and encrypt Lambda env vars.',
      icon: Boxes,
      phase: 'defend',
      level: 'Intermediate',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
    {
      id: 'drift',
      titleAr: 'رصد انحراف البنية التحتية (Drift Detection)',
      titleEn: 'Infrastructure Drift Detection',
      descAr: 'مقارنة التغييرات اليدوية الحية على السحابة مع حالة Terraform وتحديثها تلقائياً.',
      descEn: 'Detect manual AWS console drift vs Terraform state and auto-remediate.',
      icon: GitBranch,
      phase: 'defend',
      level: 'Advanced',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      id: 'incident',
      titleAr: 'الاستجابة لاختراق سلاسل التوريد (Pipeline Incident)',
      titleEn: 'Supply Chain Incident Response & Rollback',
      descAr: 'التعامل مع اختراق حزم التبعيات وإلغاء الإصدارات المسمومة فورياً.',
      descEn: 'Triage poisoned dependency attacks and execute automated rollback.',
      icon: Activity,
      phase: 'defend',
      level: 'Expert',
      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
  ];

  const phases = [
    { id: 'discover', titleAr: '١. الاكتشاف والأسس والشيفت ليفت', titleEn: '1. Discover, Foundations & Shift-Left' },
    { id: 'build', titleAr: '٢. حماية البناء والبيئة والحزم', titleEn: '2. Secure Build, Environment & Packages' },
    { id: 'validate', titleAr: '٣. بوابات التوثيق والتحقق والأصل الرقمي', titleEn: '3. Quality Gates, Signatures & SLSA Provenance' },
    { id: 'defend', titleAr: '٤. الدفاع والعمليات والاستجابة للحوادث', titleEn: '4. Operations, Infrastructure Drift & Incident Defense' }
  ];

  const recommendedLab = progressPercent >= 90 ? 'master' : 'sast';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Unified Cyber Range Header and Progress Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Title Banner */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                  {isAr ? 'العالم ٢٢ • السحابة والـ DEVOPS' : 'World 22 • Cloud & DevOps'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  OMEGA LABS
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isAr ? 'مستودع أمن سلاسل التوريد والـ DevSecOps' : 'DevSecOps & Software Supply Chain World'}
              </h1>
              <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                {isAr
                  ? 'رتبة التدريب والتحدي الشامل لتطبيق آليات الشيفت ليفت، فحص الشيفرة SAST، مراقبة المكتبات المفتوحة SCA، بوابات OPA، التوقيع الرقمي بمقاييس SLSA Level 3.'
                  : 'Automated Cyber Range environment simulating continuous pipeline builds, security audits, cryptographic attestation, drift resolution, and compliance checking.'}
              </p>
            </div>

            {/* Recommended Next Action */}
            <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {isAr ? 'النشاط المقترح للمتابعة:' : 'RECOMMENDED ACTION:'}{' '}
                <span className="text-purple-400 font-bold uppercase">{recommendedLab.toUpperCase()}</span>
              </span>
              <button
                onClick={() => onSelectLab(recommendedLab)}
                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
              >
                {isAr ? 'ابدأ النشاط ←' : 'Start Task →'}
              </button>
            </div>
          </div>

          {/* World Progress Visualizer widget */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                {isAr ? 'مؤشرات الإنجاز الإجمالية:' : 'WORLD DEVELOPMENT PROGRESS:'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white">{progressPercent}%</span>
                <span className="text-xs text-slate-500">
                  {totalHardenedPoints}/{totalMaxPoints} {isAr ? 'مؤشر أمني محصن' : 'Control Points Hardened'}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-950 rounded-full mt-2.5 overflow-hidden border border-slate-850">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Sub-phase Indicators */}
            <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>FOUNDATIONS (SAST, SECRETS)</span>
                <span className="text-slate-300 font-bold">{Math.round(((sastCount + secretsCount) / (masterState.sastFindings.length + masterState.secretMatches.length)) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>BUILD INTEGRITY (SCA, CONTAINER, SBOM)</span>
                <span className="text-slate-300 font-bold">{Math.round(((scaCount + containerCount + sbomCount) / (masterState.dependencies.length + 1 + 1)) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>INFRA & DRIFT (TF, DRIFT)</span>
                <span className="text-slate-300 font-bold">{Math.round(((tfCount + driftCount) / (masterState.terraformResources.length + masterState.driftFindings.length)) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flagship Master Challenge Banner */}
        <div 
          onClick={() => onSelectLab('master')}
          className="p-5 rounded-xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-indigo-950/20 border border-purple-500/30 hover:border-purple-500/60 shadow-lg hover:shadow-purple-500/5 cursor-pointer transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                {isAr ? 'بوابة التقويم الختامية' : 'Flagship Graduation Portal'}
              </span>
            </div>
            <h2 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
              {isAr ? 'التحدي الشامل: تحصين خط إنتاج Nexora CI/CD ومصادقة SLSA' : 'Nexora DevSecOps Master Pipeline Challenge'}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr 
                ? 'طبق بوابات الأمان، وفحوصات الثغرات الثابتة والمفتوحة المصدر، وشفر Terraform، وتأكد من مطابقة SBOM وسلاسل Rekor.' 
                : 'Assert all 11 security verification gates, secure pipeline code, check licenses, and complete cryptographic attestation.'}
            </p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-purple-500 text-slate-950 font-black text-xs shadow-md group-hover:bg-purple-400 transition-colors">
            {isAr ? 'خوض التحدي الشامل ←' : 'Launch Master Challenge ←'}
          </button>
        </div>

        {/* Journey Map Grouped by Phase */}
        <div className="space-y-8">
          {phases.map((phase) => {
            const phaseLabs = labs.filter((l) => l.phase === phase.id);
            return (
              <div key={phase.id} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-1.5">
                  <span className="w-1 h-3 rounded bg-cyan-500 shrink-0" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isAr ? phase.titleAr : phase.titleEn}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phaseLabs.map((lab) => {
                    const LabIcon = lab.icon;
                    return (
                      <div
                        key={lab.id}
                        onClick={() => onSelectLab(lab.id)}
                        className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 flex items-center justify-center shrink-0 group-hover:text-cyan-300">
                              <LabIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-500 uppercase">
                              {lab.level}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {isAr ? lab.titleAr : lab.titleEn}
                          </h4>

                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {isAr ? lab.descAr : lab.descEn}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-950">
                          <span className="uppercase">{lab.id.toUpperCase()}</span>
                          <span className="text-cyan-400 font-bold group-hover:underline">
                            {isAr ? 'ابدأ ←' : 'Start →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
