import React, { useState } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { Network, Split, Route, Layers, Server, Globe, Zap, ShieldCheck, Award, Binary, Cpu, ArrowLeft } from 'lucide-react';

import { ArpSimulation } from './ArpSimulation';
import { Ipv4Visualizer } from './Ipv4Visualizer';
import { SubnettingLab } from './SubnettingLab';
import { RoutingLab } from './RoutingLab';
import { SwitchingLab } from './SwitchingLab';
import { VlanLab } from './VlanLab';
import { DhcpSimulation } from './DhcpSimulation';
import { NatSimulation } from './NatSimulation';
import { UdpSimulation } from './UdpSimulation';
import { PortsServicesLab } from './PortsServicesLab';
import { IcsScadaLab } from './IcsScadaLab';
import { Telecommunications5gLab } from './Telecommunications5gLab';
import { AerospaceSatelliteLab } from './AerospaceSatelliteLab';
import { MaritimeSecurityLab } from './MaritimeSecurityLab';
import { AutomotiveCanLab } from './AutomotiveCanLab';
import { GnssSpoofingLab } from './GnssSpoofingLab';
import { DroneHijackMavlinkLab } from './DroneHijackMavlinkLab';
import { Telecom6gOranLab } from './Telecom6gOranLab';
import { SmartCityUrbanLab } from './SmartCityUrbanLab';
import { NexoraBranchMasterChallenge } from './NexoraBranchMasterChallenge';
import { Radio, Wifi, Satellite, Anchor, Car, Compass, Target, Building2 } from 'lucide-react';

import { TcpSimulation } from '../tcp/TcpSimulation';
import { DnsSimulation } from '../dns/DnsSimulation';
import { FirewallSimulation } from '../firewall/FirewallSimulation';
import { HttpSimulation } from '../http/HttpSimulation';
import { TlsSimulation } from '../tls/TlsSimulation';

type LabKey =
  | 'overview'
  | 'arp'
  | 'ipv4'
  | 'subnetting'
  | 'routing'
  | 'switching'
  | 'vlan'
  | 'dhcp'
  | 'nat'
  | 'udp'
  | 'ports_services'
  | 'tcp'
  | 'dns'
  | 'http'
  | 'tls'
  | 'firewall'
  | 'ics_scada'
  | 'telecom_5g'
  | 'satellite'
  | 'maritime'
  | 'automotive_can'
  | 'gnss_spoofing'
  | 'drone_hijack'
  | 'telecom_6g'
  | 'smart_city'
  | 'nexora_master';

export const NetworkingWorldMap: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [activeLab, setActiveLab] = useState<LabKey>('overview');

  const clusters = [
    {
      id: 'addressing',
      titleAr: '1. العناوين والنطاقات (Addressing)',
      titleEn: '1. Addressing & Boundaries',
      items: [
        { key: 'ipv4', nameAr: 'عناوين IPv4 الثنائية', nameEn: 'IPv4 Binary Visualizer', icon: Binary },
        { key: 'subnetting', nameAr: 'تقسيم الشبكات Subnetting', nameEn: 'Subnetting & VLSM Lab', icon: Split },
      ],
    },
    {
      id: 'lan',
      titleAr: '2. شبكات اللان والمبدلات (LAN & Switching)',
      titleEn: '2. LAN & Layer 2 Switching',
      items: [
        { key: 'arp', nameAr: 'بروتوكول ARP والعناوين', nameEn: 'ARP Resolution & Cache', icon: Network },
        { key: 'switching', nameAr: 'جدول المبدل CAM Table', nameEn: 'L2 Switch CAM Table Lab', icon: Cpu },
        { key: 'vlan', nameAr: 'شبكات VLAN والتوجيه', nameEn: 'VLAN Segmentation Lab', icon: Layers },
      ],
    },
    {
      id: 'routing',
      titleAr: '3. التوجيه والموجهات (Routing)',
      titleEn: '3. IP Routing & Forwarding',
      items: [{ key: 'routing', nameAr: 'توجيه الحزم وقرارات LPM', nameEn: 'Routing Tables & LPM Lab', icon: Route }],
    },
    {
      id: 'transport',
      titleAr: '4. بروتوكولات النقل (Transport Layer)',
      titleEn: '4. Transport Layer (TCP/UDP)',
      items: [
        { key: 'tcp', nameAr: 'مصافحة TCP الثلاثية', nameEn: 'TCP 3-Way Handshake', icon: Zap },
        { key: 'udp', nameAr: 'بروتوكول UDP ودفق البيانات', nameEn: 'UDP Datagram Flow', icon: Zap },
      ],
    },
    {
      id: 'services',
      titleAr: '5. الخدمات والتهيأة (Services & DNS)',
      titleEn: '5. Network Services & Ports',
      items: [
        { key: 'dhcp', nameAr: 'تأجير العناوين DHCP DORA', nameEn: 'DHCP DORA Lease Engine', icon: Server },
        { key: 'dns', nameAr: 'حل النطاقات DNS Resolution', nameEn: 'DNS Resolution Engine', icon: Globe },
        { key: 'ports_services', nameAr: 'المنافذ والخدمات Ports & Services', nameEn: 'Ports & Services Lab', icon: Server },
      ],
    },
    {
      id: 'webtraffic',
      titleAr: '6. حركة الويب والترجمة (Web & NAT)',
      titleEn: '6. Web Traffic & NAT Gateway',
      items: [
        { key: 'http', nameAr: 'دورة حياة HTTP Headers', nameEn: 'HTTP Request Lifecycle', icon: Globe },
        { key: 'tls', nameAr: 'مصافحة TLS المشفرة', nameEn: 'TLS 1.3 Encryption', icon: Globe },
        { key: 'nat', nameAr: 'ترجمة العناوين NAT / PAT', nameEn: 'NAT Gateway Engine', icon: Globe },
      ],
    },
    {
      id: 'security',
      titleAr: '7. أمن الشبكة والتحدي الرئيسي (Security & Master Challenge)',
      titleEn: '7. Perimeter Security & Master Challenge',
      items: [
        { key: 'firewall', nameAr: 'جدار الحماية وقواعد ACL', nameEn: 'Firewall ACL Engine', icon: ShieldCheck },
        { key: 'ics_scada', nameAr: 'أمن الشبكات الصناعية SCADA / ICS', nameEn: 'OT & SCADA Security Lab', icon: Radio },
        { key: 'telecom_5g', nameAr: 'أمن شبكات الاتصالات 5G Core', nameEn: '5G Core Telecom Security Lab', icon: Wifi },
        { key: 'satellite', nameAr: 'أمن الأقمار الصناعية والفضاء Aerospace', nameEn: 'Satellite & Aerospace Lab', icon: Satellite },
        { key: 'maritime', nameAr: 'أمن السفن والملاحة البحرية Maritime', nameEn: 'Maritime & Vessel Security Lab', icon: Anchor },
        { key: 'automotive_can', nameAr: 'أمن شبكات السيارات CAN Bus & V2X', nameEn: 'Automotive CAN & V2X Lab', icon: Car },
        { key: 'gnss_spoofing', nameAr: 'تزييف الملاحة الفضائية وحرب الترددات GNSS', nameEn: 'GNSS Satellite Spoofing & EW Lab', icon: Compass },
        { key: 'drone_hijack', nameAr: 'اختطاف الدرونز وحقن MAVLink', nameEn: 'Drone Hijacking & MAVLink Lab', icon: Target },
        { key: 'telecom_6g', nameAr: 'أمن شبكات 6G ومعمارية O-RAN', nameEn: '6G O-RAN Security Lab', icon: Network },
        { key: 'smart_city', nameAr: 'أمن المدن الذكية والبنية الحضرية', nameEn: 'Smart City & Urban Lab', icon: Building2 },
        { key: 'nexora_master', nameAr: 'التحدي الرئيسي: شبكة NEXORA', nameEn: 'NEXORA Master Challenge', icon: Award },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
            <Network className="w-5 h-5" />
            <span>{isAr ? 'عالم الشبكات والبنية التحتية' : 'Networking & Infrastructure World Map'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isAr ? 'خريطة كون الشبكات السيبرانية الكاملة (World 3)' : 'Complete Interactive Cybersecurity Networking Universe'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isAr
              ? 'استكشف كافة مفاهيم وتجارب ومختبرات الشبكات المترابطة: العناوين، اللان، التوجيه، بروتوكولات النقل، والتحدي الرئيسي.'
              : 'Explore interconnected networking concepts: Addressing, L2 Switching, Routing, TCP/UDP, Services, and the Master Challenge.'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveLab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeLab === 'overview'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {isAr ? 'الخريطة العامة' : 'World Overview Map'}
          </button>
          <button
            onClick={() => setActiveLab('nexora_master')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeLab === 'nexora_master'
                ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-900/40'
                : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-amber-900/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{isAr ? 'التحدي الرئيسي (NEXORA)' : 'Master Challenge'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeLab === 'overview' ? (
        <div className="space-y-8">
          {/* Clusters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clusters.map((c) => (
              <div key={c.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-cyan-300 border-b border-slate-800 pb-2">
                  {isAr ? c.titleAr : c.titleEn}
                </h3>

                <div className="space-y-2">
                  {c.items.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveLab(item.key as LabKey)}
                        className="w-full text-left rtl:text-right flex items-center justify-between p-3 rounded-xl bg-slate-950/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComp className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                          <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-200">
                            {isAr ? item.nameAr : item.nameEn}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isAr ? '← تشغيل' : 'Launch →'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setActiveLab('overview')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 w-fit transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{isAr ? 'العودة لخريطة الشبكات' : 'Back to Networking World Map'}</span>
          </button>

          {activeLab === 'arp' && <ArpSimulation />}
          {activeLab === 'ipv4' && <Ipv4Visualizer />}
          {activeLab === 'subnetting' && <SubnettingLab />}
          {activeLab === 'routing' && <RoutingLab />}
          {activeLab === 'switching' && <SwitchingLab />}
          {activeLab === 'vlan' && <VlanLab />}
          {activeLab === 'dhcp' && <DhcpSimulation />}
          {activeLab === 'nat' && <NatSimulation />}
          {activeLab === 'udp' && <UdpSimulation />}
          {activeLab === 'ports_services' && <PortsServicesLab />}
          {activeLab === 'tcp' && <TcpSimulation />}
          {activeLab === 'dns' && <DnsSimulation />}
          {activeLab === 'http' && <HttpSimulation />}
          {activeLab === 'tls' && <TlsSimulation />}
          {activeLab === 'firewall' && <FirewallSimulation />}
          {activeLab === 'ics_scada' && <IcsScadaLab language={language} />}
          {activeLab === 'telecom_5g' && <Telecommunications5gLab language={language} />}
          {activeLab === 'satellite' && <AerospaceSatelliteLab language={language} />}
          {activeLab === 'maritime' && <MaritimeSecurityLab language={language} />}
          {activeLab === 'automotive_can' && <AutomotiveCanLab language={language} />}
          {activeLab === 'gnss_spoofing' && <GnssSpoofingLab language={language} />}
          {activeLab === 'drone_hijack' && <DroneHijackMavlinkLab language={language} />}
          {activeLab === 'telecom_6g' && <Telecom6gOranLab language={language} />}
          {activeLab === 'smart_city' && <SmartCityUrbanLab language={language} />}
          {activeLab === 'nexora_master' && <NexoraBranchMasterChallenge />}
        </div>
      )}
    </div>
  );
};
