import React, { useMemo, useEffect, useRef } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import { useThreatHuntingStore } from './runtime/threatHuntingStore';
import { ThreatHuntingWorkspace } from './components/ThreatHuntingWorkspace';
import { ThreatHuntValidator } from './logic/validators';

export const ThreatHuntingSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';

  const activeHuntId = useThreatHuntingStore((s) => s.activeHuntId);
  const hunts = useThreatHuntingStore((s) => s.hunts);
  const hypotheses = useThreatHuntingStore((s) => s.hypotheses);
  const findings = useThreatHuntingStore((s) => s.findings);
  const detections = useThreatHuntingStore((s) => s.detections);
  const detectionResults = useThreatHuntingStore((s) => s.detectionResults);
  const socHandoffs = useThreatHuntingStore((s) => s.socHandoffs);
  const forensicsHandoffs = useThreatHuntingStore((s) => s.forensicsHandoffs);
  const executedQueryStrings = useThreatHuntingStore((s) => s.executedQueryStrings);
  const executedQueriesByHunt = useThreatHuntingStore((s) => s.executedQueriesByHunt);
  const telemetryEvents = useThreatHuntingStore((s) => s.telemetryEvents);

  const hunt = hunts[activeHuntId] || hunts['HUNT-01'];
  const hyp = hypotheses[hunt?.hypothesisId || 'HYP-01'] || hypotheses['HYP-01'];

  // Scope queries strictly to the active hunt
  const huntQueries = useMemo(() => {
    return executedQueriesByHunt?.[hunt.id] || [];
  }, [executedQueriesByHunt, hunt.id]);

  const validationState = useMemo(() => {
    return {
      hunt,
      hypothesis: hyp,
      findings,
      detections,
      detectionResults,
      socHandoffs,
      forensicsHandoffs,
      executedQueries: huntQueries,
      telemetryEvents,
    };
  }, [hunt, hyp, findings, detections, detectionResults, socHandoffs, forensicsHandoffs, huntQueries, telemetryEvents]);

  const validationStateRef = useRef(validationState);
  validationStateRef.current = validationState;

  useEffect(() => {
    registerChallengeValidator('threat-hunting-hypothesis-challenge', () => {
      const state = validationStateRef.current;
      const targetHuntId = state.hunt?.id || 'HUNT-01';
      const outcome = ThreatHuntValidator.validateScenario(targetHuntId, state);

      return {
        success: outcome.success,
        score: outcome.success ? 100 : 0,
        message: outcome.messageEn,
      };
    });

    return () => {
      unregisterChallengeValidator('threat-hunting-hypothesis-challenge');
    };
  }, []);

  const validationOutcome = useMemo(() => {
    return ThreatHuntValidator.validateScenario(hunt.id, validationState);
  }, [hunt.id, validationState]);

  useEffect(() => {
    if (validationOutcome.success) {
      completeChallenge('threat-hunting-hypothesis-challenge', {
        success: true,
        score: 100,
        message: validationOutcome.messageEn,
      });
    }
  }, [validationOutcome, completeChallenge]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none">
      {/* Authoritative Challenge Status & Guidance Bar */}
      <div
        data-testid="threat-hunt-challenge-status"
        className={`px-4 py-2 border-b text-xs flex items-center justify-between font-mono shrink-0 transition-colors ${
          validationOutcome.success
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
            : 'bg-slate-900/90 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-white uppercase tracking-wider">
            {isAr ? 'تحدي الصيد:' : 'Hunt Challenge:'}
          </span>
          <span className="truncate">
            {isAr ? validationOutcome.messageAr : validationOutcome.messageEn}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              validationOutcome.success
                ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
                : 'bg-slate-800 text-amber-300 border border-slate-700'
            }`}
          >
            {validationOutcome.completedObjectives.length}/5 {isAr ? 'أهداف' : 'Objectives'}
          </span>
        </div>
      </div>

      <ThreatHuntingWorkspace language={language} />
    </div>
  );
};

export default ThreatHuntingSimulation;
