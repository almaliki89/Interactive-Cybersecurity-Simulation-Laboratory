import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { CustodyRecord, addCustodyRecord, validateCustodyChain } from './logic/custody';
import { FileText, Plus, ShieldCheck, AlertTriangle, UserCheck } from 'lucide-react';

export const ChainOfCustodyLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [records, setRecords] = useState<CustodyRecord[]>([
    {
      id: 'CUST-001',
      evidenceId: 'EVD-DISK-FIN-WS01',
      virtualTime: 10,
      action: 'COLLECTED',
      actor: 'Investigator Lead (sara_forensics)',
      notes: 'Initial disk image acquisition from FIN-WS-01',
    },
    {
      id: 'CUST-002',
      evidenceId: 'EVD-DISK-FIN-WS01',
      virtualTime: 20,
      action: 'VERIFIED',
      actor: 'Evidence Officer (ahmed_sec)',
      notes: 'SHA-256 hash match verified on primary storage vault',
    },
  ]);

  const [evidenceId, setEvidenceId] = useState('EVD-DISK-FIN-WS01');
  const [action, setAction] = useState<'COLLECTED' | 'TRANSFERRED' | 'VERIFIED' | 'WORKING_COPY_CREATED' | 'ANALYZED'>('TRANSFERRED');
  const [actor, setActor] = useState('Analyst Reem');
  const [notes, setNotes] = useState('Transferred to evidence vault');

  const handleAddRecord = () => {
    if (!actor.trim()) return;
    const updated = addCustodyRecord(records, {
      evidenceId,
      virtualTime: 50,
      action,
      actor,
      notes,
    });
    setRecords(updated);
  };

  const validation = validateCustodyChain(
    'EVD-DISK-FIN-WS01',
    records,
    'sha256:4a8123901b238c9012389a012381203981203912039812039182309128309128',
    'sha256:4a8123901b238c9012389a012381203981203912039812039182309128309128'
  );

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'معمل سلسلة الحضانة والملكية الجنائية' : 'Chain of Custody Ledger Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'سجل الحضانة والملكية للأدلة الجنائية (Chain of Custody)' : 'Chain of Custody Immutable Documentation'}
          </h1>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
          validation.valid
            ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
            : 'bg-rose-950 border-rose-800 text-rose-300'
        }`}>
          {validation.valid ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{validation.valid ? (isAr ? 'سلسلة الحضانة مكتملة وموثوقة' : 'Chain Valid') : (isAr ? 'غير مكتملة' : 'Invalid Chain')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'سجلات الحضانة المسجلة للأدلة' : 'Recorded Custody Log Entries'}</span>
          </h2>

          <div className="flex flex-col gap-2">
            {records.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-bold">{r.id}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {r.action}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>{r.actor}</span>
                  <span className="text-slate-600">|</span>
                  <span className="font-mono text-slate-400">T+{r.virtualTime}ms</span>
                </div>
                <p className="text-[11px] text-slate-400 italic">{r.notes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة إجراء حضانة جديد' : 'Record New Custody Action'}</span>
          </h2>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">{isAr ? 'معرف الدليل' : 'Evidence ID'}</label>
              <input
                type="text"
                value={evidenceId}
                onChange={(e) => setEvidenceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">{isAr ? 'الإجراء المتخذ' : 'Action'}</label>
              <select
                value={action}
                onChange={(e: any) => setAction(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="COLLECTED">COLLECTED</option>
                <option value="TRANSFERRED">TRANSFERRED</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="WORKING_COPY_CREATED">WORKING_COPY_CREATED</option>
                <option value="ANALYZED">ANALYZED</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">{isAr ? 'الشخص المسؤول (Actor)' : 'Responsible Actor'}</label>
              <input
                type="text"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">{isAr ? 'ملاحظات التوثيق' : 'Custody Notes'}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 h-20"
              />
            </div>

            <button
              onClick={handleAddRecord}
              className="py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-lg"
            >
              {isAr ? 'توثيق إجراء الحضانة' : 'Record Custody Log Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
