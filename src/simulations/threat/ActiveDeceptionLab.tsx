import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Server,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Radio,
  FileCode,
  Eye,
} from 'lucide-react';

interface ActiveDeceptionLabProps {
  language?: 'ar' | 'en';
}

interface DeceptionScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'HONEYTOKEN_AWS' | 'DECOY_DC_SMB' | 'TARPIT_TRAP';
  decoyArtifact: string;
  attackerAction: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const DECEPTION_SCENARIOS: DeceptionScenario[] = [
  {
    id: 'DEC-01',
    nameEn: 'AWS Honeytoken Access Key Tripping',
    nameAr: 'استدراج المهاجم بمفتاح AWS وهمي (Honeytoken)',
    category: 'HONEYTOKEN_AWS',
    decoyArtifact: 'Planted ~/.aws/credentials: [AKIA_HONEY_DECOY_9812: SECRET_KEY_TRAP]',
    attackerAction: 'aws sts get-caller-identity --access-key AKIA_HONEY_DECOY_9812',
    descriptionEn: 'Attacker harvests bait AWS credentials from developer workstation; first API call immediately triggers SOC priority pager.',
    descriptionAr: 'المهاجم يعثر على مفاتيح سحابية وهمية مزروعة؛ وأول استدعاء لـ AWS API يطلق إنذاراً حرجاً خالياً من الإيجابيات الكاذبة.',
    isThreat: true,
  },
  {
    id: 'DEC-02',
    nameEn: 'High-Interaction Decoy Domain Controller SMB Breach',
    nameAr: 'اقتحام سيرفر دومين كنترولر خادع عالي التفاعل (Decoy DC)',
    category: 'DECOY_DC_SMB',
    decoyArtifact: 'Decoy Node: DC-BACKUP-02.CORP.LOCAL (SMB Port 445 Opened, Zero Production Traffic)',
    attackerAction: 'net view \\\\DC-BACKUP-02 /all & psexec \\\\DC-BACKUP-02 cmd.exe',
    descriptionEn: 'Adversary scanning internal network attempts lateral movement into enticing decoy server, getting isolated into honeypot sandbox.',
    descriptionAr: 'المهاجم يرصد سيرفر دومين احتياطي جذاب ويحاول الانتقال الجانبي إليه، فيتم عزله داخل بيئة خادعة تسجل كل أوامره.',
    isThreat: true,
  },
  {
    id: 'DEC-03',
    nameEn: 'Active TCP Tarpit Scanner Entanglement',
    nameAr: 'مصيدة شبكة Tarpit لإبطال وإرهاق الفاحصين التلقائيين',
    category: 'TARPIT_TRAP',
    decoyArtifact: 'LaBrea Tarpit Engine: Responds with 1-byte window size delay across 65,535 fake ports',
    attackerAction: 'nmap -sS -p- 10.10.99.0/24 (Aggressive Port Scan Stuck in Slow-Motion Handshake)',
    descriptionEn: 'Automated network scanner gets bogged down in persistent TCP window stalls, taking 14 days to scan a single dead subnet.',
    descriptionAr: 'فاحص المنافذ الآلي يقع في مصيدة تأخير حزم TCP البطيئة جداً، مما يفقده القدرة على جمع المعلومات ويستنزف موارده.',
    isThreat: true,
  },
];

export const ActiveDeceptionLab: React.FC<ActiveDeceptionLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('DEC-01');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [deceptionLog, setDeceptionLog] = useState<{
    status: 'ATTACKER_DECEIVED_TRAPPED' | 'ATTACKER_UNMASKED_DETECTED';
    telemetryReport: string;
    socResponse: string;
    activeDefenses: string[];
  } | null>(null);

  // Deception Controls
  const [defenseHoneytokenWebhook, setDefenseHoneytokenWebhook] = useState<boolean>(true);
  const [defenseDynamicMicrosegmentation, setDefenseDynamicMicrosegmentation] = useState<boolean>(false);
  const [defenseTcpTarpitActive, setDefenseTcpTarpitActive] = useState<boolean>(false);

  const scenario = useMemo(
    () => DECEPTION_SCENARIOS.find((d) => d.id === selectedScenarioId) || DECEPTION_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunDeceptionSimulation = () => {
    setIsSimulating(true);
    setDeceptionLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isTrapped = false;

      if (scenario.category === 'HONEYTOKEN_AWS' && defenseHoneytokenWebhook) {
        activeDefenses.push('Canarytoken CloudWatch Event Trigger: Instant Zero-False-Positive SOC Alert');
        isTrapped = true;
      } else if (scenario.category === 'DECOY_DC_SMB' && defenseDynamicMicrosegmentation) {
        activeDefenses.push('Software-Defined Microsegmentation: Attacker Host Automatically Quarantined to Sandbox VLAN');
        isTrapped = true;
      } else if (scenario.category === 'TARPIT_TRAP' && defenseTcpTarpitActive) {
        activeDefenses.push('Active Tarpit Engagement: TCP Zero-Window Stall (Scanner Thread Starved)');
        isTrapped = true;
      }

      if (isTrapped) {
        setDeceptionLog({
          status: 'ATTACKER_DECEIVED_TRAPPED',
          telemetryReport: isAr
            ? `[نجاح خطة الخداع السيبراني!] وقع المهاجم في المصيدة (${scenario.nameAr}). تم تسجيل هويته وحصره بالكامل.`
            : `[DECEPTION SUCCESSFUL] Threat actor entangled in decoy mesh: ${scenario.nameEn}.`,
          socResponse: isAr
            ? 'غرفة العمليات SOC: تم تحديد عنوان IP المهاجم وخصائصه الجنائية قبل وصوله لأي بيانات حقيقية.'
            : 'Zero-False-Positive Alert confirmed. Attacker host quarantined with full behavioral recording.',
          activeDefenses,
        });
      } else {
        setDeceptionLog({
          status: 'ATTACKER_UNMASKED_DETECTED',
          telemetryReport: isAr
            ? `[رصد نشاط المهاجم]: تم تسجيل محاولة تنفيذ: ${scenario.attackerAction}`
            : `[ATTACKER ACTIVITY LOGGED]: Attempted: ${scenario.attackerAction}`,
          socResponse: isAr
            ? 'تحذير: المصيدة غير مدعمة بسياسة العزل التلقائي أو الـ Tarpit؛ المهاجم يتجول في الشبكة.'
            : 'ADVISORY: Active isolation rule disabled. Attacker free to disengage without quarantine.',
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
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر الدفاع السيبراني الإيجابي وتقنيات الخداع (Cyber Deception & Honeypots)' : 'Cyber Deception & Active Defense Honeypots Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 rounded-full font-mono">
                MITRE D3FEND / Honeynets
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لمصائد Honeytokens السحابية، وخوادم Decoy Servers الخادعة، وشبكات إرهاق المهاجم Tarpits.'
                : 'Interactive Honeytoken tripwires, high-interaction decoy servers, and TCP Tarpit entanglement.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة شبكة الخداع:' : 'Deception Fabric State:'}</span>
          <span className="px-2 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded font-bold">
            DECOY FABRIC ARMED
          </span>
        </div>
      </div>

      {/* Main Grid: Deception Vector Selection + Decoy Telemetry Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات الخداع والاستدراج' : 'Deception Scenarios'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {DECEPTION_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-950/50 border-emerald-500 text-slate-100 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">{sc.id}</span>
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

          {/* Deception Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'سياسات وقواعد الخداع النشط' : 'Active Deception Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'إنذارات Honeytoken الفورية بدون كواذب' : 'Canarytoken Immediate Zero-FP Alerting'}</span>
                <input
                  type="checkbox"
                  checked={defenseHoneytokenWebhook}
                  onChange={(e) => setDefenseHoneytokenWebhook(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'العزل التلقائي الفوري للمهاجم في VLAN وهمية' : 'Dynamic Microsegmentation Isolation'}</span>
                <input
                  type="checkbox"
                  checked={defenseDynamicMicrosegmentation}
                  onChange={(e) => setDefenseDynamicMicrosegmentation(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تفعيل مصيدة TCP Tarpit لتجميد الفاحصين' : 'Active TCP Tarpit Handshake Stall'}</span>
                <input
                  type="checkbox"
                  checked={defenseTcpTarpitActive}
                  onChange={(e) => setDefenseTcpTarpitActive(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Decoy Screen & Trap Output */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              {isAr ? 'شاشة مراقبة تفاعل المهاجم مع المصيدة' : 'Deception Sensor & Decoy Telemetry'}
            </h3>
            <button
              onClick={handleRunDeceptionSimulation}
              disabled={isSimulating}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-emerald-400/30 disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'محاكاة استدراج المهاجم' : 'Simulate Attacker Probe'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'المصيدة/العنصر الخادع المنشور:' : 'Planted Bait Artifact:'}</span>
            <span className="text-amber-400 font-bold">{scenario.decoyArtifact}</span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300">
            <span>Attacker Command Executed: </span>
            <strong className="text-rose-400">{scenario.attackerAction}</strong>
          </div>

          {/* Deception Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[200px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل أحداث غرفة العمليات والاستدراج' : 'Deception Fabric Incident Log'}</span>
            </div>

            {deceptionLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    deceptionLog.status === 'ATTACKER_DECEIVED_TRAPPED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-amber-950/50 border-amber-800 text-amber-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {deceptionLog.status === 'ATTACKER_DECEIVED_TRAPPED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم استدراج المهاجم وحصره في المصيدة بنجاح' : 'THREAT ACTOR ENTANGLED IN HONEYPOT'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? 'تم رصد المهاجم دون عزله تلقائياً' : 'ATTACKER PROBE DETECTED (NO ISOLATION)'}</span>
                      </>
                    )}
                  </div>
                  {deceptionLog.telemetryReport}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {deceptionLog.socResponse}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Boxes className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "محاكاة استدراج المهاجم" لمعاينة استجابة شبكة الخداع النشط.'
                    : 'Select a deception scenario and click "Simulate Attacker Probe".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
