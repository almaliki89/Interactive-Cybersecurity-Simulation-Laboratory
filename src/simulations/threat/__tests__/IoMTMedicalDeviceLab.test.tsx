import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { IoMTMedicalDeviceLab } from '../IoMTMedicalDeviceLab';

describe('IoMTMedicalDeviceLab', () => {
  it('renders IoMT Medical Device Cybersecurity header and default pacemaker scenario', () => {
    render(<IoMTMedicalDeviceLab language="en" />);
    expect(screen.getAllByText(/IoMT Medical Device Cybersecurity & Bio-Telemetry Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Implantable Cardiac Pacemaker RF Pacing Invalidation/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<IoMTMedicalDeviceLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان الأجهزة الطبية الحيوية وإنترنت الأشياء الطبية/i)[0]).toBeDefined();
  });

  it('transmits RF frame and reports vital breach when failsafes are disabled', async () => {
    render(<IoMTMedicalDeviceLab language="en" />);
    const transmitBtn = screen.getAllByText(/Transmit Malicious Medical RF Frame/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL PATIENT VITAL BREACH/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('mitigates medical cyber attack when hardware failsafe limiter is enabled', async () => {
    render(<IoMTMedicalDeviceLab language="en" />);
    const failsafeCheckbox = screen.getByLabelText(/Analog Hardware Failsafe/i);
    fireEvent.click(failsafeCheckbox);

    const transmitBtn = screen.getAllByText(/Transmit Malicious Medical RF Frame/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CLINICAL DEFENSES ENGAGED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
