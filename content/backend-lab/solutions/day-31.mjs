import assert from 'node:assert/strict';
export function solve(candidate){assert.equal(candidate(2,3),6);assert.equal(candidate(2,0),0);assert.throws(()=>candidate('2',3));}
