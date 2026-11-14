// Shared navigation needs metadata, not the full lesson/question library.
const fs = require('node:fs');
const path = require('node:path');
const { buildSync } = require('esbuild');

const root = path.resolve(__dirname, '..');
const { outputFiles } = buildSync({
  absWorkingDir: root,
  entryPoints: ['src/content/course.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
});
const loaded = { exports: {} };
new Function('module', 'exports', 'require', outputFiles[0].text)(loaded, loaded.exports, require);

const { LEARNING_TOPICS, QUIZ_QUESTIONS } = loaded.exports;
const index = {
  topics: LEARNING_TOPICS.map(({ id, month }) => ({ id, month })),
  questions: QUIZ_QUESTIONS.map(({ id, month, options }) => ({
    id,
    month,
    options: options.length ? [true] : [],
  })),
};
fs.writeFileSync(path.join(root, 'src/content/learning-index.json'), JSON.stringify(index) + '\n');
