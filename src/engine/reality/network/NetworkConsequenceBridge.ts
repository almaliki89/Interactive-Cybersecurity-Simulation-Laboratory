/**
 * OMEGA ULTRA REALITY V1.2.1 — Network Consequence Bridge
 * Deterministic bridge synchronizing Digital Twin physical events (cables, power, PDU, switches)
 * with NetworkEngine interfaces, routing, and active connection states.
 */

import { NetworkEngine, globalNetworkEngine } from './NetworkEngine';
import { PhysicalConnectivityEngine } from '../PhysicalConnectivityEngine';
import { globalSimulationRuntime } from '../../runtime/SimulationRuntime';

export class NetworkConsequenceBridge {
  private networkEngine: NetworkEngine;
  private unsubscribeStore: (() => void) | null = null;
  private isEvaluating: boolean = false;
  private storeGetter: (() => any) | null = null;

  constructor(networkEngine: NetworkEngine = globalNetworkEngine) {
    this.networkEngine = networkEngine;
  }

  public bindStore(getStore: () => any): void {
    this.storeGetter = getStore;
    const store = getStore();
    if (store && typeof store.subscribe === 'function') {
      if (this.unsubscribeStore) this.unsubscribeStore();
      this.unsubscribeStore = store.subscribe(() => {
        this.evaluateConsequences();
      });
    }
  }

  /**
   * Re-evaluates all network interfaces and active connections
   * in response to physical changes (power toggles, cable disconnects/reconnects).
   */
  public evaluateConsequences(): void {
    if (this.isEvaluating) return;
    this.isEvaluating = true;
    try {
      // 1. Re-evaluate all interface operational states
      this.networkEngine.getAllInterfaces().forEach((iface) => {
        this.networkEngine.evaluateInterfaceState(iface.deviceId);
      });

      // 2. Automatically propagate connection failures
      this.networkEngine.evaluateAllConnections();
    } finally {
      this.isEvaluating = false;
    }
  }

  public destroy(): void {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
  }
}

export const globalNetworkConsequenceBridge = new NetworkConsequenceBridge();
