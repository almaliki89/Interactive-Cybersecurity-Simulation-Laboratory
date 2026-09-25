import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  SocChallengeState,
  getInitialSocChallengeState,
  validateSocInvestigationState,
  SocMasterValidationResult,
} from './logic/hardening';
import { STANDARD_DETECTION_RULES } from './logic/detection';
import { CONTAINMENT_ACTIONS, ContainmentActionType } from './logic/containment';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Lock,
  Key,
  Database,
  Sliders,
  FileCheck,
  Globe,
  Radio,
  Server,
  Activity,
  Award,
  Clock,
  Layers,
  Search,
  User,
} from 'lucide-react';

interface SocMasterChallengeProps {
  onBackToMap?: () => void;
  onNavigateToLab?: (labId: string) => void;
}

export const SocMasterChallenge: React.FC<SocMasterChallengeProps> = ({
  onBackToMap,
  onNavigateToLab,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const addEvent = useSimulationStore((s) => s.addEvent);
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  const [state, setState] = useState<SocChallengeState>(getInitialSocChallengeState);

  const validation: SocMasterValidationResult = validateSocInvestigationState(state);

  const handleRunAudit = () => {
    const result = validateSocInvestigationState(state);
    if (result.success && result.score === 100) {
      if (completeChallenge) {
        completeChallenge('soc_master');
      }

      if (addEvent) {
        addEvent({
          id: `evt-soc-master-complete-${virtualTime}`,
          type: 'MASTER_CHALLENGE_COMPLETED',
          virtualTime,
          timestamp: virtualTime,
          category: 'SOC',
          severity: 'threat',
          description: 'Nexora SOC multi-stage incident investigation and proportional containment completed at 100% score (12 security controls + 1 business continuity requirement verified)!',
        });
      }
    }
  };

  const handleReset = () => {
    setState(getInitialSocChallengeState());
  };

  const toggleRule = (ruleId: string) => {
    setState((prev) => {
      const exists = prev.enabledRuleIds.includes(ruleId);
      const newRules = exists
        ? prev.enabledRuleIds.filter((id) => id !== ruleId)
        : [...prev.enabledRuleIds, ruleId];
      return { ...prev, enabledRuleIds: newRules };
    });
  };

  const toggleContainment = (actionId: ContainmentActionType) => {
    setState((prev) => {
      const exists = prev.selectedContainmentActions.includes(actionId);
      const newActions = exists
        ? prev.selectedContainmentActions.filter((id) => id !== actionId)
        : [...prev.selectedContainmentActions, actionId];
      return { ...prev, selectedContainmentActions: newActions };
    });
  };

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
              <ShieldAlert className="w-6 h-6 text-yellow-400" />
              <span>{isAr ? 'التحدي الشامل: قيادة الاستجابة لحادثة Nexora SOC' : 'Master Challenge: Nexora Multi-Stage Incident Response'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'حادثة أمنية معقدة عبر أنظمة متعددة تتطلب 12 ضابطاً دفاعياً وتحقيقياً + متطلب استمرارية الأعمال دون تعطيل الشركة!'
                : 'Production enterprise incident requiring 12 security controls + 1 business continuity requirement. Triage, investigate, and contain without business outage.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAudit}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold shadow-lg transition-all ${
              validation.success
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>{isAr ? 'تشغيل التدقيق الأمني والتحقق' : 'Run Security Audit'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scoreboard Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        validation.success
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border-emerald-500/60 shadow-xl shadow-emerald-950/30'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-yellow-950/40 border-slate-800 shadow-xl'
      }`}>
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              validation.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {validation.success ? 'INCIDENT FULLY CONTAINED & AUDITED' : 'INVESTIGATION IN PROGRESS'}
            </span>
            <span className="text-slate-500">Nexora Enterprise SOC Gate</span>
          </div>
          <div className="text-sm font-bold text-slate-200">
            {isAr ? validation.summaryAr : validation.summaryEn}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-slate-500 text-[10px] uppercase">Passed Checks</div>
            <div className="text-xl font-bold text-emerald-400">{validation.passedChecks.length} / {validation.checkDetails.length}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-[10px] uppercase">Security Score</div>
            <div className={`text-4xl font-black ${validation.score === 100 ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {validation.score}%
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive SOC Investigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Detection Rule Activation & Tuning */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>1. Enable Multi-Tier Detection Catalog</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-bold">{state.enabledRuleIds.length} Active</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {STANDARD_DETECTION_RULES.map((rule) => {
              const isEnabled = state.enabledRuleIds.includes(rule.id);
              return (
                <label
                  key={rule.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer text-[11px]"
                >
                  <div className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleRule(rule.id)}
                      className="rounded border-slate-700 text-cyan-500"
                    />
                    <span className="font-bold">{isAr ? rule.nameAr : rule.nameEn}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{rule.ruleType}</span>
                </label>
              );
            })}
          </div>

          {/* Rule Threshold Tuner */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Auth Brute Force Threshold:</span>
            <div className="flex items-center gap-2">
              {[3, 5, 10].map((thr) => (
                <button
                  key={thr}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      tunedRuleThresholds: { ...s.tunedRuleThresholds, 'rule-auth-bruteforce': thr },
                    }))
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    (state.tunedRuleThresholds['rule-auth-bruteforce'] || 5) === thr
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {thr} fails
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Entity Attribution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>2. Attack Entity Attribution</span>
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">Compromised User Identity:</label>
              <select
                value={state.selectedPrimaryUser}
                onChange={(e) => setState((s) => ({ ...s, selectedPrimaryUser: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              >
                <option value="">Select Target User...</option>
                <option value="sara">sara (Finance Department)</option>
                <option value="admin_alex">admin_alex (Domain Admin)</option>
                <option value="bob">bob (External Client)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Involved Workstation / Host:</label>
              <select
                value={state.selectedPrimaryHost}
                onChange={(e) => setState((s) => ({ ...s, selectedPrimaryHost: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              >
                <option value="">Select Target Host...</option>
                <option value="FIN-WS-01">FIN-WS-01 (Sara's Workstation)</option>
                <option value="DC-01">DC-01 (Domain Controller)</option>
                <option value="APP-SRV-01">APP-SRV-01 (Application Server)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Targeted Sensitive Resource:</label>
              <select
                value={state.selectedTargetResource}
                onChange={(e) => setState((s) => ({ ...s, selectedTargetResource: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              >
                <option value="">Select Target Resource...</option>
                <option value="\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx">\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx</option>
                <option value="/api/v1/orders/1001">/api/v1/orders/1001</option>
                <option value="\\\\CORP-FS\\PublicShare">\\\\CORP-FS\\PublicShare</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Incident Timeline Anchors */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>3. Reconstruct Incident Timeline Anchors</span>
            </span>
            <span className="text-[10px] text-purple-400 font-bold">{state.attachedTimelineEventIds.length} Anchors</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {[
              { id: 'evt-auth-fail-1', label: 'T+0: Initial Windows Logon Failures (Brute Force)' },
              { id: 'evt-auth-success', label: 'T+350: Successful Kerberos Logon (Credential Compromise)' },
              { id: 'evt-priv-group-mod', label: 'T+550: Added to Domain Admins Group (Privilege Escalation)' },
              { id: 'evt-process-spawn', label: 'T+750: EDR Cmd.exe Child Process Spawned (Host Anomaly)' },
              { id: 'evt-net-probe-1', label: 'T+900: Firewall Dropped Port Scan Packets (Network Probe)' },
              { id: 'evt-sensitive-share-access', label: 'T+1150: Unauthorized Read of Confidential Finance Share' },
              { id: 'evt-app-bola-violation', label: 'T+1350: AppSec 403 BOLA Access Denial (API Probe)' },
            ].map((anchor) => {
              const isAttached = state.attachedTimelineEventIds.includes(anchor.id);
              return (
                <label
                  key={anchor.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isAttached}
                    onChange={() =>
                      setState((prev) => {
                        const exists = prev.attachedTimelineEventIds.includes(anchor.id);
                        return {
                          ...prev,
                          attachedTimelineEventIds: exists
                            ? prev.attachedTimelineEventIds.filter((id) => id !== anchor.id)
                            : [...prev.attachedTimelineEventIds, anchor.id],
                        };
                      })
                    }
                    className="rounded border-slate-700 text-purple-500"
                  />
                  <span className={isAttached ? 'text-purple-300 font-bold' : 'text-slate-400'}>{anchor.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 4. Proportional Containment Decisions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>4. Execute Proportional Containment Actions</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">{state.selectedContainmentActions.length} Actions</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {CONTAINMENT_ACTIONS.map((action) => {
              const isSelected = state.selectedContainmentActions.includes(action.id);
              return (
                <label
                  key={action.id}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    isSelected
                      ? action.isOverlyDestructive
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                        : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleContainment(action.id)}
                    className="rounded border-slate-700 mt-0.5"
                  />
                  <div>
                    <strong className="block text-white">{isAr ? action.nameAr : action.nameEn}</strong>
                    <span className="text-[10px] text-slate-400 block">{isAr ? action.businessImpactAr : action.businessImpactEn}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Master Checklist Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <span className="font-bold text-slate-300 uppercase block pb-2 border-b border-slate-800">
          {isAr
            ? `قائمة التحقق من الامتثال الأمني: 12 ضابطاً أمنياً + متطلب استمرارية الأعمال (${validation.passedChecks.length} / ${validation.checkDetails.length})`
            : `Enterprise Security Compliance Checklist: 12 Security Controls + 1 Business Continuity Requirement (${validation.passedChecks.length} / ${validation.checkDetails.length})`}
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {validation.checkDetails.map((chk) => (
            <div
              key={chk.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                chk.passed
                  ? 'bg-slate-950/60 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold truncate">
                {chk.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                <span className="truncate">{isAr ? chk.nameAr : chk.nameEn}</span>
              </div>
              <span className="text-[10px] font-mono shrink-0 text-slate-500">+{chk.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
