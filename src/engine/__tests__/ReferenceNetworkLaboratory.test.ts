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

describe('Reference Network Laboratory — Correctness & Remediation Suite', () => {
  beforeEach(() => {
    clearChallengeValidators();
    useSimulationStore.setState({
      activeSimulationId: 'subnet_routing',
      completedChallenges: [],
    });
  });

  describe('1 & 2. Firewall Policy & Strict HTTPS Validation', () => {
    it('1. strict_https policy with TCP/80 blocks packet and fails challenge validation', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 80,
        protocol: 'TCP',
        firewallPolicy: 'strict_https',
      });

      expect(val.transmissionResult.status).toBe('firewall_blocked');
      expect(val.transmissionResult.packetState).toBe('blocked');
      expect(val.transmissionResult.failureHop).toBe('firewall');
      expect(val.success).toBe(false);
      expect(val.checks.transmissionSuccess).toBe(false);
    });

    it('2. strict_https policy with TCP/443 passes packet transmission and succeeds challenge validation', () => {
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
    });
  });

  describe('3. NAT Egress Requirement', () => {
    it('3. NAT disabled blocks egress packet and fails challenge validation', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: false,
        destPort: 443,
        protocol: 'TCP',
        firewallPolicy: 'allow_all',
      });

      expect(val.transmissionResult.status).toBe('nat_disabled');
      expect(val.transmissionResult.packetState).toBe('blocked');
      expect(val.transmissionResult.failureHop).toBe('nat');
      expect(val.success).toBe(false);
      expect(val.checks.natEnabled).toBe(false);
    });
  });

  describe('4. Subnet Boundary Alignment', () => {
    it('4. Mismatched subnet between host and gateway drops packet at router and fails challenge', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 27, // /27 puts 192.168.1.42 in .32/27 and 192.168.1.1 in .0/27
        natEnabled: true,
      });

      expect(val.transmissionResult.status).toBe('subnet_mismatch');
      expect(val.transmissionResult.packetState).toBe('blocked');
      expect(val.transmissionResult.failureHop).toBe('router');
      expect(val.success).toBe(false);
      expect(val.checks.sameSubnet).toBe(false);
    });
  });

  describe('5 & 6. Input Parameter Validation', () => {
    it('5. Invalid host IP or CIDR prefix returns invalid_ip status and fails challenge', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '999.999.999.999',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
      });

      expect(val.transmissionResult.validInputs).toBe(false);
      expect(val.transmissionResult.status).toBe('invalid_ip');
      expect(val.transmissionResult.packetState).toBe('blocked');
      expect(val.transmissionResult.failureHop).toBe('host');
      expect(val.success).toBe(false);
    });

    it('6. Invalid port (0 or 70000) is rejected during input validation', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 70000,
      });

      expect(val.transmissionResult.validInputs).toBe(false);
      expect(val.transmissionResult.status).toBe('invalid_ip');
      expect(val.success).toBe(false);
    });
  });

  describe('7, 8 & 9. Service Model Response Differentiation', () => {
    it('7. TCP to HTTP/HTTPS service returns HTTP 200 OK response log', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 443,
        protocol: 'TCP',
      });

      expect(res.status).toBe('success');
      expect(res.allLogs.some((l) => l.includes('HTTP 200 OK'))).toBe(true);
    });

    it('8. TCP to SSH service returns SSHv2 banner without fake HTTP 200 message', () => {
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

    it('9. UDP to DNS service returns DNS record resolution log without fake TCP 3-Way Handshake', () => {
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
  });

  describe('10, 11 & 12. Hop Alignment, Stale Prevention, and Closed Ports', () => {
    it('10. Strict alignment between status, packetState, failureHop, hopTraces, and challenge result', () => {
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
      expect(val.success).toBe(false);
    });

    it('11. Changing settings to invalid configuration causes validator to reject store completion', () => {
      // Register live validator with active state
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

      // First attempt with valid config succeeds
      store.completeChallenge('subnet-routing-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).toContain('subnet-routing-challenge');

      // Now change settings to invalid (e.g. strict_https on port 80)
      config.destPort = 80;
      config.firewallPolicy = 'strict_https';

      // Clear completed challenges to simulate new check attempt
      useSimulationStore.setState({ completedChallenges: [] });

      // Attempt complete challenge with new stale payload
      store.completeChallenge('subnet-routing-challenge', { success: true });

      // Rejects because live validator evaluates current settings
      expect(useSimulationStore.getState().completedChallenges).not.toContain('subnet-routing-challenge');
      unregisterChallengeValidator('subnet-routing-challenge');
    });

    it('12. Unsupported service or closed port (e.g. port 9999) returns port_unreachable and TCP RST log', () => {
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
      expect(res.remediationEn).toContain('Target an open port');
    });
  });
});
