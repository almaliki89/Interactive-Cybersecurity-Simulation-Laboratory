import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useSimulationStore,
  safeParseCompletedChallenges,
  safeParseLanguage,
  getStoredItem,
  setStoredItem,
} from '../../stores/simulationStore';

describe('LocalStorage Safety & Storage Recovery Engine Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    useSimulationStore.getState().reloadFromStorage();
  });

  describe('Pure Function Validation: safeParseCompletedChallenges', () => {
    it('returns empty array when input is null, empty string, or whitespace', () => {
      expect(safeParseCompletedChallenges(null)).toEqual([]);
      expect(safeParseCompletedChallenges('')).toEqual([]);
      expect(safeParseCompletedChallenges('   ')).toEqual([]);
    });

    it('gracefully catches and recovers from malformed non-JSON strings', () => {
      expect(safeParseCompletedChallenges('MALFORMED{JSON:::')).toEqual([]);
      expect(safeParseCompletedChallenges('<xml>invalid</xml>')).toEqual([]);
      expect(safeParseCompletedChallenges('undefined')).toEqual([]);
      expect(safeParseCompletedChallenges('NaN')).toEqual([]);
    });

    it('filters out corrupted elements (numbers, booleans, objects, nulls, empty strings) from valid arrays', () => {
      const corruptedArrayJson = JSON.stringify([
        'challenge-alpha',
        9999,
        null,
        undefined,
        true,
        false,
        { evil: 'injection' },
        [],
        '',
        '   ',
        'challenge-beta',
      ]);
      const result = safeParseCompletedChallenges(corruptedArrayJson);
      expect(result).toEqual(['challenge-alpha', 'challenge-beta']);
    });

    it('recovers legacy object schema with completed array', () => {
      const legacyObject = JSON.stringify({
        completed: ['legacy-1', 123, null, 'legacy-2'],
      });
      const result = safeParseCompletedChallenges(legacyObject);
      expect(result).toEqual(['legacy-1', 'legacy-2']);
    });

    it('recovers legacy object schema with boolean challenge flags', () => {
      const legacyFlags = JSON.stringify({
        'lab-tcp-01': true,
        'lab-dns-02': false,
        'lab-fw-03': true,
        '': true,
      });
      const result = safeParseCompletedChallenges(legacyFlags);
      expect(result).toContain('lab-tcp-01');
      expect(result).toContain('lab-fw-03');
      expect(result).not.toContain('lab-dns-02');
      expect(result).not.toContain('');
    });
  });

  describe('Pure Function Validation: safeParseLanguage', () => {
    it('accepts supported languages "ar" and "en"', () => {
      expect(safeParseLanguage('ar')).toBe('ar');
      expect(safeParseLanguage('en')).toBe('en');
    });

    it('falls back safely to default "ar" when given invalid or corrupted language keys', () => {
      expect(safeParseLanguage('fr')).toBe('ar');
      expect(safeParseLanguage('de')).toBe('ar');
      expect(safeParseLanguage('invalid_lang')).toBe('ar');
      expect(safeParseLanguage('')).toBe('ar');
      expect(safeParseLanguage(null)).toBe('ar');
      expect(safeParseLanguage('{}')).toBe('ar');
    });
  });

  describe('End-to-End Store State Recovery via reloadFromStorage', () => {
    it('initializes store safely when localStorage contains corrupt JSON and invalid language', () => {
      localStorage.setItem('omega_completed_challenges', '{"corrupted": true, broken');
      localStorage.setItem('omega_language', 'unrecognized_locale_xyz');

      // Execute actual application store restoration logic
      useSimulationStore.getState().reloadFromStorage();

      const state = useSimulationStore.getState();
      expect(Array.isArray(state.completedChallenges)).toBe(true);
      expect(state.completedChallenges).toEqual([]);
      expect(state.language).toBe('ar');
    });

    it('correctly loads sanitized challenges into the Zustand store from valid localStorage payloads', () => {
      localStorage.setItem(
        'omega_completed_challenges',
        JSON.stringify(['cia-balance-challenge', 555, 'firewall-rule-mastery', 'unknown-id'])
      );
      localStorage.setItem('omega_language', 'en');

      useSimulationStore.getState().reloadFromStorage();

      const state = useSimulationStore.getState();
      // 'unknown-id' and 555 should be filtered out by the new whitelist logic in reloadFromStorage
      expect(state.completedChallenges).toEqual(['cia-balance-challenge', 'firewall-rule-mastery']);
      expect(state.language).toBe('en');
    });
  });

  describe('Storage Failure & Security Exception Resilience', () => {
    it('handles QuotaExceededError during setLanguage and completeChallenge without crashing the app', () => {
      const originalSetItem = localStorage.setItem;
      try {
        localStorage.setItem = vi.fn().mockImplementation(() => {
          throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
        });

        const store = useSimulationStore.getState();
        // Set correct context for whitelist check and register validator for technical challenge integrity
        store.setActiveSimulation('cia_triad');
        store.registerChallengeValidator('cia-balance-challenge', () => ({ success: true, score: 100 }));

        // setLanguage should update in-memory state and catch storage error
        expect(() => {
          store.setLanguage('en');
        }).not.toThrow();
        expect(useSimulationStore.getState().language).toBe('en');

        // completeChallenge should update in-memory state and catch storage error
        expect(() => {
          store.completeChallenge('cia-balance-challenge', { success: true });
        }).not.toThrow();
        expect(useSimulationStore.getState().completedChallenges).toContain('cia-balance-challenge');
      } finally {
        localStorage.setItem = originalSetItem;
      }
    });

    it('handles SecurityError (e.g. sandboxed iframe or blocked cookies) gracefully on getStoredItem', () => {
      const originalGetItem = localStorage.getItem;
      try {
        localStorage.getItem = vi.fn().mockImplementation(() => {
          throw new DOMException('Storage access denied in sandbox.', 'SecurityError');
        });

        // getStoredItem should return null rather than bubbling error
        expect(getStoredItem('any_key')).toBeNull();

        // reloadFromStorage should fall back cleanly
        expect(() => {
          useSimulationStore.getState().reloadFromStorage();
        }).not.toThrow();
        expect(useSimulationStore.getState().language).toBe('ar');
        expect(useSimulationStore.getState().completedChallenges).toEqual([]);
      } finally {
        localStorage.getItem = originalGetItem;
      }
    });
  });
});
