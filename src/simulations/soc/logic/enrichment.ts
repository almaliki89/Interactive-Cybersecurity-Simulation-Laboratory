/**
 * OMEGA V11 — Contextual Telemetry Enrichment Engine
 * Enriches normalized events with synthetic asset criticality, user department, and network zone.
 * Fully deterministic - no Date.now, Math.random, or external APIs.
 */

import { SecurityTelemetryEvent } from './telemetry';

export interface UserContext {
  username: string;
  fullName: string;
  department: 'Finance' | 'IT_Engineering' | 'Executive' | 'Customer_Support' | 'External';
  isPrivileged: boolean;
  assignedHost: string;
}

export interface HostContext {
  hostname: string;
  role: 'Workstation' | 'Domain_Controller' | 'Application_Server' | 'Database_Server' | 'Jumpbox';
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  networkZone: 'INTERNAL_TRUSTED' | 'CORE_IDENTITY' | 'DMZ' | 'DATA_SECURE' | 'USER_LAN';
  ownerDepartment: string;
}

export interface ResourceContext {
  resourcePath: string;
  sensitivity: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL' | 'CRITICAL';
  businessPurpose: string;
}

export interface EnrichedTelemetryEvent extends SecurityTelemetryEvent {
  userDepartment?: string;
  userIsPrivileged?: boolean;
  userFullName?: string;
  hostRole?: string;
  assetCriticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  networkZone?: string;
  resourceSensitivity?: string;
}

/**
 * Synthetic Enterprise Context Directory
 */
export const ENTERPRISE_USERS: Record<string, UserContext> = {
  sara: {
    username: 'sara',
    fullName: 'Sara Al-Mansoor',
    department: 'Finance',
    isPrivileged: false,
    assignedHost: 'FIN-WS-01',
  },
  admin_alex: {
    username: 'admin_alex',
    fullName: 'Alex Chen (Domain Admin)',
    department: 'IT_Engineering',
    isPrivileged: true,
    assignedHost: 'ADMIN-JUMP-01',
  },
  alice: {
    username: 'alice',
    fullName: 'Alice Walker',
    department: 'Finance',
    isPrivileged: false,
    assignedHost: 'FIN-WS-02',
  },
  bob: {
    username: 'bob',
    fullName: 'Bob Smith',
    department: 'External',
    isPrivileged: false,
    assignedHost: 'EXT-CLIENT-99',
  },
  svc_backup: {
    username: 'svc_backup',
    fullName: 'Backup Service Principal',
    department: 'IT_Engineering',
    isPrivileged: true,
    assignedHost: 'DC-01',
  },
};

export const ENTERPRISE_HOSTS: Record<string, HostContext> = {
  'FIN-WS-01': {
    hostname: 'FIN-WS-01',
    role: 'Workstation',
    criticality: 'HIGH',
    networkZone: 'INTERNAL_TRUSTED',
    ownerDepartment: 'Finance',
  },
  'DC-01': {
    hostname: 'DC-01',
    role: 'Domain_Controller',
    criticality: 'CRITICAL',
    networkZone: 'CORE_IDENTITY',
    ownerDepartment: 'IT_Engineering',
  },
  'APP-SRV-01': {
    hostname: 'APP-SRV-01',
    role: 'Application_Server',
    criticality: 'HIGH',
    networkZone: 'DMZ',
    ownerDepartment: 'IT_Engineering',
  },
  'DB-SRV-01': {
    hostname: 'DB-SRV-01',
    role: 'Database_Server',
    criticality: 'CRITICAL',
    networkZone: 'DATA_SECURE',
    ownerDepartment: 'Finance',
  },
  'ADMIN-JUMP-01': {
    hostname: 'ADMIN-JUMP-01',
    role: 'Jumpbox',
    criticality: 'CRITICAL',
    networkZone: 'INTERNAL_TRUSTED',
    ownerDepartment: 'IT_Engineering',
  },
};

export const ENTERPRISE_RESOURCES: Record<string, ResourceContext> = {
  '\\\\FIN-SRV\\FinanceShare': {
    resourcePath: '\\\\FIN-SRV\\FinanceShare',
    sensitivity: 'CRITICAL',
    businessPurpose: 'Corporate Ledger & Wire Transfers',
  },
  '\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx': {
    resourcePath: '\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx',
    sensitivity: 'CONFIDENTIAL',
    businessPurpose: 'Executive Financial Summaries',
  },
  '/api/v1/orders/1001': {
    resourcePath: '/api/v1/orders/1001',
    sensitivity: 'RESTRICTED',
    businessPurpose: 'Customer Order Record',
  },
  '/api/v1/finance/reports': {
    resourcePath: '/api/v1/finance/reports',
    sensitivity: 'CRITICAL',
    businessPurpose: 'Real-time Financial Audit Ledger',
  },
};

/**
 * Enriches a normalized event with directory knowledge
 */
export function enrichTelemetryEvent(event: SecurityTelemetryEvent): EnrichedTelemetryEvent {
  const enriched: EnrichedTelemetryEvent = { ...event };

  if (event.user && ENTERPRISE_USERS[event.user.toLowerCase()]) {
    const u = ENTERPRISE_USERS[event.user.toLowerCase()];
    enriched.userDepartment = u.department;
    enriched.userIsPrivileged = u.isPrivileged;
    enriched.userFullName = u.fullName;
  }

  if (event.host && ENTERPRISE_HOSTS[event.host.toUpperCase()]) {
    const h = ENTERPRISE_HOSTS[event.host.toUpperCase()];
    enriched.hostRole = h.role;
    enriched.assetCriticality = h.criticality;
    enriched.networkZone = h.networkZone;
  }

  if (event.resource && ENTERPRISE_RESOURCES[event.resource]) {
    const r = ENTERPRISE_RESOURCES[event.resource];
    enriched.resourceSensitivity = r.sensitivity;
  }

  return enriched;
}

export function enrichBatchTelemetry(events: SecurityTelemetryEvent[]): EnrichedTelemetryEvent[] {
  return events.map(enrichTelemetryEvent);
}
