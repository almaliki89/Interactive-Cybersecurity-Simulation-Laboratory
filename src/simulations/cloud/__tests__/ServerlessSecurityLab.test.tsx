import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ServerlessSecurityLab } from '../ServerlessSecurityLab';

describe('ServerlessSecurityLab', () => {
  it('renders Serverless & Lambda Security header and scenarios', () => {
    render(<ServerlessSecurityLab language="en" />);
    expect(screen.getAllByText(/Serverless Function & MicroVM Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/S3 Event Data Command Injection/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is set to ar', () => {
    render(<ServerlessSecurityLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان الحوسبة بدون خادم والدوال السحابية/i)[0]).toBeDefined();
  });

  it('reports microVM breached when event input sanitization is disabled', async () => {
    render(<ServerlessSecurityLab language="en" />);
    const invokeBtn = screen.getAllByText(/Invoke Lambda Function/i)[0];
    fireEvent.click(invokeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/MICROVM EXPLOITED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('protects Lambda function when event sanitization is enabled', async () => {
    render(<ServerlessSecurityLab language="en" />);
    const sanitizeCheckbox = screen.getByLabelText(/Event Sanitization & Safe execFile API/i);
    fireEvent.click(sanitizeCheckbox);

    const invokeBtn = screen.getAllByText(/Invoke Lambda Function/i)[0];
    fireEvent.click(invokeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/LAMBDA EXECUTION HARDENED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
