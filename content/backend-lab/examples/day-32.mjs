import assert from 'node:assert/strict';
import {exchange} from '../reference/http-lab.mjs';
const r=await exchange((req,res)=>{res.setHeader('Content-Type','application/json');res.end('{"status":"ok"}');});
assert.equal(r.status,200);assert.ok(r.headers['content-type'].includes('application/json'));assert.equal(r.body.status,'ok');
console.log(JSON.stringify({health:true}));
