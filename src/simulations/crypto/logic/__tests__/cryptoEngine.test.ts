import { describe, it, expect } from 'vitest';
import { simulateBlockCipher, simulateDiffieHellman, modularExp } from '../cryptoEngine';

describe('Next-Gen Cryptography Engine', () => {
  it('computes modular exponentiation correctly', () => {
    // 5^3 mod 13 = 125 mod 13 = 8
    expect(modularExp(5, 3, 13)).toBe(8);
    // 7^4 mod 11 = 2401 mod 11 = 3
    expect(modularExp(7, 4, 11)).toBe(3);
  });

  it('demonstrates ECB pattern leakage on repetitive plaintext', () => {
    // Repetitive 8-byte blocks: "AAAAAAAA" repeated
    const repetitiveText = 'AAAAAAAAAAAAAAAABBBBBBBB';
    const ecbResult = simulateBlockCipher(repetitiveText, 'ECB');

    expect(ecbResult.mode).toBe('ECB');
    expect(ecbResult.patternLeakageDetected).toBe(true);
    // Block 0 and Block 1 are identical plaintext, so their ciphertexts must be identical in ECB
    expect(ecbResult.blocks[0].ciphertextHex).toBe(ecbResult.blocks[1].ciphertextHex);
  });

  it('proves CBC mode diffuses identical plaintext blocks with IV chaining', () => {
    const repetitiveText = 'AAAAAAAAAAAAAAAABBBBBBBB';
    const cbcResult = simulateBlockCipher(repetitiveText, 'CBC');

    expect(cbcResult.mode).toBe('CBC');
    expect(cbcResult.patternLeakageDetected).toBe(false);
    // In CBC mode, Block 0 and Block 1 must have DIFFERENT ciphertexts despite identical plaintexts!
    expect(cbcResult.blocks[0].ciphertextHex).not.toBe(cbcResult.blocks[1].ciphertextHex);
    expect(cbcResult.entropyScore).toBeGreaterThan(90);
  });

  it('simulates authentic Diffie-Hellman key exchange matching shared secrets', () => {
    const dh = simulateDiffieHellman(6, 15, 23, 5, false);

    expect(dh.mitmActive).toBe(false);
    expect(dh.isSharedSecretMatching).toBe(true);
    expect(dh.aliceSharedSecret).toBe(dh.bobSharedSecret);
  });

  it('simulates Man-in-the-Middle key substitution splitting Alice and Bob secrets', () => {
    const dh = simulateDiffieHellman(6, 15, 23, 5, true, 9);

    expect(dh.mitmActive).toBe(true);
    expect(dh.isSharedSecretMatching).toBe(false);
    // Mallory knows the shared secret with Alice and Bob separately
    expect(dh.aliceSharedSecret).toBe(dh.malloryAliceSecret);
    expect(dh.bobSharedSecret).toBe(dh.malloryBobSecret);
    expect(dh.aliceSharedSecret).not.toBe(dh.bobSharedSecret);
  });
});
