import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PostQuantumLab } from '../PostQuantumLab';

describe('PostQuantumLab', () => {
  it('renders Post-Quantum Safe Cryptography header and scheme selectors', () => {
    render(<PostQuantumLab language="en" />);
    expect(screen.getAllByText(/Post-Quantum Safe Cryptography Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/RSA-2048 \(Classical\)/i)[0]).toBeDefined();
    expect(screen.getAllByText(/ML-KEM-768 \(Kyber\)/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<PostQuantumLab language="ar" />);
    expect(screen.getAllByText(/مختبر التشفير المقاوم للحواسيب الكمومية \(Post-Quantum Crypto\)/i)[0]).toBeDefined();
  });

  it('simulates Shor quantum attack against RSA-2048 and reports vulnerability', async () => {
    render(<PostQuantumLab language="en" />);
    const rsaBtn = screen.getAllByText(/RSA-2048 \(Classical\)/i)[0];
    fireEvent.click(rsaBtn);

    const attackBtn = screen.getAllByText(/Launch Shor Attack/i)[0];
    fireEvent.click(attackBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRYPTO SYSTEM BROKEN BY QUANTUM SHOR/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('simulates Shor quantum attack against ML-KEM-768 and reports quantum resilience', async () => {
    render(<PostQuantumLab language="en" />);
    const kemBtn = screen.getAllByText(/ML-KEM-768 \(Kyber\)/i)[0];
    fireEvent.click(kemBtn);

    const attackBtn = screen.getAllByText(/Launch Shor Attack/i)[0];
    fireEvent.click(attackBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/QUANTUM RESILIENT CRYPTO SYSTEM/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
