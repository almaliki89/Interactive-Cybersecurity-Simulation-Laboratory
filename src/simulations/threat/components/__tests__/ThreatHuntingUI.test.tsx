import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThreatHuntingWorkspace } from '../ThreatHuntingWorkspace';
import { useThreatHuntingStore } from '../../runtime/threatHuntingStore';

describe('OMEGA V16 — Threat Hunting UI Component Suite', () => {
  beforeEach(() => {
    useThreatHuntingStore.getState().setActiveHunt('HUNT-01');
    useThreatHuntingStore.getState().setActiveTab('TELEMETRY');
    useThreatHuntingStore.getState().resetFilters();
  });

  it('renders 3-pane layout elements and main stage', () => {
    render(<ThreatHuntingWorkspace language="en" />);

    expect(screen.getByTestId('threat-hunting-workspace')).toBeDefined();
    expect(screen.getByTestId('tab-telemetry')).toBeDefined();
    expect(screen.getByTestId('tab-query')).toBeDefined();
    expect(screen.getByTestId('tab-correlation')).toBeDefined();
    expect(screen.getByTestId('tab-threat_intel')).toBeDefined();
    expect(screen.getByTestId('tab-findings')).toBeDefined();
    expect(screen.getByTestId('tab-detection')).toBeDefined();
    expect(screen.getByTestId('tab-master')).toBeDefined();
  });

  it('switches to Query Editor tab and executes a search query', () => {
    render(<ThreatHuntingWorkspace language="en" />);

    const queryTab = screen.getByTestId('tab-query');
    fireEvent.click(queryTab);

    const runBtn = screen.getByTestId('btn-run-query');
    expect(runBtn).toBeDefined();
    fireEvent.click(runBtn);

    // Diagnostics banner should display matches
    expect(screen.getByText(/Matched Events:/i)).toBeDefined();
  });

  it('switches to Hypothesis tab and marks hypothesis supported', () => {
    render(<ThreatHuntingWorkspace language="en" />);

    const hypTab = screen.getByTestId('tab-hypothesis');
    fireEvent.click(hypTab);

    const supportBtn = screen.getByTestId('btn-support-hypothesis');
    fireEvent.click(supportBtn);

    expect(useThreatHuntingStore.getState().hypotheses['HYP-01'].status).toBe('SUPPORTED');
  });

  it('renders Detection Builder tab and tunes rule', () => {
    render(<ThreatHuntingWorkspace language="en" />);

    const detTab = screen.getByTestId('tab-detection');
    fireEvent.click(detTab);

    const testBtn = screen.getByTestId('btn-test-rule');
    fireEvent.click(testBtn);

    // Sliders should exist
    expect(screen.getByTestId('slider-threshold')).toBeDefined();
    expect(screen.getByTestId('slider-window')).toBeDefined();
  });

  it('supports Arabic RTL rendering with proper test attributes', () => {
    render(<ThreatHuntingWorkspace language="ar" />);

    expect(screen.getAllByText(/صيد التهديدات/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('tab-hypothesis')).toBeDefined();
  });
});
