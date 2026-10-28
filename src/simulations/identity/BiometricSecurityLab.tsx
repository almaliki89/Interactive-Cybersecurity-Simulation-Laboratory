import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Eye,
  Camera,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';

interface BiometricSecurityLabProps {
  language?: 'ar' | 'en';
}

interface BiometricSpoofScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'FACIAL_DEEPFAKE' | 'FINGERPRINT_SILICON' | 'IRIS_PHOTO_SPOOF';
  attackType: string;
  livenessScoreWithoutDefense: number;
  descriptionEn: string;
  descriptionAr: string;
  isSpoof: boolean;
}

const BIOMETRIC_SCENARIOS: BiometricSpoofScenario[] = [
  {
    id: 'BIO-01',
    nameEn: 'Generative AI Deepfake Live Video Injection',
    nameAr: 'حقن فيديو الديب فيك الذكي المولد مباشرة للكاميرا',
    category: 'FACIAL_DEEPFAKE',
    attackType: '2D Digital Injection / Synthetic GAN Stream',
    livenessScoreWithoutDefense: 94, // Fools basic 2D RGB cameras
    descriptionEn: 'Generative AI model synthesizes live target face mesh video stream to bypass standard webcam 2D facial verification.',
    descriptionAr: 'نموذج ذكاء اصطناعي توليدي ينشئ بث فيديو مباشر لوجه الهدف لتجاوز التحقق ثنائي الأبعاد للكاميرا.',
    isSpoof: true,
  },
  {
    id: 'BIO-02',
    nameEn: '3D Silicon Mold Fingerprint Replica',
    nameAr: 'قالب بصمة الاصبع المصنوع من السيليكون ثلاثي الأبعاد',
    category: 'FINGERPRINT_SILICON',
    attackType: '3D Physical Mold / Conductive Polymer',
    livenessScoreWithoutDefense: 88, // Fools optical scanners
    descriptionEn: 'High-resolution 3D printed conductive silicon fingerprint mold replicates epidermal ridge patterns of target employee.',
    descriptionAr: 'قالب سيليكون ثلاثي الأبعاد عالي الدقة يستنسخ بصمة الاصبع الموصلة لتجاوز أجهزة المسح الضوئي.',
    isSpoof: true,
  },
  {
    id: 'BIO-03',
    nameEn: 'High-Res Printed Pupil & Iris Photo Spoof',
    nameAr: 'صورة مطبوعة فائقة الدقة لبؤبؤ العين والقزحية',
    category: 'IRIS_PHOTO_SPOOF',
    attackType: 'Printed Photo Presentation Attack',
    livenessScoreWithoutDefense: 82,
    descriptionEn: 'Printed high-resolution infrared iris photo presented to standard optical iris scanner.',
    descriptionAr: 'صورة مطبوعة فائقة الدقة لقزحية العين يتم تقديمها لجهاز المسح القزحي الضوئي العادي.',
    isSpoof: true,
  },
];

export const BiometricSecurityLab: React.FC<BiometricSecurityLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('BIO-01');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    status: 'SPOOF_DETECTED_BLOCKED' | 'BIOMETRIC_EXPLOITED';
    calculatedLivenessPct: number;
    details: string;
    templateHash: string;
    activeDefenses: string[];
  } | null>(null);

  // Biometric Anti-Spoofing Controls (ISO/IEC 30107-3)
  const [defenseInfraredThermal, setDefenseInfraredThermal] = useState<boolean>(false);
  const [defense3dStructuredLight, setDefense3dStructuredLight] = useState<boolean>(false);
  const [defenseFuzzyVaultTemplate, setDefenseFuzzyVaultTemplate] = useState<boolean>(false);

  const scenario = useMemo(
    () => BIOMETRIC_SCENARIOS.find((b) => b.id === selectedScenarioId) || BIOMETRIC_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleScanBiometrics = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'FACIAL_DEEPFAKE' && (defense3dStructuredLight || defenseInfraredThermal)) {
        if (defense3dStructuredLight) activeDefenses.push('3D Structured Light Depth Grid Sensor (Flat 2D Video Detected)');
        if (defenseInfraredThermal) activeDefenses.push('Infrared Thermal Radiation Spectrum Verification');
        isBlocked = true;
      } else if (scenario.category === 'FINGERPRINT_SILICON' && defenseInfraredThermal) {
        activeDefenses.push('Sub-Dermal Blood Pulse & Thermal Spectrum Sensor (No Pulse in Silicon)');
        isBlocked = true;
      } else if (scenario.category === 'IRIS_PHOTO_SPOOF' && defenseInfraredThermal) {
        activeDefenses.push('Near-Infrared Active Pupil Contraction Response Test');
        isBlocked = true;
      }

      if (isBlocked) {
        setScanResult({
          status: 'SPOOF_DETECTED_BLOCKED',
          calculatedLivenessPct: 4, // Very low liveness
          details: isAr
            ? 'تم اكتشاف هجوم التزييف الحيوية (Presentation Attack Detected) وحظر العملية بنجاح!'
            : 'PRESENTATION ATTACK DETECTED (ISO/IEC 30107-3): Biometric sample failed multi-spectral liveness verification.',
          templateHash: 'INVALID_SPOOF_SAMPLE_NO_TEMPLATE_STORED',
          activeDefenses,
        });
      } else {
        setScanResult({
          status: 'BIOMETRIC_EXPLOITED',
          calculatedLivenessPct: scenario.livenessScoreWithoutDefense,
          details: isAr
            ? 'تحذير: تم خدع الماسح الحيوي وقبول العينة المزيفة بتركواز لغياب فحص الحيوية!'
            : 'CRITICAL BIOMETRIC SPOOF EXPLOITED: Synthetic sample passed 2D optical liveness check!',
          templateHash: 'd89f2a00192837465019283746501928 (Compromised)',
          activeDefenses: [],
        });
      }

      setIsScanning(false);
    }, 450);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان السمات الحيوية وفحص الحيوية ضد التزييف (Biometric Security & PAD)' : 'Biometric Security & Presentation Attack Detection Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 rounded-full font-mono">
                ISO/IEC 30107-3 PAD
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لهجمات الديب فيك، وبصمات السيليكون، وفحص الحيوية بالأشعة تحت الحمراء وخرائط العمق 3D.'
                : 'Interactive Generative AI Deepfake detection, silicon mold fingerprinting, and 3D IR multi-spectral liveness.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة الماسح:' : 'Biometric Sensor:'}</span>
          <span className="px-2 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded font-bold">
            3D DEPTH / IR CAMERA READY
          </span>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selector + Biometric Scanner Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Selector & PAD Controls */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات التزييف الحيوي (Spoof Vectors)' : 'Presentation Attack Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {BIOMETRIC_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-950/50 border-emerald-500 text-slate-100 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">{sc.id}</span>
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

          {/* Liveness & Anti-Spoofing Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع فحص الحيوية (PAD Anti-Spoofing Controls)' : 'Liveness Verification Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'استشعار الأشعة تحت الحمراء والحرارة (IR Thermal)' : 'Infrared Thermal Spectral Sensor'}</span>
                <input
                  type="checkbox"
                  checked={defenseInfraredThermal}
                  onChange={(e) => setDefenseInfraredThermal(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'خريطة الأبعاد الهندسية 3D Structured Light' : '3D Structured Light Depth Grid Sensor'}</span>
                <input
                  type="checkbox"
                  checked={defense3dStructuredLight}
                  onChange={(e) => setDefense3dStructuredLight(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تشفير قالب البصمة Fuzzy Vault Cryptography' : 'Fuzzy Vault Bio-Template Protection'}</span>
                <input
                  type="checkbox"
                  checked={defenseFuzzyVaultTemplate}
                  onChange={(e) => setDefenseFuzzyVaultTemplate(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Biometric Scan Inspector Screen */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              {isAr ? 'منصة الفحص الحيوي ونسبة الحيوية Liveness' : 'Biometric Liveness Workbench'}
            </h3>
            <button
              onClick={handleScanBiometrics}
              disabled={isScanning}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-emerald-400/30 disabled:opacity-50"
            >
              {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Fingerprint className="w-3.5 h-3.5" />}
              {isAr ? 'بدء الفحص الحيوي' : 'Scan Biometric Sample'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'نوع الهجوم المقدم للماسح:' : 'Sample Attack Vector Presented:'}</span>
            <span className="text-emerald-400 font-bold">{scenario.attackType}</span>
          </div>

          {/* Biometric Output Display */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تحليل نتائج الماسح الحيوي' : 'Biometric PAD Analysis Stream'}</span>
              {scanResult && (
                <span className="text-slate-400">
                  Liveness Confidence: <strong className="text-emerald-400">{scanResult.calculatedLivenessPct}%</strong>
                </span>
              )}
            </div>

            {scanResult ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    scanResult.status === 'SPOOF_DETECTED_BLOCKED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {scanResult.status === 'SPOOF_DETECTED_BLOCKED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم كشف العينة المزيفة وحظرها (SPOOF BLOCKED)' : 'PRESENTATION ATTACK DETECTED & BLOCKED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم قبول عينة الديب فيك المزيفة!' : 'CRITICAL BIOMETRIC BREACH - DEEPFAKE ACCEPTED'}</span>
                      </>
                    )}
                  </div>
                  {scanResult.details}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px] overflow-x-auto">
                  <span>Bio-Template Hash: </span>
                  <span className="text-emerald-400">{scanResult.templateHash}</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Camera className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر عينة وانقر على "بدء الفحص الحيوي" لمعاينة استجابة نظام كشف التزييف PAD.'
                    : 'Select a sample and click "Scan Biometric Sample" to test ISO/IEC 30107-3 PAD response.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
