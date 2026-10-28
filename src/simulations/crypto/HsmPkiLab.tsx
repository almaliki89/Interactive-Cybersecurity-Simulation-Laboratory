import React, { useState, useMemo } from 'react';
import {
  Key,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Lock,
  Unlock,
  RefreshCw,
  Cpu,
  Layers,
  FileCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server,
} from 'lucide-react';

interface HsmPkiLabProps {
  language?: 'ar' | 'en';
}

interface HsmOperation {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'KEY_ZEROIZATION' | 'QUORUM_SHARDS' | 'OCSP_REVOCATION';
  pkcs11Function: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const HSM_OPERATIONS: HsmOperation[] = [
  {
    id: 'HSM-01',
    nameEn: 'Physical Tamper Detection & Key Zeroization (FIPS 140-3)',
    nameAr: 'كشف العبث الفيزيائي وتصفير المفاتيح التلقائي',
    category: 'KEY_ZEROIZATION',
    pkcs11Function: 'C_DestroyObject(CK_TRUE) // Tamper Sensors Triggered',
    descriptionEn: 'Simulates physical drilling or thermal attack on HSM mesh casing; internal circuitry zeroizes root master keys in 5 nanoseconds.',
    descriptionAr: 'محاكاة محاولة ثقب فيزيائي أو حراري لغلاف HSM؛ الدوائر الداخلية تصفر المفاتيح الجذرية خلال 5 نانو ثانية.',
    isThreat: true,
  },
  {
    id: 'HSM-02',
    nameEn: 'M-of-N Quorum Secret Reconstruction (Shamir Secret Sharing)',
    nameAr: 'إعادة بناء المفتاح المشترك عبر نصاب النصاب (M-of-N Shamir)',
    category: 'QUORUM_SHARDS',
    pkcs11Function: 'C_InitToken_ShamirQuorum(Threshold=3, TotalShards=5)',
    descriptionEn: 'Splits Root CA private key into 5 cryptographic polynomial shards; strictly requires 3 distinct key custodians to authorize signing.',
    descriptionAr: 'يقسم مفتاح سلطة الشهادات الجذري إلى 5 أجزاء متعددة الحدود؛ يتطلب حصراً موافقة 3 أمناء مفاتيح معتمدين للتوقيع.',
    isThreat: false,
  },
  {
    id: 'HSM-03',
    nameEn: 'Compromised Intermediate CA & OCSP Stapling Revocation',
    nameAr: 'استدعاء فوري للشهادات المخترقة عبر OCSP Stapling',
    category: 'OCSP_REVOCATION',
    pkcs11Function: 'OCSP_Response_Generate(status=REVOKED, reason=KEY_COMPROMISE)',
    descriptionEn: 'Intermediate CA private key compromised; PKI issues immediate cryptographically signed OCSP response to prevent browser trust.',
    descriptionAr: 'اختراق مفتاح سلطة وسيطة؛ تصدر منظومة PKI استجابة OCSP موقعة فورية لإبطال الثقة بالشهادات المزورة.',
    isThreat: true,
  },
];

export const HsmPkiLab: React.FC<HsmPkiLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedOpId, setSelectedOpId] = useState<string>('HSM-01');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Quorum Assembly State
  const [selectedShardsCount, setSelectedShardsCount] = useState<number>(2); // Default 2/5 (Under threshold 3)

  const [hsmLog, setHsmLog] = useState<{
    status: 'HSM_SECURE_COMPLIANT' | 'SECURITY_FAILURE';
    outputReport: string;
    actionSummary: string;
    activeDefenses: string[];
  } | null>(null);

  // HSM Guardrails
  const [defenseTamperZeroize, setDefenseTamperZeroize] = useState<boolean>(false);
  const [defenseEnforceQuorumThreshold, setDefenseEnforceQuorumThreshold] = useState<boolean>(true);
  const [defenseOcspStaplingEnforce, setDefenseOcspStaplingEnforce] = useState<boolean>(false);

  const operation = useMemo(
    () => HSM_OPERATIONS.find((h) => h.id === selectedOpId) || HSM_OPERATIONS[0],
    [selectedOpId]
  );

  const handleExecuteHsmOperation = () => {
    setIsExecuting(true);
    setHsmLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isSuccess = false;

      if (operation.category === 'KEY_ZEROIZATION') {
        if (defenseTamperZeroize) {
          activeDefenses.push('FIPS 140-3 Level 4 Active Tamper Response: Immediate Cryptographic Memory Wipe');
          isSuccess = true;
        }
      } else if (operation.category === 'QUORUM_SHARDS') {
        if (selectedShardsCount >= 3) {
          activeDefenses.push(`Shamir Polynomial Solved: ${selectedShardsCount}/5 Authorized Custodians Present`);
          isSuccess = true;
        }
      } else if (operation.category === 'OCSP_REVOCATION') {
        if (defenseOcspStaplingEnforce) {
          activeDefenses.push('RFC 6960 OCSP Stapling with High-Speed HSM Signed Revocation Timestamp');
          isSuccess = true;
        }
      }

      if (isSuccess) {
        setHsmLog({
          status: 'HSM_SECURE_COMPLIANT',
          outputReport: isAr
            ? `[نجاح إجراءات HSM / PKI] تمت العملية بالتوافق مع معايير الأمان العتادية المشددة (${operation.nameAr}).`
            : `[HSM / PKI OPERATION COMPLIANT] Security controls verified successfully for ${operation.nameEn}.`,
          actionSummary: isAr
            ? 'المفاتيح الجذرية في أمان تام أو تم اكتمال النصاب القانوني Shamir Quorum بنجاح.'
            : 'Root of Trust preserved. Zeroization or quorum threshold strictly enforced.',
          activeDefenses,
        });
      } else {
        setHsmLog({
          status: 'SECURITY_FAILURE',
          outputReport: isAr
            ? `[خلل أمني / عدم اكتمال النصاب] لم تكتمل شروط الأمان المطلوبة للعملية (${operation.nameAr}).`
            : `[SECURITY AUDIT FAILURE] Inadequate tamper defenses or insufficient Shamir quorum shards!`,
          actionSummary: isAr
            ? 'تحذير: تسريب المفتاح أو عدم اكتمال نصاب التوقيع القانوني (يجب 3 أمناء على الأقل).'
            : 'ALERT: Master key compromised due to disabled zeroization or insufficient custodians.',
          activeDefenses: [],
        });
      }

      setIsExecuting(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر وحدات الأمان العتادية وإدارة المفاتيح الجذرية (HSM & PKI Architecture)' : 'Hardware Security Module (HSM) & Enterprise PKI Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800 rounded-full font-mono">
                FIPS 140-3 Level 4 / PKCS#11
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تصفير المفاتيح العتادية، وتجزئة المفاتيح المشتركة Shamir Quorum، واستدعاء الشهادات OCSP.'
                : 'Interactive FIPS tamper zeroization, M-of-N Shamir secret sharing, and OCSP certificate revocation.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة وحدة HSM:' : 'HSM Appliance State:'}</span>
          <span className="px-2 py-1 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded font-bold">
            FIPS LEVEL 4 TAMPER-ACTIVE
          </span>
        </div>
      </div>

      {/* Main Grid: HSM Operations Selection + Quorum Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Operation Selector + Controls */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'عمليات HSM وإدارة PKI' : 'HSM & PKI Operations'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {HSM_OPERATIONS.map((op) => {
              const isSelected = op.id === selectedOpId;
              return (
                <button
                  key={op.id}
                  onClick={() => setSelectedOpId(op.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 text-slate-100 shadow-md shadow-indigo-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">{op.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {op.category}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? op.nameAr : op.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? op.descriptionAr : op.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* HSM Security Controls */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'ضوابط وسياسات الأمان العتادية' : 'HSM Security Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تصفير الذاكرة الفوري عند العبث الفيزيائي' : 'FIPS Tamper Active Zeroization'}</span>
                <input
                  type="checkbox"
                  checked={defenseTamperZeroize}
                  onChange={(e) => setDefenseTamperZeroize(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'فرض استجابة OCSP Stapling الفورية' : 'RFC 6960 OCSP Stapling Enforcement'}</span>
                <input
                  type="checkbox"
                  checked={defenseOcspStaplingEnforce}
                  onChange={(e) => setDefenseOcspStaplingEnforce(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Shamir Quorum Slider & PKCS#11 Console */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              {isAr ? 'منصة تنفيذ تعليمات PKCS#11' : 'PKCS#11 Cryptographic Console'}
            </h3>
            <button
              onClick={handleExecuteHsmOperation}
              disabled={isExecuting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-indigo-400/30 disabled:opacity-50"
            >
              {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              {isAr ? 'تنفيذ عملية HSM' : 'Execute HSM Command'}
            </button>
          </div>

          {/* PKCS#11 API Call Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'استدعاء دالة PKCS#11 API المستهدفة:' : 'Target PKCS#11 API Routine:'}</span>
            <span className="text-indigo-300 font-bold">{operation.pkcs11Function}</span>
          </div>

          {/* Shamir Quorum Selector if applicable */}
          {operation.category === 'QUORUM_SHARDS' && (
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span>{isAr ? 'أمناء المفاتيح الحاضرون (حصة النصاب):' : 'Key Custodians Present (Threshold = 3 of 5):'}</span>
                <span className={selectedShardsCount >= 3 ? 'text-emerald-400' : 'text-rose-400'}>
                  {selectedShardsCount} / 5 Shards
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={selectedShardsCount}
                onChange={(e) => setSelectedShardsCount(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'يتطلب معيار Shamir تواجد 3 أمناء على الأقل لدمج كثيرات الحدود الرياضية واستعادة المفتاح الجذري.'
                  : 'Requires at least 3 of 5 polynomial shards to reconstruct Root CA private key.'}
              </p>
            </div>
          )}

          {/* Operation Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل أحداث وحدة الأمان العتادية' : 'HSM Appliance Security Log'}</span>
            </div>

            {hsmLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    hsmLog.status === 'HSM_SECURE_COMPLIANT'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {hsmLog.status === 'HSM_SECURE_COMPLIANT' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تمت العملية بتوافق أمني كامل' : 'HSM FIPS COMPLIANCE CONFIRMED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'فشل التحقق الأمني أو عدم اكتمال النصاب' : 'SECURITY CRITERIA BREACHED'}</span>
                      </>
                    )}
                  </div>
                  {hsmLog.outputReport}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {hsmLog.actionSummary}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Lock className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر عملية وانقر على "تنفيذ عملية HSM" لمعاينة استجابة وحدة الأمان العتادية.'
                    : 'Select an HSM operation and click "Execute HSM Command".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
