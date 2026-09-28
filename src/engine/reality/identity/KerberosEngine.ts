/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory KerberosEngine
 * Stateful Kerberos KDC engine for AS-REQ (TGT) and TGS-REQ (Service Ticket) issuance.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { KerberosTicket, DirectoryUser } from './types';

export const KERBEROS_DEFAULTS = {
  TGT_LIFETIME_SECONDS: 28800, // 8 virtual hours
  TGS_LIFETIME_SECONDS: 36000, // 10 virtual hours
  RENEWABLE_LIFETIME_SECONDS: 604800, // 7 virtual days
  DEFAULT_KDC: 'DC01',
  DEFAULT_DOMAIN: 'NEXORA.LOCAL',
};

export class KerberosEngine {
  private ticketCounter: number = 1000;

  public issueTgt(params: {
    user: DirectoryUser;
    vTime: number;
    kdc?: string;
    domain?: string;
  }): KerberosTicket {
    this.ticketCounter += 1;
    const ticketId = `tgt-${params.user.samAccountName}-${params.vTime}-${this.ticketCounter}`;
    const domain = params.domain || KERBEROS_DEFAULTS.DEFAULT_DOMAIN;
    const clientPrincipal = `${params.user.samAccountName}@${domain}`;
    const servicePrincipal = `krbtgt/${domain}`;

    const tgt: KerberosTicket = {
      ticketId,
      ticketType: 'TGT',
      clientPrincipal,
      clientSid: params.user.sid,
      servicePrincipal,
      domain,
      issuedAtVirtualTime: params.vTime,
      expiresAtVirtualTime: params.vTime + KERBEROS_DEFAULTS.TGT_LIFETIME_SECONDS,
      renewUntilVirtualTime: params.vTime + KERBEROS_DEFAULTS.RENEWABLE_LIFETIME_SECONDS,
      sessionKeyId: `key-tgt-${this.ticketCounter}`,
      flags: ['FORWARDABLE', 'RENEWABLE', 'INITIAL', 'PRE_AUTHENT'],
      kdc: params.kdc || KERBEROS_DEFAULTS.DEFAULT_KDC,
      status: 'VALID',
    };

    return tgt;
  }

  public issueTgs(params: {
    tgt: KerberosTicket;
    spn: string;
    vTime: number;
    kdc?: string;
  }): { ticket?: KerberosTicket; failureReason?: 'TGT_EXPIRED' | 'INVALID_TGT' } {
    if (!params.tgt || params.tgt.ticketType !== 'TGT') {
      return { failureReason: 'INVALID_TGT' };
    }

    if (params.tgt.expiresAtVirtualTime <= params.vTime || params.tgt.status !== 'VALID') {
      return { failureReason: 'TGT_EXPIRED' };
    }

    this.ticketCounter += 1;
    const cleanSpn = params.spn.trim();
    const ticketId = `tgs-${params.tgt.clientSid.split('-').pop()}-${cleanSpn.replace(/[/.]/g, '_')}-${params.vTime}-${this.ticketCounter}`;

    const tgs: KerberosTicket = {
      ticketId,
      ticketType: 'TGS',
      clientPrincipal: params.tgt.clientPrincipal,
      clientSid: params.tgt.clientSid,
      servicePrincipal: cleanSpn,
      domain: params.tgt.domain,
      issuedAtVirtualTime: params.vTime,
      expiresAtVirtualTime: params.vTime + KERBEROS_DEFAULTS.TGS_LIFETIME_SECONDS,
      renewUntilVirtualTime: params.vTime + KERBEROS_DEFAULTS.RENEWABLE_LIFETIME_SECONDS,
      sessionKeyId: `key-tgs-${this.ticketCounter}`,
      flags: ['FORWARDABLE', 'RENEWABLE', 'RENEWED'],
      kdc: params.kdc || params.tgt.kdc || KERBEROS_DEFAULTS.DEFAULT_KDC,
      status: 'VALID',
    };

    return { ticket: tgs };
  }

  public reset(): void {
    this.ticketCounter = 1000;
  }

  public getStateSnapshot(): { ticketCounter: number } {
    return { ticketCounter: this.ticketCounter };
  }

  public restoreStateSnapshot(snapshot: { ticketCounter: number }): void {
    this.ticketCounter = snapshot.ticketCounter || 1000;
  }
}
