import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { HsmPkiLab } from '../HsmPkiLab';

describe('HsmPkiLab', () => {
  it('renders HSM & Enterprise PKI header and operations', () => {
    render(<HsmPkiLab language="en" />);
    expect(screen.getAllByText(/Hardware Security Module \(HSM\) & Enterprise PKI Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Physical Tamper Detection & Key Zeroization/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is set to ar', () => {
    render(<HsmPkiLab language="ar" />);
    expect(screen.getAllByText(/مختبر وحدات الأمان العتادية وإدارة المفاتيح الجذرية/i)[0]).toBeDefined();
  });

  it('reports audit failure when tamper zeroization is disabled', async () => {
    render(<HsmPkiLab language="en" />);
    const execBtn = screen.getAllByText(/Execute HSM Command/i)[0];
    fireEvent.click(execBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/SECURITY CRITERIA BREACHED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('confirms FIPS compliance when tamper zeroization is enabled', async () => {
    render(<HsmPkiLab language="en" />);
    const zeroizeCheckbox = screen.getByLabelText(/FIPS Tamper Active Zeroization/i);
    fireEvent.click(zeroizeCheckbox);

    const execBtn = screen.getAllByText(/Execute HSM Command/i)[0];
    fireEvent.click(execBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/HSM FIPS COMPLIANCE CONFIRMED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
