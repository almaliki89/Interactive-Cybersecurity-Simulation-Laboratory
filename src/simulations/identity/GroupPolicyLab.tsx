import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  INITIAL_OUS,
  AdOrganizationalUnit,
  DOMAIN_DN,
} from './logic/directory';
import {
  AdGpo,
  INITIAL_GPOS,
  resolveEffectivePolicies,
  GpoSettings,
  ResolvedGpoResult,
} from './logic/gpo';
import {
  FileCode,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FolderTree,
  Sliders,
  Info,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';

interface GroupPolicyLabProps {
  onBackToMap?: () => void;
  onNavigateToChallenge?: () => void;
}

export const GroupPolicyLab: React.FC<GroupPolicyLabProps> = ({
  onBackToMap,
  onNavigateToChallenge,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [gpos, setGpos] = useState<AdGpo[]>(INITIAL_GPOS);
  const [ous, setOus] = useState<AdOrganizationalUnit[]>(INITIAL_OUS);
  const [selectedTargetOu, setSelectedTargetOu] = useState<string>(
    'OU=Workstations,OU=Finance,DC=corp,DC=nexora,DC=local'
  );

  const toggleGpoEnabled = (gpoId: string) => {
    setGpos((prev) =>
      prev.map((g) => (g.id === gpoId ? { ...g, enabled: !g.enabled } : g))
    );
  };

  const toggleGpoEnforced = (gpoId: string) => {
    setGpos((prev) =>
      prev.map((g) => (g.id === gpoId ? { ...g, enforced: !g.enforced } : g))
    );
  };

  const toggleOuBlockInheritance = (ouDn: string) => {
    setOus((prev) =>
      prev.map((o) =>
        o.distinguishedName === ouDn
          ? { ...o, blockInheritance: !o.blockInheritance }
          : o
      )
    );
  };

  const targetOuObj = ous.find((o) => o.distinguishedName === selectedTargetOu);
  const resolved: ResolvedGpoResult = resolveEffectivePolicies(gpos, ous, selectedTargetOu);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
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
              <FileCode className="w-6 h-6 text-indigo-400" />
              <span>{isAr ? 'مختبر سياسات المجموعة (Group Policy Management - GPO)' : 'Group Policy (GPO) Precedence & Inheritance Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'استكشاف نموذج LSDOU، ترتيب الأسبقية، السياسات المفروضة إجبارياً (Enforced)، وحظر التوريث (Block Inheritance)'
                : 'Master LSDOU processing order, Enforced overrides, block inheritance boundaries, and effective setting resolution'}
            </p>
          </div>
        </div>

        {onNavigateToChallenge && (
          <button
            onClick={onNavigateToChallenge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold"
          >
            <span>{isAr ? 'التحدي الشامل' : 'Master Challenge'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Target Container Selector & Block Inheritance Toggle */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-[280px]">
            <label className="text-slate-300 font-bold block">
              {isAr ? 'اختر الوحدة التنظيمية الهدف لحساب السياسة الفعالة:' : 'Target Organizational Unit (OU) for Effective Policy:'}
            </label>
            <select
              value={selectedTargetOu}
              onChange={(e) => setSelectedTargetOu(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={DOMAIN_DN}>{DOMAIN_DN} (Domain Root)</option>
              {ous.map((ou) => (
                <option key={ou.id} value={ou.distinguishedName}>
                  {ou.name} ({ou.distinguishedName})
                </option>
              ))}
            </select>
          </div>

          {targetOuObj && (
            <div className="pt-4">
              <button
                onClick={() => toggleOuBlockInheritance(targetOuObj.distinguishedName)}
                className={`px-4 py-2 rounded-xl border font-bold transition-all ${
                  targetOuObj.blockInheritance
                    ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {targetOuObj.blockInheritance
                  ? isAr
                    ? 'حظر التوريث مُفعل (Block Inheritance ON)'
                    : 'Block Inheritance: ACTIVE (Blocks parent GPOs)'
                  : isAr
                  ? 'حظر التوريث مُعطل (Block Inheritance OFF)'
                  : 'Block Inheritance: OFF'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Linked GPOs Config (Left) + Effective Settings & Origin (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linked GPOs Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            {isAr ? 'سياسات GPO المتاحة والروابط:' : 'Configured GPOs & Link Attributes:'}
          </span>
          <div className="space-y-3">
            {gpos.map((gpo) => (
              <div
                key={gpo.id}
                className={`p-4 rounded-2xl border font-mono text-xs space-y-3 transition-all ${
                  gpo.enabled
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{gpo.name}</h3>
                    <span className="text-[11px] text-cyan-400 block truncate max-w-[280px]">
                      Linked: {gpo.linkedTargetDn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleGpoEnforced(gpo.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        gpo.enforced
                          ? 'bg-rose-950 border-rose-600 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'
                      }`}
                      title="Enforced GPOs cannot be blocked by downstream OUs and override conflicting settings"
                    >
                      {gpo.enforced ? 'ENFORCED (No Override)' : 'Not Enforced'}
                    </button>

                    <button
                      onClick={() => toggleGpoEnabled(gpo.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        gpo.enabled
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {gpo.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isAr ? gpo.descriptionAr : gpo.descriptionEn}
                </p>

                {/* Settings Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                  {Object.entries(gpo.settings).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400"
                    >
                      {k}: <strong className="text-white">{String(v)}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Effective Result & Origin Trace (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Effective Security Settings</span>
              </span>
              <span className="text-[10px] text-indigo-400">Target OU Evaluation</span>
            </div>

            {/* Resolved Settings List */}
            <div className="space-y-2.5">
              {Object.entries(resolved.effectiveSettings).map(([key, value]) => {
                const origin = resolved.settingOrigins[key as keyof GpoSettings];
                return (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold">{key}:</span>
                      <span className="text-emerald-400 font-black text-sm">{String(value)}</span>
                    </div>

                    {origin && (
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-900">
                        <span>
                          Applied by: <strong className="text-cyan-300">{origin.gpoName}</strong>
                        </span>
                        {origin.enforced && (
                          <span className="text-rose-400 font-bold">(Enforced)</span>
                        )}
                        {origin.overrodePrevious && (
                          <span className="text-amber-400">
                            (Overrode: {origin.overrodePrevious.gpoName} = {String(origin.overrodePrevious.previousValue)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evaluation Trace Log */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider block">
              {isAr ? 'سجل تتبع معالجة السياسات (LSDOU Precedence Trace):' : 'LSDOU Precedence Evaluation Trace:'}
            </span>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {resolved.trace.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-start justify-between text-[11px] ${
                    step.applied
                      ? 'bg-slate-950 border-slate-800 text-slate-300'
                      : step.blockedByInheritance
                      ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                      : 'bg-slate-950/60 border-slate-900 text-slate-500'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white block">
                      [{step.containerName}] {step.gpoName}
                    </span>
                    <span className="text-[10px] opacity-80">{isAr ? step.reasonAr : step.reasonEn}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      step.applied
                        ? 'bg-emerald-950 text-emerald-300'
                        : step.blockedByInheritance
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {step.applied ? 'APPLIED' : step.blockedByInheritance ? 'BLOCKED' : 'DISABLED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
