import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AerospaceSatelliteLab } from '../AerospaceSatelliteLab';

describe('AerospaceSatelliteLab', () => {
  it('renders Satellite & Aerospace Security header and scenarios', () => {
    render(<AerospaceSatelliteLab language="en" />);
    expect(screen.getAllByText(/Satellite & Aerospace Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Unauthenticated Telecommand \(TC\) Injection/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language prop is ar', () => {
    render(<AerospaceSatelliteLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان الأقمار الصناعية والأنظمة الفضائية/i)[0]).toBeDefined();
  });

  it('transmits payload and reports orbital incident when SDLS auth is disabled', async () => {
    render(<AerospaceSatelliteLab language="en" />);
    const transmitBtn = screen.getAllByText(/Transmit Space Signal/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL SPACE INCIDENT EXPLOITED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('protects spacecraft when CCSDS SDLS authentication is enforced', async () => {
    render(<AerospaceSatelliteLab language="en" />);
    const sdlsCheckbox = screen.getByLabelText(/CCSDS SDLS Telecommand Authentication/i);
    fireEvent.click(sdlsCheckbox);

    const transmitBtn = screen.getAllByText(/Transmit Space Signal/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/SPACE LINK SECURITY DEFENSE ACTIVE/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
