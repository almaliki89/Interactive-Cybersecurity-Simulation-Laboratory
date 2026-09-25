/**
 * OMEGA V12 — Incident Forensics Scenario Loader
 * Loads the Nexora Enterprise Incident Forensics multi-stage attack scenario into SimulationRuntime.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { loadSocDetectionScenario } from '../../soc/runtime/DetectionScenario';
import { createDefaultForensicsCase, ForensicsCase } from '../logic/evidence';

export function loadIncidentForensicsScenario(
  runtime: SimulationRuntime,
  startVirtualTime = 0
): ForensicsCase {
  // Load underlying SOC multi-stage attack scenario into runtime
  loadSocDetectionScenario(runtime, { startVirtualTime });

  // Generate deterministic incident case object
  return createDefaultForensicsCase(startVirtualTime);
}
