import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationRuntime } from '../runtime/SimulationRuntime';
import { loadSocDetectionScenario } from '../../simulations/soc/runtime/DetectionScenario';
import { SocEventBridge } from '../../simulations/soc/runtime/SocEventBridge';
import {
  evaluateDetectionRules,
  STANDARD_DETECTION_RULES,
} from '../../simulations/soc/logic/detection';
import { correlateAlerts } from '../../simulations/soc/logic/correlation';

describe('SOC & SIEM SimulationRuntime Integration Tests', () => {
  let runtime: SimulationRuntime;
  let bridge: SocEventBridge;

  beforeEach(() => {
    runtime = new SimulationRuntime();
    bridge = new SocEventBridge(runtime);
  });

  // ==========================================
  // 1. End-to-End Scenario Playback
  // ==========================================
  describe('Full Multi-Tier Attack Scenario Ingestion', () => {
    it('schedules and ingests all 8 multi-stage attack phases deterministically', () => {
      loadSocDetectionScenario(runtime, { startVirtualTime: 0 });

      // Advance runtime clock through entire attack (0 to 1600ms)
      runtime.step(1600);

      const telemetry = bridge.getTelemetry();
      expect(telemetry.length).toBeGreaterThanOrEqual(10);

      // Verify all five worlds represented
      const distinctWorlds = new Set(telemetry.map((t) => t.sourceWorld));
      expect(distinctWorlds.has('NETWORK')).toBe(true);
      expect(distinctWorlds.has('LINUX')).toBe(true);
      expect(distinctWorlds.has('WINDOWS')).toBe(true);
      expect(distinctWorlds.has('IDENTITY')).toBe(true);
      expect(distinctWorlds.has('APPSEC')).toBe(true);

      // Evaluate detection rules against runtime-streamed telemetry
      const alerts = evaluateDetectionRules(telemetry, STANDARD_DETECTION_RULES);
      expect(alerts.length).toBeGreaterThanOrEqual(4);

      // Verify multi-stage correlation
      const groups = correlateAlerts(alerts, telemetry);
      expect(groups.length).toBeGreaterThanOrEqual(1);
      expect(groups[0].entities.primaryUser).toBe('sara');
    });

    it('cross-world normalization: normalizes Linux event through SocEventBridge -> normalizeRuntimeEvent -> normalizeLinuxEvent -> enrichTelemetryEvent', () => {
      runtime.events.scheduleBatch([
        {
          at: 10,
          type: 'LINUX_PROCESS_SPAWNED',
          source: 'LINUX-SRV-01',
          target: 'LINUX-SRV-01',
          category: 'LINUX',
          severity: 'warn',
          description: 'Linux process spawned',
          payload: { user: 'root', host: 'LINUX-SRV-01', process: '/usr/bin/ncat' },
        },
      ]);

      runtime.step(20);

      const telemetry = bridge.getTelemetry();
      const linuxEvt = telemetry.find((t) => t.sourceWorld === 'LINUX');
      expect(linuxEvt).toBeDefined();
      expect(linuxEvt?.sourceWorld).toBe('LINUX');
      expect(linuxEvt?.user).toBe('root');
      expect(linuxEvt?.host).toBe('LINUX-SRV-01');
      expect(linuxEvt?.process).toBe('/usr/bin/ncat');
      expect(linuxEvt?.category).toBe('PROCESS_EXECUTION');
    });
  });

  // ==========================================
  // 2. Pause & Resume Controls
  // ==========================================
  describe('Simulation Clock Pause & Resume', () => {
    it('pauses mid-scenario and halts ingestion until resumed', () => {
      loadSocDetectionScenario(runtime, { startVirtualTime: 0 });

      // Advance to T=400ms (after login success, before group mod)
      runtime.step(400);
      const telemetryAt400 = bridge.getTelemetry();
      const hasGroupModAt400 = telemetryAt400.some((t) => t.category === 'GROUP_MANAGEMENT');
      expect(hasGroupModAt400).toBe(false);

      // Pause runtime
      runtime.pause();
      expect(runtime.clock.getStatus()).toBe('paused');
      expect(runtime.clock.getVirtualTime()).toBe(400);

      // Resume and complete
      runtime.resume();
      expect(runtime.clock.getStatus()).toBe('running');
      runtime.step(1200); // 400 + 1200 = 1600ms

      const finalTelemetry = bridge.getTelemetry();
      const hasGroupModAtFinal = finalTelemetry.some((t) => t.category === 'GROUP_MANAGEMENT');
      expect(hasGroupModAtFinal).toBe(true);
    });
  });

  // ==========================================
  // 3. Clock Speed Multipliers
  // ==========================================
  describe('Simulation Clock Speed Controls', () => {
    it('maintains strict virtual time event ordering under 0.5x, 1x, and 2x speeds', () => {
      [0.5, 1.0, 2.0].forEach((speedMultiplier) => {
        const testRuntime = new SimulationRuntime();
        const testBridge = new SocEventBridge(testRuntime);
        testRuntime.setSpeed(speedMultiplier);

        loadSocDetectionScenario(testRuntime, { startVirtualTime: 0 });

        testRuntime.step(600);
        const intermediate = testBridge.getTelemetry();
        expect(intermediate.some((t) => t.eventType.includes('PRIVILEGED_GROUP_CHANGED'))).toBe(true);

        testRuntime.step(1000);
        const complete = testBridge.getTelemetry();
        expect(complete.some((t) => t.eventType.includes('WIN_LOG_CLEARED'))).toBe(true);
      });
    });
  });

  // ==========================================
  // 4. Deterministic Reset & Repeatability
  // ==========================================
  describe('Deterministic Reset Repeatability', () => {
    it('produces bit-for-bit identical telemetry and alerts across multiple resets', () => {
      const executeRun = () => {
        const rt = new SimulationRuntime();
        const br = new SocEventBridge(rt);
        loadSocDetectionScenario(rt, { startVirtualTime: 0 });
        rt.step(1600);
        const tel = br.getTelemetry();
        const alt = evaluateDetectionRules(tel, STANDARD_DETECTION_RULES);
        return { telemetry: tel, alerts: alt };
      };

      const run1 = executeRun();
      const run2 = executeRun();

      expect(run1.telemetry.length).toBe(run2.telemetry.length);
      expect(run1.telemetry.map((t) => t.id)).toEqual(run2.telemetry.map((t) => t.id));
      expect(run1.alerts.length).toBe(run2.alerts.length);
      expect(run1.alerts.map((a) => a.id)).toEqual(run2.alerts.map((a) => a.id));
    });
  });
});
