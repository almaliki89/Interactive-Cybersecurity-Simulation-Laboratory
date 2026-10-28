import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { WebAuthnLab } from '../WebAuthnLab';

describe('WebAuthnLab', () => {
  it('renders FIDO2 & WebAuthn header and authenticator selector', () => {
    render(<WebAuthnLab language="en" />);
    expect(screen.getAllByText(/FIDO2 & WebAuthn Passkeys Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Platform Passkey \(Touch ID \/ Hello\)/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is ar', () => {
    render(<WebAuthnLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان مفاتيح المرور Passkeys وبروتوكول FIDO2 \/ WebAuthn/i)[0]).toBeDefined();
    expect(screen.getAllByText(/1. تسجيل المفتاح/i)[0]).toBeDefined();
  });

  it('completes passkey registration ceremony', async () => {
    render(<WebAuthnLab language="en" />);
    const regBtn = screen.getAllByText(/Generate & Register Passkey/i)[0];
    fireEvent.click(regBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/Credential Registered Successfully on Server/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('verifies WebAuthn origin binding blocks AiTM phishing attacks', async () => {
    render(<WebAuthnLab language="en" />);
    // Switch to Phishing tab
    const phishTab = screen.getAllByText(/3. Phishing Attack/i)[0];
    fireEvent.click(phishTab);

    // Attempt login via phishing link
    const attackBtn = screen.getAllByText(/Attempt Login via Phishing Link/i)[0];
    fireEvent.click(attackBtn);

    expect(screen.getAllByText(/PHISHING DEFENDED SUCCESSFULLY!/i)[0]).toBeDefined();
  });
});
