/**
 * OMEGA ULTRA REALITY V1.2 — Deterministic Firewall Rule Evaluator
 * Evaluates packet filter policies between network segments (WAN, DMZ, INTERNAL-SERVERS, WORKSTATIONS).
 */

import { FirewallRule, NetworkProtocol } from './types';

export class FirewallEngine {
  private rules: FirewallRule[] = [];

  constructor() {
    this.initDefaultRules();
  }

  private initDefaultRules(): void {
    this.rules = [
      {
        id: 'FW-RULE-001',
        name: 'Allow Workstations to DNS Server (Port 53)',
        srcNetwork: '10.10.30.0/24',
        dstNetwork: '10.10.10.10/32',
        protocol: 'UDP',
        srcPort: 'ANY',
        dstPort: 53,
        action: 'ALLOW',
        enabled: true,
      },
      {
        id: 'FW-RULE-002',
        name: 'Allow Workstations to DNS Server TCP (Port 53 fallback)',
        srcNetwork: '10.10.30.0/24',
        dstNetwork: '10.10.10.10/32',
        protocol: 'TCP',
        srcPort: 'ANY',
        dstPort: 53,
        action: 'ALLOW',
        enabled: true,
      },
      {
        id: 'FW-RULE-003',
        name: 'Allow Workstations to Active Directory Kerberos (Port 88)',
        srcNetwork: '10.10.30.0/24',
        dstNetwork: '10.10.10.10/32',
        protocol: 'TCP',
        srcPort: 'ANY',
        dstPort: 88,
        action: 'ALLOW',
        enabled: true,
      },
      {
        id: 'FW-RULE-004',
        name: 'Allow Workstations to SMB File Server (Port 445)',
        srcNetwork: '10.10.30.0/24',
        dstNetwork: '10.10.20.10/32',
        protocol: 'TCP',
        srcPort: 'ANY',
        dstPort: 445,
        action: 'ALLOW',
        enabled: true,
      },
      {
        id: 'FW-RULE-005',
        name: 'Allow Internal ICMP Ping Echo Request/Reply',
        srcNetwork: '10.10.0.0/16',
        dstNetwork: '10.10.0.0/16',
        protocol: 'ICMP',
        srcPort: 'ANY',
        dstPort: 'ANY',
        action: 'ALLOW',
        enabled: true,
      },
      {
        id: 'FW-RULE-006',
        name: 'Allow Management VLAN 10 to All Infrastructure',
        srcNetwork: '10.10.10.0/24',
        dstNetwork: 'ANY',
        protocol: 'ANY',
        srcPort: 'ANY',
        dstPort: 'ANY',
        action: 'ALLOW',
        enabled: true,
      },
      {
        id: 'FW-RULE-DEFAULT-DENY',
        name: 'Default Deny Intersite Cross-VLAN Traffic',
        srcNetwork: 'ANY',
        dstNetwork: 'ANY',
        protocol: 'ANY',
        srcPort: 'ANY',
        dstPort: 'ANY',
        action: 'DENY',
        enabled: true,
      },
    ];
  }

  public getRules(): FirewallRule[] {
    return [...this.rules];
  }

  public blockPort(protocol: NetworkProtocol, port: number, name = 'Group Policy Block'): void {
    const id = `FW-GPO-BLOCK-${protocol}-${port}`;
    const existing = this.rules.find((r) => r.id === id);
    if (existing) {
      existing.enabled = true;
    } else {
      // Unshift before default deny rule
      const blockRule: FirewallRule = {
        id,
        name,
        srcNetwork: 'ANY',
        dstNetwork: 'ANY',
        protocol,
        srcPort: 'ANY',
        dstPort: port,
        action: 'DENY',
        enabled: true,
      };
      this.rules.unshift(blockRule);
    }
  }

  public unblockPort(protocol: NetworkProtocol, port: number): void {
    const id = `FW-GPO-BLOCK-${protocol}-${port}`;
    const rule = this.rules.find((r) => r.id === id);
    if (rule) {
      rule.enabled = false;
    }
  }

  public isPortBlocked(protocol: NetworkProtocol, port: number): boolean {
    const id = `FW-GPO-BLOCK-${protocol}-${port}`;
    const rule = this.rules.find((r) => r.id === id);
    return rule ? rule.enabled : false;
  }

  public snapshot(): FirewallRule[] {
    return this.rules.map((r) => ({ ...r }));
  }

  public restore(rules: FirewallRule[]): void {
    this.rules = rules.map((r) => ({ ...r }));
  }

  public setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const r = this.rules.find((rule) => rule.id === ruleId);
    if (r) {
      r.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Evaluates if a packet or connection is permitted by firewall rules.
   */
  public evaluate(params: {
    srcIp: string;
    dstIp: string;
    protocol: NetworkProtocol;
    srcPort?: number;
    dstPort?: number;
  }): { allowed: boolean; matchedRule: FirewallRule } {
    // Traffic on the exact same subnet/link doesn't pass perimeter firewall
    if (params.srcIp === params.dstIp || params.srcIp === '127.0.0.1') {
      return {
        allowed: true,
        matchedRule: {
          id: 'IMPLICIT-LOCAL',
          name: 'Implicit Loopback/Local',
          srcNetwork: '127.0.0.1',
          dstNetwork: '127.0.0.1',
          protocol: 'ANY',
          action: 'ALLOW',
          enabled: true,
        },
      };
    }

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Protocol match
      if (rule.protocol !== 'ANY' && rule.protocol !== params.protocol) {
        continue;
      }

      // Port match
      if (rule.dstPort !== undefined && rule.dstPort !== 'ANY' && params.dstPort !== undefined) {
        if (rule.dstPort !== params.dstPort) {
          continue;
        }
      }

      // Source Network match
      if (!this.matchesNetwork(params.srcIp, rule.srcNetwork)) {
        continue;
      }

      // Destination Network match
      if (!this.matchesNetwork(params.dstIp, rule.dstNetwork)) {
        continue;
      }

      // Rule matched
      return {
        allowed: rule.action === 'ALLOW',
        matchedRule: rule,
      };
    }

    // Default deny fallback
    return {
      allowed: false,
      matchedRule: {
        id: 'IMPLICIT-DENY',
        name: 'Implicit Deny All',
        srcNetwork: 'ANY',
        dstNetwork: 'ANY',
        protocol: 'ANY',
        action: 'DENY',
        enabled: true,
      },
    };
  }

  private matchesNetwork(ip: string, networkPattern: string): boolean {
    if (networkPattern === 'ANY') return true;

    if (networkPattern.includes('/')) {
      const [netIp, prefixStr] = networkPattern.split('/');
      const prefix = parseInt(prefixStr, 10);
      const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;

      const ipNum = this.ipToNumber(ip);
      const netNum = this.ipToNumber(netIp);

      return (ipNum & mask) === (netNum & mask);
    }

    return ip === networkPattern;
  }

  private ipToNumber(ip: string): number {
    return ip
      .split('.')
      .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
  }
}
