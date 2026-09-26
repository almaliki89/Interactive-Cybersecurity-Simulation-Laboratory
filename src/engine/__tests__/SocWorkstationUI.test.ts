import { describe, it, expect, beforeEach } from 'vitest';
import { useSocStore } from '../../stores/socStore';
import { createTelemetryEvent } from '../../simulations/soc/logic/telemetry';
import { normalizeRuntimeEvent } from '../../simulations/soc/logic/normalization';
import { enrichTelemetryEvent } from '../../simulations/soc/logic/enrichment';

describe('SOC Workstation State & UI Logic', () => {
  beforeEach(() => {
    useSocStore.getState().resetFilters();
    useSocStore.getState().setSelectedAlertId(null);
    useSocStore.getState().setSelectedEventId(null);
    useSocStore.getState().setActiveTab('QUEUE');
  });

  it('updates selected alert and auto-switches to investigation tab', () => {
    const store = useSocStore.getState();
    expect(store.activeTab).toBe('QUEUE');
    
    store.setSelectedAlertId('alt-123');
    
    expect(useSocStore.getState().selectedAlertId).toBe('alt-123');
    expect(useSocStore.getState().activeTab).toBe('INVESTIGATION');
  });

  it('manages complex filter state for severity and sourceWorld', () => {
    const store = useSocStore.getState();
    
    store.setFilter('severity', ['CRITICAL', 'HIGH']);
    store.setFilter('sourceWorld', ['NETWORK']);
    
    const state = useSocStore.getState();
    expect(state.filters.severity).toEqual(['CRITICAL', 'HIGH']);
    expect(state.filters.sourceWorld).toEqual(['NETWORK']);
    
    state.resetFilters();
    expect(useSocStore.getState().filters.severity).toEqual([]);
  });

  it('preserves rawEventId during normalization and enrichment pipeline', () => {
    const rawPayload = { 
      eventId: '4624', 
      user: 'analyst', 
      rawId: 'original-syslog-778' 
    };
    
    const normalized = normalizeRuntimeEvent({
      id: 'evt-1',
      type: 'LOGON',
      source: 'WINDOWS',
      target: 'WS-01',
      category: 'AUTHENTICATION',
      severity: 'info',
      virtualTime: 1000,
      description: 'Login',
      payload: rawPayload
    });

    const enriched = enrichTelemetryEvent(normalized);
    
    // Test that the raw event ID is tracked
    expect(enriched.rawEventId).toBe('evt-1');
    expect(enriched.sourceWorld).toBe('NETWORK'); // Default fallback for LOGON without prefix in normalizeRuntimeEvent logic if not caught by startswith
  });

  it('updates alert status transiently in the workstation', () => {
    const store = useSocStore.getState();
    store.updateAlertStatus('alt-1', 'INVESTIGATING');
    
    expect(useSocStore.getState().alertStatuses['alt-1']).toBe('INVESTIGATING');
    
    store.updateAlertStatus('alt-1', 'CLOSED');
    expect(useSocStore.getState().alertStatuses['alt-1']).toBe('CLOSED');
  });

  it('toggles raw telemetry drawer state', () => {
    expect(useSocStore.getState().isRawDrawerOpen).toBe(false);
    
    useSocStore.getState().setRawDrawerOpen(true);
    expect(useSocStore.getState().isRawDrawerOpen).toBe(true);
  });
});
