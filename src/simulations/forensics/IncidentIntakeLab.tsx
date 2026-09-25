import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { createDefaultForensicsCase } from './logic/evidence';
import { ShieldAlert, CheckCircle2, UserCheck, Server, FileText } from 'lucide-react';

export const IncidentIntakeLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const defaultCase = createDefaultForensicsCase(0);
  const [scopedHosts, setScopedHosts] = useState<string[]>(['FIN-WS-01']);
  const [caseStatus, setCaseStatus] = useState<string>('OPEN');

  const toggleHost = (host: string) => {
    if (scopedHosts.includes(host)) {
      setScopedHosts(scopedHosts.filter((h) => h !== host));
    } else {
      setScopedHosts([...scopedHosts, host]);
    }
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>{isAr ? 'معمل استلام الحادثة وتحديد النطاق' : 'Incident Intake & Scope Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? `تلقي بلاغ SOC واستقبال القضية: ${defaultCase.id}` : `SOC Incident Escalation Intake: ${defaultCase.id}`}
          </h1>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold">
          {defaultCase.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'تفاصيل الحادثة المحولة من مركز العمليات الأمنية SOC' : 'Escalated SOC Incident Details'}</span>
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">{isAr ? 'معرف الحادثة المصدر' : 'Source Incident ID'}</span>
              <span className="font-mono text-slate-200 font-bold">{defaultCase.sourceIncidentId}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">{isAr ? 'زمن الاكتشاف الافتراضي' : 'Virtual Opened Time'}</span>
              <span className="font-mono text-slate-200 font-bold">T+{defaultCase.openedAtVirtualTime}ms</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 mb-2">{isAr ? 'عنوان القضية والتصنيف' : 'Case Title & Overview'}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr ? defaultCase.titleAr : defaultCase.titleEn}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'تحديد الأجهزة المتأثرة وضبط نطاق التحقيق (Scope)' : 'Select Affected Hosts & Scope Scope'}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {defaultCase.affectedHosts.map((host) => {
                const isSelected = scopedHosts.includes(host);
                return (
                  <button
                    key={host}
                    onClick={() => toggleHost(host)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{host}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>{isAr ? 'المستخدمون والموارد المستهدفة' : 'Targeted Users & Resources'}</span>
          </h2>
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">{isAr ? 'المستخدمون المشتبه بهم' : 'Affected Users'}</span>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {defaultCase.affectedUsers.map((u) => (
                  <span key={u} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                    {u}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">{isAr ? 'الموارد الحساسة المستهدفة' : 'Impacted Resources'}</span>
              <div className="flex flex-col gap-1 mt-1 font-mono text-[11px] text-amber-300">
                {defaultCase.affectedResources.map((r) => (
                  <div key={r} className="truncate">{r}</div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCaseStatus('ACQUIRING')}
              className="mt-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-lg shadow-cyan-900/40"
            >
              {isAr ? 'اعتماد نطاق التحقيق والانتقال لحفظ الأدلة' : 'Confirm Scope & Proceed to Acquisition'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
