/**
 * OMEGA V13 — Cloud Security World
 * CloudSimulation.tsx
 *
 * Thin router component for the Cloud Security World.
 * Dispatches between CloudWorldMap and the 16 interactive specialized labs.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { CloudWorldMap } from './CloudWorldMap';
import { CloudAccountLab } from './CloudAccountLab';
import { CloudIamLab } from './CloudIamLab';
import { RoleAssumptionLab } from './RoleAssumptionLab';
import { CloudPolicyLab } from './CloudPolicyLab';
import { CloudNetworkLab } from './CloudNetworkLab';
import { SecurityGroupLab } from './SecurityGroupLab';
import { CloudStorageLab } from './CloudStorageLab';
import { SecretsSecurityLab } from './SecretsSecurityLab';
import { WorkloadIdentityLab } from './WorkloadIdentityLab';
import { CloudComputeLab } from './CloudComputeLab';
import { CloudLoggingLab } from './CloudLoggingLab';
import { CloudMisconfigurationLab } from './CloudMisconfigurationLab';
import { CloudDetectionLab } from './CloudDetectionLab';
import { CloudIncidentLab } from './CloudIncidentLab';
import { CloudArchitectureLab } from './CloudArchitectureLab';
import { CloudMasterChallenge } from './CloudMasterChallenge';
import { Cloud, ArrowLeft } from 'lucide-react';

export const CloudSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<string>('map');

  const renderActiveLab = () => {
    switch (activeTab) {
      case 'accounts':
        return <CloudAccountLab />;
      case 'iam':
        return <CloudIamLab />;
      case 'roles':
        return <RoleAssumptionLab />;
      case 'policies':
        return <CloudPolicyLab />;
      case 'network':
        return <CloudNetworkLab />;
      case 'secgroups':
        return <SecurityGroupLab />;
      case 'storage':
        return <CloudStorageLab />;
      case 'secrets':
        return <SecretsSecurityLab />;
      case 'workload':
        return <WorkloadIdentityLab />;
      case 'compute':
        return <CloudComputeLab />;
      case 'logging':
        return <CloudLoggingLab />;
      case 'misconfigs':
        return <CloudMisconfigurationLab />;
      case 'detection':
        return <CloudDetectionLab />;
      case 'incident':
        return <CloudIncidentLab />;
      case 'architecture':
        return <CloudArchitectureLab />;
      case 'master':
        return <CloudMasterChallenge />;
      case 'map':
      default:
        return <CloudWorldMap onSelectLab={(labId) => setActiveTab(labId)} />;
    }
  };

  const navTabs = [
    { id: 'map', labelEn: 'Map Hub', labelAr: 'الخريطة' },
    { id: 'accounts', labelEn: 'Accounts', labelAr: 'الحسابات' },
    { id: 'iam', labelEn: 'IAM', labelAr: 'الهويات' },
    { id: 'roles', labelEn: 'Roles', labelAr: 'الأدوار' },
    { id: 'policies', labelEn: 'Policies', labelAr: 'السياسات' },
    { id: 'network', labelEn: 'VPC', labelAr: 'الشبكة' },
    { id: 'secgroups', labelEn: 'SGs/NACLs', labelAr: 'جدران الحماية' },
    { id: 'storage', labelEn: 'Storage S3', labelAr: 'التخزين' },
    { id: 'secrets', labelEn: 'Secrets', labelAr: 'الأسرار' },
    { id: 'workload', labelEn: 'IMDS/SSRF', labelAr: 'بيانات التعريف' },
    { id: 'compute', labelEn: 'Compute', labelAr: 'الخوادم' },
    { id: 'logging', labelEn: 'CloudTrail', labelAr: 'السجلات' },
    { id: 'misconfigs', labelEn: 'CSPM Scan', labelAr: 'الفاحص' },
    { id: 'detection', labelEn: 'Detection', labelAr: 'الرصد' },
    { id: 'incident', labelEn: 'Incident', labelAr: 'الحوادث' },
    { id: 'architecture', labelEn: 'Architecture', labelAr: 'المعمارية' },
    { id: 'master', labelEn: 'Master Challenge', labelAr: 'التحدي الشامل' },
  ];

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
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isAr ? 'الخريطة' : 'Map'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs min-w-0">
            <Cloud className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-xs md:max-w-none">{isAr ? 'عالم أمن الحوسبة السحابية (Nexora Cloud)' : 'Cloud Security World (Nexora Cloud)'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-3xl text-[11px] no-scrollbar">
          {navTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
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

      {/* Main Lab Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderActiveLab()}
      </div>
    </div>
  );
};
