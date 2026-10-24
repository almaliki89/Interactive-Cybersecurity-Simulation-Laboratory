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
  const activeHuntId = useThreatHuntingStore((s) => s.activeHuntId);
  const hunts = useThreatHuntingStore((s) => s.hunts);
  const hypotheses = useThreatHuntingStore((s) => s.hypotheses);
  const findings = useThreatHuntingStore((s) => s.findings);
  const detections = useThreatHuntingStore((s) => s.detections);
  const detectionResults = useThreatHuntingStore((s) => s.detectionResults);
  const socHandoffs = useThreatHuntingStore((s) => s.socHandoffs);
  const forensicsHandoffs = useThreatHuntingStore((s) => s.forensicsHandoffs);
  const executedQueryStrings = useThreatHuntingStore((s) => s.executedQueryStrings);
  const telemetryEvents = useThreatHuntingStore((s) => s.telemetryEvents);

  const hunt = hunts[activeHuntId] || hunts['HUNT-01'];
  const hyp = hypotheses[hunt?.hypothesisId || 'HYP-01'] || hypotheses['HYP-01'];

  const validationState = useMemo(() => {
    return {
      hunt,
      hypothesis: hyp,
      findings,
      detections,
      detectionResults,
      socHandoffs,
      forensicsHandoffs,
      executedQueries: executedQueryStrings,
      telemetryEvents,
    };
  }, [hunt, hyp, findings, detections, detectionResults, socHandoffs, forensicsHandoffs, executedQueryStrings, telemetryEvents]);

  const validationStateRef = useRef(validationState);
  validationStateRef.current = validationState;

  useEffect(() => {
    registerChallengeValidator('threat-hunting-hypothesis-challenge', () => {
      const state = validationStateRef.current;
      const hasExecutedQueries = state.executedQueries && state.executedQueries.some((q) => q.trim().length > 0);
      const isHypothesisSupported = state.hypothesis && state.hypothesis.status === 'SUPPORTED';
      const hasValidatedFinding = state.findings && state.findings.some((f) => f.status === 'VALIDATED' && f.eventIds.length >= 1);

      // Require query execution AND evidence support (hypothesis supported or validated finding)
      const meetsCriteria = hasExecutedQueries && (isHypothesisSupported || hasValidatedFinding);

      if (meetsCriteria) {
        return {
          success: true,
          score: 100,
          message: 'Threat hunting hypothesis tested and verified with telemetry evidence.',
        };
      }
      return {
        success: false,
        score: 0,
        message: 'Execute telemetry queries and validate findings to support the threat hypothesis.',
      };
    });

    return () => {
      unregisterChallengeValidator('threat-hunting-hypothesis-challenge');
    };
  }, []);

  useEffect(() => {
    const state = validationState;
    const hasExecutedQueries = state.executedQueries && state.executedQueries.some((q) => q.trim().length > 0);
    const isHypothesisSupported = state.hypothesis && state.hypothesis.status === 'SUPPORTED';
    const hasValidatedFinding = state.findings && state.findings.some((f) => f.status === 'VALIDATED' && f.eventIds.length >= 1);

    if (hasExecutedQueries && (isHypothesisSupported || hasValidatedFinding)) {
      completeChallenge('threat-hunting-hypothesis-challenge', {
        success: true,
        score: 100,
        message: 'Threat hunting hypothesis tested and verified with telemetry evidence.',
      });
    }
  }, [validationState, completeChallenge]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none">
      <ThreatHuntingWorkspace language={language} />
    </div>
  );
};

export default ThreatHuntingSimulation;
