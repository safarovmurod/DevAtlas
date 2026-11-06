// Созанди луғати тарҷума: src/content/imported/translations-<lang>.json
// Истифода: node scripts/build-translations.cjs ru   (ё en)
// Дархостҳо ба Google Translate; cache дар scripts/translation-cache-<lang>.json нигоҳ дошта мешавад,
// бинобар ин скриптро метавон қатъ ва аз нав оғоз кард — тарҷумаи тайёр такрор намешавад.
const fs = require('fs');
const path = require('path');

const lang = process.argv[2];
if (lang !== 'ru' && lang !== 'en') {
  console.error('Забонро нигоҳед: ru ё en');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const deep = require(path.join(root, 'src/content/imported/deep.json'));
const quiz = require(path.join(root, 'src/content/imported/quiz.json'));
const interview = require(path.join(root, 'src/content/imported/interview.json'));
const supplementalSource = fs.readFileSync(path.join(root, 'src/content/supplemental.ts'), 'utf8');

// Калидҳое, ки тарҷума намехоҳанд: код, идентификатор, схема.
const SKIP_KEYS = new Set(['id', 'sourceId', 'code', 'diagrams', 'path', 'page', 'h1', 'h2', 'context', 'chapter', 'tags']);
const CYRILLIC = /[а-яёӯӣғқҳҷ]/i;

function walk(value, key, acc) {
  if (Array.isArray(value)) { value.forEach(item => walk(item, key, acc)); return; }
  if (value && typeof value === 'object') { for (const [k, v] of Object.entries(value)) walk(v, k, acc); return; }
  if (typeof value !== 'string') return;
  if (SKIP_KEYS.has(key)) return;
  if (!CYRILLIC.test(value)) return; // код, URL, номи файл — не
  if (value.length > 4000) return;
  acc.add(value);
}

function fromSupplemental(acc) {
  const re = /'((?:[^'\\]|\\.)*)'/g;
  let match;
  while ((match = re.exec(supplementalSource))) {
    const text = match[1].replace(/\\n/g, '\n').replace(/\\'/g, "'");
    if (CYRILLIC.test(text) && text.length <= 4000) acc.add(text);
  }
}

const strings = new Set();
walk(deep, '', strings);
walk(quiz, '', strings);
walk(interview, '', strings);
fromSupplemental(strings);

const cachePath = path.join(__dirname, `translation-cache-${lang}.json`);
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
const pending = [...strings].filter(text => !cache[text]);
console.log(`Ҳамагӣ ${strings.size} сатр; тарҷума шудааст ${strings.size - pending.length}; боқимонда ${pending.length}`);

let done = 0;
const CONCURRENCY = Number(process.env.CONCURRENCY || 2);
const PAUSE_MS = Number(process.env.PAUSE_MS || 400);

async function translate(text, attempt = 1) {
  const body = new URLSearchParams();
  body.append('q', text);
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
    });
    if (response.status === 429) throw new Error('HTTP 429');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const out = (data[0] || []).map(part => part[0]).join('');
    if (!out) throw new Error('Ҷавоби холӣ');
    return out;
  } catch (error) {
    if (attempt >= 12) { console.error(`НАШУД (${attempt}): ${text.slice(0, 60)} — ${error.message}`); return null; }
    await new Promise(resolve => setTimeout(resolve, error.message === 'HTTP 429' ? 45000 * attempt : attempt * 2000));
    return translate(text, attempt + 1);
  }
}

async function worker(queue) {
  while (queue.length) {
    const text = queue.shift();
    const out = await translate(text);
    if (out !== null) { cache[text] = out; done++; }
    if (done % 50 === 0) {
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
      console.log(`${done}/${pending.length} тарҷума шуд`);
    }
    await new Promise(resolve => setTimeout(resolve, PAUSE_MS));
  }
}

(async () => {
  const queue = [...pending];
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
  const dict = {};
  for (const text of [...strings].sort()) dict[text] = cache[text] || text;
  const outPath = path.join(root, `src/content/imported/translations-${lang}.json`);
  fs.writeFileSync(outPath, JSON.stringify(dict, null, 1));
  const missing = Object.entries(dict).filter(([, v]) => v === undefined);
  console.log(`Тайёр: ${Object.keys(dict).length} сатр дар ${outPath}`);
  if (missing.length) console.log(`Диққат: ${missing.length} сатр тарҷума нашуд`);
})();
