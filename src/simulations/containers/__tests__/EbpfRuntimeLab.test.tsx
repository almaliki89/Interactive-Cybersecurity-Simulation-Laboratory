import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { EbpfRuntimeLab } from '../EbpfRuntimeLab';

describe('EbpfRuntimeLab', () => {
  it('renders eBPF Kernel Tracing header and default scenario', () => {
    render(<EbpfRuntimeLab language="en" />);
    expect(screen.getAllByText(/eBPF Kernel Tracing & Runtime Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Kernel Syscall Traces/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Container Escape via Unshare Syscall/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language prop is ar', () => {
    render(<EbpfRuntimeLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان النواة المتقدم وتتبع eBPF \/ Tetragon/i)[0]).toBeDefined();
    expect(screen.getAllByText(/سيناريوهات استدعاءات النواة \(Syscalls\)/i)[0]).toBeDefined();
  });

  it('triggers trace and reports exploited syscall when no policy is enabled', async () => {
    render(<EbpfRuntimeLab language="en" />);
    const traceBtn = screen.getAllByText(/Trigger Kernel Trace/i)[0];
    fireEvent.click(traceBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/KERNEL SYSCALL EXPLOITED WITHOUT GUARD/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('intercepts syscall when namespace lock rule is enabled', async () => {
    render(<EbpfRuntimeLab language="en" />);
    const lockCheckbox = screen.getByLabelText(/Block Unshare \/ Namespace Escapes/i);
    fireEvent.click(lockCheckbox);

    const traceBtn = screen.getAllByText(/Trigger Kernel Trace/i)[0];
    fireEvent.click(traceBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/INTERCEPTED BY eBPF PROBE \(-EPERM\)/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
