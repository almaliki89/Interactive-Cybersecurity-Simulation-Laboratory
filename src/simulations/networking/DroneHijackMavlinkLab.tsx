import React, { useState, useMemo } from 'react';
import {
  Navigation,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Compass,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Plane,
  Wind,
  Target,
  Cpu,
  Crosshair,
} from 'lucide-react';

interface DroneHijackMavlinkLabProps {
  language?: 'ar' | 'en';
}

interface DroneScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  uavType: 'QUADCOPTER_SURVEILLANCE' | 'FIXED_WING_CARGO' | 'MILITARY_LOITERING';
  protocol: 'MAVLink v2.0' | 'UAVCAN';
  hijackVector: string;
  descriptionEn: string;
  descriptionAr: string;
  missionFailure: string;
  missionFailureAr: string;
}

const DRONE_SCENARIOS: DroneScenario[] = [
  {
    id: 'UAV-01',
    nameEn: 'MAVLink Command Injection (Forced Crash / Kill-Switch)',
    nameAr: 'حقن أوامر MAVLink لإسقاط الطائرة أو تفعيل مفتاح القتل',
    uavType: 'QUADCOPTER_SURVEILLANCE',
    protocol: 'MAVLink v2.0',
    hijackVector: 'Transmitting unauthenticated MAV_CMD_COMPONENT_ARM_DISARM with force=1 via rogue ground station.',
    descriptionEn: 'Exploiting lack of link-layer signing to disarm drone motors while at 200m altitude, causing total kinetic loss.',
    descriptionAr: 'استغلال غياب التوقيع الرقمي للأوامر لإيقاف محركات الطائرة أثناء الطيران على ارتفاع 200 متر مما يؤدي لسقوطها.',
    missionFailure: 'Total Kinetic Destruction & Asset Loss',
    missionFailureAr: 'تحطم كامل للطائرة وفقدان الأصل الجوي',
  },
  {
    id: 'UAV-02',
    nameEn: 'GCS Telemetry Hijack & Waypoint Redirection (Kidnapping)',
    nameAr: 'اختراق القيادة الأرضية وتحويل مسار النقاط (اختطاف الطائرة)',
    uavType: 'FIXED_WING_CARGO',
    protocol: 'MAVLink v2.0',
    hijackVector: 'Injecting MAV_CMD_DO_REPOSITION frames to slew GPS waypoints toward adversary recovery zone.',
    descriptionEn: 'Intercepting and spoofing telemetry feedback to the operator while silently altering the flight path to a rogue landing site.',
    descriptionAr: 'اعتراض وتزييف بيانات التلمتري للمشغل مع تغيير مسار الطيران بصمت نحو منطقة هبوط تابعة للعدو.',
    missionFailure: 'Asset Hijacking & Sensitive Payload Theft',
    missionFailureAr: 'اختطاف الطائرة وسرقة الحمولة الحساسة',
  },
  {
    id: 'UAV-03',
    nameEn: 'MAVLink Heartbeat Denial of Service (RTH Trigger)',
    nameAr: 'حجب خدمة نبضات القلب لإجبار الطائرة على العودة (RTH)',
    uavType: 'MILITARY_LOITERING',
    protocol: 'MAVLink v2.0',
    hijackVector: 'Flooding telemetry radio with high-power RF noise to disrupt MAVLink HEARTBEAT messages.',
    descriptionEn: 'Triggering Failsafe Return-to-Home (RTH) by jamming the C2 link, revealing the launch site position to the adversary.',
    descriptionAr: 'تفعيل آلية العودة الآلية للمنزل عبر التشويش على وصلة التحكم، مما يكشف موقع منصة الإطلاق للعدو.',
    missionFailure: 'Launch Site Location Compromise (OPSEC Failure)',
    missionFailureAr: 'انكشاف موقع منصة الإطلاق وفشل السرية العملياتية',
  },
];

export const DroneHijackMavlinkLab: React.FC<DroneHijackMavlinkLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('UAV-01');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [uavLog, setUavLog] = useState<{
    status: 'MISSION_PROTECTED' | 'FLIGHT_CONTROL_HIJACKED';
    uavTelemetry: string;
    flightStatus: string;
    activeDefenses: string[];
  } | null>(null);

  // Drone Hardening Defenses
  const [defenseMavlinkSigning, setDefenseMavlinkSigning] = useState<boolean>(false);
  const [defenseHoppingSpreadSpectrum, setDefenseHoppingSpreadSpectrum] = useState<boolean>(false);
  const [defenseHardwareEncryptedC2, setDefenseHardwareEncryptedC2] = useState<boolean>(false);

  const scenario = useMemo(
    () => DRONE_SCENARIOS.find((s) => s.id === selectedScenarioId) || DRONE_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTriggerDroneStrike = () => {
    setIsTransmitting(true);
    setUavLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (defenseHardwareEncryptedC2) {
        activeDefenses.push('AES-256 Hardware Encrypted C2 Link: Rogue radio frames rejected at physical layer');
        isBlocked = true;
      } else if (defenseMavlinkSigning && (scenario.id === 'UAV-01' || scenario.id === 'UAV-02')) {
        activeDefenses.push('MAVLink v2.0 Message Signing: HMAC-SHA256 signature mismatch on rogue command');
        isBlocked = true;
      } else if (defenseHoppingSpreadSpectrum && scenario.id === 'UAV-03') {
        activeDefenses.push('FHSS (Frequency Hopping): C2 link evaded narrowband jamming noise');
        isBlocked = true;
      }

      if (isBlocked) {
        setUavLog({
          status: 'MISSION_PROTECTED',
          uavTelemetry: isAr
            ? '[تم إحباط محاولة اختطاف الدرون] التوقيع الرقمي أو التشفير العتادي رفض الأوامر المزورة.'
            : '[DRONE HIJACK ATTEMPT NEUTRALIZED] Digital signing or encrypted C2 link rejected rogue commands.',
          flightStatus: isAr
            ? 'الطائرة مستقرة وتتبع المسار العملياتي الأصلي. تم حظر التحكم غير المصرح به.'
            : 'UAV stable on original operational flight path. Unauthorized override blocked.',
          activeDefenses,
        });
      } else {
        setUavLog({
          status: 'FLIGHT_CONTROL_HIJACKED',
          uavTelemetry: `C2 OVERRIDE: ${scenario.hijackVector} [ACCEPTED BY FCU]`,
          flightStatus: isAr
            ? `إنذار جوي حرج: ${scenario.missionFailureAr} نتيجة اختراق وصلة القيادة!`
            : `CRITICAL AIRSPACE BREACH: ${scenario.missionFailure} due to successful C2 hijack!`,
          activeDefenses: [],
        });
      }

      setIsTransmitting(false);
    }, 450);
  };

  const handleResetUav = () => {
    setUavLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr
                ? 'مختبر اختطاف الدرونز وحقن بروتوكول MAVLink (Drone Hijacking & MAVLink Lab)'
                : 'Drone Hijacking & MAVLink Protocol Injection Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800 rounded-full font-mono">
                PX4 / ArduPilot / Electronic Warfare
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة اختراق وصلات التحكم C2 للدرونز، حقن أوامر الهبوط الاضطراري، وتزييف المسار، مع تفعيل دفاعات التوقيع الرقمي MAVLink Signing.'
                : 'Simulate C2 link hijacking, emergency kill-switch injection, and waypoint slewing with MAVLink message signing defenses.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetUav}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط تلمتري الطائرة' : 'Reset Drone Telemetry'}
        </button>
      </div>

      {/* Main Grid: Left Scenario Selector & Defenses, Right Flight Telemetry & 3D Vector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Drone Scenarios & Hardening */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Plane className="w-4 h-4 text-rose-400" />
            {isAr ? 'أهداف اختراق الأنظمة المسيرة' : 'Tactical Drone Hijack Scenarios'}
          </h3>

          <div className="space-y-2">
            {DRONE_SCENARIOS.map((ds) => {
              const isSelected = ds.id === selectedScenarioId;
              return (
                <button
                  key={ds.id}
                  onClick={() => {
                    setSelectedScenarioId(ds.id);
                    setUavLog(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500/80 text-rose-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400">{ds.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {ds.uavType}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? ds.nameAr : ds.nameEn}</span>
                  <div className="text-[10px] text-amber-400 font-mono">{ds.protocol}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? ds.descriptionAr : ds.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Drone Hardening Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'تحصين وصلات التحكم والملاحة' : 'UAV Link Hardening & Defenses'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تفعيل التوقيع الرقمي MAVLink v2 Message Signing' : 'MAVLink v2.0 Cryptographic Signing'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseMavlinkSigning}
                  onChange={(e) => setDefenseMavlinkSigning(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تقنية القفز الترددي FHSS لمكافحة التشويش' : 'FHSS Frequency Hopping Spread Spectrum'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseHoppingSpreadSpectrum}
                  onChange={(e) => setDefenseHoppingSpreadSpectrum(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تشفير وصلة C2 عتادياً بمعيار AES-256' : 'Hardwired AES-256 Link Encryption'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseHardwareEncryptedC2}
                  onChange={(e) => setDefenseHardwareEncryptedC2(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Flight Telemetry & Command Console */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-rose-400" />
              {isAr ? 'شاشة مراقبة طيران الدرون والقيادة' : 'UAV Flight Telemetry & Command Inspection'}
            </h3>
            <button
              onClick={handleTriggerDroneStrike}
              disabled={isTransmitting}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-rose-400/30 disabled:opacity-50"
            >
              {isTransmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {isAr ? 'بث حمولة الاختطاف اللاسلكية' : 'Transmit Rogue MAVLink Hijack'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'تردد الراديو وبروتوكول الملاحة:' : 'RF Band & Navigation Protocol:'}</span>
              <span className="text-rose-400 font-bold">915 MHz / {scenario.protocol}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الفشل العملياتي المتوقع:' : 'Operational Mission Failure:'}</span>
              <span className="text-amber-400 font-bold">{isAr ? scenario.missionFailureAr : scenario.missionFailure}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'حقن الأوامر التكتيكية (MAV_CMD):' : 'Tactical Command Injection (MAV_CMD):'}</span>
            <pre className="p-2 bg-slate-900 border border-slate-800 text-rose-300 rounded text-[11px] overflow-x-auto leading-relaxed">
              {scenario.hijackVector}
            </pre>
          </div>

          {/* UAV Diagnostics Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشخيص وحدة التحكم في الطيران (FCU)' : 'UAV Flight Controller (FCU) Diagnostic Stream'}</span>
            </div>

            {uavLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    uavLog.status === 'MISSION_PROTECTED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {uavLog.status === 'MISSION_PROTECTED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم حماية المهمة الجوية بنجاح' : 'FLIGHT INTEGRITY PROTECTED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'اختراق جوي حرج - فقدان السيطرة!' : 'CRITICAL FLIGHT CONTROL LOSS'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{uavLog.uavTelemetry}</p>
                  <p className="text-[11px] mt-1 font-semibold text-amber-300">{uavLog.flightStatus}</p>
                </div>

                {uavLog.activeDefenses.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {isAr ? 'أنظمة مكافحة الحرب الإلكترونية المفعلة:' : 'Electronic Counter-Countermeasures (ECCM):'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {uavLog.activeDefenses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Wind className="w-8 h-8 mb-2 opacity-30 text-rose-500" />
                <p>
                  {isAr
                    ? 'وصلة التحكم في الطيران مستقرة. اضغط "بث حمولة الاختطاف" لاختبار متانة التوقيع الرقمي MAVLink.'
                    : 'UAV Command link active. Click "Transmit Rogue MAVLink Hijack" to test cryptographic signing resilience.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
