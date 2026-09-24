import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Search,
  Activity,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Filter,
} from 'lucide-react';

interface ForensicArtifact {
  id: string;
  time: string;
  host: string;
  type: 'FILE' | 'PROCESS' | 'NETWORK' | 'AUTH';
  details: string;
  isSuspicious: boolean;
}

export const ThreatHuntingSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);

  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [isolatedHost, setIsolatedHost] = useState<boolean>(false);

  const artifacts: ForensicArtifact[] = [
    { id: 'art-1', time: '14:20:01', host: 'ws-finance-01', type: 'AUTH', details: 'User alice logged on via Kerberos Interactive (Event 4624)', isSuspicious: false },
    { id: 'art-2', time: '14:20:15', host: 'ws-finance-01', type: 'FILE', details: 'invoice_march.xlsx dropped in C:\\Users\\alice\\Downloads', isSuspicious: false },
    { id: 'art-3', time: '14:20:18', host: 'ws-finance-01', type: 'PROCESS', details: 'excel.exe spawned powershell.exe -enc JABm... (Event 4688)', isSuspicious: true },
    { id: 'art-4', time: '14:20:25', host: 'ws-finance-01', type: 'NETWORK', details: 'powershell.exe initiated TCP socket to 198.51.100.99:4444', isSuspicious: true },
    { id: 'art-5', time: '14:20:30', host: 'ws-finance-01', type: 'PROCESS', details: 'mimikatz.exe injected into lsass.exe process memory', isSuspicious: true },
  ];

  const filtered = artifacts.filter((a) => filterType === 'ALL' || a.type === filterType);

  const challenge: Challenge = {
    id: 'threat-hunting-challenge',
    simulationId: 'threat_hunting',
    title: language === 'ar' ? 'تحدي صيد التهديدات والتحقيق الجنائي الرقمي' : 'Threat Hunting & Forensic Artifact Challenge',
    difficulty: 'Advanced',
    category: language === 'ar' ? 'صيد التهديدات والتحقيق' : 'Threat Hunting',
    mission:
      language === 'ar'
        ? 'حلل الآثار الجنائية، وحدد العملية المشبوهة التي بدأت الاتصال الخارجي، وطبق إجراء عزل الجهاز المصاب.'
        : 'Analyze forensic artifacts, identify the suspicious parent-child process, and isolate the compromised host.',
    initialExplanation:
      language === 'ar'
        ? 'صيد التهديدات يبدأ بفرضية: البحث عن العمليات الشاذة المتفرعة من ملفات غير معتادة والاتصالات الخارجية المريبة.'
        : 'Threat hunting starts with hypothesis formulation: searching for abnormal process lineages and anomalous socket connections.',
    objectives: [
      {
        id: 'obj-find-process',
        title: language === 'ar' ? 'تحديد العملية الخبيثة' : 'Identify Suspicious Process',
        description: language === 'ar' ? 'تحديد عملية PowerShell المشفرة' : 'Select powershell.exe encoded artifact in timeline',
        isCompleted: selectedArtifactId === 'art-3',
        validationKey: 'proc_found',
      },
      {
        id: 'obj-isolate',
        title: language === 'ar' ? 'عزل الجهاز المصاب' : 'Isolate Compromised Host',
        description: language === 'ar' ? 'تطبيق إجراء العزل على ws-finance-01' : 'Execute host network containment',
        isCompleted: isolatedHost,
        validationKey: 'host_iso',
      },
    ],
    hints: [
      language === 'ar' ? 'حدد السجل رقم art-3 (PowerShell) واضغط على زر "عزل الجهاز المصاب".' : 'Select artifact art-3 and click Isolate Host.',
    ],
  };

  const validateChallenge = () => {
    if (selectedArtifactId === 'art-3' && isolatedHost) {
      return {
        success: true,
        message:
          language === 'ar'
            ? 'ممتاز! تم تحديد العملية المشبوهة وعزل الجهاز المصاب بنجاح!'
            : 'Threat artifact correctly identified and host successfully isolated!',
      };
    }
    return {
      success: false,
      message: language === 'ar' ? 'حدد سجل العملية الخبيثة وتأكد من تفعيل العزل.' : 'Select the malicious process artifact and isolate the host.',
    };
  };

  return (
    <Workspace
      title={language === 'ar' ? 'مختبر صيد التهديدات (Threat Hunting) والأدلة الجنائية الرقمية' : 'Threat Hunting & Digital Forensics Artifact Lab'}
      subtitle={language === 'ar' ? 'تحليل شجرة العمليات، آثار الذاكرة، سجلات الأحداث، واستجابة الاحتواء' : 'Process Lineage, Artifact Reconstruction & Containment'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase font-mono">
              {language === 'ar' ? 'تصفية الآثار:' : 'Filter Artifacts:'}
            </span>
            {['ALL', 'PROCESS', 'NETWORK', 'AUTH', 'FILE'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`py-1 px-2.5 rounded text-xs font-mono font-bold transition-colors ${
                  filterType === t
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsolatedHost(!isolatedHost)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                isolatedHost
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
              }`}
            >
              {isolatedHost
                ? (language === 'ar' ? '✓ الجهاز معزول بنجاح' : '✓ Host Isolated')
                : (language === 'ar' ? 'عزل الجهاز المصاب عبر EDR' : 'Isolate Host via EDR')}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        {/* Forensic Timeline Cards */}
        <div className="max-w-4xl w-full space-y-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase block mb-1">
            {language === 'ar' ? 'سلسلة الآثار الرقمية المسجلة (Forensic Evidence Timeline):' : 'Forensic Evidence Log Stream:'}
          </span>

          {filtered.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArtifactId(art.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedArtifactId === art.id
                  ? 'bg-cyan-950/60 border-cyan-500 ring-2 ring-cyan-500/30'
                  : art.isSuspicious
                  ? 'bg-rose-950/20 border-rose-800/80 hover:bg-rose-950/40'
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                    {art.type}
                  </span>
                  <span className="text-xs font-bold text-white">{art.host}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{art.time}</span>
              </div>
              <p className="text-xs font-mono text-slate-300">{art.details}</p>
            </div>
          ))}
        </div>
      </div>
    </Workspace>
  );
};
