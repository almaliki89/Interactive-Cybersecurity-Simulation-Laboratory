import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { validateRecoveryState, SystemRecoveryState } from './logic/recovery';
import { RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ClipboardCheck, LayoutList } from 'lucide-react';

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
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'معمل التحقق من التعافي وتفعيل التسجيل الأمني' : 'Recovery & System Re-Validation Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'التحقق من التعافي والاستعادة التشغيلية' : 'RECOVERY_VERIFICATION_&_OPERATIONAL_READY'}
          </h1>
        </div>

        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${
          valResult.passed 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {valResult.passed ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{valResult.passed ? (isAr ? 'جاهز للتشغيل PRODUCTION_READY' : 'PRODUCTION_READY') : (isAr ? 'التعافي غير مكتمل' : 'RECOVERY_INCOMPLETE')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <LayoutList className="w-4 h-4" />
              {isAr ? 'قائمة التحقق من التطهير' : 'ERADICATION_CHECKLIST'}
            </h2>
            <span className="text-[9px] font-mono text-slate-600 uppercase">
              {checkItems.filter(i => recState[i.key]).length} / {checkItems.length} {isAr ? 'بنود مكتملة' : 'TASKS_DONE'}
            </span>
          </div>

          <div className="space-y-2">
            {checkItems.map((item) => {
              const checked = recState[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleCheck(item.key)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                    checked
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-tight">{isAr ? item.labelAr : item.labelEn}</span>
                  <div className={`p-1 rounded-lg transition-colors ${checked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-700'}`}>
                    {checked ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'تقرير حالة التعافي' : 'RECOVERY_STATUS_REPORT'}</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-4 text-[11px] font-mono">
              <p className="text-slate-300 leading-relaxed italic bg-black/20 p-3 rounded-lg border border-slate-900">
                {isAr ? valResult.summaryAr : valResult.summaryEn}
              </p>

              {valResult.failedChecksEn.length > 0 && (
                <div className="space-y-2">
                  <span className="text-rose-400 font-black uppercase tracking-widest block mb-2">{isAr ? 'المخاطر المتبقية:' : 'REMAINING_RESIDUAL_RISKS:'}</span>
                  {valResult.failedChecksEn.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-rose-300/80 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                       <AlertTriangle className="w-3.5 h-3.5" />
                       <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {valResult.passed && (
                <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                   <ShieldCheck className="w-4 h-4" />
                   <span>{isAr ? 'تم التحقق من استعادة كافة الخدمات' : 'ALL_SERVICES_VALIDATED_FOR_RESUMPTION'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
