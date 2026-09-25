import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { evaluateRootCauseFinding, RootCauseFinding } from './logic/rootCause';
import { Target, ShieldCheck, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

export const RootCauseAnalysisLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [initialAccess, setInitialAccess] = useState('Brute-force RDP password spray on FIN-WS-01');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([
    'EVD-LOG-WIN-SEC',
    'EVD-MEM-FIN-WS01',
    'EVD-DISK-FIN-WS01',
  ]);

  const availableEvidence = [
    { id: 'EVD-LOG-WIN-SEC', label: 'EventLog 4625/4624 & 4728 Domain Admin Group Change' },
    { id: 'EVD-MEM-FIN-WS01', label: 'RAM Memory Dump (cmd.exe pid 4912 spawned)' },
    { id: 'EVD-DISK-FIN-WS01', label: 'NTFS Filesystem (Q3_Report.xlsx access & dropped stager)' },
    { id: 'EVD-LOG-LINUX-AUTH', label: 'Linux Auth Log (python3 process execution)' },
    { id: 'EVD-NET-PCAP-01', label: 'PCAP Capture (PostgreSQL port scan blocked)' },
  ];

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

  const evalRes = evaluateRootCauseFinding(finding, ['EVD-LOG-WIN-SEC', 'EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01', 'EVD-LOG-LINUX-AUTH', 'EVD-NET-PCAP-01']);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>{isAr ? 'معمل تحليل السبب الجذر والإسناد الجنائي' : 'Root Cause Analysis Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'تمييز الأعراض والمؤشرات وتحديد السبب الجذر المدعوم بالأدلة' : 'Evidence-Backed Root Cause & Initial Access Attribution'}
          </h1>
        </div>

        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
          evalRes.valid ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
        }`}>
          {evalRes.valid ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{evalRes.valid ? (isAr ? 'سبب جذر موثق بالأدلة' : 'Validated Finding') : (isAr ? 'أدلة غير كافية' : 'Insufficient Evidence')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'فرص وإسناد متجه الوصول الأولي' : 'Initial Access Vector Claim'}</span>
          </h2>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">{isAr ? 'متجه الدخول الأولي المحدد' : 'Identified Initial Access Vector'}</label>
              <input
                type="text"
                value={initialAccess}
                onChange={(e) => setInitialAccess(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-2">{isAr ? 'الأدلة المجمعة الداعمة للفرضية (يلزم 3 أدلة على الأقل)' : 'Attach Collected Evidence Items (At least 3 required)'}</label>
              <div className="flex flex-col gap-2">
                {availableEvidence.map((e) => {
                  const isChecked = selectedEvidence.includes(e.id);
                  return (
                    <div
                      key={e.id}
                      onClick={() => toggleEvidence(e.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isChecked
                          ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono">{e.id}: {e.label}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'تقييم كفاية الأدلة وسلامة الفرضية' : 'Evidence Attribution Evaluation'}</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">{isAr ? 'حالة الاعتماد بالأدلة:' : 'Evidence Support Status:'}</span>
              <span className={`font-bold ${evalRes.supportedByEvidence ? 'text-emerald-400' : 'text-rose-400'}`}>
                {evalRes.supportedByEvidence ? (isAr ? 'مدعوم بالأدلة الجنائية' : 'Supported by Evidence') : (isAr ? 'غير مدعوم بأدلة كافية' : 'Unsupported Hypothesis')}
              </span>
            </div>

            {evalRes.reasonsEn.map((r, idx) => (
              <p key={idx} className="text-slate-400 text-[11px] leading-relaxed mt-1">
                • {r}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
