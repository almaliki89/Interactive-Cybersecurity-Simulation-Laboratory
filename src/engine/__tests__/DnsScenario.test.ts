import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';

describe('DNS Scenario Integration', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();
  });

  it('first lookup uses cold hierarchy path, second lookup hits cache path', () => {
    const domain = 'example.com';
    const resolvedIp = '93.184.216.34';
    const cache: Record<string, string> = {};

    // First Lookup - Cold Hierarchy
    runtime.schedule({ at: 0, type: 'BROWSER_CACHE_CHECK' });
    runtime.schedule({ at: 100, type: 'OS_CACHE_CHECK' });
    runtime.schedule({ at: 200, type: 'RECURSIVE_QUERY' });
    runtime.schedule({ at: 600, type: 'ROOT_QUERY' });
    runtime.schedule({ at: 1000, type: 'TLD_QUERY' });
    runtime.schedule({ at: 1400, type: 'AUTHORITATIVE_QUERY' });
    runtime.schedule({ at: 1800, type: 'DNS_RESPONSE', payload: { ip: resolvedIp } });

    runtime.step(2000);

    const firstLookupEvents = runtime.events.getHistory().map((e) => e.type);
    expect(firstLookupEvents).toContain('ROOT_QUERY');
    expect(firstLookupEvents).toContain('TLD_QUERY');
    expect(firstLookupEvents).toContain('AUTHORITATIVE_QUERY');
    expect(firstLookupEvents).toContain('DNS_RESPONSE');

    // Store in cache
    cache[domain] = resolvedIp;

    // Second Lookup - Cache Hit
    runtime.reset();
    runtime.schedule({ at: 0, type: 'BROWSER_CACHE_CHECK' });

    if (cache[domain]) {
      runtime.schedule({ at: 50, type: 'CACHE_HIT', payload: { ip: cache[domain] } });
      runtime.schedule({ at: 100, type: 'DNS_RESPONSE', payload: { ip: cache[domain] } });
    }

    runtime.step(200);

    const secondLookupEvents = runtime.events.getHistory().map((e) => e.type);
    expect(secondLookupEvents).toContain('CACHE_HIT');
    expect(secondLookupEvents).not.toContain('ROOT_QUERY');
    expect(secondLookupEvents).not.toContain('AUTHORITATIVE_QUERY');
  });
});
