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
  status: 'invalid_ip' | 'subnet_mismatch' | 'nat_disabled' | 'firewall_blocked' | 'port_unreachable' | 'success';
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
 * Pure evaluation function for network packet transmission and NAT egress routing.
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

  if (!isValidIpv4(hostIp) || !isValidIpv4(gatewayIp) || !isValidCidrPrefix(cidrPrefix)) {
    const errorLogs = [
      `[00:00.000] HOST_PC (${hostIp}) -> [ERROR] Invalid IPv4 or CIDR prefix configuration (/${cidrPrefix})`,
      `[ERROR] Packet crafting failed: Check IP address format and CIDR range (0-32).`,
    ];
    return {
      validInputs: false,
      isSameSubnet: false,
      status: 'invalid_ip',
      packetState: 'blocked',
      initialLogs: errorLogs,
      hopLogs: [],
      allLogs: errorLogs,
      failureHop: 'host',
      failureReasonAr: 'عنوان IP المضيف أو قناع CIDR يحتوي على صيغة غير صالحة.',
      failureReasonEn: 'Invalid host IPv4 address or CIDR prefix configuration.',
      remediationAr: 'تأكد من إدخال عنوان IPv4 ثنائي عشري صحيح (مثال 192.168.1.42) وقناع بين 0 و32.',
      remediationEn: 'Ensure a valid dotted-decimal IPv4 address (e.g., 192.168.1.42) and CIDR prefix (0-32).',
      hopTraces: [
        {
          hopIndex: 1,
          nodeName: 'Host PC',
          nodeIp: hostIp,
          action: 'DROPPED',
          status: 'dropped',
          descriptionAr: 'فشل بناء الحزمة بسبب صيغة عنوان غير صحيحة.',
          descriptionEn: 'Packet crafting failed due to invalid address syntax.',
        },
      ],
    };
  }

  const initialLogs = [
    `[00:00.000] HOST_PC (${hostIp}) -> Crafting ${protocol} SYN (Port ${destPort} -> Destination ${wanServerIp})`,
    `[00:00.015] ARP Table -> Resolving Gateway ${gatewayIp} (MAC 00:1A:2B:3C:4D:01)`,
  ];

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
          descriptionAr: 'تم إنشاء الحزمة وإطلاق استعلام ARP للبوابة.',
          descriptionEn: 'Packet created and ARP query sent for default gateway.',
        },
        {
          hopIndex: 2,
          nodeName: 'Router Ingress',
          nodeIp: gatewayIp,
          action: 'DROPPED',
          status: 'dropped',
          descriptionAr: 'تم إسقاط الحزمة: المضيف والبوابة غير متواجدين في نفس نطاق الشبكة الفرعية.',
          descriptionEn: 'Packet dropped: Host and Gateway belong to non-overlapping subnets.',
        },
      ],
    };
  }

  if (firewallPolicy === 'drop_all' || (firewallPolicy === 'strict_https' && destPort !== 443) || (firewallPolicy === 'block_http' && destPort === 80)) {
    const hopLogs = [
      `[00:00.040] ROUTER_HOP (${gatewayIp}) -> Forwarding packet to Firewall Egress Interface (${firewallIp})`,
      `[00:00.080] FIREWALL (${firewallIp}) -> DROPPED: Security ACL Rule Matched [DENY Port ${destPort}].`,
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
      failureReasonAr: `جدار الحماية أقصى الحزمة وفق سياسة الأمن ACL المحددة (منفذ ${destPort} محظور).`,
      failureReasonEn: `Firewall dropped packet matching ACL deny rule (Port ${destPort} restricted).`,
      remediationAr: 'عدّل قواعد جدار الحماية لتسمية مرور منفذ الخدمة المطلوبة (مثال: السماح برقم المنفذ 443).',
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

  const hopLogs = [
    `[00:00.040] ROUTER_HOP (${gatewayIp}) -> Forwarding packet to Firewall Egress Interface (${firewallIp})`,
    `[00:00.080] NAT_TABLE -> Translated ${hostIp}:54201 -> ${firewallIp}:50001`,
    `[00:00.120] WAN_SERVER (${wanServerIp}:${destPort}) -> Received TCP SYN, responded TCP SYN-ACK`,
    `[00:00.150] SUCCESS: 3-Way Handshake Completed (HTTP 200 OK) via /${cidrPrefix} Subnet & NAT Gateway!`,
  ];

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
        nodeIp: `${wanServerIp}:${destPort}`,
        action: 'PROCESSED',
        status: 'ok',
        descriptionAr: 'استلام الحزمة واكتمال المصافحة بنجاح.',
        descriptionEn: 'Packet processed and successful response returned.',
      },
    ],
  };
};
