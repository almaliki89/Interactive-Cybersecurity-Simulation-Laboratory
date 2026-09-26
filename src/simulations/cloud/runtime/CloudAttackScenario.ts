/**
 * OMEGA V13 — Cloud Security World
 * runtime/CloudAttackScenario.ts
 *
 * Schedules the multi-stage Nexora Cloud attack progression onto SimulationRuntime.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { ScheduledEvent } from '../../../engine/events/EventEngine';

export interface CloudScenarioConfig {
  startVirtualTime?: number;
  attackerIp?: string;
  targetInstanceId?: string;
  targetRoleName?: string;
  targetBucket?: string;
}

export function loadCloudAttackScenario(
  runtime: SimulationRuntime,
  config: CloudScenarioConfig = {}
): void {
  const startTime = config.startVirtualTime ?? 0;
  const attackerIp = config.attackerIp ?? '203.0.113.88';
  const instanceId = config.targetInstanceId ?? 'inst-web-prod-01';
  const roleName = config.targetRoleName ?? 'NexoraAppWorkloadInstanceProfileRole';
  const bucket = config.targetBucket ?? 'nexora-analytics-raw-bucket';

  const scheduledEvents: ScheduledEvent[] = [
    // 1. Initial Reconnaissance & SSRF Probe
    {
      at: startTime + 100,
      type: 'CLOUD_NETWORK_PROBE',
      source: attackerIp,
      target: instanceId,
      category: 'NETWORK',
      severity: 'info',
      description: `Inbound HTTP probe on port 8080 against ${instanceId} from ${attackerIp}`,
      payload: {
        method: 'GET',
        path: '/api/v1/preview',
        sourceIp: attackerIp,
        targetPort: 8080,
      },
    },

    // 2. SSRF Attack against IMDSv1
    {
      at: startTime + 250,
      type: 'CLOUD_SSRF_EXPLOIT',
      source: attackerIp,
      target: instanceId,
      category: 'APPSEC',
      severity: 'warn',
      description: `SSRF vulnerability exploited: request sent to internal IMDS http://169.254.169.254/latest/meta-data/`,
      payload: {
        url: 'http://169.254.169.254/latest/meta-data/',
        targetHost: '169.254.169.254',
        statusCode: 200,
      },
    },

    // 3. IMDSv1 Credential Theft (T1552.005)
    {
      at: startTime + 450,
      type: 'CLOUD_IMDS_CREDENTIAL_THEFT',
      source: attackerIp,
      target: '169.254.169.254',
      category: 'IDENTITY',
      severity: 'threat',
      description: `Temporary credentials harvested via IMDSv1 for role '${roleName}'`,
      payload: {
        roleName,
        accessKeyId: 'NXASIAVULNERABLEKEY01',
        tokenIssued: true,
        imdsVersion: 'v1',
      },
    },

    // 4. Cloud Storage Discovery (T1580)
    {
      at: startTime + 700,
      type: 'CLOUD_AUDIT_API_CALL',
      source: attackerIp,
      target: 'storage.nexora.com',
      category: 'CLOUD',
      severity: 'info',
      description: `API Call storage:ListBuckets executed using stolen session token`,
      payload: {
        eventName: 'ListBuckets',
        eventSource: 'storage.nexora.com',
        principalArn: `ncrn:nexora:iam::acc-prod-003:assumed-role/${roleName}/instance-session`,
        sourceIPAddress: attackerIp,
        discoveredBuckets: [bucket, 'nexora-finance-vault-prod'],
      },
    },

    // 5. Unauthorized Storage Object Enumeration
    {
      at: startTime + 950,
      type: 'CLOUD_AUDIT_API_CALL',
      source: attackerIp,
      target: bucket,
      category: 'CLOUD',
      severity: 'warn',
      description: `API Call storage:ListObjectsV2 on bucket '${bucket}'`,
      payload: {
        eventName: 'ListObjectsV2',
        eventSource: 'storage.nexora.com',
        bucketName: bucket,
        sourceIPAddress: attackerIp,
        matchedObjects: ['customers/export_pii_dump_2026.csv'],
      },
    },

    // 6. Mass Data Exfiltration from S3 (T1530)
    {
      at: startTime + 1200,
      type: 'CLOUD_DATA_EXFILTRATION',
      source: attackerIp,
      target: `${bucket}/customers/export_pii_dump_2026.csv`,
      category: 'CLOUD',
      severity: 'threat',
      description: `Mass download of 25.8MB customer PII dataset from unencrypted bucket '${bucket}'`,
      payload: {
        eventName: 'GetObject',
        bucketName: bucket,
        key: 'customers/export_pii_dump_2026.csv',
        bytesDownloaded: 25800000,
        sourceIPAddress: attackerIp,
      },
    },

    // 7. Lateral Privilege Escalation Attempt (AssumeRole)
    {
      at: startTime + 1450,
      type: 'CLOUD_AUDIT_API_CALL',
      source: attackerIp,
      target: 'iam.nexora.com',
      category: 'IDENTITY',
      severity: 'threat',
      description: `Attacker attempts sts:AssumeRole for 'ElevatedDevOpsRole' from external IP`,
      payload: {
        eventName: 'AssumeRole',
        eventSource: 'iam.nexora.com',
        roleArn: 'ncrn:nexora:iam::acc-prod-003:role/ElevatedDevOpsRole',
        sourceIPAddress: attackerIp,
      },
    },

    // 8. Defense Evasion: CloudTrail StopLogging Attempt (T1562.001)
    {
      at: startTime + 1700,
      type: 'CLOUD_AUDIT_API_CALL',
      source: attackerIp,
      target: 'audit.nexora.com',
      category: 'CLOUD',
      severity: 'threat',
      description: `Adversary invokes audit:StopLogging on 'Nexora-Global-Enterprise-Trail'`,
      payload: {
        eventName: 'StopLogging',
        eventSource: 'audit.nexora.com',
        name: 'Nexora-Global-Enterprise-Trail',
        sourceIPAddress: attackerIp,
      },
    },
  ];

  runtime.events.scheduleBatch(scheduledEvents);
}
