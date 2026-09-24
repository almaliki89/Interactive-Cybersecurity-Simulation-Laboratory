import React from 'react';
import { SimulationId } from '../stores/simulationStore';

// Main Views
import { InteractiveEnterpriseHero } from '../components/landing/InteractiveEnterpriseHero';
import { UniverseExplorer } from '../components/universe/UniverseExplorer';
import { GlobalKnowledgeGraph } from '../components/universe/GlobalKnowledgeGraph';
import { CyberRange } from '../components/range/CyberRange';
import { GlossaryView } from '../components/glossary/GlossaryView';
import { LearningPathsView } from '../components/paths/LearningPathsView';

// Interactive Simulation Labs
import { CiaTriadSimulation } from './foundations/CiaTriadSimulation';
import { SystemInternalsSimulation } from './internals/SystemInternalsSimulation';
import { SubnetRoutingSimulation } from './networking/SubnetRoutingSimulation';
import { ActiveDirectorySimulation } from './identity/ActiveDirectorySimulation';
import { AppSecApiSimulation } from './appsec/AppSecApiSimulation';
import { CloudContainerSimulation } from './cloud/CloudContainerSimulation';
import { ThreatHuntingSimulation } from './threat/ThreatHuntingSimulation';
import { ZeroTrustSimulation } from './architecture/ZeroTrustSimulation';
import { TcpSimulation } from './tcp/TcpSimulation';
import { DnsSimulation } from './dns/DnsSimulation';
import { FirewallSimulation } from './firewall/FirewallSimulation';
import { HttpSimulation } from './http/HttpSimulation';
import { TlsSimulation } from './tls/TlsSimulation';
import { LinuxSimulation } from './linux/LinuxSimulation';
import { CryptoSimulation } from './crypto/CryptoSimulation';
import { SiemSimulation } from './siem/SiemSimulation';

export interface SimulationRegistration {
  id: SimulationId;
  nameAr: string;
  nameEn: string;
  domain: string;
  component: React.ComponentType<any>;
  worldId?: number;
  category?: 'core' | 'view' | 'lab';
}

export const simulationRegistry: Record<SimulationId, SimulationRegistration> = {
  landing: {
    id: 'landing',
    nameAr: 'الرئيسية والمؤسسة الحية',
    nameEn: 'Living Digital Mesh',
    domain: 'overview',
    component: InteractiveEnterpriseHero,
    category: 'view',
  },
  explorer: {
    id: 'explorer',
    nameAr: 'مستكشف الكون السيبراني (60 عالماً)',
    nameEn: 'Cyber Universe Map',
    domain: 'universe',
    component: UniverseExplorer,
    category: 'view',
  },
  knowledge: {
    id: 'knowledge',
    nameAr: 'شبكة المعرفة السيبرانية',
    nameEn: 'Knowledge Graph',
    domain: 'knowledge',
    component: GlobalKnowledgeGraph,
    category: 'view',
  },
  range: {
    id: 'range',
    nameAr: 'الميدان السيبراني الشامل (World 60)',
    nameEn: 'Enterprise Cyber Range',
    domain: 'range',
    component: CyberRange,
    worldId: 60,
    category: 'view',
  },
  glossary: {
    id: 'glossary',
    nameAr: 'معجم المصطلحات السيبرانية',
    nameEn: 'Cyber Glossary',
    domain: 'glossary',
    component: GlossaryView,
    category: 'view',
  },
  paths: {
    id: 'paths',
    nameAr: 'مسارات التعلم والتخصص',
    nameEn: 'Learning Paths',
    domain: 'paths',
    component: LearningPathsView,
    category: 'view',
  },

  // Interactive Labs
  cia_triad: {
    id: 'cia_triad',
    nameAr: 'ثالوث CIA وحساب المخاطر',
    nameEn: 'CIA Triad & Risk Lab',
    domain: 'foundations',
    component: CiaTriadSimulation,
    worldId: 1,
    category: 'lab',
  },
  system_internals: {
    id: 'system_internals',
    nameAr: 'عمارة الحاسوب والذاكرة',
    nameEn: 'OS Internals & ASLR',
    domain: 'foundations',
    component: SystemInternalsSimulation,
    worldId: 2,
    category: 'lab',
  },
  subnet_routing: {
    id: 'subnet_routing',
    nameAr: 'تقسيم الشبكات Subnetting والتوجيه',
    nameEn: 'Subnetting & Routing Lab',
    domain: 'infrastructure',
    component: SubnetRoutingSimulation,
    worldId: 3,
    category: 'lab',
  },
  tcp: {
    id: 'tcp',
    nameAr: 'المصافحة الثلاثية TCP Handshake',
    nameEn: 'TCP 3-Way Handshake',
    domain: 'infrastructure',
    component: TcpSimulation,
    worldId: 3,
    category: 'lab',
  },
  dns: {
    id: 'dns',
    nameAr: 'نظام أسماء النطاقات DNS & DNSSEC',
    nameEn: 'DNS & DNSSEC Resolution',
    domain: 'infrastructure',
    component: DnsSimulation,
    worldId: 42,
    category: 'lab',
  },
  firewall: {
    id: 'firewall',
    nameAr: 'جدار الحماية وقواعد ACL',
    nameEn: 'Firewall ACL Engine',
    domain: 'infrastructure',
    component: FirewallSimulation,
    worldId: 4,
    category: 'lab',
  },
  linux: {
    id: 'linux',
    nameAr: 'صلاحيات لينكس ونموذج DAC',
    nameEn: 'Linux Permissions & DAC',
    domain: 'infrastructure',
    component: LinuxSimulation,
    worldId: 5,
    category: 'lab',
  },
  active_directory: {
    id: 'active_directory',
    nameAr: 'Active Directory ومصادقة Kerberos',
    nameEn: 'Active Directory & Kerberos',
    domain: 'identity',
    component: ActiveDirectorySimulation,
    worldId: 7,
    category: 'lab',
  },
  http: {
    id: 'http',
    nameAr: 'دورة حياة طلب واستجابة HTTP',
    nameEn: 'HTTP Lifecycle & Headers',
    domain: 'appsec',
    component: HttpSimulation,
    worldId: 8,
    category: 'lab',
  },
  appsec_api: {
    id: 'appsec_api',
    nameAr: 'أمن الويب OWASP وبوابات API',
    nameEn: 'Web AppSec & API Security',
    domain: 'appsec',
    component: AppSecApiSimulation,
    worldId: 9,
    category: 'lab',
  },
  crypto: {
    id: 'crypto',
    nameAr: 'دوال التجزئة وأثر الانهيار الجليدي',
    nameEn: 'Hashing & Avalanche Effect',
    domain: 'crypto',
    component: CryptoSimulation,
    worldId: 15,
    category: 'lab',
  },
  tls: {
    id: 'tls',
    nameAr: 'مصافحة TLS 1.3 وسلسلة الثقة PKI',
    nameEn: 'TLS 1.3 Handshake & PKI',
    domain: 'crypto',
    component: TlsSimulation,
    worldId: 39,
    category: 'lab',
  },
  cloud_containers: {
    id: 'cloud_containers',
    nameAr: 'أمن الحاويات وسحابة Kubernetes',
    nameEn: 'Cloud & Container Isolation',
    domain: 'cloud',
    component: CloudContainerSimulation,
    worldId: 18,
    category: 'lab',
  },
  siem: {
    id: 'siem',
    nameAr: 'مركز العمليات SOC ومحرك SIEM',
    nameEn: 'SOC & SIEM Correlation',
    domain: 'secops',
    component: SiemSimulation,
    worldId: 24,
    category: 'lab',
  },
  threat_hunting: {
    id: 'threat_hunting',
    nameAr: 'أمن الأجهزة EDR والتحقيق الجنائي',
    nameEn: 'EDR Telemetry & Threat Hunting',
    domain: 'investigation',
    component: ThreatHuntingSimulation,
    worldId: 28,
    category: 'lab',
  },
  zero_trust: {
    id: 'zero_trust',
    nameAr: 'معمارية انعدام الثقة Zero Trust',
    nameEn: 'Zero Trust Policy Engine',
    domain: 'engineering',
    component: ZeroTrustSimulation,
    worldId: 38,
    category: 'lab',
  },
};

export const getRegisteredSimulation = (id: SimulationId): SimulationRegistration => {
  return simulationRegistry[id] || simulationRegistry.landing;
};
