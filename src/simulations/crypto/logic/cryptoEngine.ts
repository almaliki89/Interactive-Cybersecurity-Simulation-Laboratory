/**
 * Next-Gen Cryptography Engine
 * Provides deterministic simulation of:
 * 1. Symmetric Block Cipher Modes: AES ECB vs CBC with visual pattern leakage & bit tampering.
 * 2. Diffie-Hellman Key Exchange & Man-in-the-Middle (MitM) Interception.
 */

export interface BlockCipherResult {
  mode: 'ECB' | 'CBC';
  iv: string;
  blocks: {
    index: number;
    plaintextHex: string;
    plaintextAscii: string;
    ciphertextHex: string;
    isDuplicatePlaintext: boolean;
    isDuplicateCiphertext: boolean;
  }[];
  patternLeakageDetected: boolean;
  entropyScore: number;
}

/**
 * Deterministic toy block cipher simulation for educational demonstration of ECB vs CBC
 * Block size: 8 bytes (64 bits)
 */
function toyEncryptBlock(blockBytes: number[], keyBytes: number[]): number[] {
  const out = new Array(8);
  for (let i = 0; i < 8; i++) {
    const k = keyBytes[i % keyBytes.length];
    const b = blockBytes[i] ^ k;
    out[i] = ((b * 31 + 17) ^ (b >>> 3)) & 0xff;
  }
  return out;
}

export function simulateBlockCipher(
  text: string,
  mode: 'ECB' | 'CBC',
  key = 'NEXORA26',
  ivHex = 'A1B2C3D4E5F60718'
): BlockCipherResult {
  const encoder = new TextEncoder();
  const inputBytes = Array.from(encoder.encode(text));
  const keyBytes = Array.from(encoder.encode(key));

  const padLen = 8 - (inputBytes.length % 8);
  const paddedBytes = [...inputBytes, ...new Array(padLen).fill(padLen)];

  const numBlocks = paddedBytes.length / 8;
  const blocks: BlockCipherResult['blocks'] = [];

  let currentIv: number[] = [];
  for (let i = 0; i < 16; i += 2) {
    currentIv.push(parseInt(ivHex.slice(i, i + 2) || '00', 16));
  }
  if (currentIv.length < 8) currentIv = [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0];

  const seenPlaintextBlocks = new Map<string, number>();
  const seenCiphertextBlocks = new Map<string, number>();

  for (let b = 0; b < numBlocks; b++) {
    const rawBlock = paddedBytes.slice(b * 8, (b + 1) * 8);
    let blockToEncrypt = rawBlock;

    if (mode === 'CBC') {
      blockToEncrypt = rawBlock.map((byte, idx) => byte ^ currentIv[idx]);
    }

    const cipherBlock = toyEncryptBlock(blockToEncrypt, keyBytes);

    if (mode === 'CBC') {
      currentIv = cipherBlock;
    }

    const plainHex = rawBlock.map((x) => x.toString(16).padStart(2, '0')).join('');
    const cipherHex = cipherBlock.map((x) => x.toString(16).padStart(2, '0')).join('');
    const plainAscii = rawBlock.map((x) => (x >= 32 && x <= 126 ? String.fromCharCode(x) : '.')).join('');

    seenPlaintextBlocks.set(plainHex, (seenPlaintextBlocks.get(plainHex) || 0) + 1);
    seenCiphertextBlocks.set(cipherHex, (seenCiphertextBlocks.get(cipherHex) || 0) + 1);

    blocks.push({
      index: b,
      plaintextHex: plainHex,
      plaintextAscii: plainAscii,
      ciphertextHex: cipherHex,
      isDuplicatePlaintext: false,
      isDuplicateCiphertext: false,
    });
  }

  blocks.forEach((blk) => {
    blk.isDuplicatePlaintext = (seenPlaintextBlocks.get(blk.plaintextHex) || 0) > 1;
    blk.isDuplicateCiphertext = (seenCiphertextBlocks.get(blk.ciphertextHex) || 0) > 1;
  });

  const duplicateCipherCount = Array.from(seenCiphertextBlocks.values()).filter((c) => c > 1).length;
  const patternLeakageDetected = mode === 'ECB' && duplicateCipherCount > 0;
  const entropyScore = mode === 'CBC' ? 98 : patternLeakageDetected ? 24 : 75;

  return {
    mode,
    iv: ivHex,
    blocks,
    patternLeakageDetected,
    entropyScore,
  };
}

export interface DiffieHellmanState {
  p: number;
  g: number;
  alicePrivate: number;
  alicePublic: number;
  bobPrivate: number;
  bobPublic: number;
  aliceSharedSecret: number;
  bobSharedSecret: number;
  isSharedSecretMatching: boolean;

  mitmActive: boolean;
  malloryPrivate: number;
  malloryPublic: number;
  malloryAliceSecret: number;
  malloryBobSecret: number;
}

export function modularExp(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

export function simulateDiffieHellman(
  alicePrivate = 6,
  bobPrivate = 15,
  p = 23,
  g = 5,
  mitmActive = false,
  malloryPrivate = 9
): DiffieHellmanState {
  const alicePublic = modularExp(g, alicePrivate, p);
  const bobPublic = modularExp(g, bobPrivate, p);
  const malloryPublic = modularExp(g, malloryPrivate, p);

  if (mitmActive) {
    const aliceSharedSecret = modularExp(malloryPublic, alicePrivate, p);
    const bobSharedSecret = modularExp(malloryPublic, bobPrivate, p);
    const malloryAliceSecret = modularExp(alicePublic, malloryPrivate, p);
    const malloryBobSecret = modularExp(bobPublic, malloryPrivate, p);

    return {
      p,
      g,
      alicePrivate,
      alicePublic,
      bobPrivate,
      bobPublic,
      aliceSharedSecret,
      bobSharedSecret,
      isSharedSecretMatching: false,
      mitmActive: true,
      malloryPrivate,
      malloryPublic,
      malloryAliceSecret,
      malloryBobSecret,
    };
  }

  const aliceSharedSecret = modularExp(bobPublic, alicePrivate, p);
  const bobSharedSecret = modularExp(alicePublic, bobPrivate, p);

  return {
    p,
    g,
    alicePrivate,
    alicePublic,
    bobPrivate,
    bobPublic,
    aliceSharedSecret,
    bobSharedSecret,
    isSharedSecretMatching: aliceSharedSecret === bobSharedSecret,
    mitmActive: false,
    malloryPrivate,
    malloryPublic,
    malloryAliceSecret: 0,
    malloryBobSecret: 0,
  };
}
