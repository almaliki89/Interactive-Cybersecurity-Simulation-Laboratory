import React, { useState } from 'react';
import { Challenge, ChallengeObjective } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Trophy,
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChallengePanelProps {
  challenge: Challenge;
  onValidate?: () => { success: boolean; message: string };
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({
  challenge,
  onValidate,
}) => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const completedChallenges = useSimulationStore((s) => s.completedChallenges);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const addLog = useSimulationStore((s) => s.addLog);

  const [showHintIndex, setShowHintIndex] = useState<number>(-1);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const isMastered = completedChallenges.includes(challenge.id);

  const handleRunValidation = () => {
    if (onValidate) {
      const res = onValidate();
      setValidationResult(res);
      if (res.success) {
        completeChallenge(challenge.id);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
        addLog({
          level: 'INFO',
          source: 'CHALLENGE_ENGINE',
          message: `Challenge '${challenge.title}' verified and mastered!`,
          category: 'SECURITY',
        });
      }
    }
  };

  return (
    <div className="w-80 lg:w-88 h-full border-r rtl:border-r-0 rtl:border-l border-slate-800 bg-slate-950/95 flex flex-col text-slate-300 select-none overflow-hidden z-20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            {challenge.category}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              challenge.difficulty === 'Beginner'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : challenge.difficulty === 'Intermediate'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {challenge.difficulty}
          </span>
        </div>
        <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
          {isMastered && <Trophy className="w-4 h-4 text-amber-400 shrink-0" />}
          <span>{challenge.title}</span>
        </h2>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Mission Statement */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
            {t.challenges.missionObjective}
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {challenge.mission}
          </p>
        </div>

        {/* Concept Context / Explanation */}
        <div className="text-xs text-slate-400 leading-relaxed">
          {challenge.initialExplanation}
        </div>

        {/* Criteria / Objectives Checklist */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            {t.challenges.requirements}
          </span>
          <div className="space-y-1.5">
            {challenge.objectives.map((obj, i) => (
              <div
                key={obj.id}
                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${
                  obj.isCompleted || isMastered
                    ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300'
                }`}
              >
                {obj.isCompleted || isMastered ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block text-white">{obj.title}</span>
                  <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">
                    {obj.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Result Banner */}
        {validationResult && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
              validationResult.success
                ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            {validationResult.success ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {validationResult.success ? t.challenges.passed : t.challenges.failed}
              </span>
              <p className="mt-0.5 leading-relaxed">{validationResult.message}</p>
            </div>
          </div>
        )}

        {/* Hints accordion */}
        {challenge.hints && challenge.hints.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() =>
                setShowHintIndex((prev) => (prev >= challenge.hints.length - 1 ? -1 : prev + 1))
              }
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {showHintIndex >= 0
                  ? `${t.challenges.hint} ${showHintIndex + 1}/${challenge.hints.length}`
                  : t.challenges.needHint}
              </span>
            </button>

            {showHintIndex >= 0 && (
              <div className="mt-2 p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-amber-200/90 leading-relaxed font-mono">
                {challenge.hints[showHintIndex]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Validate Action */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/40 shrink-0">
        <button
          onClick={handleRunValidation}
          className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm ${
            isMastered
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
          }`}
        >
          {isMastered ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.challenges.retestBtn}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>{t.challenges.validateBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
