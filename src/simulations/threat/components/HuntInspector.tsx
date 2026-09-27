import React from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { X, ShieldAlert, Laptop, User, Globe, Cpu, GitCommit, Clock, Layers, ArrowRight, Share2 } from 'lucide-react';
import { EntityReference } from '../logic/types';

interface HuntInspectorProps {
  language: 'ar' | 'en';
  onClose?: () => void;
}

export const HuntInspector: React.FC<HuntInspectorProps> = ({ language, onClose }) => {
  const telemetryEvents = useThreatHuntingStore((s) => s.telemetryEvents);
  const selectedEventId = useThreatHuntingStore((s) => s.selectedEventId);
  const selectedEntity = useThreatHuntingStore((s) => s.selectedEntity);
  const selectEntity = useThreatHuntingStore((s) => s.selectEntity);
  const selectEvent = useThreatHuntingStore((s) => s.selectEvent);
  const isAr = language === 'ar';

  const event = selectedEventId ? telemetryEvents.find((e) => e.id === selectedEventId) : null;

  if (!event && !selectedEntity) {
    return (
      <div className="flex flex-col h-full bg-slate-950 border-l rtl:border-l-0 rtl:border-r border-slate-900 select-none p-6 items-center justify-center text-center text-slate-500 text-xs">
        <Layers className="w-8 h-8 text-slate-700 mb-2" />
        <p>{isAr ? 'اختر حدثاً أو كياناً لمعاينة تفاصيل السياق الأمني' : 'Select an event or entity to inspect context'}</p>
      </div>
    );
  }

  const handlePivot = (type: EntityReference['type'], value?: string) => {
    if (!value) return;
    selectEntity({ type, value });
  };

  return (
    <div
      data-testid="hunt-inspector-drawer"
      className="flex flex-col h-full bg-slate-950 border-l rtl:border-l-0 rtl:border-r border-slate-900 select-none overflow-y-auto"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-900 flex items-center justify-between shrink-0 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {isAr ? 'معاين السياق والكيانات' : 'Context & Entity Inspector'}
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            data-testid="close-inspector-btn"
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            aria-label={isAr ? 'إغلاق المعاين' : 'Close Inspector'}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Event View */}
        {event && (
          <div className="space-y-4">
            {/* Main Badge */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-cyan-400" dir="ltr">
                  {event.sourceWorld}
                </span>
                <span className="font-mono text-slate-400" dir="ltr">
                  +{event.virtualTime}s
                </span>
              </div>
              <h4 className="text-sm font-bold text-white font-mono break-all" dir="ltr">
                {event.eventType}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono" dir="ltr">
                <span>ID: {event.id}</span>
                {event.rawEventId && (
                  <>
                    <span>·</span>
                    <span className="text-slate-500">raw: {event.rawEventId}</span>
                  </>
                )}
              </div>
            </div>

            {/* Entity Pivot Actions */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                {isAr ? 'الكيانات المرتبطة (اضغط للتفرع):' : 'Associated Entities (Click to Pivot):'}
              </span>

              <div className="space-y-1.5 font-mono text-xs">
                {event.user && (
                  <button
                    onClick={() => handlePivot('USER', event.user)}
                    data-testid="pivot-user-btn"
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left rtl:text-right transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-400 text-[10px] font-sans">USER:</span>
                      <strong className="text-white truncate" dir="ltr">{event.user}</strong>
                    </div>
                    <Share2 className="w-3 h-3 text-cyan-500 shrink-0" />
                  </button>
                )}

                {event.host && (
                  <button
                    onClick={() => handlePivot('HOST', event.host)}
                    data-testid="pivot-host-btn"
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left rtl:text-right transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Laptop className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-400 text-[10px] font-sans">HOST:</span>
                      <strong className="text-white truncate" dir="ltr">{event.host}</strong>
                    </div>
                    <Share2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  </button>
                )}

                {event.sourceIp && (
                  <button
                    onClick={() => handlePivot('IP', event.sourceIp)}
                    data-testid="pivot-ip-btn"
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left rtl:text-right transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-400 text-[10px] font-sans">IP:</span>
                      <strong className="text-white truncate" dir="ltr">{event.sourceIp}</strong>
                    </div>
                    <Share2 className="w-3 h-3 text-amber-500 shrink-0" />
                  </button>
                )}

                {event.process && (
                  <button
                    onClick={() => handlePivot('PROCESS', event.process)}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left rtl:text-right transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-slate-400 text-[10px] font-sans">PROC:</span>
                      <strong className="text-white truncate" dir="ltr">{event.process}</strong>
                    </div>
                    <Share2 className="w-3 h-3 text-purple-500 shrink-0" />
                  </button>
                )}

                {event.resource && (
                  <button
                    onClick={() => handlePivot('RESOURCE', event.resource)}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left rtl:text-right transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <GitCommit className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="text-slate-400 text-[10px] font-sans">RES:</span>
                      <strong className="text-white truncate" dir="ltr">{event.resource}</strong>
                    </div>
                    <Share2 className="w-3 h-3 text-rose-500 shrink-0" />
                  </button>
                )}
              </div>
            </div>

            {/* Raw JSON Attributes with dir="ltr" */}
            <div className="space-y-1.5 pt-2 border-t border-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 block">
                {isAr ? 'السمات المعيارية والبيانات الخام:' : 'Normalized Attributes:'}
              </span>
              <pre
                className="p-3 rounded-lg bg-black border border-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto select-text leading-relaxed"
                dir="ltr"
              >
                {JSON.stringify(event.attributes || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
