import React from 'react';
import { SimulationId } from '../stores/simulationStore';

// Main Views (Lazy Loaded)
const InteractiveEnterpriseHero = React.lazy(() =>
  import('../components/landing/InteractiveEnterpriseHero').then((m) => ({ default: m.InteractiveEnterpriseHero }))
);
const UniverseExplorer = React.lazy(() =>
  import('../components/universe/UniverseExplorer').then((m) => ({ default: m.UniverseExplorer }))
);
const GlobalKnowledgeGraph = React.lazy(() =>
  import('../components/universe/GlobalKnowledgeGraph').then((m) => ({ default: m.GlobalKnowledgeGraph }))
);
const CyberRange = React.lazy(() =>
  import('../components/range/CyberRange').then((m) => ({ default: m.CyberRange }))
);
const GlossaryView = React.lazy(() =>
  import('../components/glossary/GlossaryView').then((m) => ({ default: m.GlossaryView }))
);
const LearningPathsView = React.lazy(() =>
  import('../components/paths/LearningPathsView').then((m) => ({ default: m.LearningPathsView }))
);

// Interactive Simulation Labs (Lazy Loaded)
const CiaTriadSimulation = React.lazy(() =>
  import('./foundations/CiaTriadSimulation').then((m) => ({ default: m.CiaTriadSimulation }))
);
const SystemInternalsSimulation = React.lazy(() =>
  import('./internals/SystemInternalsSimulation').then((m) => ({ default: m.SystemInternalsSimulation }))
);
const SubnetRoutingSimulation = React.lazy(() =>
  import('./networking/SubnetRoutingSimulation').then((m) => ({ default: m.SubnetRoutingSimulation }))
);
const ActiveDirectorySimulation = React.lazy(() =>
  import('./identity/ActiveDirectorySimulation').then((m) => ({ default: m.ActiveDirectorySimulation }))
);
const AppSecSimulation = React.lazy(() =>
  import('./appsec/AppSecSimulation').then((m) => ({ default: m.AppSecSimulation }))
);
const CloudContainerSimulation = React.lazy(() =>
  import('./cloud/CloudContainerSimulation').then((m) => ({ default: m.CloudContainerSimulation }))
);
const ThreatHuntingSimulation = React.lazy(() =>
  import('./threat/ThreatHuntingSimulation').then((m) => ({ default: m.ThreatHuntingSimulation }))
);
const ZeroTrustSimulation = React.lazy(() =>
  import('./architecture/ZeroTrustSimulation').then((m) => ({ default: m.ZeroTrustSimulation }))
);
const TcpSimulation = React.lazy(() =>
  import('./tcp/TcpSimulation').then((m) => ({ default: m.TcpSimulation }))
);
const DnsSimulation = React.lazy(() =>
  import('./dns/DnsSimulation').then((m) => ({ default: m.DnsSimulation }))
);
const FirewallSimulation = React.lazy(() =>
  import('./firewall/FirewallSimulation').then((m) => ({ default: m.FirewallSimulation }))
);
const HttpSimulation = React.lazy(() =>
  import('./http/HttpSimulation').then((m) => ({ default: m.HttpSimulation }))
);
const TlsSimulation = React.lazy(() =>
  import('./tls/TlsSimulation').then((m) => ({ default: m.TlsSimulation }))
);
const LinuxSimulation = React.lazy(() =>
  import('./linux/LinuxSimulation').then((m) => ({ default: m.LinuxSimulation }))
);
const WindowsSimulation = React.lazy(() =>
  import('./windows/WindowsSimulation').then((m) => ({ default: m.WindowsSimulation }))
);
const CryptoSimulation = React.lazy(() =>
  import('./crypto/CryptoSimulation').then((m) => ({ default: m.CryptoSimulation }))
);
const SocSimulation = React.lazy(() =>
  import('./soc/SocSimulation').then((m) => ({ default: m.SocSimulation }))
);
const ForensicsSimulation = React.lazy(() =>
  import('./forensics/ForensicsSimulation').then((m) => ({ default: m.ForensicsSimulation }))
);

const NetworkingWorldMap = React.lazy(() =>
  import('./networking/NetworkingWorldMap').then((m) => ({ default: m.NetworkingWorldMap }))
);
const ArpSimulation = React.lazy(() =>
  import('./networking/ArpSimulation').then((m) => ({ default: m.ArpSimulation }))
);
const Ipv4Visualizer = React.lazy(() =>
  import('./networking/Ipv4Visualizer').then((m) => ({ default: m.Ipv4Visualizer }))
);
const SubnettingLab = React.lazy(() =>
  import('./networking/SubnettingLab').then((m) => ({ default: m.SubnettingLab }))
);
const RoutingLab = React.lazy(() =>
  import('./networking/RoutingLab').then((m) => ({ default: m.RoutingLab }))
);
const SwitchingLab = React.lazy(() =>
  import('./networking/SwitchingLab').then((m) => ({ default: m.SwitchingLab }))
);
const VlanLab = React.lazy(() =>
  import('./networking/VlanLab').then((m) => ({ default: m.VlanLab }))
);
const DhcpSimulation = React.lazy(() =>
  import('./networking/DhcpSimulation').then((m) => ({ default: m.DhcpSimulation }))
);
const NatSimulation = React.lazy(() =>
  import('./networking/NatSimulation').then((m) => ({ default: m.NatSimulation }))
);
const UdpSimulation = React.lazy(() =>
  import('./networking/UdpSimulation').then((m) => ({ default: m.UdpSimulation }))
);
const PortsServicesLab = React.lazy(() =>
  import('./networking/PortsServicesLab').then((m) => ({ default: m.PortsServicesLab }))
);
const NexoraBranchMasterChallenge = React.lazy(() =>
  import('./networking/NexoraBranchMasterChallenge').then((m) => ({ default: m.NexoraBranchMasterChallenge }))
);

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
  windows: {
    id: 'windows',
    nameAr: 'أمن أنظمة ويندوز وهيكل الصلاحيات',
    nameEn: 'Windows Security & Tokens',
    domain: 'infrastructure',
    component: WindowsSimulation,
    worldId: 6,
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
    nameAr: 'أمن تطبيقات الويب (AppSec World)',
    nameEn: 'Web & Application Security',
    domain: 'appsec',
    component: AppSecSimulation,
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
    nameEn: 'SOC, SIEM & Detection Engineering',
    domain: 'secops',
    component: SocSimulation,
    worldId: 24,
    category: 'lab',
  },
  soc: {
    id: 'soc',
    nameAr: 'مركز العمليات SOC وهندسة الكشف',
    nameEn: 'SOC, SIEM & Detection Engineering',
    domain: 'secops',
    component: SocSimulation,
    worldId: 24,
    category: 'lab',
  },
  forensics: {
    id: 'forensics',
    nameAr: 'التحقيق الجنائي الرقمي والاستجابة للحوادث',
    nameEn: 'Incident Response & Digital Forensics',
    domain: 'investigation',
    component: ForensicsSimulation,
    worldId: 28,
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

  // Networking Universe Expansions
  networking_map: {
    id: 'networking_map',
    nameAr: 'خريطة عالم الشبكات الشاملة (World 3)',
    nameEn: 'Networking Universe Map Hub',
    domain: 'infrastructure',
    component: NetworkingWorldMap,
    worldId: 3,
    category: 'lab',
  },
  arp: {
    id: 'arp',
    nameAr: 'بروتوكول ربط العناوين ARP',
    nameEn: 'ARP Resolution & Cache Lab',
    domain: 'infrastructure',
    component: ArpSimulation,
    worldId: 3,
    category: 'lab',
  },
  ipv4: {
    id: 'ipv4',
    nameAr: 'المصور التفاعلي لـ IPv4',
    nameEn: 'IPv4 Binary & Subnet Inspector',
    domain: 'infrastructure',
    component: Ipv4Visualizer,
    worldId: 3,
    category: 'lab',
  },
  subnetting: {
    id: 'subnetting',
    nameAr: 'مختبر تقسيم الشبكات Subnetting',
    nameEn: 'Subnetting & VLSM Lab',
    domain: 'infrastructure',
    component: SubnettingLab,
    worldId: 3,
    category: 'lab',
  },
  routing: {
    id: 'routing',
    nameAr: 'مختبر توجيه الحزم والجداول',
    nameEn: 'Routing Tables & LPM Lab',
    domain: 'infrastructure',
    component: RoutingLab,
    worldId: 3,
    category: 'lab',
  },
  switching: {
    id: 'switching',
    nameAr: 'مختبر المبدلات وجدول CAM',
    nameEn: 'Layer 2 Switch CAM Table Lab',
    domain: 'infrastructure',
    component: SwitchingLab,
    worldId: 3,
    category: 'lab',
  },
  vlan: {
    id: 'vlan',
    nameAr: 'مختبر عزل شبكات VLAN',
    nameEn: 'VLAN Segmentation & Trunking Lab',
    domain: 'infrastructure',
    component: VlanLab,
    worldId: 3,
    category: 'lab',
  },
  dhcp: {
    id: 'dhcp',
    nameAr: 'مختبر بروتوكول DHCP DORA',
    nameEn: 'DHCP DORA Lease Engine',
    domain: 'infrastructure',
    component: DhcpSimulation,
    worldId: 3,
    category: 'lab',
  },
  nat: {
    id: 'nat',
    nameAr: 'محاكي ترجمة العناوين NAT',
    nameEn: 'NAT Gateway & PAT Engine',
    domain: 'infrastructure',
    component: NatSimulation,
    worldId: 3,
    category: 'lab',
  },
  udp: {
    id: 'udp',
    nameAr: 'محاكي بروتوكول UDP',
    nameEn: 'UDP Connectionless Datagram Lab',
    domain: 'infrastructure',
    component: UdpSimulation,
    worldId: 3,
    category: 'lab',
  },
  ports_services: {
    id: 'ports_services',
    nameAr: 'مختبر المنافذ والخدمات',
    nameEn: 'Ports & Socket Binding Lab',
    domain: 'infrastructure',
    component: PortsServicesLab,
    worldId: 3,
    category: 'lab',
  },
  nexora_master: {
    id: 'nexora_master',
    nameAr: 'التحدي الرئيسي: شبكة NEXORA Branch',
    nameEn: 'NEXORA Branch Master Challenge',
    domain: 'infrastructure',
    component: NexoraBranchMasterChallenge,
    worldId: 3,
    category: 'lab',
  },
};

export const getRegisteredSimulation = (id: SimulationId): SimulationRegistration => {
  return simulationRegistry[id] || simulationRegistry.landing;
};
