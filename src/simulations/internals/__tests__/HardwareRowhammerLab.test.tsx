import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { HardwareRowhammerLab } from '../HardwareRowhammerLab';

describe('HardwareRowhammerLab', () => {
  it('renders Hardware Rowhammer & DRAM Bit-Flipping header and default scenario', () => {
    render(<HardwareRowhammerLab language="en" />);
    expect(screen.getAllByText(/Hardware Rowhammer & DRAM Bit-Flipping Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/PTE Hijacking for Kernel Privilege Escalation/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<HardwareRowhammerLab language="ar" />);
    expect(screen.getAllByText(/مختبر هجمات Rowhammer وقلب بتات الذاكرة الفيزيائية/i)[0]).toBeDefined();
  });

  it('triggers memory hammering and reports bit-flip success when undefended', async () => {
    render(<HardwareRowhammerLab language="en" />);
    const triggerBtn = screen.getAllByText(/Execute Memory Hammering/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL BIT-FLIP SUCCESSFUL/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('blocks hardware fault when ECC memory defense is enabled', async () => {
    render(<HardwareRowhammerLab language="en" />);
    const eccCheckbox = screen.getByLabelText(/ECC \(Error Correction Code\) Memory/i);
    fireEvent.click(eccCheckbox);

    const triggerBtn = screen.getAllByText(/Execute Memory Hammering/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/MEMORY INTEGRITY PRESERVED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
