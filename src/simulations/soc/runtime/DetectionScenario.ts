/**
 * OMEGA V11 — Multi-Stage SOC Detection Scenario
 * Schedules the Nexora Enterprise attack progression onto the SimulationRuntime.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { ScheduledEvent } from '../../../engine/events/EventEngine';
import { SecurityTelemetryEvent } from '../logic/telemetry';

export interface SocScenarioConfig {
  startVirtualTime?: number;
  stepIntervalMs?: number;
  targetUser?: string;
  targetHost?: string;
  attackerIp?: string;
}

/**
 * Loads and schedules the full Nexora Enterprise attack scenario
 */
export function loadSocDetectionScenario(
  runtime: SimulationRuntime,
  config: SocScenarioConfig = {}
): SecurityTelemetryEvent[] {
  const startTime = config.startVirtualTime ?? 0;
  const user = config.targetUser ?? 'sara';
  const host = config.targetHost ?? 'FIN-WS-01';
  const ip = config.attackerIp ?? '203.0.113.55';

  const scheduledEvents: ScheduledEvent[] = [
    // 1. Five Failed Login Attempts (Brute Force)
    {
      at: startTime + 0,
      type: 'WINDOWS_LOGIN_FAILED',
      source: ip,
      target: host,
      category: 'WINDOWS',
      severity: 'warn',
      description: `Failed logon attempt 1 for user '${user}' on '${host}'`,
      payload: { eventId: '4625', user, host, sourceIp: ip, failureReason: 'BadPassword' },
    },
    {
      at: startTime + 50,
      type: 'WINDOWS_LOGIN_FAILED',
      source: ip,
      target: host,
      category: 'WINDOWS',
      severity: 'warn',
      description: `Failed logon attempt 2 for user '${user}' on '${host}'`,
      payload: { eventId: '4625', user, host, sourceIp: ip, failureReason: 'BadPassword' },
    },
    {
      at: startTime + 100,
      type: 'KERBEROS_AUTH_FAILED',
      source: ip,
      target: 'DC-01',
      category: 'IDENTITY',
      severity: 'warn',
      description: `Kerberos AS-REQ pre-auth failed for principal '${user}@CORP.NEXORA.LOCAL'`,
      payload: { user, clientPrincipal: `${user}@CORP.NEXORA.LOCAL`, host: 'DC-01', sourceIp: ip },
    },
    {
      at: startTime + 150,
      type: 'WINDOWS_LOGIN_FAILED',
      source: ip,
      target: host,
      category: 'WINDOWS',
      severity: 'warn',
      description: `Failed logon attempt 4 for user '${user}' on '${host}'`,
      payload: { eventId: '4625', user, host, sourceIp: ip, failureReason: 'BadPassword' },
    },
    {
      at: startTime + 200,
      type: 'WINDOWS_LOGIN_FAILED',
      source: ip,
      target: host,
      category: 'WINDOWS',
      severity: 'warn',
      description: `Failed logon attempt 5 for user '${user}' on '${host}'`,
      payload: { eventId: '4625', user, host, sourceIp: ip, failureReason: 'BadPassword' },
    },

    // 2. Successful Authentication (Credential Compromise)
    {
      at: startTime + 350,
      type: 'KERBEROS_AUTH_SUCCESS',
      source: ip,
      target: 'DC-01',
      category: 'IDENTITY',
      severity: 'info',
      description: `Successful Kerberos logon for user '${user}' on '${host}' after multiple failures`,
      payload: { user, workstation: host, realm: 'CORP.NEXORA.LOCAL', sourceIp: ip },
    },

    // 3. Privileged Group Membership Modification (Escalation)
    {
      at: startTime + 550,
      type: 'PRIVILEGED_GROUP_CHANGED',
      source: host,
      target: 'DC-01',
      category: 'IDENTITY',
      severity: 'threat',
      description: `User '${user}' added to privileged Active Directory group 'Domain Admins'`,
      payload: { user, targetGroup: 'Domain Admins', eventId: '4728', host: 'DC-01' },
    },

    // 4. Endpoint Child Process Spawning
    {
      at: startTime + 750,
      type: 'PROCESS_CREATION',
      source: host,
      target: host,
      category: 'WINDOWS',
      severity: 'threat',
      description: `Anomalous process 'cmd.exe /c whoami /priv' spawned on '${host}' by '${user}'`,
      payload: { eventId: '4688', user, host, process: 'cmd.exe', parentProcess: 'svchost.exe', suspicious: true },
    },

    // 5. Network Port Scan / Denied Probe
    {
      at: startTime + 900,
      type: 'PACKET_BLOCKED',
      source: '10.0.1.50',
      target: '10.0.5.20',
      category: 'NETWORK',
      severity: 'warn',
      description: `Firewall ACL blocked connection from '${host}' (10.0.1.50) to DB Server (10.0.5.20:5432)`,
      payload: { sourceIp: '10.0.1.50', destinationIp: '10.0.5.20', destinationPort: 5432, ruleId: 'ACL-DENY-DEFAULT' },
    },
    {
      at: startTime + 950,
      type: 'PACKET_BLOCKED',
      source: '10.0.1.50',
      target: '10.0.5.20',
      category: 'NETWORK',
      severity: 'warn',
      description: `Firewall ACL blocked second connection to DB Server (10.0.5.20:3306)`,
      payload: { sourceIp: '10.0.1.50', destinationIp: '10.0.5.20', destinationPort: 3306, ruleId: 'ACL-DENY-DEFAULT' },
    },
    {
      at: startTime + 1000,
      type: 'PACKET_BLOCKED',
      source: '10.0.1.50',
      target: '10.0.5.20',
      category: 'NETWORK',
      severity: 'warn',
      description: `Firewall ACL blocked third connection to DB Server (10.0.5.20:1433)`,
      payload: { sourceIp: '10.0.1.50', destinationIp: '10.0.5.20', destinationPort: 1433, ruleId: 'ACL-DENY-DEFAULT' },
    },

    // 6. Access to Confidential Financial Ledger
    {
      at: startTime + 1150,
      type: 'SENSITIVE_RESOURCE_ACCESS',
      source: host,
      target: 'FIN-SRV',
      category: 'IDENTITY',
      severity: 'threat',
      description: `User '${user}' accessed confidential financial file '\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx'`,
      payload: { user, host, resource: '\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx', allowed: true },
    },

    // 7. AppSec BOLA / IDOR Violation
    {
      at: startTime + 1350,
      type: 'APP_ACCESS_DENIED',
      source: host,
      target: 'APP-SRV-01',
      category: 'APPSEC',
      severity: 'threat',
      description: `BOLA Violation: User '${user}' attempted unauthorized read of endpoint '/api/v1/finance/reports'`,
      payload: { userId: user, username: user, endpoint: '/api/v1/finance/reports', statusCode: 403, httpMethod: 'GET', host: 'APP-SRV-01' },
    },

    // 8. Attempted Security Logging Tamper
    {
      at: startTime + 1550,
      type: 'WIN_LOG_CLEARED',
      source: host,
      target: host,
      category: 'WINDOWS',
      severity: 'threat',
      description: `Security Event Log was cleared on host '${host}' (Event 1102)`,
      payload: { eventId: '1102', user, host },
    },
  ];

  runtime.events.scheduleBatch(scheduledEvents);
  return [];
}
