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
  Globe,
  Satellite,
  Clock,
  Anchor,
  Plane,
} from 'lucide-react';

interface GnssSpoofingLabProps {
  language?: 'ar' | 'en';
}

interface GnssScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  domain: 'AVIATION_FLIGHT_DEVIATION' | 'POWER_GRID_TIME_SYNC' | 'MARITIME_PHANTOM_FLEET';
  constellation: string;
  carrierFrequency: string;
  spoofingVector: string;
  descriptionEn: string;
  descriptionAr: string;
  criticalConsequence: string;
  criticalConsequenceAr: string;
}

const GNSS_SCENARIOS: GnssScenario[] = [
  {
    id: 'GNSS-01',
    nameEn: 'Civil Aviation GPS L1 C/A Flight Path Spoofing',
    nameAr: 'تزييف مسار الطيران المدني عبر إشارات GPS L1 C/A',
    domain: 'AVIATION_FLIGHT_DEVIATION',
    constellation: 'GPS Block III / Navstar L1 Band',
    carrierFrequency: '1575.42 MHz (RF Power +3dB Over Real Satellite)',
    spoofingVector: 'Transmitting forged pseudorange ephemeris; gradually slewing aircraft autopilot 42nm off airway toward restricted airspace.',
    descriptionEn: 'SDR ground station transmits slightly higher power spoofed GPS pseudoranges, leading flight management system into hazardous mountain terrain.',
    descriptionAr: 'محطة أرضية تبث إشارات أقمار صناعية مزيفة بقدرة أعلى تدريجياً لتحريف نظام الملاحة الآلي للطائرة نحو تضاريس وعرة.',
    criticalConsequence: 'Terrain Controlled Flight Into Terrain (CFIT) Warning',
    criticalConsequenceAr: 'تحذير اقتراب كارثي من التضاريس الجبلية واختراق مناطق محظورة',
  },
  {
    id: 'GNSS-02',
    nameEn: 'Electrical Substation IEEE 1588 (1 PPS) Nanosecond Time Drift',
    nameAr: 'تشتيت مزامنة التوقيت الدقيق 1 PPS لمحطات الكهرباء التحويلية',
    domain: 'POWER_GRID_TIME_SYNC',
    constellation: 'GPS / GLONASS Timing Receivers',
    carrierFrequency: '1575.42 MHz + 1602 MHz L1 Band',
    spoofingVector: 'Manipulating GPS One-Pulse-Per-Second (1 PPS) timing offset by 2.4 microseconds over 10 minutes.',
    descriptionEn: 'Phasor Measurement Units (PMUs) lose synchronization; synchrophasor phase angle calculation error trips protective transmission lines.',
    descriptionAr: 'التلاعب بمزامنة النبضة في الثانية (1 PPS) لمحطات الكهرباء مما يسبب خطأ في حساب زوايا الطور وانفصال خطوط النقل.',
    criticalConsequence: 'Tripping of 500kV Inter-Grid Transmission Breakers',
    criticalConsequenceAr: 'فصل قواطع الجهد الفائق 500 ك.ف وانهيار اتزان الشبكة الكهربائية',
  },
  {
    id: 'GNSS-03',
    nameEn: 'Strait of Hormuz Maritime AIS Ghost Vessel & ECDIS Spoofing',
    nameAr: 'حقن سفن وهمية في مضيق هرمز وتزييف شاشات ECDIS البحرية',
    domain: 'MARITIME_PHANTOM_FLEET',
    constellation: 'GPS + AIS Marine Transponder VHF',
    carrierFrequency: '1575.42 MHz GNSS + 162.025 MHz VHF AIS',
    spoofingVector: 'Injecting 14 fake container ship AIS positions directly in shipping lane, forcing tanker collision avoidance maneuvers into shallow reefs.',
    descriptionEn: 'Adversary floods marine navigation frequencies with counterfeit vessel position reports and false GPS circle offsets.',
    descriptionAr: 'بث تقارير مواقع بحرية وهمية وإحداثيات GPS مزورة تجبر ناقلات النفط على مناورات تفادي تؤدي للجنوح في المياه الضحلة.',
    criticalConsequence: 'Tanker Grounding & Strategic Strait Blockade',
    criticalConsequenceAr: 'جنوح ناقلة نفط عملاقة وإغلاق الممر الملاحي الدولي',
  },
];

export const GnssSpoofingLab: React.FC<GnssSpoofingLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('GNSS-01');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [gnssLog, setGnssLog] = useState<{
    status: 'SPOOFING_NEUTRALIZED' | 'TACTICAL_NAVIGATION_COMPROMISE';
    rfTelemetry: string;
    navigationReport: string;
    activeDefenses: string[];
  } | null>(null);

  // Anti-Spoofing & Electronic Warfare Defenses
  const [defenseGalileoOsNma, setDefenseGalileoOsNma] = useState<boolean>(false);
  const [defenseCrpaNullSteering, setDefenseCrpaNullSteering] = useState<boolean>(false);
  const [defenseRaimIntegrity, setDefenseRaimIntegrity] = useState<boolean>(false);

  const scenario = useMemo(
    () => GNSS_SCENARIOS.find((g) => g.id === selectedScenarioId) || GNSS_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTriggerSpoofingStrike = () => {
    setIsTransmitting(true);
    setGnssLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.domain === 'AVIATION_FLIGHT_DEVIATION') {
        if (defenseCrpaNullSteering) {
          activeDefenses.push('Controlled Reception Pattern Antenna (CRPA): Formed RF null beam (-45dB) directly at ground SDR jammer');
          isBlocked = true;
        } else if (defenseRaimIntegrity) {
          activeDefenses.push('RAIM Fault Detection & Exclusion (FDE): Satellite pseudorange residual inconsistency detected, spoofed signal discarded');
          isBlocked = true;
        }
      } else if (scenario.domain === 'POWER_GRID_TIME_SYNC') {
        if (defenseGalileoOsNma) {
          activeDefenses.push('Galileo OS-NMA Cryptographic Authentication: Ephemeris digital signature failed on fake clock ticks');
          isBlocked = true;
        } else if (defenseRaimIntegrity) {
          activeDefenses.push('Rubidium Atomic Oscillator Holdover: GNSS 1 PPS untrusted, switched to autonomous atomic clock baseline');
          isBlocked = true;
        }
      } else if (scenario.domain === 'MARITIME_PHANTOM_FLEET') {
        if (defenseGalileoOsNma) {
          activeDefenses.push('Galileo OS-NMA & Multi-Constellation Cross-Check: GPS drift contradicted by verified Galileo navigation message');
          isBlocked = true;
        } else if (defenseCrpaNullSteering) {
          activeDefenses.push('Dual-Antenna Marine CRPA: Spatial angle of arrival check identified coastal spoofing emitter');
          isBlocked = true;
        }
      }

      if (isBlocked) {
        setGnssLog({
          status: 'SPOOFING_NEUTRALIZED',
          rfTelemetry: isAr
            ? '[تم إحباط تزييف الملاحة الفضائية بنجاح] هوائيات CRPA أو التوثيق التشفيري OS-NMA عزل الإشارة المزورة فوراً.'
            : '[GNSS SPOOFING ATTACK MITIGATED] CRPA null-steering or OS-NMA cryptographic ephemeris dropped spoofed carrier.',
          navigationReport: isAr
            ? 'المسار الملاحي والمزامنة الزمنية دقيقة بنسبة 100%. تم الاحتفاظ بالمسار الحقيقي دون أي انحراف.'
            : 'Navigation solution & microsecond time-sync 100% genuine. Safe trajectory maintained.',
          activeDefenses,
        });
      } else {
        setGnssLog({
          status: 'TACTICAL_NAVIGATION_COMPROMISE',
          rfTelemetry: `RF CARRIER CAPTURE: Receiver locked onto forged carrier at ${scenario.carrierFrequency}`,
          navigationReport: isAr
            ? `إنذار ملاحي استراتيجي: ${scenario.criticalConsequenceAr} نتيجة تضليل المستقبل واستسلامه للإشارة المزيفة!`
            : `TACTICAL COMPROMISE: ${scenario.criticalConsequence} due to receiver locking onto rogue RF pseudorange!`,
          activeDefenses: [],
        });
      }

      setIsTransmitting(false);
    }, 450);
  };

  const handleResetGnss = () => {
    setGnssLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Satellite className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr
                ? 'مختبر تزييف الملاحة الفضائية وحرب الترددات اللاسلكية (GNSS / GPS Spoofing & EW Lab)'
                : 'GNSS Satellite Navigation Spoofing & Electronic Warfare Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 rounded-full font-mono">
                Galileo OS-NMA / CRPA Null-Steering
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تزييف إشارات GPS L1/L2 وتحريف مسار الطائرات ومزامنة محطات الكهرباء والسفن، والدفاع بهوائيات CRPA وتوثيق الأقمار الصناعية.'
                : 'Simulate RF carrier spoofing, clock desynchronization in electrical grids, and vessel phantom injection with resilient defenses.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetGnss}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط مستقبل الأقمار' : 'Reset GNSS Receiver'}
        </button>
      </div>

      {/* Main Grid: Left Scenario Selector & Defenses, Right Telemetry & Navigation Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: GNSS Scenarios & Anti-Spoofing Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            {isAr ? 'أهداف تزييف الملاحة الفضائية' : 'Tactical GNSS Spoofing Targets'}
          </h3>

          <div className="space-y-2">
            {GNSS_SCENARIOS.map((gs) => {
              const isSelected = gs.id === selectedScenarioId;
              return (
                <button
                  key={gs.id}
                  onClick={() => {
                    setSelectedScenarioId(gs.id);
                    setGnssLog(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">{gs.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {gs.domain}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? gs.nameAr : gs.nameEn}</span>
                  <div className="text-[10px] text-slate-400 font-mono">{gs.constellation}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? gs.descriptionAr : gs.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Anti-Spoofing & Electronic Warfare Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع مكافحة التشويش والتزييف الفضائي' : 'Resilient GNSS Electronic Countermeasures'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'هوائيات CRPA مع توجيه الصفر وتفريغ التردد (Null-Steering)' : 'Controlled Reception Pattern Antennas (CRPA Nulling)'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseCrpaNullSteering}
                  onChange={(e) => setDefenseCrpaNullSteering(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'التوثيق الرقمي لرسائل الملاحة (Galileo OS-NMA)' : 'Galileo OS-NMA Navigation Authentication'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseGalileoOsNma}
                  onChange={(e) => setDefenseGalileoOsNma(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'المراقبة الذاتية لسلامة الإشارات (RAIM FDE)' : 'Receiver Autonomous Integrity Monitoring (RAIM FDE)'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseRaimIntegrity}
                  onChange={(e) => setDefenseRaimIntegrity(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: RF Telemetry & Trajectory Status */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              {isAr ? 'شاشة طيف الترددات اللاسلكية والمسار الملاحي' : 'RF Spectrum & Receiver Navigation Fix'}
            </h3>
            <button
              onClick={handleTriggerSpoofingStrike}
              disabled={isTransmitting}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-cyan-400/30 disabled:opacity-50"
            >
              {isTransmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'بث إشارة التزييف الفضائية المزورة' : 'Broadcast Counterfeit GNSS Carrier'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'التردد الحامل وقوة البث:' : 'Carrier Frequency & Overpower:'}</span>
              <span className="text-cyan-400 font-bold">{scenario.carrierFrequency}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الخطر الاستراتيجي المتوقع:' : 'Critical Consequence:'}</span>
              <span className="text-amber-400 font-bold">{isAr ? scenario.criticalConsequenceAr : scenario.criticalConsequence}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'متجه هجوم التزييف المداري:' : 'Orbital Spoofing Vector Details:'}</span>
            <p className="p-2 bg-slate-900 border border-slate-800 text-cyan-300 rounded text-[11px] leading-relaxed">
              {scenario.spoofingVector}
            </p>
          </div>

          {/* GNSS Diagnostics Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشخيص مستقبل الأقمار الصناعية' : 'GNSS Receiver PVT Stream'}</span>
            </div>

            {gnssLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    gnssLog.status === 'SPOOFING_NEUTRALIZED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {gnssLog.status === 'SPOOFING_NEUTRALIZED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم تحييد هجوم التزييف الفضائي' : 'NAVIGATION INTEGRITY PRESERVED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'اختراق ملاحي تكتيكي حرج!' : 'TACTICAL NAVIGATION COMPROMISE'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{gnssLog.rfTelemetry}</p>
                  <p className="text-[11px] mt-1 font-semibold text-amber-300">{gnssLog.navigationReport}</p>
                </div>

                {gnssLog.activeDefenses.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {isAr ? 'الدفاعات الفضائية المفعلة بنجاح:' : 'Active Electronic Countermeasures:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {gnssLog.activeDefenses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Navigation className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
                <p>
                  {isAr
                    ? 'المستقبل يتابع إشارات الأقمار الصناعية بانتظام. اضغط "بث إشارة التزييف الفضائية المزورة" لاختبار متانة الهوائيات والتشفير.'
                    : 'GNSS lock acquired. Click "Broadcast Counterfeit GNSS Carrier" to test CRPA nulling and OS-NMA authentication.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
