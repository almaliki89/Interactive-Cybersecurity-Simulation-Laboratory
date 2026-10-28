import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { GnssSpoofingLab } from '../GnssSpoofingLab';

describe('GnssSpoofingLab', () => {
  it('renders GNSS Satellite Navigation Spoofing header and default scenario', () => {
    render(<GnssSpoofingLab language="en" />);
    expect(screen.getAllByText(/GNSS Satellite Navigation Spoofing & Electronic Warfare Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Civil Aviation GPS L1 C\/A Flight Path Spoofing/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<GnssSpoofingLab language="ar" />);
    expect(screen.getAllByText(/مختبر تزييف الملاحة الفضائية وحرب الترددات اللاسلكية/i)[0]).toBeDefined();
  });

  it('broadcasts spoofed carrier and reports tactical compromise when unshielded', async () => {
    render(<GnssSpoofingLab language="en" />);
    const broadcastBtn = screen.getAllByText(/Broadcast Counterfeit GNSS Carrier/i)[0];
    fireEvent.click(broadcastBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/TACTICAL NAVIGATION COMPROMISE/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('neutralizes spoofing strike when CRPA null-steering defense is enabled', async () => {
    render(<GnssSpoofingLab language="en" />);
    const crpaCheckbox = screen.getByLabelText(/Controlled Reception Pattern Antennas/i);
    fireEvent.click(crpaCheckbox);

    const broadcastBtn = screen.getAllByText(/Broadcast Counterfeit GNSS Carrier/i)[0];
    fireEvent.click(broadcastBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/NAVIGATION INTEGRITY PRESERVED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
