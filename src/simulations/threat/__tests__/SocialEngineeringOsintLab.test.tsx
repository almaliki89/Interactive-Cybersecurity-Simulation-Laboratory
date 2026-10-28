import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SocialEngineeringOsintLab } from '../SocialEngineeringOsintLab';

describe('SocialEngineeringOsintLab', () => {
  it('renders Social Engineering & OSINT header and default scenario', () => {
    render(<SocialEngineeringOsintLab language="en" />);
    expect(screen.getAllByText(/Advanced Social Engineering & OSINT Reconnaissance Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Executive Spear Phishing & BEC Wire Transfer/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is ar', () => {
    render(<SocialEngineeringOsintLab language="ar" />);
    expect(screen.getAllByText(/مختبر الهندسة الاجتماعية وهجمات العامل البشري/i)[0]).toBeDefined();
  });

  it('reports human element compromise when DMARC defense is disabled', async () => {
    render(<SocialEngineeringOsintLab language="en" />);
    const launchBtn = screen.getAllByText(/Launch Scenario/i)[0];
    fireEvent.click(launchBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/HUMAN ELEMENT COMPROMISED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('defends against spear phishing when strict DMARC is enabled', async () => {
    render(<SocialEngineeringOsintLab language="en" />);
    const dmarcCheckbox = screen.getByLabelText(/Strict DMARC \(p=reject\) & Lookalike Filter/i);
    fireEvent.click(dmarcCheckbox);

    const launchBtn = screen.getAllByText(/Launch Scenario/i)[0];
    fireEvent.click(launchBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/SOCIAL ENGINEERING DEFENDED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
