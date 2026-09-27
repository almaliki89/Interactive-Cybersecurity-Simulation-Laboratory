/**
 * OMEGA ULTRA REALITY V1.2 — True Network Behavior Test Suite
 * Comprehensive validation of:
 * - DNS Query Pipeline (Normal, Cache Hit, Cache Expiry, Cable Disconnect, Reconnect)
 * - L2 Switching & MAC Table
 * - L3 Routing & Subnets (Same subnet, cross subnet, missing gateway)
 * - ARP Cache & Resolution
 * - Firewall Rule Filtering (Allow, Deny)
 * - SMB Service & LanmanServer Dependency & Authorization
 * - Infrastructure Failure Propagation (Switch Power Off, PDU Power Off)
 * - Deterministic Packet Counters & Replay Determinism
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { globalNetworkEngine } from '../reality/network/NetworkEngine';
import { useDigitalTwinStore } from '../reality/digitalTwinStore';
import { globalRealityEngine } from '../reality/RealityEngine';
import { globalSimulationRuntime } from '../runtime/SimulationRuntime';

describe('OMEGA ULTRA REALITY V1.2 — True Network Behavior Suite', () => {
  beforeEach(() => {
    // Reset baseline RealityEngine and DigitalTwinStore state
    globalRealityEngine.initEnterpriseEnvironment();
    useDigitalTwinStore.getState().syncWithRealityEngine();

    // Ensure all cables are connected and devices online
    const store = useDigitalTwinStore.getState();
    Object.keys(store.cables).forEach((cId) => {
      store.connectCable(cId);
    });
    Object.keys(store.devices).forEach((dId) => {
      if (store.devices[dId].powerStatus !== 'ONLINE') {
        store.toggleDevicePower(dId);
      }
    });

    // Flush client caches to start from clean state
    globalNetworkEngine.dns.flushCache();
    globalNetworkEngine.arp.flush();
    globalNetworkEngine.connections.clear();
  });

  // 1. FIN-WS01 resolves DC01 normally
  it('1. FIN-WS01 resolves DC01 normally via DNS Query Pipeline', () => {
    const res = globalNetworkEngine.queryDns('FIN-WS01', 'DC01', 1000);
    expect(res.success).toBe(true);
    expect(res.resolvedIp).toBe('10.10.10.10');
    expect(res.fromCache).toBe(false);
    expect(res.serverIp).toBe('10.10.10.10');
  });

  // 2. DNS cache hit
  it('2. Subsequent DNS query results in instant local cache hit', () => {
    // First query populates cache
    globalNetworkEngine.queryDns('FIN-WS01', 'DC01', 1000);

    // Second query hits cache
    const cachedRes = globalNetworkEngine.queryDns('FIN-WS01', 'DC01', 2000);
    expect(cachedRes.success).toBe(true);
    expect(cachedRes.resolvedIp).toBe('10.10.10.10');
    expect(cachedRes.fromCache).toBe(true);
    expect(cachedRes.latencyMs).toBeLessThanOrEqual(0.5);
  });

  // 3. DNS cache expiry using SimulationClock
  it('3. DNS cache entries expire deterministically based on SimulationClock virtualTime', () => {
    // Populate cache at virtualTime 1000 with 3600s TTL (expires at 3601000ms)
    globalNetworkEngine.queryDns('FIN-WS01', 'FILE01', 1000);
    expect(globalNetworkEngine.dns.lookupCache('FIN-WS01', 'FILE01', 2000)).not.toBeNull();

    // After expiration time (e.g. at virtualTime 4000000ms)
    const expiredLookup = globalNetworkEngine.dns.lookupCache('FIN-WS01', 'FILE01', 4000000);
    expect(expiredLookup).toBeNull();
  });

  // 4. Disconnected DC01 cable makes DNS query fail
  it('4. Disconnecting CAB-SRV-DC01 makes DNS query fail with PHYSICAL_PATH_UNAVAILABLE', () => {
    const store = useDigitalTwinStore.getState();
    store.disconnectCable('CAB-SRV-DC01');

    const res = globalNetworkEngine.queryDns('FIN-WS01', 'FILE01', 1000);
    expect(res.success).toBe(false);
    expect(res.error).toBe('PHYSICAL_PATH_UNAVAILABLE');
  });

  // 5. Reconnect restores DNS
  it('5. Reconnecting CAB-SRV-DC01 restores DNS resolution', () => {
    const store = useDigitalTwinStore.getState();
    store.disconnectCable('CAB-SRV-DC01');
    expect(globalNetworkEngine.queryDns('FIN-WS01', 'FILE01', 1000).success).toBe(false);

    store.connectCable('CAB-SRV-DC01');
    const restored = globalNetworkEngine.queryDns('FIN-WS01', 'FILE01', 2000);
    expect(restored.success).toBe(true);
    expect(restored.resolvedIp).toBe('10.10.20.10');
  });

  // 6. CORE-SW01 off causes unreachable
  it('6. CORE-SW01 powered OFF renders DNS and network paths unreachable', () => {
    const store = useDigitalTwinStore.getState();
    store.toggleDevicePower('CORE-SW01');

    const res = globalNetworkEngine.queryDns('FIN-WS01', 'DC01', 1000);
    expect(res.success).toBe(false);
  });

  // 7. PDU off causes network failure
  it('7. PDU-01 OFF cascades power down to rack infrastructure and breaks enterprise networking', () => {
    const store = useDigitalTwinStore.getState();
    store.toggleDevicePower('PDU-01');

    const res = globalNetworkEngine.queryDns('FIN-WS01', 'DC01', 1000);
    expect(res.success).toBe(false);
    expect(res.error).toBe('PHYSICAL_PATH_UNAVAILABLE');
  });

  // 8. ARP request/reply populates cache
  it('8. ARP engine dynamically learns and populates host cache', () => {
    expect(globalNetworkEngine.arp.lookup('FIN-WS01', '10.10.30.20', 1000)).toBeNull();

    globalNetworkEngine.arp.learn('FIN-WS01', '10.10.30.20', '00:1A:2B:3C:4D:5F', 1000);
    const entry = globalNetworkEngine.arp.lookup('FIN-WS01', '10.10.30.20', 2000);
    expect(entry).not.toBeNull();
    expect(entry?.macAddress).toBe('00:1A:2B:3C:4D:5F');
  });

  // 9. Same subnet communication works
  it('9. Same subnet communication directly resolves on-link without routing', () => {
    const route = globalNetworkEngine.routing.resolveRoute(
      'FIN-WS01',
      '10.10.30.15',
      '255.255.255.0',
      '10.10.30.20' // HR-WS01 on same /24
    );
    expect(route.success).toBe(true);
    expect(route.direct).toBe(true);
    expect(route.nextHopIp).toBe('10.10.30.20');
  });

  // 10. Cross subnet requires gateway
  it('10. Cross-subnet communication requires default gateway', () => {
    const route = globalNetworkEngine.routing.resolveRoute(
      'FIN-WS01',
      '10.10.30.15',
      '255.255.255.0',
      '10.10.20.10' // FILE01 on Server VLAN 20
    );
    expect(route.success).toBe(true);
    expect(route.direct).toBe(false);
    expect(route.nextHopIp).toBe('10.10.30.1');
  });

  // 11. Missing gateway fails
  it('11. Routing fails when no matching route or gateway is available', () => {
    const route = globalNetworkEngine.routing.resolveRoute(
      'UNKNOWN-DEVICE',
      '192.168.99.10',
      '255.255.255.0',
      '8.8.8.8'
    );
    expect(route.success).toBe(false);
    expect(route.error).toBe('NO_ROUTE_TO_HOST');
  });

  // 12. Firewall allow works
  it('12. Firewall explicitly allows permissible traffic (e.g. UDP Port 53 DNS and TCP Port 445 SMB)', () => {
    const dnsEval = globalNetworkEngine.firewall.evaluate({
      srcIp: '10.10.30.15',
      dstIp: '10.10.10.10',
      protocol: 'UDP',
      dstPort: 53,
    });
    expect(dnsEval.allowed).toBe(true);

    const smbEval = globalNetworkEngine.firewall.evaluate({
      srcIp: '10.10.30.15',
      dstIp: '10.10.20.10',
      protocol: 'TCP',
      dstPort: 445,
    });
    expect(smbEval.allowed).toBe(true);
  });

  // 13. Firewall deny works
  it('13. Firewall blocks unauthorized cross-zone ports via default deny rule', () => {
    const blockedEval = globalNetworkEngine.firewall.evaluate({
      srcIp: '10.10.30.15',
      dstIp: '10.10.20.10',
      protocol: 'TCP',
      dstPort: 3389, // RDP to server not in allow list
    });
    expect(blockedEval.allowed).toBe(false);
    expect(blockedEval.matchedRule.action).toBe('DENY');
  });

  // 14. FILE01 port 445 service access works
  it('14. FILE01 port 445 SMB service access succeeds for authorized user sara.finance on Finance share', () => {
    const res = globalNetworkEngine.accessSmbShare({
      sourceDeviceId: 'FIN-WS01',
      serverHostname: 'FILE01',
      shareName: 'Finance',
      userName: 'sara.finance',
    });
    expect(res.success).toBe(true);
    expect(res.targetPath).toBe('\\\\FILE01\\Finance');
  });

  // 15. FILE01 offline makes SMB fail
  it('15. Powering FILE01 offline makes SMB access fail with HOST_OFFLINE', () => {
    const store = useDigitalTwinStore.getState();
    store.toggleDevicePower('FILE01');

    const res = globalNetworkEngine.accessSmbShare({
      sourceDeviceId: 'FIN-WS01',
      serverHostname: 'FILE01',
      shareName: 'Public',
      userName: 'sara.finance',
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('HOST_OFFLINE');
  });

  // 16. LanmanServer stopped makes SMB fail
  it('16. Stopping the LanmanServer service on FILE01 makes SMB fail with SERVICE_UNAVAILABLE', () => {
    const fileMachine = globalRealityEngine.registry.getMachine('FILE01');
    const lanman = fileMachine?.getServices().find((s) => s.name === 'LanmanServer');
    if (lanman) {
      lanman.status = 'Stopped';
    }

    const res = globalNetworkEngine.accessSmbShare({
      sourceDeviceId: 'FIN-WS01',
      serverHostname: 'FILE01',
      shareName: 'Public',
      userName: 'sara.finance',
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('SERVICE_UNAVAILABLE');
  });

  // 17. Unauthorized Finance share returns ACCESS_DENIED
  it('17. Unauthorized user omar.hr attempting to access Finance share returns ACCESS_DENIED', () => {
    const res = globalNetworkEngine.accessSmbShare({
      sourceDeviceId: 'FIN-WS01',
      serverHostname: 'FILE01',
      shareName: 'Finance',
      userName: 'omar.hr',
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('ACCESS_DENIED');
  });

  // 18. Existing connection reacts to switch shutdown
  it('18. Existing active connections transition to RESET/FAILED when switch or host shuts down', () => {
    const conn = globalNetworkEngine.connections.createConnection({
      protocol: 'TCP',
      sourceDevice: 'FIN-WS01',
      sourceIp: '10.10.30.15',
      sourcePort: 49200,
      destinationDevice: 'FILE01',
      destinationIp: '10.10.20.10',
      destinationPort: 445,
      virtualTime: 1000,
    });
    expect(conn.state).toBe('ESTABLISHED');

    // Simulate switch shutdown teardown
    globalNetworkEngine.connections.terminateAllCrossDeviceConnections('Core Switch Powered Off');
    expect(conn.state).toBe('RESET');
  });

  // 19. Packet counters increase deterministically
  it('19. Simulated network traffic deterministically increments interface and switch counters', () => {
    const iface = globalNetworkEngine.getInterface('FIN-WS01');
    const initialTx = iface?.data.txPackets || 0;

    globalNetworkEngine.ping('FIN-WS01', '10.10.30.15', 1000);
    const afterTx = iface?.data.txPackets || 0;
    expect(afterTx).toBeGreaterThan(initialTx);
  });

  // 20. Same scenario twice produces identical network state
  it('20. Same scenario executed twice produces deterministic, identical network state', () => {
    const runScenario = () => {
      globalRealityEngine.initEnterpriseEnvironment();
      globalNetworkEngine.dns.flushCache();
      globalNetworkEngine.arp.flush();

      const dns1 = globalNetworkEngine.queryDns('FIN-WS01', 'DC01', 1000);
      const dns2 = globalNetworkEngine.queryDns('FIN-WS01', 'FILE01', 2000);
      const smb = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
        userName: 'sara.finance',
        virtualTime: 3000,
      });

      return {
        dns1Ip: dns1.resolvedIp,
        dns2Ip: dns2.resolvedIp,
        smbSuccess: smb.success,
        cacheSize: globalNetworkEngine.dns.getCacheEntries('FIN-WS01').length,
      };
    };

    const runA = runScenario();
    const runB = runScenario();

    expect(runA).toEqual(runB);
  });
});
