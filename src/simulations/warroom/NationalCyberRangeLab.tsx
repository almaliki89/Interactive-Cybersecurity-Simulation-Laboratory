import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  Server,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Globe,
  Flame,
  Award,
  Terminal,
  Layers,
  Power,
  Cpu,
} from 'lucide-react';
import { NationalDefenseMap } from './NationalDefenseMap';

interface NationalCyberRangeLabProps {
  language?: 'ar' | 'en';
}

interface CrisisScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  sector: 'ENERGY_GRID' | 'FINANCIAL_SWIFT' | 'AEROSPACE_ATC' | 'HEALTHCARE_ICU';
  aptGroup: string;
  defconLevel: number;
  protocolExploited: string;
  descriptionEn: string;
  descriptionAr: string;
  initialDamagePct: number;
}

const CRISIS_SCENARIOS: CrisisScenario[] = [
  {
    id: 'WAR-01',
    nameEn: 'National Power Grid Cascading Blackout (Sandworm APT)',
    nameAr: 'انهيار شبكة الكهرباء الوطنية وانقطاع الطاقة المتسلسل (Sandworm)',
    sector: 'ENERGY_GRID',
    aptGroup: 'Sandworm / APT44 (State-Sponsored)',
    defconLevel: 1,
    protocolExploited: 'IEC 61850 GOOSE & DNP3 Substation Breaker Commands',
    descriptionEn: 'Adversary floods regional electrical transmission substations with malicious GOOSE disconnect frames, tripping 48 breakers to trigger blackout.',
    descriptionAr: 'المهاجم يغرق محطات التحويل الكهربائي بأوامر GOOSE خبيثة لفتح قواطع الدائرة وإحداث انقطاع كهربائي شامل.',
    initialDamagePct: 78,
  },
  {
    id: 'WAR-02',
    nameEn: 'Global SWIFT Interbank Financial Settlement Tampering (Lazarus)',
    nameAr: 'التلاعب بتسويات التحويل المالي الدولي عبر شبكة SWIFT (Lazarus)',
    sector: 'FINANCIAL_SWIFT',
    aptGroup: 'Lazarus Group / APT38',
    defconLevel: 2,
    protocolExploited: 'SWIFT Alliance Access MT103 Unauthenticated Packet Tampering',
    descriptionEn: 'Nation-state threat group alters interbank MT103 messaging queue, routing $180M in central bank foreign exchange to offshore accounts.',
    descriptionAr: 'مجموعة تهديد سيبراني تخترق طابور رسائل SWIFT MT103 لتحويل 180 مليون دولار من الاحتياطي الأجنبي لحسابات خارجية.',
    initialDamagePct: 65,
  },
  {
    id: 'WAR-03',
    nameEn: 'Metropolitan Hospital ICU & Lifeline Telemetry Lockdown',
    nameAr: 'شلل أجهزة العناية المركزة والمستشفيات بهجوم فدية حرج',
    sector: 'HEALTHCARE_ICU',
    aptGroup: 'BlackCat / ALPHV Ransomware Syndicate',
    defconLevel: 2,
    protocolExploited: 'DICOM Imaging PACS & HL7 Medical Telemetry Hijack',
    descriptionEn: 'Ransomware propagates through medical subnet, locking hospital ventilators, patient monitor telemetry, and emergency triage systems.',
    descriptionAr: 'برمجية فدية تنتشر في شبكة المستشفى الطبية، مما يقفل أجهزة التنفس الصناعي وشاشات المرضى وغرف العمليات.',
    initialDamagePct: 84,
  },
];

export const NationalCyberRangeLab: React.FC<NationalCyberRangeLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedCrisisId, setSelectedCrisisId] = useState<string>('WAR-01');
  const [isCrisisActive, setIsCrisisActive] = useState<boolean>(false);

  // Sector Health Telemetry
  const [infrastructureHealthPct, setInfrastructureHealthPct] = useState<number>(100);
  const [defconLevel, setDefconLevel] = useState<number>(5); // 5 = Peace, 1 = Maximum Crisis

  const [warRoomLog, setWarRoomLog] = useState<{
    status: 'NATIONAL_DEFENSE_CONTAINED' | 'INFRASTRUCTURE_BLACKOUT';
    details: string;
    doctrineResponse: string;
    activeDefenses: string[];
  } | null>(null);

  // National Defense Levers
  const [defenseIslandGridAirgap, setDefenseIslandGridAirgap] = useState<boolean>(false);
  const [defenseBgpSinkholeScrubbing, setDefenseBgpSinkholeScrubbing] = useState<boolean>(false);
  const [defenseEmergencyPkiRotation, setDefenseEmergencyPkiRotation] = useState<boolean>(false);

  const scenario = useMemo(
    () => CRISIS_SCENARIOS.find((c) => c.id === selectedCrisisId) || CRISIS_SCENARIOS[0],
    [selectedCrisisId]
  );

  const getSectorAr = (sector: string) => {
    switch (sector) {
      case 'ENERGY_GRID': return 'شبكة كهرباء البصرة والفرات الأوسط';
      case 'FINANCIAL_SWIFT': return 'نظام المقاصة الإلكتروني (البنك المركزي العراقي)';
      case 'AEROSPACE_ATC': return 'منظومة الملاحة الجوية (مطار بغداد الدولي)';
      case 'HEALTHCARE_ICU': return 'شبكة بيانات المستشفيات التعليمية';
      default: return sector;
    }
  };

  const handleTriggerNationalCrisis = () => {
    setIsCrisisActive(true);
    setWarRoomLog(null);
    setDefconLevel(scenario.defconLevel);
    setInfrastructureHealthPct(100 - scenario.initialDamagePct);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isContained = false;

      if (scenario.sector === 'ENERGY_GRID' && defenseIslandGridAirgap) {
        activeDefenses.push('Emergency Substation Micro-Islanding: Air-Gapped Grid Sectioning Activated');
        isContained = true;
      } else if (scenario.sector === 'FINANCIAL_SWIFT' && defenseEmergencyPkiRotation) {
        activeDefenses.push('Central Bank Instant HSM Root Key Revocation & SWIFT HSM Token Quorum Lockdown');
        isContained = true;
      } else if (scenario.sector === 'HEALTHCARE_ICU' && defenseBgpSinkholeScrubbing) {
        activeDefenses.push('National Autonomous BGP Scrubbing Center & Out-of-Band Medical Subnet Quarantine');
        isContained = true;
      }

      if (isContained) {
        setInfrastructureHealthPct(92);
        setDefconLevel(4);
        setWarRoomLog({
          status: 'NATIONAL_DEFENSE_CONTAINED',
          details: isAr
            ? 'تم احتواء الهجوم السيبراني الاستراتيجي بنجاح وحماية المنشآت الحيوية الوطنية!'
            : 'STRATEGIC CYBER THREAT CONTAINED: Infrastructure islanded or financial transactions halted safely.',
          doctrineResponse: isAr
            ? 'غرفة إدارة الأزمات الوطنية: تم عزل القواطع المتضررة وتفعيل القنوات البديلة الآمنة.'
            : 'National Cyber Command: Grid restored to 92% operational baseline. Threat vector neutralized.',
          activeDefenses,
        });
      } else {
        setDefconLevel(1);
        setWarRoomLog({
          status: 'INFRASTRUCTURE_BLACKOUT',
          details: isAr
            ? `إنذار قصوى: انهيار قطاع ${getSectorAr(scenario.sector)} وفشل استقرار البنية التحتية الحيوية!`
            : `CRITICAL NATIONAL CRISIS: ${scenario.sector} failure cascading across critical lifelines!`,
          doctrineResponse: isAr
            ? `[أثر الهجوم الفادح] ${scenario.descriptionAr}`
            : `[CASCADING INFRASTRUCTURE FAILURE] ${scenario.descriptionEn}`,
          activeDefenses: [],
        });
      }

      setIsCrisisActive(false);
    }, 450);
  };

  const handleResetWarRoom = () => {
    setInfrastructureHealthPct(100);
    setDefconLevel(5);
    setWarRoomLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'الميدان السيبراني الوطني الشامل وغرفة العمليات (National Cyber Range)' : 'National Strategic Cyber Range & Critical Infrastructure War Room'}
              <span className="px-2 py-0.5 text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800 rounded-full font-mono">
                CISA Critical Sectors / APT Defense
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة الأزمات السيبرانية الوطنية، وتنسيق استجابة قطاعات الطاقة والمالية والصحة ضد هجمات APT المدعومة دولياً.'
                : 'Interactive national cyber range, grid blackout defense, SWIFT protection, and military-grade incident response.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetWarRoom}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط الميدان الشامل' : 'Reset Cyber Range'}
        </button>
      </div>

      {/* Strategic Posture & DEFCON Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex-1">
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'سلامة البنية التحتية الوطنية' : 'Infrastructure Health'}</span>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${infrastructureHealthPct < 50 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {infrastructureHealthPct}%
              </span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${infrastructureHealthPct < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${infrastructureHealthPct}%` }}
                ></div>
              </div>
            </div>
          </div>
          <Activity className="w-6 h-6 text-cyan-400 ml-3" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'مستوى التأهب الدفاعي (DEFCON)' : 'Readiness Level (DEFCON)'}</span>
            <span className={`text-2xl font-bold ${defconLevel <= 2 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              DEFCON {defconLevel}
            </span>
          </div>
          <Flame className={`w-6 h-6 ${defconLevel <= 2 ? 'text-rose-400' : 'text-slate-600'}`} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'نسبة عزو التهديد للمهاجم' : 'Threat Actor Attribution'}</span>
            <span className="text-sm font-bold text-amber-400">
              {scenario.aptGroup}
            </span>
          </div>
          <ShieldAlert className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Main Grid: Crisis Scenarios + War Room Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Crisis Scenario Selection + Defense Levers */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات الحروب والأزمات السيبرانية' : 'National Cyber Warfare Scenarios'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {CRISIS_SCENARIOS.map((cs) => {
              const isSelected = cs.id === selectedCrisisId;
              return (
                <button
                  key={cs.id}
                  onClick={() => setSelectedCrisisId(cs.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-rose-950/50 border-rose-500 text-slate-100 shadow-md shadow-rose-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400">{cs.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {cs.sector}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? cs.nameAr : cs.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? cs.descriptionAr : cs.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* National Defense Doctrine Levers */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'قرارات واستجابات القيادة الدفاعية' : 'Incident Commander Defense Doctrine'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'عزل شبكة الكهرباء إلى جزر مستقلة (Island Grid)' : 'Substation Islanding & Micro-Grid Airgap'}</span>
                <input
                  type="checkbox"
                  checked={defenseIslandGridAirgap}
                  onChange={(e) => setDefenseIslandGridAirgap(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'التنظيف التلقائي عبر BGP Anycast وعزل المستشفيات' : 'National BGP Scrubbing & Medical Isolation'}</span>
                <input
                  type="checkbox"
                  checked={defenseBgpSinkholeScrubbing}
                  onChange={(e) => setDefenseBgpSinkholeScrubbing(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'استبدال فوري للمفاتيح الجذرية لبنك التسويات SWIFT' : 'Emergency SWIFT PKI Root Key Revocation'}</span>
                <input
                  type="checkbox"
                  checked={defenseEmergencyPkiRotation}
                  onChange={(e) => setDefenseEmergencyPkiRotation(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: War Room Crisis Console */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              {isAr ? 'منصة توجيه الأزمات والاستجابة الوطنية' : 'Crisis Telemetry & Command Console'}
            </h3>
            <button
              onClick={handleTriggerNationalCrisis}
              disabled={isCrisisActive}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-rose-400/30 disabled:opacity-50"
            >
              {isCrisisActive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
              {isAr ? 'بدء محاكاة الهجوم الاستراتيجي' : 'Execute Cyber Strike'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-3">
            <div>
              <span className="text-slate-400 font-bold block mb-1">{isAr ? 'البروتوكول/القطاع المستهدف بالهجوم:' : 'Exploited Protocol / Vector:'}</span>
              <span className="text-rose-400 font-bold">{scenario.protocolExploited}</span>
            </div>
            
            <NationalDefenseMap 
              language={language} 
              infrastructureHealth={infrastructureHealthPct}
              activeCrisis={isCrisisActive}
            />
          </div>

          {/* War Room Incident Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل اتصالات الأزمة وغرفة الطوارئ' : 'National Cyber Defense Command Telemetry'}</span>
            </div>

            {warRoomLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    warRoomLog.status === 'NATIONAL_DEFENSE_CONTAINED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {warRoomLog.status === 'NATIONAL_DEFENSE_CONTAINED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم احتواء الهجوم واستقرار البنية التحتية' : 'NATIONAL DEFENSE CONTAINED ATTACK'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'انهيار البنية التحتية وانقطاع الخدمات الحيوية!' : 'INFRASTRUCTURE COLLAPSE EXPLOITED'}</span>
                      </>
                    )}
                  </div>
                  {warRoomLog.details}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {warRoomLog.doctrineResponse}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Globe className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر أزمة وطنية وانقر على "بدء محاكاة الهجوم الاستراتيجي" لاختبار قرارات القيادة واستقرار المنشآت الحيوية.'
                    : 'Select a national cyber crisis and click "Execute Cyber Strike" to test strategic defense doctrine.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
