import React, { useState, useMemo } from 'react';
import {
  FileVideo,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  Scan,
  Database,
  Camera,
} from 'lucide-react';

interface DeepfakeForensicLabProps {
  language?: 'ar' | 'en';
}

interface DeepfakeScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  ganType: 'STYLEGAN_FACE' | 'WAV2LIP_SYNC' | 'DIFFUSION_BODY';
  forensicArtifact: string;
  descriptionEn: string;
  descriptionAr: string;
  impactEn: string;
  impactAr: string;
}

const DEEPFAKE_SCENARIOS: DeepfakeScenario[] = [
  {
    id: 'FAKE-01',
    nameEn: 'CEO Voice & Face Synthesis (Business Email Compromise)',
    nameAr: 'تخليق صوت ووجه الرئيس التنفيذي (اختراق البريد المؤسسي)',
    ganType: 'WAV2LIP_SYNC',
    forensicArtifact: 'High-frequency spectral noise in audio & unnatural lip-sync boundary jitter.',
    descriptionEn: 'Attacker creates a high-fidelity video of a CEO authorizing an emergency $5M wire transfer to a rogue supplier.',
    descriptionAr: 'المهاجم ينشئ فيديو عالي الدقة للرئيس التنفيذي يأمر بتحويل طارئ بقيمة 5 ملايين دولار لمورد وهمي.',
    impactEn: 'Financial Theft & Irreparable Reputational Damage',
    impactAr: 'سرقة مالية كبرى وضرر لا يمكن إصلاحه لسمعة المؤسسة',
  },
  {
    id: 'FAKE-02',
    nameEn: 'Political Disinformation via Diffusion Body Swap',
    nameAr: 'تضليل سياسي عبر تبديل الأجساد بتقنية Diffusion',
    ganType: 'DIFFUSION_BODY',
    forensicArtifact: 'Inconsistent light source shadows & lack of corneal reflection micro-glint.',
    descriptionEn: 'Synthesizing a public figure in a compromising location to trigger civil unrest and influence election outcomes.',
    descriptionAr: 'تخليق شخصية عامة في موقع مشبوه لإثارة الاضطرابات المدنية والتأثير على نتائج الانتخابات.',
    impactEn: 'National Security Instability & Democratic Subversion',
    impactAr: 'زعزعة الأمن القومي وتقويض العملية الديمقراطية',
  },
  {
    id: 'FAKE-03',
    nameEn: 'Biometric Bypass via Synthetic Face Injection',
    nameAr: 'تجاوز البصمة الحيوية عبر حقن الوجوه الاصطناعية',
    ganType: 'STYLEGAN_FACE',
    forensicArtifact: 'Symmetry issues in earrings & checkerboard artifacts in frequency domain.',
    descriptionEn: 'Using a StyleGAN generated face to bypass identity verification systems in high-security digital banking apps.',
    descriptionAr: 'استخدام وجه تم إنشاؤه عبر StyleGAN لتجاوز أنظمة التحقق من الهوية في تطبيقات بنكية عالية الأمان.',
    impactEn: 'Identity Theft & Unauthorized Account Access',
    impactAr: 'سرقة الهوية والوصول غير المصرح به للحسابات البنكية',
  },
];

export const DeepfakeForensicLab: React.FC<DeepfakeForensicLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('FAKE-01');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [forensicLog, setForensicLog] = useState<{
    status: 'DEEPFAKE_ATTRIBUTED' | 'FAKE_ACCEPTED_AS_REAL';
    telemetry: string;
    analysisDetails: string;
    activeDefenses: string[];
  } | null>(null);

  // Forensic Analysis Defenses
  const [defenseC2paMetadata, setDefenseC2paMetadata] = useState<boolean>(false);
  const [defenseFrequencyAnalysis, setDefenseFrequencyAnalysis] = useState<boolean>(false);
  const [defenseLandmarkJitter, setDefenseLandmarkJitter] = useState<boolean>(false);

  const scenario = useMemo(
    () => DEEPFAKE_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEEPFAKE_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunForensicScan = () => {
    setIsScanning(true);
    setForensicLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isDetected = false;

      if (defenseC2paMetadata) {
        activeDefenses.push('C2PA Content Credentials: Missing or invalid cryptographic manifest for media origin');
        isDetected = true;
      } else if (defenseFrequencyAnalysis && (scenario.ganType === 'STYLEGAN_FACE' || scenario.ganType === 'DIFFUSION_BODY')) {
        activeDefenses.push('Spectral Anomaly Detection: Identified GAN checkerboard artifacts in FFT frequency domain');
        isDetected = true;
      } else if (defenseLandmarkJitter && scenario.ganType === 'WAV2LIP_SYNC') {
        activeDefenses.push('Temporal Landmark Analysis: Detected inconsistent pixel jitter in lip-sync boundaries');
        isDetected = true;
      }

      if (isDetected) {
        setForensicLog({
          status: 'DEEPFAKE_ATTRIBUTED',
          telemetry: isAr
            ? '[تم كشف الوسائط الاصطناعية بنجاح] التحليل الجنائي للترددات أو معايير C2PA أثبتت التزييف.'
            : '[DEEPFAKE DETECTED & ATTRIBUTED] Spectral analysis or C2PA manifest proved synthetic origin.',
          analysisDetails: isAr
            ? 'تم عزل الفيديو الخبيث وتحديد خوارزمية التخليق المستخدمة. سلامة المعلومات محفوظة.'
            : 'Synthetic media isolated. Generator fingerprint attributed. Information integrity preserved.',
          activeDefenses,
        });
      } else {
        setForensicLog({
          status: 'FAKE_ACCEPTED_AS_REAL',
          telemetry: `MEDIA VERIFIED: Source accepted as authentic 24fps RAW footage.`,
          analysisDetails: isAr
            ? `إنذار جنائي: تم تمرير المحتوى المزيف بنجاح! ${scenario.impactAr}`
            : `CRITICAL FORENSIC FAILURE: Deepfake accepted as genuine! ${scenario.impactEn}`,
          activeDefenses: [],
        });
      }

      setIsScanning(false);
    }, 550);
  };

  const handleResetForensics = () => {
    setForensicLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <FileVideo className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr
                ? 'مختبر التحليل الجنائي للوسائط الاصطناعية (Deepfake & AI Forensics Lab)'
                : 'Deepfake Attribution & Synthetic Media Forensics Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 rounded-full font-mono">
                C2PA / GAN Analysis / Spectral FFT
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة كشف تزييف الوجوه والأصوات الاصطناعية، وتحليل شذوذ الترددات، والتحقق من سلاسل توريد المحتوى الرقمي.'
                : 'Simulate detection of synthetic faces and voices, spectral artifact analysis, and C2PA content provenance verification.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetForensics}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'تصفير أدوات التحليل' : 'Reset Forensic Tools'}
        </button>
      </div>

      {/* Main Grid: Left Scenario Selector & Tools, Right Media Feed & Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Deepfake Scenarios & Forensic Tools */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Scan className="w-4 h-4 text-cyan-400" />
            {isAr ? 'الأدلة الجنائية الرقمية المشبوهة' : 'Synthetic Evidence Case Files'}
          </h3>

          <div className="space-y-2">
            {DEEPFAKE_SCENARIOS.map((ds) => {
              const isSelected = ds.id === selectedScenarioId;
              return (
                <button
                  key={ds.id}
                  onClick={() => {
                    setSelectedScenarioId(ds.id);
                    setForensicLog(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">{ds.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {ds.ganType}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? ds.nameAr : ds.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? ds.descriptionAr : ds.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Forensic Tools */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'تقنيات كشف التزييف العميق' : 'AI Forensic Detection Suite'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'التحقق من بيانات C2PA المصدرية' : 'C2PA Content Credentials Verification'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseC2paMetadata}
                  onChange={(e) => setDefenseC2paMetadata(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تحليل شذوذ الترددات (Spectral FFT)' : 'Spectral Artifact & Frequency Domain Analysis'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseFrequencyAnalysis}
                  onChange={(e) => setDefenseFrequencyAnalysis(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'رصد اهتزاز النقاط المرجعية (Landmarks)' : 'Facial Landmark Temporal Jitter Tracking'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseLandmarkJitter}
                  onChange={(e) => setDefenseLandmarkJitter(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Video Feed & Forensic Analytics */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              {isAr ? 'شاشة فحص الوسائط ومعاينة FFT' : 'Media Inspection & Spectral Visualization'}
            </h3>
            <button
              onClick={handleRunForensicScan}
              disabled={isScanning}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-cyan-400/30 disabled:opacity-50"
            >
              {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              {isAr ? 'بدء الفحص الجنائي للوسائط' : 'Execute AI Forensic Scan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الأثر الجنائي المستهدف:' : 'Target Forensic Artifact:'}</span>
              <span className="text-cyan-400 font-bold">{scenario.forensicArtifact.substring(0, 50)}...</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الخطر المجتمعي/المؤسسي:' : 'Strategic Impact:'}</span>
              <span className="text-amber-400 font-bold">{isAr ? scenario.impactAr : scenario.impactEn}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'خريطة حرارة اهتزاز البيكسلات:' : 'Pixel Probability Heatmap (GAN Inconsistency):'}</span>
            <div className="h-24 bg-slate-900 border border-slate-800 rounded flex items-center justify-center relative overflow-hidden">
               <div className="grid grid-cols-8 gap-1 w-full h-full p-2 opacity-30">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div key={i} className={`rounded-sm ${isScanning ? (i % 3 === 0 ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500') : 'bg-slate-800'}`}></div>
                  ))}
               </div>
               {isScanning && <div className="absolute inset-0 bg-cyan-400/10 animate-pulse flex items-center justify-center text-[10px] font-bold text-cyan-200">SCANNING SPECTRAL FINGERPRINT...</div>}
            </div>
          </div>

          {/* Forensic Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل نتائج التحليل الجنائي للذكاء الاصطناعي' : 'AI Forensic Analysis Result Stream'}</span>
            </div>

            {forensicLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    forensicLog.status === 'DEEPFAKE_ATTRIBUTED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {forensicLog.status === 'DEEPFAKE_ATTRIBUTED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم إثبات التزييف العميق' : 'MEDIA DECLARED SYNTHETIC'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'خطأ في التحقق - تم قبول الزيف!' : 'FORENSIC VERIFICATION FAILED'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{forensicLog.telemetry}</p>
                  <p className="text-[11px] mt-1 font-semibold text-amber-300">{forensicLog.analysisDetails}</p>
                </div>

                {forensicLog.activeDefenses.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {isAr ? 'أدلة الكشف المستخدمة:' : 'Active Forensic Evidence Markers:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {forensicLog.activeDefenses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <FileVideo className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
                <p>
                  {isAr
                    ? 'الملف الرقمي جاهز للفحص. اضغط "بدء الفحص" لتحليل التواقيع الخوارزمية واهتزاز المعالم.'
                    : 'Media file buffered. Click "Execute AI Forensic Scan" to analyze algorithmic fingerprints and temporal jitter.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
