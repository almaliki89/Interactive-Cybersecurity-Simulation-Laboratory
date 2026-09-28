/**
 * OMEGA ULTRA REALITY V1.2 — True Network Behavior Types
 * Deterministic types for L2 switching, ARP, L3 routing, Firewall, DNS, TCP connections, and SMB.
 */

export type NetworkProtocol = 'TCP' | 'UDP' | 'ICMP';

export type InterfaceOperState = 'UP' | 'DOWN';
export type InterfaceAdminState = 'UP' | 'DOWN';

export interface SimulatedNetworkInterface {
  id: string;
  deviceId: string;
  name: string;
  macAddress: string;
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  dnsServers: string[];
  vlanId: number;
  adminState: InterfaceAdminState;
  operState: InterfaceOperState;
  speedMbps: number;
  duplex: 'FULL' | 'HALF';
  connectedPort?: string;
  connectedCableId?: string;
  txPackets: number;
  rxPackets: number;
  txBytes: number;
  rxBytes: number;
}

export interface MacTableEntry {
  macAddress: string;
  portNumber: number;
  vlanId: number;
  learnedAtVirtualTime: number;
  static?: boolean;
}

export interface ArpCacheEntry {
  ipAddress: string;
  macAddress: string;
  state: 'REACHABLE' | 'STALE' | 'FAILED';
  expiresAtVirtualTime: number;
  type: 'dynamic' | 'static';
}

export interface RouteEntry {
  destinationNetwork: string; // e.g. "10.10.30.0/24" or "0.0.0.0/0"
  netmask: string;            // e.g. "255.255.255.0"
  gateway: string;            // e.g. "10.10.30.1" or "0.0.0.0"
  interfaceName: string;      // e.g. "Ethernet0"
  metric: number;
}

export interface FirewallRule {
  id: string;
  name: string;
  srcNetwork: string;
  dstNetwork: string;
  protocol: NetworkProtocol | 'ANY';
  srcPort?: number | 'ANY';
  dstPort?: number | 'ANY';
  action: 'ALLOW' | 'DENY';
  enabled: boolean;
}

export type ConnectionState = 'SYN_SENT' | 'ESTABLISHED' | 'RESET' | 'CLOSED' | 'FAILED';

export interface NetworkConnection {
  id: string;
  protocol: NetworkProtocol;
  sourceDevice: string;
  sourceIp: string;
  sourcePort: number;
  destinationDevice: string;
  destinationIp: string;
  destinationPort: number;
  state: ConnectionState;
  createdAtVirtualTime: number;
  lastActivityVirtualTime: number;
  bytesSent: number;
  bytesReceived: number;
  failureReason?: string;
}

export interface DnsRecord {
  hostname: string;
  recordType: 'A' | 'CNAME' | 'PTR';
  ipAddress: string;
  ttlSeconds: number;
}

export interface DnsCacheEntry {
  hostname: string;
  resolvedIp: string;
  expiresAtVirtualTime: number;
  ttlSeconds: number;
}

export type DnsFailureReason =
  | 'PHYSICAL_PATH_UNAVAILABLE'
  | 'INTERFACE_DOWN'
  | 'ROUTING_FAILED'
  | 'FIREWALL_DENIED'
  | 'SERVER_UNREACHABLE'
  | 'DNS_SERVICE_STOPPED'
  | 'NAME_NOT_FOUND'
  | 'TIMEOUT';

export interface DnsQueryResult {
  success: boolean;
  hostname: string;
  resolvedIp?: string;
  fromCache: boolean;
  serverIp: string;
  latencyMs: number;
  error?: DnsFailureReason;
  errorDetails?: string;
}

export type SmbFailureReason =
  | 'NAME_RESOLUTION_FAILED'
  | 'PHYSICAL_PATH_UNAVAILABLE'
  | 'NETWORK_UNREACHABLE'
  | 'FIREWALL_DENIED'
  | 'HOST_OFFLINE'
  | 'SERVICE_UNAVAILABLE'
  | 'ACCESS_DENIED'
  | 'SHARE_NOT_FOUND';

export interface SmbShare {
  name: string;
  path: string;
  description: string;
  allowedUsers: string[];
  allowedGroups: string[];
  readOnly: boolean;
}

export interface SmbAccessResult {
  success: boolean;
  authenticationSucceeded: boolean;
  authorizationSucceeded: boolean;
  failureReason?: string;
  userPrincipal?: string;
  userSid?: string;
  serviceSpn?: string;
  ticketId?: string;
  effectiveRights?: string;
  serverHostname: string;
  shareName: string;
  user: string;
  targetPath?: string;
  error?: SmbFailureReason;
  errorDetails?: string;
  latencyMs: number;
}

export interface PingResult {
  success: boolean;
  target: string;
  resolvedIp: string;
  rttMs: number;
  ttl: number;
  bytes: number;
  error?: string;
}

export interface TestNetConnectionResult {
  success: boolean;
  computerName: string;
  remoteAddress: string;
  remotePort: number;
  interfaceAlias: string;
  sourceAddress: string;
  pingSucceeded: boolean;
  tcpTestSucceeded: boolean;
  latencyMs: number;
  error?: string;
}

export interface NetworkEngineSnapshot {
  interfaces: SimulatedNetworkInterface[];
  arpCaches: Record<string, ArpCacheEntry[]>;
  dnsCaches: Record<string, DnsCacheEntry[]>;
  routes: Record<string, RouteEntry[]>;
  macTable: MacTableEntry[];
  connections: NetworkConnection[];
  firewallRules: FirewallRule[];
}

