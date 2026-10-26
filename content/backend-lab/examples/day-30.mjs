import {loginLimiter} from '../reference/auth.mjs';
let time=0;const allow=loginLimiter({now:()=>time,windowMs:10,limit:2});
const results=[allow('ip'),allow('ip'),allow('ip')];time=10;results.push(allow('ip'));
console.log(JSON.stringify(results));
