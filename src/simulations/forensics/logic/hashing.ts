/**
 * OMEGA V18 — Pure Cryptographic SHA-256 & Unambiguous Serialization Engine
 * Provides 100% FIPS 180-4 compliant standard SHA-256 hashing over tagged canonical data.
 * Browser-safe and self-contained with no Node module dependencies.
 */

import { sha256 } from 'js-sha256';
import { ForensicEvidence } from './evidence';

/**
 * Recursively serializes any input value into an unambiguous, tagged, key-sorted JSON representation.
 * Guarantees zero type or marker collision between string literals, null, undefined, NaN, and Infinity.
 */
export function canonicalSerialize(val: unknown): string {
  if (val === null) return '{"$t":"null"}';
  if (val === undefined) return '{"$t":"undefined"}';
  if (typeof val === 'number') {
    if (Number.isNaN(val)) return '{"$t":"NaN"}';
    if (val === Infinity) return '{"$t":"+Inf"}';
    if (val === -Infinity) return '{"$t":"-Inf"}';
    return `{"$t":"num","v":${String(val)}}`;
  }
  if (typeof val === 'boolean') {
    return `{"$t":"bool","v":${val}}`;
  }
  if (typeof val === 'string') {
    return `{"$t":"str","v":${JSON.stringify(val)}}`;
  }
  if (Array.isArray(val)) {
    return `{"$t":"arr","v":[${val.map((item) => canonicalSerialize(item)).join(',')}]}`;
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val as Record<string, unknown>).sort();
    const entries = keys.map(
      (key) => `${JSON.stringify(key)}:${canonicalSerialize((val as Record<string, unknown>)[key])}`
    );
    return `{"$t":"obj","v":{${entries.join(',')}}}`;
  }
  return `{"$t":"str","v":${JSON.stringify(String(val))}}`;
}

/**
 * Standard FIPS 180-4 compliant SHA-256 implementation.
 * Pure, self-contained, and browser-safe via js-sha256. Evaluates exact 256-bit hashes synchronously.
 */
export function sha256Bytes(bytes: Uint8Array): string {
  return sha256(bytes);
}

/**
 * Calculates a genuine standard SHA-256 hash string prefixed with sha256: for any input using tagged canonical serialization
 */
export function calculateEvidenceHash(input: unknown): string {
  const serialized = canonicalSerialize(input);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(serialized);
  const hex = sha256Bytes(bytes);
  return `sha256:${hex}`;
}

/**
 * Verifies evidence hash integrity and returns updated evidence object.
 * Strictly calculates SHA-256 hash over metadata or content, preventing missing metadata bypasses.
 */
export function verifyEvidenceIntegrity(evidence: ForensicEvidence): ForensicEvidence {
  const ev = evidence as Record<string, any>;
  const dataToHash =
    ev.metadata && typeof ev.metadata === 'object' && Object.keys(ev.metadata).length > 0
      ? ev.metadata
      : { content: ev.content || ev.title || '', notes: ev.notes || '' };

  const computedHash = calculateEvidenceHash(dataToHash);

  const isMatch =
    evidence.originalHash === evidence.currentHash &&
    evidence.currentHash === computedHash;

  return {
    ...evidence,
    integrityStatus: isMatch ? 'VERIFIED' : 'MISMATCH',
  };
}

/**
 * Validates cryptographic proof and provenance of a forensic evidence artifact.
 * Strictly calculates SHA-256 hash over metadata or content, preventing missing metadata bypasses.
 */
export function validateEvidenceCryptoProof(evidence: ForensicEvidence): {
  isValid: boolean;
  computedHash: string;
  isTampered: boolean;
  reasonEn: string;
  reasonAr: string;
} {
  const ev = evidence as Record<string, any>;
  const dataToHash =
    ev.metadata && typeof ev.metadata === 'object' && Object.keys(ev.metadata).length > 0
      ? ev.metadata
      : { content: ev.content || ev.title || '', notes: ev.notes || '' };

  const computedHash = calculateEvidenceHash(dataToHash);
  const hashMatches = evidence.originalHash === evidence.currentHash;
  const contentMatches = evidence.currentHash === computedHash;

  if (!hashMatches) {
    return {
      isValid: false,
      computedHash,
      isTampered: true,
      reasonEn: `Hash mismatch: Original (${evidence.originalHash}) does not equal Current (${evidence.currentHash}).`,
      reasonAr: `عدم تطابق في التجزئة: التجزئة الأصلية لا تطابق التجزئة الحالية.`,
    };
  }

  if (!contentMatches) {
    return {
      isValid: false,
      computedHash,
      isTampered: true,
      reasonEn: `Metadata tampering detected: Stored hash does not match newly computed SHA-256 hash (${computedHash}).`,
      reasonAr: `تم اكتشاف تلاعب في البيانات الوصفية: التجزئة المخزنة لا تطابق ناتج حساب SHA-256 الفعلي.`,
    };
  }

  return {
    isValid: true,
    computedHash,
    isTampered: false,
    reasonEn: 'Real Cryptographic SHA-256 integrity verified against source telemetry.',
    reasonAr: 'تم التحقق من سلامة التجزئة التشفيرية الحقيقية SHA-256 ومطابقتها لمصدر السجلات.',
  };
}
