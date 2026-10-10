import { describe, it, expect, beforeEach } from 'vitest';
import { FirewallEngine } from '../reality/network/FirewallEngine';
import { FirewallRule } from '../reality/network/types';

describe('FirewallEngine Security & Model Validation Suite', () => {
  let fw: FirewallEngine;

  beforeEach(() => {
    fw = new FirewallEngine();
  });

  describe('IPv4 Address Validation & Malformed Input Handling', () => {
    it('validates well-formed IPv4 addresses correctly', () => {
      expect(fw.isValidIpv4('10.10.10.10')).toBe(true);
      expect(fw.isValidIpv4('0.0.0.0')).toBe(true);
      expect(fw.isValidIpv4('255.255.255.255')).toBe(true);
      expect(fw.isValidIpv4('192.168.1.1')).toBe(true);
      expect(fw.isValidIpv4('127.0.0.1')).toBe(true);
    });

    it('rejects malformed IP addresses with DROP-MALFORMED-IP', () => {
      const malformedCases = [
        '',
        '   ',
        'invalid',
        '10.10.10',
        '10.10.10.10.10',
        '256.0.0.1',
        '10.10.10.-1',
        '10.10.10.abc',
        '192.168.1.999',
        'undefined',
        'null',
      ];

      for (const badIp of malformedCases) {
        const evalRes = fw.evaluate({
          srcIp: badIp,
          dstIp: '10.10.10.10',
          protocol: 'TCP',
          dstPort: 445,
        });
        expect(evalRes.allowed).toBe(false);
        expect(evalRes.matchedRule.id).toBe('DROP-MALFORMED-IP');
      }

      for (const badIp of malformedCases) {
        const evalRes = fw.evaluate({
          srcIp: '10.10.30.15',
          dstIp: badIp,
          protocol: 'TCP',
          dstPort: 445,
        });
        expect(evalRes.allowed).toBe(false);
        expect(evalRes.matchedRule.id).toBe('DROP-MALFORMED-IP');
      }
    });

    it('does not allow identical malformed strings to bypass through same-address check', () => {
      const evalRes = fw.evaluate({
        srcIp: 'malformed_host',
        dstIp: 'malformed_host',
        protocol: 'TCP',
      });
      expect(evalRes.allowed).toBe(false);
      expect(evalRes.matchedRule.id).toBe('DROP-MALFORMED-IP');
    });
  });

  describe('Loopback and Same-Address Exceptions', () => {
    it('allows valid intra-host loopback (127.0.0.1) when not explicitly blocked', () => {
      const evalRes = fw.evaluate({
        srcIp: '127.0.0.1',
        dstIp: '127.0.0.1',
        protocol: 'TCP',
        dstPort: 8080,
      });
      expect(evalRes.allowed).toBe(true);
      expect(evalRes.matchedRule.id).toBe('IMPLICIT-LOCAL');
    });

    it('allows intra-host same-address packets when not explicitly blocked', () => {
      const evalRes = fw.evaluate({
        srcIp: '10.10.20.10',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 9000,
      });
      expect(evalRes.allowed).toBe(true);
      expect(evalRes.matchedRule.id).toBe('IMPLICIT-LOCAL');
    });

    it('enforces explicit DENY rules over loopback and same-address traffic', () => {
      // Add an explicit high-priority rule denying loopback traffic on port 8080
      const denyLoopbackRule: FirewallRule = {
        id: 'EXPLICIT-DENY-LOOPBACK-8080',
        name: 'Explicit Block on Loopback Port 8080',
        srcNetwork: '127.0.0.1',
        dstNetwork: '127.0.0.1',
        protocol: 'TCP',
        srcPort: 'ANY',
        dstPort: 8080,
        action: 'DENY',
        enabled: true,
      };
      fw.addRule(denyLoopbackRule, 'top');

      const evalRes = fw.evaluate({
        srcIp: '127.0.0.1',
        dstIp: '127.0.0.1',
        protocol: 'TCP',
        dstPort: 8080,
      });
      expect(evalRes.allowed).toBe(false);
      expect(evalRes.matchedRule.id).toBe('EXPLICIT-DENY-LOOPBACK-8080');

      // Unrelated loopback port should still fall through to IMPLICIT-LOCAL
      const evalOther = fw.evaluate({
        srcIp: '127.0.0.1',
        dstIp: '127.0.0.1',
        protocol: 'TCP',
        dstPort: 3000,
      });
      expect(evalOther.allowed).toBe(true);
      expect(evalOther.matchedRule.id).toBe('IMPLICIT-LOCAL');
    });
  });

  describe('Rule Ordering & Precedence (First-Match Wins)', () => {
    it('honors first-match rule order when multiple rules match the same traffic', () => {
      const rule1: FirewallRule = {
        id: 'TEST-ORDER-1',
        name: 'Deny 10.10.30.50 to 10.10.20.10:445',
        srcNetwork: '10.10.30.50',
        dstNetwork: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 445,
        action: 'DENY',
        enabled: true,
      };
      fw.addRule(rule1, 'top');

      // Even though FW-RULE-004 allows 10.10.30.0/24 to 10.10.20.10:445, top rule wins
      const resDeny = fw.evaluate({
        srcIp: '10.10.30.50',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 445,
      });
      expect(resDeny.allowed).toBe(false);
      expect(resDeny.matchedRule.id).toBe('TEST-ORDER-1');

      // Neighbor host on same subnet still matches FW-RULE-004
      const resNeighbor = fw.evaluate({
        srcIp: '10.10.30.51',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 445,
      });
      expect(resNeighbor.allowed).toBe(true);
      expect(resNeighbor.matchedRule.id).toBe('FW-RULE-004');
    });

    it('respects rule disable toggles without deleting rules', () => {
      fw.setRuleEnabled('FW-RULE-004', false);

      const res = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 445,
      });
      expect(res.allowed).toBe(false);
      expect(res.matchedRule.id).toBe('FW-RULE-DEFAULT-DENY');

      fw.setRuleEnabled('FW-RULE-004', true);
      const resRestored = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 445,
      });
      expect(resRestored.allowed).toBe(true);
      expect(resRestored.matchedRule.id).toBe('FW-RULE-004');
    });

    it('enforces Group Policy port blocks and subsequent unblock restoration', () => {
      // 1. Initial state allows SMB port 445 via FW-RULE-004
      const initialRes = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 445,
      });
      expect(initialRes.allowed).toBe(true);

      // 2. GPO blocks port 445
      fw.blockPort('TCP', 445, 'GPO Block SMB');
      expect(fw.isPortBlocked('TCP', 445)).toBe(true);

      const blockedRes = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 445,
      });
      expect(blockedRes.allowed).toBe(false);
      expect(blockedRes.matchedRule.id).toBe('FW-GPO-BLOCK-TCP-445');

      // GPO block rule also blocks same-address / loopback test on port 445
      const loopbackBlocked = fw.evaluate({
        srcIp: '127.0.0.1',
        dstIp: '127.0.0.1',
        protocol: 'TCP',
        dstPort: 445,
      });
      expect(loopbackBlocked.allowed).toBe(false);
      expect(loopbackBlocked.matchedRule.id).toBe('FW-GPO-BLOCK-TCP-445');

      // 3. Unblock restores access
      fw.unblockPort('TCP', 445);
      expect(fw.isPortBlocked('TCP', 445)).toBe(false);

      const restoredRes = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 445,
      });
      expect(restoredRes.allowed).toBe(true);
      expect(restoredRes.matchedRule.id).toBe('FW-RULE-004');
    });
  });

  describe('CIDR Boundaries & Prefix Matching', () => {
    it('matches CIDR /0 (any valid IP)', () => {
      expect(fw.matchesNetwork('10.10.10.10', '0.0.0.0/0')).toBe(true);
      expect(fw.matchesNetwork('192.168.1.1', '0.0.0.0/0')).toBe(true);
      expect(fw.matchesNetwork('invalid', '0.0.0.0/0')).toBe(false);
    });

    it('matches CIDR /32 (exact host match)', () => {
      expect(fw.matchesNetwork('10.10.10.10', '10.10.10.10/32')).toBe(true);
      expect(fw.matchesNetwork('10.10.10.11', '10.10.10.10/32')).toBe(false);
    });

    it('matches CIDR /24 network boundaries strictly', () => {
      expect(fw.matchesNetwork('10.10.30.0', '10.10.30.0/24')).toBe(true);
      expect(fw.matchesNetwork('10.10.30.1', '10.10.30.0/24')).toBe(true);
      expect(fw.matchesNetwork('10.10.30.254', '10.10.30.0/24')).toBe(true);
      expect(fw.matchesNetwork('10.10.30.255', '10.10.30.0/24')).toBe(true);
      expect(fw.matchesNetwork('10.10.31.0', '10.10.30.0/24')).toBe(false);
      expect(fw.matchesNetwork('10.10.29.255', '10.10.30.0/24')).toBe(false);
    });

    it('matches CIDR /16 and /30 boundaries strictly', () => {
      expect(fw.matchesNetwork('10.10.99.1', '10.10.0.0/16')).toBe(true);
      expect(fw.matchesNetwork('10.11.0.1', '10.10.0.0/16')).toBe(false);

      // /30: 192.168.1.4 to 192.168.1.7
      expect(fw.matchesNetwork('192.168.1.4', '192.168.1.4/30')).toBe(true);
      expect(fw.matchesNetwork('192.168.1.7', '192.168.1.4/30')).toBe(true);
      expect(fw.matchesNetwork('192.168.1.8', '192.168.1.4/30')).toBe(false);
    });

    it('safely rejects invalid or out-of-range CIDR prefixes', () => {
      expect(fw.matchesNetwork('10.10.10.10', '10.10.10.0/33')).toBe(false);
      expect(fw.matchesNetwork('10.10.10.10', '10.10.10.0/-1')).toBe(false);
      expect(fw.matchesNetwork('10.10.10.10', '10.10.10.0/invalid')).toBe(false);
    });
  });

  describe('Protocol and Port Filtering Strictness', () => {
    it('requires matching protocol when rule specifies a protocol', () => {
      // FW-RULE-001 is UDP 53
      const udpRes = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.10.10',
        protocol: 'UDP',
        dstPort: 53,
      });
      expect(udpRes.allowed).toBe(true);
      expect(udpRes.matchedRule.id).toBe('FW-RULE-001');

      // TCP 53 matches TCP fallback rule FW-RULE-002
      const tcpRes = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.10.10',
        protocol: 'TCP',
        dstPort: 53,
      });
      expect(tcpRes.allowed).toBe(true);
      expect(tcpRes.matchedRule.id).toBe('FW-RULE-002');

      // ICMP on port 53 does not match either
      const icmpRes = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.10.10',
        protocol: 'ICMP',
      });
      expect(icmpRes.allowed).toBe(true); // FW-RULE-005 allows internal ICMP
      expect(icmpRes.matchedRule.id).toBe('FW-RULE-005');
    });

    it('does not match port-specific rules when destination port is missing or mismatched', () => {
      // Packet without dstPort should NOT match FW-RULE-004 (which requires port 445)
      const noPortRes = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
      });
      expect(noPortRes.allowed).toBe(false);
      expect(noPortRes.matchedRule.id).toBe('FW-RULE-DEFAULT-DENY');

      // Wrong port (80 instead of 445)
      const wrongPortRes = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        dstPort: 80,
      });
      expect(wrongPortRes.allowed).toBe(false);
      expect(wrongPortRes.matchedRule.id).toBe('FW-RULE-DEFAULT-DENY');
    });

    it('matches sourcePort constraints when configured on rule', () => {
      const srcPortRule: FirewallRule = {
        id: 'TEST-SRC-PORT-RESTRICTION',
        name: 'Allow only source port 1024 to 80',
        srcNetwork: 'ANY',
        dstNetwork: 'ANY',
        protocol: 'TCP',
        srcPort: 1024,
        dstPort: 80,
        action: 'ALLOW',
        enabled: true,
      };
      fw.addRule(srcPortRule, 'top');

      // Matching source port
      const match = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        srcPort: 1024,
        dstPort: 80,
      });
      expect(match.allowed).toBe(true);
      expect(match.matchedRule.id).toBe('TEST-SRC-PORT-RESTRICTION');

      // Mismatched source port
      const mismatch = fw.evaluate({
        srcIp: '10.10.30.15',
        dstIp: '10.10.20.10',
        protocol: 'TCP',
        srcPort: 1025,
        dstPort: 80,
      });
      expect(mismatch.allowed).toBe(false);
      expect(mismatch.matchedRule.id).toBe('FW-RULE-DEFAULT-DENY');
    });
  });
});
