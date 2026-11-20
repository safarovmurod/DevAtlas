import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { practicePlanDenial } from '@/lib/practice/plan-access';
import { downloadCourseObject, getCourseRelease } from '@/lib/courses/course-storage';

const headers = { 'Cache-Control': 'private, no-store' };
const practicePolicy =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: https:; connect-src 'none'; base-uri 'none'; form-action 'none'";

export async function GET(request: Request) {
  const denied = await practicePlanDenial(request);
  if (denied) return denied;

  try {
    const release = await getCourseRelease();
    const source = release
      ? new TextDecoder('utf-8', { fatal: true }).decode(await downloadCourseObject(release.reactPractice))
      : await readFile(path.join(process.cwd(), 'content/practice-local-global.html'), 'utf8');
    if (!source.includes('<head>')) throw new Error('Practice document is invalid');
    const html = source.replace(
      '<head>',
      `<head><meta http-equiv="Content-Security-Policy" content="${practicePolicy}">`,
    );
    return Response.json({ html }, { headers });
  } catch {
    return Response.json({ error: 'practice_unavailable' }, { status: 503, headers });
  }
}
