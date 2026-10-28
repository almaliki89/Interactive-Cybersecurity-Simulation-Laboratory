import React, { useState, useMemo } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Search,
  Mail,
  Fingerprint,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  FileText,
} from 'lucide-react';

interface SocialEngineeringOsintLabProps {
  language?: 'ar' | 'en';
}

interface SocialEngScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'SPEAR_PHISH_BEC' | 'METADATA_HARVEST' | 'MFA_PUSH_BOMB';
  payloadArtifact: string;
  targetVictim: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const SOCIAL_SCENARIOS: SocialEngScenario[] = [
  {
    id: 'SE-01',
    nameEn: 'Executive Spear Phishing & BEC Wire Transfer',
    nameAr: 'التصيد الرمحي الموجه واختراق البريد الإلكتروني للمدير (BEC)',
    category: 'SPEAR_PHISH_BEC',
    payloadArtifact: `From: "CEO John Doe" <ceo@nexora-corp-sec.com> (Lookalike Domain)
Reply-To: wire-transfer-agent@darkc2.org
Subject: URGENT: Acquisition Escrow Payment Wire $240,000 Today
[Embedded Malicious Link: https://nexora-corp-sec.com/login-verify.html]`,
    targetVictim: 'Finance Officer (accounting@nexora.corp)',
    descriptionEn: 'Attacker creates lookalike typo domain to impersonate CEO, urging emergency offshore wire transfer bypass.',
    descriptionAr: 'المهاجم ينشئ نطاق شبيه لنطاق الشركة لانتحال صفة المدير التنفيذي وطلب تحويل مالي طارئ.',
    isThreat: true,
  },
  {
    id: 'SE-02',
    nameEn: 'OSINT PDF/DOCX Metadata Reconnaissance',
    nameAr: 'استطلاع المصادر المفتوحة واستخراج ميتاداتا الوثائق المسربة',
    category: 'METADATA_HARVEST',
    payloadArtifact: `ExifTool Scan on Annual_Report.pdf:
Author: Sarah Connor (Username: sconnor)
Creator Tool: Microsoft Word 2016 (Build 16.0.4266.1001)
Internal Network Path: \\\\FILESRV01.NEXORA.LOCAL\\Finance\\2026\\
Internal Printer: HP LaserJet 4000 (IP: 10.10.4.52)`,
    targetVictim: 'Public Corporate Portal Document Downloads',
    descriptionEn: 'Passive OSINT reconnaissance extracts sensitive internal usernames, build versions, and domain paths from public PDFs.',
    descriptionAr: 'استطلاع سلبي عبر المصادر المفتوحة يستخرج أسماء مستخدمين ومسارات شبكة داخلية من ميتاداتا ملفات PDF.',
    isThreat: true,
  },
  {
    id: 'SE-03',
    nameEn: 'MFA Push Bombing & Notification Fatigue Attack',
    nameAr: 'هجوم إجهاد الإشعارات وتفجير مصادقة MFA Push Bombing',
    category: 'MFA_PUSH_BOMB',
    payloadArtifact: `MFA Push Notification Flood (42 prompts sent between 03:00 - 03:15 AM):
[Prompt 42: "Are you trying to sign in from Moscow, RU? [Approve] / [Deny]"]
Victim worn down by endless notifications presses "Approve" to silence device.`,
    targetVictim: 'Domain Administrator Mobile Phone',
    descriptionEn: 'Attacker possessing stolen passwords floods victim phone with dozens of MFA push prompts in the middle of the night to coerce approval.',
    descriptionAr: 'المهاجم يمتلك كلمة المرور ويغرق هاتف الضحية بعشرات إشعارات المصادقة ليلاً حتى يضغط المستخدم على "موافق" للتخلص من الإزعاج.',
    isThreat: true,
  },
];

export const SocialEngineeringOsintLab: React.FC<SocialEngineeringOsintLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SE-01');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationLog, setSimulationLog] = useState<{
    status: 'HUMAN_LAYER_PROTECTED' | 'SOCIAL_ENGINEERING_EXPLOITED';
    details: string;
    defenseReport: string;
    activeDefenses: string[];
  } | null>(null);

  // Human Layer & OSINT Defenses
  const [defenseStrictDmarc, setDefenseStrictDmarc] = useState<boolean>(false);
  const [defenseMetadataStripper, setDefenseMetadataStripper] = useState<boolean>(false);
  const [defenseNumberMatchingMfa, setDefenseNumberMatchingMfa] = useState<boolean>(false);

  const scenario = useMemo(
    () => SOCIAL_SCENARIOS.find((s) => s.id === selectedScenarioId) || SOCIAL_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunSocialSimulation = () => {
    setIsSimulating(true);
    setSimulationLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'SPEAR_PHISH_BEC' && defenseStrictDmarc) {
        activeDefenses.push('Strict DMARC Policy (p=reject) & AI Inbound Mail Domain Lookalike Filter');
        isBlocked = true;
      } else if (scenario.category === 'METADATA_HARVEST' && defenseMetadataStripper) {
        activeDefenses.push('Automated Document Metadata Sanitization Pipeline (Exif/Creator Stripped)');
        isBlocked = true;
      } else if (scenario.category === 'MFA_PUSH_BOMB' && defenseNumberMatchingMfa) {
        activeDefenses.push('FIDO2 WebAuthn Hardware Binding & 2-Digit Number Matching Verification');
        isBlocked = true;
      }

      if (isBlocked) {
        setSimulationLog({
          status: 'HUMAN_LAYER_PROTECTED',
          details: isAr
            ? 'تم إحباط هجوم الهندسة الاجتماعية وحماية العامل البشري بنجاح!'
            : 'HUMAN LAYER DEFENSE ACTIVE: Spoofed email rejected by DMARC, metadata purged, or number matching stopped push fatigue.',
          defenseReport: isAr
            ? 'المؤسسة في أمان: لم يتم تسريب أي بيانات أو التلاعب بمسؤولي المالية.'
            : 'Zero credentials compromise. Threat actor thwarted at organizational perimeter.',
          activeDefenses,
        });
      } else {
        setSimulationLog({
          status: 'SOCIAL_ENGINEERING_EXPLOITED',
          details: isAr
            ? 'تحذير: تم استغلال العامل البشري وتسريب المعلومات أو قبول طلب الدخول!'
            : 'CRITICAL SOCIAL ENGINEERING BREACH: Phishing link clicked, OSINT recon gathered, or MFA push accepted!',
          defenseReport: isAr
            ? `[تفاصيل أثر الهجوم]: ${scenario.payloadArtifact}`
            : `[EXPLOITATION TELEMETRY]: ${scenario.payloadArtifact}`,
          activeDefenses: [],
        });
      }

      setIsSimulating(false);
    }, 450);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر الهندسة الاجتماعية وهجمات العامل البشري (Social Engineering & OSINT)' : 'Advanced Social Engineering & OSINT Reconnaissance Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800 rounded-full font-mono">
                MITRE ATT&CK T1566 / T1598
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لحملات التصيد الرمحي BEC، واستخراج الميتاداتا عبر OSINT، وهجمات تفجير الإشعارات MFA Fatigue.'
                : 'Interactive Spear Phishing simulations, Exif metadata reconnaissance, and MFA Push Bombing mitigations.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة التوعية الأمنية:' : 'Human Layer Posture:'}</span>
          <span className="px-2 py-1 bg-rose-950 border border-rose-800 text-rose-300 rounded font-bold">
            HUMAN FIREWALL ACTIVE
          </span>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selection + Attack Artifact Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات الهندسة الاجتماعية' : 'Social Engineering Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {SOCIAL_SCENARIOS.map((sc) => {
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

          {/* Social Engineering Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع تحصين العامل البشري وبوابات البريد' : 'Human Layer & Gateway Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'سياسة DMARC المشددة (p=reject) وفلترة النطاقات' : 'Strict DMARC (p=reject) & Lookalike Filter'}</span>
                <input
                  type="checkbox"
                  checked={defenseStrictDmarc}
                  onChange={(e) => setDefenseStrictDmarc(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تطهير وإزالة ميتاداتا الوثائق المنشورة آلياً' : 'Automated Document Metadata Stripping'}</span>
                <input
                  type="checkbox"
                  checked={defenseMetadataStripper}
                  onChange={(e) => setDefenseMetadataStripper(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'مطابقة الأرقام في MFA بدلاً من النقر المباشر' : 'Number-Matching MFA (No Push Fatigue)'}</span>
                <input
                  type="checkbox"
                  checked={defenseNumberMatchingMfa}
                  onChange={(e) => setDefenseNumberMatchingMfa(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Artifact Screen & Simulation Output */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-400" />
              {isAr ? 'شاشة معاينة حمولة الهجوم واستجابة الضحية' : 'Social Engineering Artifact Inspector'}
            </h3>
            <button
              onClick={handleRunSocialSimulation}
              disabled={isSimulating}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-rose-400/30 disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'إطلاق سيناريو الهجوم' : 'Launch Scenario'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'الموظف/الجهة المستهدفة:' : 'Target Employee Persona:'}</span>
            <span className="text-rose-400 font-bold">{scenario.targetVictim}</span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300 overflow-x-auto max-h-[140px] whitespace-pre-wrap">
            {scenario.payloadArtifact}
          </div>

          {/* Simulation Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[200px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'تقرير استجابة الدفاع والعامل البشري' : 'Human Layer Threat Outcome Stream'}</span>
            </div>

            {simulationLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    simulationLog.status === 'HUMAN_LAYER_PROTECTED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {simulationLog.status === 'HUMAN_LAYER_PROTECTED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم إحباط الهجوم وحماية المؤسسة' : 'SOCIAL ENGINEERING DEFENDED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم استغلال الضحية واختراق الحساب!' : 'HUMAN ELEMENT COMPROMISED'}</span>
                      </>
                    )}
                  </div>
                  {simulationLog.details}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {simulationLog.defenseReport}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Users className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "إطلاق سيناريو الهجوم" لمعاينة استجابة الدفاعات وسياسات DMARC/MFA.'
                    : 'Select a scenario and click "Launch Scenario" to test DMARC and number-matching resilience.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
