import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MaritimeSecurityLab } from '../MaritimeSecurityLab';

describe('MaritimeSecurityLab', () => {
  it('renders Maritime & Vessel Security header and scenarios', () => {
    render(<MaritimeSecurityLab language="en" />);
    expect(screen.getAllByText(/Maritime & Autonomous Vessel System Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/AIS Phantom Vessel Ghost Fleet Injection/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is set to ar', () => {
    render(<MaritimeSecurityLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان السفن والأنظمة البحرية الذكية/i)[0]).toBeDefined();
  });

  it('transmits payload and reports breach when AIS plausibility check is off', async () => {
    render(<MaritimeSecurityLab language="en" />);
    const transmitBtn = screen.getAllByText(/Transmit Marine Payload/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL MARITIME SYSTEM EXPLOITED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('blocks AIS phantom vessel spoofing when radar plausibility filter is enabled', async () => {
    render(<MaritimeSecurityLab language="en" />);
    const radarCheckbox = screen.getByLabelText(/AIS Kinematic Plausibility Radar Filter/i);
    fireEvent.click(radarCheckbox);

    const transmitBtn = screen.getAllByText(/Transmit Marine Payload/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/MARITIME SECURITY DEFENSE ACTIVE/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
