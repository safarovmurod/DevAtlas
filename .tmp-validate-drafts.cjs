// One-off validation of Mobile drafts against the real course schema.
const fs = require('node:fs');
const { courseContentSchema } = require('./.tmp-schema.cjs');
const drafts = fs.readdirSync('content/mobile-lab/drafts').filter(f => /^day-\d+\.json$/.test(f)).sort();
const lessons = drafts.map(f => JSON.parse(fs.readFileSync('content/mobile-lab/drafts/' + f, 'utf8')));
const last = lessons[lessons.length - 1];
if (last.learningFlow) last.learningFlow = { ...last.learningFlow, nextLessonId: null };
const base = JSON.parse(fs.readFileSync('src/content/courses/mobile.json', 'utf8'));
const result = courseContentSchema.safeParse({ ...base, lessons });
if (result.success) {
  console.log('OK:', lessons.length, 'draft lessons pass the course schema (tail truncated).');
} else {
  for (const issue of result.error.issues) console.log(`- ${issue.path.join('.')}: ${issue.message}`);
  process.exitCode = 1;
}
