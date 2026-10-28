import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { HardwareSideChannelLab } from '../HardwareSideChannelLab';

describe('HardwareSideChannelLab', () => {
  it('renders Hardware & Side-Channel Security header and scenarios', () => {
    render(<HardwareSideChannelLab language="en" />);
    expect(screen.getAllByText(/Hardware & Physical Side-Channel Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Differential Power Analysis \(DPA\) on AES-128/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is ar', () => {
    render(<HardwareSideChannelLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان العتاد والهجمات الجانبية \(Hardware & Side-Channel\)/i)[0]).toBeDefined();
  });

  it('captures trace and reports key extraction when no hardware countermeasure is enabled', async () => {
    render(<HardwareSideChannelLab language="en" />);
    const captureBtn = screen.getAllByText(/Capture Hardware Trace/i)[0];
    fireEvent.click(captureBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/PHYSICAL HARDWARE EXPLOITED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('mitigates power analysis when power masking countermeasure is enabled', async () => {
    render(<HardwareSideChannelLab language="en" />);
    const maskingCheckbox = screen.getByLabelText(/Power Masking & Random Delay Jitter/i);
    fireEvent.click(maskingCheckbox);

    const captureBtn = screen.getAllByText(/Capture Hardware Trace/i)[0];
    fireEvent.click(captureBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/HARDWARE ATTACK MITIGATED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
