/**
 * OMEGA V15 — DevSecOps & Software Supply Chain World
 * DevSecOpsSimulation.tsx
 *
 * Primary router component for World 22 (DevSecOps & Software Supply Chain World).
 * Dispatches between DevSecOpsWorldMap and the 15 interactive specialized labs.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
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
import { Workflow, ArrowLeft } from 'lucide-react';

export const DevSecOpsSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<string>('map');

  const renderActiveLab = () => {
    switch (activeTab) {
      case 'sast':
        return <SastCodeScannerLab />;
      case 'sca':
        return <ScaDependencyLab />;
      case 'secrets':
        return <SecretScannerLab />;
      case 'iac':
        return <IacTerraformLab />;
      case 'slsa':
        return <SupplyChainSlsaLab />;
      case 'gates':
        return <PipelineGatesLab />;
      case 'drift':
        return <DriftDetectionLab />;
      case 'serverless':
        return <ServerlessSecurityLab />;
      case 'sbom':
        return <SbomInventoryLab />;
      case 'containerci':
        return <ContainerCiGateLab />;
      case 'signing':
        return <SoftwareSigningLab />;
      case 'compliance':
        return <CompliancePolicyLab />;
      case 'incident':
        return <PipelineIncidentLab />;
      case 'architecture':
        return <DevSecOpsArchitectureLab />;
      case 'master':
        return <DevSecOpsMasterChallenge />;
      case 'map':
      default:
        return <DevSecOpsWorldMap onSelectLab={(labId) => setActiveTab(labId)} />;
    }
  };

  const navTabs = [
    { id: 'map', labelEn: 'Map Hub', labelAr: 'الخريطة' },
    { id: 'sast', labelEn: 'SAST Scan', labelAr: 'فحص الكود' },
    { id: 'sca', labelEn: 'SCA Deps', labelAr: 'التبعيات' },
    { id: 'secrets', labelEn: 'Git Secrets', labelAr: 'الأسرار' },
    { id: 'iac', labelEn: 'IaC Terraform', labelAr: 'البنية التحتية' },
    { id: 'slsa', labelEn: 'SLSA Provenance', labelAr: 'التوثيق' },
    { id: 'gates', labelEn: 'Pipeline Gates', labelAr: 'البوابات' },
    { id: 'drift', labelEn: 'Drift Detection', labelAr: 'الانحراف' },
    { id: 'serverless', labelEn: 'Serverless', labelAr: 'الدوال' },
    { id: 'sbom', labelEn: 'SBOM Inventory', labelAr: 'الجرد' },
    { id: 'containerci', labelEn: 'CI Container', labelAr: 'الحاويات' },
    { id: 'signing', labelEn: 'Signing', labelAr: 'التوقيع' },
    { id: 'compliance', labelEn: 'Compliance', labelAr: 'الامتثال' },
    { id: 'incident', labelEn: 'Incident', labelAr: 'الحوادث' },
    { id: 'architecture', labelEn: 'Architecture', labelAr: 'المعمارية' },
    { id: 'master', labelEn: 'Master Challenge', labelAr: 'التحدي الشامل' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden select-none">
      {/* Header Bar */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {activeTab !== 'map' && (
            <button
              onClick={() => setActiveTab('map')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isAr ? 'الخريطة' : 'Map'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <Workflow className="w-4 h-4" />
            <span>{isAr ? 'عالم أمن سلاسل التوريد وDevSecOps (Nexora CI/CD)' : 'DevSecOps & Software Supply Chain World'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-3xl text-[11px]">
          {navTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isAr ? t.labelAr : t.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Lab Viewport */}
      <div className="flex-1 overflow-hidden flex flex-col">{renderActiveLab()}</div>
    </div>
  );
};
