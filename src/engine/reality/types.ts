/**
 * OMEGA REALITY ENGINE V1.0 — System Simulation Types
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { IntegrityLevel } from '../../simulations/windows/logic/token';

export type MachineStatus = 'ONLINE' | 'OFFLINE' | 'SUSPENDED';

export type SessionLogonType = 'Interactive' | 'Network' | 'Batch' | 'Service' | 'RemoteInteractive';

export interface RealityProcessState {
  pid: number;
  ppid: number;
  name: string;
  binaryPath: string;
  commandLine: string;
  userSid: string;
  userName: string;
  integrityLevel: IntegrityLevel;
  sessionId: number;
  cpuPercent: number;
  memoryMb: number;
  status: 'Running' | 'Suspended' | 'Terminated';
  securityCritical: boolean;
  startVirtualTime: number;
  tokenId: string;
}

export interface RealitySessionState {
  sessionId: number;
  userName: string;
  userSid: string;
  logonType: SessionLogonType;
  authPackage: 'Kerberos' | 'NTLM' | 'Negotiate' | 'Local';
  startVirtualTime: number;
  tokenId: string;
  sourceIp?: string;
  status: 'ACTIVE' | 'LOGGED_OFF' | 'LOCKED';
}

export interface RealityServiceState {
  name: string;
  displayName: string;
  binaryPath: string;
  account: string;
  startupType: 'Automatic' | 'Manual' | 'Disabled';
  status: 'Running' | 'Stopped' | 'Paused';
  pid?: number;
}

export interface RealityFileState {
  path: string;
  sizeBytes: number;
  ownerSid: string;
  contentHash: string;
  content: string;
  createdVirtualTime: number;
  modifiedVirtualTime: number;
  sensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}

export interface RealityEventLogEntry {
  id: string;
  channel: 'Security' | 'System' | 'Application' | 'PowerShell';
  eventId: number;
  virtualTime: number;
  provider: string;
  level: 'Information' | 'Warning' | 'Error' | 'Critical';
  task: string;
  computer: string;
  user: string;
  data: Record<string, any>;
}

export interface RealitySocketState {
  id: string;
  localIp: string;
  localPort: number;
  remoteIp?: string;
  remotePort?: number;
  protocol: 'TCP' | 'UDP';
  state: 'LISTEN' | 'ESTABLISHED' | 'CLOSE_WAIT' | 'CLOSED';
  pid: number;
  processName: string;
  startVirtualTime: number;
}

export interface RealityUserModel {
  id: string;
  username: string;
  domain: string;
  sid: string;
  displayName: string;
  enabled: boolean;
  passwordState: string;
  type: 'local' | 'domain';
  primaryGroup: string;
  groupSids: string[];
  privileges: string[];
  defaultIntegrityLevel: IntegrityLevel;
}

export interface RealityAccessToken {
  tokenId: string;
  userSid: string;
  username: string;
  groupSids: string[];
  privileges: string[];
  integrityLevel: IntegrityLevel;
  elevated: boolean;
  sessionId: number;
  issuedAtVirtualTime: number;
}

export interface RealityMachineSnapshot {
  id: string;
  hostname: string;
  domain: string;
  ipAddress: string;
  status: MachineStatus;
  isDomainJoined: boolean;
  processes: RealityProcessState[];
  sessions: RealitySessionState[];
  services: RealityServiceState[];
  files: RealityFileState[];
  registry: Record<string, any>;
  sockets: RealitySocketState[];
  eventLogs: RealityEventLogEntry[];
  lastUpdatedVirtualTime: number;
  users?: RealityUserModel[];
  tokens?: RealityAccessToken[];
}

export interface RealityEngineSnapshot {
  virtualTime: number;
  machines: Record<string, RealityMachineSnapshot>;
}
