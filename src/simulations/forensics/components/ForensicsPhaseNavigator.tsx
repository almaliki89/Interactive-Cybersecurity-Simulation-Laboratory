import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useForensicsStore, ForensicsLabId } from '../../../stores/forensicsStore';
import { 
  ClipboardList, 
  ShieldCheck, 
  Search, 
  History, 
  Activity, 
  Award,
  ChevronRight,
  Map
} from 'lucide-react';

interface PhaseGroup {
  id: string;
  labelEn: string;
  labelAr: string;
  icon: any;
  labs: { id: ForensicsLabId; labelEn: string; labelAr: string }[];
}

const PHASES: PhaseGroup[] = [
  {
    id: 'case',
    labelEn: 'CASE',
    labelAr: 'القضية',
    icon: ClipboardList,
    labs: [
      { id: 'intake', labelEn: 'Intake & Scope', labelAr: 'الاستلام والنطاق' },
    ],
  },
  {
    id: 'evidence',
    labelEn: 'EVIDENCE',
    labelAr: 'الأدلة',
    icon: ShieldCheck,
    labs: [
      { id: 'forensics_3d', labelEn: '3D Evidence Bench', labelAr: 'طاولة الأدلة 3D' },
      { id: 'preservation', labelEn: 'Preservation', labelAr: 'الحفظ' },
      { id: 'custody', labelEn: 'Chain of Custody', labelAr: 'سلسلة الحضانة' },
    ],
  },
  {
    id: 'analysis',
    labelEn: 'ANALYSIS',
    labelAr: 'التحليل',
    icon: Search,
    labs: [
      { id: 'disk', labelEn: 'Disk Forensics', labelAr: 'تحقيق القرص' },
      { id: 'memory', labelEn: 'Memory Forensics', labelAr: 'تحقيق الذاكرة' },
      { id: 'windows', labelEn: 'Windows Artifacts', labelAr: 'أدلة ويندوز' },
      { id: 'linux', labelEn: 'Linux Artifacts', labelAr: 'أدلة لينكس' },
      { id: 'logs', labelEn: 'Log Forensics', labelAr: 'تحقيق السجلات' },
      { id: 'browser', labelEn: 'Browser Artifacts', labelAr: 'أدلة المتصفح' },
      { id: 'network', labelEn: 'Network Evidence', labelAr: 'أدلة الشبكة' },
    ],
  },
  {
    id: 'timeline',
    labelEn: 'TIMELINE',
    labelAr: 'الخط الزمني',
    icon: History,
    labs: [
      { id: 'timeline', labelEn: 'Reconstruction', labelAr: 'إعادة البناء' },
      { id: 'rootcause', labelEn: 'Root Cause', labelAr: 'السبب الجذري' },
    ],
  },
  {
    id: 'response',
    labelEn: 'RESPONSE',
    labelAr: 'الاستجابة',
    icon: Activity,
    labs: [
      { id: 'containment', labelEn: 'Containment', labelAr: 'الاحتواء' },
      { id: 'recovery', labelEn: 'Recovery', labelAr: 'التعافي' },
    ],
  },
  {
    id: 'closure',
    labelEn: 'CLOSURE',
    labelAr: 'الإغلاق',
    icon: Award,
    labs: [
      { id: 'lessons', labelEn: 'Post-Incident Review', labelAr: 'مراجعة ما بعد الحادثة' },
      { id: 'master', labelEn: 'Master Challenge', labelAr: 'التحدي الشامل' },
    ],
  },
];

export const ForensicsPhaseNavigator: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const activeTab = useForensicsStore((s) => s.activeTab);
  const setActiveTab = useForensicsStore((s) => s.setActiveTab);

  return (
    <div className="w-64 max-w-[calc(100vw-3rem)] shrink-0 border-r rtl:border-r-0 rtl:border-l border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('map')}
          className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
            activeTab === 'map'
              ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
          }`}
        >
          <Map className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase tracking-widest">
            {isAr ? 'خريطة المعامل' : 'WORLD_MAP'}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
        {PHASES.map((phase) => (
          <div key={phase.id} className="space-y-1">
            <div className="flex items-center gap-2 px-2 mb-2">
              <phase.icon className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {isAr ? phase.labelAr : phase.labelEn}
              </span>
            </div>
            
            <div className="space-y-0.5">
              {phase.labs.map((lab) => {
                const isActive = activeTab === lab.id;
                return (
                  <button
                    key={lab.id}
                    onClick={() => setActiveTab(lab.id)}
                    className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{isAr ? lab.labelAr : lab.labelEn}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${
                      isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-700 opacity-0 group-hover:opacity-100'
                    } rtl:rotate-180`} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
