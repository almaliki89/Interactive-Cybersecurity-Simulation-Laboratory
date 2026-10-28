import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AutomotiveCanLab } from '../AutomotiveCanLab';

describe('AutomotiveCanLab', () => {
  it('renders Automotive CAN Bus & V2X header and default scenario', () => {
    render(<AutomotiveCanLab language="en" />);
    expect(screen.getAllByText(/Automotive CAN Bus & Connected Vehicle Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Emergency Brake \(ABS\) Invalidation & Release/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<AutomotiveCanLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان المركبات الذكية وشبكات السيارات/i)[0]).toBeDefined();
  });

  it('transmits CAN frame and reports brake override compromise when SecOC is disabled', async () => {
    render(<AutomotiveCanLab language="en" />);
    const injectBtn = screen.getAllByText(/Inject CAN Frame/i)[0];
    fireEvent.click(injectBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL VEHICLE SAFETY BREACH/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('drops malicious CAN frame when SecOC message authentication is enabled', async () => {
    render(<AutomotiveCanLab language="en" />);
    const secOcCheckbox = screen.getByLabelText(/AUTOSAR SecOC Message Authentication/i);
    fireEvent.click(secOcCheckbox);

    const injectBtn = screen.getAllByText(/Inject CAN Frame/i)[0];
    fireEvent.click(injectBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/AUTOMOTIVE ATTACK SAFELY BLOCKED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
