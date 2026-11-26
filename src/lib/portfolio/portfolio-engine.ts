import { isCourseId, type CourseId } from '@/lib/courses/ids';

export type PortfolioProject = {
  id: string;
  title: string;
  stack: string;
  summary: string;
  url: string;
};

export type PortfolioDraft = {
  fullName: string;
  headline: string;
  city: string;
  bio: string;
  githubUrl: string;
  telegramHandle: string;
  projects: PortfolioProject[];
};

export type SharedPortfolioCourse = {
  id: CourseId;
  percent: number;
  daysDone: number;
  totalDays: number;
};

export type SharedPortfolioPayload = {
  v: 1;
  fullName: string;
  headline: string;
  city: string;
  bio: string;
  githubUrl: string;
  telegramHandle: string;
  totalHours: number;
  streak: number;
  activeDays: number;
  courses: SharedPortfolioCourse[];
  projects: Omit<PortfolioProject, 'id'>[];
};

const STORAGE_PREFIX = 'devatlas-portfolio-v1:';

export function sanitizeExternalUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString().slice(0, 200);
  } catch {
    return '';
  }
}

export function sanitizeTelegramHandle(raw: string): string {
  const cleaned = raw.trim().replace(/^@+/, '').replace(/[^a-zA-Z0-9_]/g, '');
  return cleaned.slice(0, 32);
}

export function defaultPortfolioDraft(fallbackName: string): PortfolioDraft {
  return {
    fullName: fallbackName || 'DevAtlas Developer',
    headline: 'Junior Full-Stack Developer',
    city: 'Dushanbe',
    bio: '',
    githubUrl: '',
    telegramHandle: '',
    projects: [],
  };
}

export function loadPortfolioDraft(accountKey: string, fallbackName: string): PortfolioDraft {
  if (typeof window === 'undefined') return defaultPortfolioDraft(fallbackName);
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + accountKey);
    if (!raw) return defaultPortfolioDraft(fallbackName);
    const parsed = JSON.parse(raw) as Partial<PortfolioDraft>;
    const projects: PortfolioProject[] = Array.isArray(parsed.projects)
      ? parsed.projects
          .filter((item): item is PortfolioProject => Boolean(item && typeof item.title === 'string'))
          .slice(0, 6)
          .map((item, idx) => ({
            id: typeof item.id === 'string' && item.id ? item.id : `proj-${idx}`,
            title: String(item.title).slice(0, 80),
            stack: String(item.stack ?? '').slice(0, 100),
            summary: String(item.summary ?? '').slice(0, 240),
            url: String(item.url ?? '').slice(0, 200),
          }))
      : [];
    return {
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName.slice(0, 80) : fallbackName,
      headline:
        typeof parsed.headline === 'string' ? parsed.headline.slice(0, 100) : 'Junior Developer',
      city: typeof parsed.city === 'string' ? parsed.city.slice(0, 60) : '',
      bio: typeof parsed.bio === 'string' ? parsed.bio.slice(0, 360) : '',
      githubUrl: typeof parsed.githubUrl === 'string' ? parsed.githubUrl.slice(0, 180) : '',
      telegramHandle:
        typeof parsed.telegramHandle === 'string' ? parsed.telegramHandle.slice(0, 40) : '',
      projects,
    };
  } catch {
    return defaultPortfolioDraft(fallbackName);
  }
}

export function savePortfolioDraft(accountKey: string, draft: PortfolioDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + accountKey, JSON.stringify(draft));
  } catch {
    // Ignore storage quota errors.
  }
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

export function encodePortfolioToken(payload: Omit<SharedPortfolioPayload, 'v'>): string {
  const clean: SharedPortfolioPayload = {
    v: 1,
    fullName: payload.fullName.trim().slice(0, 80) || 'DevAtlas Developer',
    headline: payload.headline.trim().slice(0, 100),
    city: payload.city.trim().slice(0, 60),
    bio: payload.bio.trim().slice(0, 360),
    githubUrl: sanitizeExternalUrl(payload.githubUrl),
    telegramHandle: sanitizeTelegramHandle(payload.telegramHandle),
    totalHours: Math.max(0, Math.round(payload.totalHours * 10) / 10),
    streak: Math.max(0, Math.round(payload.streak)),
    activeDays: Math.max(0, Math.round(payload.activeDays)),
    courses: payload.courses.slice(0, 12).map((c) => ({
      id: c.id,
      percent: Math.min(100, Math.max(0, Math.round(c.percent))),
      daysDone: Math.max(0, Math.round(c.daysDone)),
      totalDays: Math.max(1, Math.round(c.totalDays)),
    })),
    projects: payload.projects.slice(0, 6).map((p) => ({
      title: p.title.trim().slice(0, 80),
      stack: p.stack.trim().slice(0, 100),
      summary: p.summary.trim().slice(0, 240),
      url: sanitizeExternalUrl(p.url),
    })),
  };
  return toBase64Url(JSON.stringify(clean));
}

export function decodePortfolioToken(token: string): SharedPortfolioPayload | null {
  if (!token || token.length > 5000) return null;
  const raw = fromBase64Url(token);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SharedPortfolioPayload>;
    if (parsed.v !== 1 || typeof parsed.fullName !== 'string') return null;
    const courses: SharedPortfolioCourse[] = Array.isArray(parsed.courses)
      ? parsed.courses
          .filter((item): item is SharedPortfolioCourse => Boolean(item && isCourseId(item.id)))
          .slice(0, 12)
          .map((item) => ({
            id: item.id,
            percent: Math.min(100, Math.max(0, Number(item.percent) || 0)),
            daysDone: Math.max(0, Number(item.daysDone) || 0),
            totalDays: Math.max(1, Number(item.totalDays) || 1),
          }))
      : [];
    const projects: Omit<PortfolioProject, 'id'>[] = Array.isArray(parsed.projects)
      ? parsed.projects
          .filter((item) => item && typeof item.title === 'string' && item.title.trim())
          .slice(0, 6)
          .map((item) => ({
            title: String(item.title).slice(0, 80),
            stack: String(item.stack ?? '').slice(0, 100),
            summary: String(item.summary ?? '').slice(0, 240),
            url: sanitizeExternalUrl(String(item.url ?? '')),
          }))
      : [];
    return {
      v: 1,
      fullName: parsed.fullName.slice(0, 80),
      headline: typeof parsed.headline === 'string' ? parsed.headline.slice(0, 100) : '',
      city: typeof parsed.city === 'string' ? parsed.city.slice(0, 60) : '',
      bio: typeof parsed.bio === 'string' ? parsed.bio.slice(0, 360) : '',
      githubUrl: sanitizeExternalUrl(typeof parsed.githubUrl === 'string' ? parsed.githubUrl : ''),
      telegramHandle: sanitizeTelegramHandle(
        typeof parsed.telegramHandle === 'string' ? parsed.telegramHandle : '',
      ),
      totalHours: Math.max(0, Number(parsed.totalHours) || 0),
      streak: Math.max(0, Number(parsed.streak) || 0),
      activeDays: Math.max(0, Number(parsed.activeDays) || 0),
      courses,
      projects,
    };
  } catch {
    return null;
  }
}
