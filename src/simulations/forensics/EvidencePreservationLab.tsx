import React, { useState, useEffect } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import { FileSearch, AlertTriangle, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export const EvidencePreservationLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';

  const [preservedRAM, setPreservedRAM] = useState(false);
  const [hardPowerOffExecuted, setHardPowerOffExecuted] = useState(false);

  useEffect(() => {
    registerChallengeValidator('evidence-preservation-challenge', () => {
      if (preservedRAM && !hardPowerOffExecuted) {
        return { success: true, score: 100, message: 'Volatile RAM preserved successfully before power-off.' };
      }
      return { success: false, score: 0, message: 'RAM must be preserved before shutdown.' };
    });
    return () => {
      unregisterChallengeValidator('evidence-preservation-challenge');
    };
  }, [preservedRAM, hardPowerOffExecuted]);

  const handlePreserveRAM = () => {
    setPreservedRAM(true);
    completeChallenge('evidence-preservation-challenge', {
      success: true,
      score: 100,
      message: 'Volatile RAM preserved successfully before power-off.',
    });
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <FileSearch className="w-4 h-4" />
          <span>{isAr ? 'معمل حفظ الأدلة وقواعد التطاير الجنائي' : 'Evidence Preservation & Order of Volatility Lab'}</span>
        </div>
        <h1 className="text-xl font-black text-white mt-1">
          {isAr ? 'تسلسل التطاير وحفظ الأدلة الرقمية (Order of Volatility)' : 'Order of Volatility & Forensic Evidence Preservation'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>{isAr ? 'تسلسل التطاير القياسي للأدلة (Order of Volatility)' : 'Standard Order of Volatility Hierarchy'}</span>
          </h2>

          <div className="flex flex-col gap-2 text-xs">
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-cyan-300 block">1. Memory / Running State (RAM)</span>
                <span className="text-[11px] text-slate-400">{isAr ? 'الذاكرة المؤقتة، العمليات الحية، ومفاتيح التشفير المؤقتة' : 'Volatile RAM, active processes, and socket handles'}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 font-mono text-[10px]">Highest</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">2. Active Network Connections</span>
                <span className="text-[11px] text-slate-400">{isAr ? 'الاتصالات الشبكية النشطة وحركات المرور' : 'Established TCP sockets, netflow, packet captures'}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">High</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">3. Operating System Logs</span>
                <span className="text-[11px] text-slate-400">{isAr ? 'سجلات أحداث النظام وسجلات التطبيقات' : 'Event logs, syslog, auth.log records'}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Medium</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">4. Disk Artifacts & Filesystem</span>
                <span className="text-[11px] text-slate-400">{isAr ? 'ملفات القرص الصلب، MFT، والملفات المحذوفة' : 'Non-volatile HDD/SSD storage, MFT, deleted files'}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Low</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            <span>{isAr ? 'إجراء الاستحواذ والتجربة التفاعلية' : 'Preservation Interactive Actions'}</span>
          </h2>

          {hardPowerOffExecuted ? (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">{isAr ? 'تحذير حرج: تدمير أدلة الذاكرة المؤقتة!' : 'CRITICAL WARNING: Volatile RAM Memory Destroyed!'}</span>
                <p className="leading-relaxed">
                  {isAr
                    ? 'إيقاف التشغيل الإجباري قبل حفظ صورة الذاكرة RAM تسبب في مسح كافة الأنشطة الحية والعمليات والاتصالات الشبكية الحالية للأبد!'
                    : 'Executing a hard shutdown before RAM memory capture permanently destroyed all running processes, network connections, and volatile artifacts!'}
                </p>
              </div>
            </div>
          ) : preservedRAM ? (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">{isAr ? 'تم حفظ الذاكرة التطايرية بنجاح!' : 'Volatile Memory Preserved Safely!'}</span>
                <p className="leading-relaxed">
                  {isAr
                    ? 'تم الاستحواذ على لقطة كاملة للذاكرة العشوائية RAM والجهاز يعمل دون تدمير الأدلة الحية.'
                    : 'Complete RAM memory dump acquired while system remains active, preserving volatile forensic integrity.'}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handlePreserveRAM}
              className="py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'الاستحواذ على الذاكرة التطايرية أولاً (Preserve RAM First)' : 'Preserve Volatile Memory (RAM First)'}</span>
            </button>

            <button
              onClick={() => {
                if (!preservedRAM) setHardPowerOffExecuted(true);
              }}
              className="py-3 px-4 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-rose-700"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isAr ? 'إيقاف تشغيل الجهاز فوراً (Hard Power Off)' : 'Power Off System Immediately (Destructive)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
