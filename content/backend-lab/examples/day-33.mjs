import assert from 'node:assert/strict';
import {taskInput} from '../reference/validation.mjs';
const input={title:' a '},before=structuredClone(input);assert.deepEqual(taskInput(input),{title:'a'});assert.deepEqual(input,before);
assert.equal(taskInput({title:'x'.repeat(120)}).title.length,120);assert.throws(()=>taskInput({title:'x'.repeat(121)}));
console.log(JSON.stringify({boundary:120}));
