import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Threat3DMatrixStage } from '../Threat3DMatrixStage';
import { useThreatHuntingStore } from '../../runtime/threatHuntingStore';
import { useSimulationStore } from '../../../../stores/simulationStore';

describe('Threat3DMatrixStage Component Suite', () => {
  beforeEach(() => {
    useSimulationStore.setState({ language: 'en' });
    useThreatHuntingStore.setState({ activeTab: 'MATRIX_3D' });
  });

  it('renders 3D Threat Hunting Attack Graph banner and canvas container', () => {
    render(<Threat3DMatrixStage />);

    const title = screen.getByText(/3D Threat Hunting Attack Graph/i);
    expect(title).toBeDefined();

    const badge = screen.getByText(/KILL_CHAIN_ACTIVE/i);
    expect(badge).toBeDefined();
  });

  it('renders 3D camera controls and preset buttons', () => {
    render(<Threat3DMatrixStage />);

    const fullChainBtn = screen.getByRole('button', { name: /Full Chain/i });
    expect(fullChainBtn).toBeDefined();

    const c2NodeBtn = screen.getByRole('button', { name: /C2 Node/i });
    expect(c2NodeBtn).toBeDefined();

    const footholdBtn = screen.getByRole('button', { name: /Foothold/i });
    expect(footholdBtn).toBeDefined();
  });
});
