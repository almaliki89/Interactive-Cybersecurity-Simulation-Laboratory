/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory SPN Registry
 * Service Principal Name mapping to domain computer and service accounts.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { SpnMapping } from './types';
import { BASELINE_COMPUTERS } from './DirectoryStore';

export class SpnRegistry {
  private spns: Map<string, SpnMapping> = new Map();

  constructor() {
    this.resetToBaseline();
  }

  public resetToBaseline(): void {
    this.spns.clear();
    const baselineMappings: SpnMapping[] = [
      {
        spn: 'cifs/FILE01',
        targetAccountSid: BASELINE_COMPUTERS.find((c) => c.hostname === 'FILE01')?.sid || '',
        targetAccountName: 'FILE01$',
        serviceType: 'cifs',
        hostname: 'FILE01',
      },
      {
        spn: 'HOST/FILE01',
        targetAccountSid: BASELINE_COMPUTERS.find((c) => c.hostname === 'FILE01')?.sid || '',
        targetAccountName: 'FILE01$',
        serviceType: 'host',
        hostname: 'FILE01',
      },
      {
        spn: 'HOST/DC01',
        targetAccountSid: BASELINE_COMPUTERS.find((c) => c.hostname === 'DC01')?.sid || '',
        targetAccountName: 'DC01$',
        serviceType: 'host',
        hostname: 'DC01',
      },
      {
        spn: 'ldap/DC01',
        targetAccountSid: BASELINE_COMPUTERS.find((c) => c.hostname === 'DC01')?.sid || '',
        targetAccountName: 'DC01$',
        serviceType: 'ldap',
        hostname: 'DC01',
      },
      {
        spn: 'dns/DC01',
        targetAccountSid: BASELINE_COMPUTERS.find((c) => c.hostname === 'DC01')?.sid || '',
        targetAccountName: 'DC01$',
        serviceType: 'dns',
        hostname: 'DC01',
      },
      {
        spn: 'HTTP/APP01',
        targetAccountSid: BASELINE_COMPUTERS.find((c) => c.hostname === 'APP01')?.sid || '',
        targetAccountName: 'APP01$',
        serviceType: 'http',
        hostname: 'APP01',
      },
    ];

    baselineMappings.forEach((m) => {
      this.spns.set(m.spn.toUpperCase(), m);
      // Case-insensitive variants
      this.spns.set(m.spn.toLowerCase(), m);
    });
  }

  public resolveSpn(spn: string): SpnMapping | undefined {
    if (!spn) return undefined;
    const clean = spn.trim().toUpperCase();
    let mapping = this.spns.get(clean) || this.spns.get(spn.toLowerCase());
    if (!mapping && clean.includes('.')) {
      // Handle FQDN SPNs like cifs/FILE01.NEXORA.LOCAL
      const parts = clean.split('/');
      if (parts.length === 2) {
        const hostOnly = parts[1].split('.')[0];
        const shortSpn = `${parts[0]}/${hostOnly}`;
        mapping = this.spns.get(shortSpn);
      }
    }
    return mapping;
  }

  public registerSpn(mapping: SpnMapping): void {
    this.spns.set(mapping.spn.toUpperCase(), mapping);
    this.spns.set(mapping.spn.toLowerCase(), mapping);
  }

  public getAllSpns(): SpnMapping[] {
    const set = new Set<SpnMapping>();
    this.spns.forEach((m) => set.add(m));
    return Array.from(set);
  }

  public getStateSnapshot(): SpnMapping[] {
    return this.getAllSpns();
  }

  public restoreStateSnapshot(snapshot: SpnMapping[]): void {
    this.spns.clear();
    snapshot.forEach((m) => this.registerSpn(m));
  }
}
