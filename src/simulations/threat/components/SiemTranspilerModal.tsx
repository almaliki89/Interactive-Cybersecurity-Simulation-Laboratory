import React, { useState } from 'react';
import { DetectionRule } from '../logic/types';
import { transpileDetectionRule } from '../logic/sigmaTranspiler';
import { Code2, Copy, Check, Download, X, Layers, FileCode } from 'lucide-react';

interface SiemTranspilerModalProps {
  rule: DetectionRule;
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
}

type TabType = 'sigmaYaml' | 'splunkSpl' | 'elasticKql' | 'sentinelKql' | 'chronicleYaraL';

export const SiemTranspilerModal: React.FC<SiemTranspilerModalProps> = ({
  rule,
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('sigmaYaml');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isAr = language === 'ar';
  const transpiled = transpileDetectionRule(rule);

  const tabs: { id: TabType; name: string; langLabel: string }[] = [
    { id: 'sigmaYaml', name: 'Sigma Rule (YAML)', langLabel: 'yaml' },
    { id: 'splunkSpl', name: 'Splunk (SPL)', langLabel: 'spl' },
    { id: 'elasticKql', name: 'Elasticsearch (KQL)', langLabel: 'kql' },
    { id: 'sentinelKql', name: 'Microsoft Sentinel (KQL)', langLabel: 'kql' },
    { id: 'chronicleYaraL', name: 'Google Chronicle (YARA-L)', langLabel: 'yara' },
  ];

  const currentCode = transpiled[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'sigmaYaml' ? 'yml' : activeTab === 'chronicleYaraL' ? 'yaral' : 'txt';
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rule.id.toLowerCase()}_${activeTab}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="siem-transpiler-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isAr ? 'مترجم قواعد الكشف الموحدة (Detection-as-Code)' : 'Sigma & Multi-SIEM Rule Transpiler'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-normal">
                  {rule.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'تحويل فوري لقاعدة الكشف إلى صيغ Sigma القياسية ومحركات SIEM العالمية'
                  : 'Real-time transpilation into standard Sigma YAML and enterprise SIEM query languages'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 border-b border-slate-800/80 bg-slate-900/20 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-5 overflow-hidden flex flex-col bg-slate-950">
          <div className="flex items-center justify-between pb-2 text-[11px] text-slate-400">
            <span className="font-mono text-slate-500 uppercase">
              {tabs.find((t) => t.id === activeTab)?.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                data-testid="btn-copy-code"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-1.5 text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy Code')}</span>
              </button>

              <button
                onClick={handleDownload}
                data-testid="btn-download-rule"
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 text-xs font-medium transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تنزيل الملف' : 'Export File'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 rounded-xl bg-slate-900/80 border border-slate-800/90 p-4 overflow-auto custom-scrollbar font-mono text-xs text-cyan-200/90 leading-relaxed select-text" dir="ltr">
            <pre className="whitespace-pre">{currentCode}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {isAr
                ? `المعايير المطبقة: إطار MITRE ATT&CK ${rule.mitreTechniques?.[0] || 'T1110'}`
                : `Applied Schema: MITRE ATT&CK ${rule.mitreTechniques?.[0] || 'T1110'}`}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
