import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SmartContractSecurityLab } from '../SmartContractSecurityLab';

describe('SmartContractSecurityLab', () => {
  it('renders Smart Contract Security header and default scenario', () => {
    render(<SmartContractSecurityLab language="en" />);
    expect(screen.getAllByText(/Smart Contract & Blockchain Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Reentrancy Vulnerability/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is ar', () => {
    render(<SmartContractSecurityLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان العقود الذكية وسلاسل الكتل/i)[0]).toBeDefined();
  });

  it('drains vault when ReentrancyGuard defense is disabled', async () => {
    render(<SmartContractSecurityLab language="en" />);
    const exploitBtn = screen.getAllByText(/Trigger Contract Exploit/i)[0];
    fireEvent.click(exploitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL CONTRACT DRAIN EXPLOITED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('secures contract vault when ReentrancyGuard is enabled', async () => {
    render(<SmartContractSecurityLab language="en" />);
    const guardCheckbox = screen.getByLabelText(/OpenZeppelin ReentrancyGuard & CEI Pattern/i);
    fireEvent.click(guardCheckbox);

    const exploitBtn = screen.getAllByText(/Trigger Contract Exploit/i)[0];
    fireEvent.click(exploitBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CONTRACT REVERTED SAFELY - FUNDS SECURED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
