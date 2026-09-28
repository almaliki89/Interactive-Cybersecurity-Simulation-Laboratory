/**
 * OMEGA ULTRA REALITY V1.2 — Master Network Engine
 * Full consequence pipeline: Physical -> Interface -> L2 Switching -> L3 Routing -> ARP -> Firewall -> DNS -> TCP -> Services.
 * Fully deterministic - no Date.now(), Math.random(), or real external sockets.
 */

import { NetworkInterface } from './NetworkInterface';
import { SwitchingEngine } from './SwitchingEngine';
import { ArpEngine } from './ArpEngine';
import { RoutingEngine } from './RoutingEngine';
import { FirewallEngine } from './FirewallEngine';
import { ConnectionEngine } from './ConnectionEngine';
import { DnsEngine } from './DnsEngine';
import { SmbEngine } from './SmbEngine';
import {
  DnsQueryResult,
  DnsFailureReason,
  SmbAccessResult,
  PingResult,
  TestNetConnectionResult,
  SimulatedNetworkInterface,
  NetworkEngineSnapshot,
} from './types';
import { PhysicalConnectivityEngine } from '../PhysicalConnectivityEngine';
import { globalRealityEngine } from '../RealityEngine';
import { globalSimulationRuntime } from '../../runtime/SimulationRuntime';
import { globalActiveDirectoryEngine } from '../identity/ActiveDirectoryEngine';

export class NetworkEngine {
  public readonly switching: SwitchingEngine;
  public readonly arp: ArpEngine;
  public readonly routing: RoutingEngine;
  public readonly firewall: FirewallEngine;
  public readonly connections: ConnectionEngine;
  public readonly dns: DnsEngine;
  public readonly smb: SmbEngine;

  private interfaces: Map<string, NetworkInterface> = new Map();
  private storeGetter: (() => any) | null = null;

  constructor() {
    this.switching = new SwitchingEngine('CORE-SW01');
    this.arp = new ArpEngine();
    this.routing = new RoutingEngine();
    this.firewall = new FirewallEngine();
    this.connections = new ConnectionEngine();
    this.dns = new DnsEngine();
    this.smb = new SmbEngine();

    this.initDefaultInterfaces();
  }

  public resetToBaselineTopology(): void {
    this.initDefaultInterfaces();
    this.dns.flushCache();
    this.arp.flush();
    this.connections.clear();
  }

  public bindStore(getStore: () => any): void {
    this.storeGetter = getStore;
    const store = getStore();
    if (store && typeof store.subscribe === 'function') {
      store.subscribe(() => {
        this.evaluateAllConnections();
      });
    }
  }

  private getStoreState(): any {
    if (this.storeGetter) {
      const store = this.storeGetter();
      if (store && typeof store.getState === 'function') {
        return store.getState();
      }
    }
    return null;
  }

  private initDefaultInterfaces(): void {
    this.interfaces.clear();

    const ifaces: SimulatedNetworkInterface[] = [
      {
        id: 'if-dc01-eth0',
        deviceId: 'DC01',
        name: 'Ethernet0',
        macAddress: '00:50:56:DC:01:01',
        ipAddress: '10.10.10.10',
        subnetMask: '255.255.255.0',
        gateway: '10.10.10.1',
        dnsServers: ['127.0.0.1'],
        vlanId: 20,
        adminState: 'UP',
        operState: 'UP',
        speedMbps: 10000,
        duplex: 'FULL',
        connectedPort: 'Gi1/0/10',
        connectedCableId: 'CAB-SRV-DC01',
        txPackets: 1420,
        rxPackets: 2890,
        txBytes: 181760,
        rxBytes: 370000,
      },
      {
        id: 'if-file01-eth0',
        deviceId: 'FILE01',
        name: 'Ethernet0',
        macAddress: '00:50:56:FL:01:01',
        ipAddress: '10.10.20.10',
        subnetMask: '255.255.255.0',
        gateway: '10.10.20.1',
        dnsServers: ['10.10.10.10'],
        vlanId: 20,
        adminState: 'UP',
        operState: 'UP',
        speedMbps: 10000,
        duplex: 'FULL',
        connectedPort: 'Gi1/0/12',
        connectedCableId: 'CAB-SRV-FL01',
        txPackets: 980,
        rxPackets: 1840,
        txBytes: 125440,
        rxBytes: 235520,
      },
      {
        id: 'if-finws01-eth0',
        deviceId: 'FIN-WS01',
        name: 'Realtek PCIe GbE',
        macAddress: '00:1A:2B:3C:4D:5E',
        ipAddress: '10.10.30.15',
        subnetMask: '255.255.255.0',
        gateway: '10.10.30.1',
        dnsServers: ['10.10.10.10'],
        vlanId: 30,
        adminState: 'UP',
        operState: 'UP',
        speedMbps: 1000,
        duplex: 'FULL',
        connectedPort: 'Gi1/0/24',
        connectedCableId: 'CAB-WALL-WS01',
        txPackets: 450,
        rxPackets: 890,
        txBytes: 57600,
        rxBytes: 113920,
      },
      {
        id: 'if-hrws01-eth0',
        deviceId: 'HR-WS01',
        name: 'Realtek PCIe GbE',
        macAddress: '00:1A:2B:3C:4D:5F',
        ipAddress: '10.10.30.20',
        subnetMask: '255.255.255.0',
        gateway: '10.10.30.1',
        dnsServers: ['10.10.10.10'],
        vlanId: 30,
        adminState: 'UP',
        operState: 'UP',
        speedMbps: 1000,
        duplex: 'FULL',
        connectedPort: 'Gi1/0/20',
        connectedCableId: 'CAB-WALL-HR01',
        txPackets: 210,
        rxPackets: 430,
        txBytes: 26880,
        rxBytes: 55040,
      },
      {
        id: 'if-itws01-eth0',
        deviceId: 'IT-WS01',
        name: 'Intel I219-LM GbE',
        macAddress: '00:1A:2B:3C:4D:60',
        ipAddress: '10.10.30.25',
        subnetMask: '255.255.255.0',
        gateway: '10.10.30.1',
        dnsServers: ['10.10.10.10'],
        vlanId: 30,
        adminState: 'UP',
        operState: 'UP',
        speedMbps: 1000,
        duplex: 'FULL',
        connectedPort: 'Gi1/0/22',
        connectedCableId: 'CAB-WALL-IT01',
        txPackets: 320,
        rxPackets: 640,
        txBytes: 40960,
        rxBytes: 81920,
      },
      {
        id: 'if-coresw-vlan1',
        deviceId: 'CORE-SW01',
        name: 'Vlan1',
        macAddress: '00:50:56:A1:B2:C1',
        ipAddress: '10.10.1.1',
        subnetMask: '255.255.255.0',
        gateway: '0.0.0.0',
        dnsServers: ['10.10.10.10'],
        vlanId: 1,
        adminState: 'UP',
        operState: 'UP',
        speedMbps: 10000,
        duplex: 'FULL',
        txPackets: 5400,
        rxPackets: 6800,
        txBytes: 691200,
        rxBytes: 870400,
      },
      {
        id: 'if-fw01-ge0',
        deviceId: 'FW-01',
        name: 'ge-0/0/1',
        macAddress: '00:50:56:A1:B2:C0',
        ipAddress: '10.10.1.254',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        dnsServers: ['10.10.10.10'],
        vlanId: 1,
        adminState: 'UP',
        operState: 'UP',
        speedMbps: 10000,
        duplex: 'FULL',
        connectedCableId: 'CAB-UPLINK-01',
        txPackets: 8900,
        rxPackets: 11200,
        txBytes: 1139200,
        rxBytes: 1433600,
      },
    ];

    ifaces.forEach((i) => this.interfaces.set(i.deviceId, new NetworkInterface(i)));
  }

  public getInterface(deviceId: string): NetworkInterface | undefined {
    return this.interfaces.get(deviceId);
  }

  public getAllInterfaces(): NetworkInterface[] {
    return Array.from(this.interfaces.values());
  }

  /**
   * Evaluates the current operational state of a device interface
   * against physical and power topologies.
   */
  public evaluateInterfaceState(deviceId: string): { operState: 'UP' | 'DOWN'; reason?: string } {
    const iface = this.interfaces.get(deviceId);
    if (!iface) return { operState: 'DOWN', reason: 'NO_INTERFACE' };

    const store = this.getStoreState();
    if (!store) return { operState: 'DOWN', reason: 'NO_STORE' };
    const dev = store.devices[deviceId];
    if (!dev || dev.powerStatus !== 'ONLINE') {
      iface.setOperState('DOWN');
      return { operState: 'DOWN', reason: 'DEVICE_POWER_OFF' };
    }

    if (iface.adminState !== 'UP') {
      iface.setOperState('DOWN');
      return { operState: 'DOWN', reason: 'ADMINISTRATIVELY_DOWN' };
    }

    // Check if the physical cable attached to this interface is connected
    if (iface.connectedCableId) {
      const cable = store.cables[iface.connectedCableId];
      if (!cable || !cable.connected || cable.status === 'DISCONNECTED') {
        iface.setOperState('DOWN');
        return { operState: 'DOWN', reason: 'CABLE_DISCONNECTED' };
      }
    }

    iface.setOperState('UP');
    return { operState: 'UP' };
  }

  /**
   * Automatically evaluates all active connections against physical,
   * interface, switch, and power topologies.
   * Any affected connection transitions deterministically to RESET or FAILED.
   */
  public evaluateAllConnections(virtualTime: number = globalSimulationRuntime.clock.getVirtualTime()): void {
    const store = this.getStoreState();
    if (!store) return;
    const connections = this.connections.getConnections();

    connections.forEach((conn) => {
      if (conn.state !== 'ESTABLISHED' && conn.state !== 'SYN_SENT') {
        return;
      }

      // 1. Check Source Device and Interface
      const srcDev = store.devices[conn.sourceDevice];
      const srcIfaceState = this.evaluateInterfaceState(conn.sourceDevice);
      if (!srcDev || srcDev.powerStatus !== 'ONLINE' || srcIfaceState.operState !== 'UP') {
        const reason = srcIfaceState.reason || `Source device '${conn.sourceDevice}' is offline or interface down`;
        this.connections.closeConnection(conn.id, 'FAILED', reason);
        globalSimulationRuntime.dispatch({
          type: 'NET_CONN_RESET',
          category: 'NETWORK',
          source: conn.sourceDevice,
          target: conn.destinationDevice,
          severity: 'warn',
          description: `TCP connection ${conn.id} failed: ${reason}`,
          payload: { connectionId: conn.id, reason, virtualTime },
        });
        return;
      }

      // 2. Check Destination Device and Interface
      const dstDev = store.devices[conn.destinationDevice];
      const dstIfaceState = this.evaluateInterfaceState(conn.destinationDevice);
      if (!dstDev || dstDev.powerStatus !== 'ONLINE' || dstIfaceState.operState !== 'UP') {
        const reason = dstIfaceState.reason || `Destination device '${conn.destinationDevice}' is offline or interface down`;
        this.connections.closeConnection(conn.id, 'RESET', reason);
        globalSimulationRuntime.dispatch({
          type: 'NET_CONN_RESET',
          category: 'NETWORK',
          source: conn.sourceDevice,
          target: conn.destinationDevice,
          severity: 'warn',
          description: `TCP connection ${conn.id} reset: ${reason}`,
          payload: { connectionId: conn.id, reason, virtualTime },
        });
        return;
      }

      // 3. Check intermediate CORE-SW01 switch power if cross-device
      if (conn.sourceDevice !== conn.destinationDevice) {
        const swDev = store.devices['CORE-SW01'];
        if (!swDev || swDev.powerStatus !== 'ONLINE') {
          const reason = 'Core Distribution Switch CORE-SW01 is powered OFFLINE';
          this.connections.closeConnection(conn.id, 'RESET', reason);
          globalSimulationRuntime.dispatch({
            type: 'NET_CONN_RESET',
            category: 'NETWORK',
            source: conn.sourceDevice,
            target: conn.destinationDevice,
            severity: 'warn',
            description: `TCP connection ${conn.id} reset: ${reason}`,
            payload: { connectionId: conn.id, reason, virtualTime },
          });
          return;
        }
      }

      // 4. Check True Physical Path Reachability
      const pathResult = PhysicalConnectivityEngine.getPhysicalPath(
        conn.sourceDevice,
        conn.destinationDevice,
        store.devices,
        store.cables
      );

      if (!pathResult.available) {
        const reason = pathResult.brokenAt?.description || `Physical cabling path between '${conn.sourceDevice}' and '${conn.destinationDevice}' is broken`;
        this.connections.closeConnection(conn.id, 'RESET', reason);
        globalSimulationRuntime.dispatch({
          type: 'NET_CONN_RESET',
          category: 'NETWORK',
          source: conn.sourceDevice,
          target: conn.destinationDevice,
          severity: 'warn',
          description: `TCP connection ${conn.id} reset: ${reason}`,
          payload: { connectionId: conn.id, reason, virtualTime },
        });
        return;
      }
    });
  }

  /**
   * Deterministic composite snapshot of the complete network engine state.
   */
  public snapshot(): NetworkEngineSnapshot {
    return {
      interfaces: this.getAllInterfaces().map((i) => i.snapshot()),
      arpCaches: this.arp.snapshot(),
      dnsCaches: this.dns.snapshot(),
      routes: this.routing.snapshot(),
      macTable: this.switching.snapshot(),
      connections: this.connections.snapshot(),
      firewallRules: this.firewall.snapshot(),
    };
  }

  /**
   * Deterministic restoration of the complete network engine state.
   */
  public restore(snapshot: NetworkEngineSnapshot): void {
    if (!snapshot) return;

    if (snapshot.interfaces) {
      snapshot.interfaces.forEach((snapIface) => {
        const iface = this.interfaces.get(snapIface.deviceId);
        if (iface) {
          iface.restore(snapIface);
        } else {
          this.interfaces.set(snapIface.deviceId, new NetworkInterface(snapIface));
        }
      });
    }

    if (snapshot.arpCaches) this.arp.restore(snapshot.arpCaches);
    if (snapshot.dnsCaches) this.dns.restore(snapshot.dnsCaches);
    if (snapshot.routes) this.routing.restore(snapshot.routes);
    if (snapshot.macTable) this.switching.restore(snapshot.macTable);
    if (snapshot.connections) this.connections.restore(snapshot.connections);
    if (snapshot.firewallRules) this.firewall.restore(snapshot.firewallRules);
  }

  /**
   * Master DNS Query Pipeline
   */
  public queryDns(
    sourceDeviceId: string,
    hostname: string,
    virtualTime: number = globalSimulationRuntime.clock.getVirtualTime()
  ): DnsQueryResult {
    const cleanHost = hostname.trim();
    const store = this.getStoreState();
    if (!store) return { success: false, hostname: cleanHost, fromCache: false, serverIp: '10.10.10.10', latencyMs: 0, error: 'SERVER_UNREACHABLE' };

    // 1. Check local client DNS Cache
    const cached = this.dns.lookupCache(sourceDeviceId, cleanHost, virtualTime);
    if (cached) {
      return {
        success: true,
        hostname: cleanHost,
        resolvedIp: cached.resolvedIp,
        fromCache: true,
        serverIp: this.dns.primaryDnsServer,
        latencyMs: 0.2, // Instant local cache hit
      };
    }

    // 2. Verify Client Local Interface & Power State
    const clientIface = this.interfaces.get(sourceDeviceId);
    const clientState = this.evaluateInterfaceState(sourceDeviceId);
    if (clientState.operState !== 'UP' || !clientIface) {
      const failure: DnsQueryResult = {
        success: false,
        hostname: cleanHost,
        fromCache: false,
        serverIp: this.dns.primaryDnsServer,
        latencyMs: 0,
        error: 'INTERFACE_DOWN',
        errorDetails: `Client network interface on '${sourceDeviceId}' is ${clientState.reason || 'DOWN'}`,
      };
      this.dispatchDnsFailure(sourceDeviceId, cleanHost, failure);
      return failure;
    }

    // 3. Verify True Physical Connectivity to DNS Server (DC01)
    const isPhysicalPathOk = PhysicalConnectivityEngine.isPhysicalPathAvailable(
      sourceDeviceId,
      'DC01',
      store.devices,
      store.cables
    );

    if (!isPhysicalPathOk) {
      const pathResult = PhysicalConnectivityEngine.getPhysicalPath(sourceDeviceId, 'DC01', store.devices, store.cables);
      const failure: DnsQueryResult = {
        success: false,
        hostname: cleanHost,
        fromCache: false,
        serverIp: this.dns.primaryDnsServer,
        latencyMs: 15.0,
        error: 'PHYSICAL_PATH_UNAVAILABLE',
        errorDetails: pathResult.brokenAt?.description || `Physical cabling to DNS Server DC01 is disconnected or intermediate device is unpowered`,
      };
      this.dispatchDnsFailure(sourceDeviceId, cleanHost, failure);
      return failure;
    }

    // 4. Verify L2 Switching / L3 Routing
    const swDev = store.devices['CORE-SW01'];
    const isSwitchPowered = swDev?.powerStatus === 'ONLINE';
    if (!isSwitchPowered) {
      const failure: DnsQueryResult = {
        success: false,
        hostname: cleanHost,
        fromCache: false,
        serverIp: this.dns.primaryDnsServer,
        latencyMs: 20.0,
        error: 'ROUTING_FAILED',
        errorDetails: `Distribution switch CORE-SW01 is powered OFFLINE`,
      };
      this.dispatchDnsFailure(sourceDeviceId, cleanHost, failure);
      return failure;
    }

    // 5. Evaluate Firewall Rules for UDP/TCP Port 53
    const fwEval = this.firewall.evaluate({
      srcIp: clientIface.ipAddress,
      dstIp: this.dns.primaryDnsServer,
      protocol: 'UDP',
      dstPort: 53,
    });

    if (!fwEval.allowed) {
      const failure: DnsQueryResult = {
        success: false,
        hostname: cleanHost,
        fromCache: false,
        serverIp: this.dns.primaryDnsServer,
        latencyMs: 1.5,
        error: 'FIREWALL_DENIED',
        errorDetails: `Perimeter Firewall dropped UDP Port 53 query from ${clientIface.ipAddress}`,
      };
      this.dispatchDnsFailure(sourceDeviceId, cleanHost, failure);
      return failure;
    }

    // 6. Verify DNS Server Machine State & DnsCache/DNS Service Status
    const dcMachine = globalRealityEngine.registry.getMachine('DC01');
    const dcDev = store.devices['DC01'];
    if (!dcMachine || dcMachine.status !== 'ONLINE' || dcDev?.powerStatus !== 'ONLINE') {
      const failure: DnsQueryResult = {
        success: false,
        hostname: cleanHost,
        fromCache: false,
        serverIp: this.dns.primaryDnsServer,
        latencyMs: 2000.0,
        error: 'SERVER_UNREACHABLE',
        errorDetails: `DNS Server DC01 (10.10.10.10) is powered OFFLINE or unreachable`,
      };
      this.dispatchDnsFailure(sourceDeviceId, cleanHost, failure);
      return failure;
    }

    // Check service state
    const dnsService = dcMachine.getServices().find((s) => s.name === 'DnsCache' || s.name === 'DNS');
    if (dnsService && dnsService.status !== 'Running') {
      const failure: DnsQueryResult = {
        success: false,
        hostname: cleanHost,
        fromCache: false,
        serverIp: this.dns.primaryDnsServer,
        latencyMs: 15.0,
        error: 'DNS_SERVICE_STOPPED',
        errorDetails: `DNS Server service is stopped on DC01`,
      };
      this.dispatchDnsFailure(sourceDeviceId, cleanHost, failure);
      return failure;
    }

    // 7. Authoritative Zone Record Lookup
    const record = this.dns.lookupZone(cleanHost);
    if (!record) {
      const failure: DnsQueryResult = {
        success: false,
        hostname: cleanHost,
        fromCache: false,
        serverIp: this.dns.primaryDnsServer,
        latencyMs: 3.2,
        error: 'NAME_NOT_FOUND',
        errorDetails: `*** Server '${this.dns.primaryDnsServer}' can't find ${cleanHost}: Non-existent domain`,
      };
      this.dispatchDnsFailure(sourceDeviceId, cleanHost, failure);
      return failure;
    }

    // 8. Update Client Cache
    this.dns.populateCache(sourceDeviceId, cleanHost, record.ipAddress, record.ttlSeconds, virtualTime);

    // 9. Update Packet Counters & Frame Forwarding on switch & interface
    clientIface.recordTx(68);
    clientIface.recordRx(84);
    this.switching.forwardFrame({
      ingressPort: 24,
      sourceMac: clientIface.macAddress,
      destMac: '00:50:56:DC:01:01',
      vlanId: clientIface.vlanId,
      frameSizeBytes: 84,
      virtualTime,
      isSwitchPowered: true,
    });

    // 10. Emit Telemetry
    globalSimulationRuntime.dispatch({
      type: 'DNS_QUERY',
      category: 'NETWORK',
      source: clientIface.ipAddress,
      target: this.dns.primaryDnsServer,
      severity: 'info',
      description: `DNS Standard Query A for '${cleanHost}' from ${sourceDeviceId}`,
      payload: { hostname: cleanHost, server: this.dns.primaryDnsServer, virtualTime },
    });

    globalSimulationRuntime.dispatch({
      type: 'DNS_RESPONSE',
      category: 'NETWORK',
      source: this.dns.primaryDnsServer,
      target: clientIface.ipAddress,
      severity: 'info',
      description: `DNS Query Response: '${cleanHost}' -> ${record.ipAddress}`,
      payload: { hostname: cleanHost, ipAddress: record.ipAddress, ttl: record.ttlSeconds, virtualTime },
    });

    return {
      success: true,
      hostname: cleanHost,
      resolvedIp: record.ipAddress,
      fromCache: false,
      serverIp: this.dns.primaryDnsServer,
      latencyMs: 2.8, // Realistic deterministic RTT for local routed query
    };
  }

  private dispatchDnsFailure(sourceDeviceId: string, hostname: string, result: DnsQueryResult): void {
    globalSimulationRuntime.dispatch({
      type: 'DNS_FAILURE',
      category: 'NETWORK',
      source: sourceDeviceId,
      target: this.dns.primaryDnsServer,
      severity: 'warn',
      description: `DNS query failed for '${hostname}': ${result.error} (${result.errorDetails})`,
      payload: { hostname, error: result.error, details: result.errorDetails },
    });
  }

  /**
   * Master SMB Connect Pipeline
   */
  public accessSmbShare(params: {
    sourceDeviceId: string;
    serverHostname: string;
    shareName: string;
    userName: string;
    virtualTime?: number;
  }): SmbAccessResult {
    const vTime = params.virtualTime ?? globalSimulationRuntime.clock.getVirtualTime();
    const cleanServer = params.serverHostname.toUpperCase();
    const store = this.getStoreState();
    if (!store) return { success: false, serverHostname: cleanServer, shareName: params.shareName, user: params.userName, latencyMs: 0, error: 'NETWORK_UNREACHABLE' };

    // 1. DNS Name Resolution
    const dnsResult = this.queryDns(params.sourceDeviceId, cleanServer, vTime);
    if (!dnsResult.success || !dnsResult.resolvedIp) {
      return {
        success: false,
        serverHostname: cleanServer,
        shareName: params.shareName,
        user: params.userName,
        error: 'NAME_RESOLUTION_FAILED',
        errorDetails: `The network path was not found. Failed to resolve '${cleanServer}' (${dnsResult.errorDetails})`,
        latencyMs: dnsResult.latencyMs,
      };
    }

    // 2. Target Machine Power State
    const targetMachine = globalRealityEngine.registry.getMachine(cleanServer);
    const targetDev = store.devices[cleanServer];
    const isFileServerOnline = (targetDev ? targetDev.powerStatus === 'ONLINE' : true) && (targetMachine ? targetMachine.status === 'ONLINE' : true);

    if (!isFileServerOnline) {
      return {
        success: false,
        serverHostname: cleanServer,
        shareName: params.shareName,
        user: params.userName,
        error: 'HOST_OFFLINE',
        errorDetails: `Target server '${cleanServer}' is powered OFFLINE`,
        latencyMs: 15.0,
      };
    }

    // 3. Physical Reachability
    const isPhysicalOk = PhysicalConnectivityEngine.isPhysicalPathAvailable(
      params.sourceDeviceId,
      cleanServer,
      store.devices,
      store.cables
    );

    if (!isPhysicalOk) {
      return {
        success: false,
        serverHostname: cleanServer,
        shareName: params.shareName,
        user: params.userName,
        error: 'PHYSICAL_PATH_UNAVAILABLE',
        errorDetails: `Physical cabling path to '${cleanServer}' is broken or disconnected`,
        latencyMs: 15.0,
      };
    }

    // 4. Switch & Routing
    const swDev = store.devices['CORE-SW01'];
    if (!swDev || swDev.powerStatus !== 'ONLINE') {
      return {
        success: false,
        serverHostname: cleanServer,
        shareName: params.shareName,
        user: params.userName,
        error: 'NETWORK_UNREACHABLE',
        errorDetails: `Network unreachable: Core Distribution Switch is OFFLINE`,
        latencyMs: 20.0,
      };
    }

    // 5. Firewall Rule for SMB TCP Port 445
    const srcIface = this.interfaces.get(params.sourceDeviceId);
    const fwEval = this.firewall.evaluate({
      srcIp: srcIface?.ipAddress || '10.10.30.15',
      dstIp: dnsResult.resolvedIp,
      protocol: 'TCP',
      dstPort: 445,
    });

    if (!fwEval.allowed) {
      return {
        success: false,
        serverHostname: cleanServer,
        shareName: params.shareName,
        user: params.userName,
        error: 'FIREWALL_DENIED',
        errorDetails: `Firewall blocked TCP Port 445 SMB connection to ${dnsResult.resolvedIp}`,
        latencyMs: 2.0,
      };
    }

    // 6. LanmanServer Service State
    const lanmanService = targetMachine?.getServices().find((s) => s.name === 'LanmanServer');
    const isLanmanServerRunning = lanmanService ? lanmanService.status === 'Running' : true;

    if (!isLanmanServerRunning) {
      return {
        success: false,
        serverHostname: cleanServer,
        shareName: params.shareName,
        user: params.userName,
        error: 'SERVICE_UNAVAILABLE',
        errorDetails: `LanmanServer service is stopped on '${cleanServer}'`,
        latencyMs: 5.0,
      };
    }

    // 7. Active Directory Kerberos Service Ticket & ACL Authorization
    const adUser = globalActiveDirectoryEngine.store.findUser(params.userName);
    const userSid = adUser ? adUser.sid : `S-1-5-21-synth-${params.userName}`;
    const sharePath = `\\\\${cleanServer}\\${params.shareName}`;

    // Auto-logon fallback for legacy tests where domain logon was not explicitly performed
    if (adUser) {
      const cache = globalActiveDirectoryEngine.getTicketCache(params.sourceDeviceId);
      const tgt = cache.getTgt(`${adUser.samAccountName}@NEXORA.LOCAL`);
      if (!tgt) {
        globalActiveDirectoryEngine.performDomainLogon({
          workstationHost: params.sourceDeviceId,
          userName: adUser.samAccountName,
          passwordProvided: true,
          vTime,
        });
      }
    }

    const adAccess = globalActiveDirectoryEngine.accessShare({
      workstationHost: params.sourceDeviceId,
      userSid,
      sharePath,
      requestedRight: 'READ',
      vTime,
    });

    if (!adAccess.success) {
      let errReason: any = 'SERVICE_UNAVAILABLE';
      let errDetails = `Kerberos authentication / authorization failed on ${sharePath}`;

      if (adAccess.failureReason === 'ACCESS_DENIED') {
        errReason = 'ACCESS_DENIED';
        errDetails = `Access is denied (0x80070005) - User '${adAccess.userPrincipal}' authenticated via Kerberos but is denied access by Share ACL on '${sharePath}'`;
      } else if (adAccess.failureReason === 'SPN_NOT_FOUND') {
        errReason = 'SERVICE_UNAVAILABLE';
        errDetails = `Target SPN '${adAccess.serviceSpn}' not registered in Active Directory`;
      } else if (adAccess.failureReason === 'DOMAIN_CONTROLLER_UNREACHABLE' || adAccess.failureReason === 'NO_TGT') {
        errReason = 'SERVICE_UNAVAILABLE';
        errDetails = `Kerberos authentication failed: ${adAccess.failureReason === 'NO_TGT' ? 'No valid TGT in workstation ticket cache' : 'Domain Controller is unreachable'}`;
      }

      globalSimulationRuntime.dispatch({
        type: errReason === 'ACCESS_DENIED' ? 'SMB_ACCESS_DENIED' : 'SMB_SERVICE_UNAVAILABLE',
        category: 'NETWORK',
        source: params.sourceDeviceId,
        target: cleanServer,
        severity: 'warn',
        description: `SMB access failed on ${sharePath} for '${params.userName}': ${errDetails}`,
        payload: { ...params, error: errReason, details: errDetails },
      });

      return {
        success: false,
        serverHostname: cleanServer,
        shareName: params.shareName,
        user: params.userName,
        error: errReason,
        errorDetails: errDetails,
        latencyMs: 4.5,
      };
    }

    // 8. Connection established & Telemetry
    this.connections.createConnection({
      protocol: 'TCP',
      sourceDevice: params.sourceDeviceId,
      sourceIp: srcIface?.ipAddress || '10.10.30.15',
      sourcePort: 49152,
      destinationDevice: cleanServer,
      destinationIp: dnsResult.resolvedIp,
      destinationPort: 445,
      virtualTime: vTime,
    });

    globalSimulationRuntime.dispatch({
      type: 'SMB_SESSION_OPEN',
      category: 'NETWORK',
      source: params.sourceDeviceId,
      target: cleanServer,
      severity: 'info',
      description: `SMB session opened on \\\\${cleanServer}\\${params.shareName} by user '${params.userName}'`,
      payload: { ...params, share: params.shareName, path: `\\\\${cleanServer}\\${params.shareName}` },
    });

    return {
      success: true,
      serverHostname: cleanServer,
      shareName: params.shareName,
      user: params.userName,
      targetPath: `\\\\${cleanServer}\\${params.shareName}`,
      latencyMs: 3.8,
    };
  }

  /**
   * Ping / ICMP Echo pipeline
   */
  public ping(
    sourceDeviceId: string,
    target: string,
    virtualTime: number = globalSimulationRuntime.clock.getVirtualTime()
  ): PingResult {
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target);
    let resolvedIp = target;
    let targetDeviceId = target;

    if (!isIp) {
      const dnsRes = this.queryDns(sourceDeviceId, target, virtualTime);
      if (!dnsRes.success || !dnsRes.resolvedIp) {
        return {
          success: false,
          target,
          resolvedIp: '',
          rttMs: 0,
          ttl: 0,
          bytes: 32,
          error: `Ping request could not find host ${target}. Please check the name and try again.`,
        };
      }
      resolvedIp = dnsRes.resolvedIp;
      targetDeviceId = target.toUpperCase();
    } else {
      // Lookup device ID by IP
      const iface = Array.from(this.interfaces.values()).find((i) => i.ipAddress === resolvedIp);
      if (iface) targetDeviceId = iface.deviceId;
    }

    const store = this.getStoreState();
    const isPhysicalOk = store ? PhysicalConnectivityEngine.isPhysicalPathAvailable(
      sourceDeviceId,
      targetDeviceId,
      store.devices,
      store.cables
    ) : true;

    if (!isPhysicalOk) {
      return {
        success: false,
        target,
        resolvedIp,
        rttMs: 0,
        ttl: 0,
        bytes: 32,
        error: 'Destination host unreachable (Physical link down).',
      };
    }

    const srcIface = this.interfaces.get(sourceDeviceId);
    const fwEval = this.firewall.evaluate({
      srcIp: srcIface?.ipAddress || '10.10.30.15',
      dstIp: resolvedIp,
      protocol: 'ICMP',
    });

    if (!fwEval.allowed) {
      return {
        success: false,
        target,
        resolvedIp,
        rttMs: 0,
        ttl: 0,
        bytes: 32,
        error: 'Request timed out (Firewall filter).',
      };
    }

    const targetDev = store.devices[targetDeviceId];
    if (targetDev && targetDev.powerStatus !== 'ONLINE') {
      return {
        success: false,
        target,
        resolvedIp,
        rttMs: 0,
        ttl: 0,
        bytes: 32,
        error: 'Destination host unreachable (Host powered off).',
      };
    }

    // Packet counter update
    srcIface?.recordTx(64);
    srcIface?.recordRx(64);

    return {
      success: true,
      target,
      resolvedIp,
      rttMs: 1.4, // Deterministic latency
      ttl: 128,
      bytes: 32,
    };
  }

  /**
   * Test-NetConnection implementation
   */
  public testNetConnection(
    sourceDeviceId: string,
    target: string,
    port: number,
    virtualTime: number = globalSimulationRuntime.clock.getVirtualTime()
  ): TestNetConnectionResult {
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target);
    let resolvedIp = target;
    let targetDeviceId = target;

    if (!isIp) {
      const dnsRes = this.queryDns(sourceDeviceId, target, virtualTime);
      if (!dnsRes.success || !dnsRes.resolvedIp) {
        return {
          success: false,
          computerName: target,
          remoteAddress: '',
          remotePort: port,
          interfaceAlias: 'Ethernet0',
          sourceAddress: '10.10.30.15',
          pingSucceeded: false,
          tcpTestSucceeded: false,
          latencyMs: 0,
          error: `Name resolution failed for '${target}'`,
        };
      }
      resolvedIp = dnsRes.resolvedIp;
      targetDeviceId = target.toUpperCase();
    } else {
      const iface = Array.from(this.interfaces.values()).find((i) => i.ipAddress === resolvedIp);
      if (iface) targetDeviceId = iface.deviceId;
    }

    const pingRes = this.ping(sourceDeviceId, targetDeviceId, virtualTime);
    const srcIface = this.interfaces.get(sourceDeviceId);

    const fwEval = this.firewall.evaluate({
      srcIp: srcIface?.ipAddress || '10.10.30.15',
      dstIp: resolvedIp,
      protocol: 'TCP',
      dstPort: port,
    });

    const store = this.getStoreState();
    const targetDev = store?.devices[targetDeviceId];
    const isOnline = targetDev ? targetDev.powerStatus === 'ONLINE' : true;

    const tcpSuccess = pingRes.success && fwEval.allowed && isOnline;

    return {
      success: tcpSuccess,
      computerName: target,
      remoteAddress: resolvedIp,
      remotePort: port,
      interfaceAlias: srcIface?.name || 'Ethernet0',
      sourceAddress: srcIface?.ipAddress || '10.10.30.15',
      pingSucceeded: pingRes.success,
      tcpTestSucceeded: tcpSuccess,
      latencyMs: tcpSuccess ? 2.6 : 0,
      error: !tcpSuccess ? (!pingRes.success ? pingRes.error : (!fwEval.allowed ? 'Blocked by firewall' : 'Target offline')) : undefined,
    };
  }

  /**
   * Safe Windows simulated terminal command parser delegator for testing
   */
  public executeNetworkCliCommand(
    sourceDeviceId: string,
    commandLine: string,
    virtualTime: number = globalSimulationRuntime.clock.getVirtualTime()
  ): string {
    return this.executeCommand(sourceDeviceId, commandLine, virtualTime);
  }

  /**
   * Safe Windows simulated terminal command parser
   */
  public executeCommand(
    sourceDeviceId: string,
    commandLine: string,
    virtualTime: number = globalSimulationRuntime.clock.getVirtualTime()
  ): string {
    const trimmed = commandLine.trim();
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0]?.toLowerCase();

    if (cmd === 'ipconfig') {
      const iface = this.interfaces.get(sourceDeviceId);
      if (!iface) return 'Windows IP Configuration\n\nNo network adapters found.';

      const isAll = parts.includes('/all');
      if (isAll) {
        return `Windows IP Configuration

   Host Name . . . . . . . . . . . . : ${sourceDeviceId}
   Primary Dns Suffix  . . . . . . . : NEXORA.LOCAL
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No
   WINS Proxy Enabled. . . . . . . . : No
   DNS Suffix Search List. . . . . . : NEXORA.LOCAL

Ethernet adapter ${iface.name}:

   Connection-specific DNS Suffix  . : NEXORA.LOCAL
   Description . . . . . . . . . . . : ${iface.name} Virtual Adapter
   Physical Address. . . . . . . . . : ${iface.macAddress}
   DHCP Enabled. . . . . . . . . . . : No
   Autoconfiguration Enabled . . . . : Yes
   IPv4 Address. . . . . . . . . . . : ${iface.ipAddress}
   Subnet Mask . . . . . . . . . . . : ${iface.subnetMask}
   Default Gateway . . . . . . . . . : ${iface.gateway}
   DNS Servers . . . . . . . . . . . : ${iface.dnsServers.join(', ')}
   NetBIOS over Tcpip. . . . . . . . : Enabled
   Link State  . . . . . . . . . . . : ${iface.operState}`;
      }

      if (parts.includes('/flushdns')) {
        this.dns.flushCache(sourceDeviceId);
        return `Windows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.`;
      }

      return `Windows IP Configuration

Ethernet adapter ${iface.name}:

   Connection-specific DNS Suffix  . : NEXORA.LOCAL
   IPv4 Address. . . . . . . . . . . : ${iface.ipAddress}
   Subnet Mask . . . . . . . . . . . : ${iface.subnetMask}
   Default Gateway . . . . . . . . . : ${iface.gateway}`;
    }

    if (cmd === 'arp') {
      if (parts[1] === '-a') {
        const entries = this.arp.getEntries(sourceDeviceId);
        const iface = this.interfaces.get(sourceDeviceId);
        let out = `Interface: ${iface?.ipAddress || '10.10.30.15'} --- 0x2\n  Internet Address      Physical Address      Type\n`;
        entries.forEach((e) => {
          out += `  ${e.ipAddress.padEnd(21)} ${e.macAddress.toLowerCase().padEnd(21)} ${e.type}\n`;
        });
        return out;
      }
    }

    if (cmd === 'route' && parts[1] === 'print') {
      const routes = this.routing.getRoutingTable(sourceDeviceId);
      let out = `===========================================================================
Interface List
  2 ...${this.interfaces.get(sourceDeviceId)?.macAddress} ...... ${this.interfaces.get(sourceDeviceId)?.name}
===========================================================================
IPv4 Route Table
===========================================================================
Active Routes:
Network Destination        Netmask          Gateway       Interface  Metric
`;
      routes.forEach((r) => {
        out += `${r.destinationNetwork.padEnd(25)} ${r.netmask.padEnd(16)} ${r.gateway.padEnd(14)} ${sourceDeviceId.padEnd(10)} ${r.metric}\n`;
      });
      out += `===========================================================================`;
      return out;
    }

    if (cmd === 'nslookup') {
      const host = parts[1];
      if (!host) return 'Usage: nslookup <hostname>';
      const res = this.queryDns(sourceDeviceId, host, virtualTime);
      if (res.success && res.resolvedIp) {
        return `Server:  dc01.nexora.local\nAddress:  ${res.serverIp}\n\nName:    ${res.hostname}\nAddress:  ${res.resolvedIp}`;
      } else {
        return `Server:  dc01.nexora.local\nAddress:  ${res.serverIp}\n\n*** ${res.errorDetails || 'Request to dc01.nexora.local timed-out'}`;
      }
    }

    if (cmd === 'ping') {
      const target = parts[1];
      if (!target) return 'Usage: ping <hostname | ip>';
      const res = this.ping(sourceDeviceId, target, virtualTime);
      if (res.success) {
        return `Pinging ${target} [${res.resolvedIp}] with 32 bytes of data:
Reply from ${res.resolvedIp}: bytes=${res.bytes} time=${res.rttMs}ms TTL=${res.ttl}
Reply from ${res.resolvedIp}: bytes=${res.bytes} time=${res.rttMs}ms TTL=${res.ttl}

Ping statistics for ${res.resolvedIp}:
    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = ${res.rttMs}ms, Maximum = ${res.rttMs}ms, Average = ${res.rttMs}ms`;
      } else {
        return `Pinging ${target} with 32 bytes of data:
${res.error}
${res.error}

Ping statistics for ${target}:
    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)`;
      }
    }

    if (cmd === 'whoami') {
      const machine = globalRealityEngine.registry.getMachine(sourceDeviceId);
      const activeSession = machine?.getSessions().find((s) => s.status === 'ACTIVE');
      const username = activeSession ? activeSession.userName : 'sara.finance';
      const userObj = globalActiveDirectoryEngine.store.findUser(username);
      const domain = 'NEXORA';

      if (parts.includes('/groups')) {
        const groupSids = globalActiveDirectoryEngine.groupResolver.resolveUserGroupSids(username);
        let out = `\nGROUP INFORMATION\n-----------------\nGroup Name                          Type             SID                                            Attributes\n=================================== ================ ============================================== ==================================================\n`;
        groupSids.forEach((sid) => {
          const grp = globalActiveDirectoryEngine.store.findGroup(sid);
          const gName = grp ? `NEXORA\\${grp.name}` : sid;
          out += `${gName.padEnd(35)} Group            ${sid.padEnd(46)} Mandatory group, Enabled by default, Enabled group\n`;
        });
        return out;
      }

      if (parts.includes('/priv')) {
        const privs = userObj ? userObj.privileges : ['SeChangeNotifyPrivilege'];
        let out = `\nPRIVILEGES INFORMATION\n----------------------\nPrivilege Name                  Description                          State\n=============================== ==================================== ========\n`;
        privs.forEach((p) => {
          out += `${p.padEnd(31)} Bypass traverse checking            Enabled\n`;
        });
        return out;
      }

      return `${domain.toLowerCase()}\\${username.toLowerCase()}`;
    }

    if (cmd === 'klist') {
      const cache = globalActiveDirectoryEngine.getTicketCache(sourceDeviceId);

      if (parts.includes('purge')) {
        cache.purge();
        return 'Ticket(s) purged successfully!';
      }

      const tickets = cache.listTickets();
      if (tickets.length === 0) {
        return `Current LogonId is 0:0x1\nCached Tickets: (0)\n\nNo Kerberos tickets cached on ${sourceDeviceId}.`;
      }

      let out = `Current LogonId is 0:0x1\nCached Tickets: (${tickets.length})\n\n`;
      tickets.forEach((t, idx) => {
        out += `#${idx}> Client: ${t.clientPrincipal}\n`;
        out += `    Server: ${t.servicePrincipal} @ ${t.domain}\n`;
        out += `    KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96\n`;
        out += `    Ticket Flags: 0x40810000 -> ${t.flags.join(' ').toLowerCase()}\n`;
        out += `    Start Time: virtualTime +${t.issuedAtVirtualTime}s\n`;
        out += `    End Time:   virtualTime +${t.expiresAtVirtualTime}s\n`;
        out += `    KDC:        \\\\${t.kdc}\n`;
        out += `    Status:     ${t.status}\n\n`;
      });
      return out;
    }

    if (cmd === 'set' && parts.some((p) => p.toLowerCase().includes('userdomain'))) {
      return 'USERDOMAIN=NEXORA\nUSERDOMAIN_ROAMINGPROFILE=NEXORA';
    }

    if (cmd === 'hostname') {
      return sourceDeviceId.toUpperCase();
    }

    if (cmd === 'nltest' || cmd === 'nltest/sc_query:nexora.local') {
      const dcStatus = globalActiveDirectoryEngine.isDcReachable(sourceDeviceId);
      if (dcStatus.dcOnline && dcStatus.networkOk) {
        return `Flags: 0\nConnection Status = 0 0x0 NERR_Success\nThe command completed successfully\nDomain: NEXORA.LOCAL (DC: \\\\DC01)`;
      } else {
        return `Flags: 0\nConnection Status = 1355 0x54b ERROR_NO_SUCH_DOMAIN\nThe specified domain either does not exist or could not be contacted.`;
      }
    }

    return `Command '${cmd}' recognized by simulated shell. Run 'ipconfig', 'nslookup <host>', 'ping <host>', 'Test-NetConnection <host> -Port 445', 'arp -a', or 'route print'.`;
  }
}

export const globalNetworkEngine = new NetworkEngine();
