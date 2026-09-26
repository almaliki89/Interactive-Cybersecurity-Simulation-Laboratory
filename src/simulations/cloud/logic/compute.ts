/**
 * OMEGA V13 — Cloud Security World
 * logic/compute.ts
 *
 * Deterministic Cloud Compute Workloads (VMs, Containers, Serverless Functions).
 * Models instance profiles, security groups association, vulnerability state (SSRF),
 * and isolation response workflows.
 * Zero non-deterministic functions.
 */

import { ImdsConfig } from './workloadIdentity';

export type WorkloadType = 'VIRTUAL_MACHINE' | 'CONTAINER_TASK' | 'SERVERLESS_FUNCTION';

export interface ComputeVulnerability {
  id: string;
  type: 'SSRF' | 'COMMAND_INJECTION' | 'EXPOSED_DEBUGGER' | 'INSECURE_DESERIALIZATION';
  port: number;
  endpointPath: string;
  descriptionEn: string;
  descriptionAr: string;
  isPatched: boolean;
}

export interface CloudComputeInstance {
  id: string;
  name: string;
  accountId: string;
  region: string;
  subnetId: string;
  privateIp: string;
  publicIp?: string;
  workloadType: WorkloadType;
  instanceType: string; // e.g. 'nx.t3.medium'
  status: 'RUNNING' | 'STOPPED' | 'COMPROMISED' | 'ISOLATED';
  iamInstanceProfileRoleArn?: string;
  securityGroupIds: string[];
  imdsConfig: ImdsConfig;
  installedAgents: ('SECURITY_GUARD' | 'EDR' | 'LOG_FORWARDER')[];
  vulnerabilities: ComputeVulnerability[];
  tags: Record<string, string>;
  launchVirtualTime: number;
}

export function createDefaultComputeInstances(): CloudComputeInstance[] {
  return [
    {
      id: 'inst-web-prod-01',
      name: 'Nexora-Public-Web-Frontend',
      accountId: 'acc-prod-003',
      region: 'nx-east-1',
      subnetId: 'sub-public-web-1a',
      privateIp: '10.100.1.100',
      publicIp: '198.51.100.45',
      workloadType: 'VIRTUAL_MACHINE',
      instanceType: 'nx.t3.large',
      status: 'RUNNING',
      iamInstanceProfileRoleArn: 'ncrn:nexora:iam::acc-prod-003:role/NexoraAppWorkloadInstanceProfileRole',
      securityGroupIds: ['sg-prod-web-alb', 'sg-vulnerable-dev-open'], // Has vulnerable open SSH security group!
      imdsConfig: {
        version: 'v1',
        httpTokens: 'optional', // Vulnerable to SSRF token theft!
        httpPutResponseHopLimit: 2,
        httpEndpoint: 'enabled',
      },
      installedAgents: ['LOG_FORWARDER'],
      vulnerabilities: [
        {
          id: 'VULN-SSRF-01',
          type: 'SSRF',
          port: 8080,
          endpointPath: '/api/v1/preview?url=',
          descriptionEn: 'Server-Side Request Forgery (SSRF) flaw in URL preview feature allows querying localhost & IMDS 169.254.169.254.',
          descriptionAr: 'ثغرة SSRF في ميزة معاينة الروابط تسمح باستعلام المضيف المحلي وخدمة بيانات التعريف 169.254.169.254.',
          isPatched: false,
        },
      ],
      tags: { Environment: 'Production', Role: 'PublicFrontend' },
      launchVirtualTime: 0,
    },
    {
      id: 'inst-backend-app-01',
      name: 'Nexora-Backend-Core-Worker',
      accountId: 'acc-prod-003',
      region: 'nx-east-1',
      subnetId: 'sub-private-app-1a',
      privateIp: '10.100.10.45',
      workloadType: 'CONTAINER_TASK',
      instanceType: 'nx.c5.xlarge',
      status: 'RUNNING',
      iamInstanceProfileRoleArn: 'ncrn:nexora:iam::acc-prod-003:role/NexoraAppWorkloadInstanceProfileRole',
      securityGroupIds: ['sg-prod-app-workload'],
      imdsConfig: {
        version: 'v2',
        httpTokens: 'required',
        httpPutResponseHopLimit: 1,
        httpEndpoint: 'enabled',
      },
      installedAgents: ['SECURITY_GUARD', 'EDR', 'LOG_FORWARDER'],
      vulnerabilities: [],
      tags: { Environment: 'Production', Role: 'BackendWorker' },
      launchVirtualTime: 0,
    },
    {
      id: 'inst-db-postgres-01',
      name: 'Nexora-Master-Postgres-DB',
      accountId: 'acc-prod-003',
      region: 'nx-east-1',
      subnetId: 'sub-isolated-data-1a',
      privateIp: '10.100.20.15',
      workloadType: 'VIRTUAL_MACHINE',
      instanceType: 'nx.r5.2xlarge',
      status: 'RUNNING',
      securityGroupIds: ['sg-prod-db-tier'],
      imdsConfig: {
        version: 'v2',
        httpTokens: 'required',
        httpPutResponseHopLimit: 1,
        httpEndpoint: 'disabled', // Best practice: disabled on database servers
      },
      installedAgents: ['EDR', 'LOG_FORWARDER'],
      vulnerabilities: [],
      tags: { Environment: 'Production', Role: 'DatabaseMaster' },
      launchVirtualTime: 0,
    },
  ];
}

/**
 * Executes containment action on an instance: isolates network to quarantine SG and sets status to ISOLATED.
 */
export function isolateComputeInstance(instance: CloudComputeInstance): CloudComputeInstance {
  return {
    ...instance,
    status: 'ISOLATED',
    securityGroupIds: ['sg-isolated-quarantine-deny-all'],
  };
}

/**
 * Hardens an instance IMDS configuration to enforce IMDSv2 and hop limit 1.
 */
export function enforceImdsv2OnInstance(instance: CloudComputeInstance): CloudComputeInstance {
  return {
    ...instance,
    imdsConfig: {
      version: 'v2',
      httpTokens: 'required',
      httpPutResponseHopLimit: 1,
      httpEndpoint: 'enabled',
    },
  };
}
