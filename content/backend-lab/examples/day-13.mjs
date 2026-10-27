import {exchange} from '../reference/http-lab.mjs';
const result=await exchange((req,res)=>{
 res.setHeader('Content-Type','application/json');
 if(req.url==='/tasks'&&req.method==='GET'){res.end('[]');return;}
 res.statusCode=req.url==='/tasks'?405:404;
 res.end(JSON.stringify({error:'unsupported'}));
},{path:'/tasks'});
console.log(JSON.stringify({status:result.status,body:result.body}));
