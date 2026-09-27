/**
 * OMEGA ULTRA REALITY V1.2 — Stateful Connection Engine
 * Tracks active TCP/UDP connections, state transitions, and connection teardown.
 */

import { NetworkConnection, ConnectionState, NetworkProtocol } from './types';

export class ConnectionEngine {
  private connections: Map<string, NetworkConnection> = new Map();

  constructor() {}

  public createConnection(params: {
    protocol: NetworkProtocol;
    sourceDevice: string;
    sourceIp: string;
    sourcePort: number;
    destinationDevice: string;
    destinationIp: string;
    destinationPort: number;
    initialState?: ConnectionState;
    virtualTime: number;
  }): NetworkConnection {
    const id = `conn-${params.sourceDevice}:${params.sourcePort}->${params.destinationDevice}:${params.destinationPort}-${params.virtualTime}`;
    const conn: NetworkConnection = {
      id,
      protocol: params.protocol,
      sourceDevice: params.sourceDevice,
      sourceIp: params.sourceIp,
      sourcePort: params.sourcePort,
      destinationDevice: params.destinationDevice,
      destinationIp: params.destinationIp,
      destinationPort: params.destinationPort,
      state: params.initialState || 'ESTABLISHED',
      createdAtVirtualTime: params.virtualTime,
      lastActivityVirtualTime: params.virtualTime,
      bytesSent: 0,
      bytesReceived: 0,
    };

    this.connections.set(id, conn);
    return conn;
  }

  public getConnections(): NetworkConnection[] {
    return Array.from(this.connections.values());
  }

  public getConnection(id: string): NetworkConnection | undefined {
    return this.connections.get(id);
  }

  public getConnectionsForDevice(deviceId: string): NetworkConnection[] {
    return Array.from(this.connections.values()).filter(
      (c) => c.sourceDevice === deviceId || c.destinationDevice === deviceId
    );
  }

  public updateActivity(connId: string, bytesSent: number, bytesReceived: number, virtualTime: number): void {
    const conn = this.connections.get(connId);
    if (conn && conn.state === 'ESTABLISHED') {
      conn.bytesSent += bytesSent;
      conn.bytesReceived += bytesReceived;
      conn.lastActivityVirtualTime = virtualTime;
    }
  }

  public closeConnection(connId: string, state: 'CLOSED' | 'RESET' | 'FAILED', reason?: string): void {
    const conn = this.connections.get(connId);
    if (conn) {
      conn.state = state;
      conn.failureReason = reason;
    }
  }

  /**
   * Terminate all connections involving a device when it powers off or link breaks.
   */
  public terminateConnectionsForDevice(deviceId: string, reason: string): void {
    this.connections.forEach((conn) => {
      if ((conn.sourceDevice === deviceId || conn.destinationDevice === deviceId) && conn.state === 'ESTABLISHED') {
        conn.state = 'FAILED';
        conn.failureReason = reason;
      }
    });
  }

  /**
   * Terminate all connections traversing through a broken switch or link.
   */
  public terminateAllCrossDeviceConnections(reason: string): void {
    this.connections.forEach((conn) => {
      if (conn.sourceDevice !== conn.destinationDevice && conn.state === 'ESTABLISHED') {
        conn.state = 'RESET';
        conn.failureReason = reason;
      }
    });
  }

  public clear(): void {
    this.connections.clear();
  }

  public snapshot(): NetworkConnection[] {
    return Array.from(this.connections.values()).map((c) => ({ ...c }));
  }

  public restore(connections: NetworkConnection[]): void {
    this.connections.clear();
    connections.forEach((c) => this.connections.set(c.id, { ...c }));
  }
}
