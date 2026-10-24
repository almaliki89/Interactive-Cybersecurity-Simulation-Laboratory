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

export interface PacketTransmissionParams {
  hostIp: string;
  gatewayIp: string;
  cidrPrefix: number;
  natEnabled: boolean;
  wanServerIp?: string;
  firewallIp?: string;
}

export interface PacketTransmissionResult {
  validInputs: boolean;
  isSameSubnet: boolean;
  status: 'invalid_ip' | 'subnet_mismatch' | 'nat_disabled' | 'success';
  packetState: 'blocked' | 'success';
  initialLogs: string[];
  hopLogs: string[];
  allLogs: string[];
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
    };
  }

  const initialLogs = [
    `[00:00.000] HOST_PC (${hostIp}) -> Crafting TCP SYN (Port 443 -> Destination ${wanServerIp})`,
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
    };
  }

  const hopLogs = [
    `[00:00.040] ROUTER_HOP (${gatewayIp}) -> Forwarding packet to Firewall Egress Interface (${firewallIp})`,
    `[00:00.080] NAT_TABLE -> Translated ${hostIp}:54201 -> ${firewallIp}:50001`,
    `[00:00.120] WAN_SERVER (${wanServerIp}:443) -> Received TCP SYN, responded TCP SYN-ACK`,
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
  };
};
