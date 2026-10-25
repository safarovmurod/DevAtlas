// Run after npm ci: node scripts/track-coverage-report.mjs
import {loadAuditData} from './lib/load-course-audit.mjs';

const {rows,tracks}=await loadAuditData();
const byId=new Map(rows.map(row=>[row.courseId,row]));
const seen=new Set();
const lines=['| Track | Beginner (free) | Pro (paid) | Expert (paid) |','|---|---|---|---|'];
for(const track of tracks){
  const cell=stage=>{
    const entries=track.courses.filter(entry=>entry.stage===stage);
    if(!entries.length)return '— not published';
    return entries.map(entry=>{
      const stats=byId.get(entry.course);
      if(!stats||seen.has(entry.course))throw new Error(`Missing or repeated track course: ${entry.course}`);
      seen.add(entry.course);
      return `${entry.course}: ${stats.publishedDays}d · ${stats.libraryLessons} library lessons · ${stats.practices} practice · ${stats.totalQuestions} quiz`;
    }).join('<br>');
  };
  lines.push(`| ${track.name} (${track.id}) | ${cell('beginner')} | ${cell('pro')} | ${cell('expert')} |`);
}
if(seen.size!==rows.length)throw new Error('Track coverage omitted a catalog course.');
console.log(lines.join('\n'));
console.log(`\nCourses audited: ${rows.length}/${rows.length}`);
console.log(`Total scheduled days across track stages (including React): ${rows.reduce((sum,row)=>sum+row.publishedDays,0)}`);
console.log(`Total scheduled days across track stages (excluding React): ${rows.filter(row=>row.courseId!=='react').reduce((sum,row)=>sum+row.publishedDays,0)}`);
