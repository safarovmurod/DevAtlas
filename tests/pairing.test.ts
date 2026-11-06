import { describe, it, expect } from 'vitest';
import {
  generatePairCode,
  hashPairCode,
  validatePairCodeFormat,
} from '@/lib/security/pairing';

describe('Pairing Code Security and Cryptography', () => {
  it('generates a 6-digit random code and matching SHA-256 hash', () => {
    const pepper = 'secret-test-pepper';
    const pair = generatePairCode(pepper);

    expect(pair.code).toMatch(/^\d{6}$/);
    expect(pair.codeHash).toHaveLength(64); // SHA-256 hex length
    expect(hashPairCode(pair.code, pepper)).toBe(pair.codeHash);
  });

  it('sets expiration 10 minutes in the future', () => {
    const pair = generatePairCode();
    const now = Date.now();
    const expiry = pair.expiresAt.getTime();

    const diffMinutes = (expiry - now) / (1000 * 60);
    expect(diffMinutes).toBeGreaterThanOrEqual(9.9);
    expect(diffMinutes).toBeLessThanOrEqual(10.1);
  });

  it('validates 6-digit format with or without spaces', () => {
    expect(validatePairCodeFormat('123456')).toBe(true);
    expect(validatePairCodeFormat('123 456')).toBe(true);
    expect(validatePairCodeFormat('12345')).toBe(false);
    expect(validatePairCodeFormat('abcdef')).toBe(false);
  });
});
