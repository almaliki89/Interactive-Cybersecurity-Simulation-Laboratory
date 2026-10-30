import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { NationalCyberRangeLab } from '../NationalCyberRangeLab';

describe('NationalCyberRangeLab', () => {
  it('renders National Cyber Range header and default scenario', () => {
    render(<NationalCyberRangeLab language="en" />);
    expect(screen.getAllByText(/National Strategic Cyber Range & Critical Infrastructure War Room/i)[0]).toBeDefined();
    expect(screen.getAllByText(/National Power Grid Cascading Blackout/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<NationalCyberRangeLab language="ar" />);
    expect(screen.getAllByText(/الميدان السيبراني الوطني الشامل وغرفة العمليات/i)[0]).toBeDefined();
  });

  it('triggers national cyber strike and reports cascading blackout when undefended', async () => {
    render(<NationalCyberRangeLab language="en" />);
    const strikeBtn = screen.getAllByText(/Execute Cyber Strike/i)[0];
    fireEvent.click(strikeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL NATIONAL CRISIS/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('contains cyber threat when micro-grid islanding defense is activated', async () => {
    render(<NationalCyberRangeLab language="en" />);
    const islandCheckbox = screen.getByLabelText(/Substation Islanding & Micro-Grid Airgap/i);
    fireEvent.click(islandCheckbox);

    const strikeBtn = screen.getAllByText(/Execute Cyber Strike/i)[0];
    fireEvent.click(strikeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/STRATEGIC CYBER THREAT CONTAINED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
