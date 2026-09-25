import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { getBrowserArtifacts, BrowserHistoryArtifact, BrowserDownloadArtifact } from './logic/browser';
import { Globe, Download, ExternalLink } from 'lucide-react';

export const BrowserArtifactLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const { history, downloads } = getBrowserArtifacts();
  const [activeTab, setActiveTab] = useState<'history' | 'downloads'>('history');

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>{isAr ? 'معمل أدلة المتصفح والتنزيلات (Browser Artifacts)' : 'Browser Forensic Artifacts Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'تحليل سجل الزيارات والتنزيلات وملفات التخزين المؤقت' : 'Browser Web History, Downloads & Cache Correlation'}
          </h1>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجل الزيارات History' : 'Web History'}</span>
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'downloads' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'التنزيلات Downloads' : 'Downloads'}</span>
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        {activeTab === 'history' ? (
          <div className="flex flex-col gap-2 font-mono text-xs">
            {history.map((h: BrowserHistoryArtifact) => (
              <div
                key={h.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  h.isSuspicious ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 truncate max-w-xl">
                  <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-white block">{h.title}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{h.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-500">
                  <span>Visits: {h.visitCount}</span>
                  <span>T+{h.virtualTime}ms</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 font-mono text-xs">
            {downloads.map((d: BrowserDownloadArtifact) => (
              <div
                key={d.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  d.isSuspicious ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 truncate max-w-xl">
                  <Download className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-white block truncate">{d.targetPath}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{d.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-500">
                  <span>{d.receivedBytes} Bytes</span>
                  <span>T+{d.virtualTime}ms</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
