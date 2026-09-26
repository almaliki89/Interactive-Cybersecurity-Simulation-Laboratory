import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useForensicsStore } from '../../stores/forensicsStore';
import { evaluateRootCauseFinding, RootCauseFinding } from './logic/rootCause';
import { Target, ShieldCheck, AlertTriangle, CheckCircle2, FileText, Database, ClipboardCheck } from 'lucide-react';

export const RootCauseAnalysisLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const evidence = useForensicsStore((s) => s.evidence);

  const [initialAccess, setInitialAccess] = useState('Brute-force RDP password spray on FIN-WS-01');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);

  const toggleEvidence = (id: string) => {
    if (selectedEvidence.includes(id)) {
      setSelectedEvidence(selectedEvidence.filter((e) => e !== id));
    } else {
      setSelectedEvidence([...selectedEvidence, id]);
    }
  };

  const finding: RootCauseFinding = {
    initialAccessVector: initialAccess,
    affectedIdentity: 'sara',
    affectedHost: 'FIN-WS-01',
    privilegeChange: 'Domain Admins',
    impactedResources: ['\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx'],
    evidenceIds: selectedEvidence,
  };

  const evalRes = evaluateRootCauseFinding(finding, evidence.map(e => e.id));

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>{isAr ? 'معمل تحليل السبب الجذر والإسناد الجنائي' : 'Root Cause Analysis Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'تحديد السبب الجذر المدعوم بالأدلة' : 'EVIDENCE_BACKED_ROOT_CAUSE'}
          </h1>
        </div>

        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${
          evalRes.valid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {evalRes.valid ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{evalRes.valid ? (isAr ? 'فرضية معتمدة' : 'FINDING_VALIDATED') : (isAr ? 'أدلة غير كافية' : 'INSUFFICIENT_EVIDENCE')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              {isAr ? 'صياغة الاستنتاج الجنائي' : 'INVESTIGATION_CONCLUSION'}
            </h2>

            <div className="space-y-4 text-[11px]">
              <div>
                <label className="text-slate-500 font-black uppercase tracking-widest block mb-1.5">{isAr ? 'متجه الدخول الأولي' : 'INITIAL_ACCESS_VECTOR'}</label>
                <input
                  type="text"
                  value={initialAccess}
                  onChange={(e) => setInitialAccess(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="text-slate-500 font-black uppercase tracking-widest block mb-2">{isAr ? 'ربط الأدلة المكتسبة (يلزم 3 على الأقل)' : 'ATTACH_ACQUIRED_EVIDENCE (MIN_3)'}</label>
                <div className="grid grid-cols-1 gap-2">
                  {evidence.map((e) => {
                    const isChecked = selectedEvidence.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        onClick={() => toggleEvidence(e.id)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between text-left ${
                          isChecked
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           <Database className={`w-3.5 h-3.5 ${isChecked ? 'text-cyan-400' : 'text-slate-700'}`} />
                           <div className="flex flex-col">
                              <span className="font-mono text-[10px] font-black uppercase tracking-tight">{e.id}</span>
                              <span className="text-[9px] opacity-60 uppercase">{e.type.replace('_', ' ')}</span>
                           </div>
                        </div>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-500" />
              <span>{isAr ? 'تقرير التحقق من النتائج' : 'VALIDATION_REPORT'}</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-4 text-[11px] font-mono">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 uppercase">{isAr ? 'حالة الدعم بالأدلة:' : 'SUPPORT_STATUS:'}</span>
                <span className={`font-black uppercase ${evalRes.supportedByEvidence ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {evalRes.supportedByEvidence ? (isAr ? 'مدعوم بالأدلة' : 'EVIDENCE_SUPPORTED') : (isAr ? 'غير مدعوم' : 'UNSUPPORTED')}
                </span>
              </div>

              <div className="space-y-2">
                {evalRes.reasonsEn.map((r, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-400 leading-relaxed italic bg-black/20 p-2 rounded-lg border border-slate-900">
                    <span className="text-cyan-500">»</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col items-center justify-center text-center space-y-3">
             <Target className="w-8 h-8 text-indigo-500/50" />
             <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed">
               {isAr ? 'بمجرد اعتماد السبب الجذر، انتقل لمرحلة الاحتواء والاستجابة' : 'ONCE ROOT CAUSE IS VALIDATED, PROCEED TO CONTAINMENT & RESPONSE'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
