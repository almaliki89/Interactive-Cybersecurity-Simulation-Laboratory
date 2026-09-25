import React, { useState } from 'react';
import { SocWorldMap } from './SocWorldMap';
import { TelemetryIngestionLab } from './TelemetryIngestionLab';
import { SiemExplorerLab } from './SiemExplorerLab';
import { DetectionRuleLab } from './DetectionRuleLab';
import { AlertTriageLab } from './AlertTriageLab';
import { CorrelationLab } from './CorrelationLab';
import { ThreatHuntingLab } from './ThreatHuntingLab';
import { EndpointTelemetryLab } from './EndpointTelemetryLab';
import { NetworkTelemetryLab } from './NetworkTelemetryLab';
import { IdentityTelemetryLab } from './IdentityTelemetryLab';
import { AppTelemetryLab } from './AppTelemetryLab';
import { IncidentTimelineLab } from './IncidentTimelineLab';
import { ContainmentDecisionLab } from './ContainmentDecisionLab';
import { DetectionEngineeringLab } from './DetectionEngineeringLab';
import { SocMasterChallenge } from './SocMasterChallenge';

export type SocLabId =
  | 'map'
  | 'ingestion'
  | 'explorer'
  | 'detection_rules'
  | 'alert_triage'
  | 'correlation'
  | 'threat_hunting'
  | 'endpoint_telemetry'
  | 'network_telemetry'
  | 'identity_telemetry'
  | 'app_telemetry'
  | 'timeline'
  | 'containment'
  | 'detection_engineering'
  | 'challenge';

export const SocSimulation: React.FC = () => {
  const [activeLab, setActiveLab] = useState<SocLabId>('map');

  switch (activeLab) {
    case 'ingestion':
      return (
        <TelemetryIngestionLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToExplorer={() => setActiveLab('explorer')}
        />
      );

    case 'explorer':
      return (
        <SiemExplorerLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToDetectionRules={() => setActiveLab('detection_rules')}
        />
      );

    case 'detection_rules':
      return (
        <DetectionRuleLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToAlertTriage={() => setActiveLab('alert_triage')}
        />
      );

    case 'alert_triage':
      return (
        <AlertTriageLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToCorrelation={() => setActiveLab('correlation')}
        />
      );

    case 'correlation':
      return (
        <CorrelationLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToTimeline={() => setActiveLab('timeline')}
        />
      );

    case 'threat_hunting':
      return (
        <ThreatHuntingLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToEndpoint={() => setActiveLab('endpoint_telemetry')}
        />
      );

    case 'endpoint_telemetry':
      return (
        <EndpointTelemetryLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToNetwork={() => setActiveLab('network_telemetry')}
        />
      );

    case 'network_telemetry':
      return (
        <NetworkTelemetryLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToIdentity={() => setActiveLab('identity_telemetry')}
        />
      );

    case 'identity_telemetry':
      return (
        <IdentityTelemetryLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToAppSec={() => setActiveLab('app_telemetry')}
        />
      );

    case 'app_telemetry':
      return (
        <AppTelemetryLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToTimeline={() => setActiveLab('timeline')}
        />
      );

    case 'timeline':
      return (
        <IncidentTimelineLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToContainment={() => setActiveLab('containment')}
        />
      );

    case 'containment':
      return (
        <ContainmentDecisionLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToDetectionEngineering={() => setActiveLab('detection_engineering')}
        />
      );

    case 'detection_engineering':
      return (
        <DetectionEngineeringLab
          onBackToMap={() => setActiveLab('map')}
          onNavigateToMasterChallenge={() => setActiveLab('challenge')}
        />
      );

    case 'challenge':
      return (
        <SocMasterChallenge
          onBackToMap={() => setActiveLab('map')}
          onNavigateToLab={(labId) => setActiveLab(labId as SocLabId)}
        />
      );

    case 'map':
    default:
      return <SocWorldMap onSelectLab={(labId) => setActiveLab(labId as SocLabId)} />;
  }
};
