import { describe, it, expect, beforeEach } from 'vitest';
import { evaluatePacketTransmission } from '../../utils/networkUtils';
import {
  registerChallengeValidator,
  unregisterChallengeValidator,
  useSimulationStore,
  clearChallengeValidators,
} from '../../stores/simulationStore';

describe('Reference Network & Network Security Laboratory Engine', () => {
  beforeEach(() => {
    clearChallengeValidators();
    useSimulationStore.setState({
      activeSimulationId: 'subnet_routing',
      completedChallenges: [],
    });
  });

  describe('Multi-Hop Diagnostics & Failure Trace Engine', () => {
    it('returns full 5-hop success trace when all network & security conditions pass', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 443,
        protocol: 'TCP',
        firewallPolicy: 'allow_all',
      });

      expect(res.validInputs).toBe(true);
      expect(res.isSameSubnet).toBe(true);
      expect(res.status).toBe('success');
      expect(res.packetState).toBe('success');
      expect(res.failureHop).toBeNull();
      expect(res.hopTraces).toBeDefined();
      expect(res.hopTraces?.length).toBe(5);
      expect(res.hopTraces?.every((h) => h.status === 'ok')).toBe(true);
    });

    it('identifies router hop drop when host and gateway are in non-overlapping subnets', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 27, // /27 host is in .32/27, gateway is in .0/27
        natEnabled: true,
      });

      expect(res.validInputs).toBe(true);
      expect(res.isSameSubnet).toBe(false);
      expect(res.status).toBe('subnet_mismatch');
      expect(res.packetState).toBe('blocked');
      expect(res.failureHop).toBe('router');
      expect(res.failureReasonAr).toContain('شبكتين فرعيتين مختلفين');
      expect(res.remediationAr).toContain('ضمن نفس نطاق الشبكة الفرعية');
      expect(res.hopTraces?.some((h) => h.nodeName === 'Router Ingress' && h.status === 'dropped')).toBe(true);
    });

    it('identifies firewall hop drop when ACL blocks unencrypted HTTP port 80', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: true,
        destPort: 80,
        firewallPolicy: 'strict_https',
      });

      expect(res.validInputs).toBe(true);
      expect(res.status).toBe('firewall_blocked');
      expect(res.packetState).toBe('blocked');
      expect(res.failureHop).toBe('firewall');
      expect(res.failureReasonEn).toContain('Firewall dropped packet');
      expect(res.remediationEn).toContain('Update firewall ACL policy');
      expect(res.hopTraces?.some((h) => h.nodeName === 'Firewall ACL Engine' && h.status === 'dropped')).toBe(true);
    });

    it('identifies NAT hop drop when egress NAT is disabled on RFC 1918 private address', () => {
      const res = evaluatePacketTransmission({
        hostIp: '192.168.1.42',
        gatewayIp: '192.168.1.1',
        cidrPrefix: 26,
        natEnabled: false,
      });

      expect(res.validInputs).toBe(true);
      expect(res.status).toBe('nat_disabled');
      expect(res.packetState).toBe('blocked');
      expect(res.failureHop).toBe('nat');
      expect(res.failureReasonEn).toContain('Egress NAT is disabled');
      expect(res.hopTraces?.some((h) => h.nodeName === 'NAT Gateway' && h.status === 'dropped')).toBe(true);
    });
  });

  describe('Authoritative Challenge Validator Binding', () => {
    it('validates subnet-routing-challenge correctly through simulationStore', () => {
      registerChallengeValidator('subnet-routing-challenge', () => ({
        success: true,
        score: 100,
        details: { cidrValid: true, natValid: true },
      }));

      const store = useSimulationStore.getState();
      store.completeChallenge('subnet-routing-challenge', { success: true });

      expect(useSimulationStore.getState().completedChallenges).toContain('subnet-routing-challenge');
      unregisterChallengeValidator('subnet-routing-challenge');
    });

    it('rejects subnet-routing-challenge completion if validator returns failure', () => {
      registerChallengeValidator('subnet-routing-challenge', () => ({
        success: false,
        score: 50,
        details: { cidrValid: false, natValid: true },
      }));

      const store = useSimulationStore.getState();
      store.completeChallenge('subnet-routing-challenge', { success: true });

      expect(store.completedChallenges).not.toContain('subnet-routing-challenge');
      unregisterChallengeValidator('subnet-routing-challenge');
    });
  });
});
