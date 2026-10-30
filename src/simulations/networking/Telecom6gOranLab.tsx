import React, { useState, useMemo } from 'react';
import {
  Wifi,
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
  Server,
  Globe,
  Cpu,
  Layers,
  Network,
} from 'lucide-react';

interface Telecom6gOranLabProps {
  language?: 'ar' | 'en';
}

interface OranScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  componentTarget: 'NEAR_RT_RIC' | 'NON_RT_RIC' | 'O_CU_UP';
  attackVector: string;
  descriptionEn: string;
  descriptionAr: string;
  telecomImpact: string;
  telecomImpactAr: string;
}

const ORAN_SCENARIOS: OranScenario[] = [
  {
    id: 'ORAN-01',
    nameEn: 'Malicious xApp Near-RT RIC Hijack (Resource Starvation)',
    nameAr: 'تطبيق xApp خبيث لاختطاف متحكم Near-RT RIC وحجب الموارد',
    componentTarget: 'NEAR_RT_RIC',
    attackVector: 'Injecting rogue xApp via compromised E2 interface to manipulate Radio Resource Management (RRM).',
    descriptionEn: 'An adversary deploys a malicious xApp that sends forged RIC_CONTROL messages, starving legitimate users of PRBs (Physical Resource Blocks).',
    descriptionAr: 'المهاجم يزرع تطبيق xApp خبيثاً يرسل رسائل تحكم مزورة لحرمان المستخدمين الشرعيين من كتل الموارد الفيزيائية (PRBs).',
    telecomImpact: 'Massive Denial of Service for 6G Slice Users',
    telecomImpactAr: 'حجب خدمة واسع النطاق لمستأجري شرائح شبكة 6G',
  },
  {
    id: 'ORAN-02',
    nameEn: 'User-Plane Traffic Steering MITM via O-CU-UP',
    nameAr: 'تحويل مسار بيانات المستخدم (MITM) عبر مكون O-CU-UP',
    componentTarget: 'O_CU_UP',
    attackVector: 'Exploiting lack of IPsec on F1-U interface to redirect GTP-U tunnels to an adversary gateway.',
    descriptionEn: 'Intercepting 6G user data packets at the Central Unit User Plane (O-CU-UP), bypassing encryption to exfiltrate private mobile traffic.',
    descriptionAr: 'اعتراض حزم بيانات مستخدمي 6G عند وحدة التحكم المركزية وتجاوز التشفير لتسريب حركة البيانات الخاصة.',
    telecomImpact: 'Full Passive/Active Eavesdropping on Mobile Subscribers',
    telecomImpactAr: 'تنصت كامل (سلبي وإيجابي) على المشتركين في الشبكة',
  },
  {
    id: 'ORAN-03',
    nameEn: 'Non-RT RIC rApp A1-Policy Poisoning',
    nameAr: 'تسميم سياسات A1 عبر تطبيق rApp في متحكم Non-RT RIC',
    componentTarget: 'NON_RT_RIC',
    attackVector: 'Injecting conflicting A1 policies via SMO (Service Management and Orchestration) interface.',
    descriptionEn: 'Compromising the Non-Real-Time RIC to push malicious QoS policies that degrade signal quality for prioritized government/emergency slices.',
    descriptionAr: 'اختراق متحكم Non-RT RIC لدفع سياسات جودة خدمة (QoS) خبيثة تضعف جودة الإشارة لشرائح الحكومات والطوارئ.',
    telecomImpact: 'Strategic Degradation of Critical Communication Slices',
    telecomImpactAr: 'تدهور استراتيجي لجودة اتصالات الشرائح الحساسة والطارئة',
  },
];

export const Telecom6gOranLab: React.FC<Telecom6gOranLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('ORAN-01');
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [oranLog, setOranLog] = useState<{
    status: 'O_RAN_SECURITY_ENFORCED' | 'SLICE_COMPROMISED';
    telemetry: string;
    networkStatus: string;
    activeDefenses: string[];
  } | null>(null);

  // O-RAN Defenses
  const [defenseO1InterfaceSigning, setDefenseO1InterfaceSigning] = useState<boolean>(false);
  const [defenseXAppSandboxing, setDefenseXAppSandboxing] = useState<boolean>(false);
  const [defenseF1UPsec, setDefenseF1UPsec] = useState<boolean>(false);

  const scenario = useMemo(
    () => ORAN_SCENARIOS.find((s) => s.id === selectedScenarioId) || ORAN_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTriggerTelecomAttack = () => {
    setIsInjecting(true);
    setOranLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (defenseXAppSandboxing && scenario.componentTarget === 'NEAR_RT_RIC') {
        activeDefenses.push('xApp Runtime Sandboxing (gVisor/eBPF): Malicious RRM syscalls intercepted and blocked');
        isBlocked = true;
      } else if (defenseF1UPsec && scenario.componentTarget === 'O_CU_UP') {
        activeDefenses.push('F1-U / N3 Interface IPsec Encryption: Encrypted GTP-U tunnels resisted redirection/sniffing');
        isBlocked = true;
      } else if (defenseO1InterfaceSigning && scenario.componentTarget === 'NON_RT_RIC') {
        activeDefenses.push('O1/A1 Policy Digital Signing: Rogue policy rejected due to invalid SMO signature');
        isBlocked = true;
      }

      if (isBlocked) {
        setOranLog({
          status: 'O_RAN_SECURITY_ENFORCED',
          telemetry: isAr
            ? '[تم تطبيق سياسات أمان O-RAN] عزل التطبيقات (Sandboxing) أو تشفير الوصلات أحبط الهجوم بنجاح.'
            : '[O-RAN SECURITY ENFORCED] xApp Sandboxing or interface encryption successfully neutralized the strike.',
          networkStatus: isAr
            ? 'الشبكة مستقرة بنسبة 100%. جودة الخدمة (QoS) لجميع الشرائح ضمن الحدود الطبيعية.'
            : '6G Network Core stable. QoS metrics for all slices within operational baseline.',
          activeDefenses,
        });
      } else {
        setOranLog({
          status: 'SLICE_COMPROMISED',
          telemetry: `ARCHITECTURE BREACH: Rogue control loop established via ${scenario.componentTarget}.`,
          networkStatus: isAr
            ? `إنذار أمني للشبكة: ${scenario.telecomImpactAr} نتيجة استغلال ثغرات Open RAN!`
            : `CRITICAL TELECOM BREACH: ${scenario.telecomImpact} due to successful O-RAN exploitation!`,
          activeDefenses: [],
        });
      }

      setIsInjecting(false);
    }, 450);
  };

  const handleResetOran = () => {
    setOranLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Network className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr
                ? 'مختبر أمان شبكات 6G وخلية راديو O-RAN (6G O-RAN Security Lab)'
                : '6G Open-RAN Architecture & RIC Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 rounded-full font-mono">
                Terahertz / xApps / O-RAN RIC
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة هجمات اختطاف متحكم الراديو الذكي RIC، وتسميم سياسات شرائح الشبكة، واختراق تطبيقات xApps/rApps في معمارية 6G المفتوحة.'
                : 'Simulate RIC hijacking, malicious xApp resource starvation, and A1-policy poisoning in next-gen 6G Open RAN architectures.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetOran}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط العقدة RIC' : 'Reset RIC Node'}
        </button>
      </div>

      {/* Main Grid: Left Scenario Selector & Defenses, Right RIC Telemetry & Slice Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: O-RAN Scenarios & Hardening */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Server className="w-4 h-4 text-emerald-400" />
            {isAr ? 'أهداف اختراق شبكة 6G' : 'Target O-RAN Architecture Exploits'}
          </h3>

          <div className="space-y-2">
            {ORAN_SCENARIOS.map((os) => {
              const isSelected = os.id === selectedScenarioId;
              return (
                <button
                  key={os.id}
                  onClick={() => {
                    setSelectedScenarioId(os.id);
                    setOranLog(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{os.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {os.componentTarget}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? os.nameAr : os.nameEn}</span>
                  <div className="text-[10px] text-amber-400 font-mono">{os.attackVector.substring(0, 45)}...</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? os.descriptionAr : os.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* O-RAN Hardening Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع حماية نواة الراديو المفتوحة' : 'O-RAN Trust & Integrity Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'عزل تطبيقات xApp بتبني تقنية Sandboxing' : 'Near-RT RIC xApp Runtime Sandboxing'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseXAppSandboxing}
                  onChange={(e) => setDefenseXAppSandboxing(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تشفير وصلات F1-U / N3 ببروتوكول IPsec' : 'Enforce IPsec on F1-U/N3 (GTP-U Protection)'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseF1UPsec}
                  onChange={(e) => setDefenseF1UPsec(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'التوقيع الرقمي لسياسات واجهة A1/O1' : 'A1/O1 Interface Policy Digital Signing'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseO1InterfaceSigning}
                  onChange={(e) => setDefenseO1InterfaceSigning(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: RIC Telemetry & Slice Health */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              {isAr ? 'شاشة مراقبة متحكم RIC وصحة الشرائح' : 'RIC Telemetry & Network Slice Health'}
            </h3>
            <button
              onClick={handleTriggerTelecomAttack}
              disabled={isInjecting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-emerald-400/30 disabled:opacity-50"
            >
              {isInjecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {isAr ? 'حقن الهجوم في نواة الراديو' : 'Inject O-RAN Attack Payload'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'المكون المستهدف بالحقن:' : 'Target O-RAN Functional Unit:'}</span>
              <span className="text-emerald-400 font-bold">{scenario.componentTarget}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الأثر المتوقع على الشبكة:' : 'Strategic Network Impact:'}</span>
              <span className="text-amber-400 font-bold">{isAr ? scenario.telecomImpactAr : scenario.telecomImpact}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'متجه هجوم البروتوكول (E2/A1/F1):' : 'Protocol Exploitation Vector (E2/A1/F1):'}</span>
            <pre className="p-2 bg-slate-900 border border-slate-800 text-emerald-300 rounded text-[11px] overflow-x-auto leading-relaxed">
              {scenario.attackVector}
            </pre>
          </div>

          {/* O-RAN Diagnostics Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشخيص المتحكم الذكي RIC' : 'Radio Intelligent Controller (RIC) Event Stream'}</span>
            </div>

            {oranLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    oranLog.status === 'O_RAN_SECURITY_ENFORCED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {oranLog.status === 'O_RAN_SECURITY_ENFORCED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم تأمين معمارية O-RAN بنجاح' : 'O-RAN ARCHITECTURE SECURED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'اختراق تكتيكي لنواة الراديو!' : 'CRITICAL RIC COMPROMISE'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{oranLog.telemetry}</p>
                  <p className="text-[11px] mt-1 font-semibold text-amber-300">{oranLog.networkStatus}</p>
                </div>

                {oranLog.activeDefenses.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {isAr ? 'الضوابط الأمنية المفعلة:' : 'Active O-RAN Security Controls:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {oranLog.activeDefenses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Radio className="w-8 h-8 mb-2 opacity-30 text-emerald-400" />
                <p>
                  {isAr
                    ? 'وصلات E2 و A1 قيد التشغيل. اضغط "حقن الهجوم" لاختبار متانة العزل والتشفير في شبكة 6G.'
                    : 'RIC control loops active. Click "Inject O-RAN Attack Payload" to test sandboxing and protocol signing resilience.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
