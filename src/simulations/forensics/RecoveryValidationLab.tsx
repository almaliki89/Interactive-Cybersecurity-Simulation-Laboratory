import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { validateRecoveryState, SystemRecoveryState } from './logic/recovery';
import { RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export const RecoveryValidationLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [recState, setRecState] = useState<SystemRecoveryState>({
    compromisedAccountReset: true,
    unauthorizedPrivilegesReverted: true,
    suspiciousProcessesTerminated: true,
    maliciousFilesEradicated: true,
    auditLoggingEnabled: true,
    networkSecurityPoliciesApplied: true,
    businessApplicationTested: true,
    lingeringSuspiciousState: false,
  });

  const toggleCheck = (key: keyof SystemRecoveryState) => {
    setRecState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const valResult = validateRecoveryState(recState);

  const checkItems: { key: keyof SystemRecoveryState; labelEn: string; labelAr: string }[] = [
    { key: 'compromisedAccountReset', labelEn: 'Compromised Password Reset & MFA Enforced (User sara)', labelAr: 'إعادة ضبط كلمة سر سارة وتفعيل MFA' },
    { key: 'unauthorizedPrivilegesReverted', labelEn: 'Revert Domain Admin Elevation in Active Directory', labelAr: 'إلغاء رفع الصلاحيات بالدليل النشط' },
    { key: 'suspiciousProcessesTerminated', labelEn: 'Interactive Shell Process (cmd.exe / pid 4912) Terminated', labelAr: 'إنهاء العملية المشبوهة تفاعلياً' },
    { key: 'maliciousFilesEradicated', labelEn: 'Dropped Stager Payload Files Removed from Disk', labelAr: 'إزالة الملفات والبدائل الضارة من القرص' },
    { key: 'auditLoggingEnabled', labelEn: 'Security Event Logging Active & Event 1102 Auditing Enabled', labelAr: 'تفعيل وتسجيل تدقيق الأحداث الأمنية' },
    { key: 'networkSecurityPoliciesApplied', labelEn: 'Firewall Network Segment Restrictions Re-Verified', labelAr: 'إعادة توثيق قيود الجدار الناري' },
    { key: 'businessApplicationTested', labelEn: 'Finance Portal App Workflow Re-Validated Cleanly', labelAr: 'إعادة اختبار وسرعة عمل بوابة المالية' },
  ];

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'معمل التحقق من التعافي وتفعيل التسجيل الأمني' : 'Recovery & System Re-Validation Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'التحقق من خلو الأنظمة من التهديد واستعادة الجاهزية التشغيلية' : 'System Eradication Verification & Audit Logging Activation'}
          </h1>
        </div>

        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
          valResult.passed ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
        }`}>
          {valResult.passed ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{valResult.passed ? (isAr ? 'جاهز للإنتاج Production Ready' : 'Production Ready') : (isAr ? 'التعافي غير مكتمل' : 'Incomplete Recovery')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'قائمة الفحص والتحقق للتعافي' : 'Recovery Checklist Items'}</span>
          </h2>

          <div className="flex flex-col gap-2.5 text-xs">
            {checkItems.map((item) => {
              const checked = recState[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleCheck(item.key)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    checked
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-semibold">{isAr ? item.labelAr : item.labelEn}</span>
                  {checked ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'ملخص تقرير الجاهزية والتدقيق' : 'Recovery Status Report'}</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3 text-xs font-mono">
            <p className="text-slate-200 leading-relaxed font-bold">
              {isAr ? valResult.summaryAr : valResult.summaryEn}
            </p>

            {valResult.failedChecksEn.length > 0 && (
              <div className="flex flex-col gap-1 text-rose-300 text-[11px] mt-2 border-t border-slate-800 pt-2">
                <span className="font-bold">{isAr ? 'البنود المتبقية للتعافي:' : 'Remaining Issues:'}</span>
                {valResult.failedChecksEn.map((f, i) => (
                  <div key={i}>• {f}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
