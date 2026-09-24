export type NodeType =
  | 'client'
  | 'server'
  | 'router'
  | 'switch'
  | 'firewall'
  | 'database'
  | 'dns'
  | 'proxy'
  | 'load_balancer'
  | 'gateway'
  | 'ids_ips'
  | 'siem'
  | 'ca'
  | 'attacker'
  | 'internet';

export type NodeStatus =
  | 'online'
  | 'offline'
  | 'warning'
  | 'protected'
  | 'blocked'
  | 'isolated'
  | 'active';

export interface Position {
  x: number;
  y: number;
}

export interface NetworkInterface {
  name: string;
  ip: string;
  mac: string;
  subnetMask?: string;
}

export interface Service {
  name: string;
  port: number;
  protocol: 'TCP' | 'UDP';
  status: 'running' | 'stopped' | 'error';
}

export interface SecurityControl {
  id: string;
  type: 'firewall' | 'antivirus' | 'ids' | 'encryption';
  enabled: boolean;
  policySummary?: string;
}

export interface SimulationNode {
  id: string;
  type: NodeType;
  name: string;
  role?: string;
  ip: string;
  mac?: string;
  status: NodeStatus;
  position: Position;
  interfaces?: NetworkInterface[];
  services?: Service[];
  securityControls?: SecurityControl[];
  metadata?: Record<string, any>;
}

export type ProtocolType = 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'DNS' | 'ICMP' | 'SSH' | 'TLS';

export type PacketState =
  | 'queued'
  | 'moving'
  | 'delivered'
  | 'blocked'
  | 'dropped'
  | 'delayed'
  | 'inspected';

export interface Packet {
  id: string;
  label?: string;
  source: string; // node ID
  destination: string; // node ID
  protocol: ProtocolType;
  sourcePort: number;
  destinationPort: number;
  flags?: string[]; // e.g. ['SYN'], ['SYN', 'ACK'], ['ACK'], ['FIN'], ['RST']
  state: PacketState;
  progress: number; // 0 to 1 along the path
  path?: string[]; // sequence of node IDs e.g. ['client', 'firewall', 'server']
  currentHopIndex?: number;
  payload?: any;
  sizeBytes?: number;
  timestamp: number;
  blockedReason?: string;
  simulatedLatencyMs?: number;
  color?: string;
}

export interface ConnectionLink {
  id: string;
  source: string; // node ID
  target: string; // node ID
  bandwidthMbps?: number;
  latencyMs?: number;
  status?: 'active' | 'congested' | 'down';
  label?: string;
}

export type EventType = string;

export interface SimulationEvent {
  id: string;
  timestamp: number;
  virtualTime?: number;
  type: string;
  source?: string;
  target?: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  packetId?: string;
  description?: string;
  severity?: any;
  category?: string;
  causedByEventId?: string;
  relatedEntities?: string[];
  details?: Record<string, any>;
  payload?: any;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'ALERT' | 'DEBUG';
  source: string;
  message: string;
  category: 'NETWORK' | 'AUTH' | 'FIREWALL' | 'SYSTEM' | 'SECURITY';
  raw?: string;
}

export interface FirewallRule {
  id: string;
  order: number;
  enabled: boolean;
  name: string;
  action: 'ALLOW' | 'DENY' | 'DROP';
  protocol: 'ANY' | 'TCP' | 'UDP' | 'ICMP';
  sourceIp: string; // e.g. '0.0.0.0/0' or specific IP
  destinationPort: number | 'ANY';
  description?: string;
  hitCount: number;
}

export interface ChallengeObjective {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  validationKey: string;
}

export interface Challenge {
  id: string;
  simulationId: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  mission: string;
  initialExplanation: string;
  objectives: ChallengeObjective[];
  hints: string[];
}

export type SimulationMode = 'guided' | 'sandbox';
