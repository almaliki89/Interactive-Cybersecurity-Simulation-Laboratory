// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SocWorkstation } from '../../simulations/soc/components/SocWorkstation';
import { useSocStore } from '../../stores/socStore';
import { useSimulationStore } from '../../stores/simulationStore';

describe('SocWorkstation Testing Library Component & Mobile Drawers', () => {
  beforeEach(() => {
    useSocStore.setState({
      activeTab: 'QUEUE',
      selectedAlertId: null,
      selectedEventId: null,
      isRawDrawerOpen: false,
      alertStatuses: {},
      filters: {
        severity: [],
        sourceWorld: [],
        category: [],
        outcome: [],
        user: [],
      },
    });
    useSimulationStore.setState({
      language: 'en',
      virtualTime: 0,
      events: [
        {
          id: 'test-evt-1',
          timestamp: 120,
          type: 'FAILED_LOGIN_ANOMALY',
          source: 'HOST-01',
          target: 'SRV-01',
          category: 'AUTHENTICATION',
          severity: 'HIGH',
          virtualTime: 120,
          description: 'Repeated authentication failures',
          payload: { user: 'root', ip: '10.0.0.5' },
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders SocWorkstation and default closed mobile drawers', () => {
    render(<SocWorkstation />);

    expect(screen.getByTestId('soc-toggle-queue-btn')).toBeDefined();
    expect(screen.getByTestId('soc-toggle-inspector-btn')).toBeDefined();

    // Default closed on mobile
    expect(screen.queryByTestId('soc-mobile-queue-drawer')).toBeNull();
    expect(screen.queryByTestId('soc-mobile-inspector-drawer')).toBeNull();
  });

  it('toggles mobile queue and inspector drawers with mutual exclusion', () => {
    render(<SocWorkstation />);

    const queueBtn = screen.getByTestId('soc-toggle-queue-btn');
    const inspectorBtn = screen.getByTestId('soc-toggle-inspector-btn');

    // 1. Click Queue button -> opens mobile queue drawer
    fireEvent.click(queueBtn);
    expect(screen.getByTestId('soc-mobile-queue-drawer')).toBeDefined();
    expect(screen.queryByTestId('soc-mobile-inspector-drawer')).toBeNull();

    // 2. Click Inspector button -> opens inspector drawer and closes queue drawer
    fireEvent.click(inspectorBtn);
    expect(screen.getByTestId('soc-mobile-inspector-drawer')).toBeDefined();
    expect(screen.queryByTestId('soc-mobile-queue-drawer')).toBeNull();

    // 3. Click Queue button again -> opens queue drawer and closes inspector drawer
    fireEvent.click(queueBtn);
    expect(screen.getByTestId('soc-mobile-queue-drawer')).toBeDefined();
    expect(screen.queryByTestId('soc-mobile-inspector-drawer')).toBeNull();
  });

  it('closes mobile drawer when Escape key is pressed', () => {
    render(<SocWorkstation />);

    const queueBtn = screen.getByTestId('soc-toggle-queue-btn');
    fireEvent.click(queueBtn);
    expect(screen.getByTestId('soc-mobile-queue-drawer')).toBeDefined();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('soc-mobile-queue-drawer')).toBeNull();
  });
});
