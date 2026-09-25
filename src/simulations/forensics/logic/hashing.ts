/**
 * OMEGA V12 — Deterministic Synthetic Hashing & Integrity Verification Engine
 * Calculates deterministic FNV1a-based SHA-256 style synthetic hashes.
 * Fully deterministic - no Date.now, Math.random, or external crypto libs.
 */

import { ForensicEvidence } from './evidence';

/**
 * Calculates a deterministic synthetic hash string for any input
 */
export function calculateEvidenceHash(input: unknown): string {
  const serialized = typeof input === 'string' ? input : JSON.stringify(input);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;

  for (let i = 0; i < serialized.length; i++) {
    const ch = serialized.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 16777619);
    h2 ^= ch;
    h2 = Math.imul(h2, 3100319);
  }

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');

  return `sha256:${part1}${part2}${part3}${part4}`;
}

/**
 * Verifies evidence hash integrity and returns updated evidence object
 */
export function verifyEvidenceIntegrity(evidence: ForensicEvidence): ForensicEvidence {
  const isMatch = evidence.originalHash === evidence.currentHash;
  return {
    ...evidence,
    integrityStatus: isMatch ? 'VERIFIED' : 'MISMATCH',
  };
}
