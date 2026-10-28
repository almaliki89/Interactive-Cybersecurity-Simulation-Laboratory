import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { IcsScadaLab } from '../IcsScadaLab';

describe('IcsScadaLab', () => {
  it('renders SCADA telemetries and Modbus command list', () => {
    render(<IcsScadaLab language="en" />);
    expect(screen.getAllByText(/OT, ICS & SCADA Modbus Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Reactor Core Temp/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Read Generator Telemetry \(FC 03\)/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<IcsScadaLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان النظم التشغيلية وتجهيزات SCADA \/ ICS/i)[0]).toBeDefined();
    expect(screen.getAllByText(/حرارة القلب/i)[0]).toBeDefined();
  });

  it('transmits read command and processes telemetry request', async () => {
    render(<IcsScadaLab language="en" />);
    const transmitBtn = screen.getAllByText(/Transmit Modbus Frame/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/READ COMMAND PROCESSED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('blocks malicious write command when industrial firewall policy is enforced', async () => {
    render(<IcsScadaLab language="en" />);
    // Select malicious command CMD-03
    const tamperBtn = screen.getAllByText(/Tamper Cooling Valve Setpoint \(FC 06\)/i)[0];
    fireEvent.click(tamperBtn);

    // Enable firewall policy
    const firewallCheckbox = screen.getByLabelText(/Enforce Read-Only Modbus Policy/i);
    fireEvent.click(firewallCheckbox);

    const transmitBtn = screen.getAllByText(/Transmit Modbus Frame/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/MODBUS FRAME DROPPED BY FIREWALL/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
