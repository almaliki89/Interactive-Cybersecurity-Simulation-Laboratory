import React, { useState, useMemo } from 'react';
import {
  Globe,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Compass,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Server,
  Satellite,
} from 'lucide-react';

interface AerospaceSatelliteLabProps {
  language?: 'ar' | 'en';
}

interface SatelliteScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'TELECOMMAND_SPOOF' | 'GNSS_SPOOF' | 'DOWNLINK_JAMMING';
  targetComponent?: string;
  spacecraftId?: number;
  ccsdsFrameHex: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const SATELLITE_SCENARIOS: SatelliteScenario[] = [
  {
    id: 'SAT-01',
    nameEn: 'Unauthenticated Telecommand (TC) Injection',
    nameAr: 'حقن الأوامر اللاسلكية غير المصرح بها للأقمار الصناعية',
    category: 'TELECOMMAND_SPOOF',
    spacecraftId: 0x0042,
    ccsdsFrameHex: '2000 0042 010A 01 05 [Payload: FIRING_THRUSTER_B_ORBITAL_DECAY]',
    descriptionEn: 'Rogue ground station transmits forged CCSDS telecommand frame to fire RCS thrusters, inducing attitude instability and orbital decay.',
    descriptionAr: 'محطة أرضية معاداة ترسل إطار أوامر CCSDS غير مشفر لتشغيل الدفعات المحركة وزعزعة مدار القمر الصناعي.',
    isThreat: true,
  },
  {
    id: 'SAT-02',
    nameEn: 'GNSS / GPS Ephemeris Signal Spoofing',
    nameAr: 'تزييف إشارات ملاحة GPS وخطوط مدارات الأقمار',
    category: 'GNSS_SPOOF',
    targetComponent: 'Aircraft / UAV Navigation Receiver',
    ccsdsFrameHex: 'GPS_L1_SPOOF [PRN_04 TimeOffset: +450ms, Lat: +12.4° (False Coordinates)]',
    descriptionEn: 'SDR transmitter broadcasts fake GPS L1 signals with offset time delays to hijack autonomous drone/aircraft flight trajectory.',
    descriptionAr: 'جهاز SDR يبث إشارات GPS مزيفة بفوارق زمنية لإبعاد الطائرات بدون طيار والملاحة عن مسارها الموثوق.',
    isThreat: true,
  },
  {
    id: 'SAT-03',
    nameEn: 'X-Band Telemetry Downlink RF Jamming',
    nameAr: 'التشويش الراديوي على دفق بيانات الملاحة X-Band',
    category: 'DOWNLINK_JAMMING',
    spacecraftId: 0x0042,
    ccsdsFrameHex: 'RF_JAMMING_FREQ 8.25 GHz [Noise Power: +85dBm, SNR: -18dB]',
    descriptionEn: 'High-power radio frequency transmitter floods X-band ground station receiver, causing complete downlink telemetry blackout.',
    descriptionAr: 'تشويش راديوي عالي الطاقة على تردد X-band يمنع استقبال البيانات المدارية وصور الاستشعار في المحطة الأرضية.',
    isThreat: true,
  },
];

export const AerospaceSatelliteLab: React.FC<AerospaceSatelliteLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SAT-01');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [satelliteLog, setSatelliteLog] = useState<{
    status: 'PROTECTED_BY_SDLS' | 'ORBITAL_INCIDENT_EXPLOITED';
    details: string;
    spacecraftResponse: string;
    activeDefenses: string[];
  } | null>(null);

  // Satellite Defenses
  const [defenseCcsdsSdlsAuth, setDefenseCcsdsSdlsAuth] = useState<boolean>(false);
  const [defenseGnssCrpaAntenna, setDefenseGnssCrpaAntenna] = useState<boolean>(false);
  const [defenseFhssSpreadSpectrum, setDefenseFhssSpreadSpectrum] = useState<boolean>(false);

  const scenario = useMemo(
    () => SATELLITE_SCENARIOS.find((s) => s.id === selectedScenarioId) || SATELLITE_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunTransmission = () => {
    setIsTransmitting(true);
    setSatelliteLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'TELECOMMAND_SPOOF' && defenseCcsdsSdlsAuth) {
        activeDefenses.push('CCSDS Space Data Link Security (SDLS) MAC Signature & Anti-Replay Counter');
        isBlocked = true;
      } else if (scenario.category === 'GNSS_SPOOF' && defenseGnssCrpaAntenna) {
        activeDefenses.push('Controlled Radiation Pattern Array (CRPA) Null-Steering Anti-Spoofing Antenna');
        isBlocked = true;
      } else if (scenario.category === 'DOWNLINK_JAMMING' && defenseFhssSpreadSpectrum) {
        activeDefenses.push('Frequency Hopping Spread Spectrum (FHSS) Anti-Jamming Channel Hopping');
        isBlocked = true;
      }

      if (isBlocked) {
        setSatelliteLog({
          status: 'PROTECTED_BY_SDLS',
          details: isAr
            ? 'تم حظر الإشارة الضارة بواسطة دفاعات القمر الصناعي/المحطة الأرضية بنجاح!'
            : 'SATELLITE SECURITY SUCCESSFUL: Malicious frame rejected or jamming signal nullified.',
          spacecraftResponse: isAr
            ? 'القمر الصناعي يعمل بانتظام في المدار الآمن. تم تجاهل الأمر اللاسلكي غير المصرح به.'
            : 'Spacecraft telemetry nominal. Telecommand rejected due to invalid SDLS authentication tag.',
          activeDefenses,
        });
      } else {
        setSatelliteLog({
          status: 'ORBITAL_INCIDENT_EXPLOITED',
          details: isAr
            ? 'تحذير: تم تنفيذ الأمر الضار بمركبة الفضاء أو انقطاع إشارة الاتصال لغياب الحماية!'
            : 'CRITICAL SPACE INCIDENT EXPLOITED: Unauthenticated telecommand executed or RF jamming induced blackout!',
          spacecraftResponse: isAr
            ? `[تأثر القمر الصناعي!] ${scenario.ccsdsFrameHex}`
            : `[SPACECRAFT COMPROMISED] ${scenario.ccsdsFrameHex}`,
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
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Satellite className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان الأقمار الصناعية والأنظمة الفضائية (Aerospace Security)' : 'Satellite & Aerospace Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800 rounded-full font-mono">
                CCSDS / SDLS Protocol
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لهجمات الأوامر اللاسلكية الفضائية، وتزييف إشارات الملاحة GPS، والتشويش الترددي.'
                : 'Interactive CCSDS telecommand security, GNSS anti-spoofing CRPA antennas, and FHSS anti-jamming telemetry.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة الوصلة الفضائية:' : 'Space Link Status:'}</span>
          <span className="px-2 py-1 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded font-bold">
            LEO SATELLITE 0x0042 (HEALTHY)
          </span>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selection + Space Telemetry Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Space Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات التهديدات الفضائية' : 'Aerospace Threat Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {SATELLITE_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 text-slate-100 shadow-md shadow-indigo-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">{sc.id}</span>
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

          {/* Aerospace Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع أمان المركبة الفضائية (Space Security Defenses)' : 'Space System Defenses'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'توفق مصادقة SDLS لحزم CCSDS' : 'CCSDS SDLS Telecommand Authentication'}</span>
                <input
                  type="checkbox"
                  checked={defenseCcsdsSdlsAuth}
                  onChange={(e) => setDefenseCcsdsSdlsAuth(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'هوائيات CRPA المضادة لتزييف GPS' : 'GNSS CRPA Anti-Spoofing Null-Steering Array'}</span>
                <input
                  type="checkbox"
                  checked={defenseGnssCrpaAntenna}
                  onChange={(e) => setDefenseGnssCrpaAntenna(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'قفز الترددات FHSS لمنع التشويش' : 'FHSS Frequency Hopping Anti-Jamming'}</span>
                <input
                  type="checkbox"
                  checked={defenseFhssSpreadSpectrum}
                  onChange={(e) => setDefenseFhssSpreadSpectrum(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: CCSDS Payload Frame & Telemetry Screen */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              {isAr ? 'فحص إطار حزمة CCSDS / Telecommand' : 'CCSDS Telecommand Packet Inspector'}
            </h3>
            <button
              onClick={handleRunTransmission}
              disabled={isTransmitting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-indigo-400/30 disabled:opacity-50"
            >
              {isTransmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
              {isAr ? 'بث الإشارة للمركبة الفضائية' : 'Transmit Space Signal'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-2">
            <span className="text-slate-400 font-bold block">{isAr ? 'حمولة إطار CCSDS Space Frame:' : 'CCSDS Transfer Frame Payload:'}</span>
            <pre className="p-2.5 bg-slate-900 border border-slate-800 text-indigo-300 rounded text-[11px] overflow-x-auto">
              {scenario.ccsdsFrameHex}
            </pre>
          </div>

          {/* Telemetry Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل اتصالات المحطة الأرضية والقمر الصناعي' : 'Ground Station Telemetry Monitor'}</span>
            </div>

            {satelliteLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    satelliteLog.status === 'PROTECTED_BY_SDLS'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {satelliteLog.status === 'PROTECTED_BY_SDLS' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم حماية المدار والاتصال بنجاح' : 'SPACE LINK SECURITY DEFENSE ACTIVE'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: اختراق أو تشويش على المركبة الفضائية!' : 'CRITICAL SPACE SYSTEM EXPLOITED'}</span>
                      </>
                    )}
                  </div>
                  {satelliteLog.details}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {satelliteLog.spacecraftResponse}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Satellite className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "بث الإشارة للمركبة الفضائية" لمعاينة استجابة القمر الصناعي.'
                    : 'Select a space scenario and click "Transmit Space Signal".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
