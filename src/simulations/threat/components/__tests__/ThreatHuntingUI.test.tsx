// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { ThreatHuntingWorkspace } from '../ThreatHuntingWorkspace';
import { useThreatHuntingStore } from '../../runtime/threatHuntingStore';

describe('OMEGA V16 — Threat Hunting UI Component Suite', () => {
  beforeEach(() => {
    useThreatHuntingStore.setState({
      activeHuntId: 'HUNT-01',
      activeTab: 'TELEMETRY',
      isMobileNavOpen: false,
      isMobileInspectorOpen: false,
      isBottomDrawerOpen: false,
      selectedEventId: null,
      selectedEntity: null,
    });
    useThreatHuntingStore.getState().resetFilters();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders 3-pane layout elements and main stage', () => {
    const view = render(<ThreatHuntingWorkspace language="en" />);

    expect(view.getByTestId('threat-hunting-workspace')).toBeDefined();
    expect(view.getByTestId('tab-telemetry')).toBeDefined();
    expect(view.getByTestId('tab-query')).toBeDefined();
    expect(view.getByTestId('tab-correlation')).toBeDefined();
    expect(view.getByTestId('tab-threat_intel')).toBeDefined();
    expect(view.getByTestId('tab-findings')).toBeDefined();
    expect(view.getByTestId('tab-detection')).toBeDefined();
    expect(view.getByTestId('tab-master')).toBeDefined();
  });

  it('switches to Query Editor tab and executes a search query', () => {
    const view = render(<ThreatHuntingWorkspace language="en" />);

    const queryTab = view.getByTestId('tab-query');
    fireEvent.click(queryTab);

    const runBtn = view.getByTestId('btn-run-query');
    expect(runBtn).toBeDefined();
    fireEvent.click(runBtn);

    // Diagnostics banner should display matches
    expect(view.getByText(/Matched Events:/i)).toBeDefined();
  });

  it('switches to Hypothesis tab and marks hypothesis supported', () => {
    const view = render(<ThreatHuntingWorkspace language="en" />);

    const hypTab = view.getByTestId('tab-hypothesis');
    fireEvent.click(hypTab);

    const supportBtn = view.getByTestId('btn-support-hypothesis');
    fireEvent.click(supportBtn);

    expect(useThreatHuntingStore.getState().hypotheses['HYP-01'].status).toBe('SUPPORTED');
  });

  it('renders Detection Builder tab and tunes rule', () => {
    const view = render(<ThreatHuntingWorkspace language="en" />);

    const detTab = view.getByTestId('tab-detection');
    fireEvent.click(detTab);

    const testBtn = view.getByTestId('btn-test-rule');
    fireEvent.click(testBtn);

    // Sliders should exist
    expect(view.getByTestId('slider-threshold')).toBeDefined();
    expect(view.getByTestId('slider-window')).toBeDefined();
  });

  it('supports Arabic RTL rendering with proper test attributes', () => {
    const view = render(<ThreatHuntingWorkspace language="ar" />);

    expect(view.getAllByText(/صيد التهديدات/i).length).toBeGreaterThan(0);
    expect(view.getByTestId('tab-hypothesis')).toBeDefined();
  });
});
