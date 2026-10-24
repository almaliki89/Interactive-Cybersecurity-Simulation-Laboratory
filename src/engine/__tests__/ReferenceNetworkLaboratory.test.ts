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

describe('Reference Network Laboratory — OMEGA MAX Verification Suite', () => {
  beforeEach(() => {
    clearChallengeValidators();
    useSimulationStore.setState({
      activeSimulationId: 'subnet_routing',
      completedChallenges: [],
    });
  });

  describe('1. Firewall & ICMP Interaction', () => {
    it('blocks TCP/80 under block_http policy', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 80,
        protocol: 'TCP',
        firewallPolicy: 'block_http',
      });
      expect(res.status).toBe('firewall_blocked');
    });

    it('allows ICMP under block_http policy even if destPort is 80', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 80,
        protocol: 'ICMP',
        firewallPolicy: 'block_http',
      });
      expect(res.status).toBe('success');
    });

    it('blocks ICMP under strict_https policy', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        protocol: 'ICMP',
        firewallPolicy: 'strict_https',
      });
      expect(res.status).toBe('firewall_blocked');
    });

    it('blocks ICMP under drop_all policy', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        protocol: 'ICMP',
        firewallPolicy: 'drop_all',
      });
      expect(res.status).toBe('firewall_blocked');
    });
  });

  describe('2. TLS Handshake Simulation', () => {
    it('shows multi-stage TLS logs for HTTPS (TCP/443)', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 443,
        protocol: 'TCP',
      });
      expect(res.status).toBe('success');
      const logs = res.allLogs.join('\n');
      expect(logs).toContain('TCP 3-Way Handshake Completed');
      expect(logs).toContain('TLS 1.3 Handshake: ClientHello received');
      expect(logs).toContain('TLS 1.3 Handshake: ServerHello, Certificate, Finished');
      expect(logs).toContain('Encrypted session established');
      expect(logs).toContain('Processing Encrypted HTTP GET / request');
      expect(logs).toContain('HTTP 200 OK');
    });

    it('does not show TLS logs for plaintext HTTP (TCP/80)', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 80,
        protocol: 'TCP',
      });
      expect(res.status).toBe('success');
      const logs = res.allLogs.join('\n');
      expect(logs).not.toContain('TLS 1.3 Handshake');
      expect(logs).toContain('Plaintext HTTP GET');
    });
  });

  describe('3. Differentiated Input Validation', () => {
    it('returns invalid_ip for bad IPv4', () => {
      const res = evaluatePacketTransmission({
        hostIp: '999.999.999.999',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
      });
      expect(res.status).toBe('invalid_ip');
      expect(res.failureHop).toBe('host');
    });

    it('returns invalid_cidr for bad prefix', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 35,
        natEnabled: true,
      });
      expect(res.status).toBe('invalid_cidr');
    });

    it('returns invalid_port for out-of-range port', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 70000,
        protocol: 'TCP',
      });
      expect(res.status).toBe('invalid_port');
    });

    it('ignores port validation for ICMP', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 70000, // Normally invalid
        protocol: 'ICMP',
      });
      expect(res.status).toBe('success');
    });
  });

  describe('4. Challenge Consistency', () => {
    it('fails challenge if transmission fails', () => {
      const val = validateSubnetRoutingChallengeState({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 80,
        protocol: 'TCP',
        firewallPolicy: 'block_http',
      });
      expect(val.success).toBe(false);
      expect(val.checks.transmissionSuccess).toBe(false);
    });

    it('succeeds challenge only with correct topology AND successful transmission', () => {
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
    });
  });

  describe('5. Regression & Edge Cases', () => {
    it('returns port_unreachable with TCP RST for closed TCP port', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 9999,
        protocol: 'TCP',
      });
      expect(res.status).toBe('port_unreachable');
      expect(res.allLogs.some(l => l.includes('TCP RST'))).toBe(true);
    });

    it('returns port_unreachable with ICMP Type 3 for closed UDP port', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 9999,
        protocol: 'UDP',
      });
      expect(res.status).toBe('port_unreachable');
      expect(res.allLogs.some(l => l.includes('ICMP Destination Unreachable'))).toBe(true);
    });

    it('prevents stale validator exploitation', () => {
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

      // 1. Succeed first
      store.completeChallenge('subnet-routing-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).toContain('subnet-routing-challenge');

      // 2. Break config
      config.natEnabled = false;
      useSimulationStore.setState({ completedChallenges: [] }); // Reset for re-test

      // 3. Try to complete with broken config
      store.completeChallenge('subnet-routing-challenge', { success: true });
      expect(useSimulationStore.getState().completedChallenges).not.toContain('subnet-routing-challenge');

      unregisterChallengeValidator('subnet-routing-challenge');
    });
  });
});
