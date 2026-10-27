import assert from 'node:assert/strict';
import {calculateTotal} from '../reference/validation.mjs';
assert.equal(calculateTotal(2,3),6);assert.equal(calculateTotal(2,0),0);assert.throws(()=>calculateTotal('2',3));
console.log(JSON.stringify({checks:3}));
