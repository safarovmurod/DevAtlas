import {exchange} from '../reference/http-lab.mjs';
const r=await exchange((req,res)=>{res.statusCode=404;res.setHeader('Content-Type','application/json');res.end('{"error":{"code":404,"message":"Not found"}}');});
console.log(JSON.stringify({status:r.status,error:r.body.error}));
