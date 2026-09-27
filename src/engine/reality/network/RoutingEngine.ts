/**
 * OMEGA ULTRA REALITY V1.2 — L3 Routing Engine
 * Subnet calculation, routing table evaluation, and next-hop gateway resolution.
 */

import { RouteEntry } from './types';

export class RoutingEngine {
  // Map of deviceId -> RouteEntry[]
  private deviceRoutingTables: Map<string, RouteEntry[]> = new Map();

  constructor() {
    this.initDefaultRoutingTables();
  }

  private initDefaultRoutingTables(): void {
    this.deviceRoutingTables.clear();

    // FIN-WS01 Routing Table
    this.deviceRoutingTables.set('FIN-WS01', [
      {
        destinationNetwork: '10.10.30.0/24',
        netmask: '255.255.255.0',
        gateway: '0.0.0.0', // On-link direct
        interfaceName: 'Realtek PCIe GbE',
        metric: 25,
      },
      {
        destinationNetwork: '127.0.0.0/8',
        netmask: '255.0.0.0',
        gateway: '0.0.0.0',
        interfaceName: 'Loopback',
        metric: 1,
      },
      {
        destinationNetwork: '0.0.0.0/0',
        netmask: '0.0.0.0',
        gateway: '10.10.30.1', // Default Gateway on CORE-SW01 / FW-01
        interfaceName: 'Realtek PCIe GbE',
        metric: 25,
      },
    ]);

    // DC01 Routing Table
    this.deviceRoutingTables.set('DC01', [
      {
        destinationNetwork: '10.10.10.0/24',
        netmask: '255.255.255.0',
        gateway: '0.0.0.0',
        interfaceName: 'Ethernet0',
        metric: 10,
      },
      {
        destinationNetwork: '0.0.0.0/0',
        netmask: '0.0.0.0',
        gateway: '10.10.10.1',
        interfaceName: 'Ethernet0',
        metric: 10,
      },
    ]);

    // FILE01 Routing Table
    this.deviceRoutingTables.set('FILE01', [
      {
        destinationNetwork: '10.10.20.0/24',
        netmask: '255.255.255.0',
        gateway: '0.0.0.0',
        interfaceName: 'Ethernet0',
        metric: 10,
      },
      {
        destinationNetwork: '0.0.0.0/0',
        netmask: '0.0.0.0',
        gateway: '10.10.20.1',
        interfaceName: 'Ethernet0',
        metric: 10,
      },
    ]);
  }

  /**
   * Evaluates if an IP address belongs to the same local subnet as the source interface.
   */
  public isSameSubnet(ip1: string, ip2: string, mask: string = '255.255.255.0'): boolean {
    const num1 = this.ipToNumber(ip1);
    const num2 = this.ipToNumber(ip2);
    const maskNum = this.ipToNumber(mask);
    return (num1 & maskNum) === (num2 & maskNum);
  }

  public ipToNumber(ip: string): number {
    return ip
      .split('.')
      .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
  }

  public getRoutingTable(deviceId: string): RouteEntry[] {
    return this.deviceRoutingTables.get(deviceId) || [];
  }

  /**
   * Resolves the route for a destination IP from a source device.
   * Returns whether it is direct (on-link) or requires a next-hop gateway.
   */
  public resolveRoute(
    deviceId: string,
    sourceIp: string,
    subnetMask: string,
    destinationIp: string
  ): { direct: boolean; nextHopIp: string; success: boolean; error?: string } {
    // 1. Loopback
    if (destinationIp === '127.0.0.1' || destinationIp === sourceIp) {
      return { direct: true, nextHopIp: destinationIp, success: true };
    }

    // 2. Same subnet -> Direct ARP / on-link
    if (this.isSameSubnet(sourceIp, destinationIp, subnetMask)) {
      return { direct: true, nextHopIp: destinationIp, success: true };
    }

    // 3. Different subnet -> Lookup default gateway from routing table
    const table = this.getRoutingTable(deviceId);
    const defaultRoute = table.find((r) => r.destinationNetwork === '0.0.0.0/0' && r.gateway !== '0.0.0.0');

    if (defaultRoute && defaultRoute.gateway) {
      return { direct: false, nextHopIp: defaultRoute.gateway, success: true };
    }

    return { direct: false, nextHopIp: '', success: false, error: 'NO_ROUTE_TO_HOST' };
  }

  public getAllRoutingTables(): Record<string, RouteEntry[]> {
    const result: Record<string, RouteEntry[]> = {};
    this.deviceRoutingTables.forEach((routes, devId) => {
      result[devId] = routes.map((r) => ({ ...r }));
    });
    return result;
  }

  public restoreAllRoutingTables(tables: Record<string, RouteEntry[]>): void {
    this.deviceRoutingTables.clear();
    Object.entries(tables).forEach(([devId, routes]) => {
      this.deviceRoutingTables.set(devId, routes.map((r) => ({ ...r })));
    });
  }

  public snapshot(): Record<string, RouteEntry[]> {
    return this.getAllRoutingTables();
  }

  public restore(tables: Record<string, RouteEntry[]>): void {
    this.restoreAllRoutingTables(tables);
  }
}
