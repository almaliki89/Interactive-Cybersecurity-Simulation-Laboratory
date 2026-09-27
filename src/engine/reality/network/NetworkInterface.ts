/**
 * OMEGA ULTRA REALITY V1.2 — Network Interface Model
 * Deterministic interface state, IP configuration, and port bindings.
 */

import { SimulatedNetworkInterface, InterfaceAdminState, InterfaceOperState } from './types';

export class NetworkInterface {
  public readonly data: SimulatedNetworkInterface;

  constructor(config: SimulatedNetworkInterface) {
    this.data = { ...config };
  }

  public get id(): string {
    return this.data.id;
  }

  public get deviceId(): string {
    return this.data.deviceId;
  }

  public get name(): string {
    return this.data.name;
  }

  public get ipAddress(): string {
    return this.data.ipAddress;
  }

  public get subnetMask(): string {
    return this.data.subnetMask;
  }

  public get macAddress(): string {
    return this.data.macAddress;
  }

  public get gateway(): string {
    return this.data.gateway;
  }

  public get dnsServers(): string[] {
    return [...this.data.dnsServers];
  }

  public get vlanId(): number {
    return this.data.vlanId;
  }

  public get adminState(): InterfaceAdminState {
    return this.data.adminState;
  }

  public get operState(): InterfaceOperState {
    return this.data.operState;
  }

  public get speedMbps(): number {
    return this.data.speedMbps;
  }

  public get connectedCableId(): string | undefined {
    return this.data.connectedCableId;
  }

  public setAdminState(state: InterfaceAdminState): void {
    this.data.adminState = state;
    if (state === 'DOWN') {
      this.data.operState = 'DOWN';
    }
  }

  public setOperState(state: InterfaceOperState): void {
    this.data.operState = state;
  }

  /**
   * Evaluates whether this interface is active and usable for packet transmission.
   */
  public isUsable(devicePowerOnline: boolean, cableConnected: boolean): boolean {
    if (!devicePowerOnline) return false;
    if (this.data.adminState !== 'UP') return false;
    if (!cableConnected) return false;
    return this.data.operState === 'UP';
  }

  public recordTx(bytes: number): void {
    this.data.txPackets += 1;
    this.data.txBytes += bytes;
  }

  public recordRx(bytes: number): void {
    this.data.rxPackets += 1;
    this.data.rxBytes += bytes;
  }

  public toJSON(): SimulatedNetworkInterface {
    return { ...this.data };
  }

  public snapshot(): SimulatedNetworkInterface {
    return { ...this.data, dnsServers: [...this.data.dnsServers] };
  }

  public restore(data: SimulatedNetworkInterface): void {
    Object.assign(this.data, { ...data, dnsServers: [...data.dnsServers] });
  }
}
