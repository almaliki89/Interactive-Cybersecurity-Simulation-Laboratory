/**
 * OMEGA ULTRA REALITY V1.2 — DNS Engine
 * Authoritative enterprise DNS zone, client resolver pipeline, and TTL-governed caching.
 */

import { DnsRecord, DnsCacheEntry, DnsQueryResult } from './types';

export class DnsEngine {
  private zoneRecords: Map<string, DnsRecord> = new Map();
  // Map of deviceId -> Map of hostname -> DnsCacheEntry
  private clientCaches: Map<string, Map<string, DnsCacheEntry>> = new Map();
  public readonly primaryDnsServer: string = '10.10.10.10'; // DC01

  constructor() {
    this.initDefaultZone();
  }

  private initDefaultZone(): void {
    this.zoneRecords.clear();

    const records: DnsRecord[] = [
      { hostname: 'DC01', recordType: 'A', ipAddress: '10.10.10.10', ttlSeconds: 3600 },
      { hostname: 'dc01.nexora.local', recordType: 'A', ipAddress: '10.10.10.10', ttlSeconds: 3600 },
      { hostname: 'FILE01', recordType: 'A', ipAddress: '10.10.20.10', ttlSeconds: 3600 },
      { hostname: 'file01.nexora.local', recordType: 'A', ipAddress: '10.10.20.10', ttlSeconds: 3600 },
      { hostname: 'APP01', recordType: 'A', ipAddress: '10.10.20.15', ttlSeconds: 3600 },
      { hostname: 'app01.nexora.local', recordType: 'A', ipAddress: '10.10.20.15', ttlSeconds: 3600 },
      { hostname: 'FIN-WS01', recordType: 'A', ipAddress: '10.10.30.15', ttlSeconds: 3600 },
      { hostname: 'fin-ws01.nexora.local', recordType: 'A', ipAddress: '10.10.30.15', ttlSeconds: 3600 },
      { hostname: 'HR-WS01', recordType: 'A', ipAddress: '10.10.30.20', ttlSeconds: 3600 },
      { hostname: 'hr-ws01.nexora.local', recordType: 'A', ipAddress: '10.10.30.20', ttlSeconds: 3600 },
      { hostname: 'IT-WS01', recordType: 'A', ipAddress: '10.10.30.25', ttlSeconds: 3600 },
      { hostname: 'it-ws01.nexora.local', recordType: 'A', ipAddress: '10.10.30.25', ttlSeconds: 3600 },
      { hostname: 'CORE-SW01', recordType: 'A', ipAddress: '10.10.1.1', ttlSeconds: 3600 },
      { hostname: 'FW-01', recordType: 'A', ipAddress: '10.10.1.254', ttlSeconds: 3600 },
    ];

    records.forEach((r) => {
      this.zoneRecords.set(r.hostname.toLowerCase(), r);
    });
  }

  public getCache(deviceId: string): Map<string, DnsCacheEntry> {
    if (!this.clientCaches.has(deviceId)) {
      this.clientCaches.set(deviceId, new Map());
    }
    return this.clientCaches.get(deviceId)!;
  }

  public getCacheEntries(deviceId: string): DnsCacheEntry[] {
    return Array.from(this.getCache(deviceId).values());
  }

  public lookupCache(deviceId: string, hostname: string, virtualTime: number): DnsCacheEntry | null {
    const cache = this.getCache(deviceId);
    const entry = cache.get(hostname.toLowerCase());
    if (!entry) return null;

    if (virtualTime > entry.expiresAtVirtualTime) {
      cache.delete(hostname.toLowerCase());
      return null;
    }

    return entry;
  }

  public populateCache(deviceId: string, hostname: string, ipAddress: string, ttlSeconds: number, virtualTime: number): void {
    const cache = this.getCache(deviceId);
    cache.set(hostname.toLowerCase(), {
      hostname,
      resolvedIp: ipAddress,
      ttlSeconds,
      expiresAtVirtualTime: virtualTime + ttlSeconds * 1000,
    });
  }

  public flushCache(deviceId?: string): void {
    if (deviceId) {
      this.getCache(deviceId).clear();
    } else {
      this.clientCaches.clear();
    }
  }

  public lookupZone(hostname: string): DnsRecord | null {
    return this.zoneRecords.get(hostname.toLowerCase()) || null;
  }

  public getAllZoneRecords(): DnsRecord[] {
    return Array.from(this.zoneRecords.values());
  }
}
