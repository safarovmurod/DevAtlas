import { coursePublishedDays } from '@/content/courses/catalog';
import { isCourseId, type CourseId } from '@/lib/courses/ids';
import type { ProgressSource } from '@/lib/progress/weekly-report';

export type CertificateStatus = 'earned' | 'in_progress';

export type CertificateRecord = {
  courseId: CourseId;
  daysDone: number;
  totalDays: number;
  percent: number;
  hoursStudied: number;
  status: CertificateStatus;
  certificateId: string;
  issuedOn: string;
};

export type CertificatePayload = {
  v: 1;
  id: string;
  holder: string;
  courseId: CourseId;
  daysDone: number;
  totalDays: number;
  hours: number;
  issuedOn: string;
  sig: string;
};

const SIG_SALT = 'devatlas-cert-v1';

function hashPair(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

function canonicalSignature(fields: Omit<CertificatePayload, 'sig'>): string {
  const raw = [
    SIG_SALT,
    fields.v,
    fields.id,
    fields.holder.trim(),
    fields.courseId,
    fields.daysDone,
    fields.totalDays,
    fields.hours,
    fields.issuedOn,
  ].join('|');
  return hashPair(raw).slice(0, 12).toUpperCase();
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(token: string): string | null {
  try {
    const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const binary = atob(normalized + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function buildCertificateId(courseId: CourseId, holderSeed: string, issuedOn: string): string {
  const shortCourse = courseId.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase();
  const year = issuedOn.slice(0, 4) || '2026';
  const digest = hashPair(`${courseId}|${holderSeed}|${issuedOn}`).slice(0, 6).toUpperCase();
  return `DA-${shortCourse}-${year}-${digest}`;
}

export function encodeCertificateToken(params: {
  id: string;
  holder: string;
  courseId: CourseId;
  daysDone: number;
  totalDays: number;
  hours: number;
  issuedOn: string;
}): string {
  const base: Omit<CertificatePayload, 'sig'> = {
    v: 1,
    id: params.id.trim().slice(0, 40),
    holder: params.holder.trim().slice(0, 80) || 'DevAtlas Learner',
    courseId: params.courseId,
    daysDone: Math.max(0, Math.round(params.daysDone)),
    totalDays: Math.max(1, Math.round(params.totalDays)),
    hours: Math.max(0, Math.round(params.hours * 10) / 10),
    issuedOn: params.issuedOn.slice(0, 10),
  };
  const payload: CertificatePayload = { ...base, sig: canonicalSignature(base) };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeAndVerifyCertificateToken(
  token: string,
): { valid: true; payload: CertificatePayload } | { valid: false; reason: 'malformed' | 'tampered' } {
  if (!token || token.length > 1500) return { valid: false, reason: 'malformed' };
  const raw = fromBase64Url(token);
  if (!raw) return { valid: false, reason: 'malformed' };
  try {
    const parsed = JSON.parse(raw) as Partial<CertificatePayload>;
    if (
      parsed.v !== 1 ||
      typeof parsed.id !== 'string' ||
      typeof parsed.holder !== 'string' ||
      typeof parsed.courseId !== 'string' ||
      !isCourseId(parsed.courseId) ||
      typeof parsed.daysDone !== 'number' ||
      typeof parsed.totalDays !== 'number' ||
      typeof parsed.hours !== 'number' ||
      typeof parsed.issuedOn !== 'string' ||
      typeof parsed.sig !== 'string'
    ) {
      return { valid: false, reason: 'malformed' };
    }
    const expected = canonicalSignature({
      v: 1,
      id: parsed.id,
      holder: parsed.holder,
      courseId: parsed.courseId,
      daysDone: parsed.daysDone,
      totalDays: parsed.totalDays,
      hours: parsed.hours,
      issuedOn: parsed.issuedOn,
    });
    if (expected !== parsed.sig) {
      return { valid: false, reason: 'tampered' };
    }
    return { valid: true, payload: parsed as CertificatePayload };
  } catch {
    return { valid: false, reason: 'malformed' };
  }
}

export function collectCertificates(
  sources: ProgressSource[],
  holderSeed: string,
  today: string,
): CertificateRecord[] {
  const records: CertificateRecord[] = [];
  for (const source of sources) {
    if (!isCourseId(source.id)) continue;
    const totalDays = Math.max(1, source.total || coursePublishedDays(source.id));
    const uniqueConfirmed = new Set(source.confirmedDays).size;
    const seconds = Object.values(source.studySeconds).reduce((acc, value) => acc + value, 0);
    const hasActivity =
      uniqueConfirmed > 0 ||
      source.completedTopics.length > 0 ||
      source.completedPractice.length > 0 ||
      seconds > 0;
    if (!hasActivity) continue;
    const percent = Math.min(100, Math.round((uniqueConfirmed / totalDays) * 100));
    const status: CertificateStatus = uniqueConfirmed >= totalDays ? 'earned' : 'in_progress';
    const studyDays = Object.keys(source.studySeconds).sort();
    const issuedOn = studyDays[studyDays.length - 1] ?? today;
    records.push({
      courseId: source.id,
      daysDone: uniqueConfirmed,
      totalDays,
      percent,
      hoursStudied: Math.round((seconds / 3600) * 10) / 10,
      status,
      certificateId: buildCertificateId(source.id, holderSeed, issuedOn),
      issuedOn,
    });
  }
  return records.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'earned' ? -1 : 1;
    return b.percent - a.percent;
  });
}
