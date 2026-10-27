import assert from 'node:assert/strict';
export async function solve(client){const r=await client();assert.equal(r.status,200);assert.ok(r.headers['content-type'].includes('application/json'));assert.equal(r.body.status,'ok');}
