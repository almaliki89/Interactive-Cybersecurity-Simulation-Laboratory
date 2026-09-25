import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  FileSearch,
  ShieldAlert,
  HardDrive,
  Cpu,
  FileText,
  Activity,
  History,
  Target,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Award,
  Globe,
  Terminal,
  Search,
} from 'lucide-react';

interface LabNode {
  id: string;
  titleEn: string;
  titleAr: string;
  cluster: string;
  icon: React.ElementType;
}

const FORENSICS_LABS: LabNode[] = [
  { id: 'intake', titleEn: 'Incident Intake', titleAr: 'استلام الحادثة وتحديد النطاق', cluster: 'Intake', icon: ShieldAlert },
  { id: 'preservation', titleEn: 'Evidence Preservation', titleAr: 'حفظ الأدلة والتطايرية', cluster: 'Preservation', icon: FileSearch },
  { id: 'custody', titleEn: 'Chain of Custody', titleAr: 'تسلسل الحضانة والملكية', cluster: 'Custody', icon: FileText },
  { id: 'disk', titleEn: 'Disk Forensics', titleAr: 'التحقيق في الأقراص والملفات', cluster: 'Acquisition', icon: HardDrive },
  { id: 'memory', titleEn: 'Memory Forensics', titleAr: 'تحليل الذاكرة العشوائية RAM', cluster: 'Acquisition', icon: Cpu },
  { id: 'windows', titleEn: 'Windows Artifacts', titleAr: 'أدلة نظام ويندوز والسجلات', cluster: 'Artifacts', icon: Activity },
  { id: 'linux', titleEn: 'Linux Artifacts', titleAr: 'أدلة نظام لينكس و PAM', cluster: 'Artifacts', icon: Terminal },
  { id: 'logs', titleEn: 'Log Forensics', titleAr: 'دمج وتحليل السجلات المتقاطعة', cluster: 'Artifacts', icon: Search },
  { id: 'browser', titleEn: 'Browser Artifacts', titleAr: 'أدلة المتصفح والتنزيلات', cluster: 'Artifacts', icon: Globe },
  { id: 'network', titleEn: 'Network Evidence', titleAr: 'الأدلة الشبكية وحركة المرور', cluster: 'Artifacts', icon: Activity },
  { id: 'timeline', titleEn: 'Timeline Reconstruction', titleAr: 'إعادة بناء الخط الزمني للحادثة', cluster: 'Analysis', icon: History },
  { id: 'rootcause', titleEn: 'Root Cause Analysis', titleAr: 'تحليل السبب الجذر والتتبع', cluster: 'Analysis', icon: Target },
  { id: 'containment', titleEn: 'Containment & Eradication', titleAr: 'الاحتواء المتناسب واستئصال التهديد', cluster: 'Response', icon: ShieldCheck },
  { id: 'recovery', titleEn: 'Recovery Validation', titleAr: 'التحقق من التعافي والتسجيل الأمني', cluster: 'Response', icon: RotateCcw },
  { id: 'lessons', titleEn: 'Post-Incident Review', titleAr: 'مراجعة ما بعد الحادثة والدروس', cluster: 'Review', icon: BookOpen },
  { id: 'master', titleEn: 'Forensics Master Challenge', titleAr: 'التحدي الشامل للتحقيق الجنائي', cluster: 'Mastery', icon: Award },
];

export const ForensicsWorldMap: React.FC<{ onSelectLab: (labId: string) => void }> = ({ onSelectLab }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto select-none">
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <FileSearch className="w-4 h-4" />
          <span>{isAr ? 'عالم التحقيق الجنائي والاستجابة للحوادث — OMEGA V12' : 'Incident Response & Digital Forensics World — OMEGA V12'}</span>
        </div>
        <h1 className="text-2xl font-black text-white">
          {isAr ? 'خريطة التحقيق الجنائي الرقمي وسلسلة التعلم الجوهري' : 'Digital Forensics World Map & Primary Learning Chain'}
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl">
          {isAr
            ? 'مسار متكامل يبدأ من استقبال حادثة SOC، مروراً بحفظ الأدلة والتطايرية، التحقيق بالذاكرة والقرص والسجلات، بناء الخط الزمني، تحديد السبب الجذر، وحتى التعافي وتطبيق الدروس المستفادة.'
            : 'A comprehensive, evidence-grounded investigation pipeline from SOC incident triage to volatile RAM preservation, disk/log forensics, timeline reconstruction, root cause analysis, containment, and recovery.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FORENSICS_LABS.map((lab) => {
          const Icon = lab.icon;
          return (
            <div
              key={lab.id}
              onClick={() => onSelectLab(lab.id)}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-400 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {lab.cluster}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors mb-1">
                  {isAr ? lab.titleAr : lab.titleEn}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isAr ? `تطوير مهارات ${lab.titleAr}` : `Explore ${lab.titleEn} mechanics and evidence`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
