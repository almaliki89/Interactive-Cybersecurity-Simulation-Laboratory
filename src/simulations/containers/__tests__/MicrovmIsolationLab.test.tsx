import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MicrovmIsolationLab } from '../MicrovmIsolationLab';

describe('MicrovmIsolationLab', () => {
  it('renders MicroVM & Container Isolation header and default runc escape scenario', () => {
    render(<MicrovmIsolationLab language="en" />);
    expect(screen.getAllByText(/MicroVM & Advanced Container Isolation Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Shared Kernel runc Container Escape/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<MicrovmIsolationLab language="ar" />);
    expect(screen.getAllByText(/مختبر عزل الحاويات والآلات الافتراضية المصغرة/i)[0]).toBeDefined();
  });

  it('triggers container breakout and reports host kernel compromise when running standard runc', async () => {
    render(<MicrovmIsolationLab language="en" />);
    const triggerBtn = screen.getAllByText(/Trigger Container Breakout Exploit/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL HOST KERNEL ESCAPE/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('contains breakout attempt when Kata Containers hardware virtualization is enabled', async () => {
    render(<MicrovmIsolationLab language="en" />);
    const kataCheckbox = screen.getByLabelText(/Kata Containers/i);
    fireEvent.click(kataCheckbox);

    const triggerBtn = screen.getAllByText(/Trigger Container Breakout Exploit/i)[0];
    fireEvent.click(triggerBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/MICROVM ISOLATION INTACT/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
