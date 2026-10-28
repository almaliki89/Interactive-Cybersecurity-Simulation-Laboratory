/**
 * OMEGA V14 — Containers & Kubernetes Security World
 * ContainerSimulation.tsx
 *
 * Primary router component for World 20 (Containers & Kubernetes Security).
 * Dispatches between ContainerWorldMap and the 16 interactive specialized labs.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { ContainerWorldMap } from './ContainerWorldMap';
import { NamespaceIsolationLab } from './NamespaceIsolationLab';
import { CgroupsResourceLab } from './CgroupsResourceLab';
import { CapabilitiesLab } from './CapabilitiesLab';
import { ImageSecurityLab } from './ImageSecurityLab';
import { ContainerEscapeLab } from './ContainerEscapeLab';
import { ControlPlaneAuditLab } from './ControlPlaneAuditLab';
import { K8sRbacLab } from './K8sRbacLab';
import { PodSecurityLab } from './PodSecurityLab';
import { NetworkPolicyLab } from './NetworkPolicyLab';
import { K8sSecretsLab } from './K8sSecretsLab';
import { AdmissionControllerLab } from './AdmissionControllerLab';
import { RuntimeFalcoLab } from './RuntimeFalcoLab';
import { ServiceMeshMtlsLab } from './ServiceMeshMtlsLab';
import { K8sIncidentLab } from './K8sIncidentLab';
import { ContainerArchitectureLab } from './ContainerArchitectureLab';
import { ContainerMasterChallenge } from './ContainerMasterChallenge';
import { MicrovmIsolationLab } from './MicrovmIsolationLab';
import { Boxes, ArrowLeft } from 'lucide-react';

export const ContainerSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<string>('map');

  const renderActiveLab = () => {
    switch (activeTab) {
      case 'namespaces':
        return <NamespaceIsolationLab />;
      case 'cgroups':
        return <CgroupsResourceLab />;
      case 'capabilities':
        return <CapabilitiesLab />;
      case 'images':
        return <ImageSecurityLab />;
      case 'escape':
        return <ContainerEscapeLab />;
      case 'controlplane':
        return <ControlPlaneAuditLab />;
      case 'rbac':
        return <K8sRbacLab />;
      case 'podsecurity':
        return <PodSecurityLab />;
      case 'networkpolicy':
        return <NetworkPolicyLab />;
      case 'secrets':
        return <K8sSecretsLab />;
      case 'admission':
        return <AdmissionControllerLab />;
      case 'falco':
        return <RuntimeFalcoLab />;
      case 'servicemesh':
        return <ServiceMeshMtlsLab />;
      case 'incident':
        return <K8sIncidentLab />;
      case 'microvm':
        return <MicrovmIsolationLab language={language} />;
      case 'architecture':
        return <ContainerArchitectureLab />;
      case 'master':
        return <ContainerMasterChallenge />;
      case 'map':
      default:
        return <ContainerWorldMap onSelectLab={(labId) => setActiveTab(labId)} />;
    }
  };

  const navTabs = [
    { id: 'map', labelEn: 'Map Hub', labelAr: 'الخريطة' },
    { id: 'namespaces', labelEn: 'Namespaces', labelAr: 'المساحات' },
    { id: 'cgroups', labelEn: 'Cgroups', labelAr: 'الموارد' },
    { id: 'capabilities', labelEn: 'Capabilities', labelAr: 'الصلاحيات' },
    { id: 'images', labelEn: 'Images & CVEs', labelAr: 'الصور' },
    { id: 'escape', labelEn: 'Escape', labelAr: 'الهروب' },
    { id: 'microvm', labelEn: 'MicroVM / Kata', labelAr: 'عزل MicroVM' },
    { id: 'controlplane', labelEn: 'Control Plane', labelAr: 'التحكم' },
    { id: 'rbac', labelEn: 'RBAC', labelAr: 'الصلاحيات' },
    { id: 'podsecurity', labelEn: 'Pod Security', labelAr: 'أمان الحزم' },
    { id: 'networkpolicy', labelEn: 'NetworkPolicy', labelAr: 'الشبكة' },
    { id: 'secrets', labelEn: 'Secrets', labelAr: 'الأسرار' },
    { id: 'admission', labelEn: 'Admission', labelAr: 'القبول' },
    { id: 'falco', labelEn: 'Falco eBPF', labelAr: 'الرصد' },
    { id: 'servicemesh', labelEn: 'Service Mesh', labelAr: 'الخدمات' },
    { id: 'incident', labelEn: 'Incident', labelAr: 'الحوادث' },
    { id: 'architecture', labelEn: 'Architecture', labelAr: 'المعمارية' },
    { id: 'master', labelEn: 'Master Challenge', labelAr: 'التحدي الشامل' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden select-none">
      {/* Top Header Nav */}
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

          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs min-w-0">
            <Boxes className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-xs md:max-w-none">{isAr ? 'عالم أمن الحاويات وكوبرنيتيس (Nexora K8s)' : 'Container & Kubernetes Security World'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-3xl text-[11px] no-scrollbar">
          {navTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
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
