/**
 * OMEGA V15 — DevSecOps & Software Supply Chain World
 * DevSecOpsSimulation.tsx
 *
 * Primary router component for World 22 (DevSecOps & Software Supply Chain World).
 * Dispatches between DevSecOpsWorldMap and the 15 interactive specialized labs.
 */

import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { DevSecOpsWorldMap } from './DevSecOpsWorldMap';
import { SastCodeScannerLab } from './SastCodeScannerLab';
import { ScaDependencyLab } from './ScaDependencyLab';
import { SecretScannerLab } from './SecretScannerLab';
import { IacTerraformLab } from './IacTerraformLab';
import { SupplyChainSlsaLab } from './SupplyChainSlsaLab';
import { PipelineGatesLab } from './PipelineGatesLab';
import { DriftDetectionLab } from './DriftDetectionLab';
import { ServerlessSecurityLab } from './ServerlessSecurityLab';
import { SbomInventoryLab } from './SbomInventoryLab';
import { ContainerCiGateLab } from './ContainerCiGateLab';
import { SoftwareSigningLab } from './SoftwareSigningLab';
import { CompliancePolicyLab } from './CompliancePolicyLab';
import { PipelineIncidentLab } from './PipelineIncidentLab';
import { DevSecOpsArchitectureLab } from './DevSecOpsArchitectureLab';
import { DevSecOpsMasterChallenge } from './DevSecOpsMasterChallenge';
import { DependencyConfusionLab } from './DependencyConfusionLab';
import { Workspace } from '../../components/simulation/Workspace';

export const DevSecOpsSimulation: React.FC = () => {
  const activeTab = useDevSecOpsStore((s) => s.activeTab);
  const setActiveTab = useDevSecOpsStore((s) => s.setActiveTab);
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const labsMetadata: Record<string, { titleEn: string; titleAr: string }> = {
    sast: { titleEn: 'SAST Code Scanner', titleAr: 'فحص الكود المصدري' },
    sca: { titleEn: 'SCA Dependency Audit', titleAr: 'فحص التبعيات' },
    secrets: { titleEn: 'Git Secret Scanner', titleAr: 'فحص الأسرار' },
    iac: { titleEn: 'IaC Terraform Security', titleAr: 'أمن البنية التحتية' },
    slsa: { titleEn: 'SLSA Provenance', titleAr: 'توثيق البناء' },
    gates: { titleEn: 'Pipeline Quality Gates', titleAr: 'بوابات الجودة' },
    drift: { titleEn: 'Infrastructure Drift', titleAr: 'انحراف البنية' },
    serverless: { titleEn: 'Serverless Security', titleAr: 'أمن الدوال' },
    sbom: { titleEn: 'SBOM Inventory', titleAr: 'جرد المكونات' },
    containerci: { titleEn: 'CI Container Scan', titleAr: 'فحص الحاويات' },
    signing: { titleEn: 'Artifact Signing', titleAr: 'توقيع المخرجات' },
    compliance: { titleEn: 'Compliance as Code', titleAr: 'الامتثال التلقائي' },
    incident: { titleEn: 'Supply Chain Incident', titleAr: 'حوادث التوريد' },
    architecture: { titleEn: 'DevSecOps Architecture', titleAr: 'المعمارية الآمنة' },
    dependency_confusion: { titleEn: 'Dependency Confusion', titleAr: 'خلط التبعيات' },
    master: { titleEn: 'Master Challenge', titleAr: 'التحدي الشامل' },
  };

  const renderActiveLab = () => {
    switch (activeTab) {
      case 'sast': return <SastCodeScannerLab />;
      case 'sca': return <ScaDependencyLab />;
      case 'secrets': return <SecretScannerLab />;
      case 'iac': return <IacTerraformLab />;
      case 'slsa': return <SupplyChainSlsaLab />;
      case 'gates': return <PipelineGatesLab />;
      case 'drift': return <DriftDetectionLab />;
      case 'serverless': return <ServerlessSecurityLab />;
      case 'sbom': return <SbomInventoryLab />;
      case 'containerci': return <ContainerCiGateLab />;
      case 'signing': return <SoftwareSigningLab />;
      case 'compliance': return <CompliancePolicyLab />;
      case 'incident': return <PipelineIncidentLab />;
      case 'architecture': return <DevSecOpsArchitectureLab />;
      case 'dependency_confusion': return <DependencyConfusionLab language={language} />;
      case 'master': return <DevSecOpsMasterChallenge />;
      case 'map':
      default:
        return <DevSecOpsWorldMap onSelectLab={(labId) => setActiveTab(labId)} />;
    }
  };

  if (activeTab === 'map') {
    return <DevSecOpsWorldMap onSelectLab={(labId) => setActiveTab(labId)} />;
  }

  const meta = labsMetadata[activeTab] || { titleEn: 'DevSecOps Lab', titleAr: 'مختبر DevSecOps' };

  return (
    <Workspace
      title={isAr ? meta.titleAr : meta.titleEn}
      domainName={isAr ? 'عالم DevSecOps' : 'DevSecOps World'}
      onBackToHub={() => setActiveTab('map')}
    >
      <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden select-none">
        <div className="flex-1 overflow-hidden flex flex-col">{renderActiveLab()}</div>
      </div>
    </Workspace>
  );
};
