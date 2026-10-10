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
        id: 'FW-RULE-001-SRV',
        name: 'Allow Internal Servers to DNS Server (Port 53)',
        srcNetwork: '10.10.20.0/24',
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
        id: 'FW-RULE-002-SRV',
        name: 'Allow Internal Servers to DNS Server TCP (Port 53 fallback)',
        srcNetwork: '10.10.20.0/24',
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
        id: 'FW-RULE-003-SRV',
        name: 'Allow Internal Servers to Active Directory Kerberos (Port 88)',
        srcNetwork: '10.10.20.0/24',
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

  public addRule(rule: FirewallRule, position: 'top' | 'bottom' | 'before-default' = 'before-default'): void {
    const existingIndex = this.rules.findIndex((r) => r.id === rule.id);
    if (existingIndex >= 0) {
      this.rules[existingIndex] = { ...rule };
      return;
    }

    if (position === 'top') {
      this.rules.unshift(rule);
    } else if (position === 'bottom') {
      this.rules.push(rule);
    } else {
      const defaultIndex = this.rules.findIndex((r) => r.id === 'FW-RULE-DEFAULT-DENY');
      if (defaultIndex >= 0) {
        this.rules.splice(defaultIndex, 0, rule);
      } else {
        this.rules.push(rule);
      }
    }
  }

  public removeRule(ruleId: string): boolean {
    const idx = this.rules.findIndex((r) => r.id === ruleId);
    if (idx >= 0) {
      this.rules.splice(idx, 1);
      return true;
    }
    return false;
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
      // Unshift at the very top for priority explicit deny enforcement
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
   * Validates if a string is a well-formed IPv4 address (0.0.0.0 to 255.255.255.255).
   */
  public isValidIpv4(ip: string): boolean {
    if (!ip || typeof ip !== 'string') return false;
    const trimmed = ip.trim();
    const parts = trimmed.split('.');
    if (parts.length !== 4) return false;
    return parts.every((p) => {
      if (!/^\d+$/.test(p)) return false;
      const num = parseInt(p, 10);
      return num >= 0 && num <= 255;
    });
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
    // 1. Strict IP Header Validation (drop malformed IP packets)
    if (!this.isValidIpv4(params.srcIp) || !this.isValidIpv4(params.dstIp)) {
      return {
        allowed: false,
        matchedRule: {
          id: 'DROP-MALFORMED-IP',
          name: 'Drop Malformed IP Address',
          srcNetwork: 'ANY',
          dstNetwork: 'ANY',
          protocol: 'ANY',
          action: 'DENY',
          enabled: true,
        },
      };
    }

    const isLocalTraffic =
      params.srcIp === params.dstIp ||
      params.srcIp.startsWith('127.') ||
      params.dstIp.startsWith('127.');

    // 2. Sequential Rule Evaluation (First-Match Wins)
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // When encountering the catch-all inter-VLAN default deny, local/loopback traffic
      // that was not explicitly denied by a prior rule is allowed via implicit loopback bypass.
      if (rule.id === 'FW-RULE-DEFAULT-DENY' && isLocalTraffic) {
        return {
          allowed: true,
          matchedRule: {
            id: 'IMPLICIT-LOCAL',
            name: 'Implicit Loopback/Local Link',
            srcNetwork: '127.0.0.1',
            dstNetwork: '127.0.0.1',
            protocol: 'ANY',
            action: 'ALLOW',
            enabled: true,
          },
        };
      }

      // Protocol match
      if (rule.protocol !== 'ANY' && rule.protocol !== params.protocol) {
        continue;
      }

      // Destination Port match
      if (rule.dstPort !== undefined && rule.dstPort !== 'ANY') {
        if (params.dstPort === undefined || rule.dstPort !== params.dstPort) {
          continue;
        }
      }

      // Source Port match
      if (rule.srcPort !== undefined && rule.srcPort !== 'ANY') {
        if (params.srcPort === undefined || rule.srcPort !== params.srcPort) {
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

    // 3. Fallback for unhandled local traffic
    if (isLocalTraffic) {
      return {
        allowed: true,
        matchedRule: {
          id: 'IMPLICIT-LOCAL',
          name: 'Implicit Loopback/Local Link',
          srcNetwork: '127.0.0.1',
          dstNetwork: '127.0.0.1',
          protocol: 'ANY',
          action: 'ALLOW',
          enabled: true,
        },
      };
    }

    // 4. Default deny fallback
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

  public matchesNetwork(ip: string, networkPattern: string): boolean {
    if (networkPattern === 'ANY') return true;
    if (!this.isValidIpv4(ip)) return false;

    if (networkPattern.includes('/')) {
      const [netIp, prefixStr] = networkPattern.split('/');
      if (!this.isValidIpv4(netIp)) return false;
      const prefix = parseInt(prefixStr, 10);
      if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;
      if (prefix === 0) return true; // 0.0.0.0/0 matches any valid IPv4 address

      const mask = (~0 << (32 - prefix)) >>> 0;
      const ipNum = this.ipToNumber(ip);
      const netNum = this.ipToNumber(netIp);

      return (ipNum & mask) === (netNum & mask);
    }

    if (!this.isValidIpv4(networkPattern)) return false;
    return ip === networkPattern;
  }

  private ipToNumber(ip: string): number {
    return ip
      .split('.')
      .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
  }
}
