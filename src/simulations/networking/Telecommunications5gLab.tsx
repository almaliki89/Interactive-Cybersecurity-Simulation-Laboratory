import React, { useState, useMemo } from 'react';
import {
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Layers,
  Lock,
  Unlock,
  RefreshCw,
  Play,
  Cpu,
  Globe,
  Wifi,
  Server,
  AlertTriangle,
} from 'lucide-react';

interface Telecommunications5gLabProps {
  language?: 'ar' | 'en';
}

interface TelecomScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'IMSI_CATCHER' | 'GTPU_SPOOF' | 'SLICE_LEAK';
  targetSbaService: string;
  protocolPayload: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const TELECOM_SCENARIOS: TelecomScenario[] = [
  {
    id: '5G-01',
    nameEn: 'IMSI Catcher / SUPI Cleartext Extraction',
    nameAr: 'اعتراض المبرمج برج الخلية وسرقة معرّف SUPI',
    category: 'IMSI_CATCHER',
    targetSbaService: 'AMF (Access Management)',
    protocolPayload: 'NAS-5GS Registration Request (SUPI: 310-260-0099410294)',
    descriptionEn: 'Rogue gNodeB cell tower issues Identity Request forcing subscriber UE to transmit raw unencrypted SUPI.',
    descriptionAr: 'يقوم برج تغطية وهمي بطلب الهوية المباشرة مما يجبر جهاز المستخدم على إرسال معرّف SUPI المكشوف.',
    isThreat: true,
  },
  {
    id: '5G-02',
    nameEn: 'GTP-U User Plane Tunnel Injection',
    nameAr: 'حقن حزم نفق GTP-U لخطف شريحة البيانات',
    category: 'GTPU_SPOOF',
    targetSbaService: 'UPF (User Plane Function)',
    protocolPayload: 'GTP-U Header [TEID: 0x88f1a2] IP 10.200.4.15 -> 8.8.8.8 (Forged Slice Payload)',
    descriptionEn: 'Attacker crafts fake GTP-U tunnel packets over N3 interface to inject unauthorized IP traffic into private enterprise slice.',
    descriptionAr: 'يصيغ المهاجم حزم نفق GTP-U مزيفة عبر واجهة N3 لزرع ترافيك غير مصرح به داخل شريحة المؤسسة الخاصة.',
    isThreat: true,
  },
  {
    id: '5G-03',
    nameEn: 'Cross-Slice NRF Microservice Abuse',
    nameAr: 'التفاف شريحة الشبكة واستعلام خدمات NRF بدون OAuth2',
    category: 'SLICE_LEAK',
    targetSbaService: 'NRF (Network Repository)',
    protocolPayload: 'GET /nnrf-disc/v1/nf-instances?nf-type=SMF&target-slice=Slice_HealthCare_01',
    descriptionEn: 'Unauthorized REST API query bypassing NRF slice isolation tokens to discover private healthcare slice microservice endpoints.',
    descriptionAr: 'استعلام REST API يتجاوز رمّوز عزّل الشريحة لاكتشاف نقاط نهاية الخدمات الخاصة بشريحة الرعاية الصحية.',
    isThreat: true,
  },
];

export const Telecommunications5gLab: React.FC<Telecommunications5gLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('5G-01');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [telecomLog, setTelecomLog] = useState<{
    status: 'BLOCKED_BY_5G_DEFENSE' | 'EXPLOITED_TELECOM' | 'NORMAL';
    sbaResponse: string;
    actionTaken: string;
    activeDefenses: string[];
  } | null>(null);

  // 5G Core Security Guardrails
  const [enforceSuciConcealment, setEnforceSuciConcealment] = useState<boolean>(false);
  const [enforceGtpuTeidValidation, setEnforceGtpuTeidValidation] = useState<boolean>(false);
  const [enforceNrfSliceOauth2, setEnforceNrfSliceOauth2] = useState<boolean>(false);

  const scenario = useMemo(
    () => TELECOM_SCENARIOS.find((s) => s.id === selectedScenarioId) || TELECOM_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTelecomLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'IMSI_CATCHER' && enforceSuciConcealment) {
        activeDefenses.push('SUCI Scheme Profile A (Curve25519 Public Key Encryption)');
        isBlocked = true;
      } else if (scenario.category === 'GTPU_SPOOF' && enforceGtpuTeidValidation) {
        activeDefenses.push('UPF N3 TEID Session Boundary Inspection');
        isBlocked = true;
      } else if (scenario.category === 'SLICE_LEAK' && enforceNrfSliceOauth2) {
        activeDefenses.push('NRF OAuth2 Token & Slice Scope Authorization Enforcer');
        isBlocked = true;
      }

      if (isBlocked) {
        setTelecomLog({
          status: 'BLOCKED_BY_5G_DEFENSE',
          sbaResponse: isAr
            ? `[5G Core Security Intercepted] تم حظر محاولة ${scenario.nameAr} بواسطة قواعد الأمان المفعلة في شبكة 5G SBA.`
            : `[5G CORE SECURITY INTERCEPTED] Attempted ${scenario.nameEn} blocked by active 5G SBA security control.`,
          actionTaken: isAr ? 'تم حماية هوية المستخدم أو حجب ترافيك الشريحة بنجاح.' : 'Subscriber SUPI concealed or GTP-U invalid TEID dropped safely at UPF border.',
          activeDefenses,
        });
      } else {
        setTelecomLog({
          status: 'EXPLOITED_TELECOM',
          sbaResponse: isAr
            ? `[تم اختراق الشبكة - 5G Breach!] ${scenario.protocolPayload}\nتم كشف هوية المشترك أو خرق شريحة البيانات لغياب الحماية.`
            : `[5G NETWORK BREACH EXPLOITED] Cleartext payload extracted or unauthorized GTP-U tunnel packet injected: ${scenario.protocolPayload}`,
          actionTaken: isAr ? 'تحذير: تم كشف البيانات الحساسة عبر الشبكة!' : 'CRITICAL TELECOM VULNERABILITY: Raw SUPI intercepted or slice boundary broken.',
          activeDefenses: [],
        });
      }

      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان شبكات الاتصالات 5G والشرائح الشبكية' : '5G Core Network & Telecom Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 rounded-full font-mono">
                3GPP TS 33.501
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لهجمات أبراج IMSI Catcher، والتلاعب بأنفاق GTP-U، وتسريب شرائح الشبكات.'
                : 'Interactive 5G Service-Based Architecture (SBA) security, GTP-U tunnel inspection, and SUCI encryption.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'بنية شبكة 5G:' : '5G Core SBA Status:'}</span>
          <span className="px-2 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded font-bold">
            AMF / SMF / UPF ONLINE
          </span>
        </div>
      </div>

      {/* Main Grid: Telecom Attack Selector + SBA Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Selector & Guardrails */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات ثغرات الاتصالات 5G' : '5G Core Threat Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {TELECOM_SCENARIOS.map((sc) => {
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
                      {sc.targetSbaService}
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

          {/* 5G Core Security Guardrails */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'درع أمان شبكة 5G Core' : '5G Core Security Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تشفير SUCI بمفتاح Curve25519' : 'Enforce SUCI Profile A Encryption'}</span>
                <input
                  type="checkbox"
                  checked={enforceSuciConcealment}
                  onChange={(e) => setEnforceSuciConcealment(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تدقيق حدود أنفاق GTP-U TEID' : 'GTP-U N3 Tunnel TEID Validation'}</span>
                <input
                  type="checkbox"
                  checked={enforceGtpuTeidValidation}
                  onChange={(e) => setEnforceGtpuTeidValidation(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'مصادقة OAuth2 لعزل شرائح NRF' : 'NRF Slice Isolation OAuth2 Enforcer'}</span>
                <input
                  type="checkbox"
                  checked={enforceNrfSliceOauth2}
                  onChange={(e) => setEnforceNrfSliceOauth2(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Protocol Payload & Telemetry Inspector */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              {isAr ? 'منصة فحص بروتوكول 5G SBA Payload' : '5G Protocol Payload Inspector'}
            </h3>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-cyan-400/30 disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'إرسال حزمة الاتصالات' : 'Transmit Telecom Payload'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-2">
            <span className="text-slate-400 font-bold block">{isAr ? 'حزمة بروتوكول NAS / GTP المستهدفة:' : 'Targeted NAS / GTP Protocol Frame:'}</span>
            <pre className="p-2.5 bg-slate-900 border border-slate-800 text-cyan-300 rounded text-[11px] overflow-x-auto">
              {scenario.protocolPayload}
            </pre>
          </div>

          {/* Telemetry Response Box */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل اتصالات 5G Core Telemetry' : '5G SBA Core Telemetry Stream'}</span>
            </div>

            {telecomLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    telecomLog.status === 'BLOCKED_BY_5G_DEFENSE'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {telecomLog.status === 'BLOCKED_BY_5G_DEFENSE' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم حجب الهجوم بواسطة درع 5G Core' : '5G CORE SECURITY DEFENSE SUCCESSFUL'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم اختراق شريحة الاتصالات!' : 'CRITICAL 5G NETWORK BREACH EXPLOITED'}</span>
                      </>
                    )}
                  </div>
                  {telecomLog.sbaResponse}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Wifi className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "إرسال حزمة الاتصالات" لمعاينة الاستجابة.'
                    : 'Select a 5G threat scenario and click "Transmit Telecom Payload".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
