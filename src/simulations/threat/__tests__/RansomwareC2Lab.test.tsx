import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { RansomwareC2Lab } from '../RansomwareC2Lab';

describe('RansomwareC2Lab', () => {
  it('renders Ransomware & Stealth C2 header and scenarios', () => {
    render(<RansomwareC2Lab language="en" />);
    expect(screen.getAllByText(/Ransomware & Stealth C2 Emulation Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Volume Shadow Wipe & ChaCha20 Hybrid Encryption/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is set to ar', () => {
    render(<RansomwareC2Lab language="ar" />);
    expect(screen.getAllByText(/مختبر محاكاة برمجيات الفدية وقنوات القيادة والسيطرة/i)[0]).toBeDefined();
  });

  it('reports files encrypted when Canary honeypot defense is off', async () => {
    render(<RansomwareC2Lab language="en" />);
    const execBtn = screen.getAllByText(/Execute Ransomware Action/i)[0];
    fireEvent.click(execBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/RANSOMWARE COMPROMISE DETECTED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('halts ransomware process when Canary honeypots are deployed', async () => {
    render(<RansomwareC2Lab language="en" />);
    const canaryCheckbox = screen.getByLabelText(/Canary Honeypot Files & Instant Process Kill/i);
    fireEvent.click(canaryCheckbox);

    const execBtn = screen.getAllByText(/Execute Ransomware Action/i)[0];
    fireEvent.click(execBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/RANSOMWARE HALTED - CANARY TRIGGERED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
