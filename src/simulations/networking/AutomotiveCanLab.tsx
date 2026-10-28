import React, { useState, useMemo } from 'react';
import {
  Car,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Gauge,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Radio,
  Cpu,
} from 'lucide-react';

interface AutomotiveCanLabProps {
  language?: 'ar' | 'en';
}

interface CanScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'ABS_OVERRIDE' | 'THROTTLE_HIJACK' | 'V2X_SPOOF';
  arbitrationIdHex: string;
  dlc: number;
  payloadHex: string;
  targetEcu: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const CAN_SCENARIOS: CanScenario[] = [
  {
    id: 'CAN-01',
    nameEn: 'Emergency Brake (ABS) Invalidation & Release',
    nameAr: 'إلغاء مكابح الطوارئ ABS وتحرير الفرامل إلكترونياً',
    category: 'ABS_OVERRIDE',
    arbitrationIdHex: '0x1A0',
    dlc: 8,
    payloadHex: '00 00 00 00 00 00 00 00',
    targetEcu: 'ABS Controller ECU (Powertrain Bus)',
    descriptionEn: 'Attacker injects forged ABS packets via compromised OBD-II port, forcing brake calipers to release during high-speed emergency stop.',
    descriptionAr: 'المهاجم يحقن حزم ABS مزيفة عبر منفذ OBD-II لإجبار المكابح على الانفلات أثناء التوقف الطارئ.',
    isThreat: true,
  },
  {
    id: 'CAN-02',
    nameEn: 'Unintended Acceleration / Throttle Hijack',
    nameAr: 'التسارع المفاجئ وخطف دواسة الوقود',
    category: 'THROTTLE_HIJACK',
    arbitrationIdHex: '0x0C9',
    dlc: 8,
    payloadHex: 'FF A0 00 00 00 00 00 00',
    targetEcu: 'ECM Engine Control Module',
    descriptionEn: 'Flooding the CAN bus with high-priority engine control messages to lock the electronic throttle valve at 100% open.',
    descriptionAr: 'إغراق ناقل CAN بحزم تحكم محرك عالية الأولوية لقفل صمام الوقود عند نسبة 100% تسارع.',
    isThreat: true,
  },
  {
    id: 'CAN-03',
    nameEn: 'V2X Emergency Crash Warning Spoofing',
    nameAr: 'تزييف إشارات التحذير من التصادم عبر شبكات V2X',
    category: 'V2X_SPOOF',
    arbitrationIdHex: '0x480',
    dlc: 8,
    payloadHex: 'DENM_CRASH_ALERT_SEVERITY_MAX_BROADCAST',
    targetEcu: 'V2X DSRC / C-V2X Transceiver',
    descriptionEn: 'Adversary broadcasts synthetic V2X Decentralized Environmental Notification Messages (DENM) to trigger ghost braking on autonomous fleets.',
    descriptionAr: 'المهاجم يبث رسائل تحذير تصادم مزيفة عبر V2X مما يجبر أساطيل السيارات ذاتية القيادة على التوقف الفجائي الوهمي.',
    isThreat: true,
  },
];

export const AutomotiveCanLab: React.FC<AutomotiveCanLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('CAN-01');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  // Vehicle Status Telemetry
  const [vehicleSpeedKmh, setVehicleSpeedKmh] = useState<number>(100);
  const [brakeEngaged, setBrakeEngaged] = useState<boolean>(true);
  const [throttlePct, setThrottlePct] = useState<number>(15);

  const [canLog, setCanLog] = useState<{
    status: 'PROTECTED_BY_SECOC' | 'VEHICLE_COMPROMISED_EXPLOITED';
    details: string;
    vehicleStateReport: string;
    activeDefenses: string[];
  } | null>(null);

  // Automotive Security Defenses
  const [defenseSecOcAuth, setDefenseSecOcAuth] = useState<boolean>(false);
  const [defenseAutomotiveIdps, setDefenseAutomotiveIdps] = useState<boolean>(false);
  const [defenseGatewayAirgap, setDefenseGatewayAirgap] = useState<boolean>(false);

  const scenario = useMemo(
    () => CAN_SCENARIOS.find((c) => c.id === selectedScenarioId) || CAN_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTransmitCanFrame = () => {
    setIsTransmitting(true);
    setCanLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'ABS_OVERRIDE' && defenseSecOcAuth) {
        activeDefenses.push('AUTOSAR SecOC: AES-128 CMAC Tag & Freshness Value Counter (FVC)');
        isBlocked = true;
      } else if (scenario.category === 'THROTTLE_HIJACK' && defenseAutomotiveIdps) {
        activeDefenses.push('Automotive IDPS: Bus Frequency Anomaly & Dominant Arbitration ID Drop');
        isBlocked = true;
      } else if (scenario.category === 'V2X_SPOOF' && defenseGatewayAirgap) {
        activeDefenses.push('Central Gateway ECU: Hardware Boundary Firewall Isolating IVI/V2X from Powertrain');
        isBlocked = true;
      }

      if (isBlocked) {
        setCanLog({
          status: 'PROTECTED_BY_SECOC',
          details: isAr
            ? 'تم إسقاط الحزمة المعاداة بنجاح بواسطة دفاعات SecOC وجدار حماية السيارة!'
            : 'AUTOMOTIVE DEFENSE ACTIVE: Malicious CAN frame dropped by SecOC cryptographic verification or IDPS.',
          vehicleStateReport: isAr
            ? 'السيارة مستقرة تماماً: استجابت أنظمة المكابح والتوجيه للسلامة بدون انحراف.'
            : 'Vehicle dynamics nominal: Emergency brake responsive, throttle within normal driver demand.',
          activeDefenses,
        });
      } else {
        if (scenario.category === 'ABS_OVERRIDE') {
          setBrakeEngaged(false);
          setVehicleSpeedKmh(125);
        } else if (scenario.category === 'THROTTLE_HIJACK') {
          setThrottlePct(100);
          setVehicleSpeedKmh(160);
        }

        setCanLog({
          status: 'VEHICLE_COMPROMISED_EXPLOITED',
          details: isAr
            ? 'تحذير: تم التلاعب بوحدة التحكم الإلكترونية ECU وتجاوز المكابح/التسارع!'
            : 'CRITICAL VEHICLE SAFETY BREACH: Powertrain CAN hijacked, override executed directly on actuator!',
          vehicleStateReport: isAr
            ? `[انحراف خطير بالمركبة!] تم حقن: ${scenario.arbitrationIdHex} -> ${scenario.payloadHex}`
            : `[VEHICLE COMPROMISED] Injected: ${scenario.arbitrationIdHex} -> ${scenario.payloadHex}`,
          activeDefenses: [],
        });
      }

      setIsTransmitting(false);
    }, 400);
  };

  const handleResetVehicle = () => {
    setVehicleSpeedKmh(100);
    setBrakeEngaged(true);
    setThrottlePct(15);
    setCanLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان المركبات الذكية وشبكات السيارات (Automotive CAN Bus & V2X)' : 'Automotive CAN Bus & Connected Vehicle Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 rounded-full font-mono">
                ISO 21434 / AUTOSAR SecOC
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لهجمات ناقل CAN Bus، والتلاعب بمكابح ABS، والتسارع المفاجئ، وحماية بروتوكول SecOC.'
                : 'Interactive CAN frame injection, emergency brake override, V2X message spoofing, and SecOC authentication.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetVehicle}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط المركبة' : 'Reset Vehicle Dynamics'}
        </button>
      </div>

      {/* Vehicle Telemetry Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'سرعة السيارة الحالية' : 'Vehicle Velocity'}</span>
            <span className={`text-xl font-bold ${vehicleSpeedKmh > 120 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
              {vehicleSpeedKmh} KM/H
            </span>
          </div>
          <Gauge className="w-6 h-6 text-cyan-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'حالة مكابح الطوارئ (ABS)' : 'Emergency ABS State'}</span>
            <span className={`text-sm font-bold ${brakeEngaged ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
              {brakeEngaged ? (isAr ? 'مفعلة وتعمل' : 'ENGAGED & FUNCTIONAL') : (isAr ? 'متحررة! لا استجابة' : 'RELEASED / BYPASSED!')}
            </span>
          </div>
          <Activity className={`w-6 h-6 ${brakeEngaged ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'فتحة صمام الوقود' : 'Electronic Throttle Valve'}</span>
            <span className={`text-xl font-bold ${throttlePct > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {throttlePct}%
            </span>
          </div>
          <Zap className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Main Grid: Attack Vector Selection + CAN Bus Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات اختراق ناقل CAN' : 'Automotive Attack Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {CAN_SCENARIOS.map((sc) => {
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
                      {sc.arbitrationIdHex}
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

          {/* Automotive Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع أمان شبكة المركبة (Automotive Defenses)' : 'Vehicle Security Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'مصادقة AUTOSAR SecOC للتوقيع والتسلسل' : 'AUTOSAR SecOC Message Authentication'}</span>
                <input
                  type="checkbox"
                  checked={defenseSecOcAuth}
                  onChange={(e) => setDefenseSecOcAuth(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'نظام كشف التسلل Automotive IDPS' : 'Automotive CAN Bus IDPS Anomaly Filter'}</span>
                <input
                  type="checkbox"
                  checked={defenseAutomotiveIdps}
                  onChange={(e) => setDefenseAutomotiveIdps(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'عزل بوابة Gateway بين أنظمة الترفيه والمحرك' : 'Gateway ECU Isolation (Airgap IVI/Powertrain)'}</span>
                <input
                  type="checkbox"
                  checked={defenseGatewayAirgap}
                  onChange={(e) => setDefenseGatewayAirgap(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: CAN Frame Inspector & Bus Log */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              {isAr ? 'فحص حزمة ناقل CAN Frame Inspector' : 'CAN Frame Binary Inspector'}
            </h3>
            <button
              onClick={handleTransmitCanFrame}
              disabled={isTransmitting}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-amber-400/30 disabled:opacity-50"
            >
              {isTransmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'حقن حزمة CAN بالناقل' : 'Inject CAN Frame'}
            </button>
          </div>

          {/* Packet Header Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800 pb-1">
              <span>Arbitration ID: <strong className="text-amber-400">{scenario.arbitrationIdHex}</strong></span>
              <span>DLC: <strong className="text-cyan-300">{scenario.dlc} Bytes</strong></span>
              <span>Target: <strong className="text-slate-300">{scenario.targetEcu}</strong></span>
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 text-amber-300 rounded text-center">
              Payload: <strong>{scenario.payloadHex}</strong>
            </div>
          </div>

          {/* Bus Telemetry Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل أحداث ناقل CAN Bus' : 'Powertrain CAN Bus Telemetry Log'}</span>
            </div>

            {canLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    canLog.status === 'PROTECTED_BY_SECOC'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {canLog.status === 'PROTECTED_BY_SECOC' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم حماية المركبة وإسقاط الحزمة المعاداة' : 'AUTOMOTIVE ATTACK SAFELY BLOCKED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم اختراق ناقل المركبة وتغيير الأوامر!' : 'CRITICAL POWERTRAIN CAN BREACH!'}</span>
                      </>
                    )}
                  </div>
                  {canLog.details}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {canLog.vehicleStateReport}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Car className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر هجوماً وانقر على "حقن حزمة CAN بالناقل" لاختبار ديناميكيات المركبة ودفاعات SecOC.'
                    : 'Select a CAN attack vector and click "Inject CAN Frame".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
