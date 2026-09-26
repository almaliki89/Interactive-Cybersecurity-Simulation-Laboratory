import { describe, it, expect, beforeEach } from 'vitest';
import { useForensicsStore } from '../../stores/forensicsStore';
import { createDefaultForensicsCase, createForensicEvidenceFromTelemetry } from '../../simulations/forensics/logic/evidence';
import { addCustodyRecord, validateCustodyChain } from '../../simulations/forensics/logic/custody';
import { normalizeRuntimeEvent } from '../../simulations/soc/logic/normalization';

describe('Forensics Workspace & Central State Integration', () => {
  beforeEach(() => {
    // Reset store state
    useForensicsStore.setState({
      activeTab: 'map',
      selectedEvidenceId: null,
      evidence: [],
      custodyRecords: [],
      caseDetails: createDefaultForensicsCase(0),
      deepLinkContext: null,
    });
  });

  it('manages centralized case state and updates status correctly', () => {
    const store = useForensicsStore.getState();
    expect(store.caseDetails.status).toBe('OPEN');

    store.setCaseStatus('ACQUIRING');
    expect(useForensicsStore.getState().caseDetails.status).toBe('ACQUIRING');
  });

  it('handles evidence selection and canonical resolution', () => {
    const rawEvent = {
      id: 'test-evt-1',
      type: 'WIN_4624',
      category: 'WINDOWS',
      virtualTime: 1000,
      payload: { user: 'test-user', host: 'TEST-HOST' }
    };

    const normalized = normalizeRuntimeEvent(rawEvent);
    const evidence = createForensicEvidenceFromTelemetry(normalized);

    const store = useForensicsStore.getState();
    store.addEvidence(evidence);
    store.setSelectedEvidenceId(evidence.id);

    expect(useForensicsStore.getState().evidence.length).toBe(1);
    expect(useForensicsStore.getState().selectedEvidenceId).toBe(evidence.id);
  });

  it('maintains and validates chain of custody records', () => {
    const evidenceId = 'EVD-DISK-TEST';
    let records = addCustodyRecord([], {
      evidenceId,
      virtualTime: 50,
      action: 'COLLECTED',
      actor: 'Analyst Sara',
      notes: 'Initial collection'
    });

    records = addCustodyRecord(records, {
      evidenceId,
      virtualTime: 100,
      action: 'VERIFIED',
      actor: 'Officer Ahmed',
      notes: 'Hash verified'
    });

    expect(records.length).toBe(2);

    const validation = validateCustodyChain(
      evidenceId,
      records,
      'sha256:abc',
      'sha256:abc'
    );

    expect(validation.valid).toBe(true);
  });
});
