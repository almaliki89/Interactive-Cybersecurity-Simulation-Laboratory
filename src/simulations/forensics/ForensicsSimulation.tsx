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
import { FileSearch, Map, ArrowLeft } from 'lucide-react';

export const ForensicsSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const activeTab = useForensicsStore((s) => s.activeTab);
  const setActiveTab = useForensicsStore((s) => s.setActiveTab);
  const deepLink = useForensicsStore((s) => s.deepLinkContext);
  const setSelectedEvidenceId = useForensicsStore((s) => s.setSelectedEvidenceId);
  const runtimeEvents = useSimulationStore((s) => s.events);

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
         setSelectedEvidenceId(evidence.id);
      }
    }
  }, [deepLink, runtimeEvents, setSelectedEvidenceId]);

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
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden select-none">
      {/* Top Thin Shell Header Nav */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {activeTab !== 'map' && (
            <button
              onClick={() => setActiveTab('map')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isAr ? 'الخريطة' : 'Map'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
            <FileSearch className="w-4 h-4" />
            <span>{isAr ? 'عالم الاستجابة للحوادث والتحقيق الجنائي الرقمي' : 'Incident Response & Digital Forensics World'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-2xl text-[11px]">
          {[
            { id: 'map', labelEn: 'Map', labelAr: 'الخريطة' },
            { id: 'intake', labelEn: 'Intake', labelAr: 'استلام القضية' },
            { id: 'preservation', labelEn: 'Preservation', labelAr: 'الحفظ' },
            { id: 'custody', labelEn: 'Custody', labelAr: 'الحضانة' },
            { id: 'disk', labelEn: 'Disk', labelAr: 'القرص' },
            { id: 'memory', labelEn: 'RAM', labelAr: 'الذاكرة' },
            { id: 'windows', labelEn: 'Windows', labelAr: 'ويندوز' },
            { id: 'linux', labelEn: 'Linux', labelAr: 'لينكس' },
            { id: 'logs', labelEn: 'Logs', labelAr: 'السجلات' },
            { id: 'timeline', labelEn: 'Timeline', labelAr: 'الخط الزمني' },
            { id: 'rootcause', labelEn: 'Root Cause', labelAr: 'السبب الجذر' },
            { id: 'containment', labelEn: 'Containment', labelAr: 'الاحتواء' },
            { id: 'recovery', labelEn: 'Recovery', labelAr: 'التعافي' },
            { id: 'master', labelEn: 'Master Challenge', labelAr: 'التحدي الشامل' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as ForensicsLabId)}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {isAr ? t.labelAr : t.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Lab Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderActiveLab()}
      </div>
    </div>
  );
};
