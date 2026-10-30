import React, { useState, useMemo } from 'react';
import {
  Brain,
  Zap,
  Activity,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  Mic,
  Fingerprint,
} from 'lucide-react';

interface BciNeuralSecurityLabProps {
  language?: 'ar' | 'en';
}

interface NeuralScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  interfaceType: 'INVASIVE_CORTICAL' | 'NON_INVASIVE_EEG' | 'CONSUMER_NEUROFEEDBACK';
  signalVector: string;
  descriptionEn: string;
  descriptionAr: string;
  cognitiveImpact: string;
  cognitiveImpactAr: string;
}

const NEURAL_SCENARIOS: NeuralScenario[] = [
  {
    id: 'BCI-01',
    nameEn: 'P300 Response Exfiltration (Neural Spy)',
    nameAr: 'استنزاف استجابة P300 (التجسس العصبي)',
    interfaceType: 'NON_INVASIVE_EEG',
    signalVector: 'Monitoring ERP (Event-Related Potentials) during rapid visual presentation of private images.',
    descriptionEn: 'Attacker leverages the brain\'s subconscious P300 recognition spike to identify sensitive visual information (e.g., family members, bank logos) without user consent.',
    descriptionAr: 'المهاجم يستغل ذروة التعرف اللاواعي P300 في الدماغ لتحديد معلومات بصرية حساسة (مثل أفراد العائلة أو رموز البنوك) دون موافقة المستخدم.',
    cognitiveImpact: 'Total Privacy Breach & Subconscious Data Leak',
    cognitiveImpactAr: 'اختراق كامل للخصوصية وتسريب بيانات العقل اللاواعي',
  },
  {
    id: 'BCI-02',
    nameEn: 'Motor Command Hijack (Physical Control Takeover)',
    nameAr: 'اختطاف أوامر الحركة (السيطرة الفيزيائية الكاملة)',
    interfaceType: 'INVASIVE_CORTICAL',
    signalVector: 'Injecting rogue neural spikes into the motor cortex via compromised wireless neuro-link.',
    descriptionEn: 'Nation-state actor overrides intended motor neural signals, forcing the user to perform involuntary physical actions or releasing safety interlocks.',
    descriptionAr: 'جهة هجوم متقدمة تتجاوز إشارات الحركة العصبية المقصودة، مما يجبر المستخدم على القيام بأفعال فيزيائية غير إرادية.',
    cognitiveImpact: 'Loss of Bodily Autonomy & Kinetic Harm',
    cognitiveImpactAr: 'فقدان الاستقلالية الجسدية وخطر إصابة حركية',
  },
  {
    id: 'BCI-03',
    nameEn: 'Sensory Feedback Perturbation (Neural Hallucination)',
    nameAr: 'تشويش التغذية الراجعة الحسية (الهلوسة العصبية)',
    interfaceType: 'CONSUMER_NEUROFEEDBACK',
    signalVector: 'Modifying sensory neuro-feedback loop to induce false perception of temperature or pain.',
    descriptionEn: 'Manipulating the feedback loop of a consumer BCI to induce artificial nausea, vertigo, or chronic pain signals to extort the victim.',
    descriptionAr: 'التلاعب بحلقة التغذية الراجعة العصبية لإحداث غثيان اصطناعي أو دوار أو آلام مزمنة لابتزاز الضحية.',
    cognitiveImpact: 'Severe Psychological Distress & Sensory Manipulation',
    cognitiveImpactAr: 'اضطراب نفسي حاد وتلاعب حسي مستمر',
  },
];

export const BciNeuralSecurityLab: React.FC<BciNeuralSecurityLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('BCI-01');
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [neuralLog, setNeuralLog] = useState<{
    status: 'NEURAL_INTEGRITY_SAFE' | 'COGNITIVE_BREACH_DETECTED';
    telemetry: string;
    impactSummary: string;
    activeDefenses: string[];
  } | null>(null);

  // Neural Defenses
  const [defenseDifferentialPrivacy, setDefenseDifferentialPrivacy] = useState<boolean>(false);
  const [defenseSignalAttestation, setDefenseSignalAttestation] = useState<boolean>(false);
  const [defenseAnomalyP300, setDefenseAnomalyP300] = useState<boolean>(false);

  const scenario = useMemo(
    () => NEURAL_SCENARIOS.find((s) => s.id === selectedScenarioId) || NEURAL_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTriggerNeuralAttack = () => {
    setIsInjecting(true);
    setNeuralLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (defenseDifferentialPrivacy && scenario.id === 'BCI-01') {
        activeDefenses.push('Neural Differential Privacy: Laplacian noise added to ERP stream, P300 spikes obfuscated');
        isBlocked = true;
      } else if (defenseSignalAttestation && scenario.id === 'BCI-02') {
        activeDefenses.push('Hardware Signal Attestation: Non-authentic spikes rejected by decrypted cortical probe');
        isBlocked = true;
      } else if (defenseAnomalyP300 && scenario.id === 'BCI-03') {
        activeDefenses.push('Sensory Integrity Monitor: Detected abnormal feedback loops contradicting biometric sensors');
        isBlocked = true;
      }

      if (isBlocked) {
        setNeuralLog({
          status: 'NEURAL_INTEGRITY_SAFE',
          telemetry: isAr
            ? '[تم تأمين السلامة العصبية] الدفاعات التشفيرية أو الخوارزمية منعت التلاعب بالإشارات الحيوية.'
            : '[NEURAL INTEGRITY SECURED] Cryptographic or algorithmic defenses blocked biometric manipulation.',
          impactSummary: isAr
            ? 'عمليات الدماغ طبيعية 100%. تم عزل محاولات حقن الأوامر أو استنزاف البيانات.'
            : 'Brain operations 100% nominal. Command injection or data exfiltration attempts isolated.',
          activeDefenses,
        });
      } else {
        setNeuralLog({
          status: 'COGNITIVE_BREACH_DETECTED',
          telemetry: `NEURAL COMPROMISE: External spike pattern accepted by neurotransmitter MCU.`,
          impactSummary: isAr
            ? `تحذير عصبي حرج: ${scenario.cognitiveImpactAr} نتيجة استجابة BCI للهجوم اللاسلكي!`
            : `CRITICAL COGNITIVE BREACH: ${scenario.cognitiveImpact} due to BCI responding to rogue signal!`,
          activeDefenses: [],
        });
      }

      setIsInjecting(false);
    }, 450);
  };

  const handleResetBci = () => {
    setNeuralLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr
                ? 'مختبر أمان الواجهات العصبية والدماغية (BCI & Neural Security Lab)'
                : 'Brain-Computer Interface (BCI) & Neural Cybersecurity Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800 rounded-full font-mono">
                P300 / ERP / Neural Privacy
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة استغلال الإشارات العصبية لاستنزاف الأسرار اللاواعية، واختطاف أوامر الحركة، والدفاع بخصوصية البيانات العصبية.'
                : 'Simulate neural signal exploitation for subconscious secret theft, motor command hijack, and neural differential privacy.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetBci}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط الإشارات' : 'Reset Neural Stream'}
        </button>
      </div>

      {/* Main Grid: Left Scenario Selector & Defenses, Right EEG Visualization & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: BCI Scenarios & Neural Hardening */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Fingerprint className="w-4 h-4 text-purple-400" />
            {isAr ? 'سيناريوهات اختراق العقل والآلة' : 'Human-Machine Interface Scenarios'}
          </h3>

          <div className="space-y-2">
            {NEURAL_SCENARIOS.map((ns) => {
              const isSelected = ns.id === selectedScenarioId;
              return (
                <button
                  key={ns.id}
                  onClick={() => {
                    setSelectedScenarioId(ns.id);
                    setNeuralLog(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/80 text-purple-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400">{ns.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {ns.interfaceType}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? ns.nameAr : ns.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? ns.descriptionAr : ns.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Neural Hardening Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع حماية البيانات العصبية' : 'Neural Privacy & Signal Hardening'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تطبيق الخصوصية التفاضلية (Differential Privacy)' : 'Neural Stream Differential Privacy'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseDifferentialPrivacy}
                  onChange={(e) => setDefenseDifferentialPrivacy(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'توثيق الإشارات بالعتاد (Hardware Attestation)' : 'Hardware Signal Attestation'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseSignalAttestation}
                  onChange={(e) => setDefenseSignalAttestation(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'رصد شذوذ استجابة P300 وتكامل رد الفعل' : 'Cognitive Integrity & P300 Anomaly Detection'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseAnomalyP300}
                  onChange={(e) => setDefenseAnomalyP300(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: EEG Visualization & Command Log */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              {isAr ? 'شاشة الإشارات الدماغية EEG و ERP' : 'EEG Signal Stream & ERP Visualization'}
            </h3>
            <button
              onClick={handleTriggerNeuralAttack}
              disabled={isInjecting}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-purple-400/30 disabled:opacity-50"
            >
              {isInjecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {isAr ? 'بدء الهجوم العصبي اللاسلكي' : 'Trigger Wireless Neural Strike'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'متجه اختراق الإشارة:' : 'Signal Attack Vector:'}</span>
              <span className="text-purple-400 font-bold">{scenario.signalVector.substring(0, 50)}...</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الأثر الإدراكي المتوقع:' : 'Expected Cognitive Impact:'}</span>
              <span className="text-amber-400 font-bold">{isAr ? scenario.cognitiveImpactAr : scenario.cognitiveImpact}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'معاينة دفق البيانات العصبية (Spikes):' : 'Raw Neural Spike Stream:'}</span>
            <div className="h-20 bg-slate-900 border border-slate-800 rounded relative overflow-hidden flex items-end">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-full mx-[1px] transition-all duration-300 ${
                    isInjecting ? 'bg-purple-500' : 'bg-emerald-500'
                  }`}
                  style={{ height: `${Math.random() * 80 + 10}%`, opacity: 0.4 }}
                ></div>
              ))}
              {isInjecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-purple-900/20 backdrop-blur-[1px]">
                  <span className="text-[10px] text-purple-200 animate-pulse font-bold">ROGUE SIGNAL INJECTION ACTIVE</span>
                </div>
              )}
            </div>
          </div>

          {/* Neural Diagnostics Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشخيص الواجهة العصبية BCI' : 'BCI Neural Integration Log'}</span>
            </div>

            {neuralLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    neuralLog.status === 'NEURAL_INTEGRITY_SAFE'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {neuralLog.status === 'NEURAL_INTEGRITY_SAFE' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'سلامة العقل محفوظة' : 'COGNITIVE INTEGRITY PRESERVED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'اختراق إدراكي حرج!' : 'CRITICAL COGNITIVE BREACH'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{neuralLog.telemetry}</p>
                  <p className="text-[11px] mt-1 font-semibold text-amber-300">{neuralLog.impactSummary}</p>
                </div>

                {neuralLog.activeDefenses.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {isAr ? 'تقنيات التشفير العصبي المفعلة:' : 'Active Neuro-Cyber Defenses:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {neuralLog.activeDefenses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Activity className="w-8 h-8 mb-2 opacity-30 text-purple-400" />
                <p>
                  {isAr
                    ? 'وصلة الدماغ والآلة نشطة. اضغط "بدء الهجوم العصبي" لاختبار متانة حماية الخصوصية اللاواعية.'
                    : 'BCI bridge established. Click "Trigger Wireless Neural Strike" to test subconscious privacy resilience.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
