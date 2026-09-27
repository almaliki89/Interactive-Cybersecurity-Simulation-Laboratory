/**
 * OMEGA ULTRA REALITY V1.2 — L2 Switching Engine
 * Simulates enterprise Ethernet switching, MAC address learning table, VLAN segmentation, and frame forwarding.
 */

import { MacTableEntry } from './types';

export interface SwitchPortConfig {
  portNumber: number;
  label: string;
  vlanId: number;
  linkState: 'UP' | 'DOWN';
  connectedDevice?: string;
  connectedPort?: string;
  txPackets: number;
  rxPackets: number;
  txBytes: number;
  rxBytes: number;
}

export class SwitchingEngine {
  public readonly switchId: string;
  private macTable: Map<string, MacTableEntry> = new Map();
  private ports: Map<number, SwitchPortConfig> = new Map();
  private maxMacAgingMs: number = 300000; // 5 minute standard aging

  constructor(switchId: string = 'CORE-SW01') {
    this.switchId = switchId;
    this.initDefaultSwitchPorts();
  }

  private initDefaultSwitchPorts(): void {
    this.ports.clear();
    for (let i = 1; i <= 48; i++) {
      let vlanId = 30; // Workstations by default
      let connectedDevice: string | undefined;
      let connectedPort: string | undefined;
      let linkState: 'UP' | 'DOWN' = 'DOWN';

      if (i === 1) {
        // Uplink to Firewall FW-01
        vlanId = 1;
        connectedDevice = 'FW-01';
        connectedPort = 'ge-0/0/1';
        linkState = 'UP';
      } else if (i === 10) {
        // DC01
        vlanId = 20;
        connectedDevice = 'DC01';
        connectedPort = 'Ethernet0';
        linkState = 'UP';
      } else if (i === 12) {
        // FILE01
        vlanId = 20;
        connectedDevice = 'FILE01';
        connectedPort = 'Ethernet0';
        linkState = 'UP';
      } else if (i === 24) {
        // FIN-WS01 (via Patch Panel PP-01)
        vlanId = 30;
        connectedDevice = 'PP-01';
        connectedPort = 'Port 24';
        linkState = 'UP';
      } else if (i === 48) {
        // Out-of-band PDU MGMT
        vlanId = 10;
        connectedDevice = 'PDU-01';
        connectedPort = 'MGMT-ETH';
        linkState = 'UP';
      }

      this.ports.set(i, {
        portNumber: i,
        label: `Gi1/0/${i}`,
        vlanId,
        linkState,
        connectedDevice,
        connectedPort,
        txPackets: linkState === 'UP' ? 120 : 0,
        rxPackets: linkState === 'UP' ? 140 : 0,
        txBytes: linkState === 'UP' ? 15360 : 0,
        rxBytes: linkState === 'UP' ? 17920 : 0,
      });
    }

    // Pre-populate static/known MAC entries
    this.learnMac('00:50:56:A1:B2:C1', 1, 1, 0, true);
    this.learnMac('00:50:56:DC:01:01', 10, 20, 0, true);
    this.learnMac('00:50:56:FL:01:01', 12, 20, 0, true);
    this.learnMac('00:1A:2B:3C:4D:5E', 24, 30, 0, true);
  }

  /**
   * Learns a source MAC address into the MAC address table.
   */
  public learnMac(
    macAddress: string,
    portNumber: number,
    vlanId: number,
    virtualTime: number,
    isStatic: boolean = false
  ): void {
    const normalizedMac = macAddress.toUpperCase();
    this.macTable.set(normalizedMac, {
      macAddress: normalizedMac,
      portNumber,
      vlanId,
      learnedAtVirtualTime: virtualTime,
      static: isStatic,
    });
  }

  /**
   * Simulates L2 frame forwarding through the switch fabric.
   * Returns the destination port(s) or an empty array if blocked.
   */
  public forwardFrame(params: {
    ingressPort: number;
    sourceMac: string;
    destMac: string;
    vlanId: number;
    frameSizeBytes?: number;
    virtualTime: number;
    isSwitchPowered: boolean;
  }): { forwardedPorts: number[]; flooded: boolean; dropped: boolean; reason?: string } {
    if (!params.isSwitchPowered) {
      return { forwardedPorts: [], flooded: false, dropped: true, reason: 'SWITCH_POWER_OFF' };
    }

    const inPort = this.ports.get(params.ingressPort);
    if (!inPort || inPort.linkState !== 'UP') {
      return { forwardedPorts: [], flooded: false, dropped: true, reason: 'INGRESS_PORT_DOWN' };
    }

    const frameBytes = params.frameSizeBytes || 64;

    // 1. Ingress port counts RX
    inPort.rxPackets += 1;
    inPort.rxBytes += frameBytes;

    // 2. Source MAC learning
    this.learnMac(params.sourceMac, params.ingressPort, params.vlanId, params.virtualTime);

    const destMacUpper = params.destMac.toUpperCase();
    const isBroadcast = destMacUpper === 'FF:FF:FF:FF:FF:FF';

    // 3. Broadcast or Unknown Destination -> Flood within same VLAN only
    if (isBroadcast) {
      const floodedPorts: number[] = [];
      this.ports.forEach((p) => {
        if (p.portNumber !== params.ingressPort && p.vlanId === params.vlanId && p.linkState === 'UP') {
          p.txPackets += 1;
          p.txBytes += frameBytes;
          floodedPorts.push(p.portNumber);
        }
      });
      return { forwardedPorts: floodedPorts, flooded: true, dropped: false };
    }

    // 4. Unicast Lookup
    const entry = this.macTable.get(destMacUpper);

    // Aging check
    if (entry && !entry.static && params.virtualTime - entry.learnedAtVirtualTime > this.maxMacAgingMs) {
      this.macTable.delete(destMacUpper);
    }

    if (entry && this.macTable.has(destMacUpper)) {
      // VLAN isolation check
      if (entry.vlanId !== params.vlanId) {
        return { forwardedPorts: [], flooded: false, dropped: true, reason: 'VLAN_MISMATCH' };
      }

      const outPort = this.ports.get(entry.portNumber);
      if (outPort && outPort.linkState === 'UP') {
        outPort.txPackets += 1;
        outPort.txBytes += frameBytes;
        return { forwardedPorts: [entry.portNumber], flooded: false, dropped: false };
      } else {
        return { forwardedPorts: [], flooded: false, dropped: true, reason: 'EGRESS_PORT_DOWN' };
      }
    }

    // Unknown Unicast -> Flood inside same VLAN
    const floodedPorts: number[] = [];
    this.ports.forEach((p) => {
      if (p.portNumber !== params.ingressPort && p.vlanId === params.vlanId && p.linkState === 'UP') {
        p.txPackets += 1;
        p.txBytes += frameBytes;
        floodedPorts.push(p.portNumber);
      }
    });

    return { forwardedPorts: floodedPorts, flooded: true, dropped: false };
  }

  public setPortLinkState(portNumber: number, linkState: 'UP' | 'DOWN'): void {
    const p = this.ports.get(portNumber);
    if (p) {
      p.linkState = linkState;
    }
  }

  public getMacTable(): MacTableEntry[] {
    return Array.from(this.macTable.values());
  }

  public getPorts(): SwitchPortConfig[] {
    return Array.from(this.ports.values());
  }

  public getPort(portNumber: number): SwitchPortConfig | undefined {
    return this.ports.get(portNumber);
  }

  public getPortForDevice(deviceId: string): SwitchPortConfig | undefined {
    return Array.from(this.ports.values()).find((p) => p.connectedDevice === deviceId);
  }

  public clearDynamicMacs(): void {
    Array.from(this.macTable.entries()).forEach(([mac, entry]) => {
      if (!entry.static) {
        this.macTable.delete(mac);
      }
    });
  }
}
