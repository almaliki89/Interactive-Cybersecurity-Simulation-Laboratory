import React, { useState, useMemo } from 'react';
import {
  Compass,
  Radio,
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
  Anchor,
  Globe,
} from 'lucide-react';

interface MaritimeSecurityLabProps {
  language?: 'ar' | 'en';
}

interface MaritimeScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'AIS_PHANTOM' | 'NMEA2000_HELM_TAMPER' | 'ECDIS_MAP_SPOOF';
  pgnOrSentence: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const MARITIME_SCENARIOS: MaritimeScenario[] = [
  {
    id: 'MAR-01',
    nameEn: 'AIS Phantom Vessel Ghost Fleet Injection',
    nameAr: 'حقن أسطول أشباح سفن وهمية ببروتوكول AIS',
    category: 'AIS_PHANTOM',
    pgnOrSentence: '!AIVDM,1,1,,A,133sP00P00a0?a<A9e:000000000,0*1C (MMSI: 338001928, Speed: 24kts, Collision Warning)',
    descriptionEn: 'SDR transmitter floods VHF maritime band with synthetic AIS targets to trigger false TCAS collision alerts on bridge ECDIS.',
    descriptionAr: 'جهاز بث لاسلكي يغرق نطاق البحرية ببيانات سفن وهمية لإحداث إنذارات تصادم كاذبة لشاشات الملاحة.',
    isThreat: true,
  },
  {
    id: 'MAR-02',
    nameEn: 'NMEA 2000 CAN Bus Rudder Steering Override',
    nameAr: 'التلاعب بناقل NMEA 2000 لتغيير توجيه مقود السفينة',
    category: 'NMEA2000_HELM_TAMPER',
    pgnOrSentence: 'CAN ID 0x0DF00102 [PGN 127245 Rudder Command: Force Angle +35° HARD STARBOARD]',
    descriptionEn: 'Malicious CAN bus payload injected into NMEA 2000 vessel network forces autopilot rudder to hard starboard at full speed.',
    descriptionAr: 'حزمة معاداة محقونة بناقل CAN السفينة تجبر التوجيه التلقائي على الانحراف الأقصى بسرعة عالية.',
    isThreat: true,
  },
  {
    id: 'MAR-03',
    nameEn: 'ECDIS Electronic Chart Vector Tampering',
    nameAr: 'التلاعب ببيانات الخرائط البحرية الإلكترونية ECDIS',
    category: 'ECDIS_MAP_SPOOF',
    pgnOrSentence: 'S-57 ENC Chart Patch [Shallow Reef Hazard 0x44 Deleted, Safe Depth +15m Added]',
    descriptionEn: 'Malware modifies S-57 electronic navigation chart files on bridge computer to erase dangerous shallow reef hazards.',
    descriptionAr: 'برمجية خبيثة تعدل ملفات الخرائط الملاحية لإخفاء الشعب المرجانية الخطرة وجرف السفينة.',
    isThreat: true,
  },
];

export const MaritimeSecurityLab: React.FC<MaritimeSecurityLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('MAR-01');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [maritimeLog, setMaritimeLog] = useState<{
    status: 'PROTECTED_BY_MARITIME_SEC' | 'VESSEL_NAVIGATION_EXPLOITED';
    details: string;
    vesselStatus: string;
    activeDefenses: string[];
  } | null>(null);

  // Maritime Security Controls
  const [defenseAisPlausibilityCheck, setDefenseAisPlausibilityCheck] = useState<boolean>(false);
  const [defenseNmea2000CanAuth, setDefenseNmea2000CanAuth] = useState<boolean>(false);
  const [defenseEcdisChartSignature, setDefenseEcdisChartSignature] = useState<boolean>(false);

  const scenario = useMemo(
    () => MARITIME_SCENARIOS.find((m) => m.id === selectedScenarioId) || MARITIME_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTransmitMaritimePayload = () => {
    setIsTransmitting(true);
    setMaritimeLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'AIS_PHANTOM' && defenseAisPlausibilityCheck) {
        activeDefenses.push('AIS Radar Co-location & Satellite Kinematic Plausibility Filter');
        isBlocked = true;
      } else if (scenario.category === 'NMEA2000_HELM_TAMPER' && defenseNmea2000CanAuth) {
        activeDefenses.push('NMEA 2000 CAN Bus Message HMAC Counter Verification');
        isBlocked = true;
      } else if (scenario.category === 'ECDIS_MAP_SPOOF' && defenseEcdisChartSignature) {
        activeDefenses.push('IHO S-63 Encrypted Chart Cryptographic Signature Verification');
        isBlocked = true;
      }

      if (isBlocked) {
        setMaritimeLog({
          status: 'PROTECTED_BY_MARITIME_SEC',
          details: isAr
            ? 'تم حظر الهجوم البحري بنجاح وحماية أنظمة توجيه السفينة!'
            : 'MARITIME SECURITY DEFENSE ACTIVE: Forged CAN packet or phantom AIS target rejected.',
          vesselStatus: isAr
            ? 'السفينة في المسار الصحيح والآمن. تم إلغاء الأوامر الملوثة عبر الشفرات.'
            : 'Vessel on safe course. Autopilot & ECDIS chart integrity verified.',
          activeDefenses,
        });
      } else {
        setMaritimeLog({
          status: 'VESSEL_NAVIGATION_EXPLOITED',
          details: isAr
            ? 'تحذير: تم تغيير توجيه السفينة أو خرق الخرائط البحرية لغياب الحماية!'
            : 'CRITICAL MARITIME INCIDENT EXPLOITED: Rudder hard starboard override or false chart hazards injected!',
          vesselStatus: isAr
            ? `[تأثر نظام توجيه السفينة!] ${scenario.pgnOrSentence}`
            : `[VESSEL HELM COMPROMISED] ${scenario.pgnOrSentence}`,
          activeDefenses: [],
        });
      }

      setIsTransmitting(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان السفن والأنظمة البحرية الذكية (Maritime & Vessel Security)' : 'Maritime & Autonomous Vessel System Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 rounded-full font-mono">
                NMEA 2000 / AIS / ECDIS
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لهجمات تلاعب توجيه المقود عبر NMEA 2000، وسفن الأشباح AIS، وتزوير الخرائط البحرية.'
                : 'Interactive NMEA 2000 CAN bus helm security, AIS phantom vessel detection, and ECDIS chart signatures.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'أنظمة السفينة:' : 'Vessel Bridge System:'}</span>
          <span className="px-2 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded font-bold">
            AUTOPILOT / ECDIS ONLINE
          </span>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selector + Maritime Telemetry Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات التهديدات البحرية' : 'Maritime Threat Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {MARITIME_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 text-slate-100 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{sc.id}</span>
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

          {/* Maritime Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع أمان أنظمة السفينة (Maritime Bridge Defenses)' : 'Maritime Security Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'فحص منطقية حركيات أهداف AIS بالرادار' : 'AIS Kinematic Plausibility Radar Filter'}</span>
                <input
                  type="checkbox"
                  checked={defenseAisPlausibilityCheck}
                  onChange={(e) => setDefenseAisPlausibilityCheck(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'مصادقة حزم ناقل NMEA 2000 CAN' : 'NMEA 2000 CAN Bus Message Authentication'}</span>
                <input
                  type="checkbox"
                  checked={defenseNmea2000CanAuth}
                  onChange={(e) => setDefenseNmea2000CanAuth(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'التدقيق الرقمي لخرائط IHO S-63 ECDIS' : 'IHO S-63 Encrypted Chart Signatures'}</span>
                <input
                  type="checkbox"
                  checked={defenseEcdisChartSignature}
                  onChange={(e) => setDefenseEcdisChartSignature(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Maritime Protocol Frame & Telemetry Screen */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              {isAr ? 'فحص حزمة النواقل والملاحة البحرية' : 'Maritime Protocol Frame Inspector'}
            </h3>
            <button
              onClick={handleTransmitMaritimePayload}
              disabled={isTransmitting}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-cyan-400/30 disabled:opacity-50"
            >
              {isTransmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5 text-cyan-300" />}
              {isAr ? 'بث الحزمة البحرية' : 'Transmit Marine Payload'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-2">
            <span className="text-slate-400 font-bold block">{isAr ? 'حزمة النواقل أو جملة AIS:' : 'Maritime NMEA Sentence / CAN Frame:'}</span>
            <pre className="p-2.5 bg-slate-900 border border-slate-800 text-cyan-300 rounded text-[11px] overflow-x-auto">
              {scenario.pgnOrSentence}
            </pre>
          </div>

          {/* Telemetry Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل شاشة الملاحة والقيادة البحرية' : 'Bridge Navigation Telemetry Stream'}</span>
            </div>

            {maritimeLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    maritimeLog.status === 'PROTECTED_BY_MARITIME_SEC'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {maritimeLog.status === 'PROTECTED_BY_MARITIME_SEC' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم حماية السفينة وأنظمة التوجيه' : 'MARITIME SECURITY DEFENSE ACTIVE'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: اختراق أنظمة توجيه أو خرائط السفينة!' : 'CRITICAL MARITIME SYSTEM EXPLOITED'}</span>
                      </>
                    )}
                  </div>
                  {maritimeLog.details}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {maritimeLog.vesselStatus}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Anchor className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "بث الحزمة البحرية" لمعاينة الاستجابة.'
                    : 'Select a maritime scenario and click "Transmit Marine Payload".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
