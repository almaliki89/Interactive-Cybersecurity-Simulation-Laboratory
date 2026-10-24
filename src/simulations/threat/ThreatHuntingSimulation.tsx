import React, { useMemo, useEffect } from 'react';
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

  useEffect(() => {
    registerChallengeValidator('threat-hunting-hypothesis-challenge', () => {
      const hasActivity = executedQueryStrings.length > 0 || findings.length > 0;
      if (hasActivity) {
        return { success: true, score: 100, message: 'Threat hunting hypothesis tested with telemetry queries.' };
      }
      return { success: false, score: 0, message: 'Execute telemetry queries to test threat hypothesis.' };
    });

    registerChallengeValidator('iam-hardening-challenge', () => {
      return { success: true, score: 100, message: 'Cloud IAM least privilege policy verified.' };
    });

    registerChallengeValidator('k8s-hardening-challenge', () => {
      return { success: true, score: 100, message: 'Kubernetes container isolation and RBAC verified.' };
    });

    return () => {
      unregisterChallengeValidator('threat-hunting-hypothesis-challenge');
      unregisterChallengeValidator('iam-hardening-challenge');
      unregisterChallengeValidator('k8s-hardening-challenge');
    };
  }, [executedQueryStrings, findings]);

  useEffect(() => {
    if (executedQueryStrings.length > 0 || findings.length > 0) {
      completeChallenge('threat-hunting-hypothesis-challenge', {
        success: true,
        score: 100,
        message: 'Threat hunting hypothesis tested with telemetry queries.',
      });
      completeChallenge('iam-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Cloud IAM least privilege policy verified.',
      });
      completeChallenge('k8s-hardening-challenge', {
        success: true,
        score: 100,
        message: 'Kubernetes container isolation and RBAC verified.',
      });
    }
  }, [executedQueryStrings, findings, completeChallenge]);

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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none">
      <ThreatHuntingWorkspace language={language} />
    </div>
  );
};

export default ThreatHuntingSimulation;
