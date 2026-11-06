#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const subCommand = args[0];
const nextCommand = subCommand === 'start' ? 'dev' : 'build';

console.log(`[react-scripts shim] Running next ${nextCommand}...`);

try {
  const nextBin = require.resolve('next/dist/bin/next');
  const result = spawnSync(process.execPath, [nextBin, nextCommand], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.signal) console.error(`[react-scripts shim] Next.js terminated by ${result.signal}`);
  process.exit(result.status ?? 1);
} catch (err) {
  console.error('[react-scripts shim] Error running next:', err);
  process.exit(1);
}
