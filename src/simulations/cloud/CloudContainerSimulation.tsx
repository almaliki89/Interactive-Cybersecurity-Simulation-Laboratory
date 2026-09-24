import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Cloud,
  Boxes,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Lock,
  Layers,
} from 'lucide-react';

export const CloudContainerSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);

  const [s3PublicAccessBlocked, setS3PublicAccessBlocked] = useState(true);
  const [k8sNetworkPolicyActive, setK8sNetworkPolicyActive] = useState(true);
  const [nonRootContainer, setNonRootContainer] = useState(true);

  const challenge: Challenge = {
    id: 'cloud-k8s-challenge',
    simulationId: 'cloud_containers',
    title: language === 'ar' ? 'تحدي تحصين التخزين السحابي وعزل كوبرنيتيس' : 'Cloud Storage & Kubernetes Hardening Challenge',
    difficulty: 'Intermediate',
    category: language === 'ar' ? 'أمن السحابة والحاويات' : 'Cloud & Containers',
    mission:
      language === 'ar'
        ? 'احظر الوصول العام عن حاوية التخزين S3 وطبق سياسات شبكات كوبرنيتيس (NetworkPolicy) لمنع اختراق قواعد البيانات.'
        : 'Block S3 public access and enforce Kubernetes NetworkPolicy isolation for backend database pods.',
    initialExplanation:
      language === 'ar'
        ? 'ترك حاويات S3 عامة يسبب تسريب البيانات، وغياب سياسات شبكات K8s يسمح بالتحرك الجانبي بين الحزم.'
        : 'Public S3 buckets expose enterprise records; missing K8s NetworkPolicies allow open inter-pod traversal.',
    objectives: [
      {
        id: 'obj-s3',
        title: language === 'ar' ? 'حظر الوصول العام لـ S3' : 'Block S3 Public Access',
        description: language === 'ar' ? 'قفل وحدة التخزين وحصرها على خوادم التطبيقات' : 'Enforce AWS Block Public Access on vault bucket',
        isCompleted: s3PublicAccessBlocked,
        validationKey: 's3_ok',
      },
      {
        id: 'obj-k8s',
        title: language === 'ar' ? 'تفعيل سياسة عزل K8s' : 'Enforce K8s NetworkPolicy',
        description: language === 'ar' ? 'حظر الاتصال المباشر غير المصرح به بين حزم Pods' : 'Restrict pod traffic to designated app selectors',
        isCompleted: k8sNetworkPolicyActive,
        validationKey: 'k8s_ok',
      },
    ],
    hints: [
      language === 'ar' ? 'تأكد من تفعيل خياري "حظر الوصول العام لـ S3" و"سياسات عزل شبكات كوبرنيتيس".' : 'Enable S3 Block Public Access and K8s NetworkPolicy toggles.',
    ],
  };

  const validateChallenge = () => {
    if (s3PublicAccessBlocked && k8sNetworkPolicyActive) {
      return {
        success: true,
        message:
          language === 'ar'
            ? 'ممتاز! تم تحصين البنية السحابية وعزل حاويات كوبرنيتيس بنجاح!'
            : 'Cloud storage secured and Kubernetes network isolation enforced successfully!',
      };
    }
    return {
      success: false,
      message: language === 'ar' ? 'تحقق من شروط حماية التخزين وعزل كوبرنيتيس.' : 'Verify cloud storage and container isolation policies.',
    };
  };

  return (
    <Workspace
      title={language === 'ar' ? 'محاكي أمن السحابة والحاويات (S3 Storage & Kubernetes Isolation)' : 'Cloud Storage & Kubernetes Container Security Simulator'}
      subtitle={language === 'ar' ? 'أخطاء التكوين السحابي، سياسات شبكات كوبرنيتيس، وعزل مساحات الأسماء' : 'S3 Public Exposure, Pod NetworkPolicies & Container Isolation'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={s3PublicAccessBlocked}
                onChange={(e) => setS3PublicAccessBlocked(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'حظر الوصول العام لـ S3 (Block Public)' : 'S3 Block Public Access'}</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={k8sNetworkPolicyActive}
                onChange={(e) => setK8sNetworkPolicyActive(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'سياسة شبكات كوبرنيتيس (NetworkPolicy)' : 'K8s NetworkPolicy Active'}</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* S3 Storage Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  {language === 'ar' ? 'حاوية التخزين السحابي (S3 Bucket)' : 'Cloud Storage Vault'}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${s3PublicAccessBlocked ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300 animate-pulse'}`}>
                {s3PublicAccessBlocked ? 'PRIVATE (SECURE)' : 'PUBLIC (EXPOSED!)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {s3PublicAccessBlocked
                ? (language === 'ar' ? 'الوصول مقتصر فقط على حسابات التطبيق المعتمدة عبر IAM Role.' : 'Restricted IAM role-based access only.')
                : (language === 'ar' ? 'تحذير أمني: الملفات مكشوفة للإنترنت بدون مصادقة!' : 'Security Alert: All documents accessible anonymously over WAN!')}
            </p>
          </div>

          {/* K8s Pod Isolation Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  {language === 'ar' ? 'كلاستر كوبرنيتيس (K8s Cluster)' : 'Kubernetes Pod Mesh'}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${k8sNetworkPolicyActive ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                {k8sNetworkPolicyActive ? 'ISOLATED (NetworkPolicy)' : 'FLAT MESH (Open)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {k8sNetworkPolicyActive
                ? (language === 'ar' ? 'حزم Pods مفصولة بسياسات جدار الحماية الداخلي (Label-based ingress).' : 'Strict label-based microsegmentation between pods.')
                : (language === 'ar' ? 'تحذير: أي اختراق لأي حزمة يتيح الوصول الحر لكافة الخدمات في الكلاستر.' : 'Warning: Flat cluster enables unhindered pod-to-pod traversal.')}
            </p>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
