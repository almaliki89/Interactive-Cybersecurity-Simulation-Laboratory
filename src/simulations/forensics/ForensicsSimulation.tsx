import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { ForensicsWorldMap } from './ForensicsWorldMap';
import { IncidentIntakeLab } from './IncidentIntakeLab';
import { EvidencePreservationLab } from './EvidencePreservationLab';
import { ChainOfCustodyLab } from './ChainOfCustodyLab';
import { DiskForensicsLab } from './DiskForensicsLab';
import { MemoryForensicsLab } from './MemoryForensicsLab';
import { WindowsArtifactLab } from './WindowsArtifactLab';
import { LinuxArtifactLab } from './LinuxArtifactLab';
import { LogForensicsLab } from './LogForensicsLab';
import { BrowserArtifactLab } from './BrowserArtifactLab';
import { NetworkEvidenceLab } from './NetworkEvidenceLab';
import { TimelineReconstructionLab } from './TimelineReconstructionLab';
import { RootCauseAnalysisLab } from './RootCauseAnalysisLab';
import { ContainmentEradicationLab } from './ContainmentEradicationLab';
import { RecoveryValidationLab } from './RecoveryValidationLab';
import { PostIncidentReviewLab } from './PostIncidentReviewLab';
import { ForensicsMasterChallenge } from './ForensicsMasterChallenge';
import { useForensicsStore, ForensicsLabId } from '../../stores/forensicsStore';
import { normalizeRuntimeEvent } from '../soc/logic/normalization';
import { createForensicEvidenceFromTelemetry } from './logic/evidence';
import { getInitialCustodyRecords } from './logic/custody';
import { FileSearch, Map, ArrowLeft } from 'lucide-react';

import { ForensicsCaseWorkspace } from './components/ForensicsCaseWorkspace';
import { NEXORA_CASE_EVIDENCE } from './logic/caseEvidence';

export const ForensicsSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const activeTab = useForensicsStore((s) => s.activeTab);
  const setActiveTab = useForensicsStore((s) => s.setActiveTab);
  const deepLink = useForensicsStore((s) => s.deepLinkContext);
  const setSelectedEvidenceId = useForensicsStore((s) => s.setSelectedEvidenceId);
  const addEvidence = useForensicsStore((s) => s.addEvidence);
  const setEvidence = useForensicsStore((s) => s.setEvidence);
  const setCustodyRecords = useForensicsStore((s) => s.setCustodyRecords);
  const runtimeEvents = useSimulationStore((s) => s.events);

  // Initialize Case Evidence & Custody
  React.useEffect(() => {
    setEvidence(NEXORA_CASE_EVIDENCE);
    setCustodyRecords(getInitialCustodyRecords());
  }, [setEvidence, setCustodyRecords]);

  // Deep Link Lifecycle: Resolve SOC events to Forensics Evidence IDs
  React.useEffect(() => {
    if (deepLink?.eventIds && deepLink.eventIds.length > 0) {
      // Find the first event to auto-select its derived evidence
      const firstEventId = deepLink.eventIds[0];
      
      const rawEvent = runtimeEvents.find(e => e.id === firstEventId);
      if (rawEvent) {
         // Use the canonical pipeline: normalize -> create evidence -> get ID
         const normalized = normalizeRuntimeEvent({
           id: rawEvent.id,
           type: rawEvent.type,
           source: rawEvent.source,
           target: rawEvent.target,
           category: rawEvent.category,
           severity: rawEvent.severity,
           virtualTime: rawEvent.virtualTime,
           description: rawEvent.description,
           payload: (rawEvent.payload as any) || {}
         });
         
         const evidence = createForensicEvidenceFromTelemetry(normalized);
         addEvidence(evidence); // Ensure it's in our collection
         setSelectedEvidenceId(evidence.id);
      }
    }
  }, [deepLink, runtimeEvents, setSelectedEvidenceId, addEvidence]);

  const renderActiveLab = () => {
    switch (activeTab) {
      case 'intake':
        return <IncidentIntakeLab />;
      case 'preservation':
        return <EvidencePreservationLab />;
      case 'custody':
        return <ChainOfCustodyLab />;
      case 'disk':
        return <DiskForensicsLab />;
      case 'memory':
        return <MemoryForensicsLab />;
      case 'windows':
        return <WindowsArtifactLab />;
      case 'linux':
        return <LinuxArtifactLab />;
      case 'logs':
        return <LogForensicsLab />;
      case 'browser':
        return <BrowserArtifactLab />;
      case 'network':
        return <NetworkEvidenceLab />;
      case 'timeline':
        return <TimelineReconstructionLab />;
      case 'rootcause':
        return <RootCauseAnalysisLab />;
      case 'containment':
        return <ContainmentEradicationLab />;
      case 'recovery':
        return <RecoveryValidationLab />;
      case 'lessons':
        return <PostIncidentReviewLab />;
      case 'master':
        return <ForensicsMasterChallenge />;
      case 'map':
      default:
        return <ForensicsWorldMap onSelectLab={(labId) => setActiveTab(labId as ForensicsLabId)} />;
    }
  };

  return (
    <ForensicsCaseWorkspace>
      {renderActiveLab()}
    </ForensicsCaseWorkspace>
  );
};
