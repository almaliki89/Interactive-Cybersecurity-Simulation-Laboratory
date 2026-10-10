/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory & Kerberos Reality Test Suite
 * Comprehensive 31-scenario unit test suite verifying enterprise identity,
 * Kerberos TGT/TGS flows, group resolution, ACL enforcement, DC offline behavior,
 * Windows event telemetry, snapshot/restore, and replay determinism.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { globalActiveDirectoryEngine } from '../reality/identity/ActiveDirectoryEngine';
import { globalRealityEngine } from '../reality/RealityEngine';
import { globalNetworkEngine } from '../reality/network/NetworkEngine';
import { globalSimulationRuntime } from '../runtime/SimulationRuntime';
import { WELL_KNOWN_AD_SIDS } from '../reality/identity/DirectoryStore';
import { useDigitalTwinStore } from '../reality/digitalTwinStore';

describe('OMEGA ULTRA REALITY V1.3 — Active Directory & Kerberos Reality Suite', () => {
  beforeEach(() => {
    globalSimulationRuntime.clock.reset();
    globalRealityEngine.initEnterpriseEnvironment();

    // Reset baseline RealityEngine and DigitalTwinStore state
    useDigitalTwinStore.getState().syncWithRealityEngine();

    // Ensure all cables are connected and devices online
    const store = useDigitalTwinStore.getState();
    Object.keys(store.cables).forEach((cId) => {
      store.connectCable(cId);
    });
    Object.keys(store.devices).forEach((dId) => {
      if (store.devices[dId].powerStatus !== 'ONLINE') {
        store.toggleDevicePower(dId);
      }
    });

    globalActiveDirectoryEngine.store.resetToBaseline();
    globalActiveDirectoryEngine.spnRegistry.resetToBaseline();
    globalActiveDirectoryEngine.aclEngine.resetToBaseline();
    globalActiveDirectoryEngine.kerberosEngine.reset();
    globalActiveDirectoryEngine.dc.restoreStateSnapshot({
      failedAuthCount: 0,
      activeTicketCount: 0,
      totalLogonCount: 0,
      directoryQueryCount: 0,
    });
    globalActiveDirectoryEngine.getTicketCache('FIN-WS01').purge();
    globalActiveDirectoryEngine.getTicketCache('HR-WS01').purge();

    // Flush network caches
    globalNetworkEngine.dns.flushCache();
    globalNetworkEngine.arp.flush();
    globalNetworkEngine.connections.clear();
  });

  // 1. Valid domain login
  it('1. valid domain login succeeds', () => {
    const res = globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });
    expect(res.success).toBe(true);
    expect(res.userPrincipal).toBe('sara.finance@NEXORA.LOCAL');
    expect(res.tgt).toBeDefined();
  });

  // 2. Wrong password fails
  it('2. wrong password fails with BAD_PASSWORD', () => {
    const res = globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'wrong',
      vTime: 10,
    });
    expect(res.success).toBe(false);
    expect(res.failureReason).toBe('BAD_PASSWORD');
    expect(res.tgt).toBeUndefined();
  });

  // 3. Disabled account fails
  it('3. disabled account fails', () => {
    const user = globalActiveDirectoryEngine.store.findUser('sara.finance')!;
    user.enabled = false;
    globalActiveDirectoryEngine.store.updateUser(user);

    const res = globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });
    expect(res.success).toBe(false);
    expect(res.failureReason).toBe('ACCOUNT_DISABLED');
  });

  // 4. DC unavailable login fails
  it('4. DC unavailable login fails with DOMAIN_CONTROLLER_UNREACHABLE', () => {
    // Power down DC01
    const dc01Dev = globalRealityEngine.registry.getMachine('DC01')!;
    dc01Dev.shutdown(10);

    const res = globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });
    expect(res.success).toBe(false);
    expect(res.failureReason).toBe('DOMAIN_CONTROLLER_UNREACHABLE');
  });

  // 5. Reconnect restores login
  it('5. reconnect DC restores domain login', () => {
    const dc01Dev = globalRealityEngine.registry.getMachine('DC01')!;
    dc01Dev.shutdown(10);

    let res = globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });
    expect(res.success).toBe(false);

    // Boot DC01
    dc01Dev.boot(20);
    res = globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 20,
    });
    expect(res.success).toBe(true);
  });

  // 6. TGT issued after valid login
  it('6. TGT issued and placed in workstation ticket cache after valid login', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const cache = globalActiveDirectoryEngine.getTicketCache('FIN-WS01');
    const tgt = cache.getTgt();
    expect(tgt).toBeDefined();
    expect(tgt?.ticketType).toBe('TGT');
  });

  // 7. Failed login creates no TGT
  it('7. failed login creates no TGT in ticket cache', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'wrong',
      vTime: 10,
    });

    const cache = globalActiveDirectoryEngine.getTicketCache('FIN-WS01');
    expect(cache.getTgt()).toBeUndefined();
  });

  // 8. TGT has correct user principal
  it('8. TGT contains correct clientPrincipal and domain', () => {
    const res = globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    expect(res.tgt?.clientPrincipal).toBe('sara.finance@NEXORA.LOCAL');
    expect(res.tgt?.domain).toBe('NEXORA.LOCAL');
  });

  // 9. Service ticket issued for cifs/FILE01
  it('9. service ticket issued for cifs/FILE01 when requested with valid TGT', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const user = globalActiveDirectoryEngine.store.findUser('sara.finance')!;
    const res = globalActiveDirectoryEngine.accessServiceViaKerberos({
      workstationHost: 'FIN-WS01',
      userSid: user.sid,
      spn: 'cifs/FILE01',
      vTime: 15,
    });

    expect(res.ticket).toBeDefined();
    expect(res.ticket?.servicePrincipal).toBe('cifs/FILE01');
    expect(res.ticket?.ticketType).toBe('TGS');
  });

  // 10. Service ticket requires valid TGT
  it('10. service ticket request fails with NO_TGT if client has no TGT', () => {
    const user = globalActiveDirectoryEngine.store.findUser('sara.finance')!;
    const res = globalActiveDirectoryEngine.accessServiceViaKerberos({
      workstationHost: 'FIN-WS01',
      userSid: user.sid,
      spn: 'cifs/FILE01',
      vTime: 15,
    });

    expect(res.ticket).toBeUndefined();
    expect(res.failureReason).toBe('NO_TGT');
  });

  // 11. Missing SPN fails
  it('11. requesting service ticket for missing SPN returns SPN_NOT_FOUND', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const user = globalActiveDirectoryEngine.store.findUser('sara.finance')!;
    const res = globalActiveDirectoryEngine.accessServiceViaKerberos({
      workstationHost: 'FIN-WS01',
      userSid: user.sid,
      spn: 'cifs/UNKNOWN_SERVER',
      vTime: 15,
    });

    expect(res.ticket).toBeUndefined();
    expect(res.failureReason).toBe('SPN_NOT_FOUND');
  });

  // 12. Ticket expiry uses SimulationClock
  it('12. ticket expiry evaluates against SimulationClock virtual time', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const cache = globalActiveDirectoryEngine.getTicketCache('FIN-WS01');
    expect(cache.getTgt()).toBeDefined();

    // Advance virtual time past TGT lifetime (8 hours = 28,800 seconds -> vTime = 30,000)
    cache.expireTickets(30000);
    expect(cache.getTgt()).toBeUndefined();
  });

  // 13. klist shows real ticket cache
  it('13. klist CLI returns current active ticket cache items', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const out = globalNetworkEngine.executeNetworkCliCommand('FIN-WS01', 'klist', 15);
    expect(out).toContain('Cached Tickets: (1)');
    expect(out).toContain('krbtgt/NEXORA.LOCAL');
  });

  // 14. Purge empties cache
  it('14. klist purge clears workstation ticket cache', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const purgeOut = globalNetworkEngine.executeNetworkCliCommand('FIN-WS01', 'klist purge', 15);
    expect(purgeOut).toContain('purged successfully');

    const cache = globalActiveDirectoryEngine.getTicketCache('FIN-WS01');
    expect(cache.listTickets().length).toBe(0);
  });

  // 15. sara.finance resolves Finance group
  it('15. sara.finance resolves Finance Users group SIDs', () => {
    const sids = globalActiveDirectoryEngine.groupResolver.resolveUserGroupSids('sara.finance');
    expect(sids).toContain(WELL_KNOWN_AD_SIDS.FINANCE_USERS);
    expect(sids).toContain(WELL_KNOWN_AD_SIDS.DOMAIN_USERS);
  });

  // 16. omar.hr not Finance group
  it('16. omar.hr does not resolve Finance Users group', () => {
    const sids = globalActiveDirectoryEngine.groupResolver.resolveUserGroupSids('omar.hr');
    expect(sids).toContain(WELL_KNOWN_AD_SIDS.HR_USERS);
    expect(sids).not.toContain(WELL_KNOWN_AD_SIDS.FINANCE_USERS);
  });

  // 17. Finance ACL permits sara
  it('17. Finance share ACL permits sara.finance', () => {
    const sara = globalActiveDirectoryEngine.store.findUser('sara.finance')!;
    const groupSids = globalActiveDirectoryEngine.groupResolver.resolveUserGroupSids(sara.sid);

    const evalRes = globalActiveDirectoryEngine.aclEngine.evaluateAccess({
      objectPath: '\\\\FILE01\\Finance',
      userSid: sara.sid,
      groupSids,
      requestedRight: 'READ',
    });

    expect(evalRes.granted).toBe(true);
    expect(evalRes.aclDecision).toBe('ACL_ALLOW');
  });

  // 18. Finance ACL denies omar
  it('18. Finance share ACL denies omar.hr', () => {
    const omar = globalActiveDirectoryEngine.store.findUser('omar.hr')!;
    const groupSids = globalActiveDirectoryEngine.groupResolver.resolveUserGroupSids(omar.sid);

    const evalRes = globalActiveDirectoryEngine.aclEngine.evaluateAccess({
      objectPath: '\\\\FILE01\\Finance',
      userSid: omar.sid,
      groupSids,
      requestedRight: 'READ',
    });

    expect(evalRes.granted).toBe(false);
    expect(evalRes.aclDecision).toBe('ACL_DENY');
  });

  // 19. Administrator gets privileged groups
  it('19. administrator resolves privileged Domain Admins and Administrators groups', () => {
    const sids = globalActiveDirectoryEngine.groupResolver.resolveUserGroupSids('administrator');
    expect(sids).toContain(WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS);
    expect(sids).toContain(WELL_KNOWN_AD_SIDS.ADMINISTRATORS);
  });

  // 20. SMB Finance requires Kerberos TGS
  it('20. SMB Finance share access requires valid Kerberos TGS', () => {
    const sara = globalActiveDirectoryEngine.store.findUser('sara.finance')!;

    // Without domain logon (no TGT) -> SMB access fails
    const resNoAuth = globalActiveDirectoryEngine.accessShare({
      workstationHost: 'FIN-WS01',
      userSid: sara.sid,
      sharePath: '\\\\FILE01\\Finance',
      vTime: 10,
    });
    expect(resNoAuth.success).toBe(false);
    expect(resNoAuth.failureReason).toBe('NO_TGT');

    // With domain logon -> TGT present -> TGS requested -> Access succeeds!
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const resAuth = globalActiveDirectoryEngine.accessShare({
      workstationHost: 'FIN-WS01',
      userSid: sara.sid,
      sharePath: '\\\\FILE01\\Finance',
      vTime: 15,
    });
    expect(resAuth.success).toBe(true);
    expect(resAuth.ticketUsed?.servicePrincipal).toBe('cifs/FILE01');
  });

  // 21. DC offline + cached TGS behavior correct
  it('21. DC offline allows SMB access if TGS is already cached in client workstation cache', () => {
    const sara = globalActiveDirectoryEngine.store.findUser('sara.finance')!;

    // 1. Authenticate and obtain TGS while DC01 is online
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });
    globalActiveDirectoryEngine.accessShare({
      workstationHost: 'FIN-WS01',
      userSid: sara.sid,
      sharePath: '\\\\FILE01\\Finance',
      vTime: 15,
    });

    // 2. Shut down DC01
    const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
    dc01.shutdown(20);

    // 3. Access share again -> Uses cached unexpired TGS -> Access succeeds!
    const resCached = globalActiveDirectoryEngine.accessShare({
      workstationHost: 'FIN-WS01',
      userSid: sara.sid,
      sharePath: '\\\\FILE01\\Finance',
      vTime: 25,
    });
    expect(resCached.success).toBe(true);
  });

  // 22. No cached TGS + DC offline fails
  it('22. DC offline fails new TGS request if no cached TGS exists', () => {
    const sara = globalActiveDirectoryEngine.store.findUser('sara.finance')!;

    // Authenticate to get TGT
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    // Shut down DC01 BEFORE requesting TGS for cifs/FILE01
    const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
    dc01.shutdown(20);

    const res = globalActiveDirectoryEngine.accessShare({
      workstationHost: 'FIN-WS01',
      userSid: sara.sid,
      sharePath: '\\\\FILE01\\Finance',
      vTime: 25,
    });
    expect(res.success).toBe(false);
    expect(res.failureReason).toBe('DOMAIN_CONTROLLER_UNREACHABLE');
  });

  // 23. 4624 generated on success
  it('23. Event 4624 generated on successful domain logon', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const finWs = globalRealityEngine.registry.getMachine('FIN-WS01')!;
    const logs = finWs.getEventLogs();
    const event4624 = logs.find((l) => l.eventId === 4624);
    expect(event4624).toBeDefined();
    expect(event4624?.user).toBe('sara.finance@NEXORA.LOCAL');
  });

  // 24. 4625 generated on failure
  it('24. Event 4625 generated on failed domain logon', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'wrong',
      vTime: 10,
    });

    const finWs = globalRealityEngine.registry.getMachine('FIN-WS01')!;
    const logs = finWs.getEventLogs();
    const event4625 = logs.find((l) => l.eventId === 4625);
    expect(event4625).toBeDefined();
  });

  // 25. 4768 generated for TGT
  it('25. Event 4768 generated on DC01 for TGT request', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
    const logs = dc01.getEventLogs();
    const event4768 = logs.find((l) => l.eventId === 4768);
    expect(event4768).toBeDefined();
  });

  // 26. 4769 generated for TGS
  it('26. Event 4769 generated on DC01 for TGS request', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const sara = globalActiveDirectoryEngine.store.findUser('sara.finance')!;
    globalActiveDirectoryEngine.accessServiceViaKerberos({
      workstationHost: 'FIN-WS01',
      userSid: sara.sid,
      spn: 'cifs/FILE01',
      vTime: 15,
    });

    const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
    const logs = dc01.getEventLogs();
    const event4769 = logs.find((l) => l.eventId === 4769);
    expect(event4769).toBeDefined();
  });

  // 27. 4771-like event on preauth failure
  it('27. Event 4771 generated on DC01 for pre-auth failure', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'wrong',
      vTime: 10,
    });

    const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
    const logs = dc01.getEventLogs();
    const event4771 = logs.find((l) => l.eventId === 4771);
    expect(event4771).toBeDefined();
  });

  // 28. logoff clears appropriate session linkage
  it('28. logoff terminates active logon session on workstation', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const finWs = globalRealityEngine.registry.getMachine('FIN-WS01')!;
    const activeSess = finWs.getSessions().find((s) => s.status === 'ACTIVE')!;
    expect(activeSess).toBeDefined();

    finWs.logoffSession(activeSess.sessionId, 20);
    const updatedSess = finWs.getSessions().find((s) => s.sessionId === activeSess.sessionId);
    expect(updatedSess?.status).toBe('LOGGED_OFF');
  });

  // 29. Snapshot restores tickets
  it('29. RealityEngine snapshot captures and restores Kerberos ticket cache', () => {
    globalActiveDirectoryEngine.performDomainLogon({
      workstationHost: 'FIN-WS01',
      userName: 'sara.finance',
      passwordProvided: 'P@ssword123!',
      vTime: 10,
    });

    const snapshot = globalRealityEngine.getStateSnapshot();

    // Purge cache
    globalActiveDirectoryEngine.getTicketCache('FIN-WS01').purge();
    expect(globalActiveDirectoryEngine.getTicketCache('FIN-WS01').listTickets().length).toBe(0);

    // Restore snapshot
    globalRealityEngine.restoreStateSnapshot(snapshot);
    expect(globalActiveDirectoryEngine.getTicketCache('FIN-WS01').listTickets().length).toBeGreaterThan(0);
  });

  // 30. Snapshot restores directory membership
  it('30. RealityEngine snapshot restores DirectoryStore state', () => {
    const snapshot = globalRealityEngine.getStateSnapshot();

    // Modify directory user
    const sara = globalActiveDirectoryEngine.store.findUser('sara.finance')!;
    sara.enabled = false;
    globalActiveDirectoryEngine.store.updateUser(sara);
    expect(globalActiveDirectoryEngine.store.findUser('sara.finance')?.enabled).toBe(false);

    // Restore
    globalRealityEngine.restoreStateSnapshot(snapshot);
    expect(globalActiveDirectoryEngine.store.findUser('sara.finance')?.enabled).toBe(true);
  });

  // 31. Same scenario twice produces identical final state (Determinism)
  it('31. same scenario executed twice produces identical state snapshot', () => {
    const runScenario = () => {
      globalSimulationRuntime.clock.reset();
      globalRealityEngine.initEnterpriseEnvironment();

      // Reset baseline RealityEngine and DigitalTwinStore state
      useDigitalTwinStore.getState().syncWithRealityEngine();

      // Ensure all cables are connected and devices online
      const store = useDigitalTwinStore.getState();
      Object.keys(store.cables).forEach((cId) => {
        store.connectCable(cId);
      });
      Object.keys(store.devices).forEach((dId) => {
        if (store.devices[dId].powerStatus !== 'ONLINE') {
          store.toggleDevicePower(dId);
        }
      });

      globalNetworkEngine.resetToBaselineTopology();
      globalActiveDirectoryEngine.store.resetToBaseline();
      globalActiveDirectoryEngine.spnRegistry.resetToBaseline();
      globalActiveDirectoryEngine.aclEngine.resetToBaseline();
      globalActiveDirectoryEngine.kerberosEngine.reset();
      globalActiveDirectoryEngine.dc.restoreStateSnapshot({
        failedAuthCount: 0,
        activeTicketCount: 0,
        totalLogonCount: 0,
        directoryQueryCount: 0,
      });
      globalActiveDirectoryEngine.getTicketCache('FIN-WS01').purge();
      globalActiveDirectoryEngine.getTicketCache('HR-WS01').purge();

      globalNetworkEngine.dns.flushCache();
      globalNetworkEngine.arp.flush();
      globalNetworkEngine.connections.clear();

      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });

      const user = globalActiveDirectoryEngine.store.findUser('sara.finance')!;
      globalActiveDirectoryEngine.accessShare({
        workstationHost: 'FIN-WS01',
        userSid: user.sid,
        sharePath: '\\\\FILE01\\Finance',
        vTime: 15,
      });

      return globalRealityEngine.getStateSnapshot();
    };

    const snap1 = runScenario();
    const snap2 = runScenario();

    expect(JSON.stringify(snap1)).toBe(JSON.stringify(snap2));
  });

  // =========================================================================
  // V1.3.4 REGRESSION TESTS (Items 1 - 12)
  // =========================================================================
  describe('V1.3.4 Regression Tests', () => {
    it('1. no session -> SMB denied with NO_AUTHENTICATED_SESSION', () => {
      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
      });
      expect(res.success).toBe(false);
      expect(res.authenticationSucceeded).toBe(false);
      expect(res.authorizationSucceeded).toBe(false);
      expect(res.failureReason).toBe('NO_AUTHENTICATED_SESSION');
    });

    it('2. session + TGT -> SMB auth works', () => {
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
      });
      expect(res.authenticationSucceeded).toBe(true);
    });

    it('3. Sara -> Finance allow', () => {
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
      });
      expect(res.success).toBe(true);
      expect(res.authenticationSucceeded).toBe(true);
      expect(res.authorizationSucceeded).toBe(true);
      expect(res.user).toBe('sara.finance');
      expect(res.serviceSpn).toBe('cifs/FILE01');
    });

    it('4. Omar -> Finance deny', () => {
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'omar.hr',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
      });
      expect(res.success).toBe(false);
      expect(res.authenticationSucceeded).toBe(true);
      expect(res.authorizationSucceeded).toBe(false);
      expect(res.failureReason).toBe('ACCESS_DENIED');
    });

    it('5. no TGT -> SMB denied with NO_TGT', () => {
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });

      // Purge Kerberos cache
      globalActiveDirectoryEngine.getTicketCache('FIN-WS01').purge();

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
      });
      expect(res.success).toBe(false);
      expect(res.failureReason).toBe('NO_TGT');
    });

    it('6. missing SPN -> fail', () => {
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });

      // Remove SPN for cifs/FILE01
      (globalActiveDirectoryEngine.spnRegistry as any).spns.delete('CIFS/FILE01');
      (globalActiveDirectoryEngine.spnRegistry as any).spns.delete('cifs/file01');

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
      });
      expect(res.success).toBe(false);
      expect(res.failureReason).toBe('SPN_NOT_FOUND');
    });

    it('7. DC offline + cached TGS behavior', () => {
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });

      // Access share to obtain and cache TGS
      const resInitial = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
        virtualTime: 15,
      });
      expect(resInitial.success).toBe(true);

      // Power off DC01
      const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
      dc01.shutdown(20);

      // Subsequent access with cached TGS succeeds
      const resCached = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
        virtualTime: 25,
      });
      expect(resCached.success).toBe(true);
      expect(resCached.authorizationSucceeded).toBe(true);
    });

    it('8. DC offline + no cached TGS fail', () => {
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });

      // Pre-resolve DNS while DC01 is still online so DNS resolution succeeds
      globalNetworkEngine.queryDns('FIN-WS01', 'FILE01', 12);

      // Shut down DC01 before TGS is requested
      const dc01 = globalRealityEngine.registry.getMachine('DC01')!;
      dc01.shutdown(15);

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
        virtualTime: 20,
      });
      expect(res.success).toBe(false);
      expect(res.failureReason).toBe('DOMAIN_CONTROLLER_UNREACHABLE');
    });

    it('9. no hidden login created by SMB', () => {
      const finWs = globalRealityEngine.registry.getMachine('FIN-WS01')!;
      // Clear sessions
      finWs.getSessions().forEach((s) => finWs.logoffSession(s.sessionId, 0));
      expect(finWs.getSessions().filter((s) => s.status === 'ACTIVE').length).toBe(0);

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
      });
      expect(res.success).toBe(false);
      expect(res.failureReason).toBe('NO_AUTHENTICATED_SESSION');
      // Verify no session was silently created
      expect(finWs.getSessions().filter((s) => s.status === 'ACTIVE').length).toBe(0);
    });

    it('10. no hardcoded password in network engine', () => {
      // Trying to pass an arbitrary username that does not match active session must be rejected
      globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'omar.hr',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });

      const res = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: 'FIN-WS01',
        serverHostname: 'FILE01',
        shareName: 'Finance',
        userName: 'sara.finance', // Attempting to spoof identity
      });
      expect(res.success).toBe(false);
      expect(res.failureReason).toBe('NO_AUTHENTICATED_SESSION');
    });

    it('11. cable disconnect login fail', () => {
      const store = useDigitalTwinStore.getState();
      store.disconnectCable('CAB-SRV-DC01');

      const res = globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });
      expect(res.success).toBe(false);
      expect(res.failureReason).toBe('DOMAIN_CONTROLLER_UNREACHABLE');
    });

    it('12. reconnect login succeeds', () => {
      const store = useDigitalTwinStore.getState();
      store.disconnectCable('CAB-SRV-DC01');
      store.connectCable('CAB-SRV-DC01');

      const res = globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: 'P@ssword123!',
        vTime: 10,
      });
      expect(res.success).toBe(true);
      expect(res.tgt).toBeDefined();
    });

    it('13. rejects empty or whitespace passwords without bypass', () => {
      const emptyRes = globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: '',
        vTime: 10,
      });
      expect(emptyRes.success).toBe(false);
      expect(emptyRes.failureReason).toBe('BAD_PASSWORD');

      const spaceRes = globalActiveDirectoryEngine.performDomainLogon({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: '   ',
        vTime: 10,
      });
      expect(spaceRes.success).toBe(false);
      expect(spaceRes.failureReason).toBe('BAD_PASSWORD');
    });

    it('14. supports explicit isolated educational bypass flag only when specifically enabled', () => {
      const authEngine = (globalActiveDirectoryEngine as any).authEngine;
      const bypassRes = authEngine.authenticateDomainUser({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: '',
        vTime: 10,
        networkPathAvailable: true,
        dnsAvailable: true,
        secureChannelHealthy: true,
        dcMachineOnline: true,
        allowEducationalBypass: true,
      });
      expect(bypassRes.success).toBe(true);
      expect(bypassRes.tgt).toBeDefined();

      const noBypassRes = authEngine.authenticateDomainUser({
        workstationHost: 'FIN-WS01',
        userName: 'sara.finance',
        passwordProvided: '',
        vTime: 10,
        networkPathAvailable: true,
        dnsAvailable: true,
        secureChannelHealthy: true,
        dcMachineOnline: true,
        allowEducationalBypass: false,
      });
      expect(noBypassRes.success).toBe(false);
      expect(noBypassRes.failureReason).toBe('BAD_PASSWORD');
    });

    it('15. rejects missing, empty, or whitespace password via UI attemptLogon', () => {
      // Missing password
      const resMissing = globalRealityEngine.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        password: '',
      });
      expect(resMissing.success).toBe(false);
      expect(resMissing.failureReason).toBe('BAD_PASSWORD');

      // Whitespace password
      const resSpace = globalRealityEngine.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        password: '   ',
      });
      expect(resSpace.success).toBe(false);
      expect(resSpace.failureReason).toBe('BAD_PASSWORD');
    });

    it('16. rejects incorrect and case-mismatched passwords', () => {
      // Completely wrong password
      const resWrong = globalRealityEngine.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        password: 'IncorrectPassword123',
      });
      expect(resWrong.success).toBe(false);
      expect(resWrong.failureReason).toBe('BAD_PASSWORD');

      // Case-mismatch (lowercase 'p' instead of capital 'P')
      const resCase = globalRealityEngine.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        password: 'p@ssword123!',
      });
      expect(resCase.success).toBe(false);
      expect(resCase.failureReason).toBe('BAD_PASSWORD');
    });

    it('17. proves untrusted UI parameters cannot activate allowEducationalBypass', () => {
      // Malicious attempt to inject allowEducationalBypass into UI logon
      const maliciousPayload: any = {
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        password: '',
        allowEducationalBypass: true,
      };

      const res = globalRealityEngine.attemptLogon(maliciousPayload);
      expect(res.success).toBe(false);
      expect(res.failureReason).toBe('BAD_PASSWORD');
    });
  });
});
