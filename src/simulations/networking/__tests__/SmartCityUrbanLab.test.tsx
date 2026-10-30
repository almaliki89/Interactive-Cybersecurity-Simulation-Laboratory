import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SmartCityUrbanLab } from '../SmartCityUrbanLab';

describe('SmartCityUrbanLab', () => {
  it('renders Smart City & Urban Lab header and default streetlight scenario', () => {
    render(<SmartCityUrbanLab language="en" />);
    expect(screen.getAllByText(/Smart City & Urban Infrastructure Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Metropolitan Smart Streetlight Mesh Hijack/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly', () => {
    render(<SmartCityUrbanLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان المدن الذكية والبنية التحتية الحضرية/i)[0]).toBeDefined();
  });

  it('triggers urban attack and reports infrastructure hijack when undefended', async () => {
    render(<SmartCityUrbanLab language="en" />);
    const injectBtn = screen.getAllByText(/Inject Urban Infrastructure Attack/i)[0];
    fireEvent.click(injectBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL URBAN BREACH/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('secures urban services when Zigbee key rotation is enabled', async () => {
    render(<SmartCityUrbanLab language="en" />);
    const rotationCheckbox = screen.getByLabelText(/Zigbee Trust Center Key Rotation/i);
    fireEvent.click(rotationCheckbox);

    const injectBtn = screen.getAllByText(/Inject Urban Infrastructure Attack/i)[0];
    fireEvent.click(injectBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/URBAN SERVICES SECURED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
