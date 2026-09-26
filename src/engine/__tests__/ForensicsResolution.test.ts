import { describe, it, expect } from 'vitest';
import { normalizeRuntimeEvent } from '../../simulations/soc/logic/normalization';
import { createForensicEvidenceFromTelemetry } from '../../simulations/forensics/logic/evidence';

describe('Forensics Evidence Resolution', () => {
  it('exactly matches the canonical ID generation pipeline', () => {
    const rawEvent = {
      id: 'soc-evt-999',
      type: 'WIN_4624',
      source: 'DC-01',
      target: 'WS-01',
      category: 'WINDOWS',
      severity: 'info',
      virtualTime: 5000,
      description: 'Successful Logon',
      payload: { user: 'malicious-actor' }
    };

    // 1. Normalize
    const normalized = normalizeRuntimeEvent(rawEvent);
    
    // 2. Create Forensic Evidence
    const evidence = createForensicEvidenceFromTelemetry(normalized);

    // Verify ID matches the logic: `EVD-${event.sourceWorld}-${event.rawEventId || event.id}`
    // For Windows, normalization sets id to `norm-win-${event.id || vTime}`
    // and rawEventId to `event.id`.
    expect(evidence.id).toBe(`EVD-WINDOWS-soc-evt-999`);
    
    // Ensure the resolution pipeline is consistent
    const resolutionPipelineId = createForensicEvidenceFromTelemetry(normalizeRuntimeEvent(rawEvent)).id;
    expect(evidence.id).toBe(resolutionPipelineId);
  });

  it('resolves Network events correctly', () => {
    const rawEvent = {
      id: 'net-evt-1',
      type: 'CONNECTION_BLOCKED',
      category: 'NETWORK',
      virtualTime: 100,
      payload: { sourceIp: '1.2.3.4' }
    };

    const normalized = normalizeRuntimeEvent(rawEvent);
    const evidence = createForensicEvidenceFromTelemetry(normalized);

    expect(evidence.id).toBe(`EVD-NETWORK-net-evt-1`);
  });
});
