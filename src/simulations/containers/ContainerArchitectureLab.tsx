/**
 * OMEGA V14 — Zero-Trust Container & Cloud-Native Architecture Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { Boxes, ShieldCheck, Layers, Lock, Network, Flame, Server, Box } from 'lucide-react';
import { K8s3DClusterCanvas } from './components/K8s3DClusterCanvas';

export const ContainerArchitectureLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');

  const layers = [
    {
      titleAr: '1. أمان سلاسل التوريد وبناء الصور (Supply Chain & CI/CD)',
      titleEn: '1. Supply Chain & Image Security',
      descAr: 'استخدام صور Distroless، فحص CVEs و SBOM، وتوقيع الصور رقمياً بـ Cosign مع التحقق من الهويات عبر Sigstore.',
      descEn: 'Distroless non-root bases, automated CVE & SBOM scanners, and Sigstore/Cosign image signing.',
      icon: Boxes,
      color: 'border-purple-500/30 text-purple-400',
    },
    {
      titleAr: '2. بوابات القبول والسياسات البرمجية (Admission Control)',
      titleEn: '2. Admission Controllers & Policy-as-Code',
      descAr: 'فرض OPA Gatekeeper و Kyverno لمنع نشر أي Pod مميز أو يعمل كـ Root أو يفتقر للحدود الموردية.',
      descEn: 'Validating webhooks enforcing PSS Restricted profiles, non-root users, and resource quotas.',
      icon: ShieldCheck,
      color: 'border-blue-500/30 text-blue-400',
    },
    {
      titleAr: '3. عزل الحاويات ومعايير Pod Security Standards',
      titleEn: '3. Container Runtime Hardening (PSS)',
      descAr: 'إسقاط كافة صلاحيات لينكس (drop: ["ALL"])، وتفعيل readOnlyRootFilesystem، وعزل مساحات الأسماء مع Seccomp و AppArmor.',
      descEn: 'readOnlyRootFilesystem, drop all capabilities, seccomp RuntimeDefault, and AppArmor profiles.',
      icon: Lock,
      color: 'border-emerald-500/30 text-emerald-400',
    },
    {
      titleAr: '4. عزل الشبكات وشبكة الخدمات (Microsegmentation & mTLS)',
      titleEn: '4. Network Segmentation & Service Mesh',
      descAr: 'سياسات NetworkPolicies بوضع Default Deny، حظر ميتاداتا السحابة (169.254.169.254)، وتشفير mTLS عبر Istio/Cilium.',
      descEn: 'Default Deny NetworkPolicies, cloud metadata egress blocking, and zero-trust mTLS encryption.',
      icon: Network,
      color: 'border-teal-500/30 text-teal-400',
    },
    {
      titleAr: '5. حماية خوادم التحكم وتشفير etcd (Control Plane Security)',
      titleEn: '5. Control Plane Hardening & KMS',
      descAr: 'تعطيل الوصول المجهول، تشفير قاعدة بيانات etcd بـ KMS Envelope، وتقييد Kubelet NodeRestriction.',
      descEn: 'KMS envelope encryption for etcd secrets, disabled anonymous auth, and strict RBAC scoping.',
      icon: Server,
      color: 'border-amber-500/30 text-amber-400',
    },
    {
      titleAr: '6. الرصد المباشر والاستجابة بالـ eBPF (Runtime Threat Detection)',
      titleEn: '6. eBPF Runtime Detection & SOAR',
      descAr: 'رصد استدعاءات النواة الحية عبر Falco / Tetragon، واكتشاف جلسات الشيل والحركات المشبوهة، والعزل التلقائي للحزم.',
      descEn: 'Kernel syscall observability with Falco/Tetragon and automated pod isolation.',
      icon: Flame,
      color: 'border-rose-500/30 text-rose-400',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with 3D Toggle */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <Boxes className="w-4 h-4" />
              <span>{isAr ? 'معمارية منصات الحاويات الآمنة' : 'Zero-Trust Container Platform Architecture'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'منظومة الدفاع في العمق لبيئات كوبرنيتيس (Defense in Depth)' : 'Kubernetes Zero-Trust Defense in Depth Architecture'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'نموذج هندسي متكامل يوضح طبقات الأمان لحماية البنية السحابية الحديثة من سلاسل التوريد حتى وقت التشغيل.'
                : 'End-to-end architectural blueprint covering cloud-native container security and hardened runtimes.'}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-auto shrink-0">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{isAr ? 'بيئة العنقود 3D' : '3D Cluster Mesh'}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-emerald-300 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'طبقات المعمارية' : 'Pillars Grid'}</span>
            </button>
          </div>
        </div>

        {/* 3D Kubernetes Cluster Stage */}
        {viewMode === '3d' && (
          <div className="w-full h-[460px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            <K8s3DClusterCanvas />
          </div>
        )}

        {/* 6 Pillars Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layers.map((l, i) => {
            const Icon = l.icon;
            return (
              <div key={i} className={`p-4 rounded-xl bg-slate-900/80 border ${l.color} space-y-2`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-950">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-xs text-white leading-snug">{isAr ? l.titleAr : l.titleEn}</h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  {isAr ? l.descAr : l.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
