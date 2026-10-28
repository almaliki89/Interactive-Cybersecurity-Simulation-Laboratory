import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { DependencyConfusionLab } from '../DependencyConfusionLab';

describe('DependencyConfusionLab', () => {
  it('renders Supply Chain & Dependency Confusion header and default scenario', () => {
    render(<DependencyConfusionLab language="en" />);
    expect(screen.getAllByText(/Supply Chain & Dependency Confusion Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Dependency Confusion Namespace Hijack/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<DependencyConfusionLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان سلسلة التوريد البرمجية وخلط التبعيات/i)[0]).toBeDefined();
  });

  it('triggers pipeline run and detects supply chain poisoning when undefended', async () => {
    render(<DependencyConfusionLab language="en" />);
    const runBtn = screen.getAllByText(/Run Build Pipeline/i)[0];
    fireEvent.click(runBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL SUPPLY CHAIN POISON/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('blocks dependency confusion attack when scoped registry lock is enabled', async () => {
    render(<DependencyConfusionLab language="en" />);
    const lockCheckbox = screen.getByLabelText(/Strict Scoped Registry Binding/i);
    fireEvent.click(lockCheckbox);

    const runBtn = screen.getAllByText(/Run Build Pipeline/i)[0];
    fireEvent.click(runBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/Pipeline intact. Zero token exfiltration./i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
