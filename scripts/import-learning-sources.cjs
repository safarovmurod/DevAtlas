const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const parse5 = require('parse5');
const ts = require('typescript');

const sourceDirectory = process.argv[2] || 'C:/Users/safar/Desktop';
const outputDirectory = path.join(__dirname, '../src/content/imported');
fs.mkdirSync(outputDirectory, { recursive: true });
function text(node) { return node?.value || (node?.childNodes || []).map(text).join(''); }
function attr(node, name) { return node.attrs?.find(item => item.name === name)?.value || ''; }
function all(node, predicate) {
  const result = [];
  function visit(current) { if (predicate(current)) result.push(current); for (const child of current.childNodes || []) visit(child); }
  visit(node);
  return result;
}
function hasClass(node, name) { return attr(node, 'class').split(' ').includes(name); }
function byClass(node, name) { return all(node, item => hasClass(item, name)); }
function firstText(node, name) { return text(byClass(node, name)[0]).trim(); }
function load(name) {
  const html = fs.readFileSync(path.join(sourceDirectory, name), 'utf8');
  return { name, html, document: parse5.parse(html), hash: crypto.createHash('sha256').update(html).digest('hex') };
}
function write(name, data) { fs.writeFileSync(path.join(outputDirectory, name + '.json'), JSON.stringify(data, null, 2) + '\n'); }
const sources = ['react-interview.html', 'react_quiz_367_offline.html', 'react_deep_understanding_visual_offline.html', 'Practice-Antigraviti.html', 'react-roadmap-tracker (1) (1).html'].map(load);

const interview = byClass(sources[0].document, 'topic').map(topic => ({
  id: attr(topic, 'id'), title: firstText(topic, 'topic-title'),
  questions: byClass(topic, 'question').map(question => ({
    id: 'interview-' + attr(question, 'id'), sourceId: attr(question, 'id'),
    question: firstText(question, 'question-name'), answer: firstText(question, 'rule'),
    code: all(question, node => node.tagName === 'pre').map(text),
    codeLabel: firstText(question, 'snippet-label'), explanation: firstText(question, 'walkthrough'),
    diagrams: byClass(question, 'diagram').map(text),
  })),
}));
write('interview', interview);

const quizScript = text(all(sources[1].document, node => node.tagName === 'script')[0]);
const quizAst = ts.createSourceFile('source.js', quizScript, ts.ScriptTarget.Latest, true);
let quiz;
for (const statement of quizAst.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (declaration.name.getText(quizAst) === 'DATA') quiz = JSON.parse(declaration.initializer.getText(quizAst));
  }
}
if (!quiz || quiz.groups.flatMap(group => group.items).length !== 367) throw new Error('Quiz source count mismatch');
write('quiz', quiz);

const deep = all(sources[2].document, node => node.tagName === 'section').filter(section => byClass(section, 'qa').length).map(section => ({
  id: attr(section, 'id'), title: text(all(section, node => node.tagName === 'h2')[0]).trim(),
  chapter: firstText(section, 'chapter'),
  flow: byClass(section, 'flow-step').map(step => text(step).trim().replace(/^\d+/, '')),
  explanation: byClass(section, 'deep-box').map(box => ({title: text(all(box, node => node.tagName === 'b')[0]), text: text(all(box, node => node.tagName === 'p')[0])})),
  code: byClass(section, 'codebox').map(box => text(all(box, node => node.tagName === 'pre')[0])),
  questions: byClass(section, 'qa').map(question => ({
    question: firstText(question, 'qtext'), answer: text(all(byClass(question, 'answer-main')[0] || {}, node => node.tagName === 'p')[0]),
    deeper: firstText(question, 'answer-deeper'),
  })),
}));
write('deep', deep);

const practice = JSON.parse(text(all(sources[3].document, node => node.tagName === 'script' && attr(node, 'id') === 'DATA')[0]));
write('practice', practice);

const roadmap = byClass(sources[4].document, 'month-section').map((month, monthIndex) => ({
  month: monthIndex + 1, title: firstText(month, 'month-title'),
  weeks: byClass(month, 'week-card').map((week, weekIndex) => ({
    week: weekIndex + 1, title: firstText(week, 'week-label'),
    days: byClass(week, 'day').map((day, dayIndex) => ({
      id: `m${monthIndex + 1}-w${weekIndex + 1}-d${dayIndex + 1}`,
      title: firstText(day, 'day-title'), tags: byClass(day, 'tag').map(text),
    })),
  })),
  ai: byClass(month, 'ai-day').map((day, index) => ({ id: `m${monthIndex + 1}-ai-${index + 1}`, title: firstText(day, 'ai-day-title'), tasks: byClass(day, 'ai-topic').map(text) })),
  projects: byClass(month, 'project-block').map((project, index) => ({ id: `m${monthIndex + 1}-project-${index + 1}`, title: firstText(project, 'project-name').replace(/^[^A-Za-z]+/, ''), description: firstText(project, 'project-sub'), tasks: byClass(project, 'feature').map(text) })),
  wrapup: byClass(month, 'wrapup').flatMap(block => byClass(block, 'day').map((day, index) => ({id: `m${monthIndex + 1}-wrapup-${index + 1}`, title: firstText(day, 'day-title')}))),
  // Keep supplemental project and skill material, including sections outside week cards.
  fullText: text(month).replace(/\s+/g, ' ').trim(),
}));
write('roadmap', roadmap);
const manifest = sources.map(source => ({name: source.name, sha256: source.hash, bytes: Buffer.byteLength(source.html)}));
write('manifest', manifest);
console.log(JSON.stringify({interview: interview.reduce((count, topic) => count + topic.questions.length, 0), quiz: quiz.groups.flatMap(group => group.items).length, deep: deep.length, deepQuestions: deep.reduce((count, topic) => count + topic.questions.length, 0), practice: Object.keys(practice.lessons).length, roadmap: roadmap.map(month => ({month: month.month, weeks: month.weeks.length, days: month.weeks.reduce((count, week) => count + week.days.length, 0)}))}));
