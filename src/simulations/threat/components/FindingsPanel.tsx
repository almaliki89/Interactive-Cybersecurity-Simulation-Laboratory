import React, { useState } from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { FileCheck, Plus, Shield, Send, Archive, AlertTriangle, CheckCircle2, Info, ChevronRight, X } from 'lucide-react';
import { HuntFinding, EntityReference } from '../logic/types';

interface FindingsPanelProps {
  language: 'ar' | 'en';
}

export const FindingsPanel: React.FC<FindingsPanelProps> = ({ language }) => {
  const activeHuntId = useThreatHuntingStore((s) => s.activeHuntId);
  const findings = useThreatHuntingStore((s) => s.findings);
  const telemetryEvents = useThreatHuntingStore((s) => s.telemetryEvents);
  const addFinding = useThreatHuntingStore((s) => s.addFinding);
  const validateFinding = useThreatHuntingStore((s) => s.validateFinding);
  const dismissFinding = useThreatHuntingStore((s) => s.dismissFinding);
  const dispatchSocHandoff = useThreatHuntingStore((s) => s.dispatchSocHandoff);
  const dispatchForensicsHandoff = useThreatHuntingStore((s) => s.dispatchForensicsHandoff);
  const socHandoffs = useThreatHuntingStore((s) => s.socHandoffs);
  const forensicsHandoffs = useThreatHuntingStore((s) => s.forensicsHandoffs);
  const selectEvent = useThreatHuntingStore((s) => s.selectEvent);

  const isAr = language === 'ar';
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form State
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newSummaryEn, setNewSummaryEn] = useState('');
  const [newSummaryAr, setNewSummaryAr] = useState('');
  const [newSeverity, setNewSeverity] = useState<HuntFinding['severity']>('threat');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleEn.trim() || selectedEventIds.length === 0) return;

    // Collect raw event IDs & entities
    const rawIds: string[] = [];
    const entityRefs: EntityReference[] = [];

    telemetryEvents.forEach((evt) => {
      if (selectedEventIds.includes(evt.id)) {
        if (evt.rawEventId) rawIds.push(evt.rawEventId);
        if (evt.user) entityRefs.push({ type: 'USER', value: evt.user });
        if (evt.host) entityRefs.push({ type: 'HOST', value: evt.host });
        if (evt.sourceIp) entityRefs.push({ type: 'IP', value: evt.sourceIp });
      }
    });

    addFinding({
      huntId: activeHuntId,
      titleEn: newTitleEn,
      titleAr: newTitleAr || newTitleEn,
      summaryEn: newSummaryEn,
      summaryAr: newSummaryAr || newSummaryEn,
      severity: newSeverity,
      eventIds: selectedEventIds,
      rawEventIds: rawIds,
      entityRefs,
      confidence: 'HIGH',
      status: 'VALIDATED',
      whyEn: `Finding validated with ${selectedEventIds.length} correlated telemetry events and verified indicators.`,
      whyAr: `تم التحقق من النتيجة بناءً على ${selectedEventIds.length} أحداث سجلات مترابطة ومؤشرات موثقة.`,
    });

    setIsCreateModalOpen(false);
    setNewTitleEn('');
    setNewTitleAr('');
    setNewSummaryEn('');
    setNewSummaryAr('');
    setSelectedEventIds([]);
  };

  const toggleEventSelection = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 select-none overflow-hidden">
      {/* Header & Create Button */}
      <div className="p-3 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white tracking-tight">
            {isAr ? 'نتائج ومخرجات التحقيق الأمني' : 'Threat Hunt Findings & Documentation'}
          </h2>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          data-testid="btn-open-create-finding"
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'توثيق نتيجة جديدة' : 'Record New Finding'}</span>
        </button>
      </div>

      {/* Findings List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {findings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <FileCheck className="w-8 h-8 text-slate-700" />
            <p className="text-xs">
              {isAr
                ? 'لم يتم توثيق أي نتائج بعد. استكشف السجلات وقدم أول نتيجة تحقيق مدعومة بالأدلة.'
                : 'No findings recorded yet. Explore telemetry and document your first verified finding.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white text-xs font-semibold"
            >
              {isAr ? '+ توثيق النتيجة الآن' : '+ Record Finding Now'}
            </button>
          </div>
        ) : (
          findings.map((finding) => {
            const hasSoc = socHandoffs.some((h) => h.findingId === finding.id);
            const hasForensics = forensicsHandoffs.some((h) => h.findingId === finding.id);

            return (
              <div
                key={finding.id}
                data-testid={`finding-card-${finding.id}`}
                className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-4 shadow-sm"
              >
                {/* Title & Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400" dir="ltr">
                      {finding.id}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {isAr ? finding.titleAr : finding.titleEn}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        finding.status === 'VALIDATED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : finding.status === 'DISMISSED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {finding.status}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-bold tabular-nums" dir="ltr">
                      {finding.confidenceScore}% {isAr ? 'ثقة' : 'confidence'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr ? finding.summaryAr : finding.summaryEn}
                </p>

                {/* Confidence breakdown bars */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {isAr ? 'تحليل ركائز الثقة بالأدلة:' : 'Confidence Metric Breakdown:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">{isAr ? 'الإشارات' : 'Signals'}</span>
                      <span className="text-cyan-400 font-bold" dir="ltr">{finding.confidenceBreakdown.signalCountScore}/30</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">{isAr ? 'الترابط' : 'Correlation'}</span>
                      <span className="text-emerald-400 font-bold" dir="ltr">{finding.confidenceBreakdown.correlationStrengthScore}/25</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">{isAr ? 'الاستخبارات' : 'Intel'}</span>
                      <span className="text-amber-400 font-bold" dir="ltr">{finding.confidenceBreakdown.intelMatchesScore}/40</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">{isAr ? 'تنوع المصادر' : 'Diversity'}</span>
                      <span className="text-purple-400 font-bold" dir="ltr">{finding.confidenceBreakdown.sourceDiversityScore}/30</span>
                    </div>
                  </div>
                </div>

                {/* Supporting Events List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {isAr ? 'الأحداث الداعمة للنتيجة:' : 'Supporting Telemetry Events:'}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {finding.eventIds.map((evtId) => (
                      <button
                        key={evtId}
                        onClick={() => selectEvent(evtId)}
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-[11px] font-mono text-slate-300 transition-colors"
                        dir="ltr"
                      >
                        {evtId}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Handoff Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    {hasSoc && (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تمت الإحالة لـ SOC' : 'Dispatched to SOC'}</span>
                      </span>
                    )}
                    {hasForensics && (
                      <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تم حفظ الأدلة الجنائية' : 'Preserved in Forensics'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dispatchSocHandoff(finding.id)}
                      data-testid={`btn-soc-handoff-${finding.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إحالة إلى SOC' : 'Handoff to SOC'}</span>
                    </button>

                    <button
                      onClick={() => dispatchForensicsHandoff(finding.id)}
                      data-testid={`btn-forensics-handoff-${finding.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إحالة إلى التحقيق الجنائي' : 'Forensics Handoff'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Finding Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-sm font-bold text-white">
                {isAr ? 'توثيق نتيجة تحقيق صيد التهديدات' : 'Document Threat Hunting Finding'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-500 hover:text-white text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-300 font-semibold">{isAr ? 'عنوان النتيجة (English)' : 'Title (English)'}</label>
                <input
                  type="text"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g. Multi-Stage Credential Spray and Infiltration"
                  required
                  data-testid="input-finding-title-en"
                  className="p-2 rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300 font-semibold">{isAr ? 'ملخص النتيجة' : 'Summary'}</label>
                <textarea
                  value={newSummaryEn}
                  onChange={(e) => setNewSummaryEn(e.target.value)}
                  placeholder="Describe observed behavior, timeline, and impact..."
                  rows={2}
                  required
                  data-testid="input-finding-summary-en"
                  className="p-2 rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Select Supporting Events */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-semibold">
                  {isAr ? 'اختر الأحداث الداعمة من السجلات:' : 'Select Supporting Telemetry Events:'}
                </label>
                <div className="max-h-40 overflow-y-auto p-2 rounded bg-slate-900/60 border border-slate-800 space-y-1">
                  {telemetryEvents.map((evt) => (
                    <label
                      key={evt.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer font-mono text-[11px] text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEventIds.includes(evt.id)}
                        onChange={() => toggleEventSelection(evt.id)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span className="text-cyan-400 font-bold" dir="ltr">+{evt.virtualTime}s [{evt.sourceWorld}]</span>
                      <span className="truncate" dir="ltr">{evt.eventType}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-900 text-slate-400 hover:text-white"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  data-testid="btn-submit-finding"
                  disabled={!newTitleEn.trim() || selectedEventIds.length === 0}
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold"
                >
                  {isAr ? 'حفظ وتأكيد النتيجة' : 'Save & Validate Finding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
