import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  validateForensicInvestigationState,
  ForensicsMasterState,
  getInitialForensicsChallengeState,
} from './logic/hardening';
import { createDefaultForensicsCase } from './logic/evidence';
import { Award, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, RotateCcw, Cpu, FileCheck2 } from 'lucide-react';

export const ForensicsMasterChallenge: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const defaultCase = createDefaultForensicsCase(0);

  const [state, setState] = useState<ForensicsMasterState>(getInitialForensicsChallengeState());

  const valResult = validateForensicInvestigationState(state);

  const toggleAntiCheatFlag = (flagKey: keyof ForensicsMasterState) => {
    setState((prev) => ({ ...prev, [flagKey]: !prev[flagKey] }));
  };

  const resetState = () => {
    setState(getInitialForensicsChallengeState());
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'التحدي الشامل للتحقيق الجنائي الرقمي' : 'Forensics Master Challenge & Validator'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? `اختبار الجاهزية الجنائية وشامل ضوابط التحقيق (${defaultCase.id})` : `Forensic Investigation Master Controls & Anti-Cheat Audit (${defaultCase.id})`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetState}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'إعادة ضبط الحالة' : 'Reset Challenge State'}</span>
          </button>

          <div className={`px-4 py-2 rounded-2xl border text-sm font-black flex items-center gap-2 ${
            valResult.success
              ? 'bg-emerald-950 border-emerald-700 text-emerald-300 shadow-xl shadow-emerald-950/60'
              : 'bg-rose-950 border-rose-800 text-rose-300 shadow-xl shadow-rose-950/60'
          }`}>
            {valResult.success ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{valResult.score}/100 POINTS — {valResult.success ? (isAr ? 'اجتياز معتمد' : 'MASTER PASSED') : (isAr ? 'غير مكتمل' : 'UNSOLVED / FAILED')}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-300 font-bold">{isAr ? valResult.summaryAr : valResult.summaryEn}</span>
        <span className="text-slate-500">Passed Checks: {valResult.passedChecks.length} / {valResult.checkDetails.length}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'تفاصيل بنود الفحص الضابطة بالتحقيق (11 Master Controls)' : 'Master Investigation Control Audit Checks'}</span>
          </h2>

          <div className="flex flex-col gap-2.5">
            {valResult.checkDetails.map((chk) => (
              <div
                key={chk.id}
                className={`p-4 rounded-xl border flex flex-col gap-1 text-xs font-mono ${
                  chk.passed
                    ? 'bg-slate-900/80 border-slate-800/80 text-slate-200'
                    : 'bg-rose-950/50 border-rose-800 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    {chk.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    <span>{isAr ? chk.nameAr : chk.nameEn}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${chk.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-900 text-rose-200'}`}>
                    {chk.score}/{chk.weight} Pts
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  {isAr ? chk.feedbackAr : chk.feedbackEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4 h-fit">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{isAr ? 'اختبار آليات حظر التحايل (Anti-Cheat Engine)' : 'Anti-Cheat Violations Tester'}</span>
          </h2>

          <div className="flex flex-col gap-2 text-xs">
            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-700">
              <input
                type="checkbox"
                checked={state.deletedOriginalEvidence}
                onChange={() => toggleAntiCheatFlag('deletedOriginalEvidence')}
                className="rounded accent-rose-500"
              />
              <span className="text-slate-300">{isAr ? 'حذف دليل أصلي (Evidence Tampering)' : 'Delete original evidence'}</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-700">
              <input
                type="checkbox"
                checked={state.poweredOffBeforeMemoryAcquisition}
                onChange={() => toggleAntiCheatFlag('poweredOffBeforeMemoryAcquisition')}
                className="rounded accent-rose-500"
              />
              <span className="text-slate-300">{isAr ? 'إيقاف إجباري قبل أخذ لقطة RAM' : 'Hard reboot before RAM capture'}</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-700">
              <input
                type="checkbox"
                checked={state.markedAllFilesMalicious}
                onChange={() => toggleAntiCheatFlag('markedAllFilesMalicious')}
                className="rounded accent-rose-500"
              />
              <span className="text-slate-300">{isAr ? 'تصنيف كافة الملفات كملفات ضارة' : 'Mark all files malicious'}</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-700">
              <input
                type="checkbox"
                checked={state.blockedEntireCompanyNetwork}
                onChange={() => toggleAntiCheatFlag('blockedEntireCompanyNetwork')}
                className="rounded accent-rose-500"
              />
              <span className="text-slate-300">{isAr ? 'حظر شبكة الشركة بأكملها' : 'Block entire company network'}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
