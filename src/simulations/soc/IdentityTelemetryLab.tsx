import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { normalizeRuntimeEvent } from './logic/normalization';
import { enrichTelemetryEvent } from './logic/enrichment';
import {
  Key,
  ArrowRight,
  ArrowLeft,
  User,
  Shield,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface IdentityTelemetryLabProps {
  onBackToMap?: () => void;
  onNavigateToAppSec?: () => void;
}

export const IdentityTelemetryLab: React.FC<IdentityTelemetryLabProps> = ({
  onBackToMap,
  onNavigateToAppSec,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const runtimeEvents = useSimulationStore((s) => s.events);

  const idEvents = runtimeEvents
    .map((rawEvt) => {
      const norm = normalizeRuntimeEvent({
        id: rawEvt.id,
        type: rawEvt.type,
        source: rawEvt.source,
        target: rawEvt.target,
        category: rawEvt.category,
        severity: rawEvt.severity,
        virtualTime: rawEvt.virtualTime,
        description: rawEvt.description,
        payload: (rawEvt.payload as Record<string, unknown>) || {},
      });
      return enrichTelemetryEvent(norm);
    })
    .filter((e) => e.sourceWorld === 'IDENTITY' || e.category === 'GROUP_MANAGEMENT');

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const activeEvent = idEvents.find((e) => e.id === selectedEventId) || idEvents[0] || null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <BackArrow className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Key className="w-6 h-6 text-indigo-400" />
              <span>{isAr ? 'مختبر سجلات الهوية ودليل النشاط (Identity & AD Telemetry)' : 'Identity & Active Directory Telemetry Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص مصادقة Kerberos وتعديلات المجموعات الإدارية وتتبع رفع الصلاحيات'
                : 'Active Directory Telemetry: Kerberos AS/TGS Requests, Group Membership Changes, and Privilege Escalation.'}
            </p>
          </div>
        </div>

        {onNavigateToAppSec && (
          <button
            onClick={onNavigateToAppSec}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجلات التطبيقات AppSec' : 'AppSec Telemetry Lab'}</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feed */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider pb-1">
            <span>Identity Events ({idEvents.length})</span>
            <span className="text-indigo-400">Active Directory & Kerberos</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {idEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
                No identity events recorded yet. Run the attack scenario to populate.
              </div>
            ) : (
              idEvents.map((evt) => {
                const isSelected = activeEvent?.id === evt.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-slate-850 border-indigo-500/60 shadow-lg shadow-indigo-950/30'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{evt.eventType}</span>
                      <span className="text-[10px] text-slate-500">T+{evt.virtualTime}ms</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>User: <strong className="text-slate-200">{evt.user || 'SYSTEM'}</strong></span>
                      <span>Category: <strong className="text-indigo-300">{evt.category}</strong></span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        evt.outcome === 'FAILURE' ? 'text-rose-400 bg-rose-950/40' : 'text-emerald-400 bg-emerald-950/40'
                      }`}>
                        {evt.outcome}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Identity Record Details */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider pb-1">
            Active Directory Object Context
          </div>

          {!activeEvent ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              Select an identity event to inspect Active Directory and Kerberos ticket context.
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{activeEvent.eventType}</h3>
                  <div className="text-[10px] text-slate-500">Principal: {activeEvent.user || 'N/A'}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-bold">
                  {activeEvent.category}
                </span>
              </div>

              {/* Directory Context */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>Account Department: <strong className="text-white">{activeEvent.userDepartment || 'Finance'}</strong></div>
                <div>Privilege State: <strong className={activeEvent.userIsPrivileged ? 'text-amber-400' : 'text-slate-400'}>{activeEvent.userIsPrivileged ? 'PRIVILEGED' : 'Standard'}</strong></div>
                <div>Domain Realm: <strong className="text-cyan-300">CORP.NEXORA.LOCAL</strong></div>
                <div>Domain Controller: <strong className="text-indigo-300">DC-01</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
