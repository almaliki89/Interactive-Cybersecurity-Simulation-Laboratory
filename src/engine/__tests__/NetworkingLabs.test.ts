import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { findBestRoute, RouteEntry } from '../../simulations/networking/logic/routing';
import { calculateSubnet, splitSubnet } from '../../simulations/networking/logic/subnetting';
import { canCommunicateAcrossVlans, VlanDevice } from '../../simulations/networking/logic/vlan';
import { learnMac, forwardFrame, CamEntry } from '../../simulations/networking/logic/switching';
import { createNatTranslation, NatSession } from '../../simulations/networking/logic/nat';
import { shouldDropDatagram } from '../../simulations/networking/logic/udp';
import { allocateLease } from '../../simulations/networking/logic/dhcp';
import { checkArpCache, updateArpCache, flushArpCache, ArpEntry } from '../../simulations/networking/logic/arp';
import { evaluatePortAccess, ServiceDaemon } from '../../simulations/networking/logic/ports';
import { validateNexoraBranchConfiguration } from '../../simulations/networking/logic/nexoraValidator';

describe('Networking Universe Production Logic Modules', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();
  });

  // 1. Routing Engine Test
  describe('Routing Engine (LPM & IPv4 Bitmask)', () => {
    const routingTable: RouteEntry[] = [
      { id: 'default', destPrefix: '0.0.0.0/0', nextHop: '192.168.1.1', interfaceName: 'wan0', metric: 100 },
      { id: 'net8', destPrefix: '10.0.0.0/8', nextHop: '10.0.0.1', interfaceName: 'eth0', metric: 20 },
      { id: 'net16', destPrefix: '10.2.0.0/16', nextHop: '10.2.0.1', interfaceName: 'eth1', metric: 10 },
      { id: 'net24', destPrefix: '10.2.3.0/24', nextHop: '10.2.3.1', interfaceName: 'eth2', metric: 5 },
      { id: 'disabled28', destPrefix: '10.2.3.0/28', nextHop: '10.2.3.254', interfaceName: 'eth3', metric: 1, disabled: true },
    ];

    it('/24 beats /16 when both match 10.2.3.45', () => {
      const match = findBestRoute('10.2.3.45', routingTable);
      expect(match?.id).toBe('net24');
    });

    it('/16 beats /8 when matching 10.2.99.5', () => {
      const match = findBestRoute('10.2.99.5', routingTable);
      expect(match?.id).toBe('net16');
    });

    it('/8 beats default route when matching 10.5.5.5', () => {
      const match = findBestRoute('10.5.5.5', routingTable);
      expect(match?.id).toBe('net8');
    });

    it('default route used when nothing else matches (e.g. 8.8.8.8)', () => {
      const match = findBestRoute('8.8.8.8', routingTable);
      expect(match?.id).toBe('default');
    });

    it('disabled route is ignored even if it has longer prefix', () => {
      const match = findBestRoute('10.2.3.5', routingTable);
      expect(match?.id).toBe('net24'); // net24 (/24) selected because disabled28 (/28) is disabled
    });
  });

  // 2. Subnetting Logic Test
  describe('Subnetting Logic', () => {
    it('calculates standard /24 subnet correctly', () => {
      const sub = calculateSubnet('192.168.10.45', 24);
      expect(sub.networkIp).toBe('192.168.10.0');
      expect(sub.broadcastIp).toBe('192.168.10.255');
      expect(sub.firstHostIp).toBe('192.168.10.1');
      expect(sub.lastHostIp).toBe('192.168.10.254');
      expect(sub.totalAddresses).toBe(256);
      expect(sub.usableHosts).toBe(254);
    });

    it('handles /31 point-to-point edge case (2 usable hosts)', () => {
      const sub = calculateSubnet('10.0.0.0', 31);
      expect(sub.usableHosts).toBe(2);
      expect(sub.firstHostIp).toBe('10.0.0.0');
      expect(sub.lastHostIp).toBe('10.0.0.1');
    });

    it('handles /32 host route edge case (1 usable host)', () => {
      const sub = calculateSubnet('10.0.0.5', 32);
      expect(sub.usableHosts).toBe(1);
      expect(sub.firstHostIp).toBe('10.0.0.5');
      expect(sub.lastHostIp).toBe('10.0.0.5');
    });

    it('splits /24 into 4 x /26 subnets correctly', () => {
      const chunks = splitSubnet('192.168.1.0', 24, 26);
      expect(chunks).toHaveLength(4);
      expect(chunks[0].networkIp).toBe('192.168.1.0');
      expect(chunks[1].networkIp).toBe('192.168.1.64');
      expect(chunks[2].networkIp).toBe('192.168.1.128');
      expect(chunks[3].networkIp).toBe('192.168.1.192');
    });
  });

  // 3. VLAN Policy Logic Test
  describe('VLAN Policy Logic', () => {
    const dev1: VlanDevice = { id: 'd1', name: 'Finance 1', ip: '10.10.0.10', vlanId: 10 };
    const dev2: VlanDevice = { id: 'd2', name: 'Finance 2', ip: '10.10.0.11', vlanId: 10 };
    const dev3: VlanDevice = { id: 'd3', name: 'HR 1', ip: '10.20.0.10', vlanId: 20 };
    const guest: VlanDevice = { id: 'd4', name: 'Guest 1', ip: '10.30.0.10', vlanId: 30, isGuest: true };

    it('same VLAN allows L2 communication', () => {
      const res = canCommunicateAcrossVlans(dev1, dev2, { interVlanRoutingEnabled: false });
      expect(res.allowed).toBe(true);
      expect(res.mode).toBe('L2_SAME_VLAN');
    });

    it('different VLAN + no routing is blocked', () => {
      const res = canCommunicateAcrossVlans(dev1, dev3, { interVlanRoutingEnabled: false });
      expect(res.allowed).toBe(false);
      expect(res.mode).toBe('BLOCKED');
    });

    it('different VLAN + routing enabled is allowed', () => {
      const res = canCommunicateAcrossVlans(dev1, dev3, { interVlanRoutingEnabled: true });
      expect(res.allowed).toBe(true);
      expect(res.mode).toBe('L3_INTER_VLAN');
    });

    it('guest isolation overrides generic inter-VLAN routing', () => {
      const res = canCommunicateAcrossVlans(guest, dev1, {
        interVlanRoutingEnabled: true,
        guestIsolationEnabled: true,
        guestVlanId: 30,
      });
      expect(res.allowed).toBe(false);
      expect(res.mode).toBe('BLOCKED');
    });
  });

  // 4. Switching Logic Test
  describe('Switching Logic', () => {
    let camTable: CamEntry[] = [];

    beforeEach(() => {
      camTable = [
        { port: 1, mac: '00:11:22:33:44:A1', vlan: 1, type: 'dynamic' },
        { port: 2, mac: '00:11:22:33:44:B2', vlan: 1, type: 'dynamic' },
      ];
    });

    it('unknown unicast destination triggers flood', () => {
      const res = forwardFrame(camTable, '00:11:22:33:44:FF');
      expect(res.action).toBe('FLOOD');
      expect(res.targetPort).toBeNull();
    });

    it('known destination forwards unicast to specific port', () => {
      const res = forwardFrame(camTable, '00:11:22:33:44:B2');
      expect(res.action).toBe('UNICAST');
      expect(res.targetPort).toBe(2);
    });

    it('broadcast MAC triggers flood', () => {
      const res = forwardFrame(camTable, 'FF:FF:FF:FF:FF:FF');
      expect(res.action).toBe('FLOOD');
    });

    it('learns new source MAC on ingress port', () => {
      const updated = learnMac(camTable, 3, '00:11:22:33:44:C3');
      expect(updated).toHaveLength(3);
      expect(updated.find((e) => e.port === 3)?.mac).toBe('00:11:22:33:44:C3');
    });

    it('updates port when MAC moves to a new port', () => {
      const updated = learnMac(camTable, 4, '00:11:22:33:44:A1');
      expect(updated).toHaveLength(2); // Same count, MAC moved
      expect(updated.find((e) => e.mac === '00:11:22:33:44:A1')?.port).toBe(4);
    });
  });

  // 5. NAT Engine Test
  describe('NAT Engine', () => {
    it('creates deterministic session IDs and public PAT ports', () => {
      let sessions: NatSession[] = [];
      const res1 = createNatTranslation(sessions, '10.0.0.10', 49151);
      sessions = res1.updatedSessions;

      expect(res1.session.id).toBe('nat-session-1');
      expect(res1.session.publicPort).toBe(50001);

      const res2 = createNatTranslation(sessions, '10.0.0.11', 49152);
      sessions = res2.updatedSessions;

      expect(res2.session.id).toBe('nat-session-2');
      expect(res2.session.publicPort).toBe(50002);
    });

    it('reuses existing mapping for identical internal flow', () => {
      let sessions: NatSession[] = [];
      const res1 = createNatTranslation(sessions, '10.0.0.10', 49151, '93.184.216.34', 443);
      sessions = res1.updatedSessions;

      const res2 = createNatTranslation(sessions, '10.0.0.10', 49151, '93.184.216.34', 443);
      expect(res2.updatedSessions).toHaveLength(1);
      expect(res2.session.id).toBe('nat-session-1');
    });
  });

  // 6. UDP Deterministic Loss Test
  describe('UDP Deterministic Loss', () => {
    it('same seed + same sequence produces identical drop decision', () => {
      const run1 = [1, 2, 3, 4, 5].map((s) => shouldDropDatagram({ seed: 42, sequence: s, lossRate: 30 }));
      const run2 = [1, 2, 3, 4, 5].map((s) => shouldDropDatagram({ seed: 42, sequence: s, lossRate: 30 }));
      expect(run1).toEqual(run2);
    });

    it('0% loss rate never drops', () => {
      const dropped = shouldDropDatagram({ seed: 42, sequence: 1, lossRate: 0 });
      expect(dropped).toBe(false);
    });

    it('100% loss rate always drops', () => {
      const dropped = shouldDropDatagram({ seed: 42, sequence: 1, lossRate: 100 });
      expect(dropped).toBe(true);
    });
  });

  // 7. DHCP Engine Test
  describe('DHCP Engine', () => {
    it('allocates first available IP address in pool', () => {
      const alloc = allocateLease(0, 10, '192.168.1.1', '192.168.1.2', '192.168.1.10');
      expect(alloc.success).toBe(true);
      expect(alloc.assignedIp).toBe('192.168.1.10');
      expect(alloc.activeLeases).toBe(1);
    });

    it('returns error when pool is exhausted', () => {
      const alloc = allocateLease(10, 10);
      expect(alloc.success).toBe(false);
      expect(alloc.errorEn).toContain('Exhausted');
    });
  });

  // 8. ARP Cache Test
  describe('ARP Cache Logic', () => {
    it('checkArpCache finds existing entry or returns undefined', () => {
      const cache: ArpEntry[] = [{ ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:10', type: 'dynamic', ttl: 300 }];
      expect(checkArpCache(cache, '192.168.1.10')?.mac).toBe('00:1A:2B:3C:4D:10');
      expect(checkArpCache(cache, '192.168.1.99')).toBeUndefined();
    });

    it('updateArpCache replaces existing entry for same IP', () => {
      let cache: ArpEntry[] = [{ ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:10', type: 'dynamic', ttl: 300 }];
      cache = updateArpCache(cache, '192.168.1.10', '00:1A:2B:3C:4D:FF');
      expect(cache).toHaveLength(1);
      expect(cache[0].mac).toBe('00:1A:2B:3C:4D:FF');
    });

    it('flushArpCache returns empty array', () => {
      expect(flushArpCache()).toEqual([]);
    });
  });

  // 9. Ports & Services Test
  describe('Ports & Services Logic', () => {
    const services: ServiceDaemon[] = [
      { id: 'ssh', name: 'SSH', port: 22, protocol: 'TCP', running: true, descAr: '', descEn: '' },
      { id: 'http', name: 'HTTP', port: 80, protocol: 'TCP', running: false, descAr: '', descEn: '' },
    ];

    it('running service accepts connection (OPEN)', () => {
      const res = evaluatePortAccess(services, 22, 'TCP');
      expect(res.status).toBe('OPEN');
    });

    it('stopped service rejects connection with TCP RST (CLOSED)', () => {
      const res = evaluatePortAccess(services, 80, 'TCP');
      expect(res.status).toBe('CLOSED');
    });
  });

  // 10. Master Challenge Validator Test
  describe('Master Challenge Validator', () => {
    it('valid configuration passes with structured success result', () => {
      const validConfig = {
        financeSubnet: '10.50.10.0/24',
        hrSubnet: '10.50.20.0/24',
        guestSubnet: '10.50.30.0/24',
        guestIsolation: true,
        sshMgmtOnly: true,
        httpsServerPermitted: true,
      };

      const res = validateNexoraBranchConfiguration(validConfig);
      expect(res.success).toBe(true);
      expect(res.score).toBe(100);
      expect(res.failedChecks).toHaveLength(0);
      expect(res.passedChecks).toHaveLength(4);
    });

    it('insecure configuration fails with detailed failedChecks list', () => {
      const invalidConfig = {
        financeSubnet: '10.50.10.0/24',
        hrSubnet: '10.50.10.0/24', // Overlapping subnet error!
        guestSubnet: '10.50.30.0/24',
        guestIsolation: false, // Guest isolation disabled!
        sshMgmtOnly: false,
        httpsServerPermitted: true,
      };

      const res = validateNexoraBranchConfiguration(invalidConfig);
      expect(res.success).toBe(false);
      expect(res.score).toBeLessThan(100);
      expect(res.failedChecks.length).toBeGreaterThan(0);
      expect(res.failedChecks).toContain('Guest Network Isolation Enforcement');
      expect(res.failedChecks).toContain('Subnet Boundary Integrity');
    });
  });
});
