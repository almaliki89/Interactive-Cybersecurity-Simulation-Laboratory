import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluatePacketTransmission,
  validateSubnetRoutingChallengeState,
  SubnetRoutingChallengeConfig,
} from '../../utils/networkUtils';
import {
  registerChallengeValidator,
  unregisterChallengeValidator,
  useSimulationStore,
  clearChallengeValidators,
} from '../../stores/simulationStore';

describe('Reference Network Laboratory — Comprehensive Remediation & Coverage Suite (24 Mandatory Cases)', () => {
  beforeEach(() => {
    clearChallengeValidators();
    useSimulationStore.setState({
      activeSimulationId: 'subnet_routing',
      completedChallenges: [],
    });
  });

  describe('Phase 2: Firewall Policy & Protocol ACL Rules (Cases 1-4)', () => {
    it('1. TCP/80 with block_http policy blocks packet egress and fails challenge', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 80,
        protocol: 'TCP',
        firewallPolicy: 'block_http',
      });

      expect(val.transmissionResult.status).toBe('firewall_blocked');
      expect(val.transmissionResult.packetState).toBe('blocked');
      expect(val.transmissionResult.failureHop).toBe('firewall');
      expect(val.success).toBe(false);
      expect(val.checks.transmissionSuccess).toBe(false);
    });

    it('2. UDP/80 with block_http policy blocks packet egress on port 80', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 80,
        protocol: 'UDP',
        firewallPolicy: 'block_http',
      });

      expect(res.status).toBe('firewall_blocked');
      expect(res.packetState).toBe('blocked');
      expect(res.failureHop).toBe('firewall');
      expect(res.allLogs.some((l) => l.includes('DENY UDP Port 80'))).toBe(true);
    });

    it('3. TCP/443 with strict_https policy passes transmission and succeeds challenge', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 443,
        protocol: 'TCP',
        firewallPolicy: 'strict_https',
      });

      expect(val.transmissionResult.status).toBe('success');
      expect(val.transmissionResult.packetState).toBe('success');
      expect(val.transmissionResult.failureHop).toBeNull();
      expect(val.success).toBe(true);
      expect(val.checks.transmissionSuccess).toBe(true);
      expect(val.transmissionResult.allLogs.some((l) => l.includes('TLS 1.3 Handshake Completed'))).toBe(true);
    });

    it('4. TCP/443 with drop_all policy drops packet at firewall', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 443,
        protocol: 'TCP',
        firewallPolicy: 'drop_all',
      });

      expect(res.status).toBe('firewall_blocked');
      expect(res.packetState).toBe('blocked');
      expect(res.failureHop).toBe('firewall');
    });
  });

  describe('Phase 2 & 4: Service Model Response & Protocol Accuracy (Cases 5-8)', () => {
    it('5. TCP/22 SSH service returns SSH banner exchange without fake HTTP messages', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 22,
        protocol: 'TCP',
      });

      expect(res.status).toBe('success');
      expect(res.allLogs.some((l) => l.includes('SSHv2 Banner Exchanged (OpenSSH 8.9p1)'))).toBe(true);
      expect(res.allLogs.some((l) => l.includes('HTTP 200 OK'))).toBe(false);
    });

    it('6. UDP/53 DNS service returns DNS resolution without fake TCP 3-Way Handshake', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 53,
        protocol: 'UDP',
      });

      expect(res.status).toBe('success');
      expect(res.allLogs.some((l) => l.includes('Crafting UDP Datagram'))).toBe(true);
      expect(res.allLogs.some((l) => l.includes('DNS Query Resolved (A Record'))).toBe(true);
      expect(res.allLogs.some((l) => l.includes('3-Way Handshake'))).toBe(false);
    });

    it('7. TCP/53 DNS service handles TCP-encapsulated DNS query', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 53,
        protocol: 'TCP',
      });

      expect(res.status).toBe('success');
      expect(res.allLogs.some((l) => l.includes('DNS Query Resolved over TCP'))).toBe(true);
    });

    it('8. ICMP Echo Request returns Echo Reply without port numbers or TCP/HTTP logs', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        protocol: 'ICMP',
      });

      expect(res.status).toBe('success');
      expect(res.allLogs.some((l) => l.includes('ICMP Echo Reply Received'))).toBe(true);
      expect(res.allLogs.some((l) => l.includes('3-Way Handshake'))).toBe(false);
      expect(res.allLogs.some((l) => l.includes('HTTP'))).toBe(false);
      const serverTrace = res.hopTraces?.find((h) => h.nodeName === 'WAN Remote Server');
      expect(serverTrace?.nodeIp).toBe('93.184.216.34'); // No :port suffix
    });
  });

  describe('Phase 2 & 3: Closed Ports, Unreachable Services & Input Validation (Cases 9-18)', () => {
    it('9. TCP to closed port (e.g. 9999) returns port_unreachable and TCP RST log', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 9999,
        protocol: 'TCP',
      });

      expect(res.status).toBe('port_unreachable');
      expect(res.packetState).toBe('blocked');
      expect(res.failureHop).toBe('service');
      expect(res.allLogs.some((l) => l.includes('Connection Refused (TCP RST'))).toBe(true);
    });

    it('10. UDP to closed port (e.g. 9999) returns port_unreachable and ICMP Port Unreachable (Type 3 Code 3) log', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 9999,
        protocol: 'UDP',
      });

      expect(res.status).toBe('port_unreachable');
      expect(res.packetState).toBe('blocked');
      expect(res.failureHop).toBe('service');
      expect(res.allLogs.some((l) => l.includes('ICMP Destination Unreachable (Type 3 Code 3: Port Unreachable)'))).toBe(true);
      expect(res.allLogs.some((l) => l.includes('TCP RST'))).toBe(false);
    });

    it('11. Port number 0 is rejected during input validation', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 0,
        protocol: 'TCP',
      });

      expect(res.validInputs).toBe(false);
      expect(res.status).toBe('invalid_ip');
      expect(res.packetState).toBe('blocked');
    });

    it('12. Port number 65536 is rejected during input validation', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 65536,
        protocol: 'TCP',
      });

      expect(res.validInputs).toBe(false);
      expect(res.status).toBe('invalid_ip');
    });

    it('13. Port number 70000 is rejected during input validation', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 70000,
        protocol: 'TCP',
      });

      expect(res.validInputs).toBe(false);
      expect(res.status).toBe('invalid_ip');
    });

    it('14. Fractional CIDR prefix (24.5) is rejected during input validation', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 24.5 as any,
        natEnabled: true,
      });

      expect(res.validInputs).toBe(false);
      expect(res.status).toBe('invalid_ip');
    });

    it('15. Out of bounds CIDR prefix (-1 or 33) is rejected during input validation', () => {
      const res1 = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: -1,
        natEnabled: true,
      });
      const res2 = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 33,
        natEnabled: true,
      });

      expect(res1.validInputs).toBe(false);
      expect(res2.validInputs).toBe(false);
    });

    it('16. Invalid IPv4 address syntax is rejected during input validation', () => {
      const res = evaluatePacketTransmission({
        hostIp: '999.999.999.999',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
      });

      expect(res.validInputs).toBe(false);
      expect(res.status).toBe('invalid_ip');
    });

    it('17. Unsupported protocol is rejected during input validation', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        protocol: 'SCTP' as any,
      });

      expect(res.validInputs).toBe(false);
      expect(res.status).toBe('invalid_ip');
    });

    it('18. Unsupported firewall policy is rejected during input validation', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        firewallPolicy: 'unknown_policy' as any,
      });

      expect(res.validInputs).toBe(false);
      expect(res.status).toBe('invalid_ip');
    });
  });

  describe('Phase 4 & 5: Topology, Alignment & State Integrity (Cases 19-24)', () => {
    it('19. Subnet mismatch (/27) drops packet at router hop and returns subnet_mismatch', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 27,
        natEnabled: true,
      });

      expect(val.transmissionResult.status).toBe('subnet_mismatch');
      expect(val.transmissionResult.failureHop).toBe('router');
      expect(val.success).toBe(false);
    });

    it('20. Disabled NAT Gateway drops packet at NAT hop and returns nat_disabled', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: false,
      });

      expect(val.transmissionResult.status).toBe('nat_disabled');
      expect(val.transmissionResult.failureHop).toBe('nat');
      expect(val.success).toBe(false);
    });

    it('21. Strict alignment between status, packetState, failureHop, and hopTraces', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: false,
      });

      expect(val.transmissionResult.status).toBe('nat_disabled');
      expect(val.transmissionResult.packetState).toBe('blocked');
      expect(val.transmissionResult.failureHop).toBe('nat');
      expect(val.transmissionResult.hopTraces?.find((h) => h.status === 'dropped')?.nodeName).toBe('NAT Gateway');
    });

    it('22. validateSubnetRoutingChallengeState enforces exact agreement with evaluatePacketTransmission', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 443,
        protocol: 'TCP',
        firewallPolicy: 'allow_all',
      });

      expect(val.success).toBe(true);
      expect(val.checks.transmissionSuccess).toBe(true);
      expect(val.transmissionResult.status).toBe('success');
    });

    it('23. Setting changes post-success prevent stale validator exploitation in Zustand store', () => {
      let config: SubnetRoutingChallengeConfig = {
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 443,
        protocol: 'TCP',
        firewallPolicy: 'allow_all',
      };

      registerChallengeValidator('subnet-routing-challenge', () => {
        const val = validateSubnetRoutingChallengeState(config);
        return { success: val.success, score: val.score, details: val };
      });

      const store = useSimulationStore.getState();

      // Valid configuration completes challenge
      store.completeChallenge('subnet-routing-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).toContain('subnet-routing-challenge');

      // Change setting to invalid (strict_https with port 80)
      config.destPort = 80;
      config.firewallPolicy = 'strict_https';

      // Clear completion record
      useSimulationStore.setState({ completedChallenges: [] });

      // Re-evaluating fails because validator checks live state
      store.completeChallenge('subnet-routing-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('subnet-routing-challenge');

      unregisterChallengeValidator('subnet-routing-challenge');
    });

    it('24. Total absence of TCP or HTTP messages in UDP or ICMP simulation traces', () => {
      const udpRes = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 53,
        protocol: 'UDP',
      });

      const icmpRes = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        protocol: 'ICMP',
      });

      expect(udpRes.allLogs.some((l) => l.includes('3-Way Handshake'))).toBe(false);
      expect(udpRes.allLogs.some((l) => l.includes('HTTP'))).toBe(false);

      expect(icmpRes.allLogs.some((l) => l.includes('3-Way Handshake'))).toBe(false);
      expect(icmpRes.allLogs.some((l) => l.includes('HTTP'))).toBe(false);
      expect(icmpRes.allLogs.some((l) => l.includes('Port'))).toBe(false);
    });
  });
});
