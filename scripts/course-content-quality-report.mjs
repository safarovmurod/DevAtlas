// Run after npm ci: node scripts/course-content-quality-report.mjs
// Measurements flag review work; they are not an editorial quality certificate.
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadAuditData} from './lib/load-course-audit.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const {rows}=await loadAuditData();
const line=[
  '# Self-learning content audit (generated)',
  '',
  `Generated ${new Date().toISOString().slice(0,10)} by \`scripts/course-content-quality-report.mjs\` from actual curriculum data. Numbers only: meaning, correctness and clarity need the separate editorial checklist — do not treat higher word counts as automatic quality.`,
  '',
  `Coverage: ${rows.length} catalog courses, including the TypeScript-backed React and Next.js curricula. A missing loader, invalid course or catalog/day mismatch fails the report instead of silently omitting the course.`,
  '',
  '| Course | Tier | Days | Avg/min/max theory words | Quiz/day | Code days | Written days | Project days | Library | Flags |',
  '|---|---|---:|---|---:|---:|---:|---:|---:|---|',
];
for(const row of rows){
  line.push(`| ${row.courseId} | ${row.tier} | ${row.publishedDays} | ${row.avgTheoryWords}/${row.minTheoryWords}/${row.maxTheoryWords} | ${row.questionsPerDay} | ${row.codeDays} | ${row.writtenDays} | ${row.projectDays} | ${row.libraryLessons} | ${row.flags.join(', ')||'—'} |`);
}
const staleTotal=rows.reduce((sum,row)=>sum+row.staleHits.length,0);
line.push('',`## Stale scope copy (§3.7): ${staleTotal} hits`,'');
for(const row of rows.filter(row=>row.staleHits.length)){
  line.push(`- ${row.courseId}: ${row.staleHits.map(hit=>`${hit.id} [${hit.loc}] “…${hit.sample}…”`).join('; ')}`);
}
line.push('','## Reading guide','',
  '- `thin-theory`: average published-day explanation under 60 Russian words — a signal to deepen the day, not an automatic verdict.',
  '- `few-questions`: under 2 quiz questions per published day. Library questions are excluded from this average.',
  '- `stale-copy`: text still describing an old 2/3-day scope.',
  '- `code days` have code examples; this metric alone does not establish that the examples were executed. `written days` are explicitly marked self-reviewed written assignments.',
  '- React uses the actual two-month plan, topic explanations, exercises and multiple-choice question IDs. Reused questions count as assignments on each scheduled day; the quiz total counts distinct question IDs per course.',
  '- Next.js uses its application loader, including the original month-three curriculum. React and Next.js are not treated as missing JSON files.',
  `- Totals: ${rows.reduce((sum,row)=>sum+row.publishedDays,0)} scheduled days including React, ${rows.filter(row=>row.courseId!=='react').reduce((sum,row)=>sum+row.publishedDays,0)} excluding React; ${rows.reduce((sum,row)=>sum+row.totalQuestions,0)} distinct quiz questions across courses; ${rows.reduce((sum,row)=>sum+row.projectDays,0)} flagged project/case days.`);

await writeFile(path.join(root,'docs/SELF_LEARNING_CONTENT_AUDIT.md'),line.join('\n')+'\n');
const flagged=rows.filter(row=>row.flags.length);
console.log(`Audited ${rows.length} courses; ${flagged.length} flagged:`,flagged.map(row=>`${row.courseId}(${row.flags.join('/')})`).join(', '));
