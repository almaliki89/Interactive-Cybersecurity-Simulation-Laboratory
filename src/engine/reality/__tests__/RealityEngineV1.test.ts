import { describe, it, expect, beforeEach } from 'vitest';
import { RealityEngine } from '../RealityEngine';
import { WindowsMachine } from '../windows/WindowsMachine';
import { SimulationRuntime } from '../../runtime/SimulationRuntime';
import { WELL_KNOWN_SIDS } from '../../../simulations/windows/logic/identity';

describe('OMEGA REALITY ENGINE V1.0 — Windows Machine & Core Engine Suite', () => {
  let runtime: SimulationRuntime;
  let reality: RealityEngine;

  beforeEach(() => {
    runtime = new SimulationRuntime();
    reality = new RealityEngine(runtime);
  });

  describe('1. WindowsMachine System Model', () => {
    it('boots machine and initializes core NT kernel process tree', () => {
      const machine = new WindowsMachine({
        id: 'TEST-WS',
        hostname: 'TEST-WS01',
        ipAddress: '10.10.30.99',
      });

      expect(machine.status).toBe('OFFLINE');
      expect(machine.getProcesses().length).toBe(0);

      machine.boot(100);

      expect(machine.status).toBe('ONLINE');
      const processes = machine.getRunningProcesses();
      expect(processes.length).toBeGreaterThanOrEqual(6);

      const systemProc = machine.getProcess(4);
      expect(systemProc).toBeDefined();
      expect(systemProc?.name).toBe('System');
      expect(systemProc?.userSid).toBe(WELL_KNOWN_SIDS.LOCAL_SYSTEM);

      const lsassProc = processes.find((p) => p.name === 'lsass.exe');
      expect(lsassProc).toBeDefined();
      expect(lsassProc?.ppid).toBe(680); // wininit.exe parent PID
    });

    it('spawns new process, calculates PID, and appends Event 4688 to machine log', () => {
      const machine = new WindowsMachine({
        id: 'FIN-WS01',
        hostname: 'FIN-WS01',
        ipAddress: '10.10.30.15',
      });
      machine.boot(200);

      const procCountBefore = machine.getProcesses().length;

      const newProc = machine.spawnProcess({
        parentPid: 1024,
        name: 'cmd.exe',
        commandLine: 'cmd.exe /c whoami',
        userName: 'NEXORA\\sara.finance',
        userSid: 'S-1-5-21-2001',
        integrityLevel: 'Medium',
        virtualTime: 250,
      });

      expect(machine.getProcesses().length).toBe(procCountBefore + 1);
      expect(newProc.pid).toBeGreaterThan(2000);
      expect(newProc.ppid).toBe(1024);

      // Verify Event 4688 was generated inside machine's Security event log
      const logs = machine.getEventLogs();
      const procEvt = logs.find((e) => e.eventId === 4688 && e.data.newProcessId === newProc.pid);
      expect(procEvt).toBeDefined();
      expect(procEvt?.channel).toBe('Security');
      expect(procEvt?.user).toBe('NEXORA\\sara.finance');
    });

    it('handles failed logon session attempt generating Event 4625 without active session', () => {
      const machine = new WindowsMachine({
        id: 'HR-WS01',
        hostname: 'HR-WS01',
        ipAddress: '10.10.30.20',
      });
      machine.boot(100);

      const session = machine.createSession({
        userName: 'sara.finance',
        userSid: 'S-1-5-21-2001',
        logonType: 'Interactive',
        virtualTime: 150,
        success: false,
        failureReason: 'BadPassword',
      });

      expect(session).toBeNull();
      expect(machine.getActiveSessions().length).toBe(0);

      const failLog = machine.getEventLogs().find((e) => e.eventId === 4625);
      expect(failLog).toBeDefined();
      expect(failLog?.data.targetUserName).toBe('sara.finance');
    });

    it('creates active session and generates Event 4624 upon successful logon', () => {
      const machine = new WindowsMachine({
        id: 'HR-WS01',
        hostname: 'HR-WS01',
        ipAddress: '10.10.30.20',
      });
      machine.boot(100);

      const session = machine.createSession({
        userName: 'omar.hr',
        userSid: 'S-1-5-21-2002',
        logonType: 'Interactive',
        sourceIp: '10.10.30.20',
        virtualTime: 200,
        success: true,
      });

      expect(session).not.toBeNull();
      expect(session?.userName).toBe('omar.hr');
      expect(machine.getActiveSessions().length).toBe(1);

      const successLog = machine.getEventLogs().find((e) => e.eventId === 4624);
      expect(successLog).toBeDefined();
      expect(successLog?.data.targetUserName).toBe('omar.hr');
    });
  });

  describe('2. MachineRegistry', () => {
    it('indexes enterprise machines and resolves case-insensitively', () => {
      const registry = reality.registry;

      const finWs = registry.getMachine('FIN-WS01');
      expect(finWs).toBeDefined();
      expect(finWs?.ipAddress).toBe('10.10.30.15');

      const finWsLower = registry.getMachine('fin-ws01');
      expect(finWsLower).toBe(finWs);

      const dc01 = registry.getMachine('DC01');
      expect(dc01).toBeDefined();
      expect(dc01?.ipAddress).toBe('10.10.10.10');
    });
  });

  describe('3. RealityEngine Core Orchestration & Telemetry Consequence', () => {
    it('executes user logon state transition first, emitting consequence telemetry to SimulationRuntime', () => {
      const initialEvtCount = runtime.events.getHistory().length;

      // Failed logon attempt
      const failRes = reality.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        userSid: 'S-1-5-21-2001',
        passwordCorrect: false,
      });

      expect(failRes.success).toBe(false);
      expect(failRes.session).toBeNull();

      const failRuntimeEvt = runtime.events.getHistory().find((e) => e.type === 'WIN_4625');
      expect(failRuntimeEvt).toBeDefined();
      expect(failRuntimeEvt?.source).toBe('FIN-WS01');

      // Successful logon attempt
      const successRes = reality.attemptLogon({
        targetHost: 'FIN-WS01',
        userName: 'sara.finance',
        userSid: 'S-1-5-21-2001',
        passwordCorrect: true,
      });

      expect(successRes.success).toBe(true);
      expect(successRes.session).toBeDefined();
      expect(failRes.machine.getActiveSessions().length).toBe(1);

      const successRuntimeEvt = runtime.events.getHistory().find((e) => e.type === 'WIN_4624');
      expect(successRuntimeEvt).toBeDefined();
      expect(successRuntimeEvt?.target).toBe('sara.finance');
    });

    it('spawns process state transition and dispatches WIN_4688 to SimulationRuntime', () => {
      const res = reality.executeProcess({
        host: 'FIN-WS01',
        parentPid: 4,
        name: 'powershell.exe',
        commandLine: 'powershell.exe -nop -w hidden -enc JABm...',
        userName: 'sara.finance',
        userSid: 'S-1-5-21-2001',
      });

      expect(res.process).toBeDefined();
      expect(res.process.name).toBe('powershell.exe');

      const runtimeEvt = runtime.events.getHistory().find((e) => e.type === 'WIN_4688');
      expect(runtimeEvt).toBeDefined();
      expect(runtimeEvt?.severity).toBe('threat'); // Detected suspicious encoded commandline
      expect(runtimeEvt?.payload?.pid).toBe(res.process.pid);
    });

    it('captures and restores exact state snapshot deterministically', () => {
      reality.attemptLogon({
        targetHost: 'IT-WS01',
        userName: 'ali.it',
        userSid: 'S-1-5-21-2003',
        passwordCorrect: true,
      });

      reality.executeProcess({
        host: 'IT-WS01',
        parentPid: 4,
        name: 'mmc.exe',
        commandLine: 'mmc.exe dsa.msc',
        userName: 'ali.it',
        userSid: 'S-1-5-21-2003',
      });

      const snapshot = reality.getStateSnapshot();

      const newRuntime = new SimulationRuntime();
      const newReality = new RealityEngine(newRuntime);

      newReality.restoreStateSnapshot(snapshot);

      const itWsRestored = newReality.registry.getMachine('IT-WS01');
      expect(itWsRestored).toBeDefined();
      expect(itWsRestored?.getActiveSessions().length).toBe(1);
      expect(itWsRestored?.getActiveSessions()[0].userName).toBe('ali.it');

      const mmcProc = itWsRestored?.getProcesses().find((p) => p.name === 'mmc.exe');
      expect(mmcProc).toBeDefined();
      expect(mmcProc?.userName).toBe('ali.it');
    });
  });
});
