import React, { useMemo } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useThreatHuntingStore } from './runtime/threatHuntingStore';
import { ThreatHuntingWorkspace } from './components/ThreatHuntingWorkspace';
import { ThreatHuntValidator } from './logic/validators';

export const ThreatHuntingSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black select-none">
      <ThreatHuntingWorkspace language={language} />
    </div>
  );
};
