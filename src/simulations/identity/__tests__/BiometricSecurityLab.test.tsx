import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BiometricSecurityLab } from '../BiometricSecurityLab';

describe('BiometricSecurityLab', () => {
  it('renders Biometric Security & PAD header and scenarios', () => {
    render(<BiometricSecurityLab language="en" />);
    expect(screen.getAllByText(/Biometric Security & Presentation Attack Detection Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Generative AI Deepfake Live Video Injection/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is set to ar', () => {
    render(<BiometricSecurityLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان السمات الحيوية وفحص الحيوية ضد التزييف/i)[0]).toBeDefined();
  });

  it('scans sample and reports deepfake breach when 3D depth sensor is off', async () => {
    render(<BiometricSecurityLab language="en" />);
    const scanBtn = screen.getAllByText(/Scan Biometric Sample/i)[0];
    fireEvent.click(scanBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL BIOMETRIC BREACH - DEEPFAKE ACCEPTED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('blocks deepfake sample when 3D depth grid sensor is enabled', async () => {
    render(<BiometricSecurityLab language="en" />);
    const depthCheckbox = screen.getByLabelText(/3D Structured Light Depth Grid Sensor/i);
    fireEvent.click(depthCheckbox);

    const scanBtn = screen.getAllByText(/Scan Biometric Sample/i)[0];
    fireEvent.click(scanBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/PRESENTATION ATTACK DETECTED & BLOCKED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
