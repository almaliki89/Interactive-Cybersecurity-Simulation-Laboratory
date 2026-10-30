import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BciNeuralSecurityLab } from '../BciNeuralSecurityLab';

describe('BciNeuralSecurityLab', () => {
  it('renders BCI & Neural Security header and default P300 scenario', () => {
    render(<BciNeuralSecurityLab language="en" />);
    expect(screen.getAllByText(/Brain-Computer Interface \(BCI\) & Neural Cybersecurity Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/P300 Response Exfiltration/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<BciNeuralSecurityLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان الواجهات العصبية والدماغية/i)[0]).toBeDefined();
  });

  it('triggers neural strike and reports cognitive breach when undefended', async () => {
    render(<BciNeuralSecurityLab language="en" />);
    const triggerBtn = screen.getAllByText(/Trigger Wireless Neural Strike/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL COGNITIVE BREACH/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('protects neural integrity when differential privacy is enabled', async () => {
    render(<BciNeuralSecurityLab language="en" />);
    const privacyCheckbox = screen.getByLabelText(/Neural Stream Differential Privacy/i);
    fireEvent.click(privacyCheckbox);

    const triggerBtn = screen.getAllByText(/Trigger Wireless Neural Strike/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/NEURAL INTEGRITY SECURED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
