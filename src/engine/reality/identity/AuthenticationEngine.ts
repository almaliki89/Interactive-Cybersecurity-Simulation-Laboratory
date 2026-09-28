/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory AuthenticationEngine
 * Full Domain Logon pipeline validating domain, DNS, network path, Kerberos pre-auth, TGT issuance, and session creation.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { DirectoryStore } from './DirectoryStore';
import { KerberosEngine } from './KerberosEngine';
import { GroupResolver } from './GroupResolver';
import { DomainController } from './DomainController';
import { DomainLogonResult } from './types';

export class AuthenticationEngine {
  private store: DirectoryStore;
  private kerberosEngine: KerberosEngine;
  private groupResolver: GroupResolver;
  private dc: DomainController;

  constructor(
    store: DirectoryStore,
    kerberosEngine: KerberosEngine,
    groupResolver: GroupResolver,
    dc: DomainController
  ) {
    this.store = store;
    this.kerberosEngine = kerberosEngine;
    this.groupResolver = groupResolver;
    this.dc = dc;
  }

  public authenticateDomainUser(params: {
    workstationHost: string;
    userName: string;
    passwordProvided: string | boolean;
    vTime: number;
    networkPathAvailable: boolean;
    dnsAvailable: boolean;
    secureChannelHealthy: boolean;
    dcMachineOnline: boolean;
    localUserEnabled?: boolean;
  }): DomainLogonResult {
    const cleanUserInput = params.userName.trim();

    // 1. Secure Channel Check
    if (!params.secureChannelHealthy) {
      this.dc.recordAuthFailure();
      return {
        success: false,
        userPrincipal: cleanUserInput,
        domain: 'NEXORA.LOCAL',
        workstation: params.workstationHost,
        failureReason: 'SECURE_CHANNEL_BROKEN',
        issuedAtVirtualTime: params.vTime,
      };
    }

    // 2. Domain Controller Reachability & Network Path Check
    if (!params.dcMachineOnline || !params.networkPathAvailable) {
      this.dc.recordAuthFailure();
      return {
        success: false,
        userPrincipal: cleanUserInput,
        domain: 'NEXORA.LOCAL',
        workstation: params.workstationHost,
        failureReason: 'DOMAIN_CONTROLLER_UNREACHABLE',
        issuedAtVirtualTime: params.vTime,
      };
    }

    // 3. DNS Discovery Check
    if (!params.dnsAvailable) {
      this.dc.recordAuthFailure();
      return {
        success: false,
        userPrincipal: cleanUserInput,
        domain: 'NEXORA.LOCAL',
        workstation: params.workstationHost,
        failureReason: 'DNS_FAILURE',
        issuedAtVirtualTime: params.vTime,
      };
    }

    // 4. Account Lookup
    const user = this.store.findUser(cleanUserInput);
    if (!user) {
      this.dc.recordAuthFailure();
      return {
        success: false,
        userPrincipal: cleanUserInput,
        domain: 'NEXORA.LOCAL',
        workstation: params.workstationHost,
        failureReason: 'ACCOUNT_NOT_FOUND',
        issuedAtVirtualTime: params.vTime,
      };
    }

    // 5. Account Enabled Check
    if (!user.enabled || params.localUserEnabled === false) {
      this.dc.recordAuthFailure();
      return {
        success: false,
        userPrincipal: user.upn,
        userSid: user.sid,
        domain: 'NEXORA.LOCAL',
        workstation: params.workstationHost,
        failureReason: 'ACCOUNT_DISABLED',
        issuedAtVirtualTime: params.vTime,
      };
    }

    // 6. Password Verification / Kerberos Pre-Auth
    let passwordOk = false;
    if (typeof params.passwordProvided === 'string') {
      // Use explicit verification or baseline common password for simulation
      passwordOk = (params.passwordProvided === user.credentialVerifierHash) || 
                   (params.passwordProvided === 'P@ssword123!');
    } else {
      passwordOk = params.passwordProvided; // Legacy boolean support
    }

    if (!passwordOk) {
      this.dc.recordAuthFailure();
      return {
        success: false,
        userPrincipal: user.upn,
        userSid: user.sid,
        domain: 'NEXORA.LOCAL',
        workstation: params.workstationHost,
        failureReason: 'BAD_PASSWORD',
        issuedAtVirtualTime: params.vTime,
      };
    }

    // 7. Workstation Logon Restrictions
    if (user.logonRestrictions?.allowedWorkstations) {
      const allowed = user.logonRestrictions.allowedWorkstations.some(
        (w) => w.toUpperCase() === params.workstationHost.toUpperCase()
      );
      if (!allowed) {
        this.dc.recordAuthFailure();
        return {
          success: false,
          userPrincipal: user.upn,
          userSid: user.sid,
          domain: 'NEXORA.LOCAL',
          workstation: params.workstationHost,
          failureReason: 'LOGON_RESTRICTION',
          issuedAtVirtualTime: params.vTime,
        };
      }
    }

    // 8. Issue Kerberos TGT
    const tgt = this.kerberosEngine.issueTgt({
      user,
      vTime: params.vTime,
      kdc: this.dc.hostname,
      domain: 'NEXORA.LOCAL',
    });

    // 9. Resolve group SIDs
    const groupSids = this.groupResolver.resolveUserGroupSids(user.sid);

    // Update user last logon time
    user.lastLogonVirtualTime = params.vTime;
    this.store.updateUser(user);

    this.dc.recordAuthSuccess();
    this.dc.recordTicketIssued();

    return {
      success: true,
      userPrincipal: user.upn,
      userSid: user.sid,
      domain: 'NEXORA.LOCAL',
      workstation: params.workstationHost,
      tgt,
      groupSids,
      issuedAtVirtualTime: params.vTime,
    };
  }
}
