import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AiSecurityLab } from '../AiSecurityLab';

describe('AiSecurityLab', () => {
  it('renders the AI Security & LLM Red Teaming lab header and default vector', () => {
    render(<AiSecurityLab language="en" />);
    expect(screen.getAllByText(/AI & LLM Security Red Teaming Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Adversarial Attack Vectors/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Indirect Prompt Injection via RAG Document/i)[0]).toBeDefined();
  });

  it('renders Arabic interface correctly when language prop is ar', () => {
    render(<AiSecurityLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان الذكاء الاصطناعي وهندسة الأوامر/i)[0]).toBeDefined();
    expect(screen.getAllByText(/سلسلة المتجهات والمخاطر/i)[0]).toBeDefined();
  });

  it('executes red team payload and detects unmitigated prompt injection', async () => {
    render(<AiSecurityLab language="en" />);
    const executeBtn = screen.getAllByText(/Execute Red Team Payload/i)[0];
    fireEvent.click(executeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/CRITICAL VULNERABILITY - EXPLOITED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('intercepts prompt injection when guardrails are enabled', async () => {
    render(<AiSecurityLab language="en" />);
    const sanitizerCheckbox = screen.getByLabelText(/Input Sanitizer & Delimiter Boundaries/i);
    fireEvent.click(sanitizerCheckbox);

    const executeBtn = screen.getAllByText(/Execute Red Team Payload/i)[0];
    fireEvent.click(executeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/DEFENSE SUCCESSFUL - ATTACK BLOCKED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
