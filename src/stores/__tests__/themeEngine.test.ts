// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore, safeParseTheme } from '../simulationStore';

describe('Theme Engine & Persistence Suite (ZORG)', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    useSimulationStore.setState({
      theme: 'modern',
    });
  });

  it('safeParseTheme validates allowable themes and falls back to modern', () => {
    expect(safeParseTheme('dark')).toBe('dark');
    expect(safeParseTheme('light')).toBe('light');
    expect(safeParseTheme('modern')).toBe('modern');
    expect(safeParseTheme('unknown_theme')).toBe('modern');
    expect(safeParseTheme(null)).toBe('modern');
    expect(safeParseTheme('')).toBe('modern');
  });

  it('setTheme updates store and persists to localStorage', () => {
    useSimulationStore.getState().setTheme('light');
    expect(useSimulationStore.getState().theme).toBe('light');
    expect(localStorage.getItem('omega_theme')).toBe('light');

    useSimulationStore.getState().setTheme('dark');
    expect(useSimulationStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('omega_theme')).toBe('dark');
  });

  it('reloadFromStorage restores persisted theme accurately', () => {
    localStorage.setItem('omega_theme', 'light');
    useSimulationStore.getState().reloadFromStorage();
    expect(useSimulationStore.getState().theme).toBe('light');
  });
});
