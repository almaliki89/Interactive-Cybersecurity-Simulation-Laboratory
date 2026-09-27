/**
 * OMEGA ULTRA REALITY V1.2 — ARP Engine
 * Deterministic ARP cache, request/reply resolution, and cache expiration.
 */

import { ArpCacheEntry } from './types';

export class ArpEngine {
  // Map of deviceId -> Map of ipAddress -> ArpCacheEntry
  private deviceArpCaches: Map<string, Map<string, ArpCacheEntry>> = new Map();
  private defaultTtlMs: number = 120000; // 2 minutes dynamic ARP TTL

  constructor() {
    this.initDefaultArpCaches();
  }

  private initDefaultArpCaches(): void {
    this.deviceArpCaches.clear();

    // FIN-WS01 initial baseline ARP table (gateway and self)
    this.setEntry('FIN-WS01', {
      ipAddress: '10.10.30.1',
      macAddress: '00:50:56:A1:B2:C1',
      state: 'REACHABLE',
      expiresAtVirtualTime: 3600000,
      type: 'dynamic',
    });

    // DC01 initial baseline ARP table
    this.setEntry('DC01', {
      ipAddress: '10.10.10.1',
      macAddress: '00:50:56:A1:B2:C1',
      state: 'REACHABLE',
      expiresAtVirtualTime: 3600000,
      type: 'dynamic',
    });

    // FILE01 initial baseline ARP table
    this.setEntry('FILE01', {
      ipAddress: '10.10.20.1',
      macAddress: '00:50:56:A1:B2:C1',
      state: 'REACHABLE',
      expiresAtVirtualTime: 3600000,
      type: 'dynamic',
    });
  }

  public getCache(deviceId: string): Map<string, ArpCacheEntry> {
    if (!this.deviceArpCaches.has(deviceId)) {
      this.deviceArpCaches.set(deviceId, new Map());
    }
    return this.deviceArpCaches.get(deviceId)!;
  }

  public getEntries(deviceId: string): ArpCacheEntry[] {
    return Array.from(this.getCache(deviceId).values());
  }

  public lookup(deviceId: string, ipAddress: string, currentVirtualTime: number): ArpCacheEntry | null {
    const cache = this.getCache(deviceId);
    const entry = cache.get(ipAddress);
    if (!entry) return null;

    // Check expiration
    if (entry.type === 'dynamic' && currentVirtualTime > entry.expiresAtVirtualTime) {
      cache.delete(ipAddress);
      return null;
    }

    return entry;
  }

  public setEntry(deviceId: string, entry: ArpCacheEntry): void {
    const cache = this.getCache(deviceId);
    cache.set(entry.ipAddress, { ...entry });
  }

  /**
   * Adds or updates a learned MAC address via ARP response.
   */
  public learn(deviceId: string, ipAddress: string, macAddress: string, virtualTime: number): ArpCacheEntry {
    const entry: ArpCacheEntry = {
      ipAddress,
      macAddress: macAddress.toUpperCase(),
      state: 'REACHABLE',
      expiresAtVirtualTime: virtualTime + this.defaultTtlMs,
      type: 'dynamic',
    };
    this.setEntry(deviceId, entry);
    return entry;
  }

  public flush(deviceId?: string): void {
    if (deviceId) {
      this.getCache(deviceId).clear();
    } else {
      this.deviceArpCaches.clear();
    }
  }
}
