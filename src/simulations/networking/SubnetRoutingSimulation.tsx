import React, { useState, useEffect } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import {
  Network,
  Globe,
  Server,
  Sliders,
  Play,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Zap,
  Info,
  RotateCcw,
} from 'lucide-react';

import {
  isSameSubnet,
  evaluatePacketTransmission,
  PacketTransmissionResult,
  calculateSubnetDetails,
} from '../../utils/networkUtils';

export const SubnetRoutingSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  // Subnetting State
  const [baseNetwork] = useState('192.168.1.0');
  const [cidrPrefix, setCidrPrefix] = useState<number>(26); // /26 divides /24 into 4 subnets of 64
  const [natEnabled, setNatEnabled] = useState(true);

  // Advanced Network Laboratory Parameters
  const [hostIp, setHostIp] = useState('192.168.1.42');
  const [gatewayIp, setGatewayIp] = useState('192.168.1.1');
  const [wanServerIp] = useState('93.184.216.34');
  const [destPort, setDestPort] = useState<number>(443);
  const [protocol, setProtocol] = useState<'TCP' | 'UDP' | 'ICMP'>('TCP');
  const [firewallPolicy, setFirewallPolicy] = useState<'allow_all' | 'strict_https' | 'block_http' | 'drop_all'>('allow_all');

  // Simulation Execution State
  const [transmissionResult, setTransmissionResult] = useState<PacketTransmissionResult | null>(null);
  const [packetState, setPacketState] = useState<'idle' | 'transmitting' | 'blocked' | 'success'>('idle');
  const [packetLog, setPacketLog] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<'pc' | 'router' | 'firewall' | 'server'>('pc');

  const subnetDetails = calculateSubnetDetails(baseNetwork, cidrPrefix);
  const totalIps = subnetDetails?.totalIps || Math.pow(2, 32 - cidrPrefix);
  const usableHosts = subnetDetails?.usableHosts || Math.max(0, totalIps - 2);

  // Authoritative Challenge Validator Registration
  useEffect(() => {
    registerChallengeValidator('subnet-routing-challenge', () => {
      const isSubnet26 = cidrPrefix === 26;
      const isNatActive = natEnabled;
      const sameSubnet = isSameSubnet(hostIp, gatewayIp, cidrPrefix);
      const isFirewallPermissive = firewallPolicy === 'allow_all' || firewallPolicy === 'strict_https';
      
      const success = isSubnet26 && isNatActive && sameSubnet && isFirewallPermissive;
      const score = (isSubnet26 ? 25 : 0) + (isNatActive ? 25 : 0) + (sameSubnet ? 25 : 0) + (isFirewallPermissive ? 25 : 0);

      return {
        success,
        score,
        details: {
          cidrValid: isSubnet26,
          natValid: isNatActive,
          sameSubnet,
          firewallValid: isFirewallPermissive,
        },
      };
    });

    return () => {
      unregisterChallengeValidator('subnet-routing-challenge');
    };
  }, [cidrPrefix, natEnabled, hostIp, gatewayIp, firewallPolicy]);

  const challenge: Challenge = {
    id: 'subnet-routing-challenge',
    simulationId: 'subnet_routing',
    title: isAr ? 'تحدي تصميم الشبكات الفرعية وتفعيل NAT' : 'Subnet Design & NAT Gateway Challenge',
    difficulty: 'Beginner',
    category: isAr ? 'الشبكات وتوجيه الحزم' : 'Networking',
    mission:
      isAr
        ? 'قسم الشبكة إلى نطاقات فرعية بحجم /26 (62 مضيف صالح)، واضبط البوابة ضمن نفس النطاق، وفعل بوابة NAT مع سياسة جدار حماية تسمح بمرور حركة المرور.'
        : 'Design a /26 subnet topology with 62 usable hosts per segment, bind gateway inside host subnet, and enforce NAT gateway egress.',
    initialExplanation:
      isAr
        ? 'التقسيم الفرعي (Subnetting) يعزل الأجهزة ويقلل نطاق البث، بينما بوابة NAT تخفي عناوين IP الداخلية عند خروجها إلى الإنترنت.'
        : 'Subnetting divides networks for isolation; NAT translates private IPs to a public IP on egress.',
    objectives: [
      {
        id: 'obj-cidr',
        title: isAr ? 'ضبط قناع الشبكة على /26' : 'Set Subnet Mask to /26',
        description: isAr ? 'تقسيم النطاق لتوفير 62 جهاز لكل شبكة فرعية' : 'Divide network into 4 subnets with 62 hosts each',
        isCompleted: cidrPrefix === 26,
        validationKey: 'cidr_ok',
      },
      {
        id: 'obj-subnet-match',
        title: isAr ? 'تواجد المضيف والبوابة في نفس الشبكة الفرعية' : 'Host & Gateway in Same Subnet',
        description: isAr ? 'ضبط المضيف والبوابة ضمن حدود القناع /26' : 'Ensure host IP and Gateway IP belong to same /26 subnet',
        isCompleted: isSameSubnet(hostIp, gatewayIp, cidrPrefix),
        validationKey: 'same_subnet_ok',
      },
      {
        id: 'obj-nat',
        title: isAr ? 'تفعيل بوابة NAT' : 'Enable NAT Gateway',
        description: isAr ? 'ترجمة عناوين IP الخاصة عند الخروج للإنترنت' : 'Translate private addresses for WAN egress',
        isCompleted: natEnabled,
        validationKey: 'nat_ok',
      },
    ],
    hints: [
      isAr ? 'اختر البادئة /26، واضبط المضيف (192.168.1.42) والبوابة (192.168.1.1) ضمن نفس الفرع، وفعل خيار NAT.' : 'Select prefix /26, align host and gateway in same subnet, and enable NAT toggle.',
    ],
  };

  const validateChallenge = () => {
    const isSubnet26 = cidrPrefix === 26;
    const isNatActive = natEnabled;
    const sameSubnet = isSameSubnet(hostIp, gatewayIp, cidrPrefix);

    if (isSubnet26 && isNatActive && sameSubnet) {
      return {
        success: true,
        message:
          isAr
            ? 'ممتاز! تم تصميم الشبكة الفرعية وبوابة NAT والتحقق من القفزات بنجاح!'
            : 'Subnet topology, routing hops, and NAT gateway verified successfully!',
      };
    }
    return {
      success: false,
      message: isAr ? 'تحقق من شروط التقسيم الفرعي /26، وتواجد المضيف والبوابة في نفس الشبكة، وتفعيل NAT.' : 'Check /26 CIDR, host-gateway subnet alignment, and NAT status.',
    };
  };

  const handleTransmitPacket = () => {
    setPacketState('transmitting');
    const result = evaluatePacketTransmission({
      hostIp,
      gatewayIp,
      cidrPrefix,
      natEnabled,
      wanServerIp,
      destPort,
      protocol,
      firewallPolicy,
    });

    setTransmissionResult(result);
    setPacketLog(result.initialLogs);

    setTimeout(() => {
      if (result.status === 'subnet_mismatch' || result.status === 'invalid_ip') {
        setPacketState('blocked');
        setPacketLog(result.allLogs);
        return;
      }

      setPacketLog((prev) => [...prev, ...result.hopLogs.slice(0, 1)]);

      setTimeout(() => {
        setPacketState(result.packetState);
        setPacketLog(result.allLogs);
      }, 300);
    }, 300);
  };

  const handleApplyPreset = (preset: 'standard_https' | 'blocked_http' | 'mismatched_gateway' | 'nat_off') => {
    if (preset === 'standard_https') {
      setCidrPrefix(26);
      setHostIp('192.168.1.42');
      setGatewayIp('192.168.1.1');
      setDestPort(443);
      setNatEnabled(true);
      setFirewallPolicy('allow_all');
    } else if (preset === 'blocked_http') {
      setCidrPrefix(26);
      setHostIp('192.168.1.42');
      setGatewayIp('192.168.1.1');
      setDestPort(80);
      setNatEnabled(true);
      setFirewallPolicy('strict_https');
    } else if (preset === 'mismatched_gateway') {
      setCidrPrefix(27);
      setHostIp('192.168.1.42');
      setGatewayIp('192.168.1.1');
      setDestPort(443);
      setNatEnabled(true);
    } else if (preset === 'nat_off') {
      setCidrPrefix(26);
      setHostIp('192.168.1.42');
      setGatewayIp('192.168.1.1');
      setDestPort(443);
      setNatEnabled(false);
    }
    setPacketState('idle');
    setTransmissionResult(null);
  };

  return (
    <Workspace
      title={isAr ? 'المختبر المرجعي لتصميم الشبكات الفرعية (CIDR) والتوجيه وبوابات NAT' : 'Reference Subnet Designer, Packet Forwarding & NAT Egress Laboratory'}
      subtitle={isAr ? 'حساب حدود العناوين الثنائية، تتبع القفزات، قواعد جدار الحماية، وترجمة العناوين' : 'Binary Octet Subnetting, Multi-Hop Inspection & Stateful NAT Translation'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* CIDR Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-bold uppercase font-mono">
                {isAr ? 'القناع:' : 'CIDR:'}
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

            {/* Port & Protocol */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-bold uppercase font-mono">
                {isAr ? 'المنفذ:' : 'Port:'}
              </span>
              <select
                value={destPort}
                onChange={(e) => {
                  setDestPort(Number(e.target.value));
                  setPacketState('idle');
                }}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded px-2 py-1"
              >
                <option value={443}>443 (HTTPS)</option>
                <option value={80}>80 (HTTP)</option>
                <option value={22}>22 (SSH)</option>
                <option value={53}>53 (DNS)</option>
              </select>
            </div>

            {/* Firewall Policy */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-bold uppercase font-mono">
                {isAr ? 'الجدار:' : 'Firewall:'}
              </span>
              <select
                value={firewallPolicy}
                onChange={(e) => {
                  setFirewallPolicy(e.target.value as any);
                  setPacketState('idle');
                }}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded px-2 py-1"
              >
                <option value="allow_all">{isAr ? 'سماح شامل' : 'Permissive Allow'}</option>
                <option value="strict_https">{isAr ? 'حظر HTTP 80' : 'Block HTTP Port 80'}</option>
                <option value="drop_all">{isAr ? 'حظر شامل Drop' : 'Deny All'}</option>
              </select>
            </div>
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
              <span>{isAr ? 'بوابة NAT مفعلة' : 'NAT Egress'}</span>
            </label>

            <button
              onClick={handleTransmitPacket}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAr ? 'اختبار إرسال حزمة بيانات' : 'Transmit Packet Test'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-5 overflow-y-auto flex flex-col items-center select-none space-y-5">
        {/* Preset Scenario Toolbar */}
        <div className="max-w-4xl w-full p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'سيناريوهات الفحص الجاهزة:' : 'Preset Diagnostic Scenarios:'}</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleApplyPreset('standard_https')}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-cyan-300 text-[11px] font-mono"
            >
              {isAr ? '1. اتصل آمن HTTPS' : '1. Standard HTTPS'}
            </button>
            <button
              onClick={() => handleApplyPreset('blocked_http')}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-rose-500 text-rose-300 text-[11px] font-mono"
            >
              {isAr ? '2. حظر HTTP غير مشفر' : '2. Blocked HTTP'}
            </button>
            <button
              onClick={() => handleApplyPreset('mismatched_gateway')}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-300 text-[11px] font-mono"
            >
              {isAr ? '3. خطأ شبكة البوابة /27' : '3. Mismatched Subnet'}
            </button>
            <button
              onClick={() => handleApplyPreset('nat_off')}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-purple-500 text-purple-300 text-[11px] font-mono"
            >
              {isAr ? '4. تعطيل بوابة NAT' : '4. NAT Disabled'}
            </button>
          </div>
        </div>

        {/* Network Inputs & Subnet Details Summary */}
        <div className="max-w-4xl w-full p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Host IP & Subnet Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-slate-400 font-bold block">
              {isAr ? 'عنوان IP المضيف (Host IP):' : 'Host IPv4 Address:'}
            </label>
            <input
              type="text"
              value={hostIp}
              onChange={(e) => setHostIp(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs rounded px-3 py-1.5 focus:outline-hidden"
            />
            <span className="text-[10px] text-slate-500 block font-mono">
              {isAr ? `نطاق المضيفين: ${subnetDetails?.firstUsableIp} - ${subnetDetails?.lastUsableIp}` : `Range: ${subnetDetails?.firstUsableIp} - ${subnetDetails?.lastUsableIp}`}
            </span>
          </div>

          {/* Gateway IP Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-slate-400 font-bold block">
              {isAr ? 'البوابة الافتراضية (Default Gateway):' : 'Default Gateway IPv4:'}
            </label>
            <input
              type="text"
              value={gatewayIp}
              onChange={(e) => setGatewayIp(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs rounded px-3 py-1.5 focus:outline-hidden"
            />
            <span className="text-[10px] text-slate-500 block font-mono">
              {isAr ? `عنوان الموجه القريب: 192.168.1.1` : `Default Router IP: 192.168.1.1`}
            </span>
          </div>

          {/* Subnet Calculation Metrics */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                {isAr ? 'القناع العشري' : 'Subnet Mask'}
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {subnetDetails?.subnetMask}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                {isAr ? 'المضيفين المتاحين' : 'Usable Hosts'}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {usableHosts}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                {isAr ? 'عنوان الشبكة' : 'Network Address'}
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {subnetDetails?.networkAddress}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                {isAr ? 'عنوان البث' : 'Broadcast IP'}
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {subnetDetails?.broadcastAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Hop Trace Visualizer */}
        <div className="max-w-4xl w-full p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'مسار القفزات والتحقق من أجهزة الشبكة' : 'Interactive Multi-Hop Path Trace'}</span>
            </span>
            {transmissionResult && (
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  transmissionResult.packetState === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {transmissionResult.packetState === 'success' ? (isAr ? 'وصلت بنجاح' : 'REACHABLE') : (isAr ? 'تم إسقاط الحزمة' : 'DROPPED')}
              </span>
            )}
          </h4>

          {/* Hop Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { id: 'pc', label: 'Host PC', ip: hostIp, icon: Server, hop: 'host' },
              { id: 'router', label: 'L3 Gateway', ip: gatewayIp, icon: Radio, hop: 'router' },
              { id: 'firewall', label: 'Firewall & NAT', ip: '203.0.113.1', icon: Sliders, hop: 'firewall' },
              { id: 'server', label: 'WAN Web Server', ip: `${wanServerIp}:${destPort}`, icon: Globe, hop: 'service' },
            ].map((node) => {
              const NodeIcon = node.icon;
              const isSelected = selectedDevice === node.id;
              const isFailedHop = transmissionResult?.failureHop === node.hop;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedDevice(node.id as any)}
                  className={`p-3.5 rounded-xl border text-left rtl:text-right transition-all relative ${
                    isFailedHop
                      ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                      : isSelected
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <NodeIcon className={`w-5 h-5 ${isFailedHop ? 'text-rose-400' : 'text-cyan-400'}`} />
                    {isFailedHop && <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />}
                  </div>
                  <span className="text-xs font-bold block text-white">{node.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">{node.ip}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Failure & Remediation Explanation Box */}
        {transmissionResult && (
          <div
            className={`max-w-4xl w-full p-4 rounded-xl border ${
              transmissionResult.packetState === 'success'
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {transmissionResult.packetState === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <h5 className="font-bold text-sm">
                  {transmissionResult.packetState === 'success'
                    ? (isAr ? 'نجاح وصول الحزمة عبر الشبكة' : 'Packet Transmission Successful')
                    : (isAr ? 'فشل توصيل الحزمة (السبب والتوصية)' : 'Packet Delivery Failure Diagnosis')}
                </h5>
                <p className="leading-relaxed">
                  {isAr ? transmissionResult.failureReasonAr : transmissionResult.failureReasonEn}
                </p>
                {transmissionResult.remediationAr && (
                  <p className="pt-1.5 font-mono text-[11px] opacity-90 border-t border-rose-800/30">
                    <span className="font-bold">{isAr ? 'خطوات العلاج والتصحيح: ' : 'Remediation Steps: '}</span>
                    {isAr ? transmissionResult.remediationAr : transmissionResult.remediationEn}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Diagnostic Stream & NAT Table */}
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">
              {isAr ? 'سجل تشخيص حزم البيانات الحية' : 'Live Packet Diagnostic Stream'}
            </span>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] h-40 overflow-y-auto space-y-1.5 custom-scrollbar">
              {packetLog.length === 0 ? (
                <span className="text-slate-500 italic">
                  {isAr ? 'اضغط "اختبار إرسال حزمة بيانات" لتشغيل التتبع الحقيقي...' : 'Click "Transmit Packet Test" to observe live hop routing...'}
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
              {isAr ? 'جدول ترجمة عناوين NAT الحية' : 'Stateful NAT Translation Table'}
            </span>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 h-40 overflow-x-auto">
              {natEnabled
                ? `[NAT SESSION ACTIVE]
[NAT] ${hostIp}:54201 <-> 203.0.113.1:50001 <-> ${wanServerIp}:${destPort}
[NAT] 192.168.1.22:49152 <-> 203.0.113.1:50002 <-> 8.8.8.8:53`
                : `[NAT DISABLED]\nPrivate RFC 1918 IP addresses (${hostIp}/${cidrPrefix}) are rejected on public WAN egress interfaces.`}
            </pre>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
