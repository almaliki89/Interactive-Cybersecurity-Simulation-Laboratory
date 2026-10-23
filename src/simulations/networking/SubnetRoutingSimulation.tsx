import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Network,
  Globe,
  Server,
  Sliders,
  Play,
  Radio,
} from 'lucide-react';

export const SubnetRoutingSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);

  // Subnetting State
  const [baseNetwork, setBaseNetwork] = useState('192.168.1.0');
  const [cidrPrefix, setCidrPrefix] = useState<number>(26); // /26 divides /24 into 4 subnets of 64
  const [natEnabled, setNatEnabled] = useState(true);

  // Packet Flow Simulation State
  const [packetState, setPacketState] = useState<'idle' | 'transmitting' | 'blocked' | 'success'>('idle');
  const [packetLog, setPacketLog] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<'pc' | 'router' | 'firewall' | 'server'>('pc');

  const totalIps = Math.pow(2, 32 - cidrPrefix);
  const usableHosts = Math.max(0, totalIps - 2);

  const challenge: Challenge = {
    id: 'subnet-routing-challenge',
    simulationId: 'subnet_routing',
    title: language === 'ar' ? 'تحدي تصميم الشبكات الفرعية وتفعيل NAT' : 'Subnet Design & NAT Gateway Challenge',
    difficulty: 'Beginner',
    category: language === 'ar' ? 'الشبكات وتوجيه الحزم' : 'Networking',
    mission:
      language === 'ar'
        ? 'قسم الشبكة إلى نطاقات فرعية بحجم /26 (62 مضيف صالح) وفعل بوابة NAT للاتصال الآمن بالإنترنت.'
        : 'Design a /26 subnet topology with 62 usable hosts per segment and enforce NAT gateway egress.',
    initialExplanation:
      language === 'ar'
        ? 'التقسيم الفرعي (Subnetting) يعزل الأجهزة ويقلل نطاق البث، بينما بوابة NAT تخفي عناوين IP الداخلية.'
        : 'Subnetting divides networks for isolation; NAT translates private IPs to a public IP on egress.',
    objectives: [
      {
        id: 'obj-cidr',
        title: language === 'ar' ? 'ضبط قناع الشبكة على /26' : 'Set Subnet Mask to /26',
        description: language === 'ar' ? 'تقسيم النطاق لتوفير 62 جهاز لكل شبكة فرعية' : 'Divide network into 4 subnets with 62 hosts each',
        isCompleted: cidrPrefix === 26,
        validationKey: 'cidr_ok',
      },
      {
        id: 'obj-nat',
        title: language === 'ar' ? 'تفعيل بوابة NAT' : 'Enable NAT Gateway',
        description: language === 'ar' ? 'ترجمة عناوين IP الخاصة عند الخروج للإنترنت' : 'Translate private addresses for WAN egress',
        isCompleted: natEnabled,
        validationKey: 'nat_ok',
      },
    ],
    hints: [
      language === 'ar' ? 'اختر البادئة /26 من القائمة المنسدلة وتأكد من تفعيل خيار NAT.' : 'Select prefix /26 and enable NAT toggle.',
    ],
  };

  const validateChallenge = () => {
    if (cidrPrefix === 26 && natEnabled) {
      return {
        success: true,
        message:
          language === 'ar'
            ? 'ممتاز! تم تصميم الشبكة الفرعية وبوابة NAT بنجاح!'
            : 'Subnet topology and NAT gateway verified successfully!',
      };
    }
    return {
      success: false,
      message: language === 'ar' ? 'تحقق من شروط التقسيم وبوابة NAT.' : 'Check CIDR and NAT requirements.',
    };
  };

  const handleTransmitPacket = () => {
    setPacketState('transmitting');
    setPacketLog([
      `[00:00.000] HOST_PC (192.168.1.10) -> Crafting TCP SYN (Port 443 -> Destination 93.184.216.34)`,
      `[00:00.015] ARP Table -> Resolving Gateway 192.168.1.1 (MAC 00:1A:2B:3C:4D:01)`,
    ]);

    setTimeout(() => {
      if (cidrPrefix > 26) {
        setPacketState('blocked');
        setPacketLog((prev) => [
          ...prev,
          `[00:00.040] ROUTER_HOP (192.168.1.1) -> DROPPED: Host IP 192.168.1.10 is outside subnet boundary /${cidrPrefix}`,
          `[ERROR] Destination unreachable: Subnet CIDR mask too narrow for current topology.`,
        ]);
        return;
      }

      setPacketLog((prev) => [
        ...prev,
        `[00:00.040] ROUTER_HOP (192.168.1.1) -> Forwarding packet to Firewall Egress Interface (203.0.113.1)`,
      ]);

      setTimeout(() => {
        if (!natEnabled) {
          setPacketState('blocked');
          setPacketLog((prev) => [
            ...prev,
            `[00:00.080] FIREWALL (203.0.113.1) -> DROPPED: Egress NAT is DISABLED. RFC 1918 Private IP (192.168.1.10) rejected by WAN router.`,
            `[HYPOTHESIS] Enable NAT Gateway to translate private internal IPs to public WAN IP 203.0.113.1.`,
          ]);
        } else {
          setPacketState('success');
          setPacketLog((prev) => [
            ...prev,
            `[00:00.080] NAT_TABLE -> Translated 192.168.1.10:54201 -> 203.0.113.1:50001`,
            `[00:00.120] WAN_SERVER (93.184.216.34:443) -> Received TCP SYN, responded TCP SYN-ACK`,
            `[00:00.150] SUCCESS: 3-Way Handshake Completed (HTTP 200 OK) via /${cidrPrefix} Subnet & NAT Gateway!`,
          ]);
        }
      }, 300);
    }, 300);
  };

  return (
    <Workspace
      title={language === 'ar' ? 'محاكي تقسيم الشبكات الفرعية (CIDR) وتوجيه الحزم وبوابة NAT' : 'Subnet Designer, Routing Tables & NAT Gateway Simulator'}
      subtitle={language === 'ar' ? 'حساب نطاقات العناوين، جداول التوجيه، وترجمة العناوين العامة والخاصة' : 'Subnet Boundaries, Routing Hops & Egress NAT Table'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold uppercase font-mono">
              {language === 'ar' ? 'قناع البادئة CIDR:' : 'CIDR Mask:'}
            </span>
            <select
              value={cidrPrefix}
              onChange={(e) => {
                setCidrPrefix(Number(e.target.value));
                setPacketState('idle');
              }}
              className="bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded px-2.5 py-1 focus:outline-hidden"
            >
              <option value={24}>/24 (254 Hosts · 255.255.255.0)</option>
              <option value={25}>/25 (126 Hosts · 255.255.255.128)</option>
              <option value={26}>/26 (62 Hosts · 255.255.255.192)</option>
              <option value={27}>/27 (30 Hosts · 255.255.255.224)</option>
              <option value={28}>/28 (14 Hosts · 255.255.255.240)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={natEnabled}
                onChange={(e) => {
                  setNatEnabled(e.target.checked);
                  setPacketState('idle');
                }}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'بوابة NAT مفعلة' : 'NAT Gateway Enabled'}</span>
            </label>

            <button
              onClick={handleTransmitPacket}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'ar' ? 'اختبار إرسال حزمة بيانات' : 'Transmit Packet Test'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none space-y-6">
        {/* Subnet Calculator Summary */}
        <div className="max-w-4xl w-full p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {language === 'ar' ? 'النطاق الأساسي' : 'Base Network'}
            </span>
            <span className="text-sm font-bold text-white font-mono">{baseNetwork}/{cidrPrefix}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {language === 'ar' ? 'إجمالي العناوين' : 'Total IPs'}
            </span>
            <span className="text-sm font-bold text-cyan-400 font-mono">{totalIps}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {language === 'ar' ? 'الأجهزة الصالحة' : 'Usable Hosts'}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{usableHosts}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {language === 'ar' ? 'حالة بوابة NAT' : 'NAT Egress'}
            </span>
            <span className={`text-sm font-bold font-mono ${natEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
              {natEnabled ? 'ACTIVE (203.0.113.1)' : 'DISABLED'}
            </span>
          </div>
        </div>

        {/* Interactive Topology Hops */}
        <div className="max-w-4xl w-full p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span>{language === 'ar' ? 'مسار القفزات وفحص أجهزة الشبكة' : 'Interactive Topology Hops & Inspection'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { id: 'pc', label: 'Host PC', ip: '192.168.1.10', icon: Server },
              { id: 'router', label: 'L3 Router', ip: '192.168.1.1', icon: Radio },
              { id: 'firewall', label: 'NAT Firewall', ip: '203.0.113.1', icon: Sliders },
              { id: 'server', label: 'WAN Web Server', ip: '93.184.216.34', icon: Globe },
            ].map((node) => {
              const NodeIcon = node.icon;
              const isSelected = selectedDevice === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedDevice(node.id as any)}
                  className={`p-3.5 rounded-xl border text-left rtl:text-right transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <NodeIcon className="w-5 h-5 text-cyan-400 mb-2" />
                  <span className="text-xs font-bold block text-white">{node.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">{node.ip}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-Time Diagnostic Packet Stream */}
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">
              {language === 'ar' ? 'سجل تشخيص حزم البيانات الحية' : 'Live Packet Diagnostic Stream'}
            </span>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] h-40 overflow-y-auto space-y-1.5 custom-scrollbar">
              {packetLog.length === 0 ? (
                <span className="text-slate-500 italic">
                  {language === 'ar' ? 'اضغط "اختبار إرسال حزمة بيانات" لتشغيل التتبع الحقيقي...' : 'Click "Transmit Packet Test" to observe live hop routing...'}
                </span>
              ) : (
                packetLog.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes('SUCCESS')
                        ? 'text-emerald-400 font-bold'
                        : log.includes('DROPPED') || log.includes('ERROR')
                        ? 'text-rose-400 font-bold'
                        : 'text-cyan-300'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">
              {language === 'ar' ? 'جدول ترجمة عناوين NAT الحية' : 'Stateful NAT Translation Table'}
            </span>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 h-40 overflow-x-auto">
              {natEnabled
                ? `[NAT SESSION ACTIVE]
[NAT] 192.168.1.10:54201 <-> 203.0.113.1:50001 <-> 93.184.216.34:443
[NAT] 192.168.1.22:49152 <-> 203.0.113.1:50002 <-> 8.8.8.8:53`
                : '[NAT DISABLED]\nPrivate IP addresses (192.168.1.0/26) are rejected on public WAN egress interfaces.'}
            </pre>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
