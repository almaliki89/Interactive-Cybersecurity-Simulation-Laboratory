/**
 * OMEGA V14 — Container & Kubernetes Security World Map Hub
 * Interactive cluster visualizer and hub for all 16 specialized labs.
 */

import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Boxes,
  Shield,
  Layers,
  Cpu,
  Lock,
  FileCode,
  AlertTriangle,
  Server,
  Network,
  Eye,
  Key,
  Flame,
  CheckCircle2,
  Terminal,
  Share2,
  Activity,
} from 'lucide-react';

interface ContainerWorldMapProps {
  onSelectLab: (labId: string) => void;
}

export const ContainerWorldMap: React.FC<ContainerWorldMapProps> = ({ onSelectLab }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const labs = [
    {
      id: 'namespaces',
      titleAr: 'مساحات أسماء لينكس (Namespaces)',
      titleEn: 'Linux Namespaces Isolation',
      descAr: 'فحص عزل العمليات (PID) والشبكة (NET) ونظام الملفات (MNT) وعزل المستخدمين (UserNS).',
      descEn: 'Inspect PID, Mount, Network, IPC, UTS, and User namespace boundaries.',
      icon: Layers,
      category: 'Kernel Primitives',
      level: 'Beginner',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      id: 'cgroups',
      titleAr: 'مجموعات التحكم وإدارة الموارد (Cgroups)',
      titleEn: 'Cgroups & Resource Constraints',
      descAr: 'اختبار حدود المعالج والذاكرة وإحباط قنابل التفريع (Fork-Bomb) ومنع حجب الخدمة.',
      descEn: 'Simulate CPU quotas, memory OOM-killer, and pids.max fork-bomb containment.',
      icon: Cpu,
      category: 'Kernel Primitives',
      level: 'Beginner',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 'capabilities',
      titleAr: 'صلاحيات لينكس (Linux Capabilities)',
      titleEn: 'Linux Capabilities & Least Privilege',
      descAr: 'تحليل مصفوفة الصلاحيات المميزة وإسقاط CAP_SYS_ADMIN وتطبيق مبدأ أقل الصلاحيات.',
      descEn: 'Audit POSIX capabilities, drop dangerous flags, and enforce CAP_DROP_ALL.',
      icon: Lock,
      category: 'Kernel Primitives',
      level: 'Intermediate',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      id: 'images',
      titleAr: 'أمن صور الحاويات وفحص الثغرات (Image Security)',
      titleEn: 'Container Image Security & CVE Scanner',
      descAr: 'فحص طبقات Dockerfile، كشف تسريب الأسرار، وتوقيع الصور رقمياً عبر Cosign/Sigstore.',
      descEn: 'Scan CVE vulnerabilities, detect leaked secrets, and verify Cosign signatures.',
      icon: FileCode,
      category: 'Supply Chain',
      level: 'Intermediate',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      id: 'escape',
      titleAr: 'كسر عزل الحاوية والهروب للمضيف (Container Escape)',
      titleEn: 'Container Breakout & Escape Vectors',
      descAr: 'اختبار استغلال docker.sock والوضع المميز وcgroup release_agent، وتفعيل Rootless.',
      descEn: 'Simulate docker.sock and privileged breakouts; enforce Rootless containers.',
      icon: AlertTriangle,
      category: 'Runtime Hardening',
      level: 'Advanced',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'controlplane',
      titleAr: 'أمن خوادم التحكم وتدقيق CIS Benchmark',
      titleEn: 'Control Plane Security & CIS K8s Audit',
      descAr: 'تحصين kube-apiserver وتشفير قاعدة بيانات etcd أثناء التخزين واختبار معايير CIS.',
      descEn: 'Audit API server flags, enforce etcd encryption at rest, and run CIS checks.',
      icon: Server,
      category: 'Kubernetes Core',
      level: 'Advanced',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'rbac',
      titleAr: 'إدارة الصلاحيات (Kubernetes RBAC)',
      titleEn: 'Kubernetes RBAC & Privilege Escalation',
      descAr: 'كشف أدوار الأدمن الخفية وتطهير علامات النجمة (*) ومنع استغلال pods/exec.',
      descEn: 'Audit ClusterRoles, eliminate wildcards (*), and block pods/exec abuse.',
      icon: Key,
      category: 'Kubernetes Core',
      level: 'Intermediate',
      badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    {
      id: 'podsecurity',
      titleAr: 'معايير أمان الحزم (Pod Security Standards)',
      titleEn: 'Pod Security Standards (PSS) & Context',
      descAr: 'تقييم مستويات Privileged و Baseline و Restricted وفرض readOnlyRootFilesystem.',
      descEn: 'Enforce Restricted PSS profile, non-root UID 10001, and read-only rootfs.',
      icon: Shield,
      category: 'Kubernetes Core',
      level: 'Intermediate',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'networkpolicy',
      titleAr: 'سياسات الشبكة والعزل الميكروي (Network Policies)',
      titleEn: 'K8s NetworkPolicies & Microsegmentation',
      descAr: 'فرض سياسة Default Deny وعزل قواعد البيانات وحظر استعلام الميتاداتا 169.254.169.254.',
      descEn: 'Enforce Default Deny Ingress/Egress, isolate DB pods, and block IMDS IP.',
      icon: Network,
      category: 'Networking',
      level: 'Advanced',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
    {
      id: 'secrets',
      titleAr: 'إدارة الأسرار وحقن Vault (K8s Secrets)',
      titleEn: 'Secrets Security & Vault Integration',
      descAr: 'استبدال Base64 بتشفير KMS وتفعيل External Secrets Operator مع HashiCorp Vault.',
      descEn: 'Move beyond plain Base64 to KMS envelope encryption and Vault dynamic secrets.',
      icon: Lock,
      category: 'Secrets & IAM',
      level: 'Intermediate',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    {
      id: 'admission',
      titleAr: 'بوابات القبول والسياسات البرمجية (Admission Controllers)',
      titleEn: 'Admission Webhooks (OPA & Kyverno)',
      descAr: 'فرض السياسات الأمنية البرمجية (Policy as Code) لمنع نشر أي Pod غير متوافق.',
      descEn: 'Enforce OPA Gatekeeper & Kyverno ValidatingWebhooks to reject insecure pods.',
      icon: CheckCircle2,
      category: 'Governance',
      level: 'Advanced',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 'falco',
      titleAr: 'الكشف المباشر عبر eBPF و Falco (Runtime Security)',
      titleEn: 'eBPF Runtime Detection (Falco Rules)',
      descAr: 'اعتراض استدعاءات النواة (Syscalls)، كشف جلسات الشيل التفاعلية، وعزل الحاويات تلقائياً.',
      descEn: 'Monitor kernel syscalls via eBPF, detect interactive shells, and auto-quarantine.',
      icon: Flame,
      category: 'Detection & Response',
      level: 'Advanced',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    {
      id: 'servicemesh',
      titleAr: 'شبكة الخدمات والتشفير المتبادل (Service Mesh mTLS)',
      titleEn: 'Service Mesh mTLS & Workload Identity',
      descAr: 'تأمين الاتصال بين الخدمات عبر Istio/Cilium وتوثيق الهوية الرقمية وفق SPIFFE/SPIRE.',
      descEn: 'Inspect zero-trust mTLS encryption and SPIFFE cryptographic workload identities.',
      icon: Share2,
      category: 'Networking',
      level: 'Advanced',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
    {
      id: 'incident',
      titleAr: 'الاستجابة لحوادث اختراق الكلاستر (K8s Incident Response)',
      titleEn: 'Cluster Incident Response & Forensics',
      descAr: 'محاكاة حادث اختراق حي متعدد المراحل: استخراج التوكن، التحرك الجانبي، والاحتواء.',
      descEn: 'Triage live multi-stage pod compromise, lateral traversal, and rapid containment.',
      icon: Activity,
      category: 'Incident Response',
      level: 'Expert',
      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    {
      id: 'architecture',
      titleAr: 'معمارية منصات الحاويات الآمنة (Cloud-Native Arch)',
      titleEn: 'Zero-Trust Cloud-Native Architecture',
      descAr: 'مراجعة التصميم الشامل لبيئة Kubernetes آمنة وفق مبادئ الدفاع في العمق.',
      descEn: 'Review end-to-end zero-trust container platform defense in depth topology.',
      icon: Boxes,
      category: 'Architecture',
      level: 'Advanced',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'master',
      titleAr: 'التحدي الشامل: تحصين كلاستر Nexora K8s',
      titleEn: 'Nexora K8s Master Defense Challenge',
      descAr: 'تحدي دفاعي متكامل: طبق كافة الضوابط الدفاعية واحمِ الكلاستر من الاختراق الكامل!',
      descEn: 'The flagship defense challenge: harden container images, RBAC, PSS, and NetworkPolicies.',
      icon: Terminal,
      category: 'Master Challenge',
      level: 'Expert',
      badgeColor: 'bg-cyan-500 text-slate-950 font-bold border-cyan-400',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {isAr ? 'العالم 20 • النطاق E (CLOUD_DEVOPS)' : 'World 20 • Macro Domain E (CLOUD_DEVOPS)'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OMEGA V14
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {isAr ? 'عالم أمن الحاويات وكوبرنيتيس (Containers & K8s Security)' : 'Container & Kubernetes Security World'}
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-3xl">
                {isAr
                  ? 'منصة تفاعلية عميقة وشاملة لاستكشاف حدود عزل نواة لينكس، وتأمين سلاسل التوريد البرمجية، وتحصين معماريات Kubernetes وفق مبادئ انعدام الثقة (Zero Trust).'
                  : 'Deep, interactive simulation engine exploring Linux kernel namespaces, container supply chain security, and enterprise Kubernetes cluster hardening.'}
              </p>
            </div>

            <button
              onClick={() => onSelectLab('master')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
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
          <Boxes className="w-4 h-4 text-cyan-400" />
          <span>{isAr ? 'المختبرات التخصصية (16 مختبراً تفاعلياً)' : 'Specialized Interactive Labs (16 Modules)'}</span>
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
                    ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/40 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isMaster ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20'
                      } transition-colors`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${lab.badgeColor}`}>
                      {lab.level}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {isAr ? lab.titleAr : lab.titleEn}
                  </h3>

                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {isAr ? lab.descAr : lab.descEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{lab.category}</span>
                  <span className="text-cyan-400 group-hover:underline font-bold">
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
