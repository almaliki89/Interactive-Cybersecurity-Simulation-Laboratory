import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Shield,
  Lock,
  Database,
  Server,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Play,
} from 'lucide-react';

export const CiaTriadSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);

  // CIA Controls State
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [signingEnabled, setSigningEnabled] = useState(true);
  const [redundancyEnabled, setRedundancyEnabled] = useState(true);

  // Attack Injections
  const [eavesdroppingAttack, setEavesdroppingAttack] = useState(false);
  const [tamperingAttack, setTamperingAttack] = useState(false);
  const [dosAttack, setDosAttack] = useState(false);

  // Calculated CIA Health
  const confidentialityScore = encryptionEnabled ? (eavesdroppingAttack ? 95 : 100) : eavesdroppingAttack ? 15 : 60;
  const integrityScore = signingEnabled ? (tamperingAttack ? 90 : 100) : tamperingAttack ? 20 : 65;
  const availabilityScore = redundancyEnabled ? (dosAttack ? 85 : 100) : dosAttack ? 10 : 70;

  const overallRisk = Math.round(
    100 - (confidentialityScore * 0.35 + integrityScore * 0.35 + availabilityScore * 0.3)
  );

  const challenge: Challenge = {
    id: 'cia-balance-challenge',
    simulationId: 'landing',
    title: language === 'ar' ? 'تحدي موازنة ثالوث CIA وتخفيض الخطر' : 'CIA Triad & Risk Reduction Challenge',
    difficulty: 'Beginner',
    category: language === 'ar' ? 'أسس ومفاهيم الأمن' : 'Foundations',
    mission:
      language === 'ar'
        ? 'قم بتأمين المؤسسة الرقمية بتفعيل التشفير والتوقيع الرقمي وتكرار الخوادم لصد الهجمات وتخفيض الخطر إلى أقل من 20%.'
        : 'Secure the digital enterprise by enabling Encryption, Integrity Signatures, and High Availability redundancy.',
    initialExplanation:
      language === 'ar'
        ? 'السرية تحمي من التنصت، والسلامة تحمي من التلاعب، والتوافر يحمي من انقطاع الخدمة.'
        : 'Confidentiality guards data secrecy, Integrity stops tampering, and Availability guarantees uptime.',
    objectives: [
      {
        id: 'obj-confidentiality',
        title: language === 'ar' ? 'حماية السرية بالتشفير' : 'Enforce Confidentiality with Encryption',
        description: language === 'ar' ? 'تفعيل تشفير البيانات في القرص وأثناء النقل' : 'Enable at-rest & in-transit AES encryption',
        isCompleted: encryptionEnabled,
        validationKey: 'conf_ok',
      },
      {
        id: 'obj-integrity',
        title: language === 'ar' ? 'حماية السلامة بالتجزئة والتوقيع' : 'Enforce Integrity with Digital Signatures',
        description: language === 'ar' ? 'تفعيل خوارزميات التجزئة لمنع التلاعب' : 'Enable cryptographic HMAC / SHA-256 validation',
        isCompleted: signingEnabled,
        validationKey: 'integ_ok',
      },
      {
        id: 'obj-availability',
        title: language === 'ar' ? 'ضمان التوافر بتكرار الخوادم' : 'Ensure Availability with Redundancy',
        description: language === 'ar' ? 'توزيع الحمل وتكرار خوادم التطبيقات' : 'Deploy redundant nodes and load balancing',
        isCompleted: redundancyEnabled,
        validationKey: 'avail_ok',
      },
    ],
    hints: [
      language === 'ar' ? 'قم بتفعيل جميع ضوابط الحماية الثلاثة لصد الهجمات.' : 'Enable all three protection controls.',
    ],
  };

  const validateChallenge = () => {
    if (encryptionEnabled && signingEnabled && redundancyEnabled && overallRisk < 20) {
      return {
        success: true,
        message:
          language === 'ar'
            ? 'ممتاز! تم تحصين ثالوث CIA وتخفيض الخطر المؤسسي بنجاح!'
            : 'Excellent! CIA Triad secured and enterprise risk successfully minimized!',
      };
    }
    return {
      success: false,
      message:
        language === 'ar'
          ? 'ما زالت هناك ثغرات في أحد محاور ثالوث CIA تؤدي لارتفاع الخطر.'
          : 'Security controls are incomplete; risk remains elevated.',
    };
  };

  return (
    <Workspace
      title={language === 'ar' ? 'محاكي ثالوث CIA ومقياس المخاطر الديناميكي' : 'CIA Triad & Dynamic Risk Visualizer'}
      subtitle={language === 'ar' ? 'السرية، السلامة، التوافر، وحساب أثر التهديدات' : 'Confidentiality, Integrity, Availability & Threat Impact'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase font-mono">
              {language === 'ar' ? 'حقن الهجمات السيبرانية:' : 'Inject Cyber Attacks:'}
            </span>
            <button
              onClick={() => setEavesdroppingAttack(!eavesdroppingAttack)}
              className={`py-1 px-2.5 rounded text-xs font-mono font-bold transition-colors border ${
                eavesdroppingAttack
                  ? 'bg-rose-950 border-rose-600 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'هجوم تنصت (MITM)' : 'Eavesdropping'}
            </button>
            <button
              onClick={() => setTamperingAttack(!tamperingAttack)}
              className={`py-1 px-2.5 rounded text-xs font-mono font-bold transition-colors border ${
                tamperingAttack
                  ? 'bg-rose-950 border-rose-600 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'هجوم تلاعب بالبيانات' : 'Data Tampering'}
            </button>
            <button
              onClick={() => setDosAttack(!dosAttack)}
              className={`py-1 px-2.5 rounded text-xs font-mono font-bold transition-colors border ${
                dosAttack
                  ? 'bg-rose-950 border-rose-600 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'هجوم حجب خدمة (DoS)' : 'DoS Overload'}
            </button>
          </div>

          {/* Defense Controls */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={encryptionEnabled}
                onChange={(e) => setEncryptionEnabled(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'التشفير (AES-256)' : 'AES Encryption'}</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={signingEnabled}
                onChange={(e) => setSigningEnabled(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'التوقيع (SHA-256)' : 'HMAC Signing'}</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={redundancyEnabled}
                onChange={(e) => setRedundancyEnabled(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'تكرار الخوادم (HA)' : 'HA Redundancy'}</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        {/* Dynamic Risk Gauge Card */}
        <div className="max-w-4xl w-full mb-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              {language === 'ar' ? 'مؤشر الخطر الإجمالي للمؤسسة:' : 'Calculated Enterprise Risk Score:'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-4xl font-extrabold font-mono tabular-nums ${
                  overallRisk <= 20
                    ? 'text-emerald-400'
                    : overallRisk <= 50
                    ? 'text-amber-400'
                    : 'text-rose-400 animate-pulse'
                }`}
              >
                {overallRisk}%
              </span>
              <span className="text-xs text-slate-400">
                {overallRisk <= 20
                  ? (language === 'ar' ? 'مستوى خطر منخفض وآمن' : 'Low & Acceptable Risk')
                  : overallRisk <= 50
                  ? (language === 'ar' ? 'مستوى خطر متوسط يحتاج تحصين' : 'Moderate Exposure')
                  : (language === 'ar' ? 'مستوى خطر حرج وشديد الانكشاف' : 'Critical Exposure')}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 max-w-sm">
            {language === 'ar'
              ? 'الخطر = (احتمالية التهديد × الأثر على الأصول) ÷ كفاءة الضوابط الدفاعية المفعلة.'
              : 'Risk = (Threat Likelihood × Asset Impact) ÷ Deployed Protective Controls.'}
          </div>
        </div>

        {/* The 3 CIA Pillars Visualizer */}
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* 1. Confidentiality */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              confidentialityScore >= 80
                ? 'bg-slate-900/60 border-emerald-500/60'
                : 'bg-rose-950/20 border-rose-600/80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <span
                className={`text-sm font-mono font-bold ${
                  confidentialityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {confidentialityScore}%
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {language === 'ar' ? '1. السرية (Confidentiality)' : '1. Confidentiality'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {language === 'ar'
                ? 'منع الاطلاع غير المصرح به على البيانات الحساسة.'
                : 'Preventing unauthorized data access and eavesdropping.'}
            </p>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                encryptionEnabled ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              }`}
            >
              {encryptionEnabled
                ? (language === 'ar' ? 'محمي بالتشفير AES' : 'AES Encrypted')
                : (language === 'ar' ? 'نص مكشوف غير مشفر' : 'Cleartext Exposed')}
            </span>
          </div>

          {/* 2. Integrity */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              integrityScore >= 80
                ? 'bg-slate-900/60 border-emerald-500/60'
                : 'bg-rose-950/20 border-rose-600/80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <span
                className={`text-sm font-mono font-bold ${
                  integrityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {integrityScore}%
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {language === 'ar' ? '2. السلامة (Integrity)' : '2. Integrity'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {language === 'ar'
                ? 'منع التعديل أو التلاعب غير المصرح به بالبيانات.'
                : 'Ensuring information is authentic and untampered.'}
            </p>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                signingEnabled ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              }`}
            >
              {signingEnabled
                ? (language === 'ar' ? 'تجزئة وتوقيع رقمي موثق' : 'HMAC Verified')
                : (language === 'ar' ? 'عرضة للتلاعب الصامت' : 'Tamper Prone')}
            </span>
          </div>

          {/* 3. Availability */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              availabilityScore >= 80
                ? 'bg-slate-900/60 border-emerald-500/60'
                : 'bg-rose-950/20 border-rose-600/80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <span
                className={`text-sm font-mono font-bold ${
                  availabilityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {availabilityScore}%
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {language === 'ar' ? '3. التوافر (Availability)' : '3. Availability'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {language === 'ar'
                ? 'ضمان وصول المستخدمين المصرح لهم للخدمة عند الحاجة.'
                : 'Ensuring continuous access to services upon demand.'}
            </p>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                redundancyEnabled ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              }`}
            >
              {redundancyEnabled
                ? (language === 'ar' ? 'تكرار خوادم وتوزيع حمل' : 'HA Cluster')
                : (language === 'ar' ? 'نقطة فشل واحدة (SPOF)' : 'Single Point Failure')}
            </span>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
