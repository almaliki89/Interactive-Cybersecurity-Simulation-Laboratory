import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { WasmSecurityLab } from '../WasmSecurityLab';

describe('WasmSecurityLab', () => {
  it('renders WebAssembly Sandbox Security header and scenarios', () => {
    render(<WasmSecurityLab language="en" />);
    expect(screen.getAllByText(/WebAssembly Sandbox & WASI Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Linear Memory Out-of-Bounds Buffer Read\/Write/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is set to ar', () => {
    render(<WasmSecurityLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان الحاوية البرمجية WebAssembly/i)[0]).toBeDefined();
  });

  it('executes Wasm module and reports breach when bounds guard is off', async () => {
    render(<WasmSecurityLab language="en" />);
    const execBtn = screen.getAllByText(/Execute Wasm Module/i)[0];
    fireEvent.click(execBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL WASM VULNERABILITY EXPLOITED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('traps OOB memory read when memory bounds guard is enabled', async () => {
    render(<WasmSecurityLab language="en" />);
    const guardCheckbox = screen.getByLabelText(/Hardware Memory Guard Pages & Bounds Trap/i);
    fireEvent.click(guardCheckbox);

    const execBtn = screen.getAllByText(/Execute Wasm Module/i)[0];
    fireEvent.click(execBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/WASM TRAP CAUGHT - HOST SAFE/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
