/**
 * Network Utilities for OMEGA Cybersecurity Simulation Platform
 * Provides pure, deterministic CIDR calculations, IP parsing, and packet routing evaluation.
 */

/**
 * Validates whether an IP address is a valid IPv4 dotted-decimal string.
 */
export const isValidIpv4 = (ip: string): boolean => {
  if (typeof ip !== 'string') return false;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
    if (part.length > 1 && part.startsWith('0')) return false;
  }
  return true;
};

/**
 * Converts a dotted-decimal IPv4 address to its 32-bit unsigned integer representation.
 */
export const ipToLong = (ip: string): number => {
  if (!isValidIpv4(ip)) return 0;
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

/**
 * Converts a 32-bit unsigned integer to dotted-decimal IPv4 notation.
 */
export const longToIp = (long: number): string => {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join('.');
};

/**
 * Validates whether a CIDR prefix is a valid integer between 0 and 32 inclusive.
 * Rejects negative numbers, values > 32, fractional numbers (e.g. 24.5, 26.5), NaN, and non-finite values.
 */
export const isValidCidrPrefix = (cidr: unknown): cidr is number => {
  return typeof cidr === 'number' && Number.isInteger(cidr) && cidr >= 0 && cidr <= 32;
};

/**
 * Checks if two IP addresses belong to the same subnet based on the CIDR prefix.
 */
export const isSameSubnet = (ip1: string, ip2: string, cidr: number): boolean => {
  if (!isValidIpv4(ip1) || !isValidIpv4(ip2) || !isValidCidrPrefix(cidr)) return false;
  if (cidr === 0) return true;
  
  const mask = (~0 << (32 - cidr)) >>> 0;
  const long1 = ipToLong(ip1);
  const long2 = ipToLong(ip2);
  
  return (long1 & mask) === (long2 & mask);
};

export interface SubnetDetails {
  baseNetwork: string;
  cidrPrefix: number;
  subnetMask: string;
  totalIps: number;
  usableHosts: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
}

/**
 * Computes complete subnet details for a base network and CIDR prefix.
 */
export const calculateSubnetDetails = (baseIp: string, cidr: number): SubnetDetails | null => {
  if (!isValidIpv4(baseIp) || !isValidCidrPrefix(cidr)) return null;

  const maskLong = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const baseLong = ipToLong(baseIp);
  const networkLong = (baseLong & maskLong) >>> 0;
  const totalIps = Math.pow(2, 32 - cidr);
  const broadcastLong = (networkLong + totalIps - 1) >>> 0;
  const usableHosts = cidr >= 31 ? 0 : totalIps - 2;

  return {
    baseNetwork: baseIp,
    cidrPrefix: cidr,
    subnetMask: longToIp(maskLong),
    totalIps,
    usableHosts,
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstUsableIp: usableHosts > 0 ? longToIp(networkLong + 1) : longToIp(networkLong),
    lastUsableIp: usableHosts > 0 ? longToIp(broadcastLong - 1) : longToIp(broadcastLong),
  };
};

export interface PacketHopTrace {
  hopIndex: number;
  nodeName: string;
  nodeIp: string;
  action: 'PROCESSED' | 'FORWARDED' | 'DROPPED';
  status: 'ok' | 'dropped';
  descriptionAr: string;
  descriptionEn: string;
  diagnosticRule?: string;
}

export interface PacketTransmissionParams {
  hostIp: string;
  gatewayIp: string;
  cidrPrefix: number;
  natEnabled: boolean;
  wanServerIp?: string;
  firewallIp?: string;
  destPort?: number;
  protocol?: 'TCP' | 'UDP' | 'ICMP';
  firewallPolicy?: 'allow_all' | 'strict_https' | 'block_http' | 'drop_all';
}

export interface PacketTransmissionResult {
  validInputs: boolean;
  isSameSubnet: boolean;
  status: 
    | 'invalid_ip' 
    | 'invalid_cidr' 
    | 'invalid_port' 
    | 'invalid_protocol' 
    | 'invalid_firewall_policy'
    | 'subnet_mismatch' 
    | 'nat_disabled' 
    | 'firewall_blocked' 
    | 'port_unreachable' 
    | 'success';
  packetState: 'blocked' | 'success';
  initialLogs: string[];
  hopLogs: string[];
  allLogs: string[];
  failureHop?: 'host' | 'arp' | 'router' | 'firewall' | 'nat' | 'service' | null;
  failureReasonAr?: string;
  failureReasonEn?: string;
  remediationAr?: string;
  remediationEn?: string;
  hopTraces?: PacketHopTrace[];
}

/**
 * Pure, deterministic evaluation function for network packet transmission, firewall ACL, NAT egress, and service model.
 */
export const evaluatePacketTransmission = (
  params: PacketTransmissionParams
): PacketTransmissionResult => {
  const {
    hostIp,
    gatewayIp,
    cidrPrefix,
    natEnabled,
    wanServerIp = '93.184.216.34',
    firewallIp = '203.0.113.1',
    destPort = 443,
    protocol = 'TCP',
    firewallPolicy = 'allow_all',
  } = params;

  // 1. Differentiated Input Validation
  const isHostValid = isValidIpv4(hostIp);
  const isGatewayValid = isValidIpv4(gatewayIp);
  const isWanServerValid = isValidIpv4(wanServerIp);
  const isCidrValid = isValidCidrPrefix(cidrPrefix);
  const isPortApplicable = protocol !== 'ICMP';
  const isPortValid = !isPortApplicable || (typeof destPort === 'number' && Number.isInteger(destPort) && destPort >= 1 && destPort <= 65535);
  const isProtocolValid = protocol === 'TCP' || protocol === 'UDP' || protocol === 'ICMP';
  const isPolicyValid = firewallPolicy === 'allow_all' || firewallPolicy === 'strict_https' || firewallPolicy === 'block_http' || firewallPolicy === 'drop_all';

  if (!isHostValid || !isGatewayValid || !isWanServerValid) {
    return {
      validInputs: false,
      isSameSubnet: false,
      status: 'invalid_ip',
      packetState: 'blocked',
      initialLogs: [`[ERROR] Invalid IPv4 address syntax encountered.`],
      hopLogs: [],
      allLogs: [`[ERROR] Invalid IPv4 address syntax encountered.`],
      failureHop: 'host',
      failureReasonAr: 'عنوان IPv4 غير صالح.',
      failureReasonEn: 'Invalid IPv4 address format.',
      remediationAr: 'تأكد من إدخال عناوين IP صحيحة.',
      remediationEn: 'Ensure valid IPv4 addresses are entered.',
    };
  }

  if (!isCidrValid) {
    return {
      validInputs: false,
      isSameSubnet: false,
      status: 'invalid_cidr',
      packetState: 'blocked',
      initialLogs: [`[ERROR] Invalid CIDR prefix configuration (/${cidrPrefix}).`],
      hopLogs: [],
      allLogs: [`[ERROR] Invalid CIDR prefix configuration (/${cidrPrefix}).`],
      failureHop: 'host',
      failureReasonAr: 'قناع CIDR غير صالح.',
      failureReasonEn: 'Invalid CIDR prefix.',
      remediationAr: 'أدخل عددًا صحيحًا بين 0 و32.',
      remediationEn: 'Enter an integer between 0 and 32.',
    };
  }

  if (!isPortValid) {
    return {
      validInputs: false,
      isSameSubnet: false,
      status: 'invalid_port',
      packetState: 'blocked',
      initialLogs: [`[ERROR] Invalid port number: ${destPort}.`],
      hopLogs: [],
      allLogs: [`[ERROR] Invalid port number: ${destPort}.`],
      failureHop: 'host',
      failureReasonAr: 'رقم المنفذ غير صالح.',
      failureReasonEn: 'Invalid port number.',
      remediationAr: 'أدخل رقم منفذ بين 1 و65535.',
      remediationEn: 'Enter a port number between 1 and 65535.',
    };
  }

  if (!isProtocolValid) {
    return {
      validInputs: false,
      isSameSubnet: false,
      status: 'invalid_protocol',
      packetState: 'blocked',
      initialLogs: [`[ERROR] Unsupported protocol: ${protocol}.`],
      hopLogs: [],
      allLogs: [`[ERROR] Unsupported protocol: ${protocol}.`],
      failureHop: 'host',
      failureReasonAr: 'بروتوكول غير مدعوم.',
      failureReasonEn: 'Unsupported protocol.',
      remediationAr: 'اختر TCP أو UDP أو ICMP.',
      remediationEn: 'Select TCP, UDP, or ICMP.',
    };
  }

  if (!isPolicyValid) {
    return {
      validInputs: false,
      isSameSubnet: false,
      status: 'invalid_firewall_policy',
      packetState: 'blocked',
      initialLogs: [`[ERROR] Unsupported firewall policy: ${firewallPolicy}.`],
      hopLogs: [],
      allLogs: [`[ERROR] Unsupported firewall policy: ${firewallPolicy}.`],
      failureHop: 'host',
      failureReasonAr: 'سياسة جدار حماية غير مدعومة.',
      failureReasonEn: 'Unsupported firewall policy.',
      remediationAr: 'اختر سياسة من القائمة المتاحة.',
      remediationEn: 'Select a policy from the available list.',
    };
  }

  // Crafting Initial Trace Logs according to Protocol
  let craftDescription = `Crafting TCP SYN (Port ${destPort} -> Destination ${wanServerIp})`;
  if (protocol === 'UDP') {
    craftDescription = `Crafting UDP Datagram (Port ${destPort} -> Destination ${wanServerIp})`;
  } else if (protocol === 'ICMP') {
    craftDescription = `Crafting ICMP Echo Request (Type 8 Code 0 -> Destination ${wanServerIp})`;
  }

  const initialLogs = [
    `[00:00.000] HOST_PC (${hostIp}) -> [محاكاة افتراضية / Virtual Trace] ${craftDescription}`,
    `[00:00.015] ARP Table -> Resolving Gateway ${gatewayIp} (MAC 00:1A:2B:3C:4D:01)`,
  ];

  // 2. Subnet Boundary Check (Host vs Gateway)
  const sameSubnet = isSameSubnet(hostIp, gatewayIp, cidrPrefix);

  if (!sameSubnet) {
    const hopLogs = [
      `[00:00.040] ROUTER_HOP (${gatewayIp}) -> DROPPED: Host IP ${hostIp} is outside Gateway local subnet boundary /${cidrPrefix}`,
      `[ERROR] Destination unreachable: Host ${hostIp} and Gateway ${gatewayIp} are in different subnets under /${cidrPrefix} prefix.`,
    ];
    return {
      validInputs: true,
      isSameSubnet: false,
      status: 'subnet_mismatch',
      packetState: 'blocked',
      initialLogs,
      hopLogs,
      allLogs: [...initialLogs, ...hopLogs],
      failureHop: 'router',
      failureReasonAr: `المضيف (${hostIp}) والبوابة (${gatewayIp}) يتواجدان في شبكتين فرعيتين مختلفين تحت القناع /${cidrPrefix}.`,
      failureReasonEn: `Host (${hostIp}) and Gateway (${gatewayIp}) are in different subnets under /${cidrPrefix} prefix.`,
      remediationAr: `اضبط عنوان البوابة ليكون ضمن نفس نطاق الشبكة الفرعية /${cidrPrefix} للمضيف أو عدّل القناع.`,
      remediationEn: `Adjust default gateway IP to sit within the same /${cidrPrefix} subnet range as host.`,
      hopTraces: [
        {
          hopIndex: 1,
          nodeName: 'Host PC',
          nodeIp: hostIp,
          action: 'FORWARDED',
          status: 'ok',
          descriptionAr: 'تم إنشاء الحزمة وإرسال استعلام ARP عن الموجه.',
          descriptionEn: 'Packet created and ARP query transmitted for gateway.',
        },
        {
          hopIndex: 2,
          nodeName: 'Router Ingress',
          nodeIp: gatewayIp,
          action: 'DROPPED',
          status: 'dropped',
          descriptionAr: 'تم إسقاط الحزمة: المضيف والبوابة ينتميان لشبكتين فرعيتين غير متطابقتين.',
          descriptionEn: 'Packet dropped: Host and Gateway belong to non-overlapping subnets.',
        },
      ],
    };
  }

  // 3. Firewall Policy ACL Evaluation (Fixed ICMP/UDP Interaction)
  let isFirewallBlocked = false;
  if (firewallPolicy === 'drop_all') {
    isFirewallBlocked = true;
  } else if (firewallPolicy === 'strict_https') {
    // Only allow TCP/443
    if (protocol !== 'TCP' || destPort !== 443) {
      isFirewallBlocked = true;
    }
  } else if (firewallPolicy === 'block_http') {
    // Only block TCP/80 (Standard HTTP)
    if (protocol === 'TCP' && destPort === 80) {
      isFirewallBlocked = true;
    }
  }

  if (isFirewallBlocked) {
    const hopLogs = [
      `[00:00.040] ROUTER_HOP (${gatewayIp}) -> Forwarding packet to Firewall Egress Interface (${firewallIp})`,
      `[00:00.080] FIREWALL (${firewallIp}) -> DROPPED: Security ACL Rule Matched [DENY ${protocol}${protocol === 'ICMP' ? '' : ` Port ${destPort}`}].`,
      `[ERROR] Egress traffic blocked by perimeter firewall policy (${firewallPolicy}).`,
    ];
    return {
      validInputs: true,
      isSameSubnet: true,
      status: 'firewall_blocked',
      packetState: 'blocked',
      initialLogs,
      hopLogs,
      allLogs: [...initialLogs, ...hopLogs],
      failureHop: 'firewall',
      failureReasonAr: `جدار الحماية أقصى الحزمة وفق سياسة الأمن ACL المحددة (${firewallPolicy}: حظر ${protocol}${protocol === 'ICMP' ? '' : ` على المنفذ ${destPort}`}).`,
      failureReasonEn: `Firewall dropped packet matching ACL deny rule (${firewallPolicy}: DENY ${protocol}${protocol === 'ICMP' ? '' : ` on Port ${destPort}`}).`,
      remediationAr: 'عدّل قواعد جدار الحماية لتسمية مرور منفذ الخدمة المطلوبة (مثل السماح برقم المنفذ 443 للاتصال المشفر).',
      remediationEn: 'Update firewall ACL policy to permit desired service port (e.g. allow HTTPS 443).',
      hopTraces: [
        {
          hopIndex: 1,
          nodeName: 'Host PC',
          nodeIp: hostIp,
          action: 'FORWARDED',
          status: 'ok',
          descriptionAr: 'تم صياغة وإرسال الحزمة للبوابة المحلية.',
          descriptionEn: 'Packet transmitted to default local router.',
        },
        {
          hopIndex: 2,
          nodeName: 'Router Gateway',
          nodeIp: gatewayIp,
          action: 'FORWARDED',
          status: 'ok',
          descriptionAr: 'تم توجيه الحزمة إلى واجهة جدار الحماية.',
          descriptionEn: 'L3 lookup completed and forwarded to firewall.',
        },
        {
          hopIndex: 3,
          nodeName: 'Firewall ACL Engine',
          nodeIp: firewallIp,
          action: 'DROPPED',
          status: 'dropped',
          descriptionAr: `حظر الحزمة: مطابقة قاعدة المنع لقاعد الجدار الناري (${firewallPolicy}).`,
          descriptionEn: `Packet dropped by firewall ACL rule match (${firewallPolicy}).`,
        },
      ],
    };
  }

  // 4. Egress NAT Translation Check
  if (!natEnabled) {
    const hopLogs = [
      `[00:00.040] ROUTER_HOP (${gatewayIp}) -> Forwarding packet to Firewall Egress Interface (${firewallIp})`,
      `[00:00.080] FIREWALL (${firewallIp}) -> DROPPED: Egress NAT is DISABLED. RFC 1918 Private IP (${hostIp}) rejected by WAN router.`,
      `[HYPOTHESIS] Enable NAT Gateway to translate private internal IPs to public WAN IP ${firewallIp}.`,
    ];
    return {
      validInputs: true,
      isSameSubnet: true,
      status: 'nat_disabled',
      packetState: 'blocked',
      initialLogs,
      hopLogs,
      allLogs: [...initialLogs, ...hopLogs],
      failureHop: 'nat',
      failureReasonAr: `بوابة NAT معطلة؛ لا يمكن إرسال عناوين IP الخاصة (RFC 1918) عبر شبكة WAN العامة.`,
      failureReasonEn: `Egress NAT is disabled. Private RFC 1918 IPs cannot route over public internet WAN.`,
      remediationAr: 'فعل بوابة ترجمة العناوين NAT Gateway لترجمة العنوان الخاص إلى عنوان عام قبل الخروج.',
      remediationEn: 'Enable NAT Gateway to perform source IP translation (SNAT) on WAN egress.',
      hopTraces: [
        {
          hopIndex: 1,
          nodeName: 'Host PC',
          nodeIp: hostIp,
          action: 'FORWARDED',
          status: 'ok',
          descriptionAr: 'الحزمة غادرت المضيف بنجاح.',
          descriptionEn: 'Packet left host interface.',
        },
        {
          hopIndex: 2,
          nodeName: 'Router Gateway',
          nodeIp: gatewayIp,
          action: 'FORWARDED',
          status: 'ok',
          descriptionAr: 'توجيه الحزمة إلى واجهة الخروج العامة.',
          descriptionEn: 'Forwarded to WAN egress interface.',
        },
        {
          hopIndex: 3,
          nodeName: 'NAT Gateway',
          nodeIp: firewallIp,
          action: 'DROPPED',
          status: 'dropped',
          descriptionAr: 'تم إسقاط الحزمة: ترجمة العناوين معطلة والشبكة العامة ترفض العناوين الخاصة.',
          descriptionEn: 'Dropped: NAT is disabled and WAN rejects un-translated private IPs.',
        },
      ],
    };
  }

  // 5. Remote Server Daemon & Service Model Evaluation (Enhanced TLS/HTTPS sequence)
  let isServiceSupported = false;
  let serviceLogs: string[] = [];
  let successSummaryLog = '';

  if (protocol === 'TCP' && destPort === 443) {
    isServiceSupported = true;
    serviceLogs = [
      `[00:00.120] WAN_SERVER (${wanServerIp}:443) -> TCP 3-Way Handshake Completed.`,
      `[00:00.130] WAN_SERVER (${wanServerIp}:443) -> TLS 1.3 Handshake: ClientHello received.`,
      `[00:00.140] WAN_SERVER (${wanServerIp}:443) -> TLS 1.3 Handshake: ServerHello, Certificate, Finished.`,
      `[00:00.145] WAN_SERVER (${wanServerIp}:443) -> Encrypted session established.`,
      `[00:00.150] WAN_SERVER (${wanServerIp}:443) -> Processing Encrypted HTTP GET / request...`,
    ];
    successSummaryLog = `[00:00.160] SUCCESS: 3-Way Handshake Completed & Encrypted TLS 1.3 HTTP 200 OK Response Received via /${cidrPrefix} Subnet & NAT Gateway!`;
  } else if (protocol === 'TCP' && destPort === 80) {
    isServiceSupported = true;
    serviceLogs = [
      `[00:00.120] WAN_SERVER (${wanServerIp}:80) -> TCP 3-Way Handshake Completed.`,
      `[00:00.130] WAN_SERVER (${wanServerIp}:80) -> Plaintext HTTP GET / processed.`,
    ];
    successSummaryLog = `[00:00.150] SUCCESS: 3-Way Handshake Completed (HTTP 200 OK) via /${cidrPrefix} Subnet & NAT Gateway!`;
  } else if (protocol === 'TCP' && destPort === 22) {
    isServiceSupported = true;
    serviceLogs = [
      `[00:00.120] WAN_SERVER (${wanServerIp}:22) -> TCP 3-Way Handshake Completed.`,
      `[00:00.130] WAN_SERVER (${wanServerIp}:22) -> SSHv2 Banner Exchanged (OpenSSH 8.9p1).`,
    ];
    successSummaryLog = `[00:00.150] SUCCESS: SSH Key Exchange Completed (Curve25519) & Session Established via /${cidrPrefix} Subnet & NAT Gateway!`;
  } else if (protocol === 'UDP' && destPort === 53) {
    isServiceSupported = true;
    serviceLogs = [
      `[00:00.120] WAN_SERVER (${wanServerIp}:53) -> Processed UDP DNS Query for domain.`,
    ];
    successSummaryLog = `[00:00.150] SUCCESS: DNS Query Resolved (A Record 93.184.216.34) via /${cidrPrefix} Subnet & NAT Gateway!`;
  } else if (protocol === 'TCP' && destPort === 53) {
    isServiceSupported = true;
    serviceLogs = [
      `[00:00.120] WAN_SERVER (${wanServerIp}:53) -> TCP 3-Way Handshake Completed.`,
      `[00:00.130] WAN_SERVER (${wanServerIp}:53) -> Processed TCP DNS Query.`,
    ];
    successSummaryLog = `[00:00.150] SUCCESS: DNS Query Resolved over TCP via /${cidrPrefix} Subnet & NAT Gateway!`;
  } else if (protocol === 'ICMP') {
    isServiceSupported = true;
    serviceLogs = [
      `[00:00.120] WAN_SERVER (${wanServerIp}) -> Kernel ICMP Responder processed Echo Request.`,
    ];
    successSummaryLog = `[00:00.150] SUCCESS: ICMP Echo Reply Received (0ms RTT, TTL=64) via /${cidrPrefix} Subnet & NAT Gateway!`;
  }

  // Handling Closed Port / Unsupported Service -> port_unreachable
  if (!isServiceSupported) {
    const serviceNodeIp = protocol === 'ICMP' ? wanServerIp : `${wanServerIp}:${destPort}`;
    let dropLog = `[00:00.120] WAN_SERVER (${serviceNodeIp}) -> DROPPED: Connection Refused (TCP RST / Port Closed / No Active Daemon).`;
    let errorLog = `[ERROR] Destination port ${destPort} unreachable: No active TCP service daemon listening on remote host.`;

    if (protocol === 'UDP') {
      dropLog = `[00:00.120] WAN_SERVER (${serviceNodeIp}) -> DROPPED: ICMP Destination Unreachable (Type 3 Code 3: Port Unreachable).`;
      errorLog = `[ERROR] Destination port ${destPort} unreachable: No active UDP service listening on remote host.`;
    } else if (protocol === 'ICMP') {
      dropLog = `[00:00.120] WAN_SERVER (${serviceNodeIp}) -> DROPPED: ICMP Responder Disabled / Unreachable.`;
      errorLog = `[ERROR] Destination host ${wanServerIp} ICMP Echo responder unreachable.`;
    }

    const hopLogs = [
      `[00:00.040] ROUTER_HOP (${gatewayIp}) -> Forwarding packet to Firewall Egress Interface (${firewallIp})`,
      `[00:00.080] NAT_TABLE -> Translated ${hostIp}:54201 -> ${firewallIp}:50001`,
      dropLog,
      errorLog,
    ];
    return {
      validInputs: true,
      isSameSubnet: true,
      status: 'port_unreachable',
      packetState: 'blocked',
      initialLogs,
      hopLogs,
      allLogs: [...initialLogs, ...hopLogs],
      failureHop: 'service',
      failureReasonAr: protocol === 'UDP'
        ? `الخادم البعيد أرجع رسالة ICMP Port Unreachable (Type 3 Code 3): لا توجد خدمة UDP تستمع على المنفذ ${destPort}.`
        : `الخادم البعيد أرجع رفضاً للاتصال (TCP RST / Port Closed): لا توجد خدمة نشطة تستمع على المنفذ ${destPort} عبر بروتوكول ${protocol}.`,
      failureReasonEn: protocol === 'UDP'
        ? `Remote server returned ICMP Port Unreachable (Type 3 Code 3): No UDP service listening on port ${destPort}.`
        : `Remote server refused connection (TCP RST / Port Closed): No active service listening on port ${destPort} for ${protocol}.`,
      remediationAr: 'استهدف منفذاً مفتوحاً تدعمه خوادم المحاكاة (مثل 443 لـ HTTPS، 80 لـ HTTP، 22 لـ SSH، 53 لـ DNS، أو ICMP).',
      remediationEn: 'Target an open port supported by simulated daemons (e.g. 443 HTTPS, 80 HTTP, 22 SSH, 53 DNS, ICMP).',
      hopTraces: [
        {
          hopIndex: 1,
          nodeName: 'Host PC',
          nodeIp: hostIp,
          action: 'FORWARDED',
          status: 'ok',
          descriptionAr: 'تم إنشاء الحزمة بنجاح.',
          descriptionEn: 'Packet created successfully.',
        },
        {
          hopIndex: 2,
          nodeName: 'Router Gateway',
          nodeIp: gatewayIp,
          action: 'FORWARDED',
          status: 'ok',
          descriptionAr: 'تم التوجيه نحو جدار الحماية.',
          descriptionEn: 'Routed to egress firewall.',
        },
        {
          hopIndex: 3,
          nodeName: 'Firewall ACL Engine',
          nodeIp: firewallIp,
          action: 'FORWARDED',
          status: 'ok',
          descriptionAr: 'اجتياز جدار الحماية بنجاح.',
          descriptionEn: 'Passed firewall inspection.',
        },
        {
          hopIndex: 4,
          nodeName: 'NAT Gateway',
          nodeIp: `${firewallIp}:50001`,
          action: 'FORWARDED',
          status: 'ok',
          descriptionAr: 'ترجمة العنوان الخاص إلى عنوان عام.',
          descriptionEn: 'SNAT translation created.',
        },
        {
          hopIndex: 5,
          nodeName: 'WAN Remote Server',
          nodeIp: serviceNodeIp,
          action: 'DROPPED',
          status: 'dropped',
          descriptionAr: protocol === 'UDP'
            ? `الخدمة غير مجهزة على المنفذ ${destPort}: أرجع الخادم رسالة ICMP Port Unreachable.`
            : `الخدمة غير مجهزة على المنفذ ${destPort}: أرجع الخادم استجابة TCP RST.`,
          descriptionEn: protocol === 'UDP'
            ? `Service closed on port ${destPort}: Remote host returned ICMP Destination Unreachable.`
            : `Service closed on port ${destPort}: Remote host returned TCP RST / Connection Refused.`,
        },
      ],
    };
  }

  // Full Success Path
  const hopLogs = [
    `[00:00.040] ROUTER_HOP (${gatewayIp}) -> Forwarding packet to Firewall Egress Interface (${firewallIp})`,
    `[00:00.080] NAT_TABLE -> Translated ${hostIp}:54201 -> ${firewallIp}:50001`,
    ...serviceLogs,
    successSummaryLog,
  ];

  const targetNodeIp = protocol === 'ICMP' ? wanServerIp : `${wanServerIp}:${destPort}`;

  return {
    validInputs: true,
    isSameSubnet: true,
    status: 'success',
    packetState: 'success',
    initialLogs,
    hopLogs,
    allLogs: [...initialLogs, ...hopLogs],
    failureHop: null,
    hopTraces: [
      {
        hopIndex: 1,
        nodeName: 'Host PC',
        nodeIp: hostIp,
        action: 'FORWARDED',
        status: 'ok',
        descriptionAr: 'تم إنشاء وبث حزمة البيانات.',
        descriptionEn: 'Packet constructed and transmitted.',
      },
      {
        hopIndex: 2,
        nodeName: 'L3 Router Gateway',
        nodeIp: gatewayIp,
        action: 'FORWARDED',
        status: 'ok',
        descriptionAr: 'توجيه الحزمة بناءً على جدول التوجيه LPM.',
        descriptionEn: 'Route match found in LPM table and forwarded.',
      },
      {
        hopIndex: 3,
        nodeName: 'Firewall ACL Engine',
        nodeIp: firewallIp,
        action: 'FORWARDED',
        status: 'ok',
        descriptionAr: 'اجتياز قواعد جدار الحماية بنجاح.',
        descriptionEn: 'Passed firewall ACL inspection.',
      },
      {
        hopIndex: 4,
        nodeName: 'Stateful NAT Gateway',
        nodeIp: `${firewallIp}:50001`,
        action: 'FORWARDED',
        status: 'ok',
        descriptionAr: 'ترجمة العنوان الخاص إلى عنوان عام وتخزين الجلسة.',
        descriptionEn: 'SNAT translation created in state table.',
      },
      {
        hopIndex: 5,
        nodeName: 'WAN Remote Server',
        nodeIp: targetNodeIp,
        action: 'PROCESSED',
        status: 'ok',
        descriptionAr: 'استلام الحزمة واكتمال استجابة الخدمة بنجاح.',
        descriptionEn: 'Packet processed and successful service response returned.',
      },
    ],
  };
};

/**
 * Shared, authoritative challenge validation configuration interface and function.
 */
export interface SubnetRoutingChallengeConfig {
  hostIp: string;
  gatewayIp: string;
  cidrPrefix: number;
  natEnabled: boolean;
  wanServerIp?: string;
  destPort?: number;
  protocol?: 'TCP' | 'UDP' | 'ICMP';
  firewallPolicy?: 'allow_all' | 'strict_https' | 'block_http' | 'drop_all';
}

export interface SubnetRoutingChallengeValidation {
  success: boolean;
  score: number;
  messageAr: string;
  messageEn: string;
  transmissionResult: PacketTransmissionResult;
  checks: {
    cidrValid: boolean;
    sameSubnet: boolean;
    natEnabled: boolean;
    transmissionSuccess: boolean;
  };
}

export function validateSubnetRoutingChallengeState(
  config: SubnetRoutingChallengeConfig
): SubnetRoutingChallengeValidation {
  const transmissionResult = evaluatePacketTransmission({
    hostIp: config.hostIp,
    gatewayIp: config.gatewayIp,
    cidrPrefix: config.cidrPrefix,
    natEnabled: config.natEnabled,
    wanServerIp: config.wanServerIp || '93.184.216.34',
    destPort: config.destPort ?? 443,
    protocol: config.protocol || 'TCP',
    firewallPolicy: config.firewallPolicy || 'allow_all',
  });

  const cidrValid = config.cidrPrefix === 26;
  const sameSubnet = isSameSubnet(config.hostIp, config.gatewayIp, config.cidrPrefix);
  const natEnabled = config.natEnabled === true;
  const transmissionSuccess = transmissionResult.status === 'success' && transmissionResult.packetState === 'success';

  // Overall success ONLY when CIDR is /26, Host & Gateway in same subnet, NAT enabled, AND transmission simulation succeeds!
  const success = cidrValid && sameSubnet && natEnabled && transmissionSuccess;

  let score = 0;
  if (cidrValid) score += 25;
  if (sameSubnet) score += 25;
  if (natEnabled) score += 25;
  if (transmissionSuccess) score += 25;

  let messageAr = 'ممتاز! تم تصميم الشبكة الفرعية /26، وتطابق البوابة مع المضيف، وتفعيل NAT وإرسال الحزم بنجاح.';
  let messageEn = 'Subnet /26 topology, host-gateway alignment, NAT egress, and packet transmission verified successfully!';

  if (!cidrValid) {
    messageAr = 'قناع CIDR يجب أن يكون /26 (لتوليد 62 مضيف صالح لكل شبكة فرعية).';
    messageEn = 'CIDR mask must be set to /26 for 62 usable hosts per subnet.';
  } else if (!sameSubnet) {
    messageAr = 'المضيف والبوابة الافتراضية غير متواجدين في نفس نطاق الشبكة الفرعية.';
    messageEn = 'Host IP and Gateway IP belong to non-overlapping subnets.';
  } else if (!natEnabled) {
    messageAr = 'بوابة ترجمة العناوين NAT معطلة؛ يجب تفعيل NAT لترجمة العناوين الخاصة.';
    messageEn = 'NAT Gateway is disabled; enable NAT to route private addresses to WAN.';
  } else if (!transmissionSuccess) {
    messageAr = `فشل إرسال الحزمة: ${transmissionResult.failureReasonAr || 'الحزمة محظورة بواسطة جدار الحماية أو الخدمة'}`;
    messageEn = `Packet transmission failed: ${transmissionResult.failureReasonEn || 'Packet blocked by firewall or service'}`;
  }

  return {
    success,
    score,
    messageAr,
    messageEn,
    transmissionResult,
    checks: {
      cidrValid,
      sameSubnet,
      natEnabled,
      transmissionSuccess,
    },
  };
}
