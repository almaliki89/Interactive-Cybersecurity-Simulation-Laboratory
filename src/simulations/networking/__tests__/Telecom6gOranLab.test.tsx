import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Telecom6gOranLab } from '../Telecom6gOranLab';

describe('Telecom6gOranLab', () => {
  it('renders 6G O-RAN Security header and default scenario', () => {
    render(<Telecom6gOranLab language="en" />);
    expect(screen.getAllByText(/6G Open-RAN Architecture & RIC Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Malicious xApp Near-RT RIC Hijack/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<Telecom6gOranLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان شبكات 6G وخلية راديو O-RAN/i)[0]).toBeDefined();
  });

  it('injects O-RAN attack and reports slice compromise when undefended', async () => {
    render(<Telecom6gOranLab language="en" />);
    const triggerBtn = screen.getAllByText(/Inject O-RAN Attack Payload/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL TELECOM BREACH/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('enforces O-RAN security when xApp runtime sandboxing is enabled', async () => {
    render(<Telecom6gOranLab language="en" />);
    const sandboxingCheckbox = screen.getByLabelText(/Near-RT RIC xApp Runtime Sandboxing/i);
    fireEvent.click(sandboxingCheckbox);

    const triggerBtn = screen.getAllByText(/Inject O-RAN Attack Payload/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/O-RAN ARCHITECTURE SECURED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
