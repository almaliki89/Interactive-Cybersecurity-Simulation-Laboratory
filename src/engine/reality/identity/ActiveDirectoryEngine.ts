/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory Engine Master Orchestrator
 * Integrates DirectoryStore, SpnRegistry, KerberosEngine, GroupResolver, AclEngine, DomainController, and AuthenticationEngine.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { DirectoryStore } from './DirectoryStore';
import { SpnRegistry } from './SpnRegistry';
import { TicketCache } from './TicketCache';
import { KerberosEngine } from './KerberosEngine';
import { GroupResolver } from './GroupResolver';
import { AclEngine } from './AclEngine';
import { DomainController } from './DomainController';
import { AuthenticationEngine } from './AuthenticationEngine';
import {
  DomainLogonResult,
  ServiceAccessResult,
  ActiveDirectorySnapshot,
  KerberosTicket,
  AccessRight,
} from './types';
import { globalSimulationRuntime } from '../../runtime/SimulationRuntime';
import { globalRealityEngine } from '../RealityEngine';
import { globalNetworkEngine } from '../network/NetworkEngine';

export class ActiveDirectoryEngine {
  public readonly store: DirectoryStore;
  public readonly spnRegistry: SpnRegistry;
  public readonly kerberosEngine: KerberosEngine;
  public readonly groupResolver: GroupResolver;
  public readonly aclEngine: AclEngine;
  public readonly dc: DomainController;
  public readonly authEngine: AuthenticationEngine;

  // Workstation/Session ticket caches (Keyed by workstation or session)
  private workstationCaches: Map<string, TicketCache> = new Map();

  constructor() {
    this.store = new DirectoryStore();
    this.spnRegistry = new SpnRegistry();
    this.kerberosEngine = new KerberosEngine();
    this.groupResolver = new GroupResolver(this.store);
    this.aclEngine = new AclEngine();
    this.dc = new DomainController();
    this.authEngine = new AuthenticationEngine(
      this.store,
      this.kerberosEngine,
      this.groupResolver,
      this.dc
    );
  }

  public getTicketCache(workstationHost: string): TicketCache {
    const key = workstationHost.trim().toUpperCase();
    let cache = this.workstationCaches.get(key);
    if (!cache) {
      cache = new TicketCache();
      this.workstationCaches.set(key, cache);
    }
    return cache;
  }

  /**
   * Helper to evaluate DC reachability from a workstation host
   */
  public isDcReachable(workstationHost: string, registry?: any): { networkOk: boolean; dnsOk: boolean; dcOnline: boolean } {
    const reg = registry || globalRealityEngine.registry;
    const dcMachine = reg.getMachine('DC01');
    const dcOnline = dcMachine ? dcMachine.status === 'ONLINE' : false;

    // Test DNS resolution for NEXORA.LOCAL or DC01
    const dnsRes = globalNetworkEngine.queryDns(workstationHost, 'DC01.NEXORA.LOCAL');
    const dnsOk = dnsRes.success;

    // Test network path availability
    const pingRes = globalNetworkEngine.ping(workstationHost, 'DC01');
    const networkOk = pingRes.success;

    return { networkOk, dnsOk, dcOnline };
  }

  /**
   * Authenticates domain logon request
   */
  public performDomainLogon(params: {
    workstationHost: string;
    userName: string;
    passwordProvided: string | boolean;
    vTime?: number;
    registry?: any;
  }): DomainLogonResult {
    const vTime = params.vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    const dcStatus = this.isDcReachable(params.workstationHost, params.registry);

    const reg = params.registry || globalRealityEngine.registry;
    const workstationMachine = reg.getMachine(params.workstationHost);
    const secureChannelHealthy = workstationMachine ? (workstationMachine as any).secureChannelState !== 'BROKEN_TRUST' : true;

    // Check if user is disabled locally on workstation for legacy test support
    let localUserEnabled = true;
    if (workstationMachine) {
      const cleanUser = params.userName.split('\\').pop() || params.userName;
      const localUser = workstationMachine.getUserByName(cleanUser);
      if (localUser && !localUser.enabled) {
        localUserEnabled = false;
      }
    }

    // Dispatch AS-REQ event
    globalSimulationRuntime.dispatch({
      type: 'KERBEROS_AS_REQ',
      category: 'IDENTITY',
      source: params.workstationHost,
      target: 'DC01',
      severity: 'info',
      description: `Kerberos AS-REQ pre-auth for user '${params.userName}' on ${params.workstationHost}`,
      payload: { user: params.userName, workstation: params.workstationHost, virtualTime: vTime },
    });

    const result = this.authEngine.authenticateDomainUser({
      workstationHost: params.workstationHost,
      userName: params.userName,
      passwordProvided: params.passwordProvided,
      vTime,
      networkPathAvailable: dcStatus.networkOk,
      dnsAvailable: dcStatus.dnsOk,
      secureChannelHealthy,
      dcMachineOnline: dcStatus.dcOnline,
      localUserEnabled,
    });

    if (!result.success) {
      // Record failure telemetry
      globalSimulationRuntime.dispatch({
        type: 'AD_AUTH_FAILURE',
        category: 'IDENTITY',
        source: params.workstationHost,
        target: 'DC01',
        severity: 'warn',
        description: `Domain authentication failed for '${params.userName}': ${result.failureReason}`,
        payload: { user: params.userName, failureReason: result.failureReason, virtualTime: vTime },
      });

      // Emit 4625 & 4771 event logs on workstation and DC01
      const dcMachine = reg.getMachine('DC01');
      if (dcMachine && dcStatus.dcOnline) {
        dcMachine.addEventLog({
          channel: 'Security',
          eventId: 4771,
          virtualTime: vTime,
          provider: 'Microsoft-Windows-Security-Auditing',
          level: 'Warning',
          task: 'Kerberos Pre-authentication',
          computer: 'DC01',
          user: params.userName,
          data: {
            clientAddress: workstationMachine?.ipAddress || '10.10.30.15',
            clientName: params.workstationHost,
            failureCode: result.failureReason === 'BAD_PASSWORD' ? '0x18' : '0x6',
            targetUserName: params.userName,
            targetDomainName: 'NEXORA.LOCAL',
          },
        });
      }

      if (workstationMachine) {
        workstationMachine.createSession({
          userName: params.userName,
          logonType: 'Interactive',
          authPackage: 'Kerberos',
          virtualTime: vTime,
          success: false,
          failureReason: result.failureReason,
        });
      }

      return result;
    }

    // SUCCESS LOGON FLOW
    const cache = this.getTicketCache(params.workstationHost);
    if (result.tgt) {
      cache.addTicket(result.tgt);
    }

    // Synchronize session and token onto the workstation machine
    if (workstationMachine) {
      const session = workstationMachine.createSession({
        userName: result.userPrincipal,
        userSid: result.userSid,
        logonType: 'Interactive',
        authPackage: 'Kerberos',
        virtualTime: vTime,
        success: true,
      });

      if (session) {
        result.sessionId = session.sessionId;
        result.tokenId = session.tokenId;

        // Ensure token groupSids matches resolved group SIDs
        const token = workstationMachine.getToken(session.tokenId);
        if (token && result.groupSids) {
          token.groupSids = [...result.groupSids];
        }
      }
    }

    // Record success telemetry
    globalSimulationRuntime.dispatch({
      type: 'KERBEROS_TGT_ISSUED',
      category: 'IDENTITY',
      source: 'DC01',
      target: params.workstationHost,
      severity: 'info',
      description: `Kerberos TGT granted to '${result.userPrincipal}'`,
      payload: { tgt: result.tgt, virtualTime: vTime },
    });

    globalSimulationRuntime.dispatch({
      type: 'AD_AUTH_SUCCESS',
      category: 'IDENTITY',
      source: params.workstationHost,
      target: 'DC01',
      severity: 'info',
      description: `Domain authentication succeeded for '${result.userPrincipal}'`,
      payload: { user: result.userPrincipal, sid: result.userSid, virtualTime: vTime },
    });

    // Emit Event 4768 on DC01
    const dcMachine = reg.getMachine('DC01');
    if (dcMachine && dcStatus.dcOnline) {
      dcMachine.addEventLog({
        channel: 'Security',
        eventId: 4768,
        virtualTime: vTime,
        provider: 'Microsoft-Windows-Security-Auditing',
        level: 'Information',
        task: 'Kerberos Authentication Service',
        computer: 'DC01',
        user: result.userPrincipal,
        data: {
          targetUserName: result.userPrincipal,
          targetDomainName: 'NEXORA.LOCAL',
          ticketOptions: '0x40810010',
          ticketEncryptionType: '0x12',
          clientAddress: workstationMachine?.ipAddress || '10.10.30.15',
        },
      });
    }

    return result;
  }

  /**
   * Requests a Kerberos Service Ticket (TGS) for a specific SPN
   */
  public accessServiceViaKerberos(params: {
    workstationHost: string;
    userSid: string;
    spn: string;
    vTime?: number;
  }): { ticket?: KerberosTicket; failureReason?: 'SPN_NOT_FOUND' | 'DOMAIN_CONTROLLER_UNREACHABLE' | 'TGT_EXPIRED' | 'NO_TGT' } {
    const vTime = params.vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    const cache = this.getTicketCache(params.workstationHost);

    // 1. Expire stale tickets in cache first using SimulationClock
    cache.expireTickets(vTime);

    // 2. Check if SPN exists in SPN Registry
    const spnMapping = this.spnRegistry.resolveSpn(params.spn);
    if (!spnMapping) {
      globalSimulationRuntime.dispatch({
        type: 'SPN_NOT_FOUND',
        category: 'IDENTITY',
        source: params.workstationHost,
        target: 'DC01',
        severity: 'warn',
        description: `SPN '${params.spn}' not found in Active Directory registry`,
        payload: { spn: params.spn, virtualTime: vTime },
      });
      return { failureReason: 'SPN_NOT_FOUND' };
    }

    // 3. Check for valid existing TGS in client cache
    const existingTgs = cache.getServiceTicket(params.spn);
    if (existingTgs) {
      return { ticket: existingTgs };
    }

    // 4. No cached TGS -> Require valid TGT to request TGS from KDC
    const user = this.store.findUser(params.userSid);
    const tgt = cache.getTgt(user ? `${user.samAccountName}@NEXORA.LOCAL` : undefined);

    if (!tgt) {
      return { failureReason: 'NO_TGT' };
    }

    if (tgt.expiresAtVirtualTime <= vTime || tgt.status !== 'VALID') {
      return { failureReason: 'TGT_EXPIRED' };
    }

    // 5. Contact KDC (DC01) to request TGS
    const dcStatus = this.isDcReachable(params.workstationHost);
    if (!dcStatus.dcOnline || !dcStatus.networkOk) {
      return { failureReason: 'DOMAIN_CONTROLLER_UNREACHABLE' };
    }

    // Dispatch TGS-REQ
    globalSimulationRuntime.dispatch({
      type: 'KERBEROS_TGS_REQ',
      category: 'IDENTITY',
      source: params.workstationHost,
      target: 'DC01',
      severity: 'info',
      description: `Kerberos TGS-REQ for SPN '${params.spn}' by '${tgt.clientPrincipal}'`,
      payload: { spn: params.spn, tgtId: tgt.ticketId, virtualTime: vTime },
    });

    const tgsResult = this.kerberosEngine.issueTgs({
      tgt,
      spn: params.spn,
      vTime,
      kdc: this.dc.hostname,
    });

    if (tgsResult.failureReason || !tgsResult.ticket) {
      return { failureReason: tgsResult.failureReason === 'TGT_EXPIRED' ? 'TGT_EXPIRED' : 'NO_TGT' };
    }

    const tgs = tgsResult.ticket;
    cache.addTicket(tgs);
    this.dc.recordTicketIssued();

    globalSimulationRuntime.dispatch({
      type: 'KERBEROS_TGS_ISSUED',
      category: 'IDENTITY',
      source: 'DC01',
      target: params.workstationHost,
      severity: 'info',
      description: `Kerberos TGS issued for '${params.spn}' to '${tgs.clientPrincipal}'`,
      payload: { tgs, virtualTime: vTime },
    });

    // Event 4769 on DC01
    const dcMachine = globalRealityEngine.registry.getMachine('DC01');
    if (dcMachine) {
      dcMachine.addEventLog({
        channel: 'Security',
        eventId: 4769,
        virtualTime: vTime,
        provider: 'Microsoft-Windows-Security-Auditing',
        level: 'Information',
        task: 'Kerberos Service Ticket Operations',
        computer: 'DC01',
        user: tgs.clientPrincipal,
        data: {
          targetUserName: tgs.clientPrincipal,
          serviceName: params.spn,
          serviceSid: spnMapping.targetAccountSid,
          ticketEncryptionType: '0x12',
          ticketOptions: '0x40810000',
        },
      });
    }

    return { ticket: tgs };
  }

  /**
   * Full Enterprise SMB Share Access with Kerberos Authentication and ACL Authorization
   */
  public accessShare(params: {
    workstationHost: string;
    userSid: string;
    sharePath: string; // e.g. '\\FILE01\Finance'
    requestedRight?: AccessRight;
    vTime?: number;
  }): ServiceAccessResult {
    const vTime = params.vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    const right = params.requestedRight || 'READ';
    const user = this.store.findUser(params.userSid);
    const userPrincipal = user ? user.upn : params.userSid;

    // Parse target hostname from sharePath
    const parts = params.sharePath.replace(/^\\\\/, '').split('\\');
    const targetHost = parts[0] ? parts[0].toUpperCase() : 'FILE01';
    const spn = `cifs/${targetHost}`;

    // 1. Kerberos Service Ticket Authentication
    const kerberosRes = this.accessServiceViaKerberos({
      workstationHost: params.workstationHost,
      userSid: params.userSid,
      spn,
      vTime,
    });

    if (!kerberosRes.ticket) {
      return {
        success: false,
        serviceSpn: spn,
        targetHost,
        userPrincipal,
        userSid: params.userSid,
        grantedRights: [],
        failureReason: kerberosRes.failureReason === 'SPN_NOT_FOUND' ? 'SPN_NOT_FOUND' : (kerberosRes.failureReason === 'DOMAIN_CONTROLLER_UNREACHABLE' ? 'DOMAIN_CONTROLLER_UNREACHABLE' : 'NO_TGT'),
      };
    }

    // 2. Resolve User & Group SIDs
    const groupSids = this.groupResolver.resolveUserGroupSids(params.userSid);

    // 3. ACL Authorization Evaluation
    const aclEval = this.aclEngine.evaluateAccess({
      objectPath: params.sharePath,
      userSid: params.userSid,
      groupSids,
      requestedRight: right,
    });

    if (!aclEval.granted) {
      globalSimulationRuntime.dispatch({
        type: 'ACL_DENY',
        category: 'IDENTITY',
        source: params.workstationHost,
        target: targetHost,
        severity: 'warn',
        description: `ACL DENY: User '${userPrincipal}' denied '${right}' access to '${params.sharePath}'`,
        payload: { user: userPrincipal, sharePath: params.sharePath, requestedRight: right, virtualTime: vTime },
      });

      return {
        success: false,
        serviceSpn: spn,
        targetHost,
        userPrincipal,
        userSid: params.userSid,
        ticketUsed: kerberosRes.ticket,
        grantedRights: [],
        failureReason: 'ACCESS_DENIED',
        aclDecision: 'ACL_DENY',
      };
    }

    // 4. Access Granted
    globalSimulationRuntime.dispatch({
      type: 'ACL_ALLOW',
      category: 'IDENTITY',
      source: params.workstationHost,
      target: targetHost,
      severity: 'info',
      description: `ACL ALLOW: User '${userPrincipal}' granted '${right}' access to '${params.sharePath}'`,
      payload: { user: userPrincipal, sharePath: params.sharePath, grantedRight: right, virtualTime: vTime },
    });

    return {
      success: true,
      serviceSpn: spn,
      targetHost,
      userPrincipal,
      userSid: params.userSid,
      ticketUsed: kerberosRes.ticket,
      grantedRights: [right],
      aclDecision: 'ACL_ALLOW',
    };
  }

  // --- SNAPSHOT & RESTORE INTEGRATION ---

  public getStateSnapshot(): ActiveDirectorySnapshot {
    const dirSnap = this.store.getStateSnapshot();
    const ticketCachesSnap: Record<string, KerberosTicket[]> = {};

    this.workstationCaches.forEach((cache, key) => {
      ticketCachesSnap[key] = cache.getStateSnapshot();
    });

    return {
      domain: 'NEXORA.LOCAL',
      netbios: 'NEXORA',
      ous: dirSnap.ous,
      users: dirSnap.users,
      groups: dirSnap.groups,
      computers: dirSnap.computers,
      serviceAccounts: dirSnap.serviceAccounts,
      spns: this.spnRegistry.getStateSnapshot(),
      ticketCaches: ticketCachesSnap,
      acls: this.aclEngine.getStateSnapshot(),
      stats: this.dc.getStateSnapshot(),
    };
  }

  public restoreStateSnapshot(snapshot: ActiveDirectorySnapshot): void {
    if (!snapshot) return;

    this.store.restoreStateSnapshot({
      ous: snapshot.ous || [],
      users: snapshot.users || [],
      groups: snapshot.groups || [],
      computers: snapshot.computers || [],
      serviceAccounts: snapshot.serviceAccounts || [],
    });

    if (snapshot.spns) {
      this.spnRegistry.restoreStateSnapshot(snapshot.spns);
    }

    if (snapshot.acls) {
      this.aclEngine.restoreStateSnapshot(snapshot.acls);
    }

    if (snapshot.stats) {
      this.dc.restoreStateSnapshot(snapshot.stats);
    }

    this.workstationCaches.clear();
    if (snapshot.ticketCaches) {
      Object.entries(snapshot.ticketCaches).forEach(([key, tickets]) => {
        const cache = new TicketCache();
        cache.restoreStateSnapshot(tickets);
        this.workstationCaches.set(key, cache);
      });
    }
  }
}

// Global Active Directory Engine singleton
export const globalActiveDirectoryEngine = new ActiveDirectoryEngine();
