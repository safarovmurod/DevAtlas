import crypto from 'crypto';

export interface GeneratedPairCode {
  code: string; // 6-digit plain code (displayed only once to user)
  codeHash: string; // SHA-256 hash to store in DB
  expiresAt: Date;
}

/**
 * Generates a cryptographically secure 6-digit pairing code with 10-minute expiry
 */
export function generatePairCode(secretPepper: string = 'react-mentor-pepper'): GeneratedPairCode {
  // Generate random 6-digit number between 100000 and 999999
  const randomNum = crypto.randomInt(100000, 1000000);
  const code = randomNum.toString();

  // Compute SHA-256 hash with pepper
  const codeHash = hashPairCode(code, secretPepper);

  // 10 minutes expiry
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return {
    code,
    codeHash,
    expiresAt,
  };
}

/**
 * Hashes a 6-digit pairing code with SHA-256
 */
export function hashPairCode(code: string, secretPepper: string = 'react-mentor-pepper'): string {
  const cleanCode = code.replace(/\s+/g, '').trim();
  return crypto.createHash('sha256').update(`${cleanCode}:${secretPepper}`).digest('hex');
}

/**
 * Validates pairing code format
 */
export function validatePairCodeFormat(input: string): boolean {
  const clean = input.replace(/\s+/g, '').trim();
  return /^\d{6}$/.test(clean);
}
