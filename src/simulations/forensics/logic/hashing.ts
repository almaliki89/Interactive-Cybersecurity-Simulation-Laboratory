/**
 * OMEGA V17 — Real Cryptographic SHA-256 & Integrity Verification Engine
 * Provides 100% FIPS 180-4 compliant standard SHA-256 hashing over canonicalized data.
 * Fully deterministic - no Date.now, Math.random, or external network calls.
 */

import { createHash } from 'crypto';
import { ForensicEvidence } from './evidence';

/**
 * Recursively serializes any input value into a canonical, key-sorted JSON string representation.
 * Guarantees that key order variations in telemetry objects produce identical serialized output.
 */
export function canonicalSerialize(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return '"__undefined__"';
  if (typeof val === 'number') {
    if (Number.isNaN(val)) return '"__NaN__"';
    if (val === Infinity) return '"__Infinity__"';
    if (val === -Infinity) return '"__-Infinity__"';
    return String(val);
  }
  if (typeof val === 'boolean' || typeof val === 'string') {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return `[${val.map((item) => canonicalSerialize(item)).join(',')}]`;
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val as Record<string, unknown>).sort();
    const entries = keys.map(
      (key) => `${JSON.stringify(key)}:${canonicalSerialize((val as Record<string, unknown>)[key])}`
    );
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(String(val));
}

/**
 * Standard FIPS 180-4 compliant SHA-256 implementation.
 * Evaluates real cryptographic 256-bit hashes synchronously using Node crypto with pure JS fallback.
 */
export function sha256Bytes(bytes: Uint8Array): string {
  try {
    if (typeof createHash === 'function') {
      return createHash('sha256').update(bytes).digest('hex');
    }
  } catch {
    // Fallback to pure JS SHA-256 if node:crypto is unavailable in pure browser context
  }
  return pureJsSha256(bytes);
}

function pureJsSha256(bytes: Uint8Array): string {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef4a3f7, 0xc67178f2,
  ];

  let H0 = 0x6a09e667;
  let H1 = 0xbb67ae85;
  let H2 = 0x3c6ef372;
  let H3 = 0xa54ff53a;
  let H4 = 0x510e527f;
  let H5 = 0x9b05688c;
  let H6 = 0x1f83d9ab;
  let H7 = 0x5be0cd19;

  const len = bytes.length;
  const bitLenHi = Math.floor(len / 0x20000000);
  const bitLenLo = (len * 8) >>> 0;

  const k = (56 - ((len + 1) % 64) + 64) % 64;
  const padded = new Uint8Array(len + 1 + k + 8);
  padded.set(bytes, 0);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  view.setUint32(padded.length - 8, bitLenHi, false);
  view.setUint32(padded.length - 4, bitLenLo, false);

  const W = new Uint32Array(64);

  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = (rightRotate(W[t - 15], 7) ^ rightRotate(W[t - 15], 18) ^ (W[t - 15] >>> 3)) >>> 0;
      const s1 = (rightRotate(W[t - 2], 17) ^ rightRotate(W[t - 2], 19) ^ (W[t - 2] >>> 10)) >>> 0;
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }

    let a = H0;
    let b = H1;
    let c = H2;
    let d = H3;
    let e = H4;
    let f = H5;
    let g = H6;
    let h = H7;

    for (let t = 0; t < 64; t++) {
      const S1 = (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H0 = (H0 + a) >>> 0;
    H1 = (H1 + b) >>> 0;
    H2 = (H2 + c) >>> 0;
    H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0;
    H5 = (H5 + f) >>> 0;
    H6 = (H6 + g) >>> 0;
    H7 = (H7 + h) >>> 0;
  }

  return (
    H0.toString(16).padStart(8, '0') +
    H1.toString(16).padStart(8, '0') +
    H2.toString(16).padStart(8, '0') +
    H3.toString(16).padStart(8, '0') +
    H4.toString(16).padStart(8, '0') +
    H5.toString(16).padStart(8, '0') +
    H6.toString(16).padStart(8, '0') +
    H7.toString(16).padStart(8, '0')
  );
}

function rightRotate(value: number, amount: number): number {
  const v = value >>> 0;
  const n = amount;
  return ((v >>> n) | ((v & ((1 << n) - 1)) * (2 ** (32 - n)))) >>> 0;
}

/**
 * Calculates a genuine standard SHA-256 hash string prefixed with sha256: for any input using canonical serialization
 */
export function calculateEvidenceHash(input: unknown): string {
  const serialized = typeof input === 'string' ? input : canonicalSerialize(input);
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
