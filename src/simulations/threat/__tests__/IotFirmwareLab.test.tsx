import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { IotFirmwareLab } from '../IotFirmwareLab';

describe('IotFirmwareLab', () => {
  it('renders IoT Firmware & Hardware Debugging header and default scenario', () => {
    render(<IotFirmwareLab language="en" />);
    expect(screen.getAllByText(/IoT Firmware Reversing & Hardware Debugging Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/SPI Flash Chip Off-Board Firmware Extraction/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is ar', () => {
    render(<IotFirmwareLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان رقاقات إنترنت الأشياء والبرمجيات الثابتة/i)[0]).toBeDefined();
  });

  it('dumps flash chip when eFuses are not locked', async () => {
    render(<IotFirmwareLab language="en" />);
    const dumpBtn = screen.getAllByText(/Execute Hardware Dump/i)[0];
    fireEvent.click(dumpBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL FIRMWARE ARTIFACTS DUMPED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('blocks hardware extraction when eFuses JTAG/UART lockout is enabled', async () => {
    render(<IotFirmwareLab language="en" />);
    const efuseCheckbox = screen.getByLabelText(/Hardware eFuses JTAG\/UART Lockout/i);
    fireEvent.click(efuseCheckbox);

    const dumpBtn = screen.getAllByText(/Execute Hardware Dump/i)[0];
    fireEvent.click(dumpBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/FIRMWARE HARDENED & PROTECTED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
