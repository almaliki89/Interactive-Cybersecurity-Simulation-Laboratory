import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useForensicsStore } from '../../stores/forensicsStore';
import { CustodyRecord, addCustodyRecord, validateCustodyChain } from './logic/custody';
import { FileText, Plus, ShieldCheck, AlertTriangle, UserCheck, History, ArrowRight, User, Award } from 'lucide-react';
import { ForensicsCertificateModal } from './components/ForensicsCertificateModal';

export const ChainOfCustodyLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const selectedEvidenceId = useForensicsStore((s) => s.selectedEvidenceId);
  const setSelectedEvidenceId = useForensicsStore((s) => s.setSelectedEvidenceId);
  const evidence = useForensicsStore((s) => s.evidence);
  const records = useForensicsStore((s) => s.custodyRecords);
  const addRecordToStore = useForensicsStore((s) => s.addCustodyRecord);

  const [targetEvidenceId, setTargetEvidenceId] = useState(selectedEvidenceId || (evidence.length > 0 ? evidence[0].id : ''));
  const [action, setAction] = useState<'COLLECTED' | 'TRANSFERRED' | 'VERIFIED' | 'WORKING_COPY_CREATED' | 'ANALYZED'>('TRANSFERRED');
  const [actor, setActor] = useState('Analyst Reem');
  const [notes, setNotes] = useState('Transferred to evidence vault');
  const [isCertOpen, setIsCertOpen] = useState(false);

  const handleAddRecord = () => {
    if (!actor.trim() || !targetEvidenceId) return;
    
    const virtualTime = useSimulationStore.getState().virtualTime || 50;
    const id = `CUST-${targetEvidenceId}-${records.length + 1}`;
    
    addRecordToStore({
      id,
      evidenceId: targetEvidenceId,
      virtualTime,
      action,
      actor,
      notes,
    });
  };

  const targetItem = evidence.find(ev => ev.id === targetEvidenceId);
  const validation = validateCustodyChain(
    targetEvidenceId,
    records,
    targetItem?.originalHash || '',
    targetItem?.currentHash || ''
  );

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>{isAr ? 'معمل سلسلة الحضانة والملكية الجنائية' : 'Chain of Custody Ledger Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'سجل الحضانة والملكية للأدلة الجنائية (Chain of Custody)' : 'CUSTODY_IMMUTABLE_LEDGER'}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCertOpen(true)}
            data-testid="btn-open-forensics-certificate"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-800 text-emerald-300 hover:text-white hover:border-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'الشهادة وحزمة الأدلة' : 'Certificate & Package'}</span>
          </button>

          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${
            validation.valid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {validation.valid ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{validation.valid ? (isAr ? 'سلسلة الحضانة صحيحة' : 'CHAIN_VALID') : (isAr ? 'سلسلة غير مكتملة' : 'INVALID_CHAIN')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              {isAr ? 'سجلات الحضانة المسجلة' : 'CUSTODY_RECORDS'}
            </h2>
            {targetEvidenceId && (
              <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase font-bold">
                {targetEvidenceId}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {records.filter(r => r.evidenceId === targetEvidenceId).length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-900 flex flex-col items-center gap-3 opacity-30">
                 <History className="w-8 h-8 text-slate-600" />
                 <p className="text-[10px] font-mono uppercase">{isAr ? 'لا توجد سجلات لهذا الدليل' : 'No records found for this evidence item'}</p>
              </div>
            ) : (
              records.filter(r => r.evidenceId === targetEvidenceId).map((r) => (
                <div key={r.id} className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono text-cyan-500 font-black tabular-nums">T+{r.virtualTime}ms</span>
                    <div className="w-px h-8 bg-slate-800 group-last:hidden" />
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                       <User className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                       <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-black uppercase tracking-widest">
                         {r.action}
                       </span>
                       <span className="text-[9px] font-mono text-slate-600 uppercase font-bold">{r.id}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-slate-200">{r.actor}</span>
                    </div>
                    
                    <p className="text-[11px] text-slate-400 italic bg-black/20 p-2.5 rounded-lg border border-slate-800/50">
                      {r.notes}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-5">
          <h2 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'توثيق إجراء جديد' : 'NEW_LOG_ENTRY'}</span>
          </h2>

          <div className="space-y-4 text-[11px]">
            <div>
              <label className="text-slate-500 font-black uppercase tracking-widest block mb-1.5">{isAr ? 'اختيار الدليل' : 'SELECT_EVIDENCE'}</label>
              <select
                value={targetEvidenceId}
                onChange={(e) => {
                  setTargetEvidenceId(e.target.value);
                  setSelectedEvidenceId(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {evidence.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.id} ({ev.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-black uppercase tracking-widest block mb-1.5">{isAr ? 'الإجراء المتخذ' : 'ACTION_TYPE'}</label>
              <select
                value={action}
                onChange={(e: any) => setAction(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="COLLECTED">COLLECTED</option>
                <option value="TRANSFERRED">TRANSFERRED</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="WORKING_COPY_CREATED">WORKING_COPY_CREATED</option>
                <option value="ANALYZED">ANALYZED</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-black uppercase tracking-widest block mb-1.5">{isAr ? 'الشخص المسؤول' : 'ACTOR_IDENTITY'}</label>
              <input
                type="text"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g. sara_forensics"
              />
            </div>

            <div>
              <label className="text-slate-500 font-black uppercase tracking-widest block mb-1.5">{isAr ? 'ملاحظات التوثيق' : 'CUSTODY_NOTES'}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 h-24 resize-none transition-colors"
                placeholder="Brief reason for action..."
              />
            </div>

            <button
              onClick={handleAddRecord}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-cyan-900/40"
            >
              {isAr ? 'تسجيل في سلسلة الحضانة' : 'SIGN_LEDGER_ENTRY'}
            </button>
          </div>
        </div>
      </div>

      <ForensicsCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        caseId="INC-NEXORA-2026-0812"
        evidence={evidence}
        records={records}
        language={language}
      />
    </div>
  );
};
