/**
 * OMEGA V15 — Zero-Trust DevSecOps Platform Architecture Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { Workflow, ShieldCheck, Box, Key, Layers, FileCode, CheckCircle2 } from 'lucide-react';
import { DevSecOps3DPipelineStage } from './components/DevSecOps3DPipelineStage';

export const DevSecOpsArchitectureLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const [viewMode, setViewMode] = useState<'3d' | 'pillars'>('3d');

  const pillars = [
    {
      titleAr: '1. حماية الشفرة المصدرية والمستودع (Code & Repository Security)',
      titleEn: '1. Source Code & Repository Security',
      descAr: 'خطافات Git Pre-commit لفحص الأسرار، مراجعات الكود الإلزامية (Branch Protection)، وتتبع هوية المطور بـ GPG Signing.',
      descEn: 'Git pre-commit secret scanners, branch protection rules, and mandatory signed commits.',
      icon: FileCode,
    },
    {
      titleAr: '2. بوابات فحص الكود الثابت والتبعيات (SAST & SCA Gates)',
      titleEn: '2. SAST & SCA Build Quality Gates',
      descAr: 'فحص Semgrep المباشر لـ SQLi و XSS، ومطابقة تراخيص التبعيات المسموحة، وحظر البرمجيات الخبيثة الانتحالية.',
      descEn: 'Semgrep SAST code analysis, dependency CVE scanning, and typosquatting interdiction.',
      icon: Box,
    },
    {
      titleAr: '3. أمن البنية التحتية ككود (IaC Security as Code)',
      titleEn: '3. Infrastructure as Code (IaC) Security',
      descAr: 'فحص Checkov لملفات Terraform، حظر منافذ SSH المكشوفة، وتطبيق سياسات OPA قبل تدشين الموارد السحابية.',
      descEn: 'Checkov HCL template scans, public ingress blocks, and Open Policy Agent guardrails.',
      icon: Workflow,
    },
    {
      titleAr: '4. جرد المكونات وتوثيق الأصل (SBOM & SLSA Provenance)',
      titleEn: '4. SBOM & SLSA Build Provenance Attestation',
      descAr: 'توليد قائمة CycloneDX SBOM، وتوثيق أصل البناء وفق معيار SLSA Level 3 وتوقيع المخرجات بـ Cosign.',
      descEn: 'CycloneDX SBOM export, SLSA Level 3 provenance generation, and Cosign keyless signatures.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with 3D Toggle */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
              <Workflow className="w-4 h-4" />
              <span>{isAr ? 'معمارية خطوط الإنتاج البرمجي الآمنة' : 'Zero-Trust DevSecOps Platform Architecture'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'منظومة حماية سلاسل التوريد البرمجية من الالتزام حتى النشر (Shift-Left)' : 'DevSecOps & Software Supply Chain Defense-in-Depth Architecture'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'النموذج المعماري الشامل لحماية سلاسل التوريد البرمجية من كتابة الكود إلى النشر النهائي.'
                : 'End-to-end architectural blueprint connecting SAST, SCA, secrets, IaC, SBOM, and SLSA provenance.'}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-auto shrink-0">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{isAr ? 'خط الإنتاج 3D' : '3D Pipeline Mesh'}</span>
            </button>
            <button
              onClick={() => setViewMode('pillars')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'pillars'
                  ? 'bg-slate-800 text-purple-300 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'أعمدة المعمارية' : 'Pillars View'}</span>
            </button>
          </div>
        </div>

        {/* 3D Pipeline Stage */}
        {viewMode === '3d' && (
          <div className="w-full h-[460px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            <DevSecOps3DPipelineStage />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((p, i) => {
            const IconComponent = p.icon;
            return (
              <div key={i} className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-950 text-purple-400">
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                  </div>
                  <h2 className="font-bold text-xs text-white">{isAr ? p.titleAr : p.titleEn}</h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  {isAr ? p.descAr : p.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
