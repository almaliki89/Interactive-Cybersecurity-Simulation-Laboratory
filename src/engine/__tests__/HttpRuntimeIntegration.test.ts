import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import {
  loadHttpRequestScenario,
  deriveHttpRequestStateFromEvents,
  HTTP_EVENT_TYPES,
} from '../../simulations/appsec/runtime/HttpRequestScenario';
import {
  dispatchAppSecEvent,
  projectRuntimeEventsToAppSecLogs,
} from '../../simulations/appsec/runtime/AppEventBridge';

describe('HTTP Pipeline & AppSec SimulationRuntime Integration Tests', () => {
  let runtime: SimulationRuntime;

  beforeEach(() => {
    runtime = new SimulationRuntime();
  });

  // ==========================================
  // 1. Normal Multi-Tier HTTP Request Lifecycle
  // ==========================================
  describe('Normal HTTP Request Lifecycle Pipeline', () => {
    it('executes ordered 11-stage request pipeline driven by virtual time', () => {
      loadHttpRequestScenario(runtime, {
        method: 'GET',
        path: '/api/v1/orders/1001',
        userId: 'usr-alice',
        username: 'alice',
        role: 'Customer',
        failureScenario: 'NONE',
        startVirtualTime: 0,
        stepIntervalMs: 100,
      });

      // Advance clock across all 11 stages (0 to 1100ms)
      runtime.step(1100);

      const events = runtime.events.getHistory();
      const eventTypes = events.map((e) => e.type);

      // Verify exact ordered sequence
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.REQUEST_CREATED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.DNS_RESOLVED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.TCP_ESTABLISHED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.TLS_ESTABLISHED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.REQUEST_RECEIVED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.ROUTE_MATCHED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.SESSION_RESOLVED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.AUTHORIZATION_CHECKED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.INPUT_VALIDATED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.DATABASE_QUERY_EXECUTED);
      expect(eventTypes).toContain(HTTP_EVENT_TYPES.RESPONSE_SENT);

      // Derive authoritative state
      const derived = deriveHttpRequestStateFromEvents(events);
      expect(derived.currentStage).toBe('RESPONSE_SENT');
      expect(derived.response?.statusCode).toBe(200);
      expect(derived.sessionValid).toBe(true);
      expect(derived.authorized).toBe(true);
      expect(derived.inputValid).toBe(true);
      expect(derived.databaseQuery).toBeDefined();
    });
  });

  // ==========================================
  // 2. Pause & Resume Controls
  // ==========================================
  describe('Simulation Clock Pause & Resume', () => {
    it('pauses mid-request and halts virtual progression until resumed', () => {
      loadHttpRequestScenario(runtime, {
        method: 'GET',
        path: '/api/v1/orders/1001',
        startVirtualTime: 0,
        stepIntervalMs: 100,
      });

      // Advance to TLS stage (T=300ms)
      runtime.step(300);

      const stateAt300 = deriveHttpRequestStateFromEvents(runtime.events.getHistory());
      expect(stateAt300.currentStage).toBe('TLS_ESTABLISHED');
      expect(stateAt300.response).toBeUndefined();

      // Pause runtime
      runtime.pause();
      expect(runtime.clock.getStatus()).toBe('paused');
      expect(runtime.clock.getVirtualTime()).toBe(300);

      // Verify no subsequent stages executed while paused
      const hasDbAt300 = runtime.events.getHistory().some((e) => e.type === HTTP_EVENT_TYPES.DATABASE_QUERY_EXECUTED);
      expect(hasDbAt300).toBe(false);

      // Resume and complete
      runtime.resume();
      expect(runtime.clock.getStatus()).toBe('running');
      runtime.step(800); // 300 + 800 = 1100ms

      const finalState = deriveHttpRequestStateFromEvents(runtime.events.getHistory());
      expect(finalState.currentStage).toBe('RESPONSE_SENT');
      expect(finalState.response?.statusCode).toBe(200);
    });
  });

  // ==========================================
  // 3. Deterministic Step Progression
  // ==========================================
  describe('Deterministic Step-by-Step Execution', () => {
    it('advances stages precisely in 100ms virtual time increments', () => {
      loadHttpRequestScenario(runtime, {
        method: 'GET',
        path: '/api/v1/orders/1001',
        startVirtualTime: 0,
        stepIntervalMs: 100,
      });

      // t=0: Request Created
      runtime.step(0);
      let derived = deriveHttpRequestStateFromEvents(runtime.events.getHistory());
      expect(derived.currentStage).toBe('BROWSER_INIT');

      // t=100: DNS
      runtime.step(100);
      derived = deriveHttpRequestStateFromEvents(runtime.events.getHistory());
      expect(derived.currentStage).toBe('DNS_RESOLVED');

      // t=200: TCP
      runtime.step(100);
      derived = deriveHttpRequestStateFromEvents(runtime.events.getHistory());
      expect(derived.currentStage).toBe('TCP_ESTABLISHED');

      // t=300: TLS
      runtime.step(100);
      derived = deriveHttpRequestStateFromEvents(runtime.events.getHistory());
      expect(derived.currentStage).toBe('TLS_ESTABLISHED');
    });
  });

  // ==========================================
  // 4. Time-Travel Replay
  // ==========================================
  describe('Time-Travel Replay & State Reconstruction', () => {
    it('reconstructs accurate stage and headers at any past timestamp', () => {
      loadHttpRequestScenario(runtime, {
        method: 'GET',
        path: '/api/v1/orders/1001',
        startVirtualTime: 0,
        stepIntervalMs: 100,
      });

      runtime.step(1100);
      const allEvents = runtime.events.getHistory();

      // Replay to t=100 (DNS)
      const at100 = deriveHttpRequestStateFromEvents(allEvents, 100);
      expect(at100.currentStage).toBe('DNS_RESOLVED');
      expect(at100.response).toBeUndefined();

      // Replay to t=600 (Session Resolved)
      const at600 = deriveHttpRequestStateFromEvents(allEvents, 600);
      expect(at600.currentStage).toBe('SESSION_RESOLVED');
      expect(at600.sessionValid).toBe(true);

      // Replay to t=1100 (Response Sent)
      const at1100 = deriveHttpRequestStateFromEvents(allEvents, 1100);
      expect(at1100.currentStage).toBe('RESPONSE_SENT');
      expect(at1100.response?.statusCode).toBe(200);
    });
  });

  // ==========================================
  // 5. Deterministic Reset
  // ==========================================
  describe('Deterministic Reset Consistency', () => {
    it('produces bit-for-bit identical event streams across multiple resets', () => {
      const run = () => {
        const rt = new SimulationRuntime();
        loadHttpRequestScenario(rt, {
          method: 'GET',
          path: '/api/v1/orders/1001',
          startVirtualTime: 0,
          stepIntervalMs: 100,
        });
        rt.step(1100);
        return {
          events: rt.events.getHistory(),
          state: deriveHttpRequestStateFromEvents(rt.events.getHistory()),
        };
      };

      const r1 = run();
      const r2 = run();

      expect(r1.events.length).toBe(r2.events.length);
      expect(r1.events.map((e) => e.type)).toEqual(r2.events.map((e) => e.type));
      expect(r1.state.currentStage).toBe(r2.state.currentStage);
      expect(r1.state.response?.statusCode).toBe(r2.state.response?.statusCode);
    });
  });

  // ==========================================
  // 6. Pipeline Failure Variants
  // ==========================================
  describe('HTTP Pipeline Failure Scenarios', () => {
    it('terminates with 401 on unauthenticated request', () => {
      loadHttpRequestScenario(runtime, {
        method: 'GET',
        path: '/api/v1/orders/1001',
        failureScenario: 'AUTH_REQUIRED_401',
        startVirtualTime: 0,
        stepIntervalMs: 100,
      });

      runtime.step(1100);
      const derived = deriveHttpRequestStateFromEvents(runtime.events.getHistory());
      expect(derived.currentStage).toBe('FAILED');
      expect(derived.failureReason).toBe('AUTH_REQUIRED_401');
      expect(derived.response?.statusCode).toBe(401);
    });

    it('terminates with 403 on BOLA / IDOR access', () => {
      loadHttpRequestScenario(runtime, {
        method: 'GET',
        path: '/api/v1/orders/1001',
        userId: 'usr-bob',
        username: 'bob',
        failureScenario: 'BOLA_IDOR_403',
        startVirtualTime: 0,
        stepIntervalMs: 100,
      });

      runtime.step(1100);
      const derived = deriveHttpRequestStateFromEvents(runtime.events.getHistory());
      expect(derived.currentStage).toBe('FAILED');
      expect(derived.failureReason).toBe('BOLA_IDOR_403');
      expect(derived.response?.statusCode).toBe(403);
    });

    it('terminates with 429 on rate limit exhaustion', () => {
      loadHttpRequestScenario(runtime, {
        method: 'POST',
        path: '/api/v1/auth/login',
        failureScenario: 'RATE_LIMIT_429',
        startVirtualTime: 0,
        stepIntervalMs: 100,
      });

      runtime.step(1100);
      const derived = deriveHttpRequestStateFromEvents(runtime.events.getHistory());
      expect(derived.currentStage).toBe('FAILED');
      expect(derived.failureReason).toBe('RATE_LIMIT_429');
      expect(derived.response?.statusCode).toBe(429);
    });
  });

  // ==========================================
  // 7. SIEM Log Bridge
  // ==========================================
  describe('AppSec SIEM Log Bridge', () => {
    it('dispatches application events and projects to forensic SIEM logs', () => {
      const entry = dispatchAppSecEvent({
        type: 'APP_ACCESS_DENIED',
        severity: 'ALERT',
        sourceIp: '192.168.1.55',
        userId: 'usr-bob',
        username: 'bob',
        endpoint: '/api/v1/orders/1001',
        httpMethod: 'GET',
        statusCode: 403,
        messageEn: "BOLA Violation: User 'bob' attempted unauthorized read of Alice's order.",
        messageAr: "انتهاك تفويض: حاول المستخدم الوصول لطلب مستخدم آخر.",
        virtualTime: 50,
      });

      expect(entry.statusCode).toBe(403);
      expect(entry.type).toBe('APP_ACCESS_DENIED');

      const projected = projectRuntimeEventsToAppSecLogs([{
        id: entry.id,
        type: 'APP_ACCESS_DENIED',
        virtualTime: 50,
        payload: entry,
      }]);

      expect(projected.length).toBe(1);
      expect(projected[0].userId).toBe('usr-bob');
    });
  });
});
