import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { GraphQLApiLab } from '../GraphQLApiLab';

describe('GraphQLApiLab', () => {
  it('renders the GraphQL & API Security Lab header and query workbench', () => {
    render(<GraphQLApiLab language="en" />);
    expect(screen.getAllByText(/GraphQL & Modern API Security Laboratory/i)[0]).toBeDefined();
    expect(screen.getAllByText(/GraphQL Attack Scenarios/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Deeply Nested Circular Query \(DoS\)/i)[0]).toBeDefined();
  });

  it('renders Arabic UI correctly when language is set to ar', () => {
    render(<GraphQLApiLab language="ar" />);
    expect(screen.getAllByText(/مختبر أمان واستغلال APIs ببروتوكول GraphQL/i)[0]).toBeDefined();
    expect(screen.getAllByText(/سيناريوهات ثغرات GraphQL/i)[0]).toBeDefined();
  });

  it('executes circular query and returns unblocked response by default', async () => {
    render(<GraphQLApiLab language="en" />);
    const executeBtn = screen.getAllByText(/Execute Query/i)[0];
    fireEvent.click(executeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/SUCCESS/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('blocks circular query when depth limit guardrail is enabled', async () => {
    render(<GraphQLApiLab language="en" />);
    const depthCheckbox = screen.getByLabelText(/Query Depth Limiter/i);
    fireEvent.click(depthCheckbox);

    const executeBtn = screen.getAllByText(/Execute Query/i)[0];
    fireEvent.click(executeBtn);

    await waitFor(
      () => {
        expect(screen.getAllByText(/GRAPHQL_MAX_DEPTH_EXCEEDED/i)[0]).toBeDefined();
      },
      { timeout: 2000 }
    );
  });
});
