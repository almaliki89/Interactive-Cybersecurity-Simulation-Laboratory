/**
 * OMEGA V17 — Real Cryptographic SHA-256 & Integrity Verification Engine
 * Provides 100% FIPS 180-4 compliant standard SHA-256 hashing over canonicalized data.
 * Fully deterministic - no Date.now, Math.random, or external network calls.
 */

import { createHash } from 'node:crypto';
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
 * Pure, self-contained, and browser-safe. Evaluates exact cryptographic 256-bit hashes synchronously.
 */
export function sha256Bytes(bytes: Uint8Array): string {
  try {
    if (typeof createHash === 'function') {
      return createHash('sha256').update(bytes).digest('hex');
    }
  } catch {
    // Browser fallback
  }
  return pureJsSha256(bytes);
}

function pureJsSha256(bytes: Uint8Array): string {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

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

  const len = bytes.length;
  const blocks: number[] = [];
  for (let i = 0; i < len; i++) {
    blocks[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }
  blocks[len >> 2] |= 0x80 << (24 - (len % 4) * 8);

  const totalLenBits = len * 8;
  const blockLen = (((len + 8) >> 6) + 1) * 16;
  while (blocks.length < blockLen) {
    blocks.push(0);
  }
  blocks[blockLen - 1] = totalLenBits & 0xffffffff;
  blocks[blockLen - 2] = Math.floor(totalLenBits / 0x100000000);

  const w = new Uint32Array(64);

  for (let i = 0; i < blocks.length; i += 16) {
    for (let t = 0; t < 16; t++) {
      w[t] = blocks[i + t] >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const gamma0 =
        (((w[t - 15] >>> 7) | (w[t - 15] << 25)) >>> 0) ^
        (((w[t - 15] >>> 18) | (w[t - 15] << 14)) >>> 0) ^
        (w[t - 15] >>> 3);
      const gamma1 =
        (((w[t - 2] >>> 17) | (w[t - 2] << 15)) >>> 0) ^
        (((w[t - 2] >>> 19) | (w[t - 2] << 13)) >>> 0) ^
        (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + gamma0 + w[t - 7] + gamma1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const sigma1 =
        (((e >>> 6) | (e << 26)) >>> 0) ^
        (((e >>> 11) | (e << 21)) >>> 0) ^
        (((e >>> 25) | (e << 7)) >>> 0);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + sigma1 + ch + K[t] + w[t]) >>> 0;

      const sigma0 =
        (((a >>> 2) | (a << 30)) >>> 0) ^
        (((a >>> 13) | (a << 19)) >>> 0) ^
        (((a >>> 22) | (a << 10)) >>> 0);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sigma0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return `${hex(h0)}${hex(h1)}${hex(h2)}${hex(h3)}${hex(h4)}${hex(h5)}${hex(h6)}${hex(h7)}`;
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
