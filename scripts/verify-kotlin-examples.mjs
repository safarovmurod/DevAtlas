// Execute reviewed repository examples only; never pass learner submissions here.
// KOTLINC may select an installed compiler. No downloads or credentials are used.
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const course=JSON.parse(readFileSync(path.join(root,'src/content/courses/kotlin.json'),'utf8'));
const compiler=process.env.KOTLINC || 'kotlinc';
const java=process.env.JAVA || 'java';
const temporary=mkdtempSync(path.join(tmpdir(),'devatlas-kotlin-'));
const run=(command,args,timeout=20000)=>spawnSync(command,args,{cwd:temporary,encoding:'utf8',timeout,maxBuffer:1024*1024});
const success=(result,label)=>{
  assert.ifError(result.error);
  assert.equal(result.status,0,`${label}\n${result.stderr}\n${result.stdout}`);
  return result.stdout.replace(/\r\n/g,'\n').trim();
};
try {
  const version=run(compiler,['-version']);
  success(version,'Kotlin compiler availability');
  const files=[];
  for(const lesson of course.lessons){
    const day=String(lesson.day).padStart(2,'0');
    const filename=`Lesson${day}.kt`;
    assert.equal(lesson.practice.solution,lesson.sections[0].code,lesson.id);
    writeFileSync(path.join(temporary,filename),`package day${day}\n${lesson.practice.solution}`);
    files.push(filename);
  }
  const day2=course.lessons[1].practice.solution.replace('fun main()', 'fun originalMain()');
  writeFileSync(path.join(temporary,'Boundaries.kt'),`package boundaries\n${day2}
fun main() {
    check(total(0, 3) == 0)
    check(total(7, 2) == 14)
    var negativeRejected = false
    try { total(-1, 3) } catch (error: IllegalArgumentException) { negativeRejected = true }
    check(negativeRejected)
    var overflowRejected = false
    try { total(Int.MAX_VALUE, 2) } catch (error: ArithmeticException) { overflowRejected = true }
    check(overflowRejected)
    println("Boundaries passed")
}
`);
  const finalLesson=course.lessons.at(-1);
  assert.match(finalLesson.practice.solution,/tasks\.filter \{ it\.id != id \}/);
  writeFileSync(path.join(temporary,'Mutation.kt'),'package mutation\n'+finalLesson.practice.solution.replace('it.id != id','it.id == id'));
  // One compilation, separate packages: every example remains an independent main.
  success(run(compiler,[...files,'Boundaries.kt','Mutation.kt','-include-runtime','-d','lessons.jar'],120000),'Compile all examples');
  for(const lesson of course.lessons){
    const day=String(lesson.day).padStart(2,'0');
    const actual=success(run(java,['-cp','lessons.jar',`day${day}.Lesson${day}Kt`]),lesson.id);
    for(const locale of ['ru','tg','en']) assert.equal(actual,lesson.sections[0].output[locale],`${lesson.id}: ${locale} output`);
    console.log(`${lesson.id}: compiled and exact output matched`);
  }
  assert.equal(success(run(java,['-cp','lessons.jar','boundaries.BoundariesKt']),'Day 2 boundaries'),'Boundaries passed');
  const mutation=run(java,['-cp','lessons.jar','mutation.MutationKt']);
  assert.ifError(mutation.error);
  assert.notEqual(mutation.status,0,'Broken deletion must be rejected');
  assert.match(mutation.stderr,/IllegalStateException: Check failed/);
  console.log('30/30 examples passed; negative input and overflow rejected; broken deletion detected.');
} finally {
  rmSync(temporary,{recursive:true,force:true});
}
