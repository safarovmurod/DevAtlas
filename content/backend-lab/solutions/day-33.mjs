import assert from 'node:assert/strict';
export function solve(candidate){assert.deepEqual(candidate({title:' a '}),{title:'a'});assert.throws(()=>candidate({title:''}));assert.throws(()=>candidate({title:'x'.repeat(121)}));assert.throws(()=>candidate({title:'a',owner_id:2}));}
