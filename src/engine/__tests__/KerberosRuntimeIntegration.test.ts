import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import {
  loadKerberosScenario,
  deriveKerberosStateFromEvents,
  KERBEROS_EVENT_TYPES,
} from '../../simulations/identity/runtime/KerberosScenario';
import {
  dispatchEnterpriseAdEvent,
  projectRuntimeEventsToAdRecords,
  AD_EVENT_TYPES,
} from '../../simulations/identity/runtime/adEventBridge';

describe('Kerberos & Active Directory SimulationRuntime Integration', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();
  });

  // ==========================================
  // 1. Normal Kerberos Exchange Test
  // ==========================================
  describe('Normal Kerberos 3-Tier Protocol Exchange', () => {
    it('executes ordered Kerberos protocol flow driven by virtual time', () => {
      loadKerberosScenario(runtime, {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        encryptionType: 'AES-256',
        failureScenario: 'NONE',
        startVirtualTime: 0,
        stepIntervalMs: 500,
      });

      // Advance clock through the entire exchange (0 to 2500ms)
      runtime.step(2500);

      const events = runtime.events.getHistory();
      const eventTypes = events.map((e) => e.type);

      // Verify exact ordered sequence
      expect(eventTypes).toContain(KERBEROS_EVENT_TYPES.AS_REQ);
      expect(eventTypes).toContain(KERBEROS_EVENT_TYPES.AS_REP);
      expect(eventTypes).toContain(KERBEROS_EVENT_TYPES.TGT_ISSUED);
      expect(eventTypes).toContain(KERBEROS_EVENT_TYPES.TGS_REQ);
      expect(eventTypes).toContain(KERBEROS_EVENT_TYPES.TGS_REP);
      expect(eventTypes).toContain(KERBEROS_EVENT_TYPES.SERVICE_TICKET_ISSUED);
      expect(eventTypes).toContain(KERBEROS_EVENT_TYPES.AP_REQ);
      expect(eventTypes).toContain(KERBEROS_EVENT_TYPES.AUTH_SUCCESS);

      const asReqIdx = eventTypes.indexOf(KERBEROS_EVENT_TYPES.AS_REQ);
      const asRepIdx = eventTypes.indexOf(KERBEROS_EVENT_TYPES.AS_REP);
      const tgsReqIdx = eventTypes.indexOf(KERBEROS_EVENT_TYPES.TGS_REQ);
      const tgsRepIdx = eventTypes.indexOf(KERBEROS_EVENT_TYPES.TGS_REP);
      const apReqIdx = eventTypes.indexOf(KERBEROS_EVENT_TYPES.AP_REQ);
      const authSuccessIdx = eventTypes.indexOf(KERBEROS_EVENT_TYPES.AUTH_SUCCESS);

      expect(asReqIdx).toBeLessThan(asRepIdx);
      expect(asRepIdx).toBeLessThan(tgsReqIdx);
      expect(tgsReqIdx).toBeLessThan(tgsRepIdx);
      expect(tgsRepIdx).toBeLessThan(apReqIdx);
      expect(apReqIdx).toBeLessThan(authSuccessIdx);

      // Derive authoritative state
      const derived = deriveKerberosStateFromEvents(events);
      expect(derived.protocolState).toBe('AUTHENTICATED');
      expect(derived.tgtTicket).toBeDefined();
      expect(derived.tgtTicket?.type).toBe('TGT');
      expect(derived.tgtTicket?.status).toBe('VALID');
      expect(derived.serviceTicket).toBeDefined();
      expect(derived.serviceTicket?.type).toBe('SERVICE');
      expect(derived.serviceTicket?.servicePrincipal).toBe('cifs/fin-srv01.corp.nexora.local');
      expect(derived.failureReason).toBe('NONE');
    });
  });

  // ==========================================
  // 2. Pause Control Verification
  // ==========================================
  describe('Simulation Clock Pause Behavior', () => {
    it('pauses mid-flow and prevents virtual time or protocol advancement', () => {
      loadKerberosScenario(runtime, {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        failureScenario: 'NONE',
        startVirtualTime: 0,
        stepIntervalMs: 500,
      });

      // Step to TGT issuance (T=500ms)
      runtime.step(500);

      const stateAt500 = deriveKerberosStateFromEvents(runtime.events.getHistory());
      expect(stateAt500.protocolState).toBe('TGT_ISSUED');
      expect(stateAt500.tgtTicket).toBeDefined();
      expect(stateAt500.serviceTicket).toBeUndefined();

      // Pause runtime
      runtime.pause();
      expect(runtime.clock.getStatus()).toBe('paused');

      const virtualTimeWhenPaused = runtime.clock.getVirtualTime();
      expect(virtualTimeWhenPaused).toBe(500);

      // Verify no events have occurred beyond T=500
      const eventsWhilePaused = runtime.events.getHistory();
      const hasTgsWhilePaused = eventsWhilePaused.some((e) => e.type === KERBEROS_EVENT_TYPES.TGS_REP);
      expect(hasTgsWhilePaused).toBe(false);

      // Resume runtime and step to completion
      runtime.resume();
      expect(runtime.clock.getStatus()).toBe('running');

      runtime.step(2000); // 500 + 2000 = 2500ms
      const finalState = deriveKerberosStateFromEvents(runtime.events.getHistory());
      expect(finalState.protocolState).toBe('AUTHENTICATED');
      expect(finalState.serviceTicket).toBeDefined();
    });
  });

  // ==========================================
  // 3. Step Control Verification
  // ==========================================
  describe('Deterministic Step-by-Step Protocol Progression', () => {
    it('advances virtual time and reveals scheduled events step-by-step', () => {
      loadKerberosScenario(runtime, {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        failureScenario: 'NONE',
        startVirtualTime: 0,
        stepIntervalMs: 500,
      });

      // Initial state before step: at t=0, AS_REQ is processed
      runtime.step(0);
      let derived = deriveKerberosStateFromEvents(runtime.events.getHistory());
      expect(derived.protocolState).toBe('AS_REQ_SENT');
      expect(derived.tgtTicket).toBeUndefined();

      // Step 1: t=500 -> TGT issued
      runtime.step(500);
      derived = deriveKerberosStateFromEvents(runtime.events.getHistory());
      expect(derived.protocolState).toBe('TGT_ISSUED');
      expect(derived.tgtTicket).toBeDefined();
      expect(derived.serviceTicket).toBeUndefined();

      // Step 2: t=1000 -> TGS_REQ
      runtime.step(500);
      derived = deriveKerberosStateFromEvents(runtime.events.getHistory());
      expect(derived.protocolState).toBe('TGS_REQ_SENT');

      // Step 3: t=1500 -> Service ticket issued
      runtime.step(500);
      derived = deriveKerberosStateFromEvents(runtime.events.getHistory());
      expect(derived.protocolState).toBe('SERVICE_TICKET_ISSUED');
      expect(derived.serviceTicket).toBeDefined();

      // Step 4: t=2000 -> AP_REQ
      runtime.step(500);
      derived = deriveKerberosStateFromEvents(runtime.events.getHistory());
      expect(derived.protocolState).toBe('AP_REQ_SENT');

      // Step 5: t=2500 -> AUTH_SUCCESS
      runtime.step(500);
      derived = deriveKerberosStateFromEvents(runtime.events.getHistory());
      expect(derived.protocolState).toBe('AUTHENTICATED');
    });
  });

  // ==========================================
  // 4. Time-Travel Replay & Ticket State Reconstruction
  // ==========================================
  describe('Deterministic Time-Travel Replay', () => {
    it('reconstructs accurate ticket state at any virtual timestamp from history', () => {
      loadKerberosScenario(runtime, {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        failureScenario: 'NONE',
        startVirtualTime: 0,
        stepIntervalMs: 500,
      });

      // Run full exchange
      runtime.step(2500);
      const allEvents = runtime.events.getHistory();

      // Replay to t=0 (Before TGT)
      const stateAt0 = deriveKerberosStateFromEvents(allEvents, 0);
      expect(stateAt0.protocolState).toBe('AS_REQ_SENT');
      expect(stateAt0.tgtTicket).toBeUndefined();
      expect(stateAt0.serviceTicket).toBeUndefined();

      // Replay to t=500 (After TGT issuance, before Service Ticket)
      const stateAt500 = deriveKerberosStateFromEvents(allEvents, 500);
      expect(stateAt500.protocolState).toBe('TGT_ISSUED');
      expect(stateAt500.tgtTicket).toBeDefined();
      expect(stateAt500.serviceTicket).toBeUndefined();

      // Replay to t=1500 (After Service Ticket issuance)
      const stateAt1500 = deriveKerberosStateFromEvents(allEvents, 1500);
      expect(stateAt1500.protocolState).toBe('SERVICE_TICKET_ISSUED');
      expect(stateAt1500.tgtTicket).toBeDefined();
      expect(stateAt1500.serviceTicket).toBeDefined();

      // Replay to t=2500 (Authentication Complete)
      const stateAt2500 = deriveKerberosStateFromEvents(allEvents, 2500);
      expect(stateAt2500.protocolState).toBe('AUTHENTICATED');
      expect(stateAt2500.tgtTicket).toBeDefined();
      expect(stateAt2500.serviceTicket).toBeDefined();
    });
  });

  // ==========================================
  // 5. Deterministic Reset Verification
  // ==========================================
  describe('Deterministic Simulation Reset', () => {
    it('produces bit-for-bit identical events and ticket IDs across resets', () => {
      const runScenario = () => {
        const rt = new SimulationRuntime();
        loadKerberosScenario(rt, {
          clientPrincipal: 'sara@corp.nexora.local',
          targetSpn: 'cifs/fin-srv01.corp.nexora.local',
          encryptionType: 'AES-256',
          failureScenario: 'NONE',
          startVirtualTime: 0,
          stepIntervalMs: 500,
        });
        rt.step(2500);
        return {
          events: rt.events.getHistory(),
          state: deriveKerberosStateFromEvents(rt.events.getHistory()),
        };
      };

      const run1 = runScenario();
      const run2 = runScenario();

      expect(run1.events.length).toBe(run2.events.length);
      expect(run1.state.tgtTicket?.id).toBe(run2.state.tgtTicket?.id);
      expect(run1.state.serviceTicket?.id).toBe(run2.state.serviceTicket?.id);
      expect(run1.state.protocolState).toBe(run2.state.protocolState);
      expect(run1.events.map((e) => e.type)).toEqual(run2.events.map((e) => e.type));
    });
  });

  // ==========================================
  // 6. Failure Variants Verification
  // ==========================================
  describe('Kerberos Protocol Failure Scenarios', () => {
    it('terminates deterministically on CLOCK_SKEW with KERBEROS_AUTH_FAILED and no service ticket', () => {
      loadKerberosScenario(runtime, {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        failureScenario: 'CLOCK_SKEW',
        startVirtualTime: 0,
        stepIntervalMs: 500,
      });

      runtime.step(1500);

      const events = runtime.events.getHistory();
      const hasAuthFailed = events.some((e) => e.type === KERBEROS_EVENT_TYPES.AUTH_FAILED);
      expect(hasAuthFailed).toBe(true);

      const derived = deriveKerberosStateFromEvents(events);
      expect(derived.protocolState).toBe('FAILED');
      expect(derived.failureReason).toBe('CLOCK_SKEW');
      expect(derived.serviceTicket).toBeUndefined();
    });

    it('terminates deterministically on ACCOUNT_DISABLED with no TGT or Service Ticket', () => {
      loadKerberosScenario(runtime, {
        clientPrincipal: 'temp-auditor@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        failureScenario: 'ACCOUNT_DISABLED',
        startVirtualTime: 0,
        stepIntervalMs: 500,
      });

      runtime.step(1500);

      const events = runtime.events.getHistory();
      const derived = deriveKerberosStateFromEvents(events);
      expect(derived.protocolState).toBe('FAILED');
      expect(derived.failureReason).toBe('ACCOUNT_DISABLED');
      expect(derived.tgtTicket).toBeUndefined();
      expect(derived.serviceTicket).toBeUndefined();
    });

    it('terminates on TGT_EXPIRED at TGS stage with TGT but no Service Ticket', () => {
      loadKerberosScenario(runtime, {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        failureScenario: 'TGT_EXPIRED',
        startVirtualTime: 0,
        stepIntervalMs: 500,
      });

      runtime.step(2000);

      const events = runtime.events.getHistory();
      const derived = deriveKerberosStateFromEvents(events);
      expect(derived.protocolState).toBe('FAILED');
      expect(derived.failureReason).toBe('TGT_EXPIRED');
      expect(derived.tgtTicket).toBeDefined();
      expect(derived.serviceTicket).toBeUndefined();
    });

    it('terminates on SPN_UNKNOWN with valid TGT but no Service Ticket', () => {
      loadKerberosScenario(runtime, {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'http/unknown-host.corp.nexora.local',
        failureScenario: 'SPN_UNKNOWN',
        startVirtualTime: 0,
        stepIntervalMs: 500,
      });

      runtime.step(2000);

      const events = runtime.events.getHistory();
      const derived = deriveKerberosStateFromEvents(events);
      expect(derived.protocolState).toBe('FAILED');
      expect(derived.failureReason).toBe('SPN_UNKNOWN');
      expect(derived.tgtTicket).toBeDefined();
      expect(derived.serviceTicket).toBeUndefined();
    });

    it('terminates on KDC_UNAVAILABLE immediately at AS stage', () => {
      loadKerberosScenario(runtime, {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        failureScenario: 'KDC_UNAVAILABLE',
        startVirtualTime: 0,
        stepIntervalMs: 500,
      });

      runtime.step(1000);

      const events = runtime.events.getHistory();
      const derived = deriveKerberosStateFromEvents(events);
      expect(derived.protocolState).toBe('FAILED');
      expect(derived.failureReason).toBe('KDC_UNAVAILABLE');
      expect(derived.tgtTicket).toBeUndefined();
    });
  });

  // ==========================================
  // 7. Active Directory Enterprise Event Centralization
  // ==========================================
  describe('Active Directory Event Centralization & SIEM Bridge', () => {
    it('dispatches directory operations into SimulationRuntime and projects to AD forensic records', () => {
      const adRecord = dispatchEnterpriseAdEvent({
        eventId: 5136,
        channel: 'Directory Service',
        virtualTime: 100,
        severity: 'Information',
        subjectUser: 'Administrator',
        targetUserOrObject: 'sara',
        actionEn: 'Object moved to new OU',
        actionAr: 'تم نقل الكائن إلى وحدة تنظيمية جديدة',
        detailsEn: "User 'sara' moved to 'OU=Finance,DC=corp,DC=nexora,DC=local'.",
        detailsAr: "تم نقل المستخدم 'sara' إلى وحدة تنظيمية جديدة.",
        category: 'Directory Service Access',
        runtimeEventType: AD_EVENT_TYPES.USER_MOVED,
      });

      expect(adRecord.eventId).toBe(5136);
      expect(adRecord.channel).toBe('Directory Service');

      // Check projection
      const runtimeEvents = [
        {
          id: adRecord.id,
          type: AD_EVENT_TYPES.USER_MOVED,
          virtualTime: 100,
          timestamp: 100,
          payload: adRecord,
        },
      ];

      const projected = projectRuntimeEventsToAdRecords(runtimeEvents);
      expect(projected.length).toBe(1);
      expect(projected[0].eventId).toBe(5136);
      expect(projected[0].subjectUser).toBe('Administrator');
    });
  });
});
