/**
 * OMEGA V13 — Cloud Security World
 * CloudIncidentLab.tsx
 *
 * Interactive Cloud Incident Response & Playbook Automation Lab.
 * Guides the investigator through Triage, Containment, Eradication, and Recovery
 * for a multi-stage cloud breach.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  createDefaultCloudIncident,
  evaluateIncidentProgress,
  CloudIncidentCase,
} from './logic/incidents';
import { Shield, AlertTriangle, CheckCircle2, Play, Wrench, Clock, Check, ArrowRight } from 'lucide-react';

export const CloudIncidentLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [incident, setIncident] = useState<CloudIncidentCase>(createDefaultCloudIncident());

  const progress = evaluateIncidentProgress(incident);

  const toggleAction = (actionId: string) => {
    setIncident((prev) => {
      const updatedActions = prev.playbookActions.map((a) =>
        a.id === actionId ? { ...a, isExecuted: !a.isExecuted } : a
      );
      const updatedIncident = { ...prev, playbookActions: updatedActions };
      const newEval = evaluateIncidentProgress(updatedIncident);
      return {
        ...updatedIncident,
        currentStage: newEval.newStage,
        isFullyRemediated: newEval.isComplete,
      };
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-mono mb-1">
            <Shield className="w-4 h-4" />
            <span>CLOUD INCIDENT RESPONSE LIFECYCLE</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر الاستجابة للحوادث السحابية وتطبيق الدليل الإجرائي' : 'Cloud Incident Response & Playbook Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'الاستجابة لحادث أمني سحابي حرج: من ثغرة SSRF وسرقة بيانات اعتماد الخادم إلى احتواء الأثر وعزل الجلسات وإعادة التعافي.'
              : 'Investigate and contain a live multi-stage cloud breach. Execute containment, eradication, and recovery playbook actions.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <span className="text-slate-500 block text-[10px]">CURRENT INCIDENT STAGE</span>
            <span
              className={`font-bold ${
                incident.currentStage === 'RESOLVED'
                  ? 'text-emerald-400'
                  : incident.currentStage === 'TRIAGE'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {incident.currentStage}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Incident Timeline */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-300">
            {isAr ? 'الخط الزمني لتسلسل الهجوم' : 'Breach Timeline Reconstruction'}
          </span>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
            {incident.timeline.map((phase) => (
              <div key={phase.phaseId} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-pink-400 font-bold">Phase {phase.phaseId}</span>
                  <span className="text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Virtual T+{phase.virtualTime}</span>
                  </span>
                </div>

                <div className="font-bold text-white text-xs mb-1">
                  {isAr ? phase.nameAr : phase.nameEn}
                </div>

                <div className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                  {isAr ? phase.attackerActionAr : phase.attackerActionEn}
                </div>

                <div className="p-2 rounded bg-slate-950 text-[10px] text-amber-300/90 truncate">
                  Evidence: {phase.telemetryEvidence}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center & Right: Incident Playbook Checklist & Progress */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
              incident.isFullyRemediated
                ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                : 'bg-amber-950/40 border-amber-700 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {incident.isFullyRemediated ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              )}
              <div>
                <h3 className="text-xs font-bold">
                  {incident.isFullyRemediated
                    ? isAr
                      ? 'تم حل واحتواء الحادث الأمني بالكامل بنجاح!'
                      : 'Incident Fully Resolved & Cloud Environment Secured!'
                    : isAr
                    ? `الحادث قيد المعالجة (المرحلة: ${incident.currentStage})`
                    : `Active Incident Mitigation in Progress (Stage: ${incident.currentStage})`}
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {incident.isFullyRemediated
                    ? isAr
                      ? 'تم إلغاء الجلسات المشبوهة، وقفل التخزين العام، وفرض IMDSv2، وحماية سجلات التدقيق.'
                      : 'All compromised sessions revoked, public access severed, IMDS hardened, and audit protected.'
                    : isAr
                    ? `نفذ إجراءات الدليل الإجرائي المتبقية (${progress.unexecutedRequiredActions.length} إجراء متبقٍ)`
                    : `Complete remaining playbook actions (${progress.unexecutedRequiredActions.length} remaining).`}
                </p>
              </div>
            </div>
          </div>

          {/* Playbook Actions List */}
          <span className="text-xs font-bold text-slate-300">
            {isAr ? 'إجراءات دليل الاستجابة للحوادث السحابية' : 'Cloud Incident Playbook Execution'}
          </span>

          <div className="flex flex-col gap-3">
            {incident.playbookActions.map((action) => (
              <div
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-md ${
                  action.isExecuted
                    ? 'bg-emerald-950/30 border-emerald-700/80 text-emerald-200'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        action.isExecuted
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {action.requiredForStage} • {action.category}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {isAr ? action.titleAr : action.titleEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isAr ? action.descriptionAr : action.descriptionEn}
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                    action.isExecuted
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-700 bg-slate-950 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
