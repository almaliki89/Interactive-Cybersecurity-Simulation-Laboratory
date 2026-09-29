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
import { globalActiveDirectoryEngine } from '../reality/identity/ActiveDirectoryEngine';
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
    globalRealityEngine.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'sara.finance',
      password: 'P@ssword123!',
      logonType: 'Interactive',
    });
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
    globalRealityEngine.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'sara.finance',
      password: 'P@ssword123!',
      logonType: 'Interactive',
    });
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
    globalRealityEngine.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'sara.finance',
      password: 'P@ssword123!',
      logonType: 'Interactive',
    });
    const fileMachine = globalRealityEngine.registry.getMachine('FILE01');
    if (fileMachine) {
      fileMachine.desktop.services.stopService('LanmanServer');
      expect(fileMachine.getService('LanmanServer')?.status).toBe('STOPPED');
    }

    const res = globalNetworkEngine.accessSmbShare({
      sourceDeviceId: 'FIN-WS01',
      serverHostname: 'FILE01',
      shareName: 'Public',
      userName: 'sara.finance',
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('SERVICE_UNAVAILABLE');

    fileMachine?.desktop.services.startService('LanmanServer');
  });

  // 17. Unauthorized Finance share returns ACCESS_DENIED
  it('17. Unauthorized user omar.hr attempting to access Finance share returns ACCESS_DENIED', () => {
    const finWs = globalRealityEngine.registry.getMachine('FIN-WS01')!;
    finWs.getSessions().forEach((s) => {
      if (s.status === 'ACTIVE') finWs.logoffSession(s.sessionId, 10);
    });

    globalRealityEngine.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'omar.hr',
      password: 'P@ssword123!',
      logonType: 'Interactive',
    });

    const res = globalNetworkEngine.accessSmbShare({
      sourceDeviceId: 'FIN-WS01',
      serverHostname: 'FILE01',
      shareName: 'Finance',
      userName: 'omar.hr',
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('ACCESS_DENIED');
  });

  // 18. Established connection automatically resets when CORE-SW01 powers off
  it('18. Established connection automatically transitions to RESET when CORE-SW01 powers off', () => {
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

    // Power off switch in digital twin store
    const store = useDigitalTwinStore.getState();
    store.toggleDevicePower('CORE-SW01');

    // Automatically transitions to RESET without manually calling terminate
    expect(conn.state).toBe('RESET');
    expect(conn.failureReason).toContain('CORE-SW01');
  });

  // 18b. Established connection automatically resets when physical cable is disconnected
  it('18b. Established connection automatically transitions to RESET when physical cable is disconnected', () => {
    const conn = globalNetworkEngine.connections.createConnection({
      protocol: 'TCP',
      sourceDevice: 'FIN-WS01',
      sourceIp: '10.10.30.15',
      sourcePort: 49201,
      destinationDevice: 'FILE01',
      destinationIp: '10.10.20.10',
      destinationPort: 445,
      virtualTime: 1000,
    });
    expect(conn.state).toBe('ESTABLISHED');

    // Disconnect server cable
    const store = useDigitalTwinStore.getState();
    store.disconnectCable('CAB-SRV-FL01');

    // Consequence automatically propagated
    expect(conn.state).toBe('RESET');
  });

  // 18c. Established connection automatically resets when PDU-01 is powered off
  it('18c. Established connection automatically transitions to RESET when PDU-01 powers down rack infrastructure', () => {
    const conn = globalNetworkEngine.connections.createConnection({
      protocol: 'TCP',
      sourceDevice: 'FIN-WS01',
      sourceIp: '10.10.30.15',
      sourcePort: 49202,
      destinationDevice: 'FILE01',
      destinationIp: '10.10.20.10',
      destinationPort: 445,
      virtualTime: 1000,
    });
    expect(conn.state).toBe('ESTABLISHED');

    const store = useDigitalTwinStore.getState();
    store.toggleDevicePower('PDU-01');

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

      globalRealityEngine.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        password: 'P@ssword123!',
        logonType: 'Interactive',
      });

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

  // 21. NetworkEngine snapshot and restore roundtrip test
  it('21. NetworkEngine snapshot and restore roundtrip reproduces exact state', () => {
    globalNetworkEngine.queryDns('FIN-WS01', 'FILE01', 1000);
    globalNetworkEngine.arp.learn('FIN-WS01', '10.10.30.99', '00:11:22:33:44:55', 1000);
    globalNetworkEngine.connections.createConnection({
      protocol: 'TCP',
      sourceDevice: 'FIN-WS01',
      sourceIp: '10.10.30.15',
      sourcePort: 55000,
      destinationDevice: 'FILE01',
      destinationIp: '10.10.20.10',
      destinationPort: 445,
      virtualTime: 1000,
    });

    const snap = globalNetworkEngine.snapshot();

    // Mutate state
    globalNetworkEngine.dns.flushCache();
    globalNetworkEngine.arp.flush();
    globalNetworkEngine.connections.clear();

    expect(globalNetworkEngine.dns.getCacheEntries('FIN-WS01').length).toBe(0);
    expect(globalNetworkEngine.connections.getConnections().length).toBe(0);

    // Restore state
    globalNetworkEngine.restore(snap);

    expect(globalNetworkEngine.dns.getCacheEntries('FIN-WS01').length).toBe(1);
    expect(globalNetworkEngine.connections.getConnections().length).toBe(1);
    expect(globalNetworkEngine.arp.lookup('FIN-WS01', '10.10.30.99', 1500)?.macAddress).toBe('00:11:22:33:44:55');
  });

  // 22. RealityEngine composite snapshot restores network state
  it('22. RealityEngine composite snapshot preserves and restores network state', () => {
    globalNetworkEngine.queryDns('FIN-WS01', 'DC01', 1000);

    const realitySnap = globalRealityEngine.getStateSnapshot();
    expect(realitySnap.network).toBeDefined();

    // Mutate network
    globalNetworkEngine.dns.flushCache();
    expect(globalNetworkEngine.dns.getCacheEntries('FIN-WS01').length).toBe(0);

    // Restore reality snapshot
    globalRealityEngine.restoreStateSnapshot(realitySnap);
    expect(globalNetworkEngine.dns.getCacheEntries('FIN-WS01').length).toBe(1);
  });

  // 23. Deterministic replay test: baseline -> DNS -> SMB -> cable disconnect -> snapshot -> restore -> repeat
  it('23. Deterministic replay test across mutations, snapshots, and restores', () => {
    const executeSequence = () => {
      globalRealityEngine.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        password: 'P@ssword123!',
        logonType: 'Interactive',
      });
      // 1. Initial DNS query
      const dns1 = globalNetworkEngine.queryDns('FIN-WS01', 'DC01', 1000);
      // 2. SMB connection
      const smb = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
        userName: 'sara.finance',
        virtualTime: 2000,
      });

      // 3. Snapshot before disconnect
      const snap = globalRealityEngine.getStateSnapshot();

      // 4. Cable disconnect consequence
      const store = useDigitalTwinStore.getState();
      store.disconnectCable('CAB-SRV-DC01');
      const dnsFailing = globalNetworkEngine.queryDns('FIN-WS01', 'FILE01', 3000);

      // 5. Restore snapshot
      globalRealityEngine.restoreStateSnapshot(snap);
      store.connectCable('CAB-SRV-DC01');

      return {
        dns1Ip: dns1.resolvedIp,
        smbSuccess: smb.success,
        dnsFailingSuccess: dnsFailing.success,
        postRestoreCacheCount: globalNetworkEngine.dns.getCacheEntries('FIN-WS01').length,
      };
    };

    const pass1 = executeSequence();
    const pass2 = executeSequence();

    expect(pass1).toEqual(pass2);
  });

  describe('24. V1.4.1 Final Service State Unification Suite (A-H)', () => {
    it('A. FILE01 LanmanServer is initially RUNNING', () => {
      const file01 = globalRealityEngine.registry.getMachine('FILE01')!;
      expect(file01.getService('LanmanServer')?.status).toBe('RUNNING');
      expect(file01.isServiceRunning('LanmanServer')).toBe(true);
    });

    it('B. desktop.services.stopService("LanmanServer") updates getService("LanmanServer").status to STOPPED', () => {
      const file01 = globalRealityEngine.registry.getMachine('FILE01')!;
      file01.desktop.services.stopService('LanmanServer');
      expect(file01.getService('LanmanServer')?.status).toBe('STOPPED');
      expect(file01.isServiceRunning('LanmanServer')).toBe(false);
    });

    it('C. SMB access after stop returns failureReason SERVICE_UNAVAILABLE', () => {
      globalRealityEngine.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        password: 'P@ssword123!',
        logonType: 'Interactive',
      });
      const file01 = globalRealityEngine.registry.getMachine('FILE01')!;
      file01.desktop.services.stopService('LanmanServer');

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
        userName: 'sara.finance',
      });
      expect(res.success).toBe(false);
      expect(res.failureReason).toBe('SERVICE_UNAVAILABLE');
    });

    it('D. Starting LanmanServer restores SMB access', () => {
      globalRealityEngine.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        password: 'P@ssword123!',
        logonType: 'Interactive',
      });
      const file01 = globalRealityEngine.registry.getMachine('FILE01')!;
      file01.desktop.services.startService('LanmanServer');
      expect(file01.getService('LanmanServer')?.status).toBe('RUNNING');

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
        userName: 'sara.finance',
      });
      expect(res.success).toBe(true);
    });

    it('E. Stopping DNS on DC01 causes uncached DNS query to fail', () => {
      const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
      dc01.desktop.services.stopService('DNS');

      // Flush local client cache on FIN-WS01 to ensure uncached query
      globalNetworkEngine.dns.flushCache('FIN-WS01');

      const dnsRes = globalNetworkEngine.queryDns('FIN-WS01', 'UNCACHED-SERVER.LOCAL');
      expect(dnsRes.success).toBe(false);
      expect(dnsRes.error).toBe('DNS_SERVICE_STOPPED');

      // Restore DNS on DC01
      dc01.desktop.services.startService('DNS');
    });

    it('F. Stopping KDC on DC01 causes new TGS request to fail', () => {
      const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
      dc01.desktop.services.startService('KDC');

      // 1. Perform domain logon to obtain valid TGT into ticket cache
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
      });

      // 2. Stop KDC on DC01
      dc01.desktop.services.stopService('KDC');

      // 3. Clear TGS ticket cache while keeping TGT so we attempt contacting KDC for TGS
      const cache = globalActiveDirectoryEngine.getTicketCache('FIN-WS01');
      const tgt = cache.getTgt();
      cache.purge();
      if (tgt) cache.addTicket(tgt);

      // 4. Attempt requesting service ticket for cifs/FILE01 with KDC stopped
      const tgsRes = globalActiveDirectoryEngine.accessServiceViaKerberos({
        workstationHost: 'FIN-WS01',
        userSid: 'S-1-5-21-99887766-2001',
        spn: 'cifs/FILE01',
      });
      expect(tgsRes.ticket).toBeUndefined();
      expect(tgsRes.failureReason).toBe('DOMAIN_CONTROLLER_UNREACHABLE');

      // Restore KDC
      dc01.desktop.services.startService('KDC');
    });

    it('G. Cached TGS behavior remains correct when KDC is stopped', () => {
      const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
      dc01.desktop.services.startService('KDC');

      // Perform domain logon
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
      });

      // Obtain initial TGS while KDC is online
      const initialTgs = globalActiveDirectoryEngine.accessServiceViaKerberos({
        workstationHost: 'FIN-WS01',
        userSid: 'S-1-5-21-99887766-2001',
        spn: 'cifs/FILE01',
      });
      expect(initialTgs.ticket).toBeDefined();

      // Now stop KDC on DC01
      dc01.desktop.services.stopService('KDC');

      // Requesting existing cached TGS must STILL succeed from cache!
      const cachedTgs = globalActiveDirectoryEngine.accessServiceViaKerberos({
        workstationHost: 'FIN-WS01',
        userSid: 'S-1-5-21-99887766-2001',
        spn: 'cifs/FILE01',
      });
      expect(cachedTgs.ticket).toBeDefined();
      expect(cachedTgs.ticket?.ticketId).toBe(initialTgs.ticket?.ticketId);

      // Restore KDC
      dc01.desktop.services.startService('KDC');
    });

    it('H. Snapshot and restore preserves unified service state exactly', () => {
      const file01 = globalRealityEngine.registry.getMachine('FILE01')!;
      file01.desktop.services.startService('LanmanServer');
      expect(file01.getService('LanmanServer')?.status).toBe('RUNNING');

      // Take snapshot
      const snapshot = globalRealityEngine.getStateSnapshot();

      // Stop LanmanServer
      file01.desktop.services.stopService('LanmanServer');
      expect(file01.getService('LanmanServer')?.status).toBe('STOPPED');

      // Restore snapshot
      globalRealityEngine.restoreStateSnapshot(snapshot);

      // Verify LanmanServer state restored to RUNNING
      const restoredFile01 = globalRealityEngine.registry.getMachine('FILE01')!;
      expect(restoredFile01.getService('LanmanServer')?.status).toBe('RUNNING');
      expect(restoredFile01.isServiceRunning('LanmanServer')).toBe(true);
    });
  });
});
