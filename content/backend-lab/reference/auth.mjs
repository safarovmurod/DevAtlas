import {randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt = promisify(scryptCallback);
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password) > 256) throw new TypeError('Use 12+ characters and at most 256 UTF-8 bytes');
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || Buffer.byteLength(password) > 256 || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored)) return false;
  const [salt, hex] = stored.split(':');
  const expected = Buffer.from(hex, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}
const digest = token => createHash('sha256').update(token).digest('hex');
export function sessions({now = Date.now, ttl = 1800000, max = 1000} = {}) {
  const records = new Map();
  function clean() { for (const [id, row] of records) if (row.expires <= now()) records.delete(id); }
  return {
    create(userId) {
      clean(); if (records.size >= max) throw Object.assign(new Error('Session capacity'), {status: 503});
      const token = randomBytes(32).toString('hex');
      records.set(digest(token), {userId,expires: now() + ttl});
      return token;
    },
    read(token) { clean(); return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token) ? records.get(digest(token))?.userId : undefined; },
    delete(token) { if (typeof token === 'string') records.delete(digest(token)); },
    // This intentionally uses process memory: restart logs everyone out.
  };
}
export function loginLimiter({now = Date.now, windowMs = 60000, limit = 5, maxKeys = 1000} = {}) {
  const entries = new Map();
  return key => {
    const time = now();
    for (const [id, row] of entries) if (row.until <= time) entries.delete(id);
    let row = entries.get(key);
    if (!row) {
      if (entries.size >= maxKeys) return false;
      row = {count: 0, until: time + windowMs};entries.set(key,row);
    }
    return ++row.count <= limit;
  };
}
