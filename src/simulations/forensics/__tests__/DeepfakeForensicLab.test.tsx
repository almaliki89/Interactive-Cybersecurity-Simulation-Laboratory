import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { DeepfakeForensicLab } from '../DeepfakeForensicLab';

describe('DeepfakeForensicLab', () => {
  it('renders Deepfake Forensics header and default CEO scenario', () => {
    render(<DeepfakeForensicLab language="en" />);
    expect(screen.getAllByText(/Deepfake Attribution & Synthetic Media Forensics Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/CEO Voice & Face Synthesis/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<DeepfakeForensicLab language="ar" />);
    expect(screen.getAllByText(/مختبر التحليل الجنائي للوسائط الاصطناعية/i)[0]).toBeDefined();
  });

  it('triggers forensic scan and reports verification failure when undefended', async () => {
    render(<DeepfakeForensicLab language="en" />);
    const scanBtn = screen.getAllByText(/Execute AI Forensic Scan/i)[0];
    fireEvent.click(scanBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL FORENSIC FAILURE: Deepfake accepted/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('detects deepfake when landmark jitter analysis is enabled', async () => {
    render(<DeepfakeForensicLab language="en" />);
    const jitterCheckbox = screen.getByLabelText(/Facial Landmark Temporal Jitter Tracking/i);
    fireEvent.click(jitterCheckbox);

    const scanBtn = screen.getAllByText(/Execute AI Forensic Scan/i)[0];
    fireEvent.click(scanBtn);

    const result = await screen.findByText(/MEDIA DECLARED SYNTHETIC/i, {}, { timeout: 2000 });
    expect(result).toBeDefined();
  });
});
