import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ActiveDeceptionLab } from '../ActiveDeceptionLab';

describe('ActiveDeceptionLab', () => {
  it('renders Cyber Deception & Active Defense header and scenarios', () => {
    render(<ActiveDeceptionLab language="en" />);
    expect(screen.getAllByText(/Cyber Deception & Active Defense Honeypots Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/AWS Honeytoken Access Key Tripping/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is ar', () => {
    render(<ActiveDeceptionLab language="ar" />);
    expect(screen.getAllByText(/مختبر الدفاع السيبراني الإيجابي وتقنيات الخداع/i)[0]).toBeDefined();
  });

  it('detects and entangles attacker when Canarytoken alert rule is enabled', async () => {
    render(<ActiveDeceptionLab language="en" />);
    const probeBtn = screen.getAllByText(/Simulate Attacker Probe/i)[0];
    fireEvent.click(probeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/THREAT ACTOR ENTANGLED IN HONEYPOT/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('logs probe without automatic isolation when dynamic microsegmentation is off for Decoy DC', async () => {
    render(<ActiveDeceptionLab language="en" />);
    // Select DEC-02
    const decoyDcBtn = screen.getAllByText(/High-Interaction Decoy Domain Controller SMB Breach/i)[0];
    fireEvent.click(decoyDcBtn);

    const probeBtn = screen.getAllByText(/Simulate Attacker Probe/i)[0];
    fireEvent.click(probeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/ATTACKER PROBE DETECTED \(NO ISOLATION\)/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
