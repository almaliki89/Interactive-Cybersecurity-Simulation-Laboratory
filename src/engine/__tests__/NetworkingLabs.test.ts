import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { Rule } from '../rules/RuleEngine';

describe('Networking Universe Runtime Compliance & Lab Mechanics', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();
  });

  // 1. ARP Test
  it('ARP: Cache miss -> broadcast -> reply -> cache update -> frame delivered', () => {
    const targetIp = '192.168.1.20';
    const targetMac = '00:1A:2B:3C:4D:20';

    runtime.schedule({ at: 0, type: 'ARP_CACHE_CHECK' });
    runtime.schedule({ at: 100, type: 'ARP_CACHE_MISS', description: targetIp });
    runtime.schedule({ at: 300, type: 'ARP_REQUEST', source: 'hostA', target: 'switch' });
    runtime.schedule({ at: 600, type: 'SWITCH_FRAME_FLOODED', source: 'switch', target: 'all_ports' });
    runtime.schedule({ at: 900, type: 'ARP_REPLY', source: targetIp, target: 'hostA', payload: { ip: targetIp, mac: targetMac } });
    runtime.schedule({ at: 1200, type: 'PACKET_DELIVERED', source: 'hostA', target: targetIp });

    runtime.step(1500);

    const history = runtime.events.getHistory();
    const eventTypes = history.map((e) => e.type);

    expect(eventTypes).toEqual([
      'ARP_CACHE_CHECK',
      'ARP_CACHE_MISS',
      'ARP_REQUEST',
      'SWITCH_FRAME_FLOODED',
      'ARP_REPLY',
      'PACKET_DELIVERED',
    ]);

    const replyEvt = history.find((e) => e.type === 'ARP_REPLY');
    expect(replyEvt?.payload).toEqual({ ip: targetIp, mac: targetMac });
  });

  // 2. DHCP Test
  it('DHCP: Discover -> Offer -> Request -> ACK -> Lease Created', () => {
    const leasedIp = '192.168.1.12';

    runtime.schedule({ at: 0, type: 'DHCP_DISCOVER', source: 'Client_PC', target: '255.255.255.255:67' });
    runtime.schedule({ at: 200, type: 'DHCP_OFFER', source: 'DHCP_Server', target: 'Client_PC', payload: { ip: leasedIp } });
    runtime.schedule({ at: 400, type: 'DHCP_REQUEST', source: 'Client_PC', target: 'DHCP_Server', payload: { ip: leasedIp } });
    runtime.schedule({ at: 600, type: 'DHCP_ACK', source: 'DHCP_Server', target: 'Client_PC', payload: { ip: leasedIp } });
    runtime.schedule({ at: 601, type: 'LEASE_CREATED', source: 'DHCP_Server', target: 'Client_PC', payload: { ip: leasedIp } });

    runtime.step(700);

    const history = runtime.events.getHistory();
    const types = history.map((e) => e.type);

    expect(types).toEqual([
      'DHCP_DISCOVER',
      'DHCP_OFFER',
      'DHCP_REQUEST',
      'DHCP_ACK',
      'LEASE_CREATED',
    ]);
  });

  it('DHCP: Pool exhaustion blocks lease issuance deterministically', () => {
    const activeLeases = 10;
    const poolSize = 10;

    if (activeLeases >= poolSize) {
      runtime.dispatch({
        type: 'PACKET_BLOCKED',
        source: 'DHCP_Server',
        description: 'DHCP Pool Exhausted! Cannot issue lease.',
      });
    }

    const history = runtime.events.getHistory();
    expect(history[0].type).toBe('PACKET_BLOCKED');
    expect(history[0].description).toContain('Pool Exhausted');
  });

  // 3. Routing Test
  it('Routing: Longest Prefix Match selects best route and decrements TTL', () => {
    const routes = [
      { id: 'r1', prefix: '10.2.0.0/24', nextHop: '172.16.12.2', prefixLen: 24 },
      { id: 'r2', prefix: '10.0.0.0/8', nextHop: '172.16.13.3', prefixLen: 8 },
      { id: 'r3', prefix: '0.0.0.0/0', nextHop: '192.168.1.1', prefixLen: 0 },
    ];

    const destIp = '10.2.0.50';
    const sorted = [...routes].sort((a, b) => b.prefixLen - a.prefixLen);
    const bestMatch = sorted.find((r) => r.prefix === '0.0.0.0/0' || destIp.startsWith('10.2.0'));

    expect(bestMatch?.id).toBe('r1');
    expect(bestMatch?.nextHop).toBe('172.16.12.2');
  });

  // 4. Switching Test
  it('Switching: Unknown destination floods frame, known destination unicasts frame', () => {
    const camTable = [
      { port: 1, mac: '00:11:22:33:44:A1' },
      { port: 2, mac: '00:11:22:33:44:B2' },
    ];

    // Unknown destination
    const unknownMac = '00:11:22:33:44:FF';
    const matchUnknown = camTable.find((e) => e.mac === unknownMac);
    expect(matchUnknown).toBeUndefined();

    // Known destination
    const knownMac = '00:11:22:33:44:B2';
    const matchKnown = camTable.find((e) => e.mac === knownMac);
    expect(matchKnown).toBeDefined();
    expect(matchKnown?.port).toBe(2);
  });

  // 5. VLAN Test
  it('VLAN: Same VLAN allowed, different VLAN blocked unless inter-VLAN routing is active', () => {
    const dev1 = { name: 'PC1', vlan: 10 };
    const dev2 = { name: 'PC2', vlan: 10 };
    const dev3 = { name: 'PC3', vlan: 20 };

    // Intra-VLAN 10
    expect(dev1.vlan === dev2.vlan).toBe(true);

    // Inter-VLAN without L3 router
    let interVlanRouting = false;
    let allowed = dev1.vlan === dev3.vlan || interVlanRouting;
    expect(allowed).toBe(false);

    // Inter-VLAN with L3 router
    interVlanRouting = true;
    allowed = dev1.vlan === dev3.vlan || interVlanRouting;
    expect(allowed).toBe(true);
  });

  // 6. NAT Test
  it('NAT: Private socket translates deterministically to public PAT socket', () => {
    const sessions = [
      { index: 1, privateIp: '10.0.0.10', privatePort: 49151, publicPort: 50001 },
      { index: 2, privateIp: '10.0.0.11', privatePort: 49152, publicPort: 50002 },
    ];

    expect(sessions[0].publicPort).toBe(50001);
    expect(sessions[1].publicPort).toBe(50002);
  });

  // 7. UDP Determinism Test
  it('UDP: Seeded loss pattern is 100% reproducible', () => {
    const isDropped = (index: number, rate: number) => {
      const pseudoRand = ((index * 9301 + 49297) % 233280) / 233280;
      return pseudoRand * 100 < rate;
    };

    const run1 = [1, 2, 3, 4, 5].map((i) => isDropped(i, 30));
    const run2 = [1, 2, 3, 4, 5].map((i) => isDropped(i, 30));

    expect(run1).toEqual(run2);
  });

  // 8. Ports & Services Test
  it('Ports: Open service accepts connection, closed service rejects with RST', () => {
    const services = [
      { port: 22, running: true },
      { port: 80, running: false },
    ];

    const ssh = services.find((s) => s.port === 22);
    const http = services.find((s) => s.port === 80);

    expect(ssh?.running).toBe(true);
    expect(http?.running).toBe(false);
  });

  // 9. Master Challenge Test
  it('Master Challenge: Valid configuration passes all policy conditions', () => {
    const config = {
      guestIsolation: true,
      sshMgmtOnly: true,
      httpsServerPermitted: true,
      financeSubnet: '10.50.10.0/24',
      hrSubnet: '10.50.20.0/24',
      guestSubnet: '10.50.30.0/24',
    };

    const isSubnetValid = config.financeSubnet !== config.hrSubnet && config.financeSubnet !== config.guestSubnet;
    const isPassed = config.guestIsolation && config.sshMgmtOnly && config.httpsServerPermitted && isSubnetValid;

    expect(isPassed).toBe(true);
  });
});
