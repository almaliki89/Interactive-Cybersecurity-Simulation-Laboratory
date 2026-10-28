import React, { useState, useMemo } from 'react';
import {
  Zap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Activity,
  Terminal,
  RefreshCw,
  Play,
  Lock,
  Unlock,
  Radio,
  Sliders,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface HardwareSideChannelLabProps {
  language?: 'ar' | 'en';
}

interface HardwareScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'DPA_POWER' | 'VOLTAGE_GLITCH' | 'EM_LEAKAGE';
  targetComponent: string;
  traceWaveformSummary: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const HARDWARE_SCENARIOS: HardwareScenario[] = [
  {
    id: 'HW-01',
    nameEn: 'Differential Power Analysis (DPA) on AES-128',
    nameAr: 'تحليل استهلاك الطاقة التفاضلي (DPA) لاستخراج مفتاح AES',
    category: 'DPA_POWER',
    targetComponent: 'Hardware Crypto Co-Processor (AES S-Box)',
    traceWaveformSummary: 'Power Oscilloscope Trace (10,000 runs): Hamming weight correlation peak at Byte 0x03 -> Key: 0x4A',
    descriptionEn: 'Oscilloscope captures minute power consumption spikes during AES SubBytes state transformations to statistically reconstruct 128-bit key.',
    descriptionAr: 'يلتقط جهاز أوسيلوسكوب ارتفاعات استهلاك الطاقة الدقيقة لإعادة بناء مفتاح AES سريًا من الترددات.',
    isThreat: true,
  },
  {
    id: 'HW-02',
    nameEn: 'Voltage Glitching Fault Injection on Secure Boot',
    nameAr: 'حقن الخلل بالجهد الكهربائي (Voltage Glitch) لتجاوز الإقلاع الآمن',
    category: 'VOLTAGE_GLITCH',
    targetComponent: 'SoC VDD Core Rail (1.2V -> 0.7V for 12ns)',
    traceWaveformSummary: 'Glitch Pulse @ Cycle 0x88f2: Skipped RSA Signature Comparison Instruction (jne -> NOP NOP)',
    descriptionEn: 'Targeted 12ns voltage drop on CPU power rail corrupts instruction execution register, dropping CPU straight into root bootloader shell.',
    descriptionAr: 'إسقاط سليم للجهد الكهربائي بمدة 12 نانو ثانية يتسبب بتجاوز تعليمات تدقيق التوقيع الرقمي والوصول للنواة.',
    isThreat: true,
  },
  {
    id: 'HW-03',
    nameEn: 'Electromagnetic (EM) Trace Emission Leakage',
    nameAr: 'تسريب الانبعاثات الكهرومغناطيسية (EM Side-Channel)',
    category: 'EM_LEAKAGE',
    targetComponent: 'Unshielded Microcontroller Die Area',
    traceWaveformSummary: 'Near-Field Probe Frequency Spectrum: High EM amplitude during RSA private exponent Modular Exponentiation',
    descriptionEn: 'Near-field EM probe placed over unshielded chip die measures magnetic radiation leakage during RSA key calculation.',
    descriptionAr: 'يقيس مجس كهرومغناطيسي الإشعاعات المترسبة من الشريحة غير المعزولة لاستخراج المفاتيح السرية.',
    isThreat: true,
  },
];

export const HardwareSideChannelLab: React.FC<HardwareSideChannelLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('HW-01');
  const [isSampling, setIsSampling] = useState<boolean>(false);
  const [hardwareLog, setHardwareLog] = useState<{
    status: 'MITIGATED_BY_HARDWARE' | 'KEY_EXTRACTED_EXPLOITED';
    waveformReport: string;
    details: string;
    activeDefenses: string[];
  } | null>(null);

  // Hardware Security Countermeasures
  const [defensePowerMasking, setDefensePowerMasking] = useState<boolean>(false);
  const [defenseGlitchDetector, setDefenseGlitchDetector] = useState<boolean>(false);
  const [defenseEmShielding, setDefenseEmShielding] = useState<boolean>(false);

  const scenario = useMemo(
    () => HARDWARE_SCENARIOS.find((h) => h.id === selectedScenarioId) || HARDWARE_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunHardwareSample = () => {
    setIsSampling(true);
    setHardwareLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'DPA_POWER' && defensePowerMasking) {
        activeDefenses.push('Power Masking & Random Jitter Dummy Cycles');
        isBlocked = true;
      } else if (scenario.category === 'VOLTAGE_GLITCH' && defenseGlitchDetector) {
        activeDefenses.push('Hardware VDD Voltage Detector & Instant System Reset');
        isBlocked = true;
      } else if (scenario.category === 'EM_LEAKAGE' && defenseEmShielding) {
        activeDefenses.push('Faraday Capping Shield & Active Noise Inserter');
        isBlocked = true;
      }

      if (isBlocked) {
        setHardwareLog({
          status: 'MITIGATED_BY_HARDWARE',
          waveformReport: isAr
            ? '[تم حجب الهجوم العتادي] فشلت عملية تحليل الإشارات بسبب الحماية العتادية المفعلة.'
            : '[HARDWARE COUNTERMEASURE ENGAGED] Signal noise injection or instant fault detector halted attack safely.',
          details: isAr ? 'تم إحباط محاولة استخراج المفاتيح السرية عتادياً.' : 'Key extraction / fault instruction skip prevented.',
          activeDefenses,
        });
      } else {
        setHardwareLog({
          status: 'KEY_EXTRACTED_EXPLOITED',
          waveformReport: scenario.traceWaveformSummary,
          details: isAr
            ? 'تم استخراج مفتاح التشفير أو تجاوز الإقلاع الآمن بنجاح لغياب الحماية العتادية!'
            : 'CRITICAL HARDWARE EXPLOIT: Key bytes reconstructed or Secure Boot bypass achieved via physical glitching!',
          activeDefenses: [],
        });
      }

      setIsSampling(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان العتاد والهجمات الجانبية (Hardware & Side-Channel)' : 'Hardware & Physical Side-Channel Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 rounded-full font-mono">
                DPA & Glitch Injection
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'تحليل استهلاك الطاقة التفاضلي DPA، وحقن الخلل بالجهد الكهربائي Voltage Glitching، والانبعاثات الكهرومغناطيسية.'
                : 'Interactive Differential Power Analysis (DPA), Secure Boot fault injection, and electromagnetic trace leakage.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة المجهر/الأوسيلوسكوب:' : 'Oscilloscope Probe State:'}</span>
          <span className="px-2 py-1 bg-amber-950 border border-amber-800 text-amber-300 rounded font-bold">
            SAMPLING @ 2.5 GS/s
          </span>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selection + Waveform Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Countermeasures */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات الهجمات العتادية' : 'Physical Attack Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {HARDWARE_SCENARIOS.map((sc) => {
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

          {/* Hardware Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'الدفاعات والدروع العتادية (Hardware Countermeasures)' : 'Hardware Countermeasures'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'إخفاء الطاقة بالدورات العشوائية' : 'Power Masking & Random Delay Jitter'}</span>
                <input
                  type="checkbox"
                  checked={defensePowerMasking}
                  onChange={(e) => setDefensePowerMasking(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'كاشف خلل الجهد الكهربائي والسستيم' : 'Hardware Glitch Detector & Reset'}</span>
                <input
                  type="checkbox"
                  checked={defenseGlitchDetector}
                  onChange={(e) => setDefenseGlitchDetector(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'درع فاراداي لمنع تسريب الكهرومغناطيسية' : 'Faraday EM Shielding & Noise Generator'}</span>
                <input
                  type="checkbox"
                  checked={defenseEmShielding}
                  onChange={(e) => setDefenseEmShielding(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Oscilloscope Waveform & Analysis Panel */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              {isAr ? 'شاشة تحليل الموجات والأوسيلوسكوب' : 'Oscilloscope Trace Analyzer'}
            </h3>
            <button
              onClick={handleRunHardwareSample}
              disabled={isSampling}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-amber-400/30 disabled:opacity-50"
            >
              {isSampling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'التقاط الإشارة العتادية' : 'Capture Hardware Trace'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'المكون المستهدف بالجهاز:' : 'Target Hardware Element:'}</span>
            <span className="text-amber-400 font-bold">{scenario.targetComponent}</span>
          </div>

          {/* Trace Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'تقرير موجات الأوسيلوسكوب' : 'Oscilloscope Waveform Telemetry'}</span>
            </div>

            {hardwareLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    hardwareLog.status === 'MITIGATED_BY_HARDWARE'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {hardwareLog.status === 'MITIGATED_BY_HARDWARE' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم إحباط الهجوم بواسطة حماية العتاد' : 'HARDWARE ATTACK MITIGATED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'تم خرق العتاد واستخراج البيانات!' : 'PHYSICAL HARDWARE EXPLOITED'}</span>
                      </>
                    )}
                  </div>
                  {hardwareLog.details}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-amber-300 rounded text-[11px] overflow-x-auto">
                  {hardwareLog.waveformReport}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Activity className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر هجوماً وانقر على "التقاط الإشارة العتادية" لمعاينة الموجات والاستجابة.'
                    : 'Select a physical attack vector and click "Capture Hardware Trace".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
