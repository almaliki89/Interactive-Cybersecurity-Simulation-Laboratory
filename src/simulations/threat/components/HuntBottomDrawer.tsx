import React from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { X, ChevronDown, Terminal, FileCode, Sliders, Send, Database } from 'lucide-react';

interface HuntBottomDrawerProps {
  language: 'ar' | 'en';
}

export const HuntBottomDrawer: React.FC<HuntBottomDrawerProps> = ({ language }) => {
  const isBottomDrawerOpen = useThreatHuntingStore((s) => s.isBottomDrawerOpen);
  const bottomDrawerTab = useThreatHuntingStore((s) => s.bottomDrawerTab);
  const setBottomDrawer = useThreatHuntingStore((s) => s.setBottomDrawer);
  const telemetryEvents = useThreatHuntingStore((s) => s.telemetryEvents);
  const selectedEventId = useThreatHuntingStore((s) => s.selectedEventId);
  const currentQueryResult = useThreatHuntingStore((s) => s.currentQueryResult);
  const socHandoffs = useThreatHuntingStore((s) => s.socHandoffs);
  const forensicsHandoffs = useThreatHuntingStore((s) => s.forensicsHandoffs);
  const detectionResults = useThreatHuntingStore((s) => s.detectionResults);

  const isAr = language === 'ar';

  if (!isBottomDrawerOpen) return null;

  const selectedEvent = selectedEventId ? telemetryEvents.find((e) => e.id === selectedEventId) : null;

  return (
    <div
      data-testid="hunt-bottom-drawer"
      className="h-64 border-t border-slate-900 bg-slate-950 flex flex-col shrink-0 z-30 select-none shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
    >
      {/* Drawer Tab Navigation */}
      <div className="h-10 border-b border-slate-900 bg-slate-900/60 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setBottomDrawer(true, 'RAW')}
            className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
              bottomDrawerTab === 'RAW' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isAr ? 'البيانات الخام (JSON)' : 'Raw Telemetry'}</span>
          </button>

          <button
            onClick={() => setBottomDrawer(true, 'QUERY_DIAG')}
            className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
              bottomDrawerTab === 'QUERY_DIAG' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isAr ? 'تشخيص الاستعلام' : 'Query Diagnostics'}</span>
          </button>

          <button
            onClick={() => setBottomDrawer(true, 'DETECTION_TUNING')}
            className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
              bottomDrawerTab === 'DETECTION_TUNING' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجلات الضبط' : 'Tuning Metrics'}</span>
          </button>

          <button
            onClick={() => setBottomDrawer(true, 'HANDOFF_LOGS')}
            className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
              bottomDrawerTab === 'HANDOFF_LOGS' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAr ? 'حزم الإحالة (SOC/Forensics)' : 'Handoff Packages'}</span>
          </button>
        </div>

        <button
          onClick={() => setBottomDrawer(false)}
          data-testid="close-bottom-drawer-btn"
          className="p-1 rounded text-slate-400 hover:text-white"
          aria-label={isAr ? 'إغلاق اللوحة السفلية' : 'Close Bottom Drawer'}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 select-text leading-relaxed">
        {bottomDrawerTab === 'RAW' && (
          <pre className="p-3 bg-black rounded-lg border border-slate-900" dir="ltr">
            {JSON.stringify(selectedEvent || telemetryEvents, null, 2)}
          </pre>
        )}

        {bottomDrawerTab === 'QUERY_DIAG' && (
          <div className="space-y-3" dir="ltr">
            <div className="p-3 bg-black rounded-lg border border-slate-900 flex flex-col gap-2">
              <span className="text-cyan-400 font-bold">Query Execution Metadata</span>
              <pre>{JSON.stringify(currentQueryResult || { status: 'No query executed' }, null, 2)}</pre>
            </div>
          </div>
        )}

        {bottomDrawerTab === 'DETECTION_TUNING' && (
          <div className="space-y-3" dir="ltr">
            <div className="p-3 bg-black rounded-lg border border-slate-900 flex flex-col gap-2">
              <span className="text-emerald-400 font-bold">Detection Rules Evaluation Results</span>
              <pre>{JSON.stringify(detectionResults, null, 2)}</pre>
            </div>
          </div>
        )}

        {bottomDrawerTab === 'HANDOFF_LOGS' && (
          <div className="space-y-4" dir="ltr">
            <div className="p-3 bg-black rounded-lg border border-slate-900 flex flex-col gap-2">
              <span className="text-cyan-400 font-bold">Dispatched SOC Incident Handoffs</span>
              <pre>{JSON.stringify(socHandoffs, null, 2)}</pre>
            </div>

            <div className="p-3 bg-black rounded-lg border border-slate-900 flex flex-col gap-2">
              <span className="text-purple-400 font-bold">Canonical Forensics Case Handoffs</span>
              <pre>{JSON.stringify(forensicsHandoffs, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
