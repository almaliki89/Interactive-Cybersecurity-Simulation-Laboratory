// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { Header } from '../../components/ui/Header';
import { SocWorkstation } from '../../simulations/soc/components/SocWorkstation';
import { ForensicsCaseWorkspace } from '../../simulations/forensics/components/ForensicsCaseWorkspace';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { useSocStore } from '../../stores/socStore';
import { useForensicsStore } from '../../stores/forensicsStore';
import { createDefaultForensicsCase } from '../../simulations/forensics/logic/evidence';

describe('Phase 4 — Rendered Visual QA, Responsive Viewports & RTL Consistency', () => {
  const VIEWPORTS = [
    { name: 'Desktop (1440x900)', width: 1440, height: 900 },
    { name: 'Laptop (1280x800)', width: 1280, height: 800 },
    { name: 'Tablet Landscape (1024x768)', width: 1024, height: 768 },
    { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024 },
    { name: 'Mobile (390x844)', width: 390, height: 844 },
    { name: 'Small Mobile (360x800)', width: 360, height: 800 },
  ];

  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
    window.dispatchEvent(new Event('resize'));
  };

  beforeEach(() => {
    useSimulationStore.setState({
      language: 'ar',
      virtualTime: 1250,
      clockStatus: 'running',
      clockSpeed: 1,
      activeSimulationId: 'landing',
      events: [
        {
          id: 'evt-qa-001',
          timestamp: 1250,
          type: 'BRUTE_FORCE_BURST',
          source: 'HOST-CORP-01',
          target: 'SRV-AUTH-01',
          category: 'AUTHENTICATION',
          severity: 'CRITICAL',
          virtualTime: 1250,
          description: 'High frequency failed logins detected',
          payload: { user: 'admin', ip: '192.168.1.50' },
        },
      ],
    });

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

    useForensicsStore.setState({
      activeTab: 'map',
      selectedEvidenceId: null,
      evidence: [
        {
          id: 'EVD-RAM-001',
          type: 'MEMORY_IMAGE',
          sourceHost: 'SRV-AUTH-01',
          sourceUser: 'admin',
          acquiredAtVirtualTime: 1200,
          originalHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          currentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          integrityStatus: 'VERIFIED',
          preserved: true,
          metadata: { rawEventId: 'evt-qa-001', acquisitionTool: 'LiME' },
        },
      ],
      custodyRecords: [
        {
          id: 'REC-001',
          evidenceId: 'EVD-RAM-001',
          action: 'COLLECTED',
          actor: 'Investigator Alpha',
          virtualTime: 1200,
          notes: 'Volatile memory dump acquired under live conditions',
        },
      ],
      caseDetails: createDefaultForensicsCase(1200),
      deepLinkContext: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Global Header with proper identity across major worlds in both Arabic and English', () => {
    const testWorlds: Array<{ id: SimulationId; expectedArabic: string; expectedEnglish: string }> = [
      { id: 'soc', expectedArabic: 'مركز العمليات SOC', expectedEnglish: 'SOC Operations' },
      { id: 'forensics', expectedArabic: 'التحقيق الجنائي الرقمي', expectedEnglish: 'Digital Forensics World' },
      { id: 'devsecops', expectedArabic: 'أمن سلاسل التوريد', expectedEnglish: 'Software Supply Chain' },
      { id: 'cloud', expectedArabic: 'أمن الحوسبة السحابية', expectedEnglish: 'Cloud Security World' },
      { id: 'containers', expectedArabic: 'أمن الحاويات وكوبرنيتيس', expectedEnglish: 'Container & K8s Security' },
    ];

    for (const world of testWorlds) {
      // 1. Arabic
      act(() => {
        useSimulationStore.setState({ language: 'ar', activeSimulationId: world.id });
      });
      const { unmount: unmountAr } = render(<Header />);
      expect(document.body.textContent).toContain(world.expectedArabic);
      unmountAr();

      // 2. English
      act(() => {
        useSimulationStore.setState({ language: 'en', activeSimulationId: world.id });
      });
      const { unmount: unmountEn } = render(<Header />);
      expect(document.body.textContent).toContain(world.expectedEnglish);
      unmountEn();
    }
  });

  it('verifies responsive header stability across all required viewports (1440 down to 360)', () => {
    act(() => {
      useSimulationStore.setState({ language: 'ar', activeSimulationId: 'soc' });
    });

    for (const vp of VIEWPORTS) {
      setViewport(vp.width, vp.height);
      const { unmount } = render(<Header />);
      
      // Back button to universe must be reachable
      const backBtn = screen.getByTitle('العودة للكون');
      expect(backBtn).toBeDefined();

      // Language toggle button must be rendered
      expect(screen.getByText('EN')).toBeDefined();

      unmount();
    }
  });

  it('verifies SOC workstation rendered behavior and drawer mutual exclusion in Arabic RTL', () => {
    act(() => {
      useSimulationStore.setState({ language: 'ar' });
    });

    render(<SocWorkstation />);

    const queueBtn = screen.getByTestId('soc-toggle-queue-btn');
    const inspectorBtn = screen.getByTestId('soc-toggle-inspector-btn');

    // Default closed drawers on mobile overlay
    expect(screen.queryByTestId('soc-mobile-queue-drawer')).toBeNull();
    expect(screen.queryByTestId('soc-mobile-inspector-drawer')).toBeNull();

    // 1. Open mobile queue drawer
    fireEvent.click(queueBtn);
    expect(screen.getByTestId('soc-mobile-queue-drawer')).toBeDefined();
    expect(screen.queryByTestId('soc-mobile-inspector-drawer')).toBeNull();

    // 2. Open mobile inspector drawer -> mutual exclusion automatically closes queue drawer
    fireEvent.click(inspectorBtn);
    expect(screen.getByTestId('soc-mobile-inspector-drawer')).toBeDefined();
    expect(screen.queryByTestId('soc-mobile-queue-drawer')).toBeNull();

    // 3. Escape key dismisses inspector drawer
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('soc-mobile-inspector-drawer')).toBeNull();
  });

  it('verifies Forensics Case Workspace rendered behavior, drawer mutual exclusion, and technical drawer in Arabic RTL', () => {
    act(() => {
      useSimulationStore.setState({ language: 'ar' });
    });

    render(
      <ForensicsCaseWorkspace>
        <div data-testid="case-lab-content">Forensics Lab Canvas</div>
      </ForensicsCaseWorkspace>
    );

    const evidenceBtn = screen.getByTestId('toggle-evidence-btn');
    const inspectorBtn = screen.getByTestId('toggle-inspector-btn');
    const techBtn = screen.getByTestId('toggle-tech-btn');

    // 1. Toggle Evidence Drawer
    fireEvent.click(evidenceBtn);
    expect(screen.getByTestId('mobile-evidence-drawer')).toBeDefined();
    expect(screen.queryByTestId('mobile-inspector-drawer')).toBeNull();

    // 2. Toggle Inspector Drawer -> closes evidence drawer
    fireEvent.click(inspectorBtn);
    expect(screen.getByTestId('mobile-inspector-drawer')).toBeDefined();
    expect(screen.queryByTestId('mobile-evidence-drawer')).toBeNull();

    // 3. Toggle Technical Drawer
    fireEvent.click(techBtn);
    expect(screen.getByTestId('technical-drawer')).toBeDefined();

    // 4. Escape closes open drawers
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('technical-drawer')).toBeNull();
  });

  it('verifies technical values (hashes, IDs, timestamps) maintain dir="ltr" in RTL Arabic mode', () => {
    act(() => {
      useSimulationStore.setState({ language: 'ar' });
      useForensicsStore.getState().setSelectedEvidenceId('EVD-RAM-001');
    });

    render(
      <ForensicsCaseWorkspace>
        <div>Forensics Lab</div>
      </ForensicsCaseWorkspace>
    );

    // Click inspector to open
    const inspectorBtn = screen.getByTestId('toggle-inspector-btn');
    fireEvent.click(inspectorBtn);

    // Verify hash container has dir="ltr"
    const hashElements = screen.getAllByText(/e3b0c44298fc1c149afbf4c8996f/);
    expect(hashElements.length).toBeGreaterThan(0);
    expect(hashElements[0].getAttribute('dir')).toBe('ltr');
  });
});
