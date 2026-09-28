/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory Kerberos TicketCache
 * Local workstation/session Kerberos ticket cache.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { KerberosTicket } from './types';

export class TicketCache {
  private tickets: Map<string, KerberosTicket> = new Map();

  public addTicket(ticket: KerberosTicket): void {
    this.tickets.set(ticket.ticketId, { ...ticket });
  }

  public getTgt(clientPrincipal?: string): KerberosTicket | undefined {
    let bestTgt: KerberosTicket | undefined;
    for (const ticket of this.tickets.values()) {
      if (
        ticket.ticketType === 'TGT' &&
        ticket.status === 'VALID' &&
        (!clientPrincipal || ticket.clientPrincipal.toLowerCase() === clientPrincipal.toLowerCase())
      ) {
        if (!bestTgt || ticket.expiresAtVirtualTime > bestTgt.expiresAtVirtualTime) {
          bestTgt = ticket;
        }
      }
    }
    return bestTgt;
  }

  public getServiceTicket(spn: string, clientPrincipal?: string): KerberosTicket | undefined {
    const cleanSpn = spn.trim().toUpperCase();
    for (const ticket of this.tickets.values()) {
      if (
        ticket.ticketType === 'TGS' &&
        ticket.status === 'VALID' &&
        (ticket.servicePrincipal.toUpperCase() === cleanSpn || cleanSpn.startsWith(ticket.servicePrincipal.toUpperCase())) &&
        (!clientPrincipal || ticket.clientPrincipal.toLowerCase() === clientPrincipal.toLowerCase())
      ) {
        return ticket;
      }
    }
    return undefined;
  }

  public listTickets(clientPrincipal?: string): KerberosTicket[] {
    const list: KerberosTicket[] = [];
    for (const ticket of this.tickets.values()) {
      if (ticket.status !== 'PURGED') {
        if (!clientPrincipal || ticket.clientPrincipal.toLowerCase() === clientPrincipal.toLowerCase()) {
          list.push({ ...ticket });
        }
      }
    }
    return list;
  }

  public expireTickets(virtualTime: number): void {
    for (const [id, ticket] of this.tickets.entries()) {
      if (ticket.expiresAtVirtualTime <= virtualTime && ticket.status === 'VALID') {
        this.tickets.set(id, { ...ticket, status: 'EXPIRED' });
      }
    }
  }

  public purge(clientPrincipal?: string): void {
    if (!clientPrincipal) {
      this.tickets.clear();
      return;
    }
    for (const [id, ticket] of this.tickets.entries()) {
      if (ticket.clientPrincipal.toLowerCase() === clientPrincipal.toLowerCase()) {
        this.tickets.delete(id);
      }
    }
  }

  public getStateSnapshot(): KerberosTicket[] {
    return Array.from(this.tickets.values());
  }

  public restoreStateSnapshot(snapshot: KerberosTicket[]): void {
    this.tickets.clear();
    snapshot.forEach((t) => this.tickets.set(t.ticketId, { ...t }));
  }
}
