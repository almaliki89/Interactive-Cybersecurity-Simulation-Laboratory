import { describe, it, expect, beforeEach } from 'vitest';
import { RealityEngine, globalRealityEngine } from '../RealityEngine';
import { WindowsMachine } from '../windows/WindowsMachine';
import { SimulationRuntime, globalSimulationRuntime } from '../../runtime/SimulationRuntime';
import { WELL_KNOWN_SIDS } from '../../../simulations/windows/logic/identity';
import { useDigitalTwinStore } from '../digitalTwinStore';
import { globalNetworkEngine } from '../network/NetworkEngine';

describe('OMEGA REALITY ENGINE V1.1 — Users, Sessions, and Security Tokens Suite', () => {
  let runtime: SimulationRuntime;
  let reality: RealityEngine;

  beforeEach(() => {
    runtime = globalSimulationRuntime;
    reality = globalRealityEngine;
    reality.initEnterpriseEnvironment();

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

    // Flush client caches to start from clean state
    globalNetworkEngine.dns.flushCache();
    globalNetworkEngine.arp.flush();
    globalNetworkEngine.connections.clear();
  });

  it('valid user login creates token', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
      logonType: 'Interactive',
    });

    expect(res.success).toBe(true);
    expect(res.session).toBeDefined();
    expect(res.session?.tokenId).toBeDefined();

    const token = res.machine.getToken(res.session.tokenId);
    expect(token).toBeDefined();
    expect(token?.userSid).toBe('S-1-5-21-99887766-2001');
    expect(token?.username).toBe('sara.finance');
  });

  it('invalid password creates no token', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: false,
      logonType: 'Interactive',
    });

    expect(res.success).toBe(false);
    expect(res.session).toBeNull();

    // Verify no new token was created (only tok-system exists)
    const tokens = res.machine.getTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0].tokenId).toBe('tok-system');
  });

  it('disabled user rejected', () => {
    const machine = reality.registry.getMachine('FIN-WS01')!;
    const user = machine.getUserByName('sara.finance')!;

    // Temporarily disable the user
    user.enabled = false;

    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
      logonType: 'Interactive',
    });

    expect(res.success).toBe(false);
    expect(res.session).toBeNull();

    // Restore enabled state
    user.enabled = true;
  });

  it('token contains correct SID', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
    });

    const token = res.machine.getToken(res.session.tokenId)!;
    expect(token.userSid).toBe('S-1-5-21-99887766-2001');
  });

  it('normal user has no Domain Admins', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
    });

    const token = res.machine.getToken(res.session.tokenId)!;
    expect(token.groupSids).not.toContain('S-1-5-21-99887766-512'); // Domain Admins
    expect(token.groupSids).not.toContain('S-1-5-32-544'); // Local Administrators
  });

  it('administrator has expected groups', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\administrator',
      passwordCorrect: true,
    });

    const token = res.machine.getToken(res.session.tokenId)!;
    expect(token.groupSids).toContain('S-1-5-21-99887766-512'); // Domain Admins
    expect(token.groupSids).toContain('S-1-5-32-544'); // Local Administrators
  });

  it('privileges differ between normal/admin', () => {
    const resNormal = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
    });
    const tokenNormal = resNormal.machine.getToken(resNormal.session.tokenId)!;

    const resAdmin = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\administrator',
      passwordCorrect: true,
    });
    const tokenAdmin = resAdmin.machine.getToken(resAdmin.session.tokenId)!;

    expect(tokenNormal.privileges).not.toContain('SeDebugPrivilege');
    expect(tokenAdmin.privileges).toContain('SeDebugPrivilege');
    expect(tokenAdmin.privileges).toContain('SeBackupPrivilege');
  });

  it('explorer.exe inherits session token', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
      logonType: 'Interactive',
    });

    const processes = res.machine.getRunningProcesses();
    const explorer = processes.find((p) => p.name === 'explorer.exe' && p.sessionId === res.session.sessionId);

    expect(explorer).toBeDefined();
    expect(explorer?.tokenId).toBe(res.session.tokenId);
    expect(explorer?.userSid).toBe('S-1-5-21-99887766-2001');
    expect(explorer?.integrityLevel).toBe('Medium');
  });

  it('child process inherits parent token', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
      logonType: 'Interactive',
    });

    const explorer = res.machine.getRunningProcesses().find((p) => p.name === 'explorer.exe')!;

    // Spawn cmd.exe as child of explorer.exe without specifying token/user
    const child = res.machine.spawnProcess({
      parentPid: explorer.pid,
      name: 'cmd.exe',
      commandLine: 'cmd.exe',
      virtualTime: 300,
    });

    expect(child.tokenId).toBe(explorer.tokenId);
    expect(child.sessionId).toBe(explorer.sessionId);
    expect(child.userSid).toBe(explorer.userSid);
    expect(child.userName).toBe(explorer.userName);
    expect(child.integrityLevel).toBe(explorer.integrityLevel);
  });

  it('impossible token/user mismatch rejected', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
      logonType: 'Interactive',
    });

    expect(() => {
      res.machine.spawnProcess({
        parentPid: 1024,
        name: 'whoami.exe',
        commandLine: 'whoami.exe',
        userName: 'NEXORA\\omar.hr', // Mismatch!
        userSid: 'S-1-5-21-99887766-2002',
        tokenId: res.session.tokenId, // Token is for sara.finance
        virtualTime: 400,
      });
    }).toThrow(/Identity mismatch/);
  });

  it('logoff changes session state and generates Event 4634', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
      logonType: 'Interactive',
    });

    const sessionId = res.session.sessionId;
    expect(res.machine.getActiveSessions().length).toBe(1);

    const explorer = res.machine.getRunningProcesses().find((p) => p.name === 'explorer.exe' && p.sessionId === sessionId)!;
    expect(explorer.status).toBe('Running');

    // Perform logoff
    const logoffSuccess = reality.logoffSession('FIN-WS01', sessionId);
    expect(logoffSuccess).toBe(true);

    const loggedOffSession = res.machine.getSessions().find((s) => s.sessionId === sessionId)!;
    expect(loggedOffSession.status).toBe('LOGGED_OFF');
    expect(res.machine.getActiveSessions().length).toBe(0);

    // Associated processes terminated
    expect(explorer.status).toBe('Terminated');

    // Event 4634 exists
    const logs = res.machine.getEventLogs();
    const logoffLog = logs.find((l) => l.eventId === 4634 && l.data.targetLogonId === `0x${sessionId.toString(16)}`);
    expect(logoffLog).toBeDefined();
  });

  it('snapshot restore preserves token/session/process relationships', () => {
    const res = reality.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
      logonType: 'Interactive',
    });

    const sessionId = res.session.sessionId;
    const explorer = res.machine.getRunningProcesses().find((p) => p.name === 'explorer.exe')!;

    // Take snapshot
    const snapshot = reality.getStateSnapshot();

    // Create a new fresh reality engine and restore
    const newRuntime = new SimulationRuntime();
    const newReality = new RealityEngine(newRuntime);
    newReality.restoreStateSnapshot(snapshot);

    const restoredMachine = newReality.registry.getMachine('FIN-WS01')!;
    const restoredSession = restoredMachine.getSessions().find((s) => s.sessionId === sessionId)!;
    expect(restoredSession.status).toBe('ACTIVE');

    const restoredToken = restoredMachine.getToken(restoredSession.tokenId);
    expect(restoredToken).toBeDefined();
    expect(restoredToken?.userSid).toBe('S-1-5-21-99887766-2001');

    const restoredExplorer = restoredMachine.getRunningProcesses().find((p) => p.name === 'explorer.exe' && p.sessionId === sessionId)!;
    expect(restoredExplorer.tokenId).toBe(restoredSession.tokenId);
  });

  it('same scenario twice produces same IDs/state', () => {
    // Run scenario A
    const runtimeA = new SimulationRuntime();
    const realityA = new RealityEngine(runtimeA);
    realityA.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
      logonType: 'Interactive',
    });

    // Run scenario B (exact duplicate steps)
    const runtimeB = new SimulationRuntime();
    const realityB = new RealityEngine(runtimeB);
    realityB.attemptLogon({
      targetHost: 'FIN-WS01',
      userName: 'NEXORA\\sara.finance',
      passwordCorrect: true,
      logonType: 'Interactive',
    });

    const snapA = realityA.getStateSnapshot();
    const snapB = realityB.getStateSnapshot();

    expect(JSON.stringify(snapA)).toBe(JSON.stringify(snapB));
  });
});
