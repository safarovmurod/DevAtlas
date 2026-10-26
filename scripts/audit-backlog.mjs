import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadAuditData} from './lib/load-course-audit.mjs';
import {reportMatches} from './lib/report-text.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const audit=JSON.parse(await readFile(path.join(root,'docs/audits/2026-10-26-tasks.json'),'utf8'));
const statuses=['DONE','PARTIAL','BLOCKED','TODO'];
const {rows,matrix}=await loadAuditData();
const ids=new Set();
for(const task of audit.tasks){
 if(ids.has(task.id)||!['P0','P1','P2'].includes(task.priority)||!statuses.includes(task.status))throw new Error('Invalid/duplicate task: '+task.id);
 ids.add(task.id);
 if(!task.acceptance||!Array.isArray(task.evidence))throw new Error('Missing acceptance/evidence: '+task.id);
 if(task.status==='BLOCKED'&&!task.blocker)throw new Error('Missing blocker: '+task.id);
 if(task.status==='DONE'&&(!task.validation?.length||!task.changedFiles?.length))throw new Error('DONE requires files and executed validation: '+task.id);
 for(const file of task.changedFiles??[])await readFile(path.join(root,file));
}
for(const id of ['audit-all-files','agent-account-history','ai-durable-costs','terminal-learning-flow','legacy-readiness-status','weak-topics-and-revision','explanatory-routing','beginner-theory','learning-flow-rollout','practice-runtimes','assessment-rollout','subject-visualizers','mentor-conversations','personal-roadmap','daily-challenges','weekly-review','portfolio','bookmarks','guided-debugging','community-groups','completion-records','progress-sync','ui-all-screens','font-coverage','sources','live-auth','payments','live-online-ai','production-browser','external-runners','independent-final-audit','current-reporting'])if(!ids.has(id))throw new Error('Lost original requirement: '+id);
const state=JSON.parse(await readFile(path.join(root,'docs/delivery-state.json'),'utf8'));
for(const phase of [4,5])for(const course of state.phases.find(item=>item.id===phase).courses){
 if(!ids.has((phase===4?'expand-':'deepen-')+course))throw new Error('Lost course requirement: '+course);
}
for(const stage of matrix)if(!ids.has(`stage-${stage.trackId}-${stage.stage}`))throw new Error('Lost track/stage requirement');
const count=Object.fromEntries(statuses.map(status=>[status,audit.tasks.filter(task=>task.status===status).length]));
const cell=value=>String(value).replaceAll('|','\\|').replaceAll('\n',' ');
const text=[
 '# DevAtlas: audit and remaining delivery register', '',
 `Baseline: \`${audit.baselineCommit}\`. Every one of its ${audit.inventory.files} tracked files is indexed in [baseline-files.json](2026-10-26-baseline-files.json). Text indexing, binary hashes, schema checks and numeric scans do **not** establish complete semantic, security or editorial review. That work stays PARTIAL. Newly changed files are inspected through the PR diff and named task evidence.`, '',
 'This is the current actionable register. Older audits and launch-checklist.md retain historical evidence, not current completion claims. No original requirement is dropped. Draft syllabi are not lessons. Existing publication is not independently verified mastery.', '',
 `Actual source: ${rows.length} course IDs, ${rows.reduce((n,row)=>n+row.publishedDays,0)} scheduled days, ${matrix.filter(stage=>stage.status==='Missing').length} missing stages. ${audit.tasks.length} tracked tasks: ${statuses.map(status=>`${status} ${count[status]}`).join(', ')}.`, '',
 'P0: privacy, authorization and cost exposure. P1: broken functionality, teaching quality and complete learning programs. P2: remaining interface/typography polish. Dependencies may be developed before content, but a pilot never completes a rollout task.', '',
 '| Task | Before / observed evidence | Fixed / files | Validation | Status |',
 '|---|---|---|---|---|',
 ...audit.tasks.map(task=>`| ${cell(task.priority+' · '+task.id+' — '+task.title)} | ${cell(task.evidence.join('; '))} | ${cell((task.changedFiles??[]).join(', ')||'Not complete. '+task.acceptance)} | ${cell((task.validation??[]).join('; ')||task.blocker||'Required; not yet evidenced')} | ${task.status} |`),'',
 'The machine-readable register contains acceptance criteria and explicit blockers. Regenerate with `node scripts/audit-backlog.mjs`; CI checks freshness and retention of all twelve short-course tasks, all five continuation tasks and every actual track/stage. DONE additionally requires changed files and executed validation. This is structural enforcement, not automatic educational certification.', '',
].join('\n');
const output=path.join(root,'docs/audits/2026-10-26-tasks.md');
if(process.argv.includes('--check')){if(!reportMatches(await readFile(output,'utf8').catch(()=>null),text))throw new Error('Stale audit register. Run node scripts/audit-backlog.mjs');}
else await writeFile(output,text);
console.log(JSON.stringify({tasks:audit.tasks.length,statuses:count}));
