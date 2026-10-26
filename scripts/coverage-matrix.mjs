import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadAuditData} from './lib/load-course-audit.mjs';
import {reportMatches} from './lib/report-text.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const {rows,tracks,matrix}=await loadAuditData();
const statuses=['Missing','Planned','In Progress','Published','Verified'];
const counts=Object.fromEntries(statuses.map(status=>[status,matrix.filter(row=>row.status===status).length]));
const summary={tracks:tracks.length,stages:matrix.length,courses:rows.length,publishedDays:rows.reduce((sum,row)=>sum+row.publishedDays,0),statuses:counts};
const text=[
 '# Track × Stage coverage (generated)',
 '',
 'Regenerate: `node scripts/coverage-matrix.mjs`. Validate without writing: `node scripts/coverage-matrix.mjs --check`.',
 '',
 `${summary.tracks} tracks × 3 stages = ${summary.stages} stage requirements. ${summary.courses} course IDs; ${summary.publishedDays} actual scheduled days.`,
 '',
 statuses.map(status=>`${status}: ${counts[status]}`).join(' · '),
 '',
 'Published describes existing curriculum availability, not completion of the strict delivery requirements. Pending verification lists evidence still required; it is not an instruction to regenerate already-completed lessons. Planned and In Progress require actual authoring records. Verified requires content, assessment, localization, project and integration evidence; this source-only report never grants it automatically.',
 '',
 '| Track | Stage | Status | Published course IDs | Days | Proposed missing ID | Pending evidence |',
 '|---|---|---|---|---:|---|---|',
 ...matrix.map(row=>`| ${row.trackName} (${row.trackId}) | ${row.stage} | ${row.status} | ${row.courseIds.join(', ')||'—'} | ${row.publishedDays} | ${row.proposedCourseId||'—'} | ${row.pendingVerification.join(', ')} |`),
 '',
 'JavaScript 1 and 2 are existing modules of one Beginner stage. Proposed IDs are planning identifiers, not empty published courses. Missing prerequisites and paid material access are separate concerns; this report does not grant or revoke subscriptions.',
 '',
];
const outputs=[['docs/coverage-matrix-20261024.md',text.join('\n')],['docs/coverage-matrix.json',JSON.stringify({schemaVersion:1,summary,stages:matrix},null,2)+'\n']];
for(const [relative,contents] of outputs){
 const filename=path.join(root,relative);
 if(process.argv.includes('--check')){
  const existing=await readFile(filename,'utf8').catch(()=>null);
  if(!reportMatches(existing,contents))throw new Error(`Stale coverage artifact: ${relative}. Run node scripts/coverage-matrix.mjs.`);
 }else await writeFile(filename,contents);
}
console.log(JSON.stringify(summary));
