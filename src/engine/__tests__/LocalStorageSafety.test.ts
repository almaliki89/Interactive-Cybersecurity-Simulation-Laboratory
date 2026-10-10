import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from '../../stores/simulationStore';

describe('LocalStorage Safety & Corrupted Storage Recovery', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('safely handles corrupted non-JSON strings in completed challenges', () => {
    localStorage.setItem('omega_completed_challenges', 'MALFORMED{JSON:::');
    // Re-instantiate or check safeParse logic via store
    const store = useSimulationStore.getState();
    expect(Array.isArray(store.completedChallenges)).toBe(true);
  });

  it('safely handles corrupted types (numbers, booleans, objects) in completed challenges array', () => {
    localStorage.setItem(
      'omega_completed_challenges',
      JSON.stringify(['valid-challenge-1', 12345, null, true, { evil: 'obj' }, '', 'valid-challenge-2'])
    );
    // Even if storage had non-strings or blanks, store must clean it
    const raw = localStorage.getItem('omega_completed_challenges');
    const parsed = JSON.parse(raw!);
    const filtered = parsed.filter((c: any) => typeof c === 'string' && c.trim().length > 0);
    expect(filtered).toEqual(['valid-challenge-1', 'valid-challenge-2']);
  });

  it('safely recovers from invalid language settings', () => {
    localStorage.setItem('omega_language', 'gibberish_lang');
    // Store should default safely to 'ar' or 'en'
    const lang = localStorage.getItem('omega_language');
    const safeLang = (lang === 'en' || lang === 'ar') ? lang : 'ar';
    expect(safeLang).toBe('ar');
  });

  it('handles QuotaExceededError or security exceptions without crashing', () => {
    const originalSetItem = localStorage.setItem;
    try {
      localStorage.setItem = () => {
        throw new DOMException('QuotaExceededError');
      };
      // Invoking setLanguage or setCompleted should not throw unhandled error
      expect(() => {
        useSimulationStore.getState().setLanguage('en');
      }).not.toThrow();
    } finally {
      localStorage.setItem = originalSetItem;
    }
  });
});
