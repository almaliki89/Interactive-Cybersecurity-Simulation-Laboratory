import React, { useState } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { MACRO_DOMAINS, WORLDS_REGISTRY } from '../../data/universeData';
import {
  Compass,
  ArrowRight,
  Shield,
  Network,
  Lock,
  Terminal,
  Activity,
  Key,
  Globe,
  Cloud,
  FileCode,
  Search,
  CheckCircle2,
  Play,
  Layers,
} from 'lucide-react';

interface GraphNode {
  id: number;
  labelAr: string;
  labelEn: string;
  domainId: string;
  x: number;
  y: number;
  connections: number[];
}

const GRAPH_NODES: GraphNode[] = [
  // Foundations (A)
  { id: 1, labelAr: 'ثالوث CIA والمخاطر', labelEn: 'CIA Triad & Risk', domainId: 'A', x: 10, y: 35, connections: [2, 3, 15] },
  { id: 2, labelAr: 'عمارة الحاسوب والذاكرة', labelEn: 'Computer Internals', domainId: 'A', x: 10, y: 65, connections: [5, 6] },

  // Infrastructure (B)
  { id: 3, labelAr: 'الشبكات وتوجيه الحزم', labelEn: 'Networking & Routing', domainId: 'B', x: 28, y: 20, connections: [4, 8, 18] },
  { id: 4, labelAr: 'جدران الحماية وIDS', labelEn: 'Firewall & Ingress', domainId: 'B', x: 28, y: 45, connections: [24, 38] },
  { id: 5, labelAr: 'أمن لينكس وصلاحيات DAC', labelEn: 'Linux OS & DAC', domainId: 'B', x: 28, y: 70, connections: [20, 24] },
  { id: 6, labelAr: 'أمن ويندوز وسجلات الأحداث', labelEn: 'Windows Security Logs', domainId: 'B', x: 28, y: 90, connections: [7, 24, 28] },
  { id: 7, labelAr: 'Active Directory وKerberos', labelEn: 'Active Directory & Kerberos', domainId: 'B', x: 45, y: 85, connections: [16, 24, 60] },

  // AppSec & Web (C)
  { id: 8, labelAr: 'دورة بروتوكول HTTP', labelEn: 'HTTP Lifecycle', domainId: 'C', x: 45, y: 20, connections: [9, 10, 15] },
  { id: 9, labelAr: 'أمن تطبيقات الويب OWASP', labelEn: 'Web AppSec & SQLi/XSS', domainId: 'C', x: 62, y: 15, connections: [10, 22] },
  { id: 10, labelAr: 'أمن واجهات API والمعدل', labelEn: 'API Security & Rate Limits', domainId: 'C', x: 62, y: 35, connections: [16, 17] },

  // Crypto & IAM (D)
  { id: 15, labelAr: 'التشفير وشهادات PKI', labelEn: 'Crypto PKI & Avalanche', domainId: 'D', x: 45, y: 45, connections: [16, 17, 39] },
  { id: 16, labelAr: 'إدارة الهوية RBAC', labelEn: 'IAM & Access Control', domainId: 'D', x: 62, y: 55, connections: [17, 18, 38] },
  { id: 17, labelAr: 'المصادقة وMFA وOAuth', labelEn: 'MFA & Authentication', domainId: 'D', x: 62, y: 75, connections: [38, 60] },

  // Cloud & DevOps (E)
  { id: 18, labelAr: 'أمن الحوسبة السحابية S3', labelEn: 'Cloud Storage & SGs', domainId: 'E', x: 45, y: 5, connections: [20, 22] },
  { id: 20, labelAr: 'الحاويات وكوبرنيتيس K8s', labelEn: 'Docker & K8s Isolation', domainId: 'E', x: 62, y: 5, connections: [22, 60] },
  { id: 22, labelAr: 'خطوط الإنتاج DevSecOps', labelEn: 'CI/CD Security Gates', domainId: 'E', x: 78, y: 15, connections: [60] },

  // SecOps & Detection (F)
  { id: 24, labelAr: 'مركز SOC وربط سجلات SIEM', labelEn: 'SOC Operations & SIEM', domainId: 'F', x: 78, y: 45, connections: [28, 31, 60] },
  { id: 28, labelAr: 'أمن الأجهزة وسلوك EDR', labelEn: 'EDR Process Lineage', domainId: 'F', x: 78, y: 70, connections: [31, 60] },

  // Investigation (G)
  { id: 31, labelAr: 'الأدلة الجنائية الرقمية', labelEn: 'Digital Forensics Timeline', domainId: 'G', x: 78, y: 90, connections: [60] },

  // Engineering & Architecture (H)
  { id: 38, labelAr: 'معمارية انعدام الثقة (Zero Trust)', labelEn: 'Zero Trust Decisions', domainId: 'H', x: 78, y: 30, connections: [60] },

  // Flagship Cyber Range (J)
  { id: 60, labelAr: 'الميدان السيبراني الشامل', labelEn: 'Integrated Cyber Range', domainId: 'J', x: 93, y: 50, connections: [] },
];

export const GlobalKnowledgeGraph: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const setSelectedWorldId = useSimulationStore((s) => s.setSelectedWorldId);
  const [selectedNodeId, setSelectedNodeId] = useState<number>(60);

  const selectedNode = GRAPH_NODES.find((n) => n.id === selectedNodeId);
  const selectedWorld = selectedNodeId ? WORLDS_REGISTRY[selectedNodeId] : null;

  const nodeMap = new Map(GRAPH_NODES.map((n) => [n.id, n]));

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Top Header */}
      <div className="h-12 border-b border-slate-800 bg-slate-950/80 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h1 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            {language === 'ar' ? 'خارطة العلاقات والاعتماديات السيبرانية الشاملة' : 'Universal Cybersecurity Knowledge Graph'}
          </h1>
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          {language === 'ar' ? 'انقر على أي عقدة لاستكشاف ترابط المفاهيم وفتح المحاكي' : 'Click nodes to inspect cross-domain relationships & launch labs'}
        </span>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left 2/3: The Interactive Node Graph Canvas */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden select-none">
          {/* Subtle Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#graph-grid)" />
          </svg>

          {/* Render SVG Connection Lines between nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {GRAPH_NODES.flatMap((source) =>
              source.connections.map((targetId) => {
                const target = nodeMap.get(targetId);
                if (!target) return null;

                const isHighlighted =
                  selectedNodeId === source.id || selectedNodeId === target.id;

                return (
                  <line
                    key={`${source.id}-${target.id}`}
                    x1={`${source.x}%`}
                    y1={`${source.y}%`}
                    x2={`${target.x}%`}
                    y2={`${target.y}%`}
                    stroke={isHighlighted ? '#06b6d4' : '#334155'}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeDasharray={isHighlighted ? 'none' : '4 4'}
                    className="transition-all duration-300"
                  />
                );
              })
            )}
          </svg>

          {/* Render Interactive Nodes */}
          {GRAPH_NODES.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isTargetOfSelected = selectedNode?.connections.includes(node.id);

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-10 cursor-pointer flex flex-col items-center group transition-all duration-200 ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl ${
                    isSelected
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-cyan-900/50 ring-4 ring-cyan-500/20'
                      : isTargetOfSelected
                      ? 'bg-indigo-950/80 border-indigo-400 text-indigo-300'
                      : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xs font-mono font-bold">W{node.id.toString().padStart(2, '0')}</span>
                </div>
                <span
                  className={`text-[11px] font-bold mt-1.5 px-2 py-0.5 rounded backdrop-blur-md text-center max-w-[130px] whitespace-nowrap overflow-hidden text-ellipsis shadow-md ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-700'
                      : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                  }`}
                >
                  {language === 'ar' ? node.labelAr : node.labelEn}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right 1/3: Inspector for Selected World in Graph */}
        {selectedWorld && (
          <div className="w-80 lg:w-96 h-full border-l rtl:border-l-0 rtl:border-r border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                World #{selectedWorld.id.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {selectedWorld.difficulty}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <h2 className="text-base font-bold text-white">
                {language === 'ar' ? selectedWorld.titleAr : selectedWorld.titleEn}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ar' ? selectedWorld.descriptionAr : selectedWorld.descriptionEn}
              </p>
            </div>

            {/* Core Concepts */}
            <div className="mt-5 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block uppercase font-mono">
                {language === 'ar' ? 'المفاهيم المحورية في هذا العالم' : 'Key Interactive Concepts'}
              </span>
              <div className="space-y-2">
                {selectedWorld.concepts.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-cyan-300 block mb-0.5">
                      {language === 'ar' ? c.nameAr : c.nameEn}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {language === 'ar' ? c.briefAr : c.briefEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Lab Action Button */}
            <div className="pt-6 mt-auto">
              <button
                onClick={() => {
                  setSelectedWorldId(selectedWorld.id);
                  const simType = selectedWorld.simulationType;
                  if (simType === 'range' || simType === 'cyber_range' || selectedWorld.id === 60) {
                    setActiveSimulation('range');
                  } else if (simType === 'crypto_pki') {
                    setActiveSimulation('crypto');
                  } else if (simType === 'windows_security') {
                    setActiveSimulation('threat_hunting');
                  } else if (simType === 'iam_auth') {
                    setActiveSimulation('active_directory');
                  } else if (simType) {
                    setActiveSimulation(simType as SimulationId);
                  } else {
                    setActiveSimulation('explorer');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'ar' ? 'تشغيل مختبر المحاكاة التفاعلي' : 'Launch Interactive Lab'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
