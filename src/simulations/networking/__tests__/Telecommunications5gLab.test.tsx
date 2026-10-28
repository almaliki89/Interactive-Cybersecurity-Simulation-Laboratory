import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Telecommunications5gLab } from '../Telecommunications5gLab';

describe('Telecommunications5gLab', () => {
  it('renders 5G Core Telecom Security header and threat vectors', () => {
    render(<Telecommunications5gLab language="en" />);
    expect(screen.getAllByText(/5G Core Network & Telecom Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/IMSI Catcher \/ SUPI Cleartext Extraction/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is set to ar', () => {
    render(<Telecommunications5gLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان شبكات الاتصالات 5G والشرائح الشبكية/i)[0]).toBeDefined();
  });

  it('transmits payload and reports breach when SUCI encryption is off', async () => {
    render(<Telecommunications5gLab language="en" />);
    const transmitBtn = screen.getAllByText(/Transmit Telecom Payload/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL 5G NETWORK BREACH EXPLOITED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('protects SUPI subscriber identity when SUCI Curve25519 encryption is enforced', async () => {
    render(<Telecommunications5gLab language="en" />);
    const suciCheckbox = screen.getByLabelText(/Enforce SUCI Profile A Encryption/i);
    fireEvent.click(suciCheckbox);

    const transmitBtn = screen.getAllByText(/Transmit Telecom Payload/i)[0];
    fireEvent.click(transmitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/5G CORE SECURITY DEFENSE SUCCESSFUL/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
