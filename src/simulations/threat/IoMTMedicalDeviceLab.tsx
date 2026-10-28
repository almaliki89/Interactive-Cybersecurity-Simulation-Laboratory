import React, { useState, useMemo } from 'react';
import {
  Heart,
  Activity,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Radio,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Cpu,
  Layers,
  Thermometer,
  Syringe,
} from 'lucide-react';

interface IoMTMedicalDeviceLabProps {
  language?: 'ar' | 'en';
}

interface MedicalDeviceScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  deviceType: 'IMPLANTABLE_PACEMAKER' | 'SMART_INSULIN_PUMP' | 'SMART_INFUSION_PUMP';
  rfProtocol: string;
  cveId: string;
  vulnerablePayload: string;
  descriptionEn: string;
  descriptionAr: string;
  patientImpact: string;
  patientImpactAr: string;
}

const MEDICAL_SCENARIOS: MedicalDeviceScenario[] = [
  {
    id: 'MED-01',
    nameEn: 'Implantable Cardiac Pacemaker RF Pacing Invalidation',
    nameAr: 'تعطيل صدمات منظم ضربات القلب المزروع عبر التردد اللاسلكي',
    deviceType: 'IMPLANTABLE_PACEMAKER',
    rfProtocol: '402-405 MHz MICS (Medical Implant Communication Service)',
    cveId: 'CVE-2020-27208 (Unauthenticated RF Command Execution)',
    vulnerablePayload: 'MICS_FRAME: CMD=0x99 [FORCE_INHIBIT_DEFIBRILLATION_SHOCK_PULSE] CHECKSUM=0xAA',
    descriptionEn: 'Attacker leverages near-field RF antenna to transmit unauthenticated proprietary pacing commands, inhibiting life-saving defibrillation shocks.',
    descriptionAr: 'المهاجم يستخدم هوائي ترددات لاسلكية قريب المدى لبث أوامر MICS غير موثقة لتعطيل صدمات القلب المنقذة للحياة.',
    patientImpact: 'Induced Ventricular Fibrillation / Cardiac Arrest',
    patientImpactAr: 'إحداث رجفان بطيني حرج وتوقف عضلة القلب',
  },
  {
    id: 'MED-02',
    nameEn: 'Continuous Glucose Monitor (CGM) BLE Lethal Bolus Injection',
    nameAr: 'حقن جرعة إنسولين قاتلة عبر اختراق اتصال البلوتوث BLE للمضخة',
    deviceType: 'SMART_INSULIN_PUMP',
    rfProtocol: 'Bluetooth Low Energy (BLE 5.0 - Legacy Just Works Pairing)',
    cveId: 'CVE-2019-10964 (Unrestricted BLE Bolus Delivery Service)',
    vulnerablePayload: 'BLE_GATT_WRITE: UUID=0x1808 (Glucose Char) VAL=0xFFFF -> OVERRIDE_BOLUS(25.0 Units)',
    descriptionEn: 'Eavesdropping on cleartext BLE pairing permits forging continuous insulin delivery packets, injecting 25 units of fast-acting insulin.',
    descriptionAr: 'التنصت على اقتران BLE غير المشفر يتيح تزوير حزم البلوتوث وحقن جرعة إنسولين فائقة وقاتلة.',
    patientImpact: 'Severe Hypoglycemic Shock & Coma',
    patientImpactAr: 'صدمة نقص سكر الدم الحادة والغيبوبة الفورية',
  },
  {
    id: 'MED-03',
    nameEn: 'ICU IV Infusion Pump DERS Limit Tampering via Hospital Wi-Fi',
    nameAr: 'التلاعب بحدود مضخة المحاليل الوريدية DERS عبر شبكة المستشفى',
    deviceType: 'SMART_INFUSION_PUMP',
    rfProtocol: 'IEEE 802.11 b/g/n Hospital Subnet (Cleartext HTTP Drug Library)',
    cveId: 'CVE-2021-38402 (Unsigned Firmware & DERS Drug Library Tamper)',
    vulnerablePayload: 'HTTP_POST /api/drug_library [Morphine Sulfate: Max_Rate_ml_hr changed from 2.0 to 100.0]',
    descriptionEn: 'Intercepting unencrypted drug library updates over hospital Wi-Fi removes Dose Error Reduction System (DERS) upper safety caps.',
    descriptionAr: 'اعتراض تحديثات مكتبة الأدوية غير المشفرة عبر واي فاي المستشفى يلغي حدود الأمان القصوى لمخدر المورفين.',
    patientImpact: 'Fatal Narcotic Overdose & Respiratory Depression',
    patientImpactAr: 'تسمم دوائي مفرط وفشل حاد في الجهاز التنفسي',
  },
];

export const IoMTMedicalDeviceLab: React.FC<IoMTMedicalDeviceLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('MED-01');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [telemetryLog, setTelemetryLog] = useState<{
    status: 'IOMT_ATTACK_MITIGATED' | 'CRITICAL_PATIENT_VITAL_BREACH';
    rfTelemetry: string;
    clinicalAssessment: string;
    activeDefenses: string[];
  } | null>(null);

  // Clinical IoMT Defenses
  const [defenseHardwareFailsafe, setDefenseHardwareFailsafe] = useState<boolean>(false);
  const [defenseAesCcmEncryption, setDefenseAesCcmEncryption] = useState<boolean>(false);
  const [defenseMutualAuthPki, setDefenseMutualAuthPki] = useState<boolean>(false);

  const scenario = useMemo(
    () => MEDICAL_SCENARIOS.find((m) => m.id === selectedScenarioId) || MEDICAL_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTriggerMedicalAttack = () => {
    setIsTransmitting(true);
    setTelemetryLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.deviceType === 'IMPLANTABLE_PACEMAKER') {
        if (defenseMutualAuthPki) {
          activeDefenses.push('MICS Band Mutual PKI Authentication: Unauthenticated RF Pacing Frame Rejected');
          isBlocked = true;
        } else if (defenseHardwareFailsafe) {
          activeDefenses.push('Analog Cardiac Hardware Failsafe: Hardwired minimum 40 BPM pace maintained regardless of RF');
          isBlocked = true;
        }
      } else if (scenario.deviceType === 'SMART_INSULIN_PUMP') {
        if (defenseAesCcmEncryption) {
          activeDefenses.push('BLE AES-128-CCM Authenticated Encryption: Nonce mismatch, rogue GATT bolus command dropped');
          isBlocked = true;
        } else if (defenseHardwareFailsafe) {
          activeDefenses.push('Micro-stepper Physical Dose Governor: Maximum single bolus capped at 2.5 Units mechanically');
          isBlocked = true;
        }
      } else if (scenario.deviceType === 'SMART_INFUSION_PUMP') {
        if (defenseMutualAuthPki) {
          activeDefenses.push('Signed DERS Drug Library Verification: Hash mismatch on modified library, rollback triggered');
          isBlocked = true;
        } else if (defenseHardwareFailsafe) {
          activeDefenses.push('Independent Flow-Rate Optical Sensor: Excess flow (>10ml/hr) mechanically clamped');
          isBlocked = true;
        }
      }

      if (isBlocked) {
        setTelemetryLog({
          status: 'IOMT_ATTACK_MITIGATED',
          rfTelemetry: isAr
            ? '[تم إحباط الهجوم الطبي وحماية المريض] تم رفض الحزمة الخبيثة عبر التشفير الموثوق أو الحماية الفيزيائية.'
            : '[IOMT CYBER ATTACK MITIGATED] Hardware failsafe or encrypted RF validation rejected malicious frame.',
          clinicalAssessment: isAr
            ? 'المؤشرات الحيوية للمريض مستقرة بنسبة 100%. لم يتم تمرير أي جرعة غير مصرح بها أو تعطيل لنبضات القلب.'
            : 'Patient vitals 100% stable. Zero unauthorized dosing or pacing inhibition occurred.',
          activeDefenses,
        });
      } else {
        setTelemetryLog({
          status: 'CRITICAL_PATIENT_VITAL_BREACH',
          rfTelemetry: `RF INTERCEPT: ${scenario.vulnerablePayload} [ACCEPTED BY MEDICAL MCU]`,
          clinicalAssessment: isAr
            ? `إنذار طبي حرج: ${scenario.patientImpactAr} نتيجة استجابة الجهاز الطبي للأوامر المزورة!`
            : `CRITICAL PATIENT THREAT: ${scenario.patientImpact} due to device executing spoofed telemetry!`,
          activeDefenses: [],
        });
      }

      setIsTransmitting(false);
    }, 450);
  };

  const handleResetDevice = () => {
    setTelemetryLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr
                ? 'مختبر أمان الأجهزة الطبية الحيوية وإنترنت الأشياء الطبية (IoMT & Medical Cybersecurity)'
                : 'IoMT Medical Device Cybersecurity & Bio-Telemetry Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800 rounded-full font-mono">
                FDA Cybersecurity / ISO 14971
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة متقدمة لهجمات التردد اللاسلكي والبلوتوث على منظمات القلب ومضخات الإنسولين والمحاليل، وحمايتها فيزيائياً وتشفيرياً.'
                : 'Simulate RF/BLE attacks against pacemakers, insulin pumps, and IV infusion devices, validating life-critical failsafes.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDevice}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط القياسات الطبية' : 'Reset Bio-Telemetry'}
        </button>
      </div>

      {/* Main Grid: Left Scenario Selector & Defenses, Right Telemetry & Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Device Scenarios & Medical Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Syringe className="w-4 h-4 text-rose-400" />
            {isAr ? 'الأجهزة الطبية المستهدفة بالهجوم' : 'Life-Critical Medical Device Targets'}
          </h3>

          <div className="space-y-2">
            {MEDICAL_SCENARIOS.map((ms) => {
              const isSelected = ms.id === selectedScenarioId;
              return (
                <button
                  key={ms.id}
                  onClick={() => {
                    setSelectedScenarioId(ms.id);
                    setTelemetryLog(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500/80 text-rose-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400">{ms.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {ms.deviceType}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? ms.nameAr : ms.nameEn}</span>
                  <div className="text-[10px] text-amber-400 font-mono">{ms.cveId}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? ms.descriptionAr : ms.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Clinical IoMT Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'حواجز الحماية والتشفير الطبي' : 'Bio-Cyber Defense & Hardening Levers'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'صمامات الأمان الفيزيائية المستقلة (Hardware Failsafe)' : 'Analog Hardware Failsafe & Physical Dose Limiters'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseHardwareFailsafe}
                  onChange={(e) => setDefenseHardwareFailsafe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تشفير الاتصال الطبي BLE بـ AES-128-CCM مع Rolling Nonce' : 'BLE AES-128-CCM Authenticated Encryption'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseAesCcmEncryption}
                  onChange={(e) => setDefenseAesCcmEncryption(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'التوثيق المتبادل بشهادات PKI للأجهزة والتحقق من التوقيع' : 'Mutual PKI Authentication & Signed Drug Libraries'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseMutualAuthPki}
                  onChange={(e) => setDefenseMutualAuthPki(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: RF Telemetry & Patient Vitals */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              {isAr ? 'شاشة الإشارات الحيوية والتردد اللاسلكي RF' : 'Patient Bio-Telemetry & RF Inspection'}
            </h3>
            <button
              onClick={handleTriggerMedicalAttack}
              disabled={isTransmitting}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-rose-400/30 disabled:opacity-50"
            >
              {isTransmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'بث الهجوم اللاسلكي على الجهاز الطبي' : 'Transmit Malicious Medical RF Frame'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'بروتوكول البث اللاسلكي RF:' : 'Wireless RF Protocol:'}</span>
              <span className="text-rose-400 font-bold">{scenario.rfProtocol}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الأثر السريري المحتمل على المريض:' : 'Clinical Impact on Patient:'}</span>
              <span className="text-amber-400 font-bold">{isAr ? scenario.patientImpactAr : scenario.patientImpact}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'حمولة الأوامر اللاسلكية المزورة:' : 'Spoofed Telemetry Command:'}</span>
            <pre className="p-2 bg-slate-900 border border-slate-800 text-rose-300 rounded text-[11px] overflow-x-auto">
              {scenario.vulnerablePayload}
            </pre>
          </div>

          {/* Telemetry Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشخيص الجهاز الطبي الحيوي' : 'Medical Device Diagnostics & Vitals'}</span>
            </div>

            {telemetryLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    telemetryLog.status === 'IOMT_ATTACK_MITIGATED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {telemetryLog.status === 'IOMT_ATTACK_MITIGATED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'الهجوم الطبي محبط بالكامل' : 'CLINICAL DEFENSES ENGAGED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'خطر سريري حرج على حياة المريض!' : 'CRITICAL PATIENT VITAL BREACH'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{telemetryLog.rfTelemetry}</p>
                  <p className="text-[11px] mt-1 font-semibold text-amber-300">{telemetryLog.clinicalAssessment}</p>
                </div>

                {telemetryLog.activeDefenses.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {isAr ? 'الدروع الطبية المفعلة بنجاح:' : 'Active Medical Countermeasures:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {telemetryLog.activeDefenses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Heart className="w-8 h-8 mb-2 opacity-30 text-rose-500" />
                <p>
                  {isAr
                    ? 'الجهاز الطبي قيد المراقبة المستمرة. اضغط "بث الهجوم اللاسلكي" لاختبار سلامة المريض والحواجز الدفاعية.'
                    : 'Device telemetry active. Click "Transmit Malicious Medical RF Frame" to evaluate patient safety failsafes.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
