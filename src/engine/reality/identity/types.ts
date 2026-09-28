/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory & Kerberos Identity Types
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

export type DirectoryObjectType = 'DOMAIN' | 'OU' | 'USER' | 'GROUP' | 'COMPUTER' | 'SERVICE_ACCOUNT';

export interface DirectoryUser {
  id: string;
  sid: string;
  samAccountName: string;
  upn: string;
  displayName: string;
  enabled: boolean;
  passwordState: 'Valid' | 'Expired' | 'Locked';
  passwordLastSetVirtualTime: number;
  groups: string[]; // SIDs or Group Names
  primaryGroup: string; // Group SID or Name
  userAccountControl: number; // UAC flags e.g. 512 NORMAL_ACCOUNT
  logonRestrictions?: {
    allowedWorkstations?: string[];
    allowedHours?: Record<string, boolean>;
  };
  lastLogonVirtualTime: number;
  ou: string; // Distinguished Name e.g. 'OU=Finance,DC=NEXORA,DC=LOCAL'
  credentialVerifierHash: string; // Deterministic secret verifier
  defaultIntegrityLevel: 'Low' | 'Medium' | 'High' | 'System';
  privileges: string[];
}

export interface DirectoryComputer {
  id: string;
  sid: string;
  hostname: string; // e.g. 'FIN-WS01'
  domain: string; // 'NEXORA.LOCAL'
  enabled: boolean;
  machineAccountName: string; // e.g. 'FIN-WS01$'
  osType: string; // e.g. 'Windows 11 Enterprise'
  joinedAtVirtualTime: number;
  ou: string;
  secureChannelState: 'HEALTHY' | 'BROKEN_TRUST';
  ipAddress: string;
}

export interface DirectoryGroup {
  id: string;
  sid: string;
  name: string;
  type: 'Security' | 'Distribution';
  scope: 'DomainLocal' | 'Global' | 'Universal';
  members: string[]; // User, Group, or Computer SIDs/Names
  ou: string;
  description?: string;
}

export interface DirectoryOU {
  dn: string;
  name: string;
  parentDn: string | null;
  description: string;
}

export interface DirectoryServiceAccount {
  id: string;
  sid: string;
  samAccountName: string;
  displayName: string;
  spns: string[];
  enabled: boolean;
  ou: string;
}

export interface SpnMapping {
  spn: string; // e.g. 'cifs/FILE01'
  targetAccountSid: string;
  targetAccountName: string; // e.g. 'FILE01$'
  serviceType: string; // e.g. 'cifs', 'host', 'ldap', 'http'
  hostname: string;
}

export type TicketType = 'TGT' | 'TGS';
export type TicketStatus = 'VALID' | 'EXPIRED' | 'PURGED';

export interface KerberosTicket {
  ticketId: string;
  ticketType: TicketType;
  clientPrincipal: string; // e.g. 'sara.finance@NEXORA.LOCAL'
  clientSid: string;
  servicePrincipal: string; // e.g. 'krbtgt/NEXORA.LOCAL' or 'cifs/FILE01'
  domain: string;
  issuedAtVirtualTime: number;
  expiresAtVirtualTime: number;
  renewUntilVirtualTime: number;
  sessionKeyId: string;
  flags: string[]; // ['FORWARDABLE', 'RENEWABLE', 'INITIAL', 'PRE_AUTHENT']
  kdc: string; // 'DC01'
  status: TicketStatus;
}

export type AceType = 'ALLOW' | 'DENY';
export type AccessRight = 'READ' | 'WRITE' | 'MODIFY' | 'FULL_CONTROL';

export interface AccessControlEntry {
  type: AceType;
  principalSid: string; // User or Group SID
  rights: AccessRight[];
}

export interface AccessControlList {
  objectPath: string;
  ownerSid: string;
  entries: AccessControlEntry[];
}

export type DomainLogonFailureReason =
  | 'DOMAIN_CONTROLLER_UNREACHABLE'
  | 'PHYSICAL_PATH_UNAVAILABLE'
  | 'DNS_FAILURE'
  | 'ACCOUNT_NOT_FOUND'
  | 'ACCOUNT_DISABLED'
  | 'BAD_PASSWORD'
  | 'LOGON_RESTRICTION'
  | 'KERBEROS_PREAUTH_FAILED'
  | 'SECURE_CHANNEL_BROKEN'
  | 'NO_CACHED_CREDENTIALS';

export interface DomainLogonResult {
  success: boolean;
  userPrincipal: string;
  userSid?: string;
  domain: string;
  workstation: string;
  failureReason?: DomainLogonFailureReason;
  tgt?: KerberosTicket;
  sessionId?: number;
  tokenId?: string;
  groupSids?: string[];
  issuedAtVirtualTime: number;
}

export interface ServiceAccessResult {
  success: boolean;
  serviceSpn: string;
  targetHost: string;
  userPrincipal: string;
  userSid: string;
  ticketUsed?: KerberosTicket;
  grantedRights: AccessRight[];
  failureReason?: 'SPN_NOT_FOUND' | 'DOMAIN_CONTROLLER_UNREACHABLE' | 'TGT_EXPIRED' | 'NO_TGT' | 'ACCESS_DENIED' | 'SERVICE_UNAVAILABLE';
  aclDecision?: 'ACL_ALLOW' | 'ACL_DENY';
}

export interface ActiveDirectorySnapshot {
  domain: string;
  netbios: string;
  ous: DirectoryOU[];
  users: DirectoryUser[];
  groups: DirectoryGroup[];
  computers: DirectoryComputer[];
  serviceAccounts: DirectoryServiceAccount[];
  spns: SpnMapping[];
  ticketCaches: Record<string, KerberosTicket[]>; // sessionId -> tickets
  acls: Record<string, AccessControlList>; // resource -> ACL
  stats: {
    failedAuthCount: number;
    activeTicketCount: number;
    totalLogonCount: number;
    directoryQueryCount: number;
  };
}
