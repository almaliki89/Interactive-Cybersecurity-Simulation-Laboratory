import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { DroneHijackMavlinkLab } from '../DroneHijackMavlinkLab';

describe('DroneHijackMavlinkLab', () => {
  it('renders Drone Hijacking & MAVLink header and default scenario', () => {
    render(<DroneHijackMavlinkLab language="en" />);
    expect(screen.getAllByText(/Drone Hijacking & MAVLink Protocol Injection Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/MAVLink Command Injection/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<DroneHijackMavlinkLab language="ar" />);
    expect(screen.getAllByText(/مختبر اختطاف الدرونز وحقن بروتوكول MAVLink/i)[0]).toBeDefined();
  });

  it('transmits rogue MAVLink hijack and reports flight control loss when undefended', async () => {
    render(<DroneHijackMavlinkLab language="en" />);
    const triggerBtn = screen.getAllByText(/Transmit Rogue MAVLink Hijack/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL FLIGHT CONTROL LOSS/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('neutralizes hijack attempt when MAVLink cryptographic signing is enabled', async () => {
    render(<DroneHijackMavlinkLab language="en" />);
    const signingCheckbox = screen.getByLabelText(/MAVLink v2.0 Cryptographic Signing/i);
    fireEvent.click(signingCheckbox);

    const triggerBtn = screen.getAllByText(/Transmit Rogue MAVLink Hijack/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/FLIGHT INTEGRITY PROTECTED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
