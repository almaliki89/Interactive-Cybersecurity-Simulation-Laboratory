/**
 * OMEGA V12 — Network Evidence & Packet/Connection Forensics
 * Groups netflow telemetry, firewall drops, DNS queries, and TLS sessions for forensic analysis.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface NetworkForensicConnection {
  id: string;
  virtualTime: number;
  sourceIp: string;
  destinationIp: string;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'TLS' | 'DNS';
  action: 'ALLOW' | 'DENY' | 'DROP';
  bytesSent: number;
  host: string;
  isSuspicious: boolean;
  metadata: Record<string, unknown>;
}

export const SYNTHETIC_NETWORK_CONNECTIONS: NetworkForensicConnection[] = [
  {
    id: 'NET-CONN-001',
    virtualTime: 0,
    sourceIp: '203.0.113.55',
    destinationIp: '10.0.1.50',
    destinationPort: 3389,
    protocol: 'TCP',
    action: 'ALLOW',
    bytesSent: 1200,
    host: 'FIN-WS-01',
    isSuspicious: true,
    metadata: { service: 'RDP' },
  },
  {
    id: 'NET-CONN-002',
    virtualTime: 900,
    sourceIp: '10.0.1.50',
    destinationIp: '10.0.5.20',
    destinationPort: 5432,
    protocol: 'TCP',
    action: 'DENY',
    bytesSent: 64,
    host: 'FIN-WS-01',
    isSuspicious: true,
    metadata: { firewallRule: 'ACL-DENY-DEFAULT', probeType: 'PostgreSQL Port Scan' },
  },
  {
    id: 'NET-CONN-003',
    virtualTime: 950,
    sourceIp: '10.0.1.50',
    destinationIp: '10.0.5.20',
    destinationPort: 3306,
    protocol: 'TCP',
    action: 'DENY',
    bytesSent: 64,
    host: 'FIN-WS-01',
    isSuspicious: true,
    metadata: { firewallRule: 'ACL-DENY-DEFAULT', probeType: 'MySQL Port Scan' },
  },
  {
    id: 'NET-CONN-004',
    virtualTime: 1000,
    sourceIp: '10.0.1.50',
    destinationIp: '10.0.5.20',
    destinationPort: 1433,
    protocol: 'TCP',
    action: 'DENY',
    bytesSent: 64,
    host: 'FIN-WS-01',
    isSuspicious: true,
    metadata: { firewallRule: 'ACL-DENY-DEFAULT', probeType: 'MSSQL Port Scan' },
  },
];

export function extractConnectionTimeline(
  connections = SYNTHETIC_NETWORK_CONNECTIONS
): NetworkForensicConnection[] {
  return [...connections].sort((a, b) => a.virtualTime - b.virtualTime);
}

export function groupConnectionsByHost(
  connections = SYNTHETIC_NETWORK_CONNECTIONS
): Record<string, NetworkForensicConnection[]> {
  const map: Record<string, NetworkForensicConnection[]> = {};
  connections.forEach((conn) => {
    if (!map[conn.host]) map[conn.host] = [];
    map[conn.host].push(conn);
  });
  return map;
}

export function identifyDeniedConnectionBursts(
  connections = SYNTHETIC_NETWORK_CONNECTIONS
): NetworkForensicConnection[] {
  return connections.filter((c) => c.action === 'DENY' || c.action === 'DROP');
}
