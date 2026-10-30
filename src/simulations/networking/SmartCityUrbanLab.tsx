import React, { useState, useMemo } from 'react';
import {
  Building2,
  Lightbulb,
  TrafficCone,
  Trash2,
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
  Radio,
  Wifi,
  Signal,
} from 'lucide-react';

interface SmartCityUrbanLabProps {
  language?: 'ar' | 'en';
}

interface UrbanScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  infrastructureType: 'STREET_LIGHTING' | 'TRAFFIC_CONTROL' | 'WASTE_MANAGEMENT';
  protocol: 'Zigbee' | 'LoRaWAN' | 'NB-IoT';
  attackVector: string;
  descriptionEn: string;
  descriptionAr: string;
  urbanImpact: string;
  urbanImpactAr: string;
}

const URBAN_SCENARIOS: UrbanScenario[] = [
  {
    id: 'CITY-01',
    nameEn: 'Metropolitan Smart Streetlight Mesh Hijack',
    nameAr: 'اختطاف شبكة إضاءة الشوارع الذكية في المدينة',
    infrastructureType: 'STREET_LIGHTING',
    protocol: 'Zigbee',
    attackVector: 'Exploiting default Trust Center Link Keys to join the mesh and broadcast a global "OFF" command.',
    descriptionEn: 'Attacker leverages a weak Zigbee commissioning process to gain entry into the municipal lighting mesh, plunging 40 city blocks into total darkness.',
    descriptionAr: 'المهاجم يستغل عملية إعداد Zigbee ضعيفة للدخول في شبكة الإضاءة وإرسال أمر "إطفاء" شامل لـ 40 حياً في المدينة.',
    urbanImpact: 'Public Safety Crisis & Increased Crime Opportunity',
    urbanImpactAr: 'أزمة سلامة عامة وزيادة فرص ارتكاب الجرائم',
  },
  {
    id: 'CITY-02',
    nameEn: 'LoRaWAN Traffic Sensor Spoofing (Phantom Congestion)',
    nameAr: 'تزييف حساسات المرور LoRaWAN (ازدحام وهمي)',
    infrastructureType: 'TRAFFIC_CONTROL',
    protocol: 'LoRaWAN',
    attackVector: 'Replaying intercepted uplink frames with modified metadata to simulate 100% road occupancy.',
    descriptionEn: 'Intercepting long-range LPWAN signals from traffic flow sensors and replaying them to force the city AI to reroute emergency vehicles into actual gridlock.',
    descriptionAr: 'اعتراض إشارات LoRaWAN من حساسات التدفق المروري وإعادة بثها لإجبار ذكاء المدينة على تحويل مسار سيارات الطوارئ نحو اختناقات مرورية.',
    urbanImpact: 'Emergency Response Delay & Economic Productivity Loss',
    urbanImpactAr: 'تأخر استجابة الطوارئ وخسائر في الإنتاجية الاقتصادية',
  },
  {
    id: 'CITY-03',
    nameEn: 'NB-IoT Smart Waste Bin Denial of Service',
    nameAr: 'حجب الخدمة عن حاويات النفايات الذكية NB-IoT',
    infrastructureType: 'WASTE_MANAGEMENT',
    protocol: 'NB-IoT',
    attackVector: 'Flooding the licensed spectrum with high-power interference to prevent bins from reporting fill-levels.',
    descriptionEn: 'Jamming the narrow-band cellular frequencies used by smart bins, causing overflow and unhygienic conditions across the downtown business district.',
    descriptionAr: 'التشويش على ترددات النطاق الضيق المستخدمة من قبل الحاويات الذكية، مما يسبب فيضاناً للنفايات وظروفاً غير صحية.',
    urbanImpact: 'Sanitation Failure & Pest Outbreak Risk',
    urbanImpactAr: 'فشل أنظمة النظافة وخطر انتشار الآفات',
  },
];

export const SmartCityUrbanLab: React.FC<SmartCityUrbanLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('CITY-01');
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [urbanLog, setOrbanLog] = useState<{
    status: 'URBAN_SERVICES_SECURED' | 'INFRASTRUCTURE_HIJACKED';
    telemetry: string;
    impactSummary: string;
    activeDefenses: string[];
  } | null>(null);

  // Urban Defenses
  const [defenseMeshRotation, setDefenseMeshRotation] = useState<boolean>(false);
  const [defenseLorawan11, setDefenseLorawan11] = useState<boolean>(false);
  const [defenseSpectrumMonitoring, setDefenseSpectrumMonitoring] = useState<boolean>(false);

  const scenario = useMemo(
    () => URBAN_SCENARIOS.find((u) => u.id === selectedScenarioId) || URBAN_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTriggerUrbanAttack = () => {
    setIsInjecting(true);
    setOrbanLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (defenseMeshRotation && scenario.protocol === 'Zigbee') {
        activeDefenses.push('Zigbee Dynamic Trust Center Link Key Rotation: Adversary-held static key invalidated');
        isBlocked = true;
      } else if (defenseLorawan11 && scenario.protocol === 'LoRaWAN') {
        activeDefenses.push('LoRaWAN v1.1 Join-Accept Counters: Replay attack detected via stale frame counter, packet dropped');
        isBlocked = true;
      } else if (defenseSpectrumMonitoring && scenario.protocol === 'NB-IoT') {
        activeDefenses.push('LPWAN Anomaly Interference Detection: High-power noise detected, switched to alternative carrier sub-band');
        isBlocked = true;
      }

      if (isBlocked) {
        setOrbanLog({
          status: 'URBAN_SERVICES_SECURED',
          telemetry: isAr
            ? '[تم تأمين الخدمات الحضرية] أنظمة تدوير المفاتيح أو مراقبة الطيف أحبطت الهجوم.'
            : '[URBAN SERVICES SECURED] Key rotation or spectrum monitoring neutralized the infrastructure strike.',
          impactSummary: isAr
            ? 'مرافق المدينة تعمل بكفاءة 100%. تم حظر الوصول غير المصرح به لشبكة المرافق.'
            : 'City utilities operating at 100% capacity. Unauthorized utility access blocked.',
          activeDefenses,
        });
      } else {
        setOrbanLog({
          status: 'INFRASTRUCTURE_HIJACKED',
          telemetry: `GRID BREACH: Rogue command "EXECUTE_SHUTDOWN" accepted by gateway ${scenario.id}.`,
          impactSummary: isAr
            ? `إنذار أمني للمدينة: ${scenario.urbanImpactAr} نتيجة سقوط البنية التحتية الذكية!`
            : `CRITICAL URBAN BREACH: ${scenario.urbanImpact} due to smart infrastructure failure!`,
          activeDefenses: [],
        });
      }

      setIsInjecting(false);
    }, 450);
  };

  const handleResetCity = () => {
    setOrbanLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Building2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr
                ? 'مختبر أمان المدن الذكية والبنية التحتية الحضرية (Smart City Urban Lab)'
                : 'Smart City & Urban Infrastructure Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 rounded-full font-mono">
                Zigbee / LoRaWAN / LPWAN
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة اختطاف إنارة الشوارع، وتزييف حساسات المرور، وحجب خدمات المرافق العامة، وحمايتها ببروتوكولات LPWAN الحديثة.'
                : 'Simulate streetlighting mesh hijacks, traffic sensor spoofing, and utility DoS with modern LPWAN security protocols.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetCity}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط المدينة' : 'Reset City Infrastructure'}
        </button>
      </div>

      {/* Main Grid: Left Scenario Selector & Defenses, Right Infrastructure Telemetry & Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Urban Scenarios & Hardening */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            {isAr ? 'أهداف اختراق المرافق الذكية' : 'Target Infrastructure Exploits'}
          </h3>

          <div className="space-y-2">
            {URBAN_SCENARIOS.map((us) => {
              const isSelected = us.id === selectedScenarioId;
              return (
                <button
                  key={us.id}
                  onClick={() => {
                    setSelectedScenarioId(us.id);
                    setOrbanLog(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{us.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {us.protocol}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? us.nameAr : us.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? us.descriptionAr : us.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Urban Hardening Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع حماية الخدمات البلدية' : 'Municipal Resilience Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تدوير مفاتيح Zigbee TC دورياً' : 'Zigbee Trust Center Key Rotation'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseMeshRotation}
                  onChange={(e) => setDefenseMeshRotation(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تطبيق معيار LoRaWAN 1.1 مع عدادات التحقق' : 'Enforce LoRaWAN v1.1 Secure Join'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseLorawan11}
                  onChange={(e) => setDefenseLorawan11(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'مراقبة الطيف ورصد التشويش التلقائي' : 'Real-time Spectrum Interference Monitoring'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseSpectrumMonitoring}
                  onChange={(e) => setDefenseSpectrumMonitoring(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Infrastructure Telemetry & Status */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              {isAr ? 'شاشة مراقبة المرافق الحضرية والترددات' : 'Urban Utility Telemetry & RF Stream'}
            </h3>
            <button
              onClick={handleTriggerUrbanAttack}
              disabled={isInjecting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-emerald-400/30 disabled:opacity-50"
            >
              {isInjecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {isAr ? 'حقن هجوم البنية التحتية' : 'Inject Urban Infrastructure Attack'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">
                {scenario.infrastructureType === 'STREET_LIGHTING' ? <Lightbulb className="w-4 h-4 text-amber-400" /> : 
                 scenario.infrastructureType === 'TRAFFIC_CONTROL' ? <TrafficCone className="w-4 h-4 text-rose-400" /> : 
                 <Trash2 className="w-4 h-4 text-emerald-400" />}
              </span>
              <span className="text-slate-100 font-bold">{scenario.infrastructureType}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'بروتوكول الربط:' : 'Radio Protocol:'}</span>
              <span className="text-emerald-400 font-bold">{scenario.protocol}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الأثر الميداني:' : 'Urban Impact:'}</span>
              <span className="text-amber-400 font-bold text-[10px]">{isAr ? scenario.urbanImpactAr : scenario.urbanImpact}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'حمولة الهجوم اللاسلكية:' : 'Malicious Wireless Payload:'}</span>
            <pre className="p-2 bg-slate-900 border border-slate-800 text-emerald-300 rounded text-[11px] overflow-x-auto leading-relaxed">
              {scenario.attackVector}
            </pre>
          </div>

          {/* Urban Diagnostics Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشخيص مركز قيادة المدينة الذكية' : 'Smart City Command Center Diagnostics'}</span>
            </div>

            {urbanLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    urbanLog.status === 'URBAN_SERVICES_SECURED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {urbanLog.status === 'URBAN_SERVICES_SECURED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم تأمين المرافق بنجاح' : 'INFRASTRUCTURE INTEGRITY PROTECTED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'اختراق حضري حرج - فقدان السيطرة!' : 'CRITICAL URBAN INFRASTRUCTURE LOSS'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{urbanLog.telemetry}</p>
                  <p className="text-[11px] mt-1 font-semibold text-amber-300">{urbanLog.impactSummary}</p>
                </div>

                {urbanLog.activeDefenses.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {isAr ? 'الدفاعات البلدية المفعلة:' : 'Active Municipal Countermeasures:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {urbanLog.activeDefenses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Signal className="w-8 h-8 mb-2 opacity-30 text-emerald-500" />
                <p>
                  {isAr
                    ? 'شبكة الخدمات البلدية نشطة. اضغط "حقن الهجوم" لاختبار متانة بروتوكولات LPWAN.'
                    : 'Municipal services grid online. Click "Inject Urban Infrastructure Attack" to test LPWAN protocol resilience.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
