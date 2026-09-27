// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { ForensicsCaseWorkspace } from '../../simulations/forensics/components/ForensicsCaseWorkspace';
import { useForensicsStore } from '../../stores/forensicsStore';
import { useSimulationStore } from '../../stores/simulationStore';
import { createDefaultForensicsCase } from '../../simulations/forensics/logic/evidence';

describe('ForensicsCaseWorkspace Testing Library Component Integration', () => {
  beforeEach(() => {
    useForensicsStore.setState({
      activeTab: 'map',
      selectedEvidenceId: null,
      evidence: [],
      custodyRecords: [],
      caseDetails: createDefaultForensicsCase(0),
      deepLinkContext: null,
    });
    useSimulationStore.setState({
      language: 'en',
      virtualTime: 0,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders workspace with real toolbar buttons and default closed mobile drawers', () => {
    render(
      <ForensicsCaseWorkspace>
        <div data-testid="test-content">Main Lab View</div>
      </ForensicsCaseWorkspace>
    );

    expect(screen.getByTestId('test-content')).toBeDefined();
    expect(screen.getByTestId('toggle-evidence-btn')).toBeDefined();
    expect(screen.getByTestId('toggle-inspector-btn')).toBeDefined();

    // Default closed
    expect(screen.queryByTestId('mobile-evidence-drawer')).toBeNull();
    expect(screen.queryByTestId('mobile-inspector-drawer')).toBeNull();
    expect(screen.queryByTestId('mobile-navigator-drawer')).toBeNull();
  });

  it('clicks real toolbar buttons and enforces Evidence / Inspector drawer mutual exclusion', () => {
    render(
      <ForensicsCaseWorkspace>
        <div>Case Workspace</div>
      </ForensicsCaseWorkspace>
    );

    const evidenceBtn = screen.getByTestId('toggle-evidence-btn');
    const inspectorBtn = screen.getByTestId('toggle-inspector-btn');

    // 1. Click Evidence button -> opens mobile evidence drawer
    fireEvent.click(evidenceBtn);
    expect(screen.getByTestId('mobile-evidence-drawer')).toBeDefined();
    expect(screen.queryByTestId('mobile-inspector-drawer')).toBeNull();

    // 2. Click Inspector button -> opens inspector drawer and automatically closes evidence drawer
    fireEvent.click(inspectorBtn);
    expect(screen.getByTestId('mobile-inspector-drawer')).toBeDefined();
    expect(screen.queryByTestId('mobile-evidence-drawer')).toBeNull();

    // 3. Click Evidence button again -> opens evidence drawer and closes inspector drawer
    fireEvent.click(evidenceBtn);
    expect(screen.getByTestId('mobile-evidence-drawer')).toBeDefined();
    expect(screen.queryByTestId('mobile-inspector-drawer')).toBeNull();
  });

  it('auto-opens inspector upon evidence selection while maintaining mutual exclusion', () => {
    render(
      <ForensicsCaseWorkspace>
        <div>Case Workspace</div>
      </ForensicsCaseWorkspace>
    );

    const evidenceBtn = screen.getByTestId('toggle-evidence-btn');

    // Open evidence drawer first
    fireEvent.click(evidenceBtn);
    expect(screen.getByTestId('mobile-evidence-drawer')).toBeDefined();

    // Auto-select evidence in the store
    act(() => {
      useForensicsStore.getState().setSelectedEvidenceId('EVD-MEM-001');
    });

    // Inspector drawer should be auto-opened, closing the evidence drawer
    expect(screen.getByTestId('mobile-inspector-drawer')).toBeDefined();
    expect(screen.queryByTestId('mobile-evidence-drawer')).toBeNull();
  });

  it('closes open mobile drawer when Escape key is pressed', () => {
    render(
      <ForensicsCaseWorkspace>
        <div>Case Workspace</div>
      </ForensicsCaseWorkspace>
    );

    const evidenceBtn = screen.getByTestId('toggle-evidence-btn');
    fireEvent.click(evidenceBtn);
    expect(screen.getByTestId('mobile-evidence-drawer')).toBeDefined();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('mobile-evidence-drawer')).toBeNull();
  });
});
